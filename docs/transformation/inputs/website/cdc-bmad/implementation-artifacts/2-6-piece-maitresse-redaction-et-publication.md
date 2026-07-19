---
story_id: 2.6
story_key: 2-6-piece-maitresse-redaction-et-publication
epic: 2
title: "Pièce maîtresse — rédaction et publication"
status: done
created: 2026-07-15
updated: 2026-07-15
baseline_commit: ef2e43976b3bfd7d48b988372e86ad4de9853d31
references:
  epics: _bmad-output/planning-artifacts/epics.md#story-26--pièce-maîtresse--rédaction-et-publication
  prd: _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#41-corpus-de-référence
  architecture: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#ad-3--contenu-en-markdown-strict--front-matter-yaml-parsé-au-domaine-typé
  experience: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md#flux-2--conseiller-en-politique-karim-cabinet-souveraineté-ia
---

# Story 2.6 : Pièce maîtresse — rédaction et publication

Status: done

## Story

En tant que fondateur,
je veux publier « Sortir des hyperscalers sans perdre la capacité »,
afin de donner au site son document de référence citable.

## Acceptance Criteria

### AC1 — Le brouillon part de la thèse et de l’ouverture approuvées avec l’auteur

**Given** les arbitrages éditoriaux pris avec Constantin Jais le 2026-07-15

**When** le premier brouillon est préparé

**Then** il reste hors de `content/corpus/`, sous `target/story-2-6/` ou dans l’échange de revue, tant que ses affirmations et sources ne sont pas approuvées

**And** il porte le titre stable « Sortir des hyperscalers sans perdre la capacité : la résilience opérationnelle en pratique »

**And** sa thèse est : le verrou fournisseur commence quand une organisation ne sait plus mesurer ses coûts et ses usages, garder et exporter ses données, remplacer une dépendance critique ou restaurer son service ; reprendre cette maîtrise sur toute la chaîne permet de conserver les capacités utiles et de démontrer réversibilité, continuité et contrôle

**And** l’ouverture approuvée distingue explicitement sortir, tout réhéberger et renoncer aux services utiles

**And** la pièce est une `analyse`, pas une publicité fournisseur, un manifeste alarmiste, une consultation juridique ou une liste de technologies

**And** aucun agent ne transforme seul le brouillon privé en contenu public.

### AC2 — Le guide couvre toute la chaîne sans promettre l’absence d’arbitrage

**Given** le format « guide de décision » approuvé

**When** la pièce expose l’enfermement fournisseur et la résilience opérationnelle

**Then** elle traite au minimum les données, identités et accès, modèles/API, applications et orchestration, infrastructure, observabilité des coûts et usages, contrats, compétences et procédures de reprise

**And** elle donne au lecteur des questions ou tests concrets pour mesurer, exporter, restaurer, remplacer et continuer en mode dégradé

**And** elle définit à la première occurrence « hyperscaler », « enfermement fournisseur », « réversibilité » et « résilience opérationnelle », sans confondre fournisseur cloud, SaaS, modèle d’IA, droit applicable et architecture technique

**And** elle explique que le verrou est une perte de capacité de décision, pas seulement le choix d’un hébergeur

**And** elle réserve l’expression « sans compromis » : les arbitrages de capacité, coût, latence, sécurité, complexité et délai sont visibles

**And** elle préfère « sans renoncer aux capacités utiles » et précise les cas où conserver un service hyperscaler peut rester rationnel

**And** elle présente l’accès aux marchés européens comme une capacité à démontrer selon les exigences du marché concerné, jamais comme une garantie universelle d’éligibilité ou de succès commercial

**And** « les marchés européens » ne sont jamais traités comme un bloc homogène : chaque exigence de réversibilité, localisation, continuité, sécurité ou contrôle est rattachée à un contexte juridique, contractuel ou de commande publique précisément sourcé

**And** le cadre de questions est présenté comme adaptable aux PME, ETI, grands groupes, institutions publiques, finance/assurance, santé, industrie, énergie, transports, services publics et environnements à confidentialité renforcée, sans laisser entendre que l’auteur a livré une mission dans chacun de ces secteurs

**And** les contrôles et preuves sont explicitement adaptés au contexte : un dispositif unique n’est jamais prétendu suffisant partout.

### AC3 — Chaque affirmation importante reçoit une preuve approuvée ou disparaît

**Given** un brouillon de prose complet

**When** la matrice affirmation→source est constituée

**Then** chaque affirmation factuelle importante est isolée avec son périmètre, sa date de validité, son niveau de certitude et la source qui la soutient

**And** les sources primaires publiques, stables et accessibles sont privilégiées : textes officiels, référentiels d’autorité, spécifications, documentation technique du fournisseur concerné ou rapport d’incident primaire

**And** une source affiliée ou fournisseur n’est utilisée que pour établir son propre contrat ou comportement documenté, jamais comme preuve indépendante d’une supériorité générale

**And** les positions contradictoires ou limites substantielles sont représentées par `kind: contradictory` quand elles sont nécessaires à l’honnêteté de l’analyse

**And** la note `research-paysage-2026-07-14.md`, les exemples `example.*`, les maquettes UX, les anciens contenus et leurs chiffres ne sont jamais des sources publiables

