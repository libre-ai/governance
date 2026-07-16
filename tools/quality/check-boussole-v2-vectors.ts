import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

type RecordValue = Record<string, unknown>;
const failures: string[] = [];
const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
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
function round6(value: number): number {
  const scaled = value * 1_000_000;
  const floor = Math.floor(scaled);
  const fraction = scaled - floor;
  const rounded =
    fraction > 0.5 ? floor + 1 : fraction < 0.5 ? floor : floor % 2 === 0 ? floor : floor + 1;
  const result = rounded / 1_000_000;
  return Object.is(result, -0) ? 0 : result;
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
for await (const name of new Bun.Glob("*.schema.json").scan({
  cwd: "contracts/schemas",
  onlyFiles: true,
})) {
  ajv.addSchema(await Bun.file(`contracts/schemas/${name}`).json());
}
const validate = (name: string, value: unknown): void => {
  const validator = ajv.getSchema(`https://contracts.libre-ai.fr/schemas/${name}`);
  if (!validator?.(value)) failures.push(`${name}: vector rejected`);
};

const path = "contracts/fixtures/boussole-scoring-v2/golden-vectors.v1.json";
const vectors = (await Bun.file(path).json()) as RecordValue;
if (vectors.schemaVersion !== "libre-ai.engine-golden-vectors.v1")
  failures.push("invalid vector version");
const cases = Array.isArray(vectors.cases) ? vectors.cases : [];
if (cases.length < 3 || !isRecord(cases[0])) failures.push("missing boussole vectors");
else {
  const candidate = cases[0];
  const dataset = candidate.dataset as RecordValue;
  const method = candidate.method as RecordValue;
  const responses = candidate.responses as RecordValue;
  const expected = candidate.expected as RecordValue;
  validate("public-vote-dataset.v2.schema.json", dataset);
  validate("boussole-method.v2.schema.json", method);
  validate("boussole-response-set.v2.schema.json", responses);
  validate("local-comparison.v2.schema.json", expected);

  const methodDigest = digest(
    "libre-ai.boussole-method.v2",
    without(method, "approvedAt", "digest", "approvals"),
  );
  const datasetCore = without(dataset, "publishedAt", "digest", "approvals");
  (datasetCore.statements as RecordValue[]).sort((a, b) =>
    Buffer.compare(Buffer.from(String(a.id), "utf8"), Buffer.from(String(b.id), "utf8")),
  );
  const datasetDigest = digest("libre-ai.public-vote-dataset.v2", datasetCore);
  const responseCore = structuredClone(responses);
  (responseCore.responses as RecordValue[]).sort((a, b) =>
    Buffer.compare(
      Buffer.from(String(a.statementId), "utf8"),
      Buffer.from(String(b.statementId), "utf8"),
    ),
  );
  const responseDigest = digest("libre-ai.boussole-response-set.v2", responseCore);
  if (method.digest !== methodDigest || dataset.methodDigest !== methodDigest)
    failures.push("method digest mismatch");
  if (dataset.digest !== datasetDigest || responses.datasetDigest !== datasetDigest)
    failures.push("dataset digest mismatch");
  if (expected.responseSetDigest !== responseDigest) failures.push("response digest mismatch");

  const methodReviewers = (method.approvals as RecordValue[]).map(
    (approval) => approval.reviewerId,
  );
  const datasetReviewers = (dataset.approvals as RecordValue[]).map(
    (approval) => approval.reviewerId,
  );
  if (new Set(methodReviewers).size !== 2 || new Set(datasetReviewers).size !== 2)
    failures.push("reviewers are not independent");

  const statement = (dataset.statements as RecordValue[])[0];
  const response = (responses.responses as RecordValue[])[0];
  if (!statement || !response) failures.push("missing reference statement");
  else {
    const considered = Number(statement.votesFor) + Number(statement.votesAgainst);
    const omitted = Number(statement.abstentions) + Number(statement.absent);
    const contribution = round6(
      (Number(response.value) / 1) *
        ((Number(statement.votesFor) - Number(statement.votesAgainst)) / considered),
    );
    if (
      expected.score !== contribution ||
      expected.denominator !== considered ||
      expected.omitted !== omitted
    )
      failures.push("normalized-agreement-v2 result mismatch");
  }
}
const errors = new Set(
  cases
    .filter(isRecord)
    .map((entry) => entry.expectedError)
    .filter(Boolean),
);
for (const required of ["approval-invalid", "denominator-zero"]) {
  if (!errors.has(required)) failures.push(`missing ${required} vector`);
}
if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(
  `Boussole vectors verified: ${cases.length} cases, public scoring still candidate-only`,
);
