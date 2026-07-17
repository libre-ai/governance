# Revue agentique du format de vecteurs des moteurs spécialisés

Statut de cette branche de promotion : `locked contract meaning / NO-GO product-runtime-data-release`.

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

La remédiation linéaire sur `9e74bab` a fermé ces deux points, mais sa passe d'intégration a trouvé
les préfixes legacy `&amp` sans point-virgule devant un alias nommé. Ce cinquième rejet est conservé
dans [`CANDIDATE-INTEGRATION-REJECT-9E74BAB.md`](CANDIDATE-INTEGRATION-REJECT-9E74BAB.md), SHA-256
`e27011a3f008bac8518e7cce83641530a05cb346cd6df3e1081e8aa8383b8432`.

Des passes parallèles sur le merge `79d02b6` sont également conservées : candidate-integration
`approve` ([`CANDIDATE-INTEGRATION-79D02.md`](CANDIDATE-INTEGRATION-79D02.md),
`bd2b9af3136ba6b124e9dfbeeddee67af75c3735529730008f5116bdda2b253a`), Architecture `approve`
([`ARCHITECTURE-VERDICT-79D02.md`](ARCHITECTURE-VERDICT-79D02.md),
`74725a31d7a3323d32f3b17a5e84a90fd5497fd352edc493b981f1e551ec6a42`) et Security `reject` pour
les local-parts RFC entre guillemets ([`SECURITY-VERDICT-79D02.md`](SECURITY-VERDICT-79D02.md),
`442fc6009a56c930143e2704fdddf2a4a37f0f1e24bb5ee95d08708bdcd6bc13`). Le rejet Security gouverne ;
les deux approbations ne sont pas citables pour promotion.

La remédiation sur `a4e74a6` a fermé les local-parts quoted, domaines literals et chaînes `&amp`, mais
sa passe d'intégration a rejeté le décodage non-HTML5 de noms sans point-virgule comme `&commat`.
Ce sixième rejet est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-A4E74A6.md`](CANDIDATE-INTEGRATION-REJECT-A4E74A6.md), SHA-256
`b55a0e87af9841dcc2081091c00aa277c342b817e798be60a20e14d416b9e2bc`.

La passe sur `453b0a6` n'a trouvé aucun blocage source et a validé 32/32 aliases directs, wrappers
legacy et contrôles littéraux, mais elle a dû rejeter l'intégration car son environnement exposait Bun
`1.3.11` au lieu du toolchain qualifié. Ce septième rejet est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-453B0A6.md`](CANDIDATE-INTEGRATION-REJECT-453B0A6.md), SHA-256
`116a09b818bc33a8cc37b649a74040f9d35ebe3d14c010212e0d6f28c3813c58`.

Le merge parallèle `1523bcd` a fermé les chaînes quoted et legacy alors connues. Sa passe
d'intégration stricte a cependant rejeté les bypass EAI/IDN/CFWS et les faux positifs sur dot-atoms,
domaines et casse HTML5 non valides. Le record est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-1523BCD.md`](CANDIDATE-INTEGRATION-REJECT-1523BCD.md), SHA-256
`9f401d8d3caad8dbe9df2abbc784b54738001cb1292ddfeb4467fa4cca379206`.

Le merge `26ac8fe` a introduit le décodeur HTML5 exact et le parseur borné. Sa passe d'intégration a
rejeté une dernière restriction de catégorie Unicode : RFC 6532 autorise tout scalaire
`UTF8-non-ascii`, y compris private-use, C1 et default-ignorable. Le record est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-26AC8FE.md`](CANDIDATE-INTEGRATION-REJECT-26AC8FE.md), SHA-256
`97e3ac0a293a98631ab609c89955f394bc36f1d75a1d729845de06c3ab70a1b3`.

