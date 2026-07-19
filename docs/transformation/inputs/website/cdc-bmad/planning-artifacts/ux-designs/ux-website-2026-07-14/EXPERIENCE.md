---
name: Libre IA Vitrine — Experience Spine
title: "EXPERIENCE — libre-ai.fr"
status: final
created: 2026-07-14
updated: 2026-07-14
sources:
  - ../../prds/prd-website-2026-07-14/prd.md
  - ../../briefs/brief-website-2026-07-14/brief.md
  - DESIGN.md
---

# Libre IA — Colonne vertébrale de l'expérience

> Notes directrices : Web statique, build Dioxus. DESIGN.md est la référence visuelle ; cette colonne décrit l'architecture d'expérience. Pas de CMS, pas de suivi, pas de comptes utilisateur.
> Maquettes de référence : [mockups/key-home.html](mockups/key-home.html) · [mockups/key-piece-corpus.html](mockups/key-piece-corpus.html) — cette spine gagne en cas de conflit. Les autres surfaces (offres, collectif, preuve, interventions) se construisent depuis les tables de cette spine seules (choix journalisé).

## Fondation

Web statique. Contenu publié en markup avec corrections traçables ; pas de backend dynamique pour les récits principaux. Dioxus SSG pour la génération HTML. Le site fonctionne sans JavaScript ; JS est une amélioration progressive (transitions fluides, polish des formulaires). Toute navigation est permanente et immuable : la structure d'URL survit 2+ ans minimum (NFR-12).

DESIGN.md est la référence. Les valeurs de jetons sont référencées ici comme {colors.primary-deep}, {spacing.section}, etc. Adapté au thème : les deux modes clair et sombre sont supportés (clair est la valeur par défaut publique ; sombre disponible via préférence système). [ASSUMPTION : les ressources et CSS sont déjà adaptatifs au thème depuis la revue tokens.css.]

## Architecture de l'information

Navigation principale. Cinq sections primaires + RDV omniprésent.

| Surface       | Accès depuis         | Objectif                                                               | Microcopy                        |
| ------------- | -------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| Accueil       | Logo, ouverture app  | Promesse, trois portes, CTA                                            | "De l'IA qui vous respecte"      |
| Offres        | Nav, porte du héros  | Offres T1 publiées (séminaire dirigeants, keynote, briefing décideurs) | "Trois chemins pour maîtriser"   |
| Corpus        | Nav, porte du héros  | Trois pièces au lancement + briefs trimestriels                        | "Références que l'on cite"       |
| Collectif     | Nav                  | Fondateur, vision, visages + porte discrète                            | "Qui on est, ce qu'on construit" |
| Interventions | Nav ou pièces corpus | Historique et interventions à venir, tracées                           | "Où nous parlons"                |
| Preuve        | Nav, pied de page    | Stack du site, coûts, limites, reproductibilité                        | "Chaîne maîtrisée"               |

Arbitrage des libellés de navigation [ASSUMPTION : labels FR par PRD FR-21 appliqués tels quels] : Offres · Corpus · Collectif · Interventions · Preuve. Réserver 30 minutes est une action permanente en en-tête ou pied de page, accessible sur chaque page (jamais enfouie). Le pied de page inclut toujours un formulaire de contact alternatif + adresse email.

→ Référence de composition : Les maquettes dans `.working/` (5 directions) montrent les options de mise en page ; cette colonne l'emporte en cas de conflit. Responsif : l'en-tête collant contracte la nav vers logo centré + menu icône au point d'arrêt `sm` (<768px).

## Voix et ton

Maîtrise et respect. Jamais d'alarmisme (« la souveraineté, c'est urgent ! »), jamais de hype (« révolutionnaire », emojis). La voix est directe et suppose une intelligence adulte.

