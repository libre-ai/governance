---
story_id: 1.3
story_key: 1-3-navigation-et-gabarit-de-page
epic: 1
title: "Navigation et gabarit de page"
status: ready-for-dev
created: 2026-07-14
updated: 2026-07-14

references:
  epics: _bmad-output/planning-artifacts/epics.md#Story 1.3
  experience: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md
  design: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md
  architecture: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md
  prd_fr21: _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#FR-21
---

# Story 1.3 : Navigation et gabarit de page

**User Story:**

En tant que visiteur,
je veux une navigation claire orientée acheteur et un rendez-vous toujours accessible,
afin de savoir en un regard ce qui est proposé et où contacter.

---

## Acceptance Criteria

### AC-1: Navigation Orientée Acheteur (CORRECTED — Alignement État Réel)

**Given** le header actuel dans `src/lib.rs` (PageFrame, lignes 390–405) avec 6 liens existants : Mission, Produits, Ressources, Rechercher, Méthode, Contribuer

**When** j'ouvre n'importe quelle page du site

**Then** la navigation remplace les 6 liens existants par exactement les cinq sections orientées acheteur :

- Offres
- Corpus
- Collectif
- Interventions
- Chaîne maîtrisée

**And** le CTA "Réserver 30 minutes" est présent en permanence dans l'en-tête et accessible sans scroll.

**And** les routes existantes (produits, méthode, ressources, rechercher, corrections, contribuer) restent intactes dans `src/lib.rs` (AC-7) mais ne sont PAS référencées en navigation (suppression déférée story 1.7).

### AC-2: Footer avec Alternative Contact (CORRECTED — Alignement État Réel)

**Given** le footer actuel dans `src/lib.rs` (lignes 416–423) : texte "Libre IA — comprendre, vérifier, rester capable d'agir." + nav secondaire (Corrections, Code source)

**When** je consulte le pied de page de n'importe quelle page

**Then** le footer remplace le contenu existant et affiche :

- Bloc email : email public de contact `contact@libre-ai.fr` (valeur provisoire, peut être ajustée)
- Formulaire de contact minimal alternatif (nom, organisation, email, message)
- Liens utilitaires (mentions légales, sitemap, flux Atom/feed.xml)
- Tagline "Libre IA — comprendre, vérifier, rester capable d'agir." reste visible (en bas ou haut du footer)

**And** le footer reste accessible et lisible sur tous les breakpoints (responsive).

### AC-3: Header Sticky et Responsive

**Given** les breakpoints définis dans EXPERIENCE.md (sm < 768px, md 768-1023px, lg ≥ 1024px)

**When** la page s'ouvre sur mobile (< 768px)

**Then** le header devient sticky en haut de l'écran avec une hauteur réduite (logo visible)

**And** la navigation se contracte : menu icône (hamburger CSS-only, checkbox hack) accumulant les 5 liens + CTA "Réserver 30 minutes"

**When** l'écran est ≥ 768px

**Then** le header affiche la navigation horizontale complète (texte "Offres", "Corpus", "Collectif", "Interventions", "Chaîne maîtrisée") avec CTA aligné à droite, visible à la hauteur d'écran normal.

### AC-4: Accessibilité Clavier et Focus

**When** j'utilise le clavier pour naviguer (Tab)

**Then** la navigation est intégralement praticable :

- Ordre Tab suit l'ordre de lecture (gauche-droite, haut-bas)
- Focus visible sur chaque lien et bouton (anneau 2px {colors.focus} per DESIGN.md)
- Pas de piège clavier ; Échap ne ferme pas la page (NFR-9)
- Le lien "Réserver 30 minutes" est accessible via Tab sans quitter le header

**And** les éléments interactifs (liens nav, CTA, formulaire footer) ont des cibles tactiles ≥ 44px (DESIGN.md : `{control.touchTarget}: "44px"`).

### AC-5: Cohérence Thème et Jetons de Design

**When** le site se charge

**Then** la navigation utilise les variables CSS des tokens (DESIGN.md) :

- Couleur du texte nav : {colors.ink}
- Couleur des liens : {colors.primary-deep}
- Focus anneau : {colors.focus}
- Spacing (padding, gap) : {spacing.gutter}, {spacing.3}, {spacing.4}, etc.
- Typographie nav : {typography.body-md} ou {typography.label-caps}

**And** le header support les deux thèmes (clair par défaut, sombre via `prefers-color-scheme` ou `data-theme`) sans modification de code.

### AC-6: Pages Squelettes Minimales Honnêtes (CORRECTED — Réutilisation Composants 1.2)

