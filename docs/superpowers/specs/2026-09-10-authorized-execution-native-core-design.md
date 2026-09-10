# Authorized Execution Native Core — Phase 4A Design

- **Status:** approved for specification authoring — owner, 2026-09-10
- **Date:** 2026-09-10
- **Programme authority:** ADR-0032, ADR-0034 and ADR-0036
- **Scope:** effect-free Rust validation, transition and replay of the locked
  authorized-execution semantics in `libre-ai/orchestrator`
- **Explicit exclusion:** persistence, real effects, real missions, runtime
  logging and any LangGraph, LangChain or LangSmith dependency

## 1. Decision being implemented

The owner selected option A on 2026-09-10: extend the existing
`libre-ai-agent-orchestrator` pure decision crate with the native authorized
execution core. A separate pure crate was rejected because it would split one
decision authority without adding a security boundary. Opening the future run
boundary now was rejected because it would combine deterministic semantics,
transaction serialization and external-effect safety before any of them had an
independent proof.

ADR-0036 locks eleven contract families but explicitly does not prove runtime
conformance, transactional serialization, point-of-effect idempotency or safe
runtime logs. The LangGraph pattern-mining programme therefore requires Phase 4
to implement pure validation and transition functions, independently replay the
locked semantic vectors, demonstrate deterministic recovery and inject crashes
against a fake harness without opening a runtime capability.

This design authorizes planning that pure-core increment. It does not authorize
a process, filesystem, network, secret, database, real organization data,
deployment or framework dependency. A separate governance act and work package
must bind the implementation before Orchestrator code is merged.

The implementation authority will be `ADR-0037` with decision-register entry
`D43` and additive work package `WP-G3-O02`. `WP-G3-O01` remains the separately
locked run-boundary package; Phase 4A does not reinterpret or partially claim
its persistence and Harness acceptance criteria.

## 2. Payoff

The Specification Lock is a stable constitution. Phase 4A makes that
constitution executable without letting an implementation become a second
authority.

The immediate proof is that the same locked facts always produce the same
closed decision and that a canonical event chain always reconstructs the same
run state. This removes routing, retry, decision, transfer and effect-recovery
choices from future storage, harness and worker adapters. Those adapters may
fail or be replaced, but they cannot reinterpret the graph or grant themselves
authority.

This increment deliberately does not claim that real concurrency or effects
are safe. It makes the later proofs smaller: a transactional store must
serialize already-defined applications, and an executor must enforce
already-defined one-shot and fencing decisions. A future LangGraph worker can
only be compared against these observable decisions and remains removable.

## 3. Authority and repository boundaries

### Governance

`libre-ai/governance` owns the Phase 4A opening act, the bounded work package,
this design and the implementation plan. It owns no Rust implementation and no
contract byte.

### Contracts and SDK Rust

`libre-ai/contracts` remains the only authority for schemas, RFC 8785
preimages, refusal outcomes and semantic vectors. `libre-ai/sdk-rs` remains the
disposable Rust projection and strict embedded-schema registry.

Orchestrator pins:

- SDK Rust commit `ac9f2020425733183839a58fc2c3928a4de5c066`, which consumes
  the authorized-execution lock;
- Contracts lock-authority commit
  `5b9b6668909119b670e0db62174419ab04e5b402` for schemas and test vectors.

The Phase 4A change does not edit either authority. Pin provenance and the
locked status are checked mechanically before the Rust suite runs.

### Orchestrator

`libre-ai/orchestrator` owns the native interpretation of the locked semantics.
The existing crate stays effect-free. `verification/agent-orchestrator/
check-capabilities.ts` continues to reject process, filesystem, network,
environment, thread, clock and secret capabilities in `src/`.

The crate version moves from `0.1.0` to `0.2.0` because its public surface gains
a coherent authorized-execution family. The public-surface and closed-code
snapshots move in the same commit, with a compatibility journal entry. Existing
control and budget APIs keep their signatures and behavior.

### Future run boundary

PostgreSQL, Biscuit verification, worker invocation, Harness RPC, operational
logs, retention sweeps and deletion/restore stay in later work packages. They
must consume this core; they must not move their policy into adapters.

## 4. Input boundary and type discipline

Canonical JSON documents are validated by `ContractRegistry` before semantic
evaluation. Validation failures return a closed schema refusal and never copy a
rejected value, identifier, digest, path, prompt or raw error into the result.

After validation, Orchestrator normalizes only the fields needed for a decision
into Rust domain values. These values are explicitly not wire contracts:

- they do not derive `Deserialize` from untrusted input;
- they do not carry a schema version or media type;
- they are never emitted as a protocol or persisted as an authority;
- their names use `Facts`, `Observation`, `State` or `Application`, never the
  canonical contract title;
- conversion remains private to the validated-document boundary.

