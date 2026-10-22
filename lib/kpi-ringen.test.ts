import { describe, expect, it } from "vitest";
import { STANDAARD_KPIS, vulSchaalAan } from "./kpi";
import { bouwKpiRing, kopTekstKpis, kpiRingInvoer, kpiRingInvoerVoorLead, kpiRingTekst } from "./kpi-ringen";
import type { KpiDefinitie, KpiWaarde } from "./types";

const w = (kpiId: string, waarde: number, kanaalId: string | null = null, onderdeelId: string | null = null): KpiWaarde => ({ organisatieId: "O", kpiId, onderdeelId, kanaalId, waarde });
const org = (kpiWaarden: KpiWaarde[]) => ({ kpiWaarden });
const nps = STANDAARD_KPIS.find((k) => k.id === "nps")!;

describe("de tekst in de ring", () => {
  it("zet de eenheid erbij en een plusteken bij een positieve NPS", () => {
    expect(kpiRingTekst(440, { id: "aht", eenheid: "s" })).toBe("440 s");
    expect(kpiRingTekst(92, { id: "sla", eenheid: "%" })).toBe("92%");
    expect(kpiRingTekst(34, { id: "nps", eenheid: null })).toBe("+34");
    expect(kpiRingTekst(-12, { id: "nps", eenheid: null })).toBe("-12");
    expect(kpiRingTekst(8.5, { id: "csat", eenheid: null })).toBe("8,5");
    expect(kpiRingTekst(1200000, { id: "contacten", eenheid: "aantal" })).toBe("1.200.000");
  });
});

describe("welke KPI's een ring zijn", () => {
  it("zijn de KPI's met een schaal, in de volgorde van de definities, zonder Contacten per jaar", () => {
    const invoer = kpiRingInvoer(org([]), STANDAARD_KPIS, { onderdeelId: null, metKanalen: false });
    expect(invoer.map((k) => k.id)).toEqual(["aht", "nps", "csat", "sla", "ftr", "ces"]);
  });
  it("geeft een opgeslagen definitie zonder schaal de startwaarden, en een eigen KPI geen ring", () => {
    const oud = [{ id: "aht", naam: "AHT", eenheid: "s", perOnderdeel: true, perKanaal: true, volgorde: 1 }, { id: "eigen", naam: "Eigen", eenheid: null, perOnderdeel: false, perKanaal: false, volgorde: 2 }] as unknown as KpiDefinitie[];
    const nieuw = vulSchaalAan(oud);
    expect(nieuw[0]).toMatchObject({ schaalMin: 0, schaalMax: 600 });
    expect(nieuw[1]).toMatchObject({ schaalMin: null, schaalMax: null });
  });
  it("houdt een schaal die een Admin leeg liet leeg", () => {
    const gewist = { ...nps, schaalMin: null, schaalMax: null };
    expect(vulSchaalAan([gewist])[0]).toMatchObject({ schaalMin: null, schaalMax: null });
  });
});

describe("een ring zonder gekozen kanaal", () => {
  const invoer = (waarden: KpiWaarde[], onderdeelId: string | null = null) => kpiRingInvoer(org(waarden), STANDAARD_KPIS, { onderdeelId, metKanalen: true });
  it("toont Algemeen, gevuld volgens de schaal, zonder stip", () => {
    const ring = bouwKpiRing(invoer([w("nps", 50)]).find((k) => k.id === "nps")!, null);
    expect(ring).toMatchObject({ toestand: "algemeen", tekst: "+50", fractie: 0.75, stip: null, regel: "" });
  });
  it("begrenst de vulling tot 0 en 1", () => {
    expect(bouwKpiRing(invoer([w("nps", 500)]).find((k) => k.id === "nps")!, null).fractie).toBe(1);
    expect(bouwKpiRing(invoer([w("nps", -500)]).find((k) => k.id === "nps")!, null).fractie).toBe(0);
  });
  it("is uitgegrijsd met Niet ingevuld zonder waarde", () => {
    expect(bouwKpiRing(invoer([]).find((k) => k.id === "csat")!, null)).toMatchObject({ toestand: "leeg", regel: "Niet ingevuld", ariaLabel: "CSAT niet ingevuld" });
  });
});

