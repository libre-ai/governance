import { readFile } from "node:fs/promises";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  parseStrictJson,
  StrictJsonError,
  verifyPolicyCoreRawInputVectors,
} from "./policy-core-raw-inputs";

type JsonRecord = Record<string, unknown>;
type ErrorVariant =
  | "input-invalid"
  | "evaluated-at-invalid"
  | "rule-id-duplicate"
  | "approval-invalid"
  | "digest-mismatch"
  | "tenant-mismatch";
type GoldenCase = {
  id: string;
  policy: JsonRecord;
  snapshot: JsonRecord;
  need: JsonRecord;
  evaluatedAt: string;
  expectedEvaluation?: JsonRecord;
  expectedError?: { variant: ErrorVariant };
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

function isUtcSeconds(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$/.test(value))
    return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value.replace("Z", ".000Z");
}

function boundedInteger(value: unknown, key: string, label: string): number {
  if (!isRecord(value) || !Number.isSafeInteger(value[key]) || Number(value[key]) <= 0) {
    failures.push(`${label}: ${key} is not a positive safe integer`);
    return 0;
  }
  return Number(value[key]);
}

function requireExactCaseIds(cases: unknown[], expected: readonly string[], label: string): void {
  const ids = cases
    .filter(isRecord)
    .map((candidate) => candidate.id)
    .filter((id): id is string => typeof id === "string");
  const actual = new Set(ids);
  if (
    ids.length !== cases.length ||
    actual.size !== ids.length ||
    actual.size !== expected.length ||
    expected.some((id) => !actual.has(id))
  ) {
    failures.push(`${label}: case inventory mismatch`);
  }
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
const errorVariants = new Set<ErrorVariant>();
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
  const errorVariant = candidate.expectedError?.variant;
  if (errorVariant !== undefined) errorVariants.add(errorVariant);
  if (
    candidate.expectedError !== undefined &&
    JSON.stringify(Object.keys(candidate.expectedError).sort()) !== JSON.stringify(["variant"])
  )
    failures.push(`${label}: expected error must contain only the closed WIT variant`);
  if (errorVariant === "input-invalid") {
    if (policyValid && snapshotValid && needValid)
      failures.push(`${label}: input-invalid vector has only schema-valid inputs`);
    continue;
  }
  if (!policyValid || !snapshotValid || !needValid) {
    failures.push(`${label}: non-input-invalid vector has a schema-invalid input`);
    continue;
  }

  const evaluatedAtValid = isUtcSeconds(candidate.evaluatedAt);
  if (errorVariant === "evaluated-at-invalid" ? evaluatedAtValid : !evaluatedAtValid)
    failures.push(`${label}: evaluatedAt does not demonstrate ${errorVariant ?? "success"}`);

  const policyRules = candidate.policy.rules as JsonRecord[];
  const policyRuleIds = policyRules.map((rule) => String(rule.id));
  const duplicateRuleId = new Set(policyRuleIds).size !== policyRuleIds.length;
  if (errorVariant === "rule-id-duplicate" ? !duplicateRuleId : duplicateRuleId)
    failures.push(`${label}: duplicate rule id condition is inconsistent`);

  const approval = candidate.policy.approval as JsonRecord;
  const selfApproval = approval.approverId === candidate.policy.proposedBy;
  if (errorVariant === "approval-invalid" ? !selfApproval : selfApproval)
    failures.push(`${label}: approval separation condition is inconsistent`);

  const tenantsMatch =
    candidate.policy.tenantId === candidate.snapshot.tenantId &&
    candidate.policy.tenantId === candidate.need.tenantId;
  if (errorVariant === "tenant-mismatch" ? tenantsMatch : !tenantsMatch)
    failures.push(`${label}: tenant condition is inconsistent`);

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
  const policyDigestValid =
    candidate.policy.digest === policyDigest &&
    (candidate.policy.approval as JsonRecord).subjectDigest === policyDigest;
  const snapshotDigestValid =
    candidate.snapshot.digest ===
    digest("libre-ai.model-snapshot.v2", without(candidate.snapshot, "digest"), "snapshot");
  const needDigestValid =
    candidate.need.digest ===
    digest("libre-ai.policy-need.v2", without(candidate.need, "digest"), "need");
  const allDigestsValid = policyDigestValid && snapshotDigestValid && needDigestValid;
  if (errorVariant === "digest-mismatch" ? allDigestsValid : !allDigestsValid)
    failures.push(`${label}: digest condition is inconsistent`);

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
  "evaluated-at-invalid",
  "digest-mismatch",
  "tenant-mismatch",
  "duplicate-exact-fact",
  "self-approval-refused",
  "order-independence-a",
  "order-independence-b",
]) {
  if (!caseIds.has(required)) failures.push(`golden vectors: missing ${required}`);
}
const allErrorVariants = new Set<ErrorVariant>([
  "input-invalid",
  "evaluated-at-invalid",
  "rule-id-duplicate",
  "approval-invalid",
  "digest-mismatch",
  "tenant-mismatch",
]);
if (
  errorVariants.size !== allErrorVariants.size ||
  [...allErrorVariants].some((variant) => !errorVariants.has(variant))
) {
  failures.push("golden vectors: closed WIT error variants are not fully covered");
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
  evaluatedAtLimit !== 20 ||
  outputLimit !== 2 * 1024 * 1024
) {
  failures.push("resource budgets: byte ceilings drift from normative semantics");
}

