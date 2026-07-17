# Review Record

- `reviewPassId`: `engine-envelope-v1-architecture-9b376cf-r1`
- `role`: `architecture`
- `mode`: `specialized-role-review`
- `subject`: `GitHub gate #25 — shared schema contracts/schemas/engine-golden-vectors.v1.schema.json`
- `targetSha`: `9b376cf65755f7556866123f9fddf681a709a2f0`
- `agent`: `codex`
- `provider`: `openai`
- `model`: `gpt-5.4`
- `session`: `019f6f0e-a086-7642-bbf8-bdbcf8336bce`

## Scope Conclusion

- La frontière réelle du schéma partagé est bien `internal`, `major-versioned`, candidate, et cataloguée séparément des WIT moteurs: [contracts/catalog.v1.json](/private/tmp/libre-ai-engine-envelope-architecture/contracts/catalog.v1.json:706).
- Cette enveloppe ne remplace pas la sémantique normative des moteurs: Radar reste normé par `PROFILE.md`, Policy/Notebook/Boussole par leurs profils `SEMANTICS.md`, et chaque checker exécute ses attentes contre un corpus figé, non réécrit par une implémentation.
- Aucun usage runtime produit n’a été trouvé. Les seules références effectives hors dossier sont le catalogue, le fixture de schéma, le checker Boussole et la projection générée non utilisée.
- Couplage inter-moteurs: Radar, Notebook et Policy portent un `schemaVersion` moteur-spécifique contrôlé par leurs checkers; Boussole seul utilise l’enveloppe partagée.

## Findings

- `blocking`: none
- `major`: none
- `minor`:
  - `ARCH-MIN-001` — la liaison auto-descriptive `shared-envelope -> world/profile` n’est pas exécutablement fermée pour Boussole. Le schéma partagé n’exige que `schemaVersion` et laisse `world`, `status` et la structure métier optionnels ou non typés: [contracts/schemas/engine-golden-vectors.v1.schema.json](/private/tmp/libre-ai-engine-envelope-architecture/contracts/schemas/engine-golden-vectors.v1.schema.json:7). Le corpus Boussole porte bien `world: "boussole-scoring-v2"` et un `status` explicite: [contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json](/private/tmp/libre-ai-engine-envelope-architecture/contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json:2). Mais le checker Boussole ne valide que `schemaVersion` et le nombre de cas, pas `world`/`status`/`semantics`: [tools/quality/check-boussole-v2-vectors.ts](/private/tmp/libre-ai-engine-envelope-architecture/tools/quality/check-boussole-v2-vectors.ts:497). Le gate contractuel ne fait que vérifier l’existence des `vectors`/`profiles` déclarés, sans cohérence sémantique entre eux: [tools/quality/check-contracts.ts](/private/tmp/libre-ai-engine-envelope-architecture/tools/quality/check-contracts.ts:288).
- `non-blocking`:
  - `ARCH-NB-001` — la projection générée du schéma partagé reste volontairement très large (`unknown` sur tous les payloads), donc sans valeur de sûreté si elle était un jour importée comme type applicatif: [packages/contracts/src/generated/engine-golden-vectors.v1.d.ts](/private/tmp/libre-ai-engine-envelope-architecture/packages/contracts/src/generated/engine-golden-vectors.v1.d.ts:7). Ce n’est pas exploité aujourd’hui.

## Residual Risks

- Un futur moteur qui réutiliserait l’enveloppe partagée sans checker dédié pourrait hériter de la même faiblesse de couplage `world/profile`.
- Le statut `internal`/test-only est respecté à ce commit, mais la projection TypeScript large ne doit pas devenir une frontière produit implicite.

## Independent Evidence

- `git status --short --branch` before: `## HEAD (no branch)`
- `git rev-parse HEAD`: `9b376cf65755f7556866123f9fddf681a709a2f0`
- `git show --stat --oneline --decorate=short --no-patch 9b376cf65755f7556866123f9fddf681a709a2f0`: `9b376cf (HEAD, origin/main, origin/HEAD, main) Merge pull request #52 from libre-ai/review/boussole-v2-roles-e83e142`
- `bun run check:contracts`: passed; includes `check-contracts`, Radar vectors, Notebook vectors, Policy v1/v2 vectors, Boussole vectors
- `bun tools/quality/check-boussole-v2-vectors.ts`: passed
- `bun tools/quality/check-notebook-core-v2-candidate.ts`: passed
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked`: passed (`1 passed`)
- `cargo test -p libre-ai-contract-types --test schema_fixtures --locked`: passed (`3 passed`)
- `git status --short --branch` after: `## HEAD (no branch)`

## Recomputed SHA-256

- `contracts/schemas/engine-golden-vectors.v1.schema.json` `cf1a61a5f0e6c9d5c35a869adfa2a3d464c2550f28572735934e02a884cec463`
- `contracts/catalog.v1.json` `f202986063f034f39406513be4c54cad4e05822e26b38cc4508cba0ca5337cd3`
- `contracts/fixtures/schema-fixtures.v1.json` `cf414a604f07a427aed99c60ad3910a4627456439f13cf25bbfbfa3037f48cf3`
- `docs/reviews/specialized-engine-v2/README.md` `746d0a421fb34d40123a415ef220a407125402a66aa370ed50db89ec3c9d64b2`
- `docs/reviews/AGENT-REVIEW-PROTOCOL.md` `9e91b78c30a2ba82d20a7fe78d8bf4a2878ffa8c28046e3a44748d29b448a43f`
- `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`
- `contracts/wit/boussole-scoring-v2/SEMANTICS.md` `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5`
- `contracts/wit/boussole-scoring-v2/world.wit` `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad`
- `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json` `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`
- `contracts/wit/radar-engine-v2/PROFILE.md` `41de764dafb0e0778c7f7a338400b587ad980669879ff51bf5afe6514f3a434c`
- `contracts/wit/radar-engine-v2/world.wit` `0fbb69be39f265e44feb77ce054fcece052cff38ff0eacd3353f9f8d50bd8073`
- `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`
- `contracts/wit/notebook-core-v2/SEMANTICS.md` `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b`
- `contracts/wit/notebook-core-v2/world.wit` `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295`
- `contracts/fixtures/policy-core-v2/golden.json` `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`
- `contracts/fixtures/policy-core-v2/resource-budgets.v1.json` `6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77`
- `contracts/wit/policy-core-v2/SEMANTICS.md` `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc`
- `contracts/wit/policy-core-v2/world.wit` `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4`
- `tools/quality/check-boussole-v2-vectors.ts` `807505ac20772289035f3b818899b26bcaca97cf39766249bbf41b85fb25757e`
- `tools/quality/check-radar-v2-vectors.ts` `beca199ab0bb55bf482b23bfa05fea36f71eba4768547f185de55f8165f4ff11`
- `tools/quality/check-notebook-v2-vectors.ts` `e7dc3113e2374e396de5f12743c41dafe27b17b6d5caad59a7abbc27f7e03299`
- `tools/quality/check-notebook-core-v2-candidate.ts` `0c74c6539a0cdae9608e2d6cd82da62712af6226de3b79d22396d4b001b95c6f`
- `tools/quality/check-policy-core-v2-vectors.ts` `2f13011a3c0c755ec42e17a2a8405a2c3ed8282c082fcb4ab9762d57a9dab7f8`
- `tools/quality/check-contracts.ts` `ae722425aa33f36163ae3796ea80913909fda3c8773c281f770e31fec6b896cf`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` `b30bbd87e031440786031d98b15e38559e64026e085e56db5df4bb9cb6a99a52`

## Verdict

`approve-with-minor-reservations`