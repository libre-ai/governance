# Model Policy product phases — review remediation

- **Rejected candidate:** `95e49839e0ec2791333998a479dca72ed201042e`
- **Source reviews:** [business](BUSINESS-REVIEW.md), [technical](TECHNICAL-REVIEW.md), [architecture](ARCHITECTURE-REVIEW.md)
- **Scope:** coordinator remediation after three independent read-only reviews

## Integrated findings

| Finding | Remediation |
| --- | --- |
| Competing product-status authority and false MP-P0 progress | Removed current phase, phase status, gate status, blockers, and the retroactive passed gate. The JSON is a `draft` planning record; `GOALS.md` and `STATUS.md` are schema-pinned as the only status authorities. Every phase has external owner/wave/work-package prerequisites. |
| Unowned shared-root and locked-specification edits | Restored root `package.json` and `docs/apps/model-policy.md`; moved checker and tests under `apps/model-policy/**` and integrated them through the app package. |
| Bare-path evidence and unrelated-file acceptance | Added `evidence-record.v1.schema.json`; gate references now require allowlisted JSON record paths plus SHA-256. The checker verifies tracked regular non-symlink records, record schema/digest, phase/gate/level binding, source commit, source-commit artifact modes/digests, and supporting-review digests. |
| Unsafe checker narrowing and write order | Parsed input stays `unknown` until schema validation; schema/compile failures return stable diagnostics; projection writes occur only after all validation passes. |
| One-way gate and README drift checks | Gate headings must match registry entries bidirectionally and in order; both app and documentation projections are generated/checked. |
| Dependency-start loophole | Removed local execution status entirely. Dependency order remains acyclic planning data; activation/completion is accepted only through global authorities. |
| MP-P6 violated ranking/quality non-goals | Removed ranker, model-quality comparison, recommendations, quality corpus gates, and procurement ordering. MP-P6 is an observational evidence/operations/cost/remediation cockpit. |
| MP-P4 enforced authorization too early | MP-P4 now emits immutable asymmetric transition/revocation events only; MP-P5 exclusively consumes them and enforces profiles/traffic. |
| Phase 1 actor and approval gaps | Added per-field accountable actor, source, delegate, unknown/escalation/conflict states; added data, application, and procurement/contract owners; bound use-case-owner attestation, renewal, correction, and revocation to the passport digest. |
| Optional assistant became mandatory | Removed MP-P2 from the deterministic chain and MP-P7 dependency; managed service defines base and optional-assistance variants. |
| Monitoring action/accountability gaps | Added assignee, accountable role, due instant, escalation, approved disposition, closure evidence, ageing metrics, and versioned material-change reconciliation. |
| Managed-service commercial/privacy ambiguity | Replaced the broad guarantee with bounded commitments; added provider/key/cost modes, contractual RACI, DPA/controller/processor/subprocessor allocation, locations/transfers, audit rights, support severities, exclusions, escalation, and remedies. |
| Opaque approvals not auditable | Added customer-controlled IdP or signed role-at-time pseudonym mapping with access, retention, deletion, custody, and break-glass rules. |
| Unsafe language and missing glossary | Replaced “what can be used” and “compliance metrics”; added concise definitions for tunnel, passport, doctrine, deployment configuration, access profile, and qualified. |

## Follow-up review of `2f749ded`

The independent [business](FOLLOW-UP-BUSINESS-REVIEW.md), [technical](FOLLOW-UP-TECHNICAL-REVIEW.md), and [architecture](FOLLOW-UP-ARCHITECTURE-REVIEW.md) passes all rejected the first remediation commit. They confirmed the authority, capability-boundary, accountability, optional-assistance, and managed-service RACI corrections, then identified evidence false-greens and smaller sequencing/wording defects.

| Follow-up finding | Second remediation |
| --- | --- |
| Qualified and in-service levels were self-declared | Added exact tool versions, content-digested input identities, non-empty commands, harness requirements for verified-plus, favorable qualified verdicts, no unresolved blocking/major finding, and bounded operated-instance observations for `in_service`. |
| Required reviews were optional or reusable despite rejection | Each phase now declares required independent roles. Qualified records bind distinct non-producer reviewer references to content-addressed `review-attestation.v1` records. The checker verifies exact candidate/phase/gate/role/reviewer binding, favorable attestation verdict, zero blocking/major findings, and the human report digest. |
| Evidence hashing/parsing had a TOCTOU gap | Evidence records, review attestations, and reports are read as regular non-symlink Git-index blobs; each digest and JSON parse uses the same immutable byte buffer. Candidate artifacts and repository fixtures are read from exact source-commit blobs. |
| Evidence validation lacked adversarial coverage | Expanded the checker suite from 11 to 33 tests, including valid qualified/in-service paths and negatives for untracked/symlink records, record/fixture/operational digests, missing gate-definition binding, phase/gate/level/source-commit drift, empty reproducibility fields, missing/shared/self-review, rejecting attestations, and service observations. |
| README projection writes could partially drift | Both expected files are staged before replacement; applied replacements roll back on a later rename failure, with a test proving no projection changes when second-file staging fails. |
| MP-P4 exposed an orphan quality-monitoring path | Restricted refreshes to route operations and evidence-health observations; explicitly prohibited model-output quality measurement, model comparison, or preferred-route inference. |
| Managed-service pilot/production/commercial ordering was circular | Added a separately owner-authorized non-commercial pilot, then a qualified production-only cutover gate, then an in-service smoke/rollback/operational-window gate before separate paid-onboarding approval. |
| Metric authority, denial ownership, and “activity steering” were overstated | Limited `METRICS.md` claims to fields it owns, assigned runtime metric bindings to emitted records, made downstream authorization contracts own denial, and renamed the app summary to activity observation. |

