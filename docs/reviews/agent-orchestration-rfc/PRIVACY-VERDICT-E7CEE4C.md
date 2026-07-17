# France/EU privacy review — RFC orchestration agentique

- **reviewPassId:** `agent-orchestration-rfc-france-eu-privacy-e7cee4c`
- **mode:** `france-eu-privacy`
- **reviewedCommit:** `e7cee4c2b12315d1b2843cbcbf658cfe6793bd57`
- **RFC SHA-256:** `f8301c9470c595f9c281c7587a99e0a4e6dce35c720f32f6a99596fa68b1bd47`
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

### Major

1. **Événements et journal opérationnel non séparés.** Le draft autorise des « identifiants techniques bornés » dans le journal. `tenantId`, `missionId`, chemins de source et références stables sont pseudonymes, corrélables et potentiellement personnels. Ils sont nécessaires dans les contrats métier autorisés, pas dans les logs/OTEL.
2. **Provider policy incomplète pour les transferts.** UE et ZDR ne suffisent pas : la policy doit référencer finalité, classification, base d’autorisation du traitement, région effective, sous-traitants, rétention et interdiction d’entraînement/réutilisation.
3. **Rétention des preuves non bornée.** « rétention explicite » n’impose ni plafond, ni suppression/anonymisation, ni comportement de restore. Les artefacts contenant code ou prompts doivent suivre une classe de cycle de vie approuvée.

## Residual risks

Un identifiant de run aléatoire peut rester corrélable si une table d’association ou des timestamps précis sont conservés. La minimisation doit couvrir attributs, cardinalité et durée.

## Required remediation

- séparer les événements métier tenant-scoped des logs/metrics opérationnels zéro contenu ;
- interdire tenant, mission, utilisateur et références stables dans logs/OTEL par défaut ;
- ajouter une corrélation éphémère non réversible et une rétention courte ;
- compléter la policy provider avec finalité, région, sous-traitants, rétention et non-réutilisation ;
- lier chaque preuve privée à une classe de rétention/suppression et au non-resurrection après restore.
