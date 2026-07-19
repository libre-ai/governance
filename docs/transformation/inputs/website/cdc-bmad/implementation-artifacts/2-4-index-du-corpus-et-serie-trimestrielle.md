---
story_id: 2.4
story_key: 2-4-index-du-corpus-et-serie-trimestrielle
epic: 2
title: "Index du corpus et série trimestrielle"
status: done
created: 2026-07-14
updated: 2026-07-14
baseline_commit: 706b7d4
references:
  epics: _bmad-output/planning-artifacts/epics.md#story-24-index-du-corpus-et-série-trimestrielle
  prd: _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#41-corpus-de-référence
  architecture: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#ad-3--contenu-en-markdown-strict--front-matter-yaml-parsé-au-domaine-typé
  design: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md
  experience: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md
---

# Story 2.4 : Index du corpus et série trimestrielle

Status: done

## Story

En tant que lecteur,
je veux parcourir le corpus et suivre la série des briefs,
afin de trouver la pièce qui répond à ma question.

## Acceptance Criteria

### AC1 — L’appartenance à la série est explicite, typée et indépendante du renderer

**Given** une pièce Markdown chargée par le pipeline strict de la story 2.1

**When** son front-matter est désérialisé

**Then** une clé `series` est explicitement obligatoire pour toute pièce

**And** `series: null` désigne une pièce autonome

**And** un brief trimestriel utilise exactement le mapping fermé suivant, sans champ inconnu :

```yaml
series:
  kind: "brief_trimestriel"
  year: 2026
  quarter: 3
```

**And** `kind` n’accepte que `brief_trimestriel`, `year` est une année calendaire positive sur quatre chiffres et `quarter` un entier de 1 à 4

**And** une clé absente, une valeur d’un autre type, un champ inconnu, une valeur vide ou hors bornes fait échouer le pipeline avec un diagnostic relatif et actionnable

**And** le domaine renderer-independent porte cette information par des types fermés, par exemple `CorpusSeries::QuarterlyBrief(QuarterlyBriefIssue { year, quarter })`, jamais par un mapping libre ni des chaînes interprétées dans Dioxus

**And** le domaine fournit le libellé français exact `T{quarter} {year}` — par exemple `T3 2026` — sans le stocker dans le front-matter

**And** aucune appartenance, année ou trimestre n’est inféré depuis le slug, le nom de fichier, le titre ou le corps Markdown.

### AC2 — Chaque numéro est calendairement cohérent et unique parmi les publications

**Given** une pièce dont `series.kind == brief_trimestriel`

**When** sa validation métier est exécutée

**Then** `series.year` égale l’année de `published_date`

**And** `published_date` appartient au trimestre déclaré : T1 = janvier à mars, T2 = avril à juin, T3 = juillet à septembre, T4 = octobre à décembre

**And** les bornes utilisent la date calendaire typée `NaiveDate`, sans approximation par numéro de jour ni chaîne

**And** un écart d’année ou une date située hors du trimestre déclaré fait échouer la pièce en nommant `frontmatter.series.year` ou `frontmatter.series.quarter`

**And** avant toute suppression ou écriture dans `dist/`, deux pièces `Published` déclarant le même couple `(year, quarter)` font échouer la prévalidation avec les deux chemins relatifs triés

**And** l’unicité de numéro est vérifiée indépendamment de l’unicité des slugs et permaliens déjà assurée par `select_published_corpus`

**And** un brouillon ne devient jamais public et n’est pas compté comme un numéro publié ; il reste toutefois soumis au schéma et à la cohérence calendaire

**And** l’échec conserve intégralement l’ancien artefact `dist/`.

### AC3 — `/corpus` est généré depuis l’unique sélection publiée du domaine

**Given** le résultat validé de `load_corpus`, puis la sélection déterministe de `select_published_corpus`

**When** `site-build` pré-rend l’index `/corpus`

**Then** l’index reçoit cette même sélection `Published` déjà utilisée pour les pages, le sitemap et le manifeste ; il ne relit ni fichiers, ni YAML, ni Markdown

**And** aucune pièce `Draft` n’apparaît dans son HTML, ses cartes, ses groupes ou une donnée cachée

**And** chaque pièce publiée apparaît exactement une fois : soit dans le groupe « Pièces autonomes » lorsque `series == null`, soit dans le groupe « Briefs trimestriels » lorsque la série est déclarée

**And** aucune pièce ne peut appartenir aux deux groupes ni être omise

**And** les pièces autonomes sont triées de façon déterministe par `published_date` antéchronologique, puis par route stable pour départager une même date

**And** les briefs sont triés chronologiquement par `(year, quarter)`, puis la prévalidation d’unicité garantit un seul numéro publié par position

