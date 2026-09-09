# Authorized execution graph proposal — Security review after hardening

- **reviewPassId:** `authorized-graph-security-72b1739-20260909`
- **Role:** Security
- **Reviewed commit:** `72b1739f31f0067ac852d128034c319e439998ab`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **ADR SHA-256:** `ff47389d7271e6f0a0c44cee6bac4e744ad9287d9d577b459cdaba49d532361f`
- **Mode:** specialized role, dedicated review-only pass

## Assessment

The hardened proposal refuses graph ambiguity, effect-request or destination
substitution, executor-profile mismatch, obsolete invocations and opportunistic
recovery-policy selection. Point-of-effect fencing or effective executor
idempotency remains mandatory even under `no-retry`.

The duplicate A/B scenario stays closed: committed status reconciles without
emission; pending, non-terminal absence and insufficient status block; a
non-idempotent retry requires final non-commit and impossibility of a late
commit. A human may request observation, cancellation or replan but cannot
assert terminal effect state or replace evidence.

## Reproduced evidence

- Worktree clean before and after review.
- `git diff --check`, Specification Lock, source and licence gates pass.
- No code, contract, lockfile, dependency or runtime capability changed.

## Findings

- Blocking: none.
- Major: none.
- Minor: none.

## Residual risks

Phase 3 and runtime must prove profile binding, atomic deduplication or fencing,
authentic terminal observations and pause/cancel races.

## Verdict

`approve`
