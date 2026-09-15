/** Read-only diagnostics never promote candidate claims into program admission. */
import { lstat, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import { inspectExecutionOrder, portfolioExecutionOrder } from "./execution-order";
import { readPortfolio } from "./source-freeze";

export type ProgramPhase = "local" | "final";
interface FreezeInspection {
  status: "verifier-unavailable";
  byteDigest: null;
}
export interface ProgramInspection {
  schemaVersion: "program-inspection.v1";
  phase: ProgramPhase;
  verdict: "blocked";
  ready: false;
  authorizesMutation: false;
  qualification: "diagnostic-only";
  inventory: { sources: number; certainTargets: number; conditionalTargets: number };
  freeze: FreezeInspection;
  blockers: string[];
}

const localBlockers = [
  "authority-signature-verifier-unavailable",
  "current-source-proof-verifier-unavailable",
  "reviewed-composition-proof-verifier-unavailable",
  "local-qualification-verifier-unavailable",
  "missions-qualification-verifier-unavailable",
] as const;
const finalBlockers = [
  "registry-qualification-verifier-unavailable",
  "conditional-disposition-proof-verifier-unavailable",
  "signed-root-proof-verifier-unavailable",
  "signer-runner-permission-proof-verifier-unavailable",
  "private-qualification-verifier-unavailable",
  "current-source-recheck-verifier-unavailable",
  "final-transaction-proof-verifier-unavailable",
] as const;

export async function inspectProgram(
  runDirectory: string,
  phase: ProgramPhase,
): Promise<ProgramInspection> {
  if (phase !== "local" && phase !== "final") throw new Error("program-input-invalid");
  const root = resolve(runDirectory);
  const before = await lstat(root);
  if (!before.isDirectory() || (await realpath(root)) !== root)
    throw new Error("program-input-invalid");
  const portfolio = readPortfolio();
  const order = inspectExecutionOrder(portfolioExecutionOrder);
  // No descriptor-anchored input reader has been qualified for this module.
  // Pathname checks cannot prevent parent replacement; do not consume the freeze.
  const freeze: FreezeInspection = { status: "verifier-unavailable", byteDigest: null };
  const after = await lstat(root);
  if (before.dev !== after.dev || before.ino !== after.ino || (await realpath(root)) !== root)
    throw new Error("program-input-invalid");
  const blockers: string[] = [...localBlockers, ...(phase === "final" ? finalBlockers : [])];
  if (order.errors.length > 0) blockers.push("canonical-execution-order-invalid");
  blockers.push("source-freeze-verifier-unavailable");
  return {
    schemaVersion: "program-inspection.v1",
    phase,
    verdict: "blocked",
    ready: false,
    authorizesMutation: false,
    qualification: "diagnostic-only",
    inventory: {
      sources: portfolio.sources.length,
      certainTargets: portfolio.certainTargets.length,
      conditionalTargets: portfolio.conditionalTargets.length,
    },
    freeze,
    blockers: blockers.sort(),
  };
}

export async function runProgramCommand(
  args: readonly string[],
  logger: Pick<Console, "log" | "error">,
): Promise<number> {
  try {
    const options = new Map<string, string>();
    for (let index = 0; index < args.length; index += 2) {
      const name = args[index];
      const value = args[index + 1];
      if (!name || !value || (name !== "--run-dir" && name !== "--phase") || options.has(name))
        throw new Error("input");
      options.set(name, value);
    }
    const root = options.get("--run-dir");
    const phase = options.get("--phase") ?? "final";
    if (!root || (phase !== "local" && phase !== "final")) throw new Error("input");
    logger.log(JSON.stringify(await inspectProgram(root, phase), null, 2));
  } catch {
    logger.error("program-input-invalid");
  }
  return 1;
}

if (import.meta.main) process.exitCode = await runProgramCommand(process.argv.slice(2), console);
