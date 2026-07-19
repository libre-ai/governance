---
title: "PRD — libre-ai.fr, vitrine du collectif Libre IA"
status: final
created: 2026-07-14
updated: 2026-07-14
---

# PRD : libre-ai.fr

## 0. Objet du document

Exigences produit de la refonte complète de libre-ai.fr, issues du product brief accepté le 2026-07-14 (Gate 1). Ce PRD décrit des capacités, pas des implémentations — les choix techniques appartiennent au document d'architecture. Consommateurs : spec UX, architecture, epics/stories.

## 1. Vision

Libre IA porte une voix indépendante et praticienne sur la résilience opérationnelle : obtenir la capacité de l'IA frontière sans en subir les dépendances. Le site est un **vendeur silencieux** — un corpus de référence court et excellent fabrique la citabilité et préqualifie ; les offres de conseil s'y adossent ; le collectif est incarné ; chaque page converge vers une seule conversion : le rendez-vous. Le site est lui-même la démonstration de ce qu'il prêche : chaîne souveraine, sobre, publiquement documentée, sans tracking.

Promesse : _« De l'IA qui vous respecte : des coûts clairs, des équipes qui maîtrisent vraiment, la liberté de partir quand vous voulez. »_

**Le problème que le site attaque** (détail dans le brief) : le triple aveuglement des organisations — coûts opaques facturés en crédits incompréhensibles, illusion de compétence des équipes qui croient maîtriser et ne délivrent pas, vulnérabilité stratégique face à la coupure unilatérale et aux lois extraterritoriales. Chaque clause de la promesse inverse un de ces aveuglements.

