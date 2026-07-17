# Specialized engine golden-vector envelope — security remediation

Status: **candidate remediation; fresh Architecture and Security verdicts required**.

This increment responds to `ENGSEC-BLK-001` and `ENGSEC-MAJ-001` in
[`SECURITY-VERDICT.md`](SECURITY-VERDICT.md). The historical verdict targets immutable commit
`9b376cf65755f7556866123f9fddf681a709a2f0` and remains an audit record.

## Closed boundaries

- Every former unconstrained `true` payload slot now uses a recursive public-test JSON value with
  bounded strings, arrays and objects.
- The repository gate applies the 8 MiB file ceiling before parsing, then depth 64 and the
  200,000-node ceiling immediately after parsing and before AJV/schema validation.
- `contractFiles` is a closed list of repository-relative `contracts/…` paths and lowercase SHA-256
  values. Traversal, URI and absolute forms are rejected. The gate rejects symlinks, paths escaping
  the repository, missing files and hash mismatches.
- High-confidence credential material and private-key headers are rejected. ASCII, fullwidth and
  small-form at-signs, percent signs or ampersands are forbidden recursively, closing direct,
  Unicode-confusable, percent-encoded and HTML-entity private identifiers. Public object keys use a closed ASCII machine-token
  alphabet; traversal segments and local file URIs are also rejected recursively. Two byte-exact
  public-test exceptions preserve locked Radar refusal evidence:
  `https://user:secret@example.org/feed.xml` for userinfo and `file:///etc/passwd` for forbidden URL
  scheme. Committed payloads remain synthetic public test material; refusal canaries are not
  credentials, personal identifiers or paths that the envelope resolves.
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
- standalone or embedded `alice@example.org` and `sk_live_example_secret` in public payload
  evidence;
- email-shaped property names, userinfo-prefix suffix injection, ASCII/Unicode at-sign,
  percent-encoded and HTML-entity variants, recursive `../../secrets.txt`, and non-approved lowercase,
  uppercase or
  mixed-case local `file:` payloads;
- a status above its 128-character bound.

The generic gate independently validates exact contract-file hashes and the aggregate resource
ceilings. No product engine, runtime file resolver, network capability, dataset or user-data path is
introduced.

Promotion remains blocked until fresh role-separated Architecture and Security passes approve the
exact remediation commit and hashes, followed by a distinct promotion pass and the recorded owner
milestone.
