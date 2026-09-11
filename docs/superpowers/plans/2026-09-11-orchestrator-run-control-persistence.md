# Orchestrator Run-Control Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove atomic, organization-isolated and lifecycle-safe persistence of locked authorized-execution events in a separate Rust crate without opening a production service or external effect.

**Architecture:** Governance first authorizes only the persistence slice of the existing locked `WP-G3-O01` under ADR-0039/D45. Orchestrator then adds `crates/agent-orchestrator-run`, whose private SQLx pools enforce role separation, transaction-local organization context and connection scrubbing; append operations store RFC 8785 bytes and replay the complete locked event chain through the unchanged pure core. Immutable bounded retention observations separately rebuild a mutable lifecycle projection without making the database a policy authority. A dedicated pre-open restore role removes tombstoned lineages across organizations without widening application or live-retention identities.

**Tech Stack:** Rust 1.97 / edition 2024, SQLx 0.9.0, Tokio, PostgreSQL 14+, `pgcrypto`, RFC 8785 JCS, SHA-256, Bun 1.4 gates and GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-11-orchestrator-run-control-persistence-design.md`

## Global Constraints

- Decision order is Security, Quality, Performance, Completeness.
- Governance ADR-0039/D45 must be merged and verified on `main` before the Orchestrator implementation worktree is created.
- This is a bounded first slice of existing `WP-G3-O01`; do not create an overlapping work package or claim the complete runtime package.
- The accepted `WP-G3-O02` pure core is a mandatory dependency. Verify its
  accepted evidence, exact current implementation pin and unchanged public API
  before implementation; do not add accessors for private replay state.
- This non-executing persistence slice alone may begin while Harness delivery
  is still pending. WP-G3-H01 remains a prerequisite for every later slice and
  for completion of `WP-G3-O01`; no Harness import, worker invocation, service
  or effect is allowed here.
- The root `libre-ai-agent-orchestrator` crate and its public API remain unchanged; the new crate consumes its existing parsing and whole-chain replay functions.
- Contracts remains sole wire/retention authority. Store RFC 8785 event bytes as execution replay authority and bounded immutable retention observations as local lifecycle replay evidence; neither relational projection nor the observation journal selects policy.
- `runs` stores only mechanically extracted immutable bindings and the current
  event head. It stores no replay phase, generation-derived state or current
  budget counters; `budget_ledger` mechanically copies validated event fields
  and never becomes a second reducer.
- Whole-chain append replay is deliberately `O(n)`. No production service may consume it until separately authorized incremental state or an authoritative measured bound closes that risk.
- The library reads no environment, file, process state, wall clock or secret. Its only I/O is PostgreSQL through private pools built from caller-provided `PgConnectOptions`.
- Pin every dependency exactly. SQLx uses only `runtime-tokio`, `tls-rustls-ring-native-roots`, `postgres`, `json` and `chrono`; no macros, embedded migrations, SQLite or MySQL.
- App, retention and restore use separate connection identities and pools. Store construction overrides caller options with `disable_statement_logging()`. Every returned connection first clears SQLx's client statement cache, then executes unprepared `DISCARD ALL`; either scrub failure discards it.
- Every live app/retention writer explicitly begins at `READ COMMITTED` before
  role/context setup. Guard functions and the anti-resurrection trigger are
  `VOLATILE` and refuse unless `current_setting('transaction_isolation')` is
  `read committed`; restore alone uses `REPEATABLE READ` after writers are
  fenced.
- Every organization transaction uses literal `SET LOCAL ROLE` plus `set_config('app.tenant_id', $1, true)`. Every organization table has `ENABLE` and `FORCE ROW LEVEL SECURITY`.
- `libre_ai_app`, `libre_ai_retention`, `libre_ai_restore` and `libre_ai_tombstone_guard` are `NOLOGIN NOSUPERUSER NOBYPASSRLS`. Product migrations assert roles exist but never create them.
- Restore is pre-open-only and internally batch-bounded; one public reconciliation call processes every page inside one repeatable-read transaction. It has no append, export, update, schema or application capability.
- Restore additionally requires an authenticated deletion-registry fact whose locally recomputed row count/digest match, whose coverage reaches an authoritative fence over every run/tombstone mutator including retention expiry, and whose execution snapshot is no older than `P35D`; zero residual lineages alone is never an opening proof.
- Restore registry verification and per-run indexed tombstone lookup have the
  honest decision bound `O(tombstones + runs * log(tombstones))`; including
  physical cascade deletion, total restore is
  `O(tombstones + runs * log(tombstones) + purged_rows)`. Client memory remains
  bounded by one validated page and whole-registry hash joins are refused.
- Public errors and `Debug`/`Display` reveal constant codes or aggregate counts only: never SQL, connection data, identifiers, digests, documents, paths or rejected values.
- Tests use synthetic identifiers only and fail, never skip, when PostgreSQL is absent.
- Strict red-green-refactor applies to non-trivial logic. Coverage remains blocking at 87% lines and 90% functions; formatting, Clippy `-D warnings`, tests, dependency policy and Bun gates remain green.
- English DCO-signed commits, no `Co-Authored-By: Codex`; personal GitHub author/committer/sign-off; the email stays out of tracked artifacts.
- ADR-0011 D4 is a hard stop: after independent review, stop before the first persistence merge for explicit owner pronouncement.

---

## Repository and file map

### Governance

- Create `docs/adr/0039-orchestrator-run-control-persistence.md`.
- Modify `docs/decisions/DECISION-REGISTER.md` with D45.
- Prepare the approved design status on the ADR branch; it takes effect as authority only after ADR merge.
- Create `tools/quality/check-orchestrator-run-control-persistence-authority.test.ts`.
- Modify `docs/transformation/work-packages.v1.json` to add `WP-G3-O02` as an
  O01 dependency, prospectively transfer the six exact shared Orchestrator
  support paths O02 owned, and assign the exact CI workflow path to O01 for the
  first time under the satellite rule.
- Modify `tools/quality/check-authorized-execution-native-core-authority.test.ts`
  so the O02 gate binds the remaining pure-core paths after that transfer.
- Apply the ADR-0020 satellite precedence rule: broad historical paths still
  recorded under completed `WP-G2-T01`, `WP-G2-Q01` and `WP-G2-A01` are not
  concurrent Orchestrator satellite authority. No branch for those packages or
  O02 may touch an O01 transferred path while this slice is active.

### Orchestrator

- Modify `Cargo.toml`, `Cargo.lock`, `package.json` and `.github/workflows/ci.yml`.
- Create `crates/agent-orchestrator-run/Cargo.toml`.
- Create `src/{lib,error,ids,cursor,pool,event,store,lifecycle,restore}.rs` in that crate.
- Create `migrations/0001_run_control.sql` and `0002_deletion_barrier.sql` in that crate.
- Create `tests/domain.rs`, one serial `tests/postgres.rs`, focused `tests/postgres/*.rs`, and `tests/support/*.rs`.
- Create `benches/postgres_persistence.rs` and `tests/compat/{public_surface,stable_codes}.snapshot` plus `tests/compat_surface.rs`.
- Create `verification/agent-orchestrator/check-run-capabilities.ts`,
  `run-capability-boundary.test.ts`, `with-postgres.sh`,
  `benchmark-memory.sh` and `review-evidence.test.ts`.
- Modify `README.md`, `docs/apps/orchestrator.md`, `project.v1.yaml` and `tools/quality/rust-coverage-gate.test.ts`.
- Create `docs/reviews/orchestrator-run-control-persistence/$REVIEW_SHORT/` only after computing the seven-character immutable implementation SHA.

## Locked branch interfaces

```rust
pub struct OrganizationId(String);
pub struct RunId(String);
pub struct Digest([u8; 32]);
pub struct PoolLimits { max_connections: NonZeroU32, acquire_timeout: Duration }

pub enum StoreError { InvalidInput, Conflict, Unavailable, IntegrityFailure, Internal }
pub enum AppendOutcome { Appended { sequence: u64 }, Idempotent { sequence: u64 } }
pub struct EventPageRequest { cursor: Option<String>, limit: u16 }
pub struct LedgerPageRequest { cursor: Option<String>, limit: u16 }
pub struct ReferencePageRequest { cursor: Option<String>, limit: u16 }
pub struct RunSweepPageRequest { cursor: Option<String>, limit: u16 }
pub struct RestoreBatchSize(NonZeroU16);
pub struct TombstoneExpiryBatchSize(NonZeroU16);
pub struct PageMeta { pub next_cursor: Option<String> }
pub struct Page<T> { pub data: Vec<T>, pub meta: PageMeta }

pub struct RunSnapshot { run_id: RunId, head_sequence: u64, head_event_digest: Digest, retention_until: DateTime<Utc> }
pub struct StoredEvent { sequence: u64, canonical_jcs: Vec<u8> }
pub struct BudgetMovement { sequence: u64, delta: [u64; 7], total: [u64; 7] }
pub struct AttestationReference { sequence: u64, kind: ReferenceKind, id: String, digest: Digest, media_type: String }
pub struct RetentionYears(NonZeroU8);
pub struct MissionRetentionFact { mission_id: String, retention: RetentionYears, observed_at: DateTime<Utc> }
pub struct DeletionRegistryFact { execution_snapshot_at: DateTime<Utc>, writers_fenced_at: DateTime<Utc>, coverage_through: DateTime<Utc>, tombstone_count: u64, tombstone_set_digest: Digest }
pub struct DeletionCommand { organization_id: OrganizationId, run_id: RunId, receipt_digest: Digest, deleted_at: DateTime<Utc> }
pub struct DeletionOutcome { pub deleted: bool }
pub struct SweepOutcome { pub inspected: u16, pub deleted: u16, pub meta: PageMeta }
pub struct TombstoneExpiryOutcome { pub deleted: u16 }
pub struct RestoreOutcome { pub processed: u64, pub deleted: u64, pub remaining: u64 }

pub enum ReferenceKind { Graph, Authorization, Invocation, Result, DecisionRequest, DecisionResponse, Lifecycle, ExecutionTransfer }

pub struct RunStore { pool: PgPool, registry: ContractRegistry }
pub struct LifecycleStore { pool: PgPool }
pub struct RestoreStore { pool: PgPool }

impl RunStore {
    pub async fn connect(options: PgConnectOptions, limits: PoolLimits) -> Result<Self, StoreError>;
    pub async fn append_event(&self, organization_id: &OrganizationId, graph_document: &Value, event_document: &Value, mission_retention: &MissionRetentionFact, observed_at: DateTime<Utc>) -> Result<AppendOutcome, StoreError>;
    pub async fn get_run(&self, organization_id: &OrganizationId, run_id: &RunId) -> Result<Option<RunSnapshot>, StoreError>;
    pub async fn list_events(&self, organization_id: &OrganizationId, run_id: &RunId, request: EventPageRequest) -> Result<Page<StoredEvent>, StoreError>;
    pub async fn get_budget_ledger(&self, organization_id: &OrganizationId, run_id: &RunId, request: LedgerPageRequest) -> Result<Page<BudgetMovement>, StoreError>;
    pub async fn get_attestation_refs(&self, organization_id: &OrganizationId, run_id: &RunId, request: ReferencePageRequest) -> Result<Page<AttestationReference>, StoreError>;
}

impl LifecycleStore {
    pub async fn connect(options: PgConnectOptions, limits: PoolLimits) -> Result<Self, StoreError>;
    pub async fn apply_mission_retention(&self, organization_id: &OrganizationId, run_id: &RunId, fact: &MissionRetentionFact) -> Result<(), StoreError>;
    pub async fn delete_run(&self, command: &DeletionCommand) -> Result<DeletionOutcome, StoreError>;
    pub async fn sweep_expired(&self, organization_id: &OrganizationId, observed_at: DateTime<Utc>, request: RunSweepPageRequest) -> Result<SweepOutcome, StoreError>;
    pub async fn expire_tombstones(&self, observed_at: DateTime<Utc>, batch_size: TombstoneExpiryBatchSize) -> Result<TombstoneExpiryOutcome, StoreError>;
}

impl RestoreStore {
    pub async fn connect(options: PgConnectOptions, limits: PoolLimits) -> Result<Self, StoreError>;
    pub async fn replay_tombstones(&self, registry: &DeletionRegistryFact, observed_at: DateTime<Utc>, batch_size: RestoreBatchSize) -> Result<RestoreOutcome, StoreError>;
    pub async fn suppressed_lineage_count(&self, registry: &DeletionRegistryFact, observed_at: DateTime<Utc>) -> Result<u64, StoreError>;
}
```

All request values have validating constructors; their fields remain private. Returned records expose bounded getters and redacted `Debug`; none derives `Serialize`/`Deserialize`. Do not add a pool getter, raw-query escape hatch, log callback, environment constructor or framework checkpoint.

---

### Task 1: Authorize the persistence slice in Governance

**Files:**
- Create: `tools/quality/check-orchestrator-run-control-persistence-authority.test.ts`
- Create: `docs/adr/0039-orchestrator-run-control-persistence.md`
- Modify: `docs/decisions/DECISION-REGISTER.md`
- Modify: `docs/superpowers/specs/2026-09-11-orchestrator-run-control-persistence-design.md`
- Modify: `docs/superpowers/plans/2026-09-11-orchestrator-run-control-persistence.md`
- Modify: `docs/transformation/work-packages.v1.json`
- Modify: `tools/quality/check-authorized-execution-native-core-authority.test.ts`

**Interfaces:**
- Consumes: approved design and locked `WP-G3-O01`.
- Produces: ADR-0039/D45 persistence authority; no runtime authority before merge.

- [ ] **Step 1: Write the failing authority and ownership gates**

Create a Bun test that binds the exact prospective file map and dependency
split:

```ts
expect(hasExpectedAdrTitle(adr)).toBeTrue();
expect(hasSingleD45Entry(register)).toBeTrue();
expect(register).toContain("| D45 | Run-control persistence is isolated and non-executing");
expect(design).toContain("authority ADR-0039/D45");
const wp = plan.packages.find((entry) => entry.id === "WP-G3-O01");
expect(wp?.dependsOn).toEqual([
  "WP-G2-Q01", "WP-G2-D01", "WP-G2-A01", "WP-G3-H01", "WP-G3-O02",
]);
expect(wp?.writePaths).toEqual(expectedRunControlWritePaths);
expect(wp?.definitionStatus).toBe("locked");
expect(findRunControlOwners(plan).map((entry) => entry.id)).toEqual(["WP-G3-O01"]);
```

The exact O01 list contains the new crate, six shared support paths transferred
from O02, one newly assigned exact CI path, its review dossier, the Rust
coverage gate and its five named
verification files. Update the existing O02 authority gate to remove only
those transferred paths; `bun.lock`, root pure `src/**`, tests, compatibility
and O02 evidence remain O02-owned. The two tests together must fail if a path
is duplicated, missing or assigned through a broader glob.

The owner finder uses `Bun.Glob`, explicit child-prefix detection and a fail-closed static-prefix check for globs that can descend into the target. The canonical root, recursive parent `crates/**`, wildcard patterns such as `crates/agent-*/Cargo.toml`, `crates/*/src/**` and `**/*.rs`, global `**` and every child path therefore overlap. Synthetic negative cases must identify each competing owner while excluding a sibling crate. The Orchestrator implementation gate must later compare every changed path against the exact WP-G3-O01 writePaths, not only the crate subtree.

Run both focused authority tests and require failure before the ADR, dependency
and path transfer are applied.

- [ ] **Step 2: Write ADR-0039 and D45**

Use these exact decision headings:

```markdown
### D1 — Isoler la capacité PostgreSQL dans le second crate Rust
### D2 — Conserver les octets JCS comme autorité et rejouer toute la chaîne
### D3 — Séparer app, rétention, restore et guard sous FORCE RLS
### D4 — Rendre suppression et restauration anti-résurrection
### D5 — Mesurer le coût O(n) et interdire le branchement production
### D6 — Arrêter avant merge sur dossier indépendant
```

The non-authority paragraph names service, Biscuit, Missions, Harness, worker, effects, logs, secrets, deployment, native/LangGraph checkpoint and contract edits. D45 says `WP-G3-O01` remains incomplete.

- [ ] **Step 3: Make the gate green and commit**

Set the design status to `approved for implementation — owner, 2026-09-11; authority ADR-0039/D45`. Run both focused tests and `bun run check`. Then:

```bash
git add docs/adr/0039-orchestrator-run-control-persistence.md docs/decisions/DECISION-REGISTER.md \
  docs/superpowers/specs/2026-09-11-orchestrator-run-control-persistence-design.md \
  docs/superpowers/plans/2026-09-11-orchestrator-run-control-persistence.md \
  docs/transformation/work-packages.v1.json \
  tools/quality/check-orchestrator-run-control-persistence-authority.test.ts \
  tools/quality/check-authorized-execution-native-core-authority.test.ts
