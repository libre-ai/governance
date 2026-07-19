# Revue Rubrique — Libre IA Vitrine (DESIGN.md + EXPERIENCE.md)

## Verdict global

Les deux spines forment un contrat de handoff **adéquat avec critiques élevées** pour l'architecture et story-dev. L'expérience utilisateur et le système de design sont documentés selon les patterns requis ; les jetons et composants sont nommés ; les flows clés sont numérotés et ont leurs climax. Cependant, trois asymétries bloquent une résolution nette : jetons manquants du frontmatter, composants sans spec visuelle, et références aux maquettes orphelines. La spec gagne à être clarifiée avant développement.

---

## 1. Flow coverage — Adequate

**Ce qui a été vérifié:**

- 4 flows clés nommés (UJ-1 à UJ-4 correspondant au PRD §2.3).
- Chaque flow : protagoniste identifié, entrée et sortie explicites, steps numérotés (6–7 par flow), climax clair (RDV, citation, confiance levée, contact spontané).

### Findings

- **High** — Flow 2 (Policy Advisor, Karim) et Flow 3 (DSI Skeptical, Lena) n'ont pas de **failure path explicite**. Flow 1 (Claire) couvre erreur de formulaire ("Form error → inline message") mais Flow 2 et 3 silence les scénarios d'erreur (mauvaise source trouvée, preuve insuffisante). _Fix:_ Ajouter une ligne "Failure:" à Flow 2 et 3, e.g., "Failure: Source not found or contradicts independence → user skeptical, exits."

---

## 2. Token completeness — Thin

**Ce qui a été vérifié:**

- Extraction de tous les jetons du frontmatter DESIGN.md : colors (9), typography (8), rounded (3), spacing (13), components (8).
- Extraction de toutes les références `{...}` en prose DESIGN.md et EXPERIENCE.md.

### Findings

- **Critical** — DESIGN.md frontmatter **manquent 6 jetons** référencés dans la prose :
  - `{spacing.page-max}` (Layout & Spacing, "Page width clamped à {spacing.page-max}") — **nicht défini** ✗
  - `{spacing.reading-max}` (Layout & Spacing, "Reading Line limité à {spacing.reading-max}") — **nicht défini** ✗
  - `{motion-fast}` (Elevation & Depth, "transitions courtes (120ms {motion-fast})") — **nicht défini** ✗
  - `{motion-ui}` (Elevation & Depth, "{motion-ui} (180ms)") — **nicht défini** ✗
  - `{motion-hero}` (Elevation & Depth, "{motion-hero} (900ms)") — **nicht défini** ✗
  - `{control-touchTarget}` (EXPERIENCE.md Interaction Primitives, "Touch targets >= 44px ({control-touchTarget})") — **nicht défini** ✗

  _Fix:_ Ajouter au frontmatter DESIGN.md :

  ```yaml
  spacing:
    page-max: "88rem" # 1408px
    reading-max: "48rem" # 768px
  motion:
    fast: 120ms
    ui: 180ms
    hero: 900ms
  control:
    touchTarget: "44px"
  ```

- **High** — Contraste pour WCAG AA déclaré ("Contraste WCAG AA assurée") mais pas de **paires de couleurs targets documentées** pour chaque combo (texte-sur-fond, lien-sur-fond, focus-ring-sur-fond). WCAG AA = 4.5:1 pour texte normal, 3:1 pour grand texte. _Fix:_ Documenter les paires testées (Ink sur Background = X:1, Focus ring sur White = Y:1, etc.) dans §Colors ou en note technique.

---

## 3. Component coverage — Thin

**Ce qui a été vérifié:**

- Extraction de tous les composants nommés dans DESIGN.md.Components (8 : button-primary, button-secondary, card-editorial, card-corpus, card-offre, footer-proof, member-fiche, discrete-door).
- Extraction de tous les composants dans EXPERIENCE.md.Component Patterns (9 : Card Offre, Card Corpus, Page pièce de corpus, Citation Block, Member Fiche, Discrete Door, Proof Footer, State Badge, Empty State).
- Vérification que chaque composant existe dans les deux sections.

### Findings

