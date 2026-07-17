# Security review-only record — engine-golden-vectors-v1 @ 79d02

- `reviewPassId`: `engine-golden-vectors-v1-security-79d02b67-r1`
- `role`: Security reviewer, specialized catalog role, review-only
- `target`: `79d02b67cc961ca68d844d07e7f0f23838ccac1f`
- `history/base inspected`: stale role target `ae455b9875b03b78dbb0a9d1dcfcb9c566754808`; merge parents `2ccb05c5fbf7b9b46750e712e3598fe5fa640a33` and `3baecf8c7fb6ca011945a037831ab50ef0337d39`
- `date`: `2026-07-17T11:48:36Z`
- `provider/model`: OpenAI via pi/API; exact model identifier not exposed
- `worktree separation`: `/private/tmp/libre-ai-engine-envelope-security-79d02`, detached HEAD, clean before and after. No repository edit, commit, push, promotion, runtime, release, infra or deployment action. Probes used temp copies only.

## Scope inspected

Read governance (`AGENTS.md`, `GOALS.md`, `STATUS.md`, decision register, review protocol), the full `docs/reviews/specialized-engine-v2/` dossier including stale `ae455b9` approvals and preserved `CANDIDATE-INTEGRATION-REJECT-AE455.md`, current schema/catalog/schema fixtures/generated TS/Rust projections, all five public synthetic golden corpora, Radar/Boussole security corpora, Policy operator/resource/raw fixtures, the shared checker, strict JSON helper, and all dedicated engine checkers.

History checked: `HEAD` is merge PR #67, `3baecf8` closes the known mixed HTML amp/numeric/named bypass, and `ae455b9..HEAD` changes only review dossier plus `tools/quality/check-contracts.ts` on the reviewed authority surface; schema/catalog/corpora/generated projection bytes remain unchanged from `ae455b9`.

## Gates run

Green:
- `bun --version` → `1.4.0`; `bun run check:toolchain` → verified `1.4.0-canary.1+57f349f63`.
- `bun run check:contracts` → green, including shared contract gate plus Policy v1, Radar v2, Notebook vector structure, Policy v2, Boussole v2.
- `bun run check:notebook-core-v2` → green.
- `cargo test -p libre-ai-contract-types --test schema_fixtures --locked` → 3 passed.
- `cargo test -p libre-ai-contract-types --test policy_core_vectors --locked` → 6 passed.
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked` → 1 passed.
- `cargo test --workspace --locked`, `cargo clippy --workspace --all-targets --locked -- -D warnings`, `cargo fmt --check --all` → green.

Red but not hidden:
- `bun run check:generated-contracts` failed in this detached worktree because `node_modules/.bin/biome` is absent (`ENOENT`). I treat this as a tooling/evidence caveat, not the rejection cause; generated artifacts were hash-checked.

## Independent probes

`python3 /tmp/engine-envelope-adversarial-probe.py` ran the actual checker on a temp copy. Confirmed rejection of the three historical bypasses (`alice&amp;&#64example.org`, `alice&#38;&commat;example.org`, `alice&amp;&#38;&#64example.org`), ampersand dot-atom local part, nested `%`, `%u`, fullwidth percent, default-ignorable/confusable identifiers, credential marker, sensitive key, metadata encoded identifier/file URI/traversal, `contractFiles` hash mismatch/duplicate/traversal/URI/missing/symlink, size/depth/container/key bounds and long HTML chain. Confirmed legitimate opaque payload strings are preserved (`R&D`, `release@2`, literal `&#fragment`, `%not-encoding`, encoded URL, inert `file:///...`/`../../...`). Strict JSON byte probes rejected BOM, invalid UTF-8, duplicate decoded member, unpaired surrogate, invalid number and excessive depth.

Current committed corpora appear synthetic. The only email/userinfo-like hit is the intentionally approved Radar exact canary `https://user:secret@example.org/feed.xml`; no high-confidence credential pattern was found in the five golden corpora or Radar/Boussole security corpora.

## Blocking finding

`ENGSEC-79D02-BLK-001` — quoted RFC local-part email identifiers bypass the shared public-source scanner in both payload values and payload property names.

Evidence against the actual shared gate on a temp copy:

```text
'"alice"@example.org': rc=0; Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations
'%22alice%22%40example.org': rc=0; Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations
'&#34;alice&#34;&#64;example.org': rc=0; Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations
'&quot;alice&quot;&commat;example.org': rc=0; Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations
quoted key rc=0; Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations
```

