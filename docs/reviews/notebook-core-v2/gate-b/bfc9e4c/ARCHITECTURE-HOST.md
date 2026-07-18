# Gate B — revue ARCHITECTURE / HOST — Notebook Core v2

## Attribution

- `reviewPassId` : `notebook-core-v2-gate-b-architecture-host-bfc9e4c-01`
- rôle : `architecture-host`
- mode : passe `review-only`
- date : `2026-07-18`
- commit : `bfc9e4c77082528889ea953cc941a5312edc9b8f`
- arbre : `2da08f9af377d1789ef90394f482c00f245e9f73`
- identifiants agent/session/provider/modèle : non exposés par le harness

Le worktree et l'index sont restés propres pendant cette passe. Aucun fichier revu n'a été modifié.

## Portée et preuves

Le delta depuis `main=e778375` est limité à l'ADR-0006, au registre de décision, au manifeste de classes, à son parseur/tests et à la documentation active. Aucun fichier `apps/notebook/**`, contrat, crate crypto, build produit ou protocole worker n'a changé.

- ADR-0006 SHA-256 `4e966d1a0c0dbc8495d11549dc70717108863787b9fa39c5ac5178450617bf6b` ;
- manifeste ressources SHA-256 `94d0efc91d125f77760429259f4928373c68bdd4185a64ed8af1ed9b80defebe` ;
- minimum machine-readable : `desktop-arm64-high-memory-reference` ;
- classes 8 et 16–24 Gio : `community-observation` / `community-evidence-requested` ;
- le parseur refuse statut inconnu, minimum non résolu ou classe communautaire utilisée comme minimum ;
- 387 tests / 956 assertions, E2E produit 7/7, core host+faults 6/6, faults produit 6/6, APFS 3/3 ;
- matrice physique exacte : 3/3, `qualification-budgets-pass`, `promotableEvidence:true`.

## Analyse

1. **Réduction de portée explicite.** La décision ne transforme pas l'absence de machines modestes en preuve. Elle borne la Gate actuelle à la seule classe mesurée et interdit toute annonce 8/16–24 Gio.
2. **Autorité exécutable cohérente.** Le minimum du manifeste possède obligatoirement `purpose=minimum-product-candidate`; les observations restent sélectionnables pour une contribution physique mais ne changent pas seules la matrice requise.
3. **Host inchangé.** SSR, feature gate, worker jetable, IndexedDB, téléchargement neutre, CSP et absence de Service Worker restent ceux du candidat approuvé `96934a8` et sont rejoués sur le commit exact.
4. **Pas de détection intrusive.** Le minimum futur est une exigence système publiée ; l'ADR interdit de collecter/transmettre la mémoire physique depuis l'application.
5. **Rollback.** Revenir à la matrice large consiste à modifier l'ADR/manifeste et à reproduire les revues ; aucune donnée ou migration n'est affectée.

## Findings

- blocking architecture : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

L'OOM processus navigateur reste un blocker Gate B distinct. Le host demeure désactivé et la tranche fixture-only ne constitue toujours pas le notebook métier G3.

**VERDICT: approve**
