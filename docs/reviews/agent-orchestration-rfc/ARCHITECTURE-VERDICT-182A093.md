# Architecture rereview — RFC orchestration agentique

- **reviewPassId:** `agent-orchestration-rfc-architecture-182a093`
- **mode:** `architecture`
- **reviewedCommit:** `182a093e02eb2fc6dbe4666910d53500b5fad042`
- **RFC SHA-256:** `b61780f2bd061f00909cb57c9ee22c5ea168116d60f7ceabb7d722606acc3d0c`
- **verdict:** `approve-with-minor-reservations`

## Evidence reproduced

```text
bun run check:source
Source policy verified

bun run check:work-packages
Work package plan verified: 26 packages, 53 exclusive write paths

biome ci .
Checked 194 files. No fixes applied.
```

Le worktree review-only était propre et détaché sur le commit revu. Aucun fichier revu n’a été modifié pendant la passe.

## Verification of prior findings

- Le corps de plan est maintenant séparé de l’autorisation ; sa préimage n’inclut plus l’approbation.
- Missions possède explicitement l’autorisation liée au digest exact.
- `MissionRecord v2` et `missions.v2.yaml` sont identifiés comme nouvelles autorités candidates au lieu de réinterpréter v1.
- L’orchestrateur propose le corps mais ne peut pas l’autoriser.

## Findings

Aucun finding bloquant ou majeur sur la frontière d’architecture de la RFC.

## Minor reservations

- Le futur profil normatif doit fixer les octets exacts de canonicalisation et la préimage SHA-256.
- La transition Missions v2, l’expiration de l’autorisation et le comportement en cas de révocation concurrente restent à prouver par vecteurs avant lock.
- Aucun identifiant de work package ne doit être choisi avant revue du graphe G2/G3.

## Residual risks

Cette approbation vise uniquement la RFC. Elle n’approuve aucun contrat candidat, work package, crate, dépendance Pi, provider, réseau ou mission réelle.
