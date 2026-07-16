# Candidat de revue cryptographique — Notebook Core v2

> **Statut : GATE S ACCEPTÉE — candidat autorisé pour merge documentaire et développement non-production.** Cette auto-revue de bootstrap solo n'est pas indépendante et ne constitue pas une approbation cryptographique. Le dossier ne modifie pas `notebook-core-v1` et ne peut être promu vers `contracts/`, utilisé avec des données utilisateur ou releasé avant la Gate R externe. Les gates `rust-boundary-value-review` et `local-crypto-and-privacy-review` restent également obligatoires.

Les mots **DOIT**, **NE DOIT PAS** et **DEVRAIT** sont normatifs. Les standards de référence sont RFC 9106 (Argon2id), NIST SP 800-38D (GCM), RFC 4648 §4 (Base64) et RFC 8785 (JCS).

## 1. Surface corrigée

- [`world.wit`](world.wit) fait entrer explicitement `id` et `created-at` dans `seal-backup` ; le cœur ne les dérive pas.
- [`notebook-backup-seal-request.v2.schema.json`](notebook-backup-seal-request.v2.schema.json) est la projection JSON de test de la requête WIT. Le `recovery-secret` en est volontairement absent et reste un argument binaire séparé.
- [`notebook-backup.v2.schema.json`](notebook-backup.v2.schema.json) définit l'enveloppe persistable.
- [`notebook-core-v2.golden.json`](notebook-core-v2.golden.json) fixe les octets intermédiaires et les mutations.
- [`MIGRATION.md`](MIGRATION.md) motive le changement de major.
- [`SOLO-CHALLENGE.md`](SOLO-CHALLENGE.md) consigne l'auto-revue contradictoire et ses risques résiduels.
- [`INDEPENDENT-REVIEW.md`](INDEPENDENT-REVIEW.md) est le procès-verbal Gate R à compléter avant promotion canonique ou release.

Le WIT transporte `plaintext`, `salt`, `nonce` et `recovery-secret` comme octets déjà décodés. Dans la projection JSON seulement, `plaintext`, `salt` et `nonce` utilisent le Base64 normatif ci-dessous. `seal-backup` renvoie l'enveloppe en JSON JCS UTF-8 sans BOM ni saut de ligne terminal.

## 2. Validation bornée

### Identité et temps

Le host DOIT fournir :

- `schema-version = "libre-ai.notebook-backup-seal-request.v2"` ;
- un `id` ASCII `urn:libre-ai:backup:` suivi de 1 à 128 caractères `[A-Za-z0-9._~-]` ;
- `created-at` sous la forme UTC exacte `YYYY-MM-DDTHH:mm:ssZ`, date valide, sans fraction ni seconde intercalaire.

Le cœur n'importe aucune horloge. L'enveloppe reprend exactement `id` et `createdAt` après validation et utilise `schemaVersion = "libre-ai.notebook-backup.v2"`.

### Base64

Toute valeur Base64 DOIT utiliser l'alphabet standard RFC 4648 §4 (`A-Z a-z 0-9 + /`), avec bourrage `=` obligatoire, sans espace ni saut de ligne. Le décodeur DOIT rejeter les bits inutilisés non nuls et toute représentation non canonique ; le test autoritatif est `base64_encode(base64_decode(value)) == value`.

- sel Argon2id : **16 octets exactement**, donc 24 caractères Base64 terminés par `==` ;
- nonce GCM : **12 octets exactement**, donc 16 caractères Base64 sans bourrage ;
- ciphertext : encodage de `C || T`, où `T` est le tag de 16 octets placé à la fin.

### Tailles

| Valeur binaire | Minimum | Maximum |
| --- | ---: | ---: |
| `recovery-secret` | 16 octets | 1024 octets |
| plaintext | 1 octet | 104 857 600 octets (100 MiB) |
| ciphertext `C || T` | 17 octets | 104 857 616 octets |
| clé dérivée | 32 octets | 32 octets |
| tag GCM | 16 octets | 16 octets |

L'entrée brute `open-backup.envelope` est limitée à **139 810 687 octets**, maximum d'une enveloppe JCS conforme avec le ciphertext maximal. Les longueurs décodées sont vérifiées en plus des longueurs JSON Schema. Aucun calcul Argon2id n'a lieu avant validation de la structure, des algorithmes, des paramètres et de ces bornes publiques.

Le secret est une chaîne d'octets opaque : le cœur ne réalise ni décodage, ni trim, ni normalisation Unicode. Une UI textuelle DOIT fixer une conversion stable avant le premier scellement (UTF-8 sans BOM après NFC recommandé) et la réappliquer à l'identique à la restauration. La longueur ne prouve pas l'entropie : le produit DEVRAIT générer au moins 128 bits aléatoires ou imposer une politique équivalente côté UI, sans dictionnaire ni mesure de force dans le cœur.

## 3. Argon2id vers AES-256

Les paramètres acceptés sont strictement :

