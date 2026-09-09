# Authorized execution graph proposal — Architecture review after cross-plan barrier

- **reviewPassId:** `authorized-graph-architecture-1fc70d5-20260909`
- **Role:** Architecture
- **Reviewed commit:** `1fc70d54b0348a58d676745eba4286a726ca5136`
- **Comparison base:** `72b1739f31f0067ac852d128034c319e439998ab`
- **ADR SHA-256:** `4df925e4e9ea6ea1510a490fef700ee7917258384d562b39a7ee9ff84c807bbe`
- **Mode:** specialized role, dedicated review-only pass

## Finding

**Major — lifting the barrier did not seal the predecessor.** The successor was
blocked while recorded predecessor effects were non-terminal, but the proposal
did not revoke the predecessor's right to reserve a new effect after that check.
The predecessor and successor could consequently emit distinct effects for the
same operation.

Required remediation: seal the predecessor, inventory reserved and started
effects, serialize sealing with reservation, then transfer the exclusive right
to execute to the successor. The active generation must be checked at the point
of effect.

## Verdict

`reject`