This avoids two unsafe alternatives: treating disposable generated projections
as authoritative despite conditional-schema projection loss, or evaluating raw
`serde_json::Value` throughout the state machine. Contract bytes remain unique
while the decision core retains strict types.

The small fact structures used only to replay the canonical semantic-vector
envelope remain test-side adapters. Production evaluators never accept the
vector envelope as a runtime protocol.

## 5. Module architecture

Phase 4A adds one `authorized_execution` module family to the existing crate.
Each file owns one decision boundary.

### 5.1 Boundary parsing

`authorized_execution/document.rs` validates and normalizes:

- `execution-graph.v1`;
- `execution-plan-body.v2`;
- `execution-transfer.v1`;
- `execution-authorization.v2`;
- `human-decision-request.v1`;
- `human-decision-response.v1`;
- `effect-attestation.v1`;
- `orchestrator-event.v3`.

`step-invocation.v1` is schema-validated in the fake-harness E2E, but Phase 4A
does not produce or dispatch it. Retention v2 is not parsed by the pure core;
its storage behavior belongs to the later persistence package.

The public boundary functions are:

```rust
pub fn parse_authorized_graph(
    registry: &ContractRegistry,
    document: &Value,
) -> Result<AuthorizedGraph, AuthorizedExecutionRefusal>;

pub fn parse_authorized_execution_event(
    registry: &ContractRegistry,
    document: &Value,
) -> Result<AuthorizedExecutionEvent, AuthorizedExecutionRefusal>;
```

The remaining documents are normalized by private conversion functions used by
the authority-specific public evaluators. This avoids exporting a second model
of every canonical contract.

### 5.2 Graph and authority

`authorized_execution/graph.rs` owns:

```rust
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
```

Evaluation is deterministic and preserves the locked first-refusal precedence.
It rejects duplicate identities, missing entry, dangling edges, invalid terminal
edges, missing or ambiguous routes, steps unable to reach a terminal,
unreachable steps and cycles. Routing uses the explicit `(stepId, outcomeCode)`
pair; declaration or arrival order never breaks a tie.

Graph-policy validation also proves retryable outcomes are declared, human
decision choices are unique and bound to authorized schema references, and
effect profiles exactly match the plan references.

### 5.3 Causality and replay

`authorized_execution/replay.rs` owns:

```rust
pub fn evaluate_causal_transition(
    previous: Option<&AuthorizedExecutionEvent>,
    current: &AuthorizedExecutionEvent,
    collision: EventCollisionObservation<'_>,
) -> CausalDecision;

pub fn replay_authorized_execution(
    graph: &AuthorizedGraph,
    events: &[AuthorizedExecutionEvent],
) -> Result<AuthorizedExecutionState, AuthorizedExecutionRefusal>;
```

The reducer verifies organization, mission, plan, graph, authorization, run,
orchestrator and generation identity; exact sequence and predecessor digest;
monotone, checked budget arithmetic; event-specific identity presence; legal
phase transitions; closed routing; attempt ceilings; and single-ready-step.

An exact event identity/digest replay is idempotent and leaves state unchanged.
A reused identity or sequence with divergent content quarantines the state.
Unknown event kinds, unavailable causal observations and arithmetic overflow
refuse closed.

`AuthorizedExecutionState` is an in-memory projection, not a new stored schema.
It implements equality for replay proof but exposes no canonical serializer.
The byte-identity assertion is test-only: independent replays are projected by
one private deterministic test encoder and compared byte for byte. Runtime
persistence may store only locked events until a separate state schema is
authorized.

### 5.4 Human decisions and generation transfer

`authorized_execution/decision.rs` evaluates one validated response against a
validated request plus caller-supplied observation of replacement, consumption,
actor roles, authoritative revision and evaluation time. It rejects
cross-organization, wrong-attempt, request replacement, divergent replay,
expiry, prior consumption, unknown choice, insufficient role and stale
revision in locked precedence order.

`authorized_execution/transfer.rs` evaluates one validated transfer against the
current lineage observation. It never seals or allocates a generation itself.
It returns either a closed refusal, an idempotent receipt or an application that
names the expected seal revision and successor generation. An unavailable
lineage or idempotency observation refuses closed.

The public evaluator shape is consistent across both domains:

```rust
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
```

### 5.5 External-effect protocol

`authorized_execution/effect.rs` evaluates a validated
`effect-attestation.v1` against caller-supplied canonical observations:

```rust
pub fn evaluate_effect_attestation(
    registry: &ContractRegistry,
    attestation_document: &Value,
    observation: EffectObservation<'_>,
) -> EffectDecision;
```

The observation binds expected organization, run, attempt, generation,
executor profile, active fencing, prior emission, existing attempt emission,
predecessor inventory and administrative lineage state. Missing or unavailable
observations refuse closed.

