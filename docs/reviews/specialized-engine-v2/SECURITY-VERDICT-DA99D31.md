# Security review record — `engine-golden-vectors-v1`

- **reviewPassId:** `engine-golden-vectors-v1-security-da99-r1`
- **role / mode:** Security / specialized catalog role, strict review-only pass
- **reviewedAt:** `2026-07-17T15:16:56Z`
- **target:** `da99d31e36e94c852841310e696d1a4bc9cf9d18`
- **target tree:** `581b7e9e855309fd05ad3488b8f0bc9e23c902ff`
- **base:** first parent `0a265ce15d8871679cc7ca8693ce571432a057fb`; remediation parent `8de5541b993675a43f1795e989e397fba312a4ad`
- **provider / model:** OpenAI via pi/API; exact model and session identifiers are not exposed by this harness
- **separation:** detached review worktree, target HEAD exact and porcelain clean before review; review-only role pass; no tracked-file edit, commit, push, comment, merge, promotion or owner-control action. Probes ran only in disposable `git archive` copies under `/tmp`; review dependencies and the external Cargo target were removed before final clean-state proof.

## Authority and non-substitution

The catalog still records `engine-golden-vectors-v1` as `candidate`, `pending-independent-agent-review`, requiring distinct `architecture` and `security` passes (`contracts/catalog.v1.json:650-664`). The exact-SHA candidate-integration approval stipulated for this target was treated only as integration evidence: it is not, and cannot become, a Security verdict or a catalog promotion.

This review read and applied `AGENTS.md`, `GOALS.md`, `STATUS.md`, the decision register, ADR-0001/0002/0003, G2 prompt, and the complete agent-review protocol. It also read the complete `docs/reviews/specialized-engine-v2/` dossier and history: three stale role verdicts/approvals, the 79D02 parallel records, all eleven preserved candidate-integration rejections (AE455, 3BAECF8, 39F776E, E6DF443, 9E74BAB, A4E74A6, 453B0A6, 1523BCD, 26AC8FE, 77A4B1D, 6EE4627), and the current 0A265CE rejection. Earlier approvals are stale and were not used as evidence.

## Reviewed boundary

Reviewed the shared JSON Schema/catalog/schema fixtures/generated TypeScript boundary and manifest; `check-contracts.ts`, strict JSON parser, exported scanner and scanner tests; every dedicated Radar/Notebook/Policy v1/Policy v2/Boussole checker; and all five WIT/profile/SEMANTICS authorities. The five complete public golden corpora and Radar/Boussole security adjuncts were traversed in full by the actual shared scanner and dedicated gates.

The scanner/corpus inventory was:

| Corpus | nodes | strings | keys | scanner result |
| --- | ---: | ---: | ---: | --- |
| Radar v2 golden | 854 | 509 | 786 | only the exact file-bound synthetic Radar userinfo canary |
| Notebook Core v2 golden | 573 | 315 | 521 | no sensitive marker |
| Policy Core v1 golden | 1,521 | 1,116 | 1,375 | no sensitive marker |
| Policy Core v2 golden | 1,913 | 1,408 | 1,730 | no sensitive marker |
| Boussole v2 golden | 822 | 539 | 741 | no sensitive marker |

The shared schema remains bounded; generated recursive TS branches are opaque and runtime schema validation remains authoritative. Search found `entities` imported only by the quality-time scanner, and no shared-envelope product/runtime consumer. WIT contracts specify capability-free engines (no host imports); this review found no engine implementation, resolver capability, real-data path, scoring enablement, release, infrastructure or deployment change.

## Checks reproduced

### Repository gates

- `bun install --frozen-lockfile` ✅, exact Bun `1.4.0-canary.1+57f349f63`.
- `bun run check` ✅: source/objective/specification gates; shared contracts; all five dedicated vector checkers; Notebook Gate A; generated declarations (`48`); license, Biome and TypeScript gates; `227 pass, 0 fail`.
- `bun audit` ✅: no vulnerabilities.
- `cargo fmt --all --check` ✅.
- `cargo clippy --workspace --all-targets --all-features --locked -- -D warnings` ✅.
- `cargo test --workspace --all-features --locked` ✅: `40` tests plus doc tests; includes schema non-reflection, strict raw JSON and WIT resolution coverage.
- `cargo deny check advisories licenses sources` ✅.

