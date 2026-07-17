import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { parseStrictJson, StrictJsonError } from "./policy-core-raw-inputs";

type RecordValue = Record<string, unknown>;
type ComparisonInput = {
  dataset: RecordValue;
  method: RecordValue;
  responses: RecordValue;
  computedAt: string;
};
type Patch = { op: "replace"; path: string; value: unknown };
type VectorCase = {
  id: string;
  input?: ComparisonInput;
  baseCase?: string;
  patches?: Patch[];
  expected?: RecordValue;
  expectedError?: string;
};

type Evaluation = { value?: RecordValue; error?: string };
type Statement = {
  id: string;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  absent: number;
};
type Response = { statementId: string; kind: "answer" | "skip"; value?: number };

const failures: string[] = [];
const vectorPath = "contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json";
const securityVectorPath = "contracts/fixtures/boussole-scoring-v2/security-vectors.v1.json";
const byteLimits = {
  "dataset-input": 8 * 1024 * 1024,
  "method-input": 64 * 1024,
  "responses-input": 256 * 1024,
  "successful-output": 512 * 1024,
} as const;
const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, nested]) => [key, sorted(nested)]),
  );
}

function jcs(value: unknown): string {
  const encoded = JSON.stringify(sorted(value));
  if (encoded === undefined) throw new TypeError("not JSON");
  return encoded;
}

function sha256Hex(value: Uint8Array): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(value);
  return hasher.digest("hex");
}

function digest(label: string, value: unknown): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(label);
  hasher.update(new Uint8Array([0]));
  hasher.update(jcs(value));
  return hasher.digest("hex");
}

function decodeHex(value: unknown, label: string): Uint8Array {
  if (typeof value !== "string" || !/^(?:[a-f0-9]{2})*$/.test(value))
    throw new Error(`${label}: invalid lowercase hex`);
  return new Uint8Array(Buffer.from(value, "hex"));
}

function preflightLength(
  target: keyof typeof byteLimits,
  byteLength: number,
): "resource-limit-exceeded" | undefined {
  return byteLength > byteLimits[target] ? "resource-limit-exceeded" : undefined;
}

function requireExactCaseIds(cases: unknown[], expected: readonly string[], section: string): void {
  const ids = cases
    .filter(isRecord)
    .map((value) => value.id)
    .filter((value): value is string => typeof value === "string");
  const actual = new Set(ids);
  if (
    ids.length !== cases.length ||
    actual.size !== ids.length ||
    actual.size !== expected.length ||
    expected.some((id) => !actual.has(id))
  ) {
    failures.push(`${section}: case inventory mismatch`);
  }
}

function without(value: RecordValue, ...keys: string[]): RecordValue {
  const result = structuredClone(value);
  for (const key of keys) delete result[key];
  return result;
}

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function roundRational(numerator: bigint, denominator: bigint): number {
  if (denominator <= 0n) throw new RangeError("non-positive denominator");
  const negative = numerator < 0n;
  const absolute = negative ? -numerator : numerator;
  const scaled = absolute * 1_000_000n;
  let quotient = scaled / denominator;
  const remainder = scaled % denominator;
  if (remainder * 2n > denominator || (remainder * 2n === denominator && quotient % 2n === 1n)) {
    quotient += 1n;
  }
  const signed = negative ? -quotient : quotient;
  const result = Number(signed) / 1_000_000;
  return Object.is(result, -0) ? 0 : result;
}

function isUtcSeconds(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$/.test(value))
    return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value.replace("Z", ".000Z");
}

function approvalIsValid(value: RecordValue, subjectDigest: string): boolean {
  const approvals = value.approvals;
  if (!Array.isArray(approvals) || approvals.length !== 2 || !approvals.every(isRecord))
    return false;
  const roles = new Set(approvals.map((approval) => approval.role));
  const reviewers = new Set(approvals.map((approval) => approval.reviewerId));
  const expectedCapacity = new Map([
    ["methodological-review", "methodology-expert"],
    ["legal-privacy-review", "privacy-legal-expert"],
  ]);
  return (
    roles.size === 2 &&
    roles.has("methodological-review") &&
    roles.has("legal-privacy-review") &&
    reviewers.size === 2 &&
    approvals.every((approval) => {
      const attestation = approval.attestation;
      return (
        approval.actorKind === "human" &&
        approval.subjectDigest === subjectDigest &&
        approval.professionalCapacity === expectedCapacity.get(String(approval.role)) &&
        isRecord(attestation) &&
        attestation.publicationBasis === "explicit-publication-consent" &&
        attestation.identityBoundary === "professional-attestation-only"
      );
    })
  );
}

