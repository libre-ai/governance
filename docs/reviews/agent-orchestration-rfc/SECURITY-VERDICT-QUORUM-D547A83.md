# Security review — quorum de deux agents

- **reviewPassId:** `agent-orchestration-quorum-security-d547a83`
- **mode:** `security`
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

1. **Lignée des contributeurs insuffisamment attribuée.** Le draft exige des IDs attestés, mais ne précise pas que le harness/orchestrateur construit `contributorAgentIds` à partir des écritures et corrections observées. Si le worker peut fournir cette liste, il peut omettre l’auteur et contourner l’interdiction d’auto-review.
2. **Attestation de review non liée cryptographiquement.** Le digest du sujet, le reviewer, le run, le verdict et les preuves doivent appartenir à une préimage canonique signée/attestée, avec nonce, expiration et anti-replay. Une simple structure JSON référencée ne suffit pas.
3. **Blind review seulement déclarative.** Le second reviewer ne doit pas pouvoir lire le verdict ou les findings du premier avant soumission. Cette isolation doit être appliquée par Missions/harness et attestée, pas demandée au prompt.

## Required remediation

- rendre la lignée des contributeurs dérivée des événements de write/hunk signés par le harness ;
- définir une préimage d’attestation de review avec signature, nonce, expiration et claim one-shot ;
- ajouter une policy de disclosure empêchant l’accès aux reviews sœurs avant soumission ;
- refuser le quorum si lignée, signature, nonce, expiration ou isolation sont absents/divergents.

## Residual risk

Deux agents compromis ou contrôlés par la même source peuvent produire deux approvals valides. La policy peut exiger des pools/runtimes distincts pour les missions à risque élevé, en plus de l’identité distincte obligatoire.
