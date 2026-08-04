/**
 * Fleet pin gate (K4 WAVE-A-02 / FINAL-01): enumerate the governance
 * template pins observed across the organization and fail when a
 * repository pins a generation absent from ecosystem/fleet-pins.v1.yaml,
 * or pins the workflow and the tooling git-dep at DIFFERENT shas. Network
 * gate by nature (like inventory-drift); repositories without the
 * template (the hub during dismantling, db-inspect, product homes) are
 * skipped by construction — the gate covers what declares a pin.
 */
export {};

interface FleetPins {
  readonly generations: ReadonlyArray<{ readonly sha: string; readonly note: string }>;
}

const register = Bun.YAML.parse(await Bun.file("ecosystem/fleet-pins.v1.yaml").text()) as FleetPins;
const declared = new Set(register.generations.map((generation) => generation.sha));

interface InventoryRepo {
  readonly repository: string;
  readonly role: string;
}
const inventory = Bun.YAML.parse(await Bun.file("ecosystem/repositories.v1.yaml").text()) as {
  readonly repositories: readonly InventoryRepo[];
};
const targets = inventory.repositories
  .filter((repo) => repo.role === "satellite" || repo.role === "authority")
  .map((repo) => repo.repository);

function fetchRaw(repo: string, path: string): string | null {
  const result = Bun.spawnSync([
    "gh",
    "api",
    `repos/${repo}/contents/${path}`,
    "-H",
    "Accept: application/vnd.github.raw+json",
  ]);
  return result.exitCode === 0 ? new TextDecoder().decode(result.stdout) : null;
}

const failures: string[] = [];
let covered = 0;
for (const repo of targets) {
  const workflow = fetchRaw(repo, ".github/workflows/ci.yml");
  const manifest = fetchRaw(repo, "package.json");
  const workflowPin = workflow?.match(/uses: libre-ai\/governance\/[^@]+@([0-9a-f]{40})/)?.[1];
  const gitDepPin = manifest?.match(/github:libre-ai\/governance#([0-9a-f]{40})/)?.[1];
  if (workflowPin === undefined && gitDepPin === undefined) continue;
  covered += 1;
  if (workflowPin !== undefined && gitDepPin !== undefined && workflowPin !== gitDepPin) {
    failures.push(
      `${repo}: workflow pin ${workflowPin.slice(0, 8)} != git-dep pin ${gitDepPin.slice(0, 8)}`,
    );
  }
  for (const pin of new Set([workflowPin, gitDepPin])) {
    if (pin !== undefined && !declared.has(pin)) {
      failures.push(
        `${repo}: pin ${pin.slice(0, 8)} is not a declared generation (fleet-pins.v1.yaml)`,
      );
    }
  }
}
const { concludeGate, GateReport } = await import("../tools/quality/gate-report");
const report = new GateReport();
for (const failure of failures) {
  const colon = failure.indexOf(":");
  report.check(failure.slice(0, colon), false, `DRIFT: ${failure.slice(colon + 2)}`);
}
if (failures.length === 0) {
  // Zero covered repositories would mean the observation itself broke — the
  // fleet demonstrably pins the template; count is part of the verdict.
  report.check(
    "fleet template pins",
    covered > 0,
    covered > 0
      ? `${covered} pinned repositories match the ${declared.size} declared generations`
      : "no pinned repository observed — the enumeration asserted nothing",
  );
}
concludeGate("Fleet pins", report);
