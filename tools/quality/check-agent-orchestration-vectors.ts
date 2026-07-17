import { createHash, createPublicKey, verify } from "node:crypto";
import {
  type AgentReviewFacts,
  type AgentReviewQuorumFacts,
  evaluateAgentReviewQuorum,
} from "../../packages/contracts/src/agent-review-quorum";
import {
  type AcceptedEventCollision,
  evaluateOrchestratorEventChain,
  type OrchestratorCausalEventFacts,
} from "../../packages/contracts/src/orchestrator-event-chain";

const root = new URL("../../", import.meta.url);
const fixtureRoot = new URL("contracts/fixtures/agent-orchestration-v1/", root);
const failures: string[] = [];

type QuorumDocument = Omit<AgentReviewQuorumFacts, "reviews"> & {
  baseReviews: AgentReviewFacts[];
  cases: Array<{
    id: string;
    mutation: {
      review: number;
      field: keyof AgentReviewFacts;
      value?: unknown;
      copyFromReview?: number;
    } | null;
    rootMutation: {
      field:
        | "lineageSignatureValid"
        | "lineageComplete"
        | "lineageSubjectDigest"
        | "diversityRequirements";
      value: boolean | string | AgentReviewQuorumFacts["diversityRequirements"];
    } | null;
    expected: string;
  }>;
};

const quorum = (await Bun.file(
  new URL("quorum-vectors.v1.json", fixtureRoot),
).json()) as QuorumDocument;
for (const vector of quorum.cases) {
  const reviews = structuredClone(quorum.baseReviews);
  if (vector.mutation !== null) {
    const target = reviews[vector.mutation.review];
    const source =
      vector.mutation.copyFromReview === undefined
        ? vector.mutation.value
        : reviews[vector.mutation.copyFromReview]?.[vector.mutation.field];
    if (target === undefined || source === undefined) {
      failures.push(`${vector.id}: invalid quorum mutation`);
      continue;
    }
    Object.assign(target, { [vector.mutation.field]: source });
  }
  const facts: AgentReviewQuorumFacts = {
    evaluationTime: quorum.evaluationTime,
    subjectDigest: quorum.subjectDigest,
    evidenceDigests: quorum.evidenceDigests,
    lineageDigest: quorum.lineageDigest,
    lineageSubjectDigest: quorum.lineageSubjectDigest,
    lineageSignatureValid: quorum.lineageSignatureValid,
    lineageComplete: quorum.lineageComplete,
    contributorAgentIds: quorum.contributorAgentIds,
    diversityRequirements: quorum.diversityRequirements,
    reviews,
  };
  if (vector.rootMutation !== null) {
    Object.assign(facts, { [vector.rootMutation.field]: vector.rootMutation.value });
  }
  const actual = evaluateAgentReviewQuorum(facts);
  if (actual !== vector.expected)
    failures.push(`${vector.id}: expected ${vector.expected}, got ${actual}`);
}

type EventScenario = {
  previous: OrchestratorCausalEventFacts | null;
  current: OrchestratorCausalEventFacts;
};
const eventChains = (await Bun.file(
  new URL("event-chain-vectors.v1.json", fixtureRoot),
).json()) as {
  pair: EventScenario;
  genesis: EventScenario;
  cases: Array<{
    id: string;
    scenario: "pair" | "genesis";
    mutations: Array<{ target: "previous" | "current"; path: string; value: unknown }>;
    collision: "none" | "exact-current" | "same-id-different-digest" | "same-sequence-different-id";
    expected: string;
  }>;
};
function mutatePath(target: unknown, path: string, value: unknown): void {
  const segments = path.split(".");
  const property = segments.pop();
  if (property === undefined) throw new Error("empty event mutation path");
  let cursor = target as Record<string, unknown>;
  for (const segment of segments) {
    const next = cursor[segment];
    if (typeof next !== "object" || next === null) throw new Error(`missing event path ${path}`);
    cursor = next as Record<string, unknown>;
  }
  cursor[property] = value;
}
for (const vector of eventChains.cases) {
  const scenario = structuredClone(eventChains[vector.scenario]);
  for (const mutation of vector.mutations) {
    const target = scenario[mutation.target];
    if (target === null) {
      failures.push(`${vector.id}: null event mutation target`);
      continue;
    }
    mutatePath(target, mutation.path, mutation.value);
  }
  let collision: AcceptedEventCollision | null = null;
  if (vector.collision === "exact-current") {
    collision = {
      id: scenario.current.id,
      sequence: scenario.current.sequence,
      eventDigest: scenario.current.eventDigest,
    };
  } else if (vector.collision === "same-id-different-digest") {
    collision = {
      id: scenario.current.id,
      sequence: scenario.current.sequence,
      eventDigest: "b".repeat(64),
    };
  } else if (vector.collision === "same-sequence-different-id") {
    collision = {
      id: "urn:libre-ai:event:collision",
      sequence: scenario.current.sequence,
      eventDigest: "b".repeat(64),
    };
  }
  const actual = evaluateOrchestratorEventChain(scenario.previous, scenario.current, collision);
  if (actual !== vector.expected)
    failures.push(`${vector.id}: expected ${vector.expected}, got ${actual}`);
}

