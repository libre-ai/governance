# Libre AI — `engine-golden-vectors-v1` — candidate-integration

## Attribution and immutable scope

- `reviewPassId`: `engine-golden-vectors-v1-candidate-integration-77a4-r1`
- `role`: candidate-integration reviewer only
- `mode`: `candidate-integration`, review-only
- `date`: `2026-07-17T13:34:35Z`
- `provider/model`: OpenAI API / exact model identifier not exposed by the harness
- `session`: not exposed by the harness
- `target`: `77a4b1de79c1dbf3b03de1d54f1db5f5f282821c`
- `target tree`: `2dc392275561206a6c9e79ec8024a38e1052f2f8`
- `base`: first parent `26ac8fe8ade91c67fd09dc60a3ad736d2c0c7aa5`
- `second parent`: `d3c96c2061afddf48e3938e4129924dab4bbb181`
- `authority`: `engine-golden-vectors-v1`, `candidate`, `pending-independent-agent-review`; required roles remain `architecture` and `security`
- `worktree`: detached, exact target, clean before and after; no tracked file was modified, no commit/push/comment/merge/promotion was performed

This pass is not Architecture, Security, promotion, owner control, implementation or release approval. It authorizes nothing involving a product engine, scoring, real or tenant data, capabilities, network/storage/secrets, release, infrastructure or deployment.

## Governance and history read

Read completely: `AGENTS.md`, `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `docs/adr/0003-wp-g2-s01-contract-amendment.md`, `prompts/02-foundation-build.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, and the complete `docs/reviews/specialized-engine-v2/` dossier.

The target is G2 canonical foundations, not the G4/G5 cutover prompt. The dossier was read in full, including the stale approvals and all preserved candidate-integration/security records: AE455, 3BAECF8, 39F776E, E6DF443, 9E74BAB, A4E74A6, 453B0A6, 1523BCD, 26AC8FE and the 79D02 parallel records. Earlier approvals are treated as stale and non-citable. The current target adds and references the 26AC8FE rejection; the catalog remains unchanged and candidate.

Relevant history inspected, not only the last commit: `0311d98`, `12e5b73`, `3ec2f2e`, `9f15ae8`, `ae455b9`, `79d02b6`, `e6df443`, `9e74bab`, `ded4d6b`, `1523bcd`, `453b0a6`, `26ac8fe`, `d3c96c2`, plus the adjacent unmerged trailing-punctuation remediation history (`b491dbc`, `1ffb285`) for independent context. Only `77a4` and its ancestors are reviewed as the target; later sibling work is not approval evidence.

The first-parent target delta is bounded to five files:

