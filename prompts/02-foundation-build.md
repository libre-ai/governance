# Prompt — G2 foundation build

## Mission

Implement the final shared foundation in `libre-ai/libre-ai`.

## Scope

- root Bun/Cargo workspaces ;
- qualified Bun toolchain ;
- Knowledge Engine and canonical contracts ;
- UI, web-runtime, auth-web, database, cache, testing and PWA packages ;
- specialized Rust crates ;
- Bun app template ;
- Proof, Artifact and repository projections ;
- local/CI quality gates.

## Constraints

No Dioxus, no extra web framework, no compatibility names, no second lockfile, no Clever provisioning. Use exact dependencies and public APIs only.

## Acceptance

A clean checkout exercises Bun.serve, React SSR/hydration, Ajv contracts, PostgreSQL/RLS, Biscuit, Rust/WASM, Playwright, Proof, Artifact and a deterministic projection.
