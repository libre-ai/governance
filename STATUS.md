# Transformation status

**Current phase:** G2 closed — wave 1 (layer-4 satellites) opening per `docs/transformation/EXECUTION-SEQUENCING.md`.

## Completed

- canonical monorepo bootstrapped ;
- Big Bang architecture accepted ;
- Bun canary locally verified and snapshotted for macOS ARM64/Linux x64 ;
- root Bun/Cargo workspaces and quality gates green ;
- target repository map, app briefs, contracts and workstreams created ;
- Website local work, `origin/main` and six corpus commits consolidated, cleaned and merged through GitHub PR #61 ;
- Website 20 unit/script tests, static build, 40 Playwright tests, media/topology gates and JS/Rust supply-chain audits green ;
- Website final remote SHA `0318c92`, repository archived ;
- Design System visual/motion work committed and pushed at `c8fb246` ;
- Design System 76-SVG rebuild, 22 targeted tests, distribution provenance and full pinned CI rebuild green ;
- Design System repository archived after Website consumer reconciliation ;
- all 18 historical repositories aligned and archived at recorded SHAs ;
- 33 unmerged local branch tips preserved as remote `archive/local-branch/*` tags ;
- the one missing legacy remote (recorded in `ecosystem/LEGACY-MANIFEST.yaml`) recreated solely as a verified archive ;
- canonical public GitHub repository created and initial history pushed ;
- differentiated EUPL/Apache/CC BY governance accepted through ADR-0004, with historical grants preserved, REUSE/SPDX scopes, DCO, data provenance and trademark policy ;
- Bun canary binaries, exact source, notices and checksums published in a durable prerelease ;
- shared GitHub CI runs `29491575814` and `29491734252` green for exact Bun and Rust gates ;
- protected `main`, private vulnerability reporting, secret scanning/push protection and dependency alerts enabled ;
- `Licensing and contribution governance`, Bun quality and Rust quality are strict required checks on `main`; the historical PR #93 DCO failure is durably disclosed and retroactively attested without rewriting Git history ;
- nine application specifications expanded to the G1 standard with an executable structure gate ;
- G1 decisions Q1–Q5 explicitly accepted and recorded in ADR-0002: tenancy, OIDC boundary, retention, Notebook local-only and Boussole release authority ;
- the current canonical catalog contains 85 locked authorities: 60 strict JSON Schemas, 11 OpenAPI surfaces, 9 parsed WIT worlds, 4 Biscuit authority/policy sources and 1 retention policy ;
- data lifecycle locked through an executable ADR-0002 retention policy, tenant ownership matrix, deletion receipt and restore/rollback rules ;
- provider-neutral OIDC, opaque browser session, CSRF, Biscuit issuance/attenuation/revocation and Ed25519 rotation protocols locked ;
- G1 initially closed with 26 machine-validated work packages, acyclic dependencies and explicit human gates.

## Current G2 entry

