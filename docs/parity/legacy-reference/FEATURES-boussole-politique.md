# Inventaire des features — Boussole Politique

**Révision référence:** `18f011df333a81fd4dfcfc048f6b9a3d8d9f17b4`  
**Maturité repo:** contract-first (Rust domain/scoring implémentés, shell Dioxus/UI absent)  
**Date de l'audit:** 2026-07-22

## 1. Inventaire des features par thème

### 1.1 Dataset et données parlementaires

- **Public vote dataset contract** — Git owns aggregate statements, vote counts, extraction provenance. `public-vote-dataset.v2.schema.json`. `boussole.md:Data + Contracts`
- **Fact layer (Faits)** — Scrutin, Vote, Texte, Elu, Mandat, AffiliationGroupe, Groupe ; chaque scrutin = (legislature, numero) opaque. `domain/src/lib.rs:ScrutinId` ; `docs/spec-v1.md:4.1 Faits`
- **Official open data ingestion** — AN open data autoritatif ; mises au point officielles ingérées ; groupe au moment du scrutin. `docs/spec-v1.md:4.1 Faits rules`
- **Source tracking and provenance** — hash source + instant ingestion + version parser ; matching ambigu = quarantine. `docs/spec-v1.md:4.1 Faits rules`
- **Motion de censure (49.3)** — branche informative hors congruence (vote censure ≠ infère sur non-votants). `docs/spec-v1.md:5.1 Vivier`
- **Dry-run on legislatures 16/17** — reproductible sur données AN archivées (`dry-run/data/*.zip`). `README.md + scripts/verify-m1-sensitivity.py`

### 1.2 Sélection VAA et curation éditoriale

- **VAA statement layer** — EnonceVaa(id, scrutin_id, polarity, formulation_version, summary_version). `domain/src/lib.rs:EnonceVaa` ; `docs/spec-v1.md:4.2 VAA`
- **Pool and filtering** — règles méchaniques pour qualité lien/participation/discriminance ; produit rapport auto sans modifier faits. `docs/spec-v1.md:5.2 Filtre`
- **Polarity binding** — relie vote « pour » à formulation (VoteForMeansAgreement ou VoteAgainstMeansAgreement). `domain/src/lib.rs:Polarity::(+1/-1)` ; `docs/spec-v1.md:4.2`
- **Selection versioning** — chaque version sélection = artefact immuable ; modification = nouvelle version. `docs/spec-v1.md:5.2 step 6`
- **Independent review gate** — science politique + droit parlementaire + méthodologie VAA avant publication. `docs/spec-v1.md:5.2 step 5`
- **Vivier Q8 viable but conditional M1** — 95 candidats cœur linkés, 84 adoptés/11 rejetés ; symétrie politico-thématique non démontrée. `README.md:Statut`

### 1.3 Formule de congruence et scoring

- **Scoring formula v1** — direction brute → normalisée (polarity ×) → weight (`|citizen_pos|`) → pondéré; millièmes = 1000×num/(den)+round. `scoring/src/lib.rs:score()` ; `docs/spec-v1.md:7 Congruence`
- **Citizen position model** — StronglyDisagree(-2), Disagree(-1), Agree(+1), StronglyAgree(+2), NoOpinion, Later. `domain/src/lib.rs:CitizenPosition` ; poids = abs(position)
- **Vote position model** — For(+1), Against(-1), Abstention, NonVoter, EstimatedAbsent. `domain/src/lib.rs:VotePosition` ; absent estimé taggé (jamais silencieux)
- **Exclusion rules** — sans_avis/passer n'entrent pas en congruence ; abstention/non-votant comptés séparés. `scoring/src/lib.rs` ; `docs/spec-v1.md:3 Non-goals`
- **Group majority** — position majoritaire de groupe (pour/contre); égalité exclue. `scoring/src/lib.rs:group_majority()` ; pas de pondération thématique MVP.
- **Score output envelope** — ScoreResult(num, den, n, milliemes?, displayable, non_display_reason, abstentions, non_voters, missing_data). `scoring/src/lib.rs:ScoreResult`
- **Display threshold** — N_MIN=10 paires communes hypothèse validée ; score calculé sous le seuil mais non affiché. `scoring/src/lib.rs:DEFAULT_N_MIN` ; `docs/spec-v1.md:7`
- **Golden scoring vectors** — Rust native + WASM32 ; deux générations successives pour déterminisme. `scripts/verify-m1-sensitivity.py` ; tests croisés.
- **Zero floats** — congruence entière sans flottants (1000×num + den/2) // den. `scoring/src/lib.rs`

