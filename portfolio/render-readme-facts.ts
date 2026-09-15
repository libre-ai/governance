import type { PublicationAuthority } from "./publication-authority";
import { assertPublication } from "./publication-authority";
import type { RepositoryContractV1 } from "./repository-contract";
export function escapeMarkdown(value: string): string {
  return value.replace(/([\\`*_{}[\]()#+.!|>-])/g, "\\$1");
}
export function renderReadmeFacts(
  contract: RepositoryContractV1,
  locale: "en" | "fr",
  authority?: PublicationAuthority,
): string {
  assertPublication(contract, authority);
  const text = (value: string) => escapeMarkdown(value);
  const lines = [
    `# ${text(contract.displayName)}`,
    "",
    text(contract.benefit[locale]),
    "",
    text(contract.audience[locale]),
    "",
    text(contract.differentiator[locale]),
    "",
    text(contract.outcome[locale]),
    "",
    text(contract.limitation[locale]),
    "",
  ];
  if (contract.action.url)
    lines.push(`[${text(contract.action.label[locale])}](<${contract.action.url}>)`);
  else {
    const command = contract.action.command ?? "";
    const longestRun = Math.max(0, ...[...command.matchAll(/`+/g)].map((match) => match[0].length));
    const fence = "`".repeat(Math.max(3, longestRun + 1));
    lines.push(text(contract.action.label[locale]), "", `${fence}sh`, command, fence);
  }
  for (const evidence of contract.evidence)
    lines.push(
      "",
      `[${text(evidence.label[locale])}](<${evidence.source}>)`,
      "",
      evidence.verifiedAt,
      "",
      `SHA-256: ${evidence.contentDigest}`,
      "",
      text(evidence.limitation[locale]),
    );
  if (contract.nextProof)
    lines.push(
      "",
      `[${locale === "en" ? "Next proof" : "Prochaine preuve"}](https://github.com/libre-ai/governance/blob/main/docs/what-we-are-proving-next.md)`,
    );
  return `${lines.join("\n")}\n`;
}
