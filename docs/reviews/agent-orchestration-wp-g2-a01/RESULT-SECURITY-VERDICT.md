# WP-G2-A01 result review — Security

- **reviewPassId:** `wp-g2-a01-result-security-7f31ec3`
- **role:** `security`
- **mode:** dedicated review-only pass
- **reviewedCommit:** `7f31ec3ae9e4396035bedacce30bb0eed2826861`
- **implementationCommit:** `ddebf01b86854c1a8737a7c2f475352fb0214332`
- **review worktree:** detached, clean before and after
- **agent/session/provider/model:** not exposed by the harness
- **verdict:** `approve`

## Frozen result

- crate tree: `b4b274442ae3a6b9917cda037f00937de9c2a599`;
- capability checker SHA-256: `982db61aa23f2a70df2a2c24c8e945eeb4b39c04571661eb850cc9bf1e9ebac9`;
- locked event vectors SHA-256: `43fa0f3caf8691620a790df84200c9cdab0c26a2c9f5b695127ab23cd5da14d8`;
- locked-authority hash-list SHA-256: `de70d36761d275bb3e145d60232e964f038f928f2594b38b60ea3ce7efa3beb2`.

## Evidence reproduced

- executable capability gate: green;
- 13 capability-boundary self-tests reject alternate dependency sections, process, filesystem,
  network, environment, threads, clocks, FFI and unsafe source paths;
- runtime-source scan finds no logging, OS, network or unsafe call;
- credential/private-key scan: empty;
- 17 focused Rust tests cover schema closure, preflight bindings, revocation, store outages,
  idempotency divergence, stale revisions, monotone cancel, effect refusal, budget arithmetic and all
  19 locked event-chain reason codes;
- `cargo deny check advisories licenses sources`: green;
- all 21 locked authority hashes reproduce exactly;
- review worktree clean before and after.

## Findings

- **Blocking:** none.
- **Major:** none.
- **Minor:** none.

## Verified security properties

- an externally constructible valid command is obtainable only through the locked JSON-Schema
  validator; rejected documents return a closed code without values;
- start binds tenant, mission, plan, authorization and authoritative revision before returning
  `AllocateRun`;
- every required preflight fact, key registry and authorization/causal store is fail-closed;
- non-start controls reject revoked or unavailable authorization state;
- idempotency and causal-store outages are distinct from a successful no-collision lookup;
- identical replay returns only the recorded revision and cannot repeat the prior effect;
- pause/blocked/terminal/revoked states refuse new simulated effects;
- plan digest, exact event identity, predecessor arithmetic and all budget ceilings remain monotone;
- no token, identifier, path, finding or content is emitted by runtime logging because the crate has
  no runtime log sink.

## Residual scope

Caller-supplied preflight, state, receipt and store observations are explicit trusted boundaries.
Production adapters must authenticate those facts and implement bounded durable concurrency before
real use; none exists here. This verdict authorizes no worker, sandbox claim, provider, persistence,
real mission, release or deployment.
