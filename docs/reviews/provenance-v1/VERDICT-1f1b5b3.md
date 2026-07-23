# K4 Independent Adversarial Review — @libre-ai/provenance v1

**Review Role:** K4 (Cryptography + security attack surface)  
**Review Mode:** candidate-integration + specialized security pass  
**Reviewed Commit:** `1f1b5b3` (feat: Ed25519 agent contributor lineage wave 2, couche 3)  
**Review Date:** 2026-07-20  
**Reviewer:** Claude (Haiku 4.5, independent pass, no code authorship)  
**Review Authority:** AGENT-REVIEW-PROTOCOL.md § "Role-separated agent review protocol"

---

## Immutable Reference Hashes

| Artifact                                                     | SHA-256                      |
| ------------------------------------------------------------ | ---------------------------- |
| Commit `1f1b5b3` (HEAD)                                      | (immutable Git state)        |
| `packages/provenance/src/index.ts`                           | Production code under review |
| `packages/provenance/src/provenance.test.ts`                 | In-repo tests (passing)      |
| `contracts/schemas/agent-contributor-lineage.v1.schema.json` | Contract authority           |
| `contracts/schemas/common.v1.schema.json`                    | Contract definitions         |

---

## Executive Summary

The `@libre-ai/provenance` brick (wave 2, couche 3) implements Ed25519-signed **AgentContributorLineage** records for origin authentication and tamper detection. The security model is **sound**: cryptography is correct, canonicalisation prevents field-boundary shifts, and fail-closed semantics hold on all tested vectors. One **minor** gap: the brick does not enforce `uniqueItems` on contributors, deferring this to schema validation; this creates a risk if validation is skipped. All production-grade records pass schema + crypto gates.

**Verdict:** `APPROVE-WITH-MINOR-RESERVATIONS` — one non-blocking finding, recommend documentation or enforcement before production deployment.

---

## Review Methodology

### Evidence Gathered

1. **Code inspection:** `index.ts` (221 lines) + `provenance.test.ts` (122 lines)
2. **Schema conformance:** validated against `agent-contributor-lineage.v1.schema.json`
3. **Cryptographic verification:**
   - Ed25519 signature/verify with `node:crypto` (algorithm correctness)
   - Signature format: 86 chars base64url = 64 bytes (Ed25519 standard)
   - Digest algorithm: SHA-256 (collision resistance assumption)
4. **Canonicalisation testing:**
   - Length-prefix encoding (`${bytes.length}:` prefix per field)
   - Role sorting by fixed enum order (determinism)
   - Array count prefixing (array boundary protection)
5. **Fail-closed testing:** 11 tamper vectors (signature corruption, digest modification, key mismatch, malformed input)
6. **Contract validation:** all records validated against JSON Schema 2020-12 with AJV

### Test Suite

**Custom K4 review test suite** (32 tests, all pass):

- 6 tests: contract conformance (schemaVersion, signature format, digest format, required fields, schema validation)
- 4 tests: Ed25519 correctness (right/wrong key verification, algorithm identity, digest signing)
- 7 tests: canonicalisation (length-prefix integrity, role sorting, enum closure, count prefixes, field order)
- 5 tests: fail-closed (9 tamper vectors, all rejected)
- 2 tests: PII disclosure (error messages sanitized)
- 3 tests: schema enforcement (maxItems contributors=64, observations=1000, minItems observations=1)
- 5 tests: additional edge cases (invalid base64url, truncated signatures, zero signatures, digest alteration)

**Commands run:**

```bash
bun test /private/tmp/claude-502/scratchpad/provenance-review.test.ts
# Result: 32 pass, 0 fail, 53 expect() calls

bun run /private/tmp/claude-502/scratchpad/test-duplicates.ts
# Result: schema validation correctly rejects duplicate contributors

bun run /private/tmp/claude-502/scratchpad/test-crypto-edge-cases.ts
# Result: all crypto edge cases (short sig, long sig, malformed base64url, zero bytes, altered digest) rejected

bun run /private/tmp/claude-502/scratchpad/test-buffer-base64url.ts
# Result: Buffer.from lenient but edVerify rejects invalid input; strategy is correct
```

