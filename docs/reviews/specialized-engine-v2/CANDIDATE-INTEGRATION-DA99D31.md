# Candidate-integration review — `engine-golden-vectors-v1` @ `da99d31`

- `reviewPassId`: `engine-golden-vectors-v1-candidate-integration-da99d31-r1`
- `mode`: strict candidate-integration review-only
- `role`: candidate-integration reviewer only; not Architecture, Security, promotion, merge, release or owner control
- `date`: `2026-07-17T14:52:10Z`
- `provider/model`: OpenAI via pi/API; exact model identifier not exposed by this harness
- `session`: not exposed by this harness
- `target`: `da99d31e36e94c852841310e696d1a4bc9cf9d18`
- `target tree`: `581b7e9e855309fd05ad3488b8f0bc9e23c902ff`
- `base`: first parent `0a265ce15d8871679cc7ca8693ce571432a057fb`
- `second parent`: `8de5541b993675a43f1795e989e397fba312a4ad` (`fix/engine-envelope-quote-boundary`)
- `patch SHA-256` from `0a265ce..da99d31`: `86e03e671dfe5bf2c1c1bb17f0b4ee3a326fa82805bb04dd258fbfbc90bee02f`
- `authority`: `engine-golden-vectors-v1` remains `candidate`, `pending-independent-agent-review`, with required roles `architecture` and `security`

This review grants no Architecture or Security approval, no catalog promotion, no owner milestone, and no authorization for product/runtime/data/release/deployment, scoring, real-data processing, capability, infrastructure or Clever Cloud.

## Governance, dossier and candidate surface read

Read and applied: `AGENTS.md`, `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `docs/adr/0003-wp-g2-s01-contract-amendment.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, and `prompts/02-foundation-build.md`.

Read the specialized-engine dossier/history, including stale approvals and all preserved integration/security rejects: AE455, 3BAECF8, 39F776E, E6DF443, 9E74BAB, A4E74A6, 453B0A6, 79D02, 1523BCD, 26AC8FE, 77A4B1D, 6EE4627 and 0A265CE. Earlier approvals remain stale/non-citable after later blockers.

Reviewed candidate surface: `STATUS.md`, `docs/reviews/specialized-engine-v2/`, `tools/quality/public-source-scanner.ts`, scanner tests, `tools/quality/check-contracts.ts`, schema/catalog/generated projections, five public synthetic corpora, dedicated engine checkers, package/lock/license data and CI workflow. The effective first-parent delta is limited to five files: `STATUS.md`, `CANDIDATE-INTEGRATION-REJECT-0A265CE.md`, `README.md`, `REMEDIATION.md`, and `tools/quality/public-source-scanner.ts`; no schema/catalog status/corpus/projection/WIT/profile/product/runtime/infrastructure file changed.

## Commands and gates executed

Initial immutable preflight:

- `git rev-parse HEAD` → exact target `da99d31e36e94c852841310e696d1a4bc9cf9d18`
- `git status --porcelain=v1` → 0 entries
- `bun --revision` → `1.4.0-canary.1+57f349f63`
- `rustc --version` → `rustc 1.97.0 (2d8144b78 2026-07-07)`
- `cargo --version` → `cargo 1.97.0 (c980f4866 2026-06-30)`

Bun gates:

- `bun install --frozen-lockfile` ✅
- `bun run check` ✅ — contracts and all dedicated vector checkers green; generated contracts `Verified 48 TypeScript contract projections`; JS licenses `47`; Biome/TypeScript green; `227 pass, 0 fail` Bun tests
- `bun audit` ✅ — `No vulnerabilities found`

Rust CI-equivalent gates:

