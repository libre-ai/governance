# Authorized execution graph proposal — Architecture review after hardening

- **reviewPassId:** `authorized-graph-architecture-72b1739-20260909`
- **Role:** Architecture
- **Reviewed commit:** `72b1739f31f0067ac852d128034c319e439998ab`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **ADR SHA-256:** `ff47389d7271e6f0a0c44cee6bac4e744ad9287d9d577b459cdaba49d532361f`
- **Mode:** specialized role, dedicated review-only pass

## Assessment

The final DAG invariants are mechanically testable: every node is reachable,
every node can reach a terminal, terminals have no outgoing edge, and each
closed non-terminal outcome maps to exactly one edge without a default route.

`effectId` identifies the stable logical effect while attempts and invocations
remain separate. Exactly one recovery policy is selected before execution and
bound to the executor profile. Reconciliation remains an Orchestrator
transition over executor status attested by Harness; Missions cannot substitute
a human assertion for missing evidence.

Authority uniqueness, complete digests, lock preservation, future parallelism
under a new major, rollback and worker removal remain coherent. An executor that
cannot prove one of the three closed recovery policies is not admissible.

## Reproduced evidence

- Worktree clean before and after review.
- `git diff --check` and the Specification Lock gate pass.
- Diff contains doctrine and review evidence only.

## Findings

- Blocking: none.
- Major: none.
- Minor: none.

## Residual risks

Phase 3 must express executor guarantees and policy transitions as strict
contracts and adversarial vectors. This review opens no lock or runtime.

## Verdict

`approve`
