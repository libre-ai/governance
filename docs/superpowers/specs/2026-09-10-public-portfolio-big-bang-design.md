# Libre AI public portfolio big-bang design

- **Date:** 2026-09-10
- **Status:** approved in principle by the owner; this document is the written design for review
- **Scope:** the complete public `libre-ai` GitHub organization, its product boundaries, public
  brand, repository histories, distribution surfaces, and launch path
- **Primary outcome:** earn qualified GitHub stars by letting a developer understand, try, and
  verify Libre AI Missions without learning the internal architecture first
- **Execution boundary:** the owner gave the migration GO on 2026-09-11. Preparation and private
  staging may proceed under the packet gates; deletion and public cutover still require the second
  explicit confirmation of the exact transaction digest and deletion list in section 12.2.

## 1. Outcome and success criteria

Libre AI becomes one coherent product family whose public promise is:

> AI work you can verify.

The promise is demonstrated by a usable Missions path, evidence close to every important claim,
reproducible releases, and repositories that each have one necessary public responsibility.

The top acquisition measure is the number of stars on `libre-ai/missions`. A star is not treated as
quality evidence. Quality of acquisition is assessed only through anonymous aggregate outcomes:
successful public demonstrations, package or image downloads, installations, and external
contributions. The system does not profile people who star a repository and does not retain IP
addresses, user-agent strings, session identifiers, or other personal data for this purpose.

The migration succeeds only when all of the following are true:

1. every source repository has exactly one reviewed disposition;
2. every surviving repository has a unique, truthful, externally understandable responsibility;
3. Missions offers a no-account public demonstration and a one-command self-host path;
4. all published claims link to a current mechanism, evidence, and limitation;
5. public repository names, descriptions, topics, READMEs, previews, releases, and organization
   navigation agree with the central repository contract;
6. all required local, integration, end-to-end, security, and release gates are green;
7. the public cutover presents one launch story and one primary call to action;
8. no obsolete history, tag, branch, release, license file, or compatibility alias survives in the
   recreated public repositories.

## 2. Design constraints

### 2.1 Decision order

Every implementation choice is evaluated in this order:

1. security;
2. quality;
3. performance;
4. completeness.

Human effort, calendar estimates, partial-delivery labels, and perceived ambition are not decision
criteria.

### 2.2 Public language

Public surfaces use plain language based on what a person can do now. They do not expose internal
architecture labels, migration history, work-package identifiers, agent terminology, symbolic phase
names, or repository-state jargon.

English is canonical. Every public README has a complete French mirror. Both are rendered from the
same factual source and pass a semantic parity gate. Generated copy is reviewed by a person before
publication.

### 2.3 Public state

There are no abstract labels such as `specified`, `usable`, `active`, or maturity percentages on the
first screen. A repository states instead:

- the problem it solves;
- who can use it now;
- the result available now;
- one immediate action;
- the next unavailable capability, only when that limit materially affects the action.

The central page **What we're proving next** lists testable capability gates without dates,
percentages, or promises detached from an acceptance test. A repository may link to at most one next
capability from its README.

## 3. Decisions that replace current doctrine

The current doctrine cannot be silently edited around this migration. The implementation starts
with a new owner-signed ADR that names every bounded supersession and updates the invariant and
decision registers in the same reviewed change. That portfolio authority is ADR-0041, I-32, and D46.
At the first reconciliation, `origin/main` was `94fc054`: ADR-0038, I-30, and D44 already govern private-first
repository publication, including Signalement. They remain unchanged and must not be renumbered,
replaced, or weakened by the portfolio authority. The current `65fbff2` recheck also
preserves ADR-0039/I-31 (private product research) and ADR-0040/D45 (run-control persistence);
portfolio identifiers are therefore ADR-0041/I-32/D46.

The ADR must cover at least these conflicts:

1. **Brand platform.** ADR-0033 and I-29 currently make “Possédez la fabrique.” and the Workshop
   Gantry the canonical promise and figurative direction. This design makes “AI work you can
   verify.” the master promise, retains the existing pixel bird subject to its publication controls,
   and adopts the high-contrast black, white, and green **Evidence Signal** direction.
2. **Primary journey.** The approved public-proof cutover currently sends the main call to action to
   `starter`. This design deletes `starter` and makes Missions the only primary launch journey.
3. **Repository existence.** I-16 currently permits repositories to exist through general
   activation. This design requires a current consumer, an independently useful public capability,
   or a proved security/authority boundary.
