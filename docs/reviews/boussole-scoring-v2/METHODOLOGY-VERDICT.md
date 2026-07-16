# Boussole scoring v2 — methodology promotion verdict

- **Role:** methodology
- **Review mode:** isolated review-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Reviewed commit:** `de9392e428c0619608f295872be97db54b905689`
- **Decision:** **REJECT** promotion from `candidate` to `locked`
- **Scope:** scoring formula, response scale, abstention/absence treatment, weighting, denominator, omission accounting and six-decimal half-even rounding

## Reviewed authorities and hashes

| Authority | SHA-256 |
| --- | --- |
| `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` | `f96a39c5e6884a75e2eced385382bc148392d8fc97ea4fe3251c55f2a0a08470` |
| `contracts/schemas/boussole-method.v2.schema.json` | `7539d5f9ca19065a1887a6141656561e72a3b2656e8128687035943cd332a86c` |
| `contracts/schemas/public-vote-dataset.v2.schema.json` | `83f5ce0e3737efd5cdc01f94bc78862888cd462bcd0b33c8eea2965288e631cb` |
| `contracts/schemas/boussole-response-set.v2.schema.json` | `47c94b59a49da8f4a255c5024a33288670ae1a5e70bc30a26511b50f9ad3298d` |
| `contracts/schemas/local-comparison.v2.schema.json` | `c759c3b8776bcb00a928c80feaf81afabc35e3bc0fb01812c12430da1fecf959` |
| `contracts/wit/boussole-scoring-v2/SEMANTICS.md` | `2c9c309788f9696ad0ff2325118d11e7fff07337c67fba09ac10f703a3e0794e` |
| `contracts/wit/boussole-scoring-v2/world.wit` | `c7128cd25042bd683bd54c1542ebd4cab00066bd9da2303c70bf655ae6a7e38f` |

## Independent evidence

A separate Python 3 reference pass parsed the public vector corpus, applied every bounded JSON Pointer replacement, recomputed method/dataset/response-set JCS-domain SHA-256 digests, and evaluated the formula with `fractions.Fraction` plus `decimal.ROUND_HALF_EVEN`. It did not import or invoke the TypeScript evaluator.

Recomputed results:

| Case | Independent result |
| --- | --- |
| `excluded-abstentions-positive-agreement` | score `0.333333`, denominator `15`, omitted `3` |
| `reject-duplicate-reviewer` | `approval-invalid` |
| `reject-zero-denominator` | `denominator-zero` |
| `neutral-scale-five` | score `0.250000`, denominator `20`, omitted `2` |
| `weighted-with-skipped-and-missing` | score `-0.500000`, denominator `40`, omitted `22` |
| `half-even-boundaries` | score `0.000001`, denominator `8000000`, omitted `0`; contributions `0` and `0.000002` |
| `reject-unknown-statement` | `response-invalid` |

The repository checker also passed and reported seven executable cases. Existing expected bytes and digests are therefore internally reproducible.

## Blocking findings

### METH-BLK-001 — zero answer is not distinguished from skip/missing

The normative scale is symmetric and may contain `0`; an answer is an exact scale member while a skip carries no value. A zero answer must therefore contribute `0` **while retaining the statement's considered votes in the denominator**. No vector sends `kind=answer, value=0`. An implementation that incorrectly treats zero as skip could pass the complete corpus and change both denominator and omission accounting.

Required remediation: add an executable success vector with a zero answer and non-zero public denominator, asserting contribution `0`, retained `votesConsidered`, correct `votesOmitted`, denominator and global score.

### METH-BLK-002 — non-unit normalization is tested only at the maximum

`neutral-scale-five` proves that `M=5` is accepted, but uses only `r=5`, for which `r/M=1`. No vector uses an intermediate non-zero scale member. An implementation that maps every positive response to `+1` and every negative response to `-1` could pass the corpus while violating `u_i = r_i / M`.

Required remediation: add a symmetric scale containing an intermediate value, for example `[-5,-2,0,2,5]`, and assert at least one positive or negative intermediate response with exact contribution and weighted score.

## Non-blocking finding

### METH-NB-001 — negative half-even ties are not explicit

The corpus proves positive ties-to-even in both down/up directions, but not negative ties. Exact signed rational arithmetic makes the intended symmetry clear, yet an implementation-specific negative rounding defect would not be caught. Add negative `-0.0000005` and `-0.0000015` boundaries before implementation qualification.

## Residual risks

- Dataset scope, statement selection, wording symmetry and source representativeness remain human methodology/editorial review responsibilities outside the pure arithmetic boundary.
- This verdict does not cover security, privacy, architecture, accessibility, release enablement or any real public dataset.
- Public scoring remains `NO-GO`; no candidate status may change on this evidence.

## Re-review condition

A fresh methodology pass must review the exact remediated commit and new vector hash, independently recompute every added expectation, and issue a new explicit verdict. This rejected verdict remains an immutable audit record and must not be edited into an approval.