Le merge `77a4b1d` a fermé cette restriction EAI. Sa passe d'intégration a ensuite rejeté quatre bornes
de contexte : NFKC transformait des séparateurs non ASCII en CFWS, des suffixes après ponctuation
invalide devenaient des emails, les parenthèses engloutissaient un identifiant complet et les points
terminaux restaient attachés au domaine. Le record est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-77A4B1D.md`](CANDIDATE-INTEGRATION-REJECT-77A4B1D.md), SHA-256
`2fb75ab696ed0ee21682a54a382d431008239afe547fd19f9d0bfe7bfe6ea8a3`.

Le merge `6ee4627` a fermé ces quatre bornes. Sa passe d'intégration a encore rejeté les emails de
prose entourés de guillemets ASCII et les labels collés tels que `contact:alice@example.org`. Le
record est conservé dans
[`CANDIDATE-INTEGRATION-REJECT-6EE4627.md`](CANDIDATE-INTEGRATION-REJECT-6EE4627.md), SHA-256
`72c470ba92e514415df3b7a92790c55e1a5dae82597ab1c02b657cb73248f247`.

Le merge `0a265ce` a fermé ces deux formes de prose. Sa passe d'intégration a trouvé que la parité des
guillemets classait encore `foo\"alice@example.org\"` comme citation ouvrante. Le record est conservé
dans [`CANDIDATE-INTEGRATION-REJECT-0A265CE.md`](CANDIDATE-INTEGRATION-REJECT-0A265CE.md), SHA-256
`50e47d7f2eb6134f007dbf5fcf0329e874841747200095d698ab201365c1b5c2`.

Sur le merge `da99d31`, candidate-integration a approuvé
([`CANDIDATE-INTEGRATION-DA99D31.md`](CANDIDATE-INTEGRATION-DA99D31.md), SHA-256
`2ba341861845547dfca48b2b2f3361b78140aa8b2f6863cb1a225ef48af3a7b5`) et Architecture a approuvé
avec réserve documentaire ([`ARCHITECTURE-VERDICT-DA99D31.md`](ARCHITECTURE-VERDICT-DA99D31.md),
SHA-256 `cf988cbcfdb789a9f2d32555e0265919fa74a3c2f98eadac593138ca0add9825`). Security a toutefois
rejeté les userinfo `ssh://`/`git://` et les en-têtes privés DSA/OpenPGP
([`SECURITY-VERDICT-DA99D31.md`](SECURITY-VERDICT-DA99D31.md), SHA-256
`6e885aebf4d1342ea4937da2b7ab9ed4f0ccef4ad187a005b6f2cfdea0c7b922`) ; ce rejet gouverne et rend
les deux approbations stale après remédiation.

Le merge `ef1e847` a fermé les constats userinfo/credentials dans le gate réel, mais deux passes
candidate-integration indépendantes ont trouvé des blocages distincts :

- le pattern `metadataString` du schéma canonique acceptait encore DSA, OpenPGP et PKCS#8 chiffré en
  validation schema-only
  ([`CANDIDATE-INTEGRATION-REJECT-EF1E847.md`](CANDIDATE-INTEGRATION-REJECT-EF1E847.md), SHA-256
  `12ecbf1bd2b0f0add59588fd21e49bbdcd676a01a4b69cd46ceb113104c19b22`) ;
- les adresses CFWS entièrement parenthésées ou quoted contournaient le scanner parce que la
  projection RFC supprimait le wrapper complet ou conservait ses commentaires internes
  ([`CANDIDATE-INTEGRATION-REJECT-EF1E847-WRAPPED-CFWS.md`](CANDIDATE-INTEGRATION-REJECT-EF1E847-WRAPPED-CFWS.md),
  SHA-256 `d0092e478af43e386a8952dac3c199a619b228baa8bc02fa40e0117fb9803d0b`).

Le merge `cea7363` a aligné le schéma. Candidate-integration a ensuite approuvé
([`CANDIDATE-INTEGRATION-CEA7363.md`](CANDIDATE-INTEGRATION-CEA7363.md), SHA-256
`7f492b1806091b7c74c20e46eab8ce66bf5410a9ac56900ad554cfb374958061`) et Architecture a approuvé
avec deux réserves d'audit ([`ARCHITECTURE-VERDICT-CEA7363.md`](ARCHITECTURE-VERDICT-CEA7363.md),
SHA-256 `0006071a17692cfc295aa706a8645668df63a96ec243fe6d6f134b66e4cd2433`). Security a rejeté le tag
IPv6 sensible à la casse et les chemins metadata contournant la politique par NFKC/default-ignorable
([`SECURITY-VERDICT-CEA7363.md`](SECURITY-VERDICT-CEA7363.md), SHA-256
`64b3ea80000d9eac39c23ca8d5a4f656373d877e1cec68d5d04feabd2e3c16c8`). Ce rejet gouverne ; les
deux approbations sont stale.

