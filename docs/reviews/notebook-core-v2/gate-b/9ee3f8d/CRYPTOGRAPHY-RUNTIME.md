# Gate B — revue CRYPTOGRAPHIE / RUNTIME — Notebook Core v2

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-9ee3f8d-03`
- rôle : cryptography-runtime
- mode : `review-only`
- date : `2026-07-18`
- commit revu : `9ee3f8da65afce9bce8da98baac72c1aea8bd0ce`
- arbre : `843a95252eb60f08fdc596a20bcbcd19a0b1b4fd`
- base : `895c749df676bf46bc85ee556680025b55c028ff`
- agent/session/provider/modèle : non exposés par le harness

## Portée

Passe dédiée sur les autorités verrouillées, le composant Rust/WASM reconstruit, les paramètres cryptographiques, les limites mémoire internes, l'ordre anti-oracle et l'intégration worker. Aucun fichier n'est modifié pendant la passe.

## Identités vérifiées

- WIT : `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` ;
- golden v2 : `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` ;
- manifeste build core : `33aa9de791e3f1e96a87203969381bc98a0cfb99659e8db7512bf2ad59533cc2` ;
- composant : `cdee672768945bd261100e52d4e6f7380b79969c5580c492b29a0d19c71ce13b` ;
- module core : `a4c968ccb98eea35e5e92166d801b71f0bcf1fd0284af7c47b3406f83dd881dc`.

## Constat

1. Le delta depuis la base ne modifie aucun contrat, schéma, golden, crate cryptographique, patch AES, paramètre KDF ou code produit de backup.
2. Argon2id reste `m=65536,t=3,p=1` en producteur et `m=131072,t=4,p=4` au maximum ; AES-256-GCM, nonce 12 octets, tag 16 octets, AAD/digest et recovery 16 octets restent inchangés.
3. La limite plaintext one-shot reste 16 Mio et le plafond WASM 512 Mio. Aucun fallback KDF, réduction de coût ou élargissement implicite n'est introduit.
4. Le module exige SIMD128, ne possède aucun import core/composant et se reconstruit deux fois byte-identique avec le Node épinglé.
5. Les fautes mémoire internes restent obligatoires malgré le caractère facultatif de l'OOM navigateur : refus `memory.grow`, allocation Rust 600 Mio, failpoints `serde_json`/JCS/Argon2id, panic, traps et timeout détruisent l'instance/worker.
6. Les quatre distributions anti-oracle restent `authentication-failed`, sans plaintext, avec 20 mesures après warm-up dans les trois moteurs.
7. Les temps et RSS passent les budgets verrouillés sans changement cryptographique. La correction RSS ne touche que l'attribution des processus mesurés.
8. L'effacement des buffers est vérifié logiquement sur succès/refus/faute, mais aucune promesse physique RAM/swap/OS n'est formulée.

## Preuves reproduites

- `bun run check:notebook-core-v2` et golden : verts ;
- Rust 1.97 : fmt, Clippy `-D warnings`, tests workspace/all-features et cargo-deny verts ;
- double build core : byte-identique ;
- host/faults core : 6/6 sur Chromium, Firefox et WebKit ;
- matrice finale : profils producteur/maximal et anti-oracle passés sur les trois moteurs.

## Findings

- blocking : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

- zéroïsation physique non démontrable ;
- comportement OOM du processus navigateur non promu, sans incidence sur les preuves OOM/fautes internes ;
- l'approbation ne vaut ni modèle notebook complet, activation, donnée utilisateur ou release.

**VERDICT: approve**
