---
story_id: 1.4
story_key: 1-4-home-a-message-unique
epic: 1
title: "Home à message unique"
status: ready-for-dev
created: 2026-07-14
updated: 2026-07-14

references:
  epics: _bmad-output/planning-artifacts/epics.md#Story 1.4
  prd_fr20: _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#FR-20
  experience: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md#Home
  design: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md
  architecture_ad8: _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#AD-8
  mockup_ref: _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/mockups/key-home.html
---

# Story 1.4 : Home à message unique

**User Story:**

En tant que visiteur,
je veux comprendre immédiatement la promesse de Libre IA et identifier mon point d'entrée (dirigeant / décideur public / technique),
afin de savoir en 90 secondes ce que je peux obtenir et où cliquer pour avancer.

---

## Acceptance Criteria

### AC-1 : Un seul h1 = Promesse Fixe

**Given** la page home `/`

**When** le HTML est rendu

**Then** il existe exactement un `<h1>` et son contenu est précisément :

```
De l'IA qui vous respecte : des coûts clairs, des équipes qui maîtrisent vraiment, la liberté de partir quand vous voulez.
```

**And** cet h1 est la première balise heading de la page (pas de h2 avant lui)

**And** `grep -c "<h1" dist/index.html == 1` passe au build statique

### AC-2 : Bloc Subtext Orienté Portes

**When** la page se charge

**Then** un sous-bloc immédiatement après h1 dit (texte exact adapté du mockup) :

```
Trois portes d'entrée selon votre rôle. Trois chemins pour maîtriser l'IA sans dépendance.
```

**And** ce texte utilise le style `{typography.body-lg}` (18px, Inter, line-height 1.6) per DESIGN.md

