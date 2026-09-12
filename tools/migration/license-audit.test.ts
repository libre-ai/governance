import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  auditLicenses,
  digestEvidence,
  type LicenseInput,
  type LicensePolicy,
} from "./license-audit";

function first<T>(items: T[]): T {
  const item = items[0];
  if (item === undefined) throw new Error("missing-fixture");
  return item;
}
function fixture(): LicenseInput {
  return {
    schemaVersion: "license-input.v1",
    files: [
      {
        source: "source-a",
        commit: "a".repeat(40),
        path: "src/core.ts",
        contentDigest: "b".repeat(64),
        target: "target-a",
        targetPath: "src/core.ts",
        kind: "code",
        sourceLicense: "MIT",
        targetLicense: "Apache-2.0",
        authorship: "known",
        reuseEvidence: ["1".repeat(64)],
        repositoryLicenseEvidence: "2".repeat(64),
        historyEvidence: "3".repeat(64),
        signoffEvidence: ["4".repeat(64)],
        rightsEvidence: ["5".repeat(64)],
        requiredNotices: [],
        retainedNotices: [],
        obsoleteLicense: false,
        historyDeletionRevokesLicense: false,
      },
    ],
  };
}
function policy(input: LicenseInput): LicensePolicy {
  return {
    schemaVersion: "license-policy.v1",
    inventoryDigest: digestEvidence(
      input.files.map(({ source, commit, path, contentDigest, target, targetPath, kind }) => ({
        source,
        commit,
        path,
        contentDigest,
        target,
        targetPath,
        kind,
      })),
    ),
    reviews: input.files.map((file) => ({
      evidenceDigest: digestEvidence(file),
      reviewEvidence: "6".repeat(64),
      compatibility: "approved",
      rights: "approved",
    })),
  };
}
describe("license evidence gate", () => {
  test("complete independently reviewed rights accepted", () =>
    expect(auditLicenses(fixture(), policy(fixture())).accepted).toBe(true));
  test.each([
    "authorship",
    "targetLicense",
    "rightsEvidence",
    "obsoleteLicense",
    "historyDeletionRevokesLicense",
    "historyEvidence",
    "reuseEvidence",
    "repositoryLicenseEvidence",
  ])("rejects invalid %s even if review is supplied", (key) => {
    const input = fixture();
    const file = first(input.files);
    Object.assign(file, {
      [key]: (
        {
          authorship: "unknown",
          targetLicense: "GPL-3.0-only",
          rightsEvidence: [],
          obsoleteLicense: true,
          historyDeletionRevokesLicense: true,
          historyEvidence: "",
          reuseEvidence: [],
          repositoryLicenseEvidence: "",
        } as Record<string, unknown>
      )[key],
    });
    expect(() => auditLicenses(input, policy(input))).not.toThrow();
    expect(auditLicenses(input, policy(input)).accepted).toBe(false);
  });
  test("DCO never substitutes for reviewed rights", () => {
    const input = fixture();
    const trust = policy(input);
    first(trust.reviews).rights = "rejected";
    expect(auditLicenses(input, trust).accepted).toBe(false);
  });
  test("compatibility requires independent approval", () => {
    const input = fixture();
    const trust = policy(input);
    first(trust.reviews).compatibility = "rejected";
    expect(auditLicenses(input, trust).accepted).toBe(false);
  });
  test("unreviewed or altered evidence rejected", () => {
    const input = fixture();
    const trust = policy(input);
    first(input.files).sourceLicense = "BSD-3-Clause";
    expect(auditLicenses(input, trust).accepted).toBe(false);
  });
  test("missing inventory paths and changed immutable bytes rejected", () => {
    const input = fixture();
    const trust = policy(input);
    first(input.files).contentDigest = "c".repeat(64);
    expect(auditLicenses(input, trust).accepted).toBe(false);
    input.files = [];
    expect(auditLicenses(input, trust).accepted).toBe(false);
  });
  test("required third party notice must survive exactly", () => {
    const input = fixture();
    const file = first(input.files);
    file.requiredNotices = [{ path: "NOTICE", contentDigest: "7".repeat(64) }];
    expect(auditLicenses(input, policy(input)).accepted).toBe(false);
    file.retainedNotices = [...file.requiredNotices];
    expect(auditLicenses(input, policy(input)).accepted).toBe(true);
    file.retainedNotices[0] = { path: "NOTICE", contentDigest: "8".repeat(64) };
    expect(auditLicenses(input, policy(input)).accepted).toBe(false);
  });
  test("duplicate target paths rejected", () => {
    const input = fixture();
    input.files.push(structuredClone(first(input.files)));
    expect(auditLicenses(input, policy(input)).accepted).toBe(false);
  });
  test.each([
    null,
    {},
    { schemaVersion: "license-input.v1", files: [], policy: {} },
    { schemaVersion: "license-input.v1", files: [{ path: "private@example.org" }] },
  ])("malformed input stays opaque", (input) => {
    const result = auditLicenses(input, policy(fixture()));
    expect(result.accepted).toBe(false);
    expect(JSON.stringify(result)).not.toContain("private@");
  });
  test("input cannot supply its own review policy", () => {
    const input = { ...fixture(), policy: policy(fixture()) };
    expect(auditLicenses(input, policy(fixture())).accepted).toBe(false);
  });
  test("digest is invariant to JSON object ordering", () =>
    expect(digestEvidence({ a: 1, b: 2 })).toBe(digestEvidence({ b: 2, a: 1 })));
  test("CLI pins independent policy, returns opaque counts and fails closed", async () => {
    const dir = await mkdtemp(join(tmpdir(), "license-test-"));
    try {
      const input = fixture();
      const policyBytes = JSON.stringify(policy(input));
      const pin = createHash("sha256").update(policyBytes).digest("hex");
      await writeFile(join(dir, "input.json"), JSON.stringify(input));
      await writeFile(join(dir, "policy.json"), policyBytes);
      const run = async (hash: string) => {
        const child = Bun.spawn(
          [
            process.execPath,
            join(import.meta.dir, "license-audit.ts"),
            "--input",
            join(dir, "input.json"),
            "--policy",
            join(dir, "policy.json"),
            "--policy-sha256",
            hash,
          ],
          { stdout: "pipe", stderr: "pipe" },
        );
        return {
          exit: await child.exited,
          out: await new Response(child.stdout).text(),
          err: await new Response(child.stderr).text(),
        };
      };
      expect(await run(pin)).toEqual({
        exit: 0,
        out: '{"accepted":true,"acceptedCount":1,"rejectedCount":0}\n',
        err: "",
      });
      expect((await run("0".repeat(64))).exit).toBe(1);
      first(input.files).authorship = "unknown";
      await writeFile(join(dir, "input.json"), JSON.stringify(input));
      const rejected = await run(pin);
      expect(rejected.exit).toBe(1);
      expect(rejected.out).not.toContain("src/core");
      expect(rejected.err).toBe("");
      expect(await readFile(join(dir, "policy.json"), "utf8")).toBe(policyBytes);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

test("immutable Git provenance records blobs and signoffs without identities or mutable worktree bytes", async () => {
  const { collectLicenseProvenance } = await import("./license-audit");
  const dir = await mkdtemp(join(tmpdir(), "license-git-"));
  async function git(...args: string[]): Promise<string> {
    const child = Bun.spawn(["git", "-C", dir, ...args], { stdout: "pipe", stderr: "pipe" });
    const out = await new Response(child.stdout).text();
    expect(await child.exited).toBe(0);
    return out.trim();
  }
  try {
    await git("init", "-q");
    await git("config", "user.name", "Synthetic Fixture");
    await git("config", "user.email", "fixture@example.invalid");
    for (const path of ["code.ts", "LICENSE", "REUSE.toml", "NOTICE"])
      await writeFile(join(dir, path), `${path}\n`);
    await git("add", ".");
    await git(
      "-c",
      "commit.gpgsign=false",
      "commit",
      "-q",
      "--signoff",
      "-m",
      "Synthetic provenance",
    );
    const commit = await git("rev-parse", "HEAD");
    const request = {
      repository: dir,
      commit,
      path: "code.ts",
      licensePaths: ["LICENSE"],
      reusePaths: ["REUSE.toml"],
      noticePaths: ["NOTICE"],
    };
    const first = await collectLicenseProvenance(request);
    expect(first.contentOid).toBe(await git("rev-parse", `${commit}:code.ts`));
    expect(first.contributions).toEqual([{ commit, hasSignoff: true }]);
    expect(first.licenseBlobs[0]?.oid).toBe(await git("rev-parse", `${commit}:LICENSE`));
    expect(first.reuseBlobs).toHaveLength(1);
    expect(first.noticeBlobs).toHaveLength(1);
    expect(JSON.stringify(first)).not.toContain("fixture@");
    expect(JSON.stringify(first)).not.toContain(dir);
    await writeFile(join(dir, "code.ts"), "modified worktree");
    await writeFile(join(dir, "LICENSE"), "modified license");
    expect(await collectLicenseProvenance(request)).toEqual(first);
    await git("hash-object", "-w", "LICENSE");
    const replacement = await git("hash-object", "LICENSE");
    await git("replace", first.licenseBlobs[0]?.oid ?? "", replacement);
    expect(await collectLicenseProvenance(request)).toEqual(first);
    await git("replace", "-d", first.licenseBlobs[0]?.oid ?? "");
    await writeFile(join(dir, ".git", "shallow"), `${commit}\n`);
    await expect(collectLicenseProvenance(request)).rejects.toThrow("license-provenance-rejected");
    await rm(join(dir, ".git", "shallow"));
    await writeFile(join(dir, ".git", "info", "grafts"), `${commit}\n`);
    await expect(collectLicenseProvenance(request)).rejects.toThrow("license-provenance-rejected");
    await rm(join(dir, ".git", "info", "grafts"));

    await expect(collectLicenseProvenance({ ...request, path: "../outside" })).rejects.toThrow(
      "license-provenance-rejected",
    );
    await expect(collectLicenseProvenance({ ...request, commit: "HEAD" })).rejects.toThrow(
      "license-provenance-rejected",
    );
    await expect(
      collectLicenseProvenance({ ...request, licensePaths: ["missing"] }),
    ).rejects.toThrow("license-provenance-rejected");
    expect(await readFile(join(dir, "code.ts"), "utf8")).toBe("modified worktree");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test.each([
  "allowed",
  "unknown-owner",
  "required-notice",
])("checked-in %s fixture matches its verdict", async (name) => {
  const input = JSON.parse(
    await readFile(join(import.meta.dir, "fixtures/licenses", `${name}.json`), "utf8"),
  );
  const trust = JSON.parse(
    await readFile(join(import.meta.dir, "fixtures/licenses", `${name}.policy.json`), "utf8"),
  );
  expect(auditLicenses(input, trust).accepted).toBe(name === "allowed");
});

test("CLI rejects a named pipe without waiting for a writer", async () => {
  const dir = await mkdtemp(join(tmpdir(), "license-pipe-"));
  try {
    const pipe = join(dir, "pipe");
    const make = Bun.spawn(["mkfifo", pipe], { stdout: "ignore", stderr: "ignore" });
    expect(await make.exited).toBe(0);
    const child = Bun.spawn(
      [
        process.execPath,
        join(import.meta.dir, "license-audit.ts"),
        "--input",
        pipe,
        "--policy",
        pipe,
        "--policy-sha256",
        "0".repeat(64),
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, 700);
    const exit = await child.exited;
    clearTimeout(timer);
    expect(timedOut).toBe(false);
    expect(exit).toBe(1);
    expect(await new Response(child.stdout).text()).toBe(
      '{"accepted":false,"reason":"license-audit-rejected"}\n',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("approved organization-profile source and target accept explicit rights evidence", () => {
  const input = fixture();
  const file = first(input.files);
  file.source = ".github";
  file.target = ".github";
  file.path = "profile/README.md";
  file.targetPath = "profile/README.md";
  file.kind = "documentation";
  file.targetLicense = "CC-BY-4.0";
  expect(auditLicenses(input, policy(input)).accepted).toBe(true);
});

test("preserves rights evidence for ordinary plus-sign source paths", () => {
  const input = fixture();
  const file = first(input.files);
  file.path = "src/result+proof.ts";
  file.targetPath = "src/result+proof.ts";
  expect(auditLicenses(input, policy(input)).accepted).toBe(true);
});
