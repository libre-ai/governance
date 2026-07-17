# Security review record — engine-golden-vectors-v1

- `reviewPassId`: `engine-envelope-security-cea-r1`
- `role`: `security` — specialized catalog role only
- `mode`: immutable, review-only Security pass
- `reviewedAt`: `2026-07-17T17:58:10Z`
- `agent`: API coding assistant; provider/model/session identifier not exposed by this harness
- `targetCommit`: `cea73631ac69c0a53549f63f521aca8ee3326a02`
- `targetTree`: `268ffa6c000ca18719a7499a0d4c362e37c187e3`
- `base` (first parent): `ef1e84730e6881f539f25a6f9e78385320869df1`, tree `45c2e209ea9a473eb9e55b279006bd2d40b9eff5`
- `remediationParent`: `abfbd623a9fd025413ec6fb1c7063fe1bee43d5e`, tree identical to target
- target subject: `Merge pull request #80 from libre-ai/fix/engine-envelope-schema-markers`

## Role and authority boundary

This is a dedicated Security verdict, not an Architecture verdict and not a promotion. Candidate-integration records were read as prerequisite integration evidence only; none is treated as Security approval. The catalog still marks `engine-golden-vectors-v1` `candidate`, `pending-independent-agent-review`, with required roles `architecture,security`.

No repository file, Git ref, review comment, merge, catalog state, product/runtime/data capability, release, infrastructure or deployment was changed or authorized. The authority remains candidate regardless of this verdict.

## Governance and dossier history read

