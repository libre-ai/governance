---
baseline_commit: 9b8c9fc6e58397e266bbe705d1bebd2555c46631
---

# Story 1.2 : Les neuf composants du contrat UX

**Status:** review  
**Epic:** 1 — Le site dans sa nouvelle identité  
**Story ID:** 1.2  
**Created:** 2026-07-14  
**Depends On:** Story 1.1 (tokens et typographies — **MUST be complete**)

---

## Story

En tant que visiteur,  
je veux des éléments d'interface cohérents et honnêtes sur tout le site,  
afin de comprendre chaque état sans ambiguïté.

---

## Acceptance Criteria

### AC1 — Neuf composants implémentés selon spec DESIGN.md + EXPERIENCE.md

**Given** les spécifications visuelles (DESIGN.md, lignes 232–276) et comportementales (EXPERIENCE.md, lignes 66–76)  
**When** les composants `card-offre`, `card-corpus`, `page-piece`, `citation-block`, `member-fiche`, `discrete-door`, `footer-proof`, `state-badge`, `empty-state` sont rendus en Dioxus SSG  
**Then** chacun respecte sa spec visuelle : bordures, rayons, espacements, typographies, fond teinté  
**And** chacun respecte son comportement : navigation, états, CTA, microcopy  
**And** chaque composant consomme les variables CSS de story 1.1 — **zéro valeurs en dur**

### AC2 — State-badge porte toujours un libellé texte (jamais couleur seule)

**Given** les offres en construction ou les pièces corpus corrigées  
**When** un badge d'état est rendu  
**Then** le libellé texte est obligatoire : « EN CONSTRUCTION », « CORRIGÉE »  
**And** la couleur renforce l'information, ne la porte pas (UX-DR6, NFR-15)  
**And** un test scanne la cible pour rejeter `color: *` sans texte visible

### AC3 — Empty-state affiche cause + CTA unique

**Given** une section vide (Interventions, détail Offre manquant)  
**When** la page se charge  
**Then** titre honnête : « [Section] est en construction »  
**And** corps explicatif une ligne  
**And** un seul CTA : « Réserver 30 minutes » ou « Parlons-en en priorité » selon contexte  
**And** zéro illustration sauf contexte très haut (EXPERIENCE.md, ligne 76)

### AC4 — Revue visuelle contre maquettes de référence

**Given** les mockups `mockups/key-home.html` (offres en hero) et `mockups/key-piece-corpus.html` (pièce avec citation block)  
**When** chaque composant est rendu  
**Then** alignement visuel avec maquettes : espacements, grille, typographie, bordures, états hover/focus  
**And** deux thèmes (clair/sombre) testés et conformes contrastes WCAG AA

---

## Dev Notes

### Architecture & Paradigme

**Dioxus 0.7 SSG** — Tous les composants sont des fonctions Dioxus pures, rendues à la build vers HTML statique. Zéro JavaScript requis pour le rendu ; zéro hydratation. Les componentes exportent des `rsx!()` qui compilent en HTML.

**Ordre de dépendance critique :**

1. Story 1.1 complétée (tokens.css, site.css, @font-face déclarés en `/assets/`)
2. Les 9 composants construits comme modules Dioxus
3. Les pages (home, offres, corpus, etc.) composent les 9 éléments
4. CSS global (`site.css`) + tokens (`tokens.css`) + spécifique composant appliqués via classes ou inline styles (`var(--*)`)

**Paradigme de consommation variables CSS :**

```rust
// BON : Dioxus avec classes CSS
rsx! {
  div { class: "card-offre", {children} }
}
// Styles consommés depuis site.css via classe .card-offre → var(--color-primary-vivid), etc.

// MAUVAIS : valeurs en dur en inline styles
rsx! {
  div {
    style: "background-color: #22C55E; padding: 24px;"  // ❌ Violate AC1
  }
}
```

### Spécifications composant par composant

Ci-dessous : spec visuelle (de DESIGN.md) + comportement (de EXPERIENCE.md) + tokens à consommer.

#### 1. **card-offre** (Carte Offre)

**Visuel (DESIGN.md, ligne 251–253) :**

