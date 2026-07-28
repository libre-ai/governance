# Model Policy product phases — architecture review

- **Reviewed commit:** `95e49839e0ec2791333998a479dca72ed201042e`
- **Review mode:** independent, read-only
- **Role:** architecture reviewer
- **Orchestration evidence:** `task_575a2703ae4d`, message `msg_8556d57fa50b`
- **Verdict:** `reject`
- **Files modified by reviewer:** none

## Blocking findings

1. `phases.v1.json` created a second product-status authority and declared MP-P0 current/in progress from one Policy Core contract gate. `GOALS.md` and `STATUS.md` remained the sole program/execution authorities, still requiring owner selection and wave 4b; the cited Policy Core promotion explicitly excluded product implementation.
2. The change modified shared root tooling and a locked product specification without a bounded accepted work package. `WP-G3-M01` allowed `apps/model-policy/**`, while root manifests remained under the shared integrator.
3. MP-P6 introduced task-quality ranking and recommendations despite the locked non-goals excluding benchmark leaderboard, model-quality oracle, and procurement automation; no predecessor gate required the specification/ADR amendment.

## Major findings

1. The claimed `MP-P0-G01` evidence did not bind itself to that gate.
2. The checker allowed a later phase to start before dependencies closed and accepted unrelated files as evidence.
3. MP-P4 crossed the monitoring boundary by making routes unavailable before MP-P5 owned authorization and gateway enforcement.

## Required remediation

- Keep the plan planning-only with no live current/status authority; make owner selection, wave 4b, and accepted work packages explicit external prerequisites.
- Restore shared root and locked specification files; place owned validation under `apps/model-policy/**`.
- Remove ranking/recommendation from MP-P6 unless a future owner-reviewed specification/ADR and accepted work package explicitly introduce it.
- Make MP-P4 emit immutable transition/revocation evidence only; let MP-P5 consume and enforce it.
- Require gate-specific content-addressed evidence and fail closed on dependency/evidence drift.

## Residual risks

Source-adapter SSRF/provenance, approval-reference authenticity, gateway content/profile mismatch, revocation propagation, metric re-identification, and multi-repository activation remain future architecture/security gates. The pure Policy Core semantics, privacy minimization, and rollback narratives were otherwise directionally sound.
