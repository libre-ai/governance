# Revue par rôles — Boussole scoring v2

Statut : **candidate intégrable / NO-GO public scoring**.

L’intégration du candidat suit la revue agent générique et le jalon humain de continuation. La
promotion exige quatre verdicts issus de passes agent review-only distinctes, puis le jalon humain de
verrouillage défini dans `docs/reviews/AGENT-REVIEW-PROTOCOL.md` :

1. architecture — cohérence WIT/JSON Schema et compatibilité ;
2. sécurité — bornes, refus, arithmétique et imports WASM ;
3. méthodologie — formule, échelle, abstention, absents, pondération et arrondi ;
4. vie privée France/UE — zéro transmission, absence d’identifiant et publication des attestations.

Les passes doivent reproduire `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` avec
une seconde implémentation, vérifier les digests exacts et confirmer que les deux `reviewerId`
méthodologie/vie privée sont distincts et liés aux hashes méthode/dataset.

Jusqu’à ces quatre verdicts et leur acceptation humaine, le code, les schémas et les données peuvent
être testés mais toute fonctionnalité de scoring public reste désactivée à la compilation/release.
