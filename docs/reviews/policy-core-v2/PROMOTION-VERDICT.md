# PROMOTION-INTEGRATION review — Policy Core v2

- **reviewPassId:** `policy-v2-promotion-integration-e7bb757`
- **reviewerAgentId:** `pi-policy-promotion-integrator-gpt54`
- **reviewerSessionId:** `b4859559-5d87-483e-a88e-5a3de34f27d0`
- **provider / model:** `openai-codex / gpt-5.4`
- **mode:** passe indépendante, dédiée, lecture seule, distincte des rôles spécialisés
- **promotion commit:** `e7bb757498a67bfab0647a66df1105504c3eb231`
- **promotion base:** `7ef3eb31078e643c291a5da6ffbccd56a1e86999`
- **normative reviewed commit:** `d47feb96e605263b825f603033e40c3d1b61800c`

Travail vérifié sur `HEAD=e7bb757498a67bfab0647a66df1105504c3eb231`, worktree propre avant/après revue.

## Scope

Cette passe couvre **uniquement** la promotion catalogue Policy v2 de `candidate` vers `locked` pour ces six IDs :

1. `policy-definition-v2`
2. `policy-need-v2`
3. `model-snapshot-v2`
4. `policy-evaluation-v2`
5. `model-policy-api-v2`
6. `policy-core-v2`

Elle **n’autorise pas** : moteur Policy, approbation/achat/classement/déploiement automatiques, données tenant/personnelles réelles, capacités réseau/provider/stockage/secret, release ou déploiement.

## Rôles spécialisés vérifiés

Les trois rapports spécialisés sont attribuables, favorables sur `d47feb96e605263b825f603033e40c3d1b61800c`, sans finding blocking/major, et non conditionnels au sens du protocole.

| Rôle | reviewPassId | Attributs | SHA-256 rapport | Mineurs/résiduels bornés |
| --- | --- | --- | --- | --- |
| Architecture | `policy-v2-d47feb9-architecture` | `pi-policy-architecture-gpt54` / `f2d050ff-b065-42c2-a640-641bdc6b7edb` | `2677d8fae983c010ed2a088014941627c102fb815642b9a62f28a404746d021a` | 1 mineur: anti-drift WIT exact non encore automatisé ; résiduel Bun non qualifié **levé ici** par gates Bun pinnées rejouées vertes |
| Security | `policy-v2-d47feb9-security` | `pi-policy-security-gpt55` / `3bcec2e0-d6cf-474a-bb79-0f939e01a4fb` | `9098a409a0fd7027c50038174035a8510ddd850b2f5c466ae768411572c60ff0` | 2 mineurs: codes HTTP à implémenter via allowlist statique ; regex URI non assimilable à une autorisation SSRF |
| Privacy | `policy-v2-d47feb9-privacy` | `pi-policy-privacy-gpt54mini` / `81a33282-9ff0-4f78-8c94-9c8126d16079` | `da21ce6147f0c2c53153f6721e33abccfbb7b1f49890a4459f7d1b1f75d31175` | aucun mineur ; résiduel normal sur authenticité externe de `approval.reference` |

Les SHA des trois rapports correspondent aux valeurs enregistrées dans `docs/reviews/policy-core-v2/README.md` et `docs/reviews/policy-core-v2/PROMOTION-PACKAGE.md`.

## Owner control milestone

- **owner:** `constantin-jais`
- **issue comment:** `https://github.com/libre-ai/libre-ai/issues/22#issuecomment-5000446945`
- **UTF-8 body SHA-256:** `62749f1b5325f4b53e1a398357e438695460a9eefdc3a53565d7ad086f8c3d28`

Le corps GitHub récupéré via API publique matche exactement ce SHA et borne bien la portée aux **six IDs ci-dessus**. Le commentaire exclut explicitement moteur Policy, approbation/achat/classement/déploiement automatiques, données réelles, capacités, infra, release et déploiement.

## Diff / états catalogue

- `git diff --name-only 7ef3eb3..e7bb757` → **5 fichiers seulement** :
  - `STATUS.md`
  - `contracts/CATALOG.md`
  - `contracts/catalog.v1.json`
  - `docs/reviews/policy-core-v2/PROMOTION-PACKAGE.md`
  - `docs/reviews/policy-core-v2/README.md`

- `contracts/catalog.v1.json` :
  - **exactement 6 IDs changés**, tous `candidate -> locked`
  - pour chacun, l’objet `review` a été retiré
  - aucun autre ID catalogue modifié
  - `engine-golden-vectors-v1` reste `candidate`

- candidats restants au commit promu :
  - `engine-golden-vectors-v1` **uniquement**

## Zéro drift normatif

Vérifications indépendantes :

- `git diff --name-only d47feb9..e7bb757 -- <toutes autorités/vecteurs/profile Policy v2 + checker v2>` → **vide**
- `git diff --name-only 7ef3eb3..e7bb757 -- <autorités Policy v1>` → **vide**
- `git diff --name-only d47feb9..e7bb757 -- <autorités Policy v1>` → **vide**

Conclusion :

- **zéro drift normatif Policy v2** depuis `d47`
- **Policy v1 byte-identical**

## Hashes vérifiés

### Dossier durable

- `docs/reviews/policy-core-v2/PROMOTION-PACKAGE.md` → `659569c115b5e3d208a1364cf47dd766581ed6524461b626dd11b9eec4d23e9d`
- `docs/reviews/policy-core-v2/README.md` → `59092ae7b99ca25dc4b0e65e85ecd277b87e9d7003e5241f300c3c88f5d837c1`

