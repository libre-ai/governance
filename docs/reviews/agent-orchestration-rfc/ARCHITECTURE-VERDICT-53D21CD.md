# Architecture review — RFC orchestration agentique

- **reviewPassId:** `agent-orchestration-rfc-architecture-53d21cd`
- **mode:** `architecture`
- **reviewedCommit:** `53d21cdb512f979dddf3dc51acdc915e209e350c`
- **RFC SHA-256:** `79b47d342b8db881ab43c1876575c39f26909774d95e3b29793dde5642e837d7`
- **verdict:** `reject`

## Evidence reproduced

```text
bun run check:source
Source policy verified

bun run check:work-packages
Work package plan verified: 26 packages, 53 exclusive write paths
```

Le worktree review-only était propre et détaché sur le commit revu. Aucun fichier revu n’a été modifié pendant la passe.

## Findings

### Blocking

1. **Cycle digest/approbation.** Le plan proposé contient des références d’approbation tout en exigeant une approbation liée au digest du plan. Si la référence fait partie de la préimage du plan, son `subjectDigest` crée un cycle. Il faut séparer un corps de plan canonique de l’enveloppe d’autorisation humaine qui référence son digest.

### Major

1. **Autorité Missions incomplète.** `MissionRecord v1` ne référence aucun digest de plan d’exécution. La liste des contrats candidats exclut une évolution Missions et ne permet donc pas de prouver que l’humain a autorisé le plan exact démarré par l’orchestrateur.
2. **Producteur et canonicalisation du plan non définis.** Le draft ne dit pas qui propose le corps de plan, quelle sérialisation entre dans sa préimage ni comment l’autorisation expire ou est révoquée.

## Residual risks

- Une future séparation plan/autorisation devra éviter de créer une seconde autorité d’état hors Missions.
- Toute évolution de `MissionRecord` ou de l’API Missions sera une nouvelle autorité majeure candidate, pas une modification silencieuse de v1.

## Required remediation

- introduire `ExecutionPlanBody` canonique sans approbation dans sa préimage ;
- introduire une `ExecutionAuthorization` Missions qui lie le digest du corps, la mission, sa révision, les approbations et l’expiration ;
- inclure `mission-record.v2` et l’évolution de l’API Missions dans le futur incrément contractuel, sans modifier v1 en place ;
- attribuer explicitement proposition, canonicalisation et autorisation.
