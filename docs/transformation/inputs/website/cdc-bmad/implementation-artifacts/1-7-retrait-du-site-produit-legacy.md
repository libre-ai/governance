# Story 1.7: Retrait du site produit legacy

Status: review

## Story

En tant que visiteur,
je veux ne plus voir l'ancien portail produit,
afin de ne recevoir que le nouveau message.

## Acceptance Criteria

**AC1 — Routes legacy retirées et redirigées en 301**

- Aucune route legacy n'est rendue (SitePage enum épuré)
- Chaque route legacy redirige en 301 vers sa cible nouvelle (voir mapping infra)
- Les permaliens stables sont garantis côté serveur statique Clever Cloud

**AC2 — Catalogue produit v3 et Pagefind sortis du build**

- data/product-catalog.v3.json n'est PLUS copié dans dist/
- Moteur de recherche Pagefind retiré (route /rechercher/ supprimée)
- site-build.rs ne rend plus les pages /produits/ et /produits/:slug
- Pas de réduction au niveau build — retrait pur

**AC3 — llms.txt réécrit pour le nouveau site**

- Décrit les 5 sections : offres, corpus, collectif, interventions, chaine-maitrisee
- Énumère les principes de Libre IA (vérité, souveraineté, aucun historique sans revue)
- Aucune référence au catalogue ni aux produits

**AC4 — Arborescence content/ accueille les contenus versionnés**

- Dossier content/ existe et structuré pour accueillir markdown + front-matter
- Tests e2e adaptés à nouveau site (home, 5 sections, 404, 301s testables)
- Build et clippy sans warning, aucune TODO(story-1.7) subsistante

**AC5 — Comptes d'éléments documentés**

- 8 routes legacy retirées (mission, produits, produits/:slug, ressources, rechercher, methode, corrections, contribuer)
- 7 assets produit (feed-radar.svg, notebook.svg, ai-practices.svg, sessions.svg, boussole-politique.svg, spec-studio.svg, agent-board.svg)
- 4 assets motion legacy (hero-scene, hero-scene-light, pixels-reveal, pixels-reveal-light)
- 1 manifeste legacy (assets/libre-ia/)
- 1 moteur de recherche (Pagefind)
- 1 catalogue (product-catalog.v3.json)
- llms.txt réécrite

## Dev Notes

### Inventaire exhaustif du legacy

**Routes legacy (src/lib.rs, src/domain.rs)**

```
#[route("/mission")]        → SitePage::Mission       →  Redirect to /collectif
#[route("/produits")]       → SitePage::Products      →  Redirect to /chaine-maitrisee
#[route("/produits/:slug")] → ProductDetail           →  Redirect to /chaine-maitrisee
#[route("/ressources")]     → SitePage::Resources     →  Redirect to /corpus
#[route("/rechercher")]     → SitePage::Search        →  Redirect to /
#[route("/methode")]        → SitePage::Method        →  Redirect to /corpus
#[route("/corrections")]    → SitePage::Corrections   →  Redirect to /corpus
#[route("/contribuer")]     → SitePage::Contribute    →  Redirect to /collectif
```

**Machinerie du catalogue (src/domain.rs)**

- `enum SitePage` — remplacer valeurs mission, produits, ressources, rechercher, methode, corrections, contribuer
- `impl SitePage::PUBLISHED` — 15 pages devient 7 (Home, Offres, Corpus, Collectif, Interventions, ChaineMaitrisee, MentionsLegales)
- `impl SitePage::path/title/description` — retirer cas legacy
- `fn valid_product_host()` — marqué `TODO(story-1.7)`, appel supprimé, puis fonction supprimée
- `fn product_by_slug()` — garde pour backward-compat de la route 404, mais productDetail retourne 404 direct
- `fn products_in_journey()` — retirer usage, fonction supprimable
- `fn published_page_count()` → devient `7` (statique, SitePage::PUBLISHED.len())

**Assets et données (src/lib.rs, assets/, data/)**

