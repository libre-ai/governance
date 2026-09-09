# Design — Système de marque ouvert et vérifiable

- **Date :** 2026-09-09
- **Statut :** plateforme et plan d'implémentation approuvés par le propriétaire en session ; ADR-0032 reste un candidat jusqu'au merge signé sous I-17.
- **Portée :** `governance` (plateforme de marque), `ui` (réalisation visuelle), `website` et `.github` (projections publiques).
- **Références non normatives :** Trail pour la grammaire sémantique, Proton pour la cohérence de famille, Mullvad pour la preuve adjacente, Ink & Switch pour la forme de laboratoire, Mozilla et Oxide pour la voix et la matérialité.

## 1. Résultat recherché

Libre AI doit interrompre le langage convenu du secteur dès le premier écran, puis permettre à une personne qui ne connaît ni la constellation ni sa doctrine de comprendre l'alternative :

> Les plateformes propriétaires vous louent le produit.
>
> Possédez la fabrique.

La provocation désigne une relation de dépendance — louer un résultat sans pouvoir inspecter ni reprendre les moyens de le produire — et jamais une entreprise, une communauté ou une origine géographique. Elle ouvre sur une proposition concrète :

> Libre AI réunit les logiciels, la méthode et les preuves pour construire des outils d'IA que vous pouvez vérifier, modifier et déployer où vous le décidez.

Cette promesse est soutenue, jamais remplacée, par la manière de construire :

> Conçus dans une fabrique ouverte où la preuve fait partie du produit.

Le système de marque rend cette relation visible à toutes les échelles : marque mère, famille de produits, pages publiques, composants d'interface et preuves techniques. La possession n'est pas un slogan abstrait : elle se décompose en droits, capacités de modification, choix de déploiement, réversibilité et preuves. Le système ne demande pas d'être cru : il montre ce qui permet de vérifier. Il ne fabrique aucune preuve et ne transforme aucun état interne en affirmation commerciale.

### 1.1 Objectifs

1. Donner à Libre AI une tension publique stable et mémorable entre location d'un produit fermé et possession des moyens de construire, compréhensible sans vocabulaire d'architecture.
2. Faire reconnaître tous les produits comme une famille `Libre AI <Product>` sans créer de micro-marques indépendantes.
3. Placer la source, la date, le statut et les limites au même niveau visuel que la promesse concernée.
4. Adopter un système visuel propre : éditorial technique, chaleureux, européen, réparable et sans folklore IA.
5. Publier une page de marque utilisable par les contributeurs sans créer une seconde autorité.
6. Conserver un site statique, accessible, déterministe, sans JavaScript client, requête distante ni suivi comportemental.

### 1.2 Non-objectifs

- Renommer `Libre AI`, un repository ou un produit.
- Modifier l'inventaire, l'état, la maturité ou les preuves d'un projet pour servir le récit.
- Créer un CMS, une animation de marque, une télémétrie, un compte ou une personnalisation comportementale.
- Introduire une police distante, une bibliothèque d'icônes, un service de rendu ou une dépendance de design SaaS.
- Décliner immédiatement l'identité dans toutes les applications produit : cette mission livre l'autorité et ses deux projections publiques, puis les produits la consommeront sous leur propre gate.
- Revendiquer une certification, une conformité ou une disponibilité que les preuves publiées n'établissent pas.

## 2. Décisions de marque

### 2.1 Plateforme verbale

| Rôle | Formulation canonique | Usage |
| --- | --- | --- |
| Tension | **Les plateformes propriétaires vous louent le produit.** | Première phrase de la home ; elle vise le modèle de dépendance, pas toutes les entreprises |
| Promesse | **Possédez la fabrique.** | Titre principal de la home et présentation courte de la marque |
| Explication | **Libre AI réunit les logiciels, la méthode et les preuves pour construire des outils d'IA que vous pouvez vérifier, modifier et déployer où vous le décidez.** | Rend « posséder » concret sans promettre la gratuité de l'infrastructure |
| Qualification | **Ouverts, souverains et explicables.** | Sous-titre ; jamais employé sans mécanisme ou preuve à proximité |
| Raison de croire | **Conçus dans une fabrique ouverte où la preuve fait partie du produit.** | Présentation de la méthode |
| Principe | **La preuve fait partie du produit.** | Guide de marque, modules de preuve, communication technique |
| Invitation | **Prenez les clés.** | Appel principal vers la fabrique et les produits |
| Vérification | **Voir les preuves.** | Appel secondaire, explicite et actionnable |
| Parcours | **Comprendre. Vérifier. Contribuer.** | Navigation et appels à l'action non commerciaux |

