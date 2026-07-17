# Candidate-integration review — `engine-golden-vectors-v1` @ `0a265ce`

- `reviewPassId`: `engine-golden-vectors-v1-candidate-integration-0a265ce-r1`
- `mode`: `candidate-integration`, strict review-only
- `role`: candidate-integration reviewer only; not Architecture, Security, promotion or owner control
- `date`: `2026-07-17T14:31:13Z`
- `provider/model`: OpenAI via pi/API; exact model identifier not exposed by this harness
- `session`: not exposed by this harness
- `target`: `0a265ce15d8871679cc7ca8693ce571432a057fb`
- `target tree`: `4f1f70ab0b29bdbe2c6efc856ee70db2771fa88a`
- `base`: first parent `6ee4627bda043ca3da11050c8d99e63a286cf321`
- `second parent`: `2607089` (`fix/engine-envelope-email-prose`)
- `authority`: `engine-golden-vectors-v1` remains `candidate`, `pending-independent-agent-review`, with required roles `architecture` and `security`

This review grants no Architecture or Security approval, no catalog promotion, no owner milestone, and no authorization for implementation, engine work, scoring, real-data processing, capability, release, infrastructure, Clever Cloud or deployment.

## Governance and history read

Read and applied: `AGENTS.md`, `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, `docs/adr/0003-wp-g2-s01-contract-amendment.md`, and `prompts/02-foundation-build.md`.

Read the full `docs/reviews/specialized-engine-v2/` dossier and all preserved stale approvals/rejections, including AE455, 3BAECF8, 39F776E, E6DF443, 9E74BAB, A4E74A6, 453B0A6, 79D02, 1523BCD, 26AC8FE, 77A4B1D and 6EE4627. Earlier approvals are stale and non-citable.

The reviewed delta from `6ee4627..0a265ce` is limited to `STATUS.md`, the specialized-engine dossier, `tools/quality/public-source-scanner.ts`, and `tools/quality/public-source-scanner.test.ts`. No schema, catalog status, generated projection, WIT/profile, corpus bytes, product engine, runtime capability or infrastructure file changed.

## Commands executed

### Bun / repository gates

- `bun --revision` → `1.4.0-canary.1+57f349f63`
- `bun install --frozen-lockfile` ✅
- `bun run check` ✅
  - contracts and all dedicated checkers green;
  - generated contracts green: `Verified 48 TypeScript contract projections`;
  - JS licenses green: `JavaScript dependency licenses verified: 47`;
  - `bun test`: `224 pass, 0 fail`.
- `bun audit` ✅ `No vulnerabilities found`

Log hashes:

- `/tmp/engine-envelope-0a2-bun-install.log` — `e46479379bd38cadf40e2fbd37101c6ce2e5a976e12dc35895731a960c50753b`
- `/tmp/engine-envelope-0a2-bun-check.log` — `a93f7f52533a5fd06c56123904297d5fed950f22fd302db19ca169fc1a8378c0`
- `/tmp/engine-envelope-0a2-bun-audit.log` — `da111885f1ced5ca5cd4ab06721e793d68cf1eff91ed36a35f4ca9b6c1bccf66`

### Rust / CI-equivalent gates

- `cargo fmt --all --check` ✅
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` ✅
- `cargo test --workspace --all-features` ✅
- `cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown` ✅
- `cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- target/wasm32-unknown-unknown/release/libre_ai_notebook_core.wasm` ✅
- reproducible Notebook Core WASM rebuild with temporary `CARGO_TARGET_DIR`, `cmp` ✅, both artifacts SHA-256 `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`
- `cargo deny check advisories licenses sources` ✅

Log hashes:

