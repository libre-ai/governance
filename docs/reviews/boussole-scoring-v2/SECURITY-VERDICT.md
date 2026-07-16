# Boussole scoring v2 — security promotion verdict

- **Role:** security
- **Review mode:** fresh isolated review-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Reviewed commit:** `1d701a2236dc76c2c0a7fc8b0f0cde38462696c5`
- **Decision:** **REJECT** promotion
- **Candidate/public scoring:** retain `candidate`; public scoring remains **NO-GO**

No reviewed authority was modified during this pass.

## Reviewed authorities and hashes

| Authority | SHA-256 |
| --- | --- |
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` |
| `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` | `c6742b5a52691942fdea921712b3a0984efc8a3e1f33c8456d182de50270b232` |
| `contracts/schemas/boussole-method.v2.schema.json` | `7539d5f9ca19065a1887a6141656561e72a3b2656e8128687035943cd332a86c` |
| `contracts/schemas/public-vote-dataset.v2.schema.json` | `83f5ce0e3737efd5cdc01f94bc78862888cd462bcd0b33c8eea2965288e631cb` |
| `contracts/schemas/boussole-response-set.v2.schema.json` | `47c94b59a49da8f4a255c5024a33288670ae1a5e70bc30a26511b50f9ad3298d` |
| `contracts/schemas/local-comparison.v2.schema.json` | `c759c3b8776bcb00a928c80feaf81afabc35e3bc0fb01812c12430da1fecf959` |
| `contracts/schemas/engine-golden-vectors.v1.schema.json` | `cf1a61a5f0e6c9d5c35a869adfa2a3d464c2550f28572735934e02a884cec463` |
| `contracts/wit/boussole-scoring-v2/SEMANTICS.md` | `2c9c309788f9696ad0ff2325118d11e7fff07337c67fba09ac10f703a3e0794e` |
| `contracts/wit/boussole-scoring-v2/world.wit` | `c7128cd25042bd683bd54c1542ebd4cab00066bd9da2303c70bf655ae6a7e38f` |

## Evidence executed

- `bun tools/quality/check-boussole-v2-vectors.ts`: passed, ten executable cases.
- `bun tools/quality/check-contracts.ts`: passed, 71 catalog entries and 47 schema fixture pairs.
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts --locked`: passed WIT parsing.
- A separate Python exact-rational implementation reproduced all ten outputs/refusals and all embedded method, dataset and response-set digests.
- A separate `wit-parser 0.253.0` probe resolved the `boussole-scoring` world to **two imports** and one export: the `types` interface plus `contract-error` type are imported by `use types.{contract-error}`.
- An independent corpus inventory found only three of eight closed refusal codes in executable vectors: `approval-invalid`, `denominator-zero`, and `response-invalid`.
- An isolated copy of the reference checker, with a derived `computedAt = "2025-02-30T12:00:00Z"` probe, reported `input-invalid` instead of the declared `computed-at-invalid`.
- Maximum-domain arithmetic analysis found `21_474_836_475_000_000_000` for the six-decimal scaled score numerator, which exceeds `u64::MAX`; an implementation therefore needs the specified checked/wide arithmetic, but no current vector exercises that boundary.

## Blocking findings

### SEC-BLK-001 — the resolved WIT world is not import-free

`contracts/wit/boussole-scoring-v2/world.wit:3-23` defines `contract-error` in a separate interface and then uses it from the world. `wit-parser` places both that interface and type in `World.imports`. The source gate at `tools/quality/check-contracts.ts:604-605` only searches for the literal `import` keyword, so it reports success while the resolved world has imports.

This does not currently expose network or storage functions, but it contradicts the capability-free boundary claim and prevents evidence of an empty component import surface. No built component exists yet to provide a compensating binary import scan.

**Required remediation:** make the resolved world import list empty, for example by exporting one interface that owns both types and `compare`; assert `World.imports.is_empty()` in the Rust gate; later scan the built component imports and execute it without WASI.

### SEC-BLK-002 — security refusals and resource limits are not executable evidence

The closed WIT enum has eight codes, while the required vector set at `tools/quality/check-boussole-v2-vectors.ts:346-357` exercises only three error codes. There is no executable evidence for:

- malformed UTF-8, BOM, duplicate JSON keys, malformed JSON or unknown fields;
- the 8 MiB / 64 KiB / 256 KiB input ceilings or 512 KiB output ceiling;
- `input-invalid`, `digest-mismatch`, `method-unsupported`, `computed-at-invalid`, or `resource-limit-exceeded`;
- duplicate statements/responses and every ID/digest mismatch edge;
- maximum vote totals and the wide-arithmetic path whose scaled numerator exceeds 64 bits;
- refusal redaction proving that private responses, source text and reviewer IDs never enter diagnostics.

The current checker begins from already parsed JavaScript objects (`tools/quality/check-boussole-v2-vectors.ts:371-396`), so it cannot prove raw-byte boundary behavior. An implementation that omits byte limits, accepts duplicate keys, overflows a 64-bit rounding intermediate or leaks diagnostics could still pass all ten vectors.

**Required remediation:** add bounded raw-byte/security vectors and a harness that tests every refusal family, exact ceiling and ceiling+1, duplicate-key/UTF-8/BOM rejection, duplicate/reference mismatches, redacted errors, and maximum arithmetic. Keep corpus generation bounded so oversized fixtures are synthesized rather than committed as multi-megabyte blobs.

### SEC-BLK-003 — invalid calendar timestamps map to the wrong refusal

`tools/quality/check-boussole-v2-vectors.ts:161-167` checks only the timestamp shape. `2025-02-30T12:00:00Z` matches that regular expression, reaches output validation, and is returned as `input-invalid`; the WIT and semantics declare `computed-at-invalid` for this boundary.

**Required remediation:** perform strict UTC Gregorian-seconds validation before evaluation, return `computed-at-invalid` for every syntactically or calendrically invalid value, and add leap-day plus invalid-day vectors.

## Non-blocking findings

None. The three findings above block the security role.

## Clean axes

- No secret, credential, external service, telemetry, network API or new dependency was found in the reviewed authority set.
- The successful vectors use exact rational arithmetic and remain deterministic.
- Method/dataset approvals are hash-bound, human-only and reviewer-distinct in the reference evaluator.
- Candidate status and public-scoring NO-GO remain explicit in the catalog, dossier and application specification.

## Residual risks and review boundary

- There is no Boussole Rust/WASM component yet; memory growth, panic/trap behavior, fuel/timeout handling, actual component imports and zero-transmission browser evidence remain unreviewable until the separately authorized implementation milestone.
- Dataset provenance, licence, wording and methodological representativeness are outside this security verdict.
- Local-response privacy and France/EU compliance require their distinct role verdict.
- Any change to a reviewed authority or hash invalidates this verdict and requires a fresh security pass.

## Explicit verdict

**REJECT** the Boussole v2 security promotion for commit `1d701a2236dc76c2c0a7fc8b0f0cde38462696c5`. Retain all affected catalog entries as `candidate`, keep public scoring disabled, and rerun security review after SEC-BLK-001 through SEC-BLK-003 are remediated with executable evidence.
