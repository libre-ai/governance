# Candidate-integration review — agent orchestration contracts @ d64ad92

- **reviewPassId:** `agent-orchestration-candidate-integration-d64ad92-r1`
- **mode:** dedicated review-only `candidate-integration`
- **reviewedCommit:** `d64ad9214d0b54b7e39a2c54e238ff244f54a99c`
- **review worktree:** detached, clean before and after
- **verdict:** `approve-with-minor-reservations`

This pass is distinct from Architecture, Security and France/EU Privacy roles. It grants no catalog
promotion by itself and authorizes no runtime, provider, network, secret, persistence, real mission,
release, infrastructure or deployment.

## Scope and immutable authorities

The favorable role records remain bound to
`e93da197804c013dff2eb250a58bf7525ccd3658`. Independent recomputation on this target confirms:

- 21/21 authority/vector hashes match `AUTHORITY-HASHES-E93DA19.txt`;
- hash-list SHA-256 is
  `de70d36761d275bb3e145d60232e964f038f928f2594b38b60ea3ce7efa3beb2`;
- the explicit diff from `e93da19` over all 21 reviewed authorities is empty;
- Missions v1 and all unrelated locked authorities remain unchanged.

## Remediation verified

`CI-B80-MAJ-001` is closed:

- `agent-runs-v1.datalog` is included in the Rust Biscuit parser gate with exactly 15 policies;
- all 15 existing authorization vectors execute against the exact cataloged Datalog source through
  `biscuit-auth 5.0.0`, not through the TypeScript mirror alone;
- signed tokens contain tenant, role, mission/run/plan/authorization/subject attenuation facts as
  required by each case and an expiry check;
- the selected authorizer is bounded to 256 facts, 32 iterations and 50 ms per vector;
- overlapping root keys accept old/current tokens, while retired/unknown keys and registry outage
  fail closed;
- root-block revocation and revocation-store outage fail closed;
- a disposable negative probe removed the author-plan allow policy; the actual Rust gate failed on
  `author-submits-plan` with exit 101, proving that it executes the policy rather than only a mirror.

The test-only dependency is exact-pinned, Apache-2.0 and qualified in
`DEPENDENCY-QUALIFICATION-BISCUIT-AUTH.md`. Version 5 is intentionally selected with default
features disabled because the evaluated v6 minimal path either fails compilation or introduces the
unmaintained `proc-macro-error2` advisory. The accepted closure has no Biscuit macro/PEM/WASM feature,
no network or data capability, and passes Cargo deny.

## Evidence reproduced

Using Bun `1.4.0-canary.1+57f349f63` and Rust `1.97.0`:

- `bun install --frozen-lockfile`;
- `bun run check:toolchain`;
- `bun run check`: 344 tests, 60 generated projections, 85 catalog entries, 59 schema fixture pairs,
  113 HTTP operations and all orchestration vectors green;
- `bun run audit`: no known JavaScript vulnerability;
- `cargo fmt --all --check`;
- `cargo clippy --workspace --all-targets --all-features --locked -- -D warnings`;
- `cargo test --workspace --all-features --locked`: 46 tests green;
- `cargo check --workspace --all-features --locked`;
- `cargo deny check advisories licenses sources`.

## Findings by decision axis

- **Security:** no blocking or major finding. Actual-policy, rotation, unknown-key, revocation and
  outage behavior now fail closed.
- **Quality/completeness:** no blocking or major finding. Candidate history, dependency rationale and
  immutable hash linkage are durable.
- **Performance:** no finding; Datalog execution is explicitly bounded and all 15 vectors complete
  within the gate.
- **Sovereignty/privacy:** no service or hyperscaler dependency, no personal/production fixture, no
  log content or external transfer. Apache-2.0 is acceptable.

### Minor reservations

1. The Biscuit dependency is a test-only conformance selection. A future runtime package must
   independently requalify its maintained version and must not infer production approval from v5.
2. Atomic/concurrent nonce, causal, key and revocation stores remain future implementation evidence.
3. Tenant RLS, need-to-know identity export, retention minimization and deletion/restore replay remain
   future privacy conformance evidence. Pseudonymous identifiers must never be described as anonymous.

These reservations are bounded, non-conditional for catalog promotion, and introduce no runtime
capability.

## Explicit verdict

**APPROVE-WITH-MINOR-RESERVATIONS candidate-integration** on
`d64ad9214d0b54b7e39a2c54e238ff244f54a99c`. The candidate may proceed to a separate catalog-only
promotion package and promotion-integration pass. No implementation or real-data authorization
follows.
