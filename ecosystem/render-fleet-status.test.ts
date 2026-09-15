import { expect, test } from "bun:test";
import { buildPublicFacts } from "../tools/presentation/public-capabilities";

test("no admitted evidence means no public repository facts", () =>
  expect(buildPublicFacts({ contracts: [], authorities: new Map() })).toEqual({
    schemaVersion: "readme-facts.v1",
    repositories: [],
  }));
