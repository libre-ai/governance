# Radar engine v2 — architecture promotion verdict

- **Role:** architecture
- **Review mode:** isolated review-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Reviewed commit:** `81e4118fe3451b87484ee4540f29c24f027e43f9`
- **Decision:** **REJECT** promotion from `candidate` to `locked`
- **Product implementation:** **NO-GO** until remediation, fresh Architecture and Security verdicts, and the human control milestone

No reviewed authority was modified during this pass.

## Reviewed authorities and hashes

| Authority | SHA-256 |
| --- | --- |
| `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json` | `4e41d9805fa1c9531182616b13b492b398d70585e13dde03af5b73334de04f43` |
| `contracts/wit/radar-engine-v2/world.wit` | `6540991c05f16704fa9987245db8b7f8db575dc8fbd9a7981dcf72f4a8e195ae` |
| `contracts/wit/radar-engine-v2/PROFILE.md` | `12ca237dee5dda12bed6e5d2af0dc1b49658a7870edaab3a146ae2884ef6b489` |
| `contracts/schemas/radar-normalized-item.v1.schema.json` | `644da2a61008dcc87a73eed78250596d30444c218f325c8cbb2832e722eff10b` |
| `contracts/schemas/radar-normalized-feed.v1.schema.json` | `dc95132e8bd79cffdd5caeedbd49876fbdd977256eaca2ef90aada0d43758e68` |
| `contracts/schemas/radar-rule-evaluation.v1.schema.json` | `ae08eb81187c78f0616c715ac3c7fc758590b24468ac579dbe25211285da9116` |
| `contracts/schemas/curation-rule-set.v2.schema.json` | `0a8de8db43ab4c3daffd23a7fb5f1c0d004b2e18f4c8009c0b7d1f90c9e514d8` |
| `contracts/schemas/curated-item-export.v2.schema.json` | `336076fa44343db64ecc84592edad0a82c28a6eccc615861dec181f7daef31bb` |
| `contracts/openapi/radar.v2.yaml` | `1e6c7548cf6bd2f3cd8faa002c98608101c2bbbc94581cf54e2bece79e3a9670` |
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` |
| `contracts/schemas/feed-fetch.v1.schema.json` | `187b32216df63f07f50f40cd98d1b76502bb7191f43914e9bb1eec8995e6f045` |
| `contracts/schemas/problem-details.v1.schema.json` | `fd21f1545f09493fe43d71952848b235d7c739ef1013916dc28cd380edab87b9` |

## Evidence executed

Using the qualified Bun revision `1.4.0-canary.1+57f349f63`:

- `bun run check:contracts`: passed; 71 catalog entries, 47 schema fixture pairs, 27 Radar parse cases, 8 evaluation cases and all 16 refusal codes;
- `bun run check:generated-contracts`: passed; 48 TypeScript projections;
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts -- --nocapture`: passed one WIT syntax/resolution test;
- `cargo test -p libre-ai-contract-types --test schema_fixtures -- --nocapture`: passed three schema fixture tests;
- a separate Ruby inventory recomputed 58 referenced fixture/contract SHA-256 values and matched the 16 WIT refusal variants to the corpus;
- a separate `wit-parser 0.253.0` probe resolved the `radar-engine` world to **three imports** and two exports;
- a separate OpenAPI inventory found nine successful non-204 responses with descriptions but no response content/schema;
- the Radar v1 WIT blob was compared with the first parent preceding candidate integration and is byte-identical (`28474b2d93b537fb91931d151caa029ededbdc8c`).

## Blocking findings

### ARCH-BLK-001 — the resolved WIT world is not import-free

`contracts/wit/radar-engine-v2/world.wit:3-42` defines records and the refusal enum in a separate `types` interface, then uses those types from the world. `wit-parser` resolves this as three world imports: the `types` interface, `contract-error`, and `parse-limits`. The world has two function exports, but its import map is not empty.

These are type imports rather than network or storage functions, so no concrete ambient capability was found. They nevertheless contradict the dossier's exact “no host import” boundary and prevent an implementation gate from asserting an empty component import surface. The current repository test only proves that WIT parses; it does not inspect resolved imports.

**Required remediation:** represent the API so the resolved world imports are empty, add a Rust assertion over `World.imports`, and retain the two pure operations in the exported API. A future built component must also be checked for an empty runtime/WASI import surface.

