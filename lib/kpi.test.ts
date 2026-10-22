import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  KPI_CONTACTEN,
  STANDAARD_KANALEN,
  STANDAARD_KPIS,
  aantalWaardenOpNiveau,
  gevolgenKanaalVerwijderen,
  kanaalIngezet,
  kanalenMetWaarde,
  kpiExportRegels,
  kpiIngevuldTelling,
  kpiMagOpPlek,
  kpiWaardeVan,
  leesKpiExport,
  migreerKpiWaarden,
  parseKpiGetal,
  pasKpiExportToe,
  pasKpiWijzigingenToe,
  toonKpiGetal,
} from "./kpi";
import { getInstellingen } from "./instellingen-store";
import { zorgVoorOnderdeel } from "./onderdelen";
import type { Organisatie } from "./types";

const org = (extra: Partial<Organisatie> = {}): Organisatie =>
  ({
    id: "O", naam: "Org", kenmerken: {}, leden: [], scanUitvoeringen: [], aangemaaktDoor: null, toegewezenAan: [],
    benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
  }) as Organisatie;

describe("de overgang van de oude velden naar KPI-waarden", () => {
  it("de vijf KPI-velden worden waarden bij Algemeen en staan daarna niet meer in de kenmerken", () => {
    const o = org({ kenmerken: { kpis: { aht: 285, nps: 32 }, sector: "x" } });
    migreerKpiWaarden(o);
    expect(kpiWaardeVan(o, "aht", { onderdeelId: null, kanaalId: null })).toBe(285);
    expect(kpiWaardeVan(o, "nps", { onderdeelId: null, kanaalId: null })).toBe(32);
    expect(o.kenmerken["kpis"]).toBeUndefined();
    expect(o.kenmerken["sector"]).toBe("x");
  });

  it("de contacten per kanaal worden waarden van de KPI Contacten per jaar, en wat geen getal is wordt 0", () => {
    const o = org({
      kenmerken: { "volume-klantbasis": { "contacten-per-jaar": { "kanaal-call": 620000, "kanaal-chatbot": "niet van toepassing", "kanaal-e-mail": "" }, "adoptie-mijnomgeving": 62 } },
    });
    migreerKpiWaarden(o);
    expect(kpiWaardeVan(o, KPI_CONTACTEN, { onderdeelId: null, kanaalId: "kanaal-call" })).toBe(620000);
    expect(kpiWaardeVan(o, KPI_CONTACTEN, { onderdeelId: null, kanaalId: "kanaal-chatbot" })).toBe(0);
    // Een leeg veld is geen waarde.
    expect(kpiWaardeVan(o, KPI_CONTACTEN, { onderdeelId: null, kanaalId: "kanaal-e-mail" })).toBeNull();
    expect((o.kenmerken["volume-klantbasis"] as Record<string, unknown>)["contacten-per-jaar"]).toBeUndefined();
    expect((o.kenmerken["volume-klantbasis"] as Record<string, unknown>)["adoptie-mijnomgeving"]).toBe(62);
  });

  it("is idempotent en overschrijft een waarde die er al is niet", () => {
    const o = org({ kenmerken: { kpis: { aht: 285 } }, kpiWaarden: [{ organisatieId: "O", onderdeelId: null, kanaalId: null, kpiId: "aht", waarde: 300 }] });
    migreerKpiWaarden(o);
    migreerKpiWaarden(o);
    expect(o.kpiWaarden).toHaveLength(1);
    expect(o.kpiWaarden![0].waarde).toBe(300);
  });
});

