/**
 * Inventory-vs-GitHub reconciliation (positioning L2).
 *
 * repositories.v1.yaml claims authority over the public topology (ADR-0009
 * §7); an authority that can silently diverge from the observable GitHub
 * organization is worthless. This check compares the inventory with the live
 * org in BOTH directions — presence, name and visibility — and fails on any
 * divergence, so drift blocks the pull request that would ship it instead of
 * waiting for the weekly truth-drift audit.
 *
 * Private repositories: the default CI token only lists public repositories.
 * An entry declared `private` that is NOT observable is therefore consistent,
 * not drift (fail-open on that single case, by design and logged); a declared
 * `private` entry that IS observable as public is a real leak and fails.
 *
 * Usage: bun ecosystem/check-inventory-drift.ts   (requires `gh` + GH_TOKEN)
 */

import { buildIndex } from "./build-index";

export const ORGANIZATION = "libre-ai";

export interface DeclaredRepository {
  /** Bare repository name, without the organization prefix. */
  name: string;
  visibility: "public" | "private";
}

export interface LiveRepository {
  /** Bare repository name as listed by the GitHub API. */
  name: string;
  isPrivate: boolean;
}

export interface Reconciliation {
  /** Divergences that must fail the check. */
  drifts: string[];
  /** Consistent-but-unverifiable cases, logged for the record. */
  notes: string[];
}

export function reconcileInventory(
  declared: DeclaredRepository[],
  live: LiveRepository[],
): Reconciliation {
  const drifts: string[] = [];
  const notes: string[] = [];
  const declaredByName = new Map(declared.map((repo) => [repo.name, repo]));
  const liveByName = new Map(live.map((repo) => [repo.name, repo]));

  for (const repo of live) {
    const entry = declaredByName.get(repo.name);
    if (entry === undefined) {
      drifts.push(
        `DRIFT: repository '${repo.name}' is observable on GitHub but absent from the inventory`,
      );
      continue;
    }
    const liveVisibility = repo.isPrivate ? "private" : "public";
    if (entry.visibility !== liveVisibility) {
      drifts.push(
        `DRIFT: repository '${repo.name}' declared ${entry.visibility} but observable as ${liveVisibility}`,
      );
    }
  }

  for (const entry of declared) {
    if (liveByName.has(entry.name)) continue;
    if (entry.visibility === "private") {
      notes.push(
        `NOTE: '${entry.name}' declared private and not observable with this token — consistent, unverifiable here`,
      );
      continue;
    }
    drifts.push(
      `DRIFT: inventory declares '${entry.name}' public but it is not observable (deleted, renamed, or made private)`,
    );
  }

  return { drifts, notes };
}

async function fetchLiveRepositories(): Promise<LiveRepository[]> {
  const proc = Bun.spawn(
    [
      "gh",
      "api",
      "--paginate",
      `orgs/${ORGANIZATION}/repos?per_page=100`,
      "--jq",
      ".[] | [.name, (.private | tostring)] | @tsv",
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  const [output, errors, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    // Fail closed: an unreachable API must fail the gate, not pass it silently.
    throw new Error(
      `gh api orgs/${ORGANIZATION}/repos failed (exit ${exitCode}): ${errors.trim()}`,
    );
  }
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [name, isPrivate] = line.split("\t");
      if (name === undefined || (isPrivate !== "true" && isPrivate !== "false")) {
        throw new Error(`unexpected gh api output line: ${JSON.stringify(line)}`);
      }
      return { name, isPrivate: isPrivate === "true" };
    });
}

if (import.meta.main) {
  const yamlText = await Bun.file(new URL("repositories.v1.yaml", import.meta.url)).text();
  const declared = buildIndex(yamlText).repositories.map((entry) => {
    const [owner, name] = entry.repository.split("/");
    if (owner !== ORGANIZATION || name === undefined || name.length === 0) {
      throw new Error(
        `inventory entry outside the ${ORGANIZATION} organization: ${entry.repository}`,
      );
    }
    return { name, visibility: entry.visibility };
  });

  const { drifts, notes } = reconcileInventory(declared, await fetchLiveRepositories());
  for (const note of notes) console.log(note);
  for (const drift of drifts) console.error(drift);
  if (drifts.length > 0) {
    console.error(`${drifts.length} divergence(s) between ${ORGANIZATION} and the inventory`);
    process.exit(1);
  }
  console.log(
    `inventory matches the observable ${ORGANIZATION} organization (${declared.length} declared)`,
  );
}