| Contexte      | À faire                                               | À éviter                                        | Exemple                                                                       |
| ------------- | ----------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Offres        | Nommer le problème résolu + livrables + CTA           | Chasse au prix, surpromesse, mystère            | "Vous sortez du séminaire sachant ce qu'IA vous coûte vraiment"               |
| Corpus        | Sources + corrections visibles + date                 | Cacher l'incertitude, affirmations atemporelles | "Pièce maîtresse (rév. 14 juil. 2026, corrections visibles ci-dessous)"       |
| Collectif     | Fondateur incarné + vision + transparence recrutement | Faux collectif, engagement vague                | "Un fondateur, une dizaine ciblée fin d'été, chacun incarné"                  |
| Interventions | Où + quand + pièce corpus tracée                      | Discours sans date, auto-congratulation         | "Audition AI Act, Assemblée nationale, 15 août 2026, tracé à pièce maîtresse" |
| Preuve        | Chiffres documentés, stack visible, limites           | Jargon marketing, secret propriétaire           | "Coûts réels du site : 12 €/mois infra, ~8g CO2/mois, reproductible en 2h"    |

**Règles de microcopy :**

- Vouvoiement systématique (pas de tutoiement) [ASSUMPTION : registre formel par NFR-15]
- Voix active : « Vous maîtrisez » et non « Vous êtes habilité à »
- Aucune atténuation : « C'est en construction » et non « Nous travaillons à »
- Preuve d'abord : « Pièce maîtresse, 40 sources, audit indépendant » et non « Notre expertise »

CTA universel : **« Réserver 30 minutes »** (remplace « Nous contacter », « En savoir plus »). Microcopy ci-dessous : « Échange sans engagement, confidentiel. » Chaque page se termine par ce CTA + repli email.

## Motifs de composants

Spécifications comportementales. Détails visuels → DESIGN.md.

