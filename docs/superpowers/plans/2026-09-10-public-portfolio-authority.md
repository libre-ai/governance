# Public Portfolio Authority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace conflicting portfolio doctrine with one owner-signed authority and make every public repository fact a deterministic projection of a versioned contract.

**Architecture:** A new ADR performs bounded supersessions before any portfolio code moves. A strict repository contract then owns current actions, evidence, dependencies, metadata, language facts, and conditional admission. Renderers produce README fact blocks, the central next-proof page, organization inputs, and preview inputs without becoming second authorities.

**Tech Stack:** Bun 1.4 canary, strict TypeScript, Ajv 8, YAML, deterministic JSON/Markdown renderers, Biome.

**Spec:** `docs/superpowers/specs/2026-09-10-public-portfolio-big-bang-design.md`

## Execution ordering

Follow the coordinator plan's **Executable Dependency Order**, not packet-number order.
Local candidate implementation is authorized; it is not final admission or publication proof.
Final authority identifiers are ADR-0041/I-32/D46 after the `65fbff2` collision recheck;
ADR-0039/I-31 (private research) and ADR-0040/D45 (run-control persistence) remain intact.

## Global Constraints

- Modify doctrine only through an ADR, invariant entry, decision-register entry, and role-separated review of one immutable commit.
- Keep `governance` and `contracts` as separate authorities.
- Replace the public `project.v1` phase/percentage model; do not expose raw lifecycle tokens.
- Reject unbounded claims, status jargon, agent terminology, more than three public dependencies, more than eight topics, and unproved homepage URLs.
- Render English and French facts from one source; never translate evidence URLs, commands, digests, or version values.
- Do not mutate other repositories in this packet.
- Reconcile against `origin/main` `65fbff2`: ADR-0038, I-30, and D44 already own private-first publication. Preserve that authority and Signalement's private-first candidate status; the portfolio authority uses ADR-0041, I-32, and D46.

### Task 1: Write the bounded doctrine supersession

**Files:**
- Create: `docs/adr/0041-public-portfolio-big-bang.md`
- Modify: `docs/decisions/INVARIANTS.md`
- Modify: `docs/decisions/DECISION-REGISTER.md`
- Modify: `docs/decisions/LEXICON.md`
- Modify: `docs/architecture/TARGET.md`
- Modify: `docs/README.md`
- Modify: `AGENTS.md`
- Modify: `brand/README.md`
- Modify: `brand/README.en.md`
- Modify: `docs/adr/0033-open-verifiable-brand-system.md`
- Create: `tools/quality/check-public-portfolio-doctrine.test.ts`
- Create: `tools/quality/check-public-portfolio-doctrine.ts`
- Modify: `package.json`

**Interfaces:**
- New invariant: `I-32`, the clean public portfolio and evidence-first repository boundary.
- New decision: `D46`, the owner-authorized clean-history portfolio reconstruction.
- Gate: `bun run check:public-portfolio-doctrine`.

- [ ] Write a failing test that loads the ADR, invariants, decision register, LEXICON, brand authority, and architecture authority and asserts the new promise and topology rule are present exactly once.

```ts
test("the public portfolio has one bounded authority", async () => {
  const result = await inspectPublicPortfolioDoctrine(process.cwd());
  expect(result.promise).toBe("AI work you can verify.");
  expect(result.invariantIds).toEqual(["I-32"]);
  expect(result.decisionIds).toEqual(["D46"]);
  expect(result.conflicts).toEqual([]);
});
```

- [ ] Add negative fixtures to the test for `Possédez la fabrique.` as master promise, Workshop Gantry as active figurative direction, public migration phases, general-activation repository existence, preserved-history requirements, and `starter` as primary CTA.
- [ ] Run `bun test tools/quality/check-public-portfolio-doctrine.test.ts` and confirm failure because the inspector does not exist.
- [ ] Implement `inspectPublicPortfolioDoctrine(root: string): Promise<DoctrineInspection>` with explicit required and forbidden assertions.
- [ ] Write ADR-0041 with the seven supersession groups from the spec, unchanged controls, license-grant caveat, owner checkpoints, and rollback boundary.
- [ ] Add I-32 and D46; amend rather than erase I-11, I-16, I-23, I-29, D23, D28, D29, and D39 so the old decision remains historically legible but is not current doctrine. Do not renumber or weaken the existing private-first authority.
- [ ] Add regression tests rejecting portfolio reuse of the occupied authority identifiers or changes to Signalement's private-first publication requirements.
- [ ] Update the LEXICON with every final product name and reserve conditional names until their evidence gate passes.
- [ ] Update architecture and brand authority so `AI work you can verify.` is master promise, Evidence Signal is the direction, and the pixel bird remains unpublished until license and similarity evidence pass.
- [ ] Add `check:public-portfolio-doctrine` before brand and presentation gates in `package.json`.
- [ ] Stage all doctrine files, run the focused test, then `bun run check`.
- [ ] Commit the immutable candidate as `docs: authorize clean public portfolio reconstruction`.
- [ ] Run separate architecture, security, quality, and completeness review passes against the exact commit.
- [ ] Apply findings in a new commit and rerun every affected review.
- [ ] Present the final diff and review evidence to the owner; merge is the I-17 signature and is not delegated.

