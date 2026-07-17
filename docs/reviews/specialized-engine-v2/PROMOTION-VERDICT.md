# `engine-golden-vectors-v1` — promotion-integration verdict

- Verdict: **APPROVE promotion-integration**
- Review pass: `engine-envelope-promotion-integration-stable`
- Mode: separate promotion/integration review-only pass
- Immutable reviewed target: `3b47e966eac2cdc85f4a6fad78e18744f63662e1`
- Target tree: `b0ef34ad33bc3cfe14fc8b14879afeaf2db8672a`
- Promotion base: `f9da28d0291671bd86424d9533e30e3423d5b4ca`
- Normative reviewed target: `ccf9d684d9a43ad7236bec905e701e155520e2d6`
- Session: `019f71b3-6d0d-7bff-b1cf-06ec9cf56943`
- Provider/model: `openai-codex/gpt-5.5` (`xhigh`)
- Raw reviewer-output SHA-256: `e3f235fa21bfa778c1997eb8850a12a641b45141459fefe689856ed8d69f080d`
- Scope: technical catalog promotion only; not owner impersonation or product/runtime/data/release authorization

A prior attempt lost its ephemeral worktree before reading the dossier or reproducing evidence.
It is operational non-evidence and supplies no verdict. This record is the complete independent rerun
from an isolated clone that remained clean.

## Verbatim reviewer output

Review-only terminé sur `3b47e966eac2cdc85f4a6fad78e18744f63662e1` (`tree b0ef34ad33bc3cfe14fc8b14879afeaf2db8672a`). Worktree tracked propre avant/après (`porcelain_count=0`). Aucun fichier modifié.

Preuves principales :
- PR head local/remote : `origin/promote/engine-golden-vectors-v1-ccf9d68 = 3b47e966…`.
- Parent exact : `f9da28d0291671bd86424d9533e30e3423d5b4ca` (`Merge pull request #88 from libre-ai/review/engine-owner-entities`) ; `f9da28d` et `ccf9d684…` sont ancêtres.
- Diff promotion depuis `f9da28d` limité à 5 fichiers : `STATUS.md`, `contracts/CATALOG.md`, `contracts/catalog.v1.json`, `docs/reviews/specialized-engine-v2/README.md`, nouveau `PROMOTION-PACKAGE.md`.
- Diff autorité `ccf9d68..HEAD` vide pour les 29 fichiers schema/fixture/corpus/WIT/semantics/scanner/gate/generated/checkers vérifiés.

Catalog :
- `contracts/catalog.v1.json` : `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35` → `51d377ade65fc8b32ac97e04eb6dbea1687cc433d6bb0a50e7ef9ee3c9c062ad`.
- `70 locked / 1 candidate` → `71 locked / 0 candidate`.
- Seul objet changé : `engine-golden-vectors-v1`, `candidate` → `locked`, suppression de `review.state=pending-independent-agent-review`.
- Les 70 autres objets sont inchangés en JSON canonique : `c28d193fa136dddbf028198cf7318ce38b083fcb94150e27d41669e4d8d459b9` des deux côtés, et restent `locked`.

Hashes recomputés :
- `PROMOTION-PACKAGE.md` : `0c935b0ad0717c9152dc2c647af1cd9d73b75c630486df95b4b8d7c2f4b9ea76`.
- Records CCF : candidate `62d59e751efbe0144d779b3497e55d7494a9d36b5b5ebadc1c22ce69d02ffc4f`, Architecture `99d5887946a1ae23cc11cc14dd5244a61c46b6635aeba86f3a402e4abd5b5edb`, Security `e4e9910c4872206a9762f580f538a4bd76fc885ca051562873151b437e066cfb`.
- Owner acceptance : `0258b4bc9a42950d0488cad8e4ef857384d8f1cf0f09effe1c83d0790227c005`.
- Full specialized-engine dossier ledger : `3a3a008afe776fc12e6ae68dec38c7797bc29ba592475c5c7a6e91aae86bab47`.
- Authority/checker 29-file ledger : `b049c14903a68c8960da66d69d1abacd8f7c94262c9a9564d43340d91c312318`.
- Key authority hashes matched package, including schema `a654c359…`, fixtures `afb10e51…`, scanner `5cb38d84…`, generated manifest `fe74285d…`, Radar/Notebook/Policy/Boussole corpora unchanged.

Dependency check :
- `entities` exact `8.0.0`; `bun.lock` integrity `sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==`.
- Installed package/license hashes : `86e28ac6…` / `cb992345…`; BSD-2-Clause, no deps/peer/optional, no install/prepare lifecycle hook.
- Import scope limité à `tools/quality/public-source-scanner.ts`; no product/runtime consumer found. Generated type non-doc usage only in generated declaration.

Gates run :
- `bun install --frozen-lockfile` pass ; `bun --revision` `1.4.0-canary.1+57f349f63`.
- `bun run check` pass : 71 catalog entries, 47 schema fixture pairs, generated contracts 48, JS licenses 47, `261 pass / 0 fail`.
- `bun audit` pass.
- `cargo fmt --all --check` pass.
- `cargo clippy --locked --workspace --all-targets --all-features -- -D warnings` pass.
- `cargo test --locked --workspace --all-features` pass.
- `cargo deny check advisories licenses sources` pass ; full `cargo deny check` exit 0 with duplicate-version warnings only.
- WASM build/import/repro pass ; 0 module imports, 0 component imports, 512 MiB cap ; reproducible SHA `a4c968ccb98eea35e5e92166d801b71f0bcf1fd0284af7c47b3406f83dd881dc`.

Challenges :
- Architecture reservation closure is supported: CCF records are persisted, hashes match, and authority bytes did not drift from `ccf9d68`.
- `CATALOG`/`STATUS`/README wording stays scoped to locked contract meaning and repeatedly denies product/runtime/data/release authority.
- This is technical promotion-integration only; it does not impersonate owner control or perform the final human merge action.
- No changed path adds product engine, public scoring, real data, release, infrastructure, deploy or new capability.

APPROVE promotion-integration — exact catalog-only promotion verified: only `engine-golden-vectors-v1` moves candidate→locked with its satisfied review object removed, authority/dependency bytes and records are hash-bound, gates are green, and no product/runtime/data/release scope is authorized
