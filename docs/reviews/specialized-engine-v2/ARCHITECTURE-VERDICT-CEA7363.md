# Independent Architecture review — `engine-golden-vectors-v1` @ `cea73631`

- **reviewPassId:** `engine-golden-vectors-v1-architecture-cea73631-r1`
- **role:** `architecture` only
- **mode:** strict review-only specialized-role pass
- **reviewedAt:** `2026-07-17T18:12:09Z`
- **provider/model/session:** OpenAI via pi/API; exact model and session identifiers are not exposed by this harness
- **target:** `cea73631ac69c0a53549f63f521aca8ee3326a02`
- **tree:** `268ffa6c000ca18719a7499a0d4c362e37c187e3`
- **parents:** `ef1e84730e6881f539f25a6f9e78385320869df1`, `abfbd623a9fd025413ec6fb1c7063fe1bee43d5e`
- **authority:** `engine-golden-vectors-v1` remains `candidate`, `pending-independent-agent-review`; required catalog roles remain `architecture` and `security`
- **separation:** detached exact HEAD, clean before and after; no repository file edited, no commit/push/comment/review/merge/promotion/owner action performed; only `/tmp` evidence and this draft were written

## Governance and prerequisite

I read and applied `AGENTS.md`, `GOALS.md`, `STATUS.md`, the complete decision register, ADR-0001/0002/0003, `docs/architecture/TARGET.md`, the G2 prompt, contract governance/compatibility/catalog documentation, and `docs/reviews/AGENT-REVIEW-PROTOCOL.md`. I read all 26 files in `docs/reviews/specialized-engine-v2/`, including every preserved rejection and stale approval. The complete dossier hash ledger is `/tmp/engine-envelope-architecture-cea.dossier-sha256.log`, SHA-256 `784f0c1ca62eb226028f00c581897a815b3f6d2c193e89e2e30fc05a61d029ec`; the governance ledger is `c09a8e2987d70cacae89ff2149b84fc7471a9b99c3f02795c70cc831b929bfc6`.

The exact-target candidate-integration prerequisite is independently attributable on the canonical GitHub issue surface:

- pass `engine-golden-vectors-v1-candidate-integration-cea7363-r1`;
- `https://github.com/libre-ai/libre-ai/issues/25#issuecomment-5005891772`;
- target/tree exactly match this pass;
- comment created `2026-07-17T17:42:24Z`;
- exact comment body: 10,810 bytes, SHA-256 `7f492b1806091b7c74c20e46eab8ce66bf5410a9ac56900ad554cfb374958061`;
- its outcome is candidate-integration approval only and explicitly grants no Architecture, Security, promotion, product, data, runtime or release authority.

This evidence is separate from the present Architecture pass. PR #80 itself had no reviews or comments and was merged at `2026-07-17T17:26:48Z`; therefore the exact approval was recorded 15 minutes 36 seconds after merge. It is valid exact-target integration evidence for the current review sequence, but it cannot retroactively be treated as the ex-ante merge authorization required by the protocol. That historical control deviation and the absent in-tree link are recorded below as an audit reservation.

## Immutable scope and history

Initial and final proofs both showed detached `HEAD=cea73631ac69c0a53549f63f521aca8ee3326a02`, tree `268ffa6c000ca18719a7499a0d4c362e37c187e3`, and zero porcelain entries. The second parent has the same tree as the merge. Against first parent `ef1e847`, the target changes exactly seven files:

- `STATUS.md`;
- `contracts/fixtures/schema-fixtures.v1.json`;
- `contracts/schemas/engine-golden-vectors.v1.schema.json`;
- preserved `CANDIDATE-INTEGRATION-REJECT-EF1E847.md`;
- dossier `README.md` and `REMEDIATION.md`;
- generated `manifest.json`.

