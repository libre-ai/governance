# Authorized Execution Native Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the locked authorized-execution semantics executable as a deterministic, effect-free Rust core in `libre-ai/orchestrator`, with independent vector replay and crash-recovery proofs but no runtime capability.

**Architecture:** Extend the existing `libre-ai-agent-orchestrator` crate with focused `authorized_execution` modules. Every wire document crosses the pinned SDK Rust `ContractRegistry` before private typed normalization; pure evaluators consume explicit observations and return closed decisions or proposed applications, while integration tests adapt the pinned 54-case Contracts vector corpus and a fake harness exercises five crash cut points. Governance first opens the bounded package; persistence, clocks, logging, real executors, LangGraph and all external effects remain outside the crate.

**Tech Stack:** Rust 1.97 / edition 2024, `serde_json`, `serde_jcs`, `sha2`, pinned `libre-ai-contract-types`, Bun 1.4 gates, JSON Schema Draft 2020-12, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-10-authorized-execution-native-core-design.md`

## Global Constraints

- Decision order is Security, Quality, Performance, Completeness.
- Production source remains pure and effect-free: no process, filesystem, network, environment, thread, clock, secret, store, telemetry or provider capability under `src/`.
- Add no third-party dependency; the only authority movements are SDK Rust commit `ac9f2020425733183839a58fc2c3928a4de5c066` and Contracts commit `5b9b6668909119b670e0db62174419ab04e5b402`.
- Contracts owns wire schemas, semantic outcomes and fixtures; SDK Rust is a disposable projection; Orchestrator must not redefine or serialize a competing wire contract.
- Validate every production wire document through `ContractRegistry` before private normalization. Untrusted values and raw validation errors never enter public errors, `Display`, `Debug`, logs or evidence.
- Canonical refusal precedence must match the exact pinned 54-case corpus: graph 11, causal 9, decision 11, effect 11, authority 4, transfer 8.
- Evaluation time and all store, lineage, idempotency, fencing and executor facts are explicit inputs. Missing facts refuse closed.
- Preserve all existing control and budget APIs and behavior. The additive public API requires crate version `0.2.0`, compatibility journal and exhaustive public-symbol/code snapshots.
- Use strict red-green-refactor for every non-trivial evaluator. Test expectations are literal; tests must not call a TypeScript oracle or derive expected outcomes through production helpers.
- The fake harness and fake executor exist only under `tests/support/`, implement no production trait and never gain a real capability.
- Phase 4A authorizes no PostgreSQL, Redis, RLS, Biscuit parsing, real Harness or Missions integration, external effect, operational logging, retention/deletion/restore, parallelism, subgraph, cycle, dynamic replanning or LangGraph/LangChain/LangSmith dependency.
- Commit messages are English, descriptive and signed off; no `Co-Authored-By: Codex` trailer.
- Git author, committer and sign-off must use the owner-approved personal Libre AI identity supplied out of band as `LIBRE_AI_GIT_EMAIL`; never commit or copy that address into documentation, tests, logs or review evidence, and never fall back to a professional identity.
- Nothing merges until local gates, role-separated review and feature-branch CI are green; verify the immutable post-merge SHA and then stop.

---

## Repository and file map

### Governance repository

- Create `docs/adr/0037-authorized-execution-native-core.md`: owner-ratified authority and explicit non-authorities for Phase 4A.
- Modify `docs/decisions/DECISION-REGISTER.md`: append D43 without reinterpreting D42.
- Modify `docs/transformation/work-packages.v1.json`: add `WP-G3-O02`, separate from `WP-G3-O01`.
- Modify `docs/adr/0036-authorized-execution-specification-lock.md`: record that ADR-0037 extends the lock without weakening it.
- Modify `docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md`: mark only native-core Phase 4A as opened.
- Modify `docs/superpowers/specs/2026-09-10-authorized-execution-native-core-design.md`: move status from design approval to implementation authority after ratification.
- Create `tools/quality/check-authorized-execution-native-core-authority.test.ts`: structural gate for ADR-0037, D43 and the exact bounded work package.

### Orchestrator repository

- Modify `Cargo.toml`, `Cargo.lock`, `package.json`, `bun.lock`: exact authority pins, `0.2.0` version and dependency-free benchmark target.
- Create `tools/quality/authorized-execution-authority.test.ts`: direct checkout-level pin, lock, hash and vector-inventory gate that cannot pass through a stale Cargo cache.
- Create `src/authorized_execution/mod.rs`: public exports and shared closed outcome/application types.
- Create `src/authorized_execution/document.rs`: schema validation and private wire-to-domain normalization.
- Create `src/authorized_execution/graph.rs`: graph shape, closed routing and graph/plan authority.
- Create `src/authorized_execution/replay.rs`: causal transition validation and deterministic state reducer.
- Create `src/authorized_execution/decision.rs`: human-decision replay, role, revision and expiry rules.
- Create `src/authorized_execution/transfer.rs`: one-shot generation transfer rules.
- Create `src/authorized_execution/effect.rs`: one-shot emission, fencing and continuity barrier rules.
- Modify `src/lib.rs`: export the coherent authorized-execution surface only.
- Create `tests/support/mod.rs` and `tests/support/authorized_execution.rs`: synthetic valid fixture builders, reduced-vector adapters and deterministic test-only projection.
- Create `tests/authorized_execution_graph.rs`, `tests/authorized_execution_replay.rs`, `tests/authorized_execution_decision.rs`, `tests/authorized_execution_transfer.rs`, `tests/authorized_execution_effect.rs`: focused TDD suites.
- Create `tests/authorized_execution_vectors.rs`: independent execution of every pinned semantic vector.
- Create `tests/authorized_execution_crash_e2e.rs`: complete run plus the five fake-harness crash cut points.
- Create `benches/authorized_execution_replay.rs`: maximum graph, route and replay measurement using `std` only.
- Modify `tests/compat/public_surface.snapshot`, `tests/compat/stable_codes.snapshot`, `tests/compat_surface.rs`, `docs/compat/BREAKS.md`: versioned compatibility proof.
- Modify `README.md`, `docs/apps/orchestrator.md`, `project.v1.yaml`: API example, bounded claims, residual risks and rollback.
- Create `docs/reviews/authorized-execution-native-core/$REVIEW_SHA/...`: immutable benchmark, architecture, security, privacy and integration evidence under the seven-character reviewed implementation SHA computed during Task 11.

## Locked public interfaces

The implementation may add private helpers but must keep these names and meanings stable within the branch. Domain structs are intentionally not `Serialize` or `Deserialize`.

```rust
pub enum AuthorizedExecutionRefusal {
    SchemaInvalid,
    StoreUnavailable,
    TransitionForbidden,
    BudgetExceeded,
    ArithmeticOverflow,
}

pub fn parse_authorized_graph(
    registry: &ContractRegistry,
    document: &Value,
) -> Result<AuthorizedGraph, AuthorizedExecutionRefusal>;

pub fn parse_authorized_execution_event(
    registry: &ContractRegistry,
    document: &Value,
) -> Result<AuthorizedExecutionEvent, AuthorizedExecutionRefusal>;

pub fn evaluate_graph(graph: &AuthorizedGraph) -> GraphDecision;

pub fn select_graph_transition(
    graph: &AuthorizedGraph,
    current_step_id: &str,
    outcome_code: &str,
) -> GraphTransitionDecision;

pub fn evaluate_graph_authority(
    graph: &AuthorizedGraph,
    plan_document: &Value,
    registry: &ContractRegistry,
) -> AuthorityDecision;

pub fn evaluate_causal_transition(
    previous: Option<&AuthorizedExecutionEvent>,
    current: &AuthorizedExecutionEvent,
    collision: EventCollisionObservation<'_>,
) -> CausalDecision;

pub fn replay_authorized_execution(
    graph: &AuthorizedGraph,
    events: &[AuthorizedExecutionEvent],
) -> Result<AuthorizedExecutionState, AuthorizedExecutionRefusal>;

pub fn evaluate_human_decision(
    registry: &ContractRegistry,
    request_document: &Value,
    response_document: &Value,
    observation: DecisionObservation<'_>,
    evaluation_time: &str,
) -> DecisionDecision;

