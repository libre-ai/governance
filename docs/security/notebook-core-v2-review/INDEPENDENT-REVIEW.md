# Procès-verbal de revue cryptographique externe — Gates A/B

> **Statut initial : PENDING.** Ce document est un canevas, pas une approbation. La Gate S solo ne remplace aucune revue. Gate A exige quatre passes review-only séparées — architecture, sécurité, cryptographie et vie privée — puis un jalon humain ; Gate B examine ensuite le composant et le host réels.

## Portée de la décision

La Gate A examine le protocole, les schémas et les vecteurs catalogués selon `docs/reviews/AGENT-REVIEW-PROTOCOL.md` ; quatre verdicts `APPROVE` et un jalon humain `accept` autorisent seulement la promotion `candidate → locked` et le début de l’implémentation. La Gate B examine ensuite le composant réellement livrable ; elle est nécessaire, mais non suffisante, avant release.

## Candidats immuables

À compléter par le reviewer :

- commit Git du protocole, SHA complet : `<required>` ;
- arbre Git du dossier protocole : `<required>` ;
- Gate A — commit moteur/host : `not-yet-implemented` ;
- Gate A — digest composant WASM : `not-yet-implemented` ;
- Gate B — commit Git du moteur/host qualifié, SHA complet : `<required-before-gate-b>` ;
- Gate B — digest du composant WASM construit : `<required-before-gate-b>` ;
- dépôt : `https://github.com/libre-ai/libre-ai` ;
- date UTC de revue : `<required>` ;
- référence professionnelle publique ou interne du reviewer : `<required>`.

Le reviewer travaille sur des commits propres et consigne les commandes de liaison :

```bash
git rev-parse HEAD
git rev-parse HEAD:docs/security/notebook-core-v2-review
git status --short
```

## Indépendance

Pour chaque rôle :

- [ ] le reviewer opère dans une passe fraîche, review-only, et n'a pas rédigé les artefacts examinés pendant cette passe ;
- [ ] il ne s'auto-approuve pas, ne rend qu'un seul rôle et déclare les conflits d'intérêts éventuels ;
- [ ] ses preuves n'utilisent que le matériel public de test, sans donnée personnelle ni clé réelle ;
- [ ] le reviewer cryptographie utilise une chaîne de reproduction indépendante des implémentations Gate S.

## Reproduction indépendante du protocole

Documenter implémentations, versions, commandes et sorties. Au moins une chaîne doit être indépendante de pyca/cryptography, OpenSSL EVP_KDF et Node Web Crypto.

- implémentation Argon2id : `<required>` ;
- implémentation AES-256-GCM : `<required>` ;
- implémentation RFC 8785/JCS : `<required>` ;
- implémentation SHA-256/Base64 : `<required>` ;
- environnement et versions : `<required>` ;
- référence vers les preuves non sensibles : `<required>`.

Résultats :

- [ ] clé dérivée `e6b35d4e67ec1f04cf571aa3cc441746dadec01406cd82a88ec4ea5708183e1c` ;
- [ ] AAD de 339 octets identiques au golden ;
- [ ] ciphertext/tag, digest et enveloppe identiques ;
- [ ] ouverture positive restituant les 45 octets attendus ;
- [ ] mauvais secret, secrets de 15/1025 octets, nonce, sel, ciphertext, AAD et digest seul modifiés retournent uniquement `authentication-failed` ;
- [ ] paramètres faibles retournent uniquement `invalid-envelope` sans Argon2id et version publique inconnue retourne `unsupported-version` ;
- [ ] golden Context v2, dix refus adversariaux et vecteurs Unicode sont reproduits ;
- [ ] aucun plaintext n'est libéré par un cas négatif.

## Analyse du protocole

