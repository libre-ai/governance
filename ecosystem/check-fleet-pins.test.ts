import { describe, expect, test } from "bun:test";
import { auditRepository, collectSightings, type RepositorySources } from "./check-fleet-pins";

// The gate's promise is that no governance revision reaches a consumer's
// required checks without passing through a declared generation. Its previous
// implementation read ONE `uses:` occurrence in ONE file (`ci.yml`), so every
// other consuming surface was invisible: a second workflow, a second job in the
// same workflow, or the `tooling_ref` input that decides which governance
// revision the template checks out for tooling. These tests pin the four
// surfaces, and the case that motivated the rewrite comes first.

const G1 = "9511c4087f284d0242fc4a202b2f1452228c16c3";
const G2 = "8b641394ed436fe68f03fe0c2073b4fe978dd3ac";
const G4 = "f767f2fb96c93e86eb6451d4dd1e80d250da2027";
const UNDECLARED = "1111111111111111111111111111111111111111";
// Oldest first, as declared — auditRepository measures age against this order.
const generations: readonly string[] = [G1, G2];

const sources = (
  workflows: Record<string, string>,
  manifest: string | null,
  projectCard: string | null = null,
): RepositorySources => ({
  workflows: new Map(Object.entries(workflows)),
  manifest,
  projectCard,
});

const projectCard = (sha: string) =>
  `dependencies:\n  - on: libre-ai/governance\n    why: "gates"\n    pinned: "github:libre-ai/governance#${sha}"\n`;

const gitDep = (sha: string) =>
  `{"devDependencies":{"@libre-ai/governance":"github:libre-ai/governance#${sha}"}}`;

const ci = (usesRef: string, toolingRef: string) => `
jobs:
  licensing:
    uses: libre-ai/governance/.github/workflows/reusable-licensing.yml@${usesRef}
    with:
      tooling_ref: ${toolingRef}
`;

const contextHygiene = (ref: string) => `
jobs:
  context-hygiene:
    uses: libre-ai/governance/.github/workflows/reusable-context-hygiene.yml@${ref}
`;

