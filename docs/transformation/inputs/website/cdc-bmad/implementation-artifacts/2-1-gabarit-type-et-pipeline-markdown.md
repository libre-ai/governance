---
story_id: 2.1
story_key: 2-1-gabarit-type-et-pipeline-markdown
epic: 2
title: "Gabarit typé et pipeline markdown"
status: done
created: 2026-07-14
updated: 2026-07-14
baseline_commit: 5b36c80c1df3481e1f522333233ee915a0cc12e1
references:
  epics: _bmad-output/planning-artifacts/epics.md#story-21-gabarit-typé-et-pipeline-markdown
  prd: _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#41-corpus-de-référence
  architecture: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#ad-2--domaine-éditorial-rust-typé-validation-gabarit-fr-1-au-build
  design: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md
  experience: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md
---

# Story 2.1 : Gabarit typé et pipeline markdown

Status: done

## Story

En tant qu’auteur du collectif,
je veux que toute pièce invalide fasse échouer la construction,
afin que rien ne se publie sans satisfaire l’exigence de vérité.

## Acceptance Criteria

### AC1 — Une pièce complète devient un domaine typé et un rendu Markdown sûr

**Given** un fichier UTF-8 `content/corpus/<année>-<slug>.md` dont le front-matter YAML déclare explicitement tous les champs du gabarit FR-1

**When** `site-build` charge le corpus

**Then** le front-matter est désérialisé sans valeur par défaut vers les types Rust du domaine

**And** les champs temporels sont des dates calendaires ISO 8601 `YYYY-MM-DD` typées par `chrono::NaiveDate`

**And** les URLs de sources sont typées par `url::Url`

**And** le corps est parsé avec `pulldown-cmark` 0.13.4 en CommonMark strict, puis transformé en un type de rendu interne sûr

**And** le pipeline retourne les pièces dans un ordre déterministe fondé sur leur chemin relatif.

> Dans cette story, « rend » signifie : produire depuis les événements Markdown validés une représentation HTML sûre et testable, prête à être consommée par le renderer. La composition de la page publique, sa route, son en-tête visuel, ses corrections visibles et ses sources relèvent de la story 2.2.

### AC2 — Toute métadonnée absente, incohérente ou ambiguë bloque le build

**Given** une pièce dont `nature` manque, dont un champ obligatoire manque, dont une date est impossible, dont une URL est invalide, dont une clé YAML est dupliquée ou dont un champ est inconnu

**When** le corpus est validé

**Then** la construction échoue avant toute suppression ou écriture dans `dist/`

**And** aucune valeur factuelle, date, liste, état ou chaîne de remplacement n’est injecté par défaut

**And** `serde-saphyr` 0.0.29 est configuré avec `DuplicateKeyPolicy::Error`

**And** les erreurs sont agrégées et triées de façon déterministe lorsque plusieurs fichiers sont invalides.

### AC3 — Les erreurs sont relatives, localisées et actionnables

**Given** une erreur de lecture, de front-matter, de schéma, de validation métier ou de Markdown

**When** l’erreur est affichée par `site-build`

**Then** elle contient le chemin relatif au dépôt, par exemple `content/corpus/fixture-invalide.md`

**And** elle nomme le champ ou la règle en cause, indique la valeur ou forme attendue et inclut ligne/colonne lorsque le parseur les fournit

**And** elle ne contient jamais le chemin absolu du worktree, le corps éditorial complet, une backtrace par défaut ou une donnée personnelle.

Format cible, sans imposer le texte exact :

```text
content/corpus/fixture-invalide.md:frontmatter.nature: champ obligatoire absent (attendu : fait | analyse | position)
```

### AC4 — Le HTML brut et les destinations dangereuses sont refusés

**Given** un corps Markdown contenant du HTML de bloc ou en ligne, ou un lien dont la destination utilise un schéma dangereux ou non autorisé

**When** `pulldown-cmark` émet les événements correspondants

