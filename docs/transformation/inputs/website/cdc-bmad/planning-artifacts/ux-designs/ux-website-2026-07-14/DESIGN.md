---
name: Libre IA Vitrine
title: "DESIGN — libre-ai.fr"
status: final
created: 2026-07-14
updated: 2026-07-14
sources:
  - ../../prds/prd-website-2026-07-14/prd.md
  - ../../briefs/brief-website-2026-07-14/brief.md
  - ../../../assets/site.css
  - ../../../assets/tokens.css
colors:
  primary-deep: "#1a4d2e"
  primary-vivid: "#22C55E"
  ink: "#111827"
  muted: "#6B7280"
  border: "#E5E7EB"
  white: "#FFFFFF"
  background: "#FFFFFF"
  surface-dark: "#000000"
  focus: "#111827"
  dark:
    background: "#0B1220"
    surface: "#111827"
    ink: "#F3F4F6"
    muted: "#9CA3AF"
    border: "#293241"
    primary: "#4ADE80"
    focus: "#F9FAFB"
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: clamp(2rem, 3.4vw, 3.3rem)
    fontWeight: "700"
    lineHeight: "1.08"
    letterSpacing: "-0.028em"
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: clamp(1.55rem, 2.6vw, 2.4rem)
    fontWeight: "700"
    lineHeight: "1.12"
    letterSpacing: "-0.024em"
  display-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: clamp(1.35rem, 2.5vw, 2rem)
    fontWeight: "700"
    lineHeight: "1.18"
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "800"
    lineHeight: "1.4"
    letterSpacing: "0.11em"
    textTransform: uppercase
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: "400"
    lineHeight: "1.4"
  corpus-title:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: clamp(1.8rem, 3vw, 2.8rem)
    fontWeight: "600"
    lineHeight: "1.15"
  corpus-prose:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: 19px
    fontWeight: "400"
    lineHeight: "1.65"
rounded:
  sm: 8px
  md: 16px
  full: 9999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
  20: 80px
  24: 96px
  32: 128px
  gutter: clamp(1.125rem, 4vw, 3rem)
  section: clamp(3.5rem, 7vw, 6.5rem)
  page-max: "88rem"
  reading-max: "48rem"
motion:
  fast: "120ms"
  ui: "200ms"
  hero: "320ms"
components:
  border-default: "1px"
  control:
    touchTarget: "44px"
  button-primary:
    background: "{colors.primary-deep}"
    color: "{colors.white}"
    padding: "{spacing.3} {spacing.4}"
    borderRadius: "{rounded.sm}"
    fontSize: "{typography.label-caps.fontSize}"
    fontWeight: "700"
    minHeight: 44px
  button-secondary:
    background: transparent
    border: "{border-default} solid {colors.primary-deep}"
    color: "{colors.primary-deep}"
    padding: "{spacing.3} {spacing.4}"
    borderRadius: "{rounded.sm}"
    fontSize: "{typography.label-caps.fontSize}"
    minHeight: 44px
  card-editorial:
    border: "{border-default} solid {colors.border}"
    borderRadius: "{rounded.md}"
    padding: "{spacing.5}"
    background: "{colors.background}"
    fontSize: "{typography.body-md.fontSize}"
  card-corpus:
    border: "{border-default} solid {colors.border}"
    borderRadius: "{rounded.md}"
    padding: "{spacing.6}"
    background: "{colors.background}"
    typography: "{typography.display-sm} / {typography.body-md}"
  card-offre:
    border: "{border-default} solid {colors.border}"
    borderRadius: "{rounded.md}"
    padding: "clamp(1.5rem, 4vw, 3rem)"
    background: "color-mix(in srgb, {colors.primary-vivid} 4%, {colors.background})"
  footer-proof:
    border: "{border-default} solid {colors.border}"
    borderRadius: "{rounded.md}"
    padding: "clamp(1.75rem, 5vw, 4rem)"
    background: "color-mix(in srgb, {colors.primary-vivid} 7%, {colors.background})"
    layout: "grid / 1fr minmax(18rem, 0.8fr)"
    gap: "clamp(2rem, 8vw, 8rem)"
  member-fiche:
    display: block
    border: "{border-default} solid {colors.border}"
    borderRadius: "{rounded.md}"
    padding: "{spacing.6}"
    textAlign: center
  discrete-door:
    display: inline
    color: "{colors.primary-deep}"
    fontSize: "{typography.body-md.fontSize}"
    fontWeight: "700"
    textDecoration: underline
    textUnderlineOffset: 0.22em