4. **History and forgetting.** I-23, D28, and D29 currently require recoverable eviction, an archived
   hub, and preserved migration history. This design recreates the public repositories with clean
   root histories and deletes the old hub without a public archive.
5. **Licensing.** I-11 and ADR-0004 currently differentiate EUPL and Apache code. The target is
   Apache-2.0 for distributable code, CC-BY-4.0 for documentation, and an explicit reviewed license
   for media and brand assets.
6. **Portfolio metadata.** I-08 and I-15 currently project phases, weighted criteria, and state from
   `project.v1.yaml`. This design replaces that public model with a current-capability repository
   contract and evidence-based inclusion gates.
7. **Shared-code distribution.** D29 currently relies on SHA-pinned Git dependencies across many
   small repositories. The target uses registry releases for independently consumed packages and
   keeps single-consumer code with its consumer.

Unchanged controls remain in force unless the ADR names them explicitly: GitHub remains the
canonical public forge; contracts and governance remain separate authorities; data boundaries,
tenant isolation, DCO, security review, proof publication, EU runtime, and repository-local release
authorization remain mandatory.

Deleting history does not revoke licenses already granted. No migration copy may claim otherwise.
Relicensing a file is permitted only when a rights and contribution audit proves that Libre AI has
the authority to do so. A failure blocks that file from the Apache-2.0 target; history deletion is
not a substitute for permission.

## 4. Repository boundary rule

A repository survives only under one of these rules:

1. code with multiple independent consumers belongs in a shared distributable repository;
2. code with one consumer is integrated into that consumer;
3. code with no consumer and no independently usable capability is deleted;
4. a security or authority boundary may remain separate only when it publishes an independently
   consumable artifact, owns an autonomous contract, documents its threat model, and proves its
   critical failure paths.

Tests do not count as consumers. Code reachable only from tests is dead. A security-themed name does
not grant an exception.

Every retained unit must be explainable without reading its internals: what it does, how to use it,
and what it depends on. Public package dependencies use released SemVer versions, not Git branch or
commit references. Internal packages are private, have no publication configuration, and make no
distribution promise.

Internal layouts follow the same consumer and reachability evidence; cosmetic uniformity is not a
reason to move code. Missions retains its existing `apps/missions/src/app`, `authz`, `domain`,
`persistence`, `server`, `shared`, and `ui` boundaries, integrating Auth and Build Brief there.
Sessions absorbs `rgpd-kit` under `apps/sessions`, using its existing `src/rgpd` boundary. A separate
private package requires an explicit path/consumer proof of a real internal boundary.
Contracts keeps editable canonical sources in `contracts/` and generated projections visibly
separate in `generated/typescript/` and `generated/rust/`; an alternative requires an executable
packaging constraint. Governance retains `ecosystem-engine` and Mission Control retains `envelope`
as internal crates/packages only where reachability and consumer proofs justify those boundaries.
Existing product architecture is preserved unless a complete refactor is proved necessary by the
path manifest, including every moved path, dependency, and acceptance test.

## 5. Target topology

The observed organization contains 36 public repositories: 35 unarchived repositories and the
archived `libre-ai` hub. The target contains 14 certain repositories and at most six additional
repositories that must pass explicit proof gates.

Local Signalement has no GitHub remote and is a private-first candidate. It is outside the 36
observed public source repositories, the 14..20 public target contract, and this cutover transaction;
local discovery must not silently enroll it for publication or deletion.

### 5.1 Certain repositories

| Target repository | Public responsibility | Sources absorbed |
| --- | --- | --- |
| `.github` | Organization profile, contribution defaults, and shared community files | `.github` |
| `website` | Demonstrations, use cases, results, and brand guide | `website` |
| `missions` | Plan, authorize, run, and verify bounded AI work | `missions`, `auth`, `spec-studio` |
| `ai-practice` | Turn AI working practices into repeatable, verifiable exercises | `ai-practices` |
| `feed-radar` | Import, curate, and export a sourced information feed | `feed-radar` |
| `notebook` | Keep and exchange private encrypted notes locally | `notebook` |
| `model-policy` | Inspect and apply explicit model-use rules | `policy` |
| `sessions` | Facilitate structured sessions with controlled data handling | `sessions`, `rgpd-kit` |
| `app-kit` | Reusable UI, web, and testing packages for Libre AI applications | `ui`, `web-platform`, `testing` |
| `contracts` | Machine-readable authorities and generated TypeScript/Rust SDKs | `contracts`, `sdk-ts`, `sdk-rs` |
| `governance` | Human-readable decisions, repository contract, and portfolio verification | `governance`, `ecosystem-engine` |
| `mission-control` | Deterministic execution coordination and review envelopes | `orchestrator`, `envelope` |
| `data-lifecycle` | Tenant isolation, retention, deletion, and auditable data handling | `data` |
| `db-inspect` | Inspect a live database through a bounded, verifiable tool | `db-inspect` |

