// Owner-run retention sweep CLI (retention execution + physical compaction
// design, 2026-07-24; task D3, controller executor decision). There is no
// production Postgres wiring in this repo pre-G4 (Clever Cloud is
// deliberately unconfigured), so this v1 entry point runs against a
// FILE-BACKED PGlite data directory: `--pgdata <dir>` constructs
// `new PGlite(dir)` — the same `@electric-sql/pglite` build the testing
// package uses (packages/testing/src/test-database.ts), just pointed at a
// directory instead of memory. PGlite satisfies packages/data's `SqlExecutor`
// structurally (query/exec), so it is passed straight through as the
// executor: no adapter, no wrapper.
//
// THIS IS THE V1 OWNER-RUN DRILL SURFACE, NOT THE PRODUCTION RUNTIME. At G4
// the runtime surface (real Postgres + a Biscuit attenuated token gating the
// caller) REPLACES this entry point — the deferral is named here, per the
// design's §3 "authorization, deferred" clause, not silent: there is
// deliberately no caller-identity check in this script, because the operator
// invoking it IS the owner (physical/shell access to the machine and the
// pgdata directory is the only gate v1 has).
//
// This script applies NO migrations and creates NO tables. It opens the
// pgdata directory exactly as the owner prepared it (packages/data +
// per-product migrations already run) and fails with a one-line, code-only
// error if the expected role or tables are missing — the owner prepares the
// database, this CLI only sweeps. Per-unit failures abort the sweep (D1's
// fail-closed policy, packages/data/src/retention-sweep.ts) and surface here
// as that same one-line error.
//
// Output discipline: stdout carries ONLY the evidence report (aggregate
// counts, opaque receipt ids, owner/rule/tenant/timestamp) as pretty JSON —
// never event content, subject identifiers, or digests. Errors are one line
// on stderr, no stack trace, no PII.

import { PGlite } from "@electric-sql/pglite";
import { sessionsCompactionSpec } from "../../apps/sessions/src/rgpd/retention";
import { runRetentionSweep } from "../../packages/data/src/retention-sweep";
import { isPrivateTenantId } from "../../packages/data/src/tenant-id";

// RFC 3339 date-time (same shape as the common.v1 `timestamp` $def, reused
// verbatim across the repo rather than imported — see e.g.
// packages/rgpd-kit/src/data-subject-request.ts).
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const KNOWN_FLAGS = new Set(["--pgdata", "--tenant", "--now"]);

export const RETENTION_CLI_USAGE = `usage: bun tools/ops/run-retention.ts --pgdata <dir> --tenant <ten_...> [--now <ISO-8601>]

Runs one owner + one tenant retention sweep against an EXISTING file-backed
PGlite data directory (the owner prepares it: packages/data + per-product
migrations already applied). Applies no migrations, creates no tables.
Prints the evidence report as JSON on stdout; exit 0 on success.

Flags:
  --pgdata <dir>      file-backed PGlite data directory (required)
  --tenant <ten_...>  private tenant id, ^ten_[a-z0-9]{16,64}$ (required)
  --now <ISO-8601>    drill clock override (optional; default: current time)

Example:
  bun tools/ops/run-retention.ts --pgdata ./retention-pgdata --tenant ten_aaaaaaaaaaaaaaaa
`;

/** The pure, validated shape of a parsed invocation. `now: null` means the
 * caller should default to the current time — kept OUT of this pure parser
 * so parseRetentionArgs stays a deterministic function of its input. */
export interface RetentionCliConfig {
  readonly pgdata: string;
  readonly tenantId: string;
  readonly now: string | null;
}

export type ParsedRetentionArgs =
  | { readonly kind: "config"; readonly config: RetentionCliConfig }
  | { readonly kind: "usage-error"; readonly message: string };

function usageError(message: string): ParsedRetentionArgs {
  return { kind: "usage-error", message };
}

/** Pure argument parser/validator: no I/O, no clock, no process access. */
export function parseRetentionArgs(argv: readonly string[]): ParsedRetentionArgs {
  const values = new Map<string, string>();
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    if (!KNOWN_FLAGS.has(arg)) {
      return usageError(`unknown flag: ${arg}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      return usageError(`${arg} requires a value`);
    }
    values.set(arg, value);
    i += 1;
  }

  if (positionals.length > 0) {
    return usageError(`unexpected argument: ${positionals[0]}`);
  }

  const pgdata = values.get("--pgdata");
  if (pgdata === undefined || pgdata.length === 0) {
    return usageError("missing required --pgdata <dir>");
  }

  const tenantId = values.get("--tenant");
  if (tenantId === undefined) {
    return usageError("missing required --tenant <ten_...>");
  }
  if (!isPrivateTenantId(tenantId)) {
    return usageError("invalid --tenant: must match ^ten_[a-z0-9]{16,64}$");
  }

  const now = values.get("--now");
  if (now !== undefined && !TIMESTAMP.test(now)) {
    return usageError("invalid --now: must be an ISO-8601/RFC-3339 timestamp");
  }

  return { kind: "config", config: { pgdata, tenantId, now: now ?? null } };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Returns the process exit code; never throws, never leaves the PGlite
 * handle open. Kept separate from the `import.meta.main` guard so tests could
 * call it directly if ever needed, though the integration test exercises the
 * real subprocess instead (proving the --pgdata wiring end to end). */
export async function runRetentionCli(argv: readonly string[]): Promise<number> {
  const parsed = parseRetentionArgs(argv);
  if (parsed.kind === "usage-error") {
    console.error(parsed.message);
    console.error("");
    console.error(RETENTION_CLI_USAGE);
    return 1;
  }

  const now = parsed.config.now ?? new Date().toISOString();
  const db = new PGlite(parsed.config.pgdata);
  try {
    const report = await runRetentionSweep(db, sessionsCompactionSpec, parsed.config.tenantId, now);
    console.log(JSON.stringify(report, null, 2));
    return 0;
  } catch (error) {
    // Code-only: the owner prepares the database, so the only expected
    // failures here are structural (missing role/table) or D1's fail-closed
    // per-unit abort. Never a subject identifier or content.
    console.error(`retention sweep failed: ${errorMessage(error)}`);
    return 1;
  } finally {
    await db.close().catch(() => {});
  }
}

if (import.meta.main) {
  process.exit(await runRetentionCli(process.argv.slice(2)));
}
