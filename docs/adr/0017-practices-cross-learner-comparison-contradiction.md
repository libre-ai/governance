# ADR-0017 — Contradiction sur la comparaison inter-apprenants (Practices)

- **Statut :** proposed — question ouverte ; aucune option n'est retenue par cet ADR
- **Date :** 2026-07-25
- **Arbitrage :** en attente de décision propriétaire. Cet ADR formule la question et ses options avec leurs conséquences ; il ne tranche pas.
- **Portée :** spécification produit Practices — `docs/apps/practices.md`, `contracts/openapi/practices.v1.yaml`, garde-fou `tools/quality/check-no-transmission.ts`
- **Origine :** revue du 2026-07-25 d'une branche locale jamais poussée du dépôt `ai-practices`, dont l'archivage a fait apparaître une contradiction entre deux artefacts ratifiés vivants.
- **Frontière de contexte :** `libre-ai/ai-practices` est un dépôt **distinct et gelé**. Cet ADR vit dans le monorepo, qui est la vérité produit ; il **ne modifie rien** dans l'autre dépôt et n'établit aucune couture entre les deux.

## Contexte

Deux artefacts ratifiés, tous deux publics et vivants, disent l'inverse l'un de l'autre.

**Côté `ai-practices` (dépôt gelé).** `docs/adrs/0009-cohorte-per-item-k-anon.md` est présent sur la branche par défaut, au statut « Acceptée ». Il étend un ADR antérieur de la granularité par axe à la granularité **par item** : une distribution anonyme affichée à chaque choix (« X % ont jugé cette image non biaisée »), masquée sous un seuil `k = 5`, sans classement nominatif ni streak, avec idempotence par identifiant client opaque, purge de rétention et dégradation hors ligne gracieuse. Sa justification est pédagogique et explicite : montrer que le piège fonctionne sur la majorité, pour déculpabiliser l'apprenant.

**Côté monorepo (vérité produit).** Quatre éléments concordants ferment la même fonction :

- `docs/apps/practices.md` §Non-goals : « nominative leaderboard **or cross-learner comparison** » ;
- le même document : « Practices **v1** stores no learner aggregate on the server. Raw answers and progress are never uploaded » ; le stockage serveur est réservé à la revue et à la publication d'organisation ;
- le code de refus `practices.nominative_aggregate_forbidden` est implémenté (`apps/practices/src/domain/activity-outcome.ts`), et `contracts/openapi/practices.v1.yaml` n'expose aucune route de session ou de réponse ;
- `tools/quality/check-no-transmission.ts` interdit en CI, en mode fail-closed, toute primitive réseau dans `apps/practices` — le fichier prévoit explicitement que le desserrage soit un acte délibéré.

`docs/parity/audits/PARITY-practices-datacamp.md` enregistre par ailleurs « Zéro cross-learner visibility » comme accepté par conception.

**Ce qui rend la contradiction réelle plutôt qu'apparente.** L'ADR de l'autre dépôt n'est pas un brouillon abandonné : il est accepté, publié sur une branche par défaut publique, et il porte une thèse pédagogique que le non-objectif du monorepo neutralise sans l'avoir examinée. Symétriquement, la fonction n'a jamais été implémentée dans ce dépôt gelé — seule la cohorte par axe y existe — et le monorepo ne l'inscrit nulle part comme manque : ni le document de parité, ni l'inventaire (`ecosystem/repositories.v1.yaml`, `lifecycle: frozen-until-wave-4`) ne la listent comme attendue. Elle est hors carte des deux côtés, tout en étant ratifiée d'un côté et interdite de l'autre.

Deux lectures coexistent, et aucune n'est manifestement fausse :

- **lecture stricte** — le non-objectif « cross-learner comparison » est écrit sans qualificatif, le garde-fou CI est fail-closed, donc la fonction est fermée ;
- **lecture nuancée** — « Practices **v1** stores no learner aggregate » est une contrainte de phase et non un interdit définitif, et un agrégat k-anonyme non nominatif n'est ni un classement ni une comparaison identifiante.

## Question posée

> L'ADR `0009-cohorte-per-item-k-anon` du dépôt gelé `ai-practices`, au statut accepté, et le non-objectif « cross-learner comparison » de `docs/apps/practices.md` se contredisent. Lequel fait foi pour Practices, et sous quelle forme la contradiction est-elle refermée ?

## Options

### Option A — abroger l'ADR de l'autre dépôt

Enregistrer que le non-objectif du monorepo remplace l'ADR par item, et le marquer comme remplacé.

- **Ce qu'elle apporte :** la spécification du monorepo devient sans ambiguïté ; le garde-fou `check-no-transmission` reste fail-closed sans exception ; Practices reste intégralement local, ce qui est aujourd'hui sa propriété la plus démontrable.
- **Conséquence à instruire :** l'artefact à abroger vit dans un dépôt **gelé**, dont le périmètre exclut le développement produit jusqu'à activation. L'abrogation exige donc soit une action dans ce dépôt — qui sort du gel —, soit une supersession enregistrée dans le seul monorepo, laquelle laisse le document public de l'autre dépôt inchangé et donc toujours contradictoire pour un lecteur extérieur. Le choix entre ces deux voies fait partie de l'option.
- **Ce qu'elle coûte :** la thèse pédagogique du document abrogé disparaît sans avoir été examinée au fond.

### Option B — qualifier le non-objectif et prévoir une exception motivée

Réécrire le non-objectif en « comparaison inter-apprenants **nominative ou identifiante** » et inscrire l'agrégat k-anonyme comme fonction postérieure à la v1.

- **Ce qu'elle apporte :** les deux artefacts sont réconciliés sans en abroger aucun ; la thèse pédagogique est conservée comme option future explicite.
- **Ce qu'elle exige :** une exception motivée au garde-fou `check-no-transmission` — le fichier prévoit ce cas, à condition qu'il soit délibéré —, plus un point de terminaison, un schéma de contrat et le régime de rétention associé.
- **Ce qu'elle coûte sur l'axe sécurité :** elle rompt l'invariant « local uniquement », qui est aujourd'hui la garantie de Practices la plus directement démontrable, au profit d'une garantie de second rang (k-anonymat côté serveur). Un agrégat k-anonyme reste un transfert : la propriété prouvée passe de « rien ne sort » à « ce qui sort est masqué sous un seuil ».

### Option C — statu quo documenté

Laisser l'ADR de l'autre dépôt dormant, borné à ce dépôt gelé, et inscrire la contradiction dans le dossier de réveil de la vague 4, où l'arbitrage sera repris.

- **Ce qu'elle apporte :** aucune modification de spécification, aucun desserrage de garde-fou, et une décision prise au moment où l'état réel du produit l'informe. Practices est aujourd'hui arrêté à un incrément sans surface d'entrée ni réseau, et les éléments de preuve attendus par l'inventaire portent sur d'autres fonctions.
- **Ce qu'elle coûte :** la contradiction demeure latente entre deux documents publics, et se représentera mécaniquement à l'activation.

## Ce que cet ADR ne tranche pas

Aucune option n'est retenue. Aucun non-objectif n'est réécrit, aucun garde-fou n'est desserré, aucun statut d'ADR n'est modifié dans un autre dépôt par le présent document. La question de savoir si « v1 » qualifie une phase ou un principe durable est elle-même une part de l'arbitrage, et non un acquis de cet ADR.
