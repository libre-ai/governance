import { createHash } from "node:crypto";
import Ajv from "ajv";
import { resolveSourcePath } from "./entry-points";
import { readPortfolio } from "./source-freeze";

export interface ImmutableFile {
  source: string;
  sourceCommit: string;
  sourcePath: string;
  sourceDigest: string;
  role:
    | "code"
    | "test"
    | "documentation"
    | "example"
    | "notice"
    | "migration"
    | "asset"
    | "contract"
    | "generated"
    | "vendor";
  sensitivity: "clear" | "present" | "unknown";
  license: "current" | "obsolete" | "unknown";
  provenanceDigest: string | null;
  dependencyAnalysis: { complete: boolean; evidenceDigest: string | null };
  requiredNotices: string[];
}
export interface PathEdge {
  consumer: string;
  provider: string;
  kind: "runtime" | "build" | "type" | "test";
}
export interface Reachability {
  reachable: string[];
  byEntryPoint: Record<string, string[]>;
  excludedTestEdges: number;
}
const hash = { type: "string", pattern: "^[a-f0-9]{64}$" };
const nullableHash = { anyOf: [hash, { type: "null" }] };
const fileValidator = new Ajv({ strict: true }).compile<ImmutableFile>({
  type: "object",
  additionalProperties: false,
  required: [
    "source",
    "sourceCommit",
    "sourcePath",
    "sourceDigest",
    "role",
    "sensitivity",
    "license",
    "provenanceDigest",
    "dependencyAnalysis",
    "requiredNotices",
  ],
  properties: {
    source: { type: "string" },
    sourceCommit: { type: "string", pattern: "^[a-f0-9]{40}$" },
    sourcePath: { type: "string", minLength: 1 },
    sourceDigest: hash,
    role: {
      enum: [
        "code",
        "test",
        "documentation",
        "example",
        "notice",
        "migration",
        "asset",
        "contract",
        "generated",
        "vendor",
      ],
    },
    sensitivity: { enum: ["clear", "present", "unknown"] },
    license: { enum: ["current", "obsolete", "unknown"] },
    provenanceDigest: nullableHash,
    dependencyAnalysis: {
      type: "object",
      additionalProperties: false,
      required: ["complete", "evidenceDigest"],
      properties: { complete: { type: "boolean" }, evidenceDigest: nullableHash },
    },
    requiredNotices: { type: "array", uniqueItems: true, items: hash },
  },
});
const edgeValidator = new Ajv({ strict: true }).compile<PathEdge[]>({
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["consumer", "provider", "kind"],
    properties: {
      consumer: hash,
      provider: hash,
      kind: { enum: ["runtime", "build", "type", "test"] },
    },
  },
});
const sourceSlugs = new Set(readPortfolio().sources.map((source) => source.source));
export function isTestFile(file: ImmutableFile): boolean {
  return (
    file.role === "test" ||
    /(?:^|\/)(?:tests?|__tests__|fixtures)(?:\/|\.)|\.(?:test|spec)\.[^.]+$/.test(file.sourcePath)
  );
}
export function validateImmutableFile(value: unknown): asserts value is ImmutableFile {
  if (
    !fileValidator(value) ||
    !sourceSlugs.has(value.source) ||
    /(?:^|\/)\.git(?:\/|$)/i.test(value.sourcePath) ||
    resolveSourcePath("", value.sourcePath) !== value.sourcePath ||
    /[\p{C}]/u.test(value.sourcePath)
  )
    throw new Error("path-snapshot-invalid");
  if (
    /\.(?:[cm]?[jt]sx?|rs)$/.test(value.sourcePath) &&
    !["code", "test", "example", "generated", "vendor"].includes(value.role)
  )
    throw new Error("path-role-invalid");
}
export function fileId(file: ImmutableFile): string {
  return createHash("sha256")
    .update(JSON.stringify([file.source, file.sourceCommit, file.sourcePath, file.sourceDigest]))
    .digest("hex");
}
export function analyzeReachability(
  files: ImmutableFile[],
  entryPoints: string[],
  edges: PathEdge[],
): Reachability {
  if (!Array.isArray(files) || !Array.isArray(entryPoints) || !edgeValidator(edges))
    throw new Error("reachability-invalid");
  const nodes = new Map<string, ImmutableFile>();
  const paths = new Set<string>();
  const commits = new Map<string, string>();
  for (const file of files) {
    validateImmutableFile(file);
    const key = `${file.source}:${file.sourcePath}`;
    if (
      paths.has(key) ||
      (commits.has(file.source) && commits.get(file.source) !== file.sourceCommit)
    )
      throw new Error("path-snapshot-invalid");
    paths.add(key);
    commits.set(file.source, file.sourceCommit);
    nodes.set(fileId(file), file);
    if (
      ["code", "contract", "generated", "vendor"].includes(file.role) &&
      !isTestFile(file) &&
      (!file.dependencyAnalysis.complete || !file.dependencyAnalysis.evidenceDigest)
    )
      throw new Error("dependency-coverage-unknown");
  }
  if (new Set(entryPoints).size !== entryPoints.length) throw new Error("entrypoint-invalid");
  const adjacency = new Map<string, string[]>();
  let excludedTestEdges = 0;
  for (const edge of edges) {
    const consumer = nodes.get(edge.consumer),
      provider = nodes.get(edge.provider);
    if (!consumer || !provider) throw new Error("edge-endpoint-missing");
    if (edge.kind === "test" || isTestFile(consumer) || consumer.role === "example") {
      excludedTestEdges++;
      continue;
    }
    if (
      isTestFile(provider) ||
      provider.role === "example" ||
      !["code", "contract", "generated", "vendor"].includes(consumer.role)
    )
      throw new Error("production-edge-invalid");
    const list = adjacency.get(edge.consumer) ?? [];
    list.push(edge.provider);
    adjacency.set(edge.consumer, list);
  }
  const byEntryPoint: Record<string, string[]> = {};
  const reachable = new Set<string>();
  for (const root of entryPoints) {
    const file = nodes.get(root);
    if (!file || isTestFile(file) || ["example", "notice", "migration"].includes(file.role))
      throw new Error("entrypoint-invalid");
    const found = new Set<string>();
    const pending = [root];
    while (pending.length) {
      const next = pending.pop();
      if (next === undefined || found.has(next)) continue;
      found.add(next);
      reachable.add(next);
      pending.push(...(adjacency.get(next) ?? []));
    }
    byEntryPoint[root] = [...found].sort();
  }
  return {
    reachable: [...reachable].sort(),
    byEntryPoint: Object.fromEntries(
      Object.entries(byEntryPoint).sort(([a], [b]) => a.localeCompare(b)),
    ),
    excludedTestEdges,
  };
}
