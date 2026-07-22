# Dossier de promotion — `envelope-v1` : `candidate → locked` (K3 in service)

- **Date :** 2026-07-22 · **Run :** jalon γ, vague 2 · **Branche :** `feat/envelope-k3-dogfooding`
- **Nature :** promotion du contrat sécu-critique `envelope-v1` candidate→locked. Répétition du pattern couche 3 (amorçage prononcé #137) : auto sur revue propre. Le lock rend le contrat immuable (major-versioned) et acte K3 « in service ».

## Préconditions — toutes closes

| Précondition                                                                    | Preuve                                                                                                             | État                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Barrière d'amorçage K3 (ADR-0011 D4) levée par prononcé propriétaire            | PR #137 (merge = amorçage couche 3), revues K4 sécu/crypto/archi, verify-pass CLEAN                                | `BOOTSTRAP-DOSSIER.md`                                                                                                                                                                                                          |
| Intégrité canonique, MAC constant-time, escape prouvable des délimiteurs        | `packages/envelope/src/index.ts`, 15 tests TDD (tamper, flag flip, canonicalisation, forge délimiteur, edge cases) | `envelope.test.ts`, couverture 100 %, verdicts K4 APPROVE                                                                                                                                                                       |
| Premier consommateur réel dogfooding (E22 reference-only until consumer exists) | `tools/review/fanout.ts` wraps evidence via `guardEvidence`, ephemeral per-run key, 5 nouveaux tests orchestration | Commit `1e97576` de cette branche, tests verts — **clôt le finding A-01 marqué `DEFERRED-DOCUMENTED` dans `ARCHITECTURE-VERIFY-bb791df.md` §A-01** (le consommateur qui manquait au moment de la vérification existe désormais) |

## Consommateurs réels (condition de lock)

- `envelope-v1` : consommé par `tools/review/fanout.ts` (orchestrateur de revue) ; consommateur cible `harness` pour rappel mémoire en vague 3.

Le contrat n'est plus orphelin : la forge elle-même s'enveloppe, établissant K3 au socle.

## Ce qui reste (différé honnêtement, hors périmètre du lock)

- **Upgrade vers Ed25519 origin-signature** : WP-G2-Z01, déféré à l'écluse #3 de cérémonie de clés, après adoption de K3 HMAC au socle.
- **Consumers runtime** : le rappel mémoire (vague 3) et les autres surfaces model-facing utilisent renderGuarded ; l'enforcement est une responsabilité du runtime, le contrat porte le fait.

Ces deux points dépendent d'un cycle d'adoption ultérieur ; ils ne bloquent pas le lock du contrat (l'enveloppe est revue, immuable, consommée, prête pour le lock).

## Effet du lock

- `envelope-v1` passe `locked` (immuable, major-versioned) dans `contracts/catalog.v1.json`.
- Le noyau K3 (`LOOP-SECURITY-KERNEL.md`) passe **in service**.
- Toute évolution future = nouvelle version majeure (v2), jamais mutation en place.