- `/tmp/engine-envelope-0a2-cargo-fmt.log` — `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `/tmp/engine-envelope-0a2-cargo-clippy.log` — `ddf8b94ae53af1e957b6687182be44fdcb82449fa688d809c437fc745ba64a9d`
- `/tmp/engine-envelope-0a2-cargo-test.log` — `099229aa618c3421d2eada6a3f079eea05dce1bc503d5193ad99491e4caf2947`
- `/tmp/engine-envelope-0a2-wasm-build.log` — `ed6d7d32cc998ac4ee5a715893ed69c6ca77c216da8f471a7dac43cc3639c74c`
- `/tmp/engine-envelope-0a2-wasm-imports.log` — `352720b08397f2827f82dcc03431e2fb07a6e86793d09b44f1148391a8324cef`
- `/tmp/engine-envelope-0a2-wasm-sha.log` — `51c46bf5c19b596e8a1a75d57ee0b09c490869e975212dcd308f1fe900f278f7`
- `/tmp/engine-envelope-0a2-cargo-deny.log` — `245deecd3483cc5322ad2199ecc5c9421e832e3f1e6d2f8419170f3c74bccf46`

## Independent actual-gate probes

All value/key mutations used an ephemeral `git archive` worktree outside the repository and ran the real `bun tools/quality/check-contracts.ts` gate. Probe source hash: `/tmp/engine-envelope-0a2-gate-probes.ts` — `44ec4f2a0787ed08b3807b19cc8264cd127dc54eff447f54043318c7d8783c1d`. Probe log hash: `/tmp/engine-envelope-0a2-gate-probes.log` — `61f9f2188e630cf12646c202d0df3ea0c32fb668192e9f7144ec4d5435d5e5a5`.

Confirmed with actual gate in both payload values and payload property keys:

- immediate 6EE forms now reject: `"alice@example.org"`, encoded quote prose, `contact:alice@example.org`, `Email:...`, `courriel:...`, `from:...`, `to:...`, `reply-to:...`;
- prior sensitive forms reject: mixed amp/numeric/named HTML chains, `&period;`, exact HTML5 atext aliases, legacy `&amp...` wrappers, quoted RFC local-parts, percent/numeric/named encoded quoted forms, full RFC6532 EAI scalars including private-use/C1/default-ignorable, CFWS/comments, IDN/punycode/IP literals, parenthesized and terminal-punctuation emails, URL userinfo and credentials;
- negative controls remain accepted: `release@2`, `"release"@2`, `R&D`, `R&amplitude`, `50%`, unresolved markers, encoded public URL text, inert traversal/file URI payloads, Unicode prose, non-HTML5 `&at;`, mixed-case `&CommaT;`, semicolonless non-HTML5 `&commat`, unknown colon label, `ali:ce@example.org`, comma local-token, non-ASCII domain separators, malformed dot-atoms, overlong local/domain labels and invalid quoted-local prefix/suffix;
- `/` remains correctly treated as RFC 5322 atext: `ali/ce@example.org` rejects as a valid sensitive email;
- preflight order is size → strict JSON → bounds → content scan → AJV → `contractFiles` resolution;
- `contractFiles` valid hash passes; hash mismatch, duplicates, traversal/URI shape, missing file and symlink fail;
- payload path/URI strings remain inert; metadata file URI is rejected by schema;
- Radar allowlist is exact file+value: committed Radar canary passes, same value in Notebook fails, altered Radar value fails;
- sensitive failures are non-reflective (`specialized vector contains a forbidden sensitive marker`).

The same probe found 4 failing expectations: internal prose quote forms are over-rejected in both values and keys (see blocking finding).

## Direct scanner and scaling probes

Direct probe source hash: `/tmp/engine-envelope-0a2-direct-probes.ts` — `2936200303d6f8f0f5856ecb941dbbd6001f27dba9ea76218390ebad72d615c5`. Direct probe log hash: `/tmp/engine-envelope-0a2-direct-probes.log` — `2e5b8094d46b66abf5bd12cf6f9767ce37c2a3de7b735aec925df9bf37858058`.

Confirmed:

- quote-prose positives, closed labels, unknown labels, colon local token, RFC6532 EAI, NFKC non-ASCII separator preservation, `/` atext, exact case-sensitive HTML5 behavior;
- no observed ReDoS: 65,536-code-point no-`@` ≈ `2.085ms`, many-`@` ≈ `4.838ms`, many-dot ≈ `2.377ms`, max malformed quoted local ≈ `2.152ms`, many prose quotes ≈ `1.963ms`, nested HTML chain ≈ `2.959ms`, NFKC expansion overflow ≈ `1.071ms`.

The direct scanner probe reproduces the same two quote-boundary failures as the actual gate: `foo"alice@example.org"` and `foo"alice@example.org` return `true` but should remain inert invalid/internal-quote forms under the current dossier requirement.

## Corpus, dependency and state evidence

Five public corpus audit log: `/tmp/engine-envelope-0a2-corpus-audit.log` — `99c537c54fc3fe3a6b7803afc8c27056a80b0c683fb57d6657c15cba5ba9ce7b`.

- Radar: 43 parse cases, 16 evaluation cases; only `@` hit is the locked synthetic canary `https://user:secret@example.org/feed.xml`.
- Notebook: no `@` hit.
- Policy v1: 17 cases, no `@` hit.
- Policy v2: 20 cases, no `@` hit.
- Boussole: 10 cases, no `@` hit.

Dependency/state log: `/tmp/engine-envelope-0a2-state-deps.log` — `54d6c7897effd2c01cf452c9cd8b908cec0be0d427853853b7af24d64e3a33bf`.

- `entities@8.0.0` exact-pinned, BSD-2-Clause, no dependencies/peers/optional dependencies, imported only by `tools/quality/public-source-scanner.ts`.
- Installed `entities/package.json` — `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`.
- Installed `entities/LICENSE` — `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`.
- Owner acceptance remains a future promotion prerequisite, not satisfied by this review.

Scope search log: `/tmp/engine-envelope-0a2-scope-search.log` — `694f542dff687c67dd330f40b292ed56664b1fbc1f599079f0b26eb49cb5fabf`. No product/runtime consumer or engine implementation was introduced; usage remains quality gate / Boussole checker / generated declarations / dossier references.

## Key SHA-256 evidence

Full 65-entry hash ledger: `/tmp/engine-envelope-0a2-sha256.txt` — `1b9d0f26f92b2bdcbc56cce2d93f71e6ea35b5f10450d38504c7506b56fa6963`.

Selected hashes:

