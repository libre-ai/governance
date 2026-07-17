# Candidate-integration rejection — ae455b9

- Verdict: `reject`
- Immutable target: `ae455b9875b03b78dbb0a9d1dcfcb9c566754808`
- Review pass: `engine-envelope-v1-integration-ae455b9-r15`
- Agent/provider/model: `codex` / `openai` / `GPT-5 Codex`
- Session: not exposed by the review harness
- Issue control record: `https://github.com/libre-ai/libre-ai/issues/25#issuecomment-5002463124`
- Raw reviewer-output SHA-256: `c1ee7c17bb4ebe7cef39319e12a42c6a59c9681e54d3272a64a1022a3d4ee110`
- Effect: the Architecture/Security approvals on `ae455b9` are retained as audit history but are invalid for promotion

## Verbatim reviewer output

**Findings**

- `blocking` [check-contracts.ts](/private/tmp/libre-ai-engine-envelope-integration-r3/tools/quality/check-contracts.ts:243): `collapseSensitiveEncodingNesting` ne couvre pas les chaînes HTML imbriquées mixtes avec plusieurs `&` successifs. La regex actuelle collapse `&amp;#64` et `&amp#38#64`, mais pas des formes comme `alice&amp;&#64example.org`, `alice&#38;&commat;example.org` ou `alice&amp;&#38;&#64example.org`. Après `decodeSensitiveMarkers` ([lignes 252-286](/private/tmp/libre-ai-engine-envelope-integration-r3/tools/quality/check-contracts.ts:252)), ces entrées deviennent `alice&@example.org` ou `alice&&@example.org`, donc l’email n’est plus détecté. C’est un faux négatif sur l’objectif explicite “reject arbitrary amp/numeric/named HTML nesting”.
- `warning` [REMEDIATION.md](/private/tmp/libre-ai-engine-envelope-integration-r3/docs/reviews/specialized-engine-v2/REMEDIATION.md:38): la doc affirme un collapse linéaire des chaînes HTML imbriquées et des self-tests couvrant ce cas, mais la table de tests ([check-contracts.ts](/private/tmp/libre-ai-engine-envelope-integration-r3/tools/quality/check-contracts.ts:620)) ne couvre que des cas homogènes (`&amp;amp...`, `&amp#38#38...`) et manque précisément les mélanges `amp`/numeric/named qui contournent l’implémentation.

**Record**

- `reviewPassId`: `engine-envelope-v1-integration-ae455b9-r15`
- `mode`: `candidate-integration`
- `target`: `ae455b9875b03b78dbb0a9d1dcfcb9c566754808`
- `base`: `3ec2f2eec8c2e11bd35fdab18aa438eb8534951f`
- `reviewedAt`: `2026-07-17`
- `agent`: `codex`
- `provider`: `openai`
- `model`: `GPT-5 Codex`
- `session`: non exposé par ce harness
- `scope`: candidate-integration uniquement, pas une approbation de rôle ni de promotion
- `verdict`: `reject`

**Evidence**

- `git status --short --branch`: propre, `## HEAD (no branch)`
- `bun run check`: vert
- `cargo test --workspace --locked`: vert
- `cargo clippy --workspace --all-targets --locked -- -D warnings`: vert
- `cargo fmt --check --all`: vert
- Fuzz/canary éphémère: reproduction du faux négatif ci-dessus confirmée sur `ae455b9`
- Hashes revérifiés:
  - `tools/quality/check-contracts.ts` `0913343b4ceda381484486b91b0efbbb95b521cc0a61c913a416000aad083ffa`
  - `contracts/fixtures/schema-fixtures.v1.json` `fe1f1a274747a2f7393cb4763e23d71d913bf0be883add6cde2d4501af9d7d28`
  - `contracts/schemas/engine-golden-vectors.v1.schema.json` `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
  - `docs/reviews/specialized-engine-v2/REMEDIATION.md` `16d75da1a1eff9e595dfa809579f1fc7b932080dcc611913cee09a4b198644c5`
  - `docs/reviews/specialized-engine-v2/README.md` `d2bf66a807c9f2bbef9c15fbd53a8aff69b1556d0b93932c5c63875aa28f6c2d`

**Risques résiduels**

Le coût observé sur les canaries ciblés reste linéaire et faible, donc je n’ai pas de signal ReDoS ici. Le problème est de correction: une famille d’encodages HTML mixtes contourne encore la détection sensible, ce qui invalide l’intégration candidate malgré toutes les gates Bun/Rust vertes.