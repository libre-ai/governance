# Radar engine v2 — Security promotion verdict 2

- **Review pass:** `radar-security-rereview-bbe6c96`
- **Role:** security
- **Mode:** dedicated review-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Reviewed commit:** `bbe6c96651430f0a5dc0f6008e69487aead0cd41`
- **Decision:** **APPROVE** the Security dimension of candidate promotion
- **Implementation:** **NO-GO** until the human control milestone

No reviewed authority was modified during this pass. This verdict supersedes `SECURITY-VERDICT.md` only for the exact hashes below; the earlier rejection remains immutable audit evidence.

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
| `contracts/schemas/feed-fetch.v1.schema.json` | `187b32216df63f07f50f40cd98d1b76502bb7191f43914e9bb1eec8995e6f045` |
| `contracts/schemas/problem-details.v1.schema.json` | `fd21f1545f09493fe43d71952848b235d7c739ef1013916dc28cd380edab87b9` |

## Evidence executed

Using qualified Bun `1.4.0-canary.1+57f349f63`:

- `bun run check:contracts`: passed; 43 parse cases, 16 evaluation cases, 18 generated boundaries and all 16 component refusal codes;
- `bun run audit`: no known JavaScript vulnerability;
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked -- --nocapture`: passed and asserted zero resolved WIT imports plus exactly two exported operations;
- `cargo test -p libre-ai-contract-types --test schema_fixtures --locked -- --nocapture`: passed all three schema/non-reflection tests;
- an independent raw-byte inventory recomputed all input/output hashes, verified BOM/invalid UTF-8 canaries, all refusal envelopes, HTML suppression and all 16 refusal codes;
- independent AJV probes rejected URL userinfo, overlong/scheme-invalid subscription URLs, caller-supplied tenant/identity/version/status/time fields, export userinfo, private error messages, unknown public codes and tenant-shaped request IDs;
- an independent OpenAPI inventory resolved all 17 non-success responses to the local `RadarProblem`, with static `Request refused` and a 21-code closed enum;
- an independent export walk found every local string finite and confirmed bounded userinfo-free source URLs;
- independent checks covered source/body/media/encoding and DTD/entity precedence plus exact input/output equality fixtures.

## Previous finding closure

- **SEC-BLK-001 closed:** `wit-parser 0.253.0` resolves zero imports. The Rust gate inspects `World.imports`, the one exported interface and both operation names.
- **SEC-BLK-002 closed for the preimplementation contract:** raw vectors now cover UTF BOMs, invalid UTF-8, XML references, ignored-field depth, duplicate keys in both evaluation inputs, unknown/tampered semantics, content identity, UTC rollover, refusal precedence, exact equality cases and no-partial-result semantics. The security index freezes 18 exact/over generated boundaries for future runtime execution.
- **SEC-BLK-003 closed:** HTTP and export URLs are finite and reject userinfo; identifiers are finite; `RuleSetInput` and `FetchScheduleInput` reject server-owned tenant/identity/version/status/time fields; DNS/IP/redirect SSRF remains explicitly host-owned.
- **SEC-BLK-004 closed:** every Radar error response uses a local closed `RadarProblem`; its message is the exact static value `Request refused`, its request ID is constrained, and its reason code is one of 21 closed host/component codes. Component refusals still contain only their enum.

## Findings

- **Blocking:** none.
- **Major:** none.
- **Minor:** none.

### Non-blocking observations

1. Query-bearing feed URLs are valid and may contain confidential tokens. A future host must classify complete source URLs as confidential, redact them from logs/traces/errors, protect persistence and avoid exposing them outside the authorized tenant. This is a host data-handling gate, not a capability of the pure component.
2. The 18 maximum-size boundary descriptors cannot execute against a parser/evaluator because no Radar engine exists. The implementation conformance harness must materialize and run each exact/+1 case before any product enablement.

## Clean security axes

- The component contract has no network, DNS, file, clock, randomness, environment, storage, secret or tenant capability.
- Inputs are already-decompressed bytes; the component neither follows nor fetches any URL.
- DTDs/entity declarations fail closed, unknown structures consume budgets, candidate items count before deduplication and refusals expose no partial output.
- HTML bodies/attachments and markup-bearing constructs are suppressed; all retained text remains classified untrusted.
- Identity is domain-separated SHA-256 and binds the authorized source ID. Evaluation binds exact canonical item/rule bytes and omits tenant ID.
- Cookie mutations retain CSRF/idempotency/revision requirements; internal fetch operations retain Biscuit bearer authentication.
- No dependency, engine, service, personal-data transfer, infrastructure or deployment is introduced by this verdict.

## Residual risks and required implementation gates

- Qualify parser differentials, Unicode 15.1, URL/IDNA/IPv6, RFC 8785, allocation/fuel, panic/trap redaction, zero-copy/no-partial-output and built-component import scans against every runtime.
- Qualify compressed/decompressed byte ceilings, DNS rebinding, private/special IP denial, redirect revalidation, outbound TLS and raw-body disposal in the Bun fetch quarantine.
- Qualify Biscuit/RLS tenant enforcement, storage encryption/retention, URL/log redaction and UI text escaping in their host boundaries.
- Any normative authority/hash change invalidates this approval and requires a fresh Security pass.

## Explicit verdict

**APPROVE** the Radar v2 Security role for commit `bbe6c96651430f0a5dc0f6008e69487aead0cd41` and the exact hashes above. Keep Radar v2 `candidate` and product implementation disabled until the human control milestone explicitly authorizes the next stage.