- `STATUS.md`;
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-26AC8FE.md`;
- `docs/reviews/specialized-engine-v2/README.md`;
- `docs/reviews/specialized-engine-v2/REMEDIATION.md`;
- `tools/quality/public-source-scanner.ts`.

No schema, catalog, public corpus, generated projection, WIT/profile/semantics authority, Rust implementation or runtime consumer changed in this delta.

## Reviewed surface

Inspected the canonical shared schema and catalog entry, schema fixture, generated TypeScript declaration and manifest, TypeScript registry/generator, Rust build/projection/runtime registry and fixture/WIT tests, strict JSON helper (`tools/quality/policy-core-raw-inputs.ts`), shared gate, exported scanner and tests, all dedicated checkers, lockfiles and dependency metadata.

Inspected all five public synthetic golden corpora and their semantic ownership:

| Corpus | Cases / relevant inventory | SHA-256 |
|---|---:|---|
| Radar v2 | 43 parse, 16 evaluation | `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365` |
| Notebook Core v2 | 10 backup, 12 context mutations | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |
| Policy Core v1 | 17 golden, 28 operators | `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4` |
| Policy Core v2 | 20 golden, 28 operators, resource budgets | `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad` |
| Boussole v2 | 10 methodology cases | `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335` |

Radar/Boussole security corpora, Policy raw/operator/budget fixtures and the five engine WIT/profile/semantics boundaries were also checked. Radar, Notebook, Policy v1/v2 and Boussole retain their own semantic checkers; the shared envelope does not own engine semantics. Search found no product/runtime consumer of the generated shared TypeScript type or a shared engine implementation.

## Pinned gates

All required repository gates passed with the pinned toolchain:

- `bun install --frozen-lockfile`: pass, 90 packages installed;
- `bun run check`: pass — exact Bun revision, source/objective/specification gates, contracts, Notebook Gate A, 48 generated projections, work packages, licenses, Biome, TypeScript and `198 pass, 0 fail` Bun tests;
- `bun audit`: pass, no vulnerabilities;
- `cargo fmt --all --check`: pass;
- `cargo clippy --workspace --all-targets --all-features -- -D warnings`: pass;
- `cargo test --workspace --all-features`: pass, all workspace tests and doc tests green;
- Notebook WASM release build/import/memory check: pass, 0 module imports, 0 component imports, 512 MiB cap and WIT exports present;
- reproducible WASM rebuild: pass, both artifacts SHA-256 `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`;
- `cargo deny check advisories licenses sources`: pass.

The first Rust invocation inherited an external `CARGO_TARGET_DIR` and therefore missed the literal repository-relative WASM path. This was not hidden: it was replayed with `CARGO_TARGET_DIR` unset, matching CI semantics, and the complete Rust gate passed. Replay log SHA-256: `ae07ae5701513b952af11cff3cd24c8772a0c59a665716809f993465380c9d48`.

Evidence log SHA-256: Bun check `576219f43771260cfb15f47303b66d8a9ab721f7c234fcc659d47a866c08bfe5`; Bun audit `da111885f1ced5ca5cd4ab06721e793d68cf1eff91ed36a35f4ca9b6c1bccf66`; Rust replay `ae07ae5701513b952af11cff3cd24c8772a0c59a665716809f993465380c9d48`.

## Independent actual-gate evidence

All probes used ephemeral copies outside tracked files and the actual `tools/quality/check-contracts.ts` gate.

### Positive detection matrix

The gate rejected the following in both payload values and payload property names: direct, percent, `%u`, numeric and exact HTML5 entities; nested and mixed HTML encodings; quoted and escaped local-parts; EAI emoji, private-use, C1, unassigned, noncharacter and default-ignorable scalars; exact HTML5 default-ignorable references; nested comments/CFWS; Unicode/combining-mark IDNA, punycode, IPv4 and IPv6 literals; and direct/default-ignorable-obfuscated credentials.

The gate preserved the required opaque controls in values and keys: `release@2`, unknown and mixed-case entities, literal unresolved markers, `R&D`, `R&amplitude`, `50%`, encoded public URL text, Unicode prose, malformed dot-atoms, overlong local-parts, invalid domains, inert traversal and inert `file:` payloads. The complete matrix log SHA-256 is `59ca8e29cc5cb14c198375712594753ae059775f8dc40a66fca874226a1b1754`.

### Preflight, bounds and expansion

Source inspection and ephemeral probes confirmed the intended order: file-size ceiling, strict UTF-8/JSON/depth parsing, recursive node/string/container/property-name bounds, public-content scan, AJV, then `contractFiles` resolution. BOM, invalid UTF-8, duplicate member, unpaired surrogate, non-finite number and excessive-depth inputs fail before later stages. A sensitive scalar in a structurally invalid envelope is reported by the content scan before AJV. Invalid `contractFiles` syntax fails AJV before resolution.

Observed limits and `+1` refusals: 8 MiB file, 65,536 code points per string, 4,096 array items, 512 object properties, 128 code points per property name and 200,000 recursive nodes. NFKC expansion beyond 65,536 code points fails closed; a decoded percent control within the source string ceiling passes. Bound/expansion log SHA-256: `c8d0f22b8ee15fc222b5da727fff08ae54f855780b765057fc271180f5a79a56`.

Maximum scanner variants remained bounded: no-`@`, many-`@`, many-dot, malformed quote, nested HTML, nested percent, EAI private-use, default-ignorable, NFKC expansion and nested-comment variants completed without a ReDoS signal. Maximum observed covered timings were single-digit milliseconds in the direct scanner probe. Scaling log SHA-256: `7a0f1d2bca7b0d2dc4b49fcc9390da212ea37efcb60ade9b5b0c918459de11d9`.

### Metadata/payload ownership and confinement

- Metadata `reproductionEvidence` rejects file URI/traversal strings; opaque engine payloads carrying the same strings pass.
- Only `contractFiles` is resolved. A valid in-repository file/hash passes; hash mismatch, duplicate path, symlink, out-of-repository symlink and missing file fail.
- Radar’s synthetic userinfo canary passes only at the exact Radar corpus path and exact value. The same value in Boussole and an altered Radar value fail.
- Rejections are non-reflective: the sensitive value is not included in the shared gate error; Rust validation issues expose paths/keywords, not rejected values.

Confinement/canary log SHA-256: `b2010065a16cd95e0fcf7045562e84c8ebd31631c89e960939a4cb06932bd19d`.

### HTML5/dependency checks

The scanner’s `entities` dependency is exactly `8.0.0`, direct in `package.json` and `bun.lock`, BSD-2-Clause, with no runtime dependencies, peers or optional dependencies. It is imported only by the quality scanner. Exact-case known names and unknown/mixed-case preservation were independently checked; the known exact HTML5/legacy families used by the prior rejection records were covered by the gate self-tests and independent probes. Dependency manifest SHA-256 is `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`; installed license SHA-256 is `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`.

## Blocking findings

### ENGENV-77A4-BLK-001 — NFKC manufactures ASCII CFWS from non-ASCII separators

`tools/quality/public-source-scanner.ts:286-296` parses both the raw decoded value and an NFKC variant. `skipWhitespaceForward` at `:127-134` intentionally accepts only ASCII CFWS, but NFKC converts non-ASCII separators such as U+00A0 NO-BREAK SPACE, U+2007 FIGURE SPACE, U+202F NARROW NO-BREAK SPACE and U+3000 IDEOGRAPHIC SPACE to ASCII space.

Reproduction outside the gate: the raw form `alice@<non-ASCII-space>example.org` returns no email, while its NFKC form `alice@ example.org` returns an email. Through the complete gate, the value and equivalent property key are rejected as sensitive instead of being preserved as malformed/token-invalid opaque payloads. This directly violates the target requirement to treat every non-ASCII scalar as EAI atext while limiting CFWS to ASCII.

Independent direct-probe SHA-256: `f376362dad83af5c8835d3495867a953f73bcbad87438ce6bfc8a172c8a589ae`; actual-gate matrix SHA-256: `59ca8e29cc5cb14c198375712594753ae059775f8dc40a66fca874226a1b1754`.

### ENGENV-77A4-BLK-002 — malformed/token-invalid local tokens are rejected through valid suffix extraction

`tools/quality/public-source-scanner.ts:137-147` makes `hasInvalidLocalPrefix` reject only a preceding atext character, dot, quote or backslash. `hasValidDotAtomLocal` at `:149-166` can therefore start a new candidate after an invalid token character and classify the suffix as an email.

The actual gate rejects malformed/token-invalid payloads such as a bare C0-separated local token and `ali:ce@example.org`, `ali,ce@example.org` and `ali/ce@example.org`, although the complete local token is not a valid address. The direct probe recorded the same false positives. Quoted C0/DEL controls were preserved, demonstrating that this is specifically the bare-token boundary bug rather than a generic control handling result.

Direct-probe SHA-256: `f376362dad83af5c8835d3495867a953f73bcbad87438ce6bfc8a172c8a589ae`; actual-gate token log SHA-256: `a8da47ee187be5e9fb800d42a0af8854ae4cd27a4da71e65f124da47d606611a`.

### ENGENV-77A4-BLK-003 — parenthesized public email identifiers are erased before parsing

`containsEmailIdentifier` at `tools/quality/public-source-scanner.ts:264-270` calls `removeEmailComments(input)` before scanning. Consequently `(alice@example.org)`, its percent-encoded form and its exact HTML5-parenthesized form are treated as comments and accepted by the actual gate. A public email in prose parentheses is not an RFC comment attached to an address and must remain detectable. The same defect affects property names because the shared gate applies the same scanner to keys.

Actual-gate context log SHA-256: `775b15881afa400a8e124b98bf41ce4a682076afead01f47b6b48af2a819c80d`.

### ENGENV-77A4-BLK-004 — valid email followed by trailing domain punctuation is missed

The target’s `hasValidDnsDomain` at `tools/quality/public-source-scanner.ts:229-255` consumes the trailing dot as part of the DNS candidate and then rejects the empty final label. The actual gate accepts `alice@example.org.` and `alice@example.org` followed by a Unicode full-stop. These are the public-text sentence-punctuation cases covered by the adjacent later remediation history (`b491dbc`); that remediation is not in immutable target `77a4`.

Actual-gate context log SHA-256: `775b15881afa400a8e124b98bf41ce4a682076afead01f47b6b48af2a819c80d`.

## Warnings and non-blocking observations

- The initial Rust WASM path failure was an environment-path mismatch caused by inherited `CARGO_TARGET_DIR`; the exact CI replay passed and is recorded above. It is an evidence caveat, not a source approval.
- The depth probe’s outer shared-gate error is intentionally generic (`not strict UTF-8 JSON`) even when the strict helper internally classifies maximum depth. No sensitive value was reflected; this is a diagnosability limitation only.
- The target does not contain the later sibling branch’s `b491dbc`/`1ffb285` records. That branch is not part of this immutable candidate and was not used as an approval source; its relevant behavior was independently reproduced here.

## Authority, scope and residual risk

The catalog entry remains exactly `candidate` with `pending-independent-agent-review`, required Architecture/Security roles and the specialized dossier path. No engine semantic ownership moved into the shared envelope. The generated TypeScript and Rust projections remain explicitly opaque for recursive payloads and runtime schema validation remains authoritative. The lockfiles show no unreviewed dependency drift; `entities` is quality-only and permissively licensed.

The five corpora and all dedicated checkers are green, but the green suites do not prove the missing/over-restrictive scanner boundaries above. Until the scanner preserves non-ASCII separators and malformed token shapes while still detecting parenthesized and punctuated public identifiers, a candidate corpus can either over-reject legitimate engine payloads or publish a sensitive identifier. Any normative scanner remediation invalidates this pass and requires a fresh candidate-integration pass followed by fresh Architecture and Security role passes. The authority remains candidate and all product/release/capability controls remain closed.

## Exact SHA-256 evidence

The complete relevant source/dossier/fixture/lock/projection hash ledger is `/tmp/engine-envelope-77a4.sha256`, SHA-256 `9907374ceddd833faaad029aa6cb602ea4943c629bf82610e54c5223feb6376d`. Key entries:

- `contracts/catalog.v1.json`: `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json`: `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- `contracts/fixtures/schema-fixtures.v1.json`: `fe1f1a274747a2f7393cb4763e23d71d913bf0be883add6cde2d4501af9d7d28`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts`: `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- `packages/contracts/src/generated/manifest.json`: `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
- `tools/quality/public-source-scanner.ts`: `8f58b2391e035bdbab1e844da654e3e322c534b3cc345fafa5cb3b81fdba6a7f`
- `tools/quality/check-contracts.ts`: `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- `tools/quality/policy-core-raw-inputs.ts`: `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389`
- `package.json`: `5412a80c99ed881be7a8bd8436c027fef3f2fbd5d4244864bd59a2382a0a3284`
- `bun.lock`: `33eb37be9f9938f413dc6d3e39a03a6cc7e4ec8830878b236b1f8d5e32981439`
- `Cargo.lock`: `be5925fce192087993350f87c9d3527f4aaa65e4f81ae1dc64bf1fa77c363a20`
- `docs/reviews/specialized-engine-v2/README.md`: `392e43490218ef02ae5bd1d12b58b8bc9c273f19b8681b7773856ab9f47098d9`
- `docs/reviews/specialized-engine-v2/REMEDIATION.md`: `62cea9ba7803462bdd50718417ba64ea748c9293f91878686bb38bc9555a0ad2`
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-26AC8FE.md`: `97e3ac0a293a98631ab609c89955f394bc36f1d75a1d729845de06c3ab70a1b3`

Commit/tree evidence: HEAD `77a4b1de79c1dbf3b03de1d54f1db5f5f282821c`, tree `2dc392275561206a6c9e79ec8024a38e1052f2f8`, first-parent base `26ac8fe8ade91c67fd09dc60a3ad736d2c0c7aa5`.

## Clean-state proof

Final proof after all ephemeral dependencies, build outputs and probe worktrees were removed:

```text
HEAD=77a4b1de79c1dbf3b03de1d54f1db5f5f282821c
TREE=2dc392275561206a6c9e79ec8024a38e1052f2f8
branch=## HEAD (no branch)
staged=empty
unstaged=empty
git diff --check HEAD^1..HEAD=clean
node_modules=absent
target=absent
tracked files modified by review=none
```

The report itself is written only to `/tmp/engine-envelope-integration-77a4.draft.md`; no repository review file was created.

VERDICT: reject candidate-integration — four independent public-source scanner blockers remain: NFKC-induced non-ASCII CFWS false positives, malformed-token suffix false positives, parenthesized email false negatives and trailing-punctuation email false negatives.
