# Authorized execution graph proposal — Privacy and sovereignty review

- **reviewPassId:** `authorized-graph-privacy-51b50da-20260909`
- **Role:** Privacy and sovereignty
- **Reviewed commit:** `51b50da0adca2ab2631f58b804a41f7f20cd987e`
- **Comparison base:** `440b4fcdf91636708e064fd825d0f254f59f7ac2`
- **ADR SHA-256:** `6273b1daca363625bced941a91ac7fe44d0c9bdf2be3b9f659c3dbf6cbc51fe1`
- **Mode:** specialized role, dedicated review-only pass

## Assessment

Decision context and effect observations are bounded, classified and minimized;
free comments confer no capability. Stable execution identities stay in
organization-private business records and outside operational logs and OTEL.
Proof/Artifact owns need-to-know access, retention, deletion and
non-resurrection. Worker checkpoints remain opaque and non-canonical. Managed
framework services, external checkpointing and new network/provider surfaces
remain excluded.

The organization vocabulary does not rename existing locked wire fields. Exact
field names and any explicit translation belong to the contract increment;
implicit aliases remain forbidden.

## Reproduced evidence

- The worktree was clean and the diff added one 304-line doctrine file.
- `git diff --check`, specification and licensing gates pass.
- No manifest, lockfile, Specification Lock or invariant register changed.

## Findings

- Blocking: none.
- Major: none.
- Minor: none.

## Residual risks

Future contracts must define exact minimization bounds, proof-audience access,
post-deletion reference behavior and a genuinely non-reversible ephemeral
correlation mechanism.

## Verdict

`approve`
