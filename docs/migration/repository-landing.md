# Reviewed repository landing candidate

This S2 toolkit consumes an already admitted `PublicationSelection`. It neither changes real
repository READMEs nor admits a product. Canonical names, conditional verdicts, proof receipts,
current-capability text and bilingual invariants remain owned by `portfolio/`. The renderer
never accepts a caller's standalone contract as publication authority.

## Trust boundary

`authorizeRepositoryLanding(selection, material, reviewBytes, expectedReviewDigest)` returns an
opaque, non-forgeable grant. The release host supplies the SHA-256 of independently reviewed
policy bytes outside the material. A hash supplied alongside its own unreviewed policy is not
an independent review. The host must retain the review's signer/provenance and qualify that
trust transfer before public use; this local toolkit does not infer it from file location.

The policy has these exact fields:

```ts
interface LandingReview {
  schemaVersion: "repository-landing-review.v1";
  slug: string;
  contractDigest: string;
  assetPath: "docs/assets/product-proof.png" | "docs/assets/product-proof.webp";
  captureSource: string;
  quickStartSource: string;
  captureReceiptDigest: string;
  quickStartReceiptDigest: string;
}
```

Both receipt sources and their exact SHA-256 digests must occur in the admitted contract's
signed evidence set. The capture receipt binds the actual supplied image bytes, source
revision, recipe digest, media type and capture date. The quick-start receipt binds the exact
command bytes, revision, recipe, date and a passing anonymous clean-environment result.
Generic portfolio admission alone cannot satisfy either requirement.

```ts
interface ProductCaptureReceipt {
  schemaVersion: "product-capture.v1";
  kind: "product-output" | "product-screenshot";
  revision: string;       // full Git object ID; same revision in the admitted source URL
  recipeDigest: string;  // reviewed execution recipe SHA-256
  assetDigest: string;   // recomputed from the supplied image bytes
  mediaType: "image/png" | "image/webp";
  result: "passed";
  capturedAt: string;    // no later than the admitted evidence verification date
}
interface AnonymousQuickStartReceipt {
  schemaVersion: "anonymous-quick-start.v1";
  revision: string;
  recipeDigest: string;
  commandDigest: string; // recomputed from the exact UTF-8 quick-start text
  environment: "anonymous-clean";
  result: "passed";
  verifiedAt: string;
}
```

A trusted reviewer must establish that these receipts describe the real green product flow,
not a mockup. The implementation verifies their immutable binding and checks the passive
PNG/WebP container; it does not decode images or establish screenshot authenticity from magic
bytes. The reviewed capture process must provide that qualification. Raw path strings,
generated mockups, arbitrary `passed` values and unreviewed self-issued policy are not evidence.
The synthetic tests explicitly model reviewed receipts and a one-pixel image; they are never
real product or publication evidence.

## API and limits

`LandingMaterial` supplies `quickStart`, actual `proofAsset: Uint8Array`, `captureReceipt`,
`quickStartReceipt`, and `badges` (admitted evidence source URLs). Receipt/policy bytes cap at
32 KiB, images at 8 MiB, commands at 4,096 UTF-16 units, and source READMEs at 2 MiB. Only the
fixed proof-asset path variants above are allowed. No SVG, remote image, tracking badge or
arbitrary target path is generated. At most four distinct proof badges and three Works with
dependencies are admitted; each displayed dependency also requires its own opaque grant.

The grant snapshots inputs. Later caller mutation cannot alter the reviewed command, image,
contract or dependencies. Asset access returns a copy. Rendering rechecks publication grants.

```ts
const landing = authorizeRepositoryLanding(selection, material, reviewBytes, reviewedDigest);
const { en, fr } = renderRepositoryLandingPair(landing);
const proofAsset = repositoryProofAsset(landing);
const updatedEnglish = updateRepositoryLanding(existingEnglish, landing, "en");
const updatedFrench = updateRepositoryLanding(existingFrench, landing, "fr");
```

Imports come from `tools/presentation/apply-repository-projection.ts`. There is no filesystem
writer or public CLI in this toolkit. The consuming composition/release step must preserve the
pair and exact returned asset bytes together and rerun its write/admission gates.

The required order is identity/benefit/visual, outcome and limitation, quick start, trust,
contribution, reference. Both languages share the asset, command and proof URLs/dates; each
links back to the other README. Markdown prose and command HTML are escaped. Product behavior
routes to the product repository, common policy to Governance. No automatic issue-label claim,
star badge, hero star CTA or star request is emitted. A future post-proof star action needs its
own reviewed release/quick-start gate; it cannot be inferred from this candidate rendering.

## Marker-safe updates

The updater requires exactly one ordered pair of standalone lines:

```md
<!-- libre-ai:repository-landing:begin -->
<!-- generated content -->
<!-- libre-ai:repository-landing:end -->
```

Missing, duplicate, inline or reversed markers refuse. Only the marked block is replaced;
prefix/suffix bytes are preserved, and repeated updates are identical. Existing text outside
the block is not silently approved: target reviewers must remove obsolete public authority
before the final target can be admitted. The updater cannot accept arbitrary generated Markdown.

## Verification and remaining admission

Run `bun test --config=/dev/null tools/presentation/apply-repository-projection.test.ts`, then
the ordinary repository gates. Tests exercise actual Ed25519 portfolio receipts and temporary
bilingual README files, using explicitly synthetic evidence. They include tampered assets,
commands, policy bytes, receipts, invalid names, conditional admission, language mismatch,
absent limitations, internal terms, excess badges/dependencies, star labels and marker errors.

Real captures, anonymous quick starts for all admitted repositories, human-reviewed bilingual
copy, trusted release-host policy transfer and independent target commits remain external.
No real catalog, target README, package script or publication authority is changed by this task.

Raw HTML before the opening generated marker is conservatively refused, even if apparently
closed. The updater does not claim to parse the full Markdown/HTML grammar; it
preserves source bytes by refusing unsupported contexts rather than rewriting them.
