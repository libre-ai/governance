import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isAbsolute, posix } from "node:path";
import Ajv from "ajv";
import type { ShippedEntryPoint, SourceSnapshot, UnresolvedObservation } from "./entry-points";
import {
  findEntryPoints,
  objectValue,
  parseManifest,
  resolveSourcePath,
  validateSnapshot,
} from "./entry-points";
import { readPortfolio } from "./source-freeze";
import { runObservationCommand } from "./source-observation";

export interface ConsumerEdge {
  consumer: string;
  provider: string | null;
  packageName: string;
  kind: "runtime" | "build" | "peer" | "dev";
  releasedArtifact: boolean;
  manifest: string;
  referenceDigest: string;
  resolution: "registry-lock" | "git-pin" | "workspace" | "unresolved";
  disposition: "declared-production" | "excluded-dev";
  conditional: boolean;
}
export interface DependencyGraph {
  schemaVersion: "consumer-graph.v1";
  qualification: "provisional";
  sources: { source: string; commit: string; manifestDigest: string }[];
  entries: ShippedEntryPoint[];
  edges: ConsumerEdge[];
  unresolved: UnresolvedObservation[];
  verifiedConsumerCount: null;
  declaredConsumerCounts: { provider: string; consumers: string[] }[];
  digest: string;
}
interface PackageRecord {
  snapshot: SourceSnapshot;
  path: string;
  manifest: Record<string, unknown>;
  ecosystem: "npm" | "cargo";
  name: string;
}
function sha(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
function dir(path: string): string {
  return posix.dirname(path) === "." ? "" : posix.dirname(path);
}
function nearest(
  snapshot: SourceSnapshot,
  path: string,
  name: string,
  cache: Map<string, Record<string, unknown>>,
): { path: string; value: Record<string, unknown> } | null {
  let base = dir(path);
  for (;;) {
    const target = posix.join(base, name);
    const bytes = snapshot.files[target];
    if (bytes !== undefined) {
      const key = `${snapshot.source}:${target}`;
      const value = cache.get(key) ?? parseManifest(target, bytes);
      cache.set(key, value);
      return { path: target, value };
    }
    if (!base) return null;
    base = dir(base);
  }
}
function versionMatches(requirement: string, version: string): boolean {
  const raw = requirement.replace(/^=/, "");
  if (raw === version) return true;
  const wanted = /^([~^]?)(\d+)\.(\d+)\.(\d+)$/.exec(raw);
  const actual = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!wanted || !actual || !wanted[1]) return false;
  const [major, minor, patch] = [Number(wanted[2]), Number(wanted[3]), Number(wanted[4])];
  const [a, b, c] = [Number(actual[1]), Number(actual[2]), Number(actual[3])];
  if (a !== major || b < minor || (b === minor && c < patch)) return false;
  return wanted[1] === "~"
    ? b === minor
    : major > 0 || (minor > 0 ? b === minor : b === minor && c === patch);
}
export function buildDependencyGraph(snapshots: SourceSnapshot[]): DependencyGraph {
  const records: PackageRecord[] = [];
  const lockCache = new Map<string, Record<string, unknown>>();
  const entries: ShippedEntryPoint[] = [];
  const unresolved: UnresolvedObservation[] = [];
  const edges: ConsumerEdge[] = [];
  if (new Set(snapshots.map((s) => s.source)).size !== snapshots.length)
    throw new Error("manifest-invalid");
  for (const snapshot of snapshots) {
    validateSnapshot(snapshot);
    const found = findEntryPoints(snapshot);
    entries.push(...found.entries);
    unresolved.push(...found.unresolved);
    if (!found.entries.length)
      unresolved.push({
        source: snapshot.source,
        manifest: ".",
        reason: "shipped-entrypoints-unproved",
      });
    for (const [path, bytes] of Object.entries(snapshot.files)) {
      if (!/(?:^|\/)(?:package\.json|Cargo\.toml)$/.test(path)) continue;
      const manifest = parseManifest(path, bytes);
      const ecosystem = path.endsWith("package.json") ? "npm" : "cargo";
      const pkg =
        ecosystem === "npm"
          ? manifest
          : manifest.package === undefined
            ? null
            : objectValue(manifest.package);
      if (pkg !== null || manifest.workspace !== undefined) {
        if (
          pkg?.name !== undefined &&
          (typeof pkg.name !== "string" || !/^(?:@[a-z0-9_.-]+\/)?[a-zA-Z0-9_.-]+$/.test(pkg.name))
        )
          throw new Error("manifest-invalid");
        records.push({
          snapshot,
          path,
          manifest,
          ecosystem,
          name: typeof pkg?.name === "string" ? pkg.name : "",
        });
      }
    }
  }
  function block(record: PackageRecord, reason: string): void {
    unresolved.push({ source: record.snapshot.source, manifest: record.path, reason });
  }
  function edge(
    record: PackageRecord,
    name: string,
    raw: unknown,
    kind: ConsumerEdge["kind"],
    conditional = false,
  ): void {
    if (!/^(?:@[a-z0-9_.-]+\/)?[a-zA-Z0-9_.-]+$/.test(name)) throw new Error("manifest-invalid");
    let descriptor = raw;
    let workspaceRoot: PackageRecord | null = null;
    if (
      record.ecosystem === "cargo" &&
      typeof raw === "object" &&
      raw !== null &&
      objectValue(raw).workspace === true
    ) {
      const roots = records
        .filter(
          (root) =>
            root.snapshot === record.snapshot &&
            root.ecosystem === "cargo" &&
            root.manifest.workspace !== undefined &&
            (dir(root.path) === "" || record.path.startsWith(`${dir(root.path)}/`)),
        )
        .sort((a, b) => b.path.length - a.path.length);
      const root = roots[0];
      if (root) {
        const workspace = objectValue(root.manifest.workspace);
        const deps =
          workspace.dependencies === undefined ? {} : objectValue(workspace.dependencies);
        const inherited = deps[name];
        descriptor =
          inherited === undefined
            ? undefined
            : {
                ...(typeof inherited === "string"
                  ? { version: inherited }
                  : objectValue(inherited)),
                ...objectValue(raw),
              };
        workspaceRoot = { ...record, path: root.path, manifest: root.manifest };
      } else descriptor = undefined;
    }
    const item =
      typeof descriptor === "string"
        ? { version: descriptor }
        : descriptor && typeof descriptor === "object"
          ? objectValue(descriptor)
          : {};
    const packageName = typeof item.package === "string" ? item.package : name;
    const candidates = records.filter(
      (candidate) => candidate.name === packageName && candidate.ecosystem === record.ecosystem,
    );
    let provider: string | null =
      candidates.length === 1 ? (candidates[0]?.snapshot.source ?? null) : null;
    let resolution: ConsumerEdge["resolution"] = "unresolved";
    const version = typeof item.version === "string" ? item.version : "";
    const reference = JSON.stringify(descriptor ?? null);
    if (candidates.length > 1) block(record, "provider-ambiguous");
    const local =
      typeof item.path === "string"
        ? item.path
        : version.startsWith("file:")
          ? version.slice(5)
          : version.startsWith("link:")
            ? version.slice(5)
            : null;
    if (local !== null) {
      const target = resolveSourcePath(dir(workspaceRoot?.path ?? record.path), local);
      const file = target
        ? posix.join(target, record.ecosystem === "npm" ? "package.json" : "Cargo.toml")
        : null;
      const candidate = records.find(
        (candidate) =>
          candidate.snapshot.source === record.snapshot.source &&
          candidate.path === file &&
          candidate.name === packageName,
      );
      if (candidate) {
        provider = record.snapshot.source;
        resolution = "workspace";
      } else block(record, "local-dependency-unresolved");
    } else if (version.startsWith("workspace:")) {
      const matches = candidates.filter(
        (candidate) => candidate.snapshot.source === record.snapshot.source,
      );
      const member = matches[0];
      const declared =
        member &&
        records.some((root) => {
          if (
            root.snapshot !== record.snapshot ||
            root.ecosystem !== "npm" ||
            root.manifest.workspaces === undefined
          )
            return false;
          const rawMembers = root.manifest.workspaces;
          const members = Array.isArray(rawMembers) ? rawMembers : objectValue(rawMembers).packages;
          if (!Array.isArray(members)) throw new Error("manifest-invalid");
          const contains = (path: string): boolean => {
            return (
              root.path === path ||
              members.some(
                (pattern) =>
                  typeof pattern === "string" &&
                  new Bun.Glob(posix.join(dir(root.path), pattern, "package.json")).match(path),
              )
            );
          };
          return contains(record.path) && contains(member.path);
        });
      if (matches.length === 1 && declared) {
        provider = record.snapshot.source;
        resolution = "workspace";
      } else block(record, "workspace-dependency-unresolved");
    } else {
      const git =
        typeof item.git === "string"
          ? `${item.git.replace(/\.git$/, "")}#${typeof item.rev === "string" ? item.rev : ""}`
          : version;
      const pin =
        /^(?:github:|(?:git\+)?https:\/\/github\.com\/)(libre-ai\/([.a-z0-9-]+))(?:\.git)?#([a-f0-9]{40})$/.exec(
          git,
        );
      const lock = nearest(
        record.snapshot,
        record.path,
        record.ecosystem === "npm" ? "bun.lock" : "Cargo.lock",
        lockCache,
      );
      if (pin?.[2] && pin[3]) {
        provider = pin[2];
        if (record.ecosystem === "npm" && lock) {
          const packages =
            lock.value.packages === undefined ? {} : objectValue(lock.value.packages);
          const locked = packages[name];
          if (Array.isArray(locked) && typeof locked[0] === "string") {
            const lockedPin = /#([a-f0-9]{7,40})$/.exec(locked[0]);
            if (
              lockedPin?.[1] &&
              pin[3].startsWith(lockedPin[1]) &&
              locked[0].includes(`github:${pin[1]}#`)
            )
              resolution = "git-pin";
          }
        }
        if (record.ecosystem === "cargo" && lock && Array.isArray(lock.value.package)) {
          const matches = lock.value.package
            .map(objectValue)
            .filter(
              (pkg) =>
                pkg.name === packageName &&
                typeof pkg.source === "string" &&
                pkg.source.endsWith(`#${pin[3]}`) &&
                pkg.source.includes(`github.com/${pin[1]}`),
            );
          if (matches.length === 1) resolution = "git-pin";
        }
      } else if (version && lock && !/^(?:file:|link:|git|github:|https?:)/.test(version)) {
        if (record.ecosystem === "npm") {
          const packages =
            lock.value.packages === undefined ? {} : objectValue(lock.value.packages);
          const locked = packages[name];
          if (
            Array.isArray(locked) &&
            typeof locked[0] === "string" &&
            locked[0].startsWith(`${packageName}@`) &&
            versionMatches(version, locked[0].slice(packageName.length + 1))
          )
            resolution = "registry-lock";
        } else if (Array.isArray(lock.value.package)) {
          const matches = lock.value.package
            .map(objectValue)
            .filter(
              (pkg) =>
                pkg.name === packageName &&
                typeof pkg.version === "string" &&
                versionMatches(version, pkg.version) &&
                pkg.source === "registry+https://github.com/rust-lang/crates.io-index" &&
                typeof pkg.checksum === "string",
            );
          if (matches.length === 1) resolution = "registry-lock";
        }
      }
    }
    if (resolution === "unresolved") block(record, "dependency-resolution-unproved");
    if (kind !== "dev") block(record, "reachability-unproved");
    edges.push({
      consumer: record.snapshot.source,
      provider,
      packageName,
      kind,
      releasedArtifact: false,
      manifest: record.path,
      referenceDigest: sha(reference),
      resolution,
      disposition: kind === "dev" ? "excluded-dev" : "declared-production",
      conditional: conditional || item.optional === true,
    });
  }
  for (const record of records) {
    const sections: [string, ConsumerEdge["kind"]][] =
      record.ecosystem === "npm"
        ? [
            ["dependencies", "runtime"],
            ["peerDependencies", "peer"],
            ["devDependencies", "dev"],
            ["optionalDependencies", "runtime"],
          ]
        : [
            ["dependencies", "runtime"],
            ["build-dependencies", "build"],
            ["dev-dependencies", "dev"],
          ];
    function sectionsOf(manifest: Record<string, unknown>, conditional = false): void {
      for (const [section, kind] of sections) {
        if (manifest[section] === undefined) continue;
        for (const [name, raw] of Object.entries(objectValue(manifest[section])))
          edge(record, name, raw, kind, conditional || section === "optionalDependencies");
      }
    }
    sectionsOf(record.manifest);
    if (record.ecosystem === "cargo" && record.manifest.target !== undefined)
      for (const target of Object.values(objectValue(record.manifest.target)))
        sectionsOf(objectValue(target), true);
    const workspace = record.manifest.workspaces;
    const members = Array.isArray(workspace)
      ? workspace
      : workspace && typeof workspace === "object"
        ? objectValue(workspace).packages
        : record.manifest.workspace !== undefined
          ? objectValue(record.manifest.workspace).members
          : undefined;
    if (members !== undefined) {
      if (!Array.isArray(members) || members.some((member) => typeof member !== "string"))
        throw new Error("manifest-invalid");
      for (const member of members) {
        const target = resolveSourcePath(dir(record.path), member);
        if (
          !target ||
          !records.some(
            (candidate) =>
              candidate.snapshot.source === record.snapshot.source &&
              new Bun.Glob(
                `${target}/${record.ecosystem === "npm" ? "package.json" : "Cargo.toml"}`,
              ).match(candidate.path),
          )
        )
          block(record, "workspace-member-unresolved");
      }
    }
  }
  const sortedEdges = edges.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const uniqueUnresolved = [
    ...new Map(unresolved.map((item) => [JSON.stringify(item), item])).values(),
  ].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const declared = new Map<string, Set<string>>();
  for (const edge of edges)
    if (
      edge.provider &&
      edge.provider !== edge.consumer &&
      edge.kind !== "dev" &&
      entries.some(
        (entry) => entry.repository === edge.consumer && entry.manifest === edge.manifest,
      )
    ) {
      const consumers = declared.get(edge.provider) ?? new Set<string>();
      consumers.add(edge.consumer);
      declared.set(edge.provider, consumers);
    }
  const body = {
    schemaVersion: "consumer-graph.v1" as const,
    qualification: "provisional" as const,
    sources: snapshots
      .map((snapshot) => ({
        source: snapshot.source,
        commit: snapshot.commit,
        manifestDigest: sha(
          JSON.stringify(
            Object.entries(snapshot.files)
              .filter(([path]) =>
                /(?:package\.json|Cargo\.toml|bun\.lock|Cargo\.lock|shipped-entry-points\.v1\.json)$/.test(
                  path,
                ),
              )
              .sort(([a], [b]) => a.localeCompare(b)),
          ),
        ),
      }))
      .sort((a, b) => a.source.localeCompare(b.source)),
    entries: entries.sort(
      (a, b) => a.repository.localeCompare(b.repository) || a.path.localeCompare(b.path),
    ),
    edges: sortedEdges,
    unresolved: uniqueUnresolved,
    verifiedConsumerCount: null,
    declaredConsumerCounts: [...declared]
      .map(([provider, consumers]) => ({ provider, consumers: [...consumers].sort() }))
      .sort((a, b) => a.provider.localeCompare(b.provider)),
  };
  return { ...body, digest: sha(JSON.stringify(body)) };
}

