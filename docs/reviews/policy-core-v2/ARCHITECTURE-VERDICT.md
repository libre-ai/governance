# Policy Core v2 — ARCHITECTURE verdict record

- **reviewPassId:** `policy-v2-d47feb9-architecture`
- **role:** `architecture`
- **mode:** specialized review-only pass
- **reviewerAgentId:** `pi-policy-architecture-gpt54`
- **reviewerSessionId:** `f2d050ff-b065-42c2-a640-641bdc6b7edb`
- **provider / model:** `openai-codex / gpt-5.4`
- **reviewed commit:** `d47feb96e605263b825f603033e40c3d1b61800c`
- **scope:** Policy v2 architecture only (`docs/reviews/AGENT-REVIEW-PROTOCOL.md`, `docs/reviews/policy-core-v2/README.md`)
- **important:** cette passe seule ne peut ni promouvoir le candidat ni autoriser une implémentation.

## Authority hash table

| Path | SHA-256 |
|---|---|
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
| `contracts/fixtures/policy-core-invalid-json/utf8-bom.bin` | `aa25e978046d680ef8740d837e6de5bc1e2a2dc6089dbda1012544b538d53f65` |
| `contracts/fixtures/policy-core-invalid-json/invalid-utf8.bin` | `a452ad021237e7af393f6432d26969900a9e4047075b776dc8a4383e36ffaffd` |
| `contracts/fixtures/policy-core-invalid-json/duplicate-object-member.bin` | `eef30767818f537ae9974973d0b89e7b5b995cc5d0cf01cc2e304513468a93b9` |
| `contracts/fixtures/policy-core-invalid-json/unpaired-high-surrogate.bin` | `c3c0f6e73919dc685c0a333f2160a12cbc94663790ff525abd109f1ceedcf00b` |
| `contracts/fixtures/policy-core-invalid-json/unpaired-low-surrogate.bin` | `c12f9aef893dd8f4ac8e3df305685220562af5c576b9c145eeac74be2fe53160` |
| `contracts/fixtures/policy-core-invalid-json/invalid-number-leading-zero.bin` | `cc7c115896e02faf43b57f3f5ee079206a25ae9a00ed0170ffb1e329d4e2416a` |
| `contracts/fixtures/policy-core-invalid-json/invalid-number-plus-sign.bin` | `2d13d8d574884095d46cdb8f6b401983fa350a3bfac079c314570ccfd1c95e57` |
| `contracts/fixtures/policy-core-invalid-json/invalid-number-nan.bin` | `159f99e03ec6dfb7edcad87bac613ac97a235493ad8b79b33cfa4002fb4477f8` |
| `contracts/fixtures/policy-core-invalid-json/invalid-number-trailing-decimal.bin` | `07860f78431ccaf010ed6a3ae44ad279807ea0eaff2bd2885ee4e0db21855409` |

## Evidence / commands

```bash
git rev-parse HEAD
git status --short
# => HEAD = d47feb96..., worktree clean

git diff --name-only d47feb96^ d47feb96 -- \
  contracts/schemas/policy-definition.v1.schema.json \
  contracts/schemas/policy-need.v1.schema.json \
  contracts/schemas/model-snapshot.v1.schema.json \
  contracts/schemas/policy-evaluation.v1.schema.json \
  contracts/openapi/model-policy.v1.yaml \
  contracts/wit/policy-core-v1/world.wit \
  contracts/wit/policy-core-v1/SEMANTICS.md
# => NO_V1_POLICY_DIFF

shasum -a 256 <all Policy v2 authorities/vectors listed above>
python3 <manifest-vs-bin sha256 recomputation>
# => all 9 raw-input hashes matched manifest.json

cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked -- --nocapture
# => pass; resolved candidate WIT worlds import-free, one exported interface

cargo test -p libre-ai-contract-types --test policy_core_vectors --locked -- --nocapture
# => 6 passed; Rust recomputed v2 digests/order-stability/error variants/resource ceilings

cargo test -p libre-ai-contract-types --test schema_fixtures --locked -- --nocapture
# => 3 passed; embedded schemas compile and fail closed

/Users/ifi6567/.bun/bin/bun tools/quality/check-policy-core-v2-vectors.ts
# => pass; 20 golden, 28 operator, 9 raw decoder refusals, 10 byte boundaries, depth 64

/Users/ifi6567/.bun/bin/bun -e '<manual recomputation>'
# => fractional-number-jcs digest matched
# => order-independence-a/b digest identical
# => self-approval-refused => approval-invalid with approverId===proposedBy
```

