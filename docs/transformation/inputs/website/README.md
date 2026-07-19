# Website inputs — validated positioning and specification set

Versioned inputs for `WP-G3-W01` (Website rebuild). Rehomed on 2026-07-19 from the legacy `website` repository, which was frozen at revision `0318c92` (see `ecosystem/LEGACY-MANIFEST.yaml`) and subsequently removed from GitHub during the 2026-07 public-presence cleanup. This copy is the exact tracked content of the frozen tree; no Git history was imported.

## Contents

- `TARGET.md` — public mission and positioning target of the website (seven public products, editorial rules, trust posture).
- `cdc-bmad/` — the complete specification set produced with BMAD-METHOD and validated by the owner on 2026-07-14 (merged as website PR #57): brainstorm intent, brief, PRD, UX contract (`DESIGN.md`, `EXPERIENCE.md`), architecture spine, epics and stories, implementation-readiness report, and the per-story implementation artifacts. Review rubrics and `.memlog.md` session logs are kept as provenance.

## Authority and disposition

- These documents are **inputs**, not locked specifications. The website application will be specified and built under the monorepo regime (`docs/transformation/G1-WORK-PACKAGES.md`, package `WP-G3-W01`) at the target `apps/website` defined in `docs/transformation/REPOSITORY-MAP.md`.
- Per the post-freeze candidate-archive disposition recorded on 2026-07-18: extract the accepted product and verification semantics; **do not import the Dioxus implementation or its Git history**. The canonical web stack is Bun + TypeScript + React 19 (ADR 0001).
- Positioning decisions carried by these inputs (canonical domain `libre-ai.fr`, promise, corpus-first value architecture, anonymized client references) were validated on 2026-07-14 and remain the latest owner-validated positioning; any change goes through a new owner decision, not through edits to these files.
