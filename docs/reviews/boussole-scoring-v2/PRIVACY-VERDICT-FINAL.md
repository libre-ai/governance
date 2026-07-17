# Privacy review — Boussole scoring v2 dossier

- **Role:** privacy
- **Review mode:** fresh isolated review-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Reviewed commit:** `e83e142f647ec9ab6478b7c1e9428950ea209561`
- **Reviewer:** `codex-cli:boussole-r6-privacy-eu:gpt-5.4`
- **reviewerSessionId:** `019f6ef7-c4c7-7ff3-af7e-9fec9ba35198`
- **Runtime:** `openai/gpt-5.4` via `CLI 0.142.4`
- **Author content under review:** `pi-coding-agent:gpt-5.4` / `pi-019f6b99-12ff-7430-8fba-d9724d408b35`
- **Decision:** **APPROVE-WITH-MINOR-RESERVATIONS**
- **Public scoring:** **NO-GO** until the remaining role verdicts, separate promotion pass, human control milestone, and fresh real-dataset privacy/legal approval are complete
- **Not legal advice:** this is a technical privacy review record, not legal advice

## Reviewed authorities and hashes

| Authority | SHA-256 |
| --- | --- |
| `contracts/schemas/public-vote-dataset.v2.schema.json` | `e43b79d3444d3fb8aa785f07c1b8a733e2009803ef29ccd51fdbbb88841419ec` |
| `contracts/schemas/boussole-method.v2.schema.json` | `2595aa22dd994882a5694bf49b350e6fd8a03fbd725416a0a393c97372abd893` |
| `contracts/schemas/boussole-response-set.v2.schema.json` | `f321841591dc534e0760a98d90688e3f396c64f4f52e0400f06f05a811018b1e` |
| `contracts/schemas/local-comparison.v2.schema.json` | `1b85bf05268124fb40dc2e06c4c780741bc46927f3048ccaa4fac6a203ef741b` |
| `contracts/wit/boussole-scoring-v2/SEMANTICS.md` | `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5` |
| `contracts/wit/boussole-scoring-v2/world.wit` | `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad` |
| `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` | `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335` |
| `contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json` | `267b7144e5c97fd8840dc40c0c87933000696547a959bbd246904e3af53fc8b6` |

## Evidence executed

- `bun tools/quality/check-boussole-v2-vectors.ts` → passed
- `bun tools/quality/check-contracts.ts` → passed
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked` → passed
- Rechecked immutable review dossier, schemas, semantics, WIT boundary, schema negatives, security/privacy vectors, and Boussole product specification
- Verified clean review-only condition relative to tracked files: no tracked edits in the pass; only untracked workspace artifacts were present

## Findings

### Blocking
- None

### Minor reservations
- [contracts/wit/boussole-scoring-v2/SEMANTICS.md:47](/private/tmp/libre-ai-boussole-r6-privacy/contracts/wit/boussole-scoring-v2/SEMANTICS.md:47) and [docs/apps/boussole.md:54](/private/tmp/libre-ai-boussole-r6-privacy/docs/apps/boussole.md:54) deliberately leave real wording semantics, real-source admissibility, and actual professional consent attestation to a fresh human release/privacy review on the exact dataset digest. That is correct for the candidate technical boundary, but it means no real dataset is privacy-cleared by contract alone.

## Privacy assessment

The candidate is technically adequate for the requested privacy gate.

- The dataset schema requires every statement to carry `subjectKind = public-policy-proposal` and `personTargeting = prohibited`; any other or missing value rejects at schema level [public-vote-dataset.v2.schema.json:173](/private/tmp/libre-ai-boussole-r6-privacy/contracts/schemas/public-vote-dataset.v2.schema.json:173).
- Publication is digest-bound and fail-closed: `minimumGroupSize >= 5`, `smallGroupAction = exclude-statement`, `identityExposure = prohibited`, aggregate-only or aggregated roll-call sources, and explicit review expiry are mandatory [public-vote-dataset.v2.schema.json:268](/private/tmp/libre-ai-boussole-r6-privacy/contracts/schemas/public-vote-dataset.v2.schema.json:268).
- Reviewer identities are opaque `rev_*` identifiers only; public attestations are constrained to HTTPS, SHA-256, `explicit-publication-consent`, and `professional-attestation-only` in both method and dataset approvals [public-vote-dataset.v2.schema.json:6](/private/tmp/libre-ai-boussole-r6-privacy/contracts/schemas/public-vote-dataset.v2.schema.json:6), [boussole-method.v2.schema.json:6](/private/tmp/libre-ai-boussole-r6-privacy/contracts/schemas/boussole-method.v2.schema.json:6).
- The semantics explicitly bind wording and declarations to the dataset digest; any wording change invalidates prior privacy approval and requires fresh attestation, while a real dataset review may only tighten thresholds or reject sources, never loosen them [SEMANTICS.md:43](/private/tmp/libre-ai-boussole-r6-privacy/contracts/wit/boussole-scoring-v2/SEMANTICS.md:43).
- The executable checker enforces distinct human reviewers, correct professional capacity, explicit-publication-consent, professional-only identity boundary, publication expiry, aggregation threshold, person-targeting rejection, stale approval on wording change with recomputed digest, and non-leakage of canary reviewer/response values [check-boussole-v2-vectors.ts:135](/private/tmp/libre-ai-boussole-r6-privacy/tools/quality/check-boussole-v2-vectors.ts:135), [check-boussole-v2-vectors.ts:715](/private/tmp/libre-ai-boussole-r6-privacy/tools/quality/check-boussole-v2-vectors.ts:715).
- The WIT boundary is capability-free and local-only: one exported API, zero imports, no network, storage, clock, randomness, identity, telemetry, cookie, or transfer capability [world.wit:29](/private/tmp/libre-ai-boussole-r6-privacy/contracts/wit/boussole-scoring-v2/world.wit:29), [wit_contracts.rs:32](/private/tmp/libre-ai-boussole-r6-privacy/crates/ecosystem-engine/tests/wit_contracts.rs:32).
- Product specification remains consistent with the privacy boundary: local-only responses/results, no API accepting responses, no server table, no analytics ID, no response transmission, and public scoring still release-disabled [docs/apps/boussole.md:33](/private/tmp/libre-ai-boussole-r6-privacy/docs/apps/boussole.md:33), [docs/apps/boussole.md:54](/private/tmp/libre-ai-boussole-r6-privacy/docs/apps/boussole.md:54), [docs/apps/boussole.md:77](/private/tmp/libre-ai-boussole-r6-privacy/docs/apps/boussole.md:77), [docs/apps/boussole.md:91](/private/tmp/libre-ai-boussole-r6-privacy/docs/apps/boussole.md:91).

## Residual risk boundary

This approval covers the technical privacy candidate only. It does not approve:
- any real dataset wording as substantively non-targeting,
- any real source as legally/privacy admissible for publication,
- any real professional identity/consent attestation beyond the contract shape and hash binding,
- public release.

## Explicit verdict

**APPROVE-WITH-MINOR-RESERVATIONS** for the exact commit and hashes above. The candidate technically enforces the privacy constraints requested, including public-policy subject requirement, prohibition of person targeting, digest-bound declarations/wording, stale-approval rejection on wording change, canary non-leakage, aggregation floor/exclusion/identity prohibition/aggregated roll-call/expiry, opaque reviewers, and local-only capability-free operation.

**Public NO-GO remains in force** until a fresh human France/EU privacy/legal review approves the exact real dataset and attestation set, alongside the remaining required role-separated verdicts and promotion controls.