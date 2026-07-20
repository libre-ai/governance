# Envelope v1 — candidate contract review package

- **Status:** candidate, pending independent agent review.
- **Protocol:** this review follows `docs/reviews/AGENT-REVIEW-PROTOCOL.md` —
  role-scoped review passes by agents launched **separately** from the
  implementer (loop-security kernel K4: the implementer does not approve its
  own guardrails).
- **Required independent reviews:** architecture, security, cryptography.
- **Subject:** `contracts/schemas/envelope.v1.schema.json` and its reference
  implementation `packages/envelope` (`@libre-ai/envelope`).

## What this brick is (loop-security kernel K3)

External content — web results, emails, memory recall, tool output, MCP tool
descriptions — is data, never instructions. The envelope wraps it so a
model-facing surface can only present it as guarded, `trusted:false` data, and
so a stripped or altered envelope is detectable offline:

- `wrapUntrusted` tags the content `trusted:false` with its source class and
  signs a **length-prefixed canonical serialization** of the fields with
  HMAC-SHA256. Symmetric integrity — no key ceremony (consistent with the
  deferred Ed25519 signing, WP-G2-Z01).
- `verifyEnvelope` recomputes the MAC in constant time (`timingSafeEqual`) and
  fails closed (`EnvelopeIntegrityError`, no field disclosed) on any alteration
  of content, the `trusted` flag, source, label or timestamp, or a wrong key.
- `renderGuarded` verifies first, then escapes the guard delimiter code points
  so the escaped payload provably contains no raw delimiter and cannot forge
  the closing marker, and wraps it for the model.

## Review lenses

- **Architecture:** contract shape, field set, escaping/rendering boundary,
  consumer surface, fit with the K1–K5 kernel and the couche-3 topology.
- **Security:** injection resistance (delimiter forgery, canonicalization
  ambiguity, unicode/zero-width evasion of the escape), fail-closed behavior,
  no content disclosure in errors, the `trusted:false`/K2 invariant.
- **Cryptography:** MAC construction over the canonical bytes, length-prefix
  domain separation, constant-time comparison, base64url encoding, the honest
  limit that HMAC is a mitigation not authentication of origin, and the
  Ed25519 upgrade path.

## Honest limits carried over (E22)

The envelope is a **mitigation, not enforcement**: it makes external content
structurally presentable only as guarded data, but a model can still be
jailbroken by the guarded text itself. It belongs alongside the structural
defenses (planning-only, refusal-first, K2 non-authority), not instead of them.

## Verdicts

Independent reviewers append their verdicts under
`docs/reviews/envelope-v1/` (one file per lens), then the contract promotes
from `candidate` to `locked`. This first security-critical merge of couche 3
is a bootstrap hard stop (ADR-0011 D4) — the promotion + merge waits for the
owner pronouncement.

## Reconciliation (verdicts on d868a31)

- **Security: APPROVE** — 51 attack tests, no delimiter forgery, no
  canonicalization collision, fail-closed, K2 held. No condition.
- **Cryptography: APPROVE** (minor, doc-only): keyId informational (C-01),
  runtime mac shape assumed schema-validated (C-02), key ≥32 bytes
  recommendation (C-03), deterministic-MAC replay semantics (C-04) — all
  addressed by JSDoc on `EnvelopeKey.secret` and `verifyEnvelope`.
- **Architecture: APPROVE-WITH-CONDITIONS** — addressed at the fix commit:
  - **A-04** (label undefined vs empty share a MAC): FIXED — a label-presence
    marker in the canonical bytes; new test proves distinct MACs.
  - **A-02** (classification/consumers): consumers tightened to
    `["forge", "harness"]` (internal).
  - **A-03** (verifyEnvelope returns raw content): JSDoc directs the
    model-facing path to `renderGuarded`.
  - **A-05** (non-standard escape): JSDoc documents the display-only,
    never-re-decoded marker.
  - **A-06** (edge tests): added — colon-in-content, no-label vs empty-label,
    multibyte UTF-8 / combining marks, 256 KiB content with an embedded
    delimiter. 15 tests green.
  - **A-01 / A-07 (no real consumer, dogfooding)**: this gates the
    `candidate → locked` PROMOTION, not the candidate merge. The envelope
    lands as a reviewed **candidate** (E22 doctrine: reference-only until a
    consumer exists); promotion to `locked` follows the first real forge/
    harness integration that recalls untrusted content — the K5 dogfooding
    consumer. The couche-3 bootstrap hard stop (D4) is the owner pronouncement
    on this candidate merge.
