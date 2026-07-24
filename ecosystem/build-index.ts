/**
 * Machine-readable repository index generator (positioning L2).
 *
 * repositories.v1.yaml is the single source of the public topology (ADR-0009
 * §7), but YAML with prose comments is hostile to machine consumers (org
 * profile projection, website, drift tooling). This script derives a
 * deterministic JSON index from it: same facts, stable field order, entries
 * sorted by repository name, no execution timestamp — so the committed file
 * only changes when the inventory changes, and a CI regeneration diff is a
 * meaningful drift signal, never noise.
 *
 * Field names stay snake_case to mirror the source YAML keys byte-for-byte:
 * a consumer can trace every index field back to the inventory without a
 * mapping table.
 *
 * Usage: bun ecosystem/build-index.ts
 * Writes: distribution/index/repositories.v1.json
 */

export const INDEX_SCHEMA_VERSION = "libre-ai.repository-index.v1";
export const INVENTORY_SOURCE = "ecosystem/repositories.v1.yaml";

export type Visibility = "public" | "private";

export interface InventoryEntry {
  repository: string;
  name: string;
  layer: string;
  role: string;
  visibility: Visibility;
  lifecycle: string;
  exposure: string;
  criteria_status?: string;
  benchmark_url?: string;
  canonical_paths?: string[];
}

export interface RepositoryIndex {
  schema_version: typeof INDEX_SCHEMA_VERSION;
  source: typeof INVENTORY_SOURCE;
  source_schema_version: string;
  source_updated_on: string;
  exposure_scale: string[];
  repositories: InventoryEntry[];
}

// @types/bun for the pinned toolchain does not declare Bun.YAML yet; the same
// narrowing cast is already used by tools/quality/check-contracts.ts.
const yamlApi = (Bun as unknown as { YAML: { parse(text: string): unknown } }).YAML;

function fail(path: string, expected: string, actual: unknown): never {
  throw new Error(`${INVENTORY_SOURCE}: ${path}: expected ${expected}, got ${typeof actual}`);
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "a mapping", value);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(path, "a non-empty string", value);
  }
  return value;
}

function asStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    fail(path, "a sequence of strings", value);
  }
  return value.map((item, i) => asString(item, `${path}[${i}]`));
}

function asVisibility(value: unknown, path: string): Visibility {
  const text = asString(value, path);
  if (text !== "public" && text !== "private") {
    fail(path, '"public" or "private"', value);
  }
  return text;
}

function optionalString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string | undefined {
  return record[key] === undefined ? undefined : asString(record[key], `${path}.${key}`);
}

/**
 * The public display name of an entry: the product or application it hosts
 * when it hosts one, otherwise the bare repository name (hub, org profile,
 * standalone tooling).
 */
function publicName(record: Record<string, unknown>, repository: string, path: string): string {
  const product = optionalString(record, "product", path);
  if (product !== undefined) return product;
  const application = optionalString(record, "application", path);
  if (application !== undefined) return application;
  const bare = repository.split("/").at(-1);
  if (bare === undefined || bare.length === 0) {
    fail(`${path}.repository`, "an owner/name repository slug", repository);
  }
  return bare;
}

/** Evidence link: only a structured benchmark carries a URL; the string forms
 * ("TBD…", "n/a…") are prose, not links. */
function benchmarkUrl(record: Record<string, unknown>, path: string): string | undefined {
  const benchmark = record.benchmark;
  if (typeof benchmark !== "object" || benchmark === null || Array.isArray(benchmark)) {
    return undefined;
  }
  return optionalString(asRecord(benchmark, `${path}.benchmark`), "url", `${path}.benchmark`);
}

function toEntry(value: unknown, index: number): InventoryEntry {
  const path = `repositories[${index}]`;
  const record = asRecord(value, path);
  const repository = asString(record.repository, `${path}.repository`);
  const entry: InventoryEntry = {
    repository,
    name: publicName(record, repository, path),
    layer: asString(record.layer, `${path}.layer`),
    role: asString(record.role, `${path}.role`),
    visibility: asVisibility(record.visibility, `${path}.visibility`),
    lifecycle: asString(record.lifecycle, `${path}.lifecycle`),
    exposure: asString(record.exposure, `${path}.exposure`),
  };
  const criteriaStatus = optionalString(record, "criteria_status", path);
  if (criteriaStatus !== undefined) entry.criteria_status = criteriaStatus;
  const url = benchmarkUrl(record, path);
  if (url !== undefined) entry.benchmark_url = url;
  if (record.canonical_paths !== undefined) {
    entry.canonical_paths = asStringArray(record.canonical_paths, `${path}.canonical_paths`);
  }
  return entry;
}

export function buildIndex(yamlText: string): RepositoryIndex {
  const document = asRecord(yamlApi.parse(yamlText), "document");
  const exposureScale = asStringArray(document.exposure_scale, "exposure_scale");
  const rawEntries = document.repositories;
  if (!Array.isArray(rawEntries) || rawEntries.length === 0) {
    fail("repositories", "a non-empty sequence", rawEntries);
  }
  const repositories = rawEntries.map(toEntry);

  const seen = new Set<string>();
  for (const entry of repositories) {
    if (seen.has(entry.repository)) {
      throw new Error(`${INVENTORY_SOURCE}: duplicate repository entry ${entry.repository}`);
    }
    seen.add(entry.repository);
    if (!exposureScale.includes(entry.exposure)) {
      throw new Error(
        `${INVENTORY_SOURCE}: ${entry.repository}: exposure "${entry.exposure}" is not on the exposure_scale`,
      );
    }
  }

  // Code-unit comparison, not localeCompare: the sort must be identical on
  // every machine and locale for the committed index to be reproducible.
  repositories.sort((a, b) => {
    if (a.repository < b.repository) return -1;
    if (a.repository > b.repository) return 1;
    return 0;
  });

  return {
    schema_version: INDEX_SCHEMA_VERSION,
    source: INVENTORY_SOURCE,
    source_schema_version: asString(document.schema_version, "schema_version"),
    source_updated_on: asString(document.updated_on, "updated_on"),
    exposure_scale: exposureScale,
    repositories,
  };
}

export function renderIndex(index: RepositoryIndex): string {
  return `${JSON.stringify(index, null, 2)}\n`;
}

if (import.meta.main) {
  const sourceUrl = new URL("repositories.v1.yaml", import.meta.url);
  const targetUrl = new URL("../distribution/index/repositories.v1.json", import.meta.url);
  const index = buildIndex(await Bun.file(sourceUrl).text());
  await Bun.write(targetUrl, renderIndex(index));
  console.log(
    `wrote distribution/index/repositories.v1.json (${index.repositories.length} repositories)`,
  );
}
