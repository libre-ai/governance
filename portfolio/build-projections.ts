import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { loadPublication } from "./publication-input";
import { buildGitHubMetadata } from "./render-github-metadata";
import { renderNextProofs } from "./render-next-proofs";
import { buildPreviewInputs } from "./render-preview-inputs";
import { renderReadmeFacts } from "./render-readme-facts";
import { loadCatalog } from "./validate-repositories";

async function projectionBytes(
  catalogPath?: string,
  policyPath?: string,
  receiptsPath?: string,
): Promise<{ files: Map<string, string>; admitted: number }> {
  const result = await loadCatalog(catalogPath);
  if (result.errors.length) throw new Error("invalid-catalog");
  const publication = await loadPublication(result.contracts, policyPath, receiptsPath);
  const { contracts, authorities } = publication;
  const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
  return {
    admitted: contracts.length,
    files: new Map([
      [
        "portfolio/projections/readme-facts.v1.json",
        json({
          schemaVersion: "readme-facts.v1",
          repositories: contracts.map((contract) => ({
            slug: contract.slug,
            en: renderReadmeFacts(contract, "en", authorities.get(contract.slug)),
            fr: renderReadmeFacts(contract, "fr", authorities.get(contract.slug)),
          })),
        }),
      ],
      [
        "portfolio/projections/github-metadata.v1.json",
        json({
          schemaVersion: "github-metadata.v1",
          repositories: buildGitHubMetadata(contracts, authorities),
        }),
      ],
      [
        "portfolio/projections/preview-inputs.v1.json",
        json({
          schemaVersion: "preview-inputs.v1",
          repositories: buildPreviewInputs(contracts, authorities),
        }),
      ],
      [
        "portfolio/projections/candidate-facts.v1.yaml",
        json({
          schemaVersion: "candidate-facts.v1",
          publication: "withheld",
          reason: "planning-records-are-not-publication-authority",
          repositories: result.contracts,
        }),
      ],
      ["docs/what-we-are-proving-next.md", renderNextProofs(contracts, authorities)],
    ]),
  };
}
if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    let check = false;
    let outputRoot = resolve(import.meta.dir, "..");
    const inputs = new Map<string, string>();
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--check" && !check) check = true;
      else if (args[i] === "--output-root" && args[i + 1]) {
        outputRoot = resolve(args[i + 1] ?? "");
        i++;
      } else if (
        ["--catalog", "--policy", "--receipts"].includes(args[i] ?? "") &&
        args[i + 1] &&
        !inputs.has(args[i] ?? "")
      ) {
        inputs.set(args[i] ?? "", args[i + 1] ?? "");
        i++;
      } else throw new Error("usage");
    }
    const { files, admitted } = await projectionBytes(
      inputs.get("--catalog"),
      inputs.get("--policy"),
      inputs.get("--receipts"),
    );
    for (const [path, bytes] of files) {
      const target = join(outputRoot, path);
      if (check) {
        if ((await readFile(target, "utf8")) !== bytes) throw new Error("drift");
      } else {
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, bytes);
      }
    }
    console.log(
      `PORTFOLIO PROJECTIONS: files=${files.size} public=${admitted} publication=${admitted ? "receipt-verified-subset" : "withheld"}`,
    );
  } catch {
    console.error("portfolio-projections-blocked");
    process.exitCode = 1;
  }
}
