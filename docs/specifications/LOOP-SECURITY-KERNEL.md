# Loop-security kernel lock (K1–K5)

- **Status:** socle specification of the loop-security kernel — realizes
  invariant **I-18** (ADR-0009 §6). Consumes the control-plane input
  `constantin-jais/constantin-jais:ecosystem/specs/shared/loop-security-kernel.md`.
- **Authority:** this document **specifies** the five loop-security controls at
  the socle and is the **entry gate of wave 3**. Per EXECUTION-SEQUENCING §8, the
  kernel is "specified and ready to lock the orchestrator lock": the
  specification is complete and faithful here, and two controls **complete at
  the orchestrator lock**, not before it — see the status table and the
  enforcement boundary. The orchestrator Specification Lock cannot open real
  agent execution until this kernel is specified here **and** the owner
  pronounces that lock.
- **Nature:** these are guardrails (I-17 human-touch surface). Establishing and
  mutating them is an owner-touch act; this specification is pronounced by the
  owner at the wave-3 gate, not auto-merged.

The self-feeding agent loop is the product zero. A loop that feeds on its own
operational output can poison itself: operational data is untrusted content, and
the agents that improve the tools are the agents those tools govern. K1–K5 close
that hole. Each control names its **requirement**, its **socle realization**, and
its **enforcement**.

### State vocabulary (normative)

- **in service** — realized and enforced today by a merged brick or gate.
- **reviewed** — implemented, independently reviewed clean; a bounded follow-up
  (a contract promotion) completes it, named explicitly.
- **specified** — fully and faithfully specified here; its **integration** is an
  explicit step of the orchestrator lock (not a gap in this specification).

A control being `reviewed` or `specified` rather than `in service` is **not** an
omission: EXECUTION-SEQUENCING §8 distinguishes "specified and ready to lock"
(this document) from the orchestrator lock pronouncement (the porte-V3 owner
act). The two controls that complete at the orchestrator lock are named in the
status table.

## K1 — Agent identity (the absent lock)

**Requirement.** The G1 identity lock (`IDENTITY-AUTHORIZATION.md`) covers humans
and browser sessions, never agent fleets. The kernel adds an agent identity
taxonomy expressed as locked Biscuit facts:

- `agent_fleet(agent_id, fleet)` — every agent belongs to exactly one fleet
  (e.g. `forge`, `product-ops`);
- `mission_agent(agent_id, mission_id)` — an agent operates within one mission;
  cross-mission operation is denied by an authorizer `check if`;
- `capability_scope(agent_id, capability_set)` — an explicit permission vector
  (which tools, which write paths; never CI/gates by default);
- revocation is **per `agent_id`**, not per token: a revoked agent issues no new
  tokens; the revocation store fails closed (unavailable ⇒ deny), consistent
  with the G1 Biscuit doctrine.

**Socle realization.** The Biscuit issuance/attenuation/revocation machinery is
locked (`WP-G2-Z01`, `crates/authz-biscuit`, `IDENTITY-AUTHORIZATION.md` Biscuit
authority). This lock **extends** it with the three agent facts and per-agent
revocation, to be added to the authority template
`contracts/authz/authority-v1.datalog` at the orchestrator lock.

**Enforcement.** Deny-by-default authorizer; cross-mission and out-of-scope
operations refused; revocation fail-closed. No agent token grants CI/gate write
by default.

## K2 — Data reliability classification

**Requirement.** Every payload carries `reliability ∈ {authoritative, derived,
operational}` at capture. Operational data (tool outputs, APIs, web, git logs)
is **never** authority; no write to a source of truth (doctrine, gates,
revocation list, permission vocabulary, contracts) may be justified by
operational data alone.

**Socle realization.** `@libre-ai/classification` (this wave): sealed, frozen
`classify` / `deriveFrom`; `requireAuthorityFor` fails closed unless the payload
is a sealed authoritative one; derivation cannot launder operational data into
authority. Independent review CLEAN (`docs/reviews/classification-v1/`).

**Enforcement.** Any source-of-truth write path calls `requireAuthorityFor`;
forged or deserialized payloads fail closed (not sealed).

## K3 — Envelope integrity

**Requirement.** Every recalled untrusted payload carries an integrity-signed
envelope (escape + `trusted:false` tag + label + verifiable signature), so a
stripped or altered envelope is detectable. A surface that re-serializes recalled
data re-applies the envelope; it is never left to caller discipline.

