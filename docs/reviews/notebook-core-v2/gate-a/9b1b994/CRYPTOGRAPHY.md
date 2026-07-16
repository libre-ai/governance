# Rapport Gate A — Notebook Core v2 — rôle cryptographie

## Rôle, portée et indépendance

- **Rôle examiné exclusivement :** cryptographie.
- **Passe :** fraîche, review-only, sans participation à la rédaction du candidat ni à une future implémentation principale.
- **Données utilisées :** uniquement le secret et le plaintext publics des fixtures.
- **Modification du dépôt :** aucune. Le harness indépendant a été créé uniquement sous `/tmp/libre-ai-notebook-crypto-review-9b1b994`.
- Ce rapport n’approuve aucun autre rôle, notamment architecture, sécurité ou vie privée.

## Commit et propreté

- Commit exact : `9b1b994301ac82fbdb781a32a33bdd080eb865a3`
- Arbre Git : `ae97c8579091b15f13d4315f1bb359aebb35ff6f`
- Arbre du dossier de revue : `46f9b346382ada23865c7333e98b50647a9a5bca`
- Sujet : `Merge pull request #26 from libre-ai/fix/notebook-core-v2-candidate-engine-evidence`
- `git fsck --no-dangling --no-progress` : succès.
- `git status --porcelain=v1 --untracked-files=all` : vide avant et après revue.
- Index et worktree : propres.
- Commit demandé et `HEAD` : identiques.

Commandes de liaison :

```bash
git rev-parse HEAD
git rev-parse HEAD^{tree}
git rev-parse HEAD:docs/security/notebook-core-v2-review
git status --porcelain=v1 --untracked-files=all
git diff --quiet
git diff --cached --quiet
git fsck --no-dangling --no-progress
```

## Empreintes SHA-256

### Autorités canoniques Notebook

| Fichier | SHA-256 |
|---|---|
| `contracts/catalog.v1.json` | `908e735f9c1c6ac825890001a52ee66fc02b5bf45ea9894e99cdfa41e2fe2714` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `b2ab094f6392d09d2331f145dfc0f2d85093d7439c2422147d34111c4284bde1` |
| `contracts/wit/notebook-core-v2/world.wit` | `72aef100a93606f95ac9cd6f9551186470252acaa9161cbc6885e1296cad6171` |
| `contracts/schemas/context-document.v2.schema.json` | `f14de256079228b075d38977321c0fb29b97bf872de78b2d03d7de00ea2e9dc9` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `d6b38a443249f7029dcd47eddd32a44d1b82025782a7df5e9bebeedfa79c8f96` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `d194c15523a51ee64a11fc09f07dfbd15e6e64d907e000b928d7b8e4d64a23d8` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `d0cb031d1bdfd888bed8cc2b88899197f03ea169612c3106970043450a3a04ee` |

### Gouvernance et dossier de revue

| Fichier | SHA-256 |
|---|---|
| `docs/reviews/AGENT-REVIEW-PROTOCOL.md` | `522670835073096eea774d825df3f1b462296b9d0c3d09408807b28b9e54a6c1` |
| `docs/adr/0003-wp-g2-s01-contract-amendment.md` | `1ae324aca664822c9f9b89fd87d0186c3a28aed05c0d814a73fab261a2d36738` |
| `docs/reviews/notebook-core-v2/README.md` | `d6dc31dba41cd5db7b3929c6a953181f9e9581902ef8a6dc19e79bfa62daffc8` |
| `docs/security/notebook-core-v2-review/README.md` | `b0808331772be998beeea0935aee05755e65f49a5f364118bcb9d7758dea992b` |
| `docs/security/notebook-core-v2-review/INDEPENDENT-REVIEW.md` | `4bae484b0788845f721cd9bc50a67fe66943afe10a625838ca23177eefdc825a` |
| `docs/security/notebook-core-v2-review/MIGRATION.md` | `8c6eb45f5bc378c974b78e6259b3e6b084e976340f717d163bbb57d2ac46f82b` |
| `docs/security/notebook-core-v2-review/PERFORMANCE.md` | `a730e86e32de09b23a36df07876a7a7d342920da6c4be1b54c35c872c064a0cf` |
| `docs/security/notebook-core-v2-review/SOLO-CHALLENGE.md` | `881ac6493a52b7520060fd15e9bf627cd8be3d4417d11916c078e18724914666` |
| `docs/security/notebook-core-v2-review/notebook-core-v2.golden.json` | `aed372b5a2b9e14d483af85e290dbe998b26093aceef417af4dc405591dd4b66` |

