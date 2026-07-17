# Specialized engine golden-vector envelope — security remediation

Status: **candidate remediation; fresh Architecture and Security verdicts required**.

This increment responds to `ENGSEC-BLK-001` and `ENGSEC-MAJ-001` in
[`SECURITY-VERDICT.md`](SECURITY-VERDICT.md). The historical verdict targets immutable commit
`9b376cf65755f7556866123f9fddf681a709a2f0` and remains an audit record.

## Closed boundaries

- Every former unconstrained `true` payload slot now uses a recursive public-test JSON value with
  bounded strings, arrays and objects.
- The repository gate applies an 8 MiB file ceiling, depth 64 and 200,000-node ceiling before an
  envelope can qualify.
- `contractFiles` is a closed list of repository-relative `contracts/…` paths and lowercase SHA-256
  values. Traversal, URI and absolute forms are rejected. The gate rejects symlinks, paths escaping
  the repository, missing files and hash mismatches.
- High-confidence credential material, private-key headers and standalone email identifiers are
  rejected by the shared schema. Committed payloads remain synthetic public test material; secret
  canaries used by engine-specific refusal tests are not credentials.
- Radar, Notebook, Policy v1/v2 and Boussole golden corpora are all compiled against this shared
  envelope by `check-contracts.ts`; engine-specific checkers remain authoritative for semantics and
  expected outputs.
- The shared Boussole envelope requires `world`, `status` and `cases`; its checker requires the exact
  `boussole-scoring-v2` world and validates the envelope before reading cases.
- TypeScript and Rust static generation treat only the explicitly commented recursive public-test
  value as opaque. Runtime JSON Schema validation remains authoritative, and generated projections
  are not product input boundaries.

## Executable negative evidence

`schema-fixtures.v1.json` now rejects:

- `contracts/../secrets.txt` in `contractFiles`;
- `alice@example.org` and `sk_live_example_secret` in public payload evidence;
- a status above its 128-character bound.

The generic gate independently validates exact contract-file hashes and the aggregate resource
ceilings. No product engine, runtime file resolver, network capability, dataset or user-data path is
introduced.

Promotion remains blocked until fresh role-separated Architecture and Security passes approve the
exact remediation commit and hashes, followed by a distinct promotion pass and the recorded owner
milestone.
