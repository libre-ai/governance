# ADR-0039 — Persistance du contrôle de run Orchestrator

- **Statut :** proposed — la fusion de cette pull request constitue l'arbitrage propriétaire
- **Choix de conception :** recommandation A validée par le propriétaire le 2026-09-11 ; l'autorité Governance reste conditionnée à la fusion
- **Étend :** ADR-0032 D38, ADR-0034 D40, ADR-0036 D42 et ADR-0037 D43
- **Applique :** I-08 (preuves et critères), I-17 (action human-touch), I-21 (zéro donnée personnelle dans Git) et ADR-0011 D4 (premier merge sécurité de couche 2)
- **Autorise :** la seule tranche de persistance du `WP-G3-O01`, dans le crate séparé `crates/agent-orchestrator-run/`
- **N'autorise pas :** service, endpoint, Biscuit, Missions ou Harness réel, worker, effet, logs runtime, secret, déploiement, checkpoint ou dépendance LangGraph/LangChain/LangSmith

## Contexte et payoff

La Phase 4A a rendu les transitions d'exécution autorisée déterministes en
mémoire. Elle ne prouve ni la sérialisation concurrente, ni l'isolation entre
organizations, ni l'atomicité entre événement, budget et projection, ni la
suppression résistante à une restauration de sauvegarde. Sans frontière
persistée qualifiée, deux processus pourraient accepter des têtes concurrentes
ou une restauration pourrait ressusciter une lignée explicitement supprimée.

Cette décision autorise une preuve PostgreSQL bornée avant toute ouverture de
service. Elle réduit l'obligation du futur runtime : charger des octets
canoniques, appliquer le cœur pur déjà accepté et refuser toute divergence. Le
store ne devient ni une seconde autorité contractuelle ni un moteur
d'exécution.

## Décision

### D1 — Isoler la capacité PostgreSQL dans le second crate Rust

Orchestrator ajoute `crates/agent-orchestrator-run/`. Le crate racine pur reste
sans I/O et sa surface publique demeure inchangée. Le nouveau crate reçoit des
`PgConnectOptions`, possède ses pools privés et n'expose ni connexion, ni SQL
brut, ni migration, ni constructeur lisant l'environnement, le système de
fichiers, l'horloge ou un secret.

Cette tranche consomme les schémas embarqués par SDK Rust et le replay du cœur
pur. Elle ne crée pas de package concurrent : le `WP-G3-O01` verrouillé reste
le seul propriétaire de `crates/agent-orchestrator-run/**` et demeure incomplet
après cette réalisation.

### D2 — Conserver les octets JCS comme autorité et rejouer toute la chaîne

Chaque événement accepté est validé contre Contracts, canonisé RFC 8785 et
stocké avec son digest SHA-256. Ces octets JCS sont l'autorité de replay ; les
tables de tête, budget et références d'attestation sont des projections
reconstructibles. À chaque append, le store recharge et revalide toute la
chaîne verrouillée avant de calculer la transition suivante.

Une transaction verrouille la tête du run, puis écrit événement, ledger,
références et projection de façon atomique. Des contraintes différées refusent
au commit une tête ou des totaux qui ne correspondent pas aux lignes immuables.
Un doublon octet-identique est idempotent ; une collision divergente refuse
fermée.

### D3 — Séparer app, rétention, restore et guard sous FORCE RLS

Les rôles cluster `libre_ai_app`, `libre_ai_retention`, `libre_ai_restore` et
`libre_ai_tombstone_guard` sont préprovisionnés `NOLOGIN`, sans superuser ni
`BYPASSRLS`. Les migrations produit vérifient leur présence mais ne les créent
pas. Les identités de connexion n'héritent que du rôle nécessaire et utilisent
des pools physiquement séparés.

Toute transaction organization-scoped exécute un `SET LOCAL ROLE` littéral et
un `set_config('app.tenant_id', $1, true)` lié. Chaque table est protégée par
`ENABLE ROW LEVEL SECURITY` et `FORCE ROW LEVEL SECURITY`. Chaque retour au
pool exécute `DISCARD ALL` ; une connexion impossible à nettoyer est détruite.
Le rôle restore est limité à la récupération pré-ouverture et ne peut ni
append, ni exporter, ni modifier un schéma, ni accéder aux méthodes applicatives.

### D4 — Rendre suppression et restauration anti-résurrection

Une suppression autorisée inscrit et conserve atomiquement un tombstone
content-free avant de retirer la lignée. Son sujet est un SHA-256 versionné et
encadré par longueurs de l'organization et du run ; des vecteurs fixes prouvent
l'égalité Rust/PostgreSQL. Le rôle rétention ne reçoit aucun accès brut
d'insertion ou lecture : des fonctions `SECURITY DEFINER` appartenant au guard
dérivent le sujet du contexte transactionnel et ne retournent qu'un résultat
fermé. Le guard reçoit uniquement `SELECT`/`INSERT` sur les tombstones sous
RLS ; il ne peut ni les mettre à jour, ni les supprimer, ni lire une autre
relation. Aucune identité de connexion ne peut assumer ce rôle.

