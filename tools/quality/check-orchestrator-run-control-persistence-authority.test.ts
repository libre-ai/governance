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

const runControlWritePath = "crates/agent-orchestrator-run/**";
const runControlRoot = "crates/agent-orchestrator-run";

function overlapsRunControlBoundary(writePath: string): boolean {
  if (writePath === runControlRoot || writePath.startsWith(`${runControlRoot}/`)) {
    return true;
  }

  const glob = new Bun.Glob(writePath);
  if (glob.match(runControlRoot) || glob.match(`${runControlRoot}/__authority_probe__`)) {
    return true;
  }

  const wildcardIndexes = ["*", "?", "[", "{"].map((marker) => writePath.indexOf(marker));
  const firstWildcard = Math.min(
    ...wildcardIndexes.filter((index) => index >= 0),
    writePath.length,
  );
  if (firstWildcard === writePath.length) {
    return false;
  }
  const staticPrefix = writePath.slice(0, firstWildcard);

  return staticPrefix.length === 0 || runControlRoot.startsWith(staticPrefix);
}

function findRunControlOwners(plan: WorkPackagePlan): readonly WorkPackage[] {
  return plan.packages.filter((entry) =>
    entry.writePaths.some((writePath) => overlapsRunControlBoundary(writePath)),
  );
}

function hasExpectedAdrTitle(adr: string): boolean {
  return adr.startsWith("# ADR-0039 — Persistance du contrôle de run Orchestrator\n");
}

function hasSingleD45Entry(decisionRegister: string): boolean {
  return decisionRegister.split("\n").filter((line) => line.startsWith("| D45 |")).length === 1;
}

describe("orchestrator run-control persistence authority", () => {
  test("detects every ownership pattern that overlaps the runtime boundary", () => {
    const plan: WorkPackagePlan = {
      packages: [
        {
          id: "parent-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["crates/**"],
        },
        {
          id: "child-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["crates/agent-orchestrator-run/src/**"],
        },
        {
          id: "wildcard-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["crates/agent-*/**"],
        },
        {
          id: "global-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["**"],
        },
        {
          id: "nested-wildcard-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["crates/*/src/**"],
        },
        {
          id: "wildcard-file-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["crates/agent-*/Cargo.toml"],
        },
        {
          id: "suffix-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["**/*.rs"],
        },
        {
          id: "brace-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["crates/{agent-orchestrator-run,agent-harness}/**"],
        },
        {
          id: "sibling-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["crates/agent-harness/**"],
        },
        {
          id: "literal-sibling-owner",
          definitionStatus: "locked",
          humanGates: [],
          writePaths: ["crates/agent-orchestrator"],
        },
      ],
    };

    expect(findRunControlOwners(plan).map((entry) => entry.id)).toEqual([
      "parent-owner",
      "child-owner",
      "wildcard-owner",
      "global-owner",
      "nested-wildcard-owner",
      "wildcard-file-owner",
      "suffix-owner",
      "brace-owner",
    ]);
  });

  test("binds ADR-0039, D45 and only the locked runtime work package", async () => {
    const [adr, decisionRegister, design, plan] = await Promise.all([
      Bun.file("docs/adr/0039-orchestrator-run-control-persistence.md").text(),
      Bun.file("docs/decisions/DECISION-REGISTER.md").text(),
      Bun.file(
        "docs/superpowers/specs/2026-09-11-orchestrator-run-control-persistence-design.md",
      ).text(),
      Bun.file("docs/transformation/work-packages.v1.json").json() as Promise<WorkPackagePlan>,
    ]);
    const workPackage = plan.packages.find((entry) => entry.id === "WP-G3-O01");
    const runControlOwners = findRunControlOwners(plan);

    expect(hasExpectedAdrTitle(adr)).toBeTrue();
    expect(hasExpectedAdrTitle("")).toBeFalse();
    expect(hasSingleD45Entry(decisionRegister)).toBeTrue();
    expect(decisionRegister).toContain(
      "| D45 | Run-control persistence is isolated and non-executing",
    );
    expect(design).toContain("authority ADR-0039/D45");
    expect(workPackage?.definitionStatus).toBe("locked");
    expect(workPackage?.humanGates).toEqual(["layer-2-bootstrap-security-merge"]);
    expect(workPackage?.writePaths).toEqual([runControlWritePath]);
    expect(runControlOwners.map((entry) => entry.id)).toEqual(["WP-G3-O01"]);
  });
});
