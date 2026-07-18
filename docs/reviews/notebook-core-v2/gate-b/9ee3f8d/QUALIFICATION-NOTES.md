# Notes de qualification et résultats rouges conservés

## Refus environnementaux avant candidat final

Les premiers essais sur `e8c4532` ont refusé avant compilation lorsque le Node épinglé n'était pas le `node` résolu par `PATH`, puis lorsque `NOTEBOOK_QUALIFICATION_NODE` manquait au build produit. Le premier `bun run check` de ce worktree utilisait aussi un `node_modules` partagé incomplet et a échoué au typecheck ; une installation locale `bun install --frozen-lockfile` a fermé ce problème sans modifier `bun.lock`. Les assets ignorés `apps/notebook/dist` produits par les E2E ont ensuite été supprimés avant chaque contrôle source final.

Ces refus sont des protections fail-closed du bootstrap, pas des résultats produit. Les campagnes créditées utilisent le Bun/Node exacts, le worktree propre et le package final vérifié.

## Matrice `e8c4532` rejetée

La première matrice physique complète sur `e8c4532` a écrit un verdict `reject` pour `firefox/maximum-16mib/browser-peak-rss-delta` avec 3 257 450 496 octets additionnels. Les quatre JSON, leur somme et le log sont conservés dans `evidence/performance/rejected-e8c4532/`.

Le sampler de ce candidat additionnait tout processus dont la commande contenait le chemin global du cache navigateur. Il ne pouvait donc pas attribuer le dépassement au groupe lancé par la campagne en présence d'une exécution concurrente. Une réplication Firefox isolée a passé à 313 278 464 octets, mais elle n'a pas effacé le rejet.

## Tentative PGID non créditée

Le candidat intermédiaire `cb5f2b5` a limité le RSS au PGID du processus Playwright. Cette méthode a correctement isolé Chromium/Firefox mais a sous-compté les XPC WebKit qui changent de groupe OS : des deltas de quelques centaines de Kio étaient incompatibles avec les mémoires WASM observées. Aucun rapport de cette tentative n'est présenté comme preuve Gate B.

## Mesure finale `9ee3f8d`

La solution finale :

1. acquiert atomiquement un lock global dans le cache Playwright avant tout worker/navigateur ;
2. refuse un lock existant et tout processus provenant déjà d'un des trois chemins épinglés ;
3. somme le RSS de tous les processus dont la commande provient du cache exact, couvrant les XPC WebKit ;
4. attend leur disparition et retire le lock au teardown ;
5. échoue si un processus reste.

Le test négatif de concurrence sort non nul avant navigateur. La matrice finale complète cible exactement `9ee3f8d`, passe les trois moteurs et ne laisse aucun lock, volume APFS ou processus de qualification.

## OOM

Aucun essai global de saturation RAM/swap n'a été exécuté. Le diagnostic V8 historique reste non promouvable et l'OOM processus réel est facultatif conformément à ADR-0007. Les fautes internes et la reprise après disparition du processus restent qualifiées.
