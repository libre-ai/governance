# Gate B — Notebook Core v2

La Gate B qualifie le composant et son host réels avant toute donnée utilisateur ou release. Un rejet
historique ne bloque pas le développement expérimental autorisé par Gate A, mais interdit toute
promotion d'usage tant que ses constats ne sont pas fermés par une nouvelle passe sur commit immuable.

| Commit moteur | Passe | Verdict | Résumé |
|---|---|---|---|
| [`5395e45`](5395e45/) | `notebook-core-v2-gate-b-cryptography-runtime-5395e45-01` | **REJECT** | moteur Rust/WASM conforme et sans import ; host/navigateur, OOM/panic et matrice performance absents |
| [`d0f643b`](d0f643b/) | `notebook-core-v2-gate-b-cryptography-runtime-d0f643b-02` | **REJECT** | host de qualification vert sur Chromium/Firefox/WebKit ; host produit, OOM/panic et p95/appareils absents |
| [`7df396b`](7df396b/) | `notebook-core-v2-gate-b-cryptography-runtime-7df396b-03` | **REJECT** | mapping hostile et références d'effacement remédiés ; trois blocages de release inchangés |
| [`e9970b3`](e9970b3/) | `notebook-core-v2-gate-b-cryptography-runtime-e9970b3-04` | **REJECT** | worker jetable qualifié après trap/plafond/hang ABI ; OOM/panic internes, host produit et p95 absents |
| [`593e99f`](593e99f/) | `notebook-core-v2-gate-b-cryptography-runtime-593e99f-05` | **REJECT** | archives vérifiées, panic/OOM et frontières serde/JCS/Argon injectés ; quatre budgets Firefox/WebKit échouent, classes contraintes et host produit absents |
| [`5190972`](5190972/) | `notebook-core-v2-gate-b-cryptography-runtime-5190972-06` | **REJECT** | budgets p95/RSS passés dans les trois moteurs sur la classe desktop de référence ; classes contraintes, host produit, OOM processus et effacement physique absents |
| [`bdee4d9`](bdee4d9/) | `notebook-product-host-faults-candidate-integration-bdee4d9-01` | **APPROVE intégration limitée** | host produit exact repris après `SIGKILL`/`SIGABRT` dans les trois moteurs ; quota physique, OOM réel, rôles spécialisés et classes contraintes absents |
| [`96934a8`](96934a8/) | cinq passes spécialisées sur le host exact | **REJECT global** | `ENOSPC` APFS fermé sur trois moteurs ; architecture, sécurité, crypto et privacy approuvées ; performance/classes rejetée faute d'OOM processus et de machines physiques 8/16–24 Gio |
