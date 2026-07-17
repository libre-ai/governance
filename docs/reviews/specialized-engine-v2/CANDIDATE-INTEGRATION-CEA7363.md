# Candidate-integration review — `engine-golden-vectors-v1` @ `cea7363`

- `reviewPassId`: `engine-golden-vectors-v1-candidate-integration-cea7363-r1`
- `mode`: strict review-only `candidate-integration`
- `role`: candidate-integration reviewer only; not Architecture, Security, promotion, merge, release or owner control
- `reviewedAt`: `2026-07-17T17:40:19Z`
- `provider/model/session`: OpenAI via pi/API; exact model and session identifiers are not exposed by this harness
- `target`: `cea73631ac69c0a53549f63f521aca8ee3326a02`
- `target tree`: `268ffa6c000ca18719a7499a0d4c362e37c187e3`
- `base / first parent`: `ef1e84730e6881f539f25a6f9e78385320869df1`
- `second parent`: `abfbd623a9fd025413ec6fb1c7063fe1bee43d5e`
- `patch SHA-256` from `ef1e847..cea7363`: `9bb1a051e6a637d7941093c8d2a6825274a67d57b970469b68c955aae031f305`
- `target delta`: `STATUS.md`, `contracts/fixtures/schema-fixtures.v1.json`, `contracts/schemas/engine-golden-vectors.v1.schema.json`, `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-EF1E847.md`, `docs/reviews/specialized-engine-v2/README.md`, `docs/reviews/specialized-engine-v2/REMEDIATION.md`, `packages/contracts/src/generated/manifest.json`
- `authority state`: `engine-golden-vectors-v1` remains `candidate`, `pending-independent-agent-review`, required roles `architecture` and `security`.

This review grants no Architecture or Security approval, no catalog promotion, and no product, data, runtime, release, infrastructure, Clever Cloud or deployment authorization.

## Protocol, dossier and surfaces reviewed

Read/applied `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `prompts/02-foundation-build.md`, `docs/adr/0003-wp-g2-s01-contract-amendment.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, and the complete `docs/reviews/specialized-engine-v2/` dossier, including the immediately preceding EF1 rejection and remediation notes.

Inspected current schema/catalog/generated/fixture/corpus/shared-gate/scanner/dependency/dedicated-checker surfaces: `engine-golden-vectors.v1.schema.json`, catalog entry, schema fixtures, generated manifest/declaration, five public corpora plus Radar/Boussole security fixtures, `check-contracts.ts`, `public-source-scanner.ts` and tests, Radar/Notebook/Policy v1/Policy v2/Boussole checkers, strict JSON helper, package/lock/license evidence, Rust contract projections, CI workflow and `deny.toml`.

## Commands and gates reproduced

Initial immutable preflight: exact detached clean HEAD, tree and parents verified; Bun `1.4.0-canary.1+57f349f63`; Rust/Cargo `1.97.0`; `cargo-deny 0.19.5`.

Green gates:

- `bun install --frozen-lockfile` ✅
- `bun run check` ✅ — exact toolchain, contracts, all dedicated vector checkers, Notebook Gate A, generated contracts (`48`), licenses (`47`), Biome, TypeScript, `235 pass / 0 fail`
- `bun audit` ✅ no vulnerabilities
- `cargo fmt --all --check` ✅
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` ✅
- `cargo test --workspace --all-features` ✅
- additional `cargo clippy --locked ...` ✅ and `cargo test --locked ...` ✅
- `env -u CARGO_TARGET_DIR cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown` ✅
- `env -u CARGO_TARGET_DIR cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- target/wasm32-unknown-unknown/release/libre_ai_notebook_core.wasm` ✅ — 0 module imports, 0 component imports, 512 MiB cap
- reproducible WASM rebuild ✅ — both artifacts `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`
- `cargo deny check advisories licenses sources` ✅

One auxiliary boundary-acceptance probe initially failed from a probe-script syntax error, not repository behavior; it was recorded and replayed successfully (`boundary-accept-rerun`). No repository gate failure was hidden.

## Independent probes

Probe log `/tmp/engine-envelope-cea-probes.log` (`1d5087d4bf1cb2a2bd21ce1264a309b5f95f0082a5c540b29bbf923a66c98d74`) used disposable `git archive` copies and the real `bun tools/quality/check-contracts.ts` gate.

Confirmed:

- Direct scanner matrix: 119 cases green, covering prior RFC6532 EAI, HTML5 exact/legacy decoding, CFWS/comments, IDNA/punycode/IP literals, prose labels, quote boundaries, terminal punctuation, URL userinfo and false-positive controls.
- Schema/scanner agreement: schema metadata rejects generic/RSA/DSA/EC/OpenSSH/encrypted-PKCS#8/OpenPGP private-key headers, generic URI userinfo and encoded forms; payload schema remains opaque for the same strings/keys.
- Actual publication gate rejects those sensitive values and keys non-reflectively, including encoded DSA and generic `ssh://`, `git://`, custom-scheme and HTML/percent-encoded URI userinfo.
- Actual gate rejects selected prior positive matrix families in both values and keys: direct/percent/%u/numeric/named/mixed HTML email, quoted local-parts, EAI private-use/C1/default-ignorable/noncharacters, CFWS, IDNA, punycode, IPv4/IPv6 literals, parenthesized/prose/labelled/trailing-punctuation emails, and RFC slash atext.
- Actual gate preserves false positives in values and keys: `release@2`, `"release"@2`, `R&D`, `R&amplitude`, `50%`, unresolved markers, encoded public URL text, inert traversal/file URI payloads, Unicode prose, non-ASCII domain separators, malformed dot-atoms/domains, overlong local/domain labels and invalid/internal quote forms.
- Strict preflight and bounds: >8 MiB, BOM, invalid UTF-8, duplicate member, unpaired surrogate, invalid number, depth 65, 65,537-code-point string, 4,097 array items, 513 object keys, 129-code-point key and NFKC expansion overflow all reject. Exact 8 MiB, 65,536 code points, 4,096 items, 512 properties, 128-code-point key and depth 64 pass in `/tmp/engine-envelope-cea-boundary-accept-rerun.log` (`896b30dad8db16f3d3212eb87bc70996e11b478fc142d54b8dc797cf64a200a5`).
- `contractFiles` only is resolved: valid hash passes; duplicate, mismatch, traversal/URI shape, missing target and symlink fail. Payload file URI remains inert; metadata file URI rejects.
- Radar canary allowlist is exact file+value only: exact Radar value passes; altered Radar value and moved Notebook value reject.
- Generated hash binding: manifest schema SHA equals live schema SHA.
- Dependency qualification: `entities@8.0.0` exact-pinned, BSD-2-Clause, no dependencies/peers/optional deps, imported only by the quality scanner.
- Code scope search found no product/runtime consumer of the generated shared type; scanner is used by quality gate/test and Boussole remains the only direct shared-envelope corpus consumer.

