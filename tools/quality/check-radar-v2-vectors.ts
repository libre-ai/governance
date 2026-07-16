import { normalize } from "node:path";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

type JsonRecord = Record<string, unknown>;
type Bytes = Uint8Array<ArrayBufferLike>;

const failures: string[] = [];
const fixtureRoot = "contracts/fixtures/radar-engine-v2/";
const vectorPath = `${fixtureRoot}golden-vectors.v1.json`;
const securityVectorPath = `${fixtureRoot}security-vectors.v1.json`;
const maxEvaluationItemBytes = 262_144;
const maxEvaluationRulesBytes = 524_288;
const refusalCodes = new Set([
  "invalid-limits",
  "invalid-source",
  "body-too-large",
  "output-too-large",
  "media-type-unsupported",
  "encoding-unsupported",
  "feed-malformed",
  "feed-kind-unsupported",
  "xml-dtd-forbidden",
  "xml-entity-forbidden",
  "max-depth-exceeded",
  "max-items-exceeded",
  "json-invalid",
  "json-not-canonical",
  "item-invalid",
  "rule-invalid",
]);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: JsonRecord, field: string, label: string): string | undefined {
  const value = record[field];
  if (typeof value !== "string" || value.length === 0) {
    failures.push(`${label}: missing ${field}`);
    return undefined;
  }
  return value;
}

function safePath(path: string, requiredRoot: string, label: string): boolean {
  if (normalize(path) !== path || path.includes("..") || !path.startsWith(requiredRoot)) {
    failures.push(`${label}: unsafe path ${path}`);
    return false;
  }
  return true;
}

function isCanonicalBaseUrl(value: unknown): boolean {
  if (
    typeof value !== "string" ||
    Buffer.byteLength(value, "utf8") > 2_048 ||
    [...value].some((character) => character.charCodeAt(0) > 0x7f)
  ) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.username === "" &&
      parsed.password === "" &&
      parsed.hash === "" &&
      parsed.href === value
    );
  } catch {
    return false;
  }
}

async function bytes(path: string): Promise<Bytes> {
  return new Uint8Array(await Bun.file(path).arrayBuffer());
}

function sha256(value: Bytes): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(value);
  return hasher.digest("hex");
}

async function verifyHash(path: string, expected: unknown, label: string): Promise<Bytes> {
  if (typeof expected !== "string" || !/^[a-f0-9]{64}$/.test(expected)) {
    failures.push(`${label}: invalid expected SHA-256`);
    return new Uint8Array();
  }
  if (!(await Bun.file(path).exists())) {
    failures.push(`${label}: missing file ${path}`);
    return new Uint8Array();
  }
  const value = await bytes(path);
  const actual = sha256(value);
  if (actual !== expected) failures.push(`${label}: SHA-256 mismatch for ${path}`);
  return value;
}

function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non-finite JSON number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  throw new Error("unsupported JSON value");
}

function decodeJson(value: Uint8Array, label: string): unknown {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(value));
  } catch (error) {
    failures.push(`${label}: invalid UTF-8 JSON: ${String(error)}`);
    return undefined;
  }
}

function utf8Compare(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function hasInvalidUtf8(value: Uint8Array): boolean {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(value);
    return false;
  } catch {
    return true;
  }
}

function requireExactIds(
  cases: JsonRecord[],
  expected: unknown,
  label: string,
  exact = false,
): void {
  if (!Array.isArray(expected) || expected.some((id) => typeof id !== "string")) {
    failures.push(`${label}: invalid required case ids`);
    return;
  }
  const expectedIds = new Set(expected as string[]);
  const actual = new Set(
    cases.map((value) => value.id).filter((id): id is string => typeof id === "string"),
  );
  if (
    expectedIds.size !== expected.length ||
    (exact && actual.size !== expectedIds.size) ||
    [...expectedIds].some((id) => !actual.has(id))
  ) {
    failures.push(`${label}: required case inventory mismatch`);
  }
}

