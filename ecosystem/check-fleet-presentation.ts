/** Public presentation checks use the same verified selection as its renderers. */
import { readBoundedJson } from "../portfolio/publication-input";
import {
  buildPublicFacts,
  type PublicFacts,
  readPublicSelection,
} from "../tools/presentation/public-capabilities";
export function checkPublicFacts(committed: unknown, expected: PublicFacts): string[] {
  return JSON.stringify(committed) === JSON.stringify(expected)
    ? []
    : ["portfolio-projection-drift"];
}
if (import.meta.main) {
  try {
    const expected = buildPublicFacts(await readPublicSelection());
    const committed = await readBoundedJson(
      new URL("../portfolio/projections/readme-facts.v1.json", import.meta.url),
    );
    if (checkPublicFacts(committed, expected).length) throw new Error("drift");
    console.log(
      JSON.stringify({
        verified: expected.repositories.length,
        withheld: expected.repositories.length === 0,
      }),
    );
  } catch {
    console.error("public-presentation-blocked");
    process.exitCode = 1;
  }
}
