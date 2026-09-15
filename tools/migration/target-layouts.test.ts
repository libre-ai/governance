import { expect, test } from "bun:test";
import { digestEvidence } from "./license-audit";
import { type LayoutFile, validateTargetLayout } from "./target-layouts";

const file = (source: string, path: string, role: LayoutFile["role"] = "code"): LayoutFile => ({
  source,
  path,
  role,
});
test.each([
  ["missions", [file("missions-auth", "apps/missions/src/features/auth/index.ts")]],
  ["missions", [file("build-brief", "packages/build-brief/index.ts")]],
  ["contracts", [file("contracts", "contracts/client.ts", "generated")]],
  ["contracts", [file("contracts", "generated/rust/lib.rs", "contract")]],
  ["sessions", [file("rgpd-kit", "packages/rgpd-kit/index.ts")]],
  ["governance", [file("ecosystem-engine", "crates/engine/src/lib.rs")]],
  ["mission-control", [file("envelope", "crates/envelope/src/lib.rs")]],
] as const)("%s rejects unproved architectural boundary", (slug, files) =>
  expect(() => validateTargetLayout(slug, [...files], [], [])).toThrow("target-layout-rejected"));
test("existing domains, integrated data rights and separate generated contracts accepted", () => {
  expect(() =>
    validateTargetLayout(
      "missions",
      [
        file("missions-auth", "apps/missions/src/authz/check.ts"),
        file("build-brief", "apps/missions/src/domain/brief.ts"),
      ],
      [],
      [],
    ),
  ).not.toThrow();
  expect(() =>
    validateTargetLayout(
      "sessions",
      [file("rgpd-kit", "apps/sessions/src/rgpd/delete.ts")],
      [],
      [],
    ),
  ).not.toThrow();
  expect(() =>
    validateTargetLayout(
      "contracts",
      [
        file("contracts", "contracts/request.json", "contract"),
        file("contracts", "generated/typescript/client.ts", "generated"),
      ],
      [],
      [],
    ),
  ).not.toThrow();
});
test("internal boundary needs separately trusted consumer and reachability evidence", () => {
  const proof = {
    component: "envelope",
    prefix: "crates/envelope",
    consumerDigest: "a".repeat(64),
    reachabilityDigest: "b".repeat(64),
    reviewDigest: "c".repeat(64),
  };
  expect(() =>
    validateTargetLayout(
      "mission-control",
      [file("envelope", "crates/envelope/src/lib.rs")],
      [proof],
      [digestEvidence(proof)],
    ),
  ).not.toThrow();
  expect(() =>
    validateTargetLayout(
      "mission-control",
      [file("envelope", "crates/envelope/src/lib.rs")],
      [proof],
      [],
    ),
  ).toThrow();
});

test("required notices may retain reviewed target-root paths without inventing a runtime boundary", () => {
  expect(() =>
    validateTargetLayout(
      "missions",
      [{ source: "missions-auth", path: "LICENSES/auth.txt", role: "notice" }],
      [],
      [],
    ),
  ).not.toThrow();
  expect(() =>
    validateTargetLayout(
      "sessions",
      [{ source: "rgpd-kit", path: "NOTICE", role: "notice" }],
      [],
      [],
    ),
  ).not.toThrow();
});
