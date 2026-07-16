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
7. first merge repair committed as `380e4f7` ;
8. media provenance, catalogue schema and dependency graph reconciled as `7652a3e` ;
9. protected `main` updated through GitHub PR #61 after four required checks ;
10. final remote revision `0318c92b5b0f4fed82cc64b75e5132db04ea04e3`, repository archived.

## Evidence

- `npm run check` green ;
- Rust library tests: 5 passed ;
- static builder tests: 9 passed ;
- Python media/publication tests: 6 passed ;
- topology and 58-media-artifact integrity gates green ;
- static build and smoke: green ;
- Playwright: 40 passed across Chromium, Firefox, WebKit and mobile ;
- `npm audit`, Cargo licences/sources and RustSec audit green ;
- Rust dependency graph reduced from 620 to 345 packages ;
- four required GitHub checks green ;
- local and remote `main` aligned, worktree clean.

## Remaining G0 work

None for Website. Its specifications and generated references remain readable in the archived repository and selected target boundaries already live in the canonical monorepo.
