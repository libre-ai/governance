# Revue indépendante — Boussole scoring v2

Statut : **candidate / NO-GO public scoring**.

La promotion exige quatre approbations humaines nommées, distinctes de l’auteur des contrats et de l’implémenteur :

1. architecture — cohérence WIT/JSON Schema et compatibilité ;
2. sécurité — bornes, refus, arithmétique et imports WASM ;
3. méthodologie — formule, échelle, abstention, absents, pondération et arrondi ;
4. vie privée France/UE — zéro transmission, absence d’identifiant et publication des attestations.

La revue doit reproduire `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` avec une implémentation indépendante, vérifier les digests exacts et confirmer que les deux `reviewerId` méthodologie/vie privée sont distincts et liés aux hashes méthode/dataset.

Jusqu’à ces quatre approbations, le code, les schémas et les données peuvent être testés mais toute fonctionnalité de scoring public reste désactivée à la compilation/release.
