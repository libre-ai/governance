# Model Policy product phases — follow-up architecture review

- **Reviewed commit:** `2f749ded738b05c460d1fdb8298edad0dc0a9c56`
- **Net comparison base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only review
- **Verdict:** **REJECT**

## Verified remediations

The reviewer confirmed that the candidate:

- remained draft-only, with `GOALS.md` and `STATUS.md` as the exclusive status authorities (`docs/apps/model-policy/README.md:3-9`, `docs/apps/model-policy/phases.v1.json:1-8`);
- made no net root-manifest or locked product-specification change and kept validation app-owned (`apps/model-policy/package.json:10-15`);
- explicitly gated owner selection, wave 4b, bounded work packages, and required contract/threat-model/specification/ADR amendments (`docs/apps/model-policy/phases.v1.json:53-57,107-112,157-163`);
- removed ranking, model-quality comparison, recommendation, and automated procurement from MP-P6 (`docs/apps/model-policy/phases/06-activity-cockpit.md:37-61`);
- kept MP-P4 event-only and MP-P5 as the sole enforcement boundary (`docs/apps/model-policy/phases/04-continuous-monitoring.md:37-45,90-104`, `docs/apps/model-policy/phases/05-access-gateway.md:56-60,98-116`);
- kept MP-P2 outside the deterministic service DAG and separately contracted (`docs/apps/model-policy/README.md:18-26`, `docs/apps/model-policy/phases/07-managed-service.md:47-60,128-130`).

## Findings

### Major — qualified/in-service evidence remained self-assertable

The evidence policy required reproducible commands/tool versions, fixtures or corpus identity, independent qualified reviews, and a review verdict (`docs/apps/model-policy/EVIDENCE.md:7-36`). The immutable schema had no tool-version or fixture/corpus field and allowed empty commands, reviews, and harnesses plus `not_applicable` and an author-only reviewer role (`docs/apps/model-policy/evidence-record.v1.schema.json:7-98`). The checker only validated the declared level and optional listed artifacts/reviews (`apps/model-policy/tools/check-product-phases.ts:339-420`). A fresh Ajv probe accepted such an `in_service` record, and the 11 tests had no evidence-record negative.

### Minor — MP-P4 retained an orphan model-quality entry point

MP-P4 listed a bare quality-snapshot refresh (`docs/apps/model-policy/phases/04-continuous-monitoring.md:13-25`) although the metric authority and MP-P6 excluded model-quality observation/comparison (`docs/apps/model-policy/METRICS.md:70-79`). This could reintroduce a locked non-goal before an owner-reviewed amendment.

## Residual risks

Source-adapter SSRF/provenance, approval-reference authenticity, gateway content/profile mismatch, revocation propagation, telemetry re-identification, and multi-repository activation remain correctly behind future external gates.
