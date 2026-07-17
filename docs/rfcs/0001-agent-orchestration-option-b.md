# RFC-0001 — Orchestration agentique par contrats, harness isolé et adaptateur Pi

- **Statut :** draft — candidat à revues architecture et sécurité
- **Portée :** Specification Lock préalable à tout orchestrateur ou harness
- **Risque :** critique
- **Autorise une implémentation :** non

## Contexte

`vision.md` diffère explicitement l’orchestration agentique tant qu’un RFC, des contrats d’exécution et de contrôle, un harness et un work package séparé ne sont pas approuvés. `apps/missions` reste l’autorité du workflow humain ; aucun runtime agentique ne peut approuver une mission, accepter un résultat, merger, releaser ou déployer.

L’étude de `xai-org/grok-build` confirme l’intérêt de plusieurs patterns — plan lecture seule, sous-agents, worktrees, budgets, suivi des changements, sandbox, redaction et harness déterministe — mais son workspace complet n’est pas une base acceptable pour Libre AI : taille et closure de dépendances élevées, couplages xAI/Mixpanel/Sentry/GCS et sémantiques fail-open incompatibles avec la cible.

Source étudiée :

- dépôt public : `xai-org/grok-build` ;
- commit : `98c3b2438aa922fbbe6178a5c0a4c48f85edc8ce` ;
- `SOURCE_REV` : `124d85bc5dc6e7805560215fcc6d5413944920e1` ;
- licence du code principal : Apache-2.0.

Pi couvre déjà l’interaction terminal, les sessions, la compaction, les providers, les skills et l’extensibilité TypeScript. Cette RFC retient Pi comme worker de code remplaçable, jamais comme autorité de mission ou frontière de sécurité.

## Décision proposée

Adopter une architecture à quatre frontières :

```text
Missions (Bun/TypeScript, autorité humaine)
  └── autorisation d’exécution liée au digest du plan
      └── Agent Orchestrator (Rust spécialisé, contrôle et budgets)
          └── Agent Harness (Rust système, sandbox et preuves)
              └── adaptateur worker Pi par RPC JSONL
```

1. **Missions** possède proposition, risque, approbation du digest exact d’un plan, autorisation d’exécution, décisions humaines et verdict final.
2. **Agent Orchestrator** compile un corps de plan déterministe à partir des contrats approuvables, puis possède l’état d’un run, l’idempotence, les commandes, la consommation monotone des budgets et l’émission d’événements causaux. Il ne peut pas autoriser son propre plan.
3. **Agent Harness** possède processus, filesystem, réseau, gateway provider, secrets éphémères, worktrees et collecte d’évidence. Une isolation exigée mais indisponible refuse le démarrage.
4. **Pi** est lancé comme processus externe derrière un adaptateur RPC versionné. Il ne reçoit que le workspace et les outils autorisés, plus un jeton local court lié au run ; il ne reçoit aucun secret du provider amont.
5. **Proof/Artifact** possèdent les preuves et artefacts content-addressed. Missions et l’orchestrateur ne conservent que leurs références digérées.

Pi ne devient pas une dépendance métier des applications et aucun objet HTTP, session navigateur ou accès DB produit n’entre dans le harness.

## Invariants normatifs à verrouiller

### Corps de plan et autorisation d’exécution

Un futur `ExecutionPlanBody v1`, produit par l’orchestrateur sans droit de l’autoriser, doit être canonique, strict et lié par SHA-256 à :

- `tenantId` et `missionId` ;
- handoff planning-only et digest du `SpecPackage` ;
- critères d’acceptation proposés ;
- profil d’outils et chemins autorisés ;
- budgets de durée, appels outils, tokens, processus, fichiers, octets et concurrence ;
- politique réseau `none` ou allowlist d’origines exactes ;
- politique d’egress modèle : classification autorisée, sources et chemins, octets maximaux, rétention et exigence ZDR ;
- digest du profil de sandbox, manifests worker/extensions/skills et politique provider ;
- destinations Proof/Artifact autorisées.

La préimage et la sérialisation canonique sont définies par le profil du contrat. Elles n’incluent ni approbation, ni autorisation, ni identifiant de run. Missions présente le corps et son digest à l’approbateur, puis `MissionRecord v2` conserve ce digest et les références d’approbation.

Après la transition humaine, Missions émet une `ExecutionAuthorization v1` séparée qui lie `tenantId`, `missionId`, révision et digest du `MissionRecord v2`, digest du corps de plan, approbations, expiration et identifiant de révocation. Le Biscuit de démarrage est atténué aux mêmes faits. Cette séparation évite toute préimage circulaire. L’orchestrateur valide le corps, l’autorisation, le token et leurs digests avant de créer `runId` et la clé d’idempotence.

Le corps est immuable après autorisation. Toute expansion de capacité, chemin, données, réseau, budget ou provider exige un nouveau corps et une nouvelle autorisation liée à son digest. Un `agent-handoff.v1` reste planning-only et ne peut pas être transformé implicitement en droit d’exécution.

