# Clean Repository Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce fully tested clean target repository trees from frozen source commits without retaining dead code, obsolete licenses, or source history.

**Architecture:** Governance provides a fail-closed manifest compiler. It inventories immutable source commits, reconciles real consumers, classifies every tracked path, validates relicensing rights, evaluates conditional boundaries, and composes targets from allow-lists. Output repositories remain local until the cutover plan.

**Tech Stack:** Bun 1.4 canary, strict TypeScript, Git plumbing, JSON Schema/Ajv, Cargo metadata, Bun lockfiles, REUSE, SHA-256.

**Spec:** `docs/superpowers/specs/2026-09-10-public-portfolio-big-bang-design.md`

## Execution ordering

Follow the coordinator plan's **Executable Dependency Order**, not packet-number order.
Local candidate implementation is authorized; it is not final admission or publication proof.
Final authority identifiers are ADR-0041/I-32/D46 after the `65fbff2` collision recheck;
ADR-0039/I-31 (private research) and ADR-0040/D45 (run-control persistence) remain intact.

## Global Constraints

- Run only after all pre-existing repository sessions have ended.
- Re-fetch every source and use exact remote default-branch commits, never stale local branches.
- Never infer that a test is a production consumer.
- Never copy a complete source tree and subtract a deny-list; targets are allow-list compositions.
- A path with unknown license, rights, consumer, or disposition blocks composition.
- Keep run artifacts outside public repositories and emit no personal data.
- This packet performs no GitHub deletion, rename, visibility, metadata, or branch mutation.
- Preserve existing product architecture and integrate single-consumer code; package/crate boundaries require path, reachability, and consumer evidence, never cosmetic uniformity.
- Local Signalement has no GitHub remote and remains a private-first candidate outside the 36 public source repositories and this public target contract.

### Task 1: Implement source quiescence and freeze auditing

**Files:**
- Create: `tools/migration/types.ts`
- Create: `tools/migration/source-freeze.ts`
- Create: `tools/migration/source-freeze.test.ts`
- Create: `tools/migration/fixtures/source-freeze/clean.json`
- Create: `tools/migration/fixtures/source-freeze/dirty.json`
- Create: `migration/public-portfolio.v1.yaml`
- Create: `migration/public-portfolio.v1.schema.json`
- Modify: `package.json`

**Interfaces:**

```ts
interface FrozenRepository {
  source: string;
  defaultBranch: "main";
  remoteCommit: string;
  localCommit: string;
  clean: boolean;
  unpushedCommits: string[];
  openPullRequests: number[];
  nonDefaultBranches: string[];
  worktrees: { path: string; commit: string; dirty: boolean }[];
}

interface SourceFreezeV1 {
  schemaVersion: "source-freeze.v1";
  githubLogin: "constantin-jais";
  repositories: FrozenRepository[];
  digest: string;
}
```

- [ ] Populate `migration/public-portfolio.v1.yaml` with all 36 current source repositories and exactly one repository-level disposition: retain, rename, absorb, conditional, or delete.
- [ ] Write schema tests rejecting duplicate sources, duplicate final slugs, missing sources, a 15th certain target, a seventh conditional target, and an unrecognized disposition.
- [ ] Add a negative fixture for local Signalement being silently included in the 36-source inventory or the public target set.
- [ ] Write source-freeze tests for dirty worktree, detached unpushed commit, useful open PR, non-main remote drift, missing local clone, inaccessible private fork, and GitHub login mismatch.
- [ ] Run `bun test tools/migration/source-freeze.test.ts` and confirm failure because `buildSourceFreeze` is absent.
- [ ] Implement `buildSourceFreeze(input: SourceObservation[]): SourceFreezeV1` and `assertQuiescent(freeze: SourceFreezeV1): void`.
- [ ] Make output canonical JSON sorted by source slug and hash it without timestamps or local absolute paths.
- [ ] Add `migration:freeze --dry-run`; it may read GitHub and local Git state but cannot mutate either.
- [ ] Run against fixtures, then run a read-only real audit. A current failure is expected until the owner declares other sessions finished; record failures without treating them as migration input.
- [ ] Commit as `feat: add fail-closed source freeze audit`.

