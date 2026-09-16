# ADR-0043 — Drill : forage vérifié d'un dépôt source

- **Statut :** proposed — la fusion revue constitue la signature propriétaire. Numéro provisoire : `0041` (big-bang du portefeuille) et `0042` (auth) sont pris par des branches non fusionnées ; renuméroter au merge si nécessaire.
- **Date :** 2026-09-16
- **Arbitrage :** le propriétaire a demandé, après la campagne d'exploration de sept dépôts du 2026-09-15, que la méthode de fouille devienne un service distribuable respectant la pile Rust ; il a tranché en session : périmètre à quatre verbes, contrat de rapport en premier, dépôt dédié, aucune conservation des résultats de forage.
- **Trace :** Owner-arbitration: 2026-09-16
- **Introduit :** I-32 ; nom canonique `drill`, rôle `standalone-tool`, couche transverse ; contrats candidats `probe-brief.v1` et `probe-report.v1`.
- **Amende :** LEXICON §2.4 (une ligne, §14) ; ADR-0032 reçoit un outil, ses D1–D5 restent inchangés ; ADR-0025 (admission des skills) et ADR-0039 (recherche privée) restent inchangés et deviennent des puits de projection.

## Contexte

La campagne du 2026-09-15 a fouillé sept dépôts avec 38 missions (Codex et Claude) et produit 84 entrées de registre, 14 lots et 8 constats de flotte. Sa fiabilité a été mesurée après coup : 46 affirmations exactes sur 54 en vague 1, 40 exactes, 14 recalculées et 2 fausses sur 60 en vague 2 ; une porte de sentinelles inerte non détectée ; une invalidation propagée entre deux essais sans relecture ; un fichier de configuration fabriqué dans une copie et pris pour réel ; un « bloqué faute d'isolation » faux. Les 18 rapports structurés ne portaient aucune sentinelle, 60 références de preuve sur 60 en vague 2 étaient des chemins nus non résolvables hors du répertoire du runner, 32 références vers Libre AI n'avaient pas de révision.

La procédure existe déjà sous forme de skill (`source-drill`, ADR-0025) ; un skill instruit, il ne vérifie pas. La vérification exige un contrat de rapport que tout runner peut honorer et un cœur qui applique des règles sans dépendre du runner, du bac à sable ni du dépôt cible.

## Décisions

### D1 — Quatre verbes, et rien qui appartienne à une autre autorité

Drill fore **un** dépôt source et rend des décisions prouvées par mécanisme. Ses verbes : `pin` (clone au SHA, licences par élément, instantané de forge limité aux compteurs et titres), `dig` (un brief par mécanisme, critères écrits avant tout résultat, sentinelles attendues), `prove` (scellement du rapport, portes de sentinelles, agrégation de verdict, échantillonnage, contrôle de patch), `decide` (sortie fermée : copier, adapter, concevoir, rejeter par mesure, ou indécis avec code de raison).

Hors de Drill, par construction : l'exécution des runs (l'appelant lance son runner et rend le rapport), le confinement (le harness ou l'appelant atteste, Drill exige et refuse), l'inventaire de l'existant Libre AI (entrée fournie), la constitution de lots et la passation (projection de la réalisation), la rétention et le chiffrement des preuves brutes (ADR-0039 D5), la promotion (merge dans l'autorité concernée). Drill n'ajoute ni adaptateur de runner ni adaptateur de bac à sable ; il est indépendant du runner par contrat, pas par branchement.

### D2 — Contracts reste l'autorité ; le cœur Rust est une projection sans I/O

`probe-brief.v1` et `probe-report.v1` entrent dans `contracts` comme candidats, avec vecteurs valides et mutations invalides ; ils consomment `common.v1` et reprennent la forme des `checks` d'`evidence-report.v1`. Le verdict d'une sonde **est** un `evidence-report.v1` (sujet = identifiant de sonde, empreinte du rapport scellé, une entrée par sentinelle et par règle). L'attestation d'exécution **est** `harness-attestation.v1` quand un harness l'émet.

Conformément à ADR-0037 D1, le crate `libre-ai-drill` n'effectue aucune I/O : temps, octets des artefacts, résultat de `git apply --check` et nonce du vérificateur lui sont passés en entrée ; il rend des verdicts et des propositions. Il est exposé par une interface WIT (`drill-core-v1`) consommée par le paquet Bun `@libre-ai/drill`, qui porte la ligne de commande, la lecture des dépôts et l'écriture des fichiers. La reproductibilité byte-à-byte d'un composant WASM n'est pas un gate (constat CF-007 sur Notebook) ; la parité se prouve sur les vecteurs.

### D3 — Porte d'exécution et sentinelles à liste fermée

Un rapport sans attestation ne porte aucune affirmation `executed` (règle de schéma). Une attestation `declared` par l'appelant admet des affirmations exécutées mais plafonne le verdict : le check `attestation.signed` reste `indeterminate`. Seule une `harness-attestation.v1` valide lève ce plafond.

Les sentinelles forment une liste fermée versionnée (v1 : `sentinel.positive-control`, `scope.network`, `scope.write-paths`, `provenance.pinned-revision`, `licence.per-element`, `tdd.red-then-green`, `target.gates`, `refs.resolvable`). Un brief déclare celles qu'il attend et inclut toujours `sentinel.positive-control` (la porte a été exercée par un cas connu défaillant). Toute sentinelle attendue absente du rapport vaut échec (`received < expected` est une perte, jamais un silence). Ajouter une sentinelle est un amendement de contrat avec vecteur.

