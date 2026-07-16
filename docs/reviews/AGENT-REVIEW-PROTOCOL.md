# Independent agent review protocol — solo maintainer

ADR-0003 contract candidates are reviewed by independent agents, not by a second human maintainer. The repository owner decides whether to merge, but that merge decision is not a technical review and cannot replace the evidence below.

## Independence rule

A review is valid only when all of these conditions hold:

- the reviewer is an agent distinct from the authoring agent;
- `reviewerAgentId != authorAgentId` and `reviewerSessionId != authorSessionId`;
- the reviewer receives a fresh review prompt and an immutable commit, without the authoring conversation or hidden mutable worktree;
- the reviewer did not author the candidate, its normative vectors or the implementation under review;
- CI, generators and the authoring agent cannot issue the verdict.

An agent must never approve its own proposal. A failed independence check keeps the candidate pending.

## Attributable review record

Each required role records, in its dossier or a linked immutable artifact:

- `authorAgentId` and `authorSessionId`;
- `reviewerAgentId`, `reviewerSessionId`, provider and model/version;
- reviewed Git commit SHA and relevant contract/vector hashes;
- review role (`architecture`, `security`, `cryptography`, `methodology` or `privacy`);
- commands, independent reproduction evidence and findings by severity;
- exactly one verdict: `approve`, `approve-with-minor-reservations` or `reject`.

Each catalog role requires its own record and fresh review session; one generic verdict cannot satisfy several roles. Open blocking/major findings, a conditional verdict, missing evidence or a normative change after review invalidate approval. A new immutable commit requires every affected role to review again.

## Candidate integration

A candidate branch may be merged after all qualified repository gates pass and an independent agent performs a general review-only pass over the exact commit. That record covers security, quality, performance, completeness and sovereignty/privacy and explicitly states that it is not a role-specific promotion verdict. Candidate integration leaves every authority in `pending-independent-agent-review`. The repository owner's merge decision is not a technical review.

## Promotion

Promotion from `candidate` to `locked` requires all catalog-listed role-specific agent verdicts and green quality gates. A separate integrator agent may prepare the promotion change after verifying the records; neither the authoring agent nor any reviewer may approve its own output. The solo repository owner remains the merge authority.

This protocol governs engineering review only. It does not replace product-level human decisions explicitly required by Policy, Missions, Sessions, Practices or Boussole public-release contracts.
