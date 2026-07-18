# Transformation status

**Current phase:** G2 — Canonical Foundations.

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
- missing Gear remote recreated solely as a verified archive ;
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
- ADR-0003 opened and closed a strictly bounded contract amendment for WP-G2-S01: Radar, Notebook Core, Policy Core, Boussole v2 and the shared engine-vector envelope are locked after role verdicts, promotion reviews and owner milestones ;
- solo G2 governance requires attributable role-separated review-only passes on immutable commits; the same agent/session may perform serial authoring and review passes, while the repository owner retains explicit control milestones ;
- Radar v2 Architecture and Security are approved and its seven authorities are locked; Policy v2 Architecture, Security and Privacy are approved on `d47feb9` and exactly six authorities are locked; Notebook Core v2 is locked after Gate A + owner `continue`, with four role verdicts APPROVE, while Gate B remains mandatory before any user backup, production or release ;
- Notebook now has an exact product host disabled by default from PR #95 and qualification-only crash/kill/restart evidence from PR #97 on Chromium, Firefox and WebKit; these candidate-integration passes do not approve Gate B, real process OOM, physical quota exhaustion, physical memory erasure or constrained hardware classes ;
- Policy v2 now has closed WIT refusals, byte-exact malformed-input vectors and preimplementation CPU/memory budgets, without an evaluation engine ;
- Boussole v2 Architecture, Security, Methodology and France/EU Privacy are approved on `e83e142`; exactly five authorities transition to locked through a catalog-only promotion, while public scoring, any engine and real datasets remain NO-GO ;
- the shared `engine-golden-vectors-v1` transitions to locked through a separate catalog-only promotion approved by promotion-integration on `3b47e96` and final owner `continue`, after candidate-integration, Architecture and Security approval at `ccf9d68` plus challenged acceptance of exact dev-only `entities@8.0.0`; this fixes contract meaning only and authorizes no engine/runtime/data/release scope ;
- agent orchestration option B reaches contract Specification Lock after Architecture/Security/France-EU Privacy reviews, a remediated actual-Biscuit candidate-integration and catalog-only promotion of 14 unchanged authorities; simulation-only `WP-G2-A01` now has an accepted pure Rust decision core plus favorable result Architecture/Security/France-EU Privacy and conformance reviews on `7f31ec3`, Pi remains replaceable and no harness, worker launch or real mission is authorized ;
- no Radar, Policy or Boussole product engine, generic Context crate, Agent Orchestrator runtime/harness or Practices scorer is implemented; the accepted agent control crate is simulation-only and contract review/promotion milestones do not authorize further implementation ;
- real Missions execution, production, another canary and Clever Cloud remain blocked.

## Next controlled milestone

- **Owner choice:** close Notebook Core v2 Gate B before authorizing any first Radar, Policy or Boussole product engine ;
- **Authorized scope:** Gate B host/qualification remediation and reproducible evidence using public fixtures, including physical macOS arm64 classes at 8 Gio and 16–24 Gio under the bounded ADR-0005 exception ;
- **Exit evidence:** specialized review of the exact product host, real IndexedDB quota exhaustion and recovery, real browser-process OOM handling, defensible memory-erasure guarantees, physical constrained-class budgets and a fresh review-only Gate B verdict on an immutable commit ;
- **Still blocked:** user backups, personal/tenant data, production, release, infrastructure, deployment and every new product engine. A later engine requires its own explicit owner milestone.

## Explicitly deferred

- Clever Cloud provisioning, secrets, databases, DNS and deployment until G4 ;
- public repository projections until G5.

## Current risks

- Bun stable remains `1.3.14`; the selected Rust-line commit exists only in `1.4.0-canary.1` ;
- the Bun archive is a bootstrap-only LGPL/static-linking compliance path, not production approval ;
- GitHub forge/CI is an accepted US-service exception for public code only, never runtime data or secrets ;
- CODEOWNERS teams are target ownership, not enforced until at least two maintainers can review without deadlock ;
- locked engine vectors define only contract behavior; runtime conformance, bounded-resource evidence
  and end-to-end tenant/RLS proof remain separate G2 implementation evidence ;
- no local physical 8 Gio or 16–24 Gio Notebook device is currently available; VM evidence remains diagnostic-only, and logical buffer wiping cannot be promoted as physical RAM/OS erasure.
