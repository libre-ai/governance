import { describe, expect, test } from "bun:test";

describe("canonical bootstrap", () => {
  test("uses the pinned Bun package manager", async () => {
    const manifest = (await Bun.file("package.json").json()) as { packageManager?: string };
    expect(manifest.packageManager).toBe("bun@1.4.0-canary.1");
  });

  test("declares one canonical Knowledge Object schema", async () => {
    const schema = (await Bun.file("ecosystem/schemas/knowledge-object.schema.json").json()) as {
      $id?: string;
    };
    expect(schema.$id).toBe("https://libre-ai.fr/schemas/knowledge-object.v1.json");
  });
});
