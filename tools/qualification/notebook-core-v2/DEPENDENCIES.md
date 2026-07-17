# Qualification dependency decision

## Accepted for this harness

`@bytecodealliance/jco-transpile 0.4.2` is pinned exactly in `bun.lock` with integrity
`sha512-45aeQsUSJsrru1FY1EU47T6kREUkQ7QC1EwIqb5Vi3yakrl6cyqOTRG005k/BWq/fNR0i0n3QtTZQRoF4fi88g==`.
It is Apache-2.0 with LLVM exception, open source under the Bytecode Alliance, and implements the open
WebAssembly Component Model. It runs locally at build time, receives only the public compiled module,
and is absent from product/browser runtime output. `bun audit` reports no advisory.

Its preview shims share the same permissive licence but are not imported into the generated component:
the build sets `wasiShim: false`, requires an empty transpiler import list, and verifies the generated
core module has zero imports. Binaryen/OXC are build-only transitive packages; optimization and
minification are disabled. Fault-module generation reuses the already pinned Rust `wasmparser`
without adding a dependency; each modified module is validated before browser execution and remains
under ignored `target/`.

The existing `@playwright/test 1.61.1` dependency executes local Chromium, Firefox, and WebKit. The
harness blocks every non-loopback request and uses only public deterministic fixtures. Browser binary
provenance/archival is still required before a final Gate B approval or CI gate.

## Rejected alternative

The full `@bytecodealliance/jco 1.25.2` CLI was tested and rejected before commit. It includes unused
componentization toolchains and reached `decompress <=4.2.1`, affected by critical archive traversal
advisory `GHSA-mp2f-45pm-3cg9`. The dependency and its lock changes were removed; the minimal
transpiler has no reported vulnerability.

## Residual toolchain limits

The transpiler currently requires Node for its worker implementation because the pinned Bun can emit a
spurious `process.binding("tcp_wrap")` worker error after successful library execution. Node 26.5.0 was
used for the recorded local evidence but is not yet a project-pinned toolchain. Generated artifacts are
therefore rebuilt twice and compared, never committed, and cannot become release evidence until Node
and browser archives are pinned with hashes.