async function git(root: string, ...args: string[]): Promise<string> {
  return runObservationCommand(
    ["git", "--no-replace-objects", "-c", "core.fsmonitor=false", "-C", root, ...args],
    30_000,
    { preserveTrailingWhitespace: true },
  );
}
interface SourceRequest {
  source: string;
  root: string;
  commit: string;
}
const requestValidator = new Ajv({ strict: true }).compile<{
  schemaVersion: string;
  sources: SourceRequest[];
}>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "sources"],
  properties: {
    schemaVersion: { const: "consumer-input.v1" },
    sources: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["source", "root", "commit"],
        properties: {
          source: { type: "string" },
          root: { type: "string" },
          commit: { type: "string", pattern: "^[a-f0-9]{40}$" },
        },
      },
    },
  },
});
export async function collectSourceSnapshots(input: unknown): Promise<SourceSnapshot[]> {
  if (
    !requestValidator(input) ||
    input.sources.some(
      (source) =>
        !isAbsolute(source.root) ||
        !readPortfolio().sources.some((item) => item.source === source.source),
    ) ||
    new Set(input.sources.map((s) => s.source)).size !== input.sources.length
  )
    throw new Error("consumer-input-invalid");
  const snapshots: SourceSnapshot[] = [];
  for (const source of input.sources) {
    const origin = (await git(source.root, "remote", "get-url", "origin")).trim();
    if (
      ![
        `https://github.com/libre-ai/${source.source}.git`,
        `https://github.com/libre-ai/${source.source}`,
        `git@github.com:libre-ai/${source.source}.git`,
      ].includes(origin)
    )
      throw new Error("source-origin-mismatch");
    if ((await git(source.root, "for-each-ref", "--format=%(refname)", "refs/replace")).trim())
      throw new Error("source-replacement-refused");
    const oid = (
      await git(source.root, "rev-parse", "--verify", `${source.commit}^{commit}`)
    ).trim();
    if (oid !== source.commit) throw new Error("source-revision-mismatch");
    const files: Record<string, string> = {};
    const tree = await git(source.root, "ls-tree", "-rz", source.commit);
    for (const entry of tree.split("\0").filter(Boolean)) {
      const match = /^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(entry);
      const path = match?.[4];
      if (!match || !path || resolveSourcePath("", path) !== path)
        throw new Error("source-tree-invalid");
      if (match[1] !== "100644" && match[1] !== "100755") throw new Error("source-tree-nonregular");
      files[path] =
        /(?:^|\/)(?:package\.json|Cargo\.toml|bun\.lock|Cargo\.lock|shipped-entry-points\.v1\.json)$/.test(
          path,
        )
          ? await git(source.root, "show", `${source.commit}:${path}`)
          : "";
    }
    snapshots.push({ source: source.source, commit: source.commit, files });
  }
  return snapshots;
}
if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== "--sources" || !args[1]) throw new Error("usage");
    const input: unknown = JSON.parse(await readFile(args[1], "utf8"));
    const graph = buildDependencyGraph(await collectSourceSnapshots(input));
    console.log(JSON.stringify(graph, null, 2));
    if (graph.unresolved.length) process.exitCode = 1;
  } catch {
    console.error("consumer-observation-blocked");
    process.exitCode = 1;
  }
}
