import { describe, expect, it } from "vitest";
import { isLead } from "./lead";
import {
  benchmarkCelReden,
  benchmarkGeldigVoorOrganisatie,
  heeftBenchmarkToegang,
  heeftMetingToegang,
  leadSamenvatting,
  leadsMetBenchmark,
  leadsMetToegangTotMeting,
  metingCelReden,
  metingIdsMetWeergave,
  metingenMetToegang,
  ruimLeadToegangOp,
  zetLegacyBereikOm,
} from "./lead-toegang";
import type { Benchmark, LeadToegang, LeadWeergave, Organisatie, OrganisatieLid, ScanUitvoering } from "./types";

const lid = (id: string, extra: Partial<OrganisatieLid> = {}): OrganisatieLid => ({
  id, organisatieId: "O", email: `${id}@x.nl`, naam: id, functie: "", team: "", notities: "", toegangscode: `c${id}`, aangemaaktOp: "x", ...extra,
});
const meting = (id: string, extra: Partial<ScanUitvoering> = {}): ScanUitvoering => ({
  id, organisatieId: "O", assessmentId: "A", label: id, aangemaaktOp: "x", invullingen: [], ...extra,
});
const t = (respondentId: string, weergave: LeadWeergave, id: string): LeadToegang => ({
  respondentId, weergave, ...(weergave === "benchmark" ? { benchmarkId: id } : { metingId: id }), toegekendDoor: "a", toegekendOp: "x",
});
const org = (extra: Partial<Organisatie> = {}): Organisatie => ({
  id: "O", naam: "Org", kenmerken: {}, leden: [], scanUitvoeringen: [], aangemaaktDoor: null, toegewezenAan: [], benchmarkToegestaan: true,
  aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
});
const benchmark = (extra: Partial<Benchmark> = {}): Benchmark => ({
  id: "B", naam: "B", assessmentIds: ["A"], leden: [{ organisatieId: "O", assessmentId: "A", metingId: "M1" }], meldingen: [],
  aangemaaktOp: "x", aangemaaktDoor: "g", ...extra,
});

describe("de Lead-rol en de vinkjes", () => {
  it("is Lead met de rol, niet door vinkjes of een Meting", () => {
    expect(isLead(lid("L1", { lead: true }))).toBe(true);
    expect(isLead(lid("L1"))).toBe(false);
  });

  it("vat samen wat de Lead ziet", () => {
    const o = org({ leden: [lid("L1", { lead: true }), lid("R")], leadToegang: [t("L1", "resultaten", "M1"), t("L1", "uitnodigen", "M1")] });
    expect(leadSamenvatting(o, o.leden[0])).toBe("Lead, ziet 2 weergaven");
    expect(leadSamenvatting(org({ leden: [lid("L1", { lead: true })] }), lid("L1", { lead: true }))).toBe("Lead, ziet nog niets");
    expect(leadSamenvatting(o, o.leden[1])).toBe("Geen Lead");
  });

  it("zoekt per Meting wie wat ziet, en welke Metingen een Lead ziet", () => {
    const o = org({
      leden: [lid("L1", { lead: true }), lid("L2", { lead: true })],
      scanUitvoeringen: [meting("M1"), meting("M2")],
      leadToegang: [t("L1", "resultaten", "M1"), t("L2", "uitnodigen", "M2"), t("L1", "benchmark", "B")],
    });
    expect(heeftMetingToegang(o, "L1", "resultaten", "M1")).toBe(true);
    expect(heeftMetingToegang(o, "L1", "resultaten", "M2")).toBe(false);
    expect(heeftBenchmarkToegang(o, "L1", "B")).toBe(true);
    expect(leadsMetToegangTotMeting(o, "M2").map((l) => l.id)).toEqual(["L2"]);
    expect(leadsMetBenchmark(o, "B").map((l) => l.id)).toEqual(["L1"]);
    expect(metingenMetToegang(o, "L1").map((m) => m.id)).toEqual(["M1"]);
    expect(metingIdsMetWeergave(o, "L2", "uitnodigen")).toEqual(["M2"]);
  });
});

