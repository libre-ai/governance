# Dossier de décision — Phase 0 Lexicon Lock (arrêt dur, signature propriétaire)

> **Prononcé propriétaire (2026-07-20, en session)** : **P1 = option A** — Polaris confirmé en connaissance de la donnée nouvelle (Atos Polaris AI Platform) ; **P2 = confirmé** — le propriétaire contrôle `libre-ai.fr`, aucun déploiement pour le moment (traité en dernier, cohérent avec G4/I-07) ; **P3 = option A** — différé lineage accepté jusqu'à la brique `provenance` (vague 2), trailers `Agent-Role:` + sign-off en attendant. **La signature est actée par le merge de la PR #130.** Journal : `distribution/evidence/gate-acceptance-log.md`.

- **Date :** 2026-07-20 · **Run :** jalon α · **PR :** #130 (`docs/phase0-lexicon-lock`)
- **Nature :** arrêt dur de Phase 0 — la carte de noms est produite, revue et corrigée ; **rien n'est signé, rien n'est renommé**. Ce dossier demande le prononcé propriétaire.

## 1. Ce qui est produit

| Artefact                                                  | Commit                                            | Contenu                                                                                                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/LEXICON.md`                               | 0d215d9 (initial), corrigé par 81a47f8 et 6204c80 | Carte legacy → cible complète (8 homes produits/app, briques couches 2-4, familles distribution, packages npm, crates), glossaire produit, justifications, deny-list marques mortes |
| `docs/reviews/lexicon-lock/COHERENCE-VERDICT-0d215d9.md`  | b3107ec                                           | K4 lentille cohérence : **APPROVE** (3 mineurs, tous adressés)                                                                                                                      |
| `docs/reviews/lexicon-lock/COLLISIONS-VERDICT-0d215d9.md` | b3107ec                                           | K4 lentille collisions : **APPROVE-WITH-CONDITIONS** (N-01, N-02 → points de décision ci-dessous ; N-03 adressé)                                                                    |
| `docs/reviews/lexicon-lock/DOCTRINE-VERDICT-0d215d9.md`   | b3107ec                                           | K4 lentille doctrine : **APPROVE-WITH-CONDITIONS** (D-01..03, tous adressés) — zéro nom inventé confirmé : chaque nom cible trace à ADR-0008/0009/0011 ou au code existant          |
| `docs/reviews/lexicon-lock/VERIFY-PASS-81a47f8.md`        | e3ff96d + re-verify                               | Verify-pass indépendant : DIRTY sur 81a47f8 (N-02 manquant), re-verify sur 6204c80 — voir le verdict final dans le fichier                                                          |
| `docs/README.md` (ligne « Noms cibles »)                  | 81a47f8                                           | Inscription du sujet à la carte d'autorité, effective à la signature                                                                                                                |

K4 respecté : la carte a été produite en solo par l'agent d'exécution ; les trois relecteurs et le verify-pass sont des agents lancés séparément, sans contexte de production.

## 2. Points de décision propriétaire (à trancher pour signer)

### P1 — Polaris (finding N-01, donnée nouvelle post-arbitrage D2)

L'arbitrage ADR-0011 D2 a accepté une collision « nom répandu dans la tech ». La revue K4 identifie une donnée **nouvelle** : « Atos Polaris AI Platform » (lancé juillet 2025) est un produit actif du **même segment exact** (orchestration d'agents IA, distribution AWS Marketplace), plus un enregistrement UE du signe « POLARIS » par un tiers hors segment (Polaris Industries). Sources dans le verdict collisions.

- **Option A — confirmer Polaris.** La marque publique reste « Libre AI Polaris » (ombrelle) ; le nom nu n'est jamais revendiqué seul. Trade-off : coexistence avec un acteur majeur sur le segment exact — risque de confusion commerciale et de SEO écrasé, mais cohérent avec la posture option C déjà assumée (génériques sous ombrelle).
- **Option B — remplacer le nom de la couche 2.** Re-litige D2 ; le nouveau nom est un **choix propriétaire nominatif** (aucun agent ne proposera de candidat, conformément à l'anti-hallucination de Phase 0). Trade-off : coût de re-décision maintenant, mais le nom n'apparaît encore dans aucun artefact public — c'est le moment le moins cher pour changer.

La carte enregistre le nom sous D2 (option A par défaut doctrinal) et signale la donnée nouvelle sans la trancher.

### P2 — Contrôle de `libre-ai.fr` (finding N-02)

Vérifié empiriquement le 2026-07-20 (whois + RDAP AFNIC) : domaine **enregistré et actif**, registrar Infomaniak, titulaire anonymisé (pratique AFNIC pour un particulier). L'anonymisation empêche de prouver qui le contrôle. **Question fermée : confirmes-tu contrôler `libre-ai.fr` ?** (oui = I-01 tient ; non = point bloquant de marque à instruire avant toute exposition publique nouvelle).

### P3 — Mécanique lineage BOT-C (constat de conformité, décision de différé)

La consigne d'identité BOT-C demande, outre le trailer `Agent-Role:` (appliqué sur tous les commits de ce run), un record `agent-contributor-lineage.v1` par contribution. Le schéma verrouillé exige `signingKeyId` + signature Ed25519 — or **aucune cérémonie de clé n'est autorisée** (WP-G2-Z01 : « no production use or key ceremony is authorized »). Un record conforme est donc matériellement improductible aujourd'hui ; aucun record n'existe dans le repo et les merges récents (#126-#129) n'en portent pas.

- **Option A — différé explicite** : les trailers `Agent-Role:` + sign-off portent la traçabilité jusqu'à ce qu'une cérémonie de clé soit autorisée (au plus tard avec la brique `provenance`, vague 2) ; le différé est journalisé ici.
- **Option B — autoriser maintenant une cérémonie de clé** dédiée au lineage (acte propriétaire séparé, hors périmètre de cette PR).

Recommandation : A — la vague 2 (`provenance`) est le porteur naturel ; créer une clé hors gouvernance de clés établie serait une dérive de sécurité.

## 3. Acte de signature

La signature propriétaire = **merge de la PR #130** après avoir tranché P1/P2/P3 (une réponse dans la session vaut prononcé ; l'agent exécute alors le merge squash, journalise le verdict dans `distribution/evidence/gate-acceptance-log.md`, et la carte passe d'autorité proposée à autorité effective). Gates CI : les quatre doivent être vertes au moment du merge.

## 4. Effets immédiats de la signature

1. Les noms cibles deviennent opposables ; tout nom hors carte = défaut bloquant (classe 4).
2. Actions §7 de la carte déclenchées à leurs échéances (renommage `@libre-ai/design-system` → `@libre-ai/ui` en tête de vague 1 ; nettoyage README artifact ; extension deny-list ; réservation du scope npm `@libre-ai` — action externe soumise à son propre checkpoint, classe 9).
3. Le run α reprend : G2 (D01 → Q01), vague 1, vague 2, vague 4a, porte V3 (arrêts durs de D4/D3 respectés à chaque occurrence).

## 5. État du reste du run au moment de cet arrêt

- **main** : vert (c43a361, D6 mergée par #129).
- **D01** : couche applicative complète (PR #123 draft) ; **preflight D5 exécuté et VERT** — pas par la chaîne colima-linux-arm64 supposée par D5 (aucun binaire linux-aarch64 du canary Rust-line n'existe ; l'émulation linux-x64 dans colima est impraticable, `bun --version` > 11 min sans Rosetta), mais par la chaîne **darwin-aarch64 native du même canary snapshoté** : `bun install` 826 ms produisant `lockfileVersion: 2`, test RLS pglite deux-tenants **5/5 vert en 633 ms** (SET LOCAL + WITH CHECK deny + fail-closed sous rôle non-superuser). Boucle rapide locale acquise ; CI linux-x64 reste l'autorité de repro (repli D5 pour la parité Linux). Les adapters n'ont pas démarré (conforme D5) ; rapport détaillé à verser à la PR D01 à la reprise.
- **Budget Phase 0** : dans le plafond D6 (300 k tokens de sortie), 1 cycle CI rouge consommé sur la PR #130 (gate doctrine, auto-déclenchement corrigé) — 2 cycles restants avant seuil.