### Independent actual-gate probes

All mutations ran against the real `bun tools/quality/check-contracts.ts` in clean archive copies, not against a mocked parser.

- **Order / strict bytes:** 8 MiB file-size refusal precedes parsing; UTF-8 BOM, invalid UTF-8, duplicate decoded member and unpaired surrogate reject as strict JSON. Depth 65 rejects before scanner/AJV. A sensitive marker on an otherwise AJV-invalid document produces the generic sensitive-marker refusal before AJV.
- **Bounds:** actual gate rejects 65,537 code points/string, 4,097 array items, 513 object properties, 129-code-point keys and 200,001 nodes. It accepts its committed corpus within the 8 MiB, depth-64, 65,536/4,096/512/128/200,000 limits.
- **Decoding / email matrix:** direct, percent, `%u`, numeric/named/mixed nested HTML, RFC quoted local-parts, RFC 6532 private-use EAI, CFWS, combining-IDNA/punycode, IPv4/IPv6 literals, parentheses and terminal punctuation reject. Exact HTML5 case sensitivity and unknown/mixed-case controls remain covered by scanner tests.
- **Quote remediation:** the current control `foo"alice@example.org"` is accepted in both payload values and keys; a later valid prose quote (`foo"bar" "alice@example.org"`) is detected. The new opening-quote boundary behavior therefore closes the recorded 0A265CE over-rejection without reopening its tested quote cases.
- **False-positive controls:** `R&D`, `release@2`, unknown entities, encoded public URL text, and inert `file:///…` / traversal payload strings pass. Failures for sensitive markers do not echo the injected value.
- **`contractFiles`:** baseline Radar binding passes. Duplicate paths, traversal, URI, missing target, SHA mismatch and a symlink each fail. Only `contractFiles` is resolved; payload file/URI strings remain inert. The Radar canary passes only at its exact committed Radar value/path; moving it to Notebook or altering it fails.
- **Metadata:** a `file:` URI in `reproductionEvidence` is rejected by the metadata/schema boundary, while the same kind of string in payload remains inert.

## Findings

### Blocking

#### `ENGSEC-DA99-BLK-001` — non-HTTP(S)/FTP URL userinfo bypasses the public-source gate

`tools/quality/public-source-scanner.ts:375-387` recognizes userinfo only for `https?` and `ftp` schemes. Consequently it accepts the high-confidence credential/userinfo forms below in both a payload value and a payload property key through the actual shared gate (`exitCode=0`, `Contracts verified…`):

- `ssh://user:secret@example.org/repo.git`
- `git://git@example.org/repo.git`

The email parser does not repair this: the local token after the URL userinfo colon has no accepted prose-label boundary. This violates the required URL-userinfo threat surface and permits publication of credentials or account identifiers behind a valid non-HTTP URI scheme. The scanner must detect userinfo conservatively for every syntactically recognised `scheme://authority` form (without resolving it), then add value/key regressions including encoded representations.

#### `ENGSEC-DA99-BLK-002` — high-confidence DSA and OpenPGP private-key markers bypass values and keys

The `credentialMarker` at `tools/quality/public-source-scanner.ts:6-7` matches generic, RSA, EC and OpenSSH PEM headers, but not other unambiguous private-key headers. The actual shared gate accepts each in both payload values and keys (`exitCode=0`):

- `-----BEGIN DSA PRIVATE KEY-----`
- `-----BEGIN PGP PRIVATE KEY BLOCK-----`

Those are private-key material markers, not opaque engine semantics. This violates the required credential/private-key publication boundary. The marker policy must cover these high-confidence forms (and their bounded decoded representations) with regression tests, without converting arbitrary payload text into a resolver or capability.

### Non-blocking confirmations

