<!-- SPDX-FileCopyrightText: 2026 Libre AI contributors -->
<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# Design — Square Control, gestionnaire de fenêtres macOS et premier shell desktop

- **Statut :** v1, itération de cadrage (2026-09-09). Points ouverts en §9, processus de complétion en §10.
- **Arbitrage :** propriétaire, session de brainstorming du 2026-09-09 (décisions listées en §2).
- **Portée :** nouveau repository produit `libre-ai/square-control` ; candidat `desktop-shells` du portfolio.
- **Autorités amont :** ADR-0001 (Bun fullstack, Rust spécialisé), ADR-0008 (topologie multi-repo, I-04 nommage), ADR-0009 (surface humaine, règle de promotion), ADR-0027 (gates de parité après dogfooding), I-11 (licences), `docs/reviews/AGENT-REVIEW-PROTOCOL.md`.

## 1. Contexte et état constaté (2026-09-09)

### 1.1 La cible de parité

**Rectangle** (rectangleapp.com, `rxhanson/Rectangle`) : Swift, MIT, macOS 10.15+, basé sur Spectacle, `AXUIElement` avec permission Accessibilité, fork de MASShortcut pour les raccourcis, Sparkle pour les mises à jour ; 29,9k étoiles.

- Gratuit : moitiés, tiers, quarts, sixièmes, huitièmes, neuvièmes ; cycle de tailles par répétition ; maximiser, presque-maximiser, maximiser en hauteur, centrer ; déplacement vers bord et vers écran suivant/précédent ; agrandir/réduire ; restaurer ; zones d'accrochage aux bords et coins avec empreinte de prévisualisation ; multi-écrans ; apps ignorées ; schéma d'URL `rectangle://execute-action?name=…` ; import/export JSON ; raccourcis supplémentaires pour tailles personnalisées.
- Pro (payant, essai 10 jours, 3 appareils, macOS 13.5+, Paddle) : Throw (16 positions en une combinaison), raccourcis avancés (flèches style Windows, multi-fenêtres), zones d'accrochage personnalisées, tailles personnalisées à comportement configurable, arrangement d'espace de travail (plusieurs apps en un raccourci, déclenché à la connexion d'un écran), Quick Throw, Stash (fenêtres masquées au bord, réapparition au survol), mode épingle, menu personnalisable, synchronisation iCloud, efficacité énergétique.

**Loop** (`MrKai77/Loop`) : Swift, SwiftUI, **GPL-3.0**, macOS 13+ ; 11,5k étoiles. Apports absents de Rectangle : menu radial sur touche déclencheur maintenue (largeur, forme, couleur personnalisables), fenêtre de prévisualisation avant validation (marge, rayon), cycles en séquence d'actions, modificateur + souris/trackpad, annulation et restauration d'un cadre personnalisé, thèmes.

### 1.2 Contraintes de plateforme vérifiées

- **Permission Accessibilité impossible sur les runners GitHub macOS** : le TCC.db n'est inscriptible qu'avec SIP désactivé ; tickets `actions/runner-images` #1567, #3286, #8214 sans résolution. Conséquence : l'E2E sur fenêtres réelles ne tourne pas en CI.
- **Spaces sans API publique** : déplacement d'une fenêtre vers un Space arbitraire uniquement par les fonctions privées `CGSManagedDisplaySetCurrentSpace` et `CGSAddWindowsToSpaces` ; Rectangle Pro n'offre que suivant/précédent (`RectanglePro-Community` discussion #303).
- **App Sandbox incompatible avec l'écriture AX** (`AXUIElementSetAttributeValue` inopérant en sandbox) : pas de Mac App Store ; distribution Developer ID + notarisation + Homebrew, comme Rectangle et Loop.
- **Hotkeys** : `RegisterEventHotKey` (Carbon) reste fonctionnel et n'exige pas la permission Accessibilité, mais échoue depuis Sequoia sur les combinaisons Option+Shift seules (erreur -9868, FB15168205). `NSEvent.addGlobalMonitorForEvents` et `CGEvent.tapCreate` exigent la permission, acquise de toute façon par un gestionnaire de fenêtres.
- **Runners GitHub** : `macos-15` et `macos-26` GA en arm64 et Intel (`-intel`, `-large`) ; `macos-14` déprécié.
- **UniFFI 0.32.0** (2026-06-30) : support Swift 6 partiel, code généré `Sendable` sauf l'async (issue mozilla/uniffi-rs #2448).
- **Crates** : objc2 0.6.4, objc2-app-kit 0.3.2, objc2-application-services 0.3.2, accessibility-sys 0.2.0, swift-bridge 0.1.59.
- **Machine de dev** : macOS 26.6.2, Xcode 26.6, Swift 6.3.3, Rust 1.97 ; aucune identité de signature ; Loop installé (cask `loop`), Rectangle absent.

### 1.3 Doctrine applicable

- ADR-0001 : Rust réservé aux « composants partagés avec des clients natifs », « algorithmes déterministes », « code dont la migration TypeScript supprimerait des invariants opposables ». Non-objectif vision §28 : « promettre desktop/mobile via Bun ».
- `ecosystem/portfolio.v1.yaml` : `desktop-shells`, couche-4, exposition `idea`, fonction « runtime desktop natif pour les produits local-first (notebook, boussole hors navigateur) ». Aucun repo.
- Règle de promotion : un item gagne un repo quand il atteint quelque chose de vérifiable ; enrôlement et création de repo sont des décisions propriétaire (ADR-0009 §5).
- Contrats : les 85 entrées de `libre-ai/contracts` sont `locked` ; un nouveau contrat = candidat, fixtures positives et négatives, projections, passes de revue par rôle (COMPATIBILITY.md). Coût non justifié pour un schéma à un seul consommateur.
- `sdk-rs` est schéma-first : `typify` 0.7 en `build.rs` génère les types Rust depuis les JSON Schema.
- Licences I-11 : EUPL-1.2 (code), CC-BY-4.0 (docs), Apache-2.0 (schémas, exemples), REUSE, DCO.
- Gabarit de contexte couche-1 actif : sections `Purpose`, `Domain doctrine`, `Commands`, `Working here`, plafond 60 lignes.

## 2. Décisions propriétaire de session (2026-09-09)

| # | Décision | Alternatives écartées |
| --- | --- | --- |
| D1 | Hypothèse : **shell desktop, sans IA** — le produit qualifie le patron « cœur Rust + shell Swift mince » des shells desktop de la constellation. | « IA-native » (étiquette jugée fabriquée : un gestionnaire de fenêtres n'a besoin d'aucun modèle) ; produit perso hors constellation. |
| D2 | Périmètre : **au moins Rectangle Pro complet**, plus le paradigme d'interaction et la thématisation de **Loop**, sous une identité propre. | Parité gratuit seule ; parité Pro sans radial. |
| D3 | De Loop : **paradigme et fonctions réimplémentés**, zéro ligne de code (GPL-3.0 incompatible en entrée avec EUPL-1.2), ni nom ni logo. | Fonctions sans radial ; radial seul. |
| D4 | Architecture **A : cœur Rust + shell Swift via UniFFI**. | B Rust maximal objc2 (overlays en AppKit-depuis-Rust, contre le shell mince) ; C Swift seul (ne qualifie pas desktop-shells pour les cœurs Rust existants). |
| D5 | Nom : **`square-control`**, marque « Square Control ». Libre sur GitHub (`libre-ai/square-control` inexistant, aucun homonyme exact), aucun cask Homebrew, aucune app macOS de ce nom. Vigilance : « Square » est une marque de Block dans les paiements, classe sans rapport. | `agencement`, `cadre`, `pavage`. |
| D6 | Sections 1 à 3 de la conception validées ; **première itération de doc puis agents spécialisés** pour compléter et challenger les points ouverts (§10). | — |

## 3. Identité et fiche projet

**Repository** : `libre-ai/square-control`, `kind: product`, `layer: couche-1`, `role: reserved-product-home`, `lifecycle: active`, public. Entrée à ajouter dans `ecosystem/repositories.v1.yaml`. `desktop-shells` reste au portfolio en `idea` jusqu'à la sortie de phase 0, puis passe à `spec-published` en pointant sur ce repo.

**Énoncé (`statement`)** :

- `for` : les utilisateurs macOS qui agencent leurs fenêtres au clavier ou à la souris ;
- `who_faces` : un gestionnaire dont les fonctions utiles sont payantes et dont la configuration part chez Apple ;
- `enables` : agencer, cycler, lancer, masquer et épingler des fenêtres, au raccourci, au glisser ou au menu radial, avec prévisualisation ;
- `producing` : un cœur de layout déterministe testable hors macOS, et le patron de shell desktop de la constellation ;
- `without_depending_on` : aucun compte, aucun service réseau, aucun modèle, aucune télémétrie.

**Hypothèse** : un cœur Rust derrière un shell Swift mince est le bon patron des shells desktop de la constellation (les cœurs Rust existants, `notebook-core` en premier, auront besoin de ce pont hors navigateur).

**Kill predicates** :

1. À la sortie de phase 1, si aucune règle du cœur n'est prouvée par un test qui n'aurait pas été possible en Swift pur, ou si le pont UniFFI coûte plus d'une journée de dette par mois de maintenance macOS : le produit sort de libre-ai et repart en Swift seul.
2. Si l'API privée des Spaces casse sur une version 26.x sans repli par frappe simulée : la fonction Spaces est retirée, pas le produit.
3. Si le dogfooding s'arrête (Loop réinstallé sur la machine du propriétaire) : le produit est gelé, `scope_stability: unstable`.

**Benchmark** : parité fonctionnelle Rectangle Pro hors iCloud ; parité d'interaction Loop (radial, preview, cycles, thèmes). Gates de parité armés après dogfooding (ADR-0027) ; le dogfooding commence quand Square Control remplace Loop sur la machine du propriétaire.

**Non-objectifs** : synchronisation iCloud ou tout service réseau ; Mac App Store ; Linux et Windows ; tout usage d'un modèle ; exposition MCP ou CLI en phase 1 (rendue triviale par l'API de commandes, décidée plus tard) ; copie de code de Rectangle ou de Loop ; tiling automatique.

**Licences** : EUPL-1.2 pour `core/` et `shell/`, CC-BY-4.0 pour `docs/` et `*.md`, Apache-2.0 pour `schemas/` et `fixtures/` ; REUSE conforme ; DCO par commit.

**Version macOS minimale : 15 (Sequoia)**, deux versions supportées (15, 26), matrice CI identique. Loop exige 13, Rectangle Pro 13.5. Descendre sous 15 impose des chemins de compatibilité hotkeys ; monter à 26 exclut les machines d'un an.

## 4. Architecture

### 4.1 Un repo, trois zones

```
square-control/
  core/                       workspace Cargo (EUPL-1.2)
    crates/layout/            moteur pur : aucune dépendance OS, aucune I/O, aucune horloge
    crates/ffi/               surface UniFFI, cdylib + staticlib, sans logique
  shell/                      Swift (EUPL-1.2)
    Package.swift             SquareControlKit : protocoles, adaptateurs, overlays
    App/                      cible Xcode : bundle menubar, réglages, onboarding, app d'aide E2E
  schemas/                    preferences.v1, arrangement.v1, golden-vectors.v1 (Apache-2.0)
  fixtures/                   vecteurs golden JSON, consommés par Rust ET Swift
  docs/                       CC-BY-4.0
  project.v1.yaml  AGENTS.md  CLAUDE.md (@AGENTS.md)  REUSE.toml  .github/
```

Le repo produit porte ses propres schémas. Promotion vers `libre-ai/contracts` au deuxième consommateur (règle des trois), mécanique parce que schéma-first dès l'origine.

### 4.2 Cœur Rust (`layout`)

Une fonction pure au centre :

```
resolve(action, snapshot, preferences, history) -> Result<Plan, LayoutError>
```

- **`snapshot`** : écrans (cadre total, cadre visible, identifiant, écran principal), fenêtre ciblée (cadre, identifiant opaque, bundle id, contraintes min/max, redimensionnable), curseur, fenêtres candidates pour les arrangements (identifiant, bundle id, cadre). **Aucun titre de fenêtre** : seule donnée personnelle du domaine, sans rôle dans la géométrie.
- **`action`** : catalogue fermé (enum). Familles : fractions (moitiés, tiers, quarts, sixièmes, huitièmes, neuvièmes) ; Throw sur 16 positions ; tailles personnalisées ; déplacement vers bord et vers écran ; agrandir/réduire ; centrer, centrer en avant ; maximiser, presque-maximiser, maximiser en hauteur ; restaurer ; annuler ; Stash vers un bord ; épingler ; appliquer un arrangement ; cycle (répétition) et séquence (cycle Loop).
- **`Plan`** : liste de changements de cadre par fenêtre, plus des **intentions opaques** que seul le shell exécute (changer d'écran, requête de Space). Le cœur ignore ce qu'est un Space.
- **Sous-moteurs, tous purs** : cycle par répétition (fenêtre temporelle fournie par le shell) ; zones d'accrochage (curseur + écran donne zone + empreinte) ; résolution radiale (angle + distance + config donne secteur + action) ; arrangements (correspondance d'apps par bundle id, cadres en fractions, déclencheur de connexion d'écran) ; historique d'annulation par fenêtre.
- **Contrats de données schéma-first** : `preferences.v1` et `arrangement.v1` en JSON Schema 2020-12, types Rust générés par `typify` en `build.rs`, validation à l'import. Import et export sont le même fichier.
- **Vecteurs golden** : chaque règle de géométrie a ses cas d'entrée et de sortie en JSON sous `fixtures/`, exécutés par Rust et rejoués par Swift contre le binaire UniFFI. Preuve que le pont ne déforme rien.

### 4.3 Surface FFI (`ffi`)

Records UniFFI simples, appels **synchrones** uniquement : `resolve`, `commit`, `validate_preferences`, `snap_zone_at`, `radial_sector_at`. Pas de callback Swift→Rust, pas d'async : hors de la limitation Swift 6 d'UniFFI (#2448). Construction : staticlib `aarch64-apple-darwin` + `x86_64-apple-darwin`, `lipo`, xcframework, `binaryTarget` SwiftPM (procédure calée sur `xc-universal-binary.sh` de l'exemple UniFFI, à vérifier au plan).

### 4.4 Shell Swift (`SquareControlKit`), tout sur le main actor

- **`WindowSystem`** : protocole (écrans, fenêtre focalisée, poser un cadre, déplacer vers un écran, lister les fenêtres d'une app). `AXWindowSystem` sur `AXUIElement` ; `FakeWindowSystem` rejoue les fixtures.
- **`SpacesAdapter`** : protocole isolé dans un seul fichier avec les déclarations d'API privées, derrière un drapeau de fonctionnalité ; implémentation de repli « suivant/précédent par frappe simulée ».
- **`InputSource`** : un tap `CGEvent` unique pour les raccourcis et la touche déclencheur maintenue ; `NSEvent` pour la souris pendant un glisser.
- **Overlays** : `NSPanel` non activants, contenu SwiftUI : menu radial, empreinte de prévisualisation, onglets de Stash. Thème (largeur, forme, couleur, marge, rayon) lu des préférences.
- **Menubar** `NSStatusItem` avec menu personnalisable ; **réglages** SwiftUI ; **onboarding** de la permission Accessibilité (`AXIsProcessTrustedWithOptions`).
- **Persistance** : un fichier JSON sous `~/Library/Application Support/Square Control/`, validé par le cœur à chaque lecture.
- **Schéma d'URL** `square-control://execute?action=…` pour l'automatisation et l'E2E local.

### 4.5 Flux et erreurs

Entrée (raccourci, radial, glisser, arrangement déclenché, URL) → `Action` côté Swift → `WindowSystem` fournit le `snapshot` → `resolve` → `Plan` → application via `WindowSystem` et `SpacesAdapter` → `commit` met à jour l'historique.

Le cœur renvoie des erreurs typées : pas de fenêtre ciblée, fenêtre non redimensionnable, préférences invalides (chemin JSON), arrangement sans correspondance. Les attendues sont silencieuses ; les autres journalisées sans titre de fenêtre ni chemin utilisateur.

## 5. Matrice fonctionnelle cible

| Fonction | Source | Phase |
| --- | --- | --- |
| Fractions (moitiés, tiers, quarts, sixièmes, huitièmes, neuvièmes), cycle par répétition | Rectangle | 1 |
| Maximiser, presque-maximiser, hauteur, centrer, centrer en avant, restaurer, agrandir/réduire | Rectangle | 1 |
| Déplacement vers bord, vers écran suivant/précédent, traversée multi-écrans | Rectangle | 1 |
| Zones d'accrochage aux bords et coins, empreinte | Rectangle | 1 |
| Apps ignorées, préférences JSON, import/export, schéma d'URL | Rectangle | 1 |
| Throw 16 positions, Quick Throw | Pro | 2 |
| Tailles personnalisées à comportement configurable, raccourcis avancés (flèches, multi-fenêtres) | Pro | 2 |
| Zones d'accrochage personnalisées | Pro | 2 |
| Arrangements d'espace de travail, déclenchement à la connexion d'un écran | Pro | 2 |
| Stash, épingle | Pro, Loop | 2 |
| Menu personnalisable | Pro | 2 |
| Spaces suivant/précédent (repli frappe simulée) | Pro | 2 |
| Menu radial sur touche déclencheur, thèmes | Loop | 3 |
| Prévisualisation avant validation | Loop | 3 |
| Cycles en séquence | Loop | 3 |
| Modificateur + souris/trackpad | Loop | 3 |
| Annulation, restauration d'un cadre personnalisé | Loop | 1 (annulation), 3 (cadre) |
| Efficacité énergétique | Pro | transverse (gate de perf, §6) |
| Synchronisation iCloud | Pro | non-objectif |

## 6. Tests, CI, distribution

**Tests par couche**

- Cœur Rust : unitaires par règle ; vecteurs golden ; propriétés (proptest) sur les invariants : tout cadre produit reste dans le cadre visible, un cycle complet revient au point de départ, annuler restaure exactement, `resolve` est idempotent à snapshot égal. Clippy zéro avertissement, couverture avec seuil bloquant, `cargo-deny`, audit des avis.
- FFI : chaque vecteur golden transite par les records UniFFI, identité vérifiée.
- Shell Swift : XCTest sur `SquareControlKit` avec `FakeWindowSystem` rejouant les mêmes vecteurs contre le binaire Rust réel. Divergence = le pont a tort. Concurrence stricte, avertissements en erreurs.
- Contrats : Ajv strict sur schémas et fixtures.
- E2E réel, **local uniquement** : script qui lance l'app d'aide du projet Xcode avec des fenêtres connues, pilote Square Control par le schéma d'URL, vérifie les cadres par AX. Journal joint à la PR comme preuve. Seul gate non automatisé, conséquence de §1.2.
- Performance : gate sur le temps `resolve` (benchmark Criterion, cœur) et sur la latence entrée→cadre posé (mesure E2E locale) ; budget CPU au repos nul (aucun timer permanent, tap d'événements seul).
- Réseau : test CI vérifiant l'absence de toute API réseau dans le shell.

**CI GitHub Actions**, SHA-épinglée, workflows réutilisables de flotte (`reusable-context-hygiene`, `reusable-licensing`) :

- `core` sur `ubuntu-latest` : fmt, clippy, test, deny, couverture ;
- `shell` en matrice `macos-15` / `macos-26` : staticlibs, xcframework, `swift build`, `swift test`, archive non signée ;
- `contracts` : Ajv ;
- requis au merge, lus sur le SHA de tête : `core`, `shell` (×2), `contracts`, `reuse`, `context-hygiene`.

**Distribution**

- Prérequis propriétaire : compte Apple Developer Program (identité Developer ID). Sans lui, builds de dev non signés, dogfooding seulement. Bloque la phase 4 uniquement.
- Release sur tag : app universelle, signature, notarisation `notarytool`, agrafage, zip, GitHub Release avec SHA256 et attestation de provenance, cask mis à jour dans `libre-ai/homebrew-tap`. `homebrew-cask` central quand la notoriété le permet (critères non chiffrés sur `docs.brew.sh/Acceptable-Casks` ; Gatekeeper obligatoire).
- Mises à jour : Homebrew seul jusqu'à la décision Sparkle (§9).
- Aucun appel réseau, aucune télémétrie.

## 7. Phases et critères de sortie (fiche projet, aucun calendrier)

| Phase | Contenu | Critère de sortie |
| --- | --- | --- |
| 0 Squelette | repo, fiche, CI verte, pont UniFFI sur une action (moitié gauche), onboarding AX, menubar | une action traverse tout le système ; vecteurs golden exécutés en Rust et en Swift |
| 1 Parité Rectangle gratuit | lignes « 1 » de §5 | Square Control remplace Loop sur la machine du propriétaire ; kill predicate 1 évalué |
| 2 Parité Rectangle Pro | lignes « 2 » de §5 | liste Pro cochée par fixtures ; gate de parité armé |
| 3 Paradigme Loop | lignes « 3 » de §5 | liste Loop cochée par fixtures |
| 4 Distribution | signature, notarisation, tap, attestation, décision Sparkle | `brew install libre-ai/tap/square-control` passe Gatekeeper sur une machine vierge |

Phases 2 et 3 permutables (§9, Q1). Pro d'abord charge le cœur et produit tôt les preuves du kill predicate 1.

## 8. Sécurité et vie privée (esquisse, à compléter en §10 rôle sécurité)

- **Permission Accessibilité = capacité de lecture de toute l'UI** : le produit est, par construction, capable d'observer les frappes et le contenu des fenêtres. Engagement opposable : le cœur ne reçoit jamais de titre ni de contenu ; le tap d'événements ne journalise rien ; test CI d'absence d'API réseau.
- **Schéma d'URL** : surface d'automatisation exposée à toute app locale ; actions limitées au catalogue fermé, aucune action destructrice, pas de lecture d'état par l'URL.
- **API privées** (Spaces) : isolées, drapeau, repli ; aucune autre API privée.
- **Supply chain** : SHA-pinning, `cargo-deny`, `minimumReleaseAge` pour toute dépendance Bun de l'outillage, attestation de provenance des releases.
- **PII** : bundle ids et cadres seulement ; préférences locales ; aucun identifiant machine.
- **Modèle de menace complet** : livrable de la passe sécurité (§10).

## 9. Points restant à trancher

Chaque point reçoit, en §10, une analyse par le rôle indiqué, puis une décision propriétaire par question structurée.

| # | Question | Options connues | Rôle §10 |
| --- | --- | --- | --- |
| Q1 | Ordre des phases 2 (Pro) et 3 (Loop) | Pro d'abord (cœur chargé tôt) ; Loop d'abord (valeur visible tôt) | produit |
| Q2 | Mécanisme de raccourcis | tap `CGEvent` seul ; `RegisterEventHotKey` pour les raccourcis + tap pour la touche déclencheur | plateforme |
| Q3 | Spaces | API privée + repli ; frappe simulée seule ; retrait | plateforme, sécurité |
| Q4 | Mises à jour | Homebrew seul ; Sparkle (clés EdDSA, appcast GitHub Releases, XPC) ; vérificateur maison sans auto-install | sécurité, plateforme |
| Q5 | Stockage des préférences | fichier JSON unique ; `UserDefaults` + export JSON | architecture |
| Q6 | Sémantique Stash / épingle (Pro et Loop divergent) | à documenter par le rôle produit avec matrice comparée | produit |
| Q7 | Rendu du menu radial | SwiftUI dans `NSPanel` ; `CALayer` direct | plateforme |
| Q8 | Binaire | universel ; arm64 seul (comportement d'un tap d'événements et de l'AX sous Rosetta à établir par le rôle plateforme) | plateforme |
| Q9 | Raccourcis par app et apps ignorées | portée Rectangle (ignorer) ; portée Pro (raccourcis par app) | produit |
| Q10 | Déclencheur de promotion des schémas vers `contracts` | second consommateur ; activation de `desktop-shells` | architecture |
| Q11 | Identité visuelle (icône, couleurs, radial) | livrable du skill `frontend-design` / `design` après §10 | produit |
| Q12 | Profondeur et persistance de l'historique d'annulation | mémoire seule ; persistée | architecture |
| Q13 | Accessibilité du produit lui-même (VoiceOver sur réglages et menus) | exigence de phase 1 ; exigence de phase 4 | produit, plateforme |
| Q14 | Localisation | fr + en dès la phase 1 ; en seul | produit |
| Q15 | Gate de perf : budgets chiffrés | à proposer par le rôle plateforme avec méthode de mesure | plateforme |
| Q16 | Extraction d'une brique `desktop-shells` couche-4 | au second shell (règle des trois) ; à la sortie de phase 0 | architecture |

## 10. Processus de complétion et de challenge (recommandation)

La constellation possède déjà son protocole : `docs/reviews/AGENT-REVIEW-PROTOCOL.md` (passes en lecture seule par rôle sur un commit immuable, un verdict par passe, orchestration parallèle) et la méthode `docs/method/CHALLENGER-EVALUATION.md` (quatre paliers : intégration, challenge, valeur, promotion). Importer BMAD reviendrait à dupliquer ces rôles sous d'autres noms ; le processus proposé réutilise le protocole existant, adapté à une spec (pas de code, pas de hash de contrat).

**Vague 1 — quatre passes spécialisées, parallèles, lecture seule, sur le commit de cette spec.** Prompts fermés : rôle, périmètre, sources autorisées (cette spec, les dépôts Rectangle et Loop en lecture, la documentation Apple et UniFFI), interdits (aucune copie de code GPL, aucun calendrier, aucun critère « effort humain »), format de sortie imposé.

| Rôle | Mandat | Livrable |
| --- | --- | --- |
| Plateforme macOS | faisabilité sur 15 et 26 de chaque mécanisme de §4.4 et §1.2 ; Q2, Q3, Q7, Q8, Q15 | tableau mécanisme → API → preuve (doc ou test) ; budgets de perf avec méthode |
| Architecture Rust/FFI | frontière `layout`/`ffi`/shell, types, vecteurs golden, invariants de propriété, `typify` ; Q5, Q10, Q12, Q16 | schéma des types de `resolve` ; liste des invariants prouvables « impossibles en Swift pur » (preuve du kill predicate 1) |
| Sécurité et vie privée | modèle de menace complet (AX, URL, API privées, supply chain, mises à jour) ; Q3, Q4 | STRIDE par surface ; engagements opposables et leur test CI |
| Produit et parité | matrice exhaustive Rectangle gratuit / Pro / Loop, ligne par ligne, avec sémantiques divergentes ; Q1, Q6, Q9, Q11, Q13, Q14 | matrice de parité versionnée (base des fixtures de gate) ; options par question |

Format commun de sortie : constats classés (bloquant, majeur, mineur), chaque affirmation sourcée, chaque question ouverte rendue sous forme de 2 à 4 options avec conséquence et recommandation argumentée, et une liste explicite de ce que la passe n'a pas pu vérifier.

**Vague 2 — une passe challenger, adversariale**, sur la spec et les quatre rapports : contradictions entre rapports, affirmations non sourcées, sur-ingénierie par rapport au périmètre (D2), critères hors axes. Verdict unique.

**Consolidation** : les points de §9 sont présentés au propriétaire par lots de quatre questions structurées au plus (ADR-0022), avec l'extrait décisionnel de chaque rapport restitué inline. La spec passe en v2, puis le plan d'implémentation est écrit (skill `writing-plans`), phase 0 en premier.

Mécanique : agents en session (outil `Agent`, type `general-purpose`, sortie vers `docs/reviews/square-control/<role>.md` dans ce repo, lecture seule sur le reste), concurrence 4 puis 1. Pas de worktree : aucune écriture hors du dossier de revue.

## 11. Limites et risques

- Le pont UniFFI est éprouvé ailleurs, pas dans la constellation : la phase 0 est la seule preuve qui compte, d'où sa place en tête et le kill predicate 1.
- L'E2E réel dépend d'une machine avec permission Accessibilité : la preuve de non-régression du shell restera locale tant que la limite des runners tient. Un runner auto-hébergé macOS est une option de phase 4, avec son propre coût de sécurité.
- Les API privées des Spaces peuvent casser à toute mise à jour 26.x : fonction retirable sans toucher au cœur.
- L'admission dans `homebrew-cask` central et la notarisation dépendent d'actions propriétaire (compte Apple, notoriété).
- « Square » comme marque tierce dans une autre classe : risque jugé faible, non nul.

## 12. Sources vérifiées (2026-09-09)

- rectangleapp.com, rectangleapp.com/pro, github.com/rxhanson/Rectangle (README, LICENSE MIT)
- github.com/MrKai77/Loop (README ; licence GPL-3.0 confirmée par l'API GitHub)
- github.com/actions/runner-images : README (images macOS), issues #1567, #3286, #8214
- github.com/rxhanson/RectanglePro-Community/discussions/303 (Spaces)
- developer.apple.com/forums (App Sandbox et AX ; RegisterEventHotKey sur Sequoia), feedback-assistant/reports #552
- mozilla.github.io/uniffi-rs (Swift overview, Xcode), issue mozilla/uniffi-rs #2448
- crates.io (versions relevées en §1.2)
- docs.brew.sh/Acceptable-Casks
- Dépôts de la constellation : `governance` (ADR-0001, 0008, 0009, 0027, INVARIANTS, portfolio, CONTEXT-TEMPLATE, AGENT-REVIEW-PROTOCOL, CHALLENGER-EVALUATION), `contracts` (CATALOG, COMPATIBILITY), `sdk-rs` (build.rs), `feed-radar` (REUSE.toml, CI)
