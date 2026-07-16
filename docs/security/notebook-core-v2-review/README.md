# Dossier de revue — Notebook Core v2

> **Statut : GATE S ACCEPTÉE POUR RÉDACTION DU CANDIDAT UNIQUEMENT.** Les artefacts restent
> `candidate` / `pending-independent-review`. Aucun moteur, aucune donnée utilisateur, aucun statut
> `locked` et aucune release ne sont autorisés avant les verdicts Gate A puis le jalon humain.

## Autorité unique

La sémantique normative est
[`contracts/wit/notebook-core-v2/SEMANTICS.md`](../../../contracts/wit/notebook-core-v2/SEMANTICS.md).
Ce dossier ne la duplique plus. Les copies de revue suivantes DOIVENT rester byte-identiques aux
artefacts catalogués et le check Gate S vérifie cette identité :

- [`world.wit`](world.wit) ↔ `contracts/wit/notebook-core-v2/world.wit` ;
- [`notebook-backup-seal-request.v2.schema.json`](notebook-backup-seal-request.v2.schema.json) ↔
  `contracts/schemas/notebook-backup-seal-request.v2.schema.json` ;
- [`notebook-backup.v2.schema.json`](notebook-backup.v2.schema.json) ↔
  `contracts/schemas/notebook-backup.v2.schema.json` ;
- [`notebook-core-v2.golden.json`](notebook-core-v2.golden.json) ↔
  `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`.

Les corrections de Gate S sont notamment : interface WIT autonome `api`, erreurs fermées, identifiant
de sauvegarde/contexte CSPRNG opaques, retrait de `createdAt` des artefacts clairs, limite plaintext 16 MiB,
canonicalisation Context v2 déterministe et profil Unicode obligatoire pour le recovery secret.

## Pièces du dossier

- [`MIGRATION.md`](MIGRATION.md) motive le major v2 et l'absence d'adaptateur heuristique ;
- [`SOLO-CHALLENGE.md`](SOLO-CHALLENGE.md) consigne les constats Gate S et risques résiduels ;
- [`PERFORMANCE.md`](PERFORMANCE.md) justifie la réduction conservatoire à 16 MiB ;
- [`INDEPENDENT-REVIEW.md`](INDEPENDENT-REVIEW.md) est le procès-verbal Gate A/B à compléter ;
- [`../../reviews/notebook-core-v2/`](../../reviews/notebook-core-v2/) conserve les verdicts par rôle
  sur des commits immuables, y compris les rejets historiques.

Le golden unique contient le scellement/ouverture, dix mutations backup, la canonicalisation Context
v2 avec dix refus adversariaux et les profils `libre-ai.recovery-secret-code.v1` /
`libre-ai.recovery-secret-text.v1`. Tout le matériel est
public, déterministe et interdit comme secret, sel, nonce ou identifiant de production.

## Progression

Gate S autorise seulement l'évolution machine-checkable du candidat. Gate A exige des verdicts
séparés architecture, sécurité, cryptographie et vie privée, chacun lié au commit et aux SHA-256, puis
un jalon humain explicite. Une modification normative invalide les verdicts antérieurs concernés.

Après verrouillage et seulement après le jalon humain, Gate B examinera le composant et le host réels :
imports module/composant, exécution sans WASI, zéroïsation, OOM/panics, CSPRNG, conversion du secret,
absence de persistance/log/réseau privés et budgets navigateur. Gate B et les gates projet restent
obligatoires avant toute sauvegarde utilisateur ou release.
