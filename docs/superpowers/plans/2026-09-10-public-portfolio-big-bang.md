# Libre AI Public Portfolio Big-Bang Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Libre AI public organization as a coherent, clean-history product portfolio led by Missions and publish it through one proof-gated launch.

**Architecture:** Governance owns the repository contract and migration transaction. Clean target repositories are composed from frozen source commits through reviewed allow-lists, qualified independently, staged privately, and exposed in one stop-the-world cutover. The migration GO was received on 2026-09-11; public mutation remains isolated in the final packet and requires the second confirmation of the exact destructive manifest.

**Tech Stack:** Bun 1.4 canary, strict TypeScript, JSON Schema/Ajv, Git, GitHub API/GraphQL, Cargo/Rust 1.97 where retained, Playwright, OCI, SBOM/provenance signing, Clever Cloud Paris/EU.

**Spec:** `docs/superpowers/specs/2026-09-10-public-portfolio-big-bang-design.md`

## Global Constraints

- Decision order is Security > Quality > Performance > Completeness.
- English is canonical; public README facts have a complete generated French mirror.
- Public copy contains no internal phase, layer, work-package, migration, or agent terminology.
- The master promise is `AI work you can verify.` and Missions owns the only primary star request.
- The portfolio has 14 certain targets and no more than six proof-gated conditional targets.
- The observed public source inventory is exactly 36 repositories. Local Signalement has no GitHub remote, remains a private-first candidate, and is excluded from this source inventory, public target contract, and cutover.
- Portfolio authority uses ADR-0041, I-32, and D46. At current `origin/main` `65fbff2`, ADR-0038, I-30, and D44 already own private-first publication and remain unchanged.
- `db-inspect` displays as `Libre AI Database Inspector`; all six conditional slugs/display names remain provisional until executable admission passes.
- Layouts follow proven boundaries: integrate Auth/Build Brief into the existing Missions application and `rgpd-kit` into Sessions; separate canonical contracts from generated TypeScript/Rust projections; retain internal packages/crates only with consumer and reachability proof.
- Code has no target unless it is shipped, contracted, or consumed; tests alone do not retain code.
- Target code is Apache-2.0 only after rights verification; documentation is CC-BY-4.0; media has an explicit reviewed license.
- Public target repositories start from signed clean root commits and import no source history.
- Only immutable user-consumable SemVer release tags are allowed.
- No force-push, archive repository, compatibility alias, backup branch, or public migration tag is created.
- Zero secrets or personal data in logs, fixtures, generated manifests, READMEs, issues, or releases.
- GitHub is the public-code forge exception; runtime data, runners, caches, and signing material remain in the EU.
- No public source is deleted, renamed, recreated or has visibility changed before the exact destructive confirmation; private staging under the acquired GO follows its own verified prerequisites.

## Execution Packets

The program is split because each packet has a distinct failure boundary and can be reviewed without approving its neighbors.

| Order | Plan | Independently testable result | Remote mutation |
| --- | --- | --- | --- |
| 1 | `2026-09-10-public-portfolio-authority.md` | Owner-signed doctrine, repository contract, deterministic public projections | Governance PR/merge only after owner review |
| 2 | `2026-09-10-public-portfolio-composition.md` | Frozen-source audit, conditional verdicts, clean target trees and root commits | None |
| 3 | `2026-09-10-public-portfolio-surfaces.md` | Qualified READMEs, previews, website, profile, and Missions conversion path in staging trees | None |
| 4 | `2026-09-10-public-portfolio-security-release.md` | Portable CI, EU runner proof, signed packages/images, deterministic GitHub settings payloads | Registry candidates only under their own release gates; no GitHub cutover |
| 5 | `2026-09-10-public-portfolio-cutover.md` | Private staging, destructive confirmation, public cutover, smoke, cleanup | GO received 2026-09-11; destructive/public mutation blocked on exact-manifest confirmation |

## Executable Dependency Order (reconciled 2026-09-11)

The approved design and A/A remain binding. The execution base integrates `65fbff2`
and all three approved planning commits without rewriting source work. ADR-0039/I-31
now own private product research; ADR-0040/D45 own run-control persistence. The
portfolio candidate therefore uses ADR-0041/I-32/D46. Neither prior authority changes.

Packet numbers are ownership groups, not a topological execution order:

| Stage | Requires | Produces | External effects |
| --- | --- | --- | --- |
| source-reconciliation | observed source state | reviewed integration/disposition, preserved private work | read-only inventory; source integration separately reviewed |
| authority-candidate | current main plus approved design | A1–A4 tested local candidate | none |
| tooling | approved design | tested manifest, composer, gates and transaction code | none |
| authority-signature | reviewed authority-candidate | A5 owner-signed authority | exact authority PR/merge |
| source-freeze | source-reconciliation, authority-signature | C1 immutable reconciled inputs | none |
| path-audit | source-freeze, tooling | C2–C4 consumer/path/rights evidence | none |
| candidate-build | path-audit | C6 local allow-listed candidates, S/R implementation | none |
| local-qualification | candidate-build | local package, product, security and conditional assertions | none |
| release-publication | local-qualification, release authorization | R4/R5 immutable registry artifacts | exact repository-local release only |
| registry-qualification | release-publication | real anonymous install/compile/run evidence | read-only |
| conditional-admission | local-qualification, registry-qualification where required | C5 six final immutable verdicts | none |
| final-roots | conditional-admission, S/R tree completion | two identical compositions; signed parentless roots | none |
| staging-preflight | final-roots, permissions, signer and EU runner proofs | X1 local/pre-staging report | none |
| private-staging | staging-preflight | X2 exact private names, OIDs and applied settings | GO-authorized private staging only |
| private-qualification | private-staging | complete private-clone and live GitHub proofs | private CI and reads |
| final-preflight | private-qualification, registry-qualification, final source recheck | final PROGRAM READY and X3 exact manifest | none |
| destructive-confirmation | final-preflight | owner response bound to exact digest/list | none |
| public-cutover | destructive-confirmation | X4–X6 immutable transaction, smoke and closure | serial exact operations |

