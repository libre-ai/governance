# Independent Adversarial Review — K2 Data Reliability Classification

**Review ID:** `classification-v1-f2c4706`  
**Review Role:** Security + Architecture  
**Reviewed Commit:** `f2c4706` (feat: K2 data reliability classification, wave 2)  
**Review Date:** 2026-07-20  
**Reviewer:** Independent agent, role-separated from authoring  
**Protocol:** `docs/reviews/AGENT-REVIEW-PROTOCOL.md`

## Scope

K2 `@libre-ai/classification` — a data reliability classification module implementing the loop-security kernel invariant:

> "No write to a source of truth may be justified by `operational` data alone."

Files reviewed:

- `packages/classification/src/index.ts` (71 lines)
- `packages/classification/src/classification.test.ts` (92 lines)
- `packages/classification/package.json` (35 lines)

Authority source: `ecosystem/specs/shared/loop-security-kernel.md` in the `constantin-jais` repo (K2 §data-reliability-classification)

---

## Findings

### K-01: MAJOR — Untrusted JSON deserialization bypass

**Severity:** Major (breaks K2 invariant in production use)

**Constat:**
The `Classified<T>` interface can be constructed from untrusted JSON (HTTP responses, file input, API payloads) without passing through `classify()` or `deriveFrom()`. Once deserialized, an object `{ reliability: "authoritative", value: ... }` will pass `requireAuthorityFor()` regardless of actual provenance.

**Evidence:**

```bash
$ const untrusted = JSON.parse('{"reliability":"authoritative","value":{"attack":"execute"}}');
$ requireAuthorityFor("gates", untrusted);  // Does NOT throw — accepts false authority
```

Proof: test file `k2-deserialization-test.ts`, output confirms acceptance.

**Root Cause:**
No runtime validation in `requireAuthorityFor()` that the payload was constructed via the canonical API. The invariant depends on **all** `Classified` objects originating from `classify()` or `deriveFrom()`, but there is no mechanism to enforce or detect violations.

**Impact:**
Any code path that deserializes external data into `Classified` (REST API handlers, file loaders, message brokers) becomes a vector for injecting false authority. Example:

```typescript
// Handler receives JSON from untrusted network
const payload: Classified<DoctrineUpdate> = JSON.parse(request.body);
requireAuthorityFor("invariants-register", payload); // FAILS OPEN
```

**Mitigation Options:**

1. (Design A) Require a sealing mechanism: `classify()` and `deriveFrom()` return a sealed/frozen object; `requireAuthorityFor()` checks the seal before accepting. Adds 1-2 lines per factory, prevents post-hoc construction.
2. (Design B) Add a validator: export `isCanonicalClassified<T>(obj: unknown): obj is Classified<T>` that performs structural checks. Requires caller discipline.
3. (Design C) Reject deserialization and enforce the bricks remain in-memory only. Requires API contract documentation.

**Recommendation:**
**REJECT as-is.** Design A (sealing with Symbol or WeakMap) is minimal and provides fail-closed semantics. Implement before accepting any `operational` data sources (REST handlers, external APIs).

---

### K-02: MAJOR — Runtime mutation attack via type-unsafe casting

**Severity:** Major (requires adversarial code but easy to exploit)

**Constat:**
Although `Classified<T>` declares `readonly` fields in TypeScript, the returned objects are not frozen at runtime. Code using `(payload as any).reliability = "authoritative"` can mutate `Classified` objects after creation and bypass `requireAuthorityFor()`.

**Evidence:**

```typescript
const op = classify("operational", { secret: "x" });
(op as any).reliability = "authoritative";
requireAuthorityFor("gates", op); // ACCEPTS mutated object
```

Proof: test file `k2-adversarial-test.ts`, steps 1–3.

**Root Cause:**
Objects returned by `classify()` and `deriveFrom()` are not frozen with `Object.freeze()`. TypeScript `readonly` is a compile-time constraint; at runtime, property assignment succeeds silently (or throws in strict mode, but the object is already mutated in the temporary assignment).

**Impact:**
Lower risk than K-01 (requires deliberate `as any` casting or transpiler bypass), but:

- Accidental mutations via type casting in a large codebase are plausible.
- Runtime errors in other parts of the code could corrupt a `Classified` before it reaches `requireAuthorityFor()`.