| Composant                          | Usage                                                              | Comportement                                                                                                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **card-offre** (Carte Offre)       | Page Offres, aperçu du héros                                       | Clic = scroll vers page complète ou navigation si déjà détail. Si statut « en construction » : CTA désactivé, texte → « Parlons-en en priorité ». Jamais d'affordance vide.                                                                                                                   |
| **card-corpus** (Carte Corpus)     | Index Corpus, listes de briefs                                     | Clic = ouvre pièce complète. Affiche toujours : titre, auteur, date, statut (publié/brouillon interne), nombre corrections + lien. Pas de paywall, pas « à venir ».                                                                                                                           |
| **pièce-de-corpus** (Page Corpus)  | Lecture d'une pièce (surface de référence)                         | Titres en {typography.corpus-title}, prose en {typography.corpus-prose} — le serif éditorial est la signature du corpus (décision ratifiée, cf. DESIGN.md Typography). Bloc « citer cette page » en fin (FR-4), bloc correction en tête si corrigée, date de dernière revue toujours visible. |
| **citation-block** (Bloc Citation) | Fin de pièce maîtresse, après affirmations clés                    | Format : [Fait]. [Source #1]. [Source #2]. Hyperlié. Inlining acceptable (exposant [1], [2]) si natif PDF ; toujours inclure liste visible en fin de page.                                                                                                                                    |
| **member-fiche** (Fiche Membre)    | Page Collectif                                                     | Photo ({spacing.6} × {spacing.6}), nom, parcours (2-3 lignes max), rôle. Pas de liens sociaux (hors scope v1). Fiche ajoutée en contenu, jamais code-générée.                                                                                                                                 |
| **discrete-door** (Porte Discrète) | Bas de page Collectif, dans la prose                               | Texte lien inline : « Si vous êtes un pair intéressé, contact spontanée via le formulaire ci-dessous. » Souligné, {colors.primary-deep}. Pas de modal, pas de popup — soumission formulaire régulière.                                                                                        |
| **footer-proof** (Pied Preuve)     | Fin des pages Offres, sections page Preuve                         | Image + stat à gauche, contexte à droite. Fond {colors.primary-vivid} 7%. Stat : ex. « 12 mois d'expérience sur ce modèle pour un grand groupe bancaire français. » Date visible. Traçable.                                                                                                   |
| **state-badge** (Badge État)       | Carte Offre, entrée liste Corpus                                   | Si statut offre « en construction » : badge {"offre-en-construction"}, libellé « EN CONSTRUCTION », couleur {colors.primary-deep}, police {typography.label-caps}, sans fond. Si pièce a corrections : badge {"corrigée"}, date dernière correction.                                          |
| **empty-state** (État Vide)        | Page Interventions si aucune entrée, détail Offre si aucun contenu | h1 {typography.display-sm} : « [Nom section] est vide. » Corps : explication une ligne (« Nous ajoutons aux interventions au fur et à mesure ») + CTA (réserver temps). Pas d'illustration sauf contexte très haut.                                                                           |

## Motifs d'état

États honnêtes face à l'utilisateur. Jamais de progrès factice.

| État                             | Surface                            | Traitement                                                                                                                                                                           | Exemple                                                                             |
| -------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| **Chargement page**              | N'importe où                       | Pas de squelette — pré-rendu HTML statique. S'il y a élément interactif (formulaire) : désactiver jusqu'à prêt, pas de faux typing.                                                  | Formulaire prise RDV : submit désactivé, libellé « Vérification de disponibilité… » |
| **Offre pas encore prête**       | Carte Offre, page détail           | Badge état : « EN CONSTRUCTION ». CTA désactivé ou changé en « Parlons-en en priorité ». Pas « à venir » sans date. Si date connue : afficher « Ouverture : 15 sept. 2026 ».         |                                                                                     |
| **Pièce corpus en révision**     | Liste Corpus                       | Pièces brouillon non publiques (ne pas lister). Une fois publié : toujours + date publication.                                                                                       |                                                                                     |
| **Pièce corpus corrigée**        | Page pièce complète                | Bloc correction en tête du contenu : « Correction du 14 juil. 2026 : [ce qui a changé]. Version précédente : [lien archive]. » Jamais cacher vieilles versions.                      |                                                                                     |
| **Interventions vide**           | Page Interventions, 1er chargement | h1 « Interventions en construction. » Corps : « Nous enrichissons cette page à chaque intervention nouvelle. Vous pouvez aussi nous proposer une invitation. » + CTA « Parlons-en. » |                                                                                     |
| **Erreur soumission formulaire** | Formulaire RDV, formulaire contact | Toast ou message inline (pas modal) : « Impossible d'enregistrer. Vérifiez votre email. Renvoi dans 30s… » Retry manuel disponible. Données soumises préservées.                     |                                                                                     |
| **Repli sans JS**                | Toute surface interactive          | Formulaire POST au serveur, AJAX non requis. Si JS indisponible, la page fonctionne : formulaire soumet, page recharge, confirmation visible.                                        |                                                                                     |

## Primitives d'interaction

**Clavier d'abord (secondaire) :** L'ordre Tab suit l'ordre de lecture. Focus visible sur chaque élément interactif. `Échap` ferme tout overlay (aucun en v1, mais réservé). Entrée soumet formulaires, Espace bascule états (si champs cochables — peu probable en v1).

**Souris :** Clic/tap pour naviguer, soumettre, focus. Le survol ne révèle pas d'affordances nouvelles (tous les éléments interactifs visibles au repos).

**Tactile :** Zones tactiles >= 44px ({control-touchTarget}). Pas d'état survolé uniquement sur mobile. Pas de gestes (balayage interdit, scroll linéaire uniquement).

**Scroll :** Scroll fluide activé (CSS : `scroll-behavior: smooth`). Transitions page utilisent view-transition API (fade CSS, 180ms {motion.ui}) si supporté.

**Bannis partout :** Drag-to-reorder, drag-to-upload (sauf file input qui est natif). Scroll infini (pagination uniquement, si corpus grandit). Piles modal > 1 (aucune). Overlays persistants sans échappement. Vidéo en lecture auto.

## Socle d'accessibilité

RGAA 4 / WCAG 2.2 AA.

- **Contraste couleur :** Tout texte >= 4.5:1 (AA) sur n'importe quel fond. Les liens héritent couleur corps + souligne. L'anneau focus est {colors.focus} sur {colors.background}, >= 3:1 contraste.
- **Navigation clavier :** Ordre Tab visible, aucun piège clavier. Tous les éléments interactifs (liens, boutons, champs formulaire) accessibles via Tab. Ordre de lecture logique (haut-bas, gauche-droite).
- **Lecteur d'écran :** Titre page unique, h1 sur chaque page (la promesse, titre offre, titre pièce). Repères : `<header>`, `<nav>`, `<main>`, `<footer>`. Les images ont alt texte (pas vide ; alt décrit le but de l'image, pas « image de... »). Labels formulaire explicites (`<label for="id">`), pas placeholder uniquement.
- **Focus visible :** Anneau 2px {colors.focus} autour boutons, liens, champs sur :focus-visible. Décalage 4px pour respiration.
- **Titres :** h1 une fois par page, structure h1 → h2 → h3 (jamais sauter niveaux). Hiérarchie titres section préservée.
- **Liens :** Soulignés par défaut (pas couleur uniquement). « Cliquez ici » évité ; texte lien décrit destination.
- **Motion :** Requête `prefers-reduced-motion` honorée : tous les transitions réduits à instantané (0ms) ou max 120ms. Pas d'animation en lecture auto.
- **Langue :** `<html lang="fr">` déclaré. Pas d'entrées formulaire non stylisées. Texte bouton visible à toutes tailles. Unités responsives (em, rem, %) pas px pour dimensionnement (sauf bordures, rayons).
- **Politique alt :** Toute image porteuse de sens a un alt significatif rédigé à la publication (pas « image de... »). Images décoratives : alt vide. Le gate éditorial FR-1 inclut la vérification des alt avant publication.
- **Formulaires :** Chaque champ de formulaire a un `<label>` lié (`for="id"`). Les erreurs sont des messages texte explicites liés au champ (`aria-describedby`). Jamais de signalement par couleur seule ; le texte explique toujours le problème.
- **Badges et états :** Perceptibles sans couleur. Libellé texte systématique (ex. « EN CONSTRUCTION », « CORRIGÉE ») ; la couleur renforce, ne porte pas l'information.

