# Boussole scoring v2 — security review record

- **Role:** security
- **Review mode:** fresh isolated review-only pass under [AGENT-REVIEW-PROTOCOL.md](/private/tmp/libre-ai-boussole-r6-security/docs/reviews/AGENT-REVIEW-PROTOCOL.md:1)
- **Reviewed commit:** `e83e142f647ec9ab6478b7c1e9428950ea209561`
- **Decision:** **APPROVE WITH MINOR RESERVATIONS**
- **Candidate/public scoring:** retain `candidate`; public scoring remains **NO-GO**
- **Files modified during pass:** none

## Attribution

- `reviewPassId=boussole-v2-e83e142-security-final`
- `reviewerAgentId=codex-cli:boussole-r6-security:gpt-5.4`
- `reviewerSessionId=019f6ef7-c4c3-7402-a904-68d56f779711`
- provider `openai`
- model `gpt-5.4`
- client `CLI 0.142.4`
- author content `pi-coding-agent:gpt-5.4`
- author session `pi-019f6b99-12ff-7430-8fba-d9724d408b35`

No reviewed authority was modified during this pass.

## Reviewed authorities and hashes

| Authority | SHA-256 |
| --- | --- |
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` |
| `contracts/schemas/boussole-method.v2.schema.json` | `2595aa22dd994882a5694bf49b350e6fd8a03fbd725416a0a393c97372abd893` |
| `contracts/schemas/public-vote-dataset.v2.schema.json` | `e43b79d3444d3fb8aa785f07c1b8a733e2009803ef29ccd51fdbbb88841419ec` |
| `contracts/schemas/boussole-response-set.v2.schema.json` | `f321841591dc534e0760a98d90688e3f396c64f4f52e0400f06f05a811018b1e` |
| `contracts/schemas/local-comparison.v2.schema.json` | `1b85bf05268124fb40dc2e06c4c780741bc46927f3048ccaa4fac6a203ef741b` |
| `contracts/schemas/engine-golden-vectors.v1.schema.json` | `cf1a61a5f0e6c9d5c35a869adfa2a3d464c2550f28572735934e02a884cec463` |
| `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` | `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335` |
| `contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json` | `267b7144e5c97fd8840dc40c0c87933000696547a959bbd246904e3af53fc8b6` |
| `contracts/wit/boussole-scoring-v2/world.wit` | `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad` |
| `contracts/wit/boussole-scoring-v2/SEMANTICS.md` | `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5` |
| `tools/quality/check-boussole-v2-vectors.ts` | `807505ac20772289035f3b818899b26bcaca97cf39766249bbf41b85fb25757e` |
| `contracts/catalog.v1.json` | `f202986063f034f39406513be4c54cad4e05822e26b38cc4508cba0ca5337cd3` |

## Supporting evidence

- [docs/apps/boussole.md](/private/tmp/libre-ai-boussole-r6-security/docs/apps/boussole.md:54) — `70512269d66b4377daae37c1b9a448710c5ec939aa02aa9f2f68dcb4fa0bca2c`
- [docs/reviews/boussole-scoring-v2/README.md](/private/tmp/libre-ai-boussole-r6-security/docs/reviews/boussole-scoring-v2/README.md:1)
- [docs/reviews/boussole-scoring-v2/SECURITY-REMEDIATION.md](/private/tmp/libre-ai-boussole-r6-security/docs/reviews/boussole-scoring-v2/SECURITY-REMEDIATION.md:1)

## Evidence executed

- `bun tools/quality/check-boussole-v2-vectors.ts`  
  Result: `Boussole vectors verified: 10 methodology cases, 8 raw refusals, 8 resource boundaries, 11 semantic refusals, 1 generated maximum-arithmetic case; public scoring still candidate-only`
- `bun tools/quality/check-contracts.ts`  
  Result: `Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations`
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked`  
  Result: `test canonical_wit_worlds_parse_and_resolve ... ok`

## Revalidated security points

