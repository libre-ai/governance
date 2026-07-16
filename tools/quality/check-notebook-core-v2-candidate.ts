import { existsSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

type Kdf = {
  algorithm: string;
  version: number;
  memoryKiB: number;
  iterations: number;
  parallelism: number;
  outputLengthBytes: number;
  salt: string;
};

type Envelope = {
  schemaVersion: string;
  id: string;
  createdAt: string;
  cipher: string;
  kdf: Kdf;
  nonce: string;
  ciphertext: string;
  digest: string;
};

type SealRequest = Omit<Envelope, "ciphertext" | "digest" | "schemaVersion"> & {
  schemaVersion: string;
  plaintext: string;
};

type Mutation = {
  name: string;
  recoverySecretUtf8: string;
  digestRecomputedAfterMutation: boolean;
  envelope: Envelope;
  expected: {
    result: string;
    code: string;
    argon2idAttempted: boolean;
    plaintextReleased: boolean;
  };
};

type GoldenVectors = {
  schemaVersion: string;
  status: string;
  golden: {
    request: SealRequest;
    recoverySecret: {
      value: string;
      hex: string;
      byteLength: number;
      sensitive: boolean;
    };
    plaintext: { base64: string; hex: string; byteLength: number };
    argon2id: { derivedKeyHex: string };
    aad: {
      domainUtf8: string;
      separatorHex: string;
      canonicalMetadataJsonUtf8: string;
      bytesHex: string;
      byteLength: number;
    };
    aes256Gcm: {
      nonceHex: string;
      tagLengthBytes: number;
      encryptedContentHex: string;
      tagHex: string;
      ciphertextAndTagHex: string;
      ciphertextAndTagBase64: string;
      byteLength: number;
    };
    digest: {
      algorithm: string;
      domainUtf8: string;
      separatorHex: string;
      canonicalEnvelopeWithoutDigestUtf8: string;
      preimageHex: string;
      hexLower: string;
    };
    envelope: Envelope;
    canonicalEnvelopeUtf8: string;
  };
  mutations: Mutation[];
};

const root = "docs/security/notebook-core-v2-review";
const failures: string[] = [];
const encoder = new TextEncoder();

function fail(message: string): void {
  failures.push(message);
}

function expect(condition: boolean, message: string): void {
  if (!condition) fail(message);
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) fail(`${label}: expected ${String(expected)}, got ${String(actual)}`);
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, nested]) => [key, sortJson(nested)]),
  );
}

function canonicalJson(value: unknown): string {
  const encoded = JSON.stringify(sortJson(value));
  if (encoded === undefined) throw new TypeError("Value is not JSON serializable");
  return encoded;
}

function concatenate(...parts: Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((length, part) => length + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

function bytesToHex(value: Uint8Array): string {
  return Buffer.from(value).toString("hex");
}

function hexToBytes(value: string, label: string): Uint8Array {
  if (!/^(?:[a-f0-9]{2})+$/.test(value)) {
    fail(`${label}: non-canonical lowercase hex`);
    return new Uint8Array();
  }
  return new Uint8Array(Buffer.from(value, "hex"));
}

function decodeCanonicalBase64(value: string, label: string): Uint8Array {
  const decoded = new Uint8Array(Buffer.from(value, "base64"));
  if (Buffer.from(decoded).toString("base64") !== value) fail(`${label}: non-canonical Base64`);
  return decoded;
}

function sha256Hex(value: Uint8Array): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(value);
  return hasher.digest("hex");
}

function metadata(envelope: Envelope): Omit<Envelope, "ciphertext" | "digest"> {
  return {
    schemaVersion: envelope.schemaVersion,
    id: envelope.id,
    createdAt: envelope.createdAt,
    cipher: envelope.cipher,
    kdf: structuredClone(envelope.kdf),
    nonce: envelope.nonce,
  };
}

function aadBytes(envelope: Envelope): Uint8Array {
  return concatenate(
    encoder.encode("libre-ai.notebook-backup.v2/aad"),
    new Uint8Array([0]),
    encoder.encode(canonicalJson(metadata(envelope))),
  );
}

function envelopeWithoutDigest(envelope: Envelope): Omit<Envelope, "digest"> {
  const output = structuredClone(envelope) as Partial<Envelope>;
  delete output.digest;
  return output as Omit<Envelope, "digest">;
}

function digestPreimage(envelope: Envelope): Uint8Array {
  return concatenate(
    encoder.encode("libre-ai.notebook-backup.v2/digest"),
    new Uint8Array([0]),
    encoder.encode(canonicalJson(envelopeWithoutDigest(envelope))),
  );
}

function exactBuffer(value: Uint8Array): ArrayBuffer {
  return value.slice().buffer;
}

async function decrypt(envelope: Envelope, key: CryptoKey): Promise<Uint8Array | undefined> {
  try {
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: exactBuffer(decodeCanonicalBase64(envelope.nonce, "envelope.nonce")),
        additionalData: exactBuffer(aadBytes(envelope)),
        tagLength: 128,
      },
      key,
      exactBuffer(decodeCanonicalBase64(envelope.ciphertext, "envelope.ciphertext")),
    );
    return new Uint8Array(plaintext);
  } catch {
    return undefined;
  }
}

