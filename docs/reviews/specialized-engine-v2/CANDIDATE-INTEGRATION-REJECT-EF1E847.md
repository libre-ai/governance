# Candidate-integration review — `engine-golden-vectors-v1` @ `ef1e847`

- `reviewPassId`: `engine-golden-vectors-v1-candidate-integration-ef1e847-r1`
- `mode`: strict review-only candidate-integration
- `role`: candidate-integration reviewer only; not Architecture, Security, promotion, merge, release or owner control
- `target`: `ef1e84730e6881f539f25a6f9e78385320869df1`
- `target tree`: `45c2e209ea9a473eb9e55b279006bd2d40b9eff5`
- `parents`: `da99d31e36e94c852841310e696d1a4bc9cf9d18`, `b905f2971cd25970ed1ddd69a15c110575e72efe`
- `provider/model`: OpenAI via pi/API; exact model/session identifiers are not exposed by this harness
- `authority`: `engine-golden-vectors-v1` remains `candidate`, `pending-independent-agent-review`, with required roles `architecture` and `security`
- `separation`: review-only pass; no tracked repository file was edited, committed, pushed, merged, promoted or released. This record is written only to `/tmp/engine-envelope-integration-ef1.draft.md`.

## Protocol, dossier and surfaces reviewed

Read/applied `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `prompts/02-foundation-build.md`, `docs/adr/0003-wp-g2-s01-contract-amendment.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, and the specialized-engine-v2 dossier/history including stale approvals, all candidate-integration rejects through `0A265CE`, `CANDIDATE-INTEGRATION-DA99D31.md`, `ARCHITECTURE-VERDICT-DA99D31.md`, `SECURITY-VERDICT-DA99D31.md`, dependency qualification, README and REMEDIATION.

Reviewed the current delta from `da99d31` to `ef1e847`: only `STATUS.md`, DA99 review records/docs, `REMEDIATION.md`, `README.md`, and `tools/quality/public-source-scanner.ts` changed. The shared schema, catalog, generated projections and five public corpora are byte-identical to DA99.

Reviewed relevant surfaces: `contracts/catalog.v1.json`, `contracts/schemas/engine-golden-vectors.v1.schema.json`, generated TS manifest/declaration, all five golden corpora plus Radar/Boussole security vectors, `tools/quality/check-contracts.ts`, `public-source-scanner.ts` and tests, all dedicated Radar/Notebook/Policy/Boussole checkers, package/lock/license evidence, Cargo workspace/deny config and CI workflow.

## Gates reproduced

Initial and final clean-state checks verified exact detached HEAD and no porcelain entries.

Toolchain:

- Bun `1.4.0-canary.1+57f349f63`
- `rustc 1.97.0 (2d8144b78 2026-07-07)`
- `cargo 1.97.0 (c980f4866 2026-06-30)`

Commands:

- `bun install --frozen-lockfile` ✅
- `bun run check` ✅ — contract gate and all dedicated vector checkers green; generated TS projections `48`; JS licenses `47`; Biome/TypeScript green; Bun tests `235 pass, 0 fail`.
- `bun audit` ✅ — no vulnerabilities.
- `cargo fmt --all --check` ✅
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` ✅
- `cargo test --workspace --all-features` ✅ — 40 Rust tests plus doc tests.
- `cargo clippy --locked --workspace --all-targets --all-features -- -D warnings` ✅
- `cargo test --locked --workspace --all-features` ✅
- `env -u CARGO_TARGET_DIR cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown` ✅
- `env -u CARGO_TARGET_DIR cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- target/wasm32-unknown-unknown/release/libre_ai_notebook_core.wasm` ✅ — 0 module imports, 0 component imports, 512 MiB memory cap.
- Reproducible Notebook Core WASM rebuild ✅ — both artifacts `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`.
- `cargo deny check advisories licenses sources` ✅

## Independent probes

### Scanner and actual shared gate

Direct scanner probes passed 27/27 cases plus exported self-tests and exact HTML5 case behavior. The matrix included DA99 blockers and prior families: generic `ssh://`, `git://`, custom-scheme and encoded URI userinfo; DSA/OpenPGP/PKCS#8-encrypted private-key headers and encoded DSA; direct/percent/%u/numeric/named/nested HTML email forms; quoted local-parts; prose quote positives/negatives; CFWS/comments; EAI/IDNA/punycode; terminal punctuation; context labels; and false-positive controls (`release@2`, `R&D`, encoded public URL, inert `file:` URI, unknown labels and non-ASCII separators).

Actual `bun tools/quality/check-contracts.ts` probes in `git archive` copies passed 17/17 value/key cases. The real shared gate now rejects the DA99 blocker values and keys non-reflectively:

