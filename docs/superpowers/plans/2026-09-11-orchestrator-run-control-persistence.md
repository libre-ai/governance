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
- The root `libre-ai-agent-orchestrator` crate and its public API remain unchanged; the new crate consumes its existing parsing and whole-chain replay functions.
- Contracts remains sole wire/retention authority. Store RFC 8785 event bytes as execution replay authority and bounded immutable retention observations as local lifecycle replay evidence; neither relational projection nor the observation journal selects policy.
- Whole-chain append replay is deliberately `O(n)`. No production service may consume it until separately authorized incremental state or an authoritative measured bound closes that risk.
- The library reads no environment, file, process state, wall clock or secret. Its only I/O is PostgreSQL through private pools built from caller-provided `PgConnectOptions`.
- Pin every dependency exactly. SQLx uses only `runtime-tokio`, `tls-rustls-ring-native-roots`, `postgres`, `json` and `chrono`; no macros, embedded migrations, SQLite or MySQL.
- App, retention and restore use separate connection identities and pools. Every returned connection executes `DISCARD ALL`; scrub failure discards it.
- Every organization transaction uses literal `SET LOCAL ROLE` plus `set_config('app.tenant_id', $1, true)`. Every organization table has `ENABLE` and `FORCE ROW LEVEL SECURITY`.
- `libre_ai_app`, `libre_ai_retention`, `libre_ai_restore` and `libre_ai_tombstone_guard` are `NOLOGIN NOSUPERUSER NOBYPASSRLS`. Product migrations assert roles exist but never create them.
- Restore is pre-open-only and internally batch-bounded; one public reconciliation call processes every page inside one repeatable-read transaction. It has no append, export, update, schema or application capability.
- Restore additionally requires an authenticated deletion-registry fact whose locally recomputed row count/digest match, whose coverage reaches an authoritative fence over every run/tombstone mutator including retention expiry, and whose execution snapshot is no older than `P35D`; zero residual lineages alone is never an opening proof.
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
- Keep `docs/transformation/work-packages.v1.json` byte-identical: existing `WP-G3-O01` alone owns `crates/agent-orchestrator-run/**`.

### Orchestrator

- Modify `Cargo.toml`, `Cargo.lock`, `package.json`, `bun.lock` and `.github/workflows/ci.yml`.
- Create `crates/agent-orchestrator-run/Cargo.toml`.
- Create `src/{lib,error,ids,cursor,pool,event,store,lifecycle}.rs` in that crate.
- Create `migrations/0001_run_control.sql` and `0002_deletion_barrier.sql` in that crate.
- Create `tests/domain.rs`, one serial `tests/postgres.rs`, focused `tests/postgres/*.rs`, and `tests/support/*.rs`.
- Create `benches/postgres_persistence.rs` and `tests/compat/{public_surface,stable_codes}.snapshot` plus `tests/compat_surface.rs`.
- Create `verification/agent-orchestrator/check-run-capabilities.ts`, `run-capability-boundary.test.ts` and `with-postgres.sh`.
- Modify `README.md`, `docs/apps/orchestrator.md`, `project.v1.yaml` and `tools/quality/rust-coverage-gate.test.ts`.
- Create `docs/reviews/orchestrator-run-control-persistence/$REVIEW_SHA/` only after computing the seven-character immutable implementation SHA.

## Locked branch interfaces

