# notebook crypto-at-rest migration — round 1 verdicts (notebook#35 at 67c323b)

Two independent, adversarial, read-only K4 passes on
[libre-ai/notebook#35](https://github.com/libre-ai/notebook/pull/35): aes 0.8.4
(vendored fork, one hunk: 64-bit fixslice on wasm32) retired for aes 0.9.3 from
the registry (the intent is held upstream by `cpubits`), aes-gcm 0.11.1, ghash
0.6.0, polyval 0.7.3, the direct ghash/polyval anchors replaced by a
`check:zeroize-chain` gate plus a `ZeroizeOnDrop` compile-time assertion, a
`--cfg cpubits="64"` belt with check-cfg, and a blocking wasm32 CI leg.

| Role | Verdict | Blocking | Major | Minor |
| --- | --- | --- | --- | --- |
| security | accept | 0 | 2 | 2 |
| architecture | reject | 1 | 1 | 4 |

No double accept. Both roles found the same defect: `check-zeroize-chain.ts`
runs `cargo metadata` without `--locked` while four narrations claim it does;
a stale lock keeps the gate green and rewrites `Cargo.lock` silently. The
architecture major: Gate B (browser qualification) is made stale — the
`.cargo/config.toml` digest recorded under `gate-b/9ee3f8d` no longer matches —
without a dated trace here or in the app README, and the fork's removal
condition (ADR-0031 D1) is asserted in a commit message but consigned nowhere
in governance. The security major on the same subject: the fork is retired
while Gate B §2–§4 remain owner steps and no gate executes AES on wasm32 nor
the fixslice path; the pass produced a substitute (golden 11/11 under forced
soft backends, byte-exact in 32- and 64-bit words) and proposes either a
native forced-soft CI leg or a recorded Gate B run before merge — an owner
deviation to sign, not a remediation.

Proven by the passes: envelope format byte-exact (a pre-#35 and a #35 binary
seal the same 70 001-byte payload into byte-identical envelopes and open each
other); the belt fails closed without `--cfg`; revert in one commit, zero
conflicts.
