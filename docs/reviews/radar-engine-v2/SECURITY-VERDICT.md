# Radar engine v2 — security promotion verdict

- **Role:** security
- **Review mode:** fresh isolated review-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Reviewed commit:** `8c86c55380c0b52ffae92f39632e957821a1852d`
- **Decision:** **REJECT** promotion from `candidate` to `locked`
- **Product implementation:** **NO-GO** until remediation, fresh Security and Architecture verdicts, and the human control milestone

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

Using qualified Bun `1.4.0-canary.1+57f349f63`:

- `bun run check:contracts`: passed; 71 catalog entries, 47 schema fixture pairs, 27 Radar parse cases, 8 evaluation cases and all 16 refusal codes;
- `bun run check:generated-contracts`: passed; 48 TypeScript projections;
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked`: passed WIT parsing;
- `cargo test -p libre-ai-contract-types --test schema_fixtures --locked`: passed all three schema tests;
- a separate Python implementation verified exact canonical bytes and domain-separated identities for seven parse successes/nine referenced items, both evaluation digests, and all 26 refusal-envelope shapes;
- a separate raw-fixture inventory searched every byte file for BOMs, invalid UTF-8, numeric/predefined entities and boundary families;
- a separate `wit-parser 0.253.0` probe resolved the `radar-engine` world to **three imports** and two exports;
- independent AJV probes accepted a 10,020-byte subscription URL, `https://user:password@example.org/feed`, and a public problem message containing a private URL, tenant-shaped identifier and hostile excerpt.

## Blocking findings

### SEC-BLK-001 — the resolved WIT world is not import-free

`contracts/wit/radar-engine-v2/world.wit:3-42` defines `types` separately and uses `contract-error` and `parse-limits` from the world. `wit-parser` places the interface and both named types in `World.imports`. The source gate at `tools/quality/check-contracts.ts:590-607` only rejects the literal `import` keyword, and the Rust test at `crates/ecosystem-engine/tests/wit_contracts.rs:20-24` only calls `push_dir`.

No network, filesystem, clock, storage or secret function is imported; these are type imports. The resolved surface still contradicts the exact import-free security claim and cannot support a gate asserting an empty component import map.

**Required remediation:** make resolved world imports empty, assert `World.imports.is_empty()` in Rust, and later scan the built component for zero WASI/runtime imports before implementation qualification.

### SEC-BLK-002 — hostile-input and exact-bound security behavior is not executable

The corpus has one vector per closed refusal code, but it does not cover the security families required by `docs/reviews/radar-engine-v2/SECURITY.md`. There is no dedicated vector for:

- accepted UTF-8 BOM, rejected UTF-16/32 BOM, malformed UTF-8 scalar sequences, valid/invalid XML numeric references, or each predefined XML entity;
- depth exhaustion through ignored XML, duplicate keys or invalid UTF-8 in either `evaluate-rules` input, and unknown/semantic-invalid rule fields beyond duplicate IDs;
- combined-invalid inputs proving preflight precedence between limits, source, body length, media type, encoding, DTD, entity, depth and item count;
- exact equality acceptance for input bytes, output bytes, item bytes, rule bytes, depth or item count;
- source-local content identity, tampered item identity/digest/source binding, URL/userinfo/IDNA/IPv6 edge cases, or no-partial-result behavior.

The only invalid-UTF-8 byte file is a truncated gzip header. Oversized evaluation fixtures prove ceiling+1, while no fixture proves the ceiling itself. `tools/quality/check-radar-v2-vectors.ts` validates hashes and expectations but does not execute a parser/evaluator, so an implementation with BOM, duplicate-key, precedence, equality, partial-output or canonicalization defects could satisfy the current corpus.

**Required remediation:** add bounded raw-byte and generated boundary vectors for every listed family, exact limit and limit+1, plus composite precedence and tampered semantic inputs. Extend the future conformance harness to execute the same corpus against every runtime without committing multi-megabyte duplicate fixtures.

### SEC-BLK-003 — the outer API permits credential-bearing/unbounded source values and caller-owned tenant metadata

