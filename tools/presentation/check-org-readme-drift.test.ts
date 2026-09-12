import { describe, expect, test } from "bun:test";
import {
  checkOrgBrandIntroDrift,
  checkOrgReadmeDrift,
  checkProjectionFreshness,
} from "./check-org-readme-drift";
import { STATUS_SECTION_BEGIN, STATUS_SECTION_END } from "./public-capabilities";
import { BRAND_INTRO_BEGIN, BRAND_INTRO_END } from "./render-org-brand-intro";

const wrap = (body: string) => `${STATUS_SECTION_BEGIN}\n${body}\n${STATUS_SECTION_END}`;

describe("checkProjectionFreshness", () => {
  test("checks exact verified facts, never card progress", () => {
    const current = { schemaVersion: "readme-facts.v1" as const, repositories: [] };
    expect(checkProjectionFreshness(current, current)).toEqual([]);
    expect(checkProjectionFreshness({ rows: [] }, current)[0]).toContain(
      "portfolio projection differs",
    );
  });
});

describe("checkOrgReadmeDrift", () => {
  test("no drift when the live section is byte-identical to a fresh render", () => {
    const section = wrap("| Radar | ... |");
    const readme = `# Libre AI\n\nSome prose.\n\n${section}\n\nMore prose.\n`;
    expect(checkOrgReadmeDrift(readme, section)).toEqual([]);
  });

  test("fails named when the live section text diverges from a fresh render", () => {
    const live = `# Libre AI\n\n${wrap("| Radar | stale |")}\n`;
    const fresh = wrap("| Radar | fresh |");
    const failures = checkOrgReadmeDrift(live, fresh);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("diverges from a fresh render");
  });

  test("fails when the sentinels are absent from the live README", () => {
    const failures = checkOrgReadmeDrift("# Libre AI\n\nNo generated section here.\n", wrap("x"));
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("sentinels not found");
  });

  test("fails when the live README carries a duplicated sentinel pair", () => {
    const section = wrap("x");
    const live = `${section}\n\n${section}`;
    const failures = checkOrgReadmeDrift(live, section);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("dupliquée");
  });
});

describe("checkOrgBrandIntroDrift", () => {
  const fresh = `${BRAND_INTRO_BEGIN}\nFresh intro.\n${BRAND_INTRO_END}`;

  test("accepts one byte-identical introduction", () => {
    expect(checkOrgBrandIntroDrift(`# Libre AI\n\n${fresh}\n`, fresh, "fr")).toEqual([]);
  });

  test("rejects missing, duplicate and drifting introductions", () => {
    expect(checkOrgBrandIntroDrift("# Libre AI", fresh, "fr")[0]).toContain("missing");
    expect(checkOrgBrandIntroDrift(`${fresh}\n${fresh}`, fresh, "fr")[0]).toContain("dupliquée");
    expect(
      checkOrgBrandIntroDrift(`${BRAND_INTRO_BEGIN}\nStale.\n${BRAND_INTRO_END}`, fresh, "en")[0],
    ).toContain("diverges");
  });
});
