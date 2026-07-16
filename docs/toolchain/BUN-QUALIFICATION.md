# Bun toolchain qualification

## Current observation

- stable: `1.3.14`, not the Rust line targeted ;
- pinned canary: `1.4.0-canary.1+57f349f63` ;
- source commit: `57f349f6307cf89dcfb8893f003c1ef421a74589` ;
- macOS ARM64 and Linux x64 official assets downloaded and verified locally ;
- local snapshot: `.tools/snapshots/bun/1.4.0-canary.1+57f349f63/` (gitignored).

## Action required

At the beginning of Foundation Build:

1. check whether a stable Rust Bun release exists ;
2. if yes, replace the canary, regenerate `bun.lock`, rerun all gates and record checksums ;
3. otherwise choose one reproducible path:
   - archive the exact official binaries in a controlled GitHub release after LGPL/notice review ; or
   - build from the exact source commit and publish build provenance ;
4. configure shared CI only after the chosen artifact is durable ;
5. keep Clever Cloud unconfigured until Global Integration.

## Acceptance

- exact version/revision verified ;
- Darwin ARM64 and Linux x64 checksums recorded ;
- artifact remains retrievable after the rolling canary changes ;
- licence notices and corresponding source obligation handled ;
- clean runner can install without `curl | bash` ;
- `bun install --frozen-lockfile`, `bun run check` and Playwright bootstrap pass.

The local snapshot completes immediate preservation, not shared-CI qualification.