`contracts/openapi/radar.v2.yaml:366-390` constrains subscription URLs only with `format: uri` and `^https?://`; it has no maximum and does not forbid userinfo. The locked fetch request and candidate export repeat equivalent unconstrained URL fields (`contracts/schemas/feed-fetch.v1.schema.json:37-57`; `contracts/schemas/curated-item-export.v2.schema.json:29-38`). The AJV probe accepted a 10,020-byte URL and a URL containing `user:password@`. Such values can cross preview, persistence, worker and export boundaries even though the pure engine later rejects userinfo in its canonical base URL.

The create-rule-set request directly accepts the storage/evaluation authority, including client-supplied `tenantId`, `id`, `version`, `status` and `createdAt` (`contracts/openapi/radar.v2.yaml:111-133`; `contracts/schemas/curation-rule-set.v2.schema.json:7-16`). The global authorization specification requires an authoritative request/resource tenant, but this command contract neither omits server-owned fields nor states a body/session equality rule.

**Required remediation:** introduce bounded command-input schemas, forbid URL userinfo, define finite URL/identifier limits, derive server-owned identity/version/status/time/tenant fields or explicitly require equality with the authoritative session, and add credential/tenant-mismatch negative vectors. DNS/IP/redirect SSRF checks must remain at the Bun fetch quarantine and be tested there rather than delegated to JSON Schema.

### SEC-BLK-004 — conforming public errors can echo private or hostile values

Every Radar API operation uses the shared `Problem` response. `contracts/schemas/problem-details.v1.schema.json:8-28` requires a free-form message of up to 512 characters and permits any syntactically matching reason code. The independent probe accepted a message containing a private feed URL, tenant-shaped identifier and hostile excerpt. Such a response conforms to OpenAPI while violating the Radar profile's no-URL/no-identifier/no-parser-diagnostic rule.

The WIT refusal itself is correctly closed, and corpus refusal expectations contain only `kind` and `code`; the leak is introduced by the unconstrained host mapping. No Radar-specific public error vectors prove static messages and zero input echo.

**Required remediation:** constrain Radar v2 public problems to the closed reason-code mapping and static content-free messages (or omit messages), then test every refusal with hostile URL, tenant, rule and parser values to prove byte-for-byte non-reflection. Do not change the locked shared v1 schema; narrow it locally in the candidate API/host profile.

## Non-blocking findings

- The malformed UTC rollover sentence recorded as `ARCH-BLK-002` is an existing cross-role blocker and also affects date-rule security tests; this Security verdict does not duplicate its remediation ownership.
- Nine successful HTTP responses lack schemas, as recorded by `ARCH-BLK-003`; until fixed, output minimization for preview/evidence/explanation/replay cannot be mechanically reviewed.

## Clean security axes

- The WIT error is a closed enum with no message or attacker-controlled field.
- All current refusal expectations contain only `kind` and `code`; no fixture expectation leaks tenant or hostile input.
- DTD/entity declarations are forbidden, external identifiers are never opened, and unknown syntax counts against byte/depth limits in the normative profile.
- HTML bodies/attachments and markup-bearing fields are omitted; retained strings remain explicitly untrusted text.
- Item identity is SHA-256 domain-separated and binds the authorized source ID; evaluation output omits tenant ID and binds exact canonical item/rule bytes.
- Cookie-authenticated mutations declare CSRF, idempotency and revision headers; internal fetch results require Biscuit bearer authentication.
- Candidate status, no-engine state, host-owned SSRF/authorization boundary and deployment NO-GO remain explicit.
- No dependency, service, infrastructure, secret, personal-data transfer or deployment is introduced by this review evidence.

## Residual risks and review boundary

- No Radar Rust/WASM implementation exists, so parser differential behavior, actual allocation/fuel limits, panic/trap redaction, component imports and zero-copy/no-partial-output behavior remain unreviewable.
- DNS rebinding, IP-range denial, redirect revalidation, compressed/decompressed byte ceilings, outbound TLS, raw-body disposal, operational logs, Biscuit/RLS tenant enforcement and UI escaping belong to later host implementation evidence.
- Architecture remains separately rejected; this verdict cannot promote any authority even after only Security findings are fixed.
- Any change to a reviewed authority or hash invalidates this verdict and requires a fresh Security pass.

## Explicit verdict

**REJECT** the Radar v2 Security promotion for commit `8c86c55380c0b52ffae92f39632e957821a1852d`. Keep every Radar v2 authority `candidate`, do not start product-engine implementation, and rerun Security after SEC-BLK-001 through SEC-BLK-004 are remediated with executable evidence.
