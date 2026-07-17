# `engine-golden-vectors-v1` — catalog promotion package

- **Promotion base:** `f9da28d0291671bd86424d9533e30e3423d5b4ca`
- **Normative reviewed commit:** `ccf9d684d9a43ad7236bec905e701e155520e2d6`
- **Normative reviewed tree:** `b27ab744e4a53e6f5108f8f72b22dee1e80c8843`
- **Scope:** exactly `engine-golden-vectors-v1`, `candidate → locked`
- **Product/runtime/data/release:** **NOT AUTHORIZED**
- **Package state:** approved by the separate [`PROMOTION-VERDICT.md`](PROMOTION-VERDICT.md) pass on
  immutable promotion commit `3b47e966eac2cdc85f4a6fad78e18744f63662e1`
- **Promotion verdict SHA-256:** `52c49f47636945fac7b9314ce1be45ddb394d78ea5bdc6f4b685673d223619a1`

No normative engine-envelope, corpus, WIT, semantics, checker, generated projection or dependency
byte changes in this package. The only machine-authoritative transition is the target catalog status
and removal of its now-satisfied review object. `locked` fixes contract meaning only.

## Collected review records

| Role | Verdict | Reviewed commit | Durable record | Record SHA-256 |
| --- | --- | --- | --- | --- |
| Candidate-integration | `approve` | `ccf9d68` | [`CANDIDATE-INTEGRATION-CCF9D68.md`](CANDIDATE-INTEGRATION-CCF9D68.md) | `62d59e751efbe0144d779b3497e55d7494a9d36b5b5ebadc1c22ce69d02ffc4f` |
| Architecture | `approve-with-minor-reservations` | `ccf9d68` | [`ARCHITECTURE-VERDICT-CCF9D68.md`](ARCHITECTURE-VERDICT-CCF9D68.md) | `99d5887946a1ae23cc11cc14dd5244a61c46b6635aeba86f3a402e4abd5b5edb` |
| Security | `approve` | `ccf9d68` | [`SECURITY-VERDICT-CCF9D68.md`](SECURITY-VERDICT-CCF9D68.md) | `e4e9910c4872206a9762f580f538a4bd76fc885ca051562873151b437e066cfb` |

The Architecture reservation concerned stale in-tree lifecycle links only. PR #85/#86 persisted the
exact candidate/role records and reconciled the dossier without changing authority bytes. The three
passes remain bound to the same immutable commit and tree.

## Owner dependency milestone

- **Decision:** exact `entities@8.0.0` accepted with bounded dev-only conditions after challenge;
- **Durable record:** [`OWNER-ACCEPTANCE-ENTITIES.md`](OWNER-ACCEPTANCE-ENTITIES.md);
- **Record SHA-256:** `0258b4bc9a42950d0488cad8e4ef857384d8f1cf0f09effe1c83d0790227c005`;
- **Issue evidence:** `https://github.com/libre-ai/libre-ai/issues/25#issuecomment-5006966900`.

The acceptance is invalidated by any version, integrity, dependency graph, lifecycle hook, import
site, runtime/network behavior or data-boundary change. The exact declaration remains `8.0.0`; the
lock remains dependency-free with integrity
`sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==`.

## Final owner merge control

- **Decision:** `continue`, scoped to merge of this single catalog transition after the favorable
  promotion-integration verdict and green final CI;
- **Governing instruction:** `review le jalon, challenger et continuer`;
- **Durable reference:** `https://github.com/libre-ai/libre-ai/pull/89#issuecomment-5007164051`;
- **UTF-8 body SHA-256:** `e5df615b114844c3bdef09e50cddf0810ef94fcb20b57699534c8ac52413ab2a`.

Any drift in the schema, scanner, corpus, WIT, dependency version/integrity/import scope or catalog
transition changes this decision to `hold`. The control explicitly excludes product/runtime/scoring,
real/personal/tenant data, capabilities, release, infrastructure and deployment.

## Proposed transition

Before promotion:

- catalog SHA-256: `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`;
- statuses: `70 locked / 1 candidate`;
- target: `candidate`, review roles `architecture` and `security` pending in catalog.

On this promotion commit:

