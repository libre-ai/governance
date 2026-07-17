# Libre AI independent Architecture review — `engine-golden-vectors-v1`

## Attribution and role boundary

- `reviewPassId`: `engine-golden-vectors-v1-architecture-ccf9d684-r1`
- `role`: Architecture only
- `mode`: strict review-only specialized-role pass
- `reviewedAt`: `2026-07-17T19:26:51Z`
- `agent`: API coding assistant operating through pi
- `provider/model/session`: not exposed by this harness
- `report`: `/tmp/engine-envelope-architecture-ccf.draft.md`
- `repository changes`: none; no edit, commit, push, comment, review submission, merge, promotion, dependency acceptance or owner-control action was performed

This pass does **not** perform Security. Historical Security records were read only to establish invalidation chronology and the need for a separate fresh role verdict. Candidate-integration records are prerequisite integration evidence only and are not treated as Architecture approval.

## Immutable target and PR #83 identity

- requested/actual target: `ccf9d684d9a43ad7236bec905e701e155520e2d6`
- target tree: `b27ab744e4a53e6f5108f8f72b22dee1e80c8843`
- first parent: `a3afbbb8a4ea08b007b4893794446a02d1194070`
- second parent: `768f8511096e5467d805225f8b21f7ca6038a459`
- remote PR #83 head: `768f8511096e5467d805225f8b21f7ca6038a459`
- PR #83 head tree: `b27ab744e4a53e6f5108f8f72b22dee1e80c8843`
- target tree equals PR head tree: **yes**
- second parent equals PR head: **yes**
- `git diff HEAD 768f851...`: empty
- empty diff SHA-256: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- effective first-parent patch SHA-256, `git diff --binary HEAD^1..HEAD`: `5d7536cd7b69bb1cfaeb69e0f9dfa2606c4a2fdb74a62bc4fb3fddfebb655b24`
- same patch with `--full-index`: `b991223aa2fbc13c60b2fb812b889cc98b34866a50b630aa7e45baf24b3330fb`

GitHub reports PR #83 base `a3afbbb8...`, head `768f8511...`, merge `ccf9d684...`, merged by the human owner `constantin-jais` at `2026-07-17T18:51:53Z`. The exact-head Bun and Rust CI checks completed successfully at `18:34:39Z` and `18:37:50Z` respectively.

### Pre/post-merge control chronology

1. Exact-head candidate-integration evidence was posted on PR #83 at `2026-07-17T18:51:29Z`, 24 seconds before merge:
   - URL: `https://github.com/libre-ai/libre-ai/pull/83#issuecomment-5006514966`
   - pass: `engine-golden-vectors-v1-candidate-integration-768-r1`
   - body: 12,186 bytes
   - body SHA-256: `39b47be053bf8ad487ea6cfff102b844f909f1fdd7d43ce2b6446ae08e0e518c`
   - verdict: candidate-integration approval only.
2. The human owner then performed the explicit merge action at `18:51:53Z`. No role review is inferred from that control action.
3. Exact-merge post-merge candidate-integration evidence was posted at `2026-07-17T19:14:38Z`:
   - URL: `https://github.com/libre-ai/libre-ai/issues/25#issuecomment-5006683546`
   - pass: `engine-golden-vectors-v1-post-merge-candidate-integration-ccf9d68-r1`
   - body: 13,576 bytes
   - body SHA-256: `7dcdeeee045244554931fc53346f7c7931744cb39edb5fb4939604f7e7e2aac0`
   - verdict: candidate-integration approval only.
4. A later documentation-only record exists at `b93b12280e05b1036155f2f61c49a16b426be50f`, with `CANDIDATE-INTEGRATION-CCF9D68.md` SHA-256 `62d59e751efbe0144d779b3497e55d7494a9d36b5b5ebadc1c22ce69d02ffc4f`. It is lifecycle evidence, not part of the reviewed target and not an Architecture verdict.

The required ex-ante order for PR #83 is therefore present: green exact-head CI, exact-head candidate-integration, then owner merge. The post-merge pass verifies the immutable merge/tree separately.