**Mitigation:**
Apply `Object.freeze()` to all returned objects:

```typescript
export function classify<T>(reliability: Reliability, value: T): Classified<T> {
  if (!isReliability(reliability)) throw new RangeError(...);
  return Object.freeze({ reliability, value });
}
// Same for deriveFrom()
```

**Evidence of feasibility:**
Test `k2-freeze-test.ts` confirms that `Object.freeze()` enforces true immutability:

```bash
$ Object.freeze({...}).reliability = "x";  // Throws: Attempted to assign to readonly property
```

**Recommendation:**
Add `Object.freeze()` to both `classify()` and `deriveFrom()`. Fixes in ~4 lines; increases safety from "compile-time only" to "fail-closed at runtime."

---

### K-03: MINOR — No provenance tracing beyond immediate sources

**Severity:** Minor (not exploitable with well-formed construction)

**Constat:**
`deriveFrom()` accepts sources that are themselves `derived` without verifying those sources ultimately came from `authoritative` data. Tracing stops at one level.

**Evidence:**

```typescript
const auth = classify("authoritative", {});
const d1 = deriveFrom({}, [auth]); // d1.reliability = "derived"
const d2 = deriveFrom({}, [d1]); // d2.reliability = "derived"
// No check that d1 itself is trustworthy
```

**Spec alignment:**
K2 documentation states: "`derived` — computed from authoritative, **tracing to its authoritative spans**." The implementation traces one level; the spec hints at deeper provenance.

**Context:**
This is **not an exploitable bug** if all `Classified` objects are constructed via `classify()` and `deriveFrom()` (see K-01 for why that assumption is currently violated). If objects are well-formed, the chain is implicitly correct by construction.

**Impact:**
Minimal if K-01 is fixed (deserialization prevented). Residual risk: if code serializes/deserializes intermediate `derived` objects across service boundaries, there is no way to audit the full chain.

**Recommendation:**
Document the invariant clearly. Add a note in `deriveFrom()` docstring:

> "Sources must be Classified objects exclusively constructed via classify() or deriveFrom() within this realm. Deserialized objects are not accepted."

No code change required if K-01 is fixed and API contract is enforced.

---

### K-04: PASS — Fail-closed on unknown reliability class

**Severity:** None (pass)

**Constat:**
`classify()` rejects unknown reliability values at runtime:

```typescript
export function classify<T>(reliability: Reliability, value: T): Classified<T> {
  if (!isReliability(reliability)) {
    throw new RangeError(
      `unknown reliability class ${JSON.stringify(reliability)}`,
    );
  }
  return { reliability, value };
}
```

**Evidence:**
Test `classification.test.ts:27–29`. Also verified: `Reliability` type is a union of the three literal strings, structurally closed at compile-time.

**✓ Confirmed:** Unknown values are rejected with clear error message.

---

### K-05: PASS — No PII divulgation in error messages

**Severity:** None (pass)

**Constat:**
`OperationalNotAuthorityError` formats messages as:

```
"${reliability} data may not authorize a write to ${sink} (K2: only authoritative may)"
```

Only `reliability` (one of 3 enum values) and `sink` (a string identifier) are included. The payload value is **never** echoed.

**Evidence:**
Test `classification.test.ts:58–68`:

```typescript
test("the error names the sink but never echoes the payload value", () => {
  const op = classify("operational", { secret: "leak-me" });
  requireAuthorityFor("revocation-list", op);
  expect(String(error)).toContain("revocation-list");
  expect(String(error)).not.toContain("leak-me"); // ✓ Verified
});
```

**✓ Confirmed:** Error messages are safe for logging.

---

### K-06: PASS — Operational tainting is transitive and order-independent

**Severity:** None (pass)

**Constat:**
The `deriveFrom()` logic taints derivations correctly:

```typescript
const reliability = sources.some((s) => s.reliability === "operational")
  ? "operational"
  : "derived";
```

If **any** source is `operational`, the result is `operational`. Order does not matter; the `some()` check is commutative.

**Evidence:**
Test `k2-adversarial-test.ts:8–10`:

```
mixed1 (op, auth): operational
mixed2 (auth, op): operational
Both tainted?: YES
```

**✓ Confirmed:** Operational data cannot be "laundered" into derived/authoritative via derivation order tricks.

---

### K-07: PASS — Empty source set is rejected