Les tombstones expirent exactement après `P35D`, plafond déclaré des
sauvegardes ; une suppression anticipée est bloquée en base. Lors d'une
restauration, le rôle restore charge d'abord un registre de suppressions
indépendamment protégé et accompagné d'un manifeste autoritatif. Le store
recalcule son compte et son digest, exige une couverture au moins égale au
gel des writers et refuse un snapshot d'exécution plus ancien que `P35D`.
Manifeste absent, incomplet, périmé ou incohérent refuse la pré-ouverture.
Seulement après cette preuve, restore rejoue les tombstones non expirés contre
les lignées restaurées, les supprime par pages bornées, puis exige un compte
résiduel nul. Ce zéro est nécessaire mais jamais suffisant sans preuve de
complétude et de fraîcheur du registre. Le crate vérifie ces faits mais ne les
authentifie pas et ne contrôle aucun gel de writers ni démarrage de service ;
ces autorités restent séparément fermées.

### D5 — Mesurer le coût O(n) et interdire le branchement production

Le nombre d'instructions SQL d'append reste constant, mais le volume canonique
chargé, validé et rejoué croît en `O(n)` avec la chaîne. Les benchmarks
PostgreSQL publient tailles, octets, mémoire et percentiles sur des longueurs
fixes, sans seuil dépendant du matériel. Les plans de requête bornés doivent
utiliser les indexes organization/run/sequence.

Aucun service de production ne peut consommer cette implémentation avant une
autorisation distincte d'état incrémental ou une borne autoritative démontrée
par les mesures. Un checkpoint de framework n'est pas une solution admise par
implication.

### D6 — Arrêter avant merge sur dossier indépendant

Le candidat immuable reçoit des revues architecture/performance, sécurité,
vie privée/souveraineté et complétude sur le même SHA. Toute modification
invalide les verdicts précédents. Les preuves couvrent PostgreSQL réel,
concurrence, RLS, replay, rétention, suppression/restauration, compatibilité,
couverture et rollback.

ADR-0011 D4 impose ensuite un hard stop : le premier merge de persistance
sécurité de couche 2 exige un prononcé explicite du propriétaire. L'approbation
du design, du présent ADR, du plan ou de la création de PR ne vaut pas ce
prononcé.

## Sécurité et vie privée

Les APIs publiques utilisent des types validés et des erreurs à cinq codes
constants. `Display` et `Debug` n'exposent jamais SQL, détail de connexion,
organization, run, digest, document, chemin ou valeur rejetée. La bibliothèque
ne logue rien ; les fixtures sont synthétiques et un gate recherche les
contenus interdits.

Les tests PostgreSQL réels prouvent l'absence de lecture, mutation, inférence
ou collision cross-organization par toute méthode publique. Ils empoisonnent
et annulent des sessions de pool, attaquent les privilèges de chaque rôle,
injectent des échecs à chaque frontière SQL et vérifient qu'aucun état partiel
ne devient visible.

## Qualité, performance et complétude

Toute logique non triviale suit rouge-vert-refactor. Format, Clippy sans
warning, rustdoc sans warning, tests unitaires/intégration/E2E, compatibilité
publique, inventaire de dépendances et gates Bun sont bloquants. La couverture
générée reste au minimum de 87 % des lignes et 90 % des fonctions.

SQLx 0.9 et Tokio sont épinglés avec leurs seules features nécessaires, sous
licences MIT/Apache-2.0 compatibles. PostgreSQL 14+ avec `pgcrypto` est la cible
portable ; Clever Cloud PostgreSQL reste la cible UE déclarée, sans autoriser
ici un provisionnement ou déploiement.

## Compatibilité et rollback

Le changement est additif et ne modifie aucun contrat wire. Avant consommateur,
le rollback est le retrait du crate. Après application, les migrations restent
forward-only : le code peut être épinglé ou reverté, mais les événements
canoniques et tombstones ne sont ni réécrits ni détruits par une down-migration.
Le rôle restore reste absent de toute identité applicative.

## Alternatives rejetées

### Ouvrir le service runtime complet

Rejeté : stockage, autorisation, exposition réseau et effets seraient alors
qualifiés ensemble, empêchant d'attribuer correctement une violation de
causalité ou d'isolation.

### Persister une projection JSON comme autorité

Rejeté : elle dupliquerait la sémantique du cœur pur et pourrait dériver des
octets contractuels. Seule la chaîne JCS validée est autoritative.

### Introduire un repository ou event-store générique

Rejeté : aucun troisième consommateur ne justifie cette abstraction et elle
élargirait les surfaces SQL et de configuration sans réduire le risque.

### Utiliser LangGraph comme checkpoint

Rejeté : LangGraph deviendrait une spécification implicite et une dépendance de
restauration. Il reste un oracle non normatif de questions et scénarios de
panne, supprimable sans modifier Missions ni Orchestrator.

## Gate d'acceptation

La tranche de persistance n'est mergeable que si une même révision immuable
prouve :

1. les octets JCS, digests, replay complet et projections cohérentes ;
2. l'atomicité sous concurrence et échec injecté dans PostgreSQL réel ;
3. `FORCE RLS`, les quatre rôles minimaux et le nettoyage des pools ;
4. la rétention mission bornée, la suppression atomique et la restauration
   tombstone-first sans résurrection, avec registre complet et frais ;
5. les pages bornées, plans indexés, mesures `O(n)` et blocage production ;
6. la compatibilité, couverture, documentation, rollback et tous les gates ;
7. quatre verdicts indépendants acceptant le même SHA ;
8. le prononcé propriétaire ADR-0011 D4 après ces preuves et avant merge.

Tout finding Blocking ou Major invalide les preuves de la révision. La fusion
de cette tranche ne complète pas `WP-G3-O01` et n'autorise aucun service,
effet, worker, mission réelle ou déploiement.
