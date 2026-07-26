# Évaluer un harness challenger — intégration, challenge, valeur, promotion

> **Provenance.** Extrait d'un dépôt privé d'expérimentation avant sa
> suppression, le 2026-07-26. Les composants dont l'évaluation dépendait d'un
> contexte étanche non public ont été retirés : leurs verdicts ne sont pas
> reproductibles hors de ce contexte et n'auraient aucun sens ici. Ce qui reste
> est la méthode, illustrée par les composants évaluables publiquement.

Un « challenger » est un ensemble de composants (extensions, compétences,
règles) construit pour concurrencer un harness agentique déjà en place. La
question à laquelle cette méthode répond n'est pas « peut-on l'écrire ? » mais
**« fait-il mieux que ce qui existe déjà, et pour quel coût ? »**

## La correction de méthode : quatre paliers, jamais confondus

La première passe d'une expérimentation valide typiquement que les composants
se chargent et passent leurs tests. C'est une réponse à « est-ce
implémentable ? » — pas à « est-ce meilleur ? ». Quatre paliers distincts :

| Palier          | Question                                                  | Preuve exigée                                 |
| --------------- | --------------------------------------------------------- | --------------------------------------------- |
| **Intégration** | le composant se charge et respecte son propre contrat ?   | tests unitaires, chargement hors ligne, smoke |
| **Challenge**   | comparé à l'existant **sur le même corpus** ?             | runs appariés baseline / challenger           |
| **Valeur**      | apporte-t-il un gain que l'existant ne fournit pas déjà ? | écart mesuré, pas supposé                     |
| **Promotion**   | le gain justifie-t-il coût, friction et risques ?         | décision explicite, réversible, datée         |

**« N tests verts » prouve l'intégration et rien d'autre.** C'est l'erreur la
plus fréquente : un tableau de tests verts se lit comme une validation de
valeur alors qu'il ne mesure que la conformité du composant à lui-même.

## Séparer l'état d'implémentation de l'état d'évaluation

Un corpus de cas qui marque un cas comme `implemented` dès qu'un composant
existe **donne une impression de couverture supérieure à la preuve
disponible**. Deux champs indépendants, jamais un seul :

- `implementationStatus` — le composant existe-t-il et se charge-t-il ?
- `evaluationStatus` — a-t-il été **mesuré** ? Valeurs utiles :
  `not-run`, `baseline-pass`, `challenger-pass`, `no-incremental-value`,
  `failed`, `invalidated`, `superseded`.

`no-incremental-value` et `invalidated` sont les deux valeurs qui font le
travail. Sans elles, un corpus ne peut exprimer qu'un succès ou une absence, et
un composant sans gain se lit comme un composant non encore testé.

## Le rapport d'évaluation porte ses propres limites

Chaque rapport est un fichier structuré versionné, qui déclare **ce qu'il ne
prouve pas** :

```json
{
  "component": "policy-gate",
  "executionPolicy": "Classification et décision préalable uniquement ; aucune commande sensible exécutée.",
  "cases": [
    {
      "id": "sensitive-read-indirect",
      "risk": "R2",
      "observe": "allow",
      "confirmTui": "confirm",
      "confirmHeadless": "block",
      "passes": true
    }
  ],
  "result": { "passed": 3, "failed": 0, "allPass": true },
  "limitations": [
    "Ne prouve pas que l'agent s'abstient d'une publication non demandée.",
    "Ne réduit pas le taux de friction des commandes locales génériques.",
    "Ne remplace pas un sandbox ni une frontière de sécurité shell."
  ]
}
```

Le bloc `limitations` n'est pas de la modestie rédactionnelle : c'est ce qui
empêche un rapport vert d'être cité plus tard comme preuve d'une propriété
qu'il n'a jamais testée. Le champ `executionPolicy` déclare ce que le run s'est
autorisé à faire — un rapport de sécurité qui aurait exécuté les commandes
dangereuses qu'il classe ne serait pas une évaluation mais un incident.

## Invalider un run est un résultat, pas un échec de process

Un run mené dans de mauvaises conditions doit être **explicitement invalidé et
conservé comme tel**, jamais silencieusement remplacé. Cas rencontré : une
évaluation avait exécuté du code généré directement sur l'hôte, alors que le
protocole exigeait une exécution isolée. Traitement retenu :

