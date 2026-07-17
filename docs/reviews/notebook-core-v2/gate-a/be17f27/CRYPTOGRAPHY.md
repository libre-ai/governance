# Gate A — revue cryptographie Notebook Core v2

## Rôle et portée

Rôle examiné : **cryptographie uniquement**.
Passe fraîche, **review-only**, sur le commit immuable `be17f27f5dec71457aca1aedb3100865900a14e1`.
Aucun fichier du dépôt n’a été modifié ; les harness de reproduction ont été créés uniquement sous `/tmp`. Ce verdict ne couvre ni architecture, ni sécurité générale, ni vie privée, ni jalon humain, ni Gate B, ni release.

## Indépendance et outils

Chaîne cryptographique indépendante utilisée : **RustCrypto**, sans pyca/cryptography, sans OpenSSL EVP_KDF, sans Bun/Node Web Crypto pour la reproduction crypto.

Versions observées :

- `rustc 1.97.0`, `cargo 1.97.0`
- harness `/tmp/notebook_gate_a_crypto_review`
- crates directes épinglées :
  - `argon2 = 0.5.3`
  - `aes-gcm = 0.10.3`
  - `sha2 = 0.10.9`
  - `base64 = 0.22.1`
  - `serde_json = 1.0.150`
  - `unicode-normalization = 0.1.25`
- hashes harness `/tmp` :
  - `Cargo.toml`: `be3d909f8849bf5e0c0e2aea293ec8834c3c1e5acc5d63ef932627109b70c858`
  - `src/main.rs`: `3f00464c735baa1d71147c21d62a893d3d2aeabfed1f38395be5522a4b79a3d0`
  - `Cargo.lock`: `42dd83f8525dd9063acd75048c595045692f5f5f72f4942b8f67dbcc708fbffd`

Bun local observé : `1.3.11`. Les checkers ciblés passent, mais `check-toolchain` échoue localement car le pin attendu est `1.4.0-canary.1`. Voir constat mineur M-01.

## Commit, propreté et empreintes

Commandes de liaison exécutées :

```bash
git rev-parse HEAD
git rev-parse HEAD:docs/security/notebook-core-v2-review
git rev-parse HEAD:contracts/fixtures/notebook-core-v2
git status --short
```

Résultats :

- HEAD : `be17f27f5dec71457aca1aedb3100865900a14e1`
- arbre dossier revue : `a36bda9df0afdcceeb41c41292f10d3e0b566afa`
- arbre fixtures Notebook : `f481f4a9b79600880f7ebaa0693199005409edd6`
- dépôt propre avant/après revue : oui, `git status --short` vide

SHA-256 principaux :

| Fichier | SHA-256 |
| --- | --- |
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `c129c58f3c5938fe884b64267b129be41e33941b11ee635d647a2c3181fe85f2` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| `contracts/schemas/context-document.v2.schema.json` | `fe030c2642076588289f5da7814cb44bbff75e7684f487c0c7e4c230e25be455` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `3d25b790c357e8fd27f5bb3759f3217a3db3eb38dcba5980de5ea82ecbb15841` |
| `tools/quality/check-notebook-v2-vectors.ts` | `0a802f7818a31416f7fe1aa6362114cf4bba8ea67c0195a63d7b34b0fd69ec7d` |
| `tools/quality/check-notebook-core-v2-candidate.ts` | `52a832c1f288188035ffb0fe12ef715b5a27d1971c3d6521f4160a2f2a3dc232` |

Copies du dossier sécurité vérifiées byte-identiques par `cmp` pour `world.wit`, les deux schémas backup et le golden unique.

## Commandes exécutées

```bash
bun tools/quality/check-notebook-v2-vectors.ts
bun tools/quality/check-notebook-core-v2-candidate.ts
bun run check:contracts
```

Résultats verts :

- `Notebook vectors structurally verified: 10 backup and 10 context mutations`
- `Notebook Core v2 Gate S verified: ... 10 backup and 10 context mutations, recovery profiles`
- `Contracts verified: 71 catalog entries, 47 schema fixture pairs, 103 HTTP operations`

Commande rouge non cachée :

```bash
bun tools/quality/check-toolchain.ts
```

Échec local : Bun `1.3.11` au lieu de `1.4.0-canary.1`.

Reproduction indépendante :

```bash
cd /tmp/notebook_gate_a_crypto_review
cargo tree -e normal --depth 1
cargo run --release -- /private/tmp/libre-ai-notebook-gate-a2-cryptography/contracts/fixtures/notebook-core-v2/golden-vectors.v1.json
```

Résultat final : `RESULT=OK RustCrypto-independent-reproduction`.

## Valeurs cryptographiques reproduites

Argon2id :

- `P` : recovery secret UTF-8, 35 octets
  `6e6f7465626f6f6b2d636f72652d76322d7075626c69632d746573742d736563726574`
- `S` : `000102030405060708090a0b0c0d0e0f`
- `K` optionnel : vide
- `X` associated data Argon2 : vide
- paramètres : Argon2id v19, `m=65536 KiB`, `t=3`, `p=1`, sortie 32 octets
- clé AES-256 :
  `e6b35d4e67ec1f04cf571aa3cc441746dadec01406cd82a88ec4ea5708183e1c`

AAD :

