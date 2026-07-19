---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-website-2026-07-14/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-website-2026-07-14/EXPERIENCE.md
---

# libre-ai.fr — Découpage en epics et stories

## Overview

Ce document décompose les exigences du PRD (final, Gate 2), du contrat UX (DESIGN.md + EXPERIENCE.md, final, Gate 3) et de la spine d'architecture (final, Gate 4) en stories implémentables.

## Requirements Inventory

### Functional Requirements

- FR-1 : Gabarit de pièce de corpus — nature, auteur, assistance IA, sources, méthode des chiffres, dates, corrections ; validation bloquante à la construction.
- FR-2 : Trois pièces au lancement (pièce maîtresse, énergie du clic, brief trimestriel n° 1) — chemin critique, pas de lancement sans.
- FR-3 : Série brief trimestriel datée, archivée, citable numéro par numéro.
- FR-4 : Citabilité — permalien stable, métadonnées OG/schema.org, bloc « citer cette page ».
- FR-5 : Flux Atom du corpus (pièces + briefs).
- FR-6 : Pages offres T1 (séminaire dirigeants, keynote, briefing décideurs) — sur devis, pièce de preuve liée, CTA RDV.
- FR-7 : Pages offres T2 annoncées (audit souveraineté, éclairage public) avec statut honnête.
- FR-8 : Catalogue T3 une page sobre.
- FR-9 : CTA universel — chaque page se termine par « Réserver 30 minutes ».
- FR-10 : Prise de RDV en ligne sans compte, 30 minutes (booking maison, service conversion).
- FR-11 : Formulaire de contact minimal (nom, org, email, message) + email publié, anti-abus sans CAPTCHA tiers.
- FR-12 : Page collectif — fondateur incarné, vision cible, état honnête.
- FR-13 : Fiches membres ajoutables par contenu versionné, sans code.
- FR-14 : Porte discrète — cooptation, contact spontané accepté, pas de formulaire de candidature.
- FR-15 : Page « chaîne maîtrisée » — stack, coûts, énergie, limites, reproductibilité, à jour.
- FR-16 : Référence bancaire anonymisée (page preuve + collectif), jamais de nom sans autorisation écrite.
- FR-17 : Section « ce que nous construisons » — produits en preuves, états honnêtes, liens dépôts.
- FR-18 : Page interventions — gabarit titre/date/contexte/pièce liée, sans reprise d'historique.
- FR-19 : Attribution entrante — URLs dédiées par intervention, jamais de tracking.
- FR-20 : Home à message unique — 1 h1 = promesse, ≤ 5 blocs, 1 CTA primaire, 3 portes, test des 90 secondes.
- FR-21 : Navigation orientée acheteur — Offres · Corpus · Collectif · Interventions · Preuve + RDV permanent.
- FR-22 : Pages utilitaires — mentions légales, 404 utile, sitemap, robots, flux découvrable.

### NonFunctional Requirements

- NFR-1 : Souveraineté — aucune dépendance de service soumise à des lois extraterritoriales (hébergement, RDV, mail, polices, médias).
- NFR-2 : Zéro tracking, zéro cookie non essentiel, zéro requête tierce non maîtrisée.
- NFR-3 : Minimisation RGPD des données de contact, traitement documenté.
- NFR-4 : Anti-abus passif (honeypot, rate-limit, validation serveur) sans CAPTCHA tiers ni fingerprinting.
- NFR-5 : Aucun nom client/employeur sans autorisation écrite ; revue de confidentialité par pièce.
- NFR-6 : Budget sobriété ≤ 500 Ko/page hors médias signalés, zéro requête tierce ; mesuré, publié.
- NFR-7 : Statique, utilisable sans JavaScript ; JS = amélioration progressive.
- NFR-8 : Consommation mesurée et publiée sur la page chaîne maîtrisée.
- NFR-9 : RGAA 4 / WCAG 2.2 AA.
- NFR-10 : Responsive en unités relatives.
- NFR-11 : Validation de gabarit bloquante à la publication, jamais de valeur par défaut.
- NFR-12 : Permaliens immuables, redirections 301 (dont domaines défensifs → libre-ai.fr).
- NFR-13 : Structure prête pour l'ajout d'une langue sans refonte.
- NFR-14 : Cohérence de marque totale (purge « libre-ia ») ; identité visuelle re-challengeable actée par le contrat UX.
- NFR-15 : Registre de la voix — respect/maîtrise, jamais peur ni hype, humilité sans excuse ; porté par le gate humain.

