import { describe, expect, test } from "bun:test";
import { type SecretFinding, scanForSecrets } from "./check-secret-scan";

/**
 * WP-G2-Q01 acceptance criterion 2, the "secret" gate: no committed
 * credential appears in any living surface. The detector itself
 * (containsSensitivePublicMarker) is already covered by
 * public-source-scanner.test.ts and its self-tests; here we cover only the
 * tree-wide gate wiring — scope, exclusions, path/line reporting — reusing
 * that detector rather than duplicating the credential patterns.
 */

function findingsFor(path: string, content: string): SecretFinding[] {
  return scanForSecrets([{ path, content }]);
}

describe("scanForSecrets", () => {
  test("flags an AWS access key id on its line", () => {
    const findings = findingsFor("apps/x/config.ts", "const id = 'AKIA1234567890ABCDEF';");
    expect(findings).toHaveLength(1);
    expect(findings[0]?.path).toBe("apps/x/config.ts");
    expect(findings[0]?.line).toBe(1);
  });

  test("flags a private key header", () => {
    const findings = findingsFor(
      "deploy/key.pem",
      "line one\n-----BEGIN OPENSSH PRIVATE KEY-----\nbase64",
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]?.line).toBe(2);
  });

  test("flags a GitHub token", () => {
    const findings = findingsFor(
      "scripts/ci.ts",
      "const t = 'ghp_0123456789abcdefghijABCDEFGHIJ0123';",
    );
    expect(findings).toHaveLength(1);
  });

  test("does NOT flag ordinary source without secrets", () => {
    const findings = findingsFor(
      "packages/data/src/x.ts",
      "export const answer = 42;\nconst name = 'radar';",
    );
    expect(findings).toHaveLength(0);
  });

  test("excludes the secret detector source itself (it holds the patterns)", () => {
    const findings = findingsFor(
      "tools/quality/public-source-scanner.ts",
      "const marker = /AKIA[0-9A-Z]{16}/;",
    );
    expect(findings).toHaveLength(0);
  });

  test("excludes this gate's own test fixtures", () => {
    const findings = findingsFor(
      "tools/quality/check-secret-scan.test.ts",
      "const id = 'AKIA1234567890ABCDEF';",
    );
    expect(findings).toHaveLength(0);
  });

  test("excludes non-normative review evidence", () => {
    const findings = findingsFor(
      "crates/authz-biscuit/evidence/reviews/x/NOTE.md",
      "example token ghp_0123456789abcdefghijABCDEFGHIJ0123",
    );
    expect(findings).toHaveLength(0);
  });
});
