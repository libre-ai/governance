# Libre AI — Vision 2035 et architecture cible

**Statut :** accepted — architecture cible et migration Big Bang

**Cible :** reconstruction greenfield dans un monorepo canonique

**Stack web cible :** Bun fullstack + TypeScript strict + React 19

**Rôle de Rust :** composants spécialisés à valeur durable démontrée

**Horizon :** 5 à 10 ans

> Libre AI choisit de supporter maintenant les coûts structurants de la cible :
> nouvelle source canonique, nouveaux noms, nouvelles frontières, nouvelle stack
> web et nouvel outillage. Le code et l’historique actuels ne contraignent pas la
> nouvelle organisation.

> La migration suit une approche Big Bang : les repositories historiques sont
> figés ensemble, toute nouvelle architecture et tout nouveau développement
> basculent dans le monorepo cible, et aucune compatibilité transitoire n’est
> entretenue. Les applications peuvent rester indisponibles ou incomplètes
> pendant la reconstruction ; la priorité est d’atteindre rapidement une cible
> cohérente, intégrée et durable.

---

## 1. Contexte

Libre AI dispose déjà d’un ensemble important de produits, composants,
contrats, décisions, benchmarks et preuves locales.

L’organisation actuelle a permis d’explorer :

- Rust-first et Dioxus ;
- orchestration agentique ;
- contract-first et verification-first ;
- ingestion, contexte et local-first ;
- distribution d’artefacts ;
- souveraineté et sécurité ;
- expériences web et multiplateformes ;
- acculturation aux usages responsables de l’IA.

Elle reflète cependant une succession d’explorations et de refontes :

- repositories nombreux et frontières parfois historiques ;
- noms techniques hérités (`rumble`, `gear`, `portal`, `wrench`, `bolt`) ;
- documentation et statuts dupliqués ;
- plusieurs chaînes de build et lockfiles ;
- dépendances inter-repositories épinglées par SHA ;
- Dioxus, Axum, Tokio et SQLx présents dans des produits qui peuvent désormais
  être servis plus directement par une stack Bun/TypeScript ;
- contrats utiles mélangés à des implémentations qui ne constituent plus la
  cible ;
- coût élevé de contexte, de synchronisation et de release pour les humains et
  les agents.

La cible étant désormais suffisamment définie et destinée à rester stable,
Libre AI ne cherche plus à adapter progressivement l’architecture historique.

La décision est :

> **Créer une base canonique neuve, conçue directement pour la vision cible,
> puis y porter sélectivement les comportements, contrats, données et composants
> qui méritent d’être conservés.**

---

## 2. Vision

Libre AI est un laboratoire open source et souverain qui construit pour ses
propres besoins les capacités nécessaires au logiciel de l’ère IA-native, les
met à l’épreuve dans des expériences réelles, publie les évidences comme les
limites, puis distribue les résultats afin que d’autres puissent les reproduire
et les améliorer.

Notre hypothèse à dix ans est volontairement radicale :

> Une part importante des services SaaS caractéristiques des années 2020 pourra
> être reconstruite ou profondément adaptée à la demande à partir d’intentions,
> de connaissances, de données, de contraintes, de contrats et de critères de
> vérification explicites.

Générer du code ne suffit pas à produire un service durable. La valeur se
concentre dans la capacité à :

- formuler correctement une intention ;
- structurer et relier les connaissances ;
- rendre les décisions explicites ;
- définir des contrats exécutables ;
- maîtriser les données et les autorisations ;
- vérifier les réalisations ;
- exploiter et faire évoluer les systèmes ;
- transmettre les capacités et apprentissages.

Libre AI existe pour préparer et distribuer cette transition.

---

## 3. Mission

1. **Construire pour des besoins réels** — le dogfood fournit la première
   contrainte de vérité.
2. **Mettre des hypothèses à l’épreuve** — chaque initiative répond à une
   question explicite et réfutable.
3. **Produire des évidences** — tests, benchmarks, pilotes, incidents et retours
   sont publiés avec leurs limites.
4. **Structurer les apprentissages** — sources, décisions, contrats,
   implémentations et preuves deviennent exploitables par humains et agents.
5. **Produire des capabilities composables** — sans les confondre avec les
   expériences qui les démontrent.
6. **Distribuer et acculturer** — code, méthodes, contextes, formations,
   exemples et contre-exemples sont des sorties premières.
7. **Fédérer sans enfermer** — la source est ouverte, exportable, réplicable et
   indépendante d’un fournisseur unique.

Le succès ne se mesure ni au nombre de repositories ni au volume de code. Il se
mesure à la valeur produite, à la qualité des évidences et à la capacité
d’acteurs indépendants à reproduire, adopter ou contester le travail.

---

## 4. Décisions structurantes

### 4.1 Canonical Core

Libre AI possède une seule source d’écriture : un nouveau monorepo canonique.

Il contient :

- les Knowledge Objects ;
- les schémas et contrats ;
- les applications ;
- les packages TypeScript ;
- les crates Rust retenues ;
- les migrations ;
- les protocoles de vérification ;
- les preuves acceptées ;
- les outils de distribution ;
- la gouvernance et les décisions.

Les repositories publics spécialisés sont des projections ou des archives. Ils
ne constituent jamais une seconde autorité.

### 4.2 Reconstruction sans import d’historique

La nouvelle base commence par un commit racine propre.

Les historiques Git actuels ne sont pas importés dans le monorepo. Cette
décision permet de ne pas transporter :

- artefacts de build historiquement commités ;
- anciens noms et chemins ;
- décisions remplacées ;
- lockfiles concurrents ;
- duplications et extractions successives ;
- documentation devenue fausse ;
- structures conçues pour l’ancienne stack.

Les anciens repositories sont figés et conservés comme archives externes. Leur
SHA final, licences, releases, contrats et provenance sont référencés dans un
`LEGACY-MANIFEST.yaml` du nouveau monorepo.

Le portage sélectif conserve uniquement :

- comportements encore souhaités ;
- contrats publics utiles ;
- données et migrations nécessaires ;
- tests exprimant des invariants réels ;
- composants Rust dont la valeur reste démontrée ;
- décisions encore applicables ;
- obligations de licence et d’attribution.

Un fichier copié ou réécrit depuis un ancien repository porte une provenance
vers le repository, le SHA et le chemin source. La conservation des archives
remplace l’import de leur graphe Git.

### 4.3 Bun fullstack comme plateforme web

Bun possède désormais la stack applicative web :

- package management ;
- workspaces et catalogue de versions ;
- task runner ;
- bundling ;
- serveur HTTP ;
- SSR, hydratation et rendu statique ;
- API et BFF ;
- WebSockets et SSE lorsque requis ;
- accès PostgreSQL, Redis et stockage objet pour les applications migrées ;
- tests TypeScript ;
- orchestration Playwright ;
- scripts de développement et de build.

`Bun.serve` est la frontière HTTP/fullstack par défaut.

La stack ne doit pas ajouter Next.js, Vite, Astro, Hono, Express, Fastify,
Elysia ou un autre framework serveur. Libre AI assume directement les quelques
primitives fullstack dont il a besoin.

### 4.4 React 19 comme renderer web

React 19 devient le renderer web par défaut.

La cible utilise :

- composants fonctionnels ;
- TypeScript strict ;
- SSR React public et documenté ;
- hydratation avec `hydrateRoot` ;
- rendu client avec `createRoot` lorsque nécessaire ;
- rendu statique via les APIs publiques de `react-dom/server` ;
- React Aria Components ou primitives headless accessibles équivalentes ;
- Tailwind v4 lorsqu’utile ;
- tokens Libre AI et variables CSS comme vérité visuelle ;
- fontes locales uniquement.

React Server Components ne font pas partie de la cible initiale. Leur adoption
nécessiterait un contrat public stable et un besoin démontré. Bake privé, `wip`
ou interne est interdit.

### 4.5 Rust spécialisé

Rust n’est plus la plateforme applicative web par défaut.

Rust reste utilisé lorsqu’il apporte une valeur durable et vérifiable :

