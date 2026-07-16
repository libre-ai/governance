# Bun toolchain qualification

## Current observation

- stable: `1.3.14`, which predates the selected Rust line ;
- pinned canary: `1.4.0-canary.1+57f349f63` ;
- source commit: `57f349f6307cf89dcfb8893f003c1ef421a74589` ;
- pinned WebKit source revision: `4895f45dfbd0d1226c4d41799887bc0ecb9f341b` ;
- official macOS ARM64 and Linux x64 artifacts downloaded and verified locally ;
- exact Bun source archive downloaded and verified locally ;
- verbatim upstream licence and redistribution notice tracked under `toolchains/notices/bun/1.4.0-canary.1+57f349f63/` ;
- local snapshot remains gitignored under `.tools/snapshots/bun/1.4.0-canary.1+57f349f63/`.

## Bootstrap release procedure

Before enabling shared CI:

1. create the canonical public GitHub repository ;
2. publish the two unmodified binaries, exact Bun source archive, checksums and notices in release `toolchain-bun-1.4.0-canary.1-57f349f63` ;
3. retrieve the Linux asset from that immutable release in CI without `curl | bash` ;
4. verify SHA-256 before extraction and verify `bun --revision` before dependency installation ;
5. run `bun install --frozen-lockfile`, all root checks and audits ;
6. keep Clever Cloud unconfigured until Global Integration.

The release is a technical compliance and reproducibility record, not legal advice or production approval. External redistribution beyond the public bootstrap archive requires owner or counsel approval.

## Acceptance

- exact version/revision verified ;
- Darwin ARM64 and Linux x64 checksums recorded ;
- exact application source and upstream relinking instructions archived ;
- WebKit source revision recorded ;
- artifact remains retrievable after rolling canary changes ;
- clean runner installs without executing a remote shell script ;
- `bun install --frozen-lockfile`, `bun run check` and audits pass.

## G2 replacement rule

At the beginning of Foundation Build, check stable releases again. Replace the canary with the first qualified stable Rust release, regenerate `bun.lock`, rerun every gate and archive the new checksums. A different canary is forbidden without repeating this qualification.
