import { expect, test } from "bun:test";
import { renderSettings } from "./render-settings";
import { buildRepositorySettings } from "./settings";

test("payload is withheld until independently selected review producer policy is complete", () => {
  const settings = buildRepositorySettings();
  const draft = renderSettings(settings);
  expect(draft.operations).toEqual([]);
  expect(draft.blockers).toEqual(["review-producer-unbound"]);
  const policy = {
    schemaVersion: "github-review-producer.v1",
    context: "independent-review/exact-commit",
    integrationId: 123,
    qualificationDigest: "a".repeat(64),
  };
  const ready = renderSettings(settings, [], policy);
  expect(ready.operations.length).toBe(70);
  expect(ready.applicationAuthorized).toBe(false);
  expect(JSON.stringify(ready)).toBe(JSON.stringify(renderSettings(settings, [], policy)));
  const rules = ready.operations.find((o) => o.path.endsWith("/rulesets"));
  expect(rules?.body).toMatchObject({
    enforcement: "active",
    bypass_actors: [],
    conditions: { ref_name: { include: ["~DEFAULT_BRANCH"], exclude: [] } },
  });
  expect(() => renderSettings(settings, [], { ...policy, integrationId: 0 })).toThrow();
});
test("CLI default rendering and check are deterministic with no external effect", async () => {
  const run = async () => {
    const child = Bun.spawn(
      [process.execPath, new URL("./render-settings.ts", import.meta.url).pathname],
      { stdout: "pipe", stderr: "pipe" },
    );
    const [output, error, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    return { output, error, code };
  };
  const first = await run();
  expect(first.code).toBe(0);
  expect(first.error).toBe("");
  expect(JSON.parse(first.output).settings.length).toBe(14);
  expect(JSON.parse(first.output).operations).toEqual([]);
  expect((await run()).output).toBe(first.output);
});

test("CLI requires independently pinned policy bytes and refuses unsafe input files", async () => {
  const { mkdtemp, writeFile, symlink, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createHash } = await import("node:crypto");
  const { readPrivateJson } = await import("./render-settings");
  const directory = await mkdtemp(join(tmpdir(), "github-settings-"));
  try {
    const path = join(directory, "policy.json");
    const bytes = JSON.stringify({
      schemaVersion: "github-review-producer.v1",
      context: "independent-review/exact-commit",
      integrationId: 123,
      qualificationDigest: "a".repeat(64),
    });
    await writeFile(path, bytes, { mode: 0o600 });
    const run = async (args: string[]) => {
      const child = Bun.spawn(
        [process.execPath, new URL("./render-settings.ts", import.meta.url).pathname, ...args],
        { stdout: "pipe", stderr: "pipe" },
      );
      return {
        output: await new Response(child.stdout).text(),
        error: await new Response(child.stderr).text(),
        code: await child.exited,
      };
    };
    expect((await run(["--review-policy", path])).code).toBe(1);
    expect(
      (await run(["--review-policy", path, "--review-policy-sha256", "f".repeat(64)])).code,
    ).toBe(1);
    const result = await run([
      "--review-policy",
      path,
      "--review-policy-sha256",
      createHash("sha256").update(bytes).digest("hex"),
    ]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.output).operations.length).toBe(70);
    expect(result.output).not.toContain(directory);
    const link = join(directory, "link.json");
    await symlink(path, link);
    await expect(readPrivateJson(link)).rejects.toThrow();
    await writeFile(path, Buffer.from([0xc0, 0xaf]));
    await expect(readPrivateJson(path)).rejects.toThrow();
    await writeFile(path, Buffer.alloc(2 * 1024 * 1024 + 1));
    await expect(readPrivateJson(path)).rejects.toThrow();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
