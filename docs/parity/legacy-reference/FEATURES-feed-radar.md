# feed-radar — Inventaire des features

## 1. Inventaire par thème

### Subscription Management
- **Subscribe to feed**: user submits HTTP(S) feed URL via API/CLI — `crates/api/src/handlers/subscriptions.rs`, `migrations/20260127000003_create_feeds.sql`
- **Feed polling**: scheduled fetch with priority levels (hot 15m, warm 1h, cold 4h) — `migrations/20260127000003_create_feeds.sql` (priority, last_fetched_at)
- **Folder organization**: feeds grouped in folders — `migrations/20260127000002_create_folders.sql`
- **Feed metadata**: auto-normalize title, description, site_url, icon_url from XML/JSON feed — `migrations/20260127000003_create_feeds.sql`
- **Feed state tracking**: etag/last-modified for conditional fetch, error_count, last_error — `migrations/20260127000003_create_feeds.sql`

### Article/Item Processing
- **Article normalization**: parse title, author, summary, content, image_url, published_at from feed items — `migrations/20260127000004_create_articles.sql`
- **Deduplication**: GUID-based per feed to prevent duplicate ingestion — `migrations/20260127000004_create_articles.sql` (UNIQUE(feed_id, guid))
- **Article reading state**: is_read, read_at timestamps — `migrations/20260127000004_create_articles.sql`
- **Starring**: is_starred with timestamp — `migrations/20260127000004_create_articles.sql`
- **Hiding**: is_hidden, hidden_by_rule_id for rule-based filtering — `migrations/20260127000004_create_articles.sql`
- **Unread count tracking**: automatic counter per feed — `migrations/20260127000004_create_articles.sql` (feed triggers)
- **Word count estimation**: for reading time — `migrations/20260127000004_create_articles.sql`

### Rule Engine
- **Rule creation**: user defines rules with config JSONB — `migrations/20260127000005_create_rules.sql`
- **Rule types**: regex (pattern-matching on title/content) — `migrations/20260127000005_create_rules.sql` (rule_type='regex')
- **Rule actions**: hide, star, tag, mark_read — `migrations/20260127000005_create_rules.sql` (action field)
- **Rule scope**: apply to specific feed/folder or all — `migrations/20260127000005_create_rules.sql` (feed_id, folder_id)
- **Rule priority**: evaluation order — `migrations/20260127000005_create_rules.sql` (priority)
- **Stop on match**: short-circuit further evaluation — `migrations/20260127000005_create_rules.sql` (stop_on_match)
- **Rule state**: is_active, match_count, last_match_at — `migrations/20260127000005_create_rules.sql`
- **Versioned rule sets**: multiple rule versions with activate/replay — spec mentions `ActivateRuleSet`, `ReplayRuleSet`, not yet visible in migrations

### Curated Export & Review
- **Curated export**: portable JSON export of subscriptions, rules, decisions with provenance — spec `ExportCuration`, UI proof in `e2e/tests/curated-review.spec.ts`
- **Replay against rule version**: user can replay decisions against different rule set without mutating history — spec `ReplayRuleSet`, deterministic engine not yet implemented
- **Decision explanation**: textual reason why item was retained/rejected — spec requires, evidence in test: "raison visible", "Examiner la preuve technique"
- **Technical proof**: SHA256 hash of evaluation — `e2e/tests/curated-review.spec.ts` (sha256 proof visible in disclosure)
- **Inspect source**: user views original normalized feed source, matched rules, decision logic — spec `GetFetchEvidence`
- **Portable curated set**: offline-ready JSON with no service dependency — `e2e/tests/curated-review.spec.ts` (no remote requests, no localStorage)

### Feed Formats & Parser
- **RSS 2.0 parsing**: feed_type detection — `migrations/20260127000003_create_feeds.sql`
- **Atom 1.0 parsing**: feed_type detection — `migrations/20260127000003_create_feeds.sql`
- **JSON Feed 1/1.1 parsing**: feed_type detection — `migrations/20260127000003_create_feeds.sql`
- **OPML import**: CLI demo `cargo run -p feedmind-cli -- opml-summary --file examples/demo.opml` — `README.md`, crate `crates/opml/`
- **HTML/embedded media**: image_url extraction — `migrations/20260127000004_create_articles.sql`
- **Decompression**: bounded input/output handling — README mentions bounded resource gates
- **Encoding validation**: UTF-8 only, no raw bytes retained — spec refusal `radar.encoding_unsupported`
- **Malformed feed handling**: closed refusal codes for XSD/DTD/entity attacks — spec refusal matrix lines 51-58

### UI/UX (Dioxus Web Proof)
- **Curated review screen**: H1 "raison visible", displays item title, decision tag, matched rules — `e2e/tests/curated-review.spec.ts`
- **Keyboard navigation**: disclosure via Enter, navigation via arrow/Enter — `e2e/tests/curated-review.spec.ts`
- **Mobile-responsive**: viewport tests Chromium/Firefox/WebKit mobile widths — `README.md`
- **Zero browser storage**: no localStorage, sessionStorage, ServiceWorker — `e2e/tests/curated-review.spec.ts` checks === 0
- **Dark/light theme support**: via stylesheet tokens — `e2e/tests/curated-review.spec.ts` checks for tokens/themes/components CSS

