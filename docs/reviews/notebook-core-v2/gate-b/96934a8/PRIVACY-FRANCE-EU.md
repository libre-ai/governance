# Gate B — revue VIE PRIVÉE FRANCE/UE — Notebook Core v2 / host produit

## Attribution et indépendance

- `reviewPassId` : `notebook-core-v2-gate-b-privacy-france-eu-96934a8-04`
- rôle : `privacy-france-eu`
- mode : passe spécialisée `review-only`
- date : `2026-07-18`
- identifiants agent/session/provider/modèle : non exposés par le harness

Passe distincte et sans écriture dans le dépôt. Le verdict porte uniquement sur la vie privée et la minimisation du host de qualification fixture-only ; il n'autorise aucun traitement utilisateur.

## Cible et portée

- commit : `96934a8e0698db6d35591f811856ff0824db3956`
- arbre : `f51a2c3a3ff85d0c66d7ef244922a37f1b43a9c5`
- worktree/index : propres
- autorités WIT/sémantique/schémas/golden : hashes Gate A inchangés

Portée examinée : données collectées, matières persistées, affichage recovery, logs/réseau, métadonnées d'enveloppe, fichiers téléchargés, preuves de qualification, APFS jetable, information utilisateur et limites d'effacement. L'analyse vise les principes de finalité, minimisation, privacy by design/default, sécurité et transparence ; elle ne constitue pas un avis juridique de mise en production.

## Cartographie des données du candidat

| Zone | Données admises | Exclusions vérifiées |
|---|---|---|
| fixture produit | JSON synthétique public `libre-ai.notebook-product-host-fixture.v1` | aucune note, sauvegarde ou PII utilisateur |
| worker/WASM | plaintext transitoire, recovery 16 octets, sel, nonce, enveloppe | aucun log, réseau, horloge, stockage ou environnement importé |
| IndexedDB | dernière enveloppe, staging d'enveloppe, reçu `{id,digest,schemaVersion,operationId}` | ni plaintext, ni recovery, ni clé, ni contenu de note |
| téléchargement | enveloppe chiffrée sous `notebook-backup.lai` | recovery absent du fichier et du nom |
| DOM | recovery affiché après succès, code de restauration pendant saisie | code saisi vidé après succès/refus/fichier invalide |
| serveur | état statique de feature et log hostname/port au démarrage | aucun body notebook, compte, session, télémétrie ou identifiant utilisateur |
| preuves | moteur/version, commit, hashes, signaux, quota/capacité génériques | aucun chemin personnel, e-mail, numéro de série, UUID, PID, token ou secret |

## Analyse France/UE

1. **Finalité fermée.** L'UI et la documentation indiquent explicitement que le host exerce uniquement une fixture publique Gate B et refuse toute donnée utilisateur avant décision.
2. **Local-only.** Aucun endpoint de contenu, synchronisation, analytics, beacon, WebSocket ou requête externe. Le fetch WASM reste same-origin ; les campagnes bloquent toute autre origine.
3. **Minimisation.** IDs CSPRNG opaques, absence de `createdAt`, révisions/exclusions retirées des formats clairs, reçu limité à l'identifiant/digest authentifiés. Les fichiers et preuves ne portent pas de nom corrélable.
4. **Recovery séparé.** Jamais persisté ni téléchargé ; affiché uniquement après réussite de persistance et déclenchement du téléchargement. L'UI recommande une conservation séparée et offre le masquage.
5. **Rétention et reprise.** Le staging chiffré interrompu est supprimé au démarrage. Sous `ENOSPC`, l'état antérieur est retrouvé après relance. Les volumes et fillers de qualification sont détachés/supprimés ; ils ne contiennent que fixtures publiques.
6. **Privacy by default.** Feature désactivée par défaut, build normal sans moteur, aucun Service Worker pouvant rejouer une activation antérieure, formulaires désactivés avant hydratation.
7. **Souveraineté.** Aucun nouveau service ni dépendance. Exécution et preuves locales ; aucun hyperscaler ni SaaS. Les binaires navigateurs/Node étaient déjà installés et vérifiés ; aucun téléchargement CDN n'a été effectué dans cette passe.
8. **Gouvernance.** L'ADR-0005 borne l'exception à la fixture publique et interdit explicitement données utilisateur, réseau/télémétrie, activation, production et release.
9. **Traçabilité proportionnée.** Commit, arbre, versions et hashes suffisent à attribuer les preuves sans identifiant matériel unique. REUSE et DCO sont vérifiés.

## Preuves

- E2E 7/7 : recovery absent du fichier/IndexedDB, aucun champ plaintext/recovery, mauvais code fermé, code saisi vidé ;
- no-JS : aucune soumission possible avant hydratation ;
- fautes produit 6/6 et APFS 3/3 sur fixtures publiques ;
- scans des rapports APFS et process : aucune PII ou secret ;
- aucune requête externe, console ou erreur page ;
- build désactivé sans assets Notebook ni cache applicatif ;
- REUSE 694/694, aucune nouvelle dépendance.

## Findings

### Blocking

Aucun finding blocking dans le périmètre fixture-only.

### Major

Aucun finding major.

### Minor

Aucun finding minor.

## Risques résiduels et conditions avant données réelles

- JavaScript, WASM et Rust ne prouvent pas l'effacement physique RAM/swap/copies moteur ;
- le recovery affiché peut être vu ou capturé localement jusqu'à son masquage ;
- taille de l'enveloppe, date système du fichier et présence du fichier restent des métadonnées locales ;
- une copie téléchargée quitte le contrôle de l'application et ne peut pas être révoquée ;
- suppression complète du futur workspace, clés, index et historique n'est pas implémentée par ce host ;
- modèle complet blocs/révisions, base légale/information réelle, droits, conservation et analyse de risques devront être validés avant toute donnée personnelle ;
- les classes 8/16–24 Gio et l'OOM ne sont pas des preuves vie privée, mais maintiennent l'interdiction d'activation.

## Verdict du rôle

**VERDICT: approve**

Le host fixture-only respecte la minimisation et le local-only dans la portée examinée. Toute donnée utilisateur, production ou release reste interdite par le **REJECT** Gate B global.
