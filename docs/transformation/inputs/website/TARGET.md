# Cible — Libre IA Website

Statut : **acceptée**  
Autorité : décision produit du 2026-07-12

## Hypothèse de conception

Le site décrit honnêtement l’état courant des sept produits au lieu de projeter une disponibilité finale. Un produit peut être `discovery`, `private-alpha`, `public-alpha` ou `stable`. Seuls les deux derniers états peuvent exposer une URL applicative, et uniquement avec une preuve datée et une attestation propre au produit.

## Mission

Libre IA aide chacun à comprendre, choisir et utiliser l’intelligence artificielle sans subir les discours marketing ni les dépendances irréversibles. Elle enseigne, oriente et construit des produits vérifiables, accessibles et résilients.

La souveraineté n’est jamais présentée comme un état absolu. Elle est l’effet toujours partiel d’une résilience opérationnelle démontrée : comprendre, remplacer, exporter, restaurer et continuer à agir en mode dégradé.

## Public servi

Le site s’adresse au grand public. Il doit rester utile à plusieurs niveaux de maîtrise sans mélanger leurs parcours :

- **comprendre** sans jargon ni prérequis ;
- **apprendre** grâce à des ressources progressives ;
- **agir** en découvrant un produit ou une pratique adaptée ;
- **vérifier** les sources, méthodes, limites et corrections ;
- **contribuer** à un collectif ouvert lorsque son cadre sera prêt.

## Expérience canonique

Une personne qui ne connaît pas Libre IA doit pouvoir :

1. comprendre sa mission et son exigence de vérité ;
2. comprendre la mission, l’état public, la frontière et les limites de chacun des sept produits ;
3. identifier le produit ou la ressource adapté à son besoin ;
4. consulter les preuves et limites associées ;
5. poursuivre vers le produit ou le site spécialisé sans compte obligatoire.

## Responsabilité éditoriale

Website possède :

- les pages institutionnelles : mission, résilience, méthode, gouvernance, corrections et contribution ;
- la présentation honnête des produits publics ;
- des ressources éditoriales revues ;
- les annonces institutionnelles et sorties produit.

Website ne possède pas :

- les cours interactifs, exercices, mini-jeux ou progressions, qui appartiennent à **AI Practices** ;
- les sessions collectives, qui appartiennent à **Sessions** ;
- un annuaire de logiciels, un wiki technique ou des tutoriels d’exploitation par outil ;
- une veille exhaustive ou un observatoire d’incidents ;
- l’orchestration, l’inspection ou la distribution des autres produits ;
- un CMS, un compte utilisateur ou une collecte comportementale par défaut.

## Ligne éditoriale

Website publie peu et répond à une décision réelle. Une ressource doit aider une personne à :

1. comprendre un mécanisme ou une controverse ;
2. comparer des options selon des critères explicites ;
3. décider sans déléguer son jugement ;
4. vérifier les preuves, limites et corrections.

Les unités éditoriales admises sont :

- **explication** — rendre un mécanisme compréhensible sans simplification trompeuse ;
- **guide de décision** — comparer des options sans transformer une préférence en vérité universelle ;
- **rapport de preuve** — publier un protocole, un résultat reproductible et ses limites ;
- **position** — assumer une recommandation normative, clairement séparée des faits ;
- **correction** — rendre une erreur et sa réparation visibles.

Un contenu n’est pas commandé parce qu’un outil, une actualité ou un dépôt existe. Il part d’une question durable pour le public. Les pages produit expliquent un problème, une disponibilité, des frontières et des preuves ; elles ne servent pas de vitrine à chaque dépôt.

## Exigence de vérité

« Ne jamais accepter le mensonge » signifie : ne jamais masquer une incertitude, présenter une hypothèse comme un fait, fabriquer une preuve ou laisser persister silencieusement une erreur connue.

Chaque ressource publiée doit :

- déclarer sa nature : fait documenté, analyse, opinion ou guide ;
- identifier un auteur humain responsable ;
- déclarer l’assistance IA utilisée pour sa préparation ou sa révision ;
- rattacher les affirmations importantes à leurs sources ;
- expliciter la méthode de tout chiffre ou graphique ;
- porter une date de dernière revue ;
- rendre les corrections visibles ;
- échouer à la validation plutôt que recevoir une valeur inventée par défaut.

## Cible technique

Le produit est reconstruit intégralement en **Dioxus 0.7.9**.

Architecture cible :

```text
content domain       modèles éditoriaux stricts, états et catalogue
Dioxus application   navigation et composants adaptatifs partagés
static publisher     HTML, RSS, sitemap, robots, redirections et index Pagefind
libre-ai.fr           comprendre le portefeuille
<produit>.libre-ai.fr agir après gate publique propre au produit
preuves.libre-ai.fr   vérifier les rapports publiés
mobile distribution  même domaine métier, contenu local vérifié
```

Contraintes :

- aucun code Astro, aucune configuration Astro, aucun MDX ;
- Markdown portable, strictement validé et rendu sans HTML arbitraire ;
- web statique utilisable sans hydratation globale ;
- JavaScript limité aux améliorations progressives nécessaires ;
- polices et actifs auto-hébergés ;
- tokens et primitives Client Kit ;
- recherche Pagefind auto-hébergée sur le web ;
- aucune dépendance obligatoire à un hyperscaler ou SaaS US ;
- déploiement statique reproductible sur Clever Cloud ;
- données et préférences mobiles locales par défaut.

## Cible mobile

La distribution mobile est une cible produit, pas une affirmation de disponibilité.

Elle devient publiable uniquement lorsque la matrice de preuve couvre au minimum :

- navigation et lecture hors ligne ;
- cycle de vie, veille et reprise ;
- retour système et liens profonds ;
- VoiceOver et TalkBack ;
- permissions minimales ;
- contenu embarqué versionné et vérifiable ;
- installation, mise à jour et rollback ;
- paquet signé et testé sur appareils réels.

Avant ces preuves, Android et iOS restent explicitement `experimental`.

## Résultat final vérifiable

La cible est atteinte lorsque :

- une seule implémentation Dioxus subsiste ;
- aucun fichier ou outil Astro/MDX ne subsiste dans le dépôt actif ;
- aucun contenu non revu n’est publié ;
- le catalogue produit vient d’une source canonique et présente les sept produits avec leur état, hôte réservé, frontières, non-objectifs et preuves attendues ;
- les parcours Comprendre, Apprendre, Agir, Vérifier et Contribuer sont testés ;
- l’artefact web contient HTML statique, 404, RSS, sitemap, robots, redirections et recherche ;
- le site passe les contrôles clavier, contraste, lecteurs d’écran et navigateurs ;
- le build est déterministe et sa licence/supply chain est vérifiée ;
- Website exige une approbation humaine avant déploiement ;
- chaque CTA de lancement exige URL canonique, preuve datée et gate propre au produit ;
- les limites web et mobiles sont publiques et exactes.

## Règle d’arrêt

Un ajout est refusé s’il augmente le volume sans renforcer une décision du public, part d’un outil plutôt que d’un besoin, introduit une affirmation invérifiable, duplique un autre produit ou rend le site dépendant d’un service non remplaçable.
