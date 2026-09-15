import { expect, test } from "bun:test";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { authorizePublication } from "./publication-authority";
import { buildGitHubMetadata } from "./render-github-metadata";
import { buildPreviewInputs } from "./render-preview-inputs";
import { renderReadmeFacts } from "./render-readme-facts";
import { contractDigest } from "./repository-contract";
import { loadCatalog } from "./validate-repositories";

test("signed current synthetic proof permits stable bilingual rendering, tampering does not", async () => {
  const contract = (await loadCatalog()).contracts.find((c) => c.slug === "db-inspect");
  if (!contract) throw new Error("fixture");
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
  const receipt = JSON.stringify({
    schemaVersion: "portfolio-receipt.v1",
    slug: contract.slug,
    contractDigest: contractDigest(contract),
    revision,
    evidenceSources: [source],
    verifiedAt: "2026-09-11T00:00:00Z",
    admission: { kind: "certain" },
  });
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const signature = sign(null, Buffer.from(receipt), privateKey).toString("base64");
  const trust = {
    publicKey: publicKey.export({ format: "pem", type: "spki" }).toString(),
    expectedRevision: revision,
    expectedReceiptDigest: createHash("sha256").update(receipt).digest("hex"),
  };
  const authority = authorizePublication(contract, receipt, signature, trust);
  const en = renderReadmeFacts(contract, "en", authority);
  const fr = renderReadmeFacts(contract, "fr", authority);
  expect(en).toContain(source);
  expect(fr).toContain(source);
  expect(en).toContain("2026-09-11T00:00:00Z");
  expect(fr).toContain("2026-09-11T00:00:00Z");
  expect(renderReadmeFacts(contract, "en", authority)).toBe(en);
  expect(
    buildGitHubMetadata([contract], new Map([[contract.slug, authority]]))[0]?.description,
  ).toBe(contract.benefit.en);
  expect(buildPreviewInputs([contract], new Map([[contract.slug, authority]]))[0]?.name).toBe(
    contract.displayName,
  );
  expect(() =>
    authorizePublication(contract, receipt, signature, {
      ...trust,
      expectedRevision: "b".repeat(40),
    }),
  ).toThrow();
  expect(() =>
    authorizePublication(contract, receipt, Buffer.alloc(64).toString("base64"), trust),
  ).toThrow();
  expect(() => renderReadmeFacts(contract, "en", {})).toThrow();
  contract.benefit.en = "Changed claim";
  expect(() => renderReadmeFacts(contract, "en", authority)).toThrow();
});

test("conditional names require a signed exact admit verdict and reject stale or foreign evidence", async () => {
  const contract = (await loadCatalog()).contracts.find((c) => c.slug === "authorization");
  if (!contract) throw new Error("fixture");
  const revision = "c".repeat(40);
  const source = `https://github.com/libre-ai/authz-biscuit/blob/${revision}/docs/proof.md`;
  contract.proof = { kind: "evidence" };
  contract.evidence = [
    {
      label: { en: "Synthetic check", fr: "Contrôle synthétique" },
      source,
      contentDigest: "d".repeat(64),
      verifiedAt: "2026-09-11T00:00:00Z",
      limitation: { en: "Synthetic fixture", fr: "Fixture synthétique" },
    },
  ];
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const grant = (admission: unknown, extra: Record<string, unknown> = {}) => {
    const receipt = JSON.stringify({
      schemaVersion: "portfolio-receipt.v1",
      slug: contract.slug,
      contractDigest: contractDigest(contract),
      revision,
      evidenceSources: [source],
      verifiedAt: "2026-09-11T00:00:00Z",
      admission,
      ...extra,
    });
    return authorizePublication(
      contract,
      receipt,
      sign(null, Buffer.from(receipt), privateKey).toString("base64"),
      {
        publicKey: publicKey.export({ format: "pem", type: "spki" }).toString(),
        expectedRevision: revision,
        expectedReceiptDigest: createHash("sha256").update(receipt).digest("hex"),
      },
    );
  };
  const admitted = {
    kind: "conditional",
    gate: "authorization",
    verdict: "admit",
    verdictDigest: "d".repeat(64),
  };
  for (const bad of [
    { kind: "certain" },
    { ...admitted, verdict: "reject" },
    { ...admitted, gate: "execution-guard" },
    { kind: "conditional", gate: "authorization", verdict: "admit" },
  ])
    expect(() => grant(bad)).toThrow("publication-proof-required");
  expect(() => grant(admitted, { evidenceSources: ["https://evil.invalid"] })).toThrow();
  expect(() => grant(admitted, { verifiedAt: "2020-01-01T00:00:00Z" })).toThrow();
  expect(() => grant(admitted, { unknown: true })).toThrow();
  const authority = grant(admitted);
  expect(renderReadmeFacts(contract, "fr", authority)).toContain("Libre AI Authorization");
});

test("detached final receipts bind a commit without embedding it into its public files", async () => {
  const contract = (await loadCatalog()).contracts.find((c) => c.slug === "db-inspect");
  if (!contract) throw new Error("fixture");
  const proofBytes = "synthetic executable evidence\n";
  const contentDigest = createHash("sha256").update(proofBytes).digest("hex");
  const source = `https://example.invalid/proofs/sha256/${contentDigest}`;
  contract.proof = { kind: "evidence" };
  contract.evidence = [
    {
      label: { en: "Synthetic proof", fr: "Preuve synthétique" },
      source,
      contentDigest,
      verifiedAt: "2026-09-11T00:00:00Z",
      limitation: { en: "Synthetic only", fr: "Synthétique uniquement" },
    },
  ];
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const render = (revision: string): string => {
    const receipt = JSON.stringify({
      schemaVersion: "portfolio-receipt.v1",
      slug: contract.slug,
      contractDigest: contractDigest(contract),
      revision,
      evidenceSources: [source],
      verifiedAt: "2026-09-12T00:00:00Z",
      admission: { kind: "certain" },
    });
    const grant = authorizePublication(
      contract,
      receipt,
      sign(null, Buffer.from(receipt), privateKey).toString("base64"),
      {
        publicKey: publicKey.export({ format: "pem", type: "spki" }).toString(),
        expectedRevision: revision,
        expectedReceiptDigest: createHash("sha256").update(receipt).digest("hex"),
      },
    );
    return renderReadmeFacts(contract, "en", grant);
  };
  const first = render("a".repeat(40));
  expect(first).toContain(contentDigest);
  expect(first).not.toContain("a".repeat(40));
  expect(render("b".repeat(40))).toBe(first);
  contract.evidence[0] = {
    ...(contract.evidence[0] as NonNullable<(typeof contract.evidence)[0]>),
    contentDigest: "invalid",
  };
  expect(() => render("b".repeat(40))).toThrow();
});
