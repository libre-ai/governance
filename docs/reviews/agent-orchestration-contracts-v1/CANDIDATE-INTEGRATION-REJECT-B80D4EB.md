# Candidate-integration review — agent orchestration contracts @ b80d4eb

- **reviewPassId:** `agent-orchestration-candidate-integration-b80d4eb-r1`
- **mode:** dedicated review-only `candidate-integration`
- **reviewedCommit:** `b80d4eb973781a55addf7d972de2f595b4f0e481`
- **review worktree:** detached, clean before and after
- **verdict:** `reject`

This pass is not an Architecture, Security or France/EU Privacy role verdict. It does not modify or
invalidate their favorable records on `e93da197804c013dff2eb250a58bf7525ccd3658`: all 21 reviewed
authority hashes and the hash-list digest remain exact. It grants no catalog promotion, runtime,
provider, network, secret, persistence, real mission, release, infrastructure or deployment.

## Evidence reproduced

Using exact Bun `1.4.0-canary.1+57f349f63` and Rust `1.97.0`:

- clean detached target and empty normative authority diff from `e93da19`;
- `bun install --frozen-lockfile`;
- `bun run check:toolchain`;
- `bun run check`: 344 tests, 60 generated TypeScript projections, 85 catalog entries, 59 schema
  fixture pairs, 113 HTTP operations and all agent-orchestration vectors green;
- `bun run audit`: no known JavaScript vulnerability;
- `cargo fmt --all --check`;
- `cargo clippy --workspace --all-targets --all-features --locked -- -D warnings`;
- `cargo test --workspace --all-features --locked` and `cargo check --workspace --all-features --locked`;
- `cargo deny check advisories licenses sources`;
- independent recomputation: 21/21 authority hashes match and
  `AUTHORITY-HASHES-E93DA19.txt` remains
  `de70d36761d275bb3e145d60232e964f038f928f2594b38b60ea3ce7efa3beb2`.

## Findings by decision axis

### Major — Security / Quality

`CI-B80-MAJ-001` — the candidate `contracts/authz/agent-runs-v1.datalog` is not executed by a
Biscuit authorizer in any repository gate. `tools/quality/check-agent-orchestration-vectors.ts`
evaluates the 15 authorization vectors through a handwritten TypeScript switch, so policy and
mirror can drift while both the source scan and vectors remain green. The existing Rust parser test
also lists only `sessions-v1.datalog` and `missions-v1.datalog`; it omits the candidate policy.

This leaves the Security verdict’s explicit promotion reservation open: the selected Biscuit engine,
root-key rotation and fail-closed revocation behavior have not been exercised. Promotion readiness
is therefore rejected even though the normative authority hashes are unchanged.

Required remediation:

1. parse `agent-runs-v1.datalog` in the Rust policy gate;
2. execute all 15 existing vectors against an exact-pinned, permissively licensed Biscuit engine;
3. prove overlapping key rotation, unknown/retired key refusal, root-block revocation and
   key/revocation-store outage fail closed;
4. impose bounded Datalog execution limits and rerun supply-chain gates.

### Minor — Completeness / audit

`CI-B80-MIN-001` — the RFC and dossier still describe a draft/candidate awaiting a future human
milestone. Before promotion, the dossier must record the scoped owner instruction, the separate
promotion package, exact authority hashes, rollback and the continuing prohibition on runtime work.

### Performance

No current performance defect was reproduced. The future real-authorizer gate must use explicit
fact, iteration and time limits rather than relying on library defaults.

### Sovereignty and France/EU privacy

No new service, data transfer or US runtime dependency is present. Existing Privacy reservations
remain implementation gates: pseudonymous identities/digests require tenant RLS, need-to-know export
authorization and bounded deletion/restore evidence. They do not become anonymous data and are not
waived by contract promotion.

## Explicit verdict

**REJECT candidate-integration promotion readiness** for `b80d4eb` because the actual Biscuit policy
is not executed and key/revocation failure modes are unqualified. Preserve the role approvals and
21 authority hashes, remediate only the non-authority conformance/supply-chain surface, then perform
a fresh candidate-integration pass on a new immutable commit.
