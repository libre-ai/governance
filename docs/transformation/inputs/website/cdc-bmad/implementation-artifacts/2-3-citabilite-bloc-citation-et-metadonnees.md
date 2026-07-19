---
story_id: 2.3
story_key: 2-3-citabilite-bloc-citation-et-metadonnees
epic: 2
title: "Citabilité — bloc citation et métadonnées"
status: done
created: 2026-07-14
updated: 2026-07-14
baseline_commit: b1746a4
references:
  epics: _bmad-output/planning-artifacts/epics.md#story-23-citabilité--bloc-citation-et-métadonnées
  prd: _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#41-corpus-de-référence
  architecture_ad3: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#ad-3--contenu-en-markdown-strict--front-matter-yaml-parsé-au-domaine-typé
  architecture_ad8: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#ad-8--gates-ci-bloquantes--vérité-éditoriale-sobriété-accessibilité-confidentialité-zéro-tiers
  design: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md
  experience: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md
---

# Story 2.3 : Citabilité — bloc citation et métadonnées

Status: done

## Story

En tant que relais d’opinion,
je veux citer une pièce proprement en un geste,
afin de la référencer dans mes propres publications.

## Acceptance Criteria

### AC1 — Le bloc « Citer cette page » est une projection fermée du `CorpusPiece`

**Given** un `CorpusPiece` publié déjà validé par le pipeline éditorial

**When** sa page est rendue

**Then** une section sémantique intitulée exactement « Citer cette page » est présente à la fin de la partie éditoriale, après « Sources et références » et avant le CTA universel

**And** elle contient exclusivement l’auteur humain `piece.author()`, le titre exact `piece.title()`, la date de publication `piece.published_date()` et l’URL canonique dérivée de `CANONICAL_ORIGIN + corpus_route(piece)`

**And** la forme textuelle neutre est exactement : `{auteur}. « {titre} ». {YYYY-MM-DD}. {URL canonique}` ; l’URL est aussi un lien descriptif vers le permalien courant

**And** le composant reçoit le `CorpusPiece` typé, ou une projection opaque impossible à construire autrement ; il n’accepte plus quatre `String` libres ni une URL fournie par le front-matter

**And** aucune date de revue, source, résumé, affiliation, rôle, identifiant membre ou donnée bibliographique supplémentaire n’est inventé

**And** l’absence de bouton copier ou de JavaScript ne dégrade pas l’accès à la citation : le texte reste sélectionnable, lisible et utilisable au clavier.

### AC2 — Les métadonnées Open Graph de pièce sont minimales, exactes et échappées

**Given** une page corpus publiée au permalien `/corpus/<slug>/`

**When** le document HTML est composé

**Then** son `<head>` contient exactement une occurrence de chacune des propriétés de pièce suivantes, toutes dérivées du même `CorpusPiece` :

- `og:type` = `article` ;
- `og:title` = titre exact ;
- `og:url` = URL canonique exacte ;
- `article:published_time` = `published_date` au format `YYYY-MM-DD` ;
- `article:modified_time` = `last_review_date` au format `YYYY-MM-DD`.

**And** toutes les valeurs insérées dans les attributs HTML passent par l’échappement HTML central existant, notamment `&`, `<`, `>`, guillemets doubles et apostrophes

**And** le canonical existant et `og:url` portent exactement la même URL

**And** aucune `og:description`, image, auteur Open Graph non conforme, `site_name` ou autre valeur absente du domaine n’est fabriqué

**And** les métadonnées génériques des huit pages fixes conservent leur comportement actuel.

### AC3 — Le JSON-LD `Article` est sérialisé depuis le domaine, sans fait ajouté

**Given** le même `CorpusPiece` publié

**When** son JSON-LD est généré

**Then** le `<head>` contient exactement un bloc `<script type="application/ld+json">`

**And** sa valeur JSON, sérialisée avec `serde_json`, contient exactement les propriétés suivantes :

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "<piece.title()>",
  "author": {
    "@type": "Person",
    "name": "<piece.author()>"
  },
  "datePublished": "<piece.published_date(): YYYY-MM-DD>",
  "dateModified": "<piece.last_review_date(): YYYY-MM-DD>",
  "url": "<URL canonique>",
  "mainEntityOfPage": "<URL canonique>",
  "articleSection": "<piece.nature().label_fr()>"
}
```

**And** `articleSection` est la projection standard pertinente de la nature déclarée (`Fait`, `Analyse` ou `Position`), sans modifier le schéma YAML

**And** aucune propriété `publisher`, `logo`, `description`, `image`, `about`, `keywords`, affiliation, organisation ou identité supplémentaire n’est ajoutée sans donnée de domaine et exigence explicite

**And** `https://schema.org` reste un identifiant sémantique dans le JSON-LD : aucun script, police, image ou autre ressource n’est chargé depuis schema.org ou un tiers.

### AC4 — Le contexte `<script>` résiste aux titres et auteurs hostiles

**Given** un titre ou un auteur fictif contenant des guillemets, antislashs, `</script>`, des balises, `<`, `>`, `&`, U+2028 ou U+2029

**When** le JSON-LD est produit

**Then** l’objet Rust est d’abord sérialisé avec `serde_json` ; aucune concaténation manuelle de JSON n’est admise

**And** le JSON sérialisé est ensuite neutralisé pour le contexte HTML script en remplaçant au minimum `<`, `>`, `&`, U+2028 et U+2029 par leurs échappements JSON `\u003C`, `\u003E`, `\u0026`, `\u2028` et `\u2029`

**And** cette neutralisation rend impossible toute séquence littérale `</script` dans le payload, quelle que soit sa casse, sans échapper le document JSON comme du HTML

**And** après extraction du texte situé entre les balises du bloc JSON-LD, `serde_json::from_str` réussit et restitue exactement le titre et l’auteur hostiles originaux

**And** le document ne contient qu’un seul bloc JSON-LD et aucun élément `<script>` injecté par ces valeurs

**And** le titre hostile reste également inoffensif dans `<title>`, `og:title`, le `h1` et le bloc de citation grâce à l’échappement propre à chaque contexte.

### AC5 — Chaque pièce publiée passe une gate de citabilité avant tout effet de bord sur `dist/`

**Given** la sélection déterministe renvoyée par `select_published_corpus`

**When** `site-build` prépare l’artefact statique

**Then** chaque pièce publiée est projetée, rendue et validée en mémoire avant `remove_dir_all(dist)` ou toute écriture dans `dist/`

**And** la gate vérifie pour chaque pièce la présence unique et la cohérence du bloc de citation, du canonical, des propriétés Open Graph requises et du JSON-LD

**And** le payload JSON-LD extrait est parsé avec `serde_json::from_str` puis comparé aux valeurs attendues du `CorpusPiece`, y compris les deux dates, l’auteur `Person`, l’URL, `mainEntityOfPage` et `articleSection`

**And** une absence, un doublon, un JSON invalide ou une divergence fait échouer le build avec le chemin relatif de la pièce et la règle en cause, sans chemin absolu ni contenu éditorial complet

**And** en cas d’échec, l’ancien `dist/` reste intact et aucun artefact partiel n’est écrit

**And** un corpus vide reste valide et ne fabrique aucune page, citation ou métadonnée de pièce.

### AC6 — La page reste statique, accessible et sans nouvelle frontière de confiance

**Given** une pièce publiée rendue sans JavaScript

**When** le lecteur atteint sa fin

**Then** l’ordre sémantique est : prose, transparence éditoriale, sources, « Citer cette page », CTA

**And** le titre de section s’insère dans la hiérarchie existante sans second `h1`, le permalien est un lien souligné et le bloc respecte les thèmes, unités relatives, focus visibles et largeur de lecture existants

**And** aucun nouveau `dangerous_inner_html` n’est ajouté ; l’unique occurrence existante reste exclusivement alimentée par `RenderedMarkdown`

**And** aucun chargement tiers, tracking, cookie, hydratation globale ou JavaScript obligatoire n’est introduit

**And** la sortie conserve le budget de sobriété et les pages de pièce restent entièrement présentes dans le HTML statique.

### AC7 — L’incrément ne publie rien et ne préempte pas les stories suivantes

**Given** la baseline `b1746a4` et `content/corpus/.gitkeep`

**When** la story est terminée

**Then** aucun contenu réel, exemple éditorial, auteur réel, chiffre, organisation, adresse, SIRET ou statut juridique n’est ajouté

**And** les fixtures restent explicitement fictives, en mémoire ou sous `target/`, avec `example.invalid` lorsqu’une URL est nécessaire

**And** `content/corpus/` contient toujours uniquement `.gitkeep`

