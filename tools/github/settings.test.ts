import { expect, test } from "bun:test";
import type { ConditionalAdmission } from "./settings";
import { buildRepositorySettings, validateRepositorySettings } from "./settings";

test("all fourteen certain repositories share immutable security defaults", () => {
  const settings = buildRepositorySettings();
  expect(settings.length).toBe(14);
  expect(settings.find((s) => s.repository === "libre-ai/db-inspect")?.displayName).toBe(
    "Libre AI Database Inspector",
  );
  expect(settings.some((s) => s.repository.includes("signalement"))).toBe(false);
  validateRepositorySettings(settings);
  for (const field of [
    "secretScanning",
    "pushProtection",
    "dependabotAlerts",
    "securityUpdates",
    "privateVulnerabilityReporting",
  ] as const) {
    const bad = structuredClone(settings);
    if (bad[0]) Object.assign(bad[0], { [field]: false });
    expect(() => validateRepositorySettings(bad)).toThrow();
  }
  for (const [field, value] of [
    ["adminEnforced", false],
    ["forcePush", true],
    ["deletion", true],
    ["signedCommits", false],
    ["exactCommitReviewCheck", "arbitrary-status"],
  ]) {
    const bad = structuredClone(settings);
    if (bad[0]) Object.assign(bad[0].ruleset, { [String(field)]: value });
    expect(() => validateRepositorySettings(bad)).toThrow();
  }
  expect(() => validateRepositorySettings(settings.slice(1))).toThrow();
  expect(() => validateRepositorySettings([...settings, settings[0]])).toThrow();
  for (const repository of [
    "libre-ai/signalement",
    "libre-ai/product-research",
    "libre-ai/authorization",
  ]) {
    const bad = structuredClone(settings);
    if (bad[0]) bad[0].repository = repository;
    expect(() => validateRepositorySettings(bad)).toThrow();
  }
  expect(() =>
    buildRepositorySettings([
      { target: "authorization", candidateCommit: "a".repeat(40), verdict: { verdict: "admit" } },
    ] as never),
  ).toThrow();
});

test("all six conditionals require authentic unexpired C5 grants", async () => {
  const { createHash, generateKeyPairSync, sign } = await import("node:crypto");
  const { loadGateDefinition, gateDefinitionDigest, evaluateConditionalGate } = await import(
    "../migration/conditional-gates"
  );
  const { readPortfolio } = await import("../migration/source-freeze");
  const admissions: ConditionalAdmission[] = [];
  for (const target of readPortfolio().conditionalTargets) {
    const definition = await loadGateDefinition(target);
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const now = new Date();
    const sourceCommits = definition.sources.map((source) => ({ source, commit: "b".repeat(40) }));
    const receipts = definition.assertions.map((assertion) => {
      const bytes = JSON.stringify({
        schemaVersion: "conditional-receipt.v1",
        target,
        assertion: assertion.id,
        candidateCommit: "a".repeat(40),
        sourceCommits,
        completedAt: now.toISOString(),
        recipeDigest: "c".repeat(64),
        status: "pass",
        checks: [
          { id: `assertion/${assertion.id}`, exitCode: 0, resultDigest: "d".repeat(64) },
          { id: "candidate/check", exitCode: 0, resultDigest: "d".repeat(64) },
          ...sourceCommits.map((s) => ({
            id: `source/${s.source}/check`,
            exitCode: 0,
            resultDigest: "d".repeat(64),
          })),
        ],
        execution: { kind: "deterministic" },
      });
      return { bytes, signature: sign(null, Buffer.from(bytes), privateKey).toString("base64") };
    });
    const policy = {
      schemaVersion: "conditional-policy.v1",
      target,
      candidateCommit: "a".repeat(40),
      sourceCommits,
      definitionDigest: gateDefinitionDigest(definition),
      publicKey: publicKey.export({ format: "pem", type: "spki" }).toString(),
      validAfter: new Date(now.getTime() - 1000).toISOString(),
      validBefore: new Date(now.getTime() + 60000).toISOString(),
      assertions: definition.assertions.map((a, i) => ({
        assertion: a.id,
        receiptDigest: createHash("sha256")
          .update(receipts[i]?.bytes ?? "")
          .digest("hex"),
        recipeDigest: "c".repeat(64),
      })),
    };
    const verdict = await evaluateConditionalGate(target, policy, {
      schemaVersion: "conditional-evidence.v1",
      receipts,
    });
    expect(verdict.verdict).toBe("admit");
    admissions.push({ target, candidateCommit: policy.candidateCommit, verdict });
  }
  const all = buildRepositorySettings(admissions);
  expect(all.length).toBe(20);
  validateRepositorySettings(all, admissions);
  expect(() => buildRepositorySettings(structuredClone(admissions))).toThrow();
  expect(() => buildRepositorySettings([...admissions, admissions[0]] as never)).toThrow();
  expect(() => validateRepositorySettings(all)).toThrow();
});
