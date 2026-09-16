<!-- SPDX-FileCopyrightText: 2026 Libre AI contributors -->
<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# Design — Drill, forage vérifié d'un dépôt source

- **Statut :** v1, conception arbitrée en session le 2026-09-16 ; l'exécution reste soumise au plan et aux gates de gouvernance.
- **Arbitrage :** propriétaire ; périmètre à quatre verbes, contrat de rapport en premier, dépôt dédié `libre-ai/drill`, aucune conservation des résultats de forage.
- **Portée :** créer l'outil transverse qui transforme la fouille d'un dépôt externe en décisions prouvées par mécanisme, projetées dans le dépôt cible ; ne couvre ni l'orchestration des runners, ni le confinement, ni la rétention des preuves.
- **Autorités amont :** ADR-0032 (source externe = oracle non normatif, D1–D5), ADR-0037 D1 (Contracts autorité, cœur Rust sans I/O), ADR-0038/I-30 (naissance privée d'abord), ADR-0025 (admission des skills), ADR-0039 (recherche privée, puits non normatif), ADR-0022/I-24 (décisions structurées), I-06 (Rust pour sécurité, preuve, tooling), contrats `common.v1`, `evidence-report.v1`, `harness-attestation.v1`.

## 1. Problème et résultat attendu

Une campagne de fouille produit des affirmations sur du code externe, des mesures, des patches et des décisions. Sans contrat, ces affirmations ne sont vérifiables qu'à la main : la campagne du 2026-09-15 a dû relire 114 unités pour trouver 2 affirmations fausses, une porte de sentinelles inerte, une invalidation propagée à tort et un fichier fabriqué pris pour réel. Les 18 rapports structurés ne renvoyaient aucune sentinelle et 60 références de preuve sur 60 en vague 2 n'étaient pas résolvables hors du poste du runner.

Le résultat attendu est un outil qui :

1. rend indépendant du runner le rapport d'une sonde, par contrat et par vecteurs ;
2. refuse par construction ce qui n'est pas prouvable (exécution sans attestation, sentinelle manquante, référence non résolue, patch sans base) ;
3. projette chaque décision dans le dépôt cible sous une forme que ce dépôt possède déjà, et ne garde rien d'autre que ses propres erreurs ;
4. respecte la pile : cœur de preuve en Rust pur, glu en Bun/TypeScript, contrats dans `contracts`.

## 2. Décisions de conception

Quatre verbes : `pin`, `dig`, `prove`, `decide`. Quatre objets : Source, Probe, Finding, Decision. Cinq états d'une sonde : `declared → sealed → verified → decided → projected`.

| Verbe | Entrée | Sortie | Où |
| --- | --- | --- | --- |
| `pin` | URL, révision | clone au SHA, licences par élément, instantané de forge (compteurs, titres), `source.json` | paquet Bun |
| `dig` | source épinglée, mécanisme, dépôts cibles | `probe-brief.v1` : question neutre, critères succès / échec / non concluant écrits avant, sentinelles attendues, attestation minimale | paquet Bun |
| `prove` | `probe-report.v1`, brief, octets des artefacts, résultat de `git apply --check`, nonce, horloge | rapport scellé, `evidence-report.v1`, échantillon de vérification | crate Rust (WIT `drill-core-v1`) |
| `decide` | evidence-report, findings | décisions par mécanisme et projections (patch, spec, adr, skill-admission, drill-vector, none) | paquet Bun + cœur pour la cohérence |

Ce qui a été retiré de la première conception (dix modules) et pourquoi : l'inventaire de l'existant Libre AI (entrée fournie, pas une lecture de la source), les adaptateurs de runner (indépendance par contrat), les adaptateurs de bac à sable (attestation exigée, pas produite), les lots et la passation (projection de la réalisation), la rétention et le chiffrement (ADR-0039 D5), l'état d'archive (consigne propriétaire : les résultats ne sont pas une mémoire utile).

## 3. Frontière d'autorité

| Question | Qui décide | Drill |
| --- | --- | --- |
| Qu'est-ce qu'une preuve, un verdict, une attestation | `contracts` (`evidence-report.v1`, `harness-attestation.v1`) | consomme, ne redéfinit pas |
| Un run était-il confiné | le harness (attestation signée) ou l'appelant (déclaration) | exige, plafonne, refuse |
| Qu'est-ce qu'un besoin Libre AI | le dépôt cible (`project.v1.yaml`, specs, ADR) | référence par révision et chemin |
| Une décision est-elle adoptée | l'autorité concernée, par merge | projette, ne promeut pas |
| Où vivent les preuves brutes | l'appelant, ADR-0039 D5 | référence par URN et empreinte |
| Qu'est-ce qu'un rapport de sonde valide, quelles sentinelles existent, comment on échantillonne | **Drill** (contrats candidats, liste fermée, D5 d'ADR-0043) | seule autorité propre |

## 4. Modèle de menace

| Menace | Traitement |
| --- | --- |
| Instructions dans la source (README, prompts, scripts) | ADR-0032 D1 : données ; le brief le rappelle ; Drill n'exécute rien lui-même |
| Rapport forgé ou hostile (chemins de sortie, références inventées, texte long) | validation de schéma avant lecture ; chemins relatifs sans remontée ; références résolues par le vérificateur ; bornes de taille sur toute chaîne |
| Runner non confiné se déclarant exécuté | sans attestation : `executed` interdit par schéma ; attestation déclarée : verdict plafonné |
| Runner qui prédit l'échantillon | graine = empreinte du rapport ‖ nonce du vérificateur publié après scellement |
| Sentinelle inerte (porte qui ne refuse jamais) | `sentinel.positive-control` obligatoire dans tout brief : la porte doit avoir refusé un cas connu |
| Talon fabriqué dans une copie pris pour un fichier réel | référence `target` avec révision : le vérificateur résout contre `git ls-files` de la révision, pas contre la copie de travail |
| Invalidation propagée entre sondes | un objet ne change d'état que par une vérification de cet objet ; l'evidence-report est par sonde |
| Fuite de données personnelles | pas de transcription dans un rapport ; forge = compteurs et titres ; artefacts par URN et empreinte ; gates de flotte `check:personal-data` sur le dépôt |

## 5. Topologie du dépôt `libre-ai/drill`

```
crates/libre-ai-drill/        cœur pur : scellement, sentinelles, agrégation, échantillon, cohérence des décisions
contracts/wit/drill-core-v1/  interface WIT (miroir de contracts/wit/, porté dans contracts à l'admission)
packages/drill/               @libre-ai/drill : CLI pin | dig | prove | decide, lecture git, écriture des fichiers
fixtures/                     vecteurs des six règles sémantiques, cas de la campagne (sentinelle inerte, talon, invalidation)
docs/                         README, cette spec, gabarits de brief par famille de mécanisme
project.v1.yaml               fiche d'état
```

Le crate n'ouvre ni fichier, ni socket, ni horloge : le paquet lit, calcule les empreintes et passe les octets ; le crate rend des verdicts. Aucune dépendance au harness, à l'orchestrateur ni à un dépôt produit.

## 6. Contrats et états

- `probe-brief.v1` : sources épinglées, mécanisme, question neutre (≤ 400 caractères), dépôts cibles, sentinelles attendues (liste fermée, `sentinel.positive-control` obligatoire), critères écrits avant, registres et sorties autorisés, attestation minimale ; règle : attestation minimale `none` ⇒ registre `executed` interdit.
- `probe-report.v1` : sources, identité du runner, attestation (signée / déclarée / aucune), `checks` (forme d'`evidence-report.v1`), artefacts empreintés, affirmations typées à références structurées (`source`, `forge`, `target`, `artifact`), décisions à sortie fermée ; règles de schéma : sans attestation pas d'`executed` ; `execution` obligatoire si exécuté ; `reasonCode` obligatoire sur `undecided` et `reject-by-measure` ; `patch` obligatoire sur `copy` et `adapt` ; projection avec dépôt pour patch, spec, adr, skill-admission ; rejet ⇒ `drill-vector` ou `none`.
- Règles sémantiques de `prove` (hors schéma) : (1) chaque identifiant cité existe ; (2) chaque `sourceId` de référence appartient aux sources ; (3) chaque sentinelle attendue est présente, sinon `fail` `sentinel.missing` ; (4) chaque empreinte est recalculée ; (5) attestation déclarée ⇒ `attestation.signed` = `indeterminate` ; (6) le patch s'applique sur sa base.
- États : `declared` (brief émis), `sealed` (rapport reçu, empreinte calculée, plus aucune modification), `verified` (evidence-report émis), `decided` (décisions cohérentes avec l'evidence-report), `projected` (référence de la projection enregistrée dans le dépôt cible : numéro de PR, chemin de spec, numéro d'ADR). Un objet ne régresse pas ; une nouvelle passe crée une nouvelle sonde.

## 7. Boucle de retour

Chaque vérification par échantillon rend trois compteurs par runner et par gabarit de brief : exactes, recalculées, fausses. Une fausse produit un vecteur dans `fixtures/` et, si aucune règle ne l'aurait attrapée, une règle ou une sentinelle (amendement de contrat). Les compteurs de la campagne de référence sont le point zéro : vague 1, 46 exactes et 0 fausse sur 54 ; vague 2, 40 exactes, 14 recalculées, 2 fausses et 4 invérifiables sur 60. Drill publie ces compteurs dans son README par version ; c'est sa seule métrique.

## 8. Gates et stratégie de test

### 8.1 Unitaires

Crate : les six règles, l'agrégation de verdict (domination : un `fail` domine, un `indeterminate` plafonne), le scellement (empreinte stable sous réordonnancement des clés selon RFC 8785), le tirage déterministe (même graine ⇒ même échantillon ; graines distinctes ⇒ échantillons distincts sur les vecteurs), le refus de tout rapport dont une référence sort des sources.

Contrats : cas valides construits sur des sondes réelles, une mutation invalide par porte, levée structurelle des rapports historiques.

### 8.2 Focalisés

CLI : `pin` sur un clone local à révision connue rend un `source.json` reproductible ; `dig` refuse un brief sans `sentinel.positive-control` ; `prove` refuse un rapport modifié après scellement ; `decide` refuse une décision `adapt` dont le patch ne s'applique pas.

### 8.3 E2E

Re-forage d'une source épinglée de la campagne (Chisle au SHA `98e05e62…`) avec un runner réel sous attestation déclarée, jusqu'à l'evidence-report et une projection `spec` dans une copie du dépôt cible ; puis le même parcours avec un rapport volontairement altéré (sentinelle retirée, référence déplacée) qui doit sortir `fail`.

### 8.4 Smoke

`drill --version`, `drill prove` sur un vecteur valide et sur un vecteur invalide, en moins d'une seconde chacun.

## 9. Changements de gouvernance nécessaires

ADR-0043 ; LEXICON §2.4 (ligne `drill`) et §14 ; INVARIANTS I-32 ; `ecosystem/repositories.v1.yaml` (entrée `standalone-tool`, `transverse`, `private` à la naissance puis `public`) ; `contracts` : `probe-brief.v1`, `probe-report.v1`, fixtures, entrées de catalogue `candidate` (owners `drill`, consumers `drill`, `missions` à confirmer), WIT `drill-core-v1` ; skill `source-drill` : sa procédure référence désormais les contrats au lieu de décrire le format de rapport.

## 10. Ordre d'exécution et critères d'acceptation

1. Gouvernance et contrats mergés (ADR, LEXICON, INVARIANTS, schémas et vecteurs verts dans `check:contracts`).
2. Distant privé créé (ADR-0038 D1), crate et paquet écrits sous TDD, vecteurs des six règles verts, e2e du re-forage vert.
3. Attestation ADR-0038 fusionnée, exposition publique, fiche `project.v1.yaml` à `usable-verifiable`.
4. Première projection réelle : les deux défauts du module `metrics/` de Notebook et les défauts CF-004/CF-005 de sa suite e2e passent par une sonde complète jusqu'à une spec dans le dépôt cible.

Acceptation : un rapport de sonde historique (W3-02) rejoué sous le nouveau contrat produit un evidence-report dont chaque check est justifié par un artefact ; un rapport altéré est refusé ; aucune donnée de résultat n'est conservée dans `libre-ai/drill` au-delà des vecteurs.

## 11. Non-objectifs

Orchestrer des runners ; confiner une exécution ; héberger des preuves brutes ; constituer des lots ou une passation ; classer des opportunités dans un registre durable ; remplacer `proof`, `harness` ou Missions ; évaluer des skills (ADR-0025) ; envoyer quoi que ce soit en amont d'une source.
