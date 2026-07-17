# Revue Architecture — `engine-golden-vectors-v1` @ `da99d31e36e94c852841310e696d1a4bc9cf9d18`

- `reviewPassId`: `engine-golden-vectors-v1-architecture-da99d31-r1`
- `role`: `architecture`
- `mode`: `specialized-role-review`, strict review-only
- `date`: `2026-07-17T15:03:17Z`
- `provider/model`: `OpenAI via pi/API ; identifiant exact du modèle non exposé par ce harness`
- `session`: `non exposée par ce harness`
- `target`: `da99d31e36e94c852841310e696d1a4bc9cf9d18`
- `base`: `0a265ce15d8871679cc7ca8693ce571432a057fb`
- `remediation base inspected`: `d0c25bcd3988242ac097d02613bf5608669cd50e`
- `authority`: `engine-golden-vectors-v1`, toujours `candidate`, `pending-independent-agent-review`
- `separation`: worktree détaché, HEAD exact vérifié, aucune édition du dépôt, aucun commit/push/commentaire/merge/promotion/owner-control ; ce record est écrit uniquement dans `/tmp/engine-envelope-architecture-da99.draft.md`

## HEAD exact et état propre

- `git rev-parse HEAD` → `da99d31e36e94c852841310e696d1a4bc9cf9d18`
- `git status --short --branch` avant/après → `## HEAD (no branch)`
- état final local : `node_modules` absent, `target` absent
- preuve historique/diff : `/tmp/engine-envelope-da99-history.log` SHA-256 `484dfc60bb6b52d72e12ba2dc7fb66878fe63047bab88f38bbc43c873866e957`

## Surface revue

### Gouvernance

- `AGENTS.md`
- `GOALS.md`
- `STATUS.md`
- `docs/decisions/DECISION-REGISTER.md`
- `docs/adr/0003-wp-g2-s01-contract-amendment.md`
- `prompts/02-foundation-build.md`
- `docs/reviews/AGENT-REVIEW-PROTOCOL.md`

### Dossier `specialized-engine-v2` lu intégralement

- état/remédiation/dépendance :
  - `docs/reviews/specialized-engine-v2/README.md`
  - `docs/reviews/specialized-engine-v2/REMEDIATION.md`
  - `docs/reviews/specialized-engine-v2/DEPENDENCY-QUALIFICATION-ENTITIES.md`
- approbations historiques/stales :
  - `ARCHITECTURE-VERDICT.md`
  - `ARCHITECTURE-VERDICT-FINAL.md`
  - `ARCHITECTURE-VERDICT-79D02.md`
  - `SECURITY-VERDICT.md`
  - `SECURITY-VERDICT-FINAL.md`
  - `SECURITY-VERDICT-79D02.md`
  - `CANDIDATE-INTEGRATION-79D02.md`
- tous les rejets conservés :
  - `CANDIDATE-INTEGRATION-REJECT-AE455.md`
  - `CANDIDATE-INTEGRATION-REJECT-3BAECF8.md`
  - `CANDIDATE-INTEGRATION-REJECT-39F776E.md`
  - `CANDIDATE-INTEGRATION-REJECT-E6DF443.md`
  - `CANDIDATE-INTEGRATION-REJECT-9E74BAB.md`
  - `CANDIDATE-INTEGRATION-REJECT-A4E74A6.md`
  - `CANDIDATE-INTEGRATION-REJECT-453B0A6.md`
  - `CANDIDATE-INTEGRATION-REJECT-1523BCD.md`
  - `CANDIDATE-INTEGRATION-REJECT-26AC8FE.md`
  - `CANDIDATE-INTEGRATION-REJECT-77A4B1D.md`
  - `CANDIDATE-INTEGRATION-REJECT-6EE4627.md`
  - `CANDIDATE-INTEGRATION-REJECT-0A265CE.md`

### Surface contractuelle et qualité inspectée

- autorité partagée :
  - `contracts/catalog.v1.json`
  - `contracts/schemas/engine-golden-vectors.v1.schema.json`
  - `contracts/fixtures/schema-fixtures.v1.json`
