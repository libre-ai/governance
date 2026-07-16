import { readFile } from "node:fs/promises";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { verifyPolicyCoreRawInputVectors } from "./policy-core-raw-inputs";

type JsonRecord = Record<string, unknown>;
type GoldenCase = {
  id: string;
  policy: JsonRecord;
  snapshot: JsonRecord;
  need: JsonRecord;
  evaluatedAt: string;
  expectedEvaluation?: JsonRecord;
  expectedError?: { code: string };
};

const failures: string[] = [];
const rawInputCount = await verifyPolicyCoreRawInputVectors(failures, "policy-core-v2");
const schemaNames = [
  "common.v1.schema.json",
  "policy-definition.v2.schema.json",
  "model-snapshot.v2.schema.json",
  "policy-need.v2.schema.json",
  "policy-evaluation.v2.schema.json",
] as const;
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
for (const name of schemaNames) {
  ajv.addSchema(JSON.parse(await readFile(`contracts/schemas/${name}`, "utf8")));
}

function validator(name: (typeof schemaNames)[number]): ValidateFunction {
  const validate = ajv.getSchema(`https://contracts.libre-ai.fr/schemas/${name}`);
  if (!validate) throw new Error(`missing validator for ${name}`);
  return validate;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compareBytes(left: Uint8Array, right: Uint8Array): number {
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return left.length - right.length;
}

function sortObjectMembers(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectMembers);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, nested]) => [key, sortObjectMembers(nested)]),
  );
}

function jcs(value: unknown): Uint8Array {
  const encoded = JSON.stringify(sortObjectMembers(value));
  if (encoded === undefined) throw new TypeError("value is not JSON serializable");
  return new TextEncoder().encode(encoded);
}

function typeRank(value: unknown): number {
  if (typeof value === "boolean") return 0;
  if (typeof value === "number") return 1;
  if (typeof value === "string") return 2;
  throw new TypeError("policy fact is not scalar");
}

function compareFacts(left: JsonRecord, right: JsonRecord, includeSource: boolean): number {
  const leftName = new TextEncoder().encode(String(left.name));
  const rightName = new TextEncoder().encode(String(right.name));
  return (
    compareBytes(leftName, rightName) ||
    typeRank(left.value) - typeRank(right.value) ||
    compareBytes(jcs(left.value), jcs(right.value)) ||
    (includeSource ? compareBytes(jcs(left.source), jcs(right.source)) : 0)
  );
}

function normalize(value: JsonRecord, kind: "policy" | "snapshot" | "need"): JsonRecord {
  const normalized = structuredClone(value);
  if (kind === "policy") {
    const rules = normalized.rules as JsonRecord[];
    for (const rule of rules) {
      if (rule.operator === "in" || rule.operator === "not-in") {
        (rule.value as unknown[]).sort((left, right) => compareBytes(jcs(left), jcs(right)));
      }
    }
    rules.sort((left, right) =>
      compareBytes(
        new TextEncoder().encode(String(left.id)),
        new TextEncoder().encode(String(right.id)),
      ),
    );
  } else {
    (normalized.facts as JsonRecord[]).sort((left, right) =>
      compareFacts(left, right, kind === "snapshot"),
    );
  }
  return normalized;
}

function digest(label: string, value: JsonRecord, kind?: "policy" | "snapshot" | "need"): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(label);
  hasher.update(new Uint8Array([0]));
  hasher.update(jcs(kind ? normalize(value, kind) : value));
  return hasher.digest("hex");
}

function without(value: JsonRecord, ...keys: string[]): JsonRecord {
  const projection = structuredClone(value);
  for (const key of keys) delete projection[key];
  return projection;
}

function boundedInteger(value: unknown, key: string, label: string): number {
  if (!isRecord(value) || !Number.isSafeInteger(value[key]) || Number(value[key]) <= 0) {
    failures.push(`${label}: ${key} is not a positive safe integer`);
    return 0;
  }
  return Number(value[key]);
}

const policyValidator = validator("policy-definition.v2.schema.json");
const snapshotValidator = validator("model-snapshot.v2.schema.json");
const needValidator = validator("policy-need.v2.schema.json");
const evaluationValidator = validator("policy-evaluation.v2.schema.json");

