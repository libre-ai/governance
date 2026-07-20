# Promotion dossier — `authority-v2` + `agent-runs-v2` : `candidate → locked` (K1 in service)

- **Date :** 2026-07-20 · **Run :** jalon β · **Vague 3 (Polaris, couche 2)**
- **Nature :** promotion de deux contrats sécu-critiques candidate→locked. Répétition du pattern couche 2 (amorçage prononcé #143) : auto sur revue propre. Le lock rend les contrats immuables (major-versioned) et acte K1 « in service ».

## Préconditions — toutes closes

| Précondition                                                       | Preuve                                                                                                                         | État                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| Taxonomie d'identité K1 (3 faits) dans le template d'autorité      | `authority-v2.datalog`, 2 revues K4 (archi APPROVE, sécu APPROVE-WITH-CONDITIONS ; cycle REJECT→révision→verify)               | PR #143 (amorçage prononcé) |
| Authorizer enforçant l'isolation cross-fleet/mission               | `agent-runs-v2.datalog` (raffinement strict de v1) + mirror TS + guard per-règle ; archi APPROVE, sécu APPROVE-WITH-CONDITIONS | PR #145                     |
| Preuve d'enforcement au **vrai biscuit** (pas seulement le mirror) | `ecosystem-engine` : token K1 → authorizer agent-runs-v2 → 11 vecteurs, attaque cross-fleet déniée ; sécu APPROVE              | PR #146                     |
| Émission de tokens agent portant les 3 faits K1 + `token_mission`  | `BiscuitIssuer::issue_agent` ; preuve end-to-end (émission → authorizer réel → allow/deny) ; archi + sécu APPROVE              | PR #147                     |
| Révocation per-agent_id fail-closed à l'émission                   | `AgentRevocationStore` + `issue_agent` (3 branches fail-closed) ; archi APPROVE-WITH-CONDITIONS, sécu APPROVE                  | PR #149                     |

## Consommateurs réels (condition de lock)

- `authority-v2` : consommé par `authz-biscuit` (`issue_agent`, `AUTHORITY_TEMPLATE_V2`, #147) ; consommateur cible `agent-orchestrator`.
- `agent-runs-v2` : exercé au vrai biscuit par `ecosystem-engine` (#146) ; consommateurs cibles `missions`/`agent-orchestrator`/`agent-harness`.

Les deux ne sont plus des contrats orphelins.

## Ce qui reste (différé honnêtement, hors périmètre du lock)

- **Invalidation immédiate des tokens vivants** d'un agent révoqué : contrôle côté validation, atterrit avec le consommateur runtime (orchestrator/harness) ; borné entre-temps par le TTL ≤ 900 s.
- **Enforcement de `capability_scope`** à la frontière tool/write-path : responsabilité du runtime d'agent (le token porte le fait, le runtime doit le vérifier).

Ces deux points dépendent d'un consommateur runtime non encore construit ; ils ne bloquent pas le lock des contrats (la taxonomie + l'enforcement d'autorisation + l'émission + la révocation à l'émission sont en service).

## Effet du lock

- `authority-v2` et `agent-runs-v2` passent `locked` (immuables, major-versioned) dans `contracts/catalog.v1.json`.
- Le noyau K1 (`LOOP-SECURITY-KERNEL.md`) passe **in service**.
- Toute évolution future = nouvelle version majeure (v3), jamais mutation en place.