Read fully: `AGENTS.md`, `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, ADR-0003, the G2 prompt, and the complete `docs/reviews/AGENT-REVIEW-PROTOCOL.md`.

Read the complete `docs/reviews/specialized-engine-v2/` dossier, dependency qualification, all Architecture/Security records, both candidate-integration approvals, and every preserved candidate-integration reject (AE455, 3BAECF8, 39F776E, E6DF443, 9E74BAB, A4E74A6, 453B0A6, 1523BCD, 26AC8FE, 77A4B1D, 6EE4627, 0A265CE, EF1E847). Earlier approvals were treated as stale after subsequent normative changes/rejects.

The current delta from first parent changes only the schema marker pattern, three negative fixture mutations, generated-manifest schema hash, dossier/status history and the preserved EF1E847 integration reject. It does not change catalog state, payload scanner, corpus bytes, WIT/profile semantics, runtime capability, product engine, or dependency lockfile.

## Independent checks and probes

### Pinned CI-equivalent gates

All passed under Bun `1.4.0-canary.1+57f349f63`, Rust/Cargo `1.97.0`, and `cargo-deny 0.19.5`:

- `bun install --frozen-lockfile`
- `bun run check` — includes exact toolchain check; contract/shared gate; all dedicated vector checkers; generated declarations (`48`); license/Biome/TypeScript gates; `235 pass, 0 fail` Bun tests.
- `bun audit` — no vulnerabilities.
- `cargo fmt --all --check`
- `cargo clippy --workspace --all-targets --all-features --locked -- -D warnings`
- `cargo test --workspace --all-features --locked` — all workspace and doc tests pass.
- `cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown` in two independent target directories.
- `cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- <artifact>` — `0` module imports, `0` component imports, 512 MiB cap, WIT exports present.
- byte-for-byte WASM reproducibility — both SHA-256 `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`.
- `cargo deny check advisories licenses sources` — passed. A supplemental full `cargo deny check` exited zero with pre-existing duplicate-version warnings only; advisory/license/source/bans checks were all `ok`.

### Boundary probes against the real gate

All mutations ran only in disposable `git archive` copies of the exact target; the real `bun tools/quality/check-contracts.ts` was executed, never a mock.

- **Strict bytes/bounds:** BOM, invalid UTF-8, duplicate decoded member, unpaired surrogate, invalid number, depth 65, string 65,537 code points, array 4,097, object 513, key 129, node 200,001 and file >8 MiB all refused. Observed order is size → strict UTF-8 JSON/depth → recursive bounds → scanner → AJV → `contractFiles`. Sensitive failures are generic and do not echo values.
- **Payload scanner matrix:** 68 actual-gate value/key mutations covered direct, percent, `%u`, HTML5/nested encodings, NFKC/default-ignorables, dot-atom/quoted/EAI/CFWS, IDNA/punycode/IP literals, prose labels/quotes/punctuation, generic mixed/custom/SSH/Git userinfo, and generic/RSA/DSA/EC/OpenSSH/encrypted-PKCS#8/OpenPGP markers. All expected controls held except the six lower/mixed IPv6 cases in Finding 1.
- **False-positive controls:** actual gate preserved opaque `R&D`, machine handles, unknown HTML entity, invalid domain, internal invalid quote, and inert `file:` payload strings. This confirms payload strings are not turned into filesystem capabilities.
- **Metadata normalization probes:** the canonical registry and the real publication gate both accepted NFKC/default-ignorable local-file URI and traversal forms (Finding 2). Direct ASCII controls were refused. Schema-only NFKC/default-ignorable credential forms were accepted, but the current publication scanner caught those credential variants.
- **`contractFiles`:** baseline Radar binding passed; duplicate, traversal, URI, missing target, hash mismatch and symlink mutations all refused. Only this field was resolved. The Radar userinfo canary passed solely at its exact original Radar value/path; altered and moved copies were refused.
- **Corpus audit:** all five golden corpora were scanned independently. Radar had exactly one sensitive scanner hit (the bound synthetic canary); Notebook, Policy v1, Policy v2 and Boussole had none.
- **Complexity:** exported self-tests passed; maximum direct probes completed in milliseconds (many `@`: 6.441 ms, quote run: 1.165 ms, NFKC expansion: 1.085 ms). No additional covered ReDoS signal was found, but this does not cure the correctness blockers.

The first `contractFiles` helper run aborted in its own final canary-mutation locator before those two checks. Its immutable external log is preserved in the ledger; it did not alter the target or produce a target finding. The corrected helper was rerun from a fresh archive and completed every stated confinement/canary case above.

## Findings

### Blocking — `ENGSEC-CEA-001`: lowercase/mixed-case IPv6 address literals bypass public-identifier refusal

`tools/quality/public-source-scanner.ts:293-300` accepts an IPv6 domain literal only when `literal.startsWith("IPv6:")`. RFC ABNF quoted literals are case-insensitive unless explicitly case-sensitive; lower- and mixed-case `ipv6:` tags are therefore valid IPv6 email address-literal forms.

Independent direct scanner probe and the actual shared gate both accepted lower and mixed-case IPv6 literals in **payload values and property keys**, including the HTML5-decoded lower-case form. The 68-case gate matrix reports six unexpected successes (`rc=0`): lower/mixed direct forms in values/keys and encoded lower form in values/keys. The committed self-tests cover only uppercase `IPv6:`.

Impact: a future public corpus can publish a valid email identifier while the repository gate reports success. This is a direct false negative on the required RFC/IP value-and-key surface.

### Blocking — `ENGSEC-CEA-002`: NFKC/default-ignorable metadata bypass publishes forbidden local paths and traversal

`metadataString` in `contracts/schemas/engine-golden-vectors.v1.schema.json:77-88` rejects only raw ASCII `file:` / `../` syntax. It has neither normalization nor default-ignorable closure. `containsSensitivePublicMarker` (`tools/quality/public-source-scanner.ts:401-420`) normalizes, but deliberately only detects credentials, email identifiers and URI userinfo; it does not enforce metadata path policy.

The canonical TypeScript registry accepted NFKC and default-ignorable local-file URI and traversal metadata strings. The actual `check-contracts.ts` gate also accepted all four in `reproductionEvidence` (`rc=0`), while direct ASCII file URI control was refused (`rc=1`). Thus metadata advertised as recursively sanitized can carry a local host path into a public corpus and bypass the stated traversal/file-URI prohibition.

The same schema-only probe accepted NFKC/default-ignorable credential markers too; the repository scanner currently catches those two credential forms. That still demonstrates that runtime JSON Schema validation is not independently normalized/fail-closed for metadata, contrary to the boundary claim. The local-path/traversal variants are worse because both schema and publication gate accept them.

Impact: no filesystem read is obtained—`contractFiles` confinement remains effective—but a prohibited local path may be published and the canonical metadata contract is false-open. This is a Security and contract-governance blocker.

## Confirmed non-blocking properties

- Raw-byte strict parsing, duplicate/surrogate/finite-number handling, resource limits and generic non-reflective errors held in real-gate probes.
- `contractFiles` is the sole resolved field; traversal/symlink/repository-escape/hash defenses held.
- The Radar canary is byte-exact and file-bound.
- The schema/scanner alignment fixed by this target is real for direct generic/RSA/DSA/EC/OpenSSH/encrypted-PKCS#8/OpenPGP PEM markers: all three new schema fixtures fail in Bun and Rust validation; generated manifest hash matches the schema.
- Recursive payload projection remains opaque and runtime validation remains non-reflective. Existing payload semantics were not reinterpreted by schema.
- `entities@8.0.0` is exact-pinned, BSD-2-Clause, dependency-free, imported only by `tools/quality/public-source-scanner.ts`; JS license/audit gates pass. Explicit owner acceptance remains a separate future promotion prerequisite.

## Residual risks and required remediation

1. Parse the IPv6 address-literal tag case-insensitively (or otherwise conform to the applicable ABNF) and add real-gate value/key regressions for direct and decoded lower/mixed forms.
2. Make metadata sanitization normalization-aware and fail closed for local file URIs/traversal, including default-ignorable forms, in the canonical boundary and publication path. A schema-only ASCII restriction or a dedicated normalized metadata validator must not reinterpret payload values or grant resolver capability.
3. Add regression fixtures that prove schema-only and publication-gate behavior together. A new normative commit invalidates this record and requires fresh candidate-integration, Architecture and Security review-only passes.
4. After any future favourable role records, separate promotion/integration review and explicit human owner milestone remain required. No product engine, data processing, release or deployment is authorized by this record.

## Hashes and evidence

Key current authority hashes:

- catalog: `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- shared schema: `443f6fbee0a949ec47b5bf3081b3039e4ddac630eded8dc32c96223f82c74f58`
- schema fixtures: `b46508330dd252230abd690523e506e5ebe2ae9ef4799a6fcf739982099de760`
- shared gate: `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- public scanner/tests: `f37e28f6cd36563452ab2267de0585c7f3b496770cd5c88218139ef7383bf352` / `fddb23f0d3510332a9fac9abbb2f5a87eab8a308fbed9105f6da1f5b7cf2b658`
- strict JSON helper: `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389`
- generated declaration/manifest: `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816` / `b9b701cdeab1f6f764e4e7ab00f4554c3954a2e123b0c57916ac0358126b0287`
- `entities` package/license: `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a` / `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`
- full source/dossier/corpus/WIT/configuration and command/probe ledger: `/tmp/engine-envelope-security-cea.evidence.sha256` — SHA-256 `0c8f2f7b3b6c50f1b1e9b63a4c57c896c1f4ebb14cf5d1e89e22b6f86817900b`

## Final clean-state proof

`/tmp/engine-envelope-security-cea.clean-state.log` (SHA-256 `ad1ac9b9d0483fc9a77fcd25479de6f1c55d5f34af12b91a6559bc6f3f84cbce`) records:

```text
head=cea73631ac69c0a53549f63f521aca8ee3326a02
tree=268ffa6c000ca18719a7499a0d4c362e37c187e3
parents=ef1e84730e6881f539f25a6f9e78385320869df1 abfbd623a9fd025413ec6fb1c7063fe1bee43d5e
branch=detached (## HEAD (no branch))
porcelain_count=0
unstaged=empty
staged=empty
node_modules=absent
repo_target=absent
external_cargo_targets=0
git_fsck=clean
```

VERDICT: reject security — valid lower/mixed-case IPv6 email literals bypass the actual public gate, and NFKC/default-ignorable metadata bypasses publish forbidden local file/traversal paths.
