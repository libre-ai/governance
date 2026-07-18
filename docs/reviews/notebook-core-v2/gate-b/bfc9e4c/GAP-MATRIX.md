# Gate B — matrice exigence / preuve / manque

Candidat source : `bfc9e4c77082528889ea953cc941a5312edc9b8f`, arbre `2da08f9af377d1789ef90394f482c00f245e9f73`. Autorités Notebook v2 et budgets inchangés. Fixtures publiques uniquement.

| Exigence | Preuve acquise | Manque exact | Action | État |
|---|---|---|---|---|
| autorités WIT/schémas/golden | six SHA-256 locked, checkers verts | aucun | conserver | satisfait |
| WASM livré | core `be423962…`, module Rust `a4c968cc…`, SIMD128, imports nuls, max 512 Mio, reproductible | aucun | réaudit à toute modification | satisfait |
| host produit exact | SSR/UI, gate, worker, IndexedDB, download, 7/7 E2E | modèle notebook G3 hors scope | gate additive future | satisfait fixture Gate B |
| crash/kill/reprise | faults produit 6/6, workers neufs, aucun partiel | signaux manuels ≠ OOM | crédit limité | satisfait crash/kill |
| `ENOSPC` | errno APFS réel, refus avant worker et reprise 3/3 | ne qualifie pas la capacité totale | conserver | satisfait comportement storage |
| build/runtime | désactivé sans WASM/worker/sw.js ; activé reproductible et lié au commit | aucun | conserver | satisfait |
| classe matérielle requise | 32+ Gio physique, 3 moteurs, 20 itérations/profil, `promotable=true` | aucun | conserver preuve hashée | satisfait |
| classe 8 Gio | issue #98 et protocole | preuve physique | contribution facultative | nice to have, non supportée |
| classe 16–24 Gio | issue #99 et protocole | preuve physique | contribution facultative | nice to have, non supportée |
| performance | tous p95/RSS sous budgets sur candidat exact | aucun sur matrice requise | réaudit à modification | satisfait |
| OOM interne WASM/Rust | memory.grow, alloc 600 Mio, panic/failpoints et reprise | aucun interne | non shipping | satisfait interne |
| OOM processus navigateur | diagnostic Chromium avec marqueur V8/PID/reprise | limite logicielle, Firefox/WebKit et opération produit exacte absents | mécanismes sûrs futurs | **blocking** |
| vie privée/réseau | fixture-only, aucune requête externe/PII/secret | données réelles interdites | gate additive | satisfait périmètre |
| effacement | buffers possédés et workers détruits best-effort | RAM/swap/OS non démontrables | transparence | limite assumée |
| validation dépôt | 387 tests, audit, REUSE, Rust et reproductibilité verts | aucun | CI PR | satisfait |
| revues | architecture/security/crypto/privacy approuvent ; performance rejette | OOM processus | maintenir REJECT | partiel |
| Gate B globale | matériel requis et preuves locales fermés | OOM processus attribuable trois moteurs | aucune activation | **REJECT** |

## Gouvernance matérielle

L'ADR-0006 choisit explicitement la réduction de matrice prévue par l'ADR-0005. Une classe facultative n'est ni passée ni supportée par défaut. Sa future promotion exige une preuve physique et une revue, sans relâcher les paramètres crypto.
