import { describe, expect, it } from "vitest";
import { organisatieVelden } from "@/data/organisatie-velden";
import { getalTekst, kenmerkenRaster } from "./kenmerken-weergave";

const raster = (k: Record<string, unknown>) => Object.fromEntries(kenmerkenRaster(organisatieVelden, k).map((i) => [i.label, i.waarde]));

describe("de kaart Kenmerken", () => {
  it("een Organisatie zonder kenmerken heeft een leeg raster", () => {
    expect(kenmerkenRaster(organisatieVelden, {})).toEqual([]);
  });

  it("getallen krijgen een duizendtalpunt en een decimale komma", () => {
    expect(getalTekst(410000)).toBe("410.000");
    expect(getalTekst(3.5)).toBe("3,5");
    expect(getalTekst("")).toBeNull();
    expect(getalTekst("abc")).toBeNull();
  });

  it("toont de samengestelde velden zoals de spec ze noemt", () => {
    const r = raster({
      "sector-subsector": { sector: "Onderwijs" },
      "volume-klantbasis": { "totaal-klanten": { totaal: 410000, "b2b-percentage": 15, "b2c-percentage": 85 }, "adoptie-mijnomgeving": 38 },
      digitalisering: { "percentage-2026": 31, "ambitie-2030": 60 },
      fte: { "fte-klantcontact": { aantal: 140, "inhouse-percentage": 70 } },
    });
    expect(r["Sector"]).toBe("Onderwijs");
    expect(r["Klanten, B2B / B2C"]).toBe("410.000, 15 / 85%");
    expect(r["Adoptie mijnomgeving/app"]).toBe("38%");
    expect(r["Digitalisering 2026 / 2030"]).toBe("31% / 60%");
    expect(r["Klantcontactmedewerkers, inhouse"]).toBe("140, 70% inhouse");
  });

  it("een techstack toont de oplossing en hoe ze wordt ondersteund", () => {
    const r = raster({
      techstack: {
        "techstack-crm": { leverancier: "Pakket 1", ondersteuner: "Partij X" },
        "techstack-wfm": { leverancier: "Pakket 2", ondersteuner: "Geen ondersteuning" },
        "techstack-contact-center": { leverancier: "Nog niet ingezet" },
      },
    });
    expect(r["CRM"]).toBe("Pakket 1, extern ondersteund");
    expect(r["WFM"]).toBe("Pakket 2, zelf ondersteund");
    expect(r["Contact center"]).toBe("Nog niet ingezet");
  });

  it("een veld zonder waarde staat niet in het raster", () => {
    const r = raster({ "sector-subsector": { sector: "Onderwijs" } });
    expect(Object.keys(r)).toEqual(["Sector"]);
  });
});
