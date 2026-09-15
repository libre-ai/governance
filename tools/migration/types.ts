export interface Portfolio {
  schemaVersion: "public-portfolio.v1";
  sources: {
    source: string;
    localDirectory: string;
    disposition: "retain" | "rename" | "absorb" | "conditional" | "delete";
    target: string | null;
  }[];
  certainTargets: string[];
  conditionalTargets: string[];
}
export interface SourceObservation {
  source: string;
  identityVerified: boolean;
  accessible: boolean;
  defaultBranch: string;
  remoteCommit: string;
  localCommit: string;
  dirty: boolean;
  branches: { ref: string; commit: string }[];
  worktrees: { path: string; commit: string; dirty: boolean; detached: boolean }[];
  openPullRequests: number[];
  errors: string[];
}
export interface FrozenRepository {
  accessible: boolean;
  dirty: boolean;
  observationComplete: boolean;
  source: string;
  defaultBranch: string;
  remoteCommit: string;
  localCommit: string;
  blockers: string[];
  branches: { refDigest: string; commit: string }[];
  worktrees: { pathDigest: string; commit: string; dirty: boolean; detached: boolean }[];
  openPullRequests: number[];
}
export interface SourceFreezeV1 {
  schemaVersion: "source-freeze.v1";
  identityVerified: boolean;
  repositories: FrozenRepository[];
  digest: string;
}
