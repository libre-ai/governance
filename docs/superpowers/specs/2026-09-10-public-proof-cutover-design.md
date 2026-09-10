# Public proof cutover design

**Date:** 2026-09-10
**Status:** approved for implementation by the owner (`go all`, 2026-09-10)
**Scope:** `governance`, `ui`, `website`, then a separately targeted Clever Cloud release

## Outcome

The public Website uses the reviewed Libre AI brand system in its production build, ships the
textual `Libre AI` wordmark only, and turns `Prenez les clés.` into a real path to an immutable,
runnable starter. The figurative candidate remains absent from every public artifact until both
brand-publication controls are accepted.

This cutover also removes the obsolete G4 deployment deferral. Deployment remains bounded by the
target repository's release evidence and by a named owner-authorized environment; it does not gain a
fleet-wide blanket authorization.

## Decisions

### 1. One name for the candidate shape

The French canonical name is **Portique d'atelier**. **Workshop Gantry** is its English translation.
The former `martinet` / `swift` description is withdrawn because it asks the geometry to resemble an
animal that the adopted design no longer depicts. Geometry, hashes, licence state and publication
status do not change.

### 2. The CTA opens an executable, immutable artifact

`Prenez les clés.` links directly to the quick-start section of `libre-ai/starter` at a full reviewed
commit SHA. The nearby copy says what the reader will get: a runnable template, pinned workshop
bricks and its verification commands. Website does not duplicate the commands or claim production
readiness; the starter repository remains the authority for both.

This is deliberately a link, not a fake in-browser builder. The latter would create a new mutable
application surface, a second authority for starter behavior, and an unjustified security boundary.

### 3. Production has one renderer

`website/src/build.ts` stops invoking the historical renderer. The production entry point reads the
pinned governance public-brand and fleet projections plus the pinned UI styles/tokens, then invokes
the already qualified branded renderer. The historical rendering functions and their tests are
removed so production cannot silently fall back to stale copy.

The generated map contains `index.html`, `comparaisons.html`, `marque.html`, `assets/styles.css` and
`assets/tokens.css`. It contains no client JavaScript, remote asset, tracking call or figurative file.

### 4. Publication replaces the whole artifact

The file writer creates a fresh sibling staging directory, writes only validated relative paths,
then replaces the previous output directory. A failed write leaves the previous complete artifact in
place; a successful build cannot retain a stale `libre-ai-mark.svg` from an earlier candidate.

The writer refuses absolute paths and `..` traversal even though current filenames are internal
constants. This preserves the boundary if future projection-driven routes are introduced.

### 5. Deployment authorization is repository-local

ADR-0035 amends I-07 and D16 only where their G4 deferral became impossible after ADR-0020 retired
G4. Clever Cloud Paris/UE remains the runtime target. Configuration or provisioning is authorized
only when the repository records:

1. a deterministic release candidate from an immutable commit;
2. green repository gates and applicable cross-repository drift gates;
3. an explicit owner-selected environment;
4. a post-deploy smoke check and a recoverable previous revision.

Identity-provider provisioning remains separately gated by the owning application's identity and
data controls; this cutover does not activate it.

### 6. Clever Cloud remains a static host

The intended application type is `static`, region `par`, with `/dist` as the web root. Build-time
configuration must use the repository's pinned Bun toolchain and frozen lockfile. No database,
add-on, cookie, analytics, server-side application or runtime secret is introduced.

The actual environment (`staging` or `prod`), Clever organization/application identity and public
domain are external facts and must be explicitly selected or discovered before mutation. They are
not guessed by the repository.

## Proof strategy

- Governance: doctrine, brand projection and full quality gate; immutable author commit followed by
  dedicated architecture/security/quality/completeness review passes.
- UI: terminology-only diff, brand generation/publication gates and full quality gate; the expected
  publication gate remains red solely because approval evidence is pending.
- Website: red tests first for the production renderer, immutable starter CTA, transactional output
  replacement, traversal refusal and absence of figurative assets; then unit, full gate and
  Chromium/Firefox/WebKit E2E.
- Release: deploy only the merged Website `main` commit; smoke the three HTML routes, local assets,
  CSP, zero script, zero remote resource and absent figurative mark. A failed smoke triggers rollback
  to the recorded previous revision before a second smoke.

## Rollback

Before deployment, reverting the Website merge restores the historical public build. After
deployment, Clever Cloud's immutable previous revision is the rollback target. The doctrine amendment
is not silently reverted by an application rollback; changing it requires a new owner-signed ADR.
