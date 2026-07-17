# Security review-only record — `engine-golden-vectors-v1`

- **reviewPassId:** `engine-golden-vectors-v1-security-ccf9d684-r1`
- **role / mode:** Security / specialized catalog role, immutable review-only pass
- **reviewedAt:** `2026-07-17T19:27:43Z`
- **agent/provider/model/session:** API coding agent; provider/model/session identifier not exposed by this harness
- **target:** `ccf9d684d9a43ad7236bec905e701e155520e2d6`
- **tree:** `b27ab744e4a53e6f5108f8f72b22dee1e80c8843`
- **parents:** `a3afbbb8a4ea08b007b4893794446a02d1194070` (tree `f8b3e69600cd8aabf34ae9dae91790ea87debcdd`), `768f8511096e5467d805225f8b21f7ca6038a459` (tree `b27ab744e4a53e6f5108f8f72b22dee1e80c8843`)
- **target subject:** `Merge pull request #83 from libre-ai/fix/engine-envelope-ipv6-metadata`

## Authority and review boundary

This is a Security verdict only. It is neither Architecture nor candidate-integration, promotion, merge, owner acceptance, product, runtime, data, release, infrastructure or deployment approval. Candidate-integration records were treated only as prerequisite evidence, never as Security approval.

`contracts/catalog.v1.json` remains byte-hashed as `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35` and keeps `engine-golden-vectors-v1` **internal / major-versioned / candidate / pending-independent-agent-review**, with required `architecture` and `security` roles. This verdict does not change that state. No product/data/runtime/release scope is authorized.

## Immutability, clean state and PR #83 equality

Initial and final proof recorded detached HEAD exactly at the target, zero porcelain entries, empty staged/unstaged diffs, and index tree equal to HEAD tree. `git fsck --no-dangling --no-reflogs --connectivity-only` passed.

The remote canonical PR head check returned `refs/pull/83/head = 768f8511096e5467d805225f8b21f7ca6038a459`. Its tree is exactly `b27ab744e4a53e6f5108f8f72b22dee1e80c8843`, equal to the merge target tree; `git diff --quiet target^2 target` returned success. Thus the pre-merge PR #83 tree and immutable merge tree are byte-identical.

Final target clean-state evidence:

```text
HEAD=ccf9d684d9a43ad7236bec905e701e155520e2d6
TREE=b27ab744e4a53e6f5108f8f72b22dee1e80c8843
BRANCH=DETACHED
PORCELAIN=0
INDEX_TREE=b27ab744e4a53e6f5108f8f72b22dee1e80c8843
node_modules=absent
target=absent
```

Logs: final proof `81ae94b49ff78fb8f53b0f5fb8e4bf4a7d4a52c6356a141bf01a5ef493a6d822`; post-clean proof `221c978137344f1c8f27f7866d777d12eddad08e8270981eb6800db5e74a0f04`.

## Protocol and historical evidence read

Read completely: `GOALS.md`, `STATUS.md`, `docs/decisions/DECISION-REGISTER.md`, `prompts/02-foundation-build.md`, and `docs/reviews/AGENT-REVIEW-PROTOCOL.md`.

Read all 31 files in `docs/reviews/specialized-engine-v2/`: README, remediation and dependency qualification; all candidate-integration approvals; every preserved candidate-integration rejection; and every historical Architecture/Security record. The prior Security rejects were explicitly adversarial regression targets, notably:

- unconstrained envelope payloads (`SECURITY-VERDICT.md`);
- quoted local-parts (`SECURITY-VERDICT-79D02.md`);
- non-HTTP URI userinfo and DSA/OpenPGP headers (`SECURITY-VERDICT-DA99D31.md`);
- lower/mixed IPv6 tags and normalized metadata paths (`SECURITY-VERDICT-CEA7363.md`);
- wrapped/nested CFWS, HTML5 aliases, EAI/default-ignorables, prose/quote contexts, terminal punctuation, and complexity regressions from the preserved integration rejects.

All historical verdicts were treated as immutable audit material, not current approval. The full source and dossier hash ledger is `/tmp/engine-envelope-security-ccf.source-hashes.txt`, SHA-256 `39afb77333f49e10d25ab0330d77a159f95de9e8ff8ef372661c75890b4ef8c1`.

## Reviewed security boundary and hashes