**Fenêtre et horizon.** Le lancement s'inscrit dans une fenêtre favorable : application renforcée de l'AI Act en août 2026, une intervention majeure du fondateur par mois déjà acquise (que rien ne capture aujourd'hui), un collectif d'une dizaine de membres visé pour la fin de l'été. Les choix de pérennité de ce PRD (permaliens immuables, gabarits datés, série trimestrielle) servent la vision à 2-3 ans du brief : devenir la voix que l'on cite.

## 2. Utilisateurs cibles

### 2.1 Jobs to be done

| Visiteur                                                            | Job                                                                     | Ce qu'il vérifie                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| Dirigeant (ComEx, PME/ETI, grand groupe)                            | « Aide-moi à décider sur l'IA sans dépendre du discours des vendeurs »  | La clarté — sa langue, pas celle des ingénieurs   |
| Décideur politique (cabinet, élu, administration) — **prioritaire** | « Éclaire-moi sur la dépendance et la souveraineté, sans agenda caché » | L'indépendance — aucune affiliation hyperscaler   |
| DSI / CTO                                                           | « Prouve-moi que vous savez faire avant que je recommande le RDV »      | La profondeur — dépôts, benchmarks, architectures |
| Pair coopté (futur membre)                                          | « Montre-moi ce que je rejoins et ce qu'on y construit »                | La vision cible, la discipline, les visages       |
| Relais d'opinion (journaliste, analyste, cabinet)                   | « Donne-moi une source citable et datée »                               | La rigueur — sources, méthode, corrections        |

### 2.2 Non-utilisateurs (v1)

- Le grand public apprenant (cours, exercices) — renvoyé vers AI Practices.
- Le développeur cherchant tutoriels ou documentation d'outils — renvoyé vers les dépôts.
- L'acheteur de produits finis : les produits ne sont pas à vendre ici, ils sont des preuves.

### 2.3 Parcours utilisateurs clés

- **UJ-1 — Le dirigeant pressé.** Claire, DG d'une ETI, sort d'un ComEx où la ligne budgétaire IA a doublé sans explication. Elle arrive par une keynote ou une recherche, lit la home en 90 secondes, comprend la promesse, parcourt l'offre « séminaire dirigeants », ne voit pas de prix mais une démarche claire — elle réserve 30 minutes. **Sortie : RDV.**
- **UJ-2 — Le directeur de cabinet.** Karim prépare une audition sur la souveraineté numérique. Il cherche une source qui ne soit ni un hébergeur ni un cabinet anglo-saxon. Il trouve la pièce maîtresse du corpus, vérifie la date, les sources, l'indépendance (page collectif), cite le document dans sa note — et transmet le lien. **Sortie : citation + RDV différé.**
- **UJ-3 — Le DSI sceptique.** Son ComEx revient d'un séminaire enthousiaste ; il cherche la faille. Il descend : page « chaîne maîtrisée », coûts publiés, dépôts publics, états honnêtes des produits. Il ne trouve pas de survente — il valide en interne. **Sortie : levée d'objection.**
- **UJ-4 — La paire cooptée.** Un membre du collectif lui a parlé du projet. Elle lit la vision cible, les valeurs, ce que rejoindre implique, voit les visages existants. Elle utilise la porte discrète. **Sortie : contact spontané qualifié.**

## 3. Glossaire

- **Corpus** : l'ensemble restreint de publications de référence du site. Une **pièce** en est une unité (rapport, brief).
- **Chaîne maîtrisée** : l'infrastructure et les pratiques du collectif, de bout en bout comprises, mesurées et réversibles.
- **Porte discrète** : moyen de contact pour les pairs, sans formulaire de candidature publique.
- **Attribution** : rattachement traçable d'une intervention ou d'un RDV à la pièce de corpus qui l'a déclenché.

## 4. Exigences fonctionnelles

### 4.1 Corpus de référence

- **FR-1 — Gabarit de pièce de corpus.** Chaque pièce porte : nature déclarée (fait / analyse / position), auteur humain responsable, assistance IA déclarée, sources rattachées aux affirmations importantes, méthode de tout chiffre, date de publication et de dernière revue, corrections visibles et datées. Une pièce qui ne satisfait pas le gabarit ne se publie pas — la validation est bloquante à la construction du site (voir NFR-11).
- **FR-2 — Trois pièces au lancement.** La pièce maîtresse (« Sortir des hyperscalers sans perdre la capacité »), la pièce signature (« L'énergie du clic »), le premier brief trimestriel décideurs. Pas de lancement sans les trois. **[NOTE FOR PM — chemin critique]** : la production de ces trois pièces est le blocker n° 1 du lancement ; leur rédaction doit démarrer en parallèle du développement, pas après.
- **FR-3 — Brief trimestriel.** Le gabarit et la navigation supportent une série datée et récurrente (T3 2026, T4 2026…), chaque numéro archivé et citable individuellement.
- **FR-4 — Citabilité.** Chaque pièce a un permalien stable, un titre stable, des métadonnées de partage (Open Graph, schema.org), et un bloc « citer cette page » (auteur, titre, date, URL). [ASSUMPTION A1 : le bloc citation est retenu — différenciant pour UJ-2, coût faible.]
- **FR-5 — Flux RSS** du corpus (pièces + briefs trimestriels), pour les relais d'opinion et la syndication.

### 4.2 Offres et conversion

- **FR-6 — Pages offres T1.** Une page par offre : séminaire dirigeants, keynote, briefing décideurs. Chacune : le problème traité, le déroulé, ce que le client repart avec, la pièce de corpus qui la prouve, le CTA rendez-vous. **Aucun prix — sur devis uniquement.**
- **FR-7 — Pages offres T2 annoncées.** Audit de souveraineté et éclairage des décideurs publics : mêmes gabarits, avec statut honnête (« offre en construction, parlons-en »).
- **FR-8 — Catalogue T3.** Une page unique, sobre, listant les prestations du tier 3 sans page dédiée.
- **FR-9 — CTA universel.** Chaque page de contenu (corpus, offre, collectif, preuve, interventions) se termine par la même sortie : réserver 30 minutes. Une seule conversion, partout.
- **FR-10 — Prise de rendez-vous en ligne.** Réservation d'un créneau de 30 minutes sans création de compte côté visiteur, sur un outil conforme aux NFR de souveraineté et de non-tracking. Le choix de l'outil appartient à l'architecture.
- **FR-11 — Formulaire de contact / email.** Alternative au RDV : formulaire minimal (nom, organisation, email, message — rien d'autre) avec protection anti-abus conforme au zéro-tracking, et adresse email publiée.

### 4.3 Collectif et incarnation

Le site recrute autant qu'il vend : cette feature sert le deuxième job du brief — fédérer le collectif — et s'adresse aux pairs cooptés autant qu'aux clients qui vérifient à qui ils ont affaire.

- **FR-12 — Page collectif.** Le fondateur incarné (nom, photo, parcours), la vision cible du collectif (valeurs, discipline de preuve, ce que rejoindre implique), l'état honnête (« en formation, une dizaine de membres visés fin d'été 2026 »).
- **FR-13 — Fiches membres.** L'ajout d'un membre (nom, visage, parcours, rôle) est une opération de contenu versionnée, sans modification de code ni refonte de page. Le site n'affiche jamais plus de membres qu'il n'en existe réellement.
- **FR-14 — Porte discrète.** La page collectif mentionne la cooptation et accepte la prise de contact spontanée via le formulaire — pas de formulaire de candidature dédié, pas d'appel à contribution public.

### 4.4 Preuve par l'exemple

- **FR-15 — Page « chaîne maîtrisée ».** Publie : la stack du site, ses coûts réels, sa consommation (« l'énergie du clic » appliquée à nous-mêmes), ses limites, et comment la reproduire. Mise à jour à chaque évolution notable ; la date de dernière revue est visible.
- **FR-16 — Référence anonymisée.** La preuve de delivery à l'échelle (« grand groupe bancaire français, exigences supérieures ») est présente sur la page preuve et la page collectif. Aucun nom de client ou d'employeur sans autorisation écrite préalable.
- **FR-17 — « Ce que nous construisons ».** Section sobre listant les produits comme preuves : état honnête (en conception / en construction), lien vers le dépôt public, une ligne d'intention. Pas de page produit dédiée, pas de promesse de disponibilité.

### 4.5 Interventions et attribution

- **FR-18 — Page interventions.** Gabarit par entrée : titre, date, contexte/organisateur, pièce de corpus liée. Démarre sans reprise d'historique (matériau existant volontairement non repris à ce stade) ; s'enrichit à chaque nouvelle intervention.
- **FR-19 — Attribution entrante.** Chaque intervention future renvoie vers une URL dédiée ou un permalien de pièce, pour tracer l'origine des visites en événements réels (RDV mentionnant la provenance) — jamais par tracking.

### 4.6 Navigation et parcours

- **FR-20 — Home à message unique.** Critères testables : un seul h1 et c'est la promesse ; au plus 5 blocs [ASSUMPTION A2 : garde-fou anti « soupe », ajustable par l'UX] ; un seul CTA primaire par écran (le RDV) ; trois portes d'entrée par cible (dirigeant / décideur public / technique). Test d'acceptation : un lecteur externe restitue la promesse et sait où cliquer après 90 secondes de lecture.
- **FR-21 — Navigation orientée acheteur.** Structure principale : Offres · Corpus · Collectif · Interventions · Preuve — et le RDV en permanence accessible. Les intitulés définitifs appartiennent à l'UX ; l'exigence est qu'un dirigeant comprenne en un regard ce qu'on vend et où on le contacte.
- **FR-22 — Pages utilitaires.** Mentions légales, page 404 utile (renvoi home + RDV), sitemap, robots.txt, flux RSS découvrable.

## 5. Non-objectifs explicites (v1)

1. Pas de CMS, pas de comptes utilisateurs, pas d'espace membre.
2. Pas de tracking, pas d'analytics comportementale, pas de cookies tiers — y compris « anonymisés ».
3. Pas de blog généraliste, de veille, de ressources pédagogiques (→ AI Practices), de wiki.
4. Pas de newsletter. [ASSUMPTION A3 : non demandée ; le RSS couvre la syndication.]
5. Pas de pages produits détaillées ni de catalogue produit (l'actuel catalogue v3 disparaît).
6. Pas d'anglais au lancement — la structure doit toutefois permettre l'ajout d'une langue sans refonte (NFR-13).
7. Pas de recherche interne. [ASSUMPTION A4 : ~10 pages au lancement ne justifient pas un moteur ; à revoir quand le corpus grandit.]
8. Pas de sous-domaines produits actifs (`<produit>.libre-ai.fr`) : hors périmètre v1.

## 6. Périmètre MVP

**Dans le MVP** : FR-1 à FR-22, les trois pièces de corpus, les NFR ci-dessous. C'est le lancement complet — il n'y a pas de « version allégée » du MVP : un vendeur silencieux sans corpus ou sans RDV ne fait pas son job.

**Priorisation interne** (ordre de construction, pas de découpe du lancement) :

- **P0 — sans quoi le site ne fait pas son job** : FR-1, FR-2, FR-6, FR-9, FR-10, FR-11, FR-12, FR-15, FR-16, FR-20, FR-21, FR-22 et toutes les NFR.
- **P1 — complète le lancement, construit après les P0** : FR-3, FR-4, FR-5, FR-7, FR-8, FR-13, FR-14, FR-17, FR-18, FR-19.
- Si un arbitrage de délai devient nécessaire, il se fait à l'intérieur des P1 et remonte au stakeholder — jamais silencieusement.

**Hors MVP** : tout le §5, la reprise d'historique des interventions, la bascule EN, le nommage de la référence bancaire (conditionné à autorisation), les offres du parking (masterclass, due diligence, advisory, conformité AI Act, impact algorithmique, produits-services).

## 7. Métriques de succès et contre-métriques

Zéro-tracking par principe : toutes les métriques sont des **événements réels**, à 6 mois du lancement.

| #   | Métrique                                       | Cible                                                 |
| --- | ---------------------------------------------- | ----------------------------------------------------- |
| M1  | RDV entrants qualifiés via le site             | ≥ 2/mois en régime établi                             |
| M2  | Premier contrat traçable au site               | 1                                                     |
| M3  | Citations externes notables du corpus          | ≥ 3                                                   |
| M4  | Interventions rattachées au site (attribution) | 100 % des nouvelles interventions                     |
| M5  | Collectif                                      | ~10 membres fin d'été ; ≥ 1 contact spontané crédible |
| M6  | Page « chaîne maîtrisée » publiée et à jour    | Binaire — tenue ou échec du pilier                    |

**Contre-métriques** (ce qu'on s'interdit d'optimiser) :

- **CM1 — Volume du corpus** : produire plus de pièces n'est pas un succès ; une pièce médiocre est une régression.
- **CM2 — Poids et dépendances des pages** : aucune amélioration ne justifie de casser le budget de sobriété (NFR-6) ni d'ajouter un service tiers non souverain.
- **CM3 — RDV non qualifiés** : si le volume de RDV monte mais que la qualification chute, la promesse attire les mauvaises cibles — réviser le message, pas amplifier.
- **Signal d'échec explicite** : à 6 mois, zéro RDV entrant OU zéro citation externe → le corpus ou le positionnement est à revoir. Les poteaux ne bougent pas.

## 8. Questions ouvertes

1. Cadre juridique de contractualisation — à trancher avant la première vente (hors site, bloquant pour M2).
2. Compatibilité de l'activité avec les obligations employeur en cours — à vérifier avant la première vente.
3. Choix de l'outil de prise de RDV conforme NFR — décision d'architecture (Gate 4).
4. Hébergeurs SMTP/IMAP — décision d'architecture.
5. Confirmation formelle du FR seul au lancement (reco appliquée).
6. Purge de l'incohérence de marque : assets/logo « libre-ia » → libre-ai.fr — à exécuter en implémentation.
7. Sort de TARGET.md et des ADR hérités — à acter à la gate finale du CDC.
8. Reprise (ou non) de l'historique des interventions — différée par décision stakeholder.
9. Nommage de la référence bancaire — conditionné à une autorisation écrite.

## 9. Index des assumptions

| Tag | Assumption                                                                                                  | Où                 |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| A1  | Bloc « citer cette page » retenu                                                                            | FR-4               |
| A2  | Home limitée à 5 blocs max                                                                                  | FR-20              |
| A3  | Pas de newsletter en v1, RSS suffit                                                                         | section 5, point 4 |
| A4  | Pas de recherche interne en v1                                                                              | section 5, point 7 |
| A5  | Budget de sobriété : ≤ 500 Ko transférés et zéro requête tierce sur chaque page hors médias lourds signalés | NFR-6              |
| A6  | Accessibilité visée : RGAA 4 / WCAG 2.2 AA                                                                  | NFR-9              |

## 10. Exigences non fonctionnelles

**Souveraineté et confidentialité**

- **NFR-1** : aucune dépendance de service à un hyperscaler américain ou à un fournisseur soumis à des lois extraterritoriales d'accès aux données — hébergement, RDV, mail, polices, médias inclus.
- **NFR-2** : zéro tracking, zéro cookie non essentiel, zéro requête vers un tiers non maîtrisé au chargement.
- **NFR-3** : données personnelles collectées limitées au strict nécessaire du contact (RGPD, minimisation) ; traitement documenté dans les mentions légales.
- **NFR-4** : protection anti-abus des formulaires sans CAPTCHA tiers ni fingerprinting (mécanismes passifs : honeypot, limitation de débit, validation serveur).
- **NFR-5** : aucun nom de client ou d'employeur publié sans autorisation écrite ; revue de confidentialité avant chaque publication de pièce.

**Sobriété et performance**

- **NFR-6** : budget par page : ≤ 500 Ko transférés hors médias lourds explicitement signalés, zéro requête tierce. [ASSUMPTION A5]
- **NFR-7** : site statique, utilisable sans JavaScript ; le JS est une amélioration progressive, jamais une condition d'accès au contenu ou au RDV.
- **NFR-8** : la consommation du site (poids, requêtes, estimation énergétique) est mesurée et publiée sur la page « chaîne maîtrisée » — la sobriété est une preuve, pas un slogan.

**Accessibilité et qualité**

- **NFR-9** : conformité RGAA 4 / WCAG 2.2 niveau AA — navigation clavier, contrastes, lecteurs d'écran, focus visibles. [ASSUMPTION A6]
- **NFR-10** : responsive en unités relatives ; lisible du mobile au grand écran sans perte de contenu.
- **NFR-11** : chaque page passe une validation de gabarit avant publication (FR-1) — une valeur manquante fait échouer la publication, jamais de valeur inventée par défaut.

**Citabilité et pérennité**

- **NFR-12** : les permaliens ne changent jamais ; toute réorganisation passe par des redirections permanentes. Les domaines défensifs (libre-ia.fr, libreia.fr, libreai.fr) redirigent en 301 vers libre-ai.fr.
- **NFR-13** : la structure de contenu sépare le texte de la mise en page de façon à permettre l'ajout d'une langue (EN) sans refonte structurelle.

**Identité et registre**

- **NFR-14** : cohérence de marque totale : « Libre IA » / libre-ai.fr partout — aucun résidu « libre-ia » visible. L'identité visuelle existante (design-system, client-kit) est un intrant **re-challengeable** par la spec UX : conservée seulement si elle sert le positionnement (respect, sobriété, autorité), démontré et non hérité.
- **NFR-15 — Registre de la voix** : maîtrise et respect — jamais la peur (souveraineté-panique), jamais la hype. L'humilité sur ce qui n'est pas prêt est obligatoire et assumée comme argument (« il ne survend pas ses outils, il ne survendra pas votre stratégie »). Toute formulation qui promet sans preuve est refusée en revue éditoriale. Le site ne s'excuse pas pour autant : l'honnêteté produit s'accompagne toujours d'une offre disponible aujourd'hui (le conseil).

## 11. Contraintes et dépendances

- **Invariants** (non négociables) : marque « Libre IA », domaine canonique libre-ai.fr, souveraineté (NFR-1), zéro-tracking (NFR-2), exigence de vérité éditoriale (FR-1/NFR-11).
- **Re-challengeable en aval** : l'identité visuelle (spec UX), le framework technique — Dioxus inclus (architecture, Gate 4).
- **Dépendances hors-site** : cadre juridique (Q1), obligations employeur (Q2), disponibilité du fondateur pour produire les trois pièces du corpus avant lancement.
- **Contenu au lancement** : les trois pièces de corpus sont sur le chemin critique — le site ne se lance pas sans elles (FR-2).
