# PRD Quality Review — libre-ai.fr

## Overall verdict

Le PRD énonce une thèse claire (site vitrine = vendeur silencieux) et place chaque exigence au service d'une conversion unique : le rendez-vous. Les dimensions fondamentales (substance, scope, usabilité aval) sont solides ; trois dimensions sont adequates mais pas cassantes (décisions-readiness, coherence, clarté done-ness), avec des afffinements mineurs pour l'implémentation.

## Decision-readiness — adequate

Le PRD énonce ses grands choix explicitement (§5 Non-objectifs explicites) et nomme les blockers (§8 Questions ouvertes). Chaque assumption est taggée et indexée (§9). Les trade-offs sont visibles : « Pas d'anglais au lancement — la structure doit toutefois permettre l'ajout d'une langue » (NFR-13) dit ce qu'on perd et ce qu'on gagne.

Cependant, une tension critique est énoncée implicitement plutôt que marquée : FR-2 dit « Trois pièces de corpus au lancement, pas de lancement sans », et les dépendances (§11) notent « disponibilité du fondateur pour produire les trois pièces », mais il n'y a pas de `[NOTE FOR PM]` qui force le PM à arbitrer le risque (si les pièces ne sont pas prêtes avant dev, le lancement se casse). C'est une décision qui demande un appel explicite, pas cachée ici.

### Findings

