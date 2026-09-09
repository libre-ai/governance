import {
  buildPublicBrandProjection,
  renderPublicBrandProjection,
} from "../../brand/build-public-projection";

export interface BrandDocuments {
  readonly french: string;
  readonly english: string;
  readonly proofMatrix: string;
  readonly projection: string;
  readonly trademarks: string;
  readonly authorityMap: string;
  readonly invariants: string;
  readonly decisions: string;
}

interface ForbiddenClaim {
  readonly label: string;
  readonly pattern: RegExp;
}

const forbiddenClaims: readonly ForbiddenClaim[] = [
  { label: "gratuit", pattern: /(?:^|[^\p{L}])gratuit(?:[^\p{L}]|$)/iu },
  {
    label: "plus complet que tous les concurrents",
    pattern: /plus complet que tous les concurrents/iu,
  },
  { label: "aucune dépendance", pattern: /aucune dépendance/iu },
  { label: "sécurité totale", pattern: /sécurité totale/iu },
  { label: "entièrement explicable", pattern: /entièrement explicable/iu },
  { label: "contrôle absolu", pattern: /contrôle absolu/iu },
];

function forbiddenClaimFindings(markdown: string): string[] {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length > 0);
  const findings: string[] = [];

  for (const paragraph of paragraphs) {
    const documentsProhibition = /\binterdit(?:e|es|s)?\b/iu.test(paragraph);
    if (documentsProhibition) continue;
    for (const claim of forbiddenClaims) {
      if (claim.pattern.test(paragraph)) findings.push(`brand.forbidden_claim:${claim.label}`);
    }
  }

  return [...new Set(findings)];
}

export function validateBrandPlatform(documents: BrandDocuments): readonly string[] {
  const findings: string[] = [];

  let expectedProjection: string | null = null;
  try {
    expectedProjection = renderPublicBrandProjection(
      buildPublicBrandProjection(documents.french, documents.english, documents.proofMatrix),
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown";
    findings.push(`brand.projection_invalid:${detail}`);
  }
  if (expectedProjection !== null && documents.projection !== expectedProjection) {
    findings.push("brand.public_projection_stale");
  }

  if (!/\|\s*I-29\s*\|/u.test(documents.invariants)) {
    findings.push("brand.invariant_missing:I-29");
  }
  if (!/\|\s*D39\s*\|/u.test(documents.decisions)) {
    findings.push("brand.decision_missing:D39");
  }
  if (
    !documents.authorityMap.includes("Plateforme de marque") ||
    !documents.authorityMap.includes("`brand/`")
  ) {
    findings.push("brand.authority_map_missing:brand/");
  }
  if (!documents.trademarks.includes("LicenseRef-Libre-AI-Brand-1.0")) {
    findings.push("brand.asset_publication_guard_missing:license-ref");
  }
  if (!/(?:similarité\s+visuelle|visual\s+similarity\s+review)/iu.test(documents.trademarks)) {
    findings.push("brand.asset_publication_guard_missing:similarity-review");
  }

  findings.push(...forbiddenClaimFindings(documents.french));
  return findings;
}

async function readBrandDocuments(): Promise<BrandDocuments> {
  const root = new URL("../../", import.meta.url);
  const read = async (path: string): Promise<string> => Bun.file(new URL(path, root)).text();
  const [
    french,
    english,
    proofMatrix,
    projection,
    trademarks,
    authorityMap,
    invariants,
    decisions,
  ] = await Promise.all([
    read("brand/README.md"),
    read("brand/README.en.md"),
    read("brand/proof-matrix.md"),
    read("brand/projections/public-brand.v1.json"),
    read("TRADEMARKS.md"),
    read("docs/README.md"),
    read("docs/decisions/INVARIANTS.md"),
    read("docs/decisions/DECISION-REGISTER.md"),
  ]);
  return {
    french,
    english,
    proofMatrix,
    projection,
    trademarks,
    authorityMap,
    invariants,
    decisions,
  };
}

if (import.meta.main) {
  const { concludeGate, GateReport } = await import("./gate-report");
  const findings = validateBrandPlatform(await readBrandDocuments());
  const report = new GateReport();
  const checks = [
    ["public projection", ["brand.projection_invalid:", "brand.public_projection_stale"]],
    ["I-29 doctrine anchor", ["brand.invariant_missing:"]],
    ["D39 decision anchor", ["brand.decision_missing:"]],
    ["brand authority map", ["brand.authority_map_missing:"]],
    ["asset publication license guard", ["brand.asset_publication_guard_missing:license-ref"]],
    [
      "asset publication similarity guard",
      ["brand.asset_publication_guard_missing:similarity-review"],
    ],
    ["forbidden claims", ["brand.forbidden_claim:"]],
  ] as const;

  for (const [item, prefixes] of checks) {
    const violations = findings.filter((finding) =>
      prefixes.some((prefix) => finding.startsWith(prefix)),
    );
    report.check(
      item,
      violations.length === 0,
      violations.length === 0 ? "authority and projection agree" : violations.join(", "),
    );
  }
  concludeGate("Brand platform", report);
}
