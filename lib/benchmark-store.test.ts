import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Zelfde aanpak als `lib/db.test.ts`: localStorage en fetch worden vervangen door een in-memory versie, vóór het importeren.
const opslag = new Map<string, string>();
const ORG_KEY = "coniche-scan:organisaties";

type Db = typeof import("./db");
type Store = typeof import("./benchmark-store");
let db: Db;
let store: Store;

beforeAll(async () => {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => opslag.get(k) ?? null,
      setItem: (k: string, v: string) => void opslag.set(k, v),
      removeItem: (k: string) => void opslag.delete(k),
    },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  });
  vi.stubGlobal("fetch", async () => ({ status: 204, text: async () => "" }));
  db = await import("./db");
  store = await import("./benchmark-store");
});

beforeEach(() => opslag.clear());

type Rij = Record<string, unknown>;
const lid = (id: string, orgId: string, extra: Rij = {}) => ({
  id, organisatieId: orgId, email: `${id}@x.nl`, naam: id, functie: "", team: "", notities: "", toegangscode: `c${id}`, leadMetingIds: [], aangemaaktOp: "x", ...extra,
});
const org = (id: string, leden: Rij[], metingen: Rij[], vlag = true) => ({
  id, naam: `Org ${id}`, kenmerken: {}, aangemaaktOp: "x", aangemaaktDoor: null, toegewezenAan: [], benchmarkToegestaan: vlag, leden, scanUitvoeringen: metingen,
});
const meting = (id: string, orgId: string) => ({ id, organisatieId: orgId, assessmentId: "A", label: id, aangemaaktOp: "x", invullingen: [] });
const zet = (orgs: Rij[]) => opslag.set(ORG_KEY, JSON.stringify(orgs));
const namen = { assessmentNamen: ["A"], organisatieNamen: [] as string[] };

/** Een benchmark met organisaties O1 en O2, en een toewijzing van de view van O1 aan Lead L1. */
function opzet() {
  zet([
    org("O1", [lid("L1", "O1", { leadMetingIds: ["M1"] })], [meting("M1", "O1")]),
    org("O2", [lid("L2", "O2")], [meting("M2", "O2")]),
  ]);
  const b = store.maakBenchmark(
    { naam: "Test", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [
      { organisatieId: "O1", assessmentId: "A", metingId: "M1" },
      { organisatieId: "O2", assessmentId: "A", metingId: "M2" },
    ] },
    namen
  );
  store.wijsBenchmarkToe({ benchmarkId: b.id, organisatieId: "O1", respondentId: "L1", toegewezenDoor: "g1" }, { benchmarkNaam: "Test", organisatieNaam: "Org O1" });
  return b;
}
const huidig = () => store.getBenchmarks()[0];
const toewijzingen = () => (JSON.parse(opslag.get("coniche-scan:benchmarks")!) as { toewijzingen: unknown[] }).toewijzingen;
const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> | null }[]).map((e) => e.actie);

describe("benchmark-opslag", () => {
  it("een toewijzing is uniek per combinatie van benchmark, organisatie en Lead", () => {
    const b = opzet();
    store.wijsBenchmarkToe({ benchmarkId: b.id, organisatieId: "O1", respondentId: "L1", toegewezenDoor: "g1" }, { benchmarkNaam: "Test", organisatieNaam: "Org O1" });
    expect(toewijzingen()).toHaveLength(1);
  });

  it("een Meting verwijderen haalt het lid uit de benchmark, met een melding en de toewijzing van die organisatie", () => {
    opzet();
    db.verwijderMeting("M1");
    expect(huidig().leden.map((l) => l.organisatieId)).toEqual(["O2"]);
    expect(huidig().meldingen[0].tekst).toContain("Org O1");
    expect(toewijzingen()).toHaveLength(0);
    expect(audit()).toContain("benchmark.gewijzigd");
  });

  it("een Organisatie verwijderen haalt haar leden en toewijzingen weg, de benchmark zelf blijft", () => {
    opzet();
    db.verwijderOrganisaties(["O2"]);
    expect(store.getBenchmarks()).toHaveLength(1);
    expect(huidig().leden.map((l) => l.organisatieId)).toEqual(["O1"]);
    expect(toewijzingen()).toHaveLength(1); // De toewijzing van O1 blijft: O1 bestaat nog.
  });

  it("een Respondent met Lead-rol verwijderen haalt zijn toewijzingen weg", () => {
    opzet();
    db.verwijderLeden(["L1"]);
    expect(toewijzingen()).toHaveLength(0);
    expect(huidig().leden).toHaveLength(2);
  });

  it("de vlag uitzetten haalt de organisatie uit alle benchmarks en logt de wijziging", () => {
    opzet();
    expect(store.aantalBenchmarksMetOrganisatie("O1")).toBe(1);
    db.zetBenchmarkVlag("O1", false);
    expect(store.aantalBenchmarksMetOrganisatie("O1")).toBe(0);
    expect(toewijzingen()).toHaveLength(0);
    expect(audit()).toContain("organisatie.benchmarkVlagGewijzigd");
    // Aanzetten verandert niets aan de samenstelling.
    db.zetBenchmarkVlag("O1", true);
    expect(huidig().leden).toHaveLength(1);
  });

  it("een benchmark verwijderen haalt ook zijn toewijzingen weg, organisaties en metingen blijven bestaan", () => {
    const b = opzet();
    store.verwijderBenchmark(b.id, namen);
    expect(store.getBenchmarks()).toHaveLength(0);
    expect(toewijzingen()).toHaveLength(0);
    expect((JSON.parse(opslag.get(ORG_KEY)!) as unknown[]).length).toBe(2);
  });

  it("de audit-log bevat geen naam of e-mailadres van de Lead", () => {
    opzet();
    const log = JSON.parse(opslag.get("coniche-scan:audit")!) as { actie: string; details: unknown }[];
    const toegewezen = log.find((e) => e.actie === "benchmark.toegewezen");
    expect(JSON.stringify(toegewezen?.details)).not.toMatch(/L1|@x\.nl/);
  });
});
