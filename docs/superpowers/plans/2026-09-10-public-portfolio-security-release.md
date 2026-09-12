# Portfolio Security and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every admitted repository secure by default and prove distributed packages, images, and metadata from anonymous consumer environments before public cutover.

**Architecture:** Portable repository-local commands run on ephemeral EU workers. Builds have no signing credentials; an isolated signer accepts only approved digests. Governance renders deterministic GitHub settings and release manifests, while registry and runtime proofs remain owned by the distributing repository.

**Tech Stack:** GitHub Actions control plane, ephemeral EU self-hosted runners, Bun 1.4 canary, Rust 1.97, OCI, SPDX or CycloneDX SBOM, Sigstore-compatible digest signing without a managed US signing service, npm, crates.io, Clever Cloud Paris/EU.

**Spec:** `docs/superpowers/specs/2026-09-10-public-portfolio-big-bang-design.md`

## Execution ordering

Follow the coordinator plan's **Executable Dependency Order**, not packet-number order.
Local candidate implementation is authorized; it is not final admission or publication proof.
Final authority identifiers are ADR-0041/I-32/D46 after the `65fbff2` collision recheck;
ADR-0039/I-31 (private research) and ADR-0040/D45 (run-control persistence) remain intact.

## Global Constraints

- GitHub receives public code and CI control metadata only; no product data or long-lived runtime secret.
- Runner filesystem, cache, logs, and credentials are destroyed after one job.
- A signer executes no repository code and receives no source checkout.
- Canonical OCI artifacts reside in an EU registry; GitHub is a mirror.
- npm and crates.io releases are allowed only for independently consumed packages.
- All settings and release payloads are rendered and validated before any remote mutation.
- Registry publication and Clever deployment remain separate owner-controlled release acts.

### Task 1: Publish portable workflow templates

**Files:**
- Create in target `governance`: `distribution/workflows/repository-ci.v1.yml`
- Create in target `governance`: `distribution/workflows/release-build.v1.yml`
- Create in target `governance`: `distribution/workflows/release-sign.v1.yml`
- Create in target `governance`: `distribution/workflows/post-deploy-smoke.v1.yml`
- Create in target `governance`: `tools/ci/validate-workflows.ts`
- Create in target `governance`: `tools/ci/validate-workflows.test.ts`
- Create in every target: `.github/workflows/ci.yml`
- Create in distributing targets: `.github/workflows/release.yml`

**Interfaces:**

```ts
interface WorkflowPolicy {
  allowedActions: Record<string, string>;
  requiredRunnerLabels: string[];
  forbiddenPermissions: string[];
  maxJobMinutes: number;
}
```

- [ ] Write tests rejecting mutable action tags, GitHub-hosted runner labels, write permissions in build jobs, persistent cache credentials, repository code in signer jobs, and secrets in pull-request jobs.
- [ ] Write positive tests for exact SHA-pinned actions, minimal permissions, local command parity, artifact digest handoff, and cleanup on success/failure/cancellation.
- [ ] Run the focused test and confirm failure before implementation.
- [ ] Implement the workflow validator and four templates.
- [ ] Generate target workflows with only repository-specific command lists and artifact types as inputs.
- [ ] Prove each workflow command locally in the corresponding clean target.
- [ ] Commit governance as `feat: publish secure portfolio workflows` and each target as `ci: adopt secure portfolio workflow`.

### Task 2: Qualify ephemeral EU runners

**Files:**
- Create in target `governance`: `verification/runners/eu-ephemeral-runner.md`
- Create in target `governance`: `verification/runners/probe.ts`
- Create in target `governance`: `verification/runners/probe.test.ts`
- Create in target `governance`: `verification/runners/expected.v1.json`

**Interfaces:**

```ts
interface RunnerAttestation {
  region: string;
  provider: string;
  ephemeral: boolean;
  reusedFilesystem: boolean;
  outboundDestinations: string[];
  credentialResidue: string[];
  verdict: "pass" | "fail";
}
```