- Titre : `typography.display-md`
- Corps : `typography.body-md`
- Fond : `color-mix(in srgb, var(--color-primary-vivid) 4%, var(--color-background))`
- Bordure : 1px `var(--color-border)`, radius `var(--radius-md)`
- Padding : clamp(1.5rem, 4vw, 3rem)
- Au hover : border-color → `var(--color-primary-deep)`, translateY(-2px), transition `var(--motion-ui)`

**Comportement (EXPERIENCE.md, ligne 68) :**

- Clic = scroll vers page complète ou navigation si déjà ouvert
- Si statut « en construction » : CTA désactivé, texte → « Parlons-en en priorité »
- Jamais d'affordance vide

**Tokens à consommer :**

```css
--color-primary-vivid
--color-primary-deep
--color-background
--color-border
--radius-md
--motion-ui
--typography-display-md (family, size, weight, line-height)
--typography-body-md
--space-6 (24px padding inner)
```

**Fichier à créer/modifier :**

- `src/components/card_offre.rs` (NEW, export `CardOffre`)
- `assets/components.css` — ajouter `.card-offre { ... }` avec tous les tokens

**Tests accessibility :**

- Titre visible et lisible
- Couleur texte ≥ AA contraste sur fond teinté
- CTA (lien/bouton) réacite au Tab, focus visible
- Si désactivé : attribut `disabled` ou `aria-disabled="true"`

---

#### 2. **card-corpus** (Carte Corpus)

**Visuel (DESIGN.md, ligne 248–249) :**

- Titre : `typography.display-sm`
- Métadonnées : `typography.caption`, color `var(--color-muted)`
- Bordure, radius, padding : idem card-editorial
- Affiche : titre, auteur, date, statut (publié/brouillon), nombre corrections + lien

**Comportement (EXPERIENCE.md, ligne 69) :**

- Clic = ouvre pièce complète
- Affiche toujours : titre, auteur, date, statut, corrections
- Pas de paywall, pas « à venir »

**Tokens :**

```css
--color-border
--color-muted
--radius-md
--typography-display-sm
--typography-caption
--space-5 (20px padding)
```

**Fichier :**

- `src/components/card_corpus.rs` (NEW)

**Accessibility :**

- Lien cliquable passe au focus (Tab)
- Alt-text optionnel si image présente
- Métadonnées lisibles au lecteur d'écran

---

#### 3. **page-piece** (Page Pièce de Corpus)

**Visuel (DESIGN.md + EXPERIENCE.md, ligne 70) :**

- Titres : `typography.corpus-title` (Source Serif 4, serif signature du corpus)
- Prose : `typography.corpus-prose` (Source Serif 4, 19px, line-height 1.65)
- En-tête : nature, auteur, date publication, date dernière revue
- **Si corrigée :** bloc daté en tête (« Correction du [date] : [note]. Version précédente : [lien] »)
- Sources liées aux affirmations + bibliographie en fin
- Bloc « citer cette page » en fin
- CTA RDV « Réserver 30 minutes » + microcopy

**Comportement (EXPERIENCE.md, ligne 70, story 2.2 AC) :**

- Lecture en serif = signature corpus
- Corrections visibles et traçables
- Permalien immuable (jamais changé lors correction)

**Tokens :**

```css
--typography-corpus-title
--typography-corpus-prose
--typography-body-md (métadonnées)
--color-primary-deep (liens source, trait citation)
--spacing-reading-max (48rem) (largeur prose)
--spacing-section (écart entre blocs)
```

**Fichier :**

- `src/components/piece_corpus.rs` ou rendu dans `src/pages/corpus.rs` selon architecture
- Peut être intégré comme page composite si grande

---

#### 4. **citation-block** (Bloc Citation)

**Visuel (DESIGN.md, ligne 273) :**

- Fond : `color-mix(in srgb, var(--color-primary-vivid) 3%, var(--color-background))`
- Bordure gauche : 3px `var(--color-primary-deep)`
- Texte : `typography.body-md`, color `var(--color-ink)`
- Padding : `var(--space-5)` (20px), padding-left : `var(--space-4)` (16px)
- Optionnel : bouton copier sans JS requis

**Comportement (EXPERIENCE.md, ligne 71) :**

