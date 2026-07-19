---
story_id: 2.5
story_key: 2-5-flux-atom
epic: 2
title: "Flux Atom"
status: done
created: 2026-07-14
updated: 2026-07-14
baseline_commit: ff0c45a1868c929e8a38ecd2b71d039111342d26
references:
  epics: _bmad-output/planning-artifacts/epics.md#story-25-flux-atom
  prd: _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#41-corpus-de-référence
  architecture: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#ad-3--contenu-en-markdown-strict--front-matter-yaml-parsé-au-domaine-typé
  experience: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md
---

# Story 2.5 : Flux Atom

Status: done

## Story

En tant que relais d’opinion,
je veux m’abonner au corpus,
afin d’être notifié des nouvelles pièces sans visiter le site.

## Acceptance Criteria

### AC1 — Une projection Atom fermée part de l’unique sélection publiée

**Given** le corpus validé par `load_corpus`, puis `select_published_corpus`

**When** le build prépare la syndication

**Then** une projection renderer-independent reçoit cette même sélection `Published` déjà utilisée pour les pages, l’index, le sitemap et le manifeste

**And** elle ne relit ni fichier, ni YAML, ni Markdown et ne filtre pas selon une règle concurrente

**And** chaque pièce publiée, autonome ou brief trimestriel, devient exactement une entrée

**And** aucun brouillon n’apparaît dans le flux, un identifiant, une catégorie, un texte caché ou un warning

**And** les entrées sont ordonnées de façon déterministe par `published_date` antéchronologique, puis par permalien canonique croissant en cas d’égalité

**And** l’identifiant et le lien alternate de chaque entrée sont exactement le canonical issu de `CorpusCitability`/`corpus_route`, sans URL, slug ou domaine reparsé dans le renderer

**And** le domaine porte des types fermés pour le feed, les entrées, les catégories d’assistance et les warnings ; le renderer XML ne reçoit jamais un mapping libre.

### AC2 — `/corpus/feed.xml` respecte le noyau Atom RFC 4287

**Given** la projection Atom validée

**When** elle est sérialisée

**Then** `dist/corpus/feed.xml` est un document XML 1.0 UTF-8 bien formé dont la racine est `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="fr">`

**And** le feed contient exactement un `id` stable égal à `https://libre-ai.fr/corpus/feed.xml`, un titre `Corpus — Libre IA`, un auteur de feed `Libre IA`, un `updated`, un lien `self` de type `application/atom+xml` vers ce même URL et un lien `alternate` HTML vers `https://libre-ai.fr/corpus`

**And** chaque entrée contient exactement un `id`, un titre, un `updated`, un `published`, un auteur humain et un lien HTML `alternate`

**And** `published` dérive de `published_date` et `updated` de `last_review_date`, à minuit UTC au format RFC 3339 `YYYY-MM-DDT00:00:00Z`

**And** le `updated` du feed est le maximum des `last_review_date` publiées ; pour un corpus vide seulement, il prend l’instant réel de génération fourni par le build, arrondi à la seconde

**And** aucun corps HTML, script, image distante, tracker, cookie, requête tierce ou contenu de source n’est injecté dans le flux

**And** l’artefact n’est ni une page de `SitePage::PUBLISHED`, ni une entrée du sitemap ou du manifeste de pages.

### AC3 — `assistance_ia` est répétée sans contenu inventé et toute perte est observable

**Given** une entrée dont `piece.assistance_ia()` contient zéro, une ou plusieurs déclarations typées

**When** la projection Atom est construite

**Then** chaque déclaration produit exactement une catégorie autofermante portant `domain="libre-ai.fr/assistance"`

**And** la même catégorie porte `scheme="https://libre-ai.fr/assistance"`, un `term` dérivé exclusivement du modèle et de sa version, et un `label` dérivé exclusivement du rôle déclaré

**And** l’ordre des catégories est exactement l’ordre versionné du front-matter ; aucune catégorie n’est ajoutée quand la liste est vide

**And** modèle, version et rôle sont échappés comme données XML, jamais interprétés comme balises, entités ou attributs

