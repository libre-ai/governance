import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { chmod, mkdir, open, realpath, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  auditLicenses,
  digestEvidence,
  type LicenseInput,
  type LicensePolicy,
} from "./license-audit";
import { buildPathManifest, type PathDecision } from "./path-manifest";
import { fileId, type ImmutableFile, type PathEdge } from "./reachability";
import { runObservationBytes } from "./source-observation";
import { type BoundaryEvidence, validateTargetLayout } from "./target-layouts";
export interface GenerationRecipe {
  file: string;
  canonicalSource: string;
  recipe: "identity.v1" | "canonical-json.v1";
  targetDigest: string;
  reviewDigest: string;
}
export interface ComposeTargetInput {
  slug: string;
  sources: { source: string; commit: string; root: string }[];
  files: ImmutableFile[];
  entryPoints: string[];
  edges: PathEdge[];
  decisions: PathDecision[];
  licenses: LicenseInput;
  boundaries: BoundaryEvidence[];
  generation: GenerationRecipe[];
}
export interface CompositionPolicy {
  inputDigest: string;
  licensePolicy: LicensePolicy;
  boundaryDigests: string[];
  generationDigests: string[];
  reviewEvidence: string;
}
export interface ComposedFile {
  path: string;
  digest: string;
  mode: "100644" | "100755";
}
export interface ComposedTarget {
  slug: string;
  directory: string;
  treeDigest: string;
  sourceManifestDigest: string;
  compositionEvidenceDigest: string;
  files: ComposedFile[];
}
export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
/** All Git configuration and inherited Git path overrides are excluded from this local boundary. */
export async function compositionGit(root: string, ...args: string[]): Promise<Buffer> {
  return await runObservationBytes([
    "/usr/bin/env",
    "-i",
    "PATH=/usr/bin:/bin",
    "GIT_NO_LAZY_FETCH=1",
    "GIT_OPTIONAL_LOCKS=0",
    "GIT_TERMINAL_PROMPT=0",
    "GIT_CONFIG_NOSYSTEM=1",
    "GIT_CONFIG_GLOBAL=/dev/null",
    "git",
    "--no-replace-objects",
    "-c",
    "core.fsmonitor=false",
    "-c",
    "core.hooksPath=/dev/null",
    "-C",
    root,
    ...args,
  ]);
}
function text(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
}
function hash(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}
function validPath(path: string): boolean {
  return (
    /^[A-Za-z0-9_.@+/-]+$/.test(path) &&
    path
      .split("/")
      .every((part) => !!part && part !== "." && part !== ".." && part.toLowerCase() !== ".git")
  );
}
function generate(recipe: GenerationRecipe, canonical: Buffer): Buffer {
  if (recipe.recipe === "identity.v1") return Buffer.from(canonical);
  if (recipe.recipe === "canonical-json.v1") {
    const value: unknown = JSON.parse(text(canonical));
    function normalize(v: unknown): unknown {
      if (Array.isArray(v)) return v.map(normalize);
      if (v !== null && typeof v === "object")
        return Object.fromEntries(
          Object.entries(v)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([key, item]) => [key, normalize(item)]),
        );
      return v;
    }
    return Buffer.from(`${JSON.stringify(normalize(value), null, 2)}\n`);
  }
  throw new Error("recipe");
}
export async function composeTarget(
  input: ComposeTargetInput,
  policy: CompositionPolicy,
  outputRun: string,
): Promise<ComposedTarget> {
  try {
    if (
      !hash(policy.reviewEvidence) ||
      digestEvidence(input) !== policy.inputDigest ||
      !/^(?:\.github|[a-z0-9-]+)$/.test(input.slug)
    )
      throw new Error("review");
    const manifest = buildPathManifest(
      input.files,
      input.entryPoints,
      input.edges,
      input.decisions,
    );
    if (!auditLicenses(input.licenses, policy.licensePolicy).accepted) throw new Error("rights");
    if (
      new Set(input.sources.map((source) => source.source)).size !== input.sources.length ||
      input.sources.length === 0
    )
      throw new Error("sources");
    const fileByPath = new Map(
      input.files.map((file) => [`${file.source}:${file.sourceCommit}:${file.sourcePath}`, file]),
    );
    const licenseByPath = new Map(
      input.licenses.files.map((file) => [
        `${file.source}:${file.commit}:${file.path}:${file.target}:${file.targetPath}`,
        file,
      ]),
    );
    const recipesByFile = new Map(input.generation.map((recipe) => [recipe.file, recipe]));
    if (recipesByFile.size !== input.generation.length) throw new Error("duplicate-recipe");
    const actual = new Map<string, { bytes: Buffer; mode: "100644" | "100755" }>();
    let total = 0;
    for (const source of input.sources) {
      if (
        !/^[a-f0-9]{40}$/.test(source.commit) ||
        (await realpath(source.root)) !== resolve(source.root)
      )
        throw new Error("source");
      if (
        text(
          await compositionGit(source.root, "rev-parse", "--verify", `${source.commit}^{commit}`),
        ).trim() !== source.commit
      )
        throw new Error("commit");
      if (
        text(await compositionGit(source.root, "rev-parse", "--show-toplevel")).trim() !==
        source.root
      )
        throw new Error("source-root");
      const output = resolve(outputRun);
      const common = text(
        await compositionGit(
          source.root,
          "rev-parse",
          "--path-format=absolute",
          "--git-common-dir",
        ),
      ).trim();
      if (output === common || output.startsWith(`${common}/`)) throw new Error("source-output");
      if (output === source.root || output.startsWith(`${source.root}/`))
        throw new Error("source-output");
      const tree = text(await compositionGit(source.root, "ls-tree", "-rz", source.commit));
      const expected = input.files.filter((file) => file.source === source.source);
      const entries = tree.split("\0").filter(Boolean);
      if (entries.length !== expected.length) throw new Error("coverage");
      for (const entry of entries) {
        const match = /^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)$/.exec(entry);
        if (!match) throw new Error("tree");
        const [, mode, oid, path] = match;
        if (!path || !oid || !validPath(path) || (mode !== "100644" && mode !== "100755"))
          throw new Error("tree");
        const file = fileByPath.get(`${source.source}:${source.commit}:${path}`);
        if (!file) throw new Error("coverage");
        const bytes = await compositionGit(source.root, "cat-file", "blob", oid);
        total += bytes.length;
        if (total > 256 * 1024 * 1024) throw new Error("limit");
        if (sha256(bytes) !== file.sourceDigest) throw new Error("bytes");
        actual.set(fileId(file), { bytes, mode });
      }
    }
    if (actual.size !== input.files.length) throw new Error("coverage");
    const computed = new Map<string, Buffer>();
    const decisions = new Map(
      input.decisions.map((decision) => [decision.file, decision.disposition]),
    );
    function materialize(id: string, visiting = new Set<string>()): Buffer {
      const previous = computed.get(id);
      if (previous) return previous;
      const source = actual.get(id);
      const disposition = decisions.get(id);
      if (!source || !disposition || disposition.kind === "delete" || visiting.has(id))
        throw new Error("canonical");
      if (disposition.kind !== "generate") return source.bytes;
      const recipe = recipesByFile.get(id);
      if (
        !recipe ||
        recipe.canonicalSource !== disposition.canonicalSource ||
        !hash(recipe.reviewDigest) ||
        !policy.generationDigests.includes(digestEvidence(recipe))
      )
        throw new Error("recipe");
      visiting.add(id);
      const canonical = materialize(recipe.canonicalSource, visiting);
      visiting.delete(id);
      const bytes = generate(recipe, canonical);
      if (sha256(bytes) !== recipe.targetDigest || !bytes.equals(generate(recipe, canonical)))
        throw new Error("generation");
      computed.set(id, bytes);
      return bytes;
    }
    const outputs = new Map<string, { bytes: Buffer; mode: "100644" | "100755" }>();
    const layout = [];
    for (const record of manifest.records) {
      const disposition = record.disposition;
      if (disposition.kind === "delete" || disposition.target !== input.slug) continue;
      const file = fileByPath.get(`${record.source}:${record.sourceCommit}:${record.sourcePath}`);
      if (!file) throw new Error("file");
      const id = fileId(file);
      const source = actual.get(id);
      if (!source || !validPath(disposition.targetPath)) throw new Error("source");
      const bytes = materialize(id);
      const license = licenseByPath.get(
        `${file.source}:${file.sourceCommit}:${file.sourcePath}:${input.slug}:${disposition.targetPath}`,
      );
      const kind =
        file.role === "documentation" ? "documentation" : file.role === "asset" ? "asset" : "code";
      if (!license || license.kind !== kind || license.contentDigest !== file.sourceDigest)
        throw new Error("license-binding");
      outputs.set(disposition.targetPath, { bytes, mode: source.mode });
      layout.push({ source: file.source, path: disposition.targetPath, role: file.role });
    }
    if (
      !outputs.size ||
      input.licenses.files.filter((file) => file.target === input.slug).length !== outputs.size
    )
      throw new Error("coverage");
    for (const file of input.licenses.files.filter((file) => file.target === input.slug))
      for (const notice of [...file.requiredNotices, ...file.retainedNotices]) {
        const bytes = outputs.get(notice.path)?.bytes;
        if (!bytes || sha256(bytes) !== notice.contentDigest) throw new Error("notice");
      }
    if ([...outputs.values()].reduce((sum, file) => sum + file.bytes.length, 0) > 256 * 1024 * 1024)
      throw new Error("output-limit");
    validateTargetLayout(input.slug, layout, input.boundaries, policy.boundaryDigests);
    const files = [...outputs]
      .map(([path, { bytes, mode }]) => ({ path, digest: sha256(bytes), mode }))
      .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    const parent = dirname(resolve(outputRun));
    if ((await realpath(parent)) !== parent) throw new Error("output");
    // A new private run directory is reserved exclusively. No existing directory is replaced.
    await mkdir(outputRun, { mode: 0o700 });
    const stage = join(outputRun, ".staging");
    await mkdir(stage, { mode: 0o700 });
    for (const [path, { bytes, mode }] of outputs) {
      const target = join(stage, path);
      await mkdir(dirname(target), { recursive: true, mode: 0o700 });
      await writeFile(target, bytes, { flag: "wx", mode: 0o600 });
      await chmod(target, mode === "100755" ? 0o755 : 0o644);
    }
    const directory = join(resolve(outputRun), input.slug);
    await rename(stage, directory);
    return {
      slug: input.slug,
      directory,
      treeDigest: digestEvidence(files),
      sourceManifestDigest: manifest.digest,
      compositionEvidenceDigest: policy.inputDigest,
      files,
    };
  } catch {
    throw new Error("composition-rejected");
  }
}
async function boundedInput(path: string): Promise<Buffer> {
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > 16 * 1024 * 1024) throw new Error("input");
    const bytes = Buffer.alloc(stat.size + 1);
    let offset = 0;
    while (offset < bytes.length) {
      const { bytesRead } = await file.read(bytes, offset, bytes.length - offset, null);
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset !== stat.size) throw new Error("input");
    return bytes.subarray(0, offset);
  } finally {
    await file.close();
  }
}
if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    if (
      args.length !== 8 ||
      args[0] !== "--input" ||
      args[2] !== "--policy" ||
      args[4] !== "--policy-sha256" ||
      args[6] !== "--output" ||
      !args[1] ||
      !args[3] ||
      !args[5] ||
      !args[7]
    )
      throw new Error("input");
    const policyBytes = await boundedInput(args[3]);
    if (sha256(policyBytes) !== args[5]) throw new Error("policy");
    const result = await composeTarget(
      JSON.parse(text(await boundedInput(args[1]))),
      JSON.parse(text(policyBytes)),
      args[7],
    );
    console.log(
      JSON.stringify({
        qualification: "candidate",
        slug: result.slug,
        treeDigest: result.treeDigest,
        sourceManifestDigest: result.sourceManifestDigest,
        compositionEvidenceDigest: result.compositionEvidenceDigest,
      }),
    );
  } catch {
    console.error("composition-rejected");
    process.exitCode = 1;
  }
}
