# Authorized Execution Contracts — Phase 3 Design

- **Status:** approved for Phase 3 planning — owner, 2026-09-09
- **Date:** 2026-09-09
- **Programme authority:** ADR-0032 and accepted ADR-0034/D40
- **Scope:** candidate contracts, canonical semantics, adversarial vectors and disposable TypeScript/Rust projections
- **Explicit exclusion:** Specification Lock, runtime capability and framework dependency

## 1. Decision being implemented

ADR-0034 accepts a finite, sequential and acyclic authorized execution graph.
It authorizes Phase 3 to design machine-checkable candidates while keeping all
existing locked contracts byte-identical. The owner selected the contract-first
option on 2026-09-09. This design turns that direction into a cross-repository
contract increment; it does not promote a candidate or authorize a producer.

Phase 3 covers four authority gaps that the flat plan cannot close:

1. deterministic, reviewable topology and closed routing;
2. explicit attempts, invocations and monotone budgets;
3. typed human decisions owned by Missions;
4. fail-closed external effects and successor-run continuity.

## 2. Authority and repository boundaries

### Governance

`libre-ai/governance` records this design, the cross-repository implementation
plan and the Phase 3 status. It owns no contract byte and no validator used by a
consumer.

### Contracts

`libre-ai/contracts` owns every candidate JSON Schema, canonical semantic rule,
preimage rule, refusal code and vector. Candidate status means
machine-checkable and reviewed, not approved for implementation or release.

### SDK projections

`libre-ai/sdk-ts` and `libre-ai/sdk-rs` consume one exact candidate authority
revision. They vendor the schemas byte-for-byte, generate disposable types and
independently replay the schema and digest vectors. A generated type never
overrides JSON Schema or canonical semantics.

### Runtime repositories

`libre-ai/orchestrator`, `libre-ai/missions`, `libre-ai/harness` and
`libre-ai/artifacts` remain unchanged in Phase 3. Their implementation begins
only under later work packages after a separate Specification Lock.

## 3. Candidate contract set

Eleven candidates form one review unit. Splitting them would leave identities or
authority transfers implicit between independently reviewable fragments.

1. `execution-graph.v1` — authorized topology and per-step policy.
2. `execution-plan-body.v2` — the existing capability envelope plus graph and
   lineage bindings.
3. `execution-transfer.v1` — the one-shot Missions command that seals one run
   generation before a successor can be authorized.
4. `execution-authorization.v2` — authorization bound to the graph, transfer,
   generation and terminal predecessor inventory.
5. `human-decision-request.v1` — bounded choices and decision authority.
6. `human-decision-response.v1` — one idempotent answer to one exact request.
7. `step-invocation.v1` — Harness input bound to one step attempt and current
   execution generation.
8. `effect-attestation.v1` — signed observation of reservation, emission and
   authoritative effect status.
9. `orchestrator-event.v3` — causal graph events, decisions, transfers and the
   effect-continuity barrier.
10. `retention-policy-schema.v2` — the policy shape admitting Orchestrator-owned
    execution records and deletion tombstones.
11. `retention-policy.v2` — exact retention, deletion and restore rules for the
    new data classes while preserving every v1 rule.

The extra transfer and authorization candidates are required by ADR-0034 D2.
Reusing `execution-authorization.v1` for a graph successor would silently add
graph, generation and transfer semantics to an immutable v1 contract. That is
forbidden even though v1 already carries an opaque plan digest.

The two retention candidates are required because the execution records and
continuity barrier are new server data classes. Treating them as existing
Missions or Proof data would misstate authority and leave deletion/restore
semantics implicit. `retention-policy.v1` and its schema remain byte-identical.

No `common.v2` is introduced. New `organizationId` properties reuse the bounded
identifier shape of `common.v1` by reference. Existing schemas and the
`tenant-private` classification token keep their current bytes and names.

## 4. Shared wire rules

