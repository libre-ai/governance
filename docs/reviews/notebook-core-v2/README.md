# Revue agentique indépendante — Notebook Core v2

Statut : **candidate / NO-GO implémentation crypto produit**.

La promotion exige quatre verdicts distincts issus d’agents review-only dont l’identité et la session
diffèrent de celles de l’agent auteur : architecture, sécurité, cryptographie et vie privée, selon
[`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). Le dossier technique normatif est
`contracts/wit/notebook-core-v2/SEMANTICS.md` ; les vecteurs publics sont
`contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`. Les passes rejetées sur des commits
antérieurs restent archivées sous [`gate-a/`](gate-a/) et ne valent jamais pour un commit corrigé.
Une CI verte ou une décision de merge du propriétaire ne remplace aucun verdict technique.

La passe cryptographie doit reproduire Argon2id, AAD, AES-256-GCM, tag et digest avec une seconde
implémentation, puis confirmer la borne candidate de 16 MiB, les limites navigateur et l’ordre
anti-oracle. Elle vérifie aussi que l'interface WIT autonome `api` n'introduit aucun import de types.
La passe vie privée confirme le local-only, l’absence de réseau/log, les identifiants CSPRNG
export-scoped, l'absence de timestamp/révision/exclusion claire et l'unique recovery code normatif.
L’artefact WASM final devra avoir une liste d’imports vide.
