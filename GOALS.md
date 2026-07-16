# Transformation goals

## G0 — Legacy cleanup and freeze

**Status:** complete.

Preserve user work, reconcile accepted branches, remove machine-local/generated debris, record final SHAs and archive every historical repository.

**Acceptance:** no unreviewed local change lost; `LEGACY-MANIFEST.yaml` complete; no new work targets historical repos.

## G1 — Specification Lock

**Status:** complete except the strictly bounded ADR-0003 WP-G2-S01 candidate amendment, pending independent human reviews.

Complete contracts, data ownership, auth, refusal behavior, application specifications, naming and work packages.

**Acceptance:** implementation agents receive no unresolved architecture decision.

## G2 — Canonical foundations

**Status:** in progress; entry package `WP-G2-T01`.

Deliver root Bun/Cargo workspaces, Knowledge Engine, web platform, specialized Rust boundaries, contracts, Proof, Artifact and a qualified Bun template.

**Acceptance:** reference chain builds and verifies from a clean checkout without Clever Cloud.

## G3 — Parallel reconstruction

Build all target applications and capabilities in their final paths, with continuous integration and no compatibility layer.

**Acceptance:** all target workspaces compile and critical journeys have automated evidence.

## G4 — Global integration and cutover

Qualify security, data migration, accessibility, performance, operations and releases; configure Clever Cloud only here.

**Acceptance:** global release candidate deploys and rolls back independently of historical repositories.

## G5 — Distribution

Publish projections, packages, documentation, context packs and reproducible evidence.

**Acceptance:** an independent actor can reconstruct and verify a distributed capability.
