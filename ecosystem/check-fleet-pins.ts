/**
 * Fleet pin gate (K4 WAVE-A-02 / FINAL-01): enumerate every governance
 * revision a repository lets into its required checks, and fail when one is
 * not a 40-character commit sha, when they do not all agree, or when the sha
 * is absent from ecosystem/fleet-pins.v1.yaml. Network gate by nature (like
 * inventory-drift); repositories that consume no template are skipped by
 * construction — the gate covers what declares a pin.
 *
 * Three surfaces let a governance revision in, and all three are read:
 *   - `uses: libre-ai/governance/...@<ref>` in ANY workflow file, not only
 *     `ci.yml` — every consumer also pins `reusable-context-hygiene.yml` from
 *     `context-hygiene.yml`;
 *   - `tooling_ref:`, which reusable-licensing.yml checks governance out at to
 *     run its tooling: a mutable value there executes unpinned tooling inside
 *     a required check;
 *   - `github:libre-ai/governance#<ref>` in package.json.
 *
 * Reading one occurrence of one of them (the previous implementation matched a
 * single `uses:` in `ci.yml`) let one correct pin answer for a whole
 * repository: an unpinned `@main` beside it was invisible.
 */

export interface RepositorySources {
  /** Workflow file name -> file text, for every file under .github/workflows. */
  readonly workflows: ReadonlyMap<string, string>;
  /** package.json text, or null when the repository has none. */
  readonly manifest: string | null;
}

export interface PinSighting {
  /** File the pin is written in, e.g. "ci.yml" or "package.json". */
  readonly source: string;
  /** What is pinned, e.g. "reusable-licensing.yml", "tooling_ref". */
  readonly subject: string;
  /** The ref exactly as written. */
  readonly ref: string;
}

// A pin is a YAML key, never prose: the templates document their own
// consumption as `#   uses: libre-ai/governance/...@<sha>`, and governance is
// itself covered by this gate. Anchoring on the key excludes the comment.
const USES_LINE = /^[ \t]*(?:-[ \t]+)?uses:[ \t]*libre-ai\/governance\/(\S+?)@(\S+?)[ \t\r]*$/;
// The input declaration in the template carries no value on its line, so only
// a consumer supplying one is sighted.
const TOOLING_REF_LINE = /^[ \t]*tooling_ref:[ \t]*(\S+?)[ \t\r]*$/;
const GIT_DEP = /github:libre-ai\/governance#([^"'\s,}]+)/g;
const COMMIT_SHA = /^[0-9a-f]{40}$/;

export function collectSightings(sources: RepositorySources): PinSighting[] {
  const sightings: PinSighting[] = [];
  for (const name of [...sources.workflows.keys()].sort()) {
    const text = sources.workflows.get(name) as string;
    for (const line of text.split("\n")) {
      const uses = USES_LINE.exec(line);
      if (uses !== null) {
        const [path, ref] = [uses[1] as string, uses[2] as string];
        sightings.push({ source: name, subject: path.split("/").pop() as string, ref });
        continue;
      }
      const tooling = TOOLING_REF_LINE.exec(line);
      if (tooling !== null) {
        sightings.push({ source: name, subject: "tooling_ref", ref: tooling[1] as string });
      }
    }
  }
  if (sources.manifest !== null) {
    for (const match of sources.manifest.matchAll(GIT_DEP)) {
      sightings.push({
        source: "package.json",
        subject: "tooling git-dep",
        ref: match[1] as string,
      });
    }
  }
  return sightings;
}

export function auditRepository(
  repository: string,
  sources: RepositorySources,
  declared: ReadonlySet<string>,
): string[] {
  const sightings = collectSightings(sources);
  if (sightings.length === 0) return [];

  const failures: string[] = [];
  const pinned: PinSighting[] = [];
  for (const sighting of sightings) {
    if (COMMIT_SHA.test(sighting.ref)) {
      pinned.push(sighting);
      continue;
    }
    failures.push(
      `${repository}: ${sighting.source} pins ${sighting.subject}@${sighting.ref} — not a 40-character commit sha`,
    );
  }

  // The register's invariant: a repository consumes ONE generation, so every
  // surface must carry the same sha. A half-bumped repository runs two
  // generations of the same authority against one commit.
  const distinct = new Set(pinned.map((sighting) => sighting.ref));
  if (distinct.size > 1) {
    const detail = pinned
      .map((sighting) => `${sighting.source}:${sighting.subject}@${sighting.ref.slice(0, 8)}`)
      .join(", ");
    failures.push(`${repository}: pins disagree — ${detail}`);
  }
  for (const ref of [...distinct].sort()) {
    if (!declared.has(ref)) {
      failures.push(
        `${repository}: pin ${ref.slice(0, 8)} is not a declared generation (fleet-pins.v1.yaml)`,
      );
    }
  }
  return failures;
}

