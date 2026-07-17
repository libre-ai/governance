# WP-G2-A01 — Simulation-only conformance acceptance

- **reviewPassId:** `wp-g2-a01-simulation-conformance-7f31ec3`
- **role:** `simulation-only-conformance`
- **mode:** dedicated review-only pass
- **reviewedCommit:** `7f31ec3ae9e4396035bedacce30bb0eed2826861`
- **implementationCommit:** `ddebf01b86854c1a8737a7c2f475352fb0214332`
- **review worktree:** detached, clean before and after
- **agent/session/provider/model:** not exposed by the harness
- **verdict:** `approve`

## Immutable inputs

- crate tree: `b4b274442ae3a6b9917cda037f00937de9c2a599`;
- verification tree: `0e89ceedd0dece8d12079a578b947ab57762828f`;
- `Cargo.lock` SHA-256: `51d773e71e384cca338f58c80a777eb9dab646a1d86526cc7a882a3f428597d2`;
- work-package plan SHA-256: `d043fe2f955f0740d381e8e70b8dda5eb2b57b3908c9a96fc24fbf8a0a38c3ea`;
- locked event vectors SHA-256: `43fa0f3caf8691620a790df84200c9cdab0c26a2c9f5b695127ab23cd5da14d8`;
- locked-authority hash-list SHA-256: `de70d36761d275bb3e145d60232e964f038f928f2594b38b60ea3ce7efa3beb2`.

## Reproduced gates

- Bun `1.4.0-canary.1+57f349f63`;
- `bun install --frozen-lockfile`;
- full `bun run check`: 357 tests, 0 failures; 60 generated contract projections;
- `cargo test --workspace --all-features --locked`: 63 tests, 0 failures;
- workspace clippy with `-D warnings`: green;
- `cargo deny check advisories licenses sources`: green;
- capability gate and its 13 negative self-tests: green;
- exact 21-authority hash verification: green;
- diff whitespace and immutable review-worktree checks: green.

## Acceptance mapping

- plan/quorum/authorization/Biscuit/harness facts are accepted only as authority-bound verified
  preflight facts; the core neither computes quorum nor owns nonce state;
- start, pause, resume and cancel are revisioned; stale cancel is monotone only for the exact active
  run/plan/authorization identity;
- replay never repeats an effect, divergent idempotency collisions fail closed, and unavailable
  stores are not treated as empty stores;
- pause, blocked, terminal, revoked and authorization-store-outage states refuse new simulated
  effects;
- causal identity, exact sequence, predecessor digest, collision, retry and budget arithmetic use the
  locked Rust/TypeScript reason-code vectors;
- every plan budget component is enforced against a bound plan digest;
- the crate owns no process, filesystem, network, environment/provider, secret, clock, thread,
  persistence, ledger, harness, worker or Pi capability;
- only synthetic fixtures are used and the runtime core emits no operational logs;
- all contract authority bytes remain unchanged.

## Decision

`simulation-only-conformance-acceptance` is satisfied for the immutable result commit. `WP-G2-A01`
is complete as a pure simulation decision core.

This acceptance is deliberately non-transitive: it authorizes no Missions integration, durable
store, harness, worker/Pi adapter, sandbox claim, OS effect, provider, personal/tenant data, release
or deployment. Each requires its own locked work package and fresh review.
