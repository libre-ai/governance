# Public Portfolio Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current GitHub organization with the qualified clean target set and expose one Missions-led public launch without retaining obsolete public histories.

**Architecture:** A coordinator consumes immutable proof bundles from the preceding plans. It stages clean repositories privately, renders a deterministic transaction, stops for exact owner confirmation, performs ordered GitHub mutations, and validates the anonymous public result. The transaction retries immutable targets; it never repairs content during cutover.

**Tech Stack:** Bun 1.4 canary, strict TypeScript, GitHub REST/GraphQL APIs through `gh`, Git, SHA-256, OCI/npm/crates.io verification, Playwright smoke, Clever Cloud Paris/EU.

**Spec:** `docs/superpowers/specs/2026-09-10-public-portfolio-big-bang-design.md`

## Execution ordering

Follow the coordinator plan's **Executable Dependency Order**, not packet-number order.
Local candidate implementation is authorized; it is not final admission or publication proof.
Final authority identifiers are ADR-0041/I-32/D46 after the `65fbff2` collision recheck;
ADR-0039/I-31 (private research) and ADR-0040/D45 (run-control persistence) remain intact.

## Global Constraints

- The owner gave the explicit migration GO on 2026-09-11; preparation and private staging may proceed once their prerequisite proofs pass. Do not request that GO again.
- Treat that GO as authorization to prepare/stage, not authorization to delete repositories.
- Require a second explicit confirmation quoting the final transaction digest and exact deletion list.
- Never use force-push, wildcard deletion, unresolved environment variables, or a broad filesystem target.
- Never print tokens, email addresses, local absolute worktree paths, IP addresses, or user-agent strings.
- Stop on first failed assertion; do not continue through partial damage.
- Cutover uses immutable root commits and release digests produced before the destructive checkpoint.
- Local Signalement has no GitHub remote and remains a private-first candidate outside the 36 observed public source repositories, this public target contract, and every deletion/publication operation.

### Task 1: Re-establish execution truth after the migration GO

**Files:**
- Create in target `governance`: `tools/migration/preflight.ts`
- Create in target `governance`: `tools/migration/preflight.test.ts`
- Create in target `governance`: `tools/migration/run-layout.ts`
- Create in target `governance`: `tools/migration/run-layout.test.ts`

**Interfaces:**

```ts
interface MigrationPreflight {
  phase: "staging" | "final";
  sourceFreezeDigest: string;
  pathManifestDigest: string;
  targetTreeDigests: Record<string, string>;
  conditionalVerdictDigests: Record<string, string>;
  securitySettingsDigest: string;
  releaseDigests: Record<string, string>;
  allSessionsQuiescent: boolean;
  permissionsComplete: boolean;
  signatureKeyVerified: boolean;
  verdict: "pass" | "fail";
}
```

- [ ] Under the GO received on 2026-09-11, fetch every source default branch and repeat the full quiescence audit; do not reuse the planning-session snapshot.
- [ ] Re-run all repository canonical checks on the frozen commits.
- [ ] Rebuild the source freeze, dependency graph, path manifest, license verdicts, conditional verdicts, target trees, root commits, settings payloads, and public projections.
- [ ] Compare every regenerated digest with the reviewed preparation bundle; any difference invalidates downstream approvals and returns to the owning packet.
- [ ] Run the read-only GitHub permission audit and verify the active account is `constantin-jais`, commit email is GitHub noreply, and the registered signing key verifies a harmless commit.
- [ ] Verify domain, Clever technical URL, EU registry, npm/crates.io artifacts, GitHub mirror, and all anonymous quickconsumer checks.
- [ ] Write phase-specific preflight evidence and sign its digest. Staging preflight requires local/root/security prerequisites but cannot assert private remote qualification before X2. Final preflight runs after X2 and requires the actual private-clone, registry and current-source proofs.
- [ ] Run `bun tools/migration/preflight.ts --verify-current` and require `verdict=pass`; the command resolves the one run whose signed freeze digest matches the current coordinator worktree.

### Task 2: Create and qualify private staging repositories

**Files:**
- Create in target `governance`: `tools/migration/stage-repositories.ts`
- Create in target `governance`: `tools/migration/stage-repositories.test.ts`
- Create in target `governance`: `tools/migration/staging-names.ts`
- Create in target `governance`: `tools/migration/staging-names.test.ts`

