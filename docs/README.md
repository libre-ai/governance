# Carte d'autorité documentaire

Un sujet = une autorité unique (vague 0, ADR-0009). Tout autre document sur le même sujet est explicatif, historique ou de l'évidence — jamais une seconde autorité.

| Sujet                             | Autorité unique                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| Vision durable                    | `vision.md` (raccourci, sans état courant)                                               |
| Doctrine (invariants)             | `docs/decisions/INVARIANTS.md` — ce qui n'y figure pas n'est pas doctrine                |
| Décisions                         | `docs/adr/` (ligne Arbitrage obligatoire dès 0008)                                       |
| Architecture cible                | `docs/architecture/TARGET.md` (détail : `DETAILED-TARGET.md`, `TOOLCHAIN.md`)            |
| Phase et avancement               | `GOALS.md` + `STATUS.md`                                                                 |
| Séquencement post-G2              | `docs/transformation/EXECUTION-SEQUENCING.md`                                            |
| Topologie publique et expositions | `ecosystem/repositories.v1.yaml`                                                         |
| Noms cibles et glossaire produit  | `docs/decisions/LEXICON.md` (autorité dès la signature propriétaire ; proposed d'ici là) |
| Contrats                          | `contracts/` (catalogue et autorités verrouillées)                                       |
| Spécifications verrouillées       | `docs/specifications/`                                                                   |
| Historique des repositories       | `ecosystem/LEGACY-MANIFEST.yaml`                                                         |
| Programme de la refondation       | `docs/transformation/` (`BIG-BANG.md`, `PROGRAM.md`, `REPOSITORY-MAP.md`)                |
| Preuves                           | `docs/reviews/` et `distribution/evidence/` — **explicitement non normatives**           |

Règle de lecture pour agents : charger d'abord `INVARIANTS.md`, classer ensuite tout le reste. Un document daté, bannerisé ou rangé sous « preuves » ne définit jamais l'état courant.

```
docs/
├── adr/             décisions datées et arbitrées
├── architecture/    cible actuelle (+ détail, toolchain)
├── decisions/       invariants (doctrine) et registre des décisions
├── reviews/         preuves immuables, non normatives
├── specifications/  standards et locks G1
└── transformation/  refondation : programme, manifests, séquencement
```