Every candidate:

- uses JSON Schema 2020-12 with a canonical `contracts.libre-ai.fr` `$id`;
- rejects unknown properties at every object boundary;
- bounds every string, array and integer;
- represents absence intentionally with `null` only where the state machine
  requires an explicit empty predecessor or terminal reference;
- uses `organizationId` for the owning organization and a distinct opaque URN
  for every mission, plan, run, graph, step, attempt, invocation, decision,
  transfer, effect and emission identity;
- carries `schemaVersion` as a closed constant;
- carries no prompt, raw worker message, raw error, filesystem path, tool
  argument, secret, personal fixture or production identifier;
- uses ISO 8601 UTC timestamps and SHA-256 lowercase hexadecimal digests;
- uses RFC 8785 JCS over an explicitly named unsigned preimage;
- treats a reused one-shot identifier with a different digest as quarantine,
  never as a retry or overwrite.

Fixture identifiers are visibly synthetic and contain no personal data. Stable
business identifiers remain classified `tenant-private` in the existing
catalog vocabulary and never become operational-log attributes.

## 5. `execution-graph.v1`

The graph contains:

- `schemaVersion`, `id`, `organizationId`, `entryStepId`, `steps`, `edges`,
  `createdAt` and `graphDigest`;
- between 1 and 256 steps with unique `stepId` values;
- between 0 and 512 edges with unique `edgeId` values;
- step kinds `calculation`, `human-decision`, `external-effect` and `terminal`;
- one to sixteen closed `outcomeCodes` on each non-terminal step;
- no outcome and no outgoing edge on terminal steps;
- a retry policy containing `maximumAttempts` from 1 to 32 and a closed
  `retryableOutcomeCodes` subset;
- decision policy containing two to four choice identifiers, a required role,
  an expiry ceiling, a `no-response` outcome and request/response schema refs;
- effect policy containing one executor-profile digest and exactly one
  re-emission mode: `retry-with-executor-idempotency`,
  `retry-after-terminal-status-with-fencing` or `no-retry`.

Each edge binds one `fromStepId`, one declared `outcomeCode` and one
`toStepId`. The semantic verifier rejects duplicate identifiers, dangling
references, missing or duplicate routes, unreachable steps, steps unable to
reach a terminal, outgoing terminal edges and cycles. Declaration order never
breaks a tie. Exactly zero successors are selected at a terminal; exactly one
is selected for a known non-terminal result.

`graphDigest` is SHA-256 over the RFC 8785 serialization of the complete graph
without `graphDigest`. Array order is significant; producers must emit their
reviewed canonical order and may not sort after authorization.

## 6. `execution-plan-body.v2`

Plan v2 preserves the security meaning and bounds of v1 for acceptance
criteria, tools, filesystem, budgets, network, model egress, harness profile,
worker manifests and evidence destinations. It is a new major and therefore
does not modify or alias v1.

It additionally binds:

- `executionGraph` as `{ id, digest, mediaType }`;
- `organizationId` instead of introducing a second organization identity;
- `lineageMode` as `initial` or `successor`;
- for a successor, the predecessor run ID, predecessor plan digest, sealed
  revision, terminal-effect-inventory digest and execution-transfer ID;
- `requestedGeneration`, equal to 1 for an initial run and greater than 1 for a
  successor;
- decision schema refs and executor-profile refs used by graph steps.

`bodyDigest` is the SHA-256 RFC 8785 digest of the full body without
`bodyDigest`. The candidate schema makes initial and successor lineage shapes
mutually exclusive. Semantic vectors reject a graph ref, decision schema,
executor profile or organization that diverges from the graph authority.

## 7. Transfer and authorization

### `execution-transfer.v1`

Missions creates a transfer command with `id`, `organizationId`, `missionId`,
`predecessorRunId`, `predecessorPlanDigest`, `currentGeneration`,
`expectedRevision`, `successorPlanDigest`, `idempotencyKey`, `issuedAt`,
`expiresAt` and `transferDigest`.