### 5.2 Conditional repositories

Conditional targets are evaluated after all concurrent sessions finish and before any public
repository is deleted. The six slugs and associated display names below are provisional planning
identifiers, not public brand commitments. Neither becomes a public name until that target's
executable admission gate passes. A failed target is not created merely to reserve its name.

| Target | Sources | Required proof | Failure disposition |
| --- | --- | --- | --- |
| `vote-mirror` | `boussole-politique` | A real sourced corpus for one jurisdiction, private comparison end to end, deletion proof, and an immediately runnable user path | Delete the source; do not recreate the target |
| `travel-planner` | `travel-agent` | A complete sourced itinerary for one city, freshness checks, local result ownership, and a runnable path | Delete the source; do not recreate the target |
| `execution-guard` | `harness` | Independent runnable guard, autonomous contract, Mission Control integration, threat model, and critical refusal/crash tests | Integrate code required by Mission Control; delete the rest |
| `authorization` | `authz-biscuit` | Published crate, independent example, threat model, key rotation and revocation tests, and registry-consumer proof | Integrate the required capability into `governance`; delete the standalone source |
| `artifact-proof` | `artifacts`, generic parts of `provenance` | Standalone offline verifier CLI, signed fixture, SBOM/provenance validation, and no agent-contributor lineage model | Delete unconsumed code and the contributor-lineage model |
| `collaboration` | `collab-core`, `collab-relay` | Real cryptography plus two independent clients communicating through the relay in an end-to-end test | Delete both sources; do not recreate the target |

### 5.3 Sources deleted without a target

| Source repository | Reason |
| --- | --- |
| `libre-ai` | Obsolete hub and second navigation authority |
| `carriere` | No current product contract or complete vertical capability |
| `classification` | Lets callers self-assert authority and therefore creates security theatre |
| `knowledge` | No current consumer or autonomous authority |
| `starter` | No external consumer, no GitHub template configuration, and private packages |

This table names net deletions. Repositories absorbed or renamed are also deleted as source objects
during recreation; their content disposition is defined in the tables above.

## 6. Product and brand system

### 6.1 Brand hierarchy

- Master brand: `Libre AI`.
- First public product mention: `Libre AI <Product>`.
- Locked display name: `db-inspect` is `Libre AI Database Inspector`; its GitHub slug stays
  `db-inspect`. Renderers must not derive a different product title from that slug.
- Master promise: `AI work you can verify.`
- One product receives one name, one concrete benefit, and one category accent.
- Products receive no independent logo or unrelated promise.
- The existing pixel bird remains the shared figurative mark only after exact asset licensing and a
  dated similarity review are accepted.
- The visual direction is **Evidence Signal**: black, white, and green, high contrast, restrained
  motion, and visible proof markers. Color never carries state alone.

The previous open-factory idea may remain as an editorial explanation of replaceability, but it is
not the master tagline, primary call to action, or figurative system.

### 6.2 README information order

Every product README follows this order:

1. identity, user benefit, and one real product visual;
2. demonstration or concrete outcome;
3. shortest verified quick start;
4. current trust proof and material limitation;
5. contribution path;
6. reference documentation.

The first screen must answer: what is this, who is it for, what can I do now, and what proves the
claim? It may name at most three **Works with** dependencies generated from the repository contract.

There are at most four proof badges:

- tests;
- released version;
- Apache-2.0 code license;
- signed provenance or artifact verification.

There is no star-count badge. A star request appears only after a person has reached a working
demonstration, successful quick start, or verified release.

### 6.3 Organization profile and website

The organization profile is conversion-first:

1. promise;
2. Missions demonstration;
3. **Use**, **Build**, and **Trust** paths;
4. **Explore** as a secondary path;
5. at most six pinned repositories.

The website shows demonstrations, use cases, and results. The GitHub profile helps a visitor choose,
try, star, and contribute. Governance explains how to inspect decisions and claims.

Missions receives the only primary launch call to action. `model-policy` or `db-inspect` may provide
secondary trust proof, but neither competes for the primary star request.

