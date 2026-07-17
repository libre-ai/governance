# Dependency qualification — `entities@8.0.0`

Status: **technically qualified; explicit owner acceptance still required**.

## Scope

`entities` is used only by `tools/quality/public-source-scanner.ts`, a repository-time public test
corpus gate. It is a root `devDependency`; no product package, Rust engine, WASM component, browser
bundle, runtime service or data path imports it.

## Reproducibility and provenance

- Package: `entities@8.0.0`, exact version (no range).
- Upstream: `https://github.com/fb55/entities`, release `v8.0.0`.
- Lock integrity:
  `sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==`.
- Installed `package.json` SHA-256:
  `86e28ac6361377a9c0a82dc7ce849b16bfcc6b13d862c563bbf9b3fe9267773a`.
- Installed `LICENSE` SHA-256:
  `cb992345949ccd6e8394b2cd6c465f7b897c864f845937dbf64e8997f389e164`.
- Runtime dependencies: none; the Bun lock entry has an empty dependency object.

## License, sovereignty and privacy

- License: BSD-2-Clause, accepted by the repository JavaScript license gate.
- Open source, locally executed, no hosted API and no vendor data plane.
- No source corpus, identifier, secret, telemetry or personal data leaves the process.
- No cloud or US hyperscaler dependency and no proprietary format lock-in.

## Qualified API behavior

The scanner imports `decodeHTML` and `DecodingMode` and deliberately uses
`decodeHTML(value, DecodingMode.Legacy)` during at most four bounded normalization rounds. Upstream
`/fb55/entities` documents that Legacy mode follows HTML entity decoding with legacy semicolonless
forms, while Strict mode requires semicolons. Exact case-sensitive names and unknown-reference
controls are executable in `tools/quality/public-source-scanner.test.ts`.

## Evidence

With pinned Bun `1.4.0-canary.1+57f349f63`:

- `bun install --frozen-lockfile` succeeds without lock changes;
- `bun tools/quality/check-js-licenses.ts` verifies 47 dependencies;
- `bun audit` reports no vulnerabilities;
- the scanner's direct, nested, malformed and maximum-size tests pass.

This qualification does not itself approve the new dependency. The repository owner must explicitly
accept the exact package/version/integrity and its dev-only scope before any catalog promotion.
