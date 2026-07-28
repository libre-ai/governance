# Model Policy product phases — technical counter-review of `a95c313`

- **Candidate:** `a95c313cad65669398c67caef4787f67807fe099`
- **Base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only technical review
- **Verdict:** **REJECT**

## Findings

### Blocking

Evidence binds the phase-document blob at an arbitrary source commit but only requires the path to be listed. The current phase document is read separately from the mutable worktree, so a gate criterion can change after the candidate without invalidating evidence (`apps/model-policy/tools/check-product-phases.ts:582-597,824-837`). Bind a canonical gate-section digest to both the exact source-commit blob and the current Git-index blob; add semantic-drift and staged/worktree-divergence tests.

### Major

1. An `in_service` observation window may end after `recordedAt`, including in the future, because only `start < end` is checked (`docs/apps/model-policy/evidence-record.v1.schema.json:114-118,268-316`; `apps/model-policy/tools/check-product-phases.ts:719-746`). Require `windowStartedAt < windowEndedAt <= recordedAt` and bind deployment authorization.
2. The CI secret scanner excludes every `/evidence/` path (`tools/quality/check-secret-scan.ts:13-17,29-44`; `.github/workflows/ci.yml:138-149`) even though evidence records and operational artifacts contain free text. Canonical Model Policy evidence must be scanned for credentials and personal data, with only narrow fixture exclusions.

### Minor

1. The app checker imports Ajv and Ajv Formats without direct app-manifest declarations (`apps/model-policy/tools/check-product-phases.ts:3-4`; `apps/model-policy/package.json:17-20`).
2. Checker coverage is reported but has no blocking threshold (`bunfig.toml:6-7`).

## Confirmed corrections

The review confirmed unknown-before-cast behavior, stable schema diagnostics, immutable same-buffer Git-index reads, source-commit regular blobs, evidence/review identity and role/verdict/report-digest validation, conditional incident evidence, path/symlink/untracked and argv-safe Git handling, dependency cycles, exact 60-gate mapping, honest zero attached evidence, and both projection rollback paths.

## Checks

- phase checker tests: 33 passed, 97.78% functions and 89.08% lines;
- Model Policy app suite: 119 passed, 2 intentional live-WASM skips;
- repository suite: 1,792 passed, 2 skipped after retrying a transient fixed-port collision;
- typecheck, targeted Biome, manifest, checker, and diff hygiene: clean;
- reviewed worktree: unchanged.

## Residual risks

Reviewer identity authenticity remains owner-controlled. Process termination between projection renames cannot be transactionally rolled back, artifact truth remains qualitative, and sequential Git subprocess work scales with the schema maxima.