Repository pin eligibility is evidence-based. Missions is pinned as the flagship only after its
public no-account demonstration, one-command self-host path, end-to-end authorization proof, signed
release, and rollback-capable deployment are all green. Other pins are selected by current runnable
proof, not strategic importance.

### 6.4 Metadata and previews

`governance` owns a versioned machine-readable repository contract. It produces and validates:

- canonical slug and display name;
- plain-language benefit and differentiator;
- current user action and verified outcome;
- up to three public dependencies;
- evidence links and material limitations;
- five to eight GitHub topics;
- homepage URL only when its smoke check is green;
- README facts in English and French;
- social-preview input;
- the single next proof, when present.

Generated social previews share one layout source and use the product name, benefit, category accent,
and pixel bird. A real screenshot or result appears below the README hero; a generated decorative
mockup never substitutes for product evidence.

## 7. Contribution and roadmap surfaces

There are two primary contribution doors:

- `missions` for product behavior, demonstrations, and integrations;
- `governance` for cross-cutting repository, proof, security, and brand rules.

Bugs stay in the repository that owns the behavior. Cross-cutting proposals live in governance and
link to affected local issues. A `good first issue` is published only when it is reproducible,
bounded, has an executable or observable acceptance criterion, and has no hidden dependency.

The central **What we're proving next** page is generated from the repository contract. It is the
only portfolio-wide future-capability view. READMEs do not contain independent roadmaps, dates,
percentages, or implementation diaries.

## 8. Licensing and provenance

The target licensing policy is:

- Apache-2.0 for distributable source code;
- CC-BY-4.0 for documentation;
- an explicit, separately reviewed license for media and brand assets;
- DCO for every new contribution;
- machine-readable REUSE attribution where applicable.

Before composition, every retained path is classified by content type, current license, copyright
holder evidence, contributor history, and third-party notices. The migration gate refuses:

- a path whose relicensing authority is not proved;
- a dependency whose license is outside the accepted policy;
- an attribution or notice required by a surviving dependency but missing from the clean target;
- an obsolete or contradictory license file;
- generated output whose canonical source is absent.

A protected compliance record may retain the minimum authorship evidence required to justify the
new license. It is not a public Git history, is not available to routine automation, is never emitted
to logs, and is destroyed only when the applicable legal retention basis permits it. Public cleanup
does not justify destroying evidence required to defend licensing rights.

## 9. Clean-history composition

Each target is assembled from an allow-list, not by copying an entire source repository and deleting
known-bad paths afterward.

The composer records for every retained path:

- source repository and frozen source commit;
- source path and content digest;
- target repository and path;
- classification: code, test, documentation, fixture, configuration, or asset;
- reachability from a shipped entry point, public contract, or distributed tool;
- target license and the evidence permitting it.

The target repository starts with one signed root commit containing only the reviewed current tree.
It imports no source commits, merge commits, pull-request references, branches, tags, releases, issue
history, migration banners, old compatibility aliases, or old license versions.

Tags are created only for immutable user-consumable SemVer releases after recreation. Migration,
archive, evidence, and backup tags are forbidden.

No force-push is part of this design. Existing repositories are deleted and clean repositories take
their names only after the explicit destructive checkpoint.

## 10. Distribution and runtime

### 10.1 Applications

Missions provides:

- a public demonstration requiring no account;
- a one-command self-host path;
- a signed reproducible OCI image;
- an SBOM and provenance statement bound to the image digest;
- a canonical EU-hosted registry artifact and a GitHub mirror.

The hosted demonstration runs on Clever Cloud in Paris and stores no personal data. The canonical
domain is attached only after the technical URL and rollback path pass smoke tests.

### 10.2 Packages

- reusable TypeScript packages are released to npm only when they pass installation tests from the
  registry artifact;
- reusable Rust crates are released to crates.io only when they pass installation and example tests
  from the registry artifact;
- package versions are independent SemVer values;
- compatibility across released Libre AI packages is covered by tested version matrices;
- lockfiles reference registry releases, not Git branches or commit SHAs.

### 10.3 Release security

Releases use two isolated stages:

1. an unprivileged build executes repository code and produces immutable artifacts, digests, SBOMs,
   and unsigned provenance input;
2. an isolated signer receives only verified digests and metadata, executes no repository code, and
   signs the approved subjects.

`artifact-proof`, when admitted, verifies the resulting bundle offline. Otherwise each distributing
repository carries the minimal verifier required for its own release until a second consumer exists.