git commit -s -m "Authorize orchestrator run-control persistence"
```

### Task 2: Review and merge the Governance authority

**Files:** review the immutable Task 1 commit; create repository-standard evidence only if required.

**Interfaces:**
- Consumes: green Governance authoring commit.
- Produces: merged ADR-0039/D45 SHA, required by Task 3.

- [ ] **Step 1: Run role-separated doctrine review**

Review exact authority uniqueness, unchanged pure-core code/API, the
non-overlapping prospective O02→O01 support-path transfer, persistence-only
capability, the narrow H01 dependency split, append `O(n)` production block,
honest restore complexity, closed deletion function, least-privilege restore
and absent framework checkpoint. Any Blocking/Major finding invalidates the
SHA and returns to Task 1 with a regression assertion.

- [ ] **Step 2: Push, open the Governance PR and verify CI**

Push only the design branch and create the PR with `bun run check` evidence. Resolve its number with `governance_pr="$(gh pr view --json number --jq .number)"`, then run `gh pr checks "$governance_pr" --watch`. Require all checks green on the reviewed head.

- [ ] **Step 3: Stop for the doctrine owner signature, then verify merge**

Restate that merge creates persistence authority but no service/effect/deployment. Obtain explicit owner pronouncement. Only then merge without force and verify ADR-0039/D45 from fetched `origin/main`; record the full Governance SHA.

### Task 3: Create the isolated Orchestrator workspace boundary

**Files:**
- Modify: `Cargo.toml`, `Cargo.lock`, `package.json`
- Create: `crates/agent-orchestrator-run/Cargo.toml`, `crates/agent-orchestrator-run/src/lib.rs`
- Create: `verification/agent-orchestrator/check-run-capabilities.ts`
- Create: `verification/agent-orchestrator/run-capability-boundary.test.ts`

**Interfaces:**
- Consumes: merged Governance SHA, accepted O02 implementation/evidence and
  unchanged root crate 0.2.0 public API.
- Produces: compilable run crate and exact capability gate.

- [ ] **Step 1: Create the worktree only after authority merge**

```bash
set -euo pipefail
git fetch origin main
git worktree add ../../libre-ai-worktrees/orchestrator-run-control-persistence \
  -b feat/orchestrator-run-control-persistence origin/main
