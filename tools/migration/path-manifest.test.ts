import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PathDecision } from "./path-manifest";
import { buildPathManifest } from "./path-manifest";
import type { ImmutableFile } from "./reachability";
import { fileId } from "./reachability";

function file(path: string, role: ImmutableFile["role"] = "code"): ImmutableFile {
  return {
    source: "missions",
    sourceCommit: "a".repeat(40),
    sourcePath: path,
    sourceDigest: "b".repeat(64),
    role,
    sensitivity: "clear",
    license: "current",
    provenanceDigest: null,
    dependencyAnalysis: { complete: true, evidenceDigest: "c".repeat(64) },
    requiredNotices: [],
  };
}
function retain(item: ImmutableFile, entry: ImmutableFile = item): PathDecision {
  return {
    file: fileId(item),
    disposition: {
      kind: "retain",
      target: "missions",
      targetPath: item.sourcePath,
      entryPoint: fileId(entry),
    },
  };
}
test("every immutable tracked file has exactly one disposition", () => {
  const a = file("main.ts"),
    b = file("unused.ts");
  const decisions: PathDecision[] = [
    retain(a),
    { file: fileId(b), disposition: { kind: "delete", reason: "dead" } },
  ];
  const report = buildPathManifest([a, b], [fileId(a)], [], decisions);
  expect(report.records).toHaveLength(2);
  expect(report.unclassifiedPaths).toBe(0);
  expect(() => buildPathManifest([a, b], [fileId(a)], [], [retain(a)])).toThrow();
  expect(() => buildPathManifest([a], [fileId(a)], [], [retain(a), retain(a)])).toThrow();
});
test("code reachable only from a test cannot be retained", () => {
  const a = file("main.ts"),
    b = file("unused.ts"),
    testFile = file("only.test.ts", "test");
  expect(() =>
    buildPathManifest(
      [a, b, testFile],
      [fileId(a)],
      [{ consumer: fileId(testFile), provider: fileId(b), kind: "test" }],
      [
        retain(a),
        retain(b, a),
        { file: fileId(testFile), disposition: { kind: "delete", reason: "obsolete" } },
      ],
    ),
  ).toThrow();
});
for (const path of [
  "node_modules/a.ts",
  "dist/a.js",
  "coverage/a.json",
  "target/a.rs",
  "schemas/agent-lineage.v1.schema.json",
])
  test(`rejects retained forbidden ${path}`, () => {
    const f = file(path);
    expect(() => buildPathManifest([f], [fileId(f)], [], [retain(f)])).toThrow();
  });
for (const mutation of ["traversal", "collision", "sensitive", "license", "vendor", "generated"])
  test(`refuses ${mutation}`, () => {
    const a = file("main.ts"),
      b = file("lib.ts");
    if (mutation === "sensitive") a.sensitivity = "present";
    if (mutation === "license") a.license = "obsolete";
    if (mutation === "vendor") a.role = "vendor";
    if (mutation === "generated") a.role = "generated";
    const decision = retain(a);
    if (decision.disposition.kind === "retain")
      decision.disposition.targetPath = mutation === "traversal" ? "../escape" : a.sourcePath;
    const second = retain(b, a);
    if (mutation === "collision" && second.disposition.kind === "retain")
      second.disposition.targetPath = a.sourcePath;
    expect(() =>
      buildPathManifest(
        [a, b],
        [fileId(a)],
        [{ consumer: fileId(a), provider: fileId(b), kind: "runtime" }],
        [decision, second],
      ),
    ).toThrow();
  });
test("supporting tests docs migrations examples and notices require explicit reachable support", () => {
  const root = file("src/main.ts");
  const support = [
    file("src/main.test.ts", "test"),
    file("docs/api.md", "documentation"),
    file("migrations/001.sql", "migration"),
    file("examples/example.ts", "example"),
    file("NOTICE", "notice"),
  ];
  const decisions: PathDecision[] = support.map((item) => ({
    file: fileId(item),
    disposition: {
      kind: "retain" as const,
      target: "missions",
      targetPath: item.sourcePath,
      entryPoint: fileId(root),
      supportFor: [fileId(root)],
      supportEvidenceDigest: "e".repeat(64),
    },
  }));
  expect(
    buildPathManifest([root, ...support], [fileId(root)], [], [retain(root), ...decisions]).records,
  ).toHaveLength(6);
  const firstDecision = decisions[0];
  if (firstDecision?.disposition.kind === "retain")
    delete firstDecision.disposition.supportEvidenceDigest;
  expect(() =>
    buildPathManifest([root, ...support], [fileId(root)], [], [retain(root), ...decisions]),
  ).toThrow();
});