Les copies WIT et schémas du dossier de sécurité sont byte-identiques aux autorités canoniques. Le golden du dossier de sécurité diffère : il contient six mutations, tandis que le golden canonique en contient sept, avec l’ajout de `unsupported-version`.

## Chaîne indépendante

Environnement :

- macOS 26.5.2, `aarch64-apple-darwin`
- `rustc 1.97.0 (2d8144b78 2026-07-07)`
- `cargo 1.97.0 (c980f4866 2026-06-30)`
- RustCrypto `argon2 0.5.3`
- RustCrypto `aes-gcm 0.10.3`
- `serde_jcs 0.1.0`
- `serde_json 1.0.141`
- `sha2 0.10.9`
- `base64 0.22.1`
- `subtle 2.6.1`
- Bun `1.3.11`, utilisé seulement pour les gates existantes
- `jq 1.8.2`, `shasum 6.02`

La reproduction cryptographique n’utilise ni pyca/cryptography, ni OpenSSL EVP_KDF, ni Node Web Crypto. La mention OpenSSL dans `cargo -Vv` concerne exclusivement le transport réseau de Cargo, pas les calculs du harness.

Empreintes du harness :

| Artefact sous `/tmp` | SHA-256 |
|---|---|
| `Cargo.toml` | `24eb7e8821a2775e1ccd94deeda828224faad40a5cd92fa1cde678df16e1a7bb` |
| `Cargo.lock` | `4b4b6ef09a48a4a8a070d6c2d0ee2feab92423ed505a20e440932766dc2903c3` |
| `src/main.rs` | `091cc43b50e243c02769ceefcaf3bc2ff01b2d158bfda9df3397c86896303335` |
| binaire release | `a167cf28c77fbf2adb0956b6672758d452bfa6fbb42fc55329750e4c441925ef` |
| sortie du golden canonique | `fd8645754b84539166322693f7923baa0d4142c2e7d93e768715886360d6d7a0` |
| sortie du golden du dossier | `b60a5373a65fcf1eb00c9a70ae1d9219e3cdaf11c1b0d7c0d44f682f8ac296bc` |

Commande principale :

```bash
cd /tmp/libre-ai-notebook-crypto-review-9b1b994
cargo run --locked --release -- \
  /private/tmp/libre-ai-notebook-gate-a-cryptography/contracts/fixtures/notebook-core-v2/golden-vectors.v1.json
```

## Valeurs reproduites

### Argon2id

```text
P.hex = 6e6f7465626f6f6b2d636f72652d76322d7075626c69632d746573742d736563726574
P.len = 35
S.hex = 000102030405060708090a0b0c0d0e0f
S.len = 16
K = vide
X = vide
version = 0x13
m = 65536 KiB
t = 3
p = 1
T = 32 octets
clé = e6b35d4e67ec1f04cf571aa3cc441746dadec01406cd82a88ec4ea5708183e1c
```

La sortie brute Argon2id est utilisée directement comme clé AES-256. Cette utilisation est correcte tant que la clé reste exclusivement affectée à cette opération AEAD ; aucun HKDF supplémentaire n’est nécessaire.

### JCS des métadonnées et AAD

```json
{"cipher":"aes-256-gcm","createdAt":"2026-07-16T00:00:00Z","id":"urn:libre-ai:backup:golden-1","kdf":{"algorithm":"argon2id","iterations":3,"memoryKiB":65536,"outputLengthBytes":32,"parallelism":1,"salt":"AAECAwQFBgcICQoLDA0ODw==","version":19},"nonce":"EBESExQVFhcYGRob","schemaVersion":"libre-ai.notebook-backup.v2"}
```

- AAD : 350 octets.
- Préfixe : `UTF8("libre-ai.notebook-backup.v2/aad") || 00`.
- Hexadécimal complet :

```text
6c696272652d61692e6e6f7465626f6f6b2d6261636b75702e76322f616164007b22636970686572223a226165732d3235362d67636d222c22637265617465644174223a22323032362d30372d31365430303a30303a30305a222c226964223a2275726e3a6c696272652d61693a6261636b75703a676f6c64656e2d31222c226b6466223a7b22616c676f726974686d223a226172676f6e326964222c22697465726174696f6e73223a332c226d656d6f72794b6942223a36353533362c226f75747075744c656e6774684279746573223a33322c22706172616c6c656c69736d223a312c2273616c74223a2241414543417751464267634943516f4c4441304f44773d3d222c2276657273696f6e223a31397d2c226e6f6e6365223a2245424553457851564668635947526f62222c22736368656d6156657273696f6e223a226c696272652d61692e6e6f7465626f6f6b2d6261636b75702e7632227d
```

