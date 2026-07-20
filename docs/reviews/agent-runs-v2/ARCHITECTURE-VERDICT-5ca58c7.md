# Verdict K4 — architecture — agent-runs-v2 (commit 5ca58c7)

- **Relecteur :** agent indépendant, lentille architecture, lancé séparément de l'implémenteur (K4).
- **Sujet :** `contracts/authz/agent-runs-v2.datalog` + harness (`authz-vectors.v2.json`, `authorizeV2`).

## Verdict : **APPROVE** — zéro condition

## Points vérifiés

1. **Raffinement strict de v1** : les 11 règles v1 préservées à l'identique ; 5 rôles-agents augmentés uniformément du guard K1 ; operator/protected-controller intacts ; v2 ne peut que refuser ce que v1 autorisait. Les 15 vecteurs v1 passent.
2. **Liaison fleet/mission correcte** : unification sur `$fleet` (agent = ressource) et sur `$mission` (`mission_agent` = `token_mission` = `resource_mission`) ; pas de variable non liée.
3. **Mirror TS fidèle au datalog** : `authorizeV2 = authorize(v1) ∧ (rôles-agents : same(fleet) ∧ same(mission))` ; vérifié sur les vecteurs, composition transitive saine.
4. **Guard per-règle du gate** : chaque règle de rôle-agent porte les 3 faits K1 ; aucune règle humaine ne les porte ; 5 rôles-agents couverts.
5. **Fail-closed** : fait manquant → règle ne matche pas → `deny if true` final. Versioning (v2 candidate, v1 locked) et périmètre différé (partie b) sains.

## Résiduels (différés partie b, non bloquants)

Émission des faits K1 à l'issuance, injection `resource_fleet` côté handler, réémission des tokens v1 — tous à vérifier dans la revue du wiring crate.
