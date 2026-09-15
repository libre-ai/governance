import { expect, spyOn, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { observeLocal, runObservationBytes, runObservationCommand } from "./source-observation";

test("real git collector detects dirty files, non-main branches and detached worktrees without changing refs", async () => {
  const root = await mkdtemp(join(tmpdir(), "freeze-fixture-"));
  async function git(...args: string[]): Promise<string> {
    const proc = Bun.spawn(["git", "-C", root, ...args], { stdout: "pipe", stderr: "pipe" });
    const output = await new Response(proc.stdout).text();
    expect(await proc.exited).toBe(0);
    return output.trim();
  }
  await git("init", "--initial-branch=main");
  await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "commit",
    "--allow-empty",
    "-m",
    "fixture",
  );
  const oid = await git("rev-parse", "HEAD");
  await expect(observeLocal(root, "website")).rejects.toThrow();
  await git("remote", "add", "origin", "https://github.com/libre-ai/website.git");
  const clean = await observeLocal(root, "website");
  expect(clean.localCommit).toBe(oid);
  expect(clean.dirty).toBe(false);
  await git("branch", "stale-local");
  await git("worktree", "add", "--detach", `${root}-detached`, oid);
  await writeFile(join(root, "untracked"), "dirty");
  const before = await git("show-ref");
  const observed = await observeLocal(root);
  expect(observed.dirty).toBe(true);
  expect(observed.branches.some((item) => item.ref === "refs/heads/stale-local")).toBe(true);
  expect(observed.worktrees.some((item) => item.detached)).toBe(true);
  expect(await git("show-ref")).toBe(before);
});
test("missing clone refuses observation", async () => {
  await expect(observeLocal("/nonexistent/synthetic-freeze")).rejects.toThrow(
    "git-observation-failed",
  );
});

async function trackedFixture(): Promise<{
  root: string;
  git: (...args: string[]) => Promise<string>;
}> {
  const root = await mkdtemp(join(tmpdir(), "freeze-content-"));
  async function git(...args: string[]): Promise<string> {
    const child = Bun.spawn(["git", "-C", root, ...args], { stdout: "pipe", stderr: "ignore" });
    const text = await new Response(child.stdout).text();
    if ((await child.exited) !== 0) throw new Error("fixture-failed");
    return text.trimEnd();
  }
  await git("init", "--initial-branch=main");
  await writeFile(join(root, "tracked.txt"), "committed bytes\n");
  await git("add", "tracked.txt");
  await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "fixture",
  );
  return { root, git };
}

for (const flag of ["--assume-unchanged", "--skip-worktree"]) {
  test(`detects hidden changed bytes under ${flag} without changing index or source`, async () => {
    const { root, git } = await trackedFixture();
    await git("update-index", flag, "tracked.txt");
    await writeFile(join(root, "tracked.txt"), "uncommitted bytes\n");
    expect(await git("status", "--porcelain")).toBe("");
    const beforeIndex = await Bun.file(join(root, ".git/index")).arrayBuffer();
    const beforeRefs = await git("show-ref");
    const observation = await observeLocal(root);
    expect(observation.dirty).toBe(true);
    expect(observation.worktrees[0]?.dirty).toBe(true);
    expect(await Bun.file(join(root, "tracked.txt")).text()).toBe("uncommitted bytes\n");
    expect(await Bun.file(join(root, ".git/index")).arrayBuffer()).toEqual(beforeIndex);
    expect(await git("show-ref")).toBe(beforeRefs);
  });
}

test("checks executable mode even when core.fileMode hides it", async () => {
  const { root, git } = await trackedFixture();
  await git("config", "core.fileMode", "false");
  const { chmod } = await import("node:fs/promises");
  await chmod(join(root, "tracked.txt"), 0o755);
  expect(await git("status", "--porcelain")).toBe("");
  expect((await observeLocal(root)).dirty).toBe(true);
});

