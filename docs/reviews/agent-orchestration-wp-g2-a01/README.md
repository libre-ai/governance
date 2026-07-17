# WP-G2-A01 — definition review dossier

Status: `definition-reviewed / schedulable / result-conformance pending`.

Immutable definition commit: `632950fe80eb97530d3e4ad775776a65c24ca110`.

| Role | Verdict | Record |
| --- | --- | --- |
| Architecture | `approve` | [`ARCHITECTURE-VERDICT.md`](ARCHITECTURE-VERDICT.md) |
| Security | `approve-with-minor-reservations` | [`SECURITY-VERDICT.md`](SECURITY-VERDICT.md) |
| France/EU Privacy | `approve-with-minor-reservations` | [`PRIVACY-VERDICT.md`](PRIVACY-VERDICT.md) |

All roles bind the same work-package plan SHA-256
`d043fe2f955f0740d381e8e70b8dda5eb2b57b3908c9a96fc24fbf8a0a38c3ea` and canonical
`WP-G2-A01` object SHA-256
`a73754fedc9ccc3bd74e71c66359058d24deae4f7f8d60fafe52ccfd6c5add6d`.

The definition may be scheduled only within:

- `crates/agent-orchestrator/**`;
- `verification/agent-orchestrator/**`.

The implementation result must receive fresh role-separated review plus
`simulation-only-conformance-acceptance`. No harness, Pi worker, process/filesystem/network/provider/
secret/persistence capability, app integration or real mission is authorized.
