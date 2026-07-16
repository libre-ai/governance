# Note de migration — v1 vers v2

## Décision

**Oui, la correction impose `notebook-core@2.0.0` et `libre-ai.notebook-backup.v2`.** `contracts/COMPATIBILITY.md` classe le WIT comme frontière exacte major-versionnée et `notebook-core-v1` est verrouillé dans le catalogue.

Les ruptures sont substantielles :

- le monde WIT exporte une interface autonome `api` afin que le composant n'importe aucune interface de types ;
- `seal-backup` reçoit désormais une requête typée avec identifiant opaque CSPRNG, version, cipher et KDF ;
- `createdAt` est retiré de l'enveloppe claire ; un horodatage produit éventuel appartient au plaintext chiffré ;
- `open-backup` renvoie le plaintext avec l'identifiant et le digest effectivement authentifiés ;
- les erreurs string libres deviennent un enum fermé ;
- les profils host de recovery secret généré (`code.v1`) et textuel (`text.v1`) deviennent normatifs ;
- l'enveloppe ajoute la version Argon2 et la longueur de sortie, renomme `ciphertextDigest` en `digest` et en fixe une nouvelle sémantique ;
- AAD, JCS, Base64, tailles, tag, digest et comportement anti-oracle deviennent normatifs ;
- les bornes KDF v1 (`memoryKiB` jusqu'à 1 GiB, `iterations` jusqu'à 20, `parallelism` jusqu'à 16) ne sont pas compatibles avec le budget local v2.

Une enveloppe v1 ne doit jamais être interprétée comme v2, et un producteur v2 ne doit jamais émettre `schemaVersion = "libre-ai.notebook-backup.v1"`.

## Données existantes

Aucun moteur n'étant encore implémenté, il ne devrait exister aucune sauvegarde v1 faisant autorité : la migration attendue est une migration de contrat, pas de données.

Si des prototypes ont néanmoins émis des fichiers v1, aucune adaptation automatique sûre n'est définissable : v1 ne fixe ni AAD, ni digest, ni génération de l'`id`. Le propriétaire doit ouvrir le prototype avec sa version exacte, hors du nouveau cœur, puis resceller le plaintext en v2 avec un nouveau sel et un nouveau nonce. Un fichier v1 seul, sans implémentation historique précisément identifiée, est non migrable. Le cœur v2 ne tente jamais plusieurs recettes cryptographiques et ne fournit pas d'oracle de détection.

## Progression après Gate S

La Gate S consignée dans [`SOLO-CHALLENGE.md`](SOLO-CHALLENGE.md) autorise uniquement la rédaction et les contrôles machine du candidat. Aucun moteur expérimental n’est autorisé avant reproduction agentique indépendante du protocole et verdict Gate A.

Après Gate A, une implémentation bornée pourra produire les preuves impossibles au seul niveau du contrat : zéroïsation réelle, imports du composant, intégration CSPRNG/secret côté host et budgets navigateur. Elle ne devient jamais un producteur utilisateur avant Gate B et les gates de release.

## Promotion après Gate A seulement

Après verdict favorable de l’agent Gate A consigné dans [`INDEPENDENT-REVIEW.md`](INDEPENDENT-REVIEW.md), une promotion atomique devra :

1. vérifier que les copies cataloguées sous `contracts/` sont byte-identiques aux candidats examinés ;
2. lier les autorités aux commits et preuves exacts de Gate A ;
3. promouvoir explicitement les statuts `candidate` concernés vers `locked` ;
4. lever le blocage d’implémentation du work package, sans autoriser de sauvegarde utilisateur ;
5. conserver v1 comme autorité historique dépréciée, sans producteur, jusqu'à preuve qu'aucune donnée v1 n'existe ;
6. préparer la Gate B attribuable sur le composant construit.

La promotion n'autorise une release qu'après Gate B puis les gates projet `rust-boundary-value-review` et `local-crypto-and-privacy-review`. Avant Gate A, aucune implémentation n’est autorisée ; avant Gate B, aucune sauvegarde utilisateur n’est émise.