**And** toute URL est ouverte et vérifiée pendant cette story ; son titre, son éditeur, sa portée et le passage probant sont contrôlés avant approbation

**And** tout chiffre quantitatif non indispensable est retiré ; tout chiffre conservé dispose d’une source primaire et d’une méthode explicite et reproductible dans `figures_method`

**And** la section européenne ne généralise jamais une obligation sectorielle ou un critère d’appel d’offres à toutes les organisations ; elle nomme le texte, le secteur, le type de marché et les limites réellement vérifiés

**And** une date, un numéro de règlement ou un identifiant de norme est sourcé mais n’est pas présenté comme une mesure calculée

**And** aucune balise de travail telle que `[À VÉRIFIER]`, `[SOURCE]`, `TODO`, URL candidate ou citation reconstituée n’entre dans le fichier public.

### AC4 — Le retour d’expérience est transparent sans devenir une fausse preuve

**Given** l’expérience publiable de Constantin Jais dans un environnement tiers de confiance et ses prises de parole ou retours d’expérience publics

**When** l’origine pratique de la méthode est présentée

**Then** « environnement tiers de confiance » peut être employé, sans nommer de client, employeur, mission, système, volume, résultat ou dispositif confidentiel

**And** les secteurs génériques décrivent les contextes auxquels le cadre de questions peut être adapté, pas un portefeuille de références

**And** un support, une intervention ou un retour d’expérience n’est cité comme preuve semi-publique que si une URL publique stable permet au lecteur de le consulter

**And** en l’absence d’artefact public, l’expérience reste identifiée comme retour de l’auteur non publiquement auditable et ne remplace aucune source factuelle

**And** les formulations « tous types d’entreprises », « tenu sans compromis », « prouvé à l’échelle » ou équivalentes sont refusées sans périmètre et preuve publiable

**And** une revue de confidentialité confirme qu’aucun recoupement raisonnable ne permet d’identifier une organisation ou une personne non autorisée

**And** le texte distingue explicitement expérience de l’auteur, faits sourcés, analyse et recommandation.

### AC5 — Le fichier public respecte exactement le contrat éditorial livré par 2.1 à 2.4

**Given** le texte et les sources approuvés

**When** `content/corpus/2026-sortir-des-hyperscalers-sans-perdre-la-capacite.md` est créé

**Then** `slug` vaut exactement `sortir-des-hyperscalers-sans-perdre-la-capacite`, `title` reprend le titre stable, `nature` vaut `analyse`, `author` vaut `Constantin Jais`, `author_member_key` vaut `null` et `series` vaut le scalaire exact `null`

**And** `assistance_ia` déclare honnêtement l’assistance complète de cette rédaction, notamment le modèle non exposé par le harnais pi, sa version non exposée et le rôle de proposition du brouillon, préparation de la matrice et revue contradictoire

**And** `sources` est non vide ; chaque source contient exactement `claim`, `title`, `url` HTTPS et `kind`, toutes les sources déclarées sont liées dans le Markdown et tout lien HTTPS externe est déclaré

**And** `figures_method` vaut `null` seulement si la version finale ne contient aucune mesure, comparaison, ratio, prix, volume, durée ou autre affirmation quantitative ; sinon il décrit la méthode exacte de chaque chiffre conservé

**And** `published_date` est la date réelle d’approbation/publication, son année reste cohérente avec le préfixe `2026`, et `last_review_date` lui est égale lors de la première publication

**And** `state` reste `draft` pendant la préparation et ne devient `published` qu’après l’approbation humaine d’AC7

**And** `corrections` est une liste vide lors de la première publication ; aucune correction fictive ou antérieure à la publication n’est créée

**And** le corps CommonMark est non vide, ne contient aucun HTML brut, aucune image distante et aucun h1 concurrent ; ses titres commencent à h2 et ne sautent aucun niveau

**And** le CTA, le bloc de citation, les métadonnées et les sources visibles restent générés par les renderers existants, jamais recopiés à la main dans le Markdown.

### AC6 — La pièce est réellement publiée sur toutes les projections existantes

**Given** la pièce passée à `published`

**When** le site est construit

**Then** son permalien est exactement `/corpus/sortir-des-hyperscalers-sans-perdre-la-capacite/` et la page affiche le titre, Constantin Jais, les deux dates, l’assistance, les sources, la méthode éventuelle et zéro correction sans inventer d’élément

**And** l’index `/corpus/` contient exactement une carte autonome pour cette pièce et n’affiche plus l’état vide

**And** le sitemap et le manifeste contiennent exactement une occurrence de son permalien canonique

**And** le feed `/corpus/feed.xml` contient exactement une entrée pour cette pièce, avec titre/auteur/dates/canonical exacts et la catégorie d’assistance déclarée, sans corps ni sources

**And** Open Graph, JSON-LD et « Citer cette page » dérivent du même domaine typé et nomment exactement Constantin Jais

**And** Pagefind indexe la page sans introduire de recherche dynamique ou de JavaScript dans la pièce

**And** aucun code de production, schéma, route concurrente, dépendance ou valeur par défaut n’est ajouté pour faire accepter le contenu.

