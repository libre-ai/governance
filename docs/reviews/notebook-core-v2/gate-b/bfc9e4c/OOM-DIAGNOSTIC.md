# Diagnostic OOM processus — Chromium

## Résultat observé

- candidat : `bfc9e4c77082528889ea953cc941a5312edc9b8f` ;
- Chromium : `149.0.7827.55` ;
- limite : V8 old-space 32 Mio ;
- processus browser et renderer identifiés ;
- terminaison observée : `page-crash` ;
- marqueur moteur : `V8 javascript OOM (CALL_AND_RETRY_LAST)` ;
- le PID renderer disparaît de CDP et de `ps` ;
- watchdog 15 s : non déclenché ;
- profil persistant relancé, marqueur IndexedDB public `public-0x5a` retrouvé ;
- worker neuf : réussi ;
- fixture publique uniquement, aucune pression RAM globale.

Rapport brut : [`evidence/diagnostics/chromium-v8-oom-recovery.json`](evidence/diagnostics/chromium-v8-oom-recovery.json), SHA-256 `b4dd4fe9608f7074216ead1da79aa4223ce4ba1cc9f502549d90a42fcf1200bb`.

## Crédit

`promotableEvidence:false`.

Le marqueur est un vrai OOM moteur et l'attribution au renderer est meilleure que les anciens `SIGKILL`/`SIGABRT`. Cependant la borne provient d'un cap logiciel V8. Le scénario n'est pas l'opération produit exacte et ne fournit aucun équivalent Firefox/WebKit. Il reste donc diagnostic-only conformément aux ADR-0005/0006 et ne ferme pas Gate B.

## Critère restant

Une preuve promouvable doit couvrir les trois moteurs, identifier le processus, exposer un marqueur moteur/OS, conserver un watchdog, vérifier l'absence d'artefact partiel et la reprise, sans VM, `ulimit`, throttling ni saturation globale de l'hôte.

Aucun essai supplémentaire n'est autorisé sur l'hôte courant sans mécanisme moteur spécifique et borné.
