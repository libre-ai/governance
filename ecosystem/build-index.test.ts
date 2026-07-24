import { describe, expect, test } from "bun:test";
import { buildIndex, renderIndex } from "./build-index";

// The index is a published machine artefact: its exact byte format is locked
// by a golden fixture, and the committed real index must always match a fresh
// regeneration — so `bun test` alone catches inventory/index drift.

const fixtureUrl = new URL("fixtures/repository-index/input.yaml", import.meta.url);
const goldenUrl = new URL("fixtures/repository-index/expected.json", import.meta.url);
const inventoryUrl = new URL("repositories.v1.yaml", import.meta.url);
const committedIndexUrl = new URL("../distribution/index/repositories.v1.json", import.meta.url);

describe("buildIndex", () => {
  test("renders the golden fixture byte-for-byte", async () => {
    const rendered = renderIndex(buildIndex(await Bun.file(fixtureUrl).text()));
    expect(rendered).toBe(await Bun.file(goldenUrl).text());
  });

  test("sorts repositories by name regardless of source order", async () => {
    const index = buildIndex(await Bun.file(fixtureUrl).text());
    expect(index.repositories.map((entry) => entry.repository)).toEqual([
      "libre-ai/alpha-hub",
      "libre-ai/midden-secret",
      "libre-ai/zeta-product",
    ]);
  });

  test("is deterministic across runs", async () => {
    const text = await Bun.file(fixtureUrl).text();
    expect(renderIndex(buildIndex(text))).toBe(renderIndex(buildIndex(text)));
  });

  test("omits evidence fields when the source has none", async () => {
    const index = buildIndex(await Bun.file(fixtureUrl).text());
    const hub = index.repositories.find((entry) => entry.repository === "libre-ai/alpha-hub");
    expect(hub).toBeDefined();
    expect(hub?.benchmark_url).toBeUndefined();
    expect(hub?.canonical_paths).toBeUndefined();
    expect(hub?.criteria_status).toBeUndefined();
  });

  test("rejects a duplicate repository entry", () => {
    const yaml = [
      "schema_version: v",
      "updated_on: 2026-07-24",
      "exposure_scale: [idea]",
      "repositories:",
      "  - { repository: libre-ai/twin, role: hub, layer: moyeu, visibility: public, lifecycle: active, exposure: idea }",
      "  - { repository: libre-ai/twin, role: hub, layer: moyeu, visibility: public, lifecycle: active, exposure: idea }",
    ].join("\n");
    expect(() => buildIndex(yaml)).toThrow("duplicate repository entry libre-ai/twin");
  });

  test("rejects an exposure state outside the declared scale", () => {
    const yaml = [
      "schema_version: v",
      "updated_on: 2026-07-24",
      "exposure_scale: [idea]",
      "repositories:",
      "  - { repository: libre-ai/x, role: hub, layer: moyeu, visibility: public, lifecycle: active, exposure: legendary }",
    ].join("\n");
    expect(() => buildIndex(yaml)).toThrow('exposure "legendary" is not on the exposure_scale');
  });

  test("rejects a visibility outside public/private", () => {
    const yaml = [
      "schema_version: v",
      "updated_on: 2026-07-24",
      "exposure_scale: [idea]",
      "repositories:",
      "  - { repository: libre-ai/x, role: hub, layer: moyeu, visibility: internal, lifecycle: active, exposure: idea }",
    ].join("\n");
    expect(() => buildIndex(yaml)).toThrow('expected "public" or "private"');
  });

  test("the committed index matches a fresh regeneration from the inventory", async () => {
    const regenerated = renderIndex(buildIndex(await Bun.file(inventoryUrl).text()));
    expect(regenerated).toBe(await Bun.file(committedIndexUrl).text());
  });
});
