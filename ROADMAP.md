# Roadmap

Progress is tracked by gates in [`GOALS.md`](GOALS.md), not by dates or issue count.

G0, G1 and G2 are closed. The Big Bang reconstruction (register D01) stays in force, but the
seven-step sequencing this file used to carry is replaced by the milestone γ roadmap below: ADR-0020
supersedes G3 to G5 and the wave ordering of `docs/transformation/EXECUTION-SEQUENCING.md`.

| Phase                          | Objective                                                                                                  | State                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| γ 3.0 — Housekeeping           | leftovers settled, hub reference chain replayed green one last time                                        | **closed** — 10/10 steps, digest `f45dfad0…` byte-identical to the G2 closure digest |
| γ 3.1 — Doctrinal act          | ADR-0020, invariants, decision register, LEXICON, stale document authorities                               | **in progress** — merge is the owner signature (hard stop)                           |
| γ 3.2 — Card system            | `project.v1` schema, validator, aggregator, generators; dependency test bench executed                     | not started                                                                          |
| γ 3.3 — Authorities            | create `governance` and `contracts`, migrate with preserved history, institute the migration index         | not started — creating the repository batch is an owner checkpoint                   |
| γ 3.4 — Shared-code satellites | nineteen repositories in dependency-graph order, dependencies pinned by SHA, vendored-contract drift gates | not started — a path leaves the hub only after its destination is green              |
| γ 3.5 — Products               | eight product repositories plus the layer-2 `missions` application, grafted onto their frozen history      | not started — the first description or visibility switch is an owner checkpoint      |
| γ 3.6 — Presentation           | cards, generated READMEs, org README, home page, dated comparisons, GitHub descriptions                    | not started                                                                          |
| γ 3.7 — Coherence              | cross-repository coherence gate run from `governance`, final report                                        | not started                                                                          |
| γ 3.8 — Hub archiving          | hub emptied, every path traced to a destination, banner plus migration index, archive                      | not started — nominative owner act, final hard stop of the milestone                 |

After milestone γ there is no central roadmap. Each repository carries its own in its
`project.v1.yaml` card, aggregated and verified by `governance` (I-08 as amended by ADR-0020). The
engineering work milestone γ does not itself deliver — the Polaris method work packages, the product
engines that are not implemented — becomes the roadmap of the repository that owns it.
