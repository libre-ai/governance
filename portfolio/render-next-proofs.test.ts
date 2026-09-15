import { expect, test } from "bun:test";
import { renderNextProofs } from "./render-next-proofs";
import { loadCatalog } from "./validate-repositories";

test("pending public next proofs remain withheld", async () => {
  const catalog = await loadCatalog();
  expect(() => renderNextProofs(catalog.contracts)).toThrow("publication-proof-required");
  expect(renderNextProofs([])).toBe(
    "# What we're proving next\n\nNo repository proof has been admitted for public projection.\n",
  );
});
