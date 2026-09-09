# Open Verifiable Brand System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the canonical Libre AI brand platform, adopt its tested visual system, rebuild the public website around verifiable ownership, and align the organization profile without creating a second source of truth.

**Architecture:** `governance` owns brand semantics, doctrine, proof requirements, and a generated public-copy projection; `ui` owns all visual tokens, SVG geometry, reusable React components, and brand-asset licensing; `website` consumes SHA-pinned projections and UI assets to produce static no-JavaScript pages; `.github` receives generated bilingual introductions while preserving its generated fleet-status section. Dependencies move only downstream and every cross-repository pin targets a full reviewed commit SHA.

**Tech Stack:** Bun 1.4+, strict TypeScript 7, React 19, CSS custom properties, deterministic SVG, DTCG 2025.10, Playwright 1.61.1 for local Chromium/Firefox/WebKit qualification, Markdown/YAML/JSON static sources, Git worktrees.

**Spec:** `docs/superpowers/specs/2026-09-09-open-verifiable-brand-system-design.md`

## Global Constraints

- Security > quality > performance > completeness.
- French is canonical public copy; English is a governed translation for the GitHub organization profile. Code, comments, types, and commit messages are English.
- Canonical tension: `Les plateformes propriétaires vous louent le produit.`
- Canonical promise: `Possédez la fabrique.`
- Canonical explanation: `Libre AI réunit les logiciels, la méthode et les preuves pour construire des outils d'IA que vous pouvez vérifier, modifier et déployer où vous le décidez.`
- Primary CTA: `Prenez les clés.` Secondary CTA: `Voir les preuves.`
- Never claim `gratuit`, universal feature superiority, total security, total explainability, zero dependency, or absolute control.
- Product names remain `Libre AI <Product>` and come only from the LEXICON.
- Product state, maturity, progress, and verification dates come only from `project.v1.yaml` fleet projections.
- No client JavaScript, remote font, remote asset, analytics, cookie, account, CMS, or runtime external request on the public website.
- No AWS, GCP, Azure, Vercel, Netlify, Google Fonts, or proprietary design service. Playwright is local-only test tooling already pinned by the Libre AI fleet; it sends no project data to a service.
- Colors appear in production components only through `--lai-*` CSS variables. Jade and iris never form a gradient.
- Brand assets remain unpublished until the owner approves their exact `LicenseRef-Libre-AI-Brand-1.0` text and the visual-similarity dossier.
- New non-trivial logic starts with a failing test. No `unwrap`, panic-equivalent assertion in runtime code, hidden warning, or ignored failure.
- Each repository ends with `bun run check` green and no warning introduced by this work. Existing Governance warnings are removed in a separate preparatory commit.
- The original working directories remain untouched; implementation uses
  isolated worktrees under the repository parent's `.worktrees/` directory.
- Local absolute paths never enter a tracked file.
- Commits are descriptive English commits with DCO sign-off and no `Co-Authored-By` trailer.
- No push, pull request, merge, asset publication, or deployment occurs without the corresponding external-action or owner-signature authority.

---

### Task 1: Make the Governance Baseline Warning-Free

**Files:**

- Modify: `tools/quality/check-dead-code.ts`
- Modify: `tools/security/keygen-ceremony.ts`
- Modify: `verification/dependency-bench/run.ts`
- Test: existing tests adjacent to each module

**Interfaces:**

- Consumes: current `bun run lint` findings on `main`.
- Produces: the same runtime behavior and test results with Biome reporting zero warnings.

- [ ] **Step 1: Capture the three existing lint warnings**

Run:

```bash
bun run lint
```

Expected: exit 0 with exactly the pre-existing unused `failures`, unused `KeyGenerationOutput`, and literal template-placeholder warnings.

- [ ] **Step 2: Remove only dead declarations and make the fixture string explicit**

Apply these behavior-preserving edits:

```ts
// tools/quality/check-dead-code.ts
// Delete the unused `const failures: string[] = [];` declaration only.

// tools/security/keygen-ceremony.ts
// Delete the unused private `KeyGenerationOutput` interface only.

// verification/dependency-bench/run.ts
const interpolation = "${name}";
await write(
  "satellite/src/index.ts",
  `export function greet(name: string): string {\n  return \`bonjour ${interpolation}\`;\n}\n`,
);
```

- [ ] **Step 3: Prove behavior and lint output**

Run:

```bash
bun test
bun run lint
```

Expected: the complete Governance suite passes and Biome prints `Found 0 warnings` or no warning section.

- [ ] **Step 4: Commit the independent cleanup**

```bash
git add tools/quality/check-dead-code.ts tools/security/keygen-ceremony.ts verification/dependency-bench/run.ts
git commit -s -m "chore: remove governance lint warnings"
```

---

### Task 2: Establish the Canonical Brand Authority and Public Projection

**Files:**

- Create: `brand/README.md`
- Create: `brand/README.en.md`
- Create: `brand/proof-matrix.md`
- Create: `brand/references.md`
- Create: `brand/build-public-projection.ts`
- Create: `brand/build-public-projection.test.ts`
- Create: `brand/projections/public-brand.v1.json` (generated)
- Create: `tools/quality/check-brand-platform.ts`
- Create: `tools/quality/check-brand-platform.test.ts`
- Create: `docs/adr/0033-open-verifiable-brand-system.md`
- Modify: `docs/decisions/INVARIANTS.md`
- Modify: `docs/decisions/DECISION-REGISTER.md`
- Modify: `docs/README.md`
- Modify: `TRADEMARKS.md`
- Modify: `package.json`
- Modify: `project.v1.yaml`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-09-09-open-verifiable-brand-system-design.md`