**And** cette story ne crée ni index corpus, carte, navigation de série ou brief trimestriel (story 2.4)

**And** elle ne crée ni flux Atom, ni `<link rel="alternate">`, ni projection `assistance_ia` de syndication (story 2.5)

**And** elle n’ajoute aucun format APA, Chicago ou BibTeX, aucun téléchargement bibliographique et aucun bouton copier JavaScript obligatoire

**And** elle n’ajoute aucune pièce réelle des stories 2.6 à 2.8.

## Tasks / Subtasks

- [x] **1. Définir une projection canonique unique depuis `CorpusPiece`** (AC1, AC2, AC3)
  - [x] Ajouter un helper ou type de projection renderer-independent qui reçoit `&CorpusPiece` et dérive l’URL depuis `CANONICAL_ORIGIN` et `corpus_route(piece)` ; ne jamais accepter de canonical ou d’URL de citation depuis le YAML.
  - [x] Réutiliser `Nature::label_fr`, `published_date`, `last_review_date`, `author` et `title` ; ne pas dupliquer le contrat éditorial ni reparcourir Markdown/front-matter.
  - [x] Garder une seule source de vérité pour canonical, citation, `og:url`, `url` et `mainEntityOfPage`.
  - [x] Retourner une erreur structurée relative à la pièce si la projection canonique échoue ; aucun `expect` sur une entrée éditoriale non fiable.

- [x] **2. Refactorer le composant existant `CitationBlock` pour « Citer cette page »** (AC1, AC6, AC7)
  - [x] Réutiliser `src/components/citation_block.rs`; ne pas créer un second composant concurrent portant la même responsabilité.
  - [x] Remplacer les props libres `text: String` et `sources: Vec<(String, String)>` par `CorpusPiece` ou par la projection opaque issue de la tâche 1.
  - [x] Remplacer le `<blockquote>` actuel, qui représente une citation de contenu, par une section sémantique avec titre, citation textuelle neutre et permalien.
  - [x] Insérer le composant dans `PieceCorpus` après les sources et avant `.piece-cta`.
  - [x] Adapter la démonstration `/_composants` sans parser ni publier une fixture corpus ; omettre la prévisualisation si aucune instance validée n’est disponible.
  - [x] Ne pas modifier le rendu des citations et liens de sources présents dans le `RenderedMarkdown` : ils restent la responsabilité du pipeline 2.1/2.2.

- [x] **3. Générer les métadonnées Open Graph dédiées aux pièces** (AC2, AC4)
  - [x] Généraliser de façon ciblée `render_html_document` pour recevoir des métadonnées de pièce typées, sans régression sur les pages fixes.
  - [x] Émettre uniquement `og:type`, `og:title`, `og:url`, `article:published_time` et `article:modified_time` pour une pièce.
  - [x] Passer chaque valeur dynamique d’attribut par `escape_html`; ne pas réutiliser l’échappement JSON-LD pour le HTML ni inversement.
  - [x] Préserver l’absence actuelle de description de pièce ; ne pas dériver un résumé depuis le corps, le titre, les sources ou une valeur par défaut.
  - [x] Garantir l’unicité des propriétés et l’égalité canonical/`og:url` par construction puis par test.

- [x] **4. Sérialiser et neutraliser le JSON-LD `Article`** (AC3, AC4)
  - [x] Définir des structures `Serialize` privées correspondant exactement au contrat JSON-LD de l’AC3 ; utiliser `serde_json::to_string`, jamais `format!` pour construire du JSON.
  - [x] Utiliser `Person/name` depuis `CorpusPiece::author()` ; ne pas résoudre `author_member_key` et ne pas inventer d’organisation.
  - [x] Projeter `last_review_date` vers `dateModified`, même sans correction ; projeter `Nature::label_fr()` vers `articleSection`.
  - [x] Après sérialisation, appliquer un helper dédié au contexte script qui neutralise `<`, `>`, `&`, U+2028 et U+2029 avec des échappements JSON valides.
  - [x] Vérifier explicitement que le payload final ne contient aucune séquence littérale `</script` insensible à la casse.
  - [x] Insérer le payload uniquement dans `<script type="application/ld+json">`; aucun `src`, nonce fictif ou script exécutable.
  - [x] Ne jamais appliquer `escape_html` au JSON complet : cela produirait un texte qui ne serait plus le JSON attendu après extraction.

- [x] **5. Faire de la citabilité une prévalidation bloquante avant `dist/`** (AC5)
  - [x] Dans `site-build`, conserver l’ordre actuel : `load_corpus`, puis `select_published_corpus`, avant effets de bord.
  - [x] Pré-rendre ensuite toutes les pages corpus publiées en mémoire et valider chacune avant le bloc qui supprime/recrée `dist/`.
  - [x] Extraire le JSON-LD de chaque document pré-rendu, le parser avec `serde_json::from_str` et comparer sa valeur au contrat exact issu de la pièce.
  - [x] Vérifier aussi présence unique et valeurs attendues du bloc citation, canonical et Open Graph ; préférer une validation structurée issue des fragments typés à un parseur HTML fragile.
  - [x] Conserver les documents pré-rendus validés et les écrire seulement après succès global, plutôt que les générer une seconde fois avec un chemin divergent.
  - [x] Produire un diagnostic relatif et actionnable incluant la propriété absente/dupliquée/incohérente ; préserver l’ancien artefact sur échec.
  - [x] Ne pas déplacer la mesure `.weights.json`, les pages fixes, sitemap, manifeste, redirections ou autres sorties hors de leur chaîne actuelle.

- [x] **6. Adapter les styles sans ajouter de système parallèle** (AC1, AC6)
  - [x] Réutiliser la section `.citation-block` de `assets/components.css`, les tokens existants, la teinte 3 %, la bordure d’autorité et les variables de typographie.
  - [x] Styler la nouvelle section et son lien canonique avec soulignement permanent, focus visible et retour à la ligne sûr pour une URL longue.
  - [x] Ne pas introduire de couleur, police, rayon ou espacement en dur ; conserver les thèmes et `prefers-reduced-motion`.
  - [x] Ne pas ajouter de styles ou comportements de copie tant qu’aucun besoin distinct ne les exige.

- [x] **7. Ajouter une matrice de tests hostile, fictive et non publiée** (AC1 à AC7)
  - [x] Construire toutes les pièces via `parse_piece`, en mémoire ou sous `target/`; conserver `content/corpus/.gitkeep` seul.
  - [x] Tester le bloc exact : auteur, titre, publication, canonical ; vérifier qu’il se situe après les sources et avant le CTA.
  - [x] Tester les cinq propriétés Open Graph, leur unicité, l’échappement HTML du titre hostile et l’égalité `og:url`/canonical.
  - [x] Extraire le texte du bloc JSON-LD, appeler réellement `serde_json::from_str`, puis comparer l’objet complet et exact de l’AC3.
  - [x] Couvrir un titre et un auteur contenant au minimum guillemets, antislash, `</ScRiPt><script>`, `<`, `>`, `&`, U+2028 et U+2029 ; vérifier l’absence de `<`, `>`, `&`, U+2028, U+2029 et de toute séquence littérale `</script` dans le payload, puis la restitution exacte de tous les caractères originaux après parsing JSON.
  - [x] Vérifier qu’un titre hostile n’injecte rien dans `<title>`, `og:title`, `h1` ou la citation et que le document contient exactement un script JSON-LD.
  - [x] Tester les trois natures et la projection `articleSection`; tester `datePublished` distincte de `dateModified`.
  - [x] Tester le préflight multi-pièces : toutes les pièces `Published` sont validées avant écriture, les `Draft` n’ont ni page ni métadonnée, et une divergence simulée conserve un `dist/index.html` sentinelle.
  - [x] Tester le corpus vide et l’absence de fixture dans `dist/content-manifest.json`.
  - [x] Conserver les tests de 2.1 et 2.2, notamment l’unique `dangerous_inner_html`, les collisions de routes et l’absence d’OG/JSON-LD sur un brouillon.

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
  - [x] `cargo deny check licenses sources`
  - [x] `cargo audit`; consigner honnêtement les avertissements autorisés déjà connus, sans les présenter comme corrigés.
  - [x] Vérifier explicitement après build : `content/corpus/` contient seulement `.gitkeep`, aucune fixture n’est dans `dist/`, aucun nouveau `dangerous_inner_html`, aucune sortie Atom/alternate, aucun index/série 2.4.
  - [x] Copier dans le Dev Agent Record les sorties brutes réellement obtenues ; toute commande non exécutée est marquée non exécutée, jamais reconstituée.

## Dev Notes

### Contrat de dérivation

La story doit maintenir une chaîne unique :

