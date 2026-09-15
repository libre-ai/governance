import { describe, expect, test } from "bun:test";

import { firstDifference } from "./check-dependabot-conformance";
import {
  buildBatchQuery,
  loadTemplates,
  parseBatchResponse,
  parseTemplate,
  reviewEvidence,
  selectVariant,
  TEMPLATE_VARIANTS,
} from "./check-evidence-conformance";

const templates = await loadTemplates();
const driftedFixture = await Bun.file(
  new URL("fixtures/evidence/drifted.json", import.meta.url),
).text();
const graphqlFixture = JSON.parse(
  await Bun.file(new URL("fixtures/evidence/graphql-response.json", import.meta.url)).text(),
) as { readonly data: Record<string, unknown> };

const active = (repository: string) => ({
  repository,
  role: "satellite",
  layer: "couche-4",
  lifecycle: "active",
});

describe("template variants (distribution/templates/evidence)", () => {
  test("exactly three variants are published, non-empty, newline-terminated", () => {
    expect([...TEMPLATE_VARIANTS]).toEqual(["bun", "cargo", "bun-cargo"]);
    for (const variant of TEMPLATE_VARIANTS) {
      expect(templates[variant].length).toBeGreaterThan(0);
      expect(templates[variant].endsWith("\n")).toBe(true);
    }
  });

  test("the template directory holds nothing but the published variants", async () => {
    const directory = new URL("../distribution/templates/evidence/", import.meta.url);
    const files = (
      await Array.fromAsync(new Bun.Glob("*").scan({ cwd: Bun.fileURLToPath(directory) }))
    ).sort();
    expect(files).toEqual(TEMPLATE_VARIANTS.map((variant) => `${variant}.json`).sort());
  });

  test("every variant is a version-1 recipe with the reminder policy and at least one required check", () => {
    for (const variant of TEMPLATE_VARIANTS) {
      const parsed = parseTemplate(templates[variant]);
      expect(parsed.schema_version).toBe(1);
      expect(parsed.policy).toBe("remind");
      expect(parsed.checks.some((check) => check.required)).toBe(true);
      expect(parsed.notes).toContain(`distribution/templates/evidence/${variant}.json`);
      for (const check of parsed.checks) {
        // Bare executable names only: no path, no shell, as pi-evidence enforces.
        expect(check.command).toMatch(/^[A-Za-z0-9._+-]+$/);
        expect(check.timeout_seconds).toBeGreaterThan(0);
      }
    }
  });

  test("the variants declare exactly the checks their names promise", () => {
    expect(parseTemplate(templates.bun).checks.map((c) => c.id)).toEqual(["check"]);
    expect(parseTemplate(templates.cargo).checks.map((c) => c.id)).toEqual([
      "cargo-test",
      "cargo-clippy",
      "cargo-fmt",
    ]);
    expect(parseTemplate(templates["bun-cargo"]).checks.map((c) => c.id)).toEqual([
      "check",
      "cargo-test",
      "cargo-clippy",
      "cargo-fmt",
    ]);
  });

  test("a check block is identical wherever it appears", () => {
    const seen = new Map<string, Set<string>>();
    for (const variant of TEMPLATE_VARIANTS) {
      for (const check of parseTemplate(templates[variant]).checks) {
        const set = seen.get(check.id) ?? new Set<string>();
        set.add(JSON.stringify(check));
        seen.set(check.id, set);
      }
    }
    for (const [id, blocks] of seen) {
      expect(`${id}: ${blocks.size} distinct block(s)`).toBe(`${id}: 1 distinct block(s)`);
    }
  });

  test("only the composite check is required on the bun side; cargo fmt never blocks", () => {
    const bun = parseTemplate(templates.bun).checks[0];
    expect(bun?.command).toBe("bun");
    expect(bun?.args).toEqual(["run", "check"]);
    expect(bun?.required).toBe(true);
    const fmt = parseTemplate(templates.cargo).checks.find((c) => c.id === "cargo-fmt");
    expect(fmt?.required).toBe(false);
  });

  test("governance itself carries the bun variant byte-exact", async () => {
    const own = await Bun.file(new URL("../.evidence.json", import.meta.url)).text();
    expect(firstDifference(templates.bun, own)).toBeNull();
  });
});

