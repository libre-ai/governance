# Architecture cible

## Autorité

ADR-0041/I-32 is the candidate public reconstruction authority; owner signature by
merge precedes adoption. Governance and contracts remain separate authorities.
The public target contract expresses current capabilities and evidence, never private
engineering phases or percentages. LEXICON §14 owns target names. Repositories require
multiple independent consumers, an independently usable capability, or a proved
security/authority boundary; tests are not consumers. There are 14 certain targets and
at most six evidence-admitted conditional targets. Signalement and private
product-research are outside this reconstruction.

The target uses clean signed roots and released SemVer dependencies after rights,
consumer and artifact proof. No public archive, migration aliases or obsolete releases
survive the exact owner-confirmed transaction. Until that confirmation, sources remain
frozen and private staging remains subject to ADR-0038. ADR-0039/I-31 and ADR-0040/D45
are unchanged; this is no service or execution authorization.

## Consumer-driven layouts

Missions retains `apps/missions/src/app`, `authz`, `domain`, `persistence`, `server`,
`shared` and `ui`, integrating Auth and Build Brief. Sessions integrates data rights
under `apps/sessions/src/rgpd`. Canonical contracts stay in `contracts/`; generated SDKs
stay in `generated/typescript/` and `generated/rust/`. Governance absorbs ecosystem-engine
and Mission Control absorbs envelope only where reachability proves an internal boundary.
Each moved path, dependency and acceptance check is recorded. No cosmetic package split
or unproved refactor is accepted.

## Dépendances autorisées

```text
apps → packages → contracts
apps → adaptateurs versionnés → crates
packages ↛ apps
proof → contrats et artefacts publics
futur agent-orchestrator → seulement après lock exécution/contrôle/harness ; jamais UI produit ni DB partagée
ecosystem-engine ↛ logique métier produit
```

## Application Bun

Toute application et tout package exécutable déclarent `engines.bun: ">=1.4.0"`. Le manifeste racine de chaque repo sélectionne la révision qualifiée par défaut et les lifecycle guards refusent Bun 1.3. Les qualifications qui exigent explicitement Node restent isolées de la stack applicative Bun.

```text
Browser
  ↓ HTTPS
Bun.serve adapter
  ↓
Application use case
  ├── TypeScript domain
  ├── Rust/WASM bounded core
  ├── Bun.sql + PostgreSQL/RLS
  ├── Redis non autoritatif
  └── Cellar endpoint explicite
```

Les objets Bun HTTP ne traversent pas la couche application. Les migrations et données appartiennent au produit.

## Interop Rust

1. WASM/WIT pour domaine pur in-process ;
2. CLI JSON pour tooling ;
3. HTTP pour isolation ou scaling indépendant ;
4. FFI uniquement par ADR.

## Auth

- OIDC fournisseur-neutre Authorization Code + PKCE via BFF ;
- session navigateur opaque en cookie `__Host-` HttpOnly, CSRF et rotation ;
- Biscuit Ed25519 attenué, court et révocable pour autorisation interne ;
- tenant obligatoire et RLS en défense en profondeur.

## Workspaces and distribution

Each retained repository owns its Bun/Cargo workspace and pinned dependencies. Public
packages use released SemVer versions; internal packages are private and unpublishable.
One consumer integrates code; no consumer removes code. Canonical/generated separation
and I-05 byte-drift gates remain. I-28/ADR-0031 patched-crate single-home, provenance and
orphan-revision checks remain during staging; registry distribution must preserve their
immutable provenance proof. Build targets retain their explicit wasm configuration.
Only user-consumable SemVer tags are public; no migration tag or compatibility alias.