### 1.4 Parcours utilisateur et questionnaire

- **Onboarding screen** — explique comparaison/non-conclusions ; positions restent locales ; sélection curatée. `docs/spec-v1.md:6.1` ; aucun compte/adresse/circonscription demandé.
- **Statement judging (cards)** — une carte à la fois ; lot fini ; formulation + contexte + caveats + sources lisibles pré-réponse. `docs/spec-v1.md:6.2`
- **Answer options** — « tout à fait en désaccord », « plutôt en désaccord », « plutôt d'accord », « tout à fait d'accord », « sans avis », « plus tard » (6 options). `docs/spec-v1.md:6.2`
- **No binary swipe** — exclusion de tout swipe binaire pour favoriser graduée réflexion. `docs/spec-v1.md:6.2`
- **Deterministic lot order** — ordre du lot déterministe ou stratifié ; graine locale évite réitération identique. `docs/spec-v1.md:6.2`
- **Reveal by batch** — reveal par lot de cinq (paramètre méthodologique à tester). `docs/spec-v1.md:6.3`
- **Reveal content** — accords/divergences par énoncé ; majorité groupe + noms ; circonscription optionnelle ; abstentions séparées. `docs/spec-v1.md:6.3`
- **Reveal exclusions** — JAMAIS top/bottom 577 élus, podium, recommandation électorale, palette idéologique colorée. `docs/spec-v1.md:6.3`
- **Visual treatment** — groupes égalité ; libellés textuels privilégiés ; apparence monochrome plutôt que couleurs non-autoritatives. `docs/spec-v1.md:6.3`
- **Post-reveal revision** — révision post-reveal ≠ rewrite pré-reveal ; crée entrée nouvelle ; invalide score si wording change substantiel. `docs/spec-v1.md:6.4`

### 1.5 Persistance et portabilité locale

- **IndexedDB storage** — pas localStorage pour base principale. `docs/spec-v1.md:6.5`
- **Browser persistence request** — demande navigateur quand API autorise. `docs/spec-v1.md:6.5`
- **PWA offline** — installable post-dataset chargé. `docs/spec-v1.md:6.5` ; complet offline questionnaire + résult.
- **Export/import versioned** — local versionné, documenté, validé pré-replacement. `docs/spec-v1.md:6.5`
- **No automatic export or social share** — aucun export auto ni partage social MVP. `docs/spec-v1.md:6.5`

### 1.6 Indicateurs et contexte

- **Associated indicators** — toujours séparés du score : n d'énoncés jugés, n commun, den pondéré, abstentions, non-votes, couverture lot/thèmes. `docs/spec-v1.md:8`
- **Participation disclosure** — participation aux scrutins retenus + exclusions documentées. `docs/spec-v1.md:8`
- **Canonical statement** — « A voté comme toi sur les énoncés que tu as jugés » = seule formulation canonique. `docs/spec-v1.md:8`

### 1.7 Sécurité et confidentialité

- **Local response workspace** — IndexedDB/local memory only jusqu'à suppression ; aucun server table ni analytics ID. `boussole.md:Data section`
- **Zero-transmission proof** — network interception prouve zéro response/result transmission. `boussole.md:Evidence section`
- **No account, profiling or telemetry** — aucun compte, aucun server response storage, aucune télémétrie comportementale. `docs/spec-v1.md:2 principes`
- **No personal data** — roll-call sources admitted only as aggregates ; aucun identifiant personne. `boussole.md:Data section`
- **Public dataset sous review avant publication** — Biscuit restreint à (dataset_hash, method_hash, publish). `boussole.md:Authentication section`

