# Orchestrator Run-Control Persistence — Phase 4B Design

- **Status:** approved for planning — owner, 2026-09-11; governance
  authorization pending under ADR-0039/D45
- **Date:** 2026-09-11
- **Programme authority:** ADR-0011, ADR-0018, ADR-0034, ADR-0036 and
  ADR-0037
- **Scope:** the first bounded persistence slice of `WP-G3-O01`, implemented
  as an isolated Rust crate inside `libre-ai/orchestrator`
- **Explicit exclusion:** service exposure, Biscuit authorization, Missions or
  Harness integration, worker invocation, real effects, runtime diagnostics,
  deployment and any LangGraph, LangChain or LangSmith dependency

## 1. Decision being specified

The owner selected option A on 2026-09-11: add an isolated Rust persistence
crate at `crates/agent-orchestrator-run/` in the existing Orchestrator
repository. The accepted pure decision crate remains effect-free and is
consumed as a dependency. PostgreSQL serializes accepted state applications,
enforces organization isolation and preserves the canonical event evidence;
it does not decide graph, authorization, retry, transfer, budget or effect
semantics.

The alternative of opening the complete runtime service was rejected because
it would combine storage, authorization, network exposure, effects and
operational diagnostics before the storage barrier has an independent proof.
A TypeScript adapter was rejected because ADR-0018 selected Rust for this
boundary and because sharing the TypeScript data implementation would create
coupling without strengthening the database barrier.

The earlier working label `ADR-0038/D44` is no longer available. Current
Governance `main` assigns it to private-first repository publication. This
design therefore reserves the next identifiers, `ADR-0039/D45`, subject to the
normal mechanical registry checks. This correction is bookkeeping, not a new
architecture choice.

This document authorizes no implementation by itself. Governance must first
merge ADR-0039/D45 to bind this bounded slice of the existing locked
`WP-G3-O01`. It creates no overlapping work package and must not mark the
complete runtime package proven; authorization consumption, execution and
service capabilities remain closed inside that package.

## 2. Payoff and proof boundary

Phase 4A proved deterministic decisions in memory. Phase 4B turns those
decisions into durable evidence while preserving the distinction between
authority and mechanism:

- the pure core remains the only native interpreter of locked Contracts
  semantics;
- canonical event bytes remain independently replayable rather than being
  replaced by mutable relational projections;
- PostgreSQL provides atomicity, concurrency serialization and row-level
  organization isolation;
- retention, explicit deletion and restore ordering become testable against a
  real database;
- a later service, worker or LangGraph adapter can be added or removed without
  changing the stored authority.

The result still cannot execute a mission or an external effect. It proves one
smaller claim: given validated authority and explicit observations, durable
run-control state cannot be partially appended, crossed between organizations,
silently rewritten or resurrected after accepted deletion.

## 3. Authority and repository boundaries

### 3.1 Governance

`libre-ai/governance` owns the opening act, the bounded work package, this
design and the implementation plan. ADR-0011 D4 remains applicable: the first
security-critical persistence barrier requires an independent adversarial
review dossier and a hard stop for owner pronouncement before merge.

### 3.2 Contracts and SDK Rust

`libre-ai/contracts` remains the only authority for event schemas, digest
preimages, closed outcomes, retention classes and restore order. The runtime
crate consumes the same pinned Contracts/SDK Rust lineage as the pure core. It
does not edit, fork or translate a wire contract.

The authoritative retention facts are:

- an orchestrator execution record defaults to `P1Y`, may be configured up to
  `P6Y`, and equals the owning mission retention;
- a content-free execution-deletion tombstone is retained for `P35D`;
- restore applies deletion tombstones before execution records.

### 3.3 Orchestrator

`libre-ai/orchestrator` owns both crates but keeps their capabilities separate:

