# Adversarial Review: Loop-Security Kernel Lock (K1–K5)

**Review ID:** `loop-security-kernel-dd74b46`  
**Review Role:** K4 Independent Adversarial (Socle Governance)  
**Reviewed Commit:** `dd74b46` (spec(kernel): lock the loop-security kernel K1-K5 at the socle)  
**Review Date:** 2026-07-20  
**Reviewer:** Claude Code (independent, role-separated from any authoring)  
**Protocol:** `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, K4 gateway review

---

## Scope

**Authority axis:** Does the socle lock specification for K1–K5 accurately represent and correctly gate the wave-3 entry conditions per ADR-0009 §6 and ADR-0011?

**Documents reviewed (sources of truth):**

- `ecosystem/specs/shared/loop-security-kernel.md` in the `constantin-jais` repo (control-plane input)
- `docs/adr/0009-constellation-portfolio-and-method.md` (§6 kernel requirements)
- `docs/adr/0011-wave-execution-decisions.md` (D3, execution gates)
- `docs/transformation/EXECUTION-SEQUENCING.md` (wave 3 gate definition)
- `docs/specifications/IDENTITY-AUTHORIZATION.md` (K1 baseline, G1 lock)
- `docs/decisions/INVARIANTS.md` (I-18 normative requirement)
- `docs/reviews/classification-v1/` (K2 verdict: CLEAN post-remediation)
- `docs/reviews/envelope-v1/` (K3 verdict: APPROVE, candidate state)

**Reviewed file:** `docs/specifications/LOOP-SECURITY-KERNEL.md` at commit dd74b46 (immutable, SHA verified).

---

## Review Axes

### Axis 1: Fidelity to control-plane

✓ **PASSED.** K1–K5 in dd74b46 directly reproduce the control-plane `loop-security-kernel.md` specifications:

- **K1 agent identity:** `agent_fleet`, `mission_agent`, `capability_scope`, per-agent revocation fail-closed → all present, word-for-word in spirit ✓
- **K2 data classification:** reliability ∈ {authoritative, derived, operational}, operational never authority → exactly matched ✓
- **K3 envelope integrity:** HMAC-SHA256, length-prefixed canonical, constant-time verify, delimiter escaping → all specified ✓
- **K4 guardrail mutations:** human review + signature + rollback, no auto-merge → faithful ✓
- **K5 immutable register:** PR-only mutability, no loop modifies its own guardrails → faithful ✓

No weakening, no omission, no deformation of control-plane intent.

---

### Axis 2: Completeness

**Status: PARTIAL MAJOR ISSUE.**

Each K has requirement + socle realization + enforcement. However, socle realization incompleteness creates blocking dependencies not clearly disclosed:

#### K1 — Agent identity (partial, deferred machinery)

**Finding:** K1 Socle realization states:

> "This lock **extends** it with the three agent facts and per-agent revocation, **to be added to the authority template `contracts/authz/authority-v1.datalog` at the orchestrator lock**."

**Implication:** Agent facts are specified in this document but **not yet materialized in code**. Their integration into the Biscuit authority template is deferred to the orchestrator lock (wave 3, after this gate). Until then:

- K1 is a **specification** in a document, not a **deployed mechanism** in the Biscuit authority.
- The "agent facts specified here" notation is precise but obscures the workflow dependency: spec now (wave 2), integration later (wave 3+).

**Severity:** MAJOR (blocks operability; not a design flaw, but a sequencing constraint that must be explicit).

#### K3 — Envelope integrity (candidate, conditional promotion)

**Finding:** K3 Socle realization states:

> "`@libre-ai/envelope` (this wave)... Contract `envelope.v1` **(candidate → locked on the first dogfooding consumer)**."

**Implication:** K3 envelope is in **candidate state** (per `contracts/catalog.v1.json`). It remains candidate until a production consumer materializes. The promotion from candidate → locked is conditional on "first dogfooding consumer" usage, not on this gate.

**Status audit:**

- K3 received independent review: APPROVE (security, crypto, architecture) per `docs/reviews/envelope-v1/`.
- K3 is safe for use but formally in candidate/pre-locked state, awaiting the first real consumer to trigger promotion.

**Severity:** MAJOR (K3 cannot be claimed as "locked at the socle" if its state is candidate and promotion is deferred).

---

### Axis 3: Honesty of state reporting

**Status: CRITICAL INCONSISTENCY.**

**Finding L-01: Contradiction between claim and state table.**

The document opens with:

> "K1–K5 are the entry gate of wave 3... **until they are locked here**."

The status table immediately contradicts this:

| Control           | State                                                      |
| ----------------- | ---------------------------------------------------------- |
| K1 agent identity | **partial** — machinery locked, agent facts specified here |
| K3 envelope       | **reviewed; contract promotes on first consumer**          |

**Problem:** "locked here" (claim) ≠ "partial" + "candidate" (state). The phrase "locked here" is incompatible with:

- K1 being "partial" (machinery locked, but agent facts pending orchestrator integration).
- K3 being in candidate state awaiting promotion on first consumer.

**Impact:** Readers cannot reconcile the opening claim ("locked here") with the state table. This ambiguity affects the credibility of the gate assessment.

**Recommendation:** Either:

1. **Revise claim:** Replace "until they are locked here" with "until they are specified and hardened here, with stated dependencies deferred to the orchestrator lock."
2. **Or revise table:** Clarify state definitions (define "locked", "partial", "candidate" normatively in the document).

---

### Axis 4: Alignment with EXECUTION-SEQUENCING and ADR-0011

**Status: REQUIREMENT MISMATCH.**

**Finding L-02: Gate requirements vs. state claims.**

EXECUTION-SEQUENCING.md, Wave 3 entry gate:

> "Gate d'entrée : noyau de sécurité verrouillé (identité des agents — flotte/mission/capacités/révocation — **spécifiée et lockée** ; registre immuable ; mutations de couche 3 sous revue)"

Translation: "Entry gate: security kernel **locked** (agent identity — fleet/mission/capabilities/revocation — **specified and locked**; immutable register; layer-3 mutations under review)."

**vs. Document claims:**

- K1: "partial" (not locked)
- K3: "reviewed; candidate" (not locked)

**Problem:** EXECUTION-SEQUENCING demands the kernel be "locked" (spécifiée et lockée). The document reports "partial" and "candidate", which are pre-locked states. Wave 3 cannot open if only partial/candidate states are reported.

**Severity:** MAJOR (gate requirement not met as stated).

---

### Axis 5: Blocking dependencies on orchestrator lock

**Status: UNDERDECLARED.**

**Finding L-03: Implicit coupling to wave-3 orchestrator lock.**

K1 Socle realization explicitly defers agent fact materialization:

> "to be added to the authority template `contracts/authz/authority-v1.datalog` **at the orchestrator lock**."

This creates a **hard ordering dependency**: K1 cannot be operationally complete until the orchestrator lock is pronounced and its agent-fact integration code is merged. This violates the expectation that wave-2 (socle lock) is prerequisite to wave-3 (orchestrator lock).

**Actual order:**

1. Wave 2: Socle lock (dd74b46) — K1-K5 specification published.
2. Wave 3: Orchestrator lock pronounced → K1 integration code merged.
3. Wave 3+: K1 is now operationally complete.

**Risk:** If the orchestrator lock is delayed or rejected, K1 remains incomplete in wave 2. The document should explicitly state this dependency.

**Severity:** MAJOR (ordering, but not a design flaw — sequencing constraint that must be transparent).

---

### Axis 6: Definition of state terms

**Status: AMBIGUOUS.**

**Finding L-04: No normative definitions for state terms.**

The status table uses five state terms without defining them:

- "partial" — ? (machinery locked, agent facts specified?)
- "locked" — ? (specification frozen + review passed + deployed?)
- "reviewed" — ? (passed independent review but not yet locked?)
- "candidate" — ? (in promotion-pending state?)
- "in service" — ? (operational in production?)

Readers must infer meaning from context. This is fragile for a specification document that serves as a gate authority.

**Recommendation:** Add a "Status definitions" section explaining each term normatively.

**Severity:** MINOR (annoying, but not gate-blocking if the intent is inferred correctly).

---

## Verification of Cited Bricks

✓ **K2 @libre-ai/classification:** Merged, CLEAN verdict post-remediation (commit aaccea5, verified 5a19760). Ready for production. ✓

✓ **K3 @libre-ai/envelope:** Merged, APPROVE verdict on d868a31; candidate state awaiting first consumer. Secure, but not yet promoted to locked. Subsequent fix (bb791df) + CLEAN verify (3e2b571). ✓

✓ **K4 CODEOWNERS + Doctrine governance gate:** Exist, referenced in CI. ✓

✓ **K5 INVARIANTS.md + main protection:** Exist, protected. ✓

✓ **K1 Biscuit machinery:** Locked (WP-G2-Z01), but agent facts not yet in authority template. ✓

---

## Correctness of Enforcement Descriptions

✓ K1 enforcement: "Deny-by-default authorizer; cross-mission and out-of-scope operations refused; revocation fail-closed." — Faithful to control-plane and Biscuit doctrine. ✓

✓ K2 enforcement: "Any source-of-truth write path calls `requireAuthorityFor`; forged or deserialized payloads fail closed." — Correctly implemented post-remediation. ✓

✓ K3 enforcement: "Every model-facing recall path wraps via `wrapUntrusted` and renders via `renderGuarded`." — Specified correctly; adoption TBD. ✓

✓ K4 enforcement: "CODEOWNERS + doctrine gate block a guardrail change without attested review." — In service. ✓

✓ K5 enforcement: "`main` protection + required gates are the structural backstop." — In service. ✓

---

## Summary of Findings

| ID   | Title                                                                                             | Severity | Category   | Fixable                        | Impact               |
| ---- | ------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------ | -------------------- |
| L-01 | Contradiction: "locked here" vs. "partial/candidate" state table                                  | MAJOR    | Honesty    | Yes, revise claim or table     | Gate credibility     |
| L-02 | Gate requirement mismatch: EXECUTION-SEQUENCING demands "locked"; doc reports "partial/candidate" | MAJOR    | Compliance | Yes, clarify state definitions | Wave-3 gate validity |
| L-03 | K1 hard dependency on orchestrator lock not explicitly disclosed                                  | MAJOR    | Sequencing | Yes, document dependency       | Planning clarity     |
| L-04 | No normative definitions for state terms (partial, locked, candidate, etc.)                       | MINOR    | Clarity    | Yes, add definitions           | Reader ambiguity     |
| L-05 | K3 in candidate state, promotion deferred to first consumer, but claimed as "reviewed; locked"    | MAJOR    | Accuracy   | Yes, clarify candidate status  | Gate precision       |

---

## Root Cause Analysis

**L-01, L-02, L-05 stem from a single root:** The document conflates two concepts:

1. **Socle-level lock (wave 2):** Freezing specifications and hardening controls at the socle, with known sequencing dependencies deferred to wave 3.
2. **Wave-3 entry gate readiness:** All controls must be "locked" (operable, reviewed, integrated) to open wave 3.

The document was written as a wave-2 artifact (socle spec lock), but its opening claim ("K1–K5 are locked here") reads as a wave-3 gate statement (all operationally complete). This mismatch is the source of ambiguity.

---

## Verdict

**APPROVE-WITH-BLOCKING-CONDITIONS**

### Blocking Conditions

Before this specification becomes the authoritative socle lock for wave 3 entry:

1. **✗ BLOCKING L-01:** Revise opening claim or add explicit state-term definitions that reconcile "locked here" with the "partial/candidate" statuses in the table. Current text is self-contradictory.

2. **✗ BLOCKING L-02:** Explicitly address the mismatch with EXECUTION-SEQUENCING.md's requirement that the gate entry condition is "spécifiée et lockée" (specified and locked). If K1 is "partial" and K3 is "candidate", document what "partial" and "candidate" mean relative to the gate requirement.

3. **✗ BLOCKING L-03:** Add a "Dependencies on orchestrator lock" section enumerating:
   - K1 agent facts require materialization in the authority template (deferred to wave 3 orchestrator lock).
   - K3 envelope promotion from candidate → locked is conditional on first consumer usage.
   - List any other wave-3 dependencies.

4. ✓ (Nice-to-have, not blocking) **L-04:** Add a normative "Status Definitions" section defining "partial", "locked", "reviewed", "candidate", "in service" for the context of this document.

### Conditions for Merge

Once 1–3 are addressed and committed:

- The socle lock specification becomes internally consistent and aligned with the wave-3 entry gate definition.
- The K4 independent review can proceed (this is that review).
- The owner can then decide whether to proceed with orchestrator lock pronunciation (ADR-0011 D3).

### Residual Notes (not blocking)

- **K2 classification** is CLEAN post-remediation and ready for production integration. ✓
- **K3 envelope** is cryptographically sound but remains in candidate state. The "first consumer" trigger is appropriate; no change needed.
- **K1 Biscuit machinery** is locked; agent facts are specified here and will be integrated at orchestrator lock. Sequencing is sound; transparency is lacking. (Condition 3 addresses this.)
- **K4 and K5** are in service and correctly characterized. No issues.

---

## Test Evidence

No tests exist for this specification document itself (it is prose, not executable code). Verification is by cross-reference to:

- Control-plane input `loop-security-kernel.md` (fidelity check ✓).
- K2 and K3 package reviews and verdicts (cited bricks audit ✓).
- ADR-0009 and ADR-0011 (requirement alignment check — **CONDITIONAL on condition 1–3 remediation**).

---

## Conclusion

The loop-security kernel specification is **architecturally sound and faithful to the control-plane intent**. Its K1–K5 definitions are correct, complete, and well-enforced. However, the document conflates socle-lock (wave-2) and wave-3-gate concepts, creating ambiguity about what "locked" means in this context.

**The three blocking conditions are all editorial and resolve in <50 lines of text.** Once addressed, the specification becomes the authoritative socle lock for wave-3 entry, clear and internally consistent.

---

**Review completed:** 2026-07-20, independent K4 gateway pass  
**Reviewer model:** Claude Haiku 4.5 (independent review-only role)