### ARCH-BLK-002 — UTC conversion has an incomplete normative rule

`contracts/wit/radar-engine-v2/PROFILE.md:178-181` says: “If UTC conversion would leave the date is invalid.” The object/range that conversion must not leave is missing. Inputs near years 0001 and 9999 can cross a year boundary after applying an offset, so independent implementations can either reject, clamp, wrap, or emit a non-four-digit year while each claiming to follow the remaining text.

**Required remediation:** state the exact allowed UTC output range (including behavior when offset conversion crosses it) and add lower/upper rollover vectors. Recompute the profile and vector hashes, then rerun both role reviews.

### ARCH-BLK-003 — the candidate HTTP/export authority is not a closed bounded contract

The dossier and catalog place `radar-api-v2` and `curated-item-export-v2` under this Architecture gate, but the HTTP authority leaves successful payloads unspecified for nine operations, including preview, activation, replay scheduling/comparison, fetch scheduling/result/evidence, explanation, and export scheduling (`contracts/openapi/radar.v2.yaml:149-285`). Four path identifiers are unconstrained strings. The export schema allows up to 10,000 items while `sourceUrl` has no maximum and its URN references have no local maximum (`contracts/schemas/curated-item-export.v2.schema.json:12-38`; `contracts/schemas/common.v1.schema.json:14-17`).

Consequently clients cannot validate several successful responses and the claimed bounded v2 authority has no finite schema-derived maximum for an export. This is inherited from the locked v1 API, but v2 is a distinct candidate and cannot be promoted merely by copying the incompleteness.

**Required remediation:** define strict success envelopes for every non-empty response, bound all path identifiers and export strings locally without changing the locked common/v1 authorities, and add schema/OpenAPI checks that fail when a success response lacks a declared shape or a candidate export is unbounded.

## Non-blocking findings

### ARCH-NB-001 — deterministic text is broader than executable success coverage

The profile specifies all field/operator pairs, source-local identity fallbacks, limit equality, date rollover, and URL forms, but the success corpus exercises only a subset. Before implementation qualification, add table-driven cases for scalar/array `equals`, `contains`, `prefix`, strict `before`/`after`, content-derived identity, equality-at-limit, and UTC lower/upper boundaries. This does not by itself create a textual implementation choice beyond ARCH-BLK-002, but it weakens cross-runtime conformance evidence.

### ARCH-NB-002 — the vector index does not bind every authority in the dossier

The vector `contractFiles` section binds the WIT/profile and four engine schemas, but not the OpenAPI, export schema, or transitive common schemas. The exact reviewed commit still pins them, so review traceability is preserved. A future envelope should include every authority promoted by the same verdict to make hash invalidation mechanical.

## Clean architecture axes

- Radar v1 is byte-identical to the locked baseline and v2 uses distinct major-versioned paths and schema identifiers.
- All affected v2 catalog entries remain `candidate / pending-independent-review`; this verdict does not mutate status.
- The engine contract contains no fetch, persistence, tenant authorization, scheduling, clock, random, filesystem, secret, provider, or database operation.
- The profile explicitly assigns HTTP fetch/decompression/SSRF, authorization, persistence, retention, and public error mapping to Bun.
- Item identity is source-scoped and domain-separated; rule ordering, default rejection, JCS and SHA-256 bindings are explicit.
- No dependency, service, infrastructure, personal-data processing, deployment, or sovereignty change is introduced by this review evidence.

## Residual risks and review boundary

- No Radar Rust/WASM engine exists, so parser differentials, memory growth, fuel/time controls, panic/trap behavior, component imports, and cross-runtime Unicode/URL/JCS conformance remain unreviewable implementation gates.
- Fetch quarantine, redirects, DNS/IP SSRF controls, compressed-body limits, tenant Biscuit/RLS enforcement, retention, and UI text rendering remain host responsibilities and require their own evidence.
- Security has a distinct required pass; this Architecture rejection is not a Security verdict.
- Any change to a reviewed authority or hash invalidates this verdict and requires a fresh Architecture pass.

## Explicit verdict

**REJECT** the Radar v2 Architecture promotion for commit `81e4118fe3451b87484ee4540f29c24f027e43f9`. Keep every Radar v2 authority `candidate`, do not start product-engine implementation, and rerun the Architecture role after ARCH-BLK-001 through ARCH-BLK-003 are remediated with executable evidence.
