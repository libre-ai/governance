# Boussole client-shell (walking skeleton) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship boussole's client-first UI as a walking skeleton — an accessible SSR baseline that hydrates into an interactive questionnaire whose answers persist to IndexedDB and are restored on reload — with e2e proving the no-JS baseline, the PWA shell, the round-trip, and that no user data is transmitted.

**Architecture:** Instantiate the `distribution/templates/bun-app` pattern for boussole (approach A). The server renders an accessible baseline of the questionnaire statements; `DocumentDescriptor.clientModule` emits the hydration script; on the client, `hydrateDocument` mounts an interactive wrapper that creates `createIndexedDbResponseStore(globalThis.indexedDB)`, loads the persisted set, and persists on every answer/skip. Progressive enhancement: interactive controls live in `lai-enhanced-only`, so without JavaScript the statements render read-only.

**Tech Stack:** Bun 1.4 (canary), React 19 (catalog), `@libre-ai/web-platform` (SSR/hydrate/handler), `@libre-ai/ui` (accessible components + Tailwind), `@playwright/test` (catalog:testing) for e2e. Persistence is already built: `apps/boussole/src/persistence/local-response-store.ts` (port + serialize/deserialize) and `indexed-db-response-store.ts` (`createIndexedDbResponseStore`).

## Global Constraints

- Local bun runs: PATH-prefix `/Users/ifi6567/notebook-qualification/runtime-bfc9e4c/bun/bun-darwin-aarch64`. CI (linux-x64) is the repro authority.
- **No outbound transmission** in `apps/boussole`: the `check-no-transmission` gate forbids `fetch(`, `window.fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`, `RTCPeerConnection`, remote `import()`, node network modules. The client entry must NOT register the service worker via any forbidden primitive — `navigator.serviceWorker.register("/sw.js")` is allowed (not on the forbidden list; it is a same-origin worker registration, not a data-transmission primitive). Verify with `bun tools/quality/check-no-transmission.ts` in every task that touches `apps/boussole`.
- Commits: `git commit -s` (DCO trailer derived from git config — author `Constantin Jais <cjais@pm.me>`, never the pro email). Every commit touching `apps/**` needs a `WP-G3-B01` reference in the message. Add `Agent-Role: implementer`.
- Colours never carry meaning alone; every interactive control is labelled; a skip link targets the main landmark.
- Gates that must stay green: `bunx biome ci .`, `bun run typecheck`, `bun test apps/boussole`, `bun tools/quality/check-no-transmission.ts`, `bun tools/quality/check-js-licenses.ts`.
- Reference to copy-adapt verbatim where noted: `distribution/templates/bun-app/{src/server/handler.ts,src/server/index.ts,src/client/app.tsx,shared/document.tsx,scripts/build.ts,playwright.config.ts,e2e/*,package.json}`.

---

### Task 1: Questionnaire fixture

**Files:**

- Create: `apps/boussole/src/ui/fixture.ts`
- Test: covered by Task 2's static-render test.

**Interfaces:**

- Produces: `QUESTIONNAIRE_BINDING: DatasetBinding`, `QUESTIONNAIRE_STATEMENTS: readonly string[]` — a deterministic, domain-valid questionnaire (dataset/method URN binding + sha256 digests + IDENTIFIER statement ids) for SSR + tests. No scoring data (scoring is gate-blocked).

- [ ] **Step 1: Write the fixture**

```ts
// apps/boussole/src/ui/fixture.ts
import type { DatasetBinding } from "../domain/response-set";

// A deterministic questionnaire binding + statements for the read/authoring view.
// Per the runtime boundary these are contract fixtures; no real dataset is fetched
// (the public-dataset loader is a deliberate later decision behind the
// no-transmission gate), and no scoring is computed (ADR-0002 gate).
export const QUESTIONNAIRE_BINDING: DatasetBinding = {
  datasetId: "urn:libre-ai:dataset:reference-2030",
  datasetDigest: "a".repeat(64),
  methodId: "urn:libre-ai:method:reference-2030",
  methodDigest: "b".repeat(64),
};

export const QUESTIONNAIRE_STATEMENTS: readonly string[] = [
  "stmt-services-publics",
  "stmt-fiscalite",
  "stmt-environnement",
  "stmt-libertes-numeriques",
];
```