**And** un caractère interdit par XML 1.0 est remplacé par `U+FFFD` dans la projection et crée un warning structuré nommant uniquement le chemin relatif et le champ concerné, jamais la valeur brute

**And** les warnings sont triés par chemin relatif puis règle avant émission

**And** `site-build` émet chaque warning sur stderr avec le préfixe `warning: projection Atom avec perte:` sans transformer un warning en succès silencieux ni en contenu public

**And** une projection sans perte n’émet aucun warning.

### AC4 — Le flux est découvrable depuis chaque document HTML public

**Given** une page fixe, l’index corpus, une pièce publiée ou la 404

**When** son `<head>` est généré

**Then** il contient exactement une balise `<link rel="alternate" type="application/atom+xml" title="Flux Atom du corpus" href="/corpus/feed.xml">`

**And** canonical, Open Graph, JSON-LD, robots et assets déjà livrés restent inchangés

**And** le footer des pages utilisant `PageFrame` expose un lien visible et descriptif « Flux Atom du corpus » vers le même chemin

**And** aucune page n’ajoute de script ou de logique d’abonnement, et aucun formulaire newsletter/email n’est créé.

### AC5 — Le flux vide est valide, honnête et sans fixture publique

**Given** que `content/corpus/` contient uniquement `.gitkeep`

**When** le site réel est construit

**Then** `/corpus/feed.xml` existe, reste bien formé et contient zéro `<entry>` et zéro catégorie d’assistance

**And** son `updated` est un instant de génération RFC 3339 réel, pas une date éditoriale ou un numéro inventé

**And** le lien de découverte existe sur les huit pages fixes, la 404 et l’index vide

**And** aucun titre, auteur humain, brief, date de publication, source, correction, assistance ou permalien de fixture n’est fabriqué

**And** `content/corpus/`, sitemap et manifeste ne gagnent aucune pièce ni route dynamique.

### AC6 — La publication du feed reste atomique et sûre face aux chaînes hostiles

**Given** des pièces fictives contenant `&`, `<`, `>`, guillemets, apostrophes, séquences ressemblant à des balises et caractères XML interdits dans les champs projetés

**When** le préflight Atom s’exécute

**Then** le document final est XML bien formé, les valeurs autorisées font un aller-retour exact après parsing XML et aucune balise injectée n’apparaît

**And** les caractères interdits suivent uniquement la règle de remplacement + warning d’AC3

**And** identifiants et liens restent des URLs HTTPS sous `https://libre-ai.fr`

**And** projection, rendu du feed, rendu des pages, gate de citabilité, index et validations de collisions terminent avant `remove_dir_all(dist)`

**And** une erreur de projection ou de rendu conserve intégralement l’ancien artefact `dist/`

**And** l’ordre des warnings et des entrées ne dépend ni du système de fichiers, ni de l’heure hors fallback vide, ni d’une HashMap.

### AC7 — Les frontières éditoriales et techniques restent intactes

**Given** la fin de l’Epic 2 technique

**When** la story est terminée

**Then** aucune pièce réelle, aucun auteur réel, aucun brief réel, aucune affirmation éditoriale et aucun chiffre de contenu n’est ajouté — stories 2.6 à 2.8

**And** `content/corpus/` contient toujours uniquement `.gitkeep`

**And** aucune newsletter, capture email, push, webhook, endpoint serveur, base de données, analytics ou service tiers n’est ajouté

**And** aucune dépendance n’est ajoutée ou mise à jour ; le renderer utilise la bibliothèque standard et les crates déjà verrouillées

**And** les pages individuelles, l’index, la citabilité, le sitemap, le manifeste, Pagefind, les redirections et les gates des stories 2.1 à 2.4 restent verts.

## Tasks / Subtasks

