import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import Ajv from "ajv";
import schema from "../../migration/public-portfolio.v1.schema.json";
import { observeSources } from "./source-observation";
import type { Portfolio, SourceFreezeV1, SourceObservation } from "./types";

const validate = new Ajv({ strict: true, allowUnionTypes: true }).compile<Portfolio>(schema);
// Separate structural validation from quiescence: incomplete observations remain reportable.
const oid = { type: "string", pattern: "^[a-f0-9]{40}$" };
const hash = { type: "string", pattern: "^[a-f0-9]{64}$" };
const string = { type: "string" };
const boolean = { type: "boolean" };
function strictObject(properties: Record<string, unknown>): object {
  return {
    type: "object",
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  };
}
function array(items: object): object {
  return { type: "array", items };
}
const observationValidator = new Ajv({ strict: true }).compile<SourceObservation[]>(
  array(
    strictObject({
      source: string,
      identityVerified: boolean,
      accessible: boolean,
      defaultBranch: string,
      remoteCommit: { type: "string", pattern: "^([a-f0-9]{40})?$" },
      localCommit: { type: "string", pattern: "^([a-f0-9]{40})?$" },
      dirty: boolean,
      branches: array(strictObject({ ref: string, commit: oid })),
      worktrees: array(
        strictObject({ path: string, commit: oid, dirty: boolean, detached: boolean }),
      ),
      openPullRequests: array({ type: "integer", minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
      errors: array(string),
    }),
  ),
);
const quiescenceValidator = new Ajv({ strict: true }).compile<SourceFreezeV1>(
  strictObject({
    schemaVersion: { const: "source-freeze.v1" },
    identityVerified: { const: true },
    digest: hash,
    repositories: {
      type: "array",
      minItems: 36,
      maxItems: 36,
      items: strictObject({
        source: string,
        defaultBranch: { const: "main" },
        remoteCommit: oid,
        localCommit: oid,
        accessible: { const: true },
        dirty: { const: false },
        observationComplete: { const: true },
        blockers: { type: "array", maxItems: 0 },
        branches: { type: "array", maxItems: 0 },
        openPullRequests: { type: "array", maxItems: 0 },
        worktrees: {
          type: "array",
          minItems: 1,
          items: strictObject({
            pathDigest: hash,
            commit: oid,
            dirty: { const: false },
            detached: { const: false },
          }),
        },
      }),
    },
  }),
);
export function readPortfolio(
  input: unknown = JSON.parse(
    readFileSync(new URL("../../migration/public-portfolio.v1.yaml", import.meta.url), "utf8"),
  ),
): Portfolio {
  if (!validate(input)) throw new Error("invalid-portfolio");
  if (new Set(input.sources.map((item) => item.source)).size !== 36)
    throw new Error("duplicate-source");
  for (const item of input.sources) {
    if (item.localDirectory !== (item.source === ".github" ? "dot-github" : item.source))
      throw new Error("invalid-source-mapping");
    if (
      item.disposition === "delete"
        ? item.target !== null
        : item.target === null ||
          !(
            item.disposition === "conditional" ? input.conditionalTargets : input.certainTargets
          ).includes(item.target)
    )
      throw new Error("invalid-disposition-target");
  }
  return input;
}
function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
export function buildSourceFreeze(input: unknown): SourceFreezeV1 {
  if (!observationValidator(input)) throw new Error("invalid-observation");
  const expected = readPortfolio()
    .sources.map((item) => item.source)
    .sort();
  if (JSON.stringify(input.map((item) => item.source).sort()) !== JSON.stringify(expected))
    throw new Error("incomplete-source-inventory");
  const repositories = input
    .map((item) => {
      const blockers: string[] = [];
      if (!item.identityVerified) blockers.push("identity-unverified");
      if (!item.accessible) blockers.push("source-inaccessible");
      if (item.defaultBranch !== "main") blockers.push("unexpected-default-branch");
      if (!/^[a-f0-9]{40}$/.test(item.remoteCommit) || item.remoteCommit !== item.localCommit)
        blockers.push("default-drift");
      if (item.dirty || item.worktrees.some((tree) => tree.dirty)) blockers.push("dirty-worktree");
      if (item.branches.length) blockers.push("unreviewed-branches");
      if (item.worktrees.some((tree) => tree.commit !== item.remoteCommit || tree.detached))
        blockers.push("unreviewed-worktree");
      if (item.openPullRequests.length) blockers.push("open-pull-requests");
      if (!item.worktrees.length) blockers.push("missing-worktree-coverage");
      if (item.errors.length) blockers.push("observation-incomplete");
      return {
        source: item.source,
        accessible: item.accessible,
        dirty: item.dirty,
        observationComplete: item.errors.length === 0,
        defaultBranch: item.defaultBranch === "main" ? "main" : "unexpected",
        remoteCommit: /^[a-f0-9]{40}$/.test(item.remoteCommit) ? item.remoteCommit : "",
        localCommit: /^[a-f0-9]{40}$/.test(item.localCommit) ? item.localCommit : "",
        blockers,
        branches: item.branches
          .map((branch) => ({ refDigest: digest(branch.ref), commit: branch.commit }))
          .sort((a, b) => a.refDigest.localeCompare(b.refDigest)),
        worktrees: item.worktrees
          .map((tree) => ({
            pathDigest: digest(tree.path),
            commit: tree.commit,
            dirty: tree.dirty,
            detached: tree.detached,
          }))
          .sort((a, b) => a.pathDigest.localeCompare(b.pathDigest)),
        openPullRequests: [...item.openPullRequests].sort((a, b) => a - b),
      };
    })
    .sort((a, b) => a.source.localeCompare(b.source));
  const body = {
    schemaVersion: "source-freeze.v1" as const,
    identityVerified: input.every((item) => item.identityVerified),
    repositories,
  };
  return { ...body, digest: digest(JSON.stringify(body)) };
}
export function assertQuiescent(freeze: unknown): asserts freeze is SourceFreezeV1 {
  if (!quiescenceValidator(freeze)) throw new Error("source-freeze-blocked");
  const { digest: actual, ...body } = freeze;
  const expected = readPortfolio()
    .sources.map((item) => item.source)
    .sort();
  const observed = freeze.repositories.map((item) => item.source).sort();
  if (
    actual !== digest(JSON.stringify(body)) ||
    JSON.stringify(expected) !== JSON.stringify(observed) ||
    freeze.repositories.some(
      (item) =>
        item.localCommit !== item.remoteCommit ||
        item.worktrees.some((tree) => tree.commit !== item.remoteCommit) ||
        new Set(item.worktrees.map((tree) => tree.pathDigest)).size !== item.worktrees.length,
    )
  )
    throw new Error("source-freeze-blocked");
}

if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 3 || args[0] !== "--dry-run" || args[1] !== "--source-root" || !args[2])
      throw new Error("usage");
    const freeze = buildSourceFreeze(await observeSources(readPortfolio(), args[2]));
    console.log(JSON.stringify(freeze, null, 2));
    assertQuiescent(freeze);
  } catch {
    console.error(
      "source-freeze-blocked: use --dry-run --source-root PATH; no source mutation performed",
    );
    process.exitCode = 1;
  }
}
