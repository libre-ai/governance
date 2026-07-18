# Gate B — matrice matérielle gouvernée — `bfc9e4c`

## Décision

**REJECT** pour Gate B globale, activation, données utilisateur, production et release.

La classe physique 32+ Gio requise passe la matrice exacte sur Chromium, Firefox et WebKit. L'ADR-0006 rend les classes 8 Gio et 16–24 Gio facultatives : leur absence ne bloque plus Gate B et aucun support n'est revendiqué. Le blocker restant est l'OOM réel du processus navigateur attribuable sur les trois moteurs sans limite logicielle diagnostic-only.

## Candidat immuable

- commit source revu : `bfc9e4c77082528889ea953cc941a5312edc9b8f`
- arbre : `2da08f9af377d1789ef90394f482c00f245e9f73`
- base `main` : `e77837517c0bd5f0cca20ef7188eabfa35e55666`
- ADR : [`0006-notebook-gate-b-resource-scope.md`](../../../../adr/0006-notebook-gate-b-resource-scope.md)
- manifeste ressources SHA-256 : `94d0efc91d125f77760429259f4928373c68bdd4185a64ed8af1ed9b80defebe`
- worktree/index : propres pendant les cinq passes

Le delta ne modifie aucune implémentation produit, autorité WIT/schéma/golden ou crate crypto. Il formalise la matrice requise, ferme les enums du manifeste et actualise les tests/documentations.

## Matrice physique fraîche

Host physique macOS arm64 : 38 654 705 664 octets, 14 CPU logiques, aucune virtualisation, mode `physical-evidence`, `promotableEvidence:true`. Deux warm-ups puis 20 itérations par profil et moteur.

| Moteur | Profil | Seal p95 | Open p95 | RSS additionnel | Résultat |
|---|---|---:|---:|---:|---|
| Chromium 149.0.7827.55 | producteur | 764,9 ms | 797,6 ms | 160 694 272 | pass |
| Chromium 149.0.7827.55 | maximal | 952,9 ms | 1 001,1 ms | 231 636 992 | pass |
| Firefox 151.0 | producteur | 4 113 ms | 4 195 ms | 231 473 152 | pass |
| Firefox 151.0 | maximal | 6 508 ms | 6 608 ms | 305 922 048 | pass |
| WebKit 26.5 | producteur | 527 ms | 561 ms | 223 264 768 | pass |
| WebKit 26.5 | maximal | 716 ms | 774 ms | 319 438 848 | pass |

Résumé : `qualification-budgets-pass`, SHA-256 `82d9292a0d9e24b02d0e38e8073a890c0eb4cc5511fa3c44e56a8b81391d897a`, aucune violation. Budgets 5 s/256 Mio et 10 s/512 Mio inchangés.

## Bundle hors ligne

Le paquet macOS arm64 contient Bun, Node, Chromium, Firefox et WebKit exacts. Il a été vérifié, installé dans un HOME vide, réextrait depuis son tar puis revérifié.

- nom : `notebook-qualification-offline-darwin-arm64-bfc9e4c.tar`
- taille : 337 066 496 octets
- SHA-256 : `ee49d42c23a8937f44bcf46c5973a13a0c6eac27d7360ab95617bf17c3771e86`
- données runtime/utilisateur : aucune

Les URL Playwright non européennes sont une exception de bootstrap publique, déclarée et ponctuelle. Le paquet permet ensuite une remise hors ligne sans requête CDN de la machine de qualification.

## Revues spécialisées

| Passe | Rapport | Verdict |
|---|---|---|
| `notebook-core-v2-gate-b-architecture-host-bfc9e4c-01` | [`ARCHITECTURE-HOST.md`](ARCHITECTURE-HOST.md) | `approve` |
| `notebook-core-v2-gate-b-security-bfc9e4c-02` | [`SECURITY.md`](SECURITY.md) | `approve` |
| `notebook-core-v2-gate-b-cryptography-runtime-bfc9e4c-03` | [`CRYPTOGRAPHY-RUNTIME.md`](CRYPTOGRAPHY-RUNTIME.md) | `approve` |
| `notebook-core-v2-gate-b-privacy-france-eu-bfc9e4c-04` | [`PRIVACY-FRANCE-EU.md`](PRIVACY-FRANCE-EU.md) | `approve` |
| `notebook-core-v2-gate-b-performance-resource-classes-bfc9e4c-05` | [`PERFORMANCE-RESOURCE-CLASSES.md`](PERFORMANCE-RESOURCE-CLASSES.md) | `reject` |

## Validation exacte

- `bun run check` : 387 tests / 956 assertions ; audit sans vulnérabilité ;
- REUSE 6.2.0 : 728/728 fichiers ;
- Rust 1.97 : fmt, Clippy strict, tests, cargo-deny, imports/plafond et double build reproductible verts ;
- build désactivé sans WASM/bindings/worker/sw.js ; build Gate B byte-identique ;
- E2E produit 7/7 ; core host+faults 6/6 ; faults produit 6/6 ; APFS `ENOSPC` 3/3 ;
- manifeste produit SHA-256 `8b66cd06631b5ae0c4578bda7659aa1455a14d7b6abae5d7045f72995cf51d7b`.

Les 32 artefacts sont liés par [`EVIDENCE-SHA256.txt`](EVIDENCE-SHA256.txt).

## OOM et limites

Le diagnostic Chromium observe un vrai marqueur V8 OOM sur renderer identifié, sans déclenchement du watchdog, puis une reprise du profil et d'un worker neuf. Il reste `promotableEvidence:false` car le cap V8 32 Mio est logiciel ; Firefox/WebKit et l'opération produit exacte ne sont pas couverts. Voir [`OOM-DIAGNOSTIC.md`](OOM-DIAGNOSTIC.md).

L'effacement physique RAM/swap/OS n'est pas revendiqué. Zéroïsation et destruction restent best-effort.

## Interdictions

Aucune donnée utilisateur, notebook réel, sauvegarde réelle, activation, production, release, offline/Service Worker, annonce de support 8/16–24 Gio ou revendication d'effacement physique.