describe("waarden per plek", () => {
  it("Algemeen is een gewone waarde: De app rekent hem niet uit de onderdelen en overschrijft hem niet", () => {
    const o = org();
    pasKpiWijzigingenToe(o, [
      { kpiId: "aht", onderdeelId: null, kanaalId: null, waarde: 300 },
      { kpiId: "aht", onderdeelId: "a", kanaalId: null, waarde: 200 },
      { kpiId: "aht", onderdeelId: "b", kanaalId: null, waarde: 400 },
    ]);
    expect(kpiWaardeVan(o, "aht", { onderdeelId: null, kanaalId: null })).toBe(300);
  });

  it("een waarde is uniek per combinatie, 0 is geldig en een lege cel wist het record", () => {
    const o = org();
    const t1 = pasKpiWijzigingenToe(o, [{ kpiId: "aht", onderdeelId: null, kanaalId: null, waarde: 0 }]);
    expect(t1).toEqual({ ingevuld: 1, gewijzigd: 0, gewist: 0 });
    expect(kpiWaardeVan(o, "aht", { onderdeelId: null, kanaalId: null })).toBe(0);
    const t2 = pasKpiWijzigingenToe(o, [{ kpiId: "aht", onderdeelId: null, kanaalId: null, waarde: 5 }]);
    expect(t2).toEqual({ ingevuld: 0, gewijzigd: 1, gewist: 0 });
    expect(o.kpiWaarden).toHaveLength(1);
    const t3 = pasKpiWijzigingenToe(o, [{ kpiId: "aht", onderdeelId: null, kanaalId: null, waarde: null }]);
    expect(t3).toEqual({ ingevuld: 0, gewijzigd: 0, gewist: 1 });
    expect(o.kpiWaarden).toHaveLength(0);
  });

  it("een KPI mag alleen op de plekken die de definitie toestaat, Algemeen altijd", () => {
    // NPS is per kanaal in de startset (`datamodel.md`, KPI's en kanalen): Het kanaal waar het contact plaatsvond, bepaalt de uitvraag.
    const nps = STANDAARD_KPIS.find((k) => k.id === "nps")!;
    expect(kpiMagOpPlek(nps, { onderdeelId: null, kanaalId: "kanaal-call" })).toBe(true);
    const zonderKanaal = { ...nps, perKanaal: false };
    expect(kpiMagOpPlek(zonderKanaal, { onderdeelId: null, kanaalId: null })).toBe(true);
    expect(kpiMagOpPlek(zonderKanaal, { onderdeelId: "a", kanaalId: null })).toBe(true);
    expect(kpiMagOpPlek(zonderKanaal, { onderdeelId: null, kanaalId: "kanaal-call" })).toBe(false);
  });

  it("getallen kennen een komma en een punt, en een tekst die geen getal is geeft NaN", () => {
    expect(parseKpiGetal("1,5")).toBe(1.5);
    expect(parseKpiGetal(" 2.25 ")).toBe(2.25);
    expect(parseKpiGetal("")).toBeNull();
    expect(parseKpiGetal("abc")).toBeNaN();
    expect(toonKpiGetal(1.5)).toBe("1,5");
    expect(toonKpiGetal(null)).toBe("");
  });

  it("de kolomkop telt hoeveel KPI's bij Algemeen zijn ingevuld van wat er op die plek mag", () => {
    const o = org();
    pasKpiWijzigingenToe(o, [
      { kpiId: "aht", onderdeelId: null, kanaalId: null, waarde: 300 },
      { kpiId: "aht", onderdeelId: null, kanaalId: "kanaal-call", waarde: 280 },
      { kpiId: "nps", onderdeelId: "a", kanaalId: null, waarde: 30 },
    ]);
    expect(kpiIngevuldTelling(o, STANDAARD_KPIS, null)).toEqual({ n: 1, m: STANDAARD_KPIS.length });
    expect(kpiIngevuldTelling(o, STANDAARD_KPIS, "a")).toEqual({ n: 1, m: STANDAARD_KPIS.length });
  });

  it("de kanalen met een waarde komen in de volgorde van de lijst", () => {
    const o = org();
    pasKpiWijzigingenToe(o, [
      { kpiId: KPI_CONTACTEN, onderdeelId: null, kanaalId: "kanaal-chatbot", waarde: 1 },
      { kpiId: KPI_CONTACTEN, onderdeelId: null, kanaalId: "kanaal-call", waarde: 1 },
      { kpiId: KPI_CONTACTEN, onderdeelId: "a", kanaalId: "kanaal-email", waarde: 1 },
    ]);
    expect(kanalenMetWaarde(o, STANDAARD_KANALEN, null).map((k) => k.naam)).toEqual(["Call", "Chatbot"]);
  });

  it("een kanaal is ingezet boven 0, niet bij 0 en onbekend bij een leeg veld", () => {
    const o = org();
    pasKpiWijzigingenToe(o, [
      { kpiId: KPI_CONTACTEN, onderdeelId: null, kanaalId: "kanaal-call", waarde: 100 },
      { kpiId: KPI_CONTACTEN, onderdeelId: null, kanaalId: "kanaal-chatbot", waarde: 0 },
    ]);
    expect(kanaalIngezet(o, "kanaal-call", null)).toBe(true);
    expect(kanaalIngezet(o, "kanaal-chatbot", null)).toBe(false);
    expect(kanaalIngezet(o, "kanaal-livechat", null)).toBeNull();
    // Bij een onderdeel telt alleen de waarde van dat onderdeel: Er is geen terugval op Algemeen.
    expect(kanaalIngezet(o, "kanaal-call", "a")).toBeNull();
  });

  it("telt waarden op een niveau en de gevolgen van een kanaal verwijderen", () => {
    const a = org();
    pasKpiWijzigingenToe(a, [
      { kpiId: "aht", onderdeelId: "x", kanaalId: null, waarde: 1 },
      { kpiId: "aht", onderdeelId: null, kanaalId: "kanaal-call", waarde: 1 },
      { kpiId: "aht", onderdeelId: null, kanaalId: "kanaal-call", waarde: 1 },
    ]);
    const b = org({ id: "P" });
    pasKpiWijzigingenToe(b, [{ kpiId: "aht", onderdeelId: null, kanaalId: "kanaal-call", waarde: 5 }]);
    expect(aantalWaardenOpNiveau([a, b], "aht", "onderdeel")).toBe(1);
    expect(aantalWaardenOpNiveau([a, b], "aht", "kanaal")).toBe(2);
    expect(gevolgenKanaalVerwijderen([a, b], "kanaal-call")).toEqual({ waarden: 2, organisaties: 2 });
  });
});

