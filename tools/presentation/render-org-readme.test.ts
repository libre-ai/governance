import { expect, test } from "bun:test";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { selectPublication } from "../../portfolio/publication-input";
import { contractDigest } from "../../portfolio/repository-contract";
import { loadCatalog } from "../../portfolio/validate-repositories";
import { renderOrgSection } from "./render-org-readme";

test("missing admission cannot produce an empty public profile", () =>
  expect(() => renderOrgSection({ contracts: [], authorities: new Map() })).toThrow(
    "public-evidence-required",
  ));
test("signed current facts render through CLI; stale evidence cannot emit public output", async () => {
  const catalog = JSON.parse(
    await readFile(new URL("../../portfolio/repositories.v1.yaml", import.meta.url), "utf8"),
  );
  const validated = await loadCatalog();
  const contract = validated.contracts.find((item) => item.slug === "db-inspect");
  if (!contract) throw new Error("fixture-missing");
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
  catalog.repositories = catalog.repositories.map((item: { slug: string }) =>
    item.slug === contract.slug ? contract : item,
  );
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
  const receipts = {
    schemaVersion: "publication-input.v1",
    receipts: [
      {
        slug: contract.slug,
        bytes,
        signature: sign(null, Buffer.from(bytes), privateKey).toString("base64"),
      },
    ],
  };
  const selected = selectPublication([contract], policy, receipts);
  const fresh = renderOrgSection(selected);
  expect(fresh).toContain(source);
  expect(fresh).toContain("Synthetic fixture only");
  expect(fresh).not.toMatch(/Maturité|Avancement|couche-|Moyeu|\d\s*%/);
  expect(() => renderOrgSection({ contracts: [contract], authorities: new Map() })).toThrow();
  const dir = await mkdtemp(join(tmpdir(), "public-profile-"));
  try {
    for (const [name, value] of Object.entries({ catalog, policy, receipts }))
      await writeFile(join(dir, `${name}.json`), JSON.stringify(value));
    async function run(script: string, args: string[] = []) {
      const proc = Bun.spawn(
        [process.execPath, new URL(script, import.meta.url).pathname, ...args],
        { stdout: "pipe", stderr: "pipe" },
      );
      const [out, err, exit] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]);
      return { out, err, exit };
    }
    const args = [
      "--catalog",
      join(dir, "catalog.json"),
      "--policy",
      join(dir, "policy.json"),
      "--receipts",
      join(dir, "receipts.json"),
    ];
    expect(await run("./render-org-readme.ts", args)).toEqual({
      out: `${fresh}\n`,
      err: "",
      exit: 0,
    });
    const fleet = await run("../../ecosystem/render-fleet-status.ts", args);
    expect(fleet.exit).toBe(0);
    expect(JSON.parse(fleet.out).repositories[0].slug).toBe(contract.slug);
    expect((await run("./render-org-readme.ts")).exit).toBe(1);
    contract.outcome.en = "Changed after review";
    catalog.repositories = catalog.repositories.map((item: { slug: string }) =>
      item.slug === contract.slug ? contract : item,
    );
    await writeFile(join(dir, "catalog.json"), JSON.stringify(catalog));
    const rejected = await run("./render-org-readme.ts", args);
    expect(rejected).toEqual({ out: "", err: "public-presentation-blocked\n", exit: 1 });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
