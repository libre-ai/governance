# ai-practices — Inventaire des features

## 1. Inventaire par thème

### Content & Activity Management
- **Activity definitions**: YAML-based scenario structure with objective, prerequisites, situation, instructions — `content/activities/core.yml`
- **Activity versioning**: version field per activity; immutable after approval — `content/activities/core.yml` (status: draft/approved)
- **Activity types**: scenario (simulation-based learning) — `content/activities/core.yml` (type: scenario)
- **Localization**: locale field (fr-FR) — `content/activities/core.yml`
- **Competency mapping**: link activity to competencies (comp-understand-ai-output, comp-check-source) — `content/activities/core.yml` (competency_ids)
- **Learning objectives**: observable_outcome tied to competency — `content/activities/core.yml` (objective)
- **Success criteria**: user-facing evaluation rules (not auto-grading) — `content/activities/core.yml` (success_criteria)

### Feedback & Assessment
- **Sourced feedback**: principle + remediation always backed by sources — `content/activities/core.yml` (feedback.principle, feedback.remediation, source_refs)
- **Risk disclosure**: explicit limitations and what-ifs for each activity — `content/activities/core.yml` (risks array)
- **Non-punitive feedback**: "I don't know" (idk) is valid submission with guidance — e2e test `parcours.spec.ts` line 83-89
- **Self-assessment**: learner records confidence/reasoning separately from answer — spec Journey 2 "Review evidence"
- **No scoring/ranking**: output never treated as grade or leaderboard — manifest emphasized in e2e test line 19
- **Verdict tags**: decision categorized (e.g. correct, partial, idk) — e2e test line 49 `.verdict-tag`

### Session & Progress Tracking
- **Session creation**: StartPracticeSession — implied by `run-session` CLI and e2e setup
- **Local progress storage**: IndexedDB-backed, never sent to server — spec section "Data", e2e test line 110+ exports local JSON
- **Session state machine**: in-progress → completed | stopped — spec section "Domain protocol"
- **Question progression**: sequential scenario questions with counter (Q1/N) — e2e test line 27, `.q-count`
- **Question selection**: numbered keyboard input (1-4) selects choice — e2e test line 56
- **In-place validation**: one-gesture validate without page reflow/scroll — e2e test line 30-52
- **Continue/repeat flow**: Enter to continue to next question; R to restart — e2e test line 97

### Export & Reset
- **Progress export**: JSON bundle with answered_count, outcomes array, RUM metrics — e2e test line 108-117
- **Progress deletion**: learner deletes all local progress without account dependency — spec Journey 3 "Export/reset"
- **Portable progress**: no server dependency, can be archived offline — e2e test filename: "rumble-ai-practices-synthese.json"
- **RUM metric tracking**: select-to-validate time, median response time in export — e2e test line 114-116

### Review & Publishing Workflow
- **Activity review**: reviewer validates source, licence, accessibility, safety — spec Journey 4 "Publish activity"
- **Human approval gate**: only reviewed activities can be published — spec "Refusal matrix" code `practices.review_missing`
- **Activity withdrawal**: hides version from new sessions but preserves ID for existing exports — spec "Release and rollback"
- **Version immutability**: activity content locked after approval — spec section "Domain protocol"
- **Review metadata**: author, reviewers, last_reviewed_at, confidence level — `content/activities/core.yml` (review section)

### Learner Experience
- **Onboarding manifesto**: intro screen with policy ("Aucune image générée n'est neutre", "jamais un classement") — e2e test line 17-20
- **Keyboard-only**: complete activity via numbers + Enter, no mouse required — e2e test line 54-62
- **Choice toggling**: first tap selects, second tap validates (one-gesture flow) — e2e test line 39-51
- **Feedback panel**: non-modal reveal in-place with remediation text — e2e test line 59, `.feedback-panel`
- **Summary synthesis**: per-category synthesis after completing all questions — e2e test line 91-96
- **No nominative output**: synthesis never identifies learner; export is anonymous — spec "Non-goals" + manifest line 19

### Accessibility & Degraded Mode
- **WCAG contrast checks**: verified via `wcag_contrast.rs` test — `apps/web/tests/wcag_contrast.rs`
- **Reduced motion**: emulates `prefers-reduced-motion: reduce` for stable e2e — e2e config line 11
- **Screen reader announced feedback**: spec requirement; implementation via Dioxus semantics
- **Offline support**: installed activities, local progress, export, delete without network — spec section "Accessibility"
- **Missing model/provider graceful fail**: uses deterministic hints, marks feedback unavailable; never changes progress to success — spec section "Accessibility"

### Content Governance
- **Corpus validation**: CLI validates all activities against schema — README line 33 `validate-activities`
- **Audit capability**: audit-corpus produces compliance report — README line 35 `audit-corpus`
- **Fixture testing**: sample session runs deterministically against fixed data — README line 36-39 `run-session`
- **Activity fixture preview**: demo activity activity-rag-citation-support runs without approval — README line 54-62 (--allow-draft-preview)
- **Source attribution**: every claim linked to approved source; media marked with license (CC0-1.0) — `content/activities/core.yml` (source_refs, license fields)
- **AI assistance disclosure**: if generated content used, disclosed with review status — `content/activities/core.yml` (ai_assistance section)
- **Competency framework**: structured learning competencies (comp-understand-ai-output, comp-check-source) — `content/competencies/`
- **Claims registry**: individual statements with evidence links — `content/activities/core.yml` (claims array with claim_id, source_ids)

