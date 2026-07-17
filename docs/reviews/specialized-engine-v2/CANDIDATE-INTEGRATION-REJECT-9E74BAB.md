# Candidate-integration rejection — 9e74bab

- Verdict: `REJECT candidate-integration`
- Immutable target: `9e74baba2c13dc3238237240caea08a9d45287f3`
- Review pass: `engine-envelope-linear-email-integration`
- Session: `019f6fe2-6f5f-7e73-8aed-b6bfb2d8c088`
- Provider/model: `openai-codex/gpt-5.4` (`xhigh`)
- Raw reviewer-output SHA-256: `187b27cf05a2feac303acec9fa7e56162c94e712ec454845ba50e7978db27e28`
- Effect: semicolonless nested amp chains require explicit coverage before fresh gates

## Verbatim reviewer output

Cible durable
- Mode: `candidate-integration` lecture seule uniquement, aucune autorisation de rôle/promotion.
- HEAD vérifié propre et exact: `9e74baba2c13dc3238237240caea08a9d45287f3`
- Diff relu: `79d02b67cc961ca68d844d07e7f0f23838ccac1f..HEAD`
- Patch SHA-256: `153964675f0c9e63f5061f567ed783167eb1b18d3f00e15c70fb7fa550e0a950`
- Portée effective: remédiation `engine-golden-vectors-v1` / dossier `docs/reviews/specialized-engine-v2/` dans le cadre WP-G2-S01 ; 6 fichiers changés, uniquement `tools/quality/check-contracts.ts` + dossier review.
- Inchangé dans ce diff: `contracts/`, corpus, schéma, catalogue, `packages/`; seul candidat catalogue = `engine-golden-vectors-v1` (`pending-independent-agent-review`).
- Rejets lus et hashés: AE455 `18c2e8d3…`, 3BAECF8 `9dd66f60…`, 39F776E `6e9dc13e…`, E6DF443 `59607db5…`.

Constat bloquant
- `tools/quality/check-contracts.ts:243-246` ne collapse pas `&amp` **sans point-virgule** devant un alias nommé HTML5. Le scanner couvre `&amp;...` et `&#38...`, mais laisse passer les formes `&ampAlias;...`.
- Exemples reproduits:
  - `alice&ampcommat;example&period;org` → référence HTML5×2: `alice@example.org` ; implémentation actuelle: `alice&ampcommat;example.org` ; **accepté**
  - `alice&ampUnderBar;&commat;example&period;org` → HTML5×2: `alice_@example.org` ; actuel: `alice&ampUnderBar;@example.org` ; **accepté**
  - `alice&ampDiacriticalGrave;&commat;example&period;org` → HTML5×2: ``alice`@example.org`` ; actuel: `alice&ampDiacriticalGrave;@example.org` ; **accepté**
  - `alice&ampVerticalLine;&commat;example&period;org` → HTML5×2: `alice|@example.org` ; actuel: `alice&ampVerticalLine;@example.org` ; **accepté**
- Sweep exact-case/case-folded plus large: **26/26** cas `&amp...` + alias nommé RFC atext/@/period passent au travers.
- Les self-tests `tools/quality/check-contracts.ts:691-702` couvrent `&amp;...`, numeric, period, etc., mais pas cette famille `&amp...` semicolonless avant alias nommé.

Probes / hashes
- Map HTML5 dérivée indépendamment (case-folded, ASCII RFC atext/@/period): **26 aliases**, correspondance exacte avec `namedEmailEntityCharacters`; hash canonique `4fb0466393be68d99d4d88ac018b8ad7af06efcc9c1d1df7b0362c89e62cca5e`.
- Probe globale ex-BYPASS/contrôles/perf/ordre: `12bfa9f248ae0b3c97d3f83798c237688c35ca17044ef5314c175a263f1a5959`
  - anciens bypass direct/mixed/nested/period/alias: reproduits puis correctement rejetés
  - `&at;` inchangé ; `&alpha;` inchangé
  - contrôles acceptés: `R&D`, `R&amplitude`, `release@2`, `&#fragment/&alpha;/%`, URL encodées, wording Unicode, `file:///...`, traversal inerte
  - ordre confirmé: taille → strict JSON → bornes → content scan → AJV → `contractFiles`
  - erreurs génériques confirmées ; canary Radar bien file-bound
  - perf 65 536 cp (Bun 1.3.11): no-`@` `0.24ms`, one-`@`/no-dot `0.24ms`, many-`@` `0.196ms`, many-dots `0.134ms`, Unicode local `0.96ms`; scaling no-`@` ~linéaire (`1024:0.004ms` → `65536:0.161ms`)
- Référence HTML5 pour la famille bloquante `&amp...` semicolonless: `ef3f128e5ae28accfd1268e2c1a42815a5a980f383f7d97cf9c727b9043fb562`
- Résultat actuel sur cette même famille: `de8757f2a1523f77210db132b5a148fd6bb61c9ea01160186dc24555cb96be0d`

Vérifications exécutées
- `bun run check:contracts` ✅
- `bun run check:notebook-core-v2` ✅
- Évidence seulement, pas verdict.

REJECT candidate-integration — semicolonless nested `&amp...` HTML named-entity chains still bypass private email detection in `tools/quality/check-contracts.ts`
