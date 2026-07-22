# Dossier d'activation Notebook — écluse #5 du run γ

**Candidate immuable :** `9ee3f8d`  
**Gate B approuvée :** 2026-07-20, PR #106  
**Périmètre Gate B :** host fixture-only désactivé, classe matérielle 32+ Gio qualifiée, aucune donnée utilisateur ni activation accordée

---

## 1. Synthèse

Notebook Core v2 a reçu l'approbation Gate B sur le candidat immuable `9ee3f8d` — architecture, sécurité, cryptographie-runtime, vie privée France/UE, performance/ressources et synthèse Gate B tous APPROVE. Cette approbation porte sur le moteur Rust/WASM et le host de qualification fixture-only trois-navigateurs, sur une classe matérielle qualifiée 32+ Gio. Toutefois, Gate B n'autorise ni l'activation du chemin données utilisateur, ni la production, ni la release, ni le déploiement. Chaque volet (activation locale, production, repository public) requiert une décision propriétaire séparée énoncée dans ce dossier.

---

## 2. Volet (a) — Activation du chemin données réelles (local-only)

### Acte technique précis

Inverser le flag `NOTEBOOK_BACKUP_FEATURE_ENABLED` en passant à `1` l'environnement `NOTEBOOK_BACKUP_FEATURE_ENABLED` à la construction de l'application Notebook.

**Localisation du code :**

- **Flag de contrôle :** `apps/notebook/src/backup/feature.ts`, fonction `isNotebookBackupFeatureEnabled()` — vérifie que `process.env.NOTEBOOK_BACKUP_FEATURE_ENABLED === "1"`.
- **Consommateurs UI :** `apps/notebook/src/ui/notebook-app.tsx` — le flag contrôle l'affichage des surfaces de sauvegarde/restauration et leur comportement (les appels `CreateEncryptedBackup`, `RestoreBackup` et `DeleteWorkspace` sont refusés si le flag est `false`).
- **Consommateurs serveur :** `apps/notebook/src/server/handler.ts` — le flag conditionne la construction du middleware et le statut du manifeste de build (`backupFeature: "gate-b"` si activé, `"disabled"` sinon).

**Test de couverture :** `apps/notebook/src/server/handler.test.tsx` attend explicitement `backupFeature: "disabled"` par défaut ; le test `"keeps the backup feature disabled by default"` l'atteste.

**Postures que le propriétaire endosse en disant OUI :**

1. **Recovery-secret-code comme SEULE voie de récupération :**
   - Seize octets CSPRNG affichés en 32 hex minuscules (ex. `a1b2c3d4e5f60718293a4b5c6d7e8f90`). Code perdu = impossibilité d'accéder aux sauvegardes restaurées.
   - Source : `docs/apps/notebook.md` §Data : « recovery-secret-code.v1 (16 local CSPRNG bytes displayed as 32 lowercase hex characters) » ; aucun support des phrases mnémoniques ou de texte libre.

2. **Sémantique DeleteWorkspace = destruction locale effective :**
   - `DeleteWorkspace` supprime les records et clés de l'IndexedDB local ; une copie exportée hors de l'app demeure sous le contrôle explicite de l'utilisateur et ne peut pas être révoquée à distance.
   - Source : `docs/apps/notebook.md` §Domain protocol et §Data.

3. **Limites de stockage navigateur divulguées explicitement :**
   - Quota candidat 512 Mio testé ; au-delà, le host refuse le staging. Le vrai comportement `ENOSPC` du navigateur est qualifié séparément sur APFS jetable (APFS sparse 6 Gio, balayé après épuisement).
   - Source : `docs/apps/notebook-resource-floor.md` §Qualification de la classe requise ; `docs/apps/notebook.md` §Accessibility and degraded mode : « Storage quota or key failure blocks mutation with export/recovery guidance ».

