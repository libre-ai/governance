# biscuit-auth 6.0.0 migration — round 1 verdicts (authz-biscuit#12 at 81ce4b5)

Two independent, adversarial, read-only K4 passes on
[libre-ai/authz-biscuit#12](https://github.com/libre-ai/authz-biscuit/pull/12)
(vendored 6.0.0 + upstream #306, biscuit-parser 0.2.0, term guard, injectivity
re-proof), run on 2026-09-08 from the orchestrator session, each in its own
detached worktree of the pull-request head. Format: the WP-G3-H01 verdict
files.

| Role | Verdict | Blocking | Major | Minor |
| --- | --- | --- | --- | --- |
| security | accept | 0 | 3 | 5 |
| architecture | reject | 1 | 4 | 4 |

No double accept: the pull request is not mergeable at this head. The
blocking finding (architecture) is that the re-done injectivity evidence
credits tests that do not reach the branches it cites — 12 of 18 mutants of
the term guard survive the 28 green tests. Both passes independently found
that the security argument over-claims what the code enforces (block-level
scopes are never printed, hence never checked; `&&!`/`||!`, `try_or` and
out-of-range dates pass the guard without a faithful reparse).

Round 2 entry requirements are the union of both `major` lists plus the
blocking finding; the tension between ecosystem-engine#13 (single copy
consumed through an organisation git-dep) and ADR-0020 §2.5 (the patch
follows each final workspace) is an owner decision, not a remediation.
