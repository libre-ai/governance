import { describe, expect, test } from "bun:test";

import {
  buildBatchQuery,
  firstDifference,
  loadTemplates,
  parseBatchResponse,
  reviewDependabot,
  selectVariant,
  splitTemplate,
  TEMPLATE_VARIANTS,
} from "./check-dependabot-conformance";

const templates = await loadTemplates();
const driftedFixture = await Bun.file(
  new URL("fixtures/dependabot/drifted.yml", import.meta.url),
).text();
const graphqlFixture = JSON.parse(
  await Bun.file(new URL("fixtures/dependabot/graphql-response.json", import.meta.url)).text(),
) as { readonly data: Record<string, unknown> };

const active = (repository: string) => ({
  repository,
  role: "satellite",
  layer: "couche-4",
  lifecycle: "active",
});

describe("template variants (distribution/templates/dependabot)", () => {
  test("all four variants are published and non-empty", () => {
    expect([...TEMPLATE_VARIANTS]).toEqual(["github-actions", "bun", "cargo", "bun-cargo"]);
    for (const variant of TEMPLATE_VARIANTS) {
      expect(templates[variant].length).toBeGreaterThan(0);
      expect(templates[variant].endsWith("\n")).toBe(true);
    }
  });

  test("every variant declares exactly the ecosystems its name promises, in order", () => {
    expect(splitTemplate(templates["github-actions"]).ecosystems).toEqual(["github-actions"]);
    expect(splitTemplate(templates.bun).ecosystems).toEqual(["github-actions", "bun"]);
    expect(splitTemplate(templates.cargo).ecosystems).toEqual(["github-actions", "cargo"]);
    expect(splitTemplate(templates["bun-cargo"]).ecosystems).toEqual([
      "github-actions",
      "bun",
      "cargo",
    ]);
  });

  test("the header is byte-identical across variants", () => {
    const headers = new Set(TEMPLATE_VARIANTS.map((v) => splitTemplate(templates[v]).header));
    expect(headers.size).toBe(1);
  });

  test("an ecosystem block is byte-identical wherever it appears", () => {
    const blocksByEcosystem = new Map<string, Set<string>>();
    for (const variant of TEMPLATE_VARIANTS) {
      for (const [ecosystem, block] of splitTemplate(templates[variant]).blocks) {
        const set = blocksByEcosystem.get(ecosystem) ?? new Set<string>();
        set.add(block);
        blocksByEcosystem.set(ecosystem, set);
      }
    }
    for (const [ecosystem, blocks] of blocksByEcosystem) {
      expect(`${ecosystem}: ${blocks.size} distinct block(s)`).toBe(
        `${ecosystem}: 1 distinct block(s)`,
      );
    }
  });

  test("the header names the release-age guard and the DCO generation", () => {
    const { header } = splitTemplate(templates.bun);
    expect(header).toContain("minimumReleaseAge");
    expect(header).toContain("259200");
    expect(header).toContain("767ee84a");
  });

  test("every block carries the fleet conventions", () => {
    for (const [, block] of splitTemplate(templates["bun-cargo"]).blocks) {
      expect(block).toContain('directory: "/"');
      expect(block).toContain("interval: weekly");
      expect(block).toContain("open-pull-requests-limit:");
      expect(block).toContain('prefix: "chore(deps)"');
      expect(block).toContain("default-days: 3");
      expect(block).toContain("groups:");
    }
  });

  test("governance itself carries the bun variant byte-exact", async () => {
    const own = await Bun.file(new URL("../.github/dependabot.yml", import.meta.url)).text();
    expect(firstDifference(templates.bun, own)).toBeNull();
  });

  test("every variant parses as a version-2 Dependabot configuration", () => {
    for (const variant of TEMPLATE_VARIANTS) {
      const parsed = Bun.YAML.parse(templates[variant]) as {
        readonly version: number;
        readonly updates: readonly { readonly "package-ecosystem": string }[];
      };
      expect(parsed.version).toBe(2);
      expect(parsed.updates.length).toBeGreaterThan(0);
    }
  });
});

describe("selectVariant", () => {
  test("maps the manifest set to a variant", () => {
    expect(selectVariant({ workflows: true, packageJson: false, cargoToml: false })).toBe(
      "github-actions",
    );
    expect(selectVariant({ workflows: true, packageJson: true, cargoToml: false })).toBe("bun");
    expect(selectVariant({ workflows: true, packageJson: false, cargoToml: true })).toBe("cargo");
    expect(selectVariant({ workflows: true, packageJson: true, cargoToml: true })).toBe(
      "bun-cargo",
    );
  });

  test("returns null when no variant is published for the manifest set", () => {
    expect(selectVariant({ workflows: false, packageJson: true, cargoToml: false })).toBeNull();
    expect(selectVariant({ workflows: false, packageJson: false, cargoToml: false })).toBeNull();
  });
});

describe("firstDifference", () => {
  test("null for identical texts", () => {
    expect(firstDifference("a\nb\n", "a\nb\n")).toBeNull();
  });

  test("names the first differing line, 1-based", () => {
    expect(firstDifference("a\nb\nc\n", "a\nB\nc\n")).toEqual({
      line: 2,
      expected: "b",
      actual: "B",
    });
  });

  test("a missing trailing newline is a difference", () => {
    expect(firstDifference("a\n", "a")).toEqual({ line: 2, expected: "", actual: "<end of file>" });
  });

  test("extra trailing content is a difference", () => {
    // The segment after the expected text's final newline is empty, not
    // absent: line 2 exists on both sides and differs.
    expect(firstDifference("a\n", "a\nb\n")).toEqual({ line: 2, expected: "", actual: "b" });
  });
});