- [x] **1. Ajouter la projection Atom fermée au domaine** (AC1, AC2, AC3)
  - [x] Ajouter les constantes stables de chemin/URL/feed et les types `CorpusAtomFeed`, `CorpusAtomEntry`, `AtomAssistanceCategory`, `AtomProjectionWarning` (noms équivalents permis si non ambigus).
  - [x] Construire les entrées uniquement depuis `&[&CorpusPiece]` déjà sélectionné ; réutiliser `CorpusCitability` pour canonical/titre/auteur/dates plutôt que dupliquer les règles.
  - [x] Trier les entrées par date de publication décroissante puis canonical croissant ; calculer le `updated` maximal depuis les dates de dernière revue.
  - [x] Accepter un `DateTime<Utc>` de génération uniquement pour le fallback du feed vide.
  - [x] Projeter chaque assistance en une catégorie ordonnée avec `domain`, `scheme`, `term`, `label`, sans mapping libre.
  - [x] Centraliser la validation des caractères XML 1.0, substitution `U+FFFD` et warnings sans valeur brute ; trier les warnings.

- [x] **2. Sérialiser un document Atom minimal, sûr et déterministe** (AC2, AC3, AC6)
  - [x] Ajouter dans `src/lib.rs` un renderer XML depuis la projection typée ; ne jamais concaténer directement une valeur non échappée.
  - [x] Émettre XML declaration, namespace Atom, `xml:lang`, métadonnées obligatoires, liens self/alternate, puis entrées.
  - [x] Rendre les dates RFC 3339 UTC et les catégories d’assistance exactement une fois chacune.
  - [x] Ne pas inclure le HTML CommonMark, JSON-LD, sources, corrections, description inventée ou contenu distant.
  - [x] Garder le renderer indépendant des fichiers et des états `Draft`.

- [x] **3. Brancher le feed dans le préflight et l’artefact statique** (AC1, AC5, AC6)
  - [x] Dans `site-build`, construire la projection et le XML depuis la même sélection que pages/index/sitemap/manifeste avant tout effet sur `dist/`.
  - [x] Obtenir l’instant vide via `DateTime::<Utc>::from(SystemTime::now())` avec `chrono` déjà configuré `std`, sans activer `clock` ni ajouter de crate.
  - [x] Émettre les warnings déterministes sur stderr sans valeurs de contenu et sans faire échouer les projections avec perte déclarée.
  - [x] Écrire `dist/corpus/feed.xml` après création de `dist/`, sans ajouter le feed à `SitePage::PUBLISHED`, au sitemap ni au manifeste.
  - [x] Étendre `scripts/static-smoke.sh` pour exiger l’artefact et ses marqueurs Atom essentiels.

- [x] **4. Ajouter la découverte Atom aux documents HTML** (AC4, AC5)
  - [x] Étendre l’unique `render_html_document` avec exactement une balise alternate Atom ; ne pas la répliquer dans chaque renderer.
  - [x] Ajouter le lien visible « Flux Atom du corpus » au footer partagé `PageFrame`.
  - [x] Adapter les assertions 2.3/2.4 qui interdisaient volontairement `rel="alternate"` avant cette story, sans affaiblir les autres contrôles de head.
  - [x] Vérifier pages fixes, index, pièces, 404 et page composants ; aucune logique JavaScript.

- [x] **5. Ajouter une matrice TDD fictive et hostile** (AC1 à AC7)
  - [x] Créer `tests/atom_feed.rs` avec fixtures uniquement en mémoire : autonome, brief, brouillon, dates égales/différentes et plusieurs assistances.
  - [x] Tester sélection `Published` uniquement, agrégation autonome + brief, ordre exact, canonical/id stables et feed updated maximal.
  - [x] Tester zéro/une/plusieurs catégories, ordre, `domain`/`scheme`, term/label et warning de perte.
  - [x] Tester chaînes XML hostiles et caractères interdits : aucune injection, échappement exact, warnings relatifs sans valeur brute.
  - [x] Tester feed vide avec timestamp injecté déterministe et zéro entrée/fixture.
  - [x] Tester la balise alternate exactement une fois dans chaque document et le lien footer partagé.
  - [x] Étendre les tests publisher : feed préparé avant effets de bord, écrit au bon chemin, absent du sitemap/manifeste et ancien `dist/` conservé en cas d’erreur de préflight.
  - [x] Étendre Playwright : `/corpus/feed.xml` accessible et parsable, découverte sur les huit pages, zéro contenu dynamique quand le corpus réel est vide.

