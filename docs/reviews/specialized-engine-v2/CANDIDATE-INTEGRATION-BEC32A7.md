# Candidate-integration approval — bec32a7

- Verdict: `APPROVE candidate-integration`
- Immutable reviewed target: `bec32a7bedb349bad4c3c58afbc878b995d00db8`
- Integrated by PR #81 merge: `6d37f0dd9759c04d9908885c8419d6d4992cbee0`
- Review pass: `engine-envelope-wrapped-cfws-review`
- Session: `019f7147-3b49-79ac-ba28-5b1deb6f6d3b`
- Provider/model: `openai-codex/gpt-5.5` (`xhigh`)
- Raw reviewer-output SHA-256: `96e2c3a12662a70772c0a6775301791509d71db588065019583ca6fceb7cd149`
- Scope: candidate-integration only; not Architecture, Security, promotion or owner acceptance

## Verbatim reviewer output

Review-only pass completed on clean detached HEAD.

- Target verified: `bec32a7bedb349bad4c3c58afbc878b995d00db8`; base `cea73631ac69c0a53549f63f521aca8ee3326a02`; final `git status --short` clean.
- Scope drift: only `STATUS.md`, specialized-engine docs, `public-source-scanner.ts`, and its test changed. No schema/catalog/generated drift in PR #81.
- Sole candidate confirmed: `engine-golden-vectors-v1`; schema hash matches generated manifest.
- Wrapped-CFWS probes: direct 38-case adversarial matrix green; actual gate 48 value/key sensitive injections rejected non-reflectively, including plain/nested/escaped/backslash parity/percent/HTML/EAI/IDN/IP/whole-quote/parentheses.
- Additional controls green: schema credentials/userinfo, EAI/prose/quote/trailing/HTML5, Radar canary scope, resource/order bounds, false positives, max time/memory.
- Dependency audit: `entities@8.0.0` exact devDependency, BSD-2-Clause, no runtime/peer/optional deps, imported only by scanner. Owner acceptance remains separate.

Evidence hashes:
- probe log `/tmp/pr81-candidate-integration-probes.json`: `20c4297870db80cfc5fe0d1cf5d7250e06bbeceebcb00757d2cc827e80489926`
- Bun gates `/tmp/pr81-bun-gates.log`: `19ce2b79d4cccf33ba6392027a610d3853a4d4837b0d04ba5f148de2d166c16f`
- cargo gates `/tmp/pr81-cargo-gates.log`: `abf4bbdf9a2f06e9d3b4f4df45acd06e0ba13644e2aac4705298cb5c07dfbad4`
- scanner: `f33d2047d3a9fa1a47820ef942cfe8975493b95eb334195de9b90e5254ae6aea`

This is candidate-integration evidence only, not Architecture/Security/promotion.

APPROVE candidate-integration — exact clean head, pinned Bun gates, wrapped-CFWS actual-gate probes, schema/generated consistency, dependency qualification and authority scope all verified with no blocking finding.