### 1.8 Contracts et preuves

- **Public Vote Dataset v2 schema** — `contracts/schemas/public-vote-dataset.v2.schema.json`. `boussole.md:Contracts`
- **Boussole Method v2 schema** — `contracts/schemas/boussole-method.v2.schema.json`. `boussole.md:Contracts`
- **Local Response Set v2 schema** — `contracts/schemas/boussole-response-set.v2.schema.json`. `boussole.md:Contracts`
- **Local Comparison v2 schema** — `contracts/schemas/local-comparison.v2.schema.json`. `boussole.md:Contracts`
- **WASM scoring boundary** — `contracts/wit/boussole-scoring-v2/world.wit` (candidate sans engine). `boussole.md:Contracts`
- **Golden scoring vectors** — `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` ; Rust native + WASM reference. `boussole.md:Evidence`

### 1.9 Contrôles CI et déterminisme

- **Deterministic asset generation** — deux générations successives d'assets en CI ; hash vérification. `README.md + scripts/generate-assets.sh + scripts/test-assets.py`
- **Native + WASM32 builds** — contrats Rust toolchain 1.85.1 ; cible wasm32-unknown-unknown vérifiée. `README.md + scripts/check-rust.sh`
- **M1 sensitivity test** — `verify-m1-sensitivity.py` teste compatibilité macOS arm64. `README.md + scripts/verify-m1-sensitivity.py`
- **ETL reproducibility** — dry-run sur data AN archivées (`dry-run/data/*.zip`). `README.md`

## 2. Maturité

| Zone                       | Statut            | Notes                                                                                                                                 |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Spécification cœur         | ✅ Achevée        | Spec v1, architecture cible, charte neutralité publiées. Roadmap stable.                                                              |
| Domain contracts Rust      | ✅ Déployé        | `crates/domain` complet (ScrutinId, VotePosition, EnonceVaa, CitizenPosition, CitizenAnswer, VoteFact). Tests unitaires présents.     |
| Scoring formula            | ✅ Déployé        | `crates/scoring` purs (entiers, déterministes, sans état). Golden vectors testés Rust + WASM. Thresholds et output envelope complets. |
| Golden vectors             | ✅ Déployé        | `crates/scoring/tests/golden_vectors.rs` cross-check Rust native + wasm32.                                                            |
| Dry-run ETL                | ✅ Déployé        | Reproductible legislatures 16/17. Données AN archivées + scripts Python validation.                                                   |
| Asset pipeline             | ✅ Déployé        | Génération déterministe + tests ; pipeline réduplication CI contrôlée.                                                                |
| Vivier Q8 selection        | ⚠️ Conditional M1 | 95 cœur : 84 adoptés/11 rejetés. Symétrie politico-thématique insuffisante pour sélection canonique. Revue indépendante bloquante.    |
| Shell Dioxus/UI            | ❌ Absent         | Aucun shell Dioxus, aucun questionnaire interactif, aucune reveale UI, aucune persistance navigateur réelle.                          |
| Axum API                   | ❌ Absent         | Aucun endpoint, aucun serveur dans MVP (préfère static/CDN + artefacts publics immuables).                                            |
| Network zero-transmission  | ⚠️ Tests absents  | Spec forbids response transmission ; test interception réseau absent.                                                                 |
| Accessibility proof        | ❌ Tests absents  | Offline/keyboard/screen-reader specs écrites ; aucun audit RGAA/WCAA AA.                                                              |
| Methodological review gate | ❌ Bloqué         | M1 `conditional` ; revue science politique + droit parlementaire manquante.                                                           |
| Public scoring release     | ❌ Disabled       | ADR-0002 approval + independent review req. Aucun claim d'application publique.                                                       |

