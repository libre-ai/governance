import { describe, expect, test } from "bun:test";

import {
  checkFreshness,
  claudeAdapterIssue,
  countLines,
  extractSections,
  hasAuthorityPointer,
  lastLifecycleTransition,
  layerMarkerOk,
  missingSections,
  parseRegistry,
  resolveLayerSpec,
  reviewContext,
} from "./check-context-conformance";

const POINTER = "https://raw.githubusercontent.com/libre-ai/governance/main/docs/README.md";

function agentsFixture(opts: {
  sections: readonly string[];
  layerMention: string;
  pointer?: string;
  padLines?: number;
}): string {
  const body = opts.sections
    .map((section) => `## ${section}\n\nContent for ${section}.\n`)
    .join("\n");
  const pad = opts.padLines ? "\n".repeat(opts.padLines) : "";
  return `# demo Canonical Agent Rules (${opts.layerMention})\n\n${body}\n${opts.pointer ?? POINTER}\n${pad}`;
}

describe("resolveLayerSpec", () => {
  test("couche-4 requires the base sections under a 40-line cap", () => {
    const spec = resolveLayerSpec({ layer: "couche-4", role: "satellite", lifecycle: "active" });
    expect(spec).toEqual({
      requiredSections: ["Authority", "Boundaries", "Quality gates", "Agents"],
      maxLines: 40,
    });
  });

  test("couche-3 and couche-2 share the base sections under a 45-line cap", () => {
    expect(resolveLayerSpec({ layer: "couche-3", role: "satellite", lifecycle: "active" })).toEqual(
      {
        requiredSections: ["Authority", "Boundaries", "Quality gates", "Agents"],
        maxLines: 45,
      },
    );
    expect(resolveLayerSpec({ layer: "couche-2", role: "satellite", lifecycle: "active" })).toEqual(
      {
        requiredSections: ["Authority", "Boundaries", "Quality gates", "Agents"],
        maxLines: 45,
      },
    );
  });

  test("transverse non-authority gets the 45-line base template", () => {
    expect(
      resolveLayerSpec({ layer: "transverse", role: "standalone-tool", lifecycle: "active" }),
    ).toEqual({
      requiredSections: ["Authority", "Boundaries", "Quality gates", "Agents"],
      maxLines: 45,
    });
  });

  test("transverse authority (governance, contracts) gets an 80-line cap", () => {
    expect(
      resolveLayerSpec({ layer: "transverse", role: "authority", lifecycle: "active" }),
    ).toEqual({
      requiredSections: ["Authority", "Boundaries", "Quality gates", "Agents"],
      maxLines: 80,
    });
  });

  test("couche-1 active gets the product template under a 60-line cap", () => {
    expect(
      resolveLayerSpec({ layer: "couche-1", role: "reserved-product-home", lifecycle: "active" }),
    ).toEqual({
      requiredSections: ["Purpose", "Domain doctrine", "Commands", "Working here"],
      maxLines: 60,
    });
  });

  test("an unmapped combination is reported, never guessed", () => {
    expect(
      resolveLayerSpec({ layer: "couche-1", role: "reserved-product-home", lifecycle: "archived" }),
    ).toBeNull();
    expect(resolveLayerSpec({ layer: "moyeu", role: "hub", lifecycle: "active" })).toBeNull();
  });

  test("moyeu has no named template — its one member is archived, fully exempted upstream", () => {
    expect(resolveLayerSpec({ layer: "moyeu", role: "hub", lifecycle: "archived" })).toBeNull();
  });
});

describe("extractSections / missingSections", () => {
  test("reads top-level ## headings only, not ### subsections", () => {
    const text = "# Title\n\n## Authority\n\n### Sub\n\n## Boundaries\n";
    expect(extractSections(text)).toEqual(["Authority", "Boundaries"]);
  });

  test("reports what is absent from the required list", () => {
    expect(
      missingSections(["Authority", "Boundaries", "Agents"], "## Authority\n## Agents\n"),
    ).toEqual(["Boundaries"]);
  });
});

describe("countLines", () => {
  test("counts lines without penalising a single trailing newline", () => {
    expect(countLines("a\nb\nc\n")).toBe(3);
    expect(countLines("a\nb\nc")).toBe(3);
  });
});

