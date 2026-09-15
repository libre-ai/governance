# Conditional admission evidence

This local evaluator implements the six boundaries in the approved big-bang
specification §5.2. It executes no product checks, performs no network calls and
publishes, stages, integrates or deletes nothing. Its failure dispositions are
instructions for a separately reviewed composition decision. No real product is
qualified by the synthetic tests.

## API and CLI

`loadGateDefinition(target)` loads one of the six repository-owned definitions in
`migration/gates/*.v1.yaml` (JSON-compatible YAML). `gateDefinitionDigest(definition)`
is SHA-256 of its JSON serialization. Assertion order is significant.

`evaluateConditionalGate(target, policy, bundle, now?)` returns the complete assertion
list and an `admit` or `reject` verdict. Missing, malformed, duplicate, failed,
stale, substituted or unsigned evidence rejects. Unknown targets throw a fixed
error. `now` is an injectable trusted clock for tests; CLI always uses wall time.

`assertConditionalUse(target, candidateCommit, usage, verdict?, now?)` permits
`local-candidate` investigation without admission. `public-name` and
`final-private-staging` require the original verified in-process verdict, an
unaltered digest, the exact candidate and an unexpired policy. Copying or parsing
verdict JSON does not transfer authority; reverify its policy and receipts.

```sh
bun tools/migration/conditional-gates.ts --target collaboration \
  --policy /private/input/policy.json --evidence /private/input/evidence.json
```

Exit 0 means admission against the supplied trusted policy; exit 1 means rejection
or invalid input. Arguments have the exact order shown. Inputs must be regular
JSON files of at most 2 MiB. Output contains only target names, commits, assertion
IDs, digests, booleans and the prescribed disposition. Invalid CLI inputs produce
a fixed diagnostic without paths, keys, signatures, raw logs or stderr from tools.
Repeated evaluation produces identical bytes while the policy remains valid.

## Independent trust boundary

The policy file is authority selected independently by the invoking controller.
It MUST NOT come from the candidate, the evidence producer, a model response or
an unreviewed pull request. Allowing an adversary to choose both policy and
receipts would allow that adversary to admit itself. This module cannot establish
operator authority from a filesystem path and does not configure a production
trust root. The CLI is a verifier, not a persistent publication capability.

Policy version `conditional-policy.v1` pins target, candidateCommit, the exact
`sourceCommits` array (`source`, `commit`), definitionDigest, an Ed25519 SPKI PEM
publicKey, validAfter/validBefore ISO timestamps and every assertion's
`assertion`, `receiptDigest` and `recipeDigest`. SHA values are lowercase hex;
commits have 40 characters and digests 64. The definition digest prevents an
unreviewed reduction of requirements from matching an existing policy.

Bundle version `conditional-evidence.v1` contains `receipts`, each with exact
UTF-8 `bytes` and its base64 Ed25519 `signature`. Each signed JSON receipt has:

- schemaVersion `conditional-receipt.v1`, target, assertion, candidateCommit,
  sourceCommits, completedAt, recipeDigest and status (`pass` or `fail`);
- checks with unique IDs `assertion/<id>`, `candidate/check` and
  `source/<source>/check` for every gate source, each containing exitCode and
  immutable resultDigest; all must succeed;
- execution `{kind: "deterministic"}`, or `{kind: "model", provider, model,
  configurationDigest, hostInputDigest, oracleDigest}` when a model is involved.

Unknown fields reject. Receipt bytes must match the independently pinned digest
and signature; source commits, candidate, recipe, check set and timestamp must
match the policy. A claimed successful exit alone is insufficient: the independent
reviewer must establish what the immutable recipe and result actually prove.
Digests bind referenced artifacts; this evaluator does not retrieve them or
prove their semantic truth. Provider/model identity and an independent oracle
are required metadata for model execution, not a qualification of that model.

## Recipe for real evidence

Freeze and reconcile actual source roots first. Build each private candidate at
an immutable commit. An independent runner executes each gate's named assertion
and the canonical check of every participating source and candidate. Preserve
the recipe, complete result artifacts, source/candidate hashes and execution
identity privately by content digest. Review the assertion's actual semantic
result, including negative cases, deletion/privacy proofs, licenses and relevant
threat model. For artifact-proof, the absence of contributor lineage must be
proved; signing a generic provenance result does not establish this absence.

A separately trusted reviewer validates these artifacts, signs their exact
receipt bytes and distributes a policy pinning the reviewed definition, receipt
and recipe hashes with a bounded validity window. The consumer independently
selects that policy and verifies immediately before the intended operation.
A new commit, recipe, source root, assertion, model configuration or expired
window requires fresh reviewed evidence. No production signing key or signed
qualification is included here.

## Verification

`bun test tools/migration/conditional-gates.test.ts` uses ephemeral Ed25519 keys
and synthetic evidence only. Every gate rejects each missing assertion, changed
bytes, substituted candidate, stale policy and copied verdict. Signed but failed,
wrong-source, wrong-recipe, incomplete-check, incomplete-model, unknown-field and
future receipts reject. The subprocess E2E checks deterministic admission,
withholding and safe malformed-input diagnostics. This proves evaluator behavior,
not that any of the six real projects satisfies its gate.

Validity bounds and receipt completion times must also be finite native date
values. ISO-looking leap-second inputs unsupported by the runtime are refused,
so NaN comparisons cannot disable expiry. CLI readers enforce the 2 MiB bound
while reading, not only through an earlier file-size observation, and reject
invalid UTF-8 rather than replacing bytes.
