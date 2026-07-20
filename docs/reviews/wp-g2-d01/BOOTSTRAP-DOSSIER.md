# Dossier d'amorçage — WP-G2-D01, première barrière sécu-critique de la couche données (ADR-0011 D4)

- **Date :** 2026-07-20 · **Run :** jalon α · **PR :** #123 (`feat/wp-g2-d01-data-platform`)
- **Nature :** **ARRÊT DUR D'AMORÇAGE (ADR-0011 D4)** — premier merge sécu-critique de la couche données (première barrière RLS). Le dossier est produit, puis STOP pour prononcé propriétaire. Ce prononcé amorce la chaîne de confiance : les merges suivants de même nature (même couche, même type de garde-fou) se prononceront automatiquement sur revue indépendante propre. Unique par couche, pas permanent (distinct de la porte V3, D3).

## 1. Ce qui est livré

La plateforme données WP-G2-D01 complète : les deux couches exigées par la revue initiale (défense en profondeur applicative **et** barrière PostgreSQL obligatoire).

| Brique                            | Fichiers                                                                                                    | Preuve                                                                                                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Harness de test                   | `packages/testing/` (PGlite)                                                                                | 4 tests (boot, migrations ordonnées, abort atomique, reset session)                                                                                                                          |
| Migrations plateforme             | `packages/data/migrations/000{0,1,2}_*.sql`                                                                 | rôle NOLOGIN least-privilege ; `ENABLE + FORCE RLS` ; policies USING+WITH CHECK sur `app.tenant_id` ; CHECK format tenant ; receipts append-only (grants SELECT+INSERT) ; CHECK plafond 35 j |
| Barrière brute (SQL, zéro helper) | `src/adapters/rls-barrier.integration.test.ts`                                                              | 15 tests : posture du rôle, RLS forcée, deny deux-tenants sur SELECT/INSERT/UPDATE/DELETE, fail-closed sans contexte, CHECKs structurels, refus TRUNCATE/ALTER                               |
| Adapters (pont bi-contexte)       | `src/adapters/{tenant-transaction,retention-rules-store,deletion-receipt-store,expired-selection-query}.ts` | ALS+SET LOCAL liés ; validation contrat avant SQL ; receipts append-only ; requête horloge-contrôlée anti-injection                                                                          |
| Ports couche 3                    | `src/adapters/{projection-cache-port,blob-store-port}.ts`                                                   | Redis (TTL obligatoire, jamais autorité) ; Cellar (deletion enqueue-only content-addressed) ; doublures in-memory ; clients réels = G4                                                       |
| Suppression active bout-en-bout   | `src/adapters/active-deletion.ts`                                                                           | purge cache retry-bornée avant mutation, transaction tenant unique, receipt contrat-valide persisté                                                                                          |

**Preuve globale (canary CI exact, darwin-aarch64 snapshot) :** suite racine `bun run check` verte — **546 tests, 0 échec**, lint + typecheck clean. Preflight D5 vert (voir dossier Phase 0).

## 2. Critères d'acceptation WP-G2-D01 (verrouillés) — état

1. **Deux-tenants + contexte manquant refusent toute requête cross-owner/cross-tenant.** ✅ Prouvé en SQL brut (`rls-barrier`, 4 verbes) ET via les adapters ; fail-closed sans `app.tenant_id`.
2. **Bornes de rétention, minima/maxima configurables et suppression active produisent une évidence valide.** ✅ `retention-rules-store` (validation contrat avant SQL) + `active-deletion` (receipt contrat-valide persisté).
3. **Le restore-replay ne ressuscite pas une suppression acceptée et les backups restent bornés à 35 j.** ✅ `restore-replay` fail-closed + CHECK SQL plafond + `backup-ceiling`.

## 3. Revue indépendante K4 (relecteurs ≠ implémenteur)

Deux humanGates du WP, lancées séparément, sur le commit immuable **c4f49cb** :

| humanGate                       | Verdict                     | Bloquant sur ce commit | Conditions                                                                                                                                                                                                          |
| ------------------------------- | --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rls-adversarial-review`        | **APPROVE-WITH-CONDITIONS** | Aucun                  | F-01 (le wrapper de pool G4 doit appeler `clearPooledSession` en finally + test multi-connexion) ; F-03 (spec/ADR listant les sources autoritatives de `tenantId`, K2). Les deux visent **G4/spec**, pas ce commit. |
| `migration-and-deletion-review` | **APPROVE-WITH-CONDITIONS** | Aucun                  | M-09 (refus legal-hold avant mutation) — **fermé** au commit 19842b5 : documenté comme précondition d'autorisation amont (couches auth/orchestration), déféré explicitement.                                        |

Dossiers : `docs/reviews/wp-g2-d01/RLS-ADVERSARIAL-VERDICT-c4f49cb.md`, `MIGRATION-DELETION-VERDICT-c4f49cb.md`. Points forts relevés par les deux : défense en profondeur (ALS+RLS indérivable), fail-closed, least-privilege, CHECKs structurels tenant même pour un rôle bypass-RLS.

## 4. Limites assumées (documentées, non bloquantes)

- **PGlite single-connection** : le pool-clearing est prouvé comme **sémantique** (`DISCARD ALL` purge un GUC session planté hors SET LOCAL), pas comme comportement multi-connexion réel — condition F-01, câblage G4.
- **Ports Redis/Cellar** : interfaces + doublures in-memory ; clients réels = G4 (provisioning Clever Cloud, I-07).
- **`@libre-ai/retention` (job worker)** : différé — non requis par les trois critères verrouillés, et le nom est hors carte Lexicon signée (créable seulement à son activation).

## 5. Décision demandée

**Prononcer l'amorçage de la couche données** = autoriser le merge de la PR #123 (squash), ce qui :

1. acte le pattern de revue RLS/suppression validé une fois humainement (les prochains merges de même nature s'auto-prononcent sur revue indépendante propre, D4) ;
2. clôt le dernier reste de D01 ; ouvre WP-G2-Q01 (harness qualité, dernier WP de G2) ;
3. porte au backlog G4 les deux conditions RLS (F-01, F-03) comme préconditions de provisioning.

Gates CI de #123 : à re-vérifier vertes au moment du merge (branche rebasée sur main après #130/#131). **Je ne merge pas en autonome — arrêt dur D4.**