**Severity:** None (pass)

**Constat:**
`deriveFrom()` enforces at least one source:

```typescript
if (sources.length === 0) {
  throw new RangeError("a derivation requires at least one source");
}
```

**Evidence:**
Test `classification.test.ts:89–91`.

**✓ Confirmed:** Cannot derive from void.

---

### K-08: PASS — Topology isolation (K2 vs K3 separation)

**Severity:** None (pass)

**Constat:**
K2 (classification) and K3 (envelope, integrity signing) are separate bricks with no cross-imports. No doublon of responsibility; clean separation of concerns.

**Evidence:**
Grep search: zero imports of `@libre-ai/classification` in `packages/envelope/`; zero imports of envelope in classification.

**✓ Confirmed:** No coupling risk.

---

### K-09: INFO — Reference-only status (no real consumers)

**Severity:** None (informational)

**Constat:**
Package marked `"private": true`. No imports from other packages in the monorepo. This is a specification brick, awaiting integration.

**Status:** Appropriate for wave 2 (specification lock + candidate implementation). The two blocking findings (K-01, K-02) must be resolved before K2 is **used** as a gating mechanism in production code paths.

---

## Summary Table

| Finding                             | Severity | Category     | Mitigation                          | Fixable        |
| ----------------------------------- | -------- | ------------ | ----------------------------------- | -------------- |
| K-01: JSON deserialization bypass   | MAJOR    | Security     | Seal/freeze + isCanonical validator | Yes, ~10 lines |
| K-02: Runtime mutation via `as any` | MAJOR    | Robustness   | Add Object.freeze()                 | Yes, ~4 lines  |
| K-03: No deep provenance tracing    | MINOR    | Design       | Document invariant                  | No code change |
| K-04: Unknown reliability handling  | PASS     | Security     | —                                   | —              |
| K-05: Error message safety          | PASS     | Privacy      | —                                   | —              |
| K-06: Operational tainting          | PASS     | Logic        | —                                   | —              |
| K-07: Empty source handling         | PASS     | Robustness   | —                                   | —              |
| K-08: K2/K3 topology                | PASS     | Architecture | —                                   | —              |
| K-09: Reference-only status         | INFO     | Lifecycle    | —                                   | —              |

---

## Verdict

**APPROVE-WITH-BLOCKING-CONDITIONS**

### Rationale

The K2 specification is **correctly and clearly expressed** in code. The API design (three `Reliability` states, fail-closed invariants, error safety) is sound.

**However**, two blocking findings prevent this bricks from being consumed by production code paths:

1. **K-01 (JSON deserialization)** — the bricks assumes all `Classified` objects originate from its own factory functions, but provides no enforcement. Any REST handler, file loader, or message-stream consumer can inject false authority.

2. **K-02 (runtime mutation)** — while mitigatable with `Object.freeze()`, the current implementation relies entirely on TypeScript `readonly`, which provides zero runtime protection.

Both are **fixable in <20 lines of code** and require no design change. Once fixed, the bricks becomes **fail-closed and production-ready**.

### Conditions for Merge

Before PR #138 is merged into `main` or `candidate`:

1. ✗ **BLOCKING:** Add `Object.freeze()` to `classify()` and `deriveFrom()` return values.
2. ✗ **BLOCKING:** Implement one of Design A–C for deserialization (recommend: sealing with Symbol or isCanonical validator).
3. ✓ (Nice-to-have) Document the provenance invariant in docstrings (K-03).

### Post-Merge

Once conditions 1–2 are met:

- Merge to `main`.
- Update `contracts/catalog.v1.json` to promote K2 from `candidate` to `locked`.
- Wave 3 execution can proceed with K2 as a gating mechanism.

---

## Test Evidence

All provided tests pass (10/10 ✓). Additional adversarial tests confirm the findings:

- `k2-adversarial-test.ts` — mutation and derivation chain tests
- `k2-deserialization-test.ts` — JSON bypass proof
- `k2-freeze-test.ts` — Object.freeze() feasibility

Test commands:

```bash
bun test packages/classification/src/classification.test.ts  # ✓ 10/10 pass
bun run /scratchpad/k2-*.ts                                  # Adversarial evidence
```

---

**Review completed:** 2026-07-20, 14:32 UTC  
**Reviewer model:** Claude Haiku 4.5 (independent security + architecture pass)
