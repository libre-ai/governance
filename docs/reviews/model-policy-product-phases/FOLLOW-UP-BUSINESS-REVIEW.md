# Model Policy product phases — follow-up business review

- **Reviewed commit:** `2f749ded738b05c460d1fdb8298edad0dc0a9c56`
- **Net comparison base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only review; later working-tree edits excluded
- **Verdict:** **REJECT**

## Verification performed

The reviewer inspected the immutable commit as a business user, use-case owner, RSSI, DPO, and managed-service buyer. The phase checker, its 11 then-current tests, the application suite, and diff hygiene were green on that candidate.

The prior findings on field accountability/delegation/conflicts, digest-bound owner attestation, MP-P2 optionality, remediation ownership/timing, managed-service provider/key/cost/DPA/support RACI, role-at-time identity, glossary, and non-overclaim language were materially resolved.

## Findings

### Blocking — qualified evidence remained self-assertable

The policy required tools, fixtures/corpus identity, commands, reviewer roles, harnesses, and an appropriate verdict (`docs/apps/model-policy/EVIDENCE.md:17-36`), but the immutable schema allowed empty commands, reviews, and harnesses plus `reject`/`not_applicable` qualified or in-service records (`docs/apps/model-policy/evidence-record.v1.schema.json:7-98`). The checker narrowed away those facts (`apps/model-policy/tools/check-product-phases.ts:45-55,339-420`) and no evidence-record integration test exercised them (`apps/model-policy/tools/check-product-phases.test.ts:138-239`).

### Major — pilot and paid-production sequencing was ambiguous

`MP-P7-G03` and `MP-P7-G07` required `in_service` evidence (`docs/apps/model-policy/phases.v1.json:397-420`), while the latter gate was also the first explicit human authorization of production/commercial exposure (`docs/apps/model-policy/phases/07-managed-service.md:124-130`). The plan needed a separately authorized non-commercial pilot and an explicit pilot → production-only cutover → observed smoke/rollback → paid-onboarding sequence.

### Minor — metric authority was overstated

MP-P6 said `METRICS.md` already carried owner, source, unit, window, and freshness for every metric (`docs/apps/model-policy/phases/06-activity-cockpit.md:43-47`), while the catalogue defined the requirements but not those instance bindings (`docs/apps/model-policy/METRICS.md:5-12`).

### Minor — MP-P4 still claimed denial

`MP-P4-G07` said unavailable dependencies deny decisions (`docs/apps/model-policy/phases/04-continuous-monitoring.md:98-100`) although MP-P4 has no denial capability; only the accepted downstream authorization contract may prove denial.

### Minor — app summary implied steering authority

The app README called the observational cockpit “activity steering” (`apps/model-policy/README.md:10-13`), conflicting with the no-mutation boundary (`docs/apps/model-policy/phases/06-activity-cockpit.md:3-5`).

## Residual risks

External-source authenticity, customer misdeclaration, provider-control enforceability, runtime content/profile mismatch, identity-map retention, and future corpus representativeness remain future qualification subjects rather than current product claims.
