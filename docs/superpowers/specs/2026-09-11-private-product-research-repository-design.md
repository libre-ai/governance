<!-- SPDX-FileCopyrightText: 2026 Libre AI contributors -->
<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# Design — Dépôt privé de recherche produit

- **Statut :** v1, conception approuvée en session le 2026-09-11 ; l'exécution reste soumise au plan et aux gates de gouvernance.
- **Arbitrage :** propriétaire, recherche produit menée jusqu'au 2026-09-11 ; architecture à deux plans, GitHub privé et propriété organisationnelle retenus explicitement.
- **Portée :** création de `libre-ai/product-research`, dépôt administratif privé hors portfolio ; promotion contrôlée de ses décisions vers les autorités publiques existantes.
- **Autorités amont :** ADR-0008 (topologie et noms), ADR-0009 (portfolio public), ADR-0012 (données personnelles), ADR-0020 (activation multi-repo), ADR-0022/I-24 (contexte explicite et décisions structurées), ADR-0024 §2.3 (préservation vérifiée d'une recherche), I-02, I-03, I-04, I-05, I-12 et I-15.

## 1. Problème et résultat attendu

La recherche produit de Libre AI produit des hypothèses, des arbitrages, des
sources, des objections et des narratifs qui ne sont ni du code ni encore de
la doctrine. Les laisser dans une conversation les rend difficiles à relire,
à contredire, à dater et à promouvoir. Les copier directement dans
`governance` créerait le défaut inverse : une hypothèse commerciale prendrait
la forme d'une décision normative avant arbitrage.

Le résultat attendu est un historique Git durable et exploitable qui :

1. distingue sans ambiguïté recherche et autorité ;
2. conserve les alternatives rejetées et la preuve qui a changé une décision ;
3. permet de promouvoir une décision acceptée sans créer une seconde autorité ;
4. interdit les secrets, données client, données classifiées et données
   personnelles identifiantes dans GitHub ;
5. reste exportable et restaurable sans dépendance irréversible à GitHub.

## 2. Décisions de conception

| # | Décision | Conséquence |
| --- | --- | --- |
| D1 | Architecture à deux plans. | `product-research` conserve la recherche non normative ; `governance` et `contracts` restent les seules autorités. |
| D2 | Dépôt GitHub privé appartenant à l'organisation `libre-ai`. | Le capital produit appartient à l'organisation, mais GitHub constitue une exception de souveraineté explicite. |
| D3 | Dépôt administratif hors portfolio public. | Il n'a ni promesse produit, ni page vitrine, ni métrique de maturité commerciale. Son existence est enregistrée par la gouvernance sans exposer son contenu. |
| D4 | Nom canonique `product-research`. | ADR-0008 et `LEXICON.md` doivent être amendés avant la création distante ; aucun nom hors carte n'est créé silencieusement. |
| D5 | Classification maximale `internal`. | `confidential`, données personnelles identifiantes, secrets et données classifiées sont refusés, pas seulement signalés. |
| D6 | Promotion par référence exacte au commit d'autorité. | Un item ne devient `promoted` qu'après merge dans l'autorité et enregistrement du repository, du chemin et du SHA. |
| D7 | GitHub n'est jamais l'unique copie. | Chaque état promu produit un bundle Git chiffré, vérifié par restauration et accompagné d'un manifeste SHA-256. |

## 3. Frontière d'autorité

`product-research` est une **source de travail**, jamais une source de vérité
normative. Les verbes « exige », « garantit », « est conforme » et
« certifie » n'y deviennent opposables que lorsqu'ils citent une autorité
existante. Une projection publique ne peut pas renforcer le sens de sa
source.

Le flux de promotion est unidirectionnel :

```text
session assainie
  -> hypothèse documentée
  -> preuve contradictoire ou favorable
  -> décision proposée
  -> arbitrage propriétaire
  -> ADR / invariant / contrat dans son autorité
  -> merge de l'autorité
  -> item marqué promoted avec chemin + SHA exacts
  -> projection publique éventuelle
```

Le contenu promu n'est pas recopié comme une deuxième décision dans le dépôt
de recherche. L'item garde une synthèse historique et pointe vers l'autorité.
Une autorité retirée ou réécrite rend le lien invalide et bloque le gate.

## 4. Classification et modèle de menace

### 4.1 Contenu admis

- synthèses assainies de sessions ;
- hypothèses de problème, offre, marché ou distribution ;
- objections, alternatives et décisions rejetées ;
- références vers des sources publiques ;
- mesures agrégées ou scénarios fictifs explicitement marqués comme tels ;
- narratifs de vente dont chaque affirmation factuelle porte sa source ou son
  statut d'hypothèse ;
- liens opaques vers une preuve conservée hors GitHub.

### 4.2 Contenu interdit

- clé, jeton, mot de passe, certificat privé ou secret d'exploitation ;
- nom, courriel, téléphone, voix, verbatim identifiable ou autre donnée
  personnelle d'un prospect, client, partenaire ou salarié ;
- document client, contrat confidentiel, code client ou topologie client ;
- information classifiée, diffusion restreinte ou couverte par une habilitation ;
- export brut de conversation contenant un des éléments précédents ;
- promesse réglementaire non bornée par un périmètre et une preuve.

Le dépôt ne définit donc pas un niveau `confidential`. Une information qui
nécessiterait ce niveau est stockée dans un coffre chiffré séparé. Le dépôt
ne conserve qu'un identifiant opaque, une empreinte cryptographique, une
classe de source et une date de vérification. L'identifiant ne contient ni
nom de client ni information métier déductible.

### 4.3 Menaces traitées

| Menace | Contrôle |
| --- | --- |
| Compromission d'un compte | 2FA forte obligatoire, accès nominatif, moindre privilège, deux moyens de récupération hors ligne indépendants pour chaque propriétaire. |
| Copie persistante par un collaborateur | Forks privés interdits, accès limité, révocation auditée ; risque résiduel des clones locaux documenté. |
| Fuite par CI ou dépendance | Actions limitées au repository, actions autorisées explicitement et épinglées par SHA, jeton en lecture seule, logs sans contenu de recherche. |
| Secret ou PII commis par erreur | Validation locale avant commit, gate de contenu au merge, revue obligatoire ; en cas d'incident, révocation du secret et réécriture traitées comme incident, jamais comme simple suppression de fichier. |
| Perte ou verrouillage fournisseur | Bundle Git complet chiffré, manifeste SHA-256, restauration réelle et `git fsck --full`. |
| Hypothèse présentée comme doctrine | Statut obligatoire, vocabulaire contrôlé et lien exact vers l'autorité pour `promoted`. |
| Injection provenant d'une source | Tout contenu externe est traité comme donnée non fiable ; aucune instruction extraite d'une source n'est exécutée. |

## 5. Topologie du dépôt

```text
product-research/
├── README.md
├── AGENTS.md
├── LICENSES/
├── REUSE.toml
├── registry/
│   ├── research-items.v1.json
│   └── sources.v1.json
├── schemas/
│   ├── research-item.v1.schema.json
│   └── source.v1.schema.json
├── sources/
│   └── README.md
├── sessions/
│   └── YYYY-MM-DD-topic/
│       └── synthesis.md
├── hypotheses/
├── offers/
├── market/
├── regulatory-mappings/
├── narratives/
├── decisions/
│   ├── proposed/
│   ├── rejected/
│   └── promoted/
├── scripts/
│   ├── check-research.ts
│   └── export-verified-bundle.sh
├── tests/
│   ├── check-research.test.ts
│   └── fixtures/
└── .github/
    ├── CODEOWNERS
    └── workflows/quality.yml
```

Les documents et le registre sont en CC-BY-4.0. Les schémas, scripts et
fixtures sont en Apache-2.0. Le dépôt est conforme REUSE et DCO. Il ne porte
aucune licence de code produit EUPL-1.2, car il ne contient pas de produit.

## 6. Registre et états

`registry/research-items.v1.json` est la vue machine de chaque élément. Le
contenu narratif vit dans un fichier ciblé ; le registre en fixe l'identité,
le statut, la classification et la traçabilité.

```json
{
  "schema_version": 1,
  "items": [
    {
      "id": "RSH-0001",
      "title": "Example research item",
      "kind": "offer",
      "status": "hypothesis",
      "classification": "internal",
      "summary": "A falsifiable one-sentence hypothesis.",
      "content_path": "offers/RSH-0001-example.md",
      "evidence_refs": ["SRC-0001"],
      "created_on": "2026-09-11",
      "last_verified_on": "2026-09-11",
      "authority": null
    }
  ]
}
```

Valeurs fermées :

- `kind` : `problem`, `offer`, `market`, `regulatory-mapping`, `narrative`,
  `decision` ;
- `status` : `hypothesis`, `supported`, `rejected`, `promoted`, `superseded` ;
- `classification` : `public`, `internal` ;
- `authority` : `null`, sauf pour `promoted`, qui exige `repository`, `path`
  et un SHA Git complet de 40 caractères.

Un item `supported` reste une conclusion de recherche réfutable. Seul
`promoted` signifie qu'une autorité a accepté une décision, sans donner au
dépôt de recherche une valeur normative.

`registry/sources.v1.json` résout chaque `evidence_refs` vers une source
typée :

```json
{
  "schema_version": 1,
  "sources": [
    {
      "id": "SRC-0001",
      "kind": "public-url",
      "title": "A public source title",
      "locator": "https://example.org/source",
      "observed_on": "2026-09-11"
    }
  ]
}
```

Valeurs fermées de `kind` : `public-url`, `internal-observation` et
`external-vault`. `public-url` exige une URL HTTPS. `internal-observation`
porte uniquement une synthèse assainie dans `sources/README.md`.
`external-vault` exige un identifiant opaque et une empreinte SHA-256, sans
nom de client ni chemin local. Toute référence absente, dupliquée ou non
conforme bloque le gate.

## 7. Contrôles GitHub

Le repository est créé privé, avec les fonctions suivantes désactivées :
forking, wiki, discussions et GitHub Pages. Les issues restent désactivées
tant qu'aucun besoin distinct du registre n'est démontré.

L'accès initial est limité aux propriétaires nécessaires. La règle de merge
sur `main` interdit suppression et force push, exige une pull request et le
gate `quality`. L'organisation ne comptant qu'un membre à la conception, une
approbation GitHub obligatoire rendrait chaque pull request impossible à
fusionner : l'auteur ne peut pas s'auto-approuver. Jusqu'à l'arrivée d'un
relecteur indépendant, la revue est matérialisée dans la pull request par un
artefact de revue ou un marqueur `Owner-arbitration: YYYY-MM-DD`, sur le même
patron que `governance`. Le nombre d'approbations requises reste donc à zéro ;
il passe à un uniquement lorsque deux identités humaines indépendantes sont
effectivement disponibles. Les administrateurs ne contournent pas les autres
règles en fonctionnement normal.

Le workflow `quality.yml` :

- utilise uniquement des actions explicitement autorisées et épinglées à un
  SHA complet ;
- fixe `permissions: contents: read` par défaut ;
- valide schéma, chemins, identifiants, transitions d'état, références
  d'autorité, licences et contenu interdit ;
- ne journalise jamais le corps d'un document, seulement un code de règle et
  un chemin sans donnée personnelle ;
- ne reçoit aucun secret de repository.

Le secret scanning GitHub pour les dépôts privés dépend d'une offre payante.
Il est un contrôle de défense en profondeur s'il est disponible, jamais une
précondition cachée ni le seul scanner.

## 8. Exception de souveraineté

GitHub.com est un service propriétaire d'une entreprise américaine et stocke
par défaut ses données aux États-Unis. Il ne satisfait donc ni le critère
« entreprise UE », ni le critère « open source », ni le critère
« hébergement souverain ». GitHub Enterprise Cloud peut fournir une région de
données UE, mais reste opéré par une entreprise américaine et documente que
certaines données peuvent être stockées hors région.

L'exception est acceptée uniquement parce que le dépôt refuse les contenus
confidentiels, personnels, clients et classifiés. Le format Git natif, les
fichiers Markdown/JSON et les bundles complets maintiennent une sortie sans
conversion propriétaire. Une migration vers une forge UE ou auto-hébergée ne
change ni le schéma ni l'historique.

Sources de contrôle, vérifiées le 2026-09-11 :

- [GitHub — résidence des données](https://docs.github.com/en/enterprise-cloud%40latest/admin/data-residency/about-storage-of-your-data-with-data-residency) ;
- [GitHub — 2FA d'organisation](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-two-factor-authentication-for-your-organization/requiring-two-factor-authentication-in-your-organization) ;
- [GitHub — politique de forks privés](https://docs.github.com/en/organizations/managing-organization-settings/managing-the-forking-policy-for-your-organization) ;
- [GitHub — politique Actions](https://docs.github.com/en/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization) ;
- [GitHub — disponibilité du secret scanning privé](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/detect-secret-leaks/enable-secret-scanning).

## 9. Sauvegarde et restauration

Une promotion vers une autorité déclenche la production locale de :

1. `git bundle create product-research-<sha>.bundle --all` ;
2. vérification par `git bundle verify` ;
3. clone dans un répertoire temporaire depuis le bundle ;
4. `git fsck --full` dans le clone ;
5. manifeste SHA-256 couvrant le bundle et le rapport de vérification ;
6. chiffrement du lot avec `age` 1.3.2, épinglé et vérifié par son empreinte de
   distribution, vers un destinataire X25519 dont l'identité reste hors GitHub ;
7. copie sur deux supports indépendants dont au moins un stockage UE.

Le script échoue fermé : une étape incomplète ne produit jamais un artefact
marqué restaurable. Aucun bundle ni manifeste chiffré n'est commis dans le
repository. Un exercice de restauration accompagne toute rotation de clé ou
changement de support.

`age` est un outil et un format ouverts sous licence BSD-3-Clause. Deux copies
hors ligne indépendantes de l'identité X25519 assurent la récupération ; ni
l'identité privée ni une phrase secrète ne transitent dans une variable CI.

## 10. Gates et stratégie de test

### 10.1 Tests unitaires

- validation positive de chaque `kind`, `status` et `classification` ;
- rejet des champs inconnus, identifiants dupliqués et chemins hors dépôt ;
- rejet d'une `evidence_refs` absente du registre de sources ;
- validation HTTPS des sources publiques et exigence d'une empreinte SHA-256
  pour les références de coffre externe ;
- rejet de `confidential` et de toute autorité incomplète ;
- transitions autorisées : `hypothesis -> supported|rejected`,
  `supported -> promoted|rejected|superseded`, `promoted -> superseded` ;
- détection déterministe des patrons de secret et de données personnelles
  explicitement interdits ;
- messages d'erreur sans reproduction du contenu détecté.

### 10.2 Tests focalisés

- fixtures valides et invalides exécutées par le même CLI que la CI ;
- contrôle de l'existence et de l'unicité de chaque `content_path` ;
- vérification d'un SHA d'autorité dans un clone local de fixture ;
- génération puis vérification d'un bundle dans un dépôt Git temporaire.

### 10.3 E2E

- scénario complet hypothèse → supported → promotion simulée → promoted ;
- rejet E2E d'un document contenant un secret factice et une identité factice ;
- restauration E2E d'un bundle chiffré avec clé de test éphémère ;
- smoke de clone propre : installation, `bun run check`, résultat vert sans
  accès à un secret.

Le scanner par motifs réduit le risque mais ne prouve pas l'absence de PII.
La revue humaine obligatoire reste donc un contrôle de sécurité, et le dépôt
n'accepte pas les exports bruts.

## 11. Changements de gouvernance nécessaires

Avant la création distante :

1. un ADR amende ADR-0008/ADR-0020 pour introduire la catégorie
   `administrative-private`, hors portfolio mais dans la flotte contrôlée ;
2. `docs/decisions/LEXICON.md` admet le nom `product-research` pour ce seul
   rôle ;
3. `docs/README.md` déclare le dépôt comme source non normative de recherche
   et maintient `governance`/`contracts` comme autorités uniques ;
4. `ecosystem/repositories.v1.yaml` enregistre le dépôt avec
   `visibility: private`, sans fiche projet publique ni exposition ;
5. les validateurs de flotte traitent explicitement le rôle privé au lieu de
   le sauter silencieusement ; leurs tests positifs et négatifs précèdent le
   changement de production ;
6. les gates publics ne reçoivent aucun jeton transversal capable de lire le
   dépôt privé : ils consignent son exemption, tandis que le workflow local
   privé exécute les contrôles équivalents sur son propre contenu.

L'entrée publique révèle uniquement le nom, le rôle, la visibilité et la
frontière d'autorité. Elle ne révèle ni sujets de recherche, ni titres
d'items, ni collaborateurs.

## 12. Ordre d'exécution et critères d'acceptation

1. Gouvernance : tests rouges pour le nouveau rôle, puis ADR, lexique, carte
   d'autorité, schéma d'inventaire et validateurs jusqu'à suite verte.
2. Création distante : repository privé dans `libre-ai`, fonctions inutiles
   désactivées, accès et 2FA vérifiés.
3. Bootstrap : structure, schéma, fixtures, CLI, tests, workflow et licences.
4. Protections : workflow vert sur le SHA de tête, règles de merge actives,
   forks privés désactivés, permissions Actions minimales vérifiées par API.
5. Import : la recherche de commercialisation existante est réécrite en
   synthèses assainies ; aucun export brut de conversation n'entre dans Git.
6. Restaurabilité : bundle complet, clone, `git fsck --full`, manifeste et
   lot chiffré vérifiés hors GitHub.

Le changement est terminé lorsque :

- la gouvernance autorise exactement un dépôt `administrative-private` nommé
  `product-research` et rejette un nom ou rôle non déclaré ;
- le repository distant est privé et détenu par `libre-ai` ;
- toutes les protections sont observées par lecture API, pas supposées ;
- les suites governance et product-research sont vertes sans avertissement ;
- un clone neuf reproduit les checks ;
- une restauration depuis le bundle chiffré est démontrée ;
- chaque item importé porte statut, classification, source et date de
  vérification ;
- aucune donnée interdite n'est présente dans les commits ou les logs.

## 13. Non-objectifs

- construire un CRM, une data room d'investissement ou un outil d'entretien ;
- stocker les coordonnées ou verbatims de prospects ;
- publier automatiquement une hypothèse sur le site ;
- certifier la conformité réglementaire d'une offre ;
- créer une nouvelle autorité de doctrine ou de contrats ;
- chiffrer des fichiers confidentiels puis les commettre dans GitHub ;
- mesurer la recherche par volume de documents, nombre d'idées ou activité
  de contributeurs.