cd ../../libre-ai-worktrees/orchestrator-run-control-persistence
```

Verify clean status and personal GitHub identity.

Before editing, resolve the current Orchestrator `main`, verify the accepted
O02 implementation/evidence objects and confirm that its public replay state
still exposes at least sequence and event digest. Record those exact SHAs in
the review evidence. Check current Harness `main` without treating H01 as
satisfied: this slice may proceed while it is pending, but refuse immediately
if the planned diff imports Harness or opens any later O01 capability.

Concretely, locate the unique phase `native-authorized-execution` in
`project.v1.yaml`, then its unique `immutable-role-review` criterion. Require
that criterion to be `accepted`, parse the full implementation SHA from its
`evidence.reference`, require that object and named dossier to exist, require
the SHA to be an ancestor of fetched Orchestrator `main`, then run the O02
authority, compatibility and capability gates at that fetched head. A status
string or historical Governance row alone is not delivery proof.

- [ ] **Step 2: Write and run the red capability test**

```ts
expect(await checkRunCapabilityBoundary()).toEqual([]);
expect(runManifestFailures("sqlx = \"0.9\"")).toContain("sqlx-not-exact");
expect(runManifestFailures("sqlx = { version = \"=0.9.0\", default-features = true }")).toContain("sqlx-default-features-enabled");
expect(runSourceFailures("src/lib.rs", "std::fs::read(\"x\")")).toContain("capability-forbidden:src/lib.rs:filesystem");
expect(runSourceFailures("src/lib.rs", "std::env::var(\"DATABASE_URL\")")).toContain("capability-forbidden:src/lib.rs:environment");
```

The scanner covers only production `src/**/*.rs` and forbids filesystem, process, arbitrary network, environment, wall-clock constructors, logs/tracing, HTTP/RPC, unsafe/FFI and framework names. It also loads the merged machine work-package map and compares every changed path against the exact WP-G3-O01 writePaths; any O02-owned or unlisted path fails. Run the test and require failure because the crate/checker are absent.

- [ ] **Step 3: Add workspace and exact manifest**

Keep root package intact and use:

```toml
[workspace]
members = ["crates/agent-orchestrator-run"]
resolver = "3"
```

New manifest:

```toml
[package]
name = "libre-ai-agent-orchestrator-run"
version = "0.1.0"
edition = "2024"
rust-version = "1.97"
license = "EUPL-1.2"
repository = "https://github.com/libre-ai/orchestrator"
publish = false

[dependencies]
base64 = "=0.22.1"
chrono = { version = "=0.4.45", default-features = false, features = ["serde", "std"] }
libre-ai-agent-orchestrator = { path = "../..", version = "=0.2.0" }
libre-ai-contract-types = { version = "=0.1.0", git = "https://github.com/libre-ai/sdk-rs", rev = "ac9f2020425733183839a58fc2c3928a4de5c066" }
serde_jcs = "=0.2.0"
serde_json = { version = "=1.0.151", features = ["float_roundtrip"] }
sha2 = { version = "=0.11.0", default-features = false }
sqlx = { version = "=0.9.0", default-features = false, features = ["runtime-tokio", "tls-rustls-ring-native-roots", "postgres", "json", "chrono"] }

[dev-dependencies]
tokio = { version = "=1.53.1", default-features = false, features = ["macros", "rt-multi-thread", "sync", "time"] }

[[bench]]
name = "postgres_persistence"
harness = false
```

The selected Tokio 1.53.1 release is MIT, requires Rust 1.71 and is compatible with Rust 1.97. If the locked SQLx graph cannot unify on it, stop with the resolver evidence rather than introducing a second Tokio version.

- [ ] **Step 4: Implement/wire the gate and prove green**

The checker compares exact production/dev dependency sets and SQLx features, and rejects `build.rs`, `src/main.rs`, `src/bin` and alternate production dependency sections. Add `check:run-capabilities` to `package.json` immediately after the pure capability gate. Generate and inspect the lock once, then run:

```bash
cargo check --locked --workspace
bun install --frozen-lockfile
bun test verification/agent-orchestrator/run-capability-boundary.test.ts
bun run check:capabilities
bun run check:run-capabilities
```

- [ ] **Step 5: Commit the boundary**

```bash
git add Cargo.toml Cargo.lock package.json crates/agent-orchestrator-run \
  verification/agent-orchestrator/check-run-capabilities.ts \
  verification/agent-orchestrator/run-capability-boundary.test.ts
