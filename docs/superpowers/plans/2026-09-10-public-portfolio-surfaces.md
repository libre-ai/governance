# Public Portfolio Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one conversion-focused, bilingual public experience whose product claims, repository metadata, and visuals are generated from approved authorities.

**Architecture:** Governance emits factual projections. App Kit owns visual tokens, the pixel bird, README hero primitives, and social-preview rendering. Each target consumes the same immutable projections; Website and `.github` provide distinct navigation while Missions owns the only primary star journey.

**Tech Stack:** Bun 1.4 canary, React 19, strict TypeScript, CSS variables, SVG, static HTML, Playwright on Chromium/Firefox/WebKit.

**Spec:** `docs/superpowers/specs/2026-09-10-public-portfolio-big-bang-design.md`

## Execution ordering

Follow the coordinator plan's **Executable Dependency Order**, not packet-number order.
Local candidate implementation is authorized; it is not final admission or publication proof.
Final authority identifiers are ADR-0041/I-32/D46 after the `65fbff2` collision recheck;
ADR-0039/I-31 (private research) and ADR-0040/D45 (run-control persistence) remain intact.

## Global Constraints

- Use black, white, and green Evidence Signal tokens; color never carries state alone.
- Retain the existing pixel bird only after exact license and similarity evidence pass.
- No remote font, analytics, cookie, tracking pixel, browser session identifier, or runtime asset request.
- README first screens use plain product language and contain no internal architecture or automation vocabulary.
- A star request appears only after a successful demo, quick start, or verified release.
- Social previews never substitute for real product screenshots or output evidence.
- This packet writes only local candidate trees. Its edits precede final root composition/signing; no source history or development commits enter the final root.
- Use the locked display name `Libre AI Database Inspector` for `db-inspect`; conditional slugs/display names remain provisional until executable admission passes. Signalement is a local private-first candidate with no GitHub remote, outside the 36 public sources and public target contract.

### Task 1: Build Evidence Signal in App Kit

**Files:**
- Create in target `app-kit`: `packages/ui/src/brand/tokens.css`
- Create in target `app-kit`: `packages/ui/src/brand/BrandMark.tsx`
- Create in target `app-kit`: `packages/ui/src/brand/BrandLockup.tsx`
- Create in target `app-kit`: `packages/ui/src/brand/ProofBadge.tsx`
- Create in target `app-kit`: `packages/ui/src/brand/ReadmeHero.tsx`
- Create in target `app-kit`: `packages/ui/src/brand/brand.test.tsx`
- Create in target `app-kit`: `packages/ui/src/assets/libre-ai-pixel-bird.svg`
- Create in target `app-kit`: `tools/render-social-preview.tsx`
- Create in target `app-kit`: `tools/render-social-preview.test.ts`
- Create in target `app-kit`: `evidence/pixel-bird-license.md`
- Create in target `app-kit`: `evidence/pixel-bird-similarity-review.md`

**Interfaces:**

```ts
interface BrandLockupProps {
  product?: string;
  locale: "en" | "fr";
}

interface ProofBadgeProps {
  kind: "tests" | "release" | "license" | "provenance";
  label: string;
  href: string;
}

interface SocialPreviewInput {
  product: string;
  benefit: string;
  category: "use" | "build" | "trust" | "explore";
}
```

- [ ] Write failing tests for exact brand family text, SVG accessibility, one-color rendering, 16 px legibility constraints, forbidden scripts/links/raster/gradients, and no independent product logos.
- [ ] Write failing token tests for minimum 4.5:1 body contrast, 3:1 component/focus contrast, light/dark/forced-color behavior, and absence of literal component colors.
- [ ] Run the focused tests and confirm failure before implementation.
- [ ] Implement the smallest token and component set; reuse retained UI code only when its source path passed the composition and license gates.
- [ ] Archive the exact SVG digest, asset license decision, and dated similarity review; keep the asset out of generated public files until both are accepted.
- [ ] Implement a deterministic 1280×640 social-preview renderer from `SocialPreviewInput` with no network access.
- [ ] Render every admitted repository preview twice and compare digests.
- [ ] Run App Kit unit, accessibility, package-content, license, typecheck, and browser visual tests.
- [ ] Commit the target root update as `feat: add Evidence Signal brand system`.

