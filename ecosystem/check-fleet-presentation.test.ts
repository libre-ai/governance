import { expect, test } from "bun:test";
import { checkPublicFacts } from "./check-fleet-presentation";

const expected = { schemaVersion: "readme-facts.v1" as const, repositories: [] };
test("only exact verified public facts match", () => {
  expect(checkPublicFacts(expected, expected)).toEqual([]);
  expect(
    checkPublicFacts({ schema_version: "libre-ai.fleet-status.v1", rows: [] }, expected),
  ).toEqual(["portfolio-projection-drift"]);
  expect(checkPublicFacts({ ...expected, extra: true }, expected)).toEqual([
    "portfolio-projection-drift",
  ]);
});