## Assessment

- **WIT / JSON Schema / OpenAPI cohérents** sur la séparation d’approbation humaine, le tenant binding, les faits typés, les URI sources bornées, les URN typés, les verdicts `eligible|ineligible|indeterminate`, les refus fermés et la sortie HTTP redacted.
- **WIT résolu sans import** : confirmé par `wit-parser`; le monde exporte une seule interface `api`. La source `contracts/wit/policy-core-v2/world.wit` expose uniquement `evaluate(...) -> result<list<u8>, error-code>`.
- **Préservation v1 / compatibilité major** : v2 est isolé (`.v2`, `/v2`, `@2.0.0`) et les autorités Policy v1 n’ont pas bougé dans ce commit.
- **Déterminisme** : JCS/RFC 8785, labels de hash, `id`/`digest`, tri des `ruleResults`, pair d’ordre indépendante et cas `fractional-number-jcs` sont recomputés en TS et validés en Rust.
- **Erreurs fermées / précédence** : 6 variantes WIT fermées, corpus de refus complet, précédence `failed > unknown > satisfied` et verdict `failed > unknown(ineligible) > indeterminate > eligible` couvertes.
- **Bornes exactes** : 8 MiB par entrée JSON, `evaluated-at` 20 octets, sortie JCS 2 MiB, profondeur 64, 1 000 règles, 1 000 faits, 100 éléments/set, 1 000 000 évaluations règle-occurrence, 7 comparaisons max par lookup, 256 MiB mémoire composant.
- **Pas de moteur/capacité caché** : pas d’implémentation produit Policy dans `crates/`, `packages/` ou `apps/`; seulement vecteurs/tests/outillage.

## Blocking findings

- Aucun.

## Major findings

- Aucun.

## Minor findings

1. **Le gate Rust WIT n’assert pas encore la surface exacte interne de `policy-core-v2` aussi strictement que Radar v2.**  
   `crates/ecosystem-engine/tests/wit_contracts.rs` vérifie bien zéro import résolu et une seule interface exportée, mais n’assert les noms exacts de fonctions que pour `radar-engine-v2`. Pour ce commit, la lecture directe de `contracts/wit/policy-core-v2/world.wit` confirme que l’API exportée exacte est bien `api.evaluate`; ce point n’est donc pas bloquant, mais l’anti-dérive automatisé reste incomplet.

## Residual risks

- Le **Bun qualifié/pinné** du dépôt n’était pas disponible localement : `/Users/ifi6567/.bun/bin/bun` est en `1.3.11`, alors que `toolchains/bun.json` exige `1.4.0-canary.1+57f349f63`. Les vérifications TS passées ici sont donc **informatives**, pas toolchain-qualified.
- `bun run check:generated-contracts` n’a pas pu être rejoué entièrement dans cet environnement faute de `node_modules/.bin/biome`. Les hashes du `packages/contracts/src/generated/manifest.json` restent cohérents avec les schémas v2, et la génération Rust a bien été exercée par build/test.
- Les plafonds CPU/mémoire sont **pré-implémentation** ; leur qualification sur le composant compilé réel reste un sujet Gate B, pas une preuve runtime à ce commit.

## Final ARCHITECTURE verdict

**APPROVE**

Cette passe architecture seule ne promeut pas le candidat et n’autorise pas l’implémentation ; des passes séparées Security, Privacy, puis promotion/intégration et le jalon explicite du propriétaire restent requis.
