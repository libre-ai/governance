# Model Policy product phases — technical review

- **Reviewed commit:** `95e49839e0ec2791333998a479dca72ed201042e`
- **Review mode:** independent, read-only
- **Role:** technical reviewer
- **Orchestration evidence:** `task_cf0929fb78cf`, message `msg_e5a31b6858b0`
- **Verdict:** `reject`
- **Files modified by reviewer:** none

## Reproduced checks

The original checker, seven original unit tests, typecheck, targeted Biome checks, contract checks, and `git show --check` were green. Adversarial probes nevertheless reproduced the failures below, proving that the green result was insufficient.

## Blocking finding

The evidence checker accepted any existing repository-relative path. It accepted `package.json` as passed-gate evidence, while the current `MP-P0-G01` path did not carry the phase/gate identity required by the evidence policy.

## Major findings

1. Dependency completion was checked only for a `complete` child; a synthetic `MP-P1 in_progress` with `MP-P0 not_started` returned no semantic failure.
2. `--write` updated the README after validation failures had already been collected.
3. Parsed JSON was cast before schema validation and semantic validation still ran after rejection; `{ "phases": null }` produced a `TypeError` instead of stable diagnostics.
4. Gate definitions were checked only from registry to document using substring inclusion, so a mandatory document gate could disappear from the registry.
5. The manually duplicated planning table in the documentation README was outside drift validation.

## Required remediation

- Validate unknown input before narrowing it and stop on schema failure.
- Write projections only after every check passes.
- Replace bare evidence paths with allowlisted content-addressed records bound to phase/gate, level, commit, and artifact digests.
- Require tracked regular non-symlink paths and verify source-commit blobs.
- Compare gate headings and registry entries bidirectionally in order.
- Generate or validate every duplicated projection.
- Add adversarial integration tests for malformed input, write-after-failure, path scope, and extra gates.

## Residual risks

Qualitative future thresholds and evidence invalidation remain governance risks even with stronger structural validation. No new dependency, PII logging, sovereignty, cycle, or hot-path performance defect was found in the proposed content itself.
