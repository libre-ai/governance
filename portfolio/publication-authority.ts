import { createHash, createPublicKey, verify } from "node:crypto";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { RepositoryContractV1 } from "./repository-contract";
import { contractDigest, validateRepositoryContract } from "./repository-contract";

/** Trusted caller policy, never accepted from a repository contract or receipt itself. */
export interface PublicationTrust {
  publicKey: string;
  expectedRevision: string;
  expectedReceiptDigest: string;
}
export interface PublicationAuthority {
  readonly kind?: never;
}
interface Receipt {
  schemaVersion: string;
  slug: string;
  contractDigest: string;
  revision: string;
  evidenceSources: string[];
  verifiedAt: string;
  admission:
    | { kind: "certain" }
    | { kind: "conditional"; gate: string; verdict: "admit"; verdictDigest: string };
}
const ajv = new Ajv({ strict: true });
addFormats(ajv);
const hash = { type: "string", pattern: "^[a-f0-9]{64}$" };
const receiptValidator = ajv.compile<Receipt>({
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "slug",
    "contractDigest",
    "revision",
    "evidenceSources",
    "verifiedAt",
    "admission",
  ],
  properties: {
    schemaVersion: { const: "portfolio-receipt.v1" },
    slug: { type: "string" },
    contractDigest: hash,
    revision: { type: "string", pattern: "^[a-f0-9]{40}$" },
    evidenceSources: { type: "array", minItems: 1, uniqueItems: true, items: { type: "string" } },
    verifiedAt: { type: "string", format: "date-time" },
    admission: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["kind"],
          properties: { kind: { const: "certain" } },
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["kind", "gate", "verdict", "verdictDigest"],
          properties: {
            kind: { const: "conditional" },
            gate: { type: "string" },
            verdict: { const: "admit" },
            verdictDigest: hash,
          },
        },
      ],
    },
  },
});
const grants = new WeakMap<PublicationAuthority, string>();
export function authorizePublication(
  contract: RepositoryContractV1,
  receiptBytes: string,
  signature: string,
  trust: PublicationTrust,
): PublicationAuthority {
  try {
    if (
      !validateRepositoryContract(contract) ||
      contract.proof.kind !== "evidence" ||
      !/^[A-Za-z0-9+/]{86}==$/.test(signature)
    )
      throw new Error("invalid");
    const receipt: unknown = JSON.parse(receiptBytes);
    if (!receiptValidator(receipt)) throw new Error("invalid");
    const key = createPublicKey(trust.publicKey);
    if (
      key.asymmetricKeyType !== "ed25519" ||
      !verify(null, Buffer.from(receiptBytes), key, Buffer.from(signature, "base64"))
    )
      throw new Error("signature");
    if (
      createHash("sha256").update(receiptBytes).digest("hex") !== trust.expectedReceiptDigest ||
      receipt.revision !== trust.expectedRevision ||
      receipt.slug !== contract.slug ||
      receipt.contractDigest !== contractDigest(contract)
    )
      throw new Error("binding");
    const receiptTime = Date.parse(receipt.verifiedAt);
    if (
      !Number.isFinite(receiptTime) ||
      JSON.stringify([...receipt.evidenceSources].sort()) !==
        JSON.stringify(contract.evidence.map((e) => e.source).sort()) ||
      contract.evidence.some(
        (e) => !Number.isFinite(Date.parse(e.verifiedAt)) || Date.parse(e.verifiedAt) > receiptTime,
      )
    )
      throw new Error("evidence");
    if (
      contract.admission.kind !== receipt.admission.kind ||
      (contract.admission.kind === "conditional" &&
        (receipt.admission.kind !== "conditional" ||
          receipt.admission.gate !== contract.admission.gate))
    )
      throw new Error("admission");
    const authority = Object.freeze({});
    grants.set(authority, contractDigest(contract));
    return authority;
  } catch {
    throw new Error("publication-proof-required");
  }
}
export function assertPublication(
  contract: RepositoryContractV1,
  authority?: PublicationAuthority,
): void {
  if (
    !validateRepositoryContract(contract) ||
    !authority ||
    grants.get(authority) !== contractDigest(contract)
  )
    throw new Error("publication-proof-required");
}
