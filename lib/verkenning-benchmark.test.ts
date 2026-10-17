import { describe, expect, it } from "vitest";
import { zorgscan } from "@/data/zorgscan-assessment";
import { alleVragen } from "./assessment-structuur";
import type { Benchmark, Organisatie, ScanInvulling } from "./types";
import { KANALEN_ID } from "./verkennen";
import {
  filterRegels,
  filtersVanStand,
  isVerkenning,
  ledenVoorVerkenning,
  materialiseerBenchmark,
  onbekendeKenmerken,
  redenNietOpslaan,
  standVanFilters,
} from "./verkenning-benchmark";

const assessment = zorgscan;
const scan = (id: string): ScanInvulling =>
  ({
    id, scanUitvoeringId: "m", organisatieLidId: id, status: "afgerond", aangemaaktOp: "x", uitgenodigdOp: "x", gestartOp: null,
    afgerondOp: null, bewaarVerlengdTot: null, opmerkingenPerBouwblok: {},
    antwoorden: Object.fromEntries(alleVragen(assessment).map((v) => [v.id, 3])),
  }) as unknown as ScanInvulling;

function org(id: string, sector: string, opties: { vlag?: boolean; onderdelen?: string[] } = {}): Organisatie {
  const onderdelen = opties.onderdelen ?? ["Hele organisatie"];
  return {
    id, naam: `Org ${id}`, kenmerken: { "sector-subsector": { sector } }, leden: [], aangemaaktDoor: null, toegewezenAan: [],
    benchmarkToegestaan: opties.vlag ?? true, aangemaaktOp: "x", gewijzigdOp: "x",
    scanUitvoeringen: onderdelen.map((o, i) => ({
      id: `m-${id}-${i}`, organisatieId: id, assessmentId: assessment.id, label: `${o}`, onderdeel: o, aangemaaktOp: "2026-01-01",
      meetdatum: "2026-02-01", invullingen: [scan(`${id}-${i}-a`), scan(`${id}-${i}-b`), scan(`${id}-${i}-c`)],
    })),
  } as unknown as Organisatie;
}

const verkenning = (filters: Benchmark["filters"], eenheid: Benchmark["eenheid"] = "organisaties"): Benchmark =>
  ({
    id: "b", naam: "V", niveau: "organisaties", soort: "verkenning", eenheid, filters, assessmentIds: [assessment.id], leden: [],
    meldingen: [], aangemaaktOp: "x", aangemaaktDoor: "g",
  }) as Benchmark;

describe("opgeslagen verkenning", () => {
  const orgs = [org("a", "Industrie"), org("b", "Industrie"), org("c", "Onderwijs"), org("d", "Industrie", { vlag: false })];

  it("de leden volgen uit de filters, met de poolregels", () => {
    const leden = ledenVoorVerkenning(orgs, verkenning([{ kenmerk: "sector-subsector.sector", waarden: ["Industrie"] }]), 3);
    expect(leden.map((l) => l.organisatieId)).toEqual(["a", "b"]);
  });

  it("een organisatie die erbij komt telt mee en een die afvalt verdwijnt", () => {
    const b = verkenning([{ kenmerk: "sector-subsector.sector", waarden: ["Industrie"] }]);
    expect(ledenVoorVerkenning([...orgs, org("e", "Industrie")], b, 3)).toHaveLength(3);
    const zonderVlag = orgs.map((o) => (o.id === "a" ? { ...o, benchmarkToegestaan: false } : o));
    expect(ledenVoorVerkenning(zonderVlag, b, 3).map((l) => l.organisatieId)).toEqual(["b"]);
  });

  it("zonder filter, of met een kenmerk dat niet meer bestaat, is de groep leeg", () => {
    expect(ledenVoorVerkenning(orgs, verkenning([]), 3)).toEqual([]);
    const b = verkenning([{ kenmerk: "bestaat.niet", waarden: ["x"] }]);
    expect(ledenVoorVerkenning(orgs, b, 3)).toEqual([]);
    expect(onbekendeKenmerken(b.filters ?? [])).toEqual(["bestaat.niet"]);
  });

  it("bij Onderdelen is elk onderdeel een lid, en kan op Organisatie gefilterd worden", () => {
    const univé = org("u", "Industrie", { onderdelen: ["Particulier", "Zakelijk"] });
    const b = verkenning([{ kenmerk: "__organisatie", waarden: ["u"] }], "onderdelen");
    const leden = ledenVoorVerkenning([...orgs, univé], b, 3);
    expect(leden.map((l) => l.organisatieId)).toEqual(["u", "u"]);
    expect(new Set(leden.map((l) => l.metingId)).size).toBe(2);
  });

  it("materialiseren vult de leden bij een verkenning en laat een vaste groep staan", () => {
    const b = verkenning([{ kenmerk: "sector-subsector.sector", waarden: ["Onderwijs"] }]);
    expect(isVerkenning(b)).toBe(true);
    expect(materialiseerBenchmark(b, orgs, 3).leden).toHaveLength(1);
    const vast = { ...b, soort: "vasteGroep" as const, leden: [{ organisatieId: "a", assessmentId: assessment.id, metingId: "m-a-0" }] };
    expect(materialiseerBenchmark(vast, orgs, 3).leden).toHaveLength(1);
  });

  it("filters en stand zijn elkaars omgekeerde, een filter zonder waarde telt niet", () => {
    const stand = { select: { "kpis.aht": [], "sector-subsector.sector": ["Industrie"] }, bereik: {}, kanalen: ["kanaal-call"] };
    const filters = filtersVanStand(stand);
    expect(filters).toEqual([
      { kenmerk: "sector-subsector.sector", waarden: ["Industrie"] },
      { kenmerk: KANALEN_ID, waarden: ["kanaal-call"] },
    ]);
    expect(standVanFilters(filters).select).toEqual({ "sector-subsector.sector": ["Industrie"] });
  });

  it("de regels noemen het kenmerk, bij meer waarden 'of' en bij kanalen 'alle van'", () => {
    const regels = filterRegels(
      [
        { kenmerk: "crm", waarden: ["Salesforce", "Oracle"] },
        { kenmerk: KANALEN_ID, waarden: ["Call", "Chatbot"] },
      ],
      { veld: (k) => (k === "crm" ? "CRM-pakket" : "Ingezette kanalen"), waarde: (_k, w) => w }
    );
    expect(regels).toEqual(["CRM-pakket is Salesforce of Oracle", "Ingezette kanalen: alle van Call, Chatbot"]);
  });

  it("opslaan kan alleen met een filter en een pool die groot genoeg is", () => {
    const leeg = { select: {}, bereik: {}, kanalen: [] };
    expect(redenNietOpslaan(leeg, 10, 6, "Organisaties")).toBe("Zet eerst een filter, anders is de groep de hele pool");
    const stand = { select: { x: ["a"] }, bereik: {}, kanalen: [] };
    expect(redenNietOpslaan(stand, 3, 6, "Organisaties")).toBe("Minder dan 6 Organisaties in de pool");
    expect(redenNietOpslaan(stand, 8, 6, "Organisaties")).toBeNull();
  });
});