**Given** les cinq nouvelles routes de navigation (offres, corpus, collectif, interventions, chaine-maitrisee) qui n'existent pas encore

**When** le build s'exécute et les routes sont générées (via site-build.rs, ligne 35 : `render_components_document()`)

**Then** chacune dispose d'une page squelette :

- Titre h1 unique identifiant la section
- **Composant EmptyState réutilisé de 1.2** (src/components/empty_state.rs) avec :
  - titre: "Section en construction"
  - description: "Nous enrichissons cette page à chaque évolution."
  - cta_text: "Réserver 30 minutes" | cta_href: "/rdv"
- Aucune 404 interne ; les liens de nav résolvent tous

**And** les pages squelettes restent jusqu'à ce que les épics 2-4 livrent le contenu réel (pas de destruction entre stories).

### AC-7: Routes Legacy Préservées (Pas de Casse) — DÉJÀ SATISFAIT

**Given** les routes actuelles existantes (produits, méthode, ressources, rechercher, corrections, contribuer) déclarées en `src/lib.rs` lignes 96–118

**When** la new navigation est déployée

**Then** aucune régression : **les pages existantes restent accessibles via leurs routes actuelles** (site-build.rs ligne 26 boucle `SitePage::PUBLISHED`)

- `/produits` — toujours fonctionnelle
- `/methode` — toujours fonctionnelle
- `/ressources`, `/rechercher`, `/corrections`, `/contribuer` — intactes

**And** la nouvelle navigation ne les référence pas ; la suppression est déférée à la story 1.7 (Retrait du site legacy).

**And** `git diff --staged` avant commit vérifie : aucun delete sur Route enum, aucun delete sur composant page existant.

---

## Tasks / Subtasks

### Task 1: Implémenter le composant Header Sticky (AC-1, AC-3, AC-4)

- [ ] 1.1 Créer le composant Dioxus `Header` dans `src/components/header.rs`
  - [ ] 1.1.1 Logo libre-ai en haut à gauche (réutiliser asset logo existant, remplacer "libre-ia" si nécessaire)
  - [ ] 1.1.2 Navigation horizontale avec liens vers 5 routes : `/offres`, `/corpus`, `/collectif`, `/interventions`, `/chaine-maitrisee`
  - [ ] 1.1.3 Bouton/Lien CTA "Réserver 30 minutes" en primaire, aligné à droite sur lg+, dans hamburger sur sm
  - [ ] 1.1.4 CSS sticky (position: sticky; top: 0; z-index haut)
  - [ ] 1.1.5 Responsive breakpoint sm (< 768px) : logo+hamburger seulement, nav collapse dans menu

- [ ] 1.2 Ajouter focus visible aux éléments nav (AC-4)
  - [ ] 1.2.1 CSS :focus-visible avec anneau {colors.focus} 2px, offset 4px
  - [ ] 1.2.2 Tester Tab order : logo → nav liens → CTA → (body) — ordre logique

- [ ] 1.3 Tests build + dist/
  - [ ] 1.3.1 Build statique compile sans erreur (`dioxus build --release`)
  - [ ] 1.3.2 Fichier HTML dist/ inclut le header sur chaque page (vérification grep)
  - [ ] 1.3.3 Header HTML est minifié une ligne (performance, pas de saut de ligne superflu)

### Task 2: Implémenter le Footer avec Formulaire et Email (AC-2, AC-4, AC-5)

- [ ] 2.1 Créer le composant Dioxus `Footer` dans `src/components/footer.rs`
  - [ ] 2.1.1 Bloc de contact : email public de Libre IA (valeur TBD, placeholder `contact@libre-ai.fr`)
  - [ ] 2.1.2 Formulaire contact minimal dans le footer
    - [ ] 2.1.2.1 Champs : nom, organisation, email, message (AC-2 : formulaire de contact minimal alternatif)
    - [ ] 2.1.2.2 Honeypot hidden field (champ invisible pour bot detection, NFR-4)
    - [ ] 2.1.2.3 Bouton submit "Envoyer" en secondaire ou discret
    - [ ] 2.1.2.4 Pas de JavaScript requis pour soumission (POST classique)
  - [ ] 2.1.3 Liens utilitaires
    - [ ] 2.1.3.1 Mentions légales → `/mentions-legales`
    - [ ] 2.1.3.2 Sitemap → `/sitemap.xml` ou `/plan-site`
    - [ ] 2.1.3.3 Flux Atom → `/feed.xml` (lien rel="alternate" + footer link)
  - [ ] 2.1.4 Couleur texte footer : {colors.ink}, liens : {colors.primary-deep}, hover subtle
  - [ ] 2.1.5 Spacing footer : padding {spacing.6} ou {spacing.8}, gap {spacing.5}

