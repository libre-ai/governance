# Authorized Execution Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the reviewed Phase 3 candidate authority set, adversarial vectors and byte-exact TypeScript/Rust projections without promoting a Specification Lock or opening runtime capability.

**Architecture:** Governance records only programme status and plan. Contracts owns eleven candidate authorities, canonical semantics, digests and vectors. SDK TypeScript and SDK Rust consume one exact Contracts SHA as disposable projections; Missions, Orchestrator, Harness and Proof runtimes remain unchanged.

**Tech Stack:** Markdown doctrine, JSON Schema 2020-12, RFC 8785 JCS, SHA-256, Bun 1.4, AJV 8, TypeScript 7, Rust stable toolchain, `jsonschema`, Typify.

**Spec:** `docs/superpowers/specs/2026-09-09-authorized-execution-contracts-design.md`

## Global Constraints

- Security > quality > performance > completeness.
- Preserve every pre-Phase-3 locked contract byte-for-byte.
- Eleven new catalog entries remain `candidate`; this plan never promotes them to `locked`.
- Use `organizationId` on new surfaces; preserve existing `tenant-private` catalog vocabulary.
- No LangGraph, LangChain, LangSmith or Agent Server dependency, type or serializer.
- No runtime change in Missions, Orchestrator, Harness or Proof/Artifact.
- No new dependency in any repository.
- Authored logic follows strict RED → GREEN → REFACTOR. Generated projections are verified by byte-drift and fixture gates.
- All commits use DCO sign-off and English messages without co-author trailers.
- Every repository is isolated in a linked worktree; user worktrees and dirty files remain untouched.

---

### Task 1: Record the Phase 3 opening in Governance

**Repository:** `libre-ai/governance`

**Files:**

- Modify: `docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md`
- Existing: `docs/superpowers/specs/2026-09-09-authorized-execution-contracts-design.md`
- Create: `docs/superpowers/plans/2026-09-10-authorized-execution-contracts.md`

**Interfaces:**

- Consumes: accepted ADR-0034/D40 and owner approval of the Phase 3 design.
- Produces: one durable pointer from the programme phase to the exact approved design and plan.

- [ ] **Step 1: Replace the stale Phase 3 status**

Replace `**Statut :** non ouverte` with an opened status dated 2026-09-09. State that authoring eleven candidates is authorized, while promotion and runtime remain closed. Link the design and this plan by repository-relative path.

- [ ] **Step 2: Verify Governance**

Run:

```bash
git diff --check
bun run check
reuse lint
```

Expected: 935 or more tests pass, zero fail; REUSE covers every tracked file.

- [ ] **Step 3: Commit the planning authority**

```bash
git add docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md \
  docs/superpowers/plans/2026-09-10-authorized-execution-contracts.md
git commit -s -m "docs: open authorized execution contract phase"
```

---

### Task 2: Establish the Contracts worktree and immutable baseline

**Repository:** `libre-ai/contracts`

**Files:** none modified in this task.

**Interfaces:**

- Produces: `BASE_CONTRACTS_SHA`, the immutable byte baseline for every locked authority.

- [ ] **Step 1: Create the isolated branch**

```bash
git worktree add ../../.worktrees/contracts-authorized-execution \
  -b feat/authorized-execution-contracts main
```

- [ ] **Step 2: Install the pinned toolchain and verify baseline**

Run inside the worktree:

```bash
bun install --frozen-lockfile
bun run check
reuse lint
git rev-parse HEAD
```

Expected: the current Contracts suite is green and the printed SHA is recorded before any edit.

- [ ] **Step 3: Record the immutable authority baseline**

Run:

```bash
git rev-parse HEAD
```

Record the printed SHA as `BASE_CONTRACTS_SHA`. Later verification uses a
name-status diff and rejects every modification or deletion under the authority
roots; only the eleven declared additions are permitted.

---

### Task 3: Build the canonical semantic-vector checker with TDD

**Repository:** `libre-ai/contracts`

**Files:**

- Create: `tools/quality/authorized-execution.ts`
- Create: `tools/quality/authorized-execution.test.ts`
- Create: `contracts/fixtures/authorized-execution-v1/semantic-vectors.v1.json`
- Modify: `tools/quality/check-contracts.ts`

**Interfaces:**

- Produces:

