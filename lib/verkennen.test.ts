import { zorgOnderdelenKloppend } from "./onderdelen";
import { describe, expect, it } from "vitest";
import { zorgscan } from "@/data/zorgscan-assessment";
import { alleVragen } from "./assessment-structuur";
import { migreerKpiWaarden } from "./kpi";
import type { Organisatie, ScanInvulling } from "./types";
import {
  LEGE_FILTERS,
  bouwPool,
  filterVelden,
  geldigeMeetperiode,
  meetperiodeTekst,
  KANALEN_REDEN,
  onderdeelVelden,
  selectOpties,
  STANDAARD_GROEPER_DREMPELS,
  besluitGroepering,
  drempelStap,
  formatGetal,
  kanalenVeld,
  heatmap,
  histogram,
  kanGroeperen,
  kanaalIngezet,
  metKanaal,
  getalWaarden,
  ingevuldAantal,
  lidWaarde,
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
  const o = {
    id, naam: `Org ${id}`, kenmerken: opties.kenmerken ?? {}, leden: [], aangemaaktDoor: null, toegewezenAan: [],
    benchmarkToegestaan: opties.vlag ?? true, aangemaaktOp: "x", gewijzigdOp: "x",
    scanUitvoeringen: [
      {
        id: `m-${id}`, organisatieId: id, assessmentId: assessment.id, label: "Meting", aangemaaktOp: "2026-01-01", meetdatum: "2026-02-01",
        invullingen: Array.from({ length: n }, (_, i) => scan(`${id}-${i}`, waarde)),
      },
    ],
  } as unknown as Organisatie;
  // De KPI's staan als KPI-waarden: De overgang zet de oude vorm in `kenmerken.kpis` en de contacten per kanaal om (`lib/kpi.ts`).
  migreerKpiWaarden(o);
  return o;
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
    expect(kanaalIngezet(leden[0], "kanaal-call")).toBe(true);
    expect(kanaalIngezet(leden[1], "kanaal-call")).toBe(false);
    expect(kanaalIngezet(leden[2], "kanaal-call")).toBeNull();
    const f = pasFiltersToe(leden, { ...LEGE_FILTERS, kanalen: ["kanaal-call"] });
    expect(f.map((l) => l.organisatie.id)).toEqual(["a", "d"]);
  });
});

