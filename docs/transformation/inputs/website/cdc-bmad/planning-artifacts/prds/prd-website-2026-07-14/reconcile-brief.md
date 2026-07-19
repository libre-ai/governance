---
title: "Réconciliation brief → PRD : éléments perdus et affaiblis"
status: analysis
date: 2026-07-14
---

# Réconciliation brief → PRD : éléments perdus et affaiblis

## Synthèse

Le PRD traduit correctement les exigences fonctionnelles et non-fonctionnelles du brief, mais perd les **dimensions qualitatives et stratégiques** qui structurent la promesse : contexte temporal, psychologie du problème, positionnement de marque, et horizon de vision. Ces pertes ne cassent pas l'exécution MVP (FR/NFR sont là), mais créent un risque de **dérive de ton** et de **priorisation** en aval (spec UX, implémentation). Les décisions fondatrices du brief (collectif en formation, site comme outil de recrutement autant que de vente, moat sur la discipline non la technologie) s'effacent des points de repère visibles.

## Écarts majeurs

### 1. Contexte temporal complètement absent

**Brief :**

- AI Act entrée en application renforcée le 2 août 2026 — justifie l'urgence et l'attention stratégique
- Fondateur donne déjà ~1 intervention majeure/mois avant lancement — cette baseline capture et convertit, n'en crée pas
- Collectif vise ~10 membres fin d'été 2026 — calendar-driven, crée urgence de recrutement parallèle

**PRD :**

- Aucune mention de ces trois temporalités
- Horizon métrique = 6 mois après lancement (§7), mais le **why now** et le timing stratégique manquent
- Risque aval : les décisions de corpus et de conversion sont vagabondes si on perd « on a 3 mois avant que le collectif se fédère »

### 2. Psychologie du problème réduite à une table

**Brief — trois aveuglements structurants :**

- Aveuglement économique : crédits opaques par construction, coûts imprévisibles, ROI indémontrable
- Illusion de compétence : les outils d'IA masquent la consommation réelle, faux sentiment de maîtrise
- Vulnérabilité stratégique : accès coupable unilatéralement, chantage économique permanent

**PRD — section 2.1 (Jobs to be done) :**

- Ramassée en tableau : dirigeant veut « Aide-moi à décider », décideur public « Éclaire-moi sans agenda »
- Le diagnostic du problème (ce qui pousse le dirigeant) disparaît
- Exemple de voix : citation dirigeant du brief (« Je ne sais pas combien... ») — cible, viscéral, disparu

**Impact :** la spec UX et contenu perdent l'ancre émotionnelle du positionnement. Risque d'un home qui énumère les bénéfices sans structurer le problème.

### 3. Registre et différenciation de marque implicites

**Brief — choix de marque explicites (§Ce qui nous différencie) :**

- Indépendance structurelle : on ne vend ni hébergement, ni modèles, ni licences
- Preuve par l'exemple : on opère nous-mêmes la chaîne recommandée, stack/coûts/limites publiés
- Couplage unique : résilience + sobriété + transparence comme une seule discipline
- **Registre du respect :** on parle maîtrise et respect, pas peur/hype — et l'humilité sur ce qui n'est pas prêt est la meilleure garantie sur ce qu'on affirme

**PRD :**

- Les trois premiers figent en NFR-1 (aucune dépendance hyperscaler) et FR-15 (page chaîne maîtrisée)
- Le registre de marque disparaît : aucun des quatre piliers n'est nommé
- L'humilité comme outil de différenciation (refus de survendre produits) existe en FR-17 (état honnête) mais déconnecté de la raison stratégique

**Impact :** le PRD donne des exigences technique (souveraineté, transparence) sans l'architecture de sens qui les justifie. Une spec UX qui en déduit « montrer le prix » ou « amplifier la technologie » diverge du brief.

### 4. Collectif en formation : job de site dégradé de "recrutement autant que vente"

**Brief :**

- État réel : en formation, ~10 visés à fin d'été
- Site assume cette vérité : ne met pas en scène un collectif qui n'existe pas
- **Job double déclaré :** « un instrument de **recrutement** autant que de vente »
- Recrutement par cooptation, porte discrète (pas de formulaire candidature public)
- Croissance visible du collectif (visages ajoutés) = preuve elle-même

**PRD :**

- FR-12 (page collectif) et FR-14 (porte discrète) préservent les éléments structurels
- Mais le **pourquoi** (recrutement=job structurant du site) s'efface
- Absent : la tension que le site grandit avec le collectif et ne le précède jamais, l'importance de la cooptation comme filtre

**Impact :** une spec UX peut traiter la page collectif comme « annonce de vision » sans comprendre que c'est un **aimant pour les pairs**. Risque : langage trop corporate, pas assez invitant pour cooptation.

### 5. Vision horizon court terme

**Brief — vision 2-3 ans :**

