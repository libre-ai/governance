---
story_id: 2.2
story_key: 2-2-page-piece-de-corpus
epic: 2
title: "Page pièce de corpus"
status: done
created: 2026-07-14
updated: 2026-07-14
baseline_commit: db13323
references:
  epics: _bmad-output/planning-artifacts/epics.md#story-22-page-pièce-de-corpus
  prd: _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#41-corpus-de-référence
  architecture: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#ad-3--contenu-en-markdown-strict--front-matter-yaml-parsé-au-domaine-typé
  design: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md
  experience: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md
  mockup: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/mockups/key-piece-corpus.html
---

# Story 2.2 : Page pièce de corpus

Status: done

## Story

En tant que directeur de cabinet,
je veux lire une pièce de référence avec sa nature, ses sources et ses corrections visibles,
afin de pouvoir m’y fier et la faire circuler.

## Acceptance Criteria

### AC1 — La page est une projection du `CorpusPiece` typé, sans nouvelle entrée non fiable

**Given** une pièce déjà chargée et validée par le pipeline de la story 2.1

**When** sa page est composée en Dioxus

**Then** le composant reçoit le `CorpusPiece` typé et projette ses accesseurs ; il ne reparcourt ni YAML ni Markdown et ne maintient aucun second contrat de pièce

**And** l’unique contenu pouvant atteindre `dangerous_inner_html` est le `RenderedMarkdown` opaque issu de `CorpusPiece::rendered_body()`

**And** aucune prop de composant, fonction de rendu public ou conversion de convenance n’accepte une `String` HTML arbitraire à la place de `RenderedMarkdown`

**And** le constructeur validant de `RenderedMarkdown` n’est pas rendu public ni contourné depuis `src/lib.rs`, la démonstration de composants ou les tests.

**And** si le Markdown source contient un `h1`, il est unique, son texte visible correspond exactement au `title` typé, puis il est retiré de `RenderedMarkdown` afin que seul le composant rende le `h1` public ; un `h1` divergent ou supplémentaire bloque le build.

### AC2 — Le document respecte la signature corpus et expose son identité éditoriale

**Given** une pièce publiée

**When** sa page HTML est rendue

**Then** elle contient un unique `h1` portant exactement le titre typé, avec `{typography.corpus-title}` / les variables CSS `--font-serif` et `--typography-corpus-title-*`

**And** la prose validée utilise `{typography.corpus-prose}` / les variables `--typography-corpus-prose-*`, dans une ligne de lecture limitée par `--reading-max`

**And** l’en-tête affiche la nature déclarée, l’auteur humain, la date de publication et la date de dernière revue, sans valeur de remplacement

**And** les dates sont rendues par des éléments `<time datetime="YYYY-MM-DD">…</time>` à partir des `NaiveDate` typées

**And** la nature est présentée par un libellé texte explicite (`Fait`, `Analyse` ou `Position`), jamais par la couleur seule

**And** `author_member_key` reste une donnée de domaine non résolue : aucun membre, lien de profil ou rôle n’est inventé avant la story 4.2.

### AC3 — Toutes les corrections sont visibles en tête et chaque archive reste accessible

**Given** un `CorpusPiece` dont `corrections()` contient une ou plusieurs entrées

**When** la page est rendue

**Then** un bloc de corrections se trouve après l’en-tête et avant la prose

**And** chaque correction typée est rendue, pas seulement la plus récente, avec sa date, sa note exacte et un lien vers `archived_version_url()`

**And** les corrections sont présentées dans un ordre déterministe antéchronologique pour placer la plus récente en premier, sans altérer l’ordre stocké dans le domaine

**And** chaque lien d’archive a un libellé de destination compréhensible sans contexte

**And** une liste vide ne produit ni badge « corrigée », ni bloc vide, ni correction fictive

**And** le permalien courant reste `/corpus/<slug>/` : une correction ne crée ni nouveau permalien public ni réécriture silencieuse de l’URL courante.

### AC4 — Transparence, sources liées et liste finale sont visibles sans duplication de vérité

**Given** les champs typés `assistance_ia`, `figures_method` et `sources`

**When** la fin de la pièce est rendue

**Then** la déclaration d’assistance IA est visible et reprend uniquement les entrées typées ; une liste explicitement vide est présentée comme absence déclarée d’assistance, sans modèle inventé

**And** la méthode des chiffres est affichée lorsqu’elle existe ; `None` ne provoque ni texte factuel de remplacement ni méthode inventée

**And** une section sémantique « Sources et références » clôt la partie éditoriale et liste toutes les sources typées avec leur titre et leur URL HTTPS

**And** les affirmations associées peuvent être affichées depuis `EditorialSource::claim()` mais ne sont jamais reformulées par le renderer

**And** chaque URL de source listée est déjà une destination de lien dans le corps, propriété garantie par la story 2.1 et vérifiée de nouveau par un test de rendu de page