describe("reviewDependabot", () => {
  test("archived entries are exempt, asserted rather than skipped", () => {
    const outcome = reviewDependabot(
      { ...active("libre-ai/libre-ai"), lifecycle: "archived" },
      { config: { text: null, error: null }, manifests: null, fetchError: null },
      templates,
    );
    expect(outcome.failures).toEqual([]);
    expect(outcome.exempt).toBe(true);
    expect(outcome.notes[0]).toContain("archived");
  });

  test("a byte-exact copy of the selected variant conforms", () => {
    const outcome = reviewDependabot(
      active("libre-ai/sdk-ts"),
      {
        config: { text: templates.bun, error: null },
        manifests: { workflows: true, packageJson: true, cargoToml: false },
        fetchError: null,
      },
      templates,
    );
    expect(outcome.failures).toEqual([]);
    expect(outcome.notes).toEqual(["byte-exact copy of the bun variant"]);
  });

  test("a confirmed absence is reported as missing, naming the expected variant", () => {
    const outcome = reviewDependabot(
      active("libre-ai/db-inspect"),
      {
        config: { text: null, error: null },
        manifests: { workflows: true, packageJson: false, cargoToml: true },
        fetchError: null,
      },
      templates,
    );
    expect(outcome.failures).toEqual([
      ".github/dependabot.yml is missing at main — expected the cargo variant (distribution/templates/dependabot/cargo.yml)",
    ]);
  });

  test("a drifted copy names the variant and the first differing line", () => {
    const outcome = reviewDependabot(
      active("libre-ai/notebook"),
      {
        config: { text: driftedFixture, error: null },
        manifests: { workflows: true, packageJson: true, cargoToml: true },
        fetchError: null,
      },
      templates,
    );
    expect(outcome.failures.length).toBe(1);
    expect(outcome.failures[0]).toContain("differs from the bun-cargo variant");
    expect(outcome.failures[0]).toContain("first difference at line 1");
  });

  test("a wrong variant is a drift, not a pass", () => {
    const outcome = reviewDependabot(
      active("libre-ai/harness"),
      {
        config: { text: templates.bun, error: null },
        manifests: { workflows: true, packageJson: true, cargoToml: true },
        fetchError: null,
      },
      templates,
    );
    expect(outcome.failures.length).toBe(1);
    expect(outcome.failures[0]).toContain("differs from the bun-cargo variant");
  });

  test("an unreachable repository is unable-to-verify, never missing", () => {
    const outcome = reviewDependabot(
      active("libre-ai/auth"),
      {
        config: { text: null, error: "rate limited" },
        manifests: null,
        fetchError: "rate limited",
      },
      templates,
    );
    expect(outcome.failures).toEqual([
      "unable to verify .github/dependabot.yml at main: rate limited",
    ]);
  });

  test("a manifest set with no published variant fails loudly", () => {
    const outcome = reviewDependabot(
      active("libre-ai/odd"),
      {
        config: { text: null, error: null },
        manifests: { workflows: false, packageJson: true, cargoToml: false },
        fetchError: null,
      },
      templates,
    );
    expect(outcome.failures.length).toBe(1);
    expect(outcome.failures[0]).toContain("no template variant published for manifest set");
  });
});

describe("GraphQL fleet batch", () => {
  const repositories = [
    "libre-ai/sdk-ts",
    "libre-ai/db-inspect",
    "libre-ai/notebook",
    "libre-ai/gone",
  ];

  test("buildBatchQuery aliases by index and asks for the config and the three manifests", () => {
    const query = buildBatchQuery(repositories);
    expect(query).toContain('repo0: repository(owner: "libre-ai", name: "sdk-ts")');
    expect(query).toContain('repo3: repository(owner: "libre-ai", name: "gone")');
    expect(query).toContain('config: object(expression: "main:.github/dependabot.yml")');
    expect(query).toContain('packageJson: object(expression: "main:package.json")');
    expect(query).toContain('cargoToml: object(expression: "main:Cargo.toml")');
    expect(query).toContain('workflows: object(expression: "main:.github/workflows")');
  });

  test("buildBatchQuery rejects a malformed repository entry", () => {
    expect(() => buildBatchQuery(["no-slash"])).toThrow(/malformed repository entry/);
  });

  test("parseBatchResponse maps the fixture into per-repository states", () => {
    const data = JSON.parse(
      JSON.stringify(graphqlFixture.data)
        .replace("<TEMPLATE:bun>", JSON.stringify(templates.bun).slice(1, -1))
        .replace("<FIXTURE:drifted>", JSON.stringify(driftedFixture).slice(1, -1)),
    ) as Record<string, unknown>;
    const states = parseBatchResponse(repositories, data);

    expect(states.get("libre-ai/sdk-ts")).toEqual({
      config: { text: templates.bun, error: null },
      manifests: { workflows: true, packageJson: true, cargoToml: false },
      fetchError: null,
    });
    expect(states.get("libre-ai/db-inspect")).toEqual({
      config: { text: null, error: null },
      manifests: { workflows: true, packageJson: false, cargoToml: true },
      fetchError: null,
    });
    expect(states.get("libre-ai/notebook")?.config.text).toBe(driftedFixture);
    const gone = states.get("libre-ai/gone");
    expect(gone?.manifests).toBeNull();
    expect(gone?.fetchError).toContain("not resolvable via GraphQL");
    expect(gone?.config.error).toContain("not resolvable via GraphQL");
  });

  test("parseBatchResponse with no data marks every repository unable-to-verify", () => {
    const states = parseBatchResponse(repositories, undefined);
    for (const repository of repositories) {
      expect(states.get(repository)?.fetchError).not.toBeNull();
    }
  });
});
