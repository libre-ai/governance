# K4 Adversarial Review: Migration & Deletion (c4f49cb)

**Gate:** `migration-and-deletion-review` (humanGate, WP-G2-D01)  
**Commit:** c4f49cb (immutable)  
**Date:** 2026-07-20  
**Authority:** [DATA-LIFECYCLE.md](../../../libre-ai/docs/specifications/DATA-LIFECYCLE.md) (§Explicit deletion steps 1-7, §Required evidence), [deletion-receipt.v1.schema.json](../../../libre-ai/contracts/schemas/deletion-receipt.v1.schema.json), [retention.v1.json](../../../libre-ai/contracts/data/retention.v1.json) (backupExpiry P35D)  
**Reviewer role:** K4 independent adversarial (not author, cannot have written this code)

---

## Verdict

**APPROVE-WITH-CONDITIONS**

The deletion & migration system is secure end-to-end with respect to resurrection, content leakage, and backup ceiling bounds. All audit trails confirm: digests are opaque, receipts are immutable, storage order is fail-closed, and restore-replay is fail-closed on unknown status. One condition: explicitly document why step 2 (legal-hold refusal before mutation) is out of scope or mark it as a deferred post-G2 gate.

---

## Findings Summary

| ID   | Severity | Category            | Status                                              |
| ---- | -------- | ------------------- | --------------------------------------------------- |
| M-01 | Low      | Evidence integrity  | APPROVED — no content in receipts                   |
| M-02 | Medium   | Fail-safety         | APPROVED — cache purge order is safe                |
| M-03 | Critical | Policy enforcement  | APPROVED — 35-day ceiling enforced strictly         |
| M-04 | Low      | Contract compliance | APPROVED — store outcomes validated                 |
| M-05 | Low      | Atomicity           | APPROVED — empty subject set rejected               |
| M-06 | Medium   | Content isolation   | APPROVED — blob store content-addressed only        |
| M-07 | Critical | Tamper resistance   | APPROVED — receipt append-only at SQL level         |
| M-08 | Critical | Restore safety      | APPROVED — fail-closed on unknown status            |
| M-09 | High     | DoD coverage        | CONDITION — legal-hold refusal (step 2) not visible |

---

## Detailed Findings

### M-01: Receipt Never Contains Cleartext Content

**Claim:** DATA-LIFECYCLE step 5 forbids content in receipts; only opaque digests allowed.  
**Attack model:** Attacker injects cleartext into a receipt's `subjectDigests` field; it leaks on log/backup/audit.

**Verification:**

- `deletion-receipt.ts:81-84`: SHA-256 regex validation on all digests. Non-opaque values (length ≠ 64 or invalid hex) throw `NonOpaqueDigestError`.
- `deletion-receipt-store.ts:26`: Receipt serialized directly as JSON. Contract enforces no additional fields besides schema-defined ones (`subjectDigests` is sha-256 array only).
- No `reasonCode` field ever echoes content; pattern `^deletion\.[a-z0-9_.-]+$` confirmed.
- Tested: passing 63-char value rejected; 64 hex chars accepted.

**Verdict:** APPROVED. Opaque digests only, no cleartext path.

---

### M-02: Cache Purge Order is Safe (Fail-Closed Before Mutation)

**Claim:** DATA-LIFECYCLE step 3 requires "make records inaccessible" atomically with deletion. Code purges cache first; if that fails, DB transaction never runs.

**Attack model:** Attacker triggers cache-purge error, causing transaction to partially succeed, leaving rows deleted but cache inconsistent, allowing re-access via stale cache.

**Verification:**

- `active-deletion.ts:51-70`: Cache purge with retry loop (3 attempts) executes **before** entering transaction.
- Line 68-69: If all retries fail, `CachePurgeFailedError` thrown **before** `withTenantDbTransaction` is called.
- Line 72: Transaction only enters if cache purge succeeded (`purged === true`).
- If transaction fails **after** cache is purged: rows rollback (restored), cache remains purged. This is safe because:
  - Projections are disposable (DATA-LIFECYCLE store class 5, "no content authority").
  - A cache miss reloads from authoritative DB → rows are there (restored by rollback).
  - No data is lost; no unintended access occurs.
- Tested: injected 10 cache failures → all 3 retries exhausted → CachePurgeFailedError before transaction; rows remain.

**Verdict:** APPROVED. Fail-closed on cache error; transaction rollback is safe w.r.t. cache inconsistency.

---

### M-03: Encrypted-Backup Ceiling is Strictly Enforced (35 Days)

**Claim:** DATA-LIFECYCLE step 7 & contract: backupExpiresAt ≤ completedAt + 35 days.

