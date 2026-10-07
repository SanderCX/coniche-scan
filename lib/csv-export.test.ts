import { describe, expect, it } from "vitest";
import { genereerInzageCsv, genereerScansCsv, inzageBestandsnaam } from "./csv-export";
import { zorgscan as zorgscanSeed } from "@/data/zorgscan-assessment";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";
import { alleVragen } from "./assessment-structuur";
import type { Assessment, Organisatie, OrganisatieLid, ScanInvulling } from "./types";

const lid: OrganisatieLid = {
  id: "L1", organisatieId: "O1", email: "jan@x.nl", naam: "Jan", functie: "Manager", team: "Zorg", notities: "Let op",
  toegangscode: "abc", leadMetingIds: [], aangemaaktOp: "2026-01-01T00:00:00.000Z",
};
const scan = (assessment: Assessment, status: ScanInvulling["status"] = "afgerond"): ScanInvulling => ({
  id: "I1", scanUitvoeringId: "M1", organisatieLidId: "L1", status, uitgenodigdOp: "2026-01-01", gestartOp: "2026-01-02",
  afgerondOp: status === "afgerond" ? "2026-01-03" : null,
  antwoorden: Object.fromEntries(alleVragen(assessment).map((v) => [v.id, 4])), opmerkingenPerBouwblok: {}, bewaarVerlengdTot: null,
});
const organisatie = (assessment: Assessment, invullingen: ScanInvulling[]): Organisatie => ({
  id: "O1", naam: "Acme", kenmerken: { sector: "x" }, leden: [lid],
  scanUitvoeringen: [{ id: "M1", organisatieId: "O1", assessmentId: assessment.id, label: "Nulmeting", aangemaaktOp: "x", invullingen }],
  aangemaaktDoor: null, toegewezenAan: [], aangemaaktOp: "x", gewijzigdOp: "x",
});

// Zorgscan met een gewicht van 1,5 op bouwblok 4 en 2 op bouwblok 10.
const zorgscan: Assessment = {
  ...zorgscanSeed,
  categorieen: zorgscanSeed.categorieen!.map((c) => ({
    ...c,
    bouwblokken: c.bouwblokken.map((b) => ({ ...b, gewicht: b.volgnummer === 4 ? 1.5 : b.volgnummer === 10 ? 2 : 1 })),
  })),
};

const kolom = (csv: string, naam: string) => {
  const [kop, rij] = csv.replace(/^﻿/, "").split("\r\n");
  const idx = kop.split(";").indexOf(naam);
  return rij.split(/;(?=")/)[idx].slice(1, -1).replace(/""/g, '"');
};

describe("CSV groepsScores met gewicht", () => {
  it("bij categorieën: per groep een lijst bouwblokken met nummer, naam, score en gewicht (altijd aanwezig, komma bij decimalen)", () => {
    const csv = genereerScansCsv([{ organisatie: organisatie(zorgscan, [scan(zorgscan)]), scanUitvoering: organisatie(zorgscan, []).scanUitvoeringen[0], lid, invulling: scan(zorgscan), assessment: zorgscan }]);
    const groepsScores = kolom(csv, "groepsScores");
    expect(groepsScores).toContain('"type":"categorie"');
    expect(groepsScores).toContain('"bouwblokken":[');
    expect(groepsScores).toMatch(/\{"nummer":4,"naam":"Leren uit klantcontact","score":4,0,"gewicht":1,5\}/);
    expect(groepsScores).toMatch(/\{"nummer":10,"naam":"Kanaalmanagement","score":4,0,"gewicht":2\}/);
    // Ook bij gewicht 1.
    expect(groepsScores).toMatch(/\{"nummer":1,"naam":"Organisatiestrategie","score":4,0,"gewicht":1\}/);
  });

  it("zonder categorieën: nummer en gewicht staan direct op de groep, zonder lijst bouwblokken", () => {
    const o = organisatie(aiVolwassenheid, [scan(aiVolwassenheid)]);
    const csv = genereerScansCsv([{ organisatie: o, scanUitvoering: o.scanUitvoeringen[0], lid, invulling: scan(aiVolwassenheid), assessment: aiVolwassenheid }]);
    const groepsScores = kolom(csv, "groepsScores");
    expect(groepsScores).toContain('"type":"bouwblok"');
    expect(groepsScores).not.toContain('"bouwblokken"');
    expect(groepsScores).toMatch(/"nummer":1,"gewicht":1\}/);
  });
});

describe("Inzage (AVG)", () => {
  it("geeft één rij per scan, ook onafgeronde, met notities en aangemaakt-op, zonder organisatiekenmerken", () => {
    const o = organisatie(aiVolwassenheid, [scan(aiVolwassenheid, "bezig")]);
    const { csv, aantalScans } = genereerInzageCsv(o, lid, [aiVolwassenheid]);
    const kop = csv.replace(/^﻿/, "").split("\r\n")[0].split(";");
    expect(aantalScans).toBe(1);
    expect(kop).toContain("respondent_notities");
    expect(kop).toContain("respondent_aangemaakt_op");
    expect(kop).not.toContain("organisatie_kenmerken");
    expect(kolom(csv, "status")).toBe("bezig");
    expect(kolom(csv, "respondent_notities")).toBe("Let op");
    expect(csv).not.toContain("abc"); // geen toegangscode
  });

  it("een Respondent zonder scans geeft één rij met alleen de persoonsgegevens", () => {
    const o = { ...organisatie(aiVolwassenheid, []), scanUitvoeringen: [] };
    const { csv, aantalScans } = genereerInzageCsv(o, lid, [aiVolwassenheid]);
    expect(aantalScans).toBe(0);
    expect(csv.trim().split("\r\n")).toHaveLength(2);
    expect(kolom(csv, "respondent_email")).toBe("jan@x.nl");
    expect(kolom(csv, "status")).toBe("");
  });

  it("de bestandsnaam is 'Inzage <Organisatie> - <Respondent> - <datum>.csv', met e-mailadres als de naam leeg is", () => {
    const o = organisatie(aiVolwassenheid, []);
    expect(inzageBestandsnaam(o, lid, new Date("2026-10-07T10:00:00Z"))).toBe("Inzage Acme - Jan - 2026-10-07.csv");
    expect(inzageBestandsnaam(o, { ...lid, naam: null }, new Date("2026-10-07T10:00:00Z"))).toBe("Inzage Acme - jan@x.nl - 2026-10-07.csv");
  });
});
