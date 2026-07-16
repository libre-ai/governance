# policy-core-v2 candidate review dossier

## Status

This is a contract candidate. It is not locked for release or authorized for product implementation
until separate Architecture, Security and Privacy review agents approve it under
[`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). Each reviewer agent/session differs
from the authoring agent/session; the repository owner's merge decision is not a technical review.

## Candidate authorities

- `contracts/schemas/policy-definition.v2.schema.json`
- `contracts/schemas/policy-need.v2.schema.json`
- `contracts/schemas/model-snapshot.v2.schema.json`
- `contracts/schemas/policy-evaluation.v2.schema.json`
- `contracts/openapi/model-policy.v2.yaml`
- `contracts/wit/policy-core-v2/world.wit`
- `contracts/wit/policy-core-v2/SEMANTICS.md`
- `contracts/fixtures/policy-core-v2/operators.json`
- `contracts/fixtures/policy-core-v2/golden.json`
- `contracts/fixtures/policy-core-v2/resource-budgets.v1.json`
- `contracts/fixtures/policy-core-invalid-json/manifest.json` and its byte-exact `.bin` inputs

## Review claims

1. Operator/value combinations are closed and use no coercion.
2. Exact duplicates are invalid; multiple same-name facts use universal semantics
   and reduce as `failed > unknown > satisfied`.
3. Missing, stale, future-dated and type-mismatched facts cannot produce
   `satisfied`.
4. `unknown` can produce only `indeterminate` or policy-selected `ineligible`,
   never `eligible`.
5. Policy, snapshot and need tenant IDs must match before evaluation.
6. Jurisdiction is read only from its exact fact and is never inferred from
   provider/model/company origin or hosting country.
7. RFC 8785 normalization, SHA-256 domains, evaluation ID/digest and sorted
   `ruleResults` are specified byte-for-byte.
8. The WIT world imports no host capability.
9. The result is advisory eligibility evidence only. It cannot approve a policy,
   rank suppliers, buy, deploy or trigger a transaction.
10. `proposedBy` and the human `approval.approverId` are distinct; an agent cannot approve.
11. `engineVersion` is an immutable component constant and is never caller-controlled.
12. Rust must preserve the same IEEE-754 binary64 value as TypeScript before RFC
    8785 canonicalization.
13. Preimplementation ceilings bound semantic work to 1,000,000 rule/occurrence
    evaluations, set lookup to 7 comparisons and peak component memory to 256 MiB.

## Adversarial findings already incorporated

- decimal JCS thresholds and negative zero are explicit cross-runtime test cases;
- `serde_json/float_roundtrip` is mandatory in the workspace to prevent binary64
  parsing drift;
- schema-valid duplicate rule IDs have a complete `rule-id-duplicate` vector;
- all six closed WIT error variants have complete, precedence-compatible cases;
- nine byte-exact inputs cover BOM, invalid UTF-8, duplicate decoded keys, isolated
  surrogates and invalid JSON numbers in independent TypeScript and Rust decoders;
- the resolved WIT world exports one `api` and is asserted to have zero imports;
- ten exact/+1 byte boundaries and JSON depth 64 are executable in both TypeScript
  and Rust before any product engine exists; exact inputs remain schema-valid and
  the exact 2 MiB output remains valid, digest-bound JCS;
- source URIs are bounded sanitized public HTTPS citations without userinfo,
  query or fragment, and principal IDs are opaque `usr_*`/`svc_*` values;
- approval authenticity remains an authorized-caller check, distinct from evaluator separation/binding.

## Required independent agent checks

The Architecture review agent must:

- challenge every operator/type/cardinality branch and verdict transition;
- confirm that schema, OpenAPI, WIT and semantic profile describe one boundary;
- independently recompute at least one success digest, one order-independence pair
  and one error vector in both TypeScript and Rust;
- confirm that no Rust engine or application implementation is hidden in this
  candidate;
- challenge the cardinality-derived CPU ceilings and 256 MiB peak-memory
  qualification budget before any implementation begins.

The Security review agent must:

- attempt tenant substitution, digest substitution, duplicate-key and duplicate-
  fact inputs;
- attempt to obtain `eligible` from absent, stale, future or wrong-typed facts;
- attempt origin/jurisdiction conflation and satisfying-occurrence cherry-picking;
- confirm bounded arrays/strings/numbers, exact/+1 preflight, depth refusal,
  constant non-sensitive errors and no network/clock/storage/randomness capability;
- reject quadratic full-set scans and any valid-input resource refusal caused by
  an implementation exceeding the candidate memory budget;
- confirm that no result grants authorization, purchasing power or approval.

The Privacy review agent must confirm tenant-bound minimization, sanitized source
citations without personal data or secrets, opaque proposer/reviewer IDs, sourced
facts without personal fixture data, and that outputs/logs/errors expose neither
fact values nor reviewer identity.

## Promotion rule

Promotion from `candidate` to `locked` requires recorded Architecture, Security and Privacy agent
verdicts from separate review-only passes, followed by the full contract, generated-projection and
cross-runtime conformance gates. A generator, evaluator, CI job or authoring agent cannot promote
this candidate automatically; the repository owner remains merge authority, not technical reviewer.
