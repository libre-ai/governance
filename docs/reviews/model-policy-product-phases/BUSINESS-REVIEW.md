# Model Policy product phases — business review

- **Reviewed commit:** `95e49839e0ec2791333998a479dca72ed201042e`
- **Review mode:** independent, read-only
- **Role:** business/product reviewer covering business declarant, use-case owner, RSSI, DPO, auditor, and managed-service buyer
- **Orchestration evidence:** `task_66d0df55e8bf`, message `msg_ffbc2d6c69dc`
- **Verdict:** `reject`
- **Files modified by reviewer:** none

## Blocking finding

The evidence policy required a level and phase/gate binding, but the registry could encode only status plus bare paths. `MP-P0-G01` was declared passed using a report that did not name the phase or gate. The plan therefore claimed more than its machine evidence could prove.

## Major findings

1. Phase 1 assigned data-category, re-identification, application-topology, service-level, and contract/provider questions without per-field accountable actors, delegation, conflict, and escalation behavior.
2. The use-case owner's responsibility was not an attestation bound to the exact passport digest and was insufficiently separated from policy, data, privacy/security, and access approvals.
3. MP-P2 was described as optional but was an unconditional MP-P7 dependency.
4. Monitoring lacked assignee, due instant, escalation, approved disposition, closure evidence, ageing, and complete material-change reconciliation.
5. Managed-service language omitted service variants, provider contracting and key custody, pass-through cost, controller/processor/subprocessor allocation, DPA/audit rights, support severity, exclusions, and remedies; “guarantees faithful application” was too broad.
6. Opaque actor IDs had no customer-controlled role-at-time identity-resolution mechanism for authorized audits.

## Minor findings

- Phase 1 said what “can be used” even though eligibility is neither approval nor authorization.
- “Compliance metrics” risked contradicting the ban on legal badges and aggregate compliance scoring.
- The planning set lacked a concise business glossary.

## Residual risks

External-source authenticity, customer misdeclaration, provider-control enforceability, runtime content/profile mismatch, and any future evaluation-corpus representativeness remain bounded risks. Documentation must allocate and measure them rather than convert them into compliance promises.
