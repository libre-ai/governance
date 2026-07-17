# Policy Core v2 — catalog promotion package

- **Promotion base:** `7ef3eb31078e643c291a5da6ffbccd56a1e86999`
- **Normative reviewed commit:** `d47feb96e605263b825f603033e40c3d1b61800c`
- **Scope:** exactly six Policy v2 authorities, `candidate → locked`
- **Implementation / real tenant data:** **NOT AUTHORIZED**
- **Package state:** approved by the separate
  [`PROMOTION-VERDICT.md`](PROMOTION-VERDICT.md) pass on commit `e7bb757`
- **Promotion verdict SHA-256:** `4d57fa3ead78c4a1ce03b855644e2b0e06683ac1edae15462daab51fa70379c4`

No normative Policy authority changes in this package. The only machine-authoritative transition is
its catalog review state. `engine-golden-vectors-v1` remains a separate candidate under the shared
specialized-engine dossier.

## Collected role records

| Role | Verdict | Reviewed commit | Durable record | Record SHA-256 |
| --- | --- | --- | --- | --- |
| Architecture | `APPROVE` | `d47feb9` | [`ARCHITECTURE-VERDICT.md`](ARCHITECTURE-VERDICT.md) | `2677d8fae983c010ed2a088014941627c102fb815642b9a62f28a404746d021a` |
| Security | `APPROVE` | `d47feb9` | [`SECURITY-VERDICT.md`](SECURITY-VERDICT.md) | `9098a409a0fd7027c50038174035a8510ddd850b2f5c466ae768411572c60ff0` |
| Privacy | `APPROVE` | `d47feb9` | [`PRIVACY-VERDICT.md`](PRIVACY-VERDICT.md) | `da21ce6147f0c2c53153f6721e33abccfbb7b1f49890a4459f7d1b1f75d31175` |

The three passes are attributable, role-separated and favorable. Their minor findings are bounded
and non-conditional: exact Policy WIT function-name anti-drift remains a future test hardening; HTTP
error codes must be implemented from a static allowlist; URI sanitation is not network
authorization. Qualified current promotion gates supersede the reviewers’ local unqualified-Bun
environment limitation. No blocking or major finding remains.

## Owner control milestone

- **Decision:** `continue`, scoped to this catalog-only Policy v2 promotion;
- **Durable reference:** `https://github.com/libre-ai/libre-ai/issues/22#issuecomment-5000446945`;
- **UTF-8 body SHA-256:** `62749f1b5325f4b53e1a398357e438695460a9eefdc3a53565d7ad086f8c3d28`.

The owner milestone excludes a Policy engine, automated approval/purchasing/ranking/deployment, real
tenant or personal-data processing, network/provider/storage/secret capabilities, infrastructure,
release and deployment.

## Authorities proposed for promotion

1. `policy-definition-v2`;
2. `policy-need-v2`;
3. `model-snapshot-v2`;
4. `policy-evaluation-v2`;
5. `model-policy-api-v2`;
6. `policy-core-v2`.

Policy v1 remains separately locked and byte-identical. `engine-golden-vectors-v1` remains candidate.

## Frozen evidence hashes

| File | SHA-256 |
| --- | --- |
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` |
| `contracts/schemas/policy-definition.v2.schema.json` | `1fdd2a6bf2d4969b0a0b8e42d85248f583a6e8890f6aa90ca2e10f680fe7c5a9` |
| `contracts/schemas/policy-need.v2.schema.json` | `0d5895d3063b4ca40b9890f6148e08fec97c3be954a9163458a9425cc41308fb` |
| `contracts/schemas/model-snapshot.v2.schema.json` | `4b7e3a839e1182312d51dc4e4ea8f0e0a34f68e4ee08230cc14d9c8fe5677a68` |
| `contracts/schemas/policy-evaluation.v2.schema.json` | `921d1b4a3ed6285a60449b74a8d4f2c2a6a5bb6d42483bfbc7d59e61bde7c21c` |
| `contracts/openapi/model-policy.v2.yaml` | `2a9ea90e912ff44ada0f896f2af8bfce3cfa7ba7a889a04fe919e7dc75f37a82` |
| `contracts/wit/policy-core-v2/world.wit` | `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4` |
| `contracts/wit/policy-core-v2/SEMANTICS.md` | `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc` |
| `contracts/fixtures/policy-core-v2/operators.json` | `cb4c4d1929e01cfc6cd87d5f4386e54b9f3294ef6789c562f556d1b0c5db5bc2` |
| `contracts/fixtures/policy-core-v2/golden.json` | `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad` |
| `contracts/fixtures/policy-core-v2/resource-budgets.v1.json` | `6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77` |
| `contracts/fixtures/policy-core-invalid-json/manifest.json` | `15fc871a4347303c8abf3dad6810c0532d8546b514e3c4a9b4fc81f6c5e4d378` |
| `tools/quality/check-policy-core-v2-vectors.ts` | `2f13011a3c0c755ec42e17a2a8405a2c3ed8282c082fcb4ab9762d57a9dab7f8` |

The raw malformed-input member hashes are individually bound by the manifest and all nine are
recomputed by the qualified TypeScript and Rust gates.

## Required promotion evidence

A dedicated review-only `promotion-integration` pass must, on the clean immutable promotion commit:

- recompute every hash above, every raw manifest member and every durable report hash;
- prove the normative Policy diff from `d47feb9` is empty and Policy v1 is byte-identical;
- verify exactly the six listed catalog entries are `locked`, with no stale review object;
- verify `engine-golden-vectors-v1` and unrelated authorities are unchanged;
- run the qualified Bun and Rust repository gates;
- confirm implementation, real data, transaction authority and capabilities remain unauthorized.

A blocking/major finding, stale hash, broader transition or missing owner evidence requires rejection.
Rollback is a revert of the catalog-only promotion commit; it requires no runtime or data migration.
