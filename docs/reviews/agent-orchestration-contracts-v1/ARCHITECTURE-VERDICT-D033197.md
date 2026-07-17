# Architecture review — contract candidates d033197

- **reviewPassId:** `agent-orchestration-contracts-architecture-d033197`
- **mode:** `architecture`
- **reviewedCommit:** `d03319704793d1e851bad0088fb97e8df9c0787a`
- **review worktree:** detached, clean, review-only
- **verdict:** `reject`

## Reproduced evidence

```text
bun run check:source
Source policy verified
bun run check:work-packages
Work package plan verified: 26 packages, 53 exclusive write paths
bun run check:specifications
Application specification structure verified: 9
NODE_PATH=<pinned-workspace-node_modules> bun run check:contracts
Contracts verified: 85 catalog entries, 59 schema fixture pairs, 113 HTTP operations
Agent orchestration vectors verified: 26 quorum, 15 authz, 42 transition, 9 digest and 4 signature cases
cargo test -p libre-ai-contract-types
11 tests passed
biome ci .
Checked 227 files. No fixes applied.
```

The review worktree remained clean after reproduction.

## Findings

### Major — execution authorization appears as a reviewer-callable API operation

`contracts/openapi/missions.v2.yaml` maps both `SubmitAgentReview` and `AuthorizeExecution` to `POST /v2/missions/{missionId}/reviews`, whose declared security scheme is the reviewer-facing internal Biscuit bearer. `docs/apps/missions.md` also lists `AuthorizeExecution` as a v2 command.

The semantic profile says Missions computes quorum and emits authorization as a server-owned consequence. Exposing `AuthorizeExecution` as an operation of the review submission endpoint blurs that authority and permits clients/implementers to interpret a reviewer call as the authorization command. Remove it from the client/API command surface or give a Missions-only internal boundary with an unambiguous policy.

### Minor — rejection evidence is not explicit in the aggregate

`plan-rejected` and `rejected` can be schema-valid with an empty generic `reviews` array. This cannot create false success, but a dedicated exact-digest rejection review reference should be required for attributable rejection, or the semantic rule should explicitly define the authoritative rejection event.

## Verified architecture

- Locked Missions v1 authorities remain unchanged.
- Missions owns mission transitions and quorum projection; orchestrator/harness utilities are defensive validators, not state authorities.
- Plan body and execution authorization are separate and digest-bound.
- `start` does not preallocate `runId`; later control/events bind the generated run.
- Pi remains a replaceable worker behind orchestrator and harness boundaries.

## Authority and vector hashes

```text
6b7395775758bdd56e6720f44388b4053030e7c7f108f833cc6ee8876a75bcdf  contracts/agent-orchestration/SEMANTICS.md
f20dae7884e49fa00982044a51e99b7f09a5598487bc21f222fcb2d692e3126b  contracts/authz/agent-runs-v1.datalog
2e4e0e58272aaa7790ed2b8dbda930e80efaee86698090acd7dae4327bb07454  contracts/fixtures/agent-orchestration-v1/authz-vectors.v1.json
dcd22bc7c06ec876bb79156b691aacb94f807028c8806a1b74122e246e89f73b  contracts/fixtures/agent-orchestration-v1/digest-vectors.v1.json
caa9912e5dba364f72c8b39663b87be5d5ac359ac1ca5d0e46647e9c6cbb3de5  contracts/fixtures/agent-orchestration-v1/mission-transition-vectors.v1.json
b900abfcea9740ee1a6bf6aad876bc8f3023e21a89c18d181025eaac54abb6f5  contracts/fixtures/agent-orchestration-v1/quorum-vectors.v1.json
28862f8b808e554d2d18ba1cf250a98e871480b9ee210eb4f23b65f53012703b  contracts/fixtures/agent-orchestration-v1/signature-vectors.v1.json
7c5f8d3357a320c50b6e9b9ba34cb4bcc796a0a47cdaf1fee27599f2d3342629  contracts/openapi/missions.v2.yaml
1a282addcd6dd7d4fa63fadf405844ba8937f89f05ce8bf7ebf33d74c8a3f25d  contracts/schemas/agent-contributor-lineage.v1.schema.json
7f380b3747687ea4d047ad816336b90eed437a5ded210eb7f47c4b7de690dfba  contracts/schemas/agent-review-quorum-view.v1.schema.json
c47ab6243f50570c850da2005d59210b62500b7038935a38b020cc02f184c8bc  contracts/schemas/agent-review-quorum.v1.schema.json
04dec8b0397461950da23f0df299843f14a8c6bf26ab5fb2d11fe04bd97a5a96  contracts/schemas/agent-review-session-attestation.v1.schema.json
631fc1fa3b412223354a0dd28187f64bd86d12c1380e7c4a38015ee57c1b320c  contracts/schemas/agent-review.v1.schema.json
466696d00232f6899fb11ca06c96dbbb02a6a912b5ba0b1dbbd2129fbdadd77c  contracts/schemas/execution-authorization.v1.schema.json
e156817a7f6b41eb7a94bde1b4dac67964ae6713971ec118eabcdc307b4fa776  contracts/schemas/execution-plan-body.v1.schema.json
ce65dae99a54ed6136c45409ca89c5903905c8e8a0ca66a639b16cb49115c6aa  contracts/schemas/harness-attestation.v1.schema.json
04e0e29d593b329fd8b7be1071086ff59dea921f3e9717ee08c1ab23af386cb8  contracts/schemas/harness-profile.v1.schema.json
303a4a46282d5980ed198eadabe8e9d5f1a78827bcf2f9cc54bf256ec4c78f55  contracts/schemas/mission-record.v2.schema.json
fce3f868256cde03a80219e9c635d0998655851badc821409a7b2faa82176853  contracts/schemas/orchestrator-control.v1.schema.json
c36425b727075308382e0aebfdf6a71d7ac4284897cd7767b71263b33dd01fe6  contracts/schemas/orchestrator-event.v2.schema.json
```

Hash-list SHA-256: `161b31c21fa6eb1b3302e3e8b42d15948a033869d682e159712cfdda284a9880`.