- [ ] Write tests that fail outside the declared EU region, on reused filesystem state, on surviving credentials, on unexpected outbound destinations, or when teardown evidence is absent.
- [ ] Run the focused test and confirm failure before implementation.
- [ ] Implement a probe that emits only machine facts and hashes; never emit tokens, environment values, IP addresses, or user-agent strings.
- [ ] Provision the runner controller on the selected EU infrastructure only under its separate infrastructure authorization.
- [ ] Execute consecutive jobs and prove no workspace, cache credential, signing material, or prior environment value survives.
- [ ] Interrupt a job and prove teardown still completes.
- [ ] Record the GitHub control-plane exception and a portable local fallback command for every workflow.
- [ ] Commit as `test: qualify ephemeral EU runners`.

### Task 3: Build the isolated signing protocol

**Files:**
- Create in target `governance`: `distribution/signing/signing-request.v1.schema.json`
- Create in target `governance`: `distribution/signing/signing-response.v1.schema.json`
- Create in target `governance`: `distribution/signing/validate.ts`
- Create in target `governance`: `distribution/signing/validate.test.ts`
- Create in target `governance`: `distribution/signing/THREAT-MODEL.md`
- Create in target `governance`: `distribution/signing/run-signer.ts`
- Create in target `governance`: `distribution/signing/run-signer.test.ts`

**Interfaces:**

```ts
interface SigningRequestV1 {
  schemaVersion: "signing-request.v1";
  repository: string;
  commit: string;
  subjects: { name: string; digest: `sha256:${string}`; mediaType: string }[];
  sbomDigest: `sha256:${string}`;
  provenanceDigest: `sha256:${string}`;
  policyDigest: `sha256:${string}`;
}
```

- [ ] Write tests rejecting path inputs, archives, scripts, executable media types, mutable URLs, missing SBOM/provenance subjects, duplicate names, malformed digests, and a request not bound to an admitted repository commit.
- [ ] Write signer tests proving the process has no repository checkout, package manager, compiler, network except the approved transparency/publication endpoints, or arbitrary command execution.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Implement strict request validation and digest-only signing.
- [ ] Generate keys through the approved owner ceremony; keep private material in the EU secret boundary and publish only verification material.
- [ ] Sign a harmless fixture, verify it independently offline, rotate the fixture key, and prove old signatures remain verifiable while new signing uses the new key.
- [ ] Commit as `feat: add digest-only release signing`.

### Task 4: Qualify npm and crates.io artifacts

**Files:**
- Create in target `app-kit`: `tools/release/verify-packages.ts`
- Create in target `app-kit`: `tools/release/verify-packages.test.ts`
- Create in target `contracts`: `tools/release/verify-packages.ts`
- Create in target `contracts`: `tools/release/verify-packages.test.ts`
- Create in conditional target `authorization`: `tools/release/verify-crate.ts`
- Create in conditional target `authorization`: `tools/release/verify-crate.test.ts`
- Create in target `governance`: `verification/releases/anonymous-package-consumer.ts`
- Create in target `governance`: `verification/releases/anonymous-package-consumer.test.ts`

- [ ] Enumerate independently consumed packages only: `@libre-ai/ui`, `@libre-ai/web`, `@libre-ai/testing`, generated contract SDK packages/crates, and the existing authorization crate identity as an admission candidate. Its package may be built and separately authorized for registry proof before repository admission; provisional brand metadata remains forbidden.
- [ ] Package contract SDKs from `generated/typescript/` and `generated/rust/`, with editable canonical authorities confined to `contracts/`. Require reproducible generation and anonymous installation proof; alternate layouts require an executable packaging constraint and an explicit reviewed manifest.
- [ ] Add release fixtures rejecting Auth/Build Brief as standalone Missions packages, unproved Sessions data-rights packages, and governance `ecosystem-engine` or Mission Control `envelope` packages/crates without retained-boundary evidence. Internal units remain private and gain no public release configuration from migration.
- [ ] Refuse public brand metadata for any of the six provisional conditional names before its immutable executable admission gate passes; artifact evidence used by that gate does not itself approve a new public name.
- [ ] Write tests rejecting `private: true`, missing license, workspace or Git dependency, absent export target, tests/fixtures in tarballs, unpinned runtime dependency, and mismatched package version.
- [ ] Write anonymous-consumer tests that install exact versions from the real registry, compile the documented example, and run it without repository credentials.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Implement package verification and per-package independent SemVer release manifests.
- [ ] Generate SBOM and provenance for packed tarballs/crates, submit digest-only signing requests, and verify signatures offline.
- [ ] Publish only under the repository-local release authorization and immediately run the anonymous consumer.
- [ ] Roll back a failed publication by deprecating the exact npm version or yanking the exact crate according to registry rules; never reuse the version.
- [ ] Commit each repository as `feat: qualify registry releases`.

