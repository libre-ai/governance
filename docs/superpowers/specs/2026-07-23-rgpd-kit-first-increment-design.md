# RGPD-kit: First-increment design — compliance models and data-subject-rights ports

**Date:** 2026-07-23  
**Status:** design (ready for owner decision and review)  
**Work package:** TBD (enrollment ADR-0009 §8)  
**Scope:** walking skeleton for reusable RGPD compliance across PII-bearing products  
**Priority:** high (required by boussole Art.9 AIPD dossier)

---

## 1. Purpose

**rgpd-kit** is a transverse brick providing reusable RGPD/GDPR compliance tooling for the constellation. It delivers:

1. **Typed models** for RGPD concepts: processing activities, data categories, subject rights, consent records (Art. 4–22 GDPR).
2. **Port interfaces** that products implement to expose their data-subject-rights handlers (erasure, access, portability, etc.).
3. **Art. 30 register** (processing register) generation and structure guidance (RGPD §2 accountability requirements).
4. **AIPD templates** (Art. 35 Data Protection Impact Assessment) ready for products to fill in.
5. **Consent lifecycle** (Art. 7) models: withdrawal tracking, proof of consent, granularity.

The kit does NOT build a cross-context data warehouse, centralized erasure table, or global PII registry. Each product manages its own data within its bounded context.

---

## 2. CRITICAL: Bounded-context architecture constraint

**This is a hard rule; violation breaks the design entirely.**

RGPD erasure, soft-delete, tombstone, and audit patterns are **per-bounded-context, per-database**. There is NO single global table for deletion receipts, NO cross-context audit log, NO centralized PII registry.

### Rationale

- **Data isolation**: Products live in separate repositories (or separate Postgres add-ons in the monorepo phase). A tombstone record in Sessions DB cannot reference a row in Carrière DB — the transaction is a lie.
- **Compliance singularity**: Each product has its own DPIA, retention schedule (ADR-0002 §3), and legal basis. Boussole's Art.9 special-category retention differs from Sessions' organizational-tenant retention. A centralized table forces a false unity.
- **Operational safety**: A bug in one product's deletion handler cannot corrupt another's audit trail. Isolation is not luxury; it is a prerequisite for trustworthy deletion evidence.

### Application

- `@libre-ai/data` (already deployed) provides retention rules, deletion receipts, and expired selection **per product**, scoped by tenant.
- **Sessions**: Implements `DataSubjectRights` port in `packages/sessions` → deletes its events, persists its own deletion receipt.
- **Boussole** (local-first v1): No server deletion (no server data); exports/deletes client-side (decoupled from rgpd-kit).
- **Carrière** (forthcoming, server-bound): Implements `DataSubjectRights` port in `packages/carriere` → deletes its leads/search-history rows, persists receipt in Carrière DB.
- **Missions**: Implements `DataSubjectRights` port → deletes its application records.

Each product's migration, deletion query, and receipt table is its own.

---

## 3. PII inventory: which data, which products, which databases

| Product                    | Type                 | PII (scope for erasure)                                                     | DB Context            | Retention (ADR-0002)                      |
| -------------------------- | -------------------- | --------------------------------------------------------------------------- | --------------------- | ----------------------------------------- |
| **Boussole**               | Questionnaire        | Responses (Art.9 special category)                                          | Local (v1)            | Until user delete; no server store        |
| **Sessions**               | Collaboration/chat   | Conversation text, participant list, artifacts (structured contributions)   | Organizational tenant | 90 days (configurable 7–365)              |
| **Carrière** (forthcoming) | Job search           | Leads (name, email, application dates), search history, profile preferences | Personal tenant       | TBD (likely 1–2 years)                    |
| **Missions**               | Application tracking | Application metadata, lead references, evidence artifacts                   | Organizational tenant | 1 year (configurable 1–6)                 |
| **Model-Policy**           | Policy evaluation    | Lead tracking (subject identifier, policy evaluation results)               | Organizational tenant | TBD (part of G2 conformance)              |
| **Notebook**               | Local knowledge      | All data (no server store v1)                                               | Local                 | Until user delete                         |
| **Practices**              | Activity tracking    | Outcome records (no server store v1)                                        | Local                 | Until user delete                         |
| **Radar**                  | Curation             | Curated items (no PII; source URLs + normalized metadata)                   | Personal tenant       | 90 days; normalizes away PII at ingestion |

**Not subject to erasure** (per Art. 17(3) GDPR exceptions): immutable proof artifacts, SpecPackages, Model-Policy snapshots (retained for 5 years as evidence of past decisions).

