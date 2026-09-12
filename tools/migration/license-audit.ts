import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import Ajv from "ajv";
import { runObservationCommand } from "./source-observation";

interface Notice {
  path: string;
  contentDigest: string;
}
export interface LicenseFile {
  source: string;
  commit: string;
  path: string;
  contentDigest: string;
  target: string;
  targetPath: string;
  kind: "code" | "documentation" | "asset";
  sourceLicense: string;
  targetLicense: string;
  authorship: "known" | "unknown";
  reuseEvidence: string[];
  repositoryLicenseEvidence: string;
  historyEvidence: string;
  signoffEvidence: string[];
  rightsEvidence: string[];
  requiredNotices: Notice[];
  retainedNotices: Notice[];
  obsoleteLicense: boolean;
  historyDeletionRevokesLicense: boolean;
}
export interface LicenseInput {
  schemaVersion: "license-input.v1";
  files: LicenseFile[];
}
export interface LicensePolicy {
  schemaVersion: "license-policy.v1";
  inventoryDigest: string;
  reviews: {
    evidenceDigest: string;
    reviewEvidence: string;
    compatibility: "approved" | "rejected";
    rights: "approved" | "rejected";
  }[];
}
export interface LicenseVerdict {
  path: string;
  sourceLicense: string;
  targetLicense: string;
  rightsEvidence: string[];
  requiredNotices: string[];
  verdict: "accept" | "reject";
  reason?: string;
}
export interface LicenseResult {
  accepted: boolean;
  verdicts: LicenseVerdict[];
  reason?: string;
}
const text = { type: "string", maxLength: 512 };
const hash = { type: "string", pattern: "^[a-f0-9]{64}$" };
const hashes = { type: "array", maxItems: 10000, uniqueItems: true, items: hash };
const pathSchema = { type: "string", pattern: "^[A-Za-z0-9_.@+/-]+$", maxLength: 512 };
const notices = {
  type: "array",
  maxItems: 10000,
  items: {
    type: "object",
    additionalProperties: false,
    required: ["path", "contentDigest"],
    properties: { path: pathSchema, contentDigest: hash },
  },
};
const fileProperties = {
  source: { type: "string", pattern: "^(?:\\.github|[a-z0-9-]+)$" },
  commit: { type: "string", pattern: "^[a-f0-9]{40}$" },
  path: pathSchema,
  contentDigest: hash,
  target: { type: "string", pattern: "^(?:\\.github|[a-z0-9-]+)$" },
  targetPath: pathSchema,
  kind: { enum: ["code", "documentation", "asset"] },
  sourceLicense: text,
  targetLicense: text,
  authorship: { enum: ["known", "unknown"] },
  reuseEvidence: hashes,
  repositoryLicenseEvidence: text,
  historyEvidence: text,
  signoffEvidence: hashes,
  rightsEvidence: hashes,
  requiredNotices: notices,
  retainedNotices: notices,
  obsoleteLicense: { type: "boolean" },
  historyDeletionRevokesLicense: { type: "boolean" },
};
const ajv = new Ajv({ strict: true });
const validateInput = ajv.compile<LicenseInput>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "files"],
  properties: {
    schemaVersion: { const: "license-input.v1" },
    files: {
      type: "array",
      minItems: 1,
      maxItems: 100000,
      items: {
        type: "object",
        additionalProperties: false,
        required: Object.keys(fileProperties),
        properties: fileProperties,
      },
    },
  },
});
const validatePolicy = ajv.compile<LicensePolicy>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "inventoryDigest", "reviews"],
  properties: {
    schemaVersion: { const: "license-policy.v1" },
    inventoryDigest: hash,
    reviews: {
      type: "array",
      maxItems: 100000,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["evidenceDigest", "reviewEvidence", "compatibility", "rights"],
        properties: {
          evidenceDigest: hash,
          reviewEvidence: hash,
          compatibility: { enum: ["approved", "rejected"] },
          rights: { enum: ["approved", "rejected"] },
        },
      },
    },
  },
});
function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
    .join(",")}}`;
}
export function digestEvidence(value: unknown): string {
  return createHash("sha256").update(canonical(value)).digest("hex");
}
function safePath(path: string): boolean {
  return (
    !path.startsWith("/") &&
    path.split("/").every((part) => part !== "" && part !== "." && part !== "..")
  );
}
export function auditLicenses(input: unknown, trustedPolicy: unknown): LicenseResult {
  if (!validateInput(input) || !validatePolicy(trustedPolicy))
    return { accepted: false, verdicts: [], reason: "invalid-evidence" };
  const inventory = input.files.map(
    ({ source, commit, path, contentDigest, target, targetPath, kind }) => ({
      source,
      commit,
      path,
      contentDigest,
      target,
      targetPath,
      kind,
    }),
  );
  if (digestEvidence(inventory) !== trustedPolicy.inventoryDigest)
    return { accepted: false, verdicts: [], reason: "inventory-mismatch" };
  const reviewMap = new Map(trustedPolicy.reviews.map((review) => [review.evidenceDigest, review]));
  const targets = new Set<string>();
  const sources = new Set<string>();
  if (reviewMap.size !== trustedPolicy.reviews.length)
    return { accepted: false, verdicts: [], reason: "duplicate-review" };
  const verdicts = input.files.map((file): LicenseVerdict => {
    const review = reviewMap.get(digestEvidence(file));
    const targetKey = `${file.target}:${file.targetPath}`;
    const sourceKey = `${file.source}:${file.commit}:${file.path}`;
    const duplicate = targets.has(targetKey) || sources.has(sourceKey);
    targets.add(targetKey);
    sources.add(sourceKey);
    const valid =
      !duplicate &&
      [
        file.path,
        file.targetPath,
        ...file.requiredNotices.map((n) => n.path),
        ...file.retainedNotices.map((n) => n.path),
      ].every(safePath) &&
      file.authorship === "known" &&
      file.sourceLicense.length > 0 &&
      file.targetLicense.length > 0 &&
      file.reuseEvidence.length > 0 &&
      /^[a-f0-9]{64}$/.test(file.repositoryLicenseEvidence) &&
      /^[a-f0-9]{64}$/.test(file.historyEvidence) &&
      file.rightsEvidence.length > 0 &&
      !file.obsoleteLicense &&
      !file.historyDeletionRevokesLicense &&
      review?.compatibility === "approved" &&
      review.rights === "approved" &&
      (file.kind !== "code" || file.targetLicense === "Apache-2.0") &&
      (file.kind !== "documentation" || file.targetLicense === "CC-BY-4.0") &&
      file.requiredNotices.every((required) =>
        file.retainedNotices.some(
          (retained) =>
            retained.path === required.path && retained.contentDigest === required.contentDigest,
        ),
      );
    return {
      path: file.path,
      sourceLicense: file.sourceLicense,
      targetLicense: file.targetLicense,
      rightsEvidence: file.rightsEvidence,
      requiredNotices: file.requiredNotices.map((n) => n.path),
      verdict: valid ? "accept" : "reject",
      ...(!valid ? { reason: "license-evidence-rejected" } : {}),
    };
  });
  return { accepted: verdicts.every((verdict) => verdict.verdict === "accept"), verdicts };
}
async function readBounded(path: string): Promise<Buffer> {
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK | constants.O_NOFOLLOW);
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > 16 * 1024 * 1024) throw new Error("invalid-evidence");
    const bytes = Buffer.alloc(stat.size + 1);
    const { bytesRead } = await file.read(bytes, 0, bytes.length, 0);
    if (bytesRead !== stat.size) throw new Error("invalid-evidence");
    return bytes.subarray(0, bytesRead);
  } finally {
    await file.close();
  }
}
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    if (
      args.length !== 6 ||
      args[0] !== "--input" ||
      args[2] !== "--policy" ||
      args[4] !== "--policy-sha256" ||
      !/^[a-f0-9]{64}$/.test(args[5] ?? "")
    )
      throw new Error("invalid-evidence");
    const policyBytes = await readBounded(args[3] ?? "");
    if (createHash("sha256").update(policyBytes).digest("hex") !== args[5])
      throw new Error("policy-mismatch");
    const result = auditLicenses(
      JSON.parse((await readBounded(args[1] ?? "")).toString("utf8")),
      JSON.parse(policyBytes.toString("utf8")),
    );
    console.log(
      JSON.stringify({
        accepted: result.accepted,
        acceptedCount: result.verdicts.filter((v) => v.verdict === "accept").length,
        rejectedCount: result.verdicts.filter((v) => v.verdict === "reject").length,
      }),
    );
    process.exitCode = result.accepted ? 0 : 1;
  } catch {
    console.log(JSON.stringify({ accepted: false, reason: "license-audit-rejected" }));
    process.exitCode = 1;
  }
}
if (import.meta.main) await main();

export interface ProvenanceRequest {
  repository: string;
  commit: string;
  path: string;
  licensePaths: string[];
  reusePaths: string[];
  noticePaths: string[];
}
interface ProvenanceBlob {
  path: string;
  oid: string;
}
export interface LicenseProvenance {
  commit: string;
  path: string;
  contentOid: string;
  licenseBlobs: ProvenanceBlob[];
  reuseBlobs: ProvenanceBlob[];
  noticeBlobs: ProvenanceBlob[];
  contributions: { commit: string; hasSignoff: boolean }[];
}
/** Collects object identities, never a legal grant or an attribution interpretation. */
export async function collectLicenseProvenance(
  request: ProvenanceRequest,
): Promise<LicenseProvenance> {
  try {
    const paths = [
      request.path,
      ...request.licensePaths,
      ...request.reusePaths,
      ...request.noticePaths,
    ];
    if (
      !/^[a-f0-9]{40}$/.test(request.commit) ||
      request.licensePaths.length === 0 ||
      request.reusePaths.length === 0 ||
      paths.length > 1000 ||
      paths.some((path) => !safePath(path) || !/^[A-Za-z0-9_.@+/-]+$/.test(path))
    )
      throw new Error("invalid");
    async function git(...args: string[]): Promise<string> {
      return await runObservationCommand([
        "env",
        "GIT_NO_LAZY_FETCH=1",
        "git",
        "--no-replace-objects",
        "--literal-pathspecs",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "core.untrackedCache=false",
        "-C",
        request.repository,
        ...args,
      ]);
    }
    if ((await git("rev-parse", "--is-shallow-repository")) !== "false") throw new Error("shallow");
    const graftPath = await git("rev-parse", "--path-format=absolute", "--git-path", "info/grafts");
    try {
      await lstat(graftPath);
      throw new Error("grafts");
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
    if ((await git("rev-parse", "--verify", `${request.commit}^{commit}`)) !== request.commit)
      throw new Error("commit");
    async function blob(path: string): Promise<ProvenanceBlob> {
      const entry = await git("ls-tree", "-z", request.commit, "--", path);
      const match = /^100(?:644|755) blob ([a-f0-9]{40})\t([^\0]+)\0$/.exec(entry);
      if (!match || match[2] !== path || !match[1]) throw new Error("blob");
      return { path, oid: match[1] };
    }
    async function blobs(items: string[]): Promise<ProvenanceBlob[]> {
      const result: ProvenanceBlob[] = [];
      for (const path of items) result.push(await blob(path));
      return result;
    }
    const history = await git(
      "log",
      "--full-history",
      "--follow",
      "--format=%H",
      request.commit,
      "--",
      request.path,
    );
    const commits = history.split("\n");
    if (commits.length > 10000 || commits.some((commit) => !/^[a-f0-9]{40}$/.test(commit)))
      throw new Error("history");
    const contributions: { commit: string; hasSignoff: boolean }[] = [];
    for (const commit of commits) {
      // Git parses trailers; identities are transient and never returned or logged.
      const trailers = await git(
        "show",
        "-s",
        "--format=%(trailers:key=Signed-off-by,valueonly)",
        commit,
      );
      contributions.push({ commit, hasSignoff: trailers.length > 0 });
    }
    return {
      commit: request.commit,
      path: request.path,
      contentOid: (await blob(request.path)).oid,
      licenseBlobs: await blobs(request.licensePaths),
      reuseBlobs: await blobs(request.reusePaths),
      noticeBlobs: await blobs(request.noticePaths),
      contributions,
    };
  } catch {
    throw new Error("license-provenance-rejected");
  }
}
