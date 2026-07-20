# Verdict de Conformité Doctrinale — Phase 0 Lexicon Lock

- **Lentille :** Conformité doctrine (INVARIANTS.md, ADR-0008, ADR-0009, ADR-0011, gate doctrine-governance)
- **Cible :** `docs/decisions/LEXICON.md` au commit 0d215d9
- **Relecteur indépendant :** agent Claude Code (rôle adversarial, no-complaisance)
- **Date de revue :** 2026-07-20
- **Statut :** **APPROVE-WITH-CONDITIONS**

---

## Synthèse du verdict

La carte **LEXICON.md** est en conformité majeure avec la doctrine fixée par ADR-0008, ADR-0009, ADR-0011, et le registre des invariants. Tous les noms cibles tracent à une source d'autorité existante ; aucun nom n'est inventé. Le constat de dérive latente vis-à-vis d'I-04 est exact et un plan de correction est fourni.

**Conditions de levée :** trois findings doivent être adressés avant signature. Deux sont **bloquants** (D-01, D-02) ; un est majeur (D-03).

---

## 1. Vérification des noms cibles — Table exhaustive (Point 1 de la lentille)

**Résultat :** Zéro nom inventé. Tous les noms cibles figurent dans les autorités (ADR-0008 §2-3, ADR-0008 §Annexe, ADR-0009 §2, ADR-0011 D2).

### Couche 1 — Produits (home repositories réservés)

| Nom cible            | Repo                          | Produit public              | Source                   | État |
| -------------------- | ----------------------------- | --------------------------- | ------------------------ | ---- |
| `feed-radar`         | `libre-ai/feed-radar`         | Libre AI Radar              | ADR-0008 §2, ADR-0009 §2 | ✓    |
| `notebook`           | `libre-ai/notebook`           | Libre AI Notebook           | ADR-0008 §2, ADR-0009 §2 | ✓    |
| `ai-practices`       | `libre-ai/ai-practices`       | Libre AI Practices          | ADR-0008 §2, ADR-0009 §2 | ✓    |
| `sessions`           | `libre-ai/sessions`           | Libre AI Sessions           | ADR-0008 §2, ADR-0009 §2 | ✓    |
| `boussole-politique` | `libre-ai/boussole-politique` | Libre AI Boussole Politique | ADR-0008 §2, ADR-0009 §2 | ✓    |
| `spec-studio`        | `libre-ai/spec-studio`        | Libre AI Spec Studio        | ADR-0008 §2, ADR-0009 §2 | ✓    |
| `policy`             | `libre-ai/policy`             | Libre AI Model Policy       | ADR-0008 §2, ADR-0009 §2 | ✓    |
| `agent-board`        | `libre-ai/agent-board`        | Missions (app couche 2)     | ADR-0008 §2, ADR-0009 §2 | ✓    |

### Couche 4 — Briques plateforme applicative (vague 1)

| Nom cible | Repo               | Package npm                       | Source           | État |
| --------- | ------------------ | --------------------------------- | ---------------- | ---- |
| `ui`      | `libre-ai/ui`      | `@libre-ai/ui`                    | ADR-0008 §Annexe | ✓    |
| `auth`    | `libre-ai/auth`    | `@libre-ai/auth-web` (exception)  | ADR-0008 §Annexe | ✓    |
| `sdk-ts`  | `libre-ai/sdk-ts`  | `@libre-ai/contracts` (exception) | ADR-0008 §Annexe | ✓    |
| `sdk-rs`  | `libre-ai/sdk-rs`  | `libre-ai-contract-types`         | ADR-0008 §Annexe | ✓    |
| `starter` | `libre-ai/starter` | —                                 | ADR-0008 §Annexe | ✓    |

### Couche 3 — Briques infrastructure de confiance (vague 2)

| Nom cible    | Repo                  | Package/Crate                                  | Source      | État |
| ------------ | --------------------- | ---------------------------------------------- | ----------- | ---- |
| `envelope`   | `libre-ai/envelope`   | `@libre-ai/envelope` · `libre-ai-envelope`     | ADR-0009 §2 | ✓    |
| `provenance` | `libre-ai/provenance` | `@libre-ai/provenance` · `libre-ai-provenance` | ADR-0009 §2 | ✓    |
| `proof`      | `libre-ai/proof`      | `@libre-ai/proof` · `libre-ai-proof`           | ADR-0009 §2 | ✓    |
| `artifacts`  | `libre-ai/artifacts`  | `@libre-ai/artifacts` · `libre-ai-artifact`    | ADR-0009 §2 | ✓    |
| `memory`     | `libre-ai/memory`     | `@libre-ai/memory` · `libre-ai-memory`         | ADR-0009 §2 | ✓    |

