# France/EU privacy review — quorum de deux agents

- **reviewPassId:** `agent-orchestration-quorum-privacy-d547a83`
- **mode:** `france-eu-privacy`
- **reviewedCommit:** `d547a83aa9c5cf5b4d147de0dcc898436e2e9c25`
- **RFC SHA-256:** `8722fea13d564b3f2405190dc26c94ea35a23825c0653dfebf0fff42ad18b93c`
- **verdict:** `reject`

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

## Findings

### Major

1. **Findings de review potentiellement sensibles.** Un tableau de findings ou une raison libre peut recopier code, prompt, chemin, secret ou donnée personnelle dans le contrat Missions. Le contrat canonique doit contenir seulement codes fermés, sévérité et références digérées ; les détails restent dans une preuve tenant-private à rétention bornée.
2. **Identités agents corrélables.** `contributorAgentIds`, `reviewerAgentId` et `reviewerRunId` sont nécessaires à l’enregistrement métier, mais ne doivent pas être exportés vers logs/OTEL ni conservés au-delà de la classe de rétention mission/review.

## Required remediation

- remplacer les findings inline par résumé borné + références de preuve privée ;
- appliquer classification, rétention, suppression et non-résurrection aux reviews ;
- exclure toutes les identités de review des logs/metrics ;
- limiter les exports aux identités nécessaires à l’audit autorisé, avec redaction selon rôle.

## Residual risk

Même un code de finding fermé peut révéler une catégorie sensible par inférence. Les vues et exports doivent rester tenant-scoped et autorisés au besoin d’en connaître.
