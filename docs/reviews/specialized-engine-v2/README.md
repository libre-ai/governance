# Revue agentique du format de vecteurs des moteurs spécialisés

Statut : `candidate-reviewed / pending evidence integration and distinct promotion`.

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

## Passes finales sur `ae455b9`

Deux passes review-only séparées approuvent le même arbre immuable
`ae455b9875b03b78dbb0a9d1dcfcb9c566754808` et le schéma SHA-256
`2300274b0ee626ccc01eb3d42142f1dd4bef96aaf8c4c68c0569188caec5954b` :

- [`ARCHITECTURE-VERDICT-FINAL.md`](ARCHITECTURE-VERDICT-FINAL.md) : `APPROVE architecture`,
  session `019f6fad-8c5a-7d7e-8bb0-1cad492fff6c`, record SHA-256
  `0833f3f2c390c6ca031e47226f1414746b9f7595af98362a3fc5f7164c404a5f` ;
- [`SECURITY-VERDICT-FINAL.md`](SECURITY-VERDICT-FINAL.md) : `APPROVE security`, session
  `019f6fad-8c6e-78cd-b8d3-51587d4604f4`, record SHA-256
  `eddde521d25b35b1f32385ca40a2ea93cbeedb39aebe5bc18e42ff982191f158`.

Les hashes de fichiers cités à l'intérieur des rapports sont ceux de l'arbre relu `ae455b9`. Le
présent index et les rapports, non catalogués, sont ajoutés ensuite par une passe d'intégration de
preuves ; ils ne modifient ni le schéma candidat ni les cinq corpus relus. Le gate partagé qualifie
les cinq corpus, et leurs checkers propres restent seuls normatifs pour leur sémantique.

## Gates restants

1. intégrer ces records par une passe candidate-integration distincte ;
2. enregistrer le contrôle owner pour cette autorité ;
3. préparer une PR de promotion catalog-only séparée, en vérifiant le schéma byte-identique ;
4. obtenir une revue promotion/integration favorable avant `candidate → locked`.

Les preuves et verdicts suivent [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md).
`locked` fixera seulement le sens du contrat : aucun moteur, scoring public, traitement de données
réelles, capability, release, infrastructure ou déploiement n'est autorisé.