const golden = JSON.parse(
  await readFile("contracts/fixtures/policy-core-v2/golden.json", "utf8"),
) as { schemaVersion: string; engineVersion: string; cases: GoldenCase[] };
if (golden.schemaVersion !== "libre-ai.policy-core-golden-vectors.v2") {
  failures.push("golden vectors: invalid schemaVersion");
}
if (!Array.isArray(golden.cases) || golden.cases.length === 0) {
  failures.push("golden vectors: no cases");
}

const caseIds = new Set<string>();
for (const candidate of golden.cases) {
  const label = `golden:${candidate.id}`;
  if (caseIds.has(candidate.id)) failures.push(`${label}: duplicate case id`);
  caseIds.add(candidate.id);
  const policyValid = policyValidator(candidate.policy);
  const snapshotValid = snapshotValidator(candidate.snapshot);
  const needValid = needValidator(candidate.need);
  const success = candidate.expectedEvaluation !== undefined;
  const error = candidate.expectedError !== undefined;
  if (success === error) failures.push(`${label}: expected exactly one evaluation or error`);
  if (
    candidate.expectedError !== undefined &&
    JSON.stringify(Object.keys(candidate.expectedError).sort()) !== JSON.stringify(["code"])
  )
    failures.push(`${label}: expected error must contain only the closed public code`);
  if (candidate.expectedError?.code === "policy.input_invalid") {
    if (policyValid && snapshotValid && needValid)
      failures.push(`${label}: input-invalid vector has only schema-valid inputs`);
    continue;
  }
  if (!policyValid || !snapshotValid || !needValid) {
    failures.push(`${label}: non-input-invalid vector has a schema-invalid input`);
    continue;
  }

  const approval = candidate.policy.approval as JsonRecord;
  const selfApproval = approval.approverId === candidate.policy.proposedBy;
  if (candidate.expectedError?.code === "policy.approval_invalid" && !selfApproval)
    failures.push(`${label}: approval-invalid vector does not self-approve`);
  if (candidate.expectedError?.code !== "policy.approval_invalid" && selfApproval)
    failures.push(`${label}: self-approval is not refused`);

  const policySubject = {
    schemaVersion: candidate.policy.schemaVersion,
    id: candidate.policy.id,
    tenantId: candidate.policy.tenantId,
    version: candidate.policy.version,
    status: candidate.policy.status,
    proposedBy: candidate.policy.proposedBy,
    rules: candidate.policy.rules,
  };
  const policyDigest = digest("libre-ai.policy-definition.v2", policySubject, "policy");
  if (
    candidate.policy.digest !== policyDigest ||
    (candidate.policy.approval as JsonRecord).subjectDigest !== policyDigest
  ) {
    failures.push(`${label}: invalid policy digest`);
  }
  if (
    candidate.snapshot.digest !==
    digest("libre-ai.model-snapshot.v2", without(candidate.snapshot, "digest"), "snapshot")
  ) {
    failures.push(`${label}: invalid snapshot digest`);
  }
  if (
    candidate.need.digest !==
    digest("libre-ai.policy-need.v2", without(candidate.need, "digest"), "need")
  ) {
    failures.push(`${label}: invalid need digest`);
  }

  if (!candidate.expectedEvaluation) continue;
  const evaluation = candidate.expectedEvaluation;
  if (!evaluationValidator(evaluation)) {
    failures.push(`${label}: expected evaluation is schema-invalid`);
    continue;
  }
  const evaluationDigest = digest(
    "libre-ai.policy-evaluation.v2",
    without(evaluation, "id", "digest"),
  );
  if (
    evaluation.digest !== evaluationDigest ||
    evaluation.id !== `urn:libre-ai:evaluation:${evaluationDigest}`
  ) {
    failures.push(`${label}: invalid evaluation id or digest`);
  }
  if (
    evaluation.policyId !== candidate.policy.id ||
    evaluation.policyDigest !== candidate.policy.digest ||
    evaluation.snapshotId !== candidate.snapshot.id ||
    evaluation.snapshotDigest !== candidate.snapshot.digest ||
    evaluation.needDigest !== candidate.need.digest ||
    evaluation.evaluatedAt !== candidate.evaluatedAt ||
    evaluation.engineVersion !== golden.engineVersion
  ) {
    failures.push(`${label}: evaluation does not bind its inputs`);
  }
  const ruleIds = (evaluation.ruleResults as JsonRecord[]).map((result) => String(result.ruleId));
  const sortedRuleIds = [...ruleIds].sort((left, right) =>
    compareBytes(new TextEncoder().encode(left), new TextEncoder().encode(right)),
  );
  if (JSON.stringify(ruleIds) !== JSON.stringify(sortedRuleIds)) {
    failures.push(`${label}: ruleResults are not sorted by raw ASCII rule id`);
  }
  if (new Set(ruleIds).size !== ruleIds.length) {
    failures.push(`${label}: duplicate rule result`);
  }
}