## 11. GitHub and CI security baseline

Every target repository is configured before it becomes public:

- secret scanning and push protection enabled;
- Dependabot alerts and security updates enabled;
- private vulnerability reporting enabled;
- pull request required for the default branch;
- strict required checks and resolved conversations required;
- signed commits and linear history required;
- force-push and branch deletion forbidden;
- rules enforced for administrators;
- no mandatory human approval count for the solo-maintainer topology;
- an independent review check bound to the exact candidate commit.

CI uses ephemeral self-hosted runners on EU infrastructure. Compute, caches, and secrets remain in
the EU. GitHub's proprietary US control plane is the documented public-code exception. CI commands
remain runnable locally and portable to another forge.

The personal GitHub identity is used for Libre AI operations. Public commits use its GitHub-provided
noreply address; the private contact address is never committed, printed by automation, or placed in
README, issue, release, or repository metadata.

## 12. Migration transaction

GitHub does not provide an atomic transaction across repository deletion, rename, visibility,
metadata, rules, releases, pins, and organization-profile operations. “Big bang” therefore means one
stop-the-world transaction with logical atomicity and a single public launch, not simultaneous API
effects.

### 12.1 Prepare without public mutation

1. Merge or reject every useful concurrent branch under its repository gates.
2. Delete local dead code and close obsolete pull requests and branches only after their disposition
   is recorded.
3. Assert no active session, dirty worktree, unpushed commit, open useful branch, or mutable release
   candidate remains.
4. Freeze every source repository by exact commit and reject drift from that set.
5. Evaluate all six conditional repositories from executable evidence.
6. Generate the complete source-to-target path manifest and prove there are no unclassified paths.
7. Build every target as a clean local repository and, where GitHub behavior must be tested, as a
   temporary private staging repository.
8. Run clean-room installation, build, test, E2E, security, license, link, language parity, preview,
   distribution, and restore checks.
9. Prepare all GitHub metadata, security settings, releases, profile content, website artifact, and
   post-cutover smoke requests as deterministic inputs.

Temporary staging names and repositories are private, have no public links, and are removed after
the transaction.

### 12.2 Destructive checkpoint

Immediately before public mutation, the operator presents one generated confirmation containing:

- every exact `libre-ai/<source>` repository to be deleted;
- every target name that will replace or absorb it;
- frozen source commits and target root commits;
- conditional-gate verdicts;
- releases, packages, domains, pins, and settings to publish;
- the commands or API operations that cannot be reversed by the migration tooling.

The owner must explicitly confirm that exact manifest by quoting its computed digest and exact
deletion scope as required by the cutover plan. The migration GO received on 2026-09-11 authorizes
preparation/staging; it does not replace this second deletion confirmation.

### 12.3 Public cutover

1. Enable a minimal cutover presentation that makes no stale repository promise.
2. Delete source repositories named by the confirmed manifest.
3. Move or create clean staged repositories under their final names while still private.
4. Apply security settings, topics, descriptions, homepage rules, and default-branch protection.
5. Publish required SemVer releases and registry artifacts; verify them as an anonymous consumer.
6. Make the complete target set public.
7. Publish the organization profile, website, social previews, and pins as the final projection.
8. Run anonymous repository, package, OCI, demonstration, website, link, and security smoke checks.
9. Remove the cutover presentation only after every final route is green.

The procedure stops on the first failed assertion. It does not continue to accumulate partial
damage. A retry uses the same immutable target commits and transaction manifest.

### 12.4 Recovery boundary

Local frozen source clones remain inaccessible to public consumers during the transaction. They are
not GitHub archives, backup branches, or published tags. They remain only until all post-cutover
checks and source-to-target coverage checks pass, then are removed under a separately verified
cleanup step.

Before public mutation, recovery means abandoning staging. After source deletion, recovery means
completing or retrying the clean target publication from immutable staging; it does not republish
the obsolete histories. Legal compliance evidence follows its own protected retention rule.

## 13. Verification strategy

### 13.1 Repository contract

- schema tests accept complete current-capability records and reject status jargon, missing limits,
  duplicate slugs, invalid topics, stale homepages, and more than three public dependencies;
- render tests prove deterministic English and French README facts and social-preview inputs;
- live reconciliation proves metadata and repository names match GitHub;
- dependency reconciliation compares declared consumers with manifests and released artifacts.
- schema and projection tests lock `db-inspect` to `Libre AI Database Inspector`, reject publication
  of provisional conditional names before admission, and reject Signalement in this public contract.

