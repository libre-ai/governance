/** The former fleet command now emits only verified portfolio facts to stdout. */
import { buildPublicFacts, readPublicSelection } from "../tools/presentation/public-capabilities";

if (import.meta.main) {
  try {
    console.log(JSON.stringify(buildPublicFacts(await readPublicSelection()), null, 2));
  } catch {
    console.error("public-presentation-blocked");
    process.exitCode = 1;
  }
}
