# Verdict qualité — système de marque Libre AI

Date : 2026-09-09

Verdict : **PASS pour le candidat local reproductible ; adoption de production non exécutée**.

## Périmètre immuable

- Governance : `e98e85c529f734c895e543108c08186472328259`
- UI : `992b230664a36985feba9a9252eff480de11488b`
- Website : `4e55c1cbcc37e9b204d30c933ce626b6b5042b45`
- `.github` : `ed57094964d53ce585818e2347c1ef303a61f512`

## Résultats reproductibles

| Surface | Gate | Résultat |
| --- | --- | --- |
| Governance | `bun run check` | 935 tests, 0 échec, 1 651 assertions ; projection et 8 contrôles de marque verts |
| UI | `bun run check` | 33 tests, 0 échec, 12 507 assertions ; génération, couleurs, assets, lint et types verts |
| UI | `bun run test:e2e` | 30 réussis, 6 ignorés intentionnellement |
| Website | `bun run check` | 23 tests, 0 échec, 89 assertions ; build, secrets, données personnelles, lint et types verts |
| Website | `bun run test:e2e:brand-local` | 25 réussis, 5 ignorés intentionnellement |
| Publication figurative | `bun run check:brand-publication` | échec attendu sur les deux acceptations propriétaire absentes |

Les scénarios ignorés sont des captures ou métriques Chromium redondantes sur les profils où elles
n'apportent pas une assertion indépendante. Les assertions fonctionnelles sont exécutées sur les six
profils déclarés.

## Cohérence de contenu

- La promesse française canonique est exactement `Possédez la fabrique.`.
- Les dix dépôts classés `product` par l'inventaire Governance ont un nom public gouverné. Cette règle
  produit notamment `Libre AI Practices`, sans le doublon incorrect `Libre AI AI Practices`.
- Le Website rend 35 lignes de flotte et refuse un produit sans nom public gouverné.
- Les introductions française et anglaise de la page d'organisation sont produites par une fonction
  pure et comparées octet pour octet par le gate de dérive.
- Les couleurs viennent uniquement des tokens générés Envol constructif ; aucun composant n'introduit
  de couleur brute ou de dégradé.

## Limites et disposition

Les SHA candidats Governance et UI ne sont pas encore accessibles depuis leurs branches publiques.
Le manifeste Website de production n'a donc pas été repointé vers des dépendances Git impossibles à
résoudre : le candidat est assemblé par une commande locale explicite et reproductible. Aucun push,
merge, déploiement ou basculement de production n'a été réalisé.

Le critère `brand-authority-adoption` reste `pending` : il exige une fusion sous signature
propriétaire, des SHA aval publics revus et les deux validations du signe. Le passer maintenant serait
une fausse preuve.
