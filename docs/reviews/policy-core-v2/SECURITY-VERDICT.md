# Security review — Policy v2 dossier

Attribution: `reviewPassId=policy-v2-d47feb9-security`; `reviewerAgentId=pi-policy-security-gpt55`; `reviewerSessionId=3bcec2e0-d6cf-474a-bb79-0f939e01a4fb`; provider `openai-codex`; model `gpt-5.5`.

Reviewed immutable commit: `d47feb96e605263b825f603033e40c3d1b61800c`  
Role: Security only. No Architecture, Privacy, or promotion verdict is issued.

## Hash table

| Path | SHA-256 |
|---|---:|
| `contracts/schemas/policy-definition.v2.schema.json` | `1fdd2a6bf2d4969b0a0b8e42d85248f583a6e8890f6aa90ca2e10f680fe7c5a9` |
| `contracts/schemas/policy-need.v2.schema.json` | `0d5895d3063b4ca40b9890f6148e08fec97c3be954a9163458a9425cc41308fb` |
| `contracts/schemas/model-snapshot.v2.schema.json` | `4b7e3a839e1182312d51dc4e4ea8f0e0a34f68e4ee08230cc14d9c8fe5677a68` |
| `contracts/schemas/policy-evaluation.v2.schema.json` | `921d1b4a3ed6285a60449b74a8d4f2c2a6a5bb6d42483bfbc7d59e61bde7c21c` |
| `contracts/openapi/model-policy.v2.yaml` | `2a9ea90e912ff44ada0f896f2af8bfce3cfa7ba7a889a04fe919e7dc75f37a82` |
| `contracts/wit/policy-core-v2/world.wit` | `8eed79161296451e17bcbb27cbd71d6490f3c9debbbc6ef826a7dc8a85f7d9e4` |
| `contracts/wit/policy-core-v2/SEMANTICS.md` | `3525078d3baeb452e146d766df2afb87a3836d69197a794ef82a641be1d055cc` |
| `contracts/fixtures/policy-core-v2/operators.json` | `cb4c4d1929e01cfc6cd87d5f4386e54b9f3294ef6789c562f556d1b0c5db5bc2` |
| `contracts/fixtures/policy-core-v2/golden.json` | `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad` |
| `contracts/fixtures/policy-core-v2/resource-budgets.v1.json` | `6f7ed86b5c84c9d29588d871908251370038dcabe90ebc646f2a9c1b620d8f77` |
| `contracts/fixtures/policy-core-invalid-json/manifest.json` | `15fc871a4347303c8abf3dad6810c0532d8546b514e3c4a9b4fc81f6c5e4d378` |
| raw malformed `.bin` fixture hashes | matched manifest for all 9 cases |

## Evidence reproduced

Commands/checks run read-only; worktree remained clean.

- `git rev-parse HEAD` → reviewed commit matches `d47feb96e605263b825f603033e40c3d1b61800c`.
- `git status --short` before/after → clean.
- `sha256sum ...` over Policy v2 authorities, profile and vectors.
- Local Bun observed: `1.3.11+af24e281e`; pinned `1.4.0-canary.1` binary was not locally present, so Bun result is supporting evidence only.
- `BUN_INSTALL_CACHE_DIR=/tmp/pi-readonly-bun-cache-do-not-use bun tools/quality/check-policy-core-v2-vectors.ts` → pass: 20 golden cases, 28 operator cases, 9 raw decoder refusals, 10 byte boundaries, depth 64.
- Independent Python check → pass:
  - recomputed selected Policy/Snapshot/Need/Evaluation digest bindings for `all-operators-eligible` and the order-independence pair;
  - verified all six closed WIT variants are present;
  - verified malformed-input fixture hashes/lengths, including decoded duplicate key;
  - verified resource byte/depth/CPU/memory ceilings;
  - verified WIT has no imports and exports only `api`;
  - verified OpenAPI error envelope has `code` + `requestId` only, no `message`.
- `rg` over `crates`, `apps`, `packages`, contracts and tools found no hidden Policy v2 product evaluator, purchase path, authorization side effect, network/clock/storage/randomness capability in the WIT candidate.

## Security assessment

Confirmed:

- tenant mismatch is fail-closed and digest substitution is covered before tenant acceptance;
- `proposedBy` / `approval.approverId` separation is explicit, vector-covered, and subject digest is bound;
- approval authenticity is deliberately outside the pure evaluator and assigned to the authorized caller boundary;
- BOM, invalid UTF-8, decoded duplicate keys, unpaired surrogates and invalid JSON numbers are covered by byte-exact fixtures;
- absent, stale, future-dated and wrong-typed facts cannot yield `eligible`;
- same-name fact multiplicity is universal, not cherry-picked;
- stale/future/type/unknown precedence and failed-over-unknown behavior are vector-covered;
- exact and limit+1 resource evidence exists for three inputs, evaluated-at and output; JSON depth 64 exact/+1 is checked;
- preimplementation CPU/memory limits require bounded lookup and non-pairwise duplicate detection;
- WIT has zero host capabilities;
- OpenAPI refusal body is closed structurally and redacted;
- source/principal/model IDs are bounded and opaque;
- evaluator result is advisory only and grants no authorization, approval, purchase or deployment power;
- no fact values, parser diagnostics, tenant IDs, reviewer identity, secrets or PII are exposed through component errors.

## Findings

Blocking: none.

Major: none.

Minor:

1. `PolicyProblem.error.code` is pattern-constrained rather than an enum. Normative text requires stable static codes and no reflected diagnostics; implementation must enforce an allowlist, not derive codes from input.
2. Source URI validation is DNS-shaped and excludes obvious localhost/IP/userinfo/query/fragment cases, but it is not a public-suffix or reserved-zone proof. Since the evaluator has no network capability this is not blocking; future source adapters must not treat the regex alone as SSRF/public-source authorization.

## Residual risks

- Approval authenticity/current validity remains an external authorized-caller obligation by design.
- Resource budgets are preimplementation qualifications; actual CPU/fuel evidence remains required once a component exists.
- Privacy-specific minimization and reviewer identity treatment still require the separate Privacy role.

SECURITY verdict: APPROVE

One Security role cannot promote, lock, or authorize implementation of this candidate; Architecture, Privacy, promotion review and owner control milestones remain required.