### Task 2: Reconcile real consumers and shipped entry points

**Files:**
- Create: `tools/migration/dependency-graph.ts`
- Create: `tools/migration/dependency-graph.test.ts`
- Create: `tools/migration/entry-points.ts`
- Create: `tools/migration/entry-points.test.ts`
- Create: `tools/migration/fixtures/dependencies/package.json`
- Create: `tools/migration/fixtures/dependencies/Cargo.toml`
- Create: `tools/migration/fixtures/dependencies/Cargo.lock`

**Interfaces:**

```ts
interface ConsumerEdge {
  consumer: string;
  provider: string;
  kind: "runtime" | "build" | "peer" | "dev";
  releasedArtifact: boolean;
}

interface ShippedEntryPoint {
  repository: string;
  path: string;
  kind: "package-export" | "binary" | "library" | "application" | "contract" | "tool";
}
```

- [ ] Write failing tests for npm dependencies, peer dependencies, dev-only dependencies, Cargo normal/build/dev dependencies, workspace members, binaries, library roots, package exports, application commands, and machine-readable contracts.
- [ ] Assert dev-only and test imports do not count as independent consumers.
- [ ] Run both focused tests and confirm failure before implementation.
- [ ] Implement deterministic parsers for `package.json`, `bun.lock`, `Cargo.toml`, `Cargo.lock`, and documented application entry points.
- [ ] Produce a graph that counts only independent shipped consumers and explains every excluded edge.
- [ ] Compare the graph with the approved repository boundary: one consumer integrates, multiple consumers distribute, zero consumers delete, security exception requires all four autonomous proofs.
- [ ] Commit as `feat: reconcile repository consumers`.

### Task 3: Classify every source path

**Files:**
- Create: `tools/migration/path-manifest.ts`
- Create: `tools/migration/path-manifest.test.ts`
- Create: `tools/migration/reachability.ts`
- Create: `tools/migration/reachability.test.ts`
- Create: `tools/migration/fixtures/paths/source-tree.txt`
- Create: `tools/migration/fixtures/paths/allow-list.v1.yaml`

**Interfaces:**

```ts
type PathDisposition =
  | { kind: "retain"; target: string; targetPath: string; entryPoint: string }
  | { kind: "generate"; target: string; targetPath: string; canonicalSource: string }
  | { kind: "delete"; reason: "dead" | "obsolete" | "duplicate" | "generated-orphan" | "private-data" };

interface PathRecord {
  source: string;
  sourceCommit: string;
  sourcePath: string;
  sourceDigest: string;
  disposition: PathDisposition;
}
```

- [ ] Write tests rejecting an unclassified Git path, target-path collision, retained test-only module, generated output without canonical source, vendored dependency without provenance, node_modules, build output, coverage output, personal-data fixture, obsolete license, and old agent-lineage schema.
- [ ] Write positive tests for code reached from a shipped entry point, public contracts, required tests, API docs, examples, migrations, and required third-party notices.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Implement `buildPathManifest(files, entryPoints, edges, decisions)` so every tracked source path has exactly one disposition.
- [ ] Implement reverse reachability from shipped entry points; tests are retained because they cover shipped behavior, but they never make their dependencies reachable.
- [ ] Render one reviewed YAML allow-list per target under the private run directory; do not commit current source commits to the future clean public history.
- [ ] Add a coverage assertion: classified source paths equal `git ls-files` across all frozen sources.
- [ ] Commit as `feat: classify migration paths by reachability`.

### Task 4: Prove licensing and relicensing authority

