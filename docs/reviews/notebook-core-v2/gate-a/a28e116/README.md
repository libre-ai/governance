# Cycle Gate A — `a28e116`

## Identité du cycle

- Commit Git immuable : `a28e116b0a3ebf278412650715e03f7050c0aac0`
- Arbre Git immuable : `cda41e7f9cc620a87ee0488caa06141614fb5b93`
- Dossier de passe : `docs/reviews/notebook-core-v2/gate-a/a28e116/`
- Référence owner-control : `https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998576948`
- Référence d’intégrité : `contracts/catalog.v1.json` (source de vérité)

⚠️ L’en-tête historique `candidate` présent dans `SEMANTICS.md` est historique ; l’autorité normative de statut est uniquement `contracts/catalog.v1.json`.

## Passes role-separated (4)

| Rôle | reviewPassId | Verdict | URL du commentaire | SHA-256 du rapport |
| --- | --- | --- | --- | --- |
| architecture | `notebook-core-v2-a28e116-architecture` | `APPROVE` | `https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998564391` | `bea5bb969119014d24e797bd51b4f8ccdf832c2a58977bad871d7beb5989abfa` |
| sécurité | `notebook-core-v2-a28e116-security` | `APPROVE` | `https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998564393` | `87610b711d515f3ccbc39aac16217b86610ee4eae98b62d19821fcf03b881a69` |
| cryptographie | `notebook-core-v2-a28e116-cryptography` | `APPROVE` | `https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998564385` | `591a909f728d6085ba2b70465fc05ff0449993cbf9d6f95c6ce11161f68c9dea` |
| vie privée | `notebook-core-v2-a28e116-privacy` | `APPROVE` | `https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998564380` | `d3e690fdd357e27c31b1afc21e6e591103b2b8733f436b359c9b58d053c7e995` |

### Passe d’intégration (non Gate A/B)

| Élément | Valeur |
| --- | --- |
| reviewPassId | `notebook-core-v2-a28e116-promotion-integration` |
| mode | `promotion-integration` |
| intégrateur | `openai-codex/gpt-5.3-codex-spark` |
| session | `f9f195bf-4492-4d64-bb98-b4c08b0a2084` |
| base | `7ad0695b563745d2c6223f4d2cdcafc9fd9e3d0a` |
| synthèse | `https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998566929` |

## Empreintes SHA-256 des autorités (source canonique)

| Fichier | SHA-256 |
| --- | --- |
| `contracts/wit/notebook-core-v2/world.wit` | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| `contracts/schemas/context-document.v2.schema.json` | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |

## Gate A / Gate B

- Gate A : **approuvée**.
- Gate B : **pending / en attente**.
- Le moteur expérimental est autorisé après cette promotion ; Gate B reste obligatoire avant toute sauvegarde utilisateur et toute release.

## Synthèse

La preuve machine de ce cycle et la synthèse globale sont consolidées dans
- `docs/security/notebook-core-v2-review/INDEPENDENT-REVIEW.md`
- `https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998566929`
