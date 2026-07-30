# governance

The governance authority of the [Libre AI](https://github.com/libre-ai)
constellation: doctrine, invariants, architecture decision records, the
LEXICON, the ecosystem index, the `project.v1` card schema and fleet
aggregator, ecosystem tooling, evidence, and the fleet gates.

Born from the hub dismantling (ADR-0020, general activation): history
carried by `git filter-repo` from `libre-ai/libre-ai`, which remains the
clonable archive. The `contracts` repository is the other authority.

## Verify

```sh
bun install --frozen-lockfile
bun run check
```

## État du projet

<!-- libre-ai:project-status:begin -->
<!-- Section générée depuis project.v1.yaml — ne pas éditer à la main. -->

- Situation actuelle : Née verte en γ 3.3 (375 commits d'histoire filtrée), autorité des décisions et de l'index ; ses gates de flotte surveillent inventaire, pins et dérive de migration en continu.
- Maturité : usable
- Exposition : usable-verifiable
- Confiance : medium
- Preuves vérifiées le : 2026-07-30
- Avancement : 50 % du périmètre actuellement déclaré

<!-- libre-ai:project-status:end -->

La fiche [`project.v1.yaml`](./project.v1.yaml) est l'autorité de l'état du projet ; cette section en est générée et le gate de flotte échoue si elles divergent.