```text
Contracts / SDK Rust
        |
        v
+----------------------------+       proposed applications
| pure orchestrator core     | ------------------------------+
| validation + decisions     |                               |
| no I/O capability          |                               v
+----------------------------+        +--------------------------------+
                                      | agent-orchestrator-run         |
                                      | transactions + RLS + lifecycle |
                                      +----------------+---------------+
                                                       |
                                                       v
                                           PostgreSQL in EU residency
```

The root package remains a normal package and a workspace root. The workspace
adds `crates/agent-orchestrator-run` as a member. Existing capability gates keep
scanning the pure root `src/`; an additional gate explicitly limits the new
crate to its authorized database capability.

Phase 4B does not change the root crate's API or introduce a native checkpoint.
The Phase 4A decision deliberately left persisted state projections closed
until separately authorized. The persistence proof therefore calls the
existing whole-chain replay API over canonical events; it does not duplicate
the private state reducer inside the runtime crate.

No new repository is created. The canonical lexicon and the locked work
package already place `crates/agent-orchestrator-run/**` in the Orchestrator
repository, and a repository split would not create an additional runtime
security boundary.

### 3.4 Data-layer pattern

The Rust crate reuses the proven structural PostgreSQL barrier from
`@libre-ai/data`: every application transaction sets the restricted
`libre_ai_app` role and the local `app.tenant_id` setting; pooled connections
are scrubbed with `DISCARD ALL` before reuse. It does not depend on the
TypeScript package or copy its domain policy.

Domain and public Rust names use `OrganizationId`. Database columns retain
`tenant_id` and the `app.tenant_id` setting so the shared RLS barrier remains
consistent across services. The mapping is explicit and local to persistence;
it does not reintroduce “tenant” into product or API language.

## 4. Capability envelope

The new crate may:

- consume caller-built SQLx `PgConnectOptions` and bounded pool limits;
- construct and own one private PostgreSQL pool per authority role, with the
  mandatory connection-scrubbing hook;
- open transactions through those private pools;
- encode already validated event documents as RFC 8785 JCS bytes;
- calculate and compare SHA-256 digests;
- return typed, bounded pages and constant public error codes.

It may not:

- read environment variables, secrets, files or process state;
- create its own connection configuration or discover a database endpoint;
- expose its pool or a raw SQLx transaction;
- call an HTTP, RPC, worker, Missions, Harness or effect endpoint;
- read the wall clock implicitly;
- emit logs, traces, metrics labels or raw database errors;
- authorize a run, actor, deletion or retention policy;
- accept a preclassified semantic verdict from an adapter.

The caller injects connection options, authoritative time and already
established authority facts. It resolves endpoints and secrets outside this
crate; the crate never formats or exposes those options. Pool construction is
inside the crate because accepting an opaque prebuilt pool would make the
mandatory `DISCARD ALL` return hook unverifiable. The crate still recomputes
every comparison it owns. Future environment/secret loading and request
authorization require separate packages.

Migration SQL belongs to the crate, but the library does not read or execute
migration files at runtime. CI and future deployment tooling apply the exact
versioned files under an explicitly authorized migration identity. This keeps
filesystem and schema-owner capabilities out of the application process.

## 5. Dependencies and portability

The persistence crate uses Rust and pins SQLx exactly at `0.9.0` with default
features disabled. Only PostgreSQL, Tokio runtime, Chrono, JSON and Rustls with
native roots are enabled. The embedded-migration macro and SQLite/MySQL
drivers stay disabled. Direct dependencies already used for canonicalization,
digests and time values are pinned consistently with the pure crate.

SQLx 0.9.0 is MIT OR Apache-2.0 and supports the repository's Rust toolchain.
PostgreSQL is the only storage engine in scope. Production remains targeted at
Clever Cloud PostgreSQL in the Paris/EU residency boundary; this package does
not provision or deploy it. Tests use an ordinary PostgreSQL 14-or-newer
server and never require a Docker Hub image.

