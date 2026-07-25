export {};

const applications = [
  "website",
  "practices",
  "radar",
  "notebook",
  "sessions",
  "model-policy",
  "boussole",
  "specifications",
  "missions",
  "agent-board",
  "memory",
  // Layer 2 (Polaris) realization surfaces, added by ADR-0018 D3. Their actors
  // are agents rather than humans — as is already the case for `memory` — but
  // the alternative was a second product-specification authority, which costs
  // more than the slight impropriety of the word "apps".
  "orchestrator",
  "harness",
];
const requiredSections = [
  "Purpose and actors",
  "Journeys",
  "Non-goals",
  "Domain protocol",
  "Refusal matrix",
  "Data",
  "Authentication and authorization",
  "Runtime boundaries",
  "Accessibility and degraded mode",
  "Contracts",
  "Evidence",
  "Work packages",
  "Release and rollback",
];
const failures: string[] = [];

for (const application of applications) {
  const path = `docs/apps/${application}.md`;
  const file = Bun.file(path);
  if (!(await file.exists())) {
    failures.push(`${path}: missing application specification`);
    continue;
  }
  const text = await file.text();
  for (const section of requiredSections) {
    if (!text.includes(`## ${section}`)) failures.push(`${path}: missing section ${section}`);
  }
  if (/\b(?:TBD|TODO|FIXME)\b/i.test(text)) failures.push(`${path}: unresolved placeholder`);
  if (!text.includes("contracts/")) failures.push(`${path}: no canonical contract authority path`);
  const refusalCodes = text.match(/`[a-z][a-z0-9-]*\.[a-z0-9_.-]+`/g) ?? [];
  if (new Set(refusalCodes).size < 3)
    failures.push(`${path}: fewer than three stable refusal codes`);
}

const standard = Bun.file("docs/specifications/SPECIFICATION-STANDARD.md");
if (!(await standard.exists())) failures.push("Missing Specification Lock standard");

const queue = Bun.file("docs/specifications/DECISION-QUEUE.md");
if (!(await queue.exists())) {
  failures.push("Missing G1 decision queue");
} else {
  const text = await queue.text();
  if (!text.includes("**Status:** closed")) failures.push("G1 decision queue is not closed");
  for (let index = 1; index <= 5; index += 1) {
    if (!text.includes(`## Q${index} —`)) failures.push(`Decision queue is missing Q${index}`);
  }
  const accepted = text.match(/\*\*Status:\*\* accepted\./g) ?? [];
  if (accepted.length !== 5) failures.push("All five G1 decisions must be accepted");
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(`Application specification structure verified: ${applications.length}`);
