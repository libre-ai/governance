# Gate B — revue ARCHITECTURE / HOST — Notebook Core v2

- `reviewPassId` : `notebook-core-v2-gate-b-architecture-host-9ee3f8d-01`
- rôle : architecture-host
- mode : `review-only`
- date : `2026-07-18`
- commit revu : `9ee3f8da65afce9bce8da98baac72c1aea8bd0ce`
- arbre : `843a95252eb60f08fdc596a20bcbcd19a0b1b4fd`
- base : `895c749df676bf46bc85ee556680025b55c028ff`
- agent/session/provider/modèle : non exposés par le harness

## Portée

Passe dédiée sur le candidat immuable et propre. Elle examine ADR-0007/D27, le manifeste de ressources v2, le host produit exact désactivé, les frontières worker/IndexedDB/download, les harnesses de fautes/stockage/performance et l'attribution RSS. Elle ne modifie aucun fichier et ne vaut ni revue sécurité, cryptographie, vie privée ou performance.

## Constat

1. **Portée OOM gouvernée.** ADR-0007 ne renomme aucun signal : l'OOM processus devient un diagnostic facultatif parce qu'aucune primitive sûre et commune aux trois moteurs n'existe. La terminaison abrupte, le crash, l'absence d'artefact partiel, la reprise du même profil et le worker neuf restent obligatoires et machine-readable.
2. **Host exact inchangé et fermé.** Le delta ne modifie ni `apps/notebook/**`, ni les contrats, ni le moteur. Le build normal reste sans core/bindings/worker/`sw.js`; le build Gate B exact est lié au commit et reproductible.
3. **Workers et instances jetables.** Les E2E produit passent 7/7, le host/faults core 6/6 et les fautes produit 6/6 dans Chromium, Firefox et WebKit. Les fautes internes restent séparées du shipping.
4. **Stockage borné.** La campagne APFS 6 Gio reste séquentielle, conserve 8 Gio de réserve hôte, obtient `ENOSPC`, relance le même profil et démonte tous les volumes : 3/3.
5. **Attribution RSS remédiée.** Le rejet `e8c4532` a révélé que le filtre historique par chemin pouvait agréger une campagne concurrente. Le PGID seul a ensuite sous-compté les XPC WebKit et n'a reçu aucun crédit. Le candidat final acquiert un verrou global de cache avant tout navigateur, refuse les processus préexistants, somme tous les processus du chemin épinglé et vérifie le teardown. Le verrou est cross-worktree et l'échec reste conservateur.
6. **Matrice supportée.** Seule la classe physique macOS arm64 32+ Gio est requise. Les classes 8/16–24 Gio restent facultatives, disjointes et non supportées.
7. **Séparation des gates.** Gate B qualifie la tranche fixture-only ; le modèle notebook G3, l'offline/Service Worker, les données utilisateur, l'activation, la production et la release restent hors portée.

## Preuves reproduites

- `bun run check` : 390 tests, 961 assertions, typecheck/lint/générateurs verts ;
- builds core et produit répétés byte-identiques ;
- E2E produit 7/7 ; host/faults core 6/6 ; fautes produit 6/6 ; APFS 3/3 ;
- matrice physique finale : trois moteurs, 20 itérations après deux warm-ups, `qualification-budgets-pass` ;
- verrou de performance : refus concurrent vérifié et absence de lock/processus résiduel après teardown.

## Findings

- blocking : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

- l'OOM moteur réel reste non observé portablement et explicitement facultatif ;
- l'effacement physique RAM/swap/OS n'est pas revendiqué ;
- aucun support n'est annoncé sous 32 Gio ou hors macOS arm64 ;
- l'approbation de cette architecture n'autorise aucune activation.

**VERDICT: approve**
