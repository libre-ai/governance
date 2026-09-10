# Authorized Execution Specification Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:executing-plans to implement this plan task-by-task. The work is
> intentionally serial across authority boundaries.

**Goal:** Promote exactly the eleven reviewed authorized-execution contract
families from `candidate` to `locked`, pin both disposable SDK projections to
the resulting Contracts authority, and preserve the runtime gate.

**Architecture:** Governance records the separate owner Specification Lock act.
Contracts performs the only normative state transition and keeps the reviewed
authority bytes immutable. The TypeScript and Rust SDKs then consume one exact
Contracts commit and verify the locked state. Missions, Orchestrator, Harness,
Proof/Artifact and every worker runtime remain unchanged.

**Tech Stack:** Markdown doctrine, JSON catalog, Bun 1.4, TypeScript 7, Rust,
SHA-256, GitHub pull-request gates.

**Reviewed authority:** Contracts commit
`cb865613039c78e344bcbb51f4dbdfd469f634b9`, contracts tree
`8015ead233c805a30f2bb1e74c5feedaaafdb7ce`, with architecture, security and
privacy approvals recorded in
`docs/reviews/authorized-execution-contracts-review.md`.

## Global constraints

- Security > quality > performance > completeness.
- Promote exactly these eleven IDs and no others:
  `execution-graph-v1`, `execution-plan-body-v2`, `execution-transfer-v1`,
  `execution-authorization-v2`, `human-decision-request-v1`,
  `human-decision-response-v1`, `step-invocation-v1`,
  `effect-attestation-v1`, `orchestrator-event-v3`,
  `retention-policy-schema-v2`, `retention-policy-v2`.
- Preserve every reviewed schema, fixture, semantic vector, digest vector and
  retention authority byte-for-byte.
- Leave exactly four unrelated candidates unchanged: `harness-profile-v2`,
  `public-vote-dataset-v3`, `boussole-method-v3`, `local-comparison-v3`.
- `locked` stabilizes contract meaning only. It authorizes no runtime,
  dependency, service, deployment, real mission, data migration or capability.
- LangGraph remains a non-normative question and failure-scenario oracle; it is
  absent from authority bytes, SDK pins and runtime dependencies.
- Use strict RED -> GREEN -> REFACTOR for every new executable gate.
- Use signed English commits without co-author trailers. Merge only after fresh
  local gates, review-only passes and green remote gates.
- Integrate in authority order: Governance, Contracts, then both SDKs.

---

### Task 1: Record the owner Specification Lock act in Governance

**Repository:** `libre-ai/governance`

**Files:**

- Create: `docs/adr/0036-authorized-execution-specification-lock.md`
- Modify: `docs/adr/0034-authorized-execution-graph-boundary.md`
- Modify: `docs/decisions/DECISION-REGISTER.md`
- Create: this implementation plan

- [ ] Add ADR-0036 with the 2026-09-10 owner act, exact eleven-ID scope,
  immutable reviewed authority, rollback boundary and explicit Phase 4 denials.
- [ ] Mark ADR-0034 as extended without rewriting its historical candidate-only
  authorization.
- [ ] Add D42 summarizing the lock and its non-runtime consequence.
- [ ] Run `git diff --check`, `bun run check` and `reuse lint`.
- [ ] Commit, perform a clean review-only pass, open the PR, wait for green
  checks, merge with DCO sign-off and reproduce post-merge checks.

### Task 2: Add an executable lock invariant in Contracts using TDD

**Repository:** `libre-ai/contracts`

**Files:**

- Create: `tools/quality/authorized-execution-lock.test.ts`
- Modify: `contracts/catalog.v1.json`
- Modify: `README.md`
- Modify: `contracts/CATALOG.md`
- Modify: `contracts/agent-orchestration/SEMANTICS.md`

- [ ] Write a test that consumes the real catalog and authority files. It must
  reject the current candidate state, assert the exact eleven locked IDs with no
  review object, assert `99 locked / 4 candidate`, assert the exact four
  remaining candidates, and reproduce every reviewed SHA-256.
- [ ] Run the focused test and observe RED because the eleven entries are still
  candidates.
- [ ] Change only their catalog status to `locked` and remove only their
  satisfied review objects. Update lifecycle prose without changing semantics.
- [ ] Run the focused test GREEN, then `bun run check` and `reuse lint`.
- [ ] Commit the immutable promotion target and perform separate architecture,
  security, privacy and promotion-integration review-only passes against it.
- [ ] Persist the review evidence in
  `docs/reviews/authorized-execution-contracts-review.md`, commit that dossier,
  rerun all gates, open the PR, wait for green checks, merge with DCO sign-off
  and reproduce post-merge checks.

### Task 3: Pin and verify the TypeScript projection using TDD

**Repository:** `libre-ai/sdk-ts`

**Files:**

- Modify: `src/registry.test.ts`
- Modify: `package.json`
- Modify: `bun.lock`

- [ ] Add a real pinned-catalog assertion for the exact locked family and the
  four remaining candidates; run it RED against the old candidate pin.
- [ ] Pin `@libre-ai/contracts` to the exact reviewed Contracts lock commit and
  run `bun install --frozen-lockfile`.
- [ ] Run the focused test GREEN, `bun run generate:check`, `bun run check` and
  `reuse lint`. Reject any generated projection byte change.
- [ ] Commit and keep the branch unmerged until Contracts main contains the
  pinned authority commit.

### Task 4: Pin and verify the Rust projection using TDD

**Repository:** `libre-ai/sdk-rs`

**Files:**

- Create: `scripts/authorized-execution-lock.test.ts`
- Modify: `package.json`
- Modify: `bun.lock`

- [ ] Add a real pinned-catalog test with the same exact lock/candidate
  assertions; wire it into the repository check and observe RED on the old pin.
- [ ] Pin `@libre-ai/contracts` to the exact reviewed Contracts lock commit and
  run `bun install --frozen-lockfile`.
- [ ] Run the focused test GREEN, `bun run check`, `cargo fmt --all --check`,
  `cargo clippy --locked --all-targets --all-features -- -D warnings`,
  `cargo test --locked --all-features` and `reuse lint`. Reject generated Rust
  or schema projection byte changes.
- [ ] Commit and keep the branch unmerged until Contracts main contains the
  pinned authority commit.

### Task 5: Review, integrate and clean up

- [ ] Perform one final cross-repository review against immutable heads on the
  four axes plus sovereignty and PII, with explicit proof that runtime files and
  authority bytes did not change.
- [ ] Open both SDK PRs after Contracts is merged, wait for all checks, merge
  each with DCO sign-off, and reproduce post-merge repository gates.
- [ ] Confirm all four default branches contain the intended commits, all
  worktrees are clean, and no authorized-execution runtime capability exists.
- [ ] Remove only the four task worktrees and delete only their local task
  branches after successful integration. Preserve every pre-existing user
  branch, worktree and untracked file.

## Rollback

- Governance rollback is a revert of ADR-0036/D42.
- Contracts rollback is a revert of the catalog promotion and lifecycle prose;
  reviewed authority bytes require no migration.
- SDK rollback is a pin revert. No generated type, runtime state or user data is
  migrated by this package.
- Any authority-byte drift, failed role review, stale pin, red gate or runtime
  expansion changes the verdict to `hold` before merge.