## Governance and reviewed surfaces

Read completely and applied:

- `AGENTS.md`, `GOALS.md`, `STATUS.md` and `docs/decisions/DECISION-REGISTER.md`;
- ADR-0001, ADR-0002 and ADR-0003;
- `prompts/02-foundation-build.md` and `docs/architecture/TARGET.md`;
- `contracts/{README.md,CATALOG.md,COMPATIBILITY.md}`;
- `docs/reviews/AGENT-REVIEW-PROTOCOL.md`;
- every file in `docs/reviews/specialized-engine-v2/`, including all stale approvals, all preserved rejects, dependency qualification and the CEA/BEC history.

Reviewed contract architecture:

- canonical catalog, shared JSON Schema and its complete positive/negative fixture pair;
- generated TypeScript declaration/manifest/generator/runtime registry;
- generated Rust projection build, embedded runtime registry and schema-fixture tests;
- strict JSON parser, shared publication gate, scanner and scanner tests;
- all five public golden corpora and their supporting Radar/Boussole/Policy fixtures;
- all dedicated Radar, Notebook, Policy v1/v2 and Boussole checkers;
- all five relevant WIT/profile/SEMANTICS boundaries;
- package/lock/license data, CI workflow, Cargo workspace and `deny.toml`;
- source usage searches for a parallel validator, SDK, resolver or product/runtime consumer.

Complete source/dossier/corpus/WIT/checker hash ledger:

- `/tmp/engine-envelope-architecture-ccf-evidence/source-surface-hashes.log`
- 93 entries/section lines
- ledger SHA-256: `31f4860c4d96be2a2c3494f89db3568812781f4770428c1c1f93d51ae14c817e`

## Architecture assessment

### 1. Canonical authority, compatibility and ownership

`contracts/catalog.v1.json` contains one shared authority:

- ID `engine-golden-vectors-v1`;
- owners `canonical-core`, `specialized-rust`;
- consumers `specialized-rust`, `quality`;
- `internal`, `major-versioned`, `candidate`;
- required roles remain exactly `architecture`, `security` under `pending-independent-agent-review`.

The PR narrows metadata validation while the authority is still pre-implementation candidate. No released producer or compatibility obligation is recorded, so the change is compatible with `contracts/COMPATIBILITY.md`; no v1→v2 adapter or legacy layer is warranted. The engine WIT/profile authorities and corpus bytes are unchanged by PR #83. No catalog promotion occurs.

The shared schema remains a structural/publication envelope. Radar, Notebook, Policy and Boussole retain semantic ownership in their WIT/profile/SEMANTICS files and dedicated checkers. The shared layer does not define parsing, canonicalization, cryptography, policy evaluation or scoring behavior.

### 2. Metadata/payload split

The schema closes every metadata path:

- top-level identifiers and versions have ASCII patterns;
- `contractFiles` has a closed path/hash object;
- `metadataString` is limited to tab/newline/CR/printable ASCII and 65,536 code points;
- recursive metadata property names are ASCII machine tokens, bounded to 128 characters;
- metadata arrays/objects are bounded to 4,096/512.

Engine payload values remain Unicode-capable and structurally opaque, with 65,536-code-point strings, 4,096-item arrays, 512-property objects and 128-code-point Unicode property names. The new fixture proves fullwidth/default-ignorable path-like strings remain representable in payload while the same forms fail in metadata. Direct registry probes reproduced both sides.

The TypeScript declaration and Rust projection deliberately collapse recursive values to unknown/`serde_json::Value`-style shapes. Their banners and crate documentation state that runtime JSON Schema validation is authoritative. This is the correct ownership boundary rather than a second semantic model.

### 3. Publication gate and bounded scanner

The gate order is explicit and reproduced:

1. 8 MiB file ceiling;
2. strict UTF-8 JSON, no BOM, duplicate members, unpaired surrogates or non-finite numbers, depth 64;
3. 200,000 nodes, 65,536 code points/string, 4,096 items/array, 512 properties/object, 128 code points/key;
4. publication scan of values and keys;
5. AJV 2020-12 validation;
6. `contractFiles` resolution.

