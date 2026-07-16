# G2 agent review protocol — solo maintainer

## Purpose

Libre AI is currently developed by one human maintainer using specialized coding and review agents.
For G2 candidate work, independence is therefore a separation of **review roles and execution
contexts**, not a requirement for multiple human accounts.

This protocol applies only to candidate drafting, harness improvement and bounded G2 implementation.
It does not approve production, infrastructure deployment, public scoring, personal-data processing or
a promotion from `candidate` to `locked`.

## Review levels

### 1. Candidate integration review

A candidate branch may be merged when:

- the exact qualified toolchain and all repository gates pass;
- an agent performs a review-only pass over the exact commit and records security, quality,
  performance, completeness and sovereignty/privacy findings;
- the agent review states that it is not a role-specific promotion verdict;
- the human maintainer explicitly accepts the control milestone and instructs continuation.

This level keeps every catalog entry in `pending-independent-review`. It exists so the harness,
vectors and review process can evolve on `main` without pretending that candidate semantics are
locked.

### 2. Role-specific promotion review

Each role listed in `contracts/catalog.v1.json` must produce a separate verdict. A verdict MAY be
produced by a role-scoped review agent in a fresh session or isolated review-only pass. It MUST:

- identify the role, exact Git commit and every relevant vector/schema SHA-256;
- run or independently recompute the dossier's required evidence;
- list blocking and non-blocking findings and residual risks;
- state explicit `approve` or `reject`;
- avoid modifying the reviewed files during the review pass.

One generic agent verdict cannot satisfy several catalog roles. A later content or hash change makes
the affected verdict stale and requires a new role pass.

### 3. Human control milestone

The solo maintainer reviews the collected role verdicts and explicitly records `accept`, `continue`,
`hold` or `reject`. Human control is required before:

- changing a catalog entry from `candidate` to `locked`;
- starting a product-engine implementation against that authority;
- enabling public scoring or personal/tenant data processing;
- adding network, provider, persistence, secret or approval capabilities;
- production or infrastructure deployment.

The human milestone accepts or rejects evidence; it does not replace missing role verdicts.

## Audit trail

GitHub PR comments/issues MAY hold candidate-integration evidence. Promotion evidence MUST be durable
in the repository review dossier or referenced by immutable URL and content hash. CI, generators and
the implementation agent cannot silently change review state.
