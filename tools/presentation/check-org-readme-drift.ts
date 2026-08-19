/**
 * Org profile README drift gate (Domain I, Process & CI — chantier 3).
 *
 * `render-org-readme.ts` computes the organization profile's status section
 * from a fresh fleet-status projection, but nothing verified that
 * `libre-ai/.github`'s published `profile/README.md` still carries what that
 * computation would produce today — the two live in different repositories,
 * and `ecosystem/repositories.v1.yaml` can change here without anyone
 * touching the other one.
 *
 * Two ways to close that gap: push the render across repositories on every
 * change, or read the live README back and fail when it diverges. The first
 * needs a second credential (the default token cannot write another
 * repository), a cross-repo write path to reason about, and a second branch
 * protection on the receiving end — real weight for what a manual
 * `render-org-readme.ts` run and paste already fixes in one command. This
 * gate takes the second path: the fix stays a human or agent action, but
 * drift can no longer pass unnoticed, which is the failure mode this
 * exists to remove (docs/method/AGENTIC-LOOP-INVENTORY.md, "Contrôle de
 * dérive périodique" — silence is indistinguishable from correctness unless
 * something checks).
 *
 * The fleet-status projection is recomputed from every declared card here,
 * never read from the committed `ecosystem/projections/fleet-status.v1.json`
 * copy — that file's own freshness is unverified by any gate today, and
 * comparing a live README against a possibly-stale intermediate would let
 * two wrongs read as a pass.
 */
import { parseFleet } from "../../ecosystem/check-fleet-presentation";
import { STATUS_SECTION_BEGIN, STATUS_SECTION_END } from "../../ecosystem/project-cards";
import { buildFleetStatus } from "../../ecosystem/render-fleet-status";
import { renderOrgSection, summarizeMigration } from "./render-org-readme";

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

/**
 * Compares the live `.github` README against a freshly rendered section.
 * Mirrors `project-cards.ts`'s `checkStatusSection` sentinel discipline: one
 * declared pair of sentinels, byte-identical content between them.
 */
export function checkOrgReadmeDrift(liveReadme: string, freshSection: string): string[] {
  const beginCount = countOccurrences(liveReadme, STATUS_SECTION_BEGIN);
  const endCount = countOccurrences(liveReadme, STATUS_SECTION_END);
  if (beginCount === 0 || endCount === 0) {
    return [
      ".github profile/README.md: generated project-status section missing (sentinels not found)",
    ];
  }
  if (beginCount > 1 || endCount > 1) {
    return [
      ".github profile/README.md: section statut dupliquée — une seule paire de sentinelles est admise",
    ];
  }
  const begin = liveReadme.indexOf(STATUS_SECTION_BEGIN);
  const end = liveReadme.indexOf(STATUS_SECTION_END);
  const committed = liveReadme.slice(begin, end + STATUS_SECTION_END.length);
  if (committed !== freshSection) {
    return [
      ".github profile/README.md: the published status section diverges from a fresh render of " +
        "ecosystem/repositories.v1.yaml — run `bun tools/presentation/render-org-readme.ts` and " +
        "paste the result between the sentinels",
    ];
  }
  return [];
}

// ---------------------------------------------------------------------------
// CLI (network I/O — not unit-tested; the comparison above is)

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
  const { concludeGate, GateReport } = await import("../quality/gate-report");
  const report = new GateReport();

  const fleet = parseFleet(await Bun.file("ecosystem/repositories.v1.yaml").text());
  const yamlApi = (Bun as unknown as { YAML: { parse(text: string): unknown } }).YAML;
  const cards: unknown[] = [];
  let unreadable = false;
  for (const entry of fleet) {
    if (entry.card === undefined) continue;
    const text = fetchFromGitHub(entry.repository, entry.card);
    if (text === null) {
      report.check(entry.repository, false, `declared card ${entry.card} is unreadable at main`);
      unreadable = true;
      continue;
    }
    cards.push(yamlApi.parse(text));
  }

  const migrationText = fetchFromGitHub("libre-ai/libre-ai", "ecosystem/migration-index.v1.yaml");
  const readme = fetchFromGitHub("libre-ai/.github", "profile/README.md");

  if (migrationText === null || readme === null || unreadable) {
    report.check(
      "org readme drift",
      false,
      `cannot compute or read live state (migration index: ${migrationText !== null}, ` +
        `.github README: ${readme !== null}, all cards readable: ${!unreadable})`,
    );
  } else {
    const status = buildFleetStatus(cards);
    const fresh = renderOrgSection(status, summarizeMigration(migrationText));
    const drift = checkOrgReadmeDrift(readme, fresh);
    if (drift.length === 0) {
      report.check(
        "org readme drift",
        true,
        `libre-ai/.github profile/README.md matches a fresh render (${status.rows.length} rows)`,
      );
    } else {
      for (const failure of drift) report.check("org readme drift", false, failure);
    }
  }
  concludeGate("Org README drift", report);
}
