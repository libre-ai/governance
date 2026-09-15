# Program verifier boundary implementation

Initial inspected revision: `6c1b956f04712a0294a352cc789477ecded3775e`.
F1 correction base: `487cb51e00ca0eeef5ffe2e2f37fb61b77d4b3b4`.
Authority: owner-authorized big-bang preparation; the coordinator requested the missing
`tools/migration/verify-program.ts` command. The existing big-bang plan requires local
readiness to remain distinct from final readiness after private qualification.

## Evidence and design

`assertQuiescent` checks structural/digest consistency of SourceFreezeV1; it does not
verify a current signed observation. `inspectExecutionOrder` checks prerequisite topology;
it does not prove execution. Composition and root creation APIs mutate local trees, and
must never run in this read-only acceptance command. Conditional publication grants require
independently trusted policy and fresh signed receipts; a serialized verdict is not a grant.

No accepted run-wide proof manifest or trusted program policy exists. No final preflight,
private-clone, registry, current-source recheck or signed authority qualification reader
exists for this transaction. Adding arbitrary `passed` flags or trusting a key delivered
inside a run directory would manufacture authority. Therefore this increment provides a
strict blocked report, plus canonical inventory and prerequisite-topology diagnostics;
it deliberately has no readiness success path. This is an implementation limit, reported
as missing evidence-verifier authorities, not as proof that every producer is absent forever.

## F1 correction: unavailable input reader

Independent review reproduced a parent-directory replacement race against the original
pathname-based reader. `O_NOFOLLOW` protected only the last component; restoring the original
parent before final identity checks let a sibling freeze be consumed. The reviewed descriptor
probe also returned ENOENT for child traversal via `/dev/fd` and `/proc/self/fd` on Darwin;
that failure is lack of support, not proof of confinement. Linux was not qualified.

No descriptor-anchored reader is implemented and qualified for this module on any platform.
Therefore it must not open `source-freeze.v1.json` at all. The report always records
`freeze.status = "verifier-unavailable"`, `byteDigest = null`, and the corresponding blocker.
It does not assert that the file is missing, malformed, current or coherent. Static run-directory
metadata checks only validate the CLI argument; they are not an input-confinement guarantee.
The canonical portfolio and dependency graph remain repository-owned diagnostics.

No ordinary pathname fallback, native helper, FFI, alternate runtime, platform guess or
run-provided trust key is introduced. Read capability remains absent until an independently
qualified anchored reader exists. A valid, absent, stale, pending, malformed or synthetic freeze
all leave the same unavailable result; none is read or admitted. Existing run contents are never
edited. Local/final reports retain their distinct proof obligations and remain blocked.

## Steps and observable checks

1. Preserve the initial missing-command red/green history. For F1, add a deterministic child
   process hook scheduling real rename/symlink/open/read/restore operations; confirm it fails
   against the reviewed implementation by returning a sibling input digest.
2. Remove the pathname reader completely. Require zero attempted freeze opens and explicit
   verifier-unavailable status in that same regression. Adapt input/CLI tests to this actual
   capability limit, preserving fixed sanitized errors and the final default phase.
3. Verify canonical portfolio/stage authority, local/final blocker differences and byte-identical
   deterministic reports. All execution/readiness/public-mutation claims remain false.
4. Run focused and aggregate Governance gates after staging exact files. Commit only the
   two verifier files and this plan; record observed checks and remaining proof-reader gaps.

## Future completion boundary

A later increment may add success only after reviewed authority/proof interfaces are available:
owner signature, source freshness, path/rights/composition/root binding, per-target local and
Missions proofs, registry consumers, EU/signing permissions, private-clone and GitHub evidence,
and final transaction/source recheck. It must bind every accepted result to immutable inputs,
trusted producer identity and freshness; serialized claims or caller-selected keys never suffice.
Before any freeze read is restored, qualify descriptor-anchored confinement including parent
replacement and symlink refusal on each supported runtime/platform. Final PROGRAM READY and
local admission remain unimplemented; this increment is only a refusal diagnostic.