PR #81 a intégré les projections wrapped-CFWS après candidate-integration favorable sur sa tête
exacte `bec32a7bedb349bad4c3c58afbc878b995d00db8`
([`CANDIDATE-INTEGRATION-BEC32A7.md`](CANDIDATE-INTEGRATION-BEC32A7.md), SHA-256
`6aadfbab59d20003d18c5144b2067ac66e32444b8b449a91262338be6de25695`). PR #82 a persisté ce
record sans modifier le scanner. Cette preuve wrapped-CFWS devient elle aussi stale dès que la
remédiation combinée change le scanner ou le schéma.

La remédiation combinée traite le tag RFC `IPv6:` sans distinction de casse et ferme le sous-espace
metadata en ASCII, donc sous NFKC et retrait des default-ignorables, tout en laissant les payloads
moteur Unicode et opaques. Les fixtures couvrent les chemins NFKC/default-ignorable ; les
représentations encodées et les clés JSON utilisent le même gate. `entities@8.0.0` est qualifié
BSD-2-Clause, dev-only et sans transitive, puis accepté explicitement par l'owner après challenge
([`OWNER-ACCEPTANCE-ENTITIES.md`](OWNER-ACCEPTANCE-ENTITIES.md), SHA-256
`0258b4bc9a42950d0488cad8e4ef857384d8f1cf0f09effe1c83d0790227c005`). L'écart de
chronologie de PR #80 reste historique, sans autorisation rétroactive.

Candidate-integration a approuvé le merge exact `ccf9d684d9a43ad7236bec905e701e155520e2d6`
([`CANDIDATE-INTEGRATION-CCF9D68.md`](CANDIDATE-INTEGRATION-CCF9D68.md), SHA-256
`62d59e751efbe0144d779b3497e55d7494a9d36b5b5ebadc1c22ce69d02ffc4f`). Sur ce même SHA,
Architecture approuve avec une réserve documentaire désormais réconciliée
([`ARCHITECTURE-VERDICT-CCF9D68.md`](ARCHITECTURE-VERDICT-CCF9D68.md), SHA-256
`99d5887946a1ae23cc11cc14dd5244a61c46b6635aeba86f3a402e4abd5b5edb`) et Security approuve sans
constat bloquant ([`SECURITY-VERDICT-CCF9D68.md`](SECURITY-VERDICT-CCF9D68.md), SHA-256
`e4e9910c4872206a9762f580f538a4bd76fc885ca051562873151b437e066cfb`).

L'avancement ultérieur de `main` par PR #84/#87 ne touche que la qualification Notebook Gate B,
tandis que PR #85/#86 persistent les preuves de cette autorité ; ses hashes
schéma/scanner/catalogue/corpus/WIT restent byte-identical. Les trois rôles gouvernent donc les mêmes
octets d'autorité. Ils ne valent ni promotion ni autorisation produit/runtime/data/release.

## Promotion catalog-only

Le [`PROMOTION-PACKAGE.md`](PROMOTION-PACKAGE.md) porte l'unique transition
`engine-golden-vectors-v1: candidate → locked`. La passe distincte
[`PROMOTION-VERDICT.md`](PROMOTION-VERDICT.md), SHA-256
`52c49f47636945fac7b9314ce1be45ddb394d78ea5bdc6f4b685673d223619a1`, approuve le commit de
promotion immuable `3b47e966`. Le contrôle owner final `continue` est enregistré sur PR #89 avec
refus automatique de toute dérive d'autorité ou de dépendance. La fusion reste conditionnée aux
checks finaux verts.

Les preuves et verdicts suivent [`../AGENT-REVIEW-PROTOCOL.md`](../AGENT-REVIEW-PROTOCOL.md).
`locked` fixera seulement le sens du contrat : aucun moteur, scoring public, traitement de données
réelles, capability, release, infrastructure ou déploiement n'est autorisé.
