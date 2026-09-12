import { digestEvidence } from "./license-audit";
export interface LayoutFile {
  source: string;
  path: string;
  role: string;
}
export interface BoundaryEvidence {
  component: string;
  prefix: string;
  consumerDigest: string;
  reachabilityDigest: string;
  reviewDigest: string;
}
function beneath(path: string, prefix: string): boolean {
  return path.startsWith(`${prefix}/`);
}
export function validateTargetLayout(
  slug: string,
  files: LayoutFile[],
  boundaries: BoundaryEvidence[],
  trustedBoundaryDigests: readonly string[],
): void {
  for (const file of files) {
    const path = file.path;
    if (
      path.startsWith("/") ||
      path.split("/").some((part) => !part || part === "." || part === "..") ||
      /[\\\p{C}]/u.test(path)
    )
      throw new Error("target-layout-rejected");
    if (["notice", "documentation", "test", "example", "asset"].includes(file.role)) continue;
    if (
      slug === "missions" &&
      ["missions-auth", "build-brief"].includes(file.source) &&
      !/^apps\/missions\/src\/(?:app|authz|domain|persistence|server|shared|ui)\//.test(path)
    )
      throw new Error("target-layout-rejected");
    if (slug === "missions" && /(?:^|\/)features\//.test(path))
      throw new Error("target-layout-rejected");
    if (slug === "contracts") {
      if (file.role === "generated" && !/^generated\/(?:typescript|rust)\//.test(path))
        throw new Error("target-layout-rejected");
      if (file.role === "contract" && !beneath(path, "contracts"))
        throw new Error("target-layout-rejected");
      if (file.role !== "generated" && /^generated\/(?:typescript|rust)\//.test(path))
        throw new Error("target-layout-rejected");
    }
    const internal =
      (slug === "governance" && file.source === "ecosystem-engine") ||
      (slug === "mission-control" && file.source === "envelope") ||
      (slug === "sessions" &&
        file.source === "rgpd-kit" &&
        !beneath(path, "apps/sessions/src/rgpd"));
    if (
      internal &&
      !boundaries.some(
        (proof) =>
          proof.component === file.source &&
          beneath(path, proof.prefix) &&
          [proof.consumerDigest, proof.reachabilityDigest, proof.reviewDigest].every((value) =>
            /^[a-f0-9]{64}$/.test(value),
          ) &&
          trustedBoundaryDigests.includes(digestEvidence(proof)),
      )
    )
      throw new Error("target-layout-rejected");
  }
}
