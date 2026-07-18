# Dossier de revue — Notebook Core v2

> **Statut : Gate A approuvée / Gate B rejetée pour l’usage.** Les artefacts Notebook Core v2 sont `locked` après quatre `APPROVE` indépendants et décision propriétaire `continue`. Le moteur expérimental et le host désactivé sont autorisés pour la qualification publique uniquement ; les six passes Gate B restent `REJECT` pour toute sauvegarde utilisateur ou release.

## Autorité unique

La sémantique normative est
[`contracts/wit/notebook-core-v2/SEMANTICS.md`](../../../contracts/wit/notebook-core-v2/SEMANTICS.md).
Ce dossier ne la duplique plus. Les copies de revue suivantes DOIVENT rester byte-identiques aux
artefacts catalogués et le checker Gate A vérifie cette identité :

- [`world.wit`](world.wit) ↔ `contracts/wit/notebook-core-v2/world.wit` ;
- [`notebook-backup-seal-request.v2.schema.json`](notebook-backup-seal-request.v2.schema.json) ↔
  `contracts/schemas/notebook-backup-seal-request.v2.schema.json` ;
- [`notebook-backup.v2.schema.json`](notebook-backup.v2.schema.json) ↔
  `contracts/schemas/notebook-backup.v2.schema.json` ;
- [`notebook-core-v2.golden.json`](notebook-core-v2.golden.json) ↔
  `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`.

Les correctifs qualifiés par Gate A sont notamment : interface WIT autonome `api`, erreurs fermées, identifiant
de sauvegarde/contexte/blocs CSPRNG opaques, retrait de `createdAt`, révisions et exclusions des artefacts clairs, limite plaintext 16 MiB, canonicalisation Context v2 déterministe et unique profil recovery code.

## Pièces du dossier

- [`MIGRATION.md`](MIGRATION.md) motive le major v2 et l'absence d'adaptateur heuristique ;
- [`SOLO-CHALLENGE.md`](SOLO-CHALLENGE.md) consigne les constats Gate S et risques résiduels ;
- [`PERFORMANCE.md`](PERFORMANCE.md) justifie la réduction conservatoire à 16 MiB ;
- [`INDEPENDENT-REVIEW.md`](INDEPENDENT-REVIEW.md) est le procès-verbal Gate A/B finalisé ;
- [`../../reviews/notebook-core-v2/`](../../reviews/notebook-core-v2/) conserve les verdicts par rôle
  sur des commits immuables, y compris les rejets historiques.

Le golden unique contient le scellement/ouverture, dix mutations backup, la canonicalisation Context
v2 avec douze refus adversariaux, les cas limites rejouables profondeur/nœuds/liens/nombres et le seul profil
`libre-ai.recovery-secret-code.v1`. Tout le matériel est
public, déterministe et interdit comme secret, sel, nonce ou identifiant de production.

## Progression

Gate A a permis la validation machine-checkable des artefacts et le propriétaire a autorisé le passage `candidate -> locked`. Gate B a ensuite produit six rejets immuables ; le dernier sur `5190972` passe les budgets de la classe haute mémoire de référence sans approuver l’usage. Une modification normative invalide les verdicts antérieurs concernés.

Le host produit désactivé de la PR #95 et les signaux crash/kill/restart de la PR #97 complètent la qualification, sans constituer un nouveau verdict Gate B. Restent notamment l’OOM réel du processus, le quota réellement épuisé, les garanties d’effacement défendables, les classes physiques contraintes et les revues spécialisées fraîches. Gate B et les gates projet restent obligatoires avant toute sauvegarde utilisateur ou release.