**And** sa couleur est `{colors.muted}` (#6B7280, clair) pour marquer une introduction douce

### AC-3 : Trois Portes Éditorialement Distinctes

**When** la page est rendue

**Then** il existe exactement trois cartes ("portes"), chacune avec :

#### Porte 1 : Dirigeants

- Label en caps : "POUR LES DIRIGEANTS"
- Titre (h3) : "Séminaire dirigeants"
- Description : "Vous sortez du séminaire sachant ce qu'IA coûte vraiment, ce que vos équipes doivent maîtriser, comment garder une porte de sortie."
- Lien CTA : href="/offres" (la route créée en 1.3), libellé "Réserver 30 minutes"
- Couleur label : `{colors.primary-deep}` (#1a4d2e)
- Style h3 : `{typography.display-sm}` (clamp 1.35–2rem), +700 weight

#### Porte 2 : Décideurs publics

- Label en caps : "POUR LES DÉCIDEURS PUBLICS"
- Titre (h3) : "Briefing décideurs"
- Description : "Souveraineté numérique, résilience opérationnelle, dépendance technologique. Les faits documentés, les limites déclarées."
- Lien CTA : href="/offres", libellé "Réserver 30 minutes"

#### Porte 3 : Équipes techniques

- Label en caps : "POUR LES ÉQUIPES TECHNIQUES"
- Titre (h3) : "Audit de souveraineté"
- Description : "Chaîne maîtrisée, stack transparent, dépendances décortiquées. Nous mesurons, vous décidez."
- Lien CTA : href="/offres", libellé "Réserver 30 minutes"

**And** chaque carte répond au style `door-card` du mockup :

- Border: 1px `{colors.border}` (#E5E7EB)
- Padding: `{spacing.6}` (24px)
- Border-radius: `{spacing.md}` (16px)
- Hover/focus : transform translateY(-2px), border → `{colors.primary-deep}`, background fond 3% `{colors.primary-vivid}`
- Transition : all 180ms ease
- Gap between cards: `{spacing.8}` (32px) on lg, responsive on mobile

### AC-4 : Footer de Preuve — Mesures Réelles Injectées

**When** la page est générée via `dioxus build --release --features static`

**Then** un bloc `footer-proof` existe à la fin du contenu principal avant le `<footer>` générique, avec structure (fidèle mockup key-home.html lignes 310–329) :

```html
<section class="proof-footer">
  <div>
    <div class="proof-stat">[stat numérique]</div>
    <p class="proof-context">[contexte décrivant la mesure]</p>
    <div class="proof-meta">Dernière mise à jour : [date ISO 8601]</div>
  </div>
  <div>
    <p>
      <strong>Coûts du site :</strong><br />
      [métrique 1]<br />
      [métrique 2]<br />
      [métrique 3]<br />
      [métrique 4]
    </p>
  </div>
</section>
```

**Given** le script de mesure post-build exécuté après compilation Dioxus

**When** le build est terminé

**Then** un fichier `.weights.json` est créé à la racine du worktree avec la structure suivante (exemple) :

```json
{
  "page_weight_bytes": 45120,
  "page_weight_kb": 44,
  "third_party_requests": 0,
  "third_party_list": [],
  "measurement_date": "2026-07-14T14:32:00Z",
  "summary_stat": "12 mois d'expérience fondée",
  "summary_context": "Pratique réelle avec des organisations publiques et privées. Chaque recommandation vient d'un terrain maîtrisé. Corrections visibles, dates documentées, chaîne reproductible.",
  "cost_metrics": {
    "infrastructure_monthly_eur": 12,
    "co2_monthly_grams": 8,
    "static": true,
    "analytics": false,
    "reproducibility_hours": 2
  }
}
```

**And** le build du home page injecte les valeurs de `.weights.json` dans le HTML statique de la section `proof-footer` **à la build time** (jamais via JavaScript) — le HTML final contient les chiffres en dur

**And** si `.weights.json` est manquant, le build échoue avec un message clair : `Error: .weights.json not found after build. Run weights measurement script first.`

**And** le build-system (site-build.rs) intègre la lecture du `.weights.json` et l'interpolation dans le composant home avant rendu SSR final

### AC-5 : Bloc Preuve Honnête — État Réel du Corpus

**Given** le bloc footer-proof existe

**When** la référence au corpus est affichée (optionnel sur home v1, mais préparé pour 1.5+)

**Then** si une pièce corpus existe (état published), elle est liée ; si aucune n'existe, le composant affiche honnêtement :

- Pas de fausse pièce
- Badge ou texte `state-badge` (composant 1.2) marquant "EN PRÉPARATION" pour le bloc corpus
- Lien `/corpus` reste cliquable mais mène à page vide/squelette (1.3 AC-6)

**And** aucun JavaScript requis pour rendre cet état

### AC-6 : Design & Spacing Fidèle Mockup

**When** le site est construit et le HTML de la home est visualisé

**Then** le layout respecte exactement le mockup `key-home.html` :

- Section hero (h1 + subtext) : max-width 48rem, margin-bottom `{spacing.section}` (clamp 3.5–6.5rem)
- Grille portes : 3 colonnes sur lg, responsive auto-fit minmax(280px, 1fr) sur sm/md
- Spacing horizontal (gutter) : `{spacing.gutter}` (clamp 1.125–3rem, 4vw)
- Proof-footer : deux colonnes lg, stack une colonne sm, padding clamp(1.75–4rem, 5vw)
- Background proof-footer : fond `{colors.primary-vivid}` 7% (color-mix in srgb)

**And** tous les tokens CSS proviennent des variables déclarées (DESIGN.md + tokens.css) en `--color-*`, `--font-*`, `--space-*`

### AC-7 : Test des 90 Secondes

**Given** un visiteur externe arrive sur la home

**When** il lit pendant 90 secondes max

**Then** il peut restituer à haute voix :

1. La promesse précise (l'h1)
2. Identifier la porte pour son rôle (dirigeant / public / technique)
3. Savoir où cliquer pour avancer (lien CTA "Réserver 30 minutes")

**And** une trace vérifiable (lien vers /offres fonctionne, même si /offres est vide squelette de 1.3)

### AC-8 : Accessibilité et Structure Sémantique

**When** la page est construite

**Then** :

- Un seul h1, pas de h2 avant lui (validé par grep AC-1)
- Ordre de lecture (Tab) : h1 → subtext → porte 1 (label + titre + description + lien) → porte 2 → porte 3 → proof-footer → footer générique
- Focus visible sur chaque lien CTA (2px `{colors.focus}` anneau per DESIGN.md)
- Cibles tactiles ≥ 44px (hauteur/largeur cartes, lien CTA)
- Pas de fausse accessibilité (pas d'aria-label sur du contenu textuel visible)
- Alt-text sur images interne au composant (aucune image requise pour la v1 home, sauf assets vectoriels déjà en place)

### AC-9 : Aucune Dépendance JavaScript

**Given** le navigateur désactive JavaScript

**When** la page home est chargée

**Then** :

- Tous les éléments visuels (h1, portes, proof-footer) restent visibles
- Les liens `/offres`, `/corpus`, `/collectif`, etc. restent cliquables
- Aucun message d'erreur ou contenu manquant

### AC-10 : Page Complète ≤ 5 Blocs Logiques (Anti-Soupe)

**When** le HTML est structuré

**Then** la page respecte la limite de 5 blocs logiques (FR-20) :

1. Hero (h1 + subtext)
2. Trois portes (comptées comme 1 bloc grille, pas 3)
3. Footer-proof (bloc 4)
4. Footer générique site (bloc 5, réutilisé de 1.3)

**And** chaque bloc a une visibilité en une hauteur d'écran ou moins (responsive)

---

## Tasks / Subtasks

### Task 1 : Implémenter le Composant Home avec Hero + Portes (AC-1–AC-3, AC-5, AC-10)

- [ ] 1.1 Créer le composant Dioxus `Home` dans `src/pages/home.rs` remplaçant la page actuelle
  - [ ] 1.1.1 Importer le composant `Header` et `Footer` de 1.3
  - [ ] 1.1.2 Rendre l'h1 avec le texte exact de la promesse (AC-1)
  - [ ] 1.1.3 Rendre le subtext « Trois portes d'entrée… » (AC-2)
  - [ ] 1.1.4 Créer une structure de données (array Rust ou énumération) pour les trois portes
  - [ ] 1.1.5 Rendre les trois portes avec map / itération, chacune avec label + h3 + description + lien (AC-3)
  - [ ] 1.1.6 Appliquer les styles CSS door-card per DESIGN.md (border, padding, radius, hover transition)
  - [ ] 1.1.7 Tester : `grep -c "<h1" src/pages/home.rs` retourne 1 occurrence (compilation)

- [ ] 1.2 Intégrer le composant Home à la route `/` en `src/lib.rs`
  - [ ] 1.2.1 Ajouter `mod pages; mod pages/home;` dans lib.rs si absent
  - [ ] 1.2.2 Vérifier que la route `/` utilise `<Home />`
  - [ ] 1.2.3 S'assurer que `<Home />` est entourée de `<Header />` et `<Footer />` via PageFrame (cf. 1.3 patterns)

- [ ] 1.3 Tests composants (sans build statique)
  - [ ] 1.3.1 Compilation Rust : `cargo check --lib` OK
  - [ ] 1.3.2 Linter : `biome check --apply src/pages/home.rs` OK (pas de warns supplémentaires)

### Task 2 : Implémenter le Mécanisme de Mesure et Injection de `.weights.json` (AC-4)

- [ ] 2.1 Créer le script de mesure post-build `scripts/measure-weights.sh` (ou `.py`)
  - [ ] 2.1.1 Mesure la taille totale de `dist/index.html` en octets
  - [ ] 2.1.2 Scanne `dist/` pour identifier requêtes tierces (grep https:// hors libre-ai.fr, exceptions)
  - [ ] 2.1.3 Prépare le JSON structuré (`.weights.json` ci-dessus)
  - [ ] 2.1.4 Écrit `.weights.json` à la racine du worktree avec valeurs mesurées réelles

- [ ] 2.2 Intégrer la lecture et injection de `.weights.json` dans le build Dioxus
  - [ ] 2.2.1 Modifier `src/bin/site-build.rs` pour lire `.weights.json` après compilation Dioxus
  - [ ] 2.2.2 Parser le JSON en struct Rust (struct `WeightsMeasurement`, champs dérivant Deserialize)
  - [ ] 2.2.3 Passer les mesures en props/context au composant Home avant rendu SSR final
  - [ ] 2.2.4 Le composant Home interpole les valeurs dans le HTML proof-footer (pas de JS)
  - [ ] 2.2.5 Si `.weights.json` manquant → compile error explicite avec instruction de correction

- [ ] 2.3 Tests build statique avec mesure
  - [ ] 2.3.1 Lancer `dioxus build --release --features static` — build OK
  - [ ] 2.3.2 Vérifier `dist/index.html` contient les chiffres de `.weights.json` en dur (grep "€12/mois" ou équivalent)
  - [ ] 2.3.3 Vérifier `dist/index.html` ne contient pas de JS dynamique chargeant les chiffres
  - [ ] 2.3.4 Vérifier la date d'injection : matches `measurement_date` de `.weights.json`

### Task 3 : Tests Accessibilité, Responsive, et 90-Secondes (AC-5–AC-9)

- [ ] 3.1 Tests clavier et sémantique
  - [ ] 3.1.1 Importer le fichier HTML généré `dist/index.html` dans un navigateur
  - [ ] 3.1.2 Tab order : vérifier que la séquence est h1 → subtext → porte 1 label → porte 1 h3 → porte 1 description → porte 1 lien → … (ordre logique)
  - [ ] 3.1.3 Focus visible : chaque lien affiche un anneau 2px `{colors.focus}` (#111827, clair) en :focus-visible
  - [ ] 3.1.4 Aucun piège clavier : Échap ne ferme rien, Tab ne boucle pas en piège

- [ ] 3.2 Tests responsive
  - [ ] 3.2.1 Redimensionner navigateur à 768px (breakpoint sm/md) — portes se stackent verticalement
  - [ ] 3.2.2 Redimensionner à < 400px (mobile) — portes restent lisibles, pas de débordement horizontal
  - [ ] 3.2.3 Proof-footer : passe de 2 colonnes lg à 1 colonne sm
  - [ ] 3.2.4 Header sticky reste visible et accessible (cf. 1.3)

- [ ] 3.3 Tests fonctionnels sans JavaScript
  - [ ] 3.3.1 Désactiver JS dans les dev tools navigateur
  - [ ] 3.3.2 Charger home → tous visuels présents
  - [ ] 3.3.3 Cliquer lien `/offres` → navigue correctement (pas de JS requis)
  - [ ] 3.3.4 Cliquer lien `/corpus` → même résultat

- [ ] 3.4 Test 90-secondes (heuristique UX)
  - [ ] 3.4.1 Montrer la page à une personne externe sans contenu de brief
  - [ ] 3.4.2 Lui demander : « Lis pendant 90s, puis dis-moi ce que tu as compris »
  - [ ] 3.4.3 Évaluer la restitution : promesse claire ? Porte pour son rôle identifiée ? Où cliquer ?
  - [ ] 3.4.4 Documenter le résultat dans Dev Agent Record

- [ ] 3.5 Tests visuels
  - [ ] 3.5.1 Ouvrir `dist/index.html` avec `python3 -m http.server` et vérifier rendu visuel
  - [ ] 3.5.2 Comparer avec mockup `key-home.html` : spacing, colors, typography match
  - [ ] 3.5.3 Vérifier pas d'erreur CSS (dev tools console vide)
  - [ ] 3.5.4 Thème sombre (`data-theme="dark"`) : portes restent lisibles (colors.dark.* appliquées)

### Task 4 : Validation Build, Fichiers et Cleanup (AC-1, AC-10)

- [ ] 4.1 Vérification finale build statique
  - [ ] 4.1.1 Exécuter : `dioxus build --release --features static`
  - [ ] 4.1.2 Build sans erreurs Dioxus ou Rust
  - [ ] 4.1.3 `dist/index.html` existe et ≥ 35 Ko (home + header + footer + CSS injecté)

- [ ] 4.2 Vérifications grepping automatiques (prélude CI)
  - [ ] 4.2.1 `grep -c "<h1" dist/index.html` == 1 ✓
  - [ ] 4.2.2 `grep -c "De l'IA qui vous respecte" dist/index.html` >= 1 ✓ (h1 exactement)
  - [ ] 4.2.3 `grep "third_party_requests" dist/index.html` → vérifier valeur 0 ou liste vide ✓
  - [ ] 4.2.4 `grep -c "proof-footer" dist/index.html` == 1 ✓
  - [ ] 4.2.5 `grep "Trois portes" dist/index.html` ✓ (subtext présent)

- [ ] 4.3 Git status et staging
  - [ ] 4.3.1 `git status --short` — identifier fichiers modifiés
  - [ ] 4.3.2 Fichiers attendus modifiés : `src/pages/home.rs` (nouveau), `src/lib.rs` (route home ou ajout), `src/bin/site-build.rs` (injection weights), `.weights.json` (généré, peut être .gitignore)
  - [ ] 4.3.3 Aucune suppression de fichier (vérifier AC-7 de 1.3 : routes legacy préservées)
  - [ ] 4.3.4 Aucun chemin machine-local dans les fichiers
  - [ ] 4.3.5 Aucun nom client/employeur non autorisé

---

## Dev Notes

### Contexte Technique

**Dioxus SSG (Site Static Generation):**
La home page est un composant Dioxus rendu via `dioxus build --features static`, qui convertit le composant `Home` en HTML natif. Aucun JavaScript n'est nécessaire pour le rendu statique ; toutes les valeurs de contenu (h1, portes, chiffres proof-footer) sont figées dans le HTML à la build time.

**Routes et Composition:**
La route `/` appelait auparavant une page legacy « Utiliser l'IA sans perdre le contrôle ». Cette story la remplace par le nouveau contenu avec promesse unifiée. La structuration est PageFrame (header/body/footer) hérité de 1.3.

**Tokens CSS et Thèmes:**
Tous les styles doivent utiliser les variables CSS de `assets/tokens.css` (DESIGN.md) — jamais de valeurs en dur. Le thème sombre est automatiquement appliqué via `prefers-color-scheme: dark` + overrides `data-theme="dark"` si disponibles.

**Composants Réutilisés:**

- `Header` de 1.3 (sticky, nav orientée acheteur)
- `Footer` de 1.3 (contact form + email + liens utilitaires)
- `EmptyState` de 1.2 (affiché sur routes `/offres`, `/corpus` si vides)
- `PageFrame` de 1.3 (wrapper header/body/footer)

**Weights JSON et Injection:**
Le build post-Dioxus doit exécuter un script de mesure qui crée `.weights.json` avec les chiffres réels. Le fichier `site-build.rs` lit ce JSON et l'injecte dans le composant Home avant rendu SSR final. **Jamais d'ajout via JavaScript ou post-render manipulation.**

### Fichiers à Modifier

| Fichier                               | Action               | Justification                                                    |
| ------------------------------------- | -------------------- | ---------------------------------------------------------------- |
| `src/pages/home.rs`                   | CRÉER                | Composant Home avec hero + portes + proof-footer                 |
| `src/lib.rs`                          | MODIFIER (mineur)    | Vérifier route `/` utilise Home (devrait déjà exister)           |
| `src/bin/site-build.rs`               | MODIFIER             | Ajouter lecture `.weights.json` + injection context Home         |
| `scripts/measure-weights.sh` (ou .py) | CRÉER                | Script post-build de mesure (peut être bash simple ou Python uv) |
| `.weights.json`                       | GÉNÉRER (post-build) | Peut être .gitignore ou commité avec valeurs réelles             |
| `Cargo.toml`                          | VÉRIFIER             | Dépendances json parsing (serde_json déjà présent)               |

### Standards de Test Appliqués

- **Build :** Dioxus compile sans warn, Rust compile clean
- **Structure :** Grep validation, 1 h1, promesse exacte, 5 blocs max
- **Accessibilité :** Tab order logique, focus visible, 44px+ cibles, pas de JS requis
- **Responsive :** mobile < 400px, sm 400–768px, md/lg ≥ 768px, pas de débordement
- **Performance :** dist/index.html < 50 Ko (HTML + CSS injecté), zéro requête tierce
- **Contenu :** Pas de fake data, état corpus honnête (« en préparation »), chiffres proof-footer mesurés

### Dépendances d'Histoire

**Bloquer :** Story 1.3 (Header, Footer, routes squelettes /offres, /corpus, etc.) **DONE**

**Forward-block :** Story 1.5 (Pages utilitaires / mentions légales) — cette story crée les fondations de la home ; les pages utilitaires peuvent être construites en parallèle.

### Points à Trancher DANS Ce Dossier

#### (a) Contenu Exact des Trois Portes

Les trois portes sont figées dans AC-3. Aucun arbitrage supplémentaire requis : dirigeants/séminaire, public/briefing, technique/audit, chacun avec la description de EXPERIENCE.md et la maquette key-home.html.

#### (b) Footer de Preuve — Mécanisme de Mesure

**Décision :** Le `.weights.json` est créé par un script post-build simple, pas intégré à Dioxus. Le script est exécuté après `dioxus build --release`, crée le fichier JSON, puis le site-build.rs du prochain build le consomme. Cela permet de tester et répéter la mesure indépendamment du build Dioxus.

**Valeurs pour v1 :**

- Stat : "12 mois d'expérience fondée" (exemple du mockup, à affiner selon réalité projet)
- Contexte : "Pratique réelle avec des organisations publiques et privées…"
- Infrastructure : €12/mois (exemple Clever Cloud réel)
- CO2 : ~8g/mois (estimation sobriété hébergement)
- Static : true (pas de backend pour home)
- Analytics : false (zéro tracking)
- Reproductibilité : 2h (temps pour relancer build)

**Industrialisation :** C'est la v1 du mécanisme. Story 5.2 (gate sobriété) formalisera la mesure en CI ; pour cette story, le script est manuel/ad-hoc mais les chiffres sont vrais (mesurés).

#### (c) Bloc Corpus — État Honnête

La home affiche une référence au corpus avec un badge state-badge (composant 1.2) marquant l'état réel. Tant qu'aucune pièce corpus n'est publiée (stories 2.6–2.8 sont futures), le badge indique "EN PRÉPARATION" et le lien `/corpus` mène à la page squelette de 1.3. Aucune fausse pièce n'est affichée sur la home v1.

---

## Dev Agent Record

### Agent Model Used

Claude Haiku 4.5 (2026-07-14)

### Key Learnings from Previous Stories (1.1–1.3)

1. **1.1 (Fondations visuelles)** — Les tokens CSS doivent être exhaustifs en variables avant le build ; une variable manquante = compile error dès sa référence en composant.
2. **1.2 (Neuf composants)** — Composants Dioxus réutilisables centralisés en `src/components/`, chacun avec module dédié ; les pages importent et composent, jamais d'inline HTML.
3. **1.3 (Navigation et gabarit)** — PageFrame centralise header/body/footer ; les pages imbriquées dedans héritent automatiquement nav + CTA + footer cohérents. Les états vides (empty-state) sont précédents et réutilisés ici.

### Dev Notes Spécifiques à 1.4

- **H1 exacte :** Le texte de l'h1 est figé ci-dessus. Aucune typo, aucune variante. Cela permet le grep AC-1 (une seule occurrence).
- **Trois portes en struct :** Plutôt que trois blocs copié-collé, utiliser une struct Rust (ex. `DoorCard { label: &str, title: &str, description: &str, link: &str }`) et mapper sur un array. Code DRY, maintenabilité future.
- **Weights JSON — timing :** Le script `measure-weights.sh` s'exécute **après** `dioxus build --release`, car il mesure le résultat en `dist/`. Le prochain `cargo build` ou `dioxus build` lit ce JSON et l'injecte. Cela requiert deux passes, mais isole la mesure du rendu.
- **CSS grid responsive :** `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` fonctionne natif CSS sans media queries ; on garde les breakpoints explicites pour le header/footer de 1.3.
- **Test 90-secondes :** C'est un test UX heuristique, pas automatisable. La trace est dans le dev agent record (« [Nom testeur] restitue : [transcription] »). Invalide un design si le visiteur ne comprend pas la promesse en 90s.

---

## References

- **Mockup :** `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/mockups/key-home.html` — structure HTML exacte pour composition
- **Design tokens :** `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md` — variables CSS utilisées (colors, typography, spacing)
- **Experience spec :** `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md` — microcopy, tone, patterns portes
- **PRD FR-20 :** `_bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md#FR-20` — exigence home message unique + test 90s
- **Architecture AD-8 :** `_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md#AD-8` — gates CI, injection .weights.json, validations bloquantes
- **Story 1.3 artifacts :** `_bmad-output/implementation-artifacts/1-3-navigation-et-gabarit-de-page.md` — patterns Header, Footer, PageFrame
- **Story 1.2 artifacts :** `_bmad-output/implementation-artifacts/1-2-les-neuf-composants-du-contrat-ux.md` — réutilisation EmptyState, state-badge
- **Epics file :** `_bmad-output/planning-artifacts/epics.md#Epic 1` — contexte epic, autres stories liées
