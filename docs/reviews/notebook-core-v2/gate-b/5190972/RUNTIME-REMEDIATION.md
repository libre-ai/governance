# Gate B — passe runtime et remédiation performance Notebook Core v2

## Attribution et cible

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-5190972-06`
- rôle : `cryptography-runtime`
- mode : passe Gate B `review-only`
- commit revu : `51909729b40320c02287e5b4d675682fcabcd20d`
- arbre Git : `43ca14008c52397c6fc207d539c84d1ca9e999ac`
- base : `6ee4627bda043ca3da11050c8d99e63a286cf321`
- date : 2026-07-17

Le commit cible était propre et immuable pendant la passe. Seules les fixtures publiques déterministes et le host de qualification ont été exécutés. Aucun host produit, donnée utilisateur, stockage, téléchargement ou producteur de sauvegarde n'entre dans le périmètre.

## Autorités et provenance

Les six autorités Gate A sont inchangées :

| Autorité | SHA-256 |
|---|---|
| WIT v2 | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| sémantique | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| Context v2 | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| requête seal v2 | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| backup v2 | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| golden | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |

Le manifeste de qualification conserve le SHA-256 `38a17615f5c8a0baf5e0a9fd747ff165a5e2e31f34a73f568a859f64143fde40`. Le vérificateur a imposé les archives locales Node `26.5.0`, Chromium `149.0.7827.55`/révision `1228`, Firefox `151.0`/révision `1532` et WebKit `26.5`/révision `2311`, avec les mêmes empreintes archivées par la passe `593e99f-05`.

La configuration WASM `.cargo/config.toml` a le SHA-256 `91a502066e179b2525929d903b188b1b6bb10e6b105a81b33a834497c50481a4`. Le build refuse les flags Rust externes, wrappers, overrides de profil release, overrides de cible wasm32 et `CARGO_TARGET_DIR`. L'inspecteur exige des instructions SIMD128 réelles, zéro import module/composant et le maximum linéaire 512 MiB.

## Dépendance AES locale

`aes 0.8.4` est vendored depuis l'archive crates.io SHA-256 `b169f7a6d4742236a0a00c541b845991d0ac43e546831af1249753ab4c3aa3a0`, licences MIT OR Apache-2.0 conservées. Le diff cryptographique `BACKEND.patch`, SHA-256 `b9e251ff0d818bdb2051f97373f75d8ed99c59e03e7ca4fbfdb77f332d6957bf`, change uniquement la sélection wasm32 vers l'implémentation RustCrypto `fixslice64.rs` existante, constante en temps au niveau source. Il ne modifie ni algorithme, ni schedule, ni `Drop` zéroïsant, ni surface unsafe.

`aes-wasm` a été refusé parce que son implémentation livrée désactive explicitement les mitigations de canaux auxiliaires ; `ring` a été refusé pour cette frontière car sa clé AEAD étendue privée n'expose pas de destruction zéroïsante vérifiable. `cargo deny` accepte advisories, licences et sources ; aucun service crypto, SaaS ou hyperscaler n'est ajouté.

## Artefacts générés

Le manifeste brut a le SHA-256 `33aa9de791e3f1e96a87203969381bc98a0cfb99659e8db7512bf2ad59533cc2`. Sa copie uniquement reformatée [`BUILD-MANIFEST.json`](BUILD-MANIFEST.json) a le SHA-256 `26edc4e533d42dc4abffca148c6cbb886bd55f5274a0a5d6fbec2eb59dfa8259`.

| Artefact | SHA-256 |
|---|---|
| module Rust release normal | `a4c968ccb98eea35e5e92166d801b71f0bcf1fd0284af7c47b3406f83dd881dc` |
| composant normal | `cdee672768945bd261100e52d4e6f7380b79969c5580c492b29a0d19c71ce13b` |
| core normal extrait | `be423962e3a889e792a69a1ab60b978bcbf5ae1102db74a68c70a9a1c65e5942` |
| module qualification interne | `bd7e7405c8f4c378375ad1dbf2aaeafb56c458a4fd4a8c3dba9336ec0f83399b` |
| composant qualification interne | `c88cca31eaccf37d3a39776d633adf4aa6c714d8dd0c8b1ce2f14d95eb16558d` |
| core qualification extrait | `ba4e3c270b8789b8207cb3947d2dea08d2bcd8e91b30b507b95bc2da3eb6ab86` |
| worker de mesure | `2b6beb4c356c219cf2476b4c112633ac53b31279457d4c3aff6b88d2b095d23c` |
| worker de faute | `785a6af1d1202062bbf94939cd9451cb49e3b6839bc78c230539133687a25844` |
| host fermé | `a3bf71c7b557b3f6a82fff866bb331ccaa01490c8296c89162c34cdbf7e060c7` |
| host worker isolé | `35cd6db90703bae9a65fbf5bae6ccf0a103796fe538ea0da0bb83050a6656a53` |

Deux reconstructions consécutives ont produit des manifestes byte-identiques avant le gel du candidat. Le composant normal et l'artefact de fautes exposent le même WIT fermé. Aucun artefact généré n'est commité hors de cette preuve JSON.

## Remédiation examinée

Le moteur emprunte les grandes chaînes JSON, valide les longueurs Base64 avant décodage, libère la matrice Argon2id avant d'allouer le ciphertext, calcule le digest par segments et écrit directement l'enveloppe JCS finale. Le test unitaire compare cette émission manuelle au sérialiseur JCS générique sur les deux frontières KDF. Le golden, les mutations, les limites et l'anti-oracle restent exacts.

Le host de mesure compile une fois le module import-free dans Firefox, puis clone uniquement ce code immuable vers des workers dont l'instance et la mémoire restent neuves. Chromium et WebKit compilent dans chaque worker. La compilation Firefox, mesurée après le RSS de référence, est ajoutée à chaque temps bout-en-bout ; la compilation des deux autres moteurs est directement incluse. Le résultat public 16 MiB est comparé par index à `0x5a`, sans copie Web Crypto ni itérateur par octet. Le worker est terminé sur chaque issue.

Le probe `serde_json` de l'artefact à fautes utilise désormais un parse explicite vers `String` possédé : le parse normal d'une enveloppe valide emprunte toutes ses grandes chaînes et ne réalise plus d'allocation à faire échouer. Ce probe reste non livrable et teste la frontière allocateur de la dépendance sans affecter l'artefact normal.

## Résultats performance

Classe unique : `desktop-arm64-high-memory-reference`, Apple M4 Max, 36 Gio, macOS 26.5.2 arm64. Deux warm-ups puis 20 itérations mesurées par navigateur/profil, worker et instance neufs par opération. Les budgets demeurent `≤ 5 s` et `≤ 256 MiB` pour le profil producteur, `≤ 10 s` et `≤ 512 MiB` pour le profil maximal.

| Navigateur | Profil | Seal p95 bout-en-bout | Open p95 bout-en-bout | Pic RSS additionnel | Budget |
|---|---|---:|---:|---:|---|
| Chromium | producteur | 832 ms | 832 ms | 166,5 MiB | PASS |
| Chromium | maximal | 967 ms | 1 004,8 ms | 237,1 MiB | PASS |
| Firefox | producteur | 4 600 ms | 4 468 ms | 230,7 MiB | PASS |
| Firefox | maximal | 9 035 ms | 9 653 ms | 307,4 MiB | PASS |
| WebKit | producteur | 547 ms | 587 ms | 219,7 MiB | PASS |
| WebKit | maximal | 750 ms | 788 ms | 311,4 MiB | PASS |

Le pic de mémoire linéaire est identique dans les trois moteurs : 81,25/86,50 MiB seal/open au profil producteur et 145,25/150,50 MiB au profil maximal. Les quatre distributions publiques refusent toutes avec `authentication-failed`, sans plaintext. Firefox a subi de la variance de scheduling sur `digest-modified` ; le code exécute néanmoins le même KDF et le déchiffrement avant le refus, et aucun seuil temporel anti-oracle n'est revendiqué.

Le résumé brut `performance-summary.json` avait le SHA-256 `26ad6ad176e4986e10d974fa760bf62195e6b4199527221ec1c9fbef74e1099e` et le verdict automatisé `qualification-budgets-pass`. Sa copie uniquement reformatée [`PERFORMANCE-RUNTIME.json`](PERFORMANCE-RUNTIME.json), qui contient les trois rapports et tous les échantillons, a le SHA-256 `377df47bb7001b13f992682ecd9f36812948e9d7da7ffb7d95263ac3215d3b17`.

## Vérifications rejouées

- `bun run check` : 218 tests, contrats, source policy, licences, Biome et TypeScript verts ;
- `cargo fmt --all --check`, tests workspace all-features et Clippy strict : verts ;
- `cargo deny check advisories licenses sources` et `bun audit` : verts ;
- toolchain avec archives obligatoires : vert ;
- build reproductible : SIMD128, WIT identique, imports nuls, plafond 512 MiB ;
- `bun run qualify:notebook-core-v2:host` : 6/6 dans les trois moteurs ;
- matrice performance : 3/3 en 13,7 min, verdict automatisé PASS ;
- aucune requête externe, console/pageerror, persistance ou télémétrie pendant les suites navigateur.

## Findings et risques résiduels

Aucun finding bloquant, majeur ou mineur n'est relevé dans la remédiation moteur/host de qualification sur la classe mesurée. Le dépassement performance `593e99f-05` est fermé sans modification d'autorité ni de budget.

Risques non bloquants pour ce seul incrément, mais bloquants pour Gate B globale :

- la marge Firefox maximal open n'est que de 347 ms ; aucune extrapolation n'est permise ;
- le fork local `aes` impose de réauditer tout futur update contre l'archive et `BACKEND.patch` ;
- la destruction logique du worker ne prouve pas l'effacement physique des pages.

## Réévaluation des blocages

- `GB2-BLK-001` reste ouvert : le host exact de production, l'UI, le téléchargement et le cycle IndexedDB sont absents et interdits.
- `GB2-BLK-002` reste ouvert : les traps, panic/OOM Rust et allocations contrôlées sont fermés pour le harness ; l'OOM du processus navigateur, l'effacement physique et les fautes du futur host produit ne sont pas prouvés.
- `GB2-BLK-003` reste ouvert mais réduit : les budgets p95/RSS passent sur la classe desktop de référence ; aucune classe contrainte ou liste d'appareils réellement supportés n'est qualifiée.

## Verdict

**REJECT** pour Gate B globale, release et tout usage utilisateur.

Le résultat ferme les budgets de la classe de référence et conserve le contrat Gate A, mais n'autorise ni sauvegarde utilisateur, ni host produit, ni production. Une passe distincte sur matériel contraint, puis la revue du host produit exact et des fautes processus, restent obligatoires.