- `STATUS.md` — `a832e8c571d3dffdb27375b86f38fd5eeaad86159ba5511bca12ae878fdd573f`
- `docs/reviews/AGENT-REVIEW-PROTOCOL.md` — `9e91b78c30a2ba82d20a7fe78d8bf4a2878ffa8c28046e3a44748d29b448a43f`
- `docs/reviews/specialized-engine-v2/README.md` — `17e6b9f6ec8ec6ecfda164e0b8de1a8d29bd96a8a1f21caf8c089d3b65f91b77`
- `docs/reviews/specialized-engine-v2/REMEDIATION.md` — `8298bfdc6d304319d574e07069a036d44bf45513afde76d284bf8a09ec7a7608`
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-6EE4627.md` — `72c470ba92e514415df3b7a92790c55e1a5dae82597ab1c02b657cb73248f247`
- `contracts/catalog.v1.json` — `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json` — `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- `contracts/fixtures/schema-fixtures.v1.json` — `fe1f1a274747a2f7393cb4763e23d71d913bf0be883add6cde2d4501af9d7d28`
- `packages/contracts/src/generated/manifest.json` — `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` — `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- `tools/quality/public-source-scanner.ts` — `6324d3603b2f6ea32dc39204bb61b9cdd5fc8ea46c8d5a3ae80165ae911552b6`
- `tools/quality/public-source-scanner.test.ts` — `fddb23f0d3510332a9fac9abbb2f5a87eab8a308fbed9105f6da1f5b7cf2b658`
- `tools/quality/check-contracts.ts` — `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- Radar golden — `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`
- Notebook golden — `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`
- Policy v1 golden — `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`
- Policy v2 golden — `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`
- Boussole golden — `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`
- `package.json` — `5412a80c99ed881be7a8bd8436c027fef3f2fbd5d4244864bd59a2382a0a3284`
- `bun.lock` — `33eb37be9f9938f413dc6d3e39a03a6cc7e4ec8830878b236b1f8d5e32981439`
- `Cargo.lock` — `be5925fce192087993350f87c9d3527f4aaa65e4f81ae1dc64bf1fa77c363a20`

## Findings

### Blocking

#### ENGENV-0A2-BLK-001 — internal prose quotes are incorrectly treated as valid opening delimiters for dot-atom email suffixes

`tools/quality/public-source-scanner.ts:158-166` precomputes every first unescaped `"` in a toggled pair as an opening quote. `hasValidLocalBoundary` at `tools/quality/public-source-scanner.ts:177-187` then accepts that quote as a boundary without checking whether the quote itself is preceded by a valid prose boundary. As a result, an internal quote embedded in an opaque token creates a new local-part start and over-rejects the suffix as an email.

Reproduced by direct scanner:

- `containsSensitivePublicMarker('foo"alice@example.org"')` → `true`, expected `false`;
- `containsSensitivePublicMarker('foo"alice@example.org')` → `true`, expected `false`.

Reproduced through the actual shared gate in an ephemeral worktree, for both payload values and payload property keys:

- `FAIL value allowed internal quote before dot-atom prose rc=1 specialized vector contains a forbidden sensitive marker`;
- `FAIL key allowed internal quote before dot-atom prose rc=1 specialized vector contains a forbidden sensitive marker`;
- `FAIL value allowed unclosed internal quote before dot-atom rc=1 specialized vector contains a forbidden sensitive marker`;
- `FAIL key allowed unclosed internal quote before dot-atom rc=1 specialized vector contains a forbidden sensitive marker`.

This contradicts the current dossier claim that the remediation preserves `quotes internes/fermantes invalides` / `closing/internal quote suffixes`, and violates the envelope boundary that opaque engine payload strings should remain representable unless they are decoded high-confidence public identifiers. The self-tests cover `x"alice"@example.org` and `"alice"x@example.org`, but not a dot-atom suffix after an internal prose quote; therefore the full CI is green while the boundary remains wrong.

### Warnings / non-blocking

- `entities@8.0.0` is technically qualified and local/dev-only, but explicit owner acceptance remains required before any future catalog promotion.
- Runtime conformance, product implementation, public scoring, real-data processing and end-to-end tenant/RLS proof remain out of scope and unauthorized.

## Clean-state proof

Final cleanup removed `node_modules`, `target`, the temporary WASM rebuild directory and the probe worktree. Clean-state log: `/tmp/engine-envelope-0a2-clean-state.log` — `8fee1fc42f41fa05aee86ae10b5ca0de91b5cc1afe0601ef172873803c26124a`.

```text
HEAD=0a265ce15d8871679cc7ca8693ce571432a057fb
TREE=4f1f70ab0b29bdbe2c6efc856ee70db2771fa88a
BRANCH=## HEAD (no branch)
STATUS=0 tracked/porcelain entries
UNSTAGED=empty
STAGED=empty
node_modules=absent
target=absent
probe_worktree=absent
```

`git status --short --branch` after review: `## HEAD (no branch)`.

VERDICT: reject candidate-integration — internal prose quote forms are still over-rejected by the actual shared gate in payload values and keys, contrary to the required preservation of invalid/internal quote forms.