import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  type NotebookHardwareResources,
  parseResourceClassManifest,
  selectResourceClass,
} from "./resource-class";

const rawManifest = JSON.parse(
  readFileSync(resolve(process.cwd(), "toolchains/notebook-resource-classes.json"), "utf8"),
) as unknown;
const manifest = parseResourceClassManifest(rawManifest);
const GIB = 1024 ** 3;

function hardware(memoryGib: number, logicalCpu: number): NotebookHardwareResources {
  return {
    architecture: "arm64",
    logicalCpu,
    memoryBytes: memoryGib * GIB,
    operatingSystem: "darwin",
    processor: "public-test-processor",
  };
}

describe("Notebook qualification resource classes", () => {
  test("defines an explicit pending 8 GiB minimum product candidate", () => {
    const selected = selectResourceClass(
      manifest,
      manifest.minimumProductCandidateClassId,
      hardware(8, 8),
    );
    expect(selected.id).toBe("desktop-arm64-constrained-8gib");
    expect(selected.evidenceStatus).toBe("pending-real-hardware-qualification");
    expect(manifest.productStorageQuotaCandidateBytes).toBe(512 * 1024 ** 2);
  });

  test("accepts the lower and upper supported hardware tiers only in their own ranges", () => {
    expect(
      selectResourceClass(manifest, "desktop-arm64-mainstream-16gib", hardware(16, 8)).id,
    ).toBe("desktop-arm64-mainstream-16gib");
    expect(
      selectResourceClass(manifest, "desktop-arm64-mainstream-16gib", hardware(24, 10)).id,
    ).toBe("desktop-arm64-mainstream-16gib");
    expect(
      selectResourceClass(manifest, "desktop-arm64-high-memory-reference", hardware(32, 12)).id,
    ).toBe("desktop-arm64-high-memory-reference");
    expect(() =>
      selectResourceClass(manifest, "desktop-arm64-constrained-8gib", hardware(12, 8)),
    ).toThrow("memory is outside");
    expect(() =>
      selectResourceClass(manifest, "desktop-arm64-mainstream-16gib", hardware(32, 12)),
    ).toThrow("memory is outside");
    expect(() =>
      selectResourceClass(manifest, "desktop-arm64-constrained-8gib", hardware(36, 14)),
    ).toThrow("memory is outside");
  });

  test("fails closed outside memory, CPU, platform, architecture, or known class boundaries", () => {
    expect(() =>
      selectResourceClass(manifest, "desktop-arm64-constrained-8gib", hardware(7, 8)),
    ).toThrow("memory is outside");
    expect(() =>
      selectResourceClass(manifest, "desktop-arm64-constrained-8gib", hardware(8, 7)),
    ).toThrow("CPU count is outside");
    expect(() =>
      selectResourceClass(manifest, "desktop-arm64-constrained-8gib", {
        ...hardware(8, 8),
        operatingSystem: "linux",
      }),
    ).toThrow("platform is outside");
    expect(() =>
      selectResourceClass(manifest, "desktop-arm64-constrained-8gib", {
        ...hardware(8, 8),
        architecture: "x64",
      }),
    ).toThrow("platform is outside");
    expect(() => selectResourceClass(manifest, "unknown", hardware(8, 8))).toThrow(
      "unknown Notebook resource class",
    );
  });

  test("rejects unknown manifest fields, duplicate classes, and unresolved minimums", () => {
    expect(() =>
      parseResourceClassManifest({ ...(rawManifest as object), unexpected: true }),
    ).toThrow("invalid fields");
    const duplicated = structuredClone(rawManifest) as {
      classes: unknown[];
    };
    duplicated.classes.push(structuredClone(duplicated.classes[0]));
    expect(() => parseResourceClassManifest(duplicated)).toThrow("duplicate");
    const unresolved = structuredClone(rawManifest) as {
      minimumProductCandidateClassId: string;
    };
    unresolved.minimumProductCandidateClassId = "desktop-missing";
    expect(() => parseResourceClassManifest(unresolved)).toThrow("unresolved");
  });
});
