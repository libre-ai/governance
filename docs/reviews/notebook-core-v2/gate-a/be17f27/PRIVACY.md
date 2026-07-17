# Rapport Gate A — Notebook Core v2 — Vie privée France/UE

## Rôle et périmètre

- **Rôle exclusivement examiné :** vie privée France/UE.
- **Passe :** fraîche, review-only, sans modification du dépôt.
- **Hors périmètre :** architecture, sécurité, cryptographie, Gate B, jalon humain et release.
- Le rapport historique `9b1b994` a seulement été consulté comme historique ; son analyse et son verdict n’ont pas été réutilisés.

## Commit et intégrité

- **Commit exact :** `be17f27f5dec71457aca1aedb3100865900a14e1`
- **HEAD :** identique au commit demandé, détaché.
- **Arbre Git :** `7ca22b9fa03998e5e4503b7b598bc1f1943384b8`
- **Arbre du dossier de sécurité :** `a36bda9df0afdcceeb41c41292f10d3e0b566afa`
- **Propreté :** `git status --porcelain=v1 --untracked-files=all` vide avant et après les vérifications.
- L’objet commit existe et sa connectivité est valide. La signature GitHub est présente, mais non vérifiable localement faute de clé publique RSA `B5690EEEBB952194`.

## Empreintes SHA-256

| Artefact | SHA-256 |
|---|---|
| `docs/reviews/AGENT-REVIEW-PROTOCOL.md` | `522670835073096eea774d825df3f1b462296b9d0c3d09408807b28b9e54a6c1` |
| `docs/adr/0002-g1-cross-cutting-product-decisions.md` | `4c57496484d39bfe15f2c434050b8d456824588ae744d00a8e1ecc53c94969d3` |
| `docs/adr/0003-wp-g2-s01-contract-amendment.md` | `1ae324aca664822c9f9b89fd87d0186c3a28aed05c0d814a73fab261a2d36738` |
| `contracts/catalog.v1.json` | `908e735f9c1c6ac825890001a52ee66fc02b5bf45ea9894e99cdfa41e2fe2714` |
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` |
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `c129c58f3c5938fe884b64267b129be41e33941b11ee635d647a2c3181fe85f2` |
| `contracts/schemas/context-document.v2.schema.json` | `fe030c2642076588289f5da7814cb44bbff75e7684f487c0c7e4c230e25be455` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `3d25b790c357e8fd27f5bb3759f3217a3db3eb38dcba5980de5ea82ecbb15841` |
| `contracts/fixtures/schema-fixtures.v1.json` | `cf8e69e0f3e9c9b15502b34e3a2b985fa69f96a43e3836c104b40a54ee91bbca` |
| `docs/apps/notebook.md` | `41a083921acf9a699791617fc4e1228287ad198d15a4f1e58972663bf997bc1e` |

Les copies du dossier de sécurité de `world.wit`, des deux schémas backup et du golden sont byte-identiques aux autorités canoniques. Le golden est désormais unique : dix mutations backup, dix mutations Context, cinq cas Unicode et deux refus textuels.

## Commandes et preuves

```text
git rev-parse HEAD
git rev-parse HEAD^{tree}
git rev-parse HEAD:docs/security/notebook-core-v2-review
git status --porcelain=v1 --untracked-files=all
git cat-file -e be17f27f5dec71457aca1aedb3100865900a14e1^{commit}
git fsck --connectivity-only --no-dangling be17f27f5dec71457aca1aedb3100865900a14e1
git diff --check HEAD^1..HEAD
git diff --check HEAD^2..HEAD
git show --show-signature --no-patch HEAD
shasum -a 256 …
cmp -s <copie-dossier> <autorité-canonique>
```

Vérifications réussies :

- `bun run check:notebook-core-v2-candidate` : WIT fermé, copies uniques, schémas et profils vérifiés, `10` mutations backup et `10` Context ;
- `bun run check:contracts` : `71` entrées, `47` paires de fixtures, `103` opérations HTTP ; vecteurs Notebook verts ;
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts` : monde WIT résolu, `1` test réussi ;
- absence de `apps/notebook`, de crate Notebook et d’OpenAPI Notebook confirmée ;
- recherche ciblée : aucune capacité réseau, journalisation ou télémétrie dans la frontière WIT.

Échecs d’environnement non masqués :

- `bun run check:toolchain` échoue : Bun local `1.3.11+af24e281e`, au lieu de `1.4.0-canary.1+57f349f63` ;
- `bun run check:generated-contracts` échoue faute de `node_modules/.bin/biome`.

Ces deux échecs empêchent de revendiquer une reproduction complète avec la chaîne qualifiée, sans démontrer à eux seuls un défaut vie privée des artefacts examinés.

## Analyse minimisation et local-only

### Sauvegarde chiffrée

Les corrections historiques sont effectives :

- IDs backup et contexte limités à 128 bits CSPRNG, opaques et sans sémantique ;
- `createdAt` supprimé du WIT, des schémas, du golden et des types générés ;
- tout horodatage produit éventuel est placé dans le plaintext chiffré ;
- secret généré par défaut : exactement 16 octets CSPRNG, affichés en 32 hexadécimaux minuscules ;
- profil textuel : rejet du BOM initial et des non-scalaires, NFC, UTF-8 sans BOM, aucun trim, changement de casse ou normalisation des fins de ligne ;
- option de secret choisi interdite sans politique d’entropie séparément approuvée.

Les métadonnées claires restantes sont globalement nécessaires à l’ouverture : version, cipher, paramètres KDF, sel et nonce. Le profil producteur initial fixe les paramètres KDF, limitant leur capacité de fingerprinting. Sel, nonce et ID sont neufs par scellement. Le digest et la longueur du ciphertext permettent néanmoins de reconnaître une copie exacte et d’observer approximativement la taille du plaintext ; ils ne révèlent pas directement le contenu et le digest n’autorise jamais l’ouverture.

