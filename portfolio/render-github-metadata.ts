import type { PublicationAuthority } from "./publication-authority";
import { assertPublication } from "./publication-authority";
import type { RepositoryContractV1 } from "./repository-contract";
export interface GitHubRepositoryMetadata {
  slug: string;
  description: string;
  topics: string[];
  homepage?: string;
}
export function buildGitHubMetadata(
  contracts: RepositoryContractV1[],
  authorities: ReadonlyMap<string, PublicationAuthority> = new Map(),
): GitHubRepositoryMetadata[] {
  return [...contracts]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((contract) => {
      assertPublication(contract, authorities.get(contract.slug));
      return {
        slug: contract.slug,
        description: contract.benefit.en,
        topics: [...contract.topics].sort(),
        ...(contract.homepage ? { homepage: contract.homepage.url } : {}),
      };
    });
}
