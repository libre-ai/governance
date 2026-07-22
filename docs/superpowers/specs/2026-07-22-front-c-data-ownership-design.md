# Front-C data-ownership controls — design

**Date:** 2026-07-22
**Status:** approved (autonomous β increment; owner-vetoable)
**Apps:** `apps/boussole` (first), `apps/practices` (mirror)
**Work packages:** WP-G3-B01 (boussole), WP-G3-P01 (practices)

## 1. Goal

Close the "the user owns their data" loop for the local-only Front-C apps by
surfacing the **export** and **delete** capabilities that already exist in the
domain but have no UI. A user can download their own recorded data to a local
file and erase it from the device — with **no network path**, ever.

This is the deferred-but-ungated increment (boussole `README.md`: _"Deferred:
scoring UI, dataset/method upgrade UI, export/delete UI"_). Only **public
scoring** is gated (ADR-0002, compile-disabled). Export/delete are pure local
operations over already-shipped, already-tested domain functions.

## 2. Scope boundary

**In scope**

- boussole: export the response set to a local JSON file; delete all responses
  (keep the dataset/method binding to restart).
- practices: export the activity outcome to a local JSON file; delete the stored
  outcome.
- The two controls live in an enhanced-only "Mes données" region; no-JS baseline
  unchanged.

**Out of scope (anti-gold-plating)**

- No server export endpoint (would violate no-transmission).
- No cloud sync, no share, no format negotiation (JSON only).
- **No dataset/method upgrade UI** — `migrateResponses` needs a _target_ binding,
  which depends on the not-yet-built public dataset loader (a deliberate
  no-transmission decision, per `check-no-transmission.ts` header). Blocked
  upstream; excluded here.
- **No public scoring** — gated by ADR-0002 (two methodological + legal
  approvals), compile-disabled.

## 3. Domain surfaces consumed (already shipped, unchanged)

boussole (`apps/boussole/src/domain/response-set.ts`):

- `deleteResponses(set: ResponseSet): ResponseSet` — returns a frozen set with
  `responses: []`, binding preserved.
- `exportResponseSet(set: ResponseSet): Outcome<ExportedResponseSet>` — **refuses
  when empty**; returns a non-identifying `libre-ai.boussole-response-set.v2`
  document (dataset/method ids + digests + responses).

practices (`apps/practices/src/domain/activity-outcome.ts`):

- `exportOutcome(outcome: ActivityOutcome): ExportedActivityOutcome` — non-
  identifying export document.
- delete uses the store: `LocalOutcomeStore.clear(): Promise<void>`.

## 4. Architecture

### 4.1 Controller (hook) — data, not I/O

The DOM download side-effect (`Blob` / `URL.createObjectURL` / `<a download>`)
lives in the **UI component**, never in the hook. The hook exposes pure data:

boussole `useQuestionnaire` gains:

```ts
readonly exportData: () => ExportedResponseSet | null; // null when empty (domain refuses)
readonly deleteAll: () => void;                        // commit(deleteResponses(set)) → persists emptied set
```

`deleteAll` reuses the existing `commit()` path: it sets the emptied set in React
state and `store.save()`s it, so a reload restores the empty (binding-kept) set.
It never calls `store.clear()` — saving the emptied-but-bound set is the domain's
intent (keep the binding to restart).

practices `useActivity` gains the symmetric `exportData()` and a `deleteAll()`
that calls `store.clear()` then resets to the initial (no-outcome) state.

Why data-not-I/O: the hook stays unit-testable off-browser, and the entire
no-transmission-relevant surface (the download) is concentrated in one component
line the guard and reviewers can inspect.

### 4.2 Download (UI component)

```ts
function downloadLocalJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

`Blob`, `URL.createObjectURL`, and an anchor download are browser globals that
touch **no network primitive** — none of the `check-no-transmission` signals
(`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`,
`RTCPeerConnection`, node net modules, remote imports) appears. The guard stays
green with **no new allowlist entry** (unlike the service worker, this path has
no `fetch` at all).

### 4.3 Delete confirmation (UI component)

Delete is destructive, so it is a **two-step in-page confirmation**, never
`window.confirm` (blocks the event loop, poor screen-reader semantics). State
machine in the component: `idle → confirming → deleted`.

- "Supprimer mes réponses" → reveals a confirm region (`role="alertdialog"` or a
  `StatusMessage` + two buttons: "Confirmer la suppression" / "Annuler").
- Confirm → `controller.deleteAll()` + an `aria-live` success `StatusMessage`.
- Cancel → back to `idle`.

### 4.4 Placement / no-JS

Both controls sit in an enhanced-only region (`lai-enhanced-only`, hidden until
hydration): a no-JS user has no client store to export or delete, so exposing the
controls without JS would be a dead end. The no-JS baseline render is byte-for-
byte unchanged. Export is **disabled** (with an explanatory `StatusMessage`) when
the set has zero responses — mirroring the domain's empty-refusal.

## 5. Error / edge handling

- Export when empty: button disabled + `StatusMessage` ("Rien à exporter pour
  l'instant"). `exportData()` returns `null`; the component never builds a Blob.
- Delete when empty: allowed and idempotent (deleting nothing yields the empty
  set); still routed through the confirm step for consistency.
- Corrupt store (`status: "corrupt"`): the data-ownership region is not shown
  (the app is already in its fail-closed corrupt state); no export/delete of an
  unrehydrated store.

## 6. Testing (layers)

- **unit** (hook): `exportData` returns the document when non-empty and `null`
  when empty; `deleteAll` empties the set and persists (fake store `save` called
  with an empty-responses set).
- **component**: the "Mes données" region is enhanced-only; export button
  disabled when empty and enabled after an answer; delete reveals the confirm
  step; confirm triggers `deleteAll`; cancel returns to idle. (`downloadLocalJson`
  is exercised via a stubbed `URL.createObjectURL`/anchor to assert filename +
  payload, with no network.)
- **e2e** (chromium/firefox/webkit): answer → export → assert a **download event
  fires** with the expected filename **and zero network requests** recorded;
  answer → delete → confirm → reload → set is empty (binding kept).

## 7. Acceptance

- Export produces a local JSON file with the non-identifying export document and
  emits **zero network requests** (e2e assertion).
- Delete clears responses (binding kept), persists, and announces via `aria-live`.
- No-JS baseline unchanged; `check-no-transmission` green with **no new
  allowlist entry**.
- **dual-K4** independent adversarial privacy/no-transmission review: APPROVE.
- 5 CI gates green.

## 8. Mirror (practices)

Same shape, symmetric names: `useActivity.exportData()` /
`useActivity.deleteAll()`, `downloadLocalJson("practices-activite.json", …)`,
same confirm state machine, same e2e trio. Separate PR after boussole merges
(one PR at a time against main).
