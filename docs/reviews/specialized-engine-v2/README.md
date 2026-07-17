# Revue agentique du format de vecteurs des moteurs spécialisés

Statut : `pending-independent-agent-review`.

Le schéma `engine-golden-vectors.v1` ne remplace aucune sémantique de moteur ; il borne uniquement l’enveloppe des index de vecteurs. Des passes review-only Architecture et Sécurité séparées doivent confirmer que chaque WIT candidat référence un profil normatif et des vecteurs publics sans secret ni donnée personnelle. Les sorties d’une implémentation ne peuvent pas réécrire leurs propres attentes.

Les preuves et verdicts suivent [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md). Une passe qui modifie sa cible ou un verdict sans commit immuable maintient le candidat en attente.
