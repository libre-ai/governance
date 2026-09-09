# Authorized execution graph proposal — Privacy and sovereignty review after hardening

- **reviewPassId:** `authorized-graph-privacy-72b1739-20260909`
- **Role:** Privacy and sovereignty
- **Reviewed commit:** `72b1739f31f0067ac852d128034c319e439998ab`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **ADR SHA-256:** `ff47389d7271e6f0a0c44cee6bac4e744ad9287d9d577b459cdaba49d532361f`
- **Mode:** specialized role, dedicated review-only pass

## Assessment

Effect request digest, destination, executor profile, fencing and terminal
observations stay minimized, classified and excluded from operational logs and
OTEL. Harness attests bounded observations; Orchestrator alone owns canonical
transitions. Human intervention cannot replace missing evidence.

“Private to the organization” is descriptive prose, not a new classification
enum or alias. The locked `tenant-private` wire value remains unchanged. Need-
to-know access, retention, deletion, non-resurrection and opaque worker
checkpoints remain mandatory. No managed service, transfer or runtime surface is
opened.

## Reproduced evidence

- Worktree clean before and after review.
- `git diff --check`, Specification Lock and licence gates pass.
- No manifest, lockfile, contract or invariant register changed.

## Findings

- Blocking: none.
- Major: none.
- Minor: none.

## Residual risks

Future contracts must minimize representation, audience and expiry for every
correlatable digest, destination, profile and fencing observation.

## Verdict

`approve`