**And** chaque brief conserve son permalien individuel `/corpus/<slug>/`, son canonical, son bloc de citation et ses métadonnées déjà générés par les stories 2.2 et 2.3 ; l’index ne crée ni page d’archive concurrente ni URL de série inventée

**And** l’index `/corpus` remplace le rendu statique générique actuel de `SitePage::Corpus` sans ajouter les pièces dynamiques à `SitePage::PUBLISHED`.

### AC4 — Chaque carte expose exactement les données demandées, y compris zéro correction

**Given** une pièce publiée présente dans l’index

**When** sa `CardCorpus` est rendue

**Then** la carte est une projection du `CorpusPiece` typé, ou d’une projection fermée construite uniquement depuis lui ; elle n’accepte pas un second contrat de chaînes libres pour titre, auteur, date, état ou route

**And** elle affiche le titre exact, l’auteur humain exact et la date de publication dans `<time datetime="YYYY-MM-DD">YYYY-MM-DD</time>`

**And** elle affiche un état textuel français explicite `PUBLIÉE` via le composant `StateBadge` existant ; la couleur seule ne porte jamais l’information

**And** elle affiche toujours le nombre exact de corrections depuis `piece.corrections().len()` avec les libellés `0 correction`, `1 correction`, puis `{n} corrections`

**And** elle ne masque jamais le zéro, n’emploie jamais `correction(s)` et ne déduit pas l’état corrigé de la date de revue

**And** une carte de brief affiche en plus le libellé typé `T{quarter} {year}` sans remplacer l’état public

**And** le lien « Lire la pièce » pointe vers `corpus_route(piece)` ; aucun `href="#"`, canonical libre ou slug reparsé n’est admis dans l’index public

**And** le composant conserve HTML sémantique, lien descriptif souligné, focus visible, thèmes clair/sombre, responsive en unités relatives et cible tactile existante.

### AC5 — Un corpus vide reste honnête et ne fabrique rien

**Given** que `content/corpus/` contient uniquement `.gitkeep`

**When** le site est construit sur la baseline `706b7d4`

**Then** `/corpus` conserve un unique `h1` « Corpus » et affiche un `EmptyState` honnête indiquant qu’aucune pièce n’est publiée

**And** cet état vide ne prétend ni qu’une publication existe, ni qu’un numéro est prévu, ni qu’une date est connue

**And** il ne fabrique aucune carte, auteur, date, correction, brief, numéro, source ou permalien

**And** dès qu’au moins une pièce publiée existe, l’état vide disparaît ; un groupe sans entrée n’affiche ni carte factice ni second état vide

**And** le build réel sans corpus continue de produire les huit pages fixes et les utilitaires existants, sans route dynamique supplémentaire.

### AC6 — La génération reste atomique, statique, accessible et sans contenu de test public

**Given** un corpus valide contenant en mémoire des pièces autonomes, des briefs et des brouillons fictifs

**When** `site-build` prépare l’artefact

**Then** chargement, sélection `Published`, collisions de routes, validation des numéros trimestriels, tri, pré-rendu des pages, gate de citabilité et pré-rendu de l’index terminent en mémoire avant `remove_dir_all(dist)`

**And** le document `/corpus` complet est du HTML statique fonctionnel sans JavaScript, sans hydratation globale, tracking, cookie ou requête tierce

**And** sa structure comporte un seul `h1`, des titres de groupes continus, des listes ou grilles sémantiques de cartes et un ordre de lecture identique à l’ordre visuel

**And** les pages fixes, pages de pièce, 404, redirections, `robots.txt`, `sitemap.xml`, `content-manifest.json`, `llms.txt`, Pagefind et injection `.weights.json` conservent leur comportement

**And** tout compte de pages ou de cartes est calculé depuis les collections réelles, jamais saisi à la main

**And** toutes les fixtures sont explicitement fictives, créées en mémoire ou sous `target/`, et absentes de `content/corpus/`, `dist/`, sitemap et manifeste.

### AC7 — Les frontières des stories suivantes restent intactes

**Given** le périmètre de l’Epic 2

**When** la story 2.4 est terminée

**Then** aucun flux Atom, fichier de syndication, `<link rel="alternate">` ou projection Atom de `assistance_ia` n’est ajouté — story 2.5

**And** aucune pièce réelle, aucun brief réel, aucune affirmation éditoriale, aucun auteur réel et aucun chiffre de contenu n’est ajouté — stories 2.6 à 2.8

**And** `content/corpus/` contient toujours uniquement `.gitkeep`

**And** aucune dépendance n’est ajoutée ou mise à jour

**And** aucun format bibliographique, métadonnée de pièce ou route de permalien déjà livré par 2.3 n’est réimplémenté.

## Tasks / Subtasks

