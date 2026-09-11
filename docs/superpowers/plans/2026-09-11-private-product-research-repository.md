<!-- SPDX-FileCopyrightText: 2026 Libre AI contributors -->
<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# Private Product Research Repository Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and harden `libre-ai/product-research` as the private, non-authoritative record of Libre AI product research, then import the sanitized commercialization research already arbitrated.

**Architecture:** Public `governance` declares the private administrative role and the authority boundary. The private repository stores typed Markdown/JSON research, runs all content gates inside its own security boundary, and exports verified encrypted Git bundles so GitHub is never the only copy.

**Tech Stack:** Git/GitHub Team, Bun `1.4.0-canary.1+57f349f63`, TypeScript 7 strict, Ajv 8.20.0, JSON Schema 2020-12, Biome 2.5.3, GitHub Actions pinned by SHA, REUSE, `age` 1.3.2, Markdown and JSON.

**Spec:** `docs/superpowers/specs/2026-09-11-private-product-research-repository-design.md`

## Global Constraints

- Security precedes quality, performance and completeness.
- No secret, PII, customer material, classified data or raw conversation export may enter GitHub.
- `product-research` is private, belongs to `libre-ai`, has role `administrative-private` and layer `transverse`, and is outside the public portfolio.
- `governance` and `contracts` remain the only authorities; `promoted` requires repository, path and an exact 40-character commit SHA.
- GitHub.com is a documented sovereignty exception; classification is limited to `public|internal`.
- Public fleet workflows receive no token capable of reading private repositories; private content gates run in `product-research`.
- Documents and registries are CC-BY-4.0; schemas, scripts and fixtures are Apache-2.0; REUSE and DCO are mandatory.
- CI Bun archive SHA-256: `83144e2542c33aaae541cf16b42f8cf1c55c3b94c5395fc776417fa27e95bcbf`.
- `age` 1.3.2 archive SHA-256: Darwin arm64 `e2020b073c44f692685a24d6abc378817eb81ffaaf49fd0531ef8565f767f2f5`; Linux x64 `cbe24006683f8eb669266162894b9a522a1af52f2665fbc63a4bb032ed26ac10`.
- No force push, administrator merge bypass or `Co-Authored-By: Codex` trailer.
- Execute from a dedicated worktree based on `origin/main`. The current `docs/square-control-design` branch contains unrelated work and remains untouched.

---

### Task 1: Close the governance model around private administrative repositories

**Files:**

- Modify: `ecosystem/build-index.ts`
- Modify: `ecosystem/build-index.test.ts`
- Modify: `ecosystem/fixtures/repository-index/input.yaml`
- Modify: `ecosystem/fixtures/repository-index/expected.json`
- Modify: `ecosystem/check-context-conformance.ts`
- Modify: `ecosystem/check-context-conformance.test.ts`
- Modify: `ecosystem/check-dependabot-conformance.ts`
- Modify: `ecosystem/check-dependabot-conformance.test.ts`
- Modify: `ecosystem/check-fleet-pins.ts`
- Modify: `ecosystem/check-fleet-pins.test.ts`
- Modify: `ecosystem/check-toolchain-source.ts`
- Modify: `ecosystem/check-toolchain-source.test.ts`
- Modify: `ecosystem/check-fleet-presentation.ts`
- Modify: `ecosystem/check-fleet-presentation.test.ts`

**Interfaces:**

- Produces: closed `Role` union and strict `buildIndex(yamlText): RepositoryIndex`.
- Produces: `isPublicCrossRepositoryTarget(entry): boolean`.
- Preserves: behavior of every existing public and archived repository.

- [ ] **Step 1: Write failing role and visibility tests**

Add tests that accept only this private shape:

```ts
{
  repository: "libre-ai/product-research",
  role: "administrative-private",
  layer: "transverse",
  visibility: "private",
  lifecycle: "active",
}
```

Reject: unknown role, any other private role, another repository name, public visibility, non-transverse layer, archived lifecycle, and a `card` on `administrative-private`.

