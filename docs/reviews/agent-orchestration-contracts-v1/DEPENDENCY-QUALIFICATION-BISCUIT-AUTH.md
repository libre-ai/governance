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
selected at the contracts-v1 promotion (recorded as promotion-time evidence in
`PROMOTION-PACKAGE.md`, "Additional exact conformance evidence" — a dated pointer there names this
note as the current state) as a test-only dependency of `ecosystem-engine`, after `6.0.0`
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
to the checksum above, `Cargo.toml.orig` included — tracked with `git add -f` because common
global gitignores exclude `*.orig`; the round-1 review found it silently dropped) plus exactly
the #306 hunks, committed as `third_party/patches/biscuit-auth-6.0.0-upstream-306.diff`.
`PATCH.md` in that directory records the provenance, the diff, the qualification steps for every
update, the two upstream rustc warnings the copy emits under the reduced feature set (recorded,
never silenced in the tree) and the removal condition. The REUSE annotation keeps the tree and the
diff under their upstream Apache-2.0 licence and copyright; the declared-vs-effective licence gate
excludes `third_party/` by doctrine (`LICENSING.md`, "Third-party material").

**Provenance gate (machine-checked, blocking):** `scripts/verify-vendored-biscuit-auth.sh`
downloads the archive from `static.crates.io`, verifies its SHA-256 against the value declared in
`PATCH.md`, applies the committed diff and `diff -r`s the result against the vendored tree (only
`PATCH.md` may differ). It is a blocking step of the `dependency-policy` CI job and the single
local command of `PATCH.md` step 1. It replaces the registry checksum that `Cargo.lock` enforced
for 5.0.0 and that a path patch removes; without it, an edit under `third_party/` — 32 000 lines
including the signature verifier — would be reviewed by eye only.

**Fleet form — one copy, consumed by rev-pinned organisation git-dep (ADR-0031):** the copy lives
in the repository that qualifies it (`authz-biscuit`). `ecosystem-engine` carries no second copy:
its `[patch.crates-io]` points at the `authz-biscuit` repository by full git `rev` (cargo resolves
the package by name inside the repository; `cargo deny check sources` accepts it under
`[sources.allow-org] github = ["libre-ai"]`), and it carries the **orphan-rev gate**
(`scripts/check-patch-rev.ts`, in `bun run check`): the rev must compare `identical` or `behind`
against `authz-biscuit` `main`, otherwise red. A pull request pinned on an unmerged branch head is
red by construction until the re-pin that follows the producer's squash-merge (read the merge
commit, replace `rev`, `cargo update -p biscuit-auth`, rerun the gate). The round-1 architecture
pass had found that this form contradicted the letter of ADR-0020 §2.5 ("the patch follows each
final workspace"), that a stale rev keeps resolving indefinitely (GitHub keeps pull-request refs)
and that cargo picks between two same-named copies by directory walk with a warning; the owner
arbitrated the form and ADR-0031 amends §2.5 accordingly (single home, secondary consumers by
git-dep, orphan-rev gate required, copy = archive + committed diff).

Alternatives set aside: enabling `datalog-macro` (re-introduces the unmaintained proc-macro
family the 5.0 pin was chosen to avoid); a git dependency on upstream `main` past #306 (unpinned
crypto and datalog changes on the way to 7.0 — see below — and no registry checksum to qualify);
a fork repository (a second remote to govern for five lines of `use`); a second `third_party/`
copy in `ecosystem-engine` (§2.5 literal — two trees to keep byte-equal by hand, no gate sees
their drift).

Precedent: `notebook/third_party/rustcrypto-aes-0.8.4` (ADR-0020 §2.5), where `notebook` is both
the qualifying home and the only consumer — consistent with ADR-0031 D1.

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
the `fbbe360` method (`authz-biscuit` `evidence/reviews/bfc2c0d/`, round 1), then re-reviewed by
two independent K4 passes per round, whose verdicts live in this repository under
`docs/reviews/biscuit-auth-6/<reviewed head>/` (one `README.md` plus one `*.verdict.json` per
role): round 1 (`81ce4b5/`: security accept, architecture reject — the record credited tests that
never reached the guard branches they were cited for, 12 of 18 mutants survived), after which the
record was re-issued as `evidence/reviews/81ce4b5/` (round 2), which supersedes `bfc2c0d/`; round
2 (`d65e877/`: security accept, architecture reject on one untested refusal branch —
`begin_rotation`'s P-256 refusal, mutant M28 surviving — plus the two design-level majors on the
companion deliverables: the orphan-rev gate green on forms it does not parse, and the invariant
claim of ADR-0031, resolved by I-05 widened and I-28). No double accept yet; the round-3 record of
`authz-biscuit` supersedes `81ce4b5/` when issued. What the round-2 record holds:

