# Gate B — fautes du host produit `bdee4d9`

Cette archive conserve la campagne qualification-only exécutée sur le host produit Notebook Core v2 exact, désactivé par défaut. Elle ne contient que la fixture publique déterministe.

## Cible immuable

- commit : `bdee4d95be030610e25cbd273787161e4ca982ed` ;
- arbre : `1f4b70bd84ac7b5162b30373d2e4ac15bdaf15be` ;
- base : `9d139cc8d8d47ceed4d9a0b1d775c22fcfaebd3a` ;
- intégration : PR #97, merge `02e295aafa5c4a2e70074821141c254b1af9e0f4` ;
- manifeste produit : `a4542b1995292b1bfa638e74e3db4f3089b9a4ae54c901f512d4628e527299b5` ;
- core produit : `be423962e3a889e792a69a1ab60b978bcbf5ae1102db74a68c70a9a1c65e5942` ;
- worker produit : `19054f4913ffc438159bb2345b17487dae82d75e3e0ba17212610f61c3cbeb9a` ;
- inventaire SHA-256 des sources changées : `d2edb78a0beeee9ab591ab1fdb6e80c1f7ea13c1cb4f9670abf5942ccb411e2a`.

## Résultat

`bun run qualify:notebook-product-host:faults` passe 6/6 sur Chromium `149.0.7827.55`, Firefox `151.0` et WebKit `26.5`.

Chaque moteur observe :

- `SIGKILL` pendant seal, sans téléchargement ni enregistrement partiel ;
- `SIGABRT` pendant restauration stagée, sans reçu partiel ;
- nettoyage du staging chiffré au redémarrage du même profil ;
- mauvais recovery refusé puis restauration valide avec workers neufs ;
- préflight sous le plancher et abort transactionnel IndexedDB injecté.

Le rapport [`CANDIDATE-INTEGRATION.md`](CANDIDATE-INTEGRATION.md), SHA-256 `8cc8295fb9ecd9a1346588e5f8fd3d3788fe8db575285c3e49c4dfe7d49feef4`, conclut **APPROVE** pour cette seule intégration qualification-only. Le journal [`QUALIFICATION.log`](QUALIFICATION.log), SHA-256 `d2a92aeb4921a4fa75b93fc3d4a1538c9f1f4e7112ac5cfd689cd2e691e17cdd`, ne contient aucun chemin personnel ni donnée utilisateur.

## Rapports bruts

| Moteur | Scénario | SHA-256 |
|---|---|---|
| Chromium | quota injecté | `287f7ffdaedccc6f03cd0fc871581d09be926d562bbc59371f1d607a94a58961` |
| Chromium | kill/crash | `e5e169cb1661bf48877e5a8cead7ed4677c306949dcbba4ea1088f92cc499ef2` |
| Firefox | quota injecté | `aeefbec9ac881487d77e701cc7ded9c8699a8fa40c53e0344a3441b5cb1cda54` |
| Firefox | kill/crash | `42879d79ea496eceb5a6b4b68571280a3569e29e31def65e155c66bc91f82015` |
| WebKit | quota injecté | `636adbbe9d8167f9b7c6b2d009e96eb31d87aa338f915f24fa7e9560870e5e9e` |
| WebKit | kill/crash | `9e2d31f14ce4382c33027a450faa4d3764578fbe450af3b60710673fbaca72a3` |

## Limites

Cette passe ne prouve ni OOM réel du processus navigateur, ni épuisement physique du stockage, ni effacement physique RAM/OS, ni classes 8/16–24 Gio. Les passes sécurité, cryptographie et vie privée du host exact restent séparées. Gate B, l'activation, les données utilisateur et la release restent **REJECT**.
