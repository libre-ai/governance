# Security rereview — RFC orchestration agentique

- **reviewPassId:** `agent-orchestration-rfc-security-182a093`
- **mode:** `security`
- **reviewedCommit:** `182a093e02eb2fc6dbe4666910d53500b5fad042`
- **RFC SHA-256:** `b61780f2bd061f00909cb57c9ee22c5ea168116d60f7ceabb7d722606acc3d0c`
- **verdict:** `reject`

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

- Le secret provider amont est déplacé dans le gateway.
- Le worker reçoit un jeton local court lié au run.
- Classification, path scopes, taille, rétention et ZDR entrent dans le corps de plan.
- L’attestation lie désormais les manifests exécutés et les capacités kernel effectives.
- Une pause ne peut plus annoncer une terminaison avant arrêt attesté des descendants.

## Findings

### Major

1. **Canal local insuffisamment isolé.** « socket locale » peut désigner un port loopback partagé avec d’autres processus du host. Le profil doit exiger un Unix socket privé ou un namespace réseau privé, authentifier le peer et rendre le jeton inutilisable depuis un autre processus/run.
2. **Autres secrets outils encore exposables.** Le draft exclut le secret provider de l’environnement worker mais autorise encore des credentials éphémères génériques. Aucun secret d’outil ne doit entrer dans Pi ou son shell. Le harness doit le conserver dans un broker et l’injecter seulement dans le processus outil isolé, avec sortie redacted et capacité one-shot.

## Residual risks

Même corrigé, un worker compromis peut demander l’exécution de toute opération autorisée par le plan. Le broker doit donc revalider outil, arguments structurés, run, budget, expiration et policy à chaque appel.

## Required remediation

- rendre le transport worker→gateway privé et authentifié au niveau OS et protocole ;
- interdire tout secret dans l’environnement et le filesystem du worker ;
- définir un broker d’outils qui injecte les secrets uniquement dans un subprocess borné ;
- imposer une capacité one-shot et une redaction fail-closed de la sortie pour les outils privilégiés.
