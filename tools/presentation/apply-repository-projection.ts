import { createHash } from "node:crypto";
import {
  assertPublication,
  type PublicationAuthority,
} from "../../portfolio/publication-authority";
import type { PublicationSelection } from "../../portfolio/publication-input";
import { contractDigest, type RepositoryContractV1 } from "../../portfolio/repository-contract";

export const LANDING_BEGIN = "<!-- libre-ai:repository-landing:begin -->";
export const LANDING_END = "<!-- libre-ai:repository-landing:end -->";
export interface LandingMaterial {
  quickStart: string;
  proofAsset: Uint8Array;
  captureReceipt: string;
  quickStartReceipt: string;
  badges: string[];
}
export interface RepositoryLanding {
  readonly kind?: never;
}
interface LandingSnapshot {
  contract: RepositoryContractV1;
  authority: PublicationAuthority;
  dependencies: { contract: RepositoryContractV1; authority: PublicationAuthority }[];
  material: LandingMaterial;
  assetPath: string;
}
const grants = new WeakMap<RepositoryLanding, LandingSnapshot>();
const hash = (bytes: string | Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const digestPattern = /^[a-f0-9]{64}$/;
const revisionPattern = /^[a-f0-9]{40}$/;
function blocked(): never {
  throw new Error("repository-landing-blocked");
}
function object(value: unknown, keys: readonly string[]): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).sort().join(",") !== [...keys].sort().join(",")
  )
    return blocked();
  return value as Record<string, unknown>;
}
function json(bytes: string): unknown {
  if (typeof bytes !== "string" || Buffer.byteLength(bytes) > 32 * 1024) return blocked();
  try {
    return JSON.parse(bytes);
  } catch {
    return blocked();
  }
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return blocked();
  return value;
}
function publicText(value: string): string {
  if (
    /(?<![\p{L}\p{N}])(?:phase|lifecycle|agentic|orchestrator|migration diary|journal de migration|stars?|étoiles?)(?![\p{L}\p{N}])|\d\s*%/iu.test(
      value.normalize("NFKC"),
    )
  )
    return blocked();
  return markdownText(value);
}
// Names already passed the exact canonical-name contract check. They are
// identities, not marketing jargon, and still require Markdown escaping.
function markdownText(value: string): string {
  return value.replace(/[\\`*_[\]{}()#!|]/g, "\\$&");
}
function html(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function admitted(selection: PublicationSelection, slug: string) {
  if (!selection || !Array.isArray(selection.contracts) || !(selection.authorities instanceof Map))
    return blocked();
  const matches = selection.contracts.filter((contract) => contract.slug === slug);
  const contract = matches[0];
  const authority = selection.authorities.get(slug);
  if (matches.length !== 1 || !contract || !authority) return blocked();
  assertPublication(contract, authority);
  return { contract, authority };
}
function receiptEvidence(
  contract: RepositoryContractV1,
  source: string,
  bytes: string,
  expectedDigest: unknown,
) {
  if (typeof bytes !== "string" || Buffer.byteLength(bytes) > 32768) return blocked();
  const digest = hash(bytes);
  const evidence = contract.evidence.find(
    (item) => item.source === source && item.contentDigest === digest,
  );
  if (!evidence || digest !== expectedDigest) return blocked();
  return evidence;
}
function validDate(value: unknown, latest: string): boolean {
  return (
    typeof value === "string" &&
    /^\d{4}-\d\d-\d\dT/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    Date.parse(value) <= Date.parse(latest)
  );
}
function passiveContainer(bytes: Uint8Array, media: unknown, path: string): void {
  const data = Buffer.from(bytes);
  if (!data.length || data.length > 8 * 1024 * 1024) blocked();
  if (media === "image/png" && path.endsWith(".png")) {
    if (
      data.length < 33 ||
      !data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      data.toString("ascii", 12, 16) !== "IHDR" ||
      data.readUInt32BE(16) < 1 ||
      data.readUInt32BE(20) < 1 ||
      data.readUInt32BE(16) > 16384 ||
      data.readUInt32BE(20) > 16384
    )
      blocked();
  } else if (media === "image/webp" && path.endsWith(".webp")) {
    if (
      data.length < 20 ||
      data.toString("ascii", 0, 4) !== "RIFF" ||
      data.toString("ascii", 8, 12) !== "WEBP" ||
      data.readUInt32LE(4) + 8 !== data.length ||
      !["VP8 ", "VP8L", "VP8X"].includes(data.toString("ascii", 12, 16))
    )
      blocked();
  } else blocked();
}

/** The caller pins review bytes independently; repository material cannot appoint its reviewer. */
export function authorizeRepositoryLanding(
  selection: PublicationSelection,
  material: LandingMaterial,
  reviewBytes: string,
  expectedReviewDigest: string,
): RepositoryLanding {
  try {
    if (
      typeof reviewBytes !== "string" ||
      Buffer.byteLength(reviewBytes) > 32768 ||
      !digestPattern.test(expectedReviewDigest) ||
      hash(reviewBytes) !== expectedReviewDigest
    )
      return blocked();
    const review = object(json(reviewBytes), [
      "schemaVersion",
      "slug",
      "contractDigest",
      "assetPath",
      "captureSource",
      "quickStartSource",
      "captureReceiptDigest",
      "quickStartReceiptDigest",
    ]);
    if (review.schemaVersion !== "repository-landing-review.v1") return blocked();
    const selected = admitted(selection, text(review.slug));
    const contract = structuredClone(selected.contract);
    if (review.contractDigest !== contractDigest(contract) || contract.dependencies.length > 3)
      return blocked();
    for (const copy of [
      contract.benefit,
      contract.audience,
      contract.differentiator,
      contract.outcome,
      contract.limitation,
    ]) {
      publicText(copy.en);
      publicText(copy.fr);
    }
    object(material, ["quickStart", "proofAsset", "captureReceipt", "quickStartReceipt", "badges"]);
    if (
      typeof material.quickStart !== "string" ||
      !material.quickStart.trim() ||
      material.quickStart.length > 4096 ||
      !(material.proofAsset instanceof Uint8Array) ||
      material.proofAsset.length > 8 * 1024 * 1024 ||
      !Array.isArray(material.badges) ||
      material.badges.length > 4 ||
      new Set(material.badges).size !== material.badges.length ||
      material.badges.some((source) => !contract.evidence.some((e) => e.source === source))
    )
      return blocked();
    const captureEvidence = receiptEvidence(
      contract,
      text(review.captureSource),
      material.captureReceipt,
      review.captureReceiptDigest,
    );
    const quickEvidence = receiptEvidence(
      contract,
      text(review.quickStartSource),
      material.quickStartReceipt,
      review.quickStartReceiptDigest,
    );
    const capture = object(json(material.captureReceipt), [
      "schemaVersion",
      "kind",
      "revision",
      "recipeDigest",
      "assetDigest",
      "mediaType",
      "result",
      "capturedAt",
    ]);
    const quick = object(json(material.quickStartReceipt), [
      "schemaVersion",
      "revision",
      "recipeDigest",
      "commandDigest",
      "environment",
      "result",
      "verifiedAt",
    ]);
    if (
      capture.schemaVersion !== "product-capture.v1" ||
      !["product-output", "product-screenshot"].includes(text(capture.kind)) ||
      capture.result !== "passed" ||
      !revisionPattern.test(text(capture.revision)) ||
      !digestPattern.test(text(capture.recipeDigest)) ||
      capture.assetDigest !== hash(material.proofAsset) ||
      !validDate(capture.capturedAt, captureEvidence.verifiedAt) ||
      !captureEvidence.source.includes(`/blob/${capture.revision}/`) ||
      quick.schemaVersion !== "anonymous-quick-start.v1" ||
      quick.environment !== "anonymous-clean" ||
      quick.result !== "passed" ||
      !revisionPattern.test(text(quick.revision)) ||
      !digestPattern.test(text(quick.recipeDigest)) ||
      quick.commandDigest !== hash(material.quickStart) ||
      !validDate(quick.verifiedAt, quickEvidence.verifiedAt) ||
      !quickEvidence.source.includes(`/blob/${quick.revision}/`)
    )
      return blocked();
    const assetPath = text(review.assetPath);
    if (!/^docs\/assets\/product-proof\.(?:png|webp)$/.test(assetPath)) return blocked();
    passiveContainer(material.proofAsset, capture.mediaType, assetPath);
    const dependencies = contract.dependencies.map((slug) => {
      const dependency = admitted(selection, slug);
      return { ...dependency, contract: structuredClone(dependency.contract) };
    });
    const grant = Object.freeze({});
    grants.set(grant, {
      contract,
      authority: selected.authority,
      dependencies,
      material: {
        ...material,
        proofAsset: Buffer.from(material.proofAsset),
        badges: [...material.badges],
      },
      assetPath,
    });
    return grant;
  } catch {
    return blocked();
  }
}
function snapshot(grant: RepositoryLanding): LandingSnapshot {
  const value = grants.get(grant);
  if (!value) return blocked();
  assertPublication(value.contract, value.authority);
  for (const dependency of value.dependencies)
    assertPublication(dependency.contract, dependency.authority);
  return value;
}

export function renderRepositoryLanding(grant: RepositoryLanding, locale: "en" | "fr"): string {
  if (locale !== "en" && locale !== "fr") return blocked();
  const { contract, dependencies, material, assetPath } = snapshot(grant);
  const french = locale === "fr";
  const badges = material.badges.map((source) => {
    const evidence = contract.evidence.find((e) => e.source === source);
    if (!evidence) return blocked();
    return `- [${publicText(evidence.label[locale])}](<${evidence.source}>) — ${evidence.verifiedAt}\n  ${publicText(evidence.limitation[locale])}\n  SHA-256: \`${evidence.contentDigest}\``;
  });
  return [
    LANDING_BEGIN,
    "",
    french ? "[English](README.md) · **Français**" : "**English** · [Français](README.fr.md)",
    "",
    `# ${markdownText(contract.displayName)}`,
    "",
    publicText(contract.benefit[locale]),
    "",
    `![${publicText(contract.outcome[locale])}](${assetPath})`,
    "",
    `## ${french ? "Résultat" : "Outcome"}`,
    "",
    publicText(contract.outcome[locale]),
    "",
    publicText(contract.limitation[locale]),
    "",
    `## ${french ? "Démarrage rapide" : "Quick start"}`,
    "",
    `<pre><code>${html(material.quickStart)}</code></pre>`,
    "",
    `## ${french ? "Confiance" : "Trust"}`,
    "",
    ...badges,
    "",
    ...(dependencies.length
      ? [
          `### ${french ? "Fonctionne avec" : "Works with"}`,
          "",
          ...dependencies.map(
            ({ contract: dependency }) =>
              `- [${markdownText(dependency.displayName)}](https://github.com/libre-ai/${dependency.slug})`,
          ),
          "",
        ]
      : []),
    `## ${french ? "Contribuer" : "Contribute"}`,
    "",
    `- [${french ? "Comportement du produit" : "Product behavior"}](https://github.com/libre-ai/${contract.slug}/issues)`,
    `- [${french ? "Politique commune" : "Shared policy"}](https://github.com/libre-ai/governance/issues)`,
    "",
    `## ${french ? "Référence" : "Reference"}`,
    "",
    `[${markdownText(contract.displayName)}](https://github.com/libre-ai/${contract.slug})`,
    "",
    ...contract.evidence.map(
      (e) => `- [${publicText(e.label[locale])}](<${e.source}>) — ${e.verifiedAt}`,
    ),
    "",
    LANDING_END,
  ].join("\n");
}
export function renderRepositoryLandingPair(grant: RepositoryLanding): { en: string; fr: string } {
  return { en: renderRepositoryLanding(grant, "en"), fr: renderRepositoryLanding(grant, "fr") };
}
export function repositoryProofAsset(grant: RepositoryLanding): {
  path: string;
  bytes: Uint8Array;
} {
  const value = snapshot(grant);
  return { path: value.assetPath, bytes: Uint8Array.from(value.material.proofAsset) };
}
/** Conservative lexical guard, not a Markdown parser or outside-block admission. */
function visibleMarkerContext(source: string, index: number, refuseHtml = false): boolean {
  let fence: { character: string; length: number } | null = null;
  let comment = false;
  for (const line of source.slice(0, index).split(/\r?\n/)) {
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence !== null) {
      if (
        delimiter &&
        delimiter[1]?.[0] === fence.character &&
        delimiter[1].length >= fence.length &&
        !delimiter[2]?.trim()
      )
        fence = null;
      continue;
    }
    if (!comment && delimiter) {
      fence = { character: delimiter[1]?.[0] ?? "", length: delimiter[1]?.length ?? 0 };
      continue;
    }
    let offset = 0;
    while (offset < line.length) {
      const token = comment ? "-->" : "<!--";
      const next = line.indexOf(token, offset);
      // An enclosing raw HTML block can hide the entire generated landing.
      // Conservatively refuse HTML prefixes instead of claiming full Markdown parsing.
      if (
        refuseHtml &&
        !comment &&
        /<(?:\/?[a-z]|[!?])/i.test(line.slice(offset, next === -1 ? undefined : next))
      )
        return false;
      if (next === -1) break;
      comment = !comment;
      offset = next + token.length;
    }
  }
  return fence === null && !comment;
}

/** Pure replacement protocol: no filesystem writes and no caller-supplied generated Markdown. */
export function updateRepositoryLanding(
  source: string,
  grant: RepositoryLanding,
  locale: "en" | "fr",
): string {
  if (
    typeof source !== "string" ||
    Buffer.byteLength(source) > 2 * 1024 * 1024 ||
    source.split(LANDING_BEGIN).length !== 2 ||
    source.split(LANDING_END).length !== 2
  )
    return blocked();
  const begin = source.indexOf(LANDING_BEGIN);
  const end = source.indexOf(LANDING_END);
  for (const [index, marker] of [
    [begin, LANDING_BEGIN],
    [end, LANDING_END],
  ] as const) {
    if (
      (index > 0 && source[index - 1] !== "\n") ||
      !(
        source.length === index + marker.length ||
        source[index + marker.length] === "\n" ||
        source.slice(index + marker.length, index + marker.length + 2) === "\r\n"
      )
    )
      return blocked();
  }
  if (
    begin >= end ||
    !visibleMarkerContext(source, begin, true) ||
    !visibleMarkerContext(source, end)
  )
    return blocked();
  const generated = renderRepositoryLanding(grant, locale);
  return source.slice(0, begin) + generated + source.slice(end + LANDING_END.length);
}