| Surface | SHA-256 |
| --- | --- |
| Engine schema | `a654c359a342c65e175926ee364abadece1bde47757b4a58ee95144123de185f` |
| Schema fixtures | `afb10e51d4933305edf72241b01dab832e7f25dd38e4e6bfde8b42ba675a10d5` |
| Shared gate | `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a` |
| Public-source scanner | `5cb38d84a1b82d3172a795c6ce24de2a5d88fd8321942021863413c6b807c8bf` |
| Scanner tests | `f67f3316d2fae45a852a66d0716d62ea62df0768ff0f7afd54b8d0b38afa0948` |
| Strict JSON parser | `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389` |
| Generated TS declaration | `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816` |
| Generated manifest | `fe74285d3f77c290a94bc47e3d8f762b1880e15368436bffa51076b623b79e6a` |
| Radar / Notebook / Policy v1 / Policy v2 / Boussole golden corpora | `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365` / `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` / `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4` / `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad` / `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335` |
| `package.json` / `bun.lock` / `Cargo.lock` | `5412a80c99ed881be7a8bd8436c027fef3f2fbd5d4244864bd59a2382a0a3284` / `33eb37be9f9938f413dc6d3e39a03a6cc7e4ec8830878b236b1f8d5e32981439` / `be5925fce192087993350f87c9d3527f4aaa65e4f81ae1dc64bf1fa77c363a20` |

The manifest schema digest equals the live schema digest. Generated recursive TS branches remain opaque; Rust embeds canonical schemas and validates at runtime. Rust schema-fixture tests cover the same positive/negative fixture set and non-reflective issues.

## Pinned CI-equivalent evidence

All gates ran from an external `git archive` of the exact target, never from the reviewed worktree.

- Bun `1.4.0-canary.1+57f349f63`; `bun install --frozen-lockfile` passed (log `a6fe6ecf7aedcb6640e0c69980b74b2163754157c5ab303469b4db4c6605ee79`).
- `bun run check` passed: contracts plus all dedicated checkers, generated projections, JS license gate, Biome, TypeScript and **257 pass / 0 fail / 622 expectations** (log `3f9bf92816fd975747ff85763c534c372790d54a97b3e5cc527c0b0bbda8119e`).
- `bun audit` passed with no vulnerabilities (log `da111885f1ced5ca5cd4ab06721e793d68cf1eff91ed36a35f4ca9b6c1bccf66`).
- `cargo fmt --all --check`, `cargo clippy --workspace --all-targets --all-features -- -D warnings`, and `cargo test --workspace --all-features` passed. The Rust test log hash is `76cf049d4e73623dc2daf014b3e3f547203276cc0dbe25b3d6eb686b00ea04f2`.
- Notebook Core WASM release build, import inspection and independent rebuild passed under CI-equivalent `env -u CARGO_TARGET_DIR`: **0 module imports, 0 component imports, 512 MiB cap, expected WIT exports**, byte-identical SHA-256 `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729` (repro log `14d7db954ab098b275674695c50792418527f1b2f337af00ceb35233225260a1`).
- `cargo deny check advisories licenses sources` passed (`245deecd3483cc5322ad2199ecc5c9421e832e3f1e6d2f8419170f3c74bccf46`). Full `cargo deny check` also exited zero: advisories, bans, licenses and sources are OK; duplicate-version output is warning-only under the repository's explicit `multiple-versions = "warn"` policy (log `f69f7f06b3557815cc4a4a79d1cdd72a77aa7fd705641b8ffb9a1b23a7f2381d`).

Transparent replay caveat: the literal first WASM import/repro command inherited this harness's external `CARGO_TARGET_DIR`, so its repository-relative artifact path was absent (logs `fc7689c8722f26b39e281df80b21cfb204fffb3b9600379958f9d183f2cd04c1` and `4e35ba9c7afabafbc5cf1f52f6805247da25928f354e364010bbc1ecb935a9d9`). The exact CI environment has that variable unset; the clean replay above passed. This environment red result is retained and is not a target failure.

## Independent adversarial probes

Probe sources were external only:

- main matrix: `/tmp/engine-envelope-security-ccf-probes.ts`, SHA-256 `44948718cc82f82e44139c8b02ec86bb03a0e790bab6ce187ccdcb30367b1c83`;
- preflight-order probe: `/tmp/engine-envelope-security-ccf-preflight-order.ts`, SHA-256 `24aa8817549d87e8279301287dad6e0449322d863d5077fcf3e301e94bb9af26`.

They used the real `bun tools/quality/check-contracts.ts` over disposable archive copies and restored corpus bytes afterward; post-probe `check:contracts` passed and `cmp` confirmed the tested Boussole/Radar/schema bytes returned to the target bytes (integrity log `f2967d11d925aa9492a425462b3a0b98948171aae5dc339ca7e1ce305d7c1129`).

Results (rerun log `5e5e7dd0cc8caad2417c14d677313961f140252933449a6650d4c2b0db4ae192`):