pub fn evaluate_execution_transfer(
    registry: &ContractRegistry,
    transfer_document: &Value,
    observation: TransferObservation<'_>,
    evaluation_time: &str,
) -> TransferDecision;

pub fn evaluate_effect_attestation(
    registry: &ContractRegistry,
    attestation_document: &Value,
    observation: EffectObservation<'_>,
) -> EffectDecision;
```

All public decision enums expose `pub const fn code(&self) -> &'static str`. Canonical outcomes use the locked kebab-case values. Internal boundary failures use only:

```text
orchestrator.authorized-execution.schema-invalid
orchestrator.authorized-execution.store-unavailable
orchestrator.authorized-execution.transition-forbidden
orchestrator.authorized-execution.budget-exceeded
orchestrator.authorized-execution.arithmetic-overflow
```

Observation APIs carry raw authoritative facts, never a caller-classified verdict. The core itself compares identities and digests:

```rust
pub enum Authoritative<T> {
    Unavailable,
    Available(T),
}

pub enum EventCollisionObservation<'a> {
    Unavailable,
    Absent,
    Existing {
        event_id: &'a str,
        sequence: u64,
        event_digest: &'a str,
    },
}

pub struct PriorDecisionResponseObservation<'a> {
    pub response_id: &'a str,
    pub response_digest: &'a str,
}

pub struct DecisionObservation<'a> {
    pub prior_response: Authoritative<Option<PriorDecisionResponseObservation<'a>>>,
    pub request_replaced: Authoritative<bool>,
    pub request_consumed: Authoritative<bool>,
    pub authoritative_revision: Authoritative<u64>,
    pub actor_roles: Authoritative<&'a [&'a str]>,
}

pub struct PriorTransferObservation<'a> {
    pub transfer_id: &'a str,
    pub current_generation: u64,
    pub transfer_digest: &'a str,
}

pub struct TransferLineageObservation<'a> {
    pub organization_id: &'a str,
    pub mission_id: &'a str,
    pub predecessor_run_id: &'a str,
    pub predecessor_plan_digest: &'a str,
    pub current_generation: u64,
    pub generation_consumed: bool,
    pub revision: u64,
    pub successor_plan_digest: &'a str,
}

pub struct TransferObservation<'a> {
    pub prior_transfer: Authoritative<Option<PriorTransferObservation<'a>>>,
    pub lineage: Authoritative<TransferLineageObservation<'a>>,
}

pub struct PriorEmissionObservation<'a> {
    pub effect_emission_id: &'a str,
    pub emission_digest: &'a str,
}

pub struct EffectLineageObservation<'a> {
    pub organization_id: &'a str,
    pub run_id: &'a str,
    pub attempt_id: &'a str,
    pub current_generation: u64,
    pub generation_consumed: bool,
    pub lineage_administratively_closed: bool,
    pub active_fencing: u64,
    pub executor_profile_qualified: bool,
}

pub struct EffectObservation<'a> {
    pub lineage: Authoritative<EffectLineageObservation<'a>>,
    pub prior_emission: Authoritative<Option<PriorEmissionObservation<'a>>>,
    pub existing_attempt_emission_id: Authoritative<Option<&'a str>>,
    pub predecessor_effects_terminal: Authoritative<bool>,
}
```

Constructors validate invariants that Rust types alone do not express. Decision and application fields remain private and expose only constant `code()`, boolean state predicates and read-only application getters. No public constructor accepts a precomputed `Exact`, `Divergent`, `Valid`, `Qualified` or `Authorized` verdict.

The decision shapes are exhaustive and domain-specific:

```rust
pub enum GraphDecision {
    Valid,
    Refused(GraphRefusal),
}

pub enum GraphTransitionDecision {
    Selected(GraphTransition),
    Refused(GraphRefusal),
}

pub enum AuthorityDecision {
    Valid,
    Refused(AuthorityRefusal),
    BoundaryRefused(AuthorizedExecutionRefusal),
}

pub enum CausalDecision {
    Valid,
    Idempotent,
    Refused(CausalRefusal),
    BoundaryRefused(AuthorizedExecutionRefusal),
}

pub enum DecisionDecision {
    Accepted(DecisionApplication),
    Idempotent,
    Refused(DecisionRefusal),
    BoundaryRefused(AuthorizedExecutionRefusal),
}

pub enum TransferDecision {
    Accepted(TransferApplication),
    Idempotent,
    Refused(TransferRefusal),
    BoundaryRefused(AuthorizedExecutionRefusal),
}

pub enum EffectDecision {
    Accepted(EffectApplication),
    Idempotent,
    ContinuityBarrier,
    Refused(EffectRefusal),
    BoundaryRefused(AuthorizedExecutionRefusal),
}
```

`GraphRefusal`, `AuthorityRefusal`, `CausalRefusal`, `DecisionRefusal`, `TransferRefusal` and `EffectRefusal` have one variant per canonical outcome named in their task. `GraphTransition` exposes `target_step_id()`. `DecisionApplication` exposes request digest, selected outcome and expected revision; `TransferApplication` exposes expected seal revision and successor generation; `EffectApplication` exposes attested terminal state and expected one-shot identity. Types that hold any wire-derived string implement a redacted `Debug` manually; they never derive `Debug`. Their debug output contains only the type name, constant decision code and non-sensitive collection counts. `Display` exists only for closed code enums.

---

### Task 1: Ratify the bounded Phase 4A authority in Governance

**Files:**
- Create: `docs/adr/0037-authorized-execution-native-core.md`
- Modify: `docs/decisions/DECISION-REGISTER.md`
- Modify: `docs/transformation/work-packages.v1.json`
- Modify: `docs/adr/0036-authorized-execution-specification-lock.md`
- Modify: `docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md`
- Modify: `docs/superpowers/specs/2026-09-10-authorized-execution-native-core-design.md`
- Create: `tools/quality/check-authorized-execution-native-core-authority.test.ts`

**Interfaces:**
- Consumes: ADR-0032 D38, ADR-0034 D40, ADR-0036 D42 and owner approval of the design dated 2026-09-10.
- Produces: `ADR-0037`, `D43` and locked `WP-G3-O02` as the sole authorization for Orchestrator Task 2 onward.

- [ ] **Step 0: Bind and verify the session-only Git identity**

The coordinator supplies `LIBRE_AI_GIT_EMAIL` from the owner-approved personal session context without printing it. In each Libre AI repository used by this plan:

```bash
test -n "$LIBRE_AI_GIT_EMAIL"
git config --local user.name "Constantin Jais"
git config --local user.email "$LIBRE_AI_GIT_EMAIL"
test "$(git config --get user.email)" = "$LIBRE_AI_GIT_EMAIL"
```

Before every push, verify the branch commits use the configured personal identity for author, committer and `Signed-off-by`. Stop if any commit uses another identity; repair unpublished local metadata before publishing. Do not record either address or the comparison output in repository evidence.

The coordinator also supplies two non-sensitive, machine-local session roots without committing them: `LIBRE_AI_REPOSITORY_ROOT` contains the checked-out Libre AI repositories and `LIBRE_AI_WORKTREE_ROOT` receives isolated worktrees. Verify both directories exist before using them. All commands below derive repository and worktree locations from these inputs so the plan carries no private machine path.

- [ ] **Step 1: Add a failing Governance integrity test for the new authority**

