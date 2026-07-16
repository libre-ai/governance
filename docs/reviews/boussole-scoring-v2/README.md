# Revue par rôles — Boussole scoring v2

Statut : **candidate intégrable / NO-GO public scoring**. La méthodologie est
approuvée pour le hash consigné dans `METHODOLOGY-VERDICT-2.md`. Le verdict sécurité
`SECURITY-VERDICT.md` reste **REJECT** jusqu’à une nouvelle passe sur la remédiation.

L’intégration du candidat suit la revue agent générique et le jalon humain de continuation. La
promotion exige quatre verdicts issus de passes agent review-only distinctes, puis le jalon humain de
verrouillage défini dans `docs/reviews/AGENT-REVIEW-PROTOCOL.md` :

1. architecture — cohérence WIT/JSON Schema et compatibilité ;
2. sécurité — bornes, refus, arithmétique et imports WASM ;
3. méthodologie — formule, échelle, abstention, absents, pondération et arrondi ;
4. vie privée France/UE — zéro transmission, absence d’identifiant et publication des attestations.

Les passes doivent reproduire `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` avec
une seconde implémentation, vérifier les digests exacts et confirmer que les deux `reviewerId`
méthodologie/vie privée sont distincts et liés aux hashes méthode/dataset. Les dix cas exécutables
couvrent la réponse zéro distincte d’un skip, une réponse intermédiaire normalisée par `r/M`, le mode
neutre, les réponses sautées ou absentes, l’agrégation pondérée, les ties-to-even positifs et
négatifs, le dénominateur nul, le reviewer dupliqué et une référence de proposition inconnue. Les cas
dérivés utilisent uniquement des patches `replace` JSON Pointer bornés et effectivement appliqués
par la gate.

`contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json` ajoute huit refus
byte-exacts, les plafonds exact/+1, les huit codes fermés, les canaris de redaction
et le domaine arithmétique maximal. Le gate Rust exige désormais un monde WIT
résolu sans import. Ces preuves remédient les constats de `SECURITY-VERDICT.md` mais
ne constituent pas une approbation sécurité.

Jusqu’à ces quatre verdicts et leur acceptation humaine, le code, les schémas et les données peuvent
être testés mais toute fonctionnalité de scoring public reste désactivée à la compilation/release.
