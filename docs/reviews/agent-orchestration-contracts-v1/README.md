# Agent orchestration contracts v1

Status: `promotion-authored / separate promotion-integration pending`.

These authorities make the reviewed option-B RFC machine-checkable. They authorize no orchestrator, harness, Pi extension, provider, network, secret, persistence, real mission, merge, release or deployment.

## Authorities in promotion

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

## Candidate-integration history

The dedicated pass on `b80d4eb` rejected promotion readiness because the candidate Biscuit policy
was checked through a handwritten TypeScript mirror but never executed by a Biscuit authorizer, and
the existing Rust parser gate omitted it. See
[`CANDIDATE-INTEGRATION-REJECT-B80D4EB.md`](CANDIDATE-INTEGRATION-REJECT-B80D4EB.md).

The bounded remediation adds an exact test-only Biscuit engine, actual-policy execution for all 15
existing vectors, root-key rotation and fail-closed revocation/store-outage checks. Dependency scope
and supply-chain rationale are recorded in
[`DEPENDENCY-QUALIFICATION-BISCUIT-AUTH.md`](DEPENDENCY-QUALIFICATION-BISCUIT-AUTH.md).

The fresh review-only pass on immutable commit `d64ad92` closes the major finding and returns
`approve-with-minor-reservations`; see
[`CANDIDATE-INTEGRATION-D64AD92.md`](CANDIDATE-INTEGRATION-D64AD92.md). The remaining reservations
are runtime/privacy implementation evidence and do not authorize or block a catalog-only promotion.

## Promotion gates

- strict JSON Schema and OpenAPI validation ;
- positive and negative fixtures in TypeScript and Rust ;
- independent semantic quorum vectors proving contributor/reviewer separation ;
- reproducible generated projections ;
- all three role verdicts favorable on unchanged authority hashes ;
- separate promotion/integration pass ;
- scoped owner instruction recorded durably in the promotion package.

## Review outcome

Exact authority commit `e93da197804c013dff2eb250a58bf7525ccd3658`:

- architecture: `approve` ;
- security: `approve-with-minor-reservations` ;
- France/EU privacy: `approve-with-minor-reservations`.

Historical rejects remain in this dossier. The authored promotion transitions exactly 14 catalog entries to `locked`, subject to the separate review-only pass specified in [`PROMOTION-PACKAGE.md`](PROMOTION-PACKAGE.md). The current owner instruction permits continuing without another interactive pause but does not replace or waive any technical role verdict.

`locked` fixes contract meaning; it is not an implementation approval. A bounded work package and conformance review remain mandatory before any runtime work or real mission.
