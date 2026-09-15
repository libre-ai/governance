import { expect, test } from "bun:test";
import { buildPreviewInputs } from "./render-preview-inputs";
import { loadCatalog } from "./validate-repositories";

test("provisional names cannot become previews", async () => {
  const catalog = await loadCatalog();
  expect(() => buildPreviewInputs(catalog.contracts)).toThrow("publication-proof-required");
});
