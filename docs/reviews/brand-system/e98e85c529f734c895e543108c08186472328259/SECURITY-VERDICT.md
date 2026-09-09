# Verdict sécurité — système de marque Libre AI

Date : 2026-09-09

Verdict : **PASS pour le candidat textuel et logiciel ; publication du signe figuratif bloquée**.

## Périmètre immuable

- Governance : `e98e85c529f734c895e543108c08186472328259`
- UI : `992b230664a36985feba9a9252eff480de11488b`
- Website : `4e55c1cbcc37e9b204d30c933ce626b6b5042b45`
- `.github` : `ed57094964d53ce585818e2347c1ef303a61f512`

## Contrôles examinés

1. Les claims absolus interdits sont recherchés dans les autorités française et anglaise. Une
   explication qui cite un claim pour l'interdire ne déclenche pas un faux positif.
2. La projection publique échoue fermée sur un schéma, une preuve, une date, une source ou un nom
   produit invalide. Les sources de preuve sont limitées à des URL HTTPS GitHub publiques.
3. Le rendu Website est statique, sans JavaScript client ni tracking. Une CSP restrictive interdit
   scripts, connexions, objets, frames, formulaires et assets distants ; le scanner couvre aussi les
   URL relatives au protocole (`//host`).
4. Les chaînes injectées dans le HTML sont échappées. Les gates secrets et données personnelles
   sont verts dans UI et Website.
5. Le SVG candidat est inert : trois chemins, aucun script, événement, style inline, filtre,
   gradient, lien ou ressource distante.
6. Les décisions propriétaire sont lues uniquement dans les métadonnées de tête. Les exemples
   d'acceptation présents dans un bloc de code ne peuvent plus libérer le signe.

## Contre-preuve de publication

`bun run check:brand-publication` échoue intentionnellement avec les deux motifs attendus :

```text
brand.asset_license_not_accepted
brand.asset_similarity_review_not_accepted
```

Le gate ne peut devenir vert qu'avec les deux contrôles indépendants exacts. Aucun commit, succès de
test ou silence d'un registre n'est interprété comme une acceptation.

## Limites et disposition

La revue de sécurité ne constitue ni une recherche d'antériorité ni une validation juridique. Les
requêtes interactives EUIPO, INPI et WIPO, leur capture reproductible, la comparaison visuelle nommée
et la décision propriétaire restent pendantes. Le signe figuratif doit donc rester absent des pages
publiques et des paquets publiés.

Rollback local : Governance `9e39b56889bc4620247f161ea8e854ddbaff09ca`, UI
`594a5dd8cbb791394714ee1eb46dec4dd629904d`, Website
`ca41cfe952b2d3f60c1aa4956574902558d4b29b`, `.github`
`2700b15860a9385657c944b3b8f28fcb5849af54`.
