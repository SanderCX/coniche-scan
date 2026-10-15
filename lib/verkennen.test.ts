import { describe, expect, it } from "vitest";
import { zorgscan } from "@/data/zorgscan-assessment";
import { alleVragen } from "./assessment-structuur";
import type { Organisatie, ScanInvulling } from "./types";
import {
  LEGE_FILTERS,
  bouwPool,
  filterVelden,
  heatmap,
  histogram,
  kanaalIngezet,
  maakGroepen,
  mediaan,
  pasFiltersToe,
  regressie,
  splitsFocus,
  sterkteWoord,
  vergelijk,
} from "./verkennen";

const assessment = zorgscan;

function scan(id: string, waarde: number): ScanInvulling {
  return {
    id, scanUitvoeringId: "m", organisatieLidId: id, status: "afgerond", aangemaaktOp: "x", uitgenodigdOp: "x", gestartOp: null,
    afgerondOp: null, bewaarVerlengdTot: null, opmerkingenPerBouwblok: {},
    antwoorden: Object.fromEntries(alleVragen(assessment).map((v) => [v.id, waarde])),
  };
}

function org(id: string, waarde: number, opties: { vlag?: boolean; scans?: number; kenmerken?: Organisatie["kenmerken"] } = {}): Organisatie {
  const n = opties.scans ?? 3;
  return {
    id, naam: `Org ${id}`, kenmerken: opties.kenmerken ?? {}, leden: [], aangemaaktDoor: null, toegewezenAan: [],
    benchmarkToegestaan: opties.vlag ?? true, aangemaaktOp: "x", gewijzigdOp: "x",
    scanUitvoeringen: [
      {
        id: `m-${id}`, organisatieId: id, assessmentId: assessment.id, label: "Meting", aangemaaktOp: "2026-01-01", meetdatum: "2026-02-01",
        invullingen: Array.from({ length: n }, (_, i) => scan(`${id}-${i}`, waarde)),
      },
    ],
  } as unknown as Organisatie;
}

const kenmerken = (sector: string, aht?: number, call?: number): Organisatie["kenmerken"] => ({
  "sector-subsector": { sector },
  kpis: aht === undefined ? {} : { aht },
  "volume-klantbasis": { "contacten-per-jaar": call === undefined ? {} : { "kanaal-call": call } },
});

describe("de pool", () => {
  it("telt alleen organisaties met toestemming en genoeg scans, en meldt wie geen toestemming heeft", () => {
    const pool = bouwPool([org("a", 3), org("b", 4, { vlag: false }), org("c", 2, { scans: 1 })], assessment, 3);
    expect(pool.leden.map((l) => l.organisatie.id)).toEqual(["a"]);
    expect(pool.zonderToestemming).toBe(1);
    expect(pool.leden[0].overall).toBe(3);
    expect(pool.rijen).toHaveLength(15);
  });
});

describe("filters", () => {
  const orgs = [
    org("a", 2, { kenmerken: kenmerken("Industrie", 300, 1000) }),
    org("b", 3, { kenmerken: kenmerken("Industrie", 500, 0) }),
    org("c", 4, { kenmerken: kenmerken("Onderwijs", 400) }),
    org("d", 5, { kenmerken: kenmerken("Onderwijs", undefined, 200) }),
  ];
  const leden = bouwPool(orgs, assessment, 3).leden;
  const velden = filterVelden();

  it("leidt de filters af uit de organisatievelden", () => {
    expect(velden.find((v) => v.id === "sector-subsector.sector")?.type).toBe("select");
    expect(velden.find((v) => v.id === "kpis.aht")?.type).toBe("getal");
    expect(velden.find((v) => v.id === "kpis.csat")?.type).toBe("getal");
    expect(velden.find((v) => v.id.startsWith("techstack."))).toBeDefined();
  });

  it("een select werkt als of, verschillende filters als en", () => {
    const sector = pasFiltersToe(leden, { ...LEGE_FILTERS, select: { "sector-subsector.sector": ["Industrie"] } });
    expect(sector.map((l) => l.organisatie.id)).toEqual(["a", "b"]);
    const beide = pasFiltersToe(leden, { ...LEGE_FILTERS, select: { "sector-subsector.sector": ["Industrie", "Onderwijs"] } });
    expect(beide).toHaveLength(4);
    const samen = pasFiltersToe(leden, {
      select: { "sector-subsector.sector": ["Industrie"] },
      bereik: { "kpis.aht": [350, 600] },
      kanalen: [],
    });
    expect(samen.map((l) => l.organisatie.id)).toEqual(["b"]);
  });

  it("een organisatie zonder waarde valt weg bij een getalfilter", () => {
    const f = pasFiltersToe(leden, { ...LEGE_FILTERS, bereik: { "kpis.aht": [0, 1000] } });
    expect(f.map((l) => l.organisatie.id)).toEqual(["a", "b", "c"]);
  });

  it("een kanaal is ingezet boven 0, niet bij 0 en onbekend als het veld leeg is", () => {
    expect(kanaalIngezet(orgs[0], ["volume-klantbasis", "contacten-per-jaar", "kanaal-call"])).toBe(true);
    expect(kanaalIngezet(orgs[1], ["volume-klantbasis", "contacten-per-jaar", "kanaal-call"])).toBe(false);
    expect(kanaalIngezet(orgs[2], ["volume-klantbasis", "contacten-per-jaar", "kanaal-call"])).toBeNull();
    const f = pasFiltersToe(leden, { ...LEGE_FILTERS, kanalen: ["kanaal-call"] });
    expect(f.map((l) => l.organisatie.id)).toEqual(["a", "d"]);
  });
});

