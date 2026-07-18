# Gate B — revue ARCHITECTURE HOST — Notebook Core v2

## Attribution et indépendance

- `reviewPassId` : `notebook-core-v2-gate-b-architecture-host-96934a8-01`
- rôle : `architecture-host`
- mode : passe spécialisée `review-only`
- date : `2026-07-18`
- identifiants agent/session/provider/modèle : non exposés par le harness

La passe cible un commit immuable, n'a modifié aucun fichier et n'utilise les rapports historiques que comme contexte. Ce verdict ne vaut ni sécurité, ni cryptographie, ni vie privée, ni performance, ni décision Gate B globale.

## Cible et autorités

- commit : `96934a8e0698db6d35591f811856ff0824db3956`
- arbre : `f51a2c3a3ff85d0c66d7ef244922a37f1b43a9c5`
- base repository : `8ae8abf8302d30bec4bd6232eb2f7276d5e1fb83`
- worktree/index : propres avant et après la passe

| Autorité | SHA-256 |
|---|---|
| WIT v2 | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| sémantique | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| Context v2 | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| seal request v2 | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| backup v2 | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| golden | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |

## Portée examinée

- host SSR/hydraté, frontière serveur et CSP ;
- feature gate build/runtime, builds activé et désactivé, manifeste de livraison ;
- contrôleur sauvegarde/restauration, IndexedDB et reprise ;
- worker produit et protocole fermé ;
- E2E produit, campagne process/quota injecté et campagne APFS `ENOSPC` ;
- documentation et limites de support.

Empreintes source principales : contrôleur `5230868b…f201`, IndexedDB `68e57993…b8e`, operation host `d7476ae5…32a`, worker `2bb58ca3…eb1`, UI `31feedc1…7d6`, harness storage `665bd2dc…b14`.

## Analyse architecturale

1. **Activation fail-closed.** Le build normal ne livre ni WASM, ni bindings, ni worker, ni `sw.js`. Le serveur n'ouvre les routes WASM et la CSP `wasm-unsafe-eval` que si le build et le runtime portent exactement le gate `1`. Le manifeste généré lie le commit et les hashes livrables.
2. **Isolation par opération.** Chaque seal/open crée un Dedicated Worker, transfère les buffers possédés, instancie le composant sans import et termine le worker sur succès, refus, timeout, erreur de clone ou réponse hostile. Aucun worker ni instance n'est réutilisé.
3. **Persistance transactionnelle.** IndexedDB ne reçoit que l'enveloppe, le staging chiffré et un reçu minimal. Le commit de restauration supprime le staging et écrit le reçu dans une transaction stricte ; le démarrage nettoie les staging interrompus.
4. **Ordonnancement recovery corrigé.** Le recovery n'est publié qu'après persistance de l'enveloppe et déclenchement réussi du téléchargement. Les refus de persistance et de téléchargement sont couverts ; l'UI efface aussi le code de restauration après succès, refus ou fichier invalide.
5. **Fautes produit exactes.** Les campagnes relancent le même profil après `SIGKILL`, `SIGABRT` et `ENOSPC`. Le scénario APFS refuse le staging de 16 Mio avant tout worker, conserve l'état antérieur après relance puis démontre restauration et sauvegarde réussies après libération.
6. **Pas de Service Worker.** L'absence est cohérente avec Gate B : aucun ancien build activé ne peut être rejoué. L'offline complet reste un incrément séparé avec preuve de rollback de cache.
7. **Harness storage borné.** Image sparse APFS 6 Gio, réserve hôte 8 Gio, exécution séquentielle, verrou anti-concurrence, teardown global et conservation du verrou si un volume ne peut pas être détaché.
8. **Gouvernance explicite.** L'ADR-0005 accepté borne l'exception G2 aux chemins de qualification désactivés, interdit données/feature/release et maintient REJECT sans matériel. Le lot respecte exactement cette frontière.

## Preuves rejouées

- `bun run check` : 387/387 tests, TypeScript, Biome, contrats, source policy et licences verts ;
- build désactivé : aucun core/bindings/worker/Service Worker ;
- build Gate B deux fois : fichiers byte-identiques, manifeste SHA-256 `b4b2fedb…c01e` ;
- E2E produit : 7/7 ; core host/fautes : 6/6 ; fautes produit : 6/6 ; APFS : 3/3 ;
- Rust CI complet, imports nuls, SIMD128, plafond 512 Mio et build WASM reproductible ;
- REUSE : 694/694 ; Bun audit : aucune vulnérabilité.

## Findings

### Blocking

Aucun finding blocking dans l'architecture du host candidat.

### Major

Aucun finding major.

### Minor

Aucun finding minor.

## Risques résiduels et limites de verdict

- aucun mécanisme local sûr et commun aux trois moteurs n'a fourni un OOM processus attribuable moteur/OS ; `SIGKILL` et `SIGABRT` ne reçoivent aucun crédit OOM ;
- le modèle complet blocs/révisions, l'import atomique métier, la suppression et l'offline restent hors de ce host fixture-only ;
- l'image APFS prouve `ENOSPC`, pas une classe matérielle ;
- les classes physiques 8 Gio et 16–24 Gio restent sans preuve ;
- données utilisateur, activation, production et release restent interdites.

## Verdict du rôle

**VERDICT: approve**

Architecture du host exact approuvée dans la portée Gate B locale. Ce verdict ne change pas le **REJECT** Gate B global.