- [ ] **Step 2: Type-check** — `PATH=… bun run typecheck` → PASS (the binding/statements match the domain types).
- [ ] **Step 3: Commit** — `git add apps/boussole/src/ui/fixture.ts && git commit -s -m "feat(boussole): questionnaire fixture for the client shell (WP-G3-B01)"`

---

### Task 2: Questionnaire view (pure, accessible, SSR-renderable)

**Files:**

- Create: `apps/boussole/src/ui/questionnaire.tsx`
- Test: `apps/boussole/src/ui/questionnaire.test.tsx`

**Interfaces:**

- Consumes: `QUESTIONNAIRE_STATEMENTS` (Task 1); `LocalResponse` (domain).
- Produces: `Questionnaire({ statements, responses, onAnswer, onSkip })` where `onAnswer?: (statementId: string, value: number) => void` and `onSkip?: (statementId: string) => void`. When the handlers are absent (SSR/no-JS) the interactive controls are hidden inside `lai-enhanced-only`; the statements always render as an accessible list with the current answer/skip state as text.

- [ ] **Step 1: Write the failing static-render test**

```tsx
// apps/boussole/src/ui/questionnaire.test.tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QUESTIONNAIRE_STATEMENTS } from "./fixture";
import { Questionnaire } from "./questionnaire";

function render(
  responses: Parameters<typeof Questionnaire>[0]["responses"] = [],
): string {
  return renderToStaticMarkup(
    <Questionnaire
      statements={QUESTIONNAIRE_STATEMENTS}
      responses={responses}
    />,
  );
}

describe("Questionnaire — accessible baseline", () => {
  test("renders every statement with a group label and no colour-only meaning", () => {
    const html = render();
    for (const id of QUESTIONNAIRE_STATEMENTS) expect(html).toContain(id);
    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).not.toContain("style=");
  });

  test("shows the recorded state as text (answered / skipped / pending)", () => {
    const html = render([
      { statementId: "stmt-fiscalite", kind: "answer", value: 3 },
      { statementId: "stmt-environnement", kind: "skip" },
    ]);
    expect(html).toContain("Répondu"); // stmt-fiscalite
    expect(html).toContain("Passé"); // stmt-environnement
    expect(html).toContain("Sans réponse"); // the untouched statements
  });

  test("hides the interactive controls without handlers (no-JS baseline)", () => {
    const html = render();
    // Interactive controls live in lai-enhanced-only; the enhanced wrapper is
    // present but the baseline exposes no answer buttons as reachable controls.
    expect(html).toContain("lai-enhanced-only");
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `PATH=… bun test apps/boussole/src/ui/questionnaire.test.tsx` → FAIL ("Cannot find module ./questionnaire").

- [ ] **Step 3: Write the component**

```tsx
// apps/boussole/src/ui/questionnaire.tsx
import { SkipLink, Surface } from "@libre-ai/ui";
import type { LocalResponse } from "../domain/response-set";

const SCALE = [-5, -3, 0, 3, 5] as const;

function stateLabel(response: LocalResponse | undefined): string {
  if (response === undefined) return "Sans réponse";
  return response.kind === "answer" ? `Répondu (${response.value})` : "Passé";
}