test("compares symlink bytes without following an external target", async () => {
  const { root, git } = await trackedFixture();
  const { symlink, unlink } = await import("node:fs/promises");
  await symlink("/nonexistent/synthetic-outside", join(root, "link"));
  await git("add", "link");
  await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "link fixture",
  );
  expect((await observeLocal(root)).dirty).toBe(false);
  await git("update-index", "--assume-unchanged", "link");
  await unlink(join(root, "link"));
  await symlink("/nonexistent/synthetic-changed", join(root, "link"));
  expect((await observeLocal(root)).dirty).toBe(true);
});

test("refuses gitlinks even when Git reports a clean index", async () => {
  const { root, git } = await trackedFixture();
  const oid = await git("rev-parse", "HEAD");
  await git("update-index", "--add", "--cacheinfo", `160000,${oid},module`);
  await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "gitlink fixture",
  );
  await expect(observeLocal(root)).rejects.toThrow("unsupported-tracked-entry");
});

test("detects staged content rather than treating the index as the committed authority", async () => {
  const { root, git } = await trackedFixture();
  await writeFile(join(root, "tracked.txt"), "staged bytes\n");
  await git("add", "tracked.txt");
  expect((await observeLocal(root)).dirty).toBe(true);
});

test("deadline rejects a command that ignores TERM and would exit zero", async () => {
  const started = performance.now();
  await expect(
    runObservationCommand(
      [process.execPath, "-e", 'process.on("SIGTERM",()=>{});setTimeout(()=>process.exit(0),400);'],
      40,
    ),
  ).rejects.toThrow("observation-command-timeout");
  expect(performance.now() - started).toBeLessThan(350);
});

test("deadline never signals a group after its leader exits and only closes inherited pipes", async () => {
  const root = await mkdtemp(join(tmpdir(), "freeze-deadline-"));
  const marker = join(root, "descendant-finished");
  // This fixture owns the descendant's bounded lifetime; the collector must not
  // guess that the old group ID still belongs to it after the leader exits.
  const descendant = `setTimeout(()=>{require("node:fs").writeFileSync(${JSON.stringify(marker)},"finished");process.exit(0)},800);`;
  const parent = `Bun.spawn([process.execPath,"-e",${JSON.stringify(descendant)}],{stdout:"inherit",stderr:"ignore"});process.exit(0);`;
  const signals: number[] = [];
  const kill = spyOn(process, "kill").mockImplementation((pid) => {
    signals.push(pid);
    return true;
  });
  try {
    await expect(runObservationCommand([process.execPath, "-e", parent], 400)).rejects.toThrow(
      "observation-command-timeout",
    );
    expect(signals).toEqual([]);
  } finally {
    // Do not restore the signal oracle or finish until the fixture has ended itself.
    await new Promise((resolve) => setTimeout(resolve, 900));
    kill.mockRestore();
  }
  expect(await Bun.file(marker).text()).toBe("finished");
});

test("command failures never reflect subprocess output", async () => {
  await expect(
    runObservationCommand(
      [process.execPath, "-e", 'console.error("synthetic-private-data");process.exit(7)'],
      1000,
    ),
  ).rejects.toThrow("git-observation-failed");
  expect(
    await runObservationCommand([process.execPath, "-e", 'console.log("observation")'], 1000),
  ).toBe("observation");
});

test("detects equal-size changes across streaming chunks despite index flags", async () => {
  const { root, git } = await trackedFixture();
  const bytes = Buffer.alloc(192 * 1024, 0x41);
  await writeFile(join(root, "tracked.txt"), bytes);
  await git("add", "tracked.txt");
  await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "stream fixture",
  );
  expect((await observeLocal(root)).dirty).toBe(false);
  await git("update-index", "--assume-unchanged", "tracked.txt");
  bytes[bytes.length - 1] = 0x42;
  await writeFile(join(root, "tracked.txt"), bytes);
  expect(await git("status", "--porcelain")).toBe("");
  expect((await observeLocal(root)).dirty).toBe(true);
});

