import { describe, expect, it } from "vitest";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";
import { zorgscan } from "@/data/zorgscan-assessment";
import { alleVragen } from "./assessment-structuur";
import { bouwblokScore, overallScore } from "./scoring";
import type { Assessment, ScanInvulling } from "./types";
import {
  eenMeting,
  groepStatistiek,
  klasseVan,
  kwantiel,
  matrix,
  spreiding,
  spreidingsLabel,
  sorteerOpSpreiding,
  steekproefSd,
  tussenMetingen,
  tussenOrganisaties,
} from "./visualisatie";

const a: Assessment = zorgscan; // Met gewichten (4, 10 en 11 op 2): De scherpste test van de gedeelde scorefunctie.

/** Een scan waarin elke vraag dezelfde waarde heeft. */
const scan = (id: string, waarde: number | ((vraagIndex: number) => number), status: ScanInvulling["status"] = "afgerond", ass = a): ScanInvulling => ({
  id, scanUitvoeringId: "m", organisatieLidId: id, status, aangemaaktOp: "x", uitgenodigdOp: "x", gestartOp: null, afgerondOp: null,
  antwoorden: Object.fromEntries(alleVragen(ass).map((v, i) => [v.id, typeof waarde === "function" ? waarde(i) : waarde])),
  opmerkingenPerBouwblok: {}, bewaarVerlengdTot: null,
});

describe("klasse en afronding", () => {
  it("volgt de classificatie op de afgeronde waarde", () => {
    expect(klasseVan(2.49)).toBe("oranje"); // afgerond 2,5
    expect(klasseVan(2.44)).toBe("rood");
    expect(klasseVan(3.44)).toBe("oranje");
    expect(klasseVan(3.45)).toBe("groen"); // wordt 3,5: Sterk punt
    expect(klasseVan(null)).toBeNull();
  });
});

describe("A. Eén meting", () => {
  it("toont het gemiddelde per bouwblok, de laagste en hoogste scan en de totaalscore uit de gedeelde scorefunctie", () => {
    const scans = [scan("s1", 2), scan("s2", 4), scan("s3", 3, "bezig")];
    const w = eenMeting(a, scans);
    expect(w.aantalScans).toBe(2);
    expect(w.totaal).toBe(3);
    expect(w.rijen).toHaveLength(15);
    for (const r of w.rijen) {
      expect(r.score).toBe(3);
      expect(r.laagste).toBe(2);
      expect(r.hoogste).toBe(4);
      expect(r.klasse).toBe("oranje");
    }
    expect(w.verdeling).toEqual({ rood: 0, oranje: 15, groen: 0 });
  });

  it("de totaalscore komt uit de ruwe antwoorden met de gewichten, niet uit het gemiddelde van de bouwblokken", () => {
    const s = scan("s", (i) => (i % 3) + 1);
    const w = eenMeting(a, [s]);
    expect(w.totaal).toBe(overallScore(a, s.antwoorden));
  });

  it("zonder afgeronde scan staat er een streepje (geen score)", () => {
    const w = eenMeting(a, [scan("s", 3, "bezig")]);
    expect(w.aantalScans).toBe(0);
    expect(w.totaal).toBeNull();
    expect(w.rijen.every((r) => r.score === null && r.klasse === null)).toBe(true);
    expect(w.hoogsteBouwblok).toBeNull();
  });

  it("noemt het hoogste en laagste bouwblok bij naam", () => {
    const eersteBouwblokVragen = new Set(a.categorieen![0].bouwblokken[0].vragen.map((v) => v.id));
    const s = scan("s", 3);
    for (const id of eersteBouwblokVragen) s.antwoorden[id] = 5;
    const w = eenMeting(a, [s]);
    expect(w.hoogsteBouwblok).toEqual({ score: 5, naam: a.categorieen![0].bouwblokken[0].naam });
    expect(w.laagsteBouwblok?.score).toBe(3);
  });
});

