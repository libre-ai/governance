# Revues séparées par rôle — Notebook Core v2

Statut : **locked / Gate A approuvée / première passe Gate B rejetée / release bloquée**.

La promotion exige quatre verdicts issus de passes review-only distinctes par rôle : architecture,
sécurité, cryptographie et vie privée, selon
[`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). Le dossier technique normatif est
`contracts/wit/notebook-core-v2/SEMANTICS.md` ; les vecteurs publics sont
`contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`. Les passes rejetées sur des commits
antérieurs restent archivées sous [`gate-a/`](gate-a/) et ne valent jamais pour un commit corrigé.
Le propriétaire a consigné la décision `continue`; le moteur expérimental Notebook est autorisé après Gate A. La première passe [`gate-b/5395e45`](gate-b/5395e45/) confirme le moteur Rust/WASM mais rejette Gate B faute de host/navigateur et de preuves OOM/panic. Aucune sauvegarde utilisateur ou release n'est autorisée.

La passe cryptographie a reproduit Argon2id, AAD, AES-256-GCM, tag et digest avec une seconde
implémentation, puis confirmé la borne candidate de 16 MiB, les limites navigateur et l’ordre
anti-oracle. Elle vérifie aussi que l'interface WIT autonome `api` n'introduit aucun import de types.
La passe vie privée a confirmé le local-only, l’absence de réseau/log, les identifiants CSPRNG
export-scoped, l'absence de timestamp/révision/exclusion claire et l'unique recovery code normatif.
L’artefact WASM expérimental `5395e45` a une liste d’imports module/composant vide. Le host réel, les copies ABI, les traps et la matrice navigateur restent à qualifier.
