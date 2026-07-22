# Front-C client shell — walking skeleton (boussole + practices)

Date: 2026-07-22
Work packages: `WP-G3-B01` (boussole), `WP-G3-P01` (practices)
Status: design approved (approach A + walking skeleton + serial execution)

## Purpose

boussole and practices are local-only, on-device apps. Their domains, local
persistence ports and concrete IndexedDB adapters are built and tested; what is
missing is the **client-first UI/shell** that makes them usable. This increment
establishes the client-first architecture end to end with a **walking skeleton**:
a single core interaction, persisted on-device, restored on reload — for both
apps — proving the pattern before richer UI is layered on.

The binding invariant is unchanged: **user data never leaves the device**. It is
enforced structurally (domains import nothing; user data lives only in IndexedDB),
by the `check-no-transmission` CI gate over `apps/boussole` + `apps/practices`, and
now additionally by a runtime network-interception assertion in the e2e.

## Approach

**Approach A — instantiate the `bun-app` template per app** (chosen over a shared
`front-c-shell` package [premature, only two apps] and over a client-only app
[breaks the no-JS accessibility baseline]). The client-first pattern is already
fully templated in `distribution/templates/bun-app` (server + `client/app.tsx`
`hydrateDocument` + `DocumentDescriptor.clientModule` + `scripts/build.ts` +
manifest/service-worker + e2e `no-js`/`pwa`). Each app copies that thin shell and
wires its own domain + injected IndexedDB store. Rule-of-three is not reached, so
the per-app duplication is acceptable; a shared package can follow if a third
client app appears.

## Architecture (per app — progressive enhancement)

1. The server renders an **accessible SSR baseline** of the current state (the
   questionnaire statements / the activity), usable **without JavaScript**.
2. `DocumentDescriptor.clientModule` emits the hydration `<script type="module">`.
3. On hydration, the client creates the IndexedDB store
   (`createIndexedDb*Store(globalThis.indexedDB)`) and a store-backed hook loads
   the persisted state and enables the interactive controls.
4. All computation is on-device; there is **no network path** for user data. The
   service worker caches only the shell (never user data).

Without JavaScript the baseline is perceivable (the content renders accessibly)
but not interactive — a documented, honest limitation of a local-only interactive
app; the no-JS e2e asserts the baseline is well-formed and accessible.

## Components (per app, following the template)

| File                                                             | Purpose                                                                                                                                                                             |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/<app>-app.tsx`                                           | The interactive component: SSR-renderable (accessible) and hydratable. Renders the current state; controls call the domain.                                                         |
| `src/client/use-<x>.ts`                                          | Store-backed hook: load the persisted state on mount, expose the core action, persist on every change (fail-closed via the port).                                                   |
| `src/client/app.tsx`                                             | Client entrypoint: create the IndexedDB store from `globalThis.indexedDB`, `hydrateDocument(...)`, register the service worker.                                                     |
| `src/shared/document.tsx`                                        | `<app>Document(state)` → `DocumentDescriptor` with `clientModule` set.                                                                                                              |
| `src/server/handler.ts` + `index.ts`                             | Serve `/` (SSR), `/client.js` (built bundle), `/manifest.webmanifest`, `/sw.js`, `/api/health`; unknown → 404.                                                                      |
| `scripts/build.ts`                                               | `Bun.build` the client entrypoint → `dist/client.js`.                                                                                                                               |
| `public/manifest.webmanifest`, `public/icon.svg`, `public/sw.js` | PWA assets; the service worker caches the shell only, never user data.                                                                                                              |
| `e2e/no-js.e2e.ts`, `e2e/pwa.e2e.ts`, `playwright.config.ts`     | The e2e (adapted from the template): no-JS baseline, installable/offline shell, the core-interaction round-trip, and a network-interception assertion of no user-data transmission. |

## Core interaction (the only behaviour in the skeleton)

- **boussole**: render the statements (fixture dataset/method binding + statement
  ids) → answer a statement (symmetric integer `[-5, 5]`) or skip it → persist to
  IndexedDB → reload restores the answers. Scoring stays out of scope (gate-blocked
  by ADR-0002).
- **practices**: render an activity (fixture activity definition) → record a
  response (→ `updateResponseDigest`) → persist → reload restores. The feedback
  engine and publication stay out of scope (publication is human-gated).

## Data flow

SSR (initial empty state) → hydrate → the hook runs `store.load()` and restores the
state (or surfaces `corrupt` fail-closed) → an interaction calls the domain
(`recordResponse` / `skipStatement` / `updateResponseDigest`) → `store.save(next)` →
on reload the hook restores from IndexedDB.

## Error handling

- A corrupt/tampered local store surfaces as `corrupt` at the hook (the port decodes
  fail-closed); the UI offers a clear recovery (start fresh), never rehydrates an
  invalid state, and never throws to a blank screen.
- The store `save`/`load` reject only on an un-openable IndexedDB; the hook surfaces
  that as a recoverable UI state, not a crash.

## Testing

- **Component (unit)**: static-render the accessible baseline (as the cockpits do),
  asserting the statements/activity render, the controls are labelled, and no colour
  carries meaning alone.
- **e2e (Playwright — the previously-deferred "option C", now included)**: the no-JS
  baseline is well-formed and accessible; the PWA shell is installable and works
  offline; the core-interaction round-trip (answer → reload → restored) works with
  JS; and a **network-interception assertion proves no user data is transmitted**
  (a runtime complement to the static `check-no-transmission` gate).

## Non-goals (explicitly deferred)

- boussole: dataset/method upgrade UI, export/delete UI, the scoring view (ADR-0002
  gate).
- practices: the sourced feedback-rules engine, export/delete UI, activity
  publication (human gate).
- A shared `front-c-shell` package (YAGNI until a third client app).
- Fetching real public data (the public-dataset loader is a deliberate later decision
  behind the no-transmission gate).

## Execution

Despite "both in parallel" as the goal, the two apps are built **serially** —
**boussole first** (establishes the pattern), then **practices** (mirrors it) —
**each as its own PR with independent dual-K4 review**. No concurrent fan-out build:
a prior parallel domain-build experiment drifted (0/4 mergeable) while serial +
adversarial review held. "Parallel" means both apps get their UI, not a concurrent
build.
