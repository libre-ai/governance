# Revue agentique indépendante — Boussole scoring v2

Statut : **candidate / NO-GO public scoring**. Le verdict méthodologique favorable lié au commit
`5bcce21` reste une preuve technique liée à son hash, mais ne renseigne pas les identifiants
agent/session désormais requis : une passe attribuable doit le confirmer. Le verdict sécurité lié à
`1d701a2` reste `reject` comme trace historique. Sa remédiation normative exige une nouvelle passe
attribuable sur le commit intégré. Architecture et vie privée restent également requises.

La promotion exige quatre records issus d’agents review-only distincts de l’agent/session auteur,
conformément à [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md) :

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
ne constituent pas à elles seules une approbation sécurité.

Jusqu’à ces quatre verdicts agentiques et aux approbations produit humaines exigées par les contrats,
le code, les schémas et les données peuvent être testés mais toute fonctionnalité de scoring public
reste désactivée à la compilation/release.