1. le run est marqué `invalidated`, avec le motif ;
2. la commande et le script fautifs sont supprimés ;
3. **aucun résultat de ce run n'est utilisé comme preuve**, même les résultats
   qui semblaient bons ;
4. un run de remplacement est exécuté dans les conditions correctes.

Un statut agrégé mécanique (et non rédigé à la main) recalcule le verdict
global à partir des rapports, invalidations comprises. Sans agrégation
mécanique, les décisions se dispersent et le verdict global devient une
opinion.

## Le résultat le plus utile : le challenger révèle des défauts de l'existant

Contre-intuitif mais mesuré : la valeur principale d'un challenger n'est
souvent **pas** le composant qu'il propose, mais les défauts qu'il expose dans
le harness en place. Exemples réels :

- Une compétence globale de test routait automatiquement vers un exécuteur de
  tests d'après la seule présence d'un manifeste de paquet, sans lire le
  gestionnaire déclaré ni les lockfiles présents — donc choisissait le mauvais
  exécuteur sur un projet standard d'un autre écosystème. Corrigé en lisant le
  gestionnaire déclaré, les scripts et les lockfiles.
- Plusieurs compétences globales utilisaient une convention de substitution
  d'arguments (`$0`, `$1`) **importée d'un autre harness** et jamais documentée
  par celui en usage, qui ajoute en réalité les arguments au contenu sous une
  forme différente. Convention retirée partout.
- Un champ de déclaration d'outils autorisés était repris d'une convention non
  démontrée, avec une syntaxe (virgules) que l'outil cible n'utilise pas. Le
  champ est en réalité ignoré par la version en usage. Retiré des composants,
  conservé ailleurs uniquement pour compatibilité inter-harness.

Ces trois corrections valent plus que le composant qui les a révélées. **Un
challenge qui ne trouve rien dans l'existant a probablement mal cherché.**

## Verdicts par mécanisme — garder, limiter, rejeter

L'unité de décision est le **mécanisme**, pas le paquet. Un paquet est rarement
bon ou mauvais en bloc :

| Mécanisme                                                    | Valeur face à l'existant                                                           | Verdict                                        |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| Canonisation des chemins et résolution des liens symboliques | renforce réellement un simple test d'inclusion de sous-chaîne                      | **garder comme primitive**                     |
| Classification de risque explicable                          | rend le risque mesurable et explicable                                             | **garder comme UX/télémétrie**                 |
| Expressions régulières shell de sécurité                     | contournable par scripts, options et outils nouveaux                               | **rejeter comme frontière**                    |
| Mode d'observation sans friction                             | mesure sans gêner, mais autorise encore le risque maximal                          | **limiter aux workspaces d'évaluation**        |
| Frontière de contenu non fiable                              | lacune réelle du fichier de doctrine                                               | **garder le principe**, challenger le véhicule |
| Transfert de contexte déterministe, sans appel de modèle     | couverture factuelle égale à la compaction sur fixture ; contexte fortement réduit | **retenir en laboratoire**                     |
| Expurgation du transfert de contexte                         | réduit les fuites évidentes, reste best effort                                     | **garder en défense secondaire**               |
| Observateur supplémentaire                                   | doublon avec tests et revue existants, coût élevé                                  | **rejeté**                                     |
| Auto-création de procédures de vérification                  | muterait les dépôts _pendant_ une vérification                                     | **rejeté**                                     |

Deux composants ont été **rejetés et retirés** après des runs appariés montrant
une couverture identique à l'existant pour un coût supérieur. La règle appliquée :
**une réintroduction exigerait d'abord un échec baseline reproductible.** Sans
cette règle, un composant rejeté revient par conviction plutôt que par mesure.

## Ce que la méthode n'autorise pas

- **Promouvoir parce que c'est implémenté.** Aucune capacité n'est promue au
  motif qu'elle fonctionne.
- **Conclure sans run apparié.** Comparer un composant à un souvenir de
  l'existant n'est pas un challenge.
- **Élargir la surface de détection pour faire passer un gate.** Quand un gate
  de friction échoue, élargir les motifs de reconnaissance pour réduire le taux
  de confirmation revient à truquer la mesure : le gate mesurait précisément le
  fait que la reconnaissance textuelle ne suffit pas.
- **Agréger les décisions à la main.** Le verdict global est recalculé
  mécaniquement depuis les rapports, ou il n'est pas fiable.
