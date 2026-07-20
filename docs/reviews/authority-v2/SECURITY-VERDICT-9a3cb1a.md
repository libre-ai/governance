# Verdict K4 — sécurité — authority-v2 (commit 9a3cb1a)

- **Relecteur :** agent indépendant, lentille sécurité (adversarial), lancé séparément de l'implémenteur (K4).
- **Sujet :** `contracts/authz/authority-v2.datalog` (candidate) + `docs/reviews/authority-v2/REVIEW-PACKAGE.md`.
- **Passe :** seconde (après le REJECT sécurité de 1re passe, puis révision).

## Verdict : **APPROVE-WITH-CONDITIONS**

**Constat clé :** la **fausse propriété de sécurité** du REJECT antérieur est **réellement supprimée**. Vérification empirique reconduite de `agent-runs-v1.datalog` : toutes les règles `allow if` consomment `token_mission` / `resource_mission` / rôles, **zéro** consommation de `agent_fleet` ou `mission_agent`. Le contrat le reconnaît maintenant explicitement (section DEFERRED : « NOT yet in force… not an enforced boundary »). Aucune nouvelle fausse affirmation.

## Propriétés vérifiées sûres

- Identité fail-closed : les deux `check if` (`agent_fleet`, `mission_agent`) forcent la présence ; aucun token v1 (sans faits d'agent) n'autorise via v2 ; pas de bypass.
- Révocation per-agent_id fail-closed : structurellement garantie par l'interdit `token_id` du gate (`check-contracts.ts` l. 945) ; le contrat ne contient pas `token_id`.
- `capability_scope` : encodé sans règle `allow if` ; « crate responsibility », jamais CI/gate write par défaut — pas de sur-claim.
- Expiry `check if time` intact ; aucun nom de fait sensible ; statut catalogue `candidate` non promu ; gate contrats vert.

## Condition bloquante avant merge — TRAITÉE

- **F-SEC-01 :** `REVIEW-PACKAGE.md` (ancienne section « What this is ») amalgamait « per-agent revocation (aujourd'hui) » et « cross-fleet deny (déféré) » sous un seul « are enforced ». **Corrigé** au commit suivant avec la formulation prescrite par le relecteur (split explicite « is enforced today » / « will be enforced … deferred », pointeur STATUS.md). Condition **fermée**.

## Non bloquant (backlog — précondition de promotion candidate→locked)

- Le gap d'enforcement cross-fleet/mission demeure : l'increment `agent-runs v2` ne peut être mergé avant fermeture du gap **et** nouvelle revue indépendante. Tracé STATUS.md « Explicitly deferred ».