**Interfaces:**

```ts
function stagingName(finalSlug: string, rootCommit: string): string {
  return `zz-cutover-${finalSlug.replace(/^\./, "dot-")}-${rootCommit.slice(0, 8)}`;
}

interface StagedRepository {
  stagingName: string;
  finalSlug: string;
  rootCommit: string;
  treeDigest: string;
  private: true;
  qualified: boolean;
}
```

- [ ] Write tests rejecting a staging name collision, public visibility, unexpected default branch, extra ref, extra release, wrong root commit, or tree digest mismatch.
- [ ] Run the focused tests and confirm failure before implementation.
- [ ] Implement staging as create-private → push one signed root commit → verify remote tree → apply security settings → run CI → verify no extra refs.
- [ ] Create one private staging repository per admitted target using only exact generated names.
- [ ] Apply descriptions/topics/homepages while private, omitting any homepage whose smoke evidence is not green.
- [ ] Configure secret scanning, push protection, security updates, private reporting, and branch rules before visibility can change.
- [ ] Publish no organization profile, pin, source deletion, final rename, or public visibility in this task.
- [ ] Run anonymous-equivalent clean clones with explicit credentials only for private access; then run every repository gate.
- [ ] Sign and store the staged-repository inventory in the private run directory. Re-run X1 in final mode and the final program acceptance before X3; private staging existence alone is not qualification.

### Task 3: Compile the exact destructive transaction

**Files:**
- Create in target `governance`: `tools/migration/transaction.ts`
- Create in target `governance`: `tools/migration/transaction.test.ts`
- Create in target `governance`: `tools/migration/render-confirmation.ts`
- Create in target `governance`: `tools/migration/render-confirmation.test.ts`

**Interfaces:**

```ts
interface RepositoryMutation {
  source: string;
  expectedSourceCommit: string;
  action: "delete-and-replace" | "delete";
  target?: string;
  expectedTargetRoot?: string;
}

interface CutoverTransactionV1 {
  schemaVersion: "cutover-transaction.v1";
  repositories: RepositoryMutation[];
  stagedRepositories: StagedRepository[];
  releases: { subject: string; digest: string }[];
  profileDigest: string;
  websiteDigest: string;
  securitySettingsDigest: string;
  irreversibleOperations: string[];
  digest: string;
}
```

- [ ] Write tests proving all 36 sources appear exactly once, all admitted targets have one staged repository, rejected conditionals have their failure disposition, and no unqualified target is publicized.
- [ ] Add tests rejecting Signalement in source/target mutations, provisional conditional names without admission, a `db-inspect` title other than `Libre AI Database Inspector`, or a target lacking green boundary-driven layout evidence.
- [ ] Write tests rejecting source drift, target/root mismatch, missing security settings, unsigned root, missing release subject, unknown irreversible operation, or any deletion target not written as a literal full slug.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Implement canonical transaction serialization with stable repository order and no timestamps.
- [ ] Render a human confirmation that lists every exact `libre-ai/<source>`, its frozen commit, delete/replace action, final target, target root commit, releases, settings digest, and irreversible effects.
- [ ] Render the instruction with the computed value: ``Confirm cutover transaction ${transaction.digest} and delete exactly the repositories listed above.``
- [ ] Publish the confirmation only in the owner conversation; do not write it to an issue, pull request, public log, or repository.
- [ ] Stop. Do not execute Task 4 without the owner's response matching the full digest and exact deletion scope.

### Task 4: Execute the confirmed repository transaction

**Files:**
- Create in target `governance`: `tools/migration/apply-cutover.ts`
- Create in target `governance`: `tools/migration/apply-cutover.test.ts`
- Create in target `governance`: `tools/migration/github-client.ts`
- Create in target `governance`: `tools/migration/github-client.test.ts`
- Create in target `governance`: `tools/migration/journal.ts`
- Create in target `governance`: `tools/migration/journal.test.ts`

**Interfaces:**

```ts
interface MutationReceipt {
  operationId: string;
  repository: string;
  expectedBefore: string;
  observedAfter: string;
  requestDigest: string;
  responseDigest: string;
  completed: boolean;
}

async function applyCutover(transaction: CutoverTransactionV1, confirmation: string): Promise<MutationReceipt[]>;
```

