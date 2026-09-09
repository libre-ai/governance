# Authorized execution graph proposal — Integrated identity review

- **reviewPassId:** `authorized-graph-integrated-925e99a-20260909`
- **Role:** Integrated coordinator review
- **Reviewed commit:** `925e99ad7337d8e642cf817f84b155199c3da935`
- **Comparison base:** `1fc70d54b0348a58d676745eba4286a726ca5136`
- **ADR SHA-256:** `546de28f1b858d4d3877cbb150fec51dae1d5aec341cdc33383e66178df57db7`
- **Mode:** dedicated review-only pass before final verdict recording

## Findings

**Major — two transfers could target the same predecessor generation.** Without
one-shot compare-and-swap consumption, concurrent successor transfers could
both cite the same sealed predecessor and receive distinct generations.

**Major — one attempt could mint two emission identities.** Atomic consumption
of each `effectEmissionId` did not prevent a caller from requesting two distinct
identifiers under the same active attempt.

Required remediation: consume the current execution generation exactly once,
refuse successor branching, and limit each `external-effect` attempt to one
emission identity. Multiple intended effects become separate sequential nodes.

## Verdict

`reject`
