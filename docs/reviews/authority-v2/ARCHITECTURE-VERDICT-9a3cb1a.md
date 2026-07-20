# Verdict K4 — architecture — authority-v2 (commit 9a3cb1a)

- **Relecteur :** agent indépendant, lentille architecture, lancé séparément de l'implémenteur (K4).
- **Sujet :** `contracts/authz/authority-v2.datalog` (candidate, taxonomie d'identité d'agent K1) + `docs/reviews/authority-v2/REVIEW-PACKAGE.md`.
- **Passe :** seconde (après la 1re passe architecture APPROVE-WITH-CONDITIONS + sécurité REJECT, puis révision).

## Verdict : **APPROVE** — zéro condition

## Points vérifiés (clôture des défauts de 1re passe)

1. **Défaut 1 (`mission_agent` manquant vs spec K1) — CLOS.** Les trois faits K1 sont présents et conformes à `LOOP-SECURITY-KERNEL.md` : `agent_fleet`, `mission_agent`, `capability_scope`. `agent_fleet` et `mission_agent` sont forcés présents par un `check if` (identité fail-closed) ; `capability_scope` est délégué au crate (documenté).
2. **Défaut 2 (fausse affirmation d'enforcement) — CLOS.** Les notes séparent désormais honnêtement CONFIRMED (révocation per-agent) / DEFERRED (isolation cross-fleet/mission NON en vigueur, exige `agent-runs v2`) / ISSUANCE (`token_mission` injecté à l'émission).
3. **Versioning** v2 = majeure distincte (humains restent v1) — sain, `major-versioned`, pas de charge de compat rétroactive.
4. **Séquençage** des préconditions de promotion (`agent-runs v2` + wiring crate) explicitement tracé dans STATUS.md + dossier — pas de contrat orphelin.
5. **Terminologie** `mission_agent` / `token_mission` / `resource_mission` désambiguïsée.
6. **Gate contrats** vert ; aucun nouveau défaut introduit par la révision.

## Observation non bloquante (backlog possible, hors périmètre)

- Le gate `check-contracts.ts` ne vérifie pas la _présence_ des trois faits K1 dans un biscuit-authority porteur de faits d'agent (« enhancer optionnel »). Durcissement de gate possible ultérieurement ; non requis ici.
