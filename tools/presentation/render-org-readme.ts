import type { PublicationSelection } from "../../portfolio/publication-input";
import {
  buildPublicFacts,
  readPublicSelection,
  STATUS_SECTION_BEGIN,
  STATUS_SECTION_END,
} from "./public-capabilities";
export function renderOrgSection(
  selection: PublicationSelection,
  locale: "en" | "fr" = "en",
): string {
  const facts = buildPublicFacts(selection);
  // An unqualified catalog must never become an automatic empty-profile heal.
  if (facts.repositories.length === 0) throw new Error("public-evidence-required");
  return [
    STATUS_SECTION_BEGIN,
    "",
    ...facts.repositories.map((row) => row[locale].replace(/^# /, "## ").trimEnd()),
    "",
    STATUS_SECTION_END,
  ].join("\n");
}
if (import.meta.main) {
  try {
    console.log(renderOrgSection(await readPublicSelection()));
  } catch {
    console.error("public-presentation-blocked");
    process.exitCode = 1;
  }
}
