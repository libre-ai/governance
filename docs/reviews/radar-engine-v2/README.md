# Independent agent review dossier — Radar engine v2 contract

**State:** `pending-independent-agent-review`

**Protocol:** [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md)

**Required reviewers:** one Security agent and one Architecture agent, each using an identity and
session distinct from the authoring agent.

**Decision recorded here:** none. This dossier is a review request and does not approve, release or
authorize implementation of the contract.

## Review subject

The candidate turns `libre-ai:radar-engine@2.0.0` into an executable, capability-free boundary for
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
- `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json`.

The normalized schemas and all incompatible v2 Radar authorities are marked `candidate` in
`contracts/catalog.v1.json`; v1 remains locked and unchanged. Promotion to `locked` requires explicit
independent Security and Architecture agent verdicts. The authoring agent must not review or perform
that promotion alone.

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
8. Errors contain only the closed WIT enum. They cannot reproduce hostile bytes, tenant values or
   parser diagnostics.
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
- one vector for every closed refusal code;
- refusal expectations containing only `kind` and `code`;
- absence of orphan Radar fixture files.

To inspect one raw hash independently:

```bash
shasum -a 256 contracts/fixtures/radar-engine-v2/positive/rss-2.0.xml
shasum -a 256 contracts/fixtures/radar-engine-v2/golden/rss-2.0.normalized.json
```

The vector index itself is intentionally not self-hashed. Reviewers must recompute its SHA-256 at
the reviewed commit. Its `contractFiles` section binds the WIT, profile and schemas; each case binds
its own raw inputs and exact output bytes.

## Expected independent evidence

Security and Architecture review agents return separate verdicts covering `SECURITY.md` and
`ARCHITECTURE.md`. Each record includes the agent/session identity required by the shared protocol,
the reviewed Git commit, the SHA-256 of `golden-vectors.v1.json`, findings and an explicit verdict.
A self-review, conditional verdict or missing record keeps every candidate entry pending.

## Known residual work (not part of this candidate)

- Resource-bound enforcement and parser differential tests require the future Radar engine package.
- Cross-runtime URL, Unicode 15.1 and RFC 8785 implementation qualification remains an implementation
  gate against these goldens.
- HTTP compression, DNS/IP/redirect/SSRF enforcement belongs to the Bun fetch quarantine and must be
  reviewed separately.
- Tenant authorization remains in Bun/Biscuit/RLS; this pure component intentionally has no tenant
  capability and cannot replace that boundary.
