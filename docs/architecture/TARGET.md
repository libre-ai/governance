# Architecture cible

## Autorité

Le monorepo `libre-ai/libre-ai` est l’unique source modifiable. Il est hébergé sur Forgejo auto-hébergé sur Clever Cloud Paris/UE avec runners européens. GitHub est un miroir public sans autorité de merge. Les repositories spécialisés sont des projections générées ; les anciens repositories sont des archives.

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
agent-orchestrator → graphe compilé, jamais UI produit
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

- OIDC éventuel pour authentification externe ;
- session navigateur opaque en cookie HttpOnly ;
- Biscuit attenué pour autorisation interne ;
- tenant obligatoire et RLS en défense en profondeur.

## Workspaces

- un workspace Bun et un `bun.lock` ;
- un workspace Cargo et un `Cargo.lock` ;
- versions publiques indépendantes et tags namespacés.
