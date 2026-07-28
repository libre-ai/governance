# Model Policy product phases — follow-up technical review

- **Reviewed commit:** `2f749ded738b05c460d1fdb8298edad0dc0a9c56`
- **Net comparison base:** `269e2edbd751e14f63c16247b2bb93f8319e5be4`
- **Mode:** independent read-only review; later working-tree edits excluded
- **Verdict:** **REJECT**

## Verification performed

Before concurrent remediation edits appeared, the reviewer obtained: checker green for 8 phases/59 gates, 11 checker tests passing, app suite 97 pass/2 intentional skips, repository typecheck and targeted Biome green, manifest/source/contract/diff checks green, and full Bun suite 1778 pass/2 skip/0 fail outside the network sandbox. Unknown-before-cast, stable schema rejection, no write after validation failures, exact bidirectional gate mapping, both README projections, manifest placement, duplicate/cycle handling, source-commit regular-blob verification, and shell-free Git arguments were materially corrected.

## Findings

### Blocking — evidence-level requirements were not enforced

The immutable evidence schema permitted empty commands, harnesses, and supporting reviews plus `not_applicable` verdicts (`docs/apps/model-policy/evidence-record.v1.schema.json:35-98`). The checker verified only data that the record elected to list (`apps/model-policy/tools/check-product-phases.ts:385-419`). A qualified record with an unrelated assertion, no command or review, and an unrelated package artifact could therefore satisfy the structural path.

### Major — record hashing and parsing had a TOCTOU gap

The checker hashed one filesystem read and parsed another after separate `lstat`/`realpath` checks (`apps/model-policy/tools/check-product-phases.ts:125-149,361-369`). A concurrent replacement could bind digest A to validated record B or swap a path after the symlink check.

### Major — evidence validation had no adversarial integration coverage

Every then-current registry/test fixture evidence array was empty, leaving `apps/model-policy/tools/check-product-phases.ts:339-419` untested despite the integration-coverage claim in `docs/apps/model-policy/README.md:91`. Missing negatives included tracked/untracked/symlink/digest/phase-gate/level/source-commit and qualified-role cases.

### Minor — projection writes were not recoverable as a unit

The two generated README writes were sequential (`apps/model-policy/tools/check-product-phases.ts:552-557`); failure of the second could leave partial projection drift.

## Residual risks

Qualitative threshold acceptance and concurrent working-tree mutation remain risks to address through immutable candidates, content-addressed evidence, bounded acceptance authorities, and re-review.
