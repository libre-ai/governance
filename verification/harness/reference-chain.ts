import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";

/**
 * WP-G2-Q01 reference-chain harness (acceptance criterion 1). A single entry
 * point that exercises the foundation chain from a clean checkout and emits a
 * machine-readable, digest-anchored evidence report. The chain is declared as
 * ordered, modular steps so a gated step (RLS, which needs packages/data on
 * main) slots in without reshaping the harness.
 *
 * Evidence is digest-anchored over the reproducible facts (step ids + statuses
 * in order), NOT cryptographically signed: signing waits for the provenance
 * brick (wave 2), consistent with the P3 lineage deferral — no key ceremony is
 * authorized (WP-G2-Z01). Volatile durations are recorded but excluded from
 * the digest so the evidence reproduces byte-for-byte.
 */
export interface ChainStep {
  readonly id: string;
  readonly label: string;
  readonly command: readonly string[];
  /** If set, the step is skipped (not failed) when this repo path is absent. */
  readonly requiresPath?: string;
}

export interface StepOutcome {
  readonly id: string;
  readonly status: "passed" | "failed" | "skipped";
  readonly durationMs: number;
}

export type ChainStatus = "passed" | "passed-with-skips" | "failed";

export interface ReferenceChainReport {
  readonly schemaVersion: "libre-ai.reference-chain.v1";
  readonly status: ChainStatus;
  readonly steps: readonly StepOutcome[];
  readonly skipped: readonly string[];
  readonly digest: string;
}

export function buildReferenceChainReport(
  steps: readonly ChainStep[],
  outcomes: readonly StepOutcome[],
): ReferenceChainReport {
  const byId = new Map(outcomes.map((o) => [o.id, o]));
  for (const outcome of outcomes) {
    if (!steps.some((step) => step.id === outcome.id)) {
      throw new Error(`unknown step in outcomes: ${outcome.id}`);
    }
  }
  const ordered: StepOutcome[] = [];
  for (const step of steps) {
    const outcome = byId.get(step.id);
    if (outcome === undefined) {
      throw new Error(`missing outcome for declared step: ${step.id}`);
    }
    ordered.push(outcome);
  }

  const skipped = ordered.filter((o) => o.status === "skipped").map((o) => o.id);
  const anyFailed = ordered.some((o) => o.status === "failed");
  const status: ChainStatus = anyFailed
    ? "failed"
    : skipped.length > 0
      ? "passed-with-skips"
      : "passed";

  // Digest over the reproducible facts only: ordered id:status pairs. Durations
  // and labels are excluded so re-running the same chain yields the same digest.
  const canonical = ordered.map((o) => `${o.id}:${o.status}`).join("\n");
  const digest = createHash("sha256").update(canonical).digest("hex");

  return {
    schemaVersion: "libre-ai.reference-chain.v1",
    status,
    steps: ordered,
    skipped,
    digest,
  };
}

/**
 * The foundation chain (acceptance criterion 1). Each command is run from the
 * repository root. `contracts`, `wit`, `biscuit`, `proof`, `artifact` and the
 * web platform are already on main; `rls` is gated on packages/data (D01) so
 * the harness reports it as skipped on a pre-merge main checkout and exercises
 * it once D01 lands.
 */
export const FOUNDATION_CHAIN: readonly ChainStep[] = [
  {
    id: "contracts",
    label: "Contracts + generated projections",
    command: ["bun", "run", "check:contracts"],
  },
  {
    id: "generated-contracts",
    label: "Generated contract projections",
    command: ["bun", "run", "check:generated-contracts"],
  },
  {
    id: "web-react",
    label: "Bun.serve + React web platform",
    command: ["bun", "test", "packages/web-platform"],
  },
  {
    id: "biscuit",
    label: "Biscuit authorization",
    command: ["cargo", "test", "-p", "libre-ai-authz-biscuit"],
  },
  { id: "wit", label: "WIT worlds parse", command: ["bun", "run", "check:contracts"] },
  {
    id: "proof-artifact",
    label: "Proof + Artifact crates",
    command: ["cargo", "test", "-p", "libre-ai-artifact"],
  },
  {
    id: "secret-scan",
    label: "Secret scan (no committed credentials)",
    command: ["bun", "tools/quality/check-secret-scan.ts"],
  },
  {
    id: "no-clever",
    label: "No Clever resource / production claim",
    command: ["bun", "tools/quality/check-no-clever-production.ts"],
  },
  {
    id: "rls",
    label: "Tenant RLS barrier two-tenant deny (D01)",
    command: ["bun", "test", "packages/data/src/adapters"],
    requiresPath: "packages/data",
  },
  {
    id: "playwright",
    label: "Playwright three-engine foundation e2e (W01 bun-app)",
    command: ["bun", "run", "--cwd", "distribution/templates/bun-app", "test:e2e"],
    requiresPath: "distribution/templates/bun-app/playwright.config.ts",
  },
];

async function pathExists(path: string): Promise<boolean> {
  // node:fs stat, not Bun.file().exists(): the latter reports false for a
  // directory, and gated paths (e.g. packages/data) are directories.
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function runStep(step: ChainStep): Promise<StepOutcome> {
  if (step.requiresPath !== undefined && !(await pathExists(step.requiresPath))) {
    return { id: step.id, status: "skipped", durationMs: 0 };
  }
  const started = Bun.nanoseconds();
  const proc = Bun.spawn([...step.command], { stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  const durationMs = Math.round((Bun.nanoseconds() - started) / 1_000_000);
  return { id: step.id, status: code === 0 ? "passed" : "failed", durationMs };
}

if (import.meta.main) {
  const outcomes: StepOutcome[] = [];
  for (const step of FOUNDATION_CHAIN) {
    console.error(`\n=== reference-chain: ${step.id} — ${step.label} ===`);
    outcomes.push(await runStep(step));
  }
  const report = buildReferenceChainReport(FOUNDATION_CHAIN, outcomes);
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "failed") {
    console.error("Reference chain FAILED (WP-G2-Q01 acceptance 1).");
    process.exit(1);
  }
  console.error(`Reference chain ${report.status} — digest ${report.digest}`);
}