## SHA evidence

Selected current authority hashes:

- `contracts/catalog.v1.json` — `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json` — `443f6fbee0a949ec47b5bf3081b3039e4ddac630eded8dc32c96223f82c74f58`
- `contracts/fixtures/schema-fixtures.v1.json` — `b46508330dd252230abd690523e506e5ebe2ae9ef4799a6fcf739982099de760`
- `packages/contracts/src/generated/manifest.json` — `b9b701cdeab1f6f764e4e7ab00f4554c3954a2e123b0c57916ac0358126b0287`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` — `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- `tools/quality/public-source-scanner.ts` — `f37e28f6cd36563452ab2267de0585c7f3b496770cd5c88218139ef7383bf352`
- `tools/quality/public-source-scanner.test.ts` — `fddb23f0d3510332a9fac9abbb2f5a87eab8a308fbed9105f6da1f5b7cf2b658`
- `tools/quality/check-contracts.ts` — `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- EF1 reject record — `12ecbf1bd2b0f0add59588fd21e49bbdcd676a01a4b69cd46ceb113104c19b22`
- dossier README / remediation — `acb1e635bacd43774973ed2d5cb35d6753b647e1c1ded6e73b6bca58ab1c6c0e` / `235ae347ffa2a0e6a2b5a1a1fa0cd6160c9ab7b5e1cb3c45971210478efd25af`
- five golden corpora: Radar `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`, Notebook `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`, Policy v1 `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`, Policy v2 `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`, Boussole `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`
- `entities/package.json` / `LICENSE` — `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a` / `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`
- full source/hash ledger — `/tmp/engine-envelope-cea-source-hashes.txt` `f7df87a5de199565a329761bde5f38e7fb07fe0d1a1e480c951445ad733de9d5`
- full evidence ledger — `/tmp/engine-envelope-cea-evidence-hashes.txt` `e93c2ee5c0e60c0bec7597288dc27c642dcf788771b96e0b216e5d5be3bde809`

## Findings

### Blocking

None.

### Non-blocking confirmations / reservations

- The EF1 schema/scanner drift is closed: `metadataString` now aligns with the scanner private-key marker set, and negative schema fixtures exercise DSA/OpenPGP/encrypted PKCS#8 metadata.
- The repository publication gate remains closed for the tested sensitive values/keys while payload schema semantics stay opaque.
- `engine-golden-vectors-v1` is still candidate-only; fresh Architecture and Security role reviews, a separate promotion pass and owner milestone remain required before `candidate -> locked`.
- `entities@8.0.0` is technically qualified as local dev-only evidence, but explicit owner acceptance remains a future promotion prerequisite.

## Residual risks and non-authorization

Runtime conformance, product engine implementation, public scoring, real/personal/tenant-data processing, network/storage/secret capabilities, release, infrastructure and deployment remain out of scope and unauthorized. Any normative change to schema, scanner, corpora, generated bindings or dependency state makes this evidence stale.

## Clean-state proof

After removing `node_modules`, `target`, probe worktrees, WASM rebuild dir and external Cargo target:

```text
HEAD=cea73631ac69c0a53549f63f521aca8ee3326a02
TREE=268ffa6c000ca18719a7499a0d4c362e37c187e3
BRANCH=## HEAD (no branch)
PORCELAIN_COUNT=0
UNSTAGED=
STAGED=
node_modules=absent
target=absent
gate_work=absent
wasm_rebuild=absent
external_cargo_target=absent
```

Clean-state log SHA-256: `b29c737c7b259ebb9a348128da00527d3a6ff2d4db4bbf495396f7fc3076ed6d`.

VERDICT: approve candidate-integration — exact clean target verified; the EF1 schema/scanner metadata drift is closed; scanner, schema, generated hash binding, publication gate, corpora, dedicated checkers, dependency qualification, prior email/URI/private-key matrices, Bun/Rust CI-equivalent gates, reproducible WASM/import and cargo-deny evidence are green while authority remains candidate-only and no product/data/runtime/release scope is authorized.
