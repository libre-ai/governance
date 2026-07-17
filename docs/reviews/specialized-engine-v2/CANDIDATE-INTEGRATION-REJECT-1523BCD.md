# Revue candidate-integration — `engine-golden-vectors-v1`

- `reviewPassId`: `engine-golden-vectors-v1-candidate-integration-1523bcd-r1`
- `mode`: `candidate-integration`, strictement review-only
- `role`: candidate-integration reviewer ; **ni Architecture, ni Security, ni promotion**
- `date`: `2026-07-17T12:26:15Z`
- `provider/model`: `OpenAI / identifiant exact du modèle non exposé par le harness`
- `agent/session`: `API coding assistant / session non exposée par le harness`
- `target`: `1523bcd19eeb3d83bb0ff92295c5729d8b43adee`
- `base d’intégration` (premier parent): `79d02b67cc961ca68d844d07e7f0f23838ccac1f`
- `second parent`: `ded4d6b8a926264da9a84694234b7dd806198fb6`
- `base de remédiation inspectée`: `d0c25bcd3988242ac097d02613bf5608669cd50e`
- `HEAD tree`: `36a0fabc4c5de22cc9a97d111809ac8f93ed602c`, identique au tree de `ded4d6b`
- `authority`: `candidate`, `pending-independent-agent-review`, rôles requis `architecture` et `security`

## Limite d’autorité

Cette passe ne constitue aucune approbation Architecture ou Security et n’autorise aucune promotion. Elle n’autorise aucun moteur, implémentation produit, scoring public, traitement de données réelles/personnelles/tenant, capability réseau/fichier/stockage/horloge/aléa, release, infrastructure, Clever Cloud ou déploiement. Le constat reste limité à l’intégration du candidat contractuel.

## État Git et historique inspecté

`git rev-parse HEAD` a rendu exactement `1523bcd19eeb3d83bb0ff92295c5729d8b43adee`. Le worktree était détaché et propre avant la revue. L’ascendance complète de la remédiation a été inspectée, notamment `0311d98`, `12e5b73`, `3ec2f2e`, `9f15ae8`, `ae455b9`, `2eae7ba`, `2ccb05c`, `3baecf8`, `79d02b6`, `39f776e`, `e6df443`, `9e74bab`, `ded4d6b` et le merge cible. Les historiques complets du schéma et des fonctions de scan ont aussi été relus avec `git log --all --follow/-G`.

Le delta `79d02b6..HEAD` contient seulement dix fichiers : `STATUS.md`, le dossier de revue et `tools/quality/check-contracts.ts`. Il ne modifie ni schéma, ni catalogue, ni corpus public, ni projection TS/Rust, ni WIT/profil moteur. Le catalogue contient un seul candidat : `engine-golden-vectors-v1`.

Le dossier `docs/reviews/specialized-engine-v2/` a été lu intégralement, avec toutes ses approbations et tous ses rejets présents. Le rejet supplémentaire de `9e74bab`, conservé sur la branche distante `origin/fix/engine-envelope-named-email` au commit `a4e74a6bbcc11115901c5aae41db95450447911d`, a également été inspecté.

## Surface relue

- gouvernance : `AGENTS.md`, `GOALS.md`, `STATUS.md`, registre de décisions, ADR-0003, protocole de revue et prompt G2 ;
- schéma/catalogue/fixture : `contracts/catalog.v1.json`, `engine-golden-vectors.v1.schema.json`, fixture correspondante dans `schema-fixtures.v1.json` ;
- projections : générateur et déclaration TypeScript, manifeste, registry TS, `contract-types` Rust (`build.rs`, registry, fixtures), WIT/public projection ;
- cinq corpus publics synthétiques complets : Radar, Notebook, Policy v1, Policy v2 et Boussole ;
- corpus auxiliaires pertinents : Radar/Boussole security, Policy operators/budgets/raw manifest ;
- gate partagé, helper JSON strict et checkers dédiés Radar, Notebook structure/Gate A, Policy v1/v2 et Boussole ;
- WIT et profils/SEMANTICS Radar, Notebook, Policy v1/v2 et Boussole ;
- historique et diff complet de la remédiation.