**Then** le pipeline rejette la pièce avec une erreur relative et actionnable

**And** aucun HTML éditorial arbitraire n’est transmis à `dangerous_inner_html`

**And** les tests couvrent au minimum le HTML de bloc, le HTML en ligne et un lien dangereux

**And** le rendu accepté ne provient que des événements CommonMark autorisés par le pipeline.

### AC5 — L’absence de corpus est valide, une fixture n’est jamais publiée

**Given** que `content/corpus/` ne contient encore aucune pièce réelle

**When** le site est construit

**Then** le build existant continue de réussir et ne fabrique aucune pièce, aucune date, aucune source et aucune page de corpus

**And** le dossier peut être conservé par un fichier neutre tel que `.gitkeep`

**And** toutes les données de test sont explicitement fictives, stockées hors de `content/corpus/` ou construites en mémoire, et ne sont jamais copiées dans `dist/` ni ajoutées au manifeste public.

### AC6 — L’intégration préserve l’Epic 1 et ne préempte pas les stories 2.2 à 2.5

**Given** le build statique actuel

**When** le pipeline éditorial est branché

**Then** le chargement et la validation complète du corpus ont lieu avant le nettoyage de `dist/`

**And** les huit pages `SitePage::PUBLISHED`, la page 404, la page de démonstration, les redirections, `robots.txt`, `sitemap.xml`, `llms.txt`, le manifeste et l’injection `.weights.json` conservent leur comportement actuel

**And** cette story n’implémente ni page publique de pièce (2.2), ni bloc « citer cette page » ou métadonnées dédiées (2.3), ni index/série trimestrielle (2.4), ni flux Atom/découvrabilité (2.5)

**And** elle n’ajoute aucune pièce de lancement ni contenu destiné au site (2.6 à 2.8).

## Tasks / Subtasks

- [x] **1. Définir un contrat corpus strict sans dupliquer le domaine existant** (AC1, AC2)
  - [x] Étendre ou refactorer les types déjà présents dans `src/editorial.rs`; ne pas conserver en parallèle deux contrats concurrents pour une pièce.
  - [x] Placer dans `src/domain.rs` les types métier indépendants du renderer et dans `src/editorial.rs` les types d’entrée YAML, le parsing et la validation.
  - [x] Modéliser au minimum `CorpusPiece`, `Nature`, `PublishState`, `AiAssistance`, `EditorialSource`, `Correction` et le type opaque de corps/rendu validé.
  - [x] Utiliser `NaiveDate` et `Url` dans le domaine final; ne pas conserver les dates et URLs validées comme simples `String`.
  - [x] Ajouter `#[serde(deny_unknown_fields)]` sur chaque structure d’entrée pertinente et ne pas utiliser `#[serde(default)]` pour masquer un champ absent.
  - [x] Distinguer « clé absente » de « valeur explicitement vide/nulle » pour les champs optionnels dont la présence fait partie du gabarit.

- [x] **2. Fixer le schéma de front-matter de la story 2.1** (AC1, AC2)
  - [x] Exiger explicitement : `slug`, `title`, `nature`, `author`, `author_member_key`, `assistance_ia`, `sources`, `figures_method`, `published_date`, `last_review_date`, `state`, `corrections`.
  - [x] Valeurs YAML de `nature` : `fait`, `analyse`, `position`, conformément à FR-1 et AD-2.
  - [x] Valeurs YAML de `state` : `published`, `draft`; l’état brouillon n’autorise jamais une publication.
  - [x] `author_member_key` : clé obligatoire dans le YAML, valeur `null` ou slug non vide. La cohérence avec un registre de membres est différée à la story 4.2; ne pas inventer de membre.
  - [x] `assistance_ia` : liste explicitement présente; `[]` signifie aucune assistance. Chaque entrée présente porte des chaînes non vides pour le modèle, la version et le rôle déclaré.
  - [x] `sources` : liste non vide de sources rattachées à une affirmation; réutiliser et renforcer `EditorialSource` plutôt que créer un doublon. Chaque entrée porte au minimum une affirmation, un titre, une URL HTTPS et sa nature de source.
  - [x] `figures_method` : clé obligatoire; `null` s’il n’existe aucune affirmation quantitative, texte non vide sinon. Le pipeline ne devine pas automatiquement si une phrase contient un chiffre; ce contrôle de fond reste aussi soumis à la revue humaine.
  - [x] `corrections` : liste explicitement présente, éventuellement vide. Chaque correction présente exige date, note non vide et lien de version archivée valide. Ne pas imposer une correction fictive à toute pièce publiée.
  - [x] Refuser chaînes obligatoires vides/blanches, slugs invalides, `last_review_date < published_date`, sources vides et entrées de listes incomplètes.

