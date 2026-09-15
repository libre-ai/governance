import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import Ajv from "ajv";
import { evaluateConditionalGate } from "../migration/conditional-gates";
import type { ConditionalAdmission } from "./settings";
import {
  buildRepositorySettings,
  EXACT_COMMIT_REVIEW_CHECK,
  validateRepositorySettings,
} from "./settings";

interface ReviewProducerPolicy {
  schemaVersion: "github-review-producer.v1";
  context: string;
  integrationId: number;
  qualificationDigest: string;
}
export interface SettingsOperation {
  method: "PATCH" | "PUT" | "POST";
  path: string;
  body: Record<string, unknown> | null;
}
const policyValidator = new Ajv({ strict: true }).compile<ReviewProducerPolicy>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "context", "integrationId", "qualificationDigest"],
  properties: {
    schemaVersion: { const: "github-review-producer.v1" },
    context: { const: EXACT_COMMIT_REVIEW_CHECK },
    integrationId: { type: "integer", minimum: 1, maximum: Number.MAX_SAFE_INTEGER },
    qualificationDigest: { type: "string", pattern: "^[a-f0-9]{64}$" },
  },
});
function sha(bytes: string): string {
  return createHash("sha256").update(bytes).digest("hex");
}
export function renderSettings(
  settings: unknown = buildRepositorySettings(),
  admissions: readonly ConditionalAdmission[] = [],
  policyInput: unknown = null,
) {
  validateRepositorySettings(settings, admissions);
  if (policyInput !== null && !policyValidator(policyInput))
    throw new Error("github-review-policy-invalid");
  const policy = policyInput as ReviewProducerPolicy | null;
  const operations: SettingsOperation[] = [];
  if (policy)
    for (const setting of settings) {
      const path = `/repos/${setting.repository}`;
      operations.push(
        {
          method: "PATCH",
          path,
          body: {
            allow_merge_commit: false,
            allow_squash_merge: true,
            allow_rebase_merge: true,
            security_and_analysis: {
              secret_scanning: { status: "enabled" },
              secret_scanning_push_protection: { status: "enabled" },
            },
          },
        },
        { method: "PUT", path: `${path}/vulnerability-alerts`, body: null },
        { method: "PUT", path: `${path}/automated-security-fixes`, body: null },
        { method: "PUT", path: `${path}/private-vulnerability-reporting`, body: null },
        {
          method: "POST",
          path: `${path}/rulesets`,
          body: {
            name: "Libre AI default branch security",
            target: "branch",
            enforcement: "active",
            bypass_actors: [],
            conditions: { ref_name: { include: ["~DEFAULT_BRANCH"], exclude: [] } },
            rules: [
              { type: "deletion" },
              { type: "non_fast_forward" },
              { type: "required_signatures" },
              { type: "required_linear_history" },
              {
                type: "pull_request",
                parameters: {
                  dismiss_stale_reviews_on_push: true,
                  require_code_owner_review: false,
                  require_last_push_approval: false,
                  required_approving_review_count: 0,
                  required_review_thread_resolution: true,
                  allowed_merge_methods: ["squash", "rebase"],
                },
              },
              {
                type: "required_status_checks",
                parameters: {
                  strict_required_status_checks_policy: true,
                  do_not_enforce_on_create: false,
                  required_status_checks: [
                    { context: policy.context, integration_id: policy.integrationId },
                  ],
                },
              },
            ],
          },
        },
      );
    }
  const body = {
    schemaVersion: "repository-settings.v1",
    qualification: "candidate",
    applicationAuthorized: false,
    apiVersion: "2026-03-10",
    settings,
    reviewProducerPolicyDigest: policy ? sha(JSON.stringify(policy)) : null,
    blockers: policy ? [] : ["review-producer-unbound"],
    operations,
  };
  return { ...body, digest: sha(JSON.stringify(body)) };
}
export function formatSettingsJson(value: unknown, depth = 0): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  const pad = " ".repeat(depth);
  const next = " ".repeat(depth + 2);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const compact = `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    if (
      value.every((item) => item === null || typeof item !== "object") &&
      compact.length + depth <= 80
    )
      return compact;
    return `[\n${value.map((item) => next + formatSettingsJson(item, depth + 2)).join(",\n")}\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  return `{\n${entries.map(([key, item]) => `${next}${JSON.stringify(key)}: ${formatSettingsJson(item, depth + 2)}`).join(",\n")}\n${pad}}`;
}
async function readPrivateText(path: string): Promise<string> {
  const limit = 2 * 1024 * 1024;
  const handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > limit) throw new Error("github-input-invalid");
    const buffer = Buffer.alloc(limit + 1);
    let total = 0;
    while (total < buffer.length) {
      const { bytesRead } = await handle.read(buffer, total, buffer.length - total, null);
      if (bytesRead === 0) break;
      total += bytesRead;
    }
    if (total > limit) throw new Error("github-input-invalid");
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
      buffer.subarray(0, total),
    );
  } finally {
    await handle.close();
  }
}
export async function readPrivateJson(path: string): Promise<unknown> {
  return JSON.parse(await readPrivateText(path));
}
async function readPinnedPolicy(path: string, expectedDigest: string): Promise<unknown> {
  if (!/^[a-f0-9]{64}$/.test(expectedDigest)) throw new Error("github-policy-pin-invalid");
  const text = await readPrivateText(path);
  if (sha(text) !== expectedDigest) throw new Error("github-policy-pin-mismatch");
  return JSON.parse(text);
}

