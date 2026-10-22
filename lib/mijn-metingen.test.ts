import { describe, expect, it } from "vitest";
import { zorgscan } from "@/data/zorgscan-assessment";
import { ziekenhuisQuickscan } from "@/data/ziekenhuis-quickscan-assessment";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";
import { alleBouwblokkenMetGroep, alleVragen } from "./assessment-structuur";
import {
  celStap,
  isEindstand,
  laatstOpgeslagenTekst,
  langeDatum,
  responsVan,
  sorteerAfgerond,
  sorteerNogTeDoen,
  teaserVoorMeting,
  teaserVoorScan,
  voornaamVan,
} from "./mijn-metingen";
import type { Antwoord, ScanInvulling } from "./types";

const alle = (waarde: number) => Object.fromEntries(alleVragen(zorgscan).map((v) => [v.id, waarde]));

function scan(waarde: number): ScanInvulling {
  return {
    id: "s", scanUitvoeringId: "m", organisatieLidId: "l", status: "afgerond", aangemaaktOp: "x", uitgenodigdOp: "x",
    gestartOp: null, afgerondOp: null, bewaarVerlengdTot: null, opmerkingenPerBouwblok: {}, antwoorden: alle(waarde),
  } as unknown as ScanInvulling;
}

describe("laatst opgeslagen", () => {
  const nu = new Date(2026, 9, 15, 14, 0);
  it("toont vandaag, gisteren en dagen, daarna de datum", () => {
    expect(laatstOpgeslagenTekst(new Date(2026, 9, 15, 9, 0).toISOString(), nu)).toBe("vandaag");
    expect(laatstOpgeslagenTekst(new Date(2026, 9, 14, 23, 0).toISOString(), nu)).toBe("gisteren");
    expect(laatstOpgeslagenTekst(new Date(2026, 9, 12, 10, 0).toISOString(), nu)).toBe("3 dagen geleden");
    expect(laatstOpgeslagenTekst(new Date(2026, 9, 1, 10, 0).toISOString(), nu)).toBe("1 oktober 2026");
  });
  it("is leeg zonder tijdstip", () => {
    expect(laatstOpgeslagenTekst(null, nu)).toBe("");
    expect(laatstOpgeslagenTekst("onzin", nu)).toBe("");
  });
});

describe("datums en namen", () => {
  it("lange datum en voornaam", () => {
    expect(langeDatum("2026-10-12T09:00:00.000Z")).toBe("12 oktober 2026");
    expect(langeDatum(null)).toBe("");
    expect(voornaamVan("Sander Hesselink")).toBe("Sander");
    expect(voornaamVan(null)).toBe("");
  });
});

describe("teaser", () => {
  it("een scan met alles op 4 is Sterk punt met een rij per categorie", () => {
    const t = teaserVoorScan(zorgscan, alle(4))!;
    expect(t.soort).toBe("schaal");
    expect(t.getal).toBe("4,0");
    expect(t.klasseNaam).toBe("Sterk punt");
    expect(t.rijen).toHaveLength(5);
    // Het spoor loopt van 1 tot 5: Een 4,0 staat op 75%, niet op 80% (`visualisatie-mijn-metingen.md`, Schaal).
    expect(t.rijen[0].fractie).toBeCloseTo(0.75, 5);
    expect(t.stijl).toBe("balk");
    expect(t.rijen[0].alt).toBe("Overkoepelend, jouw score 4,0");
    expect(t.pilAchtergrond).toBe("var(--score-4-cel)");
  });

  it("de hele meting is het gemiddelde van de afgeronde scans", () => {
    const t = teaserVoorMeting(zorgscan, [scan(2), scan(4), { ...scan(1), status: "bezig" }])!;
    expect(t.getal).toBe("3,0");
    expect(t.sub).toBeNull();
    expect(t.aantalScans).toBe(2);
    expect(t.klasseNaam).toBe("Uitbouwen");
  });

  it("de hele meting toont een stip op het gemiddelde met een lijn van laagste tot hoogste score", () => {
    const t = teaserVoorMeting(zorgscan, [scan(2), scan(4)])!;
    expect(t.stijl).toBe("stip");
    expect(t.ankers).toBe(true);
    // Gemiddelde 3,0 op 50% van het spoor, laagste 2,0 op 25%, hoogste 4,0 op 75%.
    expect(t.rijen[0].fractie).toBeCloseTo(0.5, 5);
    expect(t.rijen[0].lijn?.van).toBeCloseTo(0.25, 5);
    expect(t.rijen[0].lijn?.tot).toBeCloseTo(0.75, 5);
    expect(t.rijen[0].alt).toBe("Overkoepelend, gemiddelde 3,0, laagste 2,0, hoogste 4,0");
  });

  it("zonder afgeronde scans is er geen teaser", () => {
    expect(teaserVoorMeting(zorgscan, [{ ...scan(2), status: "bezig" }])).toBeNull();
  });

  it("de celstap volgt de afgeronde waarde", () => {
    expect(celStap(3.44)).toBe(3);
    expect(celStap(3.5)).toBe(4);
  });
});