**Files:**
- Create: `tools/migration/license-audit.ts`
- Create: `tools/migration/license-audit.test.ts`
- Create: `tools/migration/fixtures/licenses/allowed.json`
- Create: `tools/migration/fixtures/licenses/unknown-owner.json`
- Create: `tools/migration/fixtures/licenses/required-notice.json`
- Create: `docs/migration/licensing-evidence-policy.md`

**Interfaces:**

```ts
interface LicenseVerdict {
  path: string;
  sourceLicense: string;
  targetLicense: "Apache-2.0" | "CC-BY-4.0" | string;
  rightsEvidence: string[];
  requiredNotices: string[];
  verdict: "accept" | "reject";
  reason?: string;
}
```

- [ ] Write tests rejecting unknown authorship, incompatible target license, missing notice, stale license file, and a claim that deleting Git history revokes an earlier license.
- [ ] Write tests accepting a file with complete owner evidence and a third-party dependency whose notice survives into the target.
- [ ] Run the focused test and confirm failure before implementation.
- [ ] Implement a classifier that combines REUSE metadata, repository license, path history, contribution sign-offs, and dependency notices without logging author email addresses.
- [ ] Require explicit `rightsEvidence` for every relicensed file; absence is `reject`, never an inferred owner grant.
- [ ] Write the protected-evidence policy: access boundary, encryption, no routine automation access, no logs, and retention governed by legal basis rather than public-history cleanup.
- [ ] Run the license audit on the frozen manifest. Exclude rejected paths and rerun target reachability; if an entry point becomes incomplete, block that target.
- [ ] Commit as `feat: gate clean targets on license authority`.

### Task 5: Evaluate the six conditional targets

**Files:**
- Create: `tools/migration/conditional-gates.ts`
- Create: `tools/migration/conditional-gates.test.ts`
- Create: `migration/gates/vote-mirror.v1.yaml`
- Create: `migration/gates/travel-planner.v1.yaml`
- Create: `migration/gates/execution-guard.v1.yaml`
- Create: `migration/gates/authorization.v1.yaml`
- Create: `migration/gates/artifact-proof.v1.yaml`
- Create: `migration/gates/collaboration.v1.yaml`

**Interfaces:**

```ts
interface ConditionalGateVerdict {
  target: string;
  candidateCommit: string;
  assertions: { id: string; evidence: string; passed: boolean }[];
  verdict: "admit" | "reject";
  failureDisposition: string;
}
```

- [ ] Encode every required proof and failure disposition exactly as specified in design section 5.2.
- [ ] Treat all six conditional slugs and display names as provisional planning identifiers. Fail public name projection unless the matching immutable executable admission verdict is `admit`.
- [ ] Write tests proving one missing assertion rejects a target and that a rejected target cannot appear in a public projection or final private staging. An isolated local candidate is allowed before admission solely to execute required proofs.
- [ ] Run the focused test and confirm failure before implementation.
- [ ] Implement gate evaluation from immutable evidence references; no free-text “looks ready” verdict is accepted.
- [ ] Execute each repository's canonical `check` command plus the named E2E or threat-model proof.
- [ ] For a rejected `execution-guard` or `authorization`, regenerate the path manifest using its integration disposition and prove the receiving target remains green.
- [ ] Emit six signed verdict documents into the private run directory and hash them into the transaction manifest.
- [ ] Commit as `feat: evaluate conditional repository boundaries`.

### Task 6: Compose clean target trees

**Files:**
- Create: `tools/migration/compose-target.ts`
- Create: `tools/migration/compose-target.test.ts`
- Create: `tools/migration/root-commit.ts`
- Create: `tools/migration/root-commit.test.ts`
- Create: `tools/migration/target-layouts.ts`
- Create: `tools/migration/target-layouts.test.ts`

**Interfaces:**

```ts
interface ComposedTarget {
  slug: string;
  directory: string;
  treeDigest: string;
  sourceManifestDigest: string;
  rootCommit?: string;
}

async function composeTarget(input: ComposeTargetInput): Promise<ComposedTarget>;
async function createSignedRootCommit(target: ComposedTarget, signingKey: string): Promise<string>;
```