### AC7 — Constantin Jais approuve explicitement la version exacte avant publication

**Given** la pièce candidate, la matrice de sources, le rendu construit et la revue de confidentialité

**When** la revue humaine finale a lieu

**Then** Constantin Jais examine le texte intégral, chaque affirmation importante et sa source, les limites/contradictions, le registre NFR-15, l’absence de survente, la déclaration d’assistance IA et les informations d’expérience

**And** le SHA-256 du fichier candidat est communiqué avant décision

**And** l’approbation est explicite sous une forme non ambiguë telle que « J’approuve la publication de `content/corpus/2026-sortir-des-hyperscalers-sans-perdre-la-capacite.md` au SHA-256 `<hash>` »

**And** l’approbation, sa date et le hash sont consignés dans le Dev Agent Record de cette story sans ajouter de donnée personnelle autre que l’identité publique d’auteur déjà approuvée

**And** toute modification du fichier après approbation change le hash et exige une nouvelle approbation

**And** aucun agent ne coche cette gate, ne simule une approbation ou ne passe la story à `done` à la place de Constantin Jais.

### AC8 — Les preuves empiriques et toutes les gates restent vertes

**Given** la baseline `ef2e439` avec corpus public vide

**When** la story est vérifiée

**Then** la preuve RED constate d’abord l’absence de la route, de la carte et de l’entrée Atom avant ajout de la pièce

**And** le parseur réel charge exactement une pièce typée publiée depuis `content/corpus/`, avec les valeurs approuvées et aucune diagnostic

**And** un parseur HTML indépendant vérifie h1 unique, hiérarchie, auteur, liens de sources, citation, canonical, absence de script/HTML brut et absence de marqueurs de travail

**And** un parseur XML indépendant vérifie une entrée Atom exacte et aucune fuite du corps ou des sources

**And** les tests qui supposaient le corpus réel vide sont resserrés sur le nouveau contrat d’une pièce réelle ; les fixtures restent uniquement en mémoire ou sous `target/`

**And** format, tests Rust debug/release, clippy, wasm, build/run, build npm, smoke statique, topologie, Playwright, deny, audit et `git diff --check` sont exécutés après approbation finale

**And** les 15 avertissements `cargo audit` transitifs préexistants sont consignés honnêtement s’ils restent inchangés

**And** les fichiers de dépendances restent inchangés, aucun chemin machine-local ni secret n’est versionné, et `content/corpus/` contient uniquement `.gitkeep` et la pièce approuvée.

## Tasks / Subtasks

- [x] **1. Préparer un brouillon privé prose-first** (AC1, AC2)
  - [x] Créer `target/story-2-6/draft.md` sans toucher `content/corpus/`.
  - [x] Reprendre la thèse, l’ouverture et le plan approuvés ; couvrir chaque couche de la chaîne.
  - [x] Rédiger pour dirigeants et décideurs publics, avec suffisamment de profondeur pour le DSI, sans jargon gratuit.
  - [x] Marquer les besoins de preuve uniquement dans le brouillon privé ; aucune balise de travail ne sera copiée dans le contenu public.
  - [x] Présenter les secteurs comme applicabilité du cadre, jamais comme références clients.
  - [x] Exposer arbitrages, limites et cas rationnels de recours à un hyperscaler.

- [x] **2. Construire et faire arbitrer la matrice affirmation→source** (AC3, AC4)
  - [x] Extraire chaque affirmation factuelle importante du brouillon.
  - [x] Pour chacune, consigner sous `target/story-2-6/claims.md` : formulation, portée, source candidate, passage probant, date de vérification, contradiction/limite et décision garder/nuancer/retirer.
  - [x] Vérifier directement les sources primaires et remplacer ou retirer toute piste non confirmée.
  - [x] Soumettre à Constantin Jais les choix réellement ambigus ; ne jamais résoudre une absence de preuve par une formulation plus vague mais toujours trompeuse.
  - [x] Déterminer si un chiffre subsiste et verrouiller `figures_method` en conséquence.

- [x] **3. Verrouiller expérience, confidentialité et assistance** (AC4, AC5, AC7)
  - [x] Présenter l’environnement tiers de confiance comme origine d’expérience, non comme preuve auditable.
  - [x] Demander les URL des prises de parole/retours publics ; les omettre comme sources si elles ne sont pas publiquement consultables.
  - [x] Effectuer une revue de recoupement : organisations, employeurs, clients, personnes, systèmes, volumes et résultats.
  - [x] Valider avec l’auteur la liste et le rôle exacts des assistances IA réellement utilisées.

- [x] **4. Créer la pièce candidate conforme au schéma actuel** (AC3, AC5)
  - [x] Ajouter uniquement `content/corpus/2026-sortir-des-hyperscalers-sans-perdre-la-capacite.md` à partir du texte approuvé, initialement en `draft`.
  - [x] Renseigner les treize clés exactes du front-matter sans champ supplémentaire ni défaut.
  - [x] Relier chaque source déclarée dans le corps et déclarer chaque lien HTTPS externe.
  - [x] Vérifier CommonMark strict, titres h2+, absence de HTML brut/image distante et CTA/citation non dupliqués.
  - [x] Prouver le chargement typé avant de demander la publication.