### 13.2 Composition

- unit tests cover mapping, allow-list behavior, reachability, license classification, collisions,
  and unclassified paths;
- adversarial fixtures prove that test-only code, old licenses, old names, generated orphan output,
  secrets, and personal data are refused;
- each target builds and tests twice from a clean checkout with identical output digests;
- package and image consumers install only from the exact release artifacts.
- layout fixtures fail closed on unsupported package/crate boundaries, a parallel Missions feature
  hierarchy, canonical/generated contract mixing, or a product refactor without complete path proof;
- positive fixtures prove in-app Auth/Build Brief and Sessions data-rights integration, and permit
  independently justified internal boundaries only with matching consumer and reachability evidence.

### 13.3 Products

- focused tests cover the retained behavior in its new owner repository;
- API tests assert every endpoint contract explicitly;
- E2E tests exercise the public user action and its failure path;
- data-bearing products prove tenant isolation, retention, deletion, and zero-personal-data logs;
- demonstrations are tested without an authenticated account or ambient developer credentials.

### 13.4 Public experience

- first-screen comprehension is reviewed without internal architecture context;
- every claim resolves to current evidence and a material limitation;
- every quick start runs from an anonymous clean environment;
- all links, homepage URLs, previews, screenshots, language mirrors, and pinned repositories resolve;
- accessibility, keyboard use, reflow, contrast, and reduced motion pass;
- performance budgets are measured on the deployed public artifacts.

### 13.5 Transaction

- dry-run output is deterministic and contains no token, email, IP address, or secret;
- mutation refuses source drift, missing administrative permission, red checks, missing artifacts,
  unproved conditional targets, or a manifest that differs from the confirmed digest;
- each operation is idempotent or has an explicit already-applied state;
- post-cutover smoke failure blocks completion and preserves the immutable staging inputs for retry;
- a final inventory proves that only the approved target topology is public.

## 14. Execution ownership and parallelism

The migration is implemented from an isolated worktree so concurrent repository work cannot alter
the transaction tooling or manifest. Independent read-only audits may run in parallel:

- repository and branch quiescence;
- dependency and dead-code reachability;
- licenses and retained-path provenance;
- public copy, language parity, and brand projection;
- GitHub security settings and release readiness.

Target composition follows the dependency graph. Two workers never modify the same repository or
the same generated manifest. The destructive cutover has one coordinator and no parallel writers.

Every non-trivial behavior is introduced test-first. Every immutable candidate receives separate
security, quality, performance, and completeness review before merge or publication.

## 15. Non-goals

- preserving public legacy history, redirects, archive repositories, migration tags, or compatibility
  aliases;
- presenting every experimental idea as a repository;
- using stars as product-quality evidence;
- tracking individual visitors or people who star a repository;
- introducing another forge, analytics provider, hosted signing service, or US application runtime;
- redesigning product functionality unrelated to making the retained capability usable and truthful;
- publishing a conditional repository because its name is strategically attractive;
- keeping dead code for hypothetical future reuse.

## 16. Final acceptance

The migration is complete only when:

1. the owner-signed ADR and all amended authorities are merged and green;
2. the final manifest classifies all 36 observed source repositories and every retained path;
3. exactly the 14 certain targets plus the conditional targets that passed their gates are public;
4. every target has a clean signed root history and only user-consumable SemVer tags;
5. all repository, cross-repository, security, license, language, E2E, release, deployment, and smoke
   gates are green;
6. Missions is demonstrable without an account, self-hostable in one command, released with signed
   reproducible artifacts, and presented as the sole primary launch action;
7. the organization profile exposes at most six evidence-qualified pins and no stale link;
8. no source repository, obsolete branch, release, tag, archived hub, duplicate responsibility,
   public staging repository, or obsolete license remains;
9. anonymous aggregate measurement contains no personal data and cannot identify a person who
   starred or tried the project;
10. temporary source clones are removed only after coverage and post-cutover checks pass, while
    protected legal evidence follows its independently justified retention rule;
11. boundary-driven layouts pass their fail-closed acceptance tests, the Database Inspector display
    name is exact, provisional names appear only after admission, and Signalement remains outside
    this public migration with its private-first authority preserved.

No architecture question remains open. Execution-time facts are resolved by proof: current source
commits, concurrent-session quiescence, conditional-repository verdicts, licensing authority,
administrative permissions, registry availability, and deployed smoke results. Any missing proof is
a blocking failure, not a new discretionary product decision.
