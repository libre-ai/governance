import { expect, test } from "bun:test";
import type { ImmutableFile } from "./reachability";
import { analyzeReachability, fileId } from "./reachability";

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
test("traverses shipped dependencies and never uses tests as a production root", () => {
  const files = [
    file("src/main.ts"),
    file("src/lib.ts"),
    file("src/only.test.ts", "test"),
    file("src/test-only.ts"),
  ];
  const ids = files.map(fileId);
  const result = analyzeReachability(
    files,
    [ids[0] ?? ""],
    [
      { consumer: ids[0] ?? "", provider: ids[1] ?? "", kind: "runtime" },
      { consumer: ids[2] ?? "", provider: ids[3] ?? "", kind: "test" },
    ],
  );
  expect(result.reachable).toEqual([ids[0] ?? "", ids[1] ?? ""].sort());
  expect(() => analyzeReachability(files, [ids[2] ?? ""], [])).toThrow();
});
test("missing endpoints, dependency coverage and inconsistent immutable identities block", () => {
  const first = file("src/main.ts");
  const id = fileId(first);
  expect(() =>
    analyzeReachability(
      [first],
      [id],
      [{ consumer: id, provider: "f".repeat(64), kind: "runtime" }],
    ),
  ).toThrow();
  first.dependencyAnalysis = { complete: false, evidenceDigest: null };
  expect(() => analyzeReachability([first], [id], [])).toThrow();
});
test("per-entrypoint reachability does not mix independent roots", () => {
  const a = file("a.ts"),
    b = file("b.ts");
  const result = analyzeReachability([a, b], [fileId(a), fileId(b)], []);
  expect(result.byEntryPoint[fileId(a)]).toEqual([fileId(a)]);
});
