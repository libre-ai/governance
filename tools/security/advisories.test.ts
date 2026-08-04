import { describe, expect, test } from "bun:test";
import { diffAdvisories, extractAdvisoryIds, readAudit } from "./advisories";

// The 2026-08-04 incident these helpers descend from: GHSA-7p8r-x3mc-p8w7 on
// fast-uri, pinned inside the advisory range by the fleet override.

const LISTING = `bun audit v1.4.0
fast-uri  >=4.0.0 <4.1.2
  high: fast-uri vulnerable to host confusion - https://github.com/advisories/GHSA-7p8r-x3mc-p8w7

1 vulnerabilities (1 high)`;

describe("extractAdvisoryIds", () => {
  test("finds, dedupes and sorts GHSA identifiers", () => {
    expect(extractAdvisoryIds(`${LISTING}\nGHSA-7p8r-x3mc-p8w7 GHSA-1234-abcd-ef56`)).toEqual([
      "GHSA-1234-abcd-ef56",
      "GHSA-7p8r-x3mc-p8w7",
    ]);
  });

  test("a clean output yields no identifiers", () => {
    expect(extractAdvisoryIds("No vulnerabilities found")).toEqual([]);
  });
});

describe("diffAdvisories", () => {
  test("separates what the change introduces from the state of the world", () => {
    const delta = diffAdvisories(
      ["GHSA-7p8r-x3mc-p8w7"],
      ["GHSA-7p8r-x3mc-p8w7", "GHSA-1234-abcd-ef56"],
    );
    expect(delta.introduced).toEqual(["GHSA-1234-abcd-ef56"]);
    expect(delta.preExisting).toEqual(["GHSA-7p8r-x3mc-p8w7"]);
  });

  test("an advisory fixed by the change simply leaves both lists", () => {
    const delta = diffAdvisories(["GHSA-7p8r-x3mc-p8w7"], []);
    expect(delta.introduced).toEqual([]);
    expect(delta.preExisting).toEqual([]);
  });
});

describe("readAudit", () => {
  test("exit 0 is a clean run", () => {
    const reading = readAudit(0, "No vulnerabilities found");
    expect(reading.ran).toBe(true);
    expect(reading.advisories).toEqual([]);
  });

  test("exit 1 with a listing is a run that found advisories", () => {
    const reading = readAudit(1, LISTING);
    expect(reading.ran).toBe(true);
    expect(reading.advisories).toEqual(["GHSA-7p8r-x3mc-p8w7"]);
  });

  test("exit 1 without a listing is an unanswered question, never a finding", () => {
    // "Found nothing" and "could not look" must never be conflated.
    const reading = readAudit(1, "error: connect ETIMEDOUT registry.npmjs.org");
    expect(reading.ran).toBe(false);
    expect(reading.detail).toContain("unanswered");
  });
});
