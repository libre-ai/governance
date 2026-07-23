---
type: adversarial-review
architecture: ARCHITECTURE-SPINE.md
reviewer: Claude Code (automated gate)
date: 2026-07-14
result: DIVERGENCES CRITIQUES — 5 paires identifiées, resserrements AD requis avant implémentation
---

# Revue adversariale — Architecture Spine Website Libre IA

## Verdict

Spine conforme aux 4 axes (sécurité/qualité/perf/complétude) mais contient **5 divergences critiques** : unités subordonnées respectent littéralement chaque AD isolément, mais divergent sur représentation de données, propriété d'entités, et calculs de preuve. Aucune n'est bloquante immédiatement (le gap n'émerge qu'à l'implémentation simultanée), mais toutes cassent l'invariant de **cohérence éditoriale** invoqué dans le paradigme. **Resserrements AD requis** avant Gate 4.

---

## Paires divergentes

### Paire 1 : Flux RSS (FR-3/FR-5) vs Page corpus Web (FR-1)

**Incompatibilité : représentation gabarit `assistance_ia`**

**Implémentation A (page web)** → Dioxus rendu HTML :

- `assistance_ia: Vec<(String, String)>` = `[(modèle, rôle)]`
- Affiche : `<span class="ia-badge">Claude 3.5 Sonnet — research + draft</span>` + liste multiple si N > 1

**Implémentation B (flux RSS)** → parsing feed en Atom/RSS classique :

- RSS 2.0 n'a pas de champ canonique pour Vec<assistance> ; mapping divergent légitime :
  - Variante B1 : `<author>Fondateur, assisté Claude 3.5 Sonnet (research)</author>` (perte structuration)
  - Variante B2 : Extension custom `<libre-ai:assistance>` (incompatible aggrégateurs RSS génériques)
  - Variante B3 : Une seule entrée RSS `<author>` (perte données pour N > 1)

**Divergence concrète** : un lecteur RSS parsant la feed obtiendra une représentation du gabarit FR-1 incohérente avec le web.

**Resserrement proposé (AD-3)** :

> Mapping RSS/Atom canonique : `assistance_ia: Vec<(model, role)>` → `<category domain="libre-ai.fr/assistance">model=<X>, role=<Y></category>` (répétion si N > 1) ; fallback RSS 2.0 legacy (sans catégories custom) : `<author>` = premier `(model, role)` uniquement, avertissement build si N > 1. Validateur RSS : rejet merge si feed manque catégories d'assistance ou si N_web ≠ N_feed.

---

### Paire 2 : Service conversion POST /api/contact vs POST /api/rdv

**Incompatibilité : timestamp — création client vs serveur**

**Implémentation A (contact)** → formulaire + honeypot statique :

- POST classique (amélioration progressive sans JS)
- Serveur crée timestamp à la réception (cf. AD-4 enveloppe `meta.timestamp`)
- Pas de champ timestamp côté client

**Implémentation B (RDV + iCalendar)** → formulaire + slot selection :

- Client peut inclure `<input type="hidden" name="timestamp_booked">` (moment où slot a été cliqué)
- Serveur crée son propre timestamp (POST reçu)
- iCalendar RFC 5545 requiert DTSTAMP (timestamp), mais ne précise pas : timestamp client (sélection du slot) ou serveur (confirmé)?

**Divergence concrète** :

- Scénario : utilisateur clique slot 14:00 à 13:59:55 (client_timestamp), confirmation POST reçue à 14:00:03 (server_timestamp)
- Storage enregistre `{email, créneau: "14:00", timestamp: ?}` → deux choix divergents
- iCalendar : DTSTAMP = client (utilisateur voit la confirmation timing correct) vs serveur (audit trail couvre le vrai POST)
- Deux implémenteurs produisent deux tables incompatibles ; export données client (RGPD) cite timestamps incohérents

**Resserrement proposé (AD-4, AD-5)** :

> Tous timestamps = création serveur (req header `Date` si client en envoie, ignoré). Storage enregistre un seul champ `recorded_at = DateTime::now(UTC)` (moment POST accepté). iCalendar DTSTAMP et meta.timestamp du JSON = identical = server recorded_at. Jamais de timestamp client. Validateur : rejet POST si client envoie `timestamp` field (silencieusement rejeté, pas erreur — anti-probing).

---

### Paire 3 : Page offres (FR-6/FR-8) + CTA (FR-9) vs API /api/slots

**Incompatibilité : réservabilité — statique (build) vs dynamique (runtime API)**

**Implémentation A (slots au build)** :

- `content/data/slots.json` chargé à la build Dioxus
- Page offre rendue avec `<a href="#rdv-section" class="cta-reserve">Réserver 30 min</a>` (statique, aucun JS)
- CTA toujours visible (slots figés à la build, jamais exhausts jusqu'à rebuid)
- Respecte AD-1 (SSG pur, zéro JS) ET AD-5 (créneaux chargés au build)

**Implémentation B (slots via API runtime)** :

- `content/data/slots.json` ignoré
- Page offre rendue sans données de slots
- JS (progressif) : `<script>fetch('/api/slots').then(s => affiche bouton si s.length > 0)</script>`
- Viole AD-1 (zéro JS embarqué) mais réalise l'autre option AD-5 ("créneaux ... ou via API simple")

**Divergence concrète** :

- Si deux équipes codent en parallèle, l'une produit une page statique qui réserve toujours, l'autre une page qui ne montre "Réserver" que si slots dispo
- Utilisateur SSR (sans JS) : Implémentation A affiche CTA, Implémentation B affiche rien
- Cohérence marque (EXPERIENCE.md) : une demande RDV via CTA dépend de l'implémentation retenue

**Resserrement proposé (AD-5, AD-1)** :

> Créneaux **au build uniquement**, jamais via API runtime. AD-5 option « ou via API » supprimée (complexité JS incompatible paradigme SSG). Si slot exhaustion risqué à mid-cycle, solution : build twice daily ou renvoi POST vers waiting-list. CTA toujours visible (amélioration progressive : JS optionnel enregistre slot dans localStorage avant POST, côté serveur valide existence à l'enregistrement).

---

### Paire 4 : Page corpus author (FR-1 gabarit) vs Page interventions (FR-18)

**Incompatibilité : propriété d'entité — référence typée vs texte libre**

**Implémentation A (author = String brut)** :

- `CorpusPiece { author: String }` (ex. "Fondateur Libre IA")
- Page corpus affiche `<span class="author">Fondateur Libre IA</span>`
- Aucune liaison interventions.md → corpus author

**Implémentation B (author = ID typé)** :

- `CorpusPiece { author_id: UUID | MemberName }` (enum ou FK)
- Page interventions charge liste membres depuis `collectif.md` + struct typée `Member { name, role, bio }`
- Page corpus affiche `<a href="/collectif#jean-dupont">Jean Dupont</a>` (lien résolvable)
- Interventions.md : `attribution: [jean-dupont, marie-martin]` (IDs typés)

**Divergence concrète** :

- Corpus pièce "Sortir des hyperscalers" : author = "Fondateur Libre IA" (A) vs author_id = member.jean_dupont (B)
- Page collectif (Implémentation B) affiche Jean Dupont, clique révèle ses interventions
- Page collectif (Implémentation A) : aucun lien, "Fondateur Libre IA" n'est pas dans les membres listes (display name ≠ ID)
- Deux structures incompatibles de la même entité (auteur = engagement produit cohérent ou isolation)

**Resserrement proposé (AD-2, AD-3)** :

> Champ `author` reste texte libre (String) pour souplesse éditoriale. Ajout champ optionnel `author_member_key: Option<String>` referencing `content/static/collectif.md` structure (`members: [{key, name, ...}]`). Validation build : si author_member_key fourni, validation que la clé existe dans members + cohérence (name du key == author string, après trim/case-fold). Interventions.md : `attribution: Vec<String>` = member_keys validés au build. Page corpus : affiche author + lien si author_member_key présent. Détect ambiguïté : deux corpus avec author = "Fondateur" mais author_member_key différents = WARNING build.

---

### Paire 5 : Page chaîne-maîtrisée affichage poids vs Gate CI mesure poids

**Incompatibilité : calcul et attribution du chiffre de preuve**

**Implémentation A (poids = snapshot statique)** :

- Gate CI mesure poids post-build : "home=120 Ko, corpus=85 Ko, offer=95 Ko, total=300 Ko (excl. médias)"
- Ecriture artefact `.weights.json` en dist/
- Build Dioxus charge `.weights.json`, embed statiquement dans HTML chaîne-maîtrisée : `<span class="total-weight">300 Ko</span>`
- Page affichée = chiffre figé, cohérent avec la mesure gate CI

**Implémentation B (poids = calcul dynamique)** :

- Page chaîne-maîtrisée inclut JS : `<script>fetch('/dist/.weights.json').then(...)</script>`
- Affiche poids mesuré à dernière build, mais JS l'interroge à runtime
- Viole AD-1 (zéro JS embarqué) mais réalise « vérité mesuré »

**Implémentation C (poids = manuel)** :

- Page chaîne-maîtrisée : `<span class="total-weight">~500 Ko</span>` (estimé, pas mesuré)
- Aucune liaison au gate CI, poids dans la prose (approximation), peut devenir faux sans rebuild
- Viole NFR-6 (conformité à vérité éditoriale, FR-15 demande chiffre exact)

**Divergence concrète** :

- FR-15 demande « affichage chaîne maîtrisée » + « coûts »
- Gate CI (AD-8) produit poids mesuré, mais ne dit pas que ce chiffre doit être exposé à l'utilisateur
- Page affichée peut donc citer un poids déjà obsolète (build précédente), ou manuellement faux, ou dynamique (brise paradigme)
- Utilisateur se pose : "Ce site dit 300 Ko mais ma mesure réseau affiche 320 Ko" = incohérence

**Resserrement proposé (AD-8, mapping FR-15)** :

> Gate CI écrit `.weights.json` structuré : `{ pages: { home, corpus_sample, offer_sample }, total, timestamp_measured, excluded_assets }`. À la build Dioxus, `editorial.rs` charge `.weights.json`, parse chiffre total, valide ≤ 500 Ko (erreur compile si dépasse), embed dans chaîne-maîtrisée page en HTML brut : `<data value="300">300 Ko (mesuré 2026-07-14, sans médias listés)</data>`. Zéro JS. Mise à jour chiffre = rebuild + redeploy (figé entre déploiements). Validateur : Rejet merge si page chaîne-maîtrisée contient du JS chargeant poids, ou si chiffre poids HTML ≠ .weights.json.

---

## Résumé des resserrements requis

| AD affectée  | Changement             | Justification                                         |
| ------------ | ---------------------- | ----------------------------------------------------- |
| AD-3         | Mapping RSS canonique  | Cohérence assistance_ia entre web + feed              |
| AD-4 / AD-5  | Timestamp serveur only | Pas de client timestamp, DTSTAMP iCal = recorded_at   |
| AD-5 / AD-1  | Slots build only       | Pas d'API slots (JS interdit), réservabilité statique |
| AD-2 / AD-3  | Author optionnel typed | Member key référencé, intervention cohérence          |
| AD-8 / FR-15 | Poids embedded static  | .weights.json → HTML figuré, zéro JS affichage        |

---

## Critique architecture générale

Spine est **bien structurée** et minimale (paradigme SSG affirme une ligne claire : immuable web + un point d'API dynamique). Les divergences ne sont **pas des fuites de périmètre** mais des ambiguïtés de mapping entre abstract (AD) et concret (paires composants).

**Bon** : AD-1 (SSG), AD-4/AD-6 (conversion isolation), AD-8 (gates CI) très fermes.  
**À resserrer** : AD-2/AD-3 (définitions du gabarit), AD-5 (slots), éventuellement affinage mapping data (author, timestamp).

**Aucun risque sécurité/souveraineté identifié** ; pas de dépendance tierce qui s'infiltrerait. Risque qualité = rework fusion (deux implémenteurs parallèles codent divergent, merge chaos).

Passage Gate 4 possible **sous condition** : resserrements AD fusionnés dans spine avant branching développement.

---

## Compte

- Moyens : 3 (AD-3 mapping RSS, AD-8 weights embed, AD-2/3 author typing)
- Faibles : 2 (AD-5 slots constraint, AD-4 timestamp)
- **Total critères** : 5 paires → **toutes confirmées après relecture**

Chemin : `<workspace>/website/_bmad-output/planning-artifacts/architecture/architecture-website-2026-07-14/review-adversarial.md`
