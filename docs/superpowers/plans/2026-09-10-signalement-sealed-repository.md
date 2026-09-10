# Signalement sealed-repository governance plan

> Status: execution plan for the owner-signed governance change. It does not authorize remote creation or public exposure.

**Goal:** Enroll Libre AI Signalement while making the first-publication boundary fail-closed, reviewable, and free of self-attestation.

**Architecture:** Governance owns one fleet-wide first-publication invariant and ADR. A candidate product produces a canonical manifest locally, pushes only attested object IDs to an empty private repository, proves the private remote from a complete clean-room fetch, then records the attestation in Governance before a separate owner action makes the repository public.

**Technology:** Git object database and full ref names, SHA-256 canonical manifests, repository-local Bun gates, GitHub private repository and private vulnerability reporting.

## Task 1: Close the naming/security ambiguity

- Amend the Signalement lexicon and collision record to exclude vulnerability reports.
- Route suspected vulnerabilities, exposed secrets, and exploit details to the fleet `SECURITY.md` private channel.
- Recompute and bind the collision-record digest.

## Task 2: Establish one normative publication authority

- Add ADR-0038 with the private-first state machine, exact-ref/OID protocol, canonical object manifest, fail-closed scan surfaces, and rollback limits.
- Add I-30 to `INVARIANTS.md`, D44 to the decision register, and the authority pointer to `docs/README.md`.
- Reduce LEXICON and review prose to naming-specific consequences plus explicit references to ADR-0038/I-30.

## Task 3: Prove the governance candidate

- Run formatter, source/authority gates, full `bun run check`, and `git diff --check`.
- Amend the single enrollment commit on current `origin/main` using the approved GitHub noreply identity.
- Obtain independent naming, doctrine, and security reviews on the exact immutable commit.

## Task 4: Sequence product publication without recursion

- After the owner merges the enrollment/ADR pull request, pin Signalement to that Governance merge SHA and create its final local commit.
- Generate the complete canonical manifest and local counterproof, then create an empty **private** remote as a distinct owner action.
- Push attested OIDs to exact full refs with absent-remote leases; never push a mutable local ref name.
- Verify the complete private remote from a non-shallow clean-room fetch, including refs, objects, Git metadata, licenses, project card, gates, and negative fixtures.
- Record that attestation under Governance review evidence and obtain its owner merge before the separate public-visibility action.
- Immediately verify anonymous observability and rerun the same proof after exposure; this confirms state but cannot undo disclosure.