### Task 2: Define the repository contract

**Files:**
- Create: `portfolio/repository-contract.v1.schema.json`
- Create: `portfolio/repository-contract.ts`
- Create: `portfolio/repository-contract.test.ts`
- Create: `portfolio/repositories.v1.yaml`
- Create: `portfolio/validate-repositories.ts`
- Create: `portfolio/validate-repositories.test.ts`
- Create: `portfolio/fixtures/valid-repositories.v1.yaml`
- Create: `portfolio/fixtures/invalid-status-jargon.v1.yaml`
- Create: `portfolio/fixtures/invalid-unbounded-claim.v1.yaml`
- Create: `portfolio/fixtures/invalid-dependency.v1.yaml`
- Modify: `package.json`

**Interfaces:**

```ts
interface LocalizedText {
  en: string;
  fr: string;
}

interface PublicEvidence {
  label: LocalizedText;
  source: string;
  contentDigest: string;
  verifiedAt: string;
  limitation: LocalizedText;
}

interface RepositoryContractV1 {
  schemaVersion: "repository-contract.v1";
  slug: string;
  displayName: string;
  category: "use" | "build" | "trust" | "explore";
  benefit: LocalizedText;
  differentiator: LocalizedText;
  audience: LocalizedText;
  action: { label: LocalizedText; command?: string; url?: string };
  outcome: LocalizedText;
  limitation: LocalizedText;
  dependencies: string[];
  evidence: PublicEvidence[];
  topics: string[];
  homepage?: { url: string; smokeEvidence: string };
  nextProof?: { capability: LocalizedText; acceptance: string };
  admission: { kind: "certain" } | { kind: "conditional"; gate: string };
}
```

- [ ] Write schema tests for a valid certain repository and a valid conditional repository.
- [ ] Add failing cases for missing French text, `active`/`specified`/`usable` status fields, four dependencies, fewer than five or more than eight topics, HTTP links, homepage without smoke evidence, empty limitations, duplicate slugs, and product names without the `Libre AI` family form.
- [ ] Run `bun test portfolio/repository-contract.test.ts portfolio/validate-repositories.test.ts` and confirm the missing implementation failure.
- [ ] Implement strict parsing with Ajv, then semantic validation in `validateRepositoryContracts(value: unknown): ValidationResult`.
- [ ] Populate `portfolio/repositories.v1.yaml` with the 14 certain and six conditional targets from the spec. Do not mark a conditional repository admitted.
- [ ] Lock `db-inspect` to the display name `Libre AI Database Inspector`; keep all six conditional slugs and display names provisional and exclude them from public projections until their executable admission gate passes.
- [ ] Assert the source inventory contains exactly 36 public repositories. Exclude local Signalement, which has no GitHub remote, from the source inventory and public target contract; local discovery grants no publication authority.
- [ ] Add negative contract/projection tests for a different Database Inspector display name, unadmitted provisional names, or Signalement silently enrolled as a public target.
- [ ] Add repository-level checks for exactly one Missions primary CTA, at most six pin candidates, and no star CTA before evidence eligibility.
- [ ] Add `check:portfolio` to `package.json` and run the focused tests.
- [ ] Commit as `feat: add public repository contract`.

Proof content is bound by SHA-256 and an independently reviewed detached receipt.
The receipt pins the candidate/final commit externally; never embed that commit's
own SHA in its README or repository contract. Evidence artifacts may be hosted
independently of the tested root. Reverification of the final signed root produces
a new external receipt without changing the public facts or tree. The release
qualification must fetch evidence and verify its bound content digest; a URL alone
is not immutable evidence. This corrects a self-reference introduced in the local
prototype, without weakening final-root checks.

### Task 3: Render public factual projections