**Socle realization.** `@libre-ai/envelope` (this wave): `wrapUntrusted` /
`verifyEnvelope` / `renderGuarded`, HMAC over a length-prefixed canonical
serialization, constant-time verify, provable delimiter escaping. Contract
`envelope.v1` (candidate → locked on the first dogfooding consumer). Independent
review: security APPROVE, crypto APPROVE (`docs/reviews/envelope-v1/`). Honest
limit: a mitigation, not enforcement — it sits alongside planning-only and
refusal-first, not instead of them.

**Enforcement.** Every model-facing recall path wraps via `wrapUntrusted` and
renders via `renderGuarded` (which verifies first). The Ed25519 origin-signature
upgrade is deferred (WP-G2-Z01 key ceremony).

## K4 — Layer-3 and guardrail mutations

**Requirement.** Writes to layer-3 bricks (envelope patterns, memory schema,
provenance contracts, proof format) and to guardrails (CI workflows, the
invariants register, the revocation list) require, in order: human review, a
signature attesting the approving decision-log entry, and a bounded rollback
point. **No auto-merge on these paths.**

**Socle realization.** `.github/CODEOWNERS` on the sensitive lanes plus the
`Doctrine governance` gate; the run's autonomous-merge authorization explicitly
**excludes** these guardrail paths — they remain owner-touch (I-17). The
independent-review protocol (`docs/reviews/AGENT-REVIEW-PROTOCOL.md`, K4:
implementer ≠ reviewer) is the review mechanism, exercised on every couche-3
brick (envelope, classification).

**Enforcement.** CODEOWNERS + doctrine gate block a guardrail change without the
attested review; tool-state retrieval that feeds such a mutation uses DNS-pinned
transport (control-plane E10) with a timestamped signature; a DNS/data mismatch
aborts.

## K5 — Immutable register in production

**Requirement.** The invariants register is mutable only by reviewed pull
request; no loop mutates it in production. This is the structural guarantee
behind "no loop modifies its own guardrails."

**Socle realization.** `docs/decisions/INVARIANTS.md` under the human-touch
surface (I-17: extensible only by ADR), protected `main` with required checks,
the `Doctrine governance` gate (unique ADR numbering, mandatory Arbitrage line,
resolved citations, retired-brand deny-list).

**Enforcement.** No agent path writes `INVARIANTS.md` outside a reviewed PR;
`main` protection + required gates are the structural backstop.

## Enforcement boundary (wave-3 entry gate)

K1–K5 are the entry gate of wave 3 (`docs/transformation/EXECUTION-SEQUENCING.md`):
the orchestrator lock cannot open real agent execution until this kernel is
specified here and the owner pronounces the orchestrator Specification Lock
(ADR-0011 D3, a permanent nominative hard stop). Dogfooding-first applies: the
forge itself is the first system these controls govern, and its evidence of
doing so is published (I-20).

**Two controls complete at the orchestrator lock, by design, not as a gap here:**

- **K1** — the agent identity **facts** (`agent_fleet`, `mission_agent`,
  `capability_scope`) and per-agent revocation are specified above; their
  **integration** into the Biscuit authority template
  (`contracts/authz/authority-v1.datalog`) and authorizer `check if` clauses is
  an explicit chapter of the orchestrator Specification Lock — that lock is what
  opens real agent execution, so the facts land with it.
- **K3** — the `envelope.v1` contract is reviewed and merged as a candidate; its
  promotion to `locked` is gated on the first forge/harness dogfooding consumer
  (E22: reference-only until a consumer exists), which arrives with the
  orchestrator lock's memory recall.

K2, K4 and K5 are `in service` today. The kernel is therefore **specified and
ready to lock** (§8): the orchestrator-lock owner act consumes this document,
integrates K1's facts and promotes K3, then opens wave 3.

## Status of the five controls at this lock

| Control                | Socle brick / mechanism                                      | State                                                                       |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| K1 agent identity      | Biscuit (Z01) + the three agent facts + per-agent revocation | **specified** — facts integrate into the datalog at the orchestrator lock   |
| K2 classification      | `@libre-ai/classification`                                   | **in service** — sealed authority gate, reviewed CLEAN                      |
| K3 envelope            | `@libre-ai/envelope` (`envelope.v1` candidate)               | **reviewed** — contract promotes to locked on the first dogfooding consumer |
| K4 guardrail mutations | CODEOWNERS + doctrine gate + independent review              | **in service**                                                              |
| K5 immutable register  | `INVARIANTS.md` + main protection + doctrine gate            | **in service**                                                              |