The generated declaration is byte-identical to both parents; only its manifest schema digest changes. No catalog status, WIT/profile/semantics, engine corpus, dedicated checker, scanner implementation, Rust projection, product runtime, migration, data, capability, release or deployment surface changes in this delta.

## Architecture assessment

1. **Shared authority remains a bounded publication envelope.** Metadata is closed and recursively sanitized. Engine payload branches are structurally bounded but intentionally opaque. The shared schema does not define Radar, Notebook, Policy or Boussole semantics.
2. **Schema/scanner drift is closed.** `metadataString` and the quality scanner cover generic, RSA, DSA, EC, OpenSSH, encrypted PKCS#8 and OpenPGP private-key headers. New negative schema fixtures bind DSA, encrypted PKCS#8 and OpenPGP. TS and Rust runtime schema tests both pass.
3. **Preflight ordering is fail-closed and deterministic.** The shared gate applies 8 MiB file size, strict UTF-8 JSON/depth, local structural and aggregate limits, public-content scan, AJV validation, then `contractFiles` resolution. Failures do not reflect rejected values.
4. **Only `contractFiles` gains resolver semantics.** Paths are closed to repository-relative `contracts/...`; duplicate, traversal/URI, missing, symlink, non-file, repository escape and SHA mismatch cases fail. Payload path and URI strings remain inert.
5. **The scanner is bounded quality tooling, not runtime authority.** It scans values and keys, performs bounded normalization/decoding, parses URI userinfo without resolving it, and is imported only by the contract gate and its tests. The sole sensitive-looking corpus exception is exact-value and exact-file bound to the Radar refusal canary.
6. **Engine ownership remains local.** Radar `PROFILE.md`, Notebook/Policy/Boussole `SEMANTICS.md`, their WIT worlds and dedicated checkers remain the semantic authorities. Shared validation does not override their refusal codes, budgets, canonicalization, scoring or cryptographic rules.
7. **Generated TS/Rust surfaces are projections, not parallel domain implementations.** Recursive payload values remain opaque; runtime JSON Schema validation is authoritative; Rust embeds the same canonical schemas and fails closed without echoing private values. The generated declaration remains unchanged and the manifest binds the live schema SHA.
8. **Compatibility and scope remain controlled.** The catalog keeps one `major-versioned`, `internal`, candidate authority. No durable duplicate implementation, runtime resolver, network/storage/clock/randomness/secret capability, product engine, public scoring, personal/tenant data path, infrastructure or release is introduced.
9. **Dependency scope is contained.** `entities@8.0.0` is exact-pinned, BSD-2-Clause, dependency-free and used only by the local dev-time scanner. Package and license hashes reproduce the dossier. Explicit owner acceptance is still required before promotion.

## Reproduced gates

Pinned tools:

- Bun `1.4.0-canary.1+57f349f63`;
- Rust/Cargo `1.97.0`;
- cargo-deny `0.19.5`.

Commands and outcomes:

- `bun install --frozen-lockfile` — pass;
- `bun run check` — pass: toolchain/source/contracts, all dedicated vector checkers, Notebook Gate A, 48 generated TS projections, 47 JS licenses, Biome, TypeScript, `235 pass / 0 fail / 594 expectations`;
- `bun audit` — no vulnerabilities;
- `cargo fmt --all --check` — pass;
- `cargo clippy --locked --workspace --all-targets --all-features -- -D warnings` — pass;
- `cargo test --locked --workspace --all-features` — pass: 40 Rust tests plus doc tests;
- locked release build for `libre-ai-notebook-core` on `wasm32-unknown-unknown` — pass;
- `check_wasm_imports` — 0 module imports, 0 component imports, 512 MiB memory cap, expected WIT exports;
- clean second WASM build in a separate target directory — byte-identical, both SHA-256 `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`;
- `cargo deny check advisories licenses sources` — `advisories ok, licenses ok, sources ok`.