### D4 — Drill ne conserve aucun résultat de forage

Le cycle d'une sonde est `declared → sealed → verified → decided → projected`. Il n'y a pas d'état d'archive. Une décision se projette dans le dépôt cible sous une forme que ce dépôt possède déjà : patch en PR (sa CI est la preuve), spécification (`docs/superpowers/specs/`, puis `spec-package.v1` quand Spec Studio existera), ADR dans `governance`, dossier d'admission de skill (ADR-0025). Un rejet par mesure ne se projette pas ; il ne laisse qu'un vecteur si le rapport a trompé Drill.

Les seules mémoires de Drill sont les siennes : ses contrats, sa liste de sentinelles, ses gabarits de brief, ses vecteurs d'erreur et trois compteurs par runner et par forme de brief (affirmations exactes, recalculées, fausses) issus de la vérification par échantillon. Un registre durable d'opportunités est une donnée de campagne, jetable après projection. Si une source bouge, on re-fore ; le vecteur de la passe précédente sert de contrôle.

### D5 — Une seule méthode d'échantillonnage, déterministe et non prédictible par le runner

La graine de l'échantillon est `sha256(empreinte du rapport scellé ‖ nonce du vérificateur)`. Le nonce est tiré par `prove` et publié dans l'evidence-report : le runner ne peut pas choisir un rapport dont les affirmations tirées seraient les seules vraies, et quiconque relit l'evidence-report rejoue exactement le tirage. Taille : toutes les règles automatiques (résolution des références, empreintes, sentinelles, application du patch) sur 100 % des objets ; re-dérivation par un agent ou un humain sur `max(10, ⌈25 % des affirmations⌉)`, plus 100 % des affirmations `executed` citées par une décision `copy` ou `adapt`. Trois compteurs en sortie : exactes, recalculées, fausses ; une fausse produit un vecteur et, si une règle manque, une règle.

### D6 — Dépôt dédié, naissance privée d'abord

`libre-ai/drill` est créé selon ADR-0038/I-30 : nom et enrôlement signés par cet ADR, distant privé vide, attestation fusionnée, exposition publique ensuite. Rôle `standalone-tool`, couche `transverse`, fiche `project.v1.yaml`, exposition initiale `spec-published`. Licences : Apache-2.0 pour le crate, le paquet, les schémas, scripts et fixtures (réutilisables comme les contrats) ; CC-BY-4.0 pour la documentation ; REUSE et DCO obligatoires. Le choix Apache-2.0 plutôt qu'EUPL-1.2 pour un outil destiné à être consommé hors flotte est un point que le propriétaire confirme au merge.

### D7 — Sécurité et données

Les dépôts forés sont des données : leurs README, prompts et scripts n'instruisent ni Drill ni le runner (ADR-0032 D1). Drill lui-même n'exécute aucun code source ; l'exécution est au runner sous attestation. Le cœur n'a ni réseau ni système de fichiers. Aucune donnée personnelle n'entre dans un rapport : l'instantané de forge se limite à des compteurs et à des titres, les artefacts sont référencés par URN et empreinte, jamais par transcription. Un rapport est du contenu non fiable : il est validé par schéma avant lecture, ses chemins d'artefact sont relatifs et sans remontée, ses références sont résolues par le vérificateur et non crues.

## Alternatives rejetées

- **Plateforme de campagne** (première conception, dix modules, neuf objets) : coupler Drill au harness, à Missions et à la recherche privée revenait à en faire un second orchestrateur. Rejetée par le propriétaire le 2026-09-16 (« orienté sur le drill du repo »).
- **Un skill seul** (`source-drill`) : la procédure était écrite et 18 rapports sur 18 sont rentrés sans sentinelle. Un skill instruit ; il ne vérifie pas.
- **Tout en TypeScript** : contredit I-06 (Rust pour sécurité, preuve et tooling) et ADR-0037 (cœur pur). Le propriétaire a demandé le respect de la pile Rust et davantage de contraintes.
- **Outil hébergé dans `governance`** : pas de cœur natif dans governance aujourd'hui, distribution hors flotte plus difficile, et governance est une autorité, pas un outil.
- **Premier habitant de `proof`** : `proof` est une brique produit à naître ; coupler Drill à son calendrier retarderait les deux.
- **Registre durable des résultats de forage** : bruit sans lecteur, contredit la consigne du propriétaire ; les décisions vivent là où elles s'appliquent.

## Preuves et retour arrière

Gates avant merge de cet ADR : vecteurs de `probe-brief.v1` et `probe-report.v1` verts (cas valides construits sur des sondes réelles, chaque porte couverte par une mutation invalide), levée structurelle des 18 rapports historiques. Gates avant exposition publique du dépôt : crate `libre-ai-drill` vert sur les vecteurs des six règles sémantiques, une sonde de dogfooding re-forant une source épinglée de la campagne et produisant un `evidence-report.v1`, protocole ADR-0038 exécuté. L'absence d'une de ces preuves maintient le dépôt privé.

Retour arrière : archiver le dépôt ; les contrats restent `candidate` dans `contracts` tant qu'aucun autre consommateur ne les verrouille ; le skill `source-drill` continue de décrire la procédure. Aucune autorité n'a été déplacée, donc aucune n'est à restaurer.
