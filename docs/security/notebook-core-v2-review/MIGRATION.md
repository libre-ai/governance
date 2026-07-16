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

## Développement après Gate S

La Gate S consignée dans [`SOLO-CHALLENGE.md`](SOLO-CHALLENGE.md) autorise un moteur expérimental contre ce dossier candidat, avec données publiques de test uniquement. Ce moteur ne constitue pas un producteur v2, ne peut écrire aucune sauvegarde utilisateur et ne transforme pas ce dossier en autorité canonique.

Cette phase sert à obtenir les preuves impossibles au seul niveau du contrat : zéroïsation réelle, imports du composant, intégration CSPRNG/secret côté host et budgets navigateur.

## Promotion après Gate R seulement

Après approbation externe de la Gate R consignée dans [`INDEPENDENT-REVIEW.md`](INDEPENDENT-REVIEW.md), une promotion atomique devra :

1. copier le WIT et les deux JSON Schema candidats vers `contracts/` sous leurs noms v2 ;
2. cataloguer v2, ajouter les fixtures positives/négatives et étendre les contrôles de version du harness ;
3. générer les projections TypeScript/Rust et mettre à jour les listes de WIT qualifiées ;
4. remplacer les références Notebook et work packages de v1 par v2 ;
5. conserver v1 comme autorité historique dépréciée, sans producteur, jusqu'à preuve qu'aucune donnée v1 n'existe ;
6. lier les autorités promues au composant et aux preuves exactes examinés en Gate R.

La promotion n'autorise une release qu'après les gates projet `rust-boundary-value-review` et `local-crypto-and-privacy-review`. Avant la Gate R, le contenu de ce dossier et toute implémentation associée restent expérimentaux et non canoniques.
