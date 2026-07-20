# Dossier de lock — porte de la vague 3 (ARRÊT DUR PERMANENT, ADR-0011 D3)

- **Date :** 2026-07-20 · **Run :** jalon α · **PR :** #139 (`spec/loop-security-kernel-lock`, draft)
- **Nature :** **ARRÊT DUR PERMANENT (ADR-0011 D3).** Le noyau de sécurité des boucles K1-K5 est spécifié et verrouillé au socle, sa revue adversariale indépendante est produite, ce dossier est écrit — **puis STOP.** Le prononcé du Specification Lock orchestrateur est un **acte propriétaire nominatif exclusif, jamais automatisé, à chaque occurrence** — l'autorisation de merge permanente ne le couvre PAS (frontière non délégable). C'est la fin du run α ; la vague 3 (Polaris) et la vague 4b sont le jalon β, après ton prononcé.

Conformément à ADR-0011 D3 : « un agent verrouille le noyau K1-K5, lance sa revue indépendante, produit le dossier (état du noyau, verdict de la revue, périmètre du lock), puis s'arrête. »

## 1. État du noyau K1-K5 (verrouillé au socle)

Spec : `docs/specifications/LOOP-SECURITY-KERNEL.md` (réalise I-18). Fidélité au noyau control-plane : **exacte** (verdict K4). État par contrôle :

| Contrôle                    | Réalisation socle                                                                                         | État                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **K1** identité des agents  | Biscuit (Z01) + faits `agent_fleet`/`mission_agent`/`capability_scope` + révocation per-agent fail-closed | **spécifié** — les faits s'intègrent au datalog d'autorité AU lock orchestrateur (c'est ce lock qui ouvre l'exécution réelle) |
| **K2** classification       | `@libre-ai/classification` (mergé #138)                                                                   | **en service** — gate d'autorité scellée, revue CLEAN                                                                         |
| **K3** enveloppe            | `@libre-ai/envelope` (mergé #137, `envelope.v1` candidate)                                                | **revu** — promotion→locked sur le 1er consommateur dogfooding                                                                |
| **K4** mutations garde-fous | CODEOWNERS + gate doctrine + revue indépendante                                                           | **en service**                                                                                                                |
| **K5** registre immuable    | `INVARIANTS.md` + protection main + gate doctrine                                                         | **en service**                                                                                                                |

Les deux contrôles qui se complètent **au** lock orchestrateur (K1 faits, K3 promotion) le font par conception (§8 « spécifié et prêt à verrouiller le lock »), pas par lacune de cette spec.

## 2. Verdict de la revue indépendante (K4)

`docs/reviews/loop-security-kernel/VERDICT-dd74b46.md` : **APPROVE-WITH-CONDITIONS** — fidélité control-plane exacte, **zéro faille architecturale ou de sécurité** ; les 3 findings bloquants étaient rédactionnels (sur-claim « locked » vs « specified/reviewed »), **réconciliés** au commit `6bf4ccb` (vocabulaire d'état normatif + nommage explicite des 2 contrôles complétés au lock). Les briques couche-3 sous-jacentes ont leurs propres revues K4 : envelope (sécu APPROVE 51 tests d'attaque, crypto APPROVE), classification (revue + verify CLEAN après fix du sceau WeakSet).

## 3. Périmètre du lock orchestrateur (ce que ton prononcé couvre)

Le Specification Lock orchestrateur est **composite** (control-plane `ecosystem/plans/orchestrator-lock-inputs.md`) : plans d'exécution + protocole de contrôle + harness + mémoire + autorisation. Ton prononcé, à la vague 3 :

1. **consomme** cette spec K1-K5 comme autorité ;
2. **intègre** les faits d'identité d'agent K1 au template Biscuit (`contracts/authz/authority-v1.datalog`) + clauses `check if` de l'authorizer ;
3. **promeut** `envelope.v1` candidate→locked avec son premier consommateur (rappel mémoire) ;
4. **ouvre** l'exécution réelle des agents (Polaris) — la boucle auto-alimentée officielle démarre, la flotte étant son premier client.

## 4. ARRÊT DUR — décision demandée

Je **ne prononce pas** le lock. Conformément à D3, je m'arrête ici. Ce dossier est produit ; PR #139 (draft) porte la spec verrouillée. **Le prononcé du Specification Lock orchestrateur t'appartient exclusivement** — c'est l'acte qui démarre la boucle auto-alimentée officielle, le composant le plus sensible du système, dont le coût d'un franchissement erroné est disproportionné devant celui d'un arrêt pour prononcé humain.

## 5. Bilan du run α (jusqu'à la porte V3)

- **Phase 0** Lexicon Lock signée (#130) + enforcement (#131).
- **G2 CLOS** : D01 données/RLS (#123, amorçage D4), Q01 harness → clôture (#132/#133).
- **Vague 1** couche 4 interne complète : renommage ui (#134), métadonnées (#135), vitrines (#136) ; **publication satellites différée** (setup npm propriétaire).
- **Vague 2** couche 3 : envelope K3 (#137, amorçage D4 prononcé), classification K2 (#138, auto-mergé), **noyau K1-K5 verrouillé au socle** (#139, ce dossier). artifacts = `crates/artifact` acquis. provenance/proof : contrats présents, signature Ed25519 gated sur cérémonie de clé (différée).
- **Vague 4a Notebook** (pilote) : Gate B déjà approuvée ; non exécutée dans ce run (hors chemin porte V3).

**Restes du jalon β (après ton prononcé) :** intégration K1 au datalog + promotion envelope, exécution vague 3 (Polaris), vague 4b (autres moteurs), publication satellites (setup npm), cérémonie de clé Ed25519 (provenance/proof/lineage).

**Fin du run α.** J'attends ton prononcé nominatif du Specification Lock orchestrateur.