---

## 4. First-increment API surface: walking skeleton

### 4.1 Core types (all in `packages/rgpd-kit/src/`)

#### `data-category.ts`

Taxonomy of data types handled by products, used in Art. 30 register and consent granularity.

```ts
export enum DataCategory {
  // Identification
  IDENTITY = "identity", // Name, email, ID numbers
  CONTACT = "contact", // Phone, address

  // Behavioral / content
  PROFILE_PREFERENCE = "profile-preference", // Settings, choices
  INTERACTION = "interaction", // Behavior logs, search history
  COMMUNICATION = "communication", // Chat/message content, meeting transcripts
  EVALUATION = "evaluation", // Assessment results, scores

  // Special categories (Art. 9)
  SPECIAL_CATEGORY = "special-category", // Questionnaire responses revealing beliefs/characteristics

  // Metadata
  TIMESTAMP = "timestamp", // Access/modification dates
  AUDIT = "audit", // Who did what, when (audit logs)
}

export interface DataCategoryDeclaration {
  category: DataCategory;
  description: string;
  legalBasis:
    | "consent"
    | "contract"
    | "legal-obligation"
    | "vital-interests"
    | "public-task"
    | "legitimate-interests";
  retentionRule: string; // e.g., "retention_sessions_90d" (ref to contracts/data/retention.v1.json)
  erasureScope: "immediate" | "deferred" | "never"; // ADR-0002 exceptions
}
```

#### `data-subject-request.ts`

Typed models for data-subject rights requests (Art. 12–22 GDPR).

```ts
export type DataSubjectRightType =
  | "access" // Art. 15 — right to know what data is held
  | "rectification" // Art. 16 — correct inaccurate data
  | "erasure" // Art. 17 — right to be forgotten
  | "restriction" // Art. 18 — restrict processing (pause, don't delete)
  | "portability" // Art. 20 — receive data in structured format
  | "object"; // Art. 21 — object to processing

export interface DataSubjectRequest {
  requestId: string; // Opaque urn:uuid-like identifier
  subjectDigest: Sha256; // Hashed subject identifier (no plaintext PII in request record)
  rightType: DataSubjectRightType;
  tenantId: TenantId; // Organizational or personal tenant
  receivedAt: Timestamp;
  submittedVia: "web-form" | "email" | "api"; // How the request arrived
  status: "received" | "acknowledged" | "in-progress" | "fulfilled" | "refused";
  refusalReason?: string; // If refused, why (e.g., "already deleted", "unverifiable subject")
  deadline?: Timestamp; // GDPR 30-day deadline (calculated from receivedAt)
}

export interface AccessRequestResult {
  requestId: string;
  subjectDigest: Sha256;
  dataExport: unknown; // Structured export (JSON, CSV, etc.)
  exportedAt: Timestamp;
  categories: DataCategory[]; // Which categories were included
  completenessNote?: string; // e.g., "excludes archived copies"
}

export interface ErasureRequestResult {
  requestId: string;
  subjectDigest: Sha256;
  erasedAt: Timestamp;
  deletionReceiptId: string; // Cross-ref to @libre-ai/data DeletionReceipt
  recordsAffected: number;
  categoriesErased: DataCategory[];
  deferred?: {
    reason: string; // e.g., "legal hold", "ongoing investigation"
    deadline: Timestamp;
  };
}
```

#### `consent.ts`

Consent lifecycle (Art. 7 GDPR: freely given, specific, informed, unambiguous).

```ts
export interface ConsentRecord {
  consentId: string; // Opaque identifier
  subjectDigest: Sha256; // Hashed subject (no plaintext)
  tenantId: TenantId;
  grantedAt: Timestamp;
  grantedVia: "explicit-form" | "api-endpoint" | "web-form";
  grantedFor: {
    purposes: string[]; // e.g., ["boussole-scoring", "sessions-moderation"]
    categories: DataCategory[];
    duration: string; // ISO 8601 period, e.g., "P1Y" (1 year)
  };
  withdrawnAt?: Timestamp; // When revoked (Art. 7(3))
  withdrawnVia?: "web-form" | "api-endpoint" | "email";
  proofOfConsent?: {
    documentDigest: Sha256;
    versionHash: string; // What consent text was accepted (version-pinned)
  };
}

export interface ConsentWithdrawal {
  consentId: string;
  withdrawnAt: Timestamp;
  withdrawnVia: "web-form" | "api-endpoint" | "email";
  reason?: string; // Optional user feedback
  // Upon withdrawal, linked data processing MUST stop and (for some rights) data erased.
}
```