- [x] **3. Ajouter les dépendances auditées et verrouiller le parseur YAML** (AC1, AC2, AC4)
  - [x] Ajouter `pulldown-cmark` 0.13.4 — licence MIT.
  - [x] Ajouter `chrono` 0.4.45 — licences MIT/Apache-2.0 — avec `default-features = false`, features `std` et `serde`.
  - [x] Ajouter `url` 2.5.8 — licences MIT/Apache-2.0 — avec la feature `serde`.
  - [x] Ajouter `serde-saphyr` 0.0.29 — licences MIT/Apache-2.0 — et configurer `DuplicateKeyPolicy::Error`.
  - [x] Ne pas ajouter `serde_yml` 0.0.13 : cette version est dépréciée.
  - [x] Mettre à jour `Cargo.lock` par les commandes Cargo normales et soumettre les nouvelles dépendances aux gates licence/advisories disponibles; aucune dépendance SaaS ou donnée transmise hors du build local.

- [x] **4. Implémenter le chargement déterministe et les erreurs de domaine** (AC2, AC3, AC5)
  - [x] Charger uniquement les fichiers réguliers `.md` directement sous `content/corpus/`; ignorer le fichier neutre `.gitkeep`.
  - [x] Trier les chemins relatifs avant parsing et conserver cet ordre dans les diagnostics et résultats.
  - [x] Définir une erreur structurée avec au minimum chemin relatif, phase (`read`, `frontmatter`, `schema`, `validation`, `markdown`), localisation optionnelle, champ/règle et aide.
  - [x] Transformer les erreurs `io`, YAML, Serde, date, URL et Markdown sans exposer le chemin absolu construit depuis `CARGO_MANIFEST_DIR`.
  - [x] Agréger tous les diagnostics de corpus avant de retourner l’échec, sans écrire de contenu invalide.

- [x] **5. Parser le front-matter et le Markdown en refusant l’HTML brut** (AC1, AC2, AC4)
  - [x] Exiger un unique front-matter YAML délimité par deux lignes `---`; refuser délimiteurs absents/non fermés, document YAML non mapping et contenu UTF-8 invalide.
  - [x] Désérialiser avec la politique de clés dupliquées en erreur avant validation métier.
  - [x] Utiliser les options CommonMark minimales nécessaires; ne pas activer silencieusement des extensions GFM/HTML.
  - [x] Inspecter les événements `pulldown-cmark` et rejeter les événements HTML de bloc ou en ligne avant génération du rendu.
  - [x] Valider les destinations de liens/images avant rendu : HTTPS pour les destinations externes, chemins/ancres internes explicitement autorisés; refuser notamment `javascript:`, `data:`, `file:`, les URLs protocol-relative et les contrôles invisibles.
  - [x] Exiger un texte alternatif non vide pour toute image porteuse de sens acceptée; ne pas charger de média tiers.
  - [x] Produire un type opaque `RenderedMarkdown` (ou équivalent) impossible à construire sans validation; ne pas exposer une conversion publique depuis une `String` arbitraire.