describe("teaser van de Quickscan", () => {
  const vragen = alleVragen(ziekenhuisQuickscan);
  const antwoorden = (aantalJa: number): Record<string, Antwoord> =>
    Object.fromEntries(vragen.map((v, i) => [v.id, i < aantalJa ? "ja" : "nee"]));
  const relevantie = Object.fromEntries((ziekenhuisQuickscan.categorieen ?? []).map((c) => [c.id, true]));

  it("toont het totaal in procenten met punten, en een rij per afdeling", () => {
    const t = teaserVoorScan(ziekenhuisQuickscan, antwoorden(30), relevantie)!;
    expect(t.soort).toBe("percentage");
    expect(t.getal).toBe("50%");
    expect(t.klasseNaam).toBe("Gemiddeld ontwikkeld");
    expect(t.sub).toBe("30 van 60 punten");
    expect(t.rijen.length).toBeGreaterThan(0);
    expect(t.rijen[0].waarde).toMatch(/^\d+\/\d+ · \d+%$/);
  });

  it("de hele meting toont alleen percentages", () => {
    const scans = [30, 60].map((n, i) => ({
      id: `s${i}`, status: "afgerond", antwoorden: antwoorden(n), relevantie,
    })) as unknown as ScanInvulling[];
    const t = teaserVoorMeting(ziekenhuisQuickscan, scans)!;
    expect(t.sub).toBeNull();
    expect(t.aantalScans).toBe(2);
    expect(t.rijen.every((r) => /^\d+%$/.test(r.waarde))).toBe(true);
    // De Quickscan houdt de balk met het percentage.
    expect(t.stijl).toBe("balk");
    expect(t.ankers).toBe(false);
  });

  it("de ring van de Kaart met cirkel loopt van 0 tot 100% in de klassekleur, met een chip in de celkleur", () => {
    const t = teaserVoorScan(ziekenhuisQuickscan, antwoorden(54), relevantie)!;
    expect(t.ring.fractie).toBeCloseTo(0.9);
    expect(t.ring.kleur).toBe("var(--stat-green)");
    expect(t.ring.chipAchtergrond).toBe("#e7f6ef");
    const laag = teaserVoorScan(ziekenhuisQuickscan, antwoorden(12), relevantie)!;
    expect(laag.ring.kleur).toBe("var(--stat-red)");
    expect(laag.ring.chipTekst).toBe("#7f1d1d");
  });

  it("de hele meting heeft per afdeling een lijn van laagste tot hoogste percentage", () => {
    const scans = [15, 45].map((n, i) => ({ id: `s${i}`, status: "afgerond", antwoorden: antwoorden(n), relevantie })) as unknown as ScanInvulling[];
    const t = teaserVoorMeting(ziekenhuisQuickscan, scans)!;
    const metLijn = t.rijen.filter((r) => r.lijn);
    expect(metLijn.length).toBe(t.rijen.length);
    for (const r of metLijn) expect(r.lijn!.van).toBeLessThanOrEqual(r.lijn!.tot);
    expect(metLijn.some((r) => r.lijn!.van < r.lijn!.tot)).toBe(true);
  });
});

describe("een afdeling die niet is beantwoord", () => {
  const vragen = alleVragen(ziekenhuisQuickscan);
  const eerste = ziekenhuisQuickscan.categorieen![0];
  const relevantie = Object.fromEntries((ziekenhuisQuickscan.categorieen ?? []).map((c) => [c.id, c.id !== eerste.id]));
  const antwoorden = Object.fromEntries(vragen.map((v) => [v.id, "ja"])) as Record<string, Antwoord>;

  it("blijft als rij staan, met een streepje en zonder balk, op de plek van het model", () => {
    const t = teaserVoorScan(ziekenhuisQuickscan, antwoorden, relevantie)!;
    expect(t.rijen.map((r) => r.sleutel)).toEqual((ziekenhuisQuickscan.categorieen ?? []).map((c) => c.id));
    const rij = t.rijen[0];
    expect(rij).toMatchObject({ nietBeantwoord: true, waarde: "–", fractie: 0 });
    expect(t.rijen.slice(1).every((r) => !r.nietBeantwoord)).toBe(true);
  });
});