- projections/génération TS :
  - `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts`
  - `packages/contracts/src/generated/manifest.json`
  - `packages/contracts/src/registry.ts`
  - `packages/contracts/scripts/generate-types.ts`
- projections/tests Rust :
  - `crates/contract-types/build.rs`
  - `crates/contract-types/src/lib.rs`
  - `crates/contract-types/tests/schema_fixtures.rs`
  - `crates/ecosystem-engine/tests/wit_contracts.rs`
- gate partagé / parseur strict / scanner exporté :
  - `tools/quality/check-contracts.ts`
  - `tools/quality/public-source-scanner.ts`
  - `tools/quality/public-source-scanner.test.ts`
  - `tools/quality/policy-core-raw-inputs.ts`
- cinq corpus publics + fixtures auxiliaires :
  - Radar : `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json`, `security-vectors.v1.json`
  - Notebook : `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`
  - Policy v1 : `contracts/fixtures/policy-core-v1/golden.json`, `operators.json`
  - Policy v2 : `contracts/fixtures/policy-core-v2/golden.json`, `operators.json`, `resource-budgets.v1.json`
  - raw strict decoder manifest : `contracts/fixtures/policy-core-invalid-json/manifest.json`
  - Boussole : `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json`, `security-vectors.v1.json`
- checkers dédiés :
  - `tools/quality/check-radar-v2-vectors.ts`
  - `tools/quality/check-notebook-v2-vectors.ts`
  - `tools/quality/check-notebook-core-v2-candidate.ts`
  - `tools/quality/check-policy-core-vectors.ts`
  - `tools/quality/check-policy-core-v2-vectors.ts`
  - `tools/quality/check-boussole-v2-vectors.ts`
- autorités sémantiques moteurs :
  - `contracts/wit/radar-engine-v2/world.wit`, `PROFILE.md`
  - `contracts/wit/notebook-core-v2/world.wit`, `SEMANTICS.md`
  - `contracts/wit/policy-core-v1/world.wit`, `SEMANTICS.md`
  - `contracts/wit/policy-core-v2/world.wit`, `SEMANTICS.md`
  - `contracts/wit/boussole-scoring-v2/world.wit`, `SEMANTICS.md`
- dépendances/qualif : `package.json`, `bun.lock`, `Cargo.lock`, `rust-toolchain.toml`, `deny.toml`, `node_modules/entities/package.json`, `node_modules/entities/LICENSE`

## Historique et delta inspectés

- `git log --ancestry-path d0c25bcd3988242ac097d02613bf5608669cd50e..HEAD` a couvert la chaîne complète de remédiation jusqu’à `da99d31`
- `git diff --stat 0a265ce15d8871679cc7ca8693ce571432a057fb..HEAD` est borné à 5 fichiers :
  - `STATUS.md`
  - `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-REJECT-0A265CE.md`
  - `docs/reviews/specialized-engine-v2/README.md`
  - `docs/reviews/specialized-engine-v2/REMEDIATION.md`
  - `tools/quality/public-source-scanner.ts`
- aucune modification du schéma partagé, du catalogue, des cinq corpus publics, des projections TS/Rust, des WIT/profils/SEMANTICS moteurs ou des checkers dédiés dans ce delta immédiat

## Vérifications exécutées

### Git / portée

- `git rev-parse HEAD`
- `git status --short --branch`
- `git log --oneline --ancestry-path d0c25bcd3988242ac097d02613bf5608669cd50e..HEAD`
- `git diff --stat 0a265ce15d8871679cc7ca8693ce571432a057fb..HEAD`
- `rg -n "LibreAiSpecializedEngineGoldenVectorIndexV1|engine-golden-vectors\.v1|engine_golden_vectors_v1|public-source-scanner|entities" . -g '!**/node_modules/**' -g '!**/target/**'`
  - résultat : aucun consumer produit/runtime du type généré partagé ; `public-source-scanner.ts` n’est importé que par `check-contracts.ts` et son test ; `entities` est limité au scanner qualité
  - preuve : `/tmp/engine-envelope-da99-scope-search.log` SHA-256 `be9dbe37aa0a3a85af4c4ce17d7a5766729f9ade896bcc87d707b5e5bb8fa79f`

