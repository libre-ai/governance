# Revue Gate A — ARCHITECTURE

- **Rôle :** architecture uniquement ; passe fraîche, review-only, sans avis cryptographique ni vie privée.
- **Commit exact :** `be17f27f5dec71457aca1aedb3100865900a14e1`
- **Arbre Git :** `7ca22b9fa03998e5e4503b7b598bc1f1943384b8`
- **Dossier sécurité :** `a36bda9df0afdcceeb41c41292f10d3e0b566afa`
- **Propreté :** `git status --porcelain=v1 --untracked-files=all`, `git diff --quiet` et `git diff --cached --quiet` vides avant/après. Connectivité Git valide ; des objets dangling locaux préexistants sont signalés par `git fsck`.

## Empreintes SHA-256

| Artefact | SHA-256 |
|---|---|
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `c129c58f3c5938fe884b64267b129be41e33941b11ee635d647a2c3181fe85f2` |
| `contracts/schemas/context-document.v2.schema.json` | `fe030c2642076588289f5da7814cb44bbff75e7684f487c0c7e4c230e25be455` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `3d25b790c357e8fd27f5bb3759f3217a3db3eb38dcba5980de5ea82ecbb15841` |

Les quatre copies de revue (WIT, deux schémas backup, golden) sont byte-identiques aux autorités sous `contracts/`. Le catalogue conserve les quatre autorités Notebook v2 en `candidate` / `pending-independent-review`, avec les rôles requis.

## Commandes et preuves

- Vérification commit, arbre, propreté, connectivité et SHA-256 : succès.
- `bun run check:contracts` : succès ; vecteurs Notebook structurels **10 backup + 10 Context**.
- `bun run check:notebook-core-v2-candidate` : succès ; interface `api` unique, sans import/capacité WIT, copies identiques, golden unique.
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts` : succès ; parsing/résolution des 9 mondes WIT.
- Compatibilité v1/v2 : conforme à ADR-0003 et `MIGRATION.md` : major v2, aucun adaptateur v1→v2, v1 historique hors implémentation.
- Commandes non qualifiantes, explicitement rouges : `bun run check:toolchain` échoue avec Bun `1.3.11` au lieu du canary épinglé ; `bun run check:generated-contracts` échoue faute de `node_modules/.bin/biome`.

## Constats blocking

Aucun.

## Constats major

1. **A-01 — Domaine numérique de `ContextDocument` non fermé avant JCS.**
   `revision` n’a qu’un minimum dans `context-document.v2.schema.json`, sans maximum ni règle de rejet des lexèmes non représentables de façon inter-runtime. Un document valide au schéma avec `revision: 9007199254740993` est sérialisé `9007199254740992` après `JSON.parse`/`JSON.stringify` Bun, mais reste `9007199254740993` avec le parseur Python. Or `revision` entre dans le JCS de sortie et donc dans le digest.
   **Correction requise :** borner explicitement les entiers à un domaine interopérable, définir le refus des nombres hors domaine avant normalisation, et ajouter vecteurs positifs/négatifs couvrant limites, exponentiation et arrondi.

2. **A-02 — Bornes structurelles de Context insuffisantes pour une conformité déterministe.**
   La limite brute de 22 370 044 octets ne borne ni la profondeur du JSON imbriqué `application/json`, ni un budget explicite de nœuds/arêtes du graphe. Le schéma permet jusqu’à 1 000 blocs × 1 000 liens ; un JSON imbriqué valide peut atteindre une profondeur pathologique. `resource-limit-exceeded` ne définit qu’une allocation impossible, pas une frontière déterministe d’acceptation/refus. Les 10 refus Context ne couvrent pas ces limites.
   **Correction requise :** fixer profondeur, nombre total d’arêtes/nœuds et comportement de refus ; ajouter des vecteurs aux bornes et au-delà.

## Constats minor

Aucun.

## Risques résiduels

- L’absence effective d’imports au niveau composant WASM, ainsi que la conformité runtime/host, restent à vérifier en Gate B.
- La chaîne complète de génération n’a pas été reproduite dans cet environnement non qualifié.
- Ce verdict ne vaut ni jalon humain, ni verrouillage, ni Gate B, ni release ; il n’approuve aucun autre rôle.

REJECT
