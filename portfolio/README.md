# Candidate repository facts and publication boundary

This local implementation covers the repository contract and deterministic
projection tooling. `repositories.v1.yaml` is JSON-compatible YAML containing
20 planning records: 14 certain targets and six provisional conditional names.
It does not declare those repositories qualified, published or usable today.

The benefit, audience, existing source outcome and limitations summarize the
source READMEs inspected during implementation. Actions open the corresponding
existing source repository; none claims a deployed demonstration or that a
renamed target already exists. `source-observations.v1.json` records read-only
revision and README-byte provenance. These observations are not a source freeze
and do not supersede current repository-local tests. All real records have
`proof.kind: pending` and an empty evidence array. No verification date was
invented or copied from an old project card.

```sh
bun portfolio/validate-repositories.ts --planning
bun portfolio/validate-repositories.ts --publication
bun portfolio/build-projections.ts
bun portfolio/build-projections.ts --check
bun test ./portfolio
```

Planning validation enforces the full topology, names, bounded claims, languages,
source action URLs and metadata limits. Without explicit trusted inputs, publication validation exits 1. Building emits
separate marked candidate facts and three empty public collections. The generated central proof
page states that no proof is admitted. A matching projection is deterministic
candidate evidence, not proof that publication is authorized.

The library renderers require an opaque publication grant. `authorizePublication`
creates that grant only after verifying an Ed25519 signature over an exact
receipt, its externally expected SHA-256, externally pinned checked revision, contract byte
digest, evidence URLs, content digests and verification times. Conditional grants additionally
require the exact gate, an `admit` decision and immutable verdict digest. A plain
object or a boolean is not a grant. Changing the contract invalidates the grant.
Evidence URLs, verification times and commands are shared by English and French;
text is escaped for Markdown and controls/HTML are rejected before rendering.

The caller's `PublicationTrust` is the trust boundary: its key, exact receipt
digest and expected revision must come from independently reviewed immutable
evidence, never from the contract, receipt or an untrusted request. The signature
attests that the trusted reviewer checked the executable evidence and conditional
verdict; the renderer does not execute that evidence. No production signer, freshness oracle or admission service is configured here. The
signed test fixtures use ephemeral synthetic keys and do not qualify products.

The builder accepts `--output-root PATH` for isolated reproducibility checks.
`--check` compares exact bytes without writing. It never reads public projection
files as authority or mutates source repositories or GitHub. Public metadata
omits homepage fields unless a contract has matching smoke evidence; current
contracts have no homepages. Pins are bounded to six certain candidates, Missions
is the sole primary CTA, and star CTAs remain disabled pending later proof.

The contract can express real self-host and quickstart commands as printable
single-line text. Renderers never execute them and select a code fence longer
than any backtick sequence in the command. HTTPS homepages and technical demo
URLs are representable with matching immutable smoke evidence; public rendering
still requires the independently trusted signature over the full contract.
Pending catalog actions are restricted to the target's existing source roots.
Evidence may use reviewed HTTPS artifact URLs; its signed content digest, not
a mutable URL alone, binds the exact proof bytes.
A drift test binds all twenty display names to the LEXICON authority.


To verify a reviewed subset, both CLIs accept `--catalog PATH --policy PATH
--receipts PATH`; the validator also requires `--publication`. The catalog must
still contain all twenty records. Policy and receipt files are separate inputs:

```json
{"schemaVersion":"publication-policy.v1","authorities":[{"slug":"db-inspect","publicKey":"<trusted Ed25519 SPKI PEM>","expectedRevision":"<40 hex>","expectedReceiptDigest":"<64 hex>"}]}
```

```json
{"schemaVersion":"publication-input.v1","receipts":[{"slug":"db-inspect","bytes":"<exact signed receipt JSON string>","signature":"<base64 Ed25519 signature>"}]}
```

The operator must select the policy from independently reviewed evidence; never
use a policy delivered by the receipt producer as its own authority. Inputs are
bounded to 2 MiB and twenty unique matching records. Unknown fields, duplicates,
missing matches, altered bytes and invalid signatures refuse the entire run
before projections are written. Verified output contains only that selected
subset and reports its count. This is not a full-portfolio readiness check, a
registry check, permission to publish, or the destructive cutover confirmation.
CLI E2E tests use synthetic signatures, check both languages, and assert that
invalid input leaves existing projections unchanged.

Input readers refuse non-regular files, symlinks and invalid UTF-8. Opening a FIFO
does not wait for a writer. Generated public JSON has an explicit expanded Biome
format matching the deterministic serializer; signed-fixture E2E checks its bytes.


Final receipts are detached from the tree they verify. Contracts carry proof
content digests and observation times, but never their own final commit SHA.
The trusted receipt pins the checked candidate/final revision separately and
signs the complete contract digest. Final-root reverification can therefore issue
a new receipt without changing README or contract bytes. Evidence must not be
newer than that receipt. Release qualification must independently fetch each
artifact and verify its SHA-256 against the contract; the renderer performs no
network request and a signature alone does not run those checks. Both language
renderings display the same proof digest. Synthetic tests exercise this separation
with two distinct checked revisions and byte-identical public output.