const inputLimits = {
  policyInput,
  snapshotInput,
  needInput,
  evaluatedAt: evaluatedAtLimit,
  successfulOutput: outputLimit,
} as const;
const preflight = (
  target: keyof typeof inputLimits,
  byteLength: number,
): "input-invalid" | undefined => (byteLength > inputLimits[target] ? "input-invalid" : undefined);
const expectedBoundaryCases = {
  "policy-at-limit": ["policyInput", policyInput, "within-limit"],
  "policy-over-limit": ["policyInput", policyInput + 1, "input-invalid"],
  "snapshot-at-limit": ["snapshotInput", snapshotInput, "within-limit"],
  "snapshot-over-limit": ["snapshotInput", snapshotInput + 1, "input-invalid"],
  "need-at-limit": ["needInput", needInput, "within-limit"],
  "need-over-limit": ["needInput", needInput + 1, "input-invalid"],
  "evaluated-at-at-limit": ["evaluatedAt", 20, "within-limit"],
  "evaluated-at-over-limit": ["evaluatedAt", 21, "input-invalid"],
  "output-at-limit": ["successfulOutput", outputLimit, "within-limit"],
  "output-over-limit": ["successfulOutput", outputLimit + 1, "input-invalid"],
} as const;
const boundaryCases = Array.isArray(budgets.byteBoundaryCases) ? budgets.byteBoundaryCases : [];
requireExactCaseIds(boundaryCases, Object.keys(expectedBoundaryCases), "resource boundaries");
for (const [index, boundaryCase] of boundaryCases.entries()) {
  const label = `resource boundaries:${index}`;
  if (
    !isRecord(boundaryCase) ||
    typeof boundaryCase.id !== "string" ||
    typeof boundaryCase.target !== "string" ||
    !(boundaryCase.target in inputLimits) ||
    !Number.isSafeInteger(boundaryCase.byteLength)
  ) {
    failures.push(`${label}: invalid case`);
    continue;
  }
  const expected = expectedBoundaryCases[boundaryCase.id as keyof typeof expectedBoundaryCases];
  const declaredOutcome = boundaryCase.expectedError ?? boundaryCase.expectedPreflight;
  if (
    !expected ||
    boundaryCase.target !== expected[0] ||
    boundaryCase.byteLength !== expected[1] ||
    declaredOutcome !== expected[2]
  ) {
    failures.push(`${label}: metadata mismatch`);
  }
  const generated = new Uint8Array(Number(boundaryCase.byteLength));
  const actual = preflight(boundaryCase.target as keyof typeof inputLimits, generated.byteLength);
  if ((actual ?? "within-limit") !== declaredOutcome) failures.push(`${label}: preflight mismatch`);
}

const decoderQualification = budgets.decoderQualification;
const maximumJsonDepth = boundedInteger(
  decoderQualification,
  "maximumJsonDepth",
  "decoder qualification",
);
if (maximumJsonDepth !== 64) failures.push("decoder qualification: maximum depth drift");
const nestedJson = (depth: number): Uint8Array =>
  new TextEncoder().encode(`${"[".repeat(depth)}0${"]".repeat(depth)}`);
try {
  parseStrictJson(nestedJson(maximumJsonDepth), maximumJsonDepth);
} catch (error) {
  failures.push(`decoder qualification: exact depth rejected: ${String(error)}`);
}
try {
  parseStrictJson(nestedJson(maximumJsonDepth + 1), maximumJsonDepth);
  failures.push("decoder qualification: excessive depth accepted");
} catch (error) {
  if (!(error instanceof StrictJsonError) || error.defect !== "max-depth")
    failures.push(`decoder qualification: wrong excessive-depth refusal: ${String(error)}`);
}