```ts
export type AuthorizedExecutionOutcome =
  | "graph-valid"
  | "duplicate-step"
  | "duplicate-edge"
  | "entry-missing"
  | "dangling-edge"
  | "route-missing"
  | "route-ambiguous"
  | "unreachable-step"
  | "terminal-unreachable"
  | "terminal-has-outgoing-edge"
  | "cycle-forbidden"
  | "event-valid"
  | "idempotent-duplicate"
  | "duplicate-divergent"
  | "identity-mismatch"
  | "generation-stale"
  | "sequence-invalid"
  | "previous-digest-mismatch"
  | "budget-decreased"
  | "budget-arithmetic-invalid"
  | "decision-valid"
  | "request-expired"
  | "request-replaced"
  | "request-consumed"
  | "choice-unknown"
  | "actor-unauthorized"
  | "revision-stale"
  | "attempt-mismatch"
  | "organization-mismatch"
  | "effect-valid"
  | "emission-duplicate"
  | "emission-divergent"
  | "second-emission-for-attempt"
  | "fencing-stale"
  | "executor-unqualified"
  | "effect-state-unknown"
  | "predecessor-effects-nonterminal"
  | "generation-consumed"
  | "lineage-administratively-closed";

export function evaluateAuthorizedExecutionVector(vector: unknown): AuthorizedExecutionOutcome;
export function canonicalJson(value: unknown): string;
export async function sha256Canonical(value: unknown): Promise<string>;
```

- [ ] **Step 1: Write failing unit tests for topology**

Tests must prove one valid graph and each graph refusal code. Mutate real graph objects; do not assert mocks. Name the production change that makes each test pass: graph identity uniqueness, entry resolution, reference closure, route totality, reachability, terminal reachability and acyclicity.

- [ ] **Step 2: Run the focused test and observe RED**

```bash
bun test tools/quality/authorized-execution.test.ts
```

Expected: import or outcome assertions fail because the evaluator does not exist.

- [ ] **Step 3: Implement the minimum graph evaluator**

Use bounded `Map`/`Set` traversals. Reject malformed input before traversal, visit each step and edge at most a constant number of times, and return only the closed code. Do not log input values.

- [ ] **Step 4: Make topology GREEN**

```bash
bun test tools/quality/authorized-execution.test.ts
```

- [ ] **Step 5: Add failing causal, decision, effect and lineage tests**

Cover exact duplicate versus divergent duplicate, stale generation, sequence/digest/budget failures, stale or cross-organization decisions, one-shot emission reuse, fencing, non-terminal predecessor effects and administrative closure.

- [ ] **Step 6: Observe RED, then implement minimum evaluators**

Run the focused test before and after implementation. Use checked integer addition for budgets and equality over the complete authority identity tuple.

- [ ] **Step 7: Add canonical JSON and SHA-256 tests**

Use RFC 8785 fixtures containing reordered object keys, arrays, Unicode and safe integers. Prove object-key order does not change the digest and array order does.

- [ ] **Step 8: Add the committed vector envelope and gate**

The JSON document contains `schemaVersion: libre-ai.authorized-execution-semantic-vectors.v1`, bounded `cases`, each case's domain, input and exact expected outcome. `check-contracts.ts` must parse it as strict UTF-8 JSON, apply size/depth/count limits, reject sensitive markers and evaluate every case.

- [ ] **Step 9: Verify the checker increment**

```bash
bun test tools/quality/authorized-execution.test.ts
bun run check:contracts
```

---

### Task 4: Add graph and plan candidates test-first

**Repository:** `libre-ai/contracts`

**Files:**

- Create: `contracts/schemas/execution-graph.v1.schema.json`
- Create: `contracts/schemas/execution-plan-body.v2.schema.json`
- Modify: `contracts/fixtures/schema-fixtures.v1.json`
- Create: `contracts/fixtures/authorized-execution-v1/digest-vectors.v1.json`

**Interfaces:**

- `execution-graph.v1` fields: `schemaVersion`, `id`, `organizationId`, `entryStepId`, `steps`, `edges`, `createdAt`, `graphDigest`.
- `execution-plan-body.v2` retains v1 capability bounds and adds `executionGraph`, `lineageMode`, successor lineage, `requestedGeneration`, decision schema refs and executor-profile refs.

- [ ] **Step 1: Add positive and mutation-negative fixtures before schemas**

Add fixtures naming the two absent schemas. Negatives cover unknown fields, unbounded counts, terminal outcomes, invalid retry mode, initial/successor lineage mixing, generation zero and mismatched nullability.

- [ ] **Step 2: Run RED**

```bash
bun run check:contracts
```

Expected: both fixture cases report unknown schemas.

- [ ] **Step 3: Add strict schemas**

