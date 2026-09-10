# Release Gates and Brand Clearance Design

## Scope

This increment closes the five hardening actions accepted by the owner on 2026-09-10:

1. administrators cannot bypass the protected `main` branches of `governance`, `ui`, or `website`;
2. `ui` and `website` run the same REUSE and declared-licence checks in their local aggregate gate
   as in their required licensing workflow;
3. the `ui` publish gate inspects Bun's real npm pack list and refuses a package that omits the
   mixed-licensing documents or the exported brand mark;
4. the Workshop Gantry is qualified at 16 px, 24 px, monochrome, and forced colors;
5. official-register searches and the named-reference review are recorded against the immutable
   candidate SHA-256.

## Boundaries

- Reuse the SHA-pinned governance tooling already installed in each consumer. Do not fork REUSE or
  the declared-licence algorithm.
- Install the pinned REUSE requirements in the Bun quality jobs before `bun run check`; a local
  machine without `reuse` fails closed with the same command.
- Inspect `bun pm pack --dry-run --ignore-scripts`, not `package.json.files` alone. The pack-list
  parser accepts Bun's human output only when exactly one final `Total files` record matches the
  parsed `packed` records, and rejects empty, truncated, duplicated-summary, or inconsistent output.
- Keep trademark conclusions factual. A search result can be recorded as completed, blocked, or
  requiring specialist review; only the owner can set the exact acceptance controls.
- Do not publish the npm package, deploy the website, file a trademark, or change doctrine.

## Verification

- Unit tests prove that removing any required packed file turns the pack gate red.
- `bun run check` in `ui` and `website` executes REUSE and declared-licence comparison.
- The UI browser suite proves the mark remains visible and geometrically distinct at 16 px and
  24 px, including the forced-colors project.
- The three final pull-request and post-merge SHA check sets are green.
- GitHub reports `enforce_admins.enabled=true` and `allow_force_pushes.enabled=false` on all three
  protected `main` branches.
