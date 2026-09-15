import { join } from "node:path";

export interface DoctrineInspection {
  readonly promise: string | null;
  readonly invariantIds: readonly string[];
  readonly decisionIds: readonly string[];
  readonly conflicts: readonly string[];
}

export type DoctrineDocuments = Readonly<Record<string, string>>;

const paths = [
  "docs/adr/0041-public-portfolio-big-bang.md",
  "docs/decisions/INVARIANTS.md",
  "docs/decisions/DECISION-REGISTER.md",
  "docs/decisions/LEXICON.md",
  "docs/architecture/TARGET.md",
  "docs/README.md",
  "AGENTS.md",
  "brand/README.md",
  "brand/README.en.md",
  "docs/adr/0033-open-verifiable-brand-system.md",
  "docs/adr/0038-private-first-repository-publication.md",
  "docs/adr/0039-private-product-research-repository.md",
  "docs/adr/0040-orchestrator-run-control-persistence.md",
] as const;

const historicalPaths = new Set<string>([
  "docs/adr/0033-open-verifiable-brand-system.md",
  "docs/decisions/INVARIANTS.md",
  "docs/decisions/DECISION-REGISTER.md",
  "docs/decisions/LEXICON.md",
]);

const beginHistory = "<!-- portfolio:historical:begin -->";
const endHistory = "<!-- portfolio:historical:end -->";

function activeText(path: string, text: string, conflicts: string[]): string {
  const beginCount = text.split(beginHistory).length - 1;
  const endCount = text.split(endHistory).length - 1;
  if (beginCount === 0 && endCount === 0) return text;
  if (
    !historicalPaths.has(path) ||
    beginCount !== 1 ||
    endCount !== 1 ||
    text.indexOf(beginHistory) >= text.indexOf(endHistory)
  ) {
    conflicts.push(`doctrine.history_boundary_invalid:${path}`);
    return text;
  }
  return (
    text.slice(0, text.indexOf(beginHistory)) +
    text.slice(text.indexOf(endHistory) + endHistory.length)
  );
}

function row(text: string, id: string): string[] {
  return text.split("\n").filter((line) => new RegExp(`^\\|\\s*${id}\\s*\\|`).test(line));
}