**Interfaces:**

- Consumes: ADR-0008 brand name and naming, ADR-0009 portfolio/proof doctrine, I-01/I-13/I-14/I-15/I-20, and the approved design spec.
- Produces: `buildPublicBrandProjection(frenchMarkdown, englishMarkdown, proofMatrixMarkdown) -> PublicBrandProjection`; `validateBrandPlatform(documents) -> readonly string[]`; generated `libre-ai.public-brand.v1` JSON for downstream build-time consumers.

- [ ] **Step 1: Write failing projection tests**

Create the following public types and tests before implementation:

```ts
interface PublicBrandCopy {
  readonly tension: string;
  readonly promise: string;
  readonly explanation: string;
  readonly qualification: string;
  readonly reasonToBelieve: string;
  readonly primaryCta: string;
  readonly secondaryCta: string;
}

interface PublicProof {
  readonly claim: string;
  readonly mechanism: string;
  readonly source: string;
  readonly verifiedOn: string;
  readonly limitation: string;
}

interface PublicBrandProjection {
  readonly schema_version: "libre-ai.public-brand.v1";
  readonly generated_from: readonly ["brand/README.md", "brand/README.en.md", "brand/proof-matrix.md"];
  readonly copy: { readonly fr: PublicBrandCopy; readonly en: PublicBrandCopy };
  readonly proofs: readonly PublicProof[];
}
```

Tests must assert:

```ts
expect(projection.copy.fr.tension).toBe("Les plateformes propriétaires vous louent le produit.");
expect(projection.copy.fr.promise).toBe("Possédez la fabrique.");
expect(projection.copy.fr.primaryCta).toBe("Prenez les clés.");
expect(projection.proofs).toHaveLength(3);
expect(() => buildPublicBrandProjection(missingMarker, en, matrix)).toThrow(
  "brand.public_copy_marker_missing:tension",
);
expect(() => buildPublicBrandProjection(fr, en, matrixWithHttp)).toThrow(
  "brand.proof_source_invalid",
);
```

Run:

```bash
bun test brand/build-public-projection.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 2: Implement strict marker and proof-table parsing**

Use unique HTML comments in both language documents:

```markdown
<!-- libre-ai:brand:tension -->
Les plateformes propriétaires vous louent le produit.
```

Implement:

```ts
export function buildPublicBrandProjection(
  frenchMarkdown: string,
  englishMarkdown: string,
  proofMatrixMarkdown: string,
): PublicBrandProjection;

export function renderPublicBrandProjection(projection: PublicBrandProjection): string {
  return `${JSON.stringify(projection, null, 2)}\n`;
}
```

Fail closed on a missing/duplicate marker, empty value, wrong canonical French phrase, proof row with fewer or more than five cells, non-ISO date, non-HTTPS URL, empty limitation, or fewer/more than three public proofs. Sort nothing: canonical document order is public order.

- [ ] **Step 3: Write the canonical French and English platforms**

`brand/README.md` carries the exact approved platform, the voice rules, the `Libre AI <Product>` family architecture, allowed tension formulas, forbidden absolute claims, and visual-semantic rules. `brand/README.en.md` is a governed translation with:

```text
Proprietary platforms rent you the product.
Own the factory.
Libre AI brings together the software, method, and evidence to build AI tools you can inspect, modify, and deploy where you choose.
Open, sovereign, and explainable.
Built in an open factory where evidence is part of the product.
Take the keys.
See the evidence.
```

`brand/proof-matrix.md` contains exactly three public rows:

```markdown
| Affirmation | Mécanisme | Source | Vérifié le | Limite |
| --- | --- | --- | --- | --- |
| Logiciels ouverts | Code et licences sont publics, versionnés et inspectables. | https://github.com/libre-ai | 2026-09-09 | La présence d'un dépôt ne prouve ni disponibilité ni parité fonctionnelle. |
| Souveraineté | Les choix d'hébergement, dépendances et mécanismes de réversibilité sont publiés. | https://github.com/libre-ai/governance/blob/main/docs/decisions/INVARIANTS.md | 2026-09-09 | La cible runtime est documentée ; aucun déploiement non prouvé n'est présenté comme actif. |
| Explicabilité | Décisions, états et limites sont reliés à des sources versionnées. | https://github.com/libre-ai/governance | 2026-09-09 | Cette traçabilité n'implique pas que toute sortie de modèle soit causalement explicable. |
```

`brand/references.md` records the dated non-normative research links and the exact `recover / adapt / reject` lesson for Trail, Proton, Mullvad, Ink & Switch, Mozilla, Oxide, LaSuite, Mistral, Element, GitLab, and Nextcloud.

- [ ] **Step 4: Generate and lock the public projection**

The CLI reads repository-relative paths, renders `brand/projections/public-brand.v1.json`, and supports `--check` byte comparison. Run:

```bash
bun brand/build-public-projection.ts
bun brand/build-public-projection.ts --check
bun test brand/build-public-projection.test.ts
```

Expected: generated file is stable and all tests pass.

- [ ] **Step 5: Write failing authority-gate tests**

Define:

```ts
export interface BrandDocuments {
  readonly french: string;
  readonly english: string;
  readonly proofMatrix: string;
  readonly trademarks: string;
  readonly authorityMap: string;
  readonly invariants: string;
  readonly decisions: string;
}

