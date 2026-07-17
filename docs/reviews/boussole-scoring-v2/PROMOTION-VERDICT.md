# PROMOTION-INTEGRATION review record — Boussole scoring v2

- **reviewPassId:** `boussole-v2-promotion-integration-1a3f37d-20260717-pi`
- **reviewRole:** `promotion-integration`
- **reviewMode:** separate read-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **attribution:** `reviewerAgentId=pi-boussole-promotion-integrator-gpt54` · `reviewerSessionId=505b7e65-f0f0-4cfb-8486-23a8750bf4d5` · `provider=openai` · `model=gpt-5.4`

## Exact commits

- **promotion commit:** `1a3f37da03a3d010bf2b1f3cc90bd130fa4fc278`
- **promotion base:** `9b376cf65755f7556866123f9fddf681a709a2f0`
- **normative reviewed commit:** `e83e142f647ec9ab6478b7c1e9428950ea209561`

Source worktree verified clean before/after review.

## Collected roles

| Role | Verdict | Reviewed commit | Durable record | SHA-256 | Bounded reservation |
|---|---|---:|---|---|---|
| Architecture | `approve` | `e83e142` | `docs/reviews/boussole-scoring-v2/ARCHITECTURE-VERDICT-FINAL.md` | `c5460d61259b1d027d5e1f7e672848645d969af3785ecc903460d9644c72c6eb` | none |
| Security | `approve-with-minor-reservations` | `e83e142` | `docs/reviews/boussole-scoring-v2/SECURITY-VERDICT-FINAL.md` | `7cacabc74f20176c3727e5eaf33e19bd0d502fc81304d9b61fe7a43bc5532a8e` | stale historical `SECURITY-REMEDIATION.md` packet only; non-conditional |
| Methodology | `approve` | `e83e142` | `docs/reviews/boussole-scoring-v2/METHODOLOGY-VERDICT-FINAL.md` | `7cad942bfdf503bf73d0d9ab16855b5cdcf0d3129e1e027a2c110094af234eec` | none |
| Privacy France/UE | `approve-with-minor-reservations` | `e83e142` | `docs/reviews/boussole-scoring-v2/PRIVACY-VERDICT-FINAL.md` | `bb5c4eedcfa0fb5548565adca005777cff868d7e51183f28f26cc83a600aa4f4` | real dataset/source/attestation still require fresh human review on exact digest; non-conditional |

**Result:** four attributable favorable verdicts on `e83e142`, with only bounded non-conditional reservations.

## Owner milestone

- **URL:** `https://github.com/libre-ai/libre-ai/issues/23#issuecomment-5000285161`
- **UTF-8 body SHA-256:** `7ad78a922abbfbace0282e60d7488342f3fded52a920193a9f07bb31eec0042d`

Exact verified body:
> ## Owner control milestone — Boussole scoring v2 contract promotion
>
> Decision: **continue**.
>
> This authorizes a separate, catalog-only promotion from `candidate` to `locked` for exactly these five Boussole v2 authorities reviewed at immutable commit `e83e142f647ec9ab6478b7c1e9428950ea209561` and durably recorded by PR #52:
>
> - `public-vote-dataset-v2`;
> - `boussole-method-v2`;
> - `boussole-response-set-v2`;
> - `local-comparison-v2`;
> - `boussole-scoring-v2`.
>
> `engine-golden-vectors-v1` remains candidate under its shared dossier. This milestone fixes contract meaning only. It does **not** authorize a Boussole engine, public scoring, a real dataset, personal-data processing, network/provider/storage/secret capabilities, infrastructure, release or deployment. Those remain NO-GO and require later explicit control milestones.

## Promoted IDs verified

1. `public-vote-dataset-v2`
2. `boussole-method-v2`
3. `boussole-response-set-v2`
4. `local-comparison-v2`
5. `boussole-scoring-v2`

## Hashes

- **Promotion package:** `docs/reviews/boussole-scoring-v2/PROMOTION-PACKAGE.md` → `854964f091377ed5620ed7f62f8192b1413b77bf366f08023cdff7acff9e9411`
- **Catalog (base/normative):** `contracts/catalog.v1.json` → `f202986063f034f39406513be4c54cad4e05822e26b38cc4508cba0ca5337cd3`
- **Catalog (promotion commit):** `contracts/catalog.v1.json` → `599c977cd66a1222ea0bbf47396c1a9f5904a68d110bb5b61252d0ebdf29a501`