- **High** — **3 composants asymétriques** — spec comportementale en EXPERIENCE.md mais pas de spec visuelle en DESIGN.md :
  - `State Badge` (EXPERIENCE.md ligne "offre-en-construction", label "EN CONSTRUCTION", color {colors.primary-deep}) — **pas de section dans DESIGN.md.Components** ✗
  - `Empty State` (EXPERIENCE.md, h1 + body "section is empty", CTA, "no illustration unless high-context") — **pas en DESIGN.md** ✗
  - `Citation Block` (EXPERIENCE.md "End of pièce maîtresse", format inline [Fact]. [Source #1], list at end) — **comportement défini mais zero visual design** (font, spacing, layout, border?) ✗

  _Fix:_ Ajouter trois composants au §Components de DESIGN.md avec spec complète (padding, typography, border/background, focus states, etc.).

- **Medium** — **Page pièce de corpus** a une spec comportementale fine (EXPERIENCE.md Component Patterns : serif corpus-title/corpus-prose, bloc correction, date) mais la spec **visuelle est implicite**. DESIGN.md Do's says "Pas de serif hors du corpus" mais où est le gabarit de page ? Faut-il un Component "Corpus Page Template" en DESIGN ? _Fix:_ Soit créer une section DESIGN.md "Corpus Page Layout" (grid, section spacing, margin autour du corps), soit clarifier dans "Page pièce de corpus" EXPERIENCE que le gabarit hérite des blocs standard (sections, typographie corpus-*).

---

## 4. State coverage — Adequate

**Ce qui a été vérifié:**

- Extraction de toutes les surfaces IA (Home, Offre card, Offre detail, Corpus list, Corpus pièce, Interventions, Forms).
- Extraction de tous les états (loading, error, empty, draft, corrected, offline, permission-denied, etc.) pour chaque surface.

### Findings

- **Low** — **Keyboard focus state** (`:focus-visible` ring, 2px {colors.focus}) décrit dans Accessibility Floor et Interaction Primitives, pas dans State Patterns. C'est une interaction pattern (visuelle non-stateful), cohérent avec le choix. Pas de critère.

- **Low** — **Form loading state** mentionné en Page Loading ("Prise de RDV form: submit disabled, label 'Vérification de disponibilité…'") mais pas détaillé dans State Patterns. _Fix:_ Optionnel — rajouter ligne "Form loading" avec "Submit disabled, spinner or label change during availability check" si on veut exhaustivité.

---

## 5. Visual reference coverage — Broken

**Ce qui a été vérifié:**

- Frontmatter sources (DESIGN.md list: `../../../assets/site.css`, `../../../assets/tokens.css`) et PRD/Brief.
- Mentions de `.working/`, `mockups/`, `wireframes/`, `imports/` dans les spines.
- Liens inline aux visuels dans la prose.

### Findings

- **Critical** — **Aucune référence visuelle inline.** Frontmatter DESIGN.md cite `sources: [..., ../../../assets/site.css, ../../../assets/tokens.css]` mais **la prose ne les lie jamais** (e.g., "Pour les détails existants, voir assets/site.css") ni n'explique ce qu'elles apportent. .memlog mentionne "5 directions de design rendues et ouvertes" + "5 planches conservées en référence .working/" mais **aucun lien dans les spines**. _Fix:_ Ajouter en frontmatter DESIGN.md `imports:` ou en §Brand & Style une note : "Maquettes de direction (5 explorations) : .working/. Itération actuelle (assets/site.css) : référence de base conservée pour la grille et le martinet typographique."

- **High** — Pas de référence au **site actuel** (libre-ai.fr ou screenshot). .memlog dit "La base retenue honore le site actuel comme fondation" mais DESIGN.md prose cite jamais le site existant ni ne renvoie à une doc de comparaison. Consumer ignore ce qui a changé. _Fix:_ Ajouter "Comparaison avec itération actuelle" section ou note (« Grille éditoriale, hairlines fines, cartes, blanc, martinet sont conservés. Ajouts : instruments de preuve chiffrés (footer-proof), vert profond (primary-deep au lieu de start), densité au-dessus du pli »).

---

## 6. Bloat & overspecification — Adequate

**Ce qui a été vérifié:**

- Présence de specs pixel vs tokens.
- Redondance avec PRD.
- Prose vs tables.
- Sections sans utilité downstream.

### Findings

- **Medium** — **Questions ouvertes UX en fin de EXPERIENCE.md** (6 points, "Exact label arbitrage", "Language toggle scope", etc.) ne devraient **pas être dans le spine spec**. Un consumer lit EXPERIENCE.md pour implémente, pas pour débattre. .memlog.md note déjà que ces Q sont résolues ou différées; including them confond "spec" et "decision journal". _Fix:_ Retirer §Questions ouvertes UX de la spec. Les ajouter à .memlog ou à un doc "Decision Log" séparé.

- **Low** — EXPERIENCE.md.Foundation répète qu'il n'y a "no CMS, no tracking, no accounts" — déjà couvert par PRD §5 (Non-objectifs). Minor restatement. _Fix:_ Optionnel — condenser : "Voir PRD §5 contraintes. Implications : pas de backend dynamique, tout contenu en markup versionnable."

---

## 7. Inheritance discipline — Thin

**Ce qui a été vérifié:**

- Frontmatter sources resolve.
- UJ / FR / NFR names verbatim from PRD.
- Glossaire identique.
- Noms composants identiques across sections.
- EXPERIENCE token refs resolve to DESIGN tokens by name.

### Findings

- **High** — **Noms composants inconsistents (kebab vs Title Case).** DESIGN.md.Components : `card-offre`, `discrete-door`, `footer-proof`. EXPERIENCE.md.Component Patterns : "Card Offre", "Discrete Door", "Proof Footer". Implementation doit choisir convention ; la spec la laisse ambiguë. _Fix:_ Standardiser soit kebab (card-offre, discrete-door, footer-proof) soit PascalCase (CardOffre, DiscreteDoor, FooterProof) dans les deux spines.

- **High** — Token refs cassées (voir §2 critiques). {spacing.page-max}, {motion-*}, {control-touchTarget} in prose → frontmatter doesn't define → implementation can't resolve. _Fix:_ Ajouter jetons au frontmatter (per §2).

- **Low** — UJ-1/2/3/4, FR-1 to FR-22, NFR-1 to NFR-15 tous verbatim PRD. Glossaire (Corpus, pièce, chaîne maîtrisée, porte discrète) identical. ✓

---

## 8. Shape fit — Adequate

**Ce qui a été vérifié:**

- DESIGN.md sections en ordre canonique (Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts).
- EXPERIENCE.md sections defaults requis (Foundation, IA, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows).
- Sections optionnelles defensible.

### Findings

- **Verdict:** DESIGN.md suit l'ordre canonical parfait. EXPERIENCE.md defaults tous présents + 5 sections optionnelles (Responsive & Platform, Inspiration & Anti-patterns, Thematic & State Summary, Cross-Document Reference, Implementation Notes) bien justifiées sauf § Questions ouvertes UX (voir §6). Pas de missing sections.

---

## Notes mécaniques

- **Erreur de langue mineure:** EXPERIENCE.md Component Patterns table et State Patterns table partiellement en anglais (« If offre status is... », « Submitted data preserved »). .memlog note "table EXPERIENCE.md partiellement en anglais". _Fix optionnel:_ Traduire ou marquer comme "exemple technique", clarifier langue officielle du document.

- **Références croisées:** Frontmatter DESIGN.md cite sources (PRD, Brief, site.css, tokens.css) ; EXPERIENCE.md cite sources (PRD, Brief, DESIGN.md). Aucune ciclo-référence problématique. ✓

- **Mermaid / diagrams:** Aucune syntaxe Mermaid utilisée. OK pour une spec textuelle.

---

## Résumé des findings

| Sévérité     | Compte | Catégories                                                                                                                   |
| ------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | 2      | Token completeness (6 jetons manquants), Visual reference (pas de lien aux maquettes)                                        |
| **High**     | 5      | Component coverage (3 asymétries), Inheritance (noms inconstants + tokens cassés), Flow coverage (2 flows sans failure path) |
| **Medium**   | 2      | Bloat (Questions ouvertes, narrative)                                                                                        |
| **Low**      | 3      | State coverage (keyboard focus, form loading details), Language consistency                                                  |

---

**Chemin complet:** `/Users/ifi6567/Documents/libre-ai/website/_bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/review-rubric.md`
