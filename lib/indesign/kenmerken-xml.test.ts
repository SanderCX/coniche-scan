import { describe, expect, it } from "vitest";
import { kenmerkenXml } from "./kenmerken-xml";

describe("kenmerkenXml, techstack", () => {
  it("geeft WFM een eigen element met leverancier en ondersteuning", () => {
    const xml = kenmerkenXml({
      techstack: { "techstack-wfm": { leverancier: "Injixo", ondersteuning: "extern" } },
    });
    expect(xml).toContain('<techstackWfm leverancier="Injixo" ondersteuning="extern" />');
  });

  it("zet n.v.t. als er geen WFM-oplossing is ingevuld", () => {
    expect(kenmerkenXml({})).toContain('<techstackWfm leverancier="n.v.t." ondersteuning="n.v.t." />');
  });

  it("leidt zelf of extern af uit Ondersteund door", () => {
    const xml = kenmerkenXml({
      techstack: {
        "techstack-wfm": { leverancier: "Injixo", ondersteuner: "Geen ondersteuning" },
        "techstack-crm": { leverancier: "Zendesk", ondersteuner: "Sabio" },
        "techstack-contact-center": { leverancier: "Odigo", ondersteuning: "extern" },
        "techstack-llm-oplossing": { leverancier: "Anthropic Claude", ondersteuning: "zelf" },
      },
    });
    expect(xml).toContain('<techstackWfm leverancier="Injixo" ondersteuning="zelf" />');
    expect(xml).toContain('<techstackCrm leverancier="Zendesk" ondersteuning="extern" />');
    expect(xml).toContain('<techstackContactCenter leverancier="Odigo" ondersteuning="extern" />');
    // LLM-oplossing heeft geen Ondersteund door: Een oude waarde komt niet meer in de export.
    expect(xml).toContain('<techstackLlmOplossing leverancier="Anthropic Claude" ondersteuning="n.v.t." />');
  });
});