- Libre IA est la voix qu'on cite quand la France/Europe parlent de résilience opérationnelle
- Les briefs trimestriels sont attendus
- Auditions et keynotes se déclenchent sans démarchage

**PRD :**

- Toutes les métriques horizon = 6 mois (M1-6)
- Pas de vision au-delà du lancement
- Pas de trajectoire de pérennité du corpus

**Impact :** limite la lecture à "faire un site qui convertisse en RDV". Perd l'angle long terme où le corpus devient progressivement une **référence publique** (à citer, à briefs trimestriels, à auditions). Cela affecte les choix de structuration du corpus et les investissements à consentir en crédibilité.

### 6. Moat sur la durée : position + discipline vs technologie

**Brief :**

- Explicite et honnête (§Ce qui nous différencie) : « ceci n'est pas un moat technique. C'est une **position** (l'indépendance) et une **discipline** (la preuve), qui ne valent que tenues dans la durée »
- Le contexte aide, mais n'est pas le différenciateur

**PRD :**

- Énumère les exigences techniques : NFR-1 (aucune dépendance), NFR-2 (zéro-tracking), NFR-6 (sobriété ≤500 Ko), etc.
- Ces exigences ressemblent à un moat technologique
- Le message « on tient ça par discipline, pas par technologie seule » s'efface

**Impact :** risque que la team perçoive le site comme une démonstration technique (chaîne maîtrisée = exercice d'ingénierie). En réalité, c'est une **démonstration de discipline** — la technologie est l'outil, pas le sujet.

### 7. Disposition du site hérité (TARGET.md, ADR) — noir sur le PRD

**Brief/Addendum :**

- Autopsie du site actuel : exécutait un autre job (portail produit institutionnel), h1 adressé aux utilisateurs d'outils pas aux acheteurs
- Décision actée : TARGET.md et ADR hérités à remplacer/amender par CDC issu du brief
- Cause diagnostiquée : accumulation sans décision, drift causée par vagues d'agents sans main unique

**PRD :**

- Zero mention du site en place, de TARGET.md, ou du dépôt à faire de contenu hérité
- §5 énumère les non-objectifs v1 (pas de blog, pas de prod, pas de newsletter)
- Trou de conception : qu'est-ce qu'on fait des pages actuelles ? Migration, suppression, archive ?

**Impact :** transition technique risquée. Aucune exigence de décommissioning n'est posée. Risque d'une implémentation qui co-existe avec du legacy sans gouvernance.

## Synthèse des pertes

| Dimension            | Brief                                             | PRD                              | Risque                                                        |
| -------------------- | ------------------------------------------------- | -------------------------------- | ------------------------------------------------------------- |
| Contexte temporal    | AI Act août 26, ~1 interv/mois, collectif fin été | Absent                           | Urgence et priorisation perdues, horizon flou                 |
| Psychologie problème | 3 aveuglements + cible quotidienne                | Table générique jobs to be done  | Home énumère bénéfices au lieu de structurer le problème      |
| Registre marque      | Maîtrise/respect vs peur/hype, humilité           | Implicite, technicien            | Ton dérape, spec UX diverge de l'esprit du brief              |
| Collectif job        | Recrutement autant que vente, cooptation clé      | Structure (FR-12/14) sans raison | Page collectif traitée comme annonce, pas comme aimant        |
| Vision horizon       | 2-3 ans, corpus référence, briefs attendus        | 6 mois post-lancement            | Perte de trajectoire long terme, invest en corpus sous-évalué |
| Moat stratégique     | Position + discipline > technologie               | Exigences techniques énumérées   | Risque de tech-led interpretation au lieu de discipline-led   |
| Héritage site        | Autopsie, TARGET.md/ADR à remplacer               | Absent                           | Transition legacy non gouvernée, co-existence risquée         |

## Recommandations pour aval

1. **Spec UX :** relire le brief complet (§Le problème, §Différenciation) avant de toucher le home. Traduire les trois aveuglements en architecture narrative, pas énumération de bénéfices.

2. **Contenu corpus :** ancrer la vision d'autorité publique (2-3 ans) — les trois pièces v1 ne sont pas juste une preuve MVP, c'est la base d'une voix persistante.

3. **Collectif/recrutement :** l'adresse de la page collectif est mixte (clients ET pairs). La discrétude et l'humilité sur ce qui n'est pas prêt sont des appels à la cooptation, pas des apologétiques.

4. **Architecture :** arbitrer explicitement : moat sur discipline (approche brief) ou moat sur technologie (risque de dérive). C'est structural pour les tradeoffs sobriété/compétence aval.

5. **Décommissioning :** ajouter une exigence d'architecture : plan de disposition de TARGET.md, ADR hérités, pages legacy. Ne pas laisser cette décision aux implémenteurs.

6. **Calibration gate finale :** avant CDC final, faire relire le brief par la team amont (spec UX, architecture) pour que ces dimensions qualitatives ne s'évaporent pas à la première implémentation.
