import { expect, test } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildDependencyGraph, collectSourceSnapshots } from "./dependency-graph";
import type { SourceSnapshot } from "./entry-points";

function source(source: string, files: Record<string, string>): SourceSnapshot {
  return { source, commit: "a".repeat(40), files };
}
test("runtime peer and dev dependencies have distinct evidence without invented consumers", () => {
  const graph = buildDependencyGraph([
    source("missions", {
      "package.json": JSON.stringify({
        name: "consumer",
        exports: "./index.ts",
        dependencies: { provider: "1.0.0" },
        devDependencies: { testlib: "1.0.0" },
        peerDependencies: { peer: "1.0.0" },
      }),
      "index.ts": "",
      "bun.lock":
        '{"lockfileVersion":1,"packages":{"provider":["provider@1.0.0"],"testlib":["testlib@1.0.0"],"peer":["peer@1.0.0"],},}',
    }),
    source("data", {
      "package.json": JSON.stringify({ name: "provider", exports: "./index.ts" }),
      "index.ts": "",
    }),
  ]);
  expect(graph.edges.find((e) => e.packageName === "provider")?.kind).toBe("runtime");
  expect(graph.edges.find((e) => e.packageName === "testlib")?.disposition).toBe("excluded-dev");
  expect(graph.edges.find((e) => e.packageName === "peer")?.kind).toBe("peer");
  expect(graph.edges.find((e) => e.packageName === "provider")?.provider).toBe("data");
  expect(graph.verifiedConsumerCount).toBe(null);
  expect(graph.unresolved.some((e) => e.reason === "reachability-unproved")).toBe(true);
});
test("Cargo workspace inherited normal build and dev edges are resolved", () => {
  const graph = buildDependencyGraph([
    source("orchestrator", {
      "Cargo.toml":
        '[workspace]\nmembers=["crates/app"]\n[workspace.dependencies]\nserde="=1.0.0"\n',
      "crates/app/Cargo.toml":
        '[package]\nname="app"\nversion="1.0.0"\n[dependencies]\nserde.workspace=true\n[build-dependencies]\ncc="1.0.0"\n[dev-dependencies]\ntestkit="1.0.0"\n',
      "crates/app/src/lib.rs": "",
      "Cargo.lock":
        'version=4\n[[package]]\nname="serde"\nversion="1.0.0"\nsource="registry+https://github.com/rust-lang/crates.io-index"\nchecksum="abc"\n',
    }),
  ]);
  expect(graph.edges.map((e) => e.kind).sort()).toEqual(["build", "dev", "runtime"]);
  expect(graph.edges.find((e) => e.packageName === "serde")?.resolution).toBe("registry-lock");
});
test("unlocked git refs and unsupported external file paths block resolution", () => {
  const graph = buildDependencyGraph([
    source("missions", {
      "package.json": JSON.stringify({
        dependencies: { a: "github:libre-ai/data#main", b: "file:../../outside" },
      }),
    }),
  ]);
  expect(graph.edges.every((e) => e.resolution === "unresolved")).toBe(true);
  expect(graph.unresolved.length).toBeGreaterThan(0);
});
test("graph byte order is stable", () => {
  const input = [
    source("missions", { "package.json": '{"name":"a"}' }),
    source("data", { "package.json": '{"name":"b"}' }),
  ];
  expect(buildDependencyGraph(input)).toEqual(buildDependencyGraph(input.reverse()));
});

test("virtual Cargo workspace missing members cannot disappear", () => {
  const graph = buildDependencyGraph([
    source("orchestrator", { "Cargo.toml": '[workspace]\nmembers=["missing"]\n' }),
  ]);
  expect(graph.unresolved.some((item) => item.reason === "workspace-member-unresolved")).toBe(true);
});
test("test-only consumers never enter declared production counts", () => {
  const graph = buildDependencyGraph([
    source("missions", {
      "package.json": JSON.stringify({
        name: "consumer",
        exports: "./only.test.ts",
        dependencies: { provider: "1.0.0" },
      }),
      "only.test.ts": "",
    }),
    source("data", {
      "package.json": '{"name":"provider","exports":"./index.ts"}',
      "index.ts": "",
    }),
  ]);
  expect(graph.declaredConsumerCounts).toEqual([]);
});
test("mismatched locked registry versions are unresolved", () => {
  const graph = buildDependencyGraph([
    source("missions", {
      "package.json": '{"dependencies":{"provider":"1.0.0"}}',
      "bun.lock": '{"packages":{"provider":["provider@2.0.0"]}}',
    }),
  ]);
  expect(graph.edges[0]?.resolution).toBe("unresolved");
});