La phrase longue actuelle — « Pour les personnes qui veulent… » — reste une explication éditoriale possible, mais ne sert plus de hero. Elle demande trop de mémoire avant d'énoncer le bénéfice.

### 2.2 Voix

La voix est incisive, calme et falsifiable. La tension vient de la phrase, jamais de l'agitation visuelle :

- elle met en cause la dépendance organisée par les plateformes fermées sans nommer ni caricaturer un concurrent ;
- elle commence par le résultat pour la personne, puis expose le mécanisme ;
- elle préfère un nom ou un verbe concret à une qualité abstraite ;
- elle donne une limite dans la même unité de lecture que la capacité ;
- elle distingue toujours `prévu`, `construit`, `utilisable`, `vérifié` et `éprouvé` ;
- elle n'emploie pas « révolutionnaire », « intelligent », « magique », « de confiance », « sécurisé », « conforme » ou « souverain » sans préciser pourquoi ;
- elle peut employer une phrase négative forte si la ligne suivante apporte un mécanisme vérifiable ;
- elle ne personnifie pas les agents et ne cache pas l'assistance générative.

Exemples :

| À éviter | À écrire |
| --- | --- |
| Une IA souveraine et de confiance | Code ouvert, données exportables et dépendances publiées |
| Une plateforme révolutionnaire | Une méthode qui relie chaque décision à sa preuve |
| Sécurité de niveau entreprise | Menaces couvertes, audit daté et limites connues |
| Notre écosystème complet | Les projets actuellement exposés, avec leur état calculé |

Formules de tension autorisées, à condition que leur mécanisme ou leur preuve soit immédiatement adjacent :

- **Une promesse d'IA sans preuve ne vaut rien.** — suivi des sources, dates et limites ;
- **Souverain n'est pas une couleur de logo.** — suivi des dépendances, lieux d'hébergement et mécanismes de réversibilité ;
- **Un dépôt public ne suffit pas à rendre un système ouvert.** — suivi des licences, instructions reproductibles et possibilités d'export ;
- **Une limite cachée est une promesse fausse.** — suivi de la limite publiée au même niveau que la capacité.

Les formules absolues non démontrables restent interdites. La marque ne dit jamais « gratuit », « plus complet que tous les concurrents », « aucune dépendance », « sécurité totale », « entièrement explicable » ou « contrôle absolu ». Elle distingue le logiciel sans licence propriétaire du coût réel des modèles, de l'infrastructure et de l'exploitation.

### 2.3 Architecture de marque

`Libre AI` est la seule marque mère. Un produit public prend la forme `Libre AI <Product>`, conformément au LEXICON. Son nom court peut être utilisé après une première occurrence complète dans un contexte où l'origine ne prête pas à confusion.

Les couches de la constellation organisent l'information ; elles ne deviennent ni des marques ni des promesses destinées au premier écran. La méthode reste l'étoile polaire du portefeuille, mais la communication commence par l'effet utilisateur.

Un produit reçoit :

- le mot-symbole commun `Libre AI` ;
- son nom en texte, jamais enfermé dans un logo autonome ;
- un signe secondaire optionnel dérivé de la grammaire commune ;
- un statut et une date issus de sa fiche, distincts de son identité ;
- aucun droit à une couleur permanente qui pourrait être confondue avec un état.

## 3. Concept créatif : la fabrique ouverte

Le principe générateur est **l'assemblage ouvert** : une pièce n'est jamais présentée comme un bloc magique. Ses joints, ses entrées, ses sorties et ses points de contrôle restent visibles.

Cette idée remplace les métaphores dominantes du secteur — halo, cerveau, étincelle, orbite et gradient — et traduit directement les propriétés de Libre AI : construction, inspection, réparation, réversibilité et publication de la preuve. Le contraste de marque est volontaire : le texte ouvre la fabrique que les plateformes gardent hors champ, le système visuel en expose les pièces et les points de contrôle.

### 3.1 Grammaire graphique

Le système utilise cinq éléments, tous réalisables en HTML/CSS/SVG local :

