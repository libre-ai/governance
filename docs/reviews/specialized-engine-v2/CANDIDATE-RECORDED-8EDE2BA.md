# Candidate recorded — 8ede2ba (bounded-payload amendment)

- Status: `CLOSED — SUPERSEDED BY MAIN` (reconciliation executed 2026-07-19; no amendment needed)
- Owner decision: 2026-07-19 — schedule this work as a Specification Lock amendment candidate (source-of-truth session)
- Immutable candidate: `8ede2ba94812d2b9f44e87b285cffd0ad288d4e7` (branch `candidate/engine-golden-vectors-bounded-payloads`)
- Base: `d0c25bcd3988242ac097d02613bf5608669cd50e` (`fix/engine-envelope-v1-private-keys` line, merged)
- Patch preservation: owner-held archive, SHA-256 `2301b6f155939e0d200e23f629216c0b3764342bea090dffbd4bf167b05c77f2`
- Scope: `contracts/schemas/engine-golden-vectors.v1.schema.json` plus fixtures, generated TypeScript projections, contracts manifest, `tools/quality/check-contracts.ts` and the REMEDIATION notes — bounded payload values replace unrestricted public values (`golden`, `contextCanonicalization`, `recoverySecretCodeProfile`), with tightened property patterns and extended validator coverage.

## Why an amendment

`engine-golden-vectors.v1` is locked (catalog-only promotion, final owner `continue`). Any change to its meaning goes through the bounded-amendment path with an independent relock (ADR-0003 precedent). This record programs the candidate; it grants no integration, review or promotion authority.

## Known reconciliation debt

The candidate does not apply onto `main` at `ed801c2`: all seven files moved after the candidate's base (envelope-security series — IPv6/metadata bypass closures, credential markers, publication-scan hardening). Reconciling against current `main` is the first step of the amendment work, before any review.

## Reconciliation outcome (2026-07-19)

The reconciliation merge (`origin/main` into the candidate) was executed and analyzed conflict by conflict. Every semantic the candidate carries already exists on `main` in a more evolved form, landed by the envelope-security series after the candidate's base:

| Candidate semantic                                                                                                                                       | Main equivalent                                                                                                                                                | Verdict                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `boundedPayloadValue` (string `maxLength` 65536, array `maxItems` 4096, object `maxProperties` 512, opaque recursion)                                    | `payloadValue` + `payloadString` — identical bounds, same recursion guard                                                                                      | equivalent                                     |
| One bounded type for `golden`, `contextCanonicalization`, `recoverySecretCodeProfile`, `reproductionEvidence`                                            | Same fields typed with finer granularity: `payloadValue` for payloads, `metadataValue` (ASCII-only pattern + credential exclusions) for `reproductionEvidence` | main superior                                  |
| Inline validator additions in `check-contracts.ts` (credential markers `sk_live_`/`AKIA…`/`ghp_`/private keys, email detection, percent-decoding rounds) | Schema-level `not` exclusions in `metadataString` + dedicated `tools/quality/public-source-scanner.ts` + fixture coverage                                      | main superior (dedicated scanner architecture) |
| Property-name pattern tightening                                                                                                                         | `metadataPropertyName` with pattern **and** exclusion clauses                                                                                                  | main superior                                  |

Residual candidate-only content after equivalence analysis: none. The candidate base also predates 4,774 lines of later main work (orchestrator/mission schemas). The reconciliation merge was aborted without producing a commit; the candidate branch is deleted. The sealed patch (SHA-256 above) and this record remain the complete trace.

## Disposition

Closed. No amendment of `engine-golden-vectors.v1` is required for this candidate: its intent is already canonical on `main`. Any future hardening starts from current `main`, not from this candidate.
