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
- Bun canary binaries, exact source, notices and checksums published in a durable prerelease ;
- shared GitHub CI runs `29491575814` and `29491734252` green for exact Bun and Rust gates ;
- protected `main`, private vulnerability reporting, secret scanning/push protection and dependency alerts enabled ;
- nine application specifications expanded to the G1 standard with an executable structure gate ;
- G1 decisions Q1–Q5 explicitly accepted and recorded in ADR-0002: tenancy, OIDC boundary, retention, Notebook local-only and Boussole release authority ;
- canonical contract baseline plus Radar v2 locked: 55 authorities, including 36 strict JSON Schemas, 9 OpenAPI surfaces, 6 parsed WIT worlds and 3 parsed Biscuit authority/policy sources ;
- data lifecycle locked through an executable ADR-0002 retention policy, tenant ownership matrix, deletion receipt and restore/rollback rules ;
- provider-neutral OIDC, opaque browser session, CSRF, Biscuit issuance/attenuation/revocation and Ed25519 rotation protocols locked ;
- G1 initially closed with 26 machine-validated work packages, acyclic dependencies and explicit human gates.

## Current G2 entry

- `WP-G2-T01` completed as a human-accepted negative checkpoint: stable `1.3.14` predates the Rust line by 903 commits ;
- `WP-G2-C01` contract SDK and boundary validators was completed by PR #7: reproducible TypeScript/Rust projections and fail-closed runtime validation cover every canonical JSON Schema ;
- ADR-0003 opened a strictly bounded contract amendment for WP-G2-S01: Radar v2 is now locked after its role verdicts, promotion pass and owner milestone; 16 Notebook/Policy/Boussole/shared authorities remain candidate ;
- solo G2 governance requires attributable role-separated review-only passes on immutable commits; the same agent/session may perform serial authoring and review passes, while the repository owner retains explicit control milestones ;
- Radar v2 Architecture and Security are approved and its seven authorities are locked; Notebook remains pending its own complete role and promotion evidence ;
- Policy v2 Architecture, Security and France/EU Privacy reviews are complete and durably indexed, but Policy remains candidate pending a separate promotion pass and owner milestone ;
- Boussole v2 security is historically remediated, while the latest Architecture/Privacy rejects require fresh verdicts on the aggregation, attestation, typed-URN and catalog remediation; public scoring remains NO-GO ;
- no Radar, Policy or Boussole product engine, generic Context crate, Agent Orchestrator or Practices scorer is implemented; contract review/promotion milestones do not authorize implementation ;
- real Missions execution, production, another canary and Clever Cloud remain blocked.

## Explicitly deferred

- Clever Cloud provisioning, secrets, databases, DNS and deployment until G4 ;
- public repository projections until G5.

## Current risks

- Bun stable remains `1.3.14`; the selected Rust-line commit exists only in `1.4.0-canary.1` ;
- the Bun archive is a bootstrap-only LGPL/static-linking compliance path, not production approval ;
- GitHub forge/CI is an accepted US-service exception for public code only, never runtime data or secrets ;
- CODEOWNERS teams are target ownership, not enforced until at least two maintainers can review without deadlock ;
- candidate engine vectors now define contract behavior, but runtime conformance, bounded-resource
  evidence and end-to-end tenant/RLS proof remain G2 implementation evidence.
