# Authorized execution graph proposal — Final architecture review

- **reviewPassId:** `authorized-graph-architecture-1ca32a3-20260909`
- **Role:** Architecture
- **Reviewed commit:** `1ca32a3189bf4eafdb2374ddf03e96664191b9c8`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **ADR SHA-256:** `238dc35d6ff2b861f82288009da80c71274392049ca0c7451eed8f0854438d60`
- **Mode:** specialized role, dedicated review-only pass

## Assessment

The Major finding against `51b50da` is closed. `effectId` binds request,
destination and authorization context; only one attempt owns the right to apply
the effect; executor-enforced idempotency or point-of-effect fencing is
mandatory. Proven commit reconciles without re-emission, while non-idempotent
retry requires terminal non-commit and impossibility of a late commit. Pending
or insufficient status blocks.

Authority uniqueness, complete graph digest, retry/cycle separation,
single-ready-step determinism, future parallelism under a new major, lock
preservation, doctrine-only rollback and worker removal are coherent.

## Reproduced evidence

- Worktree clean before and after the review.
- Diff from the programme base contains the proposal and its historical review
  records; no contract or runtime change.
- `git diff --check` and `bun run check:specifications` pass.
- Historical rejected verdicts remain attached only to `51b50da`.

## Findings

- Blocking: none.
- Major: none.
- Minor: none.

## Residual risks

Contracts and runtime must prove executor-level fencing, deduplication, terminal
status semantics and crash races. This review qualifies only the architecture.

## Verdict

`approve`
