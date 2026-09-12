# ADR-0042 — Minimal Auth lookup followed by organization RLS

- **Status:** proposed, unmerged. Owner choice received 2026-09-12; adoption still
  requires the owner's I-17 signature by merge after immutable role-separated review.
- **Date:** 2026-09-12
- **Invariant:** I-33.
- **Decision:** D47.
- **Choice:** minimal pre-authentication index, then organization RLS. This choice
  is acquired; this candidate records it without requesting another GO.
- **Scope:** Auth session/bootstrap persistence responsibilities inside Missions. No SQL, service,
  production credential, provider, provisioning or data-processing permission is
  created by authoring or checking this document.

## Context and authority

Opaque browser cookies and pre-authentication OIDC callbacks must resolve identity
before an organization is known. DATA-LIFECYCLE requires organization ownership and
forbids global product SQL/API/job queries; IDENTITY-AUTHORIZATION requires cookie
lookup, one-use OIDC verification and subject mapping. Existing in-memory global
lookup ports do not grant a PostgreSQL exception to those rules.

The owner selected the narrower boundary: exact minimal bootstrap lookup followed
by full session and membership access under FORCE RLS. The alternative of a general
cross-organization Auth gateway is not selected. This ADR specifies the exception
and its limits; moving records into another schema alone grants no authority.

The concrete local design is Missions candidate
`5f6e6acd5f888f67a908117780f42e0e0f3ee0eb`,
`docs/auth-durable-design.md` and `docs/auth-durable-plan.md`, based on observed
Missions `fe269e786effa0616248db3384d622d5a1a1a694` and reconciled to Sessions-owned
membership projections and ephemeral maintenance scope. The design SHA-256 is
`f0df941e5973abef1d25db6bf4e60d1bc9381723eeb133418b635d6f813fb644`; the plan
SHA-256 is `e82e5e94fbacdc769c59ff7e2cd27ef231ec8aeff1a7cd95f5e3e63e26ae1908`.
These are engineering inputs,
not canonical contract or production evidence. The private authority review records
its exact source hashes. Governance owns this boundary; Contracts owns the Auth
wire schemas, HTTP contract and retention policies. Their locked bytes are unchanged.

DATA-LIFECYCLE names **Sessions as the owner of memberships**. That ownership is
unchanged. Auth consumes independently current membership facts through a qualified
versioned, digest-bound projection; it does not create a second membership source
of truth or query Sessions tables directly. References below to Auth membership
storage mean this rebuildable projection. Any local design wording suggesting
Auth-owned authoritative membership must be corrected before implementation.

## Narrow prospective exception

On adoption, the general organization-before-query rule is refined only for these
Auth bootstrap operations. Full product records, sessions and memberships never
enter the exception.

| Bootstrap object | Allowed address and result | Excluded data and access |
| --- | --- | --- |
| Session locator | Exact keyed cookie digest to at most one opaque organization/session id | No roles, profile, status, payload, count, search or listing |
| One-use OIDC transaction | Exact separately keyed transaction-cookie digest to bounded unexpired state/nonce/PKCE verifier/local return path; atomic consume | No invented organization, reusable credentials, provider tokens, arbitrary redirect or global read |
| Verified-subject locator | Exact approved issuer/subject digest to at most one opaque organization/user tuple, only after callback verification | No caller-selected organization, role claims, profile, first-of-many selection or browser-role invocation |
| Maintenance scope proof | Independently verified binding of a principal or ephemeral operational capability to one organization, one closed operation family and expiry | No worker-appointed scope, wildcard organization, arbitrary grant or product data; persistent scope storage is not required |

These addresses and results remain private; hashing an identity does not make it
public or non-personal. The locator retains exactly the minimal fields. Unknown,
ambiguous, inconsistent or unavailable resolution refuses, with no scan of full
records as a fallback. A digest lookup is bootstrap evidence, not session validity
or current authorization. A second active subject mapping cannot silently select
an organization. A multi-organization selection protocol is outside this decision.

OIDC permits only bounded insert, exact atomic consume and a separately granted
bounded expiry sweep of that pre-auth class. The sweep may not return sensitive
state, enumerate sessions/memberships or inherit general cross-organization rights.
Persistent OIDC and any new metadata class remain blocked on Contracts retention
review described below; this exception is not its own retention policy.