The schema uses PostgreSQL's `pgcrypto` extension only for the database-side
SHA-256 deletion-subject check. The migration preflight must prove the
extension is present before changing schema; it may not attempt an unreviewed
fallback. Clever Cloud documents `pgcrypto` among its default PostgreSQL
extensions: <https://www.clever-cloud.com/developers/doc/addons/postgresql/>.

These choices preserve a standard, replaceable PostgreSQL/JCS boundary and add
no US hyperscaler or proprietary control plane.

## 6. Database principals and transaction barrier

Product migrations create schemas, tables, functions, policies and grants but
do not create cluster-global roles. Deployment/bootstrap authority provisions:

- a schema owner/migrator that is never used by the application;
- `libre_ai_app`, with only the operations required for run persistence;
- `libre_ai_retention`, with the additional lifecycle operations required for
  expiry and explicit deletion;
- a `NOLOGIN` tombstone-guard role that owns only the anti-resurrection trigger
  function and receives only the tombstone lookup policy it requires.

The connection principal receives only the right to assume its intended role.
No application pool connects as a superuser, table owner or role with
`BYPASSRLS`.

Every application method opens a private transaction and performs, before any
table access:

1. `SET LOCAL ROLE libre_ai_app`;
2. `SELECT set_config('app.tenant_id', $1, true)` with the explicit
   organization identifier;
3. the bounded query or mutation;
4. commit or rollback.

Lifecycle methods use a physically separate, store-owned pool and set
`libre_ai_retention`. Pool release executes `DISCARD ALL`; a connection that
cannot be scrubbed is discarded. Tests intentionally poison a pooled session,
exercise rollback and cancellation paths, and prove that neither role nor
organization context survives reuse.

`ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` apply to every
organization-scoped table. Policies require both a non-empty local setting and
exact equality with `tenant_id` for read and write. The restricted roles have
no ability to disable RLS, change policies or mutate schema.

## 7. Persisted model

All identifiers and digests have length and format checks matching the locked
contracts. Timestamps are UTC instants. No prompt, tool argument, observation,
path, destination, comment, free-form error or personal identity is stored.

### 7.1 `runs`

One row is the current query projection for a run. Its composite primary key is
`(tenant_id, run_id)`. It stores only bounded identifiers, contract digests,
orchestrator identity, active generation, head sequence, head event digest,
closed phase code, creation/last-event/closure instants and lifecycle
deadlines.

The row is not replay authority. It is updated in the same transaction as each
event and can be rebuilt from the immutable event chain. A database trigger
rejects mutation of a closed run except for lifecycle deletion by the
retention role.

### 7.2 `run_events`

One row stores one authoritative canonical event with:

- `(tenant_id, run_id, sequence)` as the ordered primary key;
- a unique event identity and event digest within the organization;
- predecessor digest and bounded event kind as extracted indexes;
- `canonical_jcs BYTEA` as the immutable authority;
- the authoritative event occurrence instant and persistence instant.

The restricted application role can insert and select but cannot update or
delete events. A trigger rejects updates even if a future grant is widened by
mistake. Extracted columns are mechanically compared with the parsed canonical
bytes before insert and never override them.

### 7.3 `budget_ledger`

The ledger is append-only and keyed by event sequence. It stores the bounded,
checked budget deltas and resulting counters required for independent audit.
The current budget projection in `runs` is derived from the same application.
No caller supplies a “budget accepted” verdict.

### 7.4 `attestation_refs`

This append-only relation stores only opaque contract references, digests,
profile identifiers and their binding sequence. It never stores an
attestation payload, signature private material, artifact contents, effect
destination or actor identity. Need-to-know queries must explicitly request
this projection and remain organization-scoped.

### 7.5 `execution_deletion_tombstones`

A tombstone contains only a content-free subject digest, deletion receipt
digest, deletion instant and expiry instant. It deliberately has no foreign
key to a run: deleting the run cannot delete the evidence that prevents its
restore. The application role cannot read, insert, update or delete this
table. The retention role may insert and read it; expiry deletion is permitted
only after the `P35D` backup ceiling.

The deletion-subject digest has one versioned internal preimage:

```text
SHA-256(
  "libre-ai.execution-deletion-subject.v1\0" ||
  u32be(byte_length(organization_id_utf8)) || organization_id_utf8 ||
  u32be(byte_length(run_id_utf8))          || run_id_utf8
)
```

Length framing prevents concatenation ambiguity. Rust and PostgreSQL
implementations must match fixed cross-language vectors. The schema owner
installs a tombstone-guard-owned `SECURITY DEFINER` trigger with a fixed safe
`search_path`. It recomputes this digest for every attempted `runs` insertion
and rejects an unexpired matching tombstone without disclosing its presence to
the application role. `FORCE RLS` remains active: one policy grants that
`NOLOGIN` guard role only the required tombstone lookup, and the role has
neither `BYPASSRLS` nor other table privileges. Public and application
execution of the trigger function is revoked. The retention path similarly
recomputes and compares the subject before inserting a tombstone; a caller
cannot substitute an unrelated digest.

## 8. Public Rust surface

The crate exposes typed stores, not SQL primitives:

```rust
pub struct RunStore { /* private PgPool + embedded ContractRegistry */ }
pub struct LifecycleStore { /* separate private PgPool */ }

pub async fn connect(
    options: PgConnectOptions,
    limits: PoolLimits,
) -> Result<Self, StoreError>;

pub async fn append_event(
    &self,
    organization_id: &OrganizationId,
    graph_document: &serde_json::Value,
    event_document: &serde_json::Value,
    observed_at: DateTime<Utc>,
) -> Result<AppendOutcome, StoreError>;

pub async fn get_run(
    &self,
    organization_id: &OrganizationId,
    run_id: &RunId,
) -> Result<Option<RunSnapshot>, StoreError>;

pub async fn list_events(
    &self,
    organization_id: &OrganizationId,
    run_id: &RunId,
    page: EventPageRequest,
) -> Result<EventPage, StoreError>;
```

Budget and attestation-reference queries follow the same organization-scoped,
cursor-bounded shape. Lifecycle methods accept explicit authoritative time and
an explicit deletion command whose authorization has already been verified by
a future caller. They do not expose a public bypass flag or reuse the
application pool.

`PoolLimits` has closed minimum/maximum bounds for connection count and
acquisition timeout. Both store constructors install the same `after_release`
hook and return a closed `StoreError` if initial connection or session
scrubbing fails. Neither `PgConnectOptions`, `PgPool`, nor a raw connection is
recoverable from the constructed store.

Construction builds the fail-closed `ContractRegistry` once from SDK Rust's
embedded canonical schemas. Each append validates the supplied graph and
candidate event, proves that their graph digests match, then validates every
stored event during replay. The graph remains an input from the future
authority-owning caller; this package neither discovers nor stores a second
copy of the plan/graph authority.

The crate does not claim the caller's authorization is valid; it records a
strict precondition in the type and still validates the deletion subject,
retention limits and current database state. Until a Biscuit-authorized caller
is separately implemented and proven, no production path may construct that
command.

Pages use an opaque cursor derived from `(sequence, event_digest)`, a closed
limit range of 1 through 100 and a `{ data, meta }`-shaped Rust result. Offset
pagination and unbounded exports are absent. Each page is fetched with one
bounded query; related ledger/reference projections use explicit separate
methods rather than N+1 loading.

## 9. Atomic append protocol

`append_event` executes one database transaction:

1. establish restricted role and organization context;
2. validate and normalize the supplied graph and candidate event through the
   existing pure core, prove their graph digests match, canonicalize the event
   with RFC 8785 and recompute its event digest;
3. create the first `runs` key with `INSERT ... ON CONFLICT DO NOTHING` when
   absent, then lock the `(tenant_id, run_id)` projection with
   `SELECT ... FOR UPDATE`; the speculative first row remains inside the same
   transaction and cannot survive a refusal;
4. return idempotent success only when an existing event identity, sequence,
   digest and canonical bytes all match;