function publicationPolicyError(
  input: ComparisonInput,
): "input-invalid" | "approval-invalid" | undefined {
  const policy = input.dataset.publicationPolicy;
  const statements = input.dataset.statements;
  if (
    !isRecord(policy) ||
    !Number.isSafeInteger(policy.minimumGroupSize) ||
    !Array.isArray(statements)
  ) {
    return "input-invalid";
  }
  const minimum = BigInt(policy.minimumGroupSize as number);
  for (const statement of statements) {
    if (!isRecord(statement)) return "input-invalid";
    const counters = [
      statement.votesFor,
      statement.votesAgainst,
      statement.abstentions,
      statement.absent,
    ];
    if (!counters.every((counter) => Number.isSafeInteger(counter) && Number(counter) >= 0))
      return "input-invalid";
    let groupSize = 0n;
    for (const counter of counters) groupSize += BigInt(counter as number);
    if (groupSize < minimum) return "input-invalid";
  }
  if (
    typeof policy.publicationReviewExpiresAt !== "string" ||
    !isUtcSeconds(policy.publicationReviewExpiresAt) ||
    typeof input.dataset.publishedAt !== "string" ||
    !isUtcSeconds(input.dataset.publishedAt) ||
    input.dataset.publishedAt >= policy.publicationReviewExpiresAt
  ) {
    return "input-invalid";
  }
  if (input.computedAt > policy.publicationReviewExpiresAt) return "approval-invalid";
  return undefined;
}

function canonicalMethodDigest(method: RecordValue): string {
  return digest(
    "libre-ai.boussole-method.v2",
    without(method, "approvedAt", "digest", "approvals"),
  );
}

function canonicalDatasetDigest(dataset: RecordValue): string {
  const core = without(dataset, "publishedAt", "digest", "approvals");
  if (Array.isArray(core.statements)) {
    core.statements.sort((left, right) =>
      compareUtf8(String((left as RecordValue).id), String((right as RecordValue).id)),
    );
  }
  return digest("libre-ai.public-vote-dataset.v2", core);
}

function canonicalResponseDigest(responses: RecordValue): string {
  const core = structuredClone(responses);
  if (Array.isArray(core.responses)) {
    core.responses.sort((left, right) =>
      compareUtf8(
        String((left as RecordValue).statementId),
        String((right as RecordValue).statementId),
      ),
    );
  }
  return digest("libre-ai.boussole-response-set.v2", core);
}

function validScale(method: RecordValue): { values: number[]; maximum: bigint } | undefined {
  if (!Array.isArray(method.responseScale) || method.responseScale.length < 2) return undefined;
  const values = method.responseScale;
  if (!values.every((value) => Number.isInteger(value))) return undefined;
  for (let index = 1; index < values.length; index += 1) {
    if ((values[index - 1] as number) >= (values[index] as number)) return undefined;
  }
  const set = new Set(values);
  if (!values.every((value) => set.has(-value))) return undefined;
  const maximum = Math.max(...values.map((value) => Math.abs(value)));
  return maximum > 0 ? { values, maximum: BigInt(maximum) } : undefined;
}

function validateInputSchemas(
  input: ComparisonInput,
  validators: Record<"dataset" | "method" | "responses" | "output", ValidateFunction>,
): boolean {
  return (
    validators.dataset(input.dataset) &&
    validators.method(input.method) &&
    validators.responses(input.responses)
  );
}

