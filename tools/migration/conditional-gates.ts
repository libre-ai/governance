import { createHash, createPublicKey, verify } from "node:crypto";
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import Ajv from "ajv";
import addFormats from "ajv-formats";

interface Assertion {
  id: string;
  requirement: string;
}
export interface GateDefinition {
  schemaVersion: string;
  target: string;
  sources: string[];
  assertions: Assertion[];
  failureDisposition: string;
}
interface SourceCommit {
  source: string;
  commit: string;
}
interface Policy {
  target: string;
  candidateCommit: string;
  sourceCommits: SourceCommit[];
  definitionDigest: string;
  publicKey: string;
  validAfter: string;
  validBefore: string;
  assertions: { assertion: string; receiptDigest: string; recipeDigest: string }[];
}
interface Receipt {
  target: string;
  assertion: string;
  candidateCommit: string;
  sourceCommits: SourceCommit[];
  completedAt: string;
  recipeDigest: string;
  status: string;
  checks: { id: string; exitCode: number; resultDigest: string }[];
}
interface Bundle {
  receipts: { bytes: string; signature: string }[];
}
export interface ConditionalGateVerdict {
  target: string;
  candidateCommit: string;
  assertions: { id: string; evidence: string; passed: boolean }[];
  verdict: "admit" | "reject";
  failureDisposition: string;
  definitionDigest: string;
}
const inventory: Record<string, string[]> = {
  "vote-mirror": ["boussole-politique"],
  "travel-planner": ["travel-agent"],
  "execution-guard": ["harness"],
  authorization: ["authz-biscuit"],
  "artifact-proof": ["artifacts", "provenance"],
  collaboration: ["collab-core", "collab-relay"],
};
const ajv = new Ajv({ strict: true, allErrors: false });
addFormats(ajv);
const text = {
  type: "string",
  minLength: 1,
  maxLength: 4096,
  pattern: "^[^\\u0000-\\u001f\\u007f]+$",
};
const digest = { type: "string", pattern: "^[a-f0-9]{64}$" };
const commit = { type: "string", pattern: "^[a-f0-9]{40}$" };
const date = { type: "string", format: "date-time" };
function object(properties: Record<string, unknown>) {
  return {
    type: "object",
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  };
}
function array(items: unknown) {
  return { type: "array", minItems: 1, maxItems: 100, items };
}
const sources = array(object({ source: text, commit }));
const definitionSchema = object({
  schemaVersion: { const: "conditional-gate.v1" },
  target: text,
  sources: array(text),
  assertions: array(object({ id: text, requirement: text })),
  failureDisposition: text,
});
const validDefinition = ajv.compile<GateDefinition>(definitionSchema);
const validPolicy = ajv.compile<Policy>(
  object({
    schemaVersion: { const: "conditional-policy.v1" },
    target: text,
    candidateCommit: commit,
    sourceCommits: sources,
    definitionDigest: digest,
    publicKey: { type: "string", maxLength: 4096 },
    validAfter: date,
    validBefore: date,
    assertions: array(object({ assertion: text, receiptDigest: digest, recipeDigest: digest })),
  }),
);
const validBundle = ajv.compile<Bundle>(
  object({
    schemaVersion: { const: "conditional-evidence.v1" },
    receipts: array(
      object({
        bytes: { type: "string", minLength: 1, maxLength: 100000 },
        signature: { type: "string", pattern: "^[A-Za-z0-9+/]{86}==$" },
      }),
    ),
  }),
);
const validReceipt = ajv.compile<Receipt>(
  object({
    schemaVersion: { const: "conditional-receipt.v1" },
    target: text,
    assertion: text,
    candidateCommit: commit,
    sourceCommits: sources,
    completedAt: date,
    recipeDigest: digest,
    status: { enum: ["pass", "fail"] },
    checks: array(
      object({
        id: text,
        exitCode: { type: "integer", minimum: 0, maximum: 255 },
        resultDigest: digest,
      }),
    ),
    execution: {
      oneOf: [
        object({ kind: { const: "deterministic" } }),
        object({
          kind: { const: "model" },
          provider: text,
          model: text,
          configurationDigest: digest,
          hostInputDigest: digest,
          oracleDigest: digest,
        }),
      ],
    },
  }),
);
function sha(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
export function gateDefinitionDigest(definition: GateDefinition): string {
  return sha(JSON.stringify(definition));
}
async function readJson(path: string | URL): Promise<unknown> {
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > 2 * 1024 * 1024) throw new Error("conditional-input-invalid");
    const limit = 2 * 1024 * 1024;
    const buffer = Buffer.alloc(limit + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await file.read(buffer, offset, buffer.length - offset, null);
      if (bytesRead === 0) break;
      offset += bytesRead;
    }
    if (offset > limit) throw new Error("conditional-input-invalid");
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, offset)));
  } finally {
    await file.close();
  }
}
export async function loadGateDefinition(target: string): Promise<GateDefinition> {
  if (!Object.hasOwn(inventory, target)) throw new Error("conditional-target-unknown");
  const input = await readJson(new URL(`../../migration/gates/${target}.v1.yaml`, import.meta.url));
  if (
    !validDefinition(input) ||
    input.target !== target ||
    JSON.stringify(input.sources) !== JSON.stringify(inventory[target]) ||
    new Set(input.assertions.map((a) => a.id)).size !== input.assertions.length
  )
    throw new Error("conditional-definition-invalid");
  return input;
}
function sameSources(left: SourceCommit[], right: SourceCommit[]): boolean {
  const canonical = (items: SourceCommit[]) =>
    JSON.stringify([...items].sort((a, b) => a.source.localeCompare(b.source)));
  return canonical(left) === canonical(right);
}
const grants = new WeakMap<object, { digest: string; validAfter: number; validBefore: number }>();
export async function evaluateConditionalGate(
  target: string,
  policyInput: unknown,
  evidenceInput: unknown,
  now = new Date().toISOString(),
): Promise<ConditionalGateVerdict> {
  const definition = await loadGateDefinition(target);
  const result: ConditionalGateVerdict = {
    target,
    candidateCommit: "",
    assertions: definition.assertions.map((a) => ({ id: a.id, evidence: "", passed: false })),
    verdict: "reject",
    failureDisposition: definition.failureDisposition,
    definitionDigest: gateDefinitionDigest(definition),
  };
  if (!validPolicy(policyInput) || !validBundle(evidenceInput)) return result;
  const policy = policyInput;
  const bundle = evidenceInput;
  result.candidateCommit = policy.candidateCommit;
  const time = Date.parse(now);
  const after = Date.parse(policy.validAfter);
  const before = Date.parse(policy.validBefore);
  if (
    !Number.isFinite(time) ||
    !Number.isFinite(after) ||
    !Number.isFinite(before) ||
    time < after ||
    time > before ||
    after >= before ||
    policy.target !== target ||
    policy.definitionDigest !== result.definitionDigest ||
    policy.sourceCommits.length !== definition.sources.length ||
    new Set(policy.sourceCommits.map((s) => s.source)).size !== definition.sources.length ||
    definition.sources.some((s) => !policy.sourceCommits.some((c) => c.source === s)) ||
    policy.assertions.length !== result.assertions.length ||
    new Set(policy.assertions.map((a) => a.assertion)).size !== result.assertions.length ||
    bundle.receipts.length !== result.assertions.length
  )
    return result;
  try {
    const key = createPublicKey(policy.publicKey);
    if (key.asymmetricKeyType !== "ed25519") return result;
    for (const assertion of result.assertions) {
      const expected = policy.assertions.find((a) => a.assertion === assertion.id);
      if (!expected) return result;
      const matches = bundle.receipts.filter((r) => sha(r.bytes) === expected.receiptDigest);
      if (matches.length !== 1) return result;
      const envelope = matches[0];
      if (
        !envelope ||
        !verify(null, Buffer.from(envelope.bytes), key, Buffer.from(envelope.signature, "base64"))
      )
        return result;
      const receipt: unknown = JSON.parse(envelope.bytes);
      if (!validReceipt(receipt)) return result;
      const requiredChecks = [
        `assertion/${assertion.id}`,
        "candidate/check",
        ...policy.sourceCommits.map((s) => `source/${s.source}/check`),
      ];
      const completed = Date.parse(receipt.completedAt);
      if (
        receipt.target !== target ||
        receipt.assertion !== assertion.id ||
        receipt.status !== "pass" ||
        receipt.candidateCommit !== policy.candidateCommit ||
        !sameSources(receipt.sourceCommits, policy.sourceCommits) ||
        receipt.recipeDigest !== expected.recipeDigest ||
        !Number.isFinite(completed) ||
        completed < after ||
        completed > time ||
        completed > before ||
        receipt.checks.length !== requiredChecks.length ||
        new Set(receipt.checks.map((c) => c.id)).size !== requiredChecks.length ||
        requiredChecks.some((id) => !receipt.checks.some((c) => c.id === id && c.exitCode === 0))
      )
        return result;
      assertion.evidence = expected.receiptDigest;
      assertion.passed = true;
    }
    result.verdict = "admit";
    grants.set(result, {
      digest: sha(JSON.stringify(result)),
      validAfter: after,
      validBefore: before,
    });
    return result;
  } catch {
    return result;
  }
}
export function assertConditionalUse(
  target: string,
  candidateCommit: string,
  usage: "local-candidate" | "public-name" | "final-private-staging",
  verdict?: ConditionalGateVerdict,
  now = new Date().toISOString(),
): void {
  if (!Object.hasOwn(inventory, target) || !/^[a-f0-9]{40}$/.test(candidateCommit))
    throw new Error("conditional-use-rejected");
  if (usage === "local-candidate") return;
  const grant = verdict && grants.get(verdict);
  const time = Date.parse(now);
  if (
    (usage !== "public-name" && usage !== "final-private-staging") ||
    !verdict ||
    !grant ||
    verdict.target !== target ||
    verdict.candidateCommit !== candidateCommit ||
    verdict.verdict !== "admit" ||
    grant.digest !== sha(JSON.stringify(verdict)) ||
    !Number.isFinite(time) ||
    time < grant.validAfter ||
    time > grant.validBefore
  )
    throw new Error("conditional-use-rejected");
}
if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    if (
      args.length !== 6 ||
      args[0] !== "--target" ||
      args[2] !== "--policy" ||
      args[4] !== "--evidence" ||
      !args[1] ||
      !args[3] ||
      !args[5]
    )
      throw new Error("conditional-input-invalid");
    const [policy, evidence] = await Promise.all([readJson(args[3]), readJson(args[5])]);
    const verdict = await evaluateConditionalGate(args[1], policy, evidence);
    process.stdout.write(`${JSON.stringify(verdict, null, 2)}\n`);
    process.exitCode = verdict.verdict === "admit" ? 0 : 1;
  } catch {
    process.stderr.write("conditional-input-invalid\n");
    process.exitCode = 1;
  }
}
