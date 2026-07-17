# Historique Gate A — Notebook Core v2

Chaque sous-dossier est lié à un commit immuable et conserve des passes review-only séparées. Un
verdict ne s'applique jamais à un autre commit.

| Commit | Architecture | Sécurité | Cryptographie | Vie privée | Effet |
| --- | --- | --- | --- | --- | --- |
| [`9b1b994`](9b1b994/) | `REJECT` | `REJECT` | `APPROVE` | `REJECT` | corrections normatives requises ; aucune implémentation |
| [`be17f27`](be17f27/) | `REJECT` | `APPROVE` | `APPROVE` | `REJECT` | contexte/recovery encore à minimiser et borner |
| [`a28e116`](a28e116/) | `APPROVE` | `APPROVE` | `APPROVE` | `APPROVE` | autorités Notebook v2 verrouillées ; moteur expérimental autorisé en attente de Gate B |

Un nouveau cycle Gate A complet n’est requis qu’après changement normatif. Le propriétaire ne peut autoriser
le merge qu'après quatre `APPROVE` agentiques sur le même commit et les mêmes empreintes ; cette
autorisation ne remplace aucun verdict technique.
