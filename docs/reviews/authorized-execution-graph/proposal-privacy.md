# Authorized execution graph proposal — Final privacy and sovereignty review

- **reviewPassId:** `authorized-graph-privacy-1ca32a3-20260909`
- **Role:** Privacy and sovereignty
- **Reviewed commit:** `1ca32a3189bf4eafdb2374ddf03e96664191b9c8`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **ADR SHA-256:** `238dc35d6ff2b861f82288009da80c71274392049ca0c7451eed8f0854438d60`
- **Mode:** specialized role, dedicated review-only pass

## Assessment

Binding the effect request digest, destination and fencing observation tightens
authorization without opening a data surface. Harness owns bounded observations
and Orchestrator alone owns canonical transitions. Unknown or divergent external
status blocks rather than being reflected or interpreted.

Stable execution identities stay in organization-private business records and
outside operational logs and OTEL. Decision/effect data remains minimized,
classified and subject to need-to-know access, retention, deletion and
non-resurrection. Worker checkpoints and managed services remain non-canonical
and excluded.

## Reproduced evidence

- Worktree clean before and after the review.
- `git diff --check`, Specification Lock and licensing gates pass.
- No manifest, lockfile, contract, invariant register or runtime changed.
- Historical review records identify their exact older subject.

## Findings

- Blocking: none.
- Major: none.
- Minor: none.

## Residual risks

Future contracts must minimize the destination and fencing representation,
bound access and expiry, and keep request digests out of telemetry because they
remain correlatable.

## Verdict

`approve`