The evaluator can accept or reconcile evidence but never applies an external
effect. Exact duplicate emission is idempotent. Divergent emission, second
emission for one attempt, stale fencing, unqualified executor, consumed
generation or closed lineage refuses. `state-unknown` installs a continuity
barrier; it never authorizes re-emission or a successor.

## 6. Pure data flow

```text
locked JSON document
  -> strict ContractRegistry validation
  -> private normalization
  -> pure evaluator + caller-supplied observation
  -> closed refusal | idempotent receipt | proposed application
  -> caller-owned persistence/effect boundary (not implemented in Phase 4A)
```

For replay:

```text
validated graph + ordered validated event documents
  -> causal and identity verification
  -> event-specific state transition
  -> deterministic in-memory projection
```

No evaluator reads a clock, store or environment. Evaluation time and store
availability are explicit inputs. No evaluator logs.

## 7. Closed outcomes and safe diagnostics

`AuthorizedExecutionRefusal`, `GraphDecision`, `CausalDecision`,
`DecisionDecision`, `TransferDecision` and `EffectDecision` expose constant
`code()` values. The canonical semantic outcomes retain their exact locked
kebab-case spelling.

Internal structural failures that are not canonical semantic outcomes use a
small namespaced family:

- `orchestrator.authorized-execution.schema-invalid`;
- `orchestrator.authorized-execution.store-unavailable`;
- `orchestrator.authorized-execution.transition-forbidden`;
- `orchestrator.authorized-execution.budget-exceeded`;
- `orchestrator.authorized-execution.arithmetic-overflow`.

No error variant stores an untrusted string. `Debug`, `Display` and `code()`
therefore cannot leak a wire value, stable identifier, digest, raw error or PII.
The exhaustive compatibility snapshot covers every public code.

## 8. Test architecture

All implementation follows strict red-green-refactor. Each evaluator first
receives a focused failing unit test for one observable decision. Tests use
literal, synthetic identifiers and assert real evaluator results, not mocks.

### 8.1 Locked semantic-vector conformance

The pinned Contracts authority currently contains exactly 54 cases:

| Domain | Cases |
| --- | ---: |
| graph | 11 |
| causal | 9 |
| decision | 11 |
| effect | 11 |
| authority | 4 |
| transfer | 8 |

One Rust integration test loads the authority directly and fails if the total,
domain counts, case identifiers or expected outcomes drift. Every case is
adapted to the corresponding production evaluator. The test does not port or
call the TypeScript checker and does not compute the expected outcome with
production helpers.

The acceptance rule is authority-based rather than count-based: every case in
the exact pinned semantic-vector document must execute and match. The explicit
counts make an accidental fixture omission visible.

### 8.2 Deterministic replay and routing

Focused tests prove:

- a complete synthetic calculation-to-decision-to-effect-to-terminal run
  reconstructs the same `AuthorizedExecutionState` on two independent replays;
- declaration order does not select an edge;
- an exact duplicate changes no state;
- a divergent duplicate quarantines the run;
- budget totals never decrease or reset on retry;
- an unknown outcome, missing route or second ready step blocks;
- a stale decision or generation and every cross-organization substitution are
  refused before application.

Small exhaustive graph permutations cover all acyclic graphs up to a bounded
node count without a property-test dependency. They assert that routing is
single-valued and independent of declaration order. Maximum-size fixtures cover
256 steps and 512 edges.

### 8.3 Five crash cut points against a fake harness

The fake harness and fake executor live only in `tests/support/`. They implement
no production trait and hold no real capability. The E2E records an explicit
crash after each of these five cut points:

1. `StepAuthorized` persisted, before `EffectReserved`;
2. `EffectReserved` persisted, before `EffectStarted`;
3. `EffectStarted` persisted, before point-of-effect admission;
4. the fake executor committed, before a terminal attestation/event was
   persisted;
5. the terminal effect event was persisted, before `StepResultRecorded`.

Recovery replays only canonical events plus an explicit authoritative executor
observation. Cut points 1–3 may proceed only through the locked reservation,
one-shot emission and fencing rules. Cut point 4 becomes `effect-state-unknown`
unless the executor returns an authoritative terminal observation; absence of
an error is never a commit. Cut point 5 reconciles without re-emitting. Every
scenario asserts that the fake executor's committed-effect count is at most one.

### 8.4 Unavailable observations

Each caller-supplied observation family has an explicit unavailable variant.
Tests prove that causal, idempotency, decision, lineage, executor-status and
profile observations refuse closed. No default fact is inferred.

### 8.5 Performance and quality gates

A dependency-free Cargo benchmark exercises maximum graph validation, route
selection and replay over a long synthetic event chain. It reports operations
and nanoseconds per event without imposing a hardware-dependent CI threshold.
The measured result is recorded in the review dossier so later runtime work can
compare the same fixture.

Required gates are:

- focused Rust tests for every red-green cycle;
- locked-vector conformance;
- fake-harness E2E and five crash cut points;
- `cargo test --locked --all-features`;
- `cargo clippy --locked --all-targets --all-features -- -D warnings`;
- `cargo bench --bench authorized_execution_replay`;
- `bun run check`, including capability, secret and personal-data gates;
- `cargo deny check licenses` and REUSE compliance;
- feature-branch and post-merge CI green.

## 9. Sovereignty, privacy and dependency result

**PASS — sovereignty.** Phase 4A adds no managed service, telemetry endpoint,
runtime network or US hyperscaler dependency. Only first-party Contracts and
SDK pins move.

**PASS — licensing.** No new third-party runtime or development dependency is
required. The benchmark uses the standard library. Existing Cargo deny and
REUSE gates remain blocking.

**PASS — privacy.** Fixtures remain synthetic. Production decisions contain
closed codes and counters only. No logging API is introduced, so there is no
new path for prompts, values, identifiers, digests or PII to reach stdout,
stderr or OTEL.

**PASS — reversibility.** Reverting the additive module, version bump, pin
updates and documentation removes Phase 4A. No database or canonical state
requires migration.

## 10. Delivery and review sequence

1. Ratify the Phase 4A opening in Governance with an additive ADR and a bounded
   `WP-G3-O02` work package whose write authority is the pure Orchestrator crate
   only; record the owner act as `ADR-0037`/`D43`.
2. Commit the implementation plan against exact Governance, Contracts, SDK Rust
   and Orchestrator SHAs.
3. Create isolated Governance and Orchestrator worktrees; preserve unrelated
   Harness work in place.
4. Merge the Governance opening only after its local gates and architecture,
   security and privacy reviews are green.
5. Pin Orchestrator to the reviewed SDK Rust and Contracts authorities.
6. Implement each pure evaluator under strict TDD, then the reducer and E2E.
7. Update the crate version, compatibility snapshots, project card, application
   documentation and API examples in the same reviewed change.
8. Run role-separated architecture, security and privacy reviews against one
   immutable Orchestrator commit. Any Blocking or Major finding invalidates the
   affected evidence.
9. Merge only after local gates and feature-branch CI are green, then verify the
   exact post-merge SHA.
10. Stop. Phase 4A authorizes no Phase 4B persistence or real effect.

## 11. Acceptance criteria

Phase 4A is complete only when:

- the exact locked Contracts and SDK Rust authorities are pinned and verified;
- every case in the pinned authorized-execution semantic-vector document is
  replayed independently by Rust and matches its literal expected outcome;
- a complete synthetic run replays to an equal, byte-identical test projection;
- closed routing, monotone budgets, stale decisions, generation transfer,
  one-shot emission, fencing and cross-organization refusal are executable
  properties rather than prose;
- all five crash cut points prove no blind retry, no false success and at most
  one fake external commit;
- unavailable observations refuse closed;
- existing control and budget APIs retain behavior and their tests stay green;
- the capability gate proves no process, filesystem, network, environment,
  thread, clock, secret, persistence or provider capability entered `src/`;
- the maximum graph and replay paths have a reproducible benchmark result;
- public codes and symbols are exhaustively snapshot-tested under version
  `0.2.0`;
- API documentation, a synthetic example, project status, rollback instructions
  and role-separated review evidence accompany the implementation;
- all local, feature-branch and post-merge gates are green with zero warnings.

## 12. Residual risks and later packages

Phase 4A intentionally leaves four claims unproven:

1. PostgreSQL serialization of revision, generation, reservation and one-shot
   identity consumption;
2. executor-enforced idempotency or fencing at a real point of effect;
3. zero-PII allow-listed runtime logs;
4. retention, deletion tombstones and restore replay against persisted data.

They remain blocking for real execution. The next packages must prove them in
that order: transactional store, bounded Harness/executor integration, runtime
diagnostics, then retention/deletion/restore. None may weaken or bypass a pure
decision to accommodate an adapter.

LangGraph remains a non-normative oracle until the native core and later runtime
proofs are green. Its first admissible use is a removable worker comparison
against the same E2E scenarios; it never becomes a checkpoint or transition
authority.

## 13. Rollback and anti-gold-plating

Before any later runtime consumes the module, rollback is a normal revert of
the additive Governance and Orchestrator commits. After later consumption, the
consumer may pin the prior crate revision; canonical events remain readable
because Phase 4A changes no contract bytes.

Explicit non-goals are PostgreSQL, Redis, RLS, Biscuit parsing, local process
execution, real Harness integration, real Missions, Proof/Artifact storage,
streaming, operational telemetry, retention sweeps, deletion restore,
parallelism, cycles, subgraphs, dynamic replanning, long-term memory, graph UI,
time travel and framework compatibility. Adding any of them to this package is
scope expansion, not completeness.
