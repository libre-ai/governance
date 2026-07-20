# LEXICON — carte de noms cible et glossaire produit (Phase 0, Lexicon Lock)

- **Statut :** proposed — sans effet tant que la signature propriétaire n'est pas prononcée.
- **Date :** 2026-07-20
- **Arbitrage :** requis — la signature propriétaire de cette carte est l'acte de clôture de la Phase 0 (Lexicon Lock). Procédure : production solo → revue K4 (relecteurs indépendants : cohérence, collisions, doctrine) → arrêt dur → signature propriétaire → seulement alors renommage et écriture des noms cibles comme acquis.
- **Portée :** tous les noms cibles de la constellation — repositories, produits, briques, packages npm, crates, familles — et le glossaire produit. Le glossaire de **méthode** (socle, control plane, satellite, vague, gate, WP, traceur…) est déjà fixé et ne relève pas de cette carte.
- **Règle d'anti-hallucination :** tant que cette carte n'est pas signée, aucun agent n'écrit un nom cible comme acquis dans un artefact ; après signature, tout nom hors carte est un défaut bloquant (garde-fou classe 4).
- **Place documentaire :** après signature, cette carte devient l'autorité unique du sujet « noms cibles et glossaire produit » et s'inscrit à ce titre dans la carte d'autorité (`docs/README.md`) — la même pull request porte cette inscription. Elle ne concurrence ni le registre des invariants ni l'inventaire : elle fixe des noms, pas la doctrine ni la topologie.

## 1. Repositories GitHub — carte legacy → cible

Doctrine applicable : les URLs des produits historiques sont **réservées** comme emplacements des futurs repositories produits (I-04, ADR-0008 §2) ; elles ne sont **jamais renommées**. Les noms d'outillage hérités ne sont **jamais réutilisés** (I-04).

### 1.1 Homes produits et application (conservés, gelés jusqu'à activation)

| Legacy (repo)        | Cible (repo)                       | Produit / application   | Couche | Activation                                   |
| -------------------- | ---------------------------------- | ----------------------- | ------ | -------------------------------------------- |
| `feed-radar`         | `feed-radar` (inchangé, réservé)   | Radar                   | 1      | vague 4b                                     |
| `notebook`           | `notebook` (inchangé, réservé)     | Notebook                | 1      | vague 4a                                     |
| `ai-practices`       | `ai-practices` (inchangé, réservé) | AI Practices            | 1      | vague 4b                                     |
| `sessions`           | `sessions` (inchangé, réservé)     | Sessions                | 1      | vague 4b                                     |
| `boussole-politique` | `boussole-politique` (inchangé)    | Boussole Politique      | 1      | vague 4b                                     |
| `spec-studio`        | `spec-studio` (inchangé, réservé)  | Spec Studio             | 1      | vague 4b                                     |
| `policy`             | `policy` (inchangé, réservé)       | Model Policy            | 1      | vague 4b (public après re-audit secrets/PII) |
| `agent-board`        | `agent-board` (inchangé, réservé)  | Missions (app couche 2) | 2      | vague 3                                      |

Sept produits (Radar, Notebook, AI Practices, Sessions, Boussole Politique, Spec Studio, Model Policy) ; `agent-board`/Missions est l'**application** de la couche 2, pas un huitième produit (ADR-0009 §2, inventaire).

### 1.2 Outillage retiré — noms morts, jamais réutilisés

`gear`, `context-kit`, `client-kit`, `proof-kit`, `artifact-supply`, `design-system`, `agent-factory`, `website`, `benchmarks`, `dioxus-app-template`. Leurs responsabilités vivent au socle ; aucun repository, package ou crate futur ne reprend ces noms (I-04).

## 2. Briques et satellites — noms canoniques par couche

Convention transverse (fixée par cette carte) :

- **Repo satellite** : nom de brique nu sous l'organisation (`libre-ai/<brique>`).
- **Package npm** : `@libre-ai/<brique>` (exceptions listées, conservées pour exactitude de contenu).
- **Crate Rust** : `libre-ai-<brique>` (les six crates du workspace sont déjà conformes).

