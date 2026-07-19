# Candidate recorded — 8ede2ba (bounded-payload amendment)

- Status: `RECORDED — awaiting reconciliation and amendment review` (not integrated, not canonical)
- Owner decision: 2026-07-19 — schedule this work as a Specification Lock amendment candidate (source-of-truth session)
- Immutable candidate: `8ede2ba94812d2b9f44e87b285cffd0ad288d4e7` (branch `candidate/engine-golden-vectors-bounded-payloads`)
- Base: `d0c25bcd3988242ac097d02613bf5608669cd50e` (`fix/engine-envelope-v1-private-keys` line, merged)
- Patch preservation: owner-held archive, SHA-256 `2301b6f155939e0d200e23f629216c0b3764342bea090dffbd4bf167b05c77f2`
- Scope: `contracts/schemas/engine-golden-vectors.v1.schema.json` plus fixtures, generated TypeScript projections, contracts manifest, `tools/quality/check-contracts.ts` and the REMEDIATION notes — bounded payload values replace unrestricted public values (`golden`, `contextCanonicalization`, `recoverySecretCodeProfile`), with tightened property patterns and extended validator coverage.

## Why an amendment

`engine-golden-vectors.v1` is locked (catalog-only promotion, final owner `continue`). Any change to its meaning goes through the bounded-amendment path with an independent relock (ADR-0003 precedent). This record programs the candidate; it grants no integration, review or promotion authority.

## Known reconciliation debt

The candidate does not apply onto `main` at `ed801c2`: all seven files moved after the candidate's base (envelope-security series — IPv6/metadata bypass closures, credential markers, publication-scan hardening). Reconciling against current `main` is the first step of the amendment work, before any review.

## Disposition

No merge of the candidate branch without, in order: reconciliation on current `main`, amendment review under the Specification Lock regime, and owner acceptance.