- [x] **1. Étendre le domaine avec une série trimestrielle fermée** (AC1, AC2)
  - [x] Ajouter dans `src/domain.rs` les types renderer-independent `CorpusSeries` et `QuarterlyBriefIssue` (ou noms équivalents sans ambiguïté), avec année et trimestre encapsulés.
  - [x] Exposer des accesseurs, un ordre total stable et le libellé français `T{quarter} {year}` depuis le domaine, sans dépendance Dioxus.
  - [x] Ajouter `series: Option<CorpusSeries>` à `CorpusPiece` et à son constructeur interne ; ne pas créer de second type de pièce concurrent.
  - [x] Ajouter une fonction pure de projection d’index qui partitionne chaque `Published` exactement une fois et applique les tris définis dans AC3.
  - [x] Ajouter une erreur structurée pour collisions de numéros publiés, avec chemins relatifs triés et règle identifiable.

- [x] **2. Ajouter la clé front-matter obligatoire et ses validations strictes** (AC1, AC2)
  - [x] Étendre `CorpusFrontmatter`, `FrontmatterField`, `FIELDS`, `ValidatedFrontmatter` et `expected_for` dans `src/editorial.rs` avec `series` explicitement présent.
  - [x] Réutiliser `ExplicitNullable<T>` : absence de clé = erreur ; `null` = pièce autonome ; mapping = série déclarée.
  - [x] Désérialiser le mapping avec `#[serde(deny_unknown_fields)]`; exiger exactement `kind`, `year`, `quarter` et refuser toute valeur implicite ou inconnue.
  - [x] Valider l’année sur quatre chiffres, `quarter` dans `1..=4`, l’égalité avec `published_date.year()` et l’appartenance du mois au trimestre.
  - [x] Ne jamais examiner slug, titre, chemin ou corps pour classifier une pièce.
  - [x] Adapter toutes les fixtures existantes en ajoutant explicitement `series: null`, sans fallback de compatibilité silencieux.

- [x] **3. Prévalider l’unicité des briefs publiés avant tout effet de bord** (AC2, AC6)
  - [x] Appliquer la collision `(year, quarter)` uniquement à la sélection `Published`, après les collisions de routes et avant tout rendu/écriture.
  - [x] Agréger ou ordonner les diagnostics de façon déterministe ; afficher chaque chemin relatif concerné sans chemin machine-local.
  - [x] Conserver l’ordre atomique actuel : `load_corpus` → `select_published_corpus` → validation série → pré-rendu pièces/citabilité → pré-rendu index → effets de bord.
  - [x] Tester avec un `dist/index.html` sentinelle sous `target/` qu’une collision de numéro conserve l’artefact précédent.

- [x] **4. Refactorer `CardCorpus` autour du domaine typé et réutiliser `StateBadge`** (AC4)
  - [x] Remplacer les props libres actuelles par `CorpusPiece` ou une projection fermée construite dans le domaine ; interdire `href` optionnel et le fallback `#` pour l’usage public.
  - [x] Rendre la date avec `<time datetime>`, l’état `PUBLIÉE`, le nombre exact de corrections avec accord français et le libellé de série éventuel.
  - [x] Réutiliser `StateBadge`; ne pas créer un badge corpus concurrent ni transmettre un état libre issu du front-matter.
  - [x] Conserver un titre sémantique, un lien descriptif vers `corpus_route(piece)` et les comportements clavier/tactile.
  - [x] Retirer ou omettre la démonstration publique de `CardCorpus` dans `/_composants` si elle nécessiterait de construire une pièce fictive publiée ; ne pas parser une fixture dans cette page.

- [x] **5. Générer l’index `/corpus` depuis la sélection publiée** (AC3, AC5, AC6)
  - [x] Ajouter dans `src/lib.rs` un renderer d’index recevant la projection typée de la sélection publiée ; ne pas relire le corpus depuis le composant.
  - [x] Composer `h1`, groupes « Pièces autonomes » et « Briefs trimestriels », puis les cartes dans l’ordre déterministe.
  - [x] N’afficher que les groupes non vides ; si toute la sélection est vide, rendre un seul `EmptyState` factuel, sans contenu prévu inventé.
  - [x] Dans `site-build`, pré-rendre cet index en mémoire et l’écrire à la route fixe `/corpus` à la place du document générique rendu dans la boucle des pages fixes.
  - [x] Continuer d’utiliser la même sélection pour pages individuelles, sitemap et manifeste ; vérifier qu’aucune pièce n’est comptée ou publiée deux fois.
  - [x] Préserver canonical et Open Graph génériques de l’index ; ne pas ajouter de description, date ou métadonnée non déjà présente dans `SitePage::Corpus`.

