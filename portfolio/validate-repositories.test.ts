import { expect, test } from "bun:test";

test("CLI validates planning but refuses publication readiness", async () => {
  for (const mode of ["--planning", "--publication"]) {
    const process = Bun.spawn(
      [
        globalThis.process.execPath,
        new URL("./validate-repositories.ts", import.meta.url).pathname,
        mode,
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    const out = await new Response(process.stdout).text();
    await new Response(process.stderr).text();
    expect(await process.exited).toBe(mode === "--planning" ? 0 : 1);
    if (mode === "--planning") expect(out).toContain("planning=20");
  }
});
