# Candidate-integration approval — ccf9d68

- Verdict: `APPROVE candidate-integration`
- Immutable reviewed target: `ccf9d684d9a43ad7236bec905e701e155520e2d6`
- Target tree: `b27ab744e4a53e6f5108f8f72b22dee1e80c8843`
- Review pass: `engine-envelope-post83-integration`
- Session: `019f716e-d880-760d-8058-d7e896964e75`
- Provider/model: `openai-codex/gpt-5.5` (`xhigh`)
- Raw reviewer-output SHA-256: `3c36cbf20b3e46c32b0ceeb370dbdf3d88128b00839a044e26c57d17a7bc3407`
- Scope: candidate-integration only; not Architecture, Security, promotion or owner acceptance
- Later main movement through `48c94aa` is Notebook-only; engine authority hashes remain byte-identical

## Verbatim reviewer output

Review-only candidate-integration completed for exact merge `ccf9d684d9a43ad7236bec905e701e155520e2d6` (`tree b27ab744e4a53e6f5108f8f72b22dee1e80c8843`; parents `a3afbbb8...`, `768f8511...`). Worktree stayed clean: `porcelain_count=0`. Bun pinned: `1.4.0-canary.1+57f349f63`.

Read/applied: `GOALS.md`, `STATUS.md`, decision register, G2 prompt, ADR-0003, full review protocol, full `docs/reviews/specialized-engine-v2/` dossier including CEA/EF1/BEC records and dependency qualification.

Key evidence:
- PR #83 effective diff hash: `/tmp/engine-pr83-effective-diff.txt` `59c02a507c65bcb51e39ffa60ca54d1149097246038fe30ca556e2e0013492b0`
- Probe suite: `/tmp/engine-pr83-probes.json` `5f410a507820f59385c753202cbd4876cf999b793097cc4b13901781f159720c` — 36 scanner + 184 schema + 94 actual-gate checks, 0 failures
- Source hash ledger: `/tmp/engine-pr83-review-source-hashes.txt` `24743175b0aada15ff717543687318211b097e3831c5e4f47ef431212eb3f34d`
- Gate ledger: `/tmp/engine-pr83-gate-ledger.txt` `54f75c607a10849799fb8c24ec95cacf1aa6ac45cf192b18742d5d826e347991`

Findings:
- No blocking candidate-integration finding.
- CEA blockers closed: lower/mixed-case IPv6 direct and HTML5-decoded forms reject in values and keys; NFKC/default-ignorable metadata file/traversal forms reject schema-only and through the real gate.
- Metadata ASCII restriction challenged: all 47 valid schema fixtures still pass; 127 invalid mutations reject; engine payload values/keys remain opaque for Unicode/NFKC/default-ignorable path-like strings.
- Malformed IPv6 controls challenged: malformed literals stay accepted as opaque payloads; valid lower/mixed IPv6 literals reject.
- Wrapped-CFWS, credentials/userinfo, EAI/prose/HTML5/Radar, generated hash, corpus, resource/order/error and `contractFiles` controls all reproduced green.
- `entities@8.0.0`: BSD-2-Clause, no deps/peers/optional deps, imported only by `tools/quality/public-source-scanner.ts`; owner acceptance remains separate (`/tmp/engine-pr83-entities-audit.log` `8d46e9b0e429314a331a3c7e9fb70efb9af8d67e891ac6db83a3221e2d7ce1c0`).
- Sole candidate confirmed: only `engine-golden-vectors-v1`; no product/runtime consumer or product/data/runtime/release authorization.

Gates:
- `bun install --frozen-lockfile` pass
- `bun run check` pass: 257 tests, 0 fail; log `3709b7aa7d5d1822e37d5eadb11b19e99cdccda712c03f4bf72f0e23b17149df`
- `bun audit` pass
- `cargo fmt`, `cargo clippy --locked`, `cargo test --locked` pass; Rust tests 40 pass + doctests
- WASM import/repro pass, both `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729`
- `cargo deny check advisories licenses sources` pass; full `cargo deny check` exits 0 with duplicate-version warnings only

APPROVE candidate-integration — exact clean ccf9d684 target verified; PR #83 closes the CEA IPv6 and metadata blockers without breaking wrapped-CFWS, credential/userinfo, EAI/prose/HTML5, corpus, resource/order/error or contractFiles controls, all pinned Bun/Rust/security gates are green, and authority remains candidate-only with no product/data/runtime/release authorization
