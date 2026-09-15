import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, readlink, realpath } from "node:fs/promises";
import { join } from "node:path";
import type { Portfolio, SourceObservation } from "./types";

export async function runObservationBytes(
  args: readonly string[],
  timeoutMs = 30_000,
): Promise<Buffer> {
  if (
    process.platform === "win32" ||
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs <= 0 ||
    timeoutMs > 30_000 ||
    !args[0]
  ) {
    throw new Error("unsupported-observation-command");
  }
  return await new Promise<Buffer>((resolve, reject) => {
    const child = spawn(args[0] ?? "", args.slice(1), {
      // The private POSIX group is signalable only while its leader is still ours.
      detached: true,
      stdio: ["ignore", "pipe", "ignore"],
      env: {
        ...Bun.env,
        GIT_OPTIONAL_LOCKS: "0",
        GIT_NO_LAZY_FETCH: "1",
        GIT_TERMINAL_PROMPT: "0",
        GH_PROMPT_DISABLED: "1",
      },
    });
    const output: Buffer[] = [];
    let size = 0;
    let settled = false;
    let leaderExited = false;
    child.once("exit", () => {
      leaderExited = true;
    });
    function stop(): void {
      // After leader exit the numeric group ID may be reused. Close our pipes,
      // but leave surviving descendants to their owner instead of signaling late.
      if (
        !leaderExited &&
        child.exitCode === null &&
        child.signalCode === null &&
        child.pid !== undefined
      ) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          /* The command may already have exited. */
        }
        try {
          child.kill("SIGKILL");
        } catch {
          /* Its process group was already terminated. */
        }
      }
      child.stdout?.destroy();
      child.unref();
    }
    function fail(code: string): void {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      stop();
      reject(new Error(code));
    }
    const deadline = setTimeout(() => fail("observation-command-timeout"), timeoutMs);
    child.on("error", () => fail("git-observation-failed"));
    child.stdout?.on("error", () => fail("git-observation-failed"));
    child.stdout?.on("data", (chunk: Buffer) => {
      if (settled) return;
      size += chunk.length;
      if (size > 16 * 1024 * 1024) {
        fail("observation-output-limit");
        return;
      }
      output.push(chunk);
    });
    child.on("close", (code) => {
      if (settled) return;
      if (code !== 0) {
        fail("git-observation-failed");
        return;
      }
      settled = true;
      clearTimeout(deadline);
      resolve(Buffer.concat(output));
    });
  });
}

export async function runObservationCommand(
  args: readonly string[],
  timeoutMs = 30_000,
  options: { preserveTrailingWhitespace?: boolean } = {},
): Promise<string> {
  const bytes = await runObservationBytes(args, timeoutMs);
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new Error("observation-invalid-encoding");
  }
  return options.preserveTrailingWhitespace ? text : text.trimEnd();
}

async function command(args: string[]): Promise<string> {
  return await runObservationCommand(args);
}

interface TrackedEntry {
  readonly path: string;
  readonly mode: string;
  readonly oid: string;
}

function trackedEntries(text: string, index: boolean): Map<string, TrackedEntry> {
  const entries = new Map<string, TrackedEntry>();
  for (const record of text.split("\0").filter(Boolean)) {
    const match = (
      index
        ? /^([0-9]{6}) ([a-f0-9]{40}) 0\t([\s\S]+)$/
        : /^([0-9]{6}) blob ([a-f0-9]{40})\t([\s\S]+)$/
    ).exec(record);
    if (!match || !["100644", "100755", "120000"].includes(match[1] ?? "")) {
      throw new Error("unsupported-tracked-entry");
    }
    const path = match[3] ?? "";
    if (
      path.includes("\uFFFD") ||
      path
        .split("/")
        .some((part) => part === "" || part === "." || part === ".." || part === ".git") ||
      entries.has(path)
    ) {
      throw new Error("unsupported-tracked-entry");
    }
    entries.set(path, { path, mode: match[1] ?? "", oid: match[2] ?? "" });
  }
  return entries;
}

async function gitRead(directory: string, ...args: string[]): Promise<string> {
  // Repository-local monitor hooks and index caches cannot attest source bytes.
  return command([
    "git",
    "--no-replace-objects",
    "-c",
    "core.fsmonitor=false",
    "-c",
    "core.untrackedCache=false",
    "-C",
    directory,
    ...args,
  ]);
}

