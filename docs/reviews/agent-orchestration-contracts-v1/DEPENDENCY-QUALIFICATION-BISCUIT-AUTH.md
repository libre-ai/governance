# Biscuit authorizer dependency qualification

- **Package:** `biscuit-auth`
- **Selected version:** `6.0.0`, resolved through `[patch.crates-io]` to a vendored copy of the
  published archive carrying one upstream-merged fix (see "Form" below)
- **Registry checksum of the archive:**
  `d5884fc86b3e21f5649ef4326e17ef729b3096e6502deaf13db7b7fb05bb992b` (crates.io, 2025-07-16)
- **Paired parser:** `biscuit-parser 0.2.0`, registry checksum
  `9d7cafdbc8c30e1f0fb87df7161bec77f6f00da652cc33f102b0f95bd1cbc0fa`
- **License:** Apache-2.0 (archive and vendored copy alike)
- **Upstream:** Eclipse Biscuit, `https://github.com/eclipse-biscuit/biscuit-rust`
- **Scope:** runtime dependency of `libre-ai/authz-biscuit` (couche 3, the only issuer/verifier of
  internal Biscuit tokens) and Rust dev-dependency of `libre-ai/ecosystem-engine`
- **Runtime/data capability:** token issuance, attenuation and deny-by-default authorization in
  `authz-biscuit`; vector execution only in `ecosystem-engine`
- **Owner decision:** 2026-09-08, structured questions — Voie A (vendored copy + upstream diff),
  parser 0.2.0 with the injectivity proof redone, contracts unchanged

## History

`5.0.0` (registry checksum `95490f2c91dc452247d00a2fb4779bcedb7693e669354fa1fe2a96679f4950cc`) was
selected at the contracts-v1 promotion as a test-only dependency of `ecosystem-engine`, after `6.0.0`
had been evaluated and set aside: its minimal `default-features = false` build did not compile, and
enabling `datalog-macro` to work around it introduced the unmaintained `proc-macro-error2 2.0.1`
(`RUSTSEC-2026-0173`). `authz-biscuit` later adopted the same exact pin as its runtime dependency,
paired with `biscuit-parser 0.1.2` (the grammar of the 5.0 printer) for its print/parse structural
validation, and proved the injectivity of that pair (`authz-biscuit`
`evidence/reviews/fbbe360/`).

## Why 6.0.0 now

A migration spike (2026-09-08, not re-measured here; figures are the spike's) established:

- the `6.0.0` compile failure is a packaging defect, not a design one: five builder modules
  (`src/token/builder/{check,fact,policy,rule,term}.rs`) import `ToAnyParam` unconditionally while
  the trait only exists behind `datalog-macro` — upstream issue eclipse-biscuit/biscuit-rust#305,
  fixed by #306 (merged as `a6b72596ebe5f391b60e9b91c74edca8febdda93`), unreleased;
- with those five hunks applied, `6.0.0` builds with default features off; the remaining work is
  API migration: consuming builders (`BiscuitBuilder::root_key_id`, `code_with_params`,
  `BlockBuilder::new().code_with_params`) and the split `AuthorizerBuilder` → `Authorizer`
  (8 × E0599 in `authz-biscuit`, 12 sites in `ecosystem-engine`);
- `cargo deny check bans licenses sources` and `advisories` pass with the 6.0 closure; the
  duplicate-version count rises (`multiple-versions = "warn"`: `sha2` 0.9/0.10/0.11, `digest`,
  `block-buffer`, `pkcs8`, `spki`, `der`, `cpufeatures`, `crypto-common`, `syn`) because 6.0 pins
  `sha2 ^0.9` and `pkcs8 0.9`;
- the 6.0 printer emits datalog 3.3: sets print as `{a, b}` (empty: `{,}`), so block 1 of every
  token issued by `authz-biscuit` is rejected by parser 0.1.2 — the parser must move with the
  printer; `Term::Null`, `Term::Array` and `Term::Map` are new printer outputs the 5.0 injectivity
  proof did not model.

Staying on 5.0.0 would have meant carrying an engine that no longer receives upstream fixes and
diverges from the datalog 3.3 syntax the ecosystem's contracts are read with elsewhere; the
Dependabot bumps (`authz-biscuit#10`, `ecosystem-engine#11`) were red for the reason above and are
superseded.

## Form: vendored copy with the upstream diff (Voie A)

The dependency line stays an exact registry version, `biscuit-auth = { version = "=6.0.0",
default-features = false }`, and `[patch.crates-io]` resolves it to
`authz-biscuit/third_party/biscuit-auth-6.0.0/`: the published archive (94 files, byte-identical
to the checksum above, including `Cargo.toml.orig`, `Cargo.lock`, `samples/`, `examples/`,
`benches/`, `tests/`) plus exactly the #306 hunks. `PATCH.md` in that directory records the
provenance, the diff, the qualification steps for every update and the removal condition. The
REUSE annotation keeps the tree under its upstream Apache-2.0 licence and copyright; the
declared-vs-effective licence gate excludes `third_party/` by doctrine (`LICENSING.md`,
"Third-party material").

`ecosystem-engine` does not carry a second copy: its `[patch.crates-io]` points at the
`authz-biscuit` repository by git `rev` (cargo resolves the package by name inside the repository;
`cargo deny check sources` accepts it under `[sources.allow-org] github = ["libre-ai"]`). One copy in
the fleet, re-pinned to the merge commit when the `authz-biscuit` PR lands.

Alternatives set aside: enabling `datalog-macro` (re-introduces the unmaintained proc-macro
family the 5.0 pin was chosen to avoid); a git dependency on upstream `main` past #306 (unpinned
crypto and datalog changes on the way to 7.0 — see below — and no registry checksum to qualify);
a fork repository (a second remote to govern for five lines of `use`).