### AES-256-GCM

```text
nonce = 101112131415161718191a1b
C = 833724730182e6810c335b29c7b47f149533b2f4a499059cd9522ea2127299920eea58c087f25f16c3f3954ae4
T = d8d6dbb866b13deb08b285d7bf436bdb
C||T = 833724730182e6810c335b29c7b47f149533b2f4a499059cd9522ea2127299920eea58c087f25f16c3f3954ae4d8d6dbb866b13deb08b285d7bf436bdb
Base64 = gzckcwGC5oEMM1spx7R/FJUzsvSkmQWc2VIuohJymZIO6ljAh/JfFsPzlUrk2NbbuGaxPesIsoXXv0Nr2w==
```

Le nonce de 96 bits suit le chemin recommandé de GCM et le tag de 128 bits est correct. Les 16 MiB représentent environ `2^20` blocs AES, très en dessous de la limite GCM par invocation. La sécurité d’unicité repose sur le couple clé/nonce : le sel neuf change normalement la clé et le nonce neuf protège également contre une répétition de sel. Le CSPRNG et l’absence de réutilisation relèvent du host et devront être prouvés en Gate B.

### Digest et enveloppe

```text
préimage digest = 453 octets
digest = 7163e7365e6486785ab9f1510caca7cc74a94aeede02660863f2313248904029
enveloppe finale = 494 octets
```

```json
{"cipher":"aes-256-gcm","ciphertext":"gzckcwGC5oEMM1spx7R/FJUzsvSkmQWc2VIuohJymZIO6ljAh/JfFsPzlUrk2NbbuGaxPesIsoXXv0Nr2w==","createdAt":"2026-07-16T00:00:00Z","digest":"7163e7365e6486785ab9f1510caca7cc74a94aeede02660863f2313248904029","id":"urn:libre-ai:backup:golden-1","kdf":{"algorithm":"argon2id","iterations":3,"memoryKiB":65536,"outputLengthBytes":32,"parallelism":1,"salt":"AAECAwQFBgcICQoLDA0ODw==","version":19},"nonce":"EBESExQVFhcYGRob","schemaVersion":"libre-ai.notebook-backup.v2"}
```

L’ouverture restitue exactement 45 octets :

```text
4e6f7465626f6f6b20636f72652076322064657465726d696e69737469632074657374207061796c6f61642e0a
```

### Cas négatifs

| Cas | Classe reproduite | Argon2id | Plaintext |
|---|---|---:|---:|
| mauvais secret | `authentication-failed` | oui | non |
| nonce modifié | `authentication-failed` | oui | non |
| sel modifié | `authentication-failed` | oui | non |
| ciphertext modifié | `authentication-failed` | oui | non |
| AAD/identifiant modifié | `authentication-failed` | oui | non |
| paramètres faibles | `invalid-envelope` | non | non |
| version non supportée | `unsupported-version` | non | non |
| digest seul modifié, test additionnel | `authentication-failed` | oui | non |
| secret de 15 octets, test additionnel | `authentication-failed` après chemin factice coûteux | oui | non |

Les cinq mutations cryptographiques structurellement valides exécutent le chemin coûteux et convergent vers le même code fermé. Les paramètres faibles et la version non supportée sont correctement classés comme erreurs publiques pré-cryptographiques.

## Analyse cryptographique

- **Argon2id :** v19 et les bornes `64–128 MiB`, `t=3..4`, `p∈{1,2,4}` sont conservatrices et bornées. Le profil initial `64 MiB/t=3/p=1` est suffisamment coûteux pour une sauvegarde locale, sans fallback ni ajustement silencieux.
- **Sel :** 16 octets est une longueur correcte. Il doit être généré neuf par CSPRNG pour chaque scellement.
- **Clé directe :** acceptable pour une sortie Argon2id de 32 octets affectée uniquement à AES-256-GCM. Toute réutilisation future pour un autre usage exigerait une séparation de clés.
- **Base64 :** les tailles, l’alphabet et le padding sont cohérents. Les regex des schémas ne suffisent pas à exclure tous les bits inutilisés non nuls ; la règle normative de réencodage après décodage est donc indispensable en implémentation.
- **JCS :** les objets authentifiés sont non ambigus. Les champs cryptographiques sont ASCII ou numériques et ne présentent pas de difficulté de normalisation Unicode. Le parseur devra néanmoins refuser les clés dupliquées avant construction d’un objet.
- **Digest :** il est public et recalculable, mais ne constitue jamais une autorisation. L’exigence de poursuivre Argon2id et AES-GCM malgré un mismatch empêche son utilisation comme court-circuit d’authentification.
- **Anti-oracle :** l’ordre prescrit est cohérent. Les classes structurelles publiques peuvent être distinguées ; les échecs cryptographiques valides ne le peuvent pas. Le secret hors bornes emprunte correctement un chemin factice et force l’échec.
- **Migration :** le major v2 est justifié. L’absence de recette v1 complète interdit une détection ou migration heuristique sûre ; réouverture par l’ancienne implémentation exacte puis nouveau scellement v2 est la seule voie acceptable.
- **Limite 16 MiB :** cryptographiquement sûre et nettement préférable aux 100 MiB initiaux. L’enveloppe JCS maximale a été recalculée à exactement `22 370 175` octets. Cette limite reste toutefois une borne de sécurité, pas une preuve d’utilisabilité sur appareils faibles.

