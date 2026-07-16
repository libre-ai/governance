# Rapport Gate A — Vie privée France/UE — Notebook Core v2

## Périmètre et traçabilité

- **Rôle exclusivement examiné :** vie privée France/UE.
- **Commit immuable :** `9b1b994301ac82fbdb781a32a33bdd080eb865a3`
- **HEAD local :** identique au commit cible ; arbre Git `ae97c8579091b15f13d4315f1bb359aebb35ff6f`.
- **Dossier de revue Git :** `46f9b346382ada23865c7333e98b50647a9a5bca`.
- **Propreté :** `git status --porcelain=v1` vide avant et après revue ; aucun fichier modifié.
- **Intégrité :** objet commit présent et connectivité vérifiée. La signature GitHub est présente mais non vérifiable localement faute de clé publique.

### Empreintes SHA-256

| Artefact | SHA-256 |
|---|---|
| `contracts/catalog.v1.json` | `908e735f9c1c6ac825890001a52ee66fc02b5bf45ea9894e99cdfa41e2fe2714` |
| `contracts/wit/notebook-core-v2/world.wit` | `72aef100a93606f95ac9cd6f9551186470252acaa9161cbc6885e1296cad6171` |
| `contracts/wit/notebook-core-v2/SEMANTICS.md` | `b2ab094f6392d09d2331f145dfc0f2d85093d7439c2422147d34111c4284bde1` |
| `contracts/schemas/context-document.v2.schema.json` | `f14de256079228b075d38977321c0fb29b97bf872de78b2d03d7de00ea2e9dc9` |
| `contracts/schemas/notebook-backup-seal-request.v2.schema.json` | `d6b38a443249f7029dcd47eddd32a44d1b82025782a7df5e9bebeedfa79c8f96` |
| `contracts/schemas/notebook-backup.v2.schema.json` | `d194c15523a51ee64a11fc09f07dfbd15e6e64d907e000b928d7b8e4d64a23d8` |
| `contracts/fixtures/notebook-core-v2/golden-vectors.v1.json` | `d0cb031d1bdfd888bed8cc2b88899197f03ea169612c3106970043450a3a04ee` |
| `docs/apps/notebook.md` | `10cad4fecb74431fed1c2d28bc6fc7f0f7b1741eeb814529490cf4a8af8e529a` |

Les trois copies examinées du dossier (`world.wit`, deux schémas backup) sont bit-à-bit identiques aux sources canoniques.

## Commandes et preuves

Exécutées sans écriture dans le dépôt :

```text
git rev-parse HEAD
git status --porcelain=v1
git diff --check 9b1b994301ac82fbdb781a32a33bdd080eb865a3
git cat-file -e 9b1b994301ac82fbdb781a32a33bdd080eb865a3^{commit}
git fsck --no-reflogs --connectivity-only 9b1b994301ac82fbdb781a32a33bdd080eb865a3
bun tools/quality/check-notebook-core-v2-candidate.ts
bun tools/quality/check-notebook-v2-vectors.ts
bun tools/quality/check-contracts.ts
```

Résultats verts : candidat Gate S (WIT fermé, copies, schémas, AAD/digest, AES-GCM, 6 mutations), vecteurs structurels (7 mutations), catalogue (71 entrées, 47 paires de fixtures, 103 opérations).

Résultats non qualifiants, non masqués :

```text
bun run check:toolchain
bun run check:generated-contracts
```

Ils échouent dans cet environnement : Bun `1.3.11` au lieu du `1.4.0-canary.1` épinglé, et binaires locaux `biome`/`tsc` absents. Ces échecs ne constituent pas une preuve de défaut du commit, mais empêchent de présenter la chaîne de qualité complète comme reproduite ici.

## Analyse minimisation et local-only

Le contrat est catalogué `candidate`, `local`, avec revue vie privée obligatoire. La surface WIT ne déclare aucun import : ni réseau, horloge, aléa, stockage, environnement ou journalisation. Aucun moteur Notebook, composant WASM ni application `apps/notebook` n’est présent au commit. Le contrat seul ne crée donc ni transmission ni persistance.

