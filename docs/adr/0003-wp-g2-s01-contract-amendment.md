# ADR-0003 — Réouverture bornée de WP-G2-S01

- **Statut :** accepted-for-candidate-drafting
- **Date :** 2026-07-16
- **Portée :** contrats spécialisés uniquement
- **Décision propriétaire solo :** recommandation v2 et réduction de S01 approuvées ; revues agentiques spécialisées encore requises

## Contexte

Les WIT v1 Radar, Notebook, Policy et Boussole étaient syntaxiquement valides mais ne définissaient pas toutes leurs entrées/sorties JSON, formules, bornes, dérivations d’identifiants et préimages de hash. `crates/context` ne portait aucun invariant distinct ; `crates/agent-orchestrator` ne disposait ni d’un protocole de contrôle ni d’un harness contractuel.

## Décisions

1. Les v1 restent hors cible de WP-G2-S01. Radar, Notebook et Boussole v1 demeurent inchangés ; le Policy v1 verrouillé par la PR #16 est conservé comme baseline déjà fusionnée mais ne remplace pas la cible v2 approuvée pour S01. Aucune nouvelle réinterprétation v1 n’est admise.
2. Les quatre moteurs candidats utilisent des WIT v2 et des profils normatifs catalogués.
3. Radar reçoit une identité de source, une URL de base/finale et un budget de sortie ; ses IDs sont source-scoped.
4. Notebook v2 rend les métadonnées crypto explicites et authentifiées ; son implémentation attend une revue cryptographique par un agent indépendant.
5. Policy v2 introduit un besoin tenant-bound, des faits typés et la séparation humaine `approverId != proposedBy`.
6. Boussole v2 fixe une formule candidate reproductible ; le scoring public reste désactivé sans revues méthodologique et vie privée distinctes liées aux hashes.
7. `crates/context` et `crates/agent-orchestrator` sont retirés de WP-G2-S01. L’orchestrateur nécessite un RFC/Specification Lock séparé avec plan d’exécution, commandes, événements v2, budgets, harness et autorisation.
8. Practices scoring reste explicitement non implémenté.
9. Aucun provisioning, secret, fournisseur, réseau ou stockage n’entre dans cet amendement.

## Autorité et approbations

Les contrats v2 sont catalogués comme `candidate`. Les verdicts requis sont produits par des passes spécialisées en architecture, sécurité, cryptographie pour Notebook, méthodologie pour Boussole et vie privée France/UE pour Notebook/Policy/Boussole. En contexte solo, un même agent/session peut enchaîner une passe auteur puis des passes review-only séparées par rôle, sur un commit immuable et sans modifier les autorités revues, conformément à `docs/reviews/AGENT-REVIEW-PROTOCOL.md`. Une passe de promotion séparée vérifie tous les verdicts avant le jalon de contrôle humain.

## Compatibilité

Radar et Notebook changent de signature WIT ; Policy et Boussole changent la signification et la famille de payloads. Tous utilisent donc un major v2. Aucun adaptateur v1→v2 n’est créé : aucun producteur canonique v1 n’a été publié. Les WIT v1, y compris le Policy v1 désormais verrouillé, restent des autorités de baseline hors cible d’implémentation S01.

## Condition de refermeture

Le Specification Lock n’est refermé pour S01 que lorsque :

- chaque candidat reçoit les verdicts favorables de ses agents reviewers requis ;
- schémas, OpenAPI, WIT, profils et vecteurs passent les gates ;
- les types générés sont reproductibles ;
- WP-G2-S01 ne possède que les quatre crates produit ;
- Practices, Context et Orchestrator ne sont pas implémentés.
