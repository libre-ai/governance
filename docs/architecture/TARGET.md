# Architecture cible

## Autorité

Le monorepo `libre-ai/libre-ai` est l’unique source modifiable et GitHub reste la forge canonique déjà arbitrée. Les repositories spécialisés sont des projections générées ; les anciens repositories sont des archives. Clever Cloud reste la cible runtime Paris/UE, sans configuration ni provisioning pendant le cleanup et la Specification Lock.

## Plans

| Plan | Ownership |
| --- | --- |
| Connaissance et graphe | `ecosystem/`, `crates/ecosystem-engine` |
| Applications web | `apps/*` — Bun/TypeScript/React |
| Plateforme web partagée | `packages/*` |
| Moteurs spécialisés | `crates/*` — Rust |
| Contrats | `contracts/` |
| Vérification indépendante | `verification/`, `crates/proof` |
| Artefacts et releases | `crates/artifact`, `distribution/` |
| Infrastructure | `infrastructure/` |

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