The transfer is consumed once. A byte-identical replay is idempotent. A second
transfer from the same generation, a stale revision, a changed successor or a
divergent reuse of the transfer ID is refused. Orchestrator must serialize the
seal and concurrent effect reservations on the same canonical revision.

### `execution-authorization.v2`

Authorization v2 contains the existing Missions authorization evidence plus
`graphDigest`, `generation`, `lineageMode` and a nullable successor binding. A
successor binding contains `executionTransferId`, `executionTransferDigest`,
`predecessorRunId`, `predecessorPlanDigest`, `sealedRevision` and
`terminalEffectInventoryDigest`.

Initial authorization requires generation 1 and a null successor binding.
Successor authorization requires generation greater than 1 and the complete
binding. No authorization is valid while the predecessor inventory includes a
reserved, started or unknown effect.

## 8. Typed human decisions

`human-decision-request.v1` is owned by Missions. It binds the organization,
mission, run, plan and graph digests, step, attempt, request ID, request digest,
two to four mutually exclusive choices, consequence codes, required role,
expected mission revision, expiry, no-response rule and bounded classified
evidence references.

`human-decision-response.v1` binds the exact request ID and digest, one declared
choice ID, authorized actor reference, expected revision, idempotency key and
submission time. An optional free-text comment is never embedded: only a
classified evidence reference may be carried. The preauthorized `other` choice,
if present, can only select the closed `replan-required` outcome.

Expired, replaced, consumed, cross-organization, wrong-attempt, wrong-role and
stale-revision responses have distinct closed refusal codes. A response cannot
expand topology, capability, data, network, provider, budget or proof scope.

## 9. Invocation and external effects

`step-invocation.v1` binds `organizationId`, mission, plan and graph digests,
run, generation, step, attempt, worker invocation, cause-event digest, selected
edge when applicable, harness profile, worker manifest, remaining budgets and
a bounded input artifact ref. It carries no raw prompt or tool argument.

`effect-attestation.v1` binds effect and emission identities, request digest,
destination ref, step, attempt, worker invocation, active generation, executor
profile, fencing value or executor-idempotency evidence, observation status,
observation ref, timestamps, signing key, preimage digest and signature.

Closed observation statuses are `reserved`, `started`, `committed`,
`rejected-final`, `not-committed-final` and `state-unknown`. Only the three
terminal statuses can close the predecessor inventory. `state-unknown` creates
the continuity barrier and never authorizes re-emission.

One attempt may reserve at most one emission ID. The executor must atomically
consume the active emission at the point of effect or provide strictly
equivalent deduplication. `no-retry` does not waive that rule.

## 10. `orchestrator-event.v3`

Event v3 retains the causal chain and monotone budget arithmetic of v2 and adds
`graphDigest`, `generation`, `stepId`, nullable `attemptId`, nullable
`workerInvocationId`, nullable `selectedEdgeId`, a typed `cause` reference and
closed event payloads.

The event set covers graph activation, step authorization, invocation, result,
decision request/consumption, effect reservation/start/terminal/unknown,
predecessor seal, generation transfer, run blocking, quarantine and terminal
completion. Conditional schemas require exactly the identities relevant to an
event type and forbid all others.

The effect-continuity barrier is represented by content-free v3 events carrying
only organization, lineage, generation, closed state and lifecycle reference.
Raw request, destination and observation data remain referenced evidence. If
evidence expires before terminal reconciliation, a terminal administrative
refusal event closes the lineage without claiming commit or non-commit and
forbids a successor.

## 11. Closed semantic outcomes

The canonical vector envelope uses closed kebab-case outcomes grouped by
authority. The minimum set is:

