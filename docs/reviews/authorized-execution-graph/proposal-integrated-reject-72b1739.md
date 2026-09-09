# Authorized execution graph proposal — Integrated adversarial review

- **reviewPassId:** `authorized-graph-integrated-72b1739-20260909`
- **Role:** Integrated coordinator review
- **Reviewed commit:** `72b1739f31f0067ac852d128034c319e439998ab`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **ADR SHA-256:** `ff47389d7271e6f0a0c44cee6bac4e744ad9287d9d577b459cdaba49d532361f`
- **Mode:** dedicated review-only pass requested before owner ratification

## Finding

**Major — an unknown effect could be bypassed through a successor plan.** The
proposal kept `effectId` stable across attempts of one plan, but every identity
was bound to that plan digest. A replan could therefore create a new run and a
new `effectId` for the same external operation while the predecessor effect was
still unknown. Executor idempotency on the two distinct identifiers would not
prevent both effects from committing.

Required remediation: an unresolved predecessor effect must create a canonical
barrier inherited by every successor plan and run. A new digest, authorization,
run, effect identifier, cancellation or restore must not clear it.

## Verdict

`reject`
