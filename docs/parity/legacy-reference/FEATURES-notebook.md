# Inventaire des features — Notebook

**Révision référence:** `dde02ed8e9a02381518c71cedf447c684b82d2de` (archive gelée)  
**Maturité repo:** Specification (aucun runtime)  
**Date de l'audit:** 2026-07-22

## 1. Inventaire des features par thème

### 1.1 Workspace et persistance

- **Workspace management** — création/suppression de workspace avec clés locales ; ADR-0002 accepte single-tenant local-only v1. `notebook.md:Purpose + Data section`
- **Encrypted block revisions** — IndexedDB stocke blocs chiffrés avec historique de révisions immuables. `notebook.md:Data section`
- **Backup/restore** — backup chiffré via CSPRNG + Argon2id/AES-256-GCM ; restore sans écrasement silencieux (explicit conflict reporting). `notebook.md:Journeys #4 + Runtime boundaries`
- **Device key storage** — Web Crypto non-exportable key quand possible ; recovery via 16-byte local secret (32 hex chars). `notebook.md:Data section`

### 1.2 Édition et organisation

- **Block capture/edit** — création et édition de blocs avec révisions locales ; chaque edit crée une nouvelle immutable revision. `notebook.md:Journeys #1 + Domain protocol`
- **Block linking and backlinks** — lier les blocs, récursive link resolution et query `GetBacklinks`. `notebook.md:Domain protocol`
- **Local search** — recherche indexée locale sans network (full-text possible). `notebook.md:Journeys #1 + Queries`
- **Revision tracking** — édits post-révélation ne surpassent jamais la version pré-révélation. `spec-locked: Journeys #2`

### 1.3 Sélection et export de contexte

- **Context selection** — sélection explicite de blocs à exporter ; prévisualisation de dépendances. `notebook.md:Journeys #2 + Domain protocol`
- **Graph closure validation** — détecte exclusions conflictuelles (bloc exclu mais requis). `notebook.md:Refusal matrix: export_dependency_missing + export_exclusion_conflict`
- **Content-addressed export** — export remappé en IDs d'export frais ; hash canonique de sérialisation. `notebook.md:Runtime boundaries`
- **Export versioning and revocation** — export immutable noté localement ; MarkExportSuperseded marque obsolète sans prétendre révoquer des copies externes. `notebook.md:Journeys #3 + Domain protocol`
- **Export preview exactitude** — PreviewContextExport hashé vs serialized export ; refusal si divergence. `notebook.md:Refusal matrix: export_preview_mismatch`

### 1.4 Sécurité et confidentialité

- **Local-only personal boundaries** — aucune position ne quitte l'appareil par défaut ; workspace = single user v1. `notebook.md:Journeys #1, #2`
- **No server persistence v1** — bloc storage local uniquement ; refusal sur tentative server persistence. `notebook.md:Refusal matrix: remote_sync_forbidden`
- **No plaintext logging** — security review exige zéro contenu network + zéro plaintext persistence. `notebook.md:Evidence section`
- **Workspace lock/unlock** — authentication locale ; unlock refuse si clé indisponible. `notebook.md:Refusal matrix: workspace_locked`

### 1.5 Gestion d'erreurs et dégradation

- **Stale revision handling** — edit ciblant une révision non-courante produit refusal. `notebook.md:Refusal matrix: revision_stale`
- **Backup authentication failure** — AEAD verification failure refuse restore. `notebook.md:Refusal matrix: backup_authentication_failed`
- **Storage quota exhaustion** — mutation refusée si quota plein ; recommandation export/recovery. `notebook.md:Accessibility section`
- **Conflict reporting on restore** — IDs égaux mais contenus divergents produisent explicit conflict entries. `notebook.md:Journeys #4 + Domain protocol`
- **Version mismatch on restore** — backup contract version sans adapter produit refusal. `notebook.md:Refusal matrix: restore_version_unsupported`

### 1.6 Accessibilité et modes dégradés

- **Offline access** — tous les chemins essentiels (edit, search, export) marchent offline post-téléchargement. `notebook.md:Accessibility section`
- **Keyboard-only navigation** — UI cœur sans dépendre souris ; graph = table/list alternative. `notebook.md:Accessibility section`
- **Screen reader support** — editor annonce state sans focus trapping ; export preview = texte lisible. `notebook.md:Accessibility section`

### 1.7 Contracts et preuves

- **Backup contract v2** — `contracts/schemas/notebook-backup.v2.schema.json` ; KDF+cipher params encoded. `notebook.md:Contracts section`
- **Context Document contract** — `contracts/schemas/context-document.v2.schema.json`. `notebook.md:Contracts section`
- **WASM Core boundary** — `contracts/wit/notebook-core-v2/world.wit` ; Argon2id mémoire-dure + AES. `notebook.md:Contracts section`
- **Golden test vectors** — `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` ; corrupt ciphertext, old versions. `notebook.md:Contracts section`

## 2. Maturité