Create `tools/quality/check-authorized-execution-native-core-authority.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

interface WorkPackage {
  readonly id: string;
  readonly dependsOn: readonly string[];
  readonly definitionStatus: string;
  readonly writePaths: readonly string[];
  readonly acceptance: readonly string[];
}

interface WorkPackagePlan {
  readonly packages: readonly WorkPackage[];
}

const expectedWritePaths = [
  "src/authorized_execution/**",
  "tests/authorized_execution_*.rs",
  "tests/support/**",
  "benches/authorized_execution_replay.rs",
  "Cargo.toml",
  "Cargo.lock",
  "package.json",
  "bun.lock",
  "README.md",
  "docs/apps/orchestrator.md",
  "docs/compat/**",
  "docs/reviews/authorized-execution-native-core/**",
  "project.v1.yaml",
  "tools/quality/authorized-execution-authority.test.ts",
  "tests/compat_surface.rs",
  "tests/compat/**",
  "src/lib.rs",
] as const;

describe("authorized execution native-core authority", () => {
  test("binds ADR-0037, D43 and the bounded work package", async () => {
    const [adrExists, decisionRegister, plan] = await Promise.all([
      Bun.file("docs/adr/0037-authorized-execution-native-core.md").exists(),
      Bun.file("docs/decisions/DECISION-REGISTER.md").text(),
      Bun.file("docs/transformation/work-packages.v1.json").json() as Promise<WorkPackagePlan>,
    ]);
    const workPackage = plan.packages.find((entry) => entry.id === "WP-G3-O02");

    expect(adrExists).toBeTrue();
    expect(decisionRegister).toContain(
      "| D43 | The native authorized-execution core is pure and non-normative",
    );
    expect(workPackage?.definitionStatus).toBe("locked");
    expect(workPackage?.dependsOn).toEqual(["WP-G2-C01"]);
    expect(workPackage?.writePaths).toEqual(expectedWritePaths);
    expect(workPackage?.acceptance).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run the focused gate and verify RED**

Run:

```bash
bun test tools/quality/check-authorized-execution-native-core-authority.test.ts
```

Expected: FAIL because ADR-0037, D43 and `WP-G3-O02` do not exist.

- [ ] **Step 3: Write ADR-0037 with the exact decision boundaries**

The ADR must contain these normative decisions, expressed as complete prose rather than links alone:

```markdown
# ADR-0037 — Native authorized-execution core

- **Status:** accepted — owner arbitration 2026-09-10
- **Extends:** ADR-0032 D38, ADR-0034 D40 and ADR-0036 D42
- **Authorizes:** `WP-G3-O02` in the pure `libre-ai-agent-orchestrator` crate
- **Does not authorize:** persistence, clocks, logs, secrets, network, processes,
  real Harness/Missions integration, real effects, deployment or a framework dependency

## Decision

1. Orchestrator independently executes the locked semantics after strict SDK
   validation; Contracts remains the sole wire and outcome authority.
2. The core receives time and authoritative observations explicitly, proposes
   applications but performs no I/O, and refuses closed when an observation is absent.
3. Acceptance requires all 54 pinned semantic vectors, deterministic replay,
   bounded graph/routing tests, five fake-harness crash cut points, capability
   gates, a reproducible benchmark and immutable role-separated review evidence.
4. `state-unknown` is a continuity barrier: it can never authorize blind re-emission.
5. `WP-G3-O01` remains the separate run boundary. Phase 4A proves no storage
   serialization, real executor idempotency/fencing, runtime log minimization,
   retention, deletion or restore claim.
6. LangGraph remains a removable, non-normative oracle; it is neither dependency,
   checkpoint store, transition authority nor specification.
```

Include sections for context/payoff, security and privacy, performance, compatibility, rollback, rejected alternatives and acceptance. Name the two rejected architectures: a second pure crate (split authority without a boundary) and an immediate run-boundary implementation (conflated proofs).

- [ ] **Step 4: Add D43 and `WP-G3-O02`**

Append one D43 row whose consequence reproduces the six ADR decisions above. Add this package immediately after `WP-G3-O01`:

```json
{
  "id": "WP-G3-O02",
  "phase": "G3",
  "name": "Orchestrator native authorized-execution core",
  "objective": "Execute the locked graph, causal replay, human-decision, generation-transfer and effect-attestation semantics as deterministic pure Rust decisions without opening a runtime capability.",
  "owners": ["platform", "security"],
  "integrator": "platform",
  "writePaths": [
    "src/authorized_execution/**",
    "tests/authorized_execution_*.rs",
    "tests/support/**",
    "benches/authorized_execution_replay.rs",
    "Cargo.toml",
    "Cargo.lock",
    "package.json",
    "bun.lock",
    "README.md",
    "docs/apps/orchestrator.md",
    "docs/compat/**",
    "docs/reviews/authorized-execution-native-core/**",
    "project.v1.yaml",
    "tools/quality/authorized-execution-authority.test.ts",
    "tests/compat_surface.rs",
    "tests/compat/**",
    "src/lib.rs"
  ],
  "readAuthorities": [
    "docs/adr/0032-langgraph-pattern-mining-boundary.md",
    "docs/adr/0034-authorized-execution-graph-boundary.md",
    "docs/adr/0036-authorized-execution-specification-lock.md",
    "contracts/fixtures/authorized-execution-v1/semantic-vectors.v1.json",
    "contracts/fixtures/schema-fixtures.v1.json"
  ],
  "dependsOn": ["WP-G2-C01"],
  "parallelGroup": "g3-1",
  "risk": "critical",
  "humanGates": ["authorized-execution-native-core-security-merge"],
  "acceptance": [
    "The exact SDK Rust and Contracts lock-authority commits are pinned and verified directly from the checkout.",
    "All 54 locked semantic vectors execute independently in Rust with their literal outcomes and exact domain inventory.",
    "Replay is deterministic, routing is closed and declaration-order independent, budgets are monotone, and unavailable observations refuse closed.",
    "Five fake-harness crash cut points prove no blind retry, no false success and at most one fake external commit.",
    "The source capability gate proves no I/O, clock, secret, persistence, provider or framework capability entered the crate.",
    "Rust tests, clippy, benchmark, Bun gates, license/reuse gates, role-separated review and feature/post-merge CI are green."
  ],
  "definitionStatus": "locked"
}
```

- [ ] **Step 5: Reconcile the existing authorities**

Add `Extended by ADR-0037` to ADR-0036 without altering D1–D4. In the LangGraph design Phase 4 section, state that only Phase 4A pure-core work is opened and list the four unproven runtime claims. Change the approved design status to:

```markdown
- **Status:** approved for implementation — owner, 2026-09-10; authority ADR-0037/D43
```

- [ ] **Step 6: Run the focused gate and full Governance gate**

Run:

```bash
bun test tools/quality/check-authorized-execution-native-core-authority.test.ts
bun run check
```

Expected: both commands PASS, with zero failed tests and zero warnings.

- [ ] **Step 7: Commit the ratification**

```bash
git add docs/adr/0037-authorized-execution-native-core.md docs/adr/0036-authorized-execution-specification-lock.md docs/decisions/DECISION-REGISTER.md docs/transformation/work-packages.v1.json docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md docs/superpowers/specs/2026-09-10-authorized-execution-native-core-design.md tools/quality/check-authorized-execution-native-core-authority.test.ts
git commit -s -m "docs: authorize native execution core"
```

Expected: a signed commit containing only Governance authority and its direct test.

- [ ] **Step 8: Review the immutable Governance branch**

Run the `review` skill against the exact Governance HEAD. Verify, in the four mandatory axes, that the work package cannot authorize I/O or real effects, that D43 reproduces ADR-0037 without widening it, that `WP-G3-O01` remains separate, that no PII or session identity entered tracked files, and that the red/green authority test plus full gate are reproducible. Any Blocking or Major finding returns to Step 1 with a regression test where applicable.

- [ ] **Step 9: Publish and merge Governance before implementation**

First verify the authenticated GitHub account owns the personal Libre AI identity approved for the session. Push the Governance branch, open its PR, review base/head and exact changed paths, then wait for all required checks:

```bash
git push -u origin docs/authorized-execution-native-core-design
gh pr create --fill
GOVERNANCE_PR_NUMBER=$(gh pr view --json number --jq .number)
gh pr checks "$GOVERNANCE_PR_NUMBER" --watch
```

Merge without force only when review and CI are green. Fetch and verify the exact Governance `origin/main` merge SHA. Orchestrator Task 2 is blocked until that SHA contains ADR-0037, D43 and `WP-G3-O02` and its post-merge checks are green.

---

### Task 2: Pin immutable authorities and create the Orchestrator worktree gate

**Files:**
- Modify: `Cargo.toml`
- Modify: `Cargo.lock`
- Modify: `package.json`
- Modify: `bun.lock`
- Create: `tools/quality/authorized-execution-authority.test.ts`

**Interfaces:**
- Consumes: accepted Governance ADR-0037/D43/WP-G3-O02, SDK Rust `ac9f2020425733183839a58fc2c3928a4de5c066`, Contracts `5b9b6668909119b670e0db62174419ab04e5b402`.
- Produces: checkout-level proof that subsequent Rust tests consume the reviewed lock rather than stale dependency bytes.

- [ ] **Step 1: Create an isolated Orchestrator worktree and prove its baseline**

From the session workspace:

```bash
test -d "$LIBRE_AI_REPOSITORY_ROOT/orchestrator/.git"
test -d "$LIBRE_AI_WORKTREE_ROOT"
ORCHESTRATOR_REPO="$LIBRE_AI_REPOSITORY_ROOT/orchestrator"
ORCHESTRATOR_WORKTREE="$LIBRE_AI_WORKTREE_ROOT/orchestrator-authorized-execution-native-core"
git -C "$ORCHESTRATOR_REPO" fetch origin
git -C "$ORCHESTRATOR_REPO" worktree add "$ORCHESTRATOR_WORKTREE" -b feat/authorized-execution-native-core origin/main
```

Then run in the new worktree:

```bash
test -n "$LIBRE_AI_GIT_EMAIL"
git config --local user.name "Constantin Jais"
git config --local user.email "$LIBRE_AI_GIT_EMAIL"
test "$(git config --get user.email)" = "$LIBRE_AI_GIT_EMAIL"
bun install --frozen-lockfile
bun run check
cargo test --locked --all-features
cargo clippy --locked --all-targets --all-features -- -D warnings
```

Expected: the unchanged baseline is green. If not, stop and record the pre-existing failure; do not mix a baseline repair into Phase 4A.

- [ ] **Step 2: Write the failing direct-authority test**

Create `tools/quality/authorized-execution-authority.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