const boundaryBase = golden.cases.find((candidate) => candidate.id === "all-operators-eligible");
if (!boundaryBase?.expectedEvaluation) {
  failures.push("resource boundaries: missing valid base case");
} else {
  const padValidJson = (value: JsonRecord, targetLength: number): Uint8Array => {
    const encoded = JSON.stringify(value);
    const padding = targetLength - Buffer.byteLength(encoded, "utf8");
    if (padding < 0) throw new Error("resource boundary base exceeds target");
    return new TextEncoder().encode(`${encoded}${" ".repeat(padding)}`);
  };
  for (const [target, value, validate] of [
    ["policyInput", boundaryBase.policy, policyValidator],
    ["snapshotInput", boundaryBase.snapshot, snapshotValidator],
    ["needInput", boundaryBase.need, needValidator],
  ] as const) {
    const bytes = padValidJson(value, inputLimits[target]);
    const parsed = parseStrictJson(bytes, maximumJsonDepth);
    if (bytes.byteLength !== inputLimits[target] || preflight(target, bytes.byteLength))
      failures.push(`resource boundaries: ${target} exact valid preflight failed`);
    if (!validate(parsed)) failures.push(`resource boundaries: ${target} exact JSON is invalid`);
  }

  const canonicalEvaluatedAt = "2026-07-16T00:00:00Z";
  if (
    Buffer.byteLength(canonicalEvaluatedAt, "utf8") !== evaluatedAtLimit ||
    preflight("evaluatedAt", Buffer.byteLength(canonicalEvaluatedAt, "utf8")) ||
    !isUtcSeconds(canonicalEvaluatedAt)
  ) {
    failures.push("resource boundaries: exact evaluatedAt is not valid");
  }

  const outputAtLength = (targetLength: number): JsonRecord => {
    const output = structuredClone(boundaryBase.expectedEvaluation as JsonRecord);
    output.policyId = "urn:libre-ai:policy:a";
    const initialLength = jcs(output).byteLength;
    const padding = targetLength - initialLength;
    if (padding < 0) throw new Error("resource boundary output exceeds target");
    output.policyId = `${String(output.policyId)}${"a".repeat(padding)}`;
    const evaluationDigest = digest(
      "libre-ai.policy-evaluation.v2",
      without(output, "id", "digest"),
    );
    output.id = `urn:libre-ai:evaluation:${evaluationDigest}`;
    output.digest = evaluationDigest;
    return output;
  };
  for (const [length, expected] of [
    [outputLimit, "within-limit"],
    [outputLimit + 1, "input-invalid"],
  ] as const) {
    const output = outputAtLength(length);
    const bytes = jcs(output);
    if (!evaluationValidator(output) || bytes.byteLength !== length)
      failures.push(`resource boundaries: ${expected} output is not schema-valid at target`);
    if ((preflight("successfulOutput", bytes.byteLength) ?? "within-limit") !== expected)
      failures.push(`resource boundaries: ${expected} output preflight mismatch`);
  }

  const privacyMutations: Array<
    [string, JsonRecord, ValidateFunction, (value: JsonRecord) => void]
  > = [
    [
      "policy source userinfo",
      boundaryBase.policy,
      policyValidator,
      (value) => {
        ((value.rules as JsonRecord[])[0]?.source as JsonRecord).uri =
          "https://private-canary@example.org/evidence";
      },
    ],
    [
      "snapshot source query",
      boundaryBase.snapshot,
      snapshotValidator,
      (value) => {
        ((value.facts as JsonRecord[])[0]?.source as JsonRecord).uri =
          "https://example.org/evidence?token=private_canary";
      },
    ],
    [
      "policy source localhost",
      boundaryBase.policy,
      policyValidator,
      (value) => {
        ((value.rules as JsonRecord[])[0]?.source as JsonRecord).uri = "https://localhost/evidence";
      },
    ],
    [
      "snapshot source private IP",
      boundaryBase.snapshot,
      snapshotValidator,
      (value) => {
        ((value.facts as JsonRecord[])[0]?.source as JsonRecord).uri = "https://10.0.0.1/evidence";
      },
    ],
    [
      "cross-kind policy id",
      boundaryBase.policy,
      policyValidator,
      (value) => {
        value.id = "urn:libre-ai:snapshot:wrong-kind";
      },
    ],
    [
      "cross-kind snapshot id",
      boundaryBase.snapshot,
      snapshotValidator,
      (value) => {
        value.id = "urn:libre-ai:evaluation:wrong-kind";
      },
    ],
    [
      "cross-kind need id",
      boundaryBase.need,
      needValidator,
      (value) => {
        value.id = "urn:libre-ai:policy:wrong-kind";
      },
    ],
    [
      "non-opaque model id",
      boundaryBase.snapshot,
      snapshotValidator,
      (value) => {
        value.modelId = "private@example.invalid";
      },
    ],
    [
      "free-form model fact",
      boundaryBase.snapshot,
      snapshotValidator,
      (value) => {
        const fact = (value.facts as JsonRecord[])[0];
        if (fact) fact.value = "private person@example.invalid";
      },
    ],
    [
      "free-form need fact",
      boundaryBase.need,
      needValidator,
      (value) => {
        const fact = (value.facts as JsonRecord[])[0];
        if (fact) fact.value = "private person@example.invalid";
      },
    ],
    [
      "non-opaque proposer",
      boundaryBase.policy,
      policyValidator,
      (value) => {
        value.proposedBy = "private_identity_canary";
      },
    ],
    [
      "non-opaque approver",
      boundaryBase.policy,
      policyValidator,
      (value) => {
        (value.approval as JsonRecord).approverId = "private_identity_canary";
      },
    ],
  ];
  for (const [label, base, validate, mutate] of privacyMutations) {
    const candidate = structuredClone(base);
    mutate(candidate);
    if (validate(candidate)) failures.push(`privacy qualification: accepted ${label}`);
  }
  for (const [field, value] of [
    ["policyId", "urn:libre-ai:snapshot:wrong-kind"],
    ["snapshotId", "urn:libre-ai:policy:wrong-kind"],
  ] as const) {
    const candidate = structuredClone(boundaryBase.expectedEvaluation);
    candidate[field] = value;
    if (evaluationValidator(candidate))
      failures.push(`privacy qualification: accepted cross-kind evaluation ${field}`);
  }
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

const openApiText = await readFile("contracts/openapi/model-policy.v2.yaml", "utf8");
const openApi = (Bun as unknown as { YAML: { parse(text: string): unknown } }).YAML.parse(
  openApiText,
);
const components = isRecord(openApi) && isRecord(openApi.components) ? openApi.components : {};
const componentSchemas = isRecord(components.schemas) ? components.schemas : {};
const problem = isRecord(componentSchemas.PolicyProblem) ? componentSchemas.PolicyProblem : {};
const problemProperties = isRecord(problem.properties) ? problem.properties : {};
const problemError = isRecord(problemProperties.error) ? problemProperties.error : {};
const problemErrorProperties = isRecord(problemError.properties) ? problemError.properties : {};
if (
  problem.additionalProperties !== false ||
  problemError.additionalProperties !== false ||
  !("code" in problemErrorProperties) ||
  !("requestId" in problemErrorProperties) ||
  "message" in problemErrorProperties ||
  openApiText.includes("problem-details.v1.schema.json")
) {
  failures.push("OpenAPI: v2 refusal envelope is not closed and redacted");
}
const paths = isRecord(openApi) && isRecord(openApi.paths) ? openApi.paths : {};
const diffPath = isRecord(paths["/v2/model-policy/policies/{policyId}/diff"])
  ? paths["/v2/model-policy/policies/{policyId}/diff"]
  : {};
const diffGet = isRecord(diffPath.get) ? diffPath.get : {};
const diffResponses = isRecord(diffGet.responses) ? diffGet.responses : {};
const diffSuccess = isRecord(diffResponses["200"]) ? diffResponses["200"] : {};
if (
  !JSON.stringify(diffSuccess).includes("#/components/schemas/PolicyDiff") ||
  !isRecord(componentSchemas.PolicyDiff)
) {
  failures.push("OpenAPI: policy diff projection is not schema-bound");
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(
  `Policy-core vectors verified: ${golden.cases.length} golden cases, ${operators.vectors.length} operator cases, ${rawInputCount} raw decoder refusals, ${boundaryCases.length} byte boundaries with valid exact ceilings, depth ${maximumJsonDepth}, privacy-minimized sources and principals, typed URNs and closed HTTP refusals, bounded for preimplementation`,
);
