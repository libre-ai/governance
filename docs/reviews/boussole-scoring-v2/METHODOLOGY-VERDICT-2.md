# Boussole scoring v2 — methodology promotion verdict 2

- **Role:** methodology
- **Review mode:** fresh isolated review-only pass under `docs/reviews/AGENT-REVIEW-PROTOCOL.md`
- **Reviewed commit:** `5bcce217271a423e9596f2fd941abaafdcf6ac20`
- **Decision:** **APPROVE** the methodology dimension of candidate promotion
- **Public scoring:** **NO-GO** until every other role verdict and the human control/release milestones pass

This verdict supersedes `METHODOLOGY-VERDICT.md` only for the new authority hash below. The rejected verdict for `de9392e` remains an immutable audit record.

## Reviewed authorities and hashes

| Authority | SHA-256 |
| --- | --- |
| `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` | `c6742b5a52691942fdea921712b3a0984efc8a3e1f33c8456d182de50270b232` |
| `contracts/schemas/boussole-method.v2.schema.json` | `7539d5f9ca19065a1887a6141656561e72a3b2656e8128687035943cd332a86c` |
| `contracts/schemas/public-vote-dataset.v2.schema.json` | `83f5ce0e3737efd5cdc01f94bc78862888cd462bcd0b33c8eea2965288e631cb` |
| `contracts/schemas/boussole-response-set.v2.schema.json` | `47c94b59a49da8f4a255c5024a33288670ae1a5e70bc30a26511b50f9ad3298d` |
| `contracts/schemas/local-comparison.v2.schema.json` | `c759c3b8776bcb00a928c80feaf81afabc35e3bc0fb01812c12430da1fecf959` |
| `contracts/wit/boussole-scoring-v2/SEMANTICS.md` | `2c9c309788f9696ad0ff2325118d11e7fff07337c67fba09ac10f703a3e0794e` |
| `contracts/wit/boussole-scoring-v2/world.wit` | `c7128cd25042bd683bd54c1542ebd4cab00066bd9da2303c70bf655ae6a7e38f` |

## Independent evidence

A separate Python 3 implementation parsed the vector corpus, applied all bounded `replace` patches, recomputed every method/dataset/response-set JCS-domain SHA-256 digest, and evaluated all arithmetic with `fractions.Fraction` plus `decimal.ROUND_HALF_EVEN`. It did not import or invoke the TypeScript evaluator.

All ten cases matched exactly:

| Case | Independent result |
| --- | --- |
| `excluded-abstentions-positive-agreement` | score `0.333333`, denominator `15`, omitted `3` |
| `reject-duplicate-reviewer` | `approval-invalid` |
| `reject-zero-denominator` | `denominator-zero` |
| `neutral-scale-five` | score `0.250000`, denominator `20`, omitted `2` |
| `weighted-with-skipped-and-missing` | score `-0.500000`, denominator `40`, omitted `22` |
| `half-even-boundaries` | score `0.000001`; contributions `0` and `0.000002` |
| `reject-unknown-statement` | `response-invalid` |
| `zero-answer-is-not-skip` | score/contribution `0`, denominator `15`, omitted `3` |
| `intermediate-scale-normalization` | response `2` on `M=5`; score/contribution `0.133333` |
| `negative-half-even-boundaries` | score `-0.000001`; contributions `0` and `-0.000002` |

The repository checker independently reported ten executable cases. Rust/Bun CI passed on the remediation PR.

## Previous finding closure

- **METH-BLK-001 closed:** `zero-answer-is-not-skip` proves that a zero answer retains considered votes and is not treated as skip/missing.
- **METH-BLK-002 closed:** `intermediate-scale-normalization` proves the exact `r/M` factor for a non-maximal scale member.
- **METH-NB-001 closed:** `negative-half-even-boundaries` proves signed tie behavior and negative-zero normalization.

## Findings

- **Blocking:** none.
- **Non-blocking:** none within the pure scoring methodology contract.

## Residual risks and limits of approval

- Dataset scope, source selection, wording symmetry, representativeness and licence remain separate editorial/methodology release evidence for each real dataset hash.
- This role does not approve architecture, security, privacy, accessibility, implementation conformance or release enablement.
- Synthetic fixture `reviewerId` values are test material, not real human approvals.
- Any change to a reviewed authority or vector hash invalidates this verdict.

## Explicit verdict

**APPROVE** the methodology role for the exact authorities and hashes above. Keep Boussole v2 `candidate` and public scoring disabled until the remaining role-specific verdicts and the human control milestone are complete.
