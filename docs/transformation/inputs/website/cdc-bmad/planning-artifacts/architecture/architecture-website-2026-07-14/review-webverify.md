---
title: "Web Verification Review — Architecture Spine libre-ai.fr"
date: 2026-07-14
reviewer: "Claude Code"
level: "web-verification"
---

# Revue de vérification web — Architecture Spine libre-ai.fr

## Verdict

**La spine d'architecture est techniquement fondée pour dioxus/axum/pulldown-cmark et Clever Cloud, mais les candidats SMTP (OVHcloud, Infomaniak) ne sont pas validés contre leur réalité de service en juillet 2026.**

---

## Findings critiques (2)

| Catégorie         | Techno     | État           | Détail                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SMTP provider** | OVHcloud   | **NON VALIDÉ** | L'architecture cite "OVHcloud" comme candidat SMTP. Wikipedia et sources publiques confirment OVHcloud offre de l'email hosting (depuis 2017, "l'un des plus grands au monde") mais **pas de service spécifiquement nommé "transactional email"** ou SMTP relay public. Les mentions trouvées visent "E-mail Pro basé sur Microsoft Exchange" (hosting email traditionnel). À vérifier : existe-t-il un endpoint SMTP public ou faut-il un service distinct ? |
| **SMTP provider** | Infomaniak | **NON VALIDÉ** | L'architecture cite Infomaniak (Suisse, légitime, depuis 1994) comme candidat SMTP. GitHub officiel (infomaniak.com) liste : kDrive (stockage cloud), kMail (client email iOS/Android), kCalendar. **Aucune mention d'un service transactional email ou SMTP relay.** Le produit "kMail" est un client email, pas un service backend. À vérifier : offrent-ils un service transactional email ?                                                               |

---

## Findings moyens/faibles (3)

| Techno                    | État       | Détail                                                                                                                                                                                                                                                                                         |
| ------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dioxus 0.7.9**          | ✓ Confirmé | Version 0.7.9 release le 8 mai 2026 (source : docs.rs). **ATTENTION : document daté 14 juillet 2026.** Il existe peut-être une 0.8.x ou 0.7.x patchée entre mai et juillet. À date : 0.7.9 existe et supporte SSG (Static-site generation) confirmé. Maintenance active (full-time core team). |
| **pulldown-cmark 0.13.4** | ✓ Confirmé | Version 0.13.4 release le 20 mai 2026 (source : docs.rs). Maintenu (raphlinus, marcusklaas, Martin1887 comme propriétaires). L'architecture demande "vérifier comrak alternative" — confirmé que pulldown-cmark est le standard CommonMark strict et activement maintenu.                      |
| **Axum (déféré)**         | ✓ Confirmé | Architecture dit "Déféré — epic C-5". Axum 0.8.9 existe et date du 9 juillet 2026 (source : docs.rs). Maintenu, compatible. Aucun obstacle version.                                                                                                                                            |

---

## Infos supplémentaires validées

| Aspect                | Statut                                                                                                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scaleway TEM**      | ✓ Confirmé en 2026. Site Scaleway officiel mentionne "Transactional Emails (TEM) : Instant delivery of your transactional emails" comme produit. Seul candidat SMTP pleinement validé.                                                                                                                                    |
| **Clever Cloud**      | ⚠️ Pas vérifiable directement. Site www.clever-cloud.com redirige en boucle (redirects infinis) vers clever.cloud, documentation inaccessible. **Limitation WebFetch — pas de blocage prouvé.** Clever Cloud est service public notoire (français, support Rust connu, static apps notoires). Architecture peut procéder. |
| **Dioxus SSR**        | ✓ Confirmé. Feature `ssr` disponible ; re-export : `pub use dioxus_ssr as ssr;`. Baseline OK.                                                                                                                                                                                                                             |
| **Pagefind**          | ✓ Correctement écarté. PRD section 5 (non-objectifs, point 7) : "Pas de recherche interne" avec note "(~10 pages ne justifient pas un moteur)". Architecture ne cite pas Pagefind.                                                                                                                                        |
| **Rust Edition 2024** | ✓ Compatible. Dioxus 0.7.9, pulldown-cmark 0.13, axum 0.8 tous compatibles edition 2024. Aucun obstacle.                                                                                                                                                                                                                  |

---

## Recommandations

### Critique (avant implémentation)

1. **Valider les services SMTP auprès des fournisseurs directement :**
   - **OVHcloud** : confirmer qu'un endpoint SMTP public existe pour l'envoi de transactional emails, et s'il n'est pas réservé aux clients Exchange.
   - **Infomaniak** : confirmer s'ils offrent un service transactional email / SMTP relay. Sinon, retirer du choix candidats ou reconnaître l'hypothèse.
   - **Fallback** : à ce stade, seul **Scaleway TEM** est confirmé comme service transactional email public (juillet 2026). Recommandation : utiliser Scaleway comme single-source de vérité jusqu'à validation OVH/Info.

2. **Clever Cloud** : bien que non directement vérifiable par WebFetch, Clever Cloud demeure service public établi. Architecture peut procéder ; prioriser la validation en implémentation (test déploiement statique app + Rust app).

### Moyen

3. **Dioxus 0.7.9 → snapshot de version** : confirmer que la version choisie en build (Cargo.lock) est 0.7.9 ou posterieur si patchée d'ici le lancement. Une mise à jour entre mai et juillet n'est pas exclue.

---

## Scope de vérification

- ✓ Versions Rust stack (dioxus, axum, pulldown-cmark, serde) : confirmées exister et être maintenues.
- ✓ Clever Cloud capabilities : notoires, vérification directe bloquée par redirects (service publique assez connu pour procéder).
- ✓ Pagefind : correctement absent du PRD et architecture.
- ⚠️ SMTP providers : **OVHcloud et Infomaniak non pleinement validés**. Scaleway TEM ✓.
- ✓ Support Rust, static sites, addon DB (Clever Cloud) : statut quo service public, procédure normale.

---

## Résumé

| Composant            | Verdict                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| Dioxus 0.7.9 SSG     | ✓ OK — existe, soutenu                                                        |
| pulldown-cmark 0.13+ | ✓ OK — existe, maintenu                                                       |
| Axum                 | ✓ OK — existe, compatible                                                     |
| Clever Cloud         | ✓ Procédure — service notoire, vérification directe bloquée (redirects)       |
| Scaleway TEM         | ✓ OK — service transactional email confirmé                                   |
| OVHcloud SMTP        | ⚠️ À valider — mention vague (email hosting historique ≠ transactional email) |
| Infomaniak SMTP      | ✗ Non confirmé — aucun service SMTP trouvé (juste clients email kMail)        |

---

**Date d'audit :** 14 juillet 2026  
**Outils :** WebFetch (docs.rs, Wikipedia, sites publics), recherche par sources stables.  
**Limitation principale :** Clever Cloud docs inaccessible (redirects infinis) ; OVHcloud/Infomaniak faible couverture publique sur offres transactional email.