- [x] **6. Brancher la validation au début de `site-build`** (AC2, AC5, AC6)
  - [x] Extraire une fonction testable qui reçoit explicitement la racine du dépôt et/ou le répertoire corpus, plutôt que d’enfouir toute la logique dans `main`.
  - [x] Charger, parser, valider et rendre en mémoire toutes les pièces avant le bloc actuel qui supprime puis recrée `dist/`.
  - [x] Si le corpus est vide, continuer normalement avec une collection vide.
  - [x] En cas d’erreur, retourner un code d’échec et les diagnostics relatifs; préserver l’artefact `dist/` antérieur au lieu de le remplacer par un artefact partiel.
  - [x] Ne pas ajouter de route dynamique à `SitePage`, ne pas modifier `PageContent::Corpus`, ne pas alimenter `PieceCorpus.content` et ne pas publier les valeurs rendues dans cette story.

- [x] **7. Ajouter une matrice de tests entièrement fictive et non publiée** (AC1 à AC6)
  - [x] Cas valide complet avec données explicitement marquées comme fixture fictive; vérifier les types `NaiveDate`, `Url`, l’ordre et le rendu CommonMark attendu.
  - [x] Cas `nature` absente; vérifier chemin relatif, champ et aide.
  - [x] Date impossible et ordre de dates inversé.
  - [x] Clé YAML dupliquée avec échec `DuplicateKeyPolicy::Error`.
  - [x] Champ YAML inconnu, champ obligatoire absent, chaîne blanche, sources vides.
  - [x] HTML de bloc, HTML en ligne et destination `javascript:` refusés.
  - [x] Front-matter absent/non fermé, corps vide et fichier non UTF-8 refusés.
  - [x] Plusieurs fichiers invalides : diagnostics agrégés, triés, sans chemin absolu.
  - [x] Corpus vide : collection vide et build existant inchangé.
  - [x] Vérifier qu’aucune fixture n’est sous `content/corpus/`, dans `dist/` ou dans `content-manifest.json`.

- [x] **8. Exécuter les gates disponibles et consigner leurs sorties brutes** (AC1 à AC6)
  - [x] `cargo fmt --check`
  - [x] `cargo test --no-default-features --features static`
  - [x] `cargo clippy --all-targets --no-default-features --features static -- -D warnings`
  - [x] `cargo run --release --no-default-features --features static --bin site-build`
  - [x] `bash scripts/static-smoke.sh`
  - [x] Exécuter la gate licence/advisories disponible dans le dépôt; si elle n’existe pas, le documenter sans prétendre l’avoir exécutée.
  - [x] Copier les sorties brutes réellement obtenues dans le Dev Agent Record; ne jamais reconstruire ou résumer une sortie comme si elle avait été exécutée.

## Dev Notes

### Contrat de front-matter cible

Ce schéma illustre uniquement la forme. Il ne doit pas être ajouté à `content/corpus/` et ses valeurs ne constituent pas une pièce éditoriale :

```yaml
---
slug: "fixture-corpus-fictive"
title: "Fixture fictive non publiée"
nature: "analyse"
author: "Auteur fictif de test"
author_member_key: null
assistance_ia: []
sources:
  - claim: "Affirmation fictive utilisée uniquement par le test"
    title: "Source fictive de test"
    url: "https://example.invalid/source-fictive"
    kind: "primary"
figures_method: null
published_date: 2026-01-01
last_review_date: 2026-01-01
state: "draft"
corrections: []
---

# Fixture fictive

Corps de test non publié.
```

Les fixtures doivent utiliser des domaines réservés à la documentation, rester en état `draft`, porter explicitement leur caractère fictif et vivre dans un répertoire de tests ou en mémoire.

### État actuel des fichiers à modifier

#### `src/domain.rs` — UPDATE