```text
CorpusPiece validé
  ├─ canonical = CANONICAL_ORIGIN + corpus_route(piece)
  ├─ citation = author + title + published_date + canonical
  ├─ Open Graph = title + canonical + published_date + last_review_date
  └─ JSON-LD Article = title + author + dates + canonical + nature
```

Aucune de ces valeurs ne vient d’un champ libre `og_*`, `json_ld`, `citation`, `description` ou `canonical` dans le front-matter. Aucun tel champ ne doit être ajouté au schéma YAML. La page n’a toujours pas de résumé typé : l’absence de `description` est conservée au lieu d’en inventer une.

### Sécurité des contextes de sortie

Trois contextes distincts imposent trois traitements distincts :

1. **Nœuds texte Dioxus** (`h1`, citation) : laisser Dioxus échapper le texte ; aucune insertion HTML libre.
2. **Attributs du `<head>`** (`og:title`, canonical) : utiliser `escape_html` pour chaque valeur.
3. **Payload JSON dans `<script>`** : `serde_json::to_string`, puis neutralisation script JSON. Ne jamais utiliser l’échappement HTML sur le JSON complet.

La neutralisation minimale après sérialisation est :

```text
&      -> \u0026
<      -> \u003C
>      -> \u003E
U+2028 -> \u2028
U+2029 -> \u2029
```

Remplacer tous les `<` neutralise aussi `</script>` et ses variantes de casse. Le test décisif ne se limite pas à rechercher une sous-chaîne : il extrait le payload final, le parse avec `serde_json::from_str` et vérifie que les valeurs hostiles originales sont conservées exactement.

### Gate avant effets de bord

`site-build` possède déjà les deux premières étapes correctes : validation du corpus, puis sélection/collisions, avant nettoyage de `dist/`. Cette story étend le préflight : elle rend et valide toutes les pages publiées en mémoire, puis seulement écrit l’artefact. Le corpus vide produit une collection pré-rendue vide et reste un succès.

Le gate ne doit pas dépendre d’une pièce réelle. Ses tests utilisent plusieurs `CorpusPiece` fictifs. Une erreur cite `content/corpus/YYYY-slug.md` et une règle telle que `jsonld.author.name` ou `open_graph.og:title`, jamais le worktree absolu ni le corps complet.

### État actuel des fichiers à modifier

#### `src/domain.rs` — UPDATE ciblé

- **État actuel :** contient `CorpusPiece` et ses accesseurs typés, `Nature::label_fr`, `CANONICAL_ORIGIN`, `corpus_route`, la sélection `Published` et les collisions déterministes.
- **Changement attendu :** centraliser au besoin la projection canonique et les données de citabilité dérivées ; garder le domaine sans Dioxus.
- **À préserver :** encapsulation des champs, `RenderedMarkdown`, huit `SitePage::PUBLISHED`, routes et diagnostics de collision.

#### `src/editorial.rs` — REVIEW, aucune extension de schéma attendue

- **État actuel :** seul producteur normal de `CorpusPiece`; front-matter strict, dates/URLs typées, Markdown sûr et diagnostics relatifs.
- **Changement attendu :** aucun champ `citation`, OG, JSON-LD, résumé ou canonical. Une modification n’est justifiée que par un test de sécurité qui révèle une faiblesse d’entrée réelle.
- **À préserver :** toutes les validations 2.1/2.2, les sources liées, le refus HTML et le titre `h1` normalisé.

#### `src/components/citation_block.rs` — UPDATE

- **État actuel :** `CitationBlockProps` accepte `text: String`, une liste libre de sources et des enfants ; rend un `<blockquote>` de citation de fait. Il est exposé dans la démonstration, mais n’est pas utilisé par `PieceCorpus`.
- **Changement attendu :** devenir le bloc « Citer cette page » dérivé du `CorpusPiece`, avec section, titre, texte bibliographique neutre et canonical.
- **À préserver :** nom/module existant et styles de base utiles ; ne pas créer un doublon.

#### `src/components/piece_corpus.rs` — UPDATE

- **État actuel :** projette directement `CorpusPiece` dans l’ordre en-tête, corrections, prose, transparence, sources, CTA. L’unique `dangerous_inner_html` reçoit `RenderedMarkdown`.
- **Changement attendu :** insérer `CitationBlock` après les sources et avant le CTA.
- **À préserver :** tout le rendu 2.2, le CTA exact, les corrections, sources, dates et l’unique frontière HTML sûre.

#### `src/lib.rs` — UPDATE

- **État actuel :** `render_corpus_document` produit un canonical et un `<title>` échappés, sans description ni OG/JSON-LD de pièce. `render_html_document` génère les OG génériques seulement lorsqu’une description existe. `escape_html` centralise l’échappement d’attributs.
- **Changement attendu :** accepter une projection head dédiée aux pièces, générer les cinq propriétés OG et le JSON-LD sûr, sans affecter les pages fixes.
- **À préserver :** shell, navigation, noindex de `/_composants`, pages fixes, absence d’Atom et absence de description inventée.

#### `src/bin/site-build.rs` — UPDATE

- **État actuel :** charge et sélectionne les pièces avant `remove_dir_all`, mais rend les documents corpus après le nettoyage ; sitemap et manifeste consomment la sélection publiée.
- **Changement attendu :** pré-rendre et valider toutes les pages corpus avant nettoyage, puis écrire les documents validés.
- **À préserver :** sélection `Published`, ordre de route, collisions, pages fixes, utilitaires, mesure et injection des poids.

#### `assets/components.css` — UPDATE ciblé

- **État actuel :** `.citation-block` porte déjà la teinte 3 %, la bordure gauche et les tokens ; `.citation-sources` correspond à l’ancien composant. Les styles de pièce couvrent sources et CTA.
- **Changement attendu :** adapter le bloc sémantique et le lien canonique, sans système visuel parallèle.
- **À préserver :** tokens, thèmes, responsive, focus et styles de page 2.2.

#### `tests/corpus_page.rs` — PRESERVE / UPDATE

- **État actuel :** 14 tests fictifs couvrent rendu de pièce, corrections, sources, CTA, canonical, absence volontaire d’OG/JSON-LD 2.3, brouillons, styles et collisions.
- **Changement attendu :** remplacer l’assertion d’absence 2.3 par les invariants de présence, exactitude et sécurité ; conserver toutes les autres preuves.

#### `tests/editorial_pipeline.rs` — PRESERVE

- **État actuel :** 27 tests fictifs couvrent le domaine d’entrée et garantissent que `content/corpus/` contient seulement `.gitkeep`.
- **Changement attendu :** aucun sauf régression d’entrée strictement nécessaire ; ne pas déplacer les tests de head dans le pipeline Markdown.

#### `content/corpus/.gitkeep` — UNTOUCHED

Aucun contenu ou fixture ne doit être ajouté à ce répertoire.

### Project Structure Notes

Fichiers attendus pour l’implémentation :

```text
src/domain.rs                                  UPDATE ciblé
src/editorial.rs                               REVIEW seulement attendu
src/components/citation_block.rs               UPDATE
src/components/piece_corpus.rs                 UPDATE
src/components/mod.rs                          PRESERVE
src/lib.rs                                     UPDATE
src/bin/site-build.rs                          UPDATE
assets/components.css                          UPDATE ciblé
tests/corpus_page.rs                           UPDATE
tests/corpus_citability.rs                     NEW optionnel si la séparation améliore la lisibilité
tests/editorial_pipeline.rs                    PRESERVE
content/corpus/.gitkeep                        UNTOUCHED
Cargo.toml / Cargo.lock                        PRESERVE
```

Aucun fichier n’est à supprimer. Ne pas créer de crate, workspace, parser HTML, bibliothèque de métadonnées ou dépendance supplémentaire pour cet incrément.

### Bibliothèques et versions

Aucune dépendance ne doit être ajoutée ou mise à jour. Utiliser les versions déjà fixées par `Cargo.toml`/`Cargo.lock` sur la baseline :

| Bibliothèque | Version/configuration | Usage dans cette story |
|---|---|---|
| Dioxus / dioxus-ssr | 0.7.9 | composant et rendu statique existants |
| Serde | 1.x, derive déjà activé | structures JSON-LD privées |
| serde_json | 1.x verrouillé | sérialisation et parsing de validation |
| chrono | 0.4.45 | dates `NaiveDate` déjà validées |
| url | 2.5.8 | canonical typé si nécessaire |

Le JSON-LD est une chaîne de données statique, pas une dépendance JavaScript. Aucun SDK schema.org ou Open Graph n’est nécessaire.

### Exigences de tests