### Commandes de contrôle

Un futur `OrchestratorControl v1` doit définir `start`, `pause`, `resume` et `cancel` avec :

- `tenantId`, `missionId`, `runId` et digest du plan ;
- identifiant de commande unique et clé d’idempotence ;
- révision attendue ;
- acteur et autorisation atténuée ;
- raison structurée, sans texte utilisateur requis.

`cancel` est monotone et terminal pour le run. Une révision attendue obsolète est signalée mais ne neutralise jamais un `cancel` autorisé visant exactement le même `runId` et le même digest de plan ; elle ne peut pas atteindre un autre run. `pause` interdit tout nouvel appel outil et demande l’arrêt borné des processus en cours. Si cet arrêt échoue, le harness coupe le groupe de processus et ses capacités avant tout événement terminal ; tant que l’absence d’effets ne peut pas être attestée, le run reste bloqué et ne déclare pas sa terminaison. `resume` ne remet aucun compteur à zéro.

### Événements v2

`orchestrator-event.v1` est insuffisant pour une exécution réelle. Un candidat v2 doit ajouter :

- digest du plan et identifiant du run ;
- séquence strictement croissante ;
- identifiant d’événement stable, identifiant de cause et digest de l’événement précédent ;
- commande corrélée, tentative et timestamp ;
- deltas et totaux de budgets monotones ;
- références content-addressed pour toute sortie ;
- raison et catégorie d’erreur fermées, sans message brut.

La répétition d’un événement est idempotente ; une divergence pour le même identifiant ou la même séquence est refusée. Un trou, une cause inconnue, un digest invalide ou un type inconnu est mis en quarantaine et ne peut jamais projeter un succès.

### Harness et sandbox

Un futur `HarnessProfile v1` doit décrire et attester séparément :

- racine du workspace, mounts lecture seule/écriture et chemins interdits ;
- résolution canonique des chemins et politique symlink ;
- isolation processus, UID, ressources et durée ;
- réseau worker désactivé hors socket locale du gateway ; egress gateway limité à des origines exactes via résolution et connexion contrôlées ;
- credentials éphémères, scope, expiration et variables autorisées, sans secret provider dans l’environnement worker ;
- limites de sortie, journal et artefacts ;
- moteur de sandbox, manifests exécutés et capacités kernel réellement appliquées.

Une sandbox n’est jamais déduite d’un prompt, d’une permission Pi ou d’un worktree. Un profil obligatoire qui ne peut pas être appliqué échoue fermé. Les worktrees isolent les modifications, pas les privilèges. Les fichiers ignorés, répertoires personnels, sockets d’agent et stores de credentials ne sont jamais copiés par défaut.

Une permission shell porte sur un exécutable résolu et ses arguments structurés, jamais sur un simple préfixe de chaîne. Les chaînes, pipes, substitutions, sous-shells et wrappers sont refusés sauf capacité explicite couvrant chaque effet.

### Autorisation

Biscuit reste deny-by-default avec tenant obligatoire :

- le contrôleur humain peut autoriser une commande sur une mission et un digest de plan exacts ;
- l’orchestrateur peut contrôler un run et émettre ses événements ;
- le harness peut invoquer uniquement les outils du plan ;
- le worker peut utiliser une capacité locale atténuée à un run, un outil et une expiration ; le gateway conserve seul le secret provider amont ;
- aucun token orchestrateur/harness/worker ne peut approuver une mission, accepter un résultat, merger, releaser ou déployer.

Une panne de révocation, une clé inconnue, un tenant absent ou un digest divergent refuse l’opération. Les octets des tokens ne sont jamais journalisés.

### Budgets

Les compteurs sont monotones et conservés à travers pause, reprise, retry et changement de worker. L’orchestrateur réserve un budget avant l’action et réconcilie le consommé après l’action. Une mesure provider non attestable ne peut qu’augmenter un compteur conservateur, jamais restaurer du budget.

Tout dépassement bloque les nouveaux effets, termine ou bloque le run selon le plan, puis émet une preuve minimale. Aucun retry ne contourne une limite globale.

### Journal et vie privée

Le journal opérationnel contient uniquement identifiants techniques bornés, versions, digests, catégories fermées, compteurs et décisions de policy. Sont exclus par défaut : prompts, code, diff, chemins absolus, commandes shell, arguments outils, emails, identifiants utilisateur, tokens et messages d’erreur bruts.

Le contenu nécessaire à une preuve est stocké séparément comme artefact privé, avec classification, rétention et digest explicites. OpenTelemetry externe reste désactivé par défaut et sans contenu.

## Adaptation sélective de Grok Build