describe("export en import van KPI's", () => {
  it("de regels van een Organisatie lezen terug in een nieuwe, met onderdelen op naam en een onbekend Onderdeel dat ontstaat", () => {
    const bron = org({ onderdelen: [{ id: "od1", organisatieId: "O", naam: "Team A", aangemaaktOp: "x" }] });
    pasKpiWijzigingenToe(bron, [
      { kpiId: "aht", onderdeelId: null, kanaalId: null, waarde: 300 },
      { kpiId: "aht", onderdeelId: "od1", kanaalId: "kanaal-call", waarde: 280 },
    ]);
    const regels = kpiExportRegels(bron, STANDAARD_KPIS, STANDAARD_KANALEN);
    expect(regels).toEqual([
      { onderdeel: "", kanaal: "", kpi: "aht", kpiNaam: "AHT", waarde: 300 },
      { onderdeel: "Team A", kanaal: "Call", kpi: "aht", kpiNaam: "AHT", waarde: 280 },
    ]);
    const gelezen = leesKpiExport(JSON.stringify(regels))!;
    const nieuw = org({ id: "N" });
    const overgeslagen = pasKpiExportToe(nieuw, gelezen, STANDAARD_KPIS, STANDAARD_KANALEN, (naam) => zorgVoorOnderdeel(nieuw, naam)?.id ?? null);
    expect(overgeslagen).toBe(0);
    expect(nieuw.onderdelen?.map((o) => o.naam)).toEqual(["Team A"]);
    expect(kpiWaardeVan(nieuw, "aht", { onderdeelId: null, kanaalId: null })).toBe(300);
    expect(kpiWaardeVan(nieuw, "aht", { onderdeelId: nieuw.onderdelen![0].id, kanaalId: "kanaal-call" })).toBe(280);
  });

  it("een regel met een onbekende KPI of een onbekend kanaal wordt overgeslagen, een KPI wordt ook op naam gevonden", () => {
    const nieuw = org({ id: "N" });
    const regels = [
      { onderdeel: "", kanaal: "", kpi: "bestaat-niet", waarde: 1 },
      { onderdeel: "", kanaal: "Fax", kpi: "aht", waarde: 2 },
      { onderdeel: "", kanaal: "call", kpi: "x", kpiNaam: "aht", waarde: 3 },
    ];
    const n = pasKpiExportToe(nieuw, regels, STANDAARD_KPIS, STANDAARD_KANALEN, () => null);
    expect(n).toBe(2);
    expect(kpiWaardeVan(nieuw, "aht", { onderdeelId: null, kanaalId: "kanaal-call" })).toBe(3);
  });

  it("een kolom die geen geldige lijst is, geeft null en een regel zonder getal valt weg", () => {
    expect(leesKpiExport("{kapot")).toBeNull();
    expect(leesKpiExport('{"a":1}')).toBeNull();
    expect(leesKpiExport('[{"kpi":"aht","waarde":"x"},{"kpi":"aht","waarde":5}]')).toHaveLength(1);
  });
});

