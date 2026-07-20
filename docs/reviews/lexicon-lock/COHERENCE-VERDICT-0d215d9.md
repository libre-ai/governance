# Verdict K4 — Revue Cohérence du Lexicon Lock (Phase 0)

- **Lentille** : COHÉRENCE ET COMPLÉTUDE
- **Commit relu** : 0d215d9 (`docs/decisions/LEXICON.md`)
- **Date** : 2026-07-20
- **Relecteur** : indépendant — aucune participation antérieure à la rédaction de la carte
- **Portée** : totalité du fichier `docs/decisions/LEXICON.md` au commit 0d215d9

## Verdict final

**APPROVE**

La carte est cohérente, complète, factuellement exacte, et exécutable. Aucun obstacle à la signature propriétaire.

---

## Findings (C-01 à C-03 : tous mineurs)

### C-01 — Inconsistance légère dans les en-têtes des tables (MINOR)

**Sévérité** : minor

**Constat** : Les sections 2.1–2.4 ont des en-têtes de table qui varient légèrement :

- Section 2.1 : `Brique | Repo satellite cible | Package npm cible | Source socle actuelle | Note`
- Section 2.2 : `Brique | Repo satellite cible | Package/crate cible | Source socle actuelle | Note`
- Section 2.3 : `Brique | Repo satellite cible | Package/crate cible | Source socle actuelle | Note`
- Section 2.4 : `Brique | Repo satellite cible | Package cible | Note` (sans colonne Source socle)

Cette variation est non-conforme en structure, bien qu'elle ne soit pas erronée (elle reflète les différences réelles : Layer 4 a uniquement npm, Layer 3 a npm et crates, Layer 2 a crates, Transverse a npm ou rien).

**Correction attendue** : Standardiser les en-têtes pour clarifier quels types de noms sont listés pour chaque layer, ou ajouter une note explicite au-dessus de chaque table indiquant les colonnes présentes.

---

### C-02 — Distinction « 7 produits vs 8 repositories » à clarifier dans le corps du document (MINOR)

**Sévérité** : minor

**Constat** : Section 1.1 énumère 8 lignes de repositories. La distinction entre « produits » (7) et « application » (1, Missions) est marquée dans la colonne « Produit / application », mais elle n'est explicitée que dans le footnote de la section 3.

Un agent autonome ou un lecteur rapide pourrait compter 8 entrées et se demander s'il y a 8 produits ou 7.

**Correction attendue** : Ajouter une phrase clarificatrice après la table 1.1 du type : « Le portefeuille compte 7 produits (Radar, Notebook, AI Practices, Sessions, Boussole Politique, Spec Studio, Model Policy) ; agent-board/Missions en est l'application de la couche 2, pas un huitième produit. » Cette clarification existe dans `repositories.v1.yaml` mais doit figurer ici pour la complétude.

---

### C-03 — Ambiguïté résiduelle sur la promotion de `libre-ai-authz-biscuit` (MINOR)

**Sévérité** : minor (déféré, ne bloque pas Phase 0)

**Constat** : Section 2.5 établit que `libre-ai-authz-biscuit` (crate Rust) "restent interne au socle jusqu'à ce que la loi de couverture (I-16) les promeuve ; leur nom satellite éventuel reprendra le nom du crate sans le préfixe `libre-ai-`", ce qui donnerait `@libre-ai/authz-biscuit`.

Parallèlement, la Note de la section 2.1 (brick `auth`) indique : "le repo satellite porte la famille `auth`, les surfaces futures s'y ajoutent en `@libre-ai/auth-*`", ce qui pourrait suggérer que Biscuit soit promu en tant que surface `@libre-ai/auth-biscuit`.

La règle de 2.5 l'emporte (explicite), mais la cohérence ferait clarifier si `authz-biscuit` est (1) un brick indépendant promu comme `@libre-ai/authz-biscuit`, ou (2) une surface du brick `auth` à nommer `@libre-ai/auth-biscuit` lors de sa promotion.