function identityDigest(item: JsonRecord): string | undefined {
  if (typeof item.sourceId !== "string") return undefined;
  let kind: "external-id" | "url" | "content";
  let value: unknown;
  if (typeof item.externalId === "string") {
    kind = "external-id";
    value = item.externalId;
  } else if (typeof item.url === "string") {
    kind = "url";
    value = item.url;
  } else {
    kind = "content";
    value = {
      authors: item.authors,
      publishedAt: item.publishedAt,
      summary: item.summary,
      tags: item.tags,
      title: item.title,
      updatedAt: item.updatedAt,
    };
  }
  return sha256(
    Buffer.concat([
      Buffer.from("libre-ai.radar-item.v1\0", "utf8"),
      Buffer.from(canonicalJson({ kind, sourceId: item.sourceId, value }), "utf8"),
    ]),
  );
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const schemas = new Map<string, JsonRecord>();
for await (const name of new Bun.Glob("*.schema.json").scan({
  cwd: "contracts/schemas",
  onlyFiles: true,
})) {
  const schema = (await Bun.file(`contracts/schemas/${name}`).json()) as JsonRecord;
  schemas.set(name, schema);
  ajv.addSchema(schema);
}
const validators = new Map<string, ValidateFunction>();
for (const [name, schema] of schemas) {
  const validator = ajv.getSchema(schema.$id as string);
  if (validator) validators.set(name, validator);
  else failures.push(`${name}: schema did not compile for Radar vectors`);
}

let document: unknown;
try {
  document = await Bun.file(vectorPath).json();
} catch (error) {
  failures.push(`${vectorPath}: invalid JSON: ${String(error)}`);
}
const vectorDocument = isRecord(document) ? document : {};
if (vectorDocument.schemaVersion !== "libre-ai.radar-engine-golden-vectors.v2") {
  failures.push(`${vectorPath}: invalid envelope`);
}

let securityDocument: unknown;
try {
  securityDocument = await Bun.file(securityVectorPath).json();
} catch (error) {
  failures.push(`${securityVectorPath}: invalid JSON: ${String(error)}`);
}
const securityVectors = isRecord(securityDocument) ? securityDocument : {};
if (
  securityVectors.schemaVersion !== "libre-ai.radar-engine-security-vectors.v1" ||
  securityVectors.status !== "candidate-security-remediation"
) {
  failures.push(`${securityVectorPath}: invalid envelope`);
}

const referencedFixtures = new Set<string>();
const observedRefusals = new Set<string>();
const caseIds = new Set<string>();

const contractFiles = Array.isArray(vectorDocument.contractFiles)
  ? vectorDocument.contractFiles
  : [];
if (contractFiles.length === 0) failures.push(`${vectorPath}: no contract files`);
for (const [index, rawFile] of contractFiles.entries()) {
  const label = `${vectorPath}#/contractFiles/${index}`;
  if (!isRecord(rawFile)) {
    failures.push(`${label}: expected object`);
    continue;
  }
  const path = stringField(rawFile, "path", label);
  if (path && safePath(path, "contracts/", label)) await verifyHash(path, rawFile.sha256, label);
}

function registerCase(rawCase: unknown, label: string): JsonRecord | undefined {
  if (!isRecord(rawCase)) {
    failures.push(`${label}: expected object`);
    return undefined;
  }
  const id = stringField(rawCase, "id", label);
  if (id) {
    if (!/^[a-z0-9][a-z0-9.-]+$/.test(id)) failures.push(`${label}: invalid case id ${id}`);
    if (caseIds.has(id)) failures.push(`${label}: duplicate case id ${id}`);
    caseIds.add(id);
  }
  return rawCase;
}

function verifyRefusal(expectation: JsonRecord, label: string): void {
  if (JSON.stringify(Object.keys(expectation).sort()) !== JSON.stringify(["code", "kind"])) {
    failures.push(`${label}: refusal must contain only kind and code`);
  }
  const code = stringField(expectation, "code", label);
  if (!code || !refusalCodes.has(code))
    failures.push(`${label}: unknown refusal code ${code ?? ""}`);
  else observedRefusals.add(code);
  if (/ten_[a-z0-9]{16,64}/.test(JSON.stringify(expectation))) {
    failures.push(`${label}: tenant data in refusal`);
  }
}

async function verifySuccess(
  expectation: JsonRecord,
  label: string,
): Promise<{ output?: JsonRecord; outputBytes: Bytes }> {
  const path = stringField(expectation, "output", label);
  const schemaName = stringField(expectation, "outputSchema", label);
  if (!path || !safePath(path, `${fixtureRoot}golden/`, label)) {
    return { outputBytes: new Uint8Array() };
  }
  referencedFixtures.add(path);
  const outputBytes = await verifyHash(path, expectation.sha256, label);
  const output = decodeJson(outputBytes, label);
  if (output !== undefined) {
    const canonical = Buffer.from(canonicalJson(output), "utf8");
    if (!Buffer.from(outputBytes).equals(canonical))
      failures.push(`${label}: output is not RFC 8785 JCS`);
  }
  const validator = schemaName ? validators.get(schemaName) : undefined;
  if (!validator) failures.push(`${label}: unknown output schema ${schemaName ?? ""}`);
  else if (!validator(output)) failures.push(`${label}: output does not satisfy ${schemaName}`);
  return { output: isRecord(output) ? output : undefined, outputBytes };
}

const parseCases = Array.isArray(vectorDocument.parseCases) ? vectorDocument.parseCases : [];
if (parseCases.length === 0) failures.push(`${vectorPath}: no parse cases`);
for (const [index, rawCase] of parseCases.entries()) {
  const label = `${vectorPath}#/parseCases/${index}`;
  const parseCase = registerCase(rawCase, label);
  if (!parseCase) continue;
  const input = stringField(parseCase, "input", label);
  let inputBytes: Bytes = new Uint8Array();
  if (input && safePath(input, fixtureRoot, label)) {
    referencedFixtures.add(input);
    inputBytes = await verifyHash(input, parseCase.inputSha256, label);
  }
  if (
    parseCase.id === "utf8-bom-accepted" &&
    !Buffer.from(inputBytes.subarray(0, 3)).equals(Buffer.from([0xef, 0xbb, 0xbf]))
  ) {
    failures.push(`${label}: UTF-8 BOM case has no BOM`);
  }
  if (
    parseCase.id === "utf16-bom-rejected" &&
    !Buffer.from(inputBytes.subarray(0, 2)).equals(Buffer.from([0xff, 0xfe]))
  ) {
    failures.push(`${label}: UTF-16 case has no UTF-16 BOM`);
  }
  if (parseCase.id === "invalid-utf8-rejected" && !hasInvalidUtf8(inputBytes))
    failures.push(`${label}: invalid UTF-8 case is valid UTF-8`);
  if (parseCase.id === "xml-numeric-and-predefined-references") {
    const source = Buffer.from(inputBytes).toString("utf8");
    for (const reference of ["&#x41;", "&amp;", "&lt;", "&gt;", "&quot;", "&apos;"])
      if (!source.includes(reference))
        failures.push(`${label}: missing XML reference ${reference}`);
  }
  if (
    parseCase.id === "xml-invalid-numeric-reference" &&
    !Buffer.from(inputBytes).includes(Buffer.from("&#0;"))
  ) {
    failures.push(`${label}: invalid numeric reference canary missing`);
  }
  if (typeof parseCase.mediaType !== "string") failures.push(`${label}: missing mediaType`);
  if (typeof parseCase.sourceId !== "string") failures.push(`${label}: missing sourceId`);
  if (typeof parseCase.baseUrl !== "string") failures.push(`${label}: missing baseUrl`);
  const limits = parseCase.limits;
  if (
    !isRecord(limits) ||
    JSON.stringify(Object.keys(limits).sort()) !==
      JSON.stringify(["maxDepth", "maxInputBytes", "maxItems", "maxOutputBytes"])
  ) {
    failures.push(`${label}: limits do not match the exact v2 fields`);
  }
  const expectation = parseCase.expect;
  if (!isRecord(expectation)) {
    failures.push(`${label}: missing expectation`);
    continue;
  }
  if (isRecord(limits)) {
    const valuesAreIntegers = [
      limits.maxInputBytes,
      limits.maxOutputBytes,
      limits.maxItems,
      limits.maxDepth,
    ].every((value) => typeof value === "number" && Number.isInteger(value));
    const inRange =
      valuesAreIntegers &&
      (limits.maxInputBytes as number) >= 1 &&
      (limits.maxInputBytes as number) <= 10_485_760 &&
      (limits.maxOutputBytes as number) >= 1 &&
      (limits.maxOutputBytes as number) <= 52_428_800 &&
      (limits.maxItems as number) >= 1 &&
      (limits.maxItems as number) <= 5_000 &&
      (limits.maxDepth as number) >= 1 &&
      (limits.maxDepth as number) <= 64;
    if ((expectation.code === "invalid-limits") === inRange) {
      failures.push(`${label}: invalid-limits expectation disagrees with limit ranges`);
    }
    if (
      expectation.code === "body-too-large" &&
      inputBytes.byteLength <= (limits.maxInputBytes as number)
    ) {
      failures.push(`${label}: body-too-large input does not exceed maxInputBytes`);
    }
    if (
      expectation.kind === "success" &&
      inputBytes.byteLength > (limits.maxInputBytes as number)
    ) {
      failures.push(`${label}: successful input exceeds maxInputBytes`);
    }
    if (
      parseCase.id === "max-input-bytes-equality" &&
      inputBytes.byteLength !== limits.maxInputBytes
    ) {
      failures.push(`${label}: maxInputBytes equality is not exact`);
    }
    if (parseCase.id === "max-depth-equality-in-unknown-json" && limits.maxDepth !== 5)
      failures.push(`${label}: maxDepth equality is not exact`);
    if (parseCase.id === "max-items-equality-before-deduplication" && limits.maxItems !== 2)
      failures.push(`${label}: maxItems equality is not exact`);
  }
  const mediaTypeIsBoundedAscii =
    typeof parseCase.mediaType === "string" &&
    Buffer.byteLength(parseCase.mediaType, "utf8") <= 128 &&
    [...parseCase.mediaType].every((character) => character.charCodeAt(0) <= 0x7f);
  if (
    !mediaTypeIsBoundedAscii &&
    !["invalid-limits", "invalid-source", "body-too-large", "media-type-unsupported"].includes(
      expectation.code as string,
    )
  ) {
    failures.push(`${label}: media-type expectation disagrees with preflight precedence`);
  }
  const sourceIsValid =
    typeof parseCase.sourceId === "string" &&
    Buffer.byteLength(parseCase.sourceId, "utf8") <= 256 &&
    /^urn:libre-ai:[a-z][a-z0-9-]*:[A-Za-z0-9._~-]+$/.test(parseCase.sourceId) &&
    isCanonicalBaseUrl(parseCase.baseUrl);
  if ((expectation.code === "invalid-source") === sourceIsValid) {
    failures.push(`${label}: invalid-source expectation disagrees with source inputs`);
  }
  if (expectation.kind === "refusal") {
    verifyRefusal(expectation, `${label}/expect`);
    continue;
  }
  if (expectation.kind !== "success") {
    failures.push(`${label}: unknown expectation kind`);
    continue;
  }
  const { output, outputBytes } = await verifySuccess(expectation, `${label}/expect`);
  if (isRecord(limits) && outputBytes.byteLength > (limits.maxOutputBytes as number)) {
    failures.push(`${label}: successful output exceeds maxOutputBytes`);
  }
  if (
    parseCase.id === "max-output-bytes-equality" &&
    (!isRecord(limits) || outputBytes.byteLength !== limits.maxOutputBytes)
  ) {
    failures.push(`${label}: maxOutputBytes equality is not exact`);
  }
  if (!output || !Array.isArray(output.items)) continue;
  const outputItems = output.items;
  if (
    parseCase.id === "content-derived-identity" &&
    (!isRecord(outputItems[0]) || outputItems[0].externalId !== null || outputItems[0].url !== null)
  ) {
    failures.push(`${label}: content identity fallback is not exercised`);
  }
  if (
    parseCase.id === "utc-year-rollover-becomes-null" &&
    (outputItems.length !== 2 ||
      outputItems.some((item) => !isRecord(item) || item.publishedAt !== null))
  ) {
    failures.push(`${label}: UTC year rollover did not become null`);
  }
  if (parseCase.id === "max-items-equality-before-deduplication" && outputItems.length !== 2)
    failures.push(`${label}: maxItems equality output count mismatch`);
  if (output.sourceId !== parseCase.sourceId || output.baseUrl !== parseCase.baseUrl)
    failures.push(`${label}: output does not bind sourceId/baseUrl`);
  const keys = new Set<string>();
  for (const [itemIndex, rawItem] of outputItems.entries()) {
    if (!isRecord(rawItem)) continue;
    const digest = identityDigest(rawItem);
    if (rawItem.deduplicationKey !== digest) {
      failures.push(`${label}: item ${itemIndex} has an invalid deduplication key`);
    }
    if (rawItem.id !== `urn:libre-ai:radar-item:${digest}`) {
      failures.push(`${label}: item ${itemIndex} has an invalid normalized id`);
    }
    if (typeof rawItem.deduplicationKey === "string") {
      if (keys.has(rawItem.deduplicationKey)) failures.push(`${label}: duplicate output item`);
      keys.add(rawItem.deduplicationKey);
    }
    const tags = rawItem.tags;
    if (
      Array.isArray(tags) &&
      tags.some(
        (tag, tagIndex) =>
          tagIndex > 0 &&
          typeof tag === "string" &&
          typeof tags[tagIndex - 1] === "string" &&
          utf8Compare(tags[tagIndex - 1] as string, tag) >= 0,
      )
    ) {
      failures.push(`${label}: tags are not unique UTF-8 byte sorted values`);
    }
  }
  for (let itemIndex = 1; itemIndex < outputItems.length; itemIndex += 1) {
    const previous = outputItems[itemIndex - 1];
    const current = outputItems[itemIndex];
    if (!isRecord(previous) || !isRecord(current)) continue;
    const previousDate = typeof previous.publishedAt === "string" ? previous.publishedAt : null;
    const currentDate = typeof current.publishedAt === "string" ? current.publishedAt : null;
    const wrongDateOrder =
      (previousDate === null && currentDate !== null) ||
      (previousDate !== null && currentDate !== null && previousDate < currentDate);
    const wrongIdOrder =
      previousDate === currentDate &&
      typeof previous.id === "string" &&
      typeof current.id === "string" &&
      utf8Compare(previous.id, current.id) > 0;
    if (wrongDateOrder || wrongIdOrder)
      failures.push(`${label}: output items are not canonically sorted`);
  }
}

const evaluationCases = Array.isArray(vectorDocument.evaluationCases)
  ? vectorDocument.evaluationCases
  : [];
if (evaluationCases.length === 0) failures.push(`${vectorPath}: no evaluation cases`);
for (const [index, rawCase] of evaluationCases.entries()) {
  const label = `${vectorPath}#/evaluationCases/${index}`;
  const evaluationCase = registerCase(rawCase, label);
  if (!evaluationCase) continue;
  const itemPath = stringField(evaluationCase, "item", label);
  const rulesPath = stringField(evaluationCase, "rules", label);
  let itemBytes: Bytes = new Uint8Array();
  let rulesBytes: Bytes = new Uint8Array();
  if (itemPath && safePath(itemPath, fixtureRoot, label)) {
    referencedFixtures.add(itemPath);
    itemBytes = await verifyHash(itemPath, evaluationCase.itemSha256, label);
  }
  if (rulesPath && safePath(rulesPath, fixtureRoot, label)) {
    referencedFixtures.add(rulesPath);
    rulesBytes = await verifyHash(rulesPath, evaluationCase.rulesSha256, label);
  }
  if (
    evaluationCase.id === "json-invalid-duplicate-item-key" &&
    (Buffer.from(itemBytes)
      .toString("utf8")
      .match(/"title"\s*:/g)?.length ?? 0) < 2
  ) {
    failures.push(`${label}: duplicate item-key canary missing`);
  }
  if (
    evaluationCase.id === "json-invalid-duplicate-rules-key" &&
    (Buffer.from(rulesBytes)
      .toString("utf8")
      .match(/"version"\s*:/g)?.length ?? 0) < 2
  ) {
    failures.push(`${label}: duplicate rules-key canary missing`);
  }
  if (evaluationCase.id === "json-invalid-utf8-item" && !hasInvalidUtf8(itemBytes))
    failures.push(`${label}: invalid UTF-8 item is valid UTF-8`);
  if (evaluationCase.id === "json-invalid-utf8-rules" && !hasInvalidUtf8(rulesBytes))
    failures.push(`${label}: invalid UTF-8 rules are valid UTF-8`);
  const expectation = evaluationCase.expect;
  if (!isRecord(expectation)) {
    failures.push(`${label}: missing expectation`);
    continue;
  }
  const evaluationInputIsTooLarge =
    itemBytes.byteLength > maxEvaluationItemBytes ||
    rulesBytes.byteLength > maxEvaluationRulesBytes;
  if ((expectation.code === "body-too-large") !== evaluationInputIsTooLarge) {
    failures.push(`${label}: body-too-large expectation disagrees with evaluation byte ceilings`);
  }
  if (expectation.kind === "refusal") {
    verifyRefusal(expectation, `${label}/expect`);
    continue;
  }
  if (expectation.kind !== "success") {
    failures.push(`${label}: unknown expectation kind`);
    continue;
  }
  const { output } = await verifySuccess(expectation, `${label}/expect`);
  if (!output) continue;
  if (output.itemDigest !== sha256(itemBytes)) failures.push(`${label}: item digest mismatch`);
  if (output.ruleSetDigest !== sha256(rulesBytes))
    failures.push(`${label}: rule-set digest mismatch`);
  const rules = decodeJson(rulesBytes, label);
  if (isRecord(rules)) {
    if (output.ruleSetId !== rules.id || output.ruleSetVersion !== rules.version) {
      failures.push(`${label}: evaluation does not bind the rule-set identity`);
    }
    const ruleResults = output.ruleResults;
    if (
      Array.isArray(rules.rules) &&
      Array.isArray(ruleResults) &&
      (rules.rules.length !== ruleResults.length ||
        rules.rules.some(
          (rule, ruleIndex) =>
            isRecord(rule) &&
            isRecord(ruleResults[ruleIndex]) &&
            rule.id !== ruleResults[ruleIndex]?.ruleId,
        ))
    ) {
      failures.push(`${label}: rule result order diverges from rule order`);
    }
    if (evaluationCase.id === "operator-matrix-and-strict-dates") {
      const expectedMatches = [true, true, true, true, true, false, false, true, true];
      if (
        !Array.isArray(ruleResults) ||
        ruleResults.length !== expectedMatches.length ||
        ruleResults.some(
          (result, resultIndex) =>
            !isRecord(result) || result.matched !== expectedMatches[resultIndex],
        )
      ) {
        failures.push(`${label}: operator matrix does not cover exact expected matches`);
      }
    }
  }
}

requireExactIds(
  parseCases.filter(isRecord),
  securityVectors.requiredParseCaseIds,
  `${securityVectorPath}#/requiredParseCaseIds`,
);
requireExactIds(
  evaluationCases.filter(isRecord),
  securityVectors.requiredEvaluationCaseIds,
  `${securityVectorPath}#/requiredEvaluationCaseIds`,
);

const boundarySpecifications = {
  "parse-input-at-limit": ["parse-input-bytes", 10_485_760, "within-limit"],
  "parse-input-over-limit": ["parse-input-bytes", 10_485_761, "body-too-large"],
  "parse-output-at-limit": ["parse-output-bytes", 52_428_800, "within-limit"],
  "parse-output-over-limit": ["parse-output-bytes", 52_428_801, "output-too-large"],
  "evaluation-item-at-limit": ["evaluation-item-bytes", 262_144, "within-limit"],
  "evaluation-item-over-limit": ["evaluation-item-bytes", 262_145, "body-too-large"],
  "evaluation-rules-at-limit": ["evaluation-rules-bytes", 524_288, "within-limit"],
  "evaluation-rules-over-limit": ["evaluation-rules-bytes", 524_289, "body-too-large"],
  "max-items-at-limit": ["candidate-items", 5_000, "within-limit"],
  "max-items-over-limit": ["candidate-items", 5_001, "max-items-exceeded"],
  "max-depth-at-limit": ["syntax-depth", 64, "within-limit"],
  "max-depth-over-limit": ["syntax-depth", 65, "max-depth-exceeded"],
  "media-type-at-limit": ["media-type-bytes", 128, "within-limit"],
  "media-type-over-limit": ["media-type-bytes", 129, "media-type-unsupported"],
  "source-id-at-limit": ["source-id-bytes", 256, "within-limit"],
  "source-id-over-limit": ["source-id-bytes", 257, "invalid-source"],
  "base-url-at-limit": ["base-url-bytes", 2_048, "within-limit"],
  "base-url-over-limit": ["base-url-bytes", 2_049, "invalid-source"],
} as const;
const boundaryCases = Array.isArray(securityVectors.generatedBoundaryCases)
  ? securityVectors.generatedBoundaryCases
  : [];
requireExactIds(
  boundaryCases.filter(isRecord),
  Object.keys(boundarySpecifications),
  `${securityVectorPath}#/generatedBoundaryCases`,
  true,
);
for (const [index, boundaryCase] of boundaryCases.entries()) {
  const label = `${securityVectorPath}#/generatedBoundaryCases/${index}`;
  if (!isRecord(boundaryCase) || typeof boundaryCase.id !== "string") {
    failures.push(`${label}: invalid boundary case`);
    continue;
  }
  const expected = boundarySpecifications[boundaryCase.id as keyof typeof boundarySpecifications];
  if (
    !expected ||
    boundaryCase.target !== expected[0] ||
    boundaryCase.value !== expected[1] ||
    boundaryCase.expectedPreflight !== expected[2]
  ) {
    failures.push(`${label}: boundary metadata mismatch`);
  }
}

const publicRefusalCases = Array.isArray(securityVectors.publicRefusalCases)
  ? securityVectors.publicRefusalCases
  : [];
const expectedPublicMappings = [...refusalCodes]
  .sort()
  .map((code) => ({ componentCode: code, publicCode: `radar.${code.replaceAll("-", "_")}` }));
const actualPublicMappings = publicRefusalCases
  .filter(isRecord)
  .map((value) => ({ componentCode: value.componentCode, publicCode: value.publicCode }))
  .sort((left, right) => String(left.componentCode).localeCompare(String(right.componentCode)));
if (JSON.stringify(actualPublicMappings) !== JSON.stringify(expectedPublicMappings))
  failures.push(`${securityVectorPath}: public refusal mapping is not exact`);
if (securityVectors.publicMessage !== "Request refused")
  failures.push(`${securityVectorPath}: public refusal message is not content-free`);
if (
  !Array.isArray(securityVectors.forbiddenDiagnosticCanaries) ||
  securityVectors.forbiddenDiagnosticCanaries.length < 5 ||
  securityVectors.forbiddenDiagnosticCanaries.some(
    (value) => typeof value !== "string" || value.length === 0,
  )
) {
  failures.push(`${securityVectorPath}: diagnostic canaries are incomplete`);
}

for (const code of refusalCodes) {
  if (!observedRefusals.has(code))
    failures.push(`${vectorPath}: refusal code has no vector: ${code}`);
}

for await (const relativePath of new Bun.Glob("**/*").scan({
  cwd: fixtureRoot,
  onlyFiles: true,
})) {
  const path = `${fixtureRoot}${relativePath}`;
  if (path !== vectorPath && path !== securityVectorPath && !referencedFixtures.has(path)) {
    failures.push(`${path}: fixture is not referenced by golden vectors`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(
  `Radar vectors verified: ${parseCases.length} parse cases, ${evaluationCases.length} evaluation cases, ${boundaryCases.length} generated boundaries, ${refusalCodes.size} refusal codes`,
);
