# Rapport Gate A — CRYPTOGRAPHIE — Notebook Core v2

## Identité et indépendance

- **authorAgentId :** `openai-codex/gpt-5.6-sol`
- **authorSessionId :** `019f6b98-4265-7011-8b0e-0091ebba360a`
- **reviewerAgentId :** `openai-codex/gpt-5.6-luna`
- **reviewerSessionId :** `254da782-0985-4e2c-9643-4f3c780abe18`
- **provider/modèle reviewer :** `openai-codex`, `gpt-5.6-luna`
- Passe fraîche, review-only, sans modification du dépôt ni commit.
- Les rapports historiques ont été consultés uniquement comme contexte ; aucun verdict ni calcul historique n’est réutilisé.
- Rôle examiné exclusivement : **cryptographie**.

## Portée

Revue du protocole et des vecteurs : Argon2id, AES-256-GCM, AAD, digest, Base64, JCS/Context v2, anti-oracle, bornes, migration v2 et responsabilités cryptographiques du host.

Aucun moteur Rust/WASM ni host Notebook n’est présent. Zéroïsation effective, imports du composant, comportement OOM/panic et performances navigateur restent Gate B.

## Commit, arbre et propreté

- **Commit :** `a28e116b0a3ebf278412650715e03f7050c0aac0`
- **Arbre :** `cda41e7f9cc620a87ee0488caa06141614fb5b93`
- **Worktree :** propre.
- `git status --porcelain=v1 --untracked-files=all` : vide.
- `git diff --quiet` : OK.
- `git diff --cached --quiet` : OK.
- `git fsck --no-dangling --no-progress` : aucun défaut signalé.

## Empreintes des artefacts

| Artefact | SHA-256 |
|---|---|
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| `contracts/schemas/context-document.v2.schema.json` | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |

Les copies du dossier de sécurité sont byte-identiques aux autorités canoniques.

## Outils et harness indépendant

Harness jetable : `/tmp/notebook-gate-a3-crypto-rustcrypto`.

Chaîne indépendante RustCrypto, sans pyca/cryptography, OpenSSL EVP_KDF, Bun Web Crypto ni Node Web Crypto pour les calculs :

- `rustc 1.97.0`
- `cargo 1.97.0`
- `argon2 0.5.3`
- `aes-gcm 0.10.3`
- `sha2 0.10.9`
- `base64 0.22.1`
- `serde_jcs 0.1.0`
- `serde_json 1.0.150`
- `hex 0.4.3`

Le `derivedKeyHex` golden n’a pas été utilisé comme entrée : la clé a été dérivée depuis les 16 octets du recovery code et le sel.

### Empreintes du harness

| Fichier | SHA-256 |
|---|---|
| `/tmp/notebook-gate-a3-crypto-rustcrypto/Cargo.toml` | `972fe9e8555b41786e687409aa47c009971788896f1f4eefd395b9542863aa7d` |
| `/tmp/notebook-gate-a3-crypto-rustcrypto/Cargo.lock` | `f97224e3fa6be24dd9cd4562c62be3caf9ac935771d42e1629dc1aa8ae335693` |
| `/tmp/notebook-gate-a3-crypto-rustcrypto/src/main.rs` | `e9a6c3f99175bd1a23874b18c08a09597e7dc6be7a768f0ce19484859e915d82` |
| `/tmp/notebook-gate-a3-crypto-rustcrypto/output.txt` | `96f97348a4aeca7b921c17a152748b2dcf6a71b54b3d00211e848c7a67fd4fd0` |

Commande de vérification exécutée :

```bash
cd /tmp/notebook-gate-a3-crypto-rustcrypto
shasum -a 256 Cargo.toml Cargo.lock src/main.rs output.txt
```

## Commandes et résultats

```bash
export NODE_PATH=/tmp/libre-ai-notebook-gate-a2-remediation/node_modules
export PATH=/Users/ifi6567/Documents/libre-ai/libre-ai/.tools/bun/1.4.0-canary.1:$PATH

bun tools/quality/check-notebook-core-v2-candidate.ts
bun tools/quality/check-notebook-v2-vectors.ts
bun run check:contracts
cargo test --workspace

cd /tmp/notebook-gate-a3-crypto-rustcrypto
cargo run --release -- \
  /private/tmp/libre-ai-notebook-gate-a3-cryptography/contracts/fixtures/notebook-core-v2/golden-vectors.v1.json
```

Résultats :

- Gate S : verte ;
- 10 mutations backup et 12 mutations Context ;
- contrats : 71 entrées, 47 paires de fixtures, 103 opérations HTTP ;
- tests Rust workspace : verts ;
- harness : `RESULT=OK RustCrypto independent reproduction`.

`bun run check:generated-contracts` n’a pas terminé faute de `node_modules/.bin/biome`. Cet échec d’environnement ne concerne pas la reproduction cryptographique.

## Valeurs reproduites

### Argon2id

