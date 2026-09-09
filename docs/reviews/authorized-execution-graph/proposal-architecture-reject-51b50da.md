# Authorized execution graph proposal — Architecture review

- **reviewPassId:** `authorized-graph-architecture-51b50da-20260909`
- **Role:** Architecture
- **Reviewed commit:** `51b50da0adca2ab2631f58b804a41f7f20cd987e`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **Mode:** specialized role, dedicated review-only pass

## Finding

**Major — an authoritative status read is not sufficient to authorize a
non-idempotent retry.** The proposal allowed status lookup as an alternative to
executor-enforced idempotency without requiring definitive proof that no effect
committed and that the prior invocation cannot commit later.

A first request can remain in flight after a crash, status can truthfully report
`absent` or `pending`, and a second non-idempotent request can then race the
first. Preserving `effectId` does not deduplicate anything unless the executor
enforces it.

Required remediation:

- proven commit reconciles without re-execution;
- definitive absence and impossibility of a late commit may authorize retry;
- pending, non-terminal absence or insufficient observation blocks;
- idempotency must be an effective executor guarantee for the same logical
  effect.

## Positive evidence

Authority uniqueness, complete graph digest, retry/cycle separation,
determinism, future-major isolation, lock preservation, doctrine-only rollback
and worker removal are coherent. `git diff --check` and the specification gate
pass; no contract or runtime file changes.

## Verdict

`reject`