- **high** Tension implicite sur le blocker des trois pièces de corpus (§6, Dépendances §11). FR-2 énonce l'exigence (« Pas de lancement sans ») mais n'est pas un `[NOTE FOR PM]` visible. Le PM doit trancher avant d'engager la dev : si la production des trois pièces ne peut être garantie, le lancement doit être repoussé. _Fix:_ Ajouter en FR-2 : `[NOTE FOR PM] Les trois pièces sont un blocker critique du lancement. Si ce délai de production n'est pas garanti avant le démarrage du développement, le lancement doit être pushé. À confirmer formellement en Gate 4.`

## Substance over theater — strong

Chaque section porte du poids. Les 4 UJs (§2.3) sont incarnés, nommés (Claire, Karim, DSI, paire), chacun avec un arc et une sortie claire. Les Jobs to be done (§2.1) ne sont pas des personas boîte-à-cocher ; ils traçent un chemin verso une conversion identifiée.

La Vision (§1) porte une promesse mesurable, pas du slogan : « vendeur silencieux », « corpus de référence », « démonstration de souveraineté ». Elle s'appuie sur les FRs qui suivent.

Les NFRs sont spécifiés, pas généralisés : « ≤ 500 Ko transférés hors médias lourds explicitement signalés, zéro requête tierce » (NFR-6), « RGAA 4 / WCAG 2.2 AA » (NFR-9). Les contre-métriques (§7, CM1–CM3) posent un garde-fou vrai : « une pièce médiocre est une régression » ; aucune pression à gonfler le volume.

Pas de section d'emplissage ; chaque choix est justifié.

### Findings

Aucun finding — dimension jugée suffisante.

## Strategic coherence — adequate

Le PRD a une thèse : site vitrine qui converge tout vers le RDV, en se fondant sur la preuve par l'exemple (corpus + chaîne maîtrisée). Les FRs la servent : Corpus (pièces de référence, citabilité), Offres (vente), Collectif (incarnation), Preuve (souveraineté démontrée).

Les Success Metrics valident la thèse (M1 RDV, M2 contrat tracé, M3 citations, M4 attribution) plutôt que de mesurer l'activité vanity.

Cependant, les 22 FRs ne sont pas priorisés. Le PRD dit (§6) « C'est le lancement complet — pas de version allégée », ce qui est un pari sur la faisabilité. Si la deadline comprime, quel minimal lanceable ? À titre d'exemple, Corpus et RDV sont critiques ; Page interventions (FR-18) ou Offres T2 annoncées (FR-7) seraient repoussables. Le PRD ne le dit pas — c'est un risque que l'architecture doit couvrir en Gate 4, mais un appel explicite ici aiderait.

### Findings

- **high** Pas de priorisation explicite entre FR-1–FR-22 bien que le lancement soit présumé « complet ». (§6, titre) Si le délai MVP se compresse, lesquels sont non-dépliable ? _Fix:_ Ajouter après §6 : « Priorisation MVP (à affiner en Gate 4 sur base de l'estimation archi) : Corpus (FR-1–5) et RDV (FR-10–11) sont critiques pour la promesse. Offres (FR-6–9), Collectif (FR-12–14), et Preuve (FR-15–17) sont priorisés en ordre décroissant. Interventions (FR-18) et utilitaires (FR-22) sont repoussables à +1 mois si délai. »

## Done-ness clarity — adequate

Plupart des FRs sont testables : FR-1 énonce un gabarit complet (nature déclarée, auteur, assistance IA, sources, méthode, date, corrections) ; FR-2 est binaire (les trois pièces ou rien) ; FR-4 spécifie des métadonnées nommées (permalien, titre, OG, schema.org, bloc citation) ; FR-6 nomme les sections attendues (problème, déroulé, outputs, pièce de corpus, CTA).

Quelques définitions manquent de précision :

1. FR-20 « Home à message unique » ne dit pas comment le tester. Est-ce une revue humaine (« quelqu'un peut-il nommer la promesse en une phrase ») ? Ou une spé structurelle (« max 5 blocs, un seul titre H1 ») ? La condition d'acceptabilité est floue.

2. FR-5 « Flux RSS du corpus (pièces + briefs) » omet le schéma (RSS 2.0, Atom, format des éléments, fréquence de refresh, découvrabilité via `<link rel="alternate">`). Le choix technique apartient à l'architecture, mais le contrat PRD doit fixer ce qu'un agrégateur doit pouvoir attendre.

3. FR-13 « L'ajout d'un membre est une opération de contenu simple, sans refonte » ne définit pas « simple ». Commit git + CI rebuild ? Un formulaire admin ? Un éditeur web WYSIWYG ? L'ambiguïté peut bloquer la spé UX/archi.

4. FR-1 « Une pièce qui ne satisfait pas le gabarit ne se publie pas. » L'invariant est clair, mais le processus de vérification ne l'est pas : linter CI + revue manuelle du fondateur ? CI seul ? Cette exigence de vérité éditoriale (pivot du positionnement) mérite un gate nommé.

Les NFRs compensent bien : NFR-6 (≤ 500 Ko, zéro requête tierce), NFR-9 (WCAG AA), NFR-10 (responsive en unités relatives), NFR-12 (permaliens permanents) — tout est mesurable.

### Findings

- **high** FR-20 « Home à message unique » — « message unique » n'est pas défini. (FR-20) Comment teste-t-on ? Revue humaine ou spec structurelle (max 5 blocs, un titre central) ? _Fix:_ Clarifier : « Message unique = une seule promesse visible en ligne de flottaison (« Libre IA, respect et souveraineté »), trois portes d'entrée (dirigeant / décideur public / technique) sans ambiguïté. Acceptabilité : une personne naïve teste la home ; peut-elle nommer la promesse en une phrase et trouver comment contacter ? »

- **medium** FR-5 « Flux RSS du corpus (pièces + briefs) » omet le schéma du flux. (FR-5) Quelle est la fréquence de refresh ? Quel format (RSS 2.0, Atom) ? Comment est-il découvert (via `<link rel="alternate">`) ? _Fix:_ Ajouter : « Flux RSS (Atom 1.0 ou RSS 2.0 équivalent), mis à jour dans l'heure d'une publication. Chaque entrée : titre, date, auteur, lien stable, premier 200 chars du résumé si présent. Découverte via `<link rel="alternate" type="application/atom+xml">` dans le head HTML. »

- **medium** FR-13 « L'ajout d'un membre est une opération simple, sans refonte. » « Simple » n'est pas défini. (FR-13) Workflow attendu : commit git + CI rebuild ? Formulaire admin ? _Fix:_ Clarifier : « Pas de déploiement serveur ni de formulaire admin web. Workflow : éditer la source membre (JSON ou YAML versionné dans le dépôt) → CI trigger une rebuild statique → déploiement automatique. »

- **medium** FR-1 décrit le gabarit de pièce mais n'énonce pas le processus de gate de vérification. (FR-1) La « discipline de preuve » est l'invariant du projet, mais comment la garantir ? _Fix:_ Ajouter en FR-1 : `[NOTE FOR PM] La vérification du gabarit doit être un gate critique. Proposer : CI lint (checklist de champs obligatoires, sources présentes, dates valides) + revue humaine du fondateur ou relecteur désigné avant publication (approbation explicite requise). Pas de publication sans approval.`

## Scope honesty — strong

§5 « Non-objectifs explicites » énumère 8 omissions claires et justifiées (pas de CMS, pas de tracking, pas de blog, pas de newsletter, pas de pages produits, pas d'EN, pas de recherche, pas de sous-domaines). §6 « Périmètre MVP » découpe net : FRs 1–22 + trois pièces + NFRs = GO ; tout le reste + historique interventions + EN + offres du parking = hors MVP.

§8 énumère 9 questions ouvertes dont plusieurs sont des blockers explicites (cadre juridique, obligations employeur, disponibilité fondateur, outil RDV).

§9 indexe 6 assumptions (bloc citation, 5 blocs max home, pas de newsletter, pas de search, budget sobriété 500 Ko, WCAG AA). Chaque assumption est taggée inline dans le PRD et entrée en index.

Open items density : 9 questions + 6 assumptions, pour une v1 à stakes de lancement — c'est proportionné.

Les omissions silencieuses sont rares. Une note : §8.6 dit « Purge de l'incohérence de marque : assets/logo « libre-ia » → libre-ai.fr — à exécuter en implémentation », ce qui est une tâche, pas une décision PRD. C'est fine.

### Findings

Aucun finding — dimension jugée suffisante.

## Downstream usability — strong

**Glossaire** (§3) : 4 termes clés (Corpus, pièce, chaîne maîtrisée, porte discrète, attribution). Utilisés avec cohérence.

**ID continuity** : FR-1 à FR-22 (22 items continus), UJ-1 à UJ-4 (4 items), M1–M6 (6 métriques), CM1–CM3 (3 contre-métriques), A1–A6 (6 assumptions). Pas de gap, pas de doublon. Index des assumptions (§9) en table, avec colonne « Où » qui renvoie à la section.

**Chaque section isolable** : FR-10 (« Prise de RDV ») peut être lu seul ; les dépendances (outil conforme NFR de souveraineté et non-tracking) sont nommées sans requérir de relecteur complet.

**UJs incarnés** : Tous les 4 UJs ont un nom, un contexte, un job clair, une sortie nommée. UJ-2 (Karim) est particulièrement complet : « directeur de cabinet prépare une audition », « cherche une source qui ne soit ni hébergeur ni cabinet anglo-saxon ».

Mineur : le gabarit de pièce (FR-1) est énoncé en prose ; une table extraction-friendly (champs obligatoires, ordre, exemples) serait plus usable pour l'UX. Ce n'est pas un blocage.

### Findings

Aucun finding — dimension jugée suffisante.

## Shape fit — strong

Le produit est un site vitrine B2B (collectif de conseil IA). La forme PRD attendue pour ce type est : UJs incarnés + FRs à haut niveau + NFRs avec bounds + Success Metrics et contre-métriques. Pas d'opérations 24/7, pas de SLOs d'uptime, pas de scalabilité massivo.

Le PRD la respecte : 4 UJs avec protagonistes nommés, 22 FRs, 14 NFRs (souveraineté, sobriété, accessibilité, citabilité — alignés au positionnement), 6 métriques basées sur des événements réels (RDV, contrats, citations), 3 contre-métriques anti-vanity (pas de volume du corpus, pas de poids page, pas d'RDV non qualifiés).

Le glossaire est léger mais suffisant pour ce type de produit.

### Findings

Aucun finding — dimension jugée suffisante.

## Mechanical notes

- **Glossaire** : 4 termes (Corpus, pièce, chaîne maîtrisée, porte discrète, attribution). Pas de dérive de casse, de pluriel ou de synonyme. ✓
- **ID continuity** : FR-1–FR-22 (continu), UJ-1–UJ-4, M1–M6, CM1–CM3, A1–A6. Pas de gap, pas de doublon. ✓
- **Assumptions Index** (§9) : Table avec Tag | Assumption | Où. Tous les A1–A6 taggés inline (FR-4 pour A1, FR-20 pour A2, etc.). Roundtrip OK. ✓
- **Cross-références** : FR-2 (trois pièces) ↔ M2 (premier contrat traçable) et Dépendances §11 (disponibilité fondateur). FR-1 ↔ NFR-11 (validation gabarit). FR-10 ↔ NFRs 1–2 (souveraineté). Toutes résolvent. ✓
- **Sections requises** (pour un PRD de site vitrine) : Vision ✓, Utilisateurs (Jobs + UJs + Non-utilisateurs) ✓, Glossaire ✓, FRs ✓, Non-goals ✓, MVP scope ✓, Métriques + contre-métriques ✓, Questions ouvertes ✓, Assumptions index ✓, NFRs ✓, Contraintes ✓. Tous présents. ✓