- **État actuel :** contient uniquement `CANONICAL_ORIGIN`, l’énumération `SitePage`, les huit pages publiées, leurs chemins/titres/descriptions et deux tests de routes.
- **Changement attendu :** ajouter les types métier corpus indépendants de Dioxus, ou y déplacer les types de domaine refactorés depuis `editorial.rs`.
- **À préserver :** origine canonique, huit routes publiées, normalisation `from_path`, titres/descriptions et tests d’unicité.

#### `src/editorial.rs` — UPDATE

- **État actuel :** contient un contrat `EditorialMetadata` strict mais non branché au build, avec `EditorialKind`, `Confidence`, `SourceKind`, `EditorialSource`, `AiAssistance`; dates et URLs sont des `String`, la validation de date est manuelle et aucun YAML/Markdown/fichier n’est parsé.
- **Changement attendu :** réutiliser ce qui est compatible, remplacer les chaînes validées par types dédiés, ajouter entrée YAML, chargement, diagnostics, validation et rendu Markdown sûr.
- **À préserver :** rejet des champs inconnus, validation des chaînes obligatoires, sources rattachées aux affirmations et tests empêchant une publication silencieuse. Adapter les tests plutôt que supprimer la couverture.

#### `src/bin/site-build.rs` — UPDATE

- **État actuel :** calcule la racine avec `CARGO_MANIFEST_DIR`, supprime immédiatement `dist/`, rend `SitePage::PUBLISHED`, puis les utilitaires; exécute ensuite `scripts/measure-weights.sh` et injecte `.weights.json` dans la home.
- **Changement attendu :** appeler la validation corpus avant `remove_dir_all(&output)` et propager les diagnostics relatifs.
- **À préserver :** copie des assets, huit pages, `/_composants`, 404, robots, sitemap, manifeste web, `llms.txt`, `.htaccess`, manifeste de contenu, mesure et injection des poids.

#### `Cargo.toml` / `Cargo.lock` — UPDATE

- **État actuel :** Dioxus 0.7.9, Serde 1 et `serde_json` 1; aucune dépendance YAML, Markdown, date ou URL.
- **Changement attendu :** ajouter uniquement les quatre dépendances auditées définies dans les tâches et actualiser le verrou.
- **À préserver :** Rust edition 2024, licence MIT, features web/desktop/mobile/static et configuration du binaire `site-build`.

#### `src/lib.rs` — REVIEW, pas de modification attendue

- **État actuel :** route `/corpus` rend un `EmptyState`; la démonstration `/_composants` instancie `PieceCorpus` avec un fragment fictif. Le composant `PieceCorpus` utilise actuellement `dangerous_inner_html` pour sa prop `content`.
- **Règle de cette story :** ne pas connecter la sortie éditoriale à cette prop et ne pas transformer la story 2.1 en page corpus. La suppression de ce point d’injection arbitraire et la composition sémantique de la page appartiennent à 2.2; aucun nouveau `dangerous_inner_html` n’est admis.
- **À préserver :** routes, gabarit, pages Epic 1, métadonnées génériques, rendu statique et tests actuels.

#### `content/corpus/` — CREATE DIRECTORY ONLY

- **État actuel vérifié :** le chemin n’existe pas dans le worktree.
- **Changement attendu :** créer uniquement le répertoire et, si nécessaire au suivi Git, un `.gitkeep` neutre.
- **Interdit :** aucune pièce réelle, aucun exemple publiable, aucune copie du corpus legacy.

### Architecture et sécurité

- Le domaine doit rester testable sans Dioxus. `src/editorial.rs` ne dépend pas de `dioxus`.
- Le parseur traite les fichiers comme des entrées non fiables : échec explicite, aucun fallback silencieux, aucune interpolation de chemin absolu.
- Le YAML portable reste une source en Git; aucun CMS, serveur, réseau ou JavaScript n’est introduit.
- Le rendu Markdown sûr n’autorise pas l’HTML arbitraire. Le rejet en amont est obligatoire même si le renderer final échappe aussi les chaînes.
- Le pipeline doit terminer toutes les validations avant de toucher à l’artefact public. Une erreur ne laisse pas un `dist/` partiellement mis à jour.
- Les bibliothèques retenues sont open source et sous licences permissives compatibles avec la politique du projet; aucun traitement de données personnelles ni transfert réseau n’est ajouté.

