# Security review — RFC orchestration agentique

- **reviewPassId:** `agent-orchestration-rfc-security-53d21cd`
- **mode:** `security`
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

1. **Secret provider dans le worker.** Le draft prévoit que Pi reçoive des credentials atténués. Une extension ou commande compromise dans le worker pourrait les lire et les exfiltrer. Le harness doit garder les secrets provider hors du worker et présenter un gateway local avec un jeton court, borné au run et inutilisable contre le provider amont.

### Major

1. **Egress modèle insuffisamment borné.** Une origine provider autorisée ne suffit pas à autoriser le contenu envoyé. Le plan doit fixer classification, sources/path scopes, politique de rétention/ZDR et limites d’octets pour le contexte modèle.
2. **Attestation incomplète.** Le digest d’un profil ne prouve pas le binaire, les extensions, les skills ni les primitives kernel réellement appliquées. L’attestation doit lier manifests exécutés, profil demandé, profil effectif et preuves des contrôles.
3. **Arrêt de processus ambigu.** Un passage en échec contrôlé après pause impossible ne garantit pas que les descendants ont cessé leurs effets. Le harness doit tuer et attester l’arrêt du groupe de processus avant l’événement terminal, sinon rester dans un état bloqué sans annoncer la terminaison.

## Residual risks

- Un gateway provider contrôle destination, auth et quotas, mais ne rend pas fiable le contenu produit par le modèle.
- L’autorisation d’un contenu de code vers un modèle UE reste une décision de classification et de rétention, pas une conséquence de l’allowlist réseau.

## Required remediation

- déplacer auth et transport provider dans un gateway possédé par le harness ;
- donner au worker uniquement un jeton local court lié au run ;
- ajouter policy de classification/egress au corps de plan ;
- lier l’attestation aux manifests worker/extensions/skills et aux contrôles effectifs ;
- préciser l’arrêt fail-closed du groupe de processus.