## Responsif et plateforme

| Point d'arrêt   | Comportement                                                                                                                                                                                  | Notes                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| ≥ 1024px (lg)   | Grilles 2-col communes, cartes offres côte à côte, section héros deux colonnes (copie + visuel)                                                                                               | Gutter {spacing.gutter} = 3rem max           |
| 768–1023px (md) | Grilles basculent colonne unique, héros empile copie sur visuel, nav visible mais compacte                                                                                                    | Gutter = valeur clamp                        |
| < 768px (sm)    | Colonne unique partout. Images largeur complète du contenu. Nav cachée, menu icône en en-tête (ou texte visible en haut). Héros empile, cartes offres empilent. Cibles tactiles restent 44px. | Pas d'assomptions paysage — portrait d'abord |

Pas d'app native (web uniquement). Mobile-first en responsivité (mais desktop-first en design). Pas de site mobile séparé. Pas de pièges métaбалise viewport (`viewport-fit=cover`, etc. diffés — utilise safe zones si supporté).

## Inspiration et anti-pratiques

**Inspirations :**

- **Linear :** la discipline de la navigation permanente + état honnête (« en construction » jamais caché).
- **Threads (Bluesky) :** langage visuel minimal, texte d'abord, pas de chrome inutile.
- **Good Government Design (UK) :** simplicité formulaire, clarté avant choix, transparence état.

**Rejetés :**

- **Interface chat/Q&A :** N'est pas un site support produit ; pas d'UI conversationnelle.
- **Sections héros zigzag :** Les layouts diagonaux sont stylés mais cassent au point d'arrêt sm. Préférer les grilles.
- **Carrousel :** Carrousel statique d'offres évité (listes meilleures pour accessibilité, nav clavier). Si plusieurs articles : paginé ou liste haute.
- **S'abonner/Infolettre :** (NFR) Flux RSS à la place ; pas de capture email pour infolettre.
- **Logos clients :** Pas de fausse preuve sociale ou section logos clients.
- **CTA « Essai gratuit 30 jours » :** L'offre est du conseil par contact, pas une inscription produit chronométrée.
- **Badges certification / « approuvé par » :** La preuve par l'exemple (notre stack, nos coûts) est plus forte.

## Flux clés

### Flux 1 — Dirigeante pressée (Claire, dirigeante ETI)