- moteurs métier complexes ou sensibles ;
- algorithmes déterministes et scoring ;
- cryptographie et Biscuit ;
- inspection SQL, RLS et migrations ;
- preuves, provenance et supply chain ;
- agent orchestration et policy enforcement ;
- CLI système ;
- outils de release éprouvés ;
- WASM local-first ;
- composants partagés avec des clients natifs ;
- code dont la migration TypeScript supprimerait des invariants opposables.

Un composant Rust n’est pas conservé uniquement parce qu’il existe. Chaque
composant retenu doit déclarer la valeur qu’il protège et les tests qui la
prouvent.

### 4.6 Une implémentation par domaine

Il ne doit jamais exister durablement deux implémentations d’une même règle
métier.

Une double exécution temporaire est autorisée uniquement pour une gate de
parité :

- mêmes entrées ;
- sorties comparées ;
- divergences enregistrées ;
- propriétaire identifié ;
- date de suppression ;
- ancienne implémentation retirée après bascule.

### 4.7 Reconstruction Big Bang

Après la baseline, tous les anciens repositories sont figés simultanément. Ils
restent consultables comme archives, mais ne reçoivent plus de fonctionnalité,
de correction architecturale ou de mise à jour de stack.

Le monorepo devient immédiatement l’unique autorité de développement :

```text
freeze global de l’existant
        ↓
spécification complète de la cible
        ↓
construction parallèle des fondations et applications
        ↓
intégration continue dans le monorepo
        ↓
qualification globale
        ↓
cutover unique de l’écosystème cible
```

Big Bang désigne l’absence d’architecture transitoire, de compatibilité et de
cutovers produit successifs. Il ne signifie pas que tous les agents modifient
les mêmes fichiers sans coordination : les workstreams restent bornés par
chemins, contrats et ownership.

Les comportements historiques ne sont conservés que s’ils sont réacceptés dans
la spécification cible. La parité exhaustive avec les anciens outils n’est pas
un objectif.

---

## 5. Vocabulaire stratégique

### Pari stratégique

Décision d’investir dans une direction incertaine mais jugée importante.

### Hypothèse stratégique mise à l’épreuve

Affirmation réfutable associée à un pari. Un pari n’est pas « démontré » : il
est assumé ; l’hypothèse est testée.

### Démonstrateur

Expérience ou parcours construit pour tester une hypothèse dans un usage réel.

### Évidence

Observation reproductible et bornée : test, benchmark, artefact, audit, pilote,
déploiement ou retour documenté.

### Capability

Capacité cohérente, contractuelle et composable. Une capability peut être
modélisée dès la conception, mais sa promotion publique exige des consommateurs,
des contrats exercés et un propriétaire.

### Expérience

Parcours utilisateur assemblant des capabilities. Les expériences restent les
véhicules de valeur, de feedback et de communication.

### Knowledge Object

Objet canonique typé représentant une source, une hypothèse, une décision, une
capability, une expérience, un contrat, une implémentation, une évidence, un
apprentissage ou une release.

### Projection

Vue générée depuis le monorepo : repository, README, site, documentation,
graphe, diagramme, catalogue, SDK, context pack ou release note.

---

## 6. Cycles fondamentaux

### Cycle stratégique

```text
Thèse
  ↓
Paris
  ↓
Hypothèses
  ↓
Démonstrateurs
  ↓
Évidences
  ↓
Apprentissages
  ↓
Capabilities
  ↓
Distribution
  ↓
Adoption et feedback
  ↺
Thèse
```

### Cycle d’ingénierie

```text
Knowledge
    ↓
Framing
    ↓
Decision
    ↓
Specification
    ↓
Implementation
    ↓
Verification
    ↓
Distribution
    ↓
Feedback
    ↺
Knowledge
```

`Framing` produit synthèses, alternatives, risques et inconnues. `Decision`
rend l’arbitrage humain explicite. Une synthèse générée ne devient jamais
silencieusement une spécification normative.

---

## 7. Cible expliquée

### 7.1 Ce qui est centralisé

La centralisation concerne l’autorité et les changements :

- une seule branche canonique ;
- un seul modèle d’objets ;
- un seul graphe de dépendances ;
- un seul lockfile Bun ;
- un seul workspace Cargo ;
- des contrats communs ;
- des changements atomiques entre application, contrat, moteur et preuve ;
- une gouvernance et une release supply chain communes.

Elle ne signifie pas que tous les composants sont déployés dans un seul process
ou versionnés ensemble.

### 7.2 Ce qui reste indépendant

- releases des applications ;
- versions des packages et crates ;
- données et migrations de chaque produit ;
- secrets et environnements ;
- droits par chemin ;
- déploiements ;
- cycles de maturité ;
- responsabilités métier ;
- preuves indépendantes.

### 7.3 Flux d’auteur

```text
Humain ou agent
      ↓
Monorepo canonique
      ↓
Contrats + code + tests + Knowledge Objects
      ↓
Gates humaines et automatisées
      ↓
Artefact + évidence + provenance
      ↓
Déploiement et projections publiques
```

### 7.4 Flux applicatif web

```text
Navigateur
    ↓ HTTPS
Bun.serve / BFF du produit
    ├── domaine TypeScript pur
    ├── capability Rust via WASM, CLI bornée ou service explicite
    ├── PostgreSQL via Bun.sql
    ├── Redis non autoritatif
    └── Cellar S3-compatible
```

Les objets `Request`, `Response` et `Server` ne traversent pas la frontière du
domaine. Les handlers Bun sont des adaptateurs.

### 7.5 Flux connaissance et agents

```text
Knowledge Objects + Contracts + Evidence
                    ↓
       Executable Knowledge Engine
                    ↓
Graphe · Impact · Context packs · Documentation · Plans
                    ↓
 Futur Agent Orchestrator (hors S01)
                    ↓
Work packages · Exécution bornée · Évidence
```

Le Knowledge Engine décrit et compile. Après un Specification Lock dédié, un futur Agent Orchestrator
pourra exécuter sous politique. Proof vérifie indépendamment. Artifact construit et distribue.

### 7.6 Repositories publics

```text
Monorepo canonique
       ↓ compilation déterministe
Projection ciblée
       ↓
Repository public ou package
```

Les projections sont à sens unique et portent le SHA source, le chemin, le hash
de contenu et la version du compilateur.

### 7.7 GitHub et collaboration canoniques

La décision déjà prise est conservée : l’organisation GitHub `libre-ai` porte
les repositories, issues, pull requests, protections de branches et releases
publiques.

- `libre-ai/libre-ai` devient le repository canonique ;
- les anciens repositories deviennent des archives ou projections ;
- les merges, tags et releases canoniques sont réalisés sur GitHub ;
- aucune nouvelle forge ou infrastructure Git n’est ajoutée à cette migration ;
- la souveraineté runtime et données reste assurée séparément par les choix
d’hébergement applicatif ;
- les exports Git et les artefacts empêchent que GitHub devienne une dépendance
de données irréversible.

Ce choix est une décision de distribution et de collaboration, pas une
affirmation de souveraineté complète de la forge.

---

## 8. Structure physique cible