const candidateArtifacts = [
  "contracts/wit/notebook-core-v2/world.wit",
  "contracts/wit/notebook-core-v2/SEMANTICS.md",
  "contracts/schemas/context-document.v2.schema.json",
  "contracts/schemas/notebook-backup-seal-request.v2.schema.json",
  "contracts/schemas/notebook-backup.v2.schema.json",
  "contracts/fixtures/notebook-core-v2/golden-vectors.v1.json",
];
for (const path of candidateArtifacts) {
  expect(existsSync(path), `${path}: ADR-0003 candidate artifact is missing`);
}

const catalog = (await Bun.file("contracts/catalog.v1.json").json()) as {
  contracts?: Array<{
    path?: unknown;
    status?: unknown;
    review?: {
      state?: unknown;
      reviewerKind?: unknown;
      separation?: unknown;
      required?: unknown;
    };
  }>;
};
for (const path of [
  "contracts/wit/notebook-core-v2/world.wit",
  "contracts/schemas/context-document.v2.schema.json",
  "contracts/schemas/notebook-backup-seal-request.v2.schema.json",
  "contracts/schemas/notebook-backup.v2.schema.json",
]) {
  const entry = catalog.contracts?.find((candidate) => candidate.path === path);
  expect(
    entry?.status === "candidate",
    `${path}: independent Gate A is pending; status must remain candidate`,
  );
  expect(
    entry?.review?.state === "pending-independent-agent-review" &&
      entry.review.reviewerKind === "agent" &&
      entry.review.separation === "different-agent-and-session",
    `${path}: pending independent agent review metadata is missing`,
  );
  const required = entry?.review?.required;
  expect(
    Array.isArray(required) && required.includes("cryptography") && required.includes("privacy"),
    `${path}: cryptography and privacy reviews are required`,
  );
}

const reviewedCopies: ReadonlyArray<readonly [string, string]> = [
  [`${root}/world.wit`, "contracts/wit/notebook-core-v2/world.wit"],
  [
    `${root}/notebook-backup-seal-request.v2.schema.json`,
    "contracts/schemas/notebook-backup-seal-request.v2.schema.json",
  ],
  [`${root}/notebook-backup.v2.schema.json`, "contracts/schemas/notebook-backup.v2.schema.json"],
  [
    `${root}/notebook-core-v2.golden.json`,
    "contracts/fixtures/notebook-core-v2/golden-vectors.v1.json",
  ],
];
for (const [reviewPath, candidatePath] of reviewedCopies) {
  expectEqual(
    await Bun.file(candidatePath).text(),
    await Bun.file(reviewPath).text(),
    `${candidatePath} reviewed-source identity`,
  );
}