test("CLI reads exact committed manifests without consuming dirty replacements or changing refs", async () => {
  const root = await mkdtemp(join(tmpdir(), "consumer-e2e-"));
  async function git(...args: string[]): Promise<string> {
    const proc = Bun.spawn(["git", "-C", root, ...args], { stdout: "pipe", stderr: "pipe" });
    const out = await new Response(proc.stdout).text();
    await new Response(proc.stderr).text();
    expect(await proc.exited).toBe(0);
    return out.trim();
  }
  await git("init", "--initial-branch=main");
  await git("remote", "add", "origin", "https://github.com/libre-ai/missions.git");
  for (const file of ["package.json", "bun.lock"])
    await writeFile(
      join(root, file),
      await readFile(
        new URL(
          `./fixtures/dependencies/${file === "package.json" ? "package.fixture.json" : file}`,
          import.meta.url,
        ),
        "utf8",
      ),
    );
  await writeFile(join(root, "index.ts"), "export const synthetic = true;\n");
  await git("add", "package.json", "bun.lock", "index.ts");
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
  const before = await git("show-ref");
  await writeFile(join(root, "package.json"), "broken dirty replacement");
  const input = join(root, "input.json");
  await writeFile(
    input,
    JSON.stringify({
      schemaVersion: "consumer-input.v1",
      sources: [{ source: "missions", root, commit }],
    }),
  );
  async function run(): Promise<string> {
    const proc = Bun.spawn(
      [
        process.execPath,
        new URL("./dependency-graph.ts", import.meta.url).pathname,
        "--sources",
        input,
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    const out = await new Response(proc.stdout).text();
    const err = await new Response(proc.stderr).text();
    expect(await proc.exited).toBe(1);
    expect(err).toBe("");
    expect(out).not.toContain(root);
    return out;
  }
  const first = await run();
  const graph = JSON.parse(first);
  expect(graph.sources[0].commit).toBe(commit);
  expect(
    graph.edges.find((edge: { packageName: string }) => edge.packageName === "synthetic-provider")
      .resolution,
  ).toBe("registry-lock");
  expect(graph.entries[0].path).toBe("index.ts");
  expect(await run()).toBe(first);
  expect(await git("show-ref")).toBe(before);
  await writeFile(join(root, "package.json"), '{"name":"substituted","exports":"./index.ts"}');
  await git("add", "package.json");
  const tree = await git("write-tree");
  const replacement = await git(
    "-c",
    "user.name=Synthetic",
    "-c",
    "user.email=synthetic@example.invalid",
    "commit-tree",
    tree,
    "-m",
    "replacement",
  );
  await git("replace", commit, replacement);
  const replacedRefs = await git("show-ref");
  await expect(
    collectSourceSnapshots({
      schemaVersion: "consumer-input.v1",
      sources: [{ source: "missions", root, commit }],
    }),
  ).rejects.toThrow("source-replacement-refused");
  expect(await git("show-ref")).toBe(replacedRefs);
  await git("remote", "set-url", "origin", "https://github.com/libre-ai/data.git");
  await expect(
    collectSourceSnapshots({
      schemaVersion: "consumer-input.v1",
      sources: [{ source: "missions", root, commit }],
    }),
  ).rejects.toThrow("source-origin-mismatch");
});

test("Bun workspaces require declared membership and pinned Git references bind lock bytes", () => {
  const files = {
    "package.json": JSON.stringify({
      name: "root",
      workspaces: ["packages/*"],
      dependencies: { local: "workspace:*", remote: `github:libre-ai/data#${"b".repeat(40)}` },
    }),
    "packages/local/package.json": '{"name":"local","exports":"./index.ts"}',
    "packages/local/index.ts": "",
    "bun.lock": JSON.stringify({
      packages: { remote: [`remote@github:libre-ai/data#${"b".repeat(7)}`] },
    }),
  };
  const graph = buildDependencyGraph([source("missions", files)]);
  expect(graph.edges.find((e) => e.packageName === "local")?.resolution).toBe("workspace");
  expect(graph.edges.find((e) => e.packageName === "remote")?.resolution).toBe("git-pin");
  files["package.json"] = JSON.stringify({ name: "root", dependencies: { local: "workspace:*" } });
  expect(buildDependencyGraph([source("missions", files)]).edges[0]?.resolution).toBe("unresolved");
});
test("Cargo fixture locks are read as TOML with workspace inheritance", async () => {
  const cargo = await readFile(
    new URL("./fixtures/dependencies/Cargo.toml", import.meta.url),
    "utf8",
  );
  const lock = await readFile(
    new URL("./fixtures/dependencies/Cargo.lock", import.meta.url),
    "utf8",
  );
  const graph = buildDependencyGraph([
    source("orchestrator", {
      "Cargo.toml": cargo,
      "Cargo.lock": lock,
      "crates/application/Cargo.toml":
        '[package]\nname="application"\nversion="1.0.0"\n[dependencies]\nsynthetic-provider.workspace=true\n',
      "crates/application/src/lib.rs": "",
    }),
  ]);
  expect(graph.edges[0]?.resolution).toBe("registry-lock");
});