### Arbitrages documentaires appliqués

- **Nature :** FR-1 et AD-2 gouvernent cette story avec `fait | analyse | position`. Les unités éditoriales plus larges de `TARGET.md` ne doivent pas conduire à ajouter silencieusement d’autres valeurs dans ce premier gabarit.
- **Corrections :** AD-3 montre une pièce `published` avec `corrections: []` et FR-1 exige que les corrections existantes soient visibles; une liste vide explicite est donc valide. Inventer une correction pour satisfaire un contrôle serait contraire à NFR-11.
- **`author_member_key` :** AD-2 le type comme optionnel. Sa clé reste explicite dans le front-matter pour éviter l’ambiguïté; sa résolution vers une fiche réelle attend la story 4.2.
- **Rendu :** cette story construit et teste le rendu interne sûr. La page et la présentation UX sont réservées à 2.2 afin d’éviter deux implémentations concurrentes.
- **Métadonnées, index, Atom :** les données nécessaires peuvent être conservées dans le domaine, mais aucune sortie OG/JSON-LD, citation, index ou syndication n’est générée avant les stories dédiées.

### Exigences bibliothèques

| Bibliothèque | Version | Configuration imposée | Licence vérifiée | Usage limité à cette story |
|---|---:|---|---|---|
| `pulldown-cmark` | 0.13.4 | CommonMark strict; inspection des événements avant rendu | MIT | parsing/rendu Markdown local |
| `chrono` | 0.4.45 | `default-features = false`, features `std`, `serde` | MIT/Apache-2.0 | dates calendaires strictes |
| `url` | 2.5.8 | feature `serde` | MIT/Apache-2.0 | URLs typées et validation de schéma |
| `serde-saphyr` | 0.0.29 | `DuplicateKeyPolicy::Error` | MIT/Apache-2.0 | front-matter YAML strict |

`serde_yml` 0.0.13 est déprécié et ne doit pas être introduit.

### Exigences de tests

- Préférer des tests unitaires purs pour le schéma, la validation et les événements Markdown.
- Ajouter un test d’intégration du chargeur avec une racine injectée et des fixtures hors `content/corpus/`; ne jamais modifier le corpus public pendant un test.
- Les assertions portent sur des diagnostics structurés, pas uniquement sur des sous-chaînes fragiles.
- Vérifier à la fois les cas positifs et les refus; un test qui ne fait que compiler n’est pas une preuve de validation.
- Vérifier explicitement l’absence de chemin commençant par `/` ou contenant le préfixe du worktree dans les diagnostics sérialisés.
- Conserver les tests existants du domaine, du rendu statique et de `site-build`.

### Project Structure Notes

Fichiers attendus pour l’implémentation :

```text
Cargo.toml                                      UPDATE
Cargo.lock                                      UPDATE
src/domain.rs                                   UPDATE
src/editorial.rs                                UPDATE
src/bin/site-build.rs                           UPDATE
src/lib.rs                                      REVIEW ONLY
content/corpus/.gitkeep                         NEW, neutre uniquement
tests/fixtures/corpus/                          NEW, fictif et non publié si des fixtures fichiers sont nécessaires
tests/editorial_pipeline.rs                     NEW optionnel; préférer les tests près du domaine si suffisant
```

Ne pas créer de crate/workspace artificiel : l’ADR 0007 autorise la disposition actuelle tant que le domaine reste indépendant du renderer.

### Scope Guardrails

**Dans la story 2.1 :** contrat, parsing, validation, diagnostics, rendu Markdown interne sûr, branchement bloquant au début du build, tests fictifs.

**Hors story 2.1 :**

