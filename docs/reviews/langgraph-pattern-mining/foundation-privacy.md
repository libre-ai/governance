# LangGraph pattern-mining foundation — Privacy review

- **reviewPassId:** `langgraph-foundation-privacy-0d8c8e9-20260909`
- **Role:** Privacy
- **Mode:** specialized role, dedicated review-only pass
- **Reviewed commit:** `0d8c8e9d2f2e61b9c94eaf0b599f475757a81c36`
- **Review worktree:** detached, clean before and after
- **Agent:** Codex; session, provider and model identifiers are not exposed by the current harness

## Subject integrity

No contract, vector, persistence implementation or tenant-data path changes.
Relevant SHA-256 values are ADR-0032
`e3e34e56d99423938cdca6137ec70bc88881634f1b861e343c7274f667b49d3f`,
design `03ee0cecefae728058985aecb71032135e1942f8bb096945348d5996a05c0568`
and register `497ff0bbcc790841556bf636937c1b0800b12088c1ddb9641a0c785e08468932`.

## Privacy assessment

- Streaming separates tenant-private business events, tenant-private evidence and content-free operational telemetry (`docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md:275`).
- Prompts, messages, tool data, raw errors, paths, secrets, PII and stable identifiers are excluded from operational logs and OTEL (`docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md:283`).
- Worker checkpointing is disabled or limited to ephemeral sandbox storage and never becomes canonical recovery state (`docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md:343`).
- Over-retention and deleted-content resurrection on restore are mandatory adversarial scenarios (`docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md:332`).
- Long-term memory and managed traces remain out of scope; any real data or persistence capability requires its own work package and review (`docs/superpowers/specs/2026-09-09-langgraph-pattern-mining-design.md:427`).

## Reproduced evidence

- Searches for streaming, retention, restore, deletion, checkpoint and PII locate the closed boundaries above.
- `git diff --check f7a74fe..0d8c8e9` exits 0; the detached worktree remains clean.
- The full governance gate on the exact content exits 0: 913 tests, 0 failures, 1598 assertions.

## Findings

- Blocking: none.
- Major: none.
- Minor: none.
- Non-blocking: none.

## Residual risks

Concrete retention periods, deletion enforcement and RLS are intentionally
deferred to the later data-bearing work package. They are not omissions in this
foundation because it opens no persistence or tenant-data capability; they
remain blocking requirements for any such future increment.

## Verdict

`approve`
