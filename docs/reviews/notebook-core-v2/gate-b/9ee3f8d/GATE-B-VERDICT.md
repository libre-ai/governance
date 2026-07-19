# Notebook Core v2 — verdict final Gate B

- `reviewPassId` : `notebook-core-v2-gate-b-synthesis-9ee3f8d-06`
- mode : `review-only`, synthèse Gate B
- date : `2026-07-18`
- commit revu : `9ee3f8da65afce9bce8da98baac72c1aea8bd0ce`
- arbre : `843a95252eb60f08fdc596a20bcbcd19a0b1b4fd`
- base : `895c749df676bf46bc85ee556680025b55c028ff`
- agent/session/provider/modèle : non exposés par le harness

## Décisions de portée

- ADR-0006/D26 : seule la classe macOS arm64 physique 32+ Gio est requise ; 8/16–24 Gio restent facultatives et non supportées.
- ADR-0007/D27 : l'OOM réel du processus navigateur est un diagnostic facultatif ; la reprise bornée après terminaison/crash reste obligatoire et l'épuisement global de l'hôte est interdit.
- Aucun budget, paramètre Argon2id/AES-GCM, plafond WASM ou limite plaintext n'est modifié.

## Verdicts spécialisés liés au candidat

| Rôle | Rapport | SHA-256 | Verdict |
|---|---|---|---|
| architecture-host | `ARCHITECTURE-HOST.md` | `9f8582f490bba1fc394afbd75fc3b0ab23efcc3b2bde6ba0ea8649da861290cc` | approve |
| security | `SECURITY.md` | `093cdd111993eff4876fd501ab57cf9ad896741a223d5b2b6db51425032fcba2` | approve |
| cryptography-runtime | `CRYPTOGRAPHY-RUNTIME.md` | `b1c14f825e4180f0cff1564b0ca0e432558a80c022fafb390e64666dc7152fb9` | approve |
| privacy-france-eu | `PRIVACY-FRANCE-EU.md` | `54cce6571bdd439fc0686a5d2bde20b6f5f15fc5de45828c0f83df78bd640ab4` | approve |
| performance-resource-classes | `PERFORMANCE-RESOURCE-CLASSES.md` | `1554eb45f336187156ee221846521196e2ff236f6a55a8c730f91cac6a45fc3b` | approve |

## Critères de sortie

- composant Rust/WASM import-free, SIMD128, plafond 512 Mio et builds reproductibles : satisfaits ;
- host produit exact désactivé, worker/instance jetables et erreurs fermées : satisfaits ;
- E2E produit trois moteurs, no-JS et staging interrompu : 7/7 ;
- fautes internes : 6/6 ; fautes processus/quota produit : 6/6 ;
- vrai APFS `ENOSPC`, même profil et reprise après libération : 3/3 ;
- classe physique 32+ Gio, deux warm-ups + 20 mesures, trois moteurs, budgets p95/RSS : `qualification-budgets-pass` ;
- package hors ligne exact réextrait dans un HOME/cache vierges : satisfait ;
- audit Bun, Rust/cargo-deny, REUSE, source policy et absence de PII : satisfaits ;
- toutes les preuves rouges intermédiaires sont conservées et aucune n'est transformée en PASS.

## Findings

- blocking : aucun ;
- major : aucun ;
- minor : aucun.

## Limites persistantes

- support déclaré : macOS arm64 32+ Gio uniquement ;
- 8/16–24 Gio, autres OS/architectures et OOM processus restent des observations futures ;
- zéroïsation physique, offline/Service Worker, modèle blocs/révisions, import atomique et suppression ne sont pas couverts par cette Gate B fixture-only ;
- cette décision n'active pas la feature et n'autorise aucune donnée utilisateur, production, release, infrastructure ou nouveau moteur produit. Ces jalons exigent un contrôle propriétaire séparé.

**GATE B: APPROVE**
