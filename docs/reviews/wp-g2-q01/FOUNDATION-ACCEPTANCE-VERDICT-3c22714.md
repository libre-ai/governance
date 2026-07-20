# WP-G2-Q01 Foundation Acceptance Verdict

**Gate:** `g2-foundation-acceptance`  
**Commit:** `3c22714` (fix(harness): directory-aware gate check + Q01 reference-chain evidence)  
**Date:** 2026-07-20  
**Reviewer:** Independent adversarial reviewer (K4, not the implementer)  
**Model:** Claude Haiku 4.5

---

## Verdict

**REJECT**

Three blocking findings prevent acceptance of criterion 1 (reference-chain evidence). The PR introduces working tooling (gates Q2, Q5; harness framework Q1), but the delivered evidence falsely claims criterion 1 satisfied when Playwright is absent from the chain, and the harness cannot currently run end-to-end.

---

## Blocking Findings

### Q-01-BLOCKING-1: Criterion 1 criterion "exercises Playwright" not implemented

**Severity:** Blocking  
**Angle:** Completeness vs. acceptance claim  
**Constat:** Acceptance criterion 1 is locked as: _"A clean checkout exercises Bun.serve, React, contracts, RLS, Biscuit, WIT, Proof, Artifact and Playwright."_

The reference-chain harness (verification/harness/reference-chain.ts, lines 87–129) declares nine ordered steps:

- contracts, generated-contracts, web-react, biscuit, wit, proof-artifact, secret-scan, no-clever, rls

**Playwright is not present as a step.** The "web-react" step runs only `bun test packages/web-platform`, which executes unit tests in TypeScript, not Playwright end-to-end tests.

The evidence file (distribution/evidence/wp-g2-q01-reference-chain-2026-07-20.md) reports 9 steps with status "passed" and claims acceptance criterion 1 satisfied. This is impossible — the criterion explicitly requires Playwright.

**Proof:**

- Harness code: no `.playwright.`, no Playwright config, no browser launch
- packages/web-platform: single .test.tsx file, no playwright.config.ts
- GAP-ANALYSIS explicitly marks "G-Q3 — Gate accessibilité (exists for Notebook via Playwright; acceptance Q01 wants it as shared gate)" as deferred beyond D01 merge
- Execution order in GAP: G-Q5, G-Q2 → G-Q4, G-Q1 → G-Q3. Playwright (G-Q3) is last, not included in G-Q1.

**Correction:** Either (a) add a Playwright step to the harness and re-run, or (b) retract criterion 1 claim and mark it as "passed-with-skips" (G-Q3 deferred).

---

### Q-02-BLOCKING-2: Harness cannot run end-to-end; Bun version insufficient

**Severity:** Blocking  
**Angle:** Reproducibility & gate execution  
**Constat:** The reference-chain harness was executed locally (verification/harness/reference-chain.ts as main). The first two steps immediately fail:

```
=== reference-chain: contracts — Contracts + generated projections ===
Bun 1.3.11 is unsupported; Libre AI requires Bun >=1.4.0
error: script "check:bun:runtime" exited with code 1
```

The Bun canary bundled with this system is version 1.3.11, which is below the minimum 1.4.0 enforced by tools/quality/check-bun-minimum.ts. The harness depends on check:bun:runtime as a prerequisite for contracts and generated-contracts steps.

**Proof:**

- Check fails immediately: `bun tools/quality/check-bun-minimum.ts` from any step
- Harness design includes check:bun:runtime in the contracts command
- No override mechanism exists to skip Bun version check

**Correction:** Update Bun to >=1.4.0 before re-running the harness. The evidence digest `fbf566f7...` is theoretically reproducible, but it cannot be verified against a live run on the locked system state.

---

### Q-03-BLOCKING-3: Evidence reports "passed" for criterion 1 without Playwright (false claim)

**Severity:** Blocking  
**Angle:** Integrity of acceptance evidence  
**Constat:** The file distribution/evidence/wp-g2-q01-reference-chain-2026-07-20.md states:

- **Status:** `passed`
- Table shows 9 steps, none labeled Playwright
- Claims: "reference-chain (acceptance criterion 1) run end-to-end... Reference chain passed — digest …"

This is factually false. Acceptance criterion 1 explicitly requires Playwright. The evidence lists the steps executed, and Playwright is not among them. Reporting "passed" for a criterion that explicitly requires an absent component is an untruth about gate satisfaction.

**Proof:**

- work-packages.v1.json criterion 1: "exercises … Playwright" (explicit requirement)
- Evidence table: lists 9 steps, Playwright not present
- Evidence summary: "passed" (contradicts the missing Playwright step)

**Correction:** Either:

1. Add Playwright step to harness, re-execute, generate new evidence, or
2. Mark evidence as "passed-with-skips" and explicitly list skipped steps (G-Q3/Playwright)

---

## Major Findings

### Q-04-MAJOR-1: Scope violation – package.json modified outside writePaths

**Severity:** Major  
**Angle:** Scope & authority  
**Constat:** WP-G2-Q01 declares writePaths: `[".github/workflows/**", "tools/quality/**", "verification/harness/**"]`

