# biscuit-auth 6.0.0 migration — round 3 verdicts (authz-biscuit#12 at f934164)

Third pair of independent, adversarial, read-only K4 passes, on the round-3
head (five commits over d65e877: the P-256 refusal in `begin_rotation` reached
by its test, the holder-block guard "at most one operation per expression,
never `Parens`" read on the decoded structure, SECURITY.md without its
contradiction, the double-load cost measured as a median of three runs, a
round-3 addendum to the immutable record) and on the companion heads
ecosystem-engine#13 `806ab09` (orphan-rev gate on a real TOML parser, 20
tests) and governance#91 `83a84cf` (I-05 widened, I-28, D37, ADR-0031).

| Role | Verdict | Blocking | Major | Minor | Round-2 findings |
| --- | --- | --- | --- | --- | --- |
| security | accept | 0 | 0 | 2 | precedence major closed; P-256 third-party and provenance-by-committed-diff open by declaration |
| architecture | accept | 0 | 0 | 4 | blocking M28 closed (mutant replayed red); both majors closed by proof |

**Double accept.** Merge sequence: authz-biscuit#12 (owner signature),
then re-pin the `rev` of ecosystem-engine#13 on the squash-merge commit of
#12 (`cargo update -p biscuit-auth`, gate turns green), then #13, then #91.
Residual minors are recorded in both verdict files and in the round-3
addendum; the owner-side interpretation on record: the guard counts unary
operations too (stricter than "one binary operation"), judged safer by the
security role.
