import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { validateRepositoryContracts } from "./repository-contract";

async function catalog(): Promise<unknown> {
  return JSON.parse(await readFile(new URL("./repositories.v1.yaml", import.meta.url), "utf8"));
}
test("planning catalog preserves 20 exact targets without invented proof", async () => {
  const result = validateRepositoryContracts(await catalog());
  expect(result.errors).toEqual([]);
  expect(result.contracts).toHaveLength(20);
  expect(result.contracts.every((c) => c.evidence.length === 0)).toBe(true);
  expect(result.contracts.find((c) => c.slug === "db-inspect")?.displayName).toBe(
    "Libre AI Database Inspector",
  );
});
for (const attack of [
  "locale",
  "status",
  "unbounded",
  "dependencies",
  "topics",
  "topic-jargon",
  "agentic-topic",
  "url",
  "name",
  "signalement",
  "duplicate",
  "homepage",
  "html",
  "control",
])
  test(`rejects ${attack}`, async () => {
    const value = (await catalog()) as { repositories: Record<string, unknown>[] };
    const first = value.repositories[0];
    if (!first) throw new Error("fixture");
    switch (attack) {
      case "locale":
        first.benefit = { en: "Benefit" };
        break;
      case "status":
        first.status = "active";
        break;
      case "unbounded":
        first.benefit = { en: "Always secure", fr: "Toujours sûr" };
        break;
      case "dependencies":
        first.dependencies = ["missions", "sessions", "contracts", "governance"];
        break;
      case "topics":
        first.topics = ["one"];
        break;
      case "topic-jargon":
        first.topics = ["agent-workflows", "ai", "software", "rust", "local-first"];
        break;
      case "agentic-topic":
        first.topics = ["agentic-ai", "ai", "software", "rust", "local-first"];
        break;
      case "url":
        first.action = { label: { en: "Open", fr: "Ouvrir" }, url: "https://evil.invalid" };
        break;
      case "name":
        first.displayName = "Wrong";
        break;
      case "signalement":
        first.slug = "signalement";
        break;
      case "duplicate":
        value.repositories[1] = first;
        break;
      case "homepage":
        first.homepage = { url: "https://github.com/libre-ai/governance" };
        break;
      case "html":
        first.benefit = { en: "<script>x</script>", fr: "Texte" };
        break;
      case "control":
        first.benefit = { en: "Text\u0001", fr: "Texte" };
        break;
    }
    expect(validateRepositoryContracts(value).errors.length).toBeGreaterThan(0);
  });

test("rejects translated immutable versions", async () => {
  const value = (await catalog()) as { repositories: { benefit: { en: string; fr: string } }[] };
  if (value.repositories[0])
    value.repositories[0].benefit = { en: "Inspect API v1.2.3", fr: "Inspecter API v1.2.4" };
  expect(validateRepositoryContracts(value).errors.length).toBeGreaterThan(0);
});
test("all named fixtures exercise catalog validation", async () => {
  for (const name of [
    "valid-repositories",
    "invalid-status-jargon",
    "invalid-unbounded-claim",
    "invalid-dependency",
  ]) {
    const value = JSON.parse(
      await readFile(new URL(`./fixtures/${name}.v1.yaml`, import.meta.url), "utf8"),
    );
    const input =
      name === "valid-repositories"
        ? value
        : ((await catalog()) as { repositories: Record<string, unknown>[] });
    if (name !== "valid-repositories") {
      const target = input.repositories.find(
        (item: Record<string, unknown>) => item.slug === value.source,
      );
      if (!target) throw new Error("fixture-target-missing");
      Object.assign(target, value.replace);
    }
    expect(validateRepositoryContracts(input).errors.length === 0).toBe(
      name === "valid-repositories",
    );
  }
});

test("expresses approved self-host action and proved HTTPS homepage", async () => {
  const value = (await catalog()) as { repositories: Record<string, unknown>[] };
  const c = value.repositories.find((c) => c.slug === "missions");
  if (!c) throw new Error("fixture");
  const source = `https://github.com/libre-ai/missions/blob/${"e".repeat(40)}/docs/smoke.json`;
  c.action = {
    label: { en: "Run locally", fr: "Exécuter localement" },
    command: "bun run self-host",
  };
  c.proof = { kind: "evidence" };
  c.evidence = [
    {
      label: { en: "Synthetic smoke", fr: "Smoke synthétique" },
      source,
      contentDigest: "d".repeat(64),
      verifiedAt: "2026-09-11T00:00:00Z",
      limitation: { en: "Synthetic only", fr: "Synthétique uniquement" },
    },
  ];
  c.homepage = { url: "https://libre-ai.fr", smokeEvidence: source };
  expect(validateRepositoryContracts(value).errors).toEqual([]);
});
test("catalog names are exact LEXICON projections", async () => {
  const lexicon = await readFile(new URL("../docs/decisions/LEXICON.md", import.meta.url), "utf8");
  const labels = new Map(
    [...lexicon.matchAll(/^\| ([.a-z-]+) \| (Libre AI[^|]*?) \|$/gm)].map((m) => [m[1], m[2]]),
  );
  for (const c of validateRepositoryContracts(await catalog()).contracts)
    expect(c.displayName).toBe(labels.get(c.slug) ?? "");
});