describe("opslag van waarden en definities", () => {
  const opslag = new Map<string, string>();
  type Db = typeof import("./db");
  let db: Db;
  let beheer: typeof import("./kpi-beheer");
  beforeAll(async () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => opslag.get(k) ?? null,
        setItem: (k: string, v: string) => void opslag.set(k, v),
        removeItem: (k: string) => void opslag.delete(k),
      },
      sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    });
    vi.stubGlobal("fetch", async () => ({ status: 204, text: async () => "" }));
    db = await import("./db");
    beheer = await import("./kpi-beheer");
  });
  beforeEach(() => opslag.clear());
  const zet = (o: Organisatie) => opslag.set("coniche-scan:organisaties", JSON.stringify([o]));
  const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; groepId: string | null; details: Record<string, unknown> | null }[]);

  it("bewaren logt één gebeurtenis per plek met één groep, en weigert wat de KPI niet toestaat", () => {
    zet(org({ onderdelen: [{ id: "od1", organisatieId: "O", naam: "Team A", aangemaaktOp: "x" }] }));
    // Een Admin heeft NPS niet per kanaal gezet: Dan weigert het bewaren een kanaalwaarde.
    opslag.set("coniche-scan:instellingen", JSON.stringify({ kpiDefinities: STANDAARD_KPIS.map((k) => (k.id === "nps" ? { ...k, perKanaal: false } : k)) }));
    const r = db.bewaarKpiWaarden("O", [
      { kpiId: "aht", onderdeelId: null, kanaalId: null, waarde: 300 },
      { kpiId: "aht", onderdeelId: "od1", kanaalId: "kanaal-call", waarde: 280 },
      // Hier mag NPS niet per kanaal, een onbekend onderdeel bestaat niet.
      { kpiId: "nps", onderdeelId: null, kanaalId: "kanaal-call", waarde: 30 },
      { kpiId: "aht", onderdeelId: "bestaat-niet", kanaalId: null, waarde: 1 },
    ]);
    expect(r).toEqual({ ok: true, gewijzigd: 2 });
    const events = audit().filter((e) => e.actie === "kpi.waardenGewijzigd");
    expect(events).toHaveLength(2);
    expect(new Set(events.map((e) => e.groepId)).size).toBe(1);
    expect(events.map((e) => e.details?.plek).sort()).toEqual(["Algemeen", "Team A"]);
    expect(events[0].details).toMatchObject({ aantalIngevuld: 1, aantalGewijzigd: 0, aantalGewist: 0 });
    expect(JSON.stringify(events)).not.toContain("300");
  });

  it("een vlag kan niet uit zolang er waarden op dat niveau staan, en een kanaal verwijderen neemt de waarden mee", () => {
    zet(org());
    db.bewaarKpiWaarden("O", [{ kpiId: "aht", onderdeelId: null, kanaalId: "kanaal-call", waarde: 280 }]);
    const geweigerd = beheer.wijzigKpis({ aht: { naam: "AHT", eenheid: "s", perOnderdeel: true, perKanaal: false } });
    expect(geweigerd.ok).toBe(false);
    expect(beheer.gevolgenKanaal("kanaal-call")).toEqual({ waarden: 1, organisaties: 1 });
    expect(beheer.verwijderKanaal("kanaal-call")).toMatchObject({ ok: true, waarden: 1 });
    expect(db.laadAlles()[0].kpiWaarden).toHaveLength(0);
    expect(audit().find((e) => e.actie === "kanaal.verwijderd")?.details).toMatchObject({ kanaalNaam: "Call", aantalKpiWaarden: 1 });
  });

  it("een KPI of kanaal met een bestaande naam (hoofdletterongevoelig) kan niet", () => {
    expect(beheer.maakKpi("aht").ok).toBe(false);
    expect(beheer.maakKanaal("CALL").ok).toBe(false);
    const nieuw = beheer.maakKanaal("Social");
    expect(nieuw.ok).toBe(true);
    const kpi = beheer.maakKpi("Eerste reactietijd");
    expect(kpi.ok && kpi.kpi.id).toBe("eerste-reactietijd");
    expect(audit().map((e) => e.actie)).toEqual(expect.arrayContaining(["kanaal.aangemaakt", "kpiDefinitie.aangemaakt"]));
  });

  it("een KPI verwijderen neemt zijn waarden en korte naam mee, en de volgorde en een kanaalnaam zijn te wijzigen", () => {
    zet(org());
    db.bewaarKpiWaarden("O", [
      { kpiId: "aht", onderdeelId: null, kanaalId: null, waarde: 300 },
      { kpiId: "nps", onderdeelId: null, kanaalId: null, waarde: 40 },
    ]);
    expect(beheer.gevolgenKpi("aht")).toEqual({ waarden: 1, organisaties: 1 });
    expect(beheer.verwijderKpi("aht")).toMatchObject({ ok: true, waarden: 1 });
    expect(db.laadAlles()[0].kpiWaarden?.map((w) => w.kpiId)).toEqual(["nps"]);
    expect(getInstellingen().kpiDefinities.some((k) => k.id === "aht")).toBe(false);
    expect(audit().find((e) => e.actie === "kpiDefinitie.verwijderd")?.details).toMatchObject({ aantalKpiWaarden: 1 });

    const eerste = [...getInstellingen().kpiDefinities].sort((a, b) => a.volgorde - b.volgorde)[0].id;
    expect(beheer.verplaatsKpi(eerste, -1)).toBe(false);
    expect(beheer.verplaatsKpi(eerste, 1)).toBe(true);
    const nu = [...getInstellingen().kpiDefinities].sort((a, b) => a.volgorde - b.volgorde);
    expect(nu[1].id).toBe(eerste);
    expect(nu.map((k) => k.volgorde)).toEqual(nu.map((_, i) => i + 1));

    expect(beheer.hernoemKanaal("kanaal-call", "Telefoon")).toMatchObject({ ok: true, gewijzigd: true });
    expect(beheer.hernoemKanaal("kanaal-call", "e-mail").ok).toBe(false);
    expect(beheer.hernoemKanaal("kanaal-call", " ").ok).toBe(false);
    expect(getInstellingen().kanalen.find((k) => k.id === "kanaal-call")?.naam).toBe("Telefoon");
    expect(beheer.verplaatsKanaal("kanaal-call", 1)).toBe(true);
    expect(audit().map((e) => e.actie)).toEqual(expect.arrayContaining(["kanaal.hernoemd", "kanaal.volgordeGewijzigd", "kpiDefinitie.volgordeGewijzigd"]));
  });
});