```rust
pub struct OrganizationId(String);
pub struct RunId(String);
pub struct Digest([u8; 32]);
pub struct PoolLimits { max_connections: NonZeroU32, acquire_timeout: Duration }

pub enum StoreError { InvalidInput, Conflict, Unavailable, IntegrityFailure, Internal }
pub enum AppendOutcome { Appended { sequence: u64 }, Idempotent { sequence: u64 } }
pub struct EventPageRequest { cursor: Option<String>, limit: u16 }
pub struct RunPageRequest { cursor: Option<String>, limit: u16 }
pub struct RestoreBatchSize(NonZeroU16);
pub struct PageMeta { pub next_cursor: Option<String> }
pub struct Page<T> { pub data: Vec<T>, pub meta: PageMeta }

pub struct RunSnapshot { run_id: RunId, head_sequence: u64, phase: RunPhase, retention_until: DateTime<Utc> }
pub struct StoredEvent { sequence: u64, canonical_jcs: Vec<u8> }
pub struct BudgetMovement { sequence: u64, delta: [u64; 7], total: [u64; 7] }
pub struct AttestationReference { sequence: u64, kind: ReferenceKind, id: String, digest: Digest, media_type: String }
pub struct RetentionYears(NonZeroU8);
pub struct MissionRetentionFact { mission_id: String, retention: RetentionYears, observed_at: DateTime<Utc> }
pub struct DeletionRegistryFact { execution_snapshot_at: DateTime<Utc>, writers_fenced_at: DateTime<Utc>, coverage_through: DateTime<Utc>, tombstone_count: u64, tombstone_set_digest: Digest }
pub struct DeletionCommand { organization_id: OrganizationId, run_id: RunId, receipt_digest: Digest, deleted_at: DateTime<Utc> }
pub struct DeletionOutcome { pub deleted: bool }
pub struct SweepOutcome { pub inspected: u16, pub deleted: u16, pub meta: PageMeta }
pub struct RestoreOutcome { pub processed: u64, pub deleted: u64, pub remaining: u64 }

pub enum RunPhase { Ready, Authorized, InvocationStarted, DecisionRequested, EffectReserved, EffectStarted, EffectTerminal, Sealed, Transferred, Blocked, Completed, Quarantined }
pub enum ReferenceKind { Graph, Authorization, Invocation, Result, DecisionRequest, DecisionResponse, Lifecycle, ExecutionTransfer }

pub struct RunStore { pool: PgPool, registry: ContractRegistry }
pub struct LifecycleStore { pool: PgPool }
pub struct RestoreStore { pool: PgPool }

impl RunStore {
    pub async fn connect(options: PgConnectOptions, limits: PoolLimits) -> Result<Self, StoreError>;
    pub async fn append_event(&self, organization_id: &OrganizationId, graph_document: &Value, event_document: &Value, mission_retention: &MissionRetentionFact, observed_at: DateTime<Utc>) -> Result<AppendOutcome, StoreError>;
    pub async fn get_run(&self, organization_id: &OrganizationId, run_id: &RunId) -> Result<Option<RunSnapshot>, StoreError>;
    pub async fn list_events(&self, organization_id: &OrganizationId, run_id: &RunId, request: EventPageRequest) -> Result<Page<StoredEvent>, StoreError>;
    pub async fn get_budget_ledger(&self, organization_id: &OrganizationId, run_id: &RunId, request: EventPageRequest) -> Result<Page<BudgetMovement>, StoreError>;
    pub async fn get_attestation_refs(&self, organization_id: &OrganizationId, run_id: &RunId, request: EventPageRequest) -> Result<Page<AttestationReference>, StoreError>;
}

impl LifecycleStore {
    pub async fn connect(options: PgConnectOptions, limits: PoolLimits) -> Result<Self, StoreError>;
    pub async fn apply_mission_retention(&self, organization_id: &OrganizationId, run_id: &RunId, fact: &MissionRetentionFact) -> Result<(), StoreError>;
    pub async fn delete_run(&self, command: &DeletionCommand) -> Result<DeletionOutcome, StoreError>;
    pub async fn sweep_expired(&self, organization_id: &OrganizationId, observed_at: DateTime<Utc>, request: RunPageRequest) -> Result<SweepOutcome, StoreError>;
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
- Verify unchanged: `docs/transformation/work-packages.v1.json`

**Interfaces:**
- Consumes: approved design and locked `WP-G3-O01`.
- Produces: ADR-0039/D45 persistence authority; no runtime authority before merge.

- [ ] **Step 1: Record the work-package digest and write the failing gate**

Run `sha256sum docs/transformation/work-packages.v1.json`, then create a Bun test with:

```ts
expect(hasExpectedAdrTitle(adr)).toBeTrue();
expect(hasSingleD45Entry(register)).toBeTrue();
expect(register).toContain("| D45 | Run-control persistence is isolated and non-executing");
expect(design).toContain("authority ADR-0039/D45");
const wp = plan.packages.find((entry) => entry.id === "WP-G3-O01");
expect(wp?.writePaths).toEqual(["crates/agent-orchestrator-run/**"]);
expect(wp?.definitionStatus).toBe("locked");
expect(findRunControlOwners(plan).map((entry) => entry.id)).toEqual(["WP-G3-O01"]);
```

The owner finder uses `Bun.Glob`, explicit child-prefix detection and a fail-closed static-prefix check for globs that can descend into the target. The canonical root, recursive parent `crates/**`, wildcard patterns such as `crates/agent-*/Cargo.toml`, `crates/*/src/**` and `**/*.rs`, global `**` and every child path therefore overlap. Synthetic negative cases must identify each competing owner while excluding a sibling crate.

Run `bun test tools/quality/check-orchestrator-run-control-persistence-authority.test.ts` and require failure because ADR-0039/D45 are absent.

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

Set the design status to `approved for implementation — owner, 2026-09-11; authority ADR-0039/D45`. Run the focused test, `bun run check`, and recheck the work-package digest. Then:

```bash
git add docs/adr/0039-orchestrator-run-control-persistence.md docs/decisions/DECISION-REGISTER.md \
  docs/superpowers/specs/2026-09-11-orchestrator-run-control-persistence-design.md \
  tools/quality/check-orchestrator-run-control-persistence-authority.test.ts