- `cargo fmt --all --check` ✅
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` ✅
- `cargo test --workspace --all-features` ✅
- `env -u CARGO_TARGET_DIR cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown` ✅
- `env -u CARGO_TARGET_DIR cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- target/wasm32-unknown-unknown/release/libre_ai_notebook_core.wasm` ✅ — 0 module imports, 0 component imports, 512 MiB memory cap
- reproducible Notebook Core WASM rebuild with temporary `CARGO_TARGET_DIR` + `cmp` ✅ — both artifacts `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`
- `cargo deny check advisories licenses sources` ✅

## Independent probes

Actual shared-gate probes used an ephemeral `git archive` worktree outside the repository and the real `bun tools/quality/check-contracts.ts` gate. Result: `191/191` expectations passed in payload values and, where key length allowed, payload property keys.

Confirmed:

- da99 quote-boundary fix: direct quoted prose, encoded quoted prose, labelled quoted prose and later-valid quoted prose reject; word-internal, unclosed internal, closing invalid, unknown-labelled, prefixed quoted-local and suffixed quoted-local forms remain accepted.
- Label/context families: approved FR/EN labels (`contact`, `Email`, `courriel`, `from`, `to`, `reply-to`) reject; unknown labels and `ali:ce@example.org` remain accepted.
- Prior sensitive families reject: direct/percent/%u/numeric/named/nested/mixed HTML, exact HTML5 atext aliases, RFC quoted local-parts, CFWS/comments, full RFC 6532 EAI including private-use/C1/default-ignorable, IDNA/punycode/IP literals, parenthesized and terminal-punctuation emails, URL userinfo and credentials.
- Negative controls remain accepted: `release@2`, `"release"@2`, `R&D`, `R&amplitude`, `50%`, unresolved markers, encoded public URL text, inert traversal/file URI payloads, Unicode prose, non-HTML5 `&at;`, mixed-case `&CommaT;`, semicolonless non-HTML5 `&commat`, malformed dot-atoms/domains and non-ASCII domain separators.
- `/` remains RFC 5322 atext and sensitive: `ali/ce@example.org` rejects.
- Strict preflight order: size → strict UTF-8/JSON → structural bounds → content scan → AJV → `contractFiles` resolution.
- `contractFiles`: valid hash passes; hash mismatch, duplicate, traversal/URI shape, missing file and symlink fail.
- Metadata/payload ownership: payload path/URI strings remain inert; metadata file URI/traversal is rejected.
- Radar allowlist: exact committed canary passes only at the exact Radar file/value; same value in Notebook and altered Radar value reject.
- Sensitive failures remain non-reflective: `specialized vector contains a forbidden sensitive marker`.

Direct scanner probes also passed, including exported self-tests, exact HTML5 case behavior, quote parity, EAI/CFWS/IDNA/context controls and max-size timings. Observed timings: max no-`@` `1.907ms`, many-`@` `5.211ms`, many-dot `2.312ms`, malformed quote `2.082ms`, many prose quotes `1.886ms`, nested HTML chain `2.756ms`, NFKC overflow `0.974ms`.

## Dependency, sovereignty, corpus and scope checks

- `entities@8.0.0` is exact-pinned in `package.json`/`bun.lock`, BSD-2-Clause, no dependencies/peers/optional dependencies, imported only by `tools/quality/public-source-scanner.ts`.
- Installed `entities/package.json` SHA-256 `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`; `entities/LICENSE` SHA-256 `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`.
- No hosted API, runtime cloud dependency, telemetry, secret or PII data plane is introduced.
- Corpus audit: five public corpora pass; only `@`/userinfo hit is Radar’s locked synthetic canary. Notebook hits are non-secret terminology in public deterministic material.
- Scope search found no product/runtime consumer or engine implementation introduced; usage remains quality gate / Boussole checker / generated declaration / dossier references. No forbidden web framework use was found.

## SHA-256 evidence

Full 86-entry ledger: `/tmp/engine-envelope-da99-sha256.txt` — `76700cc9dabd80a13d54f89a68736fba66566f8398cc2bbee88220437e7f8813`.

Selected source/dossier hashes:

- `STATUS.md` — `323b76adda0040314d4444071b0c791eb215d94f0957450717d962b74e48a250`
- `docs/reviews/specialized-engine-v2/README.md` — `541aa29b64c053cd14e4b56f54da9bf9a3334aa674eb6ea564cb5dca04f4f9f6`
- `docs/reviews/specialized-engine-v2/REMEDIATION.md` — `8f7cc89949223f0d4cc0cb51cdd45fd9ddc5f8b2c7dc26a3ba382123220f13f6`
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-0A265CE.md` — `50e47d7f2eb6134f007dbf5fcf0329e874841747200095d698ab201365c1b5c2`
- `contracts/catalog.v1.json` — `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json` — `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` — `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- `tools/quality/public-source-scanner.ts` — `af6231297f9758b2dc6b28f49e18d3a956c7af56afcf6e7faf0c8b8e67d11ca9`
- `tools/quality/public-source-scanner.test.ts` — `fddb23f0d3510332a9fac9abbb2f5a87eab8a308fbed9105f6da1f5b7cf2b658`
- `tools/quality/check-contracts.ts` — `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- `package.json` — `5412a80c99ed881be7a8bd8436c027fef3f2fbd5d4244864bd59a2382a0a3284`
- `bun.lock` — `33eb37be9f9938f413dc6d3e39a03a6cc7e4ec8830878b236b1f8d5e32981439`
- `Cargo.lock` — `be5925fce192087993350f87c9d3527f4aaa65e4f81ae1dc64bf1fa77c363a20`