### 4.2 Port interface: `DataSubjectRights`

Products implement this interface to expose how they handle data-subject requests.

```ts
// packages/rgpd-kit/src/ports/data-subject-rights.ts

export interface DataSubjectRightsPort {
  /**
   * Verify that the subject identifier is legitimate (e.g., matches a real user/tenant).
   * Return a Sha256 digest (opaque, never plaintext) if verified; null if unverifiable.
   */
  verifySubject(
    tenantId: TenantId,
    subjectIdentifier: string,
  ): Promise<Sha256 | null>;

  /**
   * Handle Art. 15 (access): export all data held for this subject.
   * Must return non-identifying, structured export (JSON/CSV).
   */
  handleAccessRequest(
    tenantId: TenantId,
    subjectDigest: Sha256,
  ): Promise<AccessRequestResult>;

  /**
   * Handle Art. 17 (erasure): delete all data for this subject.
   * MUST use @libre-ai/data: executeActiveDeletion (tenant transaction + deletion receipt).
   * Return what was deleted, what was deferred, receipt ID.
   */
  handleErasureRequest(
    tenantId: TenantId,
    subjectDigest: Sha256,
  ): Promise<ErasureRequestResult>;

  /**
   * Handle Art. 18 (restriction): pause processing (no new updates) but keep data.
   * Implementation varies (soft-flag the subject, redirect queries, etc.).
   */
  handleRestrictionRequest(
    tenantId: TenantId,
    subjectDigest: Sha256,
  ): Promise<{ restrictedAt: Timestamp; affectedRecords: number }>;

  /**
   * Handle Art. 20 (portability): export in interoperable format (JSON-LD, CSV, etc.).
   * Similar to access but structured for transfer to another controller.
   */
  handlePortabilityRequest(
    tenantId: TenantId,
    subjectDigest: Sha256,
  ): Promise<{ export: unknown; format: string; exportedAt: Timestamp }>;

  /**
   * List data categories held for this subject (used in Art. 30 register and accountability).
   */
  listDataCategories(
    tenantId: TenantId,
    subjectDigest: Sha256,
  ): Promise<DataCategoryDeclaration[]>;
}
```

### 4.3 `Art30Register`: Processing register generation

Fulfills Art. 30 GDPR (record of processing activities), used by owner/DPO for compliance audits.

```ts
// packages/rgpd-kit/src/art30-register.ts

export interface ProcessingActivity {
  name: string; // e.g., "Sessions collaborative work"
  product: string; // e.g., "libre-ai/sessions"
  dataCategories: DataCategory[];
  purposes: string[]; // Why we process
  legalBasis:
    | "consent"
    | "contract"
    | "legal-obligation"
    | "vital-interests"
    | "public-task"
    | "legitimate-interests";
  recipients: string[]; // Who receives the data (e.g., "internal agents", "logs")
  retentionRule: string; // From contracts/data/retention.v1.json
  dataSubjectType: "end-user" | "employee" | "visitor" | "lead"; // Who is the subject
  transfersOutsideEU?: {
    country: string;
    mechanism: "adequacy" | "scc" | "binding-corporate-rules" | "derogation";
  };
  subjectRightsImplemented: DataSubjectRightType[]; // Which of Art. 15–22 we support
  dpaAssessmentDate?: Timestamp; // When DPIA was last done
}

export function generateArt30Register(
  activities: ProcessingActivity[],
): string {
  // Generate markdown or JSON document listing all processing activities
  // with accountability notes.
  // Served to owner/DPO for audit and data-subject requests.
}
```

### 4.4 `AIDATemplate`: DPIA scaffolding (Art. 35 GDPR)

```ts
// packages/rgpd-kit/src/aida-template.ts

export interface DPIAAssessment {
  id: string;
  product: string; // e.g., "libre-ai/boussole"
  scope: string; // What is being assessed
  date: Timestamp;
  version: string; // Version of dataset/algorithm

  // Art. 35(3) mandatory questions
  automaticDecisionMaking: {
    yesNo: boolean;
    description?: string; // If yes, what decision is made?
  };

  largeScaleProcessing: {
    yesNo: boolean;
    description?: string;
  };

  specialCategoryData: {
    yesNo: boolean;
    categories?: (typeof DataCategory)[]; // If yes, which Art. 9 categories?
  };

  vulnerableSubjects: {
    yesNo: boolean;
    description?: string;
  };

  // Risk assessment
  risks: {
    description: string;
    severity: "low" | "medium" | "high";
    mitigation: string;
  }[];

  // Sign-off
  approvedBy?: {
    role: "owner" | "dpo" | "legal";
    date: Timestamp;
    name: string;
  };
}
```