## 3. Gap table : mined features vs spec verrouillée

| Feature minée                                          | Couverture spec              | Absent de la spec | Conflit non-goals                                                                         |
| ------------------------------------------------------ | ---------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| Vote dataset contract                                  | Contracts                    | —                 | —                                                                                         |
| Fact layer (Scrutin/Vote/Elu)                          | Data, Journey #1             | —                 | —                                                                                         |
| Source provenance tracking                             | Data section                 | —                 | —                                                                                         |
| VAA statement layer                                    | Data, Journey #2             | —                 | —                                                                                         |
| Statement polarity                                     | —                            | Absent            | —                                                                                         |
| Selection versioning                                   | Data, Section 5.2            | —                 | —                                                                                         |
| Independent review requirement                         | Section 5.2                  | —                 | —                                                                                         |
| Scoring formula (weighted direction)                   | Section 7, Journey #3        | —                 | —                                                                                         |
| Citizen position model (-2..+2, no_opinion, later)     | Domain protocol, Section 4.3 | —                 | —                                                                                         |
| Vote position model (pour/contre/abstention/nonvotant) | Section 4.1                  | —                 | —                                                                                         |
| Group majority (simple majority)                       | Section 7                    | —                 | —                                                                                         |
| Score output envelope (num/den/n/milliemes/reason)     | Section 7                    | —                 | —                                                                                         |
| N_MIN=10 threshold                                     | Section 7                    | —                 | —                                                                                         |
| Onboarding explanatory screen                          | Journey #1                   | —                 | —                                                                                         |
| Card-based questionnaire (6 options)                   | Journey #2, Section 6.2      | —                 | —                                                                                         |
| Reveal by batch of 5                                   | Journey #2, Section 6.3      | —                 | —                                                                                         |
| Reveal with group positions                            | Section 6.3                  | —                 | —                                                                                         |
| Post-reveal revision (non-overwrite)                   | Section 6.4                  | —                 | —                                                                                         |
| IndexedDB offline storage                              | Section 6.5                  | —                 | —                                                                                         |
| PWA installability                                     | Section 6.5                  | —                 | —                                                                                         |
| Export/import local                                    | Section 6.5                  | —                 | —                                                                                         |
| Associated indicators (n, den, coverage)               | Section 8                    | —                 | —                                                                                         |
| Voting recommendation (forbidden)                      | Non-goals                    | —                 | ✅ Explicitement exclu : « voting recommendation, ideology label, moral ranking »         |
| Account/server storage (forbidden)                     | Non-goals                    | —                 | ✅ Explicitement exclu : « account, server response storage, telemetry or ad profile »    |
| Model-generated statements (forbidden)                 | Non-goals                    | —                 | ✅ Explicitement exclu : « model-generated statement publication without human review »   |
| Hiding abstention/denominators (forbidden)             | Non-goals                    | —                 | ✅ Explicitement exclu : « hiding abstention, absence, dataset selection or denominator » |
| Public scoring before ADR-0002                         | Non-goals                    | —                 | ✅ Explicitement exclu : « public scoring before the two ADR-0002 approvals »             |

**ABSENT de la spec verrouillée (7 features minées non documentées):**

1. **Deterministic asset generation pipeline** — spec ne mentionne pas visuels/branding détails ; dry-run génère déterministiquement. Feature de qualité ingénierie, pas métier.
2. **M1 sensitivity testing (macOS arm64 compatibility)** — spec parle architecture cible (Bun/React/WASM) mais pas test CI spécifique M1. Feature de release-readiness, pas de parcours utilisateur.
3. **Two-generation CI asset verification** — déterminisme de build ; spec dit « static/CDN » mais pas le pipeline de confiance.
4. **Dry-run on archived legislative data** — spec mentionne sélection V1 à tester mais pas la reproductibilité archivée détaillée.
5. **ETL parsing/ingestion scripting** — spec documente Faits mais pas les outils d'extraction.
6. **Rust/WASM32 pure contract verification** — spec dit « WASM scoring » mais pas « contrats purs + cross-platform ».
7. **Golden vector golden reference** — spec mentionne preuves mais pas l'infrastructure des vecteurs de test cross-platform.