- Les fixtures hostiles doivent rester du texte de test explicitement fictif ; aucune valeur n’entre dans `content/` ou dans un artefact conservé.
- Tester les valeurs sémantiques après parsing, pas seulement des sous-chaînes échappées.
- Pour le JSON-LD, séparer les assertions « payload sûr dans HTML » et « JSON exact après extraction ».
- Pour Open Graph, vérifier le nombre d’occurrences afin de prévenir la coexistence des OG génériques et dédiées.
- Vérifier la non-régression des pages fixes et de `/_composants`.
- Vérifier le fail-before-dist avec un artefact sentinelle sous `target/`; ne jamais utiliser le `dist/` du dépôt comme fixture destructive.
- Un build réel avec corpus vide prouve la non-régression, mais pas la citabilité : la matrice en mémoire avec pièces `Published` est obligatoire.

### Previous Story Intelligence

La story 2.1 établit :

- `CorpusPiece` est le contrat unique et ses champs nécessaires sont déjà strictement validés et typés ;
- `RenderedMarkdown` est opaque, l’HTML éditorial brut est refusé et les diagnostics sont relatifs ;
- les fixtures vivent en mémoire ou sous `target/`, tandis que `content/corpus/` reste `.gitkeep` ;
- tout le corpus est validé avant le premier effet de bord de build.

La story 2.2 ajoute :

- une route stable `/corpus/<slug>/` dérivée du slug et un canonical déjà échappé ;
- une sélection `Published` déterministe et des collisions refusées avant nettoyage de `dist/` ;
- `PieceCorpus` projette directement le domaine et ne possède plus de bloc citation factice ;
- la page n’a volontairement ni description, ni OG dédié, ni JSON-LD, ni Atom ;
- le publisher écrit encore les pages corpus après nettoyage : le pré-rendu complet doit donc être déplacé avant cet effet de bord pour satisfaire la nouvelle gate ;
- l’unique `dangerous_inner_html` est borné à `piece.rendered_body().as_str()` et doit le rester.

### Scope Guardrails

- Chemins contenant `/.claude/worktrees/impl-bmad/` uniquement pendant le travail ; tout autre arbre est interdit.
- Aucune commande Git de mutation : jamais `checkout`, `restore`, `reset`, `clean`, `stash`; pas de commit.
- Les suppressions de fichiers sont listées avant décision ; aucune suppression n’est requise ici.
- Zéro contenu inventé : aucune affirmation invérifiable, aucun chiffre saisi à la main, aucun nom client, organisation réelle, adresse, SIRET ou statut juridique.
- Aucune pièce réelle et aucune fixture sous `content/corpus/`; mémoire ou `target/` uniquement.
- Sécurité > qualité > performance > complétude.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.3, FR-4, AR-2]
- [Source: `_bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md` — §4.1 FR-4, §10 NFR-7/NFR-11/NFR-12]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md` — AD-3(a), AD-8(1a), Consistency Conventions, Capability Map]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md` — Citation Block, Typography, pratiques]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md` — pièce-de-corpus, citation-block, sans JS, accessibilité]
- [Source: `TARGET.md` — exigence de vérité, cible technique et publication statique]
- [Source: `docs/adr/0007-dioxus-clean-rebuild.md` — domaine indépendant, publication statique, Markdown strict]
- [Source: `docs/adr/0008-domaines-publics-et-gates-par-produit.md` — origine canonique `https://libre-ai.fr`]
- [Source: `_bmad-output/implementation-artifacts/2-1-gabarit-type-et-pipeline-markdown.md` — contrat typé, pipeline et sécurité]
- [Source: `_bmad-output/implementation-artifacts/2-2-page-piece-de-corpus.md` — rendu public, publication et frontières 2.3]
- [Source: `Cargo.toml`, `src/domain.rs`, `src/editorial.rs`, `src/components/citation_block.rs`, `src/components/piece_corpus.rs`, `src/components/mod.rs`, `src/lib.rs`, `src/bin/site-build.rs`, `assets/components.css`, `tests/editorial_pipeline.rs`, `tests/corpus_page.rs` — état courant lu le 2026-07-14]

## Dev Agent Record

### Agent Model Used

Non exposé par le harnais de cette session.

### Debug Log References

#### Plan d’implémentation exécuté

- Projection fermée `CorpusCitability` dans le domaine, puis consommation par citation, head et validation.
- Composition OG/JSON-LD dédiée aux pièces, avec échappement HTML et neutralisation du contexte script séparés.
- Pré-rendu et gate de cohérence de toutes les pièces publiées avant toute suppression ou écriture de `dist/`.
- Matrice hostile en mémoire, tests de sentinelle, styles existants adaptés, puis gates complètes.

#### Cycles RED → GREEN réellement observés

```text
error[E0432]: unresolved import `libre_ai_website::domain::CorpusCitability`
test published_piece_projects_typed_identity_prose_sources_and_cta ... FAILED
assertion `left == right` failed: metadata: <meta property="og:type" content="article">
error[E0425]: cannot find function `build_site_at_with_renderer` in this scope
test corpus_styles_use_existing_tokens_and_cover_accessible_long_form_content ... FAILED
style requis absent: .citation-block h2
error[E0425]: cannot find type `CorpusCitabilityError` in this scope
```

Chaque échec ci-dessus a été suivi du test ciblé vert, puis des suites complètes ci-dessous.

Deux premières passes E2E ont révélé le comportement WebKit/macOS où `Tab` seul laisse le focus sur `BODY`. Le test clavier utilise désormais `Alt+Tab` uniquement pour WebKit sur macOS ; la passe finale brute est verte sur les quatre projets.

#### Sorties brutes des vérifications finales

La sortie `npm run build` ci-dessous omet uniquement la ligne `Running from` de Pagefind afin de respecter l’interdiction de versionner un chemin machine-local. Toutes les autres lignes sont reproduites telles qu’obtenues. `cargo audit` a d’abord été exécuté exactement, puis réexécuté avec une base sous `target/` pour pouvoir consigner une sortie brute sans chemin machine-local.

- `cargo fmt --check` :

```text
(aucune sortie)
```

- `cargo test --no-default-features --features static` :

```text
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.10s
     Running unittests src/lib.rs (target/debug/deps/libre_ai_website-c488358828198270)

running 5 tests
test domain::tests::canonical_origin_is_https_apex ... ok
test domain::tests::paths_unique ... ok
test tests::metadata_is_escaped_before_head_insertion ... ok
test tests::public_copy_does_not_claim_mobile_availability ... ok
test tests::every_page_renders_semantic_document_content ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/libre_ai_website-7302895fc7466da3)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/bin/site-build.rs (target/debug/deps/site_build-41d4f7eff1dff962)

running 7 tests
test tests::htaccess_redirects_every_legacy_route ... ok
test tests::llms_txt_describes_the_new_site ... ok
test tests::static_metadata_covers_every_published_page ... ok
test tests::dynamic_manifest_and_sitemap_use_only_the_published_selection ... ok
test tests::duplicate_routes_fail_before_the_existing_dist_is_touched ... ok
test tests::citability_divergence_fails_before_the_existing_dist_is_touched ... ok
test tests::corpus_preflight_renders_only_selected_published_pieces_and_accepts_empty ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/corpus_page.rs (target/debug/deps/corpus_page-3ca2d01d923876e8)

running 20 tests
test draft_rendering_is_explicitly_refused ... ok
test citability_projection_has_one_canonical_source_of_truth ... ok
test duplicate_published_slugs_report_sorted_relative_paths ... ok
test fixed_pages_keep_generic_open_graph_without_piece_metadata ... ok
test corpus_document_escapes_dynamic_title_values ... ok
test one_correction_renders_its_exact_note_date_and_archive ... ok
test all_corrections_render_newest_first_without_mutating_domain_order ... ok
test citability_gate_rejects_a_literal_script_context_character ... ok
test hostile_head_and_json_ld_values_are_safe_and_round_trip_exactly ... ok
test rendered_markdown_boundary_has_one_non_public_validated_insertion_path ... ok
test components_demo_contains_no_piece_fixture_or_invented_proof ... ok
test published_piece_projects_typed_identity_prose_sources_and_cta ... ok
test corpus_styles_use_existing_tokens_and_cover_accessible_long_form_content ... ok
test corpus_document_uses_exact_piece_metadata_and_static_shell ... ok
test zero_corrections_emit_no_empty_or_fictitious_correction_ui ... ok
test typed_assistance_and_figures_method_are_rendered_without_substitution ... ok
test published_selection_excludes_drafts_and_sorts_by_route ... ok
test typed_header_corrections_and_prose_are_semantic ... ok
test citability_gate_reports_missing_duplicate_invalid_and_divergent_rules ... ok
test all_natures_project_the_standard_article_section ... ok

test result: ok. 20 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/editorial_pipeline.rs (target/debug/deps/editorial_pipeline-f7a837532e612cb8)

running 27 tests
test invalid_corpus_path_is_rejected ... ok
test a_source_link_removed_with_the_markdown_h1_does_not_count_as_a_body_link ... ok
test complete_fixture_becomes_typed_and_safely_rendered ... ok
test declared_sources_must_be_markdown_link_destinations ... ok
test internal_markdown_links_are_permitted ... ok
test a_second_markdown_h1_is_rejected_even_when_both_match ... ok
test frontmatter_slug_must_match_path_suffix ... ok
test invalid_files_are_aggregated_sorted_and_redacted ... ok
test impossible_and_reversed_dates_are_rejected ... ok
test malformed_frontmatter_empty_body_and_invalid_utf8_are_rejected ... ok
test missing_nature_has_relative_actionable_diagnostic ... ok
test publication_year_must_match_path_prefix ... ok
test duplicate_unknown_missing_blank_and_empty_sources_are_rejected ... ok
test schema_errors_are_located_and_paths_are_redacted ... ok
test markdown_h1_visible_text_must_exactly_match_the_typed_title ... ok
test test_fixtures_are_not_public_corpus_or_manifest_entries ... ok
test matching_markdown_h1_is_removed_and_an_absent_h1_is_accepted ... ok
test correction_dates_must_be_bounded_and_strictly_increasing ... ok
test image_requires_non_empty_alt_and_local_destination ... ok
test assistance_sources_and_corrections_are_fully_typed_and_strict ... ok
test markdown_heading_hierarchy_must_not_skip_levels ... ok
test undeclared_external_https_links_are_rejected ... ok
test yaml_ambiguous_scalars_and_merge_keys_are_rejected ... ok
test optional_keys_must_be_present_and_present_values_are_validated ... ok
test protocol_relative_data_and_file_destinations_are_rejected ... ok
test raw_html_and_dangerous_links_are_rejected ... ok
test loader_is_empty_or_sorted_by_relative_path ... ok

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests libre_ai_website

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

- `cargo test --release --no-default-features --features static` :

```text
    Finished `release` profile [optimized] target(s) in 0.11s
     Running unittests src/lib.rs (target/release/deps/libre_ai_website-2a7e2ac978214ace)