for (const required of [
  "all-operators-eligible",
  "stale-boundary-inclusive",
  "stale-one-second-over",
  "unknown-ineligible",
  "failed-before-unknown",
  "origin-is-not-jurisdiction",
  "origin-and-jurisdiction-independent",
  "multiple-facts-failed-priority",
  "multiple-sources-stale-priority",
  "source-from-future",
  "type-mismatch-unknown",
  "fractional-number-jcs",
  "duplicate-rule-id",
  "tenant-mismatch",
  "duplicate-exact-fact",
  "self-approval-refused",
  "order-independence-a",
  "order-independence-b",
]) {
  if (!caseIds.has(required)) failures.push(`golden vectors: missing ${required}`);
}
const orderA = golden.cases.find((candidate) => candidate.id === "order-independence-a");
const orderB = golden.cases.find((candidate) => candidate.id === "order-independence-b");
if (
  !orderA ||
  !orderB ||
  JSON.stringify(orderA.expectedEvaluation) !== JSON.stringify(orderB.expectedEvaluation)
) {
  failures.push("golden vectors: order-independence outputs differ");
}

const budgets = JSON.parse(
  await readFile("contracts/fixtures/policy-core-v2/resource-budgets.v1.json", "utf8"),
) as JsonRecord;
if (
  budgets.schemaVersion !== "libre-ai.policy-core-resource-budgets.v1" ||
  budgets.status !== "candidate-preimplementation"
) {
  failures.push("resource budgets: invalid identity or status");
}
const byteLimits = budgets.byteLimits;
const cardinalityLimits = budgets.cardinalityLimits;
const cpuQualification = budgets.cpuQualification;
const memoryQualification = budgets.memoryQualification;
const policyInput = boundedInteger(byteLimits, "policyInput", "resource budgets");
const snapshotInput = boundedInteger(byteLimits, "snapshotInput", "resource budgets");
const needInput = boundedInteger(byteLimits, "needInput", "resource budgets");
const totalJsonInput = boundedInteger(byteLimits, "totalJsonInput", "resource budgets");
const evaluatedAtLimit = boundedInteger(byteLimits, "evaluatedAt", "resource budgets");
const outputLimit = boundedInteger(byteLimits, "successfulOutput", "resource budgets");
const rulesLimit = boundedInteger(cardinalityLimits, "rules", "resource budgets");
const modelFactsLimit = boundedInteger(cardinalityLimits, "modelFacts", "resource budgets");
const needFactsLimit = boundedInteger(cardinalityLimits, "needFacts", "resource budgets");
const setMembersLimit = boundedInteger(cardinalityLimits, "setMembersPerRule", "resource budgets");
const policySchema = JSON.parse(
  await readFile("contracts/schemas/policy-definition.v2.schema.json", "utf8"),
) as JsonRecord;
const snapshotSchema = JSON.parse(
  await readFile("contracts/schemas/model-snapshot.v2.schema.json", "utf8"),
) as JsonRecord;
const needSchema = JSON.parse(
  await readFile("contracts/schemas/policy-need.v2.schema.json", "utf8"),
) as JsonRecord;
const policyProperties = policySchema.properties as JsonRecord;
const snapshotProperties = snapshotSchema.properties as JsonRecord;
const needProperties = needSchema.properties as JsonRecord;
const definitions = policySchema.$defs as JsonRecord;
const factSet = definitions.factSet as JsonRecord;
const factSetVariants = Array.isArray(factSet.oneOf) ? (factSet.oneOf as JsonRecord[]) : [];
const schemaSetMaximum = Math.max(
  ...factSetVariants.map((variant) =>
    typeof variant.maxItems === "number" ? variant.maxItems : 0,
  ),
);
if (
  rulesLimit !== (policyProperties.rules as JsonRecord).maxItems ||
  modelFactsLimit !== (snapshotProperties.facts as JsonRecord).maxItems ||
  needFactsLimit !== (needProperties.facts as JsonRecord).maxItems ||
  setMembersLimit !== schemaSetMaximum
) {
  failures.push("resource budgets: cardinalities drift from JSON Schemas");
}
if (
  policyInput !== 8 * 1024 * 1024 ||
  snapshotInput !== 8 * 1024 * 1024 ||
  needInput !== 8 * 1024 * 1024 ||
  totalJsonInput !== policyInput + snapshotInput + needInput ||
  evaluatedAtLimit !== 64 ||
  outputLimit !== 2 * 1024 * 1024
) {
  failures.push("resource budgets: byte ceilings drift from normative semantics");
}
const expectedMatchedPairs = rulesLimit * Math.max(modelFactsLimit, needFactsLimit);
const expectedSetComparisonsPerLookup = Math.ceil(Math.log2(setMembersLimit + 1));
if (
  boundedInteger(cardinalityLimits, "setMembersAcrossPolicy", "resource budgets") !==
    rulesLimit * setMembersLimit ||
  boundedInteger(cpuQualification, "ruleOccurrenceEvaluations", "resource budgets") !==
    expectedMatchedPairs ||
  boundedInteger(cpuQualification, "setMemberComparisonsPerLookup", "resource budgets") !==
    expectedSetComparisonsPerLookup ||
  boundedInteger(cpuQualification, "setMemberComparisons", "resource budgets") !==
    expectedMatchedPairs * expectedSetComparisonsPerLookup
) {
  failures.push("resource budgets: deterministic CPU ceilings are inconsistent");
}
if (
  !isRecord(cpuQualification) ||
  cpuQualification.setLookup !== "sorted-binary-search-or-equivalent-bounded-lookup" ||
  cpuQualification.duplicateDetection !== "canonical-hash-or-ordered-index" ||
  cpuQualification.wallClockLimit !== null ||
  !isRecord(memoryQualification) ||
  memoryQualification.peakComponentLinearMemoryBytes !== 256 * 1024 * 1024
) {
  failures.push("resource budgets: qualification timing or memory ceiling is invalid");
}