- [x] **6. Adapter les styles existants sans système parallèle** (AC4, AC5, AC6)
  - [x] Étendre la section `CARD CORPUS` de `assets/components.css` et les styles de page existants ; ne pas créer une nouvelle feuille.
  - [x] Utiliser uniquement les tokens de couleur, typographie, espacement, rayon, focus et mouvement existants.
  - [x] Ajouter une grille responsive pour l’index, des métadonnées lisibles, l’accord des corrections et un traitement visible du label de série.
  - [x] Préserver l’information au repos, le soulignement des liens, le focus visible, les thèmes et `prefers-reduced-motion`.

- [x] **7. Ajouter une matrice de tests entièrement fictive et non publiée** (AC1 à AC7)
  - [x] Étendre `tests/editorial_pipeline.rs` : clé `series` absente, `null` valide, mapping valide, type invalide, champ inconnu, `kind` inconnu, année/trimestre hors bornes, année incohérente et date hors trimestre.
  - [x] Prouver qu’un slug ou titre contenant « brief », `t3` ou une année reste autonome avec `series: null`.
  - [x] Tester le domaine : labels `T1` à `T4`, ordre multi-années et partition exhaustive sans doublon.
  - [x] Étendre `tests/corpus_page.rs` ou créer `tests/corpus_index.rs` : uniquement `Published`, deux groupes, chaque pièce exactement une fois, ordre exact et routes individuelles conservées.
  - [x] Tester chaque carte : titre/auteur/date typés, état textuel, `0 correction`, `1 correction`, pluriel, label de brief et absence de `href="#"`.
  - [x] Tester deux briefs publiés au même numéro avec slugs distincts : échec pré-effets de bord et diagnostics relatifs triés ; vérifier qu’un brouillon n’est pas publié.
  - [x] Tester corpus vide sur le renderer et le build réel : `EmptyState` honnête, aucune carte/fixture/route dynamique.
  - [x] Ajouter une assertion de non-préemption : aucun Atom, aucun `rel="alternate"`, aucune fixture dans `content/corpus/`, `dist/`, sitemap ou manifeste.
  - [x] Conserver sans affaiblissement les tests des stories 2.1 à 2.3, notamment sécurité Markdown, `Published`-only, collisions de routes, unique `dangerous_inner_html` et gate de citabilité.

- [x] **8. Exécuter les gates disponibles et consigner leurs sorties brutes** (AC1 à AC7)
  - [x] `cargo fmt --check`
  - [x] `cargo test --no-default-features --features static`
  - [x] `cargo test --release --no-default-features --features static`
  - [x] `cargo clippy --all-targets --no-default-features --features static -- -D warnings`
  - [x] `cargo check --target wasm32-unknown-unknown --bin libre-ai-website`
  - [x] `cargo build --release --no-default-features --features static`
  - [x] `cargo run --release --no-default-features --features static --bin site-build`
  - [x] `npm run build`
  - [x] `bash scripts/static-smoke.sh`
  - [x] `python3 scripts/check-current-topology.py`
  - [x] `npm run e2e`
  - [x] `cargo deny check licenses sources`
  - [x] `cargo audit`; consigner honnêtement les avertissements transitifs autorisés déjà connus, sans les présenter comme corrigés.
  - [x] Vérifier explicitement après build : `content/corpus/` contient seulement `.gitkeep`, aucune fixture n’est publique, aucun Atom/alternate n’existe et le corpus vide affiche son état honnête.
  - [x] Copier uniquement les sorties brutes réellement obtenues dans le Dev Agent Record ; marquer toute commande non exécutée, ne jamais la reconstituer.

## Dev Notes

### Contrat de schéma verrouillé

La nouvelle clé ne sert pas de raccourci éditorial libre. Sa forme unique est :

```yaml
# Pièce autonome
series: null
```

ou :

```yaml
# Brief trimestriel — forme de fixture uniquement, pas un contenu à publier
series:
  kind: "brief_trimestriel"
  year: 2026
  quarter: 3
```

Le label `T3 2026` est dérivé du domaine. Il n’existe aucun champ `label`, `issue`, `name`, `archive_url` ou `series_url`. Toute clé supplémentaire est refusée. Les pages individuelles et leur citabilité existent déjà ; cette story ajoute la classification et l’index, pas une nouvelle famille de permaliens.

### Chaîne de confiance à préserver

```text
Markdown non fiable
  -> parse_piece/load_corpus
  -> CorpusPiece typé avec series explicite
  -> select_published_corpus
  -> validation unicité des numéros publiés
  -> projection d’index exhaustive et triée
  -> pré-rendu pages + citabilité + index en mémoire
  -> écriture atomique de dist/
```

Le filtre `Published` doit rester unique. Ne pas filtrer séparément dans `CardCorpus`, dans Dioxus et dans `site-build` avec trois règles susceptibles de diverger.

### État actuel des fichiers à modifier

#### `src/domain.rs` — UPDATE

