# Candidate-integration rejection — a4e74a6

- Verdict: `REJECT candidate-integration`
- Immutable target: `a4e74a6bbcc11115901c5aae41db95450447911d`
- Review pass: `engine-envelope-quoted-email-integration`
- Session: `019f6ff3-4975-73e7-9080-591f431392c4`
- Provider/model: `openai-codex/gpt-5.5` (`xhigh`)
- Raw reviewer-output SHA-256: `d78012eb7b5904d82d0dd038a8dc6ca1420fc320db3d530ac22100c06210d6b3`
- Effect: named entities require semicolons; only nested legacy amp prefixes remain collapsible

## Verbatim reviewer output

Review-only pass completed on clean detached HEAD.

Target:
- HEAD: `a4e74a6bbcc11115901c5aae41db95450447911d`
- Worktree: clean before/after
- Diff reviewed: `79d02b67cc961ca68d844d07e7f0f23838ccac1f..HEAD`
- Patch SHA-256: `91371ed0c4c69a291f912dfcbb9e8fe9825061b626a338f8d01dd5a22a4bfbdc`
- Changed surface: 11 files, only `STATUS.md`, specialized-engine dossier, `tools/quality/check-contracts.ts`
- `contracts/`, `packages/`, `crates/`: unchanged
- Sole catalog candidate remains `engine-golden-vectors-v1`; all prior approvals remain stale / non-citable for promotion.

Key hashes:
- `tools/quality/check-contracts.ts`: `08971db62e89b2e6ac06cb83400051a23be2dd7534a379a77b08d82116042262`
- `contracts/catalog.v1.json`: `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json`: `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- `docs/reviews/specialized-engine-v2/README.md`: `404c7e7aefbfb905afa5c7efa4b05221aaaafafc03d2a93cc145cf0cbe14bf83`
- 79d02 Security reject preserved: `442fc6009a56c930143e2704fdddf2a4a37f0f1e24bb5ee95d08708bdcd6bc13`

Probes:
- Prior bypass regression probe: `defHash f16995e74183835d9f08dccba44bff6e1901468048f43c74616a7af12b102a69`, `resultHash 082c9de3e302f11968f45a493c0b5b3ea5feef6ff2b1eba94ccb481b2c4bbcef`; 50 targeted cases + 32 direct aliases + 32 `&amp...` chains + property-key probes passed.
- 65,536-code-point adversarial timings showed no superlinear signal in no-`@`, no-dot, many-`@`, many-dot, unterminated quote, quote/backslash cases.
- Alias comparison probe: `181623b6bd4f2564bb026e83e18e28b6648fcee0015484fb7e03046be17cf138`; guard-relevant set complete, but full quoted-local ASCII HTML5 set misses `bsol`, `comma`, `gt`, `lpar`, `lt`, `rpar`, `semi`, `tab`.

Blocking finding:
- `tools/quality/check-contracts.ts:295` decodes semicolonless named entities for every mapped name via `(?:;|(?=[^A-Za-z0-9]))`, not only exact HTML5 aliases / legacy `amp` chains. This violates the “unknown/non-HTML5 entities remain unchanged” requirement and creates false positives:
  - current probe `c7636d3e2889d296cc57eca8db7730e61887cfc67a2ea5605445b35ad54032b7`: `alice&commat.example&period;org` → `alice@.example.org`, sensitive `true`; `alice&commat[127&period;0&period;0&period;1]` → `alice@[127.0.0.1]`, sensitive `true`.
  - HTML5 reference probe `fe294c6eca363ccd953cebbda91bed1885d574d45a9c2c66e7df3cfa97030f39`: repeated HTML5 unescape keeps `&commat` semicolonless unchanged, so these are not HTML5 email identifiers.

Non-blocking confirmations: prior mixed/named/period/alias/quadratic/semicolonless-`&amp`/quoted bypass families are otherwise closed; Radar canary remains exact path+value scoped; errors are generic; scan order remains size → strict JSON → bounds → content scan → AJV → `contractFiles`; no schema/corpora/catalog drift observed.

REJECT candidate-integration — semicolonless non-HTML5 named entities are still decoded as email syntax, violating the exact-HTML5/unknown-unchanged privacy guard requirement