- `ssh://user:secret@example.org/repo.git`
- `git://git@example.org/repo.git`
- `custom+v1://user@example.org/resource`
- encoded `ssh://user@example.org/...`
- `-----BEGIN DSA PRIVATE KEY-----`
- `-----BEGIN PGP PRIVATE KEY BLOCK-----`
- `-----BEGIN ENCRYPTED PRIVATE KEY-----`
- encoded DSA header

Negative payload/key controls remained accepted through the actual gate.

### Corpora, Radar allowlist, contractFiles and metadata/payload split

Corpus scanner audit:

- Radar golden: 854 nodes, 509 strings, 786 keys, exactly one scanner hit — the locked synthetic Radar userinfo canary.
- Notebook golden: 573 nodes, 315 strings, 521 keys, no hit.
- Policy v1 golden: 1,521 nodes, 1,116 strings, 1,375 keys, no hit.
- Policy v2 golden: 1,913 nodes, 1,408 strings, 1,730 keys, no hit.
- Boussole golden: 822 nodes, 539 strings, 741 keys, no hit.

Additional actual-gate probes passed: baseline Radar canary allowlist, altered Radar canary rejection, moved canary rejection, `contractFiles` duplicate/hash/missing/symlink failures, metadata `file:` rejection and inert payload `file:` acceptance.

Dependency check: `entities@8.0.0` is exact-pinned, BSD-2-Clause, dependency-free (`deps=0`, `peer=0`, `optional=0`) and imported only by the quality-time scanner.

Selected hashes:

- scanner `f37e28f6cd36563452ab2267de0585c7f3b496770cd5c88218139ef7383bf352`
- scanner tests `fddb23f0d3510332a9fac9abbb2f5a87eab8a308fbed9105f6da1f5b7cf2b658`
- shared gate `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- shared schema `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- catalog `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- generated declaration `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- generated manifest `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
- `entities` manifest/license `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a` / `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`

## Findings

### Blocking

#### `ENGINT-EF1-BLK-001` — the canonical JSON Schema metadata boundary still accepts the remediated private-key headers

The scanner/gate remediation is effective, but the canonical schema surface was not remediated. `contracts/schemas/engine-golden-vectors.v1.schema.json:77-84` still uses the pre-DA99 metadata credential pattern:

```json
"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"
```

It does not include DSA, OpenPGP private-key blocks or PKCS#8 encrypted private-key headers, while `tools/quality/public-source-scanner.ts:7` does. A schema-only AJV 2020 probe, using the same schema style as the contract registry, mutated a valid specialized-engine vector metadata field (`status`) and produced:

```text
-----BEGIN DSA PRIVATE KEY----- true
-----BEGIN PGP PRIVATE KEY BLOCK----- true
-----BEGIN ENCRYPTED PRIVATE KEY----- true
-----BEGIN RSA PRIVATE KEY----- false
```

This leaves the canonical contract/registry/generated-schema surface inconsistent with the remediated scanner and with the dossier claim that metadata recursively rejects high-confidence private-key markers. Repository publication gates currently catch these values before AJV, but the schema contract itself remains a reusable boundary and is explicitly in scope for candidate integration. The fix should align `metadataString` with the scanner marker set and add schema/registry regression evidence, without changing payload opacity or adding resolver semantics.

### Non-blocking confirmations

- The actual shared publication gate now closes the DA99 value/key bypass for generic URI userinfo and DSA/OpenPGP private-key headers, including encoded forms.
- Prior email/HTML/CFWS/IDNA/EAI/prose/false-positive controls remained green in direct and actual-gate probes.
- `contractFiles` remains the only resolved file surface; payload paths/URIs remain inert.
- The Radar sensitive-looking canary remains exact file/value scoped.
- No product runtime, engine implementation, real-data processing, scoring, infrastructure, deployment, hosted API, telemetry or secret path is introduced.
- The catalog still correctly keeps `engine-golden-vectors-v1` as `candidate` with Architecture and Security role reviews pending.

## Clean-state proof

After cleanup of `node_modules`, `target` and temporary Rust target directories:

```text
HEAD=ef1e84730e6881f539f25a6f9e78385320869df1
TREE=45c2e209ea9a473eb9e55b279006bd2d40b9eff5
PORCELAIN=empty
```

## Verdict

VERDICT: reject candidate-integration — the actual scanner/gate remediation for DA99 userinfo and DSA/OpenPGP markers is green, but the canonical `engine-golden-vectors.v1` JSON Schema metadata boundary still accepts DSA, OpenPGP and encrypted private-key headers under schema-only contract validation, leaving the schema/catalog/generated surface inconsistent with the remediated gate.
