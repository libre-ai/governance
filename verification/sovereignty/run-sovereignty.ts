import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readAdoptionAttestation } from "./adoption-attestation";
import { runForgeRestore } from "./forge-restore";
import { buildDependencyInventory, type DependencyInventory } from "./lockfile-inventory";
import {
  buildSovereigntyReport,
  type ReportInputs,
  renderReportJson,
  renderReportMarkdown,
} from "./report";

/**
 * sovereignty.v1 runner: executes the in-service checks (SOV-01 by
 * attestation read, SOV-02 forge restore, SOV-03 lockfile inventory) and
 * publishes the evidence report under distribution/evidence/sovereignty/.
 * Exits non-zero when a check fails so the weekly CI run turns red instead of
 * quietly publishing a failing report — a real failure is a deliverable, not
 * something to mask.
 */
const EVIDENCE_RELATIVE_DIR = "distribution/evidence/sovereignty";

async function gitHeadCommit(repoRoot: string): Promise<string> {
  const proc = Bun.spawn(["git", "rev-parse", "HEAD"], {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [code, stdout] = await Promise.all([proc.exited, new Response(proc.stdout).text()]);
  if (code !== 0) {
    throw new Error(`git rev-parse HEAD exited ${code}`);
  }
  return stdout.trim();
}

async function collectInventory(
  repoRoot: string,
): Promise<DependencyInventory | { readonly error: string }> {
  try {
    const [bunLock, cargoLock] = await Promise.all([
      readFile(join(repoRoot, "bun.lock"), "utf8"),
      readFile(join(repoRoot, "Cargo.lock"), "utf8"),
    ]);
    return buildDependencyInventory(bunLock, cargoLock);
  } catch (error) {
    // Parser errors carry no filesystem paths; safe for committed evidence.
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

if (import.meta.main) {
  const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
  const commit = await gitHeadCommit(repoRoot);
  const inputs: ReportInputs = {
    run: { date: new Date().toISOString().slice(0, 10), commit },
    attestation: await readAdoptionAttestation(repoRoot),
    restore: await runForgeRestore(repoRoot),
    inventory: await collectInventory(repoRoot),
  };
  const report = buildSovereigntyReport(inputs);

  const evidenceDir = join(repoRoot, EVIDENCE_RELATIVE_DIR);
  await mkdir(evidenceDir, { recursive: true });
  const stem = `${report.run.date}-${commit.slice(0, 7)}`;
  const json = renderReportJson(report);
  await writeFile(join(evidenceDir, `${stem}.json`), json);
  await writeFile(join(evidenceDir, `${stem}.md`), renderReportMarkdown(report));
  await writeFile(join(evidenceDir, "latest.json"), json);

  for (const check of report.checks) {
    console.error(`${check.id} ${check.status} — ${check.reason}`);
  }
  console.error(
    `sovereignty.v1: ${report.summary.pass} pass, ${report.summary.fail} fail, ` +
      `${report.summary.pending} pending — ${EVIDENCE_RELATIVE_DIR}/${stem}.{json,md}`,
  );
  if (report.summary.fail > 0) {
    process.exit(1);
  }
}