running 5 tests
test domain::tests::canonical_origin_is_https_apex ... ok
test domain::tests::paths_unique ... ok
test tests::public_copy_does_not_claim_mobile_availability ... ok
test tests::metadata_is_escaped_before_head_insertion ... ok
test tests::every_page_renders_semantic_document_content ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/release/deps/libre_ai_website-bb03815f8b83a625)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/bin/site-build.rs (target/release/deps/site_build-22434d6578bb10dc)

running 7 tests
test tests::htaccess_redirects_every_legacy_route ... ok
test tests::llms_txt_describes_the_new_site ... ok
test tests::static_metadata_covers_every_published_page ... ok
test tests::dynamic_manifest_and_sitemap_use_only_the_published_selection ... ok
test tests::corpus_preflight_renders_only_selected_published_pieces_and_accepts_empty ... ok
test tests::duplicate_routes_fail_before_the_existing_dist_is_touched ... ok
test tests::citability_divergence_fails_before_the_existing_dist_is_touched ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/corpus_page.rs (target/release/deps/corpus_page-b1d3e23aee8ae00c)

running 20 tests
test corpus_styles_use_existing_tokens_and_cover_accessible_long_form_content ... ok
test citability_projection_has_one_canonical_source_of_truth ... ok
test draft_rendering_is_explicitly_refused ... ok
test duplicate_published_slugs_report_sorted_relative_paths ... ok
test fixed_pages_keep_generic_open_graph_without_piece_metadata ... ok
test components_demo_contains_no_piece_fixture_or_invented_proof ... ok
test corpus_document_escapes_dynamic_title_values ... ok
test rendered_markdown_boundary_has_one_non_public_validated_insertion_path ... ok
test citability_gate_rejects_a_literal_script_context_character ... ok
test hostile_head_and_json_ld_values_are_safe_and_round_trip_exactly ... ok
test all_corrections_render_newest_first_without_mutating_domain_order ... ok
test one_correction_renders_its_exact_note_date_and_archive ... ok
test corpus_document_uses_exact_piece_metadata_and_static_shell ... ok
test published_piece_projects_typed_identity_prose_sources_and_cta ... ok
test published_selection_excludes_drafts_and_sorts_by_route ... ok
test typed_assistance_and_figures_method_are_rendered_without_substitution ... ok
test zero_corrections_emit_no_empty_or_fictitious_correction_ui ... ok
test typed_header_corrections_and_prose_are_semantic ... ok
test citability_gate_reports_missing_duplicate_invalid_and_divergent_rules ... ok
test all_natures_project_the_standard_article_section ... ok

test result: ok. 20 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/editorial_pipeline.rs (target/release/deps/editorial_pipeline-d4df32daae6d58e4)

running 27 tests
test invalid_corpus_path_is_rejected ... ok
test declared_sources_must_be_markdown_link_destinations ... ok
test frontmatter_slug_must_match_path_suffix ... ok
test a_second_markdown_h1_is_rejected_even_when_both_match ... ok
test a_source_link_removed_with_the_markdown_h1_does_not_count_as_a_body_link ... ok
test complete_fixture_becomes_typed_and_safely_rendered ... ok
test internal_markdown_links_are_permitted ... ok
test image_requires_non_empty_alt_and_local_destination ... ok
test impossible_and_reversed_dates_are_rejected ... ok
test duplicate_unknown_missing_blank_and_empty_sources_are_rejected ... ok
test missing_nature_has_relative_actionable_diagnostic ... ok
test malformed_frontmatter_empty_body_and_invalid_utf8_are_rejected ... ok
test matching_markdown_h1_is_removed_and_an_absent_h1_is_accepted ... ok
test correction_dates_must_be_bounded_and_strictly_increasing ... ok
test publication_year_must_match_path_prefix ... ok
test invalid_files_are_aggregated_sorted_and_redacted ... ok
test markdown_h1_visible_text_must_exactly_match_the_typed_title ... ok
test schema_errors_are_located_and_paths_are_redacted ... ok
test assistance_sources_and_corrections_are_fully_typed_and_strict ... ok
test markdown_heading_hierarchy_must_not_skip_levels ... ok
test optional_keys_must_be_present_and_present_values_are_validated ... ok
test protocol_relative_data_and_file_destinations_are_rejected ... ok
test yaml_ambiguous_scalars_and_merge_keys_are_rejected ... ok
test test_fixtures_are_not_public_corpus_or_manifest_entries ... ok
test undeclared_external_https_links_are_rejected ... ok
test raw_html_and_dangerous_links_are_rejected ... ok
test loader_is_empty_or_sorted_by_relative_path ... ok

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests libre_ai_website

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

- `cargo clippy --all-targets --no-default-features --features static -- -D warnings` :

```text
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.10s
```

- `cargo check --target wasm32-unknown-unknown --bin libre-ai-website` :

```text
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.11s
```

- `cargo build --release --no-default-features --features static` :

```text
    Finished `release` profile [optimized] target(s) in 0.10s
```

- `cargo run --release --no-default-features --features static --bin site-build` :

```text
    Finished `release` profile [optimized] target(s) in 0.11s
     Running `target/release/site-build`
✓ Measurement complete
  Page size: 57 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T17:52:13Z
  Output: dist/.weights.json
site-build: 8 pages publiées dans dist/
```

- `./target/release/site-build (seconde passe)` :

```text
✓ Measurement complete
  Page size: 57 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T17:52:17Z
  Output: dist/.weights.json
site-build: 8 pages publiées dans dist/
```

- `npm run build` :

```text

> build
> bash scripts/build-static.sh

✓ Measurement complete
  Page size: 57 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T17:52:28Z
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
  Indexed 325 words
  Indexed 0 filters
  Indexed 0 sorts

Finished in 0.005 seconds
static-smoke: PASS (14 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
```

- `bash scripts/static-smoke.sh` :

```text
static-smoke: PASS (14 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
```

- `python3 scripts/check-current-topology.py` :

```text
check-current-topology: PASS (canonical origin libre-ai.fr, 7 legacy 301s, routes clean, brand libre-ai)
```

- `python3 -m unittest discover scripts/tests -v` :

```text
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

- `python3 scripts/publication_gates.py (fail-closed attendu)` :

```text
publication gates: FAIL — LIBRE_AI_WEBSITE_APPROVED must be set to 1 (human approval required)
exit code: 1
```

- `LIBRE_AI_WEBSITE_APPROVED=1 python3 scripts/publication_gates.py` :

```text
publication gates: PASS — Website approved and dist/ ready for deployment
```

- `npm run check` :

```text