Precedent: `notebook/third_party/rustcrypto-aes-0.8.4` (ADR-0020 §2.5 — the patch travels with its
consumer).

## Removal condition

The vendored copy and the `[patch.crates-io]` entry are removed as soon as the **first published
`biscuit-auth` version that includes #306** is qualified. Upstream `main` already carries #306 and
announces `7.0.0` in its CHANGELOG with breaking crypto changes: `KeyPair` removed in favour of
`PrivateKey`, `Biscuit`/`UnverifiedBiscuit` generic over the key type, `RootKeyProvider` with an
associated `Key` type, scopes taking `PublicKeyData`, `ToAnyParam`/`AnyParam` removed. That is a new
qualification of the key ring, issuer and revocation surface of `authz-biscuit`, not a drop-in swap;
this note must be rewritten for it.

## Print/parse injectivity — re-qualified for the 6.0 / 0.2.0 pair

`authz-biscuit` validates the canonical shape of blocks 0 and 1 by reprinting them and reparsing
with the version-matched parser, and guards the round trip up front because the printer emits
strings and identifiers unescaped. The proof is version-bound; it was redone for the new pair with
the `fbbe360` method (`authz-biscuit` `evidence/reviews/bfc2c0d/`):

- proved faithful and relied upon: sets (`{..}`, members in symbol-table order), `{,}` vs `{}`,
  strict vs lenient equality (`===`/`!==` vs `==`/`!=`), key-algorithm scope prefixes
  (`ed25519/<hex>`); a byte-class property over `0x01..=0x7f` — 126 bytes reparse exactly, `"` and
  `\` are denied, no third outcome;
- **confirmed gap** on the plain API migration: a holder-appended block carrying an array, map,
  `null`, closure or `extern::` call — including one whose closure parameter name or map key
  embedded the `fbbe360` payload — was accepted; **closed** by rejecting those kinds as a class
  (exhaustive `Term`/`Op` matches) — the issuer never emits them, so their presence in a signed
  block is non-canonical, and the proof obligation stays at the 5.0 set instead of gaining three
  identifier channels;
- the guard runs on a token-only authorizer (`token.authorizer()`, no ambient fact, no policy,
  never executed) before revocation and structural validation; the verification order of
  `authz-biscuit/SECURITY.md` is unchanged, at the cost of one extra block translation per request.

## Contracts under datalog 3.3

The six `contracts/authz/*.datalog` policies are unchanged (byte-exact projection, drift gate
green). Under datalog 3.3 the `["read", "export"]` literal of every `[...].contains($operation)`
clause is an **array** (it was a set under 3.2; sets are now `{...}`). Membership semantics are
identical; `authz-biscuit` proves it with one positive and one negative case per authorizer
contract and a parse of all six files under parser 0.2.0 (fourteen operation lists, all string
arrays, the only collection literals in the contracts). The array form stays on the authorizer
side — never printed, never reparsed; the issuer's own attenuation binds a set.

## Closure and controls

- exact version pinned in each consumer's `Cargo.toml`; the vendored path substituted only for
  `=6.0.0`;
- default features disabled; no PEM, WASM, macro or full-regex feature enabled; `biscuit-quote` and
  both proc-macro-error families absent from the closure;
- synthetic opaque identifiers only; no personal, tenant-production or secret data;
- no external service and no US hyperscaler dependency;
- open protocol and Apache-2.0 implementation, with no vendor-specific data format;
- bounded authorizer execution: at most 256 facts, 32 iterations and 50 ms per decision;
- `cargo deny check bans licenses sources` blocking and `advisories` reported in CI; `cargo audit`
  reported; `reuse lint` and the declared-licence gate green with the vendored tree;
- `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D warnings` and
  `cargo test --locked --all-features` mandatory (clippy shows two upstream rustc warnings from
  the vendored crate — `unused import crate::crypto::PublicKey`, `parse_any_algorithm` never
  used — which `-D warnings` does not deny because the tree is not a workspace member; the copy
  is not edited beyond #306);
- every update of the vendored copy re-diffs it against the archive and re-runs the injectivity
  method; any change to the printer sources or to the paired parser version requires a new
  evidence record.

## Residual risks

- The vendored copy is a fork of a crates.io release until upstream publishes #306; its life is
  bounded by the removal condition above.
- `Authorizer::dump()` unwraps the conversion of block checks in 6.0 as in 5.0; a signed but
  malformed block could in principle panic rather than deny (pre-existing, unchanged).
- Two token loads per authorization (guard + decision).
- Advisory verdicts are time-dependent (non-blocking job, by design).

A mutation of `authz-biscuit`, a couche-3 brick, requires the two-role human review and the
owner's merge (K4); this note records the qualification, it does not grant production
authorization.