### Gates Bun épinglées

- `bun install --frozen-lockfile` ✅
- `bun run check` ✅
  - `check:toolchain` exact Bun `1.4.0-canary.1+57f349f63`
  - `check:contracts` ✅, y compris le gate partagé + Radar + Notebook + Policy v1 + Policy v2 + Boussole
  - `check:notebook-core-v2` ✅
  - `check:generated-contracts` ✅ `Verified 48 TypeScript contract projections`
  - `check:licenses` ✅ `JavaScript dependency licenses verified: 47`
  - `biome ci .` ✅, `tsc --noEmit` ✅, `bun test` ✅ `227 pass, 0 fail`
- `bun audit` ✅ `No vulnerabilities found`

### Gates Rust épinglées

- `cargo fmt --all --check` ✅
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` ✅
- `cargo test --workspace --all-features` ✅
- `cargo deny check advisories licenses sources` ✅
- `CARGO_TARGET_DIR=/tmp/libre-ai-target-engine-envelope-architecture-da99-wasm cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown` ✅
- `cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- $CARGO_TARGET_DIR/wasm32-unknown-unknown/release/libre_ai_notebook_core.wasm` ✅ → `0 module imports, 0 component imports, 512 MiB memory cap, WIT exports present`

## Probes indépendants

### 1. Probe gate réel sur le scanner / frontière payload-métadonnées

Script hors dépôt : `/tmp/engine-envelope-da99-probe.py` SHA-256 `29483c61c9e7f2495e3d91997dc607556e76aee4df30c9d2c84aa8ceaebe4ac9`

Log : `/tmp/engine-envelope-da99-probe.log` SHA-256 `1f50eab7446dc4996f380bc0c7e75ec813972157e232fbe89783685ef71c1bc3`

Résultats confirmés contre le gate réel `bun tools/quality/check-contracts.ts` dans des copies éphémères :

- **rejetés** comme sensibles :
  - `"alice@example.org"`
  - `contact:"alice@example.org"`
  - `foo"bar" "alice@example.org"`
  - `(alice@example.org)`
  - `alice@example.org.`
  - clé `contact:alice@example.org`
- **préservés** comme payload opaque légitime :
  - `foo"alice@example.org"`
  - `foo"alice@example.org`
  - clé `foo"alice@example.org"`
  - `R&D`
  - `50%`
  - `release@2`
  - `https://example.org/a%2Fb`
  - `../../secrets.txt`
  - `file:///etc/passwd`
  - `unknown:alice@example.org`
- **métadonnées fermées** :
  - `contractFiles` traversal rejeté
  - `reproductionEvidence.contact = alice@example.org` rejeté

### 2. Cohérence d’usage / placement non autoritatif

Le search scope confirme :
- pas de consumer runtime/produit du type TS `LibreAiSpecializedEngineGoldenVectorIndexV1`
- pas d’import du scanner hors `check-contracts.ts` et son test
- `entities` reste un devDependency qualité local, non-transitif en lock, sans voie runtime

## Conclusion architecture

1. **La frontière partagée reste structurelle et de publication, pas sémantique moteur.**
   Le schéma `engine-golden-vectors.v1` borne structure/budgets/métadonnées ; les sémantiques restent dans `PROFILE.md`/`SEMANTICS.md`/WIT et dans chaque checker dédié. Radar, Notebook, Policy v1/v2 et Boussole conservent leur autorité propre ; le gate partagé n’introduit aucun moteur partagé ni override des checkers.

2. **La séparation métadonnées / payload est cohérente.**
   `metadataString`/`metadataValue` ferment les formes sensibles/path-capable ; `payloadValue` reste borné mais opaque. Le probe réel confirme que `R&D`, `50%`, `release@2`, URL encodée, Unicode, `file:///...` et traversals inertes restent représentables comme payload, alors que `reproductionEvidence` sensible et `contractFiles` invalide échouent.

