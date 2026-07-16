# Transformation status

**Current phase:** G1 — Specification Lock.

## Completed

- canonical monorepo bootstrapped ;
- Big Bang architecture accepted ;
- Bun canary locally verified and snapshotted for macOS ARM64/Linux x64 ;
- root Bun/Cargo workspaces and quality gates green ;
- target repository map, app briefs, contracts and workstreams created ;
- Website local work, `origin/main` and six corpus commits consolidated, cleaned and merged through GitHub PR #61 ;
- Website 20 unit/script tests, static build, 40 Playwright tests, media/topology gates and JS/Rust supply-chain audits green ;
- Website final remote SHA `0318c92`, repository archived ;
- Design System visual/motion work committed and pushed at `c8fb246` ;
- Design System 76-SVG rebuild, 22 targeted tests, distribution provenance and full pinned CI rebuild green ;
- Design System repository archived after Website consumer reconciliation ;
- all 18 historical repositories aligned and archived at recorded SHAs ;
- 33 unmerged local branch tips preserved as remote `archive/local-branch/*` tags ;
- missing Gear remote recreated solely as a verified archive ;
- canonical public GitHub repository created and initial history pushed ;
- Bun canary binaries, exact source, notices and checksums published in a durable prerelease ;
- shared GitHub CI run `29491575814` green for exact Bun and Rust gates.

## Pending in G1

- complete application behavior and refusal specifications ;
- lock JSON Schema, OpenAPI and WIT contract inventory ;
- lock data ownership, retention and deletion rules ;
- lock browser session and Biscuit authorization contracts ;
- decompose final work packages with no unresolved architecture decision.

## Explicitly deferred

- Clever Cloud provisioning, secrets, databases, DNS and deployment ;
- production qualification ;
- public repository projections.

## Current risks

- Bun stable remains `1.3.14`; the selected Rust-line commit exists only in `1.4.0-canary.1` ;
- the Bun archive is a bootstrap-only LGPL/static-linking compliance path, not production approval ;
- GitHub forge/CI is an accepted US-service exception for public code only, never runtime data or secrets ;
- app briefs are boundaries, not complete functional specifications.