1. **Cadre ouvert** — une bordure interrompue à un endroit fonctionnel, signalant qu'une sortie et une inspection restent possibles.
2. **Joint** — un petit carré ou rectangle plein à la rencontre de deux lignes ; il marque une décision, une dépendance ou un contrôle, jamais une décoration aléatoire.
3. **Ligne d'assemblage** — une ligne orthogonale courte reliant des éléments qui ont une relation réelle.
4. **Étiquette de preuve** — libellé monospace ou tabulaire portant `SOURCE`, `ÉTAT`, `VÉRIFIÉ LE`, `VERSION` ou `LIMITE` avec sa valeur.
5. **Trame d'atelier** — grille discrète limitée aux surfaces explicatives ; elle ne réduit jamais le contraste du texte et disparaît en contraste forcé.

Les contours topographiques, chemins sinueux, nœuds décoratifs et couples bleu océan/corail de Trail sont expressément exclus. Libre AI reprend la discipline d'un système dérivé d'une idée, pas ses signes.

### 3.2 Signe maître

Le signe figuratif est un **martinet construit** : une silhouette abstraite et symétrique, obtenue par l'assemblage de trois pièces orthogonales sur une grille de 24 unités. Les ailes restent ouvertes et la pièce centrale forme un joint visible. Le signe doit :

- rester identifiable à 16 px sans détail intérieur inférieur à 2 unités ;
- fonctionner en une couleur, en positif et en réserve ;
- ne contenir ni lettre, dégradé, transparence, ombre ni animation ;
- ne pas ressembler à un crochet de validation, un avion en papier, une étoile, un chatbot ou un pictogramme de réseau ;
- être livré en SVG source lisible, SVG optimisé et composant React accessible ;
- être accompagné d'un mot-symbole textuel, pas d'un tracé de lettres propriétaire.

Le martinet maintient la continuité documentée par l'exploration chromatique, tandis que sa construction modulaire l'ancre dans le nouveau territoire. Avant publication, un contrôle de similarité visuelle et de disponibilité figurative doit être archivé ; il ne vaut pas avis juridique ni enregistrement.

### 3.3 Typographie

Le système ne charge aucune police distante. Il utilise deux piles :

- **éditoriale sans-serif :** `Inter`, `Aptos`, `Segoe UI`, `system-ui`, sans-serif ; Inter n'est servi que s'il devient un asset local qualifié et licencié ;
- **preuve monospace :** `Berkeley Mono` est exclue car non libre ; la pile par défaut est `ui-monospace`, `SFMono-Regular`, `Cascadia Code`, `Roboto Mono`, monospace. Une police distribuée n'entre qu'après qualification de sa licence et de son coût de chargement.

La hiérarchie vient de la taille, du poids, de l'espace et de la composition, pas de quatre familles typographiques. Les nombres de statut emploient des chiffres tabulaires.

## 4. Couleur et tokens

La direction **Envol constructif** est adoptée comme base, conformément à l'approbation propriétaire de l'option A. Son implémentation reste générée et testée depuis `ui/color-system` ; les fichiers sous `generated/convergence` ne sont jamais importés directement.

### 4.1 Rôles

- graphite chaud : canevas, surfaces, texte, bordures et trames ;
- jade minéral : marque, action primaire et continuité ;
- iris ardoise : contribution, exploration et différenciation secondaire rare ;
- couleurs d'état : réservées aux états sémantiques, toujours doublées par texte et structure ;
- orange de focus : signal fonctionnel d'accessibilité, jamais couleur de campagne.

Le jade et l'iris ne forment jamais un dégradé. Le vert sur noir absolu et l'iris en halo sont interdits. Le thème sombre utilise des surfaces graphite, pas un fond noir pur.

### 4.2 Exigences mesurables

- contraste texte normal : au moins 4,5:1 ; grand texte : au moins 3:1 ; composants et focus : au moins 3:1 ;
- aucune information portée par la couleur seule ;
- modes clair, sombre, préférence système et contraste forcé ;
- repli sRGB déterministe pour toute valeur OKLCH ;
- zéro couleur littérale dans les composants et projections, hors définition des tokens et fixtures de test ;
- stabilité du rendu des tokens entre deux générations depuis les mêmes sources.

## 5. Composants de marque et de preuve

`@libre-ai/ui` devient l'unique réalisation durable des éléments suivants :

### 5.1 Identité

- `BrandMark` — signe seul, décoratif ou nommé selon le contexte ;
- `BrandLockup` — signe + texte `Libre AI` + nom produit optionnel ;
- `ProductSignature` — lockup, nom, résumé et statut calculé ;
- assets SVG source et optimisés correspondant exactement au composant.

### 5.2 Preuve adjacente

