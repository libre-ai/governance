import Ajv2020, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";

type Phase = "G2" | "G3" | "G4" | "G5";
type WorkPackage = {
  id: string;
  phase: Phase;
  name: string;
  owners: string[];
  integrator: string;
  writePaths: string[];
  readAuthorities: string[];
  dependsOn: string[];
  parallelGroup: string;
  risk: "medium" | "high" | "critical";
  humanGates: string[];
  acceptance: string[];
  definitionStatus: "locked";
};

const failures: string[] = [];
const phaseOrder: Record<Phase, number> = { G2: 2, G3: 3, G4: 4, G5: 5 };
const targetApps = [
  "website",
  "practices",
  "radar",
  "notebook",
  "sessions",
  "model-policy",
  "boussole",
  "specifications",
  "missions",
];

function errors(value: ErrorObject[] | null | undefined): string {
  return (value ?? [])
    .slice(0, 10)
    .map((error) => `${error.instancePath || "/"} ${error.message ?? error.keyword}`)
    .join("; ");
}

function pathRoot(path: string): string {
  return path.endsWith("/**") ? path.slice(0, -3).replace(/\/$/, "") : path;
}

function pathsOverlap(left: string, right: string): boolean {
  const a = pathRoot(left);
  const b = pathRoot(right);
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

const common = await Bun.file("contracts/schemas/common.v1.schema.json").json();
const schema = await Bun.file("contracts/schemas/work-package-plan.v1.schema.json").json();
const plan = await Bun.file("docs/transformation/work-packages.v1.json").json();
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(common);
const validate = ajv.compile(schema);
if (!validate(plan)) failures.push(`Work package schema rejected: ${errors(validate.errors)}`);

const packages = (plan as { packages?: WorkPackage[] }).packages ?? [];
if (packages.length !== 26)
  failures.push(`Expected 26 locked work packages, found ${packages.length}`);
const byId = new Map<string, WorkPackage>();
for (const workPackage of packages) {
  if (byId.has(workPackage.id)) failures.push(`${workPackage.id}: duplicate package id`);
  byId.set(workPackage.id, workPackage);
  if (
    (workPackage.risk === "high" || workPackage.risk === "critical") &&
    workPackage.humanGates.length === 0
  ) {
    failures.push(`${workPackage.id}: high/critical package has no independent acceptance gate`);
  }
  if (!workPackage.parallelGroup.startsWith(workPackage.phase.toLowerCase())) {
    failures.push(`${workPackage.id}: parallel group and phase diverge`);
  }
  if (
    workPackage.writePaths.some((path) => path === "contracts" || path.startsWith("contracts/"))
  ) {
    failures.push(`${workPackage.id}: implementation package cannot write canonical contracts`);
  }
  if (
    workPackage.phase !== "G4" &&
    workPackage.writePaths.some((path) => path.startsWith("infrastructure/"))
  ) {
    failures.push(
      `${workPackage.id}: infrastructure writes are forbidden before/after dedicated G4 packages`,
    );
  }
  for (const authority of workPackage.readAuthorities) {
    if (!authority.endsWith("/**") && !(await Bun.file(authority).exists())) {
      failures.push(`${workPackage.id}: missing read authority ${authority}`);
    }
  }
}

for (const workPackage of packages) {
  for (const dependencyId of workPackage.dependsOn) {
    const dependency = byId.get(dependencyId);
    if (!dependency) {
      failures.push(`${workPackage.id}: unknown dependency ${dependencyId}`);
      continue;
    }
    if (dependencyId === workPackage.id) failures.push(`${workPackage.id}: self dependency`);
    if (phaseOrder[dependency.phase] > phaseOrder[workPackage.phase]) {
      failures.push(`${workPackage.id}: depends on later phase ${dependencyId}`);
    }
    if (dependency.phase === workPackage.phase) {
      const dependencyGroup = Number(dependency.parallelGroup.split("-").at(-1));
      const packageGroup = Number(workPackage.parallelGroup.split("-").at(-1));
      if (dependencyGroup >= packageGroup)
        failures.push(
          `${workPackage.id}: dependency ${dependencyId} is not in an earlier parallel group`,
        );
    }
  }
}

const visiting = new Set<string>();
const visited = new Set<string>();
function visit(id: string): void {
  if (visiting.has(id)) {
    failures.push(`${id}: dependency cycle`);
    return;
  }
  if (visited.has(id)) return;
  visiting.add(id);
  for (const dependency of byId.get(id)?.dependsOn ?? []) visit(dependency);
  visiting.delete(id);
  visited.add(id);
}
for (const id of byId.keys()) visit(id);

function transitivelyDepends(
  packageId: string,
  dependencyId: string,
  seen = new Set<string>(),
): boolean {
  if (seen.has(packageId)) return false;
  seen.add(packageId);
  const current = byId.get(packageId);
  if (!current) return false;
  return (
    current.dependsOn.includes(dependencyId) ||
    current.dependsOn.some((id) => transitivelyDepends(id, dependencyId, seen))
  );
}

for (const workPackage of packages.filter(
  (candidate) => candidate.phase === "G2" && candidate.id !== "WP-G2-T01",
)) {
  if (!transitivelyDepends(workPackage.id, "WP-G2-T01"))
    failures.push(`${workPackage.id}: G2 work bypasses production toolchain qualification`);
}

const writes: Array<{ id: string; path: string }> = packages.flatMap((workPackage) =>
  workPackage.writePaths.map((path) => ({ id: workPackage.id, path })),
);
for (let left = 0; left < writes.length; left += 1) {
  for (let right = left + 1; right < writes.length; right += 1) {
    const a = writes[left];
    const b = writes[right];
    if (a && b && a.id !== b.id && pathsOverlap(a.path, b.path)) {
      failures.push(`${a.id}:${a.path} overlaps ${b.id}:${b.path}`);
    }
  }
}

for (const app of targetApps) {
  const writePath = `apps/${app}/**`;
  const owners = packages.filter((workPackage) => workPackage.writePaths.includes(writePath));
  if (owners.length !== 1 || owners[0]?.phase !== "G3")
    failures.push(`${writePath}: expected exactly one G3 owner`);
  const owner = owners[0];
  if (owner && !owner.dependsOn.includes("WP-G2-Q01"))
    failures.push(`${owner.id}: application bypasses integrated G2 foundation gate`);
  if (owner && !owner.readAuthorities.includes(`docs/apps/${app}.md`))
    failures.push(`${owner.id}: application specification is not declared as authority`);
}

const expectedInfrastructureWriters = packages.filter((workPackage) =>
  workPackage.writePaths.some((path) => path.startsWith("infrastructure/")),
);
if (
  expectedInfrastructureWriters.length !== 1 ||
  expectedInfrastructureWriters[0]?.id !== "WP-G4-I01"
) {
  failures.push("Only WP-G4-I01 may write infrastructure paths");
}
if (
  byId.get("WP-G2-T01")?.parallelGroup !== "g2-0" ||
  (byId.get("WP-G2-T01")?.dependsOn.length ?? 1) !== 0
) {
  failures.push("WP-G2-T01 must be the dependency-free first G2 package");
}

const requiredConstraints = [
  "No Clever Cloud resource",
  "No legacy Git history",
  "Applications never read or write another product database",
  "Authoring and review are separate passes",
];
const constraints = (plan as { globalConstraints?: string[] }).globalConstraints ?? [];
for (const required of requiredConstraints) {
  if (!constraints.some((constraint) => constraint.includes(required)))
    failures.push(`Missing global constraint: ${required}`);
}
const serialized = JSON.stringify(plan).toLowerCase();
for (const forbidden of [
  "next.js",
  "vite",
  "astro",
  "hono",
  "express",
  "fastify",
  "elysia",
  "dioxus",
]) {
  if (serialized.includes(forbidden))
    failures.push(`Work package plan contains forbidden target ${forbidden}`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(
  `Work package plan verified: ${packages.length} packages, ${writes.length} exclusive write paths`,
);