const sdkRevision = "ac9f2020425733183839a58fc2c3928a4de5c066";
const contractsRevision = "5b9b6668909119b670e0db62174419ab04e5b402";
const vectorHash = "d3a63edb3f146abe9061a3af0a9ae1bbb2d8d66f3d67fa34bbf7e859c0d0447e";
const expectedDomains = new Map([
  ["graph", 11],
  ["causal", 9],
  ["decision", 11],
  ["effect", 11],
  ["authority", 4],
  ["transfer", 8],
]);

async function sha256(path: string): Promise<string> {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(await Bun.file(path).bytes());
  return hasher.digest("hex");
}

describe("authorized execution authority", () => {
  test("pins the reviewed SDK and Contracts commits", async () => {
    const cargo = await Bun.file("Cargo.toml").text();
    const packageManifest = await Bun.file("package.json").json();
    expect(cargo).toContain(`rev = "${sdkRevision}"`);
    expect(packageManifest.devDependencies["@libre-ai/contracts-authority"]).toBe(
      `github:libre-ai/contracts#${contractsRevision}`,
    );
  });

  test("reads the exact locked vector authority from the checkout", async () => {
    const root = "node_modules/@libre-ai/contracts-authority";
    const vectorsPath = `${root}/contracts/fixtures/authorized-execution-v1/semantic-vectors.v1.json`;
    const catalog = await Bun.file(`${root}/contracts/catalog.v1.json`).json();
    const vectors = await Bun.file(vectorsPath).json();
    const counts = new Map<string, number>();
    for (const vector of vectors.cases) {
      counts.set(vector.domain, (counts.get(vector.domain) ?? 0) + 1);
    }
    expect(vectors.schemaVersion).toBe("libre-ai.authorized-execution-semantic-vectors.v1");
    expect(vectors.cases).toHaveLength(54);
    expect(counts).toEqual(expectedDomains);
    expect(await sha256(vectorsPath)).toBe(vectorHash);
    for (const id of [
      "effect-attestation-v1",
      "execution-authorization-v2",
      "execution-graph-v1",
      "execution-plan-body-v2",
      "execution-transfer-v1",
      "human-decision-request-v1",
      "human-decision-response-v1",
      "orchestrator-event-v3",
      "retention-policy-schema-v2",
      "retention-policy-v2",
      "step-invocation-v1",
    ]) {
      expect(catalog.contracts.find((entry: { id: string }) => entry.id === id)?.status).toBe(
        "locked",
      );
    }
  });
});
```

- [ ] **Step 3: Wire the test and verify RED**

Add this script and put it immediately after `check:specifications` in `check`:

```json
"check:authorized-execution-authority": "bun run check:bun:runtime && bun test tools/quality/authorized-execution-authority.test.ts"
```

Run:

```bash
bun test tools/quality/authorized-execution-authority.test.ts
```

Expected: FAIL on the old SDK and Contracts revisions.

- [ ] **Step 4: Move only the two authority pins**

Set `Cargo.toml` to:

```toml
libre-ai-contract-types = { version = "=0.1.0", git = "https://github.com/libre-ai/sdk-rs", rev = "ac9f2020425733183839a58fc2c3928a4de5c066" }
```

Set `package.json` to:

```json
"@libre-ai/contracts-authority": "github:libre-ai/contracts#5b9b6668909119b670e0db62174419ab04e5b402"
```

Refresh locks only through:

```bash
cargo update -p libre-ai-contract-types --precise ac9f2020425733183839a58fc2c3928a4de5c066
bun install
```

- [ ] **Step 5: Verify GREEN and commit**

Run:

```bash
bun test tools/quality/authorized-execution-authority.test.ts
cargo test --locked --all-features
bun run check
```

Expected: all PASS; the gate reports exactly 54 vectors and no unrelated candidate is treated as locked.

```bash
git add Cargo.toml Cargo.lock package.json bun.lock tools/quality/authorized-execution-authority.test.ts
git commit -s -m "build: pin authorized execution authorities"
```

---

### Task 3: Add the validated document boundary and graph authority

**Files:**
- Create: `src/authorized_execution/mod.rs`
- Create: `src/authorized_execution/document.rs`
- Create: `src/authorized_execution/graph.rs`
- Modify: `src/lib.rs`
- Create: `tests/support/mod.rs`
- Create: `tests/support/authorized_execution.rs`
- Create: `tests/authorized_execution_graph.rs`

**Interfaces:**
- Consumes: `ContractRegistry::is_valid(schema_name, value)` and locked execution-graph/plan schemas.
- Produces: `AuthorizedGraph`, `GraphDecision`, `GraphTransitionDecision`, `AuthorityDecision`, `parse_authorized_graph`, `evaluate_graph`, `select_graph_transition`, `evaluate_graph_authority`, plus test-only fixture construction.

- [ ] **Step 1: Write RED boundary and graph-precedence tests**

Create `tests/authorized_execution_graph.rs` with tests that assert:

```rust
#[test]
fn rejected_wire_value_never_enters_the_error() {
    let registry = ContractRegistry::embedded().expect("embedded registry");
    let secret = "synthetic-private-prompt";
    let error = parse_authorized_graph(&registry, &json!({ "secret": secret }))
        .expect_err("invalid graph must close");
    assert_eq!(error.code(), "orchestrator.authorized-execution.schema-invalid");
    assert!(!format!("{error:?}").contains(secret));
    assert!(!error.to_string().contains(secret));
}

#[test]
fn duplicate_step_precedes_all_later_graph_refusals() {
    let registry = ContractRegistry::embedded().expect("embedded registry");
    let document = synthetic_graph_document(
        "missing",
        &[("a", "calculation", &["ok"]), ("a", "terminal", &[])],
        &[],
    );
    let graph = parse_authorized_graph(&registry, &document).expect("schema-valid graph facts");
    assert_eq!(evaluate_graph(&graph).code(), "duplicate-step");
}

