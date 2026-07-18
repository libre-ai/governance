# Revues séparées par rôle — Notebook Core v2

Statut : **locked / Gate A approuvée / six passes Gate B rejetées / release bloquée**.

La promotion exige quatre verdicts issus de passes review-only distinctes par rôle : architecture,
sécurité, cryptographie et vie privée, selon
[`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). Le dossier technique normatif est
`contracts/wit/notebook-core-v2/SEMANTICS.md` ; les vecteurs publics sont
`contracts/fixtures/notebook-core-v2/golden-vectors.v1.json`. Les passes rejetées sur des commits
antérieurs restent archivées sous [`gate-a/`](gate-a/) et ne valent jamais pour un commit corrigé.
Le propriétaire a consigné la décision `continue`; le moteur expérimental Notebook est autorisé après Gate A. Les six passes Gate B immuables sont indexées sous [`gate-b/`](gate-b/) : moteur Rust/WASM, host trois navigateurs, fermeture/effacement logique, récupération worker, fautes internes et matrice runtime. La dernière passe [`gate-b/5190972`](gate-b/5190972/) ferme les dépassements Firefox/WebKit et passe les budgets p95/RSS sur la classe haute mémoire de référence, mais conserve le verdict global **REJECT**.

Depuis cette dernière passe, la PR #95 a intégré un host produit exact désactivé par défaut et la PR #97 a observé `SIGKILL`/`SIGABRT`, redémarrage et nettoyage sur Chromium, Firefox et WebKit. Ces passes de candidate-integration ne sont pas de nouvelles passes Gate B et ne reçoivent aucun crédit pour l'OOM réel du processus, l'épuisement physique du quota, l'effacement physique, les classes 8 Gio/16–24 Gio ou les revues spécialisées. Aucune sauvegarde utilisateur ou release n'est autorisée.

La passe cryptographie a reproduit Argon2id, AAD, AES-256-GCM, tag et digest avec une seconde
implémentation, puis confirmé la borne candidate de 16 MiB, les limites navigateur et l’ordre
anti-oracle. Elle vérifie aussi que l'interface WIT autonome `api` n'introduit aucun import de types.
La passe vie privée a confirmé le local-only, l’absence de réseau/log, les identifiants CSPRNG
export-scoped, l'absence de timestamp/révision/exclusion claire et l'unique recovery code normatif.
L’artefact WASM et son composant transpillé ont des imports vides ; les copies ABI, buffers host et instances jetables après fautes injectées sont exercés dans trois navigateurs. Panic/OOM Rust, premier alloc serde, réservations JCS/Argon et matrice p50/p95/RSS sont mesurés pour le harness sur une classe arm64 de référence. Le host produit désactivé et ses chemins crash/kill/restart existent désormais, mais l'OOM réel du processus navigateur, le quota réellement épuisé, l'effacement physique, les classes contraintes et les revues spécialisées restent à fermer.
