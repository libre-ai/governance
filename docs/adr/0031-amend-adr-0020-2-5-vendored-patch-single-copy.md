# ADR-0031 — Amendement d'ADR-0020 §2.5 : un patch vendorisé vit dans le dépôt qui le qualifie, les autres workspaces le consomment en git-dep d'organisation épinglée

- **Statut :** accepted — arbitrage propriétaire du 2026-09-08 par question structurée (ADR-0022/I-24). Owner-arbitration: 2026-09-08
- **Date :** 2026-09-08
- **Portée :** amendement de la décision de sécurité ADR-0020 §2.5 (clause « le patch cryptographique `aes` suit chaque workspace final dont le graphe contient `aes` ») ; enregistrement de la forme retenue pour la migration `biscuit-auth` 6.0.0 (`authz-biscuit#12`, `ecosystem-engine#13`, dossier `docs/reviews/biscuit-auth-6/`).
- **Étend :** ADR-0020 §2.1 (git-deps inter-repos épinglées par SHA), §2.5 (bornes de sécurité des git-deps), I-05 (copies vendorées = projections vérifiées, jamais éditées à la main).
- **Amende :** ADR-0020 §2.5, la seule clause de localisation du patch vendorisé ; les autres bornes de §2.5 (`allow-org`, pin-SHA + revue, quarantaine des registres) restent en vigueur inchangées.

## Contexte

ADR-0020 §2.5 a fixé, pour le seul cas connu à l'époque (`aes` durci dans
`notebook`), que « le patch cryptographique `aes` suit chaque workspace final
dont le graphe contient `aes` » : une copie par consommateur, la copie voyageant
avec son `PATCH.md`.