5. load the complete existing canonical event chain in sequence order under
   the same lock, revalidate every stored document and append the candidate in
   memory;
6. call the existing pure whole-chain replay with the validated graph; any
   causal, phase, routing, generation or budget refusal aborts the append;
7. insert the immutable event, budget row and allowed opaque references, then
   update the `runs` projection from the accepted replay state;
8. commit once.

Any divergent identity/sequence collision returns a closed conflict and writes
nothing. Any validation, serialization, constraint, RLS, timeout or connection
failure rolls back the complete transaction. No retry occurs inside the store;
a future caller may retry only the same immutable input and must observe the
idempotent result.

The first-event race is proven with concurrent transactions. Exactly one
canonical lineage is committed; an exact duplicate is idempotent and a
divergent candidate is refused. Isolation level and SQL shape must be selected
from this proof, not assumed from library defaults.

Whole-chain replay is intentionally `O(n)` in event count and bytes for this
proof slice. It is safer than persisting an unauthorized state format or
duplicating the reducer, but the locked event sequence ceiling is too large to
claim production suitability from boundedness alone. Benchmarks must publish
the scaling curve and maximum-memory observation. No production service may
consume this store until a later governance decision either authorizes a
native, derived incremental checkpoint with an independent rebuild proof or
demonstrates an enforceable authoritative run bound that keeps the complete
replay path within the measured envelope. A LangGraph checkpoint cannot
satisfy that requirement.

## 10. Canonical evidence and projections

`canonical_jcs` is the sole persisted replay authority because JSONB is free to
normalize representation and therefore cannot prove byte-identical replay.
The store reparses JCS bytes through the locked registry before replay. Invalid
stored bytes, a digest mismatch or disagreement with extracted columns fails
closed as integrity corruption; it is never repaired in place.

The `runs`, ledger and reference relations are disposable projections. A
deterministic rebuild into an empty schema must reproduce them exactly from
the event rows. Rebuild never overwrites the source event bytes. An
independent test compares the resulting native state byte-for-byte through the
same private deterministic proof encoder already used by Phase 4A.

## 11. Retention, deletion and restore

The crate represents the locked policy as validated values: default `P1Y`,
maximum `P6Y`, equality with the owning mission retention, and tombstone
retention `P35D`. It does not select a mission policy. A caller must provide
the already-authoritative mission retention fact; the store rejects values
outside the locked bounds or unequal execution/mission retention.

Expiry uses a two-stage, bounded sweep:

1. select candidate keys with a cursor and no payload export;
2. for each bounded batch, open a retention transaction, lock and recheck the
   deadline against injected authoritative time, write the tombstone, then
   delete projections and events atomically.

Explicit deletion follows the same transaction order. A tombstone is committed
before or with run deletion, never afterward. The subject digest is derived
from the closed organization/run lineage; raw identifiers do not enter the
tombstone. Deletion is idempotent for the same receipt and refuses a divergent
receipt.

While that tombstone is active, the tombstone-guard insertion trigger refuses
recreation of the deleted organization/run lineage. This closes both the live
append path and restore races even though the application role cannot query
tombstones. Run identifiers remain non-reusable authority identifiers; the
future authorization layer must enforce that invariant after the `P35D`
tombstone has legitimately expired.

Restore has a mandatory pre-open phase under the retention authority:

1. restore the tombstone relation first;
2. replay all unexpired tombstones against restored execution records;
3. delete every matching restored lineage and its projections;
4. verify that no suppressed lineage remains;
5. only then permit the application role or service traffic.

The crate supplies the bounded replay operation and proof query, but does not
control service startup. Future deployment tooling must make successful
tombstone replay a blocking startup gate. Once a tombstone expires, the policy
asserts that no backup capable of resurrecting that lineage remains; expiry is
therefore a retention-authority operation, not a normal application sweep.

## 12. Error and diagnostic discipline

