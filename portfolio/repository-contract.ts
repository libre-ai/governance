import { createHash } from "node:crypto";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readPortfolio } from "../tools/migration/source-freeze";
import schema from "./repository-contract.v1.schema.json";

export interface LocalizedText {
  en: string;
  fr: string;
}
export interface PublicEvidence {
  label: LocalizedText;
  source: string;
  contentDigest: string;
  verifiedAt: string;
  limitation: LocalizedText;
}
export interface RepositoryContractV1 {
  schemaVersion: "repository-contract.v1";
  slug: string;
  displayName: string;
  category: "use" | "build" | "trust" | "explore";
  benefit: LocalizedText;
  differentiator: LocalizedText;
  audience: LocalizedText;
  action: { label: LocalizedText; command?: string; url?: string };
  outcome: LocalizedText;
  limitation: LocalizedText;
  dependencies: string[];
  evidence: PublicEvidence[];
  topics: string[];
  homepage?: { url: string; smokeEvidence: string };
  nextProof?: { capability: LocalizedText; acceptance: string };
  admission: { kind: "certain" } | { kind: "conditional"; gate: string };
  proof: { kind: "pending" } | { kind: "evidence" };
}
export interface ValidationResult {
  errors: string[];
  contracts: RepositoryContractV1[];
}
const ajv = new Ajv({ strict: true });
addFormats(ajv);
const contractValidator = ajv.compile<RepositoryContractV1>(schema);
const catalogValidator = ajv.compile<{
  schemaVersion: string;
  repositories: unknown[];
  primaryCta: string;
  pinCandidates: string[];
  starCta: boolean;
}>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "repositories", "primaryCta", "pinCandidates", "starCta"],
  properties: {
    schemaVersion: { const: "repository-catalog.v1" },
    repositories: { type: "array", minItems: 20, maxItems: 20 },
    primaryCta: { const: "missions" },
    pinCandidates: { type: "array", maxItems: 6, uniqueItems: true, items: { type: "string" } },
    starCta: { const: false },
  },
});
const names: Record<string, string> = {
  ".github": "Libre AI",
  website: "Libre AI Website",
  missions: "Libre AI Missions",
  "ai-practice": "Libre AI Practice",
  "feed-radar": "Libre AI Radar",
  notebook: "Libre AI Notebook",
  "model-policy": "Libre AI Model Policy",
  sessions: "Libre AI Sessions",
  "app-kit": "Libre AI App Kit",
  contracts: "Libre AI Contracts",
  governance: "Libre AI Governance",
  "mission-control": "Libre AI Mission Control",
  "data-lifecycle": "Libre AI Data Lifecycle",
  "db-inspect": "Libre AI Database Inspector",
  "vote-mirror": "Libre AI Vote Mirror",
  "travel-planner": "Libre AI Travel Planner",
  "execution-guard": "Libre AI Execution Guard",
  authorization: "Libre AI Authorization",
  "artifact-proof": "Libre AI Artifact Proof",
  collaboration: "Libre AI Collaboration",
};
const unsafeText =
  /[<>\p{C}]|\b(?:(?:multi)?agent(?:s|ic|ique)?|active|specified|usable|phase|always|guaranteed|guarantee|unlimited|toujours|garanti|illimité)\b|\d\s*%/iu;
function validText(value: LocalizedText): boolean {
  const immutable = (text: string) =>
    [
      ...text.matchAll(
        /\bv?\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?\b|https:\/\/[^\s]+|\b[a-f0-9]{40,64}\b/g,
      ),
    ]
      .map((match) => match[0])
      .sort();
  return (
    [value.en, value.fr].every((text) => text.trim().length > 0 && !unsafeText.test(text)) &&
    JSON.stringify(immutable(value.en)) === JSON.stringify(immutable(value.fr))
  );
}
function safeHttps(value: string): boolean {
  if (/[<>\s\p{C}\\]/u.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function validateRepositoryContract(value: unknown): value is RepositoryContractV1 {
  if (!contractValidator(value)) return false;
  if (
    value.displayName !== names[value.slug] ||
    ![
      value.benefit,
      value.differentiator,
      value.audience,
      value.action.label,
      value.outcome,
      value.limitation,
      ...value.evidence.flatMap((e) => [e.label, e.limitation]),
      ...(value.nextProof ? [value.nextProof.capability] : []),
    ].every(validText)
  )
    return false;
  if (Boolean(value.action.command) === Boolean(value.action.url)) return false;
  const portfolio = readPortfolio();
  const roots = portfolio.sources
    .filter((source) => source.target === value.slug)
    .map((source) => `https://github.com/libre-ai/${source.source}`);
  if (
    value.action.url &&
    (!safeHttps(value.action.url) ||
      (value.proof.kind === "pending" && !roots.includes(value.action.url)))
  )
    return false;
  if (
    value.action.command &&
    (!value.action.command.trim() || /[\p{C}]/u.test(value.action.command))
  )
    return false;
  if (value.topics.some((topic) => unsafeText.test(topic))) return false;
  if (value.dependencies.includes(value.slug)) return false;
  const conditional = portfolio.conditionalTargets.includes(value.slug);
  if (
    (value.admission.kind === "conditional") !== conditional ||
    (value.admission.kind === "conditional" && value.admission.gate !== value.slug)
  )
    return false;
  if (
    value.proof.kind === "pending"
      ? value.evidence.length !== 0 || Boolean(value.homepage)
      : value.evidence.length === 0
  )
    return false;
  if (value.evidence.some((e) => !safeHttps(e.source))) return false;
  if (
    value.homepage &&
    (!safeHttps(value.homepage.url) ||
      !value.evidence.some((e) => e.source === value.homepage?.smokeEvidence))
  )
    return false;
  if (value.nextProof && unsafeText.test(value.nextProof.acceptance)) return false;
  return true;
}
export function validateRepositoryContracts(value: unknown): ValidationResult {
  if (!catalogValidator(value)) return { errors: ["invalid-catalog"], contracts: [] };
  if (!value.repositories.every(validateRepositoryContract))
    return { errors: ["invalid-contract"], contracts: [] };
  const contracts = value.repositories;
  const expected = [
    ...readPortfolio().certainTargets,
    ...readPortfolio().conditionalTargets,
  ].sort();
  if (JSON.stringify(contracts.map((c) => c.slug).sort()) !== JSON.stringify(expected))
    return { errors: ["invalid-topology"], contracts: [] };
  if (
    value.pinCandidates.some(
      (slug) => !contracts.some((c) => c.slug === slug && c.admission.kind === "certain"),
    )
  )
    return { errors: ["invalid-pins"], contracts: [] };
  return { errors: [], contracts: [...contracts].sort((a, b) => a.slug.localeCompare(b.slug)) };
}
export function contractDigest(contract: RepositoryContractV1): string {
  return createHash("sha256").update(JSON.stringify(contract)).digest("hex");
}
