# Gate B — revue CRYPTOGRAPHIE RUNTIME — Notebook Core v2

## Attribution et indépendance

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-96934a8-03`
- rôle : `cryptography-runtime`
- mode : passe spécialisée `review-only`
- date : `2026-07-18`
- identifiants agent/session/provider/modèle : non exposés par le harness

Passe dédiée, sans modification du dépôt. Le verdict couvre la cryptographie implémentée et sa frontière produit, pas l'architecture générale, la vie privée, la performance matérielle ni la release.

## Cible et autorités

- commit : `96934a8e0698db6d35591f811856ff0824db3956`
- arbre : `f51a2c3a3ff85d0c66d7ef244922a37f1b43a9c5`
- worktree/index : propres

| Autorité | SHA-256 |
|---|---|
| WIT v2 | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| sémantique | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| Context v2 | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| seal request v2 | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| backup v2 | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| golden | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |

La surface Notebook crypto (`crates/notebook-core`, `.cargo`, patch AES, WIT, schémas backup, golden) est byte-identique au candidat runtime approuvé `51909729b40320c02287e5b4d675682fcabcd20d`. Les changements workspace ultérieurs ajoutent Biscuit hors crate Notebook, changent la licence first-party et réconcilient la gouvernance via ADR-0005 ; ils ne changent pas le graphe crypto Notebook. `cargo deny` reste vert.

## Artefacts et provenance

- `.cargo/config.toml` : `91a502066e179b2525929d903b188b1b6bb10e6b105a81b33a834497c50481a4`
- patch backend AES : `b9e251ff0d818bdb2051f97373f75d8ed99c59e03e7ca4fbfdb77f332d6957bf`
- `crypto.rs` : `2b1eaf6e86f8322df5cb46563ca3f78de83de9617039bd2eb15ca3e3a247ab47`
- `lib.rs` : `0d8d888efb7f28d74c429187216470bcc47a4bb31beca1c498d9543e8f00cd4a`
- module Rust WASM : `a4c968ccb98eea35e5e92166d801b71f0bcf1fd0284af7c47b3406f83dd881dc`
- composant qualification : `cdee672768945bd261100e52d4e6f7380b79969c5580c492b29a0d19c71ce13b`
- core produit extrait : `be423962e3a889e792a69a1ab60b978bcbf5ae1102db74a68c70a9a1c65e5942`
- bindings produit : `ced45517e0efb2099fe641c1c9605731f95a8eb2a16836dbd2b2f58b3901b0d1`

Dépendances exactes : Argon2 `0.5.3`, AES-GCM `0.10.3`, AES `0.8.4` patché uniquement pour sélectionner `fixslice64` constant-time sur wasm32, SHA-256 `0.11.0`, zeroize `1.9.0`, subtle `2.6.1`. Aucun service crypto, aléa, horloge, réseau, stockage ou log n'est importé.

## Analyse cryptographique

1. **KDF fermé.** Argon2id v19, sortie 32 octets, paramètres producteur `m=65536 KiB,t=3,p=1` et maximum contractuel inchangés. La matrice est préallouée falliblement et enveloppée dans `Zeroizing`.
2. **AEAD.** AES-256-GCM, nonce 96 bits, tag 128 bits détaché puis concaténé. Clé, matrice Argon2id et plaintext/ciphertext en place sont sous zeroize best-effort ; les features AES/GHASH/POLYVAL activent les `Drop` zéroïsants.
3. **AAD/digest.** Domaines séparés, JCS exact, digest comparé constant-time. Le digest ne court-circuite pas GCM : digest, tag et longueur du secret sont combinés après KDF et déchiffrement.
4. **Anti-oracle.** Les recovery 15/17 octets utilisent un secret factice et convergent vers `authentication-failed`. Les mutations digest/tag/secret ne libèrent aucun plaintext.
5. **Base64/JCS.** Alphabet/padding/derniers bits canoniques, bornes calculées avant allocation, émission manuelle comparée au sérialiseur JCS aux frontières KDF.
6. **Host.** Web Crypto fournit séparément ID, recovery, sel et nonce neufs. Les matières sont transférées à un worker jetable et les chaînes recovery ne sont publiées qu'après persistance/téléchargement.
7. **Shipping.** L'artefact normal nie l'unsafe first-party ; allocator/failpoints/panic de qualification sont compilés séparément et refusés par le build produit.

## Preuves reproduites

- golden et mutations via `bun run check` et host composant : verts ;
- 10 tests unitaires crypto/validation + 11 tests golden Rust : verts ;
- Clippy strict et cargo-deny : verts ;
- artefact WASM : SIMD128, zéro import module/composant, mémoire max 512 Mio ;
- deux builds Rust release : byte-identiques, SHA-256 `a4c968cc…81dc` ;
- deux builds produit : byte-identiques, core/bindings/worker identiques ;
- campagne host/fautes : 6/6 sur Chromium, Firefox, WebKit ;
- performances qualifiées historiques de la surface identique : budgets producteur/maximal passés sur la classe M4 Max 36 Gio (`5190972`).

La matrice performance n'a pas été réexécutée pendant cette passe car les quatre archives bootstrap épinglées ne sont plus présentes localement. Aucun téléchargement CDN n'a été substitué. Cette absence ne change pas la preuve historique d'une surface byte-identique, mais interdit de revendiquer une nouvelle mesure de performance pour `96934a8`.

## Findings

### Blocking

Aucun finding cryptographique blocking.

### Major

Aucun finding major.

### Minor

Aucun finding minor dans l'implémentation cryptographique.

## Risques résiduels

- la zéroïsation est logique/best-effort ; copies ABI, moteur, RAM et swap ne sont pas physiquement prouvées ;
- le fork AES doit être réaudité à toute mise à jour ;
- l'absence d'OOM navigateur attribuable ne remet pas en cause l'OOM/failpoints WASM, mais bloque Gate B globale ;
- aucune performance ne peut être extrapolée vers 8 Gio ou 16–24 Gio.

## Verdict du rôle

**VERDICT: approve**

Cryptographie runtime et intégration host approuvées sur la surface exacte. Ce verdict ne qualifie ni les classes matérielles ni Gate B globale.
