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

if (import.meta.main) {
  const index = Bun.YAML.parse(await Bun.file("ecosystem/migration-index.v1.yaml").text()) as {
    readonly entries: readonly Entry[];
  };
  const hubTree = treeOf("libre-ai/libre-ai", "main");
  if (hubTree === null) {
    console.error("cannot read the hub tree — network gate needs the API");
    process.exit(1);
  }
  const destTrees = new Map<string, Map<string, string> | null>();
  const failures: string[] = [];
  let asserted = 0;
  const adapted = 0;
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
    if (!destTrees.has(entry.destination))
      destTrees.set(entry.destination, treeOf(entry.destination, "main"));
    const destTree = destTrees.get(entry.destination);
    if (!destTree) {
      failures.push(`${entry.destination}: tree unreadable`);
      continue;
    }
    const result = compareTrees(entry, hubTree, destTree);
    asserted += result.asserted;
    seenAdaptations += result.excludedAdapted;
    bootstrap += result.excludedBootstrap;
    failures.push(...result.failures);
  }
  // Anti-phantom control (K4 DRIFT-R2-01): a listed adaptation that matches
  // no hub path is an exception without an object — it would silently
  // exclude a future file nobody decided to exclude.
  if (seenAdaptations < ADAPTED_FILES.size) {
    failures.push(
      `${ADAPTED_FILES.size - seenAdaptations} listed adaptation(s) match no pending hub path — remove the phantom entries`,
    );
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error(`DRIFT: ${failure}`);
    console.error("Hub and destination copies diverge during the pending window.");
    process.exit(1);
  }
  console.log(
    `Migration drift gate: ${asserted} paths asserted byte-identical, ${seenAdaptations} listed adaptations, ${bootstrap} bootstrap manifests excluded — no divergence`,
  );
}
