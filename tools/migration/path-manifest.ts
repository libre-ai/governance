import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, realpath, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import Ajv from "ajv";
import { resolveSourcePath } from "./entry-points";
import type { ImmutableFile, PathEdge } from "./reachability";
import { analyzeReachability, fileId } from "./reachability";
import { readPortfolio } from "./source-freeze";

export type PathDisposition =
  | {
      kind: "retain";
      target: string;
      targetPath: string;
      entryPoint: string;
      supportFor?: string[];
      supportEvidenceDigest?: string;
    }
  | { kind: "generate"; target: string; targetPath: string; canonicalSource: string }
  | {
      kind: "delete";
      reason: "dead" | "obsolete" | "duplicate" | "generated-orphan" | "private-data";
    };
export interface PathDecision {
  file: string;
  disposition: PathDisposition;
}
export interface PathRecord {
  source: string;
  sourceCommit: string;
  sourcePath: string;
  sourceDigest: string;
  disposition: PathDisposition;
}
export interface PathManifest {
  schemaVersion: "path-manifest.v1";
  qualification: "candidate";
  records: PathRecord[];
  unclassifiedPaths: 0;
  inputDigest: string;
  digest: string;
}
const hash = { type: "string", pattern: "^[a-f0-9]{64}$" };
const text = { type: "string", minLength: 1 };
const decisionsValidator = new Ajv({ strict: true }).compile<PathDecision[]>({
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["file", "disposition"],
    properties: {
      file: hash,
      disposition: {
        oneOf: [
          {
            type: "object",
            additionalProperties: false,
            required: ["kind", "target", "targetPath", "entryPoint"],
            properties: {
              kind: { const: "retain" },
              target: text,
              targetPath: text,
              entryPoint: hash,
              supportFor: { type: "array", minItems: 1, uniqueItems: true, items: hash },
              supportEvidenceDigest: hash,
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["kind", "target", "targetPath", "canonicalSource"],
            properties: {
              kind: { const: "generate" },
              target: text,
              targetPath: text,
              canonicalSource: hash,
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["kind", "reason"],
            properties: {
              kind: { const: "delete" },
              reason: {
                enum: ["dead", "obsolete", "duplicate", "generated-orphan", "private-data"],
              },
            },
          },
        ],
      },
    },
  },
});
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonicalValue(item)]),
    );
  return value;
}
function digest(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalValue(value)))
    .digest("hex");
}
function forbidden(path: string): boolean {
  return /(?:^|\/)(?:node_modules|dist|build|coverage|target|\.git)(?:\/|$)|(?:agent.*lineage|lineage.*agent).*\.schema\.json$/i.test(
    path,
  );
}
export function buildPathManifest(
  files: ImmutableFile[],
  entryPoints: string[],
  edges: PathEdge[],
  decisions: PathDecision[],
): PathManifest {
  const graph = analyzeReachability(files, entryPoints, edges);
  const allReachable = new Set(graph.reachable);
  const reachedByRoot = new Map(
    Object.entries(graph.byEntryPoint).map(([root, ids]) => [root, new Set(ids)]),
  );
  if (!decisionsValidator(decisions)) throw new Error("path-decisions-invalid");
  const byId = new Map(files.map((file) => [fileId(file), file]));
  const dispositionById = new Map(
    decisions.map((decision) => [decision.file, decision.disposition]),
  );
  if (
    dispositionById.size !== decisions.length ||
    dispositionById.size !== files.length ||
    decisions.some((decision) => !byId.has(decision.file))
  )
    throw new Error("path-coverage-incomplete");
  const inventory = readPortfolio();
  const targets = new Set([...inventory.certainTargets, ...inventory.conditionalTargets]);
  const targetPaths = new Set<string>();
  for (const file of files) {
    const id = fileId(file);
    const disposition = dispositionById.get(id);
    if (!disposition) throw new Error("path-coverage-incomplete");
    if (disposition.kind === "delete") {
      if (allReachable.has(id)) throw new Error("reachable-path-deleted");
      if (file.sensitivity === "present" && disposition.reason !== "private-data")
        throw new Error("private-data-disposition-required");
      continue;
    }
    if (
      !targets.has(disposition.target) ||
      resolveSourcePath("", disposition.targetPath) !== disposition.targetPath ||
      forbidden(file.sourcePath) ||
      forbidden(disposition.targetPath) ||
      file.sensitivity !== "clear" ||
      file.license !== "current"
    )
      throw new Error("path-retention-refused");
    const targetKey = `${disposition.target}:${disposition.targetPath.normalize("NFC").toLowerCase()}`;
    if (targetPaths.has(targetKey)) throw new Error("target-path-collision");
    targetPaths.add(targetKey);
    if (file.role === "vendor" && !file.provenanceDigest)
      throw new Error("vendor-provenance-missing");
    for (const noticeId of file.requiredNotices) {
      const notice = byId.get(noticeId);
      const decision = dispositionById.get(noticeId);
      if (
        notice?.role !== "notice" ||
        !decision ||
        decision.kind === "delete" ||
        decision.target !== disposition.target
      )
        throw new Error("required-notice-missing");
    }
    if (disposition.kind === "generate") {
      if (file.role !== "generated") throw new Error("generated-role-required");
      if (!allReachable.has(id)) throw new Error("generated-output-unreachable");
      const visited = new Set([id]);
      let canonicalId = disposition.canonicalSource;
      for (;;) {
        if (visited.has(canonicalId)) throw new Error("canonical-source-cycle");
        visited.add(canonicalId);
        const canonical = byId.get(canonicalId);
        const retained = dispositionById.get(canonicalId);
        if (!canonical || !retained || retained.kind === "delete" || !allReachable.has(canonicalId))
          throw new Error("canonical-source-missing");
        if (retained.kind !== "generate") break;
        canonicalId = retained.canonicalSource;
      }
      continue;
    }
    if (file.role === "generated") throw new Error("generated-canonical-source-required");
    const reached = reachedByRoot.get(disposition.entryPoint);
    if (!reached) throw new Error("entrypoint-missing");
    const rootDisposition = dispositionById.get(disposition.entryPoint);
    if (
      !rootDisposition ||
      rootDisposition.kind === "delete" ||
      rootDisposition.target !== disposition.target
    )
      throw new Error("entrypoint-target-mismatch");
    if (["code", "contract", "vendor"].includes(file.role)) {
      if (!reached.has(id)) throw new Error("retained-code-unreachable");
    } else if (!reached.has(id)) {
      if (
        !disposition.supportEvidenceDigest ||
        !disposition.supportFor?.length ||
        disposition.supportFor.some((support) => !reached.has(support))
      )
        throw new Error("support-proof-missing");
    }
  }
  for (const path of targetPaths) {
    let separator = path.lastIndexOf("/");
    while (separator !== -1) {
      if (targetPaths.has(path.slice(0, separator))) throw new Error("target-path-collision");
      separator = path.lastIndexOf("/", separator - 1);
    }
  }
  const records = files
    .map((file) => {
      const disposition = dispositionById.get(fileId(file));
      if (!disposition) throw new Error("path-coverage-incomplete");
      return {
        source: file.source,
        sourceCommit: file.sourceCommit,
        sourcePath: file.sourcePath,
        sourceDigest: file.sourceDigest,
        disposition,
      };
    })
    .sort((a, b) => a.source.localeCompare(b.source) || a.sourcePath.localeCompare(b.sourcePath));
  const inputDigest = digest({
    files: [...files].sort((a, b) => fileId(a).localeCompare(fileId(b))),
    entryPoints: [...entryPoints].sort(),
    edges: [...edges].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    decisions: [...decisions].sort((a, b) => a.file.localeCompare(b.file)),
  });
  const body = {
    schemaVersion: "path-manifest.v1" as const,
    qualification: "candidate" as const,
    records,
    unclassifiedPaths: 0 as const,
    inputDigest,
  };
  return { ...body, digest: digest(body) };
}
async function readInput(path: string): Promise<unknown> {
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    if (!(await file.stat()).isFile()) throw new Error("path-input-invalid");
    const limit = 16 * 1024 * 1024;
    const bytes = Buffer.alloc(limit + 1);
    let offset = 0;
    while (offset < bytes.length) {
      const result = await file.read(bytes, offset, bytes.length - offset, null);
      if (!result.bytesRead) break;
      offset += result.bytesRead;
    }
    if (offset > limit) throw new Error("path-input-too-large");
    return JSON.parse(bytes.subarray(0, offset).toString("utf8"));
  } finally {
    await file.close();
  }
}
interface SnapshotInput {
  schemaVersion: string;
  files: ImmutableFile[];
  entryPoints: string[];
  edges: PathEdge[];
}
const snapshotValidator = new Ajv({ strict: true }).compile<SnapshotInput>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "files", "entryPoints", "edges"],
  properties: {
    schemaVersion: { const: "path-snapshot.v1" },
    files: { type: "array", minItems: 1 },
    entryPoints: { type: "array", items: hash, uniqueItems: true },
    edges: { type: "array" },
  },
});
async function writeAllowLists(destination: string, manifest: PathManifest): Promise<void> {
  const parent = await realpath(dirname(resolve(destination)));
  let current = parent;
  for (;;) {
    try {
      await lstat(join(current, ".git"));
      throw new Error("allow-list-inside-repository");
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
    const next = dirname(current);
    if (next === current) break;
    current = next;
  }
  const output = join(parent, resolve(destination).slice(dirname(resolve(destination)).length + 1));
  await mkdir(output, { mode: 0o700 });
  const targets = [
    ...new Set(
      manifest.records.flatMap((record) =>
        record.disposition.kind === "delete" ? [] : [record.disposition.target],
      ),
    ),
  ].sort();
  for (const target of targets) {
    const records = manifest.records.filter(
      (record) => record.disposition.kind !== "delete" && record.disposition.target === target,
    );
    await writeFile(
      join(output, `${target}.v1.yaml`),
      `${JSON.stringify(canonicalValue({ schemaVersion: "path-allow-list.v1", qualification: "candidate", target, inputDigest: manifest.inputDigest, manifestDigest: manifest.digest, records }), null, 2)}\n`,
      { flag: "wx", mode: 0o600 },
    );
  }
}
if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    if (
      (args.length !== 4 && args.length !== 6) ||
      args[0] !== "--snapshot" ||
      !args[1] ||
      args[2] !== "--decisions" ||
      !args[3] ||
      (args.length === 6 && (args[4] !== "--allow-lists" || !args[5]))
    )
      throw new Error("usage");
    const [snapshot, decisions] = await Promise.all([readInput(args[1]), readInput(args[3])]);
    if (!snapshotValidator(snapshot) || !decisionsValidator(decisions))
      throw new Error("path-input-invalid");
    const manifest = buildPathManifest(
      snapshot.files,
      snapshot.entryPoints,
      snapshot.edges,
      decisions,
    );
    if (args[5]) await writeAllowLists(args[5], manifest);
    console.log(JSON.stringify(canonicalValue(manifest), null, 2));
  } catch {
    console.error("path-manifest-blocked");
    process.exitCode = 1;
  }
}
