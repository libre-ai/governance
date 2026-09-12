import { expect, test } from "bun:test";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { contractDigest, type RepositoryContractV1 } from "./repository-contract";

test("CLI emits stable withheld projections and detects byte drift", async () => {
  const root = await mkdtemp(join(tmpdir(), "portfolio-fixture-"));
  async function run(check = false): Promise<number> {
    const proc = Bun.spawn(
      [
        process.execPath,
        new URL("./build-projections.ts", import.meta.url).pathname,
        "--output-root",
        root,
        ...(check ? ["--check"] : []),
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
    return proc.exited;
  }
  expect(await run()).toBe(0);
  const path = join(root, "portfolio/projections/readme-facts.v1.json");
  const first = await readFile(path, "utf8");
  expect(JSON.parse(first)).toEqual({ schemaVersion: "readme-facts.v1", repositories: [] });
  expect(await run()).toBe(0);
  expect(await readFile(path, "utf8")).toBe(first);
  expect(await run(true)).toBe(0);
  await writeFile(path, "{}\n");
  expect(await run(true)).toBe(1);
});

test("CLI admits only contracts bound to an explicit trusted policy and signed receipt", async () => {
  const root = await mkdtemp(join(tmpdir(), "portfolio-signed-fixture-"));
  const catalog = JSON.parse(
    await readFile(new URL("./repositories.v1.yaml", import.meta.url), "utf8"),
  );
  const contract = catalog.repositories.find(
    (item: RepositoryContractV1) => item.slug === "db-inspect",
  ) as RepositoryContractV1;
  const revision = "a".repeat(40);
  const source = `https://github.com/libre-ai/db-inspect/blob/${revision}/docs/proof.md`;
  contract.proof = { kind: "evidence" };
  contract.evidence = [
    {
      label: { en: "Synthetic proof", fr: "Preuve synthétique" },
      source,
      contentDigest: "d".repeat(64),
      verifiedAt: "2026-09-11T00:00:00Z",
      limitation: { en: "Synthetic fixture only", fr: "Fixture synthétique uniquement" },
    },
  ];
  const bytes = JSON.stringify({
    schemaVersion: "portfolio-receipt.v1",
    slug: contract.slug,
    contractDigest: contractDigest(contract),
    revision,
    evidenceSources: [source],
    verifiedAt: "2026-09-11T00:00:00Z",
    admission: { kind: "certain" },
  });
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const receipt = {
    slug: contract.slug,
    bytes,
    signature: sign(null, Buffer.from(bytes), privateKey).toString("base64"),
  };
  const policy = {
    schemaVersion: "publication-policy.v1",
    authorities: [
      {
        slug: contract.slug,
        publicKey: publicKey.export({ format: "pem", type: "spki" }).toString(),
        expectedRevision: revision,
        expectedReceiptDigest: createHash("sha256").update(bytes).digest("hex"),
      },
    ],
  };
  const receipts = { schemaVersion: "publication-input.v1", receipts: [receipt] };
  const paths = ["catalog.json", "policy.json", "receipts.json"].map((name) => join(root, name));
  for (const [i, value] of [catalog, policy, receipts].entries())
    await writeFile(paths[i] as string, JSON.stringify(value));
  async function run(script: string, extra: string[] = []): Promise<number> {
    const proc = Bun.spawn(
      [
        process.execPath,
        new URL(script, import.meta.url).pathname,
        "--catalog",
        paths[0] as string,
        "--policy",
        paths[1] as string,
        "--receipts",
        paths[2] as string,
        ...extra,
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
    return proc.exited;
  }
  expect(await run("./build-projections.ts", ["--output-root", root])).toBe(0);
  const metadataPath = join(root, "portfolio/projections/github-metadata.v1.json");
  const output = await readFile(metadataPath, "utf8");
  expect(JSON.parse(output).repositories).toEqual([
    { slug: "db-inspect", description: contract.benefit.en, topics: [...contract.topics].sort() },
  ]);
  const facts = JSON.parse(
    await readFile(join(root, "portfolio/projections/readme-facts.v1.json"), "utf8"),
  );
  expect(facts.repositories).toHaveLength(1);
  expect(facts.repositories[0].en).toContain(source);
  expect(facts.repositories[0].fr).toContain(source);
  expect(await run("./validate-repositories.ts", ["--publication"])).toBe(0);
  expect(await run("./build-projections.ts", ["--output-root", root, "--check"])).toBe(0);
  const formatter = Bun.spawn(
    [
      new URL("../node_modules/.bin/biome", import.meta.url).pathname,
      "format",
      "--stdin-file-path",
      "portfolio/projections/github-metadata.v1.json",
    ],
    {
      cwd: new URL("..", import.meta.url).pathname,
      stdin: new Blob([output]),
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const [formatted] = await Promise.all([
    new Response(formatter.stdout).text(),
    new Response(formatter.stderr).text(),
  ]);
  expect(await formatter.exited).toBe(0);
  expect(formatted).toBe(output);
  for (const invalid of [
    { ...receipts, receipts: [{ ...receipt, bytes: `${bytes} ` }] },
    { ...receipts, receipts: [receipt, receipt] },
    { ...receipts, receipts: [] },
    { ...receipts, receipts: [{ ...receipt, slug: "unknown" }] },
    { ...receipts, publicKey: policy.authorities[0]?.publicKey },
  ]) {
    await writeFile(paths[2] as string, JSON.stringify(invalid));
    expect(await run("./build-projections.ts", ["--output-root", root])).toBe(1);
    expect(await readFile(metadataPath, "utf8")).toBe(output);
    expect(await run("./validate-repositories.ts", ["--publication"])).toBe(1);
  }
});

test("external catalog refuses oversized bytes before parsing", async () => {
  const root = await mkdtemp(join(tmpdir(), "portfolio-large-fixture-"));
  const path = join(root, "catalog.json");
  const catalog = await readFile(new URL("./repositories.v1.yaml", import.meta.url), "utf8");
  await writeFile(path, " ".repeat(2 * 1024 * 1024 + 1) + catalog);
  const proc = Bun.spawn(
    [
      process.execPath,
      new URL("./validate-repositories.ts", import.meta.url).pathname,
      "--planning",
      "--catalog",
      path,
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  expect(await proc.exited).toBe(1);
});

test("external catalog refuses a FIFO without waiting for a writer", async () => {
  if (process.platform === "win32") return;
  const root = await mkdtemp(join(tmpdir(), "portfolio-fifo-fixture-"));
  const path = join(root, "catalog.json");
  const maker = Bun.spawn(["mkfifo", path], { stdout: "ignore", stderr: "ignore" });
  expect(await maker.exited).toBe(0);
  const proc = Bun.spawn(
    [
      process.execPath,
      new URL("./validate-repositories.ts", import.meta.url).pathname,
      "--planning",
      "--catalog",
      path,
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  const outcome = await Promise.race([proc.exited, Bun.sleep(500).then(() => null)]);
  if (outcome === null) proc.kill();
  await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  expect(outcome).toBe(1);
});