### Task 2: Generate bilingual repository landing pages

**Files:**
- Create in every admitted target: `README.md`
- Create in every admitted target: `README.fr.md`
- Create in every admitted target: `docs/assets/social-preview.png`
- Create in every product target: `docs/assets/product-proof.webp`
- Create in every admitted target: `CONTRIBUTING.md`
- Create in every admitted target: `SECURITY.md`
- Create in every admitted target: `repository.v1.yaml`
- Create in governance target: `tools/presentation/apply-repository-projection.ts`
- Create in governance target: `tools/presentation/apply-repository-projection.test.ts`

**Interfaces:**

```ts
interface RepositoryProjectionInput {
  contract: RepositoryContractV1;
  locale: "en" | "fr";
  quickStart: string;
  proofAsset: string;
  badges: ProofBadge[];
}

function renderRepositoryLanding(input: RepositoryProjectionInput): string;
```

- [ ] Write a golden test for the required order: identity/benefit/visual, outcome, quick start, trust proof, contribution, reference.
- [ ] Add failing cases for more than three Works with entries, more than four proof badges, star badge, hero star CTA, absent limitation, broken language mirror, internal phase term, migration diary, and missing real proof asset.
- [ ] Add negative fixtures for any `db-inspect` display title other than `Libre AI Database Inspector`, conditional names projected before admission, and Signalement silently appearing in public surfaces.
- [ ] Run the focused test and confirm failure before implementation.
- [ ] Implement the renderer and marker-safe updater; refuse a README whose generated markers are missing or duplicated.
- [ ] Write human-reviewed product copy for all 14 certain targets and only admitted conditional targets using their repository contracts.
- [ ] Capture each real screenshot or output from a green product flow. Do not use generated mockups.
- [ ] Render English and French pages, run parity checks, then run all quick starts from anonymous clean environments.
- [ ] Verify contribution routing: product behavior local, cross-cutting policy in governance, no unbounded good-first-issue labels.
- [ ] Commit each target independently as `docs: add verifiable product landing`.

### Task 3: Complete the Missions conversion path

**Owner decisions, 2026-09-12:** Build Brief uses a new major candidate with an
explicit canonical content preimage and detached signed acceptance records. Its
content digest remains stable when acceptance records change; consumers verify
both the content digest and the trusted signed acceptance. Reuse the existing
Artifact JCS/SHA-256 primitive and canonical signature domain separation. Never
reinterpret locked SpecPackage v1 digests in place.

Build Brief authorization is a dedicated resource policy: explicit author, review,
approve and export rights on the corresponding resources, without implicitly
expanding Missions v1 roles. Existing author/approver separation, organization
isolation, current membership checks and plan-only handoff remain mandatory.
Create the Contracts schemas, policy, vectors and catalog review dossier first;
complete required review-only passes on an immutable candidate before implementing
its consumers. These steps precede final S3 qualification and root composition.