describe("de vinkjes kloppend houden", () => {
  it("laat een vinkje vallen als de Respondent geen Lead meer is of de Meting verdween", () => {
    const o = org({
      leden: [lid("L1", { lead: true }), lid("R")],
      scanUitvoeringen: [meting("M1")],
      leadToegang: [t("L1", "resultaten", "M1"), t("R", "resultaten", "M1"), t("L1", "resultaten", "WEG")],
    });
    expect(ruimLeadToegangOp(o)).toBe(2);
    expect(o.leadToegang).toHaveLength(1);
  });

  it("Spreiding, Antwoorden en Exporteren hebben Resultaten van dezelfde Meting nodig, Uitnodigen niet", () => {
    const o = org({
      leden: [lid("L1", { lead: true })],
      scanUitvoeringen: [meting("M1"), meting("M2")],
      leadToegang: [t("L1", "spreiding", "M1"), t("L1", "uitnodigen", "M1"), t("L1", "resultaten", "M2"), t("L1", "antwoorden", "M2")],
    });
    ruimLeadToegangOp(o);
    expect(o.leadToegang!.map((x) => `${x.weergave}:${x.metingId}`).sort()).toEqual(["antwoorden:M2", "resultaten:M2", "uitnodigen:M1"]);
  });

  it("een samengestelde Meting heeft alleen Resultaten", () => {
    const o = org({
      leden: [lid("L1", { lead: true })],
      scanUitvoeringen: [meting("S", { samenstelling: ["M1", "M2"] })],
      leadToegang: [t("L1", "resultaten", "S"), t("L1", "uitnodigen", "S"), t("L1", "spreiding", "S")],
    });
    ruimLeadToegangOp(o);
    expect(o.leadToegang!.map((x) => x.weergave)).toEqual(["resultaten"]);
  });

  it("een benchmark vervalt als ze weg is of de organisatie er geen lid van is", () => {
    const basis = () =>
      org({
        leden: [lid("L1", { lead: true })],
        scanUitvoeringen: [meting("M1")],
        leadToegang: [t("L1", "benchmark", "B")],
      });
    const a = basis();
    ruimLeadToegangOp(a, [benchmark()]);
    expect(a.leadToegang).toHaveLength(1);
    const b = basis();
    ruimLeadToegangOp(b, []);
    expect(b.leadToegang).toHaveLength(0);
    const c = basis();
    ruimLeadToegangOp(c, [benchmark({ leden: [{ organisatieId: "ANDERS", assessmentId: "A", metingId: "X" }] })]);
    expect(c.leadToegang).toHaveLength(0);
  });

  it("bij niveau 2 vraagt een benchmark Resultaten op minstens twee lid-Metingen: Met minder is er niets te vergelijken", () => {
    const twee = benchmark({
      niveau: "metingen",
      leden: [
        { organisatieId: "O", assessmentId: "A", metingId: "M1" },
        { organisatieId: "O", assessmentId: "A", metingId: "M2" },
      ],
    });
    const basis = (vinkjes: LeadToegang[]) =>
      org({ leden: [lid("L1", { lead: true })], scanUitvoeringen: [meting("M1"), meting("M2")], leadToegang: vinkjes });
    const geen = basis([t("L1", "benchmark", "B")]);
    ruimLeadToegangOp(geen, [twee]);
    expect(geen.leadToegang).toHaveLength(0);
    const een = basis([t("L1", "benchmark", "B"), t("L1", "resultaten", "M1")]);
    ruimLeadToegangOp(een, [twee]);
    expect(een.leadToegang!.map((x) => x.weergave)).toEqual(["resultaten"]);
    const beide = basis([t("L1", "benchmark", "B"), t("L1", "resultaten", "M1"), t("L1", "resultaten", "M2")]);
    ruimLeadToegangOp(beide, [twee]);
    expect(beide.leadToegang).toHaveLength(3);
  });

  it("een benchmark van niveau 3 heeft geen kolom voor een Lead", () => {
    expect(benchmarkGeldigVoorOrganisatie(benchmark({ niveau: "scans" }), "O")).toBe(false);
    expect(benchmarkGeldigVoorOrganisatie(benchmark(), "O")).toBe(true);
    expect(benchmarkGeldigVoorOrganisatie(undefined, "O")).toBe(false);
  });
});

