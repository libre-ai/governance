# Transformation goals

## G0 — Legacy cleanup and freeze

**Status:** complete.

Preserve user work, reconcile accepted branches, remove machine-local/generated debris, record final SHAs and archive every historical repository.

**Acceptance:** no unreviewed local change lost; `LEGACY-MANIFEST.yaml` complete; no new work targets historical repos.

## G1 — Specification Lock

**Status:** complete. The bounded ADR-0003 `WP-G2-S01` amendment is closed; all 85 catalog authorities are locked after role-separated reviews, promotion passes and owner controls.

Complete contracts, data ownership, auth, refusal behavior, application specifications, naming and work packages.

**Acceptance:** implementation agents receive no unresolved architecture decision.

## G2 — Canonical foundations

**Status:** in progress. `WP-G2-T01`, `WP-G2-C01`, `WP-G2-W01`, `WP-G2-Z01`, the `WP-G2-S01` contract lock and Notebook Core v2 Gate B are complete. No first Radar, Policy, Boussole or Notebook product milestone is authorized until a new explicit owner selection.

Deliver root Bun/Cargo workspaces, Knowledge Engine, web platform, specialized Rust boundaries, contracts, Proof, Artifact and a qualified Bun template.

**Current control:** Notebook Gate B approves only the exact disabled fixture-only host and qualified 32+ GiB class. User backups, personal/tenant data, activation, production, release, infrastructure and any next product-engine implementation remain unauthorized pending a separate owner milestone.

**Acceptance:** reference chain builds and verifies from a clean checkout without Clever Cloud; Notebook Gate B must separately approve the exact product host and supported physical resource classes before any user backup or release.

## G3 — Parallel reconstruction

Build all target applications and capabilities in their final paths, with continuous integration and no compatibility layer.

**Sequencing authority:** post-G2 execution is ordered by [`docs/transformation/EXECUTION-SEQUENCING.md`](docs/transformation/EXECUTION-SEQUENCING.md) (ADR-0009): foundations and agent layers ship first, applications are wave 4 — the former nine-apps-in-parallel reading is superseded.

**Acceptance:** all target workspaces compile and critical journeys have automated evidence.

## G4 — Global integration and cutover

Qualify security, data migration, accessibility, performance, operations and releases; configure Clever Cloud only here.

**Acceptance:** global release candidate deploys and rolls back independently of historical repositories.

## G5 — Distribution

Publish packages, documentation, context packs and reproducible evidence; activate real public product repositories on explicit owner decision (ADR-0008).

**Acceptance:** an independent actor can reconstruct and verify a distributed capability.
