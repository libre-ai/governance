# VERIFY-PASS — Lexicon Lock Phase 0 (commits 0d215d9 → 81a47f8)

- **Rôle** : Relecteur indépendant, fonction adversariale (audit de verification)
- **Commits vérifiés** : 0d215d9 (carte initiale) → 81a47f8 (corrections)
- **Date de revue** : 2026-07-20
- **Cibles** : docs/decisions/LEXICON.md, docs/README.md
- **Méthode** : Comparaison systématique finding-par-finding contre les trois verdicts K4

---

## Synthèse : VERDICT FINAL = **DIRTY**

Une correction critique **NOT-ADDRESSED** (N-02) empêche la levée de l'approval-with-conditions.
Huit autres findings sont traités (7 ADDRESSED, 1 CARRIED-TO-DOSSIER).
Zéro régression nouvelle.

---

## Tableau de vérification — findings et statuts

| ID       | Verdict K4 | Sujet                                                                    | Correction requis                                                                                 | Statut                 | Justification                                                                                                                                                                                                                                                                                                                                                            |
| -------- | ---------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **C-01** | COHERENCE  | Standardiser en-têtes tables (variation 2.1–2.4)                         | Harmoniser colonnes "Package npm/crate"                                                           | **ADDRESSED**          | Tables 2.1, 2.2, 2.3, 2.4 uniformisées : colonne "Package/crate cible" partout ; zéro variation restante                                                                                                                                                                                                                                                                 |
| **C-02** | COHERENCE  | Clarifier 7 produits vs 8 repositories                                   | Ajouter phrase clarificatrice après §1.1                                                          | **ADDRESSED**          | Ligne ajoutée post-table 1.1 : "Sept produits (Radar, Notebook, AI Practices, Sessions, Boussole Politique, Spec Studio, Model Policy) ; `agent-board`/Missions est l'**application** de la couche 2, pas un huitième produit" — juste comme prescrit                                                                                                                    |
| **C-03** | COHERENCE  | Ambiguïté sur promotion `libre-ai-authz-biscuit`                         | Clarifier destin (authz-biscuit vs auth-biscuit à promotion)                                      | **ADDRESSED**          | §2.5 ajoute règle déterministe explicite : "`libre-ai-authz-biscuit` → repo `authz-biscuit`, npm `@libre-ai/authz-biscuit`" — règle prime sur tout autre patron (notamment auth-family note)                                                                                                                                                                             |
| **N-01** | COLLISIONS | Polaris : collision majeure (Atos Polaris juillet 2025 + marque UE)      | Arbitrage propriétaire doit re-confirmer avant signature                                          | **CARRIED-TO-DOSSIER** | §5 : "**Donnée nouvelle post-arbitrage** identifiée par la revue K4 (lentille collisions) : un produit actif du même segment... La confirmation ou le remplacement du nom est un **point de décision propriétaire** du dossier Phase 0 — cette carte ne le tranche pas." Honnête, transported au dossier, sans tranchement. (Brief accepte CARRIED-TO-DOSSIER pour N-01) |
| **N-02** | COLLISIONS | libre-ai.fr : propriétaire non confirmé                                  | Vérifier empiriquement (WHOIS AFNIC, contact propriétaire) AVANT signature                        | **NOT-ADDRESSED**      | Aucune mention nouvelle de libre-ai.fr. Section 5 énumère toujours "l'ancrage `libre-ai.fr`" sans reconnaissance du finding ou transport au dossier. Verdict exigeait une vérification empirique _avant_ signature (bloquant) ; correction ignore complètement ce finding. (Brief accepte CARRIED-TO-DOSSIER pour N-02 SI la carte le signale — ce n'est pas le cas.)    |
| **N-03** | COLLISIONS | @libre-ai scope npm : non trouvé, action requise                         | Créer scope avant publication de paquets                                                          | **ADDRESSED**          | Nouvelle action 4 (§7) : "Réservation du scope npm `@libre-ai` (création de l'organisation npm) avant toute publication satellite de la vague 1 — le scope est libre au 2026-07-20 (revue K4 collisions)" — exactement comme attendu                                                                                                                                     |
| **D-01** | DOCTRINE   | Extension du gate `doctrine-governance` crée boucle (bloquant)           | Exclure LEXICON.md elle-même de la deny-list étendue                                              | **ADDRESSED**          | §6.3 : "avec exclusions explicites : ... **et cette carte elle-même** (`docs/decisions/LEXICON.md`), qui doit pouvoir énumérer les marques mortes sans les réintroduire." Option (a) du verdict, exactement                                                                                                                                                              |
| **D-02** | DOCTRINE   | design-system réutilisé (I-04 latente, bloquant)                         | Fixer délai ferme d'exécution du renommage                                                        | **ADDRESSED**          | Action 1 (§7) : "**première action de la vague 1, précondition de tout autre merge de cette vague** (clôture de la dérive I-04 constatée §2.1 ; délai ferme : avant toute publication satellite)" — délai fixe, exécution deterministe                                                                                                                                   |
| **D-03** | DOCTRINE   | Statut post-signature non clarifié dans hiérarchie documentaire (majeur) | Clarifier statut : soit (a) ajouter I-21 à INVARIANTS.md, soit (b) ajouter ligne à docs/README.md | **ADDRESSED**          | Option (b) appliquée : (1) en-tête LEXICON.md ajoute "**Place documentaire** : après signature, cette carte devient l'autorité unique du sujet « noms cibles et glossaire produit » et s'inscrit à ce titre dans la carte d'autorité (`docs/README.md`)" ; (2) docs/README.md ajoute ligne "Noms cibles et glossaire produit                                             | `docs/decisions/LEXICON.md` (autorité dès la signature propriétaire ; proposed d'ici là)" |

---

## Détails des findings non résolus

### N-02 : libre-ai.fr propriétaire non confirmé — **BLOQUANT EN ATTENTE**

**Constat du verdict K4** :

> "ADR-0008 §6 et LEXICON.md §5 documentent l'ancrage 'libre-ai.fr' comme un élément clé de la posture de marque. Cependant, les recherches WHOIS n'ont pas retourné le propriétaire du domaine… **C'est une hypothèse, pas un fait établi.**"

**Correction attendue (verdict final)** :

> "Avant signature, confirmer empiriquement (WHOIS AFNIC, contact propriétaire) que libre-ai.fr est :
> (a) enregistré et contrôlé par l'entité Libre AI / Constantin Jais, OU
> (b) librement disponible pour enregistrement immédiat, OU
> (c) un tiers l'a enregistré — et documenter la stratégie de dénomination en conséquence."

**Analyse de la correction (81a47f8)** :

- Zéro modification de la section 5 traitant libre-ai.fr.
- La phrase "l'ancrage `libre-ai.fr`" demeure telle quelle (ligne 130), sans nouvelle vérification ou signalement.
- Aucune nouvelle ligne qui dirait « libre-ai.fr doit être vérifié » ou « c'est un point de décision propriétaire ».
- Contrairement à N-01, qui a reçu un transport au dossier explicite ("point de décision propriétaire"), N-02 reste silencieux.

**Verdict du VERIFY-PASS** :

- **NOT-ADDRESSED** — Le finding N-02 n'est ni résolu (empiriquement) ni transported au dossier (explicitement signalé). C'est un trou dans la couverture des conditions bloquantes du verdict K4 APPROVE-WITH-CONDITIONS.

**Impact sur la signature** :
Le verdict K4 COLLISIONS dit : "APPROVE-WITH-CONDITIONS… 2. **libre-ai.fr (N-02)** : Avant signature, confirmer empiriquement…"
La correction ne fournit pas cette confirmation et ne la porte pas au dossier. Le Lexicon Lock reste en attente de cette vérification propriétaire avant de pouvoir lever la condition.

---

## Vérification des régressions

### Nouvelle ligne docs/README.md

```
| Noms cibles et glossaire produit  | `docs/decisions/LEXICON.md` (autorité dès la signature propriétaire ; proposed d'ici là) |
```

**Conformité à la règle « un sujet = une autorité » ?**

- Oui. LEXICON.md est désormais le seul sujet listant « noms cibles et glossaire produit ». Aucune duplication, aucune seconde autorité.
- La condition "dès la signature propriétaire" explicite que le statut est conditionnel et temporaire (proposed d'ici là).
- ✓ Pas de régression.

### Modification section 2.5 (règle déterministe)

Ancien texte :

> "leur nom satellite éventuel reprendra le nom du crate sans le préfixe `libre-ai-`."

Nouveau texte :

> "leur nom satellite éventuel reprend le nom du crate sans le préfixe `libre-ai-` — règle déterministe qui prime sur tout autre patron : `libre-ai-authz-biscuit` → repo `authz-biscuit`, npm `@libre-ai/authz-biscuit` ; `libre-ai-ecosystem-engine` → repo `ecosystem-engine`."

**Contradiction avec la note auth-family ?**

- La note auth (§2.1) dit : "le repo satellite porte la famille `auth`, les surfaces futures s'y ajoutent en `@libre-ai/auth-*`."
- La règle nouvelle sur authz-biscuit dit : "`libre-ai-authz-biscuit` → repo `authz-biscuit`, npm `@libre-ai/authz-biscuit`."
- Pas de contradiction : authz-biscuit n'est pas décrit comme surface de la famille auth. C'est un crate interne promu selon la règle déterministe (pas via la famille). La règle prime explicitement : "règle déterministe qui prime sur tout autre patron."
- ✓ Pas de régression.

### Reconnaissance de Polaris (donnée nouvelle)

Nouveau paragraphe en §5 :

> "**Donnée nouvelle post-arbitrage** identifiée par la revue K4 (lentille collisions) : un produit actif du même segment (« Atos Polaris AI Platform », orchestration d'agents, lancé juillet 2025) et un enregistrement UE du signe « POLARIS » par un tiers hors segment."

**Rejette-t-il ADR-0011 D2 ?**

- Non. La phrase conserve : "collision de nom élevée, connue et **acceptée** par arbitrage (ADR-0011 D2) ; traitement identique à la coexistence de marque documentée (figuratif + `.fr`)."
- Le nouveau texte ajoute juste la donnée post-arbitrage, reconnaît qu'elle ouvre une décision propriétaire, et ne la tranche pas.
- ✓ Pas de régression ; clarification honnête.

### Renumérotation §7 (actions post-signature)

5 actions → 6 actions. Nouvelle action 4 (réservation scope npm), autres renumérotées.

**Cohérence logique ?**

- Oui. L'ordre séquentiel (design-system rename vague 1, nettoyage artifact, gate extension, npm scope, repos.yaml, truth-drift) est logique.
- Action 4 (npm scope) est externe et soumise à checkpoint propriétaire (garde-fou classe 9), approprié comme nouvelle action 4.
- ✓ Pas de régression.

---

## Trace d'audit VERIFY-PASS

✓ Diffs complets lus : LEXICON.md (155 → 160 lignes), docs/README.md (19 → 20 lignes)
✓ Trois verdicts K4 lus intégralement et comparés à 81a47f8
✓ 9 findings examinés un à un
✓ Tous les ADDRESSED validés par rapport au texte du verdict initial
✓ CARRIED-TO-DOSSIER (N-01) validé : signalement honnête, transport au dossier, pas de tranchement
✓ NOT-ADDRESSED (N-02) identifié : zéro mention dans la correction
✓ Regressions potentielles vérifiées : docs/README.md règle autorité, §2.5 cohérence, Polaris reconnaissance, renumérotation §7
✓ Aucune nouvelle hallucination de nom détectée
✓ Aucune nouvelle contradiction avec invariants

---

## Verdict de signature (81a47f8)

**DIRTY** — Blocage sur **1 finding bloquant non-adressé** (N-02).

Levée requise : Avant de prononcer la signature propriétaire du Lexicon Lock, le point de décision propriétaire doit confirmer empiriquement le statut de libre-ai.fr (WHOIS AFNIC ou contact direct) et soit (a) confirmer qu'il est enregistré et contrôlé, soit (b) le documenter comme disponible ou tiers-possédé. Ce finding doit également être signalé dans un amendement à LEXICON.md ou un document de dossier accompagnant la signature.

**CLEAN ne serait certifié que si :**

- N-02 est résolu empiriquement ET documenté dans la correction, OU
- N-02 est explicitement transporté au dossier propriétaire avec une nouvelle phrase en LEXICON.md (ex. section 5 : "libre-ai.fr : vérification empirique de propriété requise avant signature, à charge du dossier propriétaire Phase 0").

---

## Re-verify 6204c80 — Corrections post-81a47f8

**Commits** : 81a47f8 → 6204c80 (même branche docs/phase0-lexicon-lock)
**Modifications** : Deux changements adressant directement N-02 et la boucle de gate réelle dans D-01
**Date de re-verification** : 2026-07-20

### Finding N-02 : libre-ai.fr — **RÉSOLU**

**Modification (§5)** : Nouvelle entrée complète :

> "**Domaine `libre-ai.fr`** (finding N-02 de la revue K4) : vérification empirique du 2026-07-20 (whois + RDAP AFNIC) — le domaine est **enregistré et actif** (registrar Infomaniak, titulaire anonymisé, pratique AFNIC normale pour un particulier). L'anonymisation empêche de prouver le contrôle par le titulaire de ce dépôt : la **confirmation nominative du contrôle** est un point de décision propriétaire du dossier Phase 0 — cette carte ne la présume pas."

**Analyse** :

- ✓ Recognition du finding N-02 (citation explicite)
- ✓ Vérification empirique documentée (whois + RDAP AFNIC du 2026-07-20)
- ✓ Résultat factuel : enregistré et actif
- ✓ Contexte AFNIC explicité : registrar Infomaniak, titulaire anonymisé
- ✓ Explication : anonymisation = zéro preuve du contrôle
- ✓ Transport au dossier propriétaire : "confirmation nominative du contrôle" est un point de décision Phase 0
- ✓ Non-présomption claire : "cette carte ne la présume pas"

**Statut de N-02 : ADDRESSED** — Le finding est résolu empiriquement (vérification WHOIS/RDAP), documenté (état du domaine), contextualisé (raison de l'anonymisation), et transporté au dossier (point de décision propriétaire sur le contrôle nominal).

### Boucle de gate D-01 (réelle, pas seulement proposée) — **RÉSOLU**

**Modification (§6.1)** : Changement de citation verbatim en pointeur :

Ancien (81a47f8) :

> "Marques et domaines déjà deny-listés par le gate doctrine : `Daidalos`, `free-ai.fr`, `libre-ia.fr`."

Nouveau (6204c80) :

> "S'y ajoutent les trois motifs de marque et de domaine déjà deny-listés par le gate doctrine — cette carte les référence **par pointeur** (voir la liste exacte dans `.github/workflows/doctrine-governance.yml`) et ne les recopie pas : les écrire ici déclencherait le gate lui-même, et la liste du workflow reste la source unique."

**Analyse** :

- ✓ Les trois motifs (`Daidalos`, `free-ai.fr`, `libre-ia.fr`) ne sont plus recopiés verbatim dans LEXICON.md
- ✓ Cela élimine le déclenchement du gate doctrine-governance sur LEXICON.md elle-même (boucle réelle)
- ✓ Pointeur explicite vers la source unique (`.github/workflows/doctrine-governance.yml`)
- ✓ Explication du choix : "les écrire ici déclencherait le gate lui-même"
- ✓ Clarification : "la liste du workflow reste la source unique" — pas d'ambiguïté sur la source d'autorité

**Statut de D-01 (boucle réelle, non seulement proposée)** :

- La boucle D-01 du verdict K4 décrivait le risque POST-signature quand l'extension de la deny-list serait appliquée
- Le coordinateur signale que la boucle existe DÉJÀ contre le gate actuel (avant même l'extension proposée)
- La solution du pointeur élimine cette boucle : LEXICON.md ne recopie plus les motifs deny-listés, elle les référence
- Ceci est plus robuste qu'une simple exclusion de LEXICON.md du gate étendu, car c'est une solution par la source unique

### Vérification des régressions (6204c80)

| Aspect                                                              | Constat                                                                                                                                                                               | Status |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Pointeur §6.1 crée-t-il une ambiguïté ?                             | "Les trois motifs" reste clair (3 motifs), pointeur vers workflow = source unique. Pas d'ambiguïté.                                                                                   | ✓ OK   |
| Perte d'information en supprimant la citation verbatim ?            | Non ; le workflow est la source unique de vérité. Suppression = amélioration (une source vs deux copies).                                                                             | ✓ OK   |
| Transport N-02 au dossier crée-t-il une incohérence avec N-01 ?     | Non ; N-01 et N-02 utilisent le même patron (empirique + transport au dossier propriétaire). Cohérence renforcée.                                                                     | ✓ OK   |
| Nombrage de motifs "trois" dans §6.1 vs énumération antérieure ?    | Énumération 81a47f8 : Daidalos, free-ai.fr, libre-ia.fr (3). Pointeur 6204c80 dit "trois motifs" (cohérent).                                                                          | ✓ OK   |
| Interaction entre pointeur §6.1 et extension gate proposée (§6.3) ? | Extension proposée cible `rumble`, `bolt`, `wrench`, `gear`, `portal`, `cos-matic` (héritées). Pointeur gère les `Daidalos`, `free-ai.fr`, `libre-ia.fr` (actuels). Pas de confusion. | ✓ OK   |

**Aucune régression détectée** ; la solution par pointeur est plus robuste que celle proposée en 81a47f8.

---

## Verdict final révisé

**CLEAN** — Tous les 9 findings sont désormais traités correctement :

| Classe             | 81a47f8 | 6204c80   | Total |
| ------------------ | ------- | --------- | ----- |
| ADDRESSED          | 7       | +1 (N-02) | **8** |
| CARRIED-TO-DOSSIER | 1       | —         | **1** |
| NOT-ADDRESSED      | 1       | -1 (N-02) | **0** |
| Régressions        | 0       | 0         | **0** |

**Signature peut procéder** après le merge de 6204c80 sur docs/phase0-lexicon-lock.

---

## Synthèse de couverture

| Classe                      | Count | Statut                       |
| --------------------------- | ----- | ---------------------------- |
| Findings ADDRESSED          | 7     | ✓ OK                         |
| Findings CARRIED-TO-DOSSIER | 1     | ✓ OK (N-01, prévu par brief) |
| Findings NOT-ADDRESSED      | 1     | ✗ BLOCAGE (N-02)             |
| Régressions détectées       | 0     | ✓ OK                         |
| Hallucinations de noms      | 0     | ✓ OK                         |

**Signature bloquée.**