Use `$defs` and conditional `oneOf` branches for step kinds and initial/successor lineage. Set `additionalProperties: false` on every object and `maxItems` on every array. Reference `common.v1` for URNs, digests, timestamps and the bounded organization identifier shape.

- [ ] **Step 4: Run GREEN**

```bash
bun run check:contracts
```

- [ ] **Step 5: Add graph and plan digest vectors**

Each vector declares `digestField`, an unsigned payload and expected RFC 8785 SHA-256. Extend the canonical checker to reproduce both expected digests.

---

### Task 5: Add transfer, authorization and human-decision candidates test-first

**Repository:** `libre-ai/contracts`

**Files:**

- Create: `contracts/schemas/execution-transfer.v1.schema.json`
- Create: `contracts/schemas/execution-authorization.v2.schema.json`
- Create: `contracts/schemas/human-decision-request.v1.schema.json`
- Create: `contracts/schemas/human-decision-response.v1.schema.json`
- Modify: `contracts/fixtures/schema-fixtures.v1.json`
- Modify: `contracts/fixtures/authorized-execution-v1/digest-vectors.v1.json`

**Interfaces:** exact fields and conditional rules from design §§7–8.

- [ ] **Step 1: Add four failing fixture cases**

Negatives cover transfer generation zero, missing expected revision, successor authorization with null binding, initial authorization with a binding, fewer than two choices, more than four choices, unknown free-form choice, embedded comment text and missing idempotency key.

- [ ] **Step 2: Observe RED**

```bash
bun run check:contracts
```

- [ ] **Step 3: Add the four minimum strict schemas**

Decision choices contain only closed `choiceId`, bounded label and consequence code; response carries an optional artifact reference, never free text. Authorization v2 makes generation and successor binding conditional on `lineageMode`.

- [ ] **Step 4: Run GREEN and add four digest vectors**

```bash
bun run check:contracts
bun test tools/quality/authorized-execution.test.ts
```

---

### Task 6: Add invocation, effect and event candidates test-first

**Repository:** `libre-ai/contracts`

**Files:**

- Create: `contracts/schemas/step-invocation.v1.schema.json`
- Create: `contracts/schemas/effect-attestation.v1.schema.json`
- Create: `contracts/schemas/orchestrator-event.v3.schema.json`
- Modify: `contracts/fixtures/schema-fixtures.v1.json`
- Modify: `contracts/fixtures/authorized-execution-v1/digest-vectors.v1.json`

**Interfaces:** exact fields and conditional rules from design §§9–10.

- [ ] **Step 1: Add three failing fixture cases**

Negatives cover generation zero, missing cause digest, raw prompt/tool arguments, effect status without required fencing/idempotency evidence, unsigned attestation, event payload/identity mismatch and stable identifiers in operational diagnostics.

- [ ] **Step 2: Observe RED, add schemas, then run GREEN**

```bash
bun run check:contracts
```

- [ ] **Step 3: Complete the nine digest vectors**

Add invocation, effect attestation and event preimages. The checker rejects a digest field or signature inside an unsigned payload and reproduces all nine expected digests.

- [ ] **Step 4: Replay all semantic scenarios**

```bash
bun test tools/quality/authorized-execution.test.ts
bun run check:contracts
```

---

### Task 7: Add retention v2 candidates test-first

**Repository:** `libre-ai/contracts`

**Files:**

- Create: `contracts/schemas/retention-policy.v2.schema.json`
- Create: `contracts/data/retention.v2.json`
- Modify: `contracts/fixtures/schema-fixtures.v1.json`
- Modify: `tools/quality/check-contracts.ts`
- Modify: `tools/quality/authorized-execution.test.ts`

**Interfaces:**

- `orchestrator-execution-record`: PostgreSQL, fixed `P1Y`, maximum `P6Y`, same effective retention as the owning mission.
- `execution-deletion-tombstone`: PostgreSQL, fixed `P35D`, trigger `explicit-delete`.
- Every v1 rule remains byte-equivalent in v2.

- [ ] **Step 1: Write failing retention tests**

Tests reject a missing v1 rule, changed v1 value, missing Orchestrator rule, retention longer than mission maximum, tombstone shorter or longer than `P35D`, and restore order that applies execution state before tombstones.

- [ ] **Step 2: Observe RED**

```bash
bun test tools/quality/authorized-execution.test.ts
bun run check:contracts
```

- [ ] **Step 3: Add schema and data policy**

Copy no v1 file in place. V2 adds `agent-orchestrator` to the owner enum and exactly the two rules while preserving all v1 rules. Update the checker to compare v2's inherited rules to v1 and enforce the two exact additions.