---

## Findings

### P-01: Brick does not enforce `uniqueItems` on contributors (Minor)

**Severity:** Minor (schema-layer remediation available)  
**Silo:** Robustness/contract adherence  
**Evidence:**

```
Test: buildLineage() with duplicate contributor (same agentId+roles+digest)
Result: record builds successfully with 2 identical contributors
Schema validation: REJECTED — "uniqueItems" keyword failed at /contributors
Issue: A caller who skips schema validation receives an invalid record
```

**Root Cause:**

- The brick `buildLineage()` accepts any contributors without deduplication
- The schema declares `uniqueItems: true` on the contributors array
- Separation of concerns is correct in principle, but creates a footgun: a record can be built that violates the contract

**Impact:**

- Record is rejected at validation (schema layer catches it)
- Risk: caller who uses `buildLineage()` directly without schema validation receives an invalid record
- No direct crypto vulnerability; validation is the backstop

**Correction Options:**

1. **Option A (recommended):** Deduplicate contributors in `buildLineage()` before returning
   ```typescript
   const contributors: Contributor[] = Array.from(
     new Map(
       input.contributors.map((c) => [
         JSON.stringify([c.agentId, c.roles.join(",")]),
         c,
       ]),
     ).values(),
   );
   ```
2. **Option B:** Document in `buildLineage()` JSDoc that the caller MUST validate against the schema
3. **Option C (hybrid):** Assert during build, throw RangeError on duplicates

**Recommendation:** Option A (deduplication) preferred for fail-closed posture. The cost is negligible (<100 bytes per call). Option B alone is insufficient in a multi-party ecosystem.

---

### P-02: Buffer.from() lenient on base64url, but edVerify compensates (Non-blocking)

**Severity:** Non-blocking (compensating control)  
**Silo:** Implementation detail / defense-in-depth  
**Evidence:**

```
Buffer.from(invalidBase64url, "base64url") silently skips invalid chars:
  Input: "...@@@@@..." (invalid chars)
  Output: 63 bytes (not 64)

edVerify() rejects truncated signatures:
  edVerify(null, digest, pubkey, 63-byte buffer) → false → LineageIntegrityError
```

**Analysis:**

- The brick does NOT validate base64url format before passing to `edVerify()`
- Instead, it relies on the cryptographic verification to reject malformed input
- This is **correct and defensive**: even if Buffer.from were strict, edVerify is the authoritative gate
- Fail-closed semantic holds: invalid signatures are rejected

**Conclusion:** No action required. This is an example of defense-in-depth; the crypto layer is the strong boundary.

---

### P-03: Length-prefix canonicalisation is collision-resistant (Verified)

**Severity:** Non-blocking (design verification)  
**Evidence:**

- Canonical format: `${field1_length}:${field1}${field2_length}:${field2}...`
- No field can be split or merged without changing the length prefix
- SHA-256 collision resistance guarantees that two distinct canonicalisations produce distinct digests
- Tested: contributors array count changes → digest changes
- Tested: observation array count changes → digest changes

**Conclusion:** Length-prefix strategy is sound. No ambiguity vector.

---

### P-04: Role enum is closed; comma-free (Verified)

**Severity:** Non-blocking (design verification)  
**Evidence:**

- Roles: `["author", "executor", "fixer", "editor"]` — no commas, no wildcards
- Roles joined by `,` in canonical form: `c.roles.join(",")`
- Unknown roles thrown at build time: `RangeError` if role not in ROLES enum
- Schema reinforces: `enum: ["author", "executor", "fixer", "editor"]`

**Conclusion:** No ambiguity. Role boundary is unambiguous.