Actual-gate mutations confirmed size and strict parsing short-circuit the scanner, bounds precede later work, the scanner precedes AJV, and AJV precedes repository resolution.

The scanner performs four bounded decode rounds and a bounded set of decoded/normalized/default-ignorable views. The wrapped-CFWS implementation uses iterative stacks, typed-array interval deltas and linear output passes; it has no recursive projection or repeated whole-string concatenation in those projections. Independent maximum probes completed in milliseconds at 65,536 code points (`no-at` 3.902 ms, `many-at` 6.463 ms, wrapped parentheses 1.240 ms), and the repository max-adversarial test remains below its 2,000 ms ceiling.

The scanner correctly keeps non-ASCII CFWS-like separators opaque, accepts malformed/non-domain controls and detects the requested case-insensitive RFC `IPv6:` forms. Generic URI userinfo is recognized lexically for syntactically valid `scheme://authority` forms across schemes; no URL, DNS, file or network resolution occurs.

### 4. Resolver confinement and Radar canary

Only `contractFiles` is resolved. Schema and runtime checks jointly enforce repository-relative `contracts/...` paths, lowercase SHA-256, uniqueness, existing regular files, no symlink component, repository confinement and exact content digest. Independent recomputation matched all eight Radar bindings.

Path/URI-like payload strings remain inert. No payload field is passed to `lstat`, `realpath`, `Bun.file` or another resolver. Generic URI userinfo parsing remains a lexical publication check, not a capability.

The sole scanner exception is byte-exact and file-bound:

- file: `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json`;
- value: `https://user:secret@example.org/feed.xml`.

Moving the value to Notebook or altering it in Radar failed the real gate. The current corpus contains it once.

### 5. Generated bindings and absence of a parallel SDK/validator

Key canonical hashes:

- catalog: `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`;
- schema: `a654c359a342c65e175926ee364abadece1bde47757b4a58ee95144123de185f`;
- schema fixtures: `afb10e51d4933305edf72241b01dab832e7f25dd38e4e6bfde8b42ba675a10d5`;
- generated TS declaration: `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`;
- generated manifest: `fe74285d3f77c290a94bc47e3d8f762b1880e15368436bffa51076b623b79e6a`.

The manifest schema digest exactly equals the live schema digest. The declaration is byte-unchanged because the PR adds validation-only metadata constraints, not a new static shape. `bun run check:generated-contracts` verified all 48 projections.

Two independent Rust build-script outputs were byte-identical:

- `generated_types.rs`: `4321cfead46ef18935aa4665bdd6f7913d5b3cc70ad1151335c6da64a31d502e`;
- `embedded_schemas.rs`: `edf03608b994dbe1e8033b392c804f0d479c76fbe5788a556df5c5e3efa1ebc1`.

The Rust registry embeds the canonical schemas and returns path/schema-path/keyword issues without rejected values. The TypeScript registry compiles the same canonical files. These are language projections/validators of one authority, not parallel domain implementations. Search found no product/runtime consumer of the shared generated type or scanner and no second handwritten envelope SDK.

### 6. Engine-owned WIT, semantics, checkers and corpora

The relevant WIT/profile hashes are unchanged and remain engine-owned:

- Radar world/profile: `0fbb69be39f265e44feb77ce054fcece052cff38ff0eacd3353f9f8d50bd8073` / `41de764dafb0e0778c7f7a338400b587ad980669879ff51bf5afe6514f3a434c`;
- Notebook world/semantics: `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` / `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b`;
- Policy v1 world/semantics: `1414e64f434ce72bd7d1bf9e182951c25b6b493c2f146054d7e40eaffcb4f21d` / `ce92a54fe1c94bcf6dfbe0356d57fbfa7b132fec4156d404b6ccb986a4220788`;
- Policy v2 world/semantics: `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4` / `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc`;
- Boussole world/semantics: `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad` / `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5`.

