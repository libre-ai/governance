# Public proof cutover — architecture review

- **reviewPassId:** `public-proof-architecture-8b0eeb5-20260910`
- **Role:** Architecture
- **Reviewed commit:** `8b0eeb52b8be64264a7ee53ea8a4869f7fa53872`
- **Comparison base:** `0d5b6255fbbaa5d7592b1aaec23b9ecf60723752`
- **Mode:** dedicated review-only pass

## Finding

**Major — the release plan assumes a previous deployment exists.** ADR-0035
allows an alternative rollback for an initial release, but the implementation
plan requires recording and restoring a previous revision unconditionally. On a
new Clever Cloud application there is no such revision. The candidate could be
published on a canonical domain before its post-deploy smoke has a recoverable
failure path.

Required remediation: define the first-release rollback as stopping the
application, keep the canonical domain detached during the initial smoke on the
Clever technical URL, and attach or switch canonical routing only after that
smoke is green. Subsequent releases restore an immutable previous revision.

## Positive evidence

- The G4 deadlock is correctly removed without granting fleet-wide release
  authority.
- Static Website deployment does not activate identity, data, add-on or adjacent
  repository capabilities.
- Governance, brand and decision-register authorities remain unidirectional.
- `bun run check` passed with 944 tests and zero failures on the reviewed commit.

## Verdict

`reject`