**Files:**
- Create in target `missions`: `apps/missions/src/ui/demo-mission.tsx`
- Create in target `missions`: `apps/missions/src/ui/demo-mission.test.tsx`
- Create in target `missions`: `apps/missions/src/ui/build-brief.tsx`
- Create in target `missions`: `apps/missions/src/ui/build-brief.test.tsx`
- Create in target `missions`: `apps/missions/src/app/run-public-demo.ts`
- Create in target `missions`: `apps/missions/src/app/run-public-demo.test.ts`
- Create in target `missions`: `apps/missions/src/app/auth-session.ts`
- Create in target `missions`: `apps/missions/src/app/auth-session.test.ts`
- Create in target `missions`: `apps/missions/src/domain/auth-session.ts`
- Create in target `missions`: `apps/missions/src/domain/auth-session.test.ts`
- Create in target `missions`: `apps/missions/src/persistence/auth-session-store.ts`
- Create in target `missions`: `apps/missions/src/persistence/auth-session-store.integration.test.ts`
- Create in target `missions`: `apps/missions/src/server/auth-handler.ts`
- Create in target `missions`: `apps/missions/src/server/auth-handler.test.ts`
- Create in target `missions`: `apps/missions/src/domain/build-brief.ts`
- Create in target `missions`: `apps/missions/src/domain/build-brief.test.ts`
- Create in target `missions`: `apps/missions/src/app/accept-build-brief.ts`
- Create in target `missions`: `apps/missions/src/app/accept-build-brief.test.ts`
- Create in target `missions`: `apps/missions/src/persistence/build-brief-store.ts`
- Create in target `missions`: `apps/missions/src/persistence/build-brief-store.integration.test.ts`
- Modify in target `missions`: `apps/missions/src/authz/mission-authorization.ts`
- Modify in target `missions`: `apps/missions/src/authz/mission-authorization.test.ts`
- Modify in target `missions`: `apps/missions/src/server/handler.ts`
- Modify in target `missions`: `apps/missions/src/server/handler.test.ts`
- Modify in target `missions`: `apps/missions/src/shared/document.tsx`
- Create in target `missions`: `e2e/public-demo.spec.ts`
- Create in target `missions`: `e2e/self-host.spec.ts`
- Create in target `missions`: `scripts/self-host.ts`
- Modify in target `missions`: `package.json`

**Interfaces:**

```ts
interface DemoResult {
  missionDigest: string;
  decisionSummary: string;
  evidenceUrls: string[];
}

async function runPublicDemo(input: PublicDemoInput): Promise<DemoResult>;
async function startSelfHostedDemo(options: SelfHostOptions): Promise<DisposableDemo>;
```

- [ ] Write a browser E2E test that opens the public demo with no account, completes one bounded mission, shows its evidence, and reaches the post-proof star request.
- [ ] Write refusal tests for authentication prompts, hidden external requests, untrusted prompt instructions changing the authorized mission, personal data in logs, and a star CTA before proof.
- [ ] Run E2E and confirm the public-demo path is absent.
- [ ] Preserve the observed Missions architecture: `app` coordinates use cases, `authz` owns mission authorization, `domain` owns records and invariants, `persistence` owns stores, `server` owns HTTP handlers, `shared` owns document composition, and `ui` owns views. Use the exact files above; enumerate any additional retained source modules and migrations in the reviewed path manifest before composition.
- [ ] Integrate retained Auth session lifecycle, record, store, and HTTP behavior into the corresponding `app/auth-session.ts`, `domain/auth-session.ts`, `persistence/auth-session-store.ts`, and `server/auth-handler.ts` paths. Integrate Build Brief behavior into `domain/build-brief.ts`, `app/accept-build-brief.ts`, `persistence/build-brief-store.ts`, and `ui/build-brief.tsx`; delete unused package publishing surfaces.
- [ ] Add fail-closed layout/import tests against the composition manifest: no parallel feature hierarchy, no duplicate domain/store authority, and no product-wide refactor without complete path proof. Preserve `organization` ownership and test cross-organization session, brief, and mission access refusals.
- [ ] Implement the deterministic fixture-backed public demonstration with no personal-data persistence.
- [ ] Implement `bun run self-host` as the one command that validates prerequisites, starts the local stack, runs readiness, and prints only local URLs and cleanup instructions.
- [ ] Prove two self-host runs from clean checkouts and compare result digests.
- [ ] Run unit, API, integration, E2E, security, accessibility, and zero-personal-data-log checks.
- [ ] Commit as `feat: add verifiable Missions demo`.

### Task 4: Rebuild the Website projection

**Files:**
- Modify in target `website`: `src/build.ts`
- Modify in target `website`: `src/build.test.ts`
- Modify in target `website`: `src/render-brand.ts`
- Modify in target `website`: `src/render-brand.test.ts`
- Create in target `website`: `src/render-missions.ts`
- Create in target `website`: `src/render-missions.test.ts`
- Modify in target `website`: `e2e/brand-reference.e2e.ts`
- Create in target `website`: `e2e/public-portfolio.e2e.ts`
- Modify in target `website`: `package.json`