- [ ] 2.2 Tests accessibilité footer (AC-4)
  - [ ] 2.2.1 Champs formulaire ont `<label for="id">` explicites
  - [ ] 2.2.2 Focus visible sur champs et bouton (test Tab)
  - [ ] 2.2.3 Erreur formulaire affichée en texte explicite, pas couleur seule

- [ ] 2.3 Tests responsive footer
  - [ ] 2.3.1 Footer se stacked en single column sur sm (< 768px)
  - [ ] 2.3.2 Formulaire reste fonctionnel et lisible (input min 44px hauteur)
  - [ ] 2.3.3 Liens utilitaires s'empilent verticalement ou restent horiz selon breakpoint

### Task 3: Créer Les Pages Squelettes et Routes (AC-6, AC-7)

- [ ] 3.1 Ajouter les routes Dioxus dans `src/lib.rs`
  - [ ] 3.1.1 Route `/offres` → page Offres
  - [ ] 3.1.2 Route `/corpus` → page Corpus
  - [ ] 3.1.3 Route `/collectif` → page Collectif
  - [ ] 3.1.4 Route `/interventions` → page Interventions
  - [ ] 3.1.5 Route `/chaine-maitrisee` → page Preuve (NFR : attention au slug français)

- [ ] 3.2 Créer les pages squelettes minimales honnêtes (AC-6)
  - [ ] 3.2.1 Fichier `src/pages/offres.rs` : h1 + empty-state + CTA
  - [ ] 3.2.2 Fichier `src/pages/corpus.rs` : h1 + empty-state + CTA
  - [ ] 3.2.3 Fichier `src/pages/collectif.rs` : h1 + empty-state + CTA
  - [ ] 3.2.4 Fichier `src/pages/interventions.rs` : h1 + empty-state + CTA
  - [ ] 3.2.5 Fichier `src/pages/chaine-maitrisee.rs` : h1 + empty-state + CTA
  - [ ] 3.2.6 Chaque page importe et appelle `<Header />` et `<Footer />`

- [ ] 3.3 Empty-state pour chaque page
  - [ ] 3.3.1 Composant réutilisable `EmptyState` ou inline : titre, microcopy, CTA
  - [ ] 3.3.2 Microcopy honnête (EXPERIENCE.md) : "Section en construction", "Nous enrichissons cette page…"
  - [ ] 3.3.3 CTA : "Réserver 30 minutes" pointe vers `/rdv` squelette (service dêféré, Epic 3)

- [ ] 3.4 Préserver les routes legacy (AC-7)
  - [ ] 3.4.1 Routes `/produits`, `/methode`, `/ressources`, `/rechercher`, `/corrections`, `/contribuer` restent intactes
  - [ ] 3.4.2 Vérifier git status : aucun fichier delete involontaire

### Task 4: Implémenter CTA "Réserver 30 minutes" Universel (AC-1, AC-2)

- [ ] 4.1 Créer composant réutilisable `CallToActionRDV` ou `CTARéserver`
  - [ ] 4.1.1 Bouton/lien texte "Réserver 30 minutes"
  - [ ] 4.1.2 Microcopy optionnelle : "Échange sans engagement, confidentiel" (EXPERIENCE.md)
  - [ ] 4.1.3 Couleur fond : {colors.primary-deep}, texte blanc
  - [ ] 4.1.4 Min-height 44px (AC-4)
  - [ ] 4.1.5 Pointe vers `/rdv` (squelette service, ne pas implémenter le booking ici)

- [ ] 4.2 Placer CTA dans le header
  - [ ] 4.2.1 Header lg+ : CTA aligné à droite
  - [ ] 4.2.2 Header sm : CTA dans le menu hamburger en haut
  - [ ] 4.2.3 Focus et hover : anneau focus + subtle translateY-1px

- [ ] 4.3 Placer CTA dans le footer
  - [ ] 4.3.1 Footer : CTA après le bloc email, avant les liens utilitaires
  - [ ] 4.3.2 Alternatif : footer propose le formulaire OU le lien CTA (TBD : choix à trancher au dev)

### Task 5: Page `/rdv` Squelette avec Formulaire Honnête (AC-1, AC-6)

- [ ] 5.1 Créer route `/rdv` et page
  - [ ] 5.1.1 Fichier `src/pages/rdv.rs`
  - [ ] 5.1.2 h1 : "Réserver 30 minutes"
  - [ ] 5.1.3 Microcopy : "Sélectionnez un créneau et confirmez votre email. Pas de création de compte."
  - [ ] 5.1.4 Formulaire d'attente honnête (voir below)

