# ADR-0011 — Décisions d'exécution des vagues (moteur pilote, Polaris, politiques de gate, environnement D01)

- **Statut :** accepted
- **Date :** 2026-07-20
- **Arbitrage :** propriétaire, session du 2026-07-20 (décisions forcées par questionnaire pour armer l'exécution autonome des vagues 1-4).
- **Portée :** exécution — séquencement des vagues, politiques de gate en run autonome, environnement de développement de D01, nom de la couche 2.
- **Étend :** ADR-0009 (constellation, séquencement des vagues) ; `docs/transformation/EXECUTION-SEQUENCING.md`.

## Contexte

Pour lancer l'exécution autonome des vagues 1-4, les gates d'entrée qui dépendent d'un arbitrage propriétaire devaient être tranchées en amont, sans quoi un run autonome se bloque à chaque gate. Ces décisions sont des entrées ; ce ne sont pas des invariants durables (elles portent sur une phase d'exécution), d'où leur enregistrement en ADR d'exécution plutôt qu'au registre des invariants.

## Décisions

### D1 — Premier moteur produit : Notebook (pilote), puis parallèle via Polaris

La vague 4 (apps) s'exécute en deux temps :

- **Vague 4a — Notebook, pilote.** Gate B déjà approuvée, surface PII maîtrisée, contrat Notebook Core v2 verrouillé. Rôle : valider le pattern app de bout en bout (contrat → moteur → app → revue) une fois.
- **Vague 4b — le reste en parallèle, orchestré par Polaris.** Radar, Boussole, Model Policy, Practices, Sessions, Spec Studio construits en parallèle par la couche 2 une fois le pattern validé. Cette phase parallèle est la démonstration du produit zéro (gestion agentique de la flotte).

Motif du pilote plutôt que « tous en parallèle d'emblée » : prouver le pattern une fois avant réplication, borner la charge de revue concurrente, et faire de la phase parallèle le test réel de Polaris.

### D2 — Nom de la couche 2 (étoile polaire) : Polaris

La couche 2 (orchestration gouvernable de la flotte, productîsée) porte le nom **Polaris**. Réserve connue et acceptée : collision de nom élevée (nom répandu dans la tech) — à traiter comme la coexistence de marque déjà documentée (dépôt figuratif, ancrage `.fr`), non re-litigée ici.

### D3 — Gate du Specification Lock orchestrateur (vague 3) : pré-autorisation conditionnelle

En run autonome, le Specification Lock orchestrateur est prononcé automatiquement **si et seulement si** : (a) le noyau de sécurité des boucles K1-K5 est verrouillé dans le socle, ET (b) il passe une revue adversariale indépendante verte (relecteurs distincts de l'implémenteur). La revue indépendante reste le garde-fou dur ; l'automatisation ne porte que sur le prononcé, pas sur la suppression de la revue.

### D4 — Politique des gates de sécurité en run autonome : auto-procéder sur revue indépendante verte

Chaque composant sécurité-critique (revue RLS de D01, revues de sécurité des vagues) est relu par des agents adversariaux **distincts de l'implémenteur** (conforme au noyau K4 : l'implémenteur n'approuve pas ses propres garde-fous). Le merge se fait automatiquement si le dossier de revue est propre. Cette politique **automatise le prononcé sans supprimer l'indépendance** de la revue — elle ne relâche pas K4, dont le cœur (indépendance implémenteur/relecteur) est préservé.

### D5 — Environnement de développement de D01 : conteneur Linux local (colima), CI en validation

L'intégration DB de D01 se développe dans un conteneur Linux local (colima, déjà installé) : un bun 1.4 canary linux-arm64 natif régénère le lockfile v2 et exécute les tests RLS (pglite, WASM) en boucle rapide. Le CI (linux-x64, bun figé `1.4.0-canary.1+57f349f63`) reste l'autorité de reproductibilité et valide en fin de cycle. Le format de lockfile v2 dépend de la version de bun, pas de l'architecture : le lock local arm64 et le lock CI x64 sont identiques à version égale.

## Conséquences

- `docs/transformation/EXECUTION-SEQUENCING.md` est mis à jour : vague 4 scindée en 4a/4b, gates 3 et 4 renseignées, politiques de gate de run autonome inscrites.
- `STATUS.md` reflète les décisions et l'état courant.
- `ecosystem/repositories.v1.yaml` nomme la couche 2 « Polaris ».
- Ces décisions sont des décisions de phase : elles peuvent évoluer par ADR ultérieur sans toucher le registre des invariants.
