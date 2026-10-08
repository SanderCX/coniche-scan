import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Zelfde aanpak als `lib/db.test.ts`: localStorage en fetch worden vervangen door een in-memory versie, vóór het importeren.
const opslag = new Map<string, string>();
const ORG_KEY = "coniche-scan:organisaties";

type Verwijderen = typeof import("./assessment-verwijderen");
type AssessmentStore = typeof import("./assessment-store");
type BenchmarkStore = typeof import("./benchmark-store");
let v: Verwijderen;
let assessments: AssessmentStore;
let benchmarks: BenchmarkStore;

beforeAll(async () => {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => opslag.get(k) ?? null,
      setItem: (k: string, val: string) => void opslag.set(k, val),
      removeItem: (k: string) => void opslag.delete(k),
    },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  });
  vi.stubGlobal("fetch", async () => ({ status: 204, text: async () => "" }));
  v = await import("./assessment-verwijderen");
  assessments = await import("./assessment-store");
  benchmarks = await import("./benchmark-store");
});

beforeEach(() => opslag.clear());

type Rij = Record<string, unknown>;
const meting = (id: string, orgId: string, assessmentId: string) => ({ id, organisatieId: orgId, assessmentId, label: id, aangemaaktOp: "x", invullingen: [] });
const org = (id: string, metingen: Rij[]) => ({
  id, naam: `Org ${id}`, kenmerken: {}, aangemaaktOp: "x", aangemaaktDoor: null, toegewezenAan: [], benchmarkToegestaan: true, leden: [], scanUitvoeringen: metingen,
});
const zet = (orgs: Rij[]) => opslag.set(ORG_KEY, JSON.stringify(orgs));
const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> }[]);

describe("een Assessment verwijderen", () => {
  it("telt de Metingen en de organisaties, ook een Meting zonder scans", () => {
    const orgs = [org("O1", [meting("M1", "O1", "A"), meting("M2", "O1", "A")]), org("O2", [meting("M3", "O2", "A")]), org("O3", [meting("M4", "O3", "B")])];
    expect(v.assessmentGebruik(orgs as never, "A")).toEqual({ aantalMetingen: 3, aantalOrganisaties: 2 });
    expect(v.assessmentGebruik(orgs as never, "ONBEKEND")).toEqual({ aantalMetingen: 0, aantalOrganisaties: 0 });
  });

  it("kan niet zolang er een Meting van is, ook niet bij een Meting zonder scans: Er verdwijnt niets", () => {
    const [eerste] = assessments.getAssessments();
    zet([org("O1", [meting("M1", "O1", eerste.id)])]);
    const aantalVoor = assessments.getAssessments().length;
    const r = v.verwijderAssessment(eerste.id, []);
    expect(r).toMatchObject({ ok: false, reden: "metingen", aantalMetingen: 1, aantalOrganisaties: 1 });
    expect(assessments.getAssessments()).toHaveLength(aantalVoor);
    expect(audit().some((e) => e.actie === "assessment.verwijderd")).toBe(false);
  });

  it("verwijdert zonder Metingen alleen de definitie, haalt het uit benchmarks met een melding en maakt afgeleide Assessments los", () => {
    const alle = assessments.getAssessments();
    const doel = alle[0];
    const afgeleid = alle.find((a) => a.afgeleidVanAssessmentId === doel.id);
    zet([]);
    const b = benchmarks.maakBenchmark(
      { naam: "Groep", assessmentIds: [doel.id], aangemaaktDoor: "g1", leden: [{ organisatieId: "O1", assessmentId: doel.id, metingId: "M1" }] },
      { assessmentNamen: [doel.naam], organisatieNamen: [] }
    );
    const r = v.verwijderAssessment(doel.id, benchmarks.getBenchmarks());
    expect(r).toEqual({ ok: true });
    expect(assessments.getAssessments().some((a) => a.id === doel.id)).toBe(false);
    if (afgeleid) expect(assessments.getAssessments().find((a) => a.id === afgeleid.id)!.afgeleidVanAssessmentId).toBeNull();
    const na = benchmarks.getBenchmarks().find((x) => x.id === b.id)!;
    expect(na.assessmentIds).toEqual([]);
    expect(na.leden).toEqual([]);
    expect(na.meldingen[0].tekst).toContain(doel.naam);
    const regel = audit().find((e) => e.actie === "assessment.verwijderd")!;
    expect(regel.details.assessmentNaam).toBe(doel.naam);
    expect(regel.details.benchmarkNamen).toEqual(["Groep"]);
    expect(regel.details.aantalVragen).toBeGreaterThan(0);
  });

  it("een onbekend Assessment geeft een fout en verandert niets", () => {
    zet([]);
    expect(v.verwijderAssessment("bestaat-niet", [])).toEqual({ ok: false, reden: "onbekend" });
  });

  it("de effecten tellen alle categorieën, bouwblokken en vragen en noemen benchmarks en afgeleide Assessments", () => {
    const alle = assessments.getAssessments();
    const doel = alle[0];
    const effecten = v.assessmentEffecten(doel, alle, [{ id: "b", naam: "Groep", assessmentIds: [doel.id], leden: [], meldingen: [], aangemaaktOp: "x", aangemaaktDoor: "g" }]);
    expect(effecten.aantalBouwblokken).toBeGreaterThan(0);
    expect(effecten.aantalVragen).toBeGreaterThanOrEqual(effecten.aantalBouwblokken);
    expect(effecten.benchmarkNamen).toEqual(["Groep"]);
  });
});