#[test]
fn route_selection_is_closed_and_order_independent() {
    let first = valid_branching_graph(false);
    let reversed = valid_branching_graph(true);
    assert_eq!(select_graph_transition(&first, "a", "ok").target_step_id(), Some("z"));
    assert_eq!(
        select_graph_transition(&first, "a", "ok"),
        select_graph_transition(&reversed, "a", "ok"),
    );
    assert_eq!(select_graph_transition(&first, "a", "unknown").code(), "route-missing");
}
```

The support module reads `node_modules/@libre-ai/contracts-authority/contracts/fixtures/schema-fixtures.v1.json` at test runtime with `std::fs`, selects the full valid graph and plan documents, and mutates copies for negative cases. It must never be imported from `src/`.

- [ ] **Step 2: Run the focused test and verify RED**

```bash
cargo test --locked --test authorized_execution_graph
```

Expected: compile failure because the module and public functions do not exist.

- [ ] **Step 3: Implement closed boundary types**

In `document.rs`, create private helpers with this behavior:

```rust
fn require_valid(
    registry: &ContractRegistry,
    schema_name: &'static str,
    value: &Value,
) -> Result<(), AuthorizedExecutionRefusal> {
    match registry.is_valid(schema_name, value) {
        Ok(true) => Ok(()),
        Ok(false) | Err(_) => Err(AuthorizedExecutionRefusal::SchemaInvalid),
    }
}
```

Normalize strings and integers only after schema validation. Do not retain the source `Value` or any registry issue. Define graph facts with owned `String`, `Vec<AuthorizedStep>` and `Vec<AuthorizedEdge>`; derive `Clone`, `Eq`, `PartialEq` and implement a manual redacted `Debug` that exposes counts but no identifiers or outcomes.

In `mod.rs`, implement `Display` through `code()` only:

```rust
impl Display for AuthorizedExecutionRefusal {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.code())
    }
}
```

- [ ] **Step 4: Implement graph evaluation in locked precedence**

Use `BTreeMap`/`BTreeSet` and checked traversal. The exact graph order is:

```text
duplicate-step
duplicate-edge
entry-missing
dangling-edge
terminal-has-outgoing-edge
route-missing
route-ambiguous
terminal-unreachable
unreachable-step
cycle-forbidden
graph-valid
```

`select_graph_transition` filters on the explicit pair `(from_step_id, outcome_code)` and returns exactly one target or a closed `route-missing`/`route-ambiguous`. Never choose the first edge.

`evaluate_graph_authority` first calls `evaluate_graph`, then validates the plan and checks, in order: retry policy references, human-choice uniqueness/outcome/schema references, executor-profile references, graph/plan identity. Its four vectors resolve to the exact closed inventory `authority-valid`, `graph-policy-invalid` and `authority-binding-mismatch`; schema failures use the internal closed family.

- [ ] **Step 5: Complete graph matrix and bounded exhaustive tests**

Add one literal assertion for each of the eleven graph outcomes and four authority outcomes. Enumerate every directed graph over up to four synthetic nodes, discard graphs above the contract edge bound, and assert accepted graphs have one route per declared outcome and route decisions remain identical after reversing declaration order. Add a 256-step/512-edge positive fixture.

- [ ] **Step 6: Run focused tests, capability gate and commit**

```bash
cargo fmt --all -- --check
cargo test --locked --test authorized_execution_graph
bun run check:capabilities
cargo clippy --locked --all-targets --all-features -- -D warnings
```

Expected: all PASS; capability scan finds no new forbidden token in `src/`.

```bash
git add src/authorized_execution src/lib.rs tests/support tests/authorized_execution_graph.rs
git commit -s -m "feat: validate authorized execution graphs"
```

---

### Task 4: Implement causal validation and deterministic replay

**Files:**
- Create: `src/authorized_execution/replay.rs`
- Modify: `src/authorized_execution/document.rs`
- Modify: `src/authorized_execution/mod.rs`
- Create: `tests/authorized_execution_replay.rs`
- Modify: `tests/support/authorized_execution.rs`

**Interfaces:**
- Consumes: validated `AuthorizedGraph`, `select_graph_transition`, canonical `orchestrator-event.v3` documents.
- Produces: `AuthorizedExecutionEvent`, `EventCollisionObservation`, `CausalDecision`, `AuthorizedExecutionState`, `parse_authorized_execution_event`, `evaluate_causal_transition`, `replay_authorized_execution`.

- [ ] **Step 1: Write RED causal tests**

Add focused assertions for exact replay, divergent collision, sequence gap, predecessor digest, identity mismatch, generation mismatch and checked budget arithmetic:

```rust
#[test]
fn exact_collision_is_idempotent_but_divergent_collision_quarantines() {
    let event = valid_event(1, None, 0, 10);
    assert_eq!(
        evaluate_causal_transition(
            None,
            &event,
            EventCollisionObservation::Existing {
                event_id: event.id(),
                sequence: event.sequence(),
                event_digest: event.digest(),
            },
        )
        .code(),
        "idempotent-duplicate",
    );
    assert_eq!(
        evaluate_causal_transition(
            None,
            &event,
            EventCollisionObservation::Existing {
                event_id: event.id(),
                sequence: event.sequence(),
                event_digest: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            },
        )
        .code(),
        "duplicate-divergent",
    );
}