- The current quote-boundary correction itself is effective for the recorded 0A265CE internal/closing-quote false-positive class.
- Strict JSON, resource ordering, decode expansion limits, metadata/payload separation, non-reflective sensitive errors, exact Radar allowlist, `contractFiles` confinement and synthetic committed corpus status held under actual-gate probes.
- `entities@8.0.0` is exact-pinned, BSD-2-Clause, direct dev-only and has no lockfile dependencies/peers/optional dependencies; `bun audit` and the JS license gate pass. Its explicit owner acceptance remains a future promotion prerequisite.

## SHA-256 evidence

Complete immutable evidence ledger: `/tmp/engine-envelope-security-da99.evidence.sha256` — `8ee6465df8abdf24e91db2567fd93af6fad83fce1d5e2d161535b806ab897591`.

Selected current authority hashes:

- catalog `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- shared schema `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- generated declaration `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- generated manifest `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
- shared gate `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- scanner `af6231297f9758b2dc6b28f49e18d3a956c7af56afcf6e7faf0c8b8e67d11ca9`
- scanner tests `fddb23f0d3510332a9fac9abbb2f5a87eab8a308fbed9105f6da1f5b7cf2b658`
- strict JSON parser `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389`
- current dossier README / remediation `541aa29b64c053cd14e4b56f54da9bf9a3334aa674eb6ea564cb5dca04f4f9f6` / `8f7cc89949223f0d4cc0cb51cdd45fd9ddc5f8b2c7dc26a3ba382123220f13f6`
- current 0A265CE rejection record `50e47d7f2eb6134f007dbf5fcf0329e874841747200095d698ab201365c1b5c2`
- Radar / Notebook / Policy v1 / Policy v2 / Boussole goldens respectively `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`, `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`, `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`, `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`, `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`.
- `entities@8.0.0` installed manifest / license `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a` / `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`.

Probe and check evidence:

- direct scanner probe source/log `b7cd5827e25cd9edcf0bbb7370d176f7ce6a184f49d050c1467603be021ff4a2` / `493c92aaaa1167f2751ea77769eb280f5666f39e665e1e2978ba7dbf16c1fa2a`
- actual-gate probe source/log `79a66b601f8ff433fba28a7e48b93081afe379027cb0fcba25d9f543e329f29b` / `c84daaf4374e5c91b82bd1770fd4da946e7ae5fb35edde742147347e721e6632`
- Bun check/audit logs `7e848ec1cf7659bf1b43883c81ae233c1bca006cab6c228df8c3315ed4aa023e` / `da111885f1ced5ca5cd4ab06721e793d68cf1eff91ed36a35f4ca9b6c1bccf66`
- Rust fmt/clippy/test/deny logs `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, `a4d378dced533b2e2cb529e32a9dee0a8c664cfab9e24388974b9b918395c3c9`, `136ccecf3bfb912723642fddadc0270a11f952e0f17a4e154dd019c213b88ab4`, `245deecd3483cc5322ad2199ecc5c9421e832e3f1e6d2f8419170f3c74bccf46`.
- final clean-state proof `/tmp/engine-envelope-security-da99.clean-state.log` — `6d78771df72a9ddfa1a5553104bd96f47ec0609983995311ec835d2bced2a1cc`.

The ledger contains the individual SHA-256 values of every stale approval/reject record, all shared/dedicated checkers, strict parser, all five WIT/profile/SEMANTICS sources, both security corpora, governance, lockfiles and review evidence.

## Residual risks and required follow-up

The two blockers permit future public corpora to contain private credential material even while current corpora and all repository gates are green. A remediation must remain bounded, non-reflective, payload-opaque and resolver-free; it invalidates this Security pass and needs fresh candidate-integration, Architecture and Security passes on a new immutable commit. Explicit owner acceptance of `entities@8.0.0`, a separate promotion/integration review, and the owner milestone remain independently required even after remediation.

No authorization follows from this review for catalog promotion, product/Rust engine implementation, public scoring, real/personal/tenant-data processing, file/network/storage/clock/randomness capability, release, infrastructure, Clever Cloud configuration or deployment.

VERDICT: reject security — the actual shared gate accepts non-HTTP(S)/FTP URL userinfo and DSA/OpenPGP private-key markers in payload values and keys.
