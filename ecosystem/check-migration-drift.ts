interface Entry {
  readonly hub_path: string;
  readonly destination: string;
  readonly hub_removal_commit: string;
  readonly destination_path?: string;
  readonly notes?: string;
}

/**
 * Every file adapted at bootstrap, one line each, with its mechanism.
 * Reviewed in the K4 drift-gate pass (verdict DRIFT-01): 32 sources, all
 * root-path readers redirected to pinned git-deps or vendored copies.
 */
export const ADAPTED_FILES: ReadonlySet<string> = new Set([
  // governance — hub-side dismantling adjustments (γ 3.7, design §5.4.2):
  // the hub copies of these two gates shrink with the hub tree while the
  // canonical copies here keep the full fleet shape.
  "libre-ai/governance:tools/quality/check-bun-manifests.ts",
  "libre-ai/governance:tools/quality/check-retired-names.ts",
  "libre-ai/governance:tools/quality/check-declared-licenses.ts",
  // toolchain re-hosting (design §5.4.3): the canonical policy here points
  // the governance release URL; the hub copy keeps the archived original.
  "libre-ai/governance:toolchains/bun.json",
  // sdk-ts — authority read through the pinned contracts git-dep
  "libre-ai/sdk-ts:scripts/generate-types.ts",
  "libre-ai/sdk-ts:scripts/sync-schemas.ts",
  "libre-ai/sdk-ts:scripts/sync-schemas.test.ts",
  "libre-ai/sdk-ts:src/agent-review-quorum.test.ts",
  "libre-ai/sdk-ts:src/agent-signatures.test.ts",
  "libre-ai/sdk-ts:src/orchestrator-event-chain.test.ts",
  "libre-ai/sdk-ts:src/registry.test.ts",
  "libre-ai/sdk-ts:src/registry.ts",
  // sdk-rs — schemas vendored, vector fixtures via the pinned git-dep
  "libre-ai/sdk-rs:build.rs",
  "libre-ai/sdk-rs:tests/event_chain_vectors.rs",
  "libre-ai/sdk-rs:tests/orchestration_digest_vectors.rs",
  "libre-ai/sdk-rs:tests/policy_core_vectors.rs",
  "libre-ai/sdk-rs:tests/quorum_vectors.rs",
  "libre-ai/sdk-rs:tests/schema_fixtures.rs",
  // authz-biscuit — datalog vendored (include_str! needs committed copies)
  "libre-ai/authz-biscuit:src/authorize.rs",
  "libre-ai/authz-biscuit:src/token.rs",
  "libre-ai/authz-biscuit:tests/authz.rs",
  // ecosystem-engine — two authority pins, vendored + git-dep fixtures
  "libre-ai/ecosystem-engine:src/graph.rs",
  "libre-ai/ecosystem-engine:tests/agent_run_authorization.rs",
  "libre-ai/ecosystem-engine:tests/biscuit_policies.rs",
  "libre-ai/ecosystem-engine:tests/public_projection.rs",
  "libre-ai/ecosystem-engine:tests/wit_contracts.rs",
  // knowledge — canonical root redirected to the governance git-dep
  "libre-ai/knowledge:src/projection.ts",
  "libre-ai/knowledge:src/projection.test.ts",
  // auth — peerDependencies pattern + lint fixes at bootstrap
  "libre-ai/auth:src/oidc/jws.ts",
  "libre-ai/auth:e2e/auth.e2e.ts",
  "libre-ai/auth:e2e/serve-e2e.ts",
  "libre-ai/auth:src/http/handlers.test.ts",
  "libre-ai/auth:src/http/handlers.ts",
  // data — retention contract via the pinned contracts git-dep
  "libre-ai/data:src/retention-sweep.ts",
  // ui — DTCG schema path follows the vendored third_party tree
  "libre-ai/ui:color-system/generated-assets.test.ts",
  // orchestrator — vector fixtures via the pinned contracts git-dep
  "libre-ai/orchestrator:tests/locked_event_vectors.rs",
  // starter — template pins the bricks + lint fixes at bootstrap
  "libre-ai/starter:starter/e2e/journal.e2e.ts",
  "libre-ai/starter:starter/src/server/handler.ts",
]);

/** Bootstrap-replaced manifests: owned by each repository from birth. */
const BOOTSTRAP_FILES =
  /(^|\/)(package\.json|bun\.lock|tsconfig\.json|biome\.json|bunfig\.toml|\.gitignore|Cargo\.toml|Cargo\.lock|README\.md|LICENSE|rust-toolchain\.toml|deny\.toml|REUSE\.toml)$/;

/** Authority families the governance/contracts repos adapted by design at the split. */
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
];

export interface Comparison {
  readonly asserted: number;
  readonly excludedAdapted: number;
  readonly excludedBootstrap: number;
  readonly failures: readonly string[];
}

