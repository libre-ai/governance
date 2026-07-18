# Gate B — revue CRYPTOGRAPHY / RUNTIME — Notebook Core v2

## Attribution

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-bfc9e4c-03`
- rôle : `cryptography-runtime`
- mode : passe `review-only`
- date : `2026-07-18`
- commit : `bfc9e4c77082528889ea953cc941a5312edc9b8f`
- arbre : `2da08f9af377d1789ef90394f482c00f245e9f73`
- identifiants agent/session/provider/modèle : non exposés par le harness

Le worktree est resté propre et la passe n'a modifié aucun fichier.

## Invariants

Le delta de gouvernance ne touche aucun des fichiers WIT, schémas, golden, crate Notebook, patch AES ou bindings. Les autorités restent :

- WIT `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` ;
- sémantique `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` ;
- Context v2 `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` ;
- seal request `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` ;
- backup v2 `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` ;
- golden `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`.

Le core livré reste `be423962e3a889e792a69a1ab60b978bcbf5ae1102db74a68c70a9a1c65e5942`, le module Rust reproductible `a4c968ccb98eea35e5e92166d801b71f0bcf1fd0284af7c47b3406f83dd881dc` et les bindings `ced45517e0efb2099fe641c1c9605731f95a8eb2a16836dbd2b2f58b3901b0d1`.

## Reproduction

- Rust 1.97 : fmt, Clippy strict, tests all-features et cargo-deny verts ;
- double build WASM byte-identique ; SIMD128, zéro import module/composant, plafond 512 Mio ;
- Argon2id v19, AES-256-GCM, AAD/digest, recovery 16 octets et limite plaintext 16 Mio inchangés ;
- matrice exacte 20 itérations après deux warm-ups, profils `m=65536,t=3,p=1` et `m=131072,t=4,p=4`, sans relâchement ;
- tous les profils passent sur les trois moteurs.

## Findings

- blocking cryptographie/runtime : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

La destruction des workers et la zéroïsation des buffers possédés restent best-effort et ne prouvent pas l'effacement RAM/swap. L'OOM du processus navigateur n'est pas une propriété cryptographique démontrée par le cap WASM.

**VERDICT: approve**
