# Gate B — finalisation locale du host produit — `96934a8`

## Décision

**REJECT** pour Gate B globale, activation, données utilisateur, production et release.

Toutes les preuves sûres démontrables localement sont archivées. Le vrai `ENOSPC` du host produit est fermé sur Chromium, Firefox et WebKit. Restent bloquants : OOM réel du processus navigateur avec attribution moteur/OS, classe physique 8 Gio et classe physique 16–24 Gio. L'effacement physique RAM/swap/OS n'est pas revendiqué.

## Candidat immuable

- commit source revu : `96934a8e0698db6d35591f811856ff0824db3956`
- arbre : `f51a2c3a3ff85d0c66d7ef244922a37f1b43a9c5`
- base `main` : `8ae8abf8302d30bec4bd6232eb2f7276d5e1fb83`
- archive fautes antérieure rejouée : `0db9b25`
- ADR gouvernance : [`0005-notebook-gate-b-host-qualification.md`](../../../../adr/0005-notebook-gate-b-host-qualification.md)
- DCO : présent sur tous les commits de branche
- worktree/index : propres pendant les cinq passes

La branche a été reconstruite depuis #100 avant qualification afin que le merge de gouvernance ne rende pas les revues obsolètes. Le candidat intermédiaire `ce560a9` n'a pas été retenu : le commit suivant `96934a8` exclut uniquement `docs/reviews/**/evidence` du formatage Biome afin de préserver les JSON bruts archivés.

## Autorités et livrables

| Élément | SHA-256 |
|---|---|
| WIT v2 | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| sémantique | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| Context v2 | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| seal request v2 | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| backup v2 | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| golden | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |
| manifeste produit | `b4b2fedbe5564c86e13ac6770ff644bdfc5cc16bc0a2f9a0543a639f6631c01e` |
| core livré | `be423962e3a889e792a69a1ab60b978bcbf5ae1102db74a68c70a9a1c65e5942` |
| bindings livrés | `ced45517e0efb2099fe641c1c9605731f95a8eb2a16836dbd2b2f58b3901b0d1` |
| worker livré | `19054f4913ffc438159bb2345b17487dae82d75e3e0ba17212610f61c3cbeb9a` |
| manifeste core qualification | `33aa9de791e3f1e96a87203969381bc98a0cfb99659e8db7512bf2ad59533cc2` |
| module Rust WASM reproductible | `a4c968ccb98eea35e5e92166d801b71f0bcf1fd0284af7c47b3406f83dd881dc` |

## Revues spécialisées

| Passe | Rapport | Verdict |
|---|---|---|
| `notebook-core-v2-gate-b-architecture-host-96934a8-01` | [`ARCHITECTURE-HOST.md`](ARCHITECTURE-HOST.md) | `approve` |
| `notebook-core-v2-gate-b-security-96934a8-02` | [`SECURITY.md`](SECURITY.md) | `approve` |
| `notebook-core-v2-gate-b-cryptography-runtime-96934a8-03` | [`CRYPTOGRAPHY-RUNTIME.md`](CRYPTOGRAPHY-RUNTIME.md) | `approve` |
| `notebook-core-v2-gate-b-privacy-france-eu-96934a8-04` | [`PRIVACY-FRANCE-EU.md`](PRIVACY-FRANCE-EU.md) | `approve` |
| `notebook-core-v2-gate-b-performance-resource-classes-96934a8-05` | [`PERFORMANCE-RESOURCE-CLASSES.md`](PERFORMANCE-RESOURCE-CLASSES.md) | `reject` |

Les passes sont séparées, review-only, sur le même commit/arbre. Les rapports ont été produits hors worktree puis copiés dans ce commit de preuve.

## Validation reproduite

- `bun run check` : 387 tests, 949 assertions, zéro échec ; log SHA-256 `2728e4a76da1d740534b5047710f61c3db49efe0f5e45a3bdb45c413d022904d` ;
- `bun audit` : aucune vulnérabilité ;
- REUSE 6.2.0 : 694/694 fichiers sur le candidat source ;
- Rust 1.97.0 : fmt, Clippy `-D warnings`, tests all-features, cargo-deny, wasm32, inspecteur et double build verts ;
- build désactivé : aucun WASM, binding, worker ou Service Worker ;
- build Gate B répété : fichiers byte-identiques ;
- E2E produit : 7/7 ; host + fautes core : 6/6 ; fautes produit exact : 6/6 ; APFS `ENOSPC` : 3/3 ;
- classe locale : référence physique 32+ Gio, 38 654 705 664 octets, 14 CPU, `promotable=true`.

Les journaux sont archivés en `gzip -n` déterministe. Le SHA-256 décompressé du log `bun run check` est celui indiqué ci-dessus.

La performance complète n'a pas été relancée : les quatre archives bootstrap obligatoires ne sont pas disponibles localement. La preuve `5190972` reste la référence pour la surface moteur byte-identique ; aucun cache extrait ni téléchargement CDN n'est promu en nouvelle preuve.

## Preuve `ENOSPC`

Image APFS sparse jetable 6 Gio, réserve hôte 8 Gio, remplissage public déterministe, errno OS `ENOSPC`, staging 16 Mio refusé avant tout worker, même profil relancé, état antérieur retrouvé puis restauration/sauvegarde réussies après suppression du filler.

| Moteur | Rapport SHA-256 | Inspection live sous ENOSPC |
|---|---|---|
| Chromium 149.0.7827.55 | `3b06e29822e224d29e3caee2951c6c226e68b65c2446bfb6b0c0746f098febde` | oui |
| Firefox 151.0 | `0f405256ad5e1239dad07af144e88408395f05df99723aa2d378d99c39c8e0a2` | oui |
| WebKit 26.5 | `d0383d150be98b77a7a090d8dbc8c52228221aeff6515451189406bb1a221cac` | non, état vérifié après relance |

Cette preuve qualifie le comportement `ENOSPC`, jamais une classe matérielle.

## Blockers conservés

1. [`OOM-SPIKE.md`](OOM-SPIKE.md) : aucun OOM processus sûr et attribuable ; signaux manuels et refus WASM non surcrédités.
2. `desktop-arm64-constrained-8gib` : aucune preuve physique ; collecte #98.
3. `desktop-arm64-mainstream-16gib` : aucune preuve physique ; collecte #99.
4. Effacement physique : hors capacité de preuve de l'application ; zéroïsation seulement best-effort.

Options explicites : maintenir REJECT et la collecte communautaire, réduire gouvernément la matrice supportée, ou obtenir les deux classes de Mac physiques. Aucune option n'est choisie silencieusement, conformément à l'ADR-0005.

Voir [`GAP-MATRIX.md`](GAP-MATRIX.md) et [`EVIDENCE-SHA256.txt`](EVIDENCE-SHA256.txt).

## Interdictions

Aucune donnée utilisateur, notebook réel, sauvegarde réelle, activation, production, release, offline/Service Worker, annonce de support 8/16–24 Gio ou revendication d'effacement physique.
