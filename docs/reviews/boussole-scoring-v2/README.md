# Revue agentique indépendante — Boussole scoring v2

Statut : **candidate / NO-GO public scoring**.

Les verdicts historiques restent immuables :

- `METHODOLOGY-VERDICT.md` rejette le corpus initial ;
- `METHODOLOGY-VERDICT-2.md` approuve le corpus méthodologique remédié ;
- `SECURITY-VERDICT.md` rejette l'ancienne frontière de sécurité ;
- le record attribuable sécurité publié sur la PR #39 approuve la remédiation `1f2628f` ;
- les passes attribuables publiées sur l'issue #23 ont ensuite rejeté `1f2628f` en architecture et
  vie privée, tout en approuvant la méthodologie avec réserve mineure.

Le jeu final cible le commit immuable `e83e142f647ec9ab6478b7c1e9428950ea209561`. Tout verdict
antérieur reste une trace utile mais est stale pour la promotion.

## Verdicts finaux durables

| Rôle | Record | Verdict | SHA-256 du record |
| --- | --- | --- | --- |
| Architecture | [`ARCHITECTURE-VERDICT-FINAL.md`](ARCHITECTURE-VERDICT-FINAL.md) | `approve` | `c5460d61259b1d027d5e1f7e672848645d969af3785ecc903460d9644c72c6eb` |
| Security | [`SECURITY-VERDICT-FINAL.md`](SECURITY-VERDICT-FINAL.md) | `approve-with-minor-reservations` | `7cacabc74f20176c3727e5eaf33e19bd0d502fc81304d9b61fe7a43bc5532a8e` |
| Methodology | [`METHODOLOGY-VERDICT-FINAL.md`](METHODOLOGY-VERDICT-FINAL.md) | `approve` | `7cad942bfdf503bf73d0d9ab16855b5cdcf0d3129e1e027a2c110094af234eec` |
| Privacy France/UE | [`PRIVACY-VERDICT-FINAL.md`](PRIVACY-VERDICT-FINAL.md) | `approve-with-minor-reservations` | `bb5c4eedcfa0fb5548565adca005777cff868d7e51183f28f26cc83a600aa4f4` |

Les quatre rôles sont techniquement complets. Cela ne promeut pas le candidat : une passe de
promotion séparée et le jalon explicite du propriétaire restent requis par
[`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). Le scoring public demeure NO-GO.

Les quatre rôles couvrent séparément :

1. architecture — cohérence WIT/JSON Schema, URN kind-specific et catalogue complet ;
2. sécurité — bornes, refus, arithmétique, publication agrégée et imports WASM ;
3. méthodologie — formule, échelle, abstention, absents, pondération et arrondi ;
4. vie privée France/UE — zéro transmission, agrégation fail-closed et attestations consenties.

Les autorités normatives comprennent les deux corpus explicitement catalogués :

- `contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json` ;
- `contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json`.

Les passes reproduisent les dix cas méthodologiques avec une seconde implémentation, vérifient les
digests exacts et confirment que les deux reviewers sont opaques, distincts, associés aux rôles
professionnels attendus et liés à des attestations HTTPS hashées avec consentement explicite. Les cas
couvrent la réponse zéro distincte d'un skip, une réponse intermédiaire normalisée par `r/M`, le mode
neutre, les réponses sautées ou absentes, l'agrégation pondérée, les ties-to-even positifs et
négatifs, le dénominateur nul, le reviewer dupliqué et une référence de proposition inconnue.

Le corpus sécurité couvre huit refus byte-exacts, les plafonds exact/+1, les huit codes fermés, les
canaris de non-divulgation, le domaine arithmétique maximal, le seuil minimal d'agrégation,
l'expiration de la revue de publication, le refus d'un ciblage de personne déclaré et la
réapprobation obligatoire après toute modification du wording. Le gate Rust exige un monde WIT
résolu sans import.

La politique de publication est hash-bound : seuil déclaré supérieur ou égal à 5, exclusion des
petits groupes, aucune identité individuelle, sources roll-call uniquement agrégées et échéance de
revue explicite. Chaque statement déclare un sujet de politique publique et l'interdiction du ciblage
d'une personne. Le wording humain est lié au digest : sa conformité sémantique est attestée par le
reviewer vie privée et toute modification exige une nouvelle approbation. Un dataset réel peut
imposer un seuil supérieur ou refuser une source ; il ne peut jamais relâcher ce plancher
contractuel. Les identités professionnelles restent hors payload sous forme d'attestations publiques
consenties et vérifiées par le caller de release, jamais par le composant pur.

Jusqu'aux quatre verdicts, à une passe de promotion séparée et au contrôle humain explicite, le code,
les schémas et les données peuvent être testés mais toute fonctionnalité de scoring public reste
désactivée à la compilation/release.
