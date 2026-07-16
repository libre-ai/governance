# Rapport de revue — rôle ARCHITECTURE

- **Rôle** : architecture uniquement, hors cryptographie et hors vie privée
- **Commit exact revu** : `9b1b994301ac82fbdb781a32a33bdd080eb865a3`
- **Propreté Git vérifiée** : `git status --short` → sortie vide
- **Arbre dossier de revue** : `git rev-parse HEAD:docs/security/notebook-core-v2-review` → `46f9b346382ada23865c7333e98b50647a9a5bca`

## Empreintes SHA-256

| Artefact | SHA-256 |
|---|---|
| `contracts/wit/notebook-core-v2/world.wit` | `72aef100a93606f95ac9cd6f9551186470252acaa9161cbc6885e1296cad6171` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `b2ab094f6392d09d2331f145dfc0f2d85093d7439c2422147d34111c4284bde1` |
| `contracts/schemas/context-document.v2.schema.json` | `f14de256079228b075d38977321c0fb29b97bf872de78b2d03d7de00ea2e9dc9` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `d6b38a443249f7029dcd47eddd32a44d1b82025782a7df5e9bebeedfa79c8f96` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `d194c15523a51ee64a11fc09f07dfbd15e6e64d907e000b928d7b8e4d64a23d8` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `d0cb031d1bdfd888bed8cc2b88899197f03ea169612c3106970043450a3a04ee` |
| `docs/security/notebook-core-v2-review/world.wit` | `72aef100a93606f95ac9cd6f9551186470252acaa9161cbc6885e1296cad6171` |
| `docs/security/notebook-core-v2-review/notebook-backup-seal-request.v2.schema.json` | `d6b38a443249f7029dcd47eddd32a44d1b82025782a7df5e9bebeedfa79c8f96` |
| `docs/security/notebook-core-v2-review/notebook-backup.v2.schema.json` | `d194c15523a51ee64a11fc09f07dfbd15e6e64d907e000b928d7b8e4d64a23d8` |
| `docs/security/notebook-core-v2-review/notebook-core-v2.golden.json` | `aed372b5a2b9e14d483af85e290dbe998b26093aceef417af4dc405591dd4b66` |

## Commandes / preuves exécutées

```bash
git rev-parse HEAD
git status --short
git rev-parse HEAD:docs/security/notebook-core-v2-review

bun run check:contracts
# OK ; inclut "Notebook vectors structurally verified: 7 mutations"

bun run check:notebook-core-v2-candidate
# OK ; inclut "Notebook Core v2 Gate S verified ... 6 mutations"

cargo test -p libre-ai-ecosystem-engine --test wit_contracts
# OK ; wit_parser résout les 9 mondes

diff -u contracts/fixtures/notebook-core-v2/golden-vectors.v1.json \
        docs/security/notebook-core-v2-review/notebook-core-v2.golden.json
# Diff réel : la copie du dossier de revue omet la mutation unsupported-version
```

## Constats

### Blocking
- **Aucun constat blocking.**

### Major
1. **Split-brain entre l’autorité cataloguée, le dossier de revue et les checks.**
   `SEMANTICS.md` exige encore “les six mutations” (`contracts/wit/notebook-core-v2/SEMANTICS.md:186`), le check candidat valide explicitement 6 mutations et ne vérifie pas l’identité de la copie golden (`tools/quality/check-notebook-core-v2-candidate.ts:249-260,444-451`), alors que le golden canonique sous `contracts/fixtures/...` en contient 7 avec `unsupported-version` (`contracts/fixtures/notebook-core-v2/golden-vectors.v1.json:275-301`) et le check contractuel l’exige (`tools/quality/check-notebook-v2-vectors.ts:125-126`). La copie `docs/security/notebook-core-v2-review/notebook-core-v2.golden.json` s’arrête à 6 mutations (`...:251-280`).
   **Impact architecture** : un reviewer Gate A peut lier sa preuve à un jeu de vecteurs différent de l’autorité canonique ; la surface normative n’est pas unique ni durable.

2. **`canonicalize-context` n’est pas suffisamment verrouillé pour garantir une implémentation non ambiguë.**
   La règle normative dit que “les racines, blocs, liens et exclusions sont triés par octets UTF-8 croissants” (`contracts/wit/notebook-core-v2/SEMANTICS.md:21-31`) sans définir explicitement le comparateur de `blocks[]` (objet : tri par `id`, par JCS complet, autre). Or l’ordre du tableau change les octets JCS et donc le digest. En plus, je n’ai trouvé aucun golden/mutation dédié couvrant `canonicalize-context` ; le dépôt n’expose qu’un fixture de schéma trivial pour `context-document.v2` (`contracts/fixtures/schema-fixtures.v1.json:1173-1198`).
   **Impact architecture** : deux implémentations peuvent rester “conformes” au schéma tout en divergeant sur la canonicalisation, `totalBytes` et le digest ; la frontière WIT exacte n’est donc pas assez déterministe.

### Minor
- **Aucun constat minor.**

## Risques résiduels

- Même après correction des points ci-dessus, la **Gate B** reste indispensable pour vérifier l’absence d’imports WASM réels, les responsabilités host (`id`, `created-at`, sel, nonce, conversion du secret), et les comportements d’intégration/runtime.
- Ce rapport ne vaut **ni avis cryptographique**, ni **avis vie privée**.

## Verdict

**REJECT**

Ce verdict vaut **uniquement** pour le rôle **architecture** ; il ne vaut **ni verrouillage**, **ni Gate B**, **ni release**.