- [ ] Write fake-GitHub tests for success, retry after network loss, already-completed operation, wrong source SHA, rename collision, visibility failure, ruleset failure, and smoke failure.
- [ ] Prove confirmation mismatch performs zero API calls.
- [ ] Prove the recorded 2026-09-11 migration GO alone performs zero destructive/public API calls: only the second owner confirmation matching the final digest and exact deletion list unlocks this task.
- [ ] Prove an API response containing unexpected repository identity or commit stops before the next operation.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Implement an idempotent operation journal containing request/response digests and public facts only; never store headers, tokens, emails, or raw API bodies.
- [ ] Revalidate source commits, staging roots, settings digest, releases, and confirmation immediately before the first mutation.
- [ ] Publish a minimal cutover profile that makes no repository-specific stale claim.
- [ ] Delete only literal repositories in the confirmed transaction, one verified operation at a time.
- [ ] Rename the corresponding private staging repositories to final slugs and re-assert private visibility and security settings after each rename.
- [ ] Verify all final names and roots before changing any visibility.
- [ ] Make the complete target set public, then publish the final profile, social previews, homepage URLs, and up to six evidence-qualified pins.
- [ ] Run `apply-cutover` a second time in verification mode and require zero pending mutations.

### Task 5: Run public smoke and compensate failures

**Files:**
- Create in target `governance`: `tools/migration/public-smoke.ts`
- Create in target `governance`: `tools/migration/public-smoke.test.ts`
- Create in target `governance`: `tools/migration/anonymous-git.ts`
- Create in target `governance`: `tools/migration/anonymous-git.test.ts`

**Interfaces:**

```ts
interface PublicSmokeReport {
  repositories: { slug: string; rootCommit: string; clonePassed: boolean; linksPassed: boolean }[];
  packages: { name: string; version: string; installPassed: boolean }[];
  images: { reference: string; digest: string; verifyPassed: boolean }[];
  websitePassed: boolean;
  missionsDemoPassed: boolean;
  zeroPersonalDataLogPassed: boolean;
  verdict: "pass" | "fail";
}
```

- [ ] Write tests for anonymous Git clone, exact root, README language links, evidence links, preview presence, package install, image pull/signature/SBOM, site routes, Missions demo, self-host command, and post-proof star CTA.
- [ ] Add failure tests for a stale redirect to a deleted repo, Git credential fallback, missing French mirror, broken homepage, unsigned artifact, or personal data in a captured log.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Execute smoke with a fresh credential-free home and explicit network allow-list.
- [ ] On a content-independent publication failure, retry the same immutable target and operation.
- [ ] On a target-content failure, keep the target private, restore the minimal cutover profile, and stop; do not patch during cutover.
- [ ] On a deployed Missions failure, roll back the Clever revision or stop the first deployment, then verify the resulting state.
- [ ] Require every report field to pass before declaring the public cutover complete.

### Task 6: Close the transaction and remove obsolete local state

**Files:**
- Create in target `governance`: `tools/migration/close-cutover.ts`
- Create in target `governance`: `tools/migration/close-cutover.test.ts`
- Create in target `governance`: `docs/evidence/public-portfolio-cutover.md`

- [ ] Write tests refusing closure while any source/target path is unaccounted, any staging repository remains, any obsolete branch/reference is public, any smoke is red, or any package points at a Git dependency.
- [ ] Run the focused test and confirm failure before implementation.
- [ ] Generate public evidence containing only final repository roots, release digests, smoke verdicts, proof links, and material limitations.
- [ ] Remove temporary private staging repositories after proving their final counterpart has the exact root commit.
- [ ] Remove local frozen source clones using explicit paths from the private run manifest only after public smoke and coverage pass.
- [ ] Retain protected licensing evidence according to its legal policy; it is not part of routine migration cleanup.
- [ ] Verify no obsolete local worktree or branch is referenced by an active session before removing it.
- [ ] Run final organization inventory, metadata, dependency, language, link, security, release, and public experience gates.
- [ ] Run an independent exact-commit review, then publish the bounded cutover evidence.
- [ ] Commit the final governance evidence as `docs: record clean public portfolio cutover`.

Expected closure evidence:

```text
CUTOVER COMPLETE: sources_account=36 targets=derived unclassified_paths=0 stale_public_refs=0 smoke=pass
```

The target count is computed from the six signed conditional verdicts; it is never typed manually into automation.
