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
});