- `EvidenceLabel` — clé normalisée et valeur visible ;
- `EvidencePanel` — affirmation, mécanisme, source, date, limite et lien ;
- `ProjectStatus` — maturité, avancement affichable, date de vérification et source ;
- `OpenFrame` — conteneur éditorial utilisant le cadre ouvert sans lui donner de sens autonome.

Les composants n'inventent aucune valeur par défaut. Un champ absent est omis ; une affirmation sans source est refusée par le type ou par le renderer du site. Les composants acceptent du texte déjà sélectionné et ne récupèrent aucune donnée à l'exécution.

### 5.3 Modèle éditorial d'une preuve

Chaque preuve publique comporte :

```text
claim       l'affirmation courte comprise hors contexte
mechanism   le mécanisme observable qui la soutient
source      une URL publique canonique
verifiedOn  une date ISO 8601
limitation  la limite pertinente, ou null si l'absence est volontaire et justifiée
```

Ce modèle sert à la composition et aux tests du site. Il ne devient pas un contrat transversal tant qu'un deuxième consommateur réel ne l'exige pas ; créer prématurément un schéma dans `contracts` serait une mauvaise abstraction.

## 6. Architecture des autorités et flux

### 6.1 `governance`

`governance` possède la sémantique et les règles :

- ADR-0032 d'adoption du système de marque ;
- invariant I-29 : promesse, architecture de famille et principe de preuve adjacente ;
- entrée D38 au registre des décisions ;
- `brand/README.md` : plateforme verbale, voix, architecture, usages et interdits ;
- `brand/proof-matrix.md` : qualificatifs autorisés, mécanismes requis et sources ;
- `brand/references.md` : références externes datées, explicitement non normatives ;
- `TRADEMARKS.md` : articulation des signes, usages nominatifs et publication des assets.

La doctrine ne contient ni token CSS ni implémentation React.

### 6.2 `ui`

`ui` possède la réalisation :

- sources de couleur, générateur, audits et thèmes ;
- SVG maîtres et variantes du signe ;
- composants d'identité et de preuve ;
- page de référence statique générée ;
- licence dédiée des assets de marque et notices SPDX/REUSE.

Le texte de licence des assets doit être approuvé par le propriétaire avant leur première publication. Tant que ce contrôle n'est pas franchi, les assets restent sur une branche non publiée et le site utilise le mot-symbole textuel `Libre AI`. Cette borne respecte `TRADEMARKS.md` sans présenter une rédaction automatique comme un avis juridique.

### 6.3 `website`

`website` consomme une révision SHA de `governance` pour les états de flotte et une révision SHA de `ui` pour les styles et assets. Le build :

1. lit uniquement les projections et contenus revus épinglés ;
2. valide les champs nécessaires ;
3. échappe tout texte externe ;
4. rend les pages et copie les assets locaux ;
5. refuse une preuve sans source, une date invalide, une URL non HTTPS ou hors allow-list publique ;
6. refuse toute ressource distante dans le HTML/CSS produit ;
7. produit deux builds identiques et vérifie leurs empreintes.

Le site ne consomme pas React à l'exécution. Les composants `ui` définissent la sémantique et les styles ; le publisher statique peut rendre leur équivalent HTML déterministe sans hydrater le navigateur.

### 6.4 `.github`

Le profil d'organisation reprend la promesse, les trois engagements et la table de projets générée. Il ne copie ni la plateforme de marque ni les états. Les assets sont référencés depuis une URL canonique versionnée ou embarqués comme projection contrôlée ; aucune modification manuelle du signe n'est autorisée.

## 7. Architecture du site public

### 7.1 Navigation

Le premier niveau comporte :

- **Produits** — projets exposés et états calculés ;
- **Méthode** — comment la fabrique décide, construit, vérifie et publie ;
- **Preuves** — engagements reliés à leurs mécanismes et sources ;
- **Contribuer** — règles publiques et propositions GitHub ;
- **Marque** — guide, assets autorisés et règles d'usage.

Chaque destination fonctionne avec une URL statique stable. Le site minimal peut matérialiser ces destinations comme sections ancrées de la home plus `comparaisons.html` et `marque.html` ; il n'introduit de routes séparées que lorsque le corpus canonique les justifie.

### 7.2 Premier écran

Ordre obligatoire :

1. mot-symbole Libre AI ;
2. eyebrow « Fabrique ouverte de logiciels d'IA » ;
3. tension « Les plateformes propriétaires vous louent le produit. » ;
4. promesse « Possédez la fabrique. » ;
5. qualification et raison de croire ;
6. explication concrète de ce que posséder rend possible ;
7. actions « Prenez les clés » et « Voir les preuves » ;
8. bande de provenance : source de l'état, dernière vérification, absence de tracking.