La migration `biscuit-auth` 5.0.0 → 6.0.0 (2026-09-08) a produit le second cas :
l'archive publiée 6.0.0 ne compile pas avec `default-features = false`
(eclipse-biscuit/biscuit-rust#305), le correctif amont #306 est fusionné mais
non publié, et la Voie A retenue par le propriétaire vendorise « archive + diff
#306 » sous `[patch.crates-io]`. Deux workspaces consomment `biscuit-auth` :
`authz-biscuit` (dépendance runtime, brique couche 3 qui porte la qualification,
la preuve d'injectivité et le gate de provenance) et `ecosystem-engine`
(dev-dependency, exécution de vecteurs).

La passe K4 architecture du round 1 (`docs/reviews/biscuit-auth-6/81ce4b5/`)
a relevé que la forme livrée par `ecosystem-engine#13` — une seule copie dans
la flotte, consommée par
`biscuit-auth = { git = "https://github.com/libre-ai/authz-biscuit", rev = "<sha>" }`
— contredit la lettre de §2.5, et qu'elle a deux modes de défaillance non
documentés : un `rev` épinglé sur une branche de fonctionnalité continue de
résoudre indéfiniment (GitHub conserve les refs de pull request) sans jamais
signaler que `main` du producteur ne contient pas le code consommé ; et cargo
résout un paquet git par balayage du dépôt, de sorte qu'une seconde copie du
même nom (état naturel d'une requalification 7.0) est choisie par ordre de
parcours avec un simple avertissement. Le choix entre « une copie par
consommateur » (§2.5 littéral) et « une copie, consommée en git-dep » est une
décision de sécurité, pas une remédiation : d'où cet amendement.

## Décisions

### D1 — Un patch vendorisé vit dans le dépôt qui le qualifie

Un crate vendorisé avec un diff local (`third_party/<crate>-<version>/` +
`PATCH.md`) a **un seul foyer dans la flotte** : le dépôt qui en porte la
qualification — preuve de sécurité, gate de provenance (téléchargement de
l'archive, vérification du SHA-256 déclaré, application du diff commité,
`diff -r` avec l'arbre), condition de retrait. Pour `biscuit-auth` 6.0.0 c'est
`authz-biscuit`. Une seconde copie dans un autre dépôt n'est jamais créée : deux
copies « byte-égales » sont deux arbres à maintenir égaux à la main, et la
dérive entre elles n'a aucun gate qui la voie.

Le cas `aes` de §2.5 n'est pas contredit : `notebook` est aujourd'hui l'unique
workspace dont le graphe contient `aes`, il est donc à la fois foyer et seul
consommateur. Le jour où un second workspace en aurait besoin, D2 s'applique.

### D2 — Les autres workspaces le consomment en git-dep d'organisation épinglée par `rev`

Un consommateur secondaire écrit
`<crate> = { git = "https://github.com/libre-ai/<foyer>", rev = "<sha complet>" }`
dans son `[patch.crates-io]`, sous les bornes déjà posées par §2.5 :
`[sources.allow-org] github = ["libre-ai"]` dans son `deny.toml`, un SHA
complet, jamais une branche, et chaque bump de `rev` par pull request revue.
Le foyer ne contient qu'une copie du paquet, ce qui rend la résolution par
balayage de cargo déterministe ; l'avertissement `skipping duplicate package`
de cargo est traité comme une erreur par la revue.

### D3 — Un gate de `rev` orphelin est requis chez chaque consommateur

Chaque consommateur secondaire porte un gate bloquant, exécuté dans son
`bun run check`, qui échoue si le `rev` d'un patch git intra-organisation
n'est pas un commit joignable depuis `main` du foyer — statut `identical` ou
`behind` de l'API GitHub `compare/main...<rev>` acceptés, `ahead` ou
`diverged` refusés, impossibilité de vérifier refusée aussi (un gate muet
n'est pas un gate). Réalisation de référence :
`ecosystem-engine/scripts/check-patch-rev.ts` (`check:patch-rev`).

Conséquence assumée : une pull request du consommateur qui épingle la tête
d'une branche non fusionnée du foyer est **rouge par construction** jusqu'au
re-pin. Séquence de re-pin après squash-merge de la pull request du foyer :
lire le commit de merge sur `main` du foyer, remplacer `rev`,
`cargo update -p <crate>` (ce seul paquet), rejouer le gate, ouvrir la pull
request de bump. La pull request du consommateur ne fusionne jamais avant celle
du foyer.

### D4 — La copie reste archive + diff, prouvé à chaque exécution

La copie vendorisée n'est éditée qu'à travers son diff commité
(`third_party/patches/<crate>-<version>-<origine>.diff`) ; aucun `#![allow]`,
aucune retouche locale, aucune suppression de fichier (les fichiers que des
`.gitignore` globaux excluent, tel `Cargo.toml.orig`, sont suivis avec
`git add -f`). Le gate de provenance du foyer est bloquant en CI et rejouable
localement par une commande unique documentée dans `PATCH.md`. Les
avertissements amont que la copie émet sous le jeu de features réduit sont
consignés dans `PATCH.md`, jamais réduits au silence dans l'arbre.

## Invariants

Aucun invariant nouveau. **I-05** s'applique : une copie vendorisée est une
projection vérifiée par gate, jamais éditée à la main, jamais canonique — le
gate de provenance de D4 en est l'exécutant pour un crate patché, comme
`check:schemas` l'est pour les contrats. Les bornes de sécurité d'ADR-0020 §2.5
(`allow-org`, pin-SHA + revue, quarantaine des registres) restent la source
d'arbitrage des git-deps ; cet ADR n'en amende que la clause de localisation.

## Conséquences

- ADR-0020 §2.5 se lit désormais avec D1–D3 : la clause « suit chaque
  workspace final » vaut pour le foyer ; les consommateurs secondaires passent
  par D2 + D3.
- `authz-biscuit` porte la copie de `biscuit-auth` 6.0.0, son `PATCH.md`, le
  diff commité et le gate de provenance (`scripts/verify-vendored-biscuit-auth.sh`).
- `ecosystem-engine` consomme par git-dep `rev`-épinglée et porte le gate de
  `rev` orphelin ; sa pull request reste rouge jusqu'au re-pin qui suit le merge
  du foyer.
- La note de qualification
  `docs/reviews/agent-orchestration-contracts-v1/DEPENDENCY-QUALIFICATION-BISCUIT-AUTH.md`
  cite cet ADR pour la forme et ne se réclame plus du précédent `aes` seul.
- Retrait : la copie et son `[patch.crates-io]` disparaissent chez le foyer,
  puis chez chaque consommateur (qui revient à la version de registre), dès
  qu'une version publiée incluant le correctif est qualifiée — pour
  `biscuit-auth`, la ligne 7.0, dont la rupture d'API cryptographique impose sa
  propre qualification.
