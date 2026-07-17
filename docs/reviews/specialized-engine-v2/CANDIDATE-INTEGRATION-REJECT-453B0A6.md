# Candidate-integration rejection — 453b0a6

- Verdict: `REJECT candidate-integration`
- Immutable target: `453b0a6e75cf8de2fcd745679768ff62402daaed`
- Review pass: `engine-envelope-semicolon-integration`
- Session: `019f7001-3016-7227-977e-c0aa4ce3ed8e`
- Provider/model: `openai-codex/gpt-5.5` (`xhigh`)
- Raw reviewer-output SHA-256: `72dfd033f884c529973dcb15576417230821a16c630677fc2950f4d70fb19df6`
- Effect: source probes passed, but the pass used unqualified Bun 1.3.11 and cannot approve integration

## Verbatim reviewer output

Read-only candidate-integration review completed. Worktree stayed clean.

Target:
- HEAD verified: `453b0a6e75cf8de2fcd745679768ff62402daaed`
- Parent/base reviewed: `1523bcd19eeb3d83bb0ff92295c5729d8b43adee`
- Diff: 1 commit, 6 files only (`STATUS.md`, specialized-engine dossier records/docs, `tools/quality/check-contracts.ts`)
- Patch SHA-256: `03238b679069e43dcb1bcbf0aa487491eebe8a366b2ce3e2bd2f579fd3bcfc7d`
- `git diff --check`: clean

Findings:
- Effective scanner source remediation is scoped: named entity decode now requires `;`; legacy semicolonless `&amp...;` wrappers before mapped semicolon-terminated entities still collapse.
- No source blocker found in the scanner behavior I probed: prior mixed/named/period/alias/quadratic/semicolonless-amp/quoted/domain-literal bypass families are closed; a4e74a6 semicolonless named-entity false positives are closed.
- All approvals remain stale/non-promotional: dossier status is `candidate-remediation / fresh roles required`; `ae455b9` approvals invalidated; `79d02b6` candidate/architecture approvals are non-citable because Security rejected.
- Catalog/schema/corpora/generated projection are unchanged vs base; sole candidate remains `engine-golden-vectors-v1` with required `architecture` + `security`.
- No role approval, promotion, implementation, runtime, release, infra, or data authorization is implied.

Probes:
- `bun run check:contracts`: passed.
- `bun run check:toolchain`: failed locally: Bun `1.3.11` / `1.3.11+af24e281e`, expected `1.4.0-canary.1+57f349f63`.
- Actual scanner slice was loaded from `tools/quality/check-contracts.ts`, transpiled in memory, no writes.
  - scanner hash: `1c421b1e047ffd2e96012fb000b62d67160f61f2c78fbe4b7ac3deefee06f9f4`
  - HTML5 reference alias comparison: expected `32`, actual `32`, no missing/extra/mismatch; reference hash `0a73b02b447c9c7f57f306aae79624b6ad4784451103f2f6372d56682b9c6cfa`
  - alias direct: `32/32`; legacy amp wrapper: `32/32`; semicolon-required literal checks: `32/32`
  - targeted mixed/period/quoted/domain-literal/unknown/control cases: `42/42`
  - decode literal checks (`&commat`, `&period`, `&at;`, `&copy;`, unknown): `8/8`
- Bounded behavior timings at max length: no-at `0.886ms`, no-dot `0.247ms`, many-at `0.247ms`, many-dot `0.339ms`, quote/no-opener `2.623ms`, backslashes quoted `7.001ms`.

Key hashes:
- `tools/quality/check-contracts.ts`: `1c421b1e047ffd2e96012fb000b62d67160f61f2c78fbe4b7ac3deefee06f9f4`
- `contracts/catalog.v1.json`: `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json`: `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- five golden corpora unchanged: Radar `1e8c0f4…`, Notebook `734eeece…`, Policy v1 `e13033f2…`, Policy v2 `cbb5023c…`, Boussole `f5ac9c7…`
- reject records: AE455 `18c2e8d3…`, 3BAECF8 `9dd66f60…`, 39F776E `6e9dc13e…`, E6DF443 `59607db5…`, 9E74BAB `e27011a3…`, A4E74A6 `b55a0e87…`

REJECT candidate-integration — exact qualified toolchain gate failed in this read-only pass, so protocol-level integration approval cannot be issued