export function validateBrandPlatform(documents: BrandDocuments): readonly string[];
```

Test that validation refuses a missing I-29, missing D39, missing authority-map row, missing asset-publication guard, stale generated projection, or forbidden canonical phrase `plus complet que tous les concurrents`. Test that explanatory text quoting the forbidden claim as an explicit prohibition remains allowed.

- [ ] **Step 6: Record the owner decision as doctrine**

Create ADR-0033 with the session decisions: closed-factory dependency as adversary, `Possédez la fabrique` as promise, verifiable proof as credibility mechanism, `Libre AI <Product>` family, Envol constructif, constructed swift, repository ownership, and publication hard stops. Add:

```text
I-29 | Brand system: Libre AI contrasts a rented proprietary product with ownership of the factory; canonical promise “Possédez la fabrique”; every public qualifier is adjacent to a mechanism, source, verification date and limitation; `governance` owns semantics, `ui` owns visual realization, public surfaces are projections. | ADR-0033 | 2026-09-09
```

Add D39 with the same bounded decision, add `Brand platform → brand/` to `docs/README.md`, and update `TRADEMARKS.md` so a figurative asset requires both a dedicated LicenseRef and an archived similarity review before publication.

- [ ] **Step 7: Make the authority gate green**

Implement `validateBrandPlatform`, a CLI using `GateReport`, and scripts:

```json
"build:brand": "bun brand/build-public-projection.ts",
"check:brand": "bun brand/build-public-projection.ts --check && bun tools/quality/check-brand-platform.ts"
```

Insert `bun run check:brand` in the aggregate `check` before lint. Update the Governance card with a pending brand-adoption criterion and regenerate only its generated README status block through the existing project-card renderer.

Run:

```bash
bun test brand/build-public-projection.test.ts tools/quality/check-brand-platform.test.ts
bun run check:brand
bun run check
```

Expected: all brand tests and 913+ repository tests pass, zero Biome warning, no generated drift.

- [ ] **Step 8: Commit the immutable doctrine candidate**

```bash
git add brand docs/adr/0033-open-verifiable-brand-system.md docs/decisions/INVARIANTS.md docs/decisions/DECISION-REGISTER.md docs/README.md TRADEMARKS.md package.json project.v1.yaml README.md docs/superpowers/specs/2026-09-09-open-verifiable-brand-system-design.md tools/quality/check-brand-platform.ts tools/quality/check-brand-platform.test.ts
git commit -s -m "feat: establish the Libre AI brand authority"
```

Record the full commit SHA. The candidate requires role-separated doctrine review and owner merge signature before downstream publication.

---

### Task 3: Adopt Envol Constructif as the Production Token Source

**Files:**

- Create: `color-system/adopt.ts`
- Create: `color-system/adopt.test.ts`
- Create: `src/tokens.css` (generated)
- Modify: `color-system/generate.ts`
- Modify: `color-system/palettes.ts`
- Modify: `color-system/README.md`
- Modify: `color-system/generated/convergence/README.md` (generated status)
- Modify: `color-system/generated/convergence/tokens.json` (generated status)
- Modify: `src/styles.css`
- Modify: `package.json`
- Modify: `project.v1.yaml`
- Modify: `README.md`

**Interfaces:**

- Consumes: `CONVERGENCE`, `buildColorSystem`, and the reviewed DTCG/color audit pipeline.
- Produces: `buildAdoptedThemeCss() -> string`; generated `src/tokens.css`; `bun color-system/adopt.ts --check` drift gate.

- [ ] **Step 1: Create the isolated UI worktree and prove its baseline**

```bash
git worktree add ../.worktrees/brand-ui -b brand/open-verifiable-factory main
bun install --frozen-lockfile
bun run check
```

Expected: current UI suite passes before edits. If it does not, stop and report the baseline failure.

- [ ] **Step 2: Write failing adoption tests**

Tests assert:

```ts
expect(ADOPTED_PALETTE_SLUG).toBe("convergence");
expect(buildAdoptedThemeCss()).toContain("--lai-color-brand-primary: #1e6c49");
expect(buildAdoptedThemeCss()).toContain("--lai-color-brand-secondary: #5d5483");
expect(buildAdoptedThemeCss()).toContain('@media (prefers-color-scheme: dark)');
expect(buildAdoptedThemeCss()).toContain('@media (forced-colors: active)');
expect(buildAdoptedThemeCss()).not.toMatch(/linear-gradient|radial-gradient/i);
```

Run `bun test color-system/adopt.test.ts`; expect module-not-found failure.

- [ ] **Step 3: Expose deterministic CSS generation and implement adoption**

Export `generateCss(system: ColorSystem): string` from `generate.ts`. Add:

```ts
export const ADOPTED_PALETTE_SLUG = "convergence" as const;