The diff modifies package.json (lines 45, 71) to add two new scripts:

```json
"check:no-clever-production": "bun run check:bun:runtime && bun tools/quality/check-no-clever-production.ts",
"check:secret-scan": "bun run check:bun:runtime && bun tools/quality/check-secret-scan.ts",
```

These scripts are integrated into the "check" target, which is a root-level orchestration change. **package.json is not under writePaths.** Only WP-G2-T01 (Production toolchain) is authorized to modify package.json.

This violates the bounded-context isolation rule: a WP must not modify authorities or orchestration outside its declared writePaths, even if the change is logically necessary.

**Proof:** `git diff 43c85e7..3c22714 -- package.json` (2 lines added to scripts, not in writePaths)

**Correction:** Either (a) add "package.json" to writePaths in work-packages.v1.json before merge (requires governance review), or (b) move script definitions to a separate configuration file within writePaths (e.g., tools/quality/scripts.json) and document the workaround.

---

### Q-05-MAJOR-2: Scope violation – distribution/evidence/* written outside writePaths

**Severity:** Major  
**Angle:** Scope & authority  
**Constat:** The diff introduces two new files in distribution/evidence/:

- distribution/evidence/wp-g2-q01-reference-chain-2026-07-20.md (new)
- distribution/evidence/gate-acceptance-log.md (modified)

writePaths does not include "distribution/**". These are non-normative evidence artifacts, and the gate-acceptance-log is a shared registry. Writing them from within Q01 without explicit writePath scope creates a hidden cross-WP coupling: future WPs cannot modify gate-acceptance-log without coordinating with Q01.

Evidence files are correctly excluded from secret/provisioning scanners (IGNORED_SUBSTRINGS = ["/evidence/"]), but the write authority boundary is not enforced.

**Proof:**

- `git diff 43c85e7..3c22714 -- distribution/evidence/`
- work-packages.v1.json writePaths for Q01: no "distribution/**"

**Correction:** Treat distribution/evidence/* as artifacts generated during the gate execution (g2-foundation-acceptance), not as files committed by Q01 itself. Update the verdict document (this one) to reflect the actual evidence digest, do not merge evidence files into the PR.

---

## Minor Findings

### Q-06-MINOR-1: Documentation gap – GAP-ANALYSIS marks G-Q3 deferred, but Q1 acceptance claims full Playwright

**Severity:** Minor (consistency)  
**Angle:** Doctrine & communication  
**Constat:** The GAP-ANALYSIS document (lines 45–55) correctly identifies G-Q3 (accessibility/Playwright gate) as **not implemented** in this PR:

> "Restent gated derrière le merge D01: … **G-Q3** (accessibilité foundation) …"

Yet the work-packages.v1.json acceptance criterion 1 is locked as _requiring_ Playwright. The PR does not raise an exception or formally request a split of the criterion (e.g., "criterion 1a: Bun, React, contracts, RLS, Biscuit, WIT, Proof, Artifact" / "criterion 1b: Playwright").

This creates an inconsistency in the record: the implementation (GAP-ANALYSIS) and the requirements (acceptance) do not align. A reader of work-packages.v1.json will expect Playwright in Q01; a reader of the PR will not find it.

**Proof:** GAP-ANALYSIS lists G-Q3 deferred; acceptance criterion 1 includes Playwright.

**Correction:** Formally propose an amendment to acceptance criterion 1 (via governance, ADR, or gate modification) to defer Playwright to G-Q3, OR implement Playwright in Q01 before merge.

---

## Verification Summary

| Finding         | Angle                | Verdict                                                |
| --------------- | -------------------- | ------------------------------------------------------ |
| Q-01-BLOCKING-1 | Completeness         | Playwright not in harness, contradicts criterion 1     |
| Q-02-BLOCKING-2 | Reproducibility      | Bun 1.3.11 < 1.4.0, harness cannot run                 |
| Q-03-BLOCKING-3 | Evidence integrity   | "passed" claimed without Playwright                    |
| Q-04-MAJOR-1    | Scope boundary       | package.json out of writePaths                         |
| Q-05-MAJOR-2    | Scope boundary       | distribution/evidence/* out of writePaths              |
| Q-06-MINOR-1    | Doctrine consistency | GAP-ANALYSIS defers Playwright, acceptance includes it |

---

## Recommendation

**Do not merge PR #132 until:**

1. **Resolve criterion 1 scope:** Formally decide whether Playwright is part of Q01 (add harness step + re-run) or defer to G-Q3 (amend acceptance).
2. **Update Bun environment:** Verify local Bun >=1.4.0, re-execute harness, regenerate evidence digest.
3. **Fix writePaths violations:** Move package.json changes to T01 scope or establish evidence-artifact boundary and exclude from WP commits.
4. **Resubmit evidence:** Once harness runs end-to-end, commit only the code (no evidence files); evidence is verified at merge time by g2-foundation-acceptance gate.

The **tooling quality** (check-secret-scan, check-no-clever-production, public-source-scanner refactor) is sound: all tests pass, patterns are correct, exclusions are documented. The **blocking issues are architectural** (criterion scope, evidence integrity), not implementation defects.

---

**Signed:** Independent K4 review, no conflicts.
