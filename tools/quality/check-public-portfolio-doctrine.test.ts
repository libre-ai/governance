import { describe, expect, test } from "bun:test";

import {
  inspectDoctrineDocuments,
  inspectPublicPortfolioDoctrine,
  readDoctrineDocuments,
} from "./check-public-portfolio-doctrine";

describe("public portfolio doctrine", () => {
  test("keeps the interactive Missions demo outside the static Website boundary", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const path = "docs/adr/0041-public-portfolio-big-bang.md";
    const boundary = "Website remains static without client JavaScript";
    expect(documents[path]).toContain(boundary);
    expect(
      inspectDoctrineDocuments({
        ...documents,
        [path]: documents[path]?.replace(boundary, "Website may execute client JavaScript") ?? "",
      }).conflicts,
    ).not.toEqual([]);
  });

  test("has one bounded authority without overwriting newer authorities", async () => {
    const result = await inspectPublicPortfolioDoctrine(process.cwd());
    expect(result.promise).toBe("AI work you can verify.");
    expect(result.invariantIds).toEqual(["I-32"]);
    expect(result.decisionIds).toEqual(["D46"]);
    expect(result.conflicts).toEqual([]);
  });

  for (const claim of [
    "Master promise: Possédez la fabrique.",
    "The figurative direction is Workshop Gantry.",
    "Public migration phases come from project.v1.yaml.",
    "Repositories exist through general activation.",
    "Public histories must be preserved.",
    "The primary CTA is starter.",
  ]) {
    test(`refuses active obsolete authority: ${claim}`, async () => {
      const documents = await readDoctrineDocuments(process.cwd());
      const changed = {
        ...documents,
        "brand/README.en.md": `${documents["brand/README.en.md"]}\n${claim}\n`,
      };
      expect(inspectDoctrineDocuments(changed).conflicts).not.toEqual([]);
    });
  }

  test("historical citations do not revive superseded doctrine", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    expect(documents["docs/adr/0033-open-verifiable-brand-system.md"]).toContain(
      "Possédez la fabrique.",
    );
    expect(inspectDoctrineDocuments(documents).conflicts).toEqual([]);
  });

  test("refuses duplicate authority identifiers", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const invariants = "docs/decisions/INVARIANTS.md";
    const changed = {
      ...documents,
      [invariants]: `${documents[invariants]}\n| I-32 | another authority | ADR-0041 | 2026-09-11 |\n`,
    };
    expect(inspectDoctrineDocuments(changed).conflicts).toContain("doctrine.invariant_count:I-32");
  });

  test("refuses portfolio reuse of research and persistence identifiers", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const path = "docs/adr/0041-public-portfolio-big-bang.md";
    const changed = {
      ...documents,
      [path]: documents[path]?.replace("I-32", "I-31").replace("D46", "D45") ?? "",
    };
    expect(inspectDoctrineDocuments(changed).conflicts).not.toEqual([]);
  });

  test("fails closed on missing and weakened private publication authority", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    for (const path of [
      "docs/adr/0038-private-first-repository-publication.md",
      "docs/adr/0039-private-product-research-repository.md",
      "docs/adr/0040-orchestrator-run-control-persistence.md",
    ]) {
      expect(inspectDoctrineDocuments({ ...documents, [path]: "" }).conflicts).not.toEqual([]);
    }
  });
  test("rejects a weakened protected invariant and bogus history boundary", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const path = "docs/decisions/INVARIANTS.md";
    expect(
      inspectDoctrineDocuments({
        ...documents,
        [path]: documents[path]?.replace("RFC 8785", "optional manifest") ?? "",
      }).conflicts,
    ).toContain("doctrine.protected_authority:I-30");
    const brand = "brand/README.en.md";
    expect(
      inspectDoctrineDocuments({
        ...documents,
        [brand]: `${documents[brand]}\n<!-- portfolio:historical:begin -->\nOwn the factory.\n<!-- portfolio:historical:end -->`,
      }).conflicts,
    ).toContain(`doctrine.history_boundary_invalid:${brand}`);
  });

  test("rejects restored active pre-migration invariant authority", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const path = "docs/decisions/INVARIANTS.md";
    const text = documents[path] ?? "";
    expect(
      inspectDoctrineDocuments({
        ...documents,
        [path]: text.replace(
          /^\| I-16 \|.*$/m,
          "| I-16 | Un repo naît par l’activation générale | ADR-0020 | 2026-07-28 |",
        ),
      }).conflicts,
    ).toContain("doctrine.amendment_missing:I-16");
  });

  test("rejects weakened newer ADR content despite intact register rows", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const path = "docs/adr/0038-private-first-repository-publication.md";
    expect(
      inspectDoctrineDocuments({
        ...documents,
        [path]: "# ADR-0038\nPublication without private staging is allowed.",
      }).conflicts,
    ).not.toEqual([]);
  });

  test("rejects the pre-reconstruction patched-crate rule without its bounded exception", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const path = "docs/decisions/INVARIANTS.md";
    const text = documents[path] ?? "";
    const original =
      "| I-28 | Every secondary patched-crate consumer uses a pinned Git dependency. | ADR-0031 | 2026-09-08 |";
    expect(
      inspectDoctrineDocuments({ ...documents, [path]: text.replace(/^\| I-28 \|.*$/m, original) })
        .conflicts,
    ).toContain("doctrine.patched_crate_exception:I-28");
  });

  test("keeps registry provenance equivalence explicit in both invariant entries and the ADR", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const path = "docs/decisions/INVARIANTS.md";
    for (const [id, phrase] of [
      ["I-28", "hors transaction nominative ADR-0041/I-32 et pendant son staging"],
      ["I-28", "révision source acceptée par revue du foyer"],
      ["I-28", "digest de l’archive registre"],
      ["I-32", "exception I-28 bornée à la distribution registre finale"],
    ] as const) {
      const text = documents[path] ?? "";
      const sourceRow = text.split("\n").find((line) => line.startsWith(`| ${id} |`)) ?? "";
      expect(sourceRow).toContain(phrase);
      expect(
        inspectDoctrineDocuments({
          ...documents,
          [path]: text.replace(sourceRow, sourceRow.replace(phrase, "removed boundary")),
        }).conflicts,
      ).toContain(`doctrine.patched_crate_exception:${id}`);
    }
    const adr = "docs/adr/0041-public-portfolio-big-bang.md";
    const boundary = "Outside this exact transaction and throughout staging";
    expect(documents[adr]).toContain(boundary);
    expect(
      inspectDoctrineDocuments({
        ...documents,
        [adr]: documents[adr]?.replace(boundary, "In every future transaction") ?? "",
      }).conflicts,
    ).not.toEqual([]);
  });

  test("rejects duplicate active LEXICON section numbers", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    const path = "docs/decisions/LEXICON.md";
    const text = documents[path] ?? "";
    expect(
      inspectDoctrineDocuments({
        ...documents,
        [path]: `${text}\n## 13. Conflicting name authority\n`,
      }).conflicts,
    ).toContain("doctrine.lexicon_section_duplicate:13");
  });

  test("requires a unique public section and rejects stale references to private section 13", async () => {
    const documents = await readDoctrineDocuments(process.cwd());
    expect(documents["docs/decisions/LEXICON.md"]).toContain("## 14. Public reconstruction names");
    for (const path of [
      "docs/adr/0041-public-portfolio-big-bang.md",
      "docs/architecture/TARGET.md",
      "docs/README.md",
      "brand/README.md",
      "brand/README.en.md",
    ]) {
      expect(documents[path]).toContain("LEXICON §14");
      expect(
        inspectDoctrineDocuments({
          ...documents,
          [path]: documents[path]?.replace("LEXICON §14", "LEXICON §13") ?? "",
        }).conflicts,
      ).toContain(`doctrine.lexicon_target_reference:${path}`);
    }
  });
});
