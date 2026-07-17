# Historique Gate A — Notebook Core v2

Chaque sous-dossier est lié à un commit immuable et conserve des passes review-only séparées. Un
verdict ne s'applique jamais à un autre commit.

| Commit | Architecture | Sécurité | Cryptographie | Vie privée | Effet |
| --- | --- | --- | --- | --- | --- |
| [`9b1b994`](9b1b994/) | `REJECT` | `REJECT` | `APPROVE` | `REJECT` | corrections normatives requises ; aucune implémentation |
| [`be17f27`](be17f27/) | `REJECT` | `APPROVE` | `APPROVE` | `REJECT` | contexte/recovery encore à minimiser et borner |

Un nouveau cycle complet sera ajouté après fusion des corrections. Le propriétaire ne peut autoriser
le merge qu'après quatre `APPROVE` agentiques sur le même commit et les mêmes empreintes ; cette
autorisation ne remplace aucun verdict technique.