test("generated output needs a reachable retained canonical source and cannot be orphaned", () => {
  const canonical = file("schemas/public.schema.json", "contract"),
    generated = file("sdk/types.ts", "generated");
  const decisions: PathDecision[] = [
    retain(canonical, generated),
    {
      file: fileId(generated),
      disposition: {
        kind: "generate",
        target: "contracts",
        targetPath: "generated/types.ts",
        canonicalSource: fileId(canonical),
      },
    },
  ];
  if (decisions[0]?.disposition.kind === "retain") decisions[0].disposition.target = "contracts";
  const edges = [
    { consumer: fileId(generated), provider: fileId(canonical), kind: "build" as const },
  ];
  expect(
    buildPathManifest([canonical, generated], [fileId(generated)], edges, decisions).records,
  ).toHaveLength(2);
  if (decisions[0]?.disposition.kind === "retain")
    decisions[0].disposition.entryPoint = fileId(canonical);
  expect(() =>
    buildPathManifest([canonical, generated], [fileId(canonical)], [], decisions),
  ).toThrow();
});
test("a retained file cannot cite a root composed into another target", () => {
  const root = file("main.ts"),
    lib = file("lib.ts");
  const r = retain(root),
    l = retain(lib, root);
  if (l.disposition.kind === "retain") l.disposition.target = "app-kit";
  expect(() =>
    buildPathManifest(
      [root, lib],
      [fileId(root)],
      [{ consumer: fileId(root), provider: fileId(lib), kind: "runtime" }],
      [r, l],
    ),
  ).toThrow();
});
test("required third-party notices cannot be dropped", () => {
  const root = file("main.ts", "vendor"),
    notice = file("NOTICE", "notice");
  root.provenanceDigest = "e".repeat(64);
  root.requiredNotices = [fileId(notice)];
  expect(() =>
    buildPathManifest(
      [root, notice],
      [fileId(root)],
      [],
      [retain(root), { file: fileId(notice), disposition: { kind: "delete", reason: "obsolete" } }],
    ),
  ).toThrow();
});

test("CLI covers the full fixture inventory and emits deterministic target allow-lists", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "path-manifest-fixture-"));
  const snapshot = new URL("./fixtures/paths/snapshot.v1.json", import.meta.url).pathname;
  const decisions = new URL("./fixtures/paths/allow-list.v1.yaml", import.meta.url).pathname;
  async function run(
    input: string,
    output: string,
  ): Promise<{ code: number; out: string; err: string }> {
    const proc = Bun.spawn(
      [
        process.execPath,
        new URL("./path-manifest.ts", import.meta.url).pathname,
        "--snapshot",
        snapshot,
        "--decisions",
        input,
        "--allow-lists",
        output,
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    const [out, err] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    return { code: await proc.exited, out, err };
  }
  const a = await run(decisions, join(temporary, "first"));
  expect(a.code).toBe(0);
  const manifest = JSON.parse(a.out);
  const tree = (
    await readFile(new URL("./fixtures/paths/source-tree.txt", import.meta.url), "utf8")
  )
    .trim()
    .split("\n");
  expect(
    manifest.records.map((record: { sourcePath: string }) => record.sourcePath).sort(),
  ).toEqual(tree);
  expect(a.out).not.toContain(temporary);
  const first = await readFile(join(temporary, "first", "missions.v1.yaml"), "utf8");
  expect(JSON.parse(first).records).toHaveLength(4);
  const b = await run(decisions, join(temporary, "second"));
  expect(b.code).toBe(0);
  expect(b.out).toBe(a.out);
  expect(await readFile(join(temporary, "second", "missions.v1.yaml"), "utf8")).toBe(first);
  const broken = join(temporary, "broken.json");
  await writeFile(broken, "[]");
  const blocked = await run(broken, join(temporary, "blocked"));
  expect(blocked.code).toBe(1);
  expect(blocked.out).toBe("");
  expect(blocked.err).toBe("path-manifest-blocked\n");
});