- [ ] Write tests proving composition copies only allow-listed digests, normalizes no source bytes silently, refuses collisions/traversal/symlinks escaping the tree, and produces identical tree digests twice.
- [ ] Write tests proving root commits have no parents, use the GitHub noreply identity, contain the reviewed license set, and carry a verifiable signature.
- [ ] Write layout tests rejecting an extra Missions feature hierarchy, separately packaged single-consumer Auth/Build Brief code, mixed canonical/generated contracts, Sessions data-rights extraction without consumer/path proof, or unsupported `ecosystem-engine`/`envelope` internal boundaries.
- [ ] Add positive fixtures for existing domain-oriented Missions integration, Sessions `apps/sessions/src/rgpd` integration, separated generated SDKs, and an internal boundary justified by complete reachability/consumer evidence. Missing evidence fails closed.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Implement atomic target-directory creation through a sibling staging directory and rename.
- [ ] Materialize the 14 certain targets and admitted conditional targets under the private run directory.
- [ ] Use these boundary-driven roots for consolidated repositories; each retained source path receives an exact destination in the reviewed manifest:

```text
missions/        apps/missions (existing app, authz, domain, persistence, server, shared, ui)
app-kit/         packages/ui, packages/web, packages/testing
contracts/       contracts, generated/typescript, generated/rust
governance/      brand, portfolio, tools; ecosystem-engine boundary only with proof
mission-control/ existing runtime roots; envelope boundary only with proof
sessions/        apps/sessions (data-rights code integrated into existing src/rgpd)
```

- [ ] Integrate Missions Auth and Build Brief into the exact existing architectural boundaries listed in the surfaces plan. Keep unchanged product code at its current application/crate roots unless the path manifest proves a complete refactor is required; reject a refactor with incomplete path/dependency/test coverage.
- [ ] Treat `contracts/` as editable canonical authority and `generated/typescript/` plus `generated/rust/` as reproducible projections with independent packaging manifests when distribution requires them. Prove generation and anonymous package consumption; an alternate root requires a failing packaging proof and a reviewed explicit replacement.
- [ ] Keep `rgpd-kit` inside `apps/sessions`; a separate private package is permitted only when the manifest proves a real internal consumer boundary. Retain `ecosystem-engine` in governance and `envelope` in Mission Control only to the extent their shipped reachability and consumer proofs justify an internal crate/package; integrate required code or delete unreachable code otherwise.
- [ ] Generate root manifests, lockfiles, REUSE files, API docs, examples, and English/French README shells from reviewed sources.
- [ ] Install dependencies from registries in clean environments; remove every Git dependency before accepting a target.
- [ ] Run each target's unit, focused, API, E2E, lint, typecheck, license, dead-code, secret, and personal-data checks as applicable.
- [ ] Create final signed parentless root commits only after S/R implementation is complete and two clean compositions produce identical tree digests. Development commits are never imported as parents.
- [ ] Commit the composer changes as `feat: compose clean repository roots`.

### Task 7: Produce the immutable composition report

**Files:**
- Create: `tools/migration/composition-report.ts`
- Create: `tools/migration/composition-report.test.ts`

- [ ] Write a golden test for a report containing 36 source dispositions, 14 certain targets, six conditional verdicts, target tree/root-commit digests, license verdict counts, and zero unclassified paths.
- [ ] Implement deterministic JSON and Markdown renderers with no timestamps, local paths, author names, emails, branch names, or tokens.
- [ ] Generate the report twice and compare bytes.
- [ ] Run every target check again from its signed root commit, not from its mutable composition directory.
- [ ] Run the governance `bun run check` suite.
- [ ] Commit as `feat: report clean portfolio composition`.

Expected final evidence:

```text
COMPOSITION READY: sources=36 certain=14 conditional_evaluated=6 unclassified_paths=0 unsigned_roots=0
```