- catalog SHA-256: `51d377ade65fc8b32ac97e04eb6dbea1687cc433d6bb0a50e7ef9ee3c9c062ad`;
- statuses: `71 locked / 0 candidate`;
- target: `locked`, stale review object removed;
- every unrelated catalog entry is byte-equivalent as structured data.

## Frozen authority hashes

| File | SHA-256 |
| --- | --- |
| `contracts/schemas/engine-golden-vectors.v1.schema.json` | `a654c359a342c65e175926ee364abadece1bde47757b4a58ee95144123de185f` |
| `contracts/fixtures/schema-fixtures.v1.json` | `afb10e51d4933305edf72241b01dab832e7f25dd38e4e6bfde8b42ba675a10d5` |
| `tools/quality/check-contracts.ts` | `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a` |
| `tools/quality/public-source-scanner.ts` | `5cb38d84a1b82d3172a795c6ce24de2a5d88fd8321942021863413c6b807c8bf` |
| `tools/quality/public-source-scanner.test.ts` | `f67f3316d2fae45a852a66d0716d62ea62df0768ff0f7afd54b8d0b38afa0948` |
| `tools/quality/policy-core-raw-inputs.ts` | `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389` |
| `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` | `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816` |
| `packages/contracts/src/generated/manifest.json` | `fe74285d3f77c290a94bc47e3d8f762b1880e15368436bffa51076b623b79e6a` |
| `contracts/fixtures/radar-engine-v2/golden-vectors.v1.json` | `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |
| `contracts/fixtures/policy-core-v1/golden.json` | `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4` |
| `contracts/fixtures/policy-core-v2/golden.json` | `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad` |
| `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` | `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335` |
| `contracts/wit/radar-engine-v2/world.wit` | `0fbb69be39f265e44feb77ce054fcece052cff38ff0eacd3353f9f8d50bd8073` |
| `contracts/wit/radar-engine-v2/PROFILE.md` | `41de764dafb0e0778c7f7a338400b587ad980669879ff51bf5afe6514f3a434c` |
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| `contracts/wit/policy-core-v1/world.wit` | `1414e64f434ce72bd7d1bf9e182951c25b6b493c2f146054d7e40eaffcb4f21d` |
| `contracts/wit/policy-core-v1/SEMANTICS.md` | `ce92a54fe1c94bcf6dfbe0356d57fbfa7b132fec4156d404b6ccb986a4220788` |
| `contracts/wit/policy-core-v2/world.wit` | `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4` |
| `contracts/wit/policy-core-v2/SEMANTICS.md` | `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc` |
| `contracts/wit/boussole-scoring-v2/world.wit` | `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad` |
| `contracts/wit/boussole-scoring-v2/SEMANTICS.md` | `3424f20b8554c5cd400b8054d6a5ed9d83aae1e5f6a56fdf72cda4a7191b5ba5` |

The complete 28-file envelope/corpus/profile/checker boundary is byte-identical between `ccf9d68`
and promotion base `f9da28d`. Unrelated Notebook Gate B implementation/resource work after `ccf9d68`
does not modify these files or authorize Notebook production.

## Required promotion-integration evidence

A dedicated read-only `promotion-integration` pass on the clean immutable promotion commit must:

1. recompute all authority, role, dependency and owner-record hashes;
2. prove the frozen authority diff from `ccf9d68` is empty;
3. prove exactly one structured catalog transition, `engine-golden-vectors-v1: candidate → locked`,
   with only the satisfied review object removed;
4. prove `71 locked / 0 candidate` and no unrelated status/ownership/consumer/classification change;
5. run pinned Bun and Rust repository gates, WASM import/reproducibility and cargo-deny checks;
6. confirm `locked` grants no implementation, scoring, data, capability, release, infrastructure or
   deployment authority.

The independent pass approved all six checks above with 71 locked / 0 candidate, byte-identical
authority surfaces and green pinned Bun/Rust/WASM/cargo-deny evidence. Main later advanced through a
Notebook-only diagnostic change; before merge, final control must confirm the engine schema,
scanner, corpus, WIT, dependency version/integrity/import scope and catalog promotion bytes are
unchanged.

Any stale hash, broadened transition, missing owner evidence or blocking/major finding requires
rejection. Rollback is a revert of the catalog-only promotion commit; no runtime or data migration is
required.
