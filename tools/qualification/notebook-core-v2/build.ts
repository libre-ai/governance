import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { transpileBytes } from "@bytecodealliance/jco-transpile";
import { componentNew, componentWit } from "@bytecodealliance/jco-transpile/wasm-tools";

const qualificationDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(qualificationDirectory, "../../..");
const outputDirectory = resolve(repositoryRoot, "target/notebook-core-v2-qualification");
const coreModule = resolve(
  repositoryRoot,
  "target/wasm32-unknown-unknown/release/libre_ai_notebook_core.wasm",
);
const componentPath = resolve(outputDirectory, "notebook-core.component.wasm");

function run(command: string, arguments_: string[]): void {
  const result = spawnSync(command, arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw new Error(`qualification command failed: ${command}`);
  }
}

function safeOutputPath(name: string): string {
  const output = resolve(outputDirectory, "generated", name);
  const relativePath = relative(resolve(outputDirectory, "generated"), output);
  if (relativePath.startsWith(`..${sep}`) || relativePath === "..") {
    throw new Error("transpiler emitted an unsafe path");
  }
  return output;
}

function sha256(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

run("cargo", [
  "build",
  "--locked",
  "-p",
  "libre-ai-notebook-core",
  "--release",
  "--target",
  "wasm32-unknown-unknown",
]);
await rm(outputDirectory, { force: true, recursive: true });
await mkdir(resolve(outputDirectory, "generated"), { recursive: true });

const coreBytes = new Uint8Array(await readFile(coreModule));
const componentBytes = await componentNew(coreBytes);
const wit = await componentWit(componentBytes);
if (!wit.includes("export libre-ai:notebook-core/api@2.0.0;") || wit.includes("import ")) {
  throw new Error("component WIT surface is not the closed Notebook API");
}
await writeFile(componentPath, componentBytes);
await writeFile(resolve(outputDirectory, "component.wit"), wit);
run("cargo", [
  "run",
  "--locked",
  "-p",
  "libre-ai-notebook-core",
  "--example",
  "check_wasm_imports",
  "--",
  coreModule,
  componentPath,
]);

const transpiled = await transpileBytes(componentBytes, {
  emitTypescriptDeclarations: true,
  instantiation: "async",
  name: "notebook-core",
  nodejsCompat: false,
  strict: true,
  wasiShim: false,
});
if (transpiled.imports.length !== 0) throw new Error("transpiled component has imports");
const expectedExports = new Set(["api:instance", "libre-ai:notebook-core/api@2.0.0:instance"]);
const actualExports = new Set(transpiled.exports.map(([name, kind]) => `${name}:${kind}`));
if (
  actualExports.size !== expectedExports.size ||
  [...expectedExports].some((value) => !actualExports.has(value))
) {
  throw new Error("transpiled component exports do not match the locked API");
}

for (const [name, bytes] of Object.entries(transpiled.files)) {
  const output = safeOutputPath(name);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes);
}

const transpiledCorePath = resolve(outputDirectory, "generated/notebook-core.core.wasm");
const transpiledCore = new WebAssembly.Module(await readFile(transpiledCorePath));
if (WebAssembly.Module.imports(transpiledCore).length !== 0) {
  throw new Error("transpiled core module has imports");
}

run("bun", [
  "build",
  resolve(qualificationDirectory, "host.ts"),
  "--target=browser",
  "--format=esm",
  `--outfile=${resolve(outputDirectory, "generated/host.js")}`,
]);
await writeFile(
  resolve(outputDirectory, "index.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><title>Notebook Core qualification</title><body>qualification-only</body></html>\n',
);

const generated = Object.fromEntries(
  await Promise.all(
    [...Object.keys(transpiled.files), "host.js"].sort().map(async (name) => {
      const bytes = await readFile(safeOutputPath(name));
      return [name, { bytes: bytes.length, sha256: sha256(bytes) }];
    }),
  ),
);
const manifest = {
  component: { bytes: componentBytes.length, sha256: sha256(componentBytes) },
  coreModule: { bytes: coreBytes.length, sha256: sha256(coreBytes) },
  generated,
  schemaVersion: "libre-ai.notebook-core-v2-qualification-manifest.v1",
  transpiler: "@bytecodealliance/jco-transpile@0.4.2",
};
await writeFile(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest)}\n`);

console.log(
  `Notebook browser harness built: component=${manifest.component.sha256} core=${manifest.coreModule.sha256} node=${process.versions.node}`,
);
