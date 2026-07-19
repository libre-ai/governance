# Story 1.6 : Cohérence de marque — purge « libre-ia »

Status: ready-for-dev

## Story

As a visitor,
I want a unique libre-ai.fr brand everywhere,
so that I never doubt who publishes.

## Acceptance Criteria

**Given** NFR-14 and current assets named `libre-ia-*`  
**When** the site is built  
**Then** no visible occurrence "libre-ia" persists (logo, wordmark, manifests, metadata)  
**And** asset files are renamed consistently  
**And** the brand cohesion scan passes at zero occurrences

## Inventory of Current State (Exhaustive Audit)

### Category A: Asset Filenames (VISIBLE)

- `assets/brand/libre-ia-icon-light.svg` — used in header, alt text, img tags
- `assets/brand/libre-ia-logo-horizontal-dark.svg` — not currently visible in dist/
- `assets/brand/libre-ia-logo-horizontal-light.svg` — not currently visible in dist/
- `assets/libre-ia/` — directory (legacy manifest metadata)

**Occurrence count:** 8 file/directory names

### Category B: Code References (VISIBLE + INTERNAL)

- `src/lib.rs` line 18: `"/assets/brand/libre-ia-icon-light.svg"` — header brand image path
- `src/lib.rs` line 240: src property in mock data
- `src/lib.rs` line 246: alt text "libre-ia" (VISIBLE in rendered HTML)
- `src/lib.rs` line 342: photo_src for mock member card
- `src/lib.rs` line 373: icon_src for mock member card
- `src/lib.rs` line 429: src property in mock footer
- `src/lib.rs` line 435: alt text "libre-ia" (VISIBLE in rendered HTML)

**Occurrence count:** 7 references in code
**Status:** 2 are VISIBLE in rendered HTML (alt text + img src)

### Category C: Manifest & Metadata Files (INTERNAL)

- `assets/libre-ia/design-system.lock.json`: format field `"libre-ia.design-system-lock.v1"`
- `assets/libre-ia/manifest.json`: format field `"libre-ia.design-system.v2"`
- `assets/libre-ia/provenance.json`: predicateType URL `"https://libre-ia.fr/provenance/portal-forge/v1"`
- `assets/libre-ia/contrast-report.json`: (assumed; not grepped)

**Occurrence count:** 3 confirmed in JSON
**Status:** INTERNAL (not served, config metadata)

### Category D: Rendered HTML (VISIBLE)