- [x] **5. Obtenir l’approbation humaine de la version exacte** (AC7)
  - [x] Construire la page candidate et présenter texte, rendu, matrice, confidentialité et assistance à Constantin Jais.
  - [x] Calculer et communiquer le SHA-256 du fichier.
  - [x] Attendre l’approbation explicite de Constantin Jais ; aucun agent ne la présume.
  - [x] Après approbation seulement, fixer les dates réelles, passer `state: published`, recalculer le hash et obtenir l’approbation du hash final publié.
  - [x] Consigner l’approbation finale exacte dans le Dev Agent Record.

- [x] **6. Adapter uniquement les preuves qui dépendaient du corpus vide** (AC6, AC8)
  - [x] Mettre à jour `tests/editorial_pipeline.rs` pour exiger `.gitkeep` + cette seule pièce réelle tout en interdisant les fixtures publiques.
  - [x] Mettre à jour `e2e/site.spec.ts` : une carte, une page, une entrée Atom, sitemap/manifeste et aucune fixture.
  - [x] Ne modifier aucun test unitaire d’état vide : le domaine doit continuer à supporter un corpus vide dans ses fixtures.
  - [x] Ne modifier aucun code de production sauf défaut réel démontré et arbitré séparément avec Constantin Jais.

- [x] **7. Produire les preuves empiriques puis exécuter toutes les gates** (AC6, AC8)
  - [x] Capturer RED avant ajout public : route absente, zéro carte, zéro entrée Atom.
  - [x] Parser la pièce avec le pipeline réel et auditer le rendu avec des parseurs HTML/XML indépendants.
  - [x] Vérifier index, canonical, OG, JSON-LD, citation, sitemap, manifeste, Atom et Pagefind.
  - [x] Exécuter `cargo fmt --check`.
  - [x] Exécuter `cargo test --no-default-features --features static` et la même suite en `--release`.
  - [x] Exécuter `cargo clippy --all-targets --no-default-features --features static -- -D warnings`.
  - [x] Exécuter `cargo check --target wasm32-unknown-unknown --bin libre-ai-website`.
  - [x] Exécuter `cargo build --release --no-default-features --features static` et `cargo run --release --no-default-features --features static --bin site-build`.
  - [x] Exécuter `npm run build`, `bash scripts/static-smoke.sh`, `python3 scripts/check-current-topology.py` et `npm run e2e`.
  - [x] Exécuter `cargo deny check licenses sources` et `cargo audit`.
  - [x] Vérifier dépendances inchangées, aucun secret/chemin local, corpus limité aux deux fichiers attendus et `git diff --check`.

## Dev Notes

### Contrat éditorial approuvé

Auteur responsable : **Constantin Jais**. La marque Libre IA est l’éditeur et le contexte de publication ; le champ `author` reste un nom humain proprement citable.

Thèse approuvée :

> Le verrou fournisseur commence quand une organisation ne sait plus mesurer ses coûts et ses usages, garder et exporter ses données, remplacer une dépendance critique ou restaurer son service. Reprendre cette maîtrise sur toute la chaîne permet de conserver les capacités utiles et de démontrer la réversibilité, la continuité et le contrôle attendus sur les marchés européens.

Ouverture approuvée :

> Le verrou fournisseur n’apparaît pas le jour où une organisation décide de partir. Il commence plus tôt : lorsqu’elle ne sait plus retrouver toutes ses données, expliquer ce qu’elle consomme, relier ses coûts à ses usages ou remplacer un composant sans interrompre son activité.
>
> Sortir des hyperscalers ne signifie donc ni se priver de leurs services, ni tout réhéberger. Cela signifie garder la décision : savoir ce qui dépend de qui, conserver ses données, mesurer ses usages, isoler les composants remplaçables et éprouver la reprise avant d’en avoir besoin.
>
> Cette maîtrise n’est pas seulement défensive. Sur les marchés européens où la réversibilité, la localisation, la continuité ou le contrôle de la chaîne doivent être démontrés, elle transforme une promesse de souveraineté en dossier de preuve.

Les mots peuvent évoluer pendant la revue, mais toute évolution de sens revient à Constantin Jais. La thèse « maîtrise de bout en bout pour conserver la capacité et accéder aux exigences européennes » ne peut être remplacée par une thèse générique sur le cloud.

### Plan de rédaction

1. Le lock-in est une perte de capacité de décision.
2. Cartographier toute la chaîne : données, identités, modèles, applications, infrastructure, contrats et compétences.
3. Comprendre les usages et leurs coûts réels.
4. Garder, exporter et restaurer les données.
5. Remplacer une dépendance sans reconstruire tout le système.
6. Préserver le service en mode dégradé.
7. Tester la sortie plutôt que déclarer la souveraineté.
8. Transformer cette maîtrise en preuve pour les marchés européens.
9. Arbitrages, limites et cas où un hyperscaler reste rationnel.

Le texte doit rester un guide de décision, pas devenir une taxonomie exhaustive ou un tutoriel d’exploitation fournisseur par fournisseur.

