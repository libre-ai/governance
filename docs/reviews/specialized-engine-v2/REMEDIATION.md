# Specialized engine golden-vector envelope — boundary remediation

Status: **candidate remediation; fresh Architecture and Security verdicts required**.

This packet answers the historical Security findings and the Architecture/Security rejects on
`6fd4d5dbd1b8964a2ef84b89c53c30b2496f3c93`. Every earlier verdict remains an immutable audit
record and is stale for promotion.

## Separation of responsibilities

The shared authority has two distinct layers:

1. **Envelope metadata** — schema version, world, status, semantics path, standards,
   `reproductionEvidence` and `contractFiles`. These values are closed, bounded and sanitized.
2. **Engine payload** — cases, inputs, expected outputs, mutations and canonicalization material.
   These values are structurally bounded here, but their lexical and semantic validity belongs only
   to each engine profile and checker.

The envelope therefore does not ban legitimate payloads such as `R&D`, `50%`, percent-encoded URLs,
accented wording or adversarial `file:` strings. It never resolves a payload string as a path, URI or
credential. Radar, Notebook, Policy and Boussole remain the only authorities for payload meaning and
expected outputs.

## Closed boundaries

- Every former unconstrained `true` slot uses a recursive JSON value with 65,536-character strings,
  4,096-item arrays and 512-property objects.
- The repository gate applies the 8 MiB ceiling before parsing, then depth 64 and 200,000 nodes before
  content scanning or AJV. A failed aggregate bound short-circuits later work.
- `contractFiles` alone is resolvable: it accepts closed repository-relative `contracts/…` paths and
  lowercase SHA-256 values. The gate rejects traversal, URI/absolute forms, duplicates, missing or
  non-file targets, symlinks, repository escape and hash mismatch.
- Metadata recursively rejects high-confidence credential/private-key markers, at/percent/ampersand
  identifier encodings, local file URIs and traversal. Metadata object keys use ASCII machine tokens.
- Engine payload strings retain their semantics. Before AJV, a separate public-source scanner applies
  NFKC normalization and bounded repeated decoding of percent octets, `%u` escapes and HTML at-sign
  entities. It rejects at-sign identifiers and high-confidence credentials in values or property
  names without echoing rejected content.
- The only sensitive-looking allowlist entry is Radar's locked synthetic userinfo refusal canary,
  byte-exact `https://user:secret@example.org/feed.xml`. `file:///etc/passwd` is ordinary inert
  payload data and receives no resolver capability or lexical exception.
- Scanner self-tests reject direct, percent, double-percent, `%u`, HTML-entity and Unicode at-sign
  identifiers plus credential markers. They preserve `R&D`, `50%`, `https://example.org/a%2Fb`,
  `Café démonstration` and the exact Radar canary.
- Radar, Notebook, Policy v1/v2 and Boussole golden corpora all pass the shared structural/content
  gate and then their dedicated semantic checker. Boussole additionally requires the exact
  `boussole-scoring-v2` world before reading cases.
- TypeScript and Rust static projection treat only the explicitly commented recursive metadata and
  payload values as opaque. Runtime JSON Schema validation remains authoritative; generated types
  are not product input boundaries.

## Scope exclusions

No product engine, runtime file resolver, network/storage/clock/randomness capability, real dataset,
user-data path, public scoring, release, infrastructure or deployment is introduced or authorized.
Promotion remains blocked until fresh role-separated Architecture and Security verdicts approve one
immutable commit, followed by a distinct promotion pass and the recorded owner milestone.
