# Model Policy product phases — technical counter-review of `fbc12c0`

- **Candidate:** `fbc12c026f6cd9e358c3b2a229c19e3d99b01973`
- **Base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only technical review
- **Verdict:** **REJECT**

## Findings

### Blocking

None.

### Major

1. Canonical JSON and structured evidence bytes use non-fatal `TextDecoder` instances before duplicate scanning and `JSON.parse`. Invalid UTF-8 is replaced with U+FFFD and can satisfy permissive string fields; a staged-roadmap probe with byte `0xff` was rejected by a fatal decoder but returned zero checker failures (`apps/model-policy/tools/check-product-phases.ts:723-725,835-837,974-976,1219-1239`; `docs/apps/model-policy/phases.v1.schema.json:96-97`).

### Minor

1. Direct regressions cover one roadmap and top-level evidence/attestation/operational duplicates, but not all four schemas, nested objects, or the depth limit (`apps/model-policy/tools/check-product-phases.test.ts:574-598,717-730,855-875,992-1015`).

## Confirmed corrections

The decoded-name set and depth-64 pass reject literal, escaped-equivalent, and nested duplicate members before materialization without logging names or values. Read-only probes rejected duplicates independently in the roadmap and all four schemas, accepted valid grammar/repository JSON, and preserved all prior Unicode-value, timing, indexed-summary, blob/digest/role/operational/projection protections.

## Checks

- checker tests: 60 passed; coverage 96.49% functions and 92.59% lines;
- app suite: 147 passed, 2 intentional WASM skips;
- checker, typecheck, scoped Biome, and diff checks: clean;
- concurrent full gate reached 1,817 passes and 2 skips before three fixed-port relay failures; isolated relay rerun passed 5/5.

## Required remediation

Use fatal UTF-8 decoding for every canonical JSON byte buffer before raw scanning, structural parsing, and materialization. Add malformed-byte plus direct nested/schema/depth regressions. An explicit input-byte ceiling is recommended because depth alone does not bound total parsing work.

## Residual risks

Root-only Ajv ownership, heuristic marker recognition, and opaque reviewer identity remain documented non-blocking boundaries.
