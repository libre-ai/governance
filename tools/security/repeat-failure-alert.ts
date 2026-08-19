/**
 * Repeat-failure alert (Domain I, Process & CI — mechanizes the "échec
 * observable" column of docs/method/AGENTIC-LOOP-INVENTORY.md for the
 * fleet's periodic drift controls).
 *
 * A red run in a scheduled workflow (adoption-proof, sovereignty-report,
 * truth-drift, fleet-advisories) is only observable to someone who opens the
 * Actions tab — the inventory itself names "absence de ligne récente" as a
 * failure mode indistinguishable from success unless something outside the
 * run surfaces it. This step is that surface: it runs last, gated on
 * `if: failure()`, and turns a red run into a governance issue only when the
 * run BEFORE it was also red — one bad run stays a run (transient, common:
 * a rate limit, a flaky network fetch); two in a row is a pattern worth a
 * human's attention.
 *
 * Deduplicated by exact-title search against open issues: the title is
 * stable across invocations (no date, no run id), so a third, fourth, fifth
 * consecutive failure never files a second issue — it would report against
 * the same open one, which this step deliberately leaves untouched rather
 * than commenting, keeping the mechanism to exactly what chantier 2b asks.
 *
 * Analysis (`shouldAlert`, `issueTitle`, `issueBody`, `findOpenIssue`) is
 * pure and unit-tested; only the CLI touches the network.
 */

export function shouldAlert(previousConclusion: string | null | undefined): boolean {
  return previousConclusion === "failure";
}

export function issueTitle(workflowName: string): string {
  return `${workflowName}: two consecutive failed runs`;
}

export function issueBody(
  workflowName: string,
  currentRunUrl: string,
  previousRunUrl: string | null,
): string {
  const lines = [
    `\`${workflowName}\` failed on two consecutive scheduled runs.`,
    "",
    `- Current run: ${currentRunUrl}`,
    previousRunUrl !== null ? `- Previous run: ${previousRunUrl}` : null,
    "",
    "Filed automatically by tools/security/repeat-failure-alert.ts — a single " +
      "red run is not enough to open an issue (docs/method/AGENTIC-LOOP-INVENTORY.md, " +
      '"Contrôle de dérive périodique"); two in a row is.',
  ].filter((line): line is string => line !== null);
  return lines.join("\n");
}

export interface OpenIssue {
  readonly number: number;
  readonly title: string;
}

/** Exact-title match only — dedup must not silently swallow an unrelated issue. */
export function findOpenIssue(issues: readonly OpenIssue[], title: string): number | null {
  return issues.find((issue) => issue.title === title)?.number ?? null;
}

// ---------------------------------------------------------------------------
// CLI (network I/O — not unit-tested; the logic above is)

if (import.meta.main) {
  const workflowName = process.env.WORKFLOW_NAME;
  const workflowFile = process.env.WORKFLOW_FILE;
  const currentRunUrl = process.env.CURRENT_RUN_URL;
  if (workflowName === undefined || workflowFile === undefined || currentRunUrl === undefined) {
    console.error(
      "repeat-failure-alert: WORKFLOW_NAME, WORKFLOW_FILE and CURRENT_RUN_URL are required",
    );
    process.exit(1);
  }

  const run = (args: string[]): string => {
    const result = Bun.spawnSync(args, { stdout: "pipe", stderr: "pipe" });
    if (result.exitCode !== 0) {
      throw new Error(`${args.join(" ")} exited ${result.exitCode}: ${result.stderr.toString()}`);
    }
    return new TextDecoder().decode(result.stdout);
  };

  // Runs are read oldest-status-first is not guaranteed; `gh run list`
  // returns most-recent-first, and the current (still in_progress) run is
  // excluded by `--status completed` since it has not finished yet — the
  // first row here is genuinely the run immediately before this one.
  const previousRuns = JSON.parse(
    run([
      "gh",
      "run",
      "list",
      "--workflow",
      workflowFile,
      "--status",
      "completed",
      "--limit",
      "1",
      "--json",
      "conclusion,url",
    ]),
  ) as { conclusion: string; url: string }[];
  const previous = previousRuns[0] ?? null;

  if (previous === null || !shouldAlert(previous.conclusion)) {
    console.log(
      `repeat-failure-alert: previous run concluded "${previous?.conclusion ?? "(none)"}" — not two in a row, no issue filed`,
    );
    process.exit(0);
  }

  const title = issueTitle(workflowName);
  const openIssues = JSON.parse(
    run(["gh", "issue", "list", "--state", "open", "--limit", "100", "--json", "number,title"]),
  ) as OpenIssue[];
  const existing = findOpenIssue(openIssues, title);
  if (existing !== null) {
    console.log(
      `repeat-failure-alert: #${existing} already open with this title — not duplicating`,
    );
    process.exit(0);
  }

  const body = issueBody(workflowName, currentRunUrl, previous.url);
  run(["gh", "issue", "create", "--title", title, "--body", body]);
  console.log(`repeat-failure-alert: filed a new issue — ${title}`);
}
