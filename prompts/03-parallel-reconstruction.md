# Prompt — G3 parallel reconstruction

## Mission

Build target applications in final `apps/*` paths from accepted specifications.

## Work model

- one bounded work package per branch/worktree ;
- paths and contracts declared before edit ;
- integrate frequently into canonical main ;
- cross-app changes only through approved packages/contracts ;
- no historical parity beyond selected invariants ;
- no temporary implementation survives the release candidate.

## Evidence

Each package reports files changed, contracts affected, tests run, evidence generated, security/PII impact, remaining debt and integration dependency.

## Gate

All apps compile, critical journeys pass, old names/stacks are absent, and no app accesses another product’s database directly.