export interface DriftVerdict {
  readonly ok: boolean;
  readonly message: string;
}

/**
 * Anti-inertness control, plus the honest end state.
 *
 * This gate reported success while asserting nothing: its skip list had grown
 * to cover every family still present on both sides, so "no divergence found"
 * and "nothing was compared" printed the same line and exited the same way.
 * A run whose assertion count can reach zero without failing measures only
 * itself. Declared adaptations and bootstrap exclusions never count — they are
 * precisely the paths the gate agreed NOT to compare.
 *
 * The dual-presence window closes when the hub is archived: what remains on
 * both sides is the archive's own runtime, frozen forever, while the canonical
 * copies here go on evolving. Asserting byte-equality against a frozen tree
 * would then tax every future edit with an adaptation entry and prove nothing.
 * So a closed window is reported as such — never dressed up as a check.
 */
export function driftVerdict(summary: {
  readonly windowClosed: boolean;
  readonly asserted: number;
  readonly adaptations: number;
  readonly bootstrap: number;
  readonly failures: readonly string[];
}): DriftVerdict {
  if (summary.failures.length > 0) {
    // Not every failure is a divergence: a phantom adaptation and an unreadable
    // tree land here too, and saying "diverge during the pending window" when
    // the window is closed is the same class of untruth this gate is fixing.
    return {
      ok: false,
      message: summary.windowClosed
        ? "Migration drift gate failed with the dual-presence window closed — read the DRIFT lines above; they are not divergences."
        : "Hub and destination copies diverge during the pending window.",
    };
  }
  if (summary.windowClosed) {
    return {
      ok: true,
      message:
        "Migration drift gate: the hub is archived, the dual-presence window is closed — nothing left to assert. Retiring or repurposing this gate is an owner decision on the record.",
    };
  }
  if (summary.asserted === 0) {
    return {
      ok: false,
      message:
        "Migration drift gate asserted no path while the window is open — every candidate was skipped or adapted, so this run proves nothing. Narrow SKIP_PREFIXES.",
    };
  }
  return {
    ok: true,
    message: `Migration drift gate: ${summary.asserted} paths asserted byte-identical, ${summary.adaptations} listed adaptations, ${summary.bootstrap} bootstrap manifests excluded — no divergence`,
  };
}

export function compareTrees(
  entry: Entry,
  hubTree: ReadonlyMap<string, string>,
  destTree: ReadonlyMap<string, string>,
): Comparison {
  const prefix = entry.hub_path;
  const failures: string[] = [];
  let asserted = 0;
  let excludedAdapted = 0;
  let excludedBootstrap = 0;
  for (const [path, sha] of hubTree) {
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    const destPath = entry.destination_path === "." ? rest : path;
    if (BOOTSTRAP_FILES.test(rest)) {
      excludedBootstrap += 1;
      continue;
    }
    if (ADAPTED_FILES.has(`${entry.destination}:${destPath}`)) {
      excludedAdapted += 1;
      continue;
    }
    asserted += 1;
    const destSha = destTree.get(destPath);
    if (destSha === undefined) {
      failures.push(`${entry.hub_path} → ${entry.destination}: ${destPath} missing at destination`);
    } else if (destSha !== sha) {
      failures.push(
        `${entry.hub_path} → ${entry.destination}: ${destPath} diverges (blob ${sha.slice(0, 8)} vs ${destSha.slice(0, 8)})`,
      );
    }
  }
  return { asserted, excludedAdapted, excludedBootstrap, failures };
}

/** Two retries beyond the first attempt — 1s then 3s — same budget as this file's neighbors (ecosystem/check-fleet-pins.ts et al). */
const RETRY_DELAYS_MS = [1000, 3000];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GhFetchResult {
  readonly text: string | null;
  readonly error: string | null;
}

/**
 * Both call sites below make one fixed request each (the hub migration
 * index, and one tree per distinct destination repository the index
 * names — a handful, not the whole fleet), so a retried REST call is
 * enough here; no GraphQL batch, unlike the fleet-wide sweeps beside this
 * gate in the same CI job.
 */
async function ghWithRetry(args: readonly string[]): Promise<GhFetchResult> {
  let lastError = "";
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const result = Bun.spawnSync(["gh", ...args], { stdout: "pipe", stderr: "pipe" });
    if (result.exitCode === 0) {
      return { text: new TextDecoder().decode(result.stdout), error: null };
    }
    const stderr = new TextDecoder().decode(result.stderr).trim();
    if (stderr.includes("(HTTP 404)")) return { text: null, error: null };
    lastError = stderr || `gh ${args.join(" ")} failed (exit ${result.exitCode})`;
    const wait = RETRY_DELAYS_MS[attempt];
    if (wait !== undefined) await delay(wait);
  }
  return { text: null, error: lastError };
}

