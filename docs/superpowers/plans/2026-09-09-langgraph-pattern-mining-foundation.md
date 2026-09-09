# LangGraph Pattern-Mining Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record the approved LangGraph boundary as a reviewable ADR and add a strictly non-normative, pinned pattern-and-failure catalogue to `orchestrator` with an executable structural gate.

**Architecture:** `governance` records the owner-approved boundary without changing a locked contract. `orchestrator` owns the research catalogue because it owns the product questions; a pure TypeScript validator proves only catalogue structure and anti-authority constraints, never the truth of upstream behavior. Contract and runtime work remain closed until this foundation receives role-separated review and owner ratification.

**Tech Stack:** Markdown, JSON, Bun 1.4.0, strict TypeScript, `bun:test`, Biome.

**Spec:** `docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md`

**Scope Boundary:** This is the first independently reviewable sub-project from the approved programme. Contract candidates, SDK projections, native graph execution, Missions decisions, harness effects and the second-worker proof each receive a separate implementation plan after ADR-0032 ratification; beginning any of them inside this plan would bypass the hard owner gate.

## Global Constraints

- Security > quality > performance > completeness.
- LangGraph is a research provenance and failure-scenario oracle, never an authority or implicit specification.
- No LangGraph, LangChain, LangSmith or managed-service dependency enters any runtime or lockfile in this increment.
- No locked contract is edited; `execution-plan-body.v1` and `orchestrator-event.v2` remain byte-identical.
- The catalogue pins `langchain-ai/langgraphjs` at `c6910a9ec1c2a84b76fb79b091b0f697a567e027` and records its MIT licence.
- The validator logs only closed structural finding codes and catalogue-relative JSON paths, never source payloads.
- English for code and commit messages; French for doctrine and product-facing research documentation.
- Every non-trivial validation rule follows red-green TDD.

---

### Task 1: Record the approved architecture without opening contracts

**Repository:** `libre-ai/governance`

**Files:**

- Modify: `docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md:4`
- Create: `docs/adr/0032-langgraph-pattern-mining-boundary.md`
- Modify: `docs/decisions/DECISION-REGISTER.md`

**Interfaces:**

- Consumes: the owner approval of the design recorded on 2026-09-09 and authority split from RFC-0001/ADR-0004.
- Produces: proposed ADR-0032 and register entry D38; neither grants contract lock or runtime capability before owner ratification by merge.

- [ ] **Step 1: Mark the design as owner-approved**

Replace the status metadata with:

```markdown
- **Statut :** design approuvé par le propriétaire en session le 2026-09-09 ; l'ADR et toute évolution contractuelle restent soumis à leurs propres revues et gates
```

- [ ] **Step 2: Write ADR-0032**

Create an ADR whose decision section contains these five closed decisions:

```markdown
### D1 — LangGraph est une source de recherche non normative

Les capacités, incidents et comportements observés sont reformulés en questions
neutres et scénarios adversariaux. Une sortie amont ne décide jamais d'une
sémantique Libre AI.

### D2 — Aucune autorité ni dépendance implicite

Missions, Orchestrator, Harness et Proof/Artifact conservent leurs autorités.
Aucun type LangGraph/LangChain/LangSmith n'entre dans un contrat canonique.

### D3 — Deux graphes séparés

Un éventuel graphe autorisé, grossier et digéré, appartient à l'Orchestrateur ;
le graphe interne d'un worker reste opaque et sans droit d'étendre le plan.

### D4 — Services managés exclus

LangSmith, Agent Server, télémétrie de contenu et checkpointer externe sont hors
cible. Un worker expérimental reste local, confiné et remplaçable.

### D5 — Promotion par preuves indépendantes

Toute promotion suit provenance, question neutre, carte d'autorité, menace,
sémantique indépendante, contrats candidats, vecteurs adversariaux, réalisation
native et test de retrait du worker. Les locks existants restent immuables.
```

The header must state `proposed — owner approved the design on 2026-09-09; ratification is the owner merge after role-separated review`. Consequences must explicitly close contract/runtime implementation until that ratification.

- [ ] **Step 3: Add register entry D38**

Add one row after D37:

```markdown
| D38 | LangGraph is a non-normative pattern and failure oracle, never an authority | ADR-0032 keeps every framework type outside canonical contracts, separates the authorized Orchestrator graph from opaque worker reasoning, excludes managed LangGraph/LangSmith services, and requires independent threats, contracts, vectors and worker-removal proof before promotion; no existing lock or runtime capability is opened by this decision |
```

- [ ] **Step 4: Verify the doctrine diff**

Run:

```bash
git add docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md docs/adr/0032-langgraph-pattern-mining-boundary.md docs/decisions/DECISION-REGISTER.md
git diff --cached --check
bun run check
```

Expected: exit 0; the existing three Biome warnings may remain, but no warning may name a changed file.

- [ ] **Step 5: Commit the proposed doctrine**

```bash
git commit -m "docs: record LangGraph pattern-mining boundary"
```

---

### Task 2: Define the research-catalogue validator with failing tests

**Repository:** `libre-ai/orchestrator`

**Files:**

- Create: `tools/quality/orchestration-pattern-catalog.ts`
- Create: `tools/quality/orchestration-pattern-catalog.test.ts`

**Interfaces:**

- Consumes: an `unknown` parsed JSON value.
- Produces: `validatePatternCatalog(value: unknown): readonly CatalogFinding[]` and `CatalogFinding { readonly code: CatalogFindingCode; readonly path: string }`.

- [ ] **Step 1: Write validation tests first**

Use this minimal valid fixture and mutation table:

```ts
import { describe, expect, test } from "bun:test";
import {
  type CatalogFindingCode,
  validatePatternCatalog,
} from "./orchestration-pattern-catalog";

const validCatalog = {
  schemaVersion: "libre-ai.orchestration-pattern-catalog.v1",
  status: "research-non-normative",
  sources: [
    {
      id: "langgraph-js",
      repository: "https://github.com/langchain-ai/langgraphjs",
      revision: "c6910a9ec1c2a84b76fb79b091b0f697a567e027",
      license: "MIT",
      studiedAt: "2026-09-09",
    },
  ],
  patterns: [
    {
      id: "effect-crash-window",
      sourceId: "langgraph-js",
      upstreamSurfaces: ["persistence"],
      question: "How is a committed effect distinguished from a lost result?",
      authorities: ["orchestrator", "harness"],
      currentState: "insufficient",
      disposition: "candidate",
      candidateContracts: ["effect-attestation.v1"],
      failureScenarios: ["effect committed before result persistence"],
    },
  ],
} as const;

function codes(value: unknown): readonly CatalogFindingCode[] {
  return validatePatternCatalog(value).map((finding) => finding.code);
}

describe("orchestration pattern catalogue", () => {
  test("accepts a pinned non-normative catalogue", () => {
    expect(validatePatternCatalog(validCatalog)).toEqual([]);
  });

  test.each([
    ["catalog.schema-version", { ...validCatalog, schemaVersion: "v2" }],
    ["catalog.status", { ...validCatalog, status: "canonical" }],
    [
      "catalog.source-revision",
      { ...validCatalog, sources: [{ ...validCatalog.sources[0], revision: "main" }] },
    ],
    [
      "catalog.framework-contract-leak",
      {
        ...validCatalog,
        patterns: [
          { ...validCatalog.patterns[0], candidateContracts: ["langgraph-checkpoint.v1"] },
        ],
      },
    ],
    [
      "catalog.failure-scenario-missing",
      { ...validCatalog, patterns: [{ ...validCatalog.patterns[0], failureScenarios: [] }] },
    ],
  ] satisfies readonly (readonly [CatalogFindingCode, unknown])[])(
    "returns %s without reflecting rejected values",
    (expected, value) => expect(codes(value)).toContain(expected),
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun test tools/quality/orchestration-pattern-catalog.test.ts
```

Expected: FAIL because `./orchestration-pattern-catalog` does not exist.

- [ ] **Step 3: Implement the closed validator surface**

Define the closed types exactly:

```ts
export type CatalogFindingCode =
  | "catalog.not-object"
  | "catalog.schema-version"
  | "catalog.status"
  | "catalog.sources"
  | "catalog.patterns"
  | "catalog.source-id"
  | "catalog.source-duplicate"
  | "catalog.source-repository"
  | "catalog.source-revision"
  | "catalog.source-license"
  | "catalog.source-studied-at"
  | "catalog.pattern-id"
  | "catalog.pattern-duplicate"
  | "catalog.pattern-source"
  | "catalog.question"
  | "catalog.authority"
  | "catalog.current-state"
  | "catalog.disposition"
  | "catalog.candidate-contract"
  | "catalog.framework-contract-leak"
  | "catalog.failure-scenario-missing";

export interface CatalogFinding {
  readonly code: CatalogFindingCode;
  readonly path: string;
}

export function validatePatternCatalog(value: unknown): readonly CatalogFinding[];
```

Implementation rules:

- accept only plain JSON objects and arrays;
- require exact `schemaVersion` and `status` constants;
- require at least one unique source and one unique pattern;
- require source revisions matching `^[0-9a-f]{40}$`, licence `MIT`, repository matching `^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$` and ISO date `YYYY-MM-DD`;
- require pattern identifiers matching `^[a-z][a-z0-9-]{2,63}$`;
- require questions ending in `?`;
- accept authorities only from `missions`, `orchestrator`, `harness`, `proof-artifact`, `worker-internal`;
- accept current state only from `covered`, `partial`, `insufficient`, `missing`, `intentionally-refused`, `worker-internal`;
- accept disposition only from `candidate`, `investigate`, `refused`, `worker-internal`;
- require at least one failure scenario;
- reject `langgraph`, `langchain` or `langsmith`, case-insensitively, in every `candidateContracts` item;
- return only code and JSON path; never copy a rejected value into a finding.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
bun test tools/quality/orchestration-pattern-catalog.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Add completeness and non-reflection cases**

Add explicit tests for duplicate source/pattern IDs, missing source references, every closed enum, malformed nested values, and this assertion:

```ts
test("findings never reflect rejected content", () => {
  const secret = "do-not-reflect-this-value";
  const findings = validatePatternCatalog({ ...validCatalog, status: secret });
  expect(JSON.stringify(findings)).not.toContain(secret);
});
```

- [ ] **Step 6: Re-run focused tests**

Run `bun test tools/quality/orchestration-pattern-catalog.test.ts`.

Expected: all tests pass with every finding-code branch exercised.

---

### Task 3: Publish the pinned non-normative catalogue and wire its gate

**Repository:** `libre-ai/orchestrator`

**Files:**

- Create: `docs/research/orchestration-patterns/README.md`
- Create: `docs/research/orchestration-patterns/catalog.v1.json`
- Modify: `tools/quality/orchestration-pattern-catalog.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: `validatePatternCatalog()` from Task 2 and the pinned LangGraph.js source.
- Produces: `bun run check:pattern-catalog`, which exits 0 only for a structurally valid research catalogue and prints finding codes/paths only on refusal.

- [ ] **Step 1: Add a failing CLI integration test**

Append a test that writes invalid JSON to a temporary file and invokes an exported async boundary:

```ts
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkPatternCatalogFile } from "./orchestration-pattern-catalog";

