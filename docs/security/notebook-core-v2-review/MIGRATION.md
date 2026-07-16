# Note de migration — v1 vers v2

## Décision

**Oui, la correction impose `notebook-core@2.0.0` et `libre-ai.notebook-backup.v2`.** `contracts/COMPATIBILITY.md` classe le WIT comme frontière exacte major-versionnée et `notebook-core-v1` est verrouillé dans le catalogue.

Les ruptures sont substantielles :

- `seal-backup` reçoit désormais une requête typée avec `id`, `created-at`, version, cipher et KDF ;
- `open-backup` renvoie le plaintext avec les métadonnées effectivement authentifiées ;
- les erreurs string libres deviennent un enum fermé ;
- l'enveloppe ajoute la version Argon2 et la longueur de sortie, renomme `ciphertextDigest` en `digest` et en fixe une nouvelle sémantique ;
- AAD, JCS, Base64, tailles, tag, digest et comportement anti-oracle deviennent normatifs ;
- les bornes KDF v1 (`memoryKiB` jusqu'à 1 GiB, `iterations` jusqu'à 20, `parallelism` jusqu'à 16) ne sont pas compatibles avec le budget local v2.

Une enveloppe v1 ne doit jamais être interprétée comme v2, et un producteur v2 ne doit jamais émettre `schemaVersion = "libre-ai.notebook-backup.v1"`.

## Données existantes

Aucun moteur n'étant encore implémenté, il ne devrait exister aucune sauvegarde v1 faisant autorité : la migration attendue est une migration de contrat, pas de données.

Si des prototypes ont néanmoins émis des fichiers v1, aucune adaptation automatique sûre n'est définissable : v1 ne fixe ni AAD, ni digest, ni dérivation de `id`/`createdAt`. Le propriétaire doit ouvrir le prototype avec sa version exacte, hors du nouveau cœur, puis resceller le plaintext en v2 avec un nouveau sel et un nouveau nonce. Un fichier v1 seul, sans implémentation historique précisément identifiée, est non migrable. Le cœur v2 ne tente jamais plusieurs recettes cryptographiques et ne fournit pas d'oracle de détection.

## Promotion après Gate A seulement

Après approbation de la Gate A consignée dans [`INDEPENDENT-REVIEW.md`](INDEPENDENT-REVIEW.md), une promotion atomique devra :

1. copier le WIT et les deux JSON Schema candidats vers `contracts/` sous leurs noms v2 ;
2. cataloguer v2, ajouter les fixtures positives/négatives et étendre les contrôles de version du harness ;
3. générer les projections TypeScript/Rust et mettre à jour les listes de WIT qualifiées ;
4. remplacer les références Notebook et work packages de v1 par v2 ;
5. conserver v1 comme autorité historique dépréciée, sans producteur, jusqu'à preuve qu'aucune donnée v1 n'existe ;
6. seulement ensuite autoriser l'implémentation Rust/WASM derrière les gates de développement.

La promotion et l'implémentation n'autorisent aucune sauvegarde utilisateur. La Gate B définie dans [`README.md`](README.md#10-gate-b--conformité-du-moteur-avant-release) doit encore qualifier le composant construit, sa zéroïsation, ses imports et ses performances avant release.

Avant la Gate A, le contenu de ce dossier reste une proposition non canonique.