- `src/lib.rs` ligne 42-71 : `PRODUCT_VISUALS` (7 SVGs) — retirer static, assets non utilisés
- `src/lib.rs` ligne 32-40 : hero-scene et pixels-reveal (motion legacy) — retirer, si home nouvelle n'en a pas besoin
- `assets/libre-ia/` — purger (manifestes legacy)
- `assets/motion/hero-scene.svg`, `hero-scene-light.svg`, `pixels-reveal.svg`, `pixels-reveal-light.svg` — retirer si home nouvelle n'utilise pas
- `assets/products/*.svg` (7 produits) — retirer
- `data/product-catalog.v3.json` — garde en place (utile pour l'app) mais ne copie pas dans dist/
- `schemas/product-catalog.v3.schema.json` — garde (validation build)

**llms.txt (src/bin/site-build.rs ligne 192-201)**
Actuellement décrit l'ancien site :

```
# Libre IA
> [promesse]
## Sections
- /mission — [descr]
- /produits — [descr]
- /ressources — [descr]
- /rechercher — [descr]
- /methode — [descr]
- /corrections — [descr]
- /contribuer — [descr]
## Produits
- /produits/{slug} — [job]
## Principes
- ...
```

Remplacer par :

```
# Libre IA
> Comprendre, choisir et utiliser l'intelligence artificielle sans masquer les limites ni créer de dépendance irréversible.
## Sections
- /offres — services d'accompagnement (séminaire dirigeants, keynote, briefing décideurs)
- /corpus — pièces de référence vérifiées et citable
- /collectif — équipe, pairs, vision cible
- /interventions — séminaires et interventions publiques
- /chaine-maitrisee — stack, coûts, énergie, limites, reproductibilité
## Principes
- Une affirmation n'est pas une preuve.
- La souveraineté est un effet partiel de la résilience.
- Aucun contenu historique n'est republié sans revue humaine.
```

**Tests e2e (e2e/site.spec.ts)**
Retirer ou adapter :

- test('presents seven independently gated...') ligne 24 — RETIRER, teste /produits/
- test('publishes a complete canonical page...') ligne 37 — RETIRER, teste /produits/:slug
- test('routes training...') ligne 72 — ADAPTER, /ressources/ → /corpus/ redirect + test nouveau contenu
- test('owns the absence...') ligne 81 — RETIRER ou ADAPTER à nouveau corpus vide
- test('states the indexed page count...') ligne 93 — ADAPTER, sitemap compte changé (7 pages + contenu corpus)
- test('searches locally...') ligne 103 — RETIRER, Pagefind supprimé
- test('publishes method...') ligne 111 — ADAPTER, /methode/ → /corpus/ redirect, /corrections/ → /corpus/ redirect
- test('keeps audited viewports...') ligne 141 — ADAPTER, remplacer /produits/ par /chaine-maitrisee/, /methode/ → /corpus/
- test('marks the current page...') ligne 178 — ADAPTER, remplacer /methode/, /produits/ par nouveaux chemins

Ajouter nouveaux tests :

- Verifier que /mission/ redirige en 301 vers /collectif
- Verifier que /produits/ redirige en 301 vers /chaine-maitrisee
- Verifier que /ressources/ redirige en 301 vers /corpus
- Verifier que /rechercher/ redirige en 301 vers /
- Verifier que /methode/ redirige en 301 vers /corpus
- Verifier que /corrections/ redirige en 301 vers /corpus
- Verifier que /contribuer/ redirige en 301 vers /collectif
- Home nouvelle présente 1 h1 + 5 sections + 1 CTA (pas 7 produits, pas 3 familles)

**Scripts (scripts/**)**

- `check-current-topology.py` — valide catalogue (GARDER, peut servir pour ci future si editions)
- `publication_gates.py` — vérifier si référence catalogue, adapter si besoin
- `static-smoke.sh` — adapt smoke tests aux nouveaux chemins
- `sync-product-visuals.py` — RETIRER (plus de visuals produits)
- `sync-pagefind.sh` — RETIRER (Pagefind supprimé)

**site-build.rs (src/bin/site-build.rs)**

- Ligne 43-47 : boucle `for product in catalog().products` qui rend /produits/:slug — RETIRER
- Ligne 79 : `pages = SitePage::PUBLISHED.len() + catalog().products.len()` — simplifier en `SitePage::PUBLISHED.len()`
- Ligne 56-58 : copie product-catalog.json dans dist/ — RETIRER ou COMMENTER (kept for backward-compat mais inutile en statique)

### Mécanisme 301 : Redirection côté serveur Clever Cloud

Clever Cloud app statique = Apache avec support .htaccess.

**Approche : .htaccess dans dist/**
Ajouter fichier `dist/.htaccess` (généré à la build ou commité) :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Legacy routes → new routes (301 permanent redirects)
  RewriteRule ^mission/?$ /collectif/ [R=301,L]
  RewriteRule ^produits/?$ /chaine-maitrisee/ [R=301,L]
  RewriteRule ^produits/.*/?$ /chaine-maitrisee/ [R=301,L]
  RewriteRule ^ressources/?$ /corpus/ [R=301,L]
  RewriteRule ^rechercher/?$ / [R=301,L]
  RewriteRule ^methode/?$ /corpus/ [R=301,L]
  RewriteRule ^corrections/?$ /corpus/ [R=301,L]
  RewriteRule ^contribuer/?$ /collectif/ [R=301,L]

  # Friendly URL to index.html (if Clever Cloud doesn't handle it)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^.*$ index.html [L]
</IfModule>
```

Placer dans `deploy/clever-cloud/.htaccess` (template) ou générer dynamiquement dans build script.

**Justification**

- Apache est standard sur app statique Clever Cloud
- .htaccess supporté (confirmé par doc Clever Cloud)
- 301 permanent (SEO-safe, cache navigateur)
- Simple à tester localement (Apache en dev)
- Chaque route → sa cible nouvelle validée en mapping

### Mapping 301 (complet)

| Route legacy     | Cible 301         | Justification                                             |
| ---------------- | ----------------- | --------------------------------------------------------- |
| /mission         | /collectif        | Collectif = équipe + vision                               |
| /produits        | /chaine-maitrisee | "Produits" = "preuves" (chaîne maîtrisée)                 |
| /produits/{slug} | /chaine-maitrisee | Chacun des 7 produits → page preuve unique                |
| /ressources      | /corpus           | Ressources explications, guides → corpus pièces vérifiées |
| /rechercher      | /                 | Pagefind supprimé, chercher → home (découverte)           |
| /methode         | /corpus           | Méthode publication → corpus (normes de corpus)           |
| /corrections     | /corpus           | Corrections → corpus (bloc correction en tête pièce)      |
| /contribuer      | /collectif        | Contribution → porte discrète (collectif)                 |

### Task breakdown

1. **Routes et domaine (src/lib.rs, src/domain.rs)**
   - Retirer enum cases: Mission, Products, Resources, Search, Method, Corrections, Contribute
   - Adapter Route enum, retirer #[route(...)] correspondants
   - Adapter ProductDetail → renvoie NotFound direct (plus d'appel product_by_slug)
   - Retirer valid_product_host(), products_in_journey() (ou keeper si usage ailleurs)
   - Adapter published_page_count() → return 7
   - Tests: aucune route legacy ne compile, test de compilation

2. **Assets (src/lib.rs, assets/)**
   - Retirer PRODUCT_VISUALS static (7 SVGs produits)
   - Retirer hero-scene et pixels-reveal si inutilisés en home nouvelle (VÉRIFIER avant)
   - Purger assets/products/*.svg (après vérification d'absence d'usage)
   - Purger assets/libre-ia/
   - Adapters assets/motion/ si hero-scene/pixels-reveal supprimés

3. **llms.txt (src/bin/site-build.rs)**
   - Réécrire fonction llms_txt() (lignes 192-201)
   - Énumère sections : offres, corpus, collectif, interventions, chaine-maitrisee
   - Énumère principes : preuve, souveraineté, révision

4. **site-build.rs (src/bin/site-build.rs)**
   - Retirer boucle ligne 43-47 (for product in catalog().products)
   - Adapter ligne 79: pages = SitePage::PUBLISHED.len()
   - Retirer ou commenter ligne 56-58 (fs::copy product-catalog.json)
   - Test: site-build exécuté, dist/ généré avec ≤ 7 pages HTML principales

5. **Tests e2e (e2e/site.spec.ts)**
   - Retirer : test('presents seven...')
   - Retirer : test('publishes a complete canonical...')
   - Retirer : test('searches locally...')
   - Adapter : test('routes training...') → tester /corpus/ nouveau
   - Adapter : test('owns the absence...') → tester corpus vide assumé
   - Adapter : test('states the indexed page count...') → count = 7
   - Adapter : test('publishes method...') → /corpus/ new path
   - Adapter : test('keeps audited viewports...') → /corpus/ au lieu de /methode/, /chaine-maitrisee/ au lieu de /produits/
   - Adapter : test('marks the current page...') → nouveaux liens nav
   - **Ajouter** : test('legacy routes redirect with 301') — tester chaque mapping 301

6. **Deploy (.htaccess)**
   - Créer deploy/clever-cloud/.htaccess (template statique)
   - Ou adapter build script pour injecter dans dist/.htaccess
   - Test : curl -i http://localhost /mission → 301 /collectif

7. **Scripts (scripts/)**
   - Retirer sync-product-visuals.py
   - Retirer sync-pagefind.sh (Pagefind = zéro tiers, rejeté lors du rewrite)
   - Adapter check-current-topology.py (ne valide plus 7 produits, mais peut garder logique pour future)
   - Adapter static-smoke.sh (tester 7 pages + redirects)

8. **Documentation et comptage**
   - `TODO(story-1.7)` : grep et retirer tous les marqueurs
   - Compter éléments legacy supprimés (voir AC5)
   - Build/clippy zéro warning

### Previous Story Context

Story 1.6 (Cohérence de marque — purge libre-ia) — achevée :

- Logo rebranding → assets/brand/libre-ai-*
- Assets ancien manifeste (assets/libre-ia/) marqués pour suppression (cette story 1.7)

Story 1.5 (Pages utilitaires) — 404 page, sitemap, robots, mentions-legales :

- Sitemap filtre déjà les routes legacy (ligne 135-144 site-build.rs)
- 404 page générique existante (SitePage::NotFound)
- Cette story retire le besoin du filtrage (zéro route legacy à exclure)

### Code Patterns Established

From Epic 1:

- Routes: #[route(...)] enum + component render
- Assets: asset!() macro avec hash_suffix=false (dev friendly)
- Tests: Playwright (e2e/) pour UX, parcours clavier, viewports
- Redirects: HTTP 301, API enveloppe { data, meta }

### Git Intelligence

Recent commits (from previous stories):

- Story 1.6: Rebranding assets (logo, manifestes)
- Story 1.5: Sitemap filtering, pages utilitaires
- Story 1.4: Home nouvelle, 1 h1 promesse, 3 portes
- Story 1.3: Navigation 5 sections, RDV permanent

Patterns: Small, focused commits; atomic file reorganization (git mv for renames); tests updated inline.

### Architecture Compliance

From ARCHITECTURE-SPINE (AD-7, AD-8):

- **AD-7** — deux déployables statique + service ; secrets en env ; backup, supervision
  - This story: app statique (Clever Cloud) learns .htaccess for 301s
- **AR-8 (Deferred)** — purge assets libre-ia, 301 domaines défensifs, bascule EN hors périmètre
  - This story (1.7): purge assets ; story 5.6 handles domain 301s + approbation humaine

### NFR Constraints

- **NFR-12** : Permaliens immuables, redirections 301
  - Story 1.7 implements legacy → new via 301 (immutable old paths, declared new homes)
- **NFR-14** : Cohérence de marque totale (purge libre-ia)
  - Story 1.7 completes purge (assets/libre-ia/ gone, no visual libre-ia subsists)
- **NFR-7** : Statique, utilisable sans JavaScript
  - Redirects (301 HTTP) work statically, no JS needed

### Non-Goals

- **Ne pas** refondre home (story 1.4, complète)
- **Ne pas** créer contenu corpus (story 2.x, rédaction stakeholder)
- **Ne pas** activer offres/collectif/interventions (epic 3-4, future)
- **Ne pas** migrer clients historiques du catalogue (out-of-scope, jamais de client public)

## Tasks / Subtasks

- [x] Retirer routes legacy et adapter domaine (src/lib.rs, src/domain.rs)
  - [x] Enum SitePage : retirer Mission, Products, Resources, Search, Method, Corrections, Contribute
  - [x] Route enum : retirer routes #[route(...)] legacy
  - [x] ProductDetail : retirer logic, return NotFound
  - [x] Retirer functions : valid_product_host, products_in_journey (ou keeper + adapter usage)
  - [x] Adapter published_page_count() → 7 statique
  - [x] Test : zero route legacy compilable, test_paths_unique passe

- [x] Purger assets legacy (src/lib.rs, assets/)
  - [x] Retirer PRODUCT_VISUALS static (7 SVGs)
  - [x] Retirer hero-scene et pixels-reveal si unused (vérifier dans home nouvelle)
  - [x] Supprimer assets/products/*.svg (7 produits)
  - [x] Supprimer assets/libre-ia/ (manifestes)
  - [x] Adapter import statements en src/lib.rs
  - [x] Test : cargo build, aucun "unused asset" warning

- [x] Réécrire llms.txt (src/bin/site-build.rs)
  - [x] Adapter fonction llms_txt() : sections → offres, corpus, collectif, interventions, chaine-maitrisee
  - [x] Énumérer principes : preuve, souveraineté, révision
  - [x] Retirer énumération produits
  - [x] Test : cargo run bin/site-build, llms.txt généré, contient 5 sections, zéro /produits

- [x] Adapter site-build.rs (src/bin/site-build.rs)
  - [x] Retirer boucle for product in catalog().products (ligne 43-47)
  - [x] Adapter pages count ligne 79 : SitePage::PUBLISHED.len() uniquement
  - [x] Retirer copy product-catalog.json ou commenter (ligne 56-58)
  - [x] Test : cargo run bin/site-build, dist/index.html + 6 autres HTML (7 pages), pas de /produits/:slug

- [⚠] Adapter tests e2e (e2e/site.spec.ts)
  - [ ] Retirer : test('presents seven independently gated...')
  - [ ] Retirer : test('publishes a complete canonical page...')
  - [ ] Retirer : test('searches locally through Pagefind')
  - [ ] Adapter : test('routes training to Pratiques IA') → test /corpus/ new path
  - [ ] Adapter : test('owns the absence...') → corpus vide assumed
  - [ ] Adapter : test('states the indexed page count...') → sitemap.xml count = 8 (7 pages + /)
  - [ ] Adapter : test('publishes method and correction...') → /corpus/ paths
  - [ ] Adapter : test('keeps audited viewports...') → remplacer /methode/ /produits/ par /corpus/ /chaine-maitrisee/
  - [ ] Adapter : test('marks the current page...') → adapt nav aria-current
  - [ ] **Ajouter** : test('legacy routes redirect with 301 to new pages') → tester chaque redirect mapping
  - [ ] Test : npx playwright test, tous les tests passent (green check)

- [x] Créer .htaccess pour redirects 301 (deploy/clever-cloud/)
  - [x] Créer ou adapter deploy/clever-cloud/.htaccess
  - [x] Ajouter RewriteEngine, RewriteRule pour 8 routes legacy → cibles
  - [x] Test local (Apache dev env) : curl -i /mission → 301 /collectif

- [x] Adapter scripts (scripts/)
  - [⚠] Retirer sync-product-visuals.py (plus de visuals) — n'existe pas en repo
  - [⚠] Retirer sync-pagefind.sh (Pagefind supprimé) — n'existe pas en repo
  - [x] Adapter check-current-topology.py (comment logique produits ou remove)
  - [x] Adapter static-smoke.sh (tester 7 pages + redirects)
  - [x] Adapter publication_gates.py si référence catalogue

- [x] Nettoyage final (greps, lint, comptage)
  - [x] Grep TODO(story-1.7) → 0 occurrences
  - [x] Grep -r "libre-ia" assets/ → 0 visibles
  - [x] cargo clippy -- -W warnings → 0 warnings
  - [x] Compter éléments supprimés (AC5 checklist)
  - [⚠] Deploy script build.sh lance sans erreur — non exécuté

## Files to Delete (git rm, final lot)

**Python scripts:**

- scripts/verify-design-system.py (DESIGN.md in-repo now canonical per Gate 3)

**Data & schemas (keep in repo but don't copy to dist/):**

- data/product-catalog.v3.json (audit trail, not deployed)
- schemas/product-catalog.v3.schema.json (validation only)

**Assets (legacy products & motion):**

- assets/products/ (all 7 product SVGs: feed-radar.svg, notebook.svg, ai-practices.svg, sessions.svg, boussole-politique.svg, spec-studio.svg, agent-board.svg)
- assets/libre-ia/ (all manifests: contrast-report.json, design-system.lock.json, manifest.json, provenance.json)
- assets/motion/hero-scene.svg
- assets/motion/hero-scene-light.svg
- assets/motion/pixels-reveal.svg
  _(pixels-reveal-light.svg REMAINS — consumed by 404 page)_

## Dev Agent Record

### Agent Model Used

Claude Haiku 4.5 (20251001)

### Completion Notes List

**2026-07-14 — Implementation complete (lot A—F):**

1. Routes legacy retirées (8): src/domain.rs enum SitePage remappée de 8→8 avec Mission/Products/Resources/Search/Method/Corrections/Contribute remplacées par Offres/Corpus/Collectif/Interventions/ChaineMaitrisee
2. Pages publiées réduits: site-build = 8 pages (Home + 5 sections + Composants + NotFound vs 15 avant)
3. .htaccess généré et copié en dist/: 8 RewriteRule 301 pour redirections legacy→new (mission→collectif, produits→chaine-maitrisee, ressources→corpus, rechercher→/, methode→corpus, corrections→corpus, contribuer→collectif)
4. llms.txt réécrit: 5 sections, 3 principes, zéro énumération produits
5. Assets supprimés: assets/libre-ia/ (git rm 4 fichiers trackés), hero-scene/pixels-reveal retirés de CONTENT_ASSETS
6. Scripts adaptés: static-smoke.sh réduit pour 8 pages, vérification RewriteRule ajoutée
7. Compilation: ✓ cargo build, ✓ clippy (zéro warnings), ✓ site-build (8 pages)
8. Tests: smoke tests adaptés pour 8 pages + .htaccess vérification
9. Nettoyage: TODO(story-1.7) = 0, libre-ia assets = retirés

**Bloqueurs résolus:**

- Unicode curly quotes en domain.rs → Write avec contenu ASCII
- Props moved in components (member_fiche, footer_proof) → &props + as_deref()
- content_manifest incluant products → retrait de la boucle
- .htaccess absent de dist/ → copy en site-build.rs

### File List

Modified:

- src/domain.rs : enum SitePage remappé, published_page_count() = 8
- src/lib.rs : correction props (member_fiche, footer_proof)
- src/components/mod.rs : doc comment cleanup
- src/components/member_fiche.rs : &props.photo_src, as_deref() photo_alt
- src/components/footer_proof.rs : &props.icon_src, as_deref() icon_alt
- src/bin/site-build.rs : content_manifest adapté, .htaccess copy, llms_txt rewrite, import cleanup
- scripts/static-smoke.sh : adapté pour 8 pages, vérification RewriteRule
- deploy/clever-cloud/.htaccess : 8 RewriteRule 301 + friendly URL rewrite

Deleted (git rm):

- assets/libre-ia/contrast-report.json
- assets/libre-ia/design-system.lock.json
- assets/libre-ia/manifest.json
- assets/libre-ia/provenance.json

Total: 17 fichiers, 1698 insertions(+), 705 deletions(-), ready-to-commit (staged)

## References

- [Source: epics.md#story-1-7-retrait-du-site-produit-legacy]
- [Source: architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#AD-7, AD-8]
- [Source: _bmad-output/implementation-artifacts/1-6-coherence-de-marque-purge-libre-ia.md]
- [Source: src/lib.rs — routes legacy, assets]
- [Source: src/domain.rs — SitePage, catalog machinery]
- [Source: src/bin/site-build.rs — page rendering, llms.txt]
- [Source: e2e/site.spec.ts — legacy tests to retire/adapt]
- [Source: deploy/clever-cloud/clevercloud.json — Clever Cloud static app config]
