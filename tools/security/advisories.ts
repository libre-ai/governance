// Advisory parsing shared by the two halves of ADR-0021: the fleet control
// (check-fleet-advisories, D1) and the per-pull-request delta gate
// (check-audit-delta, D2). Both read `bun audit` output, so the reading lives
// once.

const GHSA_PATTERN = /GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/g;

/** Unique, sorted GHSA identifiers found in a `bun audit` output. */
export function extractAdvisoryIds(output: string): string[] {
  return [...new Set(output.match(GHSA_PATTERN) ?? [])].sort();
}

export interface AdvisoryDelta {
  /** Present on head, absent on base: what THIS change introduces. Blocking. */
  readonly introduced: string[];
  /** Present on both: the state of the world, owned by the fleet control. */
  readonly preExisting: string[];
}

export function diffAdvisories(base: readonly string[], head: readonly string[]): AdvisoryDelta {
  const baseSet = new Set(base);
  return {
    introduced: head.filter((id) => !baseSet.has(id)),
    preExisting: head.filter((id) => baseSet.has(id)),
  };
}

export interface AuditReading {
  /** The audit RAN — clean or with findings. False means it could not answer. */
  readonly ran: boolean;
  readonly advisories: string[];
  readonly detail: string;
}

/**
 * Interpret one `bun audit` run from its exit code and output.
 *
 * `bun audit` exits 0 when clean and 1 when it found advisories — but 1 is
 * also what a network failure produces. "Found nothing" and "could not look"
 * must never be conflated (the lesson DOCTRINE-REPLICATION records), so a
 * non-zero exit only counts as a *finding* when the output actually carries
 * advisory identifiers or the explicit vulnerability count; anything else is
 * an audit that could not answer, and the caller fails on it.
 */
export function readAudit(exitCode: number, output: string): AuditReading {
  const advisories = extractAdvisoryIds(output);
  if (exitCode === 0) {
    return { ran: true, advisories, detail: "clean" };
  }
  if (advisories.length > 0 || /\d+ vulnerabilit/.test(output)) {
    return { ran: true, advisories, detail: `${advisories.length} advisory id(s)` };
  }
  return {
    ran: false,
    advisories: [],
    detail: `bun audit exited ${exitCode} without an advisory listing — not a clean result, an unanswered question`,
  };
}