---

### P-05: Schema conformance: all required fields present and validated (Verified)

**Severity:** Non-blocking (gate passes)  
**Evidence:**

- All 11 required fields present in produced records
- JSON Schema AJV validation passes for all built records
- Schema correctly enforces:
  - `schemaVersion` = constant string
  - `signature` = 86 chars base64url (regex + length)
  - `lineageDigest` = 64 hex chars (sha256 pattern)
  - `contributors` maxItems=64, uniqueItems=true
  - `observations` minItems=1, maxItems=1000, uniqueItems=true
  - All digest/id/timestamp fields conform to common.v1.schema.json defs

**Conclusion:** Contract layer intact. Records produced are schema-valid (except P-01 duplicate gap).

---

### P-06: Fail-closed on all tested tamper vectors (Verified)

**Severity:** Non-blocking (design verification)  
**Evidence:**

```
Tamper Vector 1: subjectDigest altered → verifyLineage() throws LineageIntegrityError ✓
Tamper Vector 2: contributor agentId altered → throws ✓
Tamper Vector 3: contributor digest altered → throws ✓
Tamper Vector 4: observation digest altered → throws ✓
Tamper Vector 5: signature mismatched with recomputed digest → throws ✓
Tamper Vector 6: malformed signature (invalid base64url chars) → throws ✓
Tamper Vector 7: signature wrong length (86 → 80 chars) → throws ✓
Tamper Vector 8: wrong public key → throws ✓
Tamper Vector 9: schemaVersion altered → throws ✓
Tamper Vector 10: empty observations array → rejected at build time ✓
Tamper Vector 11: zero-bytes signature (valid base64url, crypto fails) → throws ✓
```

All errors are `LineageIntegrityError` with message "lineage integrity verification failed" (no PII leaked).

**Conclusion:** Fail-closed posture is correct. No silent acceptance of invalid records.

---

### P-07: No PII disclosure in error messages (Verified)

**Severity:** Non-blocking (design verification)  
**Evidence:**

```
Test: verify with tampered subjectDigest
Error thrown: LineageIntegrityError("lineage integrity verification failed")
Error message does NOT contain:
  - subjectDigest value
  - agentId values
  - lineageDigest value
  - any contributor info
```

**Conclusion:** Error messages are sanitized. Safe for logging in untrusted environments.

---

## Residual Risks

1. **Caller skips schema validation (P-01):**
   - Risk: accepts records with duplicate contributors
   - Mitigation: recommend deduplication in buildLineage (Option A above), or mandatory schema validation in consuming layer
   - Residual: Low if schema validation is enforced at the boundary (e.g., API envelope validation)

2. **Ed25519 key management not in scope:**
   - Risk: private key compromise → forged signatures
   - Mitigation: documented as "deferred to owner key ceremony (WP-G2-Z01 / decision P3)"
   - Residual: Acceptable (key ceremony is explicit scope separation)

3. **SHA-256 collision (cryptographically implausible):**
   - Risk: two records with different content, same digest
   - Mitigation: NIST SHA-256 collision resistance assumption
   - Residual: Negligible (2^128 work factor)

---

## Security Checklist (K4 Attack Surface)

| Axis                                      | Status  | Evidence                                                                             |
| ----------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| **Signature forgery without private key** | ✓ PASS  | Ed25519 algorithm is non-invertible; edVerify rejects unsigned/wrong-key records     |
| **Canonical form ambiguity**              | ✓ PASS  | Length-prefix eliminates field-boundary shifts; array counts prefixed                |
| **Digest collision**                      | ✓ PASS  | SHA-256 collision resistance assumed (NIST standard)                                 |
| **Role enum bypass**                      | ✓ PASS  | Enum enforced at build + schema layer; unknown roles throw                           |
| **PII leakage in errors**                 | ✓ PASS  | Error messages generic; no digests/IDs disclosed                                     |
| **Fail-open on crypto error**             | ✓ PASS  | All failures throw LineageIntegrityError (fail-closed)                               |
| **Malformed input tolerance**             | ✓ PASS  | edVerify rejects truncated/invalid signatures (compensates for Buffer.from leniency) |
| **Record duplication bypass**             | ⚠ MINOR | Schema layer enforces uniqueItems; brick does not — see P-01                         |

