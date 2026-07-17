# Revue agentique du format de vecteurs des moteurs spécialisés

Statut : `candidate-remediation / pending fresh role review`.

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
personnelles et blobs non bornés. [`REMEDIATION.md`](REMEDIATION.md) décrit les refus et plafonds
exécutables ajoutés. Toute approbation antérieure au commit final de remédiation est stale.

## Gate restant

Des passes review-only Architecture et Security séparées doivent maintenant confirmer, sur le même
commit immuable et avec tous les hashes pertinents :

1. que l'enveloppe ne peut pas remplacer la sémantique d'un moteur ni réécrire ses attentes ;
2. que fichiers, chemins, hashes, tailles, profondeur, cardinalités et valeurs publiques échouent de
   manière fermée ;
3. que chaque corpus reste synthétique et sans secret ni donnée personnelle réelle ;
4. que la projection TypeScript opaque ne devient pas une frontière produit.

Les preuves et verdicts suivent [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). Une
passe qui modifie sa cible ou un verdict sans commit immuable maintient le candidat en attente.
