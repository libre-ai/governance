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

- Every former unconstrained `true` slot uses a recursive JSON value with 65,536-code-point strings,
  4,096-item arrays, 512-property objects and 128-code-point property names.
- The repository gate applies the 8 MiB ceiling before parsing, requires strict UTF-8 JSON without
  BOM, duplicate members, unpaired surrogates or non-finite numbers, then enforces string, container,
  property-name, depth-64 and 200,000-node limits before content scanning or AJV. A failed bound
  short-circuits later work.
- `contractFiles` alone is resolvable: it accepts closed repository-relative `contracts/…` paths and
  lowercase SHA-256 values. The gate rejects traversal, URI/absolute forms, duplicates, missing or
  non-file targets, symlinks, repository escape and hash mismatch.
- Metadata recursively rejects high-confidence credential/private-key markers, at/percent/ampersand
  identifier encodings, local file URIs and traversal. Metadata object keys use ASCII machine tokens
  and reject credential-shaped names.
- Engine payload strings retain their semantics. Before AJV, a separate public-source scanner applies
  NFKC normalization and performs four bounded decoding rounds over percent octets, `%u` escapes and
  exact HTML5 references. The BSD-2-Clause `entities` decoder
  follows case-sensitive HTML5 names, including legacy semicolonless forms, and preserves unknown
  references such as non-HTML5 `at` or mixed-case `CommaT`. A local parser accepts every RFC 6532
  `UTF8-non-ascii` scalar as EAI atext, limits CFWS skipping to ASCII whitespace, preserves non-ASCII
  separators during NFKC and validates RFC-length dot-atom or quoted local-parts, nested comments,
  IDNA/punycode DNS labels and bounded IPv4/IPv6 literals. It scans the original context, the RFC
  comment-free projection and two linear wrapper-preserving comment projections. One propagates any
  nested `@`; the other prioritizes `@` at the direct group level and removes child comments. Their
  union handles comments that contain a handle without consuming the contextual wrapper. The parser
  precomputes quote parity and records an opening quote only behind its own valid prose boundary,
  requires whitespace/open delimiters or an explicit bounded FR/EN email label before `:`, separates
  terminal ASCII/Unicode dots and independently detects userinfo for every syntactically valid URI
  scheme, without resolution. A second view removes
  default-ignorables only after the EAI parse. Invalid token boundaries, local-parts over 64 octets,
  empty/overlong/hyphen-invalid labels and non-domain handles stay representable. Work remains bounded
  by the preflight string limit and maximum adversarial tests; normalization expansion beyond the
  same 65,536-code-point ceiling fails closed. Only decoded email identifiers or
  high-confidence credentials are rejected, without echoing content; unrelated `@`, `&#` or `%` text
  is not reinterpreted.
- The only sensitive-looking allowlist entry is Radar's locked synthetic userinfo refusal canary,
  byte-exact and file-bound `https://user:secret@example.org/feed.xml`. `file:///etc/passwd` is
  ordinary inert payload data and receives no resolver capability or lexical exception.
- Exported scanner tests and executable gate self-tests reject direct/encoded/parenthesized dot-atom,
  quoted and EAI local-parts (including private-use, C1, noncharacters and default-ignorables),
  nested/escaped/wrapped comments and CFWS, terminal punctuation, Unicode/combining-mark/punycode/
  IP-literal domains, nested HTML5 references, generic URI userinfo, token credentials and explicit
  RSA/DSA/EC/OpenSSH/PKCS#8/OpenPGP private-key headers. They preserve malformed/overlong/token-invalid
  address shapes, unknown colon labels, internal/closing quote suffixes, word-internal quote prefixes,
  non-ASCII domain separators, case-unknown references and maximum-length non-emails plus `R&D`,
  `R&amplitude`, `50%`, `release@2`,
  `https://example.org/a%2Fb`, `Café démonstration` and inert path payloads.
- Radar, Notebook, Policy v1/v2 and Boussole golden corpora all pass the shared structural/content
  gate and then their dedicated semantic checker. Boussole additionally requires the exact
  `boussole-scoring-v2` world before reading cases.
- TypeScript and Rust static projection treat only the explicitly commented recursive metadata and
  payload values as opaque. Runtime JSON Schema validation remains authoritative. Its
  `metadataString` credential pattern is aligned with the scanner's explicit
  RSA/DSA/EC/OpenSSH/generic/encrypted-PKCS#8/OpenPGP private-key headers and exercised by negative
  schema fixtures. Generated types are not product input boundaries.

## Scope exclusions

No product engine, runtime file resolver, network/storage/clock/randomness capability, real dataset,
user-data path, public scoring, release, infrastructure or deployment is introduced or authorized.
`entities@8.0.0` is pinned BSD-2-Clause, dev-only and dependency-free, but still requires explicit
owner acceptance. Promotion remains blocked until fresh role-separated Architecture and Security verdicts approve one
immutable commit, followed by a distinct promotion pass and the recorded owner milestone.
