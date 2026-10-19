import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { zorgscan } from "@/data/zorgscan-assessment";
import {
  HELE_ORGANISATIE,
  controleerOnderdeelNaam,
  stabielOnderdeelId,
  vindOnderdeel,
  zorgOnderdelenKloppend,
} from "./onderdelen";
import type { Organisatie, ScanUitvoering } from "./types";

const opslag = new Map<string, string>();
const KEY = "coniche-scan:organisaties";
type Db = typeof import("./db");
let db: Db;

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
});
beforeEach(() => opslag.clear());

const A = zorgscan;
const meting = (id: string, onderdeel: string | undefined, extra: Partial<ScanUitvoering> = {}): ScanUitvoering => ({
  id, organisatieId: "O", assessmentId: A.id, label: id, aangemaaktOp: "2026-01-01T00:00:00.000Z", invullingen: [],
  ...(onderdeel === undefined ? {} : { onderdeel }), ...extra,
});
const org = (scanUitvoeringen: ScanUitvoering[], extra: Partial<Organisatie> = {}): Organisatie => ({
  id: "O", naam: "Org", kenmerken: {}, leden: [], scanUitvoeringen, aangemaaktDoor: null, toegewezenAan: [],
  benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
});
const zet = (o: Organisatie) => opslag.set(KEY, JSON.stringify([o]));
const laad = () => (JSON.parse(opslag.get(KEY)!) as Organisatie[])[0];
const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> | null }[]);

describe("overgang van de tekst op de Meting naar Onderdelen", () => {
  it("elke naam die niet Hele organisatie is, wordt een Onderdeel, en Hele organisatie wordt null", () => {
    const o = org([meting("a", "Team A"), meting("b", "Hele organisatie"), meting("c", undefined), meting("d", "Team B")]);
    zorgOnderdelenKloppend(o);
    expect(o.onderdelen?.map((x) => x.naam).sort()).toEqual(["Team A", "Team B"]);
    expect(o.scanUitvoeringen.map((m) => m.onderdeelId === null)).toEqual([false, true, true, false]);
    expect(o.scanUitvoeringen[0].onderdeelId).toBe(vindOnderdeel(o, "Team A")!.id);
  });

  it("namen die hoofdletterongevoelig en zonder spaties gelijk zijn, worden één Onderdeel met de meest voorkomende spelling", () => {
    const o = org([meting("a", "team a"), meting("b", "Team A"), meting("c", " Team A "), meting("d", "TEAM A")]);
    zorgOnderdelenKloppend(o);
    expect(o.onderdelen).toHaveLength(1);
    expect(o.onderdelen![0].naam).toBe("Team A");
    expect(new Set(o.scanUitvoeringen.map((m) => m.onderdeelId)).size).toBe(1);
    expect(o.scanUitvoeringen.every((m) => m.onderdeel === "Team A")).toBe(true);
  });

  it("bij gelijke aantallen wint de spelling van de oudste Meting", () => {
    const o = org([
      meting("a", "team a", { aangemaaktOp: "2026-03-01T00:00:00.000Z" }),
      meting("b", "TEAM A", { aangemaaktOp: "2026-01-01T00:00:00.000Z" }),
    ]);
    zorgOnderdelenKloppend(o);
    expect(o.onderdelen![0].naam).toBe("TEAM A");
  });

  it("is idempotent en geeft bij elke keer laden hetzelfde id", () => {
    const o1 = org([meting("a", "Team A")]);
    const o2 = org([meting("a", "Team A")]);
    zorgOnderdelenKloppend(o1);
    zorgOnderdelenKloppend(o1);
    zorgOnderdelenKloppend(o2);
    expect(o1.onderdelen).toHaveLength(1);
    expect(o1.onderdelen![0].id).toBe(o2.onderdelen![0].id);
    expect(o1.onderdelen![0].id).toBe(stabielOnderdeelId("O", "team a"));
  });

  it("een bestaand Onderdeel wint van de spelling op de Meting", () => {
    const o = org([meting("a", "team a")], { onderdelen: [{ id: "x", organisatieId: "O", naam: "Team A", aangemaaktOp: "x" }] });
    zorgOnderdelenKloppend(o);
    expect(o.scanUitvoeringen[0].onderdeel).toBe("Team A");
    expect(o.scanUitvoeringen[0].onderdeelId).toBe("x");
    expect(o.onderdelen).toHaveLength(1);
  });
});

describe("de naam van een Onderdeel", () => {
  const o = org([], { onderdelen: [{ id: "x", organisatieId: "O", naam: "Team A", aangemaaktOp: "x" }] });
  it("is verplicht, getrimd en hoofdletterongevoelig uniek", () => {
    expect(controleerOnderdeelNaam(o, "   ")).toEqual({ ok: false, reden: "Vul een naam in." });
    expect(controleerOnderdeelNaam(o, "  Team B ")).toEqual({ ok: true, naam: "Team B" });
    const bestaand = controleerOnderdeelNaam(o, "team a");
    expect(bestaand.ok && bestaand.naam).toBe("Team A");
  });
  it("Hele organisatie is gereserveerd, ook in andere hoofdletters", () => {
    for (const naam of ["Hele organisatie", "hele ORGANISATIE"]) {
      const c = controleerOnderdeelNaam(o, naam);
      expect(c.ok && c.hele).toBe(true);
      expect(c.ok && c.naam).toBe(HELE_ORGANISATIE);
    }
  });
});

