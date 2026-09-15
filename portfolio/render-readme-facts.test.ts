import { expect, test } from "bun:test";
import { renderReadmeFacts } from "./render-readme-facts";
import { loadCatalog } from "./validate-repositories";

test("no planning fact is silently published", async () => {
  const catalog = await loadCatalog();
  for (const contract of catalog.contracts)
    expect(() => renderReadmeFacts(contract, "en")).toThrow("publication-proof-required");
});