git commit -s -m "Add isolated run-control persistence crate"
```

### Task 4: Add redacted domain types, errors and cursors

**Files:** create `src/error.rs`, `src/ids.rs`, `src/cursor.rs`, `tests/domain.rs`; modify crate `src/lib.rs`.

**Interfaces:**
- Consumes: exact Base64/SHA dependencies.
- Produces: IDs, digests, `PoolLimits`, `StoreError`, page/cursor types and outcomes from the locked interface.

- [ ] **Step 1: Write red tests**

```rust
#[test]
fn identifiers_and_errors_never_reflect_input() -> Result<(), StoreError> {
    assert!(OrganizationId::parse("ten_0123456789abcdef").is_ok());
    assert!(matches!(OrganizationId::parse("PERSON@example.com"), Err(StoreError::InvalidInput)));
    let identifier = OrganizationId::parse("ten_0123456789abcdef")?;
    assert_eq!(format!("{identifier:?}"), "OrganizationId(<redacted>)");
    for error in StoreError::ALL {
        assert_eq!(error.to_string(), error.code());
        assert_eq!(format!("{error:?}"), error.code());
    }
    Ok(())
}
```

Also cover organization length/case, malformed URNs, noncanonical digests, page limits 0/101, restore/tombstone-expiry batch sizes 0/101, pool bounds and every invalid ordering/bound in `DeletionRegistryFact`. Implement four non-interchangeable cursor types. Each starts with tag `0x01` event, `0x02` ledger, `0x03` reference or `0x04` sweep and a 32-byte scope digest. Run scope is `SHA-256("libre-ai.run-cursor-scope.v1\0" || u32be(org_len) || org || u32be(run_len) || run)`; organization scope is `SHA-256("libre-ai.organization-cursor-scope.v1\0" || u32be(org_len) || org)`. Then encode the total SQL order key: event `(u64be sequence, 32-byte event digest)`, ledger `u64be sequence`, reference `(u64be sequence, explicit u8 kind code 1..8, u16be id length, id bytes, 32-byte digest)`, and sweep `(i64be retention-until Unix microseconds, u16be run-id length, run-id bytes)`. Encode Base64 URL-safe without padding. Fixed vectors cover every type; reject wrong tag/scope/length/alphabet/padding, zero sequence, invalid UTF-8/length framing and noncanonical re-encoding.

- [ ] **Step 2: Run red and implement minimal values**

Run `cargo test -p libre-ai-agent-orchestrator-run --test domain --locked` and require compile failure. Implement manual validators and manual redacted formatting. Error codes are exactly:

```rust
match self {
    Self::InvalidInput => "run-store.invalid-input",
    Self::Conflict => "run-store.conflict",
    Self::Unavailable => "run-store.unavailable",
    Self::IntegrityFailure => "run-store.integrity-failure",
    Self::Internal => "run-store.internal",
}
```

Keep SQLx errors out of the public enum. A private mapper uses SQLSTATE class `08` for unavailable, `23`/`40` for conflict and internal otherwise, without formatting the source.

- [ ] **Step 3: Prove green and commit**

```bash
cargo test -p libre-ai-agent-orchestrator-run --test domain --locked
cargo clippy -p libre-ai-agent-orchestrator-run --all-targets -- -D warnings
git add crates/agent-orchestrator-run/src crates/agent-orchestrator-run/tests/domain.rs
git commit -s -m "Add bounded run-store domain types"
```

### Task 5: Create the PostgreSQL schema and deterministic test cluster

**Files:** create both migration files, `tests/support/postgres.rs`, `tests/postgres.rs`, `tests/postgres/schema.rs`, `verification/agent-orchestrator/with-postgres.sh`; modify `package.json`.

**Interfaces:**
- Consumes: PostgreSQL 14+ with `pgcrypto` and four pre-provisioned no-login roles.
- Produces: schema `orchestrator_run` plus separate app/retention/restore test identities.

- [ ] **Step 1: Write the red schema test**

Assert exactly seven product tables in schema `orchestrator_run`; `relrowsecurity && relforcerowsecurity` for the six organization tables and for the content-free tombstone table; every role has login/superuser/bypass flags false; and grants match the design. Include `run_retention_facts` and `run_lifecycle` in exact RLS, trigger and privilege assertions. The integration-only migration ledger lives in distinct schema `orchestrator_run_test_support` and is excluded from the product-table count. Also prove migration refusal when a role or `pgcrypto` is absent.

- [ ] **Step 2: Build the local PostgreSQL wrapper**

Use a validated `mktemp` directory and cleanup trap:

```bash
set -euo pipefail
pg_bin="$(pg_config --bindir)"
major="$("$pg_bin/postgres" --version | sed -E 's/.* ([0-9]+).*/\1/')"
test "$major" -ge 14
cluster="$(mktemp -d)"
tmp_root="${TMPDIR:-/tmp}"
tmp_root="${tmp_root%/}"
case "$cluster" in "$tmp_root"/*) ;; *) exit 1 ;; esac
case "$cluster" in *[!A-Za-z0-9_./-]*) exit 1 ;; esac
chmod 700 "$cluster"
socket="$cluster/socket"
mkdir -m 700 "$socket"
trap '"$pg_bin/pg_ctl" -D "$cluster/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$cluster"' EXIT
"$pg_bin/initdb" -D "$cluster/data" --auth-local=trust --auth-host=reject --no-locale >/dev/null
"$pg_bin/pg_ctl" -D "$cluster/data" -o "-F -k '$socket' -c listen_addresses=''" -w start >/dev/null
test "$("$pg_bin/psql" -h "$socket" -d postgres -Atqc 'SHOW listen_addresses')" = ""
test "$("$pg_bin/psql" -h "$socket" -d postgres -Atqc \
  "SELECT count(*) FROM pg_hba_file_rules WHERE type <> 'local' AND auth_method IS DISTINCT FROM 'reject'")" = "0"
```

The empty `listen_addresses` assertion proves that this cluster owns no TCP
listener; the `pg_hba_file_rules` assertion keeps every host rule fail-closed
even if a later edit accidentally re-enables one. Local `trust` is confined to
the mode-0700 random socket directory. Add wrapper-source assertions for all
three properties and a negative fixture that removes each one in turn.

Bootstrap one synthetic database, `pgcrypto`, the four global no-login roles and three login identities, each a member of exactly one connection role. Export percent-encoded Unix-socket app/retention/restore URLs only to the child command after `--`.

- [ ] **Step 3: Prove red against absent migrations**

```bash
verification/agent-orchestrator/with-postgres.sh -- \
  cargo test -p libre-ai-agent-orchestrator-run --test postgres schema --locked -- --test-threads=1
```

Require failure because `orchestrator_run.runs` is absent.

- [ ] **Step 4: Implement the run-control migration**

Create `runs`, `run_events`, `run_retention_facts`, `run_lifecycle`, `budget_ledger` and `attestation_refs`. Use composite `(tenant_id, run_id)` keys, seven nonnegative checked budget delta/total columns only in `budget_ledger`, 32-byte digest checks, sequence range 1..1,000,000,000 and `canonical_jcs` byte length 1..65,536. `runs` stores only mechanically extracted immutable bindings, creation/last-event instants and head sequence/digest; it has no phase, readiness, completion, quarantine, active generation or current budget columns. `run_events` is unique on `(tenant_id,event_id)`, foreign-keyed to runs with cascade, append-only by grant and update trigger. Every budget row binds the same event sequence and digest and copies only schema-validated event fields; SQL never derives budget policy. `attestation_refs` uses the total primary key `(tenant_id,run_id,sequence,kind,id,digest)`. `run_retention_facts` is append-only with primary key `(tenant_id,run_id,observed_at)` and an explicit digest comparison for idempotency/conflict; `run_lifecycle` is its disposable current projection. Index `(tenant_id,run_id,sequence,event_digest)`, the reference order key, `run_lifecycle(tenant_id,retention_until,run_id)` and tombstones `(expires_at,subject_digest)`.

Every organization table uses:

```sql
ALTER TABLE orchestrator_run.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_run.runs FORCE ROW LEVEL SECURITY;
CREATE POLICY runs_organization ON orchestrator_run.runs
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), ''));
```

Grant app only column-scoped `UPDATE` on the mutable mechanical head and last-event fields of `runs`, plus the exact organization-scoped reads/inserts needed for append. Grant app and retention `UPDATE` only on the retention years, deadline, latest observation instant and fact digest in `run_lifecycle`; grant the exact `SELECT`/`INSERT` needed on `run_retention_facts`. Retention receives per-organization lifecycle reads and no raw `UPDATE` or `DELETE` on `runs`; no role receives table-wide `UPDATE` on either projection. All app writers and guard-owned deletion calls lock `run_lifecycle` before touching a lineage. `runs` identity/binding/creation columns are immutable by grants and trigger. Lifecycle identity/mission columns are likewise immutable.

Add deferred constraint triggers on run insert/update and event/ledger insert. At commit they require the run head sequence/digest to match the maximum immutable event and every ledger row to bind its same immutable event sequence/digest. This permits the store's tentative first row inside one transaction but rejects direct head mutation, an event committed without its ledger or a ledger detached from its event.

Add append-only triggers to `run_retention_facts` that acquire the referenced `run_lifecycle` row lock, recompute the versioned mission-id/years/Unix-microseconds digest, bind the mission to the run and reject an observation older than the newest immutable fact. Add deferred triggers on fact insert and lifecycle insert/update requiring the latest fact and projection instant/digest/years/deadline to agree at commit. Prove direct fact-only, lifecycle-only, stale, digest-divergent and identity-changing writes all fail, including a multi-statement attempt that temporarily rewinds then restores the lifecycle projection around a stale insert.

- [ ] **Step 5: Implement the deletion migration**

```sql
CREATE TABLE orchestrator_run.execution_deletion_tombstones (
  subject_digest bytea PRIMARY KEY CHECK (octet_length(subject_digest) = 32),
  receipt_digest bytea NOT NULL CHECK (octet_length(receipt_digest) = 32),
  deleted_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (expires_at = deleted_at + interval '840 hours')
);
```

`P35D` is an exact elapsed duration, not a calendar-day operation. Every
tombstone computation and guard check uses `interval '840 hours'`, independent
of the session `TimeZone`; mission retention years remain a separate UTC
calendar operation. Fixed Rust/PostgreSQL vectors cover Europe/Paris spring
and autumn DST boundaries and rerun after poisoning the pooled session
timezone.

Implement the versioned length-framed digest with `pgcrypto.digest` and `int4send(octet_length(convert_to(value,'UTF8')))`. A guard-owned `SECURITY DEFINER VOLATILE lock_lineage(run_id)` with fixed safe `search_path` derives the subject from `current_setting('app.tenant_id')`, refuses unless `current_setting('transaction_isolation') = 'read committed'`, and calls `pg_advisory_xact_lock` on its first signed 64 bits. Grant execute only to app and retention; the `VOLATILE` anti-resurrection trigger invokes it before every tombstone lookup and applies the same isolation refusal. All live writers explicitly begin `READ COMMITTED`, call it as a distinct statement before any lineage read/insert, then lock `run_lifecycle` when present and `runs` last. In `READ COMMITTED`, the trigger's post-lock lookup obtains the fresh command snapshot required to see a deletion that committed while the lock waited; `REPEATABLE READ` and `SERIALIZABLE` live writes refuse rather than rely on stale-snapshot behavior. Hash collision may only over-serialize. Fixed Rust/PostgreSQL vectors bind the advisory key derivation.

A guard-owned `SECURITY DEFINER` function named `delete_lineage_with_tombstone`, under the same fixed `search_path`, acquires that advisory lock, locks `run_lifecycle` when present, inserts or compares the bound run/receipt/time tombstone and only then deletes the organization-scoped run cascade in the same transaction. It returns a closed boolean/outcome, never a row; a divergent receipt fails before deletion. The same guard owns the anti-resurrection trigger and a separate bounded expiration function. Revoke the deletion and expiration functions from public/app/restore; revoke `lock_lineage` from public/restore. Retention has no raw insert/select/update/delete on tombstones and no raw `DELETE` on runs or dependent tables; it receives `EXECUTE` only on `lock_lineage`, `delete_lineage_with_tombstone` and the expiration function. Restore gets content-free tombstone select plus cross-organization run select/delete policies only. The guard lock-only grant is exact: organization-scoped `SELECT` plus `UPDATE(retention_until)` on `run_lifecycle` solely so `SELECT ... FOR UPDATE` is legal, with a schema-owner trigger that refuses any actual lifecycle value change under the guard role. Guard also receives `SELECT(tenant_id, run_id)` on `runs` for the targeted predicate and organization-scoped `DELETE` on `runs`; every other run column and operation is denied. It otherwise gets only tombstone `SELECT`/`INSERT` and tombstone `DELETE` under a policy requiring `expires_at <= transaction_timestamp()`, never tombstone `UPDATE`. Its expiration function also requires bound injected time, order `(expires_at,subject_digest)` and batch size without `RETURNING`. No connection identity receives guard membership.

Enable and force RLS on `execution_deletion_tombstones`. Its policies permit only guard lookup/insert/expired-delete and restore's content-free scan; app/retention have no raw table policy or privilege. Test the closed lineage-deletion function and guard expiry separately from forbidden tombstone update/early delete, an attempted guard-role lifecycle update, direct retention `DELETE` against runs/children/tombstones and function escalation; prove that table ownership alone cannot bypass the policy boundary. Establish a live transaction snapshot before a concurrent deletion, then prove the next `READ COMMITTED` post-lock lookup observes the tombstone and refuses resurrection. Repeat through direct SQL. Poison the session default to `REPEATABLE READ`, and explicitly try both `REPEATABLE READ` and `SERIALIZABLE`; every guard function/trigger must refuse before mutation.

- [ ] **Step 6: Prove green and commit**

Run the schema test through the wrapper. The integration-test binary embeds the two migration files with `include_str!`, applies them through a private test-only helper and records version plus SHA-256 in `orchestrator_run_test_support.migration_ledger`. Reapplying unchanged bytes is a no-op; changing bytes behind a recorded version is an integrity failure. The library exports no migration runner or raw SQL hook. Then:

```bash
git add package.json crates/agent-orchestrator-run/migrations crates/agent-orchestrator-run/tests \
  verification/agent-orchestrator/with-postgres.sh
git commit -s -m "Add run-control PostgreSQL schema"
```

### Task 6: Own and scrub role-separated pools

**Files:** create `src/pool.rs`, `tests/postgres/pool.rs`; modify crate `src/lib.rs` and `tests/postgres.rs`.

**Interfaces:**
- Consumes: three URLs/options from Task 5.
- Produces: private app, retention and restore pool/transaction helpers.

- [ ] **Step 1: Write and run red pool tests**

Use `max_connections=1`. Poison the sole session with a session-level GUC/role; cover success, callback error, task cancellation and backend termination during scrub. The next borrower receives a clean/new connection, never poison. Execute the same bound prepared query before and after checkout to catch a stale SQLx client-cache entry after server discard. Inject cache-clear and discard failures separately and prove each connection is destroyed. Build caller options with statement and slow-statement logging deliberately enabled, install a serialized test capture for the `sqlx::query` target, exercise all three stores and assert that no `db.statement` or SQL text is emitted after the store takes ownership. Prove every wrong identity/store pair returns only `run-store.unavailable`.

- [ ] **Step 2: Construct private scrubbed pools**

```rust
let options = options.disable_statement_logging();

PgPoolOptions::new()
    .min_connections(0)
    .max_connections(limits.max_connections())
    .acquire_timeout(limits.acquire_timeout())
    .after_release(|connection, _| Box::pin(async move {
        if connection.clear_cached_statements().await.is_err() {
            return Ok(false);
        }

        Ok(sqlx::raw_sql("DISCARD ALL")
            .execute(connection)
            .await
            .is_ok())
    }))
    .connect_with(options)
    .await
```

Immediately probe session user membership, target role flags and absence of membership in the other connection roles. Close on mismatch. App/retention helpers issue `BEGIN ISOLATION LEVEL READ COMMITTED` before literal `SET LOCAL ROLE` and bound `set_config`; restore uses `BEGIN ISOLATION LEVEL REPEATABLE READ`, literal role only and accepts no organization.

`RunStore::connect` also constructs the embedded `ContractRegistry` once before returning. Registry construction failure closes the pool and maps to the constant internal error.

- [ ] **Step 3: Prove green and commit**

Run focused pool tests through the wrapper and Clippy, then commit `src/pool.rs`, exports and pool tests as `Enforce role-separated PostgreSQL pools`.

### Task 7: Canonicalize and atomically append complete-replay events

**Files:** create `src/event.rs`, `src/store.rs`, `tests/support/mod.rs`, `tests/postgres/append.rs`; modify crate `src/lib.rs` and `tests/postgres.rs`.

**Interfaces:**
- Consumes: existing pure-core parsers/replay and Task 6 app transaction.
- Produces: `RunStore::append_event` and `AppendOutcome`.

- [ ] **Step 1: Write the first red append E2E**

Append valid synthetic sequence 1 and 2 with a matching `P1Y` mission-retention fact, inspect via admin test connection and assert:

```rust
assert_eq!(first, AppendOutcome::Appended { sequence: 1 });
assert_eq!(second, AppendOutcome::Appended { sequence: 2 });
assert_eq!(serde_jcs::to_vec(&event_document).ok().as_deref(), Some(stored_bytes.as_slice()));
assert_eq!((run_head_sequence, event_count, ledger_count), (2, 2, 2));
```

Independently parse all stored JCS and replay through the pure core.
Independently replay the immutable retention observations and assert the joined
execution/lifecycle snapshot is byte-identical to the live projection.

- [ ] **Step 2: Add red refusals/idempotency tests**

Cover explicit organization mismatch, graph mismatch, stale event digest, broken predecessor, illegal phase, budget decrease/overflow, event over 65,536 bytes, exact replay and divergent event-id/sequence collision. Corrupt a different stored event through the admin test identity and prove that an otherwise exact duplicate refuses integrity failure rather than bypassing whole-chain replay. Every refusal compares all relation counts, the previous execution head and the previous lifecycle projection before/after. Also prove an unrecorded older retention observation refuses, an exact equal-instant observation is idempotent and an equal-instant divergent observation conflicts. After `append(E1,F1)` then `append(E2,F1)`, retrying the historical exact `E1,F1` is idempotent and leaves the E2 head unchanged. On a closed run, an exact event duplicate carrying an unrecorded new observation must not reinsert the event or mutate lifecycle. Task 10 adds cross-method retry proofs only after `LifecycleStore` exists.

- [ ] **Step 3: Run red**

```bash
verification/agent-orchestrator/with-postgres.sh -- \
  cargo test -p libre-ai-agent-orchestrator-run --test postgres append --locked -- --test-threads=1
```

Require compile failure because `append_event` is absent.

- [ ] **Step 4: Implement validated mechanical extraction**

After registry validation only, build:

```rust
struct ValidatedEvent {
    parsed: AuthorizedExecutionEvent,
    canonical_jcs: Vec<u8>,
    organization_id: OrganizationId,
    run_id: RunId,
    sequence: u64,
    event_id: String,
    event_digest: Digest,
    previous_event_digest: Option<Digest>,
    event_kind: &'static str,
    occurred_at: DateTime<Utc>,
    budget_delta: [u64; 7],
    budget_total: [u64; 7],
    references: Vec<ValidatedReference>,
}
```

Extract references only from `graphRef`, `authorizationRef`, `invocationRef`, `resultRef`, `decisionRequestRef`, `decisionResponseRef`, `lifecycleRef`, `executionTransferRef`; reject missing/malformed fields and never recursively collect arbitrary objects.
`budget_delta` and `budget_total` are mechanical schema projections from that
same validated event. The runtime crate never derives them, persists no current
budget state in `runs` and treats successful whole-chain pure replay—not the
ledger—as the semantic budget verdict.

- [ ] **Step 5: Implement one-transaction append**

Validate graph/candidate, compare explicit organization and mission-retention fact, derive its versioned internal digest, canonicalize and size-check; begin app transaction; acquire the common lineage advisory lock before tombstone inspection or tentative insert; insert tentative `runs` and `run_lifecycle` rows with `ON CONFLICT DO NOTHING`; lock `run_lifecycle` and then `runs`; classify exact event idempotency without returning; load all JCS ordered by sequence and revalidate/parse all. Replay the stored chain for an exact duplicate, or append the new candidate in memory and replay it. For a new event, require the replay state's existing public `sequence()` and `event_digest()` to equal the candidate mechanical head. An exact historical duplicate compares the replayed current head with both the maximum stored immutable event and `runs`, never with the historical candidate. Do not add a pure-core accessor or reproduce private state. For an exact event duplicate, return without writes when its exact retention observation is already recorded, even if a later fact is current; an unrecorded observation refuses and must use `LifecycleStore`. For a new event, reject stale/equal-instant divergent retention, append the fact if new, update `run_lifecycle` from run creation, insert event/ledger/references and update only the mechanical execution head. Commit once. Every value is bound. Neither projection phase, generation, current budget nor lifecycle policy is fed into execution replay.

- [ ] **Step 6: Inject database failures without production hooks**

Install temporary test-schema triggers that raise one fixed exception before event, ledger, reference and projection writes. Public API returns `run-store.internal`; no partial row survives. Remove each trigger via admin connection.

- [ ] **Step 7: Prove green and commit**

Run append and domain tests plus Clippy. Commit store/event/test files as `Persist canonical run events atomically`.

### Task 8: Prove concurrent serialization and forced RLS

**Files:** create `tests/postgres/rls.rs`; extend `tests/postgres/append.rs`; modify `tests/postgres.rs`.

**Interfaces:**
- Consumes: public append and transaction barrier.
- Produces: two-organization denial and one-successor concurrency evidence.

- [ ] **Step 1: Write red two-organization tests**

Create one run per organization. Through every public method, A observes no B data and cannot alter B. Direct SQL under app role with missing, empty, A and B context proves select/insert/update/delete. Public results never distinguish foreign row from absent.

Also attempt direct app-role mutation of the `runs` head and direct event insertion without its ledger. The deferred coherence triggers must reject both at commit without exposing constraint names through public errors. Prove retention has no raw `UPDATE` or `DELETE` privilege on `runs`, app and retention lack table-wide `UPDATE`, and lifecycle identity/mission columns cannot change. An authenticated lifecycle-only update must leave every `runs` column unchanged.

- [ ] **Step 2: Write red concurrency tests**

Release 16 Tokio tasks with a barrier against the same absent run: eight exact and eight divergent candidates. Repeat at an existing head. Assert one canonical successor, exact idempotency, divergent conflict, contiguous sequence and no orphan projection rows.

Add a separate barrier race between the first append of an absent lineage and
a retention transaction that invokes the already migrated SQL functions
`lock_lineage` then `delete_lineage_with_tombstone` directly; the public
`delete_run` method does not exist until Task 10. Repeat both lock-acquisition
orders, including a transaction whose first snapshot predates the deletion.
Final state must always contain the tombstone and no live lineage: append may
commit before the subsequent deletion or fail after deletion, but it may never
commit a live run behind an already committed tombstone. A direct app-role
first insert must take the same advisory lock through its anti-resurrection
trigger. Direct app/retention writes under `REPEATABLE READ` or `SERIALIZABLE`
must refuse before mutation.

- [ ] **Step 3: Fix only database serialization and prove green**

Run focused cases through the PostgreSQL wrapper. Fix the common first-row `run_lifecycle` lock order, `INSERT ... ON CONFLICT` behavior or transaction isolation only; do not add an application mutex or hidden retry. Run the entire `postgres` binary, then commit as `Serialize concurrent run event appends`.

### Task 9: Add cursor-bounded need-to-know queries

**Files:** modify `src/store.rs`; create `tests/postgres/query.rs`; modify `tests/postgres.rs`.

**Interfaces:**
- Consumes: Task 4 pages and Task 7 projections.
- Produces: run, event, ledger and reference query methods.

- [ ] **Step 1: Write red pagination and disclosure tests**

Insert 205 events and ledger rows plus multiple references sharing one sequence; assert complete pages without duplicates/omissions, including a page boundary inside that reference group. Exercise sweep candidates sharing a deadline. Reject foreign-scope and wrong-type cursors without existence leakage. Invalid cursor/limit fails before SQL, proven with a closed pool. Returned types expose only canonical bytes or the specific bounded projection; redacted `Debug` contains type and count/sequence only.

- [ ] **Step 2: Implement one-query keyset pages**

Use `limit + 1`. Event pages order and seek by `(sequence,event_digest)`,
ledger by unique `sequence`, references by the exact primary key suffix
`(sequence,kind,id,digest)`, and sweep by `(retention_until,run_id)`. For
example, event SQL is:

```sql
WHERE tenant_id = $1 AND run_id = $2
  AND ($3::bigint IS NULL OR (sequence, event_digest) > ($3, $4))
ORDER BY sequence, event_digest
LIMIT $5
```

Each query orders by the same complete tuple it encodes into its distinct
cursor type. Drop the extra row and encode only `meta.next_cursor`. No offset,
unbounded limit or N+1 reference query.
`get_run` performs one organization-scoped join from `runs` to
`run_lifecycle`; it never treats mutable lifecycle columns as execution replay
input.

- [ ] **Step 3: Prove query plans and commit**

Assert `EXPLAIN (FORMAT JSON)` uses the organization/run/sequence index on representative and maximum fixed benchmark fixtures. Run focused/full PostgreSQL tests, then commit as `Add bounded run-control queries`.

### Task 10: Implement retention, deletion and anti-resurrection

**Files:** create `src/lifecycle.rs`, `tests/postgres/lifecycle.rs`; modify crate `src/lib.rs`, `tests/domain.rs`, `tests/postgres.rs`.

**Interfaces:**
- Consumes: retention pool, SQL digest function and explicit time.
- Produces: `RetentionYears`, retention observation, explicit deletion, run sweep and bounded tombstone expiry. Task 11 owns the first restore implementation.

- [ ] **Step 1: Write red retention and digest vectors**

Accept exact `P1Y`..`P6Y`; reject `P0Y`, `P7Y`, day/month, a sub-microsecond observation instant and a fact whose mission differs from the event/run. Clamp 2028-02-29 plus one year to 2029-02-28. Validate `DeletionRegistryFact` ordering and bounds without accepting a caller-supplied completeness boolean. For synthetic retention observations, assert Rust and PostgreSQL equality of the versioned mission-id/years/Unix-microseconds digest. For three synthetic organization/run pairs, assert Rust and PostgreSQL deletion-subject digest equality and preimage separation of `("ab","c")` from `("a","bc")`. Add fixed Rust/PostgreSQL vectors for the automatic expiry receipt `SHA-256("libre-ai.execution-retention-expiry-receipt.v1\0" || subject_digest || i64be(retention_until_unix_microseconds))`.

- [ ] **Step 2: Write red lifecycle transactions**

Cover deletion, same-receipt idempotency, divergent receipt, exact elapsed `P35D`, app invisibility, active-tombstone recreation refusal with generic error, early expiry refusal, and rollback after tombstone insertion. Fixed Rust/PostgreSQL expiry vectors straddle Europe/Paris spring-forward and fall-back transitions; repeat them after setting a poisoned session timezone and prove expiry remains exactly 840 hours. Direct SQL as retention must fail to delete `runs`, events, projections or tombstones; the public deletion method succeeds only through `delete_lineage_with_tombstone`. Race public `delete_run` against the first append of an absent lineage in both lock-acquisition orders and require a tombstone with no live lineage. Prove `apply_mission_retention` binds the stored mission, records one immutable observation, recomputes from creation and succeeds after the last execution event without changing any `runs` column. After `append(E,F1)` then `apply_mission_retention(F2)`, retrying exact `E,F1` remains idempotent without reverting F2 because its exact retention observation is already recorded. On a closed run, an exact event duplicate carrying an unrecorded new observation must not reinsert the event or mutate lifecycle; it refuses, while the same authenticated observation succeeds through `LifecycleStore`. Prove stale observation refusal against the newest immutable fact even if one transaction temporarily rewinds the projection, exact observation idempotency and equal-instant divergence refusal. Rebuild execution first from `run_events`, derive and verify creation, then rebuild lifecycle from `run_retention_facts`; compare canonical bytes, mechanical projections and public replay head byte-exactly without encoding private pure state. For run sweep, select an expired key then concurrently extend retention through that method; the common advisory lock must be acquired first, followed by the lifecycle-row lock and under-lock recheck, so the extension is preserved without deadlock. Prove its tombstone receipt equals the deterministic expiry vector. For tombstone expiry, insert 205 expired and unexpired synthetic rows, process batches of 100 in `(expires_at,subject_digest)` order, expose counts only, and prove neither injected future time nor a direct DELETE can remove a row before database time reaches exact `P35D`.

- [ ] **Step 3: Implement bounded retention/deletion**

`RetentionYears` stores `NonZeroU8` 1..6. `MissionRetentionFact` binds mission, duration and observation time; both append and lifecycle update compare it with stored/event mission, derive the internal observation digest and compute from run creation. Every live method begins `READ COMMITTED`, calls `lock_lineage` before any lineage read, then locks `run_lifecycle`, rejects time rollback/equal-instant divergence, appends the fact if new and updates only lifecycle columns. `DeletionCommand` validates organization/run, receipt digest and UTC deletion time. `delete_run` sets the retention role/context, calls `lock_lineage` as a distinct statement, and invokes `delete_lineage_with_tombstone`; the guard-owned function rechecks isolation, reacquires the advisory lock reentrantly, recomputes the subject, locks lifecycle after advisory, inserts/compares the caller-authenticated receipt and deletes the run cascade atomically. Run sweep selects `(run_id,retention_until)` keys, then for each candidate calls `lock_lineage` before locking and rechecking `run_lifecycle`, derives the versioned expiry receipt from subject digest plus retention deadline, and invokes the same closed function. `expire_tombstones` selects at most `TombstoneExpiryBatchSize` rows through `(expires_at,subject_digest)`, requires both injected and PostgreSQL time at/after expiry, deletes without `RETURNING` and returns only an aggregate count. Retention never directly updates or deletes `runs`.

- [ ] **Step 4: Keep restore behavior absent until its E2E is red**

Implement only the validated `DeletionRegistryFact`, `RestoreBatchSize` and
closed result types already covered by domain tests. Do not implement
`RestoreStore::replay_tombstones` or `suppressed_lineage_count` in Task 10;
Task 11 must first fail to compile against their absence.

- [ ] **Step 5: Prove green and commit**

Run domain/lifecycle/full PostgreSQL tests plus Clippy. Commit as `Enforce run retention and deletion barriers`; no restore behavior exists in that commit.

### Task 11: Prove tombstone-first restore end to end

**Files:** create `src/restore.rs`, `tests/postgres/e2e.rs`; modify `src/lib.rs` and `tests/postgres.rs`.

**Interfaces:**
- Consumes: all three stores and locked synthetic graph/event fixtures.
- Produces: persistence/replay/delete/backup-restore/non-resurrection proof.

- [ ] **Step 1: Write the red backup/restore scenario**

Database A holds a complete A run and unrelated B run. Delete A and retain its tombstone. Materialize database B with execution rows deliberately restored before tombstones, then restore the independently protected tombstone registry plus its literal count/digest/coverage fact. Assert count is 1 before replay, 0 after bounded replay, A absent and B byte-identical.

Add the negative recovery vector: take an execution and tombstone snapshot before deleting A, then present that stale registry after the deletion writer fence. Even though the local join reports zero, count/digest coverage verification must refuse pre-open. Also refuse an execution snapshot older than `P35D`, a missing manifest, wrong count, wrong digest and coverage ending before the fence.

Run the focused target now and require compile failure because
`RestoreStore::replay_tombstones` and `suppressed_lineage_count` do not exist.

- [ ] **Step 2: Finish all red restore/security vectors**

Return `RestoreOutcome { processed, deleted, remaining }` only after registry verification; `remaining == 0` is necessary but a future caller still needs authenticated registry/writer-fence authority before opening. No method starts traffic. An expired tombstone is ignored only when injected time is after expiry, the execution snapshot is within `P35D` and the fixture proves the backup ceiling elapsed.

Before implementation, add failures for registry time-order violations,
cross-organization app/retention use, caller cursor injection, partial-page
escape, rollback before final count and a writer-fence that omits tombstone
expiry. Rerun and require red.

- [ ] **Step 3: Run red, implement the missing behavior and prove green**

```bash
verification/agent-orchestrator/with-postgres.sh -- \
  cargo test -p libre-ai-agent-orchestrator-run --test postgres restore --locked -- --test-threads=1
verification/agent-orchestrator/with-postgres.sh -- \
  cargo test -p libre-ai-agent-orchestrator-run --test postgres --locked -- --test-threads=1
```

Implement restore only after both red steps. Restore accepts no organization.
Before every replay/count operation, validate
`snapshot_at <= writers_fenced_at <= observed_at`, `coverage_through >=
writers_fenced_at` and `observed_at - snapshot_at <= P35D`. One
repeatable-read transaction scans every locally restored tombstone in internal
pages ordered by subject digest and recomputes the registry digest as SHA-256
of `libre-ai.execution-deletion-registry.v1\0`, big-endian `u64` row count,
then each row's fixed 32-byte subject/receipt digests and big-endian `i64`
Unix-microsecond deletion/expiry instants. Compare count and digest before
scanning execution rows. The same transaction loops over restored
`(tenant_id,run_id)` keys in batches of 1..100, computes SQL subject digests,
performs one primary-key B-tree tombstone lookup per run, deletes matches and
counts remaining suppressed lineages before its single commit. It must not
build or request a hash table of the complete tombstone registry. The caller
cannot stop a partial page or supply a cursor.
`suppressed_lineage_count` repeats the registry proof in its own
repeatable-read transaction. The package authenticates neither registry fact
nor writer fence and exposes no opening boolean.

Require the initial runs to be red, then green without adding service/startup
code. Run the whole PostgreSQL target and commit as `Prove tombstone-first
restore replay`.

### Task 12: Add performance, compatibility and CI gates

**Files:** create benchmark, `verification/agent-orchestrator/benchmark-memory.sh`, compatibility snapshots/test; modify `src/restore.rs`, `tests/postgres/e2e.rs`, `.github/workflows/ci.yml`, `tools/quality/rust-coverage-gate.test.ts`, `package.json`.

**Interfaces:**
- Consumes: complete store.
- Produces: exact 0.1.0 surface, reproducible scaling and mandatory real-PostgreSQL CI.

- [ ] **Step 1: Write red compatibility and CI assertions**

Snapshot every public re-export and five error codes. Extend the Bun coverage test to require test/coverage commands are wrapped by `with-postgres.sh --`, PostgreSQL >=14 is checked, workspace/all-features are used and 87/90 thresholds remain. Run focused tests and require failure against the old workflow/missing snapshots.

- [ ] **Step 2: Implement the benchmark**

Use fixed chain sizes `[1,32,256,2048,8192]`, at least 30 samples after warmup and `std::time::Instant`. The benchmark accepts exactly one fixture size per process. On the required Linux CI runner, `benchmark-memory.sh` launches each process through `/usr/bin/time -v`, parses `Maximum resident set size` as bytes and fails if GNU time or the field is unavailable. It emits:

```text
events,total_jcs_bytes,append_p50_us,append_p95_us,load_p50_us,page_p95_us,peak_rss_bytes
```

RSS is observational, not the bounded-memory gate. Extract one private page-loop function used directly by `RestoreStore`; it returns a private `struct ScanStats { processed_rows, page_count, max_buffered_rows }`. Each fetch is immediately wrapped in a private single-page lease whose owned row type is not `Clone`; the consumer receives borrows only, the lease must drop before the next fetch, and no owning row or page can escape the loop. Before consuming any page, that production loop returns `IntegrityFailure` when `page.len() > batch_size`; production consumes `processed_rows` for its completeness result but exposes no diagnostic field, hook or feature. A `#[cfg(test)]` module colocated in `src/restore.rs` calls that same private function with synthetic page fetch/consume closures and non-Clone, drop-counted rows. First require red then green for an oversized returned page being refused and for every fetch after the first observing zero live rows from the prior page. For fixed batch 100, require `max_buffered_rows <= batch_size`, identical maxima across total sizes 256, 2,048 and 8,192, and multiple pages for the two larger fixtures. `max_buffered_rows` proves only the SQL/page-size bound; the drop-counted single-owner fixture plus the no-escape type shape proves release before the next page. A real-PostgreSQL E2E restores 205 tombstones and runs successfully with batch 100; an accidentally unbounded SQL page would exceed the invariant and make that test fail. The external per-process RSS series remains complementary evidence against allocations outside the owned row page.

Exit non-zero on fixture/replay/query failure. Record statement counts in integration tests; set no hardware-dependent latency threshold.

Add a separate pre-open series over fixed tombstone/run pairs `[(1,1),(32,256),(256,2048),(2048,8192)]` and print `tombstones,runs,reconcile_p50_us,reconcile_p95_us,peak_rss_bytes`. The external Cargo benchmark proves complete processing and the wrapper measures RSS; the colocated unit test is the blocking structural batch-bound proof. The declared lookup/reconciliation decision bound is
`O(tombstones + runs * log(tombstones))`: scan and digest the registry once,
then perform one indexed subject-digest lookup per restored run. Physical
cascade deletion adds work linear in the actually deleted dependent rows, so
the honest end-to-end bound is
`O(tombstones + runs * log(tombstones) + purged_rows)`. Assert
`EXPLAIN (FORMAT JSON)` uses the tombstone primary-key B-tree and refuses a
hash join, hash aggregate or any whole-registry materialization. The benchmark
reports the measured curve; it does not by itself prove the complexity class.

- [ ] **Step 3: Wire CI through local PostgreSQL**

Use:

```yaml
- run: cargo fmt --all --check
- run: cargo clippy --workspace --all-targets --all-features -- -D warnings
- run: RUSTDOCFLAGS="-D warnings" cargo doc --locked --workspace --all-features --no-deps
- run: verification/agent-orchestrator/with-postgres.sh -- cargo test --locked --workspace --all-features
- name: Structural memory and RSS evidence
  run: verification/agent-orchestrator/with-postgres.sh -- verification/agent-orchestrator/benchmark-memory.sh
- name: Rust coverage (blocking)
  run: |
    verification/agent-orchestrator/with-postgres.sh -- \
      cargo llvm-cov --locked --workspace --all-features --lcov \
      --output-path coverage/lcov.info \
      --fail-under-lines 87 --fail-under-functions 90
    cargo llvm-cov report --summary-only | tee -a "$GITHUB_STEP_SUMMARY"
```

Use runner-provided PostgreSQL binaries; do not download a container or package during the job.

- [ ] **Step 4: Run all gates and commit**

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
RUSTDOCFLAGS="-D warnings" cargo doc --locked --workspace --all-features --no-deps
verification/agent-orchestrator/with-postgres.sh -- cargo test --locked --workspace --all-features
cargo deny check --show-stats bans licenses sources
bun run check
verification/agent-orchestrator/with-postgres.sh -- \
  verification/agent-orchestrator/benchmark-memory.sh
```

Require green commands and complete benchmark rows. Commit as `Gate run-store compatibility and PostgreSQL proof`.

### Task 13: Document the bounded capability and rollback

**Files:** modify `README.md`, `docs/apps/orchestrator.md`, `project.v1.yaml`, `.github/workflows/ci.yml`, run-capability test; create `verification/agent-orchestrator/review-evidence.test.ts`.

**Interfaces:**
- Consumes: measured behavior and exact Governance SHA.
- Produces: honest status and compile-checked example.

- [ ] **Step 1: Write/red-run documentation assertions**

Require all three docs to name ADR-0039/D45, exact Governance SHA, new crate, canonical JCS, forced RLS, the independently protected deletion-registry fact, tombstone-first restore and the `O(n)` production block. Reject “production ready”, “executes missions” and “LangGraph checkpoint”. Add red synthetic commit-graph fixtures for the evidence gate: a `pending` review criterion with no evidence or dossier passes; `accepted` fails unless its schema-valid `evidence.reference` names the full implementation SHA `I` and exact dossier, exactly one commit `E` transitions that criterion to accepted, `parent(E) == I`, `E` changes only its exact review directory plus the status scalar and evidence mapping CST ranges, all four verdicts bind `I`, and every captured command has tracked normalized output whose digest verifies. Negative fixtures must combine a legitimate transition with (a) another project-card criterion/exposure change, (b) an extra source-file change, and (c) altered command-output bytes. Run the Bun tests and require failure against current docs/missing gate.

- [ ] **Step 2: Update documentation and card**

Add a compile-checked example that constructs `PgConnectOptions` outside the crate, creates bounded pool limits, appends a synthetic content-free event and reads a page. State that the library cannot load secrets, authorize, execute or serve.

Rollback text: stop consumers; pin/revert code; retain applied forward migrations and canonical event/tombstone evidence; never destructive-down-migrate or rewrite events. Add phase `run-control-persistence` with one `immutable-role-review` criterion at schema-valid `status: pending`, without `evidence`, and a note that implementation exists but independent review is not yet accepted. Explicitly leave whole WP-G3-O01 incomplete. Do not alter Phase 4A accepted evidence, maturity or exposure.

Implement the generic evidence gate before freezing the candidate. It reads the
implementation object named by the project card and resolves the unique commit
that changed its criterion from pending to accepted, rather than assuming
`HEAD`, so later authorized work does not invalidate historical proof. It
rejects abbreviated/missing/non-ancestor SHAs, merges, a non-direct parent,
any diff outside the exact dossier directory and the two authorized leaves in
`project.v1.yaml`, absent verdicts or mismatched command digests. Using the YAML
CST ranges, it locates the unique phase id `run-control-persistence` and its
unique `immutable-role-review` criterion. It permits only that criterion's
scalar transition from `pending` to `accepted` and insertion of the
schema-valid adjacent `evidence` mapping containing the review date and a
`reference` that names the exact dossier plus full `I`; the file must be byte-for-byte unchanged outside the status scalar and evidence mapping CST ranges.
It also parses both documents, removes the inserted evidence mapping
and restores `pending` in the accepted tree, then requires deep equality, so
aliases or duplicate keys cannot disguise a second change. Set the CI checkout
to `fetch-depth: 0` and add an assertion for it; the gate refuses rather than
silently passing when the named Git objects or history are unavailable.

- [ ] **Step 3: Prove green and commit**

Run the documentation assertion, `bun run check` and full PostgreSQL workspace tests. Commit as `Document bounded run-control persistence`.

### Task 14: Build the immutable review dossier

**Files:** create `docs/reviews/orchestrator-run-control-persistence/$REVIEW_SHORT/{benchmark.csv,architecture.md,security.md,privacy.md,completeness.md,integration.md,commands/manifest.json,commands/*.txt}` after computing full `REVIEW_SHA="$(git rev-parse HEAD)"` and `REVIEW_SHORT="$(git rev-parse --short=7 HEAD)"`; modify only the new project-card criterion after approval.

**Interfaces:**
- Consumes: clean immutable implementation candidate.
- Produces: evidence for ADR-0011 D4 owner stop.

- [ ] **Step 1: Freeze candidate and rerun every gate**

Run Task 12 commands, require clean status, then record full implementation SHA `I`, parents, tree, message and a boolean DCO-valid result without copying author or committer identity into evidence. Capture outputs in a validated temporary directory outside the worktree; no untracked dossier may dirty the candidate during review. Normalize each combined stdout/stderr stream to UTF-8, LF endings and no ANSI escapes, reject secrets, personal data and absolute machine paths, then retain those exact bytes as `commands/<stable-id>.txt`. `commands/manifest.json` is canonical JCS and records `I` and, for each stable id, the exact non-secret argv array, exit code zero, relative output path and lowercase SHA-256 of the tracked normalized bytes. The evidence gate rehashes every file, rejects missing/unreferenced outputs and requires each review to cite the stable command ids it consumed. The eventual dossier directory uses seven SHA characters; every verdict and the manifest name full `I`, while benchmark CSV and normalized command bytes are bound indirectly by their manifest path and SHA-256 and are never mutated merely to inject `I`. The four review verdicts bind `I`, never the later evidence commit.

- [ ] **Step 2: Run four independent review roles**

Architecture/performance proves no policy duplication or private pure-state projection, canonical revalidation including the idempotent path, constant append statement count, honest append `O(n)`, lookup/reconciliation `O(tombstones + runs * log(tombstones))`, total restore `O(tombstones + runs * log(tombstones) + purged_rows)`, the single-page lease/no-escape memory proof, indexed per-run lookup, no checkpoint/service and the production block. Security attacks SQL injection, wrong roles, RLS/GUC/pool cancellation and prepared-cache reset, forced statement-log disabling, absent-lineage races, error leakage, immutable rows, direct-retention deletion bypass, exact guard privilege matrix, timezone-independent exact tombstone expiry, stale/incomplete deletion registry and restore escalation. Privacy/sovereignty proves synthetic fixtures, no raw content/PII/logging, content-free tombstones, authenticated independent registry precondition, retention/order, licenses and EU target. Completeness reproduces exact work-package file authority, O02/H01 dependency gates, empty migration, concurrency, replay, pagination, deletion, stale-snapshot refusal, verified restore, compatibility, coverage and rollback.

- [ ] **Step 3: Remediate without carrying stale approval**

Any Blocking/Major finding gets a red regression, minimal fix and full rerun. A changed candidate invalidates all old approvals; compute a new SHA and repeat all roles. Fix Minor findings unless the dossier proves them outside the authorized scope.

- [ ] **Step 4: Commit accepted evidence and status**

After all roles approve the same implementation SHA `I`, add only the exact dossier directory, locate phase `run-control-persistence` and change only its `immutable-role-review` criterion from `pending` to `accepted`, then insert adjacent schema-valid `evidence: { date, reference }` whose reference names the dossier and full `I`; keep WP-G3-O01/service unclaimed. Commit once as `Record run-control persistence review` and define its resulting full SHA as `E`. Require `parent(E) == I` and one parent. Run the pre-existing evidence gate; it resolves `E` from the unique status transition and must prove that `E` changes only the dossier plus the status scalar and evidence mapping CST ranges in `project.v1.yaml`, every other byte at `E` is identical to `I`, all verdicts bind `I`, and every tracked normalized command output rehashes to its manifest digest. Then rerun formatting, Clippy, PostgreSQL workspace tests, Bun check and clean-status proof. Any other change creates a new implementation candidate and invalidates every verdict.

### Task 15: Open the PR and stop at the bootstrap hard gate

**Files:** no implementation edit unless CI yields a reproduced defect.

**Interfaces:**
- Consumes: reviewed implementation SHA, evidence commit and green gates.
- Produces: owner-controlled merge candidate.

- [ ] **Step 1: Push exact branch, create PR and verify head/CI**

The PR names ADR-0039/D45, reviewed implementation SHA `I`, its direct evidence child `E`, commands, `O(n)` limitation and all unopened capabilities. Push only `refs/heads/feat/orchestrator-run-control-persistence`. Resolve `orchestrator_pr="$(gh pr view --json number --jq .number)"`; verify `headRefOid == E`, merge state and `gh pr checks "$orchestrator_pr" --watch`.

- [ ] **Step 2: Restate and stop at ADR-0011 D4**

Present inline:

```text
This merge establishes the first layer-2 PostgreSQL persistence barrier:
canonical events, forced RLS, separated lifecycle/restore roles and
tombstone-first recovery are proven. It still cannot authorize, execute,
serve or deploy a run, and O(n) replay explicitly blocks production use.
ADR-0011 D4 requires the owner's bootstrap pronouncement naming I and E before merge.
```

Do not treat design, plan, Governance merge or PR creation approval as this pronouncement. The owner statement must name both full SHAs `I` and `E`.

- [ ] **Step 3: Merge only after explicit pronouncement and verify**

Use only a merge commit that preserves the reviewed objects (`gh pr merge --merge`); squash and rebase merges are forbidden. Fetch `origin/main`, require both `git merge-base --is-ancestor "$I" origin/main` and `git merge-base --is-ancestor "$E" origin/main`, prove the merge tree contains reviewed implementation bytes plus the evidence-only commit, then wait for post-merge CI. Create/verify an annotated evidence tag only if the established Phase 4A pattern requires it.

- [ ] **Step 4: Clean only owned state**

Remove completed Governance/Orchestrator worktrees and branches only after remote main/tag proof. Preserve every unrelated dirty worktree, cache and user branch. Report exact main SHAs, PRs, checks, tag if any and all still-closed capabilities.
