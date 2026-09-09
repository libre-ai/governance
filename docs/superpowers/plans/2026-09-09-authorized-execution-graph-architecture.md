# Authorized Execution Graph Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:executing-plans to execute this plan task by task. The owner gate
> in Task 4 is a hard stop and cannot be inferred from an earlier programme
> approval.

**Goal:** Decide whether Libre AI admits a bounded authorized execution graph,
and, if admitted, freeze its authority split and first-increment boundary before
any contract or runtime implementation.

**Architecture:** Missions authorizes the digest of the complete execution plan
and graph. Orchestrator owns the canonical graph state and deterministic
transitions. Harness revalidates each invocation and records bounded effect
observations. Proof/Artifact owns classified evidence. Workers remain opaque and
replaceable. The first increment is sequential and single-ready-step: closed
branching, retries, typed human decisions and the external-effect crash window
are in scope; fan-out/fan-in, subgraphs, long-term memory, time travel, graph UI
and runtime framework dependencies are refused.

**Tech Stack:** Markdown doctrine, existing Governance Bun quality gates.

**Spec:**
`docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md`

**Prerequisite:** ADR-0032 and the non-normative Orchestrator catalogue are
accepted on `main`, with DCO and remote CI green.

## Global constraints

- Security > quality > performance > completeness.
- No existing Specification Lock byte is changed in this increment.
- No contract schema, SDK projection, runtime source, dependency or lockfile is
  added before the owner gate.
- No LangGraph, LangChain or LangSmith name or type enters a candidate canonical
  surface.
- Operational logs contain only closed codes and ephemeral correlation; stable
  execution identities remain tenant-private business records.
- The proposed ADR must make rollback trivial: before contract promotion it is
  a doctrine-only revert with no data or runtime migration.

---

### Task 1: Write the proposed architecture act

**Repository:** `libre-ai/governance`

**Files:**

- Create: `docs/adr/0034-authorized-execution-graph-boundary.md`

**Produces:** a proposed ADR, not an accepted decision, contract lock or runtime
authorization.

- [ ] **Step 1: Record the scope and authority map**

State that Missions authorizes the complete graph digest, Orchestrator owns
canonical transitions, Harness revalidates invocations and reports effect
observations, Proof/Artifact owns evidence, and workers own no canonical state.

- [ ] **Step 2: Choose the bounded first graph**

Admit a finite, deterministic, single-ready-step graph with one entry, explicit
terminal nodes and closed outcome edges. Reject fan-out/fan-in, subgraphs and
graph cycles in `execution-graph.v1`; retries are explicit attempts governed by
node policy, never hidden cycles. Unknown or ambiguous routing blocks with a
closed reason.

- [ ] **Step 3: Decide retry and effect semantics**

Bind `runId`, `stepId`, `attemptId`, `workerInvocationId` and `effectId` to the
authorized plan digest. A retry creates a new attempt but cannot restore budget.
Effectful retries require executor-enforced idempotency or authoritative status
lookup. `EffectStateUnknown` blocks; absence of a commit record never proves the
effect absent. Harness evidence informs Orchestrator but cannot self-authorize a
transition.

- [ ] **Step 4: Decide typed human interruption semantics**

Missions owns decision requests and answers. Requests bind organization,
mission, run, plan digest, step, attempt, request digest, allowed choices,
required role, expected revision and expiry. Stale, duplicate, cross-tenant,
wrong-attempt and free-form capability expansion are refused. Resume restores no
budget and consumes only an authoritative Missions decision record.

- [ ] **Step 5: Record versioning and closed scope**

Name the Phase 3 candidate families without locking their bytes:
`execution-graph.v1`, `execution-plan-body.v2`, `orchestrator-event.v3`, typed
decision request/answer, step invocation and effect attestation. Preserve all
existing major-versioned locks byte-for-byte. Explicitly exclude runtime code,
parallel joins, subgraphs, long-term memory, time travel, graph UI, streaming
expansion and all LangGraph runtime dependencies.

- [ ] **Step 6: Verify the proposal**

Run:

```bash
git diff --check
bun run check
```

Expected: exit 0; no warning names a changed file.

