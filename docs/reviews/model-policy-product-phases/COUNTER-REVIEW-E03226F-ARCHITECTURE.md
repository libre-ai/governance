# Model Policy product phases — architecture counter-review of `e03226f`

- **Candidate:** `e03226fc4114244a0efd1de379e1cd51eb660443`
- **Base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only architecture review
- **Verdict:** **REJECT**

## Findings

### Blocking

The Model Policy work package owns only `apps/model-policy/**` (`docs/transformation/work-packages.v1.json:514-520`), but this candidate writes `bun.lock`, `.github/workflows/ci.yml`, and `tools/quality/check-secret-scan*`, surfaces reserved to closed integrator packages WP-G2-T01 and WP-G2-Q01 (`docs/transformation/work-packages.v1.json:21-30,302-309`; `GOALS.md:19-25`; `STATUS.md:54-56`). These writes must be removed or carried by a separately authorized bounded maintenance package.

### Major

None beyond the blocking scope breach.

### Minor

None.

## Confirmed corrections

MP-P3 now emits bounded immutable events only and MP-P4 alone selects/re-evaluates affected needs. The review found no regression in status authority, optional MP-P2, MP-P4/MP-P5 enforcement separation, non-ranking MP-P6, pilot/production/paid sequencing, or evidence-authority separation.

## Checks

- phase checker: 8 phases, 60 gates;
- checker tests: 38 passed;
- app suite: 124 passed, 2 intentional skips;
- scanner tests and diff hygiene: clean;
- reviewed worktree: unchanged.

## Residual risks

Opaque reviewer resolution, non-mechanized intra-phase gate ordering, and content-addressed authorization substance remain owner-controlled risks.
