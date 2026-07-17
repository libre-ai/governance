# Independent agent review dossier — Radar engine v2 contract

**State:** `locked`

**Protocol:** [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md)

**Completed reviews:** dedicated Architecture pass `radar-architecture-rereview-bbe6c96` and
Security pass `radar-security-rereview-bbe6c96`, each bound to immutable commit/hash evidence.

**Recorded decisions:** the historical [`ARCHITECTURE-VERDICT.md`](ARCHITECTURE-VERDICT.md) and
[`SECURITY-VERDICT.md`](SECURITY-VERDICT.md) rejections remain immutable evidence for their old
hashes. Fresh [`ARCHITECTURE-VERDICT-2.md`](ARCHITECTURE-VERDICT-2.md) and
[`SECURITY-VERDICT-2.md`](SECURITY-VERDICT-2.md) decisions approve the remediated hashes. The
[`PROMOTION-VERDICT.md`](PROMOTION-VERDICT.md) records the separate promotion pass and owner control
milestone. Locking the contract does not itself authorize a product engine or deployment.

## Review subject

The locked contract defines `libre-ai:radar-engine@2.0.0` as an executable, capability-free boundary for
hostile RSS/Atom/JSON Feed parsing and deterministic curation-rule evaluation. It deliberately adds
no Radar Rust engine and performs no network operation.

Normative artifacts:

- `contracts/wit/radar-engine-v2/world.wit`;
- `contracts/wit/radar-engine-v2/PROFILE.md`;
- `contracts/schemas/radar-normalized-item.v1.schema.json`;
- `contracts/schemas/radar-normalized-feed.v1.schema.json`;
- `contracts/schemas/radar-rule-evaluation.v1.schema.json`;
- `contracts/schemas/curation-rule-set.v2.schema.json`;
- `contracts/schemas/curated-item-export.v2.schema.json`;
- `contracts/openapi/radar.v2.yaml`;
- `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json`;
- `contracts/fixtures/radar-engine-v2/security-vectors.v1.json`.

The normalized schemas and all incompatible v2 Radar authorities are marked `locked` in
`contracts/catalog.v1.json`; v1 remains locked and unchanged. Any change to a locked authority
requires the compatibility process and invalidates hash-bound implementation evidence.

## Contract decisions to review

1. Feed scope is RSS 2.0, Atom 1.0, JSON Feed 1/1.1, UTF-8 only, with the six exact base media types
   in the profile.
2. The parser receives already-decompressed bytes plus explicit source ID/final base URL, imports no
   capability, and applies input-byte, output-byte, candidate-item and complete-tree depth limits.
   Rule evaluation has fixed item/rule byte ceilings before JSON decoding.
3. DTDs and declared entities fail closed; only XML predefined/numeric references are accepted.
4. HTML is never parsed. HTML-bearing title/summary constructs are absent, content bodies are ignored,
   and all output remains untrusted text.
5. Invalid optional dates become null. Unknown source-feed fields are traversed for budgets then
   ignored; unknown evaluation-input fields fail schema validation.
6. Item identity includes the explicit authorized source ID, is deterministic and hash-derived; the
   final base URL defines relative-link resolution and `sourceHost`.
7. Rule comparison is case-sensitive and locale-free; first matching rule decides, all rules report,
   and no match rejects by default.
8. Component errors contain only the closed WIT enum; the API maps them to closed reason codes and a
   static content-free message. Neither boundary can reproduce hostile bytes, tenant values or parser
   diagnostics.
9. RFC 8785 JCS bytes and SHA-256 bind items, rule sets and outputs. No clock enters evaluation.

## Deterministic verification recipe

Run from the repository root with the qualified repository toolchain:

```bash
bun run check:contracts
bun run check:generated-contracts
cargo test -p libre-ai-ecosystem-engine --test wit_contracts
cargo test -p libre-ai-contract-types --test schema_fixtures
```

`bun run check:contracts` validates every catalog/schema fixture, then
`tools/quality/check-radar-v2-vectors.ts` verifies:

- raw fixture and normative contract SHA-256 values;
- exact JCS bytes (no final newline) for every golden success;
- JSON Schema conformance of outputs;
- normalized identifier/deduplication hashes, item/tag ordering and evaluation input digests;
- 43 parser cases and 16 rule-evaluation cases, including BOM/UTF-8/XML references, duplicate keys,
  UTC rollovers, content identity, operator/date matrices and refusal precedence;
- 18 generated exact/over resource boundaries and one vector for every closed refusal code;
- exact content-free public refusal mappings plus diagnostic canaries;
- refusal expectations containing only `kind` and `code`;
- absence of orphan Radar fixture files.

To inspect one raw hash independently:

```bash
shasum -a 256 contracts/fixtures/radar-engine-v2/positive/rss-2.0.xml
shasum -a 256 contracts/fixtures/radar-engine-v2/golden/rss-2.0.normalized.json
```

The indexes are intentionally not self-hashed. Their locked SHA-256 values are:

- golden vectors: `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`;
- security vectors: `a092dabcd81afdac4eaeb57aafc4bf9c26cec89aa514f05e48e56bfe1b0804a6`.

Reviewers must recompute both at the reviewed commit. The golden `contractFiles` section binds the
WIT, profile, engine schemas, export schema and OpenAPI; each file-backed case binds its raw inputs and
exact output bytes. The security index binds required case inventories, generated ceilings, closed
public mappings and non-disclosure canaries.

## Completed promotion evidence

Security and Architecture review-only passes returned separate approvals covering `SECURITY.md` and
`ARCHITECTURE.md`. Each record includes its `reviewPassId`, reviewed Git commit, vector hashes,
findings and explicit verdict. The promotion pass independently matched both records to unchanged
current authorities and the scoped owner `continue` decision before changing catalog status.

## Known residual work (not part of this promotion)

- Resource-bound enforcement and parser differential tests require the future Radar engine package.
- Cross-runtime URL, Unicode 15.1 and RFC 8785 implementation qualification remains an implementation
  gate against these goldens.
- HTTP compression, DNS/IP/redirect/SSRF enforcement belongs to the Bun fetch quarantine and must be
  reviewed separately.
- Tenant authorization remains in Bun/Biscuit/RLS; this pure component intentionally has no tenant
  capability and cannot replace that boundary.