`StoreError` exposes only closed, constant categories such as invalid input,
conflict, unavailable, integrity failure and internal persistence failure.
`Display` and `Debug` contain the code only. SQL text, database messages,
constraint names, connection details, organization/run identifiers, digests,
event documents and rejected values never enter a public error.

The underlying SQLx error may remain a private non-formatting source solely for
control flow classification. No API in this package logs it. Error-code and
aggregate-counter allow-listing belongs to the later runtime-diagnostics
package and cannot be inferred from this design.

## 13. Verification strategy

All non-trivial behavior is test-first. The implementation must provide:

### 13.1 Unit and property tests

- identifier, digest, cursor and retention-bound validation;
- canonicalization and stored-digest equality;
- constant-only `Display` and `Debug` for every public error;
- cursor monotonicity and limit bounds;
- checked budget arithmetic and projection derivation;
- generated canonical documents proving property-order independence.

### 13.2 Real PostgreSQL integration tests

- migrations apply from an empty PostgreSQL 14-or-newer database;
- every table has enabled and forced RLS;
- organization A cannot select, update, delete, infer or conflict against
  organization B through any public method;
- missing or poisoned organization context fails closed;
- role and context do not survive pool release;
- rollback, task cancellation and scrub failure cannot return a poisoned
  connection to either pool;
- the app role cannot update/delete events, access tombstones or alter schema;
- the tombstone-guard role is `NOLOGIN`, lacks `BYPASSRLS`, cannot mutate a
  tombstone and cannot read any other relation;
- application attempts to recreate a tombstoned run fail without revealing
  whether the tombstone exists;
- a closed run cannot be mutated;
- concurrent first append and concurrent next append commit exactly one
  lineage, while exact duplicates remain idempotent;
- injected failure at each SQL boundary leaves no partial event, ledger,
  reference or projection write.

### 13.3 End-to-end persistence proof

The locked authorized-execution vectors are validated by the pure core,
persisted through the public store, loaded only through organization-scoped
queries and replayed into byte-identical state. The proof also covers a broken
predecessor, divergent collision, maximum bounded graph/run, budget overflow
and unavailable database observation.

No test invokes a real worker, Harness, effect or mission. All fixtures are
synthetic and checked for forbidden content.

### 13.4 Lifecycle proof

- `P1Y` default and equal mission retention are enforced;
- a value greater than `P6Y` is refused;
- selection followed by a concurrent retention change is rechecked under
  lock;
- deletion and tombstone creation are atomic;
- tombstones are content-free and inaccessible to the app role;
- fixed vectors prove Rust/PostgreSQL deletion-subject digest equality;
- restore applies tombstones first and cannot resurrect deleted lineage;
- tombstones cannot expire before `P35D`;
- the proof query blocks service opening while any restored lineage survives.

### 13.5 Performance proof

Append and page-query SQL statement counts are constant with run length. The
append path nevertheless reads and validates `O(n)` canonical bytes, as
declared in section 9. The hot append, replay-load and bounded-page paths
receive reproducible PostgreSQL benchmarks without hardware-dependent blocking
latency thresholds. The report includes event count, total bytes, peak memory
and percentile latency at each fixed fixture size. Checked query plans must use
the organization/run/sequence indexes and may not show an unbounded sequential
scan for the representative maximum fixture.

## 14. Quality gates

The implementation merge is blocked on, at minimum:

- formatting and Clippy with zero warnings for the entire Rust workspace;
- the complete Rust unit, integration, E2E and documentation-test suites;
- repository TypeScript/governance checks, including capability and authority
  pin gates;
- a generated coverage report meeting the repository's blocking line and
  function thresholds for the new crate;
- dependency license/advisory/source review with an exact lockfile;
- reproducible clean-schema migration and restore tests on real PostgreSQL;
- an independent security, privacy, quality/performance and completeness
  review dossier over the exact commit;
- owner pronouncement at the ADR-0011 D4 hard stop before the first merge.