4. **Classe matérielle 32+ Gio comme seul support déclaré :**
   - Minimum macOS arm64, 32 Gio mémoire physique, 12 CPU logiques, navigateur WASM SIMD128/Worker/Web Crypto/IndexedDB.
   - Classes 8 Gio et 16–24 Gio = observations facultatives non supportées ; aucune annonce de support futur sans preuve physique et revue.
   - Source : ADR-0006 §Décision ; `docs/apps/notebook-resource-floor.md` §Classes matérielles.

5. **Résidus ADR-0007 = diagnostic facultatif, pas preuve dangereuse :**
   - OOM réel du processus navigateur = optional-diagnostic ; reprise bornée après crash/kill reste obligatoire et n'exige pas de saturation globale RAM/swap.
   - Source : ADR-0007 §Décision (« L'OOM réel du processus navigateur est classé optional-diagnostic »).

6. **Effacement logique ≠ effacement physique :**
   - `DeleteWorkspace` efface l'IndexedDB et les clés locales (best-effort) ; aucun engagement sur l'effacement physique de la RAM, du swap ou de l'APFS.
   - Source : `docs/apps/notebook-resource-floor.md` §Conditions hors matrice matérielle : « L'effacement logique/best-effort ne prouve jamais l'effacement physique RAM ou swap ».

### Couverture et limites de Gate B

**Couvert par Gate B :**

- Crypto canonique reproduite et vérifiée (seconde implémentation, AAD, AES-256-GCM, Argon2id 64/128 Mio) — revue cryptographie APPROVE.
- Revue privée/local-only : aucune requête réseau de contenu, absence de réseau/log, identifiants CSPRNG export-scoped, aucun timestamp/révision/exclusion révélés. Revue vie privée France/UE APPROVE.
- Host produit exact (désactivé par défaut) : crash/kill/restart/redémarrage sur trois navigateurs (Chromium, Firefox, WebKit), absence d'artefact partiel, nettoyage du staging chiffré, relance du même profil, worker neuf. Revue architecture APPROVE.
- Classe 32+ Gio qualifiée : p95 ≤ 5 s (producteur), ≤ 10 s (maximal) ; RSS additionnel ≤ 256/512 Mio. Revue performance APPROVE.

**NON couvert par Gate B / différé :**

- Modèle blocs/révisions réel (domaine `CreateBlock`, `EditBlock`, `LinkBlocks`, `DeleteBlock`) : tests unitaires existent mais ne couvrent pas un vrai notebook de l'utilisateur.
- Import atomique de contenu utilisateur.
- Suppression atomique et cohérence transactionnelle sous fautes.
- Offline et Service Worker.
- Effacement physique de la RAM/OS/APFS.
- Classes 8 Gio et 16–24 Gio : aucune preuve physique.
- OOM réel du navigateur en conditions de stress portable.

Source : `docs/apps/notebook.md` §Work packages (« Les tests produit complets doivent encore couvrir le modèle blocs/révisions, l'import atomique et la suppression ») ; STATUS.md §Current G2 entry (« user backups, activation, production and release still require a separate owner milestone »).

### Rollback

Repasser `NOTEBOOK_BACKUP_FEATURE_ENABLED` à la valeur défaut (absent ou non-"1"). Le flag n'est pas capturé au déploiement ; aucune donnée utilisateur n'est inscrite dans un état "irreversible". Tout nettoyage d'IndexedDB ou cache navigateur revient à l'utilisateur (suppression du workspace local). Une restauration future d'une sauvegarde préalable relèvera des mêmes sémantiques de conflit et de fusion.

---

## 3. Volet (b) — Production et release

### Prérequis ouverts

**Bun stable vs canary :**

- Statut courant : Bun stable = `1.3.14` (903 commits avant la ligne Rust). Le candidat Gate B repose sur Bun canary `1.4.0-canary.1` (snapshot vérifié reproduisible).
- Prérequis : un choix explicite — soit (1) accepter le canary comme exception documentée et gérer deux courbes de soutien (canary + stable futures), soit (2) attendre Bun `1.3.15+` ou `1.4.0-stable` et recertifier Notebook sur cette base.
- Source : STATUS.md §Current risks : « Bun stable remains 1.3.14; the selected Rust-line commit exists only in 1.4.0-canary.1 ».

**Machinery de release et rollback (par produit) :**

- Statut courant : aucune release machinery distincte par produit ne s'est matérialisée. Les archives Bun, Rust et node sont du bootstrap, pas une approbation production.
- Prérequis : (1) définir et tester un plan de release Notebook (versioning, signatures, notes, archive), (2) tester rollback en production (restauration de version antérieure, migrations du contrat, rupture de compatibilité backward), (3) mettre en place l'observabilité post-deploy (crash reporting, erreurs IndexedDB, limites de quota atteintes).
- Référence (absence) : STATUS.md note « Application rollback must continue reading current stored contract » mais aucun protocole versioning n'est exécuté.

**Règle d'engine-revocation :**

- Statut courant : l'ADR-0002 n'énonce pas d'autorité de révocation. Une future vulnérabilité découverte dans Notebook Core ou l'app ne dispose pas de mécanisme déclaré pour desactiver les instances historiques.
- Prérequis : (1) accepter que certaines vulnérabilités critiques justifient un push de sécurité sans consentement utilisateur, ou (2) documenter une limite expresse (« pas de revocation possible »), ou (3) implémenter une vérification de timestamp/nonce signé à la création du workspace.

### Justification : pourquoi (b) ne bloque pas (a)

**Dogfooding local possible sans release :** l'activation locale (volet a) ne requiert aucune infrastructure distante, serveur, déploiement, release machinery ou stratégie de support multi-versions. Un développeur ou un propriétaire peut exécuter `NOTEBOOK_BACKUP_FEATURE_ENABLED=1 bun run dev` et tester le flux de sauvegarde/restauration sur une copie contrôlée sans engagement de production.

**Décision indépendante :** La décision de production et release est orthogonale à l'activation locale. Si l'activation révèle des défauts non couverts par Gate B (bloc/révision, import atomique, suppression), le propriétaire peut dé-activer le flag (volet (a) rollback) sans blocage du produit. Les prérequis (b) peuvent être adressés en parallèle ou reportés à une vague ultérieure.

Source : STATUS.md §Next controlled milestone : « Owner decision required: Notebook user-data path activation, production, release, infrastructure or deployment still needs its own explicit milestone ».

---

## 4. Volet (c) — Activation du repository public (`libre-ai/notebook`)

### Exigences ADR-0008 et G5

**Topologie cible :** ADR-0008 §Décision établit que `libre-ai/notebook` est un « reserved-product-home » où vit le code produit développé (issues, PRs, releases), consommant le socle comme dépendance versionnée. Actuellement, les repositories historiques produits sont gelés `frozen-until-wave-4` jusqu'à la décision d'activation propriétaire.

**État current :** `ecosystem/repositories.v1.yaml` liste `libre-ai/notebook` avec :

- `role: reserved-product-home`
- `lifecycle: frozen-until-wave-4`
- `exposure: spec-published`
- `canonical_paths: [apps/notebook, crates/notebook-core]`

**Acte de déverrouillage :** Passer `lifecycle` de `frozen-until-wave-4` à `active` et `exposure` à une cible (ex. `usable-verifiable`). C'est le changement machine-readable unique.

### Mécanique de miroir et changement d'exposition

1. **Création du repository :** À l'activation, créer `libre-ai/notebook` comme un fork/split de `libre-ai/libre-ai` contenant `apps/notebook` + `crates/notebook-core`, avec :
   - History complet depuis le Big Bang (2026-07-16) ;
   - Branch `main` alignée sur le commit activation du socle ;
   - Tags de milestone (Gate A, Gate B candidats) préservés.

2. **Changement d'exposition :** Le manifeste `ecosystem/repositories.v1.yaml` devient l'autorité publiée ; ce changement rend le repository visible à tous les clients (SDK, site, documentation) qui consomment l'inventaire.

3. **Dépendances de package :** Les packages Notebook (`@libre-ai/notebook-core`, `@libre-ai/notebook`) nécessitent une publication npm/mirror selon `docs/transformation/EXECUTION-SEQUENCING.md` G5 et le registre d'invariants ADR-0008. Ceci est orthogonal au déblocage du repository GitHub.

### Connexion à la vague 4b (Polaris)

ADR-0008 édicte que :

- G4 (phase de base avant wave 4b) reste bloquée jusqu'à la décision orchestrateur Polaris.
- Wave 4b réplique le pattern Notebook sur les moteurs restants (Radar, Policy, Boussole) en parallèle sous orchestration.
- G5 publie et active les repositories produits selon des décisions propriétaires séparées.

L'activation (c) ouvre officiellement l'espace projet Notebook public ; elle n'autorise pas à elle seule la publication des packages ou la prise de dépendance par d'autres produits.

Source : STATUS.md §Wave-execution decisions : « First engine: Notebook (pilot), then the remaining engines in parallel orchestrated by the layer-2 method Polaris (wave 4 split into 4a/4b) » ; ADR-0008 §Conséquences : « les phases G0–G4 et la discipline work-packages sont inchangées ; G5 publie packages, documentation, packs et active les repositories produits sur décision propriétaire ».

---

## 5. Recommandation de séquence

### (a) puis (b) / (c)

**Séquence proposée :**

1. **Étape 1 : Activation (a) seule**
   - **Quand :** immédiat, après signature du propriétaire de ce dossier sur volet (a).
   - **Acte :** set `NOTEBOOK_BACKUP_FEATURE_ENABLED=1` en développement local ou dans une branche de test.
   - **Objectif :** dogfooding réel sans engagement production — tester le flux complet (création workspace, export, sauvegarde, restauration, suppression) avec le moteur Gate B actif.
   - **Critère de sortie :** un rapport de dogfooding couvrant les parcours création workspace / export / sauvegarde / restauration / suppression, avec les edge cases rencontrés — critère d'évidence, pas de durée.
   - **Sortie :** rapport d'expérience sur l'UX, les edge cases (blocages IndexedDB, quota, crashes navigateur) et confirmation de la couverture.

2. **Étapes 2 et 3 (parallèles) : (b) Prérequis production et (c) Repository public**
   - **Timing :** après sortie positive de (a).
   - **Prérequis (b) :** choisir Bun (canary exception vs attendre stable), concevoir release machinery, définir rollback, implémenter monitoring.
   - **Prérequis (c) :** coordonner avec la sortie de Polaris (wave 3 lock orchestrateur), décider du manifeste d'exposition, créer et peupler le repository GitHub.
   - **Dépendance :** aucune — (b) et (c) ne bloquent pas l'un l'autre, mais tous deux requièrent une signature propriétaire distincte.

### Justification

**Isolement du risque :** L'activation (a) est locale et destructible. Si elle révèle un défaut non couvert par Gate B (ex. conflit de révision dans la merge, corruption sous stress), le rollback ramène au baseline sans effet domino. Les cycles (b) et (c) versionnent, distribuent et engagent l'infrastructure — leurs risques sont différents et additifs.

**Feedback itératif :** Le dogfooding (a) fournit un retour utilisateur réel sur l'UX, la fiabilité locale et l'utilité perçue. Si critique, la décision de production (b) en bénéficie ; si positif, la confiance en (c) s'accroît.

**Timing des vagues :** Wave 4a valide le pattern app (Notebook), puis wave 4b réplique sur les moteurs restants sous Polaris. Activer (c) avant Polaris serait orphelin ; activer (a) d'abord laisse le temps à Polaris de mûrir.

Source : `distribution/evidence/2026-07-20-wave4a-notebook-pilot.md` : « validates the pattern once, end to end — before the parallel replication of wave 4b ».

---

## 6. Registre des risques résiduels

| Risque                                              | Source                                                         | Disposition                                                                                                                                                                           |
| --------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Modèle bloc/révision non prouvé en production**   | `docs/apps/notebook.md` §Work packages ; STATUS.md             | Différé — les tests unitaires du moteur couvrent la fermeture graphe et les exclusions locales, mais un vrai notebook de l'utilisateur reste à qualifier. Prévu volet (b)/G3.         |
| **Import atomique et suppression non qualifiés**    | `docs/apps/notebook.md` §Work packages                         | Différé — relève de G3, dans le périmètre `WP-G3-N01`.                                                                                                                                |
| **OOM processus navigateur non déterministe**       | ADR-0007 §Contexte                                             | Accepté comme optional-diagnostic — reprise bornée après crash/kill est la preuve Gate B ; OOM réel = bonus futur. Aucune saturation globale RAM/swap ne sera intentée.               |
| **Classes 8 Gio et 16–24 Gio sans preuve physique** | ADR-0006 ; STATUS.md §Current risks                            | Accepté comme observations communautaires optionnelles — aucun engagement de support jusqu'à mesure physique + revue.                                                                 |
| **Effacement physique non provable**                | `docs/apps/notebook-resource-floor.md` §Conditions ; STATUS.md | Accepté — `DeleteWorkspace` efface IndexedDB/clés locales (best-effort) ; aucun engagement sur RAM/OS/APFS. Limites de navigateur divulguées explicitement.                           |
| **Bun canary vs stable divergent**                  | STATUS.md §Current risks                                       | Accepté avec réserve — décision volet (b) requise : soit exception canary documentée, soit recertification sur stable future. Archive canary = bootstrap, pas approbation production. |
| **Aucune machinery de release/rollback**            | STATUS.md (absence)                                            | Différé — prérequis volet (b). Versioning, signatures, migration backward-compatible doivent être conçus avant release.                                                               |
| **Engine-revocation indéfini**                      | ADR-0002 (silence)                                             | Différé — prérequis volet (b). Définir si vulnérabilité critique justifie révocation sans consentement, ou accepter l'impossibilité.                                                  |
| **Dogfooding attendu avant (b)**                    | Recommandation §5                                              | Attendu — (a) seule révélera les edge cases réels ; sortie sur rapport d'évidence, pas sur durée.                                                                                     |
| **Repository public orphelin pendant G4**           | ADR-0008 ; Polaris (wave 3)                                    | Attendu — (c) sera activé après déblocage Polaris et orchestrateur wave 3, en parallèle avec (b). Timing aligné sur wave 4b replication.                                              |

---

## Conclusion

Ce dossier cadre trois décisions séparables :

- **Volet (a)** : Lift le flag `NOTEBOOK_BACKUP_FEATURE_ENABLED → "1"` pour test local sans infrastructure. Coûts : aucun (local). Bénéfices : dogfooding réel du flux backup/restore. Risque : révélation d'edge cases non couverts par Gate B (délai pour diagnostiquer et corriger).

- **Volet (b)** : Choix Bun, design release/rollback, monitoring. Coûts : stabilisation production, versioning backward-compatible. Bénéfices : produit deployable multi-instances. Bloqueurs : Bun stable (attendre vs exception canary).

- **Volet (c)** : Déverrouiller `libre-ai/notebook` public. Coûts : exposition, communication. Bénéfices : écosystème cohérent, contribution possible. Timing : après Polaris (wave 3 lock). Dépendance : (a) et (b) n'en ont pas besoin ; (c) peut attendre wave 4b.

**Signature propriétaire requise pour chaque volet.**

---

**Date du dossier :** 2026-07-22  
**Candidate Gate B :** `9ee3f8d`  
**Rédacteur :** Claude Code (agent)
