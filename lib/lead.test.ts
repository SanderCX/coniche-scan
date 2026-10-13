import { describe, expect, it } from "vitest";
import { heeftBereikOpMeting, heeftBereikOpOrganisatie, isLead, leadMetingIdsVan, leadSamenvatting } from "./lead";

const org = { scanUitvoeringen: [{ id: "M1" }, { id: "M2" }, { id: "M3" }] };
const metingen = (...ids: string[]) => ({ organisatieId: "O", leadMetingIds: ids, leadVoorOrganisatie: false });
const heleOrganisatie = (extra: { leadMetingIds?: string[] } = {}) => ({
  organisatieId: "O",
  leadMetingIds: extra.leadMetingIds ?? [],
  leadVoorOrganisatie: true,
});

describe("het bereik van een Lead", () => {
  it("is Lead bij de hele organisatie of bij minstens één Meting", () => {
    expect(isLead(metingen("M1"))).toBe(true);
    expect(isLead(heleOrganisatie())).toBe(true);
    expect(isLead(metingen())).toBe(false);
    // Data van vóór het bereik heeft het veld niet.
    expect(isLead({ leadMetingIds: [] })).toBe(false);
    expect(isLead({ leadMetingIds: ["M1"] })).toBe(true);
  });

  it("ziet bij de hele organisatie alle Metingen, ook die later zijn aangemaakt", () => {
    expect(leadMetingIdsVan(heleOrganisatie(), org)).toEqual(["M1", "M2", "M3"]);
    expect(leadMetingIdsVan(heleOrganisatie(), { scanUitvoeringen: [...org.scanUitvoeringen, { id: "M4" }] })).toHaveLength(4);
    expect(leadMetingIdsVan(metingen("M2"), org)).toEqual(["M2"]);
  });

  it("negeert bewaarde Metingen zolang de hele organisatie aan staat", () => {
    const lid = heleOrganisatie({ leadMetingIds: ["M1"] });
    expect(leadMetingIdsVan(lid, org)).toEqual(["M1", "M2", "M3"]);
    expect(leadSamenvatting(lid)).toBe("Lead voor de hele organisatie");
  });

  it("heeft bereik op de organisatie alleen bij de hele organisatie van zijn eigen organisatie", () => {
    expect(heeftBereikOpOrganisatie(heleOrganisatie(), "O")).toBe(true);
    expect(heeftBereikOpOrganisatie(heleOrganisatie(), "ANDERS")).toBe(false);
    expect(heeftBereikOpOrganisatie(metingen("M1"), "O")).toBe(false);
  });

  it("heeft bereik op een Meting via de hele organisatie of via die Meting, nooit bij een andere organisatie", () => {
    expect(heeftBereikOpMeting(heleOrganisatie(), "O", "M9")).toBe(true);
    expect(heeftBereikOpMeting(metingen("M1"), "O", "M1")).toBe(true);
    expect(heeftBereikOpMeting(metingen("M1"), "O", "M2")).toBe(false);
    expect(heeftBereikOpMeting(heleOrganisatie(), "ANDERS", "M1")).toBe(false);
  });

  it("vat het bereik samen zoals het scherm dat toont", () => {
    expect(leadSamenvatting(metingen())).toBe("Geen Lead");
    expect(leadSamenvatting(metingen("M1"))).toBe("Lead voor 1 Meting");
    expect(leadSamenvatting(metingen("M1", "M2"))).toBe("Lead voor 2 Metingen");
  });
});
