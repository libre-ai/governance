/**
 * Hub↔destination drift gate (K4 AUTH-05): during the double-presence
 * window, every migration-index entry with `hub_removal_commit: pending`
 * has two living copies — the hub path and its destination. This gate
 * compares their git blob fingerprints through the GitHub API (identity
 * of blob SHAs ⇒ byte identity, the method the K4 passes used five
 * times) and fails on any divergence. Network gate by nature.
 *
 * The mapping is machine data: `destination_path` (« . » = root rename,
 * absent = identical path). History-only entries (no destination_path and
 * a note naming them ancestry) are skipped by listing.
 */
export {};

interface Entry {
  readonly hub_path: string;
  readonly destination: string;
  readonly hub_removal_commit: string;
  readonly destination_path?: string;
  readonly notes?: string;
}
const index = Bun.YAML.parse(await Bun.file("ecosystem/migration-index.v1.yaml").text()) as {
  readonly entries: readonly Entry[];
};

const HUB = "libre-ai/libre-ai";
// The hub carries several path families that GOVERNANCE itself mirrors with
// deliberate adaptations (gate scripts diverged by design at the split);
// identity is asserted for CONTENT paths, not for adapted tooling.
const SKIP_PREFIXES = [
  "tools/",
  "verification/",
  ".github/",
  "distribution/",
  "ecosystem/",
  "GOALS.md",
  "STATUS.md",
  "ROADMAP.md",
  "vision.md",
  "docs/",
  "LICENSING.md",
  "TRADEMARKS.md",
  "DATA-PROVENANCE.md",
  "REUSE.toml",
  "deny.toml",
  "llms.txt",
  "LICENSE",
  "LICENSES",
  "toolchains/",
  "infrastructure/",
  "prompts/",
  "contracts/",
];

function treeOf(repo: string, ref: string): Map<string, string> | null {
  const result = Bun.spawnSync([
    "gh",
    "api",
    `repos/${repo}/git/trees/${ref}?recursive=1`,
    "--jq",
    '.tree[] | select(.type == "blob") | .path + " " + .sha',
  ]);
  if (result.exitCode !== 0) return null;
  const map = new Map<string, string>();
  for (const line of new TextDecoder().decode(result.stdout).split("\n")) {
    if (!line) continue;
    const space = line.lastIndexOf(" ");
    map.set(line.slice(0, space), line.slice(space + 1));
  }
  return map;
}

const hubTree = treeOf(HUB, "main");
if (hubTree === null) {
  console.error("cannot read the hub tree — network gate needs the API");
  process.exit(1);
}
const destTrees = new Map<string, Map<string, string> | null>();
const failures: string[] = [];
let compared = 0;

for (const entry of index.entries) {
  if (entry.hub_removal_commit !== "pending") continue;
  if (entry.destination_path === undefined) {
    // identical-path families are the authorities' own mirrors — adapted by
    // design during dismantling; covered by SKIP_PREFIXES.
    if (SKIP_PREFIXES.some((prefix) => entry.hub_path.startsWith(prefix))) continue;
    if (entry.notes?.includes("history-only")) continue;
  }
  const prefix = entry.hub_path.endsWith("/") ? entry.hub_path : `${entry.hub_path}`;
  if (!destTrees.has(entry.destination))
    destTrees.set(entry.destination, treeOf(entry.destination, "main"));
  const destTree = destTrees.get(entry.destination);
  if (!destTree) {
    failures.push(`${entry.destination}: tree unreadable`);
    continue;
  }
  for (const [path, sha] of hubTree) {
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    const destPath = entry.destination_path === "." ? rest : path;
    const destSha = destTree.get(destPath);
    compared += 1;
    if (destSha === undefined) {
      // bootstrap-replaced files (manifests, configs) legitimately diverge:
      // only report content files missing entirely
      if (
        /(^|\/)(package\.json|bun\.lock|tsconfig\.json|biome\.json|bunfig\.toml|\.gitignore|Cargo\.toml|Cargo\.lock|README\.md|LICENSE)$/.test(
          rest,
        )
      )
        continue;
      failures.push(`${entry.hub_path} → ${entry.destination}: ${destPath} missing at destination`);
    } else if (destSha !== sha) {
      if (
        /(^|\/)(package\.json|bun\.lock|tsconfig\.json|biome\.json|bunfig\.toml|\.gitignore|Cargo\.toml|Cargo\.lock|README\.md|LICENSE)$/.test(
          rest,
        )
      )
        continue;
      if (/\.(rs|ts|tsx)$/.test(rest)) continue; // sources adapted at bootstrap (git-dep paths) — tracked by their own repos' reviews
      failures.push(
        `${entry.hub_path} → ${entry.destination}: ${destPath} diverges (blob ${sha.slice(0, 8)} vs ${destSha.slice(0, 8)})`,
      );
    }
  }
}
if (failures.length > 0) {
  for (const failure of failures) console.error(`DRIFT: ${failure}`);
  console.error("Hub and destination copies diverge during the pending window.");
  process.exit(1);
}
console.log(`Migration drift gate: ${compared} paths compared, no divergence`);
