# Model Policy product phases — technical counter-review of `a431ebb`

- **Candidate:** `a431ebb1e873f87e88f9ed1f25357bc0b77bbbb4`
- **Base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only technical review
- **Verdict:** **REJECT**

## Findings

### Blocking

None.

### Major

1. Sensitive scanning runs on raw UTF-8 before JSON parsing, so JSON Unicode escapes can conceal credentials or personal data. A probe encoded an AWS-style key in `authorizationRef`; the raw scan missed it, JSON decoding restored it, and the operational schema accepted it (`apps/model-policy/tools/check-product-phases.ts:285-294,545-586,668-685,792-806`; `docs/apps/model-policy/operational-evidence.v1.schema.json:54-69,107-112`).
2. Deployment authorization recorded exactly at `windowStartedAt` passes because the temporal check uses `>` even though the recorded remediation requires authorization before the window (`apps/model-policy/tools/check-product-phases.ts:619-623`; `docs/reviews/model-policy-product-phases/REMEDIATION.md:64`).

### Minor

1. The CLI success summary rereads the mutable worktree roadmap after indexed validation, allowing misleading phase/gate counts or a post-validation parse failure (`apps/model-policy/tools/check-product-phases.ts:958-1042,1184-1189`).

## Confirmed corrections

The immutable index snapshot for the roadmap and all schemas; JSON-only operational variants; favorable kind/outcome and evidence/phase/gate/deployment/window bindings; incident resolution; source/current gate digest; source-commit blobs; service upper bound; role separation; digests; symlink/untracked defenses; projection rollback; and repository-discovered coverage wrapper all reproduced successfully.

## Checks

- checker tests: 47 passed; coverage 97.83% functions and 91.11% lines;
- app suite: 134 passed, 2 intentional WASM skips;
- checker, typecheck, scoped Biome, manifests, licences, and diff hygiene: clean;
- root check reached 1,804 passes and 2 skips before three transient relay `EADDRINUSE` failures; the immediate isolated relay rerun passed 5/5.

## Required remediation

- Scan parsed JSON keys/string leaves as well as raw bytes.
- Require deployment-authorization `recordedAt` to be strictly earlier than `windowStartedAt`, with timing-branch regressions.
- Derive the CLI summary from the validated indexed roadmap.

## Residual risks

Opaque owner-reference resolution and heuristic marker detection remain explicit boundaries. Ajv and Ajv Formats are imported directly by the app checker but declared only in root development dependencies; making the app independently installable would require an authorized integrator lock/manifest change and is therefore tracked as a non-blocking architecture-owned residual.
