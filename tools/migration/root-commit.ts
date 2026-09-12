import { constants } from "node:fs";
import { lstat, open, readdir, realpath, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { type ComposedFile, type ComposedTarget, compositionGit, sha256 } from "./compose-target";
import { digestEvidence } from "./license-audit";
export interface RootPreparation {
  surfaceImplementationDigest: string;
  releaseImplementationDigest: string;
  sourceFreezeDigest: string;
  reviewDigest: string;
  comparison: ComposedTarget;
  licenses: { path: string; digest: string }[];
}
export interface RootPolicy {
  treeDigest: string;
  compositionEvidenceDigest: string;
  preparationDigest: string;
  signerPublicKey: string;
  authorName: string;
  authorEmail: string;
}
async function diskFiles(directory: string): Promise<ComposedFile[]> {
  if ((await realpath(directory)) !== resolve(directory)) throw new Error("directory");
  const result: ComposedFile[] = [];
  let total = 0;
  async function walk(relative: string): Promise<void> {
    for (const entry of await readdir(join(directory, relative), { withFileTypes: true })) {
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.name.toLowerCase() === ".git" || entry.isSymbolicLink())
        throw new Error("unexpected");
      if (entry.isDirectory()) {
        await walk(path);
        continue;
      }
      if (!entry.isFile()) throw new Error("nonregular");
      const file = await open(
        join(directory, path),
        constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
      );
      try {
        const stat = await file.stat();
        if (!stat.isFile() || stat.size > 16 * 1024 * 1024) throw new Error("size");
        total += stat.size;
        if (total > 256 * 1024 * 1024) throw new Error("size");
        const bytes = Buffer.alloc(stat.size + 1);
        let offset = 0;
        while (offset < bytes.length) {
          const { bytesRead } = await file.read(bytes, offset, bytes.length - offset, null);
          if (!bytesRead) break;
          offset += bytesRead;
        }
        if (offset !== stat.size) throw new Error("changed");
        result.push({
          path,
          digest: sha256(bytes.subarray(0, offset)),
          mode: stat.mode & 0o111 ? "100755" : "100644",
        });
      } finally {
        await file.close();
      }
    }
  }
  await walk("");
  return result.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
async function verifyTree(target: ComposedTarget): Promise<void> {
  const files = await diskFiles(target.directory);
  if (
    digestEvidence(files) !== target.treeDigest ||
    digestEvidence(target.files) !== target.treeDigest
  )
    throw new Error("tree");
}
/** Trusted review is separate from the preparation claims and the local signing key. */
export async function createSignedRootCommit(
  target: ComposedTarget,
  signingKey: string,
  preparation: RootPreparation,
  policy: RootPolicy,
): Promise<string> {
  try {
    if (
      ![
        preparation.surfaceImplementationDigest,
        preparation.releaseImplementationDigest,
        preparation.sourceFreezeDigest,
        preparation.reviewDigest,
      ].every((value) => /^[a-f0-9]{64}$/.test(value)) ||
      digestEvidence(preparation) !== policy.preparationDigest ||
      target.treeDigest !== policy.treeDigest ||
      target.compositionEvidenceDigest !== policy.compositionEvidenceDigest ||
      preparation.comparison.treeDigest !== target.treeDigest ||
      preparation.comparison.compositionEvidenceDigest !== target.compositionEvidenceDigest ||
      resolve(preparation.comparison.directory) === resolve(target.directory) ||
      preparation.licenses.length === 0
    )
      throw new Error("preparation");
    if (
      !/^[A-Za-z][A-Za-z ._-]{0,63}$/.test(policy.authorName) ||
      !/^(?:[0-9]+\+)?[a-zA-Z0-9-]+@users\.noreply\.github\.com$/.test(policy.authorEmail) ||
      !/^ssh-ed25519 [A-Za-z0-9+/]+={0,2}$/.test(policy.signerPublicKey)
    )
      throw new Error("identity");
    await verifyTree(target);
    await verifyTree(preparation.comparison);
    for (const license of preparation.licenses)
      if (
        !target.files.some((file) => file.path === license.path && file.digest === license.digest)
      )
        throw new Error("licenses");
    const key = await lstat(signingKey);
    if (!key.isFile() || key.isSymbolicLink() || key.mode & 0o077) throw new Error("key");
    await compositionGit(
      target.directory,
      "-c",
      "init.templateDir=",
      "init",
      "--initial-branch=main",
    );
    const allowed = join(target.directory, ".git", "allowed-signers");
    await writeFile(allowed, `${policy.authorEmail} ${policy.signerPublicKey}\n`, {
      flag: "wx",
      mode: 0o600,
    });
    // Ignore rules describe new working files, not the already reviewed tracked tree.
    // NUL-delimited literal paths retain exact names without broad forced staging or argv limits.
    const approvedPaths = join(target.directory, ".git", "reviewed-paths");
    await writeFile(approvedPaths, `${target.files.map((file) => file.path).join("\0")}\0`, {
      flag: "wx",
      mode: 0o600,
    });
    await compositionGit(
      target.directory,
      "--literal-pathspecs",
      "-c",
      "core.autocrlf=false",
      "add",
      "--force",
      `--pathspec-from-file=${approvedPaths}`,
      "--pathspec-file-nul",
    );
    const tree = (await compositionGit(target.directory, "write-tree")).toString().trim();
    const entries = (await compositionGit(target.directory, "ls-tree", "-rz", tree))
      .toString("utf8")
      .split("\0")
      .filter(Boolean);
    const staged: ComposedFile[] = [];
    for (const entry of entries) {
      const match = /^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(entry);
      if (!match) throw new Error("tree");
      const [, mode, oid, path] = match;
      if (!oid || !path || (mode !== "100644" && mode !== "100755")) throw new Error("tree");
      staged.push({
        path,
        mode,
        digest: sha256(await compositionGit(target.directory, "cat-file", "blob", oid)),
      });
    }
    staged.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    if (digestEvidence(staged) !== target.treeDigest) throw new Error("normalized-tree");
    const commit = (
      await compositionGit(
        target.directory,
        "-c",
        `user.name=${policy.authorName}`,
        "-c",
        `user.email=${policy.authorEmail}`,
        "-c",
        "gpg.format=ssh",
        "-c",
        "gpg.ssh.program=/usr/bin/ssh-keygen",
        "-c",
        `user.signingkey=${resolve(signingKey)}`,
        "commit-tree",
        "-S",
        tree,
        "-m",
        "Initial reviewed repository tree",
      )
    )
      .toString()
      .trim();
    if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("commit");
    await compositionGit(
      target.directory,
      "-c",
      `gpg.ssh.allowedSignersFile=${allowed}`,
      "-c",
      "gpg.ssh.program=/usr/bin/ssh-keygen",
      "verify-commit",
      commit,
    );
    if (
      (await compositionGit(target.directory, "rev-list", "--parents", "-n", "1", commit))
        .toString()
        .trim() !== commit
    )
      throw new Error("parents");
    await compositionGit(target.directory, "update-ref", "refs/heads/main", commit, "0".repeat(40));
    return commit;
  } catch {
    throw new Error("root-commit-rejected");
  }
}