### ContextDocument

Le document Context est un export personnel potentiellement très sensible : contenu, graphe de liens, racines, identifiants, révisions et exclusions. Son partage en clair est cohérent avec un export volontaire, prévisualisé et immuable, mais il doit respecter la sélection explicite et la minimisation.

Le nouvel ID CSPRNG du document ne suffit pas à empêcher la corrélation : les IDs internes de blocs restent des identifiants libres et potentiellement sémantiques, réutilisables entre exports. Le golden matérialise ce comportement avec `aaa_root`, `bbb_json`, `ccc_leaf`, `yyy_old` et `zzz_old`. Les révisions renforcent la corrélation temporelle. Surtout, `excludedBlockIds` transmet au destinataire des identifiants de blocs précisément exclus, alors que celui-ci n’a aucun accès au notebook source.

### Local-only, persistance et suppression

Les limites sont correctement posées au niveau candidat :

- aucun import WIT : ni réseau, horloge, aléa, stockage, environnement ou log ;
- aucun endpoint Notebook et aucun fallback serveur ;
- IndexedDB et fichiers détenus par l’utilisateur sont les seules autorités prévues ;
- inventaire local du contenu chiffré, des clés, index et métadonnées d’export ;
- rétention jusqu’à suppression locale explicite ;
- `DeleteWorkspace` supprime enregistrements et clés, avec limites d’effacement navigateur divulguées ;
- une copie exportée reste irrévocable à distance, ce qui est explicitement reconnu ;
- les fixtures sont synthétiques, publiques et marquées interdites en production.

Il n’existe encore ni moteur ni host : l’absence réelle de réseau, de plaintext persistant, de log ou de télémétrie reste donc une preuve Gate B.

## Constats

### Blocking

Aucun.

### Major

#### PRIV-A2-01 — Corrélation et divulgation évitable dans l’export Context

`context-document.v2` autorise des IDs de blocs sémantiques ou stables, conserve leurs numéros de révision et exporte facultativement les IDs de blocs exclus. Aucune règle n’impose un remappage opaque limité à l’export ni ne justifie la communication des exclusions au consommateur.

Conséquences :

- corrélation d’un même bloc et de son historique entre plusieurs exports malgré un ID de document neuf ;
- divulgation de l’existence ou du thème de blocs explicitement exclus ;
- contradiction avec la finalité annoncée : le destinataire doit recevoir exactement la sélection exportée, sans accès direct au notebook ;
- non-conformité au principe de minimisation dès lors que ces métadonnées ne sont pas nécessaires au graphe consommé.

**Correction attendue avant verrouillage :**

1. remapper les IDs de blocs en identifiants opaques propres à chaque export tout en préservant racines et liens ;
2. retirer `excludedBlockIds` du document portable, ou démontrer une finalité nécessaire et utiliser au minimum des références export-scoped non corrélables ;
3. retirer ou justifier explicitement `revision` pour le consommateur ;
4. conserver les exclusions, compteurs et avertissements dans la prévisualisation ou le reçu local, pas dans le payload partagé ;
5. régénérer schéma, sémantique, golden, types et revue.

Ce défaut est normatif et relève de Gate A, non du futur comportement d’implémentation.

### Minor

#### PRIV-A2-02 — Mode de restauration du secret textuel insuffisamment auto-décrit

Le profil `code.v1` transforme les 32 caractères hexadécimaux en 16 octets, tandis que `text.v1` encode le texte en UTF-8. L’enveloppe n’indique pas le mode et le parcours de restauration n’est pas normativement défini. Une mauvaise sélection produit un échec indistinguable d’un mauvais secret.

Avant d’activer l’option textuelle, le host devra proposer un choix explicite et stable, sans heuristique ni journalisation, et tester la restauration sur un nouvel espace local. Le mode généré `code.v1` doit rester le seul mode initial tant que cette UX et la politique d’entropie ne sont pas approuvées.

#### PRIV-A2-03 — Métadonnées externes et taille à documenter

Le chiffrement ne masque pas la taille exacte du ciphertext. Le système de fichiers peut en outre ajouter nom et dates hors enveloppe. Gate B devra vérifier un nom de fichier neutre, l’absence de titre/ID local/date ajoutés par l’application et une information claire sur ces limites.

## Risques et mesures obligatoires en Gate B

Gate B devra vérifier sur le composant et le host immuables :

- CSPRNG réel et fraîcheur des IDs, sels et nonces ;
- remappage export-scoped des IDs Context après correction du contrat ;
- prévisualisation exacte et consentement explicite avant tout partage ;
- absence de réseau, synchronisation, télémétrie et support export contenant du contenu ;
- imports du module et du composant WASM réellement vides, exécution sans WASI ;
- absence de plaintext, secret ou clé dans IndexedDB, index, caches, erreurs, logs, globals et métriques ;
- zéroïsation best-effort des buffers host/WASM sur succès, erreur, OOM et panic ;
- suppression de chaque classe locale et destruction des clés, sans prétendre révoquer les fichiers déjà exportés ;
- restauration `code.v1` et, seulement si approuvé, `text.v1`, avec Unicode/BOM/trim conformes ;
- fichiers exportés sans nom sémantique ni timestamp ajouté par le produit ;
- tests hors ligne multi-navigateurs et inspection des requêtes réseau ;
- information utilisateur sur la taille visible, les métadonnées du système de fichiers et les limites d’effacement physique.

Le constat major ouvert interdit l’approbation vie privée. Ce verdict ne vaut ni jalon humain, ni verrouillage, ni implémentation, ni Gate B, ni release, et n’approuve aucun autre rôle.

REJECT
