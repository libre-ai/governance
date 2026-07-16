# Decision register

| ID | Decision | Consequence |
| --- | --- | --- |
| D01 | Big Bang reconstruction | no transitional architecture or progressive product cutovers |
| D02 | New Git history | no history import; legacy archives referenced by SHA |
| D03 | GitHub remains canonical | no new forge is introduced by this migration |
| D04 | Clever Cloud deliberately deferred | configure runtime infrastructure only during global integration |
| D05 | Bun fullstack + React 19 | web UI, SSR, BFF, API, sessions and app data access move to TS |
| D06 | Rust specialized | retain only engines, WASM, crypto, authz, proof, artifact and system tooling with explicit value |
| D07 | One Bun and one Cargo workspace | one `bun.lock`, one `Cargo.lock`, versions centralized |
| D08 | Canonical contracts | JSON Schema, OpenAPI and WIT generate/validate Rust and TS boundaries |
| D09 | Browser session separated from Biscuit | opaque HttpOnly cookie; Biscuit internal authorization |
| D10 | Clean naming | no new rumble/gear/portal/wrench/bolt identifiers; no compatibility by default |
| D11 | Boussole remains in scope | trust/local-first stress-test in a sensitive domain |
| D12 | Canary is preparation-only until qualified | exact local snapshot now; stable Rust or legally archived canary before shared CI/production |
| D13 | Biome + Ajv + React Aria | one lint/format stack, strict JSON Schema validation, accessible UI primitives |
| D14 | Playwright remains browser proof | Bun.WebView never replaces multi-engine E2E |

Changes to this register require an ADR and explicit human approval.