---

## Brand & Style

**Maquettes de référence** : [mockups/key-home.html](mockups/key-home.html) (home canonique — FR-20) · [mockups/key-piece-corpus.html](mockups/key-piece-corpus.html) (page pièce de corpus, serif + corrections) · planches de direction dans `.working/` (exploration, historique). Cette spine gagne sur toute maquette en cas de conflit.

Libre IA est le vendeur silencieux d'une voix indépendante et praticienne — ni peur, ni hype, maîtrise et respect. Le site incarne le positionnement par la forme autant que par le texte : une grille éditoriale claire, un blanc généreux, des éléments disciplinés, des instruments de preuve chiffrés visibles, des visages du collectif incarnés sans surcharge.

**Posture visuelle** : Editorial Minimalism with Proof. L'itération actuelle du site en est la base — hairlines fines, cartes à géométrie stable, martinet typographique (grosseurs et distances hiérarchisées), pas de décoration gratuite. Chaque élément sert : les flèches diriger, les cartes structurer, les citations incarner la preuve. Un seul vert d'autorité, profond et durable, réserve le vif aux micro-touches (états, flèches d'orientation). Le site ne s'excuse jamais : l'honnêteté sur les limites (« offre en construction ») s'accompagne toujours d'une offre disponible aujourd'hui (le conseil).

## Colors

**Primary Deep {colors.primary-deep}** — Le vert d'autorité. Dérivé du vert du site actuel, assombri pour tenir comme petit texte sur lumineux et comme accent sur les contextes sombres. Utilisé pour : les CTA principaux (« Réserver 30 minutes »), les liens au sein du contenu, les micro-touches d'orientation (flèches, états actifs), le trait gauche des citations.

**Primary Vivid {colors.primary-vivid}** — Le vert vif #22C55E du système existant. Réservé strictement aux arrière-plans légers (hover cards, proof bands) et jamais en texte de corps. Justification : le vif sur papier blanc casse la sobriété ; sur fond très clair (5-7% mélangé), il crée une micro-vibration qui concentre l'attention sans crier.

**Ink {colors.ink}** — Texte principal et titre. Contraste WCAG AA assurée sur tous les fonds clair/sombre.

**Muted {colors.muted}** — Paragraphes de soutien, étiquettes, métadonnées. Toujours >= AA sur le fond de page.

**Border {colors.border}** — Hairlines 1px entre conteneurs, entre sections. Signale la hiérarchie sans poids.

**White / Background / Surface** — Pages claires sont blanches ; pages sombres sont #000. Les surfaces intermédiaires (cartes, blocs) restent sur le même fond de page pour la clarté.

**Focus {colors.focus}** — Anneau de focus visible lors de la navigation clavier.

**Thème sombre** — Mêmes rôles, jeu `colors.dark.*`. Contrastes AA vérifiés dans les deux thèmes. Le vert clair `#4ADE80` remplace le vert profond sur fonds sombres (le `#1a4d2e` n'y tient pas le contraste).

## Typography

**Display** (Plus Jakarta Sans) — Titres h1, h2, h3 des pages du site (home, offres, collectif, interventions, preuve). Tailles en clamps fluides pour rester lisible mobile → desktop. Letter-spacing négatif (-0.024 à -0.028em) crée les blocs visuels denses et raffinés.

**Corpus** (Source Serif 4, repli Georgia) — Décision ratifiée : les **pièces du corpus** (titres `{typography.corpus-title}` et prose `{typography.corpus-prose}`) sont en serif éditorial. Le corpus se lit comme une revue qui fait foi ; la rupture typographique signale au lecteur qu'il entre dans le document de référence. Le reste du site conserve la grotesque — l'hybride est volontaire et porteur de sens, pas une incohérence.

**Body** (Inter) — Corps de texte, labels, microcopy. Sans-serif sobre, ligne haute 1.6 pour la lecture longue. Les briefs (pièces du corpus) peuvent ajouter une variante serif éditorial pour les blocs longs de prose, à titre optionnel (prioriser la cohérence du site avant d'ajouter une typographie).

**Label Caps** — Eyebrows, étiquettes de catégorie, status badges. 12px, 800 weight, tracking 0.11em. Toujours uppercase pour la légibilité haute.

**Caption** — Métadonnées sous images, dates, attributions. 13px, line-height 1.4, couleur muted.

**Règle martinet** : une hiérarchie de taille strict, pas d'exceptions. Les titres décroissent lg→md→sm ; le corps a deux poids (16/18px) ; les labels sont un seul size. Cela crée la "logique" que le visiteur reconnaît à chaque page.

## Layout & Spacing

**Grid Foundation** — Page width clamped à {spacing.page-max} (88rem = 1408px). À l'intérieur : gutter fluide {spacing.gutter}, garanti de lisibilité mobile au-dessus de 20px et jamais > 3rem en grand écran. Les sections sortent du gutter pour les hairlines pleines (bordures haut/bas).

**Reading Line** — Corps éditorial limité à {spacing.reading-max} (48rem = 768px). Au-dessus : pas de justification à gauche, la prose s'arrête plutôt que de s'étaler.

**Section Spacing** — Entre chaque bloc majeur (héros, histoire, preuves, pied), {spacing.section} = clamp(3.5rem, 7vw, 6.5rem). À mobile : 3.5rem constant. À desktop : jusqu'à 6.5rem. Justification : le blanc génère la pause reflective que demande le corpus ; une densité différente par taille d'écran ennuie.

**Grille interne** — Préférer les grilles CSS natives 2-col / 3-col avec gap {spacing.8} (32px) plutôt que des flexbox bancales. Les cartes éditorials sont jamais des boîtes flottantes : une grid disciplinée.

**Images** — Toujours aspect-ratio déclaré sauf si l'image elle-même impose le ratio. Border-radius {rounded.md} constant. Pas de décoration sans objet.

## Elevation & Depth

La profondeur est signalée par la bordure et la teinte légère, jamais par l'ombre molle.

**Borders** — Hairline 1px {colors.border} #E5E7EB entre les conteneurs. Une seule force visuelle pour tout le site : pas de border-width variable.

**Tinted backgrounds** — Cartes, proof-bands, blocs de doctrine : fond légèrement teinté {colors.primary-vivid} à 3-7%. Cela crée du volume sans éloigner l'élément du lecteur. Sur tout fond teinté, la couleur de texte est toujours {colors.ink} — jamais la couleur verte en texte sur teinte.

**Focus rings** — Anneau 2px {colors.focus} autour des boutons et liens au clavier, offset 4px pour la respirabilité.

**Transitions** — {motion.fast} (120ms) pour les déplacements subtils (translateY -1px on hover) ; {motion.ui} (180ms) pour les changements de couleur (border, text). Jamais > 280ms sauf {motion.hero} (900ms) réservé au chargement de la page.

## Shapes

**Corner radius** {rounded.md} (16px) sur tous les conteneurs — cartes, blocs de proof, images. {rounded.sm} (8px) sur les petits éléments (boutons, tags, petites images). La constance construit l'identité.

## Components

### Button Primary

Arrière-plan {colors.primary-deep}, texte blanc, padding {spacing.3} × {spacing.4}. Min-height 44px (touch target). Au hover : border-color + léger translateY(-1px). À focus : anneau focus visible. Jamais de shadow.

### Button Secondary

Transparent, border 1px {colors.primary-deep}. Au hover : même transformation. Permet les actions secondaires sans hiérarchie excessive.

### Card Editorial

Border 1px {colors.border}, radius {rounded.md}, padding {spacing.5}. Titre {typography.display-sm}, corps {typography.body-md}. Image au-dessus si présente. Pas de shadow — le border suffit. Au hover : border-color → primary-deep + translateY(-2px). Image : transform scale(1.025) au hover.

### Card Corpus

Contient titre, auteur, date, correction dates, state. Titre {typography.display-sm}, métadonnées {typography.caption}. Corrections visibles et datées (pas de camouflage). Même border/radius/padding que card-editorial. Élément signature : ce composant prouve que le corpus ne cache rien.

### Card Offre

Titre {typography.display-md}, ce que le client repart avec, pièce corpus liée, CTA « Réserver ». Fond : {colors.primary-vivid} à 4%. Status honnête possible : « offre en construction, parlons-en » remplace le CTA si l'offre est future.

### Member Fiche

Bloc centré : photo (100px × 100px, radius {rounded.md}), nom ({typography.display-sm}), parcours ({typography.body-md} muted), rôle ({typography.label-caps}). Pas de hover à la carte : le composant est statique, c'est la page qui converge vers le RDV.

### Discrete Door

Lien texte de contact des pairs. Couleur {colors.primary-deep}, underline en permanence, font-weight 700. Pas de button : c'est une porte discrète, pas une CTA criarde. Microcopy : « Prise de contact spontanée pour les pairs » ou similaire, signet caché dans la prose.

### State Badge

Badge d'état pour offres et pièces de corpus. Bordure 1px {colors.border}, texte {typography.label-caps} {colors.ink}. JAMAIS la couleur seule comme porteur d'information : toujours libellé texte explicite (ex. « EN CONSTRUCTION », « CORRIGÉE »). Pas de fond coloré — la bordure suffit.

### Empty State

Bloc pour sections vides (interventions, contenu manquant). Titre {typography.display-sm}, corps {typography.body-md} {colors.muted}. Un seul CTA réservé (« Réserver 30 minutes » ou « Parlons-en »). Pas d'illustration sauf contexte très haut.

### Citation Block

Bloc citation en fin de pièce maîtresse. Fond {colors.primary-vivid} à 3%, bordure gauche 3px {colors.primary-deep}, texte {typography.body-md}, bouton copier optionnel sans JS obligatoire. Format : [Fact]. [Source #1]. [Source #2]. Hyperlinké.

### Footer Proof

**Composant signature du site** — Bloc de preuve chiffrée en fin de chaque section majeure (offres, collectif, interventions). Layout : image/icône ({spacing.6} × {spacing.6}) à gauche, métadonnées à droite (date, source, lien). Título / stat {typography.display-sm}, contexte {typography.body-md} muted. Border {colors.border}, radius {rounded.md}, padding clamp(1.75rem, 5vw, 4rem). Fond teinté {colors.primary-vivid} 7%. Cet élément n'existe nulle part ailleurs : il matérialise « preuve par l'exemple, publiquement documentée ». Chaque preuve doit être datée et traçable.

## Pratiques recommandées et anti-pratiques

**À faire :**

- Une seule couleur d'accent (primary-deep) visible en texte et micro-touches
- Bordures fines 1px pour la hiérarchie
- Blanc généreux entre les sections — la pause est une fonctionnalité UX
- Tous les composants sur une grille 2-col ou 3-col ; pas de flexbox bancal
- Images avec aspect-ratio déclaré et radius constant
- Transitions courtes et subtiles (hover → -1px + color)
- Typographie martinet strict : lg/md/sm pour display, deux poids pour body
- Dates et corrections visibles sur tout contenu éditorial
- États honnêtes (« en construction », corrections) jamais cachés
- CTA universel « Réserver 30 minutes » partout, jamais de call-to-action dispersés

**À éviter :**

- Pas de double vert (primaire vif + profond mélangés) dans une même page
- Pas de décoration gratuite (dégradés, stickers, illustrations sans objet)
- Pas d'affordances au survol uniquement — tout reste lisible au repos
- Pas d'ombre molle ; la bordure crée la profondeur
- Pas de serif hors du corpus — la grotesque tient tout le reste du site ; le serif est réservé aux pièces du corpus (`{typography.corpus-title}` / `{typography.corpus-prose}`), c'est leur signature
- Pas de motion > 280ms sauf au chargement de page
- Pas de site qui s'excuse (« désolé si c'est incomplet ») — transparence + offre disponible
- Pas de prix ni de promesse sans preuve
- Pas de suivi, pixels, analytique comportementale
- Pas de menu burger ou overlay : la nav est stable et visible

---

**Note de priorisation** : Cette spine gagne sur tout mock en cas de conflit. Les jetons documentés ci-dessus sont le source de vérité visuelle. Les planches de direction (5 explorations) conservées en archives ont servi à trancher ces choix ; la base retenue honore le site actuel comme fondation et ajoute discipline (vert profond, footer de preuve, états honnêtes) sans rupture.
