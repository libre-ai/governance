# Prompt — Design System reconciliation before freeze

## Observed state

- `main` equals `origin/main` at `a5c82ad` ;
- 29 tracked modifications and 11 untracked files ;
- one coherent change set around light product icons, motion manifests, generators, tests and documentation ;
- no competing worktree.

## Recommended procedure

1. read README and product-visual documentation ;
2. scan generated assets and manifests for secrets/machine paths ;
3. run motion, visual-generation and distribution checks ;
4. regenerate outputs from source and verify zero unexplained drift ;
5. review licence/provenance for assets ;
6. commit the coherent accepted change set ;
7. record final SHA in `LEGACY-MANIFEST.yaml` ;
8. archive the repository after Website has consumed the final assets needed for its cleanup.

Ask for human validation only if generated outputs do not reproduce, asset provenance is missing, or the changes split into unrelated intents.
