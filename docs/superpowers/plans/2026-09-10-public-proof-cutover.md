# Public proof cutover implementation plan

> Execute sequentially across immutable repository commits. Each repository is independently green
> before its pull request; downstream pins use the merged upstream SHA, never a branch SHA.

**Goal:** Publish the reviewed Libre AI brand as Website's sole production renderer, connect its main
CTA to a runnable immutable starter, and prepare a gated static Clever Cloud release.

**Architecture:** Governance first removes the retired G4 deferral and fixes brand terminology. UI
then aligns evidence wording without changing geometry or approval state. Website finally consumes
both merged authorities by full SHA, replaces the legacy build path, and emits a fresh guarded static
artifact transactionally.

**Tech stack:** Bun 1.4 canary, strict TypeScript, static HTML/CSS, Playwright, Clever Cloud static
runtime in Paris.

---

### Task 1: Amend the deployment doctrine and brand terminology

**Files:**
- Create: `docs/adr/0035-repository-local-release-authorization.md`
- Modify: `docs/decisions/INVARIANTS.md`
- Modify: `docs/decisions/DECISION-REGISTER.md`
- Modify: `brand/README.md`
- Modify: `brand/README.en.md`
- Modify: `docs/adr/0033-open-verifiable-brand-system.md`

1. Write ADR-0035 with the bounded repository-local release controls and explicit non-activation of
   identity-provider provisioning.
2. Amend I-07 and D16 through a new D41 register entry; do not alter unrelated doctrine.
3. Replace `martinet` / `swift` with `Portique d'atelier` / `Workshop Gantry` in brand authority.
4. Stage the complete authoring diff and run `bun run check`.
5. Commit the immutable candidate in English without co-author trailers.
6. Run distinct architecture, security, quality and completeness review passes against the commit.
7. Apply any findings in a new commit and repeat the affected review passes.
8. Push, open a PR, require green checks, merge, fetch and record the merged `main` SHA.

### Task 2: Align UI evidence terminology without opening publication

**Files:**
- Modify: `README.md`
- Modify: `evidence/BRAND-MARK-SIMILARITY-REVIEW.md`
- Modify: `evidence/brand-clearance/2026-09-10/README.md`

1. Replace the English-only label with `Portique d'atelier / Workshop Gantry` at first mention and
   the appropriate single-language label thereafter.
2. Assert that licence approval and official similarity searches remain pending; do not change their
   statuses, owner lines, asset hash or geometry.
3. Stage and run the relevant tests, `check:brand-assets`, `check:brand-reference`, then `bun run
   check`. Run `check:brand-publication` separately and verify it still refuses publication for the
   documented pending controls.
4. Commit, review the immutable diff, push, merge after green checks and record the merged SHA.

### Task 3: Cut Website production over to the branded renderer using TDD

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `src/build.test.ts`
- Modify: `src/build.ts`
- Modify: `src/templates.test.ts`
- Modify: `src/templates.ts`
- Modify: `e2e/website.e2e.ts`

1. Add failing tests proving the primary CTA is the immutable starter quick-start URL and describes
   its real boundary.
2. Add failing tests proving the production loader consumes pinned Governance/UI files and emits the
   complete branded file map with no mark.
3. Add failing tests for transactional replacement: stale files disappear, traversal paths are
   refused, and write failure preserves the previous complete directory.
4. Remove the historical renderer and implement the smallest production loader/writer satisfying
   those tests.
5. Pin Governance and UI to their merged full SHAs and regenerate `bun.lock` with the frozen policy
   restored afterward.
6. Run focused tests after each behavior, then the complete unit suite.

### Task 4: Qualify the public artifact and update project truth

**Files:**
- Modify: `project.v1.yaml`
- Modify: `README.md`
- Modify: `README.fr.md`
- Modify: `docs/evidence/brand-website-visual-review.md`

1. Generate production `dist/` twice from clean output and compare file digests.
2. Run Playwright in Chromium, Firefox and WebKit against the production artifact, not `.preview`.
3. Inspect the captured homepage and brand guide for narrow/wide layout, wordmark-only rendering and
   a visible CTA boundary.
4. Update the project card and generated README sections only for gates actually demonstrated; keep
   public deployment pending until a reachable URL passes smoke.
5. Stage, run `bun run check` plus E2E, commit and review the immutable commit across the four axes.
6. Push, open a PR, require green checks, merge, fetch and verify local tree identity with merged
   `origin/main`.

### Task 5: Deploy the merged Website commit and prove the release

**Files:**
- Modify only if needed for a reproducible checked-in static-host configuration; never commit
  `.clever.json`, credentials or organization-local identifiers.

1. Resolve the explicit owner-selected target (`staging` or `prod`) and list existing Clever Cloud
   applications before creating anything.
2. Link the exact target application, or create a `static` application in `par` only if no matching
   application exists and creation is explicitly within the selected target.
3. Record the currently deployed revision and public URL as rollback evidence. If this is the first
   release, keep the canonical domain detached and prove that the application can be stopped.
4. Configure frozen Bun build and `/dist` web root without secrets or add-ons.
5. Deploy the merged Website `main` SHA.
6. Smoke `index.html`, `comparaisons.html`, `marque.html`, CSS assets, CSP, zero executable markup,
   zero remote assets and absent `libre-ai-mark.svg`.
7. On smoke failure, restore the recorded previous revision or stop a first-release application, then
   re-run the applicable smoke. Only after a first-release smoke is green may canonical routing be
   attached. On success, record the URL, commit SHA and smoke output in Website evidence through a
   new reviewed PR.