describe("auditRepository", () => {
  test("an unpinned template slipped in beside a valid pin fails the gate", () => {
    // The exact case simulated in K4 review of PR #3: a third template adopted
    // at a mutable ref, next to a correctly pinned one. Reading a single
    // `uses:` occurrence let the licensing pin answer for the whole file.
    const failures = auditRepository(
      "libre-ai/sdk-rs",
      sources(
        {
          "ci.yml": `${ci(G1, G1)}
  dependency-policy:
    uses: libre-ai/governance/.github/workflows/reusable-dependency-policy.yml@main
`,
        },
        gitDep(G1),
      ),
      generations,
    );
    expect(failures).toEqual([
      "libre-ai/sdk-rs: ci.yml pins reusable-dependency-policy.yml@main — not a 40-character commit sha",
    ]);
  });

  test("a second workflow file is inspected, not only ci.yml", () => {
    // context-hygiene.yml carries a governance pin in every consumer of the
    // fleet and was never read: `@main` there was invisible.
    const failures = auditRepository(
      "libre-ai/ui",
      sources({ "ci.yml": ci(G1, G1), "context-hygiene.yml": contextHygiene("main") }, gitDep(G1)),
      generations,
    );
    expect(failures).toEqual([
      "libre-ai/ui: context-hygiene.yml pins reusable-context-hygiene.yml@main — not a 40-character commit sha",
    ]);
  });

  test("an unpinned tooling_ref fails even when every uses: is pinned", () => {
    // reusable-licensing.yml checks governance out at `ref: inputs.tooling_ref`
    // to run its tooling; a mutable value there executes unpinned tooling
    // inside a required check, which is what the pin exists to prevent.
    const failures = auditRepository(
      "libre-ai/auth",
      sources({ "ci.yml": ci(G1, "main") }, gitDep(G1)),
      generations,
    );
    expect(failures).toEqual([
      "libre-ai/auth: ci.yml pins tooling_ref@main — not a 40-character commit sha",
    ]);
  });

  test("a short sha is not a pin", () => {
    const failures = auditRepository(
      "libre-ai/data",
      sources({ "ci.yml": ci("9511c40", "9511c40") }, gitDep(G1)),
      generations,
    );
    expect(failures).toEqual([
      "libre-ai/data: ci.yml pins reusable-licensing.yml@9511c40 — not a 40-character commit sha",
      "libre-ai/data: ci.yml pins tooling_ref@9511c40 — not a 40-character commit sha",
    ]);
  });

  test("a half-bumped repository is inconsistent, not silently accepted", () => {
    const failures = auditRepository(
      "libre-ai/testing",
      sources({ "ci.yml": ci(G2, G2), "context-hygiene.yml": contextHygiene(G1) }, gitDep(G2)),
      generations,
    );
    expect(failures).toEqual([
      "libre-ai/testing: pins disagree — ci.yml:reusable-licensing.yml@8b641394, ci.yml:tooling_ref@8b641394, context-hygiene.yml:reusable-context-hygiene.yml@9511c408, package.json:tooling git-dep@8b641394",
    ]);
  });

  test("a pin absent from the register fails the repository", () => {
    const failures = auditRepository(
      "libre-ai/starter",
      sources(
        { "ci.yml": ci(UNDECLARED, UNDECLARED), "context-hygiene.yml": contextHygiene(UNDECLARED) },
        gitDep(UNDECLARED),
      ),
      generations,
    );
    expect(failures).toEqual([
      "libre-ai/starter: pin 11111111 is not a declared generation (fleet-pins.v1.yaml)",
    ]);
  });

  test("a fully coherent repository produces no failure", () => {
    const failures = auditRepository(
      "libre-ai/contracts",
      sources({ "ci.yml": ci(G1, G1), "context-hygiene.yml": contextHygiene(G1) }, gitDep(G1)),
      generations,
    );
    expect(failures).toEqual([]);
  });

  test("a repository consuming no template is skipped by construction", () => {
    const failures = auditRepository(
      "libre-ai/db-inspect",
      sources({ "ci.yml": "jobs:\n  build:\n    runs-on: ubuntu-latest\n" }, '{"name":"x"}'),
      generations,
    );
    expect(failures).toEqual([]);
  });

  test("a project card pinning a different generation than CI wiring disagrees", () => {
    // orchestrator, 2026-08-18: every CI surface was already on the latest
    // generation, but project.v1.yaml — read by a human, not by CI — had
    // drifted to an older one nobody bumped. The card is a fourth surface,
    // not a footnote: this is exactly the "pins disagree" shape.
    const failures = auditRepository(
      "libre-ai/orchestrator",
      sources(
        { "ci.yml": ci(G2, G2), "context-hygiene.yml": contextHygiene(G2) },
        gitDep(G2),
        projectCard(G1),
      ),
      generations,
    );
    expect(failures).toEqual([
      "libre-ai/orchestrator: pins disagree — ci.yml:reusable-licensing.yml@8b641394, ci.yml:tooling_ref@8b641394, context-hygiene.yml:reusable-context-hygiene.yml@8b641394, package.json:tooling git-dep@8b641394, project.v1.yaml:project card pin@9511c408",
    ]);
  });

  test("a project card agreeing with every CI surface produces no failure", () => {
    const failures = auditRepository(
      "libre-ai/envelope",
      sources(
        { "ci.yml": ci(G2, G2), "context-hygiene.yml": contextHygiene(G2) },
        gitDep(G2),
        projectCard(G2),
      ),
      generations,
    );
    expect(failures).toEqual([]);
  });

  test("a declared pin more than two generations behind the latest is stale", () => {
    // Declared and consistent is not the same claim as current: a repository
    // nobody has bumped through three template evolutions is silent drift
    // wearing a green gate, same problem the register's whole point-in-time
    // convergence exists to fix.
    const fourGenerations = [G1, G2, "3333333333333333333333333333333333333333", G4];
    const failures = auditRepository(
      "libre-ai/starter",
      sources({ "ci.yml": ci(G1, G1), "context-hygiene.yml": contextHygiene(G1) }, gitDep(G1)),
      fourGenerations,
    );
    expect(failures).toEqual([
      "libre-ai/starter: pin 9511c408 is 3 generations behind the latest declared (fleet-pins.v1.yaml) — stale beyond the two-generation grace window",
    ]);
  });

  test("a declared pin exactly two generations behind is within the grace window", () => {
    const fourGenerations = [G1, G2, "3333333333333333333333333333333333333333", G4];
    const failures = auditRepository(
      "libre-ai/starter",
      sources({ "ci.yml": ci(G2, G2), "context-hygiene.yml": contextHygiene(G2) }, gitDep(G2)),
      fourGenerations,
    );
    expect(failures).toEqual([]);
  });

  test("age is not computed on top of a disagreement or undeclared failure", () => {
    // A repository already failing for a sharper reason should not also
    // carry an age claim: distinct.size !== 1 skips the age check entirely.
    const failures = auditRepository(
      "libre-ai/missions",
      sources(
        { "ci.yml": ci(UNDECLARED, UNDECLARED), "context-hygiene.yml": contextHygiene(UNDECLARED) },
        gitDep(UNDECLARED),
      ),
      [G1, G2, "3333333333333333333333333333333333333333", G4],
    );
    expect(failures).toEqual([
      "libre-ai/missions: pin 11111111 is not a declared generation (fleet-pins.v1.yaml)",
    ]);
  });
});

