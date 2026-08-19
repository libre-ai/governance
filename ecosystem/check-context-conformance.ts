/**
 * Context conformance gate (remise à plat, Domaine D — Contexte agent,
 * 2026-08-18, owner arbitration; docs/method/CONTEXT-TEMPLATE.md).
 *
 * NOT wired into `bun run check` — it is its own standalone CI workflow
 * (`.github/workflows/context-conformance.yml`), like every other required
 * check in this repository's branch protection. A 2026-08-18 survey found
 * ~9-17 line prose stubs with zero `## ` sections on nearly every satellite;
 * the conformance wave that followed brought all 36 registry entries into
 * shape (verified 2026-08-19), which is the precondition
 * `docs/method/CONTEXT-TEMPLATE.md` set for the workflow's `pull_request`
 * trigger and this check becoming required on `governance` via
 * `tools/security/check-branch-protection.ts --fix`.
 *
 * For every entry in `ecosystem/repositories.v1.yaml`, this gate verifies:
 *
 *   1. `AGENTS.md` exists at `main` for every `lifecycle: active` entry.
 *      Absence on a non-active entry is asserted as a pass, never a silent
 *      skip (gate-report's `check()` records it either way). Two standing
 *      exemptions, both asserted, never silently skipped: the
 *      `libre-ai/.github` org-profile (no agent works there), and any
 *      `lifecycle: archived` entry — content frozen read-only cannot be
 *      brought into conformance, so no section, cap, pointer or marker
 *      requirement applies to it (mechanical consequence of the domain D
 *      arbitration, 2026-08-18: a requirement binds only what can still be
 *      edited).
 *   2. The `## ` sections required for the entry's layer (and role, and
 *      lifecycle where the template distinguishes them) are all present.
 *   3. `AGENTS.md` does not exceed the layer's line cap — blocking; there is
 *      never a floor.
 *   4. `AGENTS.md` carries at least one fetchable
 *      `https://(raw.githubusercontent.com|github.com)/libre-ai/(governance|contracts)/`
 *      URL — a prose mention with no URL does not count.
 *   5. `CLAUDE.md` is the byte-exact `@AGENTS.md\n` adapter, present if and
 *      only if `AGENTS.md` is present.
 *   6. The text carries a layer marker (`couche[- ]?[1-4]`, `transverse` or
 *      `moyeu`) matching the entry's registered `layer`.
 *   7. Freshness is informative — except when a repository's `lifecycle`
 *      value in `ecosystem/repositories.v1.yaml` last changed (a real
 *      transition, reconstructed from this file's own local git history)
 *      more recently than `AGENTS.md` was last touched in the target repo:
 *      that specific case is blocking.
 */

export interface RegistryEntry {
  readonly repository: string;
  readonly role: string;
  readonly layer: string;
  readonly lifecycle: string;
}

export interface LayerSpec {
  readonly requiredSections: readonly string[];
  readonly maxLines: number;
}

const BASE_SECTIONS = ["Authority", "Boundaries", "Quality gates", "Agents"] as const;
const COUCHE1_ACTIVE_SECTIONS = ["Purpose", "Domain doctrine", "Commands", "Working here"] as const;

/**
 * The template table of docs/method/CONTEXT-TEMPLATE.md, mechanised. A
 * combination the table does not name returns `null` — the caller must fail
 * loudly on that, never guess a spec for a layer/role/lifecycle triple the
 * doctrine has not fixed yet.
 */
export function resolveLayerSpec(
  entry: Pick<RegistryEntry, "layer" | "role" | "lifecycle">,
): LayerSpec | null {
  if (entry.layer === "couche-4") return { requiredSections: BASE_SECTIONS, maxLines: 40 };
  if (entry.layer === "couche-3" || entry.layer === "couche-2") {
    return { requiredSections: BASE_SECTIONS, maxLines: 45 };
  }
  if (entry.layer === "transverse" && entry.role === "authority") {
    return { requiredSections: BASE_SECTIONS, maxLines: 80 };
  }
  if (entry.layer === "transverse") {
    return { requiredSections: BASE_SECTIONS, maxLines: 45 };
  }
  if (entry.layer === "couche-1" && entry.lifecycle === "active") {
    return { requiredSections: COUCHE1_ACTIVE_SECTIONS, maxLines: 60 };
  }
  return null;
}

