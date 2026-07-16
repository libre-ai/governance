# Gate S — challenge contradictoire en bootstrap solo

**Décision : `accepted-for-candidate-drafting-only`**

**Portée :** conservation du dossier et préparation machine-checkable du candidat uniquement.

**N'autorise pas :** moteur expérimental, implémentation Rust/WASM, statut `locked`, sauvegarde utilisateur, release ou affirmation de revue indépendante.

## Pourquoi cette gate existe

Le dépôt est actuellement maintenu par une seule personne. Les équipes GitHub `security` et `architecture` mentionnées par `CODEOWNERS` n'existent pas encore. Bloquer toute expérimentation sur une approbation interne « indépendante » serait impossible ; simuler cette indépendance serait trompeur.

La Gate S documente le challenge sans simuler l'indépendance. ADR-0003 sépare le cycle : une Gate A externe examine le protocole et les vecteurs avant toute implémentation ; une Gate B externe examine ensuite le composant construit avant release.

## Méthode exécutée

- lecture contradictoire du WIT, des schémas, de chaque préimage AAD/digest et de la migration ;
- validation Ajv 2020 du golden et des classifications de mutations ;
- dérivation Argon2id recoupée entre pyca/cryptography et OpenSSL EVP_KDF ;
- AES-256-GCM recoupé entre pyca/cryptography et Node Web Crypto ;
- ouverture positive et refus des cinq mutations cryptographiques ;
- refus des paramètres faibles avant Argon2id ;
- parsing/résolution WIT avec `wit-parser` ;
- CI complète `Bun quality` et `Rust quality` ;
- revue des axes sécurité, qualité, performance, complétude, souveraineté et données personnelles.

Ces recoupements réduisent le risque d'erreur de transcription. Ils ne constituent ni une preuve formelle ni une revue indépendante.

## Constats et traitement

| ID | Sévérité | Challenge | Traitement |
| --- | --- | --- | --- |
| S-01 | major | `contract-error.message` permettrait à une implémentation de faire franchir diagnostics, valeurs privées ou erreurs de bibliothèque malgré la table de messages statiques. | Supprimer le record et retourner uniquement l'enum fermé `error-code`. L'affichage devient une responsabilité host non normative. |
| S-02 | major | Une revue unique exigeant protocole et binaire créerait un verrou circulaire. | Gate A examine le protocole/vecteurs avant implémentation ; Gate B examine ensuite le binaire, sans auto-approbation. |
| S-03 | major résiduel | `m=65536, t=3, p=1` et la limite plaintext de 100 MiB ne sont pas qualifiés sur mobiles et peuvent provoquer latence ou pression mémoire. | Aucun fallback KDF. Benchmarks navigateurs/appareils et budgets explicites obligatoires en Gate B. |
| S-04 | major résiduel | La zéroïsation réelle des copies ABI, de la mémoire Argon2id et des erreurs/panics ne peut pas être prouvée par le contrat. | Choix de bibliothèques, instrumentation et inspection du composant exigés en Gate B. |
| S-05 | maîtrisé | Le digest est public et recalculable par un attaquant. | Il n'autorise rien, n'est jamais vérifié à la place du tag et ne peut court-circuiter Argon2id/AES-GCM. Les mutations recalculent le digest pour tester ce cas. |
| S-06 | major résiduel | Le cœur stateless ne peut pas garantir la fraîcheur du sel et du nonce fournis par le host. | CSPRNG host, nouveau sel/nonce par scellement et tests d'intégration navigateur obligatoires avant release. |
| S-07 | maîtrisé | `invalid-envelope` distingue les paramètres KDF publics invalides d'un échec cryptographique. | Accepté : aucune tentative cryptographique valide n'existe dans ce cas ; mauvais secret et toute altération cryptographique structurellement valide restent unifiés. |
| S-08 | major résiduel | Une UI textuelle peut transformer différemment un recovery secret Unicode entre création et restauration. | Le cœur traite des octets opaques ; la conversion UI stable et ses vecteurs Unicode doivent être fixés avant intégration. |

Aucun constat major corrigible au niveau du candidat ne reste ouvert après S-01/S-02. S-03, S-04, S-06 et S-08 nécessitent le host ou le moteur réel et bloquent la release via la Gate B.

## Contraintes de progression

Après Gate S :

- le dossier de proposition et le candidat catalogué peuvent être revus ;
- aucun moteur ne peut être développé avant Gate A ;
- toute modification normative régénère les vecteurs et réexécute ce challenge ;
- v1 reste inchangé et aucun producteur v2 n'est activé.

Avant toute implémentation :

- un cryptographe externe examine et reproduit le protocole/vecteurs (Gate A) ;

Avant toute sauvegarde utilisateur ou release :

- un cryptographe externe examine le composant réellement construit (Gate B) ;
- [`INDEPENDENT-REVIEW.md`](INDEPENDENT-REVIEW.md) reçoit des verdicts Gate A puis Gate B attribuables ;
- les constats résiduels ci-dessus sont fermés par preuves ;
- les gates projet sécurité, confidentialité locale et frontière Rust sont approuvées.
