# Review record — shared specialized-engine golden-vector envelope

- **reviewPassId:** `engine-envelope-v1-candidate-integration-79d02-r1`
- **mode:** `candidate-integration`
- **reviewedAt:** `2026-07-17T11:17:51Z`
- **target:** `79d02b67cc961ca68d844d07e7f0f23838ccac1f`
- **base:** `ae455b9875b03b78dbb0a9d1dcfcb9c566754808`
- **scope:** integration-only; not an Architecture/Security role approval and not a promotion approval
- **agent/provider/model:** API coding agent / `openai` / `model not exposed by this harness`
- **session:** not exposed by this harness
- **immutability:** `git rev-parse HEAD` matched the requested target exactly; `git status --short` was empty before and after review

## Diff and reviewed surface

`git diff --name-only ae455b9875b03b78dbb0a9d1dcfcb9c566754808..HEAD` is limited to 7 files:

- `STATUS.md`
- `docs/reviews/specialized-engine-v2/ARCHITECTURE-VERDICT-FINAL.md`
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-AE455.md`
- `docs/reviews/specialized-engine-v2/README.md`
- `docs/reviews/specialized-engine-v2/REMEDIATION.md`
- `docs/reviews/specialized-engine-v2/SECURITY-VERDICT-FINAL.md`
- `tools/quality/check-contracts.ts`

Reviewed history on top of `ae455b9`:

- `2eae7ba` review records for `ae455b9`
- `2ccb05c` merge PR #66
- `3baecf8` mixed-HTML bypass remediation
- `79d02b6` merge PR #67

Reviewed files and surfaces:

- `AGENTS.md`, `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- complete `docs/reviews/specialized-engine-v2/*`
- `contracts/schemas/engine-golden-vectors.v1.schema.json`
- `contracts/catalog.v1.json`
- `contracts/fixtures/schema-fixtures.v1.json`
- generated projections: `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts`, `packages/contracts/src/generated/manifest.json`
- all five public synthetic corpora:
  - `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json`
  - `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`
  - `contracts/fixtures/policy-core-v1/golden.json`
  - `contracts/fixtures/policy-core-v2/golden.json`
  - `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json`
- dedicated checkers:
  - `tools/quality/check-contracts.ts`
  - `tools/quality/check-radar-v2-vectors.ts`
  - `tools/quality/check-notebook-v2-vectors.ts`
  - `tools/quality/check-policy-core-vectors.ts`
  - `tools/quality/check-policy-core-v2-vectors.ts`
  - `tools/quality/check-boussole-v2-vectors.ts`
  - support parser `tools/quality/policy-core-raw-inputs.ts`
- Rust verification surfaces:
  - `crates/contract-types/tests/schema_fixtures.rs`
  - `crates/ecosystem-engine/tests/public_projection.rs`

## Checks executed

### Git / immutability

- `git rev-parse HEAD` ✅ `79d02b67cc961ca68d844d07e7f0f23838ccac1f`
- `git status --short` ✅ empty
- `git log --oneline --ancestry-path ae455b9875b03b78dbb0a9d1dcfcb9c566754808..HEAD` ✅ expected 4-commit path
- `git diff --name-only ae455b9875b03b78dbb0a9d1dcfcb9c566754808..HEAD` ✅ 7-file bounded surface

### Bun / CI-equivalent quality gates

- `bun install --frozen-lockfile` ✅
- `bun run check` ✅
  - `check:toolchain` ✅ exact Bun `1.4.0-canary.1+57f349f63`
  - `check:source` ✅
  - `check:objects` ✅
  - `check:objectives` ✅
  - `check:specifications` ✅
  - `check:contracts` ✅
  - `check:notebook-core-v2` ✅
  - `check:generated-contracts` ✅ `Verified 48 TypeScript contract projections`
  - `check:work-packages` ✅
  - `check:licenses` ✅
  - `biome ci .` ✅
  - `tsc --noEmit -p tsconfig.json` ✅
  - `bun test` ✅ `128 pass, 0 fail`
- `bun audit` ✅ `No vulnerabilities found`

### Rust / CI-equivalent quality gates

- `cargo fmt --all --check` ✅
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` ✅
- `cargo test --workspace --all-features` ✅
- `cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown` ✅
- `cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- $CARGO_TARGET_DIR/wasm32-unknown-unknown/release/libre_ai_notebook_core.wasm` ✅
- reproducible WASM rebuild via temporary `CARGO_TARGET_DIR` + `cmp` + `shasum -a 256` ✅ identical SHA-256 on both builds
- `cargo deny check advisories licenses sources` ✅

### Independent probes

- Exact detector-logic probe copied from current `tools/quality/check-contracts.ts` ✅
  - rejected the 3 historical mixed-HTML bypasses:
    - `alice&amp;&#64example.org`
    - `alice&#38;&commat;example.org`
    - `alice&amp;&#38;&#64example.org`
  - rejected direct RFC local-part ampersand case `alice&ops@example.org`
  - rejected reasonable compositions: nested HTML, named percent, nested named percent, mixed nested encoding
  - preserved legitimate payload strings: `release@2`, `R&D`, `50%`, `https://example.org/a%2Fb`, `policy &#fragment and %not-encoding`, `../../secrets.txt`, `file:///etc/passwd`, `Café démonstration`
  - timing probe on a 10,260-character nested chain completed in `0.098 ms`
