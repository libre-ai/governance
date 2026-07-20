# Dossier d'amorçage — couche 3, première barrière sécu-critique (ADR-0011 D4)

- **Date :** 2026-07-20 · **Run :** jalon α, vague 2 · **PR :** #137 (`feat/wave2-envelope`)
- **Nature :** **ARRÊT DUR D'AMORÇAGE (ADR-0011 D4)** — premier merge sécu-critique de la **couche 3** (infrastructure de confiance). Comme pour D01 (couche données), le premier franchissement d'un pattern de gate d'une couche produit son dossier puis **STOP** pour prononcé propriétaire. Ce prononcé amorce la chaîne de confiance de la couche 3 : les briques suivantes de même nature (provenance, proof) s'auto-prononceront ensuite sur revue indépendante propre.

## 1. Ce qui est livré

La brique **`envelope`** (`@libre-ai/envelope`) — noyau de sécurité des boucles **K3** : le contenu externe (web, email, rappel mémoire, sorties d'outils, descriptions MCP) est **donnée, jamais instruction**.

| Élément                           | Chemin                                                         | Preuve                                                                                        |
| --------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Contrat `envelope.v1` (candidate) | `contracts/schemas/envelope.v1.schema.json` + entrée catalogue | projection TS générée, fixtures valide/invalide                                               |
| Implémentation                    | `packages/envelope/src/index.ts`                               | wrap (tag+HMAC), verify (constant-time, fail-closed), renderGuarded (escape prouvable)        |
| Tests TDD                         | `packages/envelope/src/envelope.test.ts`                       | 15 tests (tamper, flag flip, source swap, wrong key, forge délimiteur, edge canonicalisation) |

**Propriétés prouvées :** sérialisation canonique length-prefixée (pas d'ambiguïté de frontière → pas de collision de MAC) ; échappement des délimiteurs de garde tel que le contenu échappé ne contient aucun délimiteur brut (impossible de forger la fermeture) ; comparaison à temps constant ; `trusted:false` structurel (const au schéma + couvert par le MAC) ; erreurs sans divulgation de contenu.

## 2. Revue indépendante K4 (relecteurs ≠ implémenteur, 3 lentilles)

Sur le commit immuable `d868a31`, réconcilié au commit `bb791df` :

| Lentille          | Verdict                                  | Bloquant           | Suite                                                                                                                              |
| ----------------- | ---------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Sécurité**      | **APPROVE**                              | Aucun              | 51 tests d'attaque : forge de délimiteur, collision de canonicalisation, contournement de vérif, divulgation, K2 — tous résistants |
| **Cryptographie** | **APPROVE** (réserves mineures doc)      | Aucun              | C-01..04 (keyId informatif, taille de clé, MAC déterministe/replay) fermés par JSDoc                                               |
| **Architecture**  | **APPROVE-WITH-CONDITIONS** → réconcilié | Aucun sur le brick | A-04 (canonicalisation label) FIXÉ+testé ; A-02/A-03/A-05/A-06 fermés ; **A-01 (dogfooding)** → gate de la promotion, voir §4      |

Verify-pass architecture sur `bb791df` : voir `ARCHITECTURE-VERIFY-bb791df.md`. K4 respecté : brique produite en solo, 3 relecteurs + verify lancés séparément.

## 3. Décision demandée

**Prononcer l'amorçage de la couche 3** = autoriser le merge de la PR #137 (envelope en **candidate**). Ce prononcé :

1. acte le pattern de revue couche-3 (3 lentilles sécu/crypto/archi + verify) validé une fois humainement ; les briques couche-3 suivantes (provenance, proof) s'auto-prononcent ensuite sur revue propre ;
2. pose la première brique de confiance de la couche 3 au socle ;
3. n'autorise **pas** encore la promotion candidate→locked (voir §4).

Gates CI de #137 : à re-vérifier vertes au moment du merge. **Je ne merge pas en autonome — arrêt dur D4.**

## 4. A-01 / dogfooding — promotion candidate→locked différée (non bloquant pour l'amorçage)

L'envelope n'a pas encore de consommateur réel (aucune surface model-facing dans le monorepo aujourd'hui — le rappel mémoire arrive en vague 3). Conformément à la doctrine E22 (« reference-only until a consumer exists ») et à K5 (dogfooding-first) :

- le **merge du candidate** (cet amorçage) pose la brique revue et sûre au socle ;
- la **promotion candidate→locked** est **gated sur la première intégration** forge/harness qui rappelle du contenu non fiable et l'enveloppe — le consommateur de dogfooding.

C'est le découpage honnête : la brique est prête et revue, sa promotion à « production-consommée » attend son consommateur.

## 5. État du reste de la vague 2

Après l'amorçage envelope : `provenance` (productiser `agent-contributor-lineage.v1`), `proof` (`evidence-report.v1` + `harness-attestation.v1`), `artifacts` (crate existant), classification K2 opérationnelle, puis **verrou du noyau K1-K5 au socle** (spec `LOOP-SECURITY-KERNEL.md`, réalisation d'I-18) = gate d'entrée de la **porte V3** (arrêt dur permanent D3, fin du run α).
