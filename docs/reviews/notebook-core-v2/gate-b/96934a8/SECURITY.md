# Gate B — revue SÉCURITÉ — Notebook Core v2 / host produit

## Attribution et indépendance

- `reviewPassId` : `notebook-core-v2-gate-b-security-96934a8-02`
- rôle : `security`
- mode : passe spécialisée `review-only`
- date : `2026-07-18`
- identifiants agent/session/provider/modèle : non exposés par le harness

Passe distincte, sans écriture dans le dépôt, sur le commit immuable ci-dessous. Ce verdict est exclusivement sécurité ; il ne vaut aucun autre rôle ni décision de release.

## Cible, intégrité et portée

- commit : `96934a8e0698db6d35591f811856ff0824db3956`
- arbre : `f51a2c3a3ff85d0c66d7ef244922a37f1b43a9c5`
- worktree/index : propres avant/après
- manifeste produit Gate B : SHA-256 `b4b2fedbe5564c86e13ac6770ff644bdfc5cc16bc0a2f9a0543a639f6631c01e`
- core livré : `be423962e3a889e792a69a1ab60b978bcbf5ae1102db74a68c70a9a1c65e5942`
- worker livré : `19054f4913ffc438159bb2345b17487dae82d75e3e0ba17212610f61c3cbeb9a`
- bindings livrés : `ced45517e0efb2099fe641c1c9605731f95a8eb2a16836dbd2b2f58b3901b0d1`

Autorités Gate A inchangées : WIT `132d4cec…a295`, sémantique `5c17e87e…b45b`, Context `f205f1a2…96d4`, seal request `4beb3e88…e5a`, backup `e2932bbb…ad0`, golden `734eecef…e09`.

Portée : limites d'entrée, worker, protocole de messages, erreurs, CSP/réseau, stockage, téléchargement, recovery, zéroïsation best-effort, fautes processus et `ENOSPC`, artefacts de livraison. Hors portée : preuve d'effacement physique, sécurité d'un futur modèle complet de notebook et qualification matérielle.

## Modèle de menace vérifié

- entrée hostile jusqu'aux plafonds 16 Mio / 22 370 044 octets ; vues partielles, buffers partagés/détachés, objets à accesseurs hostiles ;
- messages worker malformés, IDs de requête substitués, champs inconnus et erreurs privées ;
- mauvais recovery, longueurs voisines, enveloppe/tag/digest/AAD modifiés ;
- worker bloqué, crash/kill du groupe navigateur, transaction interrompue et filesystem plein ;
- fuite par réseau, console, erreur, IndexedDB, nom de fichier, Service Worker, artefact interne ou recovery publié trop tôt.

## Constats de sécurité

1. **Frontières fermées.** Les tailles, ownership et schémas de messages sont revérifiés des deux côtés. Les réponses hostiles essuient leurs vues réfléchies avant erreur. Les codes traversant la frontière appartiennent à l'enum fermé ; les diagnostics privés deviennent des messages statiques.
2. **Cycle de vie défensif.** Le worker est terminé dans une fonction de clôture unique sur toute issue. Timeout borné à 30 s produit, handlers neutralisés, buffers transférés puis écrasés best-effort par le propriétaire restant.
3. **Secrets.** Recovery CSPRNG 16 octets, jamais dans IndexedDB, l'enveloppe, le nom de fichier, le serveur ou les preuves. Sa publication UI intervient seulement après persistance et téléchargement déclenché. Le code saisi pour restauration est vidé sur succès, refus et fichier invalide.
4. **Stockage.** Seuls enveloppe, staging et reçu minimal sont autorisés. Les transactions strictes refusées ne publient ni reçu ni staging partiel ; la relance nettoie les opérations interrompues.
5. **Réseau/CSP.** Le seul fetch worker est same-origin vers le core avec `no-store`. Les E2E bloquent toute origine externe. CSP ajoute uniquement `wasm-unsafe-eval` lorsque Gate B est réellement activé et n'ajoute pas `unsafe-eval` JavaScript.
6. **Shipping.** Le build refuse les noms fault/internal/trap, omet tous les assets Notebook lorsque désactivé et ne livre aucun Service Worker.
7. **Fautes.** `SIGKILL`/`SIGABRT` prouvent fermeture et reprise mais ne sont pas présentés comme OOM. La campagne APFS conserve un errno OS `ENOSPC`, refuse le staging avant worker et vérifie l'état exact après relance.
8. **Données de preuve.** Recherche locale négative pour chemin utilisateur, e-mail, numéro de série, UUID, token ou secret dans les trois rapports APFS. Fixtures publiques uniquement.
9. **Exception gouvernée.** L'ADR-0005 limite explicitement cette tranche aux preuves Gate B désactivées et interdit données utilisateur, télémétrie, activation et release.

## Preuves

- `bun run check` : 387 tests / 949 assertions, zéro échec ;
- `bun audit` : aucune vulnérabilité ; REUSE : 694/694 ;
- Clippy strict, tests Rust all-features, cargo-deny : verts ;
- E2E : 7/7, fautes produit : 6/6, APFS : 3/3, host/fautes core : 6/6 ;
- aucun external request, console ou `pageerror` dans les campagnes ;
- build WASM : SIMD128, zéro import module/composant, plafond 512 Mio ;
- build normal : aucun core/worker/bindings/sw.js ; builds Gate B reproductibles.

## Findings

### Blocking

Aucun finding blocking dans le code et les preuves examinés.

### Major

Aucun finding major.

### Minor

Aucun finding minor.

## Risques résiduels

- la chaîne JS/WASM peut seulement écraser les buffers qu'elle possède ; RAM physique, copies moteur, swap et OS ne sont pas prouvés effacés ;
- aucun OOM réel n'est attribuable de façon sûre et commune aux trois processus navigateur ;
- le recovery reste visible dans le DOM jusqu'à action de masquage/navigation ; c'est un choix utilisateur explicite, non une preuve d'effacement ;
- le téléchargement navigateur est prouvé déclenché, pas écrit durablement sur un média externe ;
- aucune donnée utilisateur ne doit entrer tant que Gate B reste rejetée.

## Verdict du rôle

**VERDICT: approve**

La sécurité du host fixture-only et de ses campagnes locales est approuvée. Les limites OOM, effacement physique et classes matérielles maintiennent le **REJECT** global.