- [x] **6. Exécuter la vérification empirique et les gates** (AC1 à AC7)
  - [x] Prouver RED avant implémentation sur les nouveaux symboles/artefacts.
  - [x] Construire un feed depuis fixtures temporaires sous `target/`, le parser avec `xml.etree.ElementTree`, vérifier namespace, cardinalités, ordre, URLs, dates, catégories et absence de brouillon.
  - [x] Parser le feed réel vide sous `dist/` avec le même parseur et vérifier zéro entrée.
  - [x] Exécuter `cargo fmt --check`.
  - [x] Exécuter `cargo test --no-default-features --features static` puis la même suite en `--release`.
  - [x] Exécuter `cargo clippy --all-targets --no-default-features --features static -- -D warnings`.
  - [x] Exécuter `cargo check --target wasm32-unknown-unknown --bin libre-ai-website`.
  - [x] Exécuter `cargo build --release --no-default-features --features static` et `cargo run --release --no-default-features --features static --bin site-build`.
  - [x] Exécuter `npm run build`, `bash scripts/static-smoke.sh`, `python3 scripts/check-current-topology.py`, `npm run e2e`.
  - [x] Exécuter `cargo deny check licenses sources` et `cargo audit`; consigner honnêtement les avertissements transitifs autorisés.
  - [x] Vérifier `content/corpus/.gitkeep` seul, aucune fixture publique, aucune dépendance modifiée et aucun chemin machine-local versionné.

## Dev Notes

### Contrat Atom verrouillé

Chemin public stable :

```text
/corpus/feed.xml
https://libre-ai.fr/corpus/feed.xml
```

Structure minimale attendue :

```xml
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="fr">
  <title>Corpus — Libre IA</title>
  <id>https://libre-ai.fr/corpus/feed.xml</id>
  <updated>2026-07-14T00:00:00Z</updated>
  <author><name>Libre IA</name></author>
  <link rel="self" type="application/atom+xml" href="https://libre-ai.fr/corpus/feed.xml"/>
  <link rel="alternate" type="text/html" href="https://libre-ai.fr/corpus"/>
  <entry>
    <title>Titre fictif échappé</title>
    <id>https://libre-ai.fr/corpus/slug-fictif/</id>
    <updated>2026-07-14T00:00:00Z</updated>
    <published>2026-07-01T00:00:00Z</published>
    <author><name>Auteur fictif</name></author>
    <link rel="alternate" type="text/html" href="https://libre-ai.fr/corpus/slug-fictif/"/>
    <category domain="libre-ai.fr/assistance" scheme="https://libre-ai.fr/assistance" term="Modèle fictif (version fictive)" label="rôle fictif"/>
  </entry>
</feed>
```

L’exemple est un contrat de fixture, pas du contenu à publier. Le renderer ne doit pas recopier cet exemple en dur pour fabriquer une entrée.

### Note de conformité RFC 4287

RFC 4287 exige au feed `id`, `title`, `updated` et un auteur de feed sauf si toutes les entrées en ont un ; chaque entrée exige `id`, `title`, `updated` et un lien alternate ou un contenu. `term` est obligatoire sur `atom:category`, `scheme` est l’attribut standard du schéma de catégorie.

AR-2 impose en plus l’attribut non standard historique `domain="libre-ai.fr/assistance"`. Pour respecter la décision projet et préserver l’interopérabilité, chaque catégorie porte **les deux** attributs : `domain` demandé par AR-2 et `scheme="https://libre-ai.fr/assistance"` conforme au modèle Atom. Les tests ne doivent pas prétendre qu’un Relax NG strict accepte l’attribut de compatibilité ; ils prouvent XML bien formé, noyau RFC obligatoire, schéma standard et contrat AR-2.

Source normative consultée le 2026-07-14 : RFC 4287 §§4.1.1, 4.1.2, 4.2.2, 4.2.6, 4.2.7, 4.2.9 et 4.2.15.

### Chaîne de confiance

```text
Markdown non fiable
  -> load_corpus / CorpusPiece validé
  -> select_published_corpus (filtre public unique)
  -> collisions routes + briefs
  -> CorpusCitability / projection Atom fermée
  -> substitution XML 1.0 explicite + warnings structurés
  -> rendu XML échappé en mémoire
  -> rendu pages/citabilité/index en mémoire
  -> suppression puis écriture de dist/
```