- AJV schema probe against `contracts/schemas/engine-golden-vectors.v1.schema.json` ✅
  - metadata `contractFiles` traversal rejected
  - metadata `semantics: file:///etc/passwd` rejected
  - payload `file:///etc/passwd`, `../../secrets.txt`, `release@2`, `R&D`, `50%` accepted when carried in engine payload
- Independent `contractFiles` recomputation ✅
  - Radar corpus: 8 entries, all repo-relative, non-symlink, in-repo, SHA-256 matched
  - Notebook / Policy v1 / Policy v2 / Boussole corpora: no `contractFiles`
- Independent corpus scan for obvious email/credential markers ✅
  - only committed sensitive-looking hit across the reviewed golden corpora was Radar’s synthetic canary `https://user:secret@example.org/feed.xml`
  - Notebook corpus explicitly states `Public deterministic test material only; forbidden for production secrets, salts, nonces, or identifiers.`
  - no obvious real email/credential marker found in the other four public golden corpora

## Key code and record observations

1. **Mixed-HTML remediation is present and effective.**
   - `tools/quality/check-contracts.ts:227` expands the email detector to an RFC-style atext local-part class, including `&`.
   - `tools/quality/check-contracts.ts:243-255` still collapses nested percent/HTML marker chains before bounded decoding rounds.
   - `tools/quality/check-contracts.ts:632-635` adds the exact direct-ampersand and 3 mixed bypass self-tests.
   - `bun run check` passed, so these self-tests are live, not documentary.

2. **Payload semantics remain engine-owned.**
   - `contracts/schemas/engine-golden-vectors.v1.schema.json:17,28,49-51,99,119,139` keeps `semantics`/`contractFiles`/`reproductionEvidence` as metadata-bound fields while engine payload fields stay under generic bounded `payloadValue`.
   - The schema still requires only envelope structure; it does not encode engine-specific meaning.
   - Dedicated semantic ownership remains with the engine checkers, and Boussole explicitly re-checks exact shared-envelope identity at `tools/quality/check-boussole-v2-vectors.ts:537-541` before consuming `cases`.

3. **Scanner work is bounded.**
   - `tools/quality/check-contracts.ts:185,192` enforces depth `64` and node count `200000`.
   - the same file enforces 8 MiB file size, 65,536-code-point strings, 4,096-item arrays, 512-property objects, and 4 decode passes before content detection.
   - the timing probe showed no indication of pathological blow-up on a long nested marker chain.

4. **`contractFiles` resolution remains strict.**
   - Schema path shape is closed at `contracts/schemas/engine-golden-vectors.v1.schema.json:99-111`.
   - Runtime resolution in `tools/quality/check-contracts.ts:678-698` is limited to `contractFiles`, rejects duplicates, missing paths, non-files, symlinks, repo escape, and hash mismatch.
   - Independent recomputation confirmed all live Radar `contractFiles` satisfy those checks.

5. **Failures do not echo secret/private values.**
   - shared-envelope scanner failures are generic: `tools/quality/check-contracts.ts:304,316` emits only `specialized vector contains a forbidden sensitive marker`.
   - AJV errors are passed through `safeErrors` path/message summarization only.
   - Rust contract test `crates/contract-types/tests/schema_fixtures.rs:120` passed, proving validation issues do not echo a supplied private value.

6. **Generated output is current.**
   - `bun run check:generated-contracts` passed.
   - `packages/contracts/src/generated/manifest.json:90-92` still binds `engine-golden-vectors.v1.schema.json` to `engine-golden-vectors.v1.d.ts` with the current schema SHA.
   - no schema/catalog/generated projection drift was observed.

7. **Records and status truthfully invalidate stale approvals.**
   - `STATUS.md:41` explicitly says the `ae455b9` approvals were invalidated by the later mixed-HTML bypass finding and that fresh Architecture/Security passes are still required.
   - `docs/reviews/specialized-engine-v2/README.md:29-42` marks the `ae455b9` Architecture/Security records as stale, preserves the rejection record, and states they are not citable as final verdicts.
   - `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-AE455.md` is preserved with SHA-256 `18c2e8d32892d44546398f18e448316ab01e4791e52f03022aa9c32feb81773b`.

8. **Authority state and scope remain correct.**
   - `contracts/catalog.v1.json` still keeps `engine-golden-vectors-v1` in `candidate` status with pending Architecture/Security review requirements.
   - no diff touched the catalog entry.
   - no engine, scoring, real-data path, runtime capability, release, infrastructure, or deployment authorization was introduced.