describe("B. Spreiding", () => {
  it("rekent de standaardafwijking op de steekproef (n − 1)", () => {
    expect(steekproefSd([1])).toBeNull();
    expect(steekproefSd([2, 4])).toBeCloseTo(Math.SQRT2, 10);
    expect(steekproefSd([3, 3, 3, 3])).toBe(0);
  });

  it("labelt Eensgezind, Wisselend en Verdeeld op de grenzen 0,55 en 0,8", () => {
    expect(spreidingsLabel(0.549)).toBe("Eensgezind");
    expect(spreidingsLabel(0.55)).toBe("Wisselend");
    expect(spreidingsLabel(0.799)).toBe("Wisselend");
    expect(spreidingsLabel(0.8)).toBe("Verdeeld");
  });

  it("zonder scan-view tellen alle scans mee", () => {
    const w = spreiding(a, [scan("s1", 2), scan("s2", 4), scan("s3", 3)]);
    expect(w.aantalScans).toBe(3);
    expect(w.rijen[0].scores).toEqual([2, 4, 3]);
    expect(w.rijen[0].gemiddelde).toBe(3);
    expect(w.rijen[0].sd).toBeCloseTo(1, 10);
    expect(w.rijen[0].label).toBe("Verdeeld");
    expect(w.aantalOnderGemiddelde).toBeNull();
  });

  it("de vergelijkgroep van een scan-view is alle andere scans, zonder de scan zelf", () => {
    const w = spreiding(a, [scan("s1", 2), scan("s2", 4), scan("s3", 5)], "s1");
    expect(w.aantalScans).toBe(3);
    expect(w.rijen[0].scores).toEqual([4, 5]);
    expect(w.rijen[0].gemiddelde).toBe(4.5);
    expect(w.rijen[0].focusScore).toBe(2);
    expect(w.rijen[0].onderGemiddelde).toBe(true);
    expect(w.aantalOnderGemiddelde).toBe(15);
  });

  it("noemt het meest verdeelde en meest eensgezinde bouwblok", () => {
    const bouwblok = a.categorieen![0].bouwblokken[0];
    const ids = new Set(bouwblok.vragen.map((v) => v.id));
    const s1 = scan("s1", 3);
    const s2 = scan("s2", 3);
    for (const id of ids) {
      s1.antwoorden[id] = 1;
      s2.antwoorden[id] = 5;
    }
    const w = spreiding(a, [s1, s2]);
    expect(w.meestVerdeeld?.naam).toBe(bouwblok.naam);
    expect(w.meestVerdeeld?.sd).toBeCloseTo(Math.sqrt(8), 10);
    expect(w.meestEensgezind?.sd).toBe(0);
  });

  it("sorteert van grote naar kleine spreiding, zonder spreiding onderaan", () => {
    const uit = sorteerOpSpreiding([{ sd: 0.2 }, { sd: null }, { sd: 0.9 }, { sd: 0.5 }]);
    expect(uit.map((r) => r.sd)).toEqual([0.9, 0.5, 0.2, null]);
  });
});

describe("C. Tussen Metingen", () => {
  it("het verschil is de getoonde nieuwe waarde min de getoonde oude waarde", () => {
    const w = tussenMetingen(a, [scan("v", 2)], [scan("h", 3)]);
    expect(w.totaalVorig).toBe(2);
    expect(w.totaalHuidig).toBe(3);
    for (const r of w.rijen) {
      expect(r.verschil).toBe(1);
      expect(r.richting).toBe("stijging");
    }
    expect(w.gestegen).toBe(15);
    expect(w.gedaald).toBe(0);
  });

  it("meldt een wissel van klasse en een daling", () => {
    const w = tussenMetingen(a, [scan("v", 4)], [scan("h", 2)]);
    expect(w.gedaald).toBe(15);
    expect(w.gewisseld).toBe(15);
    expect(w.rijen[0].vorigeKlasse).toBe("groen");
    expect(w.rijen[0].huidigeKlasse).toBe("rood");
    expect(w.rijen[0].richting).toBe("daling");
  });

  it("geen verandering is gelijk, niet stijging of daling", () => {
    const w = tussenMetingen(a, [scan("v", 3)], [scan("h", 3)]);
    expect(w.rijen.every((r) => r.richting === "gelijk" && r.verschil === 0 && !r.klasseGewisseld)).toBe(true);
    expect(w.gestegen + w.gedaald + w.gewisseld).toBe(0);
  });

  it("een bouwblok zonder antwoorden in een van de Metingen heeft geen verschil", () => {
    const leeg = { ...scan("h", 3), antwoorden: {} };
    const w = tussenMetingen(a, [scan("v", 3)], [leeg]);
    expect(w.rijen.every((r) => r.verschil === null && r.richting === null)).toBe(true);
  });
});

