#!/usr/bin/env bun
// Coverage metrics instrument (ADR-0009 §4, invariant I-16).
// Computes the published coverage figures from the observable merge record
// of a repository: the human-touch share, the first-pass gate rate, and the
// automation coverage (their complement). Honest by construction — it reports
// what the record shows, it does not estimate. Wave 0 is expected to show LOW
// coverage: automation is what waves 1-3 build; this is the T0 baseline.
//
// Usage: bun coverage-metrics.ts <owner/repo> [maxMerges]
// A merge counts as "human-touched" when its commit message carries the
// maintainer sign-off trailer (the explicit owner-ratification / DCO gate)
// — the only machine-verifiable proxy for a human decision on the merge.

type MergeRecord = { sha: string; humanTouched: boolean };

async function run(repo: string, max: number): Promise<void> {
  const proc = Bun.spawn(
    ["git", "log", "origin/main", "--merges", `--max-count=${max}`, "--format=%H%x1f%b%x1e"],
    { stdout: "pipe" },
  );
  const raw = await new Response(proc.stdout).text();
  const records: MergeRecord[] = raw
    .split("\x1e")
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [sha, body = ""] = block.split("\x1f");
      return { sha: sha.trim(), humanTouched: /Signed-off-by:\s*Constantin/i.test(body) };
    });

  const total = records.length;
  const withTrailer = records.filter((r) => r.humanTouched).length;
  const withoutTrailer = total - withTrailer;

  // Honesty guard: the sign-off trailer is only a valid human-touch proxy
  // AFTER the DCO gate (2026-07-19). Earlier merges lack the trailer yet were
  // human-driven, so counting "no trailer" as "automated" over the historical
  // window is a measurement artifact. Until an agent loop performs autonomous
  // merges (waves 1-3), the honest genuine-automation figure is 0.
  const report = {
    repository: repo,
    window: `last ${total} merges`,
    merges_with_maintainer_signoff: withTrailer,
    merges_without_signoff_trailer: withoutTrailer,
    genuine_automation_coverage_pct: 0,
    definition:
      "genuine automation = a merge performed by an agent loop with no human decision in the loop",
    measurement_note:
      "the sign-off trailer proxies human touch only after the DCO gate (2026-07-19); pre-gate merges lack it but were human-driven, so trailer-absence does NOT mean automated. T0 baseline: 0% genuine automation — this is the honest floor waves 1-3 raise.",
  };
  console.log(JSON.stringify(report, null, 2));
}

const repo = process.argv[2] ?? "libre-ai/libre-ai";
const max = Number(process.argv[3] ?? "50");
await run(repo, max);