- **proved faithful and relied upon** (round-trip tests): string terms over every byte
  `0x01..=0x7f` except `"` and `\` plus UTF-8; sets (`{..}`, members in symbol-table order) and
  `{,}` vs `{}`; strict vs lenient equality (`===`/`!==` vs `==`/`!=`); dates up to
  `9999-12-31T23:59:59Z` (`253402300799`); rule-level key scopes (`ed25519/<hex>`);
- **rejected by the guard, one test per rule, each proved to turn red under its mutant** (26
  mutants replayed: 24 killed, 2 equivalent by construction — `Term::Parameter` cannot be
  signed, a token-only authorizer holds no policy): `"`/`\` in any string, non-identifier
  variable and predicate names in facts, rule heads, rule bodies and check bodies, `null`,
  arrays, maps, closures, `extern::` calls (the datalog 3.3 class), the strict `And`/`Or`
  (printed `&&!`/`||!`, read back as `&& !x`), `try_or` and the lazy `&&`/`||` in binary form
  (reparse inserts a closure), dates above `253402300799` (print as 1969 or `<invalid date>`),
  and a block-level scope on block 0 or 1 — read on the decoded structure, since
  `Block::print_source` never prints one (round 1 had a dead `parsed.scopes` check and an
  over-claim in `SECURITY.md`);
- every forgery of those tests lives in block 2, which no structural validator reads, so
  `auth.biscuit_invalid` is attributable to the guard alone;
- the guard runs on a token-only authorizer (`token.authorizer()`, no ambient fact, no policy,
  never executed) before revocation and structural validation; the verification order of
  `authz-biscuit/SECURITY.md` is unchanged. The second load is measured, not asserted: the
  ignored test `double_load_cost_is_measured` (`tests/authz.rs`) times it against a full
  `authorize()`, and the figure is held by the current evidence record of `authz-biscuit`, not
  restated here — the round-2 architecture pass replayed it at a different share and noted that
  the measure covers the token-only load, not the guard pass (`dump()` walk + `snapshot()`);
  the round-3 record re-measures it;
- Ed25519 is enforced, not asserted: 6.0 keys are algorithm-tagged and every key entry point
  (`BiscuitIssuer::new`, `VerificationKeyRing::new`, `begin_rotation`) refuses a P-256 key;
- `SECURITY.md` claims exactly those two lists and states that constructs outside both are not
  claimed either way; holder attenuation written in datalog 3.3 idioms is documented as denied
  as a class.

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
- the provenance gate (`scripts/verify-vendored-biscuit-auth.sh`) is blocking in CI and rerun
  locally on every update of the vendored copy; any change to the printer sources or to the
  paired parser version requires a new evidence record, and the mutation replay of the guard is
  part of that record;
- `ecosystem-engine` runs the orphan-rev gate (`check:patch-rev`) in `bun run check` (ADR-0031 D3).

## Residual risks

- The vendored copy is a fork of a crates.io release until upstream publishes #306; its life is
  bounded by the removal condition above, which no gate dates: the day 7.0.0 publishes, the only
  signal is a Dependabot bump that turns the `[patch]` into a cargo warning.
- `Authorizer::dump()` unwraps the conversion of block checks in 6.0 as in 5.0; a signed but
  malformed block could in principle panic rather than deny (pre-existing, unchanged). Two
  further panics are reachable through `biscuit_auth::builder` directly (a `Term::Parameter` in a
  check expression at `append`; a malformed key in a `trusting` scope string), never from
  `authorize()`.
- Two token loads per authorization (guard + decision): the share of `authorize()` is measured by
  `double_load_cost_is_measured` and recorded in the current evidence record of `authz-biscuit`
  (single run, no variance reported; token-only load, guard pass not included — see the round-2
  architecture verdict).
- Constructs the printer can emit that are in neither of the two proved lists of `SECURITY.md`
  (bitwise, arithmetic, set algebra, prefix/suffix/regex, length/type, negate/parens,
  comparisons, `i64` extremes, bytes) were probed faithful by the security pass but are not
  covered by a committed test and are not claimed.
- A token issued by a 5.0.0 build authorizing under 6.0.0 is asserted by reading (`Term::Set` in
  the binary, printed `{..}`), not executed.
- Advisory verdicts are time-dependent (non-blocking job, by design).

A mutation of `authz-biscuit`, a couche-3 brick, requires the two-role human review and the
owner's merge (K4); this note records the qualification, it does not grant production
authorization.