describe("de omzetting van het bereik van een Lead", () => {
  it("geeft een Lead met Metingen Resultaten, Uitnodigen en Exporteren voor die Metingen, en alleen Resultaten bij een samengestelde", () => {
    const o = org({
      leden: [lid("L1", { leadMetingIds: ["M1", "S"] })],
      scanUitvoeringen: [meting("M1"), meting("M2"), meting("S", { samenstelling: ["M1", "M2"] })],
    });
    zetLegacyBereikOm(o);
    expect(o.leden[0].lead).toBe(true);
    expect(o.leden[0].leadMetingIds).toBeUndefined();
    const lijst = o.leadToegang!.map((x) => `${x.weergave}:${x.metingId}`).sort();
    expect(lijst).toEqual(["exporteren:M1", "resultaten:M1", "resultaten:S", "uitnodigen:M1"]);
    expect(o.leadOvergangMelding).toBeFalsy();
  });

  it("zet een Lead voor de hele organisatie om voor de Metingen die er nu zijn, met een melding, en laat de velden vallen", () => {
    const o = org({
      leden: [lid("L1", { leadVoorOrganisatie: true, leadMetingIds: [] }), lid("R", { leadMetingIds: [] })],
      scanUitvoeringen: [meting("M1"), meting("M2")],
    });
    zetLegacyBereikOm(o);
    expect(o.leden[0].lead).toBe(true);
    expect(o.leden[1].lead).toBeUndefined();
    expect(o.leadToegang).toHaveLength(6);
    expect(o.leadOvergangMelding).toContain("hele organisatie");
    expect(o.leden[0].leadVoorOrganisatie).toBeUndefined();
    // Idempotent: Een tweede keer verandert niets.
    zetLegacyBereikOm(o);
    expect(o.leadToegang).toHaveLength(6);
  });
});

describe("de grijze cellen", () => {
  const drempels = { minRespondenten: 5 };
  const basis = { meting: meting("M1"), resultatenAan: true, afgerondeScans: 8, antwoordenMetNamen: false, drempels };

  it("Resultaten is altijd aan te vinken", () => {
    expect(metingCelReden({ ...basis, weergave: "resultaten", resultatenAan: false, afgerondeScans: 0 })).toBeNull();
  });

  it("Spreiding, Antwoorden en Exporteren kunnen pas als Resultaten aan staat", () => {
    for (const weergave of ["spreiding", "antwoorden", "exporteren"] as const) {
      expect(metingCelReden({ ...basis, weergave, resultatenAan: false })).toContain("Resultaten");
      expect(metingCelReden({ ...basis, weergave })).toBeNull();
    }
    expect(metingCelReden({ ...basis, weergave: "uitnodigen", resultatenAan: false })).toBeNull();
  });

  it("Spreiding en anonieme Antwoorden vragen genoeg afgeronde scans, Antwoorden met namen niet", () => {
    expect(metingCelReden({ ...basis, weergave: "spreiding", afgerondeScans: 4 })).toContain("4 afgeronde scans");
    expect(metingCelReden({ ...basis, weergave: "antwoorden", afgerondeScans: 4 })).toContain("anoniem");
    expect(metingCelReden({ ...basis, weergave: "antwoorden", afgerondeScans: 4, antwoordenMetNamen: true })).toBeNull();
    expect(metingCelReden({ ...basis, weergave: "spreiding", afgerondeScans: 5 })).toBeNull();
  });

  it("een samengestelde Meting heeft alleen Resultaten", () => {
    const samengesteld = meting("S", { samenstelling: ["M1", "M2"] });
    for (const weergave of ["spreiding", "antwoorden", "uitnodigen", "exporteren"] as const) {
      expect(metingCelReden({ ...basis, meting: samengesteld, weergave })).not.toBeNull();
    }
    expect(metingCelReden({ ...basis, meting: samengesteld, weergave: "resultaten" })).toBeNull();
  });

  it("een benchmarkkolom is grijs onder de drempel van niveau 1, en bij niveau 2 met Resultaten op minder dan twee lid-Metingen", () => {
    expect(benchmarkCelReden({ niveau: "organisaties", voldoetAanDrempel: false, aantalLidMetingenMetResultaten: 0 })).not.toBeNull();
    // Niveau 1 vraagt geen Resultaten: De view toont de scores van de eigen organisatie zelf al.
    expect(benchmarkCelReden({ niveau: "organisaties", voldoetAanDrempel: true, aantalLidMetingenMetResultaten: 0 })).toBeNull();
    // Niveau 2 vergelijkt Metingen: Met één Meting met Resultaten is er niets te vergelijken.
    expect(benchmarkCelReden({ niveau: "metingen", voldoetAanDrempel: true, aantalLidMetingenMetResultaten: 0 })).not.toBeNull();
    expect(benchmarkCelReden({ niveau: "metingen", voldoetAanDrempel: true, aantalLidMetingenMetResultaten: 1 })).not.toBeNull();
    expect(benchmarkCelReden({ niveau: "metingen", voldoetAanDrempel: true, aantalLidMetingenMetResultaten: 2 })).toBeNull();
  });
});
