# Radar engine v2 — Architecture review worksheet

This worksheet is not a verdict. The independent Architecture reviewer should verify that the
candidate closes semantics without moving product/network/tenant behavior into the Rust boundary.

## Boundary checks

- WIT has exactly two pure exports and no host import.
- `parse-feed` output and `evaluate-rules` input/output each name one strict cataloged JSON Schema.
- Bun remains owner of fetch/decompression, SSRF, authorization, tenant/source scoping, persistence,
  scheduling, retention and public error mapping.
- No Rust engine, adapter, database type, HTTP object or generated type is treated as authority in
  this candidate.

## Determinism checks

- Confirm RFC 8785 bytes, SHA-256 domains, normalized item identity, first-source deduplication and
  date/id sort are complete and cross-runtime implementable.
- Confirm source-field selection and all missing/invalid/unknown field behavior require no library
  defaults.
- Confirm rule field/operator compatibility, matching, rule order, decision precedence, explanation,
  digest binding and no-match outcome require no implementation choice.
- Confirm explicit parse-limit ranges/counting semantics and fixed evaluation byte ceilings are
  sufficient for conformance tests without a clock or platform-dependent memory metric.

## Compatibility checks

- Confirm v1 stays unchanged and that source/base inputs, output budget and closed errors are correctly
  isolated in the v2 candidate.
- Confirm the three new schema names and catalog classifications are durable and do not duplicate an
  existing domain authority.
- Confirm source-local item identity is appropriate; a persisted global ID must remain scoped by the
  authorized Radar source ID.
- Confirm candidate status and dual independent review do not silently alter the G1 locked inventory.

## Required Architecture verdict content

The separate verdict must include reviewed commit, vector-index SHA-256, compatibility assessment,
blocking and non-blocking findings, reviewer identity/role and an explicit approve/reject decision.
No entry may move from `candidate` to `locked` without that external verdict.
