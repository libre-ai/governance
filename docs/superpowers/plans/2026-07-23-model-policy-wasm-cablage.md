# Model-policy ← policy-core WASM câblage — Implementation Plan

**Goal:** Wire the capability-free policy-core WASM component (#214) into the
model-policy Bun BFF so the app performs real deterministic evaluation, proven
byte-exact against the 20 golden vectors.

**Architecture:** Server-side (Bun) WASM instantiation, following the jco
`instantiation:async` pattern. Build = `cargo build wasm32-unknown-unknown` →
`componentNew` (wasm-tools) → `transpileBytes` (jco) → capability-free glue +
core module written to `target/policy-core-wasm/generated/` (gitignored). The
app's evaluation adapter loads the glue from disk, instantiates once with an
empty import object (capability-free), and exposes a bytes-in/bytes-out
`evaluate`. This mirrors notebook-core's WASM pipeline but leaner — policy-core
is pure/deterministic with no crypto qualification apparatus (no fault builds,
trap injection, RSS benchmarks, pinned-node device attestation).

**Runtime split (empirically verified):** build under **node** (clean jco;
bun emits a non-fatal `tcp_wrap` worker warning at transpile time); instantiate

- evaluate under **bun** (app convention) — both proven 20/20.

## Global Constraints

- Host = Bun server (docs/apps/model-policy.md L5/L63/L67: "Bun.serve/React BFF",
  "Bun authorizes then passes canonical policy/need/snapshot bytes", component
  "has no HTTP, clock, randomness, identity or DB"). NOT a browser bundle —
  model-policy is SSR "usable without JavaScript", not a Front-C local-only app.
- Evaluator boundary matches the WIT exactly: `evaluate(policy: bytes,
snapshot: bytes, need: bytes, evaluatedAt: string) -> result<bytes, error>`.
  No coupling to domain object types.
- Capability-free is the security invariant (axis #1): core module AND component
  must have 0 imports; component exports exactly `libre-ai:policy-core/api@1.0.0`.
- Generated artifacts live under `target/` (gitignored) — never committed.
- REUSE: path-based (REUSE.toml). New files under `crates/**` (EUPL),
  `apps/**` (EUPL), `tools/**` (Apache), `.github/**` (EUPL) are auto-covered —
  no per-file SPDX header needed (notebook's example has none).
- DCO: every commit `Signed-off-by: Constantin Jais <cjais@pm.me>`.

---

## Task 1: Capability-free verification example (Rust)

**Files:**

- Modify: `crates/policy-core/Cargo.toml` — add `wasmparser` + `wit-component`
  dev-deps (workspace `=0.253.0`).
- Create: `crates/policy-core/examples/check_wasm_imports.rs`.

Adapted from `crates/notebook-core/examples/check_wasm_imports.rs`, asserting the
policy-core security surface only (no SIMD128/512MiB memory cap — those are
notebook crypto-qualification concerns policy-core does not carry):

- core module: is a core module, **0 imports**, has `component-type` custom
  section (wit-bindgen binding present).
- component (encoded from the module via `ComponentEncoder`, or read from a
  provided path): is a component, **0 imports**, exports exactly
  `[("libre-ai:policy-core/api@1.0.0", Instance)]`.

Verify: `cargo run --locked -p policy-core --example check_wasm_imports --
target/wasm32-unknown-unknown/release/policy_core.wasm` prints success; a
tampered surface exits non-zero.

## Task 2: Build pipeline (node)

**Files:**

- Create: `tools/quality/build-policy-core-wasm.ts` (run under node).

Steps: guard forbidden Rust build env → `cargo build --locked -p policy-core
--release --target wasm32-unknown-unknown` → read core module → `componentNew`
→ `componentWit` (assert `export libre-ai:policy-core/api@1.0.0`, no `import `)
→ `transpileBytes({instantiation:"async", name:"policy-core", nodejsCompat:false,
strict:true, wasiShim:false, emitTypescriptDeclarations:true})` → assert
`imports.length===0` and exports === the locked api set → write `transpiled.files`
to `target/policy-core-wasm/generated/` → write `manifest.json` (schemaVersion,
sha256 of component/core/glue, transpiler version). Verify transpiled
`.core.wasm` has 0 WebAssembly imports.

## Task 3: Server-side evaluation adapter (Bun)

**Files:**

- Create: `apps/model-policy/src/evaluation/error-mapping.ts` — pure
  `mapContractError(code: string): EvaluationErrorCode` (WIT contract-error code
  → typed union), plus the `EvaluationError` / `EvaluationResult` types.
- Create: `apps/model-policy/src/evaluation/policy-core-evaluator.ts` —
  `createPolicyCoreEvaluator(generatedDir?)` → `{ evaluate(policy, snapshot,
need, evaluatedAt) }`. Dynamically imports the glue, instantiates once
  (memoized) with a disk loader that asserts the loaded core module has 0
  imports, `{}` imports, empty-import `instantiateCore`. `evaluate` returns
  `{ ok:true, value:Uint8Array }` or `{ ok:false, error }` (mapping the thrown
  WIT `ContractError`). Glue shape typed like the notebook worker's
  `ComponentModule`. Default `generatedDir` resolves to
  `target/policy-core-wasm/generated` from repo root.
- Create: `apps/model-policy/src/evaluation/policy-core-evaluator.test.ts` —
  unit tests for `mapContractError` (always run) + a `describe.skipIf(artifact
absent)` block instantiating the live component and checking 2 golden vectors
  (local integration; toolchain-free bun-quality job skips it).

## Task 4: Exhaustive live conformance gate (Bun)

**Files:**

- Create: `tools/quality/policy-core-wasm-conformance.ts` — imports the
  evaluator, runs all 20 `contracts/fixtures/policy-core-v2/golden.json` cases,
  asserts byte-exact `expectedEvaluation` (JCS deep-equal) / expected error,
  exits non-zero on any mismatch. The single exhaustive WASM integration gate.

## Task 5: CI wiring

**Files:**

- Modify: `.github/workflows/ci.yml`:
  - **rust-quality job** (already builds notebook-core WASM): add
    `cargo build --locked -p policy-core --release --target
wasm32-unknown-unknown`, `cargo run --example check_wasm_imports`, and a
    reproducibility `cmp` — mirroring the notebook-core steps. Pure Rust,
    required gate.
  - **new job `policy-core-wasm`**: rust(wasm32)+bun setup, `bun install`,
    `node tools/quality/build-policy-core-wasm.ts`,
    `cargo run --example check_wasm_imports -- <core>`,
    `bun tools/quality/policy-core-wasm-conformance.ts`. Owns the full
    build→glue→live-20/20 pipeline end-to-end.
- Modify: `apps/model-policy/README.md` — document the evaluation increment.
- Modify: `apps/model-policy/package.json` — `build:wasm` + `conformance:wasm`
  scripts for local runs.

## Definition of Done

- `check_wasm_imports` green (0 imports core+component, exact export).
- Live conformance **20/20 byte-exact**; reproducible build (`cmp` identical).
- `bun run typecheck` + `bun run lint` (biome ci) + `bun test apps/model-policy`
  - `bun run check` green; `cargo fmt/clippy -D/test` green; cargo-deny green;
    REUSE lint green; DCO signed.
- No committed binary; no premature auth/HTTP/persistence surface.
