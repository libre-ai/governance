# Orchestrator SQLx Direct Profile Amendment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Authorize the owner-selected direct SQLx component profile without weakening the active-source no-emission boundary.

**Architecture:** Amend ADR-0040/D45 and the existing persistence design/plan in place, with a dated correction preserving the original decision history. Use unmodified registry sqlx-core and sqlx-postgres 0.9.0 directly; forbid the sqlx facade and migrate feature throughout the selected final consumer graph. No schema, wire authority, ownership or production capability changes.

**Tech Stack:** Governance Bun/TypeScript gates; downstream Rust 1.97, SQLx components 0.9.0 and exact existing logging/runtime pins.

**Spec:** docs/superpowers/specs/2026-09-11-orchestrator-run-control-persistence-design.md

## Global Constraints

- User selected C after a dependency trade-off study; merge remains the Governance signature. Record a candidate amendment, not a completed runtime qualification.
- Preserve Contracts, Missions, root pure API, persistence schema, work-package writePaths and all existing production blockers.
- Exact new direct declarations replace only the sqlx facade declaration:

```toml
sqlx-core = { version = "=0.9.0", default-features = false, features = ["_rt-tokio", "json", "chrono"] }
sqlx-postgres = { version = "=0.9.0", default-features = false, features = ["json", "chrono"] }
```

- Keep other normal/dev dependencies and their exact versions unchanged.
- Reject the sqlx facade, any SQLx component version duplication, migrate/offline/any/macros, other drivers, TLS and ipnet from the selected runtime/test consumer graph. Empty default features of core may appear from the upstream Postgres dependency; test concrete effective sets, not feature names in isolation.
- Distinguish selected build features from Cargo metadata/lockfile's package superset. Audit debug, release and dev log-always profiles. Reject feature reactivation by a separate same-graph consumer dependency before acceptance.
- No testing-directory bypass exception, vendored patch, fork or call-graph waiver. Source audit excludes truly unselected cfg branches, not merely directories named testing.
- Explicitly accept the semver-exempt sqlx-core API and private _rt-tokio coupling only for this proof, with exact pins and complete requalification on updates. No performance or production-readiness claim follows.
- The prior compile-only diagnostic proved component API availability and known module exclusion, not E2E or complete dependency-source safety. PostgreSQL and error/collector proofs remain pending.
- English personal DCO commits; no personal identity in tracked prose or Co-Authored-By trailer.

### Task 1: Amend authority and its executable consistency gate

**Files:**
- Modify `tools/quality/check-orchestrator-run-control-persistence-authority.test.ts`.
- Modify `docs/adr/0040-orchestrator-run-control-persistence.md`.
- Modify `docs/decisions/DECISION-REGISTER.md` (D45 only).
- Modify `docs/superpowers/specs/2026-09-11-orchestrator-run-control-persistence-design.md`.
- Modify `docs/superpowers/plans/2026-09-11-orchestrator-run-control-persistence.md`.
- Include this amendment plan without expanding its scope.

**Interfaces:** Existing ADR/D45 and work-package authority remain intact. Revised manifest, import paths and feature/source qualification steps feed downstream Task3.

- [ ] Add red assertions for exact direct component declarations, refusal of facade/reactivation, selected-graph audit and semver-exempt requalification. Assert the executable manifest block no longer declares `sqlx =`, and positive code snippets use component APIs. Preserve literal logging target `sqlx::postgres::notice` (a driver string, not an import).
- [ ] Run `bun test tools/quality/check-orchestrator-run-control-persistence-authority.test.ts`; capture expected failures against the old facade profile.
- [ ] Amend the five authority/gate files. Add a dated correction explaining facade's unconditional core/migrate activation and its two eprintln sites, without claiming an observed API leak. Bind upstream sources to SQLx v0.9.0. Align spec, exact manifest and gate requirements; change `sqlx::raw_sql` to `sqlx_core::raw_sql::raw_sql`, and PgConnectOptions examples/import aliases to `sqlx_postgres`.
- [ ] Specify downstream negative selected-graph fixtures: facade introduced by another consumer, direct core/migrate, postgres/migrate, duplicate SQLx versions, TLS or extra features; all fail closed. Keep zero-emission collector, socket sanitation, release/dev and all existing evidence requirements.
- [ ] Run targeted gate, then stage only named files and run `bun run check` once. Inspect diff and commit with `git commit -s -m "Authorize direct SQLx components for persistence proof"` only if green.

### Task 2: Review and publish the exact Governance amendment

**Files:** no implementation changes; standard review evidence only if required by repository protocol.

- [ ] Review exact committed SHA independently for architecture/quality and security/privacy, including contradictory old facade instructions, weakening of runtime guarantees, selected-graph semantics and downstream composability.
- [ ] Fix any blocking findings in scoped commits with focused tests; re-review changed scope.
- [ ] Verify personal GitHub account and push only the amendment branch; open a PR with exact reviewed SHA, tests and unchanged production blockers.
- [ ] Require green CI and owner signature before this changed authority governs Orchestrator implementation. Do not use pending Governance text as merged authority.

### Task 3: Resume the existing Orchestrator plan only under merged authority

**Files:** existing Task3 boundary files, no new persistence or schema scope.

- [ ] Verify merged Governance object/tree and refresh the exact authority pin used by the boundary gate. Preserve existing Orchestrator WIP and its diagnostic record.
- [ ] Resume original persistence Task3 with revised direct components, negative consumer-unification cases and full selected-source audit; reuse its TDD ledger and review gate, not an unreviewed replacement.
- [ ] Continue the existing persistence plan only after Task3 acceptance. The separate unresolved URN storage-bound decision remains unresolved by this dependency approval.
