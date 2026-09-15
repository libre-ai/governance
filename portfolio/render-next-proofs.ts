import type { PublicationAuthority } from "./publication-authority";
import { assertPublication } from "./publication-authority";
import { escapeMarkdown } from "./render-readme-facts";
import type { RepositoryContractV1 } from "./repository-contract";
export function renderNextProofs(
  contracts: RepositoryContractV1[],
  authorities: ReadonlyMap<string, PublicationAuthority> = new Map(),
): string {
  const lines = ["# What we're proving next", ""];
  for (const contract of [...contracts].sort((a, b) => a.slug.localeCompare(b.slug))) {
    assertPublication(contract, authorities.get(contract.slug));
    if (contract.nextProof)
      lines.push(
        `## ${escapeMarkdown(contract.displayName)}`,
        "",
        escapeMarkdown(contract.nextProof.capability.en),
        "",
        escapeMarkdown(contract.nextProof.capability.fr),
        "",
        escapeMarkdown(contract.nextProof.acceptance),
        "",
      );
  }
  if (contracts.length === 0)
    lines.push("No repository proof has been admitted for public projection.", "");
  return lines.join("\n");
}
