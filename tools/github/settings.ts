import { readFile } from "node:fs/promises";
import Ajv from "ajv";
import type { ConditionalGateVerdict } from "../migration/conditional-gates";
import { assertConditionalUse } from "../migration/conditional-gates";
import { readPortfolio } from "../migration/source-freeze";

export const EXACT_COMMIT_REVIEW_CHECK = "independent-review/exact-commit";
export interface ConditionalAdmission {
  target: string;
  candidateCommit: string;
  verdict: ConditionalGateVerdict;
}
export interface RepositorySecuritySettings {
  repository: string;
  displayName: string;
  secretScanning: true;
  pushProtection: true;
  dependabotAlerts: true;
  securityUpdates: true;
  privateVulnerabilityReporting: true;
  ruleset: {
    strictChecks: true;
    conversationsResolved: true;
    signedCommits: true;
    linearHistory: true;
    forcePush: false;
    deletion: false;
    adminEnforced: true;
    requiredApprovals: 0;
    exactCommitReviewCheck: string;
  };
}
const portfolio = readPortfolio();
const catalog = JSON.parse(
  await readFile(new URL("../../portfolio/repositories.v1.yaml", import.meta.url), "utf8"),
) as { repositories: { slug: string; displayName: string }[] };
const names = new Map(
  catalog.repositories.map((repository) => [repository.slug, repository.displayName]),
);
const ajv = new Ajv({ strict: true });
export function admittedTargets(admissions: readonly ConditionalAdmission[] = []): string[] {
  if (!Array.isArray(admissions)) throw new Error("github-admission-invalid");
  const targets = [...portfolio.certainTargets];
  for (const admission of admissions) {
    if (
      !admission ||
      !portfolio.conditionalTargets.includes(admission.target) ||
      targets.includes(admission.target)
    )
      throw new Error("github-admission-invalid");
    assertConditionalUse(
      admission.target,
      admission.candidateCommit,
      "public-name",
      admission.verdict,
    );
    targets.push(admission.target);
  }
  return targets.sort();
}
export function buildRepositorySettings(
  admissions: readonly ConditionalAdmission[] = [],
): RepositorySecuritySettings[] {
  return admittedTargets(admissions).map((target) => {
    const displayName = names.get(target);
    if (!displayName || /[\p{C}]/u.test(displayName)) throw new Error("github-name-invalid");
    return {
      repository: `libre-ai/${target}`,
      displayName,
      secretScanning: true,
      pushProtection: true,
      dependabotAlerts: true,
      securityUpdates: true,
      privateVulnerabilityReporting: true,
      ruleset: {
        strictChecks: true,
        conversationsResolved: true,
        signedCommits: true,
        linearHistory: true,
        forcePush: false,
        deletion: false,
        adminEnforced: true,
        requiredApprovals: 0,
        exactCommitReviewCheck: EXACT_COMMIT_REVIEW_CHECK,
      },
    };
  });
}
export function validateRepositorySettings(
  input: unknown,
  admissions: readonly ConditionalAdmission[] = [],
): asserts input is RepositorySecuritySettings[] {
  // Const schema validates the complete authorized set, every value and unknown
  // properties; callers cannot weaken one repository or omit a target.
  if (!ajv.compile({ const: buildRepositorySettings(admissions) })(input))
    throw new Error("github-settings-invalid");
}
