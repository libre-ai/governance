# Policy Core v2 — final candidate review records

Status: **candidate integrated; not promoted to `locked`**.

- reviewed commit: `dfb1beb3c6715992ec1b3d63593ef036321daa8b`;
- candidate merge: PR #42, `dee0c5740d3b7366a19dc3e79c024f7480a36e83`;
- reviewed and merged trees: byte-identical, tree `b7665ba6b4504161ef68ca1a6bda4018bff548a2`;
- qualified Bun: `1.4.0-canary.1+57f349f63`;
- post-merge CI: run `29552449432`, Bun and Rust green.

## Attributable final set

| Pass | Verdict | Record SHA-256 | Immutable record |
| --- | --- | --- | --- |
| candidate integration | `approve` | `2ff7f299e4322117787436925a39c773081f9ea75c482a25786d1a44325eae9b` | [PR #42 comment](https://github.com/libre-ai/libre-ai/pull/42#issuecomment-4998689031) |
| architecture | `approve` | `2a68f66e2f6b7d2ef475c8ffe54f1bc6e2ee6ffd76c3f99b87743c65467cfe53` | [PR #42 comment](https://github.com/libre-ai/libre-ai/pull/42#issuecomment-4998689102) |
| security | `approve` | `ed39206e2177783709e5b67ee404f55f91ff0257b2847dbf9d0d53c56bab608b` | [PR #42 comment](https://github.com/libre-ai/libre-ai/pull/42#issuecomment-4998689188) |
| privacy France/EU | `approve-with-minor-reservations` | `23235286fb91343ad1c691a363e5d832dc521f0c7e698369f9fb8cee0120312a` | [PR #42 comment](https://github.com/libre-ai/libre-ai/pull/42#issuecomment-4998689276) |

The privacy reservation concerns untracked dependency-bootstrap links in the detached review worktree,
not a privacy weakness in the authorities. Every pass records its dedicated reviewer session and the
reviewed Git index remained unchanged.

## Reviewed authority hashes

```text
2a9ea90e912ff44ada0f896f2af8bfce3cfa7ba7a889a04fe919e7dc75f37a82  contracts/openapi/model-policy.v2.yaml
1fdd2a6bf2d4969b0a0b8e42d85248f583a6e8890f6aa90ca2e10f680fe7c5a9  contracts/schemas/policy-definition.v2.schema.json
0d5895d3063b4ca40b9890f6148e08fec97c3be954a9163458a9425cc41308fb  contracts/schemas/policy-need.v2.schema.json
4b7e3a839e1182312d51dc4e4ea8f0e0a34f68e4ee08230cc14d9c8fe5677a68  contracts/schemas/model-snapshot.v2.schema.json
921d1b4a3ed6285a60449b74a8d4f2c2a6a5bb6d42483bfbc7d59e61bde7c21c  contracts/schemas/policy-evaluation.v2.schema.json
8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4  contracts/wit/policy-core-v2/world.wit
3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc  contracts/wit/policy-core-v2/SEMANTICS.md
cb4c4d1929e01cfc6cd87d5f4386e54b9f3294ef6789c562f556d1b0c5db5bc2  contracts/fixtures/policy-core-v2/operators.json
cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad  contracts/fixtures/policy-core-v2/golden.json
6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77  contracts/fixtures/policy-core-v2/resource-budgets.v1.json
15fc871a4347303c8abf3dad6810c0532d8546b514e3c4a9b4fc81f6c5e4d378  contracts/fixtures/policy-core-invalid-json/manifest.json
```

Historical rejects and approvals on earlier hashes remain in PR #42 and issue #22. This record does
not authorize a product engine, purchase, approval, deployment, personal-data processing or
`candidate -> locked` promotion. Those actions retain their separate owner control milestones.
