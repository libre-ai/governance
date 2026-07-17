# Gate B — revue de remédiation host Notebook Core v2

## Attribution et cible

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-7df396b-03`
- rôle : `cryptography-runtime`
- mode : passe `review-only`
- commit revu : `7df396b8fe6e88e781f44037150e8beda977f05e`
- arbre Git : `55a4b710a5f8463cc5b0fd9c1aa69e6620459c28`
- passe de référence : [`d0f643b/HOST-RUNTIME.md`](../d0f643b/HOST-RUNTIME.md)
- date : 2026-07-17

Le worktree était propre pendant la passe. Les six autorités verrouillées gardent leurs SHA-256 Gate A.
Le composant reste byte-identique à la passe précédente ; cette revue cible la remédiation du host de
qualification après revue d'intégration.

## Delta revu

Deux défenses ont été ajoutées :

1. `closedRefusal` neutralise un getter/proxy `message` qui lève une exception et retourne toujours le
   message statique `internal-failure` ; aucune valeur de l'objet hostile n'est réfléchie ;
2. `sealOwned` et `openForUse` capturent la référence du plaintext possédé avant d'appeler l'adaptateur
   ou le consommateur ; une réassignation ultérieure de la propriété ne détourne plus l'effacement.

Deux tests host dédiés couvrent les accesseurs hostiles et les réassignations. Aucun changement n'est
apporté au moteur Rust, aux contrats ou aux vecteurs. Le merge intermédiaire de `origin/main` ne
modifie que les autorités engine-envelope étrangères à Notebook et passe tous les checkers workspace.

## Artefacts et exécutions

| Artefact | SHA-256 |
|---|---|
| module Rust release | `6ad5148c97ab3d0169a67a499460a1c1db24da694e023fdc1f546f5d61d20427` |
| composant | `09252bf8dbbbd2c2f7151725dd4066d004000d85f584f9721b38c7daeb281a4a` |
| wrapper Component Model | `ced45517e0efb2099fe641c1c9605731f95a8eb2a16836dbd2b2f58b3901b0d1` |
| host remédié | `6f9d081fd105a86c53865b9cf32d21897473fb68315441e3ba3835b15cb8c08f` |

Preuves rejouées sur le commit exact :

- `bun run check` : 121 tests, lint, types, contrats et licences verts ;
- `bun audit` : aucune vulnérabilité déclarée ;
- `bun run qualify:notebook-core-v2:host` : Chromium, Firefox et WebKit verts ;
- CI PR #58 : `Bun quality` et `Rust quality` verts ;
- zéro import/WASI et plafond mémoire 512 MiB inchangés ;
- corpus golden, mutations et frontières inchangé et vert.

## Revue sécurité/qualité/performance/complétude

- **Sécurité :** le contournement du mapping fermé est corrigé ; aucun secret/PII, réseau, stockage ou
  diagnostic dynamique ajouté.
- **Qualité :** tests adversariaux ciblés, types et formatage verts ; aucune régression détectée.
- **Performance :** les captures sont O(1) et n'ajoutent aucune copie de plaintext.
- **Complétude :** complète pour le défaut de remédiation ; aucune prétention de host produit.
- **Souveraineté :** dépendances et licences inchangées, exécution locale uniquement.

Aucun nouveau constat blocking ou major n'est ouvert par ce delta.

## Blocages Gate B inchangés

- `GB2-BLK-001` : host produit et archives Node/navigateurs épinglées absents ;
- `GB2-BLK-002` : injections OOM/panic/trap et destruction d'instance absentes ;
- `GB2-BLK-003` : p95, pic mémoire, classes d'appareil et distributions temporelles absents.

## Verdict

**REJECT** pour Gate B/release.

La remédiation host est acceptée dans le périmètre expérimental de qualification. Elle ne ferme aucun
des trois blocages de release et n'autorise ni donnée utilisateur, ni sauvegarde, ni production.