- [ ] les IDs backup/contexte encodent exactement 128 bits CSPRNG et restent opaques ; aucun `createdAt` ne fuit dans les artefacts clairs ;
- [ ] AAD/digest, séparation de domaine, Base64 et JCS sont non ambigus ;
- [ ] AES-256-GCM, nonce 12 octets, tag 16 octets et `C || T` sont corrects ;
- [ ] Argon2id v19, `P/S/K/X`, bornes et sortie directe de 32 octets sont corrects ;
- [ ] limites 16 MiB plaintext/contenus Context, 16 777 232 octets ciphertext et 22 370 044 octets enveloppe/entrée Context, ainsi que parsing hostile, sont bornés ;
- [ ] tri Context par identifiant, graphe/exclusions, JCS imbriqué, `totalBytes` et digest recalculé sont non ambigus ;
- [ ] `libre-ai.recovery-secret-code.v1` fixe 16 octets CSPRNG ↔ 32 hexadécimaux et `libre-ai.recovery-secret-text.v1` fixe NFC/UTF-8/BOM/trim/casse/fins de ligne ; leurs vecteurs sont exacts ;
- [ ] digest recalculable ne peut jamais remplacer ni court-circuiter GCM ;
- [ ] ordre d'ouverture, secret factice et enum d'erreur fermé ne créent pas d'oracle exploitable ;
- [ ] migration v2 et absence de lecteur v1 heuristique sont justifiées.

## Gate B — conformité du moteur et du host

- [ ] versions, provenance, licences et configuration des primitives sont approuvées ;
- [ ] chaque succès et mutation passe dans les runtimes Rust/WASM et navigateur ;
- [ ] secret, clé, état AES, mémoire Argon2id et plaintexts d'échec sont zéroïsés autant que vérifiable ;
- [ ] aucune clé/donnée privée n'entre dans persistance, logs, erreurs, métriques, globals ou caches ;
- [ ] l'interface WIT autonome `api` ne crée aucun import de types ; module et composant WASM ont chacun une liste d'imports vide et le composant s'exécute sans WASI ;
- [ ] id, sel et nonce proviennent seulement du host local ; tout horodatage produit reste dans le plaintext ;
- [ ] CSPRNG, unicité id/sel/nonce et profil textuel stable du recovery secret sont testés ;
- [ ] aucun réseau ni stockage distant ne reçoit contenu, index, secret ou clé ;
- [ ] mauvais secret et altérations cryptographiques restent observables sous le même code fermé.

## Performance et ressources

Documenter les résultats réels :

- navigateurs/versions et classes d'appareil : `<required>` ;
- pic mémoire et latence pour `m=65536, t=3, p=1` : `<required>` ;
- scellement/ouverture au plaintext maximal ou limite révisée : `<required>` ;
- comportement en mémoire insuffisante : `<required>` ;
- absence de fallback KDF : `<required>` ;
- analyse des écarts de temps entre erreurs cryptographiques comparables : `<required>`.

## Constats

Tout constat `blocking` ou `major` ouvert interdit l'approbation.

| ID | Sévérité | Constat et preuve | Correction | Statut |
| --- | --- | --- | --- | --- |
| `<required-if-any>` | `<required-if-any>` | `<required-if-any>` | `<required-if-any>` | `<required-if-any>` |

## Décisions Gate A par rôle

Chaque passe produit exactement `APPROVE` ou `REJECT`, avec rapport et SHA-256 :

| Rôle | Rapport immuable | Verdict | Constats major/blocking ouverts |
| --- | --- | --- | --- |
| architecture | `<required>` | `<APPROVE-or-REJECT>` | `<required>` |
| sécurité | `<required>` | `<APPROVE-or-REJECT>` | `<required>` |
| cryptographie | `<required>` | `<APPROVE-or-REJECT>` | `<required>` |
| vie privée France/UE | `<required>` | `<APPROVE-or-REJECT>` | `<required>` |

Jalon humain après quatre `APPROVE` : `<accept|continue|hold|reject>` ; référence attribuable : `<required>`.

## Décision Gate B

Cocher exactement une décision sur le composant et le host immuables :

- [ ] **APPROVED** — aucun constat bloquant/majeur ouvert ; éligible aux autres gates de release ;
- [ ] **APPROVED WITH MINOR RESERVATIONS** — réserves non normatives listées et échéancées ;
- [ ] **REJECTED** — sauvegarde utilisateur et release interdites.

Justification et référence attribuable : `<required>`.

Toute modification normative du protocole invalide les verdicts Gate A affectés ; toute modification du composant examiné après Gate B impose une nouvelle Gate B.