interface FetchOutcome {
  /** File content, or null when the path does not exist. */
  readonly text: string | null;
  /** Transport error: the state is UNKNOWN, never "no pin here". */
  readonly error: string | null;
}

function ghApi(path: string, raw: boolean): FetchOutcome {
  const result = Bun.spawnSync([
    "gh",
    "api",
    path,
    ...(raw ? ["-H", "Accept: application/vnd.github.raw+json"] : []),
  ]);
  if (result.exitCode === 0) {
    return { text: new TextDecoder().decode(result.stdout), error: null };
  }
  const stderr = new TextDecoder().decode(result.stderr).trim();
  // A 404 is an answer — the path does not exist. Anything else (rate limit,
  // 5xx, network) leaves the repository unread, and reading that as "no pin"
  // would turn an outage into a green gate.
  if (stderr.includes("(HTTP 404)")) return { text: null, error: null };
  return { text: null, error: stderr === "" ? `gh api ${path} failed` : stderr };
}

function readSources(repository: string): RepositorySources | { readonly error: string } {
  const listing = ghApi(`repos/${repository}/contents/.github/workflows?ref=main`, false);
  if (listing.error !== null) {
    return { error: `${repository}: cannot list .github/workflows — ${listing.error}` };
  }
  const entries =
    listing.text === null
      ? []
      : (JSON.parse(listing.text) as { name: string; type: string }[]).filter(
          (entry) => entry.type === "file" && /\.ya?ml$/.test(entry.name),
        );
  const workflows = new Map<string, string>();
  for (const entry of entries) {
    const file = ghApi(
      `repos/${repository}/contents/.github/workflows/${entry.name}?ref=main`,
      true,
    );
    if (file.error !== null) {
      return { error: `${repository}: cannot read ${entry.name} — ${file.error}` };
    }
    if (file.text !== null) workflows.set(entry.name, file.text);
  }
  const manifest = ghApi(`repos/${repository}/contents/package.json?ref=main`, true);
  if (manifest.error !== null) {
    return { error: `${repository}: cannot read package.json — ${manifest.error}` };
  }
  return { workflows, manifest: manifest.text };
}

if (import.meta.main) {
  const register = Bun.YAML.parse(
    await Bun.file(new URL("fleet-pins.v1.yaml", import.meta.url)).text(),
  ) as { readonly generations: ReadonlyArray<{ readonly sha: string }> };
  const declared = new Set(register.generations.map((generation) => generation.sha));

  const inventory = Bun.YAML.parse(
    await Bun.file(new URL("repositories.v1.yaml", import.meta.url)).text(),
  ) as { readonly repositories: readonly { repository: string; role: string }[] };
  const targets = inventory.repositories
    .filter((repo) => repo.role === "satellite" || repo.role === "authority")
    .map((repo) => repo.repository);

  const failures: string[] = [];
  let covered = 0;
  let inspected = 0;
  for (const repository of targets) {
    const sources = readSources(repository);
    if ("error" in sources) {
      failures.push(sources.error);
      continue;
    }
    const sightings = collectSightings(sources);
    if (sightings.length === 0) continue;
    covered += 1;
    inspected += sightings.length;
    failures.push(...auditRepository(repository, sources, declared));
  }

  // A gate that examined nothing proves nothing: an inventory that stopped
  // naming consumers, or a token that reads no repository, must be red.
  if (covered === 0) {
    failures.push(
      `no pinned repository observed across ${targets.length} targets — the gate lost its inputs`,
    );
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(`DRIFT: ${failure}`);
    console.error("Fleet template pins drift from the declared generations.");
    process.exit(1);
  }
  console.log(
    `Fleet pins verified: ${inspected} pins across ${covered} repositories, ${declared.size} declared generations`,
  );
}