describe("KPI's als kenmerk", () => {
  const kpiOrg = (id: string, waarden: { onderdeelId: string | null; kanaalId: string | null; waarde: number }[], onderdelen: string[] = []) => {
    const o = org(id, 3);
    o.onderdelen = onderdelen.map((n) => ({ id: `od-${n}`, organisatieId: id, naam: n, aangemaaktOp: "x" }));
    o.kpiWaarden = waarden.map((w) => ({ organisatieId: id, kpiId: "aht", ...w }));
    return o;
  };

  it("filterVelden kent een regel per KPI, met een kanaal bij een KPI per kanaal", () => {
    const aht = filterVelden().find((v) => v.id === "kpis.aht")!;
    expect(aht.kpi).toEqual({ kpiId: "aht", kanaalId: null });
    expect(aht.kpiPerKanaal).toBe(true);
    expect(aht.eenheid).toBe("s");
    expect(filterVelden().find((v) => v.id === "kpis.nps")?.kpiPerKanaal).toBe(false);
    // Contacten per jaar heeft de eenheid "aantal": Die staat niet achter de drempel.
    expect(filterVelden().find((v) => v.id === "kpis.contacten")?.eenheid).toBeUndefined();
  });

  it("bij Organisaties telt de waarde bij Algemeen, bij het gekozen kanaal", () => {
    const orgs = [
      kpiOrg("a", [{ onderdeelId: null, kanaalId: null, waarde: 300 }, { onderdeelId: null, kanaalId: "kanaal-call", waarde: 250 }]),
      kpiOrg("b", [{ onderdeelId: null, kanaalId: null, waarde: 500 }]),
    ];
    const pool = bouwPool(orgs, assessment, 3);
    const algemeen = metKanaal(filterVelden().find((v) => v.id === "kpis.aht")!, null);
    const call = metKanaal(algemeen, "kanaal-call");
    expect(getalWaarden(pool.leden, algemeen)).toEqual([300, 500]);
    // Een Organisatie zonder waarde bij het kanaal valt af: Er is geen terugval op Algemeen.
    expect(getalWaarden(pool.leden, call)).toEqual([250]);
    expect(ingevuldAantal(orgs, call)).toBe(1);
  });

  it("bij Onderdelen telt de waarde van het onderdeel en niet die van de Organisatie", () => {
    const meting = (id: string, onderdeel: string) => ({
      id, organisatieId: "a", assessmentId: assessment.id, label: id, onderdeel, meetdatum: "2026-02-01", aangemaaktOp: "2026-01-01",
      invullingen: org("tmp", 3).scanUitvoeringen[0].invullingen,
    });
    const o = kpiOrg("a", [{ onderdeelId: null, kanaalId: null, waarde: 400 }, { onderdeelId: "od-Team A", kanaalId: null, waarde: 200 }], ["Team A", "Team B"]);
    o.scanUitvoeringen = [meting("m1", "Team A"), meting("m2", "Team B")] as unknown as Organisatie["scanUitvoeringen"];
    o.scanUitvoeringen[0].onderdeelId = "od-Team A";
    o.scanUitvoeringen[1].onderdeelId = "od-Team B";
    const pool = bouwPool([o], assessment, 3, "onderdelen");
    const aht = metKanaal(filterVelden().find((v) => v.id === "kpis.aht")!, null);
    const waarden = Object.fromEntries(pool.leden.map((l) => [l.onderdeel, lidWaarde(l, aht)]));
    expect(waarden).toEqual({ "Team A": 200, "Team B": undefined });
  });

  it("ingezette kanalen volgen de plek van de eenheid", () => {
    const o = kpiOrg("a", [{ onderdeelId: null, kanaalId: "kanaal-call", waarde: 0 }]);
    o.kpiWaarden = [{ organisatieId: "a", kpiId: "contacten", onderdeelId: null, kanaalId: "kanaal-call", waarde: 10 }];
    const pool = bouwPool([o], assessment, 3);
    expect(kanaalIngezet(pool.leden[0], "kanaal-call")).toBe(true);
    expect(kanaalIngezet(pool.leden[0], "kanaal-chatbot")).toBeNull();
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
      ["≤ 400 s", ["a", "b"]],
      ["> 400 s", ["c", "d"]],
    ]);
  });

  it("de rest zijn de organisaties van de andere groepen, zonder wie geen waarde heeft", () => {
    const groepen = maakGroepen(pool.leden, { soort: "select", veldId: "sector-subsector.sector" });
    const { focus, rest } = splitsFocus(pool.leden, groepen, groepen[0]);
    expect(focus).toHaveLength(2);
    expect(rest.map((l) => l.organisatie.id)).toEqual(["c", "d"]);
  });

  it("zonder groepering is de hele pool de focus en is er geen rest", () => {
    const { focus, rest } = splitsFocus(pool.leden, [], undefined);
    expect(focus).toHaveLength(5);
    expect(rest).toEqual([]);
  });

  it("het verschil is het gemiddelde van de focus min dat van de rest, elke organisatie even zwaar", () => {
    const groepen = maakGroepen(pool.leden, { soort: "select", veldId: "sector-subsector.sector" });
    const { focus, rest } = splitsFocus(pool.leden, groepen, groepen[0]);
    const v = vergelijk(pool.rijen, focus, rest);
    expect(v.rijen[0].focus.gemiddelde).toBe(4);
    expect(v.rijen[0].rest.gemiddelde).toBe(2);
    expect(v.rijen[0].verschil).toBe(2);
    expect(v.overall.verschil).toBe(2);
    expect(v.grootstePlus?.verschil).toBe(2);
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

describe("wanneer een kenmerk kan groeperen", () => {
  const velden = filterVelden();
  const sector = velden.find((v) => v.id === "sector-subsector.sector")!;
  const aht = velden.find((v) => v.id === "kpis.aht")!;
  const sectoren = ["Industrie", "Onderwijs", "Handel"];
  const leden = (n: number, f: (i: number) => Organisatie["kenmerken"]) =>
    bouwPool(Array.from({ length: n }, (_, i) => org(`o${i}`, 3, { kenmerken: f(i) })), assessment, 3).leden;

  it("een pool onder de minimale grootte kan niet groeperen", () => {
    const l = leden(STANDAARD_GROEPER_DREMPELS.minPool - 1, (i) => kenmerken(sectoren[i % 3], 300 + i));
    const r = kanGroeperen(sector, l, l);
    expect(r.ok).toBe(false);
    expect(r.reden).toBe("Minder dan 6 Organisaties in de pool (instelling Organisaties in de pool, minimum)");
  });

  it("een select met twee of meer waarden kan, een met één waarde na filteren niet", () => {
    const l = leden(10, (i) => kenmerken(sectoren[i % 2], 300 + i));
    expect(kanGroeperen(sector, l, l).ok).toBe(true);
    const een = l.filter((x) => kenmerkWaardeVan(x) === "Industrie");
    expect(kanGroeperen(sector, l, een).reden).toBe("Minder dan 6 Organisaties in de pool (instelling Organisaties in de pool, minimum)");
    const l2 = leden(10, (i) => kenmerken("Industrie", 300 + i));
    expect(kanGroeperen(sector, l2, l2).reden).toBe("Het filter laat één waarde over");
  });

  it("een kenmerk dat bij minder dan 40% is ingevuld kan niet", () => {
    const l = leden(10, (i) => (i < 3 ? kenmerken("Industrie", 300 + i) : kenmerken("Onderwijs")));
    const r = kanGroeperen(aht, l, l);
    expect(r.ok).toBe(false);
    expect(r.reden).toBe("Minder dan 4 ingevulde waarden (instelling Kenmerk ingevuld, minimum)");
  });

  it("een getal met verschillende waarden kan", () => {
    const l = leden(10, (i) => kenmerken("Industrie", 300 + i));
    expect(kanGroeperen(aht, l, l).ok).toBe(true);
  });

  it("een select met meer dan 12 waarden kan niet", () => {
    const l = leden(20, (i) => kenmerken(`Sector ${i}`, 300 + i));
    expect(kanGroeperen(sector, l, l).reden).toBe("Meer dan 12 waarden (instelling Waarden per kenmerk, maximum)");
  });

  it("de grenzen zijn instellingen en staan in de reden", () => {
    const l = leden(10, (i) => kenmerken(sectoren[i % 3], 300 + i));
    const strak = { minPool: 12, maxGroepen: 2, minIngevuldPct: 90 };
    expect(kanGroeperen(sector, l, l, strak).reden).toBe("Minder dan 12 Organisaties in de pool (instelling Organisaties in de pool, minimum)");
    expect(kanGroeperen(sector, l, l, { ...strak, minPool: 2 }).reden).toBe("Meer dan 2 waarden (instelling Waarden per kenmerk, maximum)");
    const gedeeltelijk = leden(10, (i) => (i < 5 ? kenmerken("Industrie", 300 + i) : kenmerken("Onderwijs")));
    expect(kanGroeperen(aht, gedeeltelijk, gedeeltelijk, { ...strak, minPool: 2 }).reden).toBe("Minder dan 9 ingevulde waarden (instelling Kenmerk ingevuld, minimum)");
  });
});

describe("kanalen, nul procent en het besluit over de groepering", () => {
  const velden = filterVelden();
  const aht = velden.find((v) => v.id === "kpis.aht")!;
  const sector = velden.find((v) => v.id === "sector-subsector.sector")!;
  const leden = (n: number, f: (i: number) => Organisatie["kenmerken"]) =>
    bouwPool(Array.from({ length: n }, (_, i) => org(`o${i}`, 3, { kenmerken: f(i) })), assessment, 3).leden;

  it("ingezette kanalen kan nooit groeperen", () => {
    const l = leden(10, (i) => kenmerken("Industrie", 300 + i));
    expect(kanGroeperen(kanalenVeld(), l, l)).toEqual({ ok: false, reden: KANALEN_REDEN });
  });

  it("bij 0% geldt geen ondergrens voor hoe vaak een kenmerk is ingevuld", () => {
    const l = leden(10, (i) => (i === 0 ? kenmerken("Industrie", 300) : kenmerken("Onderwijs", i === 1 ? 500 : undefined)));
    const drempels = { minPool: 6, maxGroepen: 12, minIngevuldPct: 40 };
    expect(kanGroeperen(aht, l, l, drempels).ok).toBe(false);
    expect(kanGroeperen(aht, l, l, { ...drempels, minIngevuldPct: 0 }).ok).toBe(true);
  });

  const opties = (...tekens: [string, boolean][]) =>
    tekens.map(([id, ok]) => ({ id, naam: id.toUpperCase(), bruikbaarheid: ok ? { ok } : { ok, reden: `${id} kan niet` } }));
  const basis = { poolGrootte: 10, poolTotaal: 10, minPool: 6 };

  it("het eerste bruikbare kenmerk wordt de groepering, zonder melding", () => {
    expect(besluitGroepering({ ...basis, vorige: null, kenmerken: opties(["a", false], ["b", true]) })).toEqual({ gekozen: "b", melding: null });
    expect(besluitGroepering({ ...basis, vorige: null, kenmerken: opties(["a", false]) })).toEqual({ gekozen: null, melding: null });
  });

  it("een gekozen kenmerk dat kan, blijft staan", () => {
    expect(besluitGroepering({ ...basis, vorige: "b", kenmerken: opties(["a", true], ["b", true]) })).toEqual({ gekozen: "b", melding: null });
  });

  it("terugval naar de eerste pil die kan, met de reden en de naam", () => {
    const r = besluitGroepering({ ...basis, vorige: "b", kenmerken: opties(["b", false], ["c", true]) });
    expect(r).toEqual({ gekozen: "c", melding: "b kan niet. De groepering staat nu op C." });
  });

  it("een verwijderd kenmerk noemt zijn naam, en zonder alternatief staat er een melding", () => {
    const r = besluitGroepering({ ...basis, vorige: "b", vorigeNaam: "CRM", kenmerken: opties(["a", true]) });
    expect(r.melding).toBe("CRM is verwijderd. De groepering staat nu op A.");
    expect(besluitGroepering({ ...basis, vorige: "b", vorigeNaam: "CRM", kenmerken: [] })).toEqual({
      gekozen: null,
      melding: "Er is geen kenmerk meer om op te groeperen.",
    });
  });

  it("een pool die door de filters te klein werd, krijgt de melding met het aantal", () => {
    const r = besluitGroepering({ vorige: "a", kenmerken: opties(["a", false]), poolGrootte: 1, poolTotaal: 10, minPool: 6 });
    expect(r.melding).toBe("Met deze filters zit er 1 Organisatie in de pool. Dat is te weinig om te vergelijken. Haal een filter weg.");
  });

  it("herstel: Zonder gekozen pil wordt een kenmerk dat weer kan vanzelf gekozen, zonder melding", () => {
    expect(besluitGroepering({ ...basis, vorige: null, kenmerken: opties(["a", true]) })).toEqual({ gekozen: "a", melding: null });
  });

  it("getallen met punten en komma", () => {
    expect(formatGetal(3932600)).toBe("3.932.600");
    expect(formatGetal(420)).toBe("420");
    expect(formatGetal(4.5)).toBe("4,5");
    expect(formatGetal(1234.567, 1)).toBe("1.234,6");
    expect(formatGetal(-1500)).toBe("−1.500");
  });

  it("de stap van de slider geeft ongeveer 100 standen", () => {
    expect(drempelStap(0, 5_000_000)).toBe(50_000);
    expect(drempelStap(100, 900)).toBe(10);
    expect(drempelStap(0, 60)).toBe(1);
    expect(drempelStap(0, 1000)).toBe(10);
    expect(drempelStap(0, 120)).toBe(2);
    expect(drempelStap(0, 5, false)).toBe(0.05);
  });

  it("de eenheid Onderdelen: Per onderdeel de meest recente Meting, met de naam van organisatie en onderdeel", () => {
    const meting = (id: string, onderdeel: string, datum: string) =>
      ({
        id, organisatieId: "x", assessmentId: assessment.id, label: id, onderdeel, meetdatum: datum, aangemaaktOp: datum,
        invullingen: org("tmp", 3).scanUitvoeringen[0].invullingen,
      }) as unknown as Organisatie["scanUitvoeringen"][number];
    const meerdere = org("m", 3);
    meerdere.naam = "Univé";
    meerdere.scanUitvoeringen = [
      meting("a1", "Particulier", "2026-01-10"),
      meting("a2", "Particulier", "2026-06-10"),
      meting("b1", "Zakelijk", "2026-03-10"),
      meting("c1", "Hele organisatie", "2026-02-10"),
    ];
    // De oude tekst op de Meting wordt bij het laden een Onderdeel met een `onderdeelId`.
    zorgOnderdelenKloppend(meerdere);
    const enkel = org("e", 3);
    const pool = bouwPool([meerdere, enkel], assessment, 3, "onderdelen");
    expect(pool.leden.map((l) => l.naam).sort()).toEqual(["Org e", "Univé", "Univé, Particulier", "Univé, Zakelijk"].sort());
    const particulier = pool.leden.find((l) => l.onderdeel === "Particulier")!;
    expect(particulier.meting.id).toBe("a2");
    expect(new Set(pool.leden.map((l) => l.id)).size).toBe(pool.leden.length);
    // Organisatie als kenmerk: Alleen organisaties met meer dan één onderdeel.
    const orgVeld = onderdeelVelden()[0];
    expect(selectOpties(pool.leden, orgVeld).map((o) => [o.waarde, o.aantal])).toEqual([[meerdere.id, 3]]);
    // Onderdeel kan alleen groeperen binnen één organisatie.
    const onderdeelVeld = onderdeelVelden()[1];
    const drempels = { minPool: 2, maxGroepen: 12, minIngevuldPct: 0 };
    expect(kanGroeperen(onderdeelVeld, pool.leden, pool.leden, drempels, "onderdelen").reden).toContain("Filter eerst op één Organisatie");
    const alleen = pool.leden.filter((l) => l.organisatie.id === meerdere.id);
    expect(kanGroeperen(onderdeelVeld, alleen, alleen, drempels, "onderdelen").ok).toBe(true);
  });

  describe("de Meetperiode", () => {
    const scans = org("tmp", 3).scanUitvoeringen[0].invullingen;
    const meting = (id: string, onderdeel: string, datum: string | undefined, samenstelling?: string[]) =>
      ({ id, organisatieId: "x", assessmentId: assessment.id, label: id, onderdeel, meetdatum: datum, aangemaaktOp: "2026-01-01", invullingen: scans, ...(samenstelling ? { samenstelling } : {}) }) as unknown as Organisatie["scanUitvoeringen"][number];
    const mijnOrg = (naam: string, metingen: Organisatie["scanUitvoeringen"]) => {
      const o = org(naam, 3);
      o.naam = naam;
      o.scanUitvoeringen = metingen;
      zorgOnderdelenKloppend(o);
      return o;
    };

    it("zonder periode telt de meest recente Meting, met periode de laatste binnen de periode", () => {
      const a = mijnOrg("A", [meting("a1", "Hele organisatie", "2026-01-20"), meting("a2", "Hele organisatie", "2026-10-05")]);
      expect(bouwPool([a], assessment, 3, "organisaties").leden[0].meting.id).toBe("a2");
      const ronde1 = bouwPool([a], assessment, 3, "organisaties", { van: "2026-01-12", totEnMet: "2026-02-10" });
      expect(ronde1.leden[0].meting.id).toBe("a1");
      expect(ronde1.buitenPeriode).toBe(0);
    });

    it("begin- en einddatum zijn beide inclusief", () => {
      const a = mijnOrg("A", [meting("a1", "Hele organisatie", "2026-01-12")]);
      expect(bouwPool([a], assessment, 3, "organisaties", { van: "2026-01-12", totEnMet: "2026-01-12" }).leden).toHaveLength(1);
    });

    it("een Organisatie zonder Meting in de periode doet niet mee en telt als buiten de periode", () => {
      const a = mijnOrg("A", [meting("a1", "Hele organisatie", "2026-01-20")]);
      const b = mijnOrg("B", [meting("b1", "Hele organisatie", "2026-10-05"), meting("b0", "Hele organisatie", undefined)]);
      const pool = bouwPool([a, b], assessment, 3, "organisaties", { van: "2026-01-12", totEnMet: "2026-02-10" });
      expect(pool.leden.map((l) => l.naam)).toEqual(["A"]);
      expect(pool.buitenPeriode).toBe(1);
    });

    it("een samengestelde Meting mag bij Organisaties meedoen, bij Onderdelen nooit", () => {
      const o = mijnOrg("A", [
        meting("a1", "Team A", "2026-01-20"),
        meting("a2", "Team B", "2026-02-01"),
        meting("a3", "Hele organisatie", "2026-10-05", ["a1", "a2"]),
      ]);
      expect(bouwPool([o], assessment, 3, "organisaties").leden[0].meting.id).toBe("a3");
      const onderdelen = bouwPool([o], assessment, 3, "onderdelen");
      expect(onderdelen.leden.map((l) => l.meting.id).sort()).toEqual(["a1", "a2"]);
    });

    it("bij Onderdelen telt per onderdeel de laatste Meting in de periode, en valt een onderdeel erbuiten af", () => {
      const o = mijnOrg("A", [
        meting("a1", "Team A", "2026-01-20"),
        meting("a2", "Team A", "2026-10-05"),
        meting("b1", "Team B", "2026-10-06"),
      ]);
      const pool = bouwPool([o], assessment, 3, "onderdelen", { van: "2026-01-01", totEnMet: "2026-02-28" });
      expect(pool.leden.map((l) => l.meting.id)).toEqual(["a1"]);
      expect(pool.buitenPeriode).toBe(1);
    });

    it("een onbruikbare periode telt als geen periode", () => {
      expect(geldigeMeetperiode({ van: "2026-02-01", totEnMet: "2026-01-01" })).toBe(false);
      expect(geldigeMeetperiode({ van: "2026-01-01" })).toBe(false);
      expect(meetperiodeTekst({ van: "2026-01-12", totEnMet: "2026-02-10" })).toBe("12-01-2026 tot en met 10-02-2026");
    });
  });

  it("de sector blijft een select", () => {
    expect(sector.type).toBe("select");
  });
});

function kenmerkWaardeVan(l: { organisatie: Organisatie }): unknown {
  return (l.organisatie.kenmerken["sector-subsector"] as { sector: string }).sector;
}

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