---

## Approval Conditions

**Verdict:** `APPROVE-WITH-MINOR-RESERVATIONS`

**Conditions to clear this verdict:**

1. **Before production deployment of buildLineage():**
   - Implement deduplication of contributors in `buildLineage()` (Option A, P-01), OR
   - Document in JSDoc that schema validation is **mandatory** and provide a clear example in consuming code (Option B)

2. **Mandatory:** consuming layers MUST validate produced records against `agent-contributor-lineage.v1.schema.json` before storing or processing

3. **Recommended (non-blocking):** add a comment in `verifyLineage()` documenting that Buffer.from leniency is intentional and edVerify is the authoritative gate

**Not Blocking:**

- Key ceremony deferral (P3) is documented and out-of-scope for this pass
- No crypto vulnerabilities detected
- All fail-closed gates verified

---

## Sign-Off

**Review Pass:** K4 independent adversarial (security/crypto focus)  
**Model:** Claude Haiku 4.5  
**Session:** independent code review pass (no authorship involvement)  
**Date:** 2026-07-20  
**Verdict:** `APPROVE-WITH-MINOR-RESERVATIONS` (P-01 requires attention before production use)

---

## Appendix: Test Execution Log

### Command 1: Full K4 test suite

```bash
$ bun test /private/tmp/claude-502/scratchpad/provenance-review.test.ts
bun test v1.3.11 (af24e281)
 32 pass
 0 fail
 53 expect() calls
Ran 32 tests across 1 file. [815.00ms]
```

### Command 2: Uniqueness test

```bash
$ bun run /private/tmp/claude-502/scratchpad/test-duplicates.ts
Record built successfully, checking schema validation...
Contributors: 2
Schema validation FAILED (GOOD):
 - /contributors uniqueItems: #/properties/contributors/uniqueItems
```

### Command 3: Cryptographic edge cases

```bash
$ bun run /private/tmp/claude-502/scratchpad/test-crypto-edge-cases.ts
=== Test 1: Signature too short ===
PASS: short signature rejected with LineageIntegrityError
=== Test 2: Signature too long ===
PASS: long signature rejected
=== Test 3: Invalid base64url chars ===
PASS: malformed signature rejected
=== Test 4: Signature all zeros ===
PASS: zero signature rejected
=== Test 5: LineageDigest altered ===
PASS: altered digest rejected
```

### Command 4: Buffer.from behavior

```bash
$ bun run /private/tmp/claude-502/scratchpad/test-buffer-base64url.ts
1. Valid base64url:
   Input length: 86
   Output bytes: 64
   ✓ Success
2. Invalid char @:
   Output bytes: 63
   ⚠ SILENTLY ACCEPTED (truncated?)
3. Too short (85 chars):
   Output bytes: 63
   ⚠ ACCEPTED (bytes < 64?)
4. All invalid chars:
   Output bytes: 0
   ⚠ ACCEPTED
...
Conclusion: Buffer.from(str, 'base64url') is lenient.
The provenance brick RELIES on edVerify() to fail on wrong bytes.
This is correct: edVerify() will reject invalid signatures.
```

---

## References

- **Code:** `packages/provenance/src/index.ts` (221 lines)
- **Tests:** `packages/provenance/src/provenance.test.ts`
- **Contract:** `contracts/schemas/agent-contributor-lineage.v1.schema.json`
- **Protocol:** `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Commit:** `1f1b5b3` (feat: Ed25519 agent contributor lineage wave 2, couche 3)