describe("de drie toestanden bij een gekozen kanaal", () => {
  const inv = (waarden: KpiWaarde[], kpi = "nps") => kpiRingInvoer(org(waarden), STANDAARD_KPIS, { onderdeelId: null, metKanalen: true }).find((k) => k.id === kpi)!;
  it("1: De waarde bij het kanaal, met een stip op Algemeen en de regel Algemeen", () => {
    const ring = bouwKpiRing(inv([w("nps", 34), w("nps", 41, "kanaal-call")]), "kanaal-call");
    expect(ring).toMatchObject({ toestand: "kanaal", tekst: "+41", regel: "Algemeen +34", kanaalId: "kanaal-call", ariaLabel: "NPS +41, Algemeen +34" });
    expect(ring.stip).toBeCloseTo(0.67, 2);
  });
  it("1: Zonder Algemeen geen stip en een lege regel", () => {
    expect(bouwKpiRing(inv([w("nps", 41, "kanaal-call")]), "kanaal-call")).toMatchObject({ toestand: "kanaal", stip: null, regel: "" });
  });
  it("2: Alleen Algemeen bekend, bij een KPI zonder waarde bij dit kanaal en bij een KPI zonder perKanaal", () => {
    expect(bouwKpiRing(inv([w("nps", 34)]), "kanaal-call")).toMatchObject({ toestand: "algemeen", tekst: "+34", stip: null, regel: "" });
    const zonderKanaal = kpiRingInvoer(org([w("nps", 34), w("nps", 41, "kanaal-call")]), STANDAARD_KPIS.map((k) => (k.id === "nps" ? { ...k, perKanaal: false } : k)), { onderdeelId: null, metKanalen: true }).find((k) => k.id === "nps")!;
    expect(bouwKpiRing(zonderKanaal, "kanaal-call")).toMatchObject({ toestand: "algemeen", tekst: "+34" });
  });
  it("3: Geen van beide bekend: uitgegrijsd, de ring blijft staan", () => {
    expect(bouwKpiRing(inv([w("nps", 20, "kanaal-chatbot")]), "kanaal-call")).toMatchObject({ toestand: "leeg", regel: "Niet ingevuld" });
  });
});

describe("een gekozen Onderdeel", () => {
  it("toont de waarden van dat Onderdeel en zet een KPI die niet per Onderdeel mag op n.v.t.", () => {
    const defs = STANDAARD_KPIS.map((k) => (k.id === "sla" ? { ...k, perOnderdeel: false } : k));
    const invoer = kpiRingInvoer(org([w("aht", 300), w("aht", 280, null, "od1")]), defs, { onderdeelId: "od1", metKanalen: false });
    expect(bouwKpiRing(invoer.find((k) => k.id === "aht")!, null, { onderdeelGekozen: true })).toMatchObject({ toestand: "algemeen", tekst: "280 s" });
    expect(bouwKpiRing(invoer.find((k) => k.id === "sla")!, null, { onderdeelGekozen: true })).toMatchObject({ toestand: "nvt", regel: "n.v.t.", ariaLabel: "SLA niet van toepassing" });
  });
});

describe("wat de Lead ziet", () => {
  it("laat een KPI zonder enige waarde weg en houdt een KPI met alleen een kanaalwaarde", () => {
    const invoer = kpiRingInvoer(org([w("aht", 300), w("nps", 30, "kanaal-call")]), STANDAARD_KPIS, { onderdeelId: null, metKanalen: true });
    expect(kpiRingInvoerVoorLead(invoer).map((k) => k.id)).toEqual(["aht", "nps"]);
    expect(kpiRingInvoerVoorLead(kpiRingInvoer(org([]), STANDAARD_KPIS, { onderdeelId: null, metKanalen: true }))).toEqual([]);
  });
  it("geeft zonder de kanalen geen kanaalwaarden mee", () => {
    const invoer = kpiRingInvoer(org([w("nps", 30, "kanaal-call")]), STANDAARD_KPIS, { onderdeelId: null, metKanalen: false });
    expect(invoer.find((k) => k.id === "nps")!.kanalen).toEqual({});
    expect(kpiRingInvoerVoorLead(invoer)).toEqual([]);
  });
});

describe("de kop", () => {
  it("zet de gekozen delen achter KPI's en laat een deel dat niet gekozen is vallen", () => {
    expect(kopTekstKpis([])).toBe("KPI's");
    expect(kopTekstKpis([null, "Call"])).toBe("KPI's · Call");
    expect(kopTekstKpis(["Team A", "Call"])).toBe("KPI's · Team A · Call");
  });
});