Le feed n’est jamais construit depuis le manifeste, le sitemap, l’HTML rendu ou le nom des fichiers.

### Dates et ordre

- Entrées : `published_date` décroissante, puis canonical croissant.
- `published` : date de publication à `00:00:00Z`.
- `updated` d’entrée : date de dernière revue à `00:00:00Z`.
- `updated` du feed non vide : maximum des `updated` d’entrée.
- Feed vide : `DateTime<Utc>` réel injecté par `site-build`, formaté avec `SecondsFormat::Secs` et `use_z = true`.
- Warnings : chemin relatif croissant, puis règle croissante.

Le feed non vide ne dépend jamais de l’heure de build : une reconstruction sans changement éditorial garde le même XML.

### Sécurité XML

Échapper toutes les valeurs en texte/attribut : `&`, `<`, `>`, `"`, `'`. N’insérer ni `RenderedMarkdown`, ni `dangerous_inner_html`, ni CDATA. XML 1.0 admet tabulation, LF, CR, U+0020–U+D7FF, U+E000–U+FFFD et U+10000–U+10FFFF ; tout autre `char` Rust est remplacé par U+FFFD avec warning.

Les warnings ne contiennent jamais le titre, l’auteur, le modèle, la version ou le rôle bruts. Format actionnable attendu :

```text
warning: projection Atom avec perte: content/corpus/2026-fixture-fictive.md: atom.assistance_ia[0].role: caractère interdit par XML 1.0 remplacé
```

### État actuel des fichiers à modifier

#### `src/domain.rs` — UPDATE

- **Actuel :** `CorpusPiece`, `AiAssistance`, `CorpusCitability`, sélection Published, série/index et erreurs de collisions ; aucune projection Atom.
- **Changement :** types/projection Atom, ordre, dates, catégories, sanitation et warnings.
- **Préserver :** domaine sans Dioxus, canonical unique, encapsulation, sélection publique et types des stories 2.1–2.4.

#### `src/lib.rs` — UPDATE

- **Actuel :** renderer HTML commun, documents fixes/index/pièce, canonical/OG/JSON-LD ; aucune syndication et les tests 2.4 interdisent encore `rel="alternate"`.
- **Changement :** renderer XML typé, discovery link unique dans `render_html_document`, lien footer visible.
- **Préserver :** unique frontière Markdown dangereux, sécurité JSON-LD, canonical, zéro hydratation et head existant.

#### `src/bin/site-build.rs` — UPDATE

- **Actuel :** préflight corpus/pages/citabilité/index avant `dist`, puis écrit pages et utilitaires.
- **Changement :** projection/render Atom dans le préflight, warnings stderr, écriture du feed.
- **Préserver :** même sélection, atomicité, huit pages fixes, sitemap/manifeste sans feed, mesures et Pagefind.

#### `scripts/static-smoke.sh` — UPDATE ciblé

- **Actuel :** 14 artefacts obligatoires et contrôles legacy.
- **Changement :** exiger `dist/corpus/feed.xml` et marqueurs Atom/discovery, compte calculé par le tableau.

#### `tests/atom_feed.rs` — NEW

Matrice domaine/renderer hostile et entièrement fictive. Aucun snapshot contenant une pièce réelle.

#### `tests/corpus_index.rs`, `tests/corpus_page.rs`, `e2e/site.spec.ts` — UPDATE ciblé

Remplacer uniquement les assertions de non-préemption 2.4 (`rel="alternate"` absent) par le contrat exact de découverte 2.5 ; conserver toutes les autres preuves.

#### `content/corpus/.gitkeep` — UNTOUCHED

### Bibliothèques et versions

Aucune dépendance ni mise à jour :

| Bibliothèque | Version/configuration | Usage |
|---|---|---|
| chrono | 0.4.45, `default-features = false`, `std`, `serde` | `DateTime<Utc>` depuis `SystemTime`, minuit UTC, RFC 3339 |
| url | 2.5.8 | canonical déjà typé via `CorpusCitability` |
| Dioxus / dioxus-ssr | 0.7.9 | documents HTML et découverte seulement |
| serde_json | 1.x | inchangé ; ne pas l’utiliser comme pseudo-renderer XML |

