# Model Policy product phases — architecture counter-review of `a95c313`

- **Candidate:** `a95c313cad65669398c67caef4787f67807fe099`
- **Base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only architecture review
- **Verdict:** **REJECT**

## Findings

### Blocking

None.

### Major

MP-P3 smuggles MP-P4 selection and re-evaluation capability into organization governance. It requires re-evaluation on exception expiry, policy publication, and exception mutation (`docs/apps/model-policy/phases/03-organization-governance.md:43,53,94-96`), while MP-P4 owns bounded affected-need selection, re-evaluation, and transition (`docs/apps/model-policy/phases/04-continuous-monitoring.md:33-45,82-92`). MP-P3 must emit immutable lifecycle events only; MP-P4 must be their sole selection/re-evaluation consumer.

### Minor

None.

## Confirmed corrections

The review confirmed the sole status authority, absence of net root-manifest or locked-specification writes, explicit external gates, MP-P6 ranking/quality/procurement exclusions, MP-P4 event versus MP-P5 enforcement split, optional MP-P2, non-circular evidence/review authority, and non-commercial pilot → production-only cutover → observed in-service → paid onboarding sequence.

## Checks

- phase checker: passed;
- adversarial checker tests: 33 passed;
- Model Policy app suite: 119 passed, 2 intentional live-WASM skips;
- diff hygiene and candidate ancestry: clean;
- reviewed worktree: unchanged.

## Residual risks

Opaque reviewer references still require owner-controlled resolution. Gate ordering within a phase is described by ordered registry entries and prose but is not a separate machine-enforced intra-phase dependency graph.
