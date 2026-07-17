# Radar engine v2 — contract promotion verdict

- **Review pass:** `radar-v2-promotion-6c66e97`
- **Mode:** separate promotion/integration pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Promotion evidence commit:** `6c66e9762e7d45e394c9c4adbb00966bc02d8eb9`
- **Normative reviewed commit:** `bbe6c96651430f0a5dc0f6008e69487aead0cd41`
- **Decision:** **APPROVE** promotion of the seven Radar v2 authorities from `candidate` to `locked`
- **Product implementation:** **NOT AUTHORIZED** by this promotion milestone

No normative Radar authority was modified during this pass. The promotion target descends from the reviewed commit, and an explicit diff over every reviewed authority is empty.

## Collected role records

| Role | Review pass | Verdict | Durable record | Merge evidence |
| --- | --- | --- | --- | --- |
| Architecture | `radar-architecture-rereview-bbe6c96` | `APPROVE` | `ARCHITECTURE-VERDICT-2.md` | PR #44, `60f046ac092b5d6cf987623f772f6bbfc4239859` |
| Security | `radar-security-rereview-bbe6c96` | `APPROVE` | `SECURITY-VERDICT-2.md` | PR #45, `6c66e9762e7d45e394c9c4adbb00966bc02d8eb9` |

Both records bind commit `bbe6c96651430f0a5dc0f6008e69487aead0cd41`, contain zero blocking, major or minor finding, and approve the same current authority hashes.

## Human control milestone

- **Owner decision:** `continue`, scoped to a separate Radar v2 contract promotion to `locked`;
- **Durable reference:** `https://github.com/libre-ai/libre-ai/issues/20#issuecomment-4998658043`;
- **UTF-8 body SHA-256:** `a4b89366277eb90053395f7571ef728a654948549ed9bc58809cc9dcad236951`.

The recorded decision explicitly excludes a Radar Rust/product engine, public enablement, personal or tenant data processing, network/storage/secret capabilities, infrastructure and deployment.

## Authorities promoted

1. `radar-normalized-item-v1`;
2. `radar-normalized-feed-v1`;
3. `radar-rule-evaluation-v1`;
4. `curation-rule-set-v2`;
5. `curated-item-export-v2`;
6. `radar-api-v2`;
7. `radar-engine-v2`.

Radar v1 remains separately locked and byte-identical. Notebook, Policy, Boussole and the shared engine-vector envelope remain candidates under their own dossiers.

## Frozen hashes

| Authority | SHA-256 |
| --- | --- |
| `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json` | `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365` |
| `contracts/fixtures/radar-engine-v2/security-vectors.v1.json` | `a092dabcd81afdac4eaeb57aafc4bf9c26cec89aa514f05e48e56bfe1b0804a6` |
| `contracts/wit/radar-engine-v2/world.wit` | `0fbb69be39f265e44feb77ce054fcece052cff38ff0eacd3353f9f8d50bd8073` |
| `contracts/wit/radar-engine-v2/PROFILE.md` | `41de764dafb0e0778c7f7a338400b587ad980669879ff51bf5afe6514f3a434c` |
| `contracts/schemas/radar-normalized-item.v1.schema.json` | `644da2a61008dcc87a73eed78250596d30444c218f325c8cbb2832e722eff10b` |
| `contracts/schemas/radar-normalized-feed.v1.schema.json` | `dc95132e8bd79cffdd5caeedbd49876fbdd977256eaca2ef90aada0d43758e68` |
| `contracts/schemas/radar-rule-evaluation.v1.schema.json` | `ae08eb81187c78f0616c715ac3c7fc758590b24468ac579dbe25211285da9116` |
| `contracts/schemas/curation-rule-set.v2.schema.json` | `0a8de8db43ab4c3daffd23a7fb5f1c0d004b2e18f4c8009c0b7d1f90c9e514d8` |
| `contracts/schemas/curated-item-export.v2.schema.json` | `f55f65c8d121dfbef781bce0732d76020725f392825fc68ba3421625a88aa422` |
| `contracts/openapi/radar.v2.yaml` | `2eb98ace057c7c3a786068926371bda5ad414aa04b75e4b231a521f971806012` |

## Promotion evidence executed

Using qualified Bun `1.4.0-canary.1+57f349f63` on a clean worktree at `6c66e9762e7d45e394c9c4adbb00966bc02d8eb9`:

- an independent promotion script parsed both role records, required explicit approvals/no blocking or major finding, recomputed every recorded file hash, matched all seven catalog paths and confirmed exact Architecture/Security role requirements;
- `git diff --exit-code bbe6c96..6c66e97 -- <all Radar v2 authorities>` proved no normative drift;
- Radar v1 was compared with its pre-candidate baseline and remained byte-identical;
- `bun run check` passed 113 tests and all contract/vector/generated/work-package/toolchain gates;
- `bun run audit` reported no known JavaScript vulnerability;
- `cargo fmt --all --check`, Clippy with warnings denied, 20 Rust tests, `cargo check --workspace` and `cargo deny check advisories licenses sources` passed.

After the catalog-only status transition, the same repository gates must pass again before merge.

## Findings

- **Blocking:** none.
- **Major:** none.
- **Minor:** none.
- **Non-blocking:** implementation risks remain exactly those listed in the two role verdicts.

## Scope and rollback

Promotion locks contract meaning and compatibility. It does not claim runtime conformance: no Radar parser/evaluator engine exists. Generated maximum boundaries, parser differentials, component import scanning, SSRF quarantine, tenant authorization, confidential URL handling and UI escaping remain future implementation gates.

Rollback is a revert of the promotion commit, restoring the seven catalog entries to `candidate`; no data migration, runtime rollback or infrastructure action is involved.

## Explicit verdict

**APPROVE** the catalog promotion of the seven Radar v2 authorities to `locked` with the exact hashes above. Do not start product implementation, process real personal/tenant data, add capabilities or deploy without a new explicit owner milestone.
