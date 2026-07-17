# Architecture review record — engine-golden-vectors-v1

- **reviewPassId:** `engine-golden-vectors-v1-architecture-79d02b67-r1`
- **role:** `architecture`
- **mode:** `specialized-role-review` — strict review-only pass
- **date:** `2026-07-17T11:31:59Z`
- **provider/model:** `openai / API coding assistant model identifier not exposed by this harness`
- **session:** `not exposed by this harness`
- **worktree separation:** clean detached worktree at `/private/tmp/libre-ai-engine-envelope-architecture-79d02`; `git status --short --branch` was `## HEAD (no branch)` before and after review; no repository file was modified; this record was written only to `/tmp/engine-envelope-architecture-79d02.draft.md`
- **immutable target:** `79d02b67cc961ca68d844d07e7f0f23838ccac1f`
- **base inspected:** `d0c25bcd3988242ac097d02613bf5608669cd50e` (pre-remediation shared-envelope base)
- **historical/stale SHAs inspected:** `3ec2f2eec8c2e11bd35fdab18aa438eb8534951f`, `ae455b9875b03b78dbb0a9d1dcfcb9c566754808`
- **authority status under review:** `candidate` only

## Reviewed surface

I read and cross-checked:

- governance/context: `AGENTS.md`, `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, `docs/adr/0003-wp-g2-s01-contract-amendment.md`, `prompts/02-foundation-build.md`;
- full specialized-engine-v2 dossier, including stale/historical records:
  - `docs/reviews/specialized-engine-v2/README.md`
  - `docs/reviews/specialized-engine-v2/REMEDIATION.md`
  - `docs/reviews/specialized-engine-v2/ARCHITECTURE-VERDICT.md`
  - `docs/reviews/specialized-engine-v2/SECURITY-VERDICT.md`
  - `docs/reviews/specialized-engine-v2/ARCHITECTURE-VERDICT-FINAL.md`
  - `docs/reviews/specialized-engine-v2/SECURITY-VERDICT-FINAL.md`
  - `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-AE455.md`
- current shared-envelope authorities and projections:
  - `contracts/catalog.v1.json`
  - `contracts/schemas/engine-golden-vectors.v1.schema.json`
  - `contracts/fixtures/schema-fixtures.v1.json`
  - `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts`
  - `packages/contracts/src/generated/manifest.json`
  - `packages/contracts/scripts/generate-types.ts`
  - `packages/contracts/src/registry.ts`
  - `crates/contract-types/{README.md,build.rs,src/lib.rs,tests/schema_fixtures.rs}`
  - `crates/ecosystem-engine/tests/wit_contracts.rs`
- all five public synthetic corpora plus supporting budget/security fixtures:
  - Radar: `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json`, `security-vectors.v1.json`
  - Notebook: `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`
  - Policy v1: `contracts/fixtures/policy-core-v1/golden.json`, `operators.json`
  - Policy v2: `contracts/fixtures/policy-core-v2/golden.json`, `operators.json`, `resource-budgets.v1.json`
  - Boussole: `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json`, `security-vectors.v1.json`
  - shared raw decoder fixture manifest: `contracts/fixtures/policy-core-invalid-json/manifest.json`
- all dedicated engine checkers and shared/publication gate:
  - `tools/quality/check-contracts.ts`
  - `tools/quality/check-radar-v2-vectors.ts`
  - `tools/quality/check-notebook-v2-vectors.ts`
  - `tools/quality/check-notebook-core-v2-candidate.ts`
  - `tools/quality/check-policy-core-vectors.ts`
  - `tools/quality/check-policy-core-v2-vectors.ts`
  - `tools/quality/check-boussole-v2-vectors.ts`
  - `tools/quality/policy-core-raw-inputs.ts`
- engine-owned semantic authorities for boundary comparison:
  - `contracts/wit/radar-engine-v2/{world.wit,PROFILE.md}`
  - `contracts/wit/notebook-core-v2/{world.wit,SEMANTICS.md}`
  - `contracts/wit/policy-core-v1/{world.wit,SEMANTICS.md}`
  - `contracts/wit/policy-core-v2/{world.wit,SEMANTICS.md}`
  - `contracts/wit/boussole-scoring-v2/{world.wit,SEMANTICS.md}`

## History and diff inspected

I did not limit the review to the last commit.

- `git log --ancestry-path d0c25bcd3988242ac097d02613bf5608669cd50e..HEAD` covered the relevant chain:
  `0311d98 -> 12e5b73 -> 3ec2f2e -> 9f15ae8 -> ae455b9 -> 2eae7ba -> 2ccb05c -> 3baecf8 -> 79d02b6`
- `git diff --stat d0c25bcd3988242ac097d02613bf5608669cd50e..79d02b67cc961ca68d844d07e7f0f23838ccac1f` showed 11 changed files, limited to shared contract/docs/generated/checker space.
- `git diff --stat ae455b9875b03b78dbb0a9d1dcfcb9c566754808..79d02b67cc961ca68d844d07e7f0f23838ccac1f` showed that the mixed-HTML remediation after the stale approvals is limited to:
  - `tools/quality/check-contracts.ts`
  - `docs/reviews/specialized-engine-v2/{README.md,REMEDIATION.md,CANDIDATE-INTEGRATION-REJECT-AE455.md,ARCHITECTURE-VERDICT-FINAL.md,SECURITY-VERDICT-FINAL.md}`
  - `STATUS.md`
- No schema byte, catalog entry, public corpus, generated TS declaration, or Rust authority changed after `ae455b9`; the post-stale delta is checker/docs only.

## Commands and evidence

### Git / cleanliness

- `git rev-parse HEAD` → `79d02b67cc961ca68d844d07e7f0f23838ccac1f`
- `git status --short --branch` before/after → `## HEAD (no branch)`

