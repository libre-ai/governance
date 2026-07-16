import Ajv2020, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";

const schema = (await Bun.file("ecosystem/schemas/knowledge-object.schema.json").json()) as object;
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const glob = new Bun.Glob("ecosystem/objects/**/*.json");
const failures: string[] = [];
let checked = 0;

function safeError(error: ErrorObject): string {
  const message = error.message ?? "invalid";
  return `${error.instancePath || "/"}: ${message} (${error.keyword})`;
}

for await (const path of glob.scan({ cwd: ".", onlyFiles: true })) {
  checked += 1;
  let value: unknown;
  try {
    value = await Bun.file(path).json();
  } catch {
    failures.push(`${path}: invalid JSON`);
    continue;
  }

  if (!validate(value)) {
    for (const error of validate.errors ?? []) {
      failures.push(`${path}${safeError(error)}`);
    }
  }
}

if (checked === 0) failures.push("No Knowledge Object found");
if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(`Knowledge Objects verified: ${checked}`);
