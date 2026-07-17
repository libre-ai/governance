# Security final review — RFC orchestration agentique

- **reviewPassId:** `agent-orchestration-rfc-security-038c0dc`
- **mode:** `security`
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

- sandbox et profils obligatoires échouent fermés ;
- worktree et permissions Pi ne sont pas traités comme frontières de sécurité ;
- worker sans egress direct, canal gateway privé avec vérification peer OS + jeton de run ;
- aucun secret provider ou outil dans Pi, son environnement ou son filesystem ;
- outils privilégiés derrière un broker revalidant plan, arguments, budget, expiration et policy ;
- commandes shell structurées, sans allow par simple préfixe ;
- budgets monotones à travers retry/pause/reprise ;
- arrêt des descendants attesté avant événement terminal ;
- Biscuit tenant-bound, atténué et sans droit d’approbation/merge/release/deploy.

## Minor reservations and residual risks

- Les brokers privilégiés devront être des adapters audités et non des shells génériques ; leurs accès filesystem et sorties exigeront des vecteurs d’exfiltration.
- L’attestation de sandbox devra prouver le profil effectif sur chaque OS supporté ; « non supporté » reste un refus lorsque le plan l’exige.
- L’approbation de cette RFC n’autorise aucun provider, secret, réseau ou mission réelle.
