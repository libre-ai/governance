# Starter satellite — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. TDD, frequent commits, checkbox steps. Spec: `docs/superpowers/specs/2026-07-22-starter-satellite-design.md`.

**Goal:** `distribution/templates/starter/` — the product-shaped template
consuming all four satellites for real (first auth-web consumer), plus the
out-of-workspace npm-proof tool for the wave-1 exit gate.

**Architecture:** bun-app pattern (SSR → hydration → PWA) + notebook-style
separation (domain/server/client/ui) + auth-web session boundary + a
contracts-validated API route. In-memory only.

**Tech stack:** Bun.serve, React 19, `@libre-ai/{contracts,web-platform,ui,auth-web}`
(workspace refs), Playwright 3 engines, bun:test.

## Global Constraints

- Template rules (check-bun-manifests): local `scripts/check-bun-version.ts`
  with `MINIMUM_BUN_VERSION = "1.4.0"`; every script except pre*/check:bun
  pre-runs `bun run check:bun`; `packageManager` unset (template-local guard).
- License **Apache-2.0** + LICENSE file + REUSE headers (ADR-0004 §2/§7).
- Dev-issuer clearly labeled non-production in README and page footer.
- French UI copy; English code/comments.
- No network primitive beyond the app's own origin; no deployment config (C1).
- Follow `distribution/templates/bun-app/` idioms verbatim where they apply
  (handler shape, document descriptor, build script, e2e config) — this is a
  derivation, not a reinvention.

## Tasks

### Task 1: Package scaffold + domain

- Create `distribution/templates/starter/{package.json,LICENSE,scripts/check-bun-version.ts}`
  (copy guard from bun-app; manifest: Apache-2.0, workspace deps on the four
  satellites, catalog react/react-dom, testing catalog for playwright).
- `src/domain/journal.ts` + test (TDD): `createJournal()`, `addNote(journal,
text)` → refuses empty/oversized text (`starter.note_invalid`), `listNotes`.
  Pure, frozen returns, no imports.
- Gates: `bun test distribution/templates/starter`, manifests check green.

### Task 2: Server handler with contracts + auth seams

- `src/server/handler.ts` (TDD against bun-app handler.test idioms): `/` SSR via
  `renderSsrDocument`; `/api/health`; `POST /api/notes` — session-gated
  (auth-web boundary), CSRF-checked, payload validated fail-closed through
  `loadCanonicalContractRegistry()` against a locked schema; refusals as
  problem-details.
- Wire DevIssuer/AuthHttpBoundary/InMemorySessionStore/OidcLoginFlow following
  `packages/auth-web/e2e/serve-e2e.ts`; `src/server/index.ts` adapter.

### Task 3: UI + client hydration

- `src/ui/journal-app.tsx` (+SSR-string tests): SkipLink/Surface/StatusMessage,
  login state, note list, `lai-enhanced-only` form; unconditional handlers
  (hydration parity); `src/shared/document.tsx`, `src/client/app.tsx`,
  `scripts/build.ts` (bun-app pattern incl. sw + manifest).

### Task 4: e2e (3 engines) + template README

- `e2e/`: no-js baseline; pwa offline; login (dev-issuer) → add note →
  round-trip; CSRF refusal path. `playwright.config.ts` per bun-app.
- README vitrine: what it teaches, the four consumed bricks, Bun-only note,
  dev-issuer warning.

### Task 5: npm-proof tool

- `tools/release/starter-npm-proof.ts` (+unit test on the manifest-rewrite
  function): copy starter to temp dir, rewrite `workspace:*`→`^<linked
version>` and `catalog:`→resolved versions (read root catalog), `bun
install` (registry), run its unit tests there. CLI refuses gracefully with
  a clear message while packages are unpublished (pre-npm-day state).
- Extend `mirror-satellites.sh` with the `starter` target (mirror repo
  `libre-ai/starter`).
- Runbook: add starter proof step to WAVE1-PUBLICATION-RUNBOOK owner steps +
  exit checklist.

### Task 6: Full sweep + K4

- Full repo gates (test/tsc/biome/licenses/manifests) + dual-K4 (lens A:
  auth/session/CSRF surface; lens B: template fidelity/test honesty) + PR.
