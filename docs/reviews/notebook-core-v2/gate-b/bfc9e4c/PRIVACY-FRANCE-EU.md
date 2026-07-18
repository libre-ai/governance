# Gate B — revue PRIVACY / FRANCE-EU — Notebook Core v2

## Attribution

- `reviewPassId` : `notebook-core-v2-gate-b-privacy-france-eu-bfc9e4c-04`
- rôle : `privacy-france-eu`
- mode : passe `review-only`
- date : `2026-07-18`
- commit : `bfc9e4c77082528889ea953cc941a5312edc9b8f`
- arbre : `2da08f9af377d1789ef90394f482c00f245e9f73`
- identifiants agent/session/provider/modèle : non exposés par le harness

Aucun fichier n'a été modifié pendant cette passe.

## Données et flux

Le candidat ne change aucun traitement de contenu. La tranche reste fixture-only, local-only, désactivée et sans télémétrie. Les rapports contiennent uniquement modèle matériel générique, mémoire, CPU, OS, versions moteur, timings et RSS ; le scan ne trouve aucun chemin personnel, compte, numéro de série, UUID, notebook ou sauvegarde réelle.

- recovery absent des enveloppes publiques, noms, logs et IndexedDB ;
- aucune requête externe pendant E2E, faults, storage ou performance ;
- bundle offline : `runtimeData:none`, cinq archives publiques vérifiées, SHA-256 global `ee49d42c23a8937f44bcf46c5973a13a0c6eac27d7360ab95617bf17c3771e86` ;
- les URL Playwright non européennes sont déclarées comme bootstrap ponctuel, puis le paquet est remis hors ligne ;
- aucune dépendance SaaS, cloud, stockage externe ou nouvelle licence n'est ajoutée au produit.

## Gouvernance de support

L'ADR-0006 ne masque aucune donnée manquante : 8 Gio et 16–24 Gio restent non supportés et leurs contributions sont facultatives. L'application ne collecte pas la mémoire physique pour appliquer ce support. Les issues #98/#99 demandent uniquement des métadonnées matérielles génériques et des fixtures publiques.

## Findings

- blocking vie privée : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

L'effacement physique RAM/swap/OS reste hors capacité de preuve de l'application. Toute future donnée utilisateur, synchronisation, télémétrie ou offline exigera une gate vie privée additive.

**VERDICT: approve**