function evaluate(
  input: ComparisonInput,
  validators: Record<"dataset" | "method" | "responses" | "output", ValidateFunction>,
): Evaluation {
  if (!validateInputSchemas(input, validators)) return { error: "input-invalid" };
  if (!isUtcSeconds(input.computedAt)) return { error: "computed-at-invalid" };
  const publicationError = publicationPolicyError(input);
  if (publicationError) return { error: publicationError };

  const scale = validScale(input.method);
  if (!scale) return { error: "method-unsupported" };

  const methodDigest = canonicalMethodDigest(input.method);
  const datasetDigest = canonicalDatasetDigest(input.dataset);
  if (
    input.method.digest !== methodDigest ||
    input.dataset.digest !== datasetDigest ||
    input.dataset.methodId !== input.method.id ||
    input.dataset.methodDigest !== methodDigest ||
    input.responses.datasetId !== input.dataset.id ||
    input.responses.datasetDigest !== datasetDigest ||
    input.responses.methodId !== input.method.id ||
    input.responses.methodDigest !== methodDigest
  ) {
    return { error: "digest-mismatch" };
  }
  if (
    !approvalIsValid(input.method, methodDigest) ||
    !approvalIsValid(input.dataset, datasetDigest)
  ) {
    return { error: "approval-invalid" };
  }

  const statements = input.dataset.statements as Statement[];
  const responses = input.responses.responses as Response[];
  const statementMap = new Map<string, Statement>();
  for (const statement of statements) {
    if (statementMap.has(statement.id)) return { error: "response-invalid" };
    statementMap.set(statement.id, statement);
  }
  const responseMap = new Map<string, Response>();
  for (const response of responses) {
    if (
      responseMap.has(response.statementId) ||
      !statementMap.has(response.statementId) ||
      (response.kind === "answer" && !scale.values.includes(response.value as number))
    ) {
      return { error: "response-invalid" };
    }
    responseMap.set(response.statementId, response);
  }

  let denominator = 0n;
  let omitted = 0n;
  let scoreNumerator = 0n;
  const contributions: RecordValue[] = [];
  for (const statement of [...statements].sort((left, right) => compareUtf8(left.id, right.id))) {
    const response = responseMap.get(statement.id);
    const votesFor = BigInt(statement.votesFor);
    const votesAgainst = BigInt(statement.votesAgainst);
    const abstentions = BigInt(statement.abstentions);
    const absent = BigInt(statement.absent);
    const allVotes = votesFor + votesAgainst + abstentions + absent;
    if (!response || response.kind === "skip") {
      omitted += allVotes;
      continue;
    }
    const considered =
      input.method.abstentionTreatment === "neutral"
        ? votesFor + votesAgainst + abstentions
        : votesFor + votesAgainst;
    const votesOmitted =
      input.method.abstentionTreatment === "neutral" ? absent : abstentions + absent;
    if (considered === 0n) {
      omitted += allVotes;
      continue;
    }
    const answer = BigInt(response.value as number);
    const contributionNumerator = answer * (votesFor - votesAgainst);
    const contributionDenominator = scale.maximum * considered;
    contributions.push({
      statementId: statement.id,
      contribution: roundRational(contributionNumerator, contributionDenominator),
      votesConsidered: Number(considered),
      votesOmitted: Number(votesOmitted),
    });
    denominator += considered;
    omitted += votesOmitted;
    scoreNumerator += contributionNumerator;
  }
  if (denominator === 0n) return { error: "denominator-zero" };

  const output: RecordValue = {
    schemaVersion: "libre-ai.local-comparison.v2",
    datasetId: input.dataset.id,
    datasetDigest,
    methodId: input.method.id,
    methodDigest,
    responseSetDigest: canonicalResponseDigest(input.responses),
    score: roundRational(scoreNumerator, scale.maximum * denominator),
    denominator: Number(denominator),
    omitted: Number(omitted),
    contributions,
    computedAt: input.computedAt,
  };
  if (!validators.output(output)) return { error: "input-invalid" };
  return { value: output };
}

function evaluateRaw(
  datasetBytes: Uint8Array,
  methodBytes: Uint8Array,
  responseBytes: Uint8Array,
  computedAt: string,
  validators: Record<"dataset" | "method" | "responses" | "output", ValidateFunction>,
): Evaluation {
  if (
    preflightLength("dataset-input", datasetBytes.byteLength) ||
    preflightLength("method-input", methodBytes.byteLength) ||
    preflightLength("responses-input", responseBytes.byteLength)
  ) {
    return { error: "resource-limit-exceeded" };
  }
  let dataset: unknown;
  let method: unknown;
  let responses: unknown;
  try {
    dataset = parseStrictJson(datasetBytes, 64);
    method = parseStrictJson(methodBytes, 64);
    responses = parseStrictJson(responseBytes, 64);
  } catch {
    return { error: "input-invalid" };
  }
  if (!isRecord(dataset) || !isRecord(method) || !isRecord(responses))
    return { error: "input-invalid" };
  const result = evaluate({ dataset, method, responses, computedAt }, validators);
  if (
    result.value &&
    preflightLength("successful-output", Buffer.byteLength(jcs(result.value), "utf8"))
  ) {
    return { error: "resource-limit-exceeded" };
  }
  return result;
}

function decodePointer(segment: string): string {
  return segment.replaceAll("~1", "/").replaceAll("~0", "~");
}