### Search / usage evidence

- `rg -n "engine-golden-vectors\.v1|LibreAiSpecializedEngineGoldenVectorIndexV1|engine_golden_vectors_v1" . -g '!**/target/**' -g '!**/node_modules/**'`
  - found the shared schema/catalog, dossier records, generated declaration, shared gate, and Boussole checker;
  - found no product/runtime consumer importing the generated TS type or a Rust generated module as an authoritative boundary.

### Pinned Bun / Rust gates

- `bun run check:toolchain` ✅ → `Bun toolchain verified: 1.4.0-canary.1+57f349f63`
- `bun run check:contracts` ✅
  - `Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations`
  - `Policy-core vectors verified: 17 golden cases, 28 operator cases, 9 raw decoder refusals`
  - `Radar vectors verified: 43 parse cases, 16 evaluation cases, 18 generated boundaries, 16 refusal codes`
  - `Notebook vectors are structurally verified: 10 backup and 12 context mutations. Gate A is locked by the main Notebook checker; Gate B runtime remains required.`
  - `Policy-core vectors verified: 20 golden cases, 28 operator cases, 9 raw decoder refusals, 10 byte boundaries with valid exact ceilings, depth 64, privacy-minimized sources and principals, typed URNs and closed HTTP refusals, bounded for preimplementation`
  - `Boussole vectors verified: 10 methodology cases, 8 raw refusals, 8 resource boundaries, 11 semantic refusals, 1 generated maximum-arithmetic case; public scoring still candidate-only`
- `bun run check:notebook-core-v2` ✅
  - `Notebook Core v2 Gate A verified: closed WIT, byte-identical catalog copies and reviewed files, AAD/digest/AES-GCM, 10 backup and 12 context mutations, 6 replayable resource boundaries, one recovery profile; Gate A is approved and Gate B remains pending`
- `bun run check:generated-contracts` ⚠️ environment caveat
  - failed locally because `node_modules/.bin/biome` is absent in this detached worktree;
  - I compensated with direct manifest/hash/opacity verification (see independent probe below).
- `cargo test --workspace --locked` ✅
  - included `crates/contract-types/tests/schema_fixtures.rs` and `crates/ecosystem-engine/tests/wit_contracts.rs` plus `notebook-core` golden/resource tests;
- `cargo clippy --workspace --all-targets --locked -- -D warnings` ✅
- `cargo fmt --check --all` ✅

### Independent probes beyond green tests

#### 1) Mixed HTML payload cases and legitimate canaries

I ran an independent Bun probe that re-executed the current public-marker decoding logic against targeted strings and shared-envelope instances.

