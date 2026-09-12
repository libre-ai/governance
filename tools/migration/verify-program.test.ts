import { expect, test } from "bun:test";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import cleanFixture from "./fixtures/source-freeze/clean.json";
import { buildSourceFreeze, readPortfolio } from "./source-freeze";
import { inspectProgram, runProgramCommand } from "./verify-program";

async function invoke(args: string[]) {
  const child = Bun.spawn([process.execPath, `${import.meta.dir}/verify-program.ts`, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { stdout, stderr, code };
}

test("program CLI rejects unsupported options without exposing their input", async () => {
  const result = await invoke(["--run-dir", "synthetic-private-value", "--phase", "ready"]);
  expect(result.code).toBe(1);
  expect(result.stdout).toBe("");
  expect(result.stderr).toBe("program-input-invalid\n");
});

test("program CLI refuses self-attested readiness and leaves the run untouched", async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), "program-test-")));
  try {
    const path = join(root, "program.json");
    const bytes = JSON.stringify({ ready: true, status: "pass", pending_public_mutations: 0 });
    await writeFile(path, bytes);
    const result = await invoke(["--run-dir", root]);
    expect(result.code).toBe(1);
    expect(result.stderr).toBe("");
    const report = JSON.parse(result.stdout);
    expect(report.phase).toBe("final");
    expect(report.verdict).toBe("blocked");
    expect(report.ready).toBe(false);
    expect(report.authorizesMutation).toBe(false);
    expect(report.blockers).toContain("private-qualification-verifier-unavailable");
    expect(report.freeze.status).toBe("verifier-unavailable");
    expect(result.stdout).not.toContain("PROGRAM READY");
    expect(result.stdout).not.toContain(root);
    expect(await readFile(path, "utf8")).toBe(bytes);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("coherent synthetic freeze remains uninspected and local obligations cannot masquerade as final", async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), "program-test-")));
  try {
    const freeze = buildSourceFreeze(
      readPortfolio().sources.map(({ source }) => ({
        source,
        ...structuredClone(cleanFixture),
      })),
    );
    const path = join(root, "source-freeze.v1.json");
    const bytes = JSON.stringify(freeze);
    await writeFile(path, bytes);
    const before = await readdir(root);
    const local = await inspectProgram(root, "local");
    expect(local.inventory).toEqual({ sources: 36, certainTargets: 14, conditionalTargets: 6 });
    expect(local.freeze.status).toBe("verifier-unavailable");
    expect(local.freeze.byteDigest).toBeNull();
    expect(local.blockers).toContain("source-freeze-verifier-unavailable");
    expect(local.ready).toBe(false);
    expect(local.blockers).toContain("current-source-proof-verifier-unavailable");
    expect(local.blockers).not.toContain("private-qualification-verifier-unavailable");
    expect(await inspectProgram(root, "local")).toEqual(local);
    const final = await inspectProgram(root, "final");
    expect(final.freeze).toEqual(local.freeze);
    expect(final.blockers).toContain("private-qualification-verifier-unavailable");
    expect(final.blockers).toContain("registry-qualification-verifier-unavailable");
    for (const blocker of local.blockers) expect(final.blockers).toContain(blocker);
    expect(final.ready).toBe(false);
    expect(await readFile(path, "utf8")).toBe(bytes);
    expect(await readdir(root)).toEqual(before);
    const cli = await invoke(["--phase", "local", "--run-dir", root]);
    expect(cli.code).toBe(1);
    expect(cli.stderr).toBe("");
    expect(JSON.parse(cli.stdout)).toEqual(local);
    freeze.digest = "0".repeat(64);
    await writeFile(path, JSON.stringify(freeze));
    expect((await inspectProgram(root, "final")).freeze).toEqual({
      status: "verifier-unavailable",
      byteDigest: null,
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("stale, pending and self-signed declarations remain uninspected and cannot establish program truth", async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), "program-test-")));
  try {
    for (const status of ["pass", "fixture", "pending", "stale"]) {
      await writeFile(
        join(root, "source-freeze.v1.json"),
        JSON.stringify({
          schemaVersion: "source-freeze.v1",
          status,
          ready: true,
          publicKey: "synthetic-caller-controlled-key",
          signature: "synthetic-signature",
          completedAt: "2000-01-01T00:00:00Z",
        }),
      );
      const result = await inspectProgram(root, "final");
      expect(result.verdict).toBe("blocked");
      expect(result.freeze.status).toBe("verifier-unavailable");
      expect(JSON.stringify(result)).not.toContain("synthetic-caller-controlled-key");
      expect(result.blockers).toContain("authority-signature-verifier-unavailable");
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("freeze file forms remain uninspected while unsafe run-directory arguments are refused", async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), "program-test-")));
  try {
    const path = join(root, "source-freeze.v1.json");
    const target = join(root, "synthetic-private-input");
    await writeFile(target, "synthetic-private-input");
    await symlink(target, path);
    expect((await inspectProgram(root, "local")).freeze.status).toBe("verifier-unavailable");
    expect(await readFile(target, "utf8")).toBe("synthetic-private-input");
    await rm(path);
    await mkdir(path);
    expect((await inspectProgram(root, "local")).freeze.status).toBe("verifier-unavailable");
    await rm(path, { recursive: true });
    for (const bytes of [
      Buffer.from([0xff]),
      Buffer.from("{"),
      Buffer.alloc(2 * 1024 * 1024 + 1),
    ]) {
      await writeFile(path, bytes);
      const result = await inspectProgram(root, "local");
      expect(result.freeze).toEqual({ status: "verifier-unavailable", byteDigest: null });
      expect(result.ready).toBe(false);
    }
    const alias = join(root, "alias");
    await symlink(root, alias);
    await expect(inspectProgram(alias, "local")).rejects.toThrow("program-input-invalid");
    await expect(inspectProgram(target, "local")).rejects.toThrow("program-input-invalid");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("strict CLI parsing fails closed and never creates a missing run directory", async () => {
  for (const args of [
    [],
    ["--run-dir"],
    ["--phase", "local"],
    ["--run-dir", "synthetic-missing", "--run-dir", "synthetic-missing"],
    ["--run-dir", "synthetic-missing", "--unknown", "synthetic-value"],
    ["--run-dir", "synthetic-missing"],
  ]) {
    const output: string[] = [];
    const errors: string[] = [];
    expect(
      await runProgramCommand(args, {
        log: (value) => output.push(value),
        error: (value) => errors.push(value),
      }),
    ).toBe(1);
    expect(output).toEqual([]);
    expect(errors).toEqual(["program-input-invalid"]);
  }
});

test("unavailable anchored reader never opens a freeze through a replaceable parent", async () => {
  const parent = await realpath(await mkdtemp(join(tmpdir(), "program-parent-test-")));
  const root = join(parent, "run");
  const outside = join(parent, "outside");
  await mkdir(root);
  await mkdir(outside);
  const bytes = JSON.stringify(
    buildSourceFreeze(
      readPortfolio().sources.map(({ source }) => ({ source, ...structuredClone(cleanFixture) })),
    ),
  );
  await writeFile(join(outside, "source-freeze.v1.json"), bytes);
  // A separate process isolates the module hook. If a pathname open is attempted,
  // reproduce F1 with real filesystem operations, never fabricated bytes or stats.
  const probe = `
    import { mock } from "bun:test";
    import * as fs from "node:fs/promises";
    const root = ${JSON.stringify(root)};
    const outside = ${JSON.stringify(outside)};
    const parked = ${JSON.stringify(join(parent, "parked"))};
    const realOpen = fs.open;
    const rename = fs.rename, symlink = fs.symlink, rm = fs.rm;
    let attempts = 0, injected = false, restored = false;
    mock.module("node:fs/promises", () => ({ ...fs, open: async (...args) => {
      attempts += 1;
      if (args[0] !== root + "/source-freeze.v1.json") return await realOpen(...args);
      await rename(root, parked);
      await symlink(outside, root);
      injected = true;
      const handle = await realOpen(...args);
      const close = handle.close.bind(handle);
      handle.close = async () => {
        await close(); await rm(root); await rename(parked, root); restored = true;
      };
      return handle;
    }}));
    const { inspectProgram } = await import(${JSON.stringify(new URL("./verify-program.ts", import.meta.url).href)});
    const report = await inspectProgram(root, "final");
    console.log(JSON.stringify({ attempts, injected, restored, freeze: report.freeze,
      ready: report.ready, authorizesMutation: report.authorizesMutation }));
  `;
  try {
    const child = Bun.spawn([process.execPath, "--eval", probe], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect(code).toBe(0);
    expect(stderr).toBe("");
    const result = JSON.parse(stdout);
    expect(result).toEqual({
      attempts: 0,
      injected: false,
      restored: false,
      freeze: { status: "verifier-unavailable", byteDigest: null },
      ready: false,
      authorizesMutation: false,
    });
    expect(await readdir(root)).toEqual([]);
    expect(await readFile(join(outside, "source-freeze.v1.json"), "utf8")).toBe(bytes);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