/** Top-level `## ` headings only — a `### ` subsection never counts. */
export function extractSections(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => /^## /.test(line))
    .map((line) => line.replace(/^## /, "").trim());
}

export function missingSections(required: readonly string[], text: string): string[] {
  const present = new Set(extractSections(text));
  return required.filter((section) => !present.has(section));
}

/** `wc -l` semantics: a single trailing newline is not an extra line. */
export function countLines(text: string): number {
  return text.replace(/\n$/, "").split("\n").length;
}

const AUTHORITY_URL =
  /https:\/\/(raw\.githubusercontent\.com|github\.com)\/libre-ai\/(governance|contracts)\//;

export function hasAuthorityPointer(text: string): boolean {
  return AUTHORITY_URL.test(text);
}

const LAYER_MARKER = /couche[\s-]?([1-4])|transverse|moyeu/gi;

/** Does the text's layer marker match the registry's declared layer — the repository's own, not any layer. */
export function layerMarkerOk(layer: string, text: string): boolean {
  const matches = [...text.matchAll(LAYER_MARKER)];
  if (layer === "transverse") return matches.some((match) => /^transverse$/i.test(match[0]));
  if (layer === "moyeu") return matches.some((match) => /^moyeu$/i.test(match[0]));
  const digit = /^couche-([1-4])$/.exec(layer)?.[1];
  if (digit === undefined) return false;
  return matches.some((match) => match[1] === digit);
}

/** `null` when the CLAUDE.md adapter is correct; otherwise the reason it is not. */
export function claudeAdapterIssue(
  agentsPresent: boolean,
  claudeText: string | null,
): string | null {
  if (!agentsPresent) {
    return claudeText !== null ? "CLAUDE.md exists without an AGENTS.md" : null;
  }
  if (claudeText === null) return "CLAUDE.md is missing while AGENTS.md exists";
  if (claudeText !== "@AGENTS.md\n")
    return "CLAUDE.md is not the byte-exact '@AGENTS.md\\n' adapter";
  return null;
}

export interface LifecycleSample {
  readonly date: string;
  readonly lifecycle: string | undefined;
}

/**
 * The date of the most recent commit where the entry's `lifecycle` value
 * actually changed (old and new both defined and different) — `null` when
 * the value has never changed since the entry first appeared, which is the
 * common case and is never blocking on its own.
 */
export function lastLifecycleTransition(history: readonly LifecycleSample[]): string | null {
  let previous: string | undefined;
  let lastChange: string | null = null;
  for (const sample of history) {
    if (sample.lifecycle !== undefined) {
      if (previous !== undefined && previous !== sample.lifecycle) {
        lastChange = sample.date;
      }
      previous = sample.lifecycle;
    }
  }
  return lastChange;
}

export interface FreshnessOutcome {
  readonly blocking: boolean;
  readonly note: string;
}

export function checkFreshness(
  transitionedOn: string | null,
  agentsLastModifiedOn: string | null,
): FreshnessOutcome {
  if (transitionedOn === null) {
    return {
      blocking: false,
      note:
        agentsLastModifiedOn !== null
          ? `AGENTS.md last touched ${agentsLastModifiedOn}; no recorded lifecycle transition`
          : "no recorded lifecycle transition; AGENTS.md modification date unavailable",
    };
  }
  if (agentsLastModifiedOn === null) {
    return {
      blocking: false,
      note: `lifecycle last transitioned ${transitionedOn}; AGENTS.md modification date unavailable`,
    };
  }
  if (agentsLastModifiedOn < transitionedOn) {
    return {
      blocking: true,
      note: `lifecycle transitioned on ${transitionedOn} but AGENTS.md was not touched since (last modified ${agentsLastModifiedOn})`,
    };
  }
  return {
    blocking: false,
    note: `AGENTS.md last touched ${agentsLastModifiedOn}, at or after the last lifecycle transition (${transitionedOn})`,
  };
}

export function parseRegistry(yamlText: string): RegistryEntry[] {
  const document = Bun.YAML.parse(yamlText) as {
    readonly repositories: readonly Record<string, unknown>[];
  };
  return document.repositories.map((record) => ({
    repository: String(record.repository),
    role: String(record.role),
    layer: String(record.layer),
    lifecycle: String(record.lifecycle),
  }));
}

export interface RepoDocuments {
  readonly agents: string | null;
  readonly claude: string | null;
}

export interface FreshnessInputs {
  readonly transitionedOn: string | null;
  readonly agentsLastModifiedOn: string | null;
}

export interface ReviewOutcome {
  readonly failures: readonly string[];
  readonly notes: readonly string[];
  readonly exempt: boolean;
}

const ORG_PROFILE_EXEMPTION = "libre-ai/.github";

export function reviewContext(
  entry: RegistryEntry,
  docs: RepoDocuments,
  freshness: FreshnessInputs,
): ReviewOutcome {
  if (entry.repository === ORG_PROFILE_EXEMPTION) {
    return {
      failures: [],
      notes: ["AGENTS.md not required — org-profile exemption (no agent works here)"],
      exempt: true,
    };
  }

  if (entry.lifecycle === "archived") {
    return {
      failures: [],
      notes: ["archived — content frozen read-only, conformance not applicable"],
      exempt: true,
    };
  }

  if (docs.agents === null) {
    if (entry.lifecycle === "active") {
      return {
        failures: ["AGENTS.md is missing at main (lifecycle=active)"],
        notes: [],
        exempt: false,
      };
    }
    return {
      failures: [],
      notes: [`AGENTS.md not required — lifecycle=${entry.lifecycle}`],
      exempt: false,
    };
  }

  const failures: string[] = [];
  const notes: string[] = [];
  const agents = docs.agents;

  const spec = resolveLayerSpec(entry);
  if (spec === null) {
    failures.push(
      `no context template known for layer=${entry.layer} role=${entry.role} lifecycle=${entry.lifecycle} — docs/method/CONTEXT-TEMPLATE.md needs an entry before this repository can be graded`,
    );
    return { failures, notes, exempt: false };
  }

  const missing = missingSections(spec.requiredSections, agents);
  if (missing.length > 0) {
    failures.push(`missing section(s): ${missing.join(", ")}`);
  }

  const lines = countLines(agents);
  if (lines > spec.maxLines) {
    failures.push(
      `AGENTS.md is ${lines} lines, over the ${spec.maxLines}-line cap for layer=${entry.layer}`,
    );
  }

  if (!hasAuthorityPointer(agents)) {
    failures.push(
      "no fetchable https://(raw.githubusercontent.com|github.com)/libre-ai/(governance|contracts)/ URL found",
    );
  }

  const claudeIssue = claudeAdapterIssue(true, docs.claude);
  if (claudeIssue !== null) failures.push(claudeIssue);

  if (!layerMarkerOk(entry.layer, agents)) {
    failures.push(`text carries no layer marker matching layer=${entry.layer}`);
  }

  const fresh = checkFreshness(freshness.transitionedOn, freshness.agentsLastModifiedOn);
  if (fresh.blocking) failures.push(fresh.note);
  else notes.push(fresh.note);

  return { failures, notes, exempt: false };
}

// --- Effectful shell: gh api + local git plumbing, kept apart from the pure
// core above so every rule is unit-tested without a subprocess. ---

function gh(args: string[]): string | null {
  const result = Bun.spawnSync(["gh", ...args]);
  if (result.exitCode !== 0) return null;
  return new TextDecoder().decode(result.stdout);
}

function fetchFile(repository: string, path: string): string | null {
  return gh([
    "api",
    `repos/${repository}/contents/${path}?ref=main`,
    "-H",
    "Accept: application/vnd.github.raw+json",
  ]);
}

function fetchLastCommitDate(repository: string, path: string): string | null {
  const raw = gh(["api", `repos/${repository}/commits?path=${path}&per_page=1`]);
  if (raw === null) return null;
  try {
    const commits = JSON.parse(raw) as ReadonlyArray<{
      readonly commit?: { readonly committer?: { readonly date?: string } };
    }>;
    const date = commits[0]?.commit?.committer?.date;
    return date === undefined ? null : (date.split("T")[0] ?? null);
  } catch {
    return null;
  }
}

function sh(argv: string[]): string | null {
  const result = Bun.spawnSync(argv, { stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) return null;
  return new TextDecoder().decode(result.stdout);
}

/**
 * Reconstruct, from this repository's own local git history (no network),
 * every repository's `lifecycle` value at every commit that touched
 * `ecosystem/repositories.v1.yaml`. One pass over the file's history serves
 * every entry — cheaper than one `git log` per repository, and the history
 * this file carries is already a complete, trustworthy record: it is the
 * registry's own authority.
 */
function buildLifecycleHistory(): Map<string, LifecycleSample[]> {
  const log = sh([
    "git",
    "log",
    "--format=%H|%aI",
    "--reverse",
    "--",
    "ecosystem/repositories.v1.yaml",
  ]);
  const history = new Map<string, LifecycleSample[]>();
  if (log === null) return history;
  const commits = log
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sha, date] = line.split("|");
      return { sha: sha as string, date: (date as string).split("T")[0] as string };
    });
  for (const { sha, date } of commits) {
    const text = sh(["git", "show", `${sha}:ecosystem/repositories.v1.yaml`]);
    if (text === null) continue;
    let entries: RegistryEntry[];
    try {
      entries = parseRegistry(text);
    } catch {
      continue;
    }
    const seen = new Set<string>();
    for (const entry of entries) {
      seen.add(entry.repository);
      const list = history.get(entry.repository) ?? [];
      list.push({ date, lifecycle: entry.lifecycle });
      history.set(entry.repository, list);
    }
  }
  return history;
}

if (import.meta.main) {
  const { concludeGate, GateReport } = await import("../tools/quality/gate-report");
  const registry = parseRegistry(await Bun.file("ecosystem/repositories.v1.yaml").text());
  const lifecycleHistory = buildLifecycleHistory();

  const report = new GateReport();
  for (const entry of registry) {
    const agents = fetchFile(entry.repository, "AGENTS.md");
    const claude = agents !== null ? fetchFile(entry.repository, "CLAUDE.md") : null;
    const agentsLastModifiedOn =
      agents !== null ? fetchLastCommitDate(entry.repository, "AGENTS.md") : null;
    const transitionedOn = lastLifecycleTransition(lifecycleHistory.get(entry.repository) ?? []);

    const outcome = reviewContext(
      entry,
      { agents, claude },
      { transitionedOn, agentsLastModifiedOn },
    );
    const ok = outcome.failures.length === 0;
    const note = ok
      ? outcome.exempt
        ? outcome.notes.join("; ")
        : [outcome.notes.join("; "), "conforms to CONTEXT-TEMPLATE.md"].filter(Boolean).join(" — ")
      : outcome.failures.join("; ");
    report.check(entry.repository, ok, note);
  }

  concludeGate("Context conformance", report);
}