Key log SHA-256 values: Bun check `83c49ec1d70bdebb9dca76c5ae3b6adb56d032e9111181b8226cac315e3c1146`; Bun audit `da111885f1ced5ca5cd4ab06721e793d68cf1eff91ed36a35f4ca9b6c1bccf66`; clippy `4dd3ee241a7a8b6a99826a0d95cd63be49da095c8edecdc42d9901e91002e424`; Rust tests `a3bd4eeb20706d4e86d966bf06c54f89a872599966bd7f56ea9817d074f45a62`; WASM import `76699444bd7499c0eda9d143ccabf17e39dbcb88b83f4e590f6f0f187d828410`; reproducibility `bdc0eb40fdeb09083e79e1df4d3abbd1f00afe2813e2e8b82d310a4630a9475a`; cargo-deny `245deecd3483cc5322ad2199ecc5c9421e832e3f1e6d2f8419170f3c74bccf46`.

## Independent probes

All probes ran against disposable `git archive` copies or canonical registry/scanner imports; they did not edit the repository.

- Direct schema/scanner/corpus probe: **46 assertions passed**. Metadata rejected all seven private-key families; the opaque payload schema accepted them; the scanner rejected them. Four generic/encoded URI-userinfo forms were detected. Five safe controls were preserved. Across all public corpora the only raw scanner hit was the exact Radar canary. Log SHA-256 `a880133bf585b73ebf8ba797454359e3f053dd85d10eefb033b5e83f1bde4ff8`.
- Real publication-gate mutations: **46 isolated runs / 119 checks passed**. All seven marker families and all four URI-userinfo forms failed in values and keys without reflection; safe controls passed; altered/moved Radar canaries failed; `contractFiles` mismatch/missing/duplicate/symlink/traversal failed; every over-limit mutation failed; strict/bounds/scanner/schema/resolution order was observed. Log SHA-256 `2cfed5c298713f3b42d17ed6347edbc48cef9ebf3bb7c0616cd2d03277b6f54b`.
- Exact-ceiling acceptance: **7/7 passed** for 65,536-code-point string, 4,096-item array, 512-property object, 128-code-point key, depth 64, 200,000 aggregate nodes and exactly 8 MiB. Log SHA-256 `53c144d3a4204ee87778409e46a8dd2a10eb4de4472ec1178098dafe714743d3`.