- [ ] **Step 4: Run GREEN**

```bash
bun test tools/quality/authorized-execution.test.ts
bun run check:contracts
```

---

### Task 8: Catalog, document and freeze the candidate authority SHA

**Repository:** `libre-ai/contracts`

**Files:**

- Modify: `contracts/catalog.v1.json`
- Modify: `contracts/agent-orchestration/SEMANTICS.md`
- Modify: `contracts/README.md`
- Modify: `contracts/CATALOG.md`
- Create: `docs/reviews/authorized-execution-v1/README.md`
- Modify: `REUSE.toml` only if existing globs do not classify new paths.

**Interfaces:** all eleven catalog entries use `status: candidate`, `compatibility: major-versioned`, required reviews `architecture`, `security`, `privacy`, and the shared dossier path.

- [ ] **Step 1: Add catalog entries and pending dossier**

Owners and consumers follow the design authority map. The dossier binds the Governance `AGENT-REVIEW-PROTOCOL.md`, identifies the design and states that review verdicts are pending until an immutable authoring SHA exists.

- [ ] **Step 2: Document normative semantics and candidate status**

Extend SEMANTICS with topology, lineage, decision, effect, retention and closed-code rules. README/CATALOG must say exactly which authorities are candidates and must not claim all entries are locked.

- [ ] **Step 3: Prove locked files unchanged**

Run:

```bash
git diff --diff-filter=MD --name-only "$BASE_CONTRACTS_SHA" -- \
  contracts/schemas contracts/data contracts/openapi contracts/wit contracts/authz
```

Expected: no output. Then inspect `git diff --diff-filter=A --name-only` and
require exactly the eleven declared authority additions.

- [ ] **Step 4: Run full Contracts gates**

```bash
git add contracts tools docs REUSE.toml
git diff --cached --check
bun run check
reuse lint
```

- [ ] **Step 5: Commit immutable authoring candidate**

```bash
git commit -s -m "feat: propose authorized execution contracts"
git rev-parse HEAD
```

Record the exact SHA as `CONTRACTS_CANDIDATE_SHA`.

---

### Task 9: Generate and verify the TypeScript projection

**Repository:** `libre-ai/sdk-ts`

**Files:**

- Modify: `package.json`
- Modify: `bun.lock`
- Create through generator: ten JSON Schema files under `schemas/` as projected by Contracts.
- Create through generator: declaration files under `src/generated/`.
- Modify through generator: `src/generated/manifest.json`
- Modify: `src/registry.test.ts`

**Interfaces:** consumes `CONTRACTS_CANDIDATE_SHA`; produces byte-exact schemas and disposable TypeScript declarations.

- [ ] **Step 1: Create worktree and verify baseline**

```bash
git worktree add ../../.worktrees/sdk-ts-authorized-execution \
  -b feat/authorized-execution-contracts main
bun install --frozen-lockfile
bun run check
```

- [ ] **Step 2: Add failing candidate coverage assertion**

In `src/registry.test.ts`, assert that the registry includes all ten candidate
JSON Schema names and validates their fixtures, including the v2 retention data
fixture, from the authority package. Run the focused test and observe failure
against the old pin.

- [ ] **Step 3: Pin the exact candidate SHA and regenerate**

Update only `@libre-ai/contracts-authority`, run `bun install`, `bun run schemas:sync`, then `bun run generate`. Generated files are never hand-edited.

- [ ] **Step 4: Make projection GREEN and commit**

```bash
bun run check
reuse lint
git add package.json bun.lock schemas src
git commit -s -m "feat: project authorized execution contracts in TypeScript"
```

---

### Task 10: Generate and verify the Rust projection

**Repository:** `libre-ai/sdk-rs`

**Files:**

- Modify: `package.json`
- Modify: `bun.lock`
- Create through sync: ten JSON Schema files under `schemas/` as projected by Contracts.
- Modify: `tests/schema_fixtures.rs`
- Modify: `tests/orchestration_digest_vectors.rs`

**Interfaces:** consumes the same `CONTRACTS_CANDIDATE_SHA`; produces byte-exact embedded schemas, Typify-generated Rust types and independent digest replay.

- [ ] **Step 1: Create worktree and verify baseline**

```bash
git worktree add ../../.worktrees/sdk-rs-authorized-execution \
  -b feat/authorized-execution-contracts main
bun install --frozen-lockfile
bun run check
cargo test --locked --all-features
```

- [ ] **Step 2: Add failing candidate and nine-digest assertions**

