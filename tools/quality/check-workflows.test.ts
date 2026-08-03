import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Workflow templates were validated by nothing: `bun run check` never looked
// at .github/workflows, so a template shipped to the fleet was proved only by
// someone running an inline twin of it in another repository. That proves the
// body of the steps, never the wiring. These assertions are the cheap half —
// the file parses, it is callable, it declares its permissions, and every
// action it runs is pinned to an immutable sha. A real `workflow_call` from a
// consumer remains the only proof of the other half, and cannot be produced
// before this repository publishes the template.

const WORKFLOW_DIRECTORY = new URL("../../.github/workflows/", import.meta.url).pathname;
const files = readdirSync(WORKFLOW_DIRECTORY)
  .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
  .sort();

interface Step {
  readonly uses?: string;
  readonly run?: string;
}
interface Job {
  readonly uses?: string;
  readonly "runs-on"?: string;
  readonly steps?: readonly Step[];
}
interface Workflow {
  readonly on?: unknown;
  readonly permissions?: unknown;
  readonly jobs?: Record<string, Job>;
}

const parse = (name: string): Workflow =>
  Bun.YAML.parse(readFileSync(join(WORKFLOW_DIRECTORY, name), "utf8")) as Workflow;

const ACTION_PIN = /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/;

describe("workflow definitions", () => {
  // A moved directory or a changed extension must turn this red, never make it
  // vacuously green.
  test("the workflow directory is not empty", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test.each(files)("%s parses and declares a trigger, permissions and jobs", (name) => {
    const workflow = parse(name);
    expect(workflow.on).toBeDefined();
    expect(workflow.permissions).toBeDefined();
    expect(Object.keys(workflow.jobs ?? {}).length).toBeGreaterThan(0);
  });

  test.each(files)("%s runs only actions pinned to a commit sha", (name) => {
    const workflow = parse(name);
    const unpinned: string[] = [];
    for (const job of Object.values(workflow.jobs ?? {})) {
      for (const step of job.steps ?? []) {
        // A local or reusable-workflow reference is covered by the fleet pin
        // gate; this asserts the third-party actions this repository executes.
        if (step.uses !== undefined && !ACTION_PIN.test(step.uses)) unpinned.push(step.uses);
      }
    }
    expect(unpinned).toEqual([]);
  });

  test.each(files)("%s gives every job a runner or a called workflow", (name) => {
    const workflow = parse(name);
    for (const [id, job] of Object.entries(workflow.jobs ?? {})) {
      expect(`${id}: ${job["runs-on"] ?? job.uses ?? "MISSING"}`).not.toContain("MISSING");
    }
  });
});

describe("fleet gate templates", () => {
  const templates = files.filter((name) => name.startsWith("reusable-"));

  test("the fleet publishes gate templates", () => {
    expect(templates.length).toBeGreaterThan(0);
  });

  test.each(templates)("%s is callable by a consuming repository", (name) => {
    const workflow = parse(name);
    // `on: workflow_call` is what makes the file a template rather than a
    // workflow of this repository; without it, `uses: ...@<sha>` in a consumer
    // fails at dispatch with no gate ever running.
    expect(Object.keys(workflow.on as Record<string, unknown>)).toContain("workflow_call");
  });

  test.each(templates)("%s declares the permissions it grants the called job", (name) => {
    // A reusable workflow does NOT inherit the caller's token scope: an
    // undeclared `permissions` block would run with the repository default,
    // which is not a property of this file.
    expect(parse(name).permissions).toBeDefined();
  });
});
