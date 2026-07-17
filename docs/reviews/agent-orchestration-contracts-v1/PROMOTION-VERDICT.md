# PROMOTION-INTEGRATION review — agent orchestration option B

- **reviewPassId:** `agent-orchestration-promotion-integration-88f9422`
- **mode:** dedicated, separate, review-only `promotion-integration`
- **promotion commit:** `88f94227e4b81b890b85d2e0667c1f600336afdc`
- **promotion base:** `f9cf069782175e82008df4a16b4a32e99c82d090`
- **normative reviewed commit:** `e93da197804c013dff2eb250a58bf7525ccd3658`
- **remediated candidate-integration commit:** `d64ad9214d0b54b7e39a2c54e238ff244f54a99c`
- **decision:** **APPROVE** promotion of exactly 14 agent-orchestration authorities to `locked`
- **implementation / real mission / real data:** **NOT AUTHORIZED**

The pass ran in a detached worktree that was clean before and after review. No reviewed authority was
modified during the pass.

## Collected records

| Scope | Verdict | Immutable target | SHA-256 |
| --- | --- | --- | --- |
| Architecture | `APPROVE` | `e93da19` | `5abc6ee974a8221341eef4cf70d89c33087a02258dd65fb8b6c7b4e0a2440ed7` |
| Security | `APPROVE-WITH-MINOR-RESERVATIONS` | `e93da19` | `f98aff66ebba98dcf8bc3c4e47f586ceea1c06abc15cdfa3234ec56e86ab6d88` |
| France/EU Privacy | `APPROVE-WITH-MINOR-RESERVATIONS` | `e93da19` | `485f745c30f2de86930c31b879b00510a7ef64ea5fc6cfee0f4cce795b9e4ef3` |
| Candidate integration | `APPROVE-WITH-MINOR-RESERVATIONS` | `d64ad92` | `744747228017005c72d3767871067cd4b6d9af47e5311e4a3224b22f2799a205` |

The promotion package at the reviewed commit has SHA-256
`b71feaea1a77275479e4c1b6f8fce24d770852dba24788e389074dadcf50a8b6`. The dependency
qualification record matches
`a6a6c3307b043732b5273d67932c47b197c1eebe15bf601d0a9e0b43ac7c59b1`.

## Scoped owner instruction

ADR-0004 records `continue` without an additional interactive pause for this contract-only sequence.
The exact UTF-8 instruction hash is
`2ca6cace4577f23f13292fdeae11f6e017752b9088102e23b068500dd3afb2cb`.
It does not replace technical records and excludes runtime implementation, real data, providers,
network, secrets, persistence, release, infrastructure and deployment.

## Catalog transition

Independent comparison of `f9cf069:contracts/catalog.v1.json` with the promotion target proves that
exactly these IDs changed, each only by replacing `status: candidate` plus its review object with
`status: locked`:

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

Every other catalog object is byte-equivalent after JSON parsing. The sole remaining candidate is
`engine-golden-vectors-v1`. Catalog SHA-256 at the reviewed target is
`50987083588a1b7a0d0568c385303db77a47cb9d75aeac4a87c691801fa5e8f4`.

## Zero normative drift

- all 21 entries in `AUTHORITY-HASHES-E93DA19.txt` recompute exactly;
- hash-list SHA-256 remains
  `de70d36761d275bb3e145d60232e964f038f928f2594b38b60ea3ce7efa3beb2`;
- explicit diff `e93da19..88f9422` over every listed authority path is empty;
- MissionRecord v1, orchestrator-event v1, Missions API v1 and Missions Biscuit v1 are unchanged;
- no `apps/`, `crates/`, runtime `packages/`, lockfile, toolchain or deployment path changes between
  promotion base and promotion commit.

The frozen semantics file retains its pre-promotion word `candidate` to preserve reviewed bytes. The
catalog remains the sole machine authority for current review state.

## Reproduced gates

Using exact Bun `1.4.0-canary.1+57f349f63` and Rust `1.97.0`:

- `bun install --frozen-lockfile`;
- `bun run check:toolchain`;
- `bun run check`: 344 tests, 60 generated TypeScript projections, 85 catalog entries, 59 schema
  fixture pairs, 113 HTTP operations and all contract/work-package/specification gates green;
- `bun run audit`: no known JavaScript vulnerability;
- `cargo fmt --all --check`;
- `cargo clippy --workspace --all-targets --all-features --locked -- -D warnings`;
- `cargo test --workspace --all-features --locked`: 46 tests green;
- `cargo check --workspace --all-features --locked`;
- `cargo deny check advisories licenses sources`.

The actual-Biscuit gate executes all 15 authorization vectors with bounded limits. A disposable
negative probe removed the author plan allow-policy; the gate failed on `author-submits-plan` with
exit 101, proving the cataloged Datalog source is executed.

## Findings

- **Blocking:** none.
- **Major:** none.
- **Minor in this promotion pass:** none.

Existing bounded reservations remain future implementation acceptance criteria: maintained runtime
Biscuit requalification, atomic/concurrent nonce/key/revocation/causal stores, tenant RLS,
need-to-know identity export, retention minimization and deletion/restore replay. They are not claimed
as completed runtime evidence.

## Scope, compatibility and rollback

Missions v1 remains the only deployable family. V1 human approvals are never reinterpreted as v2
agent quorums. No v2 producer, consumer, persistence, route, compatibility adapter, orchestrator,
harness or Pi extension exists.

Promotion locks contract meaning only. A future bounded implementation work package and separate
conformance review remain mandatory before any runtime work or real mission. Rollback is a revert of
`88f94227e4b81b890b85d2e0667c1f600336afdc`; no runtime or data migration is involved.

## Final verdict

**APPROVE** the catalog promotion of exactly the 14 listed authorities and close the option-B
contract Specification Lock. Do not infer implementation, capability, real-data, release or
deployment authorization from this verdict.
