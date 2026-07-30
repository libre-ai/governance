import { describe, expect, test } from "bun:test";

import { ADAPTED_FILES, compareTrees } from "./check-migration-drift";

describe("compareTrees", () => {
  const entry = {
    hub_path: "packages/thing/",
    destination: "libre-ai/thing",
    hub_removal_commit: "pending",
    destination_path: ".",
  };

  test("counter-proof: a divergent fingerprint must turn the gate red", () => {
    const hub = new Map([["packages/thing/src/a.ts", "aaaa1111"]]);
    const dest = new Map([["src/a.ts", "bbbb2222"]]);
    const result = compareTrees(entry, hub, dest);
    expect(result.failures.length).toBe(1);
    expect(result.failures[0]).toContain("diverges");
  });

  test("counter-proof: a missing destination file must turn the gate red", () => {
    const hub = new Map([["packages/thing/src/a.ts", "aaaa1111"]]);
    const result = compareTrees(entry, hub, new Map());
    expect(result.failures[0]).toContain("missing at destination");
  });

  test("identical fingerprints are asserted, not excluded", () => {
    const hub = new Map([["packages/thing/src/a.ts", "aaaa1111"]]);
    const dest = new Map([["src/a.ts", "aaaa1111"]]);
    const result = compareTrees(entry, hub, dest);
    expect(result.failures).toEqual([]);
    expect(result.asserted).toBe(1);
  });

  test("bootstrap manifests and listed adaptations are counted apart, never asserted", () => {
    const hub = new Map([
      ["packages/thing/package.json", "cccc3333"],
      ["packages/thing/src/adapted.ts", "dddd4444"],
    ]);
    const dest = new Map([
      ["package.json", "eeee5555"],
      ["src/adapted.ts", "ffff6666"],
    ]);
    const withAdaptation = {
      ...entry,
      destination: "libre-ai/sdk-ts",
    };
    const hub2 = new Map([["packages/thing/scripts/generate-types.ts", "dddd4444"]]);
    const dest2 = new Map([["scripts/generate-types.ts", "ffff6666"]]);
    const r1 = compareTrees(entry, hub, dest);
    expect(r1.excludedBootstrap).toBe(1);
    const r2 = compareTrees(withAdaptation, hub2, dest2);
    expect(r2.excludedAdapted).toBe(1);
    expect(r2.failures).toEqual([]);
  });

  test("the adaptation list is the reviewed 32 plus the two the hardened gate itself caught", () => {
    expect(ADAPTED_FILES.size).toBe(35);
  });
});
