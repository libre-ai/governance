# Biscuit authorizer dependency qualification

- **Package:** `biscuit-auth`
- **Selected version:** `5.0.0`
- **Registry checksum:** `95490f2c91dc452247d00a2fb4779bcedb7693e669354fa1fe2a96679f4950cc`
- **License:** Apache-2.0
- **Upstream:** Eclipse Biscuit, `https://github.com/biscuit-auth/biscuit-rust`
- **Scope:** Rust dev-dependency of `libre-ai-ecosystem-engine` only
- **Runtime/data capability:** none

## Selection rationale

The dependency exists only to execute the cataloged `agent-runs-v1.datalog` policy and its existing
synthetic vectors in the selected Biscuit engine before promotion. It does not add a token issuer,
HTTP adapter, key store, database, network call, secret, production verifier or `crates/authz-biscuit`
implementation.

Version `6.0.0` was evaluated first. Its minimal `default-features = false` build does not compile,
and enabling `datalog-macro` introduces unmaintained `proc-macro-error2 2.0.1`
(`RUSTSEC-2026-0173`). Version `5.0.0` with default features disabled exposes the required token and
authorizer APIs without `biscuit-quote` or either unmaintained proc-macro-error family. Selecting the
older exact version is therefore a deliberate supply-chain reduction, not an open version range.

## Closure and controls

- exact version centralized in the root Cargo workspace;
- default features disabled; no PEM, WASM, macro or full-regex feature enabled;
- synthetic opaque fixture identifiers only; no personal, tenant-production or secret data;
- no external service and no US hyperscaler dependency;
- open protocol and Apache-2.0 implementation, with no vendor-specific data format;
- bounded authorizer execution: at most 256 facts, 32 iterations and 50 ms per vector;
- `cargo deny check advisories licenses sources` passes with the selected closure;
- `cargo clippy --workspace --all-targets --all-features --locked -- -D warnings` and workspace tests
  remain mandatory.

A future product `authz-biscuit` work package must requalify its runtime dependency, persistence,
concurrency, key registry, revocation store and operational limits. This test-only qualification
cannot be cited as runtime conformance or deployment approval.
