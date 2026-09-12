/** Dependency validation is not evidence qualification or authorization. */
interface ExecutionStage {
  readonly id: string;
  readonly requires: readonly string[];
}

interface ExecutionOrderInspection {
  order: string[];
  errors: string[];
  authorizesMutation: false;
}

export const portfolioExecutionOrder: readonly ExecutionStage[] = [
  { id: "source-reconciliation", requires: [] },
  { id: "authority-candidate", requires: [] },
  { id: "tooling", requires: [] },
  { id: "authority-signature", requires: ["authority-candidate"] },
  { id: "source-freeze", requires: ["source-reconciliation", "authority-signature"] },
  { id: "path-audit", requires: ["source-freeze", "tooling"] },
  { id: "candidate-build", requires: ["path-audit"] },
  { id: "local-qualification", requires: ["candidate-build"] },
  { id: "release-authorization", requires: ["local-qualification"] },
  { id: "release-publication", requires: ["local-qualification", "release-authorization"] },
  { id: "registry-qualification", requires: ["release-publication"] },
  { id: "conditional-admission", requires: ["local-qualification", "registry-qualification"] },
  { id: "surface-release-completion", requires: ["conditional-admission"] },
  { id: "final-roots", requires: ["conditional-admission", "surface-release-completion"] },
  { id: "infrastructure-proof", requires: ["local-qualification"] },
  { id: "staging-preflight", requires: ["final-roots", "infrastructure-proof"] },
  { id: "private-staging", requires: ["staging-preflight"] },
  { id: "private-qualification", requires: ["private-staging"] },
  { id: "source-recheck", requires: ["source-freeze", "private-qualification"] },
  {
    id: "final-preflight",
    requires: ["private-qualification", "registry-qualification", "source-recheck"],
  },
  { id: "destructive-confirmation", requires: ["final-preflight"] },
  { id: "public-cutover", requires: ["destructive-confirmation"] },
];

function isStage(value: unknown): value is ExecutionStage {
  if (typeof value !== "object" || value === null) return false;
  if (Object.keys(value).some((key) => key !== "id" && key !== "requires")) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "requires" in value &&
    Array.isArray(value.requires) &&
    value.requires.every((id: unknown) => typeof id === "string")
  );
}

export function inspectExecutionOrder(input: unknown): ExecutionOrderInspection {
  const reject = (errors: string[]): ExecutionOrderInspection => ({
    order: [],
    errors: [...new Set(errors)].sort(),
    authorizesMutation: false,
  });
  if (!Array.isArray(input) || !input.every(isStage)) return reject(["invalid-stage-shape"]);
  const stages: ExecutionStage[] = input;
  const byId = new Map(stages.map((stage) => [stage.id, stage]));
  const known = new Set(portfolioExecutionOrder.map((stage) => stage.id));
  const errors: string[] = [];
  if (stages.length !== byId.size) errors.push("duplicate-stage");
  if (stages.some((stage) => !known.has(stage.id))) errors.push("unknown-stage");
  if (portfolioExecutionOrder.some((stage) => !byId.has(stage.id))) errors.push("missing-stage");
  for (const stage of stages) {
    if (stage.requires.some((id) => !byId.has(id))) errors.push("unknown-dependency");
    if (new Set(stage.requires).size !== stage.requires.length) errors.push("duplicate-dependency");
  }
  if (errors.length > 0) return reject(errors);

  // Fixed safety edges cannot be removed by supplying a superficially acyclic graph.
  for (const required of portfolioExecutionOrder) {
    const supplied = byId.get(required.id);
    if (required.requires.some((id) => !supplied?.requires.includes(id))) {
      errors.push("missing-required-dependency");
    }
  }
  const order: string[] = [];
  const pending = new Set(byId.keys());
  while (pending.size > 0) {
    const available = [...pending]
      .filter((id) => byId.get(id)?.requires.every((dependency) => !pending.has(dependency)))
      .sort();
    if (available.length === 0) return reject([...errors, "dependency-cycle"]);
    for (const id of available) {
      pending.delete(id);
      order.push(id);
    }
  }
  return errors.length > 0 ? reject(errors) : { order, errors: [], authorizesMutation: false };
}

if (import.meta.main) {
  const result = inspectExecutionOrder(portfolioExecutionOrder);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.errors.length > 0 ? 1 : 0;
}