describe("hasAuthorityPointer", () => {
  test("accepts the raw.githubusercontent.com form", () => {
    expect(
      hasAuthorityPointer("see https://raw.githubusercontent.com/libre-ai/governance/main/x"),
    ).toBe(true);
  });

  test("accepts the github.com blob form for contracts", () => {
    expect(
      hasAuthorityPointer("see https://github.com/libre-ai/contracts/blob/main/README.md"),
    ).toBe(true);
  });

  test("rejects a prose-only mention with no URL", () => {
    expect(hasAuthorityPointer("doctrine lives in the governance repository")).toBe(false);
  });

  test("rejects a URL to an unrelated org or repo", () => {
    expect(
      hasAuthorityPointer("https://raw.githubusercontent.com/other-org/governance/main/x"),
    ).toBe(false);
    expect(hasAuthorityPointer("https://github.com/libre-ai/notebook/blob/main/x")).toBe(false);
  });
});

describe("layerMarkerOk", () => {
  test("matches couche-4 to a 'couche 4' mention", () => {
    expect(layerMarkerOk("couche-4", "this is a couche 4 brick")).toBe(true);
    expect(layerMarkerOk("couche-4", "this is a couche-4 brick")).toBe(true);
  });

  test("rejects a mismatched couche number", () => {
    expect(layerMarkerOk("couche-4", "this is a couche 3 brick")).toBe(false);
  });

  test("matches transverse and moyeu literally", () => {
    expect(layerMarkerOk("transverse", "a transverse concern")).toBe(true);
    expect(layerMarkerOk("moyeu", "the moyeu of the constellation")).toBe(true);
    expect(layerMarkerOk("moyeu", "the hub of the constellation")).toBe(false);
  });

  test("rejects when no marker is present at all", () => {
    expect(layerMarkerOk("couche-4", "no marker here")).toBe(false);
  });
});

describe("claudeAdapterIssue", () => {
  test("passes when AGENTS.md exists and CLAUDE.md is the byte-exact adapter", () => {
    expect(claudeAdapterIssue(true, "@AGENTS.md\n")).toBeNull();
  });

  test("fails when AGENTS.md exists but CLAUDE.md is missing", () => {
    expect(claudeAdapterIssue(true, null)).toContain("missing");
  });

  test("fails when CLAUDE.md diverges from the byte-exact adapter", () => {
    expect(claudeAdapterIssue(true, "@AGENTS.md")).toContain("byte-exact");
    expect(claudeAdapterIssue(true, "@AGENTS.md\n\n")).toContain("byte-exact");
  });

  test("passes when neither file exists", () => {
    expect(claudeAdapterIssue(false, null)).toBeNull();
  });

  test("fails when CLAUDE.md exists without AGENTS.md", () => {
    expect(claudeAdapterIssue(false, "@AGENTS.md\n")).toContain("without an AGENTS.md");
  });
});

describe("lastLifecycleTransition", () => {
  test("returns null when the value never changed since the entry existed", () => {
    const history = [
      { date: "2026-01-01", lifecycle: "active" },
      { date: "2026-02-01", lifecycle: "active" },
    ];
    expect(lastLifecycleTransition(history)).toBeNull();
  });

  test("returns the date of the most recent real value change", () => {
    const history = [
      { date: "2026-01-01", lifecycle: "active" },
      { date: "2026-02-01", lifecycle: "archived" },
      { date: "2026-03-01", lifecycle: "archived" },
    ];
    expect(lastLifecycleTransition(history)).toBe("2026-02-01");
  });

  test("ignores commits where the entry does not exist yet", () => {
    const history = [
      { date: "2026-01-01", lifecycle: undefined },
      { date: "2026-02-01", lifecycle: "active" },
    ];
    expect(lastLifecycleTransition(history)).toBeNull();
  });
});