La documentation Chrono confirme que l’intégration `std::time` est portée par la feature `std`, que `NaiveDate::and_hms_opt(...).and_utc()` produit un `DateTime<Utc>` et que `to_rfc3339_opts(SecondsFormat::Secs, true)` produit le suffixe `Z`.

### Previous Story Intelligence

- 2.2 a livré `select_published_corpus` comme filtre public unique et les canonical stables ; le feed doit consommer son résultat.
- 2.3 a livré `CorpusCitability` et la neutralisation des contextes de sérialisation ; réutiliser canonical/titre/auteur/dates et appliquer une frontière XML distincte.
- 2.4 a livré `CorpusSeries`, la collision des numéros, l’index et le préflight avant `dist`; le feed agrège autonomes et briefs sans créer de route de série.
- La revue 2.4 a détecté les coercitions silencieuses par preuve empirique : ne jamais confondre « tests verts » et validité réelle ; parser le XML produit avec un parseur indépendant.
- Le corpus réel est vide et doit le rester ; toutes les fixtures vivent en mémoire ou sous `target/`.
- Tests actuels : 69 Rust en debug/release et 32 E2E avant cette story.

### Git Intelligence

Baseline attendue : commit `ff0c45a` (`feat(story-2.4): publish typed corpus index`). Les commits 2.1–2.4 sont atomiques, en anglais, sans `Co-Authored-By`. Les changements se concentrent sur domaine → renderer → publisher → tests et documentent les sorties réellement exécutées.

### Scope Guardrails

- Travailler uniquement dans `/.claude/worktrees/impl-bmad/` ; ne jamais modifier l’arbre parent.
- Aucun contenu réel, nom client, auteur humain réel, chiffre éditorial ou pièce de démonstration publique.
- Aucune dépendance, aucun parser XML ajouté, aucun service de feed tiers.
- Aucun changement du schéma Markdown : `assistance_ia` existe déjà et reste inchangé.
- Aucun travail autonome sur 2.6, 2.7 ou 2.8.
- Aucun fichier à supprimer.
- Sécurité > qualité > performance > complétude.

### Project Structure Notes

```text
src/domain.rs                                  UPDATE
src/lib.rs                                     UPDATE
src/bin/site-build.rs                          UPDATE
scripts/static-smoke.sh                        UPDATE
tests/atom_feed.rs                             NEW
tests/corpus_index.rs                          UPDATE ciblé
tests/corpus_page.rs                           UPDATE ciblé
e2e/site.spec.ts                               UPDATE ciblé
_bmad-output/implementation-artifacts/
  sprint-status.yaml                           UPDATE
content/corpus/.gitkeep                        UNTOUCHED
Cargo.toml / Cargo.lock / package*.json        PRESERVE
```

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.5, FR-5, AR-2]
- [Source: `_bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md` — §4.1 FR-5, §4.6 FR-22, §5 A3, §10 NFR-2/7/11/12]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md` — AD-1, AD-3(b), AD-8, Capability Map]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md` — Flux 2, anti-pratique newsletter, socle accessibilité]
- [Source: RFC 4287 — §§4.1.1, 4.1.2, 4.2.2, 4.2.6, 4.2.7, 4.2.9, 4.2.15]
- [Source: `_bmad-output/implementation-artifacts/2-4-index-du-corpus-et-serie-trimestrielle.md` — sélection, atomicité, fixtures, revue empirique]
- [Source: `src/domain.rs`, `src/lib.rs`, `src/bin/site-build.rs`, `scripts/static-smoke.sh`, `tests/corpus_index.rs`, `tests/corpus_page.rs`, `e2e/site.spec.ts`, `Cargo.toml` — baseline `ff0c45a`]

## Dev Agent Record

### Agent Model Used

Non exposé par le harnais de cette session.

### Debug Log References

#### TDD RED

Commande : `cargo test --no-default-features --features static --test atom_feed`

