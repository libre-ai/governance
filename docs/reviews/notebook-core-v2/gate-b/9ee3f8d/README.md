# Gate B — clôture gouvernée — `9ee3f8d`

- candidat source : `9ee3f8da65afce9bce8da98baac72c1aea8bd0ce`
- arbre : `843a95252eb60f08fdc596a20bcbcd19a0b1b4fd`
- base : `895c749df676bf46bc85ee556680025b55c028ff`
- date : `2026-07-18`
- verdict Gate B : **APPROVE**
- activation, données utilisateur, production, infrastructure et release : **NON AUTORISÉES**

Gate B qualifie le composant Rust/WASM et le host produit fixture-only exact sur la classe physique macOS arm64 32+ Gio. ADR-0006 conserve 8/16–24 Gio comme contributions facultatives non supportées. ADR-0007 classe l'OOM réel du processus navigateur comme diagnostic facultatif, maintient la reprise processus trois moteurs et interdit toute saturation globale de l'hôte.

## Résultat

- Bun : 390 tests / 961 assertions, typecheck/lint/générateurs verts ;
- audit Bun : aucune vulnérabilité ; REUSE : 773/773 ;
- Rust 1.97 : fmt, Clippy, tests et cargo-deny verts ;
- builds core et produit répétés byte-identiques ;
- E2E produit : 7/7 ; host/faults core : 6/6 ; faults produit : 6/6 ; APFS `ENOSPC` : 3/3 ;
- matrice physique : Chromium/Firefox/WebKit, deux warm-ups + vingt itérations, tous profils p95/RSS passés ;
- verdict brut : `qualification-budgets-pass`, `promotableEvidence:true`, violations `[]` ;
- package hors ligne réextrait dans un HOME/cache vierges et revérifié.

## Portée des fautes

Le manifeste v2 exige terminaison abrupte, crash, absence d'artefact partiel, reprise du même profil et worker neuf. Les fautes mémoire internes — plafond WASM, `memory.grow`, allocation Rust, failpoints, panic/traps/timeouts — restent obligatoires. `SIGKILL`, `SIGABRT` et le diagnostic V8 ne sont jamais renommés en OOM physique.

Le premier run `e8c4532` rejeté est conservé sous `evidence/performance/rejected-e8c4532/`. Il a déclenché la correction du sampler RSS. La sélection PGID intermédiaire, qui sous-comptait WebKit, n'a reçu aucun crédit. La preuve finale utilise un verrou exclusif cross-worktree, refuse les processus épinglés préexistants, compte tous les processus du cache exact et vérifie leur disparition au teardown. Voir [`QUALIFICATION-NOTES.md`](QUALIFICATION-NOTES.md).

## Revues review-only

| Rôle | Rapport | Verdict |
|---|---|---|
| architecture-host | [`ARCHITECTURE-HOST.md`](ARCHITECTURE-HOST.md) | approve |
| security | [`SECURITY.md`](SECURITY.md) | approve |
| cryptography-runtime | [`CRYPTOGRAPHY-RUNTIME.md`](CRYPTOGRAPHY-RUNTIME.md) | approve |
| privacy-france-eu | [`PRIVACY-FRANCE-EU.md`](PRIVACY-FRANCE-EU.md) | approve |
| performance-resource-classes | [`PERFORMANCE-RESOURCE-CLASSES.md`](PERFORMANCE-RESOURCE-CLASSES.md) | approve |
| synthèse Gate B | [`GATE-B-VERDICT.md`](GATE-B-VERDICT.md) | approve |

## Preuves

- matrice : `evidence/performance/final/` ;
- run rejeté : `evidence/performance/rejected-e8c4532/` ;
- fautes produit : `evidence/faults/` ;
- stockage APFS : `evidence/storage/` ;
- builds : `evidence/builds/` ;
- package hors ligne : `evidence/offline-package/` ;
- logs compressés : `evidence/logs/` ;
- inventaire complet : [`EVIDENCE-SHA256.txt`](EVIDENCE-SHA256.txt).

## Limites

Le support candidat reste macOS arm64 32+ Gio uniquement. Aucun effacement physique RAM/swap/OS, offline/Service Worker, modèle notebook blocs/révisions, import atomique ou suppression utilisateur n'est revendiqué par cette Gate. Un contrôle propriétaire distinct reste obligatoire avant toute activation, donnée utilisateur, production, release, infrastructure ou nouveau moteur produit.