export function buildAdoptedThemeCss(): string {
  return generateCss(buildColorSystem(CONVERGENCE));
}
```

The CLI writes `src/tokens.css` without an absolute path and `--check` refuses byte drift. Update generated convergence metadata from `candidate/non-normative` to `adopted/normative` only for this palette; the four exploratory palettes stay non-normative.

- [ ] **Step 4: Replace manual color literals with semantic tokens**

Place `@import "./tokens.css";` before layer declarations in `src/styles.css`. Remove the manual color declarations and map existing components to the generated semantic roles:

```css
--lai-color-canvas: var(--lai-color-background);
--lai-color-ink: var(--lai-color-text-primary);
--lai-color-muted: var(--lai-color-text-muted);
--lai-color-border: var(--lai-color-border-default);
--lai-color-accent: var(--lai-color-action-primary);
--lai-color-accent-strong: var(--lai-color-action-primary-hover);
--lai-color-on-accent: var(--lai-color-text-inverse);
--lai-color-focus: var(--lai-color-focus-ring);
```

Do not introduce raw colors outside `tokens.css` or color-system fixtures.

- [ ] **Step 5: Add drift commands and update project evidence**

Add this exact candidate text, kept unpublished until owner review:

```text
Libre AI Brand Assets License 1.0

Copyright (c) 2026 Libre AI contributors. All rights reserved except for the permission below.

Permission is granted to reproduce an unmodified Libre AI brand asset solely next to a truthful nominative reference to Libre AI, provided that the use does not imply sponsorship, certification, partnership, endorsement, or official distribution and is no more prominent than the user's own product or organization name.

No permission is granted to alter a Libre AI brand asset; use it as the logo or primary branding of a fork, product, service, company, or domain; use it in advertising, merchandising, or certification; or present compatibility in a way that suggests endorsement. Those uses require prior written permission.

