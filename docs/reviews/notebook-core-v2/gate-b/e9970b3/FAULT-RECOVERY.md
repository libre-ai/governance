# Gate B — passe fault recovery Notebook Core v2

## Attribution et cible

- `reviewPassId` : `notebook-core-v2-gate-b-cryptography-runtime-e9970b3-04`
- rôle : `cryptography-runtime`
- mode : passe Gate B `review-only`
- commit revu : `e9970b39736d2c65f57f87955a98891b75384c63`
- arbre Git : `d0e837be3ee1d7feabe6afb7a5675991465a067b`
- base mergée : `8affae6e1af20628dda31c040aeeba7c96ff846d`
- date : 2026-07-17

Le worktree est resté propre pendant la passe. Le périmètre est exclusivement le host/harness de
qualification sans données utilisateur, UI, persistance ni producteur de sauvegardes.

## Autorités et artefacts

Les six autorités verrouillées conservent leurs SHA-256 Gate A. Le module release et le composant
fonctionnel restent byte-identiques aux passes précédentes.

| Artefact généré | SHA-256 |
|---|---|
| module Rust release | `6ad5148c97ab3d0169a67a499460a1c1db24da694e023fdc1f546f5d61d20427` |
| composant | `09252bf8dbbbd2c2f7151725dd4066d004000d85f584f9721b38c7daeb281a4a` |
| core extrait par le transpileur | `456cdcbbe76004067980473bc8c41bd7e560e251bcd9f64ba85608fd51a31ed9` |
| trap `canonicalize-context` | `3ee5220e6cc93655621818fbf73685d82b7cbd926cc5aaccb74b179c4f9d6318` |
| trap `open-backup` | `d9f415dfab80a1f1a0d6b47752ca6da51f0eb755ce03c9fada043a065028dde2` |
| trap `seal-backup` | `d36e43f3592f3c41dc9db4e810e7e333a0c14d3c46bc429c922cb5cceff673e2` |
| wrapper Component Model | `ced45517e0efb2099fe641c1c9605731f95a8eb2a16836dbd2b2f58b3901b0d1` |
| host fermé | `a3bf71c7b557b3f6a82fff866bb331ccaa01490c8296c89162c34cdbf7e060c7` |
| host worker isolé | `35cd6db90703bae9a65fbf5bae6ccf0a103796fe538ea0da0bb83050a6656a53` |
| worker de faute | `0ec7674eaf679a63642e846996106b6eafab9b7f61c0c7d20e734a444b53965a` |

Deux builds complets ont produit des répertoires byte-identical hors résultats Playwright.

## Méthode de faute

Le harness transpile d'abord le composant verrouillé. Pour chaque opération, l'outil Rust
`inject_wasm_trap` copie le core extrait, conserve les déclarations locales de l'export ABI ciblé et
remplace ses instructions par `unreachable`, des `nop` de remplissage et `end`. La taille reste fixe ;
`wasmparser` revalide chaque module. Les copies sont ignorées sous `target/` et ne sont jamais des
artefacts livrables.

L'injection de plafond mémoire utilise l'instance du vrai core et remplace seulement la fonction ABI
dans une façade d'exports ordinaire. Après que le wrapper Component Model a abaissé et copié les
entrées dans la mémoire linéaire, l'appel demande `memory.grow(8193)` pages alors que le maximum
inspecté est 8192 pages/512 MiB. L'API JS lève un `RangeError`, fermé en
`resource-limit-exceeded`. Une troisième variante bloque au même point ABI ; le host récupère
uniquement par deadline et `Worker.terminate()`.

Chaque opération possède un nouveau worker et une nouvelle instance. Les `ArrayBuffer` host sont
transférés, donc détachés du realm appelant. Sur succès comme refus, erreur de clone/démarrage,
réponse hostile, trap, plafond mémoire ou timeout, les handlers sont retirés et le worker est détruit.
Seuls une longueur et un SHA-256 des sorties publiques sortent du worker ; aucun plaintext n'est
retourné par ce protocole de preuve.

## Preuves rejouées

- `bun run check` : 128 tests, types, Biome, contrats et licences verts ;
- `cargo test --workspace --all-features` : vert ;
- Clippy workspace strict : vert ;
- `cargo deny` et `bun audit` : verts ;
- `bun run qualify:notebook-core-v2:host` : 6/6 tests, deux scénarios dans chacun de Chromium,
  Firefox et WebKit ;
- zéro requête externe, console/pageerror, stockage ou télémétrie ;
- zéro import core/composant et aucun shim WASI inchangés.

Dans chacun des trois navigateurs :

- succès isolé exact de Context, seal et open ;
- trap de chacun des trois exports → `internal-failure` statique ;
- dépassement du maximum mémoire sur chacun des trois exports → `resource-limit-exceeded` statique ;
- blocage de `open-backup` → deadline puis `resource-limit-exceeded` ;
- buffers appelants détachés dans tous ces cas ;
- opération correcte après les fautes, donc récupération par nouvelle instance ;
- aucune sortie plaintext sur faute.

## Réévaluation Gate B

Le sous-bloc **copies ABI + politique de destruction d'instance après faute** de `GB2-BLK-002` est
fermé pour le harness de qualification. La stratégie ne dépend plus de destructeurs Rust après trap :
la totalité du worker et de sa mémoire WASM est abandonnée.

`GB2-BLK-002` reste néanmoins ouvert pour la release :

- le trap est injecté à l'entrée de l'export après copies ABI, pas produit par un panic interne Rust ;
- le plafond `memory.grow` est réellement refusé, mais aucune allocation de `serde_json`, JCS,
  Argon2id ou de l'allocateur Rust n'est forcée à échouer ;
- aucun OOM du processus navigateur n'est induit ;
- destruction logique d'instance ne prouve pas l'effacement physique par le moteur/OS ;
- le futur host produit n'est pas encore fondé sur cette politique worker.

Les autres blocages restent inchangés :

- `GB2-BLK-001` : host produit et archives Node/navigateurs épinglées absents ;
- `GB2-BLK-003` : p95, pic mémoire, classes d'appareil et distributions temporelles absents.

Aucun nouveau constat blocking ou major n'est introduit par ce commit. Le timer host sert uniquement
à la deadline de destruction ; aucune horloge n'est importée par WASM.

## Verdict

**REJECT** pour Gate B/release.

Le commit est acceptable comme preuve expérimentale de récupération host. Il n'autorise aucune donnée
utilisateur, sauvegarde, production ou release et ne ferme pas les injections internes ni les deux
autres blocages Gate B.