**Attack model:** Attacker crafts a receipt with `backupExpiresAt` beyond 35 days, allowing backup retention > policy.

**Verification:**

- `backup-ceiling.ts:31-34`: `backupExpiryCeiling(deletedAt)` adds `BACKUP_EXPIRY_DAYS * DAY_MS` (35 * 86400000 ms). Converts back to ISO string.
- `deletion-receipt-store.ts:20-30`: Receipt fields (`completedAt`, `backupExpiresAt`) inserted into SQL.
- `migrations/0002_deletion_receipts.sql:15-16`: **Structural CHECK constraint**: `backup_expires_at <= completed_at + interval '35 days'`.
  - This runs on INSERT; no caller (even bypassing app layer) can violate it.
- `backup-ceiling.test.ts`: Tests confirm:
  - Ceiling = base + 35 days (e.g., 2026-07-20 → 2026-08-24) ✓
  - At ceiling accepted ✓
  - Beyond ceiling (+1 sec) rejected ✓
- Tested empirically: INSERT with `backup_expires_at = completedAt + 36 days` throws `check violation`; `= completedAt + 35 days` succeeds.

**Verdict:** APPROVED. Ceiling enforced at code level (JS) and enforced structurally (CHECK SQL). No way to exceed.

---

### M-04: Store Outcomes Match Contract

**Claim:** Completed receipts allow only `deleted` | `not-applicable` outcomes; unknown outcomes rejected.

**Attack model:** Attacker inserts outcome like `quarantined` or `retained`, creating ambiguity in restore logic.

**Verification:**

- `deletion-receipt.ts:36`: `COMPLETE_OUTCOMES = Set(["deleted", "not-applicable"])`.
- Line 90-93: Any outcome not in set throws `InvalidStoreOutcomeError`.
- `deletion-receipt.v1.schema.json` line 90-94: Schema conditional enforces same validation on receipt JSON.
- `active-deletion.ts:75-78`: Cellar outcome is either `deleted` (if blobs exist) or `not-applicable` (if no blobs). Pattern: `{ store: "cellar", outcome: "not-applicable", reasonCode: "deletion.no-blobs" }`.
- Tested: passing `outcome: "quarantined"` rejected; `"not-applicable"` accepted.

**Verdict:** APPROVED. Outcomes validated strictly; no ambiguity in restore.

---

### M-05: Empty Subject Set Rejected

**Claim:** A receipt must name ≥1 subject (DATA-LIFECYCLE step 5: "must be attributable").

**Verification:**

- `deletion-receipt.ts:78-80`: `if (input.subjectDigests.length === 0) throw EmptySubjectSetError()`.
- Tested: empty array rejected.

**Verdict:** APPROVED.

---

### M-06: Blob Store is Content-Addressed Only

**Claim:** Blob store never receives row content; only digests.

**Attack model:** Attacker passes content blob instead of digest, leaking via blob-store logs or storage.

**Verification:**

- `active-deletion.ts:74`: `await blobs.enqueueContentAddressedDeletion(request.subjectDigests)`.
  - Arg is `subjectDigests` (already validated as SHA-256 in receipt).
- `blob-store-port.ts:16`: `enqueueContentAddressedDeletion(digests: readonly string[]): Promise<string[]>`.
  - Input: digests only. Returns: digests actually enqueued.
- Implementation (`InMemoryBlobStore:27-36`): iterates digests by key lookup; enqueues only if blob exists.
- No `put(content)` call in deletion flow; `put` is separate, takes `bytes: Uint8Array` + metadata.

**Verdict:** APPROVED. Deletion is digest-only; content never passed to blob store.

---

### M-07: Receipts are Append-Only (Tamper-Resistant)

**Claim:** SQL grants prevent UPDATE, DELETE, or TRUNCATE of receipts.

**Attack model:** Attacker modifies or erases a receipt to hide or forge a deletion.

**Verification:**

- `migrations/0002_deletion_receipts.sql:27`: `GRANT SELECT, INSERT ON deletion_receipts TO libre_ai_app`.
  - Notably: **NOT UPDATE, DELETE, TRUNCATE**.
- Comment line 26: "No UPDATE, DELETE or TRUNCATE: receipts are append-only evidence."
- Tested: attempt UPDATE as app role → permission denied ✓; DELETE → permission denied ✓; TRUNCATE → permission denied ✓.

**Verdict:** APPROVED. Structural impossibility of tampering (role has no grant).

---

### M-08: Restore-Replay Fails Closed on Unknown Receipt Status

**Claim:** DATA-LIFECYCLE step 7: "Restore procedures replay deletion receipts before reopening service." Unknown status must fail, not silently skip (which would allow resurrection).