describe("de ring bij een schaal", () => {
  it("vult tot (score - 1) / 4 in de volle kleur van de afgeronde score", () => {
    const t = teaserVoorScan(zorgscan, alle(3))!;
    expect(t.ring.fractie).toBeCloseTo(0.5);
    expect(t.ring.kleur).toBe("var(--score-3)");
    expect(t.ring.chipAchtergrond).toBe("var(--score-3-cel)");
  });
});

describe("secties en respons", () => {
  it("nog te doen: oudste uitnodiging eerst, afgerond: nieuwste eerst", () => {
    const items = [
      { id: "a", invulling: { status: "bezig" as const, uitgenodigdOp: "2026-10-05", afgerondOp: null } },
      { id: "b", invulling: { status: "uitgenodigd" as const, uitgenodigdOp: "2026-10-01", afgerondOp: null } },
      { id: "c", invulling: { status: "afgerond" as const, uitgenodigdOp: "2026-09-01", afgerondOp: "2026-09-10" } },
      { id: "d", invulling: { status: "afgerond" as const, uitgenodigdOp: "2026-09-02", afgerondOp: "2026-09-20" } },
    ];
    expect(sorteerNogTeDoen(items).map((i) => i.id)).toEqual(["b", "a"]);
    expect(sorteerAfgerond(items).map((i) => i.id)).toEqual(["d", "c"]);
  });

  it("respons telt alle records als uitgenodigd en is compleet als iedereen klaar is", () => {
    const r = responsVan([{ status: "afgerond" }, { status: "bezig" }, { status: "uitgenodigd" }]);
    expect(r).toEqual({ afgerond: 1, uitgenodigd: 3, percentage: 33, compleet: false });
    expect(isEindstand(r)).toBe(false);
    expect(isEindstand(responsVan([{ status: "afgerond" }]))).toBe(true);
    expect(responsVan([]).compleet).toBe(false);
  });
});

describe("teaser van de AI-scan (domeinrijen, 22 oktober 2026)", () => {
  const ai = aiVolwassenheid;
  const domeinen = alleBouwblokkenMetGroep(ai).map((b) => b.bouwblok);
  const antwoorden = (waarde: number) => Object.fromEntries(alleVragen(ai).map((v) => [v.id, waarde]));

  it("heeft een rij per domein in de vaste volgorde 1 tot en met 8, met het nummer in de domeinkleur", () => {
    const t = teaserVoorScan(ai, antwoorden(2))!;
    expect(t.rijen).toHaveLength(domeinen.length);
    expect(t.rijen.map((r) => r.nummer?.nr)).toEqual(domeinen.map((d) => d.volgnummer));
    expect(t.rijen.map((r) => r.naam)).toEqual(domeinen.map((d) => d.naam));
    expect(t.rijen[0].nummer).toMatchObject({ achtergrond: "#ff671f", tekst: "#fff" });
    // Alleen het gele domein 5 heeft een donker nummer, turkoois (6) en lavendel (8) hebben een wit nummer.
    expect([4, 5, 7].map((i) => t.rijen[i].nummer?.tekst)).toEqual(["var(--ink)", "#fff", "#fff"]);
    expect(t.rijenLabel).toBe("Per domein");
    expect(t.klasseNaam).toBe("Basis op orde");
  });

  it("heeft een tekstalternatief per rij met domein, naam en score", () => {
    const t = teaserVoorScan(ai, antwoorden(2))!;
    expect(t.rijen[2].alt).toBe(`Domein 3, ${domeinen[2].naam}, jouw score 2,0`);
  });

  it("toont bij de hele meting het gemiddelde met de laagste en hoogste score per domein", () => {
    const scanAi = (waarde: number) => ({ ...scan(waarde), antwoorden: antwoorden(waarde) }) as unknown as ScanInvulling;
    const t = teaserVoorMeting(ai, [scanAi(2), scanAi(4)])!;
    expect(t.stijl).toBe("stip");
    expect(t.rijen[0].fractie).toBeCloseTo(0.5, 5);
    expect(t.rijen[0].lijn).toEqual({ van: expect.closeTo(0.25, 5), tot: expect.closeTo(0.75, 5) });
    expect(t.rijen[0].alt).toBe(`Domein 1, ${domeinen[0].naam}, gemiddelde 3,0, laagste 2,0, hoogste 4,0`);
  });
});
