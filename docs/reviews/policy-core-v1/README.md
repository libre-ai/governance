# policy-core-v1 review dossier

## Status

Human acceptance is recorded by the explicit session instruction
`validé par humain, continuer`. No generator, evaluator, CI job or author supplied
that acceptance. Contract, generated-projection and cross-runtime conformance gates
passed on the isolated branch; the accepted authorities are recorded as `locked`.

## Accepted authorities

- `contracts/schemas/policy-definition.v1.schema.json`
- `contracts/schemas/policy-need.v1.schema.json`
- `contracts/schemas/model-snapshot.v1.schema.json`
- `contracts/schemas/policy-evaluation.v1.schema.json`
- `contracts/openapi/model-policy.v1.yaml`
- `contracts/wit/policy-core-v1/world.wit`
- `contracts/wit/policy-core-v1/SEMANTICS.md`
- `contracts/fixtures/policy-core-v1/operators.json`
- `contracts/fixtures/policy-core-v1/golden.json`

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
10. `engineVersion` is an immutable component constant and is never caller-controlled.
11. Rust enables `serde_json/float_roundtrip` so accepted decimals map to the same
    IEEE-754 binary64 value as TypeScript before RFC 8785 canonicalization.

## Required independent checks

Architecture review must:

- challenge every operator/type/cardinality branch and verdict transition;
- confirm that schema, OpenAPI, WIT and semantic profile describe one boundary;
- independently recompute at least one success digest, one order-independence pair
  and one error vector in both TypeScript and Rust;
- confirm that no Rust engine or application implementation is hidden in this
  contract change.

Security review must:

- attempt tenant substitution, digest substitution, duplicate-key and duplicate-
  fact inputs;
- attempt to obtain `eligible` from absent, stale, future or wrong-typed facts;
- attempt origin/jurisdiction conflation and satisfying-occurrence cherry-picking;
- confirm bounded arrays/strings/numbers, constant non-sensitive errors and no
  network/clock/storage/randomness capability;
- confirm that no result grants authorization, purchasing power or approval.

## Adversarial findings resolved before merge

1. Rust's default JSON number path rendered `0.000001` and `-0` differently from
   RFC 8785. The independent checker now implements the ECMAScript/JCS thresholds
   and exercises decimal, exponent and negative-zero cases.
2. Default `serde_json` parsing mapped a high-precision decimal to a different
   binary64 value than TypeScript. Workspace feature `float_roundtrip` is now
   mandatory; no new package is introduced.
3. A schema-valid duplicate rule ID lacked a complete error vector. The golden
   corpus now fixes `policy.rule_id_duplicate` before any rule evaluation.

## Conformance evidence

- the TypeScript checker validates 17 complete golden cases and 28 operator cases;
- the independent Rust checker recomputes input/evaluation hashes, RFC 8785 edge
  numbers and the stable order pair without implementing operator or verdict logic;
- all 31 JSON Schema projections validate in TypeScript and Rust;
- the WIT world parses without host imports;
- root Bun checks, workspace Rust tests, Clippy, formatting and type checking pass.

## Promotion record

The human gate accepted the Architecture and Security review claims in this
dossier and instructed continuation. All named gates then passed on the isolated
branch, so the catalog records these authorities as `locked`. A generator,
evaluator, CI job or author cannot supply or replace this human acceptance.
