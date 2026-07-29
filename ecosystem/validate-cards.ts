import { existsSync } from "node:fs";

import { aggregateProgress, collectPathReferences, validateCard } from "./project-cards";

/**
 * γ phase 3.2 — card validation gate (`bun run check:cards`).
 *
 * Scans every `*.project.v1.yaml` under `ecosystem/cards/` (the staging home
 * before cards are dispatched into their repositories in phase 3.6) plus any
 * `project.v1.yaml` at the repository root, validates each against the
 * schema, and prints the computed progress display — never a declared one.
 */
const globs = [new Bun.Glob("ecosystem/cards/*.project.v1.yaml"), new Bun.Glob("project.v1.yaml")];
const paths: string[] = [];
for (const glob of globs) {
  for await (const path of glob.scan({ cwd: ".", onlyFiles: true })) paths.push(path);
}
const failures: string[] = [];
let checked = 0;

for (const path of paths.sort()) {
  checked += 1;
  let value: unknown;
  try {
    value = Bun.YAML.parse(await Bun.file(path).text());
  } catch (error) {
    failures.push(`${path}: invalid YAML (${(error as Error).message})`);
    continue;
  }
  const errors = validateCard(value);
  if (errors.length > 0) {
    for (const error of errors) failures.push(`${path}${error}`);
    continue;
  }
  // A path-looking evidence reference must resolve: a dangling reference was
  // found during phase 3.1 review, and this gate is the guard it called for.
  // existsSync, not Bun.file().exists(): a directory is a verifiable target.
  for (const reference of collectPathReferences(value)) {
    if (!existsSync(reference)) {
      failures.push(`${path}: evidence reference does not resolve: ${reference}`);
    }
  }
  const report = aggregateProgress(value);
  const name = (value as { project?: string }).project ?? path;
  console.log(`card ${name}: ${report.display}`);
}

if (checked === 0) failures.push("No project card found under ecosystem/cards/");
if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  console.error("Project cards invalid (γ 3.2, design §6).");
  process.exit(1);
}
console.log(`Project cards verified: ${checked}`);
