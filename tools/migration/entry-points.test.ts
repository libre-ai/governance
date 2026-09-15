import { expect, test } from "bun:test";
import type { SourceSnapshot } from "./entry-points";
import { findEntryPoints } from "./entry-points";

function fixture(files: Record<string, string>): SourceSnapshot {
  return { source: "missions", commit: "a".repeat(40), files };
}
test("extracts conditional exports, bins and application script paths, never tests", () => {
  const result = findEntryPoints(
    fixture({
      "package.json": JSON.stringify({
        name: "test",
        exports: { ".": { import: "./src/index.ts", types: "./src/index.d.ts" } },
        bin: { tool: "src/cli.ts" },
        scripts: { start: "bun src/server.ts", test: "bun src/only.test.ts" },
      }),
      "src/index.ts": "",
      "src/index.d.ts": "",
      "src/cli.ts": "",
      "src/server.ts": "",
      "src/only.test.ts": "",
    }),
  );
  expect(result.unresolved).toEqual([]);
  expect(result.entries.map((e) => e.path)).toEqual([
    "src/cli.ts",
    "src/index.d.ts",
    "src/index.ts",
    "src/server.ts",
  ]);
  expect(result.entries.some((e) => e.path.includes("test"))).toBe(false);
});
test("detects cargo conventional and declared library/binary entrypoints", () => {
  const result = findEntryPoints(
    fixture({
      "Cargo.toml":
        '[package]\nname="fixture"\nversion="1.0.0"\n[[bin]]\nname="extra"\npath="src/extra.rs"\n',
      "src/lib.rs": "",
      "src/main.rs": "",
      "src/extra.rs": "",
    }),
  );
  expect(result.entries.map((e) => e.kind)).toEqual(["binary", "library", "binary"]);
});
test("missing, traversal and test-only exports remain unresolved", () => {
  for (const target of ["../escape.ts", "./missing.ts", "./src/only.test.ts"]) {
    const result = findEntryPoints(
      fixture({ "package.json": JSON.stringify({ exports: target }), "src/only.test.ts": "" }),
    );
    expect(result.unresolved.length).toBeGreaterThan(0);
    expect(result.entries).toEqual([]);
  }
});
test("malformed manifests fail safely", () => {
  expect(() => findEntryPoints(fixture({ "package.json": "{broken" }))).toThrow("manifest-invalid");
});

test("explicit documented application roots are parsed without executing scripts", () => {
  const result = findEntryPoints(
    fixture({
      "package.json": '{"name":"app"}',
      "migration/shipped-entry-points.v1.json": JSON.stringify({
        schemaVersion: "shipped-entry-points.v1",
        entries: [{ path: "src/app.ts", kind: "application", manifest: "package.json" }],
      }),
      "src/app.ts": "",
    }),
  );
  expect(result.entries).toEqual([
    { repository: "missions", path: "src/app.ts", kind: "application", manifest: "package.json" },
  ]);
});

test("accepts ordinary source paths containing plus signs and route brackets", () => {
  const snapshot = {
    source: "contracts",
    commit: "a".repeat(40),
    files: {
      "package.json": JSON.stringify({ name: "fixture", exports: "./src/result+proof.ts" }),
      "src/result+proof.ts": "export {};\n",
      "src/routes/[id].ts": "export {};\n",
    },
  };
  expect(findEntryPoints(snapshot).entries[0]?.path).toBe("src/result+proof.ts");
});