- **Resolved WIT imports closed:** the world exports one `api` interface and resolved imports are empty [world.wit](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/world.wit:3), [wit_contracts.rs](/private/tmp/libre-ai-boussole-r6-security/crates/ecosystem-engine/tests/wit_contracts.rs:30).
- **Raw decoder refusals closed:** BOM, invalid UTF-8, duplicate keys, unpaired surrogate, invalid number, malformed JSON, unknown field, and depth overflow are executable and hash-bound [security-vectors.v1.json](/private/tmp/libre-ai-boussole-r6-security/contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json:1), [check-boussole-v2-vectors.ts](/private/tmp/libre-ai-boussole-r6-security/tools/quality/check-boussole-v2-vectors.ts:582).
- **Resource ceilings closed:** exact and `+1` checks exist for dataset/method/responses/output byte budgets [SEMANTICS.md](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/SEMANTICS.md:19), [check-boussole-v2-vectors.ts](/private/tmp/libre-ai-boussole-r6-security/tools/quality/check-boussole-v2-vectors.ts:636).
- **Closed refusal coverage complete:** all eight refusal codes are covered and asserted [world.wit](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/world.wit:4), [check-boussole-v2-vectors.ts](/private/tmp/libre-ai-boussole-r6-security/tools/quality/check-boussole-v2-vectors.ts:982).
- **Calendar classification closed:** invalid Gregorian UTC seconds return `computed-at-invalid` [SEMANTICS.md](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/SEMANTICS.md:28), [check-boussole-v2-vectors.ts](/private/tmp/libre-ai-boussole-r6-security/tools/quality/check-boussole-v2-vectors.ts:767).
- **Declared person targeting rejected:** `personTargeting != prohibited` fails closed as `input-invalid` [SEMANTICS.md](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/SEMANTICS.md:46), [check-boussole-v2-vectors.ts](/private/tmp/libre-ai-boussole-r6-security/tools/quality/check-boussole-v2-vectors.ts:812).
- **Wording mutation with recomputed digest but stale approvals rejected:** wording is dataset-digest-bound and stale approvals return `approval-invalid` [SEMANTICS.md](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/SEMANTICS.md:50), [check-boussole-v2-vectors.ts](/private/tmp/libre-ai-boussole-r6-security/tools/quality/check-boussole-v2-vectors.ts:821).
- **Canary redaction closed:** refusal payloads do not leak reviewer IDs or private response canaries [SEMANTICS.md](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/SEMANTICS.md:36), [check-boussole-v2-vectors.ts](/private/tmp/libre-ai-boussole-r6-security/tools/quality/check-boussole-v2-vectors.ts:751).
- **Wide arithmetic closed at contract level:** executable maximum case proves six-decimal scaled numerator beyond `u64` and compatible with checked wide arithmetic [SEMANTICS.md](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/SEMANTICS.md:89), [check-boussole-v2-vectors.ts](/private/tmp/libre-ai-boussole-r6-security/tools/quality/check-boussole-v2-vectors.ts:873).
- **Attestations/threshold/expiry/catalog closed:** distinct opaque reviewers, professional attestation boundary, minimum group floor `>= 5`, review expiry, and dual vector binding in catalog all hold [SEMANTICS.md](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/SEMANTICS.md:15), [SEMANTICS.md](/private/tmp/libre-ai-boussole-r6-security/contracts/wit/boussole-scoring-v2/SEMANTICS.md:43), [catalog.v1.json](/private/tmp/libre-ai-boussole-r6-security/contracts/catalog.v1.json:801).

## Findings

### Minor reservation

- [SECURITY-REMEDIATION.md](/private/tmp/libre-ai-boussole-r6-security/docs/reviews/boussole-scoring-v2/SECURITY-REMEDIATION.md:22) remains stale as a promotion packet for `e83e142`: it still records pre-merge hashes for `security-vectors`, `SEMANTICS.md`, and `check-boussole-v2-vectors.ts`, and leaves the exact commit unspecified. It is useful historical evidence, but not sufficient as the current hash-bound security record.

### Blocking findings

- None.

## Clean axes

- No new secret, token, telemetry, external service, network capability, clock, storage, identity lookup, or logging capability appears in the reviewed authority set.
- Public scoring remains explicitly disabled while the catalog entry stays `candidate` [catalog.v1.json](/private/tmp/libre-ai-boussole-r6-security/contracts/catalog.v1.json:808).
- Security evidence is executable, bounded, and reproducible from the current commit.

## Residual risks and review boundary

- There is still no Boussole Rust/WASM product component. Built-component import scanning, trap/panic behavior, fuel/time limits, runtime memory behavior, browser zero-transmission proof, and release-caller attestation verification remain outside this protocol-only pass.
- This verdict does not approve architecture, privacy, methodology, promotion, product implementation, release enablement, or public scoring.
- Any normative change to the reviewed authorities or hashes invalidates this record and requires a fresh security pass.

## Explicit verdict

**APPROVE WITH MINOR RESERVATIONS** the Boussole v2 security role for commit `e83e142f647ec9ab6478b7c1e9428950ea209561`.

Keep all affected catalog entries as `candidate`, keep public scoring disabled, and do not treat this record as promotion approval. The only reservation is dossier hygiene: the current security record must bind to the exact hashes above rather than the stale pre-merge hash list in `SECURITY-REMEDIATION.md`.