Assert all ten candidate JSON Schema names are embedded, the v2 retention data
fixture validates, and the digest suite contains exactly the nine
execution-protocol vectors. Run the focused Rust tests and observe failure
against the old pin.

- [ ] **Step 3: Pin and synchronize**

Update only `@libre-ai/contracts-authority`, run `bun install`, then
`bun scripts/check-vendored-schemas.ts --write`. Do not hand-edit generated
Rust.

- [ ] **Step 4: Make projection GREEN and commit**

```bash
bun run check
cargo test --locked --all-features
reuse lint
git add package.json bun.lock schemas tests
git commit -s -m "feat: project authorized execution contracts in Rust"
```

---

### Task 11: Run role-separated review and remediate

**Repositories:** Governance, Contracts, SDK TypeScript, SDK Rust.

**Files:**

- Create: `docs/reviews/authorized-execution-v1/architecture.md`
- Create: `docs/reviews/authorized-execution-v1/security.md`
- Create: `docs/reviews/authorized-execution-v1/privacy.md`
- Modify: `docs/reviews/authorized-execution-v1/README.md`

**Interfaces:** each review record names the immutable Contracts, SDK TypeScript and SDK Rust SHAs and contains findings by severity plus a verdict.

- [ ] **Step 1: Architecture review-only pass**

Check all eleven candidates, authority uniqueness, v1 byte preservation, cross-language projection parity, graph determinism, successor lineage and rollback.

- [ ] **Step 2: Security review-only pass**

Challenge topology substitution, duplicate delivery, effect fencing, stale generations, cross-organization decisions, digest preimages, unsafe diagnostics and fail-open unknown states.

- [ ] **Step 3: Privacy and sovereignty review-only pass**

Challenge data minimization, operational-log exclusions, `P1Y`/`P6Y` alignment, Proof lifecycle, tombstone `P35D`, restore ordering, dependency and managed-service absence.

- [ ] **Step 4: Remediate every Blocking or Major finding**

Change the candidate, commit a new SHA, repin both SDKs and rerun every affected role. Preserve rejected historical review records; never rewrite them.

- [ ] **Step 5: Record final verdicts**

Update the dossier to list exact approved SHAs and prove the contract authority tree is unchanged since the reviewed authoring commit. Commit with:

```bash
git commit -s -m "docs: record authorized execution contract reviews"
```

---

### Task 12: Verify, publish, merge and stop at the lock gate

**Repositories:** Governance, Contracts, SDK TypeScript, SDK Rust.

- [ ] **Step 1: Run every local gate fresh**

Governance and Contracts:

```bash
bun run check
reuse lint
git diff --check
```

SDK TypeScript:

```bash
bun run check
reuse lint
git diff --check
```

SDK Rust:

```bash
bun run check
cargo test --locked --all-features
cargo deny check licenses
reuse lint
git diff --check
```

- [ ] **Step 2: Verify DCO and exact ancestry**

Every introduced commit contains an author-matching `Signed-off-by`. Record branch head SHAs and their base SHAs.

- [ ] **Step 3: Push feature branches and require green CI**

Push each explicit feature branch without force. If workflows run only for pull requests, open a PR for the branch, wait for every required check and use the PR solely as the check surface.

- [ ] **Step 4: Merge in authority order**

Merge Governance first, Contracts second, SDK TypeScript and SDK Rust only after Contracts main contains their pinned SHA. Use signed merge commits where fast-forward is unavailable. Never alter the user's active checkout.

- [ ] **Step 5: Verify post-merge remote SHAs and checks**

For each repository, compare `git ls-remote origin refs/heads/main` to the merged local SHA and enumerate every completed required check. Any red check reopens the task.

- [ ] **Step 6: Clean up feature worktrees and branches**

Only after post-merge green proof, remove the four task worktrees, delete fully merged local feature branches and prune worktree metadata. Preserve all unrelated worktrees and untracked files.

- [ ] **Step 7: Stop at the Specification Lock gate**

Report the eleven candidates as merged but not locked. Restitute exact SHAs, role verdicts, tests and remaining owner decision. Do not infer promotion from the present `go all`.

#### Post-merge DCO evidence

Governance PR #99 merged as `9651c07931199490c144eff730095f03282b90a2`.
Its content and context gates passed, but the push-only DCO gate rejected the
forge-generated merge commit because GitHub cannot add the maintainer's
`Signed-off-by` trailer. The corrective commit carrying this record is signed
and must be rebased onto `main`; subsequent repositories must use rebase or an
explicitly signed local merge commit so the same failure cannot recur.
