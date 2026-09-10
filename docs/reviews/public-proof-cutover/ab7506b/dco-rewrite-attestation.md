# Public proof cutover — DCO-only rewrite attestation

- **reviewPassId:** `public-proof-dco-reattestation-ab7506b-20260910`
- **Role:** Integration and contribution governance
- **Rewritten head:** `ab7506bf67730b6f47e589295e3e41b9556e5fa1`
- **Original reviewed head:** `de743dc4a83ecfd9e15dbe52e3b70bad6105b182`
- **Mode:** immutable tree-identity attestation after failed DCO gate

## Cause

Pull request 101 failed the DCO gate because its three commits lacked an
author-matching `Signed-off-by` trailer. No content gate failed.

## Tree identity

| Original commit | DCO-signed commit | Tree |
| --- | --- | --- |
| `8b0eeb52b8be64264a7ee53ea8a4869f7fa53872` | `7596edf495b7c38e161875c531b95022e76235af` | `4978a36f46355f1f392eef0dd0b1ad2d182943ba` |
| `40eb7b69d0c314cc3e3c22944513a1221e8db77a` | `584b39c7f3b18ea423d97449858abf040ffdead7` | `85f4599fb35e7ae835cb3a4420541b99d33ce716` |
| `de743dc4a83ecfd9e15dbe52e3b70bad6105b182` | `ab7506bf67730b6f47e589295e3e41b9556e5fa1` | `f5b3af41f2587ba9937d242233045932aec9f741` |

Each pair has the exact same Git tree. Only the commit messages differ, adding
the required author-matching DCO trailer. The architecture, security/privacy,
quality/performance and completeness verdicts therefore apply byte-for-byte to
the rewritten candidates.

## Verdict

`approve`
