# WP-G3-H01 — Dossier d'arrêt dur d'amorçage : première exécution confinée, attestée

- **Objet du prononcé :** merge de [orchestrator#13](https://github.com/libre-ai/orchestrator/pull/13)
  (`feat/wp-g3-h01-confined-execution`, tête `5bee6a3`) — premier merge
  sécurité-critique de la couche 2 (ADR-0011 D4, I-17). Aucun merge par
  l'agent ; ce dossier est produit pour le prononcé propriétaire.
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
| `profiles/local-process.v1.json` | profil canonique content-addressed (`ea8e56cd…`), plateformes Linux seules ; `engine-manifest.v1.json` (`380ce5c3…`)                                                   | —                                                                                                         |

## Preuves

- **Vecteurs verrouillés reproduits bit-à-bit** (`contracts/fixtures/agent-orchestration-v1/`) :
  digest profil `b3e3198e…`, digest attestation `4526db20…`, **signature Ed25519
  du vecteur vérifiée** ; signature retournée / clé étrangère / contenu falsifié
  → refusés.
- **54 tests verts** sur le workspace ; `bun run check` exit 0 ; `cargo fmt` +
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
3. Un mot parasite dans le message du commit local de l'étape 8 (l'amend a été
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
