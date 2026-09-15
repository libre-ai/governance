import { expect, test } from "bun:test";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import {
  assertConditionalUse,
  evaluateConditionalGate,
  gateDefinitionDigest,
  loadGateDefinition,
} from "./conditional-gates";

const targets = [
  "vote-mirror",
  "travel-planner",
  "execution-guard",
  "authorization",
  "artifact-proof",
  "collaboration",
];
function sha(bytes: string): string {
  return createHash("sha256").update(bytes).digest("hex");
}
async function fixture(target: string) {
  const definition = await loadGateDefinition(target);
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const now = new Date();
  const candidateCommit = "a".repeat(40);
  const sourceCommits = definition.sources.map((source) => ({ source, commit: "b".repeat(40) }));
  const receipts = definition.assertions.map((assertion) => {
    const bytes = JSON.stringify({
      schemaVersion: "conditional-receipt.v1",
      target,
      assertion: assertion.id,
      candidateCommit,
      sourceCommits,
      completedAt: now.toISOString(),
      recipeDigest: "c".repeat(64),
      status: "pass",
      checks: [
        { id: `assertion/${assertion.id}`, exitCode: 0, resultDigest: "d".repeat(64) },
        { id: "candidate/check", exitCode: 0, resultDigest: "d".repeat(64) },
        ...sourceCommits.map((source) => ({
          id: `source/${source.source}/check`,
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
    candidateCommit,
    sourceCommits,
    definitionDigest: gateDefinitionDigest(definition),
    publicKey: publicKey.export({ format: "pem", type: "spki" }).toString(),
    validAfter: new Date(now.getTime() - 1000).toISOString(),
    validBefore: new Date(now.getTime() + 60000).toISOString(),
    assertions: definition.assertions.map((assertion, index) => ({
      assertion: assertion.id,
      receiptDigest: sha(receipts[index]?.bytes ?? ""),
      recipeDigest: "c".repeat(64),
    })),
  };
  return {
    privateKey,
    definition,
    policy,
    bundle: { schemaVersion: "conditional-evidence.v1", receipts },
    now: now.toISOString(),
  };
}
for (const target of targets) {
  test(`${target}: every assertion is mandatory and only signed exact evidence admits`, async () => {
    const f = await fixture(target);
    const verdict = await evaluateConditionalGate(target, f.policy, f.bundle, f.now);
    expect(verdict.verdict).toBe("admit");
    expect(() =>
      assertConditionalUse(target, f.policy.candidateCommit, "public-name", verdict, f.now),
    ).not.toThrow();
    for (let i = 0; i < f.bundle.receipts.length; i++) {
      const bad = structuredClone(f.bundle);
      bad.receipts.splice(i, 1);
      const rejected = await evaluateConditionalGate(target, f.policy, bad, f.now);
      expect(rejected.verdict).toBe("reject");
      expect(() =>
        assertConditionalUse(
          target,
          f.policy.candidateCommit,
          "final-private-staging",
          rejected,
          f.now,
        ),
      ).toThrow();
      expect(() =>
        assertConditionalUse(target, f.policy.candidateCommit, "local-candidate", rejected, f.now),
      ).not.toThrow();
    }
    const forged = structuredClone(f.bundle);
    if (forged.receipts[0]) forged.receipts[0].bytes += " ";
    expect((await evaluateConditionalGate(target, f.policy, forged, f.now)).verdict).toBe("reject");
    expect(
      (
        await evaluateConditionalGate(
          target,
          { ...f.policy, candidateCommit: "e".repeat(40) },
          f.bundle,
          f.now,
        )
      ).verdict,
    ).toBe("reject");
    expect(
      (await evaluateConditionalGate(target, f.policy, f.bundle, "2099-01-01T00:00:00Z")).verdict,
    ).toBe("reject");
    expect(() =>
      assertConditionalUse(
        target,
        f.policy.candidateCommit,
        "public-name",
        structuredClone(verdict),
        f.now,
      ),
    ).toThrow();
  });
}
test("gate inventory matches the six approved boundaries and fallback dispositions", async () => {
  const definitions = await Promise.all(targets.map(loadGateDefinition));
  expect(definitions.map((d) => d.assertions.length)).toEqual([4, 4, 6, 6, 5, 3]);
  expect(definitions.find((d) => d.target === "execution-guard")?.failureDisposition).toBe(
    "Integrate code required by Mission Control; delete the rest",
  );
  expect(definitions.find((d) => d.target === "authorization")?.failureDisposition).toBe(
    "Integrate the required capability into `governance`; delete the standalone source",
  );
});

for (const target of targets)
  test(`${target}: independently pinned but failed, wrong-source or incomplete receipts reject`, async () => {
    for (const mutation of ["failed", "source", "recipe", "check", "model", "unknown", "future"]) {
      const f = await fixture(target);
      const envelope = f.bundle.receipts[0];
      if (!envelope) throw new Error("fixture");
      const receipt = JSON.parse(envelope.bytes);
      if (mutation === "failed") receipt.status = "fail";
      if (mutation === "source") receipt.sourceCommits[0].commit = "e".repeat(40);
      if (mutation === "recipe") receipt.recipeDigest = "e".repeat(64);
      if (mutation === "check") receipt.checks.pop();
      if (mutation === "model") receipt.execution = { kind: "model", model: "fixture" };
      if (mutation === "unknown") receipt.unreviewed = true;
      if (mutation === "future") receipt.completedAt = "2099-01-01T00:00:00Z";
      envelope.bytes = JSON.stringify(receipt);
      envelope.signature = sign(null, Buffer.from(envelope.bytes), f.privateKey).toString("base64");
      const pin = f.policy.assertions[0];
      if (!pin) throw new Error("fixture");
      pin.receiptDigest = sha(envelope.bytes);
      expect((await evaluateConditionalGate(target, f.policy, f.bundle, f.now)).verdict).toBe(
        "reject",
      );
    }
  });
test("CLI verifies synthetic immutable receipts and withholds altered evidence without exposing inputs", async () => {
  const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const directory = await mkdtemp(join(tmpdir(), "conditional-e2e-"));
  try {
    const f = await fixture("collaboration");
    const policyPath = join(directory, "policy.json");
    const evidencePath = join(directory, "evidence.json");
    await writeFile(policyPath, JSON.stringify(f.policy), { mode: 0o600 });
    await writeFile(evidencePath, JSON.stringify(f.bundle), { mode: 0o600 });
    const run = async () => {
      const child = Bun.spawn(
        [
          process.execPath,
          new URL("./conditional-gates.ts", import.meta.url).pathname,
          "--target",
          "collaboration",
          "--policy",
          policyPath,
          "--evidence",
          evidencePath,
        ],
        { stdout: "pipe", stderr: "pipe" },
      );
      const [stdout, stderr, code] = await Promise.all([
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
        child.exited,
      ]);
      return { stdout, stderr, code };
    };
    const first = await run();
    expect(first.code).toBe(0);
    expect(JSON.parse(first.stdout).verdict).toBe("admit");
    expect(first.stderr).toBe("");
    expect(first.stdout).not.toContain("PUBLIC KEY");
    expect(first.stdout).not.toContain(directory);
    expect((await run()).stdout).toBe(first.stdout);
    f.bundle.receipts.pop();
    await writeFile(evidencePath, JSON.stringify(f.bundle));
    const rejected = await run();
    expect(rejected.code).toBe(1);
    expect(JSON.parse(rejected.stdout).verdict).toBe("reject");
    await writeFile(policyPath, "not json");
    const malformed = await run();
    expect(malformed.code).toBe(1);
    expect(malformed.stderr).toBe("conditional-input-invalid\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("runtime boundaries reject fabricated authority and altered grants", async () => {
  const f = await fixture("collaboration");
  for (const policy of [
    null,
    {},
    { ...f.policy, definitionDigest: "e".repeat(64) },
    {
      ...f.policy,
      assertions: [f.policy.assertions[0], f.policy.assertions[0], f.policy.assertions[0]],
    },
  ]) {
    expect((await evaluateConditionalGate("collaboration", policy, f.bundle, f.now)).verdict).toBe(
      "reject",
    );
  }
  const verdict = await evaluateConditionalGate("collaboration", f.policy, f.bundle, f.now);
  const assertion = verdict.assertions[0];
  if (!assertion) throw new Error("fixture");
  assertion.evidence = "e".repeat(64);
  expect(() =>
    assertConditionalUse("collaboration", f.policy.candidateCommit, "public-name", verdict, f.now),
  ).toThrow();
});

test("model receipts bind explicit provider, model, host input and independent oracle", async () => {
  const f = await fixture("collaboration");
  for (let i = 0; i < f.bundle.receipts.length; i++) {
    const envelope = f.bundle.receipts[i];
    const pin = f.policy.assertions[i];
    if (!envelope || !pin) throw new Error("fixture");
    const receipt = JSON.parse(envelope.bytes);
    receipt.execution = {
      kind: "model",
      provider: "synthetic-provider",
      model: "synthetic-model",
      configurationDigest: "e".repeat(64),
      hostInputDigest: "f".repeat(64),
      oracleDigest: "1".repeat(64),
    };
    envelope.bytes = JSON.stringify(receipt);
    envelope.signature = sign(null, Buffer.from(envelope.bytes), f.privateKey).toString("base64");
    pin.receiptDigest = sha(envelope.bytes);
  }
  expect((await evaluateConditionalGate("collaboration", f.policy, f.bundle, f.now)).verdict).toBe(
    "admit",
  );
});

test("invalid native date values cannot disable receipt validity bounds", async () => {
  for (const field of ["validAfter", "validBefore", "completedAt"] as const) {
    const f = await fixture("authorization");
    const leap = "2016-12-31T23:59:60Z";
    if (field === "completedAt") {
      const envelope = f.bundle.receipts[0];
      const assertion = f.policy.assertions[0];
      if (!envelope || !assertion) throw new Error("fixture");
      envelope.bytes = JSON.stringify({ ...JSON.parse(envelope.bytes), completedAt: leap });
      envelope.signature = sign(null, Buffer.from(envelope.bytes), f.privateKey).toString("base64");
      assertion.receiptDigest = sha(envelope.bytes);
    } else f.policy[field] = leap;
    expect(
      (await evaluateConditionalGate("authorization", f.policy, f.bundle, f.now)).verdict,
    ).toBe("reject");
  }
});
