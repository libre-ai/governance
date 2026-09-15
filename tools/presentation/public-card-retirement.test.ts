import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";

const renderers = [
  "ecosystem/render-fleet-status.ts",
  "ecosystem/check-fleet-presentation.ts",
  "tools/presentation/render-org-readme.ts",
  "tools/presentation/check-org-readme-drift.ts",
  "tools/presentation/heal-org-readme.ts",
];
test.each(renderers)("%s has no old public card authority", async (path) => {
  const text = await readFile(new URL(`../../${path}`, import.meta.url), "utf8");
  expect(text).not.toMatch(
    /(?:from\s*["'][^"']*(?:project-cards|render-fleet-status)|ecosystem\/projections\/(?:fleet-status|public)\.v1\.json|\.layer\b|\.maturity\b|\.lifecycle\b|\.phases\b|aggregateProgress)/,
  );
});
test("transitive public presentation imports never reach card authority", async () => {
  const root = new URL("../../", import.meta.url).pathname;
  const queue = renderers.map((path) => resolve(root, path));
  const visited = new Set<string>();
  while (queue.length) {
    const path = queue.pop();
    if (!path || visited.has(path)) continue;
    visited.add(path);
    expect(path).not.toMatch(/\/(?:project-cards|build-index)\.ts$/);
    const source = await readFile(path, "utf8");
    expect(source).not.toMatch(/ecosystem\/projections\/(?:fleet-status|public)\.v1\.json/);
    for (const match of source.matchAll(/(?:from\s*|import\s*\()(["'])([^"']+)\1/g)) {
      const specifier = match[2];
      if (!specifier?.startsWith(".")) continue;
      const target = resolve(dirname(path), specifier);
      if (extname(target) && extname(target) !== ".ts") continue;
      queue.push(extname(target) ? target : `${target}.ts`);
    }
  }
  expect(visited.size).toBeGreaterThan(renderers.length);
});

test("every old emitted fact has an explicit disposition", async () => {
  const mapping = JSON.parse(
    await readFile(
      new URL("../../docs/migration/public-card-fact-map.json", import.meta.url),
      "utf8",
    ),
  );
  const oldFacts = [
    "repository",
    "project",
    "kind",
    "layer",
    "summary",
    "current_situation",
    "display",
    "maturity",
    "confidence",
    "exposure",
    "last_verified_on",
    "phase.title",
    "phase.ratio",
    "hub_state",
    "migration.removed",
    "migration.total",
    "knowledge.objects",
    "knowledge.relationships",
    "knowledge.status",
    "knowledge.trust",
    "fleet.schema_version",
    "fleet.source",
    ...[
      "knowledge.authority",
      "knowledge.id",
      "knowledge.kind",
      "knowledge.name",
      "knowledge.provenance",
      "knowledge.purpose",
      "knowledge.schemaVersion",
      "knowledge.version",
      "knowledge.selectionDigest",
      "knowledge.sourceSchemaVersion",
    ],
  ];
  expect(Object.keys(mapping).sort()).toEqual(oldFacts.sort());
  for (const disposition of Object.values(mapping)) {
    expect(typeof disposition).toBe("string");
    expect(String(disposition).length).toBeGreaterThan(20);
  }
});
