import type { PublicationAuthority } from "./publication-authority";
import { assertPublication } from "./publication-authority";
import type { RepositoryContractV1 } from "./repository-contract";
export interface SocialPreviewInput {
  slug: string;
  name: string;
  benefit: { en: string; fr: string };
  category: string;
}
export function buildPreviewInputs(
  contracts: RepositoryContractV1[],
  authorities: ReadonlyMap<string, PublicationAuthority> = new Map(),
): SocialPreviewInput[] {
  return [...contracts]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((contract) => {
      assertPublication(contract, authorities.get(contract.slug));
      return {
        slug: contract.slug,
        name: contract.displayName,
        benefit: { ...contract.benefit },
        category: contract.category,
      };
    });
}