async function matchesDisk(root: string, entry: TrackedEntry, buffer: Buffer): Promise<boolean> {
  const components = entry.path.split("/");
  let parent = root;
  for (const component of components.slice(0, -1)) {
    parent = join(parent, component);
    const info = await lstat(parent);
    if (!info.isDirectory() || info.isSymbolicLink()) return false;
  }
  const path = join(root, entry.path);
  const before = await lstat(path);
  if (entry.mode === "120000") {
    if (!before.isSymbolicLink()) return false;
    // Hash the link's own bytes; never open or dereference its destination.
    const bytes = await readlink(path, { encoding: "buffer" });
    const after = await lstat(path);
    return (
      before.ino === after.ino &&
      before.ctimeMs === after.ctimeMs &&
      createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") === entry.oid
    );
  }
  if (!before.isFile() || ((before.mode & 0o111) !== 0 ? "100755" : "100644") !== entry.mode)
    return false;
  // O_NONBLOCK refuses a raced FIFO without hanging; O_NOFOLLOW refuses a replaced link.
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = await handle.stat();
    if (
      !info.isFile() ||
      info.dev !== before.dev ||
      info.ino !== before.ino ||
      info.mode !== before.mode ||
      !Number.isSafeInteger(info.size)
    )
      return false;
    const hash = createHash("sha1").update(`blob ${info.size}\0`);
    let length = 0;
    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      length += bytesRead;
      if (length > info.size) return false;
      hash.update(buffer.subarray(0, bytesRead));
    }
    const after = await handle.stat();
    const current = await lstat(path);
    return (
      length === info.size &&
      after.size === info.size &&
      after.mode === info.mode &&
      after.mtimeMs === info.mtimeMs &&
      after.ctimeMs === info.ctimeMs &&
      current.dev === info.dev &&
      current.ino === info.ino &&
      current.mode === info.mode &&
      hash.digest("hex") === entry.oid
    );
  } finally {
    await handle.close();
  }
}

async function trackedWorktreeDirty(directory: string): Promise<boolean> {
  const root = await realpath(directory);
  const head = await gitRead(root, "ls-tree", "-r", "-z", "--full-tree", "HEAD");
  const index = await gitRead(root, "ls-files", "--stage", "-z");
  const committed = trackedEntries(head, false);
  const staged = trackedEntries(index, true);
  let dirty = committed.size !== staged.size;
  const buffer = Buffer.alloc(64 * 1024);
  for (const entry of staged.values()) {
    const original = committed.get(entry.path);
    if (original?.oid !== entry.oid || original.mode !== entry.mode) dirty = true;
    try {
      if (!(await matchesDisk(root, entry, buffer))) dirty = true;
    } catch {
      // Missing/unreadable/raced paths cannot supply a clean observation.
      throw new Error("tracked-content-unavailable");
    }
  }
  if ((await gitRead(root, "ls-files", "--others", "--exclude-standard", "-z")).length > 0)
    dirty = true;
  if (
    (await gitRead(root, "ls-tree", "-r", "-z", "--full-tree", "HEAD")) !== head ||
    (await gitRead(root, "ls-files", "--stage", "-z")) !== index
  ) {
    throw new Error("source-changed-during-observation");
  }
  return dirty;
}

