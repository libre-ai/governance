# Gate B — revue cryptographie/runtime de Notebook Core v2

## Attribution et cible immuable

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-5395e45-01`
- rôle : `cryptography-runtime`
- mode : passe `review-only` Gate B
- commit revu : `5395e45577b4282e4cfe2b143540e11d7dd24d80`
- arbre Git : `fddf07c99b900b70aced7797c08129f963cf9794`
- branche source : `feature/notebook-core-v2-gate-b-experimental`
- worktree de revue : détaché sur le commit ; propre avant et après la passe
- harness : pi
- fournisseur : OpenAI
- modèle/session : non exposés par le harness
- date : 2026-07-17

Ce verdict couvre exclusivement la Gate B cryptographie/runtime du composant réellement présent à ce
commit. Il ne remplace ni une décision propriétaire, ni les gates projet
`rust-boundary-value-review` et `local-crypto-and-privacy-review`.

## Autorités verrouillées

Les six autorités sont inchangées par rapport à Gate A :

| Autorité | SHA-256 |
|---|---|
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| `contracts/schemas/context-document.v2.schema.json` | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |

Le diff ciblé depuis la promotion Gate A est vide pour ces autorités.

## Artefact et environnement reproduits

- Rust/Cargo : `1.97.0`
- cible : `wasm32-unknown-unknown`
- OS de mesure native : macOS Darwin 25.5.0, arm64 Apple M4 Max
- SHA-256 du module release :
  `6ad5148c97ab3d0169a67a499460a1c1db24da694e023fdc1f546f5d61d20427`
- deux builds propres dans des `CARGO_TARGET_DIR` distincts : octets identiques
- module : zéro import, une mémoire non partagée 32 bits, maximum 8 192 pages / 512 MiB
- composant encodé et validé : zéro import, unique export instance
  `libre-ai:notebook-core/api@2.0.0`

## Preuves rejouées

Commandes principales :

```text
cargo test --locked -p libre-ai-notebook-core --all-features
cargo clippy --locked -p libre-ai-notebook-core --all-targets --all-features -- -D warnings
cargo deny check advisories licenses sources
cargo build --locked -p libre-ai-notebook-core --release --target wasm32-unknown-unknown
cargo run --locked -p libre-ai-notebook-core --example check_wasm_imports -- <module.wasm>
cmp <build-a.wasm> <build-b.wasm>
```

Résultats :

- 9 tests unitaires et 11 tests d'intégration verts ;
- golden backup exact, ouverture exacte et enveloppe canonique exacte ;
- dix mutations backup refusées sans plaintext ;
- secret 15/17 octets, mauvais secret, digest seul, tag/ciphertext, nonce, sel et AAD suivent le refus attendu ;
- golden Context exact, douze mutations, huit cas numériques et six frontières ressources rejoués ;
- enveloppes tronquées, clés dupliquées, champs inconnus et Base64 non canonique refusés ;
- Clippy strict, advisories, licences et sources verts.

## Revue des primitives et de la matière sensible

Versions et configurations constatées :

- `argon2 0.5.3`, Argon2id v19, `hash_password_into_with_memory`, matrice
  `Zeroizing<Vec<Block>>`, aucun PHC/rand/getrandom ;
- `aes-gcm 0.10.3`, detached tag 16 octets et API in-place ;
- feature anchors `aes 0.8.4`, `ghash 0.5.1`, `polyval 0.6.2` avec `zeroize` afin
  d'activer l'effacement du schedule AES et de l'état GHASH/POLYVAL du backend logiciel WASM ;
- clé 32 octets, recovery secret, plaintext d'échec et matrice Argon2id détenus par des wrappers
  `Zeroizing`/`ZeroizeOnDrop` ;
- types de plaintext non clonables et `Debug` de `OpenedBackup` limité à la longueur ;
- aucune clé, plaintext ou diagnostic de bibliothèque dans une globale, un cache, une erreur ou un log
  first-party ;
- `serde_jcs 0.2.0`, `serde_json 1.0.150`, `base64 0.22.1`, `sha2 0.11.0` et
  `subtle 2.6.1` épinglés ; provenance crates.io et licences permissives acceptées par `cargo deny`.

Le chemin anti-oracle Rust ne court-circuite pas les données cryptographiques : après validation
publique, il dérive la clé, exécute GCM et combine avec `&` la validité du digest, du tag et de la
longueur du secret. Les secrets 15/17 octets utilisent un secret factice de 16 octets pour le même
profil Argon2id/AES avant `authentication-failed`.

## Mesures natives conservatoires

Une exécution par profil, processus release neuf ; ce ne sont pas des p95 navigateur :

| Profil | Plaintext | Seal | Open | RSS max |
|---|---:|---:|---:|---:|
| `m=65536,t=3,p=1` | 16 MiB | 193 ms | 166 ms | 208 896 000 octets (~199,2 MiB) |
| `m=131072,t=4,p=4` | 16 MiB | 333 ms | 309 ms | 276 004 864 octets (~263,2 MiB) |

Les deux échantillons natifs respectent les cibles Gate A de 256/512 MiB et 5/10 s. Ils ne prouvent
ni les copies de l'ABI composant, ni un navigateur, ni un appareil contraint.

## Matrice des sept exigences Gate B

| # | Exigence | État sur `5395e45` |
|---:|---|---|
| 1 | WIT/schémas/golden en Rust et navigateur | **partiel** : Rust exact ; aucun host/runtime navigateur n'exécute le composant |
| 2 | choix, versions, provenance et configuration crypto/JCS | **satisfait pour le moteur** |
| 3 | zéroïsation effective sur succès, erreur, allocation et panic | **partiel** : chemins ordinaires couverts par source/features ; allocation/panic/ABI non instrumentés |
| 4 | aucun secret/plaintext dans persistance, logs, erreurs, globals, caches | **satisfait pour le moteur**, **non prouvé pour le host absent** |
| 5 | imports vides et exécution sans WASI | imports module/composant **satisfaits** ; aucune invocation runtime réelle |
| 6 | budgets sur chaque navigateur/classe d'appareil | **non satisfait** : mesures natives ponctuelles uniquement |
| 7 | même erreur observable et aucun plaintext | **satisfait dans l'API Rust**, **non prouvé au host/navigateur ni en timing observé** |

## Constats bloquants

### GB-BLK-001 — aucun host navigateur réel ni exécution du composant

Le dépôt contient le moteur et son adaptateur WIT, mais aucun host Notebook produit ou harness
navigateur qui appelle l'artefact. Il n'existe donc aucune preuve pour : CSPRNG
`crypto.getRandomValues`, fraîcheur des IDs/sel/nonce, décodage hex strict du recovery code,
`try/finally` d'effacement des `Uint8Array`, mapping exact des messages statiques, absence de
persistance/log/télémétrie, ou homogénéité de l'erreur observable. Les critères 1, 4, 5 et 7 restent
incomplets.

**Remédiation requise :** construire un host/harness expérimental sans données utilisateur, exécuter
les fonctions WIT avec les golden/mutations dans les navigateurs supportés et prouver ces
responsabilités host. Aucun host produit, IndexedDB réel ou producteur de sauvegardes ne doit être
activé avant approbation.

### GB-BLK-002 — OOM, panic/trap et copies ABI non qualifiés

Les grandes allocations first-party utilisent `try_reserve` et les destructeurs couvrent les retours
ordinaires. En revanche, les allocations internes de `serde_json`/`serde_jcs` peuvent encore trapper ;
un panic abort WASM peut sauter les destructeurs ; les octets dans les zones ABI et l'état d'une
instance après trap ne sont pas observés. Aucun test n'injecte allocation impossible, panic ou trap,
et aucune politique host ne détruit explicitement l'instance compromise. Le critère 3 n'est pas
satisfait.

**Remédiation requise :** instrumenter un runtime avec plafonds/fuel, forcer les échecs d'allocation
et traps sur chaque opération, vérifier zéro sortie/plaintext/fallback, inspecter au mieux les zones
mémoire, puis détruire et recréer toute instance après trap. Documenter les limites irréductibles de
l'effacement physique.

### GB-BLK-003 — aucune matrice de performances navigateur/appareil

Les deux mesures natives sont sous les budgets, mais Gate B exige p95 seal/open et pic mémoire pour
chaque navigateur et classe d'appareil supportés, avec les copies du host et de l'ABI. Aucun profil de
support, protocole d'échantillonnage, navigateur ou appareil contraint n'est présent. Le critère 6
n'est pas satisfait.

**Remédiation requise :** définir la matrice supportée, mesurer les deux profils KDF à 16 MiB en
conditions répétées, inclure échec d'authentification et pression mémoire, puis réduire la matrice de
support si un budget est dépassé. Le contrat verrouillé ne peut pas être élargi silencieusement.

## Constat non bloquant pour le merge expérimental

La documentation produit `docs/apps/notebook.md` parle encore d'un amendement qui « implements no
engine » et d'un composant futur. Elle doit distinguer le moteur expérimental désormais présent du
host produit toujours absent. Cette correction documentaire ne modifie aucune autorité normative.

## Risques résiduels

- l'effacement physique complet n'est pas garanti par JavaScript, l'allocateur WASM ou le matériel ;
- la taille de l'enveloppe reste observable ;
- la sécurité GCM dépend de la fraîcheur host du sel/nonce et de la qualité des 16 octets recovery ;
- le backend natif n'est pas la cible navigateur qualifiée ;
- un artefact sans import réduit les capacités mais ne prouve pas la conduite du host avant/après appel.

## Verdict

**REJECT**

Le moteur est une base expérimentale solide et peut être fusionné sous l'interdiction explicite de
données utilisateur. La Gate B et toute release restent refusées tant que `GB-BLK-001` à
`GB-BLK-003` ne sont pas fermés sur un commit immuable contenant le composant et le host/harness
réellement exécutés. Toute remédiation impose une nouvelle passe review-only Gate B.
