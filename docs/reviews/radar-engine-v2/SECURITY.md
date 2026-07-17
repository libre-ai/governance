# Radar engine v2 — Security review worksheet

This worksheet is not a verdict. A dedicated Security review-only pass should evaluate the exact
commit and attach evidence under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`.

## Trust and capability checks

- Confirm the WIT world has no imports and cannot access network, DNS, files, clock, randomness,
  environment, storage, credentials or tenant context.
- Confirm compressed transport handling and SSRF controls remain outside the engine and no fixture
  implies that the parser follows a URL.
- Confirm output text is still classified untrusted and HTML suppression does not authorize unsafe
  UI rendering.

## Hostile parser checks

- Recalculate all DTD/entity-expansion, undeclared entity, malformed XML, duplicate JSON key, deep
  unknown field, over-item, over-input, over-output, oversized evaluation input, invalid source/base,
  unsupported media and gzip-header vectors.
- Challenge refusal precedence with inputs combining invalid limits, oversized bytes, malformed media,
  DTDs and excessive depth.
- Check that unknown XML/JSON fields consume depth and bytes before being ignored.
- Check that candidate item counting happens before deduplication and that no partial success can be
  returned after a refusal.
- Review UTF-8 BOM, UTF-16/32 BOM, invalid scalar, XML numeric reference and entity handling.

## Data minimization and leakage checks

- Confirm WIT errors contain only the closed `refusal-code` enum; no free-form message remains.
- Confirm every refusal vector contains only `kind` and `code` and no URL, identifier, source excerpt,
  rule value, parser diagnostic, line/column, tenant or personal value.
- Confirm JSON Feed bodies/attachments, Atom HTML/XHTML and RSS nested markup are not copied.
- Confirm successful rule output omits tenant ID while preserving only the explanation explicitly
  authored in the successful rule set.

## Algorithm checks

- Independently implement or inspect vectors for Unicode normalization/control deletion, URL
  canonicalization, date conversion, source-local identity, first-occurrence deduplication and sort.
- Check that identity preimages are domain-separated with the exact zero byte and bind the explicit
  authorized source ID.
- Check strict before/after semantics, null dates, case sensitivity, array `any` semantics, first-match
  decision and default rejection.

## Required Security verdict content

The separate verdict must include reviewed commit, vector-index SHA-256, commands run, blocking and
non-blocking findings, residual risks, review-pass attribution and an explicit verdict.
No entry may move from `candidate` to `locked` without that independent agent verdict.