**Files:**
- Create: `portfolio/render-readme-facts.ts`
- Create: `portfolio/render-readme-facts.test.ts`
- Create: `portfolio/render-next-proofs.ts`
- Create: `portfolio/render-next-proofs.test.ts`
- Create: `portfolio/render-github-metadata.ts`
- Create: `portfolio/render-github-metadata.test.ts`
- Create: `portfolio/render-preview-inputs.ts`
- Create: `portfolio/render-preview-inputs.test.ts`
- Create: `portfolio/projections/readme-facts.v1.json`
- Create: `portfolio/projections/github-metadata.v1.json`
- Create: `portfolio/projections/preview-inputs.v1.json`
- Create: `docs/what-we-are-proving-next.md`
- Modify: `package.json`

**Interfaces:**

```ts
function renderReadmeFacts(contract: RepositoryContractV1, locale: "en" | "fr"): string;
function renderNextProofs(contracts: RepositoryContractV1[]): string;
function buildGitHubMetadata(contracts: RepositoryContractV1[]): GitHubRepositoryMetadata[];
function buildPreviewInputs(contracts: RepositoryContractV1[]): SocialPreviewInput[];
```

- [ ] Write golden tests proving byte-stable EN/FR facts, a single next-proof page, descriptions led by benefit, five-to-eight normalized topics, and homepage omission without smoke evidence.
- [ ] Add negative tests proving raw HTML, control characters, agent terms, internal phase identifiers, obsolete slugs, and unreviewed URLs are rejected.
- [ ] Run the four focused test files and confirm failure before implementation.
- [ ] Implement pure renderers with stable ordering and one trailing newline.
- [ ] Generate and stage all projections twice; compare their SHA-256 digests.
- [ ] Add `build:portfolio` and `check:portfolio-projections` scripts; the check regenerates in memory and compares bytes.
- [ ] Run `bun run check:portfolio-projections`, then run the canonical `bun run check`.
- [ ] Commit as `feat: generate public portfolio projections`.

### Task 4: Retire the old public card projections

**Files:**
- Modify: `ecosystem/repositories.v1.yaml`
- Modify: `ecosystem/project-cards.ts`
- Modify: `ecosystem/validate-cards.ts`
- Modify: `ecosystem/check-fleet-presentation.ts`
- Modify: `ecosystem/render-fleet-status.ts`
- Modify: `tools/presentation/render-org-readme.ts`
- Modify: `package.json`
- Delete after replacement coverage is green: `ecosystem/projections/fleet-status.v1.json`
- Delete after replacement coverage is green: `ecosystem/projections/public.v1.json`

**Interfaces:** Existing private engineering evidence may remain, but no public renderer reads lifecycle, percentage, layer, or phase fields.

- [ ] Write failing tests that detect any public renderer importing the old card/projection modules.
- [ ] Add a coverage test proving every public fact previously emitted has either a new contract field or an explicit deletion reason.
- [ ] Run the focused tests and confirm they fail on the current imports.
- [ ] Rewire public presentation checks to `portfolio/repositories.v1.yaml` and its generated projections.
- [ ] Remove obsolete public renderer code and fixtures only after import and dead-code gates prove no consumer.
- [ ] Run `bun run check` and confirm dead-code, doctrine, brand, portfolio, lint, typecheck, and all tests pass.
- [ ] Commit as `refactor: replace public project-card projections`.

### Task 5: Merge and pin the authority

**Files:**
- Create: `docs/reviews/public-portfolio-authority/<commit>/architecture.md`
- Create: `docs/reviews/public-portfolio-authority/<commit>/security.md`
- Create: `docs/reviews/public-portfolio-authority/<commit>/quality.md`
- Create: `docs/reviews/public-portfolio-authority/<commit>/completeness.md`

- [ ] Stage the complete authority candidate and run `git diff --check` plus `bun run check`.
- [ ] Create a signed commit using the registered personal GitHub signing key and noreply identity.
- [ ] Run four role-separated review passes against the immutable commit; no authoring occurs inside a review pass.
- [ ] Fix every blocking finding in a new signed commit and repeat affected reviews.
- [ ] Push the branch, open a pull request, and require all strict checks to pass.
- [ ] Present the exact doctrine diff and merge SHA to the owner for I-17 signature.
- [ ] After owner approval, merge without force-push, fetch `main`, and record the merge SHA.
- [ ] Run `bun run check` from a clean checkout of the merged SHA.

Expected final evidence:

```text
PUBLIC PORTFOLIO AUTHORITY READY: contracts=20 certain=14 conditional=6 public_projection_drift=0
```
