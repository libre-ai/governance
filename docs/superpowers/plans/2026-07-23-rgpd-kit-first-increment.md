# rgpd-kit First Increment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the rgpd-kit walking skeleton — typed RGPD models + `DataSubjectRightsPort` + Art. 30/DPIA scaffolding — and its first adopter (Sessions: port implementation, per-context migrations, unmounted request handler), fully TDD, merged to `main`.

**Architecture:** Option A from the design (`docs/superpowers/specs/2026-07-23-rgpd-kit-first-increment-design.md`): `packages/rgpd-kit` is pure types + fail-closed validators + scaffolding generators with **zero persistent tables and zero runtime dependencies**. Each PII-bearing product implements `DataSubjectRightsPort` in its own bounded context with its own migrations and deletion receipts. Sessions is the first adopter.

**Tech Stack:** Bun 1.4.0 (repo-local), TypeScript strict, bun:test, PGlite integration tests via `@libre-ai/testing`, `@libre-ai/data` deletion infrastructure.

## Global Constraints

- Toolchain: `export PATH="$HOME/notebook-qualification/runtime-bfc9e4c/bun/bun-darwin-aarch64:$PATH"` before every bun command (repo-local Bun 1.4.0). <!-- allow-local-path rationale: PATH is session-local, never committed to a tracked file -->
- Every commit carries `Signed-off-by: Constantin Jais <cjais@pm.me>` (DCO gate scans the full range).
- Code and commits in English. `strict: true` TypeScript, biome `ci` clean, no TS enums (const arrays + union types, codebase convention).
- Locked common.v1 patterns are **replicated verbatim** with a reference comment (`contracts/schemas/common.v1.schema.json#/$defs/...`) — never reinvented (see `apps/sessions/src/domain/session-event.ts`).
- No machine-local absolute paths in tracked files.
- REUSE: `packages/**` and `apps/**` are path-covered (REUSE.toml); no per-file headers needed.
- `packages/rgpd-kit` MUST have no `migrations/` directory, no SQL, no runtime dependencies (bounded-context hard rule, design §2).
- The Sessions data-subject request handler is **NOT mounted** on the public cockpit routes (`createSessionsHandler`): the Sessions runtime boundary is locked until WP-G3-S01's `sessions-authz-review` human gate. The handler is a tested, exported factory.
- Walking skeleton (owner decisions 2026-07-23): consent = simplified model with per-purpose Art. 7(4) extensibility; DPIA = scaffold only, no CI wiring; legal hold = documented + deferred; restriction/portability in Sessions = typed refusal, documented as deferred.
- Work-package registry (`docs/transformation/work-packages.v1.json`) is locked at 27 entries and MUST NOT be modified (the gate validates the registry, not the diff; precedent: collab-core #211).
- Local gate sequence before push: `bun run typecheck` && `bun run lint` && `bun test` && `bun tools/quality/check-secret-scan.ts` && `bun tools/quality/check-no-clever-production.ts` && `bun tools/quality/check-no-transmission.ts`.

## Reality deltas vs the design doc (locked here, to be echoed in the PR)

1. **Sessions lives in `apps/sessions`**, not `packages/sessions`.
2. **`session_events` is structurally append-only** (`GRANT SELECT, INSERT` only — no UPDATE/DELETE for `libre_ai_app`). Art. 17 erasure therefore = logical inaccessibility inside the accepted transaction (tombstone row + deletion receipt via `executeActiveDeletion`), physical compaction deferred to the owner-scoped retention path — exactly DATA-LIFECYCLE §Explicit deletion ("Physical compaction may follow, but logical access … removed in the accepted transaction"). The design's "anonymize events" (UPDATE) is impossible and wrong against this floor.
3. **Retention rule id** is `sessions-content` (contracts/data/retention.v1.json), not `retention_sessions_90d`.
4. **Const unions, not enums**; port results are discriminated unions (`fulfilled` | `refused`) matching the codebase's typed-refusal style (`SessionCommandResult`), instead of thrown exceptions.
5. Sessions RGPD tables are namespaced `session_deleted_subjects` / `session_subject_audit` (they share a schema with `packages/data` tables in integration tests).
6. DPIA markdown template lives at `packages/rgpd-kit/docs/aida-template.md` (design §9 criterion path), not `docs/superpowers/specs/`.

---

### Task 1: Package scaffold + data categories

**Files:**

- Create: `packages/rgpd-kit/package.json`
- Create: `packages/rgpd-kit/src/data-category.ts`
- Test: `packages/rgpd-kit/src/data-category.test.ts`

**Interfaces:**

- Produces: `DATA_CATEGORIES`, `DataCategory`, `LEGAL_BASES`, `LegalBasis`, `ERASURE_SCOPES`, `ErasureScope`, `DataCategoryDeclaration`, `validateDataCategoryDeclaration(input: unknown): DataCategoryDeclaration`, `InvalidDataCategoryDeclarationError`.

- [ ] **Step 1: package.json** (mirror `packages/collab-core/package.json`, no dependencies):

```json
{
  "name": "@libre-ai/rgpd-kit",
  "version": "0.1.0",
  "description": "Transverse RGPD compliance brick — typed models, data-subject-rights ports, Art. 30 and DPIA scaffolding. Pure types: no tables, no I/O; each product implements the port in its own bounded context.",
  "private": true,
  "license": "EUPL-1.2",
  "type": "module",
  "keywords": ["libre-ai", "rgpd", "gdpr", "data-subject-rights", "compliance"],
  "homepage": "https://libre-ai.fr",
  "repository": {
    "type": "git",
    "url": "https://github.com/libre-ai/libre-ai.git",
    "directory": "packages/rgpd-kit"
  },
  "publishConfig": { "access": "public" },
  "engines": { "bun": ">=1.4.0" },
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "check:bun": "bun ../../tools/quality/check-bun-minimum.ts",
    "pretest": "bun run check:bun",
    "test": "bun test"
  }
}
```

- [ ] **Step 2: failing test** `data-category.test.ts` — validator accepts a complete declaration, rejects: unknown category, unknown legal basis, unknown erasure scope, empty description, malformed retention rule id, non-object input.
- [ ] **Step 3: run** `bun test packages/rgpd-kit` → FAIL (module missing).
- [ ] **Step 4: implement** `data-category.ts`: const arrays + unions per the header above; `retentionRule` checked against `/^[a-z][a-z0-9-]*$/` (ids of contracts/data/retention.v1.json); fail-closed `InvalidDataCategoryDeclarationError` naming the failing field, never echoing free-text values.
- [ ] **Step 5: run** → PASS. `bun install` once so the workspace links the new package.
- [ ] **Step 6: commit** `feat(rgpd-kit): data-category taxonomy and fail-closed declaration validator` (sign-off).

### Task 2: Opaque subject digest

**Files:**

- Create: `packages/rgpd-kit/src/subject-digest.ts`
- Test: `packages/rgpd-kit/src/subject-digest.test.ts`

**Interfaces:**

- Produces: `deriveSubjectDigest(tenantId: string, subjectIdentifier: string): Promise<string>` (64-hex sha-256, domain-separated `libre-ai.rgpd.subject.v1:{tenantId}:{identifier}`), `isOpaqueSubjectDigest(value: string): boolean`, `InvalidSubjectIdentifierError`, `MalformedTenantIdError` (local replica message, tenant pattern from common.v1).

- [ ] Steps: failing test (determinism; different tenants → different digests; different identifiers → different digests; output matches `/^[a-f0-9]{64}$/`; rejects malformed tenant, empty/oversized (>320 chars) identifier) → RED → implement with `crypto.subtle.digest` (pattern: `packages/auth-web/src/session/digest.ts`) → GREEN → commit `feat(rgpd-kit): opaque tenant-scoped subject digest (never plaintext PII)`.

### Task 3: Data-subject request models

**Files:**

- Create: `packages/rgpd-kit/src/data-subject-request.ts`
- Test: `packages/rgpd-kit/src/data-subject-request.test.ts`

**Interfaces:**

- Produces: `DATA_SUBJECT_RIGHT_TYPES` (`access | rectification | erasure | restriction | portability | object`), `REQUEST_CHANNELS` (`web-form | email | api`), `REQUEST_STATUSES` (`received | acknowledged | in-progress | fulfilled | refused`), `DataSubjectRequest` (requestId, subjectDigest, rightType, tenantId, receivedAt, submittedVia, status, deadline, refusalReason?), `computeResponseDeadline(receivedAt: string): string` (+30 days, Art. 12(3)), `validateDataSubjectRequest(input: unknown): DataSubjectRequest`, refusal code pattern `/^[a-z][a-z0-9-]*\.[a-z0-9_.-]+$/` (owner-prefixed, like `sessions.rgpd.subject_unknown`), and the port result unions:
  - `RgpdRefusal { status: "refused"; requestId; refusal }`
  - `AccessRequestResult = { status:"fulfilled"; requestId; subjectDigest; dataExport: unknown; exportedAt; categories: readonly DataCategory[]; completenessNote?: string } | RgpdRefusal`
  - `ErasureRequestResult = { status:"fulfilled"; requestId; subjectDigest; erasedAt; deletionReceiptId; recordsAffected: number; categoriesErased: readonly DataCategory[] } | RgpdRefusal`
  - `RestrictionRequestResult = { status:"fulfilled"; requestId; restrictedAt; affectedRecords: number } | RgpdRefusal`
  - `PortabilityRequestResult = { status:"fulfilled"; requestId; dataExport: unknown; format: string; exportedAt } | RgpdRefusal`
- Timestamps validated with the RFC 3339 pattern replicated from `session-event.ts` (common.v1 `timestamp`).

- [ ] Steps: failing tests (deadline = receivedAt + P30D exact ISO; validator round-trips a full request; rejects each malformed field incl. bad digest, bad tenant, bad timestamp, unknown right type/channel/status; refusal code pattern enforced) → RED → implement → GREEN → commit `feat(rgpd-kit): typed data-subject request models and Art. 12(3) deadline`.

### Task 4: Consent lifecycle (simplified, Art. 7(4)-extensible)

**Files:**

- Create: `packages/rgpd-kit/src/consent.ts`
- Test: `packages/rgpd-kit/src/consent.test.ts`

**Interfaces:**

- Produces: `ConsentRecord` (consentId, subjectDigest, tenantId, grantedAt, grantedVia: `explicit-form | api-endpoint | web-form`, grantedFor: { purposes: readonly string[]; categories: readonly DataCategory[]; duration: string }, withdrawnAt?, withdrawnVia?: `web-form | api-endpoint | email`, proofOfConsent?: { documentDigest; versionHash }), `ConsentWithdrawal`, `isConsentActiveAt(record: ConsentRecord, atIso: string, purpose: string): boolean` (per-purpose granularity = the Art. 7(4) extension point), `InvalidConsentPeriodError`.
- ISO 8601 period parsing is fail-closed and minimal: `/^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/` with ≥1 component (UTC date arithmetic); anything else throws.

- [ ] Steps: failing tests (active within window for a granted purpose; inactive for a purpose not granted — per-purpose Art. 7(4); inactive after withdrawal; inactive after duration expiry `P1Y`; malformed period throws; withdrawal before grant → never active) → RED → implement → GREEN → commit `feat(rgpd-kit): simplified consent lifecycle with per-purpose Art. 7(4) checks`.

### Task 5: DataSubjectRightsPort + contract test

**Files:**

- Create: `packages/rgpd-kit/src/ports/data-subject-rights.ts`
- Test: `packages/rgpd-kit/src/ports/data-subject-rights.test.ts`

**Interfaces:**

- Produces `DataSubjectRightsPort`:

```ts
export interface DataSubjectRightsPort {
  verifySubject(
    tenantId: string,
    subjectIdentifier: string,
  ): Promise<string | null>;
  handleAccessRequest(
    tenantId: string,
    subjectDigest: string,
  ): Promise<AccessRequestResult>;
  handleErasureRequest(
    tenantId: string,
    subjectDigest: string,
  ): Promise<ErasureRequestResult>;
  handleRestrictionRequest(
    tenantId: string,
    subjectDigest: string,
  ): Promise<RestrictionRequestResult>;
  handlePortabilityRequest(
    tenantId: string,
    subjectDigest: string,
  ): Promise<PortabilityRequestResult>;
  listDataCategories(
    tenantId: string,
    subjectDigest: string,
  ): Promise<readonly DataCategoryDeclaration[]>;
}
```

- [ ] Steps: contract test builds an in-memory reference implementation (Map-backed, no I/O) and drives the full lifecycle through the **port type only** (verify → access → erase → access refused `test-product.rgpd.subject_erased`, erase again refused) — this is the acceptance proof that a new product can implement the port without new types → RED → implement (interface + doc comments stating the authorization precondition: callers authorize BEFORE invoking, same boundary as `executeActiveDeletion`) → GREEN → commit `feat(rgpd-kit): DataSubjectRightsPort contract and in-memory reference adopter`.

### Task 6: Art. 30 register scaffolding

**Files:**

- Create: `packages/rgpd-kit/src/art30-register.ts`
- Test: `packages/rgpd-kit/src/art30-register.test.ts`

**Interfaces:**

- Produces: `ProcessingActivity` (design §4.3, with `legalBasis: LegalBasis`, `subjectRightsImplemented: readonly DataSubjectRightType[]`, `dataSubjectType: "end-user" | "employee" | "visitor" | "lead"`, optional `transfersOutsideEU { country; mechanism: "adequacy" | "scc" | "binding-corporate-rules" | "derogation" }`, optional `dpaAssessmentDate`), `validateProcessingActivity(input: unknown): ProcessingActivity`, `generateArt30Register(activities: readonly ProcessingActivity[]): string` — deterministic markdown (sorted by product then name), one section per activity, header noting Art. 30 GDPR.

- [ ] Steps: failing tests (validator accepts the Sessions fixture / rejects bad fields; generated markdown is byte-exact against an inline expected string for a 2-activity fixture, proving deterministic ordering) → RED → implement → GREEN → commit `feat(rgpd-kit): Art. 30 processing-register model and markdown generation`.

### Task 7: DPIA scaffold (Art. 35) + template doc

**Files:**

- Create: `packages/rgpd-kit/src/aida-template.ts`
- Create: `packages/rgpd-kit/docs/aida-template.md`
- Test: `packages/rgpd-kit/src/aida-template.test.ts`

**Interfaces:**

- Produces: `DPIAAssessment` (design §4.4 with `categories?: readonly DataCategory[]`, risks: `{ description; severity: "low" | "medium" | "high"; mitigation }[]`, approvedBy?: `{ role: "owner" | "dpo" | "legal"; date; name }`), `createDpiaScaffold(input: { id: string; product: string; scope: string; date: string; version: string }): DPIAAssessment` (all Art. 35(3) questions initialized `yesNo: false`, empty risks, no approval — owner fills and signs manually, per owner decision: scaffold only, no CI wiring).
- `docs/aida-template.md`: markdown skeleton mirroring the type (sections: scope, Art. 35(3) questions, risks table, sign-off), with an explicit note that approval is a manual owner act.

- [ ] Steps: failing test (scaffold returns unapproved, all-false assessment carrying the inputs verbatim) → RED → implement + write template doc → GREEN → commit `feat(rgpd-kit): DPIA scaffold and manual assessment template (Art. 35)`.

### Task 8: Package index + README

**Files:**

- Create: `packages/rgpd-kit/src/index.ts` (re-export every public symbol of Tasks 1–7)
- Create: `packages/rgpd-kit/README.md`

README MUST cover: purpose; the bounded-context hard rule (per-context/per-DB, NO centralized erasure table, rgpd-kit persists nothing — design §2 + Appendix A); the opaque-digest rule (Appendix B); the Sessions adoption example (port impl + own migrations + own receipts); how a new product adopts (import port + types, implement, test — design §9 criterion); deferred items (consent automation, DPIA workflow/CI, cross-product audit view, subject-verification SLA, **legal hold: documented in ADR-0002/DATA-LIFECYCLE §Legal hold, implementation deferred**, Sessions restriction/portability); the append-only erasure semantics (logical inaccessibility + receipt in the accepted transaction, physical compaction via the retention path).

- [ ] Steps: write both → `bun run typecheck && bun run lint && bun test packages/rgpd-kit` → GREEN → commit `feat(rgpd-kit): public index and bounded-context usage guide`.

### Task 9: Sessions RGPD migration (per-context tables)

**Files:**

- Create: `apps/sessions/migrations/0002_rgpd.sql`
- Test: `apps/sessions/src/rgpd/migration.integration.test.ts`

Tables (both `FORCE ROW LEVEL SECURITY`, tenant-format CHECK replicated, `GRANT SELECT, INSERT` only — tombstones and audit are append-only evidence, like `deletion_receipts`):

```sql
CREATE TABLE session_deleted_subjects (
  tenant_id text NOT NULL
    CONSTRAINT session_deleted_subjects_tenant_format CHECK (tenant_id ~ '^ten_[a-z0-9]{16,64}$'),
  subject_digest text NOT NULL
    CONSTRAINT session_deleted_subjects_digest_format CHECK (subject_digest ~ '^[a-f0-9]{64}$'),
  receipt_id text NOT NULL,
  deleted_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, subject_digest)
);

CREATE TABLE session_subject_audit (
  tenant_id text NOT NULL
    CONSTRAINT session_subject_audit_tenant_format CHECK (tenant_id ~ '^ten_[a-z0-9]{16,64}$'),
  request_id text NOT NULL,
  subject_digest text NOT NULL
    CONSTRAINT session_subject_audit_digest_format CHECK (subject_digest ~ '^[a-f0-9]{64}$'),
  right_type text NOT NULL CONSTRAINT session_subject_audit_right_enum CHECK (right_type IN
    ('access', 'rectification', 'erasure', 'restriction', 'portability', 'object')),
  status text NOT NULL CONSTRAINT session_subject_audit_status_enum CHECK (status IN
    ('received', 'acknowledged', 'in-progress', 'fulfilled', 'refused')),
  detail text,
  recorded_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, request_id, status)
);
```

(`detail` carries refusal codes only — never PII/plaintext; comment says so.) RLS policies identical in shape to `session_events_tenant_isolation`.

- [ ] Steps: failing integration test (PGlite + data migrations + sessions migrations: cross-tenant SELECT returns nothing under the app role; UPDATE and DELETE on both tables rejected; malformed tenant/digest rejected by CHECK) → RED → write migration → GREEN → commit `feat(sessions): per-context RGPD tombstone and subject-audit tables (append-only, RLS)`.

### Task 10: Sessions DataSubjectRightsPort implementation

**Files:**

- Create: `apps/sessions/src/rgpd/data-subject-rights.ts`
- Modify: `apps/sessions/package.json` (add `"@libre-ai/rgpd-kit": "workspace:*"` dependency)
- Test: `apps/sessions/src/rgpd/data-subject-rights.integration.test.ts`

**Interfaces:**

- Consumes: `DataSubjectRightsPort` + result unions + `deriveSubjectDigest` (rgpd-kit); `executeActiveDeletion`, `withTenantDbTransaction`, `InMemoryProjectionCache`, `InMemoryBlobStore`, `getDeletionReceipt`, `SqlExecutor` (`@libre-ai/data`).
- Produces:

```ts
export interface SessionsRgpdDeps {
  readonly executor: SqlExecutor;
  readonly cache: ProjectionCachePort;
  readonly blobs: BlobStorePort;
  readonly now: () => string; // injected clock, ISO
  readonly newRequestId: () => string;
}
export function createSessionsDataSubjectRights(
  deps: SessionsRgpdDeps,
): DataSubjectRightsPort;
```

Behavior (each method opens its own `withTenantDbTransaction`, except erasure which delegates the transaction to `executeActiveDeletion`):

- `verifySubject`: `SELECT DISTINCT actor_id FROM session_events WHERE actor_kind = 'human'` (RLS scopes the tenant), exact match on identifier → `deriveSubjectDigest(tenantId, actorId)`, else null.
- digest→actors resolution (shared helper): digest every distinct human `actor_id`, keep matches. O(distinct actors) — acceptable at walking-skeleton scale, keeps the port digest-only (no plaintext in signatures).
- `handleAccessRequest`: refused `sessions.rgpd.subject_erased` if tombstoned; refused `sessions.rgpd.subject_unknown` if no actor matches; else export `{ schemaVersion: "libre-ai.sessions.subject-export.v1", events: [...] }` (rows authored by the subject), categories `["communication", "audit", "timestamp"]`.
- `handleErasureRequest`: resolve + refuse (typed) if unknown or already tombstoned; else `executeActiveDeletion` with `deleteActiveRows` = count subject rows + `INSERT INTO session_deleted_subjects`; receipt persisted by the platform; result carries `deletionReceiptId = receipt.id`, `erasedAt = receipt.completedAt`, `recordsAffected`, `categoriesErased`. Refusals inside the callback throw sentinel errors, caught and mapped to `RgpdRefusal` (transaction rolled back).
- `handleRestrictionRequest` / `handlePortabilityRequest`: `{ status: "refused", refusal: "sessions.rgpd.not_implemented" }` — deferred, documented.
- `listDataCategories`: three `DataCategoryDeclaration`s (communication/audit/timestamp), `legalBasis: "contract"`, `retentionRule: "sessions-content"`, `erasureScope: "deferred"` (append-only log: logical erasure immediate, physical compaction deferred — comment explains).

- [ ] Steps: failing integration tests on PGlite (seed a session stream with two human actors across two tenants via `validateEvent` fixtures; verify → digest; access exports only the subject's rows and only in their tenant; erasure → tombstone present + receipt retrievable via `getDeletionReceipt` + `recordsAffected` correct; second erasure refused `sessions.rgpd.already_erased`; access after erasure refused `sessions.rgpd.subject_erased`; unknown subject refused; cross-tenant: tenant B sees nothing of tenant A) → RED → implement → GREEN → commit `feat(sessions): DataSubjectRightsPort adoption — erasure as logical inaccessibility + deletion receipt`.

### Task 11: Sessions data-subject request handler (unmounted) + audit trail

**Files:**

- Create: `apps/sessions/src/rgpd/request-handler.ts`
- Test: `apps/sessions/src/rgpd/request-handler.integration.test.ts`

**Interfaces:**

- Consumes: `DataSubjectRightsPort`, `validateDataSubjectRequest`/`computeResponseDeadline`/`deriveSubjectDigest` (rgpd-kit), `SessionPrincipal` + `authorizeAction`-style deny-by-default (reuse the authz matrix: erasure requires the `delete` operation, access requires `read`), `withTenantDbTransaction`.
- Produces: `createDataSubjectRequestHandler(deps): (request: Request) => Promise<Response>` where deps = `{ port, executor, principal, now, newRequestId }`.

Behavior: POST-only (405 otherwise); fail-closed JSON body validation (`{ rightType, subjectIdentifier, tenantId }`, `submittedVia: "api"`); deny-by-default authorization BEFORE any I/O (403 on refusal); `verifySubject` (unverifiable → audit `refused` + 404 envelope, no oracle detail); audit row `received` then dispatch to the port; terminal audit row `fulfilled`/`refused`; response envelope `{ data: { requestId, status, deadline, result }, meta: { refusal? } }`. `subject_audit.detail` = refusal code only. **Not mounted** in `createSessionsHandler` — a comment + README state the locked runtime boundary (WP-G3-S01 `sessions-authz-review`).

- [ ] Steps: failing integration tests (end-to-end erasure: 200, receipt id in body, tombstone + both audit rows persisted; access flow; unverifiable subject → 404 + audit `refused`; unauthorized role (observer requesting erasure) → 403, no audit `received` row, nothing mutated; malformed body → 400; GET → 405) → RED → implement → GREEN → commit `feat(sessions): data-subject request handler with append-only audit trail (unmounted: locked runtime boundary)`.

### Task 12: Sessions Art. 30 entry + READMEs

**Files:**

- Create: `apps/sessions/art30-register.json`
- Modify: `apps/sessions/README.md` (RGPD section)
- Test: `apps/sessions/src/rgpd/art30-entry.test.ts`

`art30-register.json` = one `ProcessingActivity`: name "Sessions collaborative events", product "libre-ai/sessions", dataCategories `["communication", "audit"]`, purposes `["collaborative-work", "compliance-audit"]`, legalBasis "contract", recipients `["internal agents"]`, retentionRule "sessions-content", dataSubjectType "end-user", subjectRightsImplemented `["access", "erasure"]` (restriction deferred — honest, diverges from design §5.4 example), dpaAssessmentDate omitted (DPIA not yet drafted — scaffold only).

Test: the JSON file parses, passes `validateProcessingActivity`, and `generateArt30Register([entry])` renders. README section: consent model (organizational tenant, membership-implied, per Art. 7(4) extension path), retention rule reference, erasure semantics (logical + receipt, compaction via retention path), deferred rights.

- [ ] Steps: RED → write JSON + README → GREEN → commit `feat(sessions): Art. 30 processing-register entry and RGPD documentation`.

### Task 13: Full local gates + PR

- [ ] `bun run typecheck` && `bun run lint` && `bun test` (full workspace) && `bun tools/quality/check-secret-scan.ts` && `bun tools/quality/check-no-clever-production.ts` && `bun tools/quality/check-no-transmission.ts` — raw outputs, no self-declared green.
- [ ] Commit the plan + push `feat/rgpd-kit-first-increment`, open PR titled `feat(rgpd-kit): first increment — typed models, DataSubjectRightsPort, Sessions adoption` with the reality-deltas section, walking-skeleton scope, and invariant statement (per-context/per-DB, no centralized table).
- [ ] CI: Licensing + Bun quality + Rust quality green (escape hatch if pull_request event missed: `gh pr close/reopen`).

### Task 14: K4 adversarial review (reviewer ≠ implementer) + merge

- [ ] Dispatch an independent adversarial review agent (fresh context, no implementation history) over the PR diff with the four axes + the three invariants (no cross-context table, port-only coupling, PII-only scope) + append-only/RLS verification + no-PII-in-logs/audit rows. Findings triaged: fix Critical/Important before merge.
- [ ] Re-run gates after any fix; squash-merge with DCO trailer in the merge message; delete branch; clean the worktree.
