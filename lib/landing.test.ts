import { describe, expect, it } from "vitest";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { aiVolwassenheid as aiScan } from "@/data/ai-scan-assessment";
import { bouwstenenLink, heroUitleg } from "./landing";

describe("de hero van de landingspagina", () => {
  it("toont alleen de eerste zin en laat het stuk over de bouwblokken uit de oude tekst weg", () => {
    expect(heroUitleg("Breng in kaart hoe volwassen jouw klantcontactorganisatie is op 15 bouwblokken, verdeeld over 5 pijlers — van strategie tot cultuur. Elke vraag is gebaseerd op bewijs.")).toBe(
      "Breng in kaart hoe volwassen jouw klantcontactorganisatie is.",
    );
    expect(heroUitleg("Breng in kaart hoe volwassen jouw organisatie is. Elke vraag is gebaseerd op bewijs.")).toBe("Breng in kaart hoe volwassen jouw organisatie is.");
    expect(heroUitleg("Eén zin zonder tweede.")).toBe("Eén zin zonder tweede.");
  });
  it("noemt het aantal bouwblokken en pijlers uit de content, alleen bij de Bouwsteen", () => {
    expect(bouwstenenLink(klantcontactVolwassenheid)).toEqual({ tekst: "15 bouwblokken in 5 pijlers", href: "/bouwstenen" });
    expect(bouwstenenLink(aiScan)).toBeNull();
  });
});