#[test]
fn budget_overflow_refuses_without_panicking() {
    let previous = valid_event(1, None, u64::MAX, u64::MAX);
    let current = valid_event(2, Some(previous.digest()), u64::MAX, 1);
    assert_eq!(
        evaluate_causal_transition(
            Some(&previous),
            &current,
            EventCollisionObservation::Absent,
        )
        .code(),
        "orchestrator.authorized-execution.arithmetic-overflow",
    );
}
```

- [ ] **Step 2: Verify RED**

```bash
cargo test --locked --test authorized_execution_replay
```

Expected: compile failure for absent replay interfaces.

- [ ] **Step 3: Normalize v3 events without retaining wire content**

`AuthorizedExecutionEvent` stores only the validated identity bindings, sequence, predecessor digest, event digest, generation, event kind, step/attempt references and numeric budget delta required by replay. Keep fields private; expose read-only getters only where collision observations or tests need them. Canonicalize and hash with `serde_jcs` + `sha2` only at the validated boundary.

- [ ] **Step 4: Implement causal precedence and reducer invariants**

Implement these literal vector outcomes in order:

```text
idempotent-duplicate
duplicate-divergent
identity-mismatch
generation-stale
sequence-invalid
previous-digest-mismatch
budget-decreased
budget-arithmetic-invalid
event-valid
```

The reducer must:

- reject unavailable collision observations with `store-unavailable`;
- use `checked_add` for every counter;
- never decrement/reset total budget on retry;
- admit exactly one ready step;
- route only through `select_graph_transition`;
- leave state equal on exact duplicate replay;
- quarantine on divergent duplicate or forbidden phase transition;
- refuse unknown event kind and a second ready step.

- [ ] **Step 5: Add deterministic whole-chain tests**

Build a synthetic calculation → human decision → effect → terminal event chain. Replay two independently parsed copies and assert:

```rust
let left = replay_authorized_execution(&graph, &events).expect("first replay");
let right = replay_authorized_execution(&graph, &independent_events).expect("second replay");
assert_eq!(left, right);
assert_eq!(encode_state_for_test(&left), encode_state_for_test(&right));
```

`encode_state_for_test` lives in `tests/support/authorized_execution.rs`, serializes a projection assembled exclusively through public getters, and is never a production API.

- [ ] **Step 6: Run focused and regression tests, then commit**

```bash
cargo test --locked --test authorized_execution_replay
cargo test --locked --test authorized_execution_graph
cargo test --locked --all-features
cargo clippy --locked --all-targets --all-features -- -D warnings
```

Expected: all PASS, including existing control/budget suites.

```bash
git add src/authorized_execution tests/support/authorized_execution.rs tests/authorized_execution_replay.rs
git commit -s -m "feat: replay authorized execution events"
```

---

### Task 5: Implement human-decision and generation-transfer evaluators

**Files:**
- Create: `src/authorized_execution/decision.rs`
- Create: `src/authorized_execution/transfer.rs`
- Modify: `src/authorized_execution/mod.rs`
- Create: `tests/authorized_execution_decision.rs`
- Create: `tests/authorized_execution_transfer.rs`
- Modify: `tests/support/authorized_execution.rs`

**Interfaces:**
- Consumes: validated decision request/response and transfer documents, caller-owned observations and ISO 8601 evaluation time.
- Produces: `DecisionObservation`, `DecisionApplication`, `DecisionDecision`, `TransferObservation`, `TransferApplication`, `TransferDecision`, `evaluate_human_decision`, `evaluate_execution_transfer`.

- [ ] **Step 1: Write RED decision-precedence tests**

The tests must independently cover all literal outcomes in this exact order:

```text
organization-mismatch
attempt-mismatch
request-replaced
idempotent-duplicate
duplicate-divergent
request-expired
request-consumed
choice-unknown
actor-unauthorized
revision-stale
decision-valid
```

The locked corpus contains eleven cases because the exact replay and divergent replay share collision facts; the focused suite must still exercise both branches explicitly. Include:

```rust
#[test]
fn missing_prior_response_observation_refuses_closed() {
    let decision = evaluate_human_decision(
        &registry(),
        &valid_decision_request(),
        &valid_decision_response(),
        DecisionObservation::unavailable(),
        "2026-09-10T12:00:00Z",
    );
    assert_eq!(decision.code(), "orchestrator.authorized-execution.store-unavailable");
}
```

- [ ] **Step 2: Verify decision RED**

```bash
cargo test --locked --test authorized_execution_decision
```

Expected: compile failure for absent decision interfaces.

- [ ] **Step 3: Implement decision evaluation**

Parse timestamps from explicit `evaluation_time`; never call a clock. Treat an invalid supplied evaluation time as `schema-invalid`. `DecisionApplication` names the request digest, choice outcome and expected revision but performs no mutation. `DecisionDecision::Idempotent` contains no wire value.

- [ ] **Step 4: Verify decision GREEN**

```bash
cargo test --locked --test authorized_execution_decision
```

Expected: all decision cases PASS.

- [ ] **Step 5: Write RED transfer-precedence tests**

Cover these eight vector outcomes and an unavailable-lineage case:

```text
idempotent-duplicate
duplicate-divergent
transfer-expired
generation-consumed
identity-mismatch
generation-stale
revision-stale
transfer-valid
```

Assert a valid application exposes only the expected seal revision and successor generation, and does not mutate the observation.

- [ ] **Step 6: Implement transfer evaluation and verify GREEN**

`TransferObservation` carries a raw prior transfer identity/digest plus raw authoritative lineage facts through `Authoritative`; the evaluator, not the caller, classifies exact or divergent replay. Validate time explicitly. Return idempotent before expiry only when locked precedence requires it; never allocate a generation internally.

```bash
cargo test --locked --test authorized_execution_transfer
cargo test --locked --test authorized_execution_decision
cargo clippy --locked --all-targets --all-features -- -D warnings
```

Expected: all PASS with no warnings.

- [ ] **Step 7: Commit both adjacent one-shot authorities**

```bash
git add src/authorized_execution tests/support/authorized_execution.rs tests/authorized_execution_decision.rs tests/authorized_execution_transfer.rs
git commit -s -m "feat: evaluate decisions and generation transfers"
```

---

### Task 6: Implement effect attestation and the continuity barrier

**Files:**
- Create: `src/authorized_execution/effect.rs`
- Modify: `src/authorized_execution/mod.rs`
- Create: `tests/authorized_execution_effect.rs`
- Modify: `tests/support/authorized_execution.rs`

**Interfaces:**
- Consumes: validated `effect-attestation.v1` and explicit lineage, attempt, generation, fencing, executor-profile, prior-emission and predecessor observations.
- Produces: `EffectObservation`, `EffectApplication`, `EffectDecision`, `evaluate_effect_attestation`.

- [ ] **Step 1: Write RED effect matrix**

Cover the locked precedence exactly:

```text
organization-mismatch
identity-mismatch
attempt-mismatch
lineage-administratively-closed
generation-consumed
generation-stale
emission-duplicate
emission-divergent
second-emission-for-attempt
fencing-stale
executor-unqualified
effect-state-unknown
predecessor-effects-nonterminal
effect-valid
```

The pinned vector corpus has eleven cases; focused tests add cross-organization, unavailable-observation and all internal barrier branches that cannot safely be omitted merely because they share a vector envelope.

```rust
#[test]
fn unknown_external_state_never_authorizes_reemission() {
    let decision = evaluate_effect_attestation(
        &registry(),
        &valid_effect_attestation("state-unknown"),
        valid_effect_observation(),
    );
    assert_eq!(decision.code(), "effect-state-unknown");
    assert!(decision.application().is_none());
}
```

- [ ] **Step 2: Verify RED**

```bash
cargo test --locked --test authorized_execution_effect
```

Expected: compile failure for absent effect interfaces.

- [ ] **Step 3: Implement the evaluator in locked order**

Model observations as explicit enums/options whose unavailable state is distinguishable from absence. An accepted application may carry only the attested terminal state and expected one-shot identity. Exact duplicate emission is idempotent; divergent or second emission refuses; stale fencing and unqualified executor refuse; `state-unknown` returns a barrier with no application and cannot route a successor.

- [ ] **Step 4: Prove diagnostic minimization**

For every public effect decision variant, assert `code()`, `Display` and `Debug` contain no synthetic organization ID, run ID, attempt ID, digest, executor ID or payload value used by the fixture.

- [ ] **Step 5: Run focused/regression gates and commit**

```bash
cargo test --locked --test authorized_execution_effect
cargo test --locked --all-features
bun run check:capabilities
bun run check:personal-data
bun run check:secret-scan
cargo clippy --locked --all-targets --all-features -- -D warnings
```

Expected: all PASS.

```bash
git add src/authorized_execution tests/support/authorized_execution.rs tests/authorized_execution_effect.rs
git commit -s -m "feat: enforce effect continuity barriers"
```

---

### Task 7: Replay the exact 54-case authority independently in Rust

**Files:**
- Create: `tests/authorized_execution_vectors.rs`
- Modify: `tests/support/authorized_execution.rs`

**Interfaces:**
- Consumes: direct Contracts checkout, schema fixtures, every production evaluator from Tasks 3–6.
- Produces: one executable proof that every exact pinned case ID/domain/outcome is covered with no TypeScript oracle.

- [ ] **Step 1: Write the RED inventory test before the adapter**

Read both files at runtime:

```rust
const AUTHORITY_ROOT: &str = "node_modules/@libre-ai/contracts-authority";
const SEMANTIC_VECTORS: &str =
    "contracts/fixtures/authorized-execution-v1/semantic-vectors.v1.json";
const SCHEMA_FIXTURES: &str = "contracts/fixtures/schema-fixtures.v1.json";
```

Deserialize the test envelope into test-only structs. Assert schema version, total 54, unique IDs and the exact domain map `[('graph', 11), ('causal', 9), ('decision', 11), ('effect', 11), ('authority', 4), ('transfer', 8)]` before evaluating any case.

- [ ] **Step 2: Verify RED**

```bash
cargo test --locked --test authorized_execution_vectors
```

Expected: FAIL because `adapt_and_evaluate` is absent.

- [ ] **Step 3: Implement test-only adapters per domain**

For each reduced vector:

1. clone the corresponding full valid document(s) from `schema-fixtures.v1.json`;
2. mutate only fields represented by the vector facts;
3. pass the resulting document through the public `ContractRegistry` boundary where the domain is wire-based;
4. construct explicit observation enums from reduced observation facts;
5. call exactly one production evaluator;
6. return that evaluator's literal `code()`.

Do not import `tools/quality/authorized-execution.ts`, execute Bun, duplicate its algorithm, or call a function that calculates both actual and expected values. The expected string comes only from `vector.expected`.

- [ ] **Step 4: Add exact case accountability**

Use a `BTreeSet<&str>` of executed IDs and assert it equals the complete set read from the authority. On adapter failure, panic with only the synthetic vector ID and domain, never the mutated document.

```rust
for vector in &document.cases {
    let actual = adapt_and_evaluate(vector, &fixtures, &registry)
        .unwrap_or_else(|code| panic!("{} [{}]: {code}", vector.id, vector.domain));
    assert_eq!(actual, vector.expected, "{} [{}]", vector.id, vector.domain);
    assert!(executed.insert(vector.id.as_str()), "duplicate vector id");
}
assert_eq!(executed.len(), 54);
```

- [ ] **Step 5: Run the vector proof twice and all Rust tests**

```bash
cargo test --locked --test authorized_execution_vectors -- --test-threads=1
cargo test --locked --test authorized_execution_vectors -- --test-threads=1
cargo test --locked --all-features
```

Expected: both independent vector runs PASS with the same 54 cases; all regression tests remain green.

- [ ] **Step 6: Commit**

```bash
git add tests/authorized_execution_vectors.rs tests/support/authorized_execution.rs
git commit -s -m "test: replay locked execution semantics"
```

---

### Task 8: Prove recovery at five fake-harness crash cut points

**Files:**
- Create: `tests/authorized_execution_crash_e2e.rs`
- Modify: `tests/support/mod.rs`
- Modify: `tests/support/authorized_execution.rs`

**Interfaces:**
- Consumes: graph routing, deterministic replay and effect decisions; canonical test documents for `step-invocation.v1`, `effect-attestation.v1` and `orchestrator-event.v3`.
- Produces: fake-only `CrashPoint`, `FakeJournal`, `FakeExecutor` and recovery scenario proving at-most-one external commit.

- [ ] **Step 1: Write the RED crash matrix**

Define only in test support:

```rust
#[derive(Clone, Copy, Debug)]
enum CrashPoint {
    AfterStepAuthorized,
    AfterEffectReserved,
    AfterEffectStarted,
    AfterFakeExecutorCommit,
    AfterTerminalEffectEvent,
}