Le premier écran ne montre ni nombre codé en dur, ni pourcentage global, ni architecture en couches.

### 7.3 Séquence de la home

1. **Tension et promesse** — location du produit contre possession de la fabrique, capacités concrètes et provenance.
2. **Engagements vérifiables** — ouvert, souverain, explicable ; chacun avec mécanisme, source, date et limite.
3. **Produits** — cartes accessibles, groupées par public ou usage ; leur statut vient du fleet status.
4. **Fabrique ouverte** — quatre verbes : décider, construire, vérifier, publier ; liens vers les preuves réelles.
5. **État complet** — table de flotte actuelle conservée comme vue exhaustive et citable.
6. **Contribuer** — chemin GitHub, gouvernance et règles de proposition.
7. **Footer** — source du build, empreinte ou révision, licences, marque, absence de tracking.

### 7.4 Page de marque

`marque.html` publie : idée centrale, voix, couleurs, signe, espaces de protection, tailles minimales, usages corrects/interdits, architecture produit, téléchargement des seuls assets autorisés et lien vers la politique de marque. Les assets non encore juridiquement qualifiés n'y apparaissent pas.

La page est générée depuis les sources épinglées ; elle n'est pas une autorité éditable dans `website`.

## 8. Sécurité, souveraineté et intégrité

- aucune PII, télémétrie, analytics, cookie, identifiant de session ou pixel distant ;
- aucune dépendance runtime à un fournisseur externe ;
- CSP restrictive compatible avec un site statique et styles locaux ;
- toute chaîne issue d'une projection passe par l'échappement HTML ;
- protocoles d'URL admis : `https:` pour les liens publics et chemins relatifs pour les assets ;
- allow-list de domaines limitée aux autorités publiques réellement citées, testée ;
- aucune chaîne ou URL issue d'un dépôt produit n'est interprétée comme HTML ;
- les dates sont ISO 8601 en source et rendues en français sans modifier leur valeur machine ;
- la marque ne transforme jamais une donnée `operational` en autorité ;
- les informations exploitables d'une défense restent sous l'exception sensible de I-20.

## 9. Accessibilité et performance

### 9.1 Accessibilité

- landmarks, titres et ordre de lecture cohérents ;
- lien d'évitement visible au focus ;
- navigation intégrale au clavier ;
- zoom 200 % et 400 % sans perte de contenu ;
- reflow à 320 CSS px ;
- contraste forcé et réduction des mouvements ;
- SVG nommé seulement s'il porte une information, sinon `aria-hidden="true"` ;
- tableaux dotés de légendes, en-têtes et alternative en cartes sur petits écrans ;
- états exprimés par texte et structure, jamais seulement par couleur ou icône.

### 9.2 Performance

- zéro JavaScript navigateur sur les pages publiques de cette mission ;
- zéro police ou asset distant ;
- CSS critique local et borné ;
- SVG optimisés sans métadonnées ou scripts ;
- budget initial par page HTML + CSS + SVG : 150 KiB non compressés, images raster exclues car aucune n'est requise ;
- aucune image héroïque décorative ;
- génération hors ligne et cache HTTP immutable pour les assets versionnés.

## 10. Qualification et preuves

### 10.1 `governance`

- cohérence ADR ↔ invariant ↔ registre ↔ plateforme de marque ;
- scan des mots interdits et des qualificatifs sans mécanisme dans les surfaces canoniques ;
- liens des références non normatives vérifiés et datés ;
- gate complet `bun run check` sans nouvelle alerte.

### 10.2 `ui`

- tests unitaires du générateur de tokens et des composants ;
- conformité DTCG, gamut sRGB, contrastes WCAG et vision des couleurs ;
- tests SVG : `viewBox`, titres, absence de script, URL, raster, gradient et métadonnée interdite ;
- rendu clair, sombre, contraste forcé, 320 px, 200 % et 400 % ;
- comparaison visuelle de la page de référence sur Chromium, Firefox et WebKit ;
- `bun run check` vert sans avertissement.

### 10.3 `website`

