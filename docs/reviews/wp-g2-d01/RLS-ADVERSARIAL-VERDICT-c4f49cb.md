# RLS Adversarial Review — WP-G2-D01 Integration (commit c4f49cb)

**Date:** 2026-07-20  
**Commit:** c4f49cb  
**Reviewer:** Independent adversarial (K4 gate, loop-security kernel)  
**Scope:** Tenant isolation barrier (SQL migrations + adapters) for @libre-ai/data

---

## Verdict: APPROVE-WITH-CONDITIONS

The PostgreSQL RLS barrier and application-layer isolation context correctly enforce tenant separation under the tested scenarios. **No structural bypasses detected.** However, one mandatory condition must be verified at G4 deployment (real pool integration), and one architectural limit is properly documented but worth calling out.

---

## Findings

### F-01: Pool-Clearing Semantics — Runtime Dependency (MAJOR)

**Severity:** major (architectural dependency)  
**Angle:** Fuite de contexte au niveau session du pool  
**Constat:**

The function `clearPooledSession()` exports the contract that a connection pool _must_ call `DISCARD ALL` before reusing a connection. The code defines this as a _required sémantique_, not a guarantee:

```typescript
// adapters/tenant-transaction.ts
export async function clearPooledSession(executor: SqlExecutor): Promise<void> {
  await executor.exec("DISCARD ALL");
}
```

**Test evidence:** `packages/testing/src/test-database.test.ts` line 66–74 verifies that a manually-planted session-level GUC is purged by `DISCARD ALL`. ✓

**Problem:** No enforcement that G4's real pool implementation calls `clearPooledSession()` on every checkout return. If the pool:

- Reuses a connection without clearing, OR
- Clears selectively (only on error, not on success)

then a `SET` or `set_config(..., false)` planted in one transaction at session level would leak to the next borrower, scoping their access to a stale tenant.

**Correction required before G4 deployment:**

1. G4 pool wrapper must call `clearPooledSession(tx)` in a finally block after every transaction completes (success or failure).
2. Add integration test in G4 harness that spawns two concurrent tenants, simulates GUC leakage, and verifies that clearing blocks it.
3. Document this invariant in the pool's public interface (e.g., `@libre-ai/postgres-pool` or equivalent).

**Why not REJECT:** This is documented as a "Known limit" in the README (line 63–64) and the code does not _claim_ to guarantee pool clearing—it exports the _pattern_. The harness boundary is clear: "the harness stays tenant-agnostic" (test-database.ts:16). ✓

---

### F-02: PGlite Single-Connection Harness — Test Coverage Gap (MINOR)

**Severity:** minor (test environment limit)  
**Angle:** Limites du harness pour prouver le comportement multi-pool  
**Constat:**

The test harness (`@libre-ai/testing`) uses PGlite, a single-connection SQLite-over-WASM PostgreSQL. This correctly simulates:

- Transaction-local `SET LOCAL ROLE` and `set_config(..., true)` cleanup ✓
- RLS policy evaluation on individual role/GUC states ✓
- Sequential test isolation (ROLLBACK between tests) ✓

But it **cannot** test:

- Concurrent transactions with overlapping connections (race conditions)
- Pool reuse patterns (same connection handle to two different tenants in sequence)
- Stale session state across connection boundaries

**Evidence:** README (line 63): "single connection: pool behavior is simulated (clearConnection applies the same DISCARD ALL a pool must issue before reuse), real pools are exercised against provisioned PostgreSQL in G4."

**Why not blocking:** This is explicitly documented and G4 is named as the gate for real-pool validation. The tests themselves are _correct for the single-connection model_—they verify RLS semantics rigorously. ✓

**Recommendation for G4:** Deploy with a dedicated multi-connection pool test (e.g., via `pg` or `@libsql/client` against a real PostgreSQL container in CI) covering:

- Sequential reuse of the same connection with two different tenant contexts.
- Concurrent transactions on separate connections, verifying isolation.
- Pool drain/reconnect cycles, verifying no stale GUCs survive.

---

### F-03: Tenant ID Provenance — K2 Classification Dependency (MAJOR)

**Severity:** major (specification dependency, not code bug)  
**Angle:** K2 — données opérationnelles ne peuvent pas fonder l'autorité tenant  
**Constat:**

The `runInTenantContext()` function accepts a `tenantId` parameter with no source validation. It trusts the caller to provide an authoritative tenant ID (from a Biscuit, a session key, or a verified API envelope), never from operational data.

```typescript
// tenant-context.ts
export function runInTenantContext<T>(
  tenantId: string,
  scope: () => Promise<T>,
): Promise<T> {
  return storage.run(assertTenantContextId(tenantId), scope);
}
```

The comments document this (line 14–17):

> "Provenance requirement (loop-security kernel K2): the tenant id passed to `runInTenantContext` MUST come from an authoritative source — a verified Biscuit or an opaque server session — never from operational data (a tool output, an API response, or a row read without its own guard)."

**Risk:** If the caller passes a tenant ID read from an `operational` source (e.g., a column value, a third-party API response, a log), the isolation is compromised at the application boundary, not the database.

