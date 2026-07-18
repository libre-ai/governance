# Gate B — revue PERFORMANCE / CLASSES DE RESSOURCES — Notebook Core v2

- `reviewPassId` : `notebook-core-v2-gate-b-performance-resource-classes-9ee3f8d-05`
- rôle : performance-resource-classes
- mode : `review-only`
- date : `2026-07-18`
- commit revu : `9ee3f8da65afce9bce8da98baac72c1aea8bd0ce`
- arbre : `843a95252eb60f08fdc596a20bcbcd19a0b1b4fd`
- base : `895c749df676bf46bc85ee556680025b55c028ff`
- agent/session/provider/modèle : non exposés par le harness

## Portée

Passe dédiée sur les budgets verrouillés, la classe matérielle requise, l'attribution RSS, l'historique des campagnes rejetées et la nouvelle politique OOM. Aucun fichier n'est modifié.

## Classe et protocole

- classe requise : `desktop-arm64-high-memory-reference` ;
- host : macOS arm64 physique, 38 654 705 664 octets, 14 CPU logiques, secteur ;
- mode : `physical-evidence`, `promotableEvidence:true` ;
- moteurs : Chromium 149.0.7827.55, Firefox 151.0, WebKit 26.5 ;
- deux warm-ups puis vingt seal/open par profil et vingt cas par refus anti-oracle ;
- sélection RSS : `exclusive-pinned-browser-cache` ;
- manifeste ressources : `50b6986e97dc7cc541448ce32951f899bbca299c239c0680b7cc0d0c1bed6d55`.

## Résultats finaux

| Moteur | Profil | seal p95 | open p95 | RSS additionnel | Budget |
|---|---|---:|---:|---:|---|
| Chromium | producteur | 820,1 ms | 863,4 ms | 161 447 936 | pass |
| Chromium | maximal | 1 031,9 ms | 1 073,6 ms | 230 195 200 | pass |
| Firefox | producteur | 4 476 ms | 4 572 ms | 242 499 584 | pass |
| Firefox | maximal | 7 057 ms | 7 157 ms | 310 820 864 | pass |
| WebKit | producteur | 555 ms | 600 ms | 222 724 096 | pass |
| WebKit | maximal | 750 ms | 795 ms | 319 160 320 | pass |

Verdict brut : `qualification-budgets-pass`, violations `[]`.

## Rejets et remédiation conservés

1. La première matrice physique sur `e8c4532` a rejeté Firefox maximal avec 3 257 450 496 octets additionnels. Le sampler historique additionnait tout processus dont la commande contenait le chemin de cache, sans exclure une campagne concurrente. Ce rejet est conservé et n'est pas remplacé silencieusement.
2. Une réplication Firefox isolée, surveillée séparément, a mesuré un seul groupe et 313 278 464 octets ; elle a motivé la correction mais ne sert pas de preuve finale.
3. Le candidat intermédiaire `cb5f2b5` a tenté une sélection par PGID. Cette voie sous-comptait les XPC WebKit (quelques centaines de Kio) et est explicitement refusée comme preuve.
4. Le candidat final `9ee3f8d` acquiert avant lancement un verrou atomique global du cache, refuse tout processus épinglé préexistant, compte tous les processus du chemin attendu — y compris les XPC WebKit — puis exige leur disparition au teardown. Un test négatif confirme le refus concurrent.
5. La campagne finale complète sur ce SHA passe avec des valeurs cohérentes avec les campagnes historiques et ne laisse aucun lock/processus de qualification.

## Portée matérielle et OOM

ADR-0006 retient uniquement la classe 32+ Gio. Les classes 8 et 16–24 Gio sont des observations facultatives et non supportées ; aucune extrapolation n'est faite.

ADR-0007 rend l'OOM réel du processus facultatif et interdit l'épuisement global de l'hôte. Cette décision ne relâche ni budgets, ni KDF, ni limite 16 Mio, ni plafond WASM. Les fautes mémoire internes et la reprise processus trois moteurs restent obligatoires et passent. Le diagnostic Chromium sous cap logiciel reste `promotableEvidence:false`.

## Hashes finaux

- Chromium : `70c003480a1c0726ab50deec5c9ea658945b46a1dc517a5a26e3d43518ae72a0` ;
- Firefox : `4ef6d1d66a5dabe5b79d6b43b4a2e2469482fb17af8872d3d323c8d0343bcdd0` ;
- WebKit : `e4613e9037b3be8d4a5cb790d0370f4ebe8f7b8a4d6be9e8ae8cd4665b8a9521` ;
- résumé : `f893872c6d4e3cd901b26014facc9701a49112d957da2530e4496731b30a63ba` ;
- log : `5a47b51a1f96076c368476855f477f6ebb521e8f39102126b833526362b9d3a3`.

## Findings

- blocking : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

- un processus non coopératif démarré après le preflight peut seulement gonfler le RSS et provoquer un faux rejet ;
- aucune classe sous 32 Gio ou autre plateforme n'est qualifiée ;
- OOM processus réel reste un diagnostic facultatif ;
- l'approbation ne vaut ni activation, donnée utilisateur, production ou release.

**VERDICT: approve**
