# LangGraph pattern-mining foundation — Security rejection of a60d792

- **reviewPassId:** `langgraph-foundation-security-a60d792-20260909`
- **Role:** Security
- **Mode:** specialized role, dedicated review-only pass
- **Reviewed commit:** `a60d792362660f322112d283a8a5b89969f1e194`
- **Review worktree:** detached and clean throughout the pass

## Finding

- **Major — upstream prompt-injection boundary absent.** The extraction pipeline listed provenance, neutralization and threats but did not classify repositories, documentation, issues, traces or examples as untrusted non-instructional input (`docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md:125` at the reviewed commit). ADR-0032 limited what the catalogue gate could prove but likewise omitted a read-only/non-execution rule for upstream content (`docs/adr/0032-langgraph-pattern-mining-boundary.md:47` at the reviewed commit). An injected upstream instruction could therefore influence the research agent before later promotion gates.

Required remediation: make upstream material explicitly untrusted and read-only,
forbid executing code or installing dependencies during extraction, forbid
exposing secrets/PII/private context, and add upstream instruction injection to
the adversarial scenarios.

## Residual risks

Effect ambiguity, tenant isolation, retry, logs and managed-service exclusion
were otherwise bounded, but the major finding prevents approval.

## Verdict

`reject`

The record is historical and immutable. Remediation was committed separately;
it does not alter this verdict.