No red evidence is hidden: the first real-gate harness run produced every expected accept/reject decision but failed 13 of its 119 own checks because its expected diagnostic substrings were approximate (for example “digest mismatch” instead of the gate's “hash mismatch”). That failed log is preserved at SHA-256 `04a898eb1275b87a97cadad72606ce94c9e848d5f2c96476fcc5afe4afb110b8`. Only `/tmp` message literals were corrected; the unchanged target then passed 119/119.

## Contract, vector and semantic hashes

Canonical boundary:

- catalog `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`;
- schema `443f6fbee0a949ec47b5bf3081b3039e4ddac630eded8dc32c96223f82c74f58`;
- schema fixtures `b46508330dd252230abd690523e506e5ebe2ae9ef4799a6fcf739982099de760`;
- generated declaration `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`;
- generated manifest `b9b701cdeab1f6f764e4e7ab00f4554c3954a2e123b0c57916ac0358126b0287`;
- shared gate/scanner/tests `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a` / `f37e28f6cd36563452ab2267de0585c7f3b496770cd5c88218139ef7383bf352` / `fddb23f0d3510332a9fac9abbb2f5a87eab8a308fbed9105f6da1f5b7cf2b658`.

Corpora:

- Radar golden/security `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365` / `a092dabcd81afdac4eaeb57aafc4bf9c26cec89aa514f05e48e56bfe1b0804a6`;
- Notebook golden `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`;
- Policy v1 golden/operators `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4` / `6e1abd2c8806c982019a5cfa573d156f0f5be4fd9b11dd188a97e9bfbbebc298`;
- Policy v2 golden/operators/budgets `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad` / `cb4c4d1929e01cfc6cd87d5f4386e54b9f3294ef6789c562f556d1b0c5db5bc2` / `6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77`;
- Policy raw-invalid corpus ledger `b55546779a0e40e683ac100c81496be57faafe3062f5bd04395b512fe7b4c977`;
- Boussole golden/security `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335` / `267b7144e5c97fd8840dc40c0c87933000696547a959bbd246904e3af53fc8b6`.

WIT and semantic authorities:

- Radar world/profile `0fbb69be39f265e44feb77ce054fcece052cff38ff0eacd3353f9f8d50bd8073` / `41de764dafb0e0778c7f7a338400b587ad980669879ff51bf5afe6514f3a434c`;
- Notebook world/semantics `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` / `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b`;
- Policy v1 world/semantics `1414e64f434ce72bd7d1bf9e182951c25b6b493c2f146054d7e40eaffcb4f21d` / `ce92a54fe1c94bcf6dfbe0356d57fbfa7b132fec4156d404b6ccb986a4220788`;
- Policy v2 world/semantics `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4` / `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc`;
- Boussole world/semantics `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad` / `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5`.

The complete 38-file source/checker boundary ledger is `/tmp/engine-envelope-architecture-cea.boundary-sha256.log`, SHA-256 `8876a344b32efad926c8b0bd77573266e6f3e920a360d7c4ab6b642baf245e67`. The complete 38-artifact evidence ledger is `/tmp/engine-envelope-architecture-cea.evidence-sha256.log`, SHA-256 `402fe0ae5013581804d6b3c020afcaa0a3a9526a3101efeb3931ca1876bcd20a`.

## Findings

### Blocking

None in the Architecture boundary.

### Major

None in the Architecture boundary.

### Minor reservations

- **ARCH-CEA-MIN-001 — review-state linkage is stale in-tree.** `STATUS.md` and the dossier still say fresh candidate-integration is pending, while the exact approval exists only in issue #25 and is not linked with its content hash. Before promotion evidence is collected, the dossier/status must reference the exact external record or persist it without rewriting historical rejects.
- **ARCH-CEA-MIN-002 — merge-control chronology.** PR #80 was merged before the exact candidate-integration approval was recorded. The later exact-target pass supports the current Architecture sequence but does not retroactively satisfy the protocol's ex-ante merge prerequisite. This deviation must be explicitly retained in the audit trail and must not be repeated or interpreted as merge authorization from this pass.

### Residual risks

- A fresh independent Security verdict is still mandatory; this pass grants none.
- `entities@8.0.0` still requires explicit owner acceptance before promotion.
- Opaque generated payload projections are not product input validators. Any product/runtime consumer or semantic consolidation would require a new review.
- Any normative change to schema, scanner, corpus, WIT/semantics, generated binding, checker or dependency state makes this evidence stale.

## Final clean state and non-authorization

Final cleanup removed `node_modules`, repository `target`, the separate WASM rebuild and external Cargo target. Final proof: detached exact HEAD/tree/parents, no staged or unstaged path, `PORCELAIN_COUNT=0`; log SHA-256 `f491784cc98d3a85053e31ad42c4b87bda708cc0a58c43dc566cadf557af0b7a`.

This Architecture pass does **not** promote or lock the catalog, merge anything, grant Security approval or owner control, accept a dependency for the owner, authorize product/runtime/data work, enable public scoring or capabilities, or authorize release, infrastructure, Clever Cloud or deployment.

VERDICT: approve-with-minor-reservations architecture — the immutable `cea73631` boundary is structurally bounded, resolver-confined, schema/scanner-aligned and leaves engine semantics with their WIT profiles and dedicated checkers; however, the exact candidate-integration evidence is external and postdates PR #80's merge, so the dossier/STATUS linkage and historical merge-control deviation must be recorded before promotion, while Security, owner, product, runtime, data and release gates remain closed.