> check
> cargo fmt --all --check && cargo clippy --lib --no-default-features --features static -- -D warnings && cargo check --target wasm32-unknown-unknown --bin libre-ai-website

    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.13s
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.15s
```

- `npm test` :

```text

> test
> cargo test --lib --no-default-features --features static && cargo test --bin site-build --no-default-features --features static && python3 -m unittest discover scripts/tests -v

    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.11s
     Running unittests src/lib.rs (target/debug/deps/libre_ai_website-c488358828198270)

running 5 tests
test domain::tests::canonical_origin_is_https_apex ... ok
test domain::tests::paths_unique ... ok
test tests::metadata_is_escaped_before_head_insertion ... ok
test tests::public_copy_does_not_claim_mobile_availability ... ok
test tests::every_page_renders_semantic_document_content ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.10s
     Running unittests src/bin/site-build.rs (target/debug/deps/site_build-41d4f7eff1dff962)

running 7 tests
test tests::htaccess_redirects_every_legacy_route ... ok
test tests::static_metadata_covers_every_published_page ... ok
test tests::llms_txt_describes_the_new_site ... ok
test tests::dynamic_manifest_and_sitemap_use_only_the_published_selection ... ok
test tests::duplicate_routes_fail_before_the_existing_dist_is_touched ... ok
test tests::citability_divergence_fails_before_the_existing_dist_is_touched ... ok
test tests::corpus_preflight_renders_only_selected_published_pieces_and_accepts_empty ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

test_dist_must_contain_required_files (test_publication_gates.PublicationGatesTest.test_dist_must_contain_required_files)
If dist/ exists, it must contain index.html, .htaccess, sitemap.xml, mentions-legales/index.html. ... ok
test_env_var_value_must_be_exactly_1 (test_publication_gates.PublicationGatesTest.test_env_var_value_must_be_exactly_1)
Env var must be exactly '1', not 'true' or other values. ... ok
test_website_approves_with_env_var_when_dist_absent (test_publication_gates.PublicationGatesTest.test_website_approves_with_env_var_when_dist_absent)
With LIBRE_AI_WEBSITE_APPROVED=1 and no dist/, gate passes. ... ok
test_website_requires_explicit_approval_env_var (test_publication_gates.PublicationGatesTest.test_website_requires_explicit_approval_env_var)
Without LIBRE_AI_WEBSITE_APPROVED=1, gate fails. ... ok

----------------------------------------------------------------------
Ran 4 tests in 0.001s

OK
```

- `npm run e2e` :

```text

> e2e
> playwright test

