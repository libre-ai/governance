/**
 * Hub orphan gate (γ 3.7, design §3.6/§7.2 — « rien n'est perdu »).
 *
 * Every path still tracked in the hub archive must be accounted for:
 * covered by a migration-index entry (prefix or exact), listed in a
 * replacements entry, recorded in the forgetting register, or named in the
 * ARCHIVE_RESIDUALS list below. A tracked hub path matching none of these
 * is an orphan — content that would silently die with the archive — and
 * fails the gate.
 */

export const ARCHIVE_RESIDUALS: ReadonlySet<string> = new Set([
  // The archive's own identity and machine registers.
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "LICENSE",
  "REUSE.toml",
  ".gitignore",
  ".github/CODEOWNERS",
  // The two remaining workflows and the minimal chain that keeps the
  // archive verifiable (manifests, configs, the quality-tool remainder).
  ".github/workflows/ci.yml",
  ".github/workflows/context-hygiene.yml",
  "package.json",
  "bun.lock",
  "bunfig.toml",
  "biome.json",
  "tsconfig.json",
]);

export const RESIDUAL_PREFIXES: readonly string[] = [
  // Licence texts referenced by the remaining annotations.
  "LICENSES/",
  // Registers the archive owns (the index, the forgetting register, the card).
  "ecosystem/",
  // The minimal chain tools — their canonical copies live here in governance
  // (tools/ index entry, dual presence kept so the archive stays runnable).
  "tools/quality/",
  // Toolchain policy and notices: dual presence kept so the archive chain
  // stays self-verifiable (canonical copy adopted here, §5.4.3).
  "toolchains/",
];

export interface OrphanReport {
  readonly covered: number;
  readonly orphans: readonly string[];
}

export function findOrphans(
  hubPaths: readonly string[],
  indexPrefixes: readonly string[],
  replacementPaths: readonly string[],
  forgottenPaths: readonly string[],
): OrphanReport {
  const orphans: string[] = [];
  let covered = 0;
  for (const path of hubPaths) {
    const accounted =
      ARCHIVE_RESIDUALS.has(path) ||
      RESIDUAL_PREFIXES.some((p) => path.startsWith(p)) ||
      indexPrefixes.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p)) ||
      replacementPaths.includes(path) ||
      forgottenPaths.some((p) => path === p || path.startsWith(`${p}/`));
    if (accounted) covered += 1;
    else orphans.push(path);
  }
  return { covered, orphans };
}

/** Two retries beyond the first attempt — 1s then 3s — same budget as this file's neighbors. */
const RETRY_DELAYS_MS = [1000, 3000];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GhFetchResult {
  readonly lines: string[] | null;
  readonly error: string | null;
}

/** Three fixed requests total (hub tree, migration index, FORGOTTEN.yaml) — a retried REST call is enough, no GraphQL batch needed. */
async function linesOfWithRetry(spawn: readonly string[]): Promise<GhFetchResult> {
  let lastError = "";
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const result = Bun.spawnSync([...spawn], { stdout: "pipe", stderr: "pipe" });
    if (result.exitCode === 0) {
      return {
        lines: new TextDecoder()
          .decode(result.stdout)
          .split("\n")
          .filter((l) => l.length > 0),
        error: null,
      };
    }
    const stderr = new TextDecoder().decode(result.stderr).trim();
    lastError = stderr || `${spawn.join(" ")} failed (exit ${result.exitCode})`;
    const wait = RETRY_DELAYS_MS[attempt];
    if (wait !== undefined) await delay(wait);
  }
  return { lines: null, error: lastError };
}

if (import.meta.main) {
  const hubPathsResult = await linesOfWithRetry([
    "gh",
    "api",
    "repos/libre-ai/libre-ai/git/trees/main?recursive=1",
    "--jq",
    '.tree[] | select(.type == "blob") | .path',
  ]);
  if (hubPathsResult.lines === null) {
    console.error(`unable to verify the hub tree — ${hubPathsResult.error}`);
    process.exit(1);
  }
  const hubPaths = hubPathsResult.lines;
  const indexResult = await linesOfWithRetry([
    "gh",
    "api",
    "repos/libre-ai/libre-ai/contents/ecosystem/migration-index.v1.yaml?ref=main",
    "-H",
    "Accept: application/vnd.github.raw+json",
  ]);
  const forgottenResult = await linesOfWithRetry([
    "gh",
    "api",
    "repos/libre-ai/libre-ai/contents/ecosystem/FORGOTTEN.yaml?ref=main",
    "-H",
    "Accept: application/vnd.github.raw+json",
  ]);
  if (indexResult.lines === null || forgottenResult.lines === null) {
    console.error(
      `unable to verify the hub registers — index: ${indexResult.error ?? "ok"}; forgotten: ${forgottenResult.error ?? "ok"}`,
    );
    process.exit(1);
  }
  const indexText = indexResult.lines;
  const forgottenText = forgottenResult.lines;
  const yamlApi = (Bun as unknown as { YAML: { parse(t: string): unknown } }).YAML;
  const index = yamlApi.parse(indexText.join("\n")) as {
    entries: readonly { hub_path: string }[];
    replacements: readonly { hub_paths: readonly string[] }[];
  };
  const forgotten = yamlApi.parse(forgottenText.join("\n")) as {
    entries?: readonly { evicted_paths?: readonly string[] }[];
  };
  const report = findOrphans(
    hubPaths,
    index.entries.map((e) => e.hub_path),
    index.replacements.flatMap((r) => [...r.hub_paths]),
    (forgotten.entries ?? []).flatMap((e) => [...(e.evicted_paths ?? [])]),
  );
  const { concludeGate, GateReport } = await import("../tools/quality/gate-report");
  const gate = new GateReport();
  for (const orphan of report.orphans) {
    gate.check(orphan, false, "hub path with no destination, replacement or eviction");
  }
  if (report.orphans.length === 0) {
    // The coverage ratio is the verdict's evidence: zero tracked paths would
    // mean the hub listing itself broke, and that is a red, not a green.
    gate.check(
      "hub tracked paths",
      hubPaths.length > 0,
      hubPaths.length > 0
        ? `${report.covered}/${hubPaths.length} accounted for by a destination, replacement or eviction`
        : "the hub listing returned no path — the reconciliation asserted nothing",
    );
  }
  concludeGate("Hub orphans", gate);
}
