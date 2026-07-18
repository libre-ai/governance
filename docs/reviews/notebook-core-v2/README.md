# Revues séparées par rôle — Notebook Core v2

Statut : **locked / Gate A approuvée / Gate B REJECT / release bloquée**.

La promotion exige quatre verdicts issus de passes review-only distinctes par rôle : architecture,
sécurité, cryptographie et vie privée, selon
[`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). Le dossier technique normatif est
`contracts/wit/notebook-core-v2/SEMANTICS.md` ; les vecteurs publics sont
`contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`. Les passes rejetées sur des commits
antérieurs restent archivées sous [`gate-a/`](gate-a/) et ne valent jamais pour un commit corrigé.
Le propriétaire a consigné la décision `continue`; le moteur expérimental Notebook est autorisé après Gate A. Les passes historiques qualifient successivement moteur, host, fautes WASM/Rust et matrice p95/RSS. [`gate-b/5190972`](gate-b/5190972/) passe les budgets sur la classe physique 32+ Gio de référence et [`gate-b/bdee4d9`](gate-b/bdee4d9/) archive les fautes du host produit exact.

La passe [`gate-b/96934a8`](gate-b/96934a8/) est basée sur la gouvernance réconciliée de l'ADR-0005. Elle ferme un vrai `ENOSPC` APFS sur Chromium, Firefox et WebKit et produit cinq revues spécialisées : architecture, sécurité, cryptographie runtime et vie privée approuvent leur périmètre ; performance/classes rejette faute d'OOM processus attribuable et de machines physiques 8/16–24 Gio. Aucune sauvegarde utilisateur ou release n'est autorisée.

La passe [`gate-b/bfc9e4c`](gate-b/bfc9e4c/) applique la décision propriétaire ADR-0006 : la classe physique 32+ Gio devient la seule classe requise, tandis que 8/16–24 Gio restent des contributions facultatives et non supportées. Une matrice fraîche sur le candidat exact passe tous les budgets dans les trois moteurs. Les quatre rôles architecture, sécurité, cryptographie et vie privée approuvent ; performance rejette encore faute d'OOM processus attribuable sur les trois moteurs.

La passe cryptographie a reproduit Argon2id, AAD, AES-256-GCM, tag et digest avec une seconde
implémentation, puis confirmé la borne candidate de 16 MiB, les limites navigateur et l’ordre
anti-oracle. Elle vérifie aussi que l'interface WIT autonome `api` n'introduit aucun import de types.
La passe vie privée a confirmé le local-only, l’absence de réseau/log, les identifiants CSPRNG
export-scoped, l'absence de timestamp/révision/exclusion claire et l'unique recovery code normatif.
L’artefact WASM et son composant transpillé ont des imports vides ; les copies ABI, buffers host et instances jetables après fautes injectées sont exercés dans trois navigateurs. Panic/OOM Rust, premier alloc serde, réservations JCS/Argon et matrice p50/p95/RSS sont mesurés sur une classe arm64 de référence. Le host produit exact est désactivé par défaut et reprend après crash, kill et `ENOSPC`. L'OOM du processus navigateur et l'effacement physique non revendicable restent ouverts ; les classes physiques 8/16–24 Gio sont suivies uniquement pour une extension future du support.
