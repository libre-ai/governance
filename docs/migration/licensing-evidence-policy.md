# Protected licensing evidence and technical gate

This implements the technical evidence gate in composition Task 4. It is not a
legal opinion, a compatibility database, or permission to relicense content.
Deleting public Git history does not revoke licenses already granted.

## Trust boundary

`auditLicenses(input, trustedPolicy)` requires an independently reviewed policy.
Routine automation cannot create that policy from submitted assertions. The policy
binds the complete retained-path inventory (source ID, immutable commit, path,
SHA-256 content digest, target ID/path and kind), and a review binds the canonical
SHA-256 digest of each complete file record. Both rights and compatibility must
be explicitly approved. A DCO trailer, a signature, a repository owner, or an
unchanged source license does not establish a reviewed rights grant.

Policy approval is external to this gate. The caller must obtain the approved
policy digest through the controlled owner/reviewer channel. A policy hash copied
from the submitted input establishes no trust. Changes in inventory, notices,
licenses, or provenance invalidate existing approvals. Revocations require a new
approved policy and withdrawal of the old digest at the invoking authority;
this offline tool cannot discover later revocations or authenticate a reviewer.
No mutable timestamp or self-declared `reviewed` flag supplies authority.

Code requires Apache-2.0; documentation requires CC-BY-4.0. Assets require a
separately reviewed explicit license. Compatibility is an independent review
verdict, never a guessed mapping of license names. Unknown authorship, missing
REUSE/repository-license/history/rights evidence, obsolete license files, and
claims of historical license revocation all reject. Required notices must retain
exact target paths and content digests. The composer must verify actual target
bytes against those approved digests; claims alone do not inspect a target tree.

## Immutable provenance collection

`collectLicenseProvenance({ repository, commit, path, licensePaths, reusePaths,
noticePaths })` reads local Git objects at an exact 40-hex commit. It returns
Git blob OIDs for the retained file, repository license, REUSE metadata and notice
files, plus contribution commit OIDs and signoff-presence booleans. It neutralizes
replacement refs, refuses shallow histories and graft files, and accepts only
regular-file objects. Worktree edits do not affect results. No source writes or
network operations occur. Git commands have bounded output and deadlines through
the C1 command runner. Up to 1,000 metadata paths and 10,000 contribution commits
are supported; larger inputs reject. Collection follows path history including
renames; the reviewer must assess merge attribution and completeness, including
imported/squashed content not discoverable from Git history.

The collector does not interpret REUSE license expressions or validate the legal
meaning/authenticity of signoffs. Reviewers must resolve metadata coverage,
contributors, third-party origins, grants, notices and permitted target licenses.
Record `digestEvidence(provenance)` as history evidence and reviewed metadata
record hashes in the file evidence. Store raw SHA-256 file content separately
from Git blob OIDs: they are different identities. The policy review must bind
these to the same frozen path. Collector output alone cannot authorize acceptance.

## Protected record

Raw contributor identities, grants and other potentially personal material stay
in a separately access-controlled compliance record, encrypted at rest and in
transit, available only to authorized rights reviewers. Routine agents, public
repositories, generated manifests and logs must not receive that record. Keep
only opaque evidence hashes and the minimum nonpersonal facts needed by this
technical gate. The collector transiently reads signoff trailers in memory but
never returns or logs identities, raw commit messages, stderr or repository paths.

Retention and destruction require the applicable legal basis and authorized
review. Public-history cleanup is never a destruction instruction for evidence
needed to substantiate rights. Encryption keys and access control belong to the
protected store; this tool neither provisions it nor opens it. API verdicts include
source paths and license strings for private composition; do not publish them or
log arbitrary API inputs. CLI output contains fixed reasons and counts only.

## Reproducible invocation and integration

```sh
bun test tools/migration/license-audit.test.ts
bun tools/migration/license-audit.ts --input reviewed-files.json --policy approved-policy.json --policy-sha256 APPROVED_64_HEX_DIGEST
```

The CLI requires exactly these arguments and pins the raw policy-file bytes;
`digestEvidence` canonicalizes object key order for record hashes. Input and policy
files are limited to 16 MiB. Exit 0 means every submitted path passed the pinned
review; exit 1 means malformed, stale, incomplete or rejected evidence. No raw
paths or parser errors appear in CLI output. Synthetic `fixtures/licenses` inputs
and policies exercise acceptance, unknown ownership and missing notices; their
fake approvals are never production trust roots.

After auditing the frozen manifest, the composer must remove rejected paths and
rerun reachability; an incomplete entry point blocks its entire target. This
module does not mutate manifests, compose targets or bypass the separate path
and reachability gates. No production frozen manifest or approved rights policy
was available during implementation; no real-source licensing qualification is
claimed by the fixture tests.