**And** aucun lien externe non déclaré, média distant, script tiers, tracking ou cookie n’est ajouté.

### AC5 — Seules les pièces publiées obtiennent un artefact public stable

**Given** la collection validée renvoyée par `load_corpus`

**When** `site-build` prépare puis écrit l’artefact

**Then** seules les pièces dont `state() == PublishState::Published` sont rendues à `dist/corpus/<slug>/index.html`, correspondant au permalien `/corpus/<slug>/`

**And** les brouillons ne sont présents ni comme page HTML, ni dans `sitemap.xml`, ni dans `content-manifest.json`, ni dans un autre artefact public

**And** deux pièces publiées portant le même slug font échouer la prévalidation avec leurs chemins relatifs avant toute suppression ou écriture dans `dist/`

**And** la sélection, le tri par route et la détection des collisions sont déterministes

**And** le sitemap et le manifeste public intègrent les routes publiées sans inventer de résumé absent du domaine

**And** `SitePage::PUBLISHED` continue de représenter les huit pages fixes ; les routes corpus variables sont ajoutées par le publisher, pas transformées en pages fixes ni chargées à l’exécution par le navigateur.

### AC6 — La page reste sémantique, accessible, statique et orientée vers la sortie universelle

**Given** une page de pièce générée

**When** elle est consultée sans JavaScript, au clavier ou avec un lecteur d’écran

**Then** l’ordre est : en-tête éditorial, corrections éventuelles, prose, transparence éditoriale, sources, CTA

**And** la hiérarchie de titres est continue, les listes Markdown restent sémantiques, les liens sont soulignés et les focus visibles

**And** la page se termine par le CTA « Réserver 30 minutes » vers `/rdv` et la microcopy exacte « Échange sans engagement, confidentiel. »

**And** le contenu complet est présent dans le HTML statique, sans hydratation globale ni JavaScript requis

**And** le rendu conserve les thèmes clair/sombre, le responsive en unités relatives, la cible tactile de 44 px et le budget de sobriété existant.

### AC7 — L’incrément reste vide de contenu réel et ne préempte aucune sortie ultérieure

**Given** que `content/corpus/` contient uniquement `.gitkeep`

**When** cette story est terminée sur la baseline `db13323`

**Then** le build sans corpus continue de réussir sans créer de page de pièce, de date, de source ou de contenu de démonstration

**And** les cas de test sont construits en mémoire ou sous `target/`, explicitement fictifs, et ne sont jamais copiés dans `content/corpus/` ou `dist/`

**And** la démonstration `/_composants` ne contourne pas `RenderedMarkdown` et ne publie pas de fixture pour continuer à illustrer `PieceCorpus`

**And** cette story n’ajoute pas le bloc « Citer cette page », de formats bibliographiques, d’Open Graph dédié à une pièce ou de JSON-LD (story 2.3)

**And** elle ne crée ni index/cartes/série trimestrielle (2.4), ni Atom/découvrabilité de flux (2.5), ni pièce réelle (2.6 à 2.8).

## Tasks / Subtasks

- [x] **1. Refactorer `PieceCorpus` autour du domaine typé et fermer l’injection HTML arbitraire** (AC1, AC2, AC3, AC4)
  - [x] Remplacer les props parallèles en `String` (`title`, `author`, dates, `content`, correction unique) par une projection du `CorpusPiece` ; ne pas recréer une structure « view model » non validée portant du HTML libre.
  - [x] Si le corps reste une prop interne séparée, son type doit être exactement `RenderedMarkdown`, jamais `String`, `&str` ou un wrapper constructible depuis une chaîne arbitraire.
  - [x] Conserver au plus un point `dangerous_inner_html`, localisé dans le composant de prose, alimenté exclusivement par `piece.rendered_body().as_str()`.
  - [x] Ne pas rendre `RenderedMarkdown::from_validated_html` public et ne pas l’appeler depuis le renderer ou la démonstration ; les tests d’intégration obtiennent le type via `parse_piece`.
  - [x] Renforcer `editorial.rs` au point de production de `RenderedMarkdown` : accepter zéro `h1` ou un unique `h1` dont le texte visible égale exactement `CorpusPiece.title`, retirer ce titre des événements rendus, refuser tout `h1` divergent ou supplémentaire avec diagnostic actionnable.
  - [x] Supprimer du composant actuel le bloc « Citer cette page », réservé à 2.3.
  - [x] Adapter `/_composants` sans fabriquer de `CorpusPiece` public : en l’absence de pièce approuvée, afficher au plus une indication neutre sur la nécessité d’une pièce validée, ou omettre cette prévisualisation ; ne jamais parser ni publier une fixture dans cet artefact.

