import { describe, expect, test } from "bun:test";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import {
  type ActorKind,
  type EventType,
  validateEvent,
} from "../../apps/sessions/src/domain/session-event";
import { appendEvent } from "../../apps/sessions/src/persistence/session-event-store";
import { withTenantDbTransaction } from "../../packages/data/src/adapters/tenant-transaction";
import { parseRetentionArgs, RETENTION_CLI_USAGE } from "./run-retention";

// Unit: the pure arg parser (RED-first — no filesystem, no PGlite, no
// subprocess). One typed result carries either a config or a usage error
// (brief: "keep parseRetentionArgs pure and exported").

describe("parseRetentionArgs", () => {
  test("valid full invocation parses pgdata, tenant and an explicit --now", () => {
    const result = parseRetentionArgs([
      "--pgdata",
      "./retention-pgdata",
      "--tenant",
      "ten_aaaaaaaaaaaaaaaa",
      "--now",
      "2026-07-24T00:00:00Z",
    ]);
    expect(result).toEqual({
      kind: "config",
      config: {
        pgdata: "./retention-pgdata",
        tenantId: "ten_aaaaaaaaaaaaaaaa",
        now: "2026-07-24T00:00:00Z",
      },
    });
  });

  test("--now is optional: omitting it yields now: null (the CLI defaults at run time, not in the pure parser)", () => {
    const result = parseRetentionArgs([
      "--pgdata",
      "./retention-pgdata",
      "--tenant",
      "ten_aaaaaaaaaaaaaaaa",
    ]);
    expect(result).toEqual({
      kind: "config",
      config: { pgdata: "./retention-pgdata", tenantId: "ten_aaaaaaaaaaaaaaaa", now: null },
    });
  });

  test("flags may appear in any order", () => {
    const result = parseRetentionArgs([
      "--tenant",
      "ten_aaaaaaaaaaaaaaaa",
      "--now",
      "2026-07-24T00:00:00Z",
      "--pgdata",
      "./retention-pgdata",
    ]);
    expect(result.kind).toBe("config");
  });

  test("missing --pgdata is a usage error naming the flag", () => {
    const result = parseRetentionArgs(["--tenant", "ten_aaaaaaaaaaaaaaaa"]);
    expect(result.kind).toBe("usage-error");
    if (result.kind !== "usage-error") return;
    expect(result.message).toContain("--pgdata");
  });

  test("missing --tenant is a usage error naming the flag", () => {
    const result = parseRetentionArgs(["--pgdata", "./retention-pgdata"]);
    expect(result.kind).toBe("usage-error");
    if (result.kind !== "usage-error") return;
    expect(result.message).toContain("--tenant");
  });

  test("an empty argv is a usage error, not an exception", () => {
    const result = parseRetentionArgs([]);
    expect(result.kind).toBe("usage-error");
  });

  test("a malformed --tenant (wrong shape) is a usage error", () => {
    const result = parseRetentionArgs([
      "--pgdata",
      "./retention-pgdata",
      "--tenant",
      "not-a-tenant",
    ]);
    expect(result.kind).toBe("usage-error");
    if (result.kind !== "usage-error") return;
    expect(result.message).toContain("--tenant");
  });

  test("the public service tenant is rejected (this CLI sweeps ONE private tenant)", () => {
    const result = parseRetentionArgs(["--pgdata", "./retention-pgdata", "--tenant", "public"]);
    expect(result.kind).toBe("usage-error");
  });

  test("a malformed --now (not ISO-8601) is a usage error", () => {
    const result = parseRetentionArgs([
      "--pgdata",
      "./retention-pgdata",
      "--tenant",
      "ten_aaaaaaaaaaaaaaaa",
      "--now",
      "not-a-date",
    ]);
    expect(result.kind).toBe("usage-error");
    if (result.kind !== "usage-error") return;
    expect(result.message).toContain("--now");
  });

  test("an unknown flag is a usage error", () => {
    const result = parseRetentionArgs([
      "--pgdata",
      "./retention-pgdata",
      "--tenant",
      "ten_aaaaaaaaaaaaaaaa",
      "--bogus",
      "x",
    ]);
    expect(result.kind).toBe("usage-error");
    if (result.kind !== "usage-error") return;
    expect(result.message).toContain("--bogus");
  });

  test("a flag missing its value is a usage error", () => {
    const result = parseRetentionArgs(["--pgdata"]);
    expect(result.kind).toBe("usage-error");
  });

  test("an unexpected positional argument is a usage error", () => {
    const result = parseRetentionArgs([
      "--pgdata",
      "./retention-pgdata",
      "--tenant",
      "ten_aaaaaaaaaaaaaaaa",
      "extra",
    ]);
    expect(result.kind).toBe("usage-error");
  });
});

describe("RETENTION_CLI_USAGE", () => {
  test("documents both required flags and one placeholder-path example invocation", () => {
    expect(RETENTION_CLI_USAGE).toContain("--pgdata");
    expect(RETENTION_CLI_USAGE).toContain("--tenant");
    expect(RETENTION_CLI_USAGE).toContain("--now");
    expect(RETENTION_CLI_USAGE).toContain("run-retention.ts");
    // Never a machine-local absolute path in the shipped usage text.
    expect(RETENTION_CLI_USAGE).not.toContain("/Users/");
  });
});

