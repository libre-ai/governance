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
  recoverySecretHex: string;
  digestRecomputedAfterMutation: boolean;
  envelope: Envelope;
  expected: {
    result: string;
    code: string;
    argon2idAttempted: boolean;
    aesGcmAttempted: boolean;
    plaintextReleased: boolean;
  };
};

type GoldenVectors = {
  schemaVersion: string;
  status: string;
  golden: {
    request: SealRequest;
    recoverySecret: {
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
  contextCanonicalization: {
    golden: {
      inputUtf8: string;
      normalized: Record<string, unknown>;
      digest: {
        domainUtf8: string;
        separatorHex: string;
        canonicalDocumentWithoutDigestUtf8: string;
        preimageHex: string;
        hexLower: string;
      };
      canonicalOutputUtf8: string;
      outputByteLength: number;
    };
    limits: {
      maxInputBytes: number;
      maxContentBytes: number;
      maxJsonDepth: number;
      maxJsonNodes: number;
      maxBlocks: number;
      maxLinksPerBlock: number;
      maxTotalLinks: number;
      maxNumberMagnitude: number;
    };
    mutations: Array<{
      name: string;
      documentUtf8?: string;
      documentHex?: string;
      expected: { result: string; code: string };
    }>;
    resourceFixtureProfile: {
      name: string;
      serialization: string;
      contextId: string;
      blockIds: string;
      jsonDepth: string;
      jsonNodes: string;
      totalLinks: string;
      inputDerivedFields: string;
    };
    resourceCases: Array<{
      name: string;
      dimension: "jsonDepth" | "jsonNodes" | "totalLinks";
      value: number;
      expected: string;
      fixtureOrdinal: number;
      inputCanonicalByteLength: number;
      inputCanonicalSha256: string;
      canonicalOutputByteLength?: number;
      canonicalOutputSha256?: string;
    }>;
    numericCases: Array<{
      name: string;
      inputUtf8: string;
      canonicalUtf8?: string;
      expected: string;
    }>;
  };
  recoverySecretCodeProfile: {
    name: string;
    algorithm: string;
    case: { bytesHex: string; display: string; byteLength: number };
  };
};

const root = "docs/security/notebook-core-v2-review";
const gateACommit = "a28e116b0a3ebf278412650715e03f7050c0aac0";
const gateATree = "cda41e7f9cc620a87ee0488caa06141614fb5b93";
const ownerControlUrl = "https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998576948";
const cycleReviewRoot = "docs/reviews/notebook-core-v2/gate-a/a28e116";
const failures: string[] = [];
const encoder = new TextEncoder();

type GateARolePass = {
  role: string;
  reviewPassId: string;
  verdict: string;
  reportPath: string;
  reviewCommentUrl: string;
  reportSha: string;
};

type GateAIntegrationPass = {
  mode: string;
  reviewPassId: string;
  integrator: string;
  session: string;
  base: string;
};

const gateArolePasses: GateARolePass[] = [
  {
    role: "architecture",
    reviewPassId: "notebook-core-v2-a28e116-architecture",
    verdict: "APPROVE",
    reportPath: `${cycleReviewRoot}/ARCHITECTURE.md`,
    reviewCommentUrl: "https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998564391",
    reportSha: "bea5bb969119014d24e797bd51b4f8ccdf832c2a58977bad871d7beb5989abfa",
  },
  {
    role: "sécurité",
    reviewPassId: "notebook-core-v2-a28e116-security",
    verdict: "APPROVE",
    reportPath: `${cycleReviewRoot}/SECURITY.md`,
    reviewCommentUrl: "https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998564393",
    reportSha: "87610b711d515f3ccbc39aac16217b86610ee4eae98b62d19821fcf03b881a69",
  },
  {
    role: "cryptographie",
    reviewPassId: "notebook-core-v2-a28e116-cryptography",
    verdict: "APPROVE",
    reportPath: `${cycleReviewRoot}/CRYPTOGRAPHY.md`,
    reviewCommentUrl: "https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998564385",
    reportSha: "591a909f728d6085ba2b70465fc05ff0449993cbf9d6f95c6ce11161f68c9dea",
  },
  {
    role: "vie privée France/UE",
    reviewPassId: "notebook-core-v2-a28e116-privacy",
    verdict: "APPROVE",
    reportPath: `${cycleReviewRoot}/PRIVACY.md`,
    reviewCommentUrl: "https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998564380",
    reportSha: "d3e690fdd357e27c31b1afc21e6e591103b2b8733f436b359c9b58d053c7e995",
  },
];

const gateAIntegrationPass: GateAIntegrationPass = {
  mode: "promotion-integration",
  reviewPassId: "notebook-core-v2-a28e116-promotion-integration",
  integrator: "openai-codex/gpt-5.3-codex-spark",
  session: "f9f195bf-4492-4d64-bb98-b4c08b0a2084",
  base: "7ad0695b563745d2c6223f4d2cdcafc9fd9e3d0a",
};

const synthesisCommentUrl = "https://github.com/libre-ai/libre-ai/pull/41#issuecomment-4998566929";

const gateAAuthorityShas: Record<string, string> = {
  "contracts/wit/notebook-core-v2/world.wit":
    "132d4cec0116352c8cea2c356b6dd6638758e07c7e182dc01042ea5667daa295",
  "contracts/wit/notebook-core-v2/SEMANTICS.md":
    "5c17e87e9944f40d1e1e29a3a5bacd85bf9846c4386bc0adb053356dad39b45b",
  "contracts/schemas/context-document.v2.schema.json":
    "f205f1a246ce88221a21a16d69d66966ff33c989f915d2879df77e5f7f5f96d4",
  "contracts/schemas/notebook-backup-seal-request.v2.schema.json":
    "4beb3e8818f2036f38c44469432d31222191523d621779c8c5b28ab5be760e5a",
  "contracts/schemas/notebook-backup.v2.schema.json":
    "e2932bbb2cd2b7062be703aad327ad84e51badf0d4fa9b8ad59b00191e686ad0",
  "contracts/fixtures/notebook-core-v2/golden-vectors.v1.json":
    "734eeecefd5c4b70fa1b86f3c389259117087882d2e105ec14dfabae5062ee09",
};

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

async function fileSha256(path: string): Promise<string> {
  return sha256Hex(new Uint8Array(await Bun.file(path).arrayBuffer()));
}

function metadata(envelope: Envelope): Omit<Envelope, "ciphertext" | "digest"> {
  return {
    schemaVersion: envelope.schemaVersion,
    id: envelope.id,
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

function normalizeContext(value: Record<string, unknown>): Record<string, unknown> {
  const output = structuredClone(value) as Record<string, unknown> & {
    rootBlockIds: string[];
    blocks: Array<{
      id: string;
      mediaType: string;
      content: string;
      links: string[];
    }>;
    totalBytes: number;
    digest: string;
  };
  output.rootBlockIds.sort();
  for (const block of output.blocks) {
    block.links.sort();
    if (block.mediaType === "application/json") {
      block.content = canonicalJson(JSON.parse(block.content));
    }
  }
  output.blocks.sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  output.totalBytes = output.blocks.reduce(
    (total, block) => total + encoder.encode(block.content).byteLength,
    0,
  );
  const unsigned = structuredClone(output) as Partial<typeof output>;
  delete unsigned.digest;
  const preimage = concatenate(
    encoder.encode("libre-ai.context-document.v2"),
    new Uint8Array([0]),
    encoder.encode(canonicalJson(unsigned)),
  );
  output.digest = sha256Hex(preimage);
  return output;
}

function materializeContextResourceCase(
  fixtureOrdinal: number,
  dimension: "jsonDepth" | "jsonNodes" | "totalLinks",
  value: number,
): Record<string, unknown> {
  const blockIds = Array.from(
    { length: 1_000 },
    (_, index) => `blk_${index.toString(16).padStart(32, "0")}`,
  );
  let blocks: Array<{
    id: string;
    mediaType: string;
    content: string;
    links: string[];
  }>;
  if (dimension === "jsonDepth") {
    const arrays = value - 1;
    blocks = [
      {
        id: blockIds[0] as string,
        mediaType: "application/json",
        content: `${"[".repeat(arrays)}0${"]".repeat(arrays)}`,
        links: [],
      },
    ];
  } else if (dimension === "jsonNodes") {
    blocks = [
      {
        id: blockIds[0] as string,
        mediaType: "application/json",
        content: `[${Array.from({ length: value - 1 }, () => "0").join(",")}]`,
        links: [],
      },
    ];
  } else {
    let remaining = value;
    blocks = blockIds.map((id) => {
      const linkCount = Math.min(1_000, remaining);
      remaining -= linkCount;
      return { id, mediaType: "text/plain", content: "", links: blockIds.slice(0, linkCount) };
    });
    expectEqual(remaining, 0, "resource fixture undistributed links");
  }
  return {
    schemaVersion: "libre-ai.context-document.v2",
    id: `urn:libre-ai:context:${fixtureOrdinal.toString(16).padStart(32, "0")}`,
    rootBlockIds: [blockIds[0]],
    blocks,
    totalBytes: blocks.reduce(
      (total, block) => total + encoder.encode(block.content).byteLength,
      0,
    ),
    digest: "0".repeat(64),
  };
}

function jsonMetrics(value: unknown): { depth: number; nodes: number } {
  let depth = 0;
  let nodes = 0;
  const pending: Array<readonly [unknown, number]> = [[value, 1]];
  while (pending.length > 0) {
    const [item, itemDepth] = pending.pop() as readonly [unknown, number];
    nodes += 1;
    depth = Math.max(depth, itemDepth);
    if (Array.isArray(item)) {
      for (const nested of item) pending.push([nested, itemDepth + 1]);
    } else if (typeof item === "object" && item !== null) {
      for (const nested of Object.values(item)) pending.push([nested, itemDepth + 1]);
    }
  }
  return { depth, nodes };
}

function contextResourceMetrics(document: Record<string, unknown>): {
  jsonDepth: number;
  jsonNodes: number;
  totalLinks: number;
} {
  const blocks = document.blocks as Array<{
    mediaType: string;
    content: string;
    links: string[];
  }>;
  let jsonDepth = 0;
  let jsonNodes = 0;
  let totalLinks = 0;
  for (const block of blocks) {
    totalLinks += block.links.length;
    if (block.mediaType === "application/json") {
      const metrics = jsonMetrics(JSON.parse(block.content));
      jsonDepth = Math.max(jsonDepth, metrics.depth);
      jsonNodes += metrics.nodes;
    }
  }
  return { jsonDepth, jsonNodes, totalLinks };
}

function contextDigestPreimage(document: Record<string, unknown>): Uint8Array {
  const unsigned = structuredClone(document);
  delete unsigned.digest;
  return concatenate(
    encoder.encode("libre-ai.context-document.v2"),
    new Uint8Array([0]),
    encoder.encode(canonicalJson(unsigned)),
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

const lockedAuthorityArtifacts = [
  "contracts/wit/notebook-core-v2/world.wit",
  "contracts/wit/notebook-core-v2/SEMANTICS.md",
  "contracts/schemas/context-document.v2.schema.json",
  "contracts/schemas/notebook-backup-seal-request.v2.schema.json",
  "contracts/schemas/notebook-backup.v2.schema.json",
  "contracts/fixtures/notebook-core-v2/golden-vectors.v1.json",
];
for (const path of lockedAuthorityArtifacts) {
  expect(existsSync(path), `${path}: ADR-0003 notebook-core-v2 authority is missing`);
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
const lockedAuthorityCatalogPaths = [
  "contracts/wit/notebook-core-v2/world.wit",
  "contracts/schemas/context-document.v2.schema.json",
  "contracts/schemas/notebook-backup-seal-request.v2.schema.json",
  "contracts/schemas/notebook-backup.v2.schema.json",
];
const catalogEntries = (catalog.contracts ?? []).filter(
  (candidate) =>
    typeof candidate.path === "string" && lockedAuthorityCatalogPaths.includes(candidate.path),
);
expectEqual(
  catalogEntries.length,
  lockedAuthorityCatalogPaths.length,
  "Notebook Core v2 promotion should touch only four locked authorities in catalog",
);
for (const path of lockedAuthorityCatalogPaths) {
  const entry = catalog.contracts?.find((candidate) => candidate.path === path);
  expect(entry?.status === "locked", `${path}: promotion is completed; status must be locked`);
  expect(
    entry?.review === undefined,
    `${path}: locked catalog entry must not keep pending review metadata`,
  );
}

const gateAReviewText = await Bun.file(`${root}/INDEPENDENT-REVIEW.md`).text();
expect(
  gateAReviewText.includes(`commit Git : \`${gateACommit}\``),
  "INDEPENDENT-REVIEW.md missing Gate A commit",
);
expect(
  gateAReviewText.includes(`arbre Git : \`${gateATree}\``),
  "INDEPENDENT-REVIEW.md missing Gate A tree",
);
expect(
  gateAReviewText.includes(ownerControlUrl),
  "INDEPENDENT-REVIEW.md missing owner-control reference URL",
);
expect(
  gateAReviewText.includes("Gate B") && gateAReviewText.includes("pending"),
  "INDEPENDENT-REVIEW.md missing Gate B pending state",
);
for (const pass of gateArolePasses) {
  expect(
    gateAReviewText.includes(`| ${pass.role} | \`${pass.reviewPassId}\` | \`${pass.verdict}\``),
    `${pass.role}: missing role-separated pass metadata`,
  );
}

const gateAReadme = await Bun.file(`${cycleReviewRoot}/README.md`).text();
expect(
  gateAReadme.includes(`Commit Git immuable : \`${gateACommit}\``),
  "Gate A README missing immutable commit",
);
expect(
  gateAReadme.includes(`Arbre Git immuable : \`${gateATree}\``),
  "Gate A README missing immutable tree",
);
expect(gateAReadme.includes(ownerControlUrl), "Gate A README missing owner-control reference URL");
expect(
  gateAReadme.includes("Gate B : **pending") ||
    gateAReadme.includes("Gate B en attente") ||
    gateAReadme.includes("Gate B pending"),
  "Gate A README missing Gate B pending",
);
for (const pass of gateArolePasses) {
  expect(gateAReadme.includes(pass.reviewPassId), `${pass.role}: missing review pass id`);
  expect(gateAReadme.includes(pass.verdict), `${pass.role}: missing review pass verdict`);
  expect(
    gateAReadme.includes(pass.reviewCommentUrl),
    `${pass.role}: missing review pass comment URL`,
  );
}

for (const pass of gateArolePasses) {
  expectEqual(
    await fileSha256(pass.reportPath),
    pass.reportSha,
    `${pass.reportPath}: Gate A report SHA mismatch`,
  );
}

const reviewText = await Bun.file(`${root}/INDEPENDENT-REVIEW.md`).text();
const gateAReadmeText = await Bun.file(`${cycleReviewRoot}/README.md`).text();
expect(
  reviewText.includes(gateAIntegrationPass.reviewPassId),
  "INDEPENDENT-REVIEW.md missing promotion integration review pass id",
);
expect(
  reviewText.includes(gateAIntegrationPass.mode),
  "INDEPENDENT-REVIEW.md missing promotion integration mode",
);
expect(
  reviewText.includes(gateAIntegrationPass.integrator),
  "INDEPENDENT-REVIEW.md missing promotion integration integrator",
);
expect(
  reviewText.includes(gateAIntegrationPass.session),
  "INDEPENDENT-REVIEW.md missing promotion integration session",
);
expect(
  reviewText.includes(gateAIntegrationPass.base),
  "INDEPENDENT-REVIEW.md missing promotion integration base",
);
expect(
  reviewText.includes(synthesisCommentUrl),
  "INDEPENDENT-REVIEW.md missing integration synthesis comment URL",
);
expect(
  gateAReadmeText.includes(gateAIntegrationPass.reviewPassId),
  "Gate A cycle README missing promotion integration review pass id",
);

const reviewFiles = [
  `${cycleReviewRoot}/README.md`,
  `${cycleReviewRoot}/ARCHITECTURE.md`,
  `${cycleReviewRoot}/SECURITY.md`,
  `${cycleReviewRoot}/CRYPTOGRAPHY.md`,
  `${cycleReviewRoot}/PRIVACY.md`,
];
for (const path of reviewFiles) {
  expect(existsSync(path), `${path}: Gate A review file is missing`);
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

for (const [path, expected] of Object.entries(gateAAuthorityShas)) {
  expectEqual(await fileSha256(path), expected, `${path}: locked authority sha mismatch`);
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
expect(!executableWit.includes("created-at"), "clear backup timestamps are forbidden");
expectEqual(
  executableWit.match(/result<[^;]+, error-code>/g)?.length ?? 0,
  3,
  "WIT closed results",
);

const readme = await Bun.file(`${root}/README.md`).text();
expect(readme.includes("Gate A") || readme.includes("GATE A"), "README must expose Gate A status");
expect(readme.includes("Gate B"), "README must retain the independent pre-release gate");
const semantics = await Bun.file("contracts/wit/notebook-core-v2/SEMANTICS.md").text();
for (const required of [
  "`recovery-secret` | 16 octets | 16 octets",
  "plaintext | 1 octet | 16 777 216 octets",
  "nonce GCM : **12 octets exactement**",
  "sel Argon2id : **16 octets exactement**",
  "libre-ai.recovery-secret-code.v1",
  "libre-ai.context-resource-fixture.v1",
  "16 384 liens",
  "100 000 valeurs JSON",
  "22 370 044 octets",
]) {
  expect(semantics.includes(required), `SEMANTICS normative rule missing: ${required}`);
}

const requestSchema = await Bun.file(`${root}/notebook-backup-seal-request.v2.schema.json`).json();
const envelopeSchema = await Bun.file(`${root}/notebook-backup.v2.schema.json`).json();
const contextSchema = await Bun.file("contracts/schemas/context-document.v2.schema.json").json();
const commonSchema = await Bun.file("contracts/schemas/common.v1.schema.json").json();
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(commonSchema);
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
expectEqual(requestSchema.properties?.id?.minLength, 52, "request opaque id length");
expectEqual(requestSchema.properties?.id?.maxLength, 52, "request opaque id length");
expect(requestSchema.properties?.createdAt === undefined, "request createdAt must stay encrypted");
expect(
  envelopeSchema.properties?.createdAt === undefined,
  "envelope createdAt must stay encrypted",
);
expectEqual(
  contextSchema.properties?.totalBytes?.maximum,
  maxPlaintextBytes,
  "context content maximum",
);
expectEqual(contextSchema.properties?.id?.minLength, 53, "context opaque id length");
expectEqual(contextSchema.properties?.id?.maxLength, 53, "context opaque id length");
expect(contextSchema.properties?.createdAt === undefined, "context createdAt must not leak");
expect(
  contextSchema.properties?.excludedBlockIds === undefined,
  "context exclusions must stay local",
);
expect(
  contextSchema.properties?.blocks?.items?.properties?.revision === undefined,
  "context revisions must stay local",
);
expectEqual(
  contextSchema.$defs?.exportBlockId?.pattern,
  "^blk_[a-f0-9]{32}$",
  "context export-scoped block id",
);
const performance = await Bun.file(`${root}/PERFORMANCE.md`).text();
expect(performance.includes("1 081,4 MiB"), "100 MiB peak-memory evidence is missing");
expect(performance.includes("22 370 044 octets"), "maximum raw envelope bound is missing");
expect(semantics.includes("interface autonome `api`"), "canonical WIT import rationale is missing");
const validateRequest = ajv.compile(requestSchema);
const validateEnvelope = ajv.compile(envelopeSchema);
const validateContext = ajv.compile(contextSchema);

const vectors = (await Bun.file(`${root}/notebook-core-v2.golden.json`).json()) as GoldenVectors;
const maximalEnvelope: Envelope = {
  ...structuredClone(vectors.golden.envelope),
  id: `urn:libre-ai:backup:${"a".repeat(32)}`,
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
  22_370_044,
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
const recoverySecret = hexToBytes(vectors.golden.recoverySecret.hex, "golden recovery secret");
expectEqual(
  recoverySecret.byteLength,
  vectors.golden.recoverySecret.byteLength,
  "secret byte length",
);
expectEqual(bytesToHex(recoverySecret), vectors.golden.recoverySecret.hex, "secret hex");
expectEqual(recoverySecret.byteLength, 16, "secret fixed length");

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
const reviewChecklist = await Bun.file(`${root}/INDEPENDENT-REVIEW.md`).text();
expect(
  reviewChecklist.includes(`clé dérivée \`${vectors.golden.argon2id.derivedKeyHex}\``),
  "review checklist derived key is stale",
);
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
expectEqual(
  JSON.stringify(vectors.mutations.map((mutation) => mutation.name)),
  JSON.stringify(expectedMutationNames),
  "mutation inventory",
);

const recomputedMutationNames = new Set([
  "nonce-modified",
  "salt-modified",
  "ciphertext-modified",
  "aad-modified",
  "weak-kdf-parameters",
]);
for (const mutation of vectors.mutations) {
  const expectedKeys = Object.keys(mutation.expected).sort();
  expectEqual(
    JSON.stringify(expectedKeys),
    JSON.stringify(["aesGcmAttempted", "argon2idAttempted", "code", "plaintextReleased", "result"]),
    `${mutation.name} closed expected error`,
  );
  expect(mutation.expected.plaintextReleased === false, `${mutation.name}: plaintext released`);
  expectEqual(
    mutation.digestRecomputedAfterMutation,
    recomputedMutationNames.has(mutation.name),
    `${mutation.name} digest recomputation flag`,
  );
  const calculatedDigest = sha256Hex(digestPreimage(mutation.envelope));
  if (mutation.name === "digest-modified" || mutation.name === "unsupported-version") {
    expect(
      calculatedDigest !== mutation.envelope.digest,
      `${mutation.name}: digest unexpectedly valid`,
    );
  } else {
    expectEqual(calculatedDigest, mutation.envelope.digest, `${mutation.name} digest`);
  }

  const schemaValid = validateEnvelope(mutation.envelope);
  if (mutation.name === "weak-kdf-parameters" || mutation.name === "unsupported-version") {
    expect(!schemaValid, `${mutation.name}: invalid public envelope accepted by schema`);
    expect(mutation.expected.argon2idAttempted === false, `${mutation.name}: Argon2id attempted`);
    expect(mutation.expected.aesGcmAttempted === false, `${mutation.name}: AES-GCM attempted`);
    expectEqual(
      mutation.expected.code,
      mutation.name === "weak-kdf-parameters" ? "invalid-envelope" : "unsupported-version",
      `${mutation.name} code`,
    );
    continue;
  }
  expect(
    schemaValid,
    `${mutation.name}: valid mutation rejected: ${ajv.errorsText(validateEnvelope.errors)}`,
  );
  expect(mutation.expected.argon2idAttempted === true, `${mutation.name}: Argon2id not attempted`);
  expect(mutation.expected.aesGcmAttempted === true, `${mutation.name}: AES-GCM not attempted`);
  expectEqual(mutation.expected.code, "authentication-failed", `${mutation.name} code`);

  if (
    mutation.name === "wrong-recovery-secret" ||
    mutation.name === "recovery-secret-too-short" ||
    mutation.name === "recovery-secret-too-long"
  ) {
    const mutationSecret = hexToBytes(mutation.recoverySecretHex, `${mutation.name} secret`);
    const secretLength = mutationSecret.byteLength;
    if (mutation.name === "wrong-recovery-secret") {
      expect(
        mutation.recoverySecretHex !== vectors.golden.recoverySecret.hex,
        "wrong recovery secret did not change",
      );
      expectEqual(secretLength, recoverySecret.byteLength, "wrong recovery secret byte length");
    } else if (mutation.name === "recovery-secret-too-short") {
      expectEqual(secretLength, 15, "short recovery secret byte length");
    } else {
      expectEqual(secretLength, 17, "long recovery secret byte length");
    }
    continue;
  }

  const mutationOpened = await decrypt(mutation.envelope, key);
  if (mutation.name === "digest-modified") {
    expect(mutationOpened !== undefined, "digest-only mutation must still run valid GCM");
  } else {
    expect(mutationOpened === undefined, `${mutation.name}: AES-GCM mutation authenticated`);
  }
}

const contextGolden = vectors.contextCanonicalization.golden;
expect(
  encoder.encode(contextGolden.inputUtf8).byteLength <= 22_370_044,
  "golden context exceeds the raw input bound",
);
const parsedContext = JSON.parse(contextGolden.inputUtf8) as Record<string, unknown>;
expect(
  validateContext(parsedContext),
  `context input rejected: ${ajv.errorsText(validateContext.errors)}`,
);
const normalizedContext = normalizeContext(parsedContext);
expect(
  Number(normalizedContext.totalBytes) <= maxPlaintextBytes,
  "normalized context exceeds the content bound",
);
expect(
  validateContext(normalizedContext),
  `normalized context rejected: ${ajv.errorsText(validateContext.errors)}`,
);
expectEqual(
  canonicalJson(normalizedContext),
  contextGolden.canonicalOutputUtf8,
  "context canonical output",
);
expectEqual(
  encoder.encode(contextGolden.canonicalOutputUtf8).byteLength,
  contextGolden.outputByteLength,
  "context output byte length",
);
const contextPreimage = contextDigestPreimage(normalizedContext);
expectEqual(
  bytesToHex(contextPreimage),
  contextGolden.digest.preimageHex,
  "context digest preimage",
);
expectEqual(sha256Hex(contextPreimage), contextGolden.digest.hexLower, "context digest");
expectEqual(
  canonicalJson(normalizedContext),
  canonicalJson(contextGolden.normalized),
  "context normalized object",
);

const expectedContextMutationNames = [
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
expectEqual(
  JSON.stringify(vectors.contextCanonicalization.mutations.map((mutation) => mutation.name)),
  JSON.stringify(expectedContextMutationNames),
  "context mutation inventory",
);
for (const mutation of vectors.contextCanonicalization.mutations) {
  expectEqual(mutation.expected.result, "error", `${mutation.name} context result`);
  expectEqual(mutation.expected.code, "invalid-document", `${mutation.name} context code`);
  expect(
    (mutation.documentUtf8 === undefined) !== (mutation.documentHex === undefined),
    `${mutation.name}: exactly one encoded context input is required`,
  );
  if (mutation.name === "bom-prefixed") {
    expect(mutation.documentUtf8?.startsWith("\uFEFF") === true, "context BOM vector is malformed");
  } else if (mutation.name === "malformed-utf8") {
    expectEqual(mutation.documentHex, "ff", "context malformed UTF-8 vector");
  } else if (mutation.documentUtf8 !== undefined && mutation.name !== "duplicate-top-level-key") {
    const document = JSON.parse(mutation.documentUtf8) as {
      rootBlockIds?: string[];
      blocks?: Array<{ id: string; links: string[]; mediaType: string; content: string }>;
    };
    const blockIds = new Set(document.blocks?.map((block) => block.id));
    if (mutation.name === "unknown-field") {
      expect(!validateContext(document), "unknown context field accepted by schema");
    } else if (mutation.name === "duplicate-block-id") {
      expect(blockIds.size !== document.blocks?.length, "duplicate context block id is missing");
    } else if (mutation.name === "missing-root-target") {
      expect(
        document.rootBlockIds?.some((id) => !blockIds.has(id)) === true,
        "missing root is present",
      );
    } else if (mutation.name === "missing-link-target") {
      expect(
        document.blocks?.some((block) => block.links.some((id) => !blockIds.has(id))) === true,
        "missing link is present",
      );
    } else if (mutation.name === "semantic-block-id") {
      expect(!validateContext(document), "semantic context block id accepted by schema");
    } else if (mutation.name === "json-depth-over-limit") {
      const content = document.blocks?.find(
        (block) => block.mediaType === "application/json",
      )?.content;
      expect(content?.startsWith("[".repeat(64)) === true, "deep JSON vector is not over limit");
      expectEqual(jsonMetrics(JSON.parse(content ?? "0")).depth, 65, "deep JSON mutation depth");
    } else if (mutation.name === "numeric-over-limit") {
      const content = document.blocks?.find(
        (block) => block.mediaType === "application/json",
      )?.content;
      const nested = JSON.parse(content ?? "{}") as { value?: number };
      expect(
        Math.abs(nested.value ?? 0) > Number.MAX_SAFE_INTEGER,
        "numeric over-limit vector is in range",
      );
    } else if (mutation.name === "invalid-nested-json") {
      const content = document.blocks?.find(
        (block) => block.mediaType === "application/json",
      )?.content;
      let parsed = true;
      try {
        JSON.parse(content ?? "");
      } catch {
        parsed = false;
      }
      expect(!parsed, "invalid nested JSON vector parsed successfully");
    }
  }
}
expect(
  vectors.contextCanonicalization.mutations
    .find((mutation) => mutation.name === "duplicate-top-level-key")
    ?.documentUtf8?.includes('"id":"urn:libre-ai:context:f03132333435363738393a3b3c3d3e3f"') ===
    true,
  "duplicate top-level key vector is missing its duplicate",
);
expect(
  vectors.contextCanonicalization.mutations
    .find((mutation) => mutation.name === "duplicate-nested-json-key")
    ?.documentUtf8?.includes('{\\"a\\":1,\\"a\\":2}') === true,
  "duplicate nested key vector is missing its duplicate",
);
expect(
  contextGolden.canonicalOutputUtf8.includes("333333333.3333333"),
  "context RFC 8785 number normalization vector is missing",
);
expect(!contextGolden.canonicalOutputUtf8.includes("revision"), "context revision leaked");
expect(
  !contextGolden.canonicalOutputUtf8.includes("excludedBlockIds"),
  "context exclusions leaked",
);
expect(
  (normalizedContext.blocks as Array<{ id: string; links: string[] }>).every(
    (block) =>
      /^blk_[a-f0-9]{32}$/.test(block.id) &&
      block.links.every((id) => /^blk_[a-f0-9]{32}$/.test(id)),
  ),
  "context block ids are not export-scoped",
);

const contextLimits = vectors.contextCanonicalization.limits;
for (const [dimension, expected] of Object.entries({
  maxInputBytes: 22_370_044,
  maxContentBytes: 16_777_216,
  maxJsonDepth: 64,
  maxJsonNodes: 100_000,
  maxBlocks: 1_000,
  maxLinksPerBlock: 1_000,
  maxTotalLinks: 16_384,
  maxNumberMagnitude: Number.MAX_SAFE_INTEGER,
})) {
  expectEqual(
    contextLimits[dimension as keyof typeof contextLimits],
    expected,
    `context ${dimension}`,
  );
}
expectEqual(
  vectors.contextCanonicalization.resourceFixtureProfile.name,
  "libre-ai.context-resource-fixture.v1",
  "context resource fixture profile",
);
expectEqual(
  vectors.contextCanonicalization.resourceFixtureProfile.serialization,
  "RFC 8785 JCS UTF-8 without BOM or trailing newline",
  "context resource fixture serialization",
);
const expectedResourceCases = [
  ["json-depth-at-limit", "jsonDepth", 64, "accepted", 1],
  ["json-depth-over-limit", "jsonDepth", 65, "invalid-document", 2],
  ["json-nodes-at-limit", "jsonNodes", 100_000, "accepted", 3],
  ["json-nodes-over-limit", "jsonNodes", 100_001, "invalid-document", 4],
  ["total-links-at-limit", "totalLinks", 16_384, "accepted", 5],
  ["total-links-over-limit", "totalLinks", 16_385, "invalid-document", 6],
];
expectEqual(
  JSON.stringify(
    vectors.contextCanonicalization.resourceCases.map((item) => [
      item.name,
      item.dimension,
      item.value,
      item.expected,
      item.fixtureOrdinal,
    ]),
  ),
  JSON.stringify(expectedResourceCases),
  "context resource cases",
);
const resourceLimitByDimension = {
  jsonDepth: contextLimits.maxJsonDepth,
  jsonNodes: contextLimits.maxJsonNodes,
  totalLinks: contextLimits.maxTotalLinks,
};
for (const item of vectors.contextCanonicalization.resourceCases) {
  const document = materializeContextResourceCase(item.fixtureOrdinal, item.dimension, item.value);
  const inputCanonical = canonicalJson(document);
  const inputBytes = encoder.encode(inputCanonical);
  expectEqual(
    inputBytes.byteLength,
    item.inputCanonicalByteLength,
    `${item.name} input byte length`,
  );
  expectEqual(sha256Hex(inputBytes), item.inputCanonicalSha256, `${item.name} input SHA-256`);
  expect(inputBytes.byteLength <= contextLimits.maxInputBytes, `${item.name}: raw input too large`);
  expect(
    validateContext(document),
    `${item.name}: resource input rejected by schema: ${ajv.errorsText(validateContext.errors)}`,
  );
  const metrics = contextResourceMetrics(document);
  expectEqual(metrics[item.dimension], item.value, `${item.name} materialized dimension`);
  if (item.expected === "accepted") {
    expect(
      metrics.jsonDepth <= contextLimits.maxJsonDepth &&
        metrics.jsonNodes <= contextLimits.maxJsonNodes &&
        metrics.totalLinks <= contextLimits.maxTotalLinks,
      `${item.name}: accepted fixture exceeds a semantic resource limit`,
    );
    const canonicalOutput = canonicalJson(normalizeContext(document));
    const outputBytes = encoder.encode(canonicalOutput);
    expectEqual(
      outputBytes.byteLength,
      item.canonicalOutputByteLength,
      `${item.name} output byte length`,
    );
    expectEqual(sha256Hex(outputBytes), item.canonicalOutputSha256, `${item.name} output SHA-256`);
    expect(
      validateContext(JSON.parse(canonicalOutput)),
      `${item.name}: canonical output rejected by schema`,
    );
  } else {
    expect(
      metrics[item.dimension] > resourceLimitByDimension[item.dimension],
      `${item.name}: rejected fixture does not exceed its limit`,
    );
    expect(
      item.canonicalOutputByteLength === undefined && item.canonicalOutputSha256 === undefined,
      `${item.name}: rejected fixture exposes an output`,
    );
  }
}
expectEqual(
  vectors.contextCanonicalization.numericCases.map((item) => item.name).join(","),
  [
    "max-safe-integer",
    "min-safe-integer",
    "binary64-rounding",
    "negative-zero",
    "small-exponent",
    "integer-over-limit",
    "negative-integer-over-limit",
    "exponent-over-limit",
  ].join(","),
  "context numeric cases",
);
for (const item of vectors.contextCanonicalization.numericCases) {
  const parsed = JSON.parse(item.inputUtf8) as { value: number };
  if (item.expected === "accepted") {
    expect(Math.abs(parsed.value) <= Number.MAX_SAFE_INTEGER, `${item.name}: number exceeds bound`);
    expectEqual(canonicalJson(parsed), item.canonicalUtf8, `${item.name} numeric JCS`);
  } else {
    expect(
      Math.abs(parsed.value) > Number.MAX_SAFE_INTEGER,
      `${item.name}: rejected number is in range`,
    );
  }
}

expectEqual(
  vectors.recoverySecretCodeProfile.name,
  "libre-ai.recovery-secret-code.v1",
  "recovery secret code profile",
);
expect(
  /^[a-f0-9]{32}$/.test(vectors.recoverySecretCodeProfile.case.display),
  "recovery secret code display is not canonical hexadecimal",
);
expectEqual(
  vectors.recoverySecretCodeProfile.case.display,
  vectors.recoverySecretCodeProfile.case.bytesHex,
  "recovery secret code round-trip",
);
expectEqual(vectors.recoverySecretCodeProfile.case.byteLength, 16, "recovery secret code length");
expectEqual(
  vectors.recoverySecretCodeProfile.case.bytesHex,
  vectors.golden.recoverySecret.hex,
  "golden recovery secret profile",
);
expect(
  !("recoverySecretTextProfile" in vectors),
  "ambiguous text recovery profile must not exist in v2",
);

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(
  `Notebook Core v2 Gate A verified: closed WIT, byte-identical catalog copies and reviewed files, AAD/digest/AES-GCM, ${vectors.mutations.length} backup and ${vectors.contextCanonicalization.mutations.length} context mutations, 6 replayable resource boundaries, one recovery profile; Gate A is approved and Gate B remains pending`,
);
