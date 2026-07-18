# Gate B — matrice exigence / preuve / manque

Candidat source immuable : `96934a8e0698db6d35591f811856ff0824db3956`, arbre `f51a2c3a3ff85d0c66d7ef244922a37f1b43a9c5`. Autorités Notebook v2 inchangées. Fixtures publiques uniquement. L'ADR-0005 accepté borne explicitement l'exception de qualification.

| Exigence Gate B | Preuve acquise | Manque exact | Matériel requis | Action suivante | Verdict |
|---|---|---|---|---|---|
| autorités WIT/schémas/golden | six SHA-256 Gate A inchangés, checkers verts | aucun | non | conserver locked | satisfait |
| WASM exact livré | core `be423962…`, bindings `ced45517…`, worker `19054f49…` ; module Rust `a4c968cc…` reproductible ; SIMD128, imports nuls, max 512 Mio | aucun sur l'artefact | non | réaudit à toute modification | satisfait |
| host produit exact | SSR/UI, worker, IndexedDB, téléchargement et manifeste liés à `96934a8` | modèle métier notebook complet hors scope | non | incrément ultérieur séparé | satisfait pour fixture Gate B |
| gate build/runtime | build désactivé sans WASM/bindings/worker/sw.js ; build activé lié au commit ; désaccord fermé | aucun | non | conserver | satisfait |
| Service Worker/cache | aucun asset, route ou enregistrement ; `app.js` no-store | offline/rollback non implémenté | non | future gate dédiée | satisfait pour Gate B actuelle |
| réseau/logs | origine externe bloquée ; console/pageerror vides ; serveur logue seulement bind | aucune donnée réelle testée | non | conserver scans | satisfait fixture-only |
| recovery | absent enveloppe/IndexedDB/nom/serveur ; publié après persistance/download ; saisie vidée | chaînes JS et DOM non effaçables physiquement | non | transparence + best-effort | satisfait logiquement |
| plaintext persistant | aucun champ plaintext/recovery ; callback transitoire et wipe best-effort | copies moteur/RAM non observables | non | ne pas surrevendiquer | satisfait logiquement |
| worker/instance jetables | terminaison toute issue, 7/7 E2E, 6/6 host/fautes, workers neufs après reprise | OOM processus attribuable | méthode moteur sûre inconnue | finding séparé | partiel |
| crash/kill processus | `SIGKILL` seal + `SIGABRT` restore sur trois moteurs, même profil, aucun artefact partiel | signaux manuels ≠ OOM | non | conserver crédit limité | satisfait crash/kill |
| OOM WASM/Rust | panic, alloc 600 Mio, `memory.grow`, serde/JCS/Argon, traps et reprise | aucun manque interne identifié | non | conserver non-shipping | satisfait interne |
| OOM processus navigateur | aucune preuve recevable | processus + borne + marqueur moteur/OS OOM + watchdog + reprise | mécanisme spécifique, sans saturation globale | recherche future sûre | **blocking** |
| quota préflight | plancher 512 Mio fermé | estimation navigateur non physique | non | conserver | satisfait garde |
| abort injecté | transaction refusée, aucun partiel, reprise | ne prouve pas `ENOSPC` | non | conserver comme contrôle | satisfait injection |
| `ENOSPC` physique local | APFS sparse 6 Gio, errno `-28`, staging 16 Mio refusé avant worker, reprise exacte, 3/3 moteurs | ne qualifie pas capacité notebook ni hardware | Mac local seulement | archiver rapports | satisfait comportement storage |
| atomicité restauration | état antérieur identique après ENOSPC ; aucun pending/reçu ; succès après libération | import métier complet absent | non | futur modèle métier | satisfait pour enveloppe |
| mauvais recovery/hostile | golden, worker hostile, mauvais code produit, erreurs statiques | aucun | non | conserver | satisfait |
| séparation faults/shipping | build refuse fault/internal/trap ; build normal omet core | aucun | non | conserver | satisfait |
| effacement JS/WASM/Rust | buffers possédés zéroïsés/détachés ; workers détruits ; Rust `Zeroizing` | RAM, ABI, moteur, swap et OS non prouvés | instrumentation native sans garantie absolue | documenter limite | best-effort uniquement |
| performance référence 32+ Gio | `5190972`, 20 itérations/profil/moteur, budgets passés, surface moteur byte-identique | pas de nouvelle matrice `96934a8` faute d'archives bootstrap locales | host 36 Gio disponible | restaurer paquet d'archives si nouvelle mesure requise | référence historique qualifiée |
| classe 8 Gio | protocole + issue #98 | rapport physique hashé et revue | Mac physique 8 Gio | collecte communautaire | **blocking** |
| classe 16–24 Gio | protocole + issue #99 | rapport physique hashé et revue | Mac physique 16/24 Gio | collecte communautaire | **blocking** |
| validation repository | 387 tests Bun, audit, REUSE 694/694, Rust CI/cargo-deny/reproductibilité verts | aucun | non | CI PR | satisfait |
| revues spécialisées | architecture, sécurité, crypto, privacy : approve ; performance/classes : reject | blockers ressources ci-dessus | oui pour classes | conserver rapports immuables | **reject performance** |
| Gate B globale | toutes preuves locales sûres archivées | OOM processus, classes 8 et 16–24 Gio ; effacement physique non revendicable | oui | aucune activation | **REJECT** |

## Interdictions maintenues

Données utilisateur, notebook réel, sauvegarde réelle, activation du feature gate, production, release, Service Worker/offline, annonce de support 8/16–24 Gio et revendication d'effacement physique restent interdits.