- [ ] 5.2 Formulaire d'attente honnête (service en Epic 3, ne pas implémenter ici)
  - [ ] 5.2.1 Email publié : `contact@libre-ai.fr` en texte visible (NE PAS formulaire Formspree, Airtable, etc.)
  - [ ] 5.2.2 Lien `mailto:contact@libre-ai.fr` : "Ou écrivez directement"
  - [ ] 5.2.3 Microcopy : "Le formulaire interactif de réservation de créneau arrive sous peu. Pour l'instant, contactez-nous par email ou ce formulaire."
  - [ ] 5.2.4 Form simple (nom, email, message) soumet POST `<form method="POST" action="/api/contact">` (déféré à Epic 3)

- [ ] 5.3 Focus et accessibilité (AC-4)
  - [ ] 5.3.1 Labels explicites sur champs
  - [ ] 5.3.2 Focus visible

---

## Dev Notes

### Architecture Patterns & Constraints

**Source:** ARCHITECTURE-SPINE.md (AD-1, AD-7)

- **Paradigm:** Dioxus 0.7 SSG (static site generation). La page est rendue en HTML pur, zéro JavaScript obligatoire.
- **Routing:** Routes Dioxus déclarées dans `src/lib.rs` `#[derive(Routable)]`. Chaque route = composant Dioxus rendu à la build en HTML.
- **Styling:** Variables CSS depuis DESIGN.md → `assets/tokens.css` (déjà implémenté en 1.1). Inclure `TOKENS_CSS` et `SITE_CSS` dans le `<head>` de chaque page.
- **Components:** Les composants doivent être réutilisables et importer depuis `src/components/`.
- **No JavaScript required:** Formulaires utilisent POST classique (`<form method="POST">`), pas AJAX obligatoire. Amélioration progressive = AJAX/validations client optionnelles.

### Files to Create/Modify

**New files:**

- `src/components/header.rs` — Composant Header sticky
- `src/components/footer.rs` — Composant Footer avec formulaire
- `src/pages/offres.rs` — Page Offres squelette
- `src/pages/corpus.rs` — Page Corpus squelette
- `src/pages/collectif.rs` — Page Collectif squelette
- `src/pages/interventions.rs` — Page Interventions squelette
- `src/pages/chaine-maitrisee.rs` — Page Preuve squelette
- `src/pages/rdv.rs` — Page RDV squelette
- (Optional) `src/components/cta-rdv.rs` — CTA réutilisable

**Modified files:**

- `src/lib.rs` — Ajouter routes (`#[route("/offres")]`, etc.), ajouter mod pages, importer Header/Footer
- `Cargo.toml` — Aucun dépendance nouvelle si en SSG pure

### Testing Approach (Critical from AC-3.1 onwards)

1. **Build:** `dioxus build --release` — must pass, no compile errors on missing routes
2. **Navigation test:** grep `dist/*.html` pour vérifier que chaque page inclut le header avec les 5 liens
3. **Link resolution:** Vérifier que chaque lien `/offres`, `/corpus`, etc. résout sans 404 dans `dist/`
4. **HTML minification:** `dist/index.html` doit être une seule ligne (performance gate Epic 5)
5. **Accessibility test (manual before automation):** Tab through header/footer, check focus rings
6. **Responsive test:** Open `dist/` in browser, test sm (< 768px) collapse vs lg expand

### Code Patterns from Previous Stories

**From 1.1 (Fondations visuelles — COMPLETED 2026-07-14):**

- Tokens CSS déjà implémentés en `assets/tokens.css` : variables {colors._, typography._, spacing.*} disponibles
- Thème sombre supporté via `prefers-color-scheme` + `data-theme` (site.css lignes 6–26)
- Fonts auto-hébergées : Plus Jakarta Sans, Inter, Source Serif 4 déclarées en `assets/fonts/fonts.css`
- SCHEMA IMPORTÉ : _Aucun value en dur dans le code Dioxus ; consommer via `var(--*)` ou classes CSS_

**From 1.2 (Neuf composants — COMPLETED 2026-07-14):**

- Composants Dioxus disponibles : StateBadge, EmptyState, CardOffre, CardCorpus, CitationBlock, MemberFiche, DiscreteDoor, FooterProof, PieceCorpus
- Fichiers respectifs dans `src/components/` : card_corpus.rs, card_offre.rs, citation_block.rs, discrete_door.rs, empty_state.rs, footer_proof.rs, member_fiche.rs, piece_corpus.rs, state_badge.rs
- Exports via `src/components/mod.rs` lignes 11–19 — réutiliser directement `use components::EmptyState` dans le header/footer
- Pattern : `#[component] fn ComponentName(props...) -> Element { rsx! { ... } }`
- **RÉUTILISATION PRÉVUE EN 1.3 :** EmptyState pour les squelettes de pages (AC-6) + FooterProof optionnel si contexte de preuve

