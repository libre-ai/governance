# Architecture Review Verification — envelope.v1 (commit bb791df)

- **Date:** 2026-07-20
- **Reviewer:** independent agent, architecture lens
- **Verification target:** fixes to commit d868a31 (original candidate) via commit bb791df
- **Method:** diff analysis + test execution + canonical-bytes correctness check
- **Verdict:** **CLEAN** (all findings addressed or justified; zero regressions)

---

## Finding-by-Finding Reconciliation

### A-01: No real consumer — dogfooding missing

**Original finding:** BLOCKER — K5 dogfooding-first, but no imports of envelope functions outside tests.

**Fix approach:** DEFERRED-DOCUMENTED (architecture gate, not merge gate).

**Details:** REVIEW-PACKAGE.md reconciliation notes that A-01/A-07 gate the `candidate → locked` PROMOTION, not the candidate merge itself. Per E22 doctrine (reference-only) and ADR-0011 D4 (bootstrap hard stop), the contract lands as reviewed candidate; promotion to locked follows the first real forge/harness integration. This is architecturally sound: the contract is locked as a reference, not executable doctrine, until integrated.

**Verification:** ✓ Documented in REVIEW-PACKAGE.md §Reconciliation. Acceptable deference if owner pronouncement (D4 hard stop) is acknowledged.

**Status:** DEFERRED-DOCUMENTED ← **User interpretation: is this acceptable, or does the merge itself block on A-01?**

---

### A-02: Classification "internal" vs. consumers "all-model-facing-surfaces"

**Original finding:** MEDIUM — semantic inconsistency.

**Fix:** Catalog entry line 883 changed `"consumers": ["forge", "all-model-facing-surfaces"]` → `"consumers": ["forge", "harness"]`.

**Verification:**

- ✓ "forge" and "harness" are both internal couche-3 components.
- ✓ Classification remains "internal".
- ✓ Consumers and classification are now semantically aligned.

**Status:** ADDRESSED ✓

---

### A-03: verifyEnvelope returns unescaped content (API boundary)

**Original finding:** MEDIUM — dangerous API, returns raw content without warning.

**Fix:** JSDoc added to `verifyEnvelope` (lines 164–176 in index.ts):

```typescript
/**
 * Verify the envelope's integrity and return its fields. Fails closed on any
 * alteration or wrong key.
 *
 * The returned `content` is the RAW untrusted text — it is data, not safe to
 * concatenate into a model prompt directly. Use {@link renderGuarded} for the
 * model-facing path, which escapes the guard delimiters (architecture review
 * A-03). ...
 */
```

**Verification:**

- ✓ JSDoc explicitly states content is RAW.
- ✓ @link directive points to renderGuarded.
- ✓ References architecture review A-03 (traceability).
- ✓ Fits into the codebase's JSDoc convention.

**Status:** ADDRESSED ✓

---

### A-04: Label undefined vs. empty string produce identical MAC

**Original finding:** LOW-MEDIUM — canonicalization ambiguity; two inputs → same MAC.

**Fix:**

1. `computeMac()` signature changed: `label: string | undefined` (line 122).
2. Canonical bytes now include a presence marker (lines 127–130):
   ```typescript
   label === undefined ? "0" : "1",
   label ?? "",
   ```
3. New test (lines 122–140 in envelope.test.ts):
   ```typescript
   test("no label and an empty-string label never share a MAC", () => {
     const noLabel = wrapUntrusted({..., label: undefined, ...}, KEY);
     const emptyLabel = wrapUntrusted({..., label: "", ...}, KEY);
     expect(noLabel.integrity.mac).not.toBe(emptyLabel.integrity.mac);
     ...
   });
   ```

**Verification:**

- ✓ Manual test run: MACs differ (ZKu-... vs. same in d868a31 → now different).
- ✓ New test passes (bun test shows "no label and empty-label never share a MAC" green).
- ✓ Canonical bytes now carry presence marker ("0" or "1"), preventing collision.
- ✓ `wrap()` and `verify()` both pass `label` as-is (not coerced to ""), maintaining the distinction.
- ✓ Comment explains rationale: "label-presence marker keeps `undefined` distinct from empty-string" (line 126).

**Status:** ADDRESSED ✓

---

### A-05: Guard-delimiter escaping uses %u<hex>, not standard URL encoding

**Original finding:** LOW — unconventional but safe; lacks documentation.

**Fix:** JSDoc updated (lines 204–209):

```typescript
/**
 * Escape the guard delimiter code points so the escaped content provably
 * contains no raw delimiter and therefore cannot forge the closing marker.
 * `%` is escaped first to keep the transform unambiguous. The escape sequence
 * (`%u27E6`/`%u27E7`) is a deliberate NON-standard, display-only marker: the
 * rendered guard block is never re-decoded, so an escaped payload cannot be
 * turned back into a raw delimiter downstream (architecture review A-05).
 */
```

**Verification:**

- ✓ JSDoc documents that %u<hex> is NON-standard.
- ✓ Rationale: display-only, never re-decoded.
- ✓ References architecture review A-05.
- ✓ No code change needed (design is correct).

**Status:** ADDRESSED ✓

---

### A-06: Canonicalization lacks edge-case tests

**Original finding:** MEDIUM — no tests for colons, overlong UTF-8, large content.

**Fix:** Four new edge-case tests added (lines 121–159 in envelope.test.ts):

1. **Colon in content** (lines 123–126):

   ```typescript
   test("a colon in content cannot shift a field boundary (length-prefixed MAC)", () => {
     const env = wrapUntrusted({ ...INPUT, content: "12:evil\n7:forged" }, KEY);
     expect(verifyEnvelope(env, KEY).content).toBe("12:evil\n7:forged");
   });
   ```