## Counter-review of `a95c313`

The independent [business](COUNTER-REVIEW-A95C313-BUSINESS.md), [technical](COUNTER-REVIEW-A95C313-TECHNICAL.md), and [architecture](COUNTER-REVIEW-A95C313-ARCHITECTURE.md) counter-reviews approved the product/business surface but rejected the second remediation on one architecture boundary and several evidence-gate defects.

| Counter-review finding | Third remediation |
| --- | --- |
| MP-P3 selected and re-evaluated affected needs | MP-P3 now emits bounded immutable policy/exception lifecycle events only. MP-P4 is explicitly the sole consumer that selects and re-evaluates affected needs. |
| Gate criteria could drift after the evidence source commit | Every evidence record now binds the canonical gate-section SHA-256. The checker derives it from the exact source-commit phase-document blob and requires equality with the current regular Git-index blob; unstaged worktree text cannot substitute for either. |
| In-service windows could end after record creation and lacked deployment authorization | Service observations require `start < end <= recordedAt`, operated-environment identity matching the deployment, and a content-addressed tracked deployment-authorization artifact in addition to smoke, rollback, and incident evidence. |
| Evidence paths bypassed secret scanning | Removed the generic evidence-directory exclusion. The canonical Model Policy evidence subtree is checked for credential and personal-data markers; only known historical review reports and scanner fixtures keep narrow exclusions. |
| Ajv imports were indirect | Declared `ajv` and `ajv-formats` as direct app development dependencies through the workspace catalog. |
| Coverage was informative only | Added an app-local line/function threshold and a required CI step for the phase-checker coverage run. |
| Missing adversarial regressions | Added indexed semantic-drift, unstaged-worktree divergence, future-window, deployment-authorization, operated-environment, credential, and evidence-PII tests. |

## Re-review of `e03226f`

The independent [business](COUNTER-REVIEW-E03226F-BUSINESS.md), [technical](COUNTER-REVIEW-E03226F-TECHNICAL.md), and [architecture](COUNTER-REVIEW-E03226F-ARCHITECTURE.md) passes approved the business surface but rejected the third remediation for unauthorized integrator writes and three remaining evidence false-greens.

| Re-review finding | Fourth remediation |
| --- | --- |
| Shared CI, lockfile, and secret-scanner writes exceeded Model Policy write paths | Restored `.github/workflows/ci.yml`, `bun.lock`, and `tools/quality/check-secret-scan*` to their pre-remediation blobs and withdrew the app dependency entries that would require an integrator lock update. Coverage and sensitive-evidence enforcement now live in app-owned checker/tests discovered by the unchanged root test gate. |
| Roadmap and schemas came from mutable worktree files | The checker first snapshots the Git index and reads the roadmap plus all four schemas from regular indexed blobs; digest/parse/validation use those bytes, and staged-invalid/unstaged-valid adversarial tests refuse substitution. |
| Operational evidence accepted unscanned arbitrary files | Operational evidence paths are JSON-only. The checker scans every referenced evidence, attestation, report, and operational blob for credential/personal-data markers before parsing, without changing shared scanner policy. |
| Operational artifacts were hash-only claims | Added `operational-evidence.v1.schema.json` with closed authorization/smoke/rollback/incident variants. The checker requires distinct paths/IDs, expected favorable outcomes, exact evidence/phase/gate/deployment/window binding, authorization before the window, observations inside it, coherent record times, and resolved incidents. |
| Coverage required a shared CI edit | Added a repository-discovered app test that executes the app-local line/function coverage threshold; the existing unchanged root `bun test` CI gate therefore blocks regression. |
| Operational false-greens lacked regressions | Added denying, empty, unrelated, reused, sensitive, future-window, environment mismatch, invalid-digest, and valid resolved-incident cases. |

## Re-review of `a431ebb`

The independent [business](COUNTER-REVIEW-A431EBB-BUSINESS.md) and [architecture](COUNTER-REVIEW-A431EBB-ARCHITECTURE.md) reviews approved the fourth remediation. The [technical review](COUNTER-REVIEW-A431EBB-TECHNICAL.md) rejected it for two security false-greens and one mutable CLI diagnostic.

