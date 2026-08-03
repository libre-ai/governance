/**
 * Toolchain source gate: every `BUN_ARCHIVE_URL` installed by a workflow of
 * the fleet must be the `durableRelease.linuxX64Asset` of the canonical
 * `toolchains/bun.json`, and its `BUN_ARCHIVE_SHA256` the digest that policy
 * declares for the linux-x64 asset.
 *
 * Why here and not in `tools/quality/check-toolchain.ts`: that script resolves
 * the policy through the PINNED governance git-dep
 * (`node_modules/@libre-ai/governance/toolchains/bun.json`), so a repository
 * that has not bumped its pin would compare its stale workflow against an
 * equally stale policy — green while fetching from a dead source. The
 * population a per-repository check covers and the population at risk are
 * disjoint at the moment the source dies. The comparison only means something
 * against the LIVE canonical, which exists in exactly one place: this
 * repository. Same class of invariant, same plumbing and same failure shape as
 * `ecosystem/check-fleet-pins.ts` — one declared fleet value, many observed
 * per-repository copies — so it lives beside it and runs in the same job.
 *
 * What it deliberately also checks: the digest. `sha256sum --check --strict`
 * already runs in every workflow, but it compares the download to the digest
 * declared in the SAME file — a self-referential check that stays green when
 * URL and digest are changed together. Only a comparison to the canonical
 * policy turns "the download matches what this workflow claims" into "this
 * workflow claims what the authority declares".
 */

/**
 * Repositories excluded by name, with the reason. The hub was archived
 * read-only by the owner on 2026-07-30 (ADR-0020, gate-acceptance-log line
 * 3.8): its workflow still carries the pre-migration URL and CANNOT be
 * amended. Sweeping it would make this gate permanently red for a state that
 * no commit can fix. Its history is evidence, not a living source.
 */
export const ARCHIVED_EXCLUSIONS: ReadonlyMap<string, string> = new Map([
  ["libre-ai/libre-ai", "hub archived read-only on 2026-07-30 — workflow no longer amendable"],
]);

export interface DeclaredSource {
  readonly repository: string;
  readonly file: string;
  readonly url: string;
  readonly sha256: string | null;
}

export interface CanonicalToolchain {
  readonly assetUrl: string;
  readonly assetSha256: string;
}

export interface SourceVerdict {
  readonly asserted: number;
  readonly failures: readonly string[];
}