const requiredFiles = [
  "README.md",
  "MIGRATION.md",
  "SOLO-CHALLENGE.md",
  "INDEPENDENT-REVIEW.md",
  "PERFORMANCE.md",
  "world.wit",
  "notebook-backup-seal-request.v2.schema.json",
  "notebook-backup.v2.schema.json",
  "notebook-core-v2.golden.json",
];
for (const name of requiredFiles) expect(existsSync(`${root}/${name}`), `${root}/${name}: missing`);

const wit = await Bun.file(`${root}/world.wit`).text();
const executableWit = wit.replaceAll(/\/\/.*$/gm, "");
expect(wit.startsWith("package libre-ai:notebook-core@2.0.0;"), "WIT package must be v2");
expect(!/\bimport\b/.test(executableWit), "WIT host imports are forbidden");
expect(
  executableWit.includes("interface api {"),
  "WIT must expose one self-contained api interface",
);
expect(!executableWit.includes("interface types"), "WIT separate type interfaces are forbidden");
expect(
  /world notebook-core\s*\{\s*export api;\s*\}/s.test(executableWit),
  "WIT world must export only the self-contained api interface",
);
expect(!executableWit.includes("contract-error"), "WIT free-form contract-error is forbidden");
expect(!executableWit.includes("message:"), "WIT free-form error messages are forbidden");
expectEqual(
  executableWit.match(/result<[^;]+, error-code>/g)?.length ?? 0,
  3,
  "WIT closed results",
);

const readme = await Bun.file(`${root}/README.md`).text();
expect(readme.includes("GATE S ACCEPTÉE"), "README must expose Gate S status");
expect(readme.includes("Gate A"), "README must retain the independent pre-implementation gate");
expect(readme.includes("Gate B"), "README must retain the independent pre-release gate");
for (const required of [
  "`recovery-secret` | 16 octets | 1024 octets",
  "plaintext | 1 octet | 16 777 216 octets",
  "nonce GCM : **12 octets exactement**",
  "sel Argon2id : **16 octets exactement**",
]) {
  expect(readme.includes(required), `README normative bound missing: ${required}`);
}

const requestSchema = await Bun.file(`${root}/notebook-backup-seal-request.v2.schema.json`).json();
const envelopeSchema = await Bun.file(`${root}/notebook-backup.v2.schema.json`).json();
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const maxPlaintextBytes = 16 * 1024 * 1024;
const maxCiphertextBytes = maxPlaintextBytes + 16;
const maxPlaintextBase64Bytes = 4 * Math.ceil(maxPlaintextBytes / 3);
const maxCiphertextBase64Bytes = 4 * Math.ceil(maxCiphertextBytes / 3);
expectEqual(
  requestSchema.properties?.plaintext?.maxLength,
  maxPlaintextBase64Bytes,
  "request plaintext Base64 maximum",
);
expectEqual(
  envelopeSchema.properties?.ciphertext?.maxLength,
  maxCiphertextBase64Bytes,
  "envelope ciphertext Base64 maximum",
);
const performance = await Bun.file(`${root}/PERFORMANCE.md`).text();
expect(performance.includes("1 081,4 MiB"), "100 MiB peak-memory evidence is missing");
expect(performance.includes("22 370 175 octets"), "maximum raw envelope bound is missing");
const semantics = await Bun.file("contracts/wit/notebook-core-v2/SEMANTICS.md").text();
expect(semantics.includes("interface autonome `api`"), "canonical WIT import rationale is missing");
expect(semantics.includes("22 370 175 octets"), "canonical raw envelope bound is missing");
const validateRequest = ajv.compile(requestSchema);
const validateEnvelope = ajv.compile(envelopeSchema);

