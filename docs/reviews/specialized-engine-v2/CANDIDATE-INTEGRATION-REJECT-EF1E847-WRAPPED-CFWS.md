# Candidate-integration rejection — ef1e847

- Verdict: `REJECT candidate-integration`
- Finding: `ENGENV-EF1-BLK-001`
- Immutable target: `ef1e84730e6881f539f25a6f9e78385320869df1`
- Review pass: `engine-envelope-main-ef1-cfws-integration`
- Session: `019f70f6-d11d-72d5-a2af-6f7c6dfbc9b7`
- Provider/model: `openai-codex/gpt-5.4` (`xhigh`)
- Raw reviewer-output SHA-256: `94db9387f278129cc71b78343ca0beb77286b8ea3ab1e1f52424539f3e638187`
- Effect: add a linear wrapper-preserving CFWS projection that honors nested comment escapes

## Verbatim reviewer output

Conclusion: HEAD `ef1e84730e6881f539f25a6f9e78385320869df1` est propre avant/après (`git status --short --branch` → `## HEAD (no branch)`), Bun est bien épinglé (`packageManager bun@1.4.0-canary.1`, `bun --revision` `1.4.0-canary.1+57f349f63`), et toutes les gates repo passent. Mais je trouve encore un blocage réel dans le scanner partagé après `b905`.

**Finding durable — `ENGENV-EF1-BLK-001`**
- `tools/quality/public-source-scanner.ts:106-137` + `:335-353`
- Le scanner ne couvre toujours pas les emails RFC avec CFWS imbriqué quand **tout l’identifiant** est entouré par des parenthèses ou des guillemets prose.
- Cause observée :
  - la passe brute échoue dès que `@` est précédé d’une fermeture de commentaire ;
  - `removeEmailComments()` supprime entièrement un wrapper parenthésé global ;
  - et, dans un wrapper guillemeté global, elle ne projette jamais une vue “wrapper conservé + CFWS interne retiré”.
- Résultat : faux négatifs confirmés sur **13/13** cas directs et **26/26** cas gate réel (valeur + clé).

**Cas bloquants reproduits**
- direct : `(alice (comment) @ example.org)`
- commentaires imbriqués + `\(` / `\)` + parité backslash : `(alice (outer(inner\\)x\\(y) tail) @ example.org)`, `(alice (outer(inner\\\\) tail) @ example.org)`
- whole-quoted : `"alice (comment) @ example.org"`, `"alice (outer(inner\\)x\\(y) tail) @ example.org"`
- encodés : `%28alice%20%28comment%29%20%40%20example.org%29`, `&quot;alice (comment) &commat; example&period;org&quot;`
- EAI : `(😀 (comment) @ example.org)`, `"😀 (comment) @ example.org"`
- IDN : `(alice (comment) @ example.орг)`, `"alice (comment) @ example.орг"`
- IP literal : `(alice (comment) @ [IPv6:2001:db8::1])`, `"alice (comment) @ [IPv6:2001:db8::1]"`
- Tous passent à tort :
  - direct scanner → `containsSensitivePublicMarker(...) === false`
  - gate réel `bun tools/quality/check-contracts.ts` → `exitCode 0` en **value** et en **key**.

**Contrôles rerun**
- Rejet correct confirmé, en valeur et en clé : parenthesized simple, CFWS non enveloppé, EAI direct, IDN direct, IPv6 direct, `ssh://...` userinfo, userinfo encodé, DSA/OpenPGP/Encrypted key markers.
- Préservation correcte confirmée : `release@2`, `R&D`, `foo"alice@example.org"`, `unknown:alice@example.org`, `alice@ example.org`.
- Donc pas de régression visible sur `b905` côté userinfo/credentials/prior controls ; le blocage restant est bien la famille **wrapped CFWS**.

**Bornes / erreurs**
- Rejets indépendants confirmés :
  - fichier `> 8 MiB`
  - chaîne `65537` code points
  - clé `129` code points
  - tableau `4097`
  - objet `513` propriétés
- Les erreurs sensibles restent non réfléchissantes : `specialized vector contains a forbidden sensitive marker`.

