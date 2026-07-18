# Gate B — revue SÉCURITÉ — Notebook Core v2

- `reviewPassId` : `notebook-core-v2-gate-b-security-9ee3f8d-02`
- rôle : security
- mode : `review-only`
- date : `2026-07-18`
- commit revu : `9ee3f8da65afce9bce8da98baac72c1aea8bd0ce`
- arbre : `843a95252eb60f08fdc596a20bcbcd19a0b1b4fd`
- base : `895c749df676bf46bc85ee556680025b55c028ff`
- agent/session/provider/modèle : non exposés par le harness

## Portée

Passe dédiée et sans modification sur la sécurité du host exact, du changement de politique OOM, des fautes, du stockage, du bootstrap hors ligne et du nouveau verrou RSS. La cryptographie mathématique et le verdict performance restent des rôles séparés.

## Constat

1. **Sécurité de l'hôte prioritaire.** ADR-0007 interdit l'épuisement global de RAM/swap et les allocations non bornées visant à faire tomber le système. Cette réduction de preuve est explicite, réversible et ne relâche aucune limite produit.
2. **Politique fail-closed.** Le manifeste v2 exige exactement les preuves de reprise processus et `unsafeHostExhaustionForbidden:true`. Champs, inventaires, statuts et schéma inconnus sont refusés par le parseur et ses tests.
3. **Signaux honnêtes.** `SIGKILL`, `SIGABRT`, refus `memory.grow`, cap V8 et erreurs d'allocation gardent leur cause exacte. Le diagnostic Chromium reste `promotableEvidence:false` et n'est pas présenté comme preuve physique.
4. **Faute processus.** Les trois moteurs prouvent fermeture, absence de download/receipt partiel, nettoyage du staging chiffré, reprise du même profil et worker neuf. Les rapports sont liés au build produit `9ee3f8d`.
5. **Lock RSS.** Le lock est un répertoire atomique sous le cache Playwright fixe. Un lock existant ou un processus épinglé actif refuse la campagne avant lancement. Le teardown attend la disparition des processus, retire uniquement le chemin fixe puis échoue si un processus reste. Aucune commande de processus n'est publiée.
6. **Mesure conservatrice.** Un processus non coopératif démarré après le preflight ne peut qu'augmenter le RSS et provoquer un faux rejet, pas fabriquer un PASS. Tous les sous-processus WebKit du chemin épinglé restent comptés.
7. **Host produit fermé.** Entrées publiques seulement, worker jetable, erreurs statiques, aucun plaintext/recovery persistant, CSP stricte, requêtes externes bloquées et feature désactivée par défaut.
8. **Stockage.** Le vrai `ENOSPC` APFS est borné et isolé ; aucun disque principal n'est rempli. Le verrou storage et le teardown sont propres après 3/3.
9. **Supply chain.** Bun/Node/Playwright et les trois navigateurs sont épinglés par SHA-256. `bun audit`, cargo-deny et REUSE sont verts. Aucun secret, token ou dépendance runtime externe n'est ajouté.

## Preuves reproduites

- Bun : 390/390 tests, 961 assertions ; audit sans vulnérabilité ;
- Rust : fmt, Clippy, tests et cargo-deny verts ;
- REUSE : 773/773 ;
- produit 7/7, faults core 6/6, faults produit 6/6, APFS 3/3 ;
- matrice physique finale 3/3, aucune requête externe/console/page error ;
- test négatif du lock concurrent : refus avant navigateur, exit non nul.

## Findings

- blocking : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

- l'OOM processus réel reste un diagnostic facultatif non démontré sur Firefox/WebKit ;
- la zéroïsation JS/WASM/Rust reste best-effort, sans garantie RAM/swap/OS ;
- le package de bootstrap conserve l'exception publique Playwright CDN documentée, sans donnée d'exécution ;
- données utilisateur, activation, production, release et infrastructure restent interdites sans contrôle propriétaire séparé.

**VERDICT: approve**
