---
title: "Réconciliation Architecture ← PRD + Spines UX"
status: final
created: 2026-07-14
purpose: "Identify gaps between ARCHITECTURE-SPINE.md and its sources (PRD + DESIGN.md + EXPERIENCE.md)"
---

# Réconciliation : Architecture ← Intrants PRD + UX

## Synthèse

Lecture croisée de ARCHITECTURE-SPINE.md contre prd.md, DESIGN.md et EXPERIENCE.md. Recherche : exigences du PRD ou des spines UX non couvertes, contredites, ou silencieusement déférrées dans l'architecture.

**Verdict** : Couverture fonctionnelle solide (FR-1 à FR-22, NFR-1 à NFR-15 identifiées). Mais **cinq écarts qualitatifs majeurs** révèlent une implémentation incertaine ou une logique de gate incomplète.

---

## Écarts identifiés

### 1. Bloc citation (FR-4) — Documenté en UX, absent de l'AD

**Exigence PRD :**

- FR-4 : « Chaque pièce a un permalien stable, un titre stable, des métadonnées de partage (Open Graph, schema.org), et **un bloc « citer cette page »** (auteur, titre, date, URL). »

**Spécification EXPERIENCE.md :**

- **Citation Block** (l. 71–73) : « Format : [Fact]. [Source #1]. [Source #2]. Hyperlié. Inlining acceptable (exposant [1], [2]) si natif PDF ; toujours inclure liste visible en fin de page. »
- Composant signature, bloc fondateur de la citabilité

**Couverture architecturale :**

- Capability Map (l. 245) : « FR-4 — Citabilité » → « domain.rs (CorpusPiece), Dioxus render ».
- **Aucune AD** n'adresse la génération du bloc citation, son placement, son format Dioxus.

**Risque** :

- Format du bloc citation et sa rendu (composant Dioxus ? HTML brut inliné dans le Markdown ?) non spécifiés.
- Sans clarification architecturale, implémenteur risque de le placer (fin d'article, en sidebar, en pied), choisir un format (APA, Chicago, URI brut).

**Statut** : Exigence métier P0, documentée en UX, absent de l'architecture technique.

---

### 2. Footer de preuve — Composant signature non mappé à une AD

**Exigence EXPERIENCE.md :**

- **Footer Proof** (l. 274–277) : « **Composant signature du site** — Bloc de preuve chiffrée en fin de chaque section majeure (offres, collectif, interventions). Layout : image/icône à gauche, métadonnées à droite (date, source, lien). (...) Cet élément n'existe nulle part ailleurs : il matérialise « preuve par l'exemple, publiquement documentée ». »

**Spécification DESIGN.md :**

- **footer-proof** (l. 143–149) : Jetons CSS complets (layout grid 2-col, gap, padding clamp, background color-mix, border radius).

**Couverture architecturale :**

- **Aucune mention** dans ARCHITECTURE-SPINE.md.
- Aucune AD ne documente ce composant ou son rôle structurel.
- Aucune gate n'en garantit la présence ou la rigueur (dates, sources, traçabilité).

**Risque** :

- Implémenteur peut la traiter comme nice-to-have optionnel au lieu d'élément **signature**.
- Absence de rigueur : dates manquantes, sources non traçables, données chiffrées non documentées.

**Statut** : Décision architecturale implicite (matérialise le pilier « preuve publiquement documentée »), absent de la spine.

---

### 3. Thème sombre + vars CSS — Implicite, contrat sur tokens.css non spécifié

**Exigence DESIGN.md :**

- (l. 21–29) : Jeu complet `colors.dark.*` avec contraste WCAG AA en mode sombre.
- (l. 189) : « Le vert clair `#4ADE80` remplace le vert profond sur fonds sombres. »

**Exigence EXPERIENCE.md (Support thème) :**

- (l. 239) : « Les modes clair (défaut) et sombre (préférence système) sont **déjà supportés dans tokens.css**. Aucune logique additionnelle requise ; les vars CSS gèrent automatiquement le contraste. »

**Couverture architecturale :**

- **Aucune mention** de thème sombre, vars CSS, ou `prefers-color-scheme` dans ARCHITECTURE-SPINE.md.
- AD-1 (Dioxus SSG) dit « zéro JavaScript embarqué », mais le thème sombre repose sur CSS media query (`prefers-color-scheme`) — technique non-JS mais dépendante de vars CSS existantes.

**Risque** :

- Contrat sur tokens.css non documenté : si l'archi suppose que tokens.css existe et est construit (ex. par un outil design-to-code), mais que ce n'est pas fait ou qu'il sort de la build Dioxus, inconsistance.
- Implémenteur peut reconstruire les vars CSS de zéro au lieu de réutiliser ou générer depuis tokens.css.

**Statut** : Exigence NFR implicite (supportée), mécanisme d'implémentation absent de l'AD.

---

### 4. Métadonnées de partage (OG, schema.org) — Absent de l'AD

**Exigence PRD :**

- FR-4 : « des métadonnées de partage (Open Graph, schema.org) »

**Couverture architecturale :**

- Capability Map : « FR-4 — Citabilité » → « domain.rs (CorpusPiece), Dioxus render ».
- Aucune AD n'adresse la génération des tags `<meta property="og:*">` ou `<script type="application/ld+json">`.
- Aucune gate n'en vérifie la présence ou la cohérence.

**Risque** :

- Pièces du corpus non-shareables sur réseaux sociaux (Twitter/X, Slack, LinkedIn).
- Sans schema.org, moteurs de recherche ne parsent pas l'auteur, date, source.
- Métadonnées manquantes = dégradation de la citabilité (l'objectif principal de FR-4).

**Statut** : Exigence métier P0 (citabilité), mécanisme technique absent.

---

### 5. Registre de voix (NFR-15) — Exigence qualitative non-enforcée en gate

**Exigence PRD :**

- NFR-15 (l. 195–196) : « Registre de la voix : maîtrise et respect — jamais la peur (souveraineté-panique), jamais la hype. L'humilité sur ce qui n'est pas prêt est obligatoire et assumée comme argument. Toute formulation qui promet sans preuve est refusée en revue éditoriale. »

**Spécification EXPERIENCE.md :**

- **Voix et ton** (l. 41–59) : Table complète avec « À faire » / « À éviter » et exemples concrets par surface (Offres, Corpus, Collectif, Interventions, Preuve).

**Couverture architecturale :**

- **Aucune AD** ne documente l'enforcement de NFR-15.
- AD-8 (Gates CI) liste 5 gates : Editorial, Weights, A11y+Keyboard, Zero-third, Confidentiality.
- **Aucune gate n'adresse le registre de voix** (détection de patterns alarmistes, promesses sans preuve, hype language).

**Risque** :

- NFR-15 est une exigence qualitative dure (« jamais de peur », « jamais de survente »), mais elle est enforcée uniquement en revue humaine.
- Sans linter ou gate automatisé, dérive lors de la révision éditoriale (rédacteur oublie la contrainte, validateur ne la vérифie pas systématiquement).

**Statut** : Exigence métier P0, non-enforcée architecturalement (revue manuelle seule).

---

## Écarts secondaires notés

| Écart                                                     | Sévérité | Remarque                                                                                                                  |
| --------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| **RSS découvrabilité (FR-22)** — Absent                   | M        | FR-5 exige un flux RSS ; FR-22 exige qu'il soit découvrable. Aucune AD ne spécifie le lien `<link rel=...>`               |
| **Purge « libre-ia » assets (NFR-14)** — Déféré sans gate | M        | Deferred §4 l'identifie comme epic implémentation, mais aucune gate CI ne la bloque.                                      |
| **Purge PII logs (AD-4)** — Implicite                     | B        | AD-4 dit « logging zéro PII (hash SHA256 email si traçabilité) », mais aucune gate de confidentialité ne le valide en CI. |

---

## Conclusion

**Cinq écarts majeurs requièrent clarification ou new AD :**

1. **Bloc citation (FR-4)** → Spécifier composant Dioxus, format, placement. (ou nouveau AD)
2. **Footer de preuve** → Mappage à une AD, gate pour vérifier dates/sources traçables. (ou nouveau AD)
3. **Thème sombre** → Documentifier le contrat sur tokens.css + vars CSS (nouveau AD ou extension AD-1)
4. **Métadonnées OG/schema.org** → Nouveau AD pour génération au build Dioxus + gate de vérification.
5. **Registre de voix (NFR-15)** → Gate CI linter ou checklist automatisée (détection patterns alarmisme).

**Tous les autres FR/NFR du PRD sont mappés et couverts.** Ces cinq sont des **détails d'implémentation omis** ou des **gate d'enforcement manquantes** — criticalité métier, mais non-visibilité architecturale.