async function treeOf(
  repo: string,
  ref: string,
): Promise<Map<string, string> | { readonly error: string }> {
  const result = await ghWithRetry([
    "api",
    `repos/${repo}/git/trees/${ref}?recursive=1`,
    "--jq",
    '.tree[] | select(.type == "blob") | .path + " " + .sha',
  ]);
  if (result.error !== null) return { error: result.error };
  const map = new Map<string, string>();
  for (const line of (result.text ?? "").split("\n")) {
    if (!line) continue;
    const space = line.lastIndexOf(" ");
    map.set(line.slice(0, space), line.slice(space + 1));
  }
  return map;
}

if (import.meta.main) {
  // The hub owns the migration index — the copy in this repository is the
  // snapshot that travelled with `ecosystem/` at γ 3.3 and has not advanced
  // since (56 entries, all `pending`, against the authority's 88 with 5).
  // Reading it here is what made every entry look in-flight and every path
  // skippable. The orphan gate already reads the authority live; so does this
  // one now.
  const indexRead = await ghWithRetry([
    "api",
    "repos/libre-ai/libre-ai/contents/ecosystem/migration-index.v1.yaml",
    "-H",
    "Accept: application/vnd.github.raw+json",
  ]);
  if (indexRead.text === null) {
    console.error(
      `unable to verify the hub migration index — ${indexRead.error ?? "not found at main"}`,
    );
    process.exit(1);
  }
  const index = Bun.YAML.parse(indexRead.text) as {
    readonly hub_state?: string;
    readonly entries: readonly Entry[];
  };
  const windowClosed = index.hub_state === "archived";
  const hubTreeResult = await treeOf("libre-ai/libre-ai", "main");
  if ("error" in hubTreeResult) {
    console.error(`unable to verify the hub tree — ${hubTreeResult.error}`);
    process.exit(1);
  }
  const hubTree = hubTreeResult;
  const destTrees = new Map<string, Map<string, string> | { readonly error: string }>();
  const failures: string[] = [];
  let asserted = 0;
  let bootstrap = 0;
  let seenAdaptations = 0;
  for (const entry of index.entries) {
    if (entry.hub_removal_commit !== "pending") continue;
    if (entry.destination_path === undefined) {
      // contracts/ is canonical DATA and stays asserted (DRIFT-04); the
      // adapted authority tooling families are skipped by listing.
      if (
        entry.hub_path !== "contracts/" &&
        SKIP_PREFIXES.some((p) => entry.hub_path.startsWith(p))
      )
        continue;
      if (entry.notes?.includes("history-only")) continue;
    }
    if (!destTrees.has(entry.destination)) {
      destTrees.set(entry.destination, await treeOf(entry.destination, "main"));
    }
    const destTree = destTrees.get(entry.destination) as
      | Map<string, string>
      | { readonly error: string };
    if ("error" in destTree) {
      failures.push(`unable to verify ${entry.destination} tree — ${destTree.error}`);
      continue;
    }
    const result = compareTrees(entry, hubTree, destTree);
    asserted += result.asserted;
    seenAdaptations += result.excludedAdapted;
    bootstrap += result.excludedBootstrap;
    failures.push(...result.failures);
  }
  // Anti-phantom control (K4 DRIFT-R2-01, amended for the removal waves of
  // γ 3.7): a listed adaptation not seen on the hub side is still alive if
  // the adapted file exists at its destination — the hub source left with
  // its removal wave. It is a phantom only when it exists NOWHERE.
  if (seenAdaptations < ADAPTED_FILES.size) {
    const seenKeys = new Set<string>();
    for (const [path] of hubTree) {
      for (const entry of index.entries) {
        if (!path.startsWith(entry.hub_path)) continue;
        const rest = path.slice(entry.hub_path.length);
        const destPath = entry.destination_path === "." ? rest : path;
        seenKeys.add(`${entry.destination}:${destPath}`);
      }
    }
    for (const key of ADAPTED_FILES) {
      if (seenKeys.has(key)) continue;
      const colon = key.indexOf(":");
      const repo = key.slice(0, colon);
      const destPath = key.slice(colon + 1);
      if (!destTrees.has(repo)) destTrees.set(repo, await treeOf(repo, "main"));
      const destTree = destTrees.get(repo);
      if (destTree !== undefined && "error" in destTree) {
        failures.push(`unable to verify ${repo} tree — ${destTree.error}`);
        continue;
      }
      if (destTree?.has(destPath)) continue;
      failures.push(
        `adaptation ${key} matches no hub path and is absent at destination — remove the phantom entry`,
      );
    }
  }
  const verdict = driftVerdict({
    windowClosed,
    asserted,
    adaptations: seenAdaptations,
    bootstrap,
    failures,
  });
  if (!verdict.ok) {
    for (const failure of failures) console.error(`DRIFT: ${failure}`);
    console.error(verdict.message);
    process.exit(1);
  }
  console.log(verdict.message);
}