This copyright permission does not grant ownership of a Libre AI name or mark, does not state that a mark is registered, and does not limit rights that apply independently under trademark law. Forks must use distinct names and branding. Software and content licenses remain separate from this license.
```

Then add:

```json
"generate:colors": "bun color-system/generate.ts && bun color-system/adopt.ts",
"check:colors": "bun color-system/generate.ts --check && bun color-system/adopt.ts --check"
```

Run `check:colors` before lint in aggregate `check`. Add an accepted `brand-color-adoption` criterion to `project.v1.yaml` only after the tests pass; regenerate the README block.

- [ ] **Step 6: Verify and commit**

```bash
bun run generate:colors
bun test color-system/color-system.test.ts color-system/generated-assets.test.ts color-system/adopt.test.ts
bun run check
git add color-system src/tokens.css src/styles.css package.json project.v1.yaml README.md
git commit -s -m "feat: adopt the Envol Constructif color system"
```

---

### Task 4: Build the Constructed Swift, Asset Gate, and Brand Components

**Files:**

- Create: `src/brand-geometry.ts`
- Create: `src/brand.tsx`
- Create: `src/brand.test.tsx`
- Create: `src/evidence.tsx`
- Create: `src/evidence.test.tsx`
- Create: `src/assets/libre-ai-mark.svg` (generated)
- Create: `tools/generate-brand-assets.ts`
- Create: `tools/generate-brand-assets.test.ts`
- Create: `LICENSES/LicenseRef-Libre-AI-Brand-1.0.txt`
- Create: `evidence/BRAND-MARK-SIMILARITY-REVIEW.md`
- Modify: `src/index.ts`
- Modify: `src/styles.css`
- Modify: `package.json`
- Modify: `REUSE.toml`

**Interfaces:**

- Produces: `BrandMark`, `BrandLockup`, `ProductSignature`, `EvidenceLabel`, `EvidencePanel`, `ProjectStatus`, `OpenFrame`, plus the exported SVG asset.
- Consumes: adopted semantic tokens and reviewed French brand semantics; components perform no I/O.

- [ ] **Step 1: Write failing geometry and asset tests**

Define the single geometry source:

```ts
export const BRAND_MARK_VIEW_BOX = "0 0 24 24";
export const BRAND_MARK_PARTS = [
  "M1 6H7L12 11L9 14L5 11H1Z",
  "M23 6H17L12 11L15 14L19 11H23Z",
  "M10 10H14L13 18L12 22L11 18Z",
] as const;
```

Tests require three paths, viewBox 24, no decimal coordinates, and generated SVG with none of `script`, `foreignObject`, `href`, `url(`, `gradient`, `filter`, `style`, remote URL, embedded raster, metadata, or event attribute. A second generation must be byte-identical.

- [ ] **Step 2: Generate the standalone mark from the shared geometry**

Implement:

```ts
export function renderBrandMarkSvg(): string {
  const paths = BRAND_MARK_PARTS.map((path) => `  <path d="${path}"/>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_MARK_VIEW_BOX}" fill="currentColor" aria-hidden="true">\n${paths}\n</svg>\n`;
}
```

The CLI supports write and `--check`. Expose `./brand/mark.svg` from `package.json` and include the generated asset in packed files.

- [ ] **Step 3: Write failing accessibility tests for identity components**

Use explicit props:

```ts
export interface BrandMarkProps extends Omit<SVGProps<SVGSVGElement>, "aria-label"> {
  accessibleName: string | null;
}

export interface BrandLockupProps extends HTMLAttributes<HTMLSpanElement> {
  product: string | null;
}

export interface ProductSignatureProps extends HTMLAttributes<HTMLElement> {
  name: string;
  summary: string;
  maturity: string;
  status: string;
  verifiedOn: string;
  sourceHref: string;
}
```

Tests verify decorative mark output has `aria-hidden=true`, named output has `role=img` and the exact accessible name, lockup renders `Libre AI` once, product text remains text rather than an SVG path, and all URL-bearing props reject anything except HTTPS at the application renderer boundary.

- [ ] **Step 4: Implement identity components with native semantics**

Render the same `BRAND_MARK_PARTS` paths in React. `BrandLockup` contains the mark plus `<span>Libre AI</span>` and optional product `<span>`. `ProductSignature` is an `<article>` with heading, summary and `ProjectStatus`; it never maps maturity to marketing copy.

- [ ] **Step 5: Write failing evidence-component tests**

Define:

```ts
export interface EvidencePanelProps extends HTMLAttributes<HTMLElement> {
  claim: string;
  mechanism: string;
  sourceHref: string;
  verifiedOn: string;
  limitation: string | null;
}

export interface EvidenceLabelProps {
  label: "SOURCE" | "ÉTAT" | "VÉRIFIÉ LE" | "VERSION" | "LIMITE";
  value: ReactNode;
}
```

Tests assert semantic `<article>`, visible limitation when non-null, omission when null, ISO datetime attribute, external link label, no default claim/source, and no script/event handler/remote asset generated by the component itself.

- [ ] **Step 6: Implement evidence components and open-frame styling**

Use native `<dl>`, `<time>`, `<article>`, and `<a>` elements. The open frame is CSS borders with one interrupted corner implemented with pseudo-elements and semantic tokens; no canvas, clip-path dependency, or decorative node graph.

- [ ] **Step 7: Add the conservative asset license candidate and review dossier**

`LicenseRef-Libre-AI-Brand-1.0.txt` reproduces the permissions and prohibitions already present in Governance `TRADEMARKS.md`: unmodified truthful nominative reference is permitted; primary branding, alteration, certification, sponsorship implication, merchandising, and confusing product naming require prior written permission. The file explicitly states that it grants no trademark registration claim.

`BRAND-MARK-SIMILARITY-REVIEW.md` records searches against EUIPO eSearch plus, INPI, WIPO Global Brand Database, and the named visual reference set; includes query date, classes, search terms, candidate image digest, results, and the bounded statement `visual screening, not legal clearance`. Do not mark it accepted without real searches.

- [ ] **Step 8: Verify, inspect the SVG, and commit the candidate**

```bash
bun tools/generate-brand-assets.ts
bun tools/generate-brand-assets.ts --check
bun test src/brand.test.tsx src/evidence.test.tsx tools/generate-brand-assets.test.ts
bun run check
git add src tools/generate-brand-assets.ts tools/generate-brand-assets.test.ts LICENSES/LicenseRef-Libre-AI-Brand-1.0.txt evidence/BRAND-MARK-SIMILARITY-REVIEW.md package.json REUSE.toml
git commit -s -m "feat: add the constructed swift brand primitives"
```

The commit remains an unpublished candidate until the owner accepts the exact mark and license text.

---

### Task 5: Qualify the Visual System in Three Browser Engines

**Files:**

- Create: `brand/build-reference.ts`
- Create: `brand/build-reference.test.ts`
- Create: `brand/reference.html` (generated)
- Create: `brand/reference.e2e.ts`
- Create: `playwright.config.ts`
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:**

- Consumes: production `styles.css`, `tokens.css`, generated mark, and all brand components rendered through React SSR.
- Produces: deterministic local `brand/reference.html`; screenshots/test traces remain disposable evidence and are never runtime dependencies.

- [ ] **Step 1: Qualify the Playwright dependency before adding it**

Reuse the fleet version exactly:

```json
"@playwright/test": "1.61.1"
```

Record in the commit body or evidence: Apache-2.0, local-only test process, no hosted service, no runtime data, no US hyperscaler dependency, browser binaries disposable. This passes the sovereign-stack dependency policy; it is not a runtime sovereignty claim.

- [ ] **Step 2: Write the failing deterministic-reference test**

The test expects sections `Identity`, `Proof`, `Products`, `Light`, `Dark`, `Forced colors`, and `Small size`; exact tension/promise; no `<script`; no remote URL; one local stylesheet and one local SVG asset; two calls to `renderReferencePage()` are byte-identical.

- [ ] **Step 3: Render the reference page with React SSR**

Implement `renderReferencePage(): string` and a CLI that writes only `brand/reference.html`. The page presents the mark at 16/24/48/96 px, wordmark/product lockups, three proof panels, product status, buttons, long text, and prohibited-combination examples labelled `Do not use` without rendering a jade/iris gradient.

- [ ] **Step 4: Add three-engine and degraded-mode E2E**

Configure Chromium, Firefox, WebKit, Chromium with JS disabled, reduced motion, and forced colors. Tests assert:

```ts
await expect(page.getByRole("heading", { level: 1 })).toHaveText("Possédez la fabrique.");
expect(remoteRequests).toEqual([]);
await expect(page.getByRole("img", { name: "Libre AI" })).toBeVisible();
await expect(page.getByText("Limite", { exact: true })).toBeVisible();
```

Also test keyboard order, visible skip link, 320 px viewport, 200 % and 400 % zoom-equivalent viewport, and computed contrast pairs against the generated audit.

- [ ] **Step 5: Run full UI qualification and commit**

```bash
bun run build:brand-reference
bun test
bun run test:e2e
bun run check
git add brand playwright.config.ts package.json bun.lock .gitignore README.md
git commit -s -m "test: qualify the brand system across browsers"
```

Expected: all three engines and no-JS/degraded variants pass; no remote request observed.

---

### Task 6: Rebuild the Website Domain and Security Boundaries Under TDD

**Files:**

- Create: `src/domain.ts`
- Create: `src/domain.test.ts`
- Create: `src/security.ts`
- Create: `src/security.test.ts`
- Create: `src/content.ts`
- Create: `src/templates.ts`
- Create: `src/templates.test.ts`
- Modify: `src/build.ts`
- Modify: `src/build.test.ts`
- Modify: `package.json`
- Modify: `bun.lock`

**Interfaces:**

- Consumes: SHA-pinned `@libre-ai/governance/brand/projections/public-brand.v1.json`, fleet status, and SHA-pinned `@libre-ai/ui` CSS/SVG exports.
- Produces: validated `PublicBrandProjection`, `Evidence`, grouped fleet view, static page renderers, and build artifacts.

- [ ] **Step 1: Create the isolated website worktree and baseline**

```bash
git worktree add ../.worktrees/brand-website -b brand/open-verifiable-factory main
bun install --frozen-lockfile
bun run check
```

Expected: existing build and tests pass before changes.

- [ ] **Step 2: Write strict domain tests**

Define:

```ts
export interface Evidence {
  readonly claim: string;
  readonly mechanism: string;
  readonly source: URL;
  readonly verifiedOn: string;
  readonly limitation: string;
}

export function parseBrandProjection(value: unknown): PublicBrandProjection;
export function groupFleetRows(rows: readonly FleetRow[]): ReadonlyMap<string, readonly FleetRow[]>;
export function toEvidence(proof: PublicProof): Evidence;
```

Fail on unknown schema, missing canonical copy, invalid ISO date, empty limitation, duplicate claim, non-HTTPS source, HTML in schema values being treated as markup, and unknown fleet layer. Preserve input order within canonical groups.

- [ ] **Step 3: Write URL and output-security tests**

Define:

```ts
export function requirePublicHttpsUrl(value: string): URL;
export function findRemoteAssetReferences(htmlOrCss: string): readonly string[];
export function findExecutableMarkup(html: string): readonly string[];
```

Permit HTTPS links as navigation, but reject `http:`, `javascript:`, `data:`, protocol-relative URLs, remote `src`, remote CSS `url()`, inline event handlers, scripts, iframes, forms, and `foreignObject`. Local `./assets/*` remains allowed.

- [ ] **Step 4: Split pure rendering from I/O**

`templates.ts` exports:

```ts
export function renderHome(input: HomePageInput): string;
export function renderComparisons(input: ComparisonsPageInput): string;
export function renderBrandGuide(input: BrandGuidePageInput): string;
```

`build.ts` performs only validated reads, copies UI assets, renders files, runs output guards, and writes `dist`. Keep `escapeHtml` in `security.ts` and require it for every dynamic string.

- [ ] **Step 5: Pin reviewed upstream commits**

After the Governance doctrine candidate and UI visual candidate are available on approved remote branches or merged `main`, set full 40-character SHAs in `package.json`; never use a branch name. Run `bun install --frozen-lockfile` only after `bun.lock` records the exact reachable commits. If external publication is not authorized, use an untracked local link for development and do not commit an unreachable git revision.

- [ ] **Step 6: Make focused tests green and commit the foundation**

```bash
bun test src/domain.test.ts src/security.test.ts src/templates.test.ts src/build.test.ts
bun run typecheck
git add src package.json bun.lock
git commit -s -m "refactor: establish the static website rendering boundary"
```

---

### Task 7: Deliver the Public Home, Proofs, Brand Guide, and Browser Evidence

**Files:**

- Create: `src/styles.ts`
- Create: `src/preview.ts`
- Create: `e2e/website.e2e.ts`
- Create: `e2e/no-js.e2e.ts`
- Create: `playwright.config.ts`
- Create: `docs/evidence/brand-website-visual-review.md`
- Modify: `src/templates.ts`
- Modify: `src/templates.test.ts`
- Modify: `src/build.ts`
- Modify: `src/build.test.ts`
- Modify: `README.md`
- Modify: `README.fr.md`
- Modify: `project.v1.yaml`
- Modify: `package.json`
- Modify: `bun.lock`

**Interfaces:**

- Consumes: Task 6 validated inputs and copied UI assets.
- Produces: `dist/index.html`, `dist/comparaisons.html`, `dist/marque.html`, `dist/assets/styles.css`, `dist/assets/tokens.css`, `dist/assets/libre-ai-mark.svg`.

- [ ] **Step 1: Write failing home structure tests**

Assert exact order and semantics:

```ts
expect(html.indexOf("Les plateformes propriétaires vous louent le produit.")).toBeLessThan(
  html.indexOf("Possédez la fabrique."),
);
expect(html.indexOf("Possédez la fabrique.")).toBeLessThan(html.indexOf("Voir les preuves"));
expect(html).toContain('id="preuves"');
expect(html).toContain('id="produits"');
expect(html).toContain('id="methode"');
expect(html).toContain('id="etat-complet"');
expect(html).not.toContain("<script");
```

Also assert all three proof panels include mechanism/source/date/limitation, every fleet row appears exactly once in the exhaustive table, and no product count or global percentage is hard-coded in the hero.

- [ ] **Step 2: Implement the editorial sequence**

Render navigation, hero, provenance strip, proofs, product cards grouped by public audience, four-step factory (`Décider`, `Construire`, `Vérifier`, `Publier`), exhaustive status table, contribution section, and source/licence footer. Keep comparisons factual and sourced.

- [ ] **Step 3: Implement the brand guide projection**

`marque.html` renders the canonical copy, concept, approved color roles, mark sizes, clear-space rule of one joint width, correct/incorrect uses, family naming, downloadable approved assets, and trademark policy link. If the mark/license control is not accepted, render only the text wordmark and a clear `figurative assets not yet published` statement; never silently expose candidate files.

- [ ] **Step 4: Apply the visual system without raw colors**

Copy `styles.css`, `tokens.css`, and the approved mark from the pinned UI package. `styles.ts` provides only page layout classes composed from existing `--lai-*` variables. Add an automated test that strips comments and rejects `#`, `rgb(`, `hsl(`, `oklch(`, `linear-gradient`, and `radial-gradient` in website-owned CSS.

- [ ] **Step 5: Add local Playwright qualification**

Add `@playwright/test: 1.61.1`, copying the fleet's local-only configuration. `preview.ts` serves only `dist` on `127.0.0.1`, refuses traversal, maps `/` to `index.html`, sets CSP `default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`, and returns explicit 404s.

E2E covers Chromium, Firefox, WebKit, no-JS, reduced motion, forced colors, keyboard, 320 px, 200/400 % zoom, no remote requests, three pages, assets, skip link, headings, tables, and CTAs.

- [ ] **Step 6: Add deterministic/security/performance gates**

Run the build twice into two temporary directories and compare SHA-256 per file. Refuse broken internal anchors and links. Enforce 150 KiB per HTML+CSS+SVG page bundle, excluding the fleet table only by measuring and reporting its separate byte count rather than silently removing it.

- [ ] **Step 7: Render and inspect the candidate**

Render screenshots at desktop light/dark, mobile 320 px, and forced colors. Record each inspected viewport and finding in `docs/evidence/brand-website-visual-review.md`; evidence includes file hashes, not embedded PII or machine-local absolute paths. Fix clipping, hierarchy, contrast, or ambiguity before acceptance.

- [ ] **Step 8: Run full website gates and commit**

```bash
bun test
bun run test:e2e
bun run check
git add src e2e playwright.config.ts docs/evidence README.md README.fr.md project.v1.yaml package.json bun.lock
git commit -s -m "feat: rebuild the Libre AI public brand experience"
```

Expected: all static, browser, security, determinism, and budget gates pass with zero warning.

---

### Task 8: Generate and Align the Organization Profile

**Files:**

- Create in Governance: `tools/presentation/render-org-brand-intro.ts`
- Create in Governance: `tools/presentation/render-org-brand-intro.test.ts`
- Modify in Governance: `tools/presentation/check-org-readme-drift.ts`
- Modify in Governance: `tools/presentation/check-org-readme-drift.test.ts`
- Modify in `.github`: `profile/README.md`
- Modify in `.github`: `profile/README.fr.md`

**Interfaces:**

- Consumes: Governance `public-brand.v1.json` plus the existing generated fleet section.
- Produces: `renderOrgBrandIntro(projection, language) -> string`; exact drift checks for both language introductions without changing the fleet renderer.

- [ ] **Step 1: Write failing bilingual renderer tests in Governance**

Define:

```ts
export type BrandLanguage = "fr" | "en";
export function renderOrgBrandIntro(
  projection: PublicBrandProjection,
  language: BrandLanguage,
): string;
```

French output must contain the exact tension, promise, explanation, and links to products/proofs. English output must contain the governed translations. Both outputs use `<!-- libre-ai:brand-intro:begin/end -->` sentinels. Tests refuse missing or duplicated sentinels and semantic drift against a fresh render.

- [ ] **Step 2: Extend the live drift gate**

Read both `profile/README.md` and `profile/README.fr.md` from `.github/main`; compare only their brand-intro and existing project-status generated sections. Keep handwritten connective content outside sentinels. A network read failure remains red.

- [ ] **Step 3: Commit the Governance renderer**

```bash
bun test tools/presentation/render-org-brand-intro.test.ts tools/presentation/check-org-readme-drift.test.ts
bun run check
git add tools/presentation
git commit -s -m "feat: generate the organization brand introduction"
```

- [ ] **Step 4: Create the isolated `.github` worktree and update both profiles**

```bash
git worktree add ../.worktrees/brand-dot-github -b brand/open-verifiable-factory main
```

Generate the two intro blocks with the Governance command. Preserve the status section byte-for-byte. Remove the obsolete hand-authored hero and fixed product-count language, but keep product descriptions only where they still match current cards.

- [ ] **Step 5: Verify and commit the projections**

Run local Markdown link checks available in the repository, then use Governance pure drift functions against both generated files without network. Commit:

```bash
git add profile/README.md profile/README.fr.md
git commit -s -m "docs: align the organization profile with the brand system"
```

---

### Task 9: Cross-Repository Review, Acceptance Evidence, and Release Gate

**Files:**

- Create in Governance: `docs/reviews/brand-system/<governance-sha>/SECURITY-VERDICT.md`
- Create in Governance: `docs/reviews/brand-system/<governance-sha>/QUALITY-VERDICT.md`
- Create in Governance: `docs/reviews/brand-system/<governance-sha>/VISUAL-VERDICT.md`
- Create in Governance: `distribution/evidence/2026-09-09-brand-system-candidate.md`
- Modify in Governance: `project.v1.yaml`
- Modify in Governance: `README.md` generated status section

**Interfaces:**

- Consumes: immutable commit SHAs and full gate outputs from Governance, UI, Website, and `.github`.
- Produces: auditable candidate verdicts and an owner decision package; no automatic merge or deployment.

- [ ] **Step 1: Rebase or merge current main into each worktree without rewriting user history**

Fetch safely, inspect divergence, and use non-destructive integration. Never force-push. Re-run `git status --short` before using any prior result.

- [ ] **Step 2: Run every repository gate from a clean index**

```bash
bun run check
```

Run in Governance, UI, and Website. Run the `.github` link/projection checks through Governance. Record command, commit SHA, UTC timestamp, pass/fail, test count, warning count, and artifact hashes.

- [ ] **Step 3: Run adversarial review on immutable candidates**

Security review checks injection/escaping, remote requests, PII, CSP, licenses, and asset integrity. Quality review checks authority uniqueness, types, TDD evidence, naming, docs, generated drift, accessibility, and absence of warnings. Visual review checks the approved concept, 16 px mark, responsive hierarchy, dark/forced colors, similarity dossier, and prohibited visual tropes.

Any reject is remediated on a new commit and all affected gates/reviews are replayed; verdicts never mutate to hide a prior reject.

- [ ] **Step 4: Build the owner acceptance package**

The evidence document contains:

```text
governance_sha
ui_sha
website_sha
dot_github_sha
gate_results
browser_matrix
asset_sha256
license_decision
similarity_review_scope
known_limits
rollback_artifact
```

No field is marked accepted without evidence. The package reproduces the exact brand copy and explains that software licensing does not remove infrastructure/model/operations costs.

- [ ] **Step 5: Update project evidence only after every candidate is green**

Mark the Governance and UI brand criteria accepted with dated immutable references; regenerate their README status blocks and fleet projection. Re-run the org profile renderer if the fleet rows changed.

- [ ] **Step 6: Stop at the external-action boundary**

Present the immutable SHAs, review verdicts, license text, mark preview, and deployment rollback target. Owner approval is required separately for:

1. Governance doctrine merge (signature under I-17);
2. brand asset/license publication;
3. downstream UI/Website/profile merges;
4. website deployment and post-deploy smoke.

Do not infer these external mutations from local implementation approval.

## Plan Self-Review

- **Spec coverage:** authority and doctrine are Tasks 1–2; adopted color, mark, components, asset licensing, and visual evidence are Tasks 3–5; public website, proof adjacency, static security, accessibility, determinism, and performance are Tasks 6–7; bilingual organization projection is Task 8; role-separated review, evidence, rollback, and owner controls are Task 9.
- **Authority consistency:** Governance owns semantics and generated copy; UI owns tokens/assets/components; Website and `.github` only consume projections. No contract repository change is introduced because the brand projection has one downstream publication workflow and is explicitly a generated projection, not a reusable domain contract.
- **Dependency direction:** Governance → UI semantics, Governance/UI → Website, Governance → `.github`; no cycle. Full SHA pins are required before committed downstream installs.
- **Sovereignty:** Playwright is Apache-2.0 local test tooling already used at version 1.61.1 in the fleet; no hosted test service or runtime dependency is added. Public output has zero remote asset or runtime service.
- **Security:** external strings are escaped, proof URLs validated, executable markup and remote assets rejected, SVG constrained, no PII/logging path added.
- **No placeholders:** every implementation task defines files, interfaces, failure cases, commands, expected outcomes, and publication controls. Visual/legal acceptance is a named owner gate, not unfinished implementation.
- **Scope:** product application roll-out remains outside this mission as specified; authority plus UI, Website, and organization profile form one complete, independently releasable system.