- [ ] **Step 2: Run the focused test and prove red**

Run: `bun test ecosystem/build-index.test.ts`

Expected: FAIL because roles are free strings and private product entries are currently accepted.

- [ ] **Step 3: Implement closed parsing**

Add:

```ts
export const ROLES = [
  "active-application",
  "administrative-private",
  "authority",
  "hub",
  "org-profile",
  "reserved-application-home",
  "reserved-product-home",
  "satellite",
  "standalone-tool",
] as const;

export type Role = (typeof ROLES)[number];

export function isPublicCrossRepositoryTarget(
  entry: Pick<InventoryEntry, "visibility">,
): boolean {
  return entry.visibility === "public";
}
```

`asRole` rejects values outside `ROLES`. `toEntry` enforces the exact private shape above and reserves private visibility to `administrative-private`.

- [ ] **Step 4: Replace the permissive private fixture**

Replace `libre-ai/midden-secret` with `libre-ai/product-research` using the exact administrative shape, regenerate `expected.json`, and run:

`bun test ecosystem/build-index.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing explicit-exemption tests**

Add `visibility` to cross-gate entry types. Context and Dependabot reviews must return:

```ts
{
  failures: [],
  notes: [
    "private repository — content gates run in-repository; no cross-repository read token granted",
  ],
  exempt: true,
}
```

Fleet-pins and toolchain-source selectors must exclude private entries while reporting the same note. Fleet-presentation must accept a cardless administrative entry only after strict inventory validation.

- [ ] **Step 6: Prove cross-gate tests red**

Run:

```bash
bun test ecosystem/check-context-conformance.test.ts \
  ecosystem/check-dependabot-conformance.test.ts \
  ecosystem/check-fleet-pins.test.ts \
  ecosystem/check-toolchain-source.test.ts \
  ecosystem/check-fleet-presentation.test.ts
```

Expected: FAIL because public tokens still query every living repository.

- [ ] **Step 7: Implement private exclusions**

Parse through `buildIndex`, fetch content only for `isPublicCrossRepositoryTarget` entries, and add an asserted report line for each excluded private repository. Do not change `check-inventory-drift`: it already notes an invisible declared-private repository and fails if it becomes publicly observable.

- [ ] **Step 8: Verify and commit**

Run the Step 6 suite, `git diff --check`, then:

```bash
git add ecosystem
git commit -s -m "feat(governance): support private administrative repositories"
```

Expected: focused suite green with zero warning.

---

### Task 2: Ratify the repository before creating it remotely

**Files:**

- Create: `docs/adr/0039-private-product-research-repository.md`
- Modify: `docs/decisions/LEXICON.md`
- Modify: `docs/README.md`
- Modify: `ecosystem/repositories.v1.yaml`
- Modify: `distribution/index/repositories.v1.json`

**Interfaces:**

- Consumes: strict role from Task 1.
- Produces: public, non-sensitive declaration of `libre-ai/product-research`.
- Preserves: all portfolio repositories remain public.

- [ ] **Step 1: Write ADR-0039**

The ADR carries `Owner-arbitration: 2026-09-11` and states: private administrative source of sanitized work; non-authoritative; GitHub sovereignty exception; Git portability; public cross-gates never receive private-read credentials.

- [ ] **Step 2: Amend name and authority maps**

Add `product-research` to `LEXICON.md` as an administrative repository outside product/package/crate families. Add to `docs/README.md`:

```markdown
| Recherche produit non normative | `libre-ai/product-research` — dépôt privé administratif ; hypothèses et synthèses assainies seulement, promotion par SHA vers l'autorité concernée |
```

- [ ] **Step 3: Register topology and regenerate**

Set `updated_on: 2026-09-11` and add:

```yaml
  - repository: libre-ai/product-research
    role: administrative-private
    layer: transverse
    visibility: private
    lifecycle: active
    owns:
      - sanitized non-authoritative product research
      - research source and promotion registries
    consumes:
      - governance and contracts authority revisions
