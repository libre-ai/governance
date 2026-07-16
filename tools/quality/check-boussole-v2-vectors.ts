import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

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

function digest(label: string, value: unknown): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(label);
  hasher.update(new Uint8Array([0]));
  hasher.update(jcs(value));
  return hasher.digest("hex");
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

function approvalIsValid(value: RecordValue, subjectDigest: string): boolean {
  const approvals = value.approvals;
  if (!Array.isArray(approvals) || approvals.length !== 2 || !approvals.every(isRecord))
    return false;
  const roles = new Set(approvals.map((approval) => approval.role));
  const reviewers = new Set(approvals.map((approval) => approval.reviewerId));
  return (
    roles.size === 2 &&
    roles.has("methodological-review") &&
    roles.has("legal-privacy-review") &&
    reviewers.size === 2 &&
    approvals.every(
      (approval) => approval.actorKind === "human" && approval.subjectDigest === subjectDigest,
    )
  );
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
  if (
    !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$/.test(
      input.computedAt,
    )
  ) {
    return { error: "computed-at-invalid" };
  }

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

const document: unknown = await Bun.file(vectorPath).json();
if (!isRecord(document) || document.schemaVersion !== "libre-ai.engine-golden-vectors.v1") {
  failures.push("invalid vector envelope");
}
const cases =
  isRecord(document) && Array.isArray(document.cases) ? (document.cases as VectorCase[]) : [];
if (cases.length < 10 || cases.length > 32) failures.push("expected 10..32 bounded Boussole cases");
const inputs = new Map<string, ComparisonInput>();
const ids = new Set<string>();
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
  if (hasError && actual.error !== vector.expectedError) {
    failures.push(`${label}: expected ${vector.expectedError}, got ${actual.error ?? "success"}`);
  }
  if (hasValue && (!actual.value || jcs(actual.value) !== jcs(vector.expected))) {
    failures.push(`${label}: output mismatch`);
  }
}
for (const id of required) failures.push(`missing required vector ${id}`);

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(
  `Boussole vectors verified: ${cases.length} executable cases, public scoring still candidate-only`,
);