- **État actuel :** contient `CorpusPiece`, `Nature`, `PublishState`, corrections, sources, `CorpusCitability`, `corpus_route` et `select_published_corpus`; aucune notion de série.
- **Changement attendu :** ajouter la série trimestrielle typée, son label/ordre, son accès depuis `CorpusPiece`, la partition d’index et l’unicité des numéros publiés.
- **À préserver :** domaine sans Dioxus, encapsulation, types `NaiveDate`/`Url`, sélection `Published`, collisions de routes, canonical et huit `SitePage::PUBLISHED`.

#### `src/editorial.rs` — UPDATE

- **État actuel :** front-matter manuel strict de douze clés, `ExplicitNullable` déjà utilisé, `DuplicateKeyPolicy::Error`, merge keys refusées et validations métier agrégées.
- **Changement attendu :** treizième clé obligatoire `series`, mapping fermé, conversion vers le domaine et validations calendrier/trimestre.
- **À préserver :** diagnostics relatifs, ordre déterministe, absence de fallback, sécurité CommonMark, validation sources/liens et cohérence année du nom de fichier.

#### `src/components/card_corpus.rs` — UPDATE

- **État actuel :** accepte titre/auteur/date/href en `String`, utilise `#` par défaut, masque zéro correction, affiche `correction(s)` et n’affiche aucun état.
- **Changement attendu :** projection typée, date sémantique, `StateBadge` publié, compte exact toujours visible, label trimestriel et route canonique de domaine.
- **À préserver :** `<article>`, titre, lien de lecture et classes de base réutilisables.

#### `src/components/state_badge.rs` — REVIEW / UPDATE ciblé seulement si nécessaire

- **État actuel :** composant générique avec libellé texte obligatoire et date optionnelle.
- **Changement attendu :** aucun second badge ; au plus renforcer l’API pour recevoir un libellé fermé si cela n’altère pas les usages offre.
- **À préserver :** texte perceptible sans couleur et compatibilité des autres composants.

#### `src/lib.rs` — UPDATE

- **État actuel :** `PageContent::Corpus` rend un `EmptyState` générique ; `CardCorpus` n’est utilisé que par la démonstration avec des chaînes neutres ; les pages corpus individuelles et la citabilité sont typées.
- **Changement attendu :** renderer statique d’index recevant la projection publiée ; état vide factuel ; groupes/cartes ; ne plus utiliser le document générique pour `/corpus` dans le publisher.
- **À préserver :** shell, navigation, métadonnées génériques de l’index, pages fixes, page pièce, JSON-LD/OG, unique frontière `RenderedMarkdown` et absence d’Atom.

#### `src/bin/site-build.rs` — UPDATE

- **État actuel :** valide et sélectionne le corpus, pré-rend les pages/citabilité avant `dist/`, puis rend les huit pages fixes et les pièces ; sitemap/manifeste partagent la sélection.
- **Changement attendu :** valider l’unicité des issues, préparer l’index avant effets de bord, puis écrire `/corpus` depuis ce document au lieu du rendu fixe générique.
- **À préserver :** atomicité, routes, compte calculé, assets, utilitaires, Pagefind indirect, mesure et injection des poids.

#### `assets/components.css` — UPDATE ciblé

- **État actuel :** styles `CardCorpus` existants, mais aucune grille d’index, aucun état ni label de série ; hover sans affordance exclusive.
- **Changement attendu :** compléter les styles depuis les tokens existants.
- **À préserver :** thèmes, focus, responsive, réduction de mouvement et styles de pièce/citation.

#### `tests/editorial_pipeline.rs` — UPDATE

- **État actuel :** 27 tests fictifs couvrent le schéma actuel ; toutes les fixtures devront déclarer `series: null`.
- **Changement attendu :** couverture du nouveau schéma et de ses refus sans affaiblir les tests existants.

#### `tests/corpus_page.rs` — UPDATE / `tests/corpus_index.rs` NEW optionnel

- **État actuel :** 20 tests couvrent page, publication, citations, OG/JSON-LD, collisions et absence de contenu public.
- **Changement attendu :** ajouter la projection/index/cartes ou isoler ces tests dans un fichier dédié.
- **À préserver :** toutes les preuves 2.2/2.3 et fixtures en mémoire.

#### `content/corpus/.gitkeep` — UNTOUCHED

Aucun Markdown réel, exemple de brief, snapshot, fixture ou contenu de démonstration ne doit être ajouté.

### Ordres déterministes

- **Pièces autonomes :** `published_date` décroissante, puis `corpus_route` croissante.
- **Briefs :** `(year, quarter)` croissant.
- **Diagnostics de collision :** numéro croissant, puis chemins relatifs croissants.

Ces ordres doivent être définis et testés dans le domaine, puis consommés tels quels par Dioxus. Le renderer ne trie pas de nouveau.

### Sémantique et accessibilité de l’index

