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
| D12 | Canary is bootstrap-only after qualification | durable binary/source/notices archive permits shared CI; first qualified stable Rust release is mandatory at G2 and production remains forbidden meanwhile |
| D13 | Biome + Ajv + React Aria | one lint/format stack, strict JSON Schema validation, accessible UI primitives |
| D14 | Playwright remains browser proof | Bun.WebView never replaces multi-engine E2E |
| D15 | Explicit tenant model by application | personal server data and every internal Biscuit use a mandatory opaque tenant; organization apps use RLS; local-only data has no server tenant |
| D16 | Provider-neutral OIDC boundary | Authorization Code + PKCE is stable; provider selection and provisioning remain deferred to G4 |
| D17 | Bounded retention and deletion defaults | ADR-0002 durations drive schemas, purge jobs, backups and evidence |
| D18 | Notebook v1 local-only | encrypted export/import replaces server sync and multi-device merge |
| D19 | Boussole public scoring independently gated | methodological and France/EU legal/privacy approvals are both required and hash-bound |
| D20 | WP-G2-S01 relock uses candidate v2 boundaries only | Radar, Notebook, Policy and Boussole move to reviewed v2 contracts; Context, Orchestrator and Practices remain unimplemented |
| D21 | Solo engineering review is role-separated | ADR-0003 uses immutable commits and dedicated review-only passes per role; the same agent/session may act serially, while product-level human controls remain unchanged |
| D22 | Radar v2 contract authorities are locked | Architecture and Security approvals, a separate promotion pass and the scoped owner milestone lock seven Radar authorities; product implementation and deployment remain separately gated |
| D23 | Agent orchestration option B contracts are locked | Missions remains authority, Pi remains a replaceable worker, and 14 reviewed authorities may be promoted catalog-only; implementation, real missions and capabilities require a separate bounded work package and conformance review |

Changes to this register require an ADR and explicit human approval.
