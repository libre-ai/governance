# Notebook Core v2 — qualification-only browser host

This harness is not a product host and must use only the public deterministic fixtures. It builds the
exact locked Rust component, transpiles it to browser-executable ES modules, and runs the closed WIT
API in Chromium, Firefox, and WebKit without external requests.

Covered:

- exact backup and Context golden outputs through the real component ABI;
- ten backup refusals plus twelve Context refusals, eight numeric cases, and six replayable resource boundaries;
- static host messages and no plaintext release on every backup refusal;
- strict lowercase 32-hex recovery decoding while invalid 15/17-byte attempts still traverse the component anti-oracle path;
- fresh Web Crypto IDs, salt, nonce, and recovery bytes with an executable uniqueness sample;
- best-effort wiping of host-owned recovery, plaintext, opened plaintext, and Context input buffers;
- ownership transfer to a one-operation worker, closed worker protocol, mandatory termination on success, refusal, startup/clone error, malformed response, trap, OOM, or timeout;
- validated trap copies of each real ABI export, plus real `memory.grow` failure beyond the 512 MiB cap after ABI input copies, across all three operations and browsers;
- a separate, non-shipping `qualification-faults` component that triggers a Rust panic and a real 600 MiB allocator request against the 512 MiB WASM cap on each ABI operation, plus fail-next-allocation points at `serde_json` parsing, JCS output reservation, and Argon2id matrix reservation, in each applicable operation and browser;
- 20 measured iterations after two warm-ups for the locked 16 MiB producer and maximum KDF profiles, including operation and disposable-worker p50/p95, summed linear-memory high-water marks, browser-process-group RSS deltas, and four anti-oracle refusal distributions;
- zero component/core imports and no WASI shim; no storage, logs, telemetry, or external network; the host clock is used only for deadlines and qualification timing;
- generated artifacts and raw measurements confined to ignored `target/notebook-core-v2-qualification/`.

Run with the pinned Bun environment, the manifest-matching Node executable, and locally installed Playwright browsers. Supplying the archive directory additionally verifies all four downloaded archives before execution:

```sh
export NOTEBOOK_QUALIFICATION_NODE=/path/to/node-26.5.0/bin/node
export NOTEBOOK_QUALIFICATION_ARCHIVE_DIR=/path/to/verified-archives
bun run qualify:notebook-core-v2:host
bun run qualify:notebook-core-v2:performance
```

`toolchains/notebook-qualification.json` pins the Node and Playwright versions, platform, archive URLs, archive SHA-256 values, installed executable SHA-256 values, browser revisions, and Playwright descriptor hash. The performance summarizer deliberately exits non-zero after writing the complete matrix when any locked budget is exceeded.

The transpiler is the minimal audited `@bytecodealliance/jco-transpile` package, not the full `jco`
CLI: the full package was rejected because its unused componentization dependency reached a critical
archive-extraction advisory. The transpiler is local build tooling under Apache-2.0 with LLVM
exception; the Component Model remains an open boundary and no generated binding is committed.

The fault harness proves the qualification-host policy and disposable-instance recovery with injected traps, a Rust panic, a real Rust allocator failure at the linear-memory cap, controlled allocation refusal at the `serde_json`/JCS/Argon2id boundaries, and hangs. The `serde_json` failpoint aborts inside its first parser allocation; the fallible JCS and Argon2id reservations return `resource-limit-exceeded`. It does **not** induce browser-process OOM or prove physical memory erasure. The performance matrix covers one declared arm64 desktop reference class only. Neutral download filenames and all product persistence/UI behavior remain unqualified; this harness is never evidence for a future product host. Gate B remains rejected until the measured budgets, remaining device classes, dependency/process fault evidence, and exact product-host review all pass on immutable commits.