describe("checkFreshness", () => {
  test("is purely informative when there is no recorded transition", () => {
    const outcome = checkFreshness(null, "2026-01-01");
    expect(outcome.blocking).toBe(false);
  });

  test("blocks when AGENTS.md predates the last lifecycle transition", () => {
    const outcome = checkFreshness("2026-08-01", "2026-01-01");
    expect(outcome.blocking).toBe(true);
    expect(outcome.note).toContain("2026-08-01");
  });

  test("does not block when AGENTS.md was touched at or after the transition", () => {
    expect(checkFreshness("2026-01-01", "2026-01-01").blocking).toBe(false);
    expect(checkFreshness("2026-01-01", "2026-08-01").blocking).toBe(false);
  });

  test("does not block when AGENTS.md modification date is unavailable", () => {
    expect(checkFreshness("2026-08-01", null).blocking).toBe(false);
  });
});

describe("parseRegistry", () => {
  test("extracts repository, role, layer and lifecycle", () => {
    const entries = parseRegistry(
      "repositories:\n  - repository: libre-ai/a\n    role: satellite\n    layer: couche-4\n    lifecycle: active\n",
    );
    expect(entries).toEqual([
      { repository: "libre-ai/a", role: "satellite", layer: "couche-4", lifecycle: "active" },
    ]);
  });
});

