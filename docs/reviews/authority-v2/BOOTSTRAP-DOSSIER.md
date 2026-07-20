# Dossier d'amorçage — authority-v2 K1, première barrière sécu-critique de la couche 2 (Polaris, ADR-0011 D4)

- **Date :** 2026-07-20 · **Run :** jalon β · **PR :** #143 (`feat/beta-k1-agent-identity`)
- **Nature :** **ARRÊT DUR D'AMORÇAGE (ADR-0011 D4)** — premier merge sécu-critique de la **couche 2** (orchestration/Polaris) : l'intégration de l'identité d'agent K1 au cœur d'autorisation Biscuit. Le dossier est produit, puis STOP pour prononcé propriétaire. Ce prononcé amorce la chaîne de confiance de la couche 2 : les merges suivants de même nature (même couche, même type de garde-fou) se prononceront automatiquement sur revue indépendante propre. Unique par couche, pas permanent (distinct de la porte V3, D3, déjà prononcée).

## 1. Ce qui est livré

La taxonomie-contrat d'identité d'agent K1, en contract-first. **Aucune** application d'autorité runtime : le crate consomme toujours `authority-v1`. C'est la première brique de Polaris, la couche 2.

| Brique                 | Fichiers                                      | Preuve                                                                                                                                                   |
| ---------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Template d'autorité v2 | `contracts/authz/authority-v2.datalog`        | 3 faits K1 (`agent_fleet`, `mission_agent`, `capability_scope`) conformes spec ; 2 `check if` d'identité fail-closed ; notes CONFIRMED/DEFERRED honnêtes |
| Entrée catalogue       | `contracts/catalog.v1.json` (authority-v2)    | `candidate`, `major-versioned`, revue indépendante requise (architecture + sécurité), dossier lié                                                        |
| Dossier de revue       | `docs/reviews/authority-v2/REVIEW-PACKAGE.md` | terminologie désambiguïsée, gap d'enforcement énoncé, préconditions de promotion                                                                         |
| Différé tracé          | `STATUS.md` § Explicitly deferred             | wiring `agent-runs v2` + crate = précondition de `candidate → locked`                                                                                    |

**Preuve gates (canary CI exact, darwin-aarch64 snapshot sha-vérifié + CI linux-x64 autorité) :** `check:contracts` vert (87 entrées catalogue), `check:specifications`, `check:source` verts, `lint` clean. CI PR #143 : **Bun quality pass, Doctrine governance pass, Licensing/DCO pass** (Rust quality pending — aucun Rust touché).

## 2. Critères d'acceptation de cet increment — état

1. **Les trois faits K1 de la spec sont présents et conformes.** ✅ `agent_fleet`, `mission_agent`, `capability_scope` (revue architecture, vérifié contre `LOOP-SECURITY-KERNEL.md` K1).
2. **L'identité d'agent est fail-closed.** ✅ `check if agent_fleet` + `check if mission_agent` : aucun token v1 (sans faits d'agent) n'autorise via v2 ; pas de bypass (revue sécurité).
3. **Aucune propriété de sécurité n'est sur-revendiquée.** ✅ Notes CONFIRMED (révocation per-agent, garantie par l'interdit `token_id`) / DEFERRED (isolation cross-fleet/mission NON en vigueur) ; la fausse affirmation de la 1re passe est réellement supprimée (revue sécurité, vérif empirique de `agent-runs-v1`).

## 3. Revue indépendante K4 (relecteurs ≠ implémenteur)

Deux passes, **deux tours** : la 1re passe a rejeté (sécurité) et conditionné (architecture) ; révision ; la 2de passe (commit **9a3cb1a**) statue :

| Lentille     | Verdict (2de passe)         | Bloquant sur ce commit   | Conditions                                                                                                                                          |
| ------------ | --------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| architecture | **APPROVE**                 | Aucun                    | Aucune. Les deux défauts de 1re passe confirmés clos.                                                                                               |
| sécurité     | **APPROVE-WITH-CONDITIONS** | Aucun (condition fermée) | F-SEC-01 (amalgame verbal confirmé/déféré dans le dossier) — **fermée** par la formulation prescrite par le relecteur. Gap d'enforcement = backlog. |

Records : `ARCHITECTURE-VERDICT-9a3cb1a.md`, `SECURITY-VERDICT-9a3cb1a.md`. Le processus K4 a fonctionné : la 1re passe a détecté une sous-implémentation de spec (fait manquant) **et** une fausse propriété de sécurité ; la révision les a fermées ; la 2de passe l'a vérifié empiriquement.

## 4. Limites assumées (documentées, non bloquantes)

- **Contrat-first, pas d'enforcement runtime :** l'isolation cross-fleet/mission n'est PAS appliquée par l'authorizer courant `agent-runs-v1` (ne consomme pas les faits d'agent). C'est énoncé honnêtement ; ce n'est pas un trou masqué. Fermeture = increment `agent-runs v2` (précondition de promotion, K4 à nouveau).
- **`token_mission`** reste injecté à l'émission par le crate (per-token), distinct de l'identité `mission_agent` ; dépendance documentée, non encodée dans le bloc.
- **Crate `authz-biscuit`** consomme toujours `authority-v1` ; le wiring v2 (émission des 3 faits, révocation per-agent, validation capability) = increments suivants indépendamment revus.

## 5. Décision demandée

**Prononcer l'amorçage de la couche 2 (Polaris)** = autoriser le merge de la PR #143 (squash), ce qui :

1. acte le pattern de revue sécu-critique de la couche 2 validé une fois humainement (les prochains merges de même nature s'auto-prononcent sur revue indépendante propre, D4) ;
2. enregistre la taxonomie d'identité d'agent K1 comme contrat candidate, socle des increments Polaris suivants (`agent-runs v2`, wiring crate, orchestrator/harness/missions/memory) ;
3. porte au backlog (précondition de promotion `candidate → locked`) le wiring d'enforcement cross-fleet/mission.

Gates CI de #143 : à re-vérifier vertes au moment du merge (Rust quality incluse). **Je ne merge pas en autonome — arrêt dur D4, premier sécu-critique de la couche 2. L'autorisation permanente de merge ne couvre pas les amorçages de nouvelle couche.**