1. **Arrivée :** Claire accède à l'accueil via un partage LinkedIn ou résultat de recherche (« coûts opaques IA »).
2. **Lecture :** h1 : « De l'IA qui vous respecte : des coûts clairs, des équipes qui maîtrisent vraiment, la liberté de partir quand vous voulez. »
   - Elle scanne trois boîtes : « Dirigeants » (premier parcours), « Décideurs Publics » (deuxième), « Technique » (troisième).
   - Elle consulte les offres « Dirigeants » au second scroll → « Séminaire dirigeants ». Voit la « Pièce maîtresse » liée.
3. **Décision :** Elle a 90 secondes. La carte « Séminaire dirigeants » affiche : « Vous sortez sachant ce qu'IA coûte vraiment, ce que vos équipes doivent maîtriser, comment garder une porte de sortie. » Trois livrables listés. Pas de prix (« sur devis »).
4. **Action :** Elle clique « Réserver 30 minutes » en fin de carte ou dans l'en-tête collant.
5. **Apogée :** Formulaire apparaît. Pré-remplissage optionnel (nom, entreprise, email). Soumission un clic. Confirmation : « Créneau réservé, un mail de confirmation arrive sous 2h. »
   - **Échec :** Erreur formulaire → message inline, données préservées, retry disponible.
6. **Sortie :** Elle partage le lien de la pièce maîtresse avec son équipe.

Métrique succès : RDV réservé + email capturé (opt-in suivi, pas infolettre).

---

### Flux 2 — Conseiller en politique (Karim, Cabinet, Souveraineté IA)

1. **Arrivée :** Karim cherche « souveraineté numérique IA » + « rapport », trouve la pièce maîtresse via Google.
2. **Lecture :** La pièce charge. Titre : « Sortir des hyperscalers sans perdre la capacité : la résilience opérationnelle en pratique. » Date : « 14 juil. 2026. Dernière revue : 14 juil. 2026. 0 corrections. »
   - 40 sources liées inline + bibliographie en bas.
   - Section méthode explique : données d'audit X, entretiens Y membres équipe, comparaison Z études de cas.