test("does not follow a directory replaced by an external symlink", async () => {
  const { root, git } = await trackedFixture();
  const { mkdir, rename, symlink } = await import("node:fs/promises");
  await mkdir(join(root, "directory"));
  await writeFile(join(root, "directory", "file"), "committed");
  await git("add", "directory");
  await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "directory fixture",
  );
  await git("update-index", "--skip-worktree", "directory/file");
  const external = await mkdtemp(join(tmpdir(), "freeze-external-"));
  await rename(join(root, "directory"), join(external, "moved"));
  await symlink(join(external, "moved"), join(root, "directory"));
  expect((await observeLocal(root)).dirty).toBe(true);
  expect(await Bun.file(join(external, "moved", "file")).text()).toBe("committed");
});

test("does not execute a configured filesystem monitor", async () => {
  const { root, git } = await trackedFixture();
  const { chmod } = await import("node:fs/promises");
  const external = await mkdtemp(join(tmpdir(), "freeze-monitor-"));
  const marker = join(external, "executed");
  const script = join(external, "monitor");
  await writeFile(script, `#!/bin/sh\ntouch '${marker}'\n`);
  await chmod(script, 0o700);
  await git("config", "core.fsmonitor", script);
  expect((await observeLocal(root)).dirty).toBe(false);
  expect(await Bun.file(marker).exists()).toBe(false);
});

test("refuses unbounded output and invalid command deadlines with opaque codes", async () => {
  await expect(
    runObservationCommand(
      [process.execPath, "-e", "process.stdout.write(Buffer.alloc(17*1024*1024,65))"],
      1000,
    ),
  ).rejects.toThrow("observation-output-limit");
  for (const deadline of [0, -1, Number.NaN, 30_001]) {
    await expect(runObservationCommand([process.execPath, "-e", ""], deadline)).rejects.toThrow(
      "unsupported-observation-command",
    );
  }
});

test("neutralizes and reports replacement objects instead of silently accepting substituted history", async () => {
  const { root, git } = await trackedFixture();
  const original = await git("rev-parse", "HEAD");
  await writeFile(join(root, "tracked.txt"), "replacement bytes\n");
  await git("add", "tracked.txt");
  const tree = await git("write-tree");
  const replacement = await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "commit-tree",
    tree,
    "-m",
    "replacement fixture",
  );
  await writeFile(join(root, "tracked.txt"), "committed bytes\n");
  await git("add", "tracked.txt");
  await git("replace", original, replacement);
  const before = await git("show-ref");
  const observed = await observeLocal(root);
  expect(observed.localCommit).toBe(original);
  expect(observed.dirty).toBe(false);
  expect(observed.branches).toContainEqual({
    ref: `refs/replace/${original}`,
    commit: replacement,
  });
  expect(await git("show-ref")).toBe(before);
});

test("raw observation output preserves manifest byte whitespace", async () => {
  expect(
    await runObservationCommand(
      [process.execPath, "-e", 'process.stdout.write("{}\\n\\n")'],
      1000,
      { preserveTrailingWhitespace: true },
    ),
  ).toBe("{}\n\n");
});

test("refuses invalid UTF-8 instead of rewriting observed bytes", async () => {
  await expect(
    runObservationCommand(
      [process.execPath, "-e", "process.stdout.write(Buffer.from([255,10]))"],
      1000,
      { preserveTrailingWhitespace: true },
    ),
  ).rejects.toThrow("observation-invalid-encoding");
});

test("raw observation output does not strip a UTF-8 byte order mark", async () => {
  expect(
    await runObservationCommand(
      [process.execPath, "-e", "process.stdout.write(Buffer.from([239,187,191,123,125,10]))"],
      1000,
      { preserveTrailingWhitespace: true },
    ),
  ).toBe("\uFEFF{}\n");
});

test("binary Git observation preserves every byte without text decoding", async () => {
  const bytes = await runObservationBytes(
    [process.execPath, "-e", "process.stdout.write(Buffer.from([255,0,13,10,239,187,191]))"],
    1000,
  );
  expect(bytes).toEqual(Buffer.from([255, 0, 13, 10, 239, 187, 191]));
});
