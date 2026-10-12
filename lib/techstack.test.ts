import { describe, expect, it } from "vitest";
import { GEEN_ONDERSTEUNING, migreerTechstackOndersteuning, ondersteuningVan } from "./techstack";

const ids = ["techstack-contact-center", "techstack-crm"];

describe("ondersteuningVan", () => {
  it("leidt zelf af uit Geen ondersteuning en extern uit een partij", () => {
    expect(ondersteuningVan({ ondersteuner: GEEN_ONDERSTEUNING })).toBe("zelf");
    expect(ondersteuningVan({ ondersteuner: "Sabio" })).toBe("extern");
  });

  it("laat de partij voorgaan op het oude veld", () => {
    expect(ondersteuningVan({ ondersteuner: "Sabio", ondersteuning: "zelf" })).toBe("extern");
  });

  it("valt terug op het oude veld, en geeft anders niets", () => {
    expect(ondersteuningVan({ ondersteuning: "extern" })).toBe("extern");
    expect(ondersteuningVan({ ondersteuner: "  " })).toBeUndefined();
    expect(ondersteuningVan(undefined)).toBeUndefined();
  });
});

describe("migreerTechstackOndersteuning", () => {
  it("zet zelf om naar Geen ondersteuning en haalt het oude veld weg", () => {
    const uit = migreerTechstackOndersteuning({ techstack: { "techstack-crm": { leverancier: "X", ondersteuning: "zelf" } } }, ids);
    expect(uit.techstack).toEqual({ "techstack-crm": { leverancier: "X", ondersteuner: GEEN_ONDERSTEUNING } });
  });

  it("laat extern zonder bekende partij staan", () => {
    const kenmerken = { techstack: { "techstack-crm": { leverancier: "X", ondersteuning: "extern" } } };
    expect(migreerTechstackOndersteuning(kenmerken, ids)).toBe(kenmerken);
  });

  it("haalt het oude veld weg als er al een partij is gekozen", () => {
    const uit = migreerTechstackOndersteuning(
      { techstack: { "techstack-crm": { ondersteuning: "extern", ondersteuner: "Sabio" } } },
      ids
    );
    expect(uit.techstack).toEqual({ "techstack-crm": { ondersteuner: "Sabio" } });
  });

  it("raakt categorieën zonder lijst en andere kenmerken niet aan", () => {
    const kenmerken = {
      kpis: { aht: 280 },
      techstack: { "techstack-llm-oplossing": { leverancier: "Claude", ondersteuning: "zelf" } },
    };
    expect(migreerTechstackOndersteuning(kenmerken, ids)).toBe(kenmerken);
  });

  it("doet niets zonder techstack", () => {
    const kenmerken = {};
    expect(migreerTechstackOndersteuning(kenmerken, ids)).toBe(kenmerken);
  });
});
