# Notebook product host process-fault harness — candidate-integration review

- `reviewPassId`: `notebook-product-host-faults-candidate-integration-bdee4d9-01`
- `reviewMode`: `candidate-integration`
- `role`: `candidate-integration`
- `reviewedCommit`: `bdee4d95be030610e25cbd273787161e4ca982ed`
- `reviewedTree`: `1f4b70bd84ac7b5162b30373d2e4ac15bdaf15be`
- `baseCommit`: `9d139cc8d8d47ceed4d9a0b1d775c22fcfaebd3a`
- `worktreeState`: clean
- `changedSourceInventorySha256`: `d2edb78a0beeee9ab591ab1fdb6e80c1f7ea13c1cb4f9670abf5942ccb411e2a`
- `harness`: pi coding agent; provider/model identifiers not exposed to this pass

## Qualified inputs

- product-host source: unchanged from merged PR #95;
- product build manifest: `a4542b1995292b1bfa638e74e3db4f3089b9a4ae54c901f512d4628e527299b5`;
- product core WASM: `be423962e3a889e792a69a1ab60b978bcbf5ae1102db74a68c70a9a1c65e5942`;
- product worker: `19054f4913ffc438159bb2345b17487dae82d75e3e0ba17212610f61c3cbeb9a`;
- fault config: `04d9fb5754f1f2984ea2fc36f1a067d5db667c5212593420190fa4d793b4d1e4`;
- fault harness: `6bbaf2662d5df37e4903a2fa06d437465570dbf4269f4136aec8cdd94dba66d4`;
- toolchain manifest: `38a17615f5c8a0baf5e0a9fd747ff165a5e2e31f34a73f568a859f64143fde40`;
- pinned Playwright 1.61.1 `coreBundle.js`: `6be5c2ea035554e9b184b1dbc7aa5e7f1fb428dd1b5c202022858dcfae9bee27`.

The pinned Playwright implementation was independently checked to launch non-Windows browser processes detached, issue `SIGKILL` to the negative process-group PID from `killForTests`, and expose that operation only through the internal protocol used by this qualification harness.

## Reproduced evidence

- `bun run qualify:notebook-product-host:faults`: **PASS**, 6/6.
- Chromium `149.0.7827.55`:
  - process report `e5e169cb1661bf48877e5a8cead7ed4677c306949dcbba4ea1088f92cc499ef2`;
  - quota report `287f7ffdaedccc6f03cd0fc871581d09be926d562bbc59371f1d607a94a58961`.
- Firefox `151.0`:
  - process report `42879d79ea496eceb5a6b4b68571280a3569e29e31def65e155c66bc91f82015`;
  - quota report `aeefbec9ac881487d77e701cc7ded9c8699a8fa40c53e0344a3441b5cb1cda54`.
- WebKit `26.5`:
  - process report `9e2d31f14ce4382c33027a450faa4d3764578fbe450af3b60710673fbaca72a3`;
  - quota report `636adbbe9d8167f9b7c6b2d009e96eb31d87aa338f915f24fa7e9560870e5e9e`.
- Every process report records `exitCode: null`, `signalCode: SIGKILL` during seal, then `exitCode: null`, `signalCode: SIGABRT` during staged restore.
- `bun run check`: **PASS**, 385 tests, 0 failure.
- `reuse lint`: **PASS**, 679/679 files compliant.

## Review axes

- **Security/privacy**: only deterministic public fixture bytes are processed. All page requests outside the local product origin are blocked and asserted absent. Console/page errors, plaintext/recovery persistence, partial receipt/download, and stale workers are asserted absent. The qualification code is not imported into the product build.
- **Quality/completeness**: the three project configurations bind explicit browser engines. Persistent profiles are relaunched after two distinct process-group signals. Seal interruption leaves no backup/download; restore interruption leaves encrypted staging only, which startup removes before wrong-secret and successful fresh-worker recovery.
- **Performance**: no production hot path changes. Qualification is sequential with bounded 300-second tests and temporary profiles removed in `finally`.
- **Sovereignty/compliance**: no dependency, SaaS, external request, PII or user fixture was added. Existing pinned local Playwright and Node archives are reused.

## Findings

- Blocking: 0
- Major: 0
- Minor: 0
- Non-blocking: 0

## Residual risks and exclusions

- Real browser-process OOM is not induced.
- The IndexedDB transaction abort is deterministic qualification injection, not physical disk/quota exhaustion.
- Physical 8 GiB and 16–24 GiB product-host campaigns remain pending.
- JavaScript/worker/process destruction does not prove physical RAM, swap or OS erasure.
- The private Playwright process boundary is acceptable only for the pinned 1.61.1 harness; every Playwright update requires fresh source audit and qualification.
- Specialized product-host security, cryptography and privacy verdicts remain pending.
- Gate B, user data, release and feature activation remain **REJECT**.

## Verdict

**APPROVE** for candidate integration of this qualification-only harness.

This verdict gives credit only for forced process kill/crash recovery and deterministic quota-boundary behavior on the exact disabled product host. It is not a specialized promotion verdict and does not close Gate B or the remaining OOM, physical quota, device or review blockers.