- `P` : `202122232425262728292a2b2c2d2e2f`
- `S` : `000102030405060708090a0b0c0d0e0f`
- `K` et `X` : vides
- Argon2id v19, `m=65536 KiB`, `t=3`, `p=1`
- sortie directe : 32 octets
- clé dérivée :

```text
d1c64b3e330a7ac9164db94b4f31eb6b2b1dc3d4864886ca5e873b34eda0f5ff
```

### AAD

- domaine : `UTF8("libre-ai.notebook-backup.v2/aad") || 00`
- longueur : **339 octets**
- JCS et octets reproduits exactement.

### AES-256-GCM

- nonce : `101112131415161718191a1b`
- tag : `18dc9abc6d3bb3cc73d8f4d322f19a3b`
- `C||T` : 61 octets
- Base64 :

```text
4PA1VNwPPNBuHncS2wpawM9V9JAaJ1xh7pL3dl3oONjmk8REsjntO0Qc3oqRGNyavG07s8xz2PTTIvGaOw==
```

- ouverture positive : plaintext de 45 octets restitué.

### Digest

- domaine : `UTF8("libre-ai.notebook-backup.v2/digest") || 00`
- seul `digest` exclu de la préimage
- digest :

```text
ddefc877172074fed3709ec46a804a2b76857f37e6eec586ce38a5f0011092ec
```

### Context v2

- `totalBytes` : 52
- sortie JCS : 737 octets
- digest :

```text
a61760a034015ac8bfea1da72487be13dd31d2574653b991626d69891d7f0575
```

Vérifiés :

- tri UTF-8 des blocs, racines et liens ;
- IDs `blk_` export-scoped ;
- `333333333.33333329 → 333333333.3333333` ;
- maximum numérique `9007199254740991` ;
- refus de `9007199254740992`, `-9007199254740992` et `1e16` ;
- Base64 canonique ;
- profil unique `libre-ai.recovery-secret-code.v1`.

## Matrice des dix mutations

| Mutation | Résultat | Argon2id | AES-GCM | Plaintext |
|---|---|---:|---:|---:|
| mauvais recovery secret | `authentication-failed` | oui | oui | non |
| secret 15 octets | `authentication-failed`, chemin factice | oui | oui | non |
| secret 17 octets | `authentication-failed`, chemin factice | oui | oui | non |
| nonce modifié | `authentication-failed` | oui | oui | non |
| sel modifié | `authentication-failed` | oui | oui | non |
| ciphertext modifié | `authentication-failed` | oui | oui | non |
| AAD/ID modifié | `authentication-failed` | oui | oui | non |
| digest seul modifié | `authentication-failed` | oui | oui, GCM valide | non |
| paramètres KDF faibles | `invalid-envelope` | non | non | non |
| version inconnue | `unsupported-version` | non | non | non |

Le digest seul ne court-circuite pas AES-GCM.

## Analyse

- Argon2id est correctement paramétré, borné et utilisé directement comme clé AES-256.
- AES-GCM utilise un nonce de 96 bits, un tag de 128 bits et le format `C||T`.
- AAD et digest ont des domaines séparés.
- Le digest ne remplace jamais l’authentification GCM.
- Les erreurs cryptographiques valides convergent vers `authentication-failed`.
- Le code recovery fournit 128 bits d’entropie si le CSPRNG host est correct.
- La réutilisation d’un couple clé/nonce GCM serait catastrophique ; fraîcheur des IDs, sels et nonces relève du host.
- Le major v2 et l’absence d’adaptateur v1 heuristique sont justifiés.
- Les règles JCS/Base64 et le domaine numérique Context sont déterministes et vérifiés.

## Constats

### Blocking

Aucun.

### Major

Aucun.

### Minor

Aucun constat cryptographique ouvert.

## Risques et budgets Gate B

Gate B doit vérifier :

- imports module/composant WASM vides et exécution sans WASI ;
- zéroïsation du secret, de la clé, de l’état AES, de la mémoire Argon2id et des plaintexts d’échec ;
- absence de secrets dans persistance, logs, erreurs, métriques, globals et caches ;
- CSPRNG et unicité des IDs, sels et nonces ;
- absence de court-circuit GCM ;
- comportement OOM/panic sans fallback ;
- mêmes erreurs observables pour mauvais secret, digest faux, tag faux et secrets hors bornes.

Budgets proposés à mesurer :

| Profil | Pic mémoire cible | p95 scellement/ouverture |
|---|---:|---:|
| `m=65536,t=3,p=1`, plaintext 16 MiB | ≤ 256 MiB | ≤ 5 s |
| `m=131072,t=4,p=4`, plaintext 16 MiB | ≤ 512 MiB | ≤ 10 s |

Ces budgets doivent être validés par navigateur et classe d’appareil. Un échec impose de réduire la matrice de support ou de modifier le contrat avant promotion.

Ce verdict ne vaut aucun autre rôle, aucune autorisation propriétaire, aucun verrouillage, aucune Gate B et aucune release.

## Verdict CRYPTOGRAPHIE

APPROVE
