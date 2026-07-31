/**
 * Org profile README table renderer (γ 3.6, design §6.4).
 *
 * Renders the « état des projets » table of `.github/profile/README.md` from
 * the fleet-status projection joined with the migration index — the hub row
 * always states its dismantling progress (removed/total paths), never its
 * lifecycle alone. The output lives between the project-status sentinels and
 * is never hand-edited.
 *
 * Usage: bun tools/presentation/render-org-readme.ts   (prints the section)
 */
import { STATUS_SECTION_BEGIN, STATUS_SECTION_END } from "../../ecosystem/project-cards";
import type { FleetStatus } from "../../ecosystem/render-fleet-status";

const LAYER_LABEL: Record<string, string> = {
  "couche-1": "Produits (couche 1)",
  "couche-2": "Orchestration (couche 2)",
  "couche-3": "Briques structurantes (couche 3)",
  "couche-4": "Atelier (couche 4)",
  transverse: "Transverse",
  moyeu: "Moyeu",
};

const HUB_STATE_LABEL: Record<string, string> = {
  "dismantling-in-progress": "en démantèlement",
  archived: "archivé",
};

export interface MigrationSummary {
  readonly total: number;
  readonly removed: number;
  readonly hub_state: string;
}

export function summarizeMigration(indexYaml: string): MigrationSummary {
  const document = (Bun as unknown as { YAML: { parse(t: string): unknown } }).YAML.parse(
    indexYaml,
  ) as {
    hub_state: string;
    entries: readonly { hub_removal_commit: string }[];
  };
  const removed = document.entries.filter((e) => e.hub_removal_commit !== "pending").length;
  return { total: document.entries.length, removed, hub_state: document.hub_state };
}

export function renderOrgSection(status: FleetStatus, migration: MigrationSummary): string {
  const lines: string[] = [
    STATUS_SECTION_BEGIN,
    "<!-- Section générée depuis les fiches project.v1.yaml de la constellation",
    "     (projection fleet-status) et l'index de migration du hub — ne pas éditer à la main. -->",
    "",
  ];
  let currentLayer = "";
  for (const row of status.rows) {
    if (row.layer !== currentLayer) {
      currentLayer = row.layer;
      lines.push(`### ${LAYER_LABEL[row.layer] ?? row.layer}`, "");
      lines.push("| Projet | Résumé | Avancement | Maturité | Vérifié le |");
      lines.push("| --- | --- | --- | --- | --- |");
    }
    lines.push(
      `| [${row.project}](https://github.com/${row.repository}) | ${row.summary} | ${row.display} | ${row.maturity} | ${row.last_verified_on} |`,
    );
  }
  // The landing page is French prose: every lifecycle the index can carry needs
  // its label here, or the raw machine token leaks into the shop window.
  const archived = migration.hub_state === "archived";
  lines.push(
    "",
    archived ? "### Moyeu archivé" : "### Moyeu en démantèlement",
    "",
    `Le hub historique [libre-ai/libre-ai](https://github.com/libre-ai/libre-ai) est ${HUB_STATE_LABEL[migration.hub_state] ?? migration.hub_state} : ${migration.removed}/${migration.total} chemins tracés à l'index de migration ont quitté le hub (double présence tant que la preuve verte n'est pas faite à destination — jamais d'absence).`,
    "",
    STATUS_SECTION_END,
  );
  return lines.join("\n");
}

if (import.meta.main) {
  const status = (await Bun.file(
    new URL("../../ecosystem/projections/fleet-status.v1.json", import.meta.url),
  ).json()) as FleetStatus;
  // The hub stays the authority of the migration index while it is being
  // dismantled — read it there, never from this repository's frozen copy.
  const result = Bun.spawnSync([
    "gh",
    "api",
    "repos/libre-ai/libre-ai/contents/ecosystem/migration-index.v1.yaml?ref=main",
    "-H",
    "Accept: application/vnd.github.raw+json",
  ]);
  if (result.exitCode !== 0) {
    console.error("cannot read the hub migration index");
    process.exit(1);
  }
  const migrationYaml = new TextDecoder().decode(result.stdout);
  console.log(renderOrgSection(status, summarizeMigration(migrationYaml)));
}
