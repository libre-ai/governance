# Revue agentique du format de vecteurs des moteurs spécialisés

Statut : `candidate-remediation / fresh roles required`.

Le schéma `engine-golden-vectors.v1` ne remplace aucune sémantique de moteur. Il borne l'enveloppe
JSON publique des vecteurs, tandis que les profils WIT et les checkers propres à Radar, Notebook,
Policy et Boussole restent seuls normatifs pour les entrées et sorties attendues. Aucun consommateur
produit ou runtime non fiable n'utilise cette enveloppe.

## Historique immuable

Les premières passes sur `9b376cf65755f7556866123f9fddf681a709a2f0` sont conservées :

- [`ARCHITECTURE-VERDICT.md`](ARCHITECTURE-VERDICT.md) :
  `approve-with-minor-reservations`, record SHA-256
  `42d02e057731676871ee01dbe64ca6772b8bb8837e6aa490d045f17b40e32ad1` ;
- [`SECURITY-VERDICT.md`](SECURITY-VERDICT.md) : `reject`, record SHA-256
  `03c24677664bfcf2b150e9bdf07cc6d1b3a6cd7970a7031efc44f5530add4728`.

Le rejet a démontré que les anciens champs `true` acceptaient des traversals, secrets, données
personnelles et blobs non bornés. Les passes suivantes, publiées sur l'issue #25, ont ensuite refusé
les confusables Unicode puis la politique lexicale transverse de `6fd4d5d` : records Architecture
`d77fc30072b980c230494a0871e918f8bbd31d202f731219c9acaa3b7e5b7dab` et Security
`d59569a01b992728cf0cf6b093e755066730780c41a7ebc2322c05d25e83d80b`.

[`REMEDIATION.md`](REMEDIATION.md) sépare désormais métadonnées sanitisées et payloads gouvernés
par moteur. Toute approbation antérieure au merge final de remédiation est stale.

## Passes invalidées sur `ae455b9`

[`ARCHITECTURE-VERDICT-FINAL.md`](ARCHITECTURE-VERDICT-FINAL.md) et
[`SECURITY-VERDICT-FINAL.md`](SECURITY-VERDICT-FINAL.md) conservent les approbations produites sur
`ae455b9875b03b78dbb0a9d1dcfcb9c566754808`. Elles ne sont **pas** citables comme verdicts finaux :
une passe candidate-integration stricte sur le même SHA a ensuite reproduit un bypass bloquant dans
les chaînes HTML mixtes amp/numeric/named. Le rejet est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-AE455.md`](CANDIDATE-INTEGRATION-REJECT-AE455.md), SHA-256
`18c2e8d32892d44546398f18e448316ab01e4791e52f03022aa9c32feb81773b`. La PR #66 a intégré les
approbations avant que ce rejet concurrent soit observé ; leur présence est historique, pas probante
pour une promotion.

Sur le merge immuable `79d02b6`, la passe
[`CANDIDATE-INTEGRATION-79D02.md`](CANDIDATE-INTEGRATION-79D02.md) (`approve`, SHA-256
`bd2b9af3136ba6b124e9dfbeeddee67af75c3735529730008f5116bdda2b253a`) et
[`ARCHITECTURE-VERDICT-79D02.md`](ARCHITECTURE-VERDICT-79D02.md) (`approve`, SHA-256
`74725a31d7a3323d32f3b17a5e84a90fd5497fd352edc493b981f1e551ec6a42`) ont précédé le rejet
Security [`SECURITY-VERDICT-79D02.md`](SECURITY-VERDICT-79D02.md), SHA-256
`442fc6009a56c930143e2704fdddf2a4a37f0f1e24bb5ee95d08708bdcd6bc13` : les local-parts RFC entre
guillemets, directs ou encodés, contournaient le scanner. Le constat bloquant rend les deux
approbations historiques non promotables.

La première remédiation sur `3baecf8` a fermé les compositions HTML mixtes, mais une passe
d'intégration ultérieure a trouvé les séparateurs de domaine `&period;` encore non décodés. Ce second rejet est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-3BAECF8.md`](CANDIDATE-INTEGRATION-REJECT-3BAECF8.md), SHA-256
`9dd66f60242f395313553b82eb7e936aa07c633d4f39ad5aebc492aa4c308dbb`.

La seconde remédiation sur `39f776e` a ajouté `period`, mais sa passe d'intégration a trouvé sept
aliases HTML5 exacts encore absents pour `*`, `_`, grave, accolades et barre verticale. Ce troisième
rejet est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-39F776E.md`](CANDIDATE-INTEGRATION-REJECT-39F776E.md), SHA-256
`6e9dc13e5f11d57a75df483c57cd38b623ea429db4511c43bb4d9bfef5eda84d`.

La troisième remédiation sur `e6df443` a complété ces aliases, mais sa passe d'intégration a rejeté
l'alias non-HTML5 `&at;` et le coût quadratique de la regex e-mail sans `@`. Ce quatrième rejet est
conservé dans
[`CANDIDATE-INTEGRATION-REJECT-E6DF443.md`](CANDIDATE-INTEGRATION-REJECT-E6DF443.md), SHA-256
`59607db595d156db37723e1bbe47130db2b9c0a9263055a958a4925b4f487967`.

La remédiation courante couvre exactement les aliases HTML5 dont le scalaire est un caractère ASCII
RFC atext, `@`, `period`, un délimiteur de local-part entre guillemets ou un séparateur de domaine
littéral. Elle laisse `&at;` inconnu, reconnaît les local-parts quoted, les domaines punycode/IP et
remplace la regex rétroactive par un scan borné du domaine puis du local-part. Les tests incluent les
encodages directs, percent, numeric, named et nested ainsi que des contrôles à la longueur maximale.
Aucune autorité normative moteur n'est modifiée.

## Gates restants

1. intégrer la remédiation des aliases nommés après candidate-integration favorable ;
2. rejouer Architecture et Security sur son merge immuable ;
3. persister uniquement ces nouveaux records et enregistrer le contrôle owner ;
4. préparer une promotion catalog-only séparée avec revue promotion/integration avant
   `candidate → locked`.

Les preuves et verdicts suivent [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md).
`locked` fixera seulement le sens du contrat : aucun moteur, scoring public, traitement de données
réelles, capability, release, infrastructure ou déploiement n'est autorisé.
