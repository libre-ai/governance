# policy-core-v2 candidate review dossier

## Status

This is a contract candidate. It is not approved, locked for release or authorized
for implementation until independent Architecture, Security and Privacy reviewers accept it.
The author or future implementer cannot supply any of these acceptances.

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

## Required independent checks

Architecture review must:

- challenge every operator/type/cardinality branch and verdict transition;
- confirm that schema, OpenAPI, WIT and semantic profile describe one boundary;
- independently recompute at least one success digest, one order-independence pair
  and one error vector in both TypeScript and Rust;
- confirm that no Rust engine or application implementation is hidden in this
  candidate.

Security review must:

- attempt tenant substitution, digest substitution, duplicate-key and duplicate-
  fact inputs;
- attempt to obtain `eligible` from absent, stale, future or wrong-typed facts;
- attempt origin/jurisdiction conflation and satisfying-occurrence cherry-picking;
- confirm bounded arrays/strings/numbers, constant non-sensitive errors and no
  network/clock/storage/randomness capability;
- confirm that no result grants authorization, purchasing power or approval.

Privacy review must confirm tenant-bound minimization, sourced facts without personal fixture data, and that logs/errors expose neither fact values nor reviewer identity.

## Promotion rule

Promotion from `candidate` to `locked` requires recorded, independent human
acceptance from Architecture, Security and Privacy, followed by the full contract,
generated-projection and cross-runtime conformance gates. A generator, evaluator,
CI job or author cannot promote this candidate automatically.
