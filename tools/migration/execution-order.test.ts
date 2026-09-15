import { describe, expect, test } from "bun:test";

import { inspectExecutionOrder, portfolioExecutionOrder } from "./execution-order";

describe("portfolio execution order", () => {
  test("all producers precede consumers without granting mutation authority", () => {
    const result = inspectExecutionOrder(portfolioExecutionOrder);
    expect(result.errors).toEqual([]);
    expect(result.order.length).toBe(portfolioExecutionOrder.length);
    for (const stage of portfolioExecutionOrder) {
      for (const producer of stage.requires) {
        expect(result.order.indexOf(producer)).toBeLessThan(result.order.indexOf(stage.id));
      }
    }
    expect(result.authorizesMutation).toBe(false);
  });

  test.each([
    ["candidate-build", "path-audit"],
    ["release-publication", "local-qualification"],
    ["release-publication", "release-authorization"],
    ["registry-qualification", "release-publication"],
    ["conditional-admission", "registry-qualification"],
    ["final-roots", "conditional-admission"],
    ["final-roots", "surface-release-completion"],
    ["private-staging", "staging-preflight"],
    ["private-qualification", "private-staging"],
    ["final-preflight", "private-qualification"],
    ["final-preflight", "source-recheck"],
    ["public-cutover", "destructive-confirmation"],
  ])("refuses missing safety prerequisite %s <- %s", (consumer, producer) => {
    const input = portfolioExecutionOrder.map((stage) => ({
      ...stage,
      requires:
        stage.id === consumer ? stage.requires.filter((id) => id !== producer) : stage.requires,
    }));
    const result = inspectExecutionOrder(input);
    expect(result.errors).toContain("missing-required-dependency");
    expect(result.order).toEqual([]);
  });

  test("rejects the original private staging qualification cycle", () => {
    const input = portfolioExecutionOrder.map((stage) => ({
      ...stage,
      requires:
        stage.id === "staging-preflight" ? [...stage.requires, "final-preflight"] : stage.requires,
    }));
    expect(inspectExecutionOrder(input).errors).toContain("dependency-cycle");
  });

  test("rejects the original registry admission before candidate build cycle", () => {
    const input = portfolioExecutionOrder.map((stage) => ({
      ...stage,
      requires:
        stage.id === "candidate-build"
          ? [...stage.requires, "conditional-admission"]
          : stage.requires,
    }));
    expect(inspectExecutionOrder(input).errors).toContain("dependency-cycle");
  });

  test("accepts arbitrary input ordering with a deterministic result", () => {
    expect(inspectExecutionOrder([...portfolioExecutionOrder].reverse())).toEqual(
      inspectExecutionOrder(portfolioExecutionOrder),
    );
  });

  test.each([
    { value: null },
    { value: {} },
    { value: [] },
    { value: [{ id: "unknown", requires: [] }] },
  ])("refuses malformed or incomplete stages", ({ value }) => {
    const result = inspectExecutionOrder(value);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.order).toEqual([]);
  });

  test("rejects duplicate stages and references without reflecting input", () => {
    const first = portfolioExecutionOrder[0];
    expect(first).toBeDefined();
    expect(inspectExecutionOrder([...portfolioExecutionOrder, first]).errors).toContain(
      "duplicate-stage",
    );
    const malformed = portfolioExecutionOrder.map((stage, index) =>
      index === 0 ? { ...stage, requires: ["unknown-private-input"] } : stage,
    );
    const result = inspectExecutionOrder(malformed);
    expect(result.errors).toContain("unknown-dependency");
    expect(JSON.stringify(result)).not.toContain("unknown-private-input");
  });

  test("CLI reports only order, not readiness or authorization", async () => {
    const process = Bun.spawn(
      [Bun.which("bun") ?? "bun", `${import.meta.dir}/execution-order.ts`],
      {
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const output = await new Response(process.stdout).text();
    const error = await new Response(process.stderr).text();
    expect(await process.exited).toBe(0);
    expect(error).toBe("");
    const report: unknown = JSON.parse(output);
    expect(report).toEqual(inspectExecutionOrder(portfolioExecutionOrder));
    expect(output).not.toContain("READY");
  });
});
