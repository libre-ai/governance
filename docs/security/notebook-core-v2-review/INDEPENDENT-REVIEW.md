# Procès-verbal de revue cryptographique indépendante — Gate A

> **Statut initial : PENDING.** Ce document est un canevas, pas une approbation. Seul un reviewer indépendant peut changer la décision. Une décision sans commit candidat immuable, preuves reproductibles et traitement des constats est invalide.

## Portée de la décision

La Gate A porte exclusivement sur le protocole et autorise, si elle est approuvée :

1. la promotion atomique du candidat vers les autorités `contracts/` en v2 ;
2. l'implémentation du moteur derrière les gates de développement.

Elle **n'autorise pas** une release ni l'émission de sauvegardes utilisateur. La conformité du composant construit relève de la Gate B définie dans [`README.md`](README.md#10-gate-b--conformité-du-moteur-avant-release).

## Candidat immuable

À compléter par le reviewer :

- commit Git candidat, SHA complet : `<required>` ;
- arbre Git du dossier candidat : `<required>` ;
- dépôt : `https://github.com/libre-ai/libre-ai` ;
- chemin : `docs/security/notebook-core-v2-review/` ;
- date UTC de revue : `<required>` ;
- référence professionnelle publique ou interne du reviewer : `<required>`.

Commandes de liaison, exécutées sur un worktree propre :

```bash
git rev-parse HEAD
git rev-parse HEAD:docs/security/notebook-core-v2-review
git status --short
```

Le commit candidat doit contenir au minimum `README.md`, `MIGRATION.md`, `world.wit`, les deux JSON Schema et `notebook-core-v2.golden.json`. Le procès-verbal approuvé peut être enregistré dans un commit ultérieur puisqu'il référence explicitement le commit candidat.

## Indépendance

Le reviewer confirme explicitement :

- [ ] ne pas être l'auteur de ce candidat ni de ses golden vectors ;
- [ ] ne pas auto-approuver une implémentation dont il serait l'auteur principal ;
- [ ] ne signaler aucun conflit d'intérêts susceptible d'altérer la décision ;
- [ ] n'utiliser que le secret public de test et aucune donnée personnelle ou clé réelle.

## Reproduction indépendante

Documenter les implémentations, versions, commandes et sorties. Au moins une chaîne de reproduction doit être indépendante de pyca/cryptography, OpenSSL EVP_KDF et Node Web Crypto déjà utilisés par l'auteur du candidat.

- implémentation Argon2id : `<required>` ;
- implémentation AES-256-GCM : `<required>` ;
- implémentation RFC 8785/JCS : `<required>` ;
- implémentation SHA-256/Base64 : `<required>` ;
- environnement et versions : `<required>` ;
- référence vers les preuves non sensibles : `<required>`.

Résultats attendus :

- [ ] clé dérivée `e6b35d4e67ec1f04cf571aa3cc441746dadec01406cd82a88ec4ea5708183e1c` ;
- [ ] AAD de 350 octets identiques au champ `golden.aad.bytesHex` ;
- [ ] ciphertext/tag et digest identiques au golden vector ;
- [ ] ouverture positive restituant exactement les 45 octets du plaintext de test ;
- [ ] mauvais secret refusé par `authentication-failed` ;
- [ ] nonce modifié refusé par `authentication-failed` ;
- [ ] sel modifié refusé par `authentication-failed` ;
- [ ] ciphertext modifié refusé par `authentication-failed` ;
- [ ] AAD modifié refusé par `authentication-failed` ;
- [ ] paramètres faibles refusés par `invalid-envelope` sans lancer Argon2id ;
- [ ] aucun plaintext n'est libéré par les cas négatifs.

## Analyse du protocole

Le reviewer conclut sur chacun des points suivants et référence ses constats si nécessaire :

- [ ] `id` et `createdAt` sont des entrées explicites et intégralement authentifiées ;
- [ ] les octets AAD et leur séparation de domaine sont non ambigus ;
- [ ] AES-256-GCM, nonce 12 octets, tag 16 octets et layout `C || T` sont corrects ;
- [ ] Base64 canonique, sel 16 octets et bornes du recovery secret sont suffisants ;
- [ ] bornes plaintext/ciphertext/enveloppe et comportement de parsing sont sûrs ;
- [ ] Argon2id v19, `P/S/K/X`, paramètres et sortie directe de 32 octets sont corrects ;
- [ ] digest préfixé, octets couverts et exclusion du seul champ `digest` sont corrects ;
- [ ] l'ordre d'ouverture et les erreurs ne créent pas d'oracle exploitable ;
- [ ] les exigences de zéroïsation et non-persistance sont complètes et testables en Gate B ;
- [ ] l'absence totale d'import WASM est complète et testable en Gate B ;
- [ ] le passage à `notebook-core@2.0.0` et l'absence d'adaptateur v1 automatique sont justifiés.

## Budget à qualifier en Gate B

La Gate A fixe les seuils que le moteur réel devra respecter :

- navigateurs et versions supportés : `<required>` ;
- classes minimales d'appareil : `<required>` ;
- pic mémoire maximal autorisé pour `m=65536, t=3, p=1` : `<required>` ;
- latence maximale de scellement : `<required>` ;
- latence maximale d'ouverture valide : `<required>` ;
- tolérance de latence entre erreurs cryptographiques comparables : `<required>` ;
- comportement attendu en mémoire insuffisante : `resource-limit-exceeded`, sans fallback KDF.

## Constats

Chaque constat reçoit un identifiant, une sévérité (`blocking`, `major`, `minor`), une preuve, une correction et son statut. Tout constat `blocking` ou `major` ouvert interdit l'approbation.

| ID | Sévérité | Constat et preuve | Correction | Statut |
| --- | --- | --- | --- | --- |
| `<required-if-any>` |  |  |  |  |

## Décision Gate A

Cocher exactement une décision :

- [ ] **APPROVED** — aucun constat bloquant/majeur ouvert ; promotion v2 et implémentation autorisées, release interdite avant Gate B ;
- [ ] **APPROVED WITH MINOR RESERVATIONS** — réserves non normatives listées et échéancées ; mêmes limites que ci-dessus ;
- [ ] **REJECTED** — promotion et implémentation interdites.

Justification synthétique : `<required>`.

Référence du commit attribuable contenant ce procès-verbal : `<required>`.

Toute modification normative de `README.md`, `MIGRATION.md`, `world.wit`, des schémas ou des vecteurs après le commit candidat annule cette décision et impose une nouvelle Gate A.
