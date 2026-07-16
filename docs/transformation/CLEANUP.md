# Cleanup and global freeze

## Purpose

Produce a reliable final reference of every historical repository, not a new release of the old architecture.

## Per-repository procedure

1. read AGENTS/ADR/readiness and actual Git state ;
2. enumerate branch, worktree, staged, unstaged and untracked changes ;
3. scan secrets/PII and machine-local paths ;
4. preserve ambiguous work in a local WIP branch or patch before any reset ;
5. merge already accepted remote work ;
6. classify remaining changes: keep, superseded, generated, machine-local or discard ;
7. run the smallest relevant verification suite ;
8. create a final cleanup commit only for accepted changes ;
9. record final SHA, dirty state, tests, licences, data and contracts ;
10. archive and redirect future work to `libre-ai/libre-ai`.

## Prohibited

- rewriting historical architecture ;
- introducing Bun into historical repositories ;
- deleting unreviewed work ;
- claiming old products production-ready ;
- provisioning Clever Cloud ;
- importing Git history into the canonical monorepo.

## Website special case — reconciled

Option B was explicitly approved. The dirty tree was committed directly, then `origin/main` and the six-commit `impl/epic-2-corpus` branch were merged. Conflicts favored local visual work for the first merge and corpus work for the second. Component contracts and publication tests were repaired afterward. Local `main` is clean at `380e4f7`, ten commits ahead of `origin/main`, with all available gates green. Remaining work is global cleanup, push decision and archive marking.