```text
libre-ai/
├── ecosystem/
│   ├── objects/
│   │   ├── theses/
│   │   ├── bets/
│   │   ├── hypotheses/
│   │   ├── capabilities/
│   │   ├── experiences/
│   │   ├── decisions/
│   │   ├── evidence/
│   │   ├── learnings/
│   │   └── releases/
│   ├── schemas/
│   ├── taxonomy/
│   ├── governance/
│   └── LEGACY-MANIFEST.yaml
│
├── apps/
│   ├── website/
│   ├── practices/
│   ├── radar/
│   ├── notebook/
│   ├── sessions/
│   ├── model-policy/
│   ├── boussole/
│   ├── specifications/
│   └── missions/
│
├── packages/
│   ├── ui/
│   ├── web-runtime/
│   ├── auth-web/
│   ├── contracts/
│   ├── database/
│   ├── cache/
│   ├── observability/
│   ├── testing/
│   └── pwa/
│
├── crates/
│   ├── ecosystem-engine/
│   ├── agent-orchestrator/
│   ├── agent-harness/
│   ├── authz-biscuit/
│   ├── policy-core/
│   ├── proof/
│   ├── artifact/
│   └── cli/
│
├── contracts/
│   ├── json-schema/
│   ├── openapi/
│   ├── wit/
│   └── fixtures/
│
├── verification/
│   ├── protocols/
│   ├── golden/
│   ├── campaigns/
│   ├── benchmarks/
│   └── accepted-evidence/
│
├── distribution/
│   ├── templates/
│   │   └── bun-app/
│   ├── repository-projections/
│   ├── knowledge-packs/
│   ├── documentation/
│   └── training/
│
├── infrastructure/
│   ├── clever-cloud/
│   ├── postgres/
│   ├── redis/
│   ├── cellar/
│   └── observability/
│
├── tools/
│   ├── migration/
│   ├── quality/
│   ├── release/
│   └── projection/
│
├── package.json
├── bun.lock
├── bunfig.toml
├── tsconfig.json
├── Cargo.toml
├── Cargo.lock
├── rust-toolchain.toml
├── deny.toml
└── AGENTS.md
```

### 8.1 Workspace Bun

Le monorepo possède :

- un `package.json` racine ;
- un seul `bun.lock` ;
- des workspaces `apps/*`, `packages/*` et `distribution/templates/*` ;
- un catalogue central des versions ;
- des versions exactes ;
- `workspace:*` pour les packages locaux ;
- aucun autre lockfile JavaScript.

Les packages peuvent avoir leur propre `package.json`, jamais leur propre
lockfile.

### 8.2 Workspace Cargo

La cible possède un workspace Cargo racine unique pour toutes les crates Rust
retenues :

- resolver commun ;
- toolchain épinglé ;
- dépendances communes centralisées ;
- un seul `Cargo.lock` ;
- licences par crate ;
- profils de release explicitement configurés ;
- aucun workspace Rust imbriqué durable.

Cette cible impose de résoudre maintenant les conflits de versions et features
plutôt que de reporter une seconde consolidation.

### 8.3 Applications

Chaque application est un produit déployable et possède :

```text
apps/<product>/
├── src/server/
├── src/client/
├── src/domain/
├── src/application/
├── src/infrastructure/
├── src/contracts/
├── src/shared/
├── public/
├── migrations/
├── tests/
├── e2e/
├── scripts/
├── package.json
├── tsconfig.json
└── bunfig.toml        # seulement si une surcharge locale est nécessaire
```

Une application peut adapter cette structure lorsque son domaine est plus clair
autrement. Elle ne peut pas déplacer sa vérité métier dans `packages/ui` ou un
handler HTTP.

---

## 9. Répartition complète des responsabilités

### 9.1 Applications Bun

Chaque application possède :

- expérience utilisateur ;
- composition de capabilities ;
- routes `Bun.serve` ;
- SSR, hydratation et statique ;
- BFF et API propres au produit ;
- sessions web et cookies ;
- CSRF ;
- état et migrations PostgreSQL du produit ;
- caches propres ;
- workers applicatifs simples ;
- déploiement et runbook ;
- télémétrie minimale sans PII ;
- tests unitaires, intégration et E2E.

Une application ne possède pas :

- une capability partagée sans contrat ;
- les clés privées Biscuit d’autorité sauf si elle est explicitement l’issuer ;
- les politiques écosystème ;
- les règles de release communes ;
- les preuves indépendantes qui la certifient.

### 9.2 `packages/ui`

Possède :

- tokens DTCG et variables CSS générées ;
- composants React accessibles ;
- primitives de layout et feedback ;
- thèmes ;
- fontes locales ;
- stories ou pages de preuve ;
- contrats clavier, focus, contrastes et reduced motion.

Ne possède pas de logique produit, de fetch ou d’autorisation.

### 9.3 `packages/web-runtime`

Fournit des primitives minces au-dessus des APIs publiques Bun :

- erreurs structurées ;
- enveloppes `{ data, meta }` ;
- request IDs ;
- logs JSON et redaction ;
- timeouts et limites de corps ;
- sécurité HTTP et CSP ;
- health/readiness ;
- graceful shutdown ;
- helpers ETag, cache et compression.

Il ne devient pas un framework maison : pas de conteneur de dépendances,
d’ORM, de DSL de routes ou d’abstraction générique de contrôleur.

### 9.4 `packages/auth-web`

Possède :

- authentification web et intégration OIDC externe ;
- session opaque côté navigateur ;
- cookies `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/` ;
- protection CSRF ;
- contrôles Origin/Referer ;
- adaptation vers l’autorizer Biscuit ;
- rotation de session et logout.

Il ne possède pas la cryptographie Biscuit ni les politiques d’autorisation.

### 9.5 `packages/contracts`

Contient uniquement les types TypeScript générés et adaptateurs depuis les
contrats racine. Aucun contrat inter-langage n’est écrit indépendamment dans
Rust et TypeScript.

### 9.6 `packages/database`

Fournit des primitives Bun.sql minces :

- pools ;
- transactions ;
- exécution paramétrée ;
- contexte tenant transactionnel ;
- timeouts ;
- health checks ;
- instrumentation sans données sensibles.

Il ne possède ni schéma métier, ni migrations produit, ni ORM.

### 9.7 `packages/cache`

Fournit :

- conventions de clés ;
- TTL obligatoire ;
- timeouts ;
- chiffrement lorsque requis ;
- comportement dégradé ;
- métriques.

Redis reste non autoritatif.

### 9.8 `packages/testing`

Possède :

- configuration Playwright multi-moteur ;
- fixtures HTTP, cookies et CSRF ;
- helpers d’accessibilité ;
- lancement PostgreSQL/Redis de test ;
- conventions golden et contract tests ;
- vérification de fuite réseau et PII.

### 9.9 `crates/ecosystem-engine`

Possède :

- modèle des Knowledge Objects ;
- parsing et validation ;
- IDs, versions, hashing et provenance ;
- graphe typé ;
- règles de dépendance ;
- analyse d’impact ;
- compilation de documentation, context packs et projections ;
- CLI déterministe.

Ne possède pas l’exécution agentique, la release, l’inspection indépendante ou
le rendu web.

### 9.10 Orchestration agentique — différée

Aucune `crates/agent-orchestrator` n’est créée par WP-G2-S01. La nécessité à terme pour Missions est reconnue, mais les contrats actuels ne définissent ni plan d’exécution approuvé, ni commandes de contrôle, ni consommation de budgets, ni agent-harness.

Une future crate exige un Specification Lock et un work package séparés couvrant au minimum : plan exécutable hash-bound, contrôle start/pause/resume/cancel, événements v2 causaux et idempotents, sandbox/harness, autorisation atténuée, absence d’auto-approbation et journal sans PII. Aucun code legacy d’automerge, déploiement ou provider n’est porté implicitement.

### 9.11 `crates/agent-harness`

Possède :

- sandbox ;
- exécution bornée ;
- fixtures de sécurité ;
- collecte d’évidence ;
- contrôles de secrets et PII ;
- adapters de providers.

Il ne possède pas la décision de merge, release ou déploiement.

### 9.12 `crates/authz-biscuit`

Possède :

- parsing et vérification Biscuit ;
- Ed25519 ;
- authority facts ;
- attenuation ;
- authorizer ;
- politiques deny-by-default ;
- rotation et révocation ;
- tests tenant, expiration et délégation ;
- interface WASM ou service borné vers Bun.

Le navigateur ne crée jamais de Biscuit.

### 9.13 Contexte canonique — sans crate dédiée

`notebook-core` reste l’unique autorité Rust/WASM de canonicalisation de
`ContextDocument`. Aucune crate `context` générique, CLI parallèle ou seconde
WIT n’est créée. L’ingestion hostile et la provenance de l’ancien Context Kit
restent archivées tant qu’un nouveau package approuvé ne démontre pas un
invariant distinct, un consommateur et une frontière canonique.

### 9.14 `crates/policy-core`

