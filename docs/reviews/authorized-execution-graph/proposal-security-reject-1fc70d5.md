# Authorized execution graph proposal — Security review after cross-plan barrier

- **reviewPassId:** `authorized-graph-security-1fc70d5-20260909`
- **Role:** Security
- **Reviewed commit:** `1fc70d54b0348a58d676745eba4286a726ca5136`
- **Comparison base:** `72b1739f31f0067ac852d128034c319e439998ab`
- **ADR SHA-256:** `4df925e4e9ea6ea1510a490fef700ee7917258384d562b39a7ee9ff84c807bbe`
- **Mode:** specialized role, dedicated review-only pass

## Findings

**Major — fencing did not deduplicate two deliveries of the active
invocation.** Two copies with the same still-active fencing could both be
accepted by an executor. Every emission needs an identity consumed atomically
at the point of effect; fencing remains complementary.

**Major — the predecessor retained future effect authority.** A clean barrier
check could activate a successor before the predecessor reserved another
effect. Sealing, inventory and transfer must be one canonical serialized
operation, revalidated at start and at the point of effect.

## Verdict

`reject`