Observed results:

- mixed/HTML/RFC local-part payloads are detected as sensitive:
  - `alice&amp;&#64example.org` → sensitive `true`
  - `alice&#38;&commat;example.org` → sensitive `true`
  - `alice&amp;&#38;&#64example.org` → sensitive `true`
  - `alice&ops@example.org` → sensitive `true`
- legitimate payload canaries remain representable and non-sensitive:
  - `R&D` → `false`
  - `release@2` → `false`
  - `policy &#fragment and %not-encoding` → `false`
  - `https://example.org/a%2Fb` → `false`
  - `../../secrets.txt` → `false`
  - `file:///etc/passwd` → `false`

This independently confirms that the architecture boundary still permits engine-owned opaque payload strings while the shared publication gate now closes the mixed HTML false-negative family that invalidated `ae455b9`.

#### 2) Only `contractFiles` is executable/resolved

The same probe validated three envelopes against the current shared schema:

- payload-only canaries with `../../secrets.txt` / `file:///etc/passwd` inside `cases` → **schema valid**
- `contractFiles: [{"path":"contracts/../secrets.txt",...}]` → **schema invalid**
- legitimate payload envelope carrying `R&D`, `50%`, `release@2`, encoded URL, inert path/file strings → **schema valid**

This matches the intended architecture: payload strings are not path-capable; only `contractFiles` participates in repository resolution/hash binding.

#### 3) Generated TS projection non-authority check

I ran an independent Bun probe that confirmed:

- the `packages/contracts/src/generated/manifest.json` entry for `engine-golden-vectors.v1.schema.json` matches the live schema SHA-256;
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` keeps recursive payload/metadata branches opaque (`Array<unknown>`, `{ [key: string]: unknown }`);
- `packages/contracts/src/registry.ts` returns `ContractValidationResult<unknown>` and keeps runtime validation authoritative.

## Exact relevant SHA-256 hashes

### Governance / review packet

- `docs/reviews/AGENT-REVIEW-PROTOCOL.md` — `9e91b78c30a2ba82d20a7fe78d8bf4a2878ffa8c28046e3a44748d29b448a43f`
- `STATUS.md` — `5509fd07afc40c26f7c549ce0c7456f9db1ae4985ce6041ad9313972a49c3226`
- `GOALS.md` — `39f292711559a2ea722dccbd2dce098afd5e897b58a07d3cf4095aacc1521a7b`
- `docs/adr/0003-wp-g2-s01-contract-amendment.md` — `bf49949a1fcc3943076fbd57495b8766bbdff430785fa503cd03f28308eba735`
- `prompts/02-foundation-build.md` — `4f1f0c20af5365d96b921fcfdd244066b6d5de6edaaabf4dd12ea0d0fcdbd73e`
- `docs/reviews/specialized-engine-v2/README.md` — `bbee5d34325db2264d2f08312b8705265875f92921813f81e9d590edbb31754a`
- `docs/reviews/specialized-engine-v2/REMEDIATION.md` — `5313f853e68909e957c27dce7800856a1234402a9313f0baaec6a40ffb057edb`
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-AE455.md` — `18c2e8d32892d44546398f18e448316ab01e4791e52f03022aa9c32feb81773b`
- historical stale records preserved in-tree:
  - `docs/reviews/specialized-engine-v2/ARCHITECTURE-VERDICT-FINAL.md` — `0833f3f2c390c6ca031e47226f1414746b9f7595af98362a3fc5f7164c404a5f`
  - `docs/reviews/specialized-engine-v2/SECURITY-VERDICT-FINAL.md` — `eddde521d25b35b1f32385ca40a2ea93cbeedb39aebe5bc18e42ff982191f158`

### Shared envelope / projections

