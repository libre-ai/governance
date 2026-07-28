# Model Policy product phases — technical counter-review of `72fe421`

- **Candidate:** `72fe4219d1fcb989b0d89ef2fcbd8b0b389167a1`
- **Base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only technical review
- **Verdict:** **REJECT**

## Findings

### Blocking

None.

### Major

1. Malformed roadmap/schema content is interpolated from parser and Ajv exceptions and then printed by the CLI. End-to-end staged-index probes returned an injected sensitive marker both as an unexpected JSON identifier and as an unknown schema format (`apps/model-policy/tools/check-product-phases.ts:437-443,1303-1331,1452-1454`).

### Minor

1. The byte ceiling is checked after `git cat-file` has already buffered each blob, so it bounds parser work but not memory (`apps/model-policy/tools/check-product-phases.ts:253-312,1195-1226`).
2. Tests omit exact-limit, per-artifact oversize, and empty/malformed evidence/attestation/operational JSON cases (`apps/model-policy/tools/check-product-phases.test.ts:604-623,771-827,931-990,1088-1155`).

## Confirmed corrections

Fatal UTF-8 decoding and the inclusive ceiling precede marker scan, duplicate parsing, and `JSON.parse` for every structured artifact and all five indexed plan/schema blobs. Probes accepted exactly 1,048,576 valid bytes, rejected 1,048,577, rejected malformed UTF-8 in all four schemas, and preserved duplicate/depth/timing/index/digest/role/projection protections.

## Checks

- checker tests: 71 passed; coverage 96.55% functions and 92.76% lines;
- app suite: 158 passed, 2 intentional WASM skips;
- checker, typecheck, scoped Biome, and diff gates: clean;
- concurrent full gate reached 1,828 passes and 2 skips before three fixed-port relay failures; isolated relay rerun passed 5/5.

## Required remediation

Replace untrusted parser/compiler error interpolation with stable non-content diagnostics and prove non-disclosure adversarially. Preflight immutable Git object sizes or use bounded streaming before allocation. Add exact-boundary, per-artifact oversize, and empty/malformed structured-artifact regressions.

## Residual risks

Root-only Ajv ownership, heuristic marker recognition, opaque reviewer identity, and fixed-port full-suite flakiness remain non-blocking residuals.
