/**
 * Fleet pin gate (K4 WAVE-A-02 / FINAL-01): enumerate every governance
 * revision a repository lets into its required checks, and fail when one is
 * not a 40-character commit sha, when they do not all agree, when the sha is
 * absent from ecosystem/fleet-pins.v1.yaml, or when it is declared but stale
 * — more than two generations behind the most recent one. Network gate by
 * nature (like inventory-drift); repositories that consume no template are
 * skipped by construction — the gate covers what declares a pin. Every
 * non-archived repository in the inventory is audited, not only
 * satellite/authority: a `reserved-product-home` or `active-application` repo
 * that wires the templates is exactly as exposed to an unpinned tooling
 * checkout as a satellite is, and restricting the scan by role is how eight
 * repositories carrying two different undeclared governance commits went
 * unnoticed through the 2026-08-04 generation (K4 WAVE-A/domain-C fleet
 * convergence, 2026-08-18).
 *
 * Four surfaces let a governance revision in, and all four are read:
 *   - `uses: libre-ai/governance/...@<ref>` in ANY workflow file, not only
 *     `ci.yml` — every consumer also pins `reusable-context-hygiene.yml` from
 *     `context-hygiene.yml`;
 *   - `tooling_ref:`, which reusable-licensing.yml checks governance out at to
 *     run its tooling: a mutable value there executes unpinned tooling inside
 *     a required check;
 *   - `github:libre-ai/governance#<ref>` in package.json;
 *   - `pinned: "github:libre-ai/governance#<ref>"` in the repository's own
 *     project card (`project.v1.yaml` at the repository root for every
 *     non-hub repository, per its `card:` entry in repositories.v1.yaml) —
 *     found only during the 2026-08-18 convergence pass, on a repository
 *     (`orchestrator`) whose card had drifted to a generation none of its CI
 *     surfaces ever carried, and another (`harness`) whose card lagged one
 *     generation behind CI surfaces that were otherwise current. The card is
 *     documentation a human reads to learn what a repository depends on;
 *     a sha there that the CI wiring has moved past is exactly the kind of
 *     drift this gate exists to catch, same as any other surface.
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
  /** The repository's project card text (its `card:` path), or null when unreadable/absent. */
  readonly projectCard: string | null;
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
  if (sources.projectCard !== null) {
    for (const match of sources.projectCard.matchAll(GIT_DEP)) {
      sightings.push({
        source: "project.v1.yaml",
        subject: "project card pin",
        ref: match[1] as string,
      });
    }
  }
  return sightings;
}

export function auditRepository(
  repository: string,
  sources: RepositorySources,
  // Declared generations, oldest first — the order they were added to
  // fleet-pins.v1.yaml. Age is measured against this order, so callers must
  // pass it as declared, not resorted.
  generations: readonly string[],
): string[] {
  const sightings = collectSightings(sources);
  if (sightings.length === 0) return [];

  const declared = new Set(generations);
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

  // Age: a pin can be declared and still be stale — every surface agreeing on
  // a real generation is not the same claim as being current. Computed only
  // when the repository carries a single, declared ref: disagreement and
  // undeclared refs are already named above, and stacking an age claim on a
  // repository already failing for a sharper reason would blur which failure
  // is the one to fix. Two generations of grace matches the fleet's own
  // adoption cadence (one PR per consumer, run sequentially, not all at
  // once) — a repository not yet reached by an in-flight convergence wave is
  // not the same failure as one nobody is converging.
  if (distinct.size === 1) {
    const ref = [...distinct][0] as string;
    const index = generations.indexOf(ref);
    if (index !== -1) {
      const age = generations.length - 1 - index;
      if (age > 2) {
        failures.push(
          `${repository}: pin ${ref.slice(0, 8)} is ${age} generations behind the latest declared (fleet-pins.v1.yaml) — stale beyond the two-generation grace window`,
        );
      }
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

function readSources(
  repository: string,
  cardPath: string,
): RepositorySources | { readonly error: string } {
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
  const card = ghApi(`repos/${repository}/contents/${cardPath}?ref=main`, true);
  if (card.error !== null) {
    return { error: `${repository}: cannot read ${cardPath} — ${card.error}` };
  }
  return { workflows, manifest: manifest.text, projectCard: card.text };
}

if (import.meta.main) {
  const register = Bun.YAML.parse(
    await Bun.file(new URL("fleet-pins.v1.yaml", import.meta.url)).text(),
  ) as { readonly generations: ReadonlyArray<{ readonly sha: string }> };
  // Oldest first, as declared — auditRepository measures age against this order.
  const generationShas = register.generations.map((generation) => generation.sha);

  const inventory = Bun.YAML.parse(
    await Bun.file(new URL("repositories.v1.yaml", import.meta.url)).text(),
  ) as {
    readonly repositories: readonly {
      repository: string;
      lifecycle: string;
      card?: string;
    }[];
  };
  // Every non-archived repository is a target, not only satellite/authority:
  // a reserved-product-home or active-application repo that wires the
  // templates is exactly as exposed to an unpinned tooling checkout as a
  // satellite is. Repositories that declare no pin surface are skipped below
  // by construction (sightings.length === 0), so widening this filter costs
  // nothing on a repository that consumes no template.
  const targets = inventory.repositories
    .filter((repo) => repo.lifecycle !== "archived")
    .map((repo) => ({ repository: repo.repository, card: repo.card ?? "project.v1.yaml" }));

  const failures: string[] = [];
  let covered = 0;
  let inspected = 0;
  for (const target of targets) {
    const sources = readSources(target.repository, target.card);
    if ("error" in sources) {
      failures.push(sources.error);
      continue;
    }
    const sightings = collectSightings(sources);
    if (sightings.length === 0) continue;
    covered += 1;
    inspected += sightings.length;
    failures.push(...auditRepository(target.repository, sources, generationShas));
  }

  // A gate that examined nothing proves nothing: an inventory that stopped
  // naming consumers, or a token that reads no repository, must be red.
  if (covered === 0) {
    failures.push(
      `no pinned repository observed across ${targets.length} targets — the gate lost its inputs`,
    );
  }

  // Merge adaptation: main migrated this gate's verdict to gate-report
  // (wave 2) while this branch rewrote the enumeration. The enumeration —
  // including its own anti-empty rule above, which feeds `failures` — is the
  // branch's; only the reporting shell is converted, so the two changes
  // compose instead of one overwriting the other.
  const { concludeGate, GateReport } = await import("../tools/quality/gate-report");
  const report = new GateReport();
  for (const failure of failures) {
    const colon = failure.indexOf(":");
    report.check(
      colon > 0 ? failure.slice(0, colon) : "fleet pins",
      false,
      `DRIFT: ${colon > 0 ? failure.slice(colon + 2) : failure}`,
    );
  }
  if (failures.length === 0) {
    report.check(
      "fleet template pins",
      true,
      `${inspected} pins across ${covered} repositories match the ${generationShas.length} declared generations`,
    );
  }
  concludeGate("Fleet pins", report);
}
