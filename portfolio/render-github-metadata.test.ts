import { expect, test } from "bun:test";
import { buildGitHubMetadata } from "./render-github-metadata";
import { loadCatalog } from "./validate-repositories";

test("metadata cannot publish pending evidence", async () => {
  const catalog = await loadCatalog();
  expect(() => buildGitHubMetadata(catalog.contracts)).toThrow("publication-proof-required");
});