- graph: `graph-valid`, `duplicate-step`, `duplicate-edge`, `entry-missing`,
  `dangling-edge`, `route-missing`, `route-ambiguous`, `unreachable-step`,
  `terminal-unreachable`, `terminal-has-outgoing-edge`, `cycle-forbidden`;
- causal: `event-valid`, `idempotent-duplicate`, `duplicate-divergent`,
  `identity-mismatch`, `generation-stale`, `sequence-invalid`,
  `previous-digest-mismatch`, `budget-decreased`,
  `budget-arithmetic-invalid`;
- decision: `decision-valid`, `request-expired`, `request-replaced`,
  `request-consumed`, `choice-unknown`, `actor-unauthorized`,
  `revision-stale`, `attempt-mismatch`, `organization-mismatch`;
- effect: `effect-valid`, `emission-duplicate`, `emission-divergent`,
  `second-emission-for-attempt`, `fencing-stale`, `executor-unqualified`,
  `effect-state-unknown`, `predecessor-effects-nonterminal`,
  `generation-consumed`, `lineage-administratively-closed`.

Operational errors expose only these codes and aggregate counters. They never
include identifiers, digests, paths, prompts, choices, comments or raw errors.

## 12. Retention, deletion and restore

`retention-policy-schema.v2` is a major successor of the immutable v1 schema.
It retains every existing owner, location, mode and trigger, then admits the
`agent-orchestrator` owner and the two new bounded data classes below.

`retention-policy.v2` reproduces every v1 rule without reinterpretation and
adds:

- `orchestrator-execution-record` — content-free canonical graph, generation,
  step, decision-consumption and effect-continuity state in PostgreSQL; fixed
  `P1Y` default retention, configurable only up to `P6Y`, with the effective
  value required to equal the owning mission record's effective retention;
- `execution-deletion-tombstone` — organization, mission and lineage digests,
  deletion generation and deletion timestamp only; fixed `P35D` retention from
  explicit deletion, equal to the maximum encrypted-backup lifetime.

Decision context, free-text comments, effect requests, destinations and raw
observations remain Proof/Artifact content governed by the existing
`proof-artifact` while-referenced rule. Content-free operational logs keep the
existing `P30D` rule. Neither existing rule is widened.

Deletion first removes referenced content and execution records, writes the
minimal tombstone, then makes the mission non-executable. Restore replays the
tombstone before any execution record. After `P35D`, every backup capable of
resurrecting the deleted state has expired, so the tombstone may expire too.
No executable lineage survives that point.

## 13. Canonical vectors and TDD

`contracts/fixtures/authorized-execution-v1/` contains bounded, public,
synthetic documents:

- schema-positive and mutation-negative fixtures for every candidate;
- RFC 8785 digest vectors for graph, plan, transfer, authorization, request,
  response, invocation, attestation and event preimages;
- topology vectors for reachability, cycles and total closed routing;
- causal vectors for identity, sequence, predecessor digest and budgets;
- decision vectors for stale, duplicate, cross-organization and wrong-attempt
  answers;
- effect and lineage vectors for duplicate delivery, reservation concurrent
  with sealing, old-run replay, two successors from one generation, two
  emissions in one attempt, unknown effect, proof deletion and restore;
- retention vectors proving v1-rule preservation, execution-record alignment
  with mission retention, tombstone lifetime and tombstone-first restore.

Authoring follows strict red-green cycles. Each semantic rule first appears as
a failing vector/checker test, fails for the named reason, then receives the
minimum checker implementation. Generated TypeScript declarations and Rust
types are exempt from hand-authored RED because they are mechanical outputs;
their byte-drift gates and cross-language fixture suites are the executable
proof.

The contracts checker validates boundedness, schema coverage, fixture
references, exact expected outcome codes and digest reproducibility. SDK tests
independently validate every schema fixture and reproduce every digest from the
pinned candidate revision. Phase 3 does not implement the Orchestrator state
machine; Phase 4 must independently consume the semantic vectors.