describe("groeperen en vergelijken", () => {
  const orgs = [
    org("a", 4, { kenmerken: kenmerken("Industrie", 300) }),
    org("b", 4, { kenmerken: kenmerken("Industrie", 350) }),
    org("c", 2, { kenmerken: kenmerken("Onderwijs", 500) }),
    org("d", 2, { kenmerken: kenmerken("Onderwijs", 600) }),
    org("e", 3, { kenmerken: {} }),
  ];
  const pool = bouwPool(orgs, assessment, 3);

  it("groepeert op een select, de grootste eerst, zonder organisaties zonder waarde", () => {
    const groepen = maakGroepen(pool.leden, { soort: "select", veldId: "sector-subsector.sector" });
    expect(groepen.map((g) => [g.naam, g.leden.length])).toEqual([
      ["Industrie", 2],
      ["Onderwijs", 2],
    ]);
  });

  it("een drempel op een getalveld geeft twee groepen", () => {
    const groepen = maakGroepen(pool.leden, { soort: "drempel", veldId: "kpis.aht", drempel: 400 });
    expect(groepen.map((g) => [g.naam, g.leden.map((l) => l.organisatie.id)])).toEqual([
      ["≤ 400", ["a", "b"]],
      ["> 400", ["c", "d"]],
    ]);
  });

  it("de rest is alle andere organisaties in de pool, ook zonder waarde", () => {
    const [industrie] = maakGroepen(pool.leden, { soort: "select", veldId: "sector-subsector.sector" });
    const { focus, rest } = splitsFocus(pool.leden, industrie);
    expect(focus).toHaveLength(2);
    expect(rest.map((l) => l.organisatie.id)).toEqual(["c", "d", "e"]);
  });

  it("het verschil is het gemiddelde van de focus min dat van de rest, elke organisatie even zwaar", () => {
    const [industrie] = maakGroepen(pool.leden, { soort: "select", veldId: "sector-subsector.sector" });
    const { focus, rest } = splitsFocus(pool.leden, industrie);
    const v = vergelijk(pool.rijen, focus, rest);
    expect(v.rijen[0].focus.gemiddelde).toBe(4);
    expect(v.rijen[0].rest.gemiddelde).toBeCloseTo(7 / 3, 5);
    expect(v.rijen[0].verschil).toBe(1.7);
    expect(v.overall.verschil).toBe(1.7);
    expect(v.grootstePlus?.verschil).toBe(1.7);
    expect(v.grootsteMin).toBeNull();
  });

  it("een lege focus of rest geeft geen gemiddelde", () => {
    const v = vergelijk(pool.rijen, [], pool.leden);
    expect(v.rijen[0].focus.gemiddelde).toBeNull();
    expect(v.rijen[0].verschil).toBeNull();
  });

  it("de heatmap vergelijkt met de hele pool en laat een groep onder het minimum leeg", () => {
    const groepen = maakGroepen(pool.leden, { soort: "select", veldId: "sector-subsector.sector" });
    const h = heatmap(pool.rijen, pool.leden, groepen, 3);
    expect(h.groepen.every((g) => g.teKlein)).toBe(true);
    expect(h.groepen[0].cellen[0].gemiddelde).toBeNull();
    const h2 = heatmap(pool.rijen, pool.leden, groepen, 2);
    expect(h2.pool.gemiddelde[0]).toBeCloseTo(3, 5);
    expect(h2.groepen[0].cellen[0].verschil).toBe(1);
    expect(h2.groepen[1].cellen[0].verschil).toBe(-1);
  });
});

describe("verband met een kenmerk", () => {
  it("rechte lijn en correlatie, minder dan drie punten geeft niets", () => {
    const r = regressie([{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }]);
    expect(r?.helling).toBeCloseTo(2, 5);
    expect(r?.r).toBeCloseTo(1, 5);
    expect(regressie([{ x: 1, y: 1 }, { x: 2, y: 2 }])).toBeNull();
    expect(regressie([{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }])).toBeNull();
  });

  it("woorden bij de sterkte", () => {
    expect(sterkteWoord(0.1)).toBe("nauwelijks");
    expect(sterkteWoord(-0.3)).toBe("zwak negatief");
    expect(sterkteWoord(0.5)).toBe("matig positief");
    expect(sterkteWoord(0.9)).toBe("sterk positief");
  });
});

describe("hulpfuncties", () => {
  it("histogram en mediaan", () => {
    expect(histogram([1, 2, 3, 4], 1, 4, 3)).toEqual([1, 1, 2]);
    expect(mediaan([1, 2, 3, 10])).toBe(2.5);
    expect(mediaan([])).toBeNull();
  });
});