describe("selectVariant", () => {
  test("maps the manifest set to a variant", () => {
    expect(selectVariant({ packageJson: true, cargoToml: false })).toBe("bun");
    expect(selectVariant({ packageJson: false, cargoToml: true })).toBe("cargo");
    expect(selectVariant({ packageJson: true, cargoToml: true })).toBe("bun-cargo");
  });

  test("returns null when there is nothing to run", () => {
    expect(selectVariant({ packageJson: false, cargoToml: false })).toBeNull();
  });
});

describe("reviewEvidence", () => {
  const ok = { text: null, error: null };

  test("archived repositories are exempt, asserted", () => {
    const outcome = reviewEvidence(
      { ...active("libre-ai/x"), lifecycle: "archived" },
      { config: ok, manifests: null, fetchError: null },
      templates,
    );
    expect(outcome.exempt).toBe(true);
    expect(outcome.failures).toEqual([]);
  });

  test("a repository without any manifest is exempt, asserted, never missing", () => {
    const outcome = reviewEvidence(
      active("libre-ai/docs-only"),
      { config: ok, manifests: { packageJson: false, cargoToml: false }, fetchError: null },
      templates,
    );
    expect(outcome.exempt).toBe(true);
    expect(outcome.notes[0]).toContain("no executable check to declare");
  });

  test("unreachable repositories are unable-to-verify, never missing", () => {
    const outcome = reviewEvidence(
      active("libre-ai/x"),
      { config: { text: null, error: "boom" }, manifests: null, fetchError: "boom" },
      templates,
    );
    expect(outcome.failures[0]).toContain("unable to verify");
    const configError = reviewEvidence(
      active("libre-ai/x"),
      {
        config: { text: null, error: "rate limited" },
        manifests: { packageJson: true, cargoToml: false },
        fetchError: null,
      },
      templates,
    );
    expect(configError.failures[0]).toContain("unable to verify");
  });

  test("a missing recipe names the expected variant", () => {
    const outcome = reviewEvidence(
      active("libre-ai/x"),
      { config: ok, manifests: { packageJson: true, cargoToml: true }, fetchError: null },
      templates,
    );
    expect(outcome.failures[0]).toContain("expected the bun-cargo variant");
  });

  test("a drifted recipe names the first differing line", () => {
    const outcome = reviewEvidence(
      active("libre-ai/x"),
      {
        config: { text: driftedFixture, error: null },
        manifests: { packageJson: true, cargoToml: false },
        fetchError: null,
      },
      templates,
    );
    expect(outcome.failures[0]).toContain("differs from the bun variant");
    expect(outcome.failures[0]).toContain("first difference at line 3");
  });

  test("a byte-exact copy passes", () => {
    const outcome = reviewEvidence(
      active("libre-ai/x"),
      {
        config: { text: templates.cargo, error: null },
        manifests: { packageJson: false, cargoToml: true },
        fetchError: null,
      },
      templates,
    );
    expect(outcome.failures).toEqual([]);
    expect(outcome.notes[0]).toContain("byte-exact copy of the cargo variant");
  });
});

describe("GraphQL batch", () => {
  const repositories = [
    "libre-ai/conformant",
    "libre-ai/missing",
    "libre-ai/drifted",
    "libre-ai/unresolved",
    "libre-ai/docs-only",
  ];

  test("builds one aliased block per repository with both manifests", () => {
    const query = buildBatchQuery(repositories);
    expect(query).toContain('repo0: repository(owner: "libre-ai", name: "conformant")');
    expect(query).toContain("main:.evidence.json");
    expect(query).toContain("main:package.json");
    expect(query).toContain("main:Cargo.toml");
    expect(() => buildBatchQuery(["malformed"])).toThrow("owner/name");
  });

  test("parses the fixture into per-repository states and reviews them", () => {
    const data = JSON.parse(
      JSON.stringify(graphqlFixture.data)
        .replace("<TEMPLATE:bun>", JSON.stringify(templates.bun).slice(1, -1))
        .replace("<FIXTURE:drifted>", JSON.stringify(driftedFixture).slice(1, -1)),
    ) as Record<string, unknown>;
    const states = parseBatchResponse(repositories, data);
    const outcomes = repositories.map((repository) =>
      reviewEvidence(active(repository), states.get(repository) as never, templates),
    );
    expect(outcomes[0]?.failures).toEqual([]);
    expect(outcomes[1]?.failures[0]).toContain("missing at main — expected the bun-cargo variant");
    expect(outcomes[2]?.failures[0]).toContain("differs from the bun variant");
    expect(outcomes[3]?.failures[0]).toContain("unable to verify");
    expect(outcomes[4]?.exempt).toBe(true);
  });
});