### Data Isolation & Security
- **Tenant isolation via RLS**: session user_id scoped to all queries — `migrations/20260711000001_enforce_tenant_rls.sql` (ADR-0006)
- **Worker lease model**: per-tenant/source/window idempotency — spec mentions, not visible in current schema
- **SSRF denial**: bounded destination policy (no loopback/private/link-local/metadata ranges) — spec refusal `radar.destination_forbidden`
- **Redirect bounds**: tracked, must not exceed bound or change to forbidden destination — spec refusal `radar.redirect_forbidden`
- **No raw body retention**: only normalized canonical JSON kept, hostile bytes quarantined then discarded — spec section "Data"
- **Export one-use tokens**: short-lived download tokens, not stored in Biscuit/browser — spec section "Authentication"
- **Internal worker Biscuit tokens**: attenuated to tenant, source ID, fetch/record ops, short expiry — spec section "Authentication"

### Observability & Debugging
- **Fetch evidence logging**: what was fetched, why it passed/failed, normalized form — spec `GetFetchEvidence`
- **Decision replay logs**: all evaluations linked to original normalized item — spec `CompareRuleReplays`
- **Error classification**: closed enum refusal codes for every rejection type (41 codes) — spec "Refusal matrix"

## 2. Matérité

| Domaine | État |
| --- | --- |
| **Données, schémas, contrats** | ✅ Finalisé (migrations complètes, contracts/ fixtures) |
| **Parser/normaliseur** | 🔄 Proof CLI (deterministic golden fixtures), engine boundary pending Architecture verdict |
| **Rule evaluator** | 🔄 Proof CLI (deterministic evaluation), Rust specialization pending |
| **Worker/scheduler** | 🔄 Code structure présent, refresh intervals validés, pas de production ops |
| **API/sessions** | ⚠️ Sessions table créée, API adapters stubbed, no live multi-user proof |
| **UI (Dioxus)** | ✅ Curated review slice proves offline + keyboard + accessibility |
| **RLS/tenant** | ✅ Enforced by migrations, roles provisioned per spec |
| **Interactive import** | ❌ Non commencé (spec "PreviewSubscription" — bounded discovery stub) |
| **Hosted multi-tenant ops** | ❌ Non commencé (infra, observability, billing unproved) |

## 3. Différence vs spec verrouillée

### Absente de l'implémentation
| Feature | Spec journey | Statut |
| --- | --- | --- |
| Subscribe safely (preview + bounded discovery) | Journey 1 | ABSENT — PreviewSubscription command not wired; OPML parsing present but no interactive preview |
| Inspect/replay with version comparison | Journey 3 | ABSENT — ReplayRuleSet command not exposed; deterministic proof exists but no UI |
| Rule versioning (CreateRuleSet, ActivateRuleSet) | Journey 2 | ABSENT — single rule table, no version/activation tracking schema |
| Worker coordination (leased jobs, RLS per-window) | Domain protocol | STUB — scheduler code present, lease logic not visible in schema |
| Fetch bounded discovery | Journey 1 | ABSENT — no limit contract on discovery redirects or item count during preview |

### Présente mais incomplete
| Feature | Spec detail | Implémentation |
| --- | --- | --- |
| Refusal codes | 41 closed enum codes | Code only present in spec refusal matrix; parser doesn't emit them yet (engine pending) |
| Export/delete | Journey 4 + Domain | ExportCuration stub; DeleteCurationData schema presence unclear |
| HTML/script safety | Non-goal: no execution | Parsing assumes feed; no script tag stripping observed |
| TTL on exports | Auth/contracts | One-use tokens mentioned; no expiry/rotation contract visible |

### Exclue par Non-goals (respecté)
| Non-goal | Implémentation | Note |
| --- | --- | --- |
| Web crawler | ✅ Not present (feeds only, no link discovery) | |
| Feed HTML/script execution | ✅ Not present (parsing, no render) | |
| Opaque ranking | ✅ Not present (rules are transparent, regex + actions) | |
| Cross-tenant analytics | ✅ Enforced RLS (no aggregate queries possible) | |
| Raw hostile bodies stored | ✅ Not present (quarantine + discard after normalize) | |

## 4. Recommandations d'amendement

1. **Ajouter schéma rule versioning + activation** → Journey 2 (Curate)
   - Nouveau: `rule_sets` table (id, user_id, version, created_at, is_active)
   - Nouveau: `rule_set_members` (rule_set_id, rule_id, position)
   - Modifier: `articles.evaluation_log` enrich avec rule_set version + SHA
   
2. **Compléter PreviewSubscription (bounded discovery)** → Journey 1 (Subscribe safely)
   - Contract: max 5 redirects, final URL must match allowlist, max 50 items preview
   - UI: feed detail modal with "confirm one canonical source and schedule"
   - Refusal codes: `radar.destination_forbidden`, `radar.redirect_forbidden`

3. **Wirer export/delete UI + cleanup task** → Journey 4 (Export/delete)
   - Voyage existant dans spec; UI stubs absent; delete cascades via RLS audit

4. **Ajouter Worker Biscuit + lease heartbeat** → Infrastructure & Release WP
   - Schema: `fetch_leases` (tenant_id, source_id, window, acquired_at, expiry)
   - Guarantee: idempotent per window; lease check before fetch start

5. **Finaliser deterministic engine + golden vectors** → Specialized Rust WP
   - Boundary WIT: input source bytes + limits + rule JSON → canonical normalized output
   - Evidence: 43 parse cases + 18 evaluation + 43 boundary tests (per ADR spec)