### Présenter les secteurs sans fabriquer des références

Formulation de travail sûre :

> Le même cadre de questions — où sont les données, que mesure-t-on, que peut-on remplacer, comment reprend-on — peut être posé dans une PME, une ETI, un grand groupe ou une institution publique. Il doit ensuite être adapté aux contraintes de la finance et de l’assurance, de la santé, de l’industrie, de l’énergie, des transports, des services publics ou d’un environnement à confidentialité renforcée. Les contrôles et les preuves attendus ne sont pas identiques d’un contexte à l’autre.

Cette liste décrit une capacité d’adaptation de la méthode. Elle ne dit pas que l’auteur ou Libre IA possède une référence dans chaque secteur.

### Présenter l’expérience sans la surqualifier

Formulation de travail :

> Ce cadre est nourri par l’expérience de l’auteur dans un environnement tiers de confiance, ainsi que par des prises de parole et retours d’expérience publics. Les détails des missions et des organisations concernées restent confidentiels. Cette expérience explique l’origine pratique de la méthode ; elle ne remplace pas les sources publiques mobilisées pour vérifier ses affirmations.

Si aucune URL publique stable ne documente les prises de parole, retirer « publics » ou reformuler en simple déclaration d’expérience. Ne jamais inventer un lien, un intitulé d’intervention, une date, une audience ou un résultat.

### Politique de chiffres

La version initiale devrait expliquer comment comprendre et mesurer coûts/usages sans publier de comparaison quantitative non indispensable. `figures_method: null` est acceptable uniquement après scan explicite de la version finale confirmant l’absence d’affirmation quantitative.

Si un chiffre améliore réellement la décision : unité, période, périmètre, source brute, transformation, hypothèses, limites et date de revue sont nécessaires. Une valeur reprise d’une note secondaire ou d’une maquette est refusée.

### Contrat front-matter courant

Valeurs déjà arbitrées :

```yaml
slug: "sortir-des-hyperscalers-sans-perdre-la-capacite"
title: "Sortir des hyperscalers sans perdre la capacité : la résilience opérationnelle en pratique"
nature: "analyse"
author: "Constantin Jais"
author_member_key: null
assistance_ia:
  - model: "Modèle non exposé par le harnais pi"
    version: "non exposée"
    role: "proposition du brouillon, préparation de la matrice affirmation-source et revue contradictoire"
series: null
corrections: []
```

Clés à compléter uniquement depuis la version approuvée : `sources`, `figures_method`, `published_date`, `last_review_date`, `state`. Le mapping complet doit contenir exactement les treize clés attendues par `CorpusFrontmatter`.

### Matrice affirmation→source

Format privé recommandé sous `target/story-2-6/claims.md` :

```text
ID | affirmation exacte | type (fait/analyse/recommandation/expérience)
portée et date | source primaire candidate | passage probant
source contradictoire/limite | décision (garder/nuancer/retirer) | approbation humaine
```

Une source du front-matter doit décrire une affirmation réellement présente et être liée par une destination Markdown exactement égale à son URL. Tous les liens HTTPS externes du corps doivent réciproquement être déclarés. Les liens internes `/...` n’entrent pas dans `sources`.

### Protocole prose-first sans fuite publique

```text
échange approuvé
  -> target/story-2-6/draft.md
  -> target/story-2-6/claims.md
  -> arbitrage humain des faits et formulations
  -> content/corpus/... en draft
  -> parse/build/rendu de revue
  -> hash + approbation humaine
  -> dates réelles + published
  -> nouveau hash + approbation finale
  -> gates + commit
```

`target/` est ignoré et sert à la matière de travail. Seuls la pièce finale et le journal BMAD approuvé sont versionnés.

### État actuel des fichiers à modifier

#### `content/corpus/2026-sortir-des-hyperscalers-sans-perdre-la-capacite.md` — NEW après validation des sources ; publication après approbation

Seul nouveau contenu public. `.gitkeep` peut rester ; aucune autre pièce, fixture, source copiée ou snapshot de brouillon n’est ajouté.

#### `tests/editorial_pipeline.rs` — UPDATE ciblé

Le test `test_fixtures_are_not_public_corpus_or_manifest_entries` suppose aujourd’hui que `.gitkeep` est seul. Le remplacer par un contrat exact `.gitkeep` + pièce maîtresse, tout en maintenant l’interdiction des fixtures et des contenus inattendus. Ne pas recopier la prose réelle dans les tests.

#### `e2e/site.spec.ts` — UPDATE ciblé

Trois tests supposent un corpus vide : index, feed et routes dynamiques. Les convertir en preuves de la pièce publiée : une carte, une page accessible, une entrée Atom et une occurrence sitemap/manifeste. Vérifier les métadonnées structurées sans dupliquer tout le texte éditorial dans le test.

#### Code de production — PRESERVE

`src/domain.rs`, `src/editorial.rs`, `src/lib.rs`, `src/bin/site-build.rs`, composants et CSS ont déjà livré le contrat complet. Cette story est éditoriale. Si le contenu conforme révèle un défaut réel, produire RED et demander un arbitrage avant tout changement ; ne jamais assouplir le schéma ou contourner la validation.