describe("Onderdelen aanmaken, hernoemen en verwijderen", () => {
  it("een Meting met een nieuwe naam maakt het Onderdeel bij het opslaan", () => {
    zet(org([]));
    const r = db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", meetdatum: "2026-02-01" });
    expect(r.ok).toBe(true);
    const o = laad();
    expect(o.onderdelen?.map((x) => x.naam)).toEqual(["Team A"]);
    expect(o.scanUitvoeringen[0].onderdeelId).toBe(o.onderdelen![0].id);
  });

  it("maakOnderdeel maakt er één en een andere schrijfwijze is hetzelfde Onderdeel", () => {
    zet(org([]));
    const a = db.maakOnderdeel("O", " Particulier ");
    expect(a.ok && a.nieuw).toBe(true);
    const b = db.maakOnderdeel("O", "particulier");
    expect(b.ok && b.nieuw).toBe(false);
    expect(laad().onderdelen).toHaveLength(1);
    expect(db.maakOnderdeel("O", "Hele organisatie").ok).toBe(false);
    expect(audit().filter((e) => e.actie === "onderdeel.aangemaakt")).toHaveLength(1);
  });

  it("hernoemen werkt de Metingen bij, behalve de naam die de gebruiker zelf koos, en logt oud en nieuw", () => {
    zet(
      org([
        meting("a", "Team A", { meetdatum: "2026-02-01", label: "Team A | feb 2026" }),
        meting("b", "Team A", { meetdatum: "2026-03-01", label: "Mijn eigen naam", labelHandmatig: true }),
      ])
    );
    const id = db.laadAlles()[0].onderdelen![0].id;
    expect(db.hernoemOnderdeel("O", id, "Team Alfa")).toEqual({ ok: true, gewijzigd: true });
    const o = laad();
    expect(o.onderdelen![0].naam).toBe("Team Alfa");
    expect(o.scanUitvoeringen.map((m) => m.onderdeel)).toEqual(["Team Alfa", "Team Alfa"]);
    expect(o.scanUitvoeringen[0].label).toBe("Team Alfa | feb 2026");
    expect(o.scanUitvoeringen[1].label).toBe("Mijn eigen naam");
    const e = audit().find((a) => a.actie === "onderdeel.hernoemd")!;
    expect(e.details).toMatchObject({ oudeNaam: "Team A", nieuweNaam: "Team Alfa" });
  });

  it("hernoemen kan niet naar een bestaande of gereserveerde naam, een andere hoofdletter mag wel", () => {
    zet(org([meting("a", "Team A"), meting("b", "Team B")]));
    const [a, b] = db.laadAlles()[0].onderdelen!;
    expect(db.hernoemOnderdeel("O", a.id, "team b").ok).toBe(false);
    expect(db.hernoemOnderdeel("O", a.id, "Hele organisatie").ok).toBe(false);
    expect(db.hernoemOnderdeel("O", a.id, " ").ok).toBe(false);
    expect(db.hernoemOnderdeel("O", b.id, "TEAM B")).toEqual({ ok: true, gewijzigd: true });
  });

  it("verwijderen kan alleen zonder Meting en neemt de KPI-waarden van het Onderdeel mee", () => {
    zet(org([meting("a", "Team A")], { onderdelen: [] }));
    const a = db.laadAlles()[0].onderdelen![0];
    const leeg = db.maakOnderdeel("O", "Leeg");
    if (!leeg.ok) throw new Error("niet gelukt");
    const o = db.laadAlles()[0];
    o.kpiWaarden = [
      { organisatieId: "O", onderdeelId: leeg.onderdeel.id, kanaalId: null, kpiId: "aht", waarde: 300 },
      { organisatieId: "O", onderdeelId: null, kanaalId: null, kpiId: "aht", waarde: 280 },
    ];
    zet(o);
    const geweigerd = db.verwijderOnderdeel("O", a.id);
    expect(geweigerd.ok).toBe(false);
    const gelukt = db.verwijderOnderdeel("O", leeg.onderdeel.id);
    expect(gelukt).toEqual({ ok: true, kpiWaarden: 1 });
    const na = laad();
    expect(na.onderdelen?.map((x) => x.naam)).toEqual(["Team A"]);
    expect(na.kpiWaarden).toHaveLength(1);
    expect(audit().find((e) => e.actie === "onderdeel.verwijderd")?.details).toMatchObject({ aantalKpiWaarden: 1 });
  });
});