### 4.5 Package structure

```
packages/rgpd-kit/
├── src/
│   ├── index.ts                      (main exports)
│   ├── data-category.ts              (enum + declarations)
│   ├── data-subject-request.ts       (typed request/result models)
│   ├── consent.ts                    (consent lifecycle)
│   ├── ports/
│   │   └── data-subject-rights.ts   (interface products implement)
│   ├── art30-register.ts             (processing register generation)
│   ├── aida-template.ts              (DPIA scaffolding)
│   └── adapters/
│       └── opaque-subject-digest.ts  (hashing PII → Sha256)
├── src/*.test.ts                     (contract tests for each type)
├── package.json
├── README.md                         (usage guide, one product example)
└── migrations/ (NONE — rgpd-kit has no data tables; products own their own)
```

---

## 5. How products consume rgpd-kit

### Example: Sessions (first adopter)

**Sessions already has:**

- Append-only event log in PostgreSQL (`session_events` table)
- Tenant isolation and RLS
- No soft-delete table (events are immutable)

**Sessions adds:**

1. **Implement `DataSubjectRightsPort`** in `packages/sessions/src/rgpd/data-subject-rights.ts`:
   - `verifySubject()`: Check that the request email/ID matches a participant in a session.
   - `handleAccessRequest()`: Export all events for this subject (query event log, filter by participant, return JSON).
   - `handleErasureRequest()`: Use `@libre-ai/data.executeActiveDeletion()` to soft-delete participant records + anonymize events, persist deletion receipt.
   - `listDataCategories()`: Return `[COMMUNICATION, AUDIT, TIMESTAMP]` (conversations, who did what, when).

2. **Create Sessions-specific migrations** (in `packages/sessions/migrations/`):
   - Add `deleted_subjects` table (tenant + subject digest + deleted_at) for tracking who has been erased.
   - Add `subject_audit` table (append-only: who requested what, when).

3. **Declare retention + consent** in `packages/sessions/README.md`:
   - Link to retention rule in `contracts/data/retention.v1.json` ("retention_sessions_90d").
   - Note that Sessions uses organizational tenant + creator consent model (implicit via membership).

4. **Expose Art. 30 register entry** at `packages/sessions/art30-register.json`:

   ```json
   {
     "name": "Sessions collaborative events",
     "product": "libre-ai/sessions",
     "dataCategories": ["COMMUNICATION", "AUDIT"],
     "purposes": ["collaborative-work", "compliance-audit"],
     "legalBasis": "contract",
     "retentionRule": "retention_sessions_90d",
     "subjectRightsImplemented": ["access", "erasure", "restriction"],
     "dpaAssessmentDate": "2026-07-23"
   }
   ```

5. **Add HTTP endpoint** (in `packages/sessions/src/server/handler.ts`):
   ```ts
   POST /api/data-subject-request
   Content-Type: application/json
   {
     "rightType": "erasure",
     "subjectIdentifier": "user@example.com",
     "tenantId": "ten_xyz..."
   }
   → { requestId, status: "acknowledged", deadline }
   ```
   (Endpoint uses `DataSubjectRightsPort.handleErasureRequest()` under the hood.)

---

## 6. What is deferred (not in first increment)

- **Consent withdrawal automation**: Products implement simple consent models; a unified "revoke my consent everywhere" dashboard is G3+.
- **DPIA approval workflow**: Scaffold exists; owner must manually fill and approve DPIA forms.
- **Cross-product audit**: No single "here's every subject request for this tenant" view; each product tracks its own.
- **Subject-verification SLA**: Assume products verify via email or existing session; no centralized identity broker yet.
- **Legal hold / court orders**: Documented in ADR-0002; deferred to G3 when enforcement process is defined.

---

## 7. Design options and trade-offs

### Option A: Typed models + port interface (RECOMMENDED)

**Approach:** Each product implements `DataSubjectRightsPort`, reuses common types from rgpd-kit.

