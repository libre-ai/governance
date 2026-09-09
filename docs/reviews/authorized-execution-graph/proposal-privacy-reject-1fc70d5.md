# Authorized execution graph proposal — Privacy review after cross-plan barrier

- **reviewPassId:** `authorized-graph-privacy-1fc70d5-20260909`
- **Role:** Privacy and sovereignty
- **Reviewed commit:** `1fc70d54b0348a58d676745eba4286a726ca5136`
- **Comparison base:** `72b1739f31f0067ac852d128034c319e439998ab`
- **ADR SHA-256:** `4df925e4e9ea6ea1510a490fef700ee7917258384d562b39a7ee9ff84c807bbe`
- **Mode:** specialized role, dedicated review-only pass

## Finding

**Major — the persistent barrier had no reconciled deletion lifecycle.** An
effect could remain unknown forever, while the barrier was required to survive
restore. The proposal neither separated minimal denial metadata from content
and evidence nor defined what happens when those records reach their retention
limit.

Required remediation: retain only classified minimal barrier metadata, never
extend content retention because an effect is unknown, convert loss or expiry
of evidence into an irreversible administrative refusal, and replay deletions
before reopening after restore.

## Verdict

`reject`
