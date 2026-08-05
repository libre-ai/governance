# WP-G3-H01 — Dossier d'arrêt dur d'amorçage : première exécution confinée, attestée

- **Objet du prononcé :** merge de [orchestrator#13](https://github.com/libre-ai/orchestrator/pull/13)
  (`feat/wp-g3-h01-confined-execution`) — premier merge sécurité-critique de
  la couche 2 (ADR-0011 D4, I-17). Aucun merge par l'agent ; ce dossier est
  produit pour le prononcé propriétaire.
- **Têtes successives :** `5bee6a3` (revue round 1 → 2 rejets), `f27b3c9`
  (remédiation → revue round 2 → 2 rejets), **`db05339`** (remédiation +
  traitement de la revue xhigh, CI verte). Le prononcé reste fermé : une
  nouvelle passe K4 sur `db05339` est requise.
- **Cadre :** ADR-0018 D2 — première capacité réelle ouverte : exécution d'un
  processus local confiné par le harness, produisant sa première attestation
  signée. Restent fermés : réseau sortant, secrets, providers, persistance,
  données tenant, second worker.
- **Date :** 2026-08-05. **Implémenteur :** session agent (Claude), plan validé
  propriétaire avant premier Edit.

## Ce qui est livré

`crates/agent-harness` dans le repo `orchestrator` (workspace à deux membres),
cœur pur d'abord, hôte ensuite, TDD strict (rouge observé avant chaque vert) :

| Surface                          | Contenu                                                                                                                                                                | Refus portés                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `refusal.rs`                     | la matrice fermée de `docs/apps/harness.md` en un enum — 13 variantes, codes stables                                                                                   | les 13                                                                                                    |
| `profile.rs`                     | validation contrat verrouillé (ContractRegistry), adresse de contenu JCS/SHA-256, auto-cohérence du digest embarqué, résolution id+digest                              | `profile_unresolved`, `profile_digest_mismatch`                                                           |
| `controls.rs`                    | profil + faits d'hôte → contrôles effectifs ou refus ; capacités fermées refusées                                                                                      | `platform_unsupported`, `control_not_enforceable`, `capability_not_enabled`                               |
| `fs_policy.rs`                   | décisions pures sur faits canonicalisés ; glob couvrant exactement l'alphabet `relativePath` du contrat                                                                | `path_escapes_workspace`, `symlink_policy_violation`, `write_outside_writable_set`, `denied_path_touched` |
| `outputs.rs`                     | bornes d'octets par outil et totales, scan fail-closed                                                                                                                 | `output_limit_exceeded`, `output_scan_incomplete`                                                         |
| `attestation.rs`                 | assemblage lié (requested ≠ effective distincts), digest, signature Ed25519 (`UTF8(schemaVersion)‖0x00‖digest`), vérificateur indépendant                              | `attestation_binding_incomplete`, `attestation_unsigned`                                                  |
| `host/fs.rs`                     | canonicalisation réelle, symlinks détectés sous la racine seule                                                                                                        | — (produit les faits)                                                                                     |
| `host/process.rs`                | spawn confiné : paire Unix anonyme, env vidé, cap d'octets dur, kill au timeout ; plan privilégié (uid dédié + setpriv)                                                | —                                                                                                         |
| `host/run.rs`                    | le chemin D2 bout-en-bout : résoudre → refuser l'inapplicable → confiner → borner → attester ; `WorkerFault` distinct de la matrice                                    | —                                                                                                         |
| `verification/agent-harness/`    | garde mécanique : réseau + `std::env` bannis partout, `std::fs`/`std::process` sous `src/host/` seul, allowlist+requiredlist de dépendances, dans `check:capabilities` | —                                                                                                         |
| `profiles/local-process.v1.json` | profil canonique content-addressed (`de9b3af5…` depuis `f27b3c9`), plateformes Linux seules ; `engine-manifest.v1.json` (`db11edba…`)                                                   | —                                                                                                         |

## Preuves

- **Vecteurs verrouillés reproduits bit-à-bit** (`contracts/fixtures/agent-orchestration-v1/`) :
  digest profil `b3e3198e…`, digest attestation `4526db20…`, **signature Ed25519
  du vecteur vérifiée** ; signature retournée / clé étrangère / contenu falsifié
  → refusés.
- **66 tests verts** sur le workspace (54 à `5bee6a3`) ; `bun run check` exit 0 ; `cargo fmt` +
  `clippy -D warnings` propres. CI de #13 : 5/5 checks verts.
- **La première exécution confinée réelle attestée a eu lieu** — job « First
  confined execution, attested (privileged e2e) », run CI
  [30988488420](https://github.com/libre-ai/orchestrator/actions/runs/30988488420) :
  identité dédiée créée (`useradd harness-worker`), run sous sudo, worker
  confiné (paire privée, env vidé, bornes), attestation émise puis
  **re-vérifiée indépendamment** (document + clé publique seuls). Le même run
  CI a exercé la jambe non privilégiée (`control_not_enforceable`) et macOS
  local la jambe `platform_unsupported` : les trois vérités, aucun vert par
  contournement.
- **Chaque code de la matrice atteint par au moins un test** (13/13) ; preuve
  anti-fuite (aucun refus ne reflète la valeur rejetée) dans `profile_core`.
- Deux défauts réels attrapés rouges pendant la réalisation : fds worker
  retenus par `Command` (EOF nié → deadline), et `cargo test` racine ignorant
  le membre harness (`default-members` posé — green-by-omission fermé).

## Analyse sécurité (axe #1)

- **Fail-closed partout** : contrôle inapplicable → refus, jamais best-effort ;
  scan inachevé → résultat échoué ; binding incomplet → pas de signature ;
  attestation invalide → refus. La garde mécanique interdit au crate même
  d'ESSAYER réseau/secrets (le code qui le tenterait casse `check`).
- **Auto-autorisation impossible ici** : le harness ne décide rien — profil
  fourni et vérifié par digest, clé fournie en paramètre (cérémonie de clé
  production = acte propriétaire différé), Biscuit hors périmètre (WP-G3-O01).
- **Limites honnêtes** (ce que ce livrable ne prétend PAS) : pas de jail OS
  complet (namespaces/containers explicitement fermés à ce stade) — le
  confinement fs s'applique aux chemins médiés par le harness et le process
  est confiné par identité dédiée/no-new-privs/bornes, pas par mount-ns ;
  `maxProcesses` n'est pas encore porté par une rlimit dédiée ; le scan de
  sortie est structurel (complétude), pas encore un scan de contenu. Chaque
  élargissement = son package + sa revue.

## Risques résiduels

1. Le kill de groupe de processus repose sur le kill du child (le groupe
   entier via `/bin/kill -- -pgid` reste à durcir quand `maxProcesses` sera
   porté) — borné par uid dédié + no-new-privs + timeout.
2. `verifyOsPeer` est satisfait par construction (paire anonyme héritée), pas
   par vérification de crédentiels pairs — documenté dans le code.
3. Deux messages de commit dégradés par l'outillage (un mot parasite à l'étape
   8, des identifiants perdus entre backticks sur `db05339`) — sans effet sur
   `main`, le message de squash étant rédigé au merge.
4. Un mot parasite dans le message du commit local de l'étape 8 (l'amend a été
   refusé par le garde-fou de session) — sans effet si merge squash.

## Verdicts K4 indépendants — **DEUX REJETS** (2026-08-05)

`5bee6a3/architecture.verdict.json` et `5bee6a3/security.verdict.json` —
enveloppes `review-verdict.v0.1`, enregistrements immuables, worktrees
détachés propres après chaque passe.

**Les deux rôles rejettent, sur le même défaut central, trouvé
indépendamment** : _l'attestation lie des contrôles que le run n'applique
pas_. C'est précisément le non-goal du spec (« attester ce qui n'a pas été
appliqué ») et la promesse même du composant.

| Constat bloquant                                                                                                                                                                                                                                                                                                                                                                                               | Rôle         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `filesystem_confinement` est lié dans l'attestation mais **jamais appliqué au worker** : l'observateur est construit puis abandonné (`let _observer = …`), le spawn ne reçoit ni racine, ni `current_dir`, ni chroot — les ensembles readOnly/writable/denied ne médient aucun accès réel                                                                                                                      | archi + sécu |
| `killProcessGroup`, `maxProcesses`, `dedicatedIdentity`, `dropAmbientCapabilities`, `verifyOsPeer`, `runBoundToken` sont **parsés puis jetés** (`ProfileWire` ne lit que `maxDurationSeconds` et `kind`) ; le timeout ne tue que l'enfant direct → **un petit-fils survit à la borne de durée** et retient le transport ; `effectiveProfileDigest == requestedProfileDigest` affirme pourtant le profil entier | archi + sécu |

Majeurs : manifeste du moteur sandbox **asserté par l'appelant**, jamais
vérifié par le harness ; présence de `setpriv` prise du plan appelant au lieu
d'être observée (et `uid 0` accepté comme identité dédiée) ; `--regid` et le
drop des capacités ambiantes absents alors que l'identité est attestée.
Mineurs : garde de capacités contournable par import groupé (régression face à
la garde sœur) ; `chrono` inutile mais rendu obligatoire par la requiredlist ;
assertion e2e figée sur `linux-x86_64` ; `sudo --preserve-env=PATH` en CI.

**Ce que les revues confirment par ailleurs** : couches pures solides (digests,
politique, assemblage/vérification d'attestation), 13/13 codes couverts par des
tests adversariaux, base64url strict, Ed25519 correct avec séparation de
domaine, aucun `unsafe`, aucun secret journalisé, `env_clear` vérifié,
descripteurs harness non fuités (CLOEXEC).

**Conséquence : le prononcé est bloqué.** Le livrable n'est pas mergeable en
l'état — non parce qu'il ferait moins que promis en volume, mais parce qu'il
**dirait plus qu'il ne fait**, dans le document même dont la valeur est d'être
exact. Remédiation nécessaire avant re-revue :

1. Soit appliquer les contrôles (médiation fs réelle dans le spawn, `setsid` +
   `killpg`, `RLIMIT_NPROC`, `--regid`, drop des capacités ambiantes,
   lecture complète du bloc `process`/`workerTransport`), soit **refuser à la
   résolution** tout profil prescrivant ce que ce moteur n'applique pas — le
   patron de refus existe déjà dans le diff, il n'est simplement pas appliqué
   à ces sous-contrôles.
2. `effectiveProfileDigest` doit refléter le profil **effectif**, jamais
   ré-échoer le demandé par construction.
3. Le harness résout et vérifie lui-même l'identité de son moteur.
4. Les faits d'hôte sont observés, pas assertés (sonde `setpriv`, `uid` validé).

### Note d'honnêteté sur l'indépendance des passes

Ces deux passes sont **role-séparées, review-only, sur commit immuable en
worktree détaché vérifié propre** — la règle d'indépendance du protocole
(« Agent/session inequality is not an independence criterion ») est donc
satisfaite. En revanche la **diversité de modèle n'est pas atteinte** : le
provider tiers (Codex) a été retiré de l'outillage sur décision propriétaire
en cours de session, les deux passes tournent donc sur le même modèle que
l'implémenteur. Cette limite est déclarée ici, pas contournée : elle affaiblit
la détection de biais partagés, et les rejets ci-dessus ne doivent pas être
lus comme une couverture équivalente à un challenge inter-modèles.

## Décision demandée au propriétaire

**Aucun `accept` n'est demandé sur `5bee6a3`** : deux rejets indépendants
tiennent le prononcé fermé, et l'arrêt dur d'amorçage a donc fait exactement
son travail — le premier pattern de la couche a été arrêté avant merge par sa
propre revue, pas après.

Le fork ouvert est celui de la **remédiation** :

- **A — Enforcer** ce que le profil prescrit (médiation fs dans le spawn,
  `setsid`/`killpg`, `RLIMIT_NPROC`, `--regid`, capacités ambiantes). Le
  livrable tient alors sa promesse entière ; coût : la surface d'hôte double,
  et chaque mécanisme ajouté demande ses propres tests adversariaux.
- **B — Rétrécir la prescription** : un profil d'amorçage qui ne prescrit que
  ce que ce moteur applique réellement, et un refus à la résolution pour tout
  ce qu'il ne sait pas appliquer. Le livrable dit alors moins, mais dit vrai —
  ce que le spec exige (« un contrôle qui ne peut être appliqué est un refus »).
- **A+B recommandé** : B immédiatement (l'honnêteté de l'attestation est
  l'invariant, elle ne peut pas attendre), A par incréments nommés ensuite,
  chacun élargissant le profil d'amorçage une prescription à la fois.

Dans les trois cas, une **nouvelle passe K4 sur le commit remédié** est
requise avant tout prononcé ; les deux rejets ci-dessus restent des
enregistrements immuables de l'historique de ce package.

## Troisième passe — revue workflow xhigh du 2026-08-05 (`f27b3c9`)

Passe d'un autre genre que les deux précédentes : cadrée sur les **bugs de
correction** plutôt que sur l'architecture, avec interdiction explicite de
re-signaler les constats déjà enregistrés.

**Exécution partielle, déclarée comme telle.** 19 des 22 agents sont morts sur
la limite d'usage du compte, dont les 14 vérificateurs. Le rapport brut
annonçait « aucun finding n'a survécu à la vérification » : artefact de la
coupure, aucune vérification n'ayant eu lieu. Deux finders sur six ont abouti
et produit 15 candidats, vérifiés ensuite par lecture directe du code au
commit cible — six confirmés avec chemin d'échec reproduit, deux plausibles,
sept écartés (redites des deux rounds, ou chemin d'échec non établi).

**Ce que la passe a trouvé, et que les deux rounds adversariaux avaient
qualifié de « couches pures solides et bien testées » :**

| Défaut | Preuve |
| --- | --- |
| le matcher de globs découpait un segment à des offsets d'octets : `café.txt` jugé contre `*.txt` **paniquait** au lieu de refuser | `start byte index 4 is not a char boundary; it is inside 'é'` |
| le même matcher explorait tous les points de coupe par étoile | `a*a*a*a*a*a*a*b` contre 64 caractères : **34,8 s** dans une décision sans timeout propre |
| `Err(_) => break` avalait toute erreur de lecture non-timeout | capture courte, `truncated=false`, attestation signée par-dessus |
| `sign_attestation` signait n'importe quels identifiants de contrôle | une attestation revendiquant `filesystem_confinement` était signée et vérifiée |
| une clé de vérification malformée était rapportée `attestation_unsigned` | l'opérateur conclut au faux plutôt qu'à sa propre erreur d'encodage |
| la garde exemptait toute ligne contenant `forbid(unsafe_code)` | `unsafe { … } // forbid(unsafe_code)` passait ; une prose sur l'unsafety échouait |
| les en-têtes TOML `[[bench]]` étaient invisibles au parseur de sections | les clés du bloc devenaient des noms de dépendances |

**Traitement (`db05339`, CI verte).** Sept corrigés, chacun avec le test qui
reproduit le défaut : matcher caractère-à-caractère à point de retour unique
(0,44 s au lieu de 34,8 s, plus aucun découpage d'octets) ; capture échouée
devenue un fait consigné, groupe reapé, run refusé via
`harness.output_scan_incomplete` ; `assemble` refuse tout identifiant que le
moteur n'offre pas ; `VerificationError` sépare l'entrée malformée du
vérificateur d'un verdict sur le document ; garde corrigée sur ses deux
défauts. Le huitième — la borne totale du ledger, inatteignable tant qu'un run
est un seul spawn — est **laissé ouvert et nommé dans le code**.

**Enseignement de méthode**, à porter dans `CHALLENGER-EVALUATION.md` : le
fan-out n'a pas produit la valeur, l'**angle** l'a produite. Quatre passes
adversariales à 500 k tokens ont trouvé et re-trouvé un thème d'architecture ;
deux finders orientés correction ont trouvé un panic et un hang que ces quatre
passes avaient explicitement déclarés absents. Et la vérification par lecture
a coûté deux commandes là où 14 agents dédiés en auraient coûté ~700 k.

## État des constats bloquants — corrigé après le round 3

Le tableau précédent surdéclarait : il annonçait « quatre des cinq clos » en
comptant cinq constats là où les deux rounds en portaient six, et en omettant
les deux bloquants de sécurité du round 2. Version exacte, vérifiée par le
round 3 (`0ab2a20/security.verdict.json`) :

| Constat bloquant | Round | État réel |
| --- | --- | --- |
| le bloc `process` prescrit était parsé puis jeté | 2 (archi) | **clos** — `2a157c8` |
| `filesystem_confinement` attesté sans mécanisme | 1 (les deux rôles) | **clos** — `f27b3c9` |
| une capture courte silencieuse était signée | xhigh | **clos** — `db05339` |
| `effectiveProfileDigest` ré-échoait le demandé | 2 (archi) | **partiel** — l'écho a disparu (`f5e3bcd`), mais la projection admet quatre prescriptions non appliquées et en omet d'appliquées |
| `workerTransport` inerte (`runBoundToken`) | 2 (archi) | **clos** — `0ab2a20`, jeton réellement exigé |
| `workerTransport` inerte (`verifyOsPeer`) | 2 (archi) | **ouvert, et aggravé** — l'argument « par construction » est réfuté : le pair est l'enfant *et tout descendant* par héritage de fd ; la capacité est désormais signée alors qu'elle ne l'était pas |
| `killProcessGroup` jamais reapé sur un chemin qui attesté | 2 (sécu) | **ouvert** — jamais traité, absent du tableau précédent |
| `maxDurationSeconds` ne borne pas le run (`write_all` avant l'horloge) | 2 (sécu) | **ouvert** — jamais traité, absent du tableau précédent |

S'y ajoutent deux défauts **introduits par les remédiations** et trouvés par le
round 3 : la réécriture du matcher de globs change le langage reconnu (un `*`
littéral dans le sujet peut désormais échapper à un motif — fail-open dans
l'ensemble `denied`), et la borne de sortie s'applique au flux cadré, donc
44 octets plus large que ce que l'attestation content-adresse.

**Trois rounds, trois rejets.** Le dossier ne prétend pas à un livrable prêt :
il enregistre un composant dont la revue indépendante a arrêté chaque version
avant merge, et dont les écarts restants sont nommés plutôt que réduits.

## Après le round 3 — `81e8208`

Quatre traitements, dont un qui défait une revendication de cette session :

- **Revendication réfutée, annulée.** `worker_transport_isolation` avait été
  promue dans le profil sur l'argument « `verifyOsPeer` tient par
  construction ». Le round 3 l'a démoli : le pair au moment de l'écriture est
  l'enfant **et tout descendant** héritant du descripteur — précisément la
  population qu'un contrôle de crédentiels distinguerait. La capacité sort du
  moteur et du profil, le bloc `workerTransport` sort du périmètre attesté.
  Le jeton de run reste : il est réellement appliqué, il n'est pas tout le bloc.
- **Les deux bloquants sécurité du round 2, enfin traités** : la borne de durée
  couvre désormais l'écriture (une charge utile jamais lue ne bloque plus le
  harness), et le groupe est reapé aussi sur le chemin EOF — celui qui
  produisait des attestations en laissant un descendant vivant.
- **Deux régressions introduites par mes propres remédiations, corrigées** : le
  matcher laissait un `*` littéral du sujet consommer le joker du motif
  (fail-open dans `denied`), et la borne de sortie était dépensée sur le cadre
  de transport.

**Ouvert, et sans chemin dans le code :**

1. `verifyOsPeer` — exige `SO_PEERCRED`, donc une dépendance hors allowlist ou
   un amendement d'ADR. Tant qu'il n'est pas tranché, le bloc transport reste
   hors du périmètre attesté et la capacité hors du profil : l'écart est
   déclaré, pas masqué.
2. Le pin du moteur sandbox reste asserté par l'appelant, jamais vérifié par le
   harness contre la déclaration du profil.
3. La projection du digest effectif est bloc-granulaire là où l'application est
   champ-granulaire : tout bloc mixte est faux dans un sens ou dans l'autre.

**Ce que trois rounds ont établi de plus utile n'est pas dans le code** : à
chaque tour, la revue indépendante a arrêté une version que l'implémenteur
tenait pour prête, et deux fois elle a arrêté une remédiation qui aggravait le
défaut qu'elle prétendait clore. L'arrêt dur d'amorçage n'a pas été une
formalité : il a fonctionné quatre fois.

## L'arbitrage `verifyOsPeer`, exécuté et invalidé par son exécution

Décision propriétaire : ajouter une dépendance à l'allowlist pour lire les
crédentiels de pair. Exécutée — `rustix` plutôt que `libc`, parce que chaque
appel `libc` serait un bloc `unsafe` et que le crate interdit `unsafe` au
niveau crate.

**Le mécanisme ne peut pas répondre à la question sur ce transport.**
`SO_PEERCRED` sur une `socketpair()` renvoie les crédentiels du processus
*créateur*, **aux deux bouts** — donc le harness. Il n'existe pas de
`connect()` pour capturer l'identité d'un pair : le syscall répond « qui a créé
ce socket », jamais « qui est à l'autre bout ». La comparaison avec le pid de
l'enfant ne pouvait que diverger, et c'est la **CI Linux qui l'a démontré** —
macOS avait laissé passer, le contrôle y étant refusé pour indisponibilité.

Traitement (`1004b04`) : la capacité ressort plutôt que d'être attestée sur un
contrôle qui prouve autre chose ; `rustix` et le module sont retirés plutôt que
laissés en poids mort ; la raison est écrite dans `controls.rs` pour que le
prochain lecteur ne retente pas le même chemin.

**Ce que la granularité par champ a rendu possible** : `/workerTransport/kind`
et `/runBoundToken` restent dans le périmètre attesté — ils sont appliqués —
tandis que `/verifyOsPeer` et `/hostLoopbackAllowed` en sortent. Une règle par
bloc aurait forcé les quatre dedans ou les quatre dehors ; c'est précisément
le défaut que le round 3 avait nommé.

**Survivent de l'arbitrage, verts** : la vérification du pin de moteur —
l'identité du moteur attesté est désormais une propriété du binaire, le
manifeste voyageant avec le crate et son digest étant confronté à ce que le
profil épingle — et la projection au grain du champ.

**Coût désormais chiffré de la seule voie restante** : appliquer `verifyOsPeer`
exige un socket **nommé** avec `connect`/`accept`, donc un transport différent,
un changement de garde, et un protocole worker qui n'hérite plus de stdio. Le
contrat verrouille pourtant le champ à `const: true`. Deux issues, toutes deux
propriétaires : construire ce transport, ou amender ADR-0018 D2 pour que le
contrat décrive ce que la couche peut tenir.

Deux défauts de plateforme ont par ailleurs été attrapés par la CI Linux et
corrigés en vol : un lockfile absent du commit, et un reap sur le chemin EOF
qui tuait le worker venant de terminer normalement — macOS masquait le second,
le kill y arrivant après la sortie du processus.
