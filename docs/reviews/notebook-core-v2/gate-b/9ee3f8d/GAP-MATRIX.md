# Gate B — matrice exigence / preuve / verdict

| Exigence | Preuve finale | Verdict |
|---|---|---|
| autorités v2 inchangées | WIT/golden hashés, checker Gate A vert | satisfait |
| core import-free / SIMD128 / plafond 512 Mio | double build reproductible + inspecteur | satisfait |
| limite plaintext 16 Mio et budgets inchangés | contrats, profils et rapports finaux | satisfait |
| host produit exact fermé par défaut | build désactivé sans assets ; build Gate B lié à `9ee3f8d` | satisfait |
| opérations worker/instance jetables | E2E 7/7 + host/faults 6/6 | satisfait |
| terminaison/crash et reprise | faults produit 6/6, aucun partiel, même profil, worker neuf | satisfait |
| OOM/fautes internes | `memory.grow`, alloc 600 Mio, failpoints, panic/traps/timeouts | satisfait |
| OOM processus navigateur | diagnostic Chromium non promouvable ; facultatif selon ADR-0007 | observation future |
| quota et stockage physique | refus quota + vrai APFS `ENOSPC` et reprise 3/3 | satisfait |
| RSS attribuable | verrou cache global, preflight, somme du chemin épinglé, teardown | satisfait |
| performance producteur/maximal | trois moteurs, 20 itérations, `qualification-budgets-pass` | satisfait |
| classe physique 32+ Gio | 38 654 705 664 octets, 14 CPU, physical-evidence | satisfaite |
| classes 8/16–24 Gio | issues #98/#99, contributions facultatives, aucun support annoncé | nice to have |
| réseau/PII | origines externes bloquées, fixtures publiques, scans propres | satisfait |
| bootstrap hors ligne | archives/exécutables hashés, HOME/cache vierges | satisfait |
| architecture-host | revue `approve` | satisfait |
| security | revue `approve` | satisfait |
| cryptography-runtime | revue `approve` | satisfait |
| privacy-france-eu | revue `approve` | satisfait |
| performance-resource-classes | revue `approve` | satisfait |
| Gate B globale | synthèse review-only sans blocker/major/minor | **APPROVE** |

## Hors portée après Gate B

Activation, données utilisateur, production, release, infrastructure, offline/Service Worker, support sous 32 Gio, autres OS/architectures, modèle blocs/révisions, import atomique, suppression et effacement physique conservent leurs propres contrôles.
