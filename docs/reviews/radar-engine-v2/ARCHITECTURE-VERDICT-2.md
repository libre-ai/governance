# Radar engine v2 — Architecture promotion verdict 2

- **Review pass:** `radar-architecture-rereview-bbe6c96`
- **Role:** architecture
- **Mode:** dedicated review-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Reviewed commit:** `bbe6c96651430f0a5dc0f6008e69487aead0cd41`
- **Decision:** **APPROVE** the Architecture dimension of candidate promotion
- **Implementation:** **NO-GO** until Security approval and the human control milestone

No reviewed authority was modified during this pass. This verdict supersedes `ARCHITECTURE-VERDICT.md` only for the exact hashes below; the earlier rejection remains immutable audit evidence.

## Reviewed authorities and hashes

| Authority | SHA-256 |
| --- | --- |
| `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json` | `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365` |
| `contracts/fixtures/radar-engine-v2/security-vectors.v1.json` | `a092dabcd81afdac4eaeb57aafc4bf9c26cec89aa514f05e48e56bfe1b0804a6` |
| `contracts/wit/radar-engine-v2/world.wit` | `0fbb69be39f265e44feb77ce054fcece052cff38ff0eacd3353f9f8d50bd8073` |
| `contracts/wit/radar-engine-v2/PROFILE.md` | `41de764dafb0e0778c7f7a338400b587ad980669879ff51bf5afe6514f3a434c` |
| `contracts/schemas/radar-normalized-item.v1.schema.json` | `644da2a61008dcc87a73eed78250596d30444c218f325c8cbb2832e722eff10b` |
| `contracts/schemas/radar-normalized-feed.v1.schema.json` | `dc95132e8bd79cffdd5caeedbd49876fbdd977256eaca2ef90aada0d43758e68` |
| `contracts/schemas/radar-rule-evaluation.v1.schema.json` | `ae08eb81187c78f0616c715ac3c7fc758590b24468ac579dbe25211285da9116` |
| `contracts/schemas/curation-rule-set.v2.schema.json` | `0a8de8db43ab4c3daffd23a7fb5f1c0d004b2e18f4c8009c0b7d1f90c9e514d8` |
| `contracts/schemas/curated-item-export.v2.schema.json` | `f55f65c8d121dfbef781bce0732d76020725f392825fc68ba3421625a88aa422` |
| `contracts/openapi/radar.v2.yaml` | `2eb98ace057c7c3a786068926371bda5ad414aa04b75e4b231a521f971806012` |
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` |

## Evidence executed

Using qualified Bun `1.4.0-canary.1+57f349f63`:

- `bun run check:contracts`: passed; 71 catalog entries, 47 schema fixture pairs, 43 Radar parse cases, 16 evaluation cases, 18 generated boundaries and 16 closed refusal codes;
- `bun run check:generated-contracts`: passed; 48 TypeScript projections;
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked -- --nocapture`: passed and asserted zero resolved imports plus exactly `parse-feed` and `evaluate-rules` in the exported `api` interface;
- `cargo test -p libre-ai-contract-types --test schema_fixtures --locked -- --nocapture`: passed all three schema tests;
- an independent Python pass recomputed all eight `contractFiles` hashes, required case inventories and the UTC/content-identity/operator-matrix expectations;
- an independent OpenAPI inventory found zero successful non-204 response without a schema and six of six path parameters finitely constrained;
- Radar v1 was compared with the pre-candidate baseline and remains byte-identical.

## Previous finding closure

- **ARCH-BLK-001 closed:** `wit-parser 0.253.0` resolves the Radar world with zero imports. The world exports one `api` interface containing exactly the two pure operations; the Rust gate enforces both properties.
- **ARCH-BLK-002 closed:** the profile now rejects UTC conversions outside the inclusive year range 0001–9999. `utc-year-rollover-becomes-null` covers both lower and upper rollover.
- **ARCH-BLK-003 closed:** every successful HTTP response has a schema, every path identifier is bounded, command inputs omit server-owned tenant/state/time fields, and export strings/identifiers are finitely bounded. The contract gate enforces these properties.

## Findings

- **Blocking:** none.
- **Major:** none.
- **Minor:** none.
- **Non-blocking:** none within the preimplementation Architecture contract.

## Clean architecture axes

- Radar v1 remains unchanged; v2 uses distinct major-versioned WIT/API authorities.
- Fetch, decompression, DNS/IP/redirect SSRF, authorization, persistence, scheduling, retention and UI remain Bun/host responsibilities.
- Source-local identity, first-source deduplication, ordering, JCS/SHA-256 domains, rule precedence and default rejection are deterministic and vector-bound.
- The golden index binds WIT, profile, engine schemas, export schema and OpenAPI; the second index binds exact resource ceilings and public refusal mappings.
- Candidate status remains unchanged; no engine, dependency, service, personal-data transfer, infrastructure or deployment is introduced.

## Residual risks and scope

- No Radar Rust/WASM engine exists. Parser differentials, memory/fuel, trap behavior, built-component imports and cross-runtime Unicode/URL/JCS conformance remain implementation gates.
- The 18 generated boundary descriptors must be executed against the future engine; their current role is to freeze exact contract expectations without committing duplicate multi-megabyte blobs.
- HTTP fetch quarantine, tenant Biscuit/RLS enforcement and public UI rendering require separate host evidence.
- Any normative authority/hash change invalidates this approval and requires a fresh Architecture pass.

## Explicit verdict

**APPROVE** the Radar v2 Architecture role for commit `bbe6c96651430f0a5dc0f6008e69487aead0cd41` and the exact hashes above. Keep Radar v2 `candidate` and product implementation disabled until the Security role and human control milestone pass.