## 14. Review and promotion gates

All eleven catalog entries are `candidate`, `major-versioned` and require
architecture, security and privacy review in one shared dossier. Reviews run as
separate review-only passes against an immutable authoring commit.

- Architecture challenges authority uniqueness, schema decomposition,
  determinism, causal replay, compatibility and rollback.
- Security challenges graph substitution, replay, concurrency, one-shot
  identity reuse, fencing, injection and fail-closed unknown states.
- Privacy challenges identifier placement, decision/effect data minimization,
  operational logging, retention, deletion and non-resurrection.

Every Blocking or Major finding changes the candidate and invalidates affected
verdicts. Final review records may be committed after the reviewed candidate
commit, but must name its exact SHA and prove the reviewed contract tree is
unchanged.

Promotion to `locked` is not part of Phase 3 authoring. It requires all local
and remote gates green, an explicit lock review over the final candidate SHA
and a new owner decision. No producer, runtime, API route or deployment may use
candidate status as authorization.

## 15. Sovereignty and dependency policy

No dependency is added. Contract validation continues to use the existing
open-source AJV toolchain; Rust projections continue to use the existing
offline embedded-schema toolchain. No managed service, telemetry endpoint,
external checkpoint store, US hyperscaler or runtime network access is
introduced.

LangGraph, LangChain, LangSmith and Agent Server remain research inputs only.
No name, type, serializer, checkpoint or API from those projects appears in a
canonical contract or disposable SDK projection.

## 16. Delivery sequence

1. Record Phase 3 opening and commit this reviewed design in Governance.
2. Write and commit the cross-repository implementation plan.
3. Create isolated worktrees for Contracts, SDK TypeScript and SDK Rust.
4. Author contract tests and vectors first, then the eleven candidate authorities,
   semantics, catalog entries and checker support.
5. Commit the immutable candidate authority revision.
6. Pin both SDKs to that revision, regenerate disposable projections and make
   independent schema/digest suites green.
7. Run role-separated architecture, security and privacy reviews against the
   exact cross-repository candidate set; remediate and rerun affected reviews.
8. Record the final verdicts, rerun every local gate and publish the feature
   branches without bypassing review protections.
9. Require every feature-branch CI to be green before merging; then verify the
   post-merge checks on each exact default-branch SHA.
10. Stop at the separate Specification Lock owner gate.

## 17. Acceptance criteria

Phase 3 authoring is complete when:

- all existing locked contract files are byte-identical to their pre-Phase-3
  revision;
- eleven strict candidates are cataloged and have positive/negative fixtures;
- every graph, identity, decision, retry, effect and lineage rule above has an
  executable vector with a closed expected outcome;
- all nine execution-protocol RFC 8785 preimages reproduce the expected SHA-256 digest;
- TypeScript and Rust projections are generated from one exact authority SHA
  and validate the same fixture corpus;
- execution records share the owning mission's effective retention, deletion
  tombstones survive every eligible backup, and restore cannot resurrect a
  deleted lineage;
- no runtime repository or dependency changed;
- architecture, security and privacy reviews approve one immutable candidate
  set with no open Blocking or Major finding;
- local gates and remote CI are green in Governance, Contracts and both SDKs;
- candidate status is explicit everywhere and no Specification Lock is
  claimed.

## 18. Rollback and non-objectives

Before promotion, rollback removes the four feature branches or reverts their
additive commits. No deployed code, database, mission, artifact or runtime state
requires migration.

Out of scope:

- parallel branches, fan-in, branch quorum and child budgets;
- cycles, subgraphs, dynamic replanning, time travel and long-term memory;
- graph UI, worker raw streaming and prompt/message contracts;
- runtime persistence, processes, filesystem, network, provider, secret or real
  organization data;
- LangGraph compatibility or feature parity;
- implementation in Missions, Orchestrator, Harness or Proof/Artifact;
- candidate promotion or release.
