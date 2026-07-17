# Dependency qualification — `entities@8.0.0`

Status: **technically qualified and explicitly accepted by the owner with bounded conditions**.

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

## Owner challenge and decision

The owner instructed `review le jalon, challenger et continuer`. The resulting independent challenge
is recorded in [`OWNER-ACCEPTANCE-ENTITIES.md`](OWNER-ACCEPTANCE-ENTITIES.md), SHA-256
`0258b4bc9a42950d0488cad8e4ef857384d8f1cf0f09effe1c83d0790227c005`.

The exact package/version/integrity and dev-only quality scope are accepted. Any version, integrity,
dependency graph, lifecycle hook, import site, runtime/network behavior or data-boundary change
invalidates that acceptance. npm/GitHub distribution remains a non-blocking build supply-chain risk;
vendoring is retained as a reversible hardening option if registry independence becomes mandatory.

## Evidence

With pinned Bun `1.4.0-canary.1+57f349f63`:

- `bun install --frozen-lockfile` succeeds without lock changes;
- `bun tools/quality/check-js-licenses.ts` verifies 47 dependencies;
- `bun audit` reports no vulnerabilities;
- the scanner's direct, nested, malformed and maximum-size tests pass.

This acceptance permits only preparation of the separate catalog-only promotion review. It does not
authorize product/runtime use, real-data processing, release, infrastructure or deployment.