Golden corpus hashes:

- Radar: `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`;
- Notebook: `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`;
- Policy v1: `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`;
- Policy v2: `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`;
- Boussole: `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`.

The shared gate validated all five before each dedicated checker exercised its own exact semantics, refusals, ordering, hashes and budgets. Boussole additionally requires exact shared schema version and `world = boussole-scoring-v2` before reading cases. WIT resolution confirmed zero imports for all four v2 specialized worlds.

### 7. Dependency qualification and lifecycle

`entities` is exact-pinned as root `devDependency` `8.0.0`; the lock entry has an empty dependency object and integrity `sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==`.

Installed evidence reproduced:

- package manifest SHA-256: `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`;
- license SHA-256: `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`;
- license: BSD-2-Clause;
- dependencies/peers/optional dependencies: none.

It is imported only by the repository-time scanner. There is no hosted API, telemetry, runtime data plane or product bundle path. Technical qualification is coherent, but this Architecture pass does not and cannot provide the explicitly required owner acceptance. Promotion remains blocked on that control.

## Reproduced commands and evidence

### Pinned Bun

- `bun install --frozen-lockfile` — pass; 90 packages; log SHA-256 `995fe59285e6fcbc9be40889135f6f0cb1718ef6308c7fd2bdb91142b3f61da0`.
- `bun run check` — pass; exact `1.4.0-canary.1+57f349f63`, 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations, all dedicated checkers, Notebook Gate A, 48 generated projections, 47 licenses, Biome, TypeScript, `257 pass / 0 fail / 622 expectations`; log SHA-256 `fe48166649188634e6fcb672d7b5e007cbfe3690c9658807ef520d2531421ee3`.
- `bun audit` — pass, no vulnerabilities; log SHA-256 `da111885f1ced5ca5cd4ab06721e793d68cf1eff91ed36a35f4ca9b6c1bccf66`.

### Pinned Rust, WASM and cargo-deny

Toolchain: `rustc/cargo 1.97.0`, target `wasm32-unknown-unknown`, cargo-deny `0.19.5`.

- `cargo fmt --all --check` — pass.
- `cargo clippy --locked --workspace --all-targets --all-features -- -D warnings` — pass; log SHA-256 `f76ea602b794b18fe5f2b68b2db3fff1b06c65ffcc0f9c62470fb86eb2823442`.
- `cargo test --locked --workspace --all-features` — pass; all workspace/doc tests; log SHA-256 `3696f103aeb6ddf2cf076a3fb0cf258ee38987d5efcc6bc9b58b68d285ec2a2a`.
- two clean locked release WASM builds in separate target directories — pass and byte-identical.
- WASM SHA-256, both builds: `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`.
- import/component check — pass: 0 core imports, 0 component imports, 512 MiB memory cap and expected WIT export; log SHA-256 `b805460a2631f3fd3ba236cd946ffc548948c145585ee3e1c1c8d95dd4a57e47`.
- `cargo deny check advisories licenses sources` — pass; `advisories ok, licenses ok, sources ok`; log SHA-256 `245deecd3483cc5322ad2199ecc5c9421e832e3f1e6d2f8419170f3c74bccf46`.
- full `cargo deny check` — exit 0; advisories/bans/licenses/sources all ok; pre-existing duplicate-version warnings only; log SHA-256 `63d1238a43a0942355663072644c31c1ebb7fc91bca3c1de660e8e911c04b923`.

### Independent Architecture probes