export function Questionnaire({
  statements,
  responses,
  onAnswer,
  onSkip,
}: {
  readonly statements: readonly string[];
  readonly responses: readonly LocalResponse[];
  readonly onAnswer?: (statementId: string, value: number) => void;
  readonly onSkip?: (statementId: string) => void;
}) {
  const byId = new Map(responses.map((r) => [r.statementId, r]));
  const answered = responses.filter((r) => r.kind === "answer").length;
  return (
    <>
      <SkipLink targetId="questionnaire" />
      <header className="lai-header lai-page">
        <h1>Boussole — questionnaire</h1>
        <p>
          Répondez sur votre appareil. Rien n'est transmis : vos réponses
          restent en stockage local. Le positionnement n'est pas encore
          disponible.
        </p>
      </header>
      <main
        id="questionnaire"
        className="lai-main lai-page lai-stack"
        tabIndex={-1}
      >
        <p data-testid="progress">{`${answered} / ${statements.length} répondu(s).`}</p>
        {statements.map((statementId) => {
          const response = byId.get(statementId);
          return (
            <Surface
              key={statementId}
              aria-labelledby={`${statementId}-legend`}
            >
              <fieldset className="lai-stack">
                <legend id={`${statementId}-legend`}>{statementId}</legend>
                <p data-testid={`state-${statementId}`}>
                  {stateLabel(response)}
                </p>
                <div className="lai-enhanced-only lai-cluster">
                  {SCALE.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={
                        response?.kind === "answer" && response.value === value
                      }
                      onClick={
                        onAnswer
                          ? () => onAnswer(statementId, value)
                          : undefined
                      }
                    >
                      {value > 0 ? `+${value}` : `${value}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-pressed={response?.kind === "skip"}
                    onClick={onSkip ? () => onSkip(statementId) : undefined}
                  >
                    Passer
                  </button>
                </div>
              </fieldset>
            </Surface>
          );
        })}
      </main>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes** — `PATH=… bun test apps/boussole/src/ui/questionnaire.test.tsx` → PASS. Also `bunx biome check --write apps/boussole && bunx biome ci apps/boussole` and `bun run typecheck`.

- [ ] **Step 5: Commit** — `git add apps/boussole/src/ui/questionnaire.tsx apps/boussole/src/ui/questionnaire.test.tsx && git commit -s -m "feat(boussole): accessible questionnaire view (WP-G3-B01)"`

---

### Task 3: Interactive wrapper + store hook

**Files:**

- Create: `apps/boussole/src/client/use-questionnaire.ts`
- Create: `apps/boussole/src/ui/questionnaire-app.tsx`
- Test: behaviour is verified by the e2e round-trip (Task 7); the hook is a thin adapter over the already-tested domain (`recordResponse`/`skipStatement`) and store (`LocalResponseStore`), so it carries no separate unit test. A `renderToStaticMarkup` smoke test asserts the wrapper's SSR output equals the baseline (hydration-safe).

**Interfaces:**

- Consumes: `startQuestionnaire`, `recordResponse`, `skipStatement`, `ResponseSet` (domain); `LocalResponseStore` (port); `Questionnaire` (Task 2); `QUESTIONNAIRE_BINDING`, `QUESTIONNAIRE_STATEMENTS` (Task 1).
- Produces: `QuestionnaireApp({ store? }: { store?: LocalResponseStore })` — an SSR-safe interactive root. Initial render (SSR and pre-effect client) shows the empty questionnaire, so hydration matches. With a `store` (client only), a mount effect loads the persisted set and each answer/skip persists.

- [ ] **Step 1: Write the hook**

```ts
// apps/boussole/src/client/use-questionnaire.ts
import { useEffect, useState } from "react";
import {
  type ResponseSet,
  recordResponse,
  skipStatement,
  startQuestionnaire,
} from "../domain/response-set";
import { QUESTIONNAIRE_BINDING, QUESTIONNAIRE_STATEMENTS } from "../ui/fixture";
import type { LocalResponseStore } from "../persistence/local-response-store";

function emptySet(): ResponseSet {
  const started = startQuestionnaire(
    QUESTIONNAIRE_BINDING,
    QUESTIONNAIRE_STATEMENTS,
  );
  if (!started.ok) throw new Error("boussole.fixture_invalid");
  return started.value;
}

export type QuestionnaireStatus = "loading" | "ready" | "corrupt";

export interface QuestionnaireController {
  readonly set: ResponseSet;
  readonly status: QuestionnaireStatus;
  readonly answer: (statementId: string, value: number) => void;
  readonly skip: (statementId: string) => void;
}

// The interactive controller. Without a store (SSR) it stays at the empty set and
// "loading" so the first client render matches the server markup. With a store it
// loads the persisted set on mount and persists every mutation; a corrupt local
// store is surfaced fail-closed (never rehydrated).
export function useQuestionnaire(
  store?: LocalResponseStore,
): QuestionnaireController {
  const [set, setSet] = useState<ResponseSet>(emptySet);
  const [status, setStatus] = useState<QuestionnaireStatus>(
    store ? "loading" : "ready",
  );

  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    store.load().then((result) => {
      if (cancelled) return;
      if (result.status === "loaded") setSet(result.set);
      setStatus(result.status === "corrupt" ? "corrupt" : "ready");
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  function commit(next: ResponseSet): void {
    setSet(next);
    void store?.save(next);
  }

  return {
    set,
    status,
    answer(statementId, value) {
      const next = recordResponse(set, statementId, value);
      if (next.ok) commit(next.value);
    },
    skip(statementId) {
      const next = skipStatement(set, statementId);
      if (next.ok) commit(next.value);
    },
  };
}
```

- [ ] **Step 2: Write the wrapper**

```tsx
// apps/boussole/src/ui/questionnaire-app.tsx
import { StatusMessage } from "@libre-ai/ui";
import { useQuestionnaire } from "../client/use-questionnaire";
import type { LocalResponseStore } from "../persistence/local-response-store";
import { QUESTIONNAIRE_STATEMENTS } from "./fixture";
import { Questionnaire } from "./questionnaire";

export function QuestionnaireApp({
  store,
}: {
  readonly store?: LocalResponseStore;
}) {
  const controller = useQuestionnaire(store);
  return (
    <>
      {controller.status === "corrupt" ? (
        <StatusMessage className="lai-status" data-testid="corrupt-notice">
          Vos réponses locales sont illisibles. Recommencez le questionnaire.
        </StatusMessage>
      ) : null}
      <Questionnaire
        statements={QUESTIONNAIRE_STATEMENTS}
        responses={controller.set.responses}
        onAnswer={store ? controller.answer : undefined}
        onSkip={store ? controller.skip : undefined}
      />
    </>
  );
}
```

- [ ] **Step 3: Write the hydration-safety smoke test**

```tsx
// apps/boussole/src/ui/questionnaire-app.test.tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionnaireApp } from "./questionnaire-app";

describe("QuestionnaireApp — SSR baseline", () => {
  test("renders the empty questionnaire with no store (server render)", () => {
    const html = renderToStaticMarkup(<QuestionnaireApp />);
    expect(html).toContain("0 / 4 répondu(s).");
    expect(html).not.toContain("corrupt-notice");
    expect(html).not.toContain("style=");
  });
});
```

- [ ] **Step 4: Run tests + gates** — `PATH=… bun test apps/boussole`, `bun run typecheck`, `bunx biome ci apps/boussole`, `bun tools/quality/check-no-transmission.ts` → all PASS.

- [ ] **Step 5: Commit** — `git add apps/boussole/src/client/use-questionnaire.ts apps/boussole/src/ui/questionnaire-app.tsx apps/boussole/src/ui/questionnaire-app.test.tsx && git commit -s -m "feat(boussole): interactive questionnaire wrapper + store hook (WP-G3-B01)"`

---

### Task 4: Document + server handler

**Files:**

- Create: `apps/boussole/src/shared/document.tsx`
- Create: `apps/boussole/src/server/handler.ts`
- Create: `apps/boussole/src/server/index.ts`
- Test: `apps/boussole/src/server/handler.test.ts`

**Interfaces:**

- Consumes: `QuestionnaireApp` (Task 3); `@libre-ai/web-platform` (`DocumentDescriptor`, `renderSsrDocument`, `createRequestHandler`, `StaticAsset`, `parseServerAddress`).
- Produces: `boussoleDocument(): DocumentDescriptor` (with `clientModule: "/assets/app.js"`, `manifest`, `stylesheets`); `createBoussoleHandler(distRoot?, requestId?)`.

- [ ] **Step 1: Write the document factory**

```tsx
// apps/boussole/src/shared/document.tsx
import type { DocumentDescriptor } from "@libre-ai/web-platform";
import { QuestionnaireApp } from "../ui/questionnaire-app";

// SSR renders the empty questionnaire (no store on the server); the clientModule
// hydrates it into the interactive, IndexedDB-backed app.
export function boussoleDocument(): DocumentDescriptor {
  return {
    app: <QuestionnaireApp />,
    clientModule: "/assets/app.js",
    description:
      "Boussole civique de Libre AI — questionnaire entièrement sur votre appareil.",
    lang: "fr",
    manifest: "/manifest.webmanifest",
    stylesheets: ["/assets/styles.css"],
    title: "Libre AI — Boussole",
  };
}
```

- [ ] **Step 2: Write the failing handler test** (mirror `apps/*/src/server/handler.test.ts`)

```ts
// apps/boussole/src/server/handler.test.ts
import { describe, expect, test } from "bun:test";
import { createBoussoleHandler } from "./handler";

const handler = createBoussoleHandler(undefined, () => "req_0000000000000000");

describe("boussole handler", () => {
  test("serves the SSR questionnaire at /", async () => {
    const response = await handler(new Request("https://boussole.test/"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("Boussole — questionnaire");
    expect(html).toContain("0 / 4 répondu(s).");
  });

  test("reports health as JSON", async () => {
    const response = await handler(
      new Request("https://boussole.test/api/health"),
    );
    expect(await response.json()).toEqual({
      service: "libre-ai-boussole",
      status: "ok",
      version: "v1",
    });
  });

  test("an unknown route is not found", async () => {
    expect(
      (await handler(new Request("https://boussole.test/nope"))).status,
    ).toBe(404);
  });
});
```

- [ ] **Step 3: Run test to verify it fails** — FAIL ("Cannot find module ./handler").

- [ ] **Step 4: Write the handler** (copy-adapt `distribution/templates/bun-app/src/server/handler.ts`: same `assets` map — `/assets/app.js`, `/assets/styles.css`, `/assets/icon.svg`, `/manifest.webmanifest`, `/sw.js` from `distRoot` via `Bun.file` — and the `routes` below)

```ts
// apps/boussole/src/server/handler.ts
import { join } from "node:path";
import {
  createRequestHandler,
  renderSsrDocument,
  type StaticAsset,
} from "@libre-ai/web-platform";
import { boussoleDocument } from "../shared/document";

export function createBoussoleHandler(
  distRoot = join(import.meta.dir, "../../dist"),
  requestId = () => `req_${crypto.randomUUID().replaceAll("-", "")}`,
) {
  const asset = (path: string, contentType: string): StaticAsset => ({
    body: Bun.file(join(distRoot, path)),
    cacheControl: "public, max-age=300",
    contentType,
  });
  const assets: Record<string, StaticAsset> = {
    "/assets/app.js": asset("assets/app.js", "text/javascript; charset=utf-8"),
    "/assets/styles.css": asset("assets/styles.css", "text/css; charset=utf-8"),
    "/assets/icon.svg": asset("assets/icon.svg", "image/svg+xml"),
    "/manifest.webmanifest": {
      body: Bun.file(join(distRoot, "manifest.webmanifest")),
      contentType: "application/manifest+json",
    },
    "/sw.js": {
      body: Bun.file(join(distRoot, "sw.js")),
      contentType: "text/javascript; charset=utf-8",
    },
  };
  return createRequestHandler({
    assets,
    requestId,
    routes: {
      "/": () => renderSsrDocument(boussoleDocument()),
      "/api/health": () =>
        Response.json({
          service: "libre-ai-boussole",
          status: "ok",
          version: "v1",
        }),
    },
  });
}
```

- [ ] **Step 5: Write the server entry** (copy `distribution/templates/bun-app/src/server/index.ts`, swapping `createTemplateHandler` → `createBoussoleHandler` and the log line to "Libre AI Boussole").

- [ ] **Step 6: Run test to verify it passes + gates** — `PATH=… bun test apps/boussole`, `bun run typecheck`, `bunx biome ci apps/boussole`, `bun tools/quality/check-no-transmission.ts` → PASS.

- [ ] **Step 7: Commit** — `git add apps/boussole/src/shared apps/boussole/src/server && git commit -s -m "feat(boussole): SSR document + request handler (WP-G3-B01)"`

---

### Task 5: Client entry

**Files:**

- Create: `apps/boussole/src/client/app.tsx`
- Test: built + exercised by the e2e (Task 7); no unit test (it is a browser bootstrap).

**Interfaces:**

- Consumes: `hydrateDocument` (`@libre-ai/web-platform/client`); `boussoleDocument` (Task 4); `createIndexedDbResponseStore` (persistence); `QuestionnaireApp` (Task 3).

- [ ] **Step 1: Write the client entry**

```tsx
// apps/boussole/src/client/app.tsx
import { hydrateDocument } from "@libre-ai/web-platform/client";
import { createIndexedDbResponseStore } from "../persistence/indexed-db-response-store";
import { QuestionnaireApp } from "../ui/questionnaire-app";
import { boussoleDocument } from "../shared/document";

// Hydrate with the real IndexedDB-backed app. The document's `app` node is replaced
// by the store-backed wrapper; its initial render (empty questionnaire) matches the
// server markup, then the mount effect loads the persisted set. Local-only: the
// store is the ONLY sink for answers; nothing is transmitted.
const store = createIndexedDbResponseStore(globalThis.indexedDB);
hydrateDocument({
  ...boussoleDocument(),
  app: <QuestionnaireApp store={store} />,
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => undefined);
  });
}
```

- [ ] **Step 2: Gates** — `bunx biome ci apps/boussole`, `bun run typecheck`, and critically `bun tools/quality/check-no-transmission.ts` → PASS (confirm `serviceWorker.register` is not flagged; it is not on the forbidden list).
- [ ] **Step 3: Commit** — `git add apps/boussole/src/client/app.tsx && git commit -s -m "feat(boussole): client hydration entry with IndexedDB store (WP-G3-B01)"`

---

### Task 6: Build script + PWA assets + package.json

**Files:**

- Create: `apps/boussole/scripts/build.ts`
- Create: `apps/boussole/public/icon.svg`
- Modify: `apps/boussole/package.json`
- Test: `apps/boussole/src/server/handler.test.ts` already covers the served routes; the build output is exercised by the e2e (Task 7).

**Interfaces:**

- Produces: `dist/assets/app.js`, `dist/assets/styles.css`, `dist/assets/icon.svg`, `dist/manifest.webmanifest`, `dist/sw.js`, `dist/static/index.html`.

- [ ] **Step 1: Add dependencies to `apps/boussole/package.json`** — add `dependencies`: `@libre-ai/ui": "workspace:*"`, `@libre-ai/web-platform": "workspace:*"`, `react": "catalog:"`, `react-dom": "catalog:"`; add `@playwright/test": "catalog:testing"` to `devDependencies` (keep `fake-indexeddb`); add scripts `build`, `start`, `test:e2e` mirroring the template. Then `PATH=… bun install`.

- [ ] **Step 2: Write `scripts/build.ts`** — copy `distribution/templates/bun-app/scripts/build.ts`, changing: the entrypoint stays `src/client/app.tsx`; `referenceDocument` → `boussoleDocument`; `buildTailwindUtilities([...])` gets the utility classes actually used (`"lai-cluster"` etc. are foundation classes in `@libre-ai/ui/styles.css`; the Tailwind pass covers any `text-*`/spacing utilities you used — pass the exact class list, e.g. `["text-sm"]`); the manifest `name`/`short_name`/`start_url`/colours to Boussole values; the `sw.js` `CACHE` prefix to `libre-ai-boussole-`. Keep the hash-versioned service worker that caches ONLY the shell assets (never user data).

- [ ] **Step 3: Add `public/icon.svg`** — copy `distribution/templates/bun-app/public/icon.svg` (a simple inline SVG mark) or author a minimal boussole mark.

- [ ] **Step 4: Build + verify** — `PATH=… bun run --cwd apps/boussole build` → writes `dist/*`; confirm `dist/assets/app.js`, `dist/sw.js`, `dist/manifest.webmanifest`, `dist/static/index.html` exist. Ensure `dist/` is gitignored (the repo already ignores `dist/`; verify `check:source` does not flag it).

- [ ] **Step 5: Gates** — `bun run typecheck`, `bunx biome ci .`, `bun tools/quality/check-js-licenses.ts` (playwright already in lock from other apps), `bun tools/quality/check-no-transmission.ts`.

- [ ] **Step 6: Commit** — `git add apps/boussole/package.json apps/boussole/scripts apps/boussole/public bun.lock && git commit -s -m "feat(boussole): client build, PWA assets and scripts (WP-G3-B01)"`

---

### Task 7: e2e — no-JS baseline, PWA, round-trip, no-transmission

**Files:**

- Create: `apps/boussole/playwright.config.ts`
- Create: `apps/boussole/e2e/no-js.e2e.ts`
- Create: `apps/boussole/e2e/pwa.e2e.ts`
- Create: `apps/boussole/e2e/questionnaire.e2e.ts`

**Interfaces:**

- Consumes: the built `dist/` (Task 6) served by `src/server/index.ts`.

- [ ] **Step 1: Write `playwright.config.ts`** — copy `distribution/templates/bun-app/playwright.config.ts`, keeping the `chromium`/`firefox`/`webkit` projects pointing at `questionnaire.e2e.ts`, the `chromium-no-js` project (`javaScriptEnabled: false`) at `no-js.e2e.ts`, and the `chromium-pwa` project at `pwa.e2e.ts`. Keep its `webServer` block (`command: "bun run build && bun src/server/index.ts"`, `url`, `reuseExistingServer`).

- [ ] **Step 2: Write `no-js.e2e.ts`**

```ts
import { expect, test } from "@playwright/test";

test("the questionnaire baseline is usable without JavaScript", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Boussole",
  );
  await expect(page.getByText("Rien n'est transmis")).toBeVisible();
  await expect(page.getByTestId("progress")).toContainText("0 / 4");
  // Interactive answer controls are enhanced-only: not operable without JS.
  await expect(page.getByRole("button", { name: "Passer" })).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-hydrated",
    "true",
  );
});
```

- [ ] **Step 3: Write `questionnaire.e2e.ts` (round-trip + no-transmission)**

```ts
import { expect, test } from "@playwright/test";

test("answers persist on-device and are restored on reload, with zero transmission", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.origin === page.url() ? false : true)
      requests.push(`${r.method()} ${r.url()}`);
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  // Answer the first statement.
  await page
    .getByRole("group", { name: "stmt-services-publics" })
    .getByRole("button", { name: "+3" })
    .click();
  await expect(page.getByTestId("state-stmt-services-publics")).toContainText(
    "Répondu (3)",
  );
  await expect(page.getByTestId("progress")).toContainText("1 / 4");
  // Reload: the answer is restored from IndexedDB.
  await page.reload();
  await expect(page.getByTestId("state-stmt-services-publics")).toContainText(
    "Répondu (3)",
  );
  // No cross-origin request carried anything (local-only).
  expect(requests).toEqual([]);
});
```

- [ ] **Step 4: Write `pwa.e2e.ts`** — copy the template's `pwa.e2e.ts` shape: assert `/manifest.webmanifest` is served with the right content-type and required fields (`name`, `start_url`, `icons`), the service worker registers, and a second load works offline (route abort of non-cached, cached shell still serves). Adapt names to Boussole.

- [ ] **Step 5: Run e2e** — `PATH=… bun run --cwd apps/boussole test:e2e` → all projects PASS. (Requires Playwright browsers; if not installed locally, this runs in CI — note it and rely on the CI e2e job if present, otherwise run `bunx playwright install --with-deps chromium firefox webkit` first.)

- [ ] **Step 6: Commit** — `git add apps/boussole/playwright.config.ts apps/boussole/e2e && git commit -s -m "test(boussole): e2e no-js, pwa, round-trip and no-transmission (WP-G3-B01)"`

---

### Task 8: README + open the PR

- [ ] **Step 1: Add a boussole README section** "Increment 5 — client shell (walking skeleton)" describing the SSR baseline → hydration → IndexedDB round-trip, the no-JS baseline, and the e2e (no-js/pwa/round-trip/no-transmission). Commit with `WP-G3-B01`.
- [ ] **Step 2: Full local gate sweep** — `PATH=… bunx biome ci . && bun run typecheck && bun test apps/boussole && bun tools/quality/check-no-transmission.ts && bun tools/quality/check-js-licenses.ts` → all green.
- [ ] **Step 3: Push + open the PR** against `main` with the WP reference and the evidence (unit + e2e). Then dual-K4: one architecture/accessibility reviewer (hydration correctness, no-JS baseline, a11y, faithful template instantiation) and one privacy/security reviewer (no-transmission at rest AND at runtime, the service-worker caches no user data, corrupt-store fail-closed). Merge on 5 green gates + both APPROVE.

---

## Self-Review

- **Spec coverage:** SSR baseline (Task 2/4) ✓; hydration (Task 3/5) ✓; IndexedDB round-trip (Task 3 hook + Task 5 store + Task 7 e2e) ✓; no-JS baseline (Task 2 `lai-enhanced-only` + Task 7 no-js e2e) ✓; PWA shell (Task 6 manifest/sw + Task 7 pwa e2e) ✓; no-transmission (static gate every task + Task 7 runtime assertion) ✓; a11y (Task 2 skip link/fieldset/legend/labels, no colour-only) ✓; serial execution / boussole-first (this whole plan; practices is a follow-up plan) ✓; non-goals (no scoring/upgrade/export) — none built ✓.
- **Placeholder scan:** the template-mechanical files (Task 4 index, Task 6 build, Task 7 pwa/config) are specified as precise copy-adaptations of named template files with the exact changes listed — the engineer copies the cited file and applies the named diffs; the novel logic (view, wrapper, hook, document, client, fixture, tests) is given in full.
- **Type consistency:** `LocalResponseStore`, `ResponseSet`, `LocalResponse`, `DatasetBinding` are the domain/port types; `createIndexedDbResponseStore(factory)`, `boussoleDocument()`, `QuestionnaireApp({store})`, `useQuestionnaire(store?)`, `Questionnaire({statements,responses,onAnswer,onSkip})` are used consistently across tasks.
- **Open item to confirm at execution:** the exact `buildTailwindUtilities([...])` class list (Task 6 Step 2) — set it to the utility classes actually referenced (foundation `lai-*` classes come from `@libre-ai/ui/styles.css`, not Tailwind). Confirm against `packages/ui/src/tailwind.ts` when executing.
