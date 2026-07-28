# Model Policy product phases — technical counter-review of `7bfd688`

- **Candidate:** `7bfd68863970cbd3c06fcfe497add5545e78ff3f`
- **Base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only technical review
- **Verdict:** **REJECT**

## Findings

### Blocking

None.

### Major

1. Raw scanning does not decode Unicode escapes, while `JSON.parse` discards earlier duplicate object members before decoded traversal. A digest-correct record can therefore place an escaped sensitive marker in the first occurrence and a safe final value in the second; neither scan sees the discarded value (`apps/model-policy/tools/check-product-phases.ts:291-323,601-620,707-726,840-859`; security claim at `docs/apps/model-policy/EVIDENCE.md:38`).

### Minor

None.

## Confirmed corrections

- Deployment authorization is strictly earlier than `windowStartedAt`, with equality/outside/postdate/predate regressions (`apps/model-policy/tools/check-product-phases.ts:649-669`; `apps/model-policy/tools/check-product-phases.test.ts:928-952,1041-1111`).
- CLI counts derive solely from the validated indexed roadmap under staged-valid/unstaged-divergent content (`apps/model-policy/tools/check-product-phases.ts:1005-1123,1220-1249`; `apps/model-policy/tools/check-product-phases.test.ts:606-624`).
- Prior index/blob/schema/gate-digest/source binding, review-role, operational, path/TOCTOU, projection, and coverage protections remain effective.

## Checks

- checker tests: 55 passed; coverage 97.92% functions and 91.16% lines;
- app suite: 142 passed, 2 intentional WASM skips;
- checker, typecheck, manifests, licences, and diff checks: clean;
- concurrent full check reached 1,812 passes and 2 skips before three fixed-port relay failures; isolated relay rerun passed 5/5.

## Required remediation

Reject duplicate JSON member names before materialization, or scan every decoded string token through a duplicate-aware parser. Add adversarial cases for evidence records, review attestations, and operational artifacts.

## Residual risks

Root-only pinned Ajv declarations remain an integrator-owned non-blocking dependency residual. Opaque reviewer identity and heuristic marker coverage remain documented human-controlled boundaries.