if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    const options = new Map<string, string>();
    for (let i = 0; i < args.length; i += 2) {
      const name = args[i],
        value = args[i + 1];
      if (
        !name ||
        !value ||
        ![
          "--review-policy",
          "--review-policy-sha256",
          "--conditional-policies-sha256",
          "--conditional-policies",
          "--conditional-evidence",
          "--check",
        ].includes(name) ||
        options.has(name)
      )
        throw new Error("github-input-invalid");
      options.set(name, value);
    }
    if (
      options.has("--review-policy") !== options.has("--review-policy-sha256") ||
      options.has("--conditional-policies") !== options.has("--conditional-policies-sha256")
    )
      throw new Error("github-policy-pin-required");
    const admissions: ConditionalAdmission[] = [];
    if (options.has("--conditional-policies") !== options.has("--conditional-evidence"))
      throw new Error("github-input-invalid");
    if (options.has("--conditional-policies")) {
      const policies = await readPinnedPolicy(
        options.get("--conditional-policies") ?? "",
        options.get("--conditional-policies-sha256") ?? "",
      );
      const evidence = await readPrivateJson(options.get("--conditional-evidence") ?? "");
      if (
        !Array.isArray(policies) ||
        !Array.isArray(evidence) ||
        policies.length !== evidence.length ||
        policies.length > 6
      )
        throw new Error("github-input-invalid");
      for (let i = 0; i < policies.length; i++) {
        const policy: unknown = policies[i];
        if (
          typeof policy !== "object" ||
          policy === null ||
          !("target" in policy) ||
          typeof policy.target !== "string"
        )
          throw new Error("github-input-invalid");
        const verdict = await evaluateConditionalGate(policy.target, policy, evidence[i]);
        admissions.push({
          target: policy.target,
          candidateCommit: verdict.candidateCommit,
          verdict,
        });
      }
    }
    const policy = options.has("--review-policy")
      ? await readPinnedPolicy(
          options.get("--review-policy") ?? "",
          options.get("--review-policy-sha256") ?? "",
        )
      : null;
    const bytes = `${formatSettingsJson(renderSettings(buildRepositorySettings(admissions), admissions, policy))}\n`;
    if (options.has("--check")) {
      if ((await readPrivateText(options.get("--check") ?? "")) !== bytes)
        throw new Error("github-settings-drift");
    } else process.stdout.write(bytes);
  } catch {
    process.stderr.write("github-settings-input-or-drift-invalid\n");
    process.exitCode = 1;
  }
}
