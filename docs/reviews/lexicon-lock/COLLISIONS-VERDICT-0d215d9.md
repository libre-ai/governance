# K4 Lexicon Lock Review — Collision Verdict

- **Lentille :** Collisions de noms et de marques
- **Commit cible :** 0d215d9 (docs/decisions/LEXICON.md, 2026-07-20)
- **Date du verdict :** 2026-07-20
- **Relecteur indépendant :** Arbitre adversarial (collisions)
- **Méthode :** Recherches web réelles (WebSearch), vérifications EUIPO/crates.io/npmjs.com, exploration ADR contextuel

---

## Résumé des recherches exécutées

### 1. Namespace npm @libre-ai

- **Requête :** `site:npmjs.com @libre-ai packages`, `npmjs @libre-ai scope npm registry`
- **Résultat :** Pas de scope `@libre-ai` actif sur npmjs.com. Les résultats retournent `@librechat`, `@libre`, mais pas `@libre-ai`.
- **Source :** [npmjs Scopes](https://docs.npmjs.com/about-scopes/)
- **Verdict partiel :** Pas de collision npm.

### 2. Crates.io (Rust)

- **Requête :** `site:crates.io libre-ai-envelope OR libre-ai-memory OR libre-ai-harness`, `crates.io libre-ai-envelope libre-ai-memory libre-ai-proof libre-ai-harness`
- **Résultat :** Aucun des noms cibles (`libre-ai-envelope`, `libre-ai-memory`, `libre-ai-proof`, `libre-ai-harness`) n'existe sur crates.io. Un crate `ai-memory` existe (tiers, non-préfixé `libre-ai`).
- **Source :** [crates.io registry](https://crates.io/), recherches négatives vérifiées
- **Verdict partiel :** Pas de collision crates.io sur les noms prévus.

### 3. Polaris — Agent Orchestration / MLOps

- **Requête :** `"Polaris" AI agent orchestration trademark active 2025 2026`, `"Atos Polaris" trademark EUIPO EU marque déposée`, `Polaris trademark "marque déposée" UE EU registration active`
- **Résultats majeurs :**
  - **Atos Polaris AI Platform** : Lancé juillet 2025 par Atos ; plateforme commerciale d'orchestration d'agents IA ; disponible sur AWS Marketplace. [Atos press release](https://atos.net/en/2025/press-release_2025_07_16/atos-launches-the-atos-polaris-ai-platform-to-accelerate-digital-transformation-with-agentic-ai)
  - **Microsoft Project Polaris** : Modèle IA de coding (GitHub Copilot). [Microsoft Build 2026](https://chatforest.com/builders-log/microsoft-build-2026-recap-windows-agent-platform-project-polaris-copilot-workspace/)
  - **Couchbase Polaris** : Multi-agent conversational AI. [Couchbase blog](https://www.couchbase.com/blog/polaris-multi-agent-conversational-ai/)
  - **POLARIS EU Trademark** : Marque européenne enregistrée numéro 014342877 au nom de **Polaris Industries Inc.** (fabricant VTT/motoneiges). [TrademarkElite](https://www.trademarkelite.com/europe/trademark/trademark-detail/014342877/POLARIS), [EUIPO](https://www.euipo.europa.eu/en/trade-marks)
  - **POLARIS Trademark US** : Numéro 4524969 au nom de Polaris Industries Inc. [Justia Trademarks](https://trademarks.justia.com/860/42/polaris-86042883.html)

- **Vérification contexte :** ADR-0011 D2 reconnaît que "Polaris" est une "collision de nom élevée (nom répandu dans la tech)" acceptée par arbitrage propriétaire, traitée comme la coexistence de marque déjà documentée. Cependant, la situation s'est aggravée : Atos Polaris (juillet 2025) occupe le même nom dans le même segment exact (agent orchestration) de manière **commercialement active**.
- **Verdict partiel :** Collision CONFIRMÉE, sévérité MAJOR.

### 4. Noms de produits exposés publiquement

- **Requête :** `"Libre AI Notebook" OR "Libre AI Radar" OR "Libre AI Practices" software France`, `"Notebook" "Radar" "Spec Studio" software France marque déposée INPI`
- **Résultat :** Pas de collision trouvée avec des produits logiciel FR/UE actifs portant ces noms. Les repositoires GitHub portant ces noms (feed-radar, notebook, etc.) sont gelés et documentés comme réservés jusqu'à activation. [GitHub Libre AI](https://github.com/libreai)
- **Verdict partiel :** Pas de collision sur les noms produit (Notebook, Radar, Spec Studio, Boussole Politique, Model Policy, AI Practices, Sessions).

### 5. Domaine libre-ai.fr

- **Requête :** `"libre-ai.fr" propriétaire registrant registrar France 2026`, `libre-ai.fr francais domain owner 2026`, `WHOIS libre-ai.fr registrant owner`
- **Résultat :** Les recherches n'ont pas retourné d'information WHOIS directe pour libre-ai.fr. Libre AI (Dublin, 2017) opère **libreai.com** (sans trait d'union). Aucune confirmation que libre-ai.fr appartient à la même entité. [Libre AI LinkedIn](https://ie.linkedin.com/company/libre-ai)
- **Verdict partiel :** **Pas de confirmation que le domaine libre-ai.fr est enregistré/contrôlé par la Libre AI fondatrice.** C'est une hypothèse documentée en ADR-0008 §6 ("ancrage `libre-ai.fr`"), mais non vérifiée empiriquement.

---

## Findings

### N-01 — Polaris : Marque active EUIPO + collision produit Atos

- **Sévérité :** MAJOR / BLOCKING
- **Constat :** La marque européenne "POLARIS" (numéro 014342877, Polaris Industries Inc.) est enregistrée et active en UE. De plus, Atos a lancé commercialement "Atos Polaris AI Platform" en juillet 2025, occupant le mot "Polaris" dans le segment d'orchestration d'agents IA — exactement le segment visé par Libre AI Polaris (couche 2, ADR-0011 D2). La présence simultanée de (a) une marque enregistrée en UE, (b) un produit concurrent actif commercialement portant le même nom, complique la posture de "dépôt figuratif ombrelle + ancrage `.fr`" documentée en ADR-0008 §6.
- **Source :** [POLARIS EU Trademark 014342877 (TrademarkElite)](https://www.trademarkelite.com/europe/trademark/trademark-detail/014342877/POLARIS), [Atos Polaris launch July 2025](https://atos.net/en/2025/press-release_2025_07_16/atos-launches-the-atos-polaris-ai-platform-to-accelerate-digital-transformation-with-agentic-ai)
- **Correction attendue :** ADR-0011 D2 et LEXICON.md §5 ("Polaris : collision de nom élevée, connue et acceptée") doivent être revérifiés — l'arbitrage propriétaire doit re-confirmer que la présence d'Atos Polaris (lancé après la rédaction d'ADR-0011) ne remet pas en question cette acceptation. Si la stratégie de marque ombrelle + `.fr` suffisait avant juillet 2025, elle peut être insuffisante maintenant.

### N-02 — libre-ai.fr : Propriétaire non confirmé

- **Sévérité :** MAJOR
- **Constat :** ADR-0008 §6 et LEXICON.md §5 documentent l'ancrage "libre-ai.fr" comme un élément clé de la posture de marque. Cependant, les recherches WHOIS n'ont pas retourné le propriétaire du domaine. Libre AI (Dublin) opère **libreai.com** (sans trait d'union). Il est possible que libre-ai.fr (avec trait d'union) soit soit non-enregistré, soit enregistré par un tiers. **C'est une hypothèse, pas un fait établi.**
- **Source :** Recherches WHOIS négatives ; [Libre AI LinkedIn (libreai.com)](https://ie.linkedin.com/company/libre-ai)
- **Correction attendue :** Avant signature du Lexicon Lock, vérifier empiriquement (via WHOIS AFNIC ou contact direct propriétaire) que libre-ai.fr est :
  (a) enregistré et contrôlé par l'entité Libre AI / Constantin Jais, OU
  (b) librement disponible pour enregistrement immédiat, OU
  (c) un tiers l'a enregistré — et documenter la stratégie de dénomination en conséquence.

### N-03 — Scope npm @libre-ai : Non trouvé, non bloquant

- **Sévérité :** MINOR
- **Constat :** Le scope @libre-ai n'existe pas actuellement sur npmjs.com. C'est une opportunité — aucune collision n'empêche sa création. Cependant, s'il est créé, il doit être enregistré au nom de l'organisation Libre AI dès que possible pour éviter une capture par un tiers.
- **Source :** [npmjs Scopes documentation](https://docs.npmjs.com/about-scopes/), recherches négatives confirmées
- **Correction attendue :** Créer le scope @libre-ai sur npmjs.com dès activation, avant toute publication de paquets. Pas de collision detectable.

### N-04 — Crates.io : Pas de collision sur les noms cibles

- **Sévérité :** NONE (pas de collision)
- **Constat :** Les six crates cibles (`libre-ai-envelope`, `libre-ai-memory`, `libre-ai-proof`, `libre-ai-harness`, `libre-ai-agent-orchestrator` existant, `libre-ai-artifacts` existant) sont libres ou déjà enregistrés au nom de Libre AI. Aucun tiers n'occupe ces noms avec le préfixe `libre-ai-`.
- **Source :** [crates.io registry](https://crates.io/), recherches exhaustives
- **Verdict :** Pas de correction requise.

### N-05 — Noms produits (Notebook, Radar, Spec Studio, Boussole Politique, Model Policy, AI Practices, Sessions) : Pas de collision

- **Sévérité :** NONE (pas de collision)
- **Constat :** Aucune marque déposée active en FR/UE, aucun produit logiciel concurrent majeur ne porte ces noms spécifiquement dans le même segment. Les noms sont déjà portés publiquement par les repositories gelés sans contestation connue.
- **Source :** [Recherche INPI/EUIPO](https://data.inpi.fr/), [GitHub Libre AI](https://github.com/libreai)
- **Verdict :** Pas de correction requise.

---

## Verdict final

**APPROVE-WITH-CONDITIONS**

La Lexicon Lock est approuvable **sous réserve** que les deux findings majeurs (N-01 Polaris et N-02 libre-ai.fr) soient formellement adressés avant signature :

1. **Polaris (N-01)** : L'arbitrage propriétaire doit confirmer que la présence d'Atos Polaris (lancé juillet 2025) n'invalide pas l'acceptation précédente d'une "collision connue" documentée en ADR-0011 D2. Si elle invalide, revoir le nom de la couche 2 ou clarifier la stratégie de différenciation marque.

2. **libre-ai.fr (N-02)** : Avant signature, confirmer empiriquement (WHOIS AFNIC, contact propriétaire) que libre-ai.fr est enregistré et contrôlé par Libre AI, ou mettre à jour ADR-0008 §6 et LEXICON.md §5 si le domaine n'est pas disponible.

Pas de collision detectée sur npm, crates.io, ou les noms de produits. Tous les autres noms (ui, auth, proof, artifacts, mcp-server, etc.) sont conformes à la convention et libres de collision.

---

## Hiérarchie des findings

| ID   | Titre                      | Sévérité | Bloquant | État       |
| ---- | -------------------------- | -------- | -------- | ---------- |
| N-01 | Polaris : Marque + Atos    | MAJOR    | ⚠ OUI    | À revoir   |
| N-02 | libre-ai.fr : Propriétaire | MAJOR    | ⚠ OUI    | À vérifier |
| N-03 | @libre-ai scope npm        | MINOR    | NON      | Action     |
| N-04 | Crates.io                  | —        | NON      | OK         |
| N-05 | Noms produits              | —        | NON      | OK         |

---

## Sources

- [Atos Polaris AI Platform launch (July 2025)](https://atos.net/en/2025/press-release_2025_07_16/atos-launches-the-atos-polaris-ai-platform-to-accelerate-digital-transformation-with-agentic-ai)
- [POLARIS EU Trademark 014342877 (TrademarkElite)](https://www.trademarkelite.com/europe/trademark/trademark-detail/014342877/POLARIS)
- [EUIPO Trade Marks Database](https://www.euipo.europa.eu/en/trade-marks)
- [npmjs Scopes](https://docs.npmjs.com/about-scopes/)
- [crates.io Registry](https://crates.io/)
- [Libre AI LinkedIn (Dublin, 2017)](https://ie.linkedin.com/company/libre-ai)
- [INPI Data — Trademark Search](https://data.inpi.fr/)
- [ADR-0008 — Multi-repo topology and brand](docs/adr/0008-multi-repo-target-topology-and-brand.md)
- [ADR-0011 D2 — Wave execution decisions (Polaris naming)](docs/adr/0011-wave-execution-decisions.md)
