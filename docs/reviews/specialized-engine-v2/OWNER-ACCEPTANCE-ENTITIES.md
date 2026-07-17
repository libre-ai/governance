# Owner dependency milestone — `entities@8.0.0`

- Decision: **ACCEPTED WITH BOUNDED CONDITIONS**
- Owner control input: `review le jalon, challenger et continuer`
- Context: direct response to the pending explicit owner acceptance of `entities@8.0.0`; continuation is authorized only after the independent challenge below passes.
- Reviewed repository target: `881c75b2857cc39091602085f13b2f467bac54d1`
- Authority: `engine-golden-vectors-v1` remains `candidate`
- Scope: dependency acceptance only; not catalog promotion, product/runtime/data/release or deployment authorization

## Challenge result

### PASS

- Exact root `devDependency`: `entities@8.0.0`, no semver range.
- Lock integrity: `sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==`.
- Installed manifest SHA-256: `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`.
- Installed license SHA-256: `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`.
- License: BSD-2-Clause; accepted by the repository license gate.
- Dependency graph: no runtime, peer or optional dependency; lock dependency object is empty.
- Lifecycle: no `preinstall`, `install`, `postinstall` or `prepare` hook.
- Shipped JavaScript/TypeScript imports only package-relative modules; no dynamic import, subprocess, filesystem, network, DNS, TLS, HTTP, telemetry or hosted API path was found.
- Repository usage is limited to `tools/quality/public-source-scanner.ts`; no product package, Rust engine, WASM component, browser bundle or service imports it.
- API is pure local string decoding. Context7 official source `/fb55/entities` documents the same no-I/O/no-runtime-dependency threat model.
- Scanner work remains bounded by 65,536 decoded code points, four decode rounds and maximum adversarial tests.
- Verification: `bun install --frozen-lockfile`, JS license gate, `bun audit`, contract gate and 129 scanner tests passed.
- Privacy/RGPD: no source string, identifier, secret, telemetry or personal data leaves the process; no external processor or data residency question is introduced.
- Sovereignty: open-source, auditable, standard HTML entity semantics, no proprietary protocol, cloud or vendor data plane.

### WARN — accepted residual risk

- Package distribution and upstream hosting use npm/GitHub, a US-governed supply-chain surface. It is build-time availability/provenance risk, not runtime or data-processing dependency.
- The registry artifact has integrity pinning but no repository-enforced publisher identity/signature proof.
- Upstream declares Node.js `>=20.19.0`, not Bun compatibility. The exact API is nevertheless exercised under the pinned Bun `1.4.0-canary.1+57f349f63`; any Bun or package upgrade requires replay.
- Mitigations accepted for this quality-only use: exact version and SHA-512 lock, frozen install, dependency/license/audit gates, local source inspection, no lifecycle hooks, no transitive graph and mandatory fresh owner review for any version, integrity, API or scope change.
- Vendoring remains a reversible future hardening option if offline/sovereign build requirements become stricter. Vendoring now would duplicate 58 files/about 388 KiB and create patch/table maintenance risk without reducing runtime exposure.

### FAIL

None.

## Challenged alternatives

- A handwritten/regex HTML5 decoder is rejected: historical integration passes already demonstrated missed aliases, legacy semicolonless forms and case rules; it increases false-negative and maintenance risk.
- Browser DOM decoding is rejected: unavailable as a deterministic Bun/Rust-independent repository gate and would blur browser/runtime boundaries.
- Immediate vendoring is not selected: larger maintained surface for no current runtime/data benefit. It remains available if registry independence becomes mandatory.

## Owner decision and conditions

The owner instruction is accepted as explicit approval of **only** `entities@8.0.0` with the exact integrity and dev-only quality scope above. This approval is invalidated by any package version/integrity change, transitive dependency, lifecycle hook, new import site, product/runtime bundle inclusion, network/I/O behavior or expanded data boundary.

This milestone permits preparation of the distinct catalog-only promotion review for `engine-golden-vectors-v1`. It does not itself change catalog state and authorizes no engine implementation, public scoring, real/personal data processing, capability, release, infrastructure, Clever Cloud action or deployment.