describe("reviewContext", () => {
  const entry = {
    repository: "libre-ai/demo",
    role: "satellite",
    layer: "couche-4",
    lifecycle: "active",
  };
  const freshness = { transitionedOn: null, agentsLastModifiedOn: null };

  test("exempts libre-ai/.github explicitly, without silence", () => {
    const outcome = reviewContext(
      {
        repository: "libre-ai/.github",
        role: "org-profile",
        layer: "transverse",
        lifecycle: "active",
      },
      { agents: null, claude: null },
      freshness,
    );
    expect(outcome.exempt).toBe(true);
    expect(outcome.failures).toEqual([]);
    expect(outcome.notes.length).toBeGreaterThan(0);
  });

  test("asserts a non-active, non-archived absence as a pass, not a skip", () => {
    // No such lifecycle value exists in the registry today (only active and
    // archived) — this exercises the defensive branch for a future value the
    // template has not yet named, distinct from the archived exemption below.
    const outcome = reviewContext(
      { ...entry, lifecycle: "draft" },
      { agents: null, claude: null },
      freshness,
    );
    expect(outcome.exempt).toBe(false);
    expect(outcome.failures).toEqual([]);
    expect(outcome.notes.join(" ")).toContain("lifecycle=draft");
  });

  test("exempts an archived entry entirely, even with no AGENTS.md", () => {
    const outcome = reviewContext(
      { ...entry, lifecycle: "archived" },
      { agents: null, claude: null },
      freshness,
    );
    expect(outcome.exempt).toBe(true);
    expect(outcome.failures).toEqual([]);
    expect(outcome.notes.join(" ")).toContain("archived");
  });

  test("exempts an archived entry entirely, even when its AGENTS.md is non-conformant", () => {
    // The real case this guards: libre-ai/libre-ai carries an AGENTS.md that
    // predates the template (no required sections, no fetchable pointer, no
    // layer marker) and is read-only by construction — a cap or a required
    // section cannot bind content that can no longer be edited.
    const agents = "# Hub archive\n\nSome prose with no sections and no pointer.\n";
    const outcome = reviewContext(
      { ...entry, layer: "moyeu", lifecycle: "archived" },
      { agents, claude: null },
      freshness,
    );
    expect(outcome.exempt).toBe(true);
    expect(outcome.failures).toEqual([]);
  });

  test("fails when an active entry has no AGENTS.md", () => {
    const outcome = reviewContext(entry, { agents: null, claude: null }, freshness);
    expect(outcome.failures.length).toBeGreaterThan(0);
    expect(outcome.failures[0]).toContain("missing");
  });

  test("reports an AGENTS.md fetch error as unable-to-verify, never as missing", () => {
    // The exact regression this type exists to prevent: a rate-limited or
    // otherwise unreachable gh api call must never be reported the same way
    // as a confirmed absence — the required check would then fail every
    // pull request on a transient condition unrelated to any repository's
    // real AGENTS.md.
    const outcome = reviewContext(
      entry,
      { agents: null, claude: null, agentsFetchError: "API rate limit exceeded (HTTP 403)" },
      freshness,
    );
    expect(outcome.failures.length).toBe(1);
    expect(outcome.failures[0]).toContain("unable to verify");
    expect(outcome.failures[0]).toContain("rate limit");
    expect(outcome.failures.some((f) => f.includes("missing"))).toBe(false);
  });

  test("reports a CLAUDE.md fetch error as unable-to-verify, distinct from a missing adapter", () => {
    const agents = agentsFixture({
      sections: ["Authority", "Boundaries", "Quality gates", "Agents"],
      layerMention: "couche 4",
    });
    const outcome = reviewContext(
      entry,
      { agents, claude: null, claudeFetchError: "gh api ... failed (HTTP 500)" },
      freshness,
    );
    expect(outcome.failures.some((f) => f.includes("unable to verify CLAUDE.md"))).toBe(true);
    expect(outcome.failures.some((f) => f.includes("is not the byte-exact"))).toBe(false);
    expect(outcome.failures.some((f) => f.includes("is missing while"))).toBe(false);
  });

  test("passes a fully conformant couche-4 AGENTS.md", () => {
    const agents = agentsFixture({
      sections: ["Authority", "Boundaries", "Quality gates", "Agents"],
      layerMention: "couche 4",
    });
    const outcome = reviewContext(entry, { agents, claude: "@AGENTS.md\n" }, freshness);
    expect(outcome.failures).toEqual([]);
  });

  test("accumulates every violation instead of stopping at the first", () => {
    const agents = agentsFixture({
      sections: ["Authority", "Agents"],
      layerMention: "couche 3",
      pointer: "no url here",
    });
    const outcome = reviewContext(entry, { agents, claude: null }, freshness);
    expect(outcome.failures.some((f) => f.includes("Boundaries"))).toBe(true);
    expect(outcome.failures.some((f) => f.includes("layer marker"))).toBe(true);
    expect(outcome.failures.some((f) => f.includes("URL"))).toBe(true);
    expect(outcome.failures.some((f) => f.includes("missing"))).toBe(true);
  });

  test("fails over the line cap", () => {
    const agents = agentsFixture({
      sections: ["Authority", "Boundaries", "Quality gates", "Agents"],
      layerMention: "couche 4",
      padLines: 45,
    });
    const outcome = reviewContext(entry, { agents, claude: "@AGENTS.md\n" }, freshness);
    expect(outcome.failures.some((f) => f.includes("line cap"))).toBe(true);
  });

  test("reports an unmapped layer/role/lifecycle combination as a failure", () => {
    // moyeu + active is unmapped (the template's one moyeu row was archived,
    // now fully exempted upstream — see resolveLayerSpec's own tests); this
    // combination reaches resolveLayerSpec because it is not archived.
    const agents = agentsFixture({ sections: [], layerMention: "moyeu" });
    const outcome = reviewContext(
      {
        repository: "libre-ai/x",
        role: "hub",
        layer: "moyeu",
        lifecycle: "active",
      },
      { agents, claude: "@AGENTS.md\n" },
      freshness,
    );
    expect(outcome.failures.some((f) => f.includes("no context template"))).toBe(true);
  });

  test("blocks on a lifecycle transition not followed by an AGENTS.md update", () => {
    const agents = agentsFixture({
      sections: ["Authority", "Boundaries", "Quality gates", "Agents"],
      layerMention: "couche 4",
    });
    const outcome = reviewContext(
      entry,
      { agents, claude: "@AGENTS.md\n" },
      { transitionedOn: "2026-08-18", agentsLastModifiedOn: "2026-01-01" },
    );
    expect(outcome.failures.some((f) => f.includes("transitioned"))).toBe(true);
  });

  test("keeps a stale-but-untransitioned repository green (informative note only)", () => {
    const agents = agentsFixture({
      sections: ["Authority", "Boundaries", "Quality gates", "Agents"],
      layerMention: "couche 4",
    });
    const outcome = reviewContext(
      entry,
      { agents, claude: "@AGENTS.md\n" },
      { transitionedOn: null, agentsLastModifiedOn: "2026-01-01" },
    );
    expect(outcome.failures).toEqual([]);
    expect(outcome.notes.length).toBeGreaterThan(0);
  });
});