```text
error[E0432]: unresolved imports `libre_ai_website::domain::ATOM_ASSISTANCE_DOMAIN`, `libre_ai_website::domain::ATOM_ASSISTANCE_SCHEME`, `libre_ai_website::domain::ATOM_FEED_PATH`, `libre_ai_website::domain::ATOM_FEED_URL`, `libre_ai_website::domain::project_corpus_atom`
error[E0432]: unresolved import `libre_ai_website::render_corpus_atom_feed`
error: could not compile `libre-ai-website` (test "atom_feed") due to 2 previous errors
```

#### Preuves empiriques indépendantes

Feed temporaire non vide construit sous `target/`, puis parsé avec `xml.etree.ElementTree` :

```text
warning: projection Atom avec perte: content/corpus/2026-autonome.md: atom.assistance_ia[1].role: caractère interdit par XML 1.0 remplacé
published=2 entries=2 categories=2 warnings=1 draft_visible=false
atom-fixture-empirical: PASS entries=2 categories=2 order=['https://libre-ai.fr/corpus/autonome/', 'https://libre-ai.fr/corpus/brief-t2/'] updated=2026-08-05T00:00:00Z
```

Feed vide réel et découverte sur tous les documents HTML de `dist/` :

```text
atom-empty-empirical: PASS root=feed entries=0 html_documents=10 discovery_once=true
```

#### Revue fraîche — finding corrigé

La revue sécurité/qualité/performance/complétude a détecté une duplication de l’origine canonique dans deux constantes Atom. Les URLs du feed et de son alternate sont désormais dérivées de `CANONICAL_ORIGIN`, `ATOM_FEED_PATH` et `SitePage::Corpus`; le titre réutilise aussi `SitePage::Corpus.title()`. Revue finale : 10 fichiers, 0 finding critique, 0 avertissement, 0 suggestion ; dépendances, PII et souveraineté inchangées.

#### Gates finales — sorties brutes obtenues

`cargo fmt --check`

```text
```

`cargo test --no-default-features --features static`

```text
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 9 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 20 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 31 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo test --release --no-default-features --features static`

```text
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 9 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 20 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
test result: ok. 31 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo clippy --all-targets --no-default-features --features static -- -D warnings`

```text
Finished `dev` profile [unoptimized + debuginfo] target(s) in 2.06s
```

`cargo check --target wasm32-unknown-unknown --bin libre-ai-website`

```text
Finished `dev` profile [unoptimized + debuginfo] target(s) in 2.06s
```

`cargo build --release --no-default-features --features static`

```text
Finished `release` profile [optimized] target(s) in 0.11s
```

`cargo run --release --no-default-features --features static --bin site-build`

```text
Finished `release` profile [optimized] target(s) in 0.09s
Running `target/release/site-build`
✓ Measurement complete
  Page size: 59 KB (4373 bytes)
  Third-party requests: 0
  Date: 2026-07-14T20:02:30Z
  Output: dist/.weights.json
site-build: 8 pages publiées dans dist/
```

`npm run build` — la ligne Pagefind contenant le chemin machine-local n’est volontairement pas versionnée ; les autres lignes ci-dessous sont les sorties obtenues.

```text
> build
> bash scripts/build-static.sh

✓ Measurement complete
  Page size: 59 KB (4373 bytes)
  Third-party requests: 0
  Date: 2026-07-14T20:02:31Z
  Output: dist/.weights.json
site-build: 8 pages publiées dans dist/

Running Pagefind v1.4.0 (Extended)
Source:       "dist"
Output:       "dist/pagefind"
Found 10 files matching **/*.{html}
Indexed 8 pages
Indexed 328 words
Finished in 0.017 seconds
static-smoke: PASS (15 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
```

`bash scripts/static-smoke.sh`

```text
static-smoke: PASS (15 artefacts obligatoires, 7 legacy redirects 301 vérifiés)
```

`python3 scripts/check-current-topology.py`

```text
check-current-topology: PASS (canonical origin libre-ai.fr, 7 legacy 301s, routes clean, brand libre-ai)
```

`npm run e2e`

```text
> e2e
> playwright test

Running 36 tests using 7 workers

36 passed (5.4s)
```