## Closed functions and organization isolation

Full session tables and the derived Auth membership projection require non-null organization ownership,
organization-inclusive keys, ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY.
Both read and write policies enforce the derived organization. Public or absent
organization context refuses. Locator creation, digest rotation and row deletion
are transactionally coupled to the authoritative row; no committed orphan or stale
mapping may authenticate a request.

The callable database surface is closed and split by caller capability:

| Capability | Exact operation family |
| --- | --- |
| Browser Auth request | `resolve_session_digest(digest)`, `read_session(digest)`, `save_session_cas(digest, expected_revision, bounded_change)`, `revoke_session(digest)` |
| OIDC start/consume | `begin_oidc(bounded_state)`, `consume_oidc(transaction_digest)` |
| Trusted callback verifier | `resolve_verified_subject(subject_digest)`, `create_session_from_verified_identity(verified_identity, bounded_session_material)` |
| Scoped membership projection writer | Apply independently authenticated Sessions facts or invalidation to an exact organization/user projection with expected projection revision; never originate membership decisions |
| Scoped retention worker | Bounded due-session pruning in its controller-bound organization; a distinct grant covers only OIDC expiry sweeping |

These names describe the reviewed internal capability contract, not new public
HTTP routes. `bounded_change` is exactly idle slide, CSRF digest refresh, cookie
rotation or expiry marking. It cannot change organization, identity, createdAt,
absolute expiry or authoritative membership, and is never SQL, a JSON merge, a
column/table name or an arbitrary callback. Generic global `list`, `removeByIds`,
caller-selected tenant/id and raw query gateways are excluded. Any implementation
renaming must preserve this surface and prove the binding in its review dossier.

Runtime login roles have no table SELECT/DML, schema/function creation, public
function access or membership enabling escalation to stronger roles. They and all
function owners are NOSUPERUSER and NOBYPASSRLS; runtime logins are NOINHERIT, and
function owners are NOLOGIN. Offline migration ownership never becomes a runtime
connection. No application BYPASSRLS or superuser connection followed by role drop
qualifies this boundary.

Only reviewed static SECURITY DEFINER functions may cross from the minimal lookup
to a full scoped row. Their owner has only the exact object/column rights needed,
remains subject to FORCE RLS, uses trusted fixed search paths with `pg_temp` last,
and cannot run caller-selected SQL or assume arbitrary roles. Default PUBLIC
EXECUTE is revoked atomically with function creation; only exact signatures are
granted. Nested helpers are not separate application capabilities.

A PostgreSQL custom GUC is caller-writable input, not proof. Each function derives
organization from its own valid locator or independently verified maintenance scope and sets
its transaction-local scope itself. It accepts no caller organization override.
Exceptions, cancellation and transaction exit clear scope; a pool connection that
cannot be reset is discarded. Data's existing transaction helpers are reusable
mechanics, not proof that these stronger entry conditions hold.

## Explicit trusted verifier and controller limits

Subject digests are guessable identifiers, not bearer secrets. Only the dedicated
callback verifier may invoke subject mapping after validating one-use state, PKCE,
nonce, signature, exact approved issuer/audience and time. It owns a separate narrow
SQL capability inaccessible from ordinary request executors. A typed local
verification object prevents some programming errors but is not a sandbox or a
cryptographic proof against compromise of that verifier. A verifier compromise is
an authentication-authority compromise; this ADR does not claim RLS prevents it.
No raw identity, caller roles or unverified `verified: true` flag qualifies creation.

Membership facts are reread under the mapped organization from independently current
Sessions authority or its qualified projection. Missing, stale or unverifiable source
revision refuses; a cached role set is not current authority. Current requests compare
opaque user/organization, revision and exact role set. Sensitive writes require source-revision/freshness proof and serialize
with applied projection changes; locking an Auth projection row alone cannot prove
that no newer Sessions decision exists. Historical login facts never imply current rights.
Session cookies remain separate from service Biscuit authorization; this act adds
neither service grants nor an issuer bridge.

