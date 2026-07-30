import { describe, expect, test } from "bun:test";

import { parseFleet, reviewRepository } from "./check-fleet-presentation";
import { renderStatusSection } from "./project-cards";

const card = `schema_version: libre-ai.project.v1
project: demo
repository: libre-ai/demo
kind: satellite
layer: couche-4
statement:
  for: "les projets de la constellation"
  who_faces: "des machineries recopiées"
  enables: "consommer une brique unique"
  producing:
    - "une brique testée"
  without_depending_on:
    - "aucun service tiers"
summary: "Brique de démonstration du gate."
current_situation: >-
  En service.
scope:
  - "démonstration"
non_goals:
  - "seconde implémentation"
dependencies: []
maturity: usable
confidence: medium
exposure: spec-published
freshness:
  last_verified_on: "2026-07-30"
scope_stability: stable
phases:
  - id: service
    title: En service
    exit_criteria:
      - id: consumed
        text: "La brique est consommée épinglée."
        weight: 1
        status: accepted
        evidence:
          date: "2026-07-29"
          reference: "gate-acceptance-log 2026-07-29 (ligne 3.4)"
`;

function readmeFor(text: string): string {
  const section = renderStatusSection(
    (Bun as unknown as { YAML: { parse(t: string): unknown } }).YAML.parse(text),
  );
  return `# Demo\n\n## État du projet\n\n${section}\n`;
}

describe("reviewRepository", () => {
  test("accepts a valid card with a coherent README status section", () => {
    const entry = { repository: "libre-ai/demo", role: "satellite", card: "project.v1.yaml" };
    const files = new Map([
      ["libre-ai/demo:project.v1.yaml", card],
      ["libre-ai/demo:README.md", readmeFor(card)],
    ]);
    const review = reviewRepository(entry, (r, p) => files.get(`${r}:${p}`) ?? null);
    expect(review.skipped).toBe(false);
    expect(review.failures).toEqual([]);
  });

  test("fails on a README whose generated section diverges from the card", () => {
    const entry = { repository: "libre-ai/demo", role: "satellite", card: "project.v1.yaml" };
    const stale = readmeFor(card).replace("usable", "proven");
    const files = new Map([
      ["libre-ai/demo:project.v1.yaml", card],
      ["libre-ai/demo:README.md", stale],
    ]);
    const review = reviewRepository(entry, (r, p) => files.get(`${r}:${p}`) ?? null);
    expect(review.failures.length).toBeGreaterThan(0);
    expect(review.failures[0]).toContain("diverges");
  });

  test("fails on a declared card that is missing at main", () => {
    const entry = { repository: "libre-ai/demo", role: "satellite", card: "project.v1.yaml" };
    const review = reviewRepository(entry, () => null);
    expect(review.failures).toEqual([
      "libre-ai/demo: declared card project.v1.yaml is missing at main",
    ]);
  });

  test("fails on an invalid card before ever reading the README", () => {
    const entry = { repository: "libre-ai/demo", role: "satellite", card: "project.v1.yaml" };
    const broken = card.replace("kind: satellite", "kind: spaceship");
    const review = reviewRepository(entry, (_r, p) => (p === "project.v1.yaml" ? broken : null));
    expect(review.failures.length).toBeGreaterThan(0);
    expect(review.failures[0]).toContain("invalid card");
  });

  test("skips an entry without a declared card, and says so", () => {
    const entry = { repository: "libre-ai/.github", role: "org-profile" };
    const review = reviewRepository(entry, () => null);
    expect(review.skipped).toBe(true);
    expect(review.failures).toEqual([]);
  });

  test("hub role validates the card but exempts the README check", () => {
    const entry = { repository: "libre-ai/libre-ai", role: "hub", card: "ecosystem/cards/x.yaml" };
    const review = reviewRepository(entry, (_r, p) =>
      p === "ecosystem/cards/x.yaml" ? card : null,
    );
    expect(review.skipped).toBe(false);
    expect(review.failures).toEqual([]);
  });
});

describe("parseFleet", () => {
  test("keeps the card pointer only when declared", () => {
    const fleet = parseFleet(
      "repositories:\n  - repository: libre-ai/a\n    role: satellite\n    card: project.v1.yaml\n  - repository: libre-ai/b\n    role: org-profile\n",
    );
    expect(fleet[0]?.card).toBe("project.v1.yaml");
    expect(fleet[1]?.card).toBeUndefined();
  });
});
