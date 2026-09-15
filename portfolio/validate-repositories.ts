import { loadPublication, readBoundedJson } from "./publication-input";
import type { ValidationResult } from "./repository-contract";
import { validateRepositoryContracts } from "./repository-contract";
export async function loadCatalog(path?: string): Promise<ValidationResult> {
  return validateRepositoryContracts(
    await readBoundedJson(path ?? new URL("./repositories.v1.yaml", import.meta.url)),
  );
}
if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    let mode: string | undefined;
    const inputs = new Map<string, string>();
    for (let i = 0; i < args.length; i++) {
      const arg = args[i] ?? "";
      if (["--planning", "--publication"].includes(arg) && !mode) mode = arg;
      else if (
        ["--catalog", "--policy", "--receipts"].includes(arg) &&
        args[i + 1] &&
        !inputs.has(arg)
      ) {
        inputs.set(arg, args[i + 1] ?? "");
        i++;
      } else throw new Error("usage");
    }
    if (!mode || (mode === "--planning" && (inputs.has("--policy") || inputs.has("--receipts"))))
      throw new Error("usage");
    const result = await loadCatalog(inputs.get("--catalog"));
    if (result.errors.length) throw new Error("blocked");
    if (mode === "--publication") {
      const publication = await loadPublication(
        result.contracts,
        inputs.get("--policy"),
        inputs.get("--receipts"),
      );
      if (!publication.contracts.length) throw new Error("blocked");
      console.log(`PORTFOLIO RECEIPTS: verified=${publication.contracts.length} scope=subset`);
    } else
      console.log(`PORTFOLIO CANDIDATE: planning=${result.contracts.length} publication=withheld`);
  } catch {
    console.error("portfolio-blocked");
    process.exitCode = 1;
  }
}