For maintenance, an independently trusted scope authority binds the worker or its
operational capability to exactly one organization and operation family with an
expiry. Closed functions verify that binding independently of worker claims and
GUCs. An authenticated principal binding or a verifiable ephemeral operational
capability may satisfy this obligation; the qualified design must prove the exact
mechanism. No new controller service, persistent scope table, database-role factory
or provisioning infrastructure is selected or required by the owner's choice.
Workers cannot mint scope, create roles or obtain an all-organization credential.
Missing/expired/unverifiable bindings refuse. Scope-issuer compromise and credential
confinement are explicit trust boundaries; a supplied object/hash cannot appoint
its own issuer. No product pool acquires provisioning, arbitrary membership
management or scope-issuer rights.

## Atomicity, retention and restore prerequisites

Creation commits row and locator together. CAS compares the witnessed revision;
rotation updates digest and locator in the same transaction; invalid/expired or
terminal records cannot be rewritten to active. Revocation is a monotone atomic
update of only status, revoked time, canonical reason and revision increment,
guarded only against already-revoked state. A legacy unrelated field or a competing
CAS cannot defeat it. A revoke admitted before concurrent rotation retains its exact
session witness; an old digest cannot begin a new operation after rotation commits.

OIDC consume deletes/takes state atomically before external exchange. A failed
exchange, crash or lost response never restores consumed state. No provider call
holds a DB lock. Pruning is bounded and organization-scoped, rechecks due state under
lock and removes the locator atomically. Operational evidence is aggregate and
content-free; no raw cookie, code, verifier, provider token, identity or SQL exception
is logged.

Existing browser-session retention remains expiry plus at most 24 hours and an
absolute active lifetime at most 12 hours. An untouched idle-expired row and a late
revocation cannot extend that maximum. The executable effective-expiry reconciliation
must be proved in Missions against the existing policy; this ADR assigns no new
retention duration or replacement Contracts interpretation.

Persistent pre-authentication OIDC is a new server data class: a new major retention
candidate and privacy review are mandatory before storing it. Its existing ten-minute
protocol lifetime does not silently supply a durable policy. Session locators cannot
outlive their parent. Auth membership projection contains only currently valid
Sessions facts, is deleted on source invalidation/removal and stores no local
membership history. Source membership retention remains outside Auth's scope;
Auth depends on qualified current-fact, freshness and deletion contracts from Sessions,
not a newly assigned source-retention duration or a P90D assumption.

The bounded maintenance scope may be a verified ephemeral operational capability,
with no persistent storage, backup or content log and therefore no new durable scope
class required here. A future persistent controller/scope registry would require
separate authority and retention review; it is not a prerequisite for this design.
Existing encrypted backups expire within 35 days; no selective restore of deleted
data is permitted. Locked retention sources remain untouched, and this ADR assigns
no next policy version number.

The bounded restore design invalidates all restored browser-session and OIDC rows
and prior cookie/transaction key epochs before reopening. Subject locators rebuild
only from independently current Sessions membership after authorized deletion evidence is
replayed. Missing authority blocks reopening; an old backup cannot prove current
membership or revocation. Preserving browser logins across restore would require
additional independently protected revocation/deletion evidence and its own reviewed
retention authority; that expansion is not authorized here. Key custody, rotation,
backup access and target role provisioning remain unqualified dependencies.

## Required evidence and adoption boundary

Before any durable implementation admission, immutable review must verify the
Governance exception, Contracts retention authority, current Sessions projection contract,
exact SQL roles/functions and trusted verifier/controller confinement. The owner
merge signature remains required for this ADR; a passing check is not that signature.

Real disposable PostgreSQL tests must prove denied global SELECT/DML, SET ROLE/GUC
scope forgery, PUBLIC/search-path/overload attacks, cross-organization access,
unknown/stale locators, conflicting digests, current-membership races, CAS/rotation
versus monotone revoke, one-use OIDC, no-request idle cleanup and scoped prune. Pool
reset, failure between coordinated writes, unknown commit outcome and restore of
pre-revocation/pre-consumption backups must fail closed. Mock SQL or in-memory
passing tests alone cannot establish these properties.

The selected boundary creates no production provider, service, credential, SQL
migration, new public contract, retention data class, real-data processing or
provisioning action in this candidate. Each later bounded implementation requires
its accepted authorities and exact-revision proof. ADR-0040/D45 Orchestrator
persistence, ADR-0041/I-32 portfolio reconstruction and the two-authority separation
remain unchanged.