### Additional Requirements

- AR-1 (AD-1/AD-3) : brownfield — pas de starter template ; build `site-build` existant à faire évoluer ; contenu migré vers `content/` en markdown strict + front matter → domaine typé (`domain.rs`/`editorial.rs`).
- AR-2 (AD-3) : bloc citation, OG/JSON-LD et flux Atom générés depuis le domaine typé, jamais à la main ; projection `assistance_ia` en `<category>` Atom, perte signalée au build.
- AR-3 (AD-4) : service conversion axum — `POST /api/contact` et `POST /api/rdv`, honeypot, rate-limit, horodatages serveur uniquement, enveloppe `{ data, meta }`, zéro PII en logs.
- AR-4 (AD-5) : booking maison — état des créneaux exclusivement dans le service, flux rendu par le service (fonctionnel sans JS), confirmation instantanée, ICS joint, annulation par lien signé.
- AR-5 (AD-6) : stockage propre au service (addon dédié), rétention courte, aucun partage de données.
- AR-6 (AD-7) : deux déployables Clever Cloud (statique + service) ; secrets en variables d'env ; backup quotidien testé ; supervision minimale ; SMTP différé derrière interface d'envoi abstraite (Scaleway TEM seul candidat vérifié).
- AR-7 (AD-8) : six gates CI bloquants — éditorial (gabarit + OG/JSON-LD), sobriété (`.weights.json` injecté au build dans la page preuve et le footer-proof), a11y + e2e clavier, zéro-tiers, confidentialité (noms + chemins machine-local), approbation humaine pré-production ; gouvernance des seuils par PR arbitrée.
- AR-8 (Deferred AD) : purge des assets « libre-ia » (epic d'implémentation) ; 301 des domaines défensifs ; bascule EN hors périmètre.

### UX Design Requirements

- UX-DR1 : Tokens DESIGN.md implémentés en variables CSS (clair + sombre via `prefers-color-scheme` + `data-theme`) — un vert profond `#1a4d2e`, vivid `#22C55E` réservé aux fonds 3-7 %, jeu `colors.dark.*` complet.
- UX-DR2 : Typographie hybride auto-hébergée — Plus Jakarta Sans (display), Inter (body), Source Serif 4 (corpus-title/corpus-prose, signature du corpus).
- UX-DR3 : Neuf composants spécifiés à implémenter — card-offre, card-corpus, page pièce de corpus, citation-block, member-fiche, discrete-door, footer-proof, state-badge, empty-state — comportements EXPERIENCE.md, visuels DESIGN.md.
- UX-DR4 : Home conforme à `mockups/key-home.html` — 1 h1 promesse, ≤ 5 blocs, 3 portes d'entrée, CTA unique, footer de preuve chiffré, état hover/focus des portes.
- UX-DR5 : Page pièce de corpus conforme à `mockups/key-piece-corpus.html` — serif, en-tête nature/auteur/date de revue, bloc correction daté en tête, sources, « citer cette page », CTA RDV.
- UX-DR6 : Accessibilité — alt-text obligatoire au gate éditorial, formulaires à labels liés et erreurs texte (aria-describedby), badges/états jamais portés par la couleur seule, focus visibles, cibles ≥ 44 px.
- UX-DR7 : États honnêtes — « en construction » (CTA remplacé par « Parlons-en en priorité »), « corrigée » (bloc daté + lien version archivée), page interventions vide assumée ; microcopy vouvoiement, CTA « Réserver 30 minutes » + « Échange sans engagement, confidentiel ».
- UX-DR8 : Responsive 3 breakpoints, unités relatives, header sticky réduit sur mobile.
- UX-DR9 : Interdits d'interaction — pas de scroll infini, pas de modales empilées, pas d'overlay sans échappatoire, pas de vidéo en autoplay.

### FR Coverage Map

- FR-1 : Epic 2 — gabarit de pièce validé au build
- FR-2 : Epic 2 — trois pièces de lancement (chemin critique, rédaction stakeholder)
- FR-3 : Epic 2 — série brief trimestriel
- FR-4 : Epic 2 — citabilité (permalien, OG/JSON-LD, bloc citation)
- FR-5 : Epic 2 — flux Atom
- FR-6 : Epic 3 — pages offres T1
- FR-7 : Epic 3 — pages offres T2 annoncées
- FR-8 : Epic 3 — catalogue T3
- FR-9 : Epic 3 — CTA universel
- FR-10 : Epic 3 — prise de RDV (booking maison)
- FR-11 : Epic 3 — formulaire de contact anti-abus
- FR-12 : Epic 4 — page collectif
- FR-13 : Epic 4 — fiches membres par contenu
- FR-14 : Epic 4 — porte discrète
- FR-15 : Epic 4 — page chaîne maîtrisée
- FR-16 : Epic 4 — référence anonymisée
- FR-17 : Epic 4 — ce que nous construisons
- FR-18 : Epic 4 — page interventions
- FR-19 : Epic 4 — attribution sans tracking
- FR-20 : Epic 1 — home à message unique
- FR-21 : Epic 1 — navigation orientée acheteur
- FR-22 : Epic 1 — pages utilitaires
- AR/NFR transverses : Epic 5 (gates CI, ops, DNS/301) + critères d'acceptation par story

## Epic List

### Epic 1 : Le site dans sa nouvelle identité

Un visiteur voit la home à message unique (promesse en h1, trois portes, footer de preuve), navigue dans les cinq sections, sur un site cohérent libre-ai.fr — tokens clair/sombre, typographie hybride, les neuf composants du contrat UX, purge « libre-ia ».
**FRs couvertes :** FR-20, FR-21, FR-22 · UX-DR1-4, 8, 9 · NFR-14 · AR-1.

### Epic 2 : Le corpus citable

Un lecteur ou relais d'opinion lit une pièce en serif, vérifie nature/sources/corrections, la cite, s'abonne au flux Atom. Les trois pièces de lancement passent le gabarit ; leur rédaction (stakeholder) court en parallèle du développement.
**FRs couvertes :** FR-1 à FR-5 · UX-DR5 · AR-2.

### Epic 3 : Vendre et convertir

Un dirigeant comprend les offres et réserve trente minutes sans compte — service conversion, booking maison (ICS, annulation par lien signé), formulaire anti-abus.
**FRs couvertes :** FR-6 à FR-11 · AR-3, AR-4, AR-5.

### Epic 4 : Le collectif et la preuve

Un pair coopté comprend ce qu'il rejoint ; un DSI vérifie la chaîne maîtrisée et les chiffres réels ; les interventions s'attribuent sans tracking.
**FRs couvertes :** FR-12 à FR-19.

### Epic 5 : Mise en ligne prouvée

Le site est en ligne sur libre-ai.fr (défensifs en 301), chaque chiffre publié sort d'une mesure, aucune régression ne passe : six gates CI, enveloppe opérationnelle, approbation humaine.
**FRs couvertes :** AR-6, AR-7, AR-8 · NFR-12 · vérification finale de toutes les NFR.

## Epic 1 : Le site dans sa nouvelle identité

Un visiteur voit la home à message unique, navigue dans les cinq sections, sur un site entièrement cohérent libre-ai.fr.

### Story 1.1 : Fondations visuelles — tokens et typographies

En tant que visiteur,
je veux un site rendu dans l'identité validée (couleurs, typographies, thème clair/sombre),
afin de percevoir une marque cohérente et maîtrisée quel que soit mon environnement.

**Acceptance Criteria:**

**Given** les tokens de DESIGN.md (clair + `colors.dark.*`)
**When** le site est construit
**Then** toutes les couleurs/espacements/rayons viennent des variables CSS générées depuis les tokens — aucune valeur en dur dans les composants
**And** Plus Jakarta Sans, Inter et Source Serif 4 sont auto-hébergées (zéro requête tierce, NFR-1/2)
**And** le thème sombre s'active via `prefers-color-scheme` et se force via `data-theme`, contrastes AA tenus dans les deux thèmes (UX-DR1)
**And** le vert vif `#22C55E` n'apparaît jamais en texte — uniquement en fonds 3-7 %.

### Story 1.2 : Les neuf composants du contrat UX

En tant que visiteur,
je veux des éléments d'interface cohérents et honnêtes sur tout le site,
afin de comprendre chaque état sans ambiguïté.

**Acceptance Criteria:**

**Given** les specs DESIGN.md (visuel) et EXPERIENCE.md (comportement)
**When** les composants card-offre, card-corpus, page-piece, citation-block, member-fiche, discrete-door, footer-proof, state-badge, empty-state sont implémentés en Dioxus
**Then** chacun respecte ses tokens et son comportement spécifié (UX-DR3)
**And** state-badge porte toujours un libellé texte (jamais la couleur seule, UX-DR6)
**And** empty-state affiche cause honnête + CTA unique (UX-DR7)
**And** chaque composant passe la revue visuelle contre les maquettes de référence.

### Story 1.3 : Navigation et gabarit de page

En tant que visiteur,
je veux une navigation claire orientée acheteur et un rendez-vous toujours accessible,
afin de savoir en un regard ce qui est proposé et où contacter.

**Acceptance Criteria:**

**Given** l'IA d'EXPERIENCE.md (FR-21)
**When** j'ouvre n'importe quelle page
**Then** la navigation expose Offres · Corpus · Collectif · Interventions · Preuve et « Réserver 30 minutes » en permanence
**And** le footer porte l'alternative formulaire + email
**And** le header devient sticky réduit sous 768 px (UX-DR8)
**And** la navigation est intégralement praticable au clavier avec focus visibles (NFR-9).

### Story 1.4 : Home à message unique

En tant que dirigeant pressé,
je veux comprendre la promesse et savoir où cliquer en 90 secondes,
afin de décider sans effort si ce site me concerne.

**Acceptance Criteria:**

**Given** la maquette `mockups/key-home.html` et FR-20
**When** la home est rendue
**Then** un seul h1 : la promesse ; ≤ 5 blocs ; un seul CTA primaire (RDV) ; trois portes d'entrée (dirigeant / décideur public / technique)
**And** le footer de preuve affiche des chiffres issus de la mesure (jamais saisis à la main)
**And** un lecteur externe restitue la promesse et le point de contact après 90 secondes de lecture (test d'acceptation FR-20)
**And** la page fonctionne intégralement sans JavaScript (NFR-7).

### Story 1.5 : Pages utilitaires

En tant que visiteur,
je veux des mentions légales, une 404 utile et des flux découvrables,
afin de ne jamais tomber dans une impasse.

**Acceptance Criteria:**

**Given** FR-22
**When** je visite une URL inexistante
**Then** la 404 propose la home et le RDV
**And** mentions légales (avec traitement des données documenté, NFR-3), sitemap.xml, robots.txt et lien du flux Atom existent et sont valides.

### Story 1.6 : Cohérence de marque — purge « libre-ia »

En tant que visiteur,
je veux une marque unique libre-ai.fr partout,
afin de ne jamais douter de qui publie.

**Acceptance Criteria:**

**Given** NFR-14 et les assets actuels nommés `libre-ia-*`
**When** le site est construit
**Then** aucune occurrence visible « libre-ia » ne subsiste (logo, wordmark, manifestes, métadonnées)
**And** les fichiers d'assets sont renommés en cohérence
**And** le scan de cohérence de marque passe à zéro occurrence.

### Story 1.7 : Retrait du site produit legacy

En tant que visiteur,
je veux ne plus voir l'ancien portail produit,
afin de ne recevoir que le nouveau message.

**Acceptance Criteria:**

**Given** les routes actuelles (produits, méthode, ressources, rechercher, corrections, contribuer) et AR-1
**When** le nouveau socle est en place
**Then** les routes legacy sont retirées et redirigées en 301 vers les sections pertinentes (NFR-12)
**And** le catalogue produit v3 et la recherche Pagefind sont retirés du build
**And** l'arborescence `content/` accueille les contenus éditoriaux versionnés.

## Epic 2 : Le corpus citable

Un lecteur ou relais d'opinion lit, vérifie et cite les pièces ; les trois pièces de lancement passent le gabarit.

### Story 2.1 : Gabarit typé et pipeline markdown

En tant qu'auteur du collectif,
je veux que toute pièce invalide fasse échouer la construction,
afin que rien ne se publie sans satisfaire l'exigence de vérité.

**Acceptance Criteria:**

**Given** le gabarit FR-1 et AD-2/AD-3
**When** une pièce markdown avec front-matter complet (nature, auteur, `author_member_key`, assistance IA, sources, dates, corrections) est ajoutée à `content/corpus/`
**Then** le build la parse (pulldown-cmark) vers le domaine typé et la rend
**And** une pièce sans `nature` ou avec date invalide fait échouer le build avec une erreur actionnable
**And** aucune valeur par défaut n'est jamais injectée (NFR-11)
**And** les horodatages sont en ISO 8601.

### Story 2.2 : Page pièce de corpus

En tant que directeur de cabinet,
je veux lire une pièce de référence avec sa nature, ses sources et ses corrections visibles,
afin de pouvoir m'y fier et la faire circuler.

**Acceptance Criteria:**

**Given** la maquette `mockups/key-piece-corpus.html` et UX-DR5
**When** j'ouvre une pièce publiée
**Then** titres en `{typography.corpus-title}` et prose en `{typography.corpus-prose}` (serif, signature du corpus)
**And** l'en-tête affiche nature déclarée, auteur, date de publication et de dernière revue
**And** si la pièce est corrigée : bloc daté en tête + lien vers la version archivée (le permalien ne change jamais, NFR-12)
**And** les sources sont liées aux affirmations et listées en fin.

### Story 2.3 : Citabilité — bloc citation et métadonnées

En tant que relais d'opinion,
je veux citer une pièce proprement en un geste,
afin de la référencer dans mes propres publications.

**Acceptance Criteria:**

**Given** FR-4 et AR-2
**When** une pièce est rendue
**Then** le bloc « citer cette page » (auteur, titre, date, URL) est présent en fin de pièce
**And** les métadonnées Open Graph et JSON-LD schema.org sont générées depuis le domaine typé — jamais saisies à la main
**And** le gate éditorial vérifie leur présence et validité sur chaque pièce.

### Story 2.4 : Index du corpus et série trimestrielle

En tant que lecteur,
je veux parcourir le corpus et suivre la série des briefs,
afin de trouver la pièce qui répond à ma question.

**Acceptance Criteria:**

**Given** FR-3 et le composant card-corpus
**When** j'ouvre la section Corpus
**Then** chaque pièce apparaît avec titre, auteur, date, état et nombre de corrections
**And** les briefs trimestriels forment une série datée (T3 2026, T4 2026…), chaque numéro archivé et citable individuellement
**And** aucune pièce en brouillon n'est listée.

### Story 2.5 : Flux Atom

En tant que relais d'opinion,
je veux m'abonner au corpus,
afin d'être notifié des nouvelles pièces sans visiter le site.

**Acceptance Criteria:**

**Given** FR-5 et AR-2
**When** le site est construit
**Then** un flux Atom valide agrège pièces et briefs avec permaliens stables
**And** `assistance_ia` se projette en `<category domain="libre-ai.fr/assistance">` répétées
**And** toute projection avec perte émet un avertissement au build
**And** le flux est découvrable depuis chaque page (`<link rel="alternate">`).

### Story 2.6 : Pièce maîtresse — rédaction et publication

En tant que fondateur,
je veux publier « Sortir des hyperscalers sans perdre la capacité »,
afin de donner au site son document de référence citable.

**Acceptance Criteria:**

**Given** le gabarit FR-1 opérationnel (story 2.1)
**When** la pièce est soumise en PR
**Then** elle passe le gabarit (nature, sources primaires vérifiées, méthode des chiffres explicite)
**And** aucun chiffre de la note de recherche non vérifiée n'y figure sans source primaire confirmée
**And** la revue humaine (registre NFR-15 : respect, jamais peur ni hype) est approuvée avant merge.

### Story 2.7 : Pièce signature — « L'énergie du clic »

En tant que fondateur,
je veux publier la pièce sur les coûts et la consommation réels de l'IA,
afin d'incarner la transparence que personne d'autre ne montre.

**Acceptance Criteria:**

**Given** le gabarit FR-1 opérationnel
**When** la pièce est soumise en PR
**Then** mêmes critères que 2.6, avec méthode de mesure documentée et reproductible pour chaque chiffre publié.

### Story 2.8 : Brief trimestriel n° 1

En tant que décideur,
je veux un état trimestriel daté de ce qui compte,
afin de décider sans dépendre du discours des vendeurs.

**Acceptance Criteria:**

**Given** le gabarit FR-1 et la série (story 2.4)
**When** le brief T3 2026 est soumis en PR
**Then** il passe le gabarit, s'inscrit dans la série, et se termine par le CTA RDV universel (le lien profond vers la page offre briefing s'active à la livraison de l'Epic 3 — aucune dépendance bloquante)
**And** les trois pièces publiées (2.6, 2.7, 2.8) rendent le lancement possible (FR-2 — chemin critique levé).

## Epic 3 : Vendre et convertir

Un dirigeant comprend les offres et réserve trente minutes sans compte.

### Story 3.1 : Pages offres T1

En tant que dirigeante,
je veux comprendre ce que chaque prestation traite, comment elle se déroule et avec quoi je repars,
afin de décider de réserver un échange.

**Acceptance Criteria:**

**Given** FR-6 et le composant card-offre
**When** j'ouvre séminaire dirigeants, keynote ou briefing décideurs
**Then** chaque page expose : problème traité, déroulé, livrables, pièce de corpus qui la prouve, CTA « Réserver 30 minutes »
**And** aucun prix n'apparaît — sur devis uniquement
**And** le registre est vérifié en revue (respect, jamais peur ni hype, NFR-15).

### Story 3.2 : Offres T2 annoncées et catalogue T3

En tant que visiteur,
je veux voir honnêtement ce qui est en construction et ce qui existe en périphérie,
afin de ne jamais découvrir une survente.

**Acceptance Criteria:**

**Given** FR-7, FR-8 et l'état « en construction » (UX-DR7)
**When** j'ouvre l'audit de souveraineté ou l'éclairage des décideurs publics
**Then** le statut honnête est affiché et le CTA devient « Parlons-en en priorité »
**And** le catalogue T3 tient sur une page sobre sans pages dédiées.

### Story 3.3 : Service conversion — socle et formulaire de contact

En tant que visiteur,
je veux envoyer un message simple sans être traqué,
afin d'entrer en contact selon mes termes.

**Acceptance Criteria:**

**Given** AR-3, AD-6 et NFR-2/3/4
**When** je soumets le formulaire (nom, organisation, email, message)
**Then** le service axum valide côté serveur, applique honeypot + rate-limit, et répond en enveloppe `{ data, meta }`
**And** le flux fonctionne sans JavaScript (POST classique, page de confirmation rendue par le service)
**And** aucune PII n'apparaît dans les logs ; le stockage est l'addon dédié du service, rétention courte
**And** les horodatages sont créés côté serveur uniquement.

### Story 3.4 : Prise de rendez-vous sans compte

En tant que dirigeant,
je veux réserver trente minutes en trois gestes,
afin d'obtenir l'échange sans friction ni création de compte.

**Acceptance Criteria:**

**Given** FR-10 et AR-4
**When** je choisis un créneau et confirme avec mon email
**Then** la confirmation est instantanée, un fichier ICS est joint à l'email de confirmation
**And** l'état des créneaux vit exclusivement dans le service — aucune disponibilité affichée par une page statique
**And** un créneau réservé disparaît immédiatement des disponibilités (réservation atomique)
**And** le flux complet fonctionne sans JavaScript.

### Story 3.5 : Annulation par lien signé et envoi d'email

En tant que personne ayant réservé,
je veux annuler ou vérifier mon rendez-vous sans compte,
afin de rester libre de mes engagements.

**Acceptance Criteria:**

**Given** AR-4 et l'interface d'envoi abstraite (AR-6, SMTP différé)
**When** je clique le lien signé de mon email de confirmation
**Then** je peux annuler ; le créneau redevient disponible ; un email de confirmation d'annulation part
**And** le lien signé expire et ne divulgue aucune donnée dans l'URL
**And** l'implémentation SMTP est substituable sans toucher au domaine (interface abstraite).

### Story 3.6 : Conversion universelle branchée

En tant que visiteur,
je veux retrouver la même sortie sur chaque page,
afin de ne jamais chercher comment entrer en contact.

**Acceptance Criteria:**

**Given** FR-9
**When** j'atteins la fin de n'importe quelle page de contenu
**Then** le CTA « Réserver 30 minutes » + la microcopy « Échange sans engagement, confidentiel » sont présents
**And** le parcours statique → service conversion est fluide dans les deux thèmes et sans JS.

## Epic 4 : Le collectif et la preuve

Un pair comprend ce qu'il rejoint ; un DSI vérifie la chaîne ; les interventions s'attribuent.

### Story 4.1 : Page collectif — fondateur incarné et vision cible

En tant que paire cooptée,
je veux voir qui porte le projet et ce que rejoindre implique,
afin de décider d'utiliser la porte discrète.

**Acceptance Criteria:**

**Given** FR-12 et l'état réel (un fondateur, cible ~10 fin d'été)
**When** j'ouvre la page collectif
**Then** le fondateur est incarné (nom, photo, parcours) et la vision cible est présentée sans fiction collective
**And** l'état honnête « collectif en formation » est assumé sans excuse (NFR-15)
**And** la référence bancaire anonymisée y figure (FR-16) sans nom de client/employeur.

### Story 4.2 : Fiches membres et porte discrète

En tant que membre nouvellement coopté,
je veux apparaître sur le site par un simple ajout de contenu,
afin que le site grandisse avec le collectif sans jamais le précéder.

**Acceptance Criteria:**

**Given** FR-13, FR-14 et le composant member-fiche
**When** une fiche (nom, visage, parcours, rôle) est ajoutée dans `content/`
**Then** elle apparaît sans modification de code
**And** la porte discrète est un lien en prose vers le formulaire — pas de formulaire de candidature dédié
**And** le site n'affiche jamais plus de membres qu'il n'en existe.

### Story 4.3 : Page « chaîne maîtrisée »

En tant que DSI sceptique,
je veux voir la stack, les coûts et les limites réels de ce site,
afin de vérifier que la promesse est tenue par l'exemple.

**Acceptance Criteria:**

**Given** FR-15, FR-16 et AD-8
**When** j'ouvre la page preuve
**Then** stack, coûts, consommation et limites sont affichés — chiffres injectés depuis `.weights.json` produit par la mesure, jamais saisis à la main
**And** la date de dernière revue est visible ; la méthode de mesure est liée
**And** la reproductibilité est documentée (comment reconstruire cette chaîne).

### Story 4.4 : « Ce que nous construisons »

En tant que visiteur technique,
je veux voir les produits comme preuves avec leur état honnête,
afin de mesurer la profondeur réelle sans survente.

**Acceptance Criteria:**

**Given** FR-17 et UX-DR7
**When** j'ouvre la section
**Then** chaque produit affiche une ligne d'intention, un état honnête (en conception / en construction) et un lien vers son dépôt public
**And** aucune promesse de disponibilité, aucune page produit dédiée.

### Story 4.5 : Interventions et attribution

En tant que fondateur,
je veux rattacher chaque intervention à une pièce et tracer son origine sans traquer personne,
afin de convertir ma visibilité existante en preuve et en rendez-vous.

**Acceptance Criteria:**

**Given** FR-18, FR-19 et la décision « pas de reprise d'historique »
**When** une intervention est ajoutée en contenu (titre, date, contexte, pièce liée)
**Then** elle apparaît sur la page interventions ; la page démarre vide avec un empty-state assumé
**And** chaque intervention dispose d'une URL dédiée mémorisable renvoyant vers sa pièce
**And** l'attribution se lit dans les événements réels (RDV mentionnant la provenance) — aucun tracking (NFR-2).

## Epic 5 : Mise en ligne prouvée

Le site est en ligne, chaque chiffre publié sort d'une mesure, aucune régression ne passe.

### Story 5.1 : Gates éditorial et confidentialité

En tant que stakeholder,
je veux qu'aucun contenu non conforme ne puisse être fusionné,
afin que l'exigence de vérité soit mécanique, pas déclarative.

**Acceptance Criteria:**

**Given** AR-7 (a, e)
**When** une PR contient une pièce sans gabarit complet, sans OG/JSON-LD valides, un nom non autorisé ou un chemin machine-local
**Then** la CI échoue avec un message actionnable
**And** la liste d'autorisation des noms vit en configuration versionnée.

### Story 5.2 : Gate sobriété et publication des mesures

En tant que visiteur,
je veux que les chiffres de preuve affichés soient exacts par construction,
afin de pouvoir m'y fier.

**Acceptance Criteria:**

**Given** AR-7 (b), NFR-6/8
**When** le build s'exécute en CI
**Then** la mesure écrit `.weights.json` (poids par page, requêtes) ; home + pièce + offre ≤ 500 Ko hors médias signalés ; zéro requête tierce
**And** le build injecte ces chiffres dans la page preuve et le footer-proof
**And** un dépassement de seuil bloque le merge.

### Story 5.3 : Gates accessibilité et clavier

En tant que visiteur en situation de handicap,
je veux un site réellement praticable,
afin d'accéder aux mêmes informations que tout le monde.

**Acceptance Criteria:**

**Given** AR-7 (c), NFR-9, UX-DR6
**When** la CI s'exécute
**Then** le scan automatisable (contrastes, landmarks, labels, alt) passe sur chaque page
**And** les parcours clavier des quatre UJ passent en e2e Playwright (Tab, focus visibles, zéro piège)
**And** tout échec bloque le merge.

### Story 5.4 : Gate zéro-tiers et gouvernance des seuils

En tant que stakeholder,
je veux qu'aucune dépendance non maîtrisée ne s'introduise silencieusement,
afin de tenir la promesse de souveraineté dans la durée.

**Acceptance Criteria:**

**Given** AR-7 (d) et la gouvernance des gates
**When** un artefact construit contient une URL externe non autorisée
**Then** la CI échoue
**And** toute modification d'un seuil de gate passe par une PR explicitement arbitrée par le stakeholder — jamais d'affaiblissement silencieux.

### Story 5.5 : Enveloppe opérationnelle

En tant que stakeholder,
je veux des secrets hors dépôt, des sauvegardes testées et une supervision,
afin que le service conversion tourne sans surprise.

**Acceptance Criteria:**

**Given** AR-6
**When** les deux déployables sont provisionnés sur Clever Cloud
**Then** les secrets ne vivent qu'en variables d'environnement
**And** le stockage du service est sauvegardé quotidiennement avec une restauration testée et documentée
**And** une supervision minimale alerte sur l'indisponibilité de l'un ou l'autre déployable
**And** les logs applicatifs ne contiennent aucune PII.

### Story 5.6 : Mise en ligne sur libre-ai.fr

En tant que fondateur,
je veux le site en production sur son domaine canonique avec ses défensifs,
afin de lancer la voix publiquement.

**Acceptance Criteria:**

**Given** NFR-12, AR-8 et l'approbation humaine pré-production
**When** le DNS et les déployables sont configurés
**Then** libre-ai.fr sert le site en HTTPS ; libre-ia.fr, libreia.fr, libreai.fr redirigent en 301
**And** les permaliens du site legacy redirigent en 301 (story 1.7)
**And** l'approbation humaine explicite est requise et tracée avant chaque déploiement production
**And** un smoke test post-déploiement vérifie home, une pièce, une offre, le flux contact et le flux RDV.