- **55** direct scanner assertions; **103** real-gate value/key assertions; **22** schema-only assertions; **18** strict-input/boundary assertions; **9** `contractFiles`/Radar-canary assertions.
- Direct, percent, `%u`, NFKC/fullwidth, numeric/named/legacy/nested HTML5 forms were rejected when they decoded to sensitive identifiers. Exact HTML5 case behavior was retained; unknown `&at;` and mixed-case `&CommaT;` stayed inert.
- Values **and keys** rejected dot-atom/quoted/EAI local-parts (private-use, C1, default-ignorable, noncharacter), nested/escaped whole comment and quote wrappers, CFWS, combining-IDNA/punycode, IPv4 and lower/mixed/HTML-decoded IPv6 literals, labels/prose/punctuation, generic/custom/SSH URI userinfo, and generic/RSA/DSA/EC/OpenSSH/encrypted-PKCS#8/OpenPGP private-key markers.
- Values and keys preserved required opaque non-identifiers: `release@2`, `R&D`, `R&amplitude`, `50%`, percent-encoded public URLs, Unicode prose, unknown entities, invalid internal quotes/dot-atoms, and direct/NFKC/default-ignorable path-like payloads. Payload path text remained inert: no resolver capability was created.
- Schema-only plus real-gate metadata probes rejected direct, encoded, NFKC and default-ignorable email/path/traversal/credential forms. ASCII-only `metadataString` closes those local metadata forms while Unicode payload values remain opaque.
- Strict raw-byte probes rejected BOM, invalid UTF-8, duplicate decoded members, unpaired surrogates, non-finite numbers and depth 65. Exact 8 MiB passed; 8 MiB + 1 failed. Exact / +1 checks covered strings 65,536 / 65,537, keys 128 / 129 code points, arrays 4,096 / 4,097, objects 512 / 513, and nodes 200,000 / 200,001.
- The separate order probe confirmed **size → strict JSON → recursive bounds → public scan → AJV → `contractFiles` resolution** in five independent assertions (log `b530bf5c16605ad6b40934f1c0169a89d9e8d8d7d29c8e29cb82a55fe4de3ccd`). Sensitive errors were generic and did not reflect injected text.
- `contractFiles` alone resolved repository paths. Valid SHA binding passed; mismatch, duplicate path, traversal, URI, missing target and symlink failed. Radar's synthetic userinfo canary passed only at its exact original Radar file/value; moved or altered copies failed.
- Maximum direct complexity timings in milliseconds: no-`@` 8.148, many-`@` 9.395, malformed quote 5.219, nested legacy HTML 3.380, nested comment wrapper 1.277, NFKC expansion 1.065. No ReDoS or unbounded-expansion signal was observed under the 65,536-code-point cap.

Transparent probe caveat: the first matrix run used an incorrect node baseline (it constructed 200,002 nodes, correctly rejected by the gate) and stopped; log `e2338d0fc97706962083f2a5f390fc02f73cd4d49a960b26e29e8c6f39aebcff`. The external assertion was corrected to exactly 200,000 / 200,001 and the complete rerun passed. No repository file was changed.

## Dependency, corpus and scope checks

`entities@8.0.0` is exact-pinned in `package.json`/`bun.lock` with integrity `sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==`. Installed manifest/license hashes are `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a` / `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`; it is BSD-2-Clause with no dependencies, peers or optional dependencies. It is imported only by `tools/quality/public-source-scanner.ts`, not by product/runtime/WASM code. The JS license and audit gates pass. Owner acceptance remains a separate prerequisite to any future promotion.

All five public corpora passed the shared gate and their dedicated checkers. Independent traversal found one scanner hit only: Radar's exact synthetic canary. No product/runtime consumer of the generated shared type or scanner was found. No engine implementation, capability, real/tenant data path, secret, telemetry, public scoring, release or deployment surface was introduced.

## Findings and residual risks

- **Blocking:** none.
- **Major:** none.
- **Non-blocking:** `cargo deny check` reports existing duplicate-version warnings only; its configured policy permits warnings and all enforced advisory/license/source/ban checks pass.
- **Residual governance risk:** this authority remains candidate. Owner acceptance of `entities@8.0.0`, fresh role evidence if normative bytes change, a separate promotion/integration pass and the explicit owner milestone remain required before any `candidate → locked` transition.
- **Out of scope and still unauthorized:** runtime conformance, product/Rust engine implementation, public scoring, real/personal/tenant processing, network/file/storage/clock/randomness/secret capability, release, infrastructure, Clever Cloud and deployment.

Command-log ledger: `/tmp/engine-envelope-security-ccf.command-log-hashes.txt`, SHA-256 `f3b303246b0bd743ea02c5d8732a6a9c67942a92f1378d6a3964defe5a7e23d0`.

VERDICT: approve security — the immutable PR #83 merge tree is clean and equal to its reviewed PR head; raw-byte preflight, recursive bounds, metadata closure, value/key scanner coverage, resolver confinement, canary scope, non-reflective failures, generated integrity, dependency isolation, pinned Bun/Rust/WASM reproducibility and cargo-deny evidence are all green, while the authority remains candidate and no product/data/runtime/release scope is authorized.
