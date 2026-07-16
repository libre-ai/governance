# Website reconciliation — completed

## Decision

Option B was explicitly accepted: commit the complete local tree directly on the outdated main, then merge upstream and corpus work aggressively before the global cleanup.

## Result

1. local staged/unstaged/untracked work committed as `5f72e23` ;
2. `origin/main` merged as `9951a0d` ;
3. six-commit `impl/epic-2-corpus` branch merged as `cddb1e3` ;
4. conflicts favored local visual work during the first merge and corpus work during the second ;
5. incompatible component props and missing favicon assets reconciled ;
6. publication tests isolated from residual local `dist/` state ;
7. final cleanup fix committed as `380e4f7`.

## Evidence

- `npm run check` green ;
- Rust library tests: 5 passed ;
- static builder tests: 9 passed ;
- publication gate tests: 5 passed ;
- static build and smoke: green ;
- Playwright: 40 passed across Chromium, Firefox, WebKit and mobile ;
- worktree clean ;
- local main ten commits ahead of `origin/main`.

## Remaining G0 work

- perform the global naming/generated-asset cleanup ;
- decide when to push the ten-commit series ;
- update final SHA if cleanup adds commits ;
- mark Website archived after the canonical monorepo has captured selected specifications and assets.
