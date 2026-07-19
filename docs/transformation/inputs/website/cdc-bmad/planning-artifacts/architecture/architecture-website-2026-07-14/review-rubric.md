---
title: "Reviewer Gate — Architecture Spine (libre-ai.fr)"
date: 2026-07-14
reviewed_by: Claude Code (agent)
---

# Reviewer Gate Assessment

## Verdict

L'architecture spine couvre les FR/NFR du PRD et ratifie le brownfield Dioxus 0.7.9, mais expose une inconsistency dans le gabarit éditorial (champ `nature` omis du domaine Rust énoncé) et laisse silencieuse la dimension opérationnelle runtime (secrets, monitoring, audit).

---

## Findings — Critiques & Élevés

### ⚠ HIGH — AD-2 Rule incomplète : champ `nature` absent du domaine Rust

**Spine:** AD-2 énonce struct `CorpusPiece` sans champ `nature`, mais le PRD FR-1 demande explicitement "nature déclarée (fait / analyse / position)" et la section exemple YAML montre `nature: analysis`.

**Impact:** Risque qu'une pièce soit publiée sans nature validée au build (compile error ne bloquera pas ce champ si omis de la struct). Le Capability→Architecture Mapping affirme que FR-1 est couverte par AD-2, mais l'énoncé est incomplet.

**Remédiation:** Ajouter à AD-2 Rule : `nature: Nature` (enum Fact | Analysis | Position) comme champ obligatoire de CorpusPiece.

---

### MEDIUM — AD-7 incomplet sur dimensions opérationnelles runtime

**Spine:** AD-7 décrit déploiement et infrastructure, mais omit entièrement :

- Secrets management (stockage clé HMAC, credentials SMTP, secrets de déploiement)
- Monitoring & alerting (comment détecter downtime service conversion ?)
- Backup & recovery (data du service conversion — stratégie, fréquence, RTO/RPO)
- Audit trail (logs d'accès, compliance opérationnelle post-déploiement)
- SLA / RTO (aucune cible d'uptime ou disponibilité énoncée)

**Impact:** Ces dimensions ne sont ni décidées ni déférées — juste absentes. Cela crée un risque de dérive opérationnelle : les gates CI passent, mais la maintenance runtime n'est pas guidée.

**Remédiation:** Soit ajouter des ADs mineurs (ex. AD-7b Secrets & Monitoring), soit étendre Deferred #2 pour couvrir "opérations runtime et audit trail".

---

### MEDIUM — AD-7 gates CI sans governance clairement énoncée

**Spine:** AD-8 énonce 5 gates CI bloquantes [Editorial, Weights, A11y+Keyboard, Zero-third, Confidentiality], mais aucun AD n'énonce qui maintient/opère ces scripts post-Gate 4, ni comment les gates sont mises à jour si les exigences changent.

**Impact:** Risque de drift : gates implémentés correctement à Gate 4, mais silencieusement affaiblies en implémentation (absence de maintenance). Les standards du PRD risquent d'être contournés.

**Remédiation:** Ajouter à AD-8 Rule (ou nouveau AD) : responsabilité d'opération des gates, révision périodique, processus de renforcement des critères.

---

## Findings Supplémentaires

**Faible (1):** Structural Seed — commentaire ambiguë « Entry point (web) » pour `main.rs` (dev server local vs runtime de prod?). Clarifier : est-ce dioxus dev server ou un serveur Axum partagé?

**Compte:** 1 critique, 2 moyens, 1 faible notés ci-dessus; plus 0 autres trouvés. Total **4 findings** relevés.

---

## Points Positifs

✅ Couverture FR/NFR complète et mappée en Capability→Architecture Map  
✅ Paradigm SSG clairement énoncé et justifié  
✅ Tous les ADs (AD-1 à AD-8) énoncent Binds, Prevents, Rule, [ADOPTED]  
✅ Brownfield ratifié (Cargo.toml 0.7.9, clevercloud.json présent)  
✅ Deferred bien listé avec conditions revisite claires  
✅ Consistency Conventions détaillées et cohérentes  
✅ Pérennité couverte (permaliens, reversibilité, DNS défensifs)

---

## Recommandations

**Avant implémentation (Gate 4):**

1. Corriger AD-2 : ajouter `nature: Nature (Fact | Analysis | Position)` à struct CorpusPiece.
2. Étendre AD-7 ou Deferred : couvrir secrets, monitoring, backup, audit trail, SLA.
3. Clarifier main.rs dans Structural Seed (dev vs runtime).
4. Ajouter responsabilité d'opération pour gates CI (AD-8).

**Severity globale:** Aucune blocker critique pour le finalize, mais ces 4 findings doivent être levés avant que l'architecture soit "production-ready".