## Contrôles et résultats

### Gates Bun épinglées

Toolchain exact : `bun --revision` → `1.4.0-canary.1+57f349f63`.

- `bun install --frozen-lockfile` : succès ;
- `bun run check` : succès ;
  - contracts : 71 entrées, 47 paires de fixtures, 103 opérations HTTP ;
  - Policy v1 : 17 golden, 28 operators, 9 refus raw ;
  - Radar : 43 parse, 16 evaluation, 18 boundaries, 16 refus ;
  - Notebook : 10 mutations backup, 12 context, Gate A ;
  - Policy v2 : 20 golden, 28 operators, 9 raw, 10 boundaries ;
  - Boussole : 10 methodology, 8 raw, 8 resources, 11 refus, 1 maximum arithmetic ;
  - génération : 48 projections TS vérifiées ;
  - Biome, TypeScript et licences : succès ;
  - tests : `128 pass, 0 fail` ;
- `bun audit` : aucune vulnérabilité.

Preuve : `/tmp/engine-envelope-bun-ci.log`, SHA-256 `582a581689214408a2b7447efc6e94418b0a64313ca7f75e797ad0c2a7462a33`.

### Gates Rust épinglées

Toolchain : `rustc/cargo 1.97.0`, cible `wasm32-unknown-unknown`, `cargo-deny 0.19.5`.

- `cargo fmt --all --check` : succès ;
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` : succès ;
- `cargo test --workspace --all-features` : succès, 40 tests exécutés, aucun échec ;
- build WASM Notebook `--locked --release` : succès ;
- contrôle d’import/cap mémoire : succès, 0 module import, 0 component import, plafond 512 MiB ;
- rebuild reproductible : `cmp` succès ; SHA-256 identique `6ad5148c97ab3d0169a67a499460a1c1db24da694e023fdc1f546f5d61d20427` ;
- `cargo deny check advisories licenses sources` : succès.

Le premier transcript Rust a conservé un rouge d’environnement : le harness impose `CARGO_TARGET_DIR=/tmp/libre-ai-target-engine-envelope-integration-1523`, alors que la commande CI relative cherchait `target/...`. La compilation avait réussi mais l’étape d’inspection ne trouvait pas ce chemin relatif. La commande a été rejouée avec le `target_directory` retourné par `cargo metadata`, puis imports, `cmp` et hashes ont réussi. Rien n’est masqué : transcript initial SHA-256 `befebe35dea66bc56ffeb9578f95e11d1ab696b1e81a551fb394282d2118aa8e`, reprise corrigée SHA-256 `16b3796a7c2507414dac93ab2a7f1cf2a5c68de3e768ea72814801b7b3b6ec2d`.

### Sondes indépendantes du gate réel

Toutes les mutations ont été faites dans des copies éphémères hors dépôt.

1. **Préflights stricts et ordre** — le gate réel accepte exactement 8 MiB, profondeur 64, 65 536 code points, 4 096 items, 512 propriétés, clé 128 code points et 200 000 nœuds ; il refuse chaque borne `+1`. BOM, UTF-8 invalide, membre dupliqué, surrogate non apparié, nombre non fini/invalide sont refusés génériquement. L’ordre observé est taille → JSON strict/profondeur → nœuds/chaînes/conteneurs/clés → scan → AJV → résolution `contractFiles`. Un marqueur sensible court-circuite AJV et les refus ne réémettent pas la valeur.

2. **Ownership/résolution** — seules les entrées `contractFiles` sont résolues. Les chemins valides hashés passent ; traversal, URI, absolu, traversal percent-encodé, fichier manquant, répertoire, symlink, symlink hors dépôt, hash faux et chemin dupliqué sont refusés. Les mêmes chaînes dans un payload (`file:`, traversal, absolu) restent inertes et acceptées. Les métadonnées email/traversal/ampersand sont refusées ; le payload conserve `R&D`, `50%`, `release@2`, URL encodée, Unicode et chaînes fichier/traversal.

3. **Radar** — le corpus ne contient qu’un seul hit `@`, le canary exact `https://user:secret@example.org/feed.xml`. La même valeur dans Boussole et une valeur Radar altérée sont refusées. Les huit `contractFiles` Radar sont uniques, non-symlink, internes au dépôt et leurs hashes correspondent.

4. **HTML/encodages** — les 32 alias lowercased annoncés correspondent exactement au sous-ensemble dérivé de la table HTML5 Python 2 231 entrées pour atext ASCII, `@`, `.`, guillemet, crochets et deux-points. Les anciens bypass direct/percent/%u/numeric/named/nested/mixed, `&period;`, les sept alias historiques, `&amp...` sans point-virgule, quoted/escaped, punycode et IP-literal sont détectés. `&at;`, `&alpha;` et un alias inconnu simple restent non décodés.

5. **Scaling** — sur le code exact extrait automatiquement du checker, à 65 536 code points : no-`@` `0,285 ms`, many-`@` `0,324 ms`, dotted-domain failure `0,352 ms`, nested encoding `2,116 ms`, quoted malformed `0,453 ms`, many quoted malformed `0,455 ms`. Les séries 1 024→65 536 évoluent linéairement ; aucun signal ReDoS, coût quadratique ou amplification non bornée n’a été observé.

6. **Corpora** — les cinq fichiers passent le gate partagé puis leurs checkers dédiés. L’audit indépendant ne trouve aucun credential marker et seulement le canary Radar précité. Les corpus ont 43+16 cas Radar, 10 mutations Notebook, 17 cas Policy v1, 20 cas Policy v2 et 10 cas Boussole.

Preuves éphémères principales :

- scanner exact généré : résultat SHA-256 `fdce50bec2acc56104a70a05402eea142e5625d8b400c59f3422fa617924aca1` ;
- 62 mutations du gate réel : résultat SHA-256 `7612d7f3f73aac955aad6d60fe78b21e2cf3841fca6237f2735dbab8dbdda86b` ;
- bords RFC/Unicode supplémentaires : résultat SHA-256 `451ea7abb9b70967f7f4ae4374228fd412a8c9db55b5ef9ed77a455406299d80` ;
- référence HTML5 indépendante : résultat SHA-256 `790a1afad5b1a3f24251df896694f99b08e06905b0e633f2ae77991e0d546ff4` ;
- audit des cinq corpus : résultat SHA-256 `e54876de09d45638efbf28c91539fc7bf951700c98b4a7550906424b0f8222b9` ;
- historique/état : SHA-256 `438f492867fcfdf81655bfb975fc78c1936378650173a5d5012860537fad2f50` ;
- liste complète de hashes : SHA-256 `a8d179a204121eedfbfb2c7c5d98ad6885544db25859e06f6f57fba4891d64b9`.

## Findings bloquants

### `ENGENV-1523-BLK-001` — des adresses RFC/EAI et IDN valides passent dans les valeurs et les clés

Le scanner n’est pas complet sur la surface explicitement demandée.

- `tools/quality/check-contracts.ts:227` limite le local-part non quoted à `\p{L}`, `\p{N}` et atext ASCII. Or RFC 6532 étend `atext` à `UTF8-non-ascii`; un scalaire UTF-8 non ASCII comme un symbole/emoji est donc un local-part EAI valide, mais il est manqué.
- `tools/quality/check-contracts.ts:244-296` ne décode que les alias HTML5 dont le scalaire est dans le petit sous-ensemble syntaxique ASCII. Une local-part Unicode entièrement encodée par un alias HTML5 connu reste séparée de `@` par `;` et passe.
- `tools/quality/check-contracts.ts:385-393` limite les labels de domaine Unicode à lettres/chiffres/points/tirets et le dernier label à des lettres. Des U-labels IDNA valides avec marques Unicode sont manqués.
- Le scan exige l’adjacence locale/`@`/domaine. Les formes RFC 5322 avec CFWS/commentaires autour d’un dot-atom ou quoted-string passent, y compris après décodage percent ou numeric HTML.

Reproduction contre le **gate complet réel**, en valeur puis en clé de payload :

- local-part EAI UTF-8 non lettre/chiffre, directe, percent et numeric HTML : retour `0` ;
- local-part entièrement encodée par entité HTML5 Unicode : retour `0` ;
- domaine IDN U-label comportant des marques : retour `0` ;
- dot-atom/quoted avec CFWS/commentaire, direct et encodé : retour `0`.

Les mêmes exécutions affichent le succès standard `Contracts verified`, pas un refus. Il s’agit de faux négatifs de publication de données personnelles en valeurs **et** clés. Ce finding est bloquant même si toutes les suites intégrées sont vertes.

### `ENGENV-1523-BLK-002` — la détection sur-bloque des non-emails et des alias HTML inconnus

La cible prétend préserver les payloads opaques et ne rejeter que des identifiants email décodés, mais `containsEmailIdentifier` ne valide pas réellement la grammaire dot-atom/DNS : le point est traité comme un simple caractère local et les labels DNS ne sont pas validés.

Le gate réel refuse notamment des payloads opaques non-email avec point initial/double dans le local-part et une local-part ASCII de 65 octets. La fonction exacte refuse aussi des quoted strings préfixées/suffixées et des domaines avec label vide, tiret initial ou label trop long. Cela contredit le contrôle demandé des non-emails maximaux et l’ownership sémantique du payload.

En outre, `tools/quality/check-contracts.ts:296` applique `name.toLowerCase()`. La table indépendante confirme 34 spellings HTML5 case-sensitive, soit 32 noms après lowercasing, mais des formes mixtes telles que `CommaT` ne sont pas des entités HTML5. La référence les laisse inchangées alors que le gate les décode et refuse le payload. `&at;` est correctement préservé, mais l’affirmation générale « unknown named entities remain unchanged » reste fausse.

## Warning majeur d’audit

### `ENGENV-1523-WARN-001` — rejet `9e74bab` absent du dossier courant

Un rejet candidate-integration immuable et directement pertinent existe au commit `a4e74a6bbcc11115901c5aae41db95450447911d` sur `origin/fix/engine-envelope-named-email` : `CANDIDATE-INTEGRATION-REJECT-9E74BAB.md`, fichier SHA-256 `e27011a3f008bac8518e7cce83641530a05cb346cd6df3e1081e8aa8383b8432` (raw reviewer output annoncé `187b27cf05a2feac303acec9fa7e56162c94e712ec454845ba50e7978db27e28`). Il documente le bypass `&amp...` sans point-virgule que la cible ferme effectivement.

Ce record n’est ni présent ni référencé dans le dossier du target, bien que le target descende de son sujet `9e74bab`. Les rejets `ae455`, `3baecf8`, `39f776e`, `e6df443` et le Security reject `79d02` sont correctement conservés/marqués historiques ; l’inventaire n’est cependant pas complet.

## Constats sans finding

- Préflights stricts, limites exactes et ordre avant scan/AJV : conformes dans les sondes.
- `contractFiles` : résolution, confinement, hash et doublons conformes ; payloads path-like inertes.
- Erreurs sensibles : génériques et non réfléchissantes.
- Allowlist Radar : valeur exacte et fichier exact ; aucune autre donnée email/credential dans les cinq corpus.
- Anciens bypass amp/numeric/named/mixed/period/aliases/`&at;`/quadratique/quoted : fermés pour les cas couverts.
- Performance au maximum scanner : linéaire et faible sur les familles demandées.
- Projections TS/Rust : régénération actuelle, runtime validation toujours autoritative ; hash manifeste égal au schéma.
- Souveraineté/confidentialité : aucune nouvelle dépendance ou modification de lock, aucune infrastructure/runtime externe, aucun secret ou PII réel observé, aucun scope produit ajouté.
- Autorité : reste candidate ; aucun moteur sémantique partagé ni override des checkers dédiés n’est introduit.

## SHA-256 normatifs et de preuve

### Autorité, projections et gates

- `contracts/catalog.v1.json` — `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- `contracts/schemas/engine-golden-vectors.v1.schema.json` — `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`
- `contracts/fixtures/schema-fixtures.v1.json` — `fe1f1a274747a2f7393cb4763e23d71d913bf0be883add6cde2d4501af9d7d28`
- `packages/contracts/src/generated/engine-golden-vectors.v1.d.ts` — `47f952ac16bd5c5ac26192cb0da0d5a77bf93c6f412b89801e5d4337ec275816`
- `packages/contracts/src/generated/manifest.json` — `c1def40a03fdb9fafe34c4185249334eee6ffa8fbc6933cfa91932bfa02129da`
- `packages/contracts/scripts/generate-types.ts` — `668b7a3c6e6d11dc3751270a82b7f29cbd382deaabc44e43db3cc939d4c1ae6d`
- `packages/contracts/src/registry.ts` — `42be1d3d1fab23d814ef0accf563f4bc9c1ae94eb992b919dceabf81d17a47bd`
- `crates/contract-types/build.rs` — `6fc8104c990c4b48fe0292af2f9b7f5bd500e4d403dfa322347198bc10779ce6`
- `crates/contract-types/src/lib.rs` — `a8008c6914e94c78fdfaabc6e366e50320ca2a17f8978ce5652716adfe111eec`
- Rust généré éphémère `generated_types.rs` — `b0814959654e3507d11492cffb004f1434fade63acfa7c9da4c661cd3b527695`
- Rust embedded schemas éphémère — `57b7650cfbd78956d26837eb368a507786a731ef4f4163774e8ae96a5e7eb616`
- `tools/quality/check-contracts.ts` — `468753be830d9b5af5a2d9a9af031fa1d82ee24e4a4deafcc0d5ee53ef571545`
- `tools/quality/policy-core-raw-inputs.ts` — `94fc29b0b479be581c063a6c8a566f076319d1f4bd372c82291b7a71b7dcc389`

### Cinq corpus publics

- Radar — `1e8c0f446b254d6b2a15ee68cee8b4485f9fdbe73d38f894bf3464e32ab11365`
- Notebook — `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09`
- Policy v1 — `e13033f2bcf7f790557088018b6453a81232e0b019e1d4089624a3cbab92c3e4`
- Policy v2 — `cbb5023c4a0c31a47d983aed2ad0d0c67309e9da5a8d7833fe7f53f224a98aad`
- Boussole — `f5ac9c7a052b5c7cd3524be5a3d323b5fb65d2fc4cce361c1fed8e12f4204335`

### Checkers dédiés

- Radar — `beca199ab0bb55bf482b23bfa05fea36f71eba4768547f185de55f8165f4ff11`
- Notebook structure — `e7dc3113e2374e396de5f12743c41dafe27b17b6d5caad59a7abbc27f7e03299`
- Notebook Gate A — `0c74c6539a0cdae9608e2d6cd82da62712af6226de3b79d22396d4b001b95c6f`
- Policy v1 — `1b1d738787fde41e33b7a0981cbd5f76597c002314067202f2665c2f07ac380f`
- Policy v2 — `2f13011a3c0c755ec42e17a2a8405a2c3ed8282c082fcb4ab9762d57a9dab7f8`
- Boussole — `7dece6aea797d2d8751e774fea3ab6ce60ef85e4ca145f3ec897db210c370ea0`

### Dossier courant

- `README.md` — `bd7598077664a60b56af45fe01fec401397f21967500ed83d577fbfcc1201609`
- `REMEDIATION.md` — `a5997dda252552b17ed8c64ab5e588c866f4a738b984001a6094a48f0547f878`
- `ARCHITECTURE-VERDICT.md` — `42d02e057731676871ee01dbe64ca6772b8bb8837e6aa490d045f17b40e32ad1`
- `SECURITY-VERDICT.md` — `03c24677664bfcf2b150e9bdf07cc6d1b3a6cd7970a7031efc44f5530add4728`
- `ARCHITECTURE-VERDICT-FINAL.md` — `0833f3f2c390c6ca031e47226f1414746b9f7595af98362a3fc5f7164c404a5f`
- `SECURITY-VERDICT-FINAL.md` — `eddde521d25b35b1f32385ca40a2ea93cbeedb39aebe5bc18e42ff982191f158`
- `CANDIDATE-INTEGRATION-REJECT-AE455.md` — `18c2e8d32892d44546398f18e448316ab01e4791e52f03022aa9c32feb81773b`
- `CANDIDATE-INTEGRATION-79D02.md` — `bd2b9af3136ba6b124e9dfbeeddee67af75c3735529730008f5116bdda2b253a`
- `ARCHITECTURE-VERDICT-79D02.md` — `74725a31d7a3323d32f3b17a5e84a90fd5497fd352edc493b981f1e551ec6a42`
- `SECURITY-VERDICT-79D02.md` — `442fc6009a56c930143e2704fdddf2a4a37f0f1e24bb5ee95d08708bdcd6bc13`
- `CANDIDATE-INTEGRATION-REJECT-3BAECF8.md` — `9dd66f60242f395313553b82eb7e936aa07c633d4f39ad5aebc492aa4c308dbb`
- `CANDIDATE-INTEGRATION-REJECT-39F776E.md` — `6e9dc13e5f11d57a75df483c57cd38b623ea429db4511c43bb4d9bfef5eda84d`
- `CANDIDATE-INTEGRATION-REJECT-E6DF443.md` — `59607db595d156db37723e1bbe47130db2b9c0a9263055a958a4925b4f487967`

La liste exhaustive des autres hashes relus (WIT/profils, corpus security/operators/budgets, protocoles, locks et tests Rust) est `/tmp/engine-envelope-sha256-evidence.txt`, SHA-256 `a8d179a204121eedfbfb2c7c5d98ad6885544db25859e06f6f57fba4891d64b9`.

## Risques résiduels

- Les bypass RFC/EAI/IDN/CFWS bloquants rendent encore possible la publication d’un identifiant privé synthétiquement encodé dans une valeur ou une clé.
- Les faux positifs dot-atom/DNS/HTML case-sensitive empêchent encore certains payloads opaques non-email, contrairement au boundary annoncé.
- Les suites intégrées ne couvrent pas ces classes ; leur état vert n’est donc pas une preuve suffisante.
- Toute correction normative du checker invalidera cette passe et exigera une nouvelle candidate-integration, puis des passes Architecture et Security séparées sur un commit immuable.
- Même après correction, le contrat restera candidate tant qu’une promotion distincte et le jalon owner ne seront pas enregistrés ; aucune autorisation produit/release n’en découlera.

## Preuve finale d’état propre

Après retrait des dépendances éphémères installées pour les gates :

```text
head=1523bcd19eeb3d83bb0ff92295c5729d8b43adee
head_tree=36a0fabc4c5de22cc9a97d111809ac8f93ed602c
branch=DETACHED
## HEAD (no branch)
unstaged_diff=empty
staged_diff=empty
node_modules=absent-restored
repo_target=absent
```

Preuve `/tmp/engine-envelope-clean-state.log`, SHA-256 `4405f1aa8709f8dd6d33bebdbc4961082aa382edbb41976a6b62a495b6296b13`.

VERDICT: reject candidate-integration — valid RFC/EAI/IDN/CFWS email identifiers still bypass the public scanner in payload values and keys, while malformed dot-atoms and non-HTML5 case variants are still over-rejected.