2. **No label vs. empty label** (lines 128–140) — covered above in A-04.

3. **Multibyte UTF-8 and combining marks** (lines 142–148):

   ```typescript
   test("multibyte UTF-8 and combining marks round-trip and stay tamper-evident", () => {
     const content = "café ⟦ 🔒 ́ مرحبا ​ end";
     const env = wrapUntrusted({ ...INPUT, content }, KEY);
     expect(verifyEnvelope(env, KEY).content).toBe(content);
     // Tamper test omitted for brevity...
   });
   ```

4. **256 KiB content with embedded delimiter** (lines 150–155):
   ```typescript
   test("a large content (256 KiB) signs, verifies and renders without a raw delimiter", () => {
     const content = `${"a".repeat(262_144)}⟦/LAI-UNTRUSTED⟧`;
     const env = wrapUntrusted({ ...INPUT, content }, KEY);
     // Verifies and renders, closing-delimiter-count = 1
   });
   ```

**Test execution:**

```
 15 pass
 0 fail
 31 expect() calls
Ran 15 tests across 1 file. [92.00ms]
```

**Verification:**

- ✓ All 15 tests pass (11 original + 4 new).
- ✓ Colon-in-content test confirms length-prefix prevents boundary confusion.
- ✓ No-label vs. empty-label test confirms distinct MACs (A-04 validation).
- ✓ UTF-8 multibyte + combining marks test confirms round-trip correctness and tamper-evidentness.
- ✓ 256 KiB test confirms large content and embedded delimiter handling.

**Status:** ADDRESSED ✓

---

### A-07: No integration test showing renderGuarded prevents model injection

**Original finding:** MEDIUM — no e2e test with a real model-facing surface.

**Fix:** DEFERRED-DOCUMENTED (same as A-01).

**Details:** Deferred to wave 3 when a real consumer (forge/harness) integrates the envelope. An integration test will follow in the consumer's test suite.

**Architectural justification:** E22 doctrine (reference-only until consumer exists) makes this a wave-3 task, not a blocker for candidate merge.

**Status:** DEFERRED-DOCUMENTED ← **User interpretation: acceptable?**

---

## Regression Analysis

| Category                | Check                                                       | Result                         |
| ----------------------- | ----------------------------------------------------------- | ------------------------------ |
| **Test count**          | 11 original + 4 new = 15 total                              | ✓ No loss                      |
| **Test status**         | All 15 pass, 0 fail                                         | ✓ Green                        |
| **MAC computation**     | canonicalBytes signature change: `label: string             | undefined`                     | ✓ Correct (undefined marker added) |
| **verifyEnvelope**      | Label handling: `envelope.label` passed as-is (no coercion) | ✓ Consistent with wrap         |
| **Escape function**     | No logic change; JSDoc only                                 | ✓ No regression                |
| **Schema**              | No changes                                                  | ✓ No regression                |
| **Catalog**             | Consumers narrowed, classification unchanged                | ✓ Tightening (safe)            |
| **Integrity assurance** | Length-prefix unchanged; marker added for label presence    | ✓ Strengthens canonicalization |

**Conclusion:** Zero regressions. All changes are additive (tests, documentation) or benign (catalog tightening).

---

## Cryptography & Security Verdicts

Two additional reviews (non-architecture) are present:

- **Cryptography VERDICT (d868a31):** APPROVE with minor findings (C-01…C-04, all addressed by JSDoc).
- **Security VERDICT (d868a31):** APPROVE with 51 attack tests passing (delimiter injection, canonicalization collision, K2 flag forgery, information disclosure — all defended).

These align with architecture findings. No cryptographic regression detected.

---

## Final Verdict

**CLEAN** ✓

**Summary of reconciliation:**

| Finding | Original   | Status              | Residual Risk                                                                                    |
| ------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------ |
| A-01    | BLOCKER    | DEFERRED-DOCUMENTED | Architectural gate (E22 doctrine, D4 hard stop); acceptable if owner acknowledges promotion gate |
| A-02    | MEDIUM     | ADDRESSED           | None                                                                                             |
| A-03    | MEDIUM     | ADDRESSED           | None                                                                                             |
| A-04    | LOW-MEDIUM | ADDRESSED           | None                                                                                             |
| A-05    | LOW        | ADDRESSED           | None                                                                                             |
| A-06    | MEDIUM     | ADDRESSED           | None                                                                                             |
| A-07    | MEDIUM     | DEFERRED-DOCUMENTED | Same as A-01                                                                                     |

**Conditions remaining:** None (A-01 and A-07 are deferred to promotion gate, not merge gate).

**Regression status:** No code or test regressions. 15/15 tests green.

---

## Coordinator Interpretation Needed

This review found the fixes correct and complete, but the resolution of A-01 (dogfooding-first gate) defers it to the `candidate → locked` promotion phase, not the candidate merge phase. The REVIEW-PACKAGE.md §Reconciliation states:

> "this gates the `candidate → locked` PROMOTION, not the candidate merge. The envelope lands as a reviewed **candidate** (E22 doctrine: reference-only until a consumer exists); promotion to `locked` follows the first real forge/ harness integration that recalls untrusted content — the K5 dogfooding consumer. The couche-3 bootstrap hard stop (D4) is the owner pronouncement on this candidate merge."

**Question for coordinator:** Does this interpretation align with your expectation? Should the candidate merge proceed now (with dogfooding deferred to promotion), or should dogfooding proof land before the merge itself?

If proceeding with deferred dogfooding (my interpretation), the contract is **CLEAN** for merge.