An integration test that silently skips because PostgreSQL is unavailable is
not green proof. CI must provision the database from a trusted operating-system
package or an independently attested source, run the test target and fail if
the barrier is absent.

## 15. Sovereignty assessment

### PASS

- Rust, SQLx, PostgreSQL, `pgcrypto`, RFC 8785 and SHA-256 are open, portable
  building blocks with acceptable licenses; `pgcrypto` is available on the
  declared Clever Cloud target.
- Production residency remains on Clever Cloud in the declared EU region.
- RLS, forced least privilege, content-free storage, bounded exports,
  retention, deletion and restore are designed as blocking proofs.
- The pure authority remains independent of the persistence library and any
  orchestration framework.

### WARN — intentional closed boundary

Biscuit request authorization, secret acquisition, endpoint construction,
zero-PII runtime observability, service startup orchestration and an authorized
incremental-state boundary are not yet implemented. Consequently this crate
cannot be wired to a production request or open a real run. Treating injected
construction of a deletion command as production authorization, or treating
the `O(n)` proof append as an unmeasured production hot path, would be a
security/quality violation, not an integration shortcut.

### FAIL

No known sovereignty failure is accepted by this design. Introducing a US
hyperscaler control plane, AGPL/SSPL dependency, application superuser,
unbounded export, raw-content column, framework checkpoint or mutable event
would invalidate the design and require a new decision.

## 16. Rollback and migration discipline

Code rollback removes the crate consumer while leaving already persisted
canonical evidence readable. Applied migrations are never reversed by a down
migration that deletes evidence or tombstones. Schema correction is additive
and forward-only. Event bytes are never rewritten to fit a new implementation;
a new contract generation must append new evidence under separately authorized
semantics.

This makes application rollback high-reversibility and evidence rollback
deliberately impossible. The asymmetry is required for audit integrity.

## 17. Rejected alternatives

### Complete runtime service now

Rejected on security and quality. It would make RLS, request authorization,
secret handling, runtime logs and external-effect boundaries fail together and
would prevent attributing a proof failure to one authority.

### TypeScript persistence adapter

Rejected on quality and architectural authority. It conflicts with the Rust
runtime decision, duplicates native domain conversion and makes the future
service dependent on an implementation pattern rather than the PostgreSQL
barrier itself.

### Store JSONB as replay authority

Rejected on quality. JSONB is useful for queries but cannot preserve the exact
canonical byte evidence required by the locked replay acceptance. Extracted
relational columns are sufficient for bounded queries.

### Put persistence in the pure root crate

Rejected on security. It would widen a reviewed effect-free capability
boundary and make every pure consumer transitively depend on database runtime
features.

### Introduce a generic repository or event-store abstraction

Rejected as premature abstraction. Only PostgreSQL is authorized, and fewer
than three concrete backends exist. A generic layer would hide transaction/RLS
semantics that must remain explicit and reviewed.

## 18. Acceptance and stopping point

The design is satisfied only when the exact reviewed implementation proves:

1. canonical events append atomically and replay byte-identically;
2. concurrent writers cannot create two accepted successors;
3. forced RLS denies cross-organization access through every public path;
4. application privilege cannot mutate evidence or access tombstones;
5. queries and exports are cursor-bounded and need-to-know;
6. retention is equal to the mission fact and bounded by `P6Y`;
7. deletion writes a content-free `P35D` tombstone atomically;
8. restore applies tombstones before records and proves non-resurrection;
9. public diagnostics contain only closed codes;
10. the pure crate API/capability and locked Contracts authority remain
    unchanged;
11. no service, effect, worker or framework capability has entered scope;
12. all repository, coverage, dependency and real-PostgreSQL gates are green.

After the independent dossier is produced, work stops before merge for the
owner's ADR-0011 D4 pronouncement. The next packages — native incremental
checkpointing, Biscuit authorization, runtime service/connection construction,
Harness execution safety, zero-PII operational diagnostics and deployment —
remain separately closed. LangGraph continues to serve only as a removable
oracle of questions and failure scenarios.