#### Dépendances — PRESERVE

Aucun ajout, aucune mise à jour, aucune recherche de bibliothèque. La story utilise le parser, les projections et les gates verrouillés.

### Previous Story Intelligence

- 2.1 impose treize clés explicites, URLs HTTPS, sources non vides, CommonMark strict, h1 optionnel exact, hiérarchie continue et réciprocité sources↔liens.
- 2.2 publie seulement `Published`, génère le permalien depuis le slug et rend auteur, assistance, méthode, sources, dates et corrections.
- 2.3 génère canonical, Open Graph, JSON-LD et citation depuis `CorpusCitability`; ne rien écrire à la main pour les simuler.
- 2.4 classe cette pièce avec `series: null` comme autonome et l’affiche dans l’index.
- 2.5 ajoute une entrée Atom et sa catégorie d’assistance depuis la même sélection publique.
- Les exemples d’architecture et maquettes sont antérieurs au schéma final : leurs noms, URLs, chiffres, « 40 sources », dates et méthodes sont illustratifs ou inventés, jamais copiés.
- Baseline : 75 tests Rust debug/release, 36 E2E, corpus réel vide et worktree propre au commit `ef2e439`.

### Git Intelligence

Les commits 2.1–2.5 sont atomiques, en anglais, sans `Co-Authored-By`. Cette story doit rester un commit éditorial atomique après approbation, sans mélanger refactor, dépendance ou autre pièce de corpus.

### Scope Guardrails

- Travail exclusivement dans `/.claude/worktrees/impl-bmad/`; arbre parent intouché.
- Aucune publication automatique d’un texte assisté par IA.
- Aucun nom de client, employeur, partenaire ou personne non autorisée.
- Aucun chiffre, cas, citation, intervention ou URL reconstitué.
- Aucun contenu des stories 2.7/2.8.
- Aucun élargissement vers un comparatif fournisseur exhaustif, conseil juridique, certification ou promesse commerciale.
- Sécurité > qualité > performance > complétude ; pour le contenu, vérité et confidentialité sont bloquantes.

### Project Structure Notes

