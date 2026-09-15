import { constants } from "node:fs";
import { open } from "node:fs/promises";
import Ajv from "ajv";
import type { PublicationAuthority, PublicationTrust } from "./publication-authority";
import { authorizePublication } from "./publication-authority";
import type { RepositoryContractV1 } from "./repository-contract";

interface Policy {
  schemaVersion: string;
  authorities: (PublicationTrust & { slug: string })[];
}
interface ReceiptInput {
  schemaVersion: string;
  receipts: { slug: string; bytes: string; signature: string }[];
}
export interface PublicationSelection {
  contracts: RepositoryContractV1[];
  authorities: ReadonlyMap<string, PublicationAuthority>;
}
const ajv = new Ajv({ strict: true });
const slug = { type: "string", minLength: 1, maxLength: 64 };
const policyValidator = ajv.compile<Policy>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "authorities"],
  properties: {
    schemaVersion: { const: "publication-policy.v1" },
    authorities: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slug", "publicKey", "expectedRevision", "expectedReceiptDigest"],
        properties: {
          slug,
          publicKey: { type: "string", maxLength: 4096 },
          expectedRevision: { type: "string", pattern: "^[a-f0-9]{40}$" },
          expectedReceiptDigest: { type: "string", pattern: "^[a-f0-9]{64}$" },
        },
      },
    },
  },
});
const inputValidator = ajv.compile<ReceiptInput>({
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "receipts"],
  properties: {
    schemaVersion: { const: "publication-input.v1" },
    receipts: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slug", "bytes", "signature"],
        properties: {
          slug,
          bytes: { type: "string", maxLength: 65536 },
          signature: { type: "string", maxLength: 88 },
        },
      },
    },
  },
});
/** The operator supplies policy independently of the contracts and receipt bundle. */
export function selectPublication(
  contracts: RepositoryContractV1[],
  policy: unknown,
  input: unknown,
): PublicationSelection {
  if (!policyValidator(policy) || !inputValidator(input))
    throw new Error("publication-input-blocked");
  const catalog = new Map(contracts.map((contract) => [contract.slug, contract]));
  const policies = new Map(policy.authorities.map((trust) => [trust.slug, trust]));
  const receipts = new Map(input.receipts.map((receipt) => [receipt.slug, receipt]));
  if (
    catalog.size !== contracts.length ||
    policies.size !== policy.authorities.length ||
    receipts.size !== input.receipts.length ||
    policies.size !== receipts.size
  )
    throw new Error("publication-input-blocked");
  const authorities = new Map<string, PublicationAuthority>();
  const selected: RepositoryContractV1[] = [];
  for (const [name, trust] of policies) {
    const contract = catalog.get(name);
    const receipt = receipts.get(name);
    if (!contract || !receipt) throw new Error("publication-input-blocked");
    authorities.set(name, authorizePublication(contract, receipt.bytes, receipt.signature, trust));
    selected.push(contract);
  }
  return { contracts: selected.sort((a, b) => a.slug.localeCompare(b.slug)), authorities };
}
export async function readBoundedJson(path: string | URL): Promise<unknown> {
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK | constants.O_NOFOLLOW);
  try {
    if (!(await file.stat()).isFile()) throw new Error("publication-input-blocked");
    const limit = 2 * 1024 * 1024;
    const buffer = Buffer.alloc(limit + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await file.read(buffer, offset, buffer.length - offset, null);
      if (bytesRead === 0) break;
      offset += bytesRead;
    }
    if (offset > limit) throw new Error("publication-input-blocked");
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, offset)));
  } finally {
    await file.close();
  }
}
export async function loadPublication(
  contracts: RepositoryContractV1[],
  policyPath?: string,
  receiptsPath?: string,
): Promise<PublicationSelection> {
  if (!policyPath && !receiptsPath) return { contracts: [], authorities: new Map() };
  if (!policyPath || !receiptsPath) throw new Error("publication-input-blocked");
  const [policy, receipts] = await Promise.all([
    readBoundedJson(policyPath),
    readBoundedJson(receiptsPath),
  ]);
  return selectPublication(contracts, policy, receipts);
}