### Authority hashes
| File | SHA-256 |
|---|---|
| `contracts/schemas/common.v1.schema.json` | `2b96e658dc88c8118fcd3720d6b9b30c445debd1a4facbfe43b321b610a1a396` |
| `contracts/schemas/boussole-method.v2.schema.json` | `2595aa22dd994882a5694bf49b350e6fd8a03fbd725416a0a393c97372abd893` |
| `contracts/schemas/public-vote-dataset.v2.schema.json` | `e43b79d3444d3fb8aa785f07c1b8a733e2009803ef29ccd51fdbbb88841419ec` |
| `contracts/schemas/boussole-response-set.v2.schema.json` | `f321841591dc534e0760a98d90688e3f396c64f4f52e0400f06f05a811018b1e` |
| `contracts/schemas/local-comparison.v2.schema.json` | `1b85bf05268124fb40dc2e06c4c780741bc46927f3048ccaa4fac6a203ef741b` |
| `contracts/schemas/engine-golden-vectors.v1.schema.json` | `cf1a61a5f0e6c9d5c35a869adfa2a3d464c2550f28572735934e02a884cec463` |
| `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` | `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335` |
| `contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json` | `267b7144e5c97fd8840dc40c0c87933000696547a959bbd246904e3af53fc8b6` |
| `contracts/wit/boussole-scoring-v2/world.wit` | `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad` |
| `contracts/wit/boussole-scoring-v2/SEMANTICS.md` | `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5` |
| `tools/quality/check-boussole-v2-vectors.ts` | `807505ac20772289035f3b818899b26bcaca97cf39766249bbf41b85fb25757e` |

## Promotion scope verification

- `git diff --exit-code e83e142..1a3f37d -- <all Boussole normative authority files>`: **empty**
- `contracts/catalog.v1.json` changed on exactly **five** IDs, all `candidate -> locked`
- the same five entries had their `review` objects removed
- `engine-golden-vectors-v1` remains `candidate`
- all six Policy entries remain `candidate`:
  - `policy-definition-v2`
  - `policy-need-v2`
  - `model-snapshot-v2`
  - `policy-evaluation-v2`
  - `model-policy-api-v2`
  - `policy-core-v2`
- unrelated catalog entries unchanged
- **no v1 entry changed**

## Qualified gates and NO-GO state

Verified:

- exact archived Bun `1.4.0-canary.1+57f349f63`
- `bun install --frozen-lockfile` passed in a temporary clone at the reviewed commit
- `bun run check` passed
- `bun audit` passed
- `cargo fmt --all --check` passed
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` passed
- `cargo test --workspace --all-features` passed
- `cargo deny check advisories licenses sources` passed

Also verified current guardrails remain in force:

- public scoring remains **NO-GO**
- no Boussole engine is authorized or implemented
- no real dataset is approved
- no network/provider/storage/secret capability is authorized
- WIT boundary remains capability-free (`no network, storage, clock, randomness, identity, logging`)
- `docs/apps/boussole.md` still states local-only responses/results, no response API, compile/release-disabled public scoring

## Commands

```text
git rev-parse HEAD
git status --short
git merge-base --is-ancestor 9b376cf65755f7556866123f9fddf681a709a2f0 1a3f37da03a3d010bf2b1f3cc90bd130fa4fc278
git merge-base --is-ancestor e83e142f647ec9ab6478b7c1e9428950ea209561 1a3f37da03a3d010bf2b1f3cc90bd130fa4fc278
shasum -a 256 docs/reviews/boussole-scoring-v2/*.md
shasum -a 256 contracts/schemas/common.v1.schema.json contracts/schemas/boussole-method.v2.schema.json contracts/schemas/public-vote-dataset.v2.schema.json contracts/schemas/boussole-response-set.v2.schema.json contracts/schemas/local-comparison.v2.schema.json contracts/schemas/engine-golden-vectors.v1.schema.json contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json contracts/wit/boussole-scoring-v2/world.wit contracts/wit/boussole-scoring-v2/SEMANTICS.md tools/quality/check-boussole-v2-vectors.ts
git diff --exit-code e83e142f647ec9ab6478b7c1e9428950ea209561..1a3f37da03a3d010bf2b1f3cc90bd130fa4fc278 -- <Boussole authority files>
python3 ... (catalog diff audit: base/norm/head; exact changed IDs; policy/engine states; no v1 changes)
gh issue view 23 --repo libre-ai/libre-ai --comments --json comments | python3 ... (owner comment SHA-256 recomputation)
curl/unzip archived Bun 1.4.0-canary.1+57f349f63 to temp
git clone <repo> <temp> && git checkout 1a3f37da03a3d010bf2b1f3cc90bd130fa4fc278
bun run check:toolchain
bun install --frozen-lockfile
bun run check
bun audit
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo deny check advisories licenses sources
git status --short
```

## Findings by severity

- **Blocking:** none
- **Major:** none
- **Minor:** none
- **Non-blocking:** host default Bun was `1.3.11+af24e281e`; qualified Bun checks were therefore rerun with the archived pinned Bun in a temporary clone to preserve read-only review conditions

## Residual / rollback / scope

- This pass approves **catalog promotion only**
- It does **not** approve runtime conformance, engine implementation, public scoring, real dataset use, personal-data processing, release, deployment, or added capabilities
- Rollback is a simple revert of commit `1a3f37da03a3d010bf2b1f3cc90bd130fa4fc278`; no runtime or data migration is involved

## Final verdict

**APPROVE**
