import { describe, expect, it } from "vitest";
import {
  MAX_KORTE_NAAM,
  SECTOR_VELD_ID,
  kopNaam,
  korteNaamVeld,
  korteNaamWaarde,
  korteNamenRijen,
  valideerKorteNamen,
  foutSleutel,
  KorteNamen,
} from "./korte-namen";
import { organisatieVelden } from "@/data/organisatie-velden";

const leeg: KorteNamen = { velden: {}, waarden: [] };
const sectoren = organisatieVelden.find((v) => v.id === "sector-subsector")!.subvelden!.find((v) => v.id === "sector")!.opties!;

describe("korte namen", () => {
  it("valt terug op het origineel", () => {
    expect(korteNaamVeld(leeg, "kpis.aht", "AHT")).toBe("AHT");
    expect(korteNaamWaarde(leeg, "techstack.techstack-crm.leverancier", "Salesforce")).toBe("Salesforce");
    expect(korteNaamVeld(undefined, "x", "Y")).toBe("Y");
  });

  it("gebruikt de beginwaarden voor de 22 SBI-secties", () => {
    expect(sectoren).toHaveLength(22);
    expect(korteNaamWaarde(leeg, SECTOR_VELD_ID, sectoren[11])).toBe("Financiële dienstverlening");
    expect(korteNaamWaarde(leeg, SECTOR_VELD_ID, sectoren[0])).toBe("Landbouw en visserij");
  });

  it("laat een opgeslagen korte naam winnen en een lege bewust het origineel tonen", () => {
    const store: KorteNamen = {
      velden: { "kpis.aht": "Gespreksduur" },
      waarden: [
        { veldId: SECTOR_VELD_ID, waarde: sectoren[11], korteNaam: "Financieel" },
        { veldId: SECTOR_VELD_ID, waarde: sectoren[0], korteNaam: "" },
      ],
    };
    expect(korteNaamVeld(store, "kpis.aht", "AHT")).toBe("Gespreksduur");
    expect(korteNaamWaarde(store, SECTOR_VELD_ID, sectoren[11])).toBe("Financieel");
    expect(korteNaamWaarde(store, SECTOR_VELD_ID, sectoren[0])).toBe(sectoren[0]);
  });

  it("kopNaam gebruikt de korte naam van de Organisatie, anders de naam", () => {
    expect(kopNaam({ naam: "Rabobank Nederland", korteNaam: "Rabobank" })).toBe("Rabobank");
    expect(kopNaam({ naam: "Rabobank Nederland", korteNaam: "  " })).toBe("Rabobank Nederland");
    expect(kopNaam({ naam: "Rabobank Nederland" })).toBe("Rabobank Nederland");
  });

  it("telt in gebruik en voegt waarden toe die organisaties zelf invullen", () => {
    const organisaties = [
      { kenmerken: { techstack: { "techstack-crm": { leverancier: "Salesforce" } } } },
      { kenmerken: { techstack: { "techstack-crm": { leverancier: "Salesforce" } } } },
      { kenmerken: { techstack: { "techstack-crm": { leverancier: "MijnEigenCRM" } } } },
      { kenmerken: {} },
    ];
    const rijen = korteNamenRijen(organisaties, leeg);
    const veldnaam = rijen.find((r) => r.soort === "veldnaam" && r.veldId === "techstack.techstack-crm.leverancier");
    expect(veldnaam?.inGebruik).toBe(3);
    const waarden = rijen.filter((r) => r.soort === "waarde" && r.veldId === "techstack.techstack-crm.leverancier");
    expect(waarden.find((r) => r.origineel === "Salesforce")?.inGebruik).toBe(2);
    expect(waarden.find((r) => r.origineel === "MijnEigenCRM")?.inGebruik).toBe(1);
    expect(waarden.find((r) => r.origineel === "MijnEigenCRM")?.korteNaam).toBe("");
  });

  it("valideert lengte en uniciteit binnen een veld, hoofdletterongevoelig", () => {
    const rij = (origineel: string, korteNaam: string, veldId = "v") => ({
      soort: "waarde" as const,
      veldId,
      veldLabel: "V",
      origineel,
      korteNaam,
      inGebruik: 1,
    });
    const rijen = [rij("Een", "Bank"), rij("Twee", "bank"), rij("Drie", "x".repeat(MAX_KORTE_NAAM + 1)), rij("Vier", "Bank", "w")];
    const fouten = valideerKorteNamen(rijen);
    expect(fouten[foutSleutel(rijen[0])]).toBeUndefined();
    expect(fouten[foutSleutel(rijen[1])]).toContain("al in gebruik");
    expect(fouten[foutSleutel(rijen[2])]).toContain("Hoogstens");
    // Dezelfde naam in een ander veld mag.
    expect(fouten[foutSleutel(rijen[3])]).toBeUndefined();
  });

  it("een lege korte naam botst met het origineel van een andere waarde", () => {
    const rijen = [
      { soort: "waarde" as const, veldId: "v", veldLabel: "V", origineel: "Bank", korteNaam: "", inGebruik: 1 },
      { soort: "waarde" as const, veldId: "v", veldLabel: "V", origineel: "Anders", korteNaam: "Bank", inGebruik: 1 },
    ];
    const fouten = valideerKorteNamen(rijen);
    expect(Object.keys(fouten)).toHaveLength(1);
  });
});
