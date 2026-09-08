# biscuit-auth 6.0.0 migration — round 2 verdicts (authz-biscuit#12 at d65e877)

Second pair of independent, adversarial, read-only K4 passes, each replaying
its own round-1 attacks and mutants on the re-delivered head (four commits
over 81ce4b5: guard tests per branch, structural block-scope check, strict
`And`/`Or`/`TryOr` and out-of-range dates rejected, provenance gate in CI,
`Cargo.toml.orig` tracked, Ed25519 enforced at key entry points, new evidence
record `evidence/reviews/81ce4b5/`, ADR-0031, orphan-rev gate in
ecosystem-engine#13).

| Role | Verdict | Blocking | Major | Minor | Round-1 findings |
| --- | --- | --- | --- | --- | --- |
| security | accept | 0 | 1 | 3 | 5 closed, 1 partially, 2 open (declared) |
| architecture | reject | 1 | 2 | 4 | blocking closed (26/26 mutants replayed, same killers) |

Still no double accept. The new blocking finding is narrow: the P-256 refusal
in `begin_rotation` (`keys.rs:79`) is not reached by its test, whose key fails
an earlier precondition (`valid_from < now`), so mutant M28 survives. The
security pass adds one major of its own: the 6.0 printer emits no
parentheses, so any compound expression without explicit ones reprints with a
different precedence and the guard accepts it in holder blocks. Both majors on
the companion deliverables are design-level: the orphan-rev gate of
ecosystem-engine#13 is green on forms it does not parse (`rev = "main"`), and
ADR-0031's "I-05 applies" claims an invariant whose text covers vendored
contracts, not vendored crates — an owner decision between an I-xx entry and
an explicit exception.
