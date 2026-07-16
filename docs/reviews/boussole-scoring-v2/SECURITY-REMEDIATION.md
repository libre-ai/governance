# Boussole scoring v2 — security remediation packet

Status: **ready for fresh security re-review / no approval**.

This packet answers the blocking findings in
[`SECURITY-VERDICT.md`](SECURITY-VERDICT.md). That rejected verdict remains an
immutable audit record until a distinct security review-only pass approves the
exact remediated commit and hashes.

## Finding coverage

| Finding | Executable remediation |
| --- | --- |
| `SEC-BLK-001` resolved WIT imports | `world.wit` exports one self-contained `api` interface. The Rust WIT gate resolves the package and requires `World.imports.is_empty()` plus one exported API. |
| `SEC-BLK-002` missing refusals/resources | `security-vectors.v1.json` covers eight byte-exact decoder/schema refusals, exact and ceiling+1 checks for all four byte budgets, all eight closed refusals, duplicate/reference mutations, private canary redaction and maximum arithmetic above `u64`. |
| `SEC-BLK-003` invalid calendar classification | The reference boundary validates real Gregorian UTC seconds before method/digest evaluation; `2025-02-30T12:00:00Z` now executes as `computed-at-invalid`. |

No Rust/WASM product engine is added. Built-component import scanning, runtime
memory/fuel behavior and browser zero-transmission evidence remain implementation
Gate B work.

## Re-review target

- security vectors: `3d343c5ea9c1c4804551f0a52e68082dd2882f0b0cfd61255990a96fbd798ec5`;
- WIT: `75b6a8c1b565e8b64ddd590b1ddc7a86f7b22d827cbdbc4e3a0e599dfce223ad`;
- semantics: `6076d8011a502ba8549818b44c7ba3b5250b01d711ed37476e8007bbb7dad593`;
- TypeScript checker: `95a553d895ba2888ef03dabb3e1d72ffc1278a3d0122a15cc2201f284deab3f5`;
- methodology vectors remain unchanged at `c6742b5a52691942fdea921712b3a0984efc8a3e1f33c8456d182de50270b232`;
- exact commit: to be recorded after integration.

The reviewer must rerun the raw, resource, semantic, redaction, arithmetic and
resolved-WIT evidence independently, report residual findings and issue an
explicit approve/reject verdict. Candidate status and public-scoring NO-GO remain.