- [x] **2. Composer l’en-tête, les corrections et la prose sémantique** (AC2, AC3, AC6)
  - [x] Ajouter le libellé de nature, le `h1`, puis un `dl` pour auteur, publication et dernière revue.
  - [x] Centraliser les libellés français des trois variantes de `Nature` sans modifier le schéma YAML.
  - [x] Rendre les dates depuis `NaiveDate` avec `<time datetime>` ; ne pas introduire une dépendance de localisation pour quatre champs.
  - [x] Rendre toutes les corrections après l’en-tête, antéchronologiquement, avec un titre de section unique puis une liste/collection d’amendements datés et leurs archives.
  - [x] Rendre la prose validée dans un conteneur identifié et préserver le HTML sémantique produit par `pulldown-cmark`.
  - [x] Ne pas résoudre `author_member_key` et ne pas déduire une identité ou un rôle.

- [x] **3. Rendre la transparence éditoriale, les sources et le CTA** (AC4, AC6)
  - [x] Afficher la déclaration `assistance_ia` sans concaténer de valeurs absentes ; gérer explicitement la liste vide.
  - [x] Afficher `figures_method` uniquement lorsqu’elle vaut `Some`, sans produire de méthode de substitution pour `None`.
  - [x] Rendre toutes les `EditorialSource` en fin de partie éditoriale avec des liens descriptifs ; ne jamais transformer une URL de source en chargement automatique.
  - [x] Ajouter le CTA final exact vers `/rdv` et sa microcopy exacte, sans formulaire ni intégration au futur service conversion.
  - [x] Vérifier qu’aucun rendu de citation bibliographique, format APA/Chicago/BibTeX ou bouton copier ne subsiste dans `PieceCorpus`.

- [x] **4. Publier les routes statiques depuis la collection déjà validée** (AC5, AC7)
  - [x] Dans `src/bin/site-build.rs`, conserver le résultat de `load_corpus` au lieu de le jeter.
  - [x] Avant `remove_dir_all(&output)`, sélectionner uniquement `Published`, trier les routes et refuser les slugs publiés dupliqués avec diagnostics relatifs ; aucun brouillon ne doit influencer une écriture publique.
  - [x] Ajouter dans `src/lib.rs` une fonction de rendu statique de pièce recevant un `&CorpusPiece` et refusant explicitement `Draft`, au lieu de reparcourir le système de fichiers.
  - [x] Écrire chaque pièce publiée avec le mécanisme `write_page` existant à `/corpus/<slug>/`.
  - [x] Étendre `sitemap()` et `content_manifest()` à partir de la même sélection publiée. Si la description devient optionnelle dans le manifeste, préserver sans changement les entrées des pages fixes et ne pas inventer de description de pièce.
  - [x] Calculer tout compte de pages depuis les collections réelles, jamais depuis un nombre saisi à la main.
  - [x] Ne pas ajouter le corpus dynamique à `SitePage::PUBLISHED`, ne pas charger le contenu au runtime WASM et ne pas réintroduire de serveur de production.

- [x] **5. Adapter le document HTML sans préempter les métadonnées de 2.3** (AC5, AC7)
  - [x] Réutiliser le shell statique, les feuilles locales, la navigation, le skip-link et le footer existants.
  - [x] Produire un `<title>` et un canonical cohérents avec le titre typé et `/corpus/<slug>/`, en échappant toutes les valeurs dynamiques.
  - [x] Ne pas inventer de `<meta name="description">` depuis le corps et ne pas générer d’Open Graph spécifique ou de JSON-LD pour une pièce dans cette story.
  - [x] Si `render_html_document` est généralisée, préserver byte-for-byte autant que possible les métadonnées actuelles des huit pages fixes et garder `noindex` sur `/_composants`.

- [x] **6. Compléter les styles de la page pièce à partir des tokens existants** (AC2, AC3, AC4, AC6)
  - [x] Étendre la section `PIECE CORPUS` de `assets/components.css`; ne pas créer une seconde feuille ni ajouter de valeur de couleur/typographie en dur.
  - [x] Conserver `--reading-max`, `--font-serif`, `--typography-corpus-title-*`, `--typography-corpus-prose-*`, les couleurs de thème et les espacements existants.
  - [x] Couvrir les éléments CommonMark autorisés utiles à la lecture longue : `h2/h3`, paragraphes, listes, citations, code, images locales et liens, sans masquer le focus.
  - [x] Ajouter les styles des corrections multiples, de la transparence, des sources et du CTA avec un comportement mobile en colonne unique.
  - [x] Vérifier les deux thèmes et `prefers-reduced-motion`; aucun état ne dépend du survol ou de la couleur seule.