3. **`contractFiles` est la seule surface résolue/exécutable.**
   Le schéma ferme les paths à `contracts/...` ; `check-contracts.ts` ajoute doublons, symlinks, échappement dépôt, type fichier et hash SHA-256. Aucune autre chaîne payload n’acquiert de sémantique chemin/URI/capabilité.

4. **Les préflights et bornes restent déterministes.**
   Le gate partagé applique taille fichier 8 MiB → JSON UTF-8 strict sans BOM/dup/surrogates/non-finite → profondeur 64 / 200000 nœuds / 65536 code points / 4096 items / 512 propriétés / 128 code points par clé → scan public → AJV → résolution `contractFiles`. Les checkers dédiés conservent leurs propres plafonds explicites.

5. **Le parseur strict et le scanner restent qualité-only et non autoritatifs côté runtime.**
   `parseStrictJson` vit dans `tools/quality/policy-core-raw-inputs.ts`. `public-source-scanner.ts` n’est importé que par `check-contracts.ts` et son test. `entities@8.0.0` reste dev-only BSD-2-Clause, sans dépendance runtime ni élargissement de confiance produit.

6. **L’interop TS/Rust reste opaque et fail-closed.**
   `generate-types.ts --check` passe ; le manifeste hash-match le schéma ; la projection TS garde les branches récursives à `unknown`/`Array<unknown>`/`{[key:string]:unknown}` ; la registry TS renvoie `unknown` validé au runtime ; la registry Rust embarque les schémas, compile fail-closed et n’échoe pas les valeurs rejetées.

7. **Compatibilité / versioning / état sont cohérents.**
   Le catalogue garde `engine-golden-vectors-v1` en `candidate`, `major-versioned`, `internal`, review requise `architecture` + `security`. Le delta `0a265ce..da99d31` n’élargit pas le scope : scanner + dossier בלבד, aucun changement de schéma/catalogue/corpus/projection/WIT.

8. **L’autorité checker dédiée est préservée.**
   Radar valide ses `contractFiles`, limites, refus et digests ; Notebook valide ses AAD/digests/mutations et Gate A ; Policy v1/v2 valide digests/ordre/raw inputs/budgets ; Boussole revalide le vecteur partagé avec `schemaVersion = libre-ai.engine-golden-vectors.v1`, `world = boussole-scoring-v2`, puis ses sémantiques et refus propres.

9. **Aucune extension de scope/capabilité n’est introduite.**
   Pas de moteur produit, pas de scoring public, pas de données réelles, pas de résolveur runtime, pas de réseau/stockage/horloge/aléa, pas de release/infra/déploiement. Les mondes WIT candidats restent sans imports ; le binaire WASM Notebook vérifié reste sans imports module/component.

## Findings

### Blocking

- aucun

### Major

- aucun

### Minor

- `ARCH-DA99-MIN-001` — **le dossier/état in-tree n’est pas encore complètement rattrapé par le merge courant.** `docs/reviews/specialized-engine-v2/README.md` et `STATUS.md` décrivent encore la remédiation de frontière de citation comme nécessitant une future candidate-integration / fresh candidate-integration. Or `da99d31` est déjà le merge immuable de cette remédiation. Si l’approbation candidate-integration exacte mentionnée dans la demande existe hors dépôt, elle n’est pas encore liée durablement dans le dossier lu ici. C’est une réserve d’audit/documentation, pas un défaut de frontière ni d’autorité checker.

## Risques résiduels