| Zone                   | Statut              | Notes                                                                                                                                |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Spécification cœur     | ✅ Achevée          | Spec narrative + domain protocol + refusal matrix publiés. `README` + `ROADMAP` stabilisés.                                          |
| Contracts + vecteurs   | ✅ Partiels         | Schemas JSON pour backup/context définis ; `world.wit` WASM documenté ; fixture test v1 existante. ADR-0006 resource floor approuvé. |
| Cryptography           | ✅ Gate B approuvée | Preuve: cross-browser backup round-trip, reprise après crash/SIGKILL. SIMD128/Web Crypto/IndexedDB confirmés.                        |
| UI/shell               | ❌ Non implémentée  | Aucun runtime Bun/React/PWA. Offline/keyboard/screen-reader specs écrites mais non testées en UI réelle.                             |
| Block model + indexing | ❌ Stub             | Modèle blocs documenté ; aucune implémentation IndexedDB ou index local.                                                             |
| Backup/restore         | ⚠️ Fixture-only     | Crypto + schema vérifiés sur fixtures ; aucune interaction utilisateur réelle.                                                       |
| Accessibility proof    | ❌ Tests absents    | RGAA/WCAG AA visées mais non validées par audit a11y automatisé ou manuel.                                                           |

## 3. Gap table : mined features vs spec verrouillée

| Feature minée                       | Couverture spec                     | Absent de la spec | Conflit non-goals                                                                                        |
| ----------------------------------- | ----------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| Workspace management                | Journeys #4, Domain protocol        | —                 | —                                                                                                        |
| Encrypted revisions + IndexedDB     | Data section                        | —                 | —                                                                                                        |
| Block linking + graph closure       | Journeys #2, Domain protocol        | —                 | —                                                                                                        |
| Local search                        | Journeys #1, Queries                | —                 | —                                                                                                        |
| Context export + remapping          | Journeys #2, Journeys #3            | —                 | —                                                                                                        |
| Export preview exactitude           | Refusal matrix                      | —                 | —                                                                                                        |
| Backup/restore determinism          | Journeys #4, Runtime boundaries     | —                 | —                                                                                                        |
| Conflict reporting                  | Domain protocol                     | —                 | —                                                                                                        |
| Device key + recovery secret        | Data section                        | —                 | —                                                                                                        |
| Offline + keyboard accessibility    | Accessibility section               | —                 | —                                                                                                        |
| PWA installability + quota handling | Accessibility section + Journeys #1 | —                 | —                                                                                                        |
| Cloud sync (forbidden)              | Non-goals section                   | —                 | ✅ Explicitement exclu : « implicit ingestion, background cloud sync or server-side note storage in v1 » |
| Collaborative editing (forbidden)   | Non-goals section                   | —                 | ✅ Explicitement exclu : « collaborative editing »                                                       |
| RAG chat over notebook (forbidden)  | Non-goals section                   | —                 | ✅ Explicitement exclu : « RAG chat over the complete notebook »                                         |
| Public publishing (forbidden)       | Non-goals section                   | —                 | ✅ Explicitement exclu : « public publishing »                                                           |

## 4. Recommandations d'amendement

1. **Ajouter Journey #5 : « Revision history traversal »** — l'inventaire montre que chaque block revision est immuable et versionnée. La spec documente edit postérieur sans surpasser pré-reveal, mais ne décrit pas le parcours « afficher l'historique complet d'un bloc ». Proposition : interface chronologique ou arborescence de révisions, avec sélecteur « restore à cette révision » pour édits post-conflict. Cela couvrirait aussi la dégradation si key unavailable (workspace_locked) bloque les mutations mais pas les lectures.

2. **Détailler section « Export lifecycle »** — la spec note MarkExportSuperseded mais la UI pour « j'ai partagé v1, maintenant v2 existe » ne transpire pas. Ajouter : liste historique d'exports avec dates, statut (active/superseded), taille ; preview d'une export ancienne vs nouvelle. Cela renforce le non-goal « claiming remote revocation » en montrant explicitement la limite locale.

3. **Ajouter Journey « Backup versioning and recovery phrases »** — recovery-secret-code affichage et mémorisation. Spec documente le secret 16-byte + hex, mais aucune guideline UX pour : affichage fractionné, vérification checksum, prompt « avez-vous sauvegardé le secret ? » avant fermeture. Cela durcit le refusal backup_authentication_failed en expliquant la chaîne utilisateur.

4. **Expandir « Degraded mode : key unavailable »** — spec dit « Key failure blocks mutation with export/recovery guidance ». Ajouter le scénario complet : clé non retrouvée → propose export des révisions actuelles (read-only), puis recovery. Cela couvre l'accès de secours aux blocs en cas de biometric unlock failure.

5. **Détailler « Conflict resolution UX »** — spec dit « explicit conflict entries », mais pas l'interaction. Proposer : table (bloc, révision locale, révision importée, tags, contenu tronqué), options (keep local / take import / merge manual). Cela démystifie l'arbre de décision pour RestoreBackup.

6. **Ajouter gates de composants réseau/stockage** — spec mentionne « browser/storage limitations are disclosed » mais aucune matrix de features par classe matérielle (8 Gio / 16–24 Gio / macOS arm64 reference). Proposer : table (bloc max size, total workspace, backup envelope, IndexedDB quota) avec conditions (e.g., « backup sealing exige 128 Mio free ») et graceful refusal. ADR-0006 lock le floor, pas le plafond.

7. **Ajouter Journey « Local import of portable export »** — spec dit « migration source is only validated portable export », mais la UI for « j'ai téléchargé notebook-export-xyz.json, importe-le ici » manque. Proposer : validation de contract, affichage du contenu prévu, confirmation, merge ou remplacement. Cela scelle la frontière « no implicit ingestion ».

## Changements de position depuis spec lockée

Aucun changement de position détecté. Le référentiel archive documente intent stable. Gate B approuvée sur fixture crypto uniquement (2026-07-22). Toute activation utilisateur réelle attend decision propriétaire ultérieure.
