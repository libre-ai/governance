# Gate B — revue PERFORMANCE / CLASSES DE RESSOURCES — Notebook Core v2

## Attribution et indépendance

- `reviewPassId` : `notebook-core-v2-gate-b-performance-resource-classes-96934a8-05`
- rôle : `performance-resource-classes`
- mode : passe spécialisée `review-only`
- date : `2026-07-18`
- identifiants agent/session/provider/modèle : non exposés par le harness

Passe séparée, sans modification du dépôt. Le verdict est le verdict du rôle performance/ressources sur le candidat exact ; il n'est pas remplacé par un succès CI ou par une mesure historique.

## Cible, budgets et manifeste

- commit : `96934a8e0698db6d35591f811856ff0824db3956`
- arbre : `f51a2c3a3ff85d0c66d7ef244922a37f1b43a9c5`
- manifeste classes : SHA-256 `2f51afc70fcc51427918f0a0da81201decf68c603b29861d582f66c3cebce1b7`
- worktree/index : propres

Budgets inchangés :

| Profil | p95 seal/open | RSS additionnel |
|---|---:|---:|
| producteur `m=65536,t=3,p=1` | ≤ 5 s | ≤ 256 Mio |
| maximal `m=131072,t=4,p=4` | ≤ 10 s | ≤ 512 Mio |

Aucun relâchement de limite plaintext 16 Mio, KDF, itération, warm-up ou budget n'a été effectué.

## Matrice exigence / preuve / manque

| Exigence | Preuve recevable | Manque | Verdict du point |
|---|---|---|---|
| classe référence 32+ Gio | campagne physique `5190972`, rapport SHA-256 `377df47b…3b17`, artefact core exact `be423962…5942` | mesure non rejouée sur `96934a8` faute d'archives bootstrap locales | qualifiée comme référence historique uniquement |
| classe 8–<12 Gio | aucune mesure physique ; issue #98 en inscription | Mac physique 8 Gio, rapports hashés, revue | **bloquant** |
| classe 16–24 Gio | aucune mesure physique ; issue #99 en inscription | Mac physique 16/24 Gio, rapports hashés, revue | **bloquant** |
| host produit exact | E2E 7/7, faults 6/6, APFS 3/3 | pas de matrice p95/RSS produit 16 Mio sur candidat exact | partiel |
| quota préflight 512 Mio | vérifié dans les trois moteurs | `navigator.storage.estimate()` n'est pas une capacité physique fiable | satisfait comme garde, pas comme preuve disque |
| `ENOSPC` physique local | errno `ENOSPC` sur APFS 6 Gio, staging refusé, même profil repris | ne qualifie aucune RAM/CPU ni taille totale notebook | satisfait pour le comportement storage |
| OOM WASM/Rust | memory.grow, alloc 600 Mio, panic, serde/JCS/Argon et reprise | aucun OOM processus navigateur réel | partiel |
| OOM processus | `SIGKILL` et `SIGABRT` avec reprise | aucun marqueur moteur/OS OOM, aucune cause attribuable | **bloquant** |
| effacement physique | workers/instances/buffers détruits logiquement | RAM, swap, copies moteur non observables | non démontrable depuis l'app ; aucune revendication |

## Preuves de référence conservées

La surface crypto/moteur est byte-identique à `5190972`. Résultats physiques de référence M4 Max 36 Gio :

| Moteur | Profil | Seal p95 | Open p95 | Pic RSS additionnel | Résultat |
|---|---|---:|---:|---:|---|
| Chromium | producteur | 832 ms | 832 ms | 166,5 Mio | pass |
| Chromium | maximal | 967 ms | 1 004,8 ms | 237,1 Mio | pass |
| Firefox | producteur | 4 600 ms | 4 468 ms | 230,7 Mio | pass |
| Firefox | maximal | 9 035 ms | 9 653 ms | 307,4 Mio | pass, marge open 347 ms |
| WebKit | producteur | 547 ms | 587 ms | 219,7 Mio | pass |
| WebKit | maximal | 750 ms | 788 ms | 311,4 Mio | pass |

Le checker courant reconnaît le host local physique `desktop-arm64-high-memory-reference` : 38 654 705 664 octets, 14 CPU logiques, mode `physical-evidence`, `promotable=true`. Ce contrôle de classe n'est pas une nouvelle campagne de 20 itérations.

La performance n'a pas été rejouée sur `96934a8` car les quatre archives exactes Node/Chromium/Firefox/WebKit exigées par la commande ne sont pas disponibles localement. Utiliser les caches extraits ou retélécharger silencieusement depuis un CDN aurait affaibli la provenance. Aucune nouvelle preuve de performance n'est donc revendiquée. L'ADR-0005 confirme explicitement qu'aucune extrapolation, VM ou absence locale de matériel ne peut promouvoir les classes.

## Preuve storage acquise sur le candidat exact

Les trois moteurs ont observé le même APFS de capacité 6 232 694 784 octets et errno `-28`/`ENOSPC` :

- Chromium : quota estimé 6 442 453 615 octets, inspection live disponible ;
- Firefox : quota estimé 623 269 478 octets, inspection live disponible ;
- WebKit : quota estimé 20 615 843 021 octets, inspection live indisponible jusqu'à relance.

Dans les trois cas, le staging public 16 Mio est refusé avant worker, l'état antérieur est retrouvé après libération et le même profil réussit ensuite. Les estimations très divergentes confirment qu'elles ne remplacent pas l'errno physique.

## OOM : critère non satisfait

Une preuve OOM recevable exige processus identifié, borne, watchdog, marqueur moteur/OS attribuable et reprise. Les campagnes actuelles ont bien watchdog/reprise et signaux explicites, mais `exitCode:null` + `SIGKILL`/`SIGABRT` décrit l'injection, pas une décision OOM du moteur ou de macOS. `RangeError`, refus `memory.grow`, fermeture de page ou crash ne sont pas surcrédités. Aucun essai global de saturation RAM n'est autorisé.

## Findings

### Blocking

1. `desktop-arm64-constrained-8gib` n'a aucune preuve physique recevable.
2. `desktop-arm64-mainstream-16gib` n'a aucune preuve physique recevable.
3. Aucun OOM réel du processus navigateur n'est attribuable sur les trois moteurs.

### Major

1. La matrice performance exacte de `96934a8` n'a pas été rejouée avec les archives obligatoires. La transitivité byte-identique préserve la référence historique, mais ne crée pas une preuve fraîche de ce commit.

### Minor

Aucun finding minor supplémentaire.

## Options de fermeture

1. maintenir **REJECT** et collecter les preuves communautaires #98/#99 ;
2. réduire explicitement et gouvernément la matrice supportée, sans prétendre supporter 8/16–24 Gio ;
3. obtenir un Mac physique dédié pour chaque classe et exécuter le protocole immuable.

Aucune option n'est choisie implicitement. VM, cgroup, `ulimit`, throttling ou extrapolation restent non promouvables.

## Verdict du rôle

**VERDICT: reject**

Le stockage `ENOSPC` local est fermé et la référence 32+ Gio reste valide, mais les deux classes produit et l'OOM processus manquent. Activation, support matériel, production et release restent rejetés.
