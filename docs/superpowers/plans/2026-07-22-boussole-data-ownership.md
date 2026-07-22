# Boussole data-ownership UI — implementation plan

> **For agentic workers:** executed inline (executing-plans) in this session, TDD, frequent commits, then dual-K4 adversarial review before PR.

**Goal:** Surface the already-shipped boussole export/delete domain behind an
accessible, enhanced-only "Mes données" region — local file export + confirmed
delete, with no network path.

**Architecture:** Hook exposes pure data (`exportData`, `deleteAll`); the UI
component owns the Blob download and the delete confirm state machine. See
`docs/superpowers/specs/2026-07-22-front-c-data-ownership-design.md`.

**Tech stack:** React 19 SSR + hydration, `@libre-ai/ui` (ActionButton /
StatusMessage / Surface, react-aria), bun:test (`renderToStaticMarkup`),
Playwright e2e (chromium/firefox/webkit).

## Global Constraints

- **No-transmission**: no `fetch`/XHR/WebSocket/sendBeacon/EventSource/RTC/node-net.
  The download uses `Blob` + `URL.createObjectURL` + `<a download>` only — none is
  a `check-no-transmission` signal; **no new allowlist entry**. Keep the helper
  inside `apps/boussole` so the guard scans it.
- **Hydration parity**: SSR (no store) and client first render must be identical;
  the region is `lai-enhanced-only` (hidden without JS). Handlers passed
  unconditionally.
- **a11y**: no `window.confirm`; delete confirmation is in-page; success announced
  via `aria-live` (`StatusMessage`). react-aria `ActionButton` uses `onPress` /
  `isDisabled`.
- **Copy**: French UI (`Télécharger mes réponses`, `Supprimer mes réponses`,
  `Confirmer la suppression`, `Annuler`).
- Export filename: `boussole-reponses.json`, MIME `application/json`.

---

### Task 1: Controller — `exportData` + `deleteAll`

**Files:**

- Modify: `apps/boussole/src/client/use-questionnaire.ts`

**Interfaces produced:**

- `QuestionnaireController.exportData: () => ExportedResponseSet | null`
- `QuestionnaireController.deleteAll: () => void`

- [ ] Add to `QuestionnaireController`: `exportData` returns
      `exportResponseSet(set)` unwrapped (`.ok ? .value : null`); `deleteAll` calls
      `commit(deleteResponses(set))`. Import `deleteResponses`, `exportResponseSet`,
      `ExportedResponseSet` from the domain.
- [ ] These are thin wrappers over domain functions already unit-tested
      (`response-set.test.ts`: `exportResponseSet` refuses empty; `deleteResponses`
      empties keeping binding). No new hook test env (repo has no DOM test runner);
      wiring is proven by e2e (Task 4).
- [ ] `bun test apps/boussole/src/domain/response-set.test.ts` still green.
- [ ] Commit.

### Task 2: `DataOwnership` region component

**Files:**

- Create: `apps/boussole/src/ui/data-ownership.tsx`
- Create: `apps/boussole/src/ui/data-ownership.test.tsx`

**Interface:** `DataOwnership({ exportData, onDeleteAll, hasResponses })` where
`exportData: () => ExportedResponseSet | null`, `onDeleteAll: () => void`,
`hasResponses: boolean`.

- [ ] **Failing tests** (`renderToStaticMarkup`):
  - renders inside a `lai-enhanced-only` container;
  - export button present; carries `disabled` when `hasResponses={false}`, absent
    when `true`;
  - delete button present; the confirm controls are NOT in the initial markup
    (idle state);
  - no `style=` inlined (matches existing baseline discipline).
- [ ] Run → fail (component absent).
- [ ] Implement: `Surface` region with heading; `ActionButton onPress={handleExport}
isDisabled={!hasResponses}`; `handleExport` calls `exportData()` and, when
      non-null, `downloadLocalJson("boussole-reponses.json", data)`. Delete uses a
      `useState<"idle"|"confirming">`; idle shows the delete button; confirming shows
      a `StatusMessage` + `Confirmer la suppression` (`onPress` → `onDeleteAll()` then
      a deleted `StatusMessage`) + `Annuler` (→ idle). `downloadLocalJson` defined in
      this file (browser globals only; never called during render).
- [ ] Run → pass.
- [ ] Commit.

### Task 3: Wire the region into `QuestionnaireApp`

**Files:**

- Modify: `apps/boussole/src/ui/questionnaire-app.tsx`
- Modify: `apps/boussole/src/ui/questionnaire-app.test.tsx`

- [ ] **Failing test**: the SSR render of `<QuestionnaireApp />` contains the
      data-ownership region (delete button label) inside enhanced-only markup, and the
      export button is `disabled` at the empty baseline.
- [ ] Run → fail.
- [ ] Render `<DataOwnership exportData={controller.exportData}
onDeleteAll={controller.deleteAll} hasResponses={controller.set.responses.length > 0} />`
      after `<Questionnaire>`. Not shown when `status === "corrupt"`.
- [ ] Run → pass. Full `bun test apps/boussole` green.
- [ ] Commit.

### Task 4: e2e — export download + zero transmission, delete round-trip

**Files:**

- Create: `apps/boussole/e2e/data-ownership.e2e.ts`

- [ ] Export: answer one statement; click `Télécharger mes réponses`; assert a
      download event fires with filename `boussole-reponses.json`; assert its parsed
      JSON has `schemaVersion: "libre-ai.boussole-response-set.v2"` and the answered
      statement; assert **zero network requests** to any origin during the export
      (reuse the no-transmission interception pattern from `questionnaire.e2e.ts` /
      `pwa.e2e.ts`).
- [ ] Delete: answer; click `Supprimer mes réponses` → `Confirmer la suppression`;
      assert the success status; reload; assert the questionnaire is back to empty
      (`0 / 4 répondu(s).`) — binding kept, responses gone.
- [ ] Cancel path: click delete → `Annuler` → responses intact.
- [ ] Run the three projects green (`bun run --cwd apps/boussole test:e2e`).
- [ ] Commit.

### Task 5: README increment note + full gate sweep

**Files:**

- Modify: `apps/boussole/README.md`

- [ ] Add an "Increment 6 — data-ownership controls" note; move `export/delete UI`
      out of the deferred list (upgrade UI + scoring stay deferred).
- [ ] Run full sweep: `bun run check:source`, `bun run check` (no-transmission,
      typecheck, biome, tests), `biome ci .`.
- [ ] Commit.

## Post-plan: dual-K4

Two independent adversarial reviewers (distinct from the implementer), privacy /
no-transmission lens: confirm no network primitive, hydration parity, no-JS
baseline intact, delete is truly local + confirmed, export document is
non-identifying. Both APPROVE before PR.