### API & Persistence
- **API server proof**: local Bun.serve or Rust API — README line 40 `serve --bind 127.0.0.1:3000`
- **Session persistence**: CLI via JSON file + API via PostgreSQL (store crate) — `crates/store/migrations/0001_anonymous_cohort.sql`
- **RLS on review/publishing**: organization tenant isolation — spec section "Authentication"
- **Database inspection gate**: db-security-manifest validates schema classification — README line 71-76, ADR-0006

### UI/UX (Dioxus PWA)
- **PWA manifest**: `/manifest.webmanifest` — README line 48, spec section "Accessibility"
- **Service Worker**: `/sw.js` for offline-first functionality — README line 48, `apps/web/public/sw.js`
- **Mobile-responsive**: Lighthouse/responsive design checks — `lighthouserc.json` present
- **Dark/light theme**: stylesheet tokens CSS (themes.css, styles.css, components.css) — visible in test checks
- **Design system**: verified via contrast report (`contrast-report.json`), Libre IA bridge CSS included — `apps/web/assets/libre-ia/`

## 2. Matérité

| Domaine | État |
| --- | --- |
| **Corpus governé** | ✅ Finalisé (validation, audit, fixtures complets) |
| **Schémas contrats** | ✅ Finalisé (activity-definition.v1, activity-outcome.v1, progress-export.v1) |
| **Session locale PWA** | ✅ Preuve démo (IndexedDB, export, delete, keyboard, accessibility) |
| **API sessions** | 🔄 Proof Rust + CLI; multi-user hosting unproved |
| **Review/publish workflow** | ✅ Schéma présent (review table, RLS, approval gates) |
| **Feedback déterministe** | ✅ Proofs: règles TypeScript, pas de scoring auto |
| **Accessibility proof** | ✅ WCAG contrast tests, keyboard e2e, screen-reader structure |
| **Offline/PWA proof** | ✅ Service Worker, local storage, export/delete sans serveur |
| **Activités approuvées production** | ❌ Seulement drafts + fixtures (activity-plausible-is-not-measured, activity-rag-citation-support) |
| **Shared session runtime** | ❌ Non implémenté (multi-user pas de preuve) |

## 3. Différence vs spec verrouillée

### Absente de l'implémentation
| Feature | Spec journey | Statut |
| --- | --- | --- |
| Multiple approved activities (>1) | Journey 1-4 | ABSENT — only drafts + 2 fixtures in core.yml; production content governance waiting on human review |
| Learner self-assessment capture | Journey 2 | ABSENT — spec mentions recording reasoning; demo only submits final answer |
| Organization publishing role | Journey 4 | ABSENT — spec describes publisher separation; implementation awaits ops |
| Shared session coordination | Runtime boundaries | ABSENT — no multi-user session proof; spec reserves boundary for future |
| Model-graded feedback | Contracts | ABSENT — no scoring boundary WIT (deliberately deferred per spec) |

### Présente mais incomplète
| Feature | Spec detail | Implémentation |
| --- | --- | --- |
| Publishing API | contracts/openapi/practices.v1.yaml | Schema defined; endpoints not live-tested |
| Review evidence query | GetReviewEvidence | Schema present; RLS verified but no e2e of review queries |
| Activity withdrawal | Spec section Release | Code mentions it; no test of withdrawal hiding vs export ID preservation |
| Biscuit role facts | Auth section | Designed per spec; no proof token emission/validation in current e2e |

### Exclue par Non-goals (respecté)
| Non-goal | Implémentation | Note |
| --- | --- | --- |
| Certification | ✅ Not present (no pass/fail, no HR scoring) | |
| Employee ranking | ✅ Not present (anonymous exports, no leaderboards) | |
| Automated content generation | ✅ Not present (all activities manually reviewed) | Explicitly enforced in refusal `practices.generated_content_unreviewed` |
| Auto HR decisions | ✅ Not present (learner outcome never feeds back to org) | |
| Unrestricted prompt execution | ✅ Not present (deterministic feedback, optional model hints) | |

## 4. Recommandations d'amendement

1. **Créer ≥2 activités réelles approuvées + fixtures partagées** → Journey 1-4
   - Modifier: `content/activities/core.yml` ajouter 2-3 activités APPROVED (status: approved)
   - Schema: one approved activity already required per spec "Evidence" section
   - Recommandé: une sur vérification/source (activity-check-source) + une sur biais (activity-bias-detection)

2. **Ajouter capture self-assessment (reasoning) dans session** → Journey 2 (Review evidence)
   - Nouveau champ: `outcomes[].learner_reasoning` (text field before answer)
   - Contract: activity-outcome.v1 extends with optional reasoning JSON
   - UI: pre-answer reflection screen asking "pourquoi" before submission

3. **Finaliser publisher separation + approval workflow** → Journey 4 (Publish activity)
   - Schema: `organization_publishers` table with role('user', 'publisher')
   - API: PUT /activities/{id}/{version}/publish requires role check
   - Guarantee: learner role cannot call publish endpoint (RLS enforced)

4. **Étendre à ≥3 scenarios réels sourced** → Content Governance WP
   - Exemples: decision-tree (GDPR scenario), RAG-citation-support (already drafted), prompt-injection-risk
   - Chacun: sources confirmées, claims validées, media licensed, revision attestée

5. **Documenter review process & evidence gate** → Review workflow
   - ADR: human review criteria (source validity, bias check, accessibility pre-flight)
   - Publiée: local-review.md précisant le flow draft → reviewed → published
