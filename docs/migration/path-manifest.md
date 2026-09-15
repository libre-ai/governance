# Candidate path classification and reachability

C3 audits a private immutable-file inventory against explicit proposed decisions.
It does not discover a new source repository, create real decisions, copy source
bytes, change source trees, contact a registry, or authorize a target publication.
All 36 approved source names and 20 possible target names are taken from the
migration inventory, including the exact `.github` name.

```sh
bun tools/migration/path-manifest.ts \
  --snapshot /private/run/path-snapshot.json \
  --decisions /private/run/path-decisions.json \
  --allow-lists /private/run/new-allow-lists
bun test tools/migration/path-manifest.test.ts tools/migration/reachability.test.ts
```

Both inputs must be regular JSON files of at most 16 MiB. Nonblocking opens refuse
FIFOs without waiting for a writer. The optional allow-list directory must be new,
have an existing parent and lie outside a Git checkout. It is created with mode
0700; target files are created with mode 0600 and never overwrite an existing
file. No source content is copied into it. Omit `--allow-lists` for stdout-only
audit. Stdout is a candidate manifest; stderr contains fixed blocker codes only.
Run artifacts contain source-relative paths and must remain private.

## Snapshot and evidence boundary

The `path-snapshot.v1` input contains `files`, `entryPoints` and `edges`. Every
`ImmutableFile` carries the public source slug, 40-hex source commit, canonical
relative source path, 64-hex SHA-256 of its bytes, role, sensitivity verdict,
license verdict, optional provenance digest, dependency-analysis completeness
and evidence digest, and IDs of required third-party notices. The ID of a file
is SHA-256 over the JSON array `[source, sourceCommit, sourcePath, sourceDigest]`.
Edges and decisions name that ID; changing the file identity invalidates links.

This interface consumes evidence supplied by an independently reviewed inventory
and analysis producer. It does **not** independently read Git objects, recompute
source-byte hashes, execute a license audit or authenticate evidence digests.
The producer must derive the complete inventory from the frozen Git trees, bind
file digests to their bytes, supply all shipped entrypoints and imports, and attach
current C4 verdicts. A digest is a binding reference, not a signature or an
assertion that its referenced proof is valid. The CLI does not promote a caller's
self-declared `complete` or `clear` field into publication authority.

Missing production dependency coverage fails closed. Code, generated code, vendor
code and contracts require complete dependency analysis with an evidence digest.
A source cannot mix revisions or repeat a source path. Every edge endpoint and
every entrypoint must exist in the supplied immutable inventory. The committed
fixtures are synthetic and are never promoted into current source decisions.

## Reachability and classification

Traversal starts independently at each supplied shipped entrypoint and follows
runtime, build and type dependencies. Test edges, test-file imports and example
imports never make production code reachable. Test and example files cannot be
shipped roots. A production dependency on a test-only provider is refused. Keeping
code requires reachability from the exact root named by its retain decision;
that root must belong to the same composed target.

Every inventory file requires exactly one `retain`, `generate` or `delete`
decision. Unknown decisions, absent files, duplicate decisions, escaping paths,
case/normalization collisions and file-versus-directory collisions block the
manifest. Retained node_modules, build/dist/target output, coverage files and
obsolete contributor-lineage schemas are refused. Unknown/present sensitivity,
unknown/obsolete licenses and vendor files without provenance prevent retention.

Tests, API documentation, examples, migrations and notices may be retained through
explicit `supportFor` links to code reachable from their selected root, with a
`supportEvidenceDigest`. This preserves necessary supporting material without
using it to justify otherwise dead code. Required notices must be retained in the
same target as the file requiring them. Deleting a reachable path is refused.
Files identified as containing personal data require a `private-data` deletion
reason; no source bytes are printed.

Generated files require a `generate` decision and a reachable, retained canonical
ancestor; missing/deleted ancestors, orphan outputs and canonical cycles block.
Canonical authorities may remain in another target, provided their own retained
root and ancestry are valid. Generated files cannot evade ancestry checks through
a `retain` decision.

## Output and limitations

`buildPathManifest(files, entryPoints, edges, decisions)` returns all classified
records, `unclassifiedPaths: 0`, an input digest and a manifest digest only after
all assertions pass. JSON object keys used for digests are canonicalized and file
records are ordered by source and path. The CLI can emit one JSON-compatible YAML
allow-list per target, containing retained/generated records plus input/manifest
bindings. Those files are candidates for independent review, not already reviewed
composition inputs.

Tests include a real Git repository whose tracked paths and committed revision
must match the classified records, as well as CLI fixture coverage, deterministic
allow-list bytes, incomplete-decision refusal and the `.github` source/target.
Actual fleet-wide coverage still requires the independently produced frozen
36-source inventory. A caller-supplied incomplete inventory cannot be discovered
from metadata alone. No current fleet freeze, licensing approval, independent
consumer count or completed migration is claimed by this tool.