// Integration: a real file-backed PGlite directory, migrated exactly like the
// owner would (packages/data + apps/sessions migrations, no extra grants
// invented here), seeded with one fully-expired session, then the CLI
// invoked as a real subprocess — proving the --pgdata wiring, not just the
// orchestrator already covered by retention.integration.test.ts.

const REPO_ROOT = join(import.meta.dir, "..", "..");
const DATA_MIGRATIONS = join(REPO_ROOT, "packages", "data", "migrations");
const SESSIONS_MIGRATIONS = join(REPO_ROOT, "apps", "sessions", "migrations");
const CLI_SCRIPT = join("tools", "ops", "run-retention.ts");

const TENANT = "ten_cccccccccccccccc";
const OLD = "2020-01-01T00:00:00Z";
const NOW = "2026-07-24T00:00:00Z"; // far past the contract default P90D window

/** Mirror of @libre-ai/testing's applyMigrations, for a directly-constructed
 * (file-backed) PGlite instance rather than the in-memory harness. */
async function applyMigrationsTo(db: PGlite, dir: string): Promise<void> {
  const entries = await readdir(dir);
  const files = entries.filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = await readFile(join(dir, file), "utf8");
    await db.exec("BEGIN");
    try {
      await db.exec(sql);
      await db.exec("COMMIT");
    } catch (error) {
      await db.exec("ROLLBACK");
      throw new Error(`migration ${file} failed: ${String(error)}`, { cause: error });
    }
  }
}

interface SeedEvent {
  readonly sequence: number;
  readonly type: EventType;
  readonly actorId: string;
  readonly actorKind?: ActorKind;
}

let eventSeq = 0;

function buildEvent(sessionId: string, spec: SeedEvent) {
  eventSeq += 1;
  const outcome = validateEvent({
    schemaVersion: "libre-ai.session-event.v1",
    id: `urn:libre-ai:event:ev-${eventSeq}`,
    tenantId: TENANT,
    sessionId,
    sequence: spec.sequence,
    revision: spec.sequence - 1,
    type: spec.type,
    actor: { kind: spec.actorKind ?? "human", id: spec.actorId },
    occurredAt: OLD,
    data: {},
  });
  if (!outcome.ok) throw new Error(`fixture invalid: ${outcome.refusal}`);
  return outcome.value;
}

async function seedExpiredSession(db: PGlite, sessionId: string): Promise<void> {
  const events: readonly SeedEvent[] = [
    { sequence: 1, type: "session-created", actorId: "owner-alpha" },
    { sequence: 2, type: "participant-joined", actorId: "member-bob" },
    { sequence: 3, type: "session-closed", actorId: "owner-alpha" },
  ];
  await withTenantDbTransaction(db, TENANT, async (tx) => {
    for (const spec of events) {
      await appendEvent(tx, buildEvent(sessionId, spec), OLD);
    }
  });
}

const EVIDENCE_REPORT_KEYS = [
  "compactedReceiptIds",
  "eventsDeleted",
  "owner",
  "ruleId",
  "sessionsDeleted",
  "sessionsSelected",
  "sweptAt",
  "tenantId",
].sort();

describe("run-retention.ts CLI (integration, file-backed PGlite subprocess)", () => {
  test("sweeps one expired session end to end: exit 0, exact evidence-report keys, sessionsDeleted === 1", async () => {
    const pgdataDir = await mkdtemp(join(tmpdir(), "retention-cli-"));
    try {
      const db = new PGlite(pgdataDir);
      await applyMigrationsTo(db, DATA_MIGRATIONS);
      await applyMigrationsTo(db, SESSIONS_MIGRATIONS);
      await seedExpiredSession(db, "urn:libre-ai:session:s-cli-expired");
      await db.close();

      const proc = Bun.spawn({
        cmd: ["bun", CLI_SCRIPT, "--pgdata", pgdataDir, "--tenant", TENANT, "--now", NOW],
        cwd: REPO_ROOT,
        stdout: "pipe",
        stderr: "pipe",
      });
      const [stdout, stderr, exitCode] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]);

      expect(stderr).toBe("");
      expect(exitCode).toBe(0);
      const report = JSON.parse(stdout);
      expect(Object.keys(report).sort()).toEqual(EVIDENCE_REPORT_KEYS);
      expect(report.owner).toBe("sessions");
      expect(report.ruleId).toBe("sessions-content");
      expect(report.tenantId).toBe(TENANT);
      expect(report.sweptAt).toBe(NOW);
      expect(report.sessionsSelected).toBe(1);
      expect(report.sessionsDeleted).toBe(1);
      expect(report.eventsDeleted).toBe(3);
      expect(report.compactedReceiptIds).toEqual([]);
    } finally {
      await rm(pgdataDir, { recursive: true, force: true });
    }
  }, 30_000);

  test("an invalid --tenant fails closed: exit 1, usage on stderr, no stack trace, nothing on stdout", async () => {
    const proc = Bun.spawn({
      cmd: ["bun", CLI_SCRIPT, "--pgdata", "./unused-pgdata", "--tenant", "not-a-tenant"],
      cwd: REPO_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    expect(exitCode).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toContain("--tenant");
    expect(stderr).toContain("usage:");
    expect(stderr).not.toContain("\n    at ");
    expect(stderr).not.toContain(".ts:");
  }, 30_000);
});
