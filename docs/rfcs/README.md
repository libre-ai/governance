# RFC candidates

Les RFC de ce répertoire sont des propositions d’architecture et de sécurité. Elles ne sont ni des contrats canoniques, ni des work packages, ni des autorisations d’implémentation.

Une RFC affectant un contrat, l’autorisation, le réseau, les providers, la persistance ou l’exécution agentique doit suivre, dans cet ordre :

1. revue architecture et sécurité sur un commit immuable ;
2. résolution explicite des décisions ouvertes ;
3. création de contrats candidats et de leurs vecteurs positifs/négatifs ;
4. passes de revue séparées selon `docs/reviews/AGENT-REVIEW-PROTOCOL.md` ;
5. jalon humain de Specification Lock ;
6. ajout d’un work package borné avant toute implémentation.

L’absence de décision ouverte dans une RFC ne saute aucune de ces gates.
