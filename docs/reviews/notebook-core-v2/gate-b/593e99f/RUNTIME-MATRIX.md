# Gate B — passe runtime, fautes internes et performance Notebook Core v2

## Attribution et cible

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-593e99f-05`
- rôle : `cryptography-runtime`
- mode : passe Gate B `review-only`
- commit revu : `593e99ffe9af52ee4e2bd3d5f7e86564fed4ecb2`
- arbre Git : `fd5d83d429e7cbf7160162f2c58be033fcc738cf`
- base : `d0c25bcd3988242ac097d02613bf5608669cd50e`
- date : 2026-07-17

Le commit cible est immuable. La passe utilise exclusivement les fixtures publiques déterministes et le host de qualification ; aucun host produit, donnée utilisateur, stockage, téléchargement ou mécanisme de sauvegarde n'entre dans le périmètre.

## Autorités et provenance

Les autorités Gate A restent inchangées, notamment WIT `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295`, sémantique `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` et golden `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`.

Le manifeste de qualification `toolchains/notebook-qualification.json` a pour SHA-256 `38a17615f5c8a0baf5e0a9fd747ff165a5e2e31f34a73f568a859f64143fde40`. Le vérificateur a contrôlé versions, descripteur Playwright, exécutables installés et les archives locales suivantes :

| Archive | Version/révision | SHA-256 |
|---|---|---|
| Node Darwin arm64 | `26.5.0` | `48231d6204eca6be13e6c5184dfdffa1d64ad88880364cc2cfb198f872cb2b13` |
| Chromium headless shell | `149.0.7827.55`, révision `1228` | `302f82603be06683947594ecd60f849e362a8fe3dd82a89bd4408477c97e75a6` |
| Firefox | `151.0`, révision `1532` | `7372a999fe4793e62ca7f6fd65fa4b214b89d1e006e988ef156b8e1ef3bc6745` |
| WebKit | `26.5`, révision `2311` | `a029455b79e20f218992899b87cb59dde6f775c89d79f98ead423698cba08f9b` |

La preuve ne dépend d'aucun SaaS à l'exécution et bloque tout trafic non loopback. Les URLs officielles ne servent qu'à la provenance de binaires ouverts exécutés localement ; aucune fixture ni télémétrie ne leur est envoyée.

## Artefacts générés

Le manifeste de build généré avait le SHA-256 `5bb689d32965324536ea1e4ddf35ea2c890563fd5f8f90b4680d27890c0c9a26`. Sa copie JSON uniquement reformatée et archivée dans `BUILD-MANIFEST.json` a le SHA-256 `79d907a777be415aa43216001e2b34ce433dbee1b1da24588fcddd1ea4be2aba`.

| Artefact | SHA-256 |
|---|---|
| module Rust release normal | `516555ad4b300da782c2d6c59b2c842f4a768f0b564ca36a8f521b968169a729` |
| composant normal | `0703b514fc462c3acd432c0a8aa15e58f93a6f8c3084b90f29064c1e3e7a790c` |
| core normal extrait | `de200e1256e2675905c72b0314a916badb5c70441f027408aca05f2177363071` |
| module Rust qualification interne | `01b510a17f1e8d79524e188053fac063a503c9f40326dae474ae4fcdc2b10557` |
| composant qualification interne | `70df3487f6861c78342489b6ec8ab0fabd924721d56586338be0aefc1c84185d` |
| core qualification interne extrait | `71dd0df72c2a7fa80456a7a4fad74c01ca1e5a227b9b0b46b3c013170b5e8639` |
| worker de faute | `785a6af1d1202062bbf94939cd9451cb49e3b6839bc78c230539133687a25844` |
| worker de mesure | `c368b34d875c150ac7e729bb35ffb082cd9e54ffa5a28f69fbda8d5cbf4a87cb` |
| host fermé | `a3bf71c7b557b3f6a82fff866bb331ccaa01490c8296c89162c34cdbf7e060c7` |
| host worker isolé | `35cd6db90703bae9a65fbf5bae6ccf0a103796fe538ea0da0bb83050a6656a53` |

Les composants normal et à fautes exposent exactement le même WIT et n'ont aucun import ; le module à fautes est construit dans un `CARGO_TARGET_DIR` séparé et reste sous `target/`. Le `GlobalAlloc` unsafe et les sentinelles sont conditionnés par `qualification-faults` et `wasm32` ; le hash normal ci-dessus est inchangé lorsque le harness à fautes évolue.

## Fautes internes et récupération

Dans Chromium, Firefox et WebKit, sur les opérations applicables :

- panic Rust interne et allocation infallible de 600 MiB sous maximum WASM 512 MiB : trap/abort fermé en `internal-failure` ;
- première allocation `serde_json` forcée à `null` : abort du parser puis destruction du worker ;
- réservation fallible de sortie JCS forcée à échouer : `resource-limit-exceeded` ;
- réservation de la matrice Argon2id forcée à échouer : `resource-limit-exceeded` ;
- traps ABI, dépassement `memory.grow`, timeout et succès ordinaires antérieurs rejoués ;
- buffers appelants transférés et détachés, worker terminé sur toute issue, aucune sortie plaintext sur faute ;
- une opération correcte dans une instance neuve confirme la récupération après la séquence de fautes.

`bun run qualify:notebook-core-v2:host` passe 6/6 scénarios Playwright, soit les deux suites dans les trois moteurs. Cette preuve ferme les fautes contrôlées de l'allocateur Rust et les frontières `serde_json`/JCS/Argon2id pour le host de qualification. Elle ne provoque pas un OOM du processus navigateur et ne prouve pas l'effacement physique de pages par le moteur ou l'OS.

## Protocole et résultats performance

La classe mesurée est `desktop-arm64-high-memory-reference` : Apple M4 Max, 36 Gio, macOS 26.5.2 arm64. Chaque couple navigateur/profil exécute deux warm-ups puis 20 itérations seal/open sur 16 MiB, avec un worker et une instance neufs par opération. Le p95 est le rang `ceil(0,95 × 20)`. Le temps bout-en-bout comprend chargement/compilation, copies ABI, transferts et destruction. Le RSS additionnel cumule toutes les lignes de processus issues de l'archive navigateur et se rapporte au navigateur vierge ; toutes les mémoires linéaires exportées sont également sommées.

| Navigateur | Profil | Seal p95 bout-en-bout | Open p95 bout-en-bout | Pic RSS additionnel | Budget |
|---|---|---:|---:|---:|---|
| Chromium | producteur | 1 011,9 ms | 976,4 ms | 237,7 MiB | PASS |
| Chromium | maximal | 1 207,4 ms | 1 168,0 ms | 303,8 MiB | PASS |
| Firefox | producteur | **5 515 ms** | **5 342 ms** | **336,3 MiB** | **FAIL** |
| Firefox | maximal | 7 717 ms | 7 576 ms | 435,6 MiB | PASS |
| WebKit | producteur | 708 ms | 977 ms | **304,2 MiB** | **FAIL** |
| WebKit | maximal | 864 ms | 889 ms | 412,6 MiB | PASS |

Le profil producteur a un budget de 5 s et 256 MiB ; le profil maximal, de 10 s et 512 MiB. Les quatre violations sont donc factuelles : p95 seal et open Firefox producteur, RSS Firefox producteur et RSS WebKit producteur. Aucun seuil n'est réinterprété ou relevé après mesure.

Pour le profil maximal, le pic cumulé de mémoire linéaire atteint 145,25 MiB sur seal et 273,375 MiB sur open dans les trois moteurs. Ces chiffres incluent plusieurs mémoires WASM lorsque le composant en instancie ; le RSS reste l'autorité de budget incluant host et copies ABI.

Les quatre distributions de refus convergent toutes vers `authentication-failed`, sans plaintext. Leurs p95 opérationnels restent groupés : environ 118–120 ms dans Chromium, 1 341–1 450 ms dans Firefox et 109–116 ms dans WebKit. Les échantillons complets, p50/p95, RSS, mémoire WASM et environnement ont produit le résumé brut SHA-256 `af1eaab036b91bfddd88d8835ec0efb2241645c7a65b92c64dfa2826aa4dc874`. Sa copie JSON uniquement reformatée et archivée dans `PERFORMANCE-RUNTIME.json` a le SHA-256 `cfecfd11d52d61c66f862c2cf9ba55ecb2985545d6d0d86c1a42acdac17e5c1c`.

## Vérifications rejouées

- `bun run check` : 128 tests, contrats, source policy, licences, Biome et TypeScript verts ;
- `cargo fmt --all --check`, tests workspace all-features et Clippy strict : verts ;
- `cargo deny check advisories licenses sources` et `bun audit` : verts ;
- toolchain avec archives obligatoires : vert ;
- build normal et qualification : WIT identique, imports nuls, plafond 512 MiB ;
- `bun run qualify:notebook-core-v2:host` : 6/6 ;
- matrice performance : 3/3 suites techniquement complètes en 15,3 min, puis sortie volontaire non-zéro sur quatre budgets ;
- aucune requête externe, console/pageerror, persistance ou télémétrie pendant les suites navigateur.

## Réévaluation des blocages

- `GB2-BLK-001` reste ouvert : la provenance Node/navigateurs est maintenant épinglée et vérifiée par archives, mais aucun host produit exact, UI, téléchargement ou cycle IndexedDB n'est autorisé ni revu.
- `GB2-BLK-002` reste ouvert : panic Rust, OOM allocateur et refus contrôlés `serde_json`/JCS/Argon2id sont fermés pour le worker de qualification ; OOM du processus navigateur, futur host produit et effacement physique restent non prouvés.
- `GB2-BLK-003` reste ouvert : les p50/p95, RSS, copies ABI et distributions anti-oracle existent sur une classe, mais quatre budgets échouent et les classes contraintes/supportées ne sont pas couvertes.

Aucune donnée réelle ne peut être utilisée pour étendre ces mesures. Une optimisation du moteur/host doit conserver les autorités verrouillées et refaire toute cette passe sur un nouveau commit immuable ; les budgets ne peuvent pas être assouplis rétroactivement.

## Verdict

**REJECT** pour Gate B, release et tout usage utilisateur.

Le commit est acceptable comme amélioration de preuve expérimentale : provenance et fautes internes sont substantiellement fermées pour le harness, et la matrice révèle des dépassements reproductibles au lieu de les masquer. Il n'autorise ni sauvegarde, ni production, ni host produit. La destruction logique du worker n'est pas une preuve d'effacement physique.
