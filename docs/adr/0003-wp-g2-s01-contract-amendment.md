# ADR-0003 — Réouverture bornée de WP-G2-S01

- **Statut :** accepted-for-candidate-drafting
- **Date :** 2026-07-16
- **Portée :** contrats spécialisés et simulateur Missions G2
- **Décision humaine :** recommandation v2, retrait de Context et maintien du simulateur G2 borné approuvés ; revues spécialisées encore requises

## Contexte

Les WIT v1 Radar, Notebook, Policy et Boussole étaient syntaxiquement valides mais ne définissaient pas toutes leurs entrées/sorties JSON, formules, bornes, dérivations d’identifiants et préimages de hash. `crates/context` ne portait aucun invariant distinct. L’ancien Agent Factory ne disposait ni d’un protocole de contrôle ni d’un harness contractuel : cela interdit un moteur d’exécution G2, mais pas un simulateur déterministe sans outil ni état durable utilisant les contrats Missions v1 verrouillés.

## Décisions

1. Les WIT v1 des quatre moteurs produit restent inchangés et non ciblés par WP-G2-S01 ; aucune réinterprétation cassante n’est admise.
2. Les quatre moteurs candidats utilisent des WIT v2 et des profils normatifs catalogués.
3. Radar reçoit une identité de source, une URL de base/finale et un budget de sortie ; ses IDs sont source-scoped.
4. Notebook v2 rend les métadonnées crypto explicites et authentifiées ; son implémentation attend une revue cryptographique indépendante.
5. Policy v2 introduit un besoin tenant-bound, des faits typés et la séparation humaine `approverId != proposedBy`.
6. Boussole v2 fixe une formule candidate reproductible ; le scoring public reste désactivé sans revues méthodologique et vie privée distinctes liées aux hashes.
7. `crates/context` est retiré de WP-G2-S01. `crates/agent-orchestrator` est conservé uniquement comme profil `libre-ai.agent-orchestrator.g2-simulator.v1` : validation d’`AgentHandoff` v1, simulation déterministe bornée et validation sémantique d’`OrchestratorEvent` v1 avec références Proof/Artifact canoniques. Il n’a ni DB, réseau, secret, outil, provider, harness, approbation ou état durable. Toute exécution réelle nécessite un RFC/Specification Lock séparé avec plan d’exécution, commandes de contrôle, événements v2, budgets observables, harness et autorisation.
8. Practices scoring reste explicitement non implémenté.
9. Aucun provisioning, secret, fournisseur, réseau ou stockage n’entre dans cet amendement.

## Autorité et approbations

Les contrats v2 sont catalogués comme `candidate`. Un agent ne peut pas les promouvoir. Les approbations humaines nommées requises sont : architecture, sécurité, cryptographie pour Notebook, méthodologie pour Boussole, vie privée France/UE pour Notebook/Policy/Boussole, ainsi que Missions et sécurité budgets/replay pour le simulateur. Les reviewers spécialisés sont distincts des auteurs et futurs implémenteurs.

## Compatibilité

Radar et Notebook changent de signature WIT ; Policy et Boussole changent la signification et la famille de payloads. Tous utilisent donc un major v2. Aucun adaptateur v1→v2 n’est créé : aucun producteur canonique v1 n’a été publié. Les WIT v1 restent des autorités historiques verrouillées mais hors cible d’implémentation. Le simulateur ne réinterprète pas les contrats Missions v1 : il produit un sous-ensemble strict d’événements existants et ne devient jamais autorité de l’état Mission.

## Condition de refermeture

Le Specification Lock n’est refermé pour S01 que lorsque :

- chaque candidat est approuvé par ses reviewers requis ;
- schémas, OpenAPI, WIT, profils et vecteurs passent les gates ;
- les types générés sont reproductibles ;
- WP-G2-S01 ne possède que les quatre crates produit et le simulateur/validateur Missions borné ;
- Practices et Context ne sont pas implémentés ;
- l’orchestrateur ne dépasse pas le profil G2 sans exécution, contrôle, harness, autorisation ou état durable.
