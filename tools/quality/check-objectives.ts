export {};

const requiredFiles = [
  "vision.md",
  "GOALS.md",
  "STATUS.md",
  "ROADMAP.md",
  "docs/decisions/DECISION-REGISTER.md",
  "docs/transformation/CLEANUP.md",
  "docs/transformation/G0-FREEZE-EVIDENCE.md",
  "docs/transformation/G0-CANONICAL-BOOTSTRAP.md",
  "docs/transformation/BIG-BANG.md",
  "docs/toolchain/BUN-QUALIFICATION.md",
  "docs/specifications/SPECIFICATION-STANDARD.md",
  "docs/specifications/DECISION-QUEUE.md",
  "docs/adr/0002-g1-cross-cutting-product-decisions.md",
  "contracts/catalog.v1.json",
  "contracts/COMPATIBILITY.md",
  "prompts/00-cleanup.md",
  "prompts/01-specification-lock.md",
  "prompts/02-foundation-build.md",
  "prompts/03-parallel-reconstruction.md",
  "prompts/04-integration-cutover.md",
  "prompts/website-reconciliation.md",
  "prompts/design-system-reconciliation.md",
];
const forbiddenStatements = [
  "Forgejo",
  "migration progressive par produit",
  "portage produit par produit",
  "Dioxus actuel devient legacy",
];
const failures: string[] = [];

for (const path of requiredFiles) {
  if (!(await Bun.file(path).exists())) failures.push(`Missing objective file: ${path}`);
}

const glob = new Bun.Glob("**/*.{md,json,yaml,yml,toml,ts,tsx}");
for await (const path of glob.scan({ cwd: ".", dot: true, onlyFiles: true })) {
  if (path === "tools/quality/check-objectives.ts") continue;
  if ([".git/", ".tools/", "node_modules/", "target/"].some((prefix) => path.startsWith(prefix))) {
    continue;
  }
  const text = await Bun.file(path).text();
  for (const statement of forbiddenStatements) {
    if (text.toLowerCase().includes(statement.toLowerCase())) {
      failures.push(`${path}: forbidden stale statement ${JSON.stringify(statement)}`);
    }
  }
}

const vision = await Bun.file("vision.md").text();
for (const decision of [
  "migration Big Bang",
  "GitHub et collaboration canoniques",
  "configuration est volontairement différée",
  "Bun fullstack",
  "Rust spécialisé",
]) {
  if (!vision.includes(decision)) failures.push(`Vision is missing decision: ${decision}`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(`Objective files verified: ${requiredFiles.length}`);