git commit -s -m "Authorize orchestrator run-control persistence"
```

### Task 2: Review and merge the Governance authority

**Files:** review the immutable Task 1 commit; create repository-standard evidence only if required.

**Interfaces:**
- Consumes: green Governance authoring commit.
- Produces: merged ADR-0039/D45 SHA, required by Task 3.

- [ ] **Step 1: Run role-separated doctrine review**

Review exact authority uniqueness, unchanged pure core, persistence-only capability, unchanged/unique `WP-G3-O01`, `O(n)` production block, least-privilege restore and absent framework checkpoint. Any Blocking/Major finding invalidates the SHA and returns to Task 1 with a regression assertion.

- [ ] **Step 2: Push, open the Governance PR and verify CI**

Push only the design branch and create the PR with `bun run check` evidence. Resolve its number with `governance_pr="$(gh pr view --json number --jq .number)"`, then run `gh pr checks "$governance_pr" --watch`. Require all checks green on the reviewed head.

- [ ] **Step 3: Stop for the doctrine owner signature, then verify merge**

Restate that merge creates persistence authority but no service/effect/deployment. Obtain explicit owner pronouncement. Only then merge without force and verify ADR-0039/D45 from fetched `origin/main`; record the full Governance SHA.

### Task 3: Create the isolated Orchestrator workspace boundary

**Files:**
- Modify: `Cargo.toml`, `Cargo.lock`, `package.json`, `bun.lock`
- Create: `crates/agent-orchestrator-run/Cargo.toml`, `crates/agent-orchestrator-run/src/lib.rs`
- Create: `verification/agent-orchestrator/check-run-capabilities.ts`
- Create: `verification/agent-orchestrator/run-capability-boundary.test.ts`

**Interfaces:**
- Consumes: merged Governance SHA and unchanged root crate 0.2.0.
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

- [ ] **Step 2: Write and run the red capability test**

```ts
expect(await checkRunCapabilityBoundary()).toEqual([]);
expect(runManifestFailures("sqlx = \"0.9\"")).toContain("sqlx-not-exact");
expect(runManifestFailures("sqlx = { version = \"=0.9.0\", default-features = true }")).toContain("sqlx-default-features-enabled");
expect(runSourceFailures("src/lib.rs", "std::fs::read(\"x\")")).toContain("capability-forbidden:src/lib.rs:filesystem");
expect(runSourceFailures("src/lib.rs", "std::env::var(\"DATABASE_URL\")")).toContain("capability-forbidden:src/lib.rs:environment");
```

The scanner covers only production `src/**/*.rs` and forbids filesystem, process, arbitrary network, environment, wall-clock constructors, logs/tracing, HTTP/RPC, unsafe/FFI and framework names. Run the test and require failure because the crate/checker are absent.

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
git add Cargo.toml Cargo.lock package.json bun.lock crates/agent-orchestrator-run \
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

Also cover organization length/case, malformed URNs, noncanonical digests, page limits 0/101, restore batch sizes 0/101, pool bounds and every invalid ordering/bound in `DeletionRegistryFact`. Cursor vectors use eight big-endian sequence bytes plus 32 digest bytes, Base64 URL-safe without padding; reject wrong length/alphabet/padding/sequence zero/noncanonical re-encoding.

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

Assert exactly seven tables; `relrowsecurity && relforcerowsecurity` for the six organization tables and for the content-free tombstone table; every role has login/superuser/bypass flags false; and grants match the design. Include `run_retention_facts` and `run_lifecycle` in exact RLS, trigger and privilege assertions. Also prove migration refusal when a role or `pgcrypto` is absent.

- [ ] **Step 2: Build the local PostgreSQL wrapper**

Use a validated `mktemp` directory and cleanup trap:

```bash
set -euo pipefail
pg_bin="$(pg_config --bindir)"
major="$($pg_bin/postgres --version | sed -E 's/.* ([0-9]+).*/\1/')"
test "$major" -ge 14
cluster="$(mktemp -d)"
tmp_root="${TMPDIR%/}"
case "$cluster" in "$tmp_root"/*) ;; *) exit 1 ;; esac
socket="$cluster/socket"
mkdir "$socket"
trap '"$pg_bin/pg_ctl" -D "$cluster/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$cluster"' EXIT
"$pg_bin/initdb" -D "$cluster/data" --auth=trust --no-locale >/dev/null
"$pg_bin/pg_ctl" -D "$cluster/data" -o "-F -k $socket" -w start >/dev/null
```

Bootstrap one synthetic database, `pgcrypto`, the four global no-login roles and three login identities, each a member of exactly one connection role. Export percent-encoded Unix-socket app/retention/restore URLs only to the child command after `--`.

- [ ] **Step 3: Prove red against absent migrations**

```bash
verification/agent-orchestrator/with-postgres.sh -- \
  cargo test -p libre-ai-agent-orchestrator-run --test postgres schema --locked -- --test-threads=1
```

Require failure because `orchestrator_run.runs` is absent.

- [ ] **Step 4: Implement the run-control migration**

Create `runs`, `run_events`, `run_retention_facts`, `run_lifecycle`, `budget_ledger` and `attestation_refs`. Use composite `(tenant_id, run_id)` keys, seven nonnegative checked budget delta/total columns, 32-byte digest checks, sequence/generation range 1..1,000,000,000 and `canonical_jcs` byte length 1..65,536. `run_events` is unique on `(tenant_id,event_id)`, foreign-keyed to runs with cascade, append-only by grant and update trigger. `run_retention_facts` is append-only with primary key `(tenant_id,run_id,observed_at)` and an explicit digest comparison for idempotency/conflict; `run_lifecycle` is its disposable current projection. Index `(tenant_id,run_id,sequence,event_digest)` and `run_lifecycle(tenant_id,retention_until,run_id)`.

Every organization table uses:

```sql
ALTER TABLE orchestrator_run.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_run.runs FORCE ROW LEVEL SECURITY;
CREATE POLICY runs_organization ON orchestrator_run.runs
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), ''));
```

Grant app only column-scoped `UPDATE` on the mutable execution fields of `runs`, plus the exact organization-scoped reads/inserts needed for append. Grant app and retention `UPDATE` only on the retention years, deadline, latest observation instant and fact digest in `run_lifecycle`; grant the exact `SELECT`/`INSERT` needed on `run_retention_facts`. Retention receives per-organization lifecycle reads/deletes and no `UPDATE` on `runs`; no role receives table-wide `UPDATE` on either projection. All app/retention writers lock `run_lifecycle` before touching a lineage. The `runs` projection stores all seven checked budget totals, excludes lifecycle fields and rejects every update after closure. Lifecycle identity/mission columns are immutable by grants and trigger.

Add deferred constraint triggers on run insert/update and event/ledger insert. At commit they require the run head sequence/digest and all seven totals to match the immutable head event/ledger row. This permits the store's tentative first row inside one transaction but rejects direct projection mutation or an event committed without its ledger.

Add append-only triggers to `run_retention_facts` that acquire the referenced `run_lifecycle` row lock, recompute the versioned mission-id/years/Unix-microseconds digest, bind the mission to the run and reject an observation older than the newest immutable fact. Add deferred triggers on fact insert and lifecycle insert/update requiring the latest fact and projection instant/digest/years/deadline to agree at commit. Prove direct fact-only, lifecycle-only, stale, digest-divergent and identity-changing writes all fail, including a multi-statement attempt that temporarily rewinds then restores the lifecycle projection around a stale insert.

- [ ] **Step 5: Implement the deletion migration**

```sql
CREATE TABLE orchestrator_run.execution_deletion_tombstones (
  subject_digest bytea PRIMARY KEY CHECK (octet_length(subject_digest) = 32),
  receipt_digest bytea NOT NULL CHECK (octet_length(receipt_digest) = 32),
  deleted_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (expires_at = deleted_at + interval '35 days')
);
```

Implement the versioned length-framed digest with `pgcrypto.digest` and `int4send(octet_length(convert_to(value,'UTF8')))`. Guard-owned security-definer functions with fixed safe `search_path` record/compare one tombstone from `current_setting('app.tenant_id')` plus bound run/receipt/time; grant execution only to retention and return a closed boolean/outcome, never a row. The same guard owns the anti-resurrection trigger. Revoke all guard functions from public/app/restore. Retention has no raw tombstone insert/select/update; it may delete expired rows without `RETURNING`, guarded by `transaction_timestamp()`. Restore gets content-free select plus cross-organization run select/delete policies only. Guard gets only tombstone `SELECT`/`INSERT` under RLS, never `UPDATE`/`DELETE`, and no connection identity receives its membership.

Enable and force RLS on `execution_deletion_tombstones`. Its policies permit only guard lookup/insert, retention expiry delete and restore's content-free scan; app has no policy or table privilege. Test the guard's required insert separately from forbidden update/delete, and prove that table ownership alone cannot bypass the policy boundary.

- [ ] **Step 6: Prove green and commit**

Run the schema test through the wrapper. The integration-test binary embeds the two migration files with `include_str!`, applies them through a private test-only helper and records version plus SHA-256 in a migration ledger. Reapplying unchanged bytes is a no-op; changing bytes behind a recorded version is an integrity failure. The library exports no migration runner or raw SQL hook. Then:

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

Use `max_connections=1`. Poison the sole session with a session-level GUC/role; cover success, callback error, task cancellation and backend termination during scrub. The next borrower receives a clean/new connection, never poison. Prove every wrong identity/store pair returns only `run-store.unavailable`.

- [ ] **Step 2: Construct private scrubbed pools**

```rust
PgPoolOptions::new()
    .min_connections(0)
    .max_connections(limits.max_connections())
    .acquire_timeout(limits.acquire_timeout())
    .after_release(|connection, _| Box::pin(async move {
        match sqlx::query("DISCARD ALL").execute(connection).await {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }))
    .connect_with(options)
    .await
```

Immediately probe session user membership, target role flags and absence of membership in the other connection roles. Close on mismatch. App/retention helpers use literal `SET LOCAL ROLE` then bound `set_config`; restore uses literal role only and accepts no organization.

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

Cover explicit organization mismatch, graph mismatch, stale event digest, broken predecessor, illegal phase, budget decrease/overflow, event over 65,536 bytes, exact replay and divergent event-id/sequence collision. Corrupt a different stored event through the admin test identity and prove that an otherwise exact duplicate refuses integrity failure rather than bypassing whole-chain replay. Every refusal compares all relation counts, the previous execution head and the previous lifecycle projection before/after. Also prove an older retention observation refuses, an exact equal-instant observation is idempotent and an equal-instant divergent observation conflicts. On a closed run, an exact event duplicate carrying a new retention observation must not reinsert the event or mutate lifecycle; it refuses, while the same authenticated observation succeeds through `LifecycleStore` only.

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

- [ ] **Step 5: Implement one-transaction append**

Validate graph/candidate, compare explicit organization and mission-retention fact, derive its versioned internal digest, canonicalize and size-check; begin app transaction; insert tentative `runs` and `run_lifecycle` rows with `ON CONFLICT DO NOTHING`; lock `run_lifecycle` first and then `runs`; classify exact event idempotency without returning; load all JCS ordered by sequence and revalidate/parse all. Replay the stored chain for an exact duplicate, or append the new candidate in memory and replay it. For an exact event duplicate, require the retention observation already current and return without writes; a different observation refuses and must use `LifecycleStore`. For a new event, reject stale/equal-instant divergent retention, append the fact if new, update `run_lifecycle` from run creation, insert event/ledger/references and update the execution projection. Commit once. Every value is bound. Neither projection phase nor lifecycle policy is fed into execution replay.

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

Also attempt direct app-role mutation of the open `runs` head/totals and direct event insertion without its ledger. The deferred coherence triggers must reject both at commit without exposing constraint names through public errors. Prove retention has no `UPDATE` privilege on `runs`, app and retention lack table-wide `UPDATE`, lifecycle identity/mission columns cannot change, and a closed execution row rejects every update while an authorized lifecycle-only update still succeeds.

- [ ] **Step 2: Write red concurrency tests**

Release 16 Tokio tasks with a barrier against the same absent run: eight exact and eight divergent candidates. Repeat at an existing head. Assert one canonical successor, exact idempotency, divergent conflict, contiguous sequence and no orphan projection rows.

- [ ] **Step 3: Fix only database serialization and prove green**

Run focused cases through the PostgreSQL wrapper. Fix the common first-row `run_lifecycle` lock order, `INSERT ... ON CONFLICT` behavior or transaction isolation only; do not add an application mutex or hidden retry. Run the entire `postgres` binary, then commit as `Serialize concurrent run event appends`.

### Task 9: Add cursor-bounded need-to-know queries

**Files:** modify `src/store.rs`; create `tests/postgres/query.rs`; modify `tests/postgres.rs`.

**Interfaces:**
- Consumes: Task 4 pages and Task 7 projections.
- Produces: run, event, ledger and reference query methods.

- [ ] **Step 1: Write red pagination and disclosure tests**

Insert 205 events; assert pages 100/100/5 without duplicates/omissions. Reject foreign/wrong cursors without existence leakage. Invalid cursor/limit fails before SQL, proven with a closed pool. Returned types expose only canonical bytes or the specific bounded projection; redacted `Debug` contains type and count/sequence only.

- [ ] **Step 2: Implement one-query keyset pages**

Use `limit + 1` and:

```sql
WHERE tenant_id = $1 AND run_id = $2
  AND ($3::bigint IS NULL OR (sequence, event_digest) > ($3, $4))
ORDER BY sequence, event_digest
LIMIT $5
```

Drop the extra row and encode only `meta.next_cursor`. No offset, unbounded limit or N+1 reference query.
`get_run` performs one organization-scoped join from `runs` to
`run_lifecycle`; it never treats mutable lifecycle columns as execution replay
input.

- [ ] **Step 3: Prove query plans and commit**

Assert `EXPLAIN (FORMAT JSON)` uses the organization/run/sequence index on representative and maximum fixed benchmark fixtures. Run focused/full PostgreSQL tests, then commit as `Add bounded run-control queries`.

### Task 10: Implement retention, deletion and anti-resurrection

**Files:** create `src/lifecycle.rs`, `tests/postgres/lifecycle.rs`; modify crate `src/lib.rs`, `tests/domain.rs`, `tests/postgres.rs`.

**Interfaces:**
- Consumes: retention/restore pools, SQL digest function, explicit time and authenticated deletion-registry fact.
- Produces: `RetentionYears`, deletion, sweep, registry-verified restore replay and blocking count.

- [ ] **Step 1: Write red retention and digest vectors**

Accept exact `P1Y`..`P6Y`; reject `P0Y`, `P7Y`, day/month, a sub-microsecond observation instant and a fact whose mission differs from the event/run. Clamp 2028-02-29 plus one year to 2029-02-28. Validate `DeletionRegistryFact` ordering and bounds without accepting a caller-supplied completeness boolean. For synthetic retention observations, assert Rust and PostgreSQL equality of the versioned mission-id/years/Unix-microseconds digest. For three synthetic organization/run pairs, assert Rust and PostgreSQL deletion-subject digest equality and preimage separation of `("ab","c")` from `("a","bc")`.

- [ ] **Step 2: Write red lifecycle transactions**

Cover deletion, same-receipt idempotency, divergent receipt, exact `P35D`, app invisibility, active-tombstone recreation refusal with generic error, early expiry refusal, and rollback after tombstone insertion. Prove `apply_mission_retention` binds the stored mission, records one immutable observation, recomputes from creation and succeeds after execution closure without changing any `runs` column. Prove stale observation refusal against the newest immutable fact even if one transaction temporarily rewinds the projection, exact observation idempotency and equal-instant divergence refusal. Rebuild execution first from `run_events`, derive and verify creation, then rebuild lifecycle from `run_retention_facts`; compare byte-exact state. For sweep, select an expired key then concurrently extend retention through that method; the shared lifecycle-row lock and under-lock recheck must preserve it.

- [ ] **Step 3: Implement bounded retention/deletion**

`RetentionYears` stores `NonZeroU8` 1..6. `MissionRetentionFact` binds mission, duration and observation time; both append and lifecycle update compare it with stored/event mission, derive the internal observation digest and compute from run creation. In one transaction they lock `run_lifecycle`, reject time rollback/equal-instant divergence, append the fact if new and update only lifecycle columns. `DeletionCommand` validates organization/run, receipt digest and UTC deletion time. `delete_run` recomputes subject digest in SQL, locks `run_lifecycle`, inserts/compares the tombstone and deletes the run cascade atomically. Sweep selects only `(run_id,retention_until)` keys from `run_lifecycle` and rechecks each locked lifecycle row against injected time before invoking the same private deletion primitive. Retention never updates `runs`.

- [ ] **Step 4: Implement pre-open restore**

Restore accepts no organization. Before every replay/count operation, validate `snapshot_at <= writers_fenced_at <= observed_at`, `coverage_through >= writers_fenced_at` and `observed_at - snapshot_at <= P35D`. One repeatable-read transaction scans every locally restored tombstone in internally cursor-bounded pages ordered by subject digest and recomputes the registry digest as SHA-256 of `libre-ai.execution-deletion-registry.v1\0`, big-endian `u64` row count, then each row's fixed 32-byte subject digest, fixed 32-byte receipt digest and big-endian `i64` Unix-microsecond deletion/expiry instants. Compare count and digest with `DeletionRegistryFact`. Any absence, staleness or mismatch returns integrity failure before scanning execution rows. The same transaction then loops over restored `(tenant_id,run_id)` keys in batches of validated size 1..100, computes SQL subject digests, deletes keys joined to unexpired tombstones and finally counts remaining suppressed lineages before its single commit. The caller cannot stop after a partial page or supply a cursor. `suppressed_lineage_count` opens its own repeatable-read transaction, repeats the registry proof and returns only one aggregate count. The package authenticates neither the fact nor the writer fence and exposes no opening boolean. A future caller must authenticate both and prove every run/tombstone mutator, including retention expiry, was fenced; production remains closed.

- [ ] **Step 5: Prove green and commit**

Run domain/lifecycle/full PostgreSQL tests plus Clippy. Commit as `Enforce run retention and deletion barriers`.

### Task 11: Prove tombstone-first restore end to end

**Files:** create `tests/postgres/e2e.rs`; modify `tests/postgres.rs` and, only if the red test requires it, `src/lifecycle.rs`.

**Interfaces:**
- Consumes: all three stores and locked synthetic graph/event fixtures.
- Produces: persistence/replay/delete/backup-restore/non-resurrection proof.

- [ ] **Step 1: Write the red backup/restore scenario**

Database A holds a complete A run and unrelated B run. Delete A and retain its tombstone. Materialize database B with execution rows deliberately restored before tombstones, then restore the independently protected tombstone registry plus its literal count/digest/coverage fact. Assert count is 1 before replay, 0 after bounded replay, A absent and B byte-identical.

Add the negative recovery vector: take an execution and tombstone snapshot before deleting A, then present that stale registry after the deletion writer fence. Even though the local join reports zero, count/digest coverage verification must refuse pre-open. Also refuse an execution snapshot older than `P35D`, a missing manifest, wrong count, wrong digest and coverage ending before the fence.

- [ ] **Step 2: Assert the service-open barrier remains external**

Return `RestoreOutcome { processed, deleted, remaining }` only after registry verification; `remaining == 0` is necessary but a future caller still needs authenticated registry/writer-fence authority before opening. No method starts traffic. An expired tombstone is ignored only when injected time is after expiry, the execution snapshot is within `P35D` and the fixture proves the backup ceiling elapsed.

- [ ] **Step 3: Run red, implement the missing behavior and prove green**

```bash
verification/agent-orchestrator/with-postgres.sh -- \
  cargo test -p libre-ai-agent-orchestrator-run --test postgres restore --locked -- --test-threads=1
verification/agent-orchestrator/with-postgres.sh -- \
  cargo test -p libre-ai-agent-orchestrator-run --test postgres --locked -- --test-threads=1
```

Require the first run to fail on the surviving lineage, then green without adding service/startup code. Commit as `Prove tombstone-first restore replay`.

### Task 12: Add performance, compatibility and CI gates

**Files:** create benchmark, compatibility snapshots/test; modify `.github/workflows/ci.yml`, `tools/quality/rust-coverage-gate.test.ts`, `package.json`.

**Interfaces:**
- Consumes: complete store.
- Produces: exact 0.1.0 surface, reproducible scaling and mandatory real-PostgreSQL CI.

- [ ] **Step 1: Write red compatibility and CI assertions**

Snapshot every public re-export and five error codes. Extend the Bun coverage test to require test/coverage commands are wrapped by `with-postgres.sh --`, PostgreSQL >=14 is checked, workspace/all-features are used and 87/90 thresholds remain. Run focused tests and require failure against the old workflow/missing snapshots.

- [ ] **Step 2: Implement the benchmark**

Use fixed chain sizes `[1,32,256,2048,8192]`, at least 30 samples after warmup and `std::time::Instant`. Print:

```text
events,total_jcs_bytes,append_p50_us,append_p95_us,load_p50_us,page_p95_us,peak_rss_bytes
```

Exit non-zero on fixture/replay/query failure. Record statement counts in integration tests; set no hardware-dependent latency threshold.

Add a separate pre-open series over fixed tombstone/run pairs `[(1,1),(32,256),(256,2048),(2048,8192)]` and print `tombstones,runs,reconcile_p50_us,reconcile_p95_us,peak_rss_bytes`. Assert complete processing and batch-bounded userspace memory; report the expected `O(tombstones + runs)` scaling without a hardware-dependent threshold.

- [ ] **Step 3: Wire CI through local PostgreSQL**

Use:

```yaml
- run: cargo fmt --all --check
- run: cargo clippy --workspace --all-targets --all-features -- -D warnings
- run: RUSTDOCFLAGS="-D warnings" cargo doc --locked --workspace --all-features --no-deps
- run: verification/agent-orchestrator/with-postgres.sh -- cargo test --locked --workspace --all-features
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
  cargo bench -p libre-ai-agent-orchestrator-run --bench postgres_persistence
```

Require green commands and complete benchmark rows. Commit as `Gate run-store compatibility and PostgreSQL proof`.

### Task 13: Document the bounded capability and rollback

**Files:** modify `README.md`, `docs/apps/orchestrator.md`, `project.v1.yaml`, run-capability test.

**Interfaces:**
- Consumes: measured behavior and exact Governance SHA.
- Produces: honest status and compile-checked example.

- [ ] **Step 1: Write/red-run documentation assertions**

Require all three docs to name ADR-0039/D45, exact Governance SHA, new crate, canonical JCS, forced RLS, the independently protected deletion-registry fact, tombstone-first restore and the `O(n)` production block. Reject “production ready”, “executes missions” and “LangGraph checkpoint”. Run the Bun test and require failure against current docs.

- [ ] **Step 2: Update documentation and card**

Add a compile-checked example that constructs `PgConnectOptions` outside the crate, creates bounded pool limits, appends a synthetic content-free event and reads a page. State that the library cannot load secrets, authorize, execute or serve.

Rollback text: stop consumers; pin/revert code; retain applied forward migrations and canonical event/tombstone evidence; never destructive-down-migrate or rewrite events. Add phase `run-control-persistence` as `implemented-review-pending`, explicitly leaving whole WP-G3-O01 incomplete. Do not alter Phase 4A accepted evidence, maturity or exposure.

- [ ] **Step 3: Prove green and commit**

Run the documentation assertion, `bun run check` and full PostgreSQL workspace tests. Commit as `Document bounded run-control persistence`.

### Task 14: Build the immutable review dossier

**Files:** create `docs/reviews/orchestrator-run-control-persistence/$REVIEW_SHA/{benchmark.csv,architecture.md,security.md,privacy.md,integration.md}` after computing `REVIEW_SHA="$(git rev-parse --short=7 HEAD)"`; modify only the new project-card criterion after approval.

**Interfaces:**
- Consumes: clean immutable implementation candidate.
- Produces: evidence for ADR-0011 D4 owner stop.

- [ ] **Step 1: Freeze candidate and rerun every gate**

Run Task 12 commands, require clean status, then record full HEAD, parents, author, committer and message. The dossier directory uses seven SHA characters; every file names the full SHA and digest of captured command output.

- [ ] **Step 2: Run four independent review roles**

Architecture/performance proves no policy duplication, canonical revalidation including the idempotent path, constant append statement count, honest append and `O(tombstones + runs)` restore byte/time/memory scaling, no checkpoint/service and `O(n)` production block. Security attacks SQL injection, wrong roles, RLS/GUC/pool cancellation, races, error leakage, immutable rows, exact guard privilege matrix, tombstone expiry, stale/incomplete deletion registry and restore escalation. Privacy/sovereignty proves synthetic fixtures, no raw content/PII/logging, content-free tombstones, authenticated independent registry precondition, retention/order, licenses and EU target. Completeness reproduces empty migration, concurrency, replay, pagination, deletion, stale-snapshot refusal, verified restore, compatibility, coverage and rollback.

- [ ] **Step 3: Remediate without carrying stale approval**

Any Blocking/Major finding gets a red regression, minimal fix and full rerun. A changed candidate invalidates all old approvals; compute a new SHA and repeat all roles. Fix Minor findings unless the dossier proves them outside the authorized scope.

- [ ] **Step 4: Commit accepted evidence and status**

After all roles approve the same implementation SHA, add evidence. Mark only the new criterion accepted with full reviewed SHA; keep WP-G3-O01/service unclaimed. Commit as `Record run-control persistence review`, then rerun formatting, Clippy, PostgreSQL workspace tests, Bun check and clean-status proof.

### Task 15: Open the PR and stop at the bootstrap hard gate

**Files:** no implementation edit unless CI yields a reproduced defect.

**Interfaces:**
- Consumes: reviewed implementation SHA, evidence commit and green gates.
- Produces: owner-controlled merge candidate.

- [ ] **Step 1: Push exact branch, create PR and verify head/CI**

The PR names ADR-0039/D45, reviewed implementation SHA, evidence commit, commands, `O(n)` limitation and all unopened capabilities. Push only `refs/heads/feat/orchestrator-run-control-persistence`. Resolve `orchestrator_pr="$(gh pr view --json number --jq .number)"`; verify `headRefOid`, merge state and `gh pr checks "$orchestrator_pr" --watch`.

- [ ] **Step 2: Restate and stop at ADR-0011 D4**

Present inline:

```text
This merge establishes the first layer-2 PostgreSQL persistence barrier:
canonical events, forced RLS, separated lifecycle/restore roles and
tombstone-first recovery are proven. It still cannot authorize, execute,
serve or deploy a run, and O(n) replay explicitly blocks production use.
ADR-0011 D4 requires the owner's bootstrap pronouncement before merge.
```

Do not treat design, plan, Governance merge or PR creation approval as this pronouncement.

- [ ] **Step 3: Merge only after explicit pronouncement and verify**

Merge without force, fetch `origin/main`, prove the merge tree contains reviewed implementation bytes plus evidence-only commit, then wait for post-merge CI. Create/verify an annotated evidence tag only if the established Phase 4A pattern requires it.

- [ ] **Step 4: Clean only owned state**

Remove completed Governance/Orchestrator worktrees and branches only after remote main/tag proof. Preserve every unrelated dirty worktree, cache and user branch. Report exact main SHAs, PRs, checks, tag if any and all still-closed capabilities.