- `WP-G2-T01` completed as a human-accepted negative checkpoint: stable `1.3.14` predates the Rust line by 903 commits ;
- `WP-G2-C01` contract SDK and boundary validators was completed by PR #7: reproducible TypeScript/Rust projections and fail-closed runtime validation cover every canonical JSON Schema ;
- `WP-G2-W01` Bun React web foundation was completed by PR #12 and merged as `521d1b8`: direct `Bun.serve` SSR/hydration/static/JSON, accessible design primitives, the canonical `bun-app` template and three-engine Playwright evidence are recorded in `distribution/templates/bun-app/G2-W01-QUALIFICATION.md`; the owner accepted `accessibility-foundation-review` on 2026-07-16 (`6218654`) with the product-level manual checklist retained, and no production authorization is granted ;
- `WP-G2-Z01` Biscuit authorization capability was completed by PR #101 and merged as `a6bee98`: mandatory bounded attenuation, deny-by-default Sessions/Missions policies, verified root-family revocation and two-key Ed25519 rotation passed separate authorization-policy, key-rotation and candidate-integration reviews; the immutable rejects `87a802e` and `fbbe360` remain preserved, and no production use or key ceremony is authorized ;
- ADR-0003 opened and closed a strictly bounded contract amendment for WP-G2-S01: Radar, Notebook Core, Policy Core, Boussole v2 and the shared engine-vector envelope are locked after role verdicts, promotion reviews and owner milestones ;
- solo G2 governance requires attributable role-separated review-only passes on immutable commits; the same agent/session may perform serial authoring and review passes, while the repository owner retains explicit control milestones ;
- Radar v2 Architecture and Security are approved and its seven authorities are locked; Policy v2 Architecture, Security and Privacy are approved on `d47feb9` and exactly six authorities are locked; Notebook Core v2 is locked after Gate A and Gate B is approved on `9ee3f8d`, while user backups, activation, production and release still require a separate owner milestone ;
- Notebook has an exact product host disabled by default, three-engine crash/kill/restart recovery, a bounded APFS `ENOSPC` campaign, reproducible builds and a fresh physical 32+ GiB performance matrix on immutable candidates ;
- ADR-0006 limits the required hardware matrix to the qualified 32+ GiB class and keeps 8/16–24 GiB optional and unsupported; ADR-0007 makes real browser-process OOM an optional diagnostic while retaining bounded process-fault recovery and forbidding unsafe host exhaustion ;
- Notebook Gate B is approved on immutable candidate `9ee3f8d`: architecture, security, cryptography-runtime, France/EU privacy, performance/resources and Gate B synthesis all approve; this grants no activation, user-data or release authority ;
- Policy v2 now has closed WIT refusals, byte-exact malformed-input vectors and preimplementation CPU/memory budgets, without an evaluation engine ;
- Boussole v2 Architecture, Security, Methodology and France/EU Privacy are approved on `e83e142`; exactly five authorities transition to locked through a catalog-only promotion, while public scoring, any engine and real datasets remain NO-GO ;
- the shared `engine-golden-vectors-v1` transitions to locked through a separate catalog-only promotion approved by promotion-integration on `3b47e96` and final owner `continue`, after candidate-integration, Architecture and Security approval at `ccf9d68` plus challenged acceptance of exact dev-only `entities@8.0.0`; this fixes contract meaning only and authorizes no engine/runtime/data/release scope ;
- agent orchestration option B reaches contract Specification Lock after Architecture/Security/France-EU Privacy reviews, a remediated actual-Biscuit candidate-integration and catalog-only promotion of 14 unchanged authorities; simulation-only `WP-G2-A01` now has an accepted pure Rust decision core plus favorable result Architecture/Security/France-EU Privacy and conformance reviews on `7f31ec3`, Pi remains replaceable and no harness, worker launch or real mission is authorized ;
- ADR-0008 ratifies the multi-repository target topology and the Libre AI brand posture (option C), supersedes the repository-projection doctrine and institutes the invariants register `docs/decisions/INVARIANTS.md` ;
- no Radar, Policy or Boussole product engine, generic Context crate, Agent Orchestrator runtime/harness or Practices scorer is implemented; the accepted agent control crate is simulation-only and contract review/promotion milestones do not authorize further implementation ;
- real Missions execution, production, another canary and Clever Cloud remain blocked.

## Wave-execution decisions (ADR-0011, 2026-07-20)