### Interdictions Git & Vérifications Obligatoires (Critical — learned from review history)

Per user CLAUDE.md and review feedback :

- **Jamais** de chemin machine-local dans le code (`/Users/ifi6567/...`, `/Users/...` interdit — utiliser chemins relatifs ou `$(git rev-parse --show-toplevel)`)
- **Jamais** de `git` commands sauf `git status`, `git diff`, `git log` en lecture — aucun commit/push/reset/checkout/rm
- **Jamais** de noms clients/employeurs sans autorisation écrite dans le contenu (NFR-5)
- **Jamais** de commit sans lire le diff complet (`git diff --staged` — si contenu imprévu → abort)
- **HTML minifié une ligne** : la version dist/ doit compiler sans sauts de ligne superflus (performance gate)
- **Vérification dist/ obligatoire AVANT dev merge :**
  - `dioxus build --release` → ✓ no errors
  - `ls -la dist/offres/index.html` etc. — tous les fichiers statiques présents
  - Grepper dist/*.html pour vérifier que header contient les 5 liens nav + CTA
  - Tests responsive : ouvrir dist/ dans browser (sm/lg breakpoints) avant commit

### Decisions to Make (Not Defer)

1. **Email public de contact :** Valeur TBD dans placeholder `contact@libre-ai.fr`. À trancher par Constantin ou remplacer à l'implémentation. Doit être authentique (pas fake), valide, et monitorer pour abus (NFR-4 anti-abus passif).

2. **Slug Français :** Route `/chaine-maitrisee` (avec trait d'union, pas underscore) pour coïncider avec FR-21 (EXPERIENCE.md : « Preuve »). Confirmer avec équipe si URL français acceptable (pas de `/proof` anglais fallback).

3. **Menu Hamburger sur SM :** Icône CSS (ex. ☰) ou JavaScript-less hamburger (checkbox hack) ? Recommandation : CSS-only checkbox hack (`<input type="checkbox" id="menu-toggle"> + <label for="menu-toggle">`) pour éviter JS.

4. **Footer Formulaire vs CTA :** Footer propose-t-il le formulaire DE CONTACT, ou uniquement le lien "Réserver 30 minutes" ? EXPERIENCE.md : « email + formulaire », donc **inclure les deux** : email pour contact direct, formulaire pour soumission, lien RDV pour réservation.

### Non-Blocking Notes

- Story 1.3 ne rend pas le booking interactif (la page `/rdv` reste un squelette ; l'endpoint `/api/rdv` est Epic 3 — service conversion). Les liens fonctionnels ne suffisent que pour passer la vérification "aucun 404 interne".
- Les routes legacy (/produits, /méthode, /ressources, /rechercher, /corrections, /contribuer) restent intactes jusqu'à la story 1.7. Pas de redirect 301 à ce stade ; c'est l'Epic 5 (story 5.6) qui s'en charge.
- Wordmark "libre-ia" dans les assets reste inchangé ici (purge déférée à story 1.6).
- **Apprentissages de 1.1 & 1.2 appliqués ici :** Tokens CSS sont opérationnels (utiliser `var(--color-primary-deep)` etc.). Composants réutilisables sont exécutables (EmptyState, FooterProof, DiscreteDoor). Pas de refonte d'approche — l'intégration suit le modèle Dioxus SSG établi.

---

## Dev Agent Record

### Agent Model Used

Claude Haiku 4.5 (20251001)

### Completion Notes List

- [ACTIVATION] Story file created and staged in `{default_output_file}`
- [ARTIFACT_GENERATED] sprint-status.yaml initialized with epic-1 in-progress, story 1-3 ready-for-dev
- [PLANNING] Five skeletal pages created via task subtasks (3.2.1-3.2.5)
- [CONTEXT_LOADED] ARCHITECTURE-SPINE.md, EXPERIENCE.md, DESIGN.md all analyzed and embedded in AC/tasks
- [DECISION_POINTS] Three design decisions flagged in "Decisions to Make" section — email public, slug français, footer layout — all actionable by dev agent without blocker

### File List

- `_bmad-output/implementation-artifacts/1-3-navigation-et-gabarit-de-page.md` (this file)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated: 1-3 → ready-for-dev)

---

**Status:** `ready-for-dev` ✓

This story is ready for the dev agent to implement. All acceptance criteria are testable, all tasks are scoped, and all architectural patterns are embedded from the planning phase.
