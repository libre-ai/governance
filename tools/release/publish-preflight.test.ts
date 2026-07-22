import { describe, expect, test } from "bun:test";
import {
  analyzeTarballEntries,
  analyzeTarballManifest,
  checkVersionCoherence,
} from "./publish-preflight";

// Fail-closed publish gate: a satellite tarball must be self-contained and
// clean BEFORE the owner runs bun publish. These are the pure analysis rules;
// the CLI packs each satellite for real and feeds the results here.

const cleanManifest = {
  name: "@libre-ai/contracts",
  version: "0.1.0",
  license: "Apache-2.0",
  dependencies: { ajv: "8.20.0" },
  peerDependencies: { react: "19.2.7" },
};

describe("analyzeTarballManifest", () => {
  test("accepts a clean materialized manifest", () => {
    expect(analyzeTarballManifest(cleanManifest)).toEqual([]);
  });

  test("flags residual workspace: and catalog: refs in any dependency group", () => {
    const issues = analyzeTarballManifest({
      ...cleanManifest,
      dependencies: { "@libre-ai/web-platform": "workspace:*" },
      peerDependencies: { react: "catalog:" },
    });
    expect(issues.some((issue) => issue.includes("workspace:"))).toBe(true);
    expect(issues.some((issue) => issue.includes("catalog:"))).toBe(true);
  });

  test("flags a private manifest and a missing license", () => {
    const issues = analyzeTarballManifest({ ...cleanManifest, private: true, license: undefined });
    expect(issues.some((issue) => issue.includes("private"))).toBe(true);
    expect(issues.some((issue) => issue.includes("license"))).toBe(true);
  });
});

describe("analyzeTarballEntries", () => {
  test("accepts src + LICENSE + README and flags missing LICENSE", () => {
    expect(analyzeTarballEntries(["package.json", "README.md", "LICENSE", "src/index.ts"])).toEqual(
      [],
    );
    const issues = analyzeTarballEntries(["package.json", "src/index.ts"]);
    expect(issues.some((issue) => issue.includes("LICENSE"))).toBe(true);
  });

  test("flags test files leaked into the tarball", () => {
    const issues = analyzeTarballEntries([
      "package.json",
      "LICENSE",
      "src/index.ts",
      "src/registry.test.ts",
    ]);
    expect(issues.some((issue) => issue.includes("registry.test.ts"))).toBe(true);
  });
});

describe("checkVersionCoherence", () => {
  test("accepts one shared version and flags drift", () => {
    expect(
      checkVersionCoherence([
        { name: "a", version: "0.1.0" },
        { name: "b", version: "0.1.0" },
      ]),
    ).toEqual([]);
    const issues = checkVersionCoherence([
      { name: "a", version: "0.1.0" },
      { name: "b", version: "0.2.0" },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("0.2.0");
  });
});