Données traitées :

- le contexte peut contenir blocs, contenus, liens, révisions, identifiants, exclusions, date et digest : données personnelles potentielles, limitées à une sélection explicite de l’utilisateur ;
- la sauvegarde persistable contient ciphertext, digest, `id`, `createdAt`, paramètres KDF, sel et nonce ;
- le recovery secret et la clé dérivée sont explicitement transitoires, séparés de la requête sérialisable et ne doivent ni être persistés ni loggés ;
- les vecteurs utilisent uniquement un secret, sel et nonce explicitement publics et interdits en production.

Les responsabilités host sont correctement séparées en principe : CSPRNG pour sel/nonce neufs, buffers sensibles à effacer, génération locale de l’identifiant/date, suppression des clés et enregistrements locaux. La documentation produit prévoit une rétention locale jusqu’à suppression explicite et reconnaît les limites d’effacement des stockages navigateur. Aucune synchronisation ou copie serveur n’est autorisée.

## Constats

1. **P-01 — Major — Métadonnées persistables insuffisamment minimisées.**
   L’enveloppe portable expose en clair un `id` arbitraire et un `createdAt` UTC précis à la seconde. Le contrat n’impose ni identifiant opaque aléatoire, ni interdiction de données identifiantes dans l’ID, ni justification de la précision temporelle. Ces métadonnées authentifiées restent corrélables entre copies de sauvegarde malgré le ciphertext.
   **Correction attendue avant verrouillage :** imposer un ID opaque issu d’un CSPRNG avec entropie minimale, interdire toute donnée utilisateur dans cet ID, et réduire, déplacer dans la partie chiffrée ou justifier explicitement la date précise. Régénérer vecteurs, empreintes et revue.

2. **P-02 — Major — Conversion Unicode du recovery secret non interopérable normativement.**
   Le secret est opaque au cœur, mais la conversion UI ne fixe pas une règle canonique : NFC après UTF-8 sans BOM n’est que recommandé. Deux hosts conformes peuvent donc produire des octets différents à partir du même secret visible, rendant une sauvegarde irrécupérable. L’absence de version de conversion dans le format empêche une correction rétrocompatible certaine.
   **Correction attendue avant verrouillage :** imposer une conversion exacte et stable (dont UTF-8, absence de BOM, normalisation et absence de trim), documenter les cas de saisie non textuelle et ajouter des vecteurs Unicode NFC/NFD, emoji et caractères combinés.

3. **P-03 — Minor — Politique de rétention des métadonnées locales à expliciter.**
   `docs/apps/notebook.md` prévoit la persistance locale de métadonnées d’export et de réglages, sans inventaire opérationnel, durée propre ni preuve de suppression pour les exports/sauvegardes locaux.
   **Correction attendue :** inventaire de stockage, suppression locale vérifiable et information utilisateur sur les copies exportées non effaçables à distance.

## Risques résiduels et mesures Gate B

Gate A examine le protocole ; elle ne prouve pas le comportement d’un composant inexistant. Gate B devra vérifier sur le binaire et le host réels :

- imports WASM effectivement vides et exécution sans WASI ;
- absence de réseau, télémétrie, logs, cache ou persistance de plaintext, clés ou secrets ;
- CSPRNG, unicité sel/nonce, génération opaque de l’ID et conversion Unicode corrigée ;
- effacement best-effort des buffers host et comportement sur erreur, panic et pression mémoire ;
- suppression IndexedDB/clés, mode hors ligne et absence de requêtes réseau avec données utilisateur ;
- budgets navigateur, y compris refus propre sur ressources insuffisantes ;
- aucune donnée utilisateur, aucune sauvegarde utilisateur et aucune promotion `candidate → locked` avant fermeture des constats, autres verdicts de rôle et jalon humain.

Ce verdict ne vaut ni verrouillage, ni Gate B, ni release.

## Verdict de rôle vie privée France/UE

**REJECT**