Structure cible :

```text
h1 Corpus
si vide :
  EmptyState factuel unique
sinon :
  section Pièces autonomes [si non vide]
    liste/grille de CardCorpus
  section Briefs trimestriels [si non vide]
    liste/grille de CardCorpus
```

Chaque carte contient un seul état public textuel et un compte exact de corrections. Le label de numéro n’est pas un substitut à l’état. Aucun brouillon n’est montré avec un badge : il est absent de l’index public.

### Frontières strictes

- **2.5 :** Atom et `<link rel="alternate">`; ne rien préparer dans le HTML sous forme de lien caché.
- **2.6–2.8 :** contenu humain approuvé ; aucune fixture ne doit être publiée pour démontrer l’index.
- **4.2 :** résolution de `author_member_key`; la carte affiche seulement `author()`.
- **5.1 :** gate éditorial CI globale ; cette story fournit néanmoins les validations build locales nécessaires à sa propre sécurité.

### Bibliothèques et versions

Aucune dépendance ni mise à jour. Réutiliser exclusivement la baseline et le verrou existants :

| Bibliothèque | Version/configuration | Usage dans cette story |
|---|---|---|
| Dioxus / dioxus-ssr | 0.7.9 | index et cartes statiques |
| chrono | 0.4.45 | année, mois et validation calendaire |
| serde / serde-saphyr | versions verrouillées | mapping YAML strict et champs inconnus refusés |

Aucune recherche technique externe n’est requise : la story n’introduit ni API, ni bibliothèque, ni migration de version.

### Previous Story Intelligence

- **2.1 :** `CorpusPiece` est le contrat unique ; le front-matter manuel permet de distinguer clé absente et `null`; toutes les validations finissent avant effets de bord ; fixtures uniquement en mémoire ou sous `target/`.
- **2.2 :** seules les pièces `Published` reçoivent route, sitemap et manifeste ; `select_published_corpus` trie aujourd’hui par slug et refuse les collisions de permaliens ; l’index est resté volontairement vide.
- **2.3 :** les pages publiées sont pré-rendues et leur citabilité validée en mémoire avant `dist/`; le nouvel index doit rejoindre ce préflight, pas le contourner. Canonical, citation, OG et JSON-LD sont déjà dérivés du domaine.
- `CardCorpus` est encore un composant de démonstration non typé : l’étendre, ne pas créer `CorpusIndexCard` en doublon.
- `StateBadge` existe déjà et porte un libellé texte : le réutiliser pour `PUBLIÉE`.
- Les tests actuels vérifient que `content/corpus/` ne contient que `.gitkeep`, qu’aucune fixture ne fuit et que les brouillons ne sont jamais publics.

### Git Intelligence

La baseline fournie pour cette story est `706b7d4`. Aucune commande Git de mutation n’est autorisée. Les patterns et états décrits ici proviennent de la lecture des stories 2.1 à 2.3 et des fichiers courants, pas d’une supposition tirée d’un historique non vérifié.

### Scope Guardrails

- Chemins contenant `/.claude/worktrees/impl-bmad/` uniquement — tout autre arbre est interdit.
- Aucune commande Git de mutation : jamais `checkout`, `restore`, `reset`, `clean`, `stash`; pas de commit.
- Les suppressions de fichiers sont listées avant décision ; aucune suppression n’est requise par cette story.
- Zéro contenu inventé : aucune affirmation invérifiable, aucun chiffre éditorial à la main, aucun nom client, adresse, SIRET ou statut juridique.
- Aucune pièce réelle : fixtures en mémoire ou sous `target/`; `content/corpus/.gitkeep` reste seul.
- Sécurité > qualité > performance > complétude.

### Project Structure Notes

Fichiers attendus pour l’implémentation :

```text
src/domain.rs                                  UPDATE
src/editorial.rs                               UPDATE
src/components/card_corpus.rs                  UPDATE
src/components/state_badge.rs                  REVIEW / UPDATE ciblé optionnel
src/lib.rs                                     UPDATE
src/bin/site-build.rs                          UPDATE
assets/components.css                          UPDATE ciblé
tests/editorial_pipeline.rs                    UPDATE
tests/corpus_page.rs                           UPDATE
tests/corpus_index.rs                          NEW optionnel
e2e/site.spec.ts                               UPDATE ciblé optionnel
content/corpus/.gitkeep                        UNTOUCHED
Cargo.toml / Cargo.lock                        PRESERVE
```