## 4. Recommandations d'amendement

1. **Ajouter Journey #5 : « Dataset version negotiation »** — l'inventaire montre release_identity + Biscuit(dataset_hash, method_hash), mais UI pour « dataset v2 est dispo, voulez-vous previewer changements avant recompute ? » manque. Proposer : PreviewDatasetUpgrade query, écran comparatif (énoncés ajoutés/supprimés/révisés), bouton « upgrade » ou « conserver v1 ». Cela couvre le non-goal « implicit ingestion » en rendant explicite la transition.

2. **Expandir section « Method versioning and lock »** — spec dit « Method/dataset versions are immutable » mais pas le parcours « ma réponse était sous Method v1, now Method v2 exists ». Proposer : table historique de réponses (timestamp, method_version, dataset_version) ; option « rejouer sur Method v2 » (recompute sans rependre) vs « garder v1 result ». Cela scelle la chaîne score=hash(method,dataset,responses).

3. **Ajouter Journey #4.5 : « Local result export formats »** — spec dit « ExportLocalResult » mais pas formats. Proposer : JSON envelope (statement/vote/response/score), CSV (pour spreadsheet), texte lisible (pour copier-coller). Chacun = non-identifying (pas d'ID elu ni nom groupe en clair). Cela rend utilisable « export a non-identifying local result ».

4. **Détailler « Accessibility proof requirements » dans Evidence** — spec dit « zero-transmission + accessibility » mais pas la matrice. Proposer dans Evidence : « browser tests cover offline, upgrade preview, delete, keyboard (Tab/Enter/Escape), screen readers (ARIA landmarks, live regions for reveal) ; audit RGAA/WCAA AA pending ». Cela précise le « complete questionnaire and result work offline ».

5. **Ajouter policy sur « Vivier asymmetry and coverage »** — README note M1 conditional (symétrie politique insuffisante) mais spec-locked ne le documente pas. Proposer : section « Dataset quality gates » énumérant (adoption/rejection ratio par thème, petits groupes exclus, licence redistribution, personne-targeting déclaration). Cela consolide le non-goal « no representative poll ».

6. **Expandir « Refusal matrix : coverage_insufficient »** — spec liste refusal mais pas le seuil détaillé. Proposer : group-size floor ≥ 5 (small-group exclusion), hash-bound publication policy, review expiry. Cela rend testable « coverage_insufficient ».

7. **Ajouter Journey « Interactive explanation »** — spec dit « ExplainComparison » query mais pas la UI (pourquoi n°8 comptée, pourquoi abstention exclue, etc.). Proposer : hover/modal sur énoncé de résultat → « You answered {agree}, {group} voted {for}, polarity={against_means_agreement} → normalized to {agree} ». Cela enrichit « deterministic WASM computes with visible denominator ».

8. **Documenter M1 gate et chemin towards P1/P2** — spec liste P0/P1/P2 gates mais Q8 M1 reste conditional. Proposer : annexe « Gate M1 closure roadmap » énumérant les 95 scrutins (adoption%, thème%, coalition%), puis critères pour « approval » vs « hold ». Cela rend explicite le risque de sélection avant revue.

## Changements de position depuis spec lockée

**Aucun changement de position détecté.** Le référentiel archive documente intent méthodologique stable et contrats purs en Rust.

**Deux amendements de **disponibilité** (non de spec) :**

- **Public scoring release remain disabled** — ADR-0002 approvals + indépendant review remain prerequisite. Aucun claim d'application publique dans le repo.
- **M1 conditional (non conditional-off)** — vivier Q8 viable en volume mais symétrie/couverture insuffisantes pour sélection canonique. Attente revue indépendante et arbitrage de couverture thématique.
