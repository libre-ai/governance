# Rapport Gate A — Vie privée France/UE — Notebook Core v2

## Identité et indépendance

- Auteur : `openai-codex/gpt-5.6-sol`, session `019f6b98-4265-7011-8b0e-0091ebba360a`
- Reviewer : `openai-codex/gpt-5.6-terra`, session `bbd7746e-21e2-4dbd-aa52-eccacb66f961`
- Provider/modèle reviewer : `openai-codex`, `gpt-5.6-terra`
- Rôle exclusif : vie privée France/UE. Passe fraîche, review-only, sans modification ni réutilisation de verdict historique. Identifiants et sessions auteur/reviewer distincts.

## Portée et intégrité

- Commit : `a28e116b0a3ebf278412650715e03f7050c0aac0`
- Arbre : `cda41e7f9cc620a87ee0488caa06141614fb5b93`
- Arbre dossier de revue : `56010a4e25653b84cea7e97859911a5c1f1567f8`
- Worktree/index propres avant et après revue.
- Connectivité de l’objet cible valide ; `git fsck` retourne zéro erreur atteignable. Des objets dangling préexistants, hors cible, sont signalés par Git.

Empreintes SHA-256 conformes aux attendus :

| Artefact | SHA-256 |
|---|---|
| WIT | `132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295` |
| Sémantique | `5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b` |
| Schéma Context v2 | `f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4` |
| Schéma seal request v2 | `4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a` |
| Schéma backup v2 | `e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0` |
| Golden | `734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09` |

Les quatre copies de revue prévues (WIT, deux schémas backup, golden) sont byte-identiques aux autorités sous `contracts/`.

## Commandes et preuves

Contrôles exécutés sans écriture dans le dépôt :

- `git rev-parse`, `git status --porcelain`, `git diff --check`, `git cat-file`, `git fsck`
- `shasum -a 256` et `cmp -s` des artefacts/copies
- avec Bun `1.4.0-canary.1` et le `NODE_PATH` imposé :
  - `bun run check:notebook-core-v2-candidate` : succès — WIT fermé, copies identiques, 10 mutations backup, 12 Context, 6 bornes ressources, profil recovery unique ;
  - `bun run check:contracts` : succès ;
  - `bun run check:toolchain` : succès ;
  - `bun run check:generated-contracts` : succès dans une archive immuable temporaire du commit, reliée en lecture aux dépendances fournies ; l’exécution directe échouait seulement car le script exige `node_modules/.bin/biome` à la racine du worktree.
- `cargo test -p libre-ai-ecosystem-engine --test wit_contracts` : succès, 1 test.

## Cartographie vie privée, minimisation et local-only

- Le Context exporté peut contenir des données personnelles dans `content`, titres éventuels, liens, structure et `mediaType`. Il est explicitement sélectionné, prévisualisé et exporté : aucun accès direct au Notebook n’est donné au consommateur.
- Chaque identifiant local de bloc est obligatoirement remappé vers un ID `blk_` CSPRNG de 128 bits, neuf et limité à l’export ; racines et liens sont réécrits. L’ID Context et l’ID backup sont eux aussi opaques et neufs.
- `revision`, `excludedBlockIds` et `createdAt` sont absents des schémas publics et explicitement refusés/écartés par la sémantique et les checkers. Les exclusions restent dans le reçu/prévisualisation locale.
- La sauvegarde claire ne contient que version, ID opaque, paramètres KDF, sel, nonce, ciphertext et digest. Sel, nonce et ID sont neufs à chaque scellement ; le digest ne remplace jamais GCM.
- Le seul secret de récupération est `libre-ai.recovery-secret-code.v1` : exactement 16 octets CSPRNG, rendus sous 32 hexadécimaux minuscules ; aucune passphrase, Unicode, trim, casse ou heuristique.
- Le WIT ne déclare aucun import : pas de réseau, horloge, aléa, stockage, environnement ou journalisation. Aucun moteur, application Notebook, endpoint ou OpenAPI Notebook n’est présent.
- La documentation impose IndexedDB/fichiers détenus par l’utilisateur, aucune synchronisation, aucune télémétrie cachée, suppression locale explicite et destruction de clés ; elle expose les limites d’effacement navigateur et l’impossibilité de révoquer une copie exportée.
- Les fixtures sont synthétiques, publiques, marquées comme matériel de test interdit en production et ne contiennent pas de PII.

La corrélation résiduelle par contenu explicitement exporté, graphe, `mediaType` et taille est inhérente à un Context clair et prévisualisé ; celle de la taille d’une sauvegarde chiffrée subsiste. Les identifiants, sels, nonces et digest d’enveloppe ne constituent pas un identifiant stable entre scellements neufs.

## Constats

### Blocking

1. Aucun constat blocking ouvert.

### Major

1. Aucun constat major ouvert au niveau contractuel.

### Minor

1. Aucun constat minor ouvert. L’échec initial de génération dans le worktree est un manque de binaire local, reproduit vert dans une archive immuable avec les dépendances prescrites ; ce n’est pas un défaut de contrat.

## Risques résiduels et mesures Gate B

1. Vérifier le CSPRNG réel, la fraîcheur et l’unicité des IDs, sels et nonces côté host.
2. Prouver l’absence effective de réseau, logs, métriques, caches et persistance de plaintext, clés ou secrets.
3. Inspecter module et composant WASM : imports vides et exécution sans WASI.
4. Vérifier zéroïsation best-effort, OOM/panic et buffers host/WASM.
5. Tester suppression IndexedDB/clés, hors-ligne, export/import et absence de requêtes réseau.
6. Vérifier l’information UI sur export clair, taille visible, métadonnées de fichier et limites d’effacement/révocation.

Ce verdict vaut exclusivement pour VIE PRIVÉE France/UE. Il ne vaut aucun autre rôle, aucune autorisation propriétaire, aucun verrouillage, aucune Gate B et aucune release.

APPROVE