describe("collectSightings", () => {
  test("every consuming surface of a repository is sighted", () => {
    const sightings = collectSightings(
      sources(
        { "ci.yml": ci(G1, G1), "context-hygiene.yml": contextHygiene(G1) },
        gitDep(G1),
        projectCard(G1),
      ),
    );
    expect(sightings).toEqual([
      { source: "ci.yml", subject: "reusable-licensing.yml", ref: G1 },
      { source: "ci.yml", subject: "tooling_ref", ref: G1 },
      { source: "context-hygiene.yml", subject: "reusable-context-hygiene.yml", ref: G1 },
      { source: "package.json", subject: "tooling git-dep", ref: G1 },
      { source: "project.v1.yaml", subject: "project card pin", ref: G1 },
    ]);
  });

  test("a repository with no project card contributes no fourth sighting", () => {
    const sightings = collectSightings(
      sources({ "ci.yml": ci(G1, G1), "context-hygiene.yml": contextHygiene(G1) }, gitDep(G1)),
    );
    expect(sightings).toEqual([
      { source: "ci.yml", subject: "reusable-licensing.yml", ref: G1 },
      { source: "ci.yml", subject: "tooling_ref", ref: G1 },
      { source: "context-hygiene.yml", subject: "reusable-context-hygiene.yml", ref: G1 },
      { source: "package.json", subject: "tooling git-dep", ref: G1 },
    ]);
  });

  test("a commented example is documentation, not a pin", () => {
    // governance's own templates document their consumption as
    // `#   uses: libre-ai/governance/...@<sha>`. The gate covers governance
    // itself, so reading prose as a pin would make the authority fail on its
    // own documentation.
    const sightings = collectSightings(
      sources(
        {
          "reusable-licensing.yml":
            "# Fleet gate template (design §5.3): consumed as\n" +
            "#   uses: libre-ai/governance/.github/workflows/reusable-licensing.yml@<sha>\n" +
            "on:\n  workflow_call:\n    inputs:\n      tooling_ref:\n        required: true\n",
        },
        null,
      ),
    );
    expect(sightings).toEqual([]);
  });
});
