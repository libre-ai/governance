# Architecture review — quorum de deux agents

- **reviewPassId:** `agent-orchestration-quorum-architecture-d547a83`
- **mode:** `architecture`
- **reviewedCommit:** `d547a83aa9c5cf5b4d147de0dcc898436e2e9c25`
- **RFC SHA-256:** `8722fea13d564b3f2405190dc26c94ea35a23825c0653dfebf0fff42ad18b93c`
- **verdict:** `approve-with-minor-reservations`

## Evidence reproduced

```text
bun run check:source
Source policy verified

bun run check:work-packages
Work package plan verified: 26 packages, 53 exclusive write paths

bun run check:specifications
Application specification structure verified: 9
```

Le worktree review-only était propre et détaché. Aucun fichier revu n’a été modifié pendant la passe.

## Verified decision

- Missions devient l’autorité du workflow, des attestations et du calcul de quorum, pas une autorité humaine exclusive du verdict technique.
- Le seuil technique est deux reviewers agents distincts de tous les contributeurs du digest.
- Le plan et le résultat sont revus séparément sur des digests immuables.
- Un rejet ou une modification invalide le quorum du digest.
- Les domaines protégés conservent un jalon humain additif conformément aux règles canoniques.
- Les contrats v1 restent inchangés ; cette évolution exige Missions v2.

## Minor reservations

- Les futures transitions Missions v2 doivent distinguer `review-requested`, `review-recorded`, `review-rejected`, `quorum-reached` et `validated`.
- La sélection du roster reviewer, la détection de conflit d’intérêts et le comportement après rejet devront être byte-exacts dans les contrats/vecteurs.

## Residual risk

Deux identités distinctes ne garantissent pas à elles seules une diversité de modèle ou de provider. Cette diversité peut être une policy additionnelle, sans affaiblir le seuil de deux agents distincts.
