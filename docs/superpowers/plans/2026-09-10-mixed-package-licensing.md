# Mixed-package licensing remediation plan

**Goal:** Make the licensing gate correctly verify publishable packages whose files carry distinct licences, then make the UI and Website repositories REUSE-compliant without weakening the reserved brand-asset grant.

**Architecture:** A publishable package keeps a direct SPDX expression when every non-editorial file has the same effective licence set. A genuinely mixed package uses npm's `SEE LICENSE IN <file>` declaration. The shared Governance gate resolves that repository-relative file, rejects unsafe or missing references, and requires its level-two SPDX headings to equal the union of effective REUSE licences. REUSE remains authoritative for every file.

**Repositories:** `governance` owns the verifier; `ui` consumes a full reviewed Governance SHA and owns its package licence notice; `website` owns the missing E2E/config annotations.

## Task 1 — Extend the shared declared-licence gate in TDD

- Add failing tests for a valid mixed package, unsafe and missing licence-file references, incomplete/extraneous SPDX headings, and unresolved file attribution.
- Implement a typed declaration parser and deterministic licence-document validation in `tools/quality/check-declared-licenses.ts`.
- Keep existing direct-SPDX and dual-licence behaviour unchanged.
- Run the focused tests, stage the new plan, then run `bun run check`.
- Commit with DCO sign-off and push the reviewed Governance commit before any consumer pin changes.

## Task 2 — Describe the UI distribution truthfully

- Change `@libre-ai/ui` to `SEE LICENSE IN LICENSING.md`.
- Add `LICENSING.md` with exact `## \`Apache-2.0\`` and `## \`LicenseRef-Libre-AI-Brand-1.0\`` sections, scopes, precedence, and the explicit non-approval status of the current figurative candidate.
- Re-pin the Governance dependency, lockfile, licensing workflow, and context-hygiene workflow to the reviewed full SHA.
- Run the shared licence gate, `bun run check`, and the complete Playwright suite.
- Commit with DCO sign-off.

## Task 3 — Complete Website REUSE attribution

- Extend the EUPL annotation to `e2e/**` and `playwright.config.ts`.
- Run `reuse lint`, `bun run check`, regenerate the guarded brand preview, and run the complete local brand E2E suite.
- Commit with DCO sign-off.

## Task 4 — Integrate, review, and clean up

- Review each immutable commit on security, quality, performance, completeness, sovereignty, PII, licensing accuracy, and DCO.
- Fast-forward local `main` branches only after green evidence, push normally, and wait for required GitHub checks on the exact SHAs.
- Remove temporary worktrees, feature/backup branches, generated preview output, and verify local `main == origin/main` with clean worktrees.
- Do not publish packages, assets, or deploy the Website.