| Axis             | Trade-off                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Security**     | ✅ Highest. Each product controls its own deletion; no cross-boundary leak surface. Port interface is a clear contract; violations are obvious. |
| **Quality**      | ✅ Highest. Clear type boundaries, reusable contracts, straightforward to test per product.                                                     |
| **Performance**  | ✅ No overhead. Products query their own tables; no centralized orchestration.                                                                  |
| **Completeness** | ✅ Full DoD: types, ports, Art. 30 scaffolding, first adoption (Sessions), tests.                                                               |

**Cons:** Products must write their own deletion logic (not copy-paste). But this is _intentional_: each product's deletion path is unique (event log vs. relational table vs. key-value store).

### Option B: Centralized data-subject-request orchestrator

**Approach:** rgpd-kit owns a `data_subject_requests` table; products register handlers; orchestrator routes requests.

| Axis             | Trade-off                                                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Security**     | ❌ Lower. Cross-product routing table introduces a central attack surface (one compromise = all products). Subject digests in a single table violate tenant isolation. |
| **Quality**      | ❌ Harder to test. Orchestrator must handle heterogeneous product APIs; brittle.                                                                                       |
| **Performance**  | ✅ Centralized audit trail (convenient for compliance).                                                                                                                |
| **Completeness** | ✅ All products get audit logs without rewriting.                                                                                                                      |

**Cons:** Violates bounded-context rule. Architecturally wrong. Rejected.

### Option C: Minimal — only data categories enum, no ports

**Approach:** rgpd-kit provides only `DataCategory` enum; products implement erasure independently.

| Axis             | Trade-off                                                                         |
| ---------------- | --------------------------------------------------------------------------------- |
| **Security**     | ✅ Simplest, lowest risk.                                                         |
| **Quality**      | ❌ No type safety; products reinvent request/result models. Divergence over time. |
| **Performance**  | ✅ Zero overhead.                                                                 |
| **Completeness** | ❌ Missing Art. 30 scaffolding, DPIA template. Not useful for compliance.         |

**Cons:** Defeats the "reusable" claim; each product is on its own. Rejected.

---

## 8. Recommendation

**Adopt Option A: Typed models + port interface.**

Rationale:

- Enforces the bounded-context constraint by design (each product is an implementer, not a component in a centralized system).
- Provides reusable types that prevent divergence and errors (Sha256 digest, timestamps, enums).
- Port interface is explicit and testable; products cannot accidentally leak data across contexts.
- Art. 30 and DPIA scaffolding are compliance-adjacent (not core logic), so they can be templates/documents that products fill in.
- First adoption (Sessions) is straightforward: query → filter → delete → receipt.

---

## 9. First-increment acceptance

### Walking skeleton (after this design is locked)

1. ✅ **Types and ports defined**: `packages/rgpd-kit/src/{data-category,data-subject-request,consent,ports/data-subject-rights}.ts` + tests (contract tests verifying type structure, no I/O).
2. ✅ **Sessions adopts port**: `packages/sessions/src/rgpd/data-subject-rights.ts` implements port; adds `deleted_subjects` and `subject_audit` migrations; HTTP endpoint routes to handler.
3. ✅ **Art. 30 and AIDA scaffolding**: `packages/rgpd-kit/src/{art30-register,aida-template}.ts` + markdown template in `docs/superpowers/specs/aida-template.md`.
4. ✅ **README and examples**: `packages/rgpd-kit/README.md` documents the bounded-context rule, shows Sessions example.
5. ✅ **Tests**:
   - Unit: Types validate (Sha256 digest, timestamps, enums).
   - Contract: `DataSubjectRightsPort` interface is satisfied by a test mock.
   - Integration: Sessions endpoint receives a request, routes to handler, verifies subject, executes deletion via `@libre-ai/data`, persists receipt, returns result.
   - No e2e: cross-product orchestration is out of scope.
6. ✅ **CI gates**: Biome, tsc (strict mode), coverage >80%.

### Testable acceptance criterion

- **A new product (Missions or Carrière)** can adopt rgpd-kit by:
  1. Importing `DataSubjectRightsPort`, `DataSubjectRequest`, `DataCategory`.
  2. Implementing the port in 2–3 hours (standard CRUD + deletion query + receipt emission).
  3. Running tests; all pass.
  4. No additional types, no product-specific contracts, no deviation from the port.
- **Owner can extract Art. 30 register** by reading `products_art30_activities.json` (one entry per product), generating a markdown report.
- **Owner can draft DPIA** using `packages/rgpd-kit/docs/aida-template.md`; fill in gaps, sign.

---

## 10. Bounded-context inventory (decisions deferred to owner per product)

### Which data is PII, which isn't (Art. 4(1) GDPR)

