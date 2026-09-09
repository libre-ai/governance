# Authorized execution graph proposal — Security review

- **reviewPassId:** `authorized-graph-security-51b50da-20260909`
- **Role:** Security
- **Reviewed commit:** `51b50da0adca2ab2631f58b804a41f7f20cd987e`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **Mode:** specialized role, dedicated review-only pass

## Finding

**Major — status lookup leaves a duplicate external-effect race.** Invocation A
may remain in transit while a status read reports no recorded effect. If that
observation authorizes non-idempotent invocation B, A and B may both commit.
Single-ready-step execution does not prevent two invocations of that step, and
quarantine after divergent commits is too late for an irreversible effect.

Required remediation:

- committed status reconciles without a new emission;
- pending or unknown status blocks;
- without idempotency, retry requires definitive absence or rejection plus a
  guarantee that the old invocation cannot commit later;
- only the active attempt may apply an effect, and obsolete invocations must be
  refused before application.

## Positive evidence

Graph/plan binding, divergent replay quarantine, monotone budgets,
pause/cancel blocking, stale and cross-organization decision refusal, hostile
input handling and closed diagnostics are coherent. The diff changes only the
proposed ADR; specification and source gates pass.

## Verdict

`reject`