[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET / HTTP/1.1" 200 -

Running 24 tests using 7 workers

  ✓   1 [chromium] › e2e/site.spec.ts:36:5 › dist/.htaccess contains 7 legacy route 301 redirects (6ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /_composants HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /_composants/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /offres HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /offres/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /corpus HTTP/1.1" 301 -
  ✓   4 [chromium] › e2e/site.spec.ts:26:5 › components demo page is available (11ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /corpus/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /collectif HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /collectif/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /interventions HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /interventions/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /chaine-maitrisee HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /chaine-maitrisee/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /rdv HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /rdv/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /mentions-legales HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /mentions-legales/ HTTP/1.1" 200 -
  ✓   6 [chromium] › e2e/site.spec.ts:9:5 › 8 published pages are accessible (26ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /mentions-legales HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /mentions-legales/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
  ✓   2 [chromium] › e2e/site.spec.ts:31:5 › mentions-legales page contains required notice (101ms)
  ✓   5 [chromium] › e2e/site.spec.ts:3:5 › home page loads and displays Libre IA branding (117ms)
  ✓   3 [chromium] › e2e/site.spec.ts:53:5 › keyboard navigation from home reaches a link (121ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /offres HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /offres/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /corpus HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /corpus/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /_composants HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /_composants/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /collectif HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /collectif/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /interventions HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /interventions/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /chaine-maitrisee HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /chaine-maitrisee/ HTTP/1.1" 200 -
  ✓   9 [firefox] › e2e/site.spec.ts:26:5 › components demo page is available (14ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /rdv HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /rdv/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /mentions-legales HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /mentions-legales/ HTTP/1.1" 200 -
  ✓   8 [firefox] › e2e/site.spec.ts:9:5 › 8 published pages are accessible (31ms)
  ✓  11 [firefox] › e2e/site.spec.ts:36:5 › dist/.htaccess contains 7 legacy route 301 redirects (4ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /_composants HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /_composants/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET / HTTP/1.1" 200 -
  ✓  14 [webkit] › e2e/site.spec.ts:26:5 › components demo page is available (14ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /offres HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /offres/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /corpus HTTP/1.1" 301 -
  ✓  16 [webkit] › e2e/site.spec.ts:36:5 › dist/.htaccess contains 7 legacy route 301 redirects (3ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /corpus/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /collectif HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /collectif/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /interventions HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /interventions/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /chaine-maitrisee HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /chaine-maitrisee/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /rdv HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /rdv/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /mentions-legales HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:07] "GET /mentions-legales/ HTTP/1.1" 200 -
  ✓  15 [webkit] › e2e/site.spec.ts:9:5 › 8 published pages are accessible (31ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /manifest.webmanifest HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
  ✓  12 [webkit] › e2e/site.spec.ts:3:5 › home page loads and displays Libre IA branding (420ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /manifest.webmanifest HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
  ✓  17 [webkit] › e2e/site.spec.ts:53:5 › keyboard navigation from home reaches a link (398ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
  ✓  19 [mobile] › e2e/site.spec.ts:3:5 › home page loads and displays Libre IA branding (106ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /mentions-legales HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /mentions-legales/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /mentions-legales HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/favicon.png HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /mentions-legales/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
  ✓  20 [mobile] › e2e/site.spec.ts:31:5 › mentions-legales page contains required notice (89ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /manifest.webmanifest HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
  ✓  21 [mobile] › e2e/site.spec.ts:36:5 › dist/.htaccess contains 7 legacy route 301 redirects (3ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
  ✓  18 [webkit] › e2e/site.spec.ts:31:5 › mentions-legales page contains required notice (427ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
  ✓  22 [mobile] › e2e/site.spec.ts:53:5 › keyboard navigation from home reaches a link (80ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /offres HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /offres/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /corpus HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /corpus/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /collectif HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /collectif/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /interventions HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /interventions/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /chaine-maitrisee HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /chaine-maitrisee/ HTTP/1.1" 200 -
  ✓   7 [firefox] › e2e/site.spec.ts:3:5 › home page loads and displays Libre IA branding (957ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /rdv HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /rdv/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /mentions-legales HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /mentions-legales/ HTTP/1.1" 200 -
  ✓  23 [mobile] › e2e/site.spec.ts:9:5 › 8 published pages are accessible (34ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /_composants HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /_composants/ HTTP/1.1" 200 -
  ✓  24 [mobile] › e2e/site.spec.ts:26:5 › components demo page is available (12ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /mentions-legales HTTP/1.1" 301 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /mentions-legales/ HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/favicon.png HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:08] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
  ✓  10 [firefox] › e2e/site.spec.ts:31:5 › mentions-legales page contains required notice (842ms)
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET / HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/fonts/fonts.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/tokens.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/themes.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/components.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/site.css HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/brand/libre-ai-icon-light.svg HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/favicon.png HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/fonts/plus-jakarta-sans-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/fonts/inter-latin-700-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/fonts/inter-latin-800-normal.woff2 HTTP/1.1" 200 -
[WebServer] 127.0.0.1 - - [14/Jul/2026 19:54:09] "GET /assets/fonts/inter-latin-400-normal.woff2 HTTP/1.1" 200 -
  ✓  13 [firefox] › e2e/site.spec.ts:53:5 › keyboard navigation from home reaches a link (547ms)

  24 passed (3.2s)
```

- `cargo deny check licenses sources` :

```text
licenses ok, sources ok
```

- `cargo audit --db target/story-2-3-advisory-db` :

```text
    Fetching advisory database from `https://github.com/RustSec/advisory-db.git`
      Loaded 1160 security advisories (from target/story-2-3-advisory-db)
    Updating crates.io index
    Scanning Cargo.lock for vulnerabilities (620 crate dependencies)
Crate:     atk
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0413
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0413
Dependency tree:
atk 0.18.2
└── gtk 0.18.2
    ├── wry 0.53.5
    │   └── dioxus-desktop 0.7.9
    │       └── dioxus 0.7.9
    │           └── libre-ai-website 0.1.0
    ├── webkit2gtk 2.0.1
    │   └── wry 0.53.5
    ├── tao 0.34.8
    │   └── dioxus-desktop 0.7.9
    ├── muda 0.17.2
    │   ├── tray-icon 0.21.3
    │   │   └── dioxus-desktop 0.7.9
    │   └── dioxus-desktop 0.7.9
    └── libappindicator 0.9.0
        └── tray-icon 0.21.3

Crate:     atk-sys
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0416
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0416
Dependency tree:
atk-sys 0.18.2
├── gtk-sys 0.18.2
│   ├── webkit2gtk-sys 2.0.1
│   │   ├── wry 0.53.5
│   │   │   └── dioxus-desktop 0.7.9
│   │   │       └── dioxus 0.7.9
│   │   │           └── libre-ai-website 0.1.0
│   │   └── webkit2gtk 2.0.1
│   │       └── wry 0.53.5
│   ├── webkit2gtk 2.0.1
│   ├── libappindicator-sys 0.9.0
│   │   └── libappindicator 0.9.0
│   │       └── tray-icon 0.21.3
│   │           └── dioxus-desktop 0.7.9
│   ├── libappindicator 0.9.0
│   └── gtk 0.18.2
│       ├── wry 0.53.5
│       ├── webkit2gtk 2.0.1
│       ├── tao 0.34.8
│       │   └── dioxus-desktop 0.7.9
│       ├── muda 0.17.2
│       │   ├── tray-icon 0.21.3
│       │   └── dioxus-desktop 0.7.9
│       └── libappindicator 0.9.0
└── atk 0.18.2
    └── gtk 0.18.2

Crate:     fxhash
Version:   0.2.1
Warning:   unmaintained
Title:     fxhash - no longer maintained
Date:      2025-09-05
ID:        RUSTSEC-2025-0057
URL:       https://rustsec.org/advisories/RUSTSEC-2025-0057
Dependency tree:
fxhash 0.2.1
└── selectors 0.24.0
    └── kuchikiki 0.8.8-speedreader
        └── wry 0.53.5
            └── dioxus-desktop 0.7.9
                └── dioxus 0.7.9
                    └── libre-ai-website 0.1.0

Crate:     gdk
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0412
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0412
Dependency tree:
gdk 0.18.2
├── webkit2gtk 2.0.1
│   └── wry 0.53.5
│       └── dioxus-desktop 0.7.9
│           └── dioxus 0.7.9
│               └── libre-ai-website 0.1.0
└── gtk 0.18.2
    ├── wry 0.53.5
    ├── webkit2gtk 2.0.1
    ├── tao 0.34.8
    │   └── dioxus-desktop 0.7.9
    ├── muda 0.17.2
    │   ├── tray-icon 0.21.3
    │   │   └── dioxus-desktop 0.7.9
    │   └── dioxus-desktop 0.7.9
    └── libappindicator 0.9.0
        └── tray-icon 0.21.3

Crate:     gdk-sys
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0418
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0418
Dependency tree:
gdk-sys 0.18.2
├── webkit2gtk-sys 2.0.1
│   ├── wry 0.53.5
│   │   └── dioxus-desktop 0.7.9
│   │       └── dioxus 0.7.9
│   │           └── libre-ai-website 0.1.0
│   └── webkit2gtk 2.0.1
│       └── wry 0.53.5
├── webkit2gtk 2.0.1
├── gtk-sys 0.18.2
│   ├── webkit2gtk-sys 2.0.1
│   ├── webkit2gtk 2.0.1
│   ├── libappindicator-sys 0.9.0
│   │   └── libappindicator 0.9.0
│   │       └── tray-icon 0.21.3
│   │           └── dioxus-desktop 0.7.9
│   ├── libappindicator 0.9.0
│   └── gtk 0.18.2
│       ├── wry 0.53.5
│       ├── webkit2gtk 2.0.1
│       ├── tao 0.34.8
│       │   └── dioxus-desktop 0.7.9
│       ├── muda 0.17.2
│       │   ├── tray-icon 0.21.3
│       │   └── dioxus-desktop 0.7.9
│       └── libappindicator 0.9.0
├── gdkx11-sys 0.18.2
│   └── tao 0.34.8
├── gdkwayland-sys 0.18.2
│   └── tao 0.34.8
└── gdk 0.18.2
    ├── webkit2gtk 2.0.1
    └── gtk 0.18.2

Crate:     gdkwayland-sys
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0411
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0411
Dependency tree:
gdkwayland-sys 0.18.2
└── tao 0.34.8
    └── dioxus-desktop 0.7.9
        └── dioxus 0.7.9
            └── libre-ai-website 0.1.0

Crate:     gdkx11-sys
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0414
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0414
Dependency tree:
gdkx11-sys 0.18.2
└── tao 0.34.8
    └── dioxus-desktop 0.7.9
        └── dioxus 0.7.9
            └── libre-ai-website 0.1.0

Crate:     gtk
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0415
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0415
Dependency tree:
gtk 0.18.2
├── wry 0.53.5
│   └── dioxus-desktop 0.7.9
│       └── dioxus 0.7.9
│           └── libre-ai-website 0.1.0
├── webkit2gtk 2.0.1
│   └── wry 0.53.5
├── tao 0.34.8
│   └── dioxus-desktop 0.7.9
├── muda 0.17.2
│   ├── tray-icon 0.21.3
│   │   └── dioxus-desktop 0.7.9
│   └── dioxus-desktop 0.7.9
└── libappindicator 0.9.0
    └── tray-icon 0.21.3

Crate:     gtk-sys
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0420
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0420
Dependency tree:
gtk-sys 0.18.2
├── webkit2gtk-sys 2.0.1
│   ├── wry 0.53.5
│   │   └── dioxus-desktop 0.7.9
│   │       └── dioxus 0.7.9
│   │           └── libre-ai-website 0.1.0
│   └── webkit2gtk 2.0.1
│       └── wry 0.53.5
├── webkit2gtk 2.0.1
├── libappindicator-sys 0.9.0
│   └── libappindicator 0.9.0
│       └── tray-icon 0.21.3
│           └── dioxus-desktop 0.7.9
├── libappindicator 0.9.0
└── gtk 0.18.2
    ├── wry 0.53.5
    ├── webkit2gtk 2.0.1
    ├── tao 0.34.8
    │   └── dioxus-desktop 0.7.9
    ├── muda 0.17.2
    │   ├── tray-icon 0.21.3
    │   └── dioxus-desktop 0.7.9
    └── libappindicator 0.9.0

Crate:     gtk3-macros
Version:   0.18.2
Warning:   unmaintained
Title:     gtk-rs GTK3 bindings - no longer maintained
Date:      2024-03-04
ID:        RUSTSEC-2024-0419
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0419
Dependency tree:
gtk3-macros 0.18.2
└── gtk 0.18.2
    ├── wry 0.53.5
    │   └── dioxus-desktop 0.7.9
    │       └── dioxus 0.7.9
    │           └── libre-ai-website 0.1.0
    ├── webkit2gtk 2.0.1
    │   └── wry 0.53.5
    ├── tao 0.34.8
    │   └── dioxus-desktop 0.7.9
    ├── muda 0.17.2
    │   ├── tray-icon 0.21.3
    │   │   └── dioxus-desktop 0.7.9
    │   └── dioxus-desktop 0.7.9
    └── libappindicator 0.9.0
        └── tray-icon 0.21.3

Crate:     paste
Version:   1.0.15
Warning:   unmaintained
Title:     paste - no longer maintained
Date:      2024-10-07
ID:        RUSTSEC-2024-0436
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0436
Dependency tree:
paste 1.0.15
├── rav1e 0.8.1
│   └── ravif 0.13.0
│       └── image 0.25.10
│           └── dioxus-desktop 0.7.9
│               └── dioxus 0.7.9
│                   └── libre-ai-website 0.1.0
└── pulp 0.22.3
    └── exr 1.74.2
        └── image 0.25.10

Crate:     proc-macro-error
Version:   1.0.4
Warning:   unmaintained
Title:     proc-macro-error is unmaintained
Date:      2024-09-01
ID:        RUSTSEC-2024-0370
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0370
Dependency tree:
proc-macro-error 1.0.4
├── gtk3-macros 0.18.2
│   └── gtk 0.18.2
│       ├── wry 0.53.5
│       │   └── dioxus-desktop 0.7.9
│       │       └── dioxus 0.7.9
│       │           └── libre-ai-website 0.1.0
│       ├── webkit2gtk 2.0.1
│       │   └── wry 0.53.5
│       ├── tao 0.34.8
│       │   └── dioxus-desktop 0.7.9
│       ├── muda 0.17.2
│       │   ├── tray-icon 0.21.3
│       │   │   └── dioxus-desktop 0.7.9
│       │   └── dioxus-desktop 0.7.9
│       └── libappindicator 0.9.0
│           └── tray-icon 0.21.3
└── glib-macros 0.18.5
    └── glib 0.18.5
        ├── webkit2gtk 2.0.1
        ├── soup3 0.5.0
        │   ├── wry 0.53.5
        │   └── webkit2gtk 2.0.1
        ├── pango 0.18.3
        │   ├── gtk 0.18.2
        │   └── gdk 0.18.2
        │       ├── webkit2gtk 2.0.1
        │       └── gtk 0.18.2
        ├── libappindicator 0.9.0
        ├── javascriptcore-rs 1.1.2
        │   ├── wry 0.53.5
        │   └── webkit2gtk 2.0.1
        ├── gtk 0.18.2
        ├── gio 0.18.4
        │   ├── webkit2gtk 2.0.1
        │   ├── soup3 0.5.0
        │   ├── pango 0.18.3
        │   ├── gtk 0.18.2
        │   ├── gdk-pixbuf 0.18.5
        │   │   ├── gtk 0.18.2
        │   │   └── gdk 0.18.2
        │   └── gdk 0.18.2
        ├── gdk-pixbuf 0.18.5
        ├── gdk 0.18.2
        ├── cairo-rs 0.18.5
        │   ├── webkit2gtk 2.0.1
        │   ├── gtk 0.18.2
        │   └── gdk 0.18.2
        └── atk 0.18.2
            └── gtk 0.18.2

Crate:     glib
Version:   0.18.5
Warning:   unsound
Title:     Unsoundness in `Iterator` and `DoubleEndedIterator` impls for `glib::VariantStrIter`
Date:      2024-03-30
ID:        RUSTSEC-2024-0429
URL:       https://rustsec.org/advisories/RUSTSEC-2024-0429
Dependency tree:
glib 0.18.5
├── webkit2gtk 2.0.1
│   └── wry 0.53.5
│       └── dioxus-desktop 0.7.9
│           └── dioxus 0.7.9
│               └── libre-ai-website 0.1.0
├── soup3 0.5.0
│   ├── wry 0.53.5
│   └── webkit2gtk 2.0.1
├── pango 0.18.3
│   ├── gtk 0.18.2
│   │   ├── wry 0.53.5
│   │   ├── webkit2gtk 2.0.1
│   │   ├── tao 0.34.8
│   │   │   └── dioxus-desktop 0.7.9
│   │   ├── muda 0.17.2
│   │   │   ├── tray-icon 0.21.3
│   │   │   │   └── dioxus-desktop 0.7.9
│   │   │   └── dioxus-desktop 0.7.9
│   │   └── libappindicator 0.9.0
│   │       └── tray-icon 0.21.3
│   └── gdk 0.18.2
│       ├── webkit2gtk 2.0.1
│       └── gtk 0.18.2
├── libappindicator 0.9.0
├── javascriptcore-rs 1.1.2
│   ├── wry 0.53.5
│   └── webkit2gtk 2.0.1
├── gtk 0.18.2
├── gio 0.18.4
│   ├── webkit2gtk 2.0.1
│   ├── soup3 0.5.0
│   ├── pango 0.18.3
│   ├── gtk 0.18.2
│   ├── gdk-pixbuf 0.18.5
│   │   ├── gtk 0.18.2
│   │   └── gdk 0.18.2
│   └── gdk 0.18.2
├── gdk-pixbuf 0.18.5
├── gdk 0.18.2
├── cairo-rs 0.18.5
│   ├── webkit2gtk 2.0.1
│   ├── gtk 0.18.2
│   └── gdk 0.18.2
└── atk 0.18.2
    └── gtk 0.18.2

Crate:     rand
Version:   0.7.3
Warning:   unsound
Title:     Rand is unsound with a custom logger using `rand::rng()`
Date:      2026-04-09
ID:        RUSTSEC-2026-0097
URL:       https://rustsec.org/advisories/RUSTSEC-2026-0097
Dependency tree:
rand 0.7.3
└── phf_generator 0.8.0
    └── phf_codegen 0.8.0
        └── selectors 0.24.0
            └── kuchikiki 0.8.8-speedreader
                └── wry 0.53.5
                    └── dioxus-desktop 0.7.9
                        └── dioxus 0.7.9
                            └── libre-ai-website 0.1.0

Crate:     spin
Version:   0.9.8
Warning:   yanked
Dependency tree:
spin 0.9.8
└── multer 3.1.0
    └── axum 0.8.9
        └── dioxus-fullstack 0.7.9
            └── dioxus 0.7.9
                └── libre-ai-website 0.1.0

warning: 15 allowed warnings found
```

- `vérifications empiriques grep -o | wc -l` :

```text
content/corpus entries:
content/corpus/.gitkeep
content/corpus markdown files: 0
fixture markers in dist: 0
dangerous_inner_html occurrences in src: 1
dangerous_inner_html rendered_body boundary: 1
citation blocks in dist: 0
JSON-LD blocks in dist: 0
article OG metadata in dist: 0
Atom alternate links in dist: 0
Atom files in dist: 0
dynamic corpus page directories: 0
fixture markers in content manifest: 0
manifest path entries: 8
sitemap URL entries: 8
Story 2.4 series/index implementation markers: 0
Story 2.5 Atom implementation markers: 0
```

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story documentaire créée depuis la baseline fournie `b1746a4`; aucune implémentation applicative ni contenu éditorial ajouté.
- Contrat de sécurité explicite pour l’échappement Open Graph et la sérialisation/neutralisation JSON-LD, avec extraction puis parsing JSON obligatoire en test.
- Frontières 2.4, 2.5 et 2.6–2.8 conservées ; aucun format bibliographique additionnel ni JavaScript de copie exigé.
- `CorpusCitability` dérive depuis `CorpusPiece` l’unique canonical, la citation, les dates, l’auteur, le titre et la nature ; aucun champ front-matter ni dépendance n’a été ajouté.
- `CitationBlock` est une section « Citer cette page » accessible, placée après les sources et avant le CTA ; sa démonstration fictive a été omise.
- Le head de pièce contient exactement les cinq propriétés Open Graph demandées et le contrat JSON-LD `Article` exact, sans description, publisher, logo ni image inventés.
- Le JSON-LD est produit par `serde_json`, puis neutralisé pour `<`, `>`, `&`, U+2028 et U+2029 ; les fixtures hostiles sont reparsées et restituées exactement.
- `site-build` conserve en mémoire les pages publiées validées avant `remove_dir_all(dist)` ; une divergence simulée préserve l’artefact sentinelle et produit un diagnostic relatif.
- Les suites finales couvrent 59 tests Rust en mode debug et release, 24 parcours Playwright, 4 tests de publication, deux passes de build statique, smoke, topologie, licences et audit.
- `cargo audit` signale toujours 15 avertissements transitifs autorisés déjà connus (12 non maintenus, 2 unsound, 1 yanked dans la résolution affichée) ; aucun n’est présenté comme corrigé.
- `content/corpus/` contient uniquement `.gitkeep`; aucune fixture ni pièce réelle n’est publiée, et `dist/` ne contient ni pièce dynamique, ni Atom/alternate, ni index/série 2.4.
- La gate E2E clavier a été rendue fidèle au raccourci WebKit/macOS (`Alt+Tab`) après deux échecs reproductibles avec `Tab`; les 24 tests finaux passent.
- La revue a durci le comptage des balises script sans sensibilité à la casse ; une balise additionnelle `<ScRiPt>` est rejetée par la gate.
- La vérification empirique d’une fixture hostile a produit exactement 1 citation, 5 métadonnées Open Graph et 1 JSON-LD parsé avec succès ; les caractères de contexte script ont été neutralisés, puis la fixture a été purgée par rebuild propre.
- Revue solo sécurité/qualité/performance/complétude/souveraineté effectuée : aucun finding restant, aucune nouvelle dépendance, donnée personnelle ou ressource tierce.

### File List

- `_bmad-output/implementation-artifacts/2-3-citabilite-bloc-citation-et-metadonnees.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `assets/components.css`
- `e2e/site.spec.ts`
- `src/bin/site-build.rs`
- `src/components/citation_block.rs`
- `src/components/piece_corpus.rs`
- `src/domain.rs`
- `src/lib.rs`
- `tests/corpus_page.rs`

### Change Log

- 2026-07-14 — Story créée à partir de la baseline `b1746a4` et passée à `ready-for-dev`.
- 2026-07-14 — Projection de citabilité, bloc citation, Open Graph, JSON-LD sûr, préflight atomique, matrice hostile et styles implémentés ; vérification empirique et revue terminées, story passée à `done`.