```

Run: `bun ecosystem/build-index.ts`

- [ ] **Step 4: Verify governance**

Run:

```bash
git diff --check
bun run check
bun ecosystem/check-inventory-drift.ts
```

Expected: suite green; drift reports the not-yet-created private repository as consistent but unverifiable, never as a missing public repository.

- [ ] **Step 5: Commit and ratify through a reviewed PR**

```bash
git add docs ecosystem/repositories.v1.yaml distribution/index/repositories.v1.json
git commit -s -m "docs(governance): ratify private product research repository"
```

Push the dedicated branch. The PR body includes `Owner-arbitration: 2026-09-11`. Run the repository review procedure, wait for every required check on the head SHA, and merge without `--admin`. Re-read `main` through `gh api repos/libre-ai/governance/commits/main --jq .sha` before Task 3.

---

### Task 3: Establish security prerequisites and bootstrap the private repository

**Files in new repository:**

- Create: `README.md`, `AGENTS.md`, `CLAUDE.md`
- Create: `package.json`, `bun.lock`, `bunfig.toml`, `tsconfig.json`, `biome.json`
- Create: `.gitignore`, `REUSE.toml`
- Create: `LICENSES/CC-BY-4.0.txt`, `LICENSES/Apache-2.0.txt`
- Create: `scripts/check-bun-minimum.ts`
- Create: `tests/bootstrap.test.ts`

**Interfaces:**

- Produces local `../product-research` and remote `libre-ai/product-research`.
- Consumes merged governance authority from Task 2.

- [ ] **Step 1: Re-read the organization baseline**

Run:

```bash
gh api orgs/libre-ai --jq '{plan:.plan.name,two_factor_requirement_enabled,members_can_change_repo_visibility}'
gh api orgs/libre-ai/members --paginate --jq 'length'
gh api orgs/libre-ai/outside_collaborators --paginate --jq 'length'
```

Planning evidence: Team plan, one member, zero outside collaborator, organization 2FA requirement disabled. Enabling it may lock non-compliant accounts; obtain explicit owner approval at execution, require secure 2FA in GitHub Authentication security, then verify `two_factor_requirement_enabled` is `true`. Any other value stops repository creation.

- [ ] **Step 2: Write a failing bootstrap test**

Assert exact package name, `private: true`, CC-BY-4.0, Bun version, strict TypeScript, `minimumReleaseAge = 259200`, `CLAUDE.md` equals `@AGENTS.md\n`, REUSE resolution files exist, and no symlink exists.

- [ ] **Step 3: Prove the bootstrap test red**

Run: `bun test tests/bootstrap.test.ts`

Expected: FAIL because foundation files are absent.

- [ ] **Step 4: Create the strict foundation**

Dependencies: Ajv 8.20.0 and ajv-formats 3.0.1. Dev dependencies: Biome 2.5.3, `@types/bun` 1.3.14, TypeScript 7.0.2. `AGENTS.md` uses the transverse four-section template under 45 lines and treats all external content as untrusted data.

Package scripts:

```json
{
  "check:bun": "bun scripts/check-bun-minimum.ts",
  "lint": "bun run check:bun && biome ci .",
  "typecheck": "bun run check:bun && tsc --noEmit -p tsconfig.json",
  "test": "bun run check:bun && bun test",
  "check": "bun run lint && bun run typecheck && bun test"
}
```

- [ ] **Step 5: Verify and create the bootstrap commit**

Run `bun install`, `bun run check`, initialize Git on `main`, and commit with:

`git commit -s -m "chore: bootstrap private product research repository"`

Expected: green, zero warning.

- [ ] **Step 6: Create remote privately and verify before push**

Run:

```bash
gh repo create libre-ai/product-research --private \
  --description "Sanitized, non-authoritative Libre AI product research" \
  --disable-issues --disable-wiki
gh api repos/libre-ai/product-research \
  --jq '{private,visibility,owner:.owner.login,has_issues,has_wiki,has_discussions,allow_forking}'