- unitaires : échappement, dates, URL, preuve incomplète, regroupement des projets ;
- contrats : fixtures positives et négatives de projection ;
- intégration : double build et comparaison des empreintes, liens internes, sitemap/feed si présents ;
- E2E : Chromium, Firefox et WebKit, clavier, no-JS, contrastes, 320 px, 200 % et 400 % ;
- sécurité : CSP, aucun script, formulaire, requête distante ou donnée personnelle ;
- smoke : home, comparaisons, marque, assets et URLs canoniques ;
- budget : chaque page respecte 150 KiB non compressés hors contenu tabulaire provenant de la flotte ;
- `bun run check` vert sans avertissement.

### 10.4 `.github`

- section générée byte-identique à la projection ;
- liens et image de marque résolubles ;
- aucune affirmation plus forte que la home ou la doctrine ;
- versions française et anglaise sémantiquement alignées.

## 11. Déploiement, activation et retour arrière

L'ordre d'activation est imposé par les autorités :

1. doctrine de marque dans `governance`, revue séparément puis signature propriétaire au merge ;
2. tokens, assets et composants dans `ui`, avec licence d'asset approuvée avant publication ;
3. pin `ui` et `governance` dans `website`, build candidat et preuve E2E ;
4. publication atomique du site après approbation humaine ;
5. mise à jour générée de `.github` ;
6. smoke post-publication ; rollback vers l'artefact statique précédent au premier échec.

Un changement de palette, de signe, de promesse ou d'architecture de famille après l'étape 1 exige un nouvel amendement doctrinal. Une correction de contraste ou d'optimisation SVG qui ne change pas la sémantique reste une modification `ui` sous tests.

## 12. Découpage d'implémentation

La mission est une seule refonte cohérente, exécutée en quatre incréments indépendamment révisables :

1. **Autorité de marque** — ADR, invariant, registre, plateforme verbale, matrice de preuve et règles de marque.
2. **Système visuel** — adoption chromatique, signe, composants, licence et page de référence.
3. **Projection web** — architecture éditoriale, preuves, produits, fabrique, guide de marque et qualification E2E.
4. **Projection organisationnelle** — READMEs français/anglais générés et contrôle de dérive.

Une implémentation parallèle n'est sûre qu'après merge et épinglage de l'incrément dont elle dépend. Les tâches de tests internes à un même dépôt peuvent être parallélisées ; les quatre incréments ne le peuvent pas sans recréer une double vérité temporaire.

## 13. Critères d'acceptation

La refonte est terminée seulement si :

1. une personne comprend la dépendance désignée, ce que « posséder la fabrique » lui permet et le moyen de le vérifier depuis le premier écran ;
2. tout qualificatif de la home renvoie à un mécanisme, une source, une date et une limite explicite ;
3. tous les noms suivent le LEXICON et aucun produit ne devient une marque autonome ;
4. les tokens, SVG et composants n'ont qu'une réalisation durable dans `ui` ;
5. le site ne contient aucun état produit écrit à la main ;
6. les sorties sont accessibles sans JavaScript et sans ressource distante ;
7. les gates complètes des quatre dépôts sont vertes sans nouvelle alerte ;
8. la revue séparée de doctrine accepte le commit immuable de `governance` ;
9. le contrôle de similarité du signe et la décision de licence sont archivés avant publication des assets ;
10. le smoke post-publication est vert ou déclenche automatiquement le rollback complet.

## 14. Arbitrages explicitement fermés

- Le territoire est la fabrique ouverte ; la constellation reste une architecture d'information.
- L'adversaire est la location d'un produit dont les moyens restent fermés ; aucun concurrent ou territoire géographique ne sert de cible.
- La formule de tension canonique est « Les plateformes propriétaires vous louent le produit. »
- La promesse canonique est « Possédez la fabrique. »
- La provocation reste verbale et démontrable ; l'expression visuelle demeure calme et précise.
- La promesse utilisateur précède la méthode.
- Le martinet construit assure la continuité figurative ; il n'est ni mascotte ni illustration narrative.
- Envol constructif est la base chromatique ; jade et iris ne forment jamais de dégradé.
- Les produits partagent la marque mère et ne reçoivent pas de couleur identitaire permanente.
- La preuve est adjacente à la promesse ; un lien générique vers la documentation ne suffit pas.
- La doctrine, la réalisation UI et les projections restent dans leurs dépôts d'autorité respectifs.
- Aucun nouveau repository, contrat transversal, service, CMS ou runtime client n'est créé.

## 15. Questions ouvertes

Aucune question d'architecture ne reste ouverte. Deux contrôles propriétaires sont intégrés à l'exécution sans modifier le design : signature du merge doctrinal et approbation du texte de licence avant publication des assets figuratifs.