| Re-review finding | Fifth remediation |
| --- | --- |
| JSON Unicode escapes bypassed raw sensitive-marker scanning | Every parsed evidence record, review attestation, and operational record now traverses decoded JSON keys and string values through the same marker classifier before schema validation. Adversarial fixtures cover all three structured artifact classes. |
| Authorization at the observation-window boundary passed | Deployment-authorization `recordedAt` must now be strictly earlier than `windowStartedAt`; equality is rejected, and explicit before/equal/outside/record-before-observation branches are covered. |
| CLI summary reread the mutable worktree roadmap | Successful validation returns phase/gate counts directly from the already validated indexed roadmap. A staged-valid/unstaged-divergent test proves the callback does not reread mutable roadmap text. |
| Direct app imports remain declared only at root | No unauthorized manifest or lockfile write was reintroduced. Ajv/Ajv Formats app autonomy remains an explicit non-blocking integrator-owned residual until an accepted work package permits a workspace dependency and lock update. |

## Re-review of `7bfd688`

The independent [business](COUNTER-REVIEW-7BFD688-BUSINESS.md) and [architecture](COUNTER-REVIEW-7BFD688-ARCHITECTURE.md) reviews approved the fifth remediation. The [technical review](COUNTER-REVIEW-7BFD688-TECHNICAL.md) rejected it because standard JSON materialization discarded a duplicate member before the decoded sensitive-marker traversal.

| Re-review finding | Sixth remediation |
| --- | --- |
| A duplicate JSON member could hide an escaped sensitive value in its discarded occurrence | Added a bounded duplicate-aware JSON structural pass before any roadmap, schema, evidence, attestation, or operational record is materialized. Member names are compared after JSON string decoding, including escaped-equivalent names; duplicates fail closed without logging the member value or name. |
| Duplicate-member bypass lacked cross-artifact regressions | Added adversarial indexed-roadmap, escaped-key evidence-record, review-attestation, and operational-authorization fixtures, plus a malformed-structure regression. The existing post-decoding traversal remains a second independent layer. |

## Re-review of `fbc12c0`

The independent [business](COUNTER-REVIEW-FBC12C0-BUSINESS.md) and [architecture](COUNTER-REVIEW-FBC12C0-ARCHITECTURE.md) reviews approved the sixth remediation. The [technical review](COUNTER-REVIEW-FBC12C0-TECHNICAL.md) rejected it because non-fatal UTF-8 decoding could replace malformed canonical JSON bytes before validation.

| Re-review finding | Seventh remediation |
| --- | --- |
| Malformed UTF-8 could materialize as U+FFFD and pass a permissive string contract | Added one fatal UTF-8 decoding boundary for every roadmap, checker schema, evidence record, review attestation, and operational record before marker scanning, duplicate detection, or `JSON.parse`. Invalid bytes fail closed with a non-content-bearing diagnostic. |
| Structural depth did not bound total JSON work | Canonical JSON blobs now have an explicit 1,048,576-byte ceiling before decoding and parsing. |
| Schema, nested-object, depth, and malformed-byte regressions were incomplete | Added direct duplicate tests for all four schemas, escaped-equivalent and nested duplicate members, depth 65, byte-ceiling refusal, and malformed UTF-8 in roadmap/evidence/attestation/operational artifacts. |

## Re-review of `72fe421`

The independent [business](COUNTER-REVIEW-72FE421-BUSINESS.md) and [architecture](COUNTER-REVIEW-72FE421-ARCHITECTURE.md) reviews approved the seventh remediation. The [technical review](COUNTER-REVIEW-72FE421-TECHNICAL.md) rejected it because parser/compiler exceptions could disclose staged content and the byte bound followed blob allocation.

| Re-review finding | Eighth remediation |
| --- | --- |
| Parser, compiler, and validator diagnostics could interpolate untrusted content | Replaced raw exception/message interpolation with stable parse/compile categories and a bounded set of validator keywords. Adversarial parser, unknown-format compiler, and pattern-validation probes assert that an injected credential-shaped marker never appears in returned diagnostics. |
| JSON size was checked after the Git blob had been buffered | `git cat-file -s` now preflights the immutable indexed object ID before `git cat-file blob`; any oversized canonical JSON object is refused before allocation. The decoder retains the same ceiling as defense in depth. |
| Exact-boundary and per-artifact malformed/oversize cases were missing | Added exact 1,048,576-byte acceptance-before-schema validation, above-limit refusal, and empty/oversized evidence, attestation, and operational cases. |

## Intentionally not fabricated

- No work package, ADR/specification amendment, owner selection, wave activation, production approval, or commercial approval is marked accepted. Those are external human-controlled prerequisites.
- Existing candidate/lock wording in normative Policy Core authorities is not edited by this documentation change; any inconsistency there requires its own authorized authority change.
- No rejected review is reused as passed gate evidence. These reports document why the first candidate was rejected.

## Verification required for the remediated candidate

- app phase-plan checker and adversarial tests;
- app test suite;
- repository typecheck, Biome, source policy, contract checks, Bun suite, Markdown links, and diff hygiene;
- independent counter-review against the next immutable remediation commit before merge.
