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
- zero component/core imports and no WASI shim; no storage, logs, telemetry, or external network; the host clock is used only for the worker termination deadline;
- generated artifacts confined to ignored `target/notebook-core-v2-qualification/`.

Run with the pinned Bun environment and locally installed Playwright browsers:

```sh
bun run qualify:notebook-core-v2:host
```

The transpiler is the minimal audited `@bytecodealliance/jco-transpile` package, not the full `jco`
CLI: the full package was rejected because its unused componentization dependency reached a critical
archive-extraction advisory. The transpiler is local build tooling under Apache-2.0 with LLVM
exception; the Component Model remains an open boundary and no generated binding is committed.

The fault harness proves the host policy and disposable-instance recovery with qualification-injected
traps, memory-cap failures, and hangs. It does **not** induce an allocation failure inside Rust,
`serde_json`, JCS, Argon2id, or the browser process, and cannot prove physical memory erasure.
Browser p95 performance, constrained device classes, neutral download filenames, and all product
persistence/UI behavior also remain unqualified. Gate B therefore remains rejected until those
separate proofs are complete on an immutable commit.