- `contracts/catalog.v1.json` — `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json` — `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- `contracts/fixtures/schema-fixtures.v1.json` — `fe1f1a274747a2f7393cb4763e23d71d913bf0be883add6cde2d4501af9d7d28`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` — `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- `packages/contracts/src/generated/manifest.json` — `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
- `packages/contracts/scripts/generate-types.ts` — `668b7a3c6e6d11dc3751270a82b7f29cbd382deaabc44e43db3cc939d4c1ae6d`
- `packages/contracts/src/registry.ts` — `42be1d3d1fab23d814ef0accf563f4bc9c1ae94eb992b919dceabf81d17a47bd`
- `crates/contract-types/build.rs` — `6fc8104c990c4b48fe0292af2f9b7f5bd500e4d403dfa322347198bc10779ce6`
- `crates/contract-types/src/lib.rs` — `a8008c6914e94c78fdfaabc6e366e50320ca2a17f8978ce5652716adfe111eec`
- `crates/contract-types/tests/schema_fixtures.rs` — `f9d1ba8d781f3c94383c61df78966ce07de0a89cc49ec84c31a080e2cf69f4e2`
- `crates/ecosystem-engine/tests/wit_contracts.rs` — `fb9b324c6dd8dbdd03d8696dcabe2b573033b79d8939c56544265aae697ceb0e`

### Public corpora / supporting fixtures

- Radar golden — `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json` — `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`
- Radar security — `contracts/fixtures/radar-engine-v2/security-vectors.v1.json` — `a092dabcd81afdac4eaeb57aafc4bf9c26cec89aa514f05e48e56bfe1b0804a6`
- Notebook golden — `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` — `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`
- Policy v1 golden — `contracts/fixtures/policy-core-v1/golden.json` — `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`
- Policy v1 operators — `contracts/fixtures/policy-core-v1/operators.json` — `6e1abd2c8806c982019a5cfa573d156f0f5be4fd9b11dd188a97e9bfbbebc298`
- Policy v2 golden — `contracts/fixtures/policy-core-v2/golden.json` — `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`
- Policy v2 operators — `contracts/fixtures/policy-core-v2/operators.json` — `cb4c4d1929e01cfc6cd87d5f4386e54b9f3294ef6789c562f556d1b0c5db5bc2`
- Policy v2 budgets — `contracts/fixtures/policy-core-v2/resource-budgets.v1.json` — `6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77`
- Shared raw decoder manifest — `contracts/fixtures/policy-core-invalid-json/manifest.json` — `15fc871a4347303c8abf3dad6810c0532d8546b514e3c4a9b4fc81f6c5e4d378`
- Boussole golden — `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` — `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`
- Boussole security — `contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json` — `267b7144e5c97fd8840dc40c0c87933000696547a959bbd246904e3af53fc8b6`

### Checkers / gates

- `tools/quality/check-contracts.ts` — `ad8715810f55531c63e59378decc7e7e644f13b2fd8cc0a50a7a30e96801440a`
- `tools/quality/check-radar-v2-vectors.ts` — `beca199ab0bb55bf482b23bfa05fea36f71eba4768547f185de55f8165f4ff11`
- `tools/quality/check-notebook-v2-vectors.ts` — `e7dc3113e2374e396de5f12743c41dafe27b17b6d5caad59a7abbc27f7e03299`
- `tools/quality/check-notebook-core-v2-candidate.ts` — `0c74c6539a0cdae9608e2d6cd82da62712af6226de3b79d22396d4b001b95c6f`
- `tools/quality/check-policy-core-vectors.ts` — `1b1d738787fde41e33b7a0981cbd5f76597c002314067202f2665c2f07ac380f`
- `tools/quality/check-policy-core-v2-vectors.ts` — `2f13011a3c0c755ec42e17a2a8405a2c3ed8282c082fcb4ab9762d57a9dab7f8`
- `tools/quality/check-boussole-v2-vectors.ts` — `7dece6aea797d2d8751e774fea3ab6ce60ef85e4ca145f3ec897db210c370ea0`
- `tools/quality/policy-core-raw-inputs.ts` — `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389`

## Architecture findings

### Blocking findings

- none

### Major findings

- none

### Minor findings

- none

## Architecture decision basis

1. **The shared envelope remains structural and non-semantic.**
   - The current schema cleanly separates metadata (`metadataString` / `metadataValue`) from engine payload (`payloadString` / `payloadValue`).
   - Radar, Notebook, Policy v1, Policy v2 and Boussole keep their engine semantics in their own WIT/profile/SEMANTICS documents and dedicated checkers.
   - The shared schema does not redefine parse/evaluate/score behavior.

