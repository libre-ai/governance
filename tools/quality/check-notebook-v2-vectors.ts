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
    createdAt: golden.envelope.createdAt,
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
  if (!isRecord(secret) || secret.sensitive !== false || String(secret.value).length === 0)
    failures.push("test secret is not explicitly public");
}
const mutations = Array.isArray(vectors.mutations) ? vectors.mutations : [];
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
      JSON.stringify(["argon2idAttempted", "code", "plaintextReleased", "result"])
  )
    failures.push(`mutation ${index}: expected result must contain only the closed error fields`);
}
for (const required of ["invalid-envelope", "authentication-failed", "unsupported-version"]) {
  if (!errors.has(required)) failures.push(`missing ${required} mutation`);
}
if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(
  `Notebook vectors structurally verified: ${mutations.length} mutations; independent cryptography review remains required`,
);