const vectors = (await Bun.file(`${root}/notebook-core-v2.golden.json`).json()) as GoldenVectors;
const maximalEnvelope: Envelope = {
  ...structuredClone(vectors.golden.envelope),
  id: `urn:libre-ai:backup:${"a".repeat(128)}`,
  kdf: {
    ...structuredClone(vectors.golden.envelope.kdf),
    memoryKiB: 131_072,
    iterations: 4,
    parallelism: 4,
  },
  ciphertext: "",
  digest: "a".repeat(64),
};
expectEqual(
  encoder.encode(canonicalJson(maximalEnvelope)).byteLength + maxCiphertextBase64Bytes,
  22_370_175,
  "maximum raw canonical envelope bytes",
);
expectEqual(vectors.schemaVersion, "libre-ai.notebook-core-golden.v2", "vector schemaVersion");
expectEqual(vectors.status, "review-candidate", "vector status");
expect(vectors.golden.recoverySecret.sensitive === false, "test recovery secret must be public");
expect(
  validateRequest(vectors.golden.request),
  `golden request rejected: ${ajv.errorsText(validateRequest.errors)}`,
);
expect(
  validateEnvelope(vectors.golden.envelope),
  `golden envelope rejected: ${ajv.errorsText(validateEnvelope.errors)}`,
);

const plaintext = decodeCanonicalBase64(vectors.golden.plaintext.base64, "golden.plaintext");
expectEqual(plaintext.byteLength, vectors.golden.plaintext.byteLength, "plaintext byte length");
expectEqual(bytesToHex(plaintext), vectors.golden.plaintext.hex, "plaintext hex");
expectEqual(vectors.golden.request.plaintext, vectors.golden.plaintext.base64, "request plaintext");
const recoverySecret = encoder.encode(vectors.golden.recoverySecret.value);
expectEqual(
  recoverySecret.byteLength,
  vectors.golden.recoverySecret.byteLength,
  "secret byte length",
);
expectEqual(bytesToHex(recoverySecret), vectors.golden.recoverySecret.hex, "secret hex");
expect(recoverySecret.byteLength >= 16 && recoverySecret.byteLength <= 1024, "secret bounds");

const salt = decodeCanonicalBase64(vectors.golden.envelope.kdf.salt, "golden salt");
const nonce = decodeCanonicalBase64(vectors.golden.envelope.nonce, "golden nonce");
const ciphertext = decodeCanonicalBase64(vectors.golden.envelope.ciphertext, "golden ciphertext");
expectEqual(salt.byteLength, 16, "salt length");
expectEqual(nonce.byteLength, 12, "nonce length");
expectEqual(ciphertext.byteLength, plaintext.byteLength + 16, "ciphertext/tag length");
expectEqual(vectors.golden.envelope.kdf.outputLengthBytes, 32, "KDF output length");

const aad = aadBytes(vectors.golden.envelope);
expectEqual(
  canonicalJson(metadata(vectors.golden.envelope)),
  vectors.golden.aad.canonicalMetadataJsonUtf8,
  "AAD metadata JCS",
);
expectEqual(bytesToHex(aad), vectors.golden.aad.bytesHex, "AAD bytes");
expectEqual(aad.byteLength, vectors.golden.aad.byteLength, "AAD length");
expectEqual(vectors.golden.aad.domainUtf8, "libre-ai.notebook-backup.v2/aad", "AAD domain");
expectEqual(vectors.golden.aad.separatorHex, "00", "AAD separator");

const preimage = digestPreimage(vectors.golden.envelope);
expectEqual(
  canonicalJson(envelopeWithoutDigest(vectors.golden.envelope)),
  vectors.golden.digest.canonicalEnvelopeWithoutDigestUtf8,
  "digest JCS",
);
expectEqual(bytesToHex(preimage), vectors.golden.digest.preimageHex, "digest preimage");
expectEqual(sha256Hex(preimage), vectors.golden.envelope.digest, "envelope digest");
expectEqual(vectors.golden.digest.hexLower, vectors.golden.envelope.digest, "recorded digest");
expectEqual(
  canonicalJson(vectors.golden.envelope),
  vectors.golden.canonicalEnvelopeUtf8,
  "envelope JCS",
);

const keyBytes = hexToBytes(vectors.golden.argon2id.derivedKeyHex, "Argon2id derived key");
expectEqual(keyBytes.byteLength, 32, "AES-256 key length");
const key = await crypto.subtle.importKey(
  "raw",
  exactBuffer(keyBytes),
  { name: "AES-GCM" },
  false,
  ["decrypt"],
);
const opened = await decrypt(vectors.golden.envelope, key);
expect(opened !== undefined, "golden AES-GCM authentication failed");
if (opened) expectEqual(bytesToHex(opened), vectors.golden.plaintext.hex, "opened plaintext");

