# Gate B — Notebook Core v2

La Gate B qualifie le composant et son host réels avant toute donnée utilisateur ou release. Un rejet
historique ne bloque pas le développement expérimental autorisé par Gate A, mais interdit toute
promotion d'usage tant que ses constats ne sont pas fermés par une nouvelle passe sur commit immuable.

| Commit moteur | Passe | Verdict | Résumé |
|---|---|---|---|
| [`5395e45`](5395e45/) | `notebook-core-v2-gate-b-cryptography-runtime-5395e45-01` | **REJECT** | moteur Rust/WASM conforme et sans import ; host/navigateur, OOM/panic et matrice performance absents |
| [`d0f643b`](d0f643b/) | `notebook-core-v2-gate-b-cryptography-runtime-d0f643b-02` | **REJECT** | host de qualification vert sur Chromium/Firefox/WebKit ; host produit, OOM/panic et p95/appareils absents |
| [`7df396b`](7df396b/) | `notebook-core-v2-gate-b-cryptography-runtime-7df396b-03` | **REJECT** | mapping hostile et références d'effacement remédiés ; trois blocages de release inchangés |