Aucun fichier n’est à supprimer. Ne pas créer de crate, workspace, script de migration, parser HTML, flux de syndication ou dépendance supplémentaire.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.4, FR-3]
- [Source: `_bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md` — §4.1 FR-1 à FR-5, §10 NFR-7/9/11/12/13]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md` — AD-1, AD-2, AD-3, AD-8, Consistency Conventions, Capability Map]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md` — Card Corpus, State Badge, Empty State, accessibilité]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md` — index Corpus, card-corpus, états honnêtes, clavier et responsive]
- [Source: `TARGET.md` — responsabilité éditoriale, exigence de vérité, domaine renderer-independent]
- [Source: `docs/adr/0007-dioxus-clean-rebuild.md` — domaine indépendant, publication statique, Markdown strict]
- [Source: `docs/adr/0008-domaines-publics-et-gates-par-produit.md` — origine canonique `https://libre-ai.fr`]
- [Source: `_bmad-output/implementation-artifacts/2-1-gabarit-type-et-pipeline-markdown.md` — schéma strict, pipeline et atomicité]
- [Source: `_bmad-output/implementation-artifacts/2-2-page-piece-de-corpus.md` — sélection Published, routes, sitemap/manifeste]
- [Source: `_bmad-output/implementation-artifacts/2-3-citabilite-bloc-citation-et-metadonnees.md` — pré-rendu, citabilité et frontières 2.4/2.5]
- [Source: `src/domain.rs`, `src/editorial.rs`, `src/components/card_corpus.rs`, `src/components/state_badge.rs`, `src/components/empty_state.rs`, `src/lib.rs`, `src/bin/site-build.rs`, `assets/components.css`, `tests/editorial_pipeline.rs`, `tests/corpus_page.rs`, `e2e/site.spec.ts`, `Cargo.toml`, `package.json` — état courant lu le 2026-07-14]

## Dev Agent Record

### Agent Model Used

Non exposé par le harnais de cette session.

### Debug Log References

#### TDD RED

Commande : `cargo test --no-default-features --features static --test corpus_index --test editorial_pipeline`

```text
error[E0432]: unresolved imports `libre_ai_website::domain::project_corpus_index`, `libre_ai_website::domain::validate_published_quarterly_briefs`
error[E0432]: unresolved import `libre_ai_website::render_corpus_index_document`
error[E0599]: no method named `series` found for struct `CorpusPiece` in the current scope
error: could not compile `libre-ai-website` (test "editorial_pipeline") due to 3 previous errors
```

#### Revue indépendante — finding corrigé

La sonde empirique initiale a révélé une coercition contraire à AC1 :

```text
blank_series_accepted=true
series_year_+2026_accepted=true
series_year_2_026_accepted=true
series_year_0x7EA_accepted=true
series_year_"2026"_accepted=true
quoted_quarter=accepted
```

Après validation de la forme lexicale par les événements du même parseur YAML et ajout de dix cas de régression :

```text
blank_series_accepted=false
series_year_+2026_accepted=false
series_year_2_026_accepted=false
series_year_0x7EA_accepted=false
series_year_"2026"_accepted=false
quoted_quarter=frontmatter.series.quarter: trimestre qui n’est pas un entier décimal de 1 à 4
published=4 autonomous=2 quarterly=2 cards=4 draft_visible=false
html_audit h1=1 cards=4 scripts=0 ordered_dates=['2026-03-01', '2026-02-01', '2026-01-15', '2026-04-15']
```

Revue finale structurée : 13 fichiers, 0 finding critique, 0 avertissement, 0 suggestion ; dépendances, PII et souveraineté inchangées.

#### Gates finales — sorties brutes obtenues

`cargo fmt --check`

```text
```

`cargo test --no-default-features --features static`

```text
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 20 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 31 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo test --release --no-default-features --features static`

```text
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 20 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 31 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo clippy --all-targets --no-default-features --features static -- -D warnings`

```text
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.92s
```

`cargo check --target wasm32-unknown-unknown --bin libre-ai-website`

```text
Finished `dev` profile [unoptimized + debuginfo] target(s) in 2.43s
```

`cargo build --release --no-default-features --features static`

```text
Finished `release` profile [optimized] target(s) in 0.11s
```

`cargo run --release --no-default-features --features static --bin site-build`

```text
Finished `release` profile [optimized] target(s) in 0.10s
Running `target/release/site-build`
✓ Measurement complete
  Page size: 59 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T18:50:24Z
  Output: dist/.weights.json
site-build: 8 pages publiées dans dist/
```

`npm run build` — la ligne Pagefind contenant le chemin machine-local n’est volontairement pas versionnée ; les autres lignes ci-dessous sont les sorties obtenues.

```text
> build
> bash scripts/build-static.sh

✓ Measurement complete
  Page size: 59 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T18:50:25Z
  Output: dist/.weights.json
site-build: 8 pages publiées dans dist/

Running Pagefind v1.4.0 (Extended)
Source:       "dist"
Output:       "dist/pagefind"

[Walking source directory]
Found 10 files matching **/*.{html}

[Parsing files]
Found a data-pagefind-body element on the site.
↳ Ignoring pages without this tag.

[Reading languages]
Discovered 1 language: fr

[Building search indexes]
Total:
  Indexed 1 language
  Indexed 8 pages
  Indexed 328 words
  Indexed 0 filters
  Indexed 0 sorts

Finished in 0.005 seconds
static-smoke: PASS (14 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
```