- [x] **7. Ajouter une matrice de tests fictive, en mémoire et non publiée** (AC1 à AC7)
  - [x] Construire les `CorpusPiece` de test uniquement via `parse_piece` avec des sources `example.invalid`, des auteurs/titres explicitement fictifs et des corps sans affirmation réelle.
  - [x] Tester le HTML sémantique : unique `h1`, nature, auteur, deux `<time datetime>`, classes serif et CTA exact.
  - [x] Tester la normalisation du titre Markdown : `h1` identique retiré du corps, absence de `h1` acceptée, titre divergent et second `h1` refusés.
  - [x] Tester zéro, une et plusieurs corrections ; pour plusieurs, vérifier toutes les notes/archives et l’ordre antéchronologique.
  - [x] Tester que toutes les sources apparaissent dans le corps et la section finale, et que l’assistance/méthode sont projetées sans valeur inventée.
  - [x] Tester qu’une pièce `Draft` est refusée par le rendu public et absente de toute sélection, route, sitemap et manifeste.
  - [x] Tester deux slugs publiés identiques : échec avant effet de bord, diagnostics relatifs et déterministes.
  - [x] Tester corpus vide : aucun répertoire `dist/corpus/<slug>` additionnel et comportement Epic 1 inchangé.
  - [x] Ajouter une assertion de régression garantissant que la prop dangereuse n’est plus une `String` arbitraire et que le HTML de fixture n’est pas présent dans `/_composants` ou le manifeste public.
  - [x] Ne créer aucun fichier de fixture sous `content/corpus/`; utiliser la mémoire ou une racine temporaire sous `target/`.

- [x] **8. Exécuter les gates disponibles et copier leurs sorties brutes** (AC1 à AC7)
  - [x] `cargo fmt --check`
  - [x] `cargo test --no-default-features --features static`
  - [x] `cargo clippy --all-targets --no-default-features --features static -- -D warnings`
  - [x] `cargo run --release --no-default-features --features static --bin site-build`
  - [x] `bash scripts/static-smoke.sh`
  - [x] `python3 scripts/check-current-topology.py`
  - [x] `cargo deny check licenses sources`
  - [x] `cargo audit` ; consigner honnêtement les avertissements autorisés déjà connus, sans les présenter comme corrigés.
  - [x] Vérifier explicitement après build que `content/corpus/` contient seulement `.gitkeep`, qu’aucune fixture n’est dans `dist/` et qu’aucun nouveau `dangerous_inner_html` n’existe.
  - [x] Copier dans le Dev Agent Record les sorties brutes réellement obtenues ; une commande non exécutée doit être marquée telle quelle, jamais reconstituée.

## Dev Notes

### Décision d’intégration

La story 2.1 a déjà établi la frontière de confiance :

```text
Markdown non fiable
  -> parse_piece/load_corpus
  -> CorpusPiece + RenderedMarkdown opaques
  -> PieceCorpus (projection uniquement)
  -> HTML statique /corpus/<slug>/
```

Ne pas ajouter de sanitiseur concurrent, de second parseur ou de nouveau type de corps. `RenderedMarkdown` est déjà produit après inspection des événements CommonMark, refus de l’HTML brut, validation des destinations et liaison exhaustive des sources. La story 2.2 doit seulement préserver cette preuve jusqu’au point d’insertion Dioxus.

### Politique de publication

- Le chargement et toutes les validations de 2.1 restent avant les effets de bord.
- La nouvelle prévalidation des routes publiées (filtrage, tri, collisions) doit elle aussi finir avant le nettoyage de `dist/`.
- Une pièce `Draft` reste validée comme contenu de travail, mais ne traverse jamais la frontière de publication.
- La route publique est dérivée uniquement du `slug` déjà validé : `/corpus/<slug>/`.
- Le nom de fichier contient l’année, la route non. Deux années avec le même slug publié entrent donc en collision et doivent échouer explicitement.
- La correction modifie le contenu au même permalien. Toutes les archives typées sont visibles en tête ; aucune archive n’est fabriquée par le renderer.

### État actuel des fichiers à modifier

#### `src/components/piece_corpus.rs` — UPDATE

- **État actuel :** props composées de `String`, métadonnées partielles, correction unique optionnelle, `dangerous_inner_html` alimenté par `props.content: String`, puis bloc « Citer cette page » codé en dur.
- **Changement attendu :** projection d’un `CorpusPiece`, nature et métadonnées complètes, corrections multiples, transparence, sources, CTA ; corps uniquement `RenderedMarkdown`; retrait du bloc de citation.
- **À préserver :** `<article>` sémantique et classes de base réutilisables.

#### `assets/components.css` — UPDATE

- **État actuel :** les tokens serif du titre et de la prose sont déjà appliqués ; seules une correction unique et une fausse section citation sont stylées. La prose ne couvre pas encore toute la structure CommonMark et aucune section sources/transparence/CTA n’existe pour cette page.
- **Changement attendu :** compléter la page réelle, corrections multiples, sources et CTA ; supprimer les styles `piece-share` devenus sans usage si aucun autre composant ne les consomme.
- **À préserver :** tokens, thèmes, limite de lecture, réduction de mouvement et styles des huit autres composants.

#### `src/lib.rs` — UPDATE

