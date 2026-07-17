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
function hex(value: Uint8Array): string {
  return Buffer.from(value).toString("hex");
}
function digestBytes(value: Uint8Array): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(value);
  return hasher.digest("hex");
}
function canonicalBase64(value: unknown): Uint8Array | undefined {
  if (typeof value !== "string") return undefined;
  const decoded = Buffer.from(value, "base64");
  if (decoded.toString("base64") !== value) return undefined;
  return decoded;
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
for await (const name of new Bun.Glob("*.schema.json").scan({
  cwd: "contracts/schemas",
  onlyFiles: true,
})) {
  ajv.addSchema(await Bun.file(`contracts/schemas/${name}`).json());
}
const vectors = (await Bun.file(
  "contracts/fixtures/notebook-core-v2/golden-vectors.v1.json",
).json()) as RecordValue;
if (vectors.schemaVersion !== "libre-ai.notebook-core-golden.v2")
  failures.push("invalid vector version");
const golden = vectors.golden;
if (!isRecord(golden) || !isRecord(golden.request) || !isRecord(golden.envelope)) {
  failures.push("missing notebook golden values");
} else {
  const requestValidator = ajv.getSchema(
    "https://contracts.libre-ai.fr/schemas/notebook-backup-seal-request.v2.schema.json",
  );
  const envelopeValidator = ajv.getSchema(
    "https://contracts.libre-ai.fr/schemas/notebook-backup.v2.schema.json",
  );
  if (!requestValidator?.(golden.request)) failures.push("seal request rejected by schema");
  if (!envelopeValidator?.(golden.envelope)) failures.push("envelope rejected by schema");
  if (!/^urn:libre-ai:backup:[a-f0-9]{32}$/.test(String(golden.envelope.id)))
    failures.push("backup id is not an opaque 128-bit value");
  if ("createdAt" in golden.request || "createdAt" in golden.envelope)
    failures.push("clear createdAt is forbidden in backup artifacts");

  const salt = canonicalBase64((golden.request.kdf as RecordValue).salt);
  const nonce = canonicalBase64(golden.request.nonce);
  const plaintext = canonicalBase64(golden.request.plaintext);
  const ciphertext = canonicalBase64(golden.envelope.ciphertext);
  if (salt?.length !== 16 || nonce?.length !== 12) failures.push("salt/nonce length mismatch");
  if (!plaintext || !ciphertext || ciphertext.length !== plaintext.length + 16)
    failures.push("ciphertext/tag length mismatch");

  const metadata = {
    schemaVersion: golden.envelope.schemaVersion,
    id: golden.envelope.id,
    cipher: golden.envelope.cipher,
    kdf: golden.envelope.kdf,
    nonce: golden.envelope.nonce,
  };
  const aad = Buffer.concat([
    Buffer.from("libre-ai.notebook-backup.v2/aad", "utf8"),
    Buffer.from([0]),
    Buffer.from(jcs(metadata), "utf8"),
  ]);
  const expectedAad = golden.aad as RecordValue;
  if (
    !isRecord(expectedAad) ||
    expectedAad.canonicalMetadataJsonUtf8 !== jcs(metadata) ||
    expectedAad.bytesHex !== hex(aad)
  )
    failures.push("AAD vector mismatch");

  const unsigned = structuredClone(golden.envelope);
  delete unsigned.digest;
  const digestPreimage = Buffer.concat([
    Buffer.from("libre-ai.notebook-backup.v2/digest", "utf8"),
    Buffer.from([0]),
    Buffer.from(jcs(unsigned), "utf8"),
  ]);
  const expectedDigest = digestBytes(digestPreimage);
  if (golden.envelope.digest !== expectedDigest) failures.push("envelope digest mismatch");
  if (golden.canonicalEnvelopeUtf8 !== jcs(golden.envelope))
    failures.push("canonical envelope mismatch");

  const secret = golden.recoverySecret as RecordValue;
  if (
    !isRecord(secret) ||
    secret.sensitive !== false ||
    typeof secret.hex !== "string" ||
    !/^[a-f0-9]{32}$/.test(secret.hex) ||
    secret.byteLength !== 16
  )
    failures.push("test recovery code is not explicitly public and fixed-length");
}
const mutations = Array.isArray(vectors.mutations) ? vectors.mutations : [];
const expectedMutationNames = [
  "wrong-recovery-secret",
  "recovery-secret-too-short",
  "recovery-secret-too-long",
  "nonce-modified",
  "salt-modified",
  "ciphertext-modified",
  "aad-modified",
  "digest-modified",
  "weak-kdf-parameters",
  "unsupported-version",
];
if (
  JSON.stringify(mutations.filter(isRecord).map((mutation) => mutation.name)) !==
  JSON.stringify(expectedMutationNames)
)
  failures.push("backup mutation inventory mismatch");
const errors = new Set(
  mutations
    .filter(isRecord)
    .map((mutation) => mutation.expected)
    .filter(isRecord)
    .map((expected) => expected.code),
);
for (const [index, mutation] of mutations.entries()) {
  const expected = isRecord(mutation) ? mutation.expected : undefined;
  if (
    !isRecord(expected) ||
    JSON.stringify(Object.keys(expected).sort()) !==
      JSON.stringify([
        "aesGcmAttempted",
        "argon2idAttempted",
        "code",
        "plaintextReleased",
        "result",
      ])
  )
    failures.push(`mutation ${index}: expected result must contain only the closed error fields`);
}
for (const required of ["invalid-envelope", "authentication-failed", "unsupported-version"]) {
  if (!errors.has(required)) failures.push(`missing ${required} mutation`);
}

const context = vectors.contextCanonicalization;
if (!isRecord(context) || !isRecord(context.golden) || !Array.isArray(context.mutations)) {
  failures.push("missing context canonicalization vectors");
} else {
  const normalized = context.golden.normalized;
  const contextValidator = ajv.getSchema(
    "https://contracts.libre-ai.fr/schemas/context-document.v2.schema.json",
  );
  if (!contextValidator?.(normalized)) failures.push("normalized context rejected by schema");
  if (!isRecord(normalized)) {
    failures.push("normalized context is not an object");
  } else {
    if (!/^urn:libre-ai:context:[a-f0-9]{32}$/.test(String(normalized.id)))
      failures.push("context id is not an opaque 128-bit value");
    if ("createdAt" in normalized) failures.push("clear context createdAt is forbidden");
    if ("excludedBlockIds" in normalized) failures.push("context exclusions must stay local");
    if (
      Array.isArray(normalized.blocks) &&
      normalized.blocks.some(
        (block) =>
          !isRecord(block) ||
          "revision" in block ||
          typeof block.id !== "string" ||
          !/^blk_[a-f0-9]{32}$/.test(block.id),
      )
    )
      failures.push("context block metadata is not export-scoped and minimal");
    const unsigned = structuredClone(normalized);
    delete unsigned.digest;
    const preimage = Buffer.concat([
      Buffer.from("libre-ai.context-document.v2", "utf8"),
      Buffer.from([0]),
      Buffer.from(jcs(unsigned), "utf8"),
    ]);
    if (normalized.digest !== digestBytes(preimage)) failures.push("context digest mismatch");
    if (context.golden.canonicalOutputUtf8 !== jcs(normalized))
      failures.push("context canonical output mismatch");
  }
  const expectedContextNames = [
    "bom-prefixed",
    "malformed-utf8",
    "duplicate-top-level-key",
    "unknown-field",
    "duplicate-block-id",
    "missing-root-target",
    "missing-link-target",
    "semantic-block-id",
    "json-depth-over-limit",
    "numeric-over-limit",
    "invalid-nested-json",
    "duplicate-nested-json-key",
  ];
  if (
    JSON.stringify(context.mutations.filter(isRecord).map((mutation) => mutation.name)) !==
    JSON.stringify(expectedContextNames)
  )
    failures.push("context mutation inventory mismatch");
  if (
    !isRecord(context.limits) ||
    context.limits.maxJsonDepth !== 64 ||
    context.limits.maxJsonNodes !== 100000 ||
    context.limits.maxTotalLinks !== 16384 ||
    context.limits.maxNumberMagnitude !== Number.MAX_SAFE_INTEGER
  )
    failures.push("context semantic resource limits are missing");
  if (
    !isRecord(context.resourceFixtureProfile) ||
    context.resourceFixtureProfile.name !== "libre-ai.context-resource-fixture.v1"
  )
    failures.push("context resource fixture profile is missing");
  if (!Array.isArray(context.resourceCases) || context.resourceCases.length !== 6) {
    failures.push("context resource boundary cases are missing");
  } else {
    for (const [index, item] of context.resourceCases.entries()) {
      if (
        !isRecord(item) ||
        item.fixtureOrdinal !== index + 1 ||
        typeof item.inputCanonicalByteLength !== "number" ||
        typeof item.inputCanonicalSha256 !== "string" ||
        !/^[a-f0-9]{64}$/.test(item.inputCanonicalSha256) ||
        (item.expected === "accepted" &&
          (typeof item.canonicalOutputByteLength !== "number" ||
            typeof item.canonicalOutputSha256 !== "string" ||
            !/^[a-f0-9]{64}$/.test(item.canonicalOutputSha256)))
      )
        failures.push(`context resource case ${index}: non-replayable fixture`);
    }
  }
  if (!Array.isArray(context.numericCases) || context.numericCases.length !== 8)
    failures.push("context numeric boundary cases are missing");
}

const codeProfile = vectors.recoverySecretCodeProfile;
if (
  !isRecord(codeProfile) ||
  codeProfile.name !== "libre-ai.recovery-secret-code.v1" ||
  !isRecord(codeProfile.case) ||
  typeof codeProfile.case.display !== "string" ||
  !/^[a-f0-9]{32}$/.test(codeProfile.case.display) ||
  codeProfile.case.display !== codeProfile.case.bytesHex ||
  codeProfile.case.byteLength !== 16
)
  failures.push("missing canonical generated recovery code profile");

if ("recoverySecretTextProfile" in vectors)
  failures.push("ambiguous text recovery profile must not exist in v2");

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(
  `Notebook vectors are structurally verified: ${mutations.length} backup and ${
    isRecord(context) && Array.isArray(context.mutations) ? context.mutations.length : 0
  } context mutations. Gate A is locked by the main Notebook checker; Gate B runtime remains required.`,
);