**Gates / autorité**
- `bun install --frozen-lockfile` ✅
- `bun run check` ✅ (`235 pass`, `48` projections, `71` entrées catalogue)
- `bun audit` ✅
- `cargo fmt --all --check` ✅
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` ✅
- `cargo test --workspace --all-features` ✅
- build/import-check WASM Notebook ✅
- `cargo deny check advisories licenses sources` ✅
- Dérive d’autorité : aucune dérive normative observée ; `da99d31..ef1e847` est borné à 7 fichiers, pas de changement schéma/catalogue/corpus/projections. Le catalogue contient toujours **un seul** candidat : `engine-golden-vectors-v1`.

**Hashes durables**
- patch `da99d31..ef1e847` / `b905` : `95ebb519bf16840780daefec4de005caa11e675af67737b33c32fd2680dc4d19`
- `tools/quality/public-source-scanner.ts` : `f37e28f6cd36563452ab2267de0585c7f3b496770cd5c88218139ef7383bf352`
- `tools/quality/check-contracts.ts` : `e990c6126a251bb2e845f972c6a4ae25cc669b7c80ee6a27b5a16f2dc8ad802a`
- `docs/reviews/specialized-engine-v2/README.md` : `246fd36c6e24986ae4f399644e3d76a8e3015fd569892fddcdd40daac379f5d0`
- `docs/reviews/specialized-engine-v2/REMEDIATION.md` : `4cc2e95d46d5f04673ee16fbda31391611e3d41e6d2236c8ea611e8bacfed438`
- `docs/reviews/specialized-engine-v2/DEPENDENCY-QUALIFICATION-ENTITIES.md` : `6b01ff7a92f21593f2ca76f0ee3c12e9c8a525adbc07e1d373273140f534a7ae`
- `docs/reviews/specialized-engine-v2/CANDIDATE-INTEGRATION-DA99D31.md` : `2ba341861845547dfca48b2b2f3361b78140aa8b2f6863cb1a225ef48af3a7b5`
- `docs/reviews/specialized-engine-v2/ARCHITECTURE-VERDICT-DA99D31.md` : `cf988cbcfdb789a9f2d32555e0265919fa74a3c2f98eadac593138ca0add9825`
- `docs/reviews/specialized-engine-v2/SECURITY-VERDICT-DA99D31.md` : `6e885aebf4d1342ea4937da2b7ab9ed4f0ccef4ad187a005b6f2cfdea0c7b922`
- preflight log : `/tmp/engine-envelope-ef1/preflight.log` → `b4ba954e537f4c3daa560aae5797ac328049584d2e9bcd2b47dca514b50657a5`
- bun check log : `/tmp/engine-envelope-ef1/bun-check.log` → `4d730233ce58d196d7af56263f8133fd89fac69f33d06a5250fca577d8ae1bfc`
- cargo test log : `/tmp/engine-envelope-ef1/cargo-test.log` → `c8316671269f501e9588937c711b69bc6fb25184d8112f1c1a82027a2b6fb486`
- direct probes : `/tmp/engine-envelope-ef1/direct-probes.json` → `ffe049b84d5d71e726fbdd58aac69262e96c2d2639ef85dd623cce28a521cf9a`
- actual gate probes : `/tmp/engine-envelope-ef1/gate-probes.json` → `4c22b94c8d830618706b9fabd6789b888449379960b9257c9cf6cb0824392676`
- bounds probes : `/tmp/engine-envelope-ef1/bounds-results.json` → `ed5e1bce2efcd811441e4a2140f237c7d857f38587da10d9535a2bca0ed57048`
- history log : `/tmp/engine-envelope-ef1/history.log` → `fc9af6dda24056c21bc96dc1730e37881dc5455b1fd6bf64f583ce1f0e2a388d`
- clean-state log : `/tmp/engine-envelope-ef1/clean-state.log` → `80974d405576da564dcf6b2342364eb4ed12be5d66589318c1cf49398b048f89`

REJECT candidate-integration — wrapped RFC CFWS email identifiers still bypass the actual shared gate in whole-parenthesized and whole-quoted contexts across direct/encoded/EAI/IDN/IP forms and payload values/keys
