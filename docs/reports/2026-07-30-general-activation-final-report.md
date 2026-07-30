# Rapport de cohérence final — activation générale (γ 3.7)

Livrable 11 de la mission d'activation (ADR-0020, design §7.3). Chaque
constat est mesuré à la date du rapport ; les commandes sont rejouables.

## Chiffres du jalon

- **34 dépôts** dans l'organisation, réconciliés avec l'inventaire par le
  gate `inventory-drift` (vert en continu).
- **33 fiches d'état** `project.v1.yaml` sous le gate de flotte
  `check-fleet-presentation` : 33 vérifiées, 1 sans fiche déclarée
  (`.github`, profil d'organisation), **0 divergence** présentation↔fiche.
- **Index de migration : 88 entrées** ; après les deux vagues de retrait
  γ 3.7, le hub est à sa forme d'archive (**50 fichiers trackés**) et le
  gate d'orphelins mesure **50/50 chemins rendus compte, 0 orphelin**.
- **Toolchain Bun re-hébergé** sous ce dépôt (§5.4.3), byte-identique
  (SHA256 contre-prouvé par re-téléchargement) ; adopté ici, la flotte
  bascule à ses bumps de génération.
- Revues K4 role-separated sur chaque PR structurante du jalon ; les
  fenêtres de rouge sont nommées avec leurs bornes dans le
  gate-acceptance-log (aucune masquée).

## Les sept contrôles du livrable

1. **Affirmations sans preuve** : les sections d'état des README sont
   générées depuis les fiches (sentinelles) et le gate de flotte échoue
   sur divergence — une affirmation d'état non prouvée ne peut pas
   persister sur une surface générée. Les surfaces rédigées (README org,
   bannière du hub) ont été vérifiées en revue K4 contre les registres.
2. **Pourcentages non calculables** : 1 sur 33 (`carriere`), affiché
   honnêtement (« Avancement non calculable — périmètre à clarifier »),
   conforme au design §6.3. Aucun pourcentage manuel nulle part.
3. **Phases sans critère de sortie** : 0 — le schéma exige
   `exit_criteria` non vide par phase, le validateur est bloquant.
4. **Projets sans utilisateur/résultat** : 0 — le schéma exige le
   `statement` complet (for/who_faces/enables/producing/without) ;
   33/33 fiches valides.
5. **Divergences présentation↔code** : 0 au gate de flotte ; les copies
   vendorées de contrats restent sous gates byte-exacts par repo ; le
   gate de dérive de migration asserte les doubles présences restantes
   (38 adaptations déclarées, contrôle anti-fantôme amendé pour les
   vagues de retrait : une adaptation est vivante si son fichier existe
   à destination).
6. **Preuves obsolètes** : `freshness.last_verified_on` ∈
   {2026-07-29, 2026-07-30} sur les 33 fiches au jour du rapport ; le
   champ est re-daté à chaque re-vérification et le validateur refuse
   les dates futures.
7. **Dépendances non documentées** : chaque fiche déclare ses
   dépendances avec leur raison et leur mécanisme de pin ; les pins
   réels sont surveillés par `check-fleet-pins` contre le registre des
   générations.

## Reliquats ouverts, nommés (aucun silencieux)

- **Arbitrage propriétaire floor/round** (ouvert depuis γ 3.2) : la carte
  du hub affiche 88 % pour 87,5 % mesurés (Math.round documenté).
- **Amendement LEXICON §2** (couches manquantes) : à signature
  propriétaire, jamais auto-prononcé.
- **CL36-03** : le tableau généré du README d'organisation n'a pas encore
  son gate de dérive dédié (seule surface générée non gardée) — suivi
  routé depuis la clôture 3.6.
- **CL36-06** : la table générée du profil est monolingue (français) dans
  les deux langues du README d'organisation.
- **Adoption d'URL toolchain par la flotte** : les workflows des 32
  autres dépôts pointent encore la release du hub (archivé, les releases
  restent servies) ; bascule à chaque bump de génération.
- **Deny-list doctrine sans famille « stacks abandonnées »** : le balayage
  exhaustif post-activation (358 fichiers, 2026-07-30) n'a trouvé aucune
  prescription vivante de stack abandonnée — mais rien ne l'empêche
  machinalement à l'avenir. Ajouter une famille de motifs est une décision
  de conception de gate sur surface doctrinale (≈15 exclusions de citeurs
  légitimes, contrainte anti-motifs-inertes) : revue role-separated et
  jalon propriétaire requis, jamais une édition mécanique.
- **Retraits `pending` restants** : les entrées d'archive à double
  présence volontaire (registres, chaîne minimale, toolchain) restent
  `pending` par construction jusqu'à l'archivage ; le gate d'orphelins
  les couvre nominativement.

## Lecture à trois niveaux (design §7.4)

- **Comprendre** : profil d'organisation + page d'accueil website
  (tableau d'état calculé) + fiche par dépôt.
- **Évaluer** : fiches (maturité ≠ avancement ≠ confiance, dépendances,
  non-objectifs), comparaisons datées et sourcées.
- **Vérifier** : gate-acceptance-log, index de migration, gates de
  flotte rejouables (`inventory-drift`), chaînes `bun run check` par
  dépôt, archive du hub clonable.
