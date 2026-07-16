# Revue du format de vecteurs des moteurs spécialisés

Statut : candidate. Le schéma `engine-golden-vectors.v1` ne remplace aucune sémantique de moteur ;
il borne uniquement l’enveloppe des index de vecteurs. Des passes agent review-only Architecture et
Sécurité, conduites selon `docs/reviews/AGENT-REVIEW-PROTOCOL.md`, doivent confirmer que chaque WIT
candidat référence un profil normatif et des vecteurs publics sans secret ni donnée personnelle. Les
sorties d’une implémentation ne peuvent pas réécrire leurs propres attentes. L’intégration du candidat
ne vaut ni promotion `locked`, ni autorisation produit ou déploiement.
