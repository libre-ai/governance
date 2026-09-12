import { expect, test } from "bun:test";
import { auditPermissions } from "./audit-permissions";

const ok = (body: unknown, scopes: string | null = "repo, delete_repo, admin:org") => ({
  status: 200,
  body,
  oauthScopes: scopes,
});
test("classic permission observations never expose identity or infer mutation success", async () => {
  const result = await auditPermissions(["governance"], async (path) =>
    path === "user"
      ? ok({ login: "constantin-jais", type: "User" })
      : path.includes("memberships")
        ? ok({ role: "admin", state: "active" })
        : path.includes("rulesets")
          ? ok([])
          : ok({ permissions: { admin: true } }),
  );
  expect(result.identity).toBe("observed");
  expect(result.repositories[0]?.administration).toBe("observed");
  expect(result.repositories[0]?.deleteScope).toBe("observed");
  expect(result.cutoverAuthorized).toBe(false);
  expect(JSON.stringify(result)).not.toContain("constantin-jais");
});
test("fine-grained or missing headers do not invent classic scopes or administration writes", async () => {
  const result = await auditPermissions(["governance"], async (path) =>
    path === "user"
      ? ok({ login: "constantin-jais", type: "User" }, null)
      : path.includes("memberships")
        ? ok({ role: "admin", state: "active" }, null)
        : path.includes("rulesets")
          ? ok([], null)
          : ok({ permissions: { admin: true } }, null),
  );
  expect(result.repositories[0]?.deleteScope).toBe("unknown");
  expect(result.repositories[0]?.tokenAdministrationWrite).toBe("unknown");
  expect(result.organizationRulesetPermission).toBe("observed");
});
test("wrong identity, forbidden and hidden repositories remain denied or unknown", async () => {
  const result = await auditPermissions(["governance", "contracts"], async (path) =>
    path === "user"
      ? ok({ login: "someone-else", type: "User" })
      : { status: path.endsWith("contracts") ? 404 : 403, body: null, oauthScopes: null },
  );
  expect(result.identity).toBe("denied");
  expect(
    result.repositories.find((r) => r.repository === "libre-ai/governance")?.administration,
  ).toBe("denied");
  expect(
    result.repositories.find((r) => r.repository === "libre-ai/contracts")?.administration,
  ).toBe("unknown");
  await expect(auditPermissions(["signalement"], async () => ok({}))).rejects.toThrow();
});

test("fixture CLI audits all sources and emits no raw identity or token-shaped input", async () => {
  const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { readPortfolio } = await import("../migration/source-freeze");
  const directory = await mkdtemp(join(tmpdir(), "github-audit-"));
  try {
    const fixture: Record<string, unknown> = {
      user: ok({
        login: "constantin-jais",
        type: "User",
        name: "private-placeholder",
        token: "ghp_synthetic_private_value",
      }),
      "user/memberships/orgs/libre-ai": ok({ role: "admin", state: "active" }),
      "orgs/libre-ai/rulesets?per_page=1": ok([]),
    };
    for (const source of readPortfolio().sources)
      fixture[`repos/libre-ai/${source.source}`] = ok({ permissions: { admin: true } });
    const path = join(directory, "fixture.json");
    await writeFile(path, JSON.stringify(fixture), { mode: 0o600 });
    const child = Bun.spawn(
      [
        process.execPath,
        new URL("./audit-permissions.ts", import.meta.url).pathname,
        "--fixture",
        path,
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    const [output, error, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect(code).toBe(0);
    expect(error).toBe("");
    expect(JSON.parse(output).repositories.length).toBe(36);
    expect(output).not.toContain("constantin-jais");
    expect(output).not.toContain("private-placeholder");
    expect(output).not.toContain("ghp_");
    expect(output).not.toContain(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
