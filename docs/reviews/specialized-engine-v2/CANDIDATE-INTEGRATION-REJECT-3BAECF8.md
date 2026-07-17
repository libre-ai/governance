# Candidate-integration rejection — 3baecf8

- Verdict: `REJECT candidate-integration`
- Immutable target: `3baecf8c7fb6ca011945a037831ab50ef0337d39`
- Review pass: `engine-envelope-mixed-html-integration`
- Session: `019f6fbf-2e10-7188-8894-6d848bee8dfe`
- Provider/model: `openai-codex/gpt-5.5` (`xhigh`)
- Raw reviewer-output SHA-256: `8f20e389d2e98f218ee47f501ea88e3efe68a7bde855165d89a35cc4e1661934`
- Effect: PR #67 remains remediation-only; fresh candidate-integration and role passes are required

## Verbatim reviewer output

Rapport candidate-integration PR #67 — lecture seule.

Cible vérifiée :
- HEAD exact : `3baecf8c7fb6ca011945a037831ab50ef0337d39`
- Worktree propre avant/après : oui
- Diff relu : `2ccb05c5fbf7b9b46750e712e3598fe5fa640a33..HEAD`
- Patch SHA-256 : `f0f10f9594e5b5d6da98575ece1ea63967eff433b6141e802f92d509aad8d5ab`
- Fichiers modifiés : `STATUS.md`, dossier review, `tools/quality/check-contracts.ts`
- `contracts/`, corpus, catalogue et projections générées : inchangés vs base

Hashes clés :
- `tools/quality/check-contracts.ts` : `0913343b...` → `ad8715810f55531c63e59378decc7e7e644f13b2fd8cc0a50a7a30e96801440a`
- Rejet durable `CANDIDATE-INTEGRATION-REJECT-AE455.md` : `18c2e8d32892d44546398f18e448316ab01e4791e52f03022aa9c32feb81773b`
- Catalogue : `9623562702488b3cd1d3bf5b0d266acb7e4c3ebc204995e55797b3a4356f2a35`
- Schéma envelope : `2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b`

Constats conformes :
- Les approvals `ae455b9` sont bien invalidés dans `README.md`/`STATUS.md`; je ne les réutilise pas.
- Le catalogue garde un seul candidat : `engine-golden-vectors-v1`, état `candidate`, `pending-independent-agent-review`.
- Radar canary : scope exact valeur+fichier via `isApprovedSyntheticSensitiveVectorValue`.
- Erreurs sensibles non réfléchies : le message reste générique.
- Ordre strict : taille fichier → JSON strict → bornes → scan contenu → AJV.
- Les faux positifs demandés restent acceptés dans ma sonde : `R&D`, `R&amplitude`, `release@2`, `&#fragment/%`, URL `%2F`, Unicode, `file:///...`, traversal inerte. Probe SHA-256 : `0ab1362c208c0d829dcfe1f89db518612651b87e9dc715d24a170f2a5fbc89eb`.

Blocage trouvé :
- `tools/quality/check-contracts.ts:273-275` ne décode que les entités nommées `commat|at`, `percnt`, `amp`, mais pas `period`.
- Les self-tests ajoutés couvrent les cas reportés (`alice&amp;&#64example.org`, etc.) mais pas le séparateur de domaine encodé en entité nommée HTML.
- Sonde bloquante SHA-256 `9e23284f6d805e2bb27c758c53bbb8048ec422ac3e6804b65102ac66280096af` :
  - rejetés correctement : `alice&amp;&#64example.org`, `alice&#38;&commat;example.org`, `alice&amp;&#38;&#64example.org`
  - encore manqués : `alice&commat;example&period;org`, `alice&amp;&#64example&period;org`, `alice&#38;&commat;example&period;org`, `alice&amp;&#38;&#64example&period;org`
- Vérification indépendante `html.unescape`, SHA-256 `c314f39023f875aaf4965b880cfea6ccb7a0ce735a38833229c0707948aae919`, confirme que ces chaînes deviennent des emails privés valides (`alice@example.org`, `alice&@example.org`, `alice&&@example.org`).

Ce verdict est uniquement `candidate-integration`; il n’autorise aucun rôle Architecture/Security, promotion, moteur, scoring, donnée, capability, release, infrastructure ou déploiement.

REJECT candidate-integration — named HTML period variants still bypass private email detection
