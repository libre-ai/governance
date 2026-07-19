---
title: "Revue d'accessibilité — libre-ia.fr"
status: draft
created: 2026-07-14
standard: "RGAA 4 / WCAG 2.2 AA"
reviewer: "Bmad-UX Accessibility Gate"
references:
  - DESIGN.md
  - EXPERIENCE.md
---

# Revue d'accessibilité — Spines UX libre-ia.fr

## Verdict général

**Ossature conforme WCAG 2.2 AA sur contrastes/clavier/structure, mais trois lacunes critiques compromettent le déploiement : tokens sombres absents, badges reposent sur couleur seule, processus image/alt-text non formalisé.**

---

## Findings critiques

### 1. [CRITIQUE] Tokens de thème sombre absents

**Section DESIGN.md (Color palette) + EXPERIENCE.md (Foundation, ligne 21)**

**Problème:** EXPERIENCE.md annonce « both light and dark modes supported (light is default public; dark available via system preference) » et « Theme support: Light (default) and dark (system preference) already supported in tokens.css ». Cependant, DESIGN.md ne définit aucun token pour mode sombre. Seule `surface-dark: "#000000"` est déclaré mais jamais mappé à une utilisation.

**Impact:**

- En mode sombre (système), toutes les couleurs reposent sur des CSS vars non définis.
- Risque immédiat : contraste échoué (ex. blanc sur noir requiert inversion explicite du ratio ; si on applique les vars claires, on obtient #1a4d2e sur #111827 = ~1.2:1, **ÉCHOUE AA**).
- Pas de fallback WCAG pour les utilisateurs avec préférence sombre.

**Correctif proposé:** Ajouter à DESIGN.md une section **`colors-dark`** mappant chaque token clair à son équivalent sombre, avec vérification de contraste :

```yaml
colors-dark:
  primary-deep: "#4ADE80" # vert vif en dark (inverse du vif light)
  ink: "#F3F4F6" # très clair pour text sur #000
  background: "#000000" # remplace white
  border: "#374151" # plus clair pour hairlines sur dark
  focus: "#86EFAC" # accent focus lisible sur #000
```

Puis vérifier chaque combinaison (ex. #86EFAC focus sur #000 background).

**Sévérité:** CRITIQUE — blocage de conformité WCAG 2.2 en mode sombre.

---

### 2. [CRITIQUE] Fonds primaires légers sans spec de couleur de texte

**Section DESIGN.md (Components > card-offre, footer-proof) + EXPERIENCE.md (Component Patterns, ligne 74)**

**Problème:** `card-offre` déclare fond `color-mix(in srgb, #22C55E 4%, #FFFFFF)` (rgb ~246,253,249 = blanc quasi-pur). `footer-proof` déclare 7% (rgb ~240,251,244 = blanc quasi-pur).

Aucune spécification de la couleur de texte sur ces fonds. Les composants décrivent contenu (titre, stat, métadonnées) mais pas leur couleur.

**Risque contraste:**

- Si on place `ink` #111827 : 10.28:1 (OK AA) ✓
- Si on place du blanc ou très clair : ~1:1 (ÉCHOUE) ✗
- Ambiguïté implique une implémentation ad-hoc ou une violation silencieuse.

**Correctif proposé:**

- Ajouter aux composants `card-offre` et `footer-proof` : `color: "{colors.ink}"` (hériter du texte principal).
- Documenter : « Tous les textes sur fonds teintés 4–7% utilisent {colors.ink} pour garantir AA. »
- Tester empiriquement : `ink` sur vert 4% et 7%.

**Sévérité:** CRITIQUE — risque de contrastes échoués à l'implémentation.

---

### 3. [CRITIQUE] Processus d'alt-text des images non défini

**Section EXPERIENCE.md (Accessibility Floor, ligne 109) + (Component Patterns : Member Fiche, Proof Footer)**

**Problème:** EXPERIENCE.md exige « Images have alt text (not empty; alt describes image purpose, not "image of...") » mais ne spécifie pas :

- Qui écrit les alts (fondateur ? designer ? développeur) ?
- Processus de review avant publication ?
- Template/checklist pour les fiches membres, photos preuve ?

Composants impactés :

- `Member Fiche` : photo 100×100px du fondateur/collectif. Alt doit être descriptif (« Fondateur, prénom nom » ? « Photo fondateur, prénom nom ») — sujet à variation.
- `Proof Footer` : image/icône de stat. Alt requiert contexte métier (« Audit indépendant 2026, cabinet XXX » ?).
- Corps corpus : images d'illustration (si présentes).

**Risque:** Alts systématiquement vides, génériques, ou orphelins de révision. Lecteurs d'écran tombent sur `image`, utilisateurs aveugles perdent le contexte.

**Correctif proposé:**

1. Ajouter à EXPERIENCE.md une section « **Image Accessibility Workflow** » :
   - Propriétaire content (fondateur) fournit alt-text lors de l'upload.
   - Checklist : alt ≥ 8 mots, spécifique au sujet/rôle/contexte, pas de « image of ».
   - Review dans la PR (dev/designer valide avant merge).
2. Template pour fiches : « `alt="{Prénom Nom}, {rôle court}. {une phrase parcours}."` »
3. Template pour proof footer : « `alt="Stat : {sujet}. Contexte : {source/date}."` »

**Sévérité:** CRITIQUE — non-conformité opérationnelle (WCAG 1.1.1 Texte non textuel).

---

## Findings élevés

### 4. [ÉLEVÉ] Badges d'état reposent sur couleur comme seul signal

**Section DESIGN.md (Components > State Badge) + EXPERIENCE.md (Component Patterns, ligne 74)**

**Problème:** State Badge (« EN CONSTRUCTION », « corrigée ») est défini comme :

```
label {typography.label-caps}, color {colors.primary-deep}, no background
```

Donc : texte en caps, bold 800, 12px, couleur vert profond #1a4d2e, **pas d'arrière-plan ni bordure.**

**En niveaux de gris (deutéranopie ou screenshot monochrome) :** seul le texte UPPERCASE subsiste. Mais UPPERCASE alone sans autres signaux (bordure, icône, position) peut passer inaperçu — notamment dans une liste de cartes où tout est en majuscules (label-caps).

**Teste :** #1a4d2e en niveaux de gris = gris très foncé (~RGB 56,56,56) sur blanc = assez contrasté mais indistinguible d'un label normal. La distinction « EN CONSTRUCTION » vs label catégorie se perd.

**Correctif proposé:**

1. Ajouter une bordure 1px ou bordure-bas pour les badges d'état :

   ```css
   state-badge {
     color: {colors.primary-deep};
     border: 1px solid {colors.primary-deep};
     border-radius: {rounded.sm};
     padding: {spacing.1} {spacing.2};
   }
   ```

   Ou utiliser un petit icône (⚠ ou ⏱) non-coloré avant le label.

2. Tester en niveaux de gris (DevTools > Emulate CSS media feature prefers-color-scheme) pour confirmer que le badge reste distinct.

**Sévérité:** ÉLEVÉ — non-conformité partielle WCAG 1.4.1 (Use of Color).

---

### 5. [ÉLEVÉ] Formulaires : structure sémantique incomplete

**Section EXPERIENCE.md (Implementation Notes, ligne 233) + (Interaction Primitives, ligne 93)**

**Problème:** Formulaire de RDV et contact décrit fonctionnellement (« Form appears. Pre-fill optional. One-click submit. ») mais sans structure sémantique :

- Pas de `<fieldset>` / `<legend>` groupant champs.
- Pas de spec si les labels sont associées via `for="id"` ou wrappées (`<label><input /></label>`).
- Pas de spec des attributs `type`, `required`, `autocomplete`, `aria-label` / `aria-describedby`.
- État de validation (error message, inline help) décrit génériquement (« inline message ») mais pas de lien à la saisie (aria-invalid, aria-error-message).

**Risque:** Lecteurs d'écran ne comprennent pas le regroupement des champs, ne relient pas les erreurs aux inputs, présentent les labels sans contexte.

**Ex. flow utilisateur :** Claire remplit formulaire RDV. Error : « Email invalid ». Lecteur d'écran : aucun lien entre le message error et le champ email. L'utilisateur malvoyant doit tabber pour trouver quel champ s'est réifié.

**Correctif proposé:**
Ajouter à EXPERIENCE.md une section « **Form Semantics & Validation** » :

```markdown
### Form Structure

- Every `<form>` groups related inputs via `<fieldset><legend>Réservation</legend>…</fieldset>`.
- Each input has explicit `<label for="email">Adresse email</label><input id="email" name="email" type="email" required aria-required="true" />`.
- On validation error:
  - Set `aria-invalid="true"` on the input.
  - Add `<span id="email-error" role="alert">Email invalide. Vérifiez le format.</span>`.
  - Link via `aria-describedby="email-error"` on the input.
  - Move focus to the first invalid field (or announce it via `aria-live="polite"`).
- Autocomplete attributes: `autocomplete="name"`, `autocomplete="email"`, etc. for password managers.
```

**Sévérité:** ÉLEVÉ — risque WCAG 3.3.1 (Error Identification) et 4.1.2 (Name, Role, Value).

---

### 6. [ÉLEVÉ] Thème sombre : absence de test de contraste sur fonds primaires teintés

**Section DESIGN.md (Elevation & Depth, ligne 197) + EXPERIENCE.md (Theme support, ligne 231)**

**Problème:** Les fonds teintés primaires (4–7% vert vif) sont décrits pour light mode seulement. En mode sombre, si on applique la teinte sur #000 au lieu de #FFFFFF, le résultat change radicalement :

- Light: color-mix(in srgb, #22C55E 7%, #FFFFFF) ≈ RGB(240, 251, 244) = quasi-blanc.
- Dark: color-mix(in srgb, #22C55E 7%, #000000) ≈ RGB(2, 14, 6) = quasi-noir.

Et le contraste de texte `ink` (#111827 ≈ noir très foncé) sur RGB(2, 14, 6) ≈ 1:1 (ÉCHOUE).

**Correctif proposé:**

1. Ajouter à DESIGN.md (Colors section) une sous-section `elevation-dark` mappant les teintes sombres :
   ```yaml
   elevation-dark:
     card-offre-bg: "color-mix(in srgb, #4ADE80 10%, #111827)" # vert clair sur dark bg
     footer-proof-bg: "color-mix(in srgb, #4ADE80 12%, #111827)"
   ```
2. Vérifier contrastes :
   - `ink` (#F3F4F6, light text) sur card-offre-dark.
   - `ink-dark` (si défini) ou `#111827` sur card-offre-dark.

**Sévérité:** ÉLEVÉ — contraste échoué en dark mode.

---

## Findings moyens

### 7. [MOYEN] Aucun spec de responsivité tactile sur hover states

**Section DESIGN.md (Components > Button Primary, Card Editorial) + EXPERIENCE.md (Interaction Primitives, ligne 97)**

**Problème:** DESIGN.md décrit hover states (« border-color → primary-deep + translateY(-2px) ») mais EXPERIENCE.md dit « No hover-only state on mobile ».

Ambiguïté : sur mobile (sm < 768px), si hover states sont supprimés, les affordances visuelles disparaissent. Utilisateur tactile ne voit pas que le bouton est « pressable » jusqu'au touch.

**Correctif proposé:**
Clarifier les états tactiles :

```markdown
### Hover / Focus / Active (Touch)

- Desktop (hover available): Button changes border-color + translateY on hover. Focus ring always visible.
- Mobile (no hover): Button has no translateY on press-and-hold. Instead: active state = scale(0.98) + darker border-color on :active, removed immediately on release. Focus ring visible on :focus after tap-out.
```

**Sévérité:** MOYEN — UX dégradée sur mobile, WCAG 2.5.5 (Target Size) partiellement couvert (44px OK, affordance unclear).

---

### 8. [MOYEN] Footer Proof : propriété d'image et stat non formalisée

**Section EXPERIENCE.md (Component Patterns > Proof Footer, ligne 73) + (Key Flows, ligne 156)**

**Problème:** Proof Footer contient « Image + stat on left, context on right » mais ne spécifie pas :

- Format image (icône ? photo ? diagramme ?).
- Qui fournit l'image (fondateur ? designer ?).
- Où sont stockées les images (repo ? assets/ ? inline SVG ?).
- Stat : format (« 12 mois d'expérience » vs « 12mo experience »). Unité. Vérifiabilité.

**Risque:** Chaque proof footer est créé ad-hoc, alt-texts manqués, formats incohérents.

**Correctif proposé:**
Ajouter à EXPERIENCE.md un template :

```markdown
### Proof Footer Template

Each proof footer must include:

1. **Image / Icon** (100px × 100px, radius {rounded.md}).
   - Format: Icon (SVG, colored {colors.primary-deep}) or photo (JPG, .webp).
   - Alt text: `Icône : {context}` or `Photo : {description de la preuve}`.
   - Owner: Content owner (founder) provides and reviews.
2. **Stat** ({typography.display-sm}, color {colors.ink}):
   - Must be quantified: « 12 mois » not « Longtemps ».
   - Must include source/date: « Audit indépendant, cabinet XXX, juil. 2026 ».
3. **Context** ({typography.body-md} muted): What does this stat prove?
   - Example: « Modèle de LLM fine-tuned en production pour un grand groupe bancaire français. Coûts marginaux : €0.008/req vs €0.04 hyperscaler. »
```

**Sévérité:** MOYEN — non-conformité opérationnelle, risque de alt-texts manqués.

---

## Findings faibles

### 9. [FAIBLE] Focus ring offset 4px non testé cross-browser

**Section DESIGN.md (Elevation & Depth > Focus rings) + EXPERIENCE.md (Accessibility Floor, ligne 110)**

**Problème:** Focus ring défini comme « 2px ring {colors.focus} around buttons, links, inputs on :focus-visible. Offset 4px for breathing room. » Cela suppose que `outline-offset: 4px` fonctionne sur tous les navigateurs. Mais :

- Safari < 15.4 : `outline-offset` comportement non-standard sur les inputs range.
- Chromium : `outline-offset` peut rogner sur les éléments proches du bord de viewport (mobile).

**Correctif proposé:**
Ajouter un test e2e :

```javascript
test("Focus ring is visible on button", async () => {
  const button = page.locator("button:first-child");
  await button.focus();
  const outline = button.evaluate(
    (el) => window.getComputedStyle(el).outlineOffset,
  );
  expect(outline).toBe("4px");
  // Visual test: screenshot on Chrome, Safari, Firefox mobile.
});
```

**Sévérité:** FAIBLE — probable OK en pratique, mais non vérifié.

---

### 10. [FAIBLE] Discrete Door : risque d'être manqué visuellement si intra-prose

**Section EXPERIENCE.md (Component Patterns > Discrete Door) + (Key Flows > Flow 4, ligne 201)**

**Problème:** Discrete Door est « Inline link text » au sein de la prose (« Cooptation uniquement. Si vous êtes intéressée, contact spontanée ci-dessous. »). Il est signalé par underline + couleur vert profond.

En mode sombre avec contraste élevé, l'underline seul pourrait ne pas suffire si le texte se perd dans le fond très clair (light mode) ou très sombre (dark mode).

**Correctif proposé:**
Ajouter un style additionnel en hover/focus :

```css
a.discrete-door {
  color: {colors.primary-deep};
  text-decoration: underline;
  text-decoration-thickness: 2px;  /* thicker underline */
  text-underline-offset: 0.22em;
}
a.discrete-door:hover, a.discrete-door:focus-visible {
  background-color: color-mix(in srgb, {colors.primary-vivid} 15%, transparent);
  /* or slight background tint */
}
```

**Sévérité:** FAIBLE — lien reste fonctionnel, affordance juste sous-optimale.

---

## Récapitulatif par sévérité

| Sévérité | Count | Findings                                                         |
| -------- | ----- | ---------------------------------------------------------------- |
| CRITIQUE | 3     | Tokens sombres, fonds sans spec texte, process alt-text          |
| ÉLEVÉ    | 3     | Badges sur couleur seule, forms sémantique, thème dark contraste |
| MOYEN    | 2     | Hover tactile, Proof Footer formalisé                            |
| FAIBLE   | 2     | Focus ring test, Discrete Door visibilité                        |

**Total findings: 10**
**Critiques non-bloquants (avant prod) : 3**
**Élevés à adresser pré-MVP : 3**
**Post-MVP acceptable : 4**

---

## Recommandations prioritaires

1. **Immédiat (avant toute implémentation):**
   - Compléter DESIGN.md avec palette `colors-dark` + vérification de contrastes.
   - Ajouter alt-text workflow et templates à EXPERIENCE.md.
   - Formaliser structure formulaire (fieldset, legend, aria-invalid).

2. **Avant première itération de design visuel:**
   - Re-tester tous les contrastes en mode sombre avec les nouveaux tokens.
   - Modifier State Badge pour inclure bordure ou icône (non-couleur).
   - Tester hover/active states sur device tactile réel (iPad, Android).

3. **En review d'implémentation (pre-deploy):**
   - Audit visuel mode sombre sur Chrome, Safari, Firefox.
   - Vérifier alt-texts d'images (review dans PR).
   - Test clavier complet (Tab order, focus rings, Esc).

---

## Conformité finale

**État de base conformité WCAG 2.2 AA :**

- ✓ Contrastes texte/fond (light mode, spécifiés)
- ✓ Cibles tactiles 44px
- ✓ Clavier (Tab, Enter, Esc)
- ✓ Landmarks, h1, structure headings
- ✓ Labels explicites (déclaré)
- ✓ Motion prefers-reduced-motion (déclaré)
- ✓ Lang `fr` (déclaré)

**Lacunes critiques :**

- ✗ Mode sombre (tokens absents, contrastes non vérifiés)
- ✗ Alt-texts (processus non défini)
- ✗ Badges (couleur seule)
- ✗ Forms (sémantique vague)

**Verdict:** Conforme à l'intention, **non-conforme en exécution sans corrections ci-dessus**. Déployer en l'état = violations WCAG 1.1.1 (alt-text), 1.4.1 (color), 3.3.1 (form errors), 4.3.2 (label).

---

**Rédacteur :** Bmad Accessibility Gate  
**Date :** 2026-07-14  
**Prochaine revue :** Après implémentation des corrections critiques & test mode sombre.