function applyPatches(input: ComparisonInput, patches: Patch[], label: string): ComparisonInput {
  if (patches.length > 32) throw new Error(`${label}: too many patches`);
  const output = structuredClone(input) as unknown;
  for (const patch of patches) {
    if (patch.op !== "replace" || !patch.path.startsWith("/")) {
      throw new Error(`${label}: unsupported patch`);
    }
    const segments = patch.path.split("/").slice(1).map(decodePointer);
    if (
      segments.length === 0 ||
      segments.some((segment) => ["__proto__", "constructor", "prototype"].includes(segment))
    ) {
      throw new Error(`${label}: unsafe patch path`);
    }
    let target = output;
    for (const segment of segments.slice(0, -1)) {
      if (Array.isArray(target)) {
        const index = Number(segment);
        if (!Number.isInteger(index) || index < 0 || index >= target.length) {
          throw new Error(`${label}: unknown array patch path`);
        }
        target = target[index];
      } else if (isRecord(target) && Object.hasOwn(target, segment)) {
        target = target[segment];
      } else {
        throw new Error(`${label}: unknown patch path`);
      }
    }
    const last = segments.at(-1) as string;
    if (Array.isArray(target)) {
      const index = Number(last);
      if (!Number.isInteger(index) || index < 0 || index >= target.length) {
        throw new Error(`${label}: unknown array patch target`);
      }
      target[index] = structuredClone(patch.value);
    } else if (isRecord(target) && Object.hasOwn(target, last)) {
      target[last] = structuredClone(patch.value);
    } else {
      throw new Error(`${label}: unknown patch target`);
    }
  }
  return output as ComparisonInput;
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
for await (const name of new Bun.Glob("*.schema.json").scan({
  cwd: "contracts/schemas",
  onlyFiles: true,
})) {
  ajv.addSchema(await Bun.file(`contracts/schemas/${name}`).json());
}
function validator(name: string): ValidateFunction {
  const value = ajv.getSchema(`https://contracts.libre-ai.fr/schemas/${name}`);
  if (!value) throw new Error(`missing schema ${name}`);
  return value;
}
const validators = {
  dataset: validator("public-vote-dataset.v2.schema.json"),
  method: validator("boussole-method.v2.schema.json"),
  responses: validator("boussole-response-set.v2.schema.json"),
  output: validator("local-comparison.v2.schema.json"),
};

const methodSchema = (await Bun.file(
  "contracts/schemas/boussole-method.v2.schema.json",
).json()) as RecordValue;
const datasetSchema = (await Bun.file(
  "contracts/schemas/public-vote-dataset.v2.schema.json",
).json()) as RecordValue;
if (
  jcs((methodSchema.$defs as RecordValue)?.reviewApproval) !==
  jcs((datasetSchema.$defs as RecordValue)?.reviewApproval)
) {
  failures.push("Boussole reviewer attestation definitions differ");
}
const catalog = (await Bun.file("contracts/catalog.v1.json").json()) as RecordValue;
const catalogContracts = Array.isArray(catalog.contracts) ? catalog.contracts : [];
const scoringAuthority = catalogContracts.find(
  (entry) => isRecord(entry) && entry.id === "boussole-scoring-v2",
);
if (
  !isRecord(scoringAuthority) ||
  !Array.isArray(scoringAuthority.vectors) ||
  !scoringAuthority.vectors.includes(vectorPath) ||
  !scoringAuthority.vectors.includes(securityVectorPath)
) {
  failures.push("Boussole catalog authority does not bind both normative vector corpora");
}

const document: unknown = await Bun.file(vectorPath).json();
if (!isRecord(document) || document.schemaVersion !== "libre-ai.engine-golden-vectors.v1") {
  failures.push("invalid vector envelope");
}
const cases =
  isRecord(document) && Array.isArray(document.cases) ? (document.cases as VectorCase[]) : [];
if (cases.length < 10 || cases.length > 32) failures.push("expected 10..32 bounded Boussole cases");
const inputs = new Map<string, ComparisonInput>();
const ids = new Set<string>();
const coveredRefusals = new Set<string>();
const required = new Set([
  "excluded-abstentions-positive-agreement",
  "reject-duplicate-reviewer",
  "reject-zero-denominator",
  "neutral-scale-five",
  "weighted-with-skipped-and-missing",
  "half-even-boundaries",
  "reject-unknown-statement",
  "zero-answer-is-not-skip",
  "intermediate-scale-normalization",
  "negative-half-even-boundaries",
]);
for (const [index, vector] of cases.entries()) {
  const label = `${vectorPath}#/cases/${index}`;
  if (
    !isRecord(vector) ||
    typeof vector.id !== "string" ||
    !/^[a-z0-9][a-z0-9-]+$/.test(vector.id)
  ) {
    failures.push(`${label}: invalid id`);
    continue;
  }
  if (ids.has(vector.id)) failures.push(`${label}: duplicate id`);
  ids.add(vector.id);
  required.delete(vector.id);
  let input: ComparisonInput | undefined;
  try {
    if (isRecord(vector.input)) {
      input = structuredClone(vector.input) as ComparisonInput;
      if (vector.baseCase !== undefined || vector.patches !== undefined) {
        throw new Error(`${label}: input cannot be combined with baseCase/patches`);
      }
    } else if (typeof vector.baseCase === "string" && Array.isArray(vector.patches)) {
      const base = inputs.get(vector.baseCase);
      if (!base) throw new Error(`${label}: base case must precede derived case`);
      input = applyPatches(base, vector.patches as Patch[], label);
    } else {
      throw new Error(`${label}: missing executable input`);
    }
  } catch (error) {
    failures.push(String(error));
    continue;
  }
  inputs.set(vector.id, input);
  const hasValue = isRecord(vector.expected);
  const hasError = typeof vector.expectedError === "string";
  if (hasValue === hasError) {
    failures.push(`${label}: expected exactly one value or error`);
    continue;
  }
  const actual = evaluate(input, validators);
  if (hasError) coveredRefusals.add(vector.expectedError as string);
  if (hasError && actual.error !== vector.expectedError) {
    failures.push(`${label}: expected ${vector.expectedError}, got ${actual.error ?? "success"}`);
  }
  if (hasValue && (!actual.value || jcs(actual.value) !== jcs(vector.expected))) {
    failures.push(`${label}: output mismatch`);
  }
}
for (const id of required) failures.push(`missing required vector ${id}`);

const securityDocument: unknown = await Bun.file(securityVectorPath).json();
if (
  !isRecord(securityDocument) ||
  securityDocument.schemaVersion !== "libre-ai.boussole-security-vectors.v1" ||
  securityDocument.status !== "candidate-security-remediation"
) {
  failures.push("invalid Boussole security vector envelope");
}
const baseInput = inputs.get("excluded-abstentions-positive-agreement");
if (!baseInput) throw new Error("missing Boussole security base input");
const encoder = new TextEncoder();
const baseDatasetBytes = encoder.encode(JSON.stringify(baseInput.dataset));
const baseMethodBytes = encoder.encode(JSON.stringify(baseInput.method));
const baseResponseBytes = encoder.encode(JSON.stringify(baseInput.responses));
const rawCases =
  isRecord(securityDocument) && Array.isArray(securityDocument.rawDecoderCases)
    ? securityDocument.rawDecoderCases
    : [];
const rawDefects = {
  "utf8-bom": "bom",
  "invalid-utf8": "invalid-utf8",
  "duplicate-member": "duplicate-member",
  "unpaired-surrogate": "unpaired-surrogate",
  "invalid-number": "invalid-number",
  "malformed-json": "invalid-json",
  "unknown-field": "schema-invalid",
  "maximum-depth-exceeded": "max-depth",
} as const;
requireExactCaseIds(rawCases, Object.keys(rawDefects), "raw decoder vectors");
for (const [index, rawCase] of rawCases.entries()) {
  const label = `${securityVectorPath}#/rawDecoderCases/${index}`;
  if (!isRecord(rawCase) || typeof rawCase.id !== "string" || rawCase.target !== "dataset") {
    failures.push(`${label}: invalid raw case`);
    continue;
  }
  const expectedDefect = rawDefects[rawCase.id as keyof typeof rawDefects];
  if (rawCase.defect !== expectedDefect || rawCase.expectedError !== "input-invalid")
    failures.push(`${label}: raw refusal metadata mismatch`);
  let bytes: Uint8Array;
  try {
    bytes = decodeHex(rawCase.inputHex, label);
  } catch (error) {
    failures.push(String(error));
    continue;
  }
  if (sha256Hex(bytes) !== rawCase.inputSha256) failures.push(`${label}: SHA-256 mismatch`);
  const defect = rawCase.defect;
  try {
    parseStrictJson(bytes, 64);
    if (defect !== "schema-invalid") failures.push(`${label}: strict decoder accepted ${defect}`);
  } catch (error) {
    if (!(error instanceof StrictJsonError) || error.defect !== defect)
      failures.push(`${label}: expected ${String(defect)}, got ${String(error)}`);
  }
  const actual = evaluateRaw(
    bytes,
    baseMethodBytes,
    baseResponseBytes,
    baseInput.computedAt,
    validators,
  );
  if (actual.error !== rawCase.expectedError)
    failures.push(
      `${label}: expected ${String(rawCase.expectedError)}, got ${actual.error ?? "success"}`,
    );
  if (typeof rawCase.expectedError === "string") coveredRefusals.add(rawCase.expectedError);
}

const resourceCases =
  isRecord(securityDocument) && Array.isArray(securityDocument.resourceCases)
    ? securityDocument.resourceCases
    : [];
const expectedResourceCases = {
  "dataset-at-limit": ["dataset-input", 8 * 1024 * 1024, "within-limit"],
  "dataset-over-limit": ["dataset-input", 8 * 1024 * 1024 + 1, "resource-limit-exceeded"],
  "method-at-limit": ["method-input", 64 * 1024, "within-limit"],
  "method-over-limit": ["method-input", 64 * 1024 + 1, "resource-limit-exceeded"],
  "responses-at-limit": ["responses-input", 256 * 1024, "within-limit"],
  "responses-over-limit": ["responses-input", 256 * 1024 + 1, "resource-limit-exceeded"],
  "output-at-limit": ["successful-output", 512 * 1024, "within-limit"],
  "output-over-limit": ["successful-output", 512 * 1024 + 1, "resource-limit-exceeded"],
} as const;
requireExactCaseIds(resourceCases, Object.keys(expectedResourceCases), "resource vectors");
for (const [index, resourceCase] of resourceCases.entries()) {
  const label = `${securityVectorPath}#/resourceCases/${index}`;
  if (
    !isRecord(resourceCase) ||
    typeof resourceCase.target !== "string" ||
    !(resourceCase.target in byteLimits) ||
    !Number.isSafeInteger(resourceCase.byteLength) ||
    Number(resourceCase.byteLength) < 0
  ) {
    failures.push(`${label}: invalid resource case`);
    continue;
  }
  const target = resourceCase.target as keyof typeof byteLimits;
  const expectedResource =
    expectedResourceCases[resourceCase.id as keyof typeof expectedResourceCases];
  const declaredOutcome = resourceCase.expectedError ?? resourceCase.expectedPreflight;
  if (
    !expectedResource ||
    target !== expectedResource[0] ||
    resourceCase.byteLength !== expectedResource[1] ||
    declaredOutcome !== expectedResource[2]
  ) {
    failures.push(`${label}: resource boundary metadata mismatch`);
  }
  const generated = new Uint8Array(Number(resourceCase.byteLength));
  const actual = preflightLength(target, generated.byteLength);
  const expected = resourceCase.expectedError;
  if (expected === undefined && resourceCase.expectedPreflight !== "within-limit")
    failures.push(`${label}: missing within-limit expectation`);
  if (expected === undefined ? actual !== undefined : actual !== expected)
    failures.push(
      `${label}: expected ${String(expected ?? "within-limit")}, got ${String(actual)}`,
    );
  if (expected === "resource-limit-exceeded" && target !== "successful-output") {
    const boundaryResult =
      target === "dataset-input"
        ? evaluateRaw(
            generated,
            baseMethodBytes,
            baseResponseBytes,
            baseInput.computedAt,
            validators,
          )
        : target === "method-input"
          ? evaluateRaw(
              baseDatasetBytes,
              generated,
              baseResponseBytes,
              baseInput.computedAt,
              validators,
            )
          : evaluateRaw(
              baseDatasetBytes,
              baseMethodBytes,
              generated,
              baseInput.computedAt,
              validators,
            );
    if (boundaryResult.error !== expected)
      failures.push(`${label}: raw boundary did not fail before decoding`);
  }
  if (typeof expected === "string") coveredRefusals.add(expected);
}

const semanticCases =
  isRecord(securityDocument) && Array.isArray(securityDocument.semanticRefusalCases)
    ? securityDocument.semanticRefusalCases
    : [];
const expectedSemanticCases = {
  "digest-mismatch": ["responses-dataset-digest-zero", "digest-mismatch"],
  "method-unsupported": ["asymmetric-response-scale", "method-unsupported"],
  "computed-at-invalid": ["invalid-gregorian-day", "computed-at-invalid"],
  "duplicate-statement-id": ["duplicate-statement-id-with-valid-digests", "response-invalid"],
  "duplicate-response-id": ["duplicate-response-id", "response-invalid"],
  "dataset-id-mismatch": ["responses-dataset-id-mismatch", "digest-mismatch"],
  "aggregation-threshold": ["statement-below-publication-threshold", "input-invalid"],
  "publication-review-expired": ["publication-review-expired", "approval-invalid"],
  "person-targeting-declaration": ["person-targeting-declared", "input-invalid"],
  "wording-change-requires-privacy-reapproval": [
    "person-target-wording-with-stale-approval",
    "approval-invalid",
  ],
  "redacted-approval": ["duplicate-private-reviewer-canary", "approval-invalid"],
} as const;
requireExactCaseIds(semanticCases, Object.keys(expectedSemanticCases), "semantic refusal vectors");
for (const [index, semanticCase] of semanticCases.entries()) {
  const label = `${securityVectorPath}#/semanticRefusalCases/${index}`;
  if (!isRecord(semanticCase) || typeof semanticCase.mutation !== "string") {
    failures.push(`${label}: invalid semantic refusal case`);
    continue;
  }
  const expectedSemantic =
    expectedSemanticCases[semanticCase.id as keyof typeof expectedSemanticCases];
  if (
    !expectedSemantic ||
    semanticCase.mutation !== expectedSemantic[0] ||
    semanticCase.expectedError !== expectedSemantic[1]
  ) {
    failures.push(`${label}: semantic refusal metadata mismatch`);
  }
  if (
    semanticCase.id === "redacted-approval" &&
    (!Array.isArray(semanticCase.forbiddenDiagnosticValues) ||
      !semanticCase.forbiddenDiagnosticValues.includes("rev_3333333333333333") ||
      !semanticCase.forbiddenDiagnosticValues.includes("private_response_canary"))
  ) {
    failures.push(`${label}: redaction canaries missing`);
  }
  const input = structuredClone(baseInput);
  switch (semanticCase.mutation) {
    case "responses-dataset-digest-zero":
      input.responses.datasetDigest = "0".repeat(64);
      break;
    case "asymmetric-response-scale":
      input.method.responseScale = [0, 1];
      break;
    case "invalid-gregorian-day":
      input.computedAt = "2025-02-30T12:00:00Z";
      break;
    case "duplicate-statement-id-with-valid-digests": {
      const original = (input.dataset.statements as RecordValue[])[0];
      if (!original) {
        failures.push(`${label}: missing statement mutation base`);
        continue;
      }
      const statement = structuredClone(original);
      statement.wording = "Distinct wording with duplicate statement id";
      (input.dataset.statements as RecordValue[]).push(statement);
      const datasetDigest = canonicalDatasetDigest(input.dataset);
      input.dataset.digest = datasetDigest;
      for (const approval of input.dataset.approvals as RecordValue[])
        approval.subjectDigest = datasetDigest;
      input.responses.datasetDigest = datasetDigest;
      break;
    }
    case "duplicate-response-id":
      (input.responses.responses as RecordValue[]).push({
        statementId: "statement_1",
        kind: "skip",
      });
      break;
    case "responses-dataset-id-mismatch":
      input.responses.datasetId = "urn:libre-ai:dataset:other";
      break;
    case "statement-below-publication-threshold": {
      const publicationPolicy = input.dataset.publicationPolicy;
      if (!isRecord(publicationPolicy)) {
        failures.push(`${label}: missing publication policy mutation base`);
        continue;
      }
      publicationPolicy.minimumGroupSize = 19;
      const datasetDigest = canonicalDatasetDigest(input.dataset);
      input.dataset.digest = datasetDigest;
      for (const approval of input.dataset.approvals as RecordValue[])
        approval.subjectDigest = datasetDigest;
      input.responses.datasetDigest = datasetDigest;
      break;
    }
    case "publication-review-expired":
      input.computedAt = "2027-07-16T00:00:01Z";
      break;
    case "person-targeting-declared": {
      const statement = (input.dataset.statements as RecordValue[])[0];
      if (!statement) {
        failures.push(`${label}: missing person-targeting mutation base`);
        continue;
      }
      statement.personTargeting = "allowed";
      break;
    }
    case "person-target-wording-with-stale-approval": {
      const statement = (input.dataset.statements as RecordValue[])[0];
      if (!statement) {
        failures.push(`${label}: missing wording mutation base`);
        continue;
      }
      statement.wording = "named_person_target_canary";
      const datasetDigest = canonicalDatasetDigest(input.dataset);
      input.dataset.digest = datasetDigest;
      input.responses.datasetDigest = datasetDigest;
      break;
    }
    case "duplicate-private-reviewer-canary": {
      const approvals = input.method.approvals as RecordValue[];
      const first = approvals[0];
      const second = approvals[1];
      if (!first || !second) {
        failures.push(`${label}: missing approval mutation base`);
        continue;
      }
      first.reviewerId = "rev_3333333333333333";
      second.reviewerId = "rev_3333333333333333";
      input.dataset.scope = "private_response_canary";
      const datasetDigest = canonicalDatasetDigest(input.dataset);
      input.dataset.digest = datasetDigest;
      for (const approval of input.dataset.approvals as RecordValue[])
        approval.subjectDigest = datasetDigest;
      input.responses.datasetDigest = datasetDigest;
      break;
    }
    default:
      failures.push(`${label}: unknown mutation ${semanticCase.mutation}`);
      continue;
  }
  const actual = evaluate(input, validators);
  if (actual.error !== semanticCase.expectedError)
    failures.push(
      `${label}: expected ${String(semanticCase.expectedError)}, got ${actual.error ?? "success"}`,
    );
  if (typeof semanticCase.expectedError === "string")
    coveredRefusals.add(semanticCase.expectedError);
  const diagnostic = JSON.stringify(actual);
  if (
    Array.isArray(semanticCase.forbiddenDiagnosticValues) &&
    semanticCase.forbiddenDiagnosticValues.some(
      (value) => typeof value === "string" && diagnostic.includes(value),
    )
  ) {
    failures.push(`${label}: private canary leaked in refusal`);
  }
}

const arithmetic = isRecord(securityDocument) ? securityDocument.maximumArithmetic : undefined;
if (!isRecord(arithmetic) || !isRecord(arithmetic.expected)) {
  failures.push("security vectors: missing maximum arithmetic");
} else {
  if (
    arithmetic.maxVotePerCounter !== 4_294_967_295 ||
    arithmetic.maxStatements !== 1000 ||
    arithmetic.maxScale !== 5 ||
    arithmetic.decimalScale !== 1_000_000
  ) {
    failures.push("security vectors: arithmetic domain is not at schema maxima");
  }
  const vote = BigInt(String(arithmetic.maxVotePerCounter));
  const statements = BigInt(String(arithmetic.maxStatements));
  const scale = BigInt(String(arithmetic.maxScale));
  const decimalScale = BigInt(String(arithmetic.decimalScale));
  const expected = arithmetic.expected;
  const values = {
    totalConsidered: 3n * vote * statements,
    totalOmitted: 4n * vote * statements,
    weightedNumerator: scale * vote * statements,
    scoreDenominator: scale * 3n * vote * statements,
    scaledWeightedNumerator: scale * vote * statements * decimalScale,
  };
  for (const [name, value] of Object.entries(values)) {
    if (value.toString() !== expected[name])
      failures.push(`security vectors: ${name} maximum mismatch`);
  }
  if (
    values.scaledWeightedNumerator > 18_446_744_073_709_551_615n !== expected.exceedsUnsigned64 ||
    values.scaledWeightedNumerator <= 170_141_183_460_469_231_731_687_303_715_884_105_727n !==
      expected.fitsSigned128
  ) {
    failures.push("security vectors: wide arithmetic classification mismatch");
  }

  const executable = arithmetic.executableCase;
  if (
    !isRecord(executable) ||
    executable.id !== "maximum-positive-wide-intermediate" ||
    executable.statementCount !== 1000 ||
    executable.votesFor !== 4_294_967_295 ||
    executable.votesAgainst !== 0 ||
    executable.abstentions !== 0 ||
    executable.absent !== 4_294_967_295 ||
    executable.answer !== 5 ||
    executable.expectedScore !== 1 ||
    executable.expectedDenominator !== "4294967295000" ||
    executable.expectedOmitted !== "4294967295000" ||
    executable.expectedContributions !== 1000
  ) {
    failures.push("security vectors: invalid executable maximum arithmetic case");
  } else {
    const maximumInput = structuredClone(baseInput);
    maximumInput.method.responseScale = [-5, 0, 5];
    const methodDigest = canonicalMethodDigest(maximumInput.method);
    maximumInput.method.digest = methodDigest;
    for (const approval of maximumInput.method.approvals as RecordValue[])
      approval.subjectDigest = methodDigest;
    maximumInput.dataset.methodDigest = methodDigest;
    maximumInput.responses.methodDigest = methodDigest;

    const template = (maximumInput.dataset.statements as RecordValue[])[0];
    if (!template) {
      failures.push("security vectors: missing maximum statement template");
    } else {
      const statements = Array.from({ length: executable.statementCount }, (_, index) => ({
        ...structuredClone(template),
        id: `statement_${index.toString().padStart(4, "0")}`,
        wording: `Maximum arithmetic statement ${index}`,
        votesFor: executable.votesFor,
        votesAgainst: executable.votesAgainst,
        abstentions: executable.abstentions,
        absent: executable.absent,
      }));
      maximumInput.dataset.statements = statements;
      const datasetDigest = canonicalDatasetDigest(maximumInput.dataset);
      maximumInput.dataset.digest = datasetDigest;
      for (const approval of maximumInput.dataset.approvals as RecordValue[])
        approval.subjectDigest = datasetDigest;
      maximumInput.responses.datasetDigest = datasetDigest;
      maximumInput.responses.responses = statements.map((statement) => ({
        statementId: statement.id,
        kind: "answer",
        value: executable.answer,
      }));

      const maximumResult = evaluateRaw(
        encoder.encode(JSON.stringify(maximumInput.dataset)),
        encoder.encode(JSON.stringify(maximumInput.method)),
        encoder.encode(JSON.stringify(maximumInput.responses)),
        maximumInput.computedAt,
        validators,
      );
      const contributions = maximumResult.value?.contributions;
      if (
        !maximumResult.value ||
        maximumResult.value.score !== executable.expectedScore ||
        String(maximumResult.value.denominator) !== executable.expectedDenominator ||
        String(maximumResult.value.omitted) !== executable.expectedOmitted ||
        !Array.isArray(contributions) ||
        contributions.length !== executable.expectedContributions
      ) {
        failures.push("security vectors: executable maximum arithmetic mismatch");
      }
    }
  }
}

const allRefusals = new Set([
  "input-invalid",
  "digest-mismatch",
  "approval-invalid",
  "method-unsupported",
  "response-invalid",
  "denominator-zero",
  "computed-at-invalid",
  "resource-limit-exceeded",
]);
if (
  coveredRefusals.size !== allRefusals.size ||
  [...allRefusals].some((refusal) => !coveredRefusals.has(refusal))
) {
  failures.push("Boussole security vectors do not cover every closed refusal");
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(
  `Boussole vectors verified: ${cases.length} methodology cases, ${rawCases.length} raw refusals, ${resourceCases.length} resource boundaries, ${semanticCases.length} semantic refusals, 1 generated maximum-arithmetic case; public scoring still candidate-only`,
);