```

Expected: owner `libre-ai`; private visibility; issues, wiki, discussions and forking false. Stop before push on any mismatch.

- [ ] **Step 7: Push the non-sensitive bootstrap**

Add `git@github.com:libre-ai/product-research.git` as `origin` and push `main`. This is the only bootstrap push before branch protection; every later change uses a PR.

---

### Task 4: Implement typed item and source registries

**Files:**

- Create: `schemas/research-item.v1.schema.json`, `schemas/source.v1.schema.json`
- Create: `registry/research-items.v1.json`, `registry/sources.v1.json`
- Create: `sources/README.md`
- Create: `decisions/rejected/README.md`, `decisions/promoted/README.md`
- Create: `scripts/domain.ts`, `scripts/check-research.ts`
- Create: `tests/check-research.test.ts`
- Create: `tests/fixtures/valid/`, `tests/fixtures/invalid/`
- Modify: `package.json`

**Interfaces:**

- Produces `validateResearch(input: ResearchInput): readonly Finding[]`.
- Produces `validateTransition(previous: ResearchItem, next: ResearchItem): readonly Finding[]`.
- CLI: `bun scripts/check-research.ts`; it compares with `origin/main` when
  that ref exists, and accepts an explicit `--base-ref` override for tests.

- [ ] **Step 1: Write failing schema and cross-record tests**

Test unknown fields, every enum, duplicate `RSH-*`/`SRC-*`, traversal, missing content path, orphan source reference, non-HTTPS public URL, missing vault SHA-256, `confidential` rejection and promoted item without authority.

Exact types:

```ts
export type ResearchKind =
  | "problem" | "offer" | "market" | "regulatory-mapping" | "narrative" | "decision";
export type ResearchStatus =
  | "hypothesis" | "supported" | "rejected" | "promoted" | "superseded";
export type Classification = "public" | "internal";
export type SourceKind = "public-url" | "internal-observation" | "external-vault";

export interface AuthorityRef {
  repository: "libre-ai/governance" | "libre-ai/contracts";
  path: string;
  commit: string;
}

