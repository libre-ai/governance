# Authorized execution graph proposal — Security review after serialized transfer

- **reviewPassId:** `authorized-graph-security-925e99a-20260909`
- **Role:** Security
- **Reviewed commit:** `925e99ad7337d8e642cf817f84b155199c3da935`
- **Comparison base:** `1fc70d54b0348a58d676745eba4286a726ca5136`
- **ADR SHA-256:** `546de28f1b858d4d3877cbb150fec51dae1d5aec341cdc33383e66178df57db7`
- **Mode:** specialized role, dedicated review-only pass

## Assessment

Two deliveries of the active emission are deduplicated atomically at the point
of effect. A reservation racing the predecessor seal either joins the terminal
inventory or is rejected under the obsolete generation. Authorization binds
the predecessor, sealed revision, inventory digest and successor generation,
all revalidated before execution and effects.

Restore and evidence expiry cannot turn absence into authorization. Humans
cannot substitute an effect outcome, and budgets remain monotone.

## Findings

- Blocking: none.
- Major: none.
- Minor: none.

## Verdict

`approve`