- JCS metadata reproduit exactement
- longueur AAD : **339 octets**
- SHA-256 AAD : `c882f8286e706ee91a3b3c349ee9740dd65376298d67aa5bfadd0a8c5bbf3c21`

AES-256-GCM :

- nonce : `101112131415161718191a1b`, 12 octets
- tag : 16 octets
- `C || T` Base64 :
  `gzckcwGC5oEMM1spx7R/FJUzsvSkmQWc2VIuohJymZIO6ljAh/JfFsPzlUrkDIS93iOHzyoEp3xW5wUJwQ==`
- digest enveloppe :
  `c3303408ff8242a243a454b5c4606d61b71001233281d0fadb9dc9890d0e85d3`
- enveloppe JCS : 483 octets
- SHA-256 enveloppe JCS : `8c7c97ba57ccc7b49c952589da0730236065b4b9f360161f7b828468ba640dcc`
- ouverture positive : plaintext 45 octets, conforme au golden

## Mutations backup

Les 10 mutations ont été rejouées :

| Mutation | Résultat |
| --- | --- |
| `wrong-recovery-secret` | `authentication-failed`, Argon2id/AES tentés, aucun plaintext |
| `recovery-secret-too-short` | `authentication-failed`, chemin coûteux factice attendu, aucun plaintext |
| `recovery-secret-too-long` | `authentication-failed`, chemin coûteux factice attendu, aucun plaintext |
| `nonce-modified` | `authentication-failed`, digest recomputé valide, tag invalide |
| `salt-modified` | `authentication-failed`, digest recomputé valide, clé différente |
| `ciphertext-modified` | `authentication-failed`, digest recomputé valide, tag invalide |
| `aad-modified` | `authentication-failed`, digest recomputé valide, tag invalide |
| `digest-modified` | `authentication-failed`, AES-GCM valide mais digest invalide, aucun plaintext libéré |
| `weak-kdf-parameters` | `invalid-envelope`, pas d’Argon2id/AES |
| `unsupported-version` | `unsupported-version`, pas d’Argon2id/AES |

Constat crypto : le digest seul ne peut pas authentifier ; le protocole impose bien tag GCM **et** digest valides avant libération.

## Context v2 et recovery profiles

Context v2 reproduit :

- digest : `c9766d5af505c8945655bd1defb554167e02cc66b8a1e807334d74fb2f466c6a`
- sortie canonique : 621 octets
- nombre RFC 8785 vérifié : `333333333.3333333`
- `totalBytes` recalculé : 52

Les 10 refus Context v2 retournent `invalid-document` : BOM, UTF-8 invalide, clé top-level dupliquée, champ inconnu, block ID dupliqué, root manquant, lien manquant, exclusion en conflit, JSON imbriqué invalide, clé imbriquée dupliquée.

Recovery profiles :

- `libre-ai.recovery-secret-code.v1` : 16 octets CSPRNG ↔ 32 hex minuscules, cas reproduit `202122232425262728292a2b2c2d2e2f`
- `libre-ai.recovery-secret-text.v1` : NFC/UTF-8 reproduit, espaces et CRLF préservés, cas NFC/NFD équivalents, rejets BOM initial et surrogate non scalaire présents

## Analyse cryptographique

Aucun défaut cryptographique bloquant ou majeur trouvé dans le candidat Gate A.

Points validés :

- AAD et digest ont une séparation de domaine claire et des préimages non ambiguës.
- AES-256-GCM utilise nonce 96 bits, tag 128 bits, stockage `C || T` sans ambiguïté.
- Argon2id v19 utilise directement la sortie 32 octets comme clé AES-256 ; pas de PHC, HKDF, hash ou troncature cachée.
- Base64 canonique, JCS et RFC 8785 sont suffisamment normatifs pour une implémentation testable.
- L’ordre anti-oracle exige Argon2id/AES-GCM malgré digest faux ou secret hors bornes structurellement valide/factice.
- Les erreurs fermées évitent les diagnostics sensibles.
- Les paramètres faibles publics sont rejetés avant KDF, ce qui est acceptable car aucune opération crypto valide n’existe dans ce cas.

## Constats

### Blocking

Aucun.

### Major

Aucun pour la cryptographie Gate A.

### Minor

- **M-01 — Environnement local Bun non piné.** `check-toolchain` échoue localement (`1.3.11` vs `1.4.0-canary.1`). Les checkers contractuels ciblés sont verts et la reproduction cryptographique indépendante n’utilise pas Bun ; à rerun sous toolchain exacte avant jalon humain/CI.

## Risques et budgets Gate B

Non bloquants pour Gate A, mais à fermer en Gate B :

- zéroïsation réelle secret/clé/état Argon2id/AES/plaintexts d’échec ;
- liste d’imports WASM/module/composant vide et exécution sans WASI ;
- unicité host de l’id, sel et nonce CSPRNG ;
- absence de logs, persistance, métriques ou erreurs contenant secret/clé/plaintext ;
- comportement OOM/panic et absence de fallback KDF ;
- budgets navigateur sur `m=65536,t=3,p=1`, plaintext 16 MiB, ciphertext 16 777 232 octets, enveloppe/context 22 370 044 octets ;
- timing observable entre mauvais secret, digest faux, tag faux et secret hors bornes.

APPROVE
