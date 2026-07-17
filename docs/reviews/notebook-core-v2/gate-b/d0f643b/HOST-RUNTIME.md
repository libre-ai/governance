# Gate B — seconde passe host/runtime Notebook Core v2

## Attribution et cible

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-d0f643b-02`
- rôle : `cryptography-runtime`
- mode : passe Gate B `review-only`
- commit revu : `d0f643b21900b7a884707bb42fefc3ff743a223e`
- arbre Git : `0d25f2a059bfeddb866c2f5fb69152bf8e2ed9b5`
- parent moteur mergé : `50b177bc671dc42f1aeb8edf70af5eb7992b7707`
- fournisseur : OpenAI
- harness : pi ; modèle/session non exposés
- date : 2026-07-17

Le worktree est resté propre pendant la passe. Ce verdict couvre le moteur et le harness navigateur de
qualification, jamais un host produit, une UI ou IndexedDB.

## Autorités et artefacts

Les autorités verrouillées sont inchangées :

| Autorité | SHA-256 |
|---|---|
| WIT | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| sémantique | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| Context v2 | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| seal request v2 | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| backup v2 | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| golden | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |

Artefacts reconstruits :

| Artefact | SHA-256 |
|---|---|
| module Rust release | `6ad5148c97ab3d0169a67a499460a1c1db24da694e023fdc1f546f5d61d20427` |
| composant de qualification | `09252bf8dbbbd2c2f7151725dd4066d004000d85f584f9721b38c7daeb281a4a` |
| wrapper Component Model JS | `ced45517e0efb2099fe641c1c9605731f95a8eb2a16836dbd2b2f58b3901b0d1` |
| host JS généré depuis `host.ts` | `4f7fe7e877c86f548473dec7078d39eff21aa47be5755e8ec7296151ebd8e992` |

Deux builds complets du harness ont produit des répertoires byte-identical hors résultats Playwright.
Le scanner Rust accepte le composant effectivement transpillé : zéro import module/composant, mémoire
maximale 512 MiB, unique API `libre-ai:notebook-core/api@2.0.0`.

## Toolchains exécutées

- Rust/Cargo `1.97.0`, cible `wasm32-unknown-unknown` ;
- Bun `1.4.0-canary.1+57f349f63` ;
- Node `26.5.0` pour le worker du transpileur ;
- Playwright `1.61.1` ;
- Chromium/Chrome for Testing `149.0.7827.55`, révision `1228` ;
- Firefox `151.0`, révision `1532` ;
- WebKit `26.5`, révision `2311` ;
- `@bytecodealliance/jco-transpile 0.4.2`, intégrité verrouillée dans `bun.lock`.

Le paquet complet `@bytecodealliance/jco 1.25.2` a été refusé avant commit : sa chaîne inutilisée de
componentization atteignait `decompress <=4.2.1` et l'avis critique `GHSA-mp2f-45pm-3cg9`. Le
transpileur minimal retenu passe `bun audit`; ses licences Apache-2.0 avec exception LLVM sont
qualifiées. Aucun shim WASI n'est généré ni importé.

## Preuves rejouées

```text
bun test tools/qualification/notebook-core-v2/host.test.ts
bun run qualify:notebook-core-v2:host
cargo test --locked -p libre-ai-notebook-core --all-features
cargo clippy --locked -p libre-ai-notebook-core --all-targets --all-features -- -D warnings
bun audit
bun run check:licenses
cargo deny check advisories licenses sources
```

Résultats review-only :

- 6 tests host unitaires verts ;
- 3 exécutions Playwright vertes, une par moteur, séquentielles ;
- golden seal/open et Context byte-identiques via l'ABI composant réelle ;
- 10 mutations backup avec code/message exacts et zéro callback plaintext ;
- 12 mutations Context, 8 cas numériques et 6 frontières ressources rejoués dans chaque navigateur ;
- recovery 30/34 hex et syntaxe interdite routés vers un secret 15/17 ou factice de 15 octets dans le
  composant, donc chemin Argon2id/AES avant `authentication-failed` ;
- 256 échantillons par catégorie : IDs backup/context/bloc, sels, nonces et recovery codes tous de
  forme correcte et sans collision observée, générés par `crypto.getRandomValues` ;
- buffers host de secret, plaintext de seal, plaintext ouvert et Context entrant observés à zéro après
  succès/erreur ; récupération partielle effacée si le CSPRNG injecté échoue ;
- aucune requête non-loopback, aucun message console/pageerror, aucune persistance ou télémétrie ;
- CSP locale fermée, avec seulement `'wasm-unsafe-eval'` nécessaire à `WebAssembly.compile`.

## Réévaluation des sept critères Gate B

| # | Critère | État sur `d0f643b` |
|---:|---|---|
| 1 | WIT/schémas/golden/mutations Rust et navigateur | **satisfait par le harness de qualification** sur trois moteurs |
| 2 | versions/provenance/configuration crypto/JCS | moteur **satisfait** ; transpileur minimal audité |
| 3 | zéroïsation succès/erreur/allocation/panic | succès/erreur host+moteur **partiels** ; OOM/panic/trap toujours absents |
| 4 | aucun secret/plaintext persistance/log/erreur/global/cache | **satisfait dans moteur+harness** ; host produit inexistant |
| 5 | imports vides et exécution sans WASI | **satisfait** statiquement et par exécution navigateur |
| 6 | budgets chaque navigateur/classe d'appareil | **non satisfait** |
| 7 | même erreur/no plaintext | codes, messages et chemin structurel **satisfaits** ; distributions temporelles non mesurées |

## Constats fermés depuis `5395e45`

Le volet qualification de `GB-BLK-001` est fermé : le composant n'est plus seulement inspecté, il est
exécuté par un host fermé dans Chromium, Firefox et WebKit. CSPRNG, conversion recovery, messages,
buffers, absence de réseau et corpus complet sont couverts. Le scan vise également le composant
transpillé réellement servi.

Cette fermeture ne vaut pas approbation du futur host produit : aucune UI, persistance, export de
fichier, nom de téléchargement, suppression ou cycle de worker produit n'existe encore.

## Constats bloquants restants

### GB2-BLK-001 — host produit et archives de test non qualifiés

Le harness est volontairement isolé et sans données utilisateur. Gate B finale doit cibler le host
réel qui possède UI, worker, download, IndexedDB et suppression. De plus, les révisions Playwright
sont connues mais leurs archives navigateur ne sont pas encore épinglées avec SHA-256 dans le dépôt et
le build Node n'est pas un toolchain projet verrouillé.

**Remédiation :** implémenter le host produit derrière feature gate sans données réelles, archiver et
vérifier Node/navigateurs, puis reproduire les preuves sur son commit exact. Nom de fichier neutre,
aucun log/télémétrie, écrasement `try/finally`, CSPRNG et destruction des workers doivent être revus.

### GB2-BLK-002 — OOM, panic/trap et destruction d'instance absents

Aucune injection n'oblige `serde_json`, JCS, Argon2id ou l'allocateur WASM à échouer. Un trap/panic
peut sauter les destructeurs et laisser une mémoire d'instance réutilisable. Le harness n'exécute pas
encore chaque opération dans un worker jetable et ne prouve pas l'absence de sortie/fallback sous
pression mémoire.

**Remédiation :** worker/instance par opération sensible ou politique de destruction après trap,
limites runtime, injection OOM/trap sur les trois fonctions, preuve de zéro plaintext et de mapping
`resource-limit-exceeded`/échec fermé.

### GB2-BLK-003 — p95, pic mémoire et classes d'appareil absents

Les profils natifs historiques respectent les budgets, mais le harness navigateur ne mesure ni les
profils 16 MiB répétés, ni la mémoire linéaire/heap/process, ni une classe d'appareil contrainte. La
comparaison temporelle mauvais secret/tag/digest/secret hors format n'est pas produite.

**Remédiation :** protocole statistique versionné, au moins 20 itérations par profil et navigateur,
p95 seal/open, pic mémoire incluant copies ABI, appareil de référence et classe contrainte, plus
comparaison anti-oracle. Réduire la matrice supportée si un plafond Gate A est dépassé.

## Souveraineté et vie privée

- aucune donnée personnelle : fixtures publiques et chaînes synthétiques uniquement ;
- aucune dépendance SaaS/runtime, stockage ou hyperscaler ;
- outils open source à licences permissives ;
- aucune sortie générée n'est commitée ;
- les navigateurs locaux restent des outils de test à archiver, pas des services de données ;
- audit DORA assuré par commits, hashes, `reviewPassId` et commandes reproductibles.

## Verdict

**REJECT**

Le harness ferme les preuves navigateur et host de qualification qui manquaient au premier cycle. La
Gate B/release reste néanmoins refusée jusqu'à fermeture de `GB2-BLK-001..003` sur le host réellement
livrable, avec OOM/trap et budgets navigateur/appareil. Le moteur et le harness peuvent rester en
périmètre expérimental sans données utilisateur.
