# Security review — contract candidates 9ff5c7e

- **reviewPassId:** `agent-orchestration-contracts-security-9ff5c7e`
- **mode:** `security`
- **reviewedCommit:** `9ff5c7e75b782dceac3e4f8ce823f72787c1b416`
- **review worktree:** detached, clean, review-only
- **verdict:** `reject`

## Reproduced evidence

```text
bun run check:source
Source policy verified
bun run check:contracts
Contracts verified: 85 catalog entries, 59 schema fixture pairs, 113 HTTP operations
Agent orchestration vectors verified: 26 quorum, 15 authz, 42 transition, 9 digest and 4 signature cases
bun test packages/contracts/src  # with pinned workspace dependency link, then removed
152 passed
cargo test -p libre-ai-contract-types
11 passed
cargo fmt --all --check
passed
biome ci .
Checked 227 files. No fixes applied.
```

A first Bun test attempt with `NODE_PATH` alone could not resolve `ajv/dist/2020`; rerunning against the pinned workspace dependency tree passed. The dependency link was removed and the review worktree remained clean.

## Findings

### Major — causal and monotone budget rules are prose-only

`orchestrator-event.v2.schema.json` proves only that one event contains non-negative counters and that a non-genesis event has a digest-shaped predecessor. It cannot prove, across two accepted events, that:

- sequence increments exactly once ;
- `previousEventDigest` equals the accepted predecessor ;
- tenant/mission/run/plan/authorization identities remain constant ;
- every total is monotone ;
- `previous total + delta = current total` ;
- retry/pause/resume/worker replacement does not restore budget.

`SEMANTICS.md` states these rules, but no executable TypeScript/Rust semantic validator or adversarial vector currently exercises them. A schema-valid lower total could therefore be accepted by an incomplete implementation. Add cross-event vectors and fail-closed projections before approval.

### Minor — stateful control-store behavior remains a later implementation gate

The semantics correctly require one-shot nonces, exact-byte duplicate idempotence, monotone cancellation and fail-closed key/revocation stores. Candidate vectors cover nonce replay, inactive keys and authorization substitution, but actual atomic-store conformance remains unavailable until a bounded implementation work package exists.

## Verified controls

- two favorable reviews are distinct from each other and from every harness-derived contributor ;
- subject, evidence, lineage subject/contributors, session attestation, key, nonce and expiry are digest-bound and fail closed ;
- review-session attestations enforce read-only workspace, no shared mutable state and no sibling verdict disclosure ;
- Biscuit rules bind tenant, mission, subject/run, plan, authorization and subject type with final deny ;
- sandbox/profile forbids generic shell, worker secrets, loopback, ignored-file copy and content-bearing operational logs ;
- model egress is exact-origin, France/EU, ZDR, no training/reuse.

## Authority and vector hashes

Every reviewed authority/vector hash is listed in `AUTHORITY-HASHES-9FF5C7E.txt`.

- **hash count:** 20
- **hash-list SHA-256:** `29287427a56788be27eac3d857a0a0a591eb4fb7cb2b86d10562d9f95a626a81`
