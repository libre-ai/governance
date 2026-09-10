# Libre AI Signalement — dossier de décision de nom

**Statut :** candidat à la signature propriétaire par merge du présent
amendement. Ce document n'autorise ni création distante, ni exposition publique,
ni traitement de données utilisateur.

## Décision proposée

- Marque publique : **Libre AI Signalement**.
- Identifiant produit : `signalement`.
- Repository cible : `libre-ai/signalement`.
- Couche : produit couche 1.
- Exposition pré-repository : `idea`, dans `ecosystem/portfolio.v1.yaml`.

Le `Dossier` reste l'objet métier canonique qui rassemble un signalement, les
faits observés, les preuves explicitement approuvées, un scénario versionné et
ses résultats. Les objets Jira, GitHub, GitLab, Linear, Plane ou internes sont
des projections : le produit ne remplace pas leur autorité métier.

## Pourquoi ce nom

`Signalement` nomme l'action comprise par l'utilisateur non technique sans
réduire le produit à un bug tracker. Il couvre explicitement incidents et
demandes d'amélioration lorsque la description publique l'accompagne. Le mot
reste descriptif ; sa différenciation repose sur l'ombrelle `Libre AI`,
conformément au LEXICON. Il n'a ni promesse ni identité de marque autonome.

La limite est assumée : en français, le mot nu renvoie aussi aux lanceurs
d'alerte, au HSE et aux services civiques. Toute première présentation doit donc
porter le contexte « application web » et « incident ou demande d'amélioration ».
Le produit ne prétend pas fournir un canal anonyme de dénonciation. Il refuse
également les vulnérabilités suspectées, secrets exposés et détails d'exploitation,
qui doivent suivre le canal privé imposé par le `SECURITY.md` de flotte.

## Alternatives refusées après revue adversariale

### `dossier`

Le terme décrivait bien l'objet canonique, mais quatre proximités directes le
rendent insuffisamment distinctif : `dossier.work` synchronise demandes et
retours produit ; `rwliebs/Dossier` relie faits, exigences, tests et GitHub ;
`imboard-ai/ai-dossier` définit un format signé et versionné pour automatisations
LLM ; `askdossier.ai` se présente comme système de référence sourcé. `Dossier`
reste donc le nom de l'objet métier, pas celui du produit ou du repository.

### `issue-loop`, `repro-relay`, `constat`

- `issue-loop` rapproche le produit d'un nouveau ticketing et entre en collision
  sémantique avec les boucles agentiques de la constellation.
- ReproRelay est déjà un produit de capture de bugs navigateur couvrant vidéo,
  contexte console/réseau et suivi.
- Constat est déjà le nom d'un produit Health AI d'architecture de preuves pour
  agents.

Les autres candidats `CaseMesh`, `Proofline` et `ReproMesh` avaient déjà été
écartés pour collisions proches ou usages actifs. Ces constats constituent un
filtre produit et technique, jamais une recherche juridique exhaustive.

## Recherche de collision scellée

Le fichier `COLLISION-SEARCH.v1.json` archive la date, les cinq classes
fonctionnelles examinées, chaque moteur ou surface, la requête, la source et le
résultat normalisé. Son SHA-256 est :

`15fbc36d8de45ceaf4ac109253ab0e54c2ea049ad4c9fe3fdb9d5418f03a1776`

Constats principaux du 2026-09-10 :

- la recherche GitHub exacte `"Libre AI Signalement"` retourne zéro repository
  avec `incomplete_results=false` ;
- `https://github.com/libre-ai/signalement` et le package npm exact
  `@libre-ai/signalement` répondent HTTP 404 ;
- les recherches web exactes n'ont remonté aucun homonyme exact dans les
  résultats examinés, mais confirment la proximité sémantique avec les marchés
  alerte, HSE et civique.

L'absence observée est temporelle, ne confère aucune exclusivité et ne remplace
ni TMview/EUIPO par classes 9/42 ni un avis juridique avant un usage commercial.

## Protocole `sealed-repo`

ADR-0038 est l'autorité normative de la première publication ; I-30 en est
l'inscription synthétique dans le registre des invariants. Il exige :

1. un manifeste canonique conservé de toutes les refs complètes autorisées et de
   tous leurs objets accessibles ;
2. des contrepreuves rouges par surface et des scans sans exclusion couvrant
   contenus, modes, auteur, committer, messages de commit, tagger et messages de
   tags annotés ;
3. la création d'un distant vide privé, puis le push des OID attestés par refspec
   exact et lease ;
4. une preuve reproduite depuis un clone privé complet et fusionnée dans
   Governance avant une action propriétaire séparée de visibilité publique.

Toute ref inattendue, mutation, lecture partielle ou impossibilité de vérifier
refuse fermée. Le contrôle anonyme post-exposition confirme l'état observable ;
il n'est jamais présenté comme une protection rétroactive.

## Frontière de vérité

Le merge de l'amendement du LEXICON constitue la signature propriétaire du nom.
Avant ce merge, le dépôt local reste un candidat scellé et le repository GitHub
ne doit pas être créé. Après le merge, la création distante exige encore une
création vide et privée ; l'exposition publique exige ensuite l'attestation
privée fusionnée prescrite par ADR-0038. Aucun connecteur, navigateur ou moteur
ne sera déclaré opérationnel par cette seule création.
