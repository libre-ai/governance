# Rapport de revue Gate A — rôle sécurité — Notebook Core v2

## Rôle et périmètre

- Rôle : sécurité uniquement.
- Hors périmètre : verdict cryptographique, verdict vie privée, Gate B, release.
- Dépôt examiné en lecture seule, sans modification.

## Commit exact

- Commit : `9b1b994301ac82fbdb781a32a33bdd080eb865a3`
- Sujet : `Merge pull request #26 from libre-ai/fix/notebook-core-v2-candidate-engine-evidence`
- Arbre dossier sécurité : `46f9b346382ada23865c7333e98b50647a9a5bca`
- Propreté : `git status --short` vide avant/après les checks.

## Empreintes SHA-256 principales

| Artefact | SHA-256 |
|---|---|
| `docs/reviews/AGENT-REVIEW-PROTOCOL.md` | `522670835073096eea774d825df3f1b462296b9d0c3d09408807b28b9e54a6c1` |
| `docs/adr/0003-wp-g2-s01-contract-amendment.md` | `1ae324aca664822c9f9b89fd87d0186c3a28aed05c0d814a73fab261a2d36738` |
| `contracts/catalog.v1.json` | `908e735f9c1c6ac825890001a52ee66fc02b5bf45ea9894e99cdfa41e2fe2714` |
| `contracts/wit/notebook-core-v2/world.wit` | `72aef100a93606f95ac9cd6f9551186470252acaa9161cbc6885e1296cad6171` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `b2ab094f6392d09d2331f145dfc0f2d85093d7439c2422147d34111c4284bde1` |
| `contracts/schemas/context-document.v2.schema.json` | `f14de256079228b075d38977321c0fb29b97bf872de78b2d03d7de00ea2e9dc9` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `d6b38a443249f7029dcd47eddd32a44d1b82025782a7df5e9bebeedfa79c8f96` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `d194c15523a51ee64a11fc09f07dfbd15e6e64d907e000b928d7b8e4d64a23d8` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `d0cb031d1bdfd888bed8cc2b88899197f03ea169612c3106970043450a3a04ee` |
| `docs/security/notebook-core-v2-review/notebook-core-v2.golden.json` | `aed372b5a2b9e14d483af85e290dbe998b26093aceef417af4dc405591dd4b66` |

Copies byte-identiques confirmées pour `world.wit`, `notebook-backup-seal-request.v2.schema.json`, `notebook-backup.v2.schema.json`. Divergence confirmée pour le golden Notebook : `cmp` retourne `1`.

## Commandes et preuves

- `git rev-parse HEAD` → commit attendu.
- `git rev-parse HEAD:docs/security/notebook-core-v2-review` → `46f9b346382ada23865c7333e98b50647a9a5bca`.
- `git status --short` → vide.
- `sha256sum ...` → empreintes ci-dessus.
- `cmp` contrats/dossier sécurité :
  - WIT : `0`
  - schéma seal request : `0`
  - schéma backup : `0`
  - golden : `1`
- `bun run check:contracts` → succès ; Notebook vectors structurally verified: `7 mutations`.
- `bun run check:notebook-core-v2-candidate` → succès ; Gate S verified avec `6 mutations`.
- `cargo test --workspace` → succès.

## Modèle de menace sécurité

Entrées adverses considérées : documents contexte JSON hostiles, enveloppes backup modifiées, secret erroné ou hors bornes, digest recalculé par attaquant, métadonnées/AAD altérées, paramètres KDF faibles ou excessifs, Base64 non canonique, clés dupliquées, BOM, champs inconnus, payloads proches des limites, pression mémoire/OOM.

Capacités attendues : cœur déterministe sans import hôte, sans réseau, horloge, hasard, stockage, environnement ni logs ; host local responsable du CSPRNG, de l’unicité sel/nonce, de la conversion stable du secret et de l’effacement de ses propres buffers.

## Constats blocking

1. **Vecteurs Notebook non uniques entre dossier de revue et contrats.**
   Le golden catalogué `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` contient 7 mutations, dont `unsupported-version`. Le dossier `docs/security/notebook-core-v2-review/notebook-core-v2.golden.json` en contient 6. Les checks reflètent cette divergence : `check:contracts` vérifie 7 mutations, `check:notebook-core-v2-candidate` vérifie 6 mutations et ne compare pas le golden du dossier avec celui des contrats.
   Impact : la Gate A ne peut pas lier sans ambiguïté le verdict sécurité à un jeu exact de vecteurs et de hashes. C’est incompatible avec le protocole de revue par rôle.

## Constats major

1. **Couverture adversariale insuffisante de `canonicalize-context`.**
   Le WIT expose `canonicalize-context`, et `SEMANTICS.md` impose clés dupliquées refusées, BOM refusé, champs inconnus refusés, tri UTF-8, intégrité des liens, exclusions disjointes, JCS interne pour `application/json`, recalcul `totalBytes`/`digest` et limite brute 128 MiB. Les vecteurs Notebook catalogués couvrent essentiellement backup/seal/open ; les fixtures schéma pour `context-document.v2` n’ont qu’une mutation `network location`.
   Impact : le protocole n’a pas encore de preuve contractuelle suffisante contre parsing hostile, divergences de canonicalisation, fail-open de graphes invalides ou régression DoS.

2. **Chemin anti-oracle “secret hors bornes” non vectorisé.**
   Le profil exige qu’un secret trop court/trop long à l’ouverture emprunte un chemin coûteux factice puis retourne uniquement `authentication-failed`. Les vecteurs couvrent un mauvais secret de même taille, mais pas les bornes `<16` ou `>1024` octets.
   Impact : un comportement de retour anticipé ou différencié pourrait passer les checks actuels alors que c’est une exigence centrale de non-oracle.

## Constats minor

1. Les bornes mémoire/latence candidates sont prudentes, mais leur validation réelle navigateur/WASM, OOM et panics reste entièrement Gate B.
2. L’absence d’imports est correcte au niveau WIT ; l’absence d’imports du module et du composant final reste Gate B.
3. La zéroïsation, la non-persistance, l’absence de logs/télémétrie et les copies ABI ne sont pas vérifiables sans moteur ; report Gate B légitime.

## Analyse synthétique

Points satisfaisants côté protocole : erreurs WIT fermées sans message libre, séparation module/composant prévue, digest explicitement non autorisant, AAD liant métadonnées publiques, rejet des KDF faibles avant Argon2id, pas d’import hôte dans le WIT, statut catalogue encore `candidate`.

Points bloquants pour le rôle sécurité : l’artefact vectoriel n’est pas unique, et les vecteurs adversariaux ne couvrent pas assez les surfaces de parsing/canonicalisation et le cas anti-oracle secret hors bornes. Ces éléments relèvent de Gate A protocolaire, pas seulement de Gate B.

## Risques résiduels reportables à Gate B

- Vérification effective des imports WASM/module.
- Zéroïsation observable des secrets, clés, états AES/Argon2id et plaintexts d’échec.
- Mesures mémoire/latence sur navigateurs et appareils cibles.
- CSPRNG host, unicité sel/nonce, conversion stable du secret.
- Absence réelle de persistance, logs, métriques, globals et caches.

## Verdict sécurité

`REJECT`

Ce verdict ne vaut ni verrouillage, ni Gate B, ni release, et n’approuve aucun autre rôle.