`cargo deny check licenses sources`

```text
licenses ok, sources ok
```

`cargo audit`

```text
warning: 15 allowed warnings found
```

Les 15 avertissements autorisés restent transitifs et préexistants dans la chaîne Dioxus verrouillée : `RUSTSEC-2024-0411`, `RUSTSEC-2024-0412`, `RUSTSEC-2024-0413`, `RUSTSEC-2024-0414`, `RUSTSEC-2024-0415`, `RUSTSEC-2024-0416`, `RUSTSEC-2024-0418`, `RUSTSEC-2024-0419`, `RUSTSEC-2024-0420`, `RUSTSEC-2024-0429`, `RUSTSEC-2024-0436`, `RUSTSEC-2024-0370`, `RUSTSEC-2025-0057`, `RUSTSEC-2026-0097`, plus `spin 0.9.8` yanked. Ils ne sont pas présentés comme corrigés et aucune dépendance n’a été modifiée.

Contrôles d’hygiène finaux :

```text
content/corpus entries:
.gitkeep
content-only-gitkeep: PASS
dependencies-unchanged: PASS
story-no-machine-local-path: PASS
diff-check: PASS
```

### Completion Notes List

- Approche TDD suivie : les imports/projections Atom ont d’abord échoué en RED, puis les tests ont guidé domaine, renderer, publisher, découverte et gates.
- Une projection renderer-independent produit une entrée par pièce déjà sélectionnée `Published`, autonome ou brief, triée par publication décroissante puis canonical ; le `updated` global vient de la revue la plus récente.
- Les URLs et le titre Atom réutilisent les vérités canoniques existantes ; le feed vide reçoit uniquement l’instant injecté et ne fabrique aucune entrée.
- Chaque assistance devient une catégorie ordonnée avec `domain`, `scheme`, `term` et `label`; les valeurs sont échappées, les caractères XML 1.0 interdits remplacés par `U+FFFD`, et les warnings relatifs ne contiennent aucune valeur brute.
- Le feed minimal n’expose ni corps, ni source, ni correction, ni script, ni contenu distant. La compatibilité AR-2 conserve l’attribut `domain` demandé et ajoute `scheme` pour la sémantique Atom.
- Projection, rendu et validation Atom terminent avant toute suppression de `dist/`; le test sentinelle prouve la conservation de l’ancien artefact en cas de divergence.
- `/corpus/feed.xml` est produit sans devenir une page, une URL de sitemap ou une entrée de manifeste. Les dix HTML construits portent exactement une découverte Atom et le footer partagé fournit un lien visible.
- Les preuves indépendantes par `xml.etree.ElementTree` valident le feed réel vide et un feed temporaire hostile : deux publications, deux catégories, ordre/URLs/dates exacts, un warning et aucun brouillon.
- Toutes les gates ont été réexécutées après la correction de revue : 75 tests Rust en debug et 75 en release, 36 E2E, clippy/wasm/build/smoke/topologie/deny verts ; audit inchangé avec 15 avertissements transitifs autorisés.
- Aucun contenu public, aucune dépendance et aucun fichier hors worktree n’ont été ajoutés ou modifiés ; `content/corpus/` contient uniquement `.gitkeep`.

### File List

- `_bmad-output/implementation-artifacts/2-5-flux-atom.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `e2e/site.spec.ts`
- `scripts/static-smoke.sh`
- `src/bin/site-build.rs`
- `src/domain.rs`
- `src/lib.rs`
- `tests/atom_feed.rs`
- `tests/corpus_index.rs`
- `tests/corpus_page.rs`

### Change Log

- 2026-07-14 — Story créée depuis la baseline `ff0c45a` et passée à `ready-for-dev`; aucune implémentation ni pièce de corpus ajoutée.
- 2026-07-14 — Projection Atom typée, sérialisation sûre, warnings XML, préflight atomique, découverte HTML, smoke et E2E implémentés ; preuves vide/non vide et matrice complète vertes.
- 2026-07-14 — Revue fraîche : duplication de l’origine canonique corrigée, toutes les gates repassées ; story passée à `done`.