| Product      | Table/Entity                         | PII?                                                                | Scope                                | Ownership                         |
| ------------ | ------------------------------------ | ------------------------------------------------------------------- | ------------------------------------ | --------------------------------- |
| Sessions     | `session_events`                     | ✅ Yes (participant identity, conversation)                         | Delete participant entries on Art.17 | Sessions port impl.               |
| Sessions     | `session_events` (artifact metadata) | ❌ No (source URLs, digest only)                                    | Keep                                 | Sessions port impl.               |
| Boussole     | Response set v1 (local)              | ✅ Yes (Art.9 special category)                                     | Local export/delete only             | Boussole (no server port)         |
| Missions     | `application_records`                | ✅ Yes (lead name, email, dates)                                    | Delete on Art.17                     | Missions port impl. (forthcoming) |
| Carrière     | `leads`, `search_history`            | ✅ Yes (lead profile, search history)                               | Delete on Art.17                     | Carrière port impl. (forthcoming) |
| Model-Policy | `lead_evaluations`                   | ✅ Yes (link to subject ID, evaluation results)                     | Restrict or delete on Art.17/18      | Model-Policy port impl. (TBD)     |
| Radar        | Curated items                        | ❌ No (source URLs, normalized metadata; PII stripped at ingestion) | Never delete                         | (Out of scope for rgpd-kit)       |

Each row is decided by the **product owner** in consultation with the compliance/legal owner. rgpd-kit provides the framework; the owner fills in `DataCategoryDeclaration` for each product.

---

## 11. Next steps (not in scope)

- **Wave 2+ (G3)**: Extend with unified "your requests" dashboard (cross-product subject request tracking).
- **Wave 3+ (G4)**: Integrate with GDPR consent banner library (global withdrawal, explicit consent proof).
- **Wave 4+ (G4 infrastructure)**: Add legal-hold, court-order, and retention-override workflow.
- **Audit**: After first product (Sessions) adopts, run independent K4 review on data-subject-rights impl. + deletion evidence.

---

## 12. References

- **ADR-0002 §3** (Retention and deletion): `docs/adr/0002-g1-cross-cutting-product-decisions.md` — retention schedule per product, immediate deletion in active stores, backup expiry 35 days.
- **@libre-ai/data** (Data-lifecycle infrastructure): `packages/data/README.md` — deletion receipts, retention rules, tenant isolation, RLS.
- **LINCnil GDPR guide** (source): "Guide RGPD du développeur" — French legal authority best practices for GDPR.
- **Contracts** (retention schema): `contracts/data/retention.v1.json` — canonical retention rules (immutable; changes require new ADR).
- **Sessions** (first adopter template): `packages/sessions/README.md`, `packages/sessions/src/domain/session-event.ts`.

---

## Appendix A: Bounded-context principle (why this matters)

The constellation design (ADR-0009) isolates products into bounded contexts: each has its own deployment, retention schedule, legal basis, and threat model. rgpd-kit reinforces this by:

1. **No shared deletion table**: Each product owns its `deletion_receipts` (or equivalent) in its own database.
2. **No PII in rgpd-kit storage**: rgpd-kit has zero persistent tables. It is pure types + scaffolding.
3. **No cross-product queries**: A subject-request affects one product at a time; no transaction spans DBs.
4. **Clear audit trail per product**: Sessions knows what was deleted from Sessions; Missions knows what was deleted from Missions. No entanglement.

This design makes it impossible to accidentally delete data from the wrong context, and makes it easy to trace who deleted what in compliance audits.

---

## Appendix B: Subject digest (why Sha256, never plaintext)

Data-subject requests MUST NOT store plaintext PII in the request record itself.

**Why?** Imagine a bug: `DELETE FROM data_subject_requests` is triggered by a faulty retention job. If the request table held plaintext emails, they are now leaked to backups / audit logs / decommissioned hardware.

**Solution:** Hash the subject identifier (email, ID number) to Sha256. The request record holds only the digest and the receipt ID. To prove "I deleted this subject's data," you cross-ref the digest with the deletion receipt (held in the product's DB, not in rgpd-kit).

This is a micro-pattern but critical: never store plaintext subject identifiers in a centralized request-tracking system.

---

**Status after owner review:** Awaiting decision on:

1. Product adoption priority (Sessions first, or parallel).
2. Consent model detail level (simplified model OK, or full Art. 7 tracking needed now?).
3. DPIA approval workflow scope (scaffold only, or tie to Git release gates?).
