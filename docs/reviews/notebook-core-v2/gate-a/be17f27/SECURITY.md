# Rapport Gate A — rôle SÉCURITÉ — Notebook Core v2

## Rôle
- **Rôle examiné :** sécurité uniquement.
- **Hors périmètre :** verdict cryptographie, verdict vie privée, jalon humain, verrouillage, Gate B, release.
- **Commit exact revu :** `be17f27f5dec71457aca1aedb3100865900a14e1`
- **Arbre Git :** `7ca22b9fa03998e5e4503b7b598bc1f1943384b8`
- **Arbre dossier sécurité :** `a36bda9df0afdcceeb41c41292f10d3e0b566afa`
- **Sujet :** `Merge pull request #38 from libre-ai/fix/notebook-core-v2-gate-a-remediation`

## Empreintes
| Artefact | SHA-256 |
|---|---|
| `docs/reviews/AGENT-REVIEW-PROTOCOL.md` | `522670835073096eea774d825df3f1b462296b9d0c3d09408807b28b9e54a6c1` |
| `docs/adr/0003-wp-g2-s01-contract-amendment.md` | `1ae324aca664822c9f9b89fd87d0186c3a28aed05c0d814a73fab261a2d36738` |
| `contracts/catalog.v1.json` | `908e735f9c1c6ac825890001a52ee66fc02b5bf45ea9894e99cdfa41e2fe2714` |
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `c129c58f3c5938fe884b64267b129be41e33941b11ee635d647a2c3181fe85f2` |
| `contracts/schemas/context-document.v2.schema.json` | `fe030c2642076588289f5da7814cb44bbff75e7684f487c0c7e4c230e25be455` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `3d25b790c357e8fd27f5bb3759f3217a3db3eb38dcba5980de5ea82ecbb15841` |
| `docs/security/notebook-core-v2-review/notebook-core-v2.golden.json` | `3d25b790c357e8fd27f5bb3759f3217a3db3eb38dcba5980de5ea82ecbb15841` |
| `docs/apps/notebook.md` | `41a083921acf9a699791617fc4e1228287ad198d15a4f1e58972663bf997bc1e` |

## Commandes / preuves
```bash
git rev-parse HEAD
git rev-parse HEAD^{tree}
git rev-parse HEAD:docs/security/notebook-core-v2-review
git status --short
git fsck --no-dangling --no-progress
```
- `HEAD` = commit demandé.
- `git status --short` vide avant/après checks.
- `git fsck` OK.

```bash
cmp -s contracts/wit/notebook-core-v2/world.wit docs/security/notebook-core-v2-review/world.wit
cmp -s contracts/schemas/notebook-backup-seal-request.v2.schema.json docs/security/notebook-core-v2-review/notebook-backup-seal-request.v2.schema.json
cmp -s contracts/schemas/notebook-backup.v2.schema.json docs/security/notebook-core-v2-review/notebook-backup.v2.schema.json
cmp -s contracts/fixtures/notebook-core-v2/golden-vectors.v1.json docs/security/notebook-core-v2-review/notebook-core-v2.golden.json
```
- 4 sorties `0` : copies de revue **byte-identiques**, golden unique rétabli.

```bash
bun run check:notebook-core-v2-candidate
bun run check:contracts
cargo test -p libre-ai-ecosystem-engine --test wit_contracts
```
- `check:notebook-core-v2-candidate` OK : WIT fermé, copies identiques, **10 mutations backup + 10 mutations context**.
- `check:contracts` OK : catalogue, schémas, vecteurs Notebook structurels vérifiés.
- `cargo test ... wit_contracts` OK : mondes WIT résolus.

```bash
rg -l 'canonicalize-context|seal-backup|open-backup' .
```
- Occurrences limitées aux contrats/docs/outils ; **aucun moteur produit** trouvé, cohérent avec la séparation Gate A/B.

## Modèle de menace
Attaquant capable de fournir :
- JSON hostile (`UTF-8` invalide, BOM, clés dupliquées, champs inconnus, JSON imbriqué invalide/dupliqué) ;
- graphes de contexte invalides (racines/liens manquants, exclusions conflictuelles, doublons) ;
- Base64 non canonique, digest recalculé, mutation AAD/nonce/sel/ciphertext ;
- paramètres KDF faibles/hors bornes ;
- secrets erronés ou hors bornes (15 / 1025 octets) ;
- entrées proches des bornes `16 MiB` / `22 370 044` pour tenter DoS/OOM ;
- tentative d’introduire capacités/imports host ou de contourner la séparation Gate A/B.

## Constats blocking
1. **Aucun constat blocking ouvert.**

## Constats major
1. **Aucun constat major ouvert.**

## Constats minor
1. **Aucun constat mineur ouvert sur le protocole candidat revu.**

## Risques résiduels
Preuves **légitimement reportées à Gate B** uniquement :
- imports réels du module/composant WASM et exécution sans WASI ;
- zéroïsation effective secret/clé/mémoire Argon2id/plaintexts d’échec ;
- absence réelle de persistance, logs, métriques, globals et caches ;
- qualité/unicité CSPRNG host pour `id`/sel/nonce ;
- comportement sous OOM/trap/panic et budgets mémoire/latence navigateur ;
- homogénéité observable des échecs `authentication-failed` sur moteur/host réels.

Le candidat Gate A est cohérent avec ces reports : WIT fermé sans import (`world.wit`), statuts encore `candidate` / `pending-independent-review` (`contracts/catalog.v1.json`), limites et refus normatifs explicites (`SEMANTICS.md`), vecteurs adversariaux présents pour BOM/UTF-8/clé dupliquée/JCS imbriqué/graphes/secrets 15/1025/digest seul/`unsupported-version`.

Ce verdict **ne vaut ni jalon humain, ni verrouillage, ni Gate B, ni release**, et n’approuve aucun autre rôle.

APPROVE