- **État actuel :** `/corpus` affiche un `EmptyState`; `/_composants` construit `PieceCorpus` depuis des chaînes et du HTML arbitraire; le shell statique échappe title/description/path et émet aujourd’hui des OG génériques pour toutes les pages fixes.
- **Changement attendu :** supprimer le contournement de démonstration, ajouter le rendu statique d’un `CorpusPiece` publié et permettre un document de pièce sans métadonnées dédiées 2.3.
- **À préserver :** page index `/corpus` inchangée jusqu’à 2.4, routes fixes, shell, skip-link, navigation, CTA d’en-tête, 404, noindex de démonstration et tests Epic 1.

#### `src/bin/site-build.rs` — UPDATE

- **État actuel :** `load_corpus(&root)` s’exécute avant le nettoyage de `dist/`, mais son résultat est jeté; seules les huit pages fixes, la démonstration et les utilitaires sont écrits; sitemap/manifeste ne connaissent que `SitePage::PUBLISHED`.
- **Changement attendu :** prévalider et publier les seuls `Published`, étendre sitemap/manifeste, refuser les collisions avant effet de bord.
- **À préserver :** copie des assets, pages fixes, 404, robots, manifeste web, `llms.txt`, `.htaccess`, mesure `.weights.json` et injection dans la home.

#### `src/domain.rs` — REVIEW, UPDATE ciblé seulement si nécessaire

- **État actuel :** `CorpusPiece`, `Nature`, `PublishState`, `Correction`, `EditorialSource` et `RenderedMarkdown` sont renderer-independent, privés en écriture et publics via accesseurs. `RenderedMarkdown::from_validated_html` est `pub(crate)` et `as_str()` est public.
- **Changement autorisé :** ajouter au plus un helper de présentation stable ou renforcer l’encapsulation si cela évite un contournement réel.
- **À préserver :** types `NaiveDate`/`Url`, accesseurs, domaine sans Dioxus, `SitePage::PUBLISHED` à huit pages et origine canonique.

#### `src/editorial.rs` — REVIEW, pas de parsing concurrent

- **État actuel :** seul producteur normal de `CorpusPiece`; valide chemin, front-matter, dates, liens, HTML brut, sources et rendu CommonMark.
- **Changement attendu :** aucun, sauf si la détection de collision est placée dans une fonction éditoriale pure réutilisable. Ne pas modifier le schéma pour cette story.
- **À préserver :** tous les diagnostics et refus de 2.1.

#### `tests/editorial_pipeline.rs` — PRESERVE / compléter seulement pour une régression de frontière

- **État actuel :** 22 tests fictifs couvrent le pipeline et garantissent que `content/corpus/` ne contient que `.gitkeep`.
- **Changement attendu :** conserver toute la matrice. Préférer un nouveau fichier de tests de rendu/publication plutôt que mélanger les responsabilités.

#### `content/corpus/.gitkeep` — UNTOUCHED

Aucun Markdown réel, exemple, snapshot de démonstration ou fixture ne doit être ajouté dans ce répertoire.

### Composition sémantique cible

```text
article.piece-corpus
  header.piece-corpus-header
    nature textuelle
    h1 serif
    dl (auteur, publication, dernière revue)
  section corrections [seulement si non vide]
    une entrée par Correction, date + note + archive
  div.piece-corpus-prose [RenderedMarkdown validé]
  section transparence éditoriale
    assistance IA explicite
    méthode des chiffres si présente
  section sources et références
    liste de toutes les EditorialSource
  section CTA
    Réserver 30 minutes
    Échange sans engagement, confidentiel.
```

Le shell du site fournit déjà `<header>`, `<nav>`, `<main>` et `<footer>`. Ne pas imbriquer un second `<main>` ni ajouter un deuxième `h1`.

### Frontière avec les stories suivantes

- **2.3 :** possède le composant « Citer cette page », les formats bibliographiques, OG dédiées et JSON-LD. Le faux bloc actuel doit être retiré, pas complété.
- **2.4 :** possède `/corpus` comme index, `CardCorpus`, les séries et la navigation entre pièces. La page index reste en `EmptyState` ici.
- **2.5 :** possède Atom et `<link rel="alternate">`. Aucun flux dans cet incrément.
- **2.6 à 2.8 :** possèdent le contenu humain approuvé. Aucun exemple de la maquette n’est une source éditoriale acceptable.
- **3.6 :** généralisera le CTA à toutes les pages. Ici, le CTA est ajouté uniquement à la nouvelle page pièce conformément au périmètre demandé.
- **4.2 :** résoudra `author_member_key` vers une fiche membre.

### Lecture de la maquette

`mockups/key-piece-corpus.html` est une référence de composition, pas une source de faits. Elle contient des noms, chiffres, organisations, URLs et statuts juridiques fictifs ou obsolètes : aucun ne doit être repris. Les éléments retenus sont uniquement la hiérarchie visuelle (serif, métadonnées, correction en tête, sources, CTA). Le bloc de citation appartient à 2.3 et le proof footer chiffré n’est pas alimentable sans mesure/source typée dans cette story.

### Bibliothèques et versions

Aucune dépendance ne doit être ajoutée ni mise à jour pour cette story.

