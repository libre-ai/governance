# Privacy review — Policy v2 dossier

**Attribution:** `reviewPassId=policy-v2-d47feb9-privacy`; `reviewerAgentId=pi-policy-privacy-gpt54mini`; `reviewerSessionId=81a33282-9ff0-4f78-8c94-9c8126d16079`; provider=`openai-codex`; model=`gpt-5.4-mini`  
**Reviewed commit:** `d47feb96e605263b825f603033e40c3d1b61800c`  
**Scope:** `docs/reviews/policy-core-v2/README.md`, `contracts/catalog.v1.json`, `contracts/schemas/*policy*v2*`, `contracts/openapi/model-policy.v2.yaml`, `contracts/wit/policy-core-v2/*`, `contracts/fixtures/policy-core-v2/*`, `contracts/fixtures/policy-core-invalid-json/*`

## Authority hash table

| File | SHA-256 | Privacy note |
| --- | --- | --- |
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` | opaque tenant/principal/URN base |
| `contracts/schemas/policy-definition.v2.schema.json` | `1fdd2a6bf2d4969b0a0b8e42d85248f583a6e8890f6aa90ca2e10f680fe7c5a9` | tenant-bound, opaque IDs, sanitized source refs |
| `contracts/schemas/policy-need.v2.schema.json` | `0d5895d3063b4ca40b9890f6148e08fec97c3be954a9163458a9425cc41308fb` | minimized need facts |
| `contracts/schemas/model-snapshot.v2.schema.json` | `4b7e3a839e1182312d51dc4e4ea8f0e0a34f68e4ee08230cc14d9c8fe5677a68` | opaque model IDs, sourced facts |
| `contracts/schemas/policy-evaluation.v2.schema.json` | `921d1b4a3ed6285a60449b74a8d4f2c2a6a5bb6d42483bfbc7d59e61bde7c21c` | minimized output trace only |
| `contracts/openapi/model-policy.v2.yaml` | `2a9ea90e912ff44ada0f896f2af8bfce3cfa7ba7a889a04fe919e7dc75f37a82` | HTTP errors are code + requestId only |
| `contracts/wit/policy-core-v2/world.wit` | `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4` | zero imports, no host capability |
| `contracts/wit/policy-core-v2/SEMANTICS.md` | `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc` | no fact values / reviewer identity in errors |
| `contracts/fixtures/policy-core-v2/operators.json` | `cb4c4d1929e01cfc6cd87d5f4386e54b9f3294ef6789c562f556d1b0c5db5bc2` | machine-token operator corpus |
| `contracts/fixtures/policy-core-v2/golden.json` | `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad` | synthetic, opaque IDs; no PII |
| `contracts/fixtures/policy-core-v2/resource-budgets.v1.json` | `6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77` | bounded-work / bounded-output checks |
| `contracts/fixtures/policy-core-invalid-json/manifest.json` | `15fc871a4347303c8abf3dad6810c0532d8546b514e3c4a9b4fc81f6c5e4d378` | raw decoder refusals only |

## Evidence

- `contracts/catalog.v1.json` marks `policy-core-v2` as `tenant-private` and candidate-only.
- `policy-definition.v2`, `model-snapshot.v2`, `policy-need.v2`, and `policy-evaluation.v2` all carry tenant IDs; `SEMANTICS.md` requires exact tenant equality before evaluation.
- Opaque IDs are bounded by format: `ten_*`, `usr_*`, `svc_*`, `mdl_*`.
- `SEMANTICS.md` explicitly says the evaluator is advisory only and cannot approve, rank suppliers, buy, deploy, or trigger a transaction.
- `SEMANTICS.md` and `model-policy.v2.yaml` keep errors minimal: WIT returns closed enums; HTTP returns only `code` + `requestId`, no free-form message.
- `world.wit` exports one `api` and has zero imports.
- URI scan: 81 URIs in `golden.json`; no query, fragment, userinfo, or percent-encoding found.
- PII scan: no email-address matches in policy fixtures / dossier files.
- Raw decoder fixture hashes matched the manifest exactly.

## Read-only checks

- `bun tools/quality/check-policy-core-v2-vectors.ts` ✅
  - 20 golden cases
  - 28 operator cases
  - 9 raw decoder refusals
  - 10 byte-boundary checks
  - depth 64
  - privacy-minimized sources and principals
  - typed URNs and closed HTTP refusals
- `git status --short` was clean before review.

## Findings

- **Blocking:** none
- **Major:** none
- **Minor:** none

## Residual risks

- `approval.reference` authenticity remains caller responsibility; the evaluator does not authenticate it.
- Future real source citations must preserve the same URI sanitation discipline; the current fixtures use synthetic placeholders.

## PRIVACY verdict

**APPROVE**

This privacy role cannot promote or authorize implementation; that remains a separate control milestone.