- page publique et styles serif/corrections visibles/sources — 2.2;
- permalien final, citation, Open Graph, JSON-LD — 2.3;
- index public, cartes, briefs et filtrage public des brouillons — 2.4;
- Atom et `<link rel="alternate">` — 2.5;
- rédaction ou migration d’une pièce — 2.6 à 2.8;
- registre de membres et résolution complète de `author_member_key` — 4.2;
- gates CI éditoriales globales et confidentialité — 5.1.

### Previous Story Intelligence

La story 1.7 et le code actuel établissent les contraintes suivantes :

- `SitePage::PUBLISHED` contient huit pages et le build annonce actuellement huit pages publiées; ne pas réintroduire les routes legacy.
- `site-build` génère les redirections 301, `llms.txt`, les pages utilitaires et la mesure de poids; le pipeline corpus doit s’insérer avant les effets de bord, pas remplacer cette chaîne.
- `content/` était annoncé par 1.7 mais `content/corpus/` n’existe pas dans l’état actuel lu; cette story ne doit y ajouter aucun contenu réel.
- Le composant `PieceCorpus` existe déjà comme démonstration UX, mais son injection HTML ne constitue pas le pipeline éditorial sûr. Ne pas le réutiliser pour contourner la validation.
- Les stories Epic 1 contiennent des comptes et sorties historiques parfois divergents; le code actuel lu (`domain.rs`, `site-build.rs`, `lib.rs`) est la référence pour préserver le comportement présent.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.1, FR-1/NFR-11]
- [Source: `_bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md` — §4.1 FR-1 à FR-5, §10 NFR-5/NFR-7/NFR-11/NFR-13]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md` — AD-1, AD-2, AD-3, AD-8, Consistency Conventions, Structural Seed]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md` — Typography, Card Corpus, State Badge, Citation Block]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md` — Fondation, pièce-de-corpus, états honnêtes, accessibilité]
- [Source: `TARGET.md` — Responsabilité éditoriale, exigence de vérité, Markdown strict]
- [Source: `docs/adr/0007-dioxus-clean-rebuild.md` — domaine indépendant, publication statique, Markdown strict]
- [Source: `docs/adr/0008-domaines-publics-et-gates-par-produit.md` — origine canonique et absence de publication prématurée]
- [Source: `src/domain.rs`, `src/editorial.rs`, `src/bin/site-build.rs`, `src/lib.rs`, `src/components/piece_corpus.rs`, `Cargo.toml` — état courant lu le 2026-07-14]
- [Source: `_bmad-output/implementation-artifacts/1-7-retrait-du-site-produit-legacy.md` — chaîne statique et frontières de contenu]

## Dev Agent Record

### Agent Model Used

Non exposé par le harnais de cette session

### Debug Log References

- Plan appliqué : domaine typé indépendant du renderer, entrée YAML stricte, validation métier agrégée, validation des événements CommonMark avant rendu opaque, puis branchement bloquant avant tout effet de bord de `site-build`.
- RED initial — `cargo test --no-default-features --features static --test editorial_pipeline` :

```text
error[E0432]: unresolved imports `libre_ai_website::domain::Nature`, `libre_ai_website::domain::PublishState`
error[E0432]: unresolved imports `libre_ai_website::editorial::DiagnosticPhase`, `libre_ai_website::editorial::load_corpus`, `libre_ai_website::editorial::parse_piece`
error[E0432]: unresolved import `chrono`
error[E0432]: unresolved import `url`
error[E0425]: cannot find type `CorpusDiagnostic` in module `libre_ai_website::editorial`
error: could not compile `libre-ai-website` (test "editorial_pipeline") due to 5 previous errors
```

- GREEN final après durcissement — `cargo test --no-default-features --features static --test editorial_pipeline` :

```text
running 22 tests
test result: ok. 22 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
```

- Sorties brutes finales des gates :

`cargo fmt --check`

```text
```

`cargo test --no-default-features --features static`

```text
running 5 tests
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 3 tests
test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 22 tests
test result: ok. 22 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo test --release --no-default-features --features static`

```text
running 5 tests
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 3 tests
test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 22 tests
test result: ok. 22 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo clippy --all-targets --no-default-features --features static -- -D warnings`

```text
Finished `dev` profile [unoptimized + debuginfo] target(s) in 4.15s
```

`cargo check --target wasm32-unknown-unknown --bin libre-ai-website`

```text
Finished `dev` profile [unoptimized + debuginfo] target(s) in 26.91s
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
  Page size: 54 KB (4221 bytes)
  Third-party requests: 0
  Date: 2026-07-14T15:47:54Z
  Output: dist/.weights.json
