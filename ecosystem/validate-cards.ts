import { existsSync } from "node:fs";

import { concludeGate, GateReport } from "../tools/quality/gate-report";
import { aggregateProgress, collectPathReferences, validateCard } from "./project-cards";

/**
 * γ phase 3.2 — card validation gate (`bun run check:cards`).
 *
 * Scans every `*.project.v1.yaml` under `ecosystem/cards/` (the staging home
 * before cards are dispatched into their repositories in phase 3.6) plus any
 * `project.v1.yaml` at the repository root, validates each against the
 * schema, as private engineering evidence; this gate grants no public facts.
 */
const globs = [new Bun.Glob("ecosystem/cards/*.project.v1.yaml"), new Bun.Glob("project.v1.yaml")];
const paths: string[] = [];
for (const glob of globs) {
  for await (const path of glob.scan({ cwd: ".", onlyFiles: true })) paths.push(path);
}
const report = new GateReport();

for (const path of paths.sort()) {
  let value: unknown;
  try {
    value = Bun.YAML.parse(await Bun.file(path).text());
  } catch (error) {
    report.check(path, false, `invalid YAML (${(error as Error).message})`);
    continue;
  }
  const errors = validateCard(value);
  if (errors.length > 0) {
    report.check(path, false, errors.map((error) => error.replace(/^: /, "")).join("; "));
    continue;
  }
  // A path-looking evidence reference must resolve: a dangling reference was
  // found during phase 3.1 review, and this gate is the guard it called for.
  // existsSync, not Bun.file().exists(): a directory is a verifiable target.
  const dangling = collectPathReferences(value).filter((reference) => !existsSync(reference));
  // Preserve engineering computation checks without publishing its progress display.
  aggregateProgress(value);
  const name = (value as { project?: string }).project ?? path;
  report.check(
    `card ${name}`,
    dangling.length === 0,
    dangling.length === 0
      ? "private engineering schema valid, references resolve"
      : `evidence reference(s) do not resolve: ${dangling.join(", ")}`,
  );
}

// Zero cards trips the empty-gate rule on its own; the message names the home.
if (report.asserted === 0) {
  report.check("ecosystem/cards/", false, "no project card found (γ 3.2, design §6)");
}
concludeGate("Project cards", report);
