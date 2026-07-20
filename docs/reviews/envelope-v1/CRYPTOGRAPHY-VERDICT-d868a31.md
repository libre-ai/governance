# Cryptography Review Verdict — envelope.v1

**reviewPassId:** envelope-v1-crypto-d868a31-2026-07-20  
**Role:** Cryptography lens  
**Review mode:** Role-specific promotion review  
**Reviewed commit:** d868a31814d8219fc3c8cce6d2f9458bcd2a81d7  
**Contract hash:** envelope.v1.schema.json (2a8b4c1f via diff 867fbcf..d868a31)  
**Date:** 2026-07-20  
**Agent/session/provider:** Claude Code, Haiku 4.5, Independent cryptography review pass

---

## Scope and Approach

This review evaluates the cryptographic construction and security properties of the `envelope.v1` candidate contract, focusing on:

1. **MAC construction:** HMAC-SHA256 over canonical bytes (`computeMac`, `createHmac("sha256", secret)`)
2. **Domain separation:** Length-prefix canonicalization preventing field-boundary confusion
3. **Constant-time comparison:** `timingSafeEqual` guard against timing attacks
4. **Encoding:** Base64url round-trip (43 chars = 32 bytes)
5. **Key binding:** keyId informational vs. mandatory verification
6. **Threat model alignment:** Symmetric HMAC as integrity mitigation (not origin authentication) per K3

Subject files:

- `packages/envelope/src/index.ts` — reference implementation
- `contracts/schemas/envelope.v1.schema.json` — integrity field definition
- `packages/envelope/src/envelope.test.ts` — test evidence

---

## Evidence Reproduced

All findings below are independently verified via executable cryptographic tests (bun scripts) in
the scratchpad, not assertions from code inspection.

### 1. HMAC-SHA256 Construction

✓ `createHmac("sha256", key.secret).update(canonical).digest("base64url")`  
✓ SHA-256 output: 32 bytes  
✓ Base64url encoding: 43 characters (no padding)  
✓ Round-trip: base64url encode→decode cycle preserves all bits

### 2. Length-Prefix Domain Separation

Field-level length prefixing: `${byteLen}:${bytes}` for each field in fixed order.

**Test case:** Two envelopes differing in label only ("label1" vs. "label2", both 6-byte contents).  
**Result:** Canonical bytes differ, field boundaries unambiguous. Boundary shifting requires changing field content (detected by MAC).

**Test case:** Envelope with tampered content.  
**Result:** Content change → canonical bytes change → expected MAC differs → verification fails.

### 3. Constant-Time Comparison

✓ `timingSafeEqual(expectedBytes, actualBytes)` used correctly  
✓ Length guard before comparison: `if (expectedBytes.length !== actualBytes.length || !timingSafeEqual(...))`  
✓ Guard is safe: HMAC-SHA256 output always 32 bytes, length oracle does not leak MAC value

### 4. Base64url Encoding and Validation

Schema pattern: `^[A-Za-z0-9_-]{43}$`

**Test case:** Valid MAC (43 base64url chars).  
**Result:** Decodes to 32 bytes, correctly round-trips.

**Test case:** Invalid MACs (too short, with padding "=", with invalid chars like "@").  
**Result:** `Buffer.from(mac, "base64url")` silently tolerates invalid chars, producing buffers of unexpected length. Verification fails correctly due to length/content mismatch, but the failure is implicit (length guard prevents crash, comparison succeeds only if expected and actual are identical).

**Risk assessment:** Low. If caller passes unvalidated input, verification still fails correctly. Schema validation must be enforced upstream (e.g., Zod, ajv before passing to `verifyEnvelope()`).

### 5. keyId Binding

`envelope.integrity.keyId` is present but not validated in `verifyEnvelope()`.

**Test case:** Change keyId from "envkey_001" to "envkey_002", keep MAC from key1.  
**Result:** Verification with key2 recomputes MAC with key2, result differs from envelope MAC → verification fails (safe).