| Bibliothèque | Version verrouillée | Usage dans cet incrément |
|---|---:|---|
| Dioxus / dioxus-ssr | 0.7.9 | composant et rendu HTML statique selon les patterns existants |
| pulldown-cmark | 0.13.4 | déjà consommé en amont ; ne pas reparsing dans le composant |
| chrono | 0.4.45 | dates `NaiveDate` déjà typées |
| url | 2.5.8 | sources et archives déjà typées |

La baseline `db13323` et `Cargo.lock` sont la référence. Ne pas remplacer les API en place par une migration ou un framework supplémentaire.

### Exigences de tests

- Les tests de composant/rendu doivent appeler `parse_piece`, puis `render_corpus_document`; aucun constructeur manuel de HTML sûr.
- Les valeurs de fixture doivent être explicitement fictives, utiliser `example.invalid` et ne porter aucune affirmation sur une organisation réelle.
- Les tests de sélection/publication doivent travailler sur des collections en mémoire ou une racine sous `target/`.
- Les assertions doivent inspecter les invariants sémantiques et de sécurité, pas seulement des classes CSS.
- Un test positif de page publiée et un test négatif de brouillon sont obligatoires.
- Un build du dépôt réel avec corpus vide doit rester vert et ne constitue pas, à lui seul, une preuve de rendu de page.
- La preuve navigateur d’une pièce réelle attend la première pièce approuvée ; ne pas publier une fixture pour fabriquer cette preuve.

### Project Structure Notes

Fichiers attendus :

```text
src/components/piece_corpus.rs                 UPDATE
assets/components.css                          UPDATE
src/lib.rs                                     UPDATE
src/bin/site-build.rs                          UPDATE
src/domain.rs                                  REVIEW / UPDATE ciblé optionnel
src/editorial.rs                               REVIEW / UPDATE ciblé optionnel
tests/corpus_page.rs                           NEW recommandé
tests/editorial_pipeline.rs                    PRESERVE
content/corpus/.gitkeep                        UNTOUCHED
```

Aucun fichier n’est à supprimer dans cette story. Ne pas créer de crate, workspace, dépendance, script de migration ou contenu public supplémentaire.

### Previous Story Intelligence

La story 2.1, maintenant `done`, impose les faits d’implémentation suivants :

- `CorpusPiece` est le contrat unique ; ses dates et URLs sont déjà typées.
- `RenderedMarkdown` est opaque et n’est obtenu normalement qu’après validation de tous les événements CommonMark.
- Chaque source front-matter doit déjà être liée exactement dans le Markdown ; chaque lien HTTPS externe du corps doit être déclaré comme source.
- Les corrections sont datées, bornées par publication/revue, strictement croissantes et portent une archive HTTPS.
- Le loader retourne les pièces triées par chemin relatif et agrège les diagnostics.
- `site-build` valide déjà tout le corpus avant de toucher à `dist/` ; la story 2.2 doit conserver cette propriété pour les collisions de routes.
- Tous les tests de 2.1 sont fictifs et `content/corpus/` contient seulement `.gitkeep`.
- Les gates de 2.1 ont passé avec les versions actuellement verrouillées ; `cargo audit` signalait des avertissements transitifs autorisés, pas une raison de modifier les dépendances dans cet incrément.

### Git Intelligence

Le baseline fourni pour cette story est `db13323`. Aucune commande Git de mutation n’est autorisée pour la création ou l’implémentation pilotée par cette story. Les observations viennent des fichiers courants et de la story 2.1 ; ne pas déduire un état de support ou de publication d’un historique non vérifié.

### Scope Guardrails

- Chemins contenant `/.claude/worktrees/impl-bmad/` uniquement pendant le travail ; tout autre arbre est interdit.
- Aucune commande Git de mutation : jamais `checkout`, `restore`, `reset`, `clean`, `stash`; pas de commit.
- Les suppressions éventuelles sont listées avant décision ; aucune suppression n’est requise ici.
- Zéro contenu inventé : aucun chiffre, client, organisation, adresse, SIRET, statut juridique ou affirmation de la maquette ne doit entrer dans le code, les tests publiés ou `content/`.
- Aucune pièce réelle : cas de tests en mémoire/hors `content/` uniquement ; `content/corpus/.gitkeep` reste seul.
- Sécurité > qualité > performance > complétude.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.2, UX-DR5]
- [Source: `_bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md` — §4.1 FR-1 à FR-5, §10 NFR-5/7/9/11/12]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md` — AD-1, AD-2, AD-3, AD-8, Consistency Conventions]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md` — Typography, Card Corpus, State Badge, Citation Block, pratiques]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md` — pièce-de-corpus, états honnêtes, accessibilité, CTA]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/mockups/key-piece-corpus.html` — composition uniquement, contenu non réutilisable]
- [Source: `TARGET.md` — responsabilité éditoriale, exigence de vérité, Markdown strict]
- [Source: `docs/adr/0007-dioxus-clean-rebuild.md` — domaine indépendant, publication statique, rendu assaini]
- [Source: `docs/adr/0008-domaines-publics-et-gates-par-produit.md` — origine canonique libre-ai.fr]
- [Source: `_bmad-output/implementation-artifacts/2-1-gabarit-type-et-pipeline-markdown.md` — contrat final et retours d’implémentation]
- [Source: `src/domain.rs`, `src/editorial.rs`, `src/components/piece_corpus.rs`, `assets/components.css`, `src/lib.rs`, `src/bin/site-build.rs`, `tests/editorial_pipeline.rs`, `Cargo.toml`, `Cargo.lock` — état courant lu le 2026-07-14]

