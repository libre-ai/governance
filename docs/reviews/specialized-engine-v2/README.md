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

La première remédiation sur `3baecf8` a fermé ces compositions, mais sa passe d'intégration a trouvé
les séparateurs de domaine `&period;` encore non décodés. Ce second rejet est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-3BAECF8.md`](CANDIDATE-INTEGRATION-REJECT-3BAECF8.md), SHA-256
`9dd66f60242f395313553b82eb7e936aa07c633d4f39ad5aebc492aa4c308dbb`.

La remédiation courante couvre les local-parts RFC contenant `&` et les entités nommées de syntaxe
e-mail, dont `&period;`, sans réécrire les ampersands du payload. Aucune autorité normative moteur
n'est modifiée.

## Gates restants

1. intégrer la remédiation mixte après candidate-integration favorable ;
2. rejouer Architecture et Security sur son merge immuable ;
3. persister uniquement ces nouveaux records et enregistrer le contrôle owner ;
4. préparer une promotion catalog-only séparée avec revue promotion/integration avant
   `candidate → locked`.

Les preuves et verdicts suivent [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md).
`locked` fixera seulement le sens du contrat : aucun moteur, scoring public, traitement de données
réelles, capability, release, infrastructure ou déploiement n'est autorisé.