## Exact hashes

### Review records / status / protocol

- `STATUS.md` `5509fd07afc40c26f7c549ce0c7456f9db1ae4985ce6041ad9313972a49c3226`
- `docs/reviews/AGENT-REVIEW-PROTOCOL.md` `9e91b78c30a2ba82d20a7fe78d8bf4a2878ffa8c28046e3a44748d29b448a43f`
- `docs/reviews/specialized-engine-v2/README.md` `bbee5d34325db2264d2f08312b8705265875f92921813f81e9d590edbb31754a`
- `docs/reviews/specialized-engine-v2/REMEDIATION.md` `5313f853e68909e957c27dce7800856a1234402a9313f0baaec6a40ffb057edb`
- `docs/reviews/specialized-engine-v2/ARCHITECTURE-VERDICT.md` `42d02e057731676871ee01dbe64ca6772b8bb8837e6aa490d045f17b40e32ad1`
- `docs/reviews/specialized-engine-v2/SECURITY-VERDICT.md` `03c24677664bfcf2b150e9bdf07cc6d1b3a6cd7970a7031efc44f5530add4728`
- `docs/reviews/specialized-engine-v2/ARCHITECTURE-VERDICT-FINAL.md` `0833f3f2c390c6ca031e47226f1414746b9f7595af98362a3fc5f7164c404a5f`
- `docs/reviews/specialized-engine-v2/SECURITY-VERDICT-FINAL.md` `eddde521d25b35b1f32385ca40a2ea93cbeedb39aebe5bc18e42ff982191f158`
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-AE455.md` `18c2e8d32892d44546398f18e448316ab01e4791e52f03022aa9c32feb81773b`

### Shared envelope / generated projections

- `contracts/catalog.v1.json` `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json` `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- `contracts/fixtures/schema-fixtures.v1.json` `fe1f1a274747a2f7393cb4763e23d71d913bf0be883add6cde2d4501af9d7d28`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- `packages/contracts/src/generated/manifest.json` `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
- `tools/quality/check-contracts.ts` `ad8715810f55531c63e59378decc7e7e644f13b2fd8cc0a50a7a30e96801440a`
- `tools/quality/policy-core-raw-inputs.ts` `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389`

### Five public synthetic corpora

- `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json` `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`
- `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`
- `contracts/fixtures/policy-core-v1/golden.json` `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`
- `contracts/fixtures/policy-core-v2/golden.json` `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`
- `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`

### Dedicated checkers and Rust verification files

- `tools/quality/check-radar-v2-vectors.ts` `beca199ab0bb55bf482b23bfa05fea36f71eba4768547f185de55f8165f4ff11`
- `tools/quality/check-notebook-v2-vectors.ts` `e7dc3113e2374e396de5f12743c41dafe27b17b6d5caad59a7abbc27f7e03299`
- `tools/quality/check-policy-core-vectors.ts` `1b1d738787fde41e33b7a0981cbd5f76597c002314067202f2665c2f07ac380f`
- `tools/quality/check-policy-core-v2-vectors.ts` `2f13011a3c0c755ec42e17a2a8405a2c3ed8282c082fcb4ab9762d57a9dab7f8`
- `tools/quality/check-boussole-v2-vectors.ts` `7dece6aea797d2d8751e774fea3ab6ce60ef85e4ca145f3ec897db210c370ea0`
- `crates/contract-types/tests/schema_fixtures.rs` `f9d1ba8d781f3c94383c61df78966ce07de0a89cc49ec84c31a080e2cf69f4e2`
- `crates/ecosystem-engine/tests/public_projection.rs` `d5a00cc3e01c84e33de99330acc618749d05d30f6d6eddd6b3bcd7b63b0e3400`

## Findings

### Blocking

- none

### Warnings

- none

## Residual risks

- Fresh role-separated **Architecture** and **Security** passes are still required on the post-remediation immutable commit before any later catalog promotion; this review does not satisfy those roles.
- The historical `ae455b9` approval files remain in the dossier for audit continuity; the invalidation is explicit and truthful, but future reviewers must start from `README.md`, `STATUS.md`, and the preserved reject record rather than citing the historical `*-FINAL.md` files in isolation.
- As already documented by the repository, `engine-golden-vectors-v1` remains only a candidate shared envelope; no engine/runtime conformance, public scoring, real-data processing, capability grant, release, infrastructure, or deployment authority follows from this pass.

VERDICT: approve candidate-integration — HEAD exactly matches `79d02b67cc961ca68d844d07e7f0f23838ccac1f`; the mixed-HTML remediation is effective, the shared envelope still bounds metadata without stealing engine semantics, stale `ae455b9` approvals are truthfully invalidated, generated artifacts are current, the five public synthetic corpora and dedicated checkers remain coherent, and CI-equivalent Bun/Rust gates passed with no blocking finding.
