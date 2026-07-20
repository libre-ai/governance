# Authority v2 — candidate contract review package (K1 agent identity)

- **Status:** candidate, pending independent agent review.
- **Protocol:** `docs/reviews/AGENT-REVIEW-PROTOCOL.md` — role-scoped review passes
  by agents launched **separately** from the implementer (K4).
- **Required independent reviews:** architecture, security.
- **Subject:** `contracts/authz/authority-v2.datalog`.

## What this is (loop-security kernel K1, realized at the wave-3 lock)

The G1 authority template (`authority-v1.datalog`) binds `user`, `tenant`,
`role` and expiry — humans and browser sessions. It never expressed agent-fleet
identity. The wave-3 orchestrator lock (pronounced) opens real agent execution;
`authority-v2` extends the template with the K1 agent identity taxonomy:

- `agent_fleet(agent, fleet)` — every agent belongs to exactly one fleet;
- `capability_scope(agent, capability)` — the explicit permission vector (which
  tools, which write paths; never CI/gates by default);
- `check if agent_fleet($agent, $fleet)` — an agent token must carry its
  identity, or it has no authority.

Enforcement, stated with its timing (do not conflate confirmed with deferred):
per-agent_id revocation (fail-closed) **is enforced today** by the no-`token_id`
gate; cross-fleet / cross-mission deny **will be enforced** by the `agent-runs v2`
authorizer and the `authz-biscuit` crate wiring (**deferred**, not yet in force,
tracked in `STATUS.md` — see "Known gap" below). Mission binding is carried by
`token_mission` in the authorizer (per-token operating mission), distinct from the
`mission_agent` identity fact. None of these are enforced by the authority block
itself; the datalog notes carry the same confirmed/deferred split.

## Review lenses

- **Architecture:** fit with `authority-v1` (v2 is a distinct major version;
  human/session tokens stay on v1), with the agent-runs authorizer and the K1
  spec (`docs/specifications/LOOP-SECURITY-KERNEL.md`); the boundary between what
  the block expresses and what the crate enforces.
- **Security:** does the block, as written, actually bind an agent to its fleet
  and force identity? Can an agent token omit `agent_fleet` and still authorize?
  Is `capability_scope` meaningfully constraining or decorative here? Are the
  enforcement notes (per-agent revocation fail-closed, cross-fleet deny) the
  right division of labour, and are they truly enforced downstream (or is this a
  gap)? No CI/gate write by default.

## Mission terminology — three distinct concepts (do not conflate)

The first review pass flagged a naming collision. The three mission-related
facts are deliberately distinct:

- **`mission_agent(agent, mission)`** — a K1 **identity** fact of the authority
  block: the mission the agent belongs to (issuer-side, part of who the agent
  is). Present in `authority-v2`.
- **`token_mission(mission)`** — the **per-token operating mission**, required by
  the `agent-runs-v1` authorizer and injected by `authz-biscuit` at issuance. A
  single agent may hold tokens for different operating missions over time; each
  must be within the agent's `mission_agent` set. Not a K1 identity fact, so not
  encoded in the block; documented as an authorizer-compatibility requirement in
  the datalog notes.
- **`resource_mission(mission)`** — the mission of the **resource** being acted
  on, injected by the request handler at authorization time. The authorizer
  matches `token_mission` against `resource_mission`.

## Known gap — cross-fleet / cross-mission isolation is NOT yet enforced

Stated plainly so no reader mistakes the taxonomy for a live control: the
current authorizer `contracts/authz/agent-runs-v1.datalog` does **not** consume
`agent_fleet` or `mission_agent`. It checks `token_mission` / `resource_mission`
and string roles only. An agent token therefore carries fleet/mission identity
that **nothing currently enforces as a boundary**. Closing this gap is the
authorizer-wiring increment below; it is a hard precondition of promotion to
`locked`, recorded in `STATUS.md` ("Explicitly deferred").

## Scope of this increment

Contract-first: this candidate is the K1 taxonomy **contract** (the three
identity facts + identity checks + honest enforcement notes). It adds **no**
runtime authority enforcement — the crate still consumes `authority-v1`.

Subsequent, independently-reviewed increments (each a precondition of
`candidate → locked`):

1. **`agent-runs v2` authorizer** — `check if` clauses over `agent_fleet` and
   `mission_agent`, binding `token_mission ∈ mission_agent`, closing the
   isolation gap above.
2. **`authz-biscuit` crate wiring** — issue agent tokens with the three facts,
   inject `token_mission`, enforce per-agent_id revocation (fail-closed),
   validate `capability_scope` at the tool/write-path boundary.

## First-pass review outcome (this candidate was revised)

The initial `authority-v2` (two facts, notes claiming cross-fleet was already
enforced) was reviewed by two independent agents:

- **architecture** → APPROVE-WITH-CONDITIONS (missing `mission_agent` vs. the
  ratified K1 spec; unverifiable enforcement claim).
- **security** → REJECT (the cross-fleet enforcement note was a **false security
  property**: `agent-runs-v1` has no `agent_fleet` check; concrete fleet-confusion
  attack given).

This revision addresses both: `mission_agent` added (spec-conformant three
facts); the enforcement notes rewritten to separate the one confirmed property
(per-agent revocation) from the deferred, explicitly-not-enforced isolation; the
`token_mission` dependency documented; the terminology disambiguated above.
Re-review under both lenses is required before the bootstrap dossier.