export interface Finding {
  code: string;
  path: string;
  message: string;
}
```

- [ ] **Step 2: Prove tests red**

Run: `bun test tests/check-research.test.ts`

Expected: FAIL because schemas and validator are absent.

- [ ] **Step 3: Implement schemas and pure validation**

Use JSON Schema 2020-12, `additionalProperties: false` and required fields. Patterns: `^RSH-[0-9]{4}$`, `^SRC-[0-9]{4}$`, commit `^[0-9a-f]{40}$`, digest `^[0-9a-f]{64}$`. Sort findings by path then code.

Allowed transitions:

```ts
const ALLOWED_TRANSITIONS: Readonly<Record<ResearchStatus, readonly ResearchStatus[]>> = {
  hypothesis: ["hypothesis", "supported", "rejected"],
  supported: ["supported", "promoted", "rejected", "superseded"],
  rejected: ["rejected"],
  promoted: ["promoted", "superseded"],
  superseded: ["superseded"],
};
```

- [ ] **Step 4: Add baseline-aware validation**

The default baseline is `origin/main` when that ref resolves. `--base-ref`
overrides it in tests. Absence is valid only for the first empty registry;
later unreadability fails closed. Validator output prints finding code and
path, never content. `decisions/rejected/README.md` and
`decisions/promoted/README.md` define the meaning of their directories without
inventing an empty decision item.

- [ ] **Step 5: Verify and commit**

Run `bun test tests/check-research.test.ts`, `bun scripts/check-research.ts` and `bun run check`. Commit:

`git commit -s -m "feat: add typed product research registry"`

---

### Task 5: Enforce content safety and authority resolution

**Files:**

- Create: `scripts/check-content-safety.ts`
- Create: `scripts/check-authorities.ts`
- Create: `tests/check-content-safety.test.ts`
- Create: `tests/check-authorities.test.ts`
- Modify: `scripts/check-research.ts`, `package.json`

**Interfaces:**

- `scanContent(path, text): readonly Finding[]`.
- `verifyAuthority(ref, fetcher): Promise<readonly Finding[]>`.
- Fetcher result: `"found" | "missing" | "unreachable"`.

- [ ] **Step 1: Write hostile synthetic tests**

Cover email, international phone, private-key header, GitHub token shape, bearer secret, local `/Users/` path, IP address and client-labeled identifier. Invalid payloads are base64 in fixtures. Assert output contains only code/path, never matched value.

- [ ] **Step 2: Prove safety tests red**

Run: `bun test tests/check-content-safety.test.ts tests/check-authorities.test.ts`

Expected: FAIL because gates are absent.

- [ ] **Step 3: Implement safety scan**

Scan tracked `.md .json .yaml .yml .toml .ts .sh`. Exclude only encoded invalid fixtures. No free-form allowlist; narrow a false positive only with a regression test.

- [ ] **Step 4: Implement exact authority checks**

Only `governance` and `contracts` are accepted. The live checker queries the GitHub contents API at exact SHA/path, discards response bodies, maps 404 to `AUTHORITY_MISSING` and all reachability/auth failures to `AUTHORITY_UNREACHABLE`.

- [ ] **Step 5: Wire and verify**

Package `check` runs lint, typecheck, tests, registry, safety and authority checks. With zero promoted items, authority output must explicitly prove `0 promoted authority references verified`.

Run `bun run check` and commit:

`git commit -s -m "feat: enforce research content and promotion safety"`

---

### Task 6: Prove encrypted backup and restoration

**Files:**

- Create: `toolchains/age.json`
- Create: `scripts/install-age.ts`
- Create: `scripts/export-verified-bundle.sh`
- Create: `tests/export-verified-bundle.test.ts`
- Modify: `.gitignore`, `package.json`

**Interfaces:**

- Installer accepts `--platform darwin-arm64|linux-x64 --destination`.
- Exporter accepts `--recipient-file` and one or more `--output` absolute paths.
- The exporter defines `HEAD_SHA="$(git rev-parse HEAD)"`; output is only
  `product-research-${HEAD_SHA}.tar.age`.

- [ ] **Step 1: Write failing E2E archive test**

Create a temporary Git repo and ephemeral X25519 identity. Export, decrypt, verify `SHA256SUMS`, clone bundle, run `git fsck --full`, compare HEAD/tree, and assert no plaintext bundle/tar/identity survives in output.

- [ ] **Step 2: Prove archive test red**

Run: `bun test tests/export-verified-bundle.test.ts`

Expected: FAIL because installer/exporter are absent.

- [ ] **Step 3: Implement pinned age installation**

`toolchains/age.json` contains version, upstream URLs and both exact SHA-256 values from Global Constraints. Download to a temporary directory, verify before extraction, check `age --version`, and atomically install only `age` and `age-keygen`.

- [ ] **Step 4: Implement fail-closed export**

Use `set -euo pipefail`, absolute output paths and private `mktemp -d` cleanup. Create/verify bundle, clone, `git fsck --full`, compare source/restored HEAD and tree, hash bundle and reports, tar them, encrypt to the public recipient, and delete output on any error. Private identity and passphrase never enter CI or environment variables.

- [ ] **Step 5: Verify and commit tooling**

Run `bun test tests/export-verified-bundle.test.ts` and `bun run check`. Commit:

`git commit -s -m "feat: add verified encrypted research backups"`

A real acceptance run uses two independently mounted owner-selected destinations; the script rejects duplicate resolved destinations.

---

### Task 7: Configure local CI and observe remote protections

**Files:**

- Create: `.github/workflows/quality.yml`
- Create: `.github/workflows/licensing.yml`
- Create: `.github/workflows/context-hygiene.yml`
- Create: `.github/dependabot.yml`, `.github/CODEOWNERS`
- Create: `scripts/audit-github-settings.ts`
- Create: `tests/audit-github-settings.test.ts`

**Interfaces:**

- `auditGitHubSettings(snapshot): readonly Finding[]`.
- Reusable workflow ref and `tooling_ref` equal the merged governance SHA.
- Required checks come from observed head check-runs, never YAML prediction.

- [ ] **Step 1: Write failing pure settings tests**

Reject public visibility, forking, issues/wiki/discussions, Actions write token, force push, deletion, absent PR requirement, nonzero approval requirement with one org member, missing observed checks, and unverified 2FA. Accept secret scanning only as `enabled` or `unavailable-on-plan`.

- [ ] **Step 2: Create pinned workflows**

`quality.yml` uses `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1`, verifies the qualified Bun archive, frozen-installs and runs `bun run check`. Licensing and context workflows call public governance reusable workflows at the exact merged SHA. All use `permissions: contents: read` and no repository secret.

- [ ] **Step 3: Implement live settings audit**

Read repository metadata, Actions permissions, branch protection, org 2FA and secret-scanning availability. A 403 is `UNABLE_TO_VERIFY`, never success. Emit only setting names and booleans.

- [ ] **Step 4: Push a PR and constrain Actions**

Commit `ci: enforce private research quality gates`, push a feature branch and create a PR with `Owner-arbitration: 2026-09-11`. With explicit user approval, refresh `gh` scopes to minimum `repo,admin:org`. Set default workflow token read-only, forbid workflow PR approval, and allow only the pinned GitHub-owned action plus the exact governance reusable workflow ref.

- [ ] **Step 5: Protect main from observed check-runs**

Wait for PR head checks. Use governance `tools/security/check-branch-protection.ts --repo libre-ai/product-research --ref` with the exact head SHA and `--fix`. Require PRs and strict observed statuses; forbid deletion and force push; enforce admins. Required approving reviews remain zero while the org has one human member.

- [ ] **Step 6: Audit and merge**

Run `bun scripts/audit-github-settings.ts --live` and `gh pr checks --required --watch` for the discovered PR number. Expected: settings audit and all required checks green. Merge without `--admin`. Verify no token/private key/local path with the safety gate.

---

### Task 8: Import sanitized research inside the private boundary

The private repository owns its source registry, research subjects, item titles,
commercial hypotheses and local import evidence. These details are intentionally
not reproduced in public governance. Its local gate verifies that each imported
record has a status, classification, resolvable source and verification date,
and that no raw conversation or personal identifier is committed. Research
records remain non-authoritative until a separate exact-SHA promotion.

---
### Task 9: Final clean-room, security and restoration acceptance

**Files:** No tracked file unless a review finding requires a tested correction.

- [ ] **Step 1: Clean clone and full suite**

Clone `libre-ai/product-research` into a fresh temporary directory with credential prompts disabled, frozen-install and run `bun run check`.

Expected: green with zero warning and no repository secret.

- [ ] **Step 2: Live settings audit**

Run `bun scripts/audit-github-settings.ts --live`.

Expected: private owner `libre-ai`, org 2FA required, forking/issues/wiki/discussions off, Actions read-only, PR/status checks required, force push/deletion off.

- [ ] **Step 3: Two-support restoration**

Export to two independently mounted destinations, decrypt and restore from each, compare HEAD/tree to `origin/main` and run `git fsck --full`. No plaintext archive survives cleanup.

- [ ] **Step 4: Final content and visibility checks**

Run safety scan, inspect all commit subjects, and query repository visibility through both repository and organization endpoints. Both API views must report private.

- [ ] **Step 5: Request code review before completion**

Review governance and private-repository diffs against Security, Quality, Performance and Completeness. Fix every blocking finding with tests, re-run both full suites, settings audit and affected restoration checks.

- [ ] **Step 6: Report verifiable results**

Report exact commit SHAs, test counts, observed required-check names, settings verdict and restored HEAD/tree digests. Never report backup paths, collaborator identities, source bodies, secrets or the `age` recipient.
