# Candidate GitHub security settings

R6 renders settings and observes permission facts; it applies nothing. No
repository is created, renamed, deleted, configured or made public. A generated
payload always carries `applicationAuthorized: false` and `qualification: candidate`.
It is not a cutover grant or evidence that settings already exist remotely.

## Authorized set and security defaults

`buildRepositorySettings(admissions?)` derives all 14 certain targets from the
migration inventory and display names from the current-capability catalog. The
`db-inspect` slug remains `Libre AI Database Inspector`. Conditional names enter
only through original in-process C5 grants; cloned, forged, expired, mismatched
or rejected verdicts fail. Signalement and private research are excluded.

`validateRepositorySettings(input, admissions?)` validates the entire exact
settings set with a strict Ajv const schema. Missing/extra targets, unknown
properties, altered checks, admin bypass, unsigned commits, deletion and force
push allowances all fail. Defaults require secret scanning, push protection,
Dependabot alerts and updates, private vulnerability reporting, PRs, resolved
conversations, strict checks, signed commits and linear history. The mandatory
human approval count is zero. Administrators receive no bypass entry.

## Review producer boundary

`renderSettings(settings?, admissions?, reviewPolicy?)` emits deterministic
candidate JSON with a digest. With no review policy, it emits the 14 logical
settings, blocker `review-producer-unbound`, and **zero REST operations**. The
committed distribution is this withheld candidate, not a claim of security release
readiness. The proposed context `independent-review/exact-commit` is a candidate
convention, not a newly established status authority.

The independently selected review policy contains exactly:

```json
{
  "schemaVersion": "github-review-producer.v1",
  "context": "independent-review/exact-commit",
  "integrationId": 123,
  "qualificationDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

The values above are synthetic. The controller must independently review and
select the real integration, context and immutable qualification artifact. This
module neither fetches nor authenticates that qualification artifact. In-process
callers own this trust boundary; CLI additionally requires an independently pinned
SHA-256 of the exact policy file bytes. Computing a hash of unreviewed candidate
input does not confer authority. No real producer binding is available in this
packet: R2/R3 runner/signer and A5 exact-commit review qualification remain outside
this implementation. Even a fully bound candidate payload does not qualify those
prerequisites or authorize application.

## CLI

```sh
bun tools/github/render-settings.ts
bun tools/github/render-settings.ts --check distribution/github/repository-settings.v1.json
bun tools/github/render-settings.ts --review-policy /private/review-policy.json \
  --review-policy-sha256 REVIEWED_SHA256
```

Default generation/check exits 0 for a valid withheld candidate. Invalid input,
missing/mismatched policy pins or drift exits 1 with a fixed diagnostic. There is
no apply flag. Conditional inputs additionally require paired ordered arrays:
`--conditional-policies FILE --conditional-policies-sha256 REVIEWED_SHA256
--conditional-evidence FILE`. Each policy/evidence pair is reverified by C5 before
rendering; rejected evidence aborts rather than silently dropping a requested
conditional. Inputs are bounded regular non-symlink UTF-8 files, at most 2 MiB;
reads allocate only limit+1 bytes and reject invalid UTF-8, FIFOs and excess data.

A complete policy yields five proposed operations per included repository:
repository security/merge settings; enable alerts; enable security fixes; enable
private vulnerability reporting; create a default-branch ruleset. The ruleset
uses an empty bypass list and pins the status producer integration ID. The
operation list is **not an idempotent apply program**: a future applier must reconcile
existing ruleset IDs and validate the actual remote result. Feature availability
on private staging, organization policy and licensing can still block application.

## Read-only permission observation

`auditPermissions(repositories, reader?, admissions?)` accepts an injected typed
GET reader for synthetic tests. Defaults use `gh api` with explicit GET, fixed
GitHub host, 20-second request deadlines and a 2 MiB response bound. No tokens are
read into output. The live CLI reads the 36 existing source repositories; it does
not probe creation/deletion or provision target names:

```sh
bun tools/github/audit-permissions.ts --live
bun tools/github/audit-permissions.ts --fixture /private/permission-fixture.json
```

The fixture is a path-keyed map of `{status, body, oauthScopes}` responses and is
only a test input, never authenticated permission evidence. A successful fixture
run is not a live audit. The output strips login, profile fields, tokens and raw
headers. Identity is reported only as an enum after comparison with the required
personal account; repository slugs and the three required classic scope states
are the only account-related labels emitted.

States are `observed`, `denied`, `unknown` (and the reserved `not-applicable` for
future explicitly established non-applicability). A 403 is denied; 404, network
failure or missing data is unknown. All repositories are collected despite
individual failures. The output always says `cutoverAuthorized: false` and
`mutationOutcome: not-probed`.

The authenticated user must be the designated personal User account, with active
organization admin membership. Repository `permissions.admin` establishes actor
role, **not** a fine-grained token's administration-write grant. Classic OAuth
scope headers can establish `repo`, `delete_repo`, and `admin:org` scope presence;
missing headers do not identify the token type and remain unknown. In particular,
a fine-grained token does not acquire a `delete_repo` scope just because its actor
is an admin. Its repository write authority remains unknown here, requiring a
separate reviewed permission record. The organization ruleset GET endpoint itself
requires organization Administration(write), so success is a stronger endpoint
observation. None of these reads prove deletion will succeed under organization
policy, or grant permission to attempt it. CLI exits 1 while any required observed
role/scope/endpoint fact is missing; exit 0 is still only a read-only observation.

## Official API references checked 2026-09-12

GitHub's REST documentation examples currently use API version `2026-03-10`.
Repository security fields and the separate alert/update/private-reporting
endpoints are documented in [Repository REST endpoints](https://docs.github.com/en/rest/repos/repos).
Private feature availability must be checked on the actual staging organization.

The ruleset API defines active enforcement, default-branch conditions, empty
bypass actors, required signature/linear-history/PR/status rules, and an optional
`integration_id` for required status checks. R6 requires that producer binding.
See [Repository rules](https://docs.github.com/en/rest/repos/rules).

The GET organization ruleset endpoint lists Administration(write) as the required
fine-grained organization permission: [Organization rules](https://docs.github.com/en/rest/orgs/rules).
Classic scopes and their response headers are distinct from fine-grained grants:
[OAuth scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps).

## Verification

`bun test tools/github` tests complete target membership, immutable security
settings, authentic synthetic grants for all six conditionals, forged grant
rejection, deterministic generation, policy pin checks, input boundaries and
CLI fixture audit redaction. No production credentials, signing keys or review
producer qualifications are fabricated by these tests.
