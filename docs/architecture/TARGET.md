# Architecture cible

## Autorité

Le socle `libre-ai/libre-ai` est l’autorité unique des contrats, spécifications et fondations partagées, et GitHub reste la forge canonique déjà arbitrée. La cible est multi-repository (ADR-0008) : de vrais repositories produits et de famille se construisent sur le socle consommé comme dépendance versionnée ; les anciens repositories produits sont des archives réservées comme emplacements de ces futurs repositories ; les anciens repositories d’outillage sont retirés après capture vérifiée. Clever Cloud reste la cible runtime Paris/UE, sans configuration ni provisioning pendant le cleanup et la Specification Lock.

## Plans

| Plan                      | Ownership                               |
| ------------------------- | --------------------------------------- |
| Connaissance et graphe    | `ecosystem/`, `crates/ecosystem-engine` |
| Applications web          | `apps/*` — Bun/TypeScript/React         |
| Plateforme web partagée   | `packages/*`                            |
| Moteurs spécialisés       | `crates/*` — Rust                       |
| Contrats                  | `contracts/`                            |
| Vérification indépendante | `verification/`, `crates/proof`         |
| Artefacts et releases     | `crates/artifact`, `distribution/`      |
| Infrastructure            | `infrastructure/`                       |

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

Toute application et tout package exécutable déclarent `engines.bun: ">=1.4.0"`. Le manifeste racine sélectionne la révision qualifiée par défaut et les lifecycle guards refusent Bun 1.3. Les qualifications qui exigent explicitement Node restent isolées de la stack applicative Bun.

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

## Workspaces

- un workspace Bun et un `bun.lock` ;
- un workspace Cargo et un `Cargo.lock` ;
- versions publiques indépendantes et tags namespacés.