| Paramètre | Valeur acceptée |
| --- | --- |
| variante | Argon2id |
| version | `0x13` (champ JSON décimal `19`) |
| mémoire `m` | 65 536 à 131 072 KiB inclus, multiple de 1 024 KiB |
| passes `t` | 3 ou 4 |
| lanes `p` | 1, 2 ou 4 |
| longueur de sortie `T` | 32 octets |

La configuration producteur initiale DOIT être `m=65536, t=3, p=1` jusqu'à qualification de performance sur les navigateurs supportés. Pour la fonction Argon2 de RFC 9106 :

- `P` est exactement `recovery-secret` ;
- `S` est le sel décodé de 16 octets ;
- `K` (secret Argon2 optionnel) est vide ;
- `X` (associated data Argon2 optionnelle) est vide ;
- la sortie brute de 32 octets est directement la clé AES-256 ; aucune chaîne PHC, aucun encodage texte, HKDF, hash ou troncature supplémentaire n'est appliqué ;
- `p` fixe les lanes ; le nombre de threads d'exécution ne change pas le résultat.

Un tuple hors bornes est une requête/enveloppe invalide et n'est jamais « ajusté », arrondi ou remplacé par un défaut.

## 4. Octets AAD exacts

Soit `JCS(x)` la sérialisation RFC 8785 en UTF-8, sans BOM ni terminaison. L'objet de métadonnées contient exactement les champs suivants et aucun autre :

```json
{
  "schemaVersion": "libre-ai.notebook-backup.v2",
  "id": "<id>",
  "createdAt": "<createdAt>",
  "cipher": "aes-256-gcm",
  "kdf": {
    "algorithm": "argon2id",
    "version": 19,
    "memoryKiB": 65536,
    "iterations": 3,
    "parallelism": 1,
    "outputLengthBytes": 32,
    "salt": "<Base64 canonique>"
  },
  "nonce": "<Base64 canonique>"
}
```

Les nombres montrés pour `m`, `t` et `p` sont remplacés par les valeurs validées de la requête. Les AAD sont exactement :

```text
UTF8("libre-ai.notebook-backup.v2/aad") || 0x00 || JCS(metadata)
```

Le golden vector fournit le JSON JCS et l'hexadécimal complets. `id`, `createdAt`, tous les paramètres KDF, le sel et le nonce sont donc authentifiés. Le plaintext, le ciphertext, le tag et le digest ne figurent pas dans les AAD ; GCM authentifie nativement le ciphertext, le tag et leurs longueurs.

## 5. AES-256-GCM et enveloppe

Le chiffrement est exclusivement AES-256-GCM avec : clé de 32 octets issue d'Argon2id, nonce de 12 octets, AAD ci-dessus et tag de 128 bits. Le champ binaire chiffré est `C || T`, sans nonce ni tag préfixé. Réutiliser un couple `(clé, nonce)` est interdit.

Le host DOIT produire, par CSPRNG, un nouveau sel de 16 octets et un nouveau nonce de 12 octets pour chaque scellement. Les deux sont des entrées explicites parce que le composant WASM n'importe aucun aléa. Les valeurs du golden vector sont publiques, déterministes et interdites en production.

## 6. Digest exact

Le digest sert à l'identité/corruption de fichier ; il ne remplace jamais l'authentification GCM. Construire l'enveloppe avec tous ses champs sauf `digest`, puis calculer :

```text
SHA-256(
  UTF8("libre-ai.notebook-backup.v2/digest") || 0x00 ||
  JCS(envelope-without-digest)
)
```

`envelope-without-digest` contient donc `schemaVersion`, `id`, `createdAt`, `cipher`, l'objet `kdf`, `nonce` et le Base64 canonique de `ciphertext`. Le champ `digest` est **le seul champ exclu**. La sortie est 64 caractères hexadécimaux minuscules. L'enveloppe finale renvoyée par `seal-backup` est `JCS(envelope-with-digest)`.

À l'ouverture, le digest est recalculé mais une égalité de digest n'autorise rien : le succès requiert **à la fois** comparaison en temps constant du digest et vérification du tag GCM.

## 7. Ouverture sans oracle

`open-backup` suit cet ordre logique :

1. borner les octets d'entrée, décoder un JSON UTF-8 strict, refuser clés dupliquées/champs inconnus, valider la version, le schéma, le Base64 canonique et les longueurs ;
2. reconstruire les AAD et le préimage du digest à partir des valeurs validées ;
3. calculer le digest candidat sans prendre de décision d'authentification ;
4. dériver la clé avec Argon2id puis tenter AES-GCM dans tous les cas où l'enveloppe publique est structurellement valide ;
5. ne libérer le plaintext que si le tag **et** le digest sont valides ; sinon effacer tout plaintext transitoire et renvoyer l'unique erreur d'authentification.