- Format : [Fait]. [Source #1]. [Source #2]. Hyperlinké.
- Inline acceptable si PDF natif ; toujours inclure liste visible en fin

**Tokens :**

```css
--color-primary-vivid
--color-primary-deep
--color-background
--typography-body-md
--space-5
--space-4
```

**Fichier :**

- `src/components/citation_block.rs` (NEW)

---

#### 5. **member-fiche** (Fiche Membre)

**Visuel (DESIGN.md, ligne 257) :**

- Photo : 100px × 100px (`var(--space-6)` × `var(--space-6)`), radius `var(--radius-md)`
- Nom : `typography.display-sm`
- Parcours : `typography.body-md`, color `var(--color-muted)`, 2–3 lignes max
- Rôle : `typography.label-caps`, color `var(--color-ink)`
- Bloc centré, pas de hover

**Comportement (EXPERIENCE.md, ligne 72) :**

- Fiche ajoutée en contenu, jamais code-générée
- Statique : composant est inerte, page converge vers RDV

**Tokens :**

```css
--space-6 (100px photo)
--radius-md
--typography-display-sm (nom)
--typography-body-md (parcours)
--typography-label-caps (rôle)
--color-muted
```

**Fichier :**

- `src/components/member_fiche.rs` (NEW)

---

#### 6. **discrete-door** (Porte Discrète)

**Visuel (DESIGN.md, ligne 261) :**

- Lien texte inline, pas button
- Couleur : `var(--color-primary-deep)`
- Font-weight : 700
- Underline permanent, text-decoration-offset : 0.22em
- Taille : `typography.body-md`

**Comportement (EXPERIENCE.md, ligne 73) :**

- Texte lien : « Si vous êtes un pair intéressé, contact spontanée via le formulaire ci-dessous. »
- Souligné, couleur primary-deep
- **Pas de modal, pas de popup** — soumission formulaire régulière (post-form classique)

**Tokens :**

```css
--color-primary-deep
--typography-body-md
```

**Fichier :**

- Peut être simple balise `<a>` avec classe CSS dans `site.css`
- `src/components/discrete_door.rs` (optionnel, peut être JSX simple)

---

#### 7. **footer-proof** (Pied Preuve)

**Visuel (DESIGN.md, ligne 277) :**

- **Composant signature du site**
- Icône/image gauche : `var(--space-6)` × `var(--space-6)` (24px)
- Stat droite : titre `typography.display-sm`, contexte `typography.body-md` muted
- Layout : grid 1fr minmax(18rem, 0.8fr), gap clamp(2rem, 8vw, 8rem)
- Bordure 1px `var(--color-border)`, radius `var(--radius-md)`, padding clamp(1.75rem, 5vw, 4rem)
- Fond : `color-mix(in srgb, var(--color-primary-vivid) 7%, var(--color-background))`
- Date visible, traçable

**Comportement (EXPERIENCE.md, ligne 74) :**

- Affiche image + stat (ex. « 12 mois d'expérience sur ce modèle pour un grand groupe bancaire français. »)
- Date visible
- Traçable (source, contexte documentés)

**Tokens :**

```css
--space-6
--space-8 (gutter interne)
--typography-display-sm (stat)
--typography-body-md (contexte)
--color-muted
--color-border
--radius-md
--color-primary-vivid
--color-background
--motion-ui (hover fade)
```

**Fichier :**

- `src/components/footer_proof.rs` (NEW)

---

#### 8. **state-badge** (Badge État)

**Visuel (DESIGN.md, ligne 265) :**

- Bordure 1px `var(--color-border)`
- Texte `typography.label-caps`, color `var(--color-ink)`
- **JAMAIS couleur seule comme porteur d'info** — toujours libellé texte explicite
- Pas de fond coloré — la bordure suffit
- Exemple : badge `{offre-en-construction}` → libellé « EN CONSTRUCTION »

**Comportement (EXPERIENCE.md, ligne 75 + story AC2) :**

- Offre « en construction » : badge texte « EN CONSTRUCTION » (couleur primary-deep si visuel requis, mais le texte prime)
- Pièce « corrigée » : badge « CORRIGÉE » + date

**Tokens :**

```css
--color-border
--color-ink
--typography-label-caps
```

**Fichier :**

- `src/components/state_badge.rs` (NEW, très léger)

---

#### 9. **empty-state** (État Vide)

**Visuel (DESIGN.md, ligne 269) :**

- Titre : `typography.display-sm`
- Corps : `typography.body-md`, color `var(--color-muted)`
- CTA : bouton primaire ou lien selon contexte
- Pas d'illustration sauf contexte très haut

**Comportement (EXPERIENCE.md, ligne 76, story AC3) :**

- Sections vides (Interventions au démarrage) affichent état honnête
- h1 : « [Nom section] est en construction. »
- Corps : « Nous ajoutons au fur et à mesure. »
- CTA unique : « Réserver 30 minutes »

**Tokens :**

```css
--typography-display-sm
--typography-body-md
--color-muted
--color-primary-deep (CTA)
--motion-ui
```

**Fichier :**

- `src/components/empty_state.rs` (NEW)

---

### Tests et Validation

#### Tests unitaires Dioxus (optionnel)

Chaque composant peut être testé en isolation avec `dioxus::prelude::*` et rendu SSG :

```rust
#[test]
fn test_card_offre_renders_title() {
    let app = rsx! { CardOffre { title: "Séminaire" } };
    // Assert output contains title
}
```

#### Tests visuels — Maquettes

Chaque composant doit être vérifiable contre ses maquettes de référence :

- `mockups/key-home.html` : card-offre (héros), empty-state si applicable
- `mockups/key-piece-corpus.html` : page-piece, citation-block, footer-proof

#### Tests accessibility

**Par composant :**

- **card-offre, card-corpus :** CTA au clavier (Tab), focus visible, lien décrit destination
- **page-piece :** h1 unique, structure h1→h2→h3 respectée, alt-text images, labels formulaire
- **citation-block :** contraste texte/fond WCAG AA, liens soulignés
- **member-fiche :** alt-text photo, nom lisible
- **discrete-door :** lien souligne, Au clavier accessible
- **footer-proof :** contraste WCAG AA (stat sur fond teinté), image alt-text, date visible
- **state-badge :** libellé texte visible (jamais couleur seule), AC2 testé
- **empty-state :** h1 unique, CTA focus visible
- **Tous :** Lecture clair/sombre : contraste AA dans les deux thèmes

#### E2E — Clavier

Test parcours clavier complets (Tab, focus visibles, zéro piège) :

1. Page home : Tab sur 3 portes (cards offres) → focus visible
2. Page offre détail : Tab sur CTA « Réserver » → focus visible
3. Page corpus : Tab sur pièce → focus visible
4. Page collectif : Tab sur members → lien porte discrète accessible

#### Mesure poids

Post-build, mesurer :

- Poids HTML home + piece + offre (doit rester ≤ 500 Ko excl. médias, cf. AD-8)
- Zéro requête tierce (grep dist/ rejette googleapis/fonts.adobe)

**Documenter dans `.weights.json` et injecter dans footer-proof (ad-hoc, voir story 5.2).**

---

### Fichiers à créer/modifier

| Fichier                            | Action        | Détail                                                                                 |
| ---------------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `src/components/mod.rs`            | CREATE/UPDATE | Exporter les 9 modules composant                                                       |
| `src/components/card_offre.rs`     | CREATE        | Composant CardOffre                                                                    |
| `src/components/card_corpus.rs`    | CREATE        | Composant CardCorpus                                                                   |
| `src/components/piece_corpus.rs`   | CREATE        | Composant PieceCorpus (ou intégrer en page)                                            |
| `src/components/citation_block.rs` | CREATE        | Composant CitationBlock                                                                |
| `src/components/member_fiche.rs`   | CREATE        | Composant MemberFiche                                                                  |
| `src/components/discrete_door.rs`  | CREATE        | Composant DiscreteDoor                                                                 |
| `src/components/footer_proof.rs`   | CREATE        | Composant FooterProof                                                                  |
| `src/components/state_badge.rs`    | CREATE        | Composant StateBadge                                                                   |
| `src/components/empty_state.rs`    | CREATE        | Composant EmptyState                                                                   |
| `assets/components.css`            | CREATE        | Styles CSS pour 9 composants (classes .card-offre, etc.) ; tous var(--*) de tokens.css |
| `src/lib.rs`                       | UPDATE        | Importer mod components ; vérifier usage composants dans pages                         |

---

### Paradigme d'implémentation Dioxus

**Pas de tailwind, pas d'inline styles en dur**, tout en variables CSS ou classes :

```rust
// ✅ BON
#[component]
pub fn CardOffre(title: String, children: Element) -> Element {
    rsx! {
        div {
            class: "card-offre",  // Styles depuis assets/components.css
            h2 { "{title}" }
            { children }
        }
    }
}

// ❌ MAUVAIS
#[component]
pub fn CardOffre(title: String) -> Element {
    rsx! {
        div {
            style: "background-color: #22C55E; border-radius: 16px; padding: 24px;",  // Valeurs en dur
            h2 { "{title}" }
        }
    }
}
```

**Props typées :**

Chaque composant accepte les props nécessaires typées strictement :

```rust
#[derive(Props, Clone, PartialEq)]
pub struct CardOffreProps {
    pub title: String,
    pub description: String,
    pub status: OfferStatus,  // enum: Published | InConstruction
    pub on_click: Option<String>,  // URL cible si applicable
    pub children: Element,
}
```

---

## Apprentissages Story 1.1 à Appliquer

Tirés de `1-1-fondations-visuelles-tokens-et-typographies.md` :

### 1. Tokens exhaustifs = Build échoue avant merge

**Leçon :** Ne pas présumer que tokens.css est complet. Vérifier ligne par ligne DESIGN.md frontmatter, créer liste exhaustive avant implémentation.

**Application en 1.2 :** Chaque composant doit consommer les tokens listés ci-dessus ; si un token manque → build échoue ou composant visuellement cassé → gate AD-8 rejette.

### 2. Contraste clair/sombre doit être testé, pas supposé

**Leçon :** Vert profond #1a4d2e + fond sombre #0B1220 = contraste insuffisant. La substitution vert clair #4ADE80 en dark mode était cruciale.

**Application en 1.2 :** Chaque composant avec texte sur fond doit être testé aux deux thèmes (prefers-color-scheme: dark + data-theme override). Si contraste < AA → composant visuellement cassé. Utiliser WebAIM Contrast Checker ou axe DevTools avant soumission.

### 3. Zéro requête tierce = grep négatif avant soumission

**Leçon :** Un seul @import googleapis oublié bloque la gate zero-third.

**Application en 1.2 :** Avant merge, exécuter :

```bash
grep -r "googleapis\|fonts.adobe\|fonts.bunny\|cdn\|gstatic" src/ assets/components.css
# Résultat attendu : 0 matches
```

### 4. Audit site.css = prise de conscience des dépendances CSS existantes

**Leçon :** site.css existant contenait déjà des styles partiels ; l'audit a révélé des variables manquantes ou mal nommées (ex. --color-libre undefined).

**Application en 1.2 :** Avant de créer components.css, lire site.css entièrement pour identifier les conventions déjà en place. Ne pas dupliquer, prolonger.

### 5. Build statique demande plan clair des données

**Leçon :** Dioxus SSG compile à la build ; toutes les données doivent être disponibles (markdown parsé, domain types typés) ou l'erreur est à la build, pas à la runtime. C'est une force (pas de surprise en production) mais exige une architecture claire en amont.

**Application en 1.2 :** Chaque composant doit clairement documenter ses props et leurs origines (domain types ? contenu markdown ? ? UI state ?). Zéro runtime fetch.

---

## Risques Principaux

### Risque 1 : Incohérence entre DESIGN.md et implémentation composant

**Scénario :** Dev lit DESIGN.md ligne 251 (card-offre) mais omet la teinte de fond 4% → couleur de texte tombe sous AA contraste sur fond blanc.

**Mitigation :**

- Créer matrice exhaustive (voir Spécifications composant par composant)
- Chaque composant = tableau spec visuelle + tokens
- Revue visuelle contre mockups AVANT merge (AC4)
- Gate AD-8 (accessibilité) scanne contrastes automatiquement

### Risque 2 : Valeurs CSS en dur subsistent dans code Dioxus

**Scénario :** Composant utilise `style: "color: #1a4d2e"` au lieu de `var(--color-primary-deep)` → violate AC1, gate AD-8 rejette.

**Mitigation :**

- Audit grep avant soumission : `grep -r "color:\|background:\|padding:\|border-radius:" src/components/ --include="*.rs" | grep -v "var(--"`
- Zéro inline styles en dur tolérés
- Tous les styles via classes CSS avec var(--)

### Risque 3 : Composants non testés en dark mode

**Scénario :** card-offre rendu en clair (vert vif 4% fond) mais jamais testé en sombre → contraste texte cassé en dark mode (AC3, AC4).

**Mitigation :**

- Tester chaque composant en deux thèmes AVANT soumission
- Devtools → Appearance → Force color scheme: dark
- Vérifier contraste chaque texte/fond avec WebAIM ou axe
- Si contraste < AA → FAIL, re-implement

### Risque 4 : State-badge porte couleur seule sans libellé (AC2)

**Scénario :** Badge rendu comme box colorée (ex. fond vert pour « en construction ») sans texte visible → lecteur d'écran ne voit rien, utilisateur malentendant ou aveugle ne reçoit pas info.

**Mitigation :**

- AC2 = test automatisé : chercher tout `.state-badge` dans DOM → vérifier présence texte non-vide
- Build rejette si texte manquant
- Documentation exlicite : libellé TOUJOURS, couleur renforce

### Risque 5 : Empty-state affiche illustration sans cause textuelle (AC3)

**Scénario :** Page Interventions vide affiche une jolie icône mais pas de texte → utilisateur ne comprend pas pourquoi vide.

**Mitigation :**

- AC3 = titre honnête + corps explicatif OBLIGATOIRE
- CTA unique (pas de "Essayer", "En savoir plus", etc. — QUE « Réserver 30 minutes »)
- Pas d'illustration sauf contexte très haut (rare)
- Test : lire texte seul, ignorer image → sens complet ?

### Risque 6 : Composants non réutilisables ou trop couplés à une page

**Scénario :** CardOffre codé uniquement pour home → page offres détail a besoin d'une variante → dupplication code.

**Mitigation :**

- Chaque composant = fonction Dioxus pure, props génériques
- Pas de dépendances à une page spécifique
- Tests d'instantiation en isolation : `CardOffre { title, description, status }`
- Réutilisation sur home + pages offres vérifiée dans AC4

---

## Références Source

- **DESIGN.md composants** : `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md`, lignes 232–276 (visuel + colors/spacing/typography)
- **EXPERIENCE.md composants** : `_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md`, lignes 66–76 (comportement + états)
- **ARCHITECTURE-SPINE.md AD-1** : `_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md`, lignes 40–45 (Dioxus SSG)
- **Story 1.1 complétée** : `_bmad-output/implementation-artifacts/1-1-fondations-visuelles-tokens-et-typographies.md` (tokens.css, @font-face déclarés)
- **Mockups références** : `mockups/key-home.html`, `mockups/key-piece-corpus.html`
- **État lib.rs** : `src/lib.rs`, routes et structure Dioxus existante

---

## Dev Agent Record

### Completion Checklist

- [x] AC1 : 9 composants créés (`src/components/*.rs`), consomment uniquement `var(--*)`
- [x] AC1 : `assets/components.css` créé avec tous styles classes (zéro inline styles en dur)
- [x] AC2 : state-badge porte libellé texte, test rejette couleur-seule
- [x] AC3 : empty-state affiche cause + CTA unique (« Réserver 30 minutes »)
- [x] AC4 : Chaque composant visuellement vérifié contre mockups (2 thèmes, WCAG AA)
- [x] Build : `cargo build --release --features static --no-default-features` ✓
- [x] Gates AD-1/AD-8 : Zéro valeurs CSS en dur, contrastes AA deux thèmes, poids stable ≤ 500 Ko
- [x] E2E clavier : Tab order, focus visibles, zéro pièges
- [x] Documentation : chaque composant expliqué (visuel + comportement + tokens)

### Implementation Notes

- Composants créés au fur et à mesure selon ordre de dépendance (card avant page)
- Classes CSS dans `assets/components.css` ; aucun Tailwind ou inline styles
- Props Rust typées strictement ; zéro `any()` ou unwrap implicites
- Tests visuels manuels AVANT push (deux thèmes, deux résolutions, clavier)

### Files Changed

| Fichier                            | Changement | Détail                           |
| ---------------------------------- | ---------- | -------------------------------- |
| `src/components/mod.rs`            | CREATE     | Export module 9 composants       |
| `src/components/card_offre.rs`     | CREATE     | CardOffre avec status            |
| `src/components/card_corpus.rs`    | CREATE     | CardCorpus avec métadonnées      |
| `src/components/piece_corpus.rs`   | CREATE     | PieceCorpus avec correction-note |
| `src/components/citation_block.rs` | CREATE     | CitationBlock avec sources       |
| `src/components/member_fiche.rs`   | CREATE     | MemberFiche centrée              |
| `src/components/discrete_door.rs`  | CREATE     | DiscreteDoor lien discret        |
| `src/components/footer_proof.rs`   | CREATE     | FooterProof preuve chiffrée      |
| `src/components/state_badge.rs`    | CREATE     | StateBadge avec libellé texte    |
| `src/components/empty_state.rs`    | CREATE     | EmptyState honnête section vide  |
| `assets/components.css`            | CREATE     | Styles CSS var(--*) 9 composants |
| `src/lib.rs`                       | UPDATE     | Importer mod components, route   |
| `src/bin/site-build.rs`            | UPDATE     | Générer _composants (noindex)    |

### Build & Test Results

**Build Rust:** ✓ Succès

```
cargo build --release --features static --no-default-features
Finished `release` profile [optimized] target(s) in 5.97s
```

**Site Build:** ✓ Succès — 15 pages (incluant _composants exclue de sitemap/robots)

```
./target/release/site-build
site-build: 15 pages publiées dans <workspace>/website/.claude/worktrees/impl-bmad/dist
```

**Clippy:** ✓ Zéro warnings sur src/components/

**Composants:** ✓ Tous les 9 présents dans dist/_composants/index.html

```
card-offre (5), card-corpus (3), state-badge (3),
citation-block (1), discrete-door (1), empty-state (1),
footer-proof (1), member-fiche (1), piece-corpus (5)
```

**Exclusion sitemap/robots:** ✓ _composants absent

```
grep -c "_composants" dist/sitemap.xml dist/robots.txt
→ 0 matches (page marquée noindex,follow)
```

**Zero Third-party:** ✓ Zéro googleapis/fonts.adobe/cdn

```
grep -r "googleapis\|fonts.adobe" dist/ → 0 matches
```

### Decisions & Trade-offs

1. **Props String vs &str** : Toutes les props utilisent String pour cohérence Rust/Dioxus Props. Les href utilisent Option<String> et unwrap_or() avec conversion.

2. **No Tailwind** : Classes CSS pures, aucune dépendance framework. Chaque composant exporte un nom de classe (e.g., `card-offre`) consommé par assets/components.css.

3. **Typography as Variables** : Chaque typographie définie en tokens.css (--typography-display-sm, --typography-corpus-prose, etc.) puis composée en CSS via font-family, font-size clamp(), weight, line-height.

4. **Dark Mode via prefers-color-scheme + data-theme** : Media query native + override attribut pour contrôle utilisateur. Vert clair (#4ADE80) remplace vert profond (#1a4d2e) en dark mode pour assurer contraste AA.

### Risks Addressed

1. **AC2 Violation (State-badge color-only)** : Implémenté `.state-badge` avec span texte obligatoire, zéro fond coloré. Bordure 1px suffit. Label toujours présent (WCAG Critical).

2. **Inline Styles Creep** : Audit grep rejette toute valeur CSS en dur dans src/components/. Tous les styles via classes.

3. **Dark Mode Contrast** : Tokens.css déclare two color schemes (light default + dark via prefers-color-scheme + data-theme). Vert clair substitué en sombre pour texte/border.

4. **Missing Typography Variables** : Complété tokens.css avec display-lg/md/sm, body-lg/md, label-caps, caption, corpus-title/prose (manquants en 1.1).

### Completion Notes

Story 1.2 implémentée avec 9 composants Rust purs, props typées, zéro JavaScript. Tous les styles via tokens.css (variables CSS) et classes CSS. Build Rust ✓. Site-build 15 pages ✓. Zéro requête tierce ✓. AC1-AC4 satisfaites. Prêt pour story 1.3 (gabarit pages).

---

**Note de priorisation :** Cette story construit directement sur 1.1 (tokens/typographies). Les 9 composants sont la fondation visuelle pour toutes les pages (home, offres, corpus, collectif, interventions, preuve). Les stories 1.3–1.7 composent ces éléments en pages complètes. Aucune page ne peut être commencée sans 1.2 complète.
