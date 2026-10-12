import { describe, expect, it } from "vitest";
import { organisatieVelden } from "@/data/organisatie-velden";

const techstack = organisatieVelden.find((v) => v.id === "techstack")!;
const categorie = (id: string) => techstack.subvelden!.find((c) => c.id === id)!;

describe("organisatievelden, techstack", () => {
  it("heeft zeven categorieën met WFM direct onder Contact center", () => {
    expect(techstack.subvelden!.map((c) => c.label)).toEqual([
      "Contact center",
      "WFM",
      "Conversational AI",
      "CRM",
      "Kennismanagement",
      "LLM-oplossing",
      "IT en deployment",
    ]);
  });

  it("geeft vijf categorieën een keuzelijst voor de Oplossing, de rest een tekstveld", () => {
    const soort = (id: string) => categorie(id).subvelden!.find((v) => v.id === "leverancier")!;
    for (const id of ["techstack-contact-center", "techstack-wfm", "techstack-conversational-ai", "techstack-crm", "techstack-kennismanagement"]) {
      expect(soort(id).type).toBe("select");
      expect(soort(id).eigenOptie).toBe(true);
    }
    expect(soort("techstack-llm-oplossing").type).toBe("tekst");
    expect(soort("techstack-it-en-deployment").type).toBe("tekst");
  });

  it("toont 'Ondersteund door' alleen bij extern en kent geen dubbelen in een lijst", () => {
    for (const cat of techstack.subvelden!) {
      for (const veld of cat.subvelden!) {
        const opties = veld.opties ?? [];
        const sleutels = opties.map((o) => o.toLowerCase());
        expect(new Set(sleutels).size, `${cat.label} / ${veld.label}`).toBe(sleutels.length);
      }
      const ondersteuner = cat.subvelden!.find((v) => v.id === "ondersteuner");
      if (ondersteuner) expect(ondersteuner.toonAlsBroer).toEqual({ veld: "ondersteuning", waarde: "extern" });
    }
    expect(categorie("techstack-llm-oplossing").subvelden!.some((v) => v.id === "ondersteuner")).toBe(false);
    expect(categorie("techstack-it-en-deployment").subvelden!.some((v) => v.id === "ondersteuner")).toBe(false);
  });
});