**Test case:** keyId field is NOT included in canonical bytes.  
**Result:** Changing keyId alone does not require recomputing MAC (attacker could claim different key). However, recomputing MAC with claimed key requires possession of that key. K3 threat model assumes symmetric key sharing (producer/verifier both hold same secret) → attacker cannot forge with different key.

**Residual risk:** If key topology changes (per-user keys, key rotation, asymmetric upgrade), ignoring keyId could cause confusion. Currently low-risk for session/ephemeral keys.

### 6. Test Coverage

All tests pass; coverage includes:

- Deterministic MAC (identical input → identical MAC)
- Tamper detection (content alteration → integrity failure)
- Wrong key rejection
- Trusted flag forgery detection
- Source swap detection
- Delimiter escape and non-forgery (⟦/LAI-UNTRUSTED⟧ cannot appear in escaped payload)

---

## Findings

### C-01: keyId field not verified in verifyEnvelope

**Severity:** Non-blocking  
**Category:** Design documentation gap

**Observation:** `verifyEnvelope()` accepts `envelope: UntrustedEnvelope` and uses `key: EnvelopeKey` passed by caller, but does not verify that `envelope.integrity.keyId === key.id`. The keyId field exists in the schema and is set during `wrapUntrusted()`, but is never checked during verification.

**Rationale for acceptance:** K3 threat model assumes symmetric key sharing (producer and verifier both hold the same session key). An attacker cannot forge a valid envelope using a key they don't possess. Changing keyId without access to the claimed key does not enable an attack because:

1. Changing keyId + keeping old MAC → MAC verification fails
2. Changing keyId + recomputing MAC → requires the claimed key
3. If attacker has the claimed key, the envelope was never in their possession without it

**Residual risk:** If key topology evolves (e.g., per-user keys, multi-key scenarios, asymmetric upgrade), lack of keyId binding could cause silent misbinding (verifier uses wrong key, envelope still verifies if content happens to match). Not elevated to blocking because K3 is documented as symmetric/session-key-only.

**Recommendation:** Add JSDoc comment to `verifyEnvelope()` documenting that keyId is informational only in the current symmetric model, and that it becomes binding in future Ed25519 asymmetric upgrade. Future enhancement: add optional `enforceKeyId: boolean` parameter for forward compatibility.

---

### C-02: MAC pattern not validated at runtime

**Severity:** Minor  
**Category:** Implicit validation assumption

**Observation:** `verifyEnvelope()` receives `envelope` typed as `UntrustedEnvelope`, but performs no runtime validation of `envelope.integrity.mac` against the JSON schema pattern `^[A-Za-z0-9_-]{43}$`.

If a caller constructs or deserializes an envelope with malformed MAC (e.g., "invalid!@#$%"), `Buffer.from(mac, "base64url")` silently tolerates invalid characters and decodes to a buffer of incorrect length. The verification still fails (comparison detects length mismatch), but the failure path is implicit.

**Evidence:** Test with `Buffer.from("InvalidMACThatDoesntMatchPattern!@#$%", "base64url")` yields 24 bytes instead of expected 32. Length guard prevents crash; comparison fails correctly.

**Impact:** Low. Verification fails safely even with malformed input. However, the assumption is that schema validation is enforced upstream (e.g., Zod for TypeScript, ajv for JSON Schema).

**Recommendation:** Add JSDoc to `verifyEnvelope()` documenting the assumption:

```typescript
/**
 * ...
 * @throws EnvelopeIntegrityError if MAC verification fails.
 * @note Assumes envelope has been pre-validated against JSON schema
 *       (e.g., using Zod or ajv). Invalid MAC encoding is not explicitly checked.
 */
```

---

### C-03: EnvelopeKey.secret size not constrained

**Severity:** Minor  
**Category:** Key strength recommendation

**Observation:** `EnvelopeKey` interface defines `secret: Uint8Array` with no minimum length. HMAC-SHA256 security is optimal with ≥32-byte keys (NIST recommendation). Shorter keys are valid but use lower entropy.