export function inspectDoctrineDocuments(documents: DoctrineDocuments): DoctrineInspection {
  const conflicts: string[] = [];
  const active: Record<string, string> = {};
  for (const path of paths) {
    const text = documents[path] ?? "";
    if (text.trim() === "") conflicts.push(`doctrine.document_missing:${path}`);
    active[path] = activeText(path, text, conflicts);
  }
  const invariants = active[paths[1]] ?? "";
  const decisions = active[paths[2]] ?? "";
  const english = active["brand/README.en.md"] ?? "";
  const promiseMatches = [...english.matchAll(/<!-- libre-ai:brand:promise -->\s*([^\n]+)/g)];
  const promise = promiseMatches.length === 1 ? (promiseMatches[0]?.[1]?.trim() ?? null) : null;
  if (promise !== "AI work you can verify.") conflicts.push("doctrine.master_promise");

  for (const [id, text, kind] of [
    ["I-32", invariants, "invariant"],
    ["D46", decisions, "decision"],
  ] as const) {
    const matches = row(text, id);
    if (matches.length !== 1) conflicts.push(`doctrine.${kind}_count:${id}`);
    if (!matches[0]?.includes("ADR-0041")) conflicts.push(`doctrine.${kind}_authority:${id}`);
  }

  for (const id of [
    "I-02",
    "I-08",
    "I-11",
    "I-15",
    "I-16",
    "I-23",
    "I-29",
    "D23",
    "D28",
    "D29",
    "D39",
  ]) {
    const matches = row(id.startsWith("I") ? invariants : decisions, id);
    if (matches.length !== 1 || !matches[0]?.includes("ADR-0041"))
      conflicts.push(`doctrine.amendment_missing:${id}`);
  }

  for (const [id, needles] of [
    [
      "I-28",
      [
        "ADR-0041/I-32",
        "hors transaction nominative ADR-0041/I-32 et pendant son staging",
        "révision source acceptée par revue du foyer",
        "digest de l’archive registre",
        "le patch et l’arbre qualifié",
        "sans accepter de révision source non revue",
        "publication bloquée",
      ],
    ],
    [
      "I-32",
      [
        "exception I-28 bornée à la distribution registre finale",
        "provenance immuable",
        "source revue du foyer",
      ],
    ],
  ] as const) {
    const matches = row(invariants, id);
    if (matches.length !== 1 || needles.some((needle) => !matches[0]?.includes(needle))) {
      conflicts.push(`doctrine.patched_crate_exception:${id}`);
    }
  }

  const lexicon = active["docs/decisions/LEXICON.md"] ?? "";
  const sectionNumbers = [...lexicon.matchAll(/^## (\d+)\./gm)].map((match) => match[1]);
  for (const section of new Set(sectionNumbers)) {
    if (sectionNumbers.filter((number) => number === section).length > 1) {
      conflicts.push(`doctrine.lexicon_section_duplicate:${section}`);
    }
  }
  if (!lexicon.includes("## 14. Public reconstruction names")) {
    conflicts.push("doctrine.lexicon_target_section");
  }
  for (const path of [
    paths[0],
    "docs/architecture/TARGET.md",
    "docs/README.md",
    "brand/README.md",
    "brand/README.en.md",
  ]) {
    const text = active[path] ?? "";
    if (!text.includes("LEXICON §14") || text.includes("LEXICON §13")) {
      conflicts.push(`doctrine.lexicon_target_reference:${path}`);
    }
  }

  const requirements: readonly [string, readonly string[]][] = [
    [
      "docs/adr/0038-private-first-repository-publication.md",
      ["**Introduit :** I-30", "attestation privée exacte", "RFC 8785", "refs/*"],
    ],
    [
      "docs/adr/0039-private-product-research-repository.md",
      [
        "**Introduit :** I-31",
        "administrative-private",
        "exigence 2FA",
        "repository, chemin et SHA complet",
      ],
    ],
    [
      "docs/adr/0040-orchestrator-run-control-persistence.md",
      ["**N'autorise pas :** service", "crates/agent-orchestrator-run/", "SQLx", "_rt-tokio"],
    ],
    [
      paths[0],
      [
        "# ADR-0041",
        "**Invariant:** I-32.",
        "**Decision:** D46.",
        "Bounded supersessions",
        "Outside this exact transaction and throughout staging",
        "qualifying home's reviewed source revision",
        "registry archive digest, the patch and the qualified tree",
        "Missing or unverifiable proof blocks publication",
        "Existing licence grants are not revoked",
        "Website remains static without client JavaScript",
        "demonstration belongs to the separate Missions application",
        "second explicit owner confirmation",
        "immutable staged targets",
        "ADR-0038 / I-30 / D44",
        "ADR-0039 / I-31",
        "ADR-0040 / D45",
      ],
    ],
    [
      "brand/README.en.md",
      [
        "Evidence Signal",
        "pixel bird",
        "exact asset licensing",
        "visual-similarity",
        "Missions is the sole primary launch journey",
        "canonical English",
      ],
    ],
    [
      "brand/README.md",
      [
        "Evidence Signal",
        "oiseau pixel",
        "licence exacte",
        "similarité visuelle",
        "miroir français",
      ],
    ],
    [
      "docs/decisions/LEXICON.md",
      [
        "Libre AI Database Inspector",
        "Provisional conditional names",
        "Signalement",
        "private-first",
        "product-research",
      ],
    ],
    [
      "docs/architecture/TARGET.md",
      [
        "ADR-0041/I-32",
        "tests are not consumers",
        "14 certain",
        "six evidence-admitted",
        "released SemVer",
      ],
    ],
    ["AGENTS.md", ["ADR-0041/I-32", "ADR-0038", "ADR-0039/I-31", "ADR-0040/D45"]],
    ["docs/README.md", ["ADR-0041/I-32", "canonique anglaise", "miroir français"]],
  ];
  for (const [path, needles] of requirements) {
    const text = (active[path] ?? "").replace(/\s+/g, " ");
    for (const needle of needles) {
      if (!text.includes(needle)) conflicts.push(`doctrine.required:${path}:${needle}`);
    }
  }

  // Read active publication surfaces only. Superseding ADRs explicitly cite the old rules
  // to delimit their replacement; searching those citations as claims would invert the gate.
  const forbidden = [
    /Possédez la fabrique\./i,
    /Own the factory\./i,
    /Workshop\s+Gantry|Portique\s+d.atelier|Envol\s+constructif/i,
    /public migration phases/i,
    /repositories exist through general activation/i,
    /public histories must be preserved/i,
    /(?:primary\s+(?:CTA|call to action)|parcours principal)[^.\n]*starter/i,
  ];
  for (const path of [
    "brand/README.md",
    "brand/README.en.md",
    "docs/architecture/TARGET.md",
    "AGENTS.md",
  ]) {
    const text = (active[path] ?? "").replace(/\s+/g, " ");
    for (const [index, pattern] of forbidden.entries()) {
      if (pattern.test(text)) conflicts.push(`doctrine.obsolete_active:${path}:${index}`);
    }
  }

  const protectedRows: readonly [string, string, readonly string[]][] = [
    ["I-30", invariants, ["ADR-0038", "refs/*", "OID", "RFC 8785", "lease", "privé gelé"]],
    ["I-31", invariants, ["ADR-0039", "administrative-private", "non normative", "2FA", "chiffré"]],
    ["D44", decisions, ["ADR-0038", "private-first", "exact-object", "absent-remote leases"]],
    [
      "D45",
      decisions,
      ["ADR-0040", "non-executing", "production blockers", "forced organization RLS"],
    ],
  ];
  for (const [id, text, needles] of protectedRows) {
    const matches = row(text, id);
    if (
      matches.length !== 1 ||
      needles.some((needle) => !matches[0]?.includes(needle)) ||
      matches[0]?.includes("ADR-0041")
    ) {
      conflicts.push(`doctrine.protected_authority:${id}`);
    }
  }
  return {
    promise,
    invariantIds: row(invariants, "I-32").map(() => "I-32"),
    decisionIds: row(decisions, "D46").map(() => "D46"),
    conflicts,
  };
}

export async function readDoctrineDocuments(root: string): Promise<DoctrineDocuments> {
  const entries = await Promise.all(
    paths.map(async (path) => {
      const file = Bun.file(join(root, path));
      return [path, (await file.exists()) ? await file.text() : ""] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export async function inspectPublicPortfolioDoctrine(root: string): Promise<DoctrineInspection> {
  return inspectDoctrineDocuments(await readDoctrineDocuments(root));
}

if (import.meta.main) {
  const result = await inspectPublicPortfolioDoctrine(process.cwd());
  for (const conflict of result.conflicts) console.error(conflict);
  if (result.conflicts.length > 0) process.exitCode = 1;
  else
    console.log(
      "Public portfolio doctrine: ADR-0041 / I-32 / D46 coherent; owner signature remains required.",
    );
}