expectEqual(vectors.golden.aes256Gcm.nonceHex, bytesToHex(nonce), "AES nonce");
expectEqual(vectors.golden.aes256Gcm.tagLengthBytes, 16, "AES tag length");
expectEqual(vectors.golden.aes256Gcm.ciphertextAndTagHex, bytesToHex(ciphertext), "AES output");
expectEqual(
  vectors.golden.aes256Gcm.ciphertextAndTagBase64,
  vectors.golden.envelope.ciphertext,
  "AES output Base64",
);
expectEqual(vectors.golden.aes256Gcm.byteLength, ciphertext.byteLength, "AES output length");
expectEqual(
  `${vectors.golden.aes256Gcm.encryptedContentHex}${vectors.golden.aes256Gcm.tagHex}`,
  vectors.golden.aes256Gcm.ciphertextAndTagHex,
  "ciphertext/tag layout",
);

const expectedMutationNames = [
  "wrong-recovery-secret",
  "nonce-modified",
  "salt-modified",
  "ciphertext-modified",
  "aad-modified",
  "weak-kdf-parameters",
  "unsupported-version",
];
expectEqual(
  JSON.stringify(vectors.mutations.map((mutation) => mutation.name)),
  JSON.stringify(expectedMutationNames),
  "mutation inventory",
);

for (const mutation of vectors.mutations) {
  const expectedKeys = Object.keys(mutation.expected).sort();
  expectEqual(
    JSON.stringify(expectedKeys),
    JSON.stringify(["argon2idAttempted", "code", "plaintextReleased", "result"]),
    `${mutation.name} closed expected error`,
  );
  expect(mutation.expected.plaintextReleased === false, `${mutation.name}: plaintext released`);
  expectEqual(
    sha256Hex(digestPreimage(mutation.envelope)),
    mutation.envelope.digest,
    `${mutation.name} digest`,
  );

  const schemaValid = validateEnvelope(mutation.envelope);
  if (mutation.name === "weak-kdf-parameters") {
    expect(!schemaValid, `${mutation.name}: weak parameters accepted by schema`);
    expect(mutation.expected.argon2idAttempted === false, `${mutation.name}: Argon2id attempted`);
    expectEqual(mutation.expected.code, "invalid-envelope", `${mutation.name} code`);
    continue;
  }
  if (mutation.name === "unsupported-version") {
    expect(!schemaValid, `${mutation.name}: unsupported version accepted by schema`);
    expect(
      mutation.digestRecomputedAfterMutation === true,
      `${mutation.name}: digest recomputation marker is false`,
    );
    expect(mutation.expected.argon2idAttempted === false, `${mutation.name}: Argon2id attempted`);
    expectEqual(mutation.expected.code, "unsupported-version", `${mutation.name} code`);
    continue;
  }

  expect(
    schemaValid,
    `${mutation.name}: valid mutation rejected: ${ajv.errorsText(validateEnvelope.errors)}`,
  );
  expect(mutation.expected.argon2idAttempted === true, `${mutation.name}: Argon2id not attempted`);
  expectEqual(mutation.expected.code, "authentication-failed", `${mutation.name} code`);

  if (mutation.name === "wrong-recovery-secret") {
    expect(
      mutation.recoverySecretUtf8 !== vectors.golden.recoverySecret.value,
      "wrong recovery secret did not change",
    );
    expectEqual(
      encoder.encode(mutation.recoverySecretUtf8).byteLength,
      recoverySecret.byteLength,
      "wrong recovery secret byte length",
    );
    continue;
  }

  const mutationOpened = await decrypt(mutation.envelope, key);
  expect(mutationOpened === undefined, `${mutation.name}: AES-GCM mutation authenticated`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(
  `Notebook Core v2 Gate S verified: closed WIT, candidate-only copies, schemas, AAD/digest/AES-GCM, ${vectors.mutations.length} mutations; Gate A remains pending`,
);
