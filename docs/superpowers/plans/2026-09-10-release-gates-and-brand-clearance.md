# Release Gates and Brand Clearance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make local and remote release gates equivalent, prove the npm tarball contents, qualify the Workshop Gantry, and remove administrator bypass from protected `main` branches.

**Architecture:** Consumer repositories invoke the existing SHA-pinned governance licence checker and the pinned REUSE CLI from their aggregate gate. UI owns a small Bun pack-list verifier because its required artefacts are package-specific. Brand evidence remains in UI and stays fail-closed unless official searches and owner controls are complete.

**Tech Stack:** Bun 1.4 canary, strict TypeScript, Bun test, REUSE 6.2.0, Playwright, GitHub protected-branch API

**Spec:** `docs/superpowers/specs/2026-09-10-release-gates-and-brand-clearance-design.md`

## Global Constraints

- Security > quality > performance > completeness.
- No publication, deployment, trademark filing, or doctrinal change.
- No second implementation of governance's declared-licence comparison.
- Every non-trivial behavior starts with a failing test.
- Every commit carries an author-matching `Signed-off-by` and no `Co-Authored-By` trailer.

---

### Task 1: Align local and CI licensing gates

**Files:**
- Modify: `ui/package.json`
- Modify: `ui/.github/workflows/ci.yml`
- Modify: `website/package.json`
- Modify: `website/.github/workflows/quality.yml`

**Interfaces:**
- Consumes: `reuse lint`; `node_modules/@libre-ai/governance/tools/quality/check-declared-licenses.ts`
- Produces: `bun run check:licensing`, invoked by each repository's aggregate `check`

- [ ] **Step 1: Run the current aggregate gates and prove they omit licensing output**

Run: `bun run check`

Expected: PASS without `REUSE Compliance Check` or `Declared package licence gate` output.

- [ ] **Step 2: Add the local scripts and CI installation steps**

Add `check:licensing` to both manifests, invoke it from `check`, and install the SHA-pinned
`tools/licensing/requirements.txt` in each Bun quality job before the aggregate gate.

- [ ] **Step 3: Run focused and aggregate gates**

Run: `bun run check:licensing && bun run check`

Expected: PASS with REUSE and declared-licence output in both commands.

### Task 2: Verify the real npm pack list

**Files:**
- Create: `ui/tools/check-package-contents.ts`
- Create: `ui/tools/check-package-contents.test.ts`
- Modify: `ui/package.json`

**Interfaces:**
- Produces: `parseBunPackList(output: string): readonly string[]`
- Produces: `verifyRequiredPackageContents(files: readonly string[]): readonly string[]`

- [ ] **Step 1: Write failing parser and required-file tests**

Use a hand-written Bun output fixture. Assert acceptance of `LICENSE`, `LICENSING.md`,
`LICENSES/LicenseRef-Libre-AI-Brand-1.0.txt`, and `src/assets/libre-ai-mark.svg`; assert one named
failure for each omitted file and for an unparseable empty list.

- [ ] **Step 2: Run the focused test and observe the missing-module failure**

Run: `bun test tools/check-package-contents.test.ts`

Expected: FAIL because the verifier does not exist.

- [ ] **Step 3: Implement the minimal parser and real subprocess gate**

Spawn `bun pm pack --dry-run --ignore-scripts`, validate its exit code, accept the parsed `packed`
records only when exactly one `Total files` summary matches their count, and throw the sorted
failure codes. Add `check:package-contents` to `check` and
`prepublishOnly` through the aggregate gate.

- [ ] **Step 4: Verify focused, real-pack, and aggregate behavior**

Run: `bun test tools/check-package-contents.test.ts && bun run check:package-contents && bun run check`

Expected: PASS and a report naming every required packed file.

### Task 3: Qualify small-size and forced-color rendering

**Files:**
- Modify: `ui/brand/reference.e2e.ts`
- Modify: `ui/evidence/BRAND-MARK-SIMILARITY-REVIEW.md`
- Create: `ui/evidence/brand-clearance/2026-09-10/README.md`

**Interfaces:**
- Produces: browser assertions over the rendered 16 px and 24 px SVG bounding boxes and parts

- [ ] **Step 1: Add failing browser assertions for the small-size marks**

Assert both sizes are visible, retain three rendered paths, have non-zero bounding boxes, and remain
visible in the forced-colors project.

- [ ] **Step 2: Run Chromium and forced-colors projects**

Run: `bunx playwright test brand/reference.e2e.ts --project=chromium --project=chromium-forced-colors`

Expected: PASS after selectors and accessible labels are implemented correctly.

- [ ] **Step 3: Record the visual inspection result without claiming legal clearance**

Capture the candidate qualification surface, hash the disposable capture, and record the observed
16/24 px silhouette result in the dated evidence record.

### Task 4: Execute official and named-reference searches

**Files:**
- Modify: `ui/evidence/BRAND-MARK-SIMILARITY-REVIEW.md`
- Modify: `ui/evidence/BRAND-ASSET-PUBLICATION-APPROVAL.md` only if every control is actually complete
- Add: dated, licence-compliant evidence records under `ui/evidence/brand-clearance/2026-09-10/`

**Interfaces:**
- Consumes: EUIPO/TMview, INPI Data, WIPO Global Brand Database, and official named-reference sources
- Produces: query terms, classes, UTC timestamps, result summaries, source URLs, limitations, and capture hashes

- [ ] **Step 1: Search text variants in classes 9 and 42**

Run exact and fuzzy searches for `Libre AI` and `LibreAI` on each accessible official register.

- [ ] **Step 2: Run available figurative or image-similarity searches**

Upload the exact SVG or a deterministic PNG rendering where the official interface permits it.
Record any authentication, CAPTCHA, terms, or browser limitation as a blocking result rather than
substituting a general search engine.

- [ ] **Step 3: Complete the LaSuite and named-reference visual comparison**

Compare official current marks side by side against the candidate's open frame, separated upright,
and offset control block. Escalate any structurally close result; never infer legal availability.

- [ ] **Step 4: Apply the owner controls only if the evidence meets the existing acceptance contract**

Keep `Status: pending` and publication blocked if any official search or capture remains incomplete.

### Task 5: Review, merge, protect, and clean up

**Files:**
- Modify: GitHub branch-protection state for `libre-ai/governance`, `libre-ai/ui`, and `libre-ai/website`

**Interfaces:**
- Produces: protected `main` branches with administrator enforcement and force pushes disabled

- [ ] **Step 1: Run repository gates, REUSE, package, and browser suites**

Expected: zero failures and zero lint/type warnings.

- [ ] **Step 2: Commit, push, open pull requests, and wait for required checks**

Use descriptive English commits with DCO. Merge only green pull requests.

- [ ] **Step 3: Enable administrator enforcement without changing required contexts**

Patch only `enforce_admins.enabled` to `true`; verify `allow_force_pushes.enabled` remains `false`.

- [ ] **Step 4: Verify post-merge CI and clean temporary state**

Delete only the feature branches and worktrees created by this plan. Preserve unrelated dirty files
and externally managed worktrees.