## Dev Agent Record

### Agent Model Used

Non exposé par le harnais de cette session.

### Debug Log References

- Plan d’implémentation : normaliser le `h1` au point de production de `RenderedMarkdown`, projeter directement `CorpusPiece` dans Dioxus, puis prévalider une sélection publiée déterministe avant tout effet de bord et la réutiliser pour pages, sitemap et manifeste.
- RED initial — `cargo test --no-default-features --features static --test editorial_pipeline --test corpus_page` :

```text
error[E0432]: unresolved import `libre_ai_website::render_corpus_document`
 --> tests/corpus_page.rs:3:52
  |
3 | use libre_ai_website::{render_components_document, render_corpus_document};
  |                                                    ^^^^^^^^^^^^^^^^^^^^^^ no `render_corpus_document` in the root
error: could not compile `libre-ai-website` (test "corpus_page") due to 1 previous error
```

- RED publication — `cargo test --no-default-features --features static --test corpus_page published_selection_excludes_drafts_and_sorts_by_route` :

```text
error[E0432]: unresolved import `libre_ai_website::domain::select_published_corpus`
 --> tests/corpus_page.rs:3:54
  |
3 | use libre_ai_website::domain::{Nature, PublishState, select_published_corpus};
  |                                                      ^^^^^^^^^^^^^^^^^^^^^^^ no `select_published_corpus` in `domain`
error: could not compile `libre-ai-website` (test "corpus_page") due to 1 previous error
```

- `cargo fmt --check` :

```text
```

- Sortie filtrée réellement obtenue pour `cargo test --no-default-features --features static` puis `cargo test --release --no-default-features --features static` (`grep -E '^(running|test result)'`) :

```text
running 5 tests
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 5 tests
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 14 tests
test result: ok. 14 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 27 tests
test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 5 tests
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 5 tests
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 14 tests
test result: ok. 14 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 27 tests
test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

- `cargo clippy --all-targets --no-default-features --features static -- -D warnings`, `cargo check --target wasm32-unknown-unknown --bin libre-ai-website`, puis `cargo build --release --no-default-features --features static` :

```text
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.14s
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.13s
Finished `release` profile [optimized] target(s) in 0.10s
```

- Build statique en deux passes — `cargo run --release --no-default-features --features static --bin site-build`, `bash scripts/measure-weights.sh`, puis `./target/release/site-build` :

```text
Finished `release` profile [optimized] target(s) in 0.10s
Running `target/release/site-build`
✓ Measurement complete
  Page size: 57 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T17:20:09Z
  Output: dist/.weights.json
site-build: 8 pages publiées dans dist/
✓ Measurement complete
  Page size: 57 KB (4192 bytes)
  Third-party requests: 0
  Date: 2026-07-14T17:20:09Z
  Output: dist/.weights.json
✓ Measurement complete
  Page size: 57 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T17:20:09Z
  Output: dist/.weights.json
site-build: 8 pages publiées dans dist/
```

- `npm run build 2>&1 | grep -v '^Running from:'` :

```text
> build
> bash scripts/build-static.sh

✓ Measurement complete
  Page size: 57 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T17:20:14Z
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
  Indexed 324 words
  Indexed 0 filters
  Indexed 0 sorts

