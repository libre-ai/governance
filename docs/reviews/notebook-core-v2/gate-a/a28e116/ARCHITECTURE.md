# Revue Gate A — ARCHITECTURE — Notebook Core v2

## Identité / indépendance

- `authorAgentId` : `openai-codex/gpt-5.6-sol`
- `authorSessionId` : `019f6b98-4265-7011-8b0e-0091ebba360a`
- `reviewerAgentId` : `openai-codex/gpt-5.4`
- `reviewerSessionId` : `14290fbc-0116-442e-ae71-413972a2d245`
- reviewer provider / modèle : `openai-codex` / `gpt-5.4`

Indépendance vérifiée : `reviewerAgentId != authorAgentId`, `reviewerSessionId != authorSessionId`, passe fraîche, strictement review-only, sur le commit immuable demandé, sans réutilisation d’un verdict historique.

## Portée

Lecture intégrale et revue des artefacts demandés : `AGENTS.md`, `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, ADR-0003, entrées Notebook du catalogue (`contracts/CATALOG.md`, `contracts/catalog.v1.json`), `contracts/wit/notebook-core-v2/world.wit`, `contracts/wit/notebook-core-v2/SEMANTICS.md`, les trois schémas v2, le golden unique, les deux checkers Notebook, les projections générées ciblées, `docs/security/notebook-core-v2-review/*`, et tous les rapports historiques Gate A sous `docs/reviews/notebook-core-v2/gate-a/`.

## Commit / arbre / empreintes

- commit revu : `a28e116b0a3ebf278412650715e03f7050c0aac0`
- arbre Git : `cda41e7f9cc620a87ee0488caa06141614fb5b93`
- arbre `docs/security/notebook-core-v2-review` : `56010a4e25653b84cea7e97859911a5c1f1567f8`
- propreté : `git status --short` vide
- `git fsck --no-dangling --no-progress` : OK

Empreintes SHA-256 vérifiées :

| Artefact | SHA-256 | Résultat |
| --- | --- | --- |
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` | conforme attendu |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` | conforme attendu |
| `contracts/schemas/context-document.v2.schema.json` | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` | conforme attendu |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` | OK |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` | OK |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` | conforme attendu |

Copies de revue byte-identiques confirmées par `cmp` pour :
- `docs/security/notebook-core-v2-review/world.wit`
- `docs/security/notebook-core-v2-review/notebook-backup-seal-request.v2.schema.json`
- `docs/security/notebook-core-v2-review/notebook-backup.v2.schema.json`
- `docs/security/notebook-core-v2-review/notebook-core-v2.golden.json`

## Commandes et preuves

```bash
git rev-parse HEAD
git rev-parse HEAD^{tree}
git rev-parse HEAD:docs/security/notebook-core-v2-review
git status --short
git fsck --no-dangling --no-progress
shasum -a 256 ...
cmp -s ...
```

```bash
NODE_PATH=/tmp/libre-ai-notebook-gate-a2-remediation/node_modules \
PATH=/Users/ifi6567/Documents/libre-ai/libre-ai/.tools/bun/1.4.0-canary.1:$PATH \
bun run check:toolchain
# OK

... bun run check:notebook-core-v2-candidate
# OK
# "10 backup and 12 context mutations, 6 replayable resource boundaries, one recovery profile"

... bun run check:contracts
# OK
# "Notebook vectors structurally verified: 10 backup and 12 context mutations"

cargo test -p libre-ai-ecosystem-engine --test wit_contracts
# OK
```

Preuves architecturales vérifiées :

1. **Frontière WIT export-only, sans capacité hôte**
   - `contracts/wit/notebook-core-v2/world.wit:3-58` : une seule interface `api`, aucun `import`, monde `export api` uniquement, enum d’erreurs fermée.
   - `contracts/wit/notebook-core-v2/SEMANTICS.md:9,183` : justification explicite de l’interface autonome et report légitime du scan module/composant réel à Gate B.

2. **Autorité unique / copies**
   - `docs/security/notebook-core-v2-review/README.md` désigne `contracts/wit/notebook-core-v2/SEMANTICS.md` comme dossier normatif unique.
   - Les 4 copies de revue exigées sont byte-identiques aux autorités sous `contracts/`.

3. **Compatibilité / major v2**
   - `docs/adr/0003-wp-g2-s01-contract-amendment.md` et `contracts/COMPATIBILITY.md` justifient le major v2 et l’absence d’adaptateur v1→v2.
   - `contracts/catalog.v1.json` maintient `context-document-v2`, `notebook-backup-seal-request-v2`, `notebook-backup-v2`, `notebook-core-v2` en `candidate` / `pending-independent-agent-review` avec rôles requis corrects.

4. **Déterminisme Context v2**
   - `SEMANTICS.md:23-31` ferme le remappage export-scoped, le tri `rootBlockIds` / `links` / `blocks by id`, le digest, le domaine numérique binary64, les budgets profondeur/nœuds/liens.
   - `context-document.v2.schema.json:7-54` interdit désormais `revision` et `excludedBlockIds`, impose des IDs export-scoped `blk_[a-f0-9]{32}`.
   - `packages/contracts/src/generated/manifest.json` porte les mêmes SHA de schéma ; `packages/contracts/src/generated/context-document.v2.d.ts` n’expose ni `revision` ni `excludedBlockIds`.

5. **Cas limites réellement matérialisables et liés par SHA-256**
   - `tools/quality/check-notebook-core-v2-candidate.ts:282-1048` matérialise les 6 cas `libre-ai.context-resource-fixture.v1`, mesure dimensions et vérifie `inputCanonicalSha256` / `canonicalOutputSha256`.
   - Reproduction indépendante en lecture seule via `python3` : 6/6 cas matérialisés, longueurs et SHA-256 concordants.
   - Recalcul indépendant du golden Context : `totalBytes=52`, digest `a61760...0575`, pas de `revision`, pas de `excludedBlockIds`, arrondi RFC 8785 `333333333.3333333`.

6. **Recovery unique**
   - `SEMANTICS.md:72` : seul profil `libre-ai.recovery-secret-code.v1`.
   - Golden : `recoverySecretCodeProfile` unique ; absence de `recoverySecretTextProfile`.
   - Checkers : assertion explicite de cette absence.

Note de reproduction :
- `bun run check:generated-contracts` échoue localement faute de `node_modules/.bin/biome`. Ce n’est pas un défaut démontré du commit ; la cohérence des projections ciblées a été contrôlée en lecture seule via `manifest.json`, SHA-256 et contenu des `.d.ts`.

## Constats blocking

1. Aucun constat blocking ouvert.

## Constats major

1. Aucun constat major ouvert.

## Constats minor

1. Aucun constat minor ouvert sur l’architecture contractuelle revue.

## Risques résiduels

1. Relèvent légitimement de **Gate B**, pas de cette Gate A architecture :
   - scan des imports réels du module/composant WASM ;
   - absence d’imports WASI à l’artefact construit ;
   - zéroïsation effective, OOM/panic, timings anti-oracle, CSPRNG host réel ;
   - absence réelle de persistance/log/réseau sur moteur+host implémentés.

2. Le présent verdict ne vaut **aucun autre rôle**, **aucune autorisation propriétaire**, **aucun verrouillage**, **aucune Gate B** et **aucune release**.

APPROVE