#[derive(Default)]
struct FakeExecutor {
    committed_effects: u8,
    terminal_observation: Option<FakeTerminalObservation>,
}
```

Parameterize one E2E over all five variants. Every row must assert `committed_effects <= 1`; crash 4 without terminal observation yields `effect-state-unknown`; crash 4 with authoritative terminal observation reconciles; crash 5 records `StepResultRecorded` without re-emission.

- [ ] **Step 2: Verify RED**

```bash
cargo test --locked --test authorized_execution_crash_e2e
```

Expected: FAIL because the fake recovery driver is absent.

- [ ] **Step 3: Implement the fake journal and recovery driver**

`FakeJournal` stores canonical event `Value`s in memory, validates each with the registry, parses it through production code and replays from the beginning after each simulated crash. `FakeExecutor::commit` increments only after production effect admission. It exposes an authoritative terminal observation only when explicitly configured by the test.

The recovery switch is exact:

```text
AfterStepAuthorized       -> reserve, start, admit once, persist terminal, record result
AfterEffectReserved       -> start, admit once, persist terminal, record result
AfterEffectStarted        -> consult executor; admit only when no prior emission is authoritative
AfterFakeExecutorCommit   -> state-unknown without terminal observation; reconcile with one
AfterTerminalEffectEvent  -> record result without executor call
```

Validate the synthetic `step-invocation.v1` before the fake executor sees it. An invalid invocation must leave `committed_effects == 0`.

- [ ] **Step 4: Add negative E2E substitutions**

For each of organization, run, attempt, generation, fencing and executor profile, replace one synthetic identifier between recovery input and observation. Assert a closed decision, unchanged journal and zero additional commit. Add store-unavailable variants for collision, lineage and executor status.

- [ ] **Step 5: Run E2E repeatedly and commit**

```bash
cargo test --locked --test authorized_execution_crash_e2e -- --test-threads=1
cargo test --locked --test authorized_execution_crash_e2e -- --test-threads=1
cargo test --locked --all-features
cargo clippy --locked --all-targets --all-features -- -D warnings
```

Expected: both crash-matrix runs PASS; each scenario reports at most one fake commit.

```bash
git add tests/support tests/authorized_execution_crash_e2e.rs
git commit -s -m "test: prove authorized execution crash recovery"
```

---

### Task 9: Benchmark bounded hot paths and lock compatibility

**Files:**
- Modify: `Cargo.toml`
- Create: `benches/authorized_execution_replay.rs`
- Modify: `tests/compat/public_surface.snapshot`
- Modify: `tests/compat/stable_codes.snapshot`
- Modify: `tests/compat_surface.rs`
- Modify: `docs/compat/BREAKS.md`

**Interfaces:**
- Consumes: final public API and maximum-size fixtures.
- Produces: reproducible `std` benchmark plus exhaustive 0.2.0 symbol/code inventory.

- [ ] **Step 1: Add the benchmark target without a dependency**

Append to `Cargo.toml`:

```toml
[[bench]]
name = "authorized_execution_replay"
harness = false
```

In `benches/authorized_execution_replay.rs`, construct a 256-step/512-edge graph and a long valid event chain once, then use `std::hint::black_box`, `std::time::Instant` and a fixed iteration count. Print exactly:

```rust
println!(
    "authorized_execution.graph_validation iterations={} ns_per_iteration={}",
    iterations,
    graph_elapsed.as_nanos() / iterations as u128,
);
println!(
    "authorized_execution.route_selection iterations={} ns_per_iteration={}",
    iterations,
    route_elapsed.as_nanos() / iterations as u128,
);
println!(
    "authorized_execution.replay events={} iterations={} ns_per_event={}",
    events.len(),
    iterations,
    replay_elapsed.as_nanos() / (events.len() as u128 * iterations as u128),
);
```

Do not add Criterion or a hardware threshold.

- [ ] **Step 2: Run benchmark and retain its complete output for Task 11**

```bash
cargo bench --bench authorized_execution_replay
```

Expected: exit 0 and all three exact metric names with non-zero integer values.

- [ ] **Step 3: Make compatibility tests RED**

Add a test asserting `env!("CARGO_PKG_VERSION") == "0.2.0"` and extend expected public symbols/codes in `tests/compat_surface.rs` before updating the package version or snapshots.

```bash
cargo test --locked --test compat_surface
```

Expected: FAIL on version `0.1.0` and snapshot drift.

- [ ] **Step 4: Bump version and exhaustively update compatibility evidence**

Set `version = "0.2.0"` in `Cargo.toml`, refresh the root package entry in `Cargo.lock`, add every exported type/function to `public_surface.snapshot`, and add every canonical/internal `code()` value to `stable_codes.snapshot`. Add a dated `0.2.0` entry to `docs/compat/BREAKS.md` stating that the change is additive, existing 0.1 APIs retain behavior, and the major/minor bump records the new coherent surface.

- [ ] **Step 5: Verify snapshots, benchmark and regressions**

```bash
cargo test --locked --test compat_surface
cargo test --locked --all-features
cargo bench --bench authorized_execution_replay
cargo clippy --locked --all-targets --all-features -- -D warnings
```

Expected: all PASS; benchmark emits all three metrics.

- [ ] **Step 6: Commit**

```bash
git add Cargo.toml Cargo.lock benches/authorized_execution_replay.rs tests/compat tests/compat_surface.rs docs/compat/BREAKS.md
git commit -s -m "perf: benchmark authorized execution replay"
```

---

### Task 10: Document the bounded API, payoff, residual risks and rollback

**Files:**
- Modify: `README.md`
- Modify: `docs/apps/orchestrator.md`
- Modify: `project.v1.yaml`

**Interfaces:**
- Consumes: exact implemented public API and verified claims from Tasks 2–9.
- Produces: user-facing synthetic example and a project card that cannot be read as runtime authorization.

- [ ] **Step 1: Add a compile-tested synthetic example**

Add this doctest to the README API section; it uses synthetic non-production identifiers only:

```rust
use libre_ai_agent_orchestrator::{evaluate_graph, parse_authorized_graph};
use libre_ai_contract_types::ContractRegistry;
use serde_json::json;

