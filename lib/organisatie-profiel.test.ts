import { describe, expect, it } from "vitest";
import { organisatieVelden } from "@/data/organisatie-velden";
import { KPI_CONTACTEN, STANDAARD_KANALEN } from "./kpi";
import { compactGetal, organisatieProfiel, profielCijfers, profielKanalen, profielOverig, profielTechstack } from "./organisatie-profiel";
import { kanaalStijl } from "./kanaal-stijl";
import type { KpiWaarde, Organisatie } from "./types";

const org = (kenmerken: Record<string, unknown> = {}, kpiWaarden: KpiWaarde[] = [], extra: Partial<Organisatie> = {}): Organisatie =>
  ({
    id: "O", naam: "Eneco", kenmerken, kpiWaarden, leden: [], scanUitvoeringen: [], aangemaaktDoor: null, toegewezenAan: [],
    benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
  }) as Organisatie;
const kpi = (kanaalId: string | null, waarde: number): KpiWaarde => ({ organisatieId: "O", kpiId: KPI_CONTACTEN, onderdeelId: null, kanaalId, waarde });
const techVeld = organisatieVelden.find((v) => v.id === "techstack");

describe("compacte getallen", () => {
  it("toont een miljoen als mln en, bij de kanalen, duizenden als k", () => {
    expect(compactGetal(2_400_000)).toBe("2,4 mln");
    expect(compactGetal(1_900_000)).toBe("1,9 mln");
    expect(compactGetal(410_000)).toBe("410.000");
    expect(compactGetal(850_000, true)).toBe("850k");
    expect(compactGetal(1_250, true)).toBe("1,3k");
    expect(compactGetal(999_980, true)).toBe("1 mln");
    expect(compactGetal(140)).toBe("140");
  });
});

describe("de cijferrij", () => {
  it("toont klanten, FTE, contacten per jaar en digitalisering met hun toelichting", () => {
    const o = org(
      {
        "volume-klantbasis": { "totaal-klanten": { totaal: 2_400_000, "b2b-percentage": 8, "b2c-percentage": 92 } },
        fte: { "fte-klantcontact": { aantal: 140, "inhouse-percentage": 70 } },
        digitalisering: { "percentage-2026": 50, "ambitie-2030": 80 },
      },
      [kpi(null, 1_900_000)]
    );
    expect(profielCijfers(o)).toEqual([
      { id: "klanten", waarde: "2,4 mln", toelichting: "klanten, 92% B2C" },
      { id: "fte", waarde: "140", toelichting: "FTE klantcontact, 70% inhouse" },
      { id: "contacten", waarde: "1,9 mln", toelichting: "contacten per jaar" },
      { id: "digitalisering", waarde: "50% → 80%", toelichting: "digitalisering 2026 en 2030" },
    ]);
  });
  it("laat een kolom zonder waarde weg en de rest opschuiven", () => {
    expect(profielCijfers(org())).toEqual([]);
    const o = org({ digitalisering: { "percentage-2026": 31 } });
    expect(profielCijfers(o)).toEqual([{ id: "digitalisering", waarde: "31%", toelichting: "digitalisering 2026" }]);
    expect(profielCijfers(org({ "volume-klantbasis": { "totaal-klanten": { totaal: 410000 } } }))[0]).toEqual({ id: "klanten", waarde: "410.000", toelichting: "klanten" });
  });
});

describe("de kanalen", () => {
  it("zijn ingezet bij contacten per jaar boven 0, met het aantal, en anders lichtgrijs zonder aantal", () => {
    const o = org({}, [kpi("kanaal-call", 850_000), kpi("kanaal-chatbot", 0)]);
    const k = profielKanalen(o, STANDAARD_KANALEN);
    expect(k.map((x) => x.naam)).toEqual(["Call", "Voicebot", "Livechat", "Chatbot", "E-mail", "Whatsapp"]);
    expect(k[0]).toMatchObject({ ingezet: true, aantal: "850k" });
    expect(k[3]).toMatchObject({ ingezet: false, aantal: null });
    expect(k[1]).toMatchObject({ ingezet: false, aantal: null });
  });
  it("kent een kleur en een icoon per kanaal en een neutrale stijl voor een nieuw kanaal", () => {
    expect(kanaalStijl("Call")).toMatchObject({ kleur: "#ff671f", icoon: "telefoon" });
    expect(kanaalStijl("E-mail")).toMatchObject({ kleur: "#ffc043", icoonKleur: "#1c1c1a", icoon: "envelop" });
    expect(kanaalStijl("chatbot").kleur).toBe("#0e7c86");
    expect(kanaalStijl("Brief").icoon).toBe("tekstballon");
  });
});

describe("de techstack en de overige velden", () => {
  it("toont alleen de oplossing van de categorieën die er een hebben, zonder wie ondersteunt", () => {
    const o = org({ techstack: { "techstack-contact-center": { leverancier: "Genesys", ondersteuner: "Partij X", deploymentmodel: "Cloud" } } });
    expect(profielTechstack(o, techVeld)).toEqual([{ categorie: "Contact center", oplossing: "Genesys" }]);
    expect(profielTechstack(org(), techVeld)).toEqual([]);
  });
  it("toont adoptie, management en support en IT DevOps als kleine regels", () => {
    const o = org({
      "volume-klantbasis": { "adoptie-mijnomgeving": 38 },
      fte: { "fte-management-support": { aantal: 12 }, "fte-it-devops": { aantal: 20, "digital-percentage": 60 } },
    });
    expect(profielOverig(o)).toEqual([
      { label: "Adoptie mijnomgeving/app", waarde: "38%" },
      { label: "Klantcontact management & support", waarde: "12" },
      { label: "IT DevOps-medewerkers", waarde: "20, 60% Digital" },
    ]);
  });
});

describe("het hele profiel", () => {
  it("geeft de beginletter van de korte naam of de naam", () => {
    const bronnen = { kanalen: STANDAARD_KANALEN, techstackVeld: techVeld };
    expect(organisatieProfiel(org(), bronnen).letter).toBe("E");
    expect(organisatieProfiel(org({}, [], { korteNaam: "mst" }), bronnen).letter).toBe("M");
    const o = org({ "sector-subsector": { sector: "Onderwijs", subsector: "" } });
    expect(organisatieProfiel(o, bronnen)).toMatchObject({ sector: { tekst: "Onderwijs" }, subsector: null });
  });
});