Possède les règles déterministes de décision et scoring qui doivent rester
opposables ou réutilisables en WASM. Le catalogue, l’API et l’UI appartiennent à
`apps/model-policy`.

### 9.15 `crates/proof`

Possède l’inspection indépendante :

- SQL, migrations et RLS ;
- structures et contrats ;
- artefacts ;
- sécurité ;
- provenance ;
- contrôles reproductibles.

Proof ne dépend pas des implémentations privées qu’il inspecte. Il consomme
leurs contrats et artefacts publics.

### 9.16 `crates/artifact`

Possède :

- release plans ;
- manifests ;
- checksums ;
- SBOM ;
- provenance ;
- signatures ;
- packaging ;
- promotion et compensation.

Le Knowledge Engine décrit les artefacts ; Artifact les construit et les
transporte ; Proof les inspecte.

### 9.17 `contracts/`

Source canonique des frontières :

- JSON Schema pour documents et événements ;
- OpenAPI pour HTTP public ;
- WIT pour WASM ;
- fixtures golden ;
- règles de compatibilité.

Les types Rust et TypeScript sont générés ou testés contre cette source.

### 9.18 `verification/`

Possède protocoles, campagnes immuables, benchmarks et évidences acceptées.
L’entité qui produit un composant ne peut pas modifier silencieusement son
protocole après observation des résultats.

### 9.19 `infrastructure/`

Possède les manifestes de déploiement, runbooks, sauvegardes, observabilité et
configurations souveraines. Aucun secret réel n’est versionné.

---

## 10. Bun/TypeScript cible

### 10.1 TypeScript