describe("D. Tussen organisaties", () => {
  it("rekent kwartielen met lineaire interpolatie zoals KWARTIEL.INC", () => {
    // Excel: KWARTIEL.INC({1,2,3,4,5},1) = 2, KWARTIEL.INC({1,2,3,4},1) = 1,75, KWARTIEL.INC({1,2,3,4},3) = 3,25.
    expect(kwantiel([1, 2, 3, 4, 5], 0.25)).toBe(2);
    expect(kwantiel([1, 2, 3, 4], 0.25)).toBeCloseTo(1.75, 10);
    expect(kwantiel([1, 2, 3, 4], 0.75)).toBeCloseTo(3.25, 10);
    expect(kwantiel([7], 0.25)).toBe(7);
  });

  it("geeft minimum, maximum en gemiddelde van de groep", () => {
    expect(groepStatistiek([5, 1, 3])).toEqual({ min: 1, q1: 2, gemiddelde: 3, q3: 4, max: 5 });
    expect(groepStatistiek([])).toBeNull();
  });

  it("zet X in het bovenste kwart, de middenmoot of het onderste kwart", () => {
    const anderen = [1, 2, 3, 4, 5].map((w) => scan(`o${w}`, w).antwoorden);
    expect(tussenOrganisaties(a, scan("x", 5).antwoorden, anderen).rijen[0].positie).toBe("Bovenste kwart");
    expect(tussenOrganisaties(a, scan("x", 3).antwoorden, anderen).rijen[0].positie).toBe("Middenmoot");
    expect(tussenOrganisaties(a, scan("x", 1).antwoorden, anderen).rijen[0].positie).toBe("Onderste kwart");
  });

  it("telt de bouwblokken boven het groepsgemiddelde en in de kwarten", () => {
    const anderen = [2, 3, 4].map((w) => scan(`o${w}`, w).antwoorden);
    const w = tussenOrganisaties(a, scan("x", 5).antwoorden, anderen);
    expect(w.grootte).toBe(3);
    expect(w.boven).toBe(15);
    expect(w.inBovensteKwart).toBe(15);
    expect(w.inOndersteKwart).toBe(0);
    expect(w.rijen[0].verschil).toBe(2);
    expect(w.rijen[0].groep).toMatchObject({ min: 2, max: 4, gemiddelde: 3 });
  });

  it("geeft geen positie zonder andere leden", () => {
    const w = tussenOrganisaties(a, scan("x", 3).antwoorden, []);
    expect(w.rijen.every((r) => r.positie === null && r.groep === null)).toBe(true);
  });
});

describe("E. Matrix", () => {
  const kolom = (label: string, waarde: number, aantal = 4) => ({ label, aantalScans: aantal, antwoorden: scan(label, waarde).antwoorden });

  it("toont per bouwblok de score van elke Meting, met klasse, rijgemiddelde en bereik", () => {
    const m = matrix(a, [kolom("Nul", 2), kolom("Vervolg", 4)]);
    expect(m.rijen[0].cellen.map((c) => c.score)).toEqual([2, 4]);
    expect(m.rijen[0].cellen.map((c) => c.klasse)).toEqual(["rood", "groen"]);
    expect(m.rijen[0].gemiddelde).toBe(3);
    expect(m.rijen[0].laagste).toBe(2);
    expect(m.rijen[0].hoogste).toBe(4);
    expect(m.rijen[0].verschil).toBe(2);
  });

  it("markeert een cel die 0,5 of meer afwijkt van het rijgemiddelde", () => {
    const afwijkend = matrix(a, [kolom("A", 3), kolom("B", 3), kolom("C", 4)]);
    // Gemiddelde 3,33: Afwijking van C is 0,67, van A en B 0,33.
    expect(afwijkend.rijen[0].cellen.map((c) => c.afwijkend)).toEqual([false, false, true]);
    expect(afwijkend.aantalAfwijkend).toBe(15);
    const gelijk = matrix(a, [kolom("A", 3), kolom("B", 3)]);
    expect(gelijk.aantalAfwijkend).toBe(0);
  });

  it("de afwijking van precies 0,5 telt mee", () => {
    const m = matrix(a, [kolom("A", 3), kolom("B", 4)]);
    expect(m.rijen[0].cellen.map((c) => c.afwijkend)).toEqual([true, true]);
  });

  it("noemt de hoogste en laagste Meting en het bouwblok met het grootste verschil", () => {
    const bouwblok = a.categorieen![0].bouwblokken[1];
    const ids = new Set(bouwblok.vragen.map((v) => v.id));
    const hoog = kolom("Hoog", 4);
    for (const id of ids) hoog.antwoorden[id] = 1;
    const m = matrix(a, [kolom("Laag", 2), hoog]);
    expect(m.hoogsteMeting?.label).toBe("Hoog");
    expect(m.laagsteMeting?.label).toBe("Laag");
    expect(m.grootsteVerschil?.naam).toBe(bouwblok.naam === "" ? "" : m.grootsteVerschil?.naam);
    expect(m.grootsteVerschil?.verschil).toBe(2);
  });

  it("een Meting zonder afgeronde scan heeft geen totaalscore", () => {
    const m = matrix(a, [kolom("Leeg", 3, 0), kolom("Vol", 3, 5)]);
    expect(m.kolommen[0].totaal).toBeNull();
    expect(m.kolommen[1].totaal).toBe(3);
  });

  it("werkt ook zonder categorielaag (AI-volwassenheid)", () => {
    const ai = aiVolwassenheid;
    const w = eenMeting(ai, [scan("s", 4, "afgerond", ai)]);
    expect(w.rijen).toHaveLength(8);
    expect(w.rijen.every((r) => r.rij.groepNaam === null || typeof r.rij.groepNaam === "string")).toBe(true);
    expect(w.totaal).toBe(bouwblokScore(ai.bouwblokken![0], scan("s", 4, "afgerond", ai).antwoorden));
  });
});
