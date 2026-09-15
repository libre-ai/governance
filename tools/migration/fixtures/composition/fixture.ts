import { createHash } from "node:crypto";
import { mkdtemp, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ComposeTargetInput, CompositionPolicy } from "../../compose-target";
import { digestEvidence, type LicenseInput, type LicensePolicy } from "../../license-audit";
import { fileId, type ImmutableFile } from "../../reachability";
export function sha(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}
export async function git(root: string, ...args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", "-C", root, ...args], { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  if (await proc.exited) throw new Error("fixture-git-failed");
  return out.trim();
}
export function trust(input: ComposeTargetInput): CompositionPolicy {
  const licenses: LicensePolicy = {
    schemaVersion: "license-policy.v1",
    inventoryDigest: digestEvidence(
      input.licenses.files.map(
        ({ source, commit, path, contentDigest, target, targetPath, kind }) => ({
          source,
          commit,
          path,
          contentDigest,
          target,
          targetPath,
          kind,
        }),
      ),
    ),
    reviews: input.licenses.files.map((file) => ({
      evidenceDigest: digestEvidence(file),
      reviewEvidence: "9".repeat(64),
      rights: "approved",
      compatibility: "approved",
    })),
  };
  return {
    inputDigest: digestEvidence(input),
    licensePolicy: licenses,
    boundaryDigests: [],
    generationDigests: [],
    reviewEvidence: "8".repeat(64),
  };
}
export async function fixture(mainBytes = Buffer.from([0xff, 0, 13, 10])): Promise<{
  root: string;
  input: ComposeTargetInput;
  policy: CompositionPolicy;
}> {
  const root = await realpath(await mkdtemp(join(tmpdir(), "compose-fixture-")));
  await git(root, "init", "-q");
  await writeFile(join(root, "main.bin"), mainBytes);
  await writeFile(join(root, "LICENSE"), "Synthetic reviewed license\r\n");
  await writeFile(join(root, "dead.txt"), "not retained");
  await git(root, "add", ".");
  await git(root, "update-index", "--chmod=+x", "main.bin");
  await git(
    root,
    "-c",
    "commit.gpgsign=false",
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=fixture@example.invalid",
    "commit",
    "-qm",
    "Synthetic fixture",
  );
  const commit = await git(root, "rev-parse", "HEAD");
  const files: ImmutableFile[] = [
    {
      source: "db-inspect",
      sourceCommit: commit,
      sourcePath: "main.bin",
      sourceDigest: sha(mainBytes),
      role: "code",
      sensitivity: "clear",
      license: "current",
      provenanceDigest: null,
      dependencyAnalysis: { complete: true, evidenceDigest: "a".repeat(64) },
      requiredNotices: [],
    },
    {
      source: "db-inspect",
      sourceCommit: commit,
      sourcePath: "LICENSE",
      sourceDigest: sha("Synthetic reviewed license\r\n"),
      role: "notice",
      sensitivity: "clear",
      license: "current",
      provenanceDigest: null,
      dependencyAnalysis: { complete: true, evidenceDigest: "a".repeat(64) },
      requiredNotices: [],
    },
    {
      source: "db-inspect",
      sourceCommit: commit,
      sourcePath: "dead.txt",
      sourceDigest: sha("not retained"),
      role: "documentation",
      sensitivity: "clear",
      license: "current",
      provenanceDigest: null,
      dependencyAnalysis: { complete: true, evidenceDigest: "a".repeat(64) },
      requiredNotices: [],
    },
  ];
  const first = files[0];
  if (!first) throw new Error("fixture");
  const entry = fileId(first);
  const licenses: LicenseInput = {
    schemaVersion: "license-input.v1",
    files: files.slice(0, 2).map((file) => ({
      source: file.source,
      commit,
      path: file.sourcePath,
      contentDigest: file.sourceDigest,
      target: "db-inspect",
      targetPath: file.sourcePath,
      kind: "code",
      sourceLicense: "Apache-2.0",
      targetLicense: "Apache-2.0",
      authorship: "known",
      reuseEvidence: ["1".repeat(64)],
      repositoryLicenseEvidence: "2".repeat(64),
      historyEvidence: "3".repeat(64),
      signoffEvidence: [],
      rightsEvidence: ["4".repeat(64)],
      requiredNotices: [],
      retainedNotices: [],
      obsoleteLicense: false,
      historyDeletionRevokesLicense: false,
    })),
  };
  const input: ComposeTargetInput = {
    slug: "db-inspect",
    sources: [{ source: "db-inspect", commit, root }],
    files,
    entryPoints: [entry],
    edges: [],
    decisions: files.map((file, index) => ({
      file: fileId(file),
      disposition:
        index === 2
          ? { kind: "delete", reason: "dead" }
          : {
              kind: "retain",
              target: "db-inspect",
              targetPath: file.sourcePath,
              entryPoint: entry,
              ...(index === 1
                ? { supportFor: [entry], supportEvidenceDigest: "a".repeat(64) }
                : {}),
            },
    })),
    licenses,
    boundaries: [],
    generation: [],
  };
  return { root, input, policy: trust(input) };
}