- dist/*/index.html:
  - img src="/assets/brand/libre-ia-icon-light.svg" (multiple pages)
  - alt="" for brand icon (empty alt, inherits title from context)
  - brand-word text: "libre-ia" in rendered span.brand-word

**Total visible occurrences:** ~42 across all dist/ HTML files

---

## Implementation Points (What to Change)

### Point 1: Asset Filenames (Renaming Strategy)

**Current:** `libre-ia-*.svg` in `assets/brand/`  
**Target:** Rename to `libre-ai-*.svg` (or neutral `brand-*.svg`)

**Files to rename:**

- `assets/brand/libre-ia-icon-light.svg` → `assets/brand/libre-ai-icon-light.svg`
- `assets/brand/libre-ia-logo-horizontal-dark.svg` → `assets/brand/libre-ai-logo-horizontal-dark.svg`
- `assets/brand/libre-ia-logo-horizontal-light.svg` → `assets/brand/libre-ai-logo-horizontal-light.svg`

**Note:** dist/ is generated on each build; renaming source will propagate automatically.

### Point 2: Code References (src/lib.rs)

Replace all 7 occurrences of `/assets/brand/libre-ia-` with `/assets/brand/libre-ai-`

**Lines affected:** 18, 240, 342, 373, 429

**For alt text:** The current alt text is "libre-ia". This should become:

- Either: empty (alt="") since it's decorative branding
- Or: "Libre IA" (human-readable, not machine identifier)
- **Decision per DESIGN.md:** Use "Libre IA" (brand as displayed) or empty; never the domain name

### Point 3: Manifest/Metadata Refactoring (assets/libre-ia/)

**Evaluation:** The `assets/libre-ia/` directory contains:

- `design-system.lock.json`
- `design-system.lock.json`
- `manifest.json`
- `provenance.json`
- `contrast-report.json`

**Status:** These are legacy design-system metadata from portal-forge.

**Decision per Story Scope:**

- If still consumed by the build (e.g., imported in CSS/JS): rename references + directory to `assets/libre-ai/`
- If NOT consumed (legacy artifact): flag for removal in Story 1.7 (legacy asset cleanup)

**Investigation required:** Grep for imports of these files in Rust/CSS/build scripts

### Point 4: Header Brand Wordmark Text (src/lib.rs or Template)

Current rendered HTML shows:

```html
<span class="brand-word">libre-ia<span class="brand-tld">.fr</span></span>
```

Per DESIGN.md § Brand & Style, the wordmark should display **"Libre IA"** (capitalized, human-readable brand) with domain `libre-ai.fr`.

**Target text:** `"Libre IA"` (not "libre-ia")

---

## Verification: Brand Cohesion Scan

This scan must pass at ZERO visible "libre-ia" occurrences before merge.

### Scan Command (Reproduced Every Commit)

```bash
#!/bin/bash
# Brand cohesion verification — must return 0 occurrences
cd "$(git rev-parse --show-toplevel)"

# Exclude: .git, target, node_modules, .build
EXCLUDE_DIRS="\.git|target|node_modules|\.build"

echo "=== Brand Cohesion Scan: libre-ia ==="
echo ""

echo "1. Filenames with libre-ia:"
find . -type f -name "*libre-ia*" \
  ! -path "./.git/*" \
  ! -path "./target/*" \
  ! -path "./node_modules/*" | wc -l

echo ""
echo "2. Rendered HTML (dist/):"
grep -r "libre-ia" dist/ --include="*.html" 2>/dev/null | wc -l

echo ""
echo "3. Source code (src/):"
grep -r "libre-ia" src/ --include="*.rs" 2>/dev/null | wc -l

echo ""
echo "4. Metadata (assets/libre-ia/*.json):"
[ -d "assets/libre-ia" ] && ls -1 assets/libre-ia/ | wc -l || echo "0 (directory not present)"

echo ""
echo "Total visible occurrences (should be 0):"
TOTAL=$( (find . -type f -name "*libre-ia*" 2>/dev/null | wc -l) + \
         (grep -r "libre-ia" dist/ --include="*.html" 2>/dev/null | wc -l) + \
         (grep -r "libre-ia" src/ --include="*.rs" 2>/dev/null | wc -l) )
echo $TOTAL
```

**Gate criterion:** This command must output `0` for "Total visible occurrences" before merge.

---

## Technical Requirements

### Architecture Compliance

- Follows AR-1 (brownfield site-build evolution)
- Supports NFR-14 (brand cohesion)
- No breaking changes to existing components

### File Structure

- Assets in: `assets/brand/` (source)
- Build output: `dist/assets/brand/` (generated)
- Manifests: `assets/libre-ia/` (rename or mark for Story 1.7)
- Code: `src/lib.rs` (sole point of reference for paths)

### Testing Standards

- Manual visual inspection: verify header wordmark displays "Libre IA" in light/dark themes
- CI gate: brand cohesion scan runs and passes
- Responsive: verify brand logo/text on mobile (header sticky reduced on <768px, per Story 1.3)

### Dependencies & Constraints

- Zero dependency on external brand libraries
- No CMS or dynamic brand data source
- All brand assets statically embedded in `assets/brand/`

---

## Dev Notes

### Source Integrity Checks

1. **Verify src/lib.rs currently builds:**

   ```bash
   cargo check
   ```

2. **Post-refactor, verify no regressions:**
   - Run `cargo build`
   - Open dist/index.html in browser (light + dark theme toggle)
   - Inspect brand header: wordmark, logo, alt texts
   - Verify no 404 on asset loads (F12 Network tab)

3. **Brand cohesion scan (final gate):**
   - Run the bash script above
   - Confirm output: `Total visible occurrences: 0`

### Learnings from Previous Stories (1.1–1.5)

Per Dev Agent Records, no prior libre-ia purge was attempted; this is the first cohesion story.

- Story 1.1 (Tokens/Typography) established CSS variables and font loading
- Story 1.2 (Components) built the nine UI components referenced here
- Story 1.3 (Navigation) finalized header layout — the brand sits in header (line 18 src/lib.rs)

### Known Variances or Conflicts

**None identified.** The change is localized to:

- Filenames (assets/brand/*.svg)
- Code paths (src/lib.rs)
- Optional manifest refactor (assets/libre-ia/)

---

## Project Context

- **Epic:** 1 (Le site dans sa nouvelle identité)
- **Related Stories:** 1.1, 1.2, 1.3 (visual foundation)
- **Related NFR:** NFR-14 (brand cohesion)
- **Related AR:** AR-1 (brownfield evolution)
- **Blocking:** None
- **Blocked by:** Story 1.1 (tokens/typography) — must be complete
- **Deployment:** Part of Epic 1 go-live

---

## Story Completion Status

**Status:** ready-for-dev  
**Completion note:** Exhaustive brand cohesion audit completed — comprehensive developer guide created with reproducible scan command.

**Inventory Summary:**

- Asset filenames with "libre-ia": 8
- Code references in src/lib.rs: 7 (2 visible in HTML)
- Manifest files: 1 directory + 3 JSON fields
- Rendered HTML occurrences: ~42 (auto-generated from code refs)

**Total to remediate:** 3 distinct locations (assets, code, manifests)

**Risks:**

1. **Build cache pollution:** `dist/` must be fully rebuilt post-rename to avoid stale assets
2. **Manifest consumption unknown:** If `assets/libre-ia/*.json` are imported (e.g., in CSS build step), breakage if not updated
3. **Header styling regression:** Logo height/width on mobile or dark theme might break if alt text context changes
