export {};

const forbiddenLockfiles = new Set([
  "bun.lockb",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
]);
const forbiddenSourceExtensions = [".js", ".jsx", ".mjs", ".cjs"];
const ignoredPrefixes = [".git/", ".tools/", "node_modules/", "target/", "dist/"];
const failures: string[] = [];
const glob = new Bun.Glob("**/*");

for await (const path of glob.scan({ cwd: ".", dot: true, onlyFiles: true })) {
  if (ignoredPrefixes.some((prefix) => path.startsWith(prefix))) continue;
  const name = path.split("/").at(-1) ?? path;
  if (forbiddenLockfiles.has(name)) failures.push(`Forbidden lockfile: ${path}`);
  if (forbiddenSourceExtensions.some((extension) => path.endsWith(extension))) {
    failures.push(`Forbidden JavaScript source: ${path}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log("Source policy verified");