test("file gate refuses malformed JSON with a closed code", async () => {
  const directory = await mkdtemp(join(tmpdir(), "libre-ai-pattern-catalog-"));
  try {
    const path = join(directory, "catalog.json");
    await writeFile(path, "{");
    expect(await checkPatternCatalogFile(path)).toEqual([
      { code: "catalog.invalid-json", path: "/" },
    ]);
  } finally {
    await rm(directory, { recursive: true });
  }
});
```

Extend `CatalogFindingCode` with `"catalog.invalid-json"` and export:

```ts
export async function checkPatternCatalogFile(path: string): Promise<readonly CatalogFinding[]>;
```

- [ ] **Step 2: Run the focused test and verify RED**

Run `bun test tools/quality/orchestration-pattern-catalog.test.ts`.

Expected: FAIL because `checkPatternCatalogFile` is absent.

- [ ] **Step 3: Implement the file and CLI boundary**

Use `await Bun.file(path).text()`, catch parse failure as `catalog.invalid-json`, and add:

```ts
if (import.meta.main) {
  const findings = await checkPatternCatalogFile(
    "docs/research/orchestration-patterns/catalog.v1.json",
  );
  for (const finding of findings) console.error(`${finding.code} ${finding.path}`);
  if (findings.length > 0) process.exit(1);
  console.log("Orchestration pattern catalogue verified");
}
```

- [ ] **Step 4: Create the catalogue documentation**

The README must state inline:

```markdown
Ce répertoire porte des preuves de recherche, pas de la doctrine, un contrat
canonique ou une dépendance runtime. Les noms amont n'apparaissent que dans la
provenance et les surfaces observées. Toute promotion exige une question neutre,
une carte d'autorité Libre AI, un threat model, une sémantique indépendante, des
vecteurs écrits rouges et une évolution contractuelle revue par le propriétaire.
Supprimer ce répertoire ne change aucune sémantique de mission ou de run.
```

Document the validator's structural guarantee and its limit: it cannot prove that a source description is accurate or that a proposed pattern is desirable.

- [ ] **Step 5: Create the initial catalogue**

Create ten entries with these exact IDs and at least the named failure scenarios:

```text
authorized-graph-topology       graph changed after quorum
canonical-replay               worker checkpoint unavailable during restart
typed-human-decision           stale answer resumes a different attempt
step-retry-identity             committed effect repeated after lost result
deterministic-fan-in            arrival order changes merged result
attenuated-child-budget        child allocations exceed parent reservation
safe-stream-projection         raw worker message reaches operational logs
read-only-run-fork              fork mutates canonical event history
long-term-memory-authority      deleted content returns after restore
dynamic-routing-authorization  non-deterministic route widens approved plan
```

Use only the four canonical authorities plus `worker-internal`. Mark `read-only-run-fork` and `long-term-memory-authority` as `refused`, and ensure their `candidateContracts` arrays are empty. Mark internal checkpoint details `worker-internal`, not canonical.

- [ ] **Step 6: Wire the gate**

Add to `package.json`:

```json
"check:pattern-catalog": "bun run check:bun:runtime && bun tools/quality/orchestration-pattern-catalog.ts"
```

Insert `bun run check:pattern-catalog` into `check` after `check:memory-draft-sync` and before `lint`.

- [ ] **Step 7: Run focused and full proof**

Run:

```bash
bun test tools/quality/orchestration-pattern-catalog.test.ts
git add package.json tools/quality/orchestration-pattern-catalog.ts tools/quality/orchestration-pattern-catalog.test.ts docs/research/orchestration-patterns/README.md docs/research/orchestration-patterns/catalog.v1.json
git diff --cached --check
bun run check
cargo test --locked --all-features
```

Expected: all commands exit 0; no dependency or lockfile diff exists.

- [ ] **Step 8: Commit the research foundation**

```bash
git commit -m "feat: gate non-normative orchestration pattern research"
```

---

### Task 4: Produce immutable role-separated review evidence

**Repositories:** `libre-ai/governance`, `libre-ai/orchestrator`

**Files:**

- Create: `docs/reviews/langgraph-pattern-mining/foundation-architecture.md` in `governance`
- Create: `docs/reviews/langgraph-pattern-mining/foundation-security.md` in `governance`
- Create: `docs/reviews/langgraph-pattern-mining/foundation-privacy.md` in `governance`
- Create: `docs/reviews/langgraph-pattern-catalog/foundation-quality.md` in `orchestrator`
- Create: `docs/reviews/langgraph-pattern-catalog/foundation-security.md` in `orchestrator`

**Interfaces:**

- Consumes: immutable commits from Tasks 1 and 3, full diffs, tests and relevant doctrine.
- Produces: role-labelled verdicts `accept`, `reject` or `accept-with-reservations`, with findings carrying severity, exact file/line evidence and required remediation.

- [ ] **Step 1: Freeze review subjects**

Run in each worktree:

```bash
git rev-parse HEAD
git status --short
```

Expected: a full 40-character subject SHA and clean worktree.

- [ ] **Step 2: Architecture review pass**

Review only authority singularity, reversibility, compatibility and cross-repo feasibility. The document must answer explicitly:

```text
Can deleting every LangGraph research artefact leave all canonical semantics unchanged?
Can a worker checkpoint ever reconstruct state not present in Orchestrator events?
Does any proposed contract mutate a locked major in place?
```

- [ ] **Step 3: Security review pass**

Review anti-injection, effect ambiguity, tenant isolation, retry, logs and managed-service exclusion. Verify the catalogue validator never reflects rejected strings.

- [ ] **Step 4: Privacy review pass**

Review streaming classes, checkpoint retention, restore non-resurrection and the zero-PII operational-log boundary.

- [ ] **Step 5: Quality review pass**

Review strict types, branch coverage, deterministic findings, lockfile stability and whether the gate claims only structure.

- [ ] **Step 6: Remediate every blocking or major finding**

For each remediation, add or change a test first when logic changes, rerun the focused gate, commit, and restart the affected role review against the new immutable SHA. No review of an obsolete SHA counts.

- [ ] **Step 7: Commit review dossiers and run both full gates**

Use descriptive commits without co-author trailers, then run `bun run check` in both repositories and `cargo test --locked --all-features` in `orchestrator`.

Expected: all commands exit 0 and every final role verdict is `accept`.

---

### Task 5: Stop at the owner ratification gate

**Repository:** `libre-ai/governance`

**Files:** none before the decision.

**Interfaces:**

- Consumes: ADR-0032 exact SHA, D38 diff, architecture/security/privacy verdicts and green command evidence.
- Produces: one owner decision: ratify by merge, request remediation, or reject the ADR. It does not authorize contract lock or runtime capability.

- [ ] **Step 1: Restitute the decision inline**

Present a 2–4 line summary of what ADR-0032 changes, what remains closed, the immutable SHA and every review verdict. Do not point to files without reproducing the decision-relevant content.

- [ ] **Step 2: Request the owner verdict**

Stop and request a structured decision. The recommended option is ratification only if every required verdict is `accept` and both full gates are green. No contract plan begins before that answer.
