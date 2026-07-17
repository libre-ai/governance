# Candidate-integration review — engine-golden-vectors-v1

- reviewPassId: `engine-golden-vectors-v1-candidate-integration-26ac-r1`
- mode: `candidate-integration`, dedicated review-only pass; not Architecture, Security or promotion
- date: `2026-07-17T13:03:45Z`
- provider/model: OpenAI API / exact model identifier not exposed by this harness
- agent/session: coding agent / session identifier not exposed
- immutable target: `26ac8fe8ade91c67fd09dc60a3ad736d2c0c7aa5`
- target tree: `cbca7c51ce20b101183eb463f9b34205e984e863`
- integration base (first parent): `d37f04729cc91249c22f98d7f072ce0f268c116f`
- remediation base: `1523bcd19eeb3d83bb0ff92295c5729d8b43adee`
- other target parent: `d53b9a73898b155336e38155e62924419021ac0f`
- authority observed: `engine-golden-vectors-v1` is still `candidate`, `pending-independent-agent-review`, with `architecture` and `security` required.

## Authority boundary

This is a rejection of candidate integration only. It grants no Architecture or Security role approval, no catalog promotion, owner milestone, implementation, engine, public scoring, real-data or tenant processing, capability, release, infrastructure, Clever Cloud configuration or deployment.

## Scope and history inspected

Read governance (`AGENTS.md`, goals/status, decision register, G2 prompt, ADR-0003 and review protocol), the complete `specialized-engine-v2` dossier and all historical rejection/approval records. The full remediation ancestry from `79d02b6` to the target was inspected, including mixed/named HTML, semicolon, quoted, RFC/EAI/IDN/CFWS and resource findings.

Read and cross-checked the shared schema/catalog/fixtures, generated TypeScript and Rust boundaries, strict JSON helper, shared gate, scanner/module/tests, all five complete public synthetic corpora, the Radar/Notebook/Policy v1/Policy v2/Boussole dedicated checkers, WIT/profile/semantics boundaries, package/lock metadata and Rust fixture/projection tests.

The target’s first-parent delta is limited to the scanner remediation, shared-gate wiring, `entities`, dossier/status records and the preserved `1523bcd` rejection. It does not modify the catalog status, schema bytes, five corpus bytes, generated projections, WIT/profile semantics or dedicated checker authority.

## Checks reproduced

### Toolchain and CI-equivalent gates

- Exact Bun revision: `1.4.0-canary.1+57f349f63`.
- `bun install --frozen-lockfile`, `bun run check`, and `bun audit` passed. `check` includes contracts and all dedicated checkers, generated projections, licence gate, Biome, TypeScript and `190 pass, 0 fail` Bun tests.
- Rust 1.97.0: `cargo fmt --all --check`, `cargo clippy --workspace --all-targets --all-features -- -D warnings`, `cargo test --workspace --all-features`, and `cargo deny check advisories licenses sources` passed.
- Notebook WASM was rebuilt with the CI environment semantics (`CARGO_TARGET_DIR` unset): 0 module/component imports, 512 MiB cap and WIT exports verified; independent rebuild was byte-identical, SHA-256 `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`.
- The first literal WASM path invocation found no artifact because this harness inherited `CARGO_TARGET_DIR=/tmp/libre-ai-target-engine-envelope-integration-26ac`; that red environment result is retained in the Rust transcript and was replayed successfully with the CI’s unset variable. It is not the rejection cause.

### Actual shared-gate probes (ephemeral copies only)

- 27 mutations ran against the real `tools/quality/check-contracts.ts`, not a unit-test surrogate. They confirmed size → strict UTF-8/JSON/depth → node/string/container/key bounds → scanner → AJV → `contractFiles` order. BOM, invalid UTF-8, duplicate member, unpaired surrogate, non-finite number and excessive depth fail before scanning; bounds fail before scanner; sensitive content fails before AJV. Errors did not reflect injected sensitive content.
- The same gate rejected 8 MiB excess, 65,537 code points, 4,097 array items, 513 object keys, 129-code-point property names and 200,001 nodes.
- Resolver probes confirmed `contractFiles` alone is resolved: valid hash passed; traversal, URI, hash mismatch, duplicate and symlink forms failed. File/URI/traversal-looking payloads remained inert. The Radar userinfo allowlist was exact-value and exact-file scoped: the value in Boussole and the altered Radar canary both failed.
- A 54-case value/key matrix against the actual gate rejected 16 protected email forms in both positions: direct, percent, `%u`, numeric/named/nested/mixed HTML5, quoted/escaped, Unicode HTML5, emoji EAI, nested comments/CFWS, combining-IDNA, punycode and IPv4/IPv6 literals. It preserved 14 required non-email controls: malformed dot-atoms, >64-octet local part, quote prefix/suffix, invalid domains, mixed-case unknown alias, `R&D`, `release@2`, encoded URL, Unicode prose and inert path.
- Maximum scanner probes showed no observed ReDoS in the covered families: no-`@` 1.45 ms, many-`@` 5.03 ms, dotted failure 1.49 ms, nested HTML 2.71 ms, malformed quote 1.26 ms; NFKC expansion case was rejected at 12.73 ms.

### Dependency, boundary and authority checks