- `engine-golden-vectors-v1` reste **candidate** ; cette revue n’autorise ni promotion `candidate -> locked`, ni implémentation moteur, ni runtime conformance, ni release.
- La réserve d’audit ci-dessus doit être fermée avant une future passe de promotion : le record candidate-integration exact `da99d31` doit être lié de manière durable (repo ou URL immuable + hash) et le wording `README.md`/`STATUS.md` doit être remis en cohérence avec l’état courant.
- `entities@8.0.0` est techniquement qualifié et limité au gate qualité, mais son acceptation owner explicite reste requise avant toute promotion future.
- Les projections TS/Rust sont volontairement opaques ; si un futur consumer produit voulait les utiliser comme frontière d’entrée, une nouvelle revue d’architecture et de sécurité serait requise.

## Non-autorisation explicite

Cette passe **n’autorise pas** :

- implémentation d’un moteur produit Radar/Notebook/Policy/Boussole contre cette autorité ;
- scoring public ;
- traitement de données personnelles, tenant ou réelles ;
- capability fichier/réseau/stockage/horloge/aléa/secrets ;
- release, infrastructure, Clever Cloud ou déploiement ;
- promotion catalogue `candidate -> locked` ;
- contrôle owner.

## SHA-256 evidence

### Ledger complet

- `/tmp/engine-envelope-architecture-da99.sha256` — `0f731d3d4527266e9b08fff6660191888c0ce87f3a899e371d89be1cb26eacfa`

### Hashes clés

- gouvernance :
  - `GOALS.md` `39f292711559a2ea722dccbd2dce098afd5e897b58a07d3cf4095aacc1521a7b`
  - `STATUS.md` `323b76adda0040314d4444071b0c791eb215d94f0957450717d962b74e48a250`
  - `docs/decisions/DECISION-REGISTER.md` `fa6378c96e52d22402c302abc80aeb7e822c12b68ec6ce7be686b928759379d0`
  - `docs/adr/0003-wp-g2-s01-contract-amendment.md` `bf49949a1fcc3943076fbd57495b8766bbdff430785fa503cd03f28308eba735`
  - `prompts/02-foundation-build.md` `4f1f0c20af5365d96b921fcfdd244066b6d5de6edaaabf4dd12ea0d0fcdbd73e`
  - `docs/reviews/AGENT-REVIEW-PROTOCOL.md` `9e91b78c30a2ba82d20a7fe78d8bf4a2878ffa8c28046e3a44748d29b448a43f`
- dossier courant :
  - `README.md` `541aa29b64c053cd14e4b56f54da9bf9a3334aa674eb6ea564cb5dca04f4f9f6`
  - `REMEDIATION.md` `8f7cc89949223f0d4cc0cb51cdd45fd9ddc5f8b2c7dc26a3ba382123220f13f6`
  - `DEPENDENCY-QUALIFICATION-ENTITIES.md` `6b01ff7a92f21593f2ca76f0ee3c12e9c8a525adbc07e1d373273140f534a7ae`
  - `CANDIDATE-INTEGRATION-REJECT-0A265CE.md` `50e47d7f2eb6134f007dbf5fcf0329e874841747200095d698ab201365c1b5c2`
- autorité partagée :
  - `contracts/catalog.v1.json` `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
  - `contracts/schemas/engine-golden-vectors.v1.schema.json` `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
  - `contracts/fixtures/schema-fixtures.v1.json` `fe1f1a274747a2f7393cb4763e23d71d913bf0be883add6cde2d4501af9d7d28`
- projections :
  - `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
  - `packages/contracts/src/generated/manifest.json` `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
  - `packages/contracts/src/registry.ts` `42be1d3d1fab23d814ef0accf563f4bc9c1ae94eb992b919dceabf81d17a47bd`
  - `packages/contracts/scripts/generate-types.ts` `668b7a3c6e6d11dc3751270a82b7f29cbd382deaabc44e43db3cc939d4c1ae6d`
  - `crates/contract-types/build.rs` `6fc8104c990c4b48fe0292af2f9b7f5bd500e4d403dfa322347198bc10779ce6`
  - `crates/contract-types/src/lib.rs` `a8008c6914e94c78fdfaabc6e366e50320ca2a17f8978ce5652716adfe111eec`
  - `crates/contract-types/tests/schema_fixtures.rs` `f9d1ba8d781f3c94383c61df78966ce07de0a89cc49ec84c31a080e2cf69f4e2`
  - `crates/ecosystem-engine/tests/wit_contracts.rs` `fb9b324c6dd8dbdd03d8696dcabe2b573033b79d8939c56544265aae697ceb0e`
