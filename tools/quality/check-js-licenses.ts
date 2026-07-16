export {};

const allowed = new Set([
  "MIT",
  "Apache-2.0",
  "MIT OR Apache-2.0",
  "0BSD",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "MPL-2.0",
]);
const failures: string[] = [];
const checked = new Set<string>();
const glob = new Bun.Glob("node_modules/**/package.json");

for await (const path of glob.scan({ cwd: ".", dot: true, onlyFiles: true })) {
  let manifest: { name?: string; version?: string; license?: string };
  try {
    manifest = await Bun.file(path).json();
  } catch {
    failures.push(`${path}: invalid package manifest`);
    continue;
  }

  if (!manifest.name || !manifest.version) continue;
  const id = `${manifest.name}@${manifest.version}`;
  if (checked.has(id)) continue;
  checked.add(id);

  if (!manifest.license) {
    failures.push(`${id}: missing license`);
  } else if (!allowed.has(manifest.license)) {
    failures.push(`${id}: forbidden or unreviewed license ${manifest.license}`);
  }
}

if (checked.size === 0) failures.push("No installed JavaScript dependency found");
if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(`JavaScript dependency licenses verified: ${checked.size}`);
