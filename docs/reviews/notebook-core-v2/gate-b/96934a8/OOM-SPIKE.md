# Spike OOM processus navigateur — conclusion bornée

## Cible et règle de crédit

- candidat : `96934a8e0698db6d35591f811856ff0824db3956`
- arbre : `f51a2c3a3ff85d0c66d7ef244922a37f1b43a9c5`
- portée : recherche d'un mécanisme local sûr, borné et attribuable ; aucune saturation globale exécutée

Une preuve OOM processus recevable doit réunir : processus identifié, limite ou borne explicite, watchdog, marqueur moteur ou OS attribuant la terminaison à l'OOM, absence d'artefact partiel et reprise vérifiée. Une fermeture de page, `RangeError`, refus `memory.grow`, `SIGKILL`, `SIGABRT` ou code de sortie nul n'est pas suffisant.

## Voies examinées

| Voie | Observation | Crédit |
|---|---|---|
| Chromium `chrome://memory-exhaust/` | déclencheur interne spécifique, susceptible de terminer un renderer, sans marqueur portable démontré dans la preuve Playwright | aucun |
| Firefox pages de crash / crash reporter | aucune primitive publique et bornée identifiée qui provoque un OOM réel tout en exposant une cause attribuable | aucun |
| WebKit limites mémoire / terminaison WebContent | chemins moteur présents, mais aucun déclencheur public commun et aucun marqueur OS exploitable de façon sûre dans la campagne | aucun |
| `RLIMIT_RSS`, `ulimit`, cgroup, conteneur, VM | limitations logicielles ou diagnostics, non équivalents à une classe physique et sans sémantique OOM portable sur les trois moteurs | diagnostic uniquement |
| allocation JS/WASM jusqu'à échec | risque de pression globale ; `RangeError` ou `memory.grow` refusé ne prouve pas la mort OOM du processus | interdit / aucun |
| signaux #97 / candidat exact | `SIGKILL` seal puis `SIGABRT` restore, même profil repris, `exitCode:null` | preuve crash/kill, pas OOM |
| fautes WASM/Rust | plafond 512 Mio, alloc 600 Mio, panic et failpoints serde/JCS/Argon avec reprise | preuve interne, pas OOM processus |

## Décision de sécurité

Aucun test d'épuisement global de la RAM ou du swap n'a été lancé. Aucun signal manuel n'est renommé en OOM. En l'absence d'une voie sûre et attribuable commune à Chromium, Firefox et WebKit, le finding reste ouvert.

## Résultat

**OOM processus navigateur : NON DÉMONTRÉ — blocking Gate B.**

Une future preuve devra soit utiliser des marqueurs natifs/moteur vérifiables par navigateur, soit formaliser trois mécanismes spécifiques donnant chacun la même attribution minimale. Une VM ou une limite logicielle restera `vm-diagnostic` / `promotableEvidence:false`.
