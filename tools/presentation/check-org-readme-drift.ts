import type { PublicBrandProjection } from "../../brand/build-public-projection";
import { checkPublicFacts } from "../../ecosystem/check-fleet-presentation";
import type { PublicationSelection } from "../../portfolio/publication-input";
import { readBoundedJson } from "../../portfolio/publication-input";
import {
  buildPublicFacts,
  type PublicFacts,
  readPublicSelection,
  STATUS_SECTION_BEGIN,
  STATUS_SECTION_END,
} from "./public-capabilities";

import {
  BRAND_INTRO_BEGIN,
  BRAND_INTRO_END,
  type BrandLanguage,
  renderOrgBrandIntro,
} from "./render-org-brand-intro";
import { renderOrgSection } from "./render-org-readme";

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

/**
 * Compares the live `.github` README against a freshly rendered section.
 * Uses the shared public section delimiter discipline: one
 * declared pair of sentinels, byte-identical content between them.
 */
export function checkOrgReadmeDrift(liveReadme: string, freshSection: string): string[] {
  const beginCount = countOccurrences(liveReadme, STATUS_SECTION_BEGIN);
  const endCount = countOccurrences(liveReadme, STATUS_SECTION_END);
  if (beginCount === 0 || endCount === 0) {
    return [
      ".github profile/README.md: generated project-status section missing (sentinels not found)",
    ];
  }
  if (beginCount > 1 || endCount > 1) {
    return [
      ".github profile/README.md: section statut dupliquée — une seule paire de sentinelles est admise",
    ];
  }
  const begin = liveReadme.indexOf(STATUS_SECTION_BEGIN);
  const end = liveReadme.indexOf(STATUS_SECTION_END);
  const committed = liveReadme.slice(begin, end + STATUS_SECTION_END.length);
  if (committed !== freshSection) {
    return [
      ".github profile/README.md: the published status section diverges from a fresh render of " +
        "portfolio/repositories.v1.yaml — run `bun tools/presentation/render-org-readme.ts` and " +
        "paste the result between the sentinels",
    ];
  }
  return [];
}

export function checkOrgBrandIntroDrift(
  liveReadme: string,
  freshIntro: string,
  language: BrandLanguage,
): string[] {
  const beginCount = countOccurrences(liveReadme, BRAND_INTRO_BEGIN);
  const endCount = countOccurrences(liveReadme, BRAND_INTRO_END);
  const path = language === "en" ? "profile/README.md" : "profile/README.fr.md";
  if (beginCount === 0 || endCount === 0) {
    return [`.github ${path}: generated brand introduction missing (sentinels not found)`];
  }
  if (beginCount > 1 || endCount > 1) {
    return [`.github ${path}: introduction de marque dupliquée — une seule paire est admise`];
  }
  const begin = liveReadme.indexOf(BRAND_INTRO_BEGIN);
  const end = liveReadme.indexOf(BRAND_INTRO_END);
  const committed = liveReadme.slice(begin, end + BRAND_INTRO_END.length);
  if (committed !== freshIntro) {
    return [`.github ${path}: the published brand introduction diverges from a fresh render`];
  }
  return [];
}

export function checkProjectionFreshness(committed: unknown, live: PublicFacts): string[] {
  return checkPublicFacts(committed, live).map(
    () =>
      "portfolio projection differs from verified facts — run bun run build:portfolio with approved inputs",
  );
}

function fetchFromGitHub(repository: string, path: string): string | null {
  const result = Bun.spawnSync([
    "gh",
    "api",
    `repos/${repository}/contents/${path}?ref=main`,
    "-H",
    "Accept: application/vnd.github.raw+json",
  ]);
  if (result.exitCode !== 0) return null;
  return new TextDecoder().decode(result.stdout);
}

export interface LiveState {
  readonly readme: string;
  readonly frenchReadme: string;
  readonly freshSection: string;
  readonly freshEnglishIntro: string;
  readonly freshFrenchIntro: string;
  readonly liveStatus: PublicFacts;
  readonly committedStatus: unknown;
}

export interface LiveStateFailure {
  readonly unreadable: readonly string[];
}

/**
 * Everything the gate and the heal compare: the published README, the
 * section the live cards render to, and both projections. One reader, so
 * the two callers cannot disagree on what "fresh" means.
 */
export async function readLiveState(): Promise<LiveState | LiveStateFailure> {
  const unreadable: string[] = [];
  let selection: PublicationSelection;
  try {
    selection = await readPublicSelection();
    if (selection.contracts.length === 0) throw new Error("missing");
  } catch {
    return { unreadable: ["public-evidence-required"] };
  }
  const readme = fetchFromGitHub("libre-ai/.github", "profile/README.md");
  if (readme === null) unreadable.push("libre-ai/.github: profile/README.md unreadable");
  const frenchReadme = fetchFromGitHub("libre-ai/.github", "profile/README.fr.md");
  if (frenchReadme === null) unreadable.push("libre-ai/.github: profile/README.fr.md unreadable");
  if (readme === null || frenchReadme === null || unreadable.length > 0) {
    return { unreadable };
  }

  const liveStatus = buildPublicFacts(selection);
  let committedStatus: unknown;
  try {
    committedStatus = await readBoundedJson(
      new URL("../../portfolio/projections/readme-facts.v1.json", import.meta.url),
    );
  } catch {
    return { unreadable: ["portfolio-projection-unreadable"] };
  }
  const brandProjection = (await Bun.file(
    new URL("../../brand/projections/public-brand.v1.json", import.meta.url),
  ).json()) as PublicBrandProjection;
  return {
    readme,
    frenchReadme,
    freshSection: renderOrgSection(selection),
    freshEnglishIntro: renderOrgBrandIntro(brandProjection, "en"),
    freshFrenchIntro: renderOrgBrandIntro(brandProjection, "fr"),
    liveStatus,
    committedStatus,
  };
}

export function isLiveState(state: LiveState | LiveStateFailure): state is LiveState {
  return "readme" in state;
}

if (import.meta.main) {
  const { concludeGate, GateReport } = await import("../quality/gate-report");
  const report = new GateReport();
  const state = await readLiveState();

  if (!isLiveState(state)) {
    for (const failure of state.unreadable) report.check("live state", false, failure);
  } else {
    const projectionDrift = checkProjectionFreshness(state.committedStatus, state.liveStatus);
    if (projectionDrift.length === 0) {
      report.check(
        "portfolio projection",
        true,
        `portfolio/projections/readme-facts.v1.json matches verified facts (${state.liveStatus.repositories.length} rows)`,
      );
    } else {
      for (const failure of projectionDrift) report.check("portfolio projection", false, failure);
    }

    const drift = checkOrgReadmeDrift(state.readme, state.freshSection);
    if (drift.length === 0) {
      report.check(
        "org readme drift",
        true,
        `libre-ai/.github profile/README.md matches a fresh render (${state.liveStatus.repositories.length} rows)`,
      );
    } else {
      for (const failure of drift) report.check("org readme drift", false, failure);
    }

    for (const failure of checkOrgBrandIntroDrift(state.readme, state.freshEnglishIntro, "en")) {
      report.check("org brand intro drift", false, failure);
    }
    for (const failure of checkOrgBrandIntroDrift(
      state.frenchReadme,
      state.freshFrenchIntro,
      "fr",
    )) {
      report.check("org brand intro drift", false, failure);
    }
  }
  concludeGate("Org README drift", report);
}