### Task 5: Qualify Missions OCI and hosted demonstration

**Files:**
- Create in target `missions`: `Containerfile`
- Create in target `missions`: `.containerignore`
- Create in target `missions`: `scripts/build-image.ts`
- Create in target `missions`: `scripts/build-image.test.ts`
- Create in target `missions`: `scripts/verify-image.ts`
- Create in target `missions`: `scripts/verify-image.test.ts`
- Create in target `missions`: `scripts/smoke-demo.ts`
- Create in target `missions`: `scripts/smoke-demo.test.ts`
- Create in target `missions`: `docs/THREAT-MODEL.md`
- Create in target `missions`: `docs/RELEASE.md`

- [ ] Write tests for deterministic image inputs, non-root runtime, read-only filesystem, bounded resources, no embedded credentials, no remote analytics, health/readiness separation, and zero personal-data logs.
- [ ] Write smoke tests for no-account demo, one bounded mission, evidence display, self-host command, interruption, and rollback.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Implement the OCI build with all dependencies pinned and no network-dependent runtime asset.
- [ ] Build twice from the same root commit and compare filesystem and configuration digests.
- [ ] Generate SBOM/provenance, sign digests in the isolated signer, publish to the canonical EU registry, and mirror the same digest to GitHub.
- [ ] Deploy the exact digest to the Clever Cloud technical URL under repository-local authorization.
- [ ] Run smoke, rollback to the previous immutable revision or stop the first deployment on failure, then smoke the resulting state.
- [ ] Attach the canonical domain only after the technical URL and rollback proof pass.
- [ ] Commit as `feat: qualify signed Missions release`.

### Task 6: Render and verify GitHub security settings

**Files:**
- Create in target `governance`: `tools/github/settings.ts`
- Create in target `governance`: `tools/github/settings.test.ts`
- Create in target `governance`: `tools/github/render-settings.ts`
- Create in target `governance`: `tools/github/render-settings.test.ts`
- Create in target `governance`: `tools/github/audit-permissions.ts`
- Create in target `governance`: `tools/github/audit-permissions.test.ts`
- Create in target `governance`: `distribution/github/repository-settings.v1.json`

**Interfaces:**

```ts
interface RepositorySecuritySettings {
  repository: string;
  secretScanning: true;
  pushProtection: true;
  dependabotAlerts: true;
  securityUpdates: true;
  privateVulnerabilityReporting: true;
  ruleset: {
    strictChecks: true;
    conversationsResolved: true;
    signedCommits: true;
    linearHistory: true;
    forcePush: false;
    deletion: false;
    adminEnforced: true;
    requiredApprovals: 0;
    exactCommitReviewCheck: string;
  };
}
```

- [ ] Write tests asserting identical security defaults for every admitted repository and rejecting any missing repository, admin bypass, force-push, branch deletion, mutable required check, or unsigned-commit allowance.
- [ ] Write permission-audit tests that require personal-account identity, `delete_repo`, required repository administration rights, and the organization ruleset scope before cutover.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Implement pure settings rendering and a read-only permission audit. The audit prints scopes and booleans only, never token values.
- [ ] Generate the settings payload for all possible targets; filter it only by signed conditional verdicts.
- [ ] Assert the payload includes only the 14 certain targets and admitted conditionals from the 36-source public inventory; local Signalement has no GitHub remote and remains outside this transaction under private-first authority. Preserve the `db-inspect` slug and `Libre AI Database Inspector` display name in metadata fixtures.
- [ ] Compare a second generation byte-for-byte and hash it into the transaction manifest.
- [ ] Do not apply the payload in this packet.
- [ ] Commit as `feat: render secure GitHub repository settings`.

Expected final evidence:

```text
SECURITY RELEASE READY: eu_runner=pass signer=isolated github_payload=complete anonymous_consumers=pass
```
