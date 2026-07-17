# Libre AI — `engine-golden-vectors-v1` candidate-integration review @ `6ee4627`

## Immutable scope and authority

- `reviewPassId`: `engine-golden-vectors-v1-candidate-integration-6ee-r1`
- `role`: candidate-integration reviewer only; review-only pass
- `target`: `6ee4627bda043ca3da11050c8d99e63a286cf321`
- `target tree`: `0563b4861ce818857562c8fb1b1303c4919db35e`
- `parents`: `77a4b1de79c1dbf3b03de1d54f1db5f5f282821c`, `c7f5b634b0fe42b93bc31bed42a2d7d6a4059536`
- `subject`: shared authority `engine-golden-vectors-v1`
- `mode`: no edits, no promotion, no merge, no release, no owner-control action

This is not an Architecture approval, Security approval, catalog promotion, runtime conformance approval, product-engine approval, public-scoring approval, deployment approval or owner milestone.

## Governance and history inspected

Read and applied: `AGENTS.md`, `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, `docs/adr/0003-wp-g2-s01-contract-amendment.md`, `prompts/02-foundation-build.md`, plus the specialized-engine-v2 dossier and preserved rejection/approval history.

Important governance observations:

- Current phase remains G2 Canonical Foundations; this is not a G4/G5 cutover.
- `contracts/catalog.v1.json:650-663` still marks `engine-golden-vectors-v1` as `candidate`, `pending-independent-agent-review`, requiring `architecture` and `security` role passes.
- Earlier Architecture/Security/candidate records are stale when later candidate-integration or Security passes found blockers.
- The current first-parent delta from `77a4b1d..6ee4627` is bounded to dossier/status/dependency evidence and `tools/quality/public-source-scanner.ts`; schema, catalog, generated projections and public corpus bytes are unchanged.

## Reviewed surface

Reviewed the shared schema/catalog boundary, schema fixtures, generated TypeScript and Rust projections, Rust contract registry, strict JSON helper, shared contract gate, scanner tests, all five public engine corpora, dedicated semantic checkers, lockfiles, CI workflow, `deny.toml`, `package.json`, `bun.lock`, and the `entities@8.0.0` dependency evidence.

Corpus hashes observed:

- Radar v2 golden: `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`
- Notebook Core v2 golden: `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`
- Policy Core v1 golden: `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`
- Policy Core v2 golden: `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`
- Boussole v2 golden: `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`

Generated projection boundary remains acceptable for a candidate shared envelope: the TypeScript declaration keeps recursive payload/metadata branches opaque, the Rust registry validates embedded schemas at runtime, and generated types are not an input security boundary.

## Dependency and sovereignty evidence

`entities@8.0.0` is exact-pinned as a root devDependency, imported only by `tools/quality/public-source-scanner.ts`, and has no runtime dependencies in `bun.lock`. Installed metadata matches the dossier:

- `node_modules/entities/package.json`: `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`
- `node_modules/entities/LICENSE`: `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`
- license: BSD-2-Clause
- hosted API/cloud dependency: none
- US hyperscaler/runtime data plane: none

Owner acceptance is still explicitly required before any future promotion.

## Pinned CI-equivalent gates executed

Toolchain observed:

- `bun --revision`: `1.4.0-canary.1+57f349f63`
- `rustc --version`: `rustc 1.97.0 (2d8144b78 2026-07-07)`
- `cargo --version`: `cargo 1.97.0 (c980f4866 2026-06-30)`

Executed gates:

- `bun install --frozen-lockfile`: pass
- `bun run check`: pass — contracts, all public vector checkers, Notebook Gate A, generated projections, work packages, JS license gate, Biome, TypeScript and `218 pass / 0 fail` Bun tests
- `bun audit`: pass, no vulnerabilities
- `cargo fmt --all --check`: pass
- `cargo clippy --workspace --all-targets --all-features -- -D warnings`: pass
- `cargo test --workspace --all-features`: pass
- `cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown`: pass
- `cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- target/wasm32-unknown-unknown/release/libre_ai_notebook_core.wasm`: pass after replay with `CARGO_TARGET_DIR` unset to match the CI artifact path
- reproducible Notebook Core WASM rebuild: pass, both artifacts `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`
- `cargo deny check advisories licenses sources`: pass

Evidence caveats were not hidden: one initial WASM import command failed because the harness had `CARGO_TARGET_DIR` set outside `target/`; one reproducibility wrapper failed because of a local shell temp-path bug. Both were replayed with CI-equivalent paths and passed.

## Independent ephemeral probes

Two probe logs were produced outside the repository:

- `/tmp/engine-envelope-scanner-probes.log`: `b848ea5bb92e3673697f0de2154a491f10d47e91ace1644524c514d7700884bd`
- `/tmp/engine-envelope-gate-mutations.log`: `b4b99e95c8182a4424f2f3d6dbd7e9b3bdb14ef49499aff6be1a35545a2246a0`

The actual `tools/quality/check-contracts.ts` gate, run in an ephemeral worktree, satisfied all prior blocker-family expectations for:

- non-ASCII domain separators preserved after NFKC;
- C0/colon/comma local-token separators not suffix-detected;
- slash `/` retained as RFC atext and detected;
- parenthesized and trailing-dot emails detected;
- mixed/nested HTML5 encodings detected;
- exact HTML5 aliases decoded and unknown/mixed-case/non-HTML5 aliases preserved;
- quoted local-parts, EAI private-use/C1/default-ignorable, IDN and IP literals detected;
- URL userinfo detected outside Radar’s exact file/value allowlist;
- inert payload traversal preserved while metadata traversal is rejected;
- payload key scanning, overlong string/object bounds and contract-file hash mismatch enforced.

However, 3/35 independent expectations failed, and 14/17 direct scanner expectations passed. The failures are blocking.

## Blocking findings

### ENGENV-6EE-BLK-001 — ASCII double-quoted prose emails bypass the public-source gate

`tools/quality/public-source-scanner.ts:137-142` accepts only start-of-string, ASCII whitespace, `(<[{`, or `mailto:` as a local-part boundary. ASCII `"` is not accepted as a prose opening delimiter. `hasValidQuotedLocal` at `tools/quality/public-source-scanner.ts:186-207` only covers RFC quoted local-parts such as `"alice"@example.org`; it does not cover a normal dot-atom email enclosed in prose quotes.

Reproduced directly:

- `containsSensitivePublicMarker('"alice@example.org"')` returned `false`.
- `containsSensitivePublicMarker('&quot;alice&commat;example&period;org&quot;')` returned `false` after decoding to `"alice@example.org"`.

Reproduced through the actual shared gate by injecting those values into `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` in an ephemeral worktree: `bun tools/quality/check-contracts.ts` returned success (`Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations`).

Impact: a public corpus can carry a directly visible personal email identifier if it is wrapped in ordinary ASCII prose/JSON quotes. This violates the public-source scanner’s privacy/security purpose even though the pinned CI suite is green.

### ENGENV-6EE-BLK-002 — Colon-delimited prose emails bypass the public-source gate

The same boundary rule at `tools/quality/public-source-scanner.ts:137-142` permits `:` only when the preceding text ends in `mailto`. That correctly preserves malformed local tokens such as `ali:ce@example.org`, but it also misses common label-delimited prose such as `contact:alice@example.org`.

Reproduced directly:

- `containsSensitivePublicMarker('contact:alice@example.org')` returned `false`.
- Control `containsSensitivePublicMarker('contact: alice@example.org')` returned `true`.

Reproduced through the actual shared gate by injecting `contact:alice@example.org` into the Notebook public vector fixture in an ephemeral worktree: `bun tools/quality/check-contracts.ts` returned success.

Impact: a common key/value or label/value representation can publish a complete public email identifier without rejection. This is distinct from the intended `ali:ce@example.org` malformed-token preservation and is a privacy blocker for public corpora.

## Non-blocking observations

- The current remediation does close the four blockers recorded against `77a4b1d`: NFKC-created CFWS, suffix extraction inside malformed local tokens, parenthesized-email erasure and trailing domain punctuation.
- The catalog remains candidate-only; no authority was promoted by this target.
- Green CI proves the checked corpus set is currently clean; it does not prove the scanner rejects all high-confidence public email identifiers.
- The only new JS dependency is quality-time, permissively licensed and local-only; no runtime sovereignty issue was found.

## Hash ledger

Relevant hash ledger written to `/tmp/engine-envelope-6ee.sha256`, SHA-256 `626609fa6cb4bf776d3dd5ffd87670de8a57267f03ad56bcaad9c5d2284a10ed`.

Key entries:

- `contracts/catalog.v1.json`: `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json`: `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts`: `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- `packages/contracts/src/generated/manifest.json`: `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
- `tools/quality/public-source-scanner.ts`: `5286fa9d2e440bcc23a490266b882c10eca0b01bccd38f2e85732bd968571176`
- `tools/quality/public-source-scanner.test.ts`: `c05442550d0954e30b0ee3aee0dfb3e3036aca3d5d7b7c95ffd89a9acc842d28`
- `tools/quality/check-contracts.ts`: `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- `package.json`: `5412a80c99ed881be7a8bd8436c027fef3f2fbd5d4244864bd59a2382a0a3284`
- `bun.lock`: `33eb37be9f9938f413dc6d3e39a03a6cc7e4ec8830878b236b1f8d5e32981439`
- `Cargo.lock`: `be5925fce192087993350f87c9d3527f4aaa65e4f81ae1dc64bf1fa77c363a20`
- `docs/reviews/specialized-engine-v2/README.md`: `708cf6bd4c1ad0aafcc3504131e1de81efe96d8c081899d965ec13fa4094cd8a`
- `docs/reviews/specialized-engine-v2/REMEDIATION.md`: `d7f3f248f25826f381219bc1ff8f7eb40a648317a33ec15a735e6d578bd50a9f`
- `docs/reviews/specialized-engine-v2/DEPENDENCY-QUALIFICATION-ENTITIES.md`: `6b01ff7a92f21593f2ca76f0ee3c12e9c8a525adbc07e1d373273140f534a7ae`
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-77A4B1D.md`: `2fb75ab696ed0ee21682a54a382d431008239afe547fd19f9d0bfe7bfe6ea8a3`

## Clean-state proof

Final repository state after removing the ephemeral worktree:

```text
HEAD=6ee4627bda043ca3da11050c8d99e63a286cf321
TREE=0563b4861ce818857562c8fb1b1303c4919db35e
branch=## HEAD (no branch)
unstaged=empty
staged=empty
git diff --check 77a4b1d..HEAD=clean
tracked files modified by review=none
```

The report itself was written only to `/tmp/engine-envelope-integration-6ee.draft.md`.

VERDICT: reject candidate-integration — public-source scanner false negatives still allow ASCII double-quoted and colon-delimited prose email identifiers through the actual shared gate.
