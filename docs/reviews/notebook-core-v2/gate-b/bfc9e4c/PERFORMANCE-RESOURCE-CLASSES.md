# Gate B — revue PERFORMANCE / CLASSES DE RESSOURCES — Notebook Core v2

## Attribution

- `reviewPassId` : `notebook-core-v2-gate-b-performance-resource-classes-bfc9e4c-05`
- rôle : `performance-resource-classes`
- mode : passe `review-only`
- date : `2026-07-18`
- commit : `bfc9e4c77082528889ea953cc941a5312edc9b8f`
- arbre : `2da08f9af377d1789ef90394f482c00f245e9f73`
- identifiants agent/session/provider/modèle : non exposés par le harness

Le worktree est resté propre pendant la passe.

## Matrice requise

L'ADR-0006, approuvé explicitement par le propriétaire, retient uniquement `desktop-arm64-high-memory-reference` comme minimum produit candidat. Les classes 8 Gio et 16–24 Gio sont des observations communautaires facultatives et ne sont pas déclarées supportées. Cette réduction n'est ni une extrapolation ni un waiver physique.

- manifeste ressources SHA-256 `94d0efc91d125f77760429259f4928373c68bdd4185a64ed8af1ed9b80defebe` ;
- host physique : macOS arm64, 38 654 705 664 octets, 14 CPU logiques, aucune virtualisation ;
- mode `physical-evidence`, `promotableEvidence:true` ;
- 2 warm-ups puis 20 mesures par profil et moteur ;
- résumé SHA-256 `82d9292a0d9e24b02d0e38e8073a890c0eb4cc5511fa3c44e56a8b81391d897a` ;
- résultat : `qualification-budgets-pass`, aucune violation.

| Moteur | Profil | Seal p95 | Open p95 | RSS additionnel | Budget |
|---|---|---:|---:|---:|---|
| Chromium 149.0.7827.55 | producteur | 764,9 ms | 797,6 ms | 160 694 272 | pass |
| Chromium 149.0.7827.55 | maximal | 952,9 ms | 1 001,1 ms | 231 636 992 | pass |
| Firefox 151.0 | producteur | 4 113 ms | 4 195 ms | 231 473 152 | pass |
| Firefox 151.0 | maximal | 6 508 ms | 6 608 ms | 305 922 048 | pass |
| WebKit 26.5 | producteur | 527 ms | 561 ms | 223 264 768 | pass |
| WebKit 26.5 | maximal | 716 ms | 774 ms | 319 438 848 | pass |

Les plafonds restent 5 s/256 Mio et 10 s/512 Mio. La classe requise et la performance fraîche du candidat exact sont satisfaites.

## OOM processus

Le diagnostic Chromium borné observe un renderer PID identifié, un cap V8 32 Mio, le marqueur `V8 javascript OOM`, la disparition du renderer, un watchdog non déclenché et la reprise du profil/worker. Il porte correctement `promotableEvidence:false` car le cap est logiciel. Firefox et WebKit n'ont aucun mécanisme équivalent sûr et attribuable ; le diagnostic n'exerce pas non plus l'opération produit exacte.

## Findings

### Blocking

1. Aucun OOM réel du processus navigateur n'est attribuable sur la matrice des trois moteurs sans limite logicielle diagnostic-only.

### Major

Aucun. La précédente absence de matrice fraîche et les classes matérielles requises sont fermées par la nouvelle preuve et l'ADR-0006.

### Minor

Aucun.

## Risques résiduels

#98/#99 peuvent étendre le support mais ne changent pas ce verdict. Aucun test ne doit saturer globalement RAM ou swap pour fermer artificiellement l'OOM.

**VERDICT: reject**