**Interfaces:**

```ts
interface WebsiteProjection {
  brand: PublicBrandProjection;
  repositories: RepositoryContractV1[];
  missionsDemoUrl: string;
}

function renderWebsite(projection: WebsiteProjection): Map<string, string | Uint8Array>;
```

- [ ] Write failing tests for home order: promise, Missions demo, Use/Build/Trust, Explore, proof, contribution.
- [ ] Add negative tests for hard-coded repository counts, starter CTA, Workshop Gantry asset, remote asset, client JavaScript, analytics, unescaped projection values, and homepage URL without smoke evidence.
- [ ] Run focused tests and confirm failure against the old renderer.
- [ ] Implement one production renderer from pinned governance/App Kit projections and remove the obsolete renderer after its replacement tests pass.
- [ ] Build transactionally into a fresh sibling directory and refuse absolute or parent-traversal output paths.
- [ ] Run two builds and compare all bytes.
- [ ] Run Chromium, Firefox, and WebKit at keyboard-only, 320 px reflow, 200%/400% zoom, dark mode, forced colors, and reduced motion.
- [ ] Verify zero browser JavaScript, remote resources, cookies, forms collecting personal data, or runtime secrets.
- [ ] Commit as `feat: publish Missions-led portfolio website`.

### Task 5: Rebuild the organization profile

**Files:**
- Create in target `.github`: `profile/README.md`
- Create in target `.github`: `profile/README.fr.md`
- Create in target `.github`: `CONTRIBUTING.md`
- Create in target `.github`: `SECURITY.md`
- Create in target `.github`: `.github/ISSUE_TEMPLATE/bug.yml`
- Create in target `.github`: `.github/ISSUE_TEMPLATE/config.yml`
- Create in governance target: `tools/presentation/render-org-profile.ts`
- Create in governance target: `tools/presentation/render-org-profile.test.ts`

- [ ] Write golden tests for the master promise, Missions demo link, Use/Build/Trust paths, secondary Explore path, six pins maximum, and two contribution doors.
- [ ] Add failing tests for giant status tables, raw lifecycle labels, multiple star asks, old hub links, missing French mirror, and a pin without its evidence gate.
- [ ] Run the focused test and confirm failure before implementation.
- [ ] Implement deterministic profile rendering from the admitted repository contract set.
- [ ] Select pins mechanically: Missions only when all flagship gates pass, then the strongest current product proof, Build authority, Trust proof, and at most two complementary repositories.
- [ ] Render both profile languages and verify every link against local staged targets.
- [ ] Commit `.github` target as `docs: add Missions-led organization profile` and governance renderer as `feat: render organization profile`.

### Task 6: Qualify the whole public journey

**Files:**
- Create in governance target: `verification/public-journey/verify.ts`
- Create in governance target: `verification/public-journey/verify.test.ts`
- Create in governance target: `verification/public-journey/cold-reader.v1.json`

- [ ] Write a strict cold-reader questionnaire that asks what Libre AI is, what Missions does now, how to try it, what proof exists, what limit applies, and where to contribute.
- [ ] Write tests that fail when an answer requires internal terminology or navigating more than one link from the first screen.
- [ ] Implement `verifyPublicJourney(stagedTargets): PublicJourneyVerdict` over local staged HTML and README outputs.
- [ ] Run the questionnaire against a clean context and archive only anonymous answers and aggregate scores.
- [ ] Run link, language parity, screenshot, metadata, social-preview, accessibility, and performance verification across every admitted target.
- [ ] Refuse readiness if any primary link, quick start, proof, limitation, or Missions path fails.
- [ ] Commit as `test: qualify public portfolio journey`.

Expected final evidence:

```text
PUBLIC JOURNEY READY: primary_cta=missions anonymous_demo=pass self_host=pass broken_links=0 tracking_requests=0
```
