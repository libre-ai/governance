import { expect, test } from "bun:test";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { composeTarget, compositionGit } from "./compose-target";
import { fixture, git, sha, trust } from "./fixtures/composition/fixture";
import { digestEvidence } from "./license-audit";
import { fileId } from "./reachability";
import { createSignedRootCommit, type RootPolicy, type RootPreparation } from "./root-commit";

test.each([
  false,
  true,
])("signed SSH root preserves the approved tree, including ignored tracked paths: %s", async (ignored) => {
  const f = await fixture();
  const out = await realpath(await mkdtemp(join(tmpdir(), "root-fixture-")));
  try {
    if (ignored) {
      await writeFile(join(f.root, ".gitignore"), "main.bin\n");
      await git(f.root, "add", ".gitignore");
      await git(
        f.root,
        "-c",
        "commit.gpgsign=false",
        "-c",
        "user.name=Synthetic",
        "-c",
        "user.email=fixture@example.invalid",
        "commit",
        "-qm",
        "Ignore fixture",
      );
      const commit = await git(f.root, "rev-parse", "HEAD");
      const source = f.input.sources[0];
      if (!source) throw new Error("fixture");
      source.commit = commit;
      f.input.files = f.input.files.map((file) => ({ ...file, sourceCommit: commit }));
      const main = f.input.files[0];
      if (!main) throw new Error("fixture");
      const ignore = { ...main, sourcePath: ".gitignore", sourceDigest: sha("main.bin\n") };
      f.input.files.push(ignore);
      const entry = fileId(main);
      f.input.entryPoints = [entry];
      f.input.edges = [{ consumer: entry, provider: fileId(ignore), kind: "build" }];
      f.input.decisions = f.input.files.map((file) => ({
        file: fileId(file),
        disposition:
          file.sourcePath === "dead.txt"
            ? { kind: "delete", reason: "dead" }
            : {
                kind: "retain",
                target: "db-inspect",
                targetPath: file.sourcePath,
                entryPoint: entry,
                ...(file.sourcePath === "LICENSE"
                  ? { supportFor: [entry], supportEvidenceDigest: "a".repeat(64) }
                  : {}),
              },
      }));
      f.input.licenses.files = f.input.licenses.files.map((file) => ({ ...file, commit }));
      const license = f.input.licenses.files[0];
      if (!license) throw new Error("fixture");
      f.input.licenses.files.push({
        ...license,
        path: ".gitignore",
        targetPath: ".gitignore",
        contentDigest: ignore.sourceDigest,
      });
      f.policy = trust(f.input);
    }

    const a = await composeTarget(f.input, f.policy, join(out, "one"));
    const b = await composeTarget(f.input, f.policy, join(out, "two"));
    const key = join(out, "synthetic-key");
    const gen = Bun.spawn(["ssh-keygen", "-q", "-t", "ed25519", "-N", "", "-f", key], {
      stdout: "ignore",
      stderr: "ignore",
    });
    expect(await gen.exited).toBe(0);
    const pub = (await readFile(`${key}.pub`, "utf8")).trim().split(" ").slice(0, 2).join(" ");
    const license = a.files.find((file) => file.path === "LICENSE");
    if (!license) throw new Error("fixture");
    const preparation: RootPreparation = {
      surfaceImplementationDigest: "a".repeat(64),
      releaseImplementationDigest: "b".repeat(64),
      sourceFreezeDigest: "c".repeat(64),
      reviewDigest: "d".repeat(64),
      comparison: b,
      licenses: [{ path: license.path, digest: license.digest }],
    };
    const policy: RootPolicy = {
      treeDigest: a.treeDigest,
      compositionEvidenceDigest: a.compositionEvidenceDigest,
      preparationDigest: digestEvidence(preparation),
      signerPublicKey: pub,
      authorName: "Synthetic Fixture",
      authorEmail: "1+synthetic@users.noreply.github.com",
    };
    await expect(
      createSignedRootCommit(a, key, { ...preparation, surfaceImplementationDigest: "" }, policy),
    ).rejects.toThrow("root-commit-rejected");
    expect(await Bun.file(join(a.directory, ".git", "HEAD")).exists()).toBe(false);
    await expect(
      createSignedRootCommit(a, key, preparation, {
        ...policy,
        authorEmail: "private@example.invalid",
      }),
    ).rejects.toThrow("root-commit-rejected");
    await writeFile(join(a.directory, "main.bin"), "unreviewed mutation");
    await expect(createSignedRootCommit(a, key, preparation, policy)).rejects.toThrow(
      "root-commit-rejected",
    );
    await writeFile(join(a.directory, "main.bin"), Buffer.from([255, 0, 13, 10]));
    const commit = await createSignedRootCommit(a, key, preparation, policy);
    expect(commit).toMatch(/^[a-f0-9]{40}$/);
    expect(
      (await compositionGit(a.directory, "rev-list", "--parents", "-n", "1", commit))
        .toString()
        .trim(),
    ).toBe(commit);
    expect(
      (await compositionGit(a.directory, "show", "-s", "--format=%ae", commit)).toString().trim(),
    ).toBe(policy.authorEmail);
    expect((await compositionGit(a.directory, "cat-file", "commit", commit)).toString()).toContain(
      "gpgsig -----BEGIN SSH SIGNATURE-----",
    );
    await compositionGit(
      a.directory,
      "-c",
      `gpg.ssh.allowedSignersFile=${join(a.directory, ".git", "allowed-signers")}`,
      "verify-commit",
      commit,
    );
    await expect(createSignedRootCommit(a, key, preparation, policy)).rejects.toThrow(
      "root-commit-rejected",
    );
    await writeFile(join(b.directory, "LICENSE"), "changed after review");
    await expect(
      createSignedRootCommit(b, key, { ...preparation, comparison: a }, policy),
    ).rejects.toThrow("root-commit-rejected");
  } finally {
    await rm(f.root, { recursive: true, force: true });
    await rm(out, { recursive: true, force: true });
  }
});
