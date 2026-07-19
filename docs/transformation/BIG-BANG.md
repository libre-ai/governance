# Programme de transformation Big Bang

## Définition

Le Big Bang supprime toute architecture de transition : freeze global de l’existant, reconstruction dans le monorepo, qualification globale, puis cutover unique.

Il n’autorise ni perte de données, ni intégration tardive. Les composants cibles sont intégrés en continu pendant la reconstruction.

## Vague 0 — Global Freeze

- préserver les modifications locales ;
- enregistrer SHA, licences, données, releases et contrats utiles ;
- produire `ecosystem/LEGACY-MANIFEST.yaml` ;
- archiver les repositories ;
- arrêter tout développement historique.

**Gate :** aucune perte utilisateur ou légale ; le monorepo est l’unique destination.

## Vague 1 — Specification Lock

- ADR et architecture ;
- noms et ownership ;
- modèle d’objets ;
- contrats ;
- modèles de données et auth ;
- plans des applications ;
- work packages et graphe.

**Gate :** aucune décision d’architecture critique laissée aux agents d’implémentation.

## Vague 2 — Foundation Build

- workspaces Bun/Cargo ;
- Knowledge Engine ;
- packages web ;
- crates spécialisées ;
- template ;
- CI, Proof, Artifact et Clever smoke.

**Gate :** chaîne de référence complète depuis une checkout vierge.

## Vague 3 — Parallel Reconstruction

- applications et capabilities construites en parallèle ;
- intégration fréquente ;
- aucune compatibilité historique ;
- tests des seuls invariants acceptés.

**Gate :** cible complète, compilable et sans ancienne stack.

## Vague 4 — Global Hardening

- sécurité, accessibilité, charge ;
- migrations de données ;
- observabilité ;
- backup/restore/rollback ;
- répétition du cutover.

**Gate :** release candidate globale reconstructible.

## Vague 5 — Single Cutover

- DNS, artefacts et déploiements ;
- publications générées et repositories produits selon décision propriétaire (ADR-0008) ;
- archivage définitif ;
- surveillance et rollback global.

## Vague 6 — Distribution

- registries européens ;
- miroirs publics ;
- SDK/MCP/knowledge packs ;
- documentation, formation et reproduction indépendante.
