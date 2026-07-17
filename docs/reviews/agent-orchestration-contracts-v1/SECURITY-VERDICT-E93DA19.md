# Security final review — contract candidates e93da19

- **reviewPassId:** `agent-orchestration-contracts-security-e93da19`
- **mode:** `security`
- **reviewedCommit:** `e93da197804c013dff2eb250a58bf7525ccd3658`
- **review worktree:** detached, clean, review-only
- **verdict:** `approve-with-minor-reservations`

## Reproduced evidence

```text
bun run check:source
Source policy verified
bun run check:contracts
Contracts verified: 85 catalog entries, 59 schema fixture pairs, 113 HTTP operations
Agent orchestration vectors verified: 26 quorum, 19 event-chain, 15 authz, 42 transition, 9 digest and 4 signature cases
bun test packages/contracts/src  # pinned workspace dependency link removed after execution
171 passed
cargo test -p libre-ai-contract-types
12 passed
cargo fmt --all --check
passed
biome ci .
Checked 230 files. No fixes applied.
```

The temporary dependency link contained no reviewed authority, was removed after tests, and final `git status --short` plus `git diff --exit-code` were clean.

## Findings

No blocking or major security finding remains.

### Minor reservations

- Atomic nonce, idempotency, key/revocation and causal-state stores are specified fail-closed but cannot be concurrency-qualified before a bounded implementation exists.
- Biscuit vectors exercise the exact policy semantics; promotion must additionally run them against the selected Biscuit engine and key-rotation/revocation implementation.

## Verified controls

- two favorable reviewer agents are distinct from each other and every complete harness-derived contributor ;
- subject, evidence, lineage subject/contributors, reviewer session, nonce, key, expiry and verdict are signed/digest-bound ;
- inactive key, replay, self-review, duplicate identity/run/nonce/signature, disclosed sibling verdict and stale digest fail closed ;
- optional high-risk pool/runtime/model/provider diversity cannot weaken the two-review threshold ;
- tenant/mission/subject/run/plan/authorization and subject type are attenuated in Biscuit with final deny ;
- causal vectors reject sequence gaps, predecessor/identity substitutions, divergent duplicates, budget decreases and bad delta arithmetic in TypeScript and Rust ;
- sandbox/profile forbids generic shell, ignored-file copy, worker secrets, loopback/special-use egress and missing required controls ;
- model egress is exact-origin, France/EU, ZDR and no training/reuse.

## Authority and vector hashes

Every reviewed authority/vector hash is listed in `AUTHORITY-HASHES-E93DA19.txt`.

- **hash count:** 21
- **hash-list SHA-256:** `de70d36761d275bb3e145d60232e964f038f928f2594b38b60ea3ce7efa3beb2`

This verdict does not authorize a runtime, provider, network, secret, persistence or real mission.
