# Agent orchestration option B — catalog promotion package

- **Promotion base:** `f9cf069782175e82008df4a16b4a32e99c82d090`
- **Normative reviewed commit:** `e93da197804c013dff2eb250a58bf7525ccd3658`
- **Remediated candidate-integration commit:** `d64ad9214d0b54b7e39a2c54e238ff244f54a99c`
- **Scope:** exactly 14 agent-orchestration authorities, `candidate → locked`
- **Implementation / real mission / real data:** **NOT AUTHORIZED**
- **Package state:** pending a separate promotion-integration review on the immutable promotion commit

No reviewed authority changes in this package. The machine-authoritative transition is limited to
the 14 catalog review states; the ADR, RFC and application/compatibility documentation record the
resulting Specification Lock and continuing runtime prohibition.

## Collected technical records

| Scope | Verdict | Reviewed commit | Durable record | Record SHA-256 |
| --- | --- | --- | --- | --- |
| Architecture | `APPROVE` | `e93da19` | `ARCHITECTURE-VERDICT-E93DA19.md` | `5abc6ee974a8221341eef4cf70d89c33087a02258dd65fb8b6c7b4e0a2440ed7` |
| Security | `APPROVE-WITH-MINOR-RESERVATIONS` | `e93da19` | `SECURITY-VERDICT-E93DA19.md` | `f98aff66ebba98dcf8bc3c4e47f586ceea1c06abc15cdfa3234ec56e86ab6d88` |
| France/EU Privacy | `APPROVE-WITH-MINOR-RESERVATIONS` | `e93da19` | `PRIVACY-VERDICT-E93DA19.md` | `485f745c30f2de86930c31b879b00510a7ef64ea5fc6cfee0f4cce795b9e4ef3` |
| Candidate integration | `APPROVE-WITH-MINOR-RESERVATIONS` | `d64ad92` | `CANDIDATE-INTEGRATION-D64AD92.md` | `744747228017005c72d3767871067cd4b6d9af47e5311e4a3224b22f2799a205` |

Historical rejected candidate-integration record `CANDIDATE-INTEGRATION-REJECT-B80D4EB.md` remains
immutable audit evidence. Its major actual-Biscuit gap is closed by `d64ad92` and the fresh record.

Dependency qualification `DEPENDENCY-QUALIFICATION-BISCUIT-AUTH.md` has SHA-256
`a6a6c3307b043732b5273d67932c47b197c1eebe15bf601d0a9e0b43ac7c59b1`.

## Scoped owner instruction

- **Decision:** `continue`, without another interactive pause for this review/remediation/promotion and
  Specification Lock sequence;
- **Recorded in:** `docs/adr/0004-agent-orchestration-option-b-specification-lock.md`;
- **Exact UTF-8 instruction SHA-256:**
  `2ca6cace4577f23f13292fdeae11f6e017752b9088102e23b068500dd3afb2cb`.

This instruction does not waive technical verdicts and excludes product/runtime implementation,
real personal or tenant data, providers, network, secrets, persistence, release, infrastructure and
deployment. Product-level protected gates remain additive where the locked contracts require them.

## Authorities proposed for promotion

1. `execution-plan-body-v1`;
2. `agent-contributor-lineage-v1`;
3. `agent-review-v1`;
4. `agent-review-session-attestation-v1`;
5. `agent-review-quorum-v1`;
6. `agent-review-quorum-view-v1`;
7. `execution-authorization-v1`;
8. `orchestrator-control-v1`;
9. `orchestrator-event-v2`;
10. `harness-profile-v1`;
11. `harness-attestation-v1`;
12. `mission-record-v2`;
13. `missions-api-v2`;
14. `agent-runs-authz-v1`.

Missions v1 remains locked and byte-identical. `engine-golden-vectors-v1` remains a separate
candidate under its own dossier.

## Frozen evidence

`AUTHORITY-HASHES-E93DA19.txt` is the exhaustive 21-file authority/vector manifest. Its SHA-256 is
`de70d36761d275bb3e145d60232e964f038f928f2594b38b60ea3ce7efa3beb2`. The promotion pass must
recompute every listed file hash and prove an empty diff from `e93da19` over all listed paths. The
word `candidate` embedded in the frozen semantic profile is immutable pre-promotion metadata; the
catalog is the sole machine authority for current review state, and changing that line would
invalidate all role verdicts.

Additional exact conformance evidence:

- `biscuit-auth 5.0.0`, crates.io checksum
  `95490f2c91dc452247d00a2fb4779bcedb7693e669354fa1fe2a96679f4950cc`, Apache-2.0,
  dev-only and default-features disabled;
- all 15 authorization vectors execute the cataloged policy in the selected Biscuit engine;
- key overlap/retirement/unknown registry and root-block revocation/store outage gates fail closed;
- Datalog limits are 256 facts, 32 iterations and 50 ms per vector.

## Compatibility and feature boundary

- Missions v1 is unchanged and remains the only deployable/runtime family;
- v1 approvals are never reinterpreted as v2 two-agent quorums;
- no v2 producer, consumer, persistence, route or compatibility adapter exists;
- a future bounded work package must enable producers and consumers together behind an explicit
  feature boundary and reproduce cross-version/rollback evidence;
- promotion locks meaning only; it does not claim implementation conformance.

## Required promotion-integration evidence

On a clean detached promotion commit, the dedicated review-only pass must:

1. verify exactly the 14 listed catalog IDs moved to `locked` and lost their candidate `review` object;
2. prove every other catalog entry is unchanged from the promotion base;
3. recompute the four favorable report hashes, dependency record hash and 21 authority hashes;
4. prove no normative drift from `e93da19` and no Missions v1 drift;
5. rerun exact Bun toolchain/install/check/audit and Rust fmt/clippy/test/check/deny gates;
6. execute the actual-Biscuit tests and a disposable negative policy probe;
7. confirm that no runtime path, capability, real-data path or deployment configuration was added.

A stale hash, broader catalog transition, blocking/major finding or red gate requires rejection.

## Residuals and rollback

The minor reservations remain future implementation acceptance criteria: atomic/concurrent stores,
runtime Biscuit version requalification, RLS, need-to-know identity exports, retention minimization
and deletion/restore replay. They are not represented as completed runtime evidence.

Rollback is a revert of the promotion commit, restoring the 14 catalog entries to `candidate`; no
runtime or data migration is involved.