const URL_LINE = /^\s*BUN_ARCHIVE_URL:\s*(?:"([^"]+)"|'([^']+)'|(\S+))\s*$/;
const SHA_LINE = /^\s*BUN_ARCHIVE_SHA256:\s*(?:"|')?([0-9a-f]{64})(?:"|')?\s*$/;

/**
 * Pair every `BUN_ARCHIVE_URL` of a workflow with the digest of its own env
 * block. A workflow installs the toolchain once per job, so the pairing is
 * positional: each URL takes the digest line that is nearer to it than to any
 * other URL — order-agnostic, and no window constant to tune.
 */
export function extractDeclaredSources(
  repository: string,
  file: string,
  workflow: string,
): DeclaredSource[] {
  const lines = workflow.split("\n");
  const urls: { readonly index: number; readonly value: string }[] = [];
  const digests: { readonly index: number; readonly value: string }[] = [];
  for (const [index, line] of lines.entries()) {
    const url = URL_LINE.exec(line);
    if (url) {
      urls.push({ index, value: url[1] ?? url[2] ?? url[3] ?? "" });
      continue;
    }
    const digest = SHA_LINE.exec(line);
    if (digest?.[1] !== undefined) digests.push({ index, value: digest[1] });
  }
  return urls.map((url, position) => {
    const previous = urls[position - 1]?.index ?? Number.NEGATIVE_INFINITY;
    const next = urls[position + 1]?.index ?? Number.POSITIVE_INFINITY;
    let paired: string | null = null;
    let distance = Number.POSITIVE_INFINITY;
    for (const digest of digests) {
      if (digest.index <= previous || digest.index >= next) continue;
      const candidate = Math.abs(digest.index - url.index);
      if (candidate < distance) {
        distance = candidate;
        paired = digest.value;
      }
    }
    return { repository, file, url: url.value, sha256: paired };
  });
}

/**
 * Compare observed declarations to the canonical policy. Finding NOTHING is a
 * failure, not a pass: a sweep that matches no declaration proves only that it
 * looked in the wrong place, and a gate that reports success on an empty set
 * is the inert-gate defect this repository has already met twice.
 */
export function verifySources(
  sources: readonly DeclaredSource[],
  canonical: CanonicalToolchain,
): SourceVerdict {
  const failures: string[] = [];
  if (sources.length === 0) {
    failures.push(
      "no BUN_ARCHIVE_URL found anywhere in the swept fleet — the gate compared nothing and would pass silently",
    );
  }
  for (const source of sources) {
    if (source.url !== canonical.assetUrl) {
      failures.push(
        `${source.repository}: ${source.file} installs the Bun toolchain from ${source.url} — canonical source is ${canonical.assetUrl}`,
      );
    }
    if (source.sha256 === null) {
      failures.push(
        `${source.repository}: ${source.file} declares a BUN_ARCHIVE_URL with no BUN_ARCHIVE_SHA256 — the download is unverified`,
      );
    } else if (source.sha256 !== canonical.assetSha256) {
      failures.push(
        `${source.repository}: ${source.file} declares digest ${source.sha256.slice(0, 12)}… — canonical linux-x64 digest is ${canonical.assetSha256.slice(0, 12)}…`,
      );
    }
  }
  return { asserted: sources.length, failures };
}

export interface CanonicalPolicy {
  readonly durableRelease: { readonly url: string; readonly linuxX64Asset: string };
  readonly assets: { readonly "linux-x64": { readonly sha256: string } };
}

/**
 * The oracle is checked before it is trusted: no URL of the canonical durable
 * release may be hosted by a repository this gate excludes as archived, and
 * the asset URL and digest must actually be there. Without this, editing
 * `toolchains/bun.json` back to the archive would turn the whole fleet
 * uniformly green against a dead source.
 */
export function verifyCanonical(policy: CanonicalPolicy): string[] {
  const failures: string[] = [];
  const declared: ReadonlyArray<readonly [string, string]> = [
    ["durableRelease.url", policy.durableRelease?.url ?? ""],
    ["durableRelease.linuxX64Asset", policy.durableRelease?.linuxX64Asset ?? ""],
  ];
  for (const [field, value] of declared) {
    if (value === "") {
      failures.push(`toolchains/bun.json: ${field} is empty — the canonical source is undeclared`);
      continue;
    }
    for (const [repository, reason] of ARCHIVED_EXCLUSIONS) {
      if (!value.includes(`/${repository}/`)) continue;
      failures.push(
        `toolchains/bun.json: ${field} points at ${repository} (${reason}) — the canonical source must be a living repository`,
      );
    }
  }
  if (!/^[0-9a-f]{64}$/.test(policy.assets?.["linux-x64"]?.sha256 ?? "")) {
    failures.push("toolchains/bun.json: assets.linux-x64.sha256 is not a sha256 digest");
  }
  return failures;
}

/** The canonical policy of THIS repository — the only live copy in the fleet. */
export async function readCanonical(): Promise<CanonicalPolicy> {
  return (await Bun.file("toolchains/bun.json").json()) as CanonicalPolicy;
}

function gh(args: readonly string[]): string | null {
  const result = Bun.spawnSync(["gh", ...args]);
  return result.exitCode === 0 ? new TextDecoder().decode(result.stdout) : null;
}

function listWorkflows(repository: string): string[] | null {
  const listing = gh([
    "api",
    `repos/${repository}/contents/.github/workflows`,
    "--jq",
    '.[] | select(.type == "file") | .name',
  ]);
  if (listing === null) return null;
  return listing
    .split("\n")
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .map((name) => `.github/workflows/${name}`);
}

if (import.meta.main) {
  const policy = await readCanonical();
  const canonicalFailures = verifyCanonical(policy);
  if (canonicalFailures.length > 0) {
    for (const failure of canonicalFailures) console.error(`DRIFT: ${failure}`);
    console.error("The canonical toolchain policy is not a usable oracle.");
    process.exit(1);
  }
  const canonical: CanonicalToolchain = {
    assetUrl: policy.durableRelease.linuxX64Asset,
    assetSha256: policy.assets["linux-x64"].sha256,
  };

  const inventory = Bun.YAML.parse(await Bun.file("ecosystem/repositories.v1.yaml").text()) as {
    readonly repositories: readonly { readonly repository: string }[];
  };

  const sources: DeclaredSource[] = [];
  let inspected = 0;
  let unreadable = 0;
  for (const { repository } of inventory.repositories) {
    if (ARCHIVED_EXCLUSIONS.has(repository)) continue;
    const workflows = listWorkflows(repository);
    // No workflow directory readable: private repository or a reserved
    // product home with no CI yet. Skipped by construction, like the fleet-pin
    // gate — the sweep covers what declares a toolchain source.
    if (workflows === null) {
      unreadable += 1;
      continue;
    }
    inspected += 1;
    for (const file of workflows) {
      const text = gh([
        "api",
        `repos/${repository}/contents/${file}`,
        "-H",
        "Accept: application/vnd.github.raw+json",
      ]);
      if (text === null) continue;
      sources.push(...extractDeclaredSources(repository, file, text));
    }
  }

  const verdict = verifySources(sources, canonical);
  const excluded = [...ARCHIVED_EXCLUSIONS]
    .map(([repository, reason]) => `${repository} (${reason})`)
    .join(", ");
  if (verdict.failures.length > 0) {
    for (const failure of verdict.failures) console.error(`DRIFT: ${failure}`);
    console.error(
      `The fleet installs its Bun toolchain from a source the canonical policy does not declare (${inspected} repositories inspected, ${verdict.asserted} declarations found).`,
    );
    process.exit(1);
  }
  console.log(
    `Toolchain source verified: ${verdict.asserted} workflow declarations across ${inspected} repositories match toolchains/bun.json (${unreadable} without a readable workflow directory; excluded: ${excluded})`,
  );
}
