# Rapport Gate A — SÉCURITÉ — Notebook Core v2

## Identité et indépendance

- `authorAgentId` : `openai-codex/gpt-5.6-sol`
- `authorSessionId` : `019f6b98-4265-7011-8b0e-0091ebba360a`
- `reviewerAgentId` : `openai-codex/gpt-5.5`
- `reviewerSessionId` : `bed128b8-755b-417d-9e39-5c5cf4127d46`
- Provider / modèle reviewer : `openai-codex`, `gpt-5.5`
- Rôle examiné : **SÉCURITÉ uniquement**
- Indépendance : identifiants agent/session distincts, passe fraîche, review-only, aucun fichier modifié, aucun verdict historique réutilisé.

Ce verdict ne vaut aucun autre rôle, aucune autorisation propriétaire, aucun verrouillage, aucune Gate B et aucune release.

## Portée

Revue du commit immuable `a28e116b0a3ebf278412650715e03f7050c0aac0` pour le protocole Notebook Core v2 : WIT, sémantique, schémas v2, golden unique, checkers, dossier sécurité/migration/performance, catalogue et historiques Gate A.

Hors périmètre : approbation cryptographique indépendante, vie privée, architecture, implémentation Rust/WASM inexistante, host navigateur, release.

## Commit, arbre et empreintes

- Commit HEAD vérifié : `a28e116b0a3ebf278412650715e03f7050c0aac0`
- Arbre Git : `cda41e7f9cc620a87ee0488caa06141614fb5b93`
- Arbre `docs/security/notebook-core-v2-review` : `56010a4e25653b84cea7e97859911a5c1f1567f8`
- Arbre fixtures Notebook : `08ff75b9052f7e86a6fb0f20d5a2738170b8c566`
- Propreté : `git status --short` vide avant/après contrôles.
- Signature GitHub présente mais non vérifiable localement : clé publique RSA absente.

Empreintes principales :

| Artefact | SHA-256 |
| --- | --- |
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| `contracts/schemas/context-document.v2.schema.json` | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |
| `tools/quality/check-notebook-v2-vectors.ts` | `a0dbf28007c1d59070d0a039f76328aab5c33c9c3964b6d85a549a7a29e20022` |
| `tools/quality/check-notebook-core-v2-candidate.ts` | `68b953293fef40d428576c9b6cb62a9b1772068fef94c116798675ab769299d9` |

Les empreintes attendues WIT, sémantique, schéma Context et golden correspondent. Copies de revue byte-identiques confirmées par `cmp` pour `world.wit`, les deux schémas backup et le golden.

## Commandes et preuves

Commandes Git / intégrité :

```bash
git rev-parse HEAD
git rev-parse HEAD^{tree}
git rev-parse HEAD:docs/security/notebook-core-v2-review
git status --short
git cat-file -e a28e116b0a3ebf278412650715e03f7050c0aac0^{commit}
git fsck --connectivity-only --no-dangling a28e116b0a3ebf278412650715e03f7050c0aac0
```

Contrôles JSON/UTF-8/BOM/clés dupliquées : script Python local en lecture seule, OK sur catalogue, schémas v2, golden et copies.

Contrôles Bun/Rust avec :

```bash
NODE_PATH=/tmp/libre-ai-notebook-gate-a2-remediation/node_modules
PATH=/Users/ifi6567/Documents/libre-ai/libre-ai/.tools/bun/1.4.0-canary.1:$PATH
```

Résultats :

- `bun --version` → `1.4.0`
- `bun run check:toolchain` → OK, `1.4.0-canary.1+57f349f63`
- `bun run check:contracts` → OK ; Notebook : `10 backup and 12 context mutations`
- `bun run check:notebook-core-v2-candidate` → OK ; WIT fermé, copies uniques, AAD/digest/AES-GCM, 6 frontières ressources rejouées, profil recovery unique
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts` → OK
- `bun run check:generated-contracts` → rouge environnement : `/node_modules/.bin/biome` absent dans ce checkout
- `bun test packages/knowledge/src/projection.test.ts` → rouge environnement : résolution `ajv/dist/2020` absente malgré `NODE_PATH`

Ces deux échecs périphériques sont non masqués ; ils empêchent de revendiquer une reproduction complète des projections dans cet environnement, mais je n’y vois pas de défaut sécurité du protocole Notebook Core v2 examiné.

Les checkers ne se limitent pas à lire `expected` : le checker candidat reconstruit AAD/digest, déchiffre le golden AES-GCM avec la clé fournie, vérifie digest seul, secret 15/17 octets, mutations nonce/sel/ciphertext/AAD, matérialise les cas profondeur/nœuds/liens et compare longueurs/SHA-256 d’entrée/sortie.

## Modèle de menace sécurité

Attaquant capable de fournir :

- JSON hostile : UTF-8 invalide, BOM, clés dupliquées, champs inconnus, JSON imbriqué invalide ou à clés dupliquées ;
- graphes Context invalides : doublons, racines/liens manquants, IDs sémantiques ou non export-scoped ;
- nombres JCS hostiles : arrondis, `2^53`, exposants ;
- entrées DoS/OOM proches de 16 MiB, 22 370 044 octets, profondeur 64, 100 000 nœuds, 16 384 liens ;
- Base64 non canonique, KDF faibles, mauvais secret, secret hors longueur, digest recalculé, nonce/sel/ciphertext/AAD/digest modifiés ;
- tentative de fuite via erreur, log, capacité host, import WASM, stockage ou réseau.

Mesures protocolaires constatées : WIT sans import, enum d’erreurs fermé, statuts `candidate` / `pending-independent-agent-review`, golden unique, limites explicites, profil secret unique 16 octets ↔ 32 hex, séparation Gate A/Gate B claire.

## Constats blocking

Aucun constat blocking ouvert.

## Constats major

Aucun constat major ouvert.

## Constats minor

1. Reproduction complète des projections générées non obtenue dans cet environnement à cause de dépendances locales absentes (`biome`, résolution `ajv`). Non bloquant pour le rôle sécurité protocolaire, mais à rejouer dans une chaîne qualifiée avant promotion globale.

## Risques résiduels

À traiter en Gate B sur le composant/host réels :

- imports module/composant WASM réellement vides et exécution sans WASI ;
- zéroïsation effective secret, clé, état AES/Argon2id et plaintexts d’échec ;
- absence de logs, télémétrie, caches, persistance ou erreurs contenant secret/clé/plaintext ;
- CSPRNG host, unicité ID/sel/nonce/IDs de blocs ;
- comportement OOM/panic et budgets navigateur/appareils ;
- égalité observable des erreurs `authentication-failed` sur mauvais secret, digest faux, tag faux et secret hors bornes ;
- validation runtime du Base64 canonique par décodage puis réencodage.

## Verdict SÉCURITÉ

APPROVE