- [ ] **Step 7: Commit the proposed ADR**

```bash
git add docs/adr/0034-authorized-execution-graph-boundary.md
git commit -s -m "docs: propose authorized execution graph boundary"
```

---

### Task 2: Obtain role-separated technical verdicts

**Repository:** `libre-ai/governance`

**Files:**

- Create after each immutable pass:
  `docs/reviews/authorized-execution-graph/proposal-architecture.md`
- Create after each immutable pass:
  `docs/reviews/authorized-execution-graph/proposal-security.md`
- Create after each immutable pass:
  `docs/reviews/authorized-execution-graph/proposal-privacy.md`

- [ ] **Step 1: Architecture pass**

Challenge authority uniqueness, determinism, versioning, lock preservation,
scope exclusions, rollback and whether the sequential v1 can later coexist with
a separately authorized parallel major without reinterpretation.

- [ ] **Step 2: Security pass**

Challenge graph substitution, hidden topology, replay, duplicate workers,
stale decisions, cross-organization access, ambiguous external effects,
budget-reset paths, injection and raw diagnostic reflection.

- [ ] **Step 3: Privacy and sovereignty pass**

Challenge identity placement, log/OTEL exclusion, decision-context
minimization, evidence retention/deletion/restore, worker checkpoint opacity and
absence of managed or non-sovereign service dependencies.

- [ ] **Step 4: Remediate every Blocking or Major finding**

Any changed proposal receives a new commit and all affected role passes are
rerun on the exact new SHA. Rejected verdicts remain immutable historical
records.

- [ ] **Step 5: Record final verdicts and rerun the full gate**

Commit the three review records with an author-matching DCO sign-off, then run:

```bash
git diff --check
bun run check
```

Expected: all final verdicts approve with no open Blocking or Major finding;
the full gate exits 0.

---

### Task 3: Restitute the exact owner decision

**Repository:** none; hard decision point.

- [ ] **Step 1: Present the decision inline**

Restitute in 2–4 lines what changes: a sequential authorized graph becomes an
approved future contract direction, while existing locks and all runtime remain
closed. Include the exact proposed ADR SHA, review verdicts and source lines.

- [ ] **Step 2: Present mutually exclusive choices**

1. Accept the proposed architecture and authorize the doctrine updates in Task
   4; contracts remain a separate Phase 3 gate.
2. Reject the authorized graph and retain the existing flat-plan lock.
3. Return the proposal for named changes; no downstream work starts.

- [ ] **Step 3: Hard stop**

Do not infer acceptance from the programme design approval or from `go all`.
Only the owner's explicit selection of option 1 authorizes Task 4.

---

### Task 4: Ratify doctrine after explicit owner acceptance

**Repository:** `libre-ai/governance`

**Files:**

- Modify: `docs/adr/0034-authorized-execution-graph-boundary.md`
- Modify: `docs/rfcs/0001-agent-orchestration-option-b.md`
- Modify:
  `docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md`
- Modify: `docs/decisions/DECISION-REGISTER.md`

- [ ] **Step 1: Mark the ADR accepted**

Record the exact owner arbitration date and the reviewed proposal SHA. State
that acceptance authorizes contract design only, not a Specification Lock or
runtime capability.

- [ ] **Step 2: Amend RFC-0001 prospectively**

Add the bounded sequential graph authority map and candidate contract families.
Do not alter the status or bytes of the existing 14 locked authorities.

- [ ] **Step 3: Update the programme design status**

Record Phase 2 acceptance while preserving Phase 3's independent contract and
lock gates.

- [ ] **Step 4: Add decision-register entry D40**

Record the bounded authorized graph, single-ready-step v1, closed retry/effect
and typed-decision rules, explicit exclusions and separate future lock gate.
Do not create a new invariant unless a role review proves D40 is not carried by
I-03, I-18, I-19 and ADR-0032.

- [ ] **Step 5: Verify and commit ratification**

Run:

```bash
git diff --check
bun run check
```

Then commit with:

```bash
git commit -s -m "docs: ratify authorized execution graph boundary"
```

Expected: Governance CI is green and Phase 3 remains unopened until its own
written cross-repository contract plan.
