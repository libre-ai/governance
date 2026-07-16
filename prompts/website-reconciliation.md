# Prompt — Website reconciliation before freeze

## Observed state

- `main` at `9b8c9fc`, behind `origin/main` by commit `5b36c80` ;
- 17 staged paths, 29 unstaged tracked paths and 25 untracked paths ;
- separate worktree branch `impl/epic-2-corpus`, six commits ahead of `origin/main` ;
- changes overlap components, assets, catalog, smoke scripts and visual cleanup.

## Required decision before mutation

Ask the human to validate the reconciliation strategy.

### Recommended strategy

1. scan the dirty tree for secrets and machine-local files ;
2. preserve the complete current dirty state on a local WIP branch/commit without push ;
3. bring clean `main` to `origin/main` ;
4. merge `impl/epic-2-corpus` ;
5. compare the preserved WIP against that merged state ;
6. cherry-pick or reapply only remaining accepted visual/asset changes ;
7. run Website’s relevant tests ;
8. create the final cleanup commit and record its SHA.

## Alternatives requiring explicit approval

- commit the dirty tree directly on outdated `main` and resolve all merge conflicts ;
- discard part or all of the dirty tree after proving it is duplicated upstream.

Do not reset, stash-and-forget, merge or delete files before validation.