const operators = JSON.parse(
  await readFile("contracts/fixtures/policy-core-v2/operators.json", "utf8"),
) as {
  schemaVersion: string;
  vectors: Array<{
    id: string;
    operator: string;
    ruleValue: unknown;
    expected: { status: string };
  }>;
  aggregationVectors: unknown[];
  invalidPolicyVectors: unknown[];
};
if (operators.schemaVersion !== "libre-ai.policy-core-operator-vectors.v2") {
  failures.push("operator vectors: invalid schemaVersion");
}
const combinations = new Map<string, Set<string>>();
for (const vector of operators.vectors ?? []) {
  const valueType = Array.isArray(vector.ruleValue)
    ? typeof vector.ruleValue[0]
    : typeof vector.ruleValue;
  const key = `${vector.operator}:${valueType}`;
  const statuses = combinations.get(key) ?? new Set<string>();
  statuses.add(vector.expected.status);
  combinations.set(key, statuses);
}
for (const key of [
  "equals:string",
  "equals:number",
  "equals:boolean",
  "not-equals:string",
  "not-equals:number",
  "not-equals:boolean",
  "in:string",
  "in:number",
  "in:boolean",
  "not-in:string",
  "not-in:number",
  "not-in:boolean",
  "at-least:number",
  "at-most:number",
]) {
  const statuses = combinations.get(key);
  if (!statuses?.has("satisfied") || !statuses.has("failed")) {
    failures.push(`operator vectors: ${key} lacks satisfied/failed coverage`);
  }
}
if ((operators.aggregationVectors?.length ?? 0) < 5) {
  failures.push("operator vectors: incomplete cardinality/priority coverage");
}
if ((operators.invalidPolicyVectors?.length ?? 0) < 10) {
  failures.push("operator vectors: incomplete forbidden-type coverage");
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(
  `Policy-core vectors verified: ${golden.cases.length} golden cases, ${operators.vectors.length} operator cases, ${rawInputCount} raw decoder refusals, bounded for preimplementation`,
);
