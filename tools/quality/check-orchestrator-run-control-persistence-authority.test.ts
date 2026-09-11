import { describe, expect, test } from "bun:test";

interface WorkPackage {
  readonly id: string;
  readonly definitionStatus: string;
  readonly humanGates: readonly string[];
  readonly writePaths: readonly string[];
}

interface WorkPackagePlan {
  readonly packages: readonly WorkPackage[];
}

describe("orchestrator run-control persistence authority", () => {
  test("binds ADR-0039, D45 and only the locked runtime work package", async () => {
    const [adrExists, decisionRegister, design, plan] = await Promise.all([
      Bun.file("docs/adr/0039-orchestrator-run-control-persistence.md").exists(),
      Bun.file("docs/decisions/DECISION-REGISTER.md").text(),
      Bun.file(
        "docs/superpowers/specs/2026-09-11-orchestrator-run-control-persistence-design.md",
      ).text(),
      Bun.file("docs/transformation/work-packages.v1.json").json() as Promise<WorkPackagePlan>,
    ]);
    const workPackage = plan.packages.find((entry) => entry.id === "WP-G3-O01");
    const runControlOwners = plan.packages.filter((entry) =>
      entry.writePaths.includes("crates/agent-orchestrator-run/**"),
    );

    expect(adrExists).toBeTrue();
    expect(decisionRegister).toContain(
      "| D45 | Run-control persistence is isolated and non-executing",
    );
    expect(design).toContain("authority ADR-0039/D45");
    expect(workPackage?.definitionStatus).toBe("locked");
    expect(workPackage?.humanGates).toEqual(["layer-2-bootstrap-security-merge"]);
    expect(workPackage?.writePaths).toEqual(["crates/agent-orchestrator-run/**"]);
    expect(runControlOwners.map((entry) => entry.id)).toEqual(["WP-G3-O01"]);
  });
});
