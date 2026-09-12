import { posix } from "node:path";
import Ajv from "ajv";

export interface SourceSnapshot {
  source: string;
  commit: string;
  files: Record<string, string>;
}
export interface ShippedEntryPoint {
  repository: string;
  path: string;
  kind: "package-export" | "binary" | "library" | "application" | "contract" | "tool";
  manifest: string;
}
export interface UnresolvedObservation {
  source: string;
  manifest: string;
  reason: string;
}
export interface EntryPointResult {
  entries: ShippedEntryPoint[];
  unresolved: UnresolvedObservation[];
}
const snapshotValidator = new Ajv({ strict: true }).compile<SourceSnapshot>({
  type: "object",
  additionalProperties: false,
  required: ["source", "commit", "files"],
  properties: {
    source: { type: "string", pattern: "^[.a-z0-9-]+$" },
    commit: { type: "string", pattern: "^[a-f0-9]{40}$" },
    files: {
      type: "object",
      additionalProperties: { type: "string" },
      propertyNames: { minLength: 1, maxLength: 4096 },
    },
  },
});
export function validateSnapshot(input: unknown): asserts input is SourceSnapshot {
  if (
    !snapshotValidator(input) ||
    Object.keys(input.files).some((path) => resolveSourcePath("", path) !== path)
  )
    throw new Error("manifest-invalid");
}
export function objectValue(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("manifest-invalid");
  return value as Record<string, unknown>;
}
export function parseManifest(path: string, bytes: string): Record<string, unknown> {
  try {
    return objectValue(
      path.endsWith(".toml") || path.endsWith("Cargo.lock")
        ? Bun.TOML.parse(bytes)
        : path.endsWith("bun.lock")
          ? Bun.JSONC.parse(bytes)
          : JSON.parse(bytes),
    );
  } catch {
    throw new Error("manifest-invalid");
  }
}
export function resolveSourcePath(base: string, path: string): string | null {
  if (!path || path.startsWith("/") || /[\\:\p{C}]/u.test(path)) return null;
  const normalized = posix.normalize(posix.join(base, path));
  return normalized === ".." || normalized.startsWith("../") || normalized === "."
    ? null
    : normalized;
}
function testOnly(path: string): boolean {
  return /(?:^|\/)(?:tests?|__tests__|fixtures)(?:\/|\.)|\.(?:test|spec)\.[^.]+$/.test(path);
}
const explicitValidator = new Ajv({ strict: true }).compile<{
  schemaVersion: string;
  entries: { path: string; kind: ShippedEntryPoint["kind"]; manifest: string }[];
}>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "entries"],
  properties: {
    schemaVersion: { const: "shipped-entry-points.v1" },
    entries: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "kind", "manifest"],
        properties: {
          path: { type: "string" },
          kind: {
            enum: ["package-export", "binary", "library", "application", "contract", "tool"],
          },
          manifest: { type: "string" },
        },
      },
    },
  },
});
export function findEntryPoints(snapshot: SourceSnapshot): EntryPointResult {
  validateSnapshot(snapshot);
  const entries: ShippedEntryPoint[] = [];
  const unresolved: UnresolvedObservation[] = [];
  function add(manifest: string, path: unknown, kind: ShippedEntryPoint["kind"]): void {
    if (typeof path !== "string") {
      unresolved.push({ source: snapshot.source, manifest, reason: "entrypoint-invalid" });
      return;
    }
    const resolved = resolveSourcePath(
      posix.dirname(manifest) === "." ? "" : posix.dirname(manifest),
      path,
    );
    if (!resolved || testOnly(resolved)) {
      unresolved.push({
        source: snapshot.source,
        manifest,
        reason: "entrypoint-unsafe-or-test-only",
      });
      return;
    }
    const matches = resolved.includes("*")
      ? Object.keys(snapshot.files).filter((file) => new Bun.Glob(resolved).match(file))
      : [resolved];
    if (!matches.length || matches.some((file) => !(file in snapshot.files) || testOnly(file))) {
      unresolved.push({ source: snapshot.source, manifest, reason: "entrypoint-missing" });
      return;
    }
    for (const file of matches)
      entries.push({ repository: snapshot.source, path: file, kind, manifest });
  }
  for (const [path, bytes] of Object.entries(snapshot.files).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (path.endsWith("package.json")) {
      const manifest = parseManifest(path, bytes);
      function exports(value: unknown): void {
        if (value === null) return;
        if (typeof value === "string") add(path, value, "package-export");
        else if (Array.isArray(value)) value.forEach(exports);
        else if (value && typeof value === "object") Object.values(value).forEach(exports);
        else throw new Error("manifest-invalid");
      }
      if ("exports" in manifest) exports(manifest.exports);
      else
        for (const key of ["main", "module", "types"])
          if (key in manifest) add(path, manifest[key], "package-export");
      if (typeof manifest.bin === "string") add(path, manifest.bin, "tool");
      else if (manifest.bin !== undefined)
        for (const value of Object.values(objectValue(manifest.bin))) add(path, value, "tool");
      if (manifest.scripts !== undefined) {
        const scripts = objectValue(manifest.scripts);
        for (const name of ["start", "serve", "dev"]) {
          const command = scripts[name];
          if (command === undefined) continue;
          if (typeof command !== "string") throw new Error("manifest-invalid");
          const match = /^(?:bun|node|tsx)\s+(?:run\s+)?([A-Za-z0-9_./-]+\.(?:[cm]?[jt]sx?))$/.exec(
            command,
          );
          if (match?.[1]) add(path, match[1], "application");
          else
            unresolved.push({
              source: snapshot.source,
              manifest: path,
              reason: "application-command-needs-entrypoint",
            });
        }
      }
    } else if (path.endsWith("Cargo.toml")) {
      const manifest = parseManifest(path, bytes);
      if (manifest.package === undefined) continue;
      const pkg = objectValue(manifest.package);
      const base = posix.dirname(path) === "." ? "" : posix.dirname(path);
      if (manifest.lib !== undefined)
        add(path, objectValue(manifest.lib).path ?? "src/lib.rs", "library");
      else if (pkg.autolib !== false && posix.join(base, "src/lib.rs") in snapshot.files)
        add(path, "src/lib.rs", "library");
      if (manifest.bin !== undefined) {
        if (!Array.isArray(manifest.bin)) throw new Error("manifest-invalid");
        for (const bin of manifest.bin) {
          const item = objectValue(bin);
          add(
            path,
            item.path ?? (typeof item.name === "string" ? `src/bin/${item.name}.rs` : null),
            "binary",
          );
        }
      }
      if (pkg.autobins !== false) {
        if (posix.join(base, "src/main.rs") in snapshot.files) add(path, "src/main.rs", "binary");
        for (const file of Object.keys(snapshot.files)) {
          const local = base ? file.slice(base.length + 1) : file;
          if (
            (!base || file.startsWith(`${base}/`)) &&
            /^src\/bin\/(?:[^/]+\.rs|[^/]+\/main\.rs)$/.test(local)
          )
            add(path, local, "binary");
        }
      }
    } else if (
      snapshot.source === "contracts" &&
      /^(?:contracts\/)?schemas\/.*\.schema\.json$/.test(path)
    )
      add(path, posix.basename(path), "contract");
  }
  const declaration = snapshot.files["migration/shipped-entry-points.v1.json"];
  if (declaration !== undefined) {
    const input = parseManifest("migration/shipped-entry-points.v1.json", declaration);
    if (!explicitValidator(input)) throw new Error("manifest-invalid");
    for (const item of input.entries) {
      if (
        resolveSourcePath("", item.path) !== item.path ||
        resolveSourcePath("", item.manifest) !== item.manifest ||
        !(item.manifest in snapshot.files) ||
        !/(?:^|\/)(?:package\.json|Cargo\.toml)$/.test(item.manifest)
      )
        throw new Error("manifest-invalid");
      const relative = posix.relative(posix.dirname(item.manifest), item.path);
      add(item.manifest, relative, item.kind);
    }
  }
  const unique = new Map(entries.map((entry) => [`${entry.path}:${entry.kind}`, entry]));
  return {
    entries: [...unique.values()].sort(
      (a, b) => a.path.localeCompare(b.path) || a.kind.localeCompare(b.kind),
    ),
    unresolved: unresolved.sort(
      (a, b) => a.manifest.localeCompare(b.manifest) || a.reason.localeCompare(b.reason),
    ),
  };
}