test("approved dot-github source and target remain admissible", () => {
  const profile = file("profile/README.md", "documentation");
  profile.source = ".github";
  const decision = retain(profile);
  if (decision.disposition.kind === "retain") decision.disposition.target = ".github";
  const manifest = buildPathManifest([profile], [fileId(profile)], [], [decision]);
  expect(manifest.records[0]?.source).toBe(".github");
});
test("file-versus-directory target collisions are refused", () => {
  const root = file("main.ts"),
    lib = file("lib.ts");
  const a = retain(root),
    b = retain(lib, root);
  if (a.disposition.kind === "retain") a.disposition.targetPath = "src";
  if (b.disposition.kind === "retain") b.disposition.targetPath = "src/lib.ts";
  expect(() =>
    buildPathManifest(
      [root, lib],
      [fileId(root)],
      [{ consumer: fileId(root), provider: fileId(lib), kind: "runtime" }],
      [a, b],
    ),
  ).toThrow();
});
test("input ordering cannot change immutable manifest digests", () => {
  const a = file("main.ts"),
    b = file("lib.ts");
  const edges = [{ consumer: fileId(a), provider: fileId(b), kind: "runtime" as const }];
  const decisions = [retain(a), retain(b, a)];
  const first = buildPathManifest([a, b], [fileId(a)], edges, decisions);
  const other = Object.fromEntries(Object.entries(a).reverse()) as unknown as ImmutableFile;
  expect(buildPathManifest([b, other], [fileId(a)], edges, decisions.reverse()).digest).toBe(
    first.digest,
  );
});

test("total coverage matches a real immutable Git tree inventory", async () => {
  const root = await mkdtemp(join(tmpdir(), "path-inventory-git-"));
  async function git(...args: string[]): Promise<string> {
    const proc = Bun.spawn(["git", "-C", root, ...args], { stdout: "pipe", stderr: "pipe" });
    const out = await new Response(proc.stdout).text();
    await new Response(proc.stderr).text();
    expect(await proc.exited).toBe(0);
    return out.trim();
  }
  await git("init", "--initial-branch=main");
  const contents = {
    "main.ts": "export const value = 1;\n",
    "unused.ts": "export const unused = 2;\n",
  };
  for (const [path, bytes] of Object.entries(contents)) await writeFile(join(root, path), bytes);
  await git("add", "main.ts", "unused.ts");
  await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "commit",
    "-m",
    "fixture",
  );
  const commit = await git("rev-parse", "HEAD");
  const paths = (await git("ls-files")).split("\n");
  const files = paths.map((path) => ({
    ...file(path),
    sourceCommit: commit,
    sourceDigest: createHash("sha256")
      .update(contents[path as keyof typeof contents])
      .digest("hex"),
  }));
  const main = files.find((item) => item.sourcePath === "main.ts");
  if (!main) throw new Error("fixture");
  const decisions: PathDecision[] = files.map((item) =>
    item === main
      ? retain(item)
      : { file: fileId(item), disposition: { kind: "delete", reason: "dead" } },
  );
  const report = buildPathManifest(files, [fileId(main)], [], decisions);
  expect(report.records.map((record) => record.sourcePath)).toEqual(paths);
  expect(report.records.every((record) => record.sourceCommit === commit)).toBe(true);
  expect(await git("rev-parse", "HEAD")).toBe(commit);
});

test("realistic route, whitespace and Unicode paths remain representable", () => {
  for (const path of ["src/app/[id]/(group)/page.tsx", "src/routes/café page.tsx"]) {
    const route = file(path);
    expect(
      buildPathManifest([route], [fileId(route)], [], [retain(route)]).records[0]?.sourcePath,
    ).toBe(path);
  }
});
test("Git metadata paths cannot enter snapshots or target allow-lists", () => {
  const metadata = file(".git/config", "documentation");
  expect(() => buildPathManifest([metadata], [fileId(metadata)], [], [retain(metadata)])).toThrow();
  const root = file("main.ts");
  const decision = retain(root);
  if (decision.disposition.kind === "retain") decision.disposition.targetPath = ".git/config";
  expect(() => buildPathManifest([root], [fileId(root)], [], [decision])).toThrow();
});
