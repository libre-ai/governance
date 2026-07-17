import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  type NotebookHardwareResources,
  parseResourceClassManifest,
  selectResourceClass,
} from "./resource-class";

const repositoryRoot = process.cwd();
const manifestPath = resolve(repositoryRoot, "toolchains/notebook-resource-classes.json");
const manifestBytes = readFileSync(manifestPath);
const manifest = parseResourceClassManifest(JSON.parse(manifestBytes.toString("utf8")));
const hardware: NotebookHardwareResources = {
  architecture: process.arch,
  logicalCpu: Number(command("sysctl", ["-n", "hw.logicalcpu"])),
  memoryBytes: Number(command("sysctl", ["-n", "hw.memsize"])),
  operatingSystem: process.platform,
  processor: command("sysctl", ["-n", "machdep.cpu.brand_string"]),
};
const selected = selectResourceClass(
  manifest,
  process.env.NOTEBOOK_QUALIFICATION_DEVICE_CLASS,
  hardware,
);
const manifestSha256 = createHash("sha256").update(manifestBytes).digest("hex");

console.log(
  `Notebook resource class verified: ${selected.id}, memory=${hardware.memoryBytes}, logicalCpu=${hardware.logicalCpu}, evidence=${selected.evidenceStatus}, manifest=${manifestSha256}`,
);

function command(executable: string, arguments_: string[]): string {
  return execFileSync(executable, arguments_, { encoding: "utf8" }).trim();
}