**Correction attendue** : Ajouter une note explicite en section 2.1 ou 2.5 précisant le destin de `authz-biscuit` à la promotion — ce choix peut être reporté à la décision de promotion (déférée), mais doit être documenté dans l'ADR qui couvra cette promotion.

---

## Vérifications complétées

### ✓ Couverture exhaustive (Phase 0)

Tous les éléments requis sont listés avec noms cibles :

- **Homes produits** (§1.1) : feed-radar, notebook, sessions, spec-studio, ai-practices, boussole-politique, policy, agent-board
- **Familles couches 2–4** (§2.1–2.3) : ui, auth, sdk-ts, sdk-rs, starter, orchestrator, harness, envelope, provenance, proof, artifacts, memory
- **Transverse** (§2.4) : mcp-server, corpus, docs
- **Socle sans satellite** (§2.5) : root, knowledge, web-platform, notebook (app), notebook-core, ecosystem-engine, authz-biscuit

### ✓ Cohérence interne

- Convention repo/npm/crate appliquée partout avec exceptions justifiées (auth-web, contracts, agent-orchestrator, artifact singulier)
- Aucune contradiction entre tables ou glossaire
- Mapping exact avec `repositories.v1.yaml` (feed-radar ↔ Radar, notebook ↔ Notebook, etc.)
- Tous les termes du glossaire §4 correspondent à des entrées dans les tables §2 ou §3

### ✓ Exactitude factuelle

Tous les « sources socle actuelles » cités existent et portent les noms attendus :

- `packages/design-system` : `@libre-ai/design-system` ✓
- `packages/auth-web` : `@libre-ai/auth-web` ✓
- `packages/contracts` : `@libre-ai/contracts` ✓
- `crates/artifact` : `libre-ai-artifact` ✓
- `crates/agent-orchestrator` : `libre-ai-agent-orchestrator` ✓
- `crates/contract-types` : `libre-ai-contract-types` ✓
- `crates/notebook-core` : `libre-ai-notebook-core` ✓
- `crates/authz-biscuit` : `libre-ai-authz-biscuit` ✓
- `apps/notebook` : `@libre-ai/notebook` ✓

### ✓ Exécutabilité des actions post-signature (§7)

1. Rename `@libre-ai/design-system` → `@libre-ai/ui` : cible explicite (folder + package)
2. Clean `crates/artifact/README.md` : chemin et motif explicites
3. Extend `doctrine-governance` deny-list : patterns listés
4. Update `ecosystem/repositories.v1.yaml` : action clairsémée ("aucune entrée nouvelle requise")
5. Gate truth-drift vert : assertion/garde bien formée

### ✓ Absence d'ambiguïtés bloquantes

Un agent autonome lisait la carte et exécutait une action ne rencontre aucune bifurcation entre deux interprétations valides des noms cibles. Les exceptions (auth-web, contracts, agent-orchestrator, artifact singulier) sont toutes annoncées.

### ✓ Conformité aux invariants (I-04, I-14, I-15, I-16)

- I-04 (URLs produits réservées, noms outillage jamais réutilisés) : respecté (design-system est identifié comme violation et programmé pour correction)
- I-14 (portefeuille total) : respecté (aucun décompte codé en dur, l'inventaire fait foi)
- I-15, I-16 (lois d'exposition et couverture) : compatibles avec la carte

---

## Résumé pour la signature

La carte du Lexicon Lock est **prête**. Elle couvre l'exhaustivité requise par la Phase 0, sans collision de noms, sans contradiction interne, et avec des actions post-signature claires et exécutables.

Les trois findings (C-01 à C-03) sont des améliorations de clarté, non des corrections de facto. Aucun n'empêche la signature propriétaire et la mise en œuvre des actions §7.

La renommage `design-system` → `ui` est correctement identifié comme correction d'une dérive I-04 ; les actions de nettoyage et gate-extension sont spécifiées.

**Prêt à la signature. Pas de jalons bloqués.**
