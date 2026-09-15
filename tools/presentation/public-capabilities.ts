import { loadPublication, type PublicationSelection } from "../../portfolio/publication-input";
import { renderReadmeFacts } from "../../portfolio/render-readme-facts";
import { loadCatalog } from "../../portfolio/validate-repositories";

// Existing delimiters remain a document-editing protocol, not card authority.
export const STATUS_SECTION_BEGIN = "<!-- libre-ai:project-status:begin -->";
export const STATUS_SECTION_END = "<!-- libre-ai:project-status:end -->";
export interface PublicFacts {
  schemaVersion: "readme-facts.v1";
  repositories: { slug: string; en: string; fr: string }[];
}
export function buildPublicFacts(selection: PublicationSelection): PublicFacts {
  return {
    schemaVersion: "readme-facts.v1",
    repositories: selection.contracts.map((contract) => ({
      slug: contract.slug,
      en: renderReadmeFacts(contract, "en", selection.authorities.get(contract.slug)),
      fr: renderReadmeFacts(contract, "fr", selection.authorities.get(contract.slug)),
    })),
  };
}
export async function readPublicSelection(
  args: readonly string[] = process.argv.slice(2),
): Promise<PublicationSelection> {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key || !value || !["--catalog", "--policy", "--receipts"].includes(key) || flags.has(key))
      throw new Error("public-input-blocked");
    flags.set(key, value);
  }
  const catalog = await loadCatalog(flags.get("--catalog"));
  if (catalog.errors.length) throw new Error("public-input-blocked");
  return await loadPublication(catalog.contracts, flags.get("--policy"), flags.get("--receipts"));
}