- **WP-G2-I01 (auth-web) closed** (PR #111). **WP-G2-D01 (tenant data/RLS) closed** (PR #123, `43c85e7`): application layer + the mandatory PostgreSQL barrier (isolated owner migrations, `FORCE ROW LEVEL SECURITY`, append-only receipts, 35-day CHECK ceiling), adapters and Redis/Cellar ports, developed against a PGlite harness (`packages/testing`); two independent K4 reviews (`rls-adversarial-review`, `migration-and-deletion-review`) approved with conditions, the first security-critical merge of the data layer pronounced by the owner (ADR-0011 D4 bootstrap), F-01/F-03 carried to G4. **WP-G2-Q01 (foundation quality harness) closed** (PR #132, `5ea34f9`): reference-chain harness runs the full foundation chain green from a clean checkout (Bun.serve/React, contracts, RLS, Biscuit, WIT, Proof/Artifact, three-engine Playwright — 10/10, reproducible digest `f45dfad0…`), plus tree-wide secret and no-Clever gates; independent g2-foundation-acceptance review CLEAN. **G2 is closed.**
- **First engine: Notebook (pilot)**, then the remaining engines in parallel orchestrated by the layer-2 method **Polaris** (wave 4 split into 4a/4b).
- **Orchestrator Specification Lock (wave 3):** hard stop (ADR-0011 D3, hardened) — never pronounced in an autonomous run. An agent locks the loop-security kernel K1-K5, runs its independent adversarial review, produces the decision dossier, then stops; pronouncing the lock is an exclusive owner act.
- **Security gates in autonomous runs (ADR-0011 D4, graduated trust):** the first security-critical merge of a layer (first D01 RLS barrier, first security review of each product layer) is a hard stop for owner pronouncement — bootstrapping the trust chain; subsequent merges of the same pattern auto-proceed on a clean independent review by agents distinct from the implementer (K4 independence preserved throughout).
- **Autonomy ceilings (ADR-0011 D6):** numeric liveness and cost thresholds bound an autonomous run — per-PR ≤ 3 green attempts, 3 consecutive no-progress PRs per wave, per-PR > 400k output tokens, and per-wave token caps (Phase 0 300k, G2 1.5M, wave 1 1M, wave 2 2M, wave 4a 1M; α run total 6M). A breach stops with a progress dossier for an owner decision, never a silent kill.

## Next controlled milestone

- **Completed control:** Notebook Core v2 Gate B is approved for the exact disabled fixture-only host and the required physical macOS arm64 32+ GiB class ;
- **Selected next product (ADR-0011):** Notebook is the pilot engine; no other engine implementation starts until the Notebook app pattern is validated end-to-end, after which Polaris orchestrates the rest in parallel ;
- **Owner decision required:** Notebook user-data path activation, production, release, infrastructure or deployment still needs its own explicit milestone ;
- **Optional evidence:** physical 8/16–24 GiB observations and real browser-process OOM diagnostics may extend confidence or support without reopening the approved current scope unless they reveal a source defect.

## Explicitly deferred

- Clever Cloud provisioning, secrets, databases, DNS and deployment until G4 ;
- activation of public product repositories until an explicit owner decision per product (ADR-0008).

## Current risks

- Bun stable remains `1.3.14`; the selected Rust-line commit exists only in `1.4.0-canary.1` ;
- the Bun archive is a bootstrap-only LGPL/static-linking compliance path, not production approval ;
- GitHub forge/CI is an accepted US-service exception for public code only, never runtime data or secrets ;
- CODEOWNERS teams are target ownership, not enforced until at least two maintainers can review without deadlock ;
- locked engine vectors define only contract behavior; runtime conformance, bounded-resource evidence
  and end-to-end tenant/RLS proof remain separate G2 implementation evidence ;
- no local physical 8 Gio or 16–24 Gio Notebook device is currently available; these classes remain optional and unsupported, while VM evidence stays diagnostic-only ;
- real browser-process OOM remains unobserved portably across the three engines; it is an optional residual-risk diagnostic and global RAM/swap exhaustion is forbidden ;
- logical buffer wiping cannot be promoted as physical RAM/OS erasure ;
- the DCO gate now also verifies every commit a push introduces on `main`, requiring the merging maintainer's `Signed-off-by:` trailer inside GitHub-generated merge messages (anticipatory `WP-G2-Q01` change); detection on the merge commit itself is post-merge, so a violation surfaces as a failed `main` run remediated by a forward commit, and pre-gate merge commits remain unexamined accepted history.
