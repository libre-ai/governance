# Boussole scoring v2 — catalog promotion package

- **Promotion base:** `9b376cf65755f7556866123f9fddf681a709a2f0`
- **Normative reviewed commit:** `e83e142f647ec9ab6478b7c1e9428950ea209561`
- **Scope:** exactly five Boussole v2 authorities, `candidate → locked`
- **Public scoring:** **NO-GO**
- **Product implementation:** **NOT AUTHORIZED**
- **Package state:** approved by the separate
  [`PROMOTION-VERDICT.md`](PROMOTION-VERDICT.md) pass on commit `1a3f37d`
- **Promotion verdict SHA-256:** `4da24f969b9beec8702c9967b173a9d2cbe74abcd58b3fa4bf1921a64c51d1d2`

No normative Boussole authority changes in this package. The only machine-authoritative transition is
its catalog review state. `engine-golden-vectors-v1` remains a separate candidate under the shared
specialized-engine dossier.

## Collected role records

| Role | Verdict | Reviewed commit | Durable record | Record SHA-256 |
| --- | --- | --- | --- | --- |
| Architecture | `approve` | `e83e142` | [`ARCHITECTURE-VERDICT-FINAL.md`](ARCHITECTURE-VERDICT-FINAL.md) | `c5460d61259b1d027d5e1f7e672848645d969af3785ecc903460d9644c72c6eb` |
| Security | `approve-with-minor-reservations` | `e83e142` | [`SECURITY-VERDICT-FINAL.md`](SECURITY-VERDICT-FINAL.md) | `7cacabc74f20176c3727e5eaf33e19bd0d502fc81304d9b61fe7a43bc5532a8e` |
| Methodology | `approve` | `e83e142` | [`METHODOLOGY-VERDICT-FINAL.md`](METHODOLOGY-VERDICT-FINAL.md) | `7cad942bfdf503bf73d0d9ab16855b5cdcf0d3129e1e027a2c110094af234eec` |
| Privacy France/UE | `approve-with-minor-reservations` | `e83e142` | [`PRIVACY-VERDICT-FINAL.md`](PRIVACY-VERDICT-FINAL.md) | `bb5c4eedcfa0fb5548565adca005777cff868d7e51183f28f26cc83a600aa4f4` |

The four passes used distinct review-only sessions, reproduced the current hashes and left the
reviewed tree unchanged. The bounded reservations do not condition the contract verdict: the stale
historical security packet is explicitly marked stale, while any real dataset still requires a
fresh human privacy/legal review bound to its exact digest. Neither reservation authorizes public
scoring.

## Owner control milestone

- **Decision:** `continue`, scoped to this catalog-only Boussole v2 promotion;
- **Durable reference:** `https://github.com/libre-ai/libre-ai/issues/23#issuecomment-5000285161`;
- **UTF-8 body SHA-256:** `7ad78a922abbfbace0282e60d7488342f3fded52a920193a9f07bb31eec0042d`.

The owner milestone excludes an engine, public scoring, a real dataset, personal-data processing,
network/provider/storage/secret capabilities, infrastructure, release and deployment.

## Authorities proposed for promotion

1. `public-vote-dataset-v2`;
2. `boussole-method-v2`;
3. `boussole-response-set-v2`;
4. `local-comparison-v2`;
5. `boussole-scoring-v2`.

No v1 authority changes. Policy v2 and `engine-golden-vectors-v1` remain candidates.

## Frozen evidence hashes

| File | SHA-256 |
| --- | --- |
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` |
| `contracts/schemas/boussole-method.v2.schema.json` | `2595aa22dd994882a5694bf49b350e6fd8a03fbd725416a0a393c97372abd893` |
| `contracts/schemas/public-vote-dataset.v2.schema.json` | `e43b79d3444d3fb8aa785f07c1b8a733e2009803ef29ccd51fdbbb88841419ec` |
| `contracts/schemas/boussole-response-set.v2.schema.json` | `f321841591dc534e0760a98d90688e3f396c64f4f52e0400f06f05a811018b1e` |
| `contracts/schemas/local-comparison.v2.schema.json` | `1b85bf05268124fb40dc2e06c4c780741bc46927f3048ccaa4fac6a203ef741b` |
| `contracts/schemas/engine-golden-vectors.v1.schema.json` | `cf1a61a5f0e6c9d5c35a869adfa2a3d464c2550f28572735934e02a884cec463` |
| `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` | `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335` |
| `contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json` | `267b7144e5c97fd8840dc40c0c87933000696547a959bbd246904e3af53fc8b6` |
| `contracts/wit/boussole-scoring-v2/world.wit` | `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad` |
| `contracts/wit/boussole-scoring-v2/SEMANTICS.md` | `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5` |
| `tools/quality/check-boussole-v2-vectors.ts` | `807505ac20772289035f3b818899b26bcaca97cf39766249bbf41b85fb25757e` |

## Required promotion evidence

A dedicated review-only `promotion-integration` pass must, on the clean immutable promotion commit:

- recompute every hash above and every durable report hash;
- prove the normative diff from `e83e142` is empty;
- verify exactly the five listed catalog entries are `locked`, with no stale review object;
- verify `engine-golden-vectors-v1`, all Policy v2 entries and unrelated authorities are unchanged;
- run the qualified Bun and Rust repository gates;
- confirm public scoring and implementation remain unauthorized.

A blocking/major finding, stale hash, broader status transition or missing owner evidence requires
rejection. Rollback is a revert of the catalog-only promotion commit; it requires no runtime or data
migration.
