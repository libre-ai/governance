# Procès-verbal de revue cryptographique externe — Gates A/B

> **Statut initial : PENDING.** Ce document est un canevas, pas une approbation. La Gate S solo ne remplace aucune revue. Seul un cryptographe externe à la rédaction du candidat et au développement du moteur peut rendre les verdicts Gate A (protocole) puis Gate B (composant).

## Portée de la décision

La Gate A examine le protocole, les schémas et les vecteurs catalogués ; son approbation autorise seulement la promotion `candidate → locked` et le début de l’implémentation. La Gate B examine ensuite le composant réellement livrable ; elle est nécessaire, mais non suffisante, avant release.

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

- [ ] le reviewer n'a rédigé ni le candidat, ni ses golden vectors, ni le moteur principal ;
- [ ] il ne s'auto-approuve pas et déclare les conflits d'intérêts éventuels ;
- [ ] ses preuves n'utilisent que le secret public de test, sans donnée personnelle ni clé réelle ;
- [ ] sa chaîne de reproduction est indépendante des implémentations utilisées pendant la Gate S.

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
- [ ] AAD de 350 octets identiques au golden ;
- [ ] ciphertext/tag, digest et enveloppe identiques ;
- [ ] ouverture positive restituant les 45 octets attendus ;
- [ ] mauvais secret, nonce, sel, ciphertext et AAD modifiés retournent uniquement `authentication-failed` ;
- [ ] paramètres faibles retournent uniquement `invalid-envelope` sans Argon2id ;
- [ ] aucun plaintext n'est libéré par un cas négatif.

## Analyse du protocole

- [ ] `id` et `createdAt` sont explicites et authentifiés ;
- [ ] AAD/digest, séparation de domaine, Base64 et JCS sont non ambigus ;
- [ ] AES-256-GCM, nonce 12 octets, tag 16 octets et `C || T` sont corrects ;
- [ ] Argon2id v19, `P/S/K/X`, bornes et sortie directe de 32 octets sont corrects ;
- [ ] tailles plaintext/ciphertext/enveloppe et parsing hostile sont bornés ;
- [ ] digest recalculable ne peut jamais remplacer ni court-circuiter GCM ;
- [ ] ordre d'ouverture, secret factice et enum d'erreur fermé ne créent pas d'oracle exploitable ;
- [ ] migration v2 et absence de lecteur v1 heuristique sont justifiées.

## Gate B — conformité du moteur et du host

- [ ] versions, provenance, licences et configuration des primitives sont approuvées ;
- [ ] chaque succès et mutation passe dans les runtimes Rust/WASM et navigateur ;
- [ ] secret, clé, état AES, mémoire Argon2id et plaintexts d'échec sont zéroïsés autant que vérifiable ;
- [ ] aucune clé/donnée privée n'entre dans persistance, logs, erreurs, métriques, globals ou caches ;
- [ ] le composant WASM a une liste d'imports vide et s'exécute sans WASI ;
- [ ] id, temps, sel et nonce proviennent seulement du host local ;
- [ ] CSPRNG, unicité sel/nonce et conversion stable du recovery secret sont testés ;
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

## Décisions Gates A/B

Pour chaque gate, cocher exactement une décision et préciser `A` ou `B` dans la justification :

- [ ] **APPROVED** — aucun constat bloquant/majeur ouvert ; promotion canonique autorisée, sous réserve des autres gates de release ;
- [ ] **APPROVED WITH MINOR RESERVATIONS** — réserves non normatives listées et échéancées ;
- [ ] **REJECTED** — promotion et release interdites.

Justification : `<required>`.

Référence du commit attribuable contenant ce procès-verbal : `<required>`.

Toute modification normative du protocole après Gate A impose une nouvelle Gate A ; toute modification du composant examiné après Gate B impose une nouvelle Gate B.
