import { describe, expect, test } from "bun:test";
import { auditRepository, collectSightings, type RepositorySources } from "./check-fleet-pins";

// The gate's promise is that no governance revision reaches a consumer's
// required checks without passing through a declared generation. Its previous
// implementation read ONE `uses:` occurrence in ONE file (`ci.yml`), so every
// other consuming surface was invisible: a second workflow, a second job in the
// same workflow, or the `tooling_ref` input that decides which governance
// revision the template checks out for tooling. These tests pin the three
// surfaces, and the case that motivated the rewrite comes first.

const G1 = "9511c4087f284d0242fc4a202b2f1452228c16c3";
const G2 = "8b641394ed436fe68f03fe0c2073b4fe978dd3ac";
const UNDECLARED = "1111111111111111111111111111111111111111";
const declared: ReadonlySet<string> = new Set([G1, G2]);

const sources = (
  workflows: Record<string, string>,
  manifest: string | null,
): RepositorySources => ({
  workflows: new Map(Object.entries(workflows)),
  manifest,
});

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
      declared,
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
      declared,
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
      declared,
    );
    expect(failures).toEqual([
      "libre-ai/auth: ci.yml pins tooling_ref@main — not a 40-character commit sha",
    ]);
  });

  test("a short sha is not a pin", () => {
    const failures = auditRepository(
      "libre-ai/data",
      sources({ "ci.yml": ci("9511c40", "9511c40") }, gitDep(G1)),
      declared,
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
      declared,
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
      declared,
    );
    expect(failures).toEqual([
      "libre-ai/starter: pin 11111111 is not a declared generation (fleet-pins.v1.yaml)",
    ]);
  });

  test("a fully coherent repository produces no failure", () => {
    const failures = auditRepository(
      "libre-ai/contracts",
      sources({ "ci.yml": ci(G1, G1), "context-hygiene.yml": contextHygiene(G1) }, gitDep(G1)),
      declared,
    );
    expect(failures).toEqual([]);
  });

  test("a repository consuming no template is skipped by construction", () => {
    const failures = auditRepository(
      "libre-ai/db-inspect",
      sources({ "ci.yml": "jobs:\n  build:\n    runs-on: ubuntu-latest\n" }, '{"name":"x"}'),
      declared,
    );
    expect(failures).toEqual([]);
  });
});

describe("collectSightings", () => {
  test("every consuming surface of a repository is sighted", () => {
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