### Couche 2 — Briques gestion des agents (Polaris, vague 3)

| Nom cible      | Repo                    | Package/Crate                 | Source      | État |
| -------------- | ----------------------- | ----------------------------- | ----------- | ---- |
| `orchestrator` | `libre-ai/orchestrator` | `libre-ai-agent-orchestrator` | ADR-0009 §2 | ✓    |
| `harness`      | `libre-ai/harness`      | `libre-ai-harness`            | ADR-0009 §2 | ✓    |

### Transverse — Distribution

| Nom cible    | Repo                  | Package                | Source           | État |
| ------------ | --------------------- | ---------------------- | ---------------- | ---- |
| `mcp-server` | `libre-ai/mcp-server` | `@libre-ai/mcp-server` | ADR-0008 §Annexe | ✓    |
| `corpus`     | `libre-ai/corpus`     | —                      | ADR-0008 §Annexe | ✓    |
| `docs`       | `libre-ai/docs`       | —                      | ADR-0008 §Annexe | ✓    |

### Noms d'outillage retirés (jamais réutilisés)

Énumérés en LEXICON.md §1.2 : `gear`, `context-kit`, `client-kit`, `proof-kit`, `artifact-supply`, `design-system`, `agent-factory`, `website`, `benchmarks`, `dioxus-app-template`.

**Source :** ADR-0008 §3 (exactement les mêmes noms).

**Statut :** ✓ Conformes à I-04 (jamais réutilisés).

### Nom de la couche 2 (étoile polaire)

| Nom     | Source      | État |
| ------- | ----------- | ---- |
| Polaris | ADR-0011 D2 | ✓    |

**Conclusion du point 1 :** Tous les noms cibles tracent exhaustivement à une source d'autorité. Zéro hallucination, zéro invention.

---

## 2. Vérification des contradictions avec les invariants (Point 2)

### Invariant I-04 : URLs réservées, noms retirés non réutilisés

**Constat :** Violation **actuellement présente et reconnue** par la carte.

**Détails :**

- `packages/design-system` porte le nom de package `@libre-ai/design-system`.
- `design-system` figure dans la liste des "noms d'outillage retirés" (ADR-0008 §3).
- I-04 stipule : "Les noms d'outillage hérités ne sont **jamais** réutilisés."
- LEXICON.md §2.1 reconnaît explicitement : "`design-system` est un nom d'outillage retiré (§1.2) ; le package socle actuel le réutilise — **dérive latente vis-à-vis d'I-04**, corrigée par le renommage `@libre-ai/design-system` → `@libre-ai/ui`."

**Statut :** Violation reconnue et plan de correction fourni (§7 point 1 : "Renommage `@libre-ai/design-system` → `@libre-ai/ui` (`packages/design-system` → `packages/ui`), imports et lockfile à la main (v2), vague 1").

**Finding :** Voir D-02 (bloquant).

### Invariants I-13, I-14, I-16 (Produit zéro, portefeuille, loi de couverture)

**Constat :** Zéro contradiction.

- LEXICON.md §3 énumère les produits de couche 1 et leur "nom public" (Libre AI + descriptif), conforme à I-14.
- LEXICON.md §4 définit "Libre AI" comme "la marque ombrelle : constellation de produits souverains…gérée par la méthode", conforme à I-13 (le produit zéro est la méthode).
- LEXICON.md §2.5 reconnaît que certaines briques "restent internes au socle jusqu'à ce que la loi de couverture (I-16) les promeuve", conforme à I-16.

**Statut :** ✓ Conformes.

### Autres invariants (I-01, I-02, I-03, I-05, I-09, I-10, I-11, I-12, I-15, I-17, I-18, I-19, I-20)

**Constat :** Zéro contradiction détectée.

