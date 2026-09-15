# Read-only source freeze audit

The candidate C1 audit observes the 36 public sources in
`migration/public-portfolio.v1.yaml`. That JSON-compatible YAML manifest and
its strict Ajv schema pin 14 certain targets and six conditional targets,
including exact repository dispositions. Local `dot-github` maps to `.github`.
Private product research and local Signalement are excluded.

Run from governance:

```sh
bun run migration:freeze --dry-run --source-root /path/to/source-clones
bun test tools/migration/source-freeze.test.ts tools/migration/source-observation.test.ts
```

The root is explicitly supplied; no recursive clone discovery occurs. Each
source directory must have the matching GitHub origin. The collector verifies
the personal GitHub account in memory and reads repository visibility, live
remote heads, paginated open PRs and accessibility of their head repositories.
Git commands inspect main, local/tracking branches and every registered
worktree, including detached heads and untracked files. `ls-remote` never
updates a source clone. No fetch, checkout, reset, branch, PR or remote mutation
is performed. Git optional locks and interactive prompts are disabled. Every
subprocess has a 30-second deadline; failures become opaque per-source errors.
Raw command output and GitHub identity never enter public output.

Standard output is deterministic JSON, sorted by source and hashed without
clock time. Paths and branch names are represented by SHA-256 digests; digests
are correlation identifiers, not encryption or proof of anonymity. Keep run
evidence outside public repositories. The report includes exact commit OIDs,
public source slugs, PR numbers and machine-readable blocker codes. Invalid
commit bytes are rejected before serialization. Standard error uses fixed
messages only. Exit status 1 means blocked, including partial observations.

A dirty, absent, inaccessible, identity-mismatched or drifting source blocks.
Every non-default local, tracking or live remote branch blocks, even if it
looks stale or merged. Open PRs and detached/divergent worktrees also block.
There is no automatic exemption or branch-deletion mechanism. Resolution
requires separately reviewed source work; this audit does not grant that
work authority. The current concurrent Harness, Notebook, Website and
Orchestrator sessions must not be treated as frozen inputs.

This is a point-in-time observation, not an atomic cross-repository lock or
source-session termination attestation. A zero exit establishes only the
implemented quiescence checks at observation time. Later phases must reobserve
and compare the exact digest immediately before consuming any evidence or
performing an authorized transaction. Candidate tooling does not establish
conditional admission, licensing, final composition or publication readiness.

Synthetic tests create real Git repositories and detached worktrees, prove
that dirty/untracked and branch state is detected, and compare refs before
and after observation. Unit tests exercise all blocking facts and exact
inventory/disposition validation without contacting GitHub.

The exported `assertQuiescent` predicate validates unknown runtime input with
an exact schema and rechecks the full source set, commit equality, worktree
coverage and every observable refusal condition. Removing blocker labels and
recomputing a digest cannot bypass those checks. Accessibility, source dirtiness
and observation completeness remain explicit facts in the report. The digest
binds bytes; it does not authenticate their producer. Consumers must retain the
trusted read-only collector and immutable evidence provenance boundary.


Tracked cleanliness is checked against raw HEAD and index blob identities,
working-tree bytes and executable modes using bounded streaming hashes. This
catches `assume-unchanged` and `skip-worktree` masking. Symlink content is read
without following its target; symlink ancestors, gitlinks, conflicted indexes
and unsupported entries refuse qualification. Git clean/smudge transformations
are not replayed: a raw-byte mismatch blocks rather than trusting a filter.
Replacement objects are disabled and replacement refs explicitly block.

On POSIX the deadline irreversibly refuses the result and kills the dedicated
process group while its leader is still alive. After leader exit, it closes pipes
and refuses the result without signaling a potentially reused PID or process
group; surviving descendants are not automatically cleaned up. Captured stdout is
limited to 16 MiB; stderr is not retained. Windows execution is unqualified and
refused. These checks do not establish an atomic snapshot against concurrent
writers; the exact final source observation remains a separate cutover gate.