Test demonstrates that 16-byte keys are technically accepted and produce valid HMACs (HMAC pads to 64-byte block size with zeros). For K3 ephemeral/session keys, 16 bytes (~128-bit security) is acceptable, but 32+ bytes is recommended practice.

**Impact:** Low. Any key length produces a valid MAC. Shorter keys reduce keyspace but are not a breaking vulnerability for session-key scenarios.

**Recommendation:** Add JSDoc to `EnvelopeKey.secret`:

```typescript
/**
 * ...
 * @param secret Symmetric HMAC key (Uint8Array).
 *   Recommended ≥32 bytes. K3 uses ephemeral session keys, so 128-bit (16 bytes)
 *   is technically acceptable but not recommended. Keys are not validated for length.
 */
```

---

### C-04: Deterministic MAC and replay semantics

**Severity:** Non-blocking  
**Category:** Threat model documentation

**Observation:** HMAC is deterministic — identical input always produces identical MAC. This is correct for integrity (no nonce needed), but means replayed envelopes (identical source, content, label, timestamp) will have identical MACs.

Replay detection relies on application-level deduplication (e.g., "two envelopes from web at same timestamp are cache-hit / idempotent"). No cryptographic replay token is provided.

**Rationale for acceptance:** `capturedAt` field includes timestamp (ISO 8601, millisecond precision in practice). For K3 use case (wrapping external content for model-facing surface), replay of identical content is either:

1. Legitimate (cached web result, repeated email), or
2. Detected by application logic (deduplicate by source + timestamp)

**Recommendation:** Document in envelope.v1 ADR or design notes: "Replay detection is application-level; identical envelopes (same source, content, timestamp) will have identical MACs. Consumers should deduplicate by (source, label, capturedAt) if needed."

---

## Cryptography Verdict: APPROVE-WITH-MINOR-RESERVATIONS

**Summary:** The HMAC-SHA256 construction, length-prefix domain separation, base64url encoding, constant-time comparison, and test coverage are cryptographically sound and correctly implemented. The contract correctly specifies symmetric integrity (not origin authentication) aligned with K3 threat model.

**Conditions for promotion from `candidate` to `locked`:**

1. ✓ Add JSDoc to `verifyEnvelope()` documenting that keyId is informational only and schema validation is a pre-requirement.
2. ✓ Add JSDoc to `EnvelopeKey.secret` recommending ≥32 bytes and documenting K3 ephemeral-key acceptance of shorter keys.
3. ✓ Add comment to `computeMac()` or cryptography section documenting that deterministic MAC relies on application-level replay detection via timestamp deduplication.
4. ✓ Document the honest limit (E22): HMAC provides integrity, not authentication. Origin authentication requires Ed25519 asymmetric signing (WP-G2-Z01, deferred).

These are documentation enhancements with no code changes required. No blocking findings.

**Residual cryptographic risks:** None elevated to blocking or major.

---

## Honest Limits (per E22)

**HMAC is a mitigation, not enforcement.** The envelope makes external content structurally presentable only as `trusted:false` data with signed integrity, but:

- **HMAC provides symmetric integrity only** — detects tampering, does not authenticate origin.
- **Origin authentication** (proving the enveloppe came from a specific trusted source) requires asymmetric signatures (Ed25519 per WP-G2-Z01). This brick defers asymmetric signing to future phase G2-Z01, which is correct.
- **Jailbreaking via guarded content remains possible** — a model can still be tricked by the text itself if unguarded by refusal-first, planning-only, and K2 non-authority defenses.

The envelope is a **structural guard**, not a semantic firewall. Use it alongside operational defenses (kernel K2, refusal-first filtering).

---

## Agent Attribution

- **Model:** Claude Haiku 4.5
- **Review date:** 2026-07-20
- **Independent:** Yes (dedicated cryptography-lens pass, role-separated from authoring)
- **Evidence:** All findings reproduced via executable test scripts (bun)
- **Findings:** C-01, C-02, C-03, C-04 (four findings: 3 minor, 1 non-blocking)
- **Verdict:** APPROVE-WITH-MINOR-RESERVATIONS (no blocking findings, minor documentation enhancements required)