```text
target/story-2-6/draft.md                                      PRIVATE / IGNORED
target/story-2-6/claims.md                                     PRIVATE / IGNORED
content/corpus/2026-sortir-des-hyperscalers-sans-perdre-la-capacite.md  NEW après validation des sources ; publication après approbation
tests/editorial_pipeline.rs                                    UPDATE ciblé
e2e/site.spec.ts                                               UPDATE ciblé
_bmad-output/implementation-artifacts/2-6-piece-maitresse-redaction-et-publication.md  UPDATE journal
_bmad-output/implementation-artifacts/sprint-status.yaml       UPDATE
src/**, assets/**, Cargo*, package*.json                       PRESERVE sauf défaut arbitré
```

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.6, FR-1/FR-2, NFR-15]
- [Source: `_bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md` — §2 UJ-2, §4.1 FR-1/FR-2/FR-4, §10 NFR-5/11/12/15]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md` — AD-2, AD-3, AD-8]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md` — Typography, Citation Block, pratiques éditoriales]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md` — voix et ton, pièce de corpus, Flux 2]
- [Source: `_bmad-output/planning-artifacts/briefs/brief-website-2026-07-14/addendum.md` — preuves mobilisables anonymisées et statut de la note de recherche]
- [Source: `_bmad-output/planning-artifacts/briefs/brief-website-2026-07-14/research-paysage-2026-07-14.md` — avertissement matière brute NON vérifiée]
- [Source: `TARGET.md` — ligne éditoriale, exigence de vérité et règle d’arrêt]
- [Source: `CONTRIBUTING.md` — aucun texte IA publié automatiquement, responsabilité humaine]
- [Source: `_bmad-output/implementation-artifacts/2-5-flux-atom.md` — pipeline public final, revue et baseline]
- [Source: `src/editorial.rs`, `src/domain.rs`, `src/lib.rs`, `src/bin/site-build.rs`, `tests/editorial_pipeline.rs`, `e2e/site.spec.ts` — état courant lu le 2026-07-15]

## Dev Agent Record

### Agent Model Used

Non exposé par le harnais de cette session.

### Debug Log References

#### Story Creation — décisions humaines

- 2026-07-15 — Constantin Jais choisit une approche prose-first puis arbitrage humain.
- 2026-07-15 — Auteur public confirmé : Constantin Jais ; assistance IA de proposition complète sous responsabilité humaine.
- 2026-07-15 — Thèse, ouverture et format guide de décision approuvés.
- 2026-07-15 — « environnement tiers de confiance » déclaré publiable ; secteurs à présenter comme applicabilité, pas références ; prises de parole semi-publiques non utilisables comme preuve tant qu’aucun artefact public stable n’est fourni.

#### Brouillon privé v1

```text
draft: words= 2296 h2= 11 source_markers= 4 other_markers= 1
draft-contract: PASS
```

Le brouillon couvre données, identités, modèles/API, applications, infrastructure, coûts/usages, contrats, compétences, mode dégradé, marchés européens, secteurs adaptables, expérience tiers de confiance, arbitrages et limites. Il reste exclusivement sous `target/`; aucune prose ni source candidate n’a été publiée.

#### Matrice et sources candidates privées

Cinq pages institutionnelles ont été ouvertes le 2026-07-15, archivées sous `target/` et contrôlées par SHA-256 : Commission européenne (Data Act, NIS2), EIOPA (DORA), ANSSI (FAQ SecNumCloud), NIST (AI RMF). La matrice distingue portée, passage probant, limites et décision proposée pour huit affirmations.

```text
S1: verified bytes=64577 sha256=86a6d6cd2a82…
S2: verified bytes=64330 sha256=767ea8836a8d…
S3: verified bytes=105481 sha256=abf70a65c3ea…
S4: verified bytes=59467 sha256=1adbd20697eb…
S5: verified bytes=91257 sha256=33df0ad9acf9…
source-candidates-integrity: PASS
```

Aucun texte EUR-Lex n’est prétendu vérifié par cette sonde : les URLs directes ont répondu par un challenge WAF vide au client CLI. Les pages institutionnelles accessibles sont les seules candidates soumises à l’auteur.

#### Arbitrage humain des sources et confidentialité

- 2026-07-15 — Constantin Jais valide la recommandation : S1 Data Act, S2 NIS2, S3 DORA et S4 FAQ SecNumCloud retenues ; S5 NIST écartée ; aucun chiffre ; expérience tiers de confiance conservée comme déclaration professionnelle non publiquement auditable.
- Les deux passages sourcés sont intégrés au brouillon ; quatre URLs institutionnelles exactes, zéro marqueur de travail et zéro résultat quantitatif.
- La revue de recoupement ne trouve aucun client, employeur, organisation privée, système, volume, résultat, contact, secret ou chemin machine-local ; seuls secteurs génériques et institutions sources sont nommés.

```text
draft-sourced: PASS words=2381 h2=11 urls=4 markers=0 quantitative_results=0
```

#### Pièce candidate en draft et prévisualisation privée

- 2026-07-15 — Constantin Jais répond « approuvé » à la demande de validation du brouillon privé `a30208fd…` comme base de la pièce candidate.
- Le fichier public candidat contient treize clés, quatre sources, une assistance, `series: null`, `figures_method: null`, zéro correction et `state: draft`.
- Le pipeline réel le charge mais la sélection publique reste vide ; route, carte, Atom, sitemap et manifeste restent absents tant que l’état est draft.

```text
story-2-6-red: PASS route_exists=false cards=0 atom_entries=0
story-2-6-candidate: PASS pieces=1 state=draft sources=4 assistance=1 series=null figures_method=null published=0 preview=rendered
story-2-6-draft-isolation: PASS route=false card=false atom_entries=0 manifest=false sitemap=false
story-2-6-preview-html: PASS h1=1 headings=[1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 3] sources=4 source_links=8 author=true assistance=true corrections=0 scripts=json-ld-only
candidate-sha256=400679c02df87a64c40851008276a55c43429b543c8b09527af3e24beb3faf7f
preview-sha256=63a817f999d9b88b753f44979d1d971d908fd7de482a9473feb8451bf9d7a6d0
```

#### Passage publié autorisé, hash final en attente d’approbation

- 2026-07-15 — Constantin Jais déclare : « J’approuve la pièce candidate au SHA-256 400679c02df87a64c40851008276a55c43429b543c8b09527af3e24beb3faf7f et son passage à published avec les dates du 2026-07-15. »
- Seul `state` passe de `draft` à `published` ; les dates restent `2026-07-15`. Le contenu final candidat reçoit le SHA-256 `f4e8ab7161c750ba3b2b3fabb9d50270bfdc66fe89738a79013c0273b3d830a5`.
- Les preuves dépendant du corpus réel sont adaptées sans toucher aux tests unitaires d’état vide ni au code de production. Vérifications préliminaires : 31 tests du pipeline, build npm/smoke et 40 tests Playwright verts.

```text
published-html: PASS h1=1 hierarchy=true author=true sources=4 canonical=1 og=1 citation=1 executable_scripts=0
published-index: PASS autonomous_cards=1 empty_state=false
published-atom: PASS entries=1 author=true dates=true assistance=1 body=false sources=false
published-discovery: PASS sitemap=1 manifest=1
published-pagefind: PASS results=2 exact_corpus=1
```

- 2026-07-15 — Constantin Jais déclare ensuite : « J’approuve la publication de content/corpus/2026-sortir-des-hyperscalers-sans-perdre-la-capacite.md au SHA-256 f4e8ab7161c750ba3b2b3fabb9d50270bfdc66fe89738a79013c0273b3d830a5 ».

La gate AC7 est satisfaite par cette décision humaine exacte. Le fichier éditorial est désormais figé à ce hash ; toute évolution imposerait une nouvelle approbation. Les gates complètes exigées par AC8 sont relancées après cette approbation.

#### Gates finales après approbation

```text
cargo fmt --all --check: PASS
cargo clippy --all-targets --no-default-features --features static -- -D warnings: PASS
cargo check --target wasm32-unknown-unknown --bin libre-ai-website: PASS
cargo build/run --release --no-default-features --features static: PASS — 9 pages
cargo test debug: PASS — 75 passed, 0 failed
cargo test release: PASS — 75 passed, 0 failed
npm run build: PASS — Pagefind 9 pages, 1000 mots
static-smoke: PASS — 15 artefacts, 7 redirections 301
check-current-topology: PASS
publication gates: PASS — refus sans approbation, succès avec approbation
python unit tests: PASS — 4 passed
npm run e2e: PASS — 40 passed
cargo deny check licenses sources: PASS
cargo audit: PASS — 15 avertissements transitifs autorisés, inchangés
published-html/index/atom/discovery/pagefind: PASS
sources live: PASS — 4 réponses HTTP 200
repository-safety: PASS — dépendances inchangées, corpus=2, chemins locaux=0, motifs de secrets=0, diff propre, hash approuvé stable
fresh review: PASS — 0 critique, 0 avertissement, 0 suggestion
```

Le hash éditorial reste `f4e8ab7161c750ba3b2b3fabb9d50270bfdc66fe89738a79013c0273b3d830a5` après toutes les gates.

#### Implementation Plan

1. Brouillon privé depuis le contrat approuvé — terminé ; angle européen renforcé approuvé.
2. Matrice affirmation→source et recherche primaire — terminée ; quatre sources retenues, une écartée, aucun chiffre.
3. Arbitrage éditorial/confidentialité avec Constantin Jais — sources, expérience, secteurs et assistance validés ; revue de recoupement verte.
4. Pièce candidate en draft, rendu et preuve — terminé ; hash candidat approuvé.
5. Hash + approbation, publication, nouvelle approbation du hash final — terminé ; hash final `f4e8ab71…` approuvé explicitement par Constantin Jais.
6. Adaptation des preuves corpus réel — terminée sans code de production.
7. Gates complètes et revue fraîche après approbation finale — terminées, toutes vertes.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Tâche 1 terminée : brouillon privé prose-first de 2 296 mots, onze sections, cinq marqueurs de preuve/méthode ; l’expérience reste professionnelle et non présentée comme preuve publique, le contrat de couverture est vérifié et le corpus public inchangé.
- Tâche 2 terminée : huit affirmations arbitrées ; Data Act, NIS2, DORA et FAQ SecNumCloud intégrés, NIST écarté, aucun chiffre et `figures_method: null` retenu.
- Tâche 3 terminée : expérience tiers de confiance bornée comme déclaration non auditable, aucune prise de parole revendiquée comme preuve, revue de recoupement verte et assistance IA complète validée.
- Tâche 4 terminée : pièce candidate conforme en `draft`, chargement typé réel et prévisualisation HTML privée vérifiés ; aucune projection publique avant approbation.
- Tâche 5 terminée : hash candidat approuvé, passage à `published` autorisé et hash final `f4e8ab71…` approuvé explicitement par Constantin Jais.
- Tâche 6 terminée : seules les deux preuves dépendant du corpus vide sont adaptées ; les fixtures d’état vide et le code de production restent inchangés.
- Tâche 7 terminée : preuves HTML/XML/Pagefind indépendantes et matrice complète vertes après approbation finale ; 75 tests Rust debug, 75 release et 40 Playwright passent ; audit inchangé à quinze avertissements transitifs autorisés ; revue fraîche sans finding.

### File List

- `_bmad-output/implementation-artifacts/2-6-piece-maitresse-redaction-et-publication.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `target/story-2-6/draft.md` (privé, ignoré par Git)
- `target/story-2-6/claims.md` (privé, ignoré par Git)
- `target/story-2-6/sources/` (copies de vérification privées, ignorées par Git)
- `target/story-2-6/candidate.html` (prévisualisation privée, ignorée par Git)
- `target/story-2-6-probe/` (sonde de validation privée, ignorée par Git)
- `content/corpus/2026-sortir-des-hyperscalers-sans-perdre-la-capacite.md`
- `tests/editorial_pipeline.rs`
- `e2e/site.spec.ts`

### Change Log

- 2026-07-15 — Story co-rédigée avec Constantin Jais depuis la baseline `ef2e439`; thèse, ouverture, auteur, format, traitement de l’expérience et gate d’approbation humaine verrouillés ; statut initial `ready-for-dev`.
- 2026-07-15 — Story passée à `in-progress`; brouillon privé prose-first v1 produit sous `target/`, sans modification du corpus public.
- 2026-07-15 — Angle européen renforcé retenu ; matrice de huit affirmations et cinq sources institutionnelles candidates préparée pour arbitrage, sans publication.
- 2026-07-15 — Quatre sources retenues et intégrées ; pièce candidate créée en `draft`, pipeline et prévisualisation vérifiés, projections publiques toujours vides ; approbation du hash candidat requise.
- 2026-07-15 — Hash candidat approuvé par Constantin Jais ; passage à `published` autorisé, preuves corpus réel adaptées et projections préliminaires vertes ; approbation explicite du hash final requise.
- 2026-07-15 — Hash final publié approuvé explicitement ; toutes les gates post-approbation et la revue fraîche sont vertes ; story passée à `done`.
