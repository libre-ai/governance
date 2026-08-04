/**
 * Fleet presentation gate (γ 3.6, design §6.4/§7.1).
 *
 * For every repository of the topological index that declares a `card`, fetch
 * `project.v1.yaml` and `README.md` at `main` and verify: the card validates
 * against the project.v1 schema, its progress is computable or honestly
 * non-computable, and the README status section between the sentinels is
 * byte-identical to what the card generates. A missing declared card, an
 * invalid card or a divergent README is a failure — generated presentation is
 * never allowed to drift from its authority.
 *
 * The hub (`role: hub`) is exempt from the README check only: its card lives
 * under ecosystem/cards/ and its README is replaced by the migration index as
 * the repository empties. Entries without a `card` field (the org profile)
 * are reported and skipped, never silently ignored.
 */
import { checkStatusSection, validateCard } from "./project-cards";

export interface FleetEntry {
  readonly repository: string;
  readonly role: string;
  readonly card?: string;
}

export interface RepoDocuments {
  readonly card: string | null;
  readonly readme: string | null;
}

export type Fetcher = (repository: string, path: string) => string | null;

export function reviewRepository(
  entry: FleetEntry,
  fetchFile: Fetcher,
): { readonly failures: readonly string[]; readonly skipped: boolean } {
  if (entry.card === undefined) {
    return { failures: [], skipped: true };
  }
  const failures: string[] = [];
  const cardText = fetchFile(entry.repository, entry.card);
  if (cardText === null) {
    return {
      failures: [`${entry.repository}: declared card ${entry.card} is missing at main`],
      skipped: false,
    };
  }
  let card: unknown;
  try {
    card = (Bun as unknown as { YAML: { parse(text: string): unknown } }).YAML.parse(cardText);
  } catch (error) {
    return {
      failures: [`${entry.repository}: ${entry.card} is not parseable YAML — ${String(error)}`],
      skipped: false,
    };
  }
  for (const problem of validateCard(card)) {
    failures.push(`${entry.repository}: invalid card — ${problem}`);
  }
  if (failures.length > 0) return { failures, skipped: false };
  if (entry.role === "hub") return { failures, skipped: false };
  const readme = fetchFile(entry.repository, "README.md");
  if (readme === null) {
    return { failures: [`${entry.repository}: README.md is missing at main`], skipped: false };
  }
  for (const problem of checkStatusSection(readme, card)) {
    failures.push(`${entry.repository}: README status diverges — ${problem}`);
  }
  return { failures, skipped: false };
}

export function parseFleet(yamlText: string): FleetEntry[] {
  const document = (Bun as unknown as { YAML: { parse(text: string): unknown } }).YAML.parse(
    yamlText,
  ) as { repositories: readonly Record<string, unknown>[] };
  return document.repositories.map((record) => {
    const entry: FleetEntry = {
      repository: String(record.repository),
      role: String(record.role),
      ...(typeof record.card === "string" ? { card: record.card } : {}),
    };
    return entry;
  });
}

function fetchFromGitHub(repository: string, path: string): string | null {
  const result = Bun.spawnSync([
    "gh",
    "api",
    `repos/${repository}/contents/${path}?ref=main`,
    "-H",
    "Accept: application/vnd.github.raw+json",
  ]);
  if (result.exitCode !== 0) return null;
  return new TextDecoder().decode(result.stdout);
}

if (import.meta.main) {
  const fleet = parseFleet(await Bun.file("ecosystem/repositories.v1.yaml").text());
  const { concludeGate, GateReport } = await import("../tools/quality/gate-report");
  const report = new GateReport();
  for (const entry of fleet) {
    const review = reviewRepository(entry, fetchFromGitHub);
    if (review.skipped) {
      // Asserted, not silent: "this repository declares no card" is a
      // statement about the repository, and it counts as an inspection.
      report.check(entry.repository, true, "no card declared — nothing to present");
      continue;
    }
    report.check(
      entry.repository,
      review.failures.length === 0,
      review.failures.length === 0
        ? "card valid, README status coherent"
        : review.failures.join("; "),
    );
  }
  concludeGate("Fleet presentation", report);
}