A candidate is not an admitted public repository. Local qualification can construct a
conditional candidate to obtain its missing proof, but cannot emit public names,
final staging or an admission verdict. The authorization crate's real registry proof
follows authorized publication under its existing artifact identity; it does not
publish a provisional repository brand. Missing release authorization leaves admission
pending, not rejected for lack of access and not admitted through a local substitute.
A technically rejected candidate follows the design's failure disposition and returns
to path-audit before rebuilding its receiving target.

S/R source edits finish before the final parentless root is signed. Commits used during
candidate development remain local engineering history and never become target parents.
Release subjects bind the exact packaged bytes; changes to their inputs invalidate
release evidence and require new qualification. No post-proof tree mutation is accepted.

The stage DAG is implemented in `tools/migration/execution-order.ts` with tests for
missing producers, cycles, unknown stages, local-versus-final prerequisite order, and unsafe
publication/staging order. It validates prerequisites; it does not authorize mutations.
`verify-program --phase local` can report local readiness only. Final readiness requires
actual registry, private GitHub and source recheck evidence and is evaluated after X2.

## Worktree and Worker Ownership

Use the existing clean coordinator worktree with current `governance/main` merged into the approved design branch; verify both histories are reachable. Never choose a base that drops the approved spec. Give each mutable target repository to exactly one worker. A worker may own several repositories, but two workers never write the same repository or migration run directory.

Recommended independent ownership after all existing sessions have ended:

1. **Authority worker:** governance ADR, repository contract, validators, projections, and migration schemas.
2. **Composition worker:** source freeze, allow-lists, licensing evidence, clean targets, and conditional gates.
3. **Product/surface worker:** Missions, product READMEs, app-kit brand realization, website, and organization profile.
4. **Security/release worker:** workflows, runners, signing, registries, GitHub setting payloads, and smoke harness.

The coordinator alone owns the final transaction manifest and cutover command. Workers submit immutable commits and evidence; they do not mutate final GitHub repository names.

## Program Gates

- [ ] Read the approved spec and all five packet plans in full.
- [ ] Re-fetch `governance/main`; fail if the approved spec commit is not reachable from the execution base.
- [ ] List all local and remote worktrees, branches, pull requests, and running automation sessions.
- [ ] Stop if any source repository has concurrent mutable work.
- [ ] Execute packet 1 and obtain the owner-signed doctrine merge.
- [ ] Execute composition and surfaces in the stage order above, retaining the exact authority binding.
- [ ] Complete security/release edits before final root signing; execute remote proof after its producer exists.
- [ ] Run the program acceptance command:

```bash
bun tools/migration/verify-program.ts --run-dir "$MIGRATION_RUN_DIR"
```

Expected final line after private staging qualification and before destructive confirmation:

```text
PROGRAM READY: sources=36 targets=14..20 unclassified=0 red_gates=0 pending_public_mutations=0
```

- [x] Record the owner's migration GO received on 2026-09-11; do not request it again.
- [ ] Execute X1 staging preflight and X2 before final program acceptance; stop at X3 exact-digest/deletion-list confirmation before destructive/public mutation.

## Program Acceptance

The program is prepared, but not launched, when:

1. packet plans 1–4 have immutable green commits and evidence;
2. every source path has a target or reviewed deletion disposition;
3. all six conditional repositories have executable pass/fail verdicts;
4. every target repository passes its local, integration, E2E, license, personal-data, secret, and clean-room gates;
5. Missions passes the anonymous demo, self-host, authorization, release, and rollback proofs;
6. GitHub settings, registry publications, website, organization profile, topics, descriptions, previews, and pins have deterministic payloads;
7. the signing identity and required GitHub scopes are available without exposing credentials;
8. final transaction planning reports zero public mutations; authorized private staging and release receipts are recorded separately;
9. layout acceptance rejects unsupported package boundaries, a parallel Missions feature hierarchy, mixed canonical/generated contracts, or unproved product refactors; provisional names and Signalement cannot enter public projections without their applicable authority.

## Commit Policy

Each task ends in a focused English commit without co-author trailers. Published candidates must be signed by the personal GitHub identity's registered signing key and use its GitHub-provided noreply address. An unsigned local planning commit is not eligible for merge or cutover evidence.

## Stop Conditions

Stop immediately on any source drift, unreviewed branch, ambiguous file disposition, uncertain relicensing authority, missing required attribution, secret or personal-data finding, unsigned target commit, unavailable registry artifact, failing anonymous install, missing GitHub administrative scope, stale domain smoke, or transaction-manifest digest mismatch.

These are proof failures, not prompts to weaken the gate.