Root cause: `tools/quality/check-contracts.ts:227` defines `emailIdentifier` for dot-atom local parts only. The scanner is otherwise the sole cross-corpus public-source guard for opaque engine payload strings and keys; the schema intentionally keeps payload semantics opaque. A quoted local-part is a high-confidence RFC-valid email identifier, and the bypass also survives percent and numeric/named HTML encodings. This violates the requested threat scope for RFC local-parts, sensitive keys/values, and Unicode/percent/HTML encoded identifiers. Therefore the security role cannot approve this target even though the previously known mixed amp/numeric/named cases are fixed.

## Relevant SHA-256 hashes

```text
9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35  contracts/catalog.v1.json
2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b  contracts/schemas/engine-golden-vectors.v1.schema.json
fe1f1a274747a2f7393cb4763e23d71d913bf0be883add6cde2d4501af9d7d28  contracts/fixtures/schema-fixtures.v1.json
47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816  packages/contracts/src/generated/engine-golden-vectors.v1.d.ts
c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da  packages/contracts/src/generated/manifest.json
42be1d3d1fab23d814ef0accf563f4bc9c1ae94eb992b919dceabf81d17a47bd  packages/contracts/src/registry.ts
a8008c6914e94c78fdfaabc6e366e50320ca2a17f8978ce5652716adfe111eec  crates/contract-types/src/lib.rs
6fc8104c990c4b48fe0292af2f9b7f5bd500e4d403dfa322347198bc10779ce6  crates/contract-types/build.rs
ad8715810f55531c63e59378decc7e7e644f13b2fd8cc0a50a7a30e96801440a  tools/quality/check-contracts.ts
94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389  tools/quality/policy-core-raw-inputs.ts
beca199ab0bb55bf482b23bfa05fea36f71eba4768547f185de55f8165f4ff11  tools/quality/check-radar-v2-vectors.ts
e7dc3113e2374e396de5f12743c41dafe27b17b6d5caad59a7abbc27f7e03299  tools/quality/check-notebook-v2-vectors.ts
0c74c6539a0cdae9608e2d6cd82da62712af6226de3b79d22396d4b001b95c6f  tools/quality/check-notebook-core-v2-candidate.ts
1b1d738787fde41e33b7a0981cbd5f76597c002314067202f2665c2f07ac380f  tools/quality/check-policy-core-vectors.ts
2f13011a3c0c755ec42e17a2a8405a2c3ed8282c082fcb4ab9762d57a9dab7f8  tools/quality/check-policy-core-v2-vectors.ts
7dece6aea797d2d8751e774fea3ab6ce60ef85e4ca145f3ec897db210c370ea0  tools/quality/check-boussole-v2-vectors.ts
1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365  contracts/fixtures/radar-engine-v2/golden-vectors.v1.json
a092dabcd81afdac4eaeb57aafc4bf9c26cec89aa514f05e48e56bfe1b0804a6  contracts/fixtures/radar-engine-v2/security-vectors.v1.json
734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09  contracts/fixtures/notebook-core-v2/golden-vectors.v1.json
e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4  contracts/fixtures/policy-core-v1/golden.json
6e1abd2c8806c982019a5cfa573d156f0f5be4fd9b11dd188a97e9bfbbebc298  contracts/fixtures/policy-core-v1/operators.json
cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad  contracts/fixtures/policy-core-v2/golden.json
cb4c4d1929e01cfc6cd87d5f4386e54b9f3294ef6789c562f556d1b0c5db5bc2  contracts/fixtures/policy-core-v2/operators.json
6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77  contracts/fixtures/policy-core-v2/resource-budgets.v1.json
15fc871a4347303c8abf3dad6810c0532d8546b514e3c4a9b4fc81f6c5e4d378  contracts/fixtures/policy-core-invalid-json/manifest.json
f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335  contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json
267b7144e5c97fd8840dc40c0c87933000696547a959bbd246904e3af53fc8b6  contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json
```

## Scope guard

This review does not authorize implementation, real data, public scoring, runtime capabilities, deployment, release, infrastructure, or promotion. Fresh Architecture and Security role records remain required after remediation.

VERDICT: reject security — quoted RFC local-part email identifiers bypass the shared public-source scanner in payload values and keys.