type AuthzVector = {
  id: string;
  role: string;
  operation: string;
  tenant: string;
  resourceTenant: string;
  tokenMission?: string;
  resourceMission?: string;
  tokenRun?: string;
  resourceRun?: string;
  tokenPlanDigest?: string;
  resourcePlanDigest?: string;
  tokenAuthorizationDigest?: string;
  resourceAuthorizationDigest?: string;
  tokenSubjectDigest?: string;
  resourceSubjectDigest?: string;
  subjectType?: string;
  quorumValid?: boolean;
  expected: "allow" | "deny";
};

function same(left: string | undefined, right: string | undefined): boolean {
  return left !== undefined && left === right;
}

function authorize(vector: AuthzVector): boolean {
  if (vector.tenant !== vector.resourceTenant) return false;
  const missionBound = same(vector.tokenMission, vector.resourceMission);
  switch (vector.role) {
    case "author-agent":
      return (
        missionBound &&
        (vector.operation === "read-own-run" ||
          (vector.operation === "submit-plan" && vector.subjectType === "execution-plan") ||
          (vector.operation === "submit-result" && vector.subjectType === "mission-result"))
      );
    case "reviewer-agent": {
      if (!missionBound || !same(vector.tokenSubjectDigest, vector.resourceSubjectDigest))
        return false;
      return (
        vector.operation === "read-review-subject" ||
        (vector.operation === "submit-plan-review" && vector.subjectType === "execution-plan") ||
        (vector.operation === "submit-result-review" && vector.subjectType === "mission-result")
      );
    }
    case "mission-service":
      if (!missionBound) return false;
      if (vector.operation === "compute-quorum") return true;
      if (!vector.quorumValid || vector.resourceSubjectDigest === undefined) return false;
      return (
        (vector.operation === "issue-execution" && vector.subjectType === "execution-plan") ||
        (vector.operation === "validate-result" && vector.subjectType === "mission-result")
      );
    case "orchestrator": {
      const authorityBound =
        missionBound &&
        same(vector.tokenPlanDigest, vector.resourcePlanDigest) &&
        same(vector.tokenAuthorizationDigest, vector.resourceAuthorizationDigest);
      if (vector.operation === "start") return authorityBound;
      return (
        authorityBound &&
        same(vector.tokenRun, vector.resourceRun) &&
        ["report-event", "submit-result"].includes(vector.operation)
      );
    }
    case "harness":
      return (
        missionBound &&
        same(vector.tokenRun, vector.resourceRun) &&
        same(vector.tokenPlanDigest, vector.resourcePlanDigest) &&
        same(vector.tokenAuthorizationDigest, vector.resourceAuthorizationDigest) &&
        [
          "invoke-planned-tool",
          "attest-lineage",
          "attest-review",
          "attest-isolation",
          "report-budget",
        ].includes(vector.operation)
      );
    case "operator":
      return ["start", "pause", "resume", "cancel", "answer-decision", "read", "export"].includes(
        vector.operation,
      );
    default:
      return false;
  }
}

const authz = (await Bun.file(new URL("authz-vectors.v1.json", fixtureRoot)).json()) as {
  cases: AuthzVector[];
};
for (const vector of authz.cases) {
  const actual = authorize(vector) ? "allow" : "deny";
  if (actual !== vector.expected)
    failures.push(`${vector.id}: expected ${vector.expected}, got ${actual}`);
}
if (!authz.cases.some((vector) => vector.expected === "allow"))
  failures.push("authz: no allow vector");
