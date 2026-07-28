// Retired tooling names are never reused as a repository, package or crate
// (ADR-0008 §3, restated by LEXICON §6.1). The rename
// `packages/design-system` -> `packages/ui` was the first action of wave 1 and
// closed the I-04 drift recorded in LEXICON §2.1; a directory or manifest that
// carries a retired name reopens it. The guard is structural on purpose: the
// doctrine forbids reusing these names as *identifiers*, not mentioning them in
// the historical registers (LEGACY-MANIFEST, REPOSITORY-MAP, ADR-0008, LEXICON),
// which must keep naming them to stay readable.

export const RETIRED_TOOLING_NAMES = [
  "agent-factory",
  "artifact-supply",
  "client-kit",
  "context-kit",
  "design-system",
  "dioxus-app-template",
  "gear",
  "proof-kit",
] as const;

// `website` and `benchmarks` are absent by design: ADR-0008 retires them as
// *repositories* while REPOSITORY-MAP keeps `apps/website` and
// `verification/benchmarks` as legitimate in-hub destinations.

export interface RetiredNameEntry {
  /** Where the identifier was found, for the failure message. */
  location: string;
  /** Directory name, or manifest `name` field (npm scope already stripped). */
  identifier: string;
}

export interface RetiredNameFinding extends RetiredNameEntry {
  retired: string;
}

const retired = new Set<string>(RETIRED_TOOLING_NAMES);

/** Strips an npm scope so `@libre-ai/design-system` compares as `design-system`. */
export function bareIdentifier(name: string): string {
  return name.startsWith("@") ? (name.split("/")[1] ?? name) : name;
}

export function scanForRetiredNames(entries: readonly RetiredNameEntry[]): RetiredNameFinding[] {
  const findings: RetiredNameFinding[] = [];
  for (const entry of entries) {
    const identifier = bareIdentifier(entry.identifier);
    if (retired.has(identifier)) findings.push({ ...entry, retired: identifier });
  }
  return findings;
}

if (import.meta.main) {
  const entries: RetiredNameEntry[] = [];

  // Workspace directories: the three families ADR-0008 §3 names (package, crate,
  // application). A directory is scanned whatever it contains — an orphan left
  // by a rename is exactly the drift this guard exists to catch.
  for (const family of ["apps", "crates", "packages"]) {
    const glob = new Bun.Glob("*");
    for await (const name of glob.scan({ cwd: family, onlyFiles: false })) {
      if (name.includes("/") || name.includes(".")) continue;
      entries.push({ location: `${family}/${name}`, identifier: name });
    }
  }

  // Declared package and crate names, which outlive a directory rename.
  const manifests = new Bun.Glob("{apps,packages,distribution/templates}/*/package.json");
  for await (const path of manifests.scan({ cwd: ".", onlyFiles: true })) {
    const manifest = (await Bun.file(path).json()) as { name?: string };
    if (manifest.name) entries.push({ location: path, identifier: manifest.name });
  }

  const crateManifests = new Bun.Glob("crates/*/Cargo.toml");
  for await (const path of crateManifests.scan({ cwd: ".", onlyFiles: true })) {
    const source = await Bun.file(path).text();
    const declared = /^\s*name\s*=\s*"([^"]+)"/m.exec(source)?.[1];
    if (declared) entries.push({ location: path, identifier: declared });
  }

  const findings = scanForRetiredNames(entries);
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(
        `${finding.location}: "${finding.retired}" is a retired tooling name (ADR-0008 §3) — it is never reused as a repository, package or crate`,
      );
    }
    process.exit(1);
  }

  console.log(
    `Retired names verified: ${entries.length} workspace identifiers carry none of the ${RETIRED_TOOLING_NAMES.length} retired tooling names`,
  );
}