2. **Metadata and engine-owned payload boundaries are closed and understandable.**
   - Metadata is bounded and sanitized.
   - Payload is bounded but intentionally opaque.
   - The independent probe confirmed the intended split: mixed HTML email encodings are blocked by the public-content gate, while legitimate payload strings remain representable.

3. **Only `contractFiles` is executable/resolved.**
   - The shared schema and gate treat `contractFiles` specially with repository-relative path rules, symlink/escape rejection and SHA-256 binding.
   - File-like or traversal-like strings inside payload remain inert payload data.
   - Independent probe reproduced this exact split.

4. **Generated TS/Rust projections remain deliberately opaque and non-authoritative.**
   - TypeScript declarations intentionally collapse recursive branches to `unknown`-based shapes.
   - TypeScript runtime registry returns `unknown` and requires runtime validation.
   - Rust projections are explicitly disposable; runtime registry is embedded and fail-closed.
   - `cargo test --workspace --locked` proved schema fixture parity and WIT resolution on the current tree.

5. **Engine-specific semantic authority is preserved.**
   - Radar keeps its own parse/evaluate envelopes and refusal sets.
   - Notebook keeps its own golden vectors plus Gate A checker.
   - Policy v1/v2 keep their own golden/operator/raw-input/budget authorities.
   - Boussole is the only consumer of the shared envelope and now requires exact `schemaVersion`, exact `world`, and its own semantic/security corpora.

6. **Versioning / candidate status / compatibility / interoperability are coherent.**
   - `contracts/catalog.v1.json` still marks `engine-golden-vectors-v1` as `internal`, `major-versioned`, `candidate`, with required `architecture` and `security` role passes.
   - The current target does not promote `candidate -> locked`.
   - Shared schema hash remains `2300274b...` since `ae455b9`; the post-stale remediation changed only `check-contracts.ts` and the dossier/status records.
   - TS manifest hash matches the live schema; Rust validators and WIT resolution remain green.

7. **Bounds are deterministic and preimplementation-safe.**
   - Shared envelope bounds are explicit for bytes, depth, node count, string lengths, object properties and arrays.
   - Radar, Notebook, Policy v2 and Boussole each retain explicit deterministic ceilings in their own corpora/checkers.
   - No runtime capability, allocator shortcut or implementation-specific lower ceiling is introduced by this target.

8. **Historical records are truthfully invalidated.**
   - `README.md` and `STATUS.md` now explicitly mark the `ae455b9` Architecture/Security approvals as stale.
   - `CANDIDATE-INTEGRATION-REJECT-AE455.md` is present, hash-bound, and correctly explains why the stale approvals cannot be cited.
   - The stale final verdict files remain preserved as immutable audit history, not as current approval evidence.

9. **Scope remains bounded; no capability or product expansion is introduced.**
   - No engine implementation, runtime file resolver, public scoring enablement, real-data path, release, infrastructure or deployment change was added.
   - WIT worlds for the candidate engines remain capability-free and compile/resolve without imports where required.

## Residual risks / evidence caveats

- `engine-golden-vectors-v1` remains a **candidate** authority. This pass does not authorize promotion, implementation, runtime conformance, release, or owner milestone.
- The historical `ae455b9` approval files remain in-tree for audit reasons; future promotion must rely on fresh 79d02 role records plus a separate promotion/integration pass, not on those stale files.
- `bun run check:generated-contracts` could not be executed verbatim in this detached worktree because `node_modules/.bin/biome` is absent. I compensated with direct schema/manifest/hash/opacity verification plus Rust/TS source review. This is an evidence caveat, not an architecture defect in the reviewed target.

## Explicit non-authorization scope

This architecture review does **not** authorize any of the following:

- product or Rust engine implementation against this candidate authority;
- public scoring;
- personal, tenant or real-data processing;
- runtime file/network/storage/clock/randomness capability;
- release, infrastructure, deployment or Clever Cloud work;
- catalog promotion `candidate -> locked`;
- owner control milestone.

VERDICT: approve architecture — the shared envelope remains a bounded transport/publication contract, preserves engine-owned semantics and checker authority, truthfully invalidates the stale `ae455b9` approvals, and the `79d02b67` remediation closes the mixed-HTML publication bypass without expanding scope or capability.