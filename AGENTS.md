# Governance Canonical Agent Rules

## Authority

This repository is the **governance authority** of the Libre AI constellation
(ADR-0020, general activation 2026-07-28) — the transverse layer's registry
root: doctrine, invariants, ADRs, the LEXICON, the ecosystem index, the
current-capability repository contract and portfolio verifier, ecosystem tooling, evidence, and
the fleet gates. The `contracts` repository is the other transverse authority
(https://raw.githubusercontent.com/libre-ai/contracts/main/AGENTS.md) and
owns the canonical contract authorities. Every
product and satellite repository is responsible for its own perimeter; its public facts derive from the current-capability contract (ADR-0041/I-32);
private engineering evidence may remain in its project card.

Before acting, read `GOALS.md`, `STATUS.md`, `docs/decisions/INVARIANTS.md`
and `docs/decisions/DECISION-REGISTER.md`. `INVARIANTS.md` is exhaustive by
construction: doctrine absent from it does not exist, whatever another
document asserts. `ecosystem/FORGOTTEN.yaml` prohibits content resurrection and live citation.
ADR-0041/I-32 bounds its clean-history exception to the exact owner-confirmed
public transaction. Private-first ADR-0038, private research ADR-0039/I-31
and non-executing persistence ADR-0040/D45 remain unchanged.

## Stack

- Single Bun workspace, strict TypeScript, no application code: this
  repository holds doctrine, schemas, gates and evidence tooling only.
- No Rust workspace. No JavaScript source.

## Boundaries

- Contract authorities are canonical in the `contracts` repository — never
  here.
- Product code, product specifications (`docs/apps/*`), qualification
  harnesses and brick tooling live in their product/satellite repositories.
- Proof must not depend on private implementation details.

## Naming

- Retired tooling names are never reused (I-04); `bun run check:names`
  enforces the list. Repository names are never invented:
  `docs/decisions/LEXICON.md` owns the canonical map. Retired brands are
  denied by the `doctrine-governance` workflow, which owns the exact list —
  do not copy that list into another document.

## Security

- Validate every external input. Never log secrets, tokens or PII. Secrets
  are runtime-only.
- No US hyperscaler dependency for application runtime or data. GitHub is
  the accepted code collaboration surface.

## Quality gates

Run `bun run check` (Bun floor, source policy, retired names, forgetting
register, project cards, knowledge objects, objectives, specification locks,
licences, dead code, lint, typecheck, tests). Never hide a red test.

## Agents

- Read actual state before editing.
- Stage files before running tree-walking gates (`git ls-files`-based
  scanners do not see untracked files).
- Never review mutable or uncommitted output in the authoring pass.
- Doctrine changes (ADRs, invariants, LEXICON) require role-separated
  technical review; the human owner retains the explicit control milestone —
  a doctrine merge is a signature.
- Owner-facing decision points follow ADR-0022 (I-24): restitute the
  decision context inline (short excerpt or a 2–4-line decision summary plus
  its `path:line` source — never a bare pointer), present genuine choices as
  2–4 mutually exclusive options with consequences through the interactive
  question mechanism, and decide trivial or inferable choices alone, flagged
  in one line.
- Security > quality > performance > completeness.