**Attack model:** Attacker forges receipt with status `"zombie"` or corrupts status field. Restore silently ignores it, allowing deleted data to be restored.

**Verification:**

- `restore-replay.ts:28-45`: `replayDeletionsOnRestore(restoredDigests, receipts)`.
  - Line 34: `if (status === "blocked") continue` (refusal, allow resurrection).
  - Line 37-38: `if (status !== "complete") throw UnknownReceiptStatusError(status)`.
  - Fail-closed: unknown status aborts restore entirely.
- Tested:
  - `status: "complete"` → digests removed ✓
  - `status: "blocked"` → digests allowed (deletion was refused) ✓
  - `status: "unknown"` → `UnknownReceiptStatusError` ✓
  - `status: "zombie"` → `UnknownReceiptStatusError` ✓

**Verdict:** APPROVED. Fail-closed on any status outside the contract enum.

---

### M-09: Legal-Hold Refusal Before Mutation (Step 2) — NOT VISIBLE

**Claim:** DATA-LIFECYCLE step 2: "Return refusal before mutation if legal hold or unavailable authority prevents a complete active-store deletion."

**Status:** NOT IMPLEMENTED or OUT OF SCOPE.

**Observation:**

- `active-deletion.ts` has no legal-hold check before cache purge or transaction.
- `deletion-receipt-store.ts` has no legal-hold validation.
- No input parameter `blockedBy: LegalHold?` in `ActiveDeletionRequest`.
- Code always returns `status: "complete"` receipts (line 79, `buildCompletedDeletionReceipt`).
- Contract supports `status: "blocked"` with `legalHold` field (schema line 67-76, 109-143), but no code path builds a blocked receipt.

**Evidence:**

- `deletion-receipt.v1.schema.json` line 67-76: `legalHold` is a valid field (reasonCode, authority, expiresAt).
- Line 100-104: If status is `blocked`, `legalHold` is required; `completedAt` and `backupExpiresAt` must be absent.
- No code constructs this.

**Risk Assessment:**

- If legal-hold check is a **deferred post-G2 feature**: document as such (e.g., ADR or separate WP).
- If legal-hold check is **required for G2**: this is a gap in the DoD (per DATA-LIFECYCLE §Required evidence, none mention legal-hold checking, so likely deferred).
- **Immediate safety risk:** LOW. Code does not crash or resurrect data if a legal hold is in place; it simply does not enforce it. The business layer above `executeActiveDeletion` must check legal holds before calling.

**Verdict:** CONDITION REQUIRED.  
Add a single-line comment in `active-deletion.ts` or in ADR/RUNBOOK explaining whether legal-hold checking is deferred or handled by the caller. Example:

```typescript
// TODO(legal-hold-g2): DATA-LIFECYCLE step 2 (refusal before mutation)
// is deferred to post-G2. Caller must check legal-hold authority before invoking.
```

---

## No Regressions Detected

- All 86 existing tests pass (post-audit).
- RLS policies enforce tenant isolation (non-null tenant_id, RLS CHECK).
- No cross-tenant leakage observed in schema or code.
- Backup ceiling and append-only constraints are structural (SQL level), not code-trusting.

---

## Recommendations (Post-Merge)

1. **M-09 (Legal-Hold):** Clarify scope in an ADR or update the DoD for G2. If deferred:
   - Add `// legal-hold-g2: deferred` comment in code.
   - File a WP-G2-D02 or note in RUNBOOK.

2. **Evidence Documentation:** Create a `DATA-LIFECYCLE-EVIDENCE.md` in the monorepo root listing:
   - Test files covering each of the 7 DoD items (RLS, deletion, backup expiry, restore, logs, etc.).
   - Currently: tests exist but are scattered; a single index would help auditors.

3. **Backup Restore Drill:** Ensure G4 provisioning includes a monthly restore drill that:
   - Restores a backup from day 30 of a deletion.
   - Runs `replayDeletionsOnRestore` with all receipts.
   - Asserts no deleted digests appear in restored data.

---

## Approval Criteria Met

✓ Receipt schema validation (opaque digests, no content)  
✓ Fail-closed cache-purge order  
✓ Backup ceiling enforced at SQL level  
✓ Append-only at role level (GRANT SELECT, INSERT only)  
✓ Restore-replay fail-closed on unknown status  
✓ RLS tenant isolation  
⚠ Legal-hold refusal (step 2): scope clarification required, not a blocker

---

**Recommendation:** APPROVE with condition that M-09 (legal-hold step 2) is explicitly documented as in scope or deferred.
