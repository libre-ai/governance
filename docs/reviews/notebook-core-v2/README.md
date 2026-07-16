# Revue par rôles — Notebook Core v2

Statut : **candidate intégrable / NO-GO implémentation crypto produit**.

L’intégration du candidat suit la revue agent générique et le jalon humain de continuation. La
promotion exige ensuite quatre verdicts distincts issus de passes agent review-only : architecture,
sécurité, cryptographie et vie privée, puis un jalon humain de verrouillage selon
`docs/reviews/AGENT-REVIEW-PROTOCOL.md`. Le dossier technique normatif est
`contracts/wit/notebook-core-v2/SEMANTICS.md` ; les vecteurs publics sont
`contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`.

La passe cryptographie doit reproduire Argon2id, AAD, AES-256-GCM, tag et digest avec une seconde
implémentation, puis confirmer la borne candidate de 16 MiB, les limites navigateur et l’ordre
anti-oracle. Elle vérifie aussi que l'interface WIT autonome `api` n'introduit aucun import de types. La passe vie privée
confirme le local-only, l’absence de réseau/log et la portée des métadonnées `id`/`createdAt`.
L’artefact WASM final devra avoir une liste d’imports vide.
