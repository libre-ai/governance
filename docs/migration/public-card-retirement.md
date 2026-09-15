# Public project-card authority retirement (A4)

Public repository and organization presentation now derives exclusively from the
validated portfolio contract and its independently verified publication receipt.
Engineering cards and their schemas remain private evidence. `check:cards` checks
schema and evidence paths without emitting progress claims. Card progress remains
available only to engineering consumers; the public card renderer and card-to-README
comparison API have been removed.

## Facts and authority

`public-card-fact-map.json` maps every former fleet/card/org fact and each top-level
knowledge-object field to a current contract field or an explicit withdrawal.
A replacement is a semantic destination, never an automatic conversion of a card
into evidence. A new outcome, date, identity or limitation must independently pass
the portfolio contract and receipt checks. No old percentage, lifecycle, layer,
phase, confidence or exposure label becomes an admission claim.

The shared presentation helper verifies each selected contract again through
`renderReadmeFacts`. Its inputs come from the catalog, separately supplied trust
policy and receipt bundle. Committed projections are compared with this fresh
verified computation, never trusted merely because a JSON file exists.

`ecosystem/render-fleet-status.ts` is now a read-only compatibility command which
prints the new `readme-facts.v1` shape to stdout; it never regenerates the old JSON.
`ecosystem/check-fleet-presentation.ts` compares the committed portfolio README
facts against a freshly verified selection. Empty admitted facts are explicitly
reported as withheld. Organization rendering and healing require at least one
admitted repository; absent proof cannot produce an empty replacement profile.
Existing section delimiters remain an editing protocol only, in a neutral module.

```sh
bun ecosystem/check-fleet-presentation.ts
bun tools/presentation/render-org-readme.ts --catalog reviewed-catalog.json --policy approved-policy.json --receipts approved-receipts.json
bun tools/presentation/check-org-readme-drift.ts --catalog reviewed-catalog.json --policy approved-policy.json --receipts approved-receipts.json
```

The operator must provide policy independently of candidate data. No fixture key
or fabricated proof is installed in workflows. The organization workflow without
approved inputs is therefore blocked explicitly; its heal path exits before reads,
artifacts or remote writes. Supplying actual independently approved publication
inputs and validating the live target remains a cutover obligation. This change
runs no remote heal and grants no publication authorization.

## Consumer inventory and deferred deletion

Local consumers inventoried before retirement:

- `project-cards.ts`: private schema/evidence/progress functions retained;
  public status render/check functions removed.
- `validate-cards.ts`: private validation retained without public progress output.
- Fleet renderer/checker: rewired to portfolio selection and readme facts.
- Organization renderer, drift checker and healer: rewired to the same verified
  selection and neutral delimiters; old migration-index reads removed.
- Inventory and organization workflows: verifier dependencies installed from lock;
  no legacy card-derived rendering remains in these jobs.
- Tests: private validation coverage retained, obsolete public fixtures replaced
  by signed synthetic positive and stale-evidence negative cases. Import checks
  prohibit reintroducing the former public authority.

The reconciled Website source still consumes the historical fleet JSON in
`src/preview.ts` and `src/publication/domain.ts`, with corresponding build and
publication tests. This is a retained source awaiting Website S4, not authority
for the new public target. The old `ecosystem/projections/fleet-status.v1.json`
and `ecosystem/projections/public.v1.json` remain byte-identical in this local
migration source to preserve that source evidence. **They must not be included in
any clean public target.** Their deletion is deferred until the Website S4 consumer
replacement and cross-repository tests prove no dependency. Knowledge projection
metadata still refers to its historical external generator; no local TypeScript
public renderer consumes it. This inventory is local evidence, not a claim that
all remote repositories have been cut over.

The engineering topology index and repository inventory remain for private fleet
controls; they no longer supply these public renderers. No private source catalog
was deleted, no deployment performed, and no real product receipt was inferred
from synthetic tests.