### Budgets imposés à la Gate B

Sur chaque navigateur et classe d’appareil déclarés supportés :

1. profil producteur `m=65536,t=3,p=1`, plaintext maximal :
   - pic mémoire additionnel cible ≤ 256 MiB ;
   - latence p95 de scellement et ouverture ≤ 5 s ;
2. profil import maximal `m=131072,t=4,p=4` :
   - pic mémoire additionnel cible ≤ 384 MiB ;
   - latence p95 ≤ 10 s ;
3. aucun fallback KDF, aucune baisse automatique des paramètres et aucun plaintext sur OOM ou trap ;
4. instrumentation confirmant Argon2id puis AES-GCM pour mauvais secret, digest faux et mutations cryptographiques ;
5. absence de séparation temporelle stable imputable à un court-circuit entre ces erreurs à longueur et paramètres publics identiques ;
6. si ces budgets échouent sur une cible annoncée, révision de la borne ou de la matrice de support avant release, avec nouvelle revue en cas de changement normatif.

## Constats

### Blocking

Aucun.

### Major

Aucun.

### Minor

1. **CRYPTO-MIN-01 — Inventaires de vecteurs divergents, ouvert.**
   Le golden canonique contient sept mutations, dont `unsupported-version`, tandis que la copie du dossier de sécurité et `check:notebook-core-v2-candidate.ts` restent à six. L’autorité cataloguée est néanmoins non ambiguë et les deux jeux ont été reproduits. Cette divergence doit être explicitée ou résorbée dans l’hygiène du dossier de promotion.

2. **CRYPTO-MIN-02 — Couverture anti-oracle non entièrement matérialisée dans le golden, ouvert.**
   Le corpus canonique ne contient ni mutation du seul digest avec tag GCM valide, ni secret hors bornes. Les exigences normatives sont claires et ces deux cas ont été reproduits dans le harness indépendant ; ils doivent devenir des tests explicites de Gate B.

3. **CRYPTO-MIN-03 — Lien relatif du profil vers `INDEPENDENT-REVIEW.md`, ouvert.**
   Depuis `contracts/wit/notebook-core-v2/SEMANTICS.md`, ce lien ne résout aucun fichier. C’est un défaut documentaire sans incidence sur les octets cryptographiques ni sur l’autorité cataloguée.

## Gates du dépôt exécutées

```text
bun run check:notebook-core-v2-candidate
→ Gate S vérifiée, 6 mutations du dossier

bun run check:contracts
→ 71 entrées cataloguées, 47 paires de fixtures
→ Notebook canonique : 7 mutations
→ autres contrôles contractuels : succès
```

## Risques résiduels

- zéroïsation réelle des copies ABI, du secret, de la clé, de la mémoire Argon2id et des plaintexts d’échec ;
- comportement OOM/panic du parseur, de JCS et de l’allocateur WASM ;
- imports réels du module et du composant, à vérifier sur l’artefact construit ;
- qualité du CSPRNG host et non-réutilisation des sels/nonces ;
- conversion stable des secrets textuels et entropie effectivement imposée par l’UI ;
- qualification navigateur/appareil de la limite 16 MiB et des paramètres Argon2id ;
- vérification instrumentée de l’absence de court-circuit et de fuite observable.

Ces risques relèvent de la Gate B et des autres rôles. Le présent verdict ne vaut ni verrouillage du contrat, ni Gate B, ni autorisation d’implémentation publique, ni sauvegarde utilisateur, ni release.

## Verdict cryptographie

APPROVE