Le `tsconfig.json` racine impose au minimum :

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "allowJs": false
  }
}
```

Règles :

- `tsc --noEmit` est toujours exécuté ;
- Bun transpile mais ne remplace pas le type-checking ;
- aucun `any` non justifié ;
- aucun `@ts-ignore` ;
- `@ts-expect-error` uniquement avec justification et test ;
- `.js`, `.jsx`, `.mjs` et `.cjs` interdits comme source applicative sauf
  artefacts générés ou exception documentée.

### 10.2 Dépendances Bun

- un seul `bun.lock` ;
- `bun install --frozen-lockfile` en CI ;
- versions exactes ;
- catalogues racine pour versions communes ;
- `workspace:*` pour packages locaux ;
- linker isolé lorsque compatible ;
- `minimumReleaseAge = 259200` au minimum ;
- exclusions minimales et justifiées ;
- `trustedDependencies` limitées ;
- chaque lifecycle script autorisé et audité ;
- scan licences, advisories et transitives ;
- AGPL, SSPL, BSL et dépendances propriétaires interdites ;
- MIT, Apache-2.0, BSD, ISC privilégiées ; MPL-2.0 revue.

Bun est MIT et lie JavaScriptCore/WebKit sous LGPL-2. L’utilisation comme
runtime installé est acceptable. La redistribution d’un exécutable Bun ou d’un
standalone compilé exige une revue de licence dédiée.

### 10.3 HTTP avec `Bun.serve`

Chaque serveur définit explicitement :

- routes et méthodes ;
- validation de toute entrée ;
- mapping d’erreurs ;
- timeouts ;
- tailles maximales ;
- arrêt gracieux ;
- `/healthz` et `/readyz` séparés ;
- request ID ;
- logs JSON ;
- redaction ;
- CSP et headers de sécurité ;
- cache headers, ETag et compression lorsque pertinents ;
- enveloppe `{ data, meta }`, sauf health, fichiers et streams ;
- pagination par curseur.

Les handlers convertissent immédiatement l’entrée HTTP vers des commandes ou
queries du domaine.

### 10.4 SSR et assets

La cible utilise les APIs publiques React DOM adaptées aux Web Streams Bun.
Elle possède explicitement :

- template HTML ;
- rendu SSR ;
- streaming lorsqu’utile ;
- hydratation ;
- asset manifest ;
- cache busting ;
- CSP nonces ;
- erreurs de rendu ;
- statique/prerender ;
- génération et service des assets ;
- Pagefind ;
- PWA/service worker lorsque requis.

Aucune API privée de Bake n’est utilisée. En l’absence de HMR public et stable
satisfaisant, le développement utilise un rebuild/reload explicite plutôt qu’une
dépendance interne.

### 10.5 Routing

`Bun.serve` possède le routing serveur. React Router n’est ajouté que pour les
parcours nécessitant une navigation client longue ou offline. Les formulaires
et mutations simples privilégient les primitives HTTP de la plateforme.

### 10.6 Validation runtime

Chaque frontière valide :

- HTTP ;
- DB ;
- Redis ;
- fichiers ;
- événements ;
- réponses externes ;
- objets générés par IA.

La bibliothèque de validation TypeScript est unique dans le monorepo. Son choix
est une décision d’implémentation du template ; l’autorité reste JSON Schema,
OpenAPI ou WIT, afin d’éviter un verrou d’architecture.

---

## 11. Rust et interopérabilité

### 11.1 Règle de conservation

Une crate est retenue si au moins un critère s’applique :

- invariants complexes déjà testés ;
- surface de sécurité ou cryptographie ;
- déterminisme opposable ;
- performance mesurée ;
- partage WASM ou natif ;
- CLI et inspection système ;
- provenance/release ;
- orchestration agentique sensible.

### 11.2 Frontières Bun ↔ Rust

Ordre de préférence :

1. **WASM/WIT** pour domaine pur, déterministe et in-process ;
2. **CLI JSON/stdin/stdout** pour tooling et opérations de build ;
3. **HTTP local ou service** pour isolation, privilèges ou scaling indépendant ;
4. **FFI/native addon** uniquement après ADR, en raison du coût de portabilité et
   de supply chain.

Aucun type Bun ou React ne traverse la frontière Rust. Les erreurs sont
sérialisables, versionnées et sans secret.

### 11.3 Parité

Toute migration Rust → TypeScript ou TypeScript → Rust dispose de fixtures
golden et de tests aller-retour. La double exécution possède une date de fin.

---

## 12. Données et infrastructure applicative

### 12.1 PostgreSQL

Bun.sql devient le client par défaut des applications migrées. Aucun ORM n’est
ajouté sans besoin démontré.

Invariants :

- migrations SQL versionnées ;
- rôles migrator, application, auth et worker séparés ;
- RLS et isolation tenant ;
- TLS ;
- transactions explicites ;
- requêtes paramétrées ;
- aucun identifiant SQL issu directement d’une entrée ;
- migrations publiées append-only ;
- advisory lock ;
- dry-run ;
- inspection Proof ;
- sauvegarde et rollback avant migration destructive.

Le contexte tenant doit être posé dans la même transaction et connexion que les
requêtes protégées. Ce comportement fait l’objet de tests réels avec le pool
Bun.sql.

SQLx n’est supprimé qu’après transfert de l’ownership et preuve de parité. Les
inspecteurs Rust peuvent continuer à utiliser SQLx si cela reste justifié.

### 12.2 Redis

Le client natif Bun est utilisé lorsque Redis est nécessaire :

- préfixe produit/environnement/tenant ;
- TTL explicite ;
- aucune donnée sensible en clair ;
- cache non autoritatif ;
- timeouts ;
- comportement dégradé ;
- tests d’indisponibilité.

### 12.3 Cellar

Le client S3 Bun peut être utilisé avec :

- endpoint Cellar explicite ;
- aucun endpoint AWS ;
- `us-east-1` uniquement comme convention SDK ;
- données en France/UE ;
- chiffrement ;
- rétention et suppression ;
- URLs signées courtes ;
- aucune donnée personnelle publique par défaut.

---

## 13. Authentification et autorisation

### 13.1 Trois frontières distinctes

1. **Authentification externe** — OIDC peut imposer des JWT à son interface.
2. **Session navigateur** — cookie opaque `HttpOnly`, jamais un token lisible par
   JavaScript.
3. **Autorisation interne** — Biscuit attenué, vérifié localement et transmis en
   bearer entre frontières de service lorsque nécessaire.

Cette séparation évite de placer un Biscuit durable dans le stockage navigateur
et réduit l’exposition CSRF. Une exception utilisant directement Biscuit en
cookie exige un ADR et des tests renforcés.

### 13.2 Biscuit

- authority signée Ed25519 ;
- `user` et `tenant` obligatoires ;
- expiration dans le token ;
- attenuation avant délégation ;
- authorizer enrichi avec temps, ressource, opération et tenant ;
- dernière policy `deny if true` ;
- rotation avec chevauchement de clés ;
- révocation par root block ID ;
- cache de révocation court ;
- aucun email, PII ou secret dans le token ;
- aucun token dans les logs ;
- tests négatifs tenant, attenuation, expiration et révocation.

### 13.3 Web

- cookie `HttpOnly; Secure; SameSite=Strict; Path=/` ;
- CSRF sur toute mutation ;
- Origin/Referer lorsque pertinent ;
- aucune auth dans localStorage/sessionStorage ;
- aucune clé dans le bundle ;
- secrets injectés au runtime ;
- séparation authentification/autorisation.

---

## 14. Executable Knowledge Engine et chaîne agentique

### 14.1 Knowledge Engine

Le moteur Rust :

- parse et valide les Knowledge Objects ;
- construit le graphe ;
- calcule les impacts ;
- compile documentation et context packs ;
- génère les projections ;
- produit des plans descriptifs ;
- ne possède ni secrets produit ni droits de merge.

### 14.2 Agent Orchestrator

L’orchestrateur n’est pas une fondation G2 implémentable avec les autorités actuelles. Missions conserve son workflow humain et ses fixtures de protocole, mais aucune simulation Rust ne devient une seconde autorité d’état. Un moteur ultérieur est conditionné par un RFC architecture/sécurité, les contrats d’exécution et de contrôle, puis un package distinct incluant le harness.

### 14.3 Proof

Proof exécute des contrôles indépendants sur contrats, DB, UI, artefacts et
sécurité. Il ne produit pas l’objet qu’il inspecte.

### 14.4 Artifact

Artifact construit, signe, atteste et distribue. Il ne décide pas seul qu’un
produit peut être publié.

### 14.5 Website

Website rend les projections publiques. Le contenu vient des Knowledge Objects ;
les composants de rendu appartiennent à `apps/website`.

---

## 15. Toolchain observée et politique de version

### 15.1 Checkpoint au 2026-07-16

Vérifications réalisées avant cette décision :

- dernière release GitHub stable Bun : `1.3.14`, publiée le 2026-05-13 ;
- cette ligne stable précède la bascule Rust visée ;
- Bun local observé : `1.3.11+af24e281e` ;
- asset canary officiel macOS ARM64 vérifié par SHA-256 ;
- le binaire canary observé rapporte
  `1.4.0-canary.1+57f349f63` ;
- checksum macOS ARM64 observé :
  `4d4bdb8e3ca1b41dede0ce423871b3804424bd785c6435e43c625a60a49f2f02` ;
- checksum Linux x64 observé :
  `83144e2542c33aaae541cf16b42f8cf1c55c3b94c5395fc776417fa27e95bcbf` ;
- React documenté via la ligne `19.2.7` ;
- Clever Cloud documente un support Bun natif déclenché par `bun.lock` ou
  `CC_NODE_BUILD_TOOL=bun`, mais sélectionne la dernière version disponible au
  lieu de garantir un pin exact.

Sources documentaires consultées : `/oven-sh/bun`,
`/react/react/v19.2.7`, `/clevercloud/documentation`, `/biomejs/biome`,
`/websites/react-aria_adobe`, `/ajv-validator/ajv`, documentation et release API
officielles Bun, registry npm et binaire officiel vérifié localement.

Le commit source complet du canary observé est :
`57f349f6307cf89dcfb8893f003c1ef421a74589`.

Versions de préparation observées et à épingler dans le premier lockfile après
qualification :

| Dépendance | Version observée | Licence |
| --- | --- | --- |
| React / React DOM | `19.2.7` | MIT |
| React Aria Components | `1.19.0` | Apache-2.0 |
| Tailwind CSS | `4.3.2` | MIT |
| TypeScript | `7.0.2` | Apache-2.0 |
| Biome | `2.5.3` — dernière version admise par la fenêtre de sécurité de trois jours | MIT OR Apache-2.0 |
| Ajv | `8.20.0` | MIT |
| ajv-formats | `3.0.1` | MIT |
| Playwright Test | `1.61.1` | Apache-2.0 |

Décisions d’outillage :

- Biome est l’unique formatter/linter TypeScript, TSX, JSON et CSS ;
- `biome ci` vérifie sans appliquer de fixes en CI ;
- Ajv en mode strict compile une fois les JSON Schemas canoniques ;
- les détails d’erreur Ajv sont convertis en erreurs publiques bornées et ne
  sont jamais journalisés avec leur donnée brute ;
- React Aria Components fournit les primitives accessibles ; React 19 n’exige
  pas `SSRProvider`, car `useId` assure les identifiants SSR/hydratation ;
- TypeScript reste l’autorité du type-checking, indépendamment du transpileur
  Bun.

### 15.2 Version Bun cible

La cible est la première ligne stable Bun écrite en Rust, normalement `1.4.x`
ou ultérieure.

Tant qu’elle n’existe pas :

- le template peut qualifier un canary exact ;
- version, révision et checksums sont enregistrés ;
- aucune URL `canary` mouvante n’est une source reproductible suffisante ;
- le binaire doit être conservé légalement ou reconstruit depuis un commit exact ;
- le statut pré-release est public ;
- aucun déploiement ne bascule silencieusement sur Bun stable `1.3.x`.

Le cutover production d’un produit requiert soit :

1. une release stable Rust épinglée ;
2. soit un canary qualifié, reproductible, archivé et explicitement accepté.

### 15.3 Clever Cloud

Clever Cloud reste la cible de déploiement applicatif Paris/UE, mais sa
configuration est volontairement différée. Aucun provisioning, secret,
environnement ou déploiement n’est attendu pendant le cleanup et la
Specification Lock. Cette absence est une décision de séquencement, pas un
blocage.

Le support natif « dernière version disponible » ne suffit pas à la
reproductibilité cible.

Ordre de préférence :

1. runtime Bun natif lorsque Clever permet le pin exact requis ;
2. binaire officiel exact, vérifié par checksum, sans `curl | bash` ;
3. image OCI maîtrisée si le runtime natif est insuffisant ;
4. Docker uniquement en dernier recours.

`bun build --compile` n’est pas le défaut tant que la redistribution LGPL n’a
pas été revue.

---

## 16. Tests et quality gates

### 16.1 Unitaires

- domaine pur ;
- validation ;
- erreurs ;
- autorisation ;
- sérialisation ;
- cas limites.

### 16.2 Intégration Bun

- routes `Bun.serve` ;
- cookies et CSRF ;
- PostgreSQL réel ;
- RLS ;
- Redis ;
- transactions ;
- timeouts et erreurs ;
- graceful shutdown.

### 16.3 Contrats

- Rust/TypeScript pendant transition ;
- JSON Schema/OpenAPI/WIT ;
- fixtures golden ;
- compatibilité publique ;
- round-trip WASM ou CLI.

### 16.4 Playwright

- Chromium ;
- Firefox ;
- WebKit ;
- viewport mobile ;
- clavier et focus ;
- ARIA ;
- reduced motion ;
- CSP ;
- cookies HttpOnly ;
- absence de fuite réseau ;
- PWA/offline lorsque requis ;
- parcours critiques.

`Bun.WebView` reste expérimental et ne remplace jamais Playwright.

### 16.5 Smoke production

- build release ;
- démarrage réel ;
- health/readiness ;
- PostgreSQL/Redis ;
- arrêt gracieux ;
- artefact Clever Cloud ;
- rollback.

### 16.6 Commandes canoniques

```text
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
bun run test:integration
bun run build
bunx playwright test
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo deny check
```

Les scripts racine déterminent les tâches affectées, mais une incertitude dans
le graphe déclenche davantage de tests, jamais moins.

---

## 17. Release, versionnement et distribution

### 17.1 Recommandation

Le monorepo n’a pas une version produit globale.

- applications : SemVer indépendante ;
- packages TypeScript : SemVer indépendante ;
- crates Rust : SemVer indépendante ;
- contrats : version majeure explicite ;
- campagnes de benchmark : identifiant immuable daté ;
- Knowledge Objects : identité stable + version + révision Git.

Tags namespacés :

```text
app/website/v1.0.0
app/radar/v1.0.0
pkg/ui/v1.2.0
crate/proof/v0.3.0
contract/curated-item/v2.0.0
```

Artifact produit le release plan et les manifestes. Proof inspecte les artefacts.

### 17.2 Registries

Les registries européennes ou auto-hébergées sont les canaux primaires. npm et
crates.io peuvent être des miroirs publics de distribution, jamais l’unique
lieu de conservation.

### 17.3 Projections

Chaque projection contient :

```yaml
schema_version: libre-ai.projection.v1
source_repository: libre-ai/libre-ai
source_revision: <sha>
source_path: <path>
compiler_version: <version>
content_digest: sha256:<digest>
```

Toute modification manuelle d’une projection échoue à sa CI.

---

## 18. Nommage cible

La reconstruction supprime les noms techniques hérités lorsqu’ils ne sont plus
pertinents.

### Conventions

- packages TypeScript : `@libre-ai/<name>` ;
- crates : `libre-ai-<name>` ;
- Knowledge Objects : `urn:libre-ai:<kind>:<name>` ;
- applications : noms courts orientés expérience ;
- contrats : nom métier + version ;
- aucun nouvel identifiant `rumble-*`, `gear-*`, `portal-*`, `wrench-*` ou
  `bolt-*`.

### Renommages internes recommandés

| Ancien nom | Cible |
| --- | --- |
| `bolt-cosmatic` | `libre-ai-agent-orchestrator` |
| `bolt-harness` | `libre-ai-agent-harness` |
| `portal-core` / Client Kit core | `@libre-ai/web-runtime` ou crate native explicitement justifiée |
| Portal UI | `@libre-ai/ui` |
| Wrench inspect | `libre-ai-proof` |
| Gear loader/memory | `libre-ai-context` |
| Gear cable/depot | `libre-ai-artifact` |
| Rumble product crates | nom de domaine ou produit explicite |

Les noms publics des expériences peuvent rester pour préserver leur lisibilité.
Les anciens packages ne reçoivent pas de couche de compatibilité par défaut,
faute d’adoption externe démontrée. Une dépendance externe observée peut imposer
une release de migration bornée.

---

## 19. Gouvernance remise à plat

### 19.1 Ownership

- `CODEOWNERS` par application, package, crate, contrat et infrastructure ;
- deux approbations pour schémas, auth, supply chain et migrations destructives ;
- propriétaire unique de décision pour chaque work package ;
- aucun agent approbateur de sa propre sortie.

### 19.2 Décisions

- RFC pour capability ou changement transversal ;
- ADR pour architecture et exceptions ;
- décision datée, propriétaire et critères de révision ;
- ADR remplacée marquée `superseded`, jamais silencieusement réécrite.

### 19.3 Dépendances

```text
apps → packages → contracts
apps → adaptateurs explicites → crates
packages ↛ apps
crates ↛ apps TypeScript
proof → contrats et artefacts publics uniquement
ecosystem-engine ↛ logique produit
agent-orchestrator ↛ UI produit, DB partagée et moteur agentique généraliste
```

Ces règles sont testées automatiquement.

### 19.4 Merge

- branches courtes ;
- merge queue ;
- CI affectée + tests consommateurs ;
- suite complète avant promotion ;
- aucun push direct sur `main` ;
- migrations produit séparées ;
- limite de travaux en cours alignée sur la capacité humaine de revue.

### 19.5 Sécurité agentique

- permissions minimales ;
- secrets à durée courte ;
- worktrees isolés ;
- budget de fichiers, temps et tokens ;
- journal sans PII ;
- sandbox réseau ;
- validation humaine des merges, releases, migrations et déploiements.

---

## 20. Cartographie des repositories actuels vers la cible

| Repository actuel | Cible | Portage principal | Rust attendu |
| --- | --- | --- | --- |
| `agent-factory` | futur package `agent-orchestrator` + `agent-harness` | archive/RFC uniquement en G2 ; aucune reprise S01 | différé jusqu’au lock dédié |
| `agent-board` | `apps/missions` | Bun/React greenfield | seulement si moteur d’état le justifie |
| `ai-practices` | `apps/practices` | Bun/React/Bun.sql | corpus/scoring opposable à évaluer |
| `artifact-supply` | `crates/artifact` | nettoyage et renommage | oui |
| `benchmarks` | `verification/benchmarks` et `campaigns` | import sélectif des campagnes | tooling selon besoin |
| `boussole-politique` | `apps/boussole` | Bun/React local-first | scoring déterministe conservé |
| `client-kit` | `packages/*`, `distribution/templates/bun-app` | reconstruction TS/React | bindings natifs seulement si consommés |
| `context-kit` | archive externe uniquement | aucune reprise sans nouveau package approuvé | non dans G2 |
| `design-system` | `packages/ui` | tokens et composants React | non par défaut |
| `dioxus-app-template` | archive externe uniquement | remplacé par `bun-app`, aucune projection cible | non |
| `feed-radar` | `apps/radar` | Bun fullstack | parsing/règles déterministes à conserver |
| `gear` | archive externe uniquement | aucun code importé | non, responsabilités redistribuées par contrats |
| `notebook` | `apps/notebook` | greenfield Bun/React local-first | chiffrement/index/WASM si justifié |
| `policy` | `apps/model-policy`, `crates/policy-core` | Bun UI/API + cœur WASM | oui pour policy/scoring |
| `proof-kit` | `crates/proof`, `verification/` | suppression du lab Dioxus | oui |
| `sessions` | `apps/sessions` | Bun SSR/WebSocket/BFF | authz/RAG exact-evidence à évaluer |
| `spec-studio` | `apps/specifications` | Bun/React greenfield | seulement pour hashing/invariants prouvés |
| `website` | `apps/website` | Bun/React SSR + statique | non par défaut |

`boussole-politique` reste dans Libre AI comme démonstrateur exigeant de
calcul local, explicabilité, provenance et neutralité méthodologique. Sa présence
met à l’épreuve la capacité de la stack cible à traiter un domaine sensible sans
profilage ni autorité opaque.

---

## 21. Chemin critique Big Bang

L’ordre n’est plus celui de migrations produit successives. Quatre workstreams
construisent la cible en parallèle dans le monorepo, avec intégration continue.

### Workstream A — Canonical Core

- gouvernance et Knowledge Objects ;
- contrats racine ;
- Knowledge Engine ;
- règles de dépendance ;
- projection déterministe ;
- toolchains et workspaces ;
- CI, licences et provenance.

### Workstream B — Web Platform

- `packages/ui` ;
- `packages/web-runtime` ;
- `packages/auth-web` ;
- `packages/database` et `cache` ;
- `packages/testing` et `pwa` ;
- template Bun ;
- SSR, assets, CSP et Playwright ;
- déploiement Clever Cloud.

### Workstream C — Specialized Rust

- Agent Orchestrator et Harness — différés jusqu’à un Specification Lock dédié ;
- Biscuit ;
- canonicalisation ContextDocument dans Notebook Core uniquement ;
- Policy Core ;
- Proof ;
- Artifact ;
- WASM/WIT et CLIs ;
- suppression des dépendances Dioxus/Axum/SQLx non justifiées.

### Workstream D — Experiences

Les applications `website`, `practices`, `radar`, `notebook`, `sessions`,
`model-policy`, `boussole`, `specifications` et `missions` sont reconstruites
directement dans `apps/`.

Le Website sert d’intégrateur précoce de SSR/statique. Model Policy valide
WASM. Radar valide Bun.sql/RLS. Sessions valide auth, WebSockets et Redis. Ces
rôles déterminent les priorités internes, pas des cutovers séparés.

### Dépendances du chemin critique

```text
Architecture + contrats
        ↓
Canonical Core ─────┬──── Web Platform
                    ├──── Specialized Rust
                    └──── Experiences
                              ↓
                    Intégration globale
                              ↓
                    Qualification globale
                              ↓
                       Cutover unique
```

---

## 22. Programme Big Bang

### Vague 0 — Global Freeze

#### Objectif

Arrêter l’ancien écosystème et en conserver une référence consultable, sans
chercher à le remettre au propre pour le maintenir.

#### Actions

1. inventorier branches, worktrees et modifications locales ;
2. sauvegarder tout travail utilisateur non commité ;
3. scanner secrets et PII ;
4. enregistrer SHA, licence, releases, données et contrats utiles ;
5. exporter issues, assets, Pages et paramètres nécessaires ;
6. produire `LEGACY-MANIFEST.yaml` ;
7. marquer les repositories historiques comme archives ;
8. interdire toute nouvelle fonctionnalité ou correction de stack dans
   l’ancien écosystème.

Il n’est pas nécessaire de rendre chaque ancienne CI verte. Les échecs connus
sont enregistrés ; seuls les éléments sélectionnés pour la cible deviennent des
exigences.

#### Gate 0 — Legacy Frozen

- aucun travail utilisateur perdu ;
- références finales connues ;
- données et obligations légales identifiées ;
- anciens repositories considérés non canoniques ;
- monorepo déclaré unique destination de tout nouveau travail.

### Vague 1 — Specification Lock

#### Objectif

Spécifier la cible assez précisément pour permettre les workstreams parallèles
sans rediscuter les frontières.

#### Livrables obligatoires

- ADR Bun Fullstack / Rust Specialized ;
- architecture physique et règles de dépendance ;
- ownership complet ;
- modèle Knowledge Object ;
- contrats HTTP, document, événement et WASM ;
- conventions DB/RLS, auth, logs et erreurs ;
- noms définitifs ;
- versions et release model ;
- architecture du template ;
- plans de chaque application ;
- matrice de souveraineté ;
- work packages et graphe de dépendances.

#### Gate 1 — Target Locked

- aucun domaine sans propriétaire ;
- aucune frontière Rust/TS implicite ;
- aucun contrat critique sans source canonique ;
- aucune app sans modèle de données, auth, tests et déploiement ;
- aucune ancienne compatibilité requise ;
- questions restantes limitées à l’implémentation locale, pas à l’architecture.

### Vague 2 — Foundation Build

#### Objectif

Créer l’ossature finale du monorepo et les fondations communes.

#### Actions

- commit racine propre ;
- workspace Bun et `bun.lock` unique ;
- workspace Cargo unique ;
- toolchains épinglées ;
- Biome, TypeScript, Ajv et Playwright ;
- Knowledge Engine minimal ;
- contrats et générateurs ;
- packages web ;
- crates spécialisées ;
- template Bun ;
- CI, sécurité, licences et Clever smoke ;
- première projection déterministe.

#### Gate 2 — Foundations Operational

```text
Bun.serve → React SSR → hydration → API → PostgreSQL/RLS
→ Biscuit → Rust/WASM → Playwright 3 moteurs
→ Artifact → Proof → projection → Clever smoke
```

Cette chaîne fonctionne depuis une checkout vierge.

### Vague 3 — Parallel Reconstruction

#### Objectif

Construire toutes les applications et capacités cibles en parallèle, sans
porter les anciennes structures.

#### Règles

- workstreams isolés par chemins et contrats ;
- branches courtes et intégration fréquente ;
- pas de branche de migration longue par produit ;
- pas de compatibilité avec les anciens packages ;
- comportements historiques repris uniquement s’ils figurent dans la spec ;
- fixtures de parité limitées aux invariants sélectionnés ;
- aucune dépendance Dioxus dans la cible ;
- Axum, Tokio et SQLx uniquement dans une crate Rust explicitement propriétaire.

#### Gate 3 — Target Complete

- toutes les apps cibles compilent ;
- parcours critiques E2E présents ;
- workspaces sans ancien nom ou lockfile ;
- contrats et migrations cohérents ;
- Knowledge Graph complet ;
- projections et artefacts reproductibles ;
- aucune double implémentation sans suppression planifiée avant lancement.

### Vague 4 — Global Integration and Hardening

- intégration inter-applications ;
- migrations de données sélectionnées ;
- sécurité, Biscuit, CSRF et tenancy ;
- accessibilité ;
- performance et charge ;
- sauvegarde, restauration et rollback ;
- observabilité ;
- supply chain ;
- déploiement de l’ensemble en environnement cible ;
- répétition générale du cutover.

#### Gate 4 — Release Candidate

Une release candidate globale peut être reconstruite, déployée, testée et
rollbackée sans dépendre d’un ancien repository ou service.

### Vague 5 — Single Cutover

- publication du monorepo canonique ;
- bascule des domaines, DNS et artefacts ;
- activation des projections publiques ;
- archivage définitif des anciens repositories ;
- publication des limites et fonctionnalités non reprises ;
- surveillance renforcée ;
- rollback global si une gate critique échoue.

### Vague 6 — Distribution and Federation

- registry européen primaire ;
- miroirs GitHub, npm et crates.io lorsque justifiés ;
- documentation, SDK, MCP et knowledge packs ;
- formations, articles et conférences ;
- reproduction indépendante ;
- contributions externes ;
- publication des hypothèses réfutées.

---

## 23. Protocole d’un workstream de reconstruction

1. lire la spécification cible et les archives pertinentes ;
2. lister les comportements historiques candidats ;
3. accepter explicitement ceux qui appartiennent à la cible ;
4. définir contrats, données, autorisation et refus ;
5. créer le module directement dans son chemin définitif ;
6. implémenter avec la stack cible ;
7. ajouter tests unitaires, intégration, contrats et E2E ;
8. produire évidence et provenance ;
9. intégrer rapidement sur la branche canonique ;
10. supprimer toute solution temporaire avant la release candidate.

La définition de fini porte sur la spécification cible, pas sur une parité
générale avec l’ancien produit.

---

## 24. Template Bun canonique

`distribution/templates/bun-app` doit fournir :

### Runtime

- Bun épinglé et vérifié ;
- `Bun.serve` direct ;
- React 19 SSR/hydratation ;
- routes API ;
- graceful shutdown ;
- health/readiness ;
- logs JSON ;
- CSP et headers ;
- request IDs ;
- limites et timeouts.

### Frontend

- TypeScript strict ;
- `@libre-ai/ui` ;
- tokens et fontes locales ;
- focus, clavier et reduced motion ;
- Tailwind v4 optionnel mais préconfiguré si retenu ;
- PWA activable sans fork d’architecture ;
- aucun framework supplémentaire.

### Data

- Bun.sql ;
- transaction tenant/RLS ;
- migrator séparé ;
- Redis dégradable ;
- Cellar endpoint explicite ;
- fixtures de test.

### Sécurité

- session opaque HttpOnly ;
- CSRF ;
- Origin/Referer ;
- Biscuit adapter ;
- tests négatifs tenant/expiration/révocation ;
- secrets runtime ;
- aucune PII dans les logs.

### Tests

- Bun unit/integration ;
- contrats ;
- Playwright Chromium/Firefox/WebKit/mobile ;
- accessibilité ;
- CSP ;
- offline optionnel ;
- production smoke.

### Supply chain

- `bun.lock` unique ;
- versions exactes ;
- linker isolé ;
- minimum release age ;
- trusted dependencies ;
- licences/advisories ;
- SBOM ;
- checksum ;
- provenance ;
- Clever deployment.

Le template Dioxus n’entre pas dans le nouveau monorepo. Son repository est
archivé lors du freeze global ; aucun consommateur historique ne bloque la cible.

---

## 25. Règles Agent Factory à modifier

### Sources doctrinales

- `agent-factory/engine/AGENTS.md` ;
- `agent-factory/engine/CLAUDE.md` ;
- `engine/content/domains/stack-authority.md` ;
- `engine/content/domains/web-boundary.md` ;
- `engine/content/domains/testing-strategy.md` ;
- `engine/content/domains/mobile-webview-rust-core.md` ;
- ADR-0033 Rust-core doctrine hardening ;
- descriptions embarquées dans `engine/crates/core/src/library.rs` ;
- détection et diagnostics dans `engine/crates/core/src/stack.rs` ;
- tests CLI et stack associés ;
- templates CI et init.

### Inversions requises

| Règle actuelle | Nouvelle règle |
| --- | --- |
| Rust possède toute logique durable | Bun/TS possède la stack web durable ; Rust possède les composants spécialisés justifiés |
| Bun est une commodité web | Bun est la plateforme applicative web par défaut |
| TypeScript ne possède pas le backend | TypeScript possède BFF, API web, sessions, DB et workers applicatifs des produits migrés |
| `Bun.serve` seulement local/SSR jetable | `Bun.serve` est la frontière HTTP/fullstack par défaut |
| contrat nécessairement Rust-owned | contrat canonique dans `contracts/`, types Rust/TS générés |
| Axum/Tokio/SQLx standards par défaut | standards uniquement pour services Rust retenus |
| Rust-first test stack | stratégie duale Bun/TS + Rust spécialisé + Playwright |
| Dioxus/PWA candidat par défaut | React/Bun web par défaut ; Dioxus deprecated pour web |
| Rust/WASM UI | Rust/WASM core possible derrière UI React |
| durable shell migre en Rust | orchestration durable via Bun task runner ou CLI Rust selon ownership |

### Gates nouvelles

- un seul `bun.lock` ;
- aucune source JS ;
- aucun framework web interdit ;
- Bun version check ;
- TypeScript strict ;
- Dioxus interdit dans une app déclarée migrée ;
- Axum/SQLx interdits sans owner Rust actif ;
- contrat canonique généré ;
- Playwright multi-moteur ;
- Clever smoke ;
- licence et trusted dependencies ;
- deadline sur toute double implémentation ;
- détection des anciens noms.

ADR-0033 devient `superseded` par le nouvel ADR Bun Fullstack / Rust Specialized.

---

## 26. Incrément de préparation immédiat

Créer immédiatement le nouveau repository canonique, isolé des dépôts
historiques, avec :

1. `vision.md` ;
2. ADR Bun Fullstack / Rust Specialized / Big Bang ;
3. plan global et workstreams ;
4. `LEGACY-MANIFEST.yaml` initial ;
5. structure racine définitive ;
6. manifests Bun, Cargo, TypeScript et Biome ;
7. toolchain Bun épinglée avec version, commit et checksums ;
8. schéma minimal Knowledge Object ;
9. conventions d’architecture et de nommage ;
10. cartographie des anciens repositories ;
11. règles Agent Factory cibles ;
12. spécification du template Bun ;
13. CI de bootstrap sans application.

Dès que la Vague 0 est validée, ce repository devient l’unique destination de
développement. La réversibilité concerne la restauration des archives, pas le
maintien d’une architecture parallèle.

---

## 27. Challenges techniques encore ouverts

### 27.1 Bun stable Rust non disponible au checkpoint

La cible est décidée, mais la dernière stable observée reste `1.3.14`. Le canary
`1.4.0-canary.1+57f349f63` doit être considéré pré-release.

**Décision recommandée :** construire la fondation et qualifier le canary, mais
ne pas effectuer de cutover production sans artefact reproductible et accepté.

### 27.2 Canary roulant

Le tag GitHub `canary` remplace ses assets. Un checksum seul garantit
l’intégrité, pas la disponibilité future.

**À résoudre :** conservation légale du binaire exact, image par digest ou build
reproductible depuis le commit.

### 27.3 Clever choisit la dernière version Bun

Le support natif actuel ne garantit pas le pin exact.

**Décision recommandée :** ne l’utiliser que lorsqu’il expose la version requise ;
sinon binaire vérifié ou OCI maîtrisée.

### 27.4 Plateforme sans framework

Ne pas utiliser Next/Vite/Hono réduit les dépendances, mais Libre AI doit alors
posséder explicitement SSR, assets, erreurs, sécurité, routing et DX.

**Garde-fou :** `web-runtime` reste mince et mesuré. Si son périmètre devient un
framework généraliste, la décision doit être rechallengée sur preuve de coût.

### 27.5 Biscuit et session navigateur

Biscuit est adapté au bearer inter-service ; le cookie navigateur est exposé au
CSRF même s’il est HttpOnly.

**Recommandation :** cookie opaque pour la session, Biscuit interne attenué.
Tester toute exception.

### 27.6 Bun.sql et RLS

L’isolation dépend du maintien du contexte tenant sur la connexion et la
transaction correctes.

**Gate :** tests PostgreSQL réels, concurrence, rollback et pool avant migration
de Feed Radar ou Sessions.

### 27.7 Un seul workspace Cargo

Cette cible force l’unification de versions/features. C’est volontaire, mais la
CI devra surveiller temps de build et feature leakage.

**Gate :** architecture tests, `cargo tree`, builds WASM et natifs.

### 27.8 Desktop et mobile

Bun/React remplace le web, pas les clients natifs.

**Décision :** aucun engagement desktop/mobile via Bun. Les cores Rust/WASM
restent disponibles ; une UI native future reçoit ses bindings depuis les mêmes
contrats.

### 27.9 Repartir sans historique

La base sera plus propre, mais `git blame` ne racontera pas l’origine du code
porté.

**Réponse :** archives, `LEGACY-MANIFEST`, provenance par composant et référence
au SHA source dans les commits de portage.

### 27.10 Capacité humaine de revue

La nouvelle stack et la refonte des noms peuvent produire plus de changements
que la gouvernance ne peut absorber.

**Réponse :** workstreams par ownership, branches courtes, intégrateurs dédiés,
merge queue, limites de modifications simultanées sur les contrats et priorité
aux gates automatiques déterministes.

### 27.11 Risque propre au Big Bang

L’absence de compatibilité accélère la construction mais concentre le risque sur
l’intégration finale.

**Réponse :** intégration continue dès la fondation, environnement cible complet,
release candidate globale et répétition du cutover. Le Big Bang concerne la
rupture avec l’ancien, pas un assemblage tardif des nouveaux composants.

---

## 28. Non-objectifs

- importer les historiques Git dans le nouveau monorepo ;
- maintenir les anciennes structures ou APIs par compatibilité interne ;
- maintenir les anciens outils pendant la reconstruction ;
- organiser des cutovers produit successifs ;
- promettre desktop/mobile via Bun ;
- remplacer Playwright par Bun.WebView ;
- migrer les outils Rust spécialisés sans bénéfice ;
- ajouter un framework serveur au-dessus de Bun.serve ;
- utiliser un hyperscaler américain ;
- conserver Dioxus dans la cible ;
- rouvrir Bun vs Dioxus sans blocage factuel majeur ;
- utiliser des APIs privées ou `wip` de Bake ;
- confondre reconstruction greenfield et perte de données, de licences ou
  d’invariants explicitement sélectionnés.

---

## 29. Livrables suivants

1. `ADR-0001-bun-fullstack-rust-specialized.md` ;
2. `LEGACY-MANIFEST.yaml` ;
3. `TARGET-ARCHITECTURE.md` ;
4. `OBJECT-MODEL.md` ;
5. `REPOSITORY-MAP.md` ;
6. `MIGRATION-ORDER.md` ;
7. `BUN-APP-TEMPLATE.md` ;
8. `AGENT-FACTORY-RULE-MIGRATION.md` ;
9. `SOVEREIGNTY-MATRIX.md` ;
10. `AGENT-PROTOCOL.md` ;
11. `TRANSFORMATION.md`.

---

## Principe fondateur

> **Libre AI construit aujourd’hui, pour des usages réels, les capacités
> ouvertes et souveraines dont nous pensons que chacun aura besoin demain. Nous
> repartons sur une base propre conçue directement pour cette cible : Bun et
> React pour les applications web, Rust pour les composants spécialisés, une
> source canonique de connaissances et de code, des preuves opposables et des
> distributions que chacun peut reproduire, contester et améliorer.**
