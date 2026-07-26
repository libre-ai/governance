# Inventaire des boucles agentiques — critères d'arrêt et modes d'échec

> **Provenance.** Extrait d'un dépôt privé de configuration machine avant sa
> suppression, le 2026-07-26. Les boucles propres à un contexte étanche non
> public ont été retirées de l'inventaire ; seules subsistent celles observées
> sur le périmètre public, décrites de façon autoportante.

Une boucle agentique est tout mécanisme qui **relance un agent, ou relance un
contrôle, sans intervention humaine à chaque tour**. Elles s'accumulent sans
qu'on les inventorie : une session, un fan-out de sous-agents, une revue, une
CI, un planificateur périodique. Le risque n'est pas qu'elles existent — c'est
qu'aucune ne déclare **quand elle s'arrête** ni **à quoi ressemble son échec**.

## Les cinq colonnes obligatoires

Toute boucle décrite dans cet inventaire doit renseigner cinq champs. Un champ
vide est une dette, pas une omission :

| Champ                | Question à laquelle il répond                                   |
| -------------------- | --------------------------------------------------------------- |
| **Déclencheur**      | qu'est-ce qui lance un tour ?                                   |
| **État observable**  | où lit-on que la boucle tourne, depuis l'extérieur ?            |
| **Critère d'arrêt**  | quelle condition termine la boucle, sans intervention ?         |
| **Échec observable** | à quoi reconnaît-on qu'elle a mal tourné, sans l'inspecter ?    |
| **Reprise**          | comment la relance-t-on après un échec, sans repartir de zéro ? |

La colonne « échec observable » est celle qu'on oublie. Une boucle dont l'échec
est silencieux est indiscernable d'une boucle qui n'a jamais démarré — panne
documentée en détail dans `DOCTRINE-REPLICATION.md`.

## Inventaire

| Boucle                                                      | Déclencheur                                   | État observable                                      | Critère d'arrêt                                                                              | Échec observable                                                 | Reprise                                   |
| ----------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| Session assistée (idéation → plan → implémentation → revue) | brief humain                                  | fichier de plan, todos, transcriptions               | plan approuvé ; gates verts ; fin du jalon (une session = un jalon)                          | gates rouges, recadrage humain                                   | mémoire + plan rechargés en session neuve |
| Fan-out de sous-agents                                      | ≥ 2 tâches indépendantes identifiées          | notifications de tâche, fichiers de sortie           | rapport rendu par chaque agent ; l'orchestrateur ne fusionne qu'après re-vérification locale | rapport contredisant le code — dérive connue → rejouer les gates | relance ciblée du seul agent fautif       |
| Revue adversariale (producteur ≠ relecteur)                 | livrable sémantique non couvert par les gates | rapports de findings gradués                         | verdict rendu ; findings bloquants corrigés puis re-vérifiés                                 | finding bloquant non corrigeable → escalade humaine              | nouvelle passe sur le diff corrigé        |
| Récurrence pilotée (exécution périodique d'un prompt)       | demande explicite                             | réveils planifiés                                    | arrêt explicite ; expiration de la tâche récurrente                                          | réveil silencieux répété (rien à faire) → resserrer ou stopper   | relance avec le même prompt               |
| Fan-out de revues versionné                                 | commande de revue                             | arbres de travail détachés éphémères                 | N relecteurs terminés ; arbres retirés dans un bloc `finally`                                | arbres orphelins accumulés (filet : purge périodique)            | relance de l'orchestrateur                |
| Orchestration par contrats                                  | work package                                  | contrats versionnés, verdicts, vecteurs de référence | gates de contrats verts + vote humain de verrouillage                                        | dérive de contrat détectée en CI                                 | amendement de contrat tracé               |
| Garde de politique d'outils                                 | évaluation d'un appel d'outil                 | verdicts explicables, attestations                   | fail-closed : refus par défaut ; attestation à TTL borné                                     | contournement de classification, attestation expirée             | ré-attestation sous contrôle humain       |
| Contrôle de dérive périodique                               | planificateur local                           | journal horodaté + notification                      | terminal à chaque run (pas de boucle interne)                                                | ligne non-`ok` dans le journal, **ou absence de ligne récente**  | régénérer puis re-vérifier                |
| Garde-fou d'hygiène en CI                                   | push / demande de fusion                      | statut de check de la forge                          | terminal par run ; bloquant au merge                                                         | check rouge = motif interdit présent                             | retrait du motif, ou exemption déclarée   |

## Critères d'arrêt manquants — dette assumée

Ces boucles tournent sans borne formelle. Elles sont listées parce qu'une dette
nommée se surveille, alors qu'une dette tacite se découvre en incident.

1. **Fan-out de sous-agents : pas de plafond de coût explicite par vague.**
   Le harness borne la concurrence et le total, mais la décision « combien de
   relecteurs pour ce diff » reste du jugement. Règle pratique appliquée :
   dimensionner sur la demande — vérification rapide = 1-2 agents, audit = 3-5
   avec votes.

2. **Re-fusion sous branche mouvante : pas de borne au nombre de tentatives.**
   Quand la branche cible avance pendant la CI d'une demande de fusion, chaque
   mise à jour relance la CI, qui peut à nouveau être invalidée. Règle
   pratique : 3 itérations, puis passage en fusion automatique différée (file
   d'attente de la forge) ou escalade humaine.

3. **Boucles de récurrence pilotée : l'arrêt dépend d'un humain qui s'en
   souvient.** Une expiration par défaut est le seul mécanisme qui garantit
   qu'une boucle oubliée finit par mourir.

## Trois règles tirées de l'inventaire

**Une boucle sans critère d'arrêt déclaré est un incident en attente.** Si le
critère ne peut pas être écrit en une phrase vérifiable, la boucle n'est pas
prête à tourner sans surveillance.

**Un rapport d'agent n'est pas une preuve.** Dans le fan-out de sous-agents, le
critère d'arrêt est le rapport rendu, mais la condition de fusion est la
**re-vérification locale** par l'orchestrateur. Un rapport peut contredire le
code qu'il décrit ; la seule sortie qui fait foi est celle des gates rejoués.

**Le nettoyage appartient à la boucle qui a créé la ressource.** Un fan-out qui
crée des arbres de travail éphémères les retire dans un bloc `finally`, y
compris en cas d'échec. Une purge périodique externe est un filet, jamais une
dispense : sans nettoyage à la source, les ressources orphelines s'accumulent
par centaines avant qu'on les remarque.
