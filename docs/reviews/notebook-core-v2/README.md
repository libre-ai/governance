# Revue indépendante — Notebook Core v2

Statut : **candidate / NO-GO implémentation crypto**.

La promotion exige quatre validations humaines distinctes de l’auteur et du futur implémenteur : architecture, sécurité, cryptographie et vie privée. Le dossier technique normatif est `contracts/wit/notebook-core-v2/SEMANTICS.md` ; les vecteurs publics sont `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`.

Le cryptographe doit reproduire Argon2id, AAD, AES-256-GCM, tag et digest avec une seconde implémentation, puis confirmer les limites navigateur et l’ordre anti-oracle. La revue vie privée confirme le local-only, l’absence de réseau/log et la portée des métadonnées `id`/`createdAt`. L’artefact WASM final devra avoir une liste d’imports vide.