if (!authz.cases.some((vector) => vector.expected === "deny"))
  failures.push("authz: no deny vector");

const transitions = (await Bun.file(
  new URL("mission-transition-vectors.v1.json", fixtureRoot),
).json()) as {
  allowed: Array<[string, string]>;
  denied: Array<[string, string]>;
  terminal: string[];
};
const transitionKey = ([from, to]: [string, string]) => `${from}->${to}`;
const allowedTransitions = new Set(transitions.allowed.map(transitionKey));
if (allowedTransitions.size !== transitions.allowed.length)
  failures.push("transitions: duplicate allow");
for (const denied of transitions.denied) {
  if (allowedTransitions.has(transitionKey(denied))) {
    failures.push(`${transitionKey(denied)}: both allowed and denied`);
  }
}
for (const terminal of transitions.terminal) {
  if (transitions.allowed.some(([from]) => from === terminal)) {
    failures.push(`${terminal}: terminal state has outgoing transition`);
  }
}
for (const required of [
  "proposed->assessed",
  "plan-review->authorized",
  "plan-rejected->plan-review",
  "result-submitted->result-review",
  "result-review->validated",
  "rejected->result-submitted",
]) {
  if (!allowedTransitions.has(required)) failures.push(`${required}: required transition missing`);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non-finite JSON number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
      .join(",")}}`;
  }
  throw new TypeError(`unsupported JSON value: ${typeof value}`);
}

const digests = (await Bun.file(new URL("digest-vectors.v1.json", fixtureRoot)).json()) as {
  vectors: Array<{
    id: string;
    digestField: string;
    unsignedPayload: Record<string, unknown>;
    expectedDigest: string;
  }>;
};
for (const vector of digests.vectors) {
  if (Object.hasOwn(vector.unsignedPayload, vector.digestField)) {
    failures.push(`${vector.id}: digest field remains in preimage`);
    continue;
  }
  const actual = createHash("sha256")
    .update(canonicalJson(vector.unsignedPayload), "utf8")
    .digest("hex");
  if (actual !== vector.expectedDigest) failures.push(`${vector.id}: digest mismatch`);
}

const signatures = (await Bun.file(new URL("signature-vectors.v1.json", fixtureRoot)).json()) as {
  vectors: Array<{
    id: string;
    digestField: string;
    unsignedPayload: Record<string, unknown>;
    expectedDigest: string;
    publicKey: string;
    signature: string;
  }>;
};
const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
for (const vector of signatures.vectors) {
  if (Object.hasOwn(vector.unsignedPayload, vector.digestField)) {
    failures.push(`${vector.id}: digest field remains in preimage`);
    continue;
  }
  const digest = createHash("sha256")
    .update(canonicalJson(vector.unsignedPayload), "utf8")
    .digest();
  if (digest.toString("hex") !== vector.expectedDigest) {
    failures.push(`${vector.id}: digest mismatch`);
    continue;
  }
  const rawKey = Buffer.from(vector.publicKey, "base64url");
  const signature = Buffer.from(vector.signature, "base64url");
  const key = createPublicKey({
    key: Buffer.concat([spkiPrefix, rawKey]),
    format: "der",
    type: "spki",
  });
  const message = Buffer.concat([
    Buffer.from(String(vector.unsignedPayload.schemaVersion), "utf8"),
    Buffer.from([0]),
    digest,
  ]);
  if (
    rawKey.byteLength !== 32 ||
    signature.byteLength !== 64 ||
    !verify(null, message, key, signature)
  ) {
    failures.push(`${vector.id}: Ed25519 verification failed`);
  }
}

const policy = await Bun.file(new URL("contracts/authz/agent-runs-v1.datalog", root)).text();
for (const required of [
  "token_mission",
  "token_subject_digest",
  "token_run",
  "token_plan_digest",
  "token_authorization_digest",
  "quorum_valid",
  "deny if true",
]) {
  if (!policy.includes(required)) failures.push(`authz policy: missing ${required}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Agent orchestration vectors verified: ${quorum.cases.length} quorum, ${eventChains.cases.length} event-chain, ${authz.cases.length} authz, ${transitions.allowed.length + transitions.denied.length} transition, ${digests.vectors.length} digest and ${signatures.vectors.length} signature cases`,
);