```

`bash scripts/static-smoke.sh`

```text
static-smoke: PASS (14 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
```

`python3 scripts/check-current-topology.py`

```text
check-current-topology: PASS (canonical origin libre-ai.fr, 7 legacy 301s, routes clean, brand libre-ai)
```

Gate de publication fail-closed puis approuvée :

```text
publication gates: FAIL — LIBRE_AI_WEBSITE_APPROVED must be set to 1 (human approval required)
publication gate fail-closed vérifiée (code 1)
publication gates: PASS — Website approved and dist/ ready for deployment
```

`python3 -m unittest discover scripts/tests -v`

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

`cargo deny check licenses sources`

```text
licenses ok, sources ok
```

`cargo audit` a été exécuté réellement. Une seconde exécution filtrée, `cargo audit 2>&1 | awk '/^(Crate:|Version:|Warning:|ID:|warning:)/ { print }'`, a produit cette sortie brute consignée sans reconstruction :

```text
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

Contrôle d’artefact statique exécuté :

```text
static-artifact: manifest_entries=8, fixture_files=0, jsonld_or_atom_files=0
```

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Aucun code applicatif ni contenu éditorial n’a été implémenté pendant la création initiale de cette story.
- Le contrat corpus final vit dans `src/domain.rs`; le parsing YAML strict, les diagnostics, la validation métier et le rendu CommonMark sûr vivent dans `src/editorial.rs`, sans dépendance à Dioxus.
- Les clés absentes, valeurs nulles/vides invalides, scalaires YAML ambigus, clés dupliquées, merge keys, champs inconnus, dates/URLs invalides, HTML brut et destinations dangereuses échouent explicitement avec diagnostics relatifs et déterministes.
- Le nom `YYYY-<slug>.md`, le slug, l’année de publication, la liaison sources↔liens et l’ordre temporel des corrections sont vérifiés avant rendu.
- `site-build` valide intégralement le corpus avant de toucher `dist/`; l’essai invalide retourne 1 et conserve le hash de `dist/index.html` inchangé.
- La matrice de 22 tests d’intégration utilise uniquement des données fictives en mémoire ou sous `target/`; `content/corpus/` contient seulement `.gitkeep`.
- Aucun ajout de page publique de pièce, OG/JSON-LD dédié, index, Atom ou pièce éditoriale; le périmètre des stories 2.2 à 2.8 reste intact.
- Les gates format, tests debug/release static, clippy, wasm, build release, site-build, smoke statique, topologie, publication, licences et audit ont été exécutées. `cargo audit` termine avec 15 avertissements autorisés sur des dépendances transitives déjà verrouillées; aucune vulnérabilité bloquante n’est signalée par la commande.

### File List

- `Cargo.lock`
- `Cargo.toml`
- `_bmad-output/implementation-artifacts/2-1-gabarit-type-et-pipeline-markdown.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `content/corpus/.gitkeep`
- `src/bin/site-build.rs`
- `src/domain.rs`
- `src/editorial.rs`
- `tests/editorial_pipeline.rs`

### Change Log

- 2026-07-14 — Ajout du contrat corpus typé, du pipeline YAML/CommonMark strict, des diagnostics déterministes, du branchement pré-effets de bord dans `site-build` et de la matrice de tests fictifs; vérification empirique et revue terminées, story passée à done.
