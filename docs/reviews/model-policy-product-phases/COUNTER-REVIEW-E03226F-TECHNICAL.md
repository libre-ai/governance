# Model Policy product phases — technical counter-review of `e03226f`

- **Candidate:** `e03226fc4114244a0efd1de379e1cd51eb660443`
- **Base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only technical review
- **Verdict:** **REJECT**

## Findings

### Blocking

None.

### Major

1. The checker reads the roadmap and schemas from the mutable worktree before loading indexed phase/evidence blobs. A staged-invalid roadmap with a restored-valid unstaged copy passes (`apps/model-policy/tools/check-product-phases.ts:770-802,833-881`; existing drift tests cover phase documents only at `apps/model-policy/tools/check-product-phases.test.ts:516-544`).
2. The CLI secret gate scans a fixed extension set while operational evidence permits any extension. A canonical operational artifact containing a credential marker and email can exit clean (`tools/quality/check-secret-scan.ts:72-80`; `docs/apps/model-policy/evidence-record.v1.schema.json:325-337`; contradictory claim at `docs/apps/model-policy/EVIDENCE.md:38`).
3. Authorization, smoke, rollback, and incident artifacts are hashed but never parsed or semantically bound. Empty, denying, unrelated, or reused content can pass (`apps/model-policy/tools/check-product-phases.ts:721-765`; `docs/apps/model-policy/evidence-record.v1.schema.json:271-324`; `apps/model-policy/tools/check-product-phases.test.ts:667-677`).

### Minor

None independently of those major false-greens.

## Confirmed corrections

The gate-section source/current-index binding, service-window upper bound, deployment input binding, evidence/attestation same-buffer reads, role and digest checks, path/symlink/untracked defenses, projection rollback, direct dependency/lock state at this candidate, and app-local coverage command all reproduced successfully.

## Checks

- checker tests: 38 passed; 97.62% functions, 89.61% lines;
- phase checker: 8 phases, 60 gates;
- app suite: 124 passed, 2 intentional skips;
- typecheck, Biome, manifest, frozen lockfile, secret/PII tests, and diff hygiene: clean;
- one full-suite run hit transient fixed-port collisions; the isolated relay rerun passed;
- reviewed worktree: unchanged.

## Residual risks

Opaque reviewer identity and heuristic sensitive-marker detection remain human-controlled boundaries.
