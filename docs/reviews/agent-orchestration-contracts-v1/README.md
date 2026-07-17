# Agent orchestration contract candidates v1

Status: `candidate-reviewed / human milestone and promotion lock required`.

These authorities make the reviewed option-B RFC machine-checkable. They authorize no orchestrator, harness, Pi extension, provider, network, secret, persistence, real mission, merge, release or deployment.

## Candidate authorities

- execution plan body and separate execution authorization ;
- contributor lineage, signed review-session isolation/non-disclosure, individual agent review, two-agent quorum and role-redacted quorum view ;
- control commands and causal orchestrator events v2 ;
- fail-closed harness profile and signed effective-controls attestation ;
- MissionRecord/API v2 ;
- attenuated Biscuit policy for authors, reviewers and runs ;
- semantic profile under `contracts/agent-orchestration/SEMANTICS.md` ;
- executable quorum, causal-event/budget, authorization, canonical digest and Ed25519 signature vectors under `contracts/fixtures/agent-orchestration-v1/`.

## Required review roles

Every candidate requires separate review-only passes on one immutable commit:

1. architecture — authority ownership, v1/v2 coexistence, transitions and no second Missions authority ;
2. security — signatures, replay, identity separation, sandbox, secrets, budgets and fail-closed behavior ;
3. France/EU privacy — model egress, reviewer identity, findings, logs, retention and exports.

Reviews follow [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). The two-agent quorum defined for product missions is distinct from this repository engineering-review protocol.

## Promotion gates

- strict JSON Schema and OpenAPI validation ;
- positive and negative fixtures in TypeScript and Rust ;
- independent semantic quorum vectors proving contributor/reviewer separation ;
- reproducible generated projections ;
- all three role verdicts favorable on unchanged authority hashes ;
- separate promotion/integration pass ;
- explicit owner control milestone.

## Review outcome

Exact authority commit `e93da197804c013dff2eb250a58bf7525ccd3658`:

- architecture: `approve` ;
- security: `approve-with-minor-reservations` ;
- France/EU privacy: `approve-with-minor-reservations`.

Historical rejects remain in this dossier. Catalog entries intentionally remain `candidate` / `pending-independent-agent-review` until a separate promotion/integration pass and explicit human control milestone.

`candidate` is not an implementation approval. A work package may be added only after Specification Lock.
