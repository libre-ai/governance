# Gate B — revue SECURITY — Notebook Core v2

## Attribution

- `reviewPassId` : `notebook-core-v2-gate-b-security-bfc9e4c-02`
- rôle : `security`
- mode : passe `review-only`
- date : `2026-07-18`
- commit : `bfc9e4c77082528889ea953cc941a5312edc9b8f`
- arbre : `2da08f9af377d1789ef90394f482c00f245e9f73`
- identifiants agent/session/provider/modèle : non exposés par le harness

Aucune modification n'a été effectuée pendant la passe.

## Surface examinée

Le delta ne touche ni entrée utilisateur, crypto, CSP, réseau, IndexedDB produit, protocole worker, téléchargement ou route serveur. Il change uniquement la gouvernance et la validation fail-closed des classes matérielles.

Preuves exactes :

- `bun run check` : 387 tests / 956 assertions ; audit sans vulnérabilité ;
- produit 7/7, core/faults 6/6, faults produit 6/6, `ENOSPC` 3/3 ;
- manifeste produit SHA-256 `8b66cd06631b5ae0c4578bda7659aa1455a14d7b6abae5d7045f72995cf51d7b`, feature `gate-b`, core `be423962…5942`, worker `19054f49…b9a` ;
- builds désactivé/activé fermés et reconstruction activée byte-identique ;
- aucune requête externe, donnée utilisateur, secret ou télémétrie dans les preuves.

## Contrôles

1. **Fail-closed ressource.** Statuts et finalités sont des unions fermées ; un minimum communautaire ou un champ inconnu est refusé.
2. **Aucun waiver de sécurité.** L'ADR-0006 modifie uniquement la portée de support matériel. OOM, activation, données utilisateur, production, offline et effacement physique restent séparément interdits.
3. **Diagnostic OOM borné.** Chromium a émis `V8 javascript OOM` sur un renderer identifié avec cap moteur 32 Mio, watchdog non déclenché et reprise vérifiée. Le rapport porte `promotableEvidence:false`; le mécanisme n'est ni livré ni renommé en preuve Gate B.
4. **Bootstrap.** Le bundle hors ligne contient seulement des archives publiques vérifiées. Les routes CDN Playwright non européennes sont déclarées comme exception ponctuelle ; aucune donnée runtime ne leur est envoyée.
5. **Fautes non shipping.** Les artefacts trap/internal et le diagnostic OOM restent hors build produit.

## Findings

- blocking sécurité : aucun ;
- major : aucun ;
- minor : aucun.

## Risques résiduels

Le mécanisme OOM attribuable n'est pas démontré sur Firefox/WebKit ni sans limite logicielle. Il reste un risque de disponibilité, pas une autorisation de relâcher les bornes ou de lancer une saturation globale.

**VERDICT: approve**