- `entities` is exactly `8.0.0` in `package.json` and `bun.lock`; its lock tuple is direct with `{}` dependencies. Installed package metadata is BSD-2-Clause and reports no dependencies, peers or optional dependencies. It is imported only by the quality-only public-source scanner; no runtime/network trust expansion was found.
- Schema → generated declaration manifest hash matches. Generated TS remains opaque/non-authoritative; Rust schema fixture and public projection tests pass.
- The five current public corpora pass the shared gate and all dedicated checkers. Their sole sensitive-looking committed value remains Radar’s exact synthetic refusal canary.
- Dossier rejection records for AE455, 3BAECF8, 39F776E, E6DF443, 9E74BAB, A4E74A6, 453B0A6 and 1523BCD are present and truthfully treated as stale/history. No engine semantic override or scope expansion was found.

## Blocking finding

### ENGENV-26AC-BLK-001 — valid RFC 6532 EAI local-parts bypass values and keys

`tools/quality/public-source-scanner.ts:9,80-85` limits non-ASCII `atext` to `/^[^\p{C}\p{Z}]$/u`; `:35,50` also removes default-ignorable code points before parsing. RFC 6532 extends `atext` with `UTF8-non-ascii` (`UTF8-2 / UTF8-3 / UTF8-4`), not only Unicode letters/symbols. Consequently valid non-ASCII local-part scalars in categories excluded by the implementation are missed, and a local part consisting solely of a default-ignorable character is erased before the parser sees it.

Reproduced through the complete gate in both a payload value and a payload property key; each returned `0` and `Contracts verified`:

- `U+E000@example.org` (private-use UTF-8 scalar);
- `U+0080@example.org` (UTF8-2 scalar);
- `U+200B@example.org` (default-ignorable UTF8-3 scalar);
- `&ZeroWidthSpace;&commat;example&period;org` (exact HTML5 named form that decodes to the preceding valid EAI shape).

The matrix contains 8 successful bypasses (four forms × value/key). This is a public-source privacy false negative on the explicitly required RFC6532/EAI, full-HTML5 and default-ignorable surface. Green unit/CI results do not cover it. It blocks candidate integration.

## Other observations

No additional blocking defect was established in the exercised preflight ordering, strict decoding, covered RFC/IDN/literal forms, non-email preservation, resolver confinement, Radar canary scope, generated hashes, dependency pin/licence or authority state. The inherited Rust target-directory path issue is a documented non-blocking environment caveat with a successful exact-CI replay.

## SHA-256 evidence

Complete source, dossier, schema/catalog, projections, strict helper, all five corpora, WIT/profile, dedicated checker, lock and ephemeral evidence ledger:

- `/tmp/engine-envelope-integration-26ac.evidence.sha256` — `6c0a00e24de5bc97a87605c09ffb7c93c965dd291724bc6d5d8f08f8d013ffa5`
- shared catalog/schema/generated/checker/scanner: `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`, `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`, `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`, `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`, `003089f1e9382ed7dd344512c0a0e88396d76959da7bf97dd8be1201a8933bae`.
- public corpora (Radar, Notebook, Policy v1, Policy v2, Boussole): `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`, `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`, `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`, `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`, `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`.
- `bun.lock` / `package.json` / entities package metadata / licence: `33eb37be9f9938f413dc6d3e39a03a6cc7e4ec8830878b236b1f8d5e32981439`, `5412a80c99ed881be7a8bd8436c027fef3f2fbd5d4244864bd59a2382a0a3284`, `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`, `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`.
- Bun CI log / Rust original log / Rust CI-environment replay: `b99c1c733718e334e635391f8622f0c148b4c46ca45720940fe96a3e9389dc9d`, `06c944587e82cade9956ed2d3cdc0fff22195d4b5961a2389932c214f7901954`, `12774231a5e0f9ae23a127b353d99af25c4be44ef84fcc592f6e8eef28e6a09d`.
- actual-gate probe and matrix logs: `183cff66f18b797e00c1f63144b7a8e0fa4166e0354fe797b2f441fc06694fde`, `c56cdc03a6be6c405ddfc8a9f50afc761f3bd7606df67b6095b7c37374c8da0f`.

## Residual risks and required next evidence

The scanner still allows a private EAI identifier to enter a public corpus in a value or key. A remediation must parse RFC 6532 `UTF8-non-ascii` without category narrowing, while separately handling default-ignorables so normalization cannot erase the sole local-part marker. It must add bounded actual-gate regressions for the four reproduced forms and keep the non-email controls intact. Any normative scanner change makes this review stale and requires a new candidate-integration pass, then fresh Architecture and Security role passes. The authority remains candidate regardless.

## Clean-state proof

After removing review-installed ignored dependencies/artifacts:

- HEAD/tree: `26ac8fe8ade91c67fd09dc60a3ad736d2c0c7aa5` / `cbca7c51ce20b101183eb463f9b34205e984e863`
- detached branch; porcelain status empty; staged and unstaged diffs empty.
- `node_modules` and repository `target` absent/restored.
- proof: `/tmp/engine-envelope-integration-26ac.clean-state.log` — `5220e373f104551421f564691039ce4b997cf67134b40ca7d613cb178132857e`.

VERDICT: reject candidate-integration — RFC 6532 EAI local-parts using private-use, C1 or default-ignorable UTF-8 scalars still bypass the complete public-source gate in payload values and property keys.
