import { describe, expect, it } from "vitest";
import { zorgscan } from "@/data/zorgscan-assessment";
import { ziekenhuisQuickscan } from "@/data/ziekenhuis-quickscan-assessment";
import { alleVragen } from "./assessment-structuur";
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
    expect(t.rijen[0].fractie).toBeCloseTo(0.8, 5);
    expect(t.pilAchtergrond).toBe("var(--score-4-cel)");
  });

  it("de hele meting is het gemiddelde van de afgeronde scans", () => {
    const t = teaserVoorMeting(zorgscan, [scan(2), scan(4), { ...scan(1), status: "bezig" }])!;
    expect(t.getal).toBe("3,0");
    expect(t.sub).toBe("Gemiddelde van 2 afgeronde scans");
    expect(t.klasseNaam).toBe("Uitbouwen");
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
    expect(t.sub).toBe("Gemiddelde van 2 afgeronde scans");
    expect(t.rijen.every((r) => /^\d+%$/.test(r.waarde))).toBe(true);
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
