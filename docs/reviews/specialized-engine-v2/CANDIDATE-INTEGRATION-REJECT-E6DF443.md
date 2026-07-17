# Candidate-integration rejection — e6df443

- Verdict: `REJECT candidate-integration`
- Immutable target: `e6df44337f7edc695bcf027ec6cf1088cc97bcac`
- Review pass: `engine-envelope-html5-alias-integration`
- Session: `019f6fd8-b7af-71be-81cf-bdd350706675`
- Provider/model: `openai-codex/gpt-5.5` (`xhigh`)
- Raw reviewer-output SHA-256: `83f1fb65627317ca069fdc4114c54240fcaa7c11fc6466576c48d511c1fac91f`
- Effect: remove the non-HTML5 alias and replace quadratic email matching before fresh gates

## Verbatim reviewer output

Target verified read-only: HEAD `e6df44337f7edc695bcf027ec6cf1088cc97bcac`, worktree clean before/after.

Reviewed: protocol + full `docs/reviews/specialized-engine-v2/` dossier, including rejects:
- AE455 `18c2e8d32892d44546398f18e448316ab01e4791e52f03022aa9c32feb81773b`
- 3BAECF8 `9dd66f60242f395313553b82eb7e936aa07c633d4f39ad5aebc492aa4c308dbb`
- 39F776E `6e9dc13e5f11d57a75df483c57cd38b623ea429db4511c43bb4d9bfef5eda84d`

Diff reviewed: `79d02b67cc961ca68d844d07e7f0f23838ccac1f..HEAD`, 5 files, patch SHA-256 `2667da82b158f4c1cbc8c80a58531fc5d24b56f0b8284609e717f495b0580129`.

Key findings:
- Blocking: `tools/quality/check-contracts.ts:227` email regex is pathological on benign no-`@` strings. Probe on `"a" * n`: 1k `1.1ms`, 2k `2.2ms`, 4k `9.9ms`, 8k `37ms`, 16k `144ms`, 32k `565ms`, 65k `2225ms`. Since 65,536-code-point strings are allowed, this violates bounded scanner/resource claims.
- Blocking: HTML5 reference derivation gives 26 aliases; implementation has 27 due extra non-HTML5 `at: "@"` at `tools/quality/check-contracts.ts:254`. This contradicts “exact HTML5 aliases” and “unknown named entities remain unchanged”; `alice&at;example&period;org` is rejected as an email even though `&at;` is not an HTML5 named reference.
- Previous alias omissions are otherwise closed: 26/26 HTML5-derived aliases passed direct, mixed numeric, nested numeric/named, nested named and percent probes; 130/130 sensitive probes rejected.
- Controls accepted as required: `R&D`, `R&amplitude`, `release@2`, literal `&#fragment`/`&alpha;`/`%` text, encoded URLs, Unicode wording, inert `file:///...` and traversal payloads.
- Unknown/Unicode-letter behavior: `&unknown;` and `&alpha;` remain accepted; numeric `&#945;@...` is rejected as Unicode email, as expected.
- Strict order verified: size → strict JSON parse → bounds → public-content scan → AJV → `contractFiles` resolution.
- Radar canary remains byte-exact/file-bound. Sensitive error message is generic.
- `contracts/` and `packages/` unchanged in this diff; catalog/schema/corpora unchanged. Sole candidate remains `engine-golden-vectors-v1`.

Durable hashes:
- HTML5 alias comparison probe `b190371ac9790430cb8ab2b63a42fe1bbe6917a0e9ab9a692bfc404c84ce9534`
- Alias/control probe `9c521b00bc2c13411b53d05b1a1d01d7e69c9738824bae5f11fe1b8074c72838`
- Case-fold probe `c9fdfbe32a0dc81670b8806b2a1fb4be1e07157e67db528caf57cb54a3ec8c2e`
- Perf probe definition `6a4a7ae4e9b11dc76ad46b057e48594a0c15ef13b70aff3fb93910b4419e1162`

REJECT candidate-integration — quadratic no-@ email regex cost and non-HTML5 &at; decoding remain blocking
