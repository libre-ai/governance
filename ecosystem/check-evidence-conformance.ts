/**
 * Evidence recipe conformance gate.
 *
 * Context: `libre-ai/pi-evidence` records, for every change, which declared
 * checks ran, on which revision and by which model, with a verdict that
 * separates conformance to declared criteria from "no problem detected".
 * Without a declared recipe (`.evidence.json`) a repository can never be
 * better than `unverified`: the fleet dogfooding of 2026-09-15 found two
 * repositories out of three in that state. A recipe written by hand,
 * repository by repository, drifts the way AGENTS.md stubs and Dependabot
 * configurations did; this gate makes the governance template the only
 * authority, exactly as `check-dependabot-conformance` does.
 *
 * For every entry in `ecosystem/repositories.v1.yaml`, this gate verifies:
 *
 *   1. `lifecycle: archived` entries are exempt — asserted, never silently
 *      skipped: an archived repository refuses every write.
 *   2. The manifest set at `main` selects the template variant
 *      (`selectVariant`): `bun` when `package.json` exists, `cargo` when
 *      `Cargo.toml` exists, `bun-cargo` when both do. A repository with
 *      neither manifest has nothing to prove with a recipe: it is exempt,
 *      asserted as such, never graded as missing — the difference with the
 *      Dependabot gate, where a repository without workflows is "not a
 *      fleet member yet". A documentary repository is a fleet member with
 *      no executable check.
 *   3. `.evidence.json` exists at `main` and is byte-exact to the selected
 *      variant in `distribution/templates/evidence/`. A drift names the
 *      variant and the first differing line. Byte-exactness is deliberate:
 *      a repository that needs another recipe asks for a variant here.
 *   4. A repository the gate could not reach is reported as
 *      unable-to-verify — never as "missing".
 *
 * The three variants are formatted identically by Biome at line width 80
 * and 100 (verified 2026-09-15), so a consumer repository's formatter does
 * not turn the copy into a drift.
 *
 * Fetching reuses `check-context-conformance`'s GraphQL batch with its retry
 * and REST fallback, for the reason documented there.
 */

import {
  delay,
  fetchFile,
  type GhFetchResult,
  ghGraphQLRaw,
  ghWithRetry,
  hasUsableGraphQLData,
  parseRegistry,
  RETRY_DELAYS_MS,
  type RegistryEntry,
  type ReviewOutcome,
} from "./check-context-conformance";
import { firstDifference } from "./check-dependabot-conformance";

export const TEMPLATE_VARIANTS = ["bun", "cargo", "bun-cargo"] as const;
export type TemplateVariant = (typeof TEMPLATE_VARIANTS)[number];
export type EvidenceTemplates = Readonly<Record<TemplateVariant, string>>;

export const TEMPLATE_DIRECTORY = "distribution/templates/evidence";
export const CONFIG_PATH = ".evidence.json";