`bash scripts/static-smoke.sh`

```text
static-smoke: PASS (14 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
```

`python3 scripts/check-current-topology.py`

```text
check-current-topology: PASS (canonical origin libre-ai.fr, 7 legacy 301s, routes clean, brand libre-ai)
```

`npm run e2e`

```text
> e2e
> playwright test

Running 32 tests using 7 workers

32 passed (3.7s)
```

`cargo deny check licenses sources`

```text
licenses ok, sources ok
```

`cargo audit`

```text
warning: 15 allowed warnings found
```

Les 15 avertissements autorisés sont transitifs et préexistants dans la chaîne Dioxus verrouillée : `RUSTSEC-2024-0411`, `RUSTSEC-2024-0412`, `RUSTSEC-2024-0413`, `RUSTSEC-2024-0414`, `RUSTSEC-2024-0415`, `RUSTSEC-2024-0416`, `RUSTSEC-2024-0418`, `RUSTSEC-2024-0419`, `RUSTSEC-2024-0420`, `RUSTSEC-2024-0429`, `RUSTSEC-2024-0436`, `RUSTSEC-2024-0370`, `RUSTSEC-2025-0057`, `RUSTSEC-2026-0097`, plus `spin 0.9.8` yanked. Ils ne sont pas présentés comme corrigés et aucune dépendance n’a été modifiée.

Greps empiriques finaux :

```text
content/corpus entries:
.gitkeep
content-only-gitkeep: PASS
empty-corpus-static-html: PASS
no-dynamic-corpus-route: PASS
single-dangerous-html-boundary: PASS
dependencies-and-diff-check: PASS
story-no-machine-local-path: PASS
```

### Completion Notes List

- Approche TDD suivie : refus du nouveau contrat prouvé avant implémentation, puis domaine fermé, schéma strict, prévalidation atomique, projection et rendu statique.
- `series` est obligatoire et explicitement nullable ; seul le scalaire exact `null` désigne une pièce autonome, et les coercitions YAML des scalaires numériques sont refusées.
- Le seul mapping non nul admis est `brief_trimestriel` avec année/trimestre validés lexicalement puis contre `NaiveDate`.
- Les collisions `(year, quarter)` entre publications sont diagnostiquées avec chemins relatifs triés avant tout effet sur `dist/`; le test sentinelle conserve l’ancien artefact.
- La projection renderer-independent partitionne exhaustivement la sélection `Published`, trie les autonomes en antéchronologique puis route, et les briefs par numéro chronologique.
- `CardCorpus` reçoit uniquement un `CorpusPiece` typé, réutilise `StateBadge`, rend la date sémantique, les corrections y compris zéro, le label de série et `corpus_route(piece)` sans fallback `#`.
- `/corpus` est pré-rendu depuis la même sélection que pages, sitemap et manifeste ; le corpus réel vide affiche un unique état honnête et conserve huit pages fixes.
- Les frontières 2.5–2.8 sont intactes : aucun Atom/alternate, aucune pièce ou fixture publique, aucune dépendance modifiée ; `content/corpus/` contient uniquement `.gitkeep`.
- Toutes les commandes demandées ont été réexécutées après revue. Tests Rust debug et release : 69 chacun ; E2E : 32 sur Chromium, Firefox, WebKit et mobile ; deny vert ; audit avec 15 avertissements transitifs autorisés non corrigés.
- Aucune suppression de fichier n’est requise ni effectuée.

### File List

- `_bmad-output/implementation-artifacts/2-4-index-du-corpus-et-serie-trimestrielle.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `assets/components.css`
- `e2e/site.spec.ts`
- `src/bin/site-build.rs`
- `src/components/card_corpus.rs`
- `src/components/empty_state.rs`
- `src/domain.rs`
- `src/editorial.rs`
- `src/lib.rs`
- `tests/corpus_index.rs`
- `tests/corpus_page.rs`
- `tests/editorial_pipeline.rs`

### Change Log

- 2026-07-14 — Story créée depuis la baseline `706b7d4` et passée à `ready-for-dev`; aucune implémentation ni pièce de corpus ajoutée.
- 2026-07-14 — Schéma de série trimestrielle fermé, validations calendrier/collisions, projection et index statique typé implémentés ; matrice de tests et gates complètes vertes ; statut passé à `review`.
- 2026-07-14 — Revue indépendante : coercitions YAML `null`/numériques détectées empiriquement puis refusées, 69 tests Rust et 32 E2E repassés ; story passée à `done`.
