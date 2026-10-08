import { describe, expect, it } from "vitest";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { zorgscan } from "@/data/zorgscan-assessment";
import { alleVragen } from "./assessment-structuur";
import { overallScore } from "./scoring";
import {
  bouwBenchmarkSecties,
  bouwOrganisatieView,
  kandidaatOrganisaties,
  middelAntwoorden,
  nietTeKiezenOrganisaties,
  standaardMetingId,
  viewsVoorLead,
} from "./benchmark";
import type { Assessment, Benchmark, Organisatie, ScanInvulling } from "./types";

// De Zorgscan heeft gewichten (4, 10 en 11 op 2): Dat is de scherpste test van de gedeelde scorefunctie.
const assessment: Assessment = zorgscan;

const invulling = (id: string, waarde: number, status: ScanInvulling["status"] = "afgerond", a: Assessment = assessment): ScanInvulling => ({
  id, scanUitvoeringId: "x", organisatieLidId: "l", status, aangemaaktOp: "x", uitgenodigdOp: "x", gestartOp: null, afgerondOp: null,
  antwoorden: Object.fromEntries(alleVragen(a).map((v, i) => [v.id, status === "afgerond" ? ((i + waarde) % 5) + 1 : 0])),
  opmerkingenPerBouwblok: {}, bewaarVerlengdTot: null,
});

const org = (id: string, scans: number, vlag = true, aangemaaktOp = "2026-01-01"): Organisatie => ({
  id, naam: `Org ${id}`, kenmerken: {}, leden: [], aangemaaktDoor: null, toegewezenAan: [], benchmarkToegestaan: vlag, aangemaaktOp: "x", gewijzigdOp: "x",
  scanUitvoeringen: [{ id: `m-${id}`, organisatieId: id, assessmentId: assessment.id, label: "Nulmeting", aangemaaktOp,
    invullingen: Array.from({ length: scans }, (_, i) => invulling(`${id}-${i}`, i + id.charCodeAt(0))) }],
});

const benchmark = (ids: string[]): Benchmark => ({
  id: "b1", naam: "Test", assessmentIds: [assessment.id], meldingen: [], aangemaaktOp: "x", aangemaaktDoor: "a",
  leden: ids.map((id) => ({ organisatieId: id, assessmentId: assessment.id, metingId: `m-${id}` })),
});

