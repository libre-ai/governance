# Read-only consumer and shipped-entrypoint observations

C2 reads manifests from explicitly selected immutable Git commits. It does not
freeze repositories, execute applications, install packages, fetch dependencies,
run Cargo metadata or change source worktrees. Current concurrent source sessions
remain outside a completed freeze. A committed observation can be useful before
that freeze, but it is not composition admission.

The private input is JSON:

```json
{
  "schemaVersion": "consumer-input.v1",
  "sources": [
    { "source": "missions", "root": "/private/source-clone", "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }
  ]
}
```

Use real observed commit IDs; the example is synthetic. Source names must belong
to the public 36-source inventory and each clone's origin must match the named
source. Selected subsets are allowed and their size is explicit in the report.
No clone discovery or automatic enrollment occurs.

```sh
bun tools/migration/dependency-graph.ts --sources /private/consumer-input.json
bun test tools/migration/dependency-graph.test.ts tools/migration/entry-points.test.ts
```

The CLI reads trees and manifest blobs using `git ls-tree` and `git show` against
the selected OIDs, so dirty replacement files never enter its input. Subprocesses
have 30-second deadlines; diagnostic errors contain only fixed codes. Symlinks,
submodules, escaping paths and inaccessible commits block collection. Reports
contain source-relative entrypoint/manifest paths, public package names and OIDs,
never host paths, dependency URLs, tokens, shell commands or raw Git errors.
Dependency references are represented by SHA-256. Keep run artifacts private.

## What is resolved

- `package.json`: normal, optional, peer and development dependencies; package
  names; declared workspaces; exports, main/module/types, binaries and simple
  application start/serve/dev scripts. Commands are parsed, never executed.
- `bun.lock`: native JSONC parsing, including trailing commas, resolved package
  versions and pinned Git references. Missing/ambiguous lock records stay unknown.
- `Cargo.toml`: native TOML parsing, ordinary/build/development dependencies,
  workspace inheritance, package aliases, local paths and target-specific edges.
- `Cargo.lock`: registry source/version matching and immutable Git revision
  matching. Exact, caret and tilde three-component versions are supported;
  unrecognized version requirements remain unresolved.
- Entry points: package exports and conditional export alternatives, binaries,
  Cargo conventional and explicitly declared libraries/binaries, and the canonical
  contract repository's schema roots. Tests and test fixtures never establish a
  shipped entry point.

For scripts requiring a build pipeline or other ambiguous entrypoints, a reviewed
source may declare `migration/shipped-entry-points.v1.json`:

```json
{
  "schemaVersion": "shipped-entry-points.v1",
  "entries": [
    { "path": "src/server.ts", "kind": "application", "manifest": "package.json" }
  ]
}
```

Those paths must exist in the same immutable tree, remain inside the source root,
and belong to an existing package/Cargo manifest. This declaration records an
entrypoint candidate; it is not evidence of actual publication or reachability.
This tooling never creates declarations in source repositories.

## What remains unproved

The graph preserves every declared edge, with development-only edges explicitly
marked `excluded-dev`. Other edges are `declared-production`; target-specific and
optional edges retain a conditional flag. Their resolution describes the manifest
and lock relationship only. It never proves that a dependency is called by shipped
code, that a registry is publicly reachable, or that a release passed its gates.
Consequently `releasedArtifact` remains false and `verifiedConsumerCount` is null.

`declaredConsumerCounts` counts distinct source repositories having a declared
entrypoint and a non-development dependency on another source. These are candidate
counts, not independent consumer proofs and not the final consolidated-target
count. Every production edge still carries `reachability-unproved` until C3's
path analysis and executable evidence resolve it. Missing entrypoints, unmatched
workspace members, ambiguous providers, unsupported references and absent lock
matches are explicit unresolved observations. None implies dead code.

All arrays and report digests are deterministic. Exit 1 means unresolved facts
or an invalid/inaccessible input; exit 0 means only that the selected observation
has no unresolved parser facts. The `qualification: provisional` field remains
mandatory either way. A zero count never authorizes deletion, integration or
retention. The one/multiple/zero-consumer boundary and four-part security exception
are evaluated only after freeze, reachability and actual consumption proofs.

The synthetic Git CLI tests prove exact-commit reads, unchanged refs, deterministic output,
origin mismatch refusal and exclusion of dirty on-disk replacements.

The immutable collector refuses replacement refs and disables Git replacement
objects. It reuses the source observation command boundary (30-second irreversible
deadline, 16 MiB output cap, no late signal after leader exit), preserving trailing
manifest whitespace in provenance hashes. No repository-local filesystem monitor
is executed. A synthetic replaced-commit test proves refusal without modifying refs.

Git lazy fetch is disabled. Invalid UTF-8 output refuses observation instead of
substituting replacement characters; raw mode preserves a UTF-8 byte order mark.