- I-01 (marque cible Libre AI, EUIPO figuratif, ancrage `.fr`) : LEXICON.md §5 reprend identiquement ces éléments.
- I-02 (topologie multi-repository) : LEXICON.md §1 et §2 énumèrent les repositories cibles conformément à I-02.
- I-03 (socle = autorité unique) : LEXICON.md ne réédite pas les contrats.
- I-05 (projection ≠ repository) : LEXICON.md §2.5 et §6 respectent cette frontière.
- Etc.

**Statut :** ✓ Conformes.

**Conclusion du point 2 :** Une violation identifiée et reconnue (I-04 via design-system). Tous les autres invariants sont respectés.

---

## 3. Statut documentaire (Point 3)

**Lentille :** La carte s'érige-t-elle en seconde autorité contre INVARIANTS.md ? Affirme-t-elle un statut "sans ambiguïté" pour son effet ?

### Analyse du statut déclaré

LEXICON.md en-tête :

- "Statut : proposed — **sans effet tant que la signature propriétaire n'est pas prononcée**."
- "Arbitrage : **requis** — la signature propriétaire de cette carte est l'acte de clôture de la Phase 0 (Lexicon Lock)."
- "Règle d'anti-hallucination : tant que cette carte n'est pas signée, aucun agent n'écrit un nom cible comme acquis ; après signature, tout nom hors carte est un défaut bloquant."

**Constat :** Le statut est clair : `proposed`, sans effet avant signature. La carte ne s'affirme pas comme autorité vivante avant signature.

### Insertion dans la hiérarchie documentaire

**Question :** Une fois signée, où s'inscrit LEXICON.md dans la carte d'autorité documentaire (docs/README.md) ?

**Constat :** La carte d'autorité documentaire ne mentionne pas LEXICON.md. INVARIANTS.md est listée comme l'autorité unique pour la doctrine. LEXICON.md ne précise pas si elle doit modifier INVARIANTS.md (ajouter une entrée I-21 sur les noms cibles) ou figurer en tant qu'autorité satellite de `docs/decisions/`.

**Finding :** Voir D-03 (majeur).

### Présence de la carte dans le gate

**Constat :** LEXICON.md réside dans `docs/decisions/`, qui n'est pas exclu du gate `doctrine-governance`. Avant signature, elle est `proposed` et doit passer le gate. Elle ne cite pas les motifs deny-listés actuels (Daidalos, free-ai.fr, libre-ia.fr, projections à sens unique) — donc elle ne faillerait pas le gate actuellement.

**Constat post-signature (§6.3) :** Après signature, §6.3 propose d'étendre la deny-list aux motifs `rumble`, `bolt`, `wrench`, `gear`, `portal`, `cos-matic|cosmatic`. LEXICON.md elle-même cite ces marques en §6.1 pour les documenter comme "retirées". Si l'extension du gate ne crée pas une exclusion explicite pour LEXICON.md, le gate faillerait sur son propre contenu.

**Finding :** Voir D-01 (bloquant).

**Conclusion du point 3 :** Statut pré-signature clair et rigoureux. Inscription post-signature dans la hiérarchie documentaire non clarifiée. Risque de collision avec le gate étendu non adressé.

---

## 4. Conformité au gate doctrine-governance (Point 4)

### Gate actuel (commit 0d215d9)

Le job `doctrine-governance` `.github/workflows/doctrine-governance.yml` recherche ces motifs deny-listés :

- `projections à sens unique` ✗
- `repositories spécialisés sont des projections` ✗
- `unique source modifiable` ✗
- `Daidalos` ✗
- `free-ai\.fr` ✗
- `libre-ia\.fr` ✗

Et exclut :

- `docs/transformation/inputs/`
- `docs/reviews/`
- `docs/adr/0008-`
- `node_modules/`

**Constat :** LEXICON.md (en `docs/decisions/`) ne cite aucun motif deny-listé actuellement. Elle passe le gate. ✓

### Gate post-signature (§6.3 de LEXICON.md)

LEXICON.md §6.3 propose d'étendre la deny-list à :

```
rumble, bolt, wrench, gear, portal, cos-matic|cosmatic
```

Sur "les documents vivants, avec exclusions explicites des registres historiques" (section 6.2).

**Constat :** LEXICON.md elle-même cite ces motifs en §6.1 ("Marques retirées (jamais réintroduites)") pour les documenter comme retirées. Si l'extension du gate est appliquée sans exclure LEXICON.md, le gate faillerait sur son propre contenu.

**Finding :** Voir D-01 (bloquant).

---

## 5. Frontière méthode/produit (Point 5)

