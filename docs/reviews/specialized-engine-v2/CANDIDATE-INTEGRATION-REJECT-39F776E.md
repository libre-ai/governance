# Candidate-integration rejection — 39f776e

- Verdict: `REJECT candidate-integration`
- Immutable target: `39f776ed656cb944017c6b029deb79363a610f38`
- Review pass: `engine-envelope-named-email-integration`
- Session: `019f6fcd-ef2a-7bf9-bd9c-6c6f0a18962c`
- Provider/model: `openai-codex/gpt-5.5` (`xhigh`)
- Raw reviewer-output SHA-256: `ab785d1fad4bd61f5b0f568d93dee3ae7751e939caf426a7e0e68bf0f40e3756`
- Effect: exact HTML5 aliases for RFC email syntax require complete coverage before fresh roles

## Verbatim reviewer output

Target: `39f776ed656cb944017c6b029deb79363a610f38`, clean detached HEAD before/after.

Effective diff `79d02b67..HEAD`: 4 files, patch SHA-256 `d012ed5cdea087f75a048fba1fc45b2dc13ce682666fb8d52ff6360991041d8f`. Contracts/catalog/corpora unchanged; sole candidate remains `engine-golden-vectors-v1`.

Evidence read: `AGENTS.md`, protocol, full `docs/reviews/specialized-engine-v2/` dossier, including durable rejects:
- AE455 reject hash `18c2e8d32892d44546398f18e448316ab01e4791e52f03022aa9c32feb81773b`
- 3BAECF8 reject hash `9dd66f60242f395313553b82eb7e936aa07c633d4f39ad5aebc492aa4c308dbb`

Findings:
- Previous blockers are closed for tested cases: mixed amp/numeric/named and `&period;` variants now detect; probe hash `c29e61dcaef901799408abd1c2375e4f99e8f4d698b1bf1497c1c5571f18fd45`.
- Requested false-positive controls remain accepted: `R&D`, `R&amplitude`, `release@2`, literal `&#fragment` / `&alpha;` / `%`, encoded public URLs, Unicode wording, inert file/traversal; probe hash `9d3cc68d66755a1414ace75ed53d07f546f3ac4f2ba5f11c6579b56fd384bf7d`.
- Radar canary scope is byte-exact/file-bound; sensitive errors are non-reflective; order is size → strict JSON → bounds → content scan → AJV. `bun run check:contracts` passed, but this is evidence only.

Blocking finding:
- The named entity map is incomplete for exact HTML5 aliases whose decoded scalar is RFC email local-part syntax. `&midast;`, `&UnderBar;`, `&DiacriticalGrave;`, `&lbrace;`, `&rbrace;`, `&vert;`, `&VerticalLine;` decode by HTML5 to `*`, `_`, `` ` ``, `{`, `}`, `|`, `|`, but current code leaves them unchanged. Inputs like `&midast;&commat;example&period;org` become `&midast;@example.org` and bypass detection instead of `*@example.org`.
- Mixed/nested/percent forms of those aliases also miss: 28/28 misses, probe hash `631ade71f6352dc58a896c097a79dbcd9ae3ee3e3901ad88f9e4ae7acb9bcfe1`; HTML5 reference hash `55b551c7fcade0a353afb48e66e1863e6839598fac8a41a59a4cdf3fcb5bdb87`.

REJECT candidate-integration — exact HTML5 named entity aliases for RFC email local-part characters still bypass private email detection