Selected log/probe hashes:

- `/tmp/engine-envelope-da99-preflight.log` — `99a5e1389ad2b77d59f0b607f0889051130ea184143e94b7054ddebfc395e217`
- `/tmp/engine-envelope-da99-bun-check.log` — `d4c19905ace6d77ed571a957b2ba454903e6417c012a5dd7c4ec96cabff47fd2`
- `/tmp/engine-envelope-da99-cargo-test.log` — `6dc68e19e0826afc1ace9e0e01a4431124b33d85d381531f882e7ac2e357a9fe`
- `/tmp/engine-envelope-da99-gate-probes.ts` — `22c6c0b10f5e23d65d342105a088ce07a4e370b77a6d42f9b3102680f1e9c2b1`
- `/tmp/engine-envelope-da99-gate-probes.log` — `8433215e59b702c9e1b97cea62856af8c61c185815f8164222bf1f819df8c400`
- `/tmp/engine-envelope-da99-direct-probes.log` — `6b813af839f2752d0c573b12d50bf9053ddbec7ef50556e4e98c0e5b69af2433`
- `/tmp/engine-envelope-da99-dependency.log` — `04ea0f47fd9a737f877d3d3b5de810b24fd075022dc840d5b6c351d2261fb47b`
- `/tmp/engine-envelope-da99-corpus-audit.log` — `a7ef8e4450ffb9cee19b49d01f261f956914b33b2744d9d63dee2e3d936e1623`
- `/tmp/engine-envelope-da99-clean-state.log` — `7bee27938da586a5dbb4d06e489aae13b84bdd0864189396a91af34f5e2c1cb1`

## Findings

### Blocking

None.

### Warnings / non-blocking

- `entities@8.0.0` is technically qualified and local/dev-only, but explicit owner acceptance remains required before any future promotion.
- This pass is candidate-integration only. Fresh Architecture and Security role passes, a separate promotion/integration pass and owner milestone remain mandatory before `candidate → locked`.
- Runtime conformance, product implementation, public scoring, real-data processing, tenant/RLS proof, release, infrastructure and deployment remain out of scope and unauthorized.

## Clean-state proof

Final cleanup removed `node_modules`, `target`, the temporary WASM rebuild directory and external Rust target directory. Clean-state log: `/tmp/engine-envelope-da99-clean-state.log` — `7bee27938da586a5dbb4d06e489aae13b84bdd0864189396a91af34f5e2c1cb1`.

```text
HEAD=da99d31e36e94c852841310e696d1a4bc9cf9d18
TREE=581b7e9e855309fd05ad3488b8f0bc9e23c902ff
BRANCH=## HEAD (no branch)
PORCELAIN_COUNT=0
UNSTAGED=empty
STAGED=empty
node_modules=absent
target=absent
external_target=absent
```

## Verdict

VERDICT: approve candidate-integration — exact clean target verified; pinned Bun/Rust gates and independent actual-gate probes are green; the da99 quote-boundary remediation preserves internal/closing invalid quotes while detecting direct, labelled and later-valid quote prose; prior EAI/HTML5/CFWS/IDNA/punctuation/context/URL-userinfo families, negatives, preflight order, resolver confinement, Radar allowlist, non-reflective errors, dependency qualification, hashes and candidate-only authority state check out.