Si le recovery secret fourni à l'ouverture est hors des bornes, le cœur DOIT exécuter le même chemin coûteux avec une valeur factice interne de 16 octets, forcer le résultat en échec et zéroïser cette valeur. Il NE DOIT PAS retourner avant Argon2id/AES-GCM ni accepter un plaintext qui s'authentifierait accidentellement avec la valeur factice.

Une implémentation NE DOIT PAS court-circuiter AES-GCM sur mismatch de digest. Les comparaisons de tag sont déléguées à une primitive auditée ; la comparaison du digest est en temps constant. Aucun message, log, métrique ou détail ne distingue mauvais secret, digest faux, tag faux, nonce/sel/ciphertext/AAD modifié.

| Code WIT fermé | Affichage host recommandé | Cas |
| --- | --- | --- |
| `invalid-document` | `Invalid context document.` | entrée de canonicalisation publique invalide |
| `invalid-seal-request` | `Invalid backup seal request.` | requête de scellement ou secret hors bornes |
| `invalid-envelope` | `Invalid backup envelope.` | structure, Base64, taille ou paramètres publics invalides |
| `unsupported-version` | `Unsupported backup version.` | version publique non supportée |
| `resource-limit-exceeded` | `Backup operation unavailable.` | allocation bornée impossible |
| `authentication-failed` | `Backup authentication failed.` | mauvais secret ou toute intégrité cryptographique invalide |
| `internal-failure` | `Backup operation failed.` | échec interne non classifiable |

Le WIT ne renvoie que l'enum `error-code`, jamais de message ni de détail libre. Le host peut associer localement les affichages statiques recommandés, sans y concaténer de diagnostic. Aucun identifiant, timestamp, secret, longueur privée, valeur de champ, chemin JSON, plaintext, ciphertext, clé, backtrace ou erreur de bibliothèque ne franchit la frontière. À l'ouverture, un `recovery-secret` hors bornes produit aussi `authentication-failed`.

## 8. Zéroïsation et capacités WASM

Le cœur DOIT zéroïser avant tout retour succès/erreur, autant que le modèle mémoire le permet : toutes ses copies du recovery secret, la clé de 32 octets, l'état clé AES, la mémoire de travail Argon2id et tout plaintext produit avant un échec global. Ces valeurs NE DOIVENT PAS être placées dans une globale, un cache, une chaîne de caractères, une erreur, un log, un dump, une télémétrie ou une enveloppe, ni être renvoyées. La clé n'est jamais persistée et n'existe que pendant un appel.

Le host reste responsable de ses propres buffers d'entrée/sortie et DOIT écraser ses `Uint8Array` sensibles après l'appel ; JavaScript et les copies de mémoire WASM empêchent toute promesse d'effacement physique absolu. La Gate S reconnaît cette limite sans prétendre la vérifier. La Gate R contrôle les effets réels sur les chemins succès, erreur, allocation et panic ainsi que le comportement des bibliothèques retenues.

`world.wit` ne déclare aucun `import`. Le composant construit DOIT avoir une liste d'imports vide : pas de WASI clocks, random, sockets, HTTP, filesystem, key/value, environment ou logging. `id`, `created-at`, sel et nonce proviennent uniquement de la requête. Le scan du composant final et le test sans WASI appartiennent à la Gate R.

## 9. Gate S — bootstrap solo

La Gate S est une auto-revue contradictoire, pas une revue indépendante. Elle est consignée dans [`SOLO-CHALLENGE.md`](SOLO-CHALLENGE.md) avec les outils croisés, les constats corrigés et les risques résiduels.

Elle autorise uniquement :

1. le merge de ce dossier comme proposition non canonique ;
2. le développement d'un moteur expérimental avec les seules données publiques de test ;
3. les benchmarks et tests nécessaires à une future revue externe.

Elle n'autorise ni promotion vers `contracts/`, ni statut `locked`, ni compatibilité publique, ni sauvegarde utilisateur, ni release. Toute modification normative impose de régénérer les vecteurs et de réexécuter le challenge.

## 10. Gate R — revue externe avant promotion et release

Quand le moteur et le host local existent, un cryptographe externe examine dans une même revue le protocole et le composant réellement livrable. Il complète [`INDEPENDENT-REVIEW.md`](INDEPENDENT-REVIEW.md) et vérifie notamment :

1. reproduction indépendante de la clé, des AAD, du ciphertext/tag, du digest, du golden et des mutations ;
2. exactitude du protocole, des bornes, de la migration et du modèle anti-oracle ;
3. conformité WIT/schémas/golden dans les runtimes Rust/WASM et navigateur ;
4. choix, versions, provenance et configuration des primitives ;
5. zéroïsation effective et absence de clé/plaintext dans persistance, logs, erreurs, télémétrie, globals et caches ;
6. liste d'imports WASM vide et exécution sans WASI ;
7. CSPRNG host, conversion du recovery secret et budgets mémoire/latence sur les cibles supportées.

La promotion canonique et la release restent bloquées jusqu'à approbation de la Gate R, puis des gates projet `rust-boundary-value-review` et `local-crypto-and-privacy-review`.