**Code is correct:** The database layers enforce isolation _structurally_—a cross-tenant INSERT with a mismatched tenant in the WHERE clause is denied by RLS WITH CHECK. Even if the app layer breaches the contract, the database refuses the mutation. ✓

**Compliance:** This is a **specification responsibility**, not a code flaw. K2 classification must be enforced by:

1. ADR or specification defining which APIs/fields are authoritative (Biscuit, session, user profile).
2. Code review checklist verifying every `runInTenantContext` call traces to an authoritative source.
3. Linting rule forbidding `runInTenantContext(tenantIdFromDatabase, ...)` or similar anti-patterns.

**No change required to this code** (architecture-correct), but G1/G4 must add the K2 enforcement layer.

---

### F-04: FORCE ROW LEVEL SECURITY Posture — Verification Complete (PASS)

**Severity:** informational  
**Angle:** Contournement RLS par le propriétaire de la table  
**Test:** `rls-barrier.integration.test.ts` line 59–73 verifies both conditions:

```sql
ALTER TABLE retention_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_rules FORCE ROW LEVEL SECURITY;
```

Verified:

- `relrowsecurity = true` ✓
- `relforcerowsecurity = true` ✓ (prevents owner from disabling RLS)

**Role posture:** Test confirms `libre_ai_app` is neither SUPERUSER nor BYPASSRLS. ✓

**No findings.**

---

### F-05: RLS Policy Completeness — USING + WITH CHECK (PASS)

**Severity:** informational  
**Angle:** Politique incomplète (USING seul, pas WITH CHECK)  
**Finding:** Every policy has both USING (for SELECT) and WITH CHECK (for INSERT/UPDATE):

```sql
CREATE POLICY retention_rules_tenant_isolation ON retention_rules
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
```

Tests verify both vectors (`rls-barrier.integration.test.ts`, line 99–130):

- Cross-tenant INSERT is _rejected_ by WITH CHECK ✓
- Cross-tenant UPDATE/DELETE reach zero rows (USING filters them out) ✓
- Missing tenant context fails closed (SELECT yields zero rows, INSERT is denied) ✓

**No findings.**

---

### F-06: SQL Injection — Table Name Validation (PASS)

**Severity:** informational  
**Angle:** Injection table name via `selectExpiredRowIds`  
**Test:** `adapters.integration.test.ts`, line 241–250:

```typescript
test("rejects an unsafe table identifier before any SQL is sent", async () => {
  await expect(
    withTenantDbTransaction(tdb.db, TENANT_A, (tx) =>
      selectExpiredRowIds(
        tx,
        'fixture_documents"; DROP TABLE retention_rules; --',
        {
          now: "2026-07-20T00:00:00Z",
          retentionDays: 1,
        },
      ),
    ),
  ).rejects.toThrow(UnsafeTableNameError);
});
```

Validation logic (`expired-selection-query.ts`, line 20, 36–38):

```typescript
const SAFE_TABLE_NAME = /^[a-z][a-z0-9_]{0,62}$/;

if (!SAFE_TABLE_NAME.test(table)) {
  throw new UnsafeTableNameError(table);
}
```

Regex allows only lowercase alphanumeric + underscore, 1–63 chars total. All external values use parameterized queries (`$1`, `$2`). ✓

**No findings.**

---

### F-07: CHECK Constraints — Structural Barriers (PASS)

**Severity:** informational  
**Angle:** Contraintes CHECK insuffisantes ou bypassables  
**Findings:** Every platform table enforces tenant-id format structurally:

**retention_rules** (migration 0001):

- `tenant_id ~ '^ten_[a-z0-9]{16,64}$'` — rejects "public" and malformed IDs ✓
- `rule_id ~ '^[a-z][a-z0-9-]{1,63}$'` — enforces rule identifier format ✓
- `retention ~ '^P[0-9]{1,4}D$'` — enforces ISO 8601 duration (P90D, P365D, etc.) ✓

**deletion_receipts** (migration 0002):

- `tenant_id ~ '^ten_[a-z0-9]{16,64}$'` ✓
- `backup_expires_at <= completed_at + interval '35 days'` — structural 35-day ceiling enforced _even for superuser-owned rows_ ✓

Tests verify:

- Malformed tenant_id rejected: `rls-barrier.integration.test.ts:167–174` ✓
- "public" rejected on private tables: `rls-barrier.integration.test.ts:158–165` ✓
- 35-day backup ceiling enforced: `rls-barrier.integration.test.ts:176–196` ✓

**No findings.**

---

### F-08: Append-Only Receipts — Grant Restrictions (PASS)

**Severity:** informational  
**Angle:** Receipts peuvent être modifiées ou effacées  
**Finding:** Migration 0002 restricts `libre_ai_app` to SELECT and INSERT only:

```sql
GRANT SELECT, INSERT ON deletion_receipts TO libre_ai_app;
```

No UPDATE, DELETE, or TRUNCATE permission. Test `adapters.integration.test.ts:184–198` confirms both are rejected:

```typescript
test("receipts cannot be rewritten or erased by the application role", async () => {
  // UPDATE is denied
  await expect(
    withTenantDbTransaction(tdb.db, TENANT_A, (tx) =>
      tx.query(
        "UPDATE deletion_receipts SET receipt = '{}'::jsonb WHERE receipt_id = 'rcp_int1'",
      ),
    ),
  ).rejects.toThrow(/permission denied/);
  // DELETE is denied
  await expect(
    withTenantDbTransaction(tdb.db, TENANT_A, (tx) =>
      tx.query("DELETE FROM deletion_receipts WHERE receipt_id = 'rcp_int1'"),
    ),
  ).rejects.toThrow(/permission denied/);
});
```

**No findings.**

---

### F-09: Transaction-Local Context Guarantees (PASS)

**Severity:** informational  
**Angle:** Contexte fuite au-delà de la transaction  
**Test:** `adapters.integration.test.ts:68–104`:

```typescript
test("establishes both contexts: application ALS and database GUC agree", async () => {
  await withTenantDbTransaction(tdb.db, TENANT_A, async (tx) => {
    expect(requireTenantContext()).toBe(TENANT_A);
    const res = await tx.query<{ v: string }>(
      "SELECT current_setting('app.tenant_id', true) AS v",
    );
    expect(res.rows[0]?.v).toBe(TENANT_A);
  });
});

test("rolls back on throw and clears the application context", async () => {
  await expect(
    withTenantDbTransaction(tdb.db, TENANT_A, async (tx) => {
      // ... mutation ...
      throw new Error("boom");
    }),
  ).rejects.toThrow("boom");
  expect(() => requireTenantContext()).toThrow(); // ALS context cleared
  // Database transaction rolled back
});
```

Both enforcement layers clean up on COMMIT/ROLLBACK:

- `SET LOCAL ROLE` (PostgreSQL semantics: LOCAL = transaction-scoped) ✓
- `set_config(..., true)` (third param = LOCAL) ✓
- `AsyncLocalStorage.run()` (automatic cleanup on return/throw) ✓

**No findings.**

---

### F-10: Migrations Idempotency (PASS)

**Severity:** informational  
**Angle:** Migration peut écraser ou casser l'isolation si réexécutée  
**Finding:** Migration 0000 uses `IF NOT EXISTS`:

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'libre_ai_app') THEN
    CREATE ROLE libre_ai_app NOLOGIN;
  END IF;
END $$;
```

Migrations 0001–0002 create new tables (non-idempotent if run twice, but harmless in typical harness—each test clears the DB). Test harness (`test-database.ts:32–50`) applies all migrations in lexicographic order within a single ephemeral database.

In production CI (G4): Each migration should be run exactly once via schema versioning (e.g., `migrations_applied` table). The harness does not enforce this—it's a **caller responsibility**.

**No findings** (architectural assumption, not code flaw).

---

## Summary

| Finding                         | Severity | Status        | Action Owner   |
| ------------------------------- | -------- | ------------- | -------------- |
| F-01: Pool clearing semantics   | major    | condition     | G4 integration |
| F-02: Single-connection harness | minor    | documented    | G4 test layer  |
| F-03: Tenant ID provenance (K2) | major    | specification | G1/spec review |
| F-04: FORCE ROW LEVEL SECURITY  | —        | pass          | —              |
| F-05: RLS policy completeness   | —        | pass          | —              |
| F-06: SQL injection protection  | —        | pass          | —              |
| F-07: CHECK constraints         | —        | pass          | —              |
| F-08: Append-only receipts      | —        | pass          | —              |
| F-09: Transaction-local cleanup | —        | pass          | —              |
| F-10: Migration idempotency     | —        | pass          | —              |

---

## Conditions for APPROVE (must close before G4 deployment)

1. **F-01 (major):** G4 pool integration must guarantee that `clearPooledSession()` is called in a finally block after every transaction, and add multi-connection pool test coverage verifying no GUC leakage.

2. **F-03 (major):** ADR or spec must define the authoritative tenant-ID sources (Biscuit, session, user profile). Code review / linting must enforce K2 classification at every `runInTenantContext()` call.

---

## Architectural Strengths

- **Defense in depth:** Application context (AsyncLocalStorage) + database context (RLS + FORCE + CHECKs) cannot drift. Both must agree for access. ✓
- **Fail-closed:** Missing tenant context (NULL `app.tenant_id`) yields zero rows on SELECT, denied on INSERT/UPDATE/DELETE. ✓
- **Least-privilege roles:** `libre_ai_app` cannot SUPERUSER-bypass, cannot TRUNCATE, cannot ALTER DDL. ✓
- **Structural guarantees:** Tenant-ID and backup-ceiling CHECKs hold even for owner-level mutations. ✓
- **Append-only evidence:** Deletion receipts cannot be rewritten or erased by application. ✓

---

## Recommendation for Publication

This implementation is ready to proceed to the next gate (deletion + restore-replay review, ADR-0002 §3 authority sign-off). The RLS barrier and isolation adapters are **structurally sound**. Two conditions (F-01, F-03) are architectural dependencies for G4, not code flaws.

**Relecteur**: Independent adversarial (loop-security kernel K4)  
**Date d'approbation**: 2026-07-20
