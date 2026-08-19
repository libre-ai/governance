import { describe, expect, test } from "bun:test";
import { STATUS_SECTION_BEGIN, STATUS_SECTION_END } from "../../ecosystem/project-cards";
import { checkOrgReadmeDrift } from "./check-org-readme-drift";

const wrap = (body: string) => `${STATUS_SECTION_BEGIN}\n${body}\n${STATUS_SECTION_END}`;

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