### Authorities / profile / vectors / checker

- `contracts/schemas/common.v1.schema.json` → `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396`
- `contracts/schemas/policy-definition.v2.schema.json` → `1fdd2a6bf2d4969b0a0b8e42d85248f583a6e8890f6aa90ca2e10f680fe7c5a9`
- `contracts/schemas/policy-need.v2.schema.json` → `0d5895d3063b4ca40b9890f6148e08fec97c3be954a9163458a9425cc41308fb`
- `contracts/schemas/model-snapshot.v2.schema.json` → `4b7e3a839e1182312d51dc4e4ea8f0e0a34f68e4ee08230cc14d9c8fe5677a68`
- `contracts/schemas/policy-evaluation.v2.schema.json` → `921d1b4a3ed6285a60449b74a8d4f2c2a6a5bb6d42483bfbc7d59e61bde7c21c`
- `contracts/openapi/model-policy.v2.yaml` → `2a9ea90e912ff44ada0f896f2af8bfce3cfa7ba7a889a04fe919e7dc75f37a82`
- `contracts/wit/policy-core-v2/world.wit` → `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4`
- `contracts/wit/policy-core-v2/SEMANTICS.md` → `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc`
- `contracts/fixtures/policy-core-v2/operators.json` → `cb4c4d1929e01cfc6cd87d5f4386e54b9f3294ef6789c562f556d1b0c5db5bc2`
- `contracts/fixtures/policy-core-v2/golden.json` → `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`
- `contracts/fixtures/policy-core-v2/resource-budgets.v1.json` → `6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77`
- `contracts/fixtures/policy-core-invalid-json/manifest.json` → `15fc871a4347303c8abf3dad6810c0532d8546b514e3c4a9b4fc81f6c5e4d378`
- `tools/quality/check-policy-core-v2-vectors.ts` → `2f13011a3c0c755ec42e17a2a8405a2c3ed8282c082fcb4ab9762d57a9dab7f8`

### Raw manifest members

- `utf8-bom.bin` → `aa25e978046d680ef8740d837e6de5bc1e2a2dc6089dbda1012544b538d53f65`
- `invalid-utf8.bin` → `a452ad021237e7af393f6432d26969900a9e4047075b776dc8a4383e36ffaffd`
- `duplicate-object-member.bin` → `eef30767818f537ae9974973d0b89e7b5b995cc5d0cf01cc2e304513468a93b9`
- `unpaired-high-surrogate.bin` → `c3c0f6e73919dc685c0a333f2160a12cbc94663790ff525abd109f1ceedcf00b`
- `unpaired-low-surrogate.bin` → `c12f9aef893dd8f4ac8e3df305685220562af5c576b9c145eeac74be2fe53160`
- `invalid-number-leading-zero.bin` → `cc7c115896e02faf43b57f3f5ee079206a25ae9a00ed0170ffb1e329d4e2416a`
- `invalid-number-plus-sign.bin` → `2d13d8d574884095d46cdb8f6b401983fa350a3bfac079c314570ccfd1c95e57`
- `invalid-number-nan.bin` → `159f99e03ec6dfb7edcad87bac613ac97a235493ad8b79b33cfa4002fb4477f8`
- `invalid-number-trailing-decimal.bin` → `07860f78431ccaf010ed6a3ae44ad279807ea0eaff2bd2885ee4e0db21855409`

Tous les hashes ci-dessus ont été recomputés et matchent les valeurs gelées / manifest.

## Gates et commandes exécutées

Avec Bun qualifié téléchargé depuis la release épinglée, révision `1.4.0-canary.1+57f349f63` :

- `git rev-parse HEAD`
- `git status --short --branch`
- audit Python local lecture seule :
  - recompute SHA-256 rapports / authorities / profile / vectors / raw members
  - diff catalogue base/norm/head
  - vérification `engine-golden-vectors-v1` seul candidat
  - vérification Policy v2 diff vide et Policy v1 byte-identical
- récupération API GitHub du commentaire owner et recompute du body SHA
- `bun run check` ✅
- `bun run audit` ✅
- `cargo fmt --all --check` ✅
- `cargo clippy --workspace --all-targets -- -D warnings` ✅
- `cargo test --workspace --locked` ✅
- `cargo check --workspace --locked` ✅
- `cargo deny check advisories licenses sources` ✅

Résultats saillants :

- `bun run check` : OK, dont `check:contracts`, `check-policy-core-v2-vectors`, `check:generated-contracts`, `lint`, `typecheck`, `bun test` (**113 tests**)
- Rust workspace : OK (**20 tests**), fmt/clippy/check/deny verts
- `bun audit` : aucune vulnérabilité connue

## Findings

- **Blocking:** none
- **Major:** none
- **Minor (cette passe promotion):** none

Les mineurs spécialisés existants restent **bornés**, **non bloquants**, **non conditionnels** et n’empêchent pas la promotion catalogue.

## Residual / rollback

- Les risques résiduels sont ceux d’implémentation future déjà bornés par les revues spécialisées : anti-drift WIT exact, allowlist statique des codes HTTP, discipline URI côté futurs adapters, authenticité externe de `approval.reference`, preuve runtime CPU/mémoire une fois un composant réel présent.
- Le commit promu ne touche **aucun** fichier `crates/`, `apps/` ou runtime `packages/` : aucune nouvelle capacité moteur, approbation, achat, ranking, déploiement, réseau, stockage, secret ou release n’est introduite.
- **Rollback:** revert de `e7bb757498a67bfab0647a66df1105504c3eb231`; aucune migration runtime ou données.

## Final verdict

**APPROVE**