describe("benchmark", () => {
  it("het groepsgemiddelde is het gemiddelde van de organisatiescores (lineair, met gewichten), niet gewogen naar aantal scans", () => {
    const orgs = [org("A", 1), org("B", 6), org("C", 3)];
    const [sectie] = bouwBenchmarkSecties(benchmark(["A", "B", "C"]), [assessment], orgs);
    const gemiddeldeVanOverall = sectie.rijen.reduce((s, r) => s + (r.overall as number), 0) / 3;
    const groepOverall = overallScore(assessment, sectie.groepAntwoorden) as number;
    // Beide zijn op één decimaal afgerond, dus ze mogen hooguit 0,1 verschillen.
    expect(Math.abs(groepOverall - gemiddeldeVanOverall)).toBeLessThanOrEqual(0.1);
    // Organisatie B (6 scans) telt even zwaar als A (1 scan): Het gemiddelde per vraag is het gemiddelde van de drie organisatiegemiddelden.
    const vraag = alleVragen(assessment)[0].id;
    const verwacht = sectie.rijen.reduce((s, r) => s + r.antwoorden[vraag], 0) / 3;
    expect(sectie.groepAntwoorden[vraag]).toBeCloseTo(verwacht, 10);
  });

  it("de teller is X van Y: X met een lid voor dit Assessment, Y alle organisaties in de benchmark", () => {
    const orgs = [org("A", 3), org("B", 3), org("C", 3)];
    const b = benchmark(["A", "B"]);
    b.leden.push({ organisatieId: "C", assessmentId: "ander-assessment", metingId: "m-C" });
    b.assessmentIds.push("ander-assessment");
    const [sectie] = bouwBenchmarkSecties(b, [assessment], orgs);
    expect(sectie.teller).toEqual({ x: 2, y: 3 });
    expect(sectie.ontbrekend.map((o) => o.id)).toEqual(["C"]);
  });

  it("een lid waarvan de organisatie of Meting niet meer bestaat telt niet mee", () => {
    const [sectie] = bouwBenchmarkSecties(benchmark(["A", "B", "WEG"]), [assessment], [org("A", 3), org("B", 3)]);
    expect(sectie.rijen.map((r) => r.organisatie.id)).toEqual(["A", "B"]);
  });

  it("de keuzelijst toont alleen organisaties met de vlag en genoeg afgeronde scans, met de meest recente Meting voorgekozen", () => {
    const metVlag = org("A", 3);
    const nieuweMeting = { ...metVlag.scanUitvoeringen[0], id: "m-nieuw", aangemaaktOp: "2026-06-01" };
    metVlag.scanUitvoeringen.push(nieuweMeting);
    const lijst = kandidaatOrganisaties([metVlag, org("B", 3, false), org("C", 2)], [assessment.id], 3);
    expect(lijst.map((k) => k.organisatie.id)).toEqual(["A"]);
    expect(lijst[0].perAssessment[0].metingen.map((m) => m.meting.id)).toEqual(["m-nieuw", "m-A"]);
    expect(standaardMetingId(lijst[0].perAssessment[0].metingen)).toBe("m-nieuw");
    // Bezig of uitgenodigd telt niet als afgerond.
    const bezig = org("D", 3);
    bezig.scanUitvoeringen[0].invullingen[0].status = "bezig";
    expect(kandidaatOrganisaties([bezig], [assessment.id], 3)).toEqual([]);
  });

  it("de view zet de organisatie naast de rest van de groep zónder zichzelf", () => {
    const orgs = [org("A", 3), org("B", 3), org("C", 3), org("D", 3), org("E", 3)];
    const [sectie] = bouwBenchmarkSecties(benchmark(["A", "B", "C", "D", "E"]), [assessment], orgs);
    const view = bouwOrganisatieView(sectie, "A", 5)!;
    expect(view.aantalAnderen).toBe(4);
    expect(view.aantalInGroep).toBe(5);
    const zonderA = middelAntwoorden(sectie.rijen.filter((r) => r.organisatie.id !== "A").map((r) => r.antwoorden), assessment);
    expect(view.rest!.overall).toBe(overallScore(assessment, zonderA));
    expect(view.verschillen).toHaveLength(15);
    expect(bouwOrganisatieView(sectie, "ONBEKEND", 5)).toBeNull();
  });

  it("de drempel telt de organisatie van de view mee: Bij 5 ziet een Lead het gemiddelde van minstens 4 anderen", () => {
    const vijf = bouwBenchmarkSecties(benchmark(["A", "B", "C", "D", "E"]), [assessment], ["A", "B", "C", "D", "E"].map((i) => org(i, 3)));
    const vier = bouwBenchmarkSecties(benchmark(["A", "B", "C", "D"]), [assessment], ["A", "B", "C", "D"].map((i) => org(i, 3)));
    expect(bouwOrganisatieView(vijf[0], "A", 5)!.voldoetAanDrempel).toBe(true);
    expect(bouwOrganisatieView(vier[0], "A", 5)!.voldoetAanDrempel).toBe(false);
    // Een Admin ziet de view altijd: De view zelf bestaat ook onder de drempel.
    expect(bouwOrganisatieView(vier[0], "A", 5)!.rest).not.toBeNull();
  });

  it("een Lead ziet alleen een sectie als hij de Meting van zijn organisatie mag inzien én de drempel is gehaald", () => {
    const orgs = ["A", "B", "C", "D", "E"].map((i) => org(i, 3));
    const secties = bouwBenchmarkSecties(benchmark(["A", "B", "C", "D", "E"]), [assessment], orgs);
    expect(viewsVoorLead(secties, "A", ["m-A"], 5)).toHaveLength(1);
    expect(viewsVoorLead(secties, "A", ["m-andere"], 5)).toHaveLength(0);
    expect(viewsVoorLead(secties, "A", ["m-A"], 6)).toHaveLength(0);
  });

  it("de klantcontactscan zonder gewichten rekent hetzelfde: Eén organisatie is gelijk aan haar eigen score", () => {
    const a = klantcontactVolwassenheid;
    const o = org("A", 2);
    o.scanUitvoeringen[0].assessmentId = a.id;
    o.scanUitvoeringen[0].invullingen = [invulling("x1", 0, "afgerond", a), invulling("x2", 2, "afgerond", a)];
    const b: Benchmark = { ...benchmark(["A"]), assessmentIds: [a.id], leden: [{ organisatieId: "A", assessmentId: a.id, metingId: "m-A" }] };
    const [sectie] = bouwBenchmarkSecties(b, [a], [o]);
    expect(sectie.rijen).toHaveLength(1);
    expect(Object.keys(sectie.groepAntwoorden)).toHaveLength(60);
    expect(sectie.groepAntwoorden).toEqual(sectie.rijen[0].antwoorden);
    expect(sectie.rijen[0].overall).not.toBeNull();
  });
});

describe("nietTeKiezenOrganisaties", () => {
  it("noemt per organisatie met de vlag die ontbreekt de reden: Te weinig afgeronde scans of geen Meting van het Assessment", () => {
    const weinig = org("W", 2);
    const geenMeting = org("G", 3);
    geenMeting.scanUitvoeringen = [];
    const zonderVlag = org("Z", 1, false);
    const goed = org("OK", 3);
    const uit = nietTeKiezenOrganisaties([weinig, geenMeting, zonderVlag, goed], [{ id: assessment.id, naam: "Zorgscan" }], [assessment.id], 3);
    expect(uit.map((u) => u.organisatie.id)).toEqual(["G", "W"]);
    expect(uit.find((u) => u.organisatie.id === "W")!.redenen[0]).toBe("Zorgscan: hoogstens 2 afgeronde scans in één Meting, minimaal 3 nodig");
    expect(uit.find((u) => u.organisatie.id === "G")!.redenen[0]).toBe("geen Meting van Zorgscan");
  });
});
