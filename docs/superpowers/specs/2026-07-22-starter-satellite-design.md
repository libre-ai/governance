# Starter satellite — design

**Date:** 2026-07-22 · **Run:** γ1-prep (RUN-GAMMA-CHARTER) · **WP:** wave-1
deliverable deferred by EXECUTION-SEQUENCING ("starter, dérivé de la première
app"), now required by the wave-1 exit gate: _« chaque brique consommée par au
moins un usage réel »_.

## 1. Purpose

One template that **really consumes all four published satellites** —
`@libre-ai/contracts`, `@libre-ai/web-platform`, `@libre-ai/ui`,
`@libre-ai/auth-web` — as the sovereign-app starting point. It is the wave-1
exit-gate instrument AND the public "start here" artifact.

The existing `bun-app` template stays: it is the framework-free FOUNDATION
reference (no auth, no domain). The starter is the PRODUCT-SHAPED derivation
(structure inherited from the Notebook pilot: domain / server / client / ui
separation), and the **first real consumer of auth-web** — the one brick
nothing exercises today (recon: neither template nor notebook imports it;
only its own e2e harness does).

## 2. Decisions (G1-G10 from recon, resolved by doctrine)

1. **G2 location**: `distribution/templates/starter/` — the workspace,
   tsconfig, biome, check-bun-manifests and licensing gates already cover
   `distribution/templates/*`. Repo mirror name `libre-ai/starter` (LEXICON
   §2.1) at activation; **no npm package** (a template is copied, not
   installed).
2. **G1/G3 scope**: walking skeleton "journal souverain" — sign in (auth-web
   dev-issuer, opaque session, CSRF), write a note (domain: pure functions),
   SSR baseline + hydration + PWA shell (bun-app pattern), a contract-validation
   playground at the API boundary (contracts, fail-closed),
   accessible UI (ui primitives). No storage beyond in-memory (YAGNI: the
   starter teaches the seams, not a database).
3. **G4 contracts at runtime**: no locked schema describes a starter note, so
   forcing one would be dishonest. Instead the starter exposes `POST
   /api/validate` — a session-gated contract-validation playground: `{
   schemaName, document }` → the fail-closed verdict from
   `loadCanonicalContractRegistry()` (plus `GET /api/schemas` listing
   `schemaNames()`). Real runtime SDK usage; notes stay domain-validated.
4. **G5 npm-proof (exit gate)**: in-workspace, the starter uses `workspace:*`
   (dev truth). The proof of real npm consumption is
   `tools/release/starter-npm-proof.ts`: copies the starter OUT of the
   workspace to a temp dir, rewrites its manifest to registry versions,
   `bun install` from npm, runs the starter's test suite there. Runnable only
   after the owner's npm day; wired as a runbook step + evidence artifact.
   (Rationale: inside the workspace, bun resolves names to workspace packages
   — an in-repo "npm dep" would prove nothing.)
5. **G6 licensing**: Apache-2.0 (ADR-0004 §2, template), REUSE headers, LICENSE
   file.
6. **G7 notebook inheritance**: structure only (src/domain | server | client |
   ui, build manifest discipline) — zero backup/crypto/Gate-B logic.
7. **G9**: Bun-only, stated in the README (doctrine: Bun canonical).
8. **G8/G10**: exit-gate evidence = npm-proof output committed under
   `distribution/evidence/` on npm day; mirror push via existing
   `mirror-satellites.sh` extended with the `starter` target at activation.

## 3. Architecture

```
distribution/templates/starter/
├── package.json            # Apache-2.0, workspace deps on the 4 satellites
├── LICENSE, README.md      # vitrine: what it teaches, Bun-only note
├── scripts/check-bun-version.ts   # template guard (manifest gate requires it)
├── scripts/build.ts        # client bundle + tailwind + manifest + sw (bun-app pattern)
├── src/domain/journal.ts   # pure note functions (add/list, refusal codes)
├── src/server/index.ts     # Bun.serve adapter (parseServerAddress)
├── src/server/handler.ts   # createRequestHandler: / (SSR), /api/notes (domain-validated POST),
│                           #   /api/schemas + /api/validate (contracts playground),
│                           #   auth-web session boundary + CSRF
├── src/shared/document.tsx # DocumentDescriptor (clientModule, manifest)
├── src/client/app.tsx      # hydrateDocument
├── src/ui/journal-app.tsx  # ui primitives, lai-enhanced-only interactivity
└── e2e/                    # no-js, pwa, journal round-trip, login flow (dev-issuer)
```

Auth wiring reuses the pattern proven in `packages/auth-web/e2e/serve-e2e.ts`
(DevIssuer + AuthHttpBoundary + InMemorySessionStore + OidcLoginFlow) — the
starter shows HOW an app mounts it; the dev-issuer is clearly labeled
non-production.

## 4. Testing

Unit (domain + handler), SSR-string component tests, e2e 3 engines (no-js /
pwa / journal round-trip / login-session-CSRF flow), full repo gates. The
npm-proof script is additionally covered by a unit test of its manifest
rewrite logic.

## 5. Out of scope

Database/persistence, real IdP, deployment configs (C1), npm publication of
the starter itself, sdk-rs.