- gate/scanner/checkers :
  - `tools/quality/check-contracts.ts` `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
  - `tools/quality/public-source-scanner.ts` `af6231297f9758b2dc6b28f49e18d3a956c7af56afcf6e7faf0c8b8e67d11ca9`
  - `tools/quality/public-source-scanner.test.ts` `fddb23f0d3510332a9fac9abbb2f5a87eab8a308fbed9105f6da1f5b7cf2b658`
  - `tools/quality/policy-core-raw-inputs.ts` `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389`
  - `tools/quality/check-radar-v2-vectors.ts` `beca199ab0bb55bf482b23bfa05fea36f71eba4768547f185de55f8165f4ff11`
  - `tools/quality/check-notebook-v2-vectors.ts` `e7dc3113e2374e396de5f12743c41dafe27b17b6d5caad59a7abbc27f7e03299`
  - `tools/quality/check-notebook-core-v2-candidate.ts` `0c74c6539a0cdae9608e2d6cd82da62712af6226de3b79d22396d4b001b95c6f`
  - `tools/quality/check-policy-core-vectors.ts` `1b1d738787fde41e33b7a0981cbd5f76597c002314067202f2665c2f07ac380f`
  - `tools/quality/check-policy-core-v2-vectors.ts` `2f13011a3c0c755ec42e17a2a8405a2c3ed8282c082fcb4ab9762d57a9dab7f8`
  - `tools/quality/check-boussole-v2-vectors.ts` `7dece6aea797d2d8751e774fea3ab6ce60ef85e4ca145f3ec897db210c370ea0`
- cinq corpus publics :
  - Radar `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`
  - Notebook `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`
  - Policy v1 `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`
  - Policy v2 `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`
  - Boussole `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`
- autorités sémantiques :
  - Radar world/profile `0fbb69be39f265e44feb77ce054fcece052cff38ff0eacd3353f9f8d50bd8073`, `41de764dafb0e0778c7f7a338400b587ad980669879ff51bf5afe6514f3a434c`
  - Notebook world/semantics `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295`, `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b`
  - Policy v1 world/semantics `1414e64f434ce72bd7d1bf9e182951c25b6b493c2f146054d7e40eaffcb4f21d`, `ce92a54fe1c94bcf6dfbe0356d57fbfa7b132fec4156d404b6ccb986a4220788`
  - Policy v2 world/semantics `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4`, `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc`
  - Boussole world/semantics `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad`, `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5`
- dépendance qualité :
  - `package.json` `5412a80c99ed881be7a8bd8436c027fef3f2fbd5d4244864bd59a2382a0a3284`
  - `bun.lock` `33eb37be9f9938f413dc6d3e39a03a6cc7e4ec8830878b236b1f8d5e32981439`
  - `node_modules/entities/package.json` `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`
  - `node_modules/entities/LICENSE` `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`
  - `Cargo.lock` `be5925fce192087993350f87c9d3527f4aaa65e4f81ae1dc64bf1fa77c363a20`
  - `rust-toolchain.toml` `eb8ed53423a7d9d3e3b3fc0367ee89426b4b9385114465919926b2829bfe7ecd`
  - `deny.toml` `0564393e86925b7978690cfa2ec0eb19c331673c23855349f152a7f53226a195`

## Verdict

VERDICT: approve-with-minor-reservations architecture — la frontière partagée reste un contrat structurel/publication borné, les sémantiques et checkers moteurs gardent leur autorité, la remédiation `da99d31` ferme bien la fausse détection des guillemets internes sans élargir le scope ni les capacités, mais le dossier/STATUS in-tree doit encore être remis en cohérence et l’évidence candidate-integration exacte du SHA courant doit être liée durablement avant toute future promotion.