# Verdict K4 — sécurité — agent-runs-v2 (commit 5ca58c7)

- **Relecteur :** agent indépendant, lentille sécurité (adversarial), lancé séparément de l'implémenteur (K4).
- **Sujet :** `contracts/authz/agent-runs-v2.datalog` + harness.

## Verdict : **APPROVE-WITH-CONDITIONS**

**Constat clé :** l'attaque cross-fleet du REJECT (agent `forge` sur ressource `product-ops`) est **fermée empiriquement pour TOUS les rôles-agents** (author-agent, reviewer-agent, mission-service, orchestrator, harness). Aucun bypass trouvé.

## Résumé adversarial

| Attaque                                                              | Résultat                                |
| -------------------------------------------------------------------- | --------------------------------------- |
| Cross-fleet (REJECT) : agent forge + ressource product-ops           | ✓ DÉNIÉ (unification `$fleet` échoue)   |
| `agent_fleet` manquant                                               | ✓ DÉNIÉ (fail-closed)                   |
| `mission_agent` manquant                                             | ✓ DÉNIÉ (fail-closed)                   |
| Non-membre de mission (agent mission_beta / ressource mission_alpha) | ✓ DÉNIÉ (unification `$mission` échoue) |
| Bypass par double liaison `$fleet`                                   | ✓ DÉNIÉ                                 |
| Forge de `resource_fleet` par l'agent                                | ✓ IMPOSSIBLE (injecté par le handler)   |

Couverture 100 % des règles de rôle-agent gardées ; rôles humains sans guard (correct) ; mirror TS fidèle ; `deny if true` présent.

## Condition bloquante avant merge — TRAITÉE

- **F-SEC-01 :** la « design property » du dossier (« the 15 vectors still pass ») était ambiguë — risque de laisser croire v2 rétro-compatible avec des tokens d'agent sans faits K1, alors que v2 les **refuse** (fail-closed voulu). **Corrigé** : le dossier clarifie que les vecteurs v1 sont testés contre `authorize()` (v1), pas `authorizeV2()`, et que la réémission des tokens v1 sous `authority-v2` est une étape de migration (partie b), pas une régression. Recommandation optionnelle également appliquée : un vecteur allow par rôle-agent (author, reviewer, mission-service, orchestrator, harness) prouve que v2 n'over-refuse pas les ops légitimes. Condition **fermée**.

## Non bloquant (partie b)

Le wiring crate doit émettre les faits K1 et injecter `resource_fleet` correctement — trou honnêtement différé, à revoir en partie b.