### 2.1 Couche 4 — atelier applicatif (vague 1)

| Brique    | Repo satellite cible | Package/crate cible                        | Source socle actuelle                                | Note                                                                                                                                                                                                                                     |
| --------- | -------------------- | ------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui`      | `libre-ai/ui`        | `@libre-ai/ui`                             | `packages/design-system` (`@libre-ai/design-system`) | **Renommage requis à la vague 1** : `design-system` est un nom d'outillage retiré (§1.2) ; le package socle actuel le réutilise — dérive latente vis-à-vis d'I-04, corrigée par le renommage `@libre-ai/design-system` → `@libre-ai/ui`. |
| `auth`    | `libre-ai/auth`      | `@libre-ai/auth-web` (conservé)            | `packages/auth-web`                                  | Le package nomme sa surface exacte (auth **web**, WP-G2-I01) ; le repo satellite porte la famille `auth`, les surfaces futures s'y ajoutent en `@libre-ai/auth-*`.                                                                       |
| `sdk-ts`  | `libre-ai/sdk-ts`    | `@libre-ai/contracts` (conservé)           | `packages/contracts`                                 | Le package est la projection SDK TypeScript des contrats (WP-G2-C01) ; son nom décrit son contenu et il précède cette carte.                                                                                                             |
| `sdk-rs`  | `libre-ai/sdk-rs`    | crate `libre-ai-contract-types` (conservé) | `crates/contract-types`                              | Différé (ADR-0009 §8, faute de consommateur) ; nommé ici pour que rien ne s'invente à l'activation.                                                                                                                                      |
| `starter` | `libre-ai/starter`   | —                                          | dérivé de la première app                            | Différé ; nommé ici.                                                                                                                                                                                                                     |

### 2.2 Couche 3 — infrastructure de confiance (vague 2)

| Brique       | Repo satellite cible  | Package/crate cible                                    | Source socle actuelle                                                                       | Note                                                                                                                                       |
| ------------ | --------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `envelope`   | `libre-ai/envelope`   | `@libre-ai/envelope` · `libre-ai-envelope`             | à naître (vague 2)                                                                          | Doctrine anti-injection (K3).                                                                                                              |
| `provenance` | `libre-ai/provenance` | `@libre-ai/provenance` · `libre-ai-provenance`         | à naître (vague 2)                                                                          | Porte `agent-contributor-lineage.v1`.                                                                                                      |
| `proof`      | `libre-ai/proof`      | `@libre-ai/proof` · `libre-ai-proof`                   | à naître (vague 2 ; autorités `evidence-report.v1`, `harness-attestation.v1` déjà au socle) |                                                                                                                                            |
| `artifacts`  | `libre-ai/artifacts`  | `@libre-ai/artifacts` · `libre-ai-artifact` (conservé) | `crates/artifact`                                                                           | Le crate existant garde son singulier (précède cette carte) ; le repo satellite prend le pluriel doctrinal (ADR-0008 annexe, ADR-0009 §2). |
| `memory`     | `libre-ai/memory`     | `@libre-ai/memory` · `libre-ai-memory`                 | à naître (vague 3, livrée avec le lock orchestrateur)                                       |                                                                                                                                            |

### 2.3 Couche 2 — la méthode incarnée : famille Polaris (vague 3)

Le nom de la couche 2 productisée est **Polaris** (ADR-0011 D2, collision de nom connue et acceptée, traitée par la posture de marque option C).

| Brique         | Repo satellite cible      | Package/crate cible                      | Source socle actuelle            | Note                                                                     |
| -------------- | ------------------------- | ---------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| `orchestrator` | `libre-ai/orchestrator`   | `libre-ai-agent-orchestrator` (conservé) | `crates/agent-orchestrator`      | Crate existant conforme à la convention (préfixe `agent-` désambiguïse). |
| `harness`      | `libre-ai/harness`        | `libre-ai-harness`                       | à naître (vague 3, sous le lock) |                                                                          |
| Missions (app) | home `agent-board` (§1.1) | chemin canonique `apps/missions`         | à naître (vague 3)               | Application humaine de la couche 2 — pas un huitième produit.            |

### 2.4 Transverse — distribution

| Brique       | Repo satellite cible  | Package/crate cible    | Note            |
| ------------ | --------------------- | ---------------------- | --------------- |
| `mcp-server` | `libre-ai/mcp-server` | `@libre-ai/mcp-server` | À l'activation. |
| `corpus`     | `libre-ai/corpus`     | —                      | À l'activation. |
| `docs`       | `libre-ai/docs`       | —                      | À l'activation. |

### 2.5 Packages socle sans exposition satellite prévue

`@libre-ai/root` (workspace), `@libre-ai/knowledge`, `@libre-ai/web-platform`, `@libre-ai/notebook` (app), `libre-ai-notebook-core`, `libre-ai-ecosystem-engine`, `libre-ai-authz-biscuit` : noms conformes à la convention, inchangés. `libre-ai-authz-biscuit` et `libre-ai-ecosystem-engine` restent internes au socle jusqu'à ce que la loi de couverture (I-16) les promeuve ; leur nom satellite éventuel reprend le nom du crate sans le préfixe `libre-ai-` — règle déterministe qui prime sur tout autre patron : `libre-ai-authz-biscuit` → repo `authz-biscuit`, npm `@libre-ai/authz-biscuit` ; `libre-ai-ecosystem-engine` → repo `ecosystem-engine`.

## 3. Produits — marque publique

La marque publique de chaque produit est « **Libre AI \<Produit\>** » ; le nom nu est descriptif et n'est jamais revendiqué seul comme marque (posture option C, ADR-0008 §6 : marque figurative EUIPO + ancrage `libre-ai.fr`).

| Produit            | Nom public                  | Moteur/crates associés                      | Contrats (familles existantes)                       |
| ------------------ | --------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Radar              | Libre AI Radar              | moteur radar (à naître, vague 4b)           | `radar-engine-v1/v2`, `radar-*.v1`                   |
| Notebook           | Libre AI Notebook           | `libre-ai-notebook-core` (Gate B approuvée) | `notebook-core-v1/v2`, `notebook-backup.*`           |
| AI Practices       | Libre AI Practices          | moteur practices (à naître, vague 4b)       | `practice-scoring-v1`, `practice-progress-export.v1` |
| Sessions           | Libre AI Sessions           | à naître (vague 4b)                         | `session-event.v1`, `session-export.v1`              |
| Boussole Politique | Libre AI Boussole Politique | moteur boussole (contrats verrouillés)      | `boussole-scoring-v1/v2`, `boussole-*`               |
| Spec Studio        | Libre AI Spec Studio        | à naître (vague 4b)                         | `spec-package.v1`                                    |
| Model Policy       | Libre AI Model Policy       | policy-core (contrats verrouillés)          | `policy-core-v1/v2`, `policy-*`                      |

Le décompte des produits n'est pas gravé ici (I-14) : l'inventaire `ecosystem/repositories.v1.yaml` fait foi ; cette table fixe les **noms**, pas le portefeuille.

## 4. Glossaire produit

| Terme              | Définition (une ligne)                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Libre AI           | La marque ombrelle : constellation de produits souverains, explicables, réversibles, gérée par la méthode.                         |
| Polaris            | La méthode incarnée (couche 2 productisée) : orchestration gouvernable de flottes d'agents — plans bornés, refus, évidence, gates. |
| Missions           | L'application humaine de Polaris : la surface où les missions d'agents se voient, s'approuvent, s'auditent.                        |
| Radar              | Sélection de flux explicable et curation portable.                                                                                 |
| Notebook           | Connaissance personnelle local-first, export de contexte contrôlé.                                                                 |
| AI Practices       | Formation professionnelle à la pratique sourcée de l'IA.                                                                           |
| Sessions           | Apprentissage collectif ancré aux sources, facilitation.                                                                           |
| Boussole Politique | Comparaison civique privée contre les votes publics sourcés.                                                                       |
| Spec Studio        | Décisions produit, spécifications et handoffs bornés.                                                                              |
| Model Policy       | Sélection de modèles sous politique explicable.                                                                                    |
| envelope           | Enveloppe d'intégrité du contenu non fiable : escape, marquage, signature vérifiable (K3).                                         |
| provenance         | Traçabilité des contributions et lignées d'agents (`agent-contributor-lineage.v1`).                                                |
| proof              | Rapports d'évidence signés et attestations de harness — la preuve opposable des gates.                                             |
| artifacts          | Manifestes et chaîne d'approvisionnement des artefacts produits.                                                                   |
| memory             | Mémoire d'agents gouvernée (rappel enveloppé, classification, effacement prouvable) — livrée avec le lock.                         |
| orchestrator       | Le cœur d'exécution de Polaris : plans, autorisations, contrôle.                                                                   |
| harness            | Le cadre d'exécution sécurisé des agents de Polaris.                                                                               |
| ui                 | Primitives d'interface accessibles et vérifiables de l'atelier applicatif.                                                         |
| auth               | Identité et autorisation (OIDC, session opaque, Biscuit) pour les apps de la constellation.                                        |
| sdk-ts / sdk-rs    | Projections SDK TypeScript / Rust des contrats du socle.                                                                           |
| starter            | Gabarit d'application souveraine, dérivé de la première app.                                                                       |
| mcp-server         | Exposition MCP des capacités de la constellation.                                                                                  |
| corpus             | La pratique documentée, opposable — corpus public.                                                                                 |
| docs               | Documentation générée de la constellation (projection, jamais une autorité).                                                       |

## 5. Justification des noms

- **Posture générale (tous les noms nus)** : chaque nom de produit ou de brique est un **générique descriptif** (français ou anglais) volontairement non appropriable seul ; la protection est portée par l'ombrelle « Libre AI » (marque figurative EUIPO à déposer, action propriétaire actée ADR-0008 §6) et l'ancrage `libre-ai.fr`. Aucun compte social homonyme n'est revendiqué. Vérification de coexistence déjà actée : homonyme de Dublin (`libreai.com`, aucune marque EUIPO déposée — vérifié 2026-07-10, re-confirmé par ADR-0008).
- **Polaris** : collision de nom élevée, connue et **acceptée** par arbitrage (ADR-0011 D2) ; traitement identique à la coexistence de marque documentée (figuratif + `.fr`). **Donnée nouvelle post-arbitrage** identifiée par la revue K4 (lentille collisions) : un produit actif du même segment (« Atos Polaris AI Platform », orchestration d'agents, lancé juillet 2025) et un enregistrement UE du signe « POLARIS » par un tiers hors segment. La confirmation ou le remplacement du nom est un **point de décision propriétaire** du dossier Phase 0 — cette carte ne le tranche pas.
- **Noms de produits (Radar, Notebook, …)** : déjà portés publiquement par les repositories gelés sous ces URLs depuis leur création et re-publiés le 2026-07-19 avec bannière de gel, sans contestation connue ; l'exposition cible n'ajoute aucun risque nouveau de collision par rapport à l'existant. La revue K4 (lentille collisions) vérifie ce constat nom par nom avant signature.
- **Boussole Politique** : ancrage francophone fort (`.fr`), nom composé spécifique — le risque de collision est structurellement plus faible que pour les génériques anglais.
- **Domaine `libre-ai.fr`** (finding N-02 de la revue K4) : vérification empirique du 2026-07-20 (whois + RDAP AFNIC) — le domaine est **enregistré et actif** (registrar Infomaniak, titulaire anonymisé, pratique AFNIC normale pour un particulier). L'anonymisation empêche de prouver le contrôle par le titulaire de ce dépôt : la **confirmation nominative du contrôle** est un point de décision propriétaire du dossier Phase 0 — cette carte ne la présume pas.
- **Familles plateforme/preuve/distribution (`ui`, `proof`, `artifacts`, `starter`, `sdk-ts`, `sdk-rs`, `mcp-server`, `corpus`, `docs`)** : reprises **à l'identique** de l'annexe non normative d'ADR-0008 — cette carte est l'acte qui les fige (l'annexe prévoyait « fixés à l'activation, par décision propriétaire ») ; zéro nom nouveau inventé.
- **Briques couches 2-3 (`orchestrator`, `harness`, `envelope`, `provenance`, `memory`)** : reprises à l'identique d'ADR-0009 §2 (topologie ratifiée) ; zéro nom nouveau inventé.
- **Cohérence de famille** : un seul patron pour toute la constellation — repo = nom nu, npm = `@libre-ai/<nom>`, crate = `libre-ai-<nom>` ; trois exceptions conservées pour exactitude de contenu (`@libre-ai/auth-web`, `@libre-ai/contracts`, `libre-ai-agent-orchestrator`), une correction requise (`@libre-ai/design-system` → `@libre-ai/ui`).

## 6. Marques mortes et deny-list

### 6.1 Marques retirées (jamais réintroduites dans un document ou identifiant vivant)

Marques d'écosystème héritées : `rumble`, `bolt`, `wrench`, `gear`, `portal`, `cos-matic`/`cosmatic`. S'y ajoutent les trois motifs de marque et de domaine déjà deny-listés par le gate doctrine — cette carte les référence **par pointeur** (voir la liste exacte dans `.github/workflows/doctrine-governance.yml`) et ne les recopie pas : les écrire ici déclencherait le gate lui-même, et la liste du workflow reste la source unique. Noms d'outillage retirés (§1.2) : jamais réutilisés comme nom de repo, package ou crate.

### 6.2 État constaté (inventaire du 2026-07-20)

Aucune occurrence de marque morte dans le code vivant (crates, packages, apps, contracts, workflows CI). Les occurrences restantes sont des **traces historiques légitimes** : registres d'archive (`ecosystem/LEGACY-MANIFEST.yaml`, `docs/transformation/G0-FREEZE-EVIDENCE.md`, `REPOSITORY-MAP.md`, `PROGRAM.md`), tableaux de migration (`docs/architecture/DETAILED-TARGET.md`), registre de décisions (`DECISION-REGISTER.md`), contexte d'ADR (`0008`), énumération de vision (`vision.md`) et une mention de migration dans `crates/artifact/README.md`.

### 6.3 Extension du gate (à implémenter après signature)

Étendre la deny-list du job `doctrine-governance` aux motifs `rumble`, `bolt`, `wrench`, `gear`, `portal`, `cos-matic|cosmatic` sur les documents vivants, avec exclusions explicites : les registres historiques du §6.2, `docs/reviews/` (déjà exclu par le gate), **et cette carte elle-même** (`docs/decisions/LEXICON.md`), qui doit pouvoir énumérer les marques mortes sans les réintroduire. Le `README.md` de `crates/artifact` est nettoyé de ses références `Gear Cable`/`Gear Depot` (documentation vivante d'un crate vivant) dans la même passe.

## 7. Actions post-signature (récapitulatif exécutable)

1. Renommage `@libre-ai/design-system` → `@libre-ai/ui` (`packages/design-system` → `packages/ui`), imports et lockfile à la main (v2) — **première action de la vague 1, précondition de tout autre merge de cette vague** (clôture de la dérive I-04 constatée §2.1 ; délai ferme : avant toute publication satellite).
2. Nettoyage `crates/artifact/README.md` (références Gear).
3. Extension de la deny-list `doctrine-governance` (§6.3).
4. Réservation du scope npm `@libre-ai` (création de l'organisation npm) avant toute publication satellite de la vague 1 — le scope est libre au 2026-07-20 (revue K4 collisions) ; action externe soumise au checkpoint propriétaire (garde-fou classe 9, premier de son type).
5. Mise à jour d'`ecosystem/repositories.v1.yaml` : aucune entrée nouvelle requise (les homes réservés y figurent déjà) ; les satellites y entrent à leur activation avec les noms de cette carte.
6. Gate truth-drift re-vérifié vert ; aucun nom hors carte dans les artefacts nouveaux (garde-fou classe 4).
