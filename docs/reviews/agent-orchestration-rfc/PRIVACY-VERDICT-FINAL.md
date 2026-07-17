# France/EU privacy final review — RFC orchestration agentique

- **reviewPassId:** `agent-orchestration-rfc-france-eu-privacy-038c0dc`
- **mode:** `france-eu-privacy`
- **reviewedCommit:** `038c0dc7a9b3180646baa18e8649d1d88482a98d`
- **RFC SHA-256:** `0db3d239ac9e8b48b1cffee075a03558cdeb839b84a080f76529d01dac16ae2f`
- **RFC process SHA-256:** `df128cd533c755b9bd1afa82ba01ecc0c3d8d708db87917492c8372053001916`
- **verdict:** `approve-with-minor-reservations`

## Evidence reproduced

```text
bun run check:source
Source policy verified

bun run check:work-packages
Work package plan verified: 26 packages, 53 exclusive write paths

bun run check:specifications
Application specification structure verified: 9

biome ci .
Checked 194 files. No fixes applied.
```

Le worktree review-only était propre et détaché sur le commit revu. Aucun fichier revu n’a été modifié pendant la passe.

## Findings

Aucun finding bloquant ou majeur au niveau RFC.

## Verified controls

- les événements métier tenant-private sont séparés des logs et métriques ;
- tenant, mission, run stable, utilisateur, contenu, chemin et référence d’artefact sont exclus des logs/OTEL par défaut ;
- la corrélation opérationnelle est éphémère, non réversible et sans table persistée ;
- les preuves privées portent classification, digest et classe de cycle de vie ;
- suppression/anonymisation et non-résurrection après restore sont exigées ;
- l’egress modèle est lié à finalité, base d’autorisation, classification, région, sous-traitants, rétention, ZDR et non-réutilisation ;
- OTEL externe reste désactivé et sans contenu par défaut.

## Minor reservations and residual risks

- Les contrats candidats devront fixer un plafond chiffré de rétention opérationnelle et la précision temporelle minimale.
- La qualification d’un provider exigera preuve de région effective, sous-traitants et conditions contractuelles ; une simple URL UE ne suffit pas.
- Ce verdict ne constitue ni analyse juridique définitive, ni autorisation de traitement de données personnelles ou de transfert.