3. **Vérification :** Il clique dans deux sources (audit dépendance hyperscaler, étude de cas). Voit documents publics, pas de paywalls.
4. **Confiance :** La barre nav affiche : page Collectif (vérifie indépendance, pas d'affiliation vendeur). Page Preuve (vérifie coûts site, stack, pas de tech vendor lock-in).
5. **Citation :** Il télécharge ou utilise le bloc « Citer cette page » : format APA/Chicago, date, nom auteur, URL.
   - Copie dans son mémo.
6. **Conversion (optionnelle) :** Il remarque l'offre « Briefing décideurs », réserve un appel 30 min pour poser une question.
7. **Sortie :** Il partage la pièce dans le doc de prep audit Assemblée nationale.

Métrique succès : Citation externe + RDV optionnel.

**Chemin d'échec :** Si la pièce ne couvre pas son angle stratégique spécifique, il repart avec RSS/brief trimestriel et ne cite pas. L'absence de preuve pertinente = pas de conversion.

---

### Flux 3 — DSI Septique (Lena, DSI Grand Groupe)

1. **Arrivée :** Son C-suite revient d'un atelier disant « Libre IA peut nous aider. » Elle arrive à l'accueil septique.
2. **Scan :** Elle voit le parcours trois boîtes et choisit « Technique » (troisième parcours à l'accueil).
3. **Immersion :** Descend vers « Chaîne maîtrisée » (page Preuve). Voit :
   - Stack : Dioxus, déployé sur Clever Cloud avec config chiffrée (lien repo public).
   - Coûts : 12 €/mois infra, ~8g CO2/mois mesurés.
   - Limites : « Ce site est 100 % statique, pas d'analytics, pas de chat ; aucun feedback utilisateur en temps réel. »
   - Reproductibilité : « Stack reproductible en 2h ; voir repo public. »
4. **Validation :** Elle clique dans le repo, voit le README, voit le code réel. Pas du marketing.
5. **Point confiance :** Elle consulte la page Collectif. Voit : un fondateur (nom, photo, LinkedIn, parcours). État honnête : « Collectif en formation, une dizaine ciblée fin d'été. » Pas de faux collectif.
6. **Décision :** Elle remonte à son boss : « Pas de survente, stack visible, honnête sur les limites. »
7. **Conversion :** Elle réserve un appel 30 min sur « Audit de souveraineté » (offre T2, statut : « en construction, parlons-en en priorité »).

Métrique succès : Confiance renforcée + RDV pour offre T2.

**Chemin d'échec :** Si elle trouve une incohérence entre les chiffres publiés (coûts, CO2) et la réalité, la perte de confiance est irrécupérable. Garde-fou : footer de preuve daté et traçable, assurant la reproductibilité des assertions.

---

### Flux 4 — Pair recruté (Anna, Praticienne IA)

1. **Arrivée :** Un collègue du collectif lui envoie le lien avec note : « Nous recrutons. Regarde ce qu'on construit. »
2. **Scan :** Accueil lu en 2 min, consulte la page « Collectif ».
3. **Lecture Collectif :** Fondateur incarné. Vision cible : « Résilience opérationnelle sans dépendance, chaîne maîtrisée, preuves publiques. » Valeurs listées (discipline, preuve, respect). Note recrutement : « Cooptation uniquement. Si vous êtes intéressée, contact spontanée ci-dessous. »
4. **Reconnaissance :** Elle voit deux membres existants (photos, noms, parcours). Elle en connaît un.
5. **Action :** Elle remplit le formulaire « Prise de contact » en bas (nom, email, message : « Je suis intéressée, comment on procède ? »).
6. **Soumission :** POST formulaire, confirmation : « Message envoyé. Réponse dans 48h. »
7. **Sortie :** Elle partage la vision + la pièce maîtresse avec son équipe actuelle, commence à réfléchir à une transition.

Métrique succès : Contact qualifié spontané + recrutement futur.

---

## Résumé thématique et d'état

Les quatre flux convergent sur le même site, même navigation, même CTA (« Réserver 30 minutes » ou formulaire contact), points d'entrée différents. Le site ne change pas d'état par utilisateur — il est honnête sur ce qui existe (offres publiées vs « en construction », pièces corpus datées et corrigées, collectif fondateur + taille cible). Chaque visiteur trouve sa porte et entre.

**Anti-pratique à éviter :** Afficher des « pages d'atterrissage » différentes par segment (landing-pages/dirigeants, /public, /tech). À la place : un accueil avec trois boîtes de parcours explicites. Le site gagne quand les visiteurs trouvent leur propre chemin.

## Référence croisée — jetons DESIGN.md

Les composants et l'espacement ci-dessus référencent les jetons DESIGN.md. Ex. :

- {colors.primary-deep} — Lien Porte Discrète, texte Badge, Anneau focus
- {colors.primary-vivid} — Teinte arrière-plan Pied Preuve
- {spacing.section} — Écart entre sections majeures
- {typography.display-sm} — Titre Carte Offre, Nom Membre
- {control-touchTarget} — Min-height pour entrées formulaire, boutons

Résoudre les valeurs jetons dans le frontmatter DESIGN.md lors de l'implémentation.

## Notes d'implémentation

**Support thème :** Les modes clair (défaut) et sombre (préférence système) sont déjà supportés dans tokens.css. Aucune logique additionnelle requise ; les vars CSS gèrent automatiquement le contraste.

**Formulaires :** Pas de JS requis pour soumission formulaire (POST backend). Si JS disponible : désactiver submit en vol, afficher succès/erreur inline, préserver l'état formulaire. Pas de CAPTCHA (utiliser honeypot + rate-limiting côté serveur par NFR-4).

**Versionnage contenu :** Pièces corpus stockées en Markdown ou similaire, traçables en git. Corrections suivies comme amendements avec date + note change. Pas de CMS requis.

**Navigation :** En-tête collant sur lg+ ; se contracte en menu icône sur sm. Pied de page toujours visible avec email contact + formulaire. CTA RDV toujours accessible (en-tête ou pied, jamais enfoui).

---

**Note de priorisation** : Cette colonne l'emporte en cas de conflit. Toute maquette ou implémentation qui contredit une règle comportement ou voix ci-dessus doit re-justifier son choix. Ces colonnes (DESIGN.md + EXPERIENCE.md) sont la spécification — elles surpassent wireframes, prototypes ou intuition.