| Source/pattern | Traitement proposé | Gate avant code |
| --- | --- | --- |
| `xai-circuit-breaker` | évaluer un fork Rust renommé | closure licence/advisories + parité des 70 tests |
| `xai-grok-secrets` | extraire des règles de redaction | corpus Libre AI + tests faux positifs/négatifs |
| `xai-fast-worktree` | spike isolé, sans copie des ignored files | benchmark + threat model + remplacement des dépendances xAI |
| `xai-hunk-tracker` | reprendre le modèle d’événements, pas la crate entière | contrat Proof/Artifact distinct |
| sandbox Grok | reprendre profils et fixtures uniquement | sémantique fail-closed obligatoire |
| hashline | ne pas adopter par défaut | benchmark contre l’édition exacte Pi |
| memory/code graph | hors orchestrateur | nouveau package et consommateur approuvés séparément |
| TUI, shell, sampler, MCP hub, média, auth et télémétrie xAI | ne pas porter | hors cible |

Tout code repris conserve licence et notices, marque les modifications et reçoit un SBOM limité à sa closure. Aucun endpoint xAI, Mixpanel, Sentry ou GCS n’entre dans le graphe cible.

## Qualification de Pi

Pi est un adaptateur remplaçable et doit être qualifié avant usage :

- version et source épinglées ;
- licence et closure npm inspectées ;
- télémétrie et checks de mise à jour désactivés dans le profil harness ;
- aucun package projet auto-installé en mode non interactif ;
- extensions et skills chargés depuis un manifeste approuvé et digéré ;
- provider imposé par policy, via un gateway harness vers un endpoint local ou UE autorisé ;
- secret provider amont conservé dans le gateway ; Pi reçoit seulement un jeton local court inutilisable hors du run ;
- contenu modèle borné par classification, path scopes, taille et politique de rétention/ZDR du plan ;
- RPC JSONL validé, borné en taille et traité comme entrée hostile ;
- aucune confiance accordée aux permissions applicatives Pi comme frontière OS.

L’adaptateur ne dépend pas des types internes de Pi. Un changement de worker ne modifie ni les contrats Missions, ni le plan, ni les événements.

## Menaces et refus minimaux

Les futurs vecteurs doivent couvrir au minimum :

- handoff planning-only utilisé comme autorisation d’exécution ;
- plan ou approbation substitué après signature ;
- commande rejouée ou à révision obsolète ;
- événement dupliqué divergent, séquence manquante ou cause inconnue ;
- run cross-tenant ;
- extension de tool/path/network par sous-agent ;
- traversal, symlink et fichier ignoré contenant un secret ;
- chaîne shell autorisée par préfixe mais contenant un second effet ;
- sandbox indisponible ou attestation mensongère ;
- DNS rebinding, redirect vers adresse spéciale et loopback hébergé ;
- retry après dépassement de budget ;
- token expiré/révoqué ou revocation store indisponible ;
- prompt, code, chemin, commande, PII ou secret dans logs/OTEL ;
- worker déclarant un succès sans preuves digérées ;
- tentative d’auto-approbation, merge, release ou déploiement.

## Contrats candidats requis

Cette RFC ne crée pas encore d’autorité. Après revues favorables, un incrément contractuel séparé devra proposer :

1. `execution-plan-body.v1.schema.json` ;
2. `execution-authorization.v1.schema.json` ;
3. `orchestrator-control.v1.schema.json` ;
4. `orchestrator-event.v2.schema.json` ;
5. `harness-profile.v1.schema.json` ;
6. `mission-record.v2.schema.json` et `missions.v2.yaml`, sans modifier les autorités v1 ;
7. une politique Biscuit dédiée au run, sans élargir les droits Missions ;
8. fixtures positives et négatives pour chaque invariant ;
9. projections TypeScript/Rust reproductibles ;
10. dossier de revues architecture, sécurité et vie privée France/UE.

Les entrées de catalogue restent `candidate` jusqu’aux verdicts séparés et au jalon humain. Le work package d’implémentation est ajouté seulement après le Specification Lock et ne partage aucun `writePath` avec Missions.

## Non-objectifs

- implémenter l’orchestrateur, le harness ou une extension Pi dans cette RFC ;
- autoriser une mission réelle, un provider, un secret, une persistance ou du réseau ;
- créer un marketplace, une mémoire agentique ou un moteur agentique généraliste ;
- donner au runtime des droits de merge, release, migration ou déploiement ;
- modifier `agent-handoff.v1`, `MissionRecord v1` ou l’API Missions v1 en place ; une famille v2 candidate est requise ;
- importer l’historique Git ou le workspace Grok Build.

## Gates de passage

La RFC peut passer à l’écriture des contrats candidats seulement si :

- architecture confirme les quatre frontières et l’absence de seconde autorité Missions ;
- sécurité approuve le modèle fail-closed, les budgets et l’atténuation ;
- vie privée France/UE approuve journal, preuves, rétention et provider policy ;
- la qualification supply-chain de Pi est définie sans modifier le lockfile racine ;
- chaque ambiguïté de contrôle, causalité et comptage reçoit une sémantique testable.

L’implémentation reste ensuite bloquée jusqu’au Specification Lock, à un work package borné et à un nouveau jalon humain explicite.