export async function observeLocal(
  directory: string,
  expectedSource?: string,
): Promise<Pick<SourceObservation, "localCommit" | "dirty" | "branches" | "worktrees">> {
  async function git(...args: string[]): Promise<string> {
    return gitRead(directory, ...args);
  }
  if (expectedSource) {
    const origin = await git("remote", "get-url", "origin");
    if (
      ![
        `https://github.com/libre-ai/${expectedSource}.git`,
        `git@github.com:libre-ai/${expectedSource}.git`,
        `https://github.com/libre-ai/${expectedSource}`,
      ].includes(origin)
    )
      throw new Error("source-origin-mismatch");
  }
  const localCommit = await git("rev-parse", "refs/heads/main");
  const root = await realpath(directory);
  const dirty = await trackedWorktreeDirty(root);
  const branches = (
    await git(
      "for-each-ref",
      "--format=%(refname) %(objectname)",
      "refs/heads",
      "refs/remotes",
      "refs/replace",
    )
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [ref, commit] = line.split(" ");
      if (!ref || !commit) throw new Error("invalid-ref");
      return { ref, commit };
    })
    .filter(
      (item) =>
        item.ref !== "refs/heads/main" &&
        item.ref !== "refs/remotes/origin/main" &&
        item.ref !== "refs/remotes/origin/HEAD",
    );
  const worktrees: SourceObservation["worktrees"] = [];
  const records = (await git("worktree", "list", "--porcelain", "-z"))
    .split("\0\0")
    .filter(Boolean);
  for (const record of records) {
    const fields = record.split("\0");
    const path = fields.find((field) => field.startsWith("worktree "))?.slice(9);
    const commit = fields.find((field) => field.startsWith("HEAD "))?.slice(5);
    if (!path || !commit) throw new Error("invalid-worktree");
    const treeDirty = (await realpath(path)) === root ? dirty : await trackedWorktreeDirty(path);
    worktrees.push({ path, commit, dirty: treeDirty, detached: fields.includes("detached") });
  }
  return { localCommit, dirty, branches, worktrees };
}
function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid-github-response");
  return value as Record<string, unknown>;
}
export async function observeSources(
  portfolio: Portfolio,
  root: string,
): Promise<SourceObservation[]> {
  let identityVerified = false;
  try {
    identityVerified =
      object(JSON.parse(await command(["gh", "api", "user"]))).login === "constantin-jais";
  } catch {
    identityVerified = false;
  }
  const observations: SourceObservation[] = [];
  for (const item of portfolio.sources) {
    const observation: SourceObservation = {
      source: item.source,
      identityVerified,
      accessible: false,
      defaultBranch: "",
      remoteCommit: "",
      localCommit: "",
      dirty: true,
      branches: [],
      worktrees: [],
      openPullRequests: [],
      errors: [],
    };
    try {
      Object.assign(observation, await observeLocal(join(root, item.localDirectory), item.source));
    } catch {
      observation.errors.push("local-unavailable");
    }
    try {
      const repo = object(
        JSON.parse(await command(["gh", "api", `repos/libre-ai/${item.source}`])),
      );
      if (
        repo.full_name !== `libre-ai/${item.source}` ||
        repo.visibility !== "public" ||
        repo.default_branch !== "main"
      )
        throw new Error("source-mismatch");
      observation.defaultBranch = "main";
      // ls-remote observes live refs without fetching objects or updating tracking refs.
      const refs = await command([
        "git",
        "ls-remote",
        "--heads",
        `https://github.com/libre-ai/${item.source}.git`,
      ]);
      for (const line of refs.split("\n").filter(Boolean)) {
        const [commit, ref] = line.split("\t");
        if (!commit || !ref || !/^[a-f0-9]{40}$/.test(commit))
          throw new Error("invalid-remote-ref");
        if (ref === "refs/heads/main") observation.remoteCommit = commit;
        else observation.branches.push({ ref: `live:${ref}`, commit });
      }
      const pages: unknown = JSON.parse(
        await command([
          "gh",
          "api",
          "--paginate",
          "--slurp",
          `repos/libre-ai/${item.source}/pulls?state=open&per_page=100`,
        ]),
      );
      if (!Array.isArray(pages)) throw new Error("invalid-pr-pages");
      for (const page of pages) {
        if (!Array.isArray(page)) throw new Error("invalid-pr-page");
        for (const raw of page) {
          const pr = object(raw);
          if (!Number.isSafeInteger(pr.number) || typeof pr.number !== "number")
            throw new Error("invalid-pr");
          observation.openPullRequests.push(pr.number);
          const head = object(pr.head);
          const fork = object(head.repo);
          if (
            typeof fork.full_name !== "string" ||
            !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(fork.full_name)
          )
            throw new Error("fork-unavailable");
          await command(["gh", "api", `repos/${fork.full_name}`]);
        }
      }
      observation.accessible = true;
    } catch {
      observation.errors.push("remote-unavailable");
    }
    observations.push(observation);
  }
  return observations;
}
