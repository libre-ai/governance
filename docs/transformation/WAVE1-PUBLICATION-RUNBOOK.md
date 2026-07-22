# Wave-1 publication runbook — the owner's npm day

Everything below the "Owner steps" line is prepared and CI-proven; nothing is
published until the owner runs it. Trigger recorded: the npm `@libre-ai` scope
was reserved by the owner on 2026-07-22.

## What is already prepared (this repository)

- **Publish set (4, linked version 0.1.0):** `@libre-ai/contracts` (sdk-ts),
  `@libre-ai/web-platform`, `@libre-ai/ui`, `@libre-ai/auth-web`.
  `web-platform` is in the set by dependency closure (auth-web consumes its
  `secureResponse` hardening helper); EXECUTION-SEQUENCING names only
  ui/auth/sdk-ts — **owner-vetoable** (veto = re-adding `private: true` and
  dropping it from `tools/release/publish-preflight.ts`).
- **Self-contained tarballs:** contracts vendors the 61 canonical schemas
  (`schemas/`, byte-exact drift gate in `generate:check`); the registry loads
  the packaged copy by default — the old default resolved the monorepo root
  and would have broken every npm install.
- **Metadata:** `private` lifted (trigger satisfied), `types`, `files` (tests
  excluded — verified empirically), per-package `LICENSE` (Apache-2.0:
  contracts/ui/web-platform; EUPL-1.2: auth-web, per ADR-0004),
  `publishConfig.access=public`, react/react-dom (+optional tailwindcss) as
  peers on the libraries.
- **Materialization proven:** `bun publish`/`bun pm pack` rewrite
  `workspace:*` and `catalog:` refs into real semver in every dependency group
  (verified against bun's source and empirically on these packages).
- **Gates:** `tools/release/publish-preflight.ts` packs each satellite for
  real and fails closed on any workspace:/catalog: residue, private flag,
  missing LICENSE, leaked test file, or version drift. Green on all 4.
- **Automation:** `.github/workflows/release.yml` (manual dispatch, dry-run by
  default; the publish job needs the `npm-publish` environment) and
  `tools/release/bump-version.ts` (linked bump).
- **Mirrors:** `tools/release/mirror-satellites.sh` (git subtree split → push;
  not executed — repos do not exist yet).

## Owner steps (next week, in order)

1. **npm org hygiene** — on npmjs.com: enforce 2FA on the `@libre-ai` org;
   create a **granular access token** scoped to publish the four packages
   (expiry short; store nowhere but the GitHub environment below).
2. **GitHub environment** — repo Settings → Environments → create
   `npm-publish`; add secret `NPM_TOKEN`; (recommended) require your manual
   approval on the environment.
3. **Dry run** — Actions → "Release satellites" → Run workflow with
   `dry_run: true` (default). Green = preflight re-proven on CI hardware.
4. **Publish** — re-run with `dry_run: false`; approve the environment gate.
   Order is dependency-safe (contracts → web-platform → ui → auth-web).
   Auth path: bun's own publish documentation states `bun publish` respects
   the `NPM_CONFIG_TOKEN` environment variable for CI workflows (docs/pm/cli/
   publish.mdx) — which is exactly how the workflow passes the secret.
   OTP: if the token strategy requires it, publish locally instead:
   `cd packages/<p> && bun publish --access public --otp <code>` in the same
   order.
5. **Mirror repositories** — create `libre-ai/sdk-ts`, `libre-ai/ui`,
   `libre-ai/auth` (public, empty, no README); disable issues/PRs; then run
   `tools/release/mirror-satellites.sh`; protect `main` on each mirror.
   Decide whether `web-platform` gets a reserved mirror name (npm-only until
   then).
6. **Inventory + evidence** — update `ecosystem/repositories.v1.yaml`
   (satellites → published state), append the publication entry to
   `distribution/evidence/gate-acceptance-log.md`, regenerate a coverage
   snapshot (`bun distribution/evidence/coverage-metrics.ts`).

## Wave-1 exit checklist (after publication)

- [ ] Each published brick consumed by **at least one real usage** outside the
      hub workspace (e.g. a starter or an external project installing from
      npm) — the wave's exit gate, not satisfied by publication alone.
- [ ] Coverage metrics published (share of operations without human touch).
- [ ] Evidence sealed (gate-acceptance-log + dated coverage JSON).

## Deferred / explicitly not done here

- `sdk-rs`, `starter` satellites (EXECUTION-SEQUENCING defers them).
- npm **provenance** / OIDC trusted publishing: this bun has no
  `--provenance`; revisit by publishing bun-packed tarballs via npm CLI, or
  when bun grows the flag.
- Per-package NOTICE files aggregating dependency licenses (LICENSE ships;
  deps' licenses are visible on npm) — add if the licensing gate evolves.
