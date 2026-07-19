# Gate B — revue VIE PRIVÉE FRANCE/UE — Notebook Core v2

- `reviewPassId` : `notebook-core-v2-gate-b-privacy-france-eu-9ee3f8d-04`
- rôle : privacy-france-eu
- mode : `review-only`
- date : `2026-07-18`
- commit revu : `9ee3f8da65afce9bce8da98baac72c1aea8bd0ce`
- arbre : `843a95252eb60f08fdc596a20bcbcd19a0b1b4fd`
- base : `895c749df676bf46bc85ee556680025b55c028ff`
- agent/session/provider/modèle : non exposés par le harness

## Portée

Passe dédiée, sans modification, sur minimisation, local-only, données de preuve, bootstrap, logs, métriques matérielles et conséquences de la politique OOM. Elle ne vaut pas revue juridique de release ni autorisation de traitement utilisateur.

## Constat

1. **Fixtures uniquement.** Toutes les campagnes utilisent les vecteurs publics et les octets déterministes `0x5a`. Aucun notebook, backup réel, compte, tenant ou donnée personnelle n'est ouvert.
2. **Local-only.** Le host ne transmet aucun contenu. Les routes Playwright bloquent les origines externes ; aucune télémétrie ou requête runtime n'est ajoutée.
3. **Rapports minimisés.** Les JSON contiennent modèle générique, mémoire, CPU, OS, versions, temps et RSS. Aucun numéro de série, UUID, nom de compte, chemin HOME, IP, identifiant Apple ou identifiant matériel unique n'est archivé.
4. **Lock local non publié.** Le fichier propriétaire du lock de performance ne contient que PID éphémère et commit, reste sous le cache local et est supprimé au teardown. Les commandes `ps` ne sont pas écrites dans les preuves.
5. **OOM facultatif.** Renoncer à provoquer une saturation globale réduit le risque de swap, crash d'autres applications et exposition involontaire d'état local. Aucun signal n'est rebaptisé ou surcrédité.
6. **Matières sensibles.** Recovery/plaintext sont détenus transitoirement, transférés au worker et effacés best-effort. IndexedDB ne conserve que l'enveloppe/staging chiffrés ; aucun recovery ou plaintext n'est journalisé.
7. **Package hors ligne.** Le bootstrap est vérifié par SHA-256 et ne contient aucune donnée d'exécution. Les CDN Playwright non européens restent une exception publique ponctuelle documentée ; la remise hors ligne évite tout appel depuis la machine de qualification.
8. **Support matériel sans collecte runtime.** Le minimum 32+ Gio est documentaire et qualifié. L'application ne collecte ni ne transmet la mémoire pour profiler l'utilisateur ; 8/16–24 Gio restent facultatives et non supportées.
9. **Finalités séparées.** Gate B fixture-only ne constitue pas une base légale, un lancement produit ou une autorisation de sauvegarde utilisateur. Ces décisions restent sous contrôle propriétaire ultérieur.

## Preuves reproduites

- source scanner, tests, audit et REUSE verts ;
- E2E/fautes/storage sans requête externe ni diagnostic privé ;
- inspection des JSON performance/fault/storage et du package : aucune PII ou donnée utilisateur ;
- package final réextrait dans un HOME/cache vierges et toolchains revérifiées.

## Findings

- blocking : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

- l'effacement physique RAM/swap/OS n'est pas garanti ;
- les copies exportées futures resteront sous contrôle explicite de l'utilisateur ;
- l'exception de bootstrap Playwright doit rester sans donnée runtime ;
- production, données personnelles, infrastructure et release exigent leurs contrôles France/UE séparés.

**VERDICT: approve**
