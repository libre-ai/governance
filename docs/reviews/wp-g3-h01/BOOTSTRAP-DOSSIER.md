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

## Verdicts K4 indépendants — EN ATTENTE

Le fan-out (rôles architecture + security, modèle non-Claude, pattern
`retro-k4`) sur `5bee6a3` est **bloqué par la limite d'usage du provider**
(Codex ; clever-ai sans clé, google sans clé). Les verdicts seront ajoutés ici
(`architecture.verdict.json`, `security.verdict.json`, plan + journal) dès
déblocage — veille armée. **Le prononcé sur pièce complète attend ces deux
verdicts** ; le présent dossier fige tout le reste.

## Décision demandée au propriétaire

`accept` (merge squash de #13, message propre) / `hold` / `reject` — après
lecture des verdicts K4 à venir. Un `accept` amorce la chaîne de confiance
D4 : les répétitions du même pattern (packages harness suivants) se prononcent
ensuite automatiquement sur dossier propre.