**Question :** LEXICON.md redéfinit-elle des termes de méthode (socle, satellite, vague, gate, traceur, control plane, work-package) ?

### Analyse du glossaire produit (§4)

| Terme                         | Type                 | Redéfinition de méthode ?                                                          |
| ----------------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| Libre AI                      | Marque ombrelle      | Non (c'est un nom de marque, pas un concept de méthode)                            |
| Polaris                       | Couche 2 productisée | Non (c'est le nom de produit pour la couche 2, pas une redéfinition de « couche ») |
| Missions                      | Application          | Non                                                                                |
| Radar, Notebook, etc.         | Produits             | Non                                                                                |
| envelope, proof, memory, etc. | Briques              | Non                                                                                |
| orchestrator, harness         | Briques              | Non                                                                                |
| ui, auth, etc.                | Briques              | Non                                                                                |

**Sections critiques** :

- Définition de "Polaris" : "La méthode incarnée (couche 2 productisée) : orchestration gouvernable de flottes d'agents — plans bornés, refus, évidence, gates."
  - Utilise les termes « plans bornés », « refus », « évidence », « gates » mais les énumère comme **attributs de Polaris**, pas comme des redéfinitions de ces concepts.
  - Conforme.

- En-tête : "Le glossaire de **méthode** (socle, control plane, satellite, vague, gate, WP, traceur…) est déjà fixé et ne relève pas de cette carte."
  - Affirmation claire et respectée dans tout le document. ✓

**Constat :** Zéro redéfinition de termes de méthode. Frontière respectée. ✓

---

## Findings

### D-01 : Extension du gate doctrine-governance crée une boucle (BLOQUANT)

**Sévérité :** BLOCKING

**Constat :** LEXICON.md §6.3 propose d'étendre la deny-list du job `doctrine-governance` aux motifs `rumble|bolt|wrench|gear|portal|cos-matic|cosmatic` "sur les documents vivants". LEXICON.md elle-même cite ces motifs en §6.1 pour les documenter comme "Marques retirées (jamais réintroduites)". Si l'extension est appliquée sans créer une exclusion explicite pour `docs/decisions/LEXICON.md`, le gate faillerait sur son propre contenu après signature.

**Correction attendue :** Soit (a) expliciter dans §6.3 que LEXICON.md est exclue du gate étendu (ajouter `| grep -v 'docs/decisions/LEXICON.md'` au job), soit (b) rédiger §6.1 de manière à éviter la citation directe des marques retirées (ex. utiliser un pléonasme « marques du groupe {rumble, bolt, …} » sans énumération). L'option (a) est plus élégante et trace clairement le traitement spécial.

### D-02 : Réaction latente I-04 — design-system réutilisé (BLOQUANT)

**Sévérité :** BLOCKING

**Constat :** Le package `packages/design-system` porte le nom `@libre-ai/design-system`. LEXICON.md reconnaît explicitement que `design-system` est un "nom d'outillage retiré" (§1.2, repris d'ADR-0008 §3) et que sa réutilisation actuelle constitue une "dérive latente vis-à-vis d'I-04". Un plan de correction est fourni (§7 point 1 : renommage en vague 1).

**Risque :** Si la signature de LEXICON.md n'est pas accompagnée d'une exécution immédiate du renommage, la violation d'I-04 reste en place dans le code livrant jusqu'à la vague 1. Cela contredit I-04 dans l'intervalle.

**Correction attendue :** Expliciter dans LEXICON.md ou dans un ADR de clôture que :

- (a) Le renommage est une condition de la clôture du Specification Lock (procédé du Phase 0 Lexicon Lock), exécuté avant l'entrée en vague 1, OU
- (b) Un délai fixe est établi (ex. « dans les N jours suivant la signature », ou « avant l'activation de vague 1 ») pour l'exécution, avec engagement de tracking.

### D-03 : Statut post-signature non clarifié dans la hiérarchie documentaire (MAJEUR)

**Sévérité :** MAJOR

**Constat :** La carte d'autorité documentaire (`docs/README.md`) liste INVARIANTS.md comme "l'autorité unique" pour la doctrine, et n'y mentionne pas LEXICON.md. Une fois signée, LEXICON.md devient-elle :

- Une extension d'INVARIANTS.md (auquel cas une entrée I-21 devrait être ajoutée à INVARIANTS.md) ?
- Une autorité autonome dans `docs/decisions/` (auquel cas docs/README.md doit la lister) ?
- Un acte de clôture hors hiérarchie ordinaire (auquel cas elle doit se déclarer comme telle) ?

**Trace dans LEXICON.md :** "Arbitrage : requis — la signature propriétaire de cette carte est **l'acte de clôture** de la Phase 0 (Lexicon Lock)." → Cela suggère qu'elle est un acte terminatif, pas un document durable de la hiérarchie. Mais cela n'est pas explicite.

**Constat d'audit :** Après signature, des agents ou des décisions futures pourraient citer « selon LEXICON.md §X » sans passer par INVARIANTS.md, créant de facto une seconde autorité sur les noms, contredisant I-03 ("le socle…est l'autorité unique").

**Correction attendue :** Clarifier le statut post-signature. Options :

- (a) Ajouter une entrée à INVARIANTS.md (I-21) : « Les noms cibles de la constellation sont fixés par le Lexicon Lock 0d215d9 signé le [date] ; exception aux conventions d'ADR : cet acte ne porte pas de numéro d'ADR car il clôt la Phase 0 et fait autorité pour la topologie des noms. » Puis ranger LEXICON.md en `docs/reviews/` comme preuve archive du lock, non normative post-signature.
- (b) Ajouter une ligne dans la carte d'autorité documentaire (docs/README.md) : « Noms cibles et glossaire produit | LEXICON.md (Lexicon Lock 0d215d9, signé le [date]) ».

L'option (a) maintient INVARIANTS.md comme source unique en absorbant la décision ; l'option (b) crée une dualité explicite. L'option (a) est cohérente avec I-03.

---

## Verdicts par point de la lentille

| Point | Titre                                                                  | Statut                               |
| ----- | ---------------------------------------------------------------------- | ------------------------------------ |
| 1     | Zéro nom inventé (tous tracent à source)                               | ✓ PASS                               |
| 2     | Pas de contradiction avec invariants (sauf I-04 reconnue et planifiée) | ⚠ PASS-WITH-CONDITION                |
| 3     | Statut documentaire sans ambiguïté                                     | ⚠ PASS-WITH-CONDITION                |
| 4     | Gate doctrine-governance passerait                                     | ⚠ FAIL-POST-SIGNATURE-SANS-EXCLUSION |
| 5     | Frontière méthode/produit                                              | ✓ PASS                               |

---

## Verdict final

**APPROVE-WITH-CONDITIONS**

La carte LEXICON.md est substantiellement conforme à la doctrine et prête pour revue de signature. Les trois findings sont adressables sans restructuration majeure :

1. **D-01 (bloquant) :** Ajouter une exclusion explicite à la §6.3 (extension du gate) pour LEXICON.md elle-même.
2. **D-02 (bloquant) :** Fixer un délai d'exécution ferme pour le renommage design-system → ui, ou l'exécuter avant signature.
3. **D-03 (majeur) :** Clarifier le statut post-signature de LEXICON.md dans la hiérarchie documentaire (option : ajouter I-21 à INVARIANTS.md ou une ligne à docs/README.md).

**Conditions de levée :** Les trois findings doivent être clos par amendement de la carte ou par un document d'accompagnement signé avant la signature du Lexicon Lock.

**Signature peut procéder :** Dès que les trois conditions ci-dessus sont satisfaites, la carte est approuvable. Le contenu substantiel n'exige pas de révision.

---

## Annexe : Trace d'audit

- ✓ LEXICON.md lu intégralement (155 lignes, commit 0d215d9)
- ✓ INVARIANTS.md lu (I-01..I-20 vérifiés)
- ✓ ADR-0008 §1-3, §Annexe lu et contrôlé
- ✓ ADR-0009 §2, §4, §5, §6, §7 lu et contrôlé
- ✓ ADR-0011 D1-D2 lu et contrôlé
- ✓ docs/README.md carte d'autorité lue
- ✓ .github/workflows/doctrine-governance.yml gate lu
- ✓ ecosystem/repositories.v1.yaml inventaire lu
- ✓ packages/design-system/package.json vérifié (nom confirmé `@libre-ai/design-system`)
- ✓ Table exhaustive des noms tracés à source
- ✓ Aucun motif deny-listé détecté dans le contenu (avant extension)
- ✓ Zéro hallucination de noms