- direct scanner/schema/catalog/generated-boundary probe: 26/26 pass; script SHA-256 `d365d1fdbfd71662c764c14da361c407b0c472288bfe374a024be6d8b1f819b3`; result SHA-256 `52c811d886c0aa57ae4d6b5ff2a837f9fe92034eadb63f2cd91e7471d9ad2755`.
- real publication-gate probe in disposable exact-target archives: 12/12 pass; covered wrapped CFWS values/keys, Unicode payload opacity, ASCII metadata refusal, Radar canary scope, `contractFiles`, size/strict/bounds/scanner/AJV/resolver order; script SHA-256 `53d4bd4266144c28407644987b29700370aa36aec2b5832464948c1a36591c16`; result SHA-256 `5d5cad8cc537aaa2c8ea689391ee859e45733000da1cf32ffdd1e245f548c64c`.
- bounded-complexity probe: all 12 scaling cases pass; script SHA-256 `bcc8c682c7897d10f534f14c849df7bc719988e91ae311573ea38fbbc51074c2`; result SHA-256 `0bb2fd2f1f98e9089e0b19e71e5470b22cbc78aa6dcfc427c2c89bfc8af0fd81`.
- PR/tree/chronology evidence log SHA-256: `68a35fc093c82c00e9908d86aa076ba2b1557988e39af3f15518024d6ad05357`.
- complete evidence ledger: `/tmp/engine-envelope-architecture-ccf-evidence/evidence-ledger.sha256`, SHA-256 `fef6d1653aae346e75b6cadfe7a6f773c4bfc9ebc8c827000019df286fe72750`.

## Findings

### Blocking

None.

### Major

None.

### Minor reservation

`ARCH-CCF-MIN-001 — the exact target's in-tree review-state chronology is stale.`

- `STATUS.md:41` still says the combined remediation requires fresh candidate-integration.
- `docs/reviews/specialized-engine-v2/README.md:159,163-166` still says the remediation must receive candidate-integration before merge and lists pre-merge candidate-integration, merge and post-merge candidate-integration as outstanding.
- The exact pre-merge and post-merge records do exist and are hashable on canonical GitHub; the pre-merge chronology is correct. A later immutable commit persists a post-merge record. Those facts make this an audit/documentation reservation, not a contract-boundary defect.
- Before any promotion package is accepted, a documentation-only descendant must link/persist the exact PR #83 pre/post records and reconcile `STATUS.md`/the dossier without changing the reviewed schema, scanner, fixtures, generated bindings, corpora, WIT semantics, checkers or dependency state. Any normative change would instead require a new Architecture pass.

## Residual risks and explicit non-authorization

- A separate fresh Security role verdict on the immutable authority is still mandatory; none is provided here.
- `entities@8.0.0` still lacks the explicitly recorded owner dependency acceptance required before promotion.
- Promotion still requires a separate promotion/integration pass and human owner milestone.
- Generated recursive projections are intentionally opaque and must not become product input validators.
- Full cargo-deny retains allowed duplicate-version warnings; they are not hidden, and all enforced checks pass.
- The authority remains candidate. This review authorizes no product engine, runtime conformance claim, public scoring, personal/tenant/real-data processing, network/storage/file/secret capability, release, infrastructure, Clever Cloud or deployment work.
- Later `main` movement and later candidate-integration persistence are lifecycle evidence only; this verdict is bound to target/tree/hashes above.

## Final clean-state proof

After removing all review-installed `node_modules`, Cargo targets, WASM rebuilds and disposable probe trees:

```text
HEAD=ccf9d684d9a43ad7236bec905e701e155520e2d6
TREE=b27ab744e4a53e6f5108f8f72b22dee1e80c8843
PARENTS=a3afbbb8a4ea08b007b4893794446a02d1194070 768f8511096e5467d805225f8b21f7ca6038a459
HEAD=detached
PORCELAIN_COUNT=0
UNSTAGED=empty
STAGED=empty
git diff --check=clean
node_modules_count=0
repository target=absent
external Cargo/WASM targets=absent
git clean -ndX=empty
git clean -nd=empty
git fsck --connectivity-only=exit 0
```

Clean-state log SHA-256: `707f473062d33d3f560799ec10b50dcf962d476669c241b147a502f99c2994c4`.

VERDICT: approve-with-minor-reservations architecture — the exact PR #83/merge tree is bounded, projection-consistent, resolver-confined and preserves engine ownership; before promotion, persist/link the exact pre/post candidate-integration evidence and reconcile the stale in-tree STATUS/dossier chronology, while Security and owner dependency acceptance remain separate and pending.