export async function loadTemplates(): Promise<EvidenceTemplates> {
  const entries = await Promise.all(
    TEMPLATE_VARIANTS.map(async (variant) => {
      const url = new URL(`../${TEMPLATE_DIRECTORY}/${variant}.json`, import.meta.url);
      return [variant, await Bun.file(url).text()] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<TemplateVariant, string>;
}

export interface ManifestPresence {
  readonly packageJson: boolean;
  readonly cargoToml: boolean;
}

/** The manifest set → variant table; `null` when there is nothing to run. */
export function selectVariant(manifests: ManifestPresence): TemplateVariant | null {
  if (manifests.packageJson && manifests.cargoToml) return "bun-cargo";
  if (manifests.packageJson) return "bun";
  if (manifests.cargoToml) return "cargo";
  return null;
}

export interface TemplateShape {
  readonly schema_version: number;
  readonly policy: string;
  readonly notes: string;
  readonly checks: readonly {
    readonly id: string;
    readonly command: string;
    readonly args: readonly string[];
    readonly required: boolean;
    readonly timeout_seconds: number;
  }[];
}

/** Parses a variant so the test suite can assert its recipe, not only its bytes. */
export function parseTemplate(text: string): TemplateShape {
  const parsed = JSON.parse(text) as TemplateShape;
  if (parsed.schema_version !== 1) throw new Error("template schema_version must be 1");
  if (!Array.isArray(parsed.checks) || parsed.checks.length === 0) {
    throw new Error("template must declare at least one check");
  }
  return parsed;
}

export interface RepoEvidenceState {
  readonly config: GhFetchResult;
  /** `null` exactly when the repository could not be reached at all. */
  readonly manifests: ManifestPresence | null;
  readonly fetchError: string | null;
}

export function reviewEvidence(
  entry: RegistryEntry,
  state: RepoEvidenceState,
  templates: EvidenceTemplates,
): ReviewOutcome {
  if (entry.lifecycle === "archived") {
    return {
      failures: [],
      notes: ["archived — content frozen read-only, conformance not applicable"],
      exempt: true,
    };
  }
  if (state.fetchError !== null || state.manifests === null) {
    return {
      failures: [
        `unable to verify ${CONFIG_PATH} at main: ${state.fetchError ?? "no manifest information recorded"}`,
      ],
      notes: [],
      exempt: false,
    };
  }
  const variant = selectVariant(state.manifests);
  if (variant === null) {
    return {
      failures: [],
      notes: ["no package.json nor Cargo.toml at main — no executable check to declare, exempt"],
      exempt: true,
    };
  }
  const templatePath = `${TEMPLATE_DIRECTORY}/${variant}.json`;
  if (state.config.error !== null) {
    return {
      failures: [`unable to verify ${CONFIG_PATH} at main: ${state.config.error}`],
      notes: [],
      exempt: false,
    };
  }
  if (state.config.text === null) {
    return {
      failures: [
        `${CONFIG_PATH} is missing at main — expected the ${variant} variant (${templatePath})`,
      ],
      notes: [],
      exempt: false,
    };
  }
  const difference = firstDifference(templates[variant], state.config.text);
  if (difference !== null) {
    return {
      failures: [
        `${CONFIG_PATH} differs from the ${variant} variant (${templatePath}) — first difference at line ${difference.line}: expected ${JSON.stringify(difference.expected)}, found ${JSON.stringify(difference.actual)}`,
      ],
      notes: [],
      exempt: false,
    };
  }
  return { failures: [], notes: [`byte-exact copy of the ${variant} variant`], exempt: false };
}

// --- GraphQL fleet batch (same shape as check-dependabot-conformance) ---

function repoAlias(index: number): string {
  return `repo${index}`;
}

export function buildBatchQuery(repositories: readonly string[]): string {
  const blocks = repositories.map((repository, index) => {
    const separator = repository.indexOf("/");
    if (separator < 0) {
      throw new Error(`malformed repository entry, expected "owner/name": ${repository}`);
    }
    const owner = JSON.stringify(repository.slice(0, separator));
    const name = JSON.stringify(repository.slice(separator + 1));
    return [
      `  ${repoAlias(index)}: repository(owner: ${owner}, name: ${name}) {`,
      `    config: object(expression: "main:${CONFIG_PATH}") { ... on Blob { text } }`,
      `    packageJson: object(expression: "main:package.json") { id }`,
      `    cargoToml: object(expression: "main:Cargo.toml") { id }`,
      `  }`,
    ].join("\n");
  });
  return `query {\n${blocks.join("\n")}\n}`;
}

interface GraphQLBlobNode {
  readonly text?: string | null;
}
interface GraphQLObjectNode {
  readonly id?: string;
}
interface GraphQLRepoNode {
  readonly config?: GraphQLBlobNode | null;
  readonly packageJson?: GraphQLObjectNode | null;
  readonly cargoToml?: GraphQLObjectNode | null;
}

const GRAPHQL_UNRESOLVED_REPO =
  "repository not resolvable via GraphQL (see check-inventory-drift for real deletions/renames)";

export function parseBatchResponse(
  repositories: readonly string[],
  data: Readonly<Record<string, unknown>> | undefined,
): Map<string, RepoEvidenceState> {
  const result = new Map<string, RepoEvidenceState>();
  repositories.forEach((repository, index) => {
    const node = (data?.[repoAlias(index)] ?? null) as GraphQLRepoNode | null;
    if (node === null) {
      result.set(repository, {
        config: { text: null, error: GRAPHQL_UNRESOLVED_REPO },
        manifests: null,
        fetchError: GRAPHQL_UNRESOLVED_REPO,
      });
      return;
    }
    result.set(repository, {
      config: { text: node.config?.text ?? null, error: null },
      manifests: {
        packageJson: node.packageJson != null,
        cargoToml: node.cargoToml != null,
      },
      fetchError: null,
    });
  });
  return result;
}

async function fetchFleetViaGraphQL(
  repositories: readonly string[],
): Promise<Map<string, RepoEvidenceState> | null> {
  const query = buildBatchQuery(repositories);
  let lastError = "";
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const { stdout, stderr, exitCode } = await ghGraphQLRaw(query);
    try {
      const parsed: unknown = JSON.parse(stdout);
      if (hasUsableGraphQLData(parsed)) {
        return parseBatchResponse(repositories, parsed.data);
      }
    } catch {
      // Not valid JSON — fall through to retry/backoff.
    }
    lastError = stderr.trim() || `gh api graphql failed (exit ${exitCode})`;
    const wait = RETRY_DELAYS_MS[attempt];
    if (wait !== undefined) await delay(wait);
  }
  console.error(
    `GraphQL fleet batch failed after ${RETRY_DELAYS_MS.length + 1} attempt(s), falling back to per-repository REST: ${lastError}`,
  );
  return null;
}

async function existsViaRest(
  repository: string,
  path: string,
): Promise<{ readonly present: boolean; readonly error: string | null }> {
  const result = await ghWithRetry(["api", `repos/${repository}/contents/${path}?ref=main`]);
  if (result.error !== null) return { present: false, error: result.error };
  return { present: result.text !== null, error: null };
}

async function fetchFleetViaRest(
  repositories: readonly string[],
): Promise<Map<string, RepoEvidenceState>> {
  const result = new Map<string, RepoEvidenceState>();
  for (const repository of repositories) {
    const [packageJson, cargoToml] = await Promise.all([
      existsViaRest(repository, "package.json"),
      existsViaRest(repository, "Cargo.toml"),
    ]);
    const manifestError = packageJson.error ?? cargoToml.error;
    if (manifestError !== null) {
      result.set(repository, {
        config: { text: null, error: manifestError },
        manifests: null,
        fetchError: manifestError,
      });
      continue;
    }
    const config = await fetchFile(repository, CONFIG_PATH);
    result.set(repository, {
      config,
      manifests: { packageJson: packageJson.present, cargoToml: cargoToml.present },
      fetchError: null,
    });
  }
  return result;
}

async function fetchFleetEvidence(
  repositories: readonly string[],
): Promise<Map<string, RepoEvidenceState>> {
  return (await fetchFleetViaGraphQL(repositories)) ?? (await fetchFleetViaRest(repositories));
}

if (import.meta.main) {
  const { concludeGate, GateReport } = await import("../tools/quality/gate-report");
  const registry = parseRegistry(await Bun.file("ecosystem/repositories.v1.yaml").text());
  const templates = await loadTemplates();
  const fleet = await fetchFleetEvidence(registry.map((entry) => entry.repository));

  const report = new GateReport();
  for (const entry of registry) {
    const state = fleet.get(entry.repository) ?? {
      config: { text: null, error: "no fetch outcome recorded for this repository" },
      manifests: null,
      fetchError: "no fetch outcome recorded for this repository",
    };
    const outcome = reviewEvidence(entry, state, templates);
    const ok = outcome.failures.length === 0;
    report.check(entry.repository, ok, ok ? outcome.notes.join("; ") : outcome.failures.join("; "));
  }

  concludeGate("Evidence recipe conformance", report);
}