let registry = ContractRegistry::embedded().expect("embedded schemas are build-time authorities");
let document = json!({
    "schemaVersion": "libre-ai.execution-graph.v1",
    "id": "urn:libre-ai:graph:synthetic-example",
    "organizationId": "ten_1234567890abcdef",
    "entryStepId": "urn:libre-ai:step:calculate",
    "steps": [
        {
            "stepId": "urn:libre-ai:step:calculate",
            "kind": "calculation",
            "outcomeCodes": ["ok"],
            "retryPolicy": { "maximumAttempts": 1, "retryableOutcomeCodes": [] }
        },
        {
            "stepId": "urn:libre-ai:step:terminal",
            "kind": "terminal",
            "outcomeCodes": []
        }
    ],
    "edges": [{
        "edgeId": "urn:libre-ai:edge:complete",
        "fromStepId": "urn:libre-ai:step:calculate",
        "outcomeCode": "ok",
        "toStepId": "urn:libre-ai:step:terminal"
    }],
    "createdAt": "2026-09-10T10:00:00Z",
    "graphDigest": "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
});
let graph = parse_authorized_graph(&registry, &document).expect("valid synthetic graph");
assert_eq!(evaluate_graph(&graph).code(), "graph-valid");
```

Immediately below the example, state: returned applications are pure proposals and require a separately authorized persistence/effect boundary before they can change external state.

- [ ] **Step 2: Rewrite the Orchestrator status precisely**

In `docs/apps/orchestrator.md`, separate:

```text
Proven in Phase 4A:
- strict validated input boundary;
- deterministic graph, causal, decision, transfer and effect decisions;
- independent 54-vector replay;
- five fake-harness crash scenarios;
- no runtime capability in src/.

Not proven and blocking real execution:
- transactional PostgreSQL serialization;
- executor-enforced point-of-effect idempotency/fencing;
- allow-listed zero-PII runtime logs;
- retention, deletion tombstones and restore replay.
```

State explicitly that LangGraph remains optional, non-normative and absent from the dependency graph.

- [ ] **Step 3: Update `project.v1.yaml` without claiming WP-G3-O01**

Set the current native core milestone to `implemented-review-pending` because immutable role review has not yet run at this task. Pin ADR-0037, Contracts and SDK SHAs. Keep run boundary, real effects and deployment blocked. Remove stale v1/v2 contract references only where Phase 4A supersedes them; do not mark persistence or Harness criteria complete.

- [ ] **Step 4: Add exact rollback text**

Document: before any future consumer, revert the additive Phase 4A commits; after a future consumer, pin that consumer to the prior Orchestrator revision. No canonical event migration exists because the core adds no contract or stored-state schema.

- [ ] **Step 5: Run documentation and full gates, then commit**

```bash
cargo test --doc --locked
cargo test --locked --all-features
bun run check
```

Expected: doctest, Rust suites and all repository policy gates PASS.

```bash
git add README.md docs/apps/orchestrator.md project.v1.yaml
git commit -s -m "docs: describe native execution guarantees"
```

---

### Task 11: Produce immutable review evidence and integrate sequentially

**Files:**
- Create: `docs/reviews/authorized-execution-native-core/$REVIEW_SHA/benchmark.txt`
- Create: `docs/reviews/authorized-execution-native-core/$REVIEW_SHA/architecture.md`
- Create: `docs/reviews/authorized-execution-native-core/$REVIEW_SHA/security.md`
- Create: `docs/reviews/authorized-execution-native-core/$REVIEW_SHA/privacy.md`
- Create: `docs/reviews/authorized-execution-native-core/$REVIEW_SHA/integration.md`
- Modify: `project.v1.yaml`

**Interfaces:**
- Consumes: one immutable Orchestrator implementation commit and complete local command output.
- Produces: reviewable evidence sufficient for feature-branch merge, post-merge verification and clean worktree removal.

- [ ] **Step 1: Freeze the candidate and record its identity**

```bash
git status --short
REVIEW_FULL_SHA=$(git rev-parse HEAD)
REVIEW_SHA=${REVIEW_FULL_SHA:0:7}
REVIEW_DIR="docs/reviews/authorized-execution-native-core/$REVIEW_SHA"
git show --stat --oneline --decorate "$REVIEW_FULL_SHA"
```

Expected: clean tree. Every review file under `$REVIEW_DIR` names `$REVIEW_FULL_SHA`. Any code change after this point creates a directory derived from the new implementation SHA.

- [ ] **Step 2: Run the complete local proof on that SHA**

```bash
cargo fmt --all -- --check
cargo test --locked --all-features
cargo clippy --locked --all-targets --all-features -- -D warnings
cargo bench --bench authorized_execution_replay
bun run check
cargo deny check licenses
reuse lint
```

Expected: every command exits 0; capture command, UTC timestamp, exact SHA, exit code and non-sensitive summary. `benchmark.txt` contains the three raw metric lines from Task 9.

- [ ] **Step 3: Perform separate architecture, security and privacy passes**

Each pass reviews the same immutable SHA and records one of `approve`, `hold`, `reject`, plus findings classified `Blocking`, `Major`, `Minor`.

Architecture must verify contract authority remains external, typed normalization is private, routing/replay are deterministic, applications perform no I/O, API/version snapshots are exhaustive and no scope from Phase 4B entered.

Security must verify validation precedes normalization, every missing observation fails closed, checked arithmetic, collision and replay precedence, organization/run/attempt/generation/fencing binding, no blind effect retry, no unsafe code and capability gate coverage.

Privacy must search source, tests, errors and evidence for raw document output, identifiers, digests, prompts, payloads, secrets and real personal data; only constant codes, counters and synthetic fixtures are admissible.

Any Blocking or Major finding invalidates the evidence directory. Return to the owning task with a RED regression test, fix, rerun all gates and review a new immutable SHA.

After all three specialized verdicts are `approve` and the integration pass is green, change only the native-core milestone in `project.v1.yaml` from `implemented-review-pending` to `proven`. Keep every Phase 4B and `WP-G3-O01` capability blocked.

- [ ] **Step 4: Commit the immutable evidence**

```bash
git add "$REVIEW_DIR" project.v1.yaml
git commit -s -m "docs: record native execution review"
```

Run the complete proof again because the evidence commit changes HEAD; the evidence must state that the reviewed implementation parent SHA is immutable and that the evidence-only child changes no implementation.

- [ ] **Step 5: Push Orchestrator, verify feature CI and review the address**

```bash
git push -u origin feat/authorized-execution-native-core
gh pr create --fill
PR_NUMBER=$(gh pr view --json number --jq .number)
gh pr checks "$PR_NUMBER" --watch
```

Expected: all required checks green. Review the PR base/head, exact commit list, changed paths and merge method; ensure no unrelated Harness or Governance WIP entered the branch.

- [ ] **Step 6: Merge without force and verify post-merge main**

Merge using the repository-required method only after green review. Then:

```bash
git fetch origin
git rev-parse origin/main
git show --stat --oneline origin/main
```

Check required CI for that exact merge SHA and rerun a clean-checkout smoke:

```bash
bun install --frozen-lockfile
bun run check
cargo test --locked --all-features
cargo clippy --locked --all-targets --all-features -- -D warnings
```

Expected: post-merge SHA green; no deployment is performed because Phase 4A exposes no service.

- [ ] **Step 7: Remove only the completed clean worktrees**

Verify both feature worktrees are clean and their branches are merged before running:

```bash
GOVERNANCE_REPO="$LIBRE_AI_REPOSITORY_ROOT/governance"
GOVERNANCE_WORKTREE="$LIBRE_AI_WORKTREE_ROOT/governance-authorized-execution-native-core-design"
ORCHESTRATOR_REPO="$LIBRE_AI_REPOSITORY_ROOT/orchestrator"
ORCHESTRATOR_WORKTREE="$LIBRE_AI_WORKTREE_ROOT/orchestrator-authorized-execution-native-core"
git -C "$GOVERNANCE_REPO" worktree remove "$GOVERNANCE_WORKTREE"
git -C "$ORCHESTRATOR_REPO" worktree remove "$ORCHESTRATOR_WORKTREE"
```

Preserve the existing user work in Governance `docs/square-control-design` and Harness `feat/wp-g3-h01-redelivery`; never clean, reset or remove those trees.

Final report must state: Governance and Orchestrator merge SHAs, local/feature/post-merge gate results, 54-vector inventory, five crash cut points, benchmark metrics, review verdicts, removed worktree paths and the four still-blocking Phase 4B claims. It must not claim runtime or real-effect safety.