Finished in 0.005 seconds
static-smoke: PASS (14 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
```

- Smoke, topologie, publication fail-closed/approuvée et tests unitaires de gate :

```text
static-smoke: PASS (14 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
check-current-topology: PASS (canonical origin libre-ai.fr, 7 legacy 301s, routes clean, brand libre-ai)
publication gates: FAIL — LIBRE_AI_WEBSITE_APPROVED must be set to 1 (human approval required)
publication gate fail-closed exit code: 1
publication gates: PASS — Website approved and dist/ ready for deployment
test_dist_must_contain_required_files (test_publication_gates.PublicationGatesTest.test_dist_must_contain_required_files)
If dist/ exists, it must contain index.html, .htaccess, sitemap.xml, mentions-legales/index.html. ... ok
test_env_var_value_must_be_exactly_1 (test_publication_gates.PublicationGatesTest.test_env_var_value_must_be_exactly_1)
Env var must be exactly '1', not 'true' or other values. ... ok
test_website_approves_with_env_var_when_dist_absent (test_publication_gates.PublicationGatesTest.test_website_approves_with_env_var_when_dist_absent)
With LIBRE_AI_WEBSITE_APPROVED=1 and no dist/, gate passes. ... ok
test_website_requires_explicit_approval_env_var (test_publication_gates.PublicationGatesTest.test_website_requires_explicit_approval_env_var)
Without LIBRE_AI_WEBSITE_APPROVED=1, gate fails. ... ok

----------------------------------------------------------------------
Ran 4 tests in 0.000s

OK
```

- `cargo deny check licenses sources` puis sortie filtrée réellement obtenue de `cargo audit` :

```text
licenses ok, sources ok
Crate:     atk
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0413
Crate:     atk-sys
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0416
Crate:     fxhash
Version:   0.2.1
Warning:   unmaintained
ID:        RUSTSEC-2025-0057
Crate:     gdk
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0412
Crate:     gdk-sys
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0418
Crate:     gdkwayland-sys
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0411
Crate:     gdkx11-sys
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0414
Crate:     gtk
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0415
Crate:     gtk-sys
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0420
Crate:     gtk3-macros
Version:   0.18.2
Warning:   unmaintained
ID:        RUSTSEC-2024-0419
Crate:     paste
Version:   1.0.15
Warning:   unmaintained
ID:        RUSTSEC-2024-0436
Crate:     proc-macro-error
Version:   1.0.4
Warning:   unmaintained
ID:        RUSTSEC-2024-0370
Crate:     glib
Version:   0.18.5
Warning:   unsound
ID:        RUSTSEC-2024-0429
Crate:     rand
Version:   0.7.3
Warning:   unsound
ID:        RUSTSEC-2026-0097
Crate:     spin
Version:   0.9.8
Warning:   yanked
warning: 15 allowed warnings found
```

- Vérifications empiriques après le build final (`grep -o | wc -l`) :

```text
content/corpus entries:
content/corpus/.gitkeep
content/corpus markdown files: 0
dynamic corpus index files in dist: 0
fixture markers in public text artifacts: 0
dangerous_inner_html occurrences in src: 1
dangerous_inner_html from rendered_body occurrences: 1
from_validated_html in renderer/demo: 0
manifest path entries: 8
sitemap url entries: 8
dynamic corpus manifest routes: 0
home h1 count: 1
components Piece Corpus demo labels: 0
citation/JSON-LD/Atom additions in corpus implementation: 0
```

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Le pipeline retire un `h1` Markdown unique seulement si son texte visible égale exactement le titre typé ; les divergences, doublons et sauts de niveaux bloquent avec diagnostics relatifs.
- `PieceCorpus` ne reçoit plus que `CorpusPiece` et son unique insertion HTML provient de `piece.rendered_body().as_str()` ; l’ancienne démonstration inventée et le bloc de citation réservé à 2.3 ont été retirés.
- La page projette nature, auteur, dates typées, corrections antéchronologiques, prose, assistance IA, méthode éventuelle, sources et CTA exact, sans résoudre `author_member_key`.
- Le publisher sélectionne uniquement `Published`, trie par route, refuse les collisions avant tout effet de bord, puis réutilise cette sélection pour pages, sitemap et manifeste sans description inventée.
- Le shell de pièce conserve navigation, skip-link, footer et feuilles locales, sans description, Open Graph dédié, JSON-LD ni Atom réservés aux stories 2.3 à 2.5.
- La matrice utilise seulement des fixtures fictives en mémoire ou sous `target/`, avec `example.invalid`. `content/corpus/` contient uniquement `.gitkeep` et le build final ne contient aucune route dynamique faute de pièce approuvée.
- Aucune dépendance, aucune pièce réelle et aucun fichier sous `content/corpus/` n’ont été ajoutés. Aucun fichier n’a été supprimé.
- Les exemples hérités inventés de `/_composants` ont été remplacés par des libellés structurels neutres ; une régression teste l’absence des noms, durées et preuves concernés.
- La cible tactile du lien d’archive de correction utilise `--control-touch-target` après revue.
- Toutes les gates demandées ont été exécutées. `cargo audit` conserve 15 avertissements transitifs autorisés déjà connus ; ils ne sont pas présentés comme corrigés.

### File List

- `_bmad-output/implementation-artifacts/2-2-page-piece-de-corpus.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `assets/components.css`
- `src/bin/site-build.rs`
- `src/components/piece_corpus.rs`
- `src/domain.rs`
- `src/editorial.rs`
- `src/lib.rs`
- `tests/corpus_page.rs`
- `tests/editorial_pipeline.rs`

### Change Log

- 2026-07-14 — Story créée et passée à `ready-for-dev` depuis la baseline `db13323`.
- 2026-07-14 — Page corpus typée, normalisation `h1`, publication statique `Published`-only, collisions pré-effets de bord, styles et matrice de tests ajoutés ; vérification empirique et revue terminées, story passée à `done`.
