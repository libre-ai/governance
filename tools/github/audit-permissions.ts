import { spawn } from "node:child_process";
import { readPortfolio } from "../migration/source-freeze";
import { readPrivateJson } from "./render-settings";
import type { ConditionalAdmission } from "./settings";
import { admittedTargets } from "./settings";

export type PermissionState = "observed" | "denied" | "unknown" | "not-applicable";
export interface PermissionResponse {
  status: number;
  body: unknown;
  oauthScopes: string | null;
}
export type PermissionReader = (path: string) => Promise<PermissionResponse>;
function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function access(response: PermissionResponse): PermissionState {
  return response.status === 200
    ? "observed"
    : response.status === 401 || response.status === 403
      ? "denied"
      : "unknown";
}
function scope(response: PermissionResponse, name: string): PermissionState {
  return response.oauthScopes === null
    ? "unknown"
    : response.oauthScopes
          .split(",")
          .map((s) => s.trim())
          .includes(name)
      ? "observed"
      : "denied";
}
async function safeRead(reader: PermissionReader, path: string): Promise<PermissionResponse> {
  try {
    const response = await reader(path);
    if (
      !Number.isInteger(response.status) ||
      response.status < 0 ||
      response.status > 599 ||
      (response.oauthScopes !== null && typeof response.oauthScopes !== "string")
    )
      throw new Error("invalid");
    return response;
  } catch {
    return { status: 0, body: null, oauthScopes: null };
  }
}
export async function auditPermissions(
  repositories: readonly string[],
  reader: PermissionReader = readGitHubPermission,
  admissions: readonly ConditionalAdmission[] = [],
) {
  const allowed = new Set([
    ...readPortfolio().sources.map((s) => s.source),
    ...admittedTargets(admissions),
  ]);
  if (
    !Array.isArray(repositories) ||
    repositories.length === 0 ||
    repositories.length > 56 ||
    new Set(repositories).size !== repositories.length ||
    repositories.some((s) => !allowed.has(s))
  )
    throw new Error("github-audit-target-invalid");
  const [user, membership, rules] = await Promise.all([
    safeRead(reader, "user"),
    safeRead(reader, "user/memberships/orgs/libre-ai"),
    safeRead(reader, "orgs/libre-ai/rulesets?per_page=1"),
  ]);
  const identity: PermissionState =
    access(user) === "observed"
      ? record(user.body).login === "constantin-jais" && record(user.body).type === "User"
        ? "observed"
        : "denied"
      : access(user);
  const organizationAdmin: PermissionState =
    access(membership) === "observed"
      ? record(membership.body).role === "admin" && record(membership.body).state === "active"
        ? "observed"
        : "denied"
      : access(membership);
  const results: {
    repository: string;
    administration: PermissionState;
    tokenAdministrationWrite: PermissionState;
    deleteScope: PermissionState;
    deletionPermission: PermissionState;
  }[] = [];
  for (let index = 0; index < repositories.length; index += 4) {
    const batch = await Promise.all(
      repositories.slice(index, index + 4).map(async (repository) => {
        const response = await safeRead(reader, `repos/libre-ai/${repository}`);
        const admin = record(record(response.body).permissions).admin;
        const administration: PermissionState =
          access(response) !== "observed"
            ? access(response)
            : typeof admin === "boolean"
              ? admin
                ? "observed"
                : "denied"
              : "unknown";
        // permissions.admin is the actor's role, not a fine-grained token grant.
        const tokenAdministrationWrite: PermissionState =
          user.oauthScopes === null ? "unknown" : scope(user, "repo");
        const deleteScope = scope(user, "delete_repo");
        const deletionPermission: PermissionState =
          administration === "denied" || deleteScope === "denied"
            ? "denied"
            : administration === "observed" && deleteScope === "observed"
              ? "observed"
              : "unknown";
        return {
          repository: `libre-ai/${repository}`,
          administration,
          tokenAdministrationWrite,
          deleteScope,
          deletionPermission,
        };
      }),
    );
    results.push(...batch);
  }
  return {
    schemaVersion: "github-permission-observation.v1",
    qualification: "read-only-observation",
    cutoverAuthorized: false,
    identity,
    organizationAdmin,
    organizationRulesetPermission: access(rules),
    classicScopes: {
      repo: scope(user, "repo"),
      delete_repo: scope(user, "delete_repo"),
      "admin:org": scope(user, "admin:org"),
    },
    repositories: results.sort((a, b) => (a.repository < b.repository ? -1 : 1)),
    mutationOutcome: "not-probed",
  };
}
export async function readGitHubPermission(path: string): Promise<PermissionResponse> {
  const allowed = new Set([
    "user",
    "user/memberships/orgs/libre-ai",
    "orgs/libre-ai/rulesets?per_page=1",
    ...readPortfolio().sources.map((s) => `repos/libre-ai/${s.source}`),
    ...readPortfolio().certainTargets.map((s) => `repos/libre-ai/${s}`),
    ...readPortfolio().conditionalTargets.map((s) => `repos/libre-ai/${s}`),
  ]);
  if (!allowed.has(path)) throw new Error("github-audit-target-invalid");
  const bytes = await new Promise<Buffer>((resolve, reject) => {
    const child = spawn(
      "gh",
      [
        "api",
        "--hostname",
        "github.com",
        "--method",
        "GET",
        "--include",
        "-H",
        "Accept: application/vnd.github+json",
        "-H",
        "X-GitHub-Api-Version: 2026-03-10",
        path,
      ],
      { stdio: ["ignore", "pipe", "ignore"], env: { ...process.env, GH_PROMPT_DISABLED: "1" } },
    );
    const chunks: Buffer[] = [];
    let length = 0;
    let settled = false;
    function fail() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGKILL");
      reject(new Error("github-audit-unavailable"));
    }
    const timer = setTimeout(fail, 20000);
    child.on("error", fail);
    child.stdout.on("error", fail);
    child.stdout.on("data", (chunk: Buffer) => {
      length += chunk.length;
      if (length > 2 * 1024 * 1024) fail();
      else chunks.push(chunk);
    });
    child.on("close", () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(Buffer.concat(chunks));
    });
  });
  const text = bytes.toString("utf8");
  const separator = /\r?\n\r?\n/u.exec(text);
  if (!separator || separator.index === undefined) throw new Error("github-audit-unavailable");
  const headers = text.slice(0, separator.index);
  const status = Number(/^HTTP\/[^ ]+ (\d{3})/u.exec(headers)?.[1]);
  if (!Number.isInteger(status)) throw new Error("github-audit-unavailable");
  const rawScope = /^x-oauth-scopes:[ \t]*([^\r\n]*)/imu.exec(headers);
  const oauthScopes = rawScope?.[1] ?? null;
  let body: unknown = null;
  try {
    body = JSON.parse(text.slice(separator.index + separator[0].length));
  } catch {
    if (status === 200) throw new Error("github-audit-unavailable");
  }
  return { status, body, oauthScopes };
}
if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    let reader: PermissionReader = readGitHubPermission;
    if (args.length === 2 && args[0] === "--fixture" && args[1]) {
      const fixture = record(await readPrivateJson(args[1]));
      reader = async (path) => {
        const value = record(fixture[path]);
        return {
          status: typeof value.status === "number" ? value.status : 0,
          body: value.body,
          oauthScopes: typeof value.oauthScopes === "string" ? value.oauthScopes : null,
        };
      };
    } else if (args.length !== 1 || args[0] !== "--live")
      throw new Error("github-audit-input-invalid");
    const report = await auditPermissions(
      readPortfolio().sources.map((s) => s.source),
      reader,
    );
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (
      report.identity !== "observed" ||
      report.organizationAdmin !== "observed" ||
      report.organizationRulesetPermission !== "observed" ||
      report.repositories.some(
        (r) =>
          r.administration !== "observed" ||
          r.tokenAdministrationWrite !== "observed" ||
          r.deletionPermission !== "observed",
      )
    )
      process.exitCode = 1;
  } catch {
    process.stderr.write("github-audit-input-invalid\n");
    process.exitCode = 1;
  }
}
