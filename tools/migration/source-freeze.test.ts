import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import cleanFixture from "./fixtures/source-freeze/clean.json";
import dirtyFixture from "./fixtures/source-freeze/dirty.json";
import { assertQuiescent, buildSourceFreeze, readPortfolio } from "./source-freeze";
import type { SourceObservation } from "./types";

function clean(): SourceObservation[] {
  return readPortfolio().sources.map(({ source }) => ({
    source,
    ...structuredClone(cleanFixture),
  }));
}
describe("source freeze", () => {
  test("complete clean observations produce reproducible evidence", () => {
    const input = clean();
    const freeze = buildSourceFreeze(input);
    expect(() => assertQuiescent(freeze)).not.toThrow();
    expect(buildSourceFreeze(input.reverse())).toEqual(freeze);
  });
  test("missing and duplicate sources fail closed", () => {
    expect(() => buildSourceFreeze(clean().slice(1))).toThrow();
    expect(() => buildSourceFreeze([...clean(), ...clean()])).toThrow();
  });
  for (const patch of [
    { dirty: true },
    { identityVerified: false },
    { accessible: false },
    { remoteCommit: "b".repeat(40) },
    { branches: [{ ref: "private-branch", commit: "b".repeat(40) }] },
    { openPullRequests: [1] },
    {
      worktrees: [
        { path: "/private/person", commit: "b".repeat(40), dirty: false, detached: true },
      ],
    },
    { errors: ["unavailable"] },
  ]) {
    test(`blocks ${Object.keys(patch)[0]}`, () => {
      const input = clean();
      Object.assign(input[0] ?? {}, patch);
      const freeze = buildSourceFreeze(input);
      expect(() => assertQuiescent(freeze)).toThrow();
      expect(JSON.stringify(freeze)).not.toContain("/private/person");
      expect(JSON.stringify(freeze)).not.toContain("private-branch");
    });
  }
  test("inventory enforces exact sources and targets", () => {
    const portfolio = readPortfolio();
    expect(portfolio.sources).toHaveLength(36);
    expect(portfolio.certainTargets).toHaveLength(14);
    expect(portfolio.conditionalTargets).toHaveLength(6);
    for (const source of ["signalement", "product-research", "unknown"]) {
      const modified = structuredClone(portfolio);
      if (modified.sources[0]) modified.sources[0].source = source;
      expect(() => readPortfolio(modified)).toThrow();
    }
    for (const key of ["certainTargets", "conditionalTargets"] as const) {
      const modified = structuredClone(portfolio);
      modified[key].push("extra");
      expect(() => readPortfolio(modified)).toThrow();
    }
    const modified = structuredClone(portfolio);
    if (modified.sources[0]) modified.sources[0].disposition = "unknown" as never;
    expect(() => readPortfolio(modified)).toThrow();
  });
});

test("rejects invalid observation bytes before output", () => {
  const input = clean();
  const first = input[0];
  if (first) first.branches = [{ ref: "x", commit: "private-email@example.invalid" }];
  expect(() => buildSourceFreeze(input)).toThrow("invalid-observation");
});
test("rejects tampered source assignments", () => {
  const p = readPortfolio();
  const first = p.sources[0];
  if (first) first.target = "missions";
  expect(() => readPortfolio(p)).toThrow();
});

test("dirty fixture cannot become a freeze", () => {
  const input = clean();
  Object.assign(input[0] ?? {}, dirtyFixture);
  expect(() => assertQuiescent(buildSourceFreeze(input))).toThrow();
});

test("CLI refuses unsupported mutation mode with safe output", async () => {
  const child = Bun.spawn(
    [process.execPath, new URL("./source-freeze.ts", import.meta.url).pathname, "--freeze"],
    { stdout: "pipe", stderr: "pipe" },
  );
  const out = await new Response(child.stdout).text();
  const err = await new Response(child.stderr).text();
  expect(await child.exited).toBe(1);
  expect(out).toBe("");
  expect(err).toStartWith("source-freeze-blocked:");
  expect(err).not.toContain(process.cwd());
});

function rehash(value: ReturnType<typeof buildSourceFreeze>): ReturnType<typeof buildSourceFreeze> {
  const { digest: _digest, ...body } = value;
  return { ...body, digest: createHash("sha256").update(JSON.stringify(body)).digest("hex") };
}
for (const attack of [
  "wrong-source",
  "duplicate-source",
  "drift",
  "dirty-tree",
  "unknown-key",
  "empty-trees",
  "branches",
  "pull-requests",
  "detached",
  "dirty-source",
  "inaccessible",
  "observation-incomplete",
]) {
  test(`rejects recomputed digest after ${attack}`, () => {
    const freeze = buildSourceFreeze(clean());
    const first = freeze.repositories[0];
    if (!first) throw new Error("fixture");
    switch (attack) {
      case "wrong-source":
        first.source = "product-research";
        break;
      case "duplicate-source":
        first.source = freeze.repositories[1]?.source ?? "";
        break;
      case "drift":
        first.localCommit = "b".repeat(40);
        break;
      case "dirty-tree":
        if (first.worktrees[0]) first.worktrees[0].dirty = true;
        break;
      case "unknown-key":
        Object.assign(first, { personal: "synthetic" });
        break;
      case "empty-trees":
        first.worktrees = [];
        break;
      case "branches":
        first.branches = [{ refDigest: "c".repeat(64), commit: "a".repeat(40) }];
        break;
      case "pull-requests":
        first.openPullRequests = [1];
        break;
      case "detached":
        if (first.worktrees[0]) first.worktrees[0].detached = true;
        break;
      case "dirty-source":
        Object.assign(first, { dirty: true });
        break;
      case "inaccessible":
        Object.assign(first, { accessible: false });
        break;
      case "observation-incomplete":
        Object.assign(first, { observationComplete: false });
        break;
    }
    first.blockers = [];
    expect(() => assertQuiescent(rehash(freeze))).toThrow("source-freeze-blocked");
  });
}
test("missing worktree coverage cannot yield accepted evidence", () => {
  const input = clean();
  if (input[0]) input[0].worktrees = [];
  expect(() => assertQuiescent(buildSourceFreeze(input))).toThrow();
});
test("unknown runtime observations fail safely", () => {
  for (const value of [null, {}, [null], [{ source: "x" }], { secret: "synthetic" }])
    expect(() => buildSourceFreeze(value as never)).toThrow("invalid-observation");
});
test("unknown runtime freezes fail safely", () => {
  for (const value of [null, {}, [], { secret: "synthetic" }])
    expect(() => assertQuiescent(value as never)).toThrow("source-freeze-blocked");
